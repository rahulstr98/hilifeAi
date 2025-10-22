import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Select, TextareaAutosize, TextField, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/system";
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import Resizable from "react-resizable";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import * as XLSX from 'xlsx';
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from "../../components/AggridTable";
import AlertDialog from "../../components/Alert";
import {
    DeleteConfirmation,
    PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import { handleApiError } from "../../components/Errorhandling";
import ExportData from "../../components/ExportData";
import Headtitle from "../../components/Headtitle";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";

function Loan() {

    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);

    const [overallItems, setOverallItems] = useState([]);

    const today = new Date()
    const [isHandleChange, setIsHandleChange] = useState(false);
    const [searchedString, setSearchedString] = useState("")

    const [fileFormat, setFormat] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
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
            pagename: String("Loan"),
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
    const currentdate = new Date();
    const [loan, setLoan] = useState({
        loanamount: "",
        startyear: "Please Select Start Year",
        month: "Please Select Start Month",
        applieddate: moment(today).format("YYYY-MM-DD"),
        tenure: "",
        loan: "",
        description: "",
        access: "Self",
        employeename: "Please Select Employee Name"
    });
    const [loanApprovalMonth, setLoanApprovalMonth] = useState("")
    const [repaymentamount, setRepaymentAmount] = useState("")
    const [repaymentamountEdit, setRepaymentAmountEdit] = useState("")
    const [isBtn, setIsBtn] = useState(false)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [groupEdit, setGroupEdit] = useState({
        loanamount: "",
        startyear: currentYear,
        month: currentMonth,
        applieddate: "",
        tenure: "",
    });
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [allGroupEdit, setAllGroupEdit] = useState([]);
    const [groupCheck, setGroupCheck] = useState(false);
    const [groupData, setGroupData] = useState([]);
    const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);

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
                    data?.subsubpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
                ) {
                    fetfinalurl = data.subsubpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 &&
                    data?.mainpagenameurl?.length !== 0 &&
                    data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
                ) {
                    fetfinalurl = data.subpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 &&
                    data?.mainpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
                ) {
                    fetfinalurl = data.mainpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
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
    const { auth } = useContext(AuthContext);
    const username = isUserRoleAccess.username;
    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [copiedData, setCopiedData] = useState("");
    const [openviewalert, setOpenviewalert] = useState(false);
    // view model
    const handleClickOpenviewalert = () => {
        setOpenviewalert(true);
    };
    const handleCloseviewalert = () => {
        setOpenviewalert(false);
    };
    const gridRefTableImg = useRef(null);
    // image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Loan.png");
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
    //OVERALL EDIT FUNCTIONALITY
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
    // Styles for the resizable column
    const ResizableColumn = styled(Resizable)`
    .react-resizable-handle {
      width: 10px;
      height: 100%;
      position: absolute;
      right: 0;
      bottom: 0;
      cursor: col-resize;
    }
  `;
    const getRowClassName = (params) => {
        if (selectedRows.includes(params.row.id)) {
            return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
        }
        return ""; // Return an empty string for other rows
    };

    // fetch company
    const [companyOpt, setCompanyOpt] = useState([]);
    const [branchOption, setBranchOption] = useState([]);
    const [unitOption, setUnitOption] = useState([]);
    const [teamOption, setTeamOption] = useState([]);
    const [employeeOption, setEmployeeOption] = useState([]);

    const fetchCompany = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.get(SERVICE.COMPANY, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setCompanyOpt([
                ...res?.data?.companies?.map((t) => ({
                    ...t,
                    label: t.name,
                    value: t.name,
                })),
            ]);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //get all branches.
    const fetchBranchAll = async (e) => {
        const branchArr = e.map((t) => t.name)
        setPageName(!pageName)
        try {
            let res_location = await axios.get(SERVICE.BRANCH, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const BranchOpt = res_location?.data?.branch?.filter((t) => branchArr.includes(t.company))

            setBranchOption(
                BranchOpt?.map((t) => ({
                    ...t,
                    label: t.name,
                    value: t.name,
                })),
            );



        } catch (err) {
            // setIsLocation(true)
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //get all unit.
    const fetchUnitAll = async (e) => {
        let branchArr = e.map(data => data.name)
        setPageName(!pageName)
        try {
            let res_location = await axios.get(SERVICE.UNIT, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const UnitOpt = res_location?.data?.units?.filter((t) => branchArr.includes(t.branch))

            setUnitOption(
                UnitOpt?.map((t) => ({
                    ...t,
                    label: t.name,
                    value: t.name,
                })),
            );




        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    //get all Team.
    const fetchTeamAll = async (e) => {
        let unitArr = e.map(data => data.name)

        setPageName(!pageName)
        try {
            let res_location = await axios.get(SERVICE.TEAMS, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const TeamOpt = res_location?.data?.teamsdetails?.filter((t) => unitArr.includes(t.unit))

            setTeamOption(
                TeamOpt?.map((t) => ({
                    ...t,
                    label: t.teamname,
                    value: t.teamname,
                })),
            );



        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //function to fetch Employee
    const fetchEmployeeAll = async (teamOpt) => {
        let companyArr = valueCompanyCat
        let branchArr = valueBranchCat
        let unitArr = valueUnitCat
        let teamArr = teamOpt.map(data => data.teamname)

        setPageName(!pageName)
        try {
            let res_participants = await axios.get(SERVICE.USERALLLIMIT, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
            });

            const empOpt = res_participants?.data?.users?.filter((t) => companyArr?.includes(t.company) && branchArr?.includes(t.branch) && unitArr?.includes(t.unit) && teamArr?.includes(t.team))

            setEmployeeOption(
                empOpt?.map((t) => ({
                    ...t,
                    label: t.companyname,
                    value: t.companyname,
                })),
            );



        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => {
        fetchCompany();
    }, []);

    const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
        return valueCompanyCat?.length
            ? valueCompanyCat.map(({ label }) => label)?.join(", ")
            : "Please Select Company";
    };
    const customValueRendererBranch = (valueBranchCat, _categoryname) => {
        return valueBranchCat?.length
            ? valueBranchCat.map(({ label }) => label)?.join(", ")
            : "Please Select Branch";
    };
    const customValueRendererUnit = (valueUnitCat, _categoryname) => {
        return valueUnitCat?.length
            ? valueUnitCat.map(({ label }) => label)?.join(", ")
            : "Please Select Unit";
    };
    const customValueRendererTeam = (valueTeamCat, _categoryname) => {
        return valueTeamCat?.length
            ? valueTeamCat.map(({ label }) => label)?.join(", ")
            : "Please Select Team";
    };

    const [selectedOptionsCompany, setSelectedOptionsCompany] = useState([])
    let [valueCompanyCat, setValueCompanyCat] = useState([]);

    const [selectedOptionsBranch, setSelectedOptionsBranch] = useState([])
    let [valueBranchCat, setValueBranchCat] = useState([]);

    const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([])
    let [valueUnitCat, setValueUnitCat] = useState([]);

    const [selectedOptionsTeam, setSelectedOptionsTeam] = useState([])
    let [valueTeamCat, setValueTeamCat] = useState([]);


    const handleCompanyChange = (options) => {
        setValueCompanyCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsCompany(options);
        fetchBranchAll(options)
    };

    const handleBranchChange = (options) => {
        setValueBranchCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsBranch(options);
        fetchUnitAll(options)
    };

    const handleUnitChange = (options) => {
        setValueUnitCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsUnit(options);
        fetchTeamAll(options)
    };

    const handleTeamChange = (options) => {
        setValueTeamCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsTeam(options);
        fetchEmployeeAll(options)
    };

    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        loanamount: true,
        startyear: true,
        month: true,
        applieddate: true,
        tenure: true,
        document: true,
        company: true,
        branch: true,
        unit: true,
        team: true,
        empcode: true,
        companyname: true,
        employeename: true,
        shifttiming: true,
        status: true,
        description: true,
        document: true,
        createddatetime: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
    // page refersh reload code
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ""; // This is required for Chrome support
    };
    const [deleteGroup, setDeletegroup] = useState("");
    const rowData = async (id, loanamount) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.LOAN_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setDeletegroup(res?.data?.sloan);
            handleClickOpen();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    // Alert delete popup
    let groupEditt = deleteGroup._id;
    const deleGroup = async () => {
        setPageName(!pageName)
        try {
            await axios.delete(`${SERVICE.LOAN_SINGLE}/${groupEditt}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            await fetchAllGroup();
            handleCloseMod();
            handleCloseCheck();
            setPage(1);
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    const delGroupcheckbox = async () => {
        setPageName(!pageName)
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.LOAN_SINGLE}/${item}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
            });
            // Wait for all delete requests to complete
            await Promise.all(deletePromises);
            setIsHandleChange(false);
            handleCloseModcheckbox();
            setSelectedRows([]);
            setSelectAllChecked(false);
            setPage(1);
            await fetchAllGroup();
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    const [employeeDetails, setEmployeeDetails] = useState([])

    //add function

    const sendRequest = async () => {
        setIsBtn(true)
        setPageName(!pageName)
        try {
            let grpcreate = await axios.post(SERVICE.LOAN_CREATE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                loanamount: String(loan.loanamount),
                startyear: String(selectedYear),
                month: String(selectmonthname),
                applieddate: String(loan.applieddate),
                tenure: String(loan.tenure),
                description: String(loan.description),
                document: documentFiles,
                // company: String(isUserRoleAccess.company),
                // branch: String(isUserRoleAccess.branch),
                // unit: String(isUserRoleAccess.unit),
                // team: String(isUserRoleAccess.team),
                empcode: String(loan.access === "Self" ? isUserRoleAccess.empcode : employeeDetails.empcode),
                companyname: String(isUserRoleAccess.companyname),
                shifttiming: String(isUserRoleAccess.shifttiming),
                company: loan.access === "Self" ? isUserRoleAccess.company : employeeDetails.company,
                branch: loan.access === "Self" ? isUserRoleAccess.branch : employeeDetails.branch,
                unit: loan.access === "Self" ? isUserRoleAccess.unit : employeeDetails.unit,
                team: loan.access === "Self" ? isUserRoleAccess.team : employeeDetails.team,
                employeename: loan.access === "Self" ? String(isUserRoleAccess.companyname) : String(employeeDetails.companyname),
                status: String("Applied"),
                rejectedreason: String(""),
                addedby: [
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            setLoan(grpcreate.data);
            await fetchAllGroup();
            setLoan({
                loanamount: "",
                startyear: "Please Select Start Year",
                month: "Please Select Start Month",
                applieddate: moment(today).format("YYYY-MM-DD"),
                access: "Self",
                tenure: "",
                description: ""
            });
            setdocumentFiles([])
            setSelectMonth([])
            setSelectedOptionsTeam([]);
            setSelectedOptionsUnit([]);
            setSelectedOptionsBranch([]);
            setSelectedOptionsCompany([]);
            setEmployeeOption([]);
            setTeamOption([]);
            setUnitOption([]);
            setBranchOption([]);
            setSelectedYear("Please Select Start Year");
            setSelectMonthName("Please Select Start Month");
            setRepaymentAmount("")
            setPopupContent("Added Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            setIsBtn(false)
        } catch (err) {
            setIsBtn(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const [approvedLoan, setIsApprovedLoan] = useState()
    useEffect(() => {
        function addMonthsToDate(startDate, numMonths) {
            startDate = new Date(startDate);
            let year = startDate.getFullYear();
            let month = startDate.getMonth();
            let date = startDate.getDate();
            month += Number(numMonths);
            if (month > 12) {
                year += Math.floor(month / 12);
                month %= 12;
            }
            let resultDate = new Date(year, month, date);
            let currentDate = new Date();
            if (resultDate >= currentDate) {
                let monthDiff = (resultDate.getFullYear() - currentDate.getFullYear()) * 12 + resultDate.getMonth() - currentDate.getMonth();
                return { monthDiff: monthDiff };
            } else {
                return { monthDiff: null };
            }
        }
        const isApproved = addMonthsToDate(loan.access === "Self" ? isUserRoleAccess?.doj : employeeDetails.doj, loanApprovalMonth);
        setIsApprovedLoan(isApproved)
    }, [loanApprovalMonth, loan.employeename])
    const [isNoticeperiod, setIsNoticeperiod] = useState(0)
    //submit option for saving
    const handleSubmit = (e) => {
        e.preventDefault();
        // const isNameMatch = groups.some((item) => item.companyname === isUserRoleAccess.companyname);
        // const isLoanExistUser = overallSate.filter((item) => item.companyname?.toLowerCase() === isUserRoleAccess.companyname?.toLowerCase() &&
        //     item.empcode?.toLowerCase() === isUserRoleAccess.empcode?.toLowerCase()
        // );

        const isNameMatch = groups.some((item) => item.employeename?.toLowerCase() === (loan.access === "Self" ? isUserRoleAccess.companyname : employeeDetails?.companyname));

        // const isLoanExistUser = overallSate.filter((item) => item.employeename?.toLowerCase() === (loan.access === "Self" ? isUserRoleAccess.companyname?.toLowerCase() : employeeDetails?.companyname?.toLowerCase())
        //     // && item.empcode?.toLowerCase() === isUserRoleAccess.empcode?.toLowerCase()
        // );
        // const isLoanExistUser = groups.some((item) => {
        //     const requestMonthMatch = item.requestmonth?.toLowerCase() === selectmonthname?.toLowerCase();
        //     const companyNameMatch = loan.access === "Self"
        //         ? item.employeename?.toLowerCase() === isUserRoleAccess?.companyname?.toLowerCase()
        //         : item.employeename?.toLowerCase() === employeeDetails?.companyname?.toLowerCase();

        //     return requestMonthMatch && companyNameMatch;
        // });

        const isLoanExistUser = loan.access === "Others" ?
            overallSate.filter((item) => item.employeename?.toLowerCase() === employeeDetails?.companyname?.toLowerCase() &&
                item.empcode?.toLowerCase() === employeeDetails?.empcode?.toLowerCase())
            : overallSate.filter((item) => item.employeename?.toLowerCase() === isUserRoleAccess.companyname?.toLowerCase() &&
                item.empcode?.toLowerCase() === isUserRoleAccess.empcode?.toLowerCase()
            );


        console.log(approvedLoan.monthDiff)
        const isAPplied = isLoanExistUser.some((item) => item.status === "Applied")
        if (isNoticeperiod > 0) {
            setPopupContentMalert(`Eligible To Apply Loan After ${isNoticeperiod} Months`);
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }

        else if (loan.access === "Please Select Access") {
            setPopupContentMalert("Please Select Access");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (loan.loanamount === "") {
            setPopupContentMalert("Please Enter Loan Amount");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (selectedYear === "Please Select Start Year") {
            setPopupContentMalert("Please Select Start Year");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (selectmonthname === "Please Select Start Month") {
            setPopupContentMalert("Please Select Start Month");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (loan.applieddate === "") {
            setPopupContentMalert("Please Select Applied Date");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (loan.tenure === "") {
            setPopupContentMalert("Please Enter Tenure(Month)");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }

        else if (approvedLoan.monthDiff !== null) {
            setPopupContentMalert(`Eligible for Loan After ${approvedLoan.monthDiff === 0 ? "1" : approvedLoan.monthDiff} Month!`);
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (isAPplied) {
            setPopupContentMalert("Loan already exists!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (loan.access === "Others" && isUserRoleCompare.includes("lassignloan") && selectedOptionsCompany.length === 0) {

            setPopupContentMalert("Please Select Company");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (loan.access === "Others" && isUserRoleCompare.includes("lassignloan") && selectedOptionsBranch.length === 0) {

            setPopupContentMalert("Please Select Branch");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (loan.access === "Others" && isUserRoleCompare.includes("lassignloan") && selectedOptionsUnit.length === 0) {

            setPopupContentMalert("Please Select Unit");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();

        }
        else if (loan.access === "Others" && isUserRoleCompare.includes("lassignloan") && selectedOptionsTeam.length === 0) {

            setPopupContentMalert("Please Select Team");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (loan.access === "Others" && loan.employeename === "Please Select Employee Name") {

            setPopupContentMalert("Please Select Employee Name");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            setSearchQuery("")
            sendRequest();
        }
    };
    const handleClear = () => {
        setLoan({
            loanamount: "",
            startyear: "Please Select Start Year",
            month: "Please Select Start Month",
            applieddate: moment(today).format("YYYY-MM-DD"),
            tenure: "",
            access: "Self",
            description: ""
        });
        setdocumentFiles([])
        setSelectMonth([])
        setEmployeeDetails([])
        setSelectedOptionsTeam([]);
        setSelectedOptionsUnit([]);
        setSelectedOptionsBranch([]);
        setSelectedOptionsCompany([]);
        setEmployeeOption([]);
        setTeamOption([]);
        setUnitOption([]);
        setBranchOption([]);
        setSelectedYear("Please Select Start Year");
        setSelectMonthName("Please Select Start Month");
        setSelectedMonth("");
        setSelectedDate("");
        updateDateValue(today.getFullYear(), today.getMonth() + 1);
        setRepaymentAmount("")
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
        setSearchQuery("")
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
    //check delete model
    const [isCheckOpen, setisCheckOpen] = useState(false);
    const handleClickOpenCheck = () => {
        setisCheckOpen(true);
    };
    const handleCloseCheck = () => {
        setisCheckOpen(false);
    };
    // info model
    const [openInfo, setOpeninfo] = useState(false);
    const handleClickOpeninfo = () => {
        setOpeninfo(true);
    };
    const handleCloseinfo = () => {
        setOpeninfo(false);
    };

    const [emitodo, setEmiTodo] = useState([])
    const [documentFilesView, setdocumentFilesView] = useState([]);
    // get single row to view....
    const getviewCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.LOAN_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setGroupEdit(res?.data?.sloan);
            setEmiTodo(res?.data?.sloan?.emitodo)
            setdocumentFilesView(res?.data?.sloan?.document)
            handleClickOpenview();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    // get single row to view....
    const getinfoCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.LOAN_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            handleClickOpeninfo();
            setGroupEdit(res?.data?.sloan);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    //Project updateby edit page...
    let updateby = groupEdit.updatedby;
    let addedby = groupEdit.addedby;
    let projectsid = groupEdit._id;
    //editing the single data...
    const sendEditRequest = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.put(`${SERVICE.LOAN_SINGLE}/${projectsid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                loanamount: String(groupEdit.loanamount),
                startyear: String(groupEdit.startyear),
                month: String(groupEdit.month),
                applieddate: String(groupEdit.applieddate),
                tenure: String(groupEdit.tenure),
                // interest: String(loan.interest),
                // percentage: String(loan.percentage),
                // repaymentamount: String(repaymentamount),
                company: String(isUserRoleAccess.company),
                branch: String(isUserRoleAccess.branch),
                unit: String(isUserRoleAccess.unit),
                team: String(isUserRoleAccess.team),
                empcode: String(isUserRoleAccess.empcode),
                companyname: String(isUserRoleAccess.companyname),
                shifttiming: String(isUserRoleAccess.shifttiming),
                updatedby: [
                    ...updateby,
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            setGroupEdit(res.data);
            await fetchAllGroup();
            await fetchGroupAll();
            handleCloseModEdit();
            setPopupContent("Updated Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    const editSubmit = (e) => {
        e.preventDefault();
        fetchGroupAll();
        const isNameMatch = allGroupEdit.some((item) => item.companyname === isUserRoleAccess.companyname);
        if (groupEdit.loanamount === "") {
            setPopupContentMalert("Please Enter Loan Amount");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (groupEdit.startyear === "Please Select Start Year") {
            setPopupContentMalert("Please Select Start Year");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (groupEdit.month === "Please Select Start Month") {
            setPopupContentMalert("Please Enter Start Month");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (groupEdit.applieddate === "") {
            setPopupContentMalert("Please Enter Applied Date");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (groupEdit.tenure === "") {
            setPopupContentMalert("Please Enter Tenure(Month)");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {
            setPopupContentMalert("Loan already exists!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            sendEditRequest();
        }
    };
    const [overAllsettingsCount, setOverAllsettingsCount] = useState("")
    const fetchOverAllSettings = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.GET_OVERALL_SETTINGS}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            // setLoading(true);
            if (res?.data?.count === 0) {
                setOverAllsettingsCount(res?.data?.count);
            } else {
                setLoanApprovalMonth(
                    res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
                        ?.loanapprovalmonth
                );
            }
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    const [overallSate, setOverAllLoan] = useState([])
    //get all project.
    const fetchAllGroup = async () => {
        setPageName(!pageName)
        try {
            let res_grp = await axios.post(SERVICE.LOANBYASSIGNBRANCH, {
                assignbranch: accessbranch
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            setOverAllLoan(res_grp?.data?.loan)
            let overallnewloan = res_grp?.data?.loan?.filter((item) => item.status !== "Approved")
            setGroups(overallnewloan?.map((t, index) => ({
                ...t,
                applieddates: moment(t.applieddate).format("DD-MM-YYYY"),
                createddatetime: moment(t.addedby[0].date).format("DD-MM-YYYY hh:mm:ss a"),
            })));
            setGroupCheck(true);
        } catch (err) { setGroupCheck(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    const [loanArray, setLoanArray] = useState([])
    const fetchAllLoanArray = async () => {
        setPageName(!pageName)
        try {
            let res_grp = await axios.post(SERVICE.LOANBYASSIGNBRANCH, {
                assignbranch: accessbranch
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let newarray = res_grp?.data?.loan?.filter((item) => item.status !== "Approved")
            setLoanArray(newarray?.map((t, index) => ({
                ...t,
                applieddates: moment(t.applieddate).format("DD-MM-YYYY"),
                createddatetime: moment(t.addedby[0].date).format("DD-MM-YYYY hh:mm:ss a"),
            })));
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    useEffect(() => {
        fetchAllLoanArray()
    }, [isFilterOpen])
    //get all project.
    const fetchGroupAll = async () => {
        setPageName(!pageName)
        try {
            let res_grp = await axios.post(SERVICE.LOANBYASSIGNBRANCH, {
                assignbranch: accessbranch
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAllGroupEdit(res_grp?.data?.loan.filter((item) => item._id !== groupEdit._id));
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    let snos = 1;
    // pdf.....
    const columns = [
        { title: "Loan Amount", field: "loanamount" },
        { title: "Start Year", field: "startyear" },
        { title: "Month", field: "month" },
        { title: "Applied Date", field: "applieddate" },
        { title: "Tenure", field: "tenure" },
        { title: "Company", field: "company" },
        { title: "Branch", field: "branch" },
        { title: "Unit", field: "unit" },
        { title: "Team", field: "team" },
        { title: "Emp Code", field: "empcode" },
        { title: "Employee", field: "companyname" },
        { title: "Shift Time", field: "shifttiming" },
        { title: "Description", field: "description" },
    ];
    const downloadPdf = (isfilter) => {
        const doc = new jsPDF();
        // Initialize serial number counter
        let serialNumberCounter = 1;
        // Modify columns to include serial number column
        const columnsWithSerial = [
            { title: "SNo", dataKey: "serialNumber" }, // Serial number column
            ...columns.map((col) => ({ ...col, dataKey: col.field })),
        ];
        // Modify row data to include serial number
        const dataWithSerial = isfilter === "filtered" ?
            rowDataTable.map(row => ({ ...row, serialNumber: serialNumberCounter++ })) :
            loanArray.map(row => ({
                ...row,
                serialNumber: serialNumberCounter++,
                applieddate: moment(row.applieddate).format("DD-MM-YYYY")
            }));
        // Generate PDF
        doc.autoTable({
            theme: "grid",
            styles: {
                fontSize: 4,
                cellWidth: "auto"
            },
            columns: columnsWithSerial,
            body: dataWithSerial,
        });
        doc.save("Loan.pdf");
    };
    // Excel
    const fileName = "Loan";
    let excelno = 1;
    // get particular columns for export excel
    const getexcelDatas = async () => {
        var data = groups.map((t, i) => ({
            Sno: i + 1,
            "Loan Name": t.loanamount,
        }));
        setGroupData(data);
    };
    const fetchAllLoanClosed = async () => {
        setPageName(!pageName)
        try {
            let res_grp = await axios.post(SERVICE.LOANBYASSIGNBRANCH, {
                assignbranch: accessbranch
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            // setAllLoan(res_grp?.data?.loan?.filter((item) => item.status === "Approved" || item.status === "Applied"));
            const data = res_grp?.data?.loan?.filter((item) => item.status === "Approved" || item.status === "Applied");

            const checknoticeperiodEli = loan.access === "Others" ?
                data.filter((item) => {
                    return item.employeename?.toLowerCase() == employeeDetails?.companyname?.toLowerCase() && item.empcode?.toLowerCase() == employeeDetails?.empcode?.toLowerCase()
                }) :
                data.filter((item) => {
                    return item.employeename?.toLowerCase() == isUserRoleAccess?.companyname?.toLowerCase() && item.empcode?.toLowerCase() == isUserRoleAccess?.empcode?.toLowerCase()
                })

            const checkElegable = checknoticeperiodEli[checknoticeperiodEli.length - 1]?.emitodo?.length === 0 ? checknoticeperiodEli[checknoticeperiodEli.length - 1]?.emitodo?.length :
                checknoticeperiodEli[checknoticeperiodEli.length - 1]?.emitodo[checknoticeperiodEli[checknoticeperiodEli.length - 1]?.emitodo?.length - 1]

            const month = checkElegable?.months;
            const year = checkElegable?.year;
            if (month == undefined || year === undefined) {
                setIsNoticeperiod(0);
            } else {
                const months = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                const monthIndex = months.findIndex(m => m?.toLowerCase() === month?.toLowerCase());
                const currentDate = new Date(year, monthIndex, 1);
                currentDate?.setMonth(currentDate?.getMonth() + 6);
                const newMonth = months[currentDate?.getMonth()];
                const newYear = currentDate?.getFullYear();
                const monthIndexs = months?.findIndex(m => m?.toLowerCase() === newMonth?.toLowerCase());
                var currentDates = new Date();
                var currentMonth = currentDates?.getMonth() + 1;
                var currentYear = currentDates?.getFullYear();
                var yearDifference = newYear - currentYear;
                var monthDifference = (monthIndexs + 1) - currentMonth;
                var totalMonthDifference = (yearDifference * 12) + monthDifference;
                setIsNoticeperiod(totalMonthDifference);
            }
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Loan",
        pageStyle: "print",
    });
    useEffect(() => {
        getexcelDatas();
    }, [groupEdit, loan, groups]);
    useEffect(() => {
        fetchAllGroup();
        fetchGroupAll();
        fetchOverAllSettings();
    }, [isNoticeperiod]);
    useEffect(() => {
        fetchAllLoanClosed()
    }, [])
    useEffect(() => {
        fetchAllLoanClosed()
    }, [employeeDetails, loan.access])
    useEffect(() => {
        fetchGroupAll();
    }, [isEditOpen, groupEdit]);
    useEffect(() => {
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, []);
    const [items, setItems] = useState([]);
    const addSerialNumber = (datas) => {
        const itemsWithSerialNumber = datas?.map((item, index) => ({ ...item, serialNumber: index + 1 }));
        setOverallItems(itemsWithSerialNumber);
        setItems(itemsWithSerialNumber);
    };
    useEffect(() => {
        addSerialNumber(groups);
    }, [groups]);
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
        return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
    });
    const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredDatas.length / pageSize);
    const visiblePages = Math.min(totalPages, 3);
    const firstVisiblePage = Math.max(1, page - 1);
    const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);
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
    const getDownloadFile = async (data) => {
        data.forEach(async (d) => {
            const fileExtension = getFileExtension(d.name);
            if (fileExtension === "xlsx" || fileExtension === "xls" || fileExtension === "csv") {
                readExcel(d.data)
                    .then((excelData) => {
                        const newTab = window.open();
                        newTab.document.open();
                        newTab.document.write('<html><head><title>Excel File</title></head><body></body></html>');
                        newTab.document.close();
                        const htmlTable = generateHtmlTable(excelData);
                        newTab.document.body.innerHTML = htmlTable;
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            } else if (fileExtension === "pdf") {
                const newTab = window.open();
                newTab.document.write('<iframe width="100%" height="100%" src="' + d.preview + '"></iframe>');
            } else if (fileExtension === "png" || fileExtension === 'jpg') {
                const response = await fetch(d.preview);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const newTab = window.open(url, '_blank');
            }
        });
        function getFileExtension(filename) {
            return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
        }
        function readExcel(base64Data) {
            return new Promise((resolve, reject) => {
                const bufferArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0)).buffer;
                const wb = XLSX.read(bufferArray, { type: "buffer" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                resolve(data);
            });
        }
        function generateHtmlTable(data) {
            const headers = Object.keys(data[0]);
            const tableHeader = `<tr>${headers.map((header) => `<th style="padding: 4px; background-color: #f2f2f2;">${header}</th>`).join("")}</tr>`;
            const tableRows = data.map((row, index) => {
                const rowStyle = index % 2 === 0 ? "background-color: #f9f9f9;" : "";
                const cells = headers.map((header) => `<td style="padding: 4px;${rowStyle}">${row[header]}</td>`).join("");
                return `<tr>${cells}</tr>`;
            });
            return `<table style="border-collapse: collapse; width: 100%;" border="1"; overflow :"scroll">${tableHeader}${tableRows.join("")}</table>`;
        }
    };
    const columnDataTable = [
        {
            field: "checkbox",
            headerName: "Checkbox", // Default header loanamount
            headerStyle: {
                fontWeight: "bold", // Apply the font-weight style to make the header text bold
                // Add any other CSS styles as needed
            },
            headerCheckboxSelection: true,
            checkboxSelection: true,
            pinned: 'left',
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
            pinned: 'left',
        },
        { field: "loanamount", headerName: "Loan Amount", flex: 0, width: 150, hide: !columnVisibility.loanamount, headerClassName: "bold-header", pinned: 'left', },
        { field: "startyear", headerName: "Start Year", flex: 0, width: 150, hide: !columnVisibility.startyear, headerClassName: "bold-header", pinned: 'left', },
        { field: "month", headerName: "Month", flex: 0, width: 150, hide: !columnVisibility.month, headerClassName: "bold-header" },
        { field: "applieddate", headerName: "Applied Date", flex: 0, width: 150, hide: !columnVisibility.applieddate, headerClassName: "bold-header" },
        { field: "tenure", headerName: "Tenure", flex: 0, width: 150, hide: !columnVisibility.tenure, headerClassName: "bold-header" },
        { field: "company", headerName: "Company", flex: 0, width: 100, hide: !columnVisibility.company, headerClassName: "bold-header" },
        { field: "branch", headerName: "Branch", flex: 0, width: 130, hide: !columnVisibility.branch, headerClassName: "bold-header" },
        { field: "unit", headerName: "Unit", flex: 0, width: 100, hide: !columnVisibility.unit, headerClassName: "bold-header" },
        { field: "team", headerName: "Team", flex: 0, width: 100, hide: !columnVisibility.team, headerClassName: "bold-header" },
        { field: "empcode", headerName: "Emp Code", flex: 0, width: 130, hide: !columnVisibility.empcode, headerClassName: "bold-header" },
        { field: "employeename", headerName: "Employee", flex: 0, width: 130, hide: !columnVisibility.employeename, headerClassName: "bold-header" },
        { field: "shifttiming", headerName: "Shift Time", flex: 0, width: 100, hide: !columnVisibility.shifttiming, headerClassName: "bold-header" },
        { field: "description", headerName: "Description", flex: 0, width: 100, hide: !columnVisibility.description, headerClassName: "bold-header" },
        { field: "createddatetime", headerName: "Created Date/Time", flex: 0, width: 230, hide: !columnVisibility.createddatetime, headerClassName: "bold-header" },
        { field: "companyname", headerName: "Added By", flex: 0, width: 130, hide: !columnVisibility.companyname, headerClassName: "bold-header" },
        {
            field: "document",
            headerName: "Document",
            sortable: false,
            flex: 0,
            width: 180,
            minHeight: "40px",
            hide: !columnVisibility.document,
            cellRenderer: (params) => (
                <Grid>
                    <Button
                        variant="text"
                        onClick={() => {
                            getDownloadFile(params.data.document);
                        }}
                        sx={userStyle.buttonview}
                    >
                        {params.data.document.length > 0 ? "View" : " "}
                    </Button>
                </Grid>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            flex: 0,
            width: 90,
            hide: !columnVisibility.status,
            headerClassName: "bold-header",
            cellRenderer: (params) => {
                if (!(isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin")) && !["Approved", "Rejected"].includes(params.data.status)) {
                    return (
                        <Grid>
                            <Button
                                variant="contained"
                                style={{
                                    backgroundColor: params.value === "Applied" ? "#FFC300" : params.value === "Rejected" ? "red" : params.value === "Approved" ? "green" : "inherit",
                                    color: params.value === "Applied" ? "black" : params.value === "Rejected" ? "white" : "white",
                                    fontSize: "10px",
                                    width: "60px",
                                    fontWeight: "bold",
                                }}
                            >
                                {params.value}
                            </Button>
                        </Grid>
                    );
                } else {
                    return (
                        <Grid>
                            <Button
                                variant="contained"
                                style={{
                                    backgroundColor: params.value === "Applied" ? "#FFC300" : params.value === "Rejected" ? "red" : params.value === "Approved" ? "green" : "inherit",
                                    color: params.value === "Applied" ? "black" : params.value === "Rejected" ? "white" : "white",
                                    fontSize: "10px",
                                    width: "60px",
                                    fontWeight: "bold",
                                }}
                            >
                                {params.value}
                            </Button>
                        </Grid>
                    );
                }
            },
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
                    {isUserRoleCompare?.includes("dloan") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                rowData(params.data.id, params.data.loanamount);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttondelete} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("vloan") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getviewCode(params.data.id);
                            }}
                        >
                            <VisibilityOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonview} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("iloan") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getinfoCode(params.data.id);
                            }}
                        >
                            <InfoOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttoninfo} />
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
            loanamount: item.loanamount,
            startyear: item.startyear,
            month: item.month,
            applieddate: item.applieddates,
            applieddates: item.applieddates,
            tenure: item.tenure,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            team: item.team,
            empcode: item.empcode,
            employeename: item.employeename,
            companyname: item.companyname,
            shifttiming: item.shifttiming,
            status: item.status,
            document: item.document,
            description: item.description,
            createddatetime: item.createddatetime,

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
                            <ListItemText
                                sx={{ display: "flex" }}
                                primary={<Switch sx={{ marginTop: "-5px" }} size="small" checked={columnVisibility[column.field]} onChange={() => toggleColumnVisibility(column.field)} />}
                                secondary={column.field === "checkbox" ? "Checkbox" : column.headerName}
                            />
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
    const [selectedYear, setSelectedYear] = useState("Please Select Start Year");
    const [selectedYearEdit, setSelectedYearEdit] = useState("Please Select Start Year");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedMonthEdit, setSelectedMonthEdit] = useState("");
    const [selectmonthname, setSelectMonthName] = useState("Please Select Start Month");
    const [selectmonthnameEdit, setSelectMonthNameEdit] = useState("Please Select Start Month");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedDateEdit, setSelectedDateEdit] = useState("");
    const interestOpt = [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]
    function calculateMonthlyPayment() {
        const monthlyInterestRate = loan.percentage / 100 / 12;
        let monthlyPayment = loan.loanamount * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -loan.tenure)));
        // const monthlyPayment = (loan.loanamount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loan.tenure));
        setRepaymentAmount(Math.round(monthlyPayment))
    }
    function calculateMonthlyPaymentEdit() {
        const monthlyInterestRate = groupEdit.percentage / 100 / 12;
        let monthlyPayment = groupEdit.loanamount * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -groupEdit.tenure)));
        // const monthlyPayment = (loan.loanamount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loan.tenure));
        setRepaymentAmountEdit(Math.round(monthlyPayment))
    }
    // Get the current year
    let startyearOpt = [];
    for (let i = 0; i <= 1; i++) {
        const year = (currentYear - 1) + i;
        startyearOpt.push({ label: year.toString(), value: year });
    }
    const monthOpt = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ]
    const [selectedMont, setSelectMonth] = useState([
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ])
    const handleYearChange = (event) => {
        setSelectedYear(event.value);
        updateDateValue(event.value, selectedMonth);
        setSelectMonthName("Please Select Start Month")
        setSelectedDate("")
        const year = event.value;
        let updatedMonthOpt;
        if (year === currentYear) {
            // updatedMonthOpt = monthOpt.slice(new Date().getMonth() - 1);
            const currentMonthIndex = new Date().getMonth();
            // Ensure the slice includes one previous month
            updatedMonthOpt = monthOpt.slice(Math.max(0, currentMonthIndex - 1), Math.max(0, currentMonthIndex - 1) + 2);
        } else {
            updatedMonthOpt = monthOpt;
        }
        setSelectMonth(updatedMonthOpt)
    };
    const handleMonthChange = (event) => {
        setSelectedMonth(event.value);
        updateDateValue(selectedYear, event.value);
        setSelectMonthName(event.label);
        setSelectedDate("");
    };

    // const updateDateValue = (year, month) => {
    //     const currentDate = new Date();
    //     const monthShow = currentDate.getMonth();
    //     currentDate.setFullYear(year);
    //     currentDate.setMonth(month === "" ? monthShow : month - 1);
    //     currentDate.setDate(1);
    //     const selectedDate = currentDate?.toISOString()?.split("T")[0];
    //     // Set selected month, previous month, and next month
    //     const previousMonth = new Date(currentDate);
    //     previousMonth.setMonth(currentDate.getMonth());
    //     const nextMonth = new Date(currentDate);
    //     console.log(nextMonth)
    //     nextMonth.setMonth(currentDate.getMonth() + 1);
    //     const minimumDate = previousMonth.toISOString().split("T")[0];
    //     const maxSet = nextMonth.toISOString().split("T")[0];
    //     const dateToDate = document.getElementById("datefrom");
    //     if (dateToDate) {
    //         dateToDate.min = minimumDate;
    //         dateToDate.max = maxSet;
    //     }
    // };
    const updateDateValue = (year, month) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-indexed month, so add 1
        const currentDay = currentDate.getDate();

        const selectedDate = new Date(year, month === "" ? currentMonth - 1 : month - 1, 1); // month is 0-indexed

        const dateToDate = document.getElementById("datefrom");

        if (dateToDate) {
            if (year === currentYear && month == currentMonth) {
                // If selected year and month are the current year and month
                dateToDate.min = `${year}-${String(month).padStart(2, '0')}-01`;
                dateToDate.max = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
            } else {
                // If selected year and month are not the current year and month
                const selectedMonthStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
                const nextMonth = new Date(year, month - 1 + 1, 0); // Setting date to 0 gets the last day of the previous month (end of the selected month)
                const selectedMonthEndDate = nextMonth.toISOString().split("T")[0];

                dateToDate.min = selectedMonthStartDate;
                dateToDate.max = selectedMonthEndDate;
            }
        }
    };


    const [documentFiles, setdocumentFiles] = useState([]);
    const handleFileDelete = (index) => {
        setdocumentFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };
    const handleResumeUpload = (event) => {
        const resume = event.target.files;
        for (let i = 0; i < resume?.length; i++) {
            const reader = new FileReader();
            const file = resume[i];
            reader.readAsDataURL(file);
            reader.onload = () => {
                setdocumentFiles((prevFiles) => [...prevFiles, { name: file.name, preview: reader.result, data: reader.result.split(",")[1], remark: "resume file" }]);
            };
        }
    };
    const renderFilePreview = async (file) => {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        window.open(link, "_blank");
    };
    let exportColumnNames = ["Loan Amount", "Start Year", "Month", "Applied Date", "Tenure", "Company", "Branch", "Unit", "Team", "Emp Code", "Employee", "Shift Time", "Description", "Created Date/Time", "Added By"];
    let exportRowValues = ["loanamount", "startyear", "month", "applieddates", "tenure", "company", "branch", "unit", "team", "empcode", "employeename", "shifttiming", "description", "createddatetime", "companyname"];
    const accessOption = [
        ...(isUserRoleAccess?.role?.includes('Manager') ? [{ label: "Others", value: "Others" }] : []),
        { label: "Self", value: "Self" },

    ]


    return (
        <Box>
            <Headtitle title={"Loan"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="Loan"
                modulename="PayRoll"
                submodulename="Loan & Advance"
                mainpagename="Loan"
                subpagename=""
                subsubpagename=""
            />
            {isUserRoleCompare?.includes("aloan") && (
                <>
                    <Box sx={userStyle.dialogbox}>
                        <>
                            <Grid container spacing={2} sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Grid item xs={8}>
                                    <Typography sx={userStyle.importheadtext}>Add Loan</Typography>
                                </Grid>
                                {(isUserRoleCompare.includes("lassignloan") || isUserRoleAccess?.role?.includes("Manager")) && (
                                    <>
                                        <Grid item md={3} sm={12} xs={12}>
                                            <FormControl size="small" fullWidth>
                                                <Typography>Access<b style={{ color: "red" }}>*</b></Typography>
                                                <Selects
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    value={{ label: loan.access, value: loan.access }}
                                                    options={accessOption}
                                                    isDisabled={!isUserRoleAccess?.role?.includes('Manager')}
                                                    onChange={(e) => {
                                                        setLoan({
                                                            ...loan,
                                                            access: e.value,
                                                            employeename: "Please Select Employee Name"
                                                        });
                                                        setSelectedOptionsTeam([]);
                                                        setSelectedOptionsUnit([]);
                                                        setSelectedOptionsBranch([]);
                                                        setSelectedOptionsCompany([]);
                                                        setEmployeeOption([]);
                                                        setTeamOption([]);
                                                        setUnitOption([]);
                                                        setBranchOption([]);
                                                    }}
                                                />

                                            </FormControl>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            <br />
                            <Grid container spacing={2}>
                                <Grid item md={3} xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Loan Amount <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            placeholder="Please Enter Loan Amount"
                                            value={loan.loanamount}
                                            onChange={(e) => {
                                                const enteredValue = e.target.value
                                                    .replace(/\D/g, "")
                                                //   .slice(0, 2);
                                                if (enteredValue === "" || /^\d+$/.test(enteredValue)) {
                                                    setLoan({
                                                        ...loan,
                                                        loanamount: enteredValue,
                                                    });
                                                }
                                                setRepaymentAmount("")
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Start Year<b style={{ color: "red" }}>*</b></Typography>
                                        <Selects
                                            styles={colourStyles}
                                            options={startyearOpt}
                                            value={{ label: selectedYear, value: selectedYear }}
                                            onChange={(e) => {
                                                handleYearChange(e)
                                                setLoan({ ...loan, applieddate: "" });

                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Start Month<b style={{ color: "red" }}>*</b></Typography>
                                        <Selects
                                            styles={colourStyles}
                                            options={selectedYear !== "Please Select Start Year" ? selectedMont : []}
                                            value={{ label: selectmonthname, value: selectmonthname }}
                                            onChange={(e) => {
                                                handleMonthChange(e)
                                                setLoan({ ...loan, applieddate: "" });

                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Applied Date <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <OutlinedInput
                                            value={loan.applieddate}
                                            type="date"
                                            onChange={(e) => {
                                                setLoan({ ...loan, applieddate: e.target.value });
                                            }}
                                            // onChange={handleFromDateChange} id="datefrom"
                                            // inputProps={{ max: today }}
                                            id="datefrom"

                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Tenure(Month) <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            placeholder="Please Enter Tenure in Month"
                                            value={loan.tenure}
                                            onChange={(e) => {
                                                let enteredValue = e.target.value.replace(/\D/g, "").slice(0, 2);
                                                if ((enteredValue === "" || enteredValue !== "0" && parseInt(enteredValue) <= 60)) {
                                                    setLoan({
                                                        ...loan,
                                                        tenure: enteredValue,
                                                    });
                                                    calculateMonthlyPayment();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Description</Typography>
                                        <TextareaAutosize
                                            aria-label="minimum height"
                                            minRows={5}
                                            value={loan.description}
                                            onChange={(e) => {
                                                setLoan({ ...loan, description: e.target.value });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={6} sm={12} xs={12}>
                                    <Typography >Upload Document</Typography>
                                    <Grid >
                                        <Button variant="contained" size="small" component="label" sx={{ ...buttonStyles.buttonsubmit,"@media only screen and (max-width:550px)": { marginY: "5px" } }}>
                                            Upload
                                            <input
                                                type="file"
                                                id="resume"
                                                accept=".xlsx, .xls, .csv, .pdf, .doc, .txt,"
                                                name="file"
                                                hidden
                                                onChange={(e) => {
                                                    handleResumeUpload(e);
                                                }}
                                            />
                                        </Button>
                                        <br />
                                        <br />
                                        {documentFiles?.length > 0 &&
                                            documentFiles.map((file, index) => (
                                                <>
                                                    <Grid container spacing={2}>
                                                        <Grid item md={6} sm={6} xs={6}>
                                                            <Typography>{file.name}</Typography>
                                                        </Grid>
                                                        <Grid></Grid>
                                                        <Grid item md={1} sm={6} xs={6}>
                                                            <VisibilityOutlinedIcon style={{ fontsize: "large", color: "#357AE8", cursor: "pointer" }} onClick={() => renderFilePreview(file)} />
                                                        </Grid>
                                                        <Grid item md={1} sm={6} xs={6}>
                                                            <Button style={{ fontsize: "large", color: "#357AE8", cursor: "pointer", marginTop: "-5px" }} onClick={() => handleFileDelete(index)}>
                                                                <DeleteIcon />
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </>
                                            ))}
                                    </Grid>
                                </Grid>
                                {(loan.access === "Others") && (
                                    <  >

                                        <Grid item md={3} xs={12} sm={6} >
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Company <b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    sx={{ position: "absolute" }}
                                                    options={companyOpt}
                                                    value={selectedOptionsCompany}
                                                    onChange={(e) => {
                                                        handleCompanyChange(e);
                                                        setSelectedOptionsBranch([])
                                                        setBranchOption([])
                                                        setSelectedOptionsUnit([])
                                                        setSelectedOptionsTeam([])
                                                        setUnitOption([])
                                                        setTeamOption([])
                                                        setLoan({
                                                            ...loan,
                                                            employeename: "Please Select Employee Name"
                                                        })
                                                        setEmployeeOption([])
                                                        setEmployeeDetails([])

                                                    }}
                                                    valueRenderer={customValueRendererCompany}
                                                    labelledBy="Please Select Company"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Branch <b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={branchOption}
                                                    value={selectedOptionsBranch}
                                                    onChange={(e) => {
                                                        handleBranchChange(e);
                                                        setSelectedOptionsTeam([])
                                                        setSelectedOptionsUnit([])
                                                        setUnitOption([])
                                                        setTeamOption([])
                                                        setLoan({
                                                            ...loan,
                                                            employeename: "Please Select Employee Name"
                                                        })
                                                        setEmployeeOption([])
                                                        setEmployeeDetails([])

                                                    }}
                                                    valueRenderer={customValueRendererBranch}
                                                    labelledBy="Please Select Branch"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Unit <b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={unitOption}
                                                    value={selectedOptionsUnit}
                                                    onChange={(e) => {
                                                        handleUnitChange(e);
                                                        setTeamOption([])
                                                        setSelectedOptionsTeam([])
                                                        setLoan({
                                                            ...loan,
                                                            employeename: "Please Select Employee Name"
                                                        })
                                                        setEmployeeOption([])
                                                        setEmployeeDetails([])

                                                    }}
                                                    valueRenderer={customValueRendererUnit}
                                                    labelledBy="Please Select Unit"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Team <b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={teamOption}
                                                    value={selectedOptionsTeam}
                                                    onChange={(e) => {
                                                        handleTeamChange(e);
                                                        setLoan({
                                                            ...loan,
                                                            employeename: "Please Select Employee Name"
                                                        })
                                                        setEmployeeOption([])
                                                        setEmployeeDetails([])

                                                    }}
                                                    valueRenderer={customValueRendererTeam}
                                                    labelledBy="Please Select Team"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Employee <b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <Selects
                                                    maxMenuHeight={300}
                                                    options={employeeOption}
                                                    value={{ label: loan.employeename, value: loan.employeename }}
                                                    onChange={((e) => {
                                                        setEmployeeDetails(e)
                                                        setLoan({
                                                            ...loan,
                                                            employeename: e.value
                                                        })
                                                    })}
                                                />
                                            </FormControl>
                                        </Grid>
                                    </>
                                )}

                            </Grid>
                            <br /> <br />
                            <Grid item md={12} sm={12} xs={12}>
                                <Grid
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "15px",
                                    }}
                                >
                                    <Button variant="contained"
                                        onClick={handleSubmit}
                                        disabled={isBtn}
                                        sx={buttonStyles.buttonsubmit}
                                    >
                                        SAVE
                                    </Button>
                                    <Button sx={buttonStyles.btncancel}
                                        onClick={handleClear}
                                    >
                                        CLEAR
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
                                        <Typography sx={userStyle.HeaderText}>Edit Loan</Typography>
                                    </Grid>
                                </Grid>
                                <br />
                                <Grid container spacing={2}>
                                    <Grid item md={4} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Loan Amount <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                placeholder="Please Enter Loan Amount"
                                                value={groupEdit.loanamount}
                                                onChange={(e) => {
                                                    const enteredValue = e.target.value
                                                        .replace(/\D/g, "")
                                                    //   .slice(0, 2);
                                                    if (enteredValue === "" || /^\d+$/.test(enteredValue)) {
                                                        setGroupEdit({
                                                            ...groupEdit,
                                                            loanamount: enteredValue,
                                                        });
                                                    }
                                                    setRepaymentAmountEdit("")
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={4} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Start Year<b style={{ color: "red" }}>*</b></Typography>
                                            <Selects
                                                styles={colourStyles}
                                                options={startyearOpt}
                                                value={{ label: groupEdit.startyear, value: groupEdit.startyear }}
                                                onChange={(e) => {
                                                    setGroupEdit({
                                                        ...groupEdit,
                                                        startyear: e.value,
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={4} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Month<b style={{ color: "red" }}>*</b></Typography>
                                            <Selects
                                                styles={colourStyles}
                                                options={monthOpt}
                                                value={{ label: groupEdit.month, value: groupEdit.month }}
                                                onChange={(e) => {
                                                    setGroupEdit({
                                                        ...groupEdit,
                                                        month: e.value,
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={4} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Applied Date <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="date"
                                                value={groupEdit.applieddate}
                                                onChange={(e) => {
                                                    setGroupEdit({
                                                        ...groupEdit,
                                                        applieddate: e.target.value
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={4} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Tenure(Month) <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                placeholder="Please Enter Tenure in Month"
                                                value={groupEdit.tenure}
                                                onChange={(e) => {
                                                    let enteredValue = e.target.value.replace(/\D/g, "").slice(0, 2);
                                                    // Check if enteredValue is empty or a number less than or equal to 60
                                                    if (enteredValue === "" || (enteredValue !== "0" && /^\d+$/.test(enteredValue) && parseInt(enteredValue) <= 60)) {
                                                        setGroupEdit({
                                                            ...groupEdit,
                                                            tenure: enteredValue,
                                                        });
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <br />
                                <Grid container spacing={2}>
                                    <Grid item md={6} xs={12} sm={12}>
                                        <Button
                                            variant="contained"
                                            style={{
                                                padding: "7px 13px",
                                                color: "white",
                                                background: "rgb(25, 118, 210)",
                                            }}
                                            onClick={editSubmit}
                                            sx={buttonStyles.buttonsubmit}
                                        >
                                            Update
                                        </Button>
                                    </Grid>
                                    <Grid item md={6} xs={6} sm={6}>
                                        <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
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
            {isUserRoleCompare?.includes("lloan") && (
                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Loan List</Typography>
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
                                        <MenuItem value={groups?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Box>
                                    {isUserRoleCompare?.includes("excelloan") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                fetchAllLoanArray()
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvloan") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                fetchAllLoanArray()
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printloan") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfloan") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)
                                                    fetchAllLoanArray()
                                                }}
                                            >
                                                <FaFilePdf />
                                                &ensp;Export to PDF&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imageloan") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                                                <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item md={2} xs={6} sm={6}>
                                <AggregatedSearchBar columnDataTable={columnDataTable} setItems={setItems} addSerialNumber={addSerialNumber} setPage={setPage} maindatas={groups} setSearchedString={setSearchedString}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    paginated={false}
                                    totalDatas={overallItems}
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
                        {isUserRoleCompare?.includes("bdloan") && (
                            <Button variant="contained" color="error" onClick={handleClickOpenalert} sx={buttonStyles.buttonbulkdelete}>
                                Bulk Delete
                            </Button>
                        )}
                        <br />
                        <br />
                        {!groupCheck ? (
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
                                    gridRefTable={gridRef}
                                    paginated={false}
                                    filteredDatas={filteredDatas}
                                    handleShowAllColumns={handleShowAllColumns}
                                    setFilteredRowData={setFilteredRowData}
                                    filteredRowData={filteredRowData}
                                    setFilteredChanges={setFilteredChanges}
                                    filteredChanges={filteredChanges}
                                    gridRefTableImg={gridRefTableImg}
                                    itemsList={overallItems}
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
            <Dialog open={openview}
                onClose={handleClickOpenview}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
                fullWidth={true}
                sx={{ marginTop: '50px' }}
            >
                <Box sx={{ padding: "20px 50px", }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Loan</Typography>
                        <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6"> Loan Amount</Typography>
                                    <Typography>{groupEdit.loanamount}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Start Year </Typography>
                                    <Typography>{groupEdit.startyear}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6"> Month </Typography>
                                    <Typography>{groupEdit.month}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6"> Applied Date</Typography>
                                    <Typography>{moment(groupEdit.applieddate).format("DD-MM-YYYY")}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6"> Tenure(Month) </Typography>
                                    <Typography>{groupEdit.tenure}</Typography>
                                </FormControl>
                            </Grid>

                            <Grid item md={6} sm={12} xs={12}>
                                <Typography variant="h6">Upload Document</Typography>
                                <Grid >
                                    <br />
                                    {documentFilesView?.length > 0 &&
                                        documentFilesView.map((file, index) => (
                                            <>
                                                <Grid container spacing={2}>
                                                    <Grid item md={6} sm={6} xs={6}>
                                                        <Typography>{file.name}</Typography>
                                                    </Grid>
                                                    <Grid></Grid>
                                                    <Grid item md={1} sm={6} xs={6}>
                                                        <VisibilityOutlinedIcon style={{ fontsize: "large", color: "#357AE8", cursor: "pointer" }} onClick={() => renderFilePreview(file)} />
                                                    </Grid>
                                                </Grid>
                                            </>
                                        ))}
                                </Grid>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Company</Typography>
                                    <Typography>{groupEdit.company}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Branch</Typography>
                                    <Typography>{groupEdit.branch}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Unit</Typography>
                                    <Typography>{groupEdit.unit}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Team</Typography>
                                    <Typography>{groupEdit.team}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Employee</Typography>
                                    <Typography>{groupEdit.employeename}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Emp Code</Typography>
                                    <Typography>{groupEdit.empcode}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Shift Timing</Typography>
                                    <Typography>{groupEdit.shifttiming}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Description</Typography>
                                    <Typography>{groupEdit.description}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Created Date/Time</Typography>
                                    <Typography>{Array.isArray(groupEdit.addedby) && moment(groupEdit.addedby[0].date).format("DD-MM-YYYY hh:mm:ss a")}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Added By</Typography>
                                    <Typography>{groupEdit.companyname}</Typography>
                                </FormControl>
                            </Grid>

                        </Grid>
                        <br /> <br /> <br />
                        <Grid container spacing={2}>
                            <Button variant="contained" color="primary" onClick={handleCloseview} sx={buttonStyles.btncancel}>
                                {" "}
                                Back{" "}
                            </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>
            {/* ALERT DIALOG */}
            <Box>
                <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
                        <Typography variant="h6">{showAlertpop}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            style={{ padding: "7px 13px", color: "white", background: "rgb(25, 118, 210)" }}
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
            {/* Reason of Leaving  */}
            <Dialog open={openviewalert} onClose={handleClickOpenviewalert} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <Box sx={{ width: "550px", padding: "20px 50px" }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> </Typography>
                        <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6"> Name</Typography>
                                </FormControl>
                            </Grid>
                            <br />
                            <Grid container spacing={2}>
                                <Grid item md={8} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography variant="h6"></Typography>
                                        <FormControl size="small" fullWidth>
                                            <TextField
                                            />
                                        </FormControl>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                        <br /> <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Button variant="contained" color="primary" onClick={handleCloseviewalert}>
                                    Save
                                </Button>
                            </Grid>
                            <Grid item md={0.2} xs={12} sm={12}></Grid>
                            <Grid item md={2} xs={12} sm={12}>
                                <Button variant="contained" color="primary" onClick={handleCloseviewalert}>
                                    {" "}
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                </Box>
            </Dialog>
            {/* ALERT DIALOG */}
            <Box>
                <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
                        <Typography variant="h6">{showAlert}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="error" onClick={handleCloseerr}>
                            ok
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
                filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
                itemsTwo={loanArray ?? []}
                filename={"Loan"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="Loan Info"
                addedby={addedby}
                updateby={updateby}
            />
            <DeleteConfirmation
                open={isDeleteOpen}
                onClose={handleCloseMod}
                onConfirm={deleGroup}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
            <DeleteConfirmation
                open={isDeleteOpencheckbox}
                onClose={handleCloseModcheckbox}
                onConfirm={delGroupcheckbox}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
            <PleaseSelectRow
                open={isDeleteOpenalert}
                onClose={handleCloseModalert}
                message="Please Select any Row"
                iconColor="orange"
                buttonText="OK"
            />
        </Box>
    );
}
export default Loan;