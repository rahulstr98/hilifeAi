import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Popover, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextareaAutosize, Tooltip, Typography } from "@mui/material";
import MuiInput from "@mui/material/Input";
import Radio from '@mui/material/Radio';
import { styled } from "@mui/system";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FaEdit, FaFileCsv, FaFileExcel, FaFilePdf, FaPlus, FaPrint, FaSearch } from 'react-icons/fa';
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import ResizeObserver from 'resize-observer-polyfill';
import AlertDialog from "../../components/Alert";
import { DeleteConfirmation, PleaseSelectRow, } from "../../components/DeleteConfirmation.js";
import { handleApiError } from "../../components/Errorhandling";
import ExportData from "../../components/ExportData";
import Headtitle from "../../components/Headtitle";
import InfoPopup from "../../components/InfoPopup.js";
import ManageColumnsContent from "../../components/ManageColumn";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import AdvancedSearchBar from '../../components/SearchbarEbList';
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import Webcamimage from "../hr/webcamprofile";
window.ResizeObserver = ResizeObserver;

const Input = styled(MuiInput)(({ theme }) => ({
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
        display: "none !important",
    },
    "& input[type=number]": {
        MozAppearance: "textfield",
    },
}));

function ApplyWorkFromHome() {

    const gridRefTableApplyLeave = useRef(null);
    const gridRefImageApplyLeave = useRef(null);

    let today = new Date();

    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    let formattedDate = yyyy + "-" + mm + "-" + dd;

    const [Accessdrop, setAccesDrop] = useState("Employee");
    const [AccessdropEdit, setAccesDropEdit] = useState("Employee");

    const [applyWfh, setApplyWfh] = useState({
        employeename: "Please Select Employee Name", employeeid: "", date: "", todate: "", reasonforworkfromhome: "", reportingto: "",
        department: '', designation: '', doj: '', availabledays: '', durationtype: 'Random', boardingLog: '', workmode: ''
    });

    const [appWfhEdit, setAppWfhEdit] = useState([]);
    const [selectStatus, setSelectStatus] = useState({});
    const [isApplyLeave, setIsApplyLeave] = useState([]);

    const [applyleaves, setApplyleaves] = useState([]);
    const [leaveId, setLeaveId] = useState("");
    const [allApplyWfhedit, setAllApplyWfhedit] = useState([]);

    const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, allTeam, pageName, setPageName, buttonStyles, } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);

    const [applyWfhCheck, setApplyWfhcheck] = useState(false);
    const [btnSubmit, setBtnSubmit] = useState(false);

    // State to track advanced filter
    const [advancedFilter, setAdvancedFilter] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);
    const [filteredDataItems, setFilteredDataItems] = useState(applyleaves);
    const [filteredRowData, setFilteredRowData] = useState([]);

    const [selectedRows, setSelectedRows] = useState([]);

    const [statusOpen, setStatusOpen] = useState(false);
    const handleStatusOpen = () => {
        setStatusOpen(true);
    };
    const handleStatusClose = () => {
        setStatusOpen(false);
    };

    // File Upload condition starting

    const [files, setFiles] = useState([]);
    const [fileEdit, setFilesEdit] = useState([]);

    const handleFileUpload = (event, index) => {
        const filesname = event.target.files;
        let newSelectedFiles = [...files];

        for (let i = 0; i < filesname.length; i++) {
            const file = filesname[i];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (fileExtension === 'pdf') {
                const reader = new FileReader();
                reader.onload = () => {
                    newSelectedFiles.push({
                        name: file.name,
                        preview: reader.result,
                        base64: reader.result.split(',')[1]
                        // index: indexData
                    });
                    setFiles(newSelectedFiles);
                };
                reader.readAsDataURL(file);
                break;
            } else {
                setPopupContentMalert("Please Upload PDF File Only");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
                break;
            }
        }
    };

    const handleFileDelete = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const renderFilePreview = async (file) => {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        window.open(link, "_blank");
    };

    const handleFileUploadEdit = (event, index) => {
        const filesname = event.target.files;
        let newSelectedFiles = [...fileEdit];

        for (let i = 0; i < filesname.length; i++) {
            const file = filesname[i];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'pdf') {
                const reader = new FileReader();
                reader.onload = () => {
                    newSelectedFiles.push({
                        name: file.name,
                        preview: reader.result,
                        base64: reader.result.split(',')[1]
                        // index: indexData
                    });
                    setFilesEdit(newSelectedFiles);
                };
                reader.readAsDataURL(file);
                break;
            } else {
                setPopupContentMalert("Please Upload PDF File Only");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
                break;
            }
        }
    };

    const handleFileDeleteFileEdit = (index) => {
        setFilesEdit((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const renderFilePreviewFileEdit = async (file) => {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        window.open(link, "_blank");
    };
    // File Upload End 

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    // page refersh reload
    const handleCloseFilterMod = () => { setIsFilterOpen(false); };
    const handleClosePdfFilterMod = () => { setIsPdfFilterOpen(false); };

    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => { setOpenPopupMalert(true); };
    const handleClosePopupMalert = () => { setOpenPopupMalert(false); };

    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupSeverity, setPopupSeverity] = useState("");
    const handleClickOpenPopup = () => { setOpenPopup(true); };
    const handleClosePopup = () => { setOpenPopup(false); }

    //Datatable
    const [pageApplyLeave, setPageApplyLeave] = useState(1);
    const [pageSizeApplyLeave, setPageSizeApplyLeave] = useState(10);
    const [searchQueryApplyLeave, setSearchQueryApplyLeave] = useState("");
    const [totalPagesApplyLeave, setTotalPagesApplyLeave] = useState(1);

    // view model
    const [openview, setOpenview] = useState(false);
    const handleClickOpenview = () => { setOpenview(true); };
    const handleCloseview = () => { setOpenview(false); };

    // Error Popup model
    const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
    const [showAlertpop, setShowAlertpop] = useState();
    const handleClickOpenerrpop = () => { setIsErrorOpenpop(true); };
    const handleCloseerrpop = () => { setIsErrorOpenpop(false); };

    // Error Popup model
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState();
    const handleClickOpenerr = () => { setIsErrorOpen(true); };
    const handleCloseerr = () => {
        setIsErrorOpen(false);
        setBtnSubmit(false);
    };

    const [isErrorOpenForTookLeaveCheck, setIsErrorOpenForTookLeaveCheck] = useState(false);
    const handleClickOpenerrForTookLeaveCheck = () => {
        setIsErrorOpenForTookLeaveCheck(true);
    };
    const handleCloseerrForTookLeaveCheck = () => {
        setIsErrorOpenForTookLeaveCheck(false);
        setApplyWfh({
            ...applyWfh, employeename: "Please Select Employee Name", employeeid: "", durationtype: "Random",
            availabledays: '', date: "", todate: "", reasonforworkfromhome: "", reportingto: "", noofshift: ''
        });
    };

    //Delete model
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const handleClickOpen = () => { setIsDeleteOpen(true); };
    const handleCloseMod = () => { setIsDeleteOpen(false); };

    //Delete model
    const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
    const handleClickOpenalert = () => {
        if (selectedRows.length === 0) {
            setIsDeleteOpenalert(true);
        } else {
            setIsDeleteOpencheckbox(true);
        }
    };
    const handleCloseModalert = () => { setIsDeleteOpenalert(false); };

    //Delete model
    const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);
    const handleClickOpencheckbox = () => { setIsDeleteOpencheckbox(true); };
    const handleCloseModcheckbox = () => { setIsDeleteOpencheckbox(false); };

    // Manage Columns
    const [searchQueryManageApplyLeave, setSearchQueryManageApplyLeave] = useState("");
    const [isManageColumnsOpenApplyLeave, setManageColumnsOpenApplyLeave] = useState(false);
    const [anchorElApplyLeave, setAnchorElApplyLeave] = useState(null);

    const handleOpenManageColumnsApplyLeave = (event) => {
        setAnchorElApplyLeave(event.currentTarget);
        setManageColumnsOpenApplyLeave(true);
    };
    const handleCloseManageColumnsApplyLeave = () => {
        setManageColumnsOpenApplyLeave(false);
        setSearchQueryManageApplyLeave("");
    };

    const openApplyLeave = Boolean(anchorElApplyLeave);
    const idApplyLeave = openApplyLeave ? "simple-popover" : undefined;

    // Search bar
    const [anchorElSearchApplyLeave, setAnchorElSearchApplyLeave] = React.useState(null);
    const handleClickSearchApplyLeave = (event) => {
        setAnchorElSearchApplyLeave(event.currentTarget);
    };
    const handleCloseSearchApplyLeave = () => {
        setAnchorElSearchApplyLeave(null);
        setSearchQueryApplyLeave("");
    };

    const openSearchApplyLeave = Boolean(anchorElSearchApplyLeave);
    const idSearchApplyLeave = openSearchApplyLeave ? 'simple-popover' : undefined;

    const leaveStatusOptions = [
        { label: "Shift", value: "Shift" },
        { label: "Before Half Shift", value: "Before Half Shift" },
        { label: "After Half Shift", value: "After Half Shift" },
    ];

    const durationOptions = [
        { label: "Continous", value: "Continous" },
        { label: "Random", value: "Random" },
    ]


    // Table row color
    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: '#f0f0f0' }; // Even row
        } else {
            return { background: '#ffffff' }; // Odd row
        }
    }

    useEffect(() => {
        getapi();
    }, []);

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                'Authorization': `Bearer ${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("Apply Work From Home"),
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

    let name = "create";

    // Show All Columns & Manage Columns
    const initialColumnVisibilityApplyLeave = {
        serialNumber: true,
        checkbox: true,
        employeename: true,
        employeeid: true,
        date: true,
        todate: true,
        noofshift: true,
        reasonforworkfromhome: true,
        reportingto: true,
        createdAt: true,
        actions: true,
        status: true,
    };

    const [columnVisibilityApplyLeave, setColumnVisibilityApplyLeave] = useState(initialColumnVisibilityApplyLeave);

    // page refersh reload code
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ""; // This is required for Chrome support
    };

    const [deleteApply, setDeleteApply] = useState("");

    const rowData = async (id, name) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setDeleteApply(res?.data?.sapplyworkfromhome);
            handleClickOpen();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    // Alert delete popup
    let Applysid = deleteApply?._id;
    const delApply = async () => {
        setPageName(!pageName)
        try {
            if (Applysid) {
                await axios.delete(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${Applysid}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
                await fetchApplyleave();
                handleCloseMod();
                setSelectedRows([]);
                setPageApplyLeave(1);
                setPopupContent("Deleted Successfully");
                setPopupSeverity("success");
                handleClickOpenPopup();
            }
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const delApplycheckbox = async () => {
        setPageName(!pageName)
        try {

            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${item}`, {
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
            setPageApplyLeave(1);

            await fetchApplyleave();
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const [companyOption, setCompanyOption] = useState([]);
    const [branchOption, setBranchOption] = useState([]);
    const [unitOption, setUnitOption] = useState([]);
    const [teamOption, setTeamOption] = useState([]);
    const [empnames, setEmpname] = useState([]);
    const [empnamesEdit, setEmpnameEdit] = useState([]);


    const [remainingWorkFromHomeDays, setRemainingWorkFromHomeDays] = useState(0);
    const [remainingcal, setRemainingcal] = useState(0);
    //get all comnpany.
    const fetchAssignWorkfromhome = async (e, DOJ) => {

        setPageName(!pageName);
        try {
            let res = await axios.get(SERVICE.ASSIGNWORKFROMHOMES, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            // let filteredData = res?.data?.assignworkfromhomes?.filter((data) => data.employeename?.includes(e));

            // const totalWorkFromHomeDays = filteredData.reduce((total, data) => {
            //     return total + Number(data.workfromhomedays || 0);
            // }, 0);

            let assignWorkFromHomes = res?.data?.assignworkfromhomes || [];
            let filteredData = [];

            filteredData = assignWorkFromHomes.filter((d) => d.mode === "Employee" && d.employeename.includes(e.companyname));

            if (filteredData.length === 0) {

                filteredData = assignWorkFromHomes.filter((d) => d.mode === "Designation" && d.designation.includes(e.designation));
            }

            if (filteredData.length === 0) {

                filteredData = assignWorkFromHomes.filter((d) => d.mode === "Department" && d.department.includes(e.department));
            }


            const totalWorkFromHomeDays = filteredData.length > 0
                ? filteredData.reduce((total, data) => total + Number(data.workfromhomedays || 0), 0)
                : 0;


            // const doj = new Date(e.doj);
            const doj = new Date(DOJ); // Assuming `e.doj` is in YYYY-MM-DD format
            const currentYear = new Date().getFullYear(); // Get the current year

            // Create a new date with the current year, keeping the month and day from `doj`
            const updatedDate = new Date(currentYear, doj.getMonth(), doj.getDate());
            const oneYearDate = new Date(updatedDate);
            oneYearDate.setFullYear(updatedDate.getFullYear() + 1);

            const startdate = new Date(DOJ);
            const enddate = oneYearDate;


            // const dateFilter = applyleaves?.filter((data) => data.employeename === e.value).flatMap((item) => item.date);

            const parseDate = (dateString) => {
                const [day, month, year] = dateString.split('/');
                return new Date(`${year}-${month}-${day}`);
            };

            const seenDates = new Set();

            const dateFilter = applyleaves
                // ?.filter((data) => data.employeename === e)
                ?.filter((data) => data.employeename === e.companyname)
                .flatMap((item) => item.date)
                .filter((date) => {
                    if (seenDates.has(date)) {
                        return false;
                    }
                    seenDates.add(date);
                    return true;
                });


            const totalDatesWithinYear = dateFilter.filter((date) => {
                // const currentDate = new Date(date); 
                const currentDate = parseDate(date);
                return currentDate >= doj && currentDate <= oneYearDate;
            }).length; // Get the count


            const totalLeaveCount = dateFilter?.reduce((acc, cur) => acc + (cur.workfromhomedays || 0), 0) || 0;

            const remainingWorkFromHomeDays = Number(totalWorkFromHomeDays || 0) - totalDatesWithinYear;

            setRemainingWorkFromHomeDays(remainingWorkFromHomeDays);

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    useEffect(() => {
        const roles = isUserRoleAccess.role?.map(data => data?.toLowerCase())
        if (!roles?.some(data => ["manager", "hiringmanager", "hr", "superadmin"].includes(data))) {
            // fetchAssignWorkfromhome(isUserRoleAccess.companyname, isUserRoleAccess.doj);
            fetchAssignWorkfromhome(isUserRoleAccess, isUserRoleAccess.doj);
        }
    }, [applyleaves]);


    //get all comnpany.
    const fetchCompanyAll = async () => {
        setPageName(!pageName)
        try {
            let res_location = await axios.get(SERVICE.COMPANY, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setCompanyOption([
                ...res_location?.data?.companies?.map((t) => ({
                    ...t,
                    label: t.name,
                    value: t.name,
                })),
            ]);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    //get all branches.
    const fetchBranchAll = async () => {
        setPageName(!pageName)
        try {
            let res_location = await axios.get(SERVICE.BRANCH, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
            });
            setBranchOption([
                ...res_location?.data?.branch?.map((t) => ({
                    ...t,
                    label: t.name,
                    value: t.name,
                })),
            ]);

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    //function to fetch unit
    const fetchUnitAll = async () => {
        setPageName(!pageName)
        try {
            let res_unit = await axios.get(`${SERVICE.UNIT}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setUnitOption([
                ...res_unit?.data?.units?.map((t) => ({
                    ...t,
                    label: t.name,
                    value: t.name,
                })),
            ]);


        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    //function to fetch  team
    const fetchTeamAll = async () => {
        setPageName(!pageName)
        try {
            let res_team = await axios.get(SERVICE.TEAMS, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
            });
            setTeamOption([
                ...res_team?.data?.teamsdetails?.map((t) => ({
                    ...t,
                    label: t.teamname,
                    value: t.teamname,
                })),
            ]);

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const fetchCategoryTicket = async () => {
        setPageName(!pageName)
        try {
            let res_emp = await axios.get(SERVICE.USER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const empall = [
                ...res_emp?.data?.users
                    .filter((data) => data.companyname !== isUserRoleAccess.companyname)
                    .map((d) => ({
                        ...d,
                        label: d.companyname,
                        value: d.companyname,
                    })),
            ];

            setEmpname(empall);
            setEmpnameEdit(empall);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

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
        setSelectedOptionsBranch([]);
        setValueUnitCat([]);
        setSelectedOptionsUnit([]);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setApplyWfh({ ...applyWfh, employeename: 'Please Select Employee Name', employeeid: '', noofshift: '', reasonforworkfromhome: '', reportingto: '' });
        setAllUsers([]);
        setSelectStatus([]);
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
        setValueBranchCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsBranch(options);
        setValueUnitCat([]);
        setSelectedOptionsUnit([]);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setApplyWfh({ ...applyWfh, employeename: 'Please Select Employee Name', employeeid: '', noofshift: '', reasonforworkfromhome: '', reportingto: '' });
        setAllUsers([]);
        setSelectStatus([]);
    };

    const customValueRendererBranch = (valueBranchCat, _categoryname) => {
        return valueBranchCat?.length
            ? valueBranchCat.map(({ label }) => label)?.join(", ")
            : "Please Select Branch";
    };


    //unit multiselect
    const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([]);
    let [valueUnitCat, setValueUnitCat] = useState([]);

    const handleUnitChange = (options) => {
        setValueUnitCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsUnit(options);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setApplyWfh({ ...applyWfh, employeename: 'Please Select Employee Name', employeeid: '', noofshift: '', reasonforworkfromhome: '', reportingto: '' });
        setAllUsers([]);
        setSelectStatus([]);
    };

    const customValueRendererUnit = (valueUnitCat, _categoryname) => {
        return valueUnitCat?.length
            ? valueUnitCat.map(({ label }) => label)?.join(", ")
            : "Please Select Unit";
    };

    //team multiselect
    const [selectedOptionsTeam, setSelectedOptionsTeam] = useState([]);
    let [valueTeamCat, setValueTeamCat] = useState([]);

    const handleTeamChange = (options) => {
        setValueTeamCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsTeam(options);
        setApplyWfh({ ...applyWfh, employeename: 'Please Select Employee Name', employeeid: '', noofshift: '', reasonforworkfromhome: '', reportingto: '' });
        setAllUsers([]);
        setSelectStatus([]);
    };

    const customValueRendererTeam = (valueTeamCat, _categoryname) => {
        return valueTeamCat?.length
            ? valueTeamCat.map(({ label }) => label)?.join(", ")
            : "Please Select Team";
    };

    //company multiselect
    const [selectedOptionsCompanyEdit, setSelectedOptionsCompanyEdit] = useState([]);
    let [valueCompanyCatEdit, setValueCompanyCatEdit] = useState([]);


    const handleCompanyChangeEdit = (options) => {
        setValueCompanyCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsCompanyEdit(options);
        setValueBranchCatEdit([]);
        setSelectedOptionsBranchEdit([]);
        setValueUnitCatEdit([]);
        setSelectedOptionsUnitEdit([]);
        setValueTeamCatEdit([]);
        setSelectedOptionsTeamEdit([]);
    };

    const customValueRendererCompanyEdit = (valueCompanyCatEdit, _categoryname) => {
        return valueCompanyCatEdit?.length
            ? valueCompanyCatEdit.map(({ label }) => label)?.join(", ")
            : "Please Select Company";
    };

    //branch multiselect
    const [selectedOptionsBranchEdit, setSelectedOptionsBranchEdit] = useState([]);
    let [valueBranchCatEdit, setValueBranchCatEdit] = useState([]);

    const handleBranchChangeEdit = (options) => {
        setValueBranchCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsBranchEdit(options);
        setValueUnitCatEdit([]);
        setSelectedOptionsUnitEdit([]);
        setValueTeamCatEdit([]);
        setSelectedOptionsTeamEdit([]);
    };

    const customValueRendererBranchEdit = (valueBranchCatEdit, _categoryname) => {
        return valueBranchCatEdit?.length
            ? valueBranchCatEdit.map(({ label }) => label)?.join(", ")
            : "Please Select Branch";
    };

    //unit multiselect
    const [selectedOptionsUnitEdit, setSelectedOptionsUnitEdit] = useState([]);
    let [valueUnitCatEdit, setValueUnitCatEdit] = useState([]);

    const handleUnitChangeEdit = (options) => {
        setValueUnitCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsUnitEdit(options);
        setValueTeamCatEdit([]);
        setSelectedOptionsTeamEdit([]);
    };

    const customValueRendererUnitEdit = (valueUnitCatEdit, _categoryname) => {
        return valueUnitCatEdit?.length
            ? valueUnitCatEdit.map(({ label }) => label)?.join(", ")
            : "Please Select Unit";
    };

    //team multiselect
    const [selectedOptionsTeamEdit, setSelectedOptionsTeamEdit] = useState([]);
    let [valueTeamCatEdit, setValueTeamCatEdit] = useState([]);

    const handleTeamChangeEdit = (options) => {
        setValueTeamCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsTeamEdit(options);
    };

    const customValueRendererTeamEdit = (valueTeamCatEdit, _categoryname) => {
        return valueTeamCatEdit?.length
            ? valueTeamCatEdit.map(({ label }) => label)?.join(", ")
            : "Please Select Team";
    };

    useEffect(() => {
        fetchCompanyAll();
        fetchBranchAll();
        fetchUnitAll();
        fetchTeamAll();
        fetchCategoryTicket();
    }, [selectedOptionsCompany]);

    let dateselect = new Date();
    dateselect.setDate(dateselect.getDate() + 3);
    var ddt = String(dateselect.getDate()).padStart(2, "0");
    var mmt = String(dateselect.getMonth() + 1).padStart(2, "0");
    var yyyyt = dateselect.getFullYear();
    let formattedDatet = yyyyt + "-" + mmt + "-" + ddt;

    let datePresent = new Date();
    var ddp = String(datePresent.getDate());
    var mmp = String(datePresent.getMonth() + 1);
    var yyyyp = datePresent.getFullYear();
    let formattedDatePresent = yyyyp + "-" + mmp + "-" + ddp;

    // Assuming applyWfh.date is the "from date" and applyWfh.todate is the "to date"
    const calculateDaysDifference = () => {
        const fromDate = new Date(applyWfh.date).getTime();
        const toDate = new Date(applyWfh.todate).getTime();

        if (!isNaN(fromDate) && !isNaN(toDate)) {
            // Calculate the number of days between the two dates
            const daysDifference = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
            return daysDifference + 1;
        }

        return 0; // Return 0 if either date is invalid
    };

    // Call the function and set the result in state or use it as needed
    const daysDifference = calculateDaysDifference();

    // Assuming applyWfh.date is the "from date" and applyWfh.todate is the "to date"
    const calculateDaysDifferenceEdit = () => {
        const fromDate = new Date(appWfhEdit.date).getTime();
        const toDate = new Date(appWfhEdit.todate).getTime();

        if (!isNaN(fromDate) && !isNaN(toDate)) {
            // Calculate the number of days between the two dates
            const daysDifferenceEdit = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
            return daysDifferenceEdit + 1;
        }

        return 0; // Return 0 if either date is invalid
    };

    // Call the function and set the result in state or use it as needed
    const daysDifferenceEdit = calculateDaysDifferenceEdit();

    const [allUsers, setAllUsers] = useState([]);
    const [allUsersWithPrevNext, setAllUsersWithPrevNext] = useState([]);
    const [leavecriterias, setLeavecriterias] = useState([]);
    const [getSelectedDates, setGetSelectedDates] = useState([]);
    const [leaveRestriction, setLeaveRestriction] = useState(false);
    const [checkDuplicate, setCheckDuplicate] = useState([]);

    const [allUsersEdit, setAllUsersEdit] = useState([]);
    const [leavecriteriasEdit, setLeavecriteriasEdit] = useState([]);
    const [availableDaysEdit, setAvailableDaysEdit] = useState('');
    const [getSelectedDatesEdit, setGetSelectedDatesEdit] = useState([]);
    const [leaveRestrictionEdit, setLeaveRestrictionEdit] = useState(false);
    const [checkDuplicateEdit, setCheckDuplicateEdit] = useState([]);

    // get week for month's start to end
    function getWeekNumberInMonth(date) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

        // If the first day of the month is not Monday (1), calculate the adjustment
        const adjustment = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Calculate the day of the month adjusted for the starting day of the week
        const dayOfMonthAdjusted = date.getDate() + adjustment;

        // Calculate the week number based on the adjusted day of the month
        const weekNumber = Math.ceil(dayOfMonthAdjusted / 7);

        return weekNumber;
    }

    const fetchUsersRandom = async (value, date,) => {
        setPageName(!pageName)
        let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
        });

        let empid = Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode;
        let result = res_vendor?.data?.applyworkfromhomes.filter((item) => item.employeeid === empid).flatMap(d => d.date);

        let check = result.includes(moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'))

        let daysArray = [];
        if (date === '') {
            setPopupContentMalert("Please Select Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (getSelectedDates.includes(moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'))) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (check) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            let startMonthDate = new Date(date);
            let endMonthDate = new Date(date);

            // Find the previous day
            const previousDay = new Date(startMonthDate);
            previousDay.setDate(startMonthDate.getDate() - 1);

            // Find the next day
            const nextDay = new Date(startMonthDate);
            nextDay.setDate(startMonthDate.getDate() + 1);

            while (previousDay <= nextDay) {
                const formattedDate = `${String(previousDay.getDate()).padStart(2, '0')}/${String(previousDay.getMonth() + 1).padStart(2, '0')}/${previousDay.getFullYear()}`;
                const dayName = previousDay.toLocaleDateString('en-US', { weekday: 'long' });
                const dayCount = previousDay.getDate();
                const shiftMode = 'Main Shift';
                const weekNumberInMonth = (getWeekNumberInMonth(previousDay) === 1 ? `${getWeekNumberInMonth(previousDay)}st Week` :
                    getWeekNumberInMonth(previousDay) === 2 ? `${getWeekNumberInMonth(previousDay)}nd Week` :
                        getWeekNumberInMonth(previousDay) === 3 ? `${getWeekNumberInMonth(previousDay)}rd Week` :
                            getWeekNumberInMonth(previousDay) > 3 ? `${getWeekNumberInMonth(previousDay)}th Week` : '')

                daysArray.push({ formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth });

                // Move to the next day
                previousDay.setDate(previousDay.getDate() + 1);
            }
        }

        try {
            let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_LEAVE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                userDates: daysArray,
                empcode: value
            });
            if (date !== '' && !getSelectedDates.includes(moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY')) && !check && res?.data?.finaluser.length === 0) {
                setPopupContentMalert("Shift is not alloted for the selected date. Please select another date");
                setPopupSeverityMalert("warning");
                handleClickOpenPopupMalert();
                setApplyWfh({ ...applyWfh, date: '' });
            }
            else {
                const uniqueHeadings = [...new Set(res?.data?.finaluser)];
                let result = uniqueHeadings.filter((d) => {
                    const [day, month, year] = d.formattedDate?.split('/');
                    const finaldate = `${year}-${month}-${day}`;

                    return d.shiftMode === 'Main Shift' && finaldate === date
                });

                // setAllUsers(prevUsers => [...prevUsers, ...res?.data?.finaluser]);
                setAllUsers(prevUsers => [...prevUsers, ...result]);
                setAllUsersWithPrevNext(uniqueHeadings);

                // Extract formatted dates from response data and set to getSelectedDates
                // const selectedDates = res?.data?.finaluser.map(d => d.formattedDate);
                const selectedDates = result.map(d => d.formattedDate);
                setGetSelectedDates(prevDates => [...prevDates, ...selectedDates]);
                setApplyWfh({ ...applyWfh, date: '' });
            }

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

    };

    const fetchUsersRandomEdit = async (value, date,) => {

        let check = checkDuplicateEdit.includes(moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'))

        let daysArray = [];
        if (date === '') {
            setPopupContentMalert("Please Select Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (getSelectedDatesEdit.includes(moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'))) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (check) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            let startMonthDate = new Date(date);
            let endMonthDate = new Date(date);

            while (startMonthDate <= endMonthDate) {
                const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
                const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });
                const dayCount = startMonthDate.getDate();
                const shiftMode = 'Main Shift';
                const weekNumberInMonth = (getWeekNumberInMonth(startMonthDate) === 1 ? `${getWeekNumberInMonth(startMonthDate)}st Week` :
                    getWeekNumberInMonth(startMonthDate) === 2 ? `${getWeekNumberInMonth(startMonthDate)}nd Week` :
                        getWeekNumberInMonth(startMonthDate) === 3 ? `${getWeekNumberInMonth(startMonthDate)}rd Week` :
                            getWeekNumberInMonth(startMonthDate) > 3 ? `${getWeekNumberInMonth(startMonthDate)}th Week` : '')

                daysArray.push({ formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth });

                // Move to the next day
                startMonthDate.setDate(startMonthDate.getDate() + 1);
            }
        }

        try {
            let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_LEAVE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                userDates: daysArray,
                empcode: value
            });

            setAllUsersEdit(prevUsers => [...prevUsers, ...res?.data?.finaluser]);

            // Extract formatted dates from response data and set to getSelectedDates
            const selectedDatesEdit = res?.data?.finaluser.map(d => d.formattedDate);
            setGetSelectedDatesEdit(prevDates => [...prevDates, ...selectedDatesEdit]);
            setAppWfhEdit({ ...appWfhEdit, date: '' });
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

    };

    const fetchUsers = async (value, date, todate) => {
        setPageName(!pageName)
        let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
        });

        let empid = Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode;
        let result = res_vendor?.data?.applyworkfromhomes.filter((item) => item.employeeid === empid).flatMap(d => d.date);

        const isOverlap = result.some((leave) => {
            const startDate = moment(date, "YYYY-MM-DD");
            const endDate = moment(todate, "YYYY-MM-DD");
            const leaveDate = moment(leave, "DD/MM/YYYY");

            // Check if any of the selected dates overlap with the leave date
            return (
                leaveDate.isBetween(startDate, endDate, 'day', '[]') || // Within leave period
                leaveDate.isSame(startDate, 'day') || // Leave starts on the given date
                leaveDate.isSame(endDate, 'day') // Leave ends on the given date
            );
        });

        const isOverlap1 = getSelectedDates.some((leave) => {
            const startDate = moment(date, "YYYY-MM-DD");
            const endDate = moment(todate, "YYYY-MM-DD");
            const leaveDate = moment(leave, "DD/MM/YYYY");

            // Check if any of the selected dates overlap with the leave date
            return (
                leaveDate.isBetween(startDate, endDate, 'day', '[]') || // Within leave period
                leaveDate.isSame(startDate, 'day') || // Leave starts on the given date
                leaveDate.isSame(endDate, 'day') // Leave ends on the given date
            );
        });

        let daysArray = [];
        let daysArrayNew = [];
        if (date === '') {
            setPopupContentMalert("Please Select From Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        if (todate === '') {
            setPopupContentMalert("Please Select To Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (isOverlap1) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (isOverlap) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            let startMonthDate = new Date(date);
            let endMonthDate = new Date(todate);

            // Find the previous day
            const previousDay = new Date(startMonthDate);
            previousDay.setDate(startMonthDate.getDate() - 1);

            // Find the next day
            const nextDay = new Date(endMonthDate);
            nextDay.setDate(endMonthDate.getDate() + 1);

            while (startMonthDate <= endMonthDate) {
                const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
                const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });
                const dayCount = startMonthDate.getDate();
                const shiftMode = 'Main Shift';
                const weekNumberInMonth = (getWeekNumberInMonth(startMonthDate) === 1 ? `${getWeekNumberInMonth(startMonthDate)}st Week` :
                    getWeekNumberInMonth(startMonthDate) === 2 ? `${getWeekNumberInMonth(startMonthDate)}nd Week` :
                        getWeekNumberInMonth(startMonthDate) === 3 ? `${getWeekNumberInMonth(startMonthDate)}rd Week` :
                            getWeekNumberInMonth(startMonthDate) > 3 ? `${getWeekNumberInMonth(startMonthDate)}th Week` : '')

                daysArrayNew.push({ formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth });

                // Move to the next day
                startMonthDate.setDate(startMonthDate.getDate() + 1);
            }

            while (previousDay <= nextDay) {
                const formattedDate = `${String(previousDay.getDate()).padStart(2, '0')}/${String(previousDay.getMonth() + 1).padStart(2, '0')}/${previousDay.getFullYear()}`;
                const dayName = previousDay.toLocaleDateString('en-US', { weekday: 'long' });
                const dayCount = previousDay.getDate();
                const shiftMode = 'Main Shift';
                const weekNumberInMonth = (getWeekNumberInMonth(previousDay) === 1 ? `${getWeekNumberInMonth(previousDay)}st Week` :
                    getWeekNumberInMonth(previousDay) === 2 ? `${getWeekNumberInMonth(previousDay)}nd Week` :
                        getWeekNumberInMonth(previousDay) === 3 ? `${getWeekNumberInMonth(previousDay)}rd Week` :
                            getWeekNumberInMonth(previousDay) > 3 ? `${getWeekNumberInMonth(previousDay)}th Week` : '')

                daysArray.push({ formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth });

                // Move to the next day
                previousDay.setDate(previousDay.getDate() + 1);
            }
        }

        try {
            let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_LEAVE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                userDates: daysArray,
                empcode: value
            });
            if (date !== '' && todate !== '' && !isOverlap1 && !isOverlap && res?.data?.finaluser.length === 0) {
                setPopupContentMalert("Shift is not alloted for the selected date. Please select another date");
                setPopupSeverityMalert("warning");
                handleClickOpenPopupMalert();
                setApplyWfh({ ...applyWfh, date: '', todate: '' });
            }
            else {
                const uniqueHeadings = [...new Set(res?.data?.finaluser)];
                let result = uniqueHeadings.filter((d) => d.shiftMode === 'Main Shift' && daysArrayNew.some(day => day.formattedDate === d.formattedDate));

                // setAllUsers(prevUsers => [...prevUsers, ...res?.data?.finaluser]);
                setAllUsers(prevUsers => [...prevUsers, ...result]);
                setAllUsersWithPrevNext(uniqueHeadings);

                // Extract formatted dates from response data and set to getSelectedDates
                // const selectedDates = res?.data?.finaluser.map(d => d.formattedDate);
                const selectedDates = result.map(d => d.formattedDate);
                setGetSelectedDates(prevDates => [...prevDates, ...selectedDates]);
                setApplyWfh({ ...applyWfh, date: '', todate: '' });
            }
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

    };

    const fetchUsersEdit = async (value, date, todate) => {
        setPageName(!pageName)
        const isOverlap = checkDuplicateEdit.some((leave) => {
            const startDate = moment(date, "YYYY-MM-DD");
            const endDate = moment(todate, "YYYY-MM-DD");
            const leaveDate = moment(leave, "DD/MM/YYYY");

            // Check if any of the selected dates overlap with the leave date
            return (
                leaveDate.isBetween(startDate, endDate, 'day', '[]') || // Within leave period
                leaveDate.isSame(startDate, 'day') || // Leave starts on the given date
                leaveDate.isSame(endDate, 'day') // Leave ends on the given date
            );
        });

        const isOverlap1 = getSelectedDatesEdit.some((leave) => {
            const startDate = moment(date, "YYYY-MM-DD");
            const endDate = moment(todate, "YYYY-MM-DD");
            const leaveDate = moment(leave, "DD/MM/YYYY");

            // Check if any of the selected dates overlap with the leave date
            return (
                leaveDate.isBetween(startDate, endDate, 'day', '[]') || // Within leave period
                leaveDate.isSame(startDate, 'day') || // Leave starts on the given date
                leaveDate.isSame(endDate, 'day') // Leave ends on the given date
            );
        });

        let daysArray = [];
        if (date === '') {
            setPopupContentMalert("Please Select From Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        if (todate === '') {
            setPopupContentMalert("Please Select To Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (isOverlap1) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (isOverlap) {
            setPopupContentMalert("These Date Range is Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            let startMonthDate = new Date(date);
            let endMonthDate = new Date(todate);

            while (startMonthDate <= endMonthDate) {
                const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
                const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });
                const dayCount = startMonthDate.getDate();
                const shiftMode = 'Main Shift';
                const weekNumberInMonth = (getWeekNumberInMonth(startMonthDate) === 1 ? `${getWeekNumberInMonth(startMonthDate)}st Week` :
                    getWeekNumberInMonth(startMonthDate) === 2 ? `${getWeekNumberInMonth(startMonthDate)}nd Week` :
                        getWeekNumberInMonth(startMonthDate) === 3 ? `${getWeekNumberInMonth(startMonthDate)}rd Week` :
                            getWeekNumberInMonth(startMonthDate) > 3 ? `${getWeekNumberInMonth(startMonthDate)}th Week` : '')

                daysArray.push({ formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth });

                // Move to the next day
                startMonthDate.setDate(startMonthDate.getDate() + 1);
            }
        }

        try {
            let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_LEAVE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                userDates: daysArray,
                empcode: value
            });

            setAllUsersEdit(prevUsers => [...prevUsers, ...res?.data?.finaluser]);

            // Extract formatted dates from response data and set to getSelectedDates
            const selectedDatesEdit = res?.data?.finaluser.map(d => d.formattedDate);
            setGetSelectedDatesEdit(prevDates => [...prevDates, ...selectedDatesEdit]);
            setAppWfhEdit({ ...appWfhEdit, date: '', todate: '' });
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

    };
    const [tookLeaveDaysWithAllUsers, setTookLeaveDaysWithAllUsers] = useState([]);



    function multiLeaveStatusInputs(referenceIndex, inputvalue) {
        let shiftValue = 0;

        // Calculate shift value based on selected option
        if (inputvalue === 'Shift') {
            shiftValue = 1;
        } else if (inputvalue === 'Before Half Shift' || inputvalue === 'After Half Shift') {
            shiftValue = 0.5;
        }

        // Update isSubCategory state
        const updatedData = allUsers.map((value, index) => {
            if (referenceIndex === index) {
                return { ...value, leavestatus: inputvalue, shiftcount: shiftValue };
            } else {
                return value;
            }
        });

        setAllUsers(updatedData);

        // Calculate total shift value
        const totalShifts = updatedData.reduce((acc, cur) => {
            if (cur.leavestatus === 'Shift') {
                return acc + 1;
            } else if (cur.leavestatus === 'Before Half Shift' || cur.leavestatus === 'After Half Shift') {
                return acc + 0.5;
            }
            return acc;
        }, 0);

        // Update state
        setApplyWfh({ ...applyWfh, noofshift: totalShifts });
    }

    const handleDelete = (referenceIndex) => {

        let deleteIndex;

        let updatedData = allUsers.filter((value, index) => {
            if (referenceIndex != index) {
                return value;
            } else {
                if (allUsers[index + 1]) {
                    deleteIndex = index;
                }
            }
            return false;
        });

        // Calculate total shift value
        const totalShifts = updatedData.reduce((acc, cur) => {
            if (cur.leavestatus === 'Shift') {
                return acc + 1;
            } else if (cur.leavestatus === 'Before Half Shift' || cur.leavestatus === 'After Half Shift') {
                return acc + 0.5;
            }
            return acc;
        }, 0);

        // Update state
        setApplyWfh({ ...applyWfh, noofshift: totalShifts, date: '', todate: '' });

        setAllUsers(updatedData);
        setGetSelectedDates(updatedData.map(d => d.formattedDate))
    }

    function multiLeaveStatusInputsEdit(referenceIndex, inputvalue) {
        let shiftValue = 0;

        // Calculate shift value based on selected option
        if (inputvalue === 'Shift') {
            shiftValue = 1;
        } else if (inputvalue === 'Before Half Shift' || inputvalue === 'After Half Shift') {
            shiftValue = 0.5;
        }

        // Update isSubCategory state
        const updatedData = allUsersEdit.map((value, index) => {
            if (referenceIndex === index) {
                return { ...value, leavestatus: inputvalue, shiftcount: shiftValue };
            } else {
                return value;
            }
        });

        setAllUsersEdit(updatedData);

        // Calculate total shift value
        const totalShifts = updatedData.reduce((acc, cur) => {
            if (cur.leavestatus === 'Shift') {
                return acc + 1;
            } else if (cur.leavestatus === 'Before Half Shift' || cur.leavestatus === 'After Half Shift') {
                return acc + 0.5;
            }
            return acc;
        }, 0);

        // Update state
        setAppWfhEdit({ ...appWfhEdit, noofshift: totalShifts });
    }

    const handleDeleteEdit = (referenceIndex) => {

        let deleteIndex;

        let updatedData = allUsersEdit.filter((value, index) => {
            if (referenceIndex != index) {
                return value;
            } else {
                if (allUsersEdit[index + 1]) {
                    deleteIndex = index;
                }
            }
            return false;
        });

        // Calculate total shift value
        const totalShifts = updatedData.reduce((acc, cur) => {
            if (cur.leavestatus === 'Shift') {
                return acc + 1;
            } else if (cur.leavestatus === 'Before Half Shift' || cur.leavestatus === 'After Half Shift') {
                return acc + 0.5;
            }
            return acc;
        }, 0);

        // Update state
        setAppWfhEdit({ ...appWfhEdit, noofshift: totalShifts, date: '', todate: '' });

        setAllUsersEdit(updatedData);
        setGetSelectedDatesEdit(updatedData.map(d => d.formattedDate))
    }

    //add function
    const sendRequest = async () => {
        setPageName(!pageName)
        setBtnSubmit(true);
        let comp = selectedOptionsCompany.map((item) => item.value);
        let bran = selectedOptionsBranch.map((item) => item.value);
        let unit = selectedOptionsUnit.map((item) => item.value);
        let team = selectedOptionsTeam.map((item) => item.value);

        const currentDate = moment();

        const isAnyPastDate = allUsers.some(user => {
            const userDate = moment(user.formattedDate, 'DD/MM/YYYY');
            return userDate.isBefore(currentDate, 'day');
        });

        let finalAllUsers = allUsers.map((d) => { return { ...d, tookleavecheckstatus: 'Single' } });

        try {
            let subprojectscreate = await axios.post(SERVICE.APPLYWORKFROMHOME_CREATE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: comp,
                branch: bran,
                unit: unit,
                team: team,
                employeename: Accessdrop === "HR" ? String(applyWfh.employeename) : isUserRoleAccess.companyname,
                employeeid: Accessdrop === "HR" ? String(applyWfh.employeeid) : isUserRoleAccess.empcode,
                access: Accessdrop,
                // date: String(applyWfh.date),
                // todate: String(applyWfh.todate),
                date: [...getSelectedDates],
                numberofdays: String(allUsers.length),
                files: [...files],
                ApplyLeaves: [...finalAllUsers],
                noofshift: Number(applyWfh.noofshift),
                durationtype: String(applyWfh.durationtype),
                reasonforworkfromhome: String(applyWfh.reasonforworkfromhome),
                department: String(applyWfh.department),
                designation: String(applyWfh.designation),
                doj: String(applyWfh.doj),
                remainingworkfromdays: String(remainingWorkFromHomeDays),
                weekoff: applyWfh.weekoff,
                workmode: String(applyWfh.workmode),
                reportingto: Accessdrop === "HR" ? String(applyWfh.reportingto) : isUserRoleAccess.reportingto,
                status: String("Applied WFH"),
                uninformedleavestatus: String((leaveRestriction === true && isAnyPastDate) ? 'Uninformed' : ''),
                rejectedreason: String(""),
                tookleavecheckstatus: String("Single"),
                addedby: [
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchApplyleave();
            setApplyWfh({
                ...applyWfh, employeename: "Please Select Employee Name", employeeid: "", durationtype: "Random",
                availabledays: '', date: "", todate: "", reasonforworkfromhome: "", reportingto: "", noofshift: ''
            });
            setFiles([]);
            setAllUsers([]);
            setGetSelectedDates([]);
            // setValueCompanyCat([]);
            // setSelectedOptionsCompany([]);
            // setValueBranchCat([]);
            // setSelectedOptionsBranch([]);
            // setValueUnitCat([]);
            // setSelectedOptionsUnit([]);
            // setValueTeamCat([]);
            // setSelectedOptionsTeam([]);
            setBranchOption([]);
            setUnitOption([]);
            setTeamOption([]);
            // setEmpname([]);
            handleCloseerrForTookLeaveCheck();
            setBtnSubmit(false);
            setPopupContent("Added Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { setBtnSubmit(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const sendRequestDouble = async () => {
        setPageName(!pageName)
        let comp = selectedOptionsCompany.map((item) => item.value);
        let bran = selectedOptionsBranch.map((item) => item.value);
        let unit = selectedOptionsUnit.map((item) => item.value);
        let team = selectedOptionsTeam.map((item) => item.value);

        const currentDate = moment();

        const isAnyPastDate = allUsers.some(user => {
            const userDate = moment(user.formattedDate, 'DD/MM/YYYY');
            return userDate.isBefore(currentDate, 'day');
        });

        let empid = Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode


        const monthstring = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let dayNamesArray = [];
        allUsers.forEach((all) => {
            tookLeaveDaysWithAllUsers.map((val) => {
                const [day, month, year] = all.formattedDate.split('/').map(Number);

                if ((parseInt(val.year) === year) && (val.month === monthstring[month - 1]) && (val.week === all.weekNumberInMonth)) {
                    dayNamesArray.push(val.day);
                }
            })
        })

        let uniqueDayNames = Array.from(new Set(dayNamesArray.map((t) => t)));

        let finalAllUsers = allUsers.map((d) => {
            if (uniqueDayNames.includes(d.dayName)) {
                return { ...d, tookleavecheckstatus: 'Double' }
            }
            else {
                return { ...d, tookleavecheckstatus: 'Single' }
            }
        })

        try {
            let subprojectscreate = await axios.post(SERVICE.APPLYWORKFROMHOME_CREATE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: comp,
                branch: bran,
                unit: unit,
                team: team,
                employeename: Accessdrop === "HR" ? String(applyWfh.employeename) : isUserRoleAccess.companyname,
                employeeid: Accessdrop === "HR" ? String(applyWfh.employeeid) : isUserRoleAccess.empcode,
                access: Accessdrop,
                // date: String(applyWfh.date),
                // todate: String(applyWfh.todate),
                date: [...getSelectedDates],
                numberofdays: String(allUsers.length),
                ApplyLeaves: [...finalAllUsers],
                noofshift: Number(applyWfh.noofshift),
                durationtype: String(applyWfh.durationtype),
                reasonforworkfromhome: String(applyWfh.reasonforworkfromhome),
                department: String(applyWfh.department),
                designation: String(applyWfh.designation),
                doj: String(applyWfh.doj),
                weekoff: applyWfh.weekoff,
                workmode: String(applyWfh.workmode),
                reportingto: Accessdrop === "HR" ? String(applyWfh.reportingto) : isUserRoleAccess.reportingto,
                status: String("Applied WFH"),
                uninformedleavestatus: String((leaveRestriction === true && isAnyPastDate) ? 'Uninformed' : ''),
                rejectedreason: String(""),
                tookleavecheckstatus: String("Double"),
                addedby: [
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchApplyleave();
            setApplyWfh({
                ...applyWfh, employeename: "Please Select Employee Name", employeeid: "", durationtype: "Random",
                availabledays: '', date: "", todate: "", reasonforworkfromhome: "", reportingto: "", noofshift: ''
            });
            setAllUsers([]);
            setGetSelectedDates([]);
            setValueCompanyCat([]);
            setSelectedOptionsCompany([]);
            setValueBranchCat([]);
            setSelectedOptionsBranch([]);
            setValueUnitCat([]);
            setSelectedOptionsUnit([]);
            setValueTeamCat([]);
            setSelectedOptionsTeam([]);
            setBranchOption([]);
            setUnitOption([]);
            setTeamOption([]);
            setEmpname([]);
            handleCloseerrForTookLeaveCheck();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Function to find the day before and after a given day name
    function getDayBeforeAndAfter(dayName) {
        const index = daysOfWeek.indexOf(dayName);
        const beforeIndex = (index === 0) ? 6 : index - 1; // Wrap around to Saturday if Sunday
        const afterIndex = (index === 6) ? 0 : index + 1; // Wrap around to Sunday if Saturday
        return [daysOfWeek[beforeIndex], daysOfWeek[afterIndex]];
    }

    //submit option for saving
    const handleSubmit = async (e) => {
        e.preventDefault();
        const checkLeaveStatus = allUsers?.find(d => d.leavestatus === '')
        // const isNameMatch = applyleaves.some(item => item.reasonforworkfromhome.toLowerCase() === (applyWfh.reasonforworkfromhome).toLowerCase() && item.employeename === applyWfh.employeename && item.date === applyWfh.date && item.todate === applyWfh.todate);
        const isNameMatch = applyleaves.some((item) => item.employeename === applyWfh.employeename && item.date === applyWfh.date && item.todate === applyWfh.todate);
        let empid = Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode

        let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
        });

        let uninformResult = res_vendor?.data?.applyworkfromhomes.filter((item) => item.employeeid === empid && item.uninformedleavestatus === 'Uninformed').flatMap(d => d.date);
        let result = res_vendor?.data?.applyworkfromhomes.filter((item) => item.employeeid === empid).flatMap(d => d.date);

        let checkDuplicateDates = allUsers.some((d) => result.includes(d.formattedDate))

        if (Accessdrop === "HR" && selectedOptionsCompany.length === 0) {
            setPopupContentMalert("Please Select Company");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (Accessdrop === "HR" && selectedOptionsBranch.length === 0) {
            setPopupContentMalert("Please Select Branch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (Accessdrop === "HR" && selectedOptionsUnit.length === 0) {
            setPopupContentMalert("Please Select Unit");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (Accessdrop === "HR" && selectedOptionsTeam.length === 0) {
            setPopupContentMalert("Please Select Team");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (Accessdrop === "HR" && applyWfh.employeename === "Please Select Employee Name") {
            setPopupContentMalert("Please Select Employee Name");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }

        else if (allUsers.length === 0) {
            setPopupContentMalert("Please click plus button to add WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (checkDuplicateDates) {
            setPopupContentMalert("Date Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (applyWfh.noofshift === "") {
            setPopupContentMalert("Please Select All WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (checkLeaveStatus) {
            setPopupContentMalert("Please Select All WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (applyWfh.reasonforworkfromhome === "") {
            setPopupContentMalert("Please Enter Reason for WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (files.length < 1) {
            setPopupContentMalert("Please Upload Files");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (remainingWorkFromHomeDays === 0) {
            setPopupContentMalert("Work From Home Not Eligible for these person");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (applyWfh.noofshift > remainingWorkFromHomeDays) {
            setPopupContentMalert("Number of shifts cannot exceed remaining WFH days!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }

        else if (isNameMatch) {
            setPopupContentMalert("Name Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            if (leavecriterias.length > 0) {

                let weekoff = [];
                let updatedDatesWeekOffDates = [];

                allUsersWithPrevNext.filter((day) => {
                    if (day.shift === 'Week Off') {
                        weekoff.push(day.dayName);
                        updatedDatesWeekOffDates.push(day.formattedDate);
                    }
                })

                leavecriterias.forEach((d) => {
                    let hasWeekOffDay, beforeDay, afterDay, hasBeforeDay, hasAfterDay;
                    // let dayNamesArray = [];

                    let check = allUsers.length > parseInt(d.uninformedleavecount);
                    let uninformedcheck = uninformResult.length >= parseInt(d.uninformedleavecount);
                    // let noticeperiodcheck = noticeresultDate.length >= parseInt(d.leavefornoticeperiodcount);
                    let check2 = allUsers.length > parseInt(d.leavefornoticeperiodcount);

                    const currentDate = moment();

                    const isAnyPastDate = allUsers.some(user => {
                        const userDate = moment(user.formattedDate, 'DD/MM/YYYY');
                        return userDate.isBefore(currentDate, 'day');
                    });

                    const monthstring = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    let userDaysArray = [];

                    allUsers.forEach((all) => {
                        let dayNamesArray = [];

                        d.tookleave.forEach((val) => {
                            const [day, month, year] = all.formattedDate.split('/').map(Number);

                            if (parseInt(val.year) === year &&
                                val.month === monthstring[month - 1] &&
                                val.week === all.weekNumberInMonth) {

                                dayNamesArray.push(val.day);
                            }
                        });

                        userDaysArray.push(dayNamesArray); // Save the result for each user
                    });



                    let uniqueDayNames = Array.from(new Set(userDaysArray.flatMap((t) => t)));
                    const checkTookLeaveDays = allUsers.some(val => uniqueDayNames.includes(val.dayName));


                    weekoff?.forEach(empwkoffday => {
                        // find out weekoff's before and after dayname
                        [beforeDay, afterDay] = getDayBeforeAndAfter(empwkoffday);
                        hasBeforeDay = allUsers.some(user => user.dayName === beforeDay);
                        hasAfterDay = allUsers.some(user => user.dayName === afterDay);
                        hasWeekOffDay = allUsers.some(user => updatedDatesWeekOffDates.includes(user.formattedDate));
                    })

                    if (d.leaverespecttoweekoff === true && (hasBeforeDay || hasAfterDay) && !hasWeekOffDay) {
                        setPopupContentMalert(`Please select Weekoff date (${updatedDatesWeekOffDates.map(d => d)}) with these selected date`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.leaverespecttoweekoff === false && hasAfterDay) {
                        setPopupContentMalert(`You cannot take leave on ${afterDay}`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.leaverespecttoweekoff === false && hasBeforeDay) {
                        setPopupContentMalert(`You cannot take leave on ${beforeDay}`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.leaverespecttotraining === false && applyWfh.workmode === 'Internship') {
                        setPopupContentMalert("You are in training period. Cannot apply leave");
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }

                    else if (d.tookleavecheck === false && checkTookLeaveDays) {
                        setPopupContentMalert(`You are not allowed to take leave on ${allUsers.filter(val => uniqueDayNames.includes(val.dayName)).map(day => day.dayName)}`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.uninformedleave === true && isAnyPastDate && check) {
                        setPopupContentMalert(`You can apply only ${d.uninformedleavecount} days of leave`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.uninformedleave === true && isAnyPastDate && uninformedcheck && !check) {
                        setPopupContentMalert(`You have already applied Uninformed WFH`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }


                    else {
                        if (d.tookleavecheck === true && checkTookLeaveDays) {
                            setPopupContentMalert(`You are not allowed to take leave on ${allUsers.filter(val => uniqueDayNames.includes(val.dayName)).map(day => day.dayName)}. If you want to apply leave on this day it will be calculate as a Double Lop. Do you want to apply?`);
                            setPopupSeverityMalert("warning");
                            handleClickOpenPopupMalert();
                        }
                        else {
                            sendRequest();
                        }
                    }
                })
            }
            else {
                sendRequest();
            }
        }
    };

    const handleClear = (e) => {
        e.preventDefault();
        setFiles([]);
        setApplyWfh({
            employeename: "Please Select Employee Name", employeeid: "", durationtype: 'Random', date: "", todate: "", reasonforworkfromhome: "", reportingto: "",
            noofshift: '', availabledays: ''
        });
        setRemainingWorkFromHomeDays(0)
        setAllUsers([]);
        setGetSelectedDates([]);
        setValueCompanyCat([]);
        setSelectedOptionsCompany([]);
        setValueBranchCat([]);
        setSelectedOptionsBranch([]);
        setValueUnitCat([]);
        setSelectedOptionsUnit([]);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setBranchOption([]);
        setUnitOption([]);
        setTeamOption([]);
        setEmpname([]);
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    };

    //Edit model...
    const [isEditOpen, setIsEditOpen] = useState(false);
    const handleClickOpenEdit = () => { setIsEditOpen(true); };
    const handleCloseModEdit = (e, reason) => {
        if (reason && reason === "backdropClick") return;
        setIsEditOpen(false);
    };

    // info model
    const [openInfo, setOpeninfo] = useState(false);
    const handleClickOpeninfo = () => { setOpeninfo(true); };
    const handleCloseinfo = () => { setOpeninfo(false); };

    //get single row to edit....
    const getCode = async (e, name) => {
        try {
            let res = await axios.get(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAppWfhEdit(res?.data?.sapplyworkfromhome);
            setLeaveId(res?.data?.sapplyworkfromhome._id);
            setAccesDropEdit(res?.data?.sapplyworkfromhome.access);
            setAllUsersEdit(res?.data?.sapplyworkfromhome.ApplyLeaves);
            setGetSelectedDatesEdit(res?.data?.sapplyworkfromhome.date);
            setSelectedOptionsCompanyEdit(res?.data?.sapplyworkfromhome?.company.map((item) => ({ label: item, value: item })));
            setSelectedOptionsBranchEdit(res?.data?.sapplyworkfromhome?.branch.map((item) => ({ label: item, value: item })));
            setSelectedOptionsUnitEdit(res?.data?.sapplyworkfromhome?.unit.map((item) => ({ label: item, value: item })));
            setSelectedOptionsTeamEdit(res?.data?.sapplyworkfromhome?.team.map((item) => ({ label: item, value: item })));
            setValueCompanyCatEdit(res?.data?.sapplyworkfromhome?.company)
            setValueBranchCatEdit(res?.data?.sapplyworkfromhome?.branch)
            setValueUnitCatEdit(res?.data?.sapplyworkfromhome?.unit)
            setValueTeamCatEdit(res?.data?.sapplyworkfromhome?.team)
            await fetchApplyleaveAll();


            setAvailableDaysEdit(res?.data?.sapplyworkfromhome?.availabledays);

            let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            let result = res_vendor?.data?.applyworkfromhomes.filter((item) => item._id !== res?.data?.sapplylworkfromhome._id && item.employeeid === res?.data?.sapplylworkfromhome.employeeid).flatMap(d => d.date);
            setCheckDuplicateEdit(result);

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const getinfoCodeStatus = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setSelectStatus(res?.data?.sapplyworkfromhome);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    // get single row to view....
    const getviewCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAppWfhEdit(res?.data?.sapplyworkfromhome);
            handleClickOpenview();
            setAllUsersEdit(res?.data?.sapplyworkfromhome.ApplyLeaves)
            setSelectedOptionsCompanyEdit(res?.data?.sapplyworkfromhome?.company.map((item) => ({ label: item, value: item })));
            setSelectedOptionsBranchEdit(res?.data?.sapplyworkfromhome?.branch.map((item) => ({ label: item, value: item })));
            setSelectedOptionsUnitEdit(res?.data?.sapplyworkfromhome?.unit.map((item) => ({ label: item, value: item })));
            setSelectedOptionsTeamEdit(res?.data?.sapplyworkfromhome?.team.map((item) => ({ label: item, value: item })));
            setFilesEdit(res?.data?.sapplyworkfromhome.files);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    // get single row to view....
    const getinfoCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAppWfhEdit(res?.data?.sapplyworkfromhome);
            handleClickOpeninfo();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    //Project updateby edit page...
    let updateby = appWfhEdit?.updatedby;
    let addedby = appWfhEdit?.addedby;
    let updatedByStatus = selectStatus.updatedby;

    let subprojectsid = appWfhEdit?._id;
    //editing the single data...
    const sendEditRequest = async () => {
        setPageName(!pageName)
        let comp = selectedOptionsCompanyEdit.map((item) => item.value);
        let bran = selectedOptionsBranchEdit.map((item) => item.value);
        let unit = selectedOptionsUnitEdit.map((item) => item.value);
        let team = selectedOptionsTeamEdit.map((item) => item.value);

        const currentDate = moment();

        const isAnyPastDate = allUsersEdit.some(user => {
            const userDate = moment(user.formattedDate, 'DD/MM/YYYY');
            return userDate.isBefore(currentDate, 'day');
        });



        try {
            let res = await axios.put(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${leaveId}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: comp,
                branch: bran,
                unit: unit,
                team: team,
                employeename: AccessdropEdit === "HR" ? String(appWfhEdit.employeename) : isUserRoleAccess.companyname,
                employeeid: AccessdropEdit === "HR" ? String(appWfhEdit.employeeid) : isUserRoleAccess.empcode,
                department: String(appWfhEdit.department),
                designation: String(appWfhEdit.designation),
                doj: String(appWfhEdit.doj),
                // remainingworkfromdays: String(remainingWorkFromHomeDays),
                weekoff: appWfhEdit.weekoff,
                workmode: String(appWfhEdit.workmode),
                date: [...getSelectedDatesEdit],
                numberofdays: String(allUsersEdit.length),
                ApplyLeaves: [...allUsersEdit],
                noofshift: Number(appWfhEdit.noofshift),
                durationtype: String(appWfhEdit.durationtype),
                // availabledays: Number(appWfhEdit.availabledays ? appWfhEdit.availabledays : availableDaysEdit),
                reasonforworkfromhome: String(appWfhEdit.reasonforworkfromhome),
                reportingto: AccessdropEdit === "HR" ? String(appWfhEdit.reportingto) : isUserRoleAccess.reportingto,
                uninformedleavestatus: String(appWfhEdit.uninformedleavestatus ? appWfhEdit.uninformedleavestatus : ((leaveRestrictionEdit === true && isAnyPastDate) ? 'Uninformed' : '')),
                updatedby: [
                    ...updateby,
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchApplyleave();
            handleCloseModEdit();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const editSubmit = async (e) => {
        e.preventDefault();
        const checkLeaveStatus = allUsersEdit?.find(d => d.leavestatus === '')

        fetchApplyleaveAll();

        let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
        });
        let empid = AccessdropEdit === 'HR' ? appWfhEdit.employeeid : isUserRoleAccess.empcode;
        let uninformResult = res_vendor?.data?.applyworkfromhomes.filter((item) => item._id !== appWfhEdit._id && item.employeeid === empid && item.uninformedleavestatus === 'Uninformed').flatMap(d => d.date);

        const isNameMatch = allApplyWfhedit.some((item) => item.reasonforworkfromhome.toLowerCase() === appWfhEdit.reasonforworkfromhome.toLowerCase() && item.employeename === appWfhEdit.employeename && item.date === appWfhEdit.date && item.todate === appWfhEdit.todate);

        if (appWfhEdit.employeename === "Please Select Employee Name") {
            setPopupContentMalert("Please Select Employee Name");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (appWfhEdit.availabledays == '') {
            setPopupContentMalert("No More Available WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (allUsersEdit.length > appWfhEdit.availabledays) {
            setPopupContentMalert("You applied leave more than available days");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }


        else if (allUsersEdit.length === 0) {
            setPopupContentMalert("Please Select Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (appWfhEdit.noofshift === "") {
            setPopupContentMalert("Please Select All WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (checkLeaveStatus) {
            setPopupContentMalert("Please Select All WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (appWfhEdit.reasonforworkfromhome === "") {
            setPopupContentMalert("Please Enter Reason for WFH");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {
            setPopupContentMalert("Name Already Exists!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {

            let weekoff = AccessdropEdit === 'HR' ? appWfhEdit.weekoff : isUserRoleAccess.weekoff
            leavecriteriasEdit.forEach((d) => {

                let check = allUsersEdit.length > parseInt(d.uninformedleavecount);
                let uninformedcheck = uninformResult.length >= parseInt(d.uninformedleavecount);
                // let noticeperiodcheck = noticeresultDate.length >= parseInt(d.leavefornoticeperiodcount);
                let check2 = allUsersEdit.length > parseInt(d.leavefornoticeperiodcount);

                const currentDate = moment();

                const isAnyPastDate = allUsersEdit.some(user => {
                    const userDate = moment(user.formattedDate, 'DD/MM/YYYY');
                    return userDate.isBefore(currentDate, 'day');
                });

                weekoff?.forEach(empwkoffday => {

                    // find out weekoff's before and after dayname
                    const [beforeDay, afterDay] = getDayBeforeAndAfter(empwkoffday);

                    const hasBeforeDay = allUsersEdit.some(user => user.dayName === beforeDay);
                    const hasAfterDay = allUsersEdit.some(user => user.dayName === afterDay);
                    // const hasWeekOffDay = allUsersEdit.some(user => user.dayName === empwkoffday);

                    const hasBeforeDayDate = allUsersEdit.filter(user => user.dayName === beforeDay).map(d => d.formattedDate);
                    const hasAfterDayDate = allUsersEdit.filter(user => user.dayName === afterDay).map(d => d.formattedDate);

                    let updatedDatesBeforeWeekOffDates = [];
                    let updatedDatesAfterWeekOffDates = [];

                    //for example if selected date is monday
                    hasAfterDayDate.forEach(date => {
                        const [day, month, year] = date.split('/');
                        const currentDate = new Date(`${year}-${month}-${day}`);

                        // Get the day before
                        const dayBefore = new Date(currentDate);
                        dayBefore.setDate(currentDate.getDate() - 1);
                        const formattedDayBefore = `${dayBefore.getDate()}`.padStart(2, '0');
                        const formattedMonthBefore = `${dayBefore.getMonth() + 1}`.padStart(2, '0');
                        updatedDatesBeforeWeekOffDates.push(`${formattedDayBefore}/${formattedMonthBefore}/${dayBefore.getFullYear()}`);

                    });

                    hasBeforeDayDate.forEach(date => {
                        const [day, month, year] = date.split('/');
                        const currentDate = new Date(`${year}-${month}-${day}`);

                        // Get the day after
                        const dayAfter = new Date(currentDate);
                        dayAfter.setDate(currentDate.getDate() + 1);
                        const formattedDayAfter = `${dayAfter.getDate()}`.padStart(2, '0');
                        const formattedMonthAfter = `${dayAfter.getMonth() + 1}`.padStart(2, '0');
                        updatedDatesAfterWeekOffDates.push(`${formattedDayAfter}/${formattedMonthAfter}/${dayAfter.getFullYear()}`);
                    });

                    const hasWeekOffDayNext = allUsersEdit.some(user => updatedDatesAfterWeekOffDates.includes(user.formattedDate));
                    const hasWeekOffDayBefore = allUsersEdit.some(user => updatedDatesBeforeWeekOffDates.includes(user.formattedDate));

                    if (d.leaverespecttoweekoff === true && hasBeforeDay && !hasWeekOffDayNext && !hasWeekOffDayBefore) {
                        setPopupContentMalert(`Please select Weekoff date (${updatedDatesAfterWeekOffDates.map(d => d)}, ${updatedDatesBeforeWeekOffDates.map(d => d)}) with these selected date`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.leaverespecttoweekoff === true && hasAfterDay && !hasWeekOffDayBefore && !hasWeekOffDayNext) {
                        setPopupContentMalert(`Please select Weekoff date(${updatedDatesBeforeWeekOffDates.map(d => d)}) with these selected date`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.leaverespecttoweekoff === false && hasAfterDay) {
                        setPopupContentMalert(`You cannot take leave on ${afterDay}`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.leaverespecttoweekoff === false && hasBeforeDay) {
                        setPopupContentMalert(`You cannot take leave on ${beforeDay}`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.leaverespecttotraining === false && appWfhEdit.workmode === 'Internship') {
                        setPopupContentMalert(`You are in training period. Cannot apply leave`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }

                    else if (allUsersEdit.some(val => d.tookleave.includes(val.dayName.toLowerCase()))) {
                        setPopupContentMalert(`You are not allowed to take leave on ${d.tookleave.map(d => d.toUpperCase())}`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.uninformedleave === true && isAnyPastDate && check) {
                        setPopupContentMalert(`You can apply only ${d.uninformedleavecount} days of leave`);
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }
                    else if (d.uninformedleave === true && isAnyPastDate && uninformedcheck && !check) {
                        setPopupContentMalert("You have already applied Uninformed WFH");
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                    }

                    else {
                        sendEditRequest();
                    }
                })
            })
        }
    };

    const sendEditStatus = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.put(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${selectStatus._id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                status: String(selectStatus.status),
                rejectedreason: String(selectStatus.status == "Rejected" ? selectStatus.rejectedreason : ""),
                actionby: String(isUserRoleAccess.companyname),
                updatedby: [
                    ...updatedByStatus,
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchApplyleave();
            handleStatusClose();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const editStatus = () => {
        if (selectStatus.status == "Rejected") {
            if (selectStatus.rejectedreason == "") {
                setPopupContentMalert("Please Enter Rejected Reason");
                setPopupSeverityMalert("warning");
                handleClickOpenPopupMalert();
            } else {
                sendEditStatus();
            }
        }

        else {
            sendEditStatus();
        }
    };

    //get all Sub vendormasters.
    const fetchApplyleave = async () => {
        setPageName(!pageName)
        try {
            let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setApplyWfhcheck(true);
            let answer = isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? res_vendor?.data?.applyworkfromhomes : res_vendor?.data?.applyworkfromhomes.filter((data) => data.employeename === isUserRoleAccess.companyname);
            const itemsWithSerialNumber = answer?.map((item, index) => ({
                ...item,
                id: item._id,
                serialNumber: index + 1,
                employeeid: item.employeeid,
                employeename: item.employeename,
                // date: item.date + "--" + item.todate,
                date: item.date,
                noofshift: item.noofshift,
                reasonforworkfromhome: item.reasonforworkfromhome,
                status: item.status,
                createdAt: item.createdAt,
            }));
            setApplyleaves(itemsWithSerialNumber);
            setFilteredDataItems(itemsWithSerialNumber);
            setTotalPagesApplyLeave(Math.ceil(answer.length / pageSizeApplyLeave));
            let Approve = isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? res_vendor?.data?.applyworkfromhomes.filter((data) => data.status === "Approved WFH") : res_vendor?.data?.applyworkfromhomes.filter((data) => data.employeename === isUserRoleAccess.companyname && data.status === "Approved WFH");
            setIsApplyLeave(Approve);
        } catch (err) { setApplyWfhcheck(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    //get all Sub vendormasters.
    const fetchApplyleaveAll = async () => {
        setPageName(!pageName)
        try {
            let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAllApplyWfhedit(res_vendor?.data?.applyworkfromhomes.filter((item) => item._id !== appWfhEdit._id));
            let empid = Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode;
            let result = res_vendor?.data?.applyworkfromhomes.filter((item) => item.employeeid === empid).flatMap(d => d.date);
            setCheckDuplicate(result);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    //id for login...
    let loginid = localStorage.LoginUserId;
    let authToken = localStorage.APIToken;

    useEffect(() => {
        // getexcelDatas();
    }, [appWfhEdit, applyWfh, checkDuplicate]);

    useEffect(() => {
        fetchApplyleave();
    }, []);

    // useEffect(() => {
    //   fetchApplyleaveAll();
    // }, [isEditOpen, appWfhEdit]);

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
        addSerialNumber(applyleaves);
    }, [applyleaves]);

    const defaultColDef = useMemo(() => {
        return {
            filter: true,
            resizable: true,
            filterParams: {
                buttons: ["apply", "reset", "cancel"],
            },
        };
    }, []);

    const onGridReady = useCallback((params) => {
        setGridApi(params.api);
        setColumnApi(params.columnApi);
    }, []);

    // Function to handle filter changes
    const onFilterChanged = () => {
        if (gridApi) {
            const filterModel = gridApi.getFilterModel(); // Get the current filter model

            // Check if filters are active
            if (Object.keys(filterModel).length === 0) {
                // No filters active, clear the filtered data state
                setFilteredRowData([]);
            } else {
                // Filters are active, capture filtered data
                const filteredData = [];
                gridApi.forEachNodeAfterFilterAndSort((node) => {
                    filteredData.push(node.data); // Collect filtered row data
                });
                setFilteredRowData(filteredData);
            }
        }
    };

    const onPaginationChanged = useCallback(() => {
        if (gridRefTableApplyLeave.current) {
            const gridApi = gridRefTableApplyLeave.current.api;
            const currentPage = gridApi.paginationGetCurrentPage() + 1;
            const totalPagesApplyLeave = gridApi.paginationGetTotalPages();
            setPageApplyLeave(currentPage);
            setTotalPagesApplyLeave(totalPagesApplyLeave);
        }
    }, []);



    // Pagination for outer filter
    const filteredData = filteredDataItems?.slice((pageApplyLeave - 1) * pageSizeApplyLeave, pageApplyLeave * pageSizeApplyLeave);
    const totalPagesApplyLeaveOuter = Math.ceil(filteredDataItems?.length / pageSizeApplyLeave);
    const visiblePages = Math.min(totalPagesApplyLeaveOuter, 3);
    const firstVisiblePage = Math.max(1, pageApplyLeave - 1);
    const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPagesApplyLeaveOuter);
    const pageNumbers = [];
    const indexOfLastItem = pageApplyLeave * pageSizeApplyLeave;
    const indexOfFirstItem = indexOfLastItem - pageSizeApplyLeave;
    for (let i = firstVisiblePage; i <= lastVisiblePage; i++) { pageNumbers.push(i); }

    const [selectAllChecked, setSelectAllChecked] = useState(false);

    const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
        <div>
            <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
        </div>
    );

    const columnDataTableApplyLeave = [
        // {
        //   field: "checkbox",
        //   headerName: "Checkbox", // Default header name
        //   headerStyle: {
        //     fontWeight: "bold", // Apply the font-weight style to make the header text bold
        //     // Add any other CSS styles as needed
        //   },
        //   headerComponent: (params) => (
        //     <CheckboxHeader
        //       selectAllChecked={selectAllChecked}
        //       onSelectAll={() => {
        //         if (filteredData.length === 0) {
        //           // Do not allow checking when there are no rows
        //           return;
        //         }
        //         if (selectAllChecked) {
        //           setSelectedRows([]);
        //         } else {
        //           const allRowIds = filteredData.map((row) => row.id);
        //           setSelectedRows(allRowIds);
        //         }
        //         setSelectAllChecked(!selectAllChecked);
        //       }}
        //     />
        //   ),

        //   cellRenderer: (params) => (
        //     <Checkbox
        //       checked={selectedRows.includes(params.data.id)}
        //       onChange={() => {
        //         let updatedSelectedRows;
        //         if (selectedRows.includes(params.data.id)) {
        //           updatedSelectedRows = selectedRows.filter((selectedId) => selectedId !== params.data.id);
        //         } else {
        //           updatedSelectedRows = [...selectedRows, params.data.id];
        //         }

        //         setSelectedRows(updatedSelectedRows);

        //         // Update the "Select All" checkbox based on whether all rows are selected
        //         setSelectAllChecked(updatedSelectedRows.length === filteredData.length);
        //       }}
        //     />
        //   ),
        //   sortable: false, // Optionally, you can make this column not sortable
        //   width: 90,

        //   hide: !columnVisibilityApplyLeave.checkbox,
        //   headerClassName: "bold-header",
        // },
        { field: "serialNumber", headerName: "SNo", flex: 0, width: 80, hide: !columnVisibilityApplyLeave.serialNumber, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
        { field: "employeeid", headerName: "Employee Id", flex: 0, width: 150, hide: !columnVisibilityApplyLeave.employeeid, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
        { field: "employeename", headerName: "Employee Name", flex: 0, width: 250, hide: !columnVisibilityApplyLeave.employeename, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
        { field: "date", headerName: "Date", flex: 0, width: 110, hide: !columnVisibilityApplyLeave.date, headerClassName: "bold-header" },
        { field: "noofshift", headerName: "Number of Shift", flex: 0, width: 120, hide: !columnVisibilityApplyLeave.noofshift, headerClassName: "bold-header" },
        { field: "reasonforworkfromhome", headerName: "Reason for WFH", flex: 0, width: 200, hide: !columnVisibilityApplyLeave.reasonforworkfromhome, headerClassName: "bold-header" },
        {
            field: "status",
            headerName: "Status",
            flex: 0,
            width: 150,
            hide: !columnVisibilityApplyLeave.status,
            headerClassName: "bold-header",

            cellRenderer: (params) => {
                if (!(isUserRoleAccess?.role?.includes("Manager") ||
                    isUserRoleAccess?.role?.includes("HiringManager") ||
                    isUserRoleAccess?.role?.includes("HR") ||
                    isUserRoleAccess?.role?.includes("Superadmin")) &&
                    !["Approved WFH", "Rejected"].includes(params.data.status)) {

                    return (
                        <Grid sx={{ display: 'flex' }}>
                            <Button
                                variant="contained"
                                style={{
                                    margin: '5px',
                                    backgroundColor: params.value === "Applied WFH" ? "#FFC300"
                                        : params.value === "Rejected" ? "red"
                                            : params.value === "Approved WFH" ? "green"
                                                : "inherit",
                                    color: params.value === "Applied WFH" ? "black" : "white",
                                    fontSize: "10px",
                                    width: "max-content",
                                    fontWeight: "bold",
                                    cursor: 'default'
                                }}
                            >
                                {params.value}
                            </Button>
                        </Grid>
                    );
                } else {
                    return (
                        <Grid sx={{ display: 'flex' }}>
                            <Button
                                variant="contained"
                                style={{
                                    margin: '5px',
                                    backgroundColor: (() => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);

                                        const isTodayApplied = params.data.date.some((d) => {
                                            const [day, month, year] = d.split("/");
                                            const parsedDate = new Date(`${year}-${month}-${day}`);
                                            parsedDate.setHours(0, 0, 0, 0);
                                            return parsedDate.getTime() === today.getTime();
                                        });

                                        const isLateApplied = params.data.date.some((d) => {
                                            const [day, month, year] = d.split("/");
                                            const appliedDate = new Date(`${year}-${month}-${day}`);
                                            appliedDate.setHours(0, 0, 0, 0);

                                            const createdAt = new Date(params.data.createdAt);
                                            createdAt.setHours(0, 0, 0, 0);

                                            return createdAt.getTime() > appliedDate.getTime(); // Created after applied date
                                        });

                                        if (isTodayApplied) {
                                            return params.value === "Applied WFH" ? "#FFC300"
                                                : params.value === "Rejected" ? "red"
                                                    : params.value === "Approved WFH" ? "green"
                                                        : "inherit";
                                        }
                                        if (isLateApplied && params.value === "Applied WFH") {
                                            return "#FF5733"; // Orange for Late Applied
                                        }

                                        return params.value === "Applied WFH" ? "#FFC300"
                                            : params.value === "Rejected" ? "red"
                                                : params.value === "Approved WFH" ? "green"
                                                    : "inherit";
                                    })(),
                                    color: (() => {
                                        const bgColor = (() => {
                                            if (params.value === "Rejected") return "red";
                                            if (params.value === "Applied WFH") return "#FFC300";
                                            if (params.value === "Approved WFH") return "green";
                                            if (params.value === "Late Applied") return "#FF5733";
                                            return "inherit";
                                        })();
                                        return bgColor === "red" || bgColor === "green" || bgColor === "#FF5733" ? "white" : "black";
                                    })(),
                                    fontSize: "10px",
                                    // padding: "5px 10px",
                                    width: "max-content",
                                    fontWeight: "bold",
                                    cursor: 'default',
                                }}
                            >
                                {(() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);

                                    const isTodayApplied = params.data.date.some((d) => {
                                        const [day, month, year] = d.split("/");
                                        const parsedDate = new Date(`${year}-${month}-${day}`);
                                        parsedDate.setHours(0, 0, 0, 0);
                                        return parsedDate.getTime() === today.getTime();
                                    });

                                    const isLateApplied = params.data.date.some((d) => {
                                        const [day, month, year] = d.split("/");
                                        const appliedDate = new Date(`${year}-${month}-${day}`);
                                        appliedDate.setHours(0, 0, 0, 0);

                                        const createdAt = new Date(params.data.createdAt);
                                        createdAt.setHours(0, 0, 0, 0);

                                        return createdAt.getTime() > appliedDate.getTime();
                                    });

                                    if (isTodayApplied) {
                                        return params.value === "Applied WFH" ? "Quick Applied"
                                            : params.value === "Rejected" ? "Quick Rejected"
                                                : params.value === "Approved WFH" ? "Quick Approved"
                                                    : params.value;
                                    }
                                    if (isLateApplied && params.value === "Applied WFH") {
                                        return "Late Applied";
                                    }
                                    return params.value;
                                })()}
                            </Button>
                        </Grid>
                        // <Grid sx={{ display: 'flex' }}>
                        //     <Button
                        //         variant="contained"
                        //         style={{
                        //             margin: '5px',
                        //             backgroundColor: (() => {
                        //                 const today = new Date();
                        //                 today.setHours(0, 0, 0, 0);

                        //                 const isTodayApplied = params.data.date.some((d) => {
                        //                     const [day, month, year] = d.split("/");
                        //                     const parsedDate = new Date(`${year}-${month}-${day}`);
                        //                     parsedDate.setHours(0, 0, 0, 0);
                        //                     return parsedDate.getTime() === today.getTime();
                        //                 });

                        //                 const isLateApplied = params.data.date.some((d) => {
                        //                     const [day, month, year] = d.split("/");
                        //                     const appliedDate = new Date(`${year}-${month}-${day}`);
                        //                     appliedDate.setHours(0, 0, 0, 0);

                        //                     const createdAt = new Date(params.data.createdAt);
                        //                     createdAt.setHours(0, 0, 0, 0);

                        //                     return createdAt.getTime() > appliedDate.getTime(); // Created after applied date
                        //                 });

                        //                 if (isTodayApplied) {
                        //                     return params.value === "Applied WFH" ? "#FFC300"
                        //                         : params.value === "Rejected" ? "red"
                        //                             : params.value === "Approved WFH" ? "green"
                        //                                 : "inherit";
                        //                 }
                        //                 if (isLateApplied) {
                        //                     return "#FF5733"; // Orange for Late Applied
                        //                 }

                        //                 return params.value === "Applied WFH" ? "#FFC300"
                        //                     : params.value === "Rejected" ? "red"
                        //                         : params.value === "Approved WFH" ? "green"
                        //                             : "inherit";
                        //             })(),
                        //             color: (() => {
                        //                 const bgColor = (() => {
                        //                     if (params.value === "Rejected") return "red";
                        //                     if (params.value === "Applied WFH") return "#FFC300";
                        //                     if (params.value === "Approved WFH") return "green";
                        //                     if (params.value === "Late Applied") return "#FF5733";
                        //                     return "inherit";
                        //                 })();
                        //                 return bgColor === "red" || bgColor === "green" || bgColor === "#FF5733" ? "white" : "black";
                        //             })(),
                        //             fontSize: "10px",
                        //             // padding: "5px 10px",
                        //             width: "max-content",
                        //             fontWeight: "bold",
                        //             cursor: 'default',
                        //         }}
                        //     >
                        //         {(() => {
                        //             const today = new Date();
                        //             today.setHours(0, 0, 0, 0);

                        //             const isTodayApplied = params.data.date.some((d) => {
                        //                 const [day, month, year] = d.split("/");
                        //                 const parsedDate = new Date(`${year}-${month}-${day}`);
                        //                 parsedDate.setHours(0, 0, 0, 0);
                        //                 return parsedDate.getTime() === today.getTime();
                        //             });

                        //             const isLateApplied = params.data.date.some((d) => {
                        //                 const [day, month, year] = d.split("/");
                        //                 const appliedDate = new Date(`${year}-${month}-${day}`);
                        //                 appliedDate.setHours(0, 0, 0, 0);

                        //                 const createdAt = new Date(params.data.createdAt);
                        //                 createdAt.setHours(0, 0, 0, 0);

                        //                 return createdAt.getTime() > appliedDate.getTime();
                        //             });

                        //             if (isTodayApplied) {
                        //                 return params.value === "Applied WFH" ? "Quick Applied"
                        //                     : params.value === "Rejected" ? "Quick Rejected"
                        //                         : params.value === "Approved WFH" ? "Quick Approved"
                        //                             : params.value;
                        //             }
                        //             if (isLateApplied) {
                        //                 return "Late Applied";
                        //             }
                        //             return params.value;
                        //         })()}
                        //     </Button>
                        // </Grid>
                    );
                }
            },

        },


        {
            field: "actions",
            headerName: "Action",
            flex: 0,
            width: 270,
            minHeight: "40px !important",
            filter: false,
            sortable: false,
            hide: !columnVisibilityApplyLeave.actions,
            headerClassName: "bold-header",
            cellRenderer: (params) => (
                <Grid sx={{ display: "flex" }}>
                    {/* {(!(isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin")) && ["Approved WFH", "Rejected"].includes(params.data.status)) ||
                          (isUserRoleCompare?.includes("eapplyworkfromhome") && params.data.status !== 'Approved WFH' && (
                            <Button
                              sx={userStyle.buttonedit}
                              onClick={() => {
                                handleClickOpenEdit();
                                getCode(params.data.id, params.data.name);
                              }}
                            >
                              <EditOutlinedIcon style={{ fontsize: "large" }} />
                            </Button>
                          ))} */}
                    {(!(isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin")) && ["Approved WFH", "Rejected"].includes(params.data.status)) ||
                        (isUserRoleCompare?.includes("dapplyworkfromhome") && params.data.status !== 'Approved WFH' && (
                            <Button
                                sx={userStyle.buttondelete}
                                onClick={(e) => {
                                    rowData(params.data.id, params.data.name);
                                }}
                            >
                                <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
                            </Button>
                        ))}
                    {isUserRoleCompare?.includes("vapplyworkfromhome") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getviewCode(params.data.id);
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
                        </Button>
                    )}
                    {((isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin")) && ["Approved WFH", "Rejected"].includes(params.data.status)) ||
                        (isUserRoleCompare?.includes("iapplyworkfromhome") && (
                            <Button
                                sx={userStyle.buttonedit}
                                onClick={() => {
                                    getinfoCode(params.data.id);
                                }}
                            >
                                <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
                            </Button>
                        ))}
                    {!(isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin"))
                        ? null
                        : isUserRoleCompare?.includes("iapplyworkfromhome") && (
                            <Grid sx={{ display: 'flex' }}>
                                <Button
                                    variant="contained"
                                    style={{
                                        margin: '5px',
                                        backgroundColor: "red",
                                        minWidth: "15px",
                                        padding: "6px 5px",
                                    }}
                                    onClick={(e) => {
                                        getinfoCodeStatus(params.data.id);
                                        handleStatusOpen();
                                    }}
                                >
                                    <FaEdit style={{ color: "white", fontSize: "17px" }} />
                                </Button>
                            </Grid>
                        )}
                </Grid>
            ),
        },
    ];

    // Datatable
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQueryApplyLeave(value);
        applyNormalFilter(value);
        setFilteredRowData([]);
    };

    const applyNormalFilter = (searchValue) => {

        // Split the search query into individual terms
        const searchTerms = searchValue.toLowerCase().split(" ");

        // Modify the filtering logic to check each term
        const filtered = items?.filter((item) => {
            return searchTerms.every((term) =>
                Object.values(item).join(" ").toLowerCase().includes(term)
            );
        });
        setFilteredDataItems(filtered);
        setPageApplyLeave(1);
    };

    const applyAdvancedFilter = (filters, logicOperator) => {
        // Apply filtering logic with multiple conditions
        const filtered = items?.filter((item) => {
            return filters.reduce((acc, filter, index) => {
                const { column, condition, value } = filter;
                const itemValue = String(item[column])?.toLowerCase();
                const filterValue = String(value).toLowerCase();

                let match;
                switch (condition) {
                    case "Contains":
                        match = itemValue.includes(filterValue);
                        break;
                    case "Does Not Contain":
                        match = !itemValue?.includes(filterValue);
                        break;
                    case "Equals":
                        match = itemValue === filterValue;
                        break;
                    case "Does Not Equal":
                        match = itemValue !== filterValue;
                        break;
                    case "Begins With":
                        match = itemValue.startsWith(filterValue);
                        break;
                    case "Ends With":
                        match = itemValue.endsWith(filterValue);
                        break;
                    case "Blank":
                        match = !itemValue;
                        break;
                    case "Not Blank":
                        match = !!itemValue;
                        break;
                    default:
                        match = true;
                }

                // Combine conditions with AND/OR logic
                if (index === 0) {
                    return match; // First filter is applied directly
                } else if (logicOperator === "AND") {
                    return acc && match;
                } else {
                    return acc || match;
                }
            }, true);
        });

        setFilteredDataItems(filtered); // Update filtered data
        setAdvancedFilter(filters);
        // handleCloseSearchApplyLeave(); // Close the popover after search
    };

    // Undo filter funtion
    const handleResetSearch = () => {
        setAdvancedFilter(null);
        setSearchQueryApplyLeave("");
        setFilteredDataItems(items);
    };

    // Show filtered combination in the search bar
    const getSearchDisplay = () => {
        if (advancedFilter && advancedFilter.length > 0) {
            return advancedFilter.map((filter, index) => {
                let showname = columnDataTableApplyLeave.find(col => col.field === filter.column)?.headerName;
                return `${showname} ${filter.condition} "${filter.value}"`;
            }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
        }
        return searchQueryApplyLeave;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPagesApplyLeave) {
            setPageApplyLeave(newPage);
            gridRefTableApplyLeave.current.api.paginationGoToPage(newPage - 1);
        }
    };

    const handlePageSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setPageSizeApplyLeave(newSize);
        if (gridApi) {
            gridApi.paginationSetPageSize(newSize);
        }
    };

    // Show All Columns functionality
    const handleShowAllColumns = () => {
        const updatedVisibility = { ...columnVisibilityApplyLeave };
        for (const columnKey in updatedVisibility) {
            updatedVisibility[columnKey] = true;
        }
        setColumnVisibilityApplyLeave(updatedVisibility);
    };

    useEffect(() => {
        // Retrieve column visibility from localStorage (if available)
        const savedVisibility = localStorage.getItem("columnVisibilityApplyLeave");
        if (savedVisibility) {
            setColumnVisibilityApplyLeave(JSON.parse(savedVisibility));
        }
    }, []);

    useEffect(() => {
        // Save column visibility to localStorage whenever it changes
        localStorage.setItem("columnVisibilityApplyLeave", JSON.stringify(columnVisibilityApplyLeave));
    }, [columnVisibilityApplyLeave]);

    // // Function to filter columns based on search query
    const filteredColumns = columnDataTableApplyLeave.filter((column) => column.headerName.toLowerCase().includes(searchQueryManageApplyLeave.toLowerCase()));

    const DateFrom = (isUserRoleAccess.role.includes("HiringManager") || isUserRoleAccess.role.includes("Manager") || isUserRoleCompare.includes("lassignleaveapply")) && Accessdrop === "HR" ? formattedDatePresent : formattedDatet;

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Manage Columns functionality
    const toggleColumnVisibility = (field) => {
        if (!gridApi) return;

        setColumnVisibilityApplyLeave((prevVisibility) => {
            const newVisibility = !prevVisibility[field];

            // Update the visibility in the grid
            gridApi.setColumnVisible(field, newVisibility);

            return {
                ...prevVisibility,
                [field]: newVisibility,
            };
        });
    };

    const handleColumnMoved = useCallback(debounce((event) => {
        if (!event.columnApi) return;

        const visible_columns = event.columnApi.getAllColumns().filter(col => {
            const colState = event.columnApi.getColumnState().find(state => state.colId === col.colId);
            return colState && !colState.hide;
        }).map(col => col.colId);

        setColumnVisibilityApplyLeave((prevVisibility) => {
            const updatedVisibility = { ...prevVisibility };

            // Ensure columns that are visible stay visible
            Object.keys(updatedVisibility).forEach(colId => {
                updatedVisibility[colId] = visible_columns.includes(colId);
            });

            return updatedVisibility;
        });
    }, 300), []);

    const handleColumnVisible = useCallback((event) => {
        const colId = event.column.getColId();

        // Update visibility based on event, but only when explicitly triggered by grid
        setColumnVisibilityApplyLeave((prevVisibility) => ({
            ...prevVisibility,
            [colId]: event.visible, // Set visibility directly from the event
        }));
    }, []);

    // Excel
    const [fileFormat, setFormat] = useState('');
    let exportColumnNamescrt = ["Employee Id", "Employee Name", "Date", "Number of Shift", "Reason for WFH",]
    let exportRowValuescrt = ["employeeid", "employeename", "date", "noofshift", "reasonforworkfromhome",]

    // Print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Apply Work From Home",
        pageStyle: "print",
    });

    // image
    const handleCaptureImage = () => {
        if (gridRefImageApplyLeave.current) {
            domtoimage.toBlob(gridRefImageApplyLeave.current)
                .then((blob) => {
                    saveAs(blob, "Apply Work From Home.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    return (
        <Box>
            <Headtitle title={"Apply Work From Home"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                modulename="Leave&Permission"
                submodulename="Work From Home"
                mainpagename="Apply Work From Home"
                subpagename=""
                subsubpagename=""
            />
            {isUserRoleCompare?.includes("aapplyworkfromhome") && (
                <Box sx={userStyle.dialogbox}>
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Typography sx={userStyle.importheadtext}> Add Apply Work From Home</Typography>
                            </Grid>
                            {(isUserRoleAccess.role.includes("HiringManager") || isUserRoleAccess.role.includes("Manager") || isUserRoleCompare.includes("lassignleaveapply")) && (
                                <Grid item md={3} sm={6} xs={12}>
                                    <FormControl size="small" fullWidth>
                                        <Typography>Access</Typography>
                                        <Select
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            value={Accessdrop}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 200,
                                                    },
                                                },
                                            }}
                                            onChange={(e) => {
                                                setAccesDrop(e.target.value);
                                                setApplyWfh({ ...applyWfh, durationtype: 'Random', date: "", todate: "" });
                                                setAllUsers([]);
                                                setGetSelectedDates([]);
                                            }}
                                        >
                                            <MenuItem value={"Employee"}>Self</MenuItem>
                                            <MenuItem value={"HR"}>Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>
                        <br />
                        <Grid container spacing={2}>
                            {Accessdrop === "HR" ? (
                                <>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Company<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={accessbranch?.map(data => ({
                                                    label: data.company,
                                                    value: data.company,
                                                })).filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
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
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Branch<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={accessbranch?.filter(
                                                    (comp) =>
                                                        valueCompanyCat?.includes(comp.company)
                                                )?.map(data => ({
                                                    label: data.branch,
                                                    value: data.branch,
                                                })).filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
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
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Unit<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={accessbranch?.filter(
                                                    (comp) =>
                                                        valueCompanyCat?.includes(comp.company) && valueBranchCat?.includes(comp.branch)
                                                )?.map(data => ({
                                                    label: data.unit,
                                                    value: data.unit,
                                                })).filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                                value={selectedOptionsUnit}
                                                onChange={(e) => {
                                                    handleUnitChange(e);
                                                }}
                                                valueRenderer={customValueRendererUnit}
                                                labelledBy="Please Select Unit"
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Team<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={allTeam
                                                    ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit))
                                                    .map((u) => ({
                                                        ...u,
                                                        label: u.teamname,
                                                        value: u.teamname,
                                                    }))}
                                                value={selectedOptionsTeam}
                                                onChange={(e) => {
                                                    handleTeamChange(e);
                                                }}
                                                valueRenderer={customValueRendererTeam}
                                                labelledBy="Please Select Team"
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Employee Name<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                // options={empnames}
                                                options={empnames
                                                    ?.filter(
                                                        (u) =>
                                                            valueCompanyCat?.includes(u.company) &&
                                                            valueBranchCat?.includes(u.branch) &&
                                                            valueUnitCat?.includes(u.unit) &&
                                                            valueTeamCat?.includes(u.team)
                                                    )
                                                    .map((u) => ({
                                                        ...u,
                                                        label: u.companyname,
                                                        value: u.companyname,
                                                    }))}
                                                styles={colourStyles}
                                                value={{ label: applyWfh.employeename, value: applyWfh.employeename }}
                                                onChange={(e) => {
                                                    setApplyWfh({ ...applyWfh, employeename: e.value, employeeid: e.empcode, reportingto: e.reportingto, department: e.department, designation: e.designation, doj: e.doj, boardingLog: e.boardingLog, workmode: e.workmode, date: "", todate: "", noofshift: '' });
                                                    setAllUsers([]);
                                                    setGetSelectedDates([]);
                                                    fetchAssignWorkfromhome(e, e.doj);
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Employee ID </Typography>
                                            <OutlinedInput id="component-outlined" type="text" value={applyWfh.employeeid} />
                                        </FormControl>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Employee Name</Typography>
                                            <OutlinedInput id="component-outlined" type="text" value={isUserRoleAccess.companyname} />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Employee ID </Typography>
                                            <OutlinedInput id="component-outlined" type="text" value={isUserRoleAccess.empcode} />
                                        </FormControl>
                                    </Grid>
                                </>
                            )}


                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Remaining WFH Day </Typography>
                                    <OutlinedInput id="component-outlined" type="text"
                                        value={remainingWorkFromHomeDays}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}></Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Duration Type<b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <Selects
                                        size="small"
                                        options={durationOptions}
                                        styles={colourStyles}
                                        value={{ label: applyWfh.durationtype, value: applyWfh.durationtype }}
                                        onChange={(e) => {
                                            setApplyWfh({ ...applyWfh, durationtype: e.value, date: '', todate: '', noofshift: '' });
                                            setAllUsers([]);
                                            setGetSelectedDates([]);
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            {applyWfh.durationtype === 'Random' ? (
                                <>
                                    <Grid item md={4} xs={12} sm={12}>
                                        <Grid container spacing={1.2} marginTop={1}>
                                            <Grid item md={1.5} xs={12} sm={12} marginTop={1}>
                                                <Typography>
                                                    Date<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                            </Grid>
                                            <Grid item md={4.5} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <OutlinedInput
                                                        id="component-outlined"
                                                        type="date"
                                                        value={applyWfh.date}
                                                        onChange={(e) => {
                                                            if (leaveRestriction === true) {
                                                                setApplyWfh({ ...applyWfh, date: e.target.value })
                                                            } else {
                                                                setApplyWfh({ ...applyWfh, date: isUserRoleAccess.role.includes("SuperAdmin") || isUserRoleAccess.role.includes("Manager") ? e.target.value : (new Date(e.target.value) - new Date(DateFrom)) / (1000 * 3600 * 24) < 0 ? "" : e.target.value });
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item md={1} sm={12} xs={12} marginTop={1}>
                                                <Button variant="contained" color="success" type="button" sx={{ height: "30px", minWidth: "30px", padding: "6px 10px", marginTop: '4px' }}
                                                    onClick={(e) => {
                                                        if (Accessdrop === 'HR' && applyWfh.employeename === 'Please Select Employee Name') {
                                                            setPopupContentMalert("Please Select Employee Name");
                                                            setPopupSeverityMalert("warning");
                                                            handleClickOpenPopupMalert();
                                                        } else {
                                                            fetchUsersRandom((Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode), applyWfh.date)
                                                        }
                                                    }} >
                                                    <FaPlus />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item md={5} xs={12} sm={12}></Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item md={5} xs={12} sm={12}>
                                        <Grid container spacing={1.2} marginTop={1}>
                                            <Grid item md={1.5} xs={12} sm={12} marginTop={1}>
                                                <Typography>
                                                    Date<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                            </Grid>
                                            <Grid item md={4.5} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <OutlinedInput
                                                        id="component-outlined"
                                                        type="date"
                                                        value={applyWfh.date}
                                                        onChange={(e) => {
                                                            if (leaveRestriction === true) {
                                                                setApplyWfh({ ...applyWfh, date: e.target.value })
                                                            } else {
                                                                setApplyWfh({ ...applyWfh, date: isUserRoleAccess.role.includes("SuperAdmin") || isUserRoleAccess.role.includes("Manager") ? e.target.value : (new Date(e.target.value) - new Date(DateFrom)) / (1000 * 3600 * 24) < 0 ? "" : e.target.value });

                                                                //   fetchUsers((Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode), e.target.value, applyWfh.todate)
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item md={1} xs={12} sm={12} marginTop={1}>
                                                <Typography>To</Typography>
                                            </Grid>
                                            <Grid item md={4.5} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <OutlinedInput
                                                        id="component-outlined"
                                                        type="date"
                                                        value={applyWfh.todate}
                                                        onChange={(e) => {
                                                            if (leaveRestriction === true) {
                                                                setApplyWfh({ ...applyWfh, todate: e.target.value })
                                                            } else {
                                                                setApplyWfh({ ...applyWfh, todate: isUserRoleAccess.role.includes("SuperAdmin") || isUserRoleAccess.role.includes("Manager") ? (new Date(e.target.value) >= new Date(applyWfh.date) ? e.target.value : "") : (new Date(e.target.value) - new Date(DateFrom)) / (1000 * 3600 * 24) < 0 ? "" : new Date(e.target.value) >= new Date(applyWfh.date) ? e.target.value : "" });
                                                                // setApplyWfh({ ...applyWfh, todate: e.target.value });
                                                                // fetchUsers((Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode), applyWfh.date, e.target.value)
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item md={0.5} sm={12} xs={12} marginTop={1}>
                                                <Button variant="contained" color="success" type="button" sx={{ height: "30px", minWidth: "30px", padding: "6px 10px", marginTop: '-2px' }}
                                                    onClick={(e) => {
                                                        if (Accessdrop === 'HR' && applyWfh.employeename === 'Please Select Employee Name') {
                                                            setPopupContentMalert("Please Select Employee Name");
                                                            setPopupSeverityMalert("warning");
                                                            handleClickOpenPopupMalert();
                                                        } else {
                                                            fetchUsers((Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode), applyWfh.date, applyWfh.todate)
                                                        }
                                                    }} >
                                                    <FaPlus />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item md={4} xs={12} sm={12}></Grid>
                                </>
                            )}
                            {allUsers.length > 0 ? <>
                                <Grid item md={6} sm={12} xs={12}>
                                    <>
                                        {allUsers.length > 0 ?
                                            (<Grid container>
                                                <Grid item md={5} sm={12} xs={12}>
                                                    <Typography>Shift</Typography>
                                                </Grid>
                                                <Grid item md={4} sm={12} xs={12}>
                                                    <Typography>WFH<b style={{ color: "red" }}>*</b></Typography>
                                                </Grid>
                                                <Grid item md={2} sm={12} xs={12}>
                                                    <Typography>Count<b style={{ color: "red" }}>*</b></Typography>
                                                </Grid>
                                            </Grid>)
                                            : null}
                                        {allUsers &&
                                            allUsers.map((column, index) => (
                                                <Grid container key={index}>
                                                    <React.Fragment key={index}>
                                                        <Grid item md={5} sm={6} xs={12} fullWidth>
                                                            <Box sx={{ border: '1px solid #80808094', font: 'inherit', color: 'currentColor', fontSize: '14px', lineHeight: 1.3, padding: '8.5px 14px', borderRadius: '3.5px', display: 'block', background: '#80808030', margin: '0.5px' }}>
                                                                {`${column.formattedDate} (${column.shift})`}
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={4} sm={6} xs={12} fullWidth>
                                                            <Box sx={{ display: 'block', margin: '0.5px' }}>
                                                                <Selects
                                                                    size="small"
                                                                    options={leaveStatusOptions}
                                                                    styles={colourStyles}
                                                                    value={leaveStatusOptions.find(option => option.value === column.leavestatus)}
                                                                    onChange={(selectedOption) => multiLeaveStatusInputs(index, selectedOption.value)}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={2} sm={6} xs={12} fullWidth>
                                                            <Box sx={{ display: 'block', margin: '0.5px' }}>
                                                                <OutlinedInput
                                                                    id="component-outlined"
                                                                    type="text"
                                                                    value={column.shiftcount}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={1} sm={6} xs={1} sx={{ display: 'flex' }}>
                                                            <Button variant="contained" color="error" type="button" onClick={(e) => handleDelete(index)} sx={{ height: '30px', minWidth: '30px', marginTop: '4px', padding: '6px 10px' }}>x</Button>
                                                        </Grid>
                                                    </React.Fragment>

                                                </Grid>
                                            ))}
                                    </>
                                </Grid>
                                <Grid item md={6} sm={12} xs={12}></Grid>
                            </> : null}
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Number of Shift</Typography>
                                    <OutlinedInput id="component-outlined" type="text" value={applyWfh.noofshift}
                                    //  onChange={(e) => {
                                    //   setApplyWfh({ ...applyWfh, reasonforworkfromhome: e.target.value });
                                    // }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12}></Grid>
                            <br />
                            <Grid item md={4} xs={12} sm={12}>
                                <Grid container spacing={2}>
                                    <Grid item md={12} sm={12} xs={12}>
                                        <> <Button variant="outlined" component="label" style={{ justifyContent: "center !important" }}>
                                            <div> Attach Document <CloudUploadIcon sx={{ paddingTop: '5px' }} />
                                            </div>
                                            <input hidden type="file" multiple onChange={handleFileUpload} accept=" application/pdf, image/*" /><b style={{ color: "red" }}>*</b>
                                        </Button>
                                        </>
                                    </Grid>
                                    <>
                                        <br /><br />
                                        <Grid item lg={6} md={6} sm={12} xs={12} sx={{ padding: '10px', }}>
                                            <br />
                                            {files?.length > 0 &&
                                                (files.map((file, index) => (
                                                    <>
                                                        <Grid container spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
                                                            <Grid item lg={6} md={6} sm={6} xs={6}>
                                                                <Typography>{file.name}</Typography>
                                                            </Grid>
                                                            <Grid item lg={2} md={2} sm={2} xs={2}>
                                                                <VisibilityOutlinedIcon style={{ fontsize: "large", color: "#357AE8", marginLeft: "60px", marginTop: "-20px", cursor: "pointer" }} onClick={() => renderFilePreview(file)} />
                                                            </Grid>

                                                            <Grid item lg={2} md={2} sm={2} xs={2}>
                                                                <Button style={{ fontsize: "large", color: "#FF0000", marginLeft: "60px", marginTop: "-20px", cursor: "pointer" }} onClick={() => handleFileDelete(index)} size="small"  ><CancelIcon /></Button>

                                                            </Grid>
                                                        </Grid>
                                                    </>
                                                )))}
                                        </Grid>
                                    </>
                                    <br />
                                </Grid>
                            </Grid>
                            <br />
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Reason for WFH<b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <TextareaAutosize
                                        aria-label="minimum height"
                                        minRows={5}
                                        value={applyWfh.reasonforworkfromhome}
                                        onChange={(e) => {
                                            setApplyWfh({ ...applyWfh, reasonforworkfromhome: e.target.value });
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Reporting To </Typography>
                                    <OutlinedInput id="component-outlined" type="text" value={Accessdrop === "HR" ? applyWfh.reportingto : isUserRoleAccess.reportingto} />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid item lg={1} md={2} sm={2} xs={12} >
                                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0, } })}>
                                    {/* {isUserRoleCompare?.includes("aapplyworkfromhome") && ( */}
                                    {/* <Button variant="contained" color="primary" onClick={handleSubmit}>
                  Submit
                </Button> */}
                                    <LoadingButton loading={btnSubmit} variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
                                        Submit
                                    </LoadingButton>
                                    {/* )} */}
                                </Box>
                            </Grid>
                            <Grid item lg={1} md={2} sm={2} xs={12}>
                                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0, } })}>
                                    {/* {isUserRoleCompare?.includes("aapplyworkfromhome") && ( */}
                                    <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                                        Clear
                                    </Button>
                                </Box>
                                {/* )} */}
                            </Grid>
                        </Grid>
                    </>
                </Box>
            )}
            <br />
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes("lapplyworkfromhome") && (
                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={12} sm={12} xs={12}>
                                <Typography sx={userStyle.importheadtext}>Apply Work From Home List</Typography>
                            </Grid>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label>Show entries:</label>
                                    <Select
                                        id="pageSizeSelect"
                                        value={pageSizeApplyLeave}
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
                                        <MenuItem value={applyleaves?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Box>
                                    {isUserRoleCompare?.includes("excelapplyworkfromhome") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>

                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvapplyworkfromhome") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printapplyworkfromhome") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfapplyworkfromhome") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)
                                                }}
                                            ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imageapplyworkfromhome") && (
                                        <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                                            {" "}
                                            <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item md={2} xs={6} sm={6}>
                                <FormControl fullWidth size="small">
                                    <OutlinedInput size="small"
                                        id="outlined-adornment-weight"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <FaSearch />
                                            </InputAdornment>
                                        }
                                        endAdornment={
                                            <InputAdornment position="end">
                                                {advancedFilter && (
                                                    <IconButton onClick={handleResetSearch}>
                                                        <MdClose />
                                                    </IconButton>
                                                )}
                                                <Tooltip title="Show search options">
                                                    <span>
                                                        <IoMdOptions style={{ cursor: 'pointer', }} onClick={handleClickSearchApplyLeave} />
                                                    </span>
                                                </Tooltip>
                                            </InputAdornment>}
                                        aria-describedby="outlined-weight-helper-text"
                                        inputProps={{ 'aria-label': 'weight', }}
                                        type="text"
                                        value={getSearchDisplay()}
                                        onChange={handleSearchChange}
                                        placeholder="Type to search..."
                                        disabled={!!advancedFilter}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid> <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>  Show All Columns  </Button>  &ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsApplyLeave}>  Manage Columns  </Button>
                        {/* {isUserRoleCompare?.includes("bdapplyworkfromhome") && (
              <>
                <Button variant="contained" color="error" onClick={handleClickOpenalert}>
                  Bulk Delete
                </Button>
              </>
            )} */}  <br />  <br />
                        {!applyWfhCheck ? (
                            <>
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box sx={{ width: "100%", }} className={"ag-theme-quartz"} ref={gridRefImageApplyLeave} >
                                    <AgGridReact
                                        rowData={filteredDataItems}
                                        columnDefs={columnDataTableApplyLeave.filter((column) => columnVisibilityApplyLeave[column.field])}
                                        ref={gridRefTableApplyLeave}
                                        defaultColDef={defaultColDef}
                                        domLayout={"autoHeight"}
                                        getRowStyle={getRowStyle}
                                        pagination={true}
                                        paginationPageSize={pageSizeApplyLeave}
                                        onPaginationChanged={onPaginationChanged}
                                        onGridReady={onGridReady}
                                        onColumnMoved={handleColumnMoved}
                                        onColumnVisible={handleColumnVisible}
                                        onFilterChanged={onFilterChanged}
                                        // suppressPaginationPanel={true}
                                        suppressSizeToFit={true}
                                        suppressAutoSize={true}
                                        suppressColumnVirtualisation={true}
                                        colResizeDefault={"shift"}
                                    />
                                </Box>

                            </>
                        )}
                    </Box>
                </>
            )}
            {/* Manage Column */}
            <Popover
                id={idApplyLeave}
                open={isManageColumnsOpenApplyLeave}
                anchorEl={anchorElApplyLeave}
                onClose={handleCloseManageColumnsApplyLeave}
                anchorOrigin={{ vertical: "bottom", horizontal: "left", }}
            >
                <ManageColumnsContent
                    handleClose={handleCloseManageColumnsApplyLeave}
                    searchQuery={searchQueryManageApplyLeave}
                    setSearchQuery={setSearchQueryManageApplyLeave}
                    filteredColumns={filteredColumns}
                    columnVisibility={columnVisibilityApplyLeave}
                    toggleColumnVisibility={toggleColumnVisibility}
                    setColumnVisibility={setColumnVisibilityApplyLeave}
                    initialColumnVisibility={initialColumnVisibilityApplyLeave}
                    columnDataTable={columnDataTableApplyLeave}
                />
            </Popover>

            {/* Search Bar */}
            <Popover
                id={idSearchApplyLeave}
                open={openSearchApplyLeave}
                anchorEl={anchorElSearchApplyLeave}
                onClose={handleCloseSearchApplyLeave}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
            >
                <AdvancedSearchBar columns={columnDataTableApplyLeave?.filter(data => data.field !== 'actions')} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryApplyLeave} handleCloseSearch={handleCloseSearchApplyLeave} />
            </Popover>

            {/* Edit DIALOG */}
            <Dialog
                open={isEditOpen}
                onClose={handleCloseModEdit}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth={true}
                maxWidth="lg"
                sx={{ marginTop: '95px' }}
            // sx={{
            //   overflow: "visible",
            //   "& .MuiPaper-root": {
            //     overflow: "visible",
            //   },
            // }}
            >
                <Box sx={{ padding: "20px" }}>
                    <>
                        <form >
                            {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                            <Grid container spacing={2}>
                                <Grid item md={8} xs={12} sm={12}>
                                    <Typography sx={userStyle.HeaderText}>Edit Apply Work From Home</Typography>
                                </Grid>
                                {(isUserRoleAccess.role.includes("HiringManager") || isUserRoleAccess.role.includes("Manager") || isUserRoleCompare.includes("lassignleaveapply")) && (
                                    <Grid item md={3} sm={6} xs={12}>
                                        <FormControl size="small" fullWidth>
                                            <Typography>Access</Typography>
                                            <Select
                                                labelId="demo-select-small"
                                                id="demo-select-small"
                                                value={AccessdropEdit}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 200,
                                                        },
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setAccesDropEdit(e.target.value);
                                                    setAppWfhEdit({ ...appWfhEdit, date: "", todate: "" });
                                                }}
                                            >
                                                <MenuItem value={"Employee"}>Self</MenuItem>
                                                <MenuItem value={"HR"}>Other</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                            </Grid>
                            <br />
                            <Grid container spacing={2}>
                                {AccessdropEdit === "HR" ? (
                                    <>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Company<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={companyOption}
                                                    value={selectedOptionsCompanyEdit}
                                                    onChange={(e) => {
                                                        handleCompanyChangeEdit(e);
                                                    }}
                                                    valueRenderer={customValueRendererCompanyEdit}
                                                    labelledBy="Please Select Company"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Branch<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={branchOption
                                                        ?.filter((u) => valueCompanyCatEdit?.includes(u.company))
                                                        .map((u) => ({
                                                            ...u,
                                                            label: u.name,
                                                            value: u.name,
                                                        }))}
                                                    value={selectedOptionsBranchEdit}
                                                    onChange={(e) => {
                                                        handleBranchChangeEdit(e);
                                                    }}
                                                    valueRenderer={customValueRendererBranchEdit}
                                                    labelledBy="Please Select Branch"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Unit<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={unitOption
                                                        ?.filter((u) => valueBranchCatEdit?.includes(u.branch))
                                                        .map((u) => ({
                                                            ...u,
                                                            label: u.name,
                                                            value: u.name,
                                                        }))}
                                                    value={selectedOptionsUnitEdit}
                                                    onChange={(e) => {
                                                        handleUnitChangeEdit(e);
                                                    }}
                                                    valueRenderer={customValueRendererUnitEdit}
                                                    labelledBy="Please Select Unit"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Team<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={teamOption
                                                        ?.filter((u) => valueUnitCatEdit?.includes(u.unit))
                                                        .map((u) => ({
                                                            ...u,
                                                            label: u.teamname,
                                                            value: u.teamname,
                                                        }))}
                                                    value={selectedOptionsTeamEdit}
                                                    onChange={(e) => {
                                                        handleTeamChangeEdit(e);
                                                    }}
                                                    valueRenderer={customValueRendererTeamEdit}
                                                    labelledBy="Please Select Team"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={12}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Employee Name<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <Selects
                                                    // options={empnamesEdit}
                                                    options={empnamesEdit
                                                        ?.filter(
                                                            (u) =>
                                                                valueCompanyCatEdit?.includes(u.company) &&
                                                                valueBranchCatEdit?.includes(u.branch) &&
                                                                valueUnitCatEdit?.includes(u.unit) &&
                                                                valueTeamCatEdit?.includes(u.team)
                                                        )
                                                        .map((u) => ({
                                                            ...u,
                                                            label: u.companyname,
                                                            value: u.companyname,
                                                        }))}
                                                    styles={colourStyles}
                                                    value={{ label: appWfhEdit.employeename, value: appWfhEdit.employeename }}
                                                    onChange={(e) => {
                                                        setAppWfhEdit({ ...appWfhEdit, employeename: e.value, employeeid: e.empcode, reportingto: e.reportingto, department: e.department, designation: e.designation, doj: e.doj, weekoff: e.weekoff, workmode: e.workmode, date: "", todate: "" });
                                                        setAvailableDaysEdit('');
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={12}>
                                            <FormControl fullWidth size="small">
                                                <Typography>Employee ID </Typography>
                                                <OutlinedInput id="component-outlined" type="text" value={appWfhEdit.employeeid} />
                                            </FormControl>
                                        </Grid>
                                    </>
                                ) : (
                                    <>
                                        <Grid item md={3} xs={12} sm={12}>
                                            <FormControl fullWidth size="small">
                                                <Typography>Employee Name</Typography>
                                                <OutlinedInput id="component-outlined" type="text" value={isUserRoleAccess.companyname} />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={4} xs={12} sm={12}>
                                            <FormControl fullWidth size="small">
                                                <Typography>Employee ID </Typography>
                                                <OutlinedInput id="component-outlined" type="text" value={isUserRoleAccess.empcode} />
                                            </FormControl>
                                        </Grid>
                                    </>
                                )}

                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Remaining WFH Day </Typography>
                                        <OutlinedInput id="component-outlined" type="text" value={appWfhEdit.availabledays ? appWfhEdit.availabledays : availableDaysEdit} />
                                    </FormControl>
                                </Grid>
                                <br />
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Duration Type<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <OutlinedInput id="component-outlined" type="text" value={appWfhEdit.durationtype} />

                                    </FormControl>
                                </Grid>
                                {appWfhEdit.durationtype === 'Random' ? (
                                    <>
                                        <Grid item md={4} xs={12} sm={12}>
                                            <Grid container spacing={1.2} marginTop={1}>
                                                <Grid item md={1.5} xs={12} sm={12} marginTop={1}>
                                                    <Typography>
                                                        Date<b style={{ color: "red" }}>*</b>
                                                    </Typography>
                                                </Grid>
                                                <Grid item md={4.5} xs={12} sm={12}>
                                                    <FormControl fullWidth size="small">
                                                        <OutlinedInput
                                                            id="component-outlined"
                                                            type="date"
                                                            value={appWfhEdit.date}
                                                            onChange={(e) => {
                                                                if (leaveRestrictionEdit === true) {
                                                                    setAppWfhEdit({ ...appWfhEdit, date: e.target.value })
                                                                } else {
                                                                    setAppWfhEdit({ ...appWfhEdit, date: isUserRoleAccess.role.includes("SuperAdmin") || isUserRoleAccess.role.includes("Manager") ? e.target.value : (new Date(e.target.value) - new Date(DateFrom)) / (1000 * 3600 * 24) < 0 ? "" : e.target.value });
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item md={1} sm={12} xs={12} marginTop={1}>
                                                    <Button variant="contained" color="success" type="button" sx={{ height: "30px", minWidth: "30px", padding: "6px 10px", marginTop: '4px' }}
                                                        onClick={(e) => {
                                                            if (AccessdropEdit === 'HR' && appWfhEdit.employeename === 'Please Select Employee Name') {
                                                                setPopupContentMalert("Please Select Employee Name");
                                                                setPopupSeverityMalert("warning");
                                                                handleClickOpenPopupMalert();
                                                            } else {
                                                                fetchUsersRandomEdit((AccessdropEdit === 'HR' ? appWfhEdit.employeeid : isUserRoleAccess.empcode), appWfhEdit.date)
                                                            }
                                                        }} >
                                                        <FaPlus />
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </>
                                ) : (
                                    <>
                                        <Grid item md={5} xs={12} sm={12}>
                                            <Grid container spacing={1.2} marginTop={1}>
                                                <Grid item md={1.5} xs={12} sm={12} marginTop={1}>
                                                    <Typography>
                                                        Date<b style={{ color: "red" }}>*</b>
                                                    </Typography>
                                                </Grid>
                                                <Grid item md={4.5} xs={12} sm={12}>
                                                    <FormControl fullWidth size="small">
                                                        <OutlinedInput
                                                            id="component-outlined"
                                                            type="date"
                                                            value={appWfhEdit.date}
                                                            onChange={(e) => {
                                                                if (leaveRestrictionEdit === true) {
                                                                    setAppWfhEdit({ ...appWfhEdit, date: e.target.value })
                                                                } else {
                                                                    setAppWfhEdit({ ...appWfhEdit, date: isUserRoleAccess.role.includes("SuperAdmin") || isUserRoleAccess.role.includes("Manager") ? e.target.value : (new Date(e.target.value) - new Date(DateFrom)) / (1000 * 3600 * 24) < 0 ? "" : e.target.value });

                                                                    //   fetchUsers((Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode), e.target.value, applyWfh.todate)
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item md={1} xs={12} sm={12} marginTop={1}>
                                                    <Typography>To</Typography>
                                                </Grid>
                                                <Grid item md={4.5} xs={12} sm={12}>
                                                    <FormControl fullWidth size="small">
                                                        <OutlinedInput
                                                            id="component-outlined"
                                                            type="date"
                                                            value={appWfhEdit.todate}
                                                            onChange={(e) => {
                                                                if (leaveRestrictionEdit === true) {
                                                                    setAppWfhEdit({ ...appWfhEdit, todate: e.target.value })
                                                                } else {
                                                                    setAppWfhEdit({ ...appWfhEdit, todate: isUserRoleAccess.role.includes("SuperAdmin") || isUserRoleAccess.role.includes("Manager") ? (new Date(e.target.value) >= new Date(appWfhEdit.date) ? e.target.value : "") : (new Date(e.target.value) - new Date(DateFrom)) / (1000 * 3600 * 24) < 0 ? "" : new Date(e.target.value) >= new Date(appWfhEdit.date) ? e.target.value : "" });
                                                                    // setApplyWfh({ ...applyWfh, todate: e.target.value });
                                                                    // fetchUsers((Accessdrop === 'HR' ? applyWfh.employeeid : isUserRoleAccess.empcode), applyWfh.date, e.target.value)
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item md={0.5} sm={12} xs={12} marginTop={1}>
                                                    <Button variant="contained" color="success" type="button" sx={{ height: "30px", minWidth: "30px", padding: "6px 10px", marginTop: '-2px' }}
                                                        onClick={(e) => {
                                                            if (AccessdropEdit === 'HR' && appWfhEdit.employeename === 'Please Select Employee Name') {
                                                                setPopupContentMalert("Please Select Employee Name");
                                                                setPopupSeverityMalert("warning");
                                                                handleClickOpenPopupMalert();
                                                            } else {
                                                                fetchUsersEdit((AccessdropEdit === 'HR' ? appWfhEdit.employeeid : isUserRoleAccess.empcode), appWfhEdit.date, appWfhEdit.todate)
                                                            }
                                                        }} >
                                                        <FaPlus />
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </>
                                )}
                                <br />
                                <Grid item md={8} xs={12} sm={12}></Grid>
                                <Grid item md={6} sm={12} xs={12}>
                                    <>
                                        {allUsersEdit?.length > 0 ?
                                            (<Grid container>
                                                <Grid item md={5} sm={12} xs={12}>
                                                    <Typography>Shift</Typography>
                                                </Grid>
                                                <Grid item md={4} sm={12} xs={12}>
                                                    <Typography>WFH<b style={{ color: "red" }}>*</b></Typography>
                                                </Grid>
                                                <Grid item md={2} sm={12} xs={12}>
                                                    <Typography>Count<b style={{ color: "red" }}>*</b></Typography>
                                                </Grid>
                                            </Grid>)
                                            : null}
                                        {allUsersEdit &&
                                            allUsersEdit?.map((column, index) => (
                                                <Grid container key={index}>
                                                    <React.Fragment key={index}>
                                                        <Grid item md={5} sm={6} xs={12} fullWidth>
                                                            <Box sx={{ border: '1px solid #80808094', font: 'inherit', color: 'currentColor', fontSize: '14px', lineHeight: 1.3, padding: '8.5px 14px', borderRadius: '3.5px', display: 'block', background: '#80808030', margin: '0.5px' }}>
                                                                {`${column.formattedDate} (${column.shift})`}
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={4} sm={6} xs={12} fullWidth>
                                                            <Box sx={{ display: 'block', margin: '0.5px' }}>
                                                                <Selects
                                                                    size="small"
                                                                    options={leaveStatusOptions}
                                                                    styles={colourStyles}
                                                                    value={leaveStatusOptions.find(option => option.value === column.leavestatus)}
                                                                    onChange={(selectedOption) => multiLeaveStatusInputsEdit(index, selectedOption.value)}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={2} sm={6} xs={12} fullWidth>
                                                            <Box sx={{ display: 'block', margin: '0.5px' }}>
                                                                <OutlinedInput
                                                                    id="component-outlined"
                                                                    type="text"
                                                                    value={column.shiftcount}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={1} sm={6} xs={1} sx={{ display: 'flex' }}>
                                                            <Button variant="contained" color="error" type="button" onClick={(e) => handleDeleteEdit(index)} sx={{ height: '30px', minWidth: '30px', marginTop: '4px', padding: '6px 10px' }}>x</Button>
                                                        </Grid>
                                                    </React.Fragment>

                                                </Grid>
                                            ))}
                                    </>
                                </Grid>
                                <Grid item md={6} sm={12} xs={12}></Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Number of Shift</Typography>
                                        <OutlinedInput id="component-outlined" type="text" value={appWfhEdit.noofshift}
                                        //  onChange={(e) => {
                                        //   setApplyWfh({ ...applyWfh, reasonforworkfromhome: e.target.value });
                                        // }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={8} xs={12} sm={12}></Grid>

                                <br />
                                <Grid item md={4} xs={12} sm={12}>
                                    <Grid container spacing={2}>
                                        <Grid item md={12} sm={12} xs={12}>
                                            <> <Button variant="outlined" component="label" style={{ justifyContent: "center !important" }}>
                                                <div> Attach Document <CloudUploadIcon sx={{ paddingTop: '5px' }} />
                                                </div>
                                                <input hidden type="file" multiple onChange={handleFileUploadEdit} accept=" application/pdf, image/*" /><b style={{ color: "red" }}>*</b>
                                            </Button>
                                            </>
                                        </Grid>
                                        <>
                                            <br /><br />
                                            <Grid item lg={6} md={6} sm={12} xs={12} sx={{ padding: '10px', }}>
                                                <br />
                                                {fileEdit?.length > 0 &&
                                                    (fileEdit.map((file, index) => (
                                                        <>
                                                            <Grid container spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
                                                                <Grid item lg={6} md={6} sm={6} xs={6}>
                                                                    <Typography>{file.name}</Typography>
                                                                </Grid>
                                                                <Grid item lg={2} md={2} sm={2} xs={2}>
                                                                    {/* <Button><VisibilityOutlinedIcon style={{ fontsize: "large", color: "#357AE8", marginLeft: "60px", marginTop: "-20px",  }} onClick={() => renderFilePreviewEdit(file)} /></Button> */}
                                                                    <Button style={{ fontsize: "large", color: "#357AE8", marginLeft: "60px", marginTop: "-20px", cursor: "pointer" }} onClick={() => renderFilePreviewFileEdit(file)} size="small"  ><VisibilityOutlinedIcon /></Button>
                                                                </Grid>
                                                                <Grid item lg={2} md={2} sm={2} xs={2}>
                                                                    <Button style={{ fontsize: "large", color: "#FF0000", marginLeft: "60px", marginTop: "-20px", cursor: "pointer" }} onClick={() => handleFileDeleteFileEdit(index)} size="small"  ><CancelIcon /></Button>

                                                                </Grid>
                                                            </Grid>
                                                        </>
                                                    )))}
                                            </Grid>
                                        </>
                                        <br />
                                    </Grid>
                                </Grid>
                                <br />

                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Reason for WFH<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <TextareaAutosize
                                            aria-label="minimum height"
                                            minRows={5}
                                            value={appWfhEdit.reasonforworkfromhome}
                                            onChange={(e) => {
                                                setAppWfhEdit({ ...appWfhEdit, reasonforworkfromhome: e.target.value });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Reporting To </Typography>
                                        <OutlinedInput id="component-outlined" type="text" value={AccessdropEdit === "HR" ? appWfhEdit.reportingto : isUserRoleAccess.reportingto} />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <br />
                            <br />

                            <Grid container spacing={2}>
                                <Grid item md={6} xs={6} sm={6}>
                                    <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={editSubmit}>
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

            {/* view model */}
            <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" sx={{ marginTop: '95px' }}>
                <Box sx={{ width: "950px", padding: "20px 50px" }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Apply Work From Home</Typography>
                        <br /> <br />
                        <Grid container spacing={2}>
                            {(isUserRoleAccess.role.includes("HiringManager") || isUserRoleAccess.role.includes("Manager") || isUserRoleCompare.includes("lassignleaveapply")) && (
                                <Grid item md={3} sm={6} xs={12}>
                                    <Typography variant="h6">Access</Typography>
                                    <Typography>{appWfhEdit.access}</Typography>
                                </Grid>
                            )}
                        </Grid>
                        <br />
                        <Grid container spacing={2}>
                            {appWfhEdit.access === "HR" ? (
                                <>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6"> Company </Typography>
                                            <Typography>
                                                {Array.isArray(selectedOptionsCompanyEdit) ? selectedOptionsCompanyEdit.map((item, index) => (`${index + 1}. ${item.value} `)) : ""}
                                            </Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6"> Branch</Typography>
                                            <Typography>
                                                {Array.isArray(selectedOptionsBranchEdit) ? selectedOptionsBranchEdit.map((item, index) => (`${index + 1}. ${item.value} `)) : ""}
                                            </Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6"> Unit  </Typography>
                                            <Typography>
                                                {Array.isArray(selectedOptionsUnitEdit) ? selectedOptionsUnitEdit.map((item, index) => (`${index + 1}. ${item.value} `)) : ""}
                                            </Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6"> Team </Typography>
                                            <Typography>
                                                {Array.isArray(selectedOptionsTeamEdit) ? selectedOptionsTeamEdit.map((item, index) => (`${index + 1}. ${item.value} `)) : ""}
                                            </Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Employee Name</Typography>
                                            <Typography>{appWfhEdit.employeename}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Employee ID </Typography>
                                            <Typography>{appWfhEdit.employeeid}</Typography>
                                        </FormControl>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Employee Name</Typography>
                                            <Typography>{appWfhEdit.employeename}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Employee ID </Typography>
                                            <Typography>{appWfhEdit.employeeid}</Typography>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}

                            <br />
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Duration Type</Typography>
                                    <Typography>{appWfhEdit.durationtype}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Date</Typography>
                                    <Typography>{appWfhEdit.date + ", "}</Typography>
                                </FormControl>
                            </Grid>
                            <br />
                            <Grid item md={8} xs={12} sm={12}></Grid>
                            <Grid item md={6} sm={12} xs={12}>
                                <>
                                    {allUsersEdit?.length > 0 ?
                                        (<Grid container>
                                            <Grid item md={5} sm={6} xs={12}>
                                                <Typography variant="h6">Shift</Typography>
                                            </Grid>
                                            <Grid item md={4} sm={6} xs={12}>
                                                <Typography variant="h6">WFH</Typography>
                                            </Grid>
                                            <Grid item md={2} sm={6} xs={12}>
                                                <Typography variant="h6">Count</Typography>
                                            </Grid>
                                        </Grid>)
                                        : null}
                                    {allUsersEdit &&
                                        allUsersEdit?.map((column, index) => (
                                            <Grid container key={index}>
                                                <React.Fragment key={index}>
                                                    <Grid item md={5} sm={6} xs={12} fullWidth>
                                                        <Typography>{`${column.formattedDate} (${column.shift})`}</Typography>
                                                    </Grid>
                                                    <Grid item md={4} sm={6} xs={12} fullWidth>
                                                        <Typography>{column.leavestatus}</Typography>
                                                    </Grid>
                                                    <Grid item md={2} sm={6} xs={12} fullWidth>
                                                        <Typography>{column.shiftcount}</Typography>
                                                    </Grid>
                                                </React.Fragment>
                                            </Grid>
                                        ))}
                                </>
                            </Grid>
                            <Grid item md={6} sm={12} xs={12}></Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Number of Shift</Typography>
                                    <Typography>{appWfhEdit.noofshift}</Typography>
                                </FormControl>
                            </Grid>


                            <Grid item md={8} xs={12} sm={12}></Grid>
                            <Grid item md={3.5} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Reason for WFH</Typography>
                                    <Typography>{appWfhEdit.reasonforworkfromhome}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3.7} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Reporting To</Typography>
                                    <Typography>{appWfhEdit.reportingto}</Typography>
                                </FormControl>
                            </Grid>

                        </Grid>
                        <br />
                        <br />
                        <Grid item md={4} xs={12} sm={12}>

                            <FormControl fullWidth size="small">
                                <Typography variant="h6">Attachments</Typography>
                                {fileEdit?.length > 0 &&
                                    (fileEdit.map((file, index) => (
                                        <>
                                            <Grid container spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
                                                <Grid item lg={6} md={6} sm={6} xs={6}>
                                                    <Typography>{file.name}</Typography>
                                                </Grid>
                                                <Grid item lg={2} md={2} sm={2} xs={2}>
                                                    <Button style={{ fontsize: "large", color: "#357AE8", marginLeft: "60px", marginTop: "-20px", cursor: "pointer" }} onClick={() => renderFilePreviewFileEdit(file)} size="small"  ><VisibilityOutlinedIcon /></Button>
                                                </Grid>

                                            </Grid>
                                        </>
                                    )))}
                            </FormControl>

                        </Grid>
                        <br /> <br /> <br />
                        <Grid container spacing={2}>
                            <Button variant="contained" sx={buttonStyles.btncancel} onClick={handleCloseview}>
                                {" "}
                                Back{" "}
                            </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>

            {/* ALERT DIALOG */}
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
                filteredDataTwo={(filteredRowData.length > 0 ? filteredRowData : filteredData) ?? []}
                itemsTwo={items ?? []}
                filename={"Apply Work From Home"}
                exportColumnNames={exportColumnNamescrt}
                exportRowValues={exportRowValuescrt}
                componentRef={componentRef}
            />
            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="Apply Work From Home Info"
                addedby={addedby}
                updateby={updateby}
            />
            <DeleteConfirmation
                open={isDeleteOpen}
                onClose={handleCloseMod}
                onConfirm={delApply}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
            <DeleteConfirmation
                open={isDeleteOpencheckbox}
                onClose={handleCloseModcheckbox}
                onConfirm={delApplycheckbox}
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

            <Box>
                <Dialog open={isErrorOpenForTookLeaveCheck} onClose={handleCloseerrForTookLeaveCheck} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
                        <Typography variant="h6">{showAlert}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="primary" onClick={sendRequestDouble}>
                            ok
                        </Button>
                        <Button variant="contained" color="error" onClick={handleCloseerrForTookLeaveCheck}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            {/* dialog status change */}
            <Box>
                <Dialog maxWidth="lg" open={statusOpen} onClose={handleStatusClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent
                        sx={{
                            width: "600px",
                            height: selectStatus.status == "Rejected" ? "260px" : "220px",
                            overflow: "visible",
                            "& .MuiPaper-root": {
                                overflow: "visible",
                            },
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item md={12} xs={12} sm={12}>
                                <Typography sx={userStyle.HeaderText}>Edit Apply Status</Typography>
                            </Grid>
                            <Grid item md={6} sm={6} xs={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Status<b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <Selects
                                        fullWidth
                                        options={[
                                            { label: "Approved WFH", value: "Approved WFH" },
                                            { label: "Rejected", value: "Rejected" },
                                            { label: "Applied WFH", value: "Applied WFH" },
                                        ]}
                                        value={{ label: selectStatus.status, value: selectStatus.value }}
                                        onChange={(e) => {
                                            setSelectStatus({ ...selectStatus, status: e.value });
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={12}>
                                {selectStatus.status == "Rejected" ? (
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Reason for Rejected<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <TextareaAutosize
                                            aria-label="minimum height"
                                            minRows={5}
                                            value={selectStatus.rejectedreason}
                                            onChange={(e) => {
                                                setSelectStatus({ ...selectStatus, rejectedreason: e.target.value });
                                            }}
                                        />
                                    </FormControl>
                                ) : null}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    {selectStatus.status == "Rejected" ? <br /> : null}
                    <DialogActions>
                        <Button
                            variant="contained"
                            sx={buttonStyles.buttonsubmit}
                            // style={{ padding: "7px 13px", color: "white", background: "rgb(25, 118, 210)" }}
                            onClick={() => {
                                editStatus();
                                // handleCloseerrpop();
                            }}
                        >
                            Update
                        </Button>
                        <Button
                            sx={buttonStyles.btncancel}
                            // style={{
                            //   backgroundColor: "#f4f4f4",
                            //   color: "#444",
                            //   boxShadow: "none",
                            //   borderRadius: "3px",
                            //   padding: "7px 13px",
                            //   border: "1px solid #0000006b",
                            //   "&:hover": {
                            //     "& .css-bluauu-MuiButtonBase-root-MuiButton-root": {
                            //       backgroundColor: "#f4f4f4",
                            //     },
                            //   },
                            // }}
                            onClick={() => {
                                handleStatusClose();
                                setSelectStatus({});
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

        </Box>
    );
}

export default ApplyWorkFromHome;