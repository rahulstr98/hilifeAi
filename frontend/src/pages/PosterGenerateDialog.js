import CloseIcon from "@mui/icons-material/Close";
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
    FormGroup,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Popover,
    Select,
    TextField,
    Tooltip,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import { useNavigate } from 'react-router-dom';
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import { v4 as uuidv4 } from "uuid";
import AggridTableForPaginationTable from "../components/AggridTableForPaginationTable.js";
import AlertDialog from "../components/Alert";
import {
    DeleteConfirmation,
    PleaseSelectRow,
} from "../components/DeleteConfirmation.js";
import { handleApiError } from "../components/Errorhandling";
import ExportData from "../components/ExportData";
import Headtitle from "../components/Headtitle";
import InfoPopup from "../components/InfoPopup.js";
import MessageAlert from "../components/MessageAlert";
import PageHeading from "../components/PageHeading";
import { menuItems } from "../components/menuItemsList";
import { AuthContext, UserRoleAccessContext } from "../context/Appcontext";
import { colourStyles, userStyle } from "../pageStyle";
import { SERVICE } from "../services/Baseservice";
import "../webpages/bdaytemplatetwo2nos.css";
import "../webpages/bdaytemplatetwo3nos.css";
import "../webpages/bdcsstemplatetwo.css";
import "../webpages/weddingcard2nos.css";
import "../webpages/weddingcard3nos.css";
import "../webpages/weddingcardtemplate.css";

function PosterGenerate({ handleCloseGenerate, fetchPosters }) {

    const gridRefTable = useRef(null);

    const [advancedFilter, setAdvancedFilter] = useState(null);
    const [additionalFilters, setAdditionalFilters] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const conditions = ["Contains", "Does Not Contain", "Equals", "Does Not Equal", "Begins With", "Ends With", "Blank", "Not Blank"]; // AgGrid-like conditions
    const [selectedColumn, setSelectedColumn] = useState("");
    const [selectedCondition, setSelectedCondition] = useState("Contains");
    const [logicOperator, setLogicOperator] = useState("AND");
    const [filterValue, setFilterValue] = useState("");
    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);

    const currentDate = new Date();
    const [enableManualGenerate, setManualGenerate] = useState(false);
    const [manualEntry, setManualEntry] = useState({
        manualentryname: "",
        manualentrydate: ""
    });

    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
        setloadingdeloverall(false);
    };
    const handleClosePopupMalert = () => {
        setOpenPopupMalert(false);
    };
    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupSeverity, setPopupSeverity] = useState("");
    const handleClickOpenPopup = () => {
        setOpenPopup(true);
        setloadingdeloverall(false);
    };
    const handleClosePopup = () => {
        setOpenPopup(false);
    };

    let exportColumnNames = [
        "Employee Name",
        "Category Template Name",
        "Sub Category Template Name",
        "Theme Name",
        "Company Name",
        "Branch",
        "Unit",
        "Team",
    ];
    let exportRowValues = [
        "employeename",
        "categoryname",
        "subcategoryname",
        "themename",
        "company",
        "branch",
        "unit",
        "team",
    ];

    const [loadingdeloverall, setloadingdeloverall] = useState(false);
    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [subcategoryOpt, setSubcategoryOption] = useState([]);
    const [categoryOptionEdit, setCategoryOptionEdit] = useState([]);
    const [subcategorynameOptEdit, setSubcategorynameOptEdit] = useState([]);
    const [userId, setUserID] = useState("");
    const [copiedData, setCopiedData] = useState("");

    //state to handle holiday values
    const [posterGenerate, setPosterGenerate] = useState({
        categoryname: "Please Select Category Template Name",
        subcategoryname: "Please Select Sub-category Template Name",
        themename: "Please Select Theme Name",
        days: "Please Select Days",
        todate: "",
        fromdate: "",
        company: "Please Select Company",
        branch: "Please Select Branch",
        unit: "Please Select Unit",
        team: "Please Select Team",
    });
    // const [posterGenerate, setPosterGenerate] = useState({
    //     company: "Please Select Company",
    //     branch: "Please Select Branch",
    //     unit: "Please Select Unit",
    //     floor: "Please Select Floor",
    //     area: "Please Select Area",
    //     location: "Please Select Location",
    //     maincabin: "",
    //     subcabin: "",
    // });
    const [themeNames, setThemeNames] = useState([]);
    const [selectedThemeNames, setSelectedThemeNames] = useState([]);
    let [valueCat, setValueCat] = useState([]);


    const [themeNamesEdit, setThemeNamesEdit] = useState([]);
    const [selectedThemeNamesEdit, setSelectedThemeNamesEdit] = useState([]);
    let [valueCatEdit, setValueCatEdit] = useState([]);




    const [posterGenerateEdit, setPosterGenerateEdit] = useState({
        categoryname: "Please Select Category Template Name",
        subcategoryname: "Please Select Sub-category Template Name",
        themename: "Please Select Theme Name",
    });


    const [categoryOption, setCategoryOption] = useState([]);
    const [posterGenerates, setPosterGenerates] = useState([]);
    const { isUserRoleCompare, isUserRoleAccess, buttonStyles, pageName, allTeam, setPageName, isAssignBranch, } = useContext(
        UserRoleAccessContext
    );
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
    const [statusCheck, setStatusCheck] = useState(false);

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
    const [allStatusEdit, setAllStatusEdit] = useState([]);

    // Manage Columns
    const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        company: true,
        branch: true,
        unit: true,
        team: true,
        employeename: true,
        categoryname: true,
        subcategoryname: true,
        themename: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(
        initialColumnVisibility
    );
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    //useEffect
    const [categorythemegrouping, setCategorythemegrouping] = useState([])

    const [documentFiles, setdocumentFiles] = useState([]);


    const handleResumeUpload = (event) => {
        const resume = event.target.files;
        const allowedExtensions = ["png", "jpeg"];

        if (resume?.length > 0) {
            const file = resume[0]; // Always take the first file
            const fileExtension = file.name.split('.').pop().toLowerCase();

            // Check if the file extension is allowed
            if (allowedExtensions.includes(fileExtension)) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    // Replace the previous file with the new one
                    setdocumentFiles([{
                        name: file.name,
                        preview: reader.result,
                        data: reader.result.split(",")[1],
                        remark: "resume file",
                    }]);
                };
            } else {
                setPopupContentMalert("Please upload a valid PNG file.");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
        }
    };

    // const handleResumeUpload = (event) => {
    //     const resume = event.target.files;
    //     const allowedExtensions = ["png"]

    //     for (let i = 0; i < resume?.length; i++) {
    //         const file = resume[i];
    //         const reader = new FileReader();
    //         reader.readAsDataURL(file);
    //         reader.onload = () => {
    //             setdocumentFiles((prevFiles) => [
    //                 ...prevFiles,
    //                 {
    //                     name: file.name,
    //                     preview: reader.result,
    //                     data: reader.result.split(",")[1],
    //                     remark: "resume file",
    //                 },
    //             ]);
    //         };
    //     }
    // };
    const renderFilePreview = async (file) => {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        window.open(link, "_blank");
    };
    const handleFileDelete = (index) => {
        setdocumentFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    //get all branches.
    const fetchCategoryAll = async () => {
        setPageName(!pageName);
        try {
            let res_location = await axios.get(SERVICE.CATEGROYTHEMEGROUPING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            let response = await axios.get(`${SERVICE.POSTERMESSAGESETTINGALL}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let all_datas = response.data.postermessage
            // let all_datas = res_location?.data?.categorythemegroupings
            setCategorythemegrouping(all_datas)



            setCategoryOption([
                ...all_datas?.map((t) => ({
                    ...t,
                    label: t.categoryname,
                    value: t.categoryname,
                })).filter(
                    (data, index, self) =>
                        index ===
                        self.findIndex(
                            (t) =>
                                t.value === data.value
                        )
                ),
            ]);
            setCategoryOptionEdit([
                ...all_datas?.map((t) => ({
                    ...t,
                    label: t.categoryname,
                    value: t.categoryname,
                })).filter(
                    (data, index, self) =>
                        index ===
                        self.findIndex(
                            (t) =>
                                t.value === data.value
                        )
                ),
            ]);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };



    const fetchSubcategoryBased = async (e) => {
        setPageName(!pageName);
        try {
            let data_set = categorythemegrouping.filter((data) => {
                return e.value === data.categoryname;
            });
            let subcategoryname = data_set?.map((item) => {
                return {
                    label: item?.subcategoryname,
                    value: item?.subcategoryname,
                }
            })
            setSubcategoryOption(subcategoryname);
            setSubcategorynameOptEdit(subcategoryname);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };

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

    //set function to get particular row
    const rowData = async (id, name) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.POSTERGENERATE_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setDeleteHoliday(res.data.spostergenerate);
            handleClickOpen();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    // Alert delete popup
    let holidayid = deleteHoliday._id;
    const delHoliday = async () => {
        setPageName(!pageName);
        try {
            await axios.delete(`${SERVICE.POSTERGENERATE_SINGLE}/${holidayid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            await fetchEmployee();
            await fetchHolidayAllGroup();
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

    const [bdayCompanyLogo, setBdayCompanyLogo] = useState("")
    const [bdayfootertext, setBdayfootertext] = useState("")
    const [bdaywishes, setBdaywishes] = useState("")

    const fetchBdaySetting = async () => {
        try {
            let res = await axios.get(`${SERVICE.GET_OVERALL_SETTINGS}`);

            setBdayCompanyLogo(
                res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
                    ?.companylogo
            );
            // setBdaywishes(
            //     res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
            //         ?.bdaywishes
            // );
            // setBdayfootertext(
            //     res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
            //         ?.bdayfootertext
            // );
        } catch (err) {
            console.log(err, '12')
        }
    };

    // const [base64DatasNew, setBase64DatasNew] = useState([]);
    const [employeeValueAdd, setEmployeeValueAdd] = useState([]);


    // console.log(employeeValueAdd, "employeeValueAdd")


    let legalName = []
    let userName = []
    let companyName = []
    let team = []
    let unit = []
    let branch = []

    let dob = []
    let paddress = []
    let caddress = []
    let email = []
    let contactpersonal = []
    let doj = []
    let empcode = []
    let firstname = []
    let lastname = []
    let designation = []
    let process = []
    let department = []
    let reasondate = []
    let shifttiming = []
    let accname = []
    let accno = []
    let ifsc = []
    let workstation = []
    let workstationcount = []
    let employeecount = []
    let genderheshe = []
    let genderheshesmall = []
    let genderhimher = []
    let prefix = []


    const fetchEmployeeDob = async (id) => {
        try {
            let res = await axios.get(`${SERVICE.USER_SINGLE}/${id}`);
            const availedData = res?.data?.suser;

            if (availedData?.length !== 0) {

                let accountno = []
                let accountname = []
                let ifsccode = []

                availedData?.bankdetails?.forEach((item) => {
                    accountno.push(item.accountnumber || []);
                    accountname.push(item.accountholdername || []);
                    ifsccode.push(item.ifsccode || []);
                });

                let GenderHeShe = (availedData?.gender !== "" || availedData?.gender !== undefined)
                    ? availedData?.gender === "Male" ? "He" : availedData?.gender === "Female" ? "She" : "He/She" : "He/She";

                let GenderHeShesmall = (availedData?.gender !== "" || availedData?.gender !== undefined)
                    ? availedData?.gender === "Male" ? "he" : availedData?.gender === "Female" ? "she" : "he/she" : "he/she";

                let GenderHimHer = (availedData?.gender !== "" || availedData?.gender !== undefined)
                    ? availedData?.gender === "Male" ? "him" : availedData?.gender === "Female" ? "her" : "him/her" : "him/her";

                let Paddress = `${!availedData?.pdoorno ? "" : availedData?.pdoorno + ","}
                ${!availedData?.pstreet ? "" : availedData?.pstreet + ","}
                ${!availedData?.parea ? "" : availedData?.parea + ","}
                ${!availedData?.plandmark ? "" : availedData?.plandmark + ","}
                ${!availedData?.ptaluk ? "" : availedData?.ptaluk + ","}
                ${!availedData?.ppost ? "" : availedData?.ppost + ","}
                ${!availedData?.pcity ? "" : availedData?.pcity + ","}
                ${!availedData?.pstate ? "" : availedData?.pstate + ","}
                ${!availedData?.pcountry ? "" : availedData?.pcountry + ","}
                ${!availedData?.ppincode ? "" : "-" + availedData?.ppincode}`;

                let Caddress = `${!availedData?.cdoorno ? "" : availedData?.cdoorno + ","}
                ${!availedData?.cstreet ? "" : availedData?.cstreet + ","}
            ${!availedData?.carea ? "" : availedData?.carea + ","}
                ${!availedData?.clandmark ? "" : availedData?.clandmark + ","}
                ${!availedData?.ctaluk ? "" : availedData?.ctaluk + ","}
                ${!availedData?.cpost ? "" : availedData?.cpost + ","}
                ${!availedData?.ccity ? "" : availedData?.ccity + ","}
                ${!availedData?.cstate ? "" : availedData?.cstate + ","}
                ${!availedData?.ccountry ? "" : availedData?.ccountry + ","}
                ${!availedData?.cpincode ? "" : "-" + availedData?.cpincode}`;


                legalName?.push(availedData?.legalname ? availedData?.legalname : "")
                userName?.push(availedData?.username ? availedData?.username : "")
                companyName?.push(availedData?.companyname ? availedData?.companyname : "")
                team?.push(availedData?.team ? availedData?.team : "")
                unit?.push(availedData?.unit ? availedData?.unit : "")
                branch?.push(availedData?.branch ? availedData?.branch : "")

                dob?.push(availedData?.dob ? availedData?.dob : "")
                paddress?.push(Paddress)
                caddress?.push(Caddress)
                email?.push(availedData?.email ? availedData?.email : "")
                contactpersonal?.push(availedData?.contactpersonal ? availedData?.contactpersonal : "")
                doj?.push(availedData?.doj ? availedData?.doj : "")
                empcode?.push(availedData?.empcode ? availedData?.empcode : "")
                firstname?.push(availedData?.firstname ? availedData?.firstname : "")
                lastname?.push(availedData?.lastname ? availedData?.lastname : "")
                designation?.push(availedData?.designation ? availedData?.designation : "")
                process?.push(availedData?.process ? availedData?.process : "")
                department?.push(availedData?.department ? availedData?.department : "")
                reasondate?.push(availedData?.reasondate ? availedData?.reasondate : "")
                shifttiming?.push(availedData?.shifttiming ? availedData?.shifttiming : "")
                accname?.push(availedData?.bankdetails?.length > 0 ? accountname : [])
                accno?.push(availedData?.bankdetails?.length > 0 ? accountno : [])
                ifsc?.push(availedData?.bankdetails?.length > 0 ? ifsccode : [])
                accountno = [];
                accountname = [];
                ifsccode = [];
                workstation?.push(availedData?.workstation ? availedData?.workstation : "")
                workstationcount?.push(availedData?.workstation ? availedData?.workstation?.length : "")
                employeecount?.push(availedData?.employeecount ? availedData?.employeecount : "")
                genderheshe?.push(GenderHeShe)
                genderheshesmall?.push(GenderHeShesmall)
                genderhimher?.push(GenderHimHer)
                prefix?.push(availedData?.prefix ? availedData?.prefix : "Mr/Ms")

                return availedData?.dob;

            } else {
                return '';
            }
        } catch (err) {
            console.log(err, 'Error fetching employee DOB');
            return '';
        }
    };



    // console.log(employeeOneID, "employeeOneID")

    const fetchDobs = async (nos, wish, employeeOneID, employeeTwoID, employeeThreeID) => {
        try {
            const dobPromises = [];

            if (nos === "one") {

                if (employeeOneID) {
                    dobPromises.push(fetchEmployeeDob(employeeOneID));
                }

            } else if (nos === "two") {
                if (employeeOneID) {
                    dobPromises.push(fetchEmployeeDob(employeeOneID));
                }

                if (employeeTwoID) {
                    dobPromises.push(fetchEmployeeDob(employeeTwoID));
                }

            } else if (nos === "three") {

                if (employeeOneID) {
                    dobPromises.push(fetchEmployeeDob(employeeOneID));
                }

                if (employeeTwoID) {
                    dobPromises.push(fetchEmployeeDob(employeeTwoID));
                }

                if (employeeThreeID) {
                    dobPromises.push(fetchEmployeeDob(employeeThreeID));
                }

            }



            const Legalname = [...new Set(legalName)]?.toString()
            const Username = [...new Set(userName)]?.toString()
            const Companyname = [...new Set(companyName)]?.toString()
            const Team = [...new Set(team)]?.toString()
            const Unit = [...new Set(unit)]?.toString()
            const Branch = [...new Set(branch)]?.toString()

            const Dob = [...new Set(dob)]?.toString()
            const Paddress = [...new Set(paddress)]?.toString()
            const Caddress = [...new Set(caddress)]?.toString()
            const Email = [...new Set(email)]?.toString()
            const Contactpersonal = [...new Set(contactpersonal)]?.toString()
            const Doj = [...new Set(doj)]?.toString()
            const Empcode = [...new Set(empcode)]?.toString()
            const Firstname = [...new Set(firstname)]?.toString()
            const Lastname = [...new Set(lastname)]?.toString()
            const Designation = [...new Set(designation)]?.toString()
            const Process = [...new Set(process)]?.toString()
            const Department = [...new Set(department)]?.toString()
            const Reasondate = [...new Set(reasondate)]?.toString()
            const Shifttiming = [...new Set(shifttiming)]?.toString()
            const Accname = [...new Set(accname?.flat())]

            const Accno = [...new Set(accno?.flat())]
            const Ifsc = [...new Set(ifsc?.flat())]
            const Workstation = [...new Set(workstation)]?.toString()
            const Workstationcount = [...new Set(workstationcount)]?.toString()
            const Employeecount = [...new Set(employeecount)]?.toString()
            const Genderheshe = [...new Set(genderheshe)]?.toString()
            const Genderheshesmall = [...new Set(genderheshesmall)]?.toString()
            const Genderhimher = [...new Set(genderhimher)]?.toString()
            const Prefix = [...new Set(prefix)]?.toString()


            let replacedWish = wish
                .replaceAll("$LEGALNAME$", Legalname)
                .replaceAll("$LOGIN$", Username)
                .replaceAll("$C:NAME$", Companyname)
                .replaceAll("$TEAM$", Team)
                .replaceAll("$UNIT$", Unit)
                .replaceAll("$BRANCH$", Branch)

                .replaceAll("$DOB$", Dob)
                .replaceAll("$P:ADDRESS$", Paddress)
                .replaceAll("$C:ADDRESS$", Caddress)
                .replaceAll("$EMAIL$", Email)
                .replaceAll("$P:NUMBER$", Contactpersonal)
                .replaceAll("$DOJ$", Doj)
                .replaceAll("$EMPCODE$", Empcode)
                .replaceAll("$F:NAME$", Firstname)
                .replaceAll("$L:NAME$", Lastname)
                .replaceAll("$DESIGNATION$", Designation)
                .replaceAll("$PROCESS$", Process)
                .replaceAll("$DEPARTMENT$", Department)
                .replaceAll("$LWD$", Reasondate)
                .replaceAll("$SHIFT$", Shifttiming)
                .replaceAll("$AC:NAME$", Accname)
                .replaceAll("$AC:NUMBER$", Accno)
                .replaceAll("$IFSC$", Ifsc)
                .replaceAll("$WORKSTATION:NAME$", Workstation)
                .replaceAll("$WORKSTATION:COUNT$", Workstationcount)
                .replaceAll("$SYSTEM:COUNT$", Employeecount)
                .replaceAll("$GENDERHE/SHE$", Genderheshe)
                .replaceAll("$GENDERHE/SHE/SMALL$", Genderheshesmall)
                .replaceAll("$GENDERHIM/HER$", Genderhimher)
                .replaceAll("$SALUTATION$", Prefix)

            return replacedWish

        } catch (err) {
            console.log(err, 'Error fetching DOBs');
        }
    };

    // useEffect(() => {
    //     fetchDobs()
    // }, [])

    const sendRequest = async () => {
        setPageName(!pageName);
        setPosterGroup("abc");

        try {
            const employeeCount = employeeValueAdd.length;

            if (enableManualGenerate) {

                const generateImage = async () => {
                    try {
                        const templatesubcat = posterGenerate.subcategoryname;
                        const templatecat = posterGenerate.categoryname;

                        // Filter and get a random wish
                        const getWishes = wishingMessage.filter(
                            (item) =>
                                item?.categoryname === templatecat &&
                                item?.subcategoryname === templatesubcat
                        )[0]?.wishingmessage;

                        const randomWish = getWishes
                            ? getWishes[Math.floor(Math.random() * getWishes.length)]
                            : "Happy Birthday!";

                        // Create a temporary div for rendering
                        let tempDiv = document.createElement("div");
                        tempDiv.style.position = "absolute";
                        tempDiv.style.left = "-9999px";
                        tempDiv.style.width = "600px";

                        // Determine which template to use
                        const isBirthday =
                            templatecat?.toLowerCase()?.includes("birthday") ||
                            templatesubcat?.toLowerCase()?.includes("birthday");

                        const template = isBirthday
                            ? `
                                <div id="birthdaydivtwo">
                                    <div id="birthday-cardtwo">
                                        <div class="companylogotwo">
                                            <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" />
                                        </div>
                                        <div id="profileImgtwo">
                                            <img src="${documentFiles[0]?.preview || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
                                                 alt="profile" width="190" height="150" />
                                            <span class="usernametwo" style="font-size: ${manualEntry.manualentryname?.length > 11 ? '14px' : '16px'};">
                                                ${manualEntry.manualentryname.toUpperCase()}
                                            </span>
                                        </div>
                                        <div class="bdaydobtwo">
                                            <span>${manualEntry.manualentrydate ? moment(manualEntry.manualentrydate).format("DD-MM-YYYY") : ""}</span>
                                        </div>
                                        <div class="bdaywishestwo">
                                            <span style="font-size: ${randomWish?.length > 50 ? '11px' : '16px'};">
                                                ${randomWish}
                                            </span>
                                        </div>
                                        <div class="bdayfootertexttwo">
                                            <span>${footerMessage}</span>
                                        </div>
                                    </div>
                                </div>
                            `
                            : `
                                <div id="weddingdivtwo">
                                    <div id="wedding-card">
                                        <div class="companylogowedding">
                                            <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" /><br />
                                        </div>
                                        <div id="profileImgwedding">
                                            <img src="${documentFiles[0]?.preview || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="" width="190" height="150" />
                                            <span class="usernamewedding" style="font-size: ${manualEntry.manualentryname?.length > 11 ? '14px' : '16px'};">
                                                ${manualEntry.manualentryname.toUpperCase()}
                                            </span>
                                        </div>
                                        <div class="bdaydobwedding">
                                            <span>${manualEntry.manualentrydate ? moment(manualEntry.manualentrydate).format("DD-MM-YYYY") : ""}</span>
                                        </div>
                                        <div class="bdaywisheswedding">
                                            <span style="font-size: ${randomWish?.length > 50 ? '11px' : '16px'};">
                                                ${randomWish}
                                            </span>
                                        </div>
                                        <div class="bdayfootertextwedding">
                                            <span>${footerMessage}</span>
                                        </div>
                                    </div>
                                </div>
                            `;

                        // Set the inner HTML of the temporary div
                        tempDiv.innerHTML = template;
                        document.body.appendChild(tempDiv);

                        // Convert the div to an image using html2canvas
                        let canvas = await html2canvas(tempDiv, { scale: 2 });
                        document.body.removeChild(tempDiv); // Cleanup

                        // Return the base64 image
                        return canvas.toDataURL("image/png");
                    } catch (error) {
                        console.error("Error generating image:", error);
                        throw error;
                    }
                };

                // Usage
                let imageBase64Datas = await generateImage();

                await axios.post(SERVICE.POSTERGENERATE_CREATE, {
                    headers: { Authorization: `Bearer ${auth.APIToken}` },
                    company: [posterGenerate.company],
                    branch: [posterGenerate.branch],
                    unit: [posterGenerate.unit],
                    team: [posterGenerate.team],
                    employeename: manualEntry.manualentryname.toUpperCase(),
                    posterdownload: [],
                    imagebase64: imageBase64Datas,
                    categoryname: String(posterGenerate.categoryname),
                    subcategoryname: String(posterGenerate.subcategoryname),
                    manualentrydate: String(manualEntry.manualentrydate),
                    manualentryname: String(manualEntry.manualentryname),
                    documentFiles: [...documentFiles],
                    themename: "Manual Template",
                    addedby: [
                        {
                            name: String(isUserRoleAccess.companyname),
                            date: String(new Date()),
                        },
                    ],
                });

            }
            else {
                if (employeeCount > 0) {
                    let remainingEmployees = employeeCount;

                    // Generate 3-person templates for every set of 3 employees
                    const numberOfThreePersonTemplates = Math.floor(remainingEmployees / 3);
                    let processedEmployees = 0;


                    for (let i = 0; i < numberOfThreePersonTemplates; i++) {
                        // Get the next 3 employees for the template
                        const employeesForTemplate = employeeValueAdd.slice(processedEmployees, processedEmployees + 3);
                        processedEmployees += 3;
                        remainingEmployees -= 3;


                        let response = await axios.get(`${SERVICE.POSTERMESSAGESETTINGALL}`, {
                            headers: {
                                Authorization: `Bearer ${auth.APIToken}`,
                            },
                        });

                        // Extract employee values (if needed)
                        const employee = employeesForTemplate.map((item) => item?.value);

                        // Generate base64 images for the template
                        let imageBase64Datas = await Promise.all(
                            employeesForTemplate?.map(async (data, index) => {
                                const templatesubcat = posterGenerate.subcategoryname;
                                const templatecat = posterGenerate.categoryname;

                                const getWishes = wishingMessage.filter((item) =>
                                    item?.categoryname === templatecat &&
                                    item?.subcategoryname === templatesubcat
                                )[0]?.wishingmessage;

                                const randomWish = getWishes ? getWishes[Math.floor(Math.random() * getWishes.length)] : "Happy Birthday!";

                                let wishs = await fetchDobs("one", randomWish, data?._id, employeesForTemplate[1]?._id, employeesForTemplate[2]?._id)

                                // Create a temporary div for rendering the template
                                let tempDiv = document.createElement("div");
                                tempDiv.style.position = "absolute";
                                tempDiv.style.left = "-9999px"; // Hide it from view
                                tempDiv.style.width = "600px"; // Ensure proper width for rendering

                                // Template for Birthday
                                let bdayHtml = `
                                        <div id="birthdaydivtwo3nos">
                                            <div id="birthday-cardtwo3nos">
                                                <div class="companylogotwo3nos">
                                                    <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" /><br />
                                                </div>
                                                <div id="emponediv">
                                                    <div id="profileImgtwo3nos">
                                                        <img src="${employeesForTemplate[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" width="190" height="150" />                                                        
                                                            <span class="usernametwo3nos" style="font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'}">
                                                        ${employeesForTemplate[0]?.companyname}
                                                        </span>
                                                        <span class="bdaydobtwo3nos">
                                                            ${employeesForTemplate[0]?.dob ? moment(employeesForTemplate[0]?.dob).format("DD-MM-YYYY") : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div id="emptwodiv">
                                                    <div id="profileImgtwotwo3nos">
                                                        <img src="${employeesForTemplate[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" width="190" height="150" />                                                        
                                                            <span class="usernametwo3nos" style="font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'}">                                                    
                                                        ${employeesForTemplate[1]?.companyname}
                                                        </span>
                                                        <span class="bdaydobtwotwo3nos">
                                                            ${employeesForTemplate[1]?.dob ? moment(employeesForTemplate[1]?.dob).format("DD-MM-YYYY") : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div id="empthreediv">
                                                    <div id="profileImgtwothree3nos">
                                                        <img src="${employeesForTemplate[2]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" width="190" height="150" />
                                                            <span class="usernametwo3nos" style="font-size: ${employeesForTemplate[2]?.companyname?.length > 11 ? '11px' : 'initial'}">
                                                            ${employeesForTemplate[2]?.companyname}
                                                        </span>
                                                        <span class="bdaydobtwothree3nos">
                                                            ${employeesForTemplate[2]?.dob ? moment(employeesForTemplate[2]?.dob).format("DD-MM-YYYY") : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="bdaywishestwo3nos">
                                                    <span style="font-size: ${wishs?.length > 50 ? '11px' : 'initial'}">
                                                        ${wishs}
                                                    </span>
                                                </div>
                                                <div class="bdayfootertexttwo3nos">
                                                    <span>${footerMessage === "" || footerMessage === undefined || footerMessage === "undefined" ? "" : footerMessage}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `;

                                // Template for Wedding
                                let wedHtml = `
                                        <div id="weddingdivtwo3nos">
                                            <div id="wedding-cardtwo3nos">
                                                <div class="companylogotwo3nos">
                                                    <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" /><br />
                                                </div>
                                                <div id="emponediv">
                                                    <div id="profileImgtwo3nos">
                                                        <img src="${employeesForTemplate[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" width="190" height="150" />
                                                        <span class="usernametwo3nos" style="font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'}">
                                                        ${employeesForTemplate[0]?.companyname}
                                                        </span>
                                                        <span class="weddingdobtwo3nos">
                                                            ${employeesForTemplate[0]?.dob ? moment(employeesForTemplate[0]?.dob).format("DD-MM-YYYY") : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div id="emptwodiv">
                                                    <div id="profileImgtwotwo3nos">
                                                        <img src="${employeesForTemplate[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" width="190" height="150" />
                                                        <span class="usernametwo3nos" style="font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'}">
                                                        ${employeesForTemplate[1]?.companyname}
                                                        </span>
                                                        <span class="weddingdobtwotwo3nos">
                                                            ${employeesForTemplate[1]?.dob ? moment(employeesForTemplate[1]?.dob).format("DD-MM-YYYY") : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div id="empthreediv">
                                                    <div id="profileImgtwothree3nos">
                                                        <img src="${employeesForTemplate[2]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" width="190" height="150" />
                                                        <span class="usernametwo3nos" style="font-size: ${employeesForTemplate[2]?.companyname?.length > 11 ? '11px' : 'initial'}">
                                                            ${employeesForTemplate[2]?.companyname}
                                                        </span>
                                                        <span class="weddingdobtwothree3nos">
                                                            ${employeesForTemplate[2]?.dob ? moment(employeesForTemplate[2]?.dob).format("DD-MM-YYYY") : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="weddingwishestwo3nos">
                                                    <span style="font-size: ${wishs?.length > 50 ? '11px' : 'initial'}">
                                                        ${wishs}
                                                    </span>
                                                </div>
                                                <div class="weddingfootertexttwo3nos">
                                                    <span>${footerMessage === "" || footerMessage === undefined || footerMessage === "undefined" ? "" : footerMessage}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `;

                                // Render the appropriate template
                                tempDiv.innerHTML = templatecat?.toLowerCase()?.includes("birthday") || templatesubcat?.toLowerCase()?.includes("birthday") ? bdayHtml : wedHtml;

                                document.body.appendChild(tempDiv);

                                // Convert the div to an image
                                let canvas = await html2canvas(tempDiv, { scale: 2 });
                                document.body.removeChild(tempDiv); // Cleanup

                                return canvas.toDataURL("image/png"); // Return base64 image
                            })
                        );

                        // Save the generated poster
                        await axios.post(SERVICE.POSTERGENERATE_CREATE, {
                            headers: { Authorization: `Bearer ${auth.APIToken}` },
                            company: [...valueCompanyAdd],
                            branch: [...valueBranchAdd],
                            unit: [...valueUnitAdd],
                            team: [...valueTeamAdd],
                            employeename: employee,
                            posterdownload: employeesForTemplate,
                            categoryname: String(posterGenerate.categoryname),
                            subcategoryname: String(posterGenerate.subcategoryname),
                            themename: "3-Person Template",
                            imagebase64: imageBase64Datas[0],
                            addedby: [
                                {
                                    name: String(isUserRoleAccess.companyname),
                                    date: String(new Date()),
                                },
                            ],
                        });

                        // Reset the poster generation state
                        setPosterGenerate({
                            categoryname: "Please Select Category Template Name",
                            subcategoryname: "Please Select Sub-category Template Name",
                            themename: "Please Select Theme Name",
                            days: "Please Select Days",
                        });
                    }

                    if (remainingEmployees === 2) {
                        const employeesForTemplate = employeeValueAdd.slice(processedEmployees, processedEmployees + 2);

                        const employee = employeesForTemplate.map((item) => item?.value);

                        let response = await axios.get(`${SERVICE.POSTERMESSAGESETTINGALL}`, {
                            headers: {
                                Authorization: `Bearer ${auth.APIToken}`,
                            },
                        });

                        let imageBase64Datas = await Promise.all(
                            employeesForTemplate?.map(async (data, index) => {
                                const templatesubcat = posterGenerate.subcategoryname;
                                const templatecat = posterGenerate.categoryname;

                                const getWishes = wishingMessage.filter((item) =>
                                    item?.categoryname === templatecat &&
                                    item?.subcategoryname === templatesubcat
                                )[0]?.wishingmessage;

                                const randomWish = getWishes ? getWishes[Math.floor(Math.random() * getWishes.length)] : "Happy Birthday!";

                                // let wishs = await fetchDobs("one", randomWish, data?._id, employeesForTemplate[1]?._id)

                                let wishs = await fetchDobs(
                                    "one",
                                    randomWish,
                                    employeesForTemplate[0]?._id, // First employee
                                    employeesForTemplate[1]?._id  // Second employee
                                );


                                // const getWishes = response?.data?.postermessage?.find(
                                //     (item) => item?.categoryname === data?.categoryname &&
                                //         item?.subcategoryname === data?.subcategoryname
                                // )?.wishingmessage;

                                // const randomWish = getWishes ? getWishes[Math.floor(Math.random() * getWishes.length)] : "Happy Birthday!";

                                // ✅ Create a temporary div inside a React container
                                let tempDiv = document.createElement("div");
                                tempDiv.style.position = "absolute";
                                tempDiv.style.left = "-9999px"; // Hide it from view
                                tempDiv.style.width = "600px"; // Ensure proper width for rendering

                                let bdayHtml = `
                                    <div id="birthdaydivtwo2nos">
                                        <div id="birthday-cardtwo2nos">
                                            <div class="companylogotwo2nos">
                                                <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" /><br />
                                            </div>
                                            <div id="twoempprofile">
                                                <div id="emponediv">
                                                    <div id="profileImgtwo2nos">
                                                        <img src='${data?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" width="190" height="150" />
                                                        <span class="usernametwo2nos"
                                                            style="font-size: ${data?.companyname?.length > 11 ? '11px' : 'initial'}";
                                                            
                                                        >${data?.companyname}</span>
                                                        <span class="bdaydobtwo2nos">${data?.dob ? moment(data?.dob).format("DD-MM-YYYY") : ""}</span>
                                                    </div>
                                                </div>
                                                <div id="emptwodiv">
                                                    <div id="profileImgtwotwo2nos">
                                                        <img src='${employeesForTemplate[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" width="190" height="150" />
                                                        <span id="usernametwotwo2nos" class="usernametwo2nos"
                                                            style="font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'};"
                                                        >${employeesForTemplate[1]?.companyname}</span>
                                                        <span class="bdaydobtwotwo2nos">${employeesForTemplate[1]?.dob ? moment(employeesForTemplate[1]?.dob).format("DD-MM-YYYY") : ""}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="bdaywishestwo2nos">
                                                <span
                                                    style="font-size: ${wishs?.length > 50 ? '11px' : 'initial'};"
                                                >${wishs}</span>
                                            </div>
                                            <div class="bdayfootertexttwo2nos">
                                                <span>${footerMessage === "" || footerMessage === undefined || footerMessage === "undefined" ? "" : footerMessage}</span>
                                            </div>
                                        </div>
                                    </div>
                                `;

                                let wedHtml = `
                                            <div id="weddingtempdivtwo2nos">
                                                    <div id="wedding-cardtwo2nos">
                                                        <div class="weddinglogotwo2nos">
                                                                <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" /><br />
                                                        </div>
                                                        <div id="twoempprofile">
                                                            <div id="emponediv">
                                                                <div id="weddingImgtwo2nos" >
                                                                        <img src='${data?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" width="190" height="150" />
                                                                    <span class="usernametwowedding2nos"
                                                                        style="font-size: ${data?.companyname?.length > 11 ? '11px' : 'initial'};"
                                                                        >${data?.companyname}</span>

                                                                        <span class="bdaydobtwo2nos">${data?.dob ? moment(data?.dob).format("DD-MM-YYYY") : ""}</span>
                                                                </div>

                                                            </div>
                                                            <div id="emptwodiv">
                                                                <div id="profileImgweddingtwo2nos" >
                                                                        <img src='${employeesForTemplate[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" width="190" height="150" />
                                                                    <span id="usernametwotwo2nos" class="usernametwowedding2nos"
                                                                        style="font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'};"
                                                                        >${employeesForTemplate[1]?.companyname}</span>
                                                                        <span class="bdaydobtwotwo2nos">${employeesForTemplate[1]?.dob ? moment(employeesForTemplate[1]?.dob).format("DD-MM-YYYY") : ""}</span>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <div class="weddingwishestwo2nos">
                                                            <span
                                                                style="font-size: ${wishs?.length > 50 ? '11px' : 'initial'};"
                                                                >${wishs}</span>
                                                        </div>
                                                        <div class="weddingfootertexttwo2nos">
                                                                <span>${footerMessage === "" || footerMessage === undefined || footerMessage === "undefined" ? "" : footerMessage}</span>
                                                        </div>
                                                    </div>
                                            </div>                
                                        `;

                                tempDiv.innerHTML = templatecat?.toLowerCase()?.includes("birthday") || templatesubcat?.toLowerCase()?.includes("birthday") ? bdayHtml : wedHtml;

                                document.body.appendChild(tempDiv);

                                // ✅ Convert tempDiv to Image
                                let canvas = await html2canvas(tempDiv, { scale: 2 });
                                document.body.removeChild(tempDiv); // Cleanup

                                return canvas.toDataURL("image/png"); // Return base64 image
                            })
                        );

                        await axios.post(SERVICE.POSTERGENERATE_CREATE, {
                            headers: { Authorization: `Bearer ${auth.APIToken}` },
                            company: [...valueCompanyAdd],
                            branch: [...valueBranchAdd],
                            unit: [...valueUnitAdd],
                            team: [...valueTeamAdd],
                            employeename: employee,
                            posterdownload: employeesForTemplate,
                            categoryname: String(posterGenerate.categoryname),
                            subcategoryname: String(posterGenerate.subcategoryname),
                            imagebase64: imageBase64Datas[0],
                            themename: "2-Person Template",
                            addedby: [
                                {
                                    name: String(isUserRoleAccess.companyname),
                                    date: String(new Date()),
                                },
                            ],
                        });
                        processedEmployees += 2;
                        remainingEmployees -= 2;

                        setPosterGenerate({
                            categoryname: "Please Select Category Template Name",
                            subcategoryname: "Please Select Sub-category Template Name",
                            themename: "Please Select Theme Name",
                            days: "Please Select Days",
                        });
                    }

                    // If 1 employee remains, send them to the 1-person template
                    if (remainingEmployees === 1) {
                        const employeesForTemplate = employeeValueAdd.slice(processedEmployees, processedEmployees + 1);

                        let imageBase64Datas = await Promise.all(
                            employeeValueAdd?.map(async (data) => {
                                const templatesubcat = posterGenerate.subcategoryname;
                                const templatecat = posterGenerate.categoryname;

                                const getWishes = wishingMessage.filter((item) =>
                                    item?.categoryname === templatecat &&
                                    item?.subcategoryname === templatesubcat
                                )[0]?.wishingmessage;

                                const randomWish = getWishes ? getWishes[Math.floor(Math.random() * getWishes.length)] : "Happy Birthday!";

                                let wishs = await fetchDobs("one", randomWish, data?._id)

                                let tempDiv = document.createElement("div");
                                tempDiv.style.position = "absolute";
                                tempDiv.style.left = "-9999px";
                                tempDiv.style.width = "600px";

                                let bdayHtml = `
                                <div id="birthdaydivtwo">
                                    <div id="birthday-cardtwo">
                                        <div class="companylogotwo">
                                            <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" />
                                        </div>
                                        <div id="profileImgtwo">
                                            <img src="${data?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
                                                 alt="profile" width="190" height="150" />
                                            <span class="usernametwo" style="font-size: ${data?.companyname?.length > 11 ? '14px' : '16px'};">
                                                ${data?.companyname}
                                            </span>
                                        </div>
                                        <div class="bdaydobtwo">
                                            <span>${data?.dob ? moment(data?.dob).format("DD-MM-YYYY") : ""}</span>
                                        </div>
                                        <div class="bdaywishestwo">
                                            <span 
                                             style="font-size: ${wishs?.length > 50 ? '11px' : 'initial'};"
                                            >${wishs}</span>
                                        </div>
                                        <div class="bdayfootertexttwo">
                                            <span>${footerMessage}</span>
                                        </div>
                                    </div>
                                </div>
                                `

                                let wedHtml = `
                                            <div id="weddingdivtwo">
                                                <div id="wedding-card">
                                                    <div class="companylogowedding">
                                                        <img src="${bdayCompanyLogo}" alt="logo" height="150" width="165" /><br />
                                                    </div>
                                                    <div id="profileImgwedding">
                                                        <img src="${data?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="" width="190" height="150" />
                                                        <span class="usernamewedding"
                                                       style="font-size: ${data?.companyname?.length > 11 ? '14px' : '16px'};"
                                                        >${data?.companyname}</span>
                                                    </div>
                                                    <div class="bdaydobwedding">
                                                        <span>${data?.dom ? moment(data?.dom).format("DD-MM-YYYY") : ""}</span>
                                                    </div>
                                                    <div class="bdaywisheswedding">
                                                        <span
                                                         style="font-size: ${wishs?.length > 50 ? '11px' : 'initial'};"
                                                        >${wishs}</span>
                                                    </div>
                                                    <div class="bdayfootertextwedding">
                                                        <span >${footerMessage}</span>
                                                    </div>
                                                </div>
                                            </div>
                                `

                                tempDiv.innerHTML = templatecat?.toLowerCase()?.includes("birthday") || templatesubcat?.toLowerCase()?.includes("birthday") ? bdayHtml : wedHtml;

                                document.body.appendChild(tempDiv);

                                // ✅ Convert tempDiv to Image
                                let canvas = await html2canvas(tempDiv, { scale: 2 });
                                document.body.removeChild(tempDiv); // Cleanup

                                return canvas.toDataURL("image/png"); // Return base64 image
                            })
                        );


                        await axios.post(SERVICE.POSTERGENERATE_CREATE, {
                            headers: { Authorization: `Bearer ${auth.APIToken} ` },
                            company: [...valueCompanyAdd],
                            branch: [...valueBranchAdd],
                            unit: [...valueUnitAdd],
                            team: [...valueTeamAdd],
                            employeename: employeesForTemplate[0]?.value,
                            posterdownload: employeesForTemplate,
                            categoryname: String(posterGenerate.categoryname),
                            subcategoryname: String(posterGenerate.subcategoryname),
                            imagebase64: imageBase64Datas[0],
                            themename: "1-Person Template",
                            addedby: [
                                {
                                    name: String(isUserRoleAccess.companyname),
                                    date: String(new Date()),
                                },
                            ],
                        });

                        setPosterGenerate({
                            categoryname: "Please Select Category Template Name",
                            subcategoryname: "Please Select Sub-category Template Name",
                            themename: "Please Select Theme Name",
                            days: "Please Select Days",
                        });

                    }
                }
            }
            // Finalize by fetching holiday data and resetting form fields
            await fetchEmployee();
            await fetchHolidayAllGroup();
            setPosterGenerate({
                categoryname: "Please Select Category Template Name",
                subcategoryname: "Please Select Sub-category Template Name",
                themename: "Please Select Theme Name",
                days: "Please Select Days",
                company: "Please Select Company",
                branch: "Please Select Branch",
                unit: "Please Select Unit",
                team: "Please Select Team",
            });
            setSelectedThemeNames([]);
            setValueCat([]);
            setPopupContent("Added Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            setPosterGroup("efg");

            //company
            setCompanyValueAdd([])
            setValueCompanyAdd([])
            setBranchOption([])
            setBranchValueAdd([])
            setValueBranchAdd([])
            setUnitOption([])
            setUnitValueAdd([])
            setValueUnitAdd([])
            setTeamOption([])
            setTeamValueAdd([])
            setValueTeamAdd([])
            setEmployeeOptionDaysWise([])
            setEmployeeValueAddEdit([])
            setEmployeeValueAdd([])
            setdocumentFiles([])
            setManualEntry({
                manualentryname: "",
                manualentrydate: ""
            });
            setManualGenerate(false)
            fetchPosters();
            handleCloseGenerate();
        } catch (err) {
            setloadingdeloverall(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    //submit option for saving
    const handleSubmit = (e) => {
        setloadingdeloverall(true);
        e.preventDefault();
        const isNameMatch = posterGenerates?.some(
            (item) =>
                item.categoryname?.toLowerCase() === posterGenerate.categoryname?.toLowerCase() &&
                item.subcategoryname?.toLowerCase() === posterGenerate.subcategoryname?.toLowerCase() &&
                item.themename?.toLowerCase() === posterGenerate.themename?.toLowerCase());
        let employees = employeeValueAdd?.map(data => data);

        if (enableManualGenerate) {
            if (posterGenerate.categoryname === "Please Select Category Template Name") {
                setPopupContentMalert("Please Select Category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.subcategoryname ===
                "Please Select Sub-category Template Name"
            ) {
                setPopupContentMalert("Please Select Sub-category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.company ===
                "Please Select Company"
            ) {
                setPopupContentMalert("Please Select Company");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.branch ===
                "Please Select Branch"
            ) {
                setPopupContentMalert("Please Select Branch");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.unit ===
                "Please Select Unit"
            ) {
                setPopupContentMalert("Please Select Unit");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.team ===
                "Please Select Team"
            ) {
                setPopupContentMalert("Please Select Team");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                manualEntry.manualentryname ===
                ""
            ) {
                setPopupContentMalert("Please Enter Employee Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                manualEntry.manualentrydate ===
                ""
            ) {
                setPopupContentMalert("Please Select Date!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                documentFiles?.length === 0
            ) {
                setPopupContentMalert("Please Upload Profile!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            } else {
                sendRequest();
            }

        }
        else {
            if (posterGenerate.categoryname === "Please Select Category Template Name") {
                setPopupContentMalert("Please Select Category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.subcategoryname ===
                "Please Select Sub-category Template Name"
            ) {
                setPopupContentMalert("Please Select Sub-category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (companyValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Company!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (branchValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Branch!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (unitValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Unit!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (teamValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Team!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (posterGenerate?.days === "Please Select Days") {
                setPopupContentMalert("Please Select Days");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (posterGenerate?.days === "Custom Fields" && posterGenerate.fromdate === "") {
                setPopupContentMalert("Please Select From Date");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (employeeValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Employee!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (isNameMatch) {
                setPopupContentMalert("Data Already Exist!!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }

            else {
                sendRequest();
            }
        }
    };
    const handleclear = (e) => {
        e.preventDefault();
        setPosterGenerate({
            categoryname: "Please Select Category Template Name",
            subcategoryname: "Please Select Sub-category Template Name",
            themename: "Please Select Theme Name",
            days: "Please Select Days",
        });
        setSubcategoryOption([]);
        setSelectedThemeNames([]);
        setThemeNames([])
        setValueCat([]);
        setEmployeeValueAdd([])
        setEmployeeOptionDaysWise([])
        setCompanyValueAdd([])
        setValueCompanyAdd([])
        setBranchOption([])
        setBranchValueAdd([])
        setValueBranchAdd([])
        setUnitOption([])
        setUnitValueAdd([])
        setValueUnitAdd([])
        setTeamOption([])
        setTeamValueAdd([])
        setValueTeamAdd([])
        setdocumentFiles([])
        setManualEntry({
            manualentryname: "",
            manualentrydate: ""
        });
        setManualGenerate(false)
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


    // get single row to view....
    const getviewCode = async (e) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.POSTERGENERATE_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setPosterGenerateEdit(res?.data?.spostergenerate);
            handleClickOpenview();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    // get single row to view....
    const getinfoCode = async (e) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.POSTERGENERATE_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setPosterGenerateEdit(res?.data?.spostergenerate);
            handleClickOpeninfo();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    // updateby edit page...
    let updateby = posterGenerateEdit?.updatedby;

    let addedby = posterGenerateEdit?.addedby;
    let holidayId = posterGenerateEdit?._id;
    //editing the single data...
    const sendEditRequest = async () => {
        setPageName(!pageName);
        try {
            let res = await axios.put(
                `${SERVICE.POSTERGENERATE_SINGLE}/${holidayId}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                    categoryname: String(posterGenerateEdit.categoryname),
                    subcategoryname: String(posterGenerateEdit.subcategoryname),
                    themename: String(posterGenerateEdit.themename),
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
            await fetchEmployee();
            await fetchHolidayAllGroup();
            handleCloseModEdit();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const editSubmit = (e) => {
        e.preventDefault();
        fetchEmployee();
        const isNameMatch = allStatusEdit?.some(
            (item) =>
                item.categoryname?.toLowerCase() == posterGenerateEdit.categoryname?.toLowerCase() &&
                item.subcategoryname?.toLowerCase() == posterGenerateEdit.subcategoryname?.toLowerCase()
                &&
                item.themename?.some(data => valueCatEdit?.includes(data))
        );
        if (posterGenerateEdit.categoryname === "Please Select Category Template Name") {
            setPopupContentMalert("Please Select Category Template Name!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else if (
            posterGenerateEdit.subcategoryname ===
            "Please Select Sub-category Template Name"
        ) {
            setPopupContentMalert("Please Select Sub-category Template Name!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (selectedThemeNamesEdit?.length === 0) {
            setPopupContentMalert("Please Select Theme Name!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {
            setPopupContentMalert("Data Already Exist!!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            sendEditRequest();
        }
    };
    //get all data.
    // const fetchHolidayAll = async () => {
    //     setStatusCheck(true)

    //     setPageName(!pageName);
    //     try {

    //         let res_status = await axios.post(SERVICE.POSTERGENERATE, {
    //             assignbranch: accessbranch
    //         }, {
    //             headers: {
    //                 Authorization: `Bearer ${auth.APIToken}`,
    //             },
    //         });
    //         setPosterGenerates(res_status?.data?.postergenerates);
    //         setAllStatusEdit(
    //             res_status?.data?.postergenerates.filter((item) => item._id !== userId)
    //         );
    //         await fetchHolidayAllGroup();
    //         setStatusCheck(false)
    //     } catch (err) {
    //         setStatusCheck(false)
    //         handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    //     }
    // };

    const gridRefTableImg = useRef(null);

    //image

    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "PosterGenerate.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Poster Generate",
        pageStyle: "print",
    });
    //get all data.
    const [statusCheckchild, setStatusCheckchild] = useState(true);
    const [childGroupAll, setChildGroupAll] = useState([])
    const fetchHolidayAllGroup = async () => {
        setPageName(!pageName);
        setStatusCheckchild(true)
        try {
            let res_status = await axios.post(SERVICE.POSTERGENERATEGROUP, {
                assignbranch: accessbranch
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            setChildGroupAll(res_status?.data?.postergenerates);
            setStatusCheckchild(false)
        } catch (err) {
            setStatusCheckchild(false)
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    //serial no for listing items
    const addSerialNumber = (data) => {
        // const itemsWithSerialNumber = posterGenerates?.map((item, index) => ({
        //     ...item,
        //     serialNumber: index + 1,
        // }));
        setItems(data);
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
    // const filteredData = filteredDatas?.slice(
    //     (page - 1) * pageSize,
    //     page * pageSize
    // );
    // const totalPages = Math.ceil(filteredDatas?.length / pageSize);
    // const visiblePages = Math.min(totalPages, 3);
    // const firstVisiblePage = Math.max(1, page - 1);
    // const lastVisiblePage = Math.min(
    //     firstVisiblePage + visiblePages - 1,
    //     totalPages
    // );
    // const pageNumbers = [];
    // for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    //     pageNumbers.push(i);
    // }
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

            sortable: false, // Optionally, you can make this column not sortable
            width: 90,
            headerCheckboxSelection: true,
            checkboxSelection: true,
            hide: !columnVisibility.checkbox,
            headerClassName: "bold-header",
            pinned: 'left', lockPinned: true,
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
            field: "employeename",
            headerName: "Employee Name",
            flex: 0,
            width: 150,
            hide: !columnVisibility.employeename,
            headerClassName: "bold-header",
        },
        {
            field: "categoryname",
            headerName: "Category Template Name",
            flex: 0,
            width: 150,
            hide: !columnVisibility.categoryname,
            headerClassName: "bold-header",
        },
        {
            field: "subcategoryname",
            headerName: "Sub-Category Template Name",
            flex: 0,
            width: 150,
            hide: !columnVisibility.subcategoryname,
            headerClassName: "bold-header",
        },
        {
            field: "themename",
            headerName: "Theme Name",
            flex: 0,
            width: 150,
            hide: !columnVisibility.themename,
            headerClassName: "bold-header",
        },
        {
            field: "company",
            headerName: "Company",
            flex: 0,
            width: 150,
            hide: !columnVisibility.company,
            headerClassName: "bold-header",
        },
        {
            field: "branch",
            headerName: "Branch",
            flex: 0,
            width: 150,
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
                    {isUserRoleCompare?.includes("vpostergenerate") && (

                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                handleDownloadClick(params.data);
                            }}
                        >
                            <CloudDownloadOutlinedIcon style={{ fontsize: "large" }} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("dpostergenerate") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                rowData(params.data.id);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />                        </Button>
                    )}
                    {isUserRoleCompare?.includes("vpostergenerate") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getviewCode(params.data.id);
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />                        </Button>
                    )}
                    {isUserRoleCompare?.includes("ipostergenerate") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getinfoCode(params.data.id);
                            }}
                        >
                            <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />                        </Button>
                    )}
                </Grid>
            ),
        },
    ];

    const filteredSelectedColumn = columnDataTable.filter(data => data.field !== 'checkbox' && data.field !== "actions" && data.field !== "serialNumber");

    const rowDataTable = filteredDatas.map((item, index) => {

        return {
            ...item,
            id: item._id,
            serialNumber: item.serialNumber,
            categoryname: item.categoryname,
            subcategoryname: item.subcategoryname,
            themename: item.themename,
            company: item?.company.toString(),
            branch: item?.branch.toString(),
            unit: item?.unit.toString(),
            team: item?.team.toString(),
            posterdownload: item?.posterdownload
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
    const [wishingMessage, setWishingMessage] = useState([])


    const getwishingmessage = async (e) => {
        setPageName(!pageName);

        try {
            let response = await axios.get(`${SERVICE.POSTERMESSAGESETTINGALL}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setWishingMessage(response?.data?.postermessage)

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const [footerMessage, setfooterMessage] = useState('')

    const getfootermessage = async (e) => {
        setPageName(!pageName);

        try {
            let response = await axios.get(`${SERVICE.FOOTERMESSAGESETTINGALL}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setfooterMessage(response?.data?.footermessage[0]?.footermessage)

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("Poster Generate"),
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


    useEffect(() => {
        getapi()
        fetchCategoryAll();
        getwishingmessage();
        getfootermessage();
        fetchHolidayAllGroup();
        fetchBdaySetting();
    }, []);

    useEffect(() => {
        addSerialNumber(posterGenerates);
    }, [posterGenerates]);

    useEffect(() => {
        fetchEmployee();
    }, [isEditOpen]);
    useEffect(() => {
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, []);

    const delAccountcheckbox = async () => {
        setPageName(!pageName);
        setPosterGroup("1")
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.POSTERGENERATE_SINGLE}/${item}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
            });

            // Wait for all delete requests to complete
            await Promise.all(deletePromises);

            handleCloseModcheckbox();
            setSelectAllChecked(false);
            setPage(1);
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            await fetchEmployee();
            await fetchHolidayAllGroup();
            setPosterGroup("2")
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };

    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };


    // MultiSelects Add
    const [companyOption, setCompanyOption] = useState([]);
    const [companyValueAdd, setCompanyValueAdd] = useState([]);
    let [valueCompanyAdd, setValueCompanyAdd] = useState("");
    const customValueRendererCompanyAdd = (valueCompanyAdd, _companies) => {
        return valueCompanyAdd.length ? valueCompanyAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Company</span>
    }
    // Company MultiSelect
    const handleCompanyChangeAdd = (options) => {
        setValueCompanyAdd(
            options.map(a => {
                return a.value;
            })
        )
        setCompanyValueAdd(options);
        fetchBranch(options);
        setBranchOption([]);
        setBranchValueAdd([]);
        setUnitOption([]);
        setUnitValueAdd([]);
        setTeamOption([]);
        setEmployeeOptionDaysWise([])
        setTeamValueAdd([]);
        setEmployeeOption([]);
        setEmployeeValueAdd([]);
        setPosterGenerate({
            ...posterGenerate,
            days: "Please Select Days",
        });

    }
    // Fetching Companies
    const fetchCompanies = async () => {
        setPageName(!pageName);

        try {
            let result = await axios.get(SERVICE.COMPANY, {
                headers: {
                    Autorization: `Bearer ${auth.APIToken}`,
                },
            });
            //Remove Duplicates From Companies
            let uniqueCompanies = Array.from(new Set(result?.data?.companies.map((t) => t.name)));
            setCompanyOption(
                uniqueCompanies.map((t) => ({
                    label: t,
                    value: t
                }))
            )
        }
        catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    useEffect(() => {
        fetchCompanies();
    }, [])
    const [branchOption, setBranchOption] = useState([]);
    const [branchValueAdd, setBranchValueAdd] = useState([]);
    let [valueBranchAdd, setValueBranchAdd] = useState("");
    const customValueRendererBranchAdd = (valueBranchAdd, _branches) => {
        return valueBranchAdd.length ? valueBranchAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Branch</span>
    }
    // Branch Multi-Select
    const handleBranchChangeAdd = (options) => {
        setValueBranchAdd(
            options.map((a) => {
                return a.value;
            })
        );
        setBranchValueAdd(options);
        fetchUnits(options);
        setUnitOption([]);
        setUnitValueAdd([]);
        setTeamOption([]);
        setTeamValueAdd([]);
        setEmployeeOption([]);
        setEmployeeOptionDaysWise([])
        setEmployeeValueAdd([]);
        setPosterGenerate({
            ...posterGenerate,
            days: "Please Select Days",
        });

    };
    //Fetching Branches
    const fetchBranch = async (company) => {
        setPageName(!pageName);

        try {
            let res_branch = await axios.get(SERVICE.BRANCH, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let arr = [];
            res_branch?.data?.branch.map((t) => {
                company.forEach((d) => {
                    if (d.value == t.company) {
                        arr.push(t.name);
                    }
                });
            });
            setBranchOption(
                arr.map((t) => ({
                    label: t,
                    value: t,
                }))
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const [unitOption, setUnitOption] = useState([]);
    const [unitValueAdd, setUnitValueAdd] = useState([]);
    let [valueUnitAdd, setValueUnitAdd] = useState("");
    const customValueRendererUnitAdd = (valueUnitAdd, _units) => {
        return valueUnitAdd.length ? valueUnitAdd.map(({ label }) => label).join(",") :
            <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Unit</span>
    }
    //Unit MultiSelect
    const handleUnitChangeAdd = (options) => {
        setValueUnitAdd(
            options.map((a) => {
                return a.value;
            })
        );
        setUnitValueAdd(options);
        fetchTeams(options);
        setTeamValueAdd([]);
        setEmployeeOption([]);
        setEmployeeOptionDaysWise([])
        setEmployeeValueAdd([]);
        setPosterGenerate({
            ...posterGenerate,
            days: "Please Select Days",
        });
    }
    //Fetching Units
    const fetchUnits = async (branch) => {
        setPageName(!pageName);

        try {
            let res_branchunit = await axios.get(SERVICE.UNIT, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let arr = [];
            res_branchunit?.data?.units.map((t) => {
                branch.forEach((d) => {
                    if (d.value == t.branch) {
                        arr.push(t.name);
                    }
                });
            });
            setUnitOption(
                arr.map((t) => ({
                    label: t,
                    value: t,
                }))
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    const [teamOption, setTeamOption] = useState([]);
    const [teamValueAdd, setTeamValueAdd] = useState([]);
    let [valueTeamAdd, setValueTeamAdd] = useState("");
    const customValueRendererTeamAdd = (valueTeamAdd, _teams) => {
        return valueTeamAdd.length ? valueTeamAdd.map(({ label }) => label).join(",") :
            <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Team</span>
    }
    //Team MultiSelect
    const handleTeamChangeAdd = (options) => {
        setValueTeamAdd(
            options.map((a) => {
                return a.value;
            })
        );
        setTeamValueAdd(options);
        fetchEmployeeName(options)
        setEmployeeOptionDaysWise([])
        setEmployeeValueAdd([]);
        setPosterGenerate({
            ...posterGenerate,
            days: "Please Select Days",
        });
    }
    //Fetching Teams
    const fetchTeams = async (unit) => {
        setPageName(!pageName);

        try {
            let res_team = await axios.get(SERVICE.TEAMS, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let arr = [];
            res_team?.data?.teamsdetails?.map((t) => {
                unit.forEach((d) => {
                    if (d.value == t.unit) {
                        arr.push(t.teamname);
                    }
                });
            });
            setTeamOption(
                arr.map((t) => ({
                    label: t,
                    value: t,
                }))
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    // const [empcodeValueAdd, setEmpcodeValueAdd] = useState([]);
    const [employeeOption, setEmployeeOption] = useState([]);
    // console.log(employeeOption, "employeeOption")
    const [employeeOptionDaysWise, setEmployeeOptionDaysWise] = useState([]);
    // console.log(employeeValueAdd, "employeeValueAdd")

    let [valueEmployeeAdd, setValueEmployeeAdd] = useState("");
    const customValueRendererEmployeeAdd = (valueEmployeeAdd, _employees) => {
        return valueEmployeeAdd.length ? valueEmployeeAdd.map(({ label }) => label).join(",") :
            <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Employee</span>
    }
    //Employee MultiSelect
    const handleEmployeeChangeAdd = (options) => {
        setValueEmployeeAdd(
            options.map((a) => {
                return a.value;
            })
        );
        setEmployeeValueAdd(options);
    }

    const [thisweekBirthday, setthisweekBirthday] = useState();
    const [thismonthBirthday, setthismonthBirthday] = useState();
    const [lastweekBirthday, setlastweekBirthday] = useState();
    const [lastmonthBirthday, setlastmonthBirthday] = useState();
    // console.log(lastmonthBirthday, "lastmonthBirthday")
    const [overallBirthday, setoverallBirthday] = useState();

    const [thisweekWedding, setthisweekWedding] = useState()
    const [lastmonthwedding, setlastmonthwedding] = useState()
    const [lastweekWedding, setlastweekWedding] = useState()
    const [thismonthwedding, setthismonthwedding] = useState()
    const [overallWedding, setoverallWedding] = useState()



    const fetchBirthday = async () => {
        setPageName(!pageName);

        try {
            let response = await axios.get(`${SERVICE.POSTERGENERATEGROUP_GETBIRTHDAY}`, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
            });
            let sortedthisweek = response?.data?.userbirthdaythisweek.sort(
                (a, b) => new Date(a.dob) - new Date(b.dob)
            );
            let sortedlastmonth = response?.data?.userslastmonthdob.sort(
                (a, b) => new Date(a.doj) - new Date(b.doj)
            );
            let sortedlastweek = response?.data?.usersLastWeekdob.sort(
                (a, b) => new Date(a.dom) - new Date(b.dom)
            );
            let sortedthismonth = response?.data?.usersthismonthbod.sort(
                (a, b) => new Date(a.dom) - new Date(b.dom)
            );
            let sortedoverall = response?.data?.usersallbod.sort(
                (a, b) => new Date(a.dom) - new Date(b.dom)
            );

            //birthdaythisweek
            if (response?.data?.userbirthdaythisweek.length != 0) {
                const displayDates = sortedthisweek?.map((item) => {
                    const itemDate = new Date(item.dob);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dob: "Today",
                            _id: item._id,
                            legalname: item.legalname
                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dob: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setthisweekBirthday(displayDates);
            } else {
                setthisweekBirthday([]);
            }

            //birthdaylastmonth
            if (response?.data?.userslastmonthdob?.length != 0) {
                const displayDates = sortedlastmonth?.map((item) => {
                    const itemDate = new Date(item.dob);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dob: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dob: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setlastmonthBirthday(displayDates);
                // console.log(displayDates, "displayDates");
            } else {
                setlastmonthBirthday([]);
            }

            //birthdaylastweek
            if (response?.data?.usersLastWeekdob.length != 0) {
                const displayDates = sortedlastweek?.map((item) => {
                    const itemDate = new Date(item.dob);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dob: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dob: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setlastweekBirthday(displayDates);
            } else {
                setlastweekBirthday([]);
            }


            //birthdaythismonth
            if (response?.data?.usersthismonthbod.length != 0) {
                const displayDates = sortedthismonth?.map((item) => {
                    const itemDate = new Date(item.dob);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dob: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dob: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setthismonthBirthday(displayDates);
            } else {
                setthismonthBirthday([]);
            }

            //birthdayoverall
            if (response?.data?.usersallbod.length != 0) {
                const displayDates = sortedoverall?.map((item) => {
                    const itemDate = new Date(item.dob);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dob: "Today",
                            _id: item._id,
                            legalname: item.legalname
                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dob: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname
                        };
                    }
                });
                setoverallBirthday(displayDates);
            } else {
                setoverallBirthday([]);
            }


        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const fetchWeddingAnnivesary = async () => {
        setPageName(!pageName);

        try {
            let response = await axios.get(`${SERVICE.POSTERGENERATEGROUP_GETWEDDINGANNIVERSARY}`, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
            });

            let sortedthisweek = response?.data?.userweddingthisweek.sort(
                (a, b) => new Date(a.dom) - new Date(b.dom)
            );
            let sortedlastmonth = response?.data?.userslastmonthdom.sort(
                (a, b) => new Date(a.doj) - new Date(b.doj)
            );
            let sortedlastweek = response?.data?.usersLastWeekdom.sort(
                (a, b) => new Date(a.dom) - new Date(b.dom)
            );
            let sortedthismonth = response?.data?.usersthismonthdom.sort(
                (a, b) => new Date(a.dom) - new Date(b.dom)
            );
            let sortedoverall = response?.data?.usersalldom.sort(
                (a, b) => new Date(a.dom) - new Date(b.dom)
            );



            //weddingthisweek
            if (response?.data?.userweddingthisweek.length != 0) {
                const displayDates = sortedthisweek?.map((item) => {
                    const itemDate = new Date(item.dom);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dom: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dom: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setthisweekWedding(displayDates);
            } else {
                setthisweekWedding([]);
            }

            //lastmonth
            if (response?.data?.userslastmonthdom?.length != 0) {
                const displayDates = sortedlastmonth?.map((item) => {
                    const itemDate = new Date(item.dom);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dom: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dom: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setlastmonthwedding(displayDates);
            } else {
                setlastmonthwedding([]);
            }

            //lastweek
            if (response?.data?.usersLastWeekdom.length != 0) {
                const displayDates = sortedlastweek?.map((item) => {
                    const itemDate = new Date(item.dom);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dom: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dom: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setlastweekWedding(displayDates);
            } else {
                setlastweekWedding([]);
            }


            //thismonth
            if (response?.data?.usersthismonthdom.length != 0) {
                const displayDates = sortedthismonth?.map((item) => {
                    const itemDate = new Date(item.dom);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dom: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dom: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setthismonthwedding(displayDates);
            } else {
                setthismonthwedding([]);
            }

            //overall
            if (response?.data?.usersalldom.length != 0) {
                const displayDates = sortedoverall?.map((item) => {
                    const itemDate = new Date(item.dom);
                    const isToday =
                        itemDate.getDate() === currentDate.getDate() &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear();
                    if (isToday) {
                        return {
                            companyname: item.companyname,
                            dom: "Today",
                            _id: item._id,
                            legalname: item.legalname

                        };
                    } else {
                        const birthdate = itemDate.getDate();
                        const birthMonth = itemDate.getMonth() + 1;
                        const birthYear = itemDate.getFullYear();
                        return {
                            companyname: item.companyname,
                            dom: `${birthdate}-${birthMonth}-${birthYear}`,
                            _id: item._id,
                            legalname: item.legalname

                        };
                    }
                });
                setoverallWedding(displayDates);
            } else {
                setoverallWedding([]);
            }


        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const [employeeOptiondob, setEmployeeOptiondob] = useState([])


    //Fetching Employee
    const fetchEmployeeName = async (team) => {
        let teamsnew = team.map((item) => item.value);
        setPageName(!pageName);

        try {
            let res_employee = await axios.get(SERVICE.USER_POSTERGENERATE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const uniqueId = uuidv4();

            let arr = res_employee?.data?.users
                .filter((t) => team.some((item) => item.value === t.team))
                .map((t) => ({
                    ...t,
                    _id: t._id,
                    label: t.companyname,
                    value: t.companyname,
                    groupId: uniqueId,
                    legalname: t.legalname
                }));


            console.log(arr, "arr")
            setEmployeeOption(arr)
            setEmployeeOptiondob(arr)

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }

    // MultiSelect Edit
    const [companyOptionEdit, setCompanyOptionEdit] = useState([]);
    const [companyValueAddEdit, setCompanyValueAddEdit] = useState([]);
    let [valueCompanyAddEdit, setValueCompanyAddEdit] = useState("");
    const customValueRendererCompanyAddEdit = (valueCompanyAdd, _companies) => {
        return valueCompanyAdd.length ? valueCompanyAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Company</span>
    }
    // Company MultiSelect
    const handleCompanyChangeAddEdit = (options) => {
        setValueCompanyAddEdit(
            options.map(a => {
                return a.value;
            })
        )
        setCompanyValueAddEdit(options);
        fetchBranchEdit(options);
        setBranchOptionEdit([]);
        setBranchValueAddEdit([]);
        setUnitOptionEdit([]);
        setUnitValueAddEdit([]);
        setTeamOptionEdit([]);
        setEmployeeOptionEdit([]);
        setTeamValueAddEdit([]);
        setEmployeeValueAddEdit([]);
    }
    // Fetching CompaniesEdit
    const fetchCompaniesEdit = async () => {
        setPageName(!pageName);

        try {
            let result = await axios.get(SERVICE.COMPANY, {
                headers: {
                    Autorization: `Bearer ${auth.APIToken}`,
                },
            });
            //Remove Duplicates From Companies
            let uniqueCompanies = Array.from(new Set(result?.data?.companies.map((t) => t.name)));
            setCompanyOptionEdit(
                uniqueCompanies.map((t) => ({
                    label: t,
                    value: t
                }))
            )
        }
        catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }





    const [overallFilterdata, setOverallFilterdata] = useState([]);
    const [overallFilterdataAllData, setOverallFilterdataAllData] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [anchorElSearch, setAnchorElSearch] = React.useState(null);
    const handleClickSearch = (event) => {
        setAnchorElSearch(event.currentTarget);
        localStorage.removeItem("filterModel");
    };
    const handleCloseSearch = () => {
        setAnchorElSearch(null);
        setSearchQuery("");
    };

    const openSearch = Boolean(anchorElSearch);
    const idSearch = openSearch ? 'simple-popover' : undefined;

    const handleAddFilter = () => {
        if (selectedColumn && filterValue || ["Blank", "Not Blank"].includes(selectedCondition)) {
            setAdditionalFilters([
                ...additionalFilters,
                { column: selectedColumn, condition: selectedCondition, value: filterValue }
            ]);
            setSelectedColumn("");
            setSelectedCondition("Contains");
            setFilterValue("");
        }
    };


    const getSearchDisplay = () => {
        if (advancedFilter && advancedFilter.length > 0) {
            return advancedFilter.map((filter, index) => {
                let showname = columnDataTable.find(col => col.field === filter.column)?.headerName;
                return `${showname} ${filter.condition} "${filter.value}"`;
            }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
        }
        return searchQuery;
    };


    const handleResetSearch = async () => {

        setPageName(!pageName)

        setAdvancedFilter(null);
        setAdditionalFilters([]);
        setSearchQuery("");
        setIsSearchActive(false);
        setSelectedColumn("");
        setSelectedCondition("Contains");
        setFilterValue("");
        setLogicOperator("AND");
        setFilteredChanges(null);

        const queryParams = {
            page: Number(page),
            pageSize: Number(pageSize),
            searchQuery: searchQuery,
            assignbranch: accessbranch
        };

        const allFilters = [];
        // Only include advanced filters if they exist, otherwise just use regular searchQuery
        if (allFilters.length > 0 && selectedColumn !== "") {
            queryParams.allFilters = allFilters
            queryParams.logicOperator = logicOperator;
        } else if (searchQuery) {
            queryParams.searchQuery = searchQuery;  // Use searchQuery for regular search
        }


        try {
            let res_employee = await axios.post(SERVICE.POSTERGENERATEGROUP_SORT, queryParams, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []
            const itemsWithSerialNumber = ans?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                // serialNumber: index + 1,
            }));
            setPosterGenerates(itemsWithSerialNumber);
            setOverallFilterdataAllData(res_employee?.data?.totalProjectsAllData?.length > 0 ? res_employee?.data?.totalProjectsAllData?.map((item, index) => ({
                ...item,
                serialNumber: index + 1
            })) : []);
            setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
            setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
            setPageSize((data) => { return ans?.length > 0 ? data : 10 });
            setPage((data) => { return ans?.length > 0 ? data : 1 });
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const fetchEmployee = async () => {

        setPageName(!pageName)
        const queryParams = {
            page: Number(page),
            pageSize: Number(pageSize),
            searchQuery: searchQuery,
            assignbranch: accessbranch
        };


        const allFilters = [
            ...additionalFilters,
            { column: selectedColumn, condition: selectedCondition, value: filterValue }
        ];

        if (allFilters.length > 0 && selectedColumn !== "") {
            queryParams.allFilters = allFilters
            queryParams.logicOperator = logicOperator;
        } else if (searchQuery) {
            queryParams.searchQuery = searchQuery;
        }


        try {
            let res_employee = await axios.post(SERVICE.POSTERGENERATEGROUP_SORT, queryParams, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []
            const itemsWithSerialNumber = ans?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                // serialNumber: index + 1,
            }));
            setPosterGenerates(itemsWithSerialNumber);
            setOverallFilterdataAllData(res_employee?.data?.totalProjectsAllData?.length > 0 ? res_employee?.data?.totalProjectsAllData?.map((item, index) => ({
                ...item,
                serialNumber: index + 1
            })) : []);
            setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
            setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
            setPageSize((data) => { return ans?.length > 0 ? data : 10 });
            setPage((data) => { return ans?.length > 0 ? data : 1 });

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    useEffect(() => {
        fetchEmployee();
    }, [page, pageSize, searchQuery]);

    useEffect(() => {
        fetchCompaniesEdit();
        fetchBirthday();
        fetchWeddingAnnivesary();
    }, [])
    const [branchOptionEdit, setBranchOptionEdit] = useState([]);
    const [branchValueAddEdit, setBranchValueAddEdit] = useState([]);
    let [valueBranchAddEdit, setValueBranchAddEdit] = useState("");
    const customValueRendererBranchAddEdit = (valueBranchAdd, _branches) => {
        return valueBranchAdd.length ? valueBranchAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Branch</span>
    }
    // Branch Multi-Select
    const handleBranchChangeAddEdit = (options) => {
        setValueBranchAddEdit(
            options.map((a) => {
                return a.value;
            })
        );
        setBranchValueAddEdit(options);
        fetchUnitsEdit(options);
        setUnitOptionEdit([]);
        setUnitValueAddEdit([]);
        setTeamOptionEdit([]);
        setTeamValueAddEdit([]);
        setEmployeeOptionEdit([]);
        setEmployeeValueAddEdit([]);
    };
    //Fetching Branches Edit
    const fetchBranchEdit = async (company) => {
        setPageName(!pageName);

        try {
            let res_branch = await axios.get(SERVICE.BRANCH, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let arr = [];
            res_branch?.data?.branch.map((t) => {
                company.forEach((d) => {
                    if (d.value == t.company) {
                        arr.push(t.name);
                    }
                });
            });
            setBranchOptionEdit(
                arr.map((t) => ({
                    label: t,
                    value: t,
                }))
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const [unitOptionEdit, setUnitOptionEdit] = useState([]);
    const [unitValueAddEdit, setUnitValueAddEdit] = useState([]);
    let [valueUnitAddEdit, setValueUnitAddEdit] = useState("");
    const customValueRendererUnitAddEdit = (valueUnitAdd, _units) => {
        return valueUnitAdd.length ? valueUnitAdd.map(({ label }) => label).join(",") :
            <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Unit</span>
    }
    //Unit MultiSelect Edit
    const handleUnitChangeAddEdit = (options) => {
        setValueUnitAddEdit(
            options.map((a) => {
                return a.value;
            })
        );
        setUnitValueAddEdit(options);
        fetchTeamsEdit(options);
    }
    //Fetching Units Edit
    const fetchUnitsEdit = async (branch) => {
        setPageName(!pageName);

        try {
            let res_branchunit = await axios.get(SERVICE.UNIT, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let arr = [];
            res_branchunit?.data?.units.map((t) => {
                branch.forEach((d) => {
                    if (d.value == t.branch) {
                        arr.push(t.name);
                    }
                });
            });
            setUnitOptionEdit(
                arr.map((t) => ({
                    label: t,
                    value: t,
                }))
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    const [teamOptionEdit, setTeamOptionEdit] = useState([]);
    const [teamValueAddEdit, setTeamValueAddEdit] = useState([]);
    let [valueTeamAddEdit, setValueTeamAddEdit] = useState("");
    const customValueRendererTeamAddEdit = (valueTeamAdd, _teams) => {
        return valueTeamAdd.length ? valueTeamAdd.map(({ label }) => label).join(",") :
            <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Team</span>
    }
    //Team MultiSelect Edit
    const handleTeamChangeAddEdit = (options) => {
        setValueTeamAddEdit(
            options.map((a) => {
                return a.value;
            })
        );
        setTeamValueAddEdit(options);
        fetchEmployeeEdit(options)
    }
    //Fetching Teams Edit
    const fetchTeamsEdit = async (unit) => {
        setPageName(!pageName);

        try {
            let res_team = await axios.get(SERVICE.TEAMS, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let arr = [];
            res_team?.data?.teamsdetails?.map((t) => {
                unit.forEach((d) => {
                    if (d.value == t.unit) {
                        arr.push(t.teamname);
                    }
                });
            });
            setTeamOptionEdit(
                arr.map((t) => ({
                    label: t,
                    value: t,
                }))
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    // const [empcodeValueAdd, setEmpcodeValueAdd] = useState([]);
    const [employeeOptionEdit, setEmployeeOptionEdit] = useState([]);
    const [employeeValueAddEdit, setEmployeeValueAddEdit] = useState([]);
    let [valueEmployeeAddEdit, setValueEmployeeAddEdit] = useState("");
    const customValueRendererEmployeeAddEdit = (valueEmployeeAdd, _employees) => {
        return valueEmployeeAdd.length ? valueEmployeeAdd.map(({ label }) => label).join(",") :
            <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Employee</span>
    }
    //Employee MultiSelect
    const handleEmployeeChangeAddEdit = (options) => {
        setValueEmployeeAddEdit(
            options.map((a) => {
                return a.value;
            })
        );
        setEmployeeValueAddEdit(options);
    }
    //Fetching Employee Edit
    const fetchEmployeeEdit = async (team) => {
        let teamsnew = team.map((item) => item.value);
        setPageName(!pageName);

        try {
            let res_employee = await axios.get(SERVICE.USER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let arr = res_employee?.data?.users.filter((t) => {
                return teamsnew.includes(t.team)
            });
            setEmployeeOptionEdit(
                arr.map((t) => ({
                    label: t.companyname,
                    value: t.companyname,
                }))
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }

    const navigate = useNavigate();

    const handlePreviewClick = () => {
        const allTemplates = menuItems?.filter(item => item?.title === "All-Template-Cards")?.find(item => item?.submenu)
            ?.submenu?.filter(item => item?.title === posterGenerate.themename
            );
        let employees = employeeValueAdd?.map(data => data);

        const employeesPerThreePersonTemplate = 3;
        const employeesPerTwoPersonTemplate = 2;
        const employeeCount = employeeValueAdd?.length;

        const template = allTemplates?.[0]?.url; // Single route from templates

        const getWishes = wishingMessage.filter((item) =>
            item?.categoryname === posterGenerate?.categoryname &&
            item?.subcategoryname === posterGenerate?.subcategoryname
        )[0]?.wishingmessage;



        if (enableManualGenerate) {
            if (posterGenerate.categoryname === "Please Select Category Template Name") {
                setPopupContentMalert("Please Select Category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.subcategoryname ===
                "Please Select Sub-category Template Name"
            ) {
                setPopupContentMalert("Please Select Sub-category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                manualEntry.manualentryname ===
                ""
            ) {
                setPopupContentMalert("Please Enter Employee Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                manualEntry.manualentrydate ===
                ""
            ) {
                setPopupContentMalert("Please Select Date!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            } else if (
                documentFiles?.length === 0
            ) {
                setPopupContentMalert("Please Upload Profile!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (posterGenerate.categoryname?.toLowerCase()?.includes("birthday") || posterGenerate.subcategoryname?.toLowerCase()?.includes("birthday")) {



                setTimeout(() => {
                    const randomWish = getWishes[Math.floor(Math.random() * getWishes?.length)];
                    const employee = manualEntry.manualentryname;
                    const employeedate = manualEntry.manualentrydate;

                    const url = `/birthdaycardtwomanualtemplate/?name=${employee?.toUpperCase()}&date=${employeedate}&wish=${encodeURIComponent(randomWish)}&footer=${encodeURIComponent(footerMessage)}`;
                    // const url = `/birthdaycardtwomanualtemplate/?name=${employee}&date=${employeedate}&wish=${encodeURIComponent(randomWish)}&footer=${encodeURIComponent(footerMessage)}`, { state: { profileimage: documentFiles[0]?.preview } };

                    if (documentFiles[0]?.preview) {
                        localStorage.setItem('profileImage', documentFiles[0]?.preview);
                    }

                    window.open(url, '_blank');
                }, 500);

            }
            else if (posterGenerate.categoryname?.toLowerCase()?.includes("wedding") || posterGenerate.subcategoryname?.toLowerCase()?.includes("wedding")) {


                setTimeout(() => {
                    // const randomWish = getWishes[Math.floor(Math.random() * getWishes?.length)];
                    // const employee = manualEntry.manualentryname;
                    // const employeedate = manualEntry.manualentrydate;

                    // const url = `/weddingcardmanualtemplate/?name=${employee}&date=${employeedate}&wish=${encodeURIComponent(randomWish)}&footer=${encodeURIComponent(footerMessage)}`;
                    // window.open(url, '_blank');

                    // if (documentFiles[0]?.preview) {
                    //     localStorage.setItem('profileImage', documentFiles[0]?.preview);
                    // }

                    // window.open(url, '_blank');

                    const randomWish = getWishes[Math.floor(Math.random() * getWishes?.length)];
                    const employee = manualEntry.manualentryname;
                    const employeedate = manualEntry.manualentrydate;

                    const url = `/weddingcardmanualtemplate/?name=${employee?.toUpperCase()}&date=${employeedate}&wish=${encodeURIComponent(randomWish)}&footer=${encodeURIComponent(footerMessage)}`;
                    // const url = `/birthdaycardtwomanualtemplate/?name=${employee}&date=${employeedate}&wish=${encodeURIComponent(randomWish)}&footer=${encodeURIComponent(footerMessage)}`, { state: { profileimage: documentFiles[0]?.preview } };

                    if (documentFiles[0]?.preview) {
                        localStorage.setItem('profileImage', documentFiles[0]?.preview);
                    }

                    window.open(url, '_blank');
                }, 500);



            }
        }
        else {

            if (posterGenerate.categoryname === "Please Select Category Template Name") {
                setPopupContentMalert("Please Select Category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (
                posterGenerate.subcategoryname ===
                "Please Select Sub-category Template Name"
            ) {
                setPopupContentMalert("Please Select Sub-category Template Name!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (companyValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Company!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (branchValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Branch!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (unitValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Unit!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (teamValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Team!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (posterGenerate?.days === "Please Select Days") {
                setPopupContentMalert("Please Select Days");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (posterGenerate?.days === "Custom Fields" && posterGenerate.fromdate === "") {
                setPopupContentMalert("Please Select From Date");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (employeeValueAdd?.length === 0) {
                setPopupContentMalert("Please Select Employee!");
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            }
            else if (posterGenerate.categoryname?.toLowerCase()?.includes("birthday") || posterGenerate.subcategoryname?.toLowerCase()?.includes("birthday")) {
                if (employeeCount > 0) {
                    let remainingEmployees = employeeCount;
                    const numberOfThreePersonTemplates = Math.floor(remainingEmployees / employeesPerThreePersonTemplate);

                    // Handling 3-person templates
                    for (let i = 0; i < numberOfThreePersonTemplates; i++) {
                        const threePersonGroup = employeeValueAdd.slice(i * 3, (i + 1) * 3);

                        setTimeout(() => {
                            const randomWish = getWishes[Math.floor(Math.random() * getWishes?.length)];
                            let combinedEmployeeData = '';

                            threePersonGroup.forEach((employee, index) => {
                                if (index > 0) combinedEmployeeData += '_';  // Add a separator between employee details
                                combinedEmployeeData += `${employee?.legalname}-${employee?._id}`;
                            });

                            const url = `/birthdaycardtwo3nos/?combinedData=${combinedEmployeeData}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}`;
                            window.open(url, '_blank');
                        }, i * 500);
                    }

                    // Handle remaining employees after 3-person templates
                    remainingEmployees = employeeCount % 3;  // This gives us the number of remaining employees after the 3-person groups
                    const startIdx = numberOfThreePersonTemplates * 3;
                    const remainingEmployeeSlice = employeeValueAdd.slice(startIdx);

                    // Handle 2-person template
                    if (remainingEmployees === 2) {
                        const twoPersonGroup = remainingEmployeeSlice.slice(0, 2);  // Select remaining 2 employees

                        setTimeout(() => {
                            const randomWish = getWishes[Math.floor(Math.random() * getWishes.length)];
                            let combinedEmployeeData = '';

                            twoPersonGroup.forEach((employee, index) => {
                                if (index > 0) combinedEmployeeData += '_';
                                combinedEmployeeData += `${employee?.legalname}-${employee?._id}`;
                            });

                            const url = `/birthdaycardtwo2nos/?combinedData=${combinedEmployeeData}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}`;
                            window.open(url, '_blank');
                        }, 500);  // Delay of 500ms for opening the tab
                    }

                    // Handle 1-person template
                    if (remainingEmployees === 1) {
                        const onePersonGroup = remainingEmployeeSlice.slice(0, 1);  // Select the remaining single employee

                        setTimeout(() => {
                            const randomWish = getWishes[Math.floor(Math.random() * getWishes?.length)];
                            const employee = onePersonGroup[0];

                            const url = `/birthdaycardtwo/?name=${employee?.legalname}&id=${employee?._id}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}`;
                            window.open(url, '_blank');
                        }, 500);
                    }
                } else {
                    // No employees to process
                    console.log("No employees to process.");
                }
            }
            else if (posterGenerate.categoryname?.toLowerCase()?.includes("wedding") || posterGenerate.subcategoryname?.toLowerCase()?.includes("wedding")) {
                if (employeeCount > 0) {
                    let remainingEmployees = employeeCount;
                    const numberOfThreePersonTemplates = Math.floor(remainingEmployees / employeesPerThreePersonTemplate);

                    // Handling 3-person templates
                    for (let i = 0; i < numberOfThreePersonTemplates; i++) {
                        const threePersonGroup = employeeValueAdd.slice(i * 3, (i + 1) * 3);

                        setTimeout(() => {
                            const randomWish = getWishes[Math.floor(Math.random() * getWishes.length)];
                            let combinedEmployeeData = '';

                            threePersonGroup.forEach((employee, index) => {
                                if (index > 0) combinedEmployeeData += '_';  // Add a separator between employee details
                                combinedEmployeeData += `${employee?.legalname}-${employee?._id}`;
                            });

                            const url = `/weddingcard3nos/?combinedData=${combinedEmployeeData}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}`;
                            window.open(url, '_blank');
                        }, i * 500);
                    }

                    // Handle remaining employees after 3-person templates
                    remainingEmployees = employeeCount % 3;  // This gives us the number of remaining employees after the 3-person groups
                    const startIdx = numberOfThreePersonTemplates * 3;
                    const remainingEmployeeSlice = employeeValueAdd.slice(startIdx);

                    // Handle 2-person template
                    if (remainingEmployees === 2) {
                        const twoPersonGroup = remainingEmployeeSlice.slice(0, 2);  // Select remaining 2 employees

                        setTimeout(() => {
                            const randomWish = getWishes[Math.floor(Math.random() * getWishes.length)];
                            let combinedEmployeeData = '';

                            twoPersonGroup.forEach((employee, index) => {
                                if (index > 0) combinedEmployeeData += '_';
                                combinedEmployeeData += `${employee?.legalname}-${employee?._id}`;
                            });

                            const url = `/weddingcard2nos/?combinedData=${combinedEmployeeData}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}`;
                            window.open(url, '_blank');
                        }, 500);  // Delay of 500ms for opening the tab
                    }

                    // Handle 1-person template
                    if (remainingEmployees === 1) {
                        const onePersonGroup = remainingEmployeeSlice.slice(0, 1);  // Select the remaining single employee

                        setTimeout(() => {
                            const randomWish = getWishes[Math.floor(Math.random() * getWishes?.length)];
                            const employee = onePersonGroup[0];

                            const url = `/weddingcard/?name=${employee?.legalname}&id=${employee?._id}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}`;
                            window.open(url, '_blank');
                        }, 500);
                    }
                } else {
                    // No employees to process
                    console.log("No employees to process.");
                }
            }
        }
    };

    const handleDownloadClick = (row) => {
        const allTemplates = menuItems?.filter(item => item?.title === "All-Template-Cards")?.find(item => item?.submenu)
            ?.submenu?.filter(item => item?.title === row?.themename
            );
        let employeename = row?.posterdownload;
        let employeenamesingle = row?.posterdownload[0]?.legalname;
        let employeenamesingleid = row?.id;
        let employeedbid = row?.employeedbid;
        // const template = allTemplates?.[0]?.url;
        const templatesubcat = row?.subcategoryname
        const templatecat = row?.categoryname
        const getWishes = wishingMessage.filter((item) =>
            item?.categoryname === row?.categoryname &&
            item?.subcategoryname === row?.subcategoryname
        )[0]?.wishingmessage;

        if (
            row?.themename === "Manual Template"
        ) {

            setTimeout(() => {
                const randomWish = getWishes[Math.floor(Math.random() * getWishes?.length)];
                const employee = row.manualentryname;
                const employeedate = row.manualentrydate;

                const url = `${templatecat?.toLowerCase()?.includes("birthday") || templatesubcat?.toLowerCase()?.includes("birthday") ? "/birthdaycardtwomanualtemplate" : "/weddingcardmanualtemplate"}/?name=${employee}&date=${employeedate}&wish=${encodeURIComponent(randomWish)}&footer=${encodeURIComponent(footerMessage)}&status=${true}`;
                // const url = `/birthdaycardtwomanualtemplate/?name=${employee}&date=${employeedate}&wish=${encodeURIComponent(randomWish)}&footer=${encodeURIComponent(footerMessage)}`, { state: { profileimage: documentFiles[0]?.preview } };

                if (row?.documentFiles[0]?.preview) {
                    localStorage.setItem('profileImage', row?.documentFiles[0]?.preview);
                }

                window.open(url, '_blank');
            }, 500);

        }
        else {
            if (
                row?.themename === "3-Person Template"
            ) {
                if (employeename.length % 3 === 0) {
                    for (let i = 0; i < employeename.length; i += 3) {
                        setTimeout(() => {
                            const randomWish = getWishes[Math.floor(Math.random() * getWishes.length)];

                            let combinedEmployeeData = '';

                            if (employeename[i]) {
                                combinedEmployeeData += `${employeename[i]?.legalname}-${employeename[i]?._id}`;
                            }

                            if (employeename[i + 1]) {
                                combinedEmployeeData += `_${employeename[i + 1]?.legalname}-${employeename[i + 1]?._id}`;
                            }

                            if (employeename[i + 2]) {
                                combinedEmployeeData += `_${employeename[i + 2]?.legalname}-${employeename[i + 2]?._id}`;
                            }

                            const url = `${templatecat?.toLowerCase()?.includes("birthday") ||
                                templatesubcat?.toLowerCase()?.includes("birthday") ? "/birthdaycardtwo3nos" : "/weddingcard3nos"}/?combinedData=${combinedEmployeeData}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}&status=${true}`;

                            window.open(url, '_blank');
                        }, i * 500);
                    }
                } else {
                    setPopupContentMalert("Please Select Birthday 3NOS!");
                    setPopupSeverityMalert("info");
                    handleClickOpenPopupMalert();
                }
            }
            else if (
                row?.themename === "2-Person Template"
            ) {
                if (employeename.length % 2 === 0) {
                    for (let i = 0; i < employeename.length; i += 2) {
                        setTimeout(() => {
                            let combinedEmployeeData = '';

                            const randomWish = getWishes[Math.floor(Math.random() * getWishes.length)];

                            if (employeename[i]) {
                                combinedEmployeeData += `${employeename[i]?.legalname}-${employeename[i]?._id}`;
                            }

                            if (employeename[i + 1]) {
                                combinedEmployeeData += `_${employeename[i + 1]?.legalname}-${employeename[i + 1]?._id}`;
                            }

                            const url = `${templatecat?.toLowerCase()?.includes("birthday") || templatesubcat?.toLowerCase()?.includes("birthday") ? "/birthdaycardtwo2nos" : "/weddingcard2nos"}/?combinedData=${combinedEmployeeData}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}&status=${true}`;

                            window.open(url, '_blank');
                        }, i * 500);
                    }
                } else {
                    setPopupContentMalert("Please Select Birthday 2NOS!");
                    setPopupSeverityMalert("info");
                    handleClickOpenPopupMalert();
                }
            }
            else if (
                row?.themename === "1-Person Template"
            ) {

                const randomWish = getWishes[Math.floor(Math.random() * getWishes.length)];

                // const template = allTemplates?.[0]?.url;
                const url = `${templatecat?.toLowerCase()?.includes("birthday") || templatesubcat?.toLowerCase()?.includes("birthday") ? "/birthdaycardtwo" : "/weddingcard"}/?name=${employeenamesingle}&id=${employeename[0]?._id}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}&status=${true}`;

                // const url = `${template}/?name=${employeename}&id=${employeedbid}&status=${true}`;
                window.open(url, '_blank');

            }
            else {

                const randomWish = getWishes[Math.floor(Math.random() * getWishes.length)];

                // const template = allTemplates?.[0]?.url;
                const url = `${templatecat?.toLowerCase()?.includes("birthday") || templatesubcat?.toLowerCase()?.includes("birthday") ? "/birthdaycardtwo" : "/weddingcard"}/?name=${employeenamesingle}&id=${employeename[0]?._id}&wish=${encodeURIComponent(randomWish)}&footer=${footerMessage}&status=${true}`;

                // const url = `${template}/?name=${employeenamesingle}&id=${employeedbid}&status=${true}`;
                window.open(url, '_blank');
            }
        }

        setPosterGenerate({
            categoryname: "Please Select Category Template Name",
            subcategoryname: "Please Select Sub-category Template Name",
            themename: "Please Select Theme Name",
            days: "Please Select Days",
            todate: "",
            fromdate: ""
        });

    };



    const [fileFormat, setFormat] = useState("");
    const [posterGroup, setPosterGroup] = useState("");

    const daysoptions = [
        { label: "Yesterday", value: "Yesterday" },
        { label: "Last Week", value: "Last Week" },
        { label: "Last Month", value: "Last Month" },
        { label: "Today", value: "Today" },
        { label: "This Week", value: "This Week" },
        { label: "This Month", value: "This Month" },
        { label: "Custom Fields", value: "Custom Fields" },
    ]

    return (
        <Box>

            <>


                <>
                    <Grid container spacing={2}>
                        <Grid
                            item
                            lg={12}
                            md={12}
                            sm={12}
                            xs={12}
                        >
                            <Typography sx={userStyle.importheadtext}>
                                Add Poster Generate
                            </Typography>
                        </Grid>

                        <Grid item lg={1} md={12} sm={12} xs={12}>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Checkbox checked={enableManualGenerate} />}
                                    onChange={(e) => {
                                        setManualGenerate(!enableManualGenerate);
                                        setPosterGenerate({
                                            categoryname: "Please Select Category Template Name",
                                            subcategoryname: "Please Select Sub-category Template Name",
                                            themename: "Please Select Theme Name",
                                            days: "Please Select Days",
                                            company: "Please Select Company",
                                            branch: "Please Select Branch",
                                            unit: "Please Select Unit",
                                            team: "Please Select Team",
                                        });
                                        setSubcategoryOption([]);
                                        setSelectedThemeNames([]);
                                        setThemeNames([])
                                        setValueCat([]);
                                        setEmployeeValueAdd([])
                                        setEmployeeOptionDaysWise([])
                                        setCompanyValueAdd([])
                                        setValueCompanyAdd([])
                                        setBranchOption([])
                                        setBranchValueAdd([])
                                        setValueBranchAdd([])
                                        setUnitOption([])
                                        setUnitValueAdd([])
                                        setValueUnitAdd([])
                                        setTeamOption([])
                                        setTeamValueAdd([])
                                        setValueTeamAdd([])
                                        setdocumentFiles([])
                                        setManualEntry({
                                            manualentryname: "",
                                            manualentrydate: ""
                                        });
                                    }}
                                    label="Manual"
                                />
                            </FormGroup>
                        </Grid>
                        <Grid item lg={10} md={12} sm={12} xs={12}>
                        </Grid>
                        <Grid item md={4} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Poster Category Template Name<b style={{ color: "red" }}>*</b>{" "}
                                </Typography>
                                <Selects
                                    options={categoryOption}
                                    styles={colourStyles}
                                    value={{
                                        label: posterGenerate.categoryname,
                                        value: posterGenerate.categoryname,
                                    }}
                                    onChange={(e) => {
                                        setPosterGenerate({
                                            ...posterGenerate,
                                            categoryname: e.value,
                                            subcategoryname:
                                                "Please Select Sub-category Template Name",
                                            themename: "Please Select Theme Name",
                                            days: "Please Select Days",

                                        });
                                        fetchSubcategoryBased(e);
                                        setThemeNames([])
                                        // setEmployeeOption([]);
                                        setEmployeeValueAdd([]);

                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={4} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Poster Sub-category Template Name<b style={{ color: "red" }}>*</b>{" "}
                                </Typography>
                                <Selects
                                    options={subcategoryOpt}
                                    styles={colourStyles}
                                    value={{
                                        label: posterGenerate.subcategoryname,
                                        value: posterGenerate.subcategoryname,
                                    }}
                                    onChange={(e) => {
                                        setPosterGenerate({
                                            ...posterGenerate,
                                            subcategoryname: e.value,
                                            themename: "Please Select Theme Name",

                                        });
                                        // fetchThemeBased(e)
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        {enableManualGenerate ?
                            <>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Company<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <Selects
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
                                            styles={colourStyles}
                                            value={{
                                                label: posterGenerate.company,
                                                value: posterGenerate.company,
                                            }}
                                            onChange={(e) => {
                                                setPosterGenerate({
                                                    ...posterGenerate,
                                                    company: e.value,
                                                    branch: "Please Select Branch",
                                                    unit: "Please Select Unit",
                                                    team: "Please Select Team",
                                                });


                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Branch<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <Selects
                                            options={accessbranch
                                                ?.filter((comp) => posterGenerate.company === comp.company)
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
                                            styles={colourStyles}
                                            value={{
                                                label: posterGenerate.branch,
                                                value: posterGenerate.branch,
                                            }}
                                            onChange={(e) => {
                                                setPosterGenerate({
                                                    ...posterGenerate,
                                                    branch: e.value,
                                                    unit: "Please Select Unit",
                                                    team: "Please Select Team",
                                                });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Unit<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <Selects
                                            options={accessbranch
                                                ?.filter(
                                                    (comp) =>
                                                        posterGenerate.company === comp.company &&
                                                        posterGenerate.branch === comp.branch
                                                )
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
                                            styles={colourStyles}
                                            value={{
                                                label: posterGenerate.unit,
                                                value: posterGenerate.unit,
                                            }}
                                            onChange={(e) => {
                                                setPosterGenerate({
                                                    ...posterGenerate,
                                                    unit: e.value,
                                                    team: "Please Select Team",
                                                });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Team<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <Selects
                                            options={allTeam
                                                ?.filter(
                                                    (comp) =>
                                                        posterGenerate.company === comp.company &&
                                                        posterGenerate.branch === comp.branch &&
                                                        posterGenerate.unit === comp.unit
                                                )
                                                ?.map((data) => ({
                                                    label: data.teamname,
                                                    value: data.teamname,
                                                }))
                                                .filter((item, index, self) => {
                                                    return (
                                                        self.findIndex(
                                                            (i) =>
                                                                i.label === item.label && i.value === item.value
                                                        ) === index
                                                    );
                                                })}
                                            styles={{
                                                ...colourStyles,
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure dropdown appears above everything
                                                menu: (base) => ({ ...base, zIndex: 9999, position: "absolute" }), // Set high z-index for dropdown menu
                                            }}
                                            menuPortalTarget={document.body} // Ensures dropdown renders outside the Dialog
                                            menuPosition="fixed" // Ensures dropdown is positioned properly
                                            value={{
                                                label: posterGenerate.team,
                                                value: posterGenerate.team,
                                            }}
                                            onChange={(e) => {
                                                setPosterGenerate({ ...posterGenerate, team: e.value });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl size="small" fullWidth>
                                        <Typography>
                                            Employee Name<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            placeholder="Employee Name"
                                            value={manualEntry.manualentryname}
                                            onChange={(e) => {
                                                const regex = /^[A-Za-z\s]*$/;
                                                if (regex.test(e.target.value)) {
                                                    setManualEntry({
                                                        ...manualEntry,
                                                        manualentryname: e.target.value,
                                                    });
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl size="small" fullWidth>
                                        <Typography>
                                            Date<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <OutlinedInput
                                            id="component-outlined"
                                            type="date"
                                            placeholder="Employee Name"
                                            value={manualEntry.manualentrydate}
                                            onChange={(e) => {
                                                setManualEntry({
                                                    ...manualEntry,
                                                    manualentrydate: e.target.value,
                                                });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={2} sm={12} xs={12}>
                                    <Typography >Upload Profile<b style={{ color: "red" }}>*</b></Typography>
                                    <Grid sx={{ display: "flex" }}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            component="label"
                                            sx={{
                                                "@media only screen and (max-width:550px)": {
                                                    marginY: "5px",
                                                },
                                                ...buttonStyles.buttonsubmit
                                            }}
                                        >
                                            Upload
                                            <input
                                                type="file"
                                                id="resume"
                                                accept=".png, .jpeg"
                                                name="file"
                                                hidden
                                                onChange={(e) => {
                                                    handleResumeUpload(e);
                                                }}
                                            />
                                        </Button>
                                        &emsp;
                                    </Grid>
                                </Grid>
                                <Grid item md={6} sm={12} xs={12}>
                                    <Typography >&nbsp;</Typography>
                                    {documentFiles?.length > 0 &&
                                        documentFiles.map((file, index) => (
                                            <Grid
                                                container
                                                spacing={2}
                                                sx={{ display: "flex" }}
                                                key={index}
                                            >
                                                <Grid item md={8} sm={5} xs={5}>
                                                    <Typography>{file.name}</Typography>
                                                </Grid>
                                                <Grid item md={1} sm={1} xs={1}>
                                                    <VisibilityOutlinedIcon
                                                        style={{
                                                            fontsize: "large",
                                                            color: "#357AE8",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => renderFilePreview(file)}
                                                    />
                                                </Grid>
                                                <Grid item md={1} sm={1} xs={1}>
                                                    <Button
                                                        style={{
                                                            fontsize: "large",
                                                            color: "#357AE8",
                                                            cursor: "pointer",
                                                            marginTop: "-5px",
                                                        }}
                                                        onClick={() => handleFileDelete(index)}
                                                    >
                                                        <DeleteIcon />
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                </Grid>
                            </> :
                            <>
                                <Grid item lg={4} md={4} sm={3} xs={3}>
                                    <FormControl fullWidth size="small">
                                        <Typography sx={{ fontWeight: "500" }}>
                                            Company <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <MultiSelect size="small"
                                            // options={companyOption}
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
                                            value={companyValueAdd}
                                            valueRenderer={customValueRendererCompanyAdd}
                                            onChange={handleCompanyChangeAdd}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item lg={4} md={4} sm={3} xs={3}>
                                    <FormControl fullWidth size="small">
                                        <Typography sx={{ fontWeight: "500" }}>
                                            Branch <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <MultiSelect size="small"
                                            // options={branchOption}
                                            options={accessbranch
                                                ?.filter((comp) => companyValueAdd?.some((item) => item?.value === comp.company))
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
                                            value={branchValueAdd}
                                            valueRenderer={customValueRendererBranchAdd}
                                            onChange={handleBranchChangeAdd}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item lg={4} md={4} sm={3} xs={3}>
                                    <FormControl fullWidth size="small">
                                        <Typography sx={{ fontWeight: "500" }}>
                                            Unit <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <MultiSelect size="small"
                                            // options={unitOption}
                                            options={accessbranch
                                                ?.filter((comp) => branchValueAdd?.some((item) => item?.value === comp.branch))
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
                                            value={unitValueAdd}
                                            valueRenderer={customValueRendererUnitAdd}
                                            onChange={handleUnitChangeAdd}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item lg={4} md={4} sm={3} xs={3}>
                                    <FormControl fullWidth size="small">
                                        <Typography sx={{ fontWeight: "500" }}>
                                            Team <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <MultiSelect size="small"
                                            options={teamOption}
                                            value={teamValueAdd}
                                            valueRenderer={customValueRendererTeamAdd}
                                            onChange={handleTeamChangeAdd}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item lg={4} md={4} sm={3} xs={3}>
                                    <FormControl fullWidth size="small">
                                        <Typography sx={{ fontWeight: "500" }}>
                                            Days <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <Selects
                                            options={daysoptions}
                                            styles={colourStyles}
                                            value={{
                                                label: posterGenerate.days,
                                                value: posterGenerate.days,
                                            }}
                                            onChange={(e) => {
                                                setPosterGenerate({
                                                    ...posterGenerate,
                                                    days: e.value,
                                                    fromdate: "",
                                                    todate: ""
                                                });
                                                if (posterGenerate.categoryname?.toLowerCase()?.includes("birthday") || posterGenerate.subcategoryname?.toLowerCase()?.includes("birthday")) {
                                                    if (employeeOption?.length > 0 && e?.value === "Yesterday") {
                                                        const yesterday = moment().subtract(1, 'days').format('MM-DD');  // Get yesterday's date in MM-DD format
                                                        const empOpt = employeeOption?.filter((item) =>
                                                            thisweekBirthday?.some((val) => {
                                                                // Ensure `val.dob` is properly parsed (assuming it's in DD-MM-YYYY format)
                                                                const formattedDOB = moment(val?.dob, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).isValid()
                                                                    ? moment(val?.dob, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).format('MM-DD')
                                                                    : 'Invalid date';

                                                                return item?._id === val?._id && formattedDOB === yesterday;
                                                            })
                                                        );

                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "Last Week") {
                                                        const empOpt = employeeOption?.filter((item) =>
                                                            lastweekBirthday?.some((val) => item?._id === val?._id)
                                                        );
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "Last Month") {
                                                        const empOpt = employeeOption?.filter((item) =>
                                                            lastmonthBirthday?.some((val) => item?._id === val?._id)
                                                        );
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "Today") {
                                                        const empOpt = employeeOption?.filter((item) => thisweekBirthday?.some((val) => item?._id === val?._id && val?.dob === "Today"))
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "This Week") {
                                                        const empOpt = employeeOption?.filter((item) => thisweekBirthday?.some((val) => item?._id === val?._id))
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "This Month") {
                                                        const empOpt = employeeOption?.filter((item) => thismonthBirthday?.some((val) => item?._id === val?._id))
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }

                                                } else if (posterGenerate.categoryname?.toLowerCase()?.includes("wedding") || posterGenerate.subcategoryname?.toLowerCase()?.includes("wedding")) {
                                                    if (employeeOption?.length > 0 && e?.value === "Yesterday") {
                                                        const yesterday = moment().subtract(1, 'days').format('MM-DD');  // Get yesterday's date in MM-DD format
                                                        const empOpt = employeeOption?.filter((item) =>
                                                            thisweekWedding?.some((val) => {
                                                                // Ensure `val.dob` is properly parsed (assuming it's in DD-MM-YYYY format)
                                                                const formattedDOB = moment(val?.dom, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).isValid()
                                                                    ? moment(val?.dom, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).format('MM-DD')
                                                                    : 'Invalid date';

                                                                return item?._id === val?._id && formattedDOB === yesterday;
                                                            })
                                                        );

                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "Last Week") {
                                                        const empOpt = employeeOption?.filter((item) =>
                                                            lastweekWedding?.some((val) => item?._id === val?._id)
                                                        );
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "Last Month") {
                                                        const empOpt = employeeOption?.filter((item) =>
                                                            lastmonthwedding?.some((val) => item?._id === val?._id)
                                                        );
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "Today") {
                                                        const empOpt = employeeOption?.filter((item) => thisweekWedding?.some((val) => item?._id === val?._id && val?.dob === "Today"))
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "This Week") {
                                                        const empOpt = employeeOption?.filter((item) => thisweekWedding?.some((val) => item?._id === val?._id))
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                    else if (employeeOption?.length > 0 && e?.value === "This Month") {
                                                        const empOpt = employeeOption?.filter((item) => thismonthwedding?.some((val) => item?._id === val?._id))
                                                        setEmployeeOptionDaysWise(empOpt)
                                                    }
                                                }
                                                setEmployeeValueAdd([])
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                {posterGenerate.days === "Custom Fields" &&
                                    <>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    From Date<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <OutlinedInput
                                                    id="component-outlined"
                                                    type="date"
                                                    value={posterGenerate.fromdate}
                                                    onChange={(e) => {
                                                        const newFromDate = e.target.value;
                                                        setPosterGenerate((prevState) => ({
                                                            ...prevState,
                                                            fromdate: newFromDate,
                                                            // todate: prevState.todate && new Date(prevState.todate) > new Date(newFromDate) ? prevState.todate : ""
                                                            todate: ""
                                                        }));
                                                        if (posterGenerate.categoryname?.toLowerCase()?.includes("birthday")) {

                                                            const empOpt = overallBirthday?.filter((item) => {
                                                                const itemDob = moment(item?.dob, 'D-M-YYYY', true);
                                                                const fromDate = moment(newFromDate, 'YYYY-MM-DD', true);
                                                                return itemDob.isValid() && itemDob.isSameOrAfter(fromDate);
                                                            });
                                                            const uniqueId = uuidv4();

                                                            setEmployeeOptionDaysWise(empOpt?.map((item) => ({
                                                                label: item?.companyname,
                                                                value: item?.companyname,
                                                                _id: item?._id,
                                                                groupId: uniqueId,
                                                                legalname: item?.legalname
                                                            })))
                                                        } else if (posterGenerate.categoryname?.toLowerCase()?.includes("wedding")) {
                                                            const empOpt = overallWedding?.filter((item) => {
                                                                const itemDob = moment(item?.dom, 'D-M-YYYY', true);
                                                                const fromDate = moment(newFromDate, 'YYYY-MM-DD', true);
                                                                return itemDob.isValid() && itemDob.isSameOrAfter(fromDate);
                                                            });
                                                            const uniqueId = uuidv4();

                                                            setEmployeeOptionDaysWise(empOpt?.map((item) => ({
                                                                label: item?.companyname,
                                                                value: item?.companyname,
                                                                _id: item?._id,
                                                                groupId: uniqueId,
                                                                legalname: item?.legalname
                                                            })))

                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    To Date
                                                </Typography>
                                                <OutlinedInput
                                                    id="component-outlined"
                                                    type="date"
                                                    value={posterGenerate.todate}
                                                    onChange={(e) => {
                                                        const selectedToDate = new Date(e.target.value);
                                                        const selectedFromDate = new Date(posterGenerate.fromdate);
                                                        const formattedDatePresent = new Date() // Assuming you have a function to format the current date
                                                        if (selectedToDate >= selectedFromDate && selectedToDate >= new Date(selectedFromDate)) {
                                                            setPosterGenerate({
                                                                ...posterGenerate,
                                                                todate: e.target.value
                                                            });

                                                            if (posterGenerate.categoryname?.toLowerCase()?.includes("birthday")) {

                                                                const empOpt = overallBirthday?.filter((item) => {
                                                                    const itemDob = moment(item?.dob, 'D-M-YYYY', true);
                                                                    const fromDate = moment(posterGenerate.fromdate, 'YYYY-MM-DD', true);
                                                                    const toDate = moment(e.target.value, 'YYYY-MM-DD', true);
                                                                    return itemDob.isValid() && itemDob.isBetween(fromDate, toDate, null, '[]');
                                                                });

                                                                const uniqueId = uuidv4();

                                                                setEmployeeOptionDaysWise(empOpt?.map((item) => ({
                                                                    label: item?.companyname,
                                                                    value: item?.companyname,
                                                                    _id: item?._id,
                                                                    groupId: uniqueId,
                                                                    legalname: item.legalname

                                                                })))

                                                            } else if (posterGenerate.categoryname?.toLowerCase()?.includes("wedding")) {
                                                                const empOpt = overallWedding?.filter((item) => {
                                                                    const itemDob = moment(item?.dom, 'D-M-YYYY', true);
                                                                    const fromDate = moment(posterGenerate.fromdate, 'YYYY-MM-DD', true);
                                                                    const toDate = moment(e.target.value, 'YYYY-MM-DD', true);
                                                                    return itemDob.isValid() && itemDob.isBetween(fromDate, toDate, null, '[]');
                                                                });

                                                                const uniqueId = uuidv4();

                                                                setEmployeeOptionDaysWise(empOpt?.map((item) => ({
                                                                    label: item?.companyname,
                                                                    value: item?.companyname,
                                                                    _id: item?._id,
                                                                    groupId: uniqueId,
                                                                    legalname: item.legalname

                                                                })))


                                                            }
                                                        } else {
                                                            setPosterGenerate({
                                                                ...posterGenerate,
                                                                todate: "" // Reset to empty string if the condition fails
                                                            });
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                    </>}
                                <Grid item lg={4} md={4} sm={3} xs={3}>
                                    <FormControl fullWidth size="small">
                                        <Typography sx={{ fontWeight: "500" }}>
                                            Employee Name <b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <MultiSelect size="small"
                                            options={employeeOptionDaysWise}
                                            value={employeeValueAdd}
                                            valueRenderer={customValueRendererEmployeeAdd}
                                            onChange={handleEmployeeChangeAdd}
                                        />
                                    </FormControl>
                                </Grid>
                            </>
                        }
                        <Grid item md={4} sm={12} xs={12}>
                            <Typography>&nbsp;</Typography>
                            <Grid
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "15px",
                                }}
                            >
                                <Button variant="contained"
                                    onClick={handlePreviewClick}>
                                    Preview
                                </Button>
                                <LoadingButton
                                    onClick={handleSubmit}
                                    loading={loadingdeloverall}
                                    color="primary"
                                    loadingPosition="end"
                                    sx={buttonStyles.buttonsubmit}
                                >
                                    Generate
                                </LoadingButton>
                                <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                                    CLEAR
                                </Button>
                                <Button sx={buttonStyles.btncancel} onClick={handleCloseGenerate}>
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>

                    </Grid>


                </>


            </>

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
        </Box>
    );
}
export default PosterGenerate;