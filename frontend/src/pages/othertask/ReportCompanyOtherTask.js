import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Popover,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import 'react-quill/dist/quill.snow.css';
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import AggridTableForPaginationTable from "../../components/AggridTableForPaginationTable.js";
import AlertDialog from "../../components/Alert.js";
import { handleApiError } from "../../components/Errorhandling.js";
import ExportData from "../../components/ExportData.js";
import Headtitle from "../../components/Headtitle.js";
import MessageAlert from "../../components/MessageAlert.js";
import PageHeading from "../../components/PageHeading.js";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext.js";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice.js";

function ReportCompanyOthertaskList() {

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

    const datemonthOption = [{ value: "Date", label: "Date" }, { label: "Month", value: "Month" }]
    let today = new Date();
    const currYear = today.getFullYear();
    const years = [];
    for (let year = currYear + 1; year >= currYear - 10; year--) {
        years.push({ value: year, label: year.toString() });
    }

    const [selectedMontOpt, setSelectMonthOpt] = useState([
        { value: "January", label: "January" },
        { value: "February", label: "February" },
        { value: "March", label: "March" },
        { value: "April", label: "April" },
        { value: "May", label: "May" },
        { value: "June", label: "June" },
        { value: "July", label: "July" },
        { value: "August", label: "August" },
        { value: "September", label: "September" },
        { value: "October", label: "October" },
        { value: "November", label: "November" },
        { value: "December", label: "December" },
    ])

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


    let [valueProjectAdd, setValueProjectAdd] = useState("");
    let [valueCategoryAdd, setValueCategoryAdd] = useState("");
    let [valueSubCategoryAdd, setValueSubCategoryAdd] = useState("");
    let [valueAssignedbyAdd, setValueAssignedbyAdd] = useState("");
    let [valueAssignedModeAdd, setValueAssignedModeAdd] = useState("");

    const [selectedProject, setselectedProject] = useState([]);
    const [selectedCategory, setselectedCategory] = useState([]);
    const [selectedSubCategory, setselectedSubCategory] = useState([]);
    const [selectedAssignedBy, setselectedAssignedBy] = useState([]);
    const [selectedAssignedMode, setselectedAssignedMode] = useState([]);


    const customValueRendererProjectAdd = (valueProjectAdd, _companies) => {
        return valueProjectAdd.length ? valueProjectAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Project</span>
    }
    const customValueRendererCategoryAdd = (valueCategoryAdd, _companies) => {
        return valueCategoryAdd.length ? valueCategoryAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Category</span>
    }
    const customValueRendererSubCategoryAdd = (valueSubCategoryAdd, _companies) => {
        return valueSubCategoryAdd.length ? valueSubCategoryAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Sub Category</span>
    }
    const customValueRendererAssignedbyAdd = (valueAssignedbyAdd, _companies) => {
        return valueAssignedbyAdd.length ? valueAssignedbyAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Assigned By</span>
    }
    const customValueRendererAssignedModeAdd = (valueAssignedModeAdd, _companies) => {
        return valueAssignedModeAdd.length ? valueAssignedModeAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Assigned Mode</span>
    }


    const customValueRendererMonthAdd = (valueAssignedModeAdd, _companies) => {
        return valueAssignedModeAdd.length ? valueAssignedModeAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Month</span>
    }

    const customValueRendererYearAdd = (valueAssignedModeAdd, _companies) => {
        return valueAssignedModeAdd.length ? valueAssignedModeAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Year</span>
    }

    const handleProjectChangeAdd = (options) => {
        setValueProjectAdd(
            options.map(a => {
                return a.value;
            })
        )
        fetchCategoryDropdowns(options);
        setselectedProject(options);
        setselectedCategory([])
        setSubcategoryOption([])
        setselectedSubCategory([])
    }

    const handleCategoryChangeAdd = (options) => {
        setValueCategoryAdd(
            options.map(a => {
                return a.value;
            })
        )
        fetchSubcategoryDropdowns(options);
        setselectedCategory(options);
        setselectedSubCategory([])

    }

    const handleSubCategoryChangeAdd = (options) => {
        setValueSubCategoryAdd(
            options.map(a => {
                return a.value;
            })
        )
        setselectedSubCategory(options);
    }

    const handleAssignedbyChangeAdd = (options) => {
        setValueAssignedbyAdd(
            options.map(a => {
                return a.value;
            })
        )
        setselectedAssignedBy(options);
    }

    const handleAssignedModeAdd = (options) => {
        setValueAssignedModeAdd(
            options.map(a => {
                return a.value;
            })
        )
        setselectedAssignedMode(options);
    }

    const [selectedMonth, setselectedMonth] = useState([])
    const [valueMonthAdd, setValueMonthAdd] = useState([])
    const [selectedYear, setSelectedYear] = useState([])
    const [valueYearAdd, setValueYearAdd] = useState([])

    const handleMonthAdd = (options) => {
        setValueMonthAdd(
            options.map(a => {
                return a.value;
            })
        )
        setselectedMonth(options);
    }

    const handleYearAdd = (options) => {
        setValueYearAdd(
            options.map(a => {
                return a.value;
            })
        )
        setSelectedYear(options);
    }



    const [fileFormat, setFormat] = useState("");
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    let formattedDate = yyyy + "-" + mm + "-" + dd;

    const gridRef = useRef(null);
    const gridRefTable = useRef(null);

    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [copiedData, setCopiedData] = useState("");
    const [TextEditor, setTextEditor] = useState("");
    const [TextEditorEdit, setTextEditorEdit] = useState("");
    //state to handle holiday values
    const currentDate = new Date();

    const [manageothertask, setManageothertask] = useState({
        datemonth: "Date",
        fromdate: moment(currentDate).format("YYYY-MM-DD"),
        todate: moment(currentDate).format("YYYY-MM-DD"),
    });

    const [manageothertaskEdit, setManageothertaskEdit] = useState({
        project: "Please Select Project",
        category: "Please Select Category",
        subcategory: "Please Select Sub category",
        total: "",
        date: formattedDate,
        time: "",
        assignedby: "Please Select Assigned by",
        assignedmode: "Please Select Assigned Mode",
        ticket: "",
        duedate: "",
        duetime: "",
        estimation: "Please Select Estimation",
        estimationtime: "",
    });
    const [documentFiles, setdocumentFiles] = useState([]);
    const [documentFilesEdit, setdocumentFilesEdit] = useState([]);

    const [categoryOption, setCategoryOption] = useState([]);
    const [subcategoryOption, setSubcategoryOption] = useState([]);
    const [projectOpt, setProjectopt] = useState([]);
    const [assignedmodeOpt, setAssignedmodeopt] = useState([]);
    const [assignedbyOpt, setAssignedbyopt] = useState([]);

    const [categoryOptionEdit, setCategoryOptionEdit] = useState([]);
    const [subcategoryOptionEdit, setSubcategoryOptionEdit] = useState([]);
    const [projectOptEdit, setProjectoptEdit] = useState([]);
    const [assignedmodeOptEdit, setAssignedmodeoptEdit] = useState([]);
    const [assignedbyOptEdit, setAssignedbyoptEdit] = useState([]);

    const [manageothertasks, setManageothertasks] = useState([]);
    const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, pageName, setPageName, buttonStyles } = useContext(
        UserRoleAccessContext
    );
    const { auth } = useContext(AuthContext);
    const [statusCheck, setStatusCheck] = useState(true);





    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchedString, setSearchedString] = useState("")
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");


    const fetchProjectDropdowns = async () => {
        setPageName(!pageName)
        try {
            let res_category = await axios.get(SERVICE.PROJECTMASTER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const companyall = [
                ...res_category?.data?.projmaster.map((d) => ({
                    ...d,
                    label: d.name,
                    value: d.name,
                })),
            ];

            setProjectopt(companyall);
            setProjectoptEdit(companyall);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);; }
    };

    const fetchAssignedmode = async () => {
        setPageName(!pageName)
        try {
            let res_category = await axios.get(SERVICE.MANAGEASSIGNEDMODE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const assignall = [
                ...res_category?.data?.manageassignedmode.map((d) => ({
                    ...d,
                    label: d.manageassignedname,
                    value: d.manageassignedname,
                })),
            ];

            setAssignedmodeopt(assignall);
            setAssignedmodeoptEdit(assignall);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);; }
    };

    const fetchAssignedby = async () => {
        setPageName(!pageName)
        try {
            let res_category = await axios.get(SERVICE.ASSIGNEDBY, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const assinedbyall = [
                ...res_category?.data?.assignedby.map((d) => ({
                    ...d,
                    label: d.assignedname,
                    value: d.assignedname,
                })),
            ];

            setAssignedbyopt(assinedbyall);
            setAssignedbyoptEdit(assinedbyall);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);; }
    };

    const fetchCategoryDropdowns = async (e) => {
        setPageName(!pageName)
        try {
            let res_project = await axios.get(SERVICE.CATEGORYPROD, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            let result = res_project.data.categoryprod.filter(
                (d) => e?.some((item) => d.project === item.value)
            );

            const catall = result.map((d) => ({
                ...d,
                label: d.name,
                value: d.name,
            }));

            setCategoryOption(catall);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);; }
    };

    const fetchSubcategoryDropdowns = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(SERVICE.SUBCATEGORYPROD, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let result = res.data.subcategoryprod.filter(
                (d) => e?.some((item) => d.categoryname === item.value)
            );

            const subcatealls = result.map((d) => ({
                ...d,
                label: d.name,
                value: d.name,
            }));

            setSubcategoryOption(subcatealls);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);; }
    };

    const [productionUnitCount, setProductionUnitCount] = useState([]);

    const fetchUnitRate = async () => {
        setPageName(!pageName)
        try {
            let res_freq = await axios.get(SERVICE.PRODUCTION_UNITRATE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            let unitsRates = res_freq?.data?.unitsrate;
            let sorted = unitsRates.sort((a, b) => {
                // Names are the same, sort by category alphabetically
                if (a.category < b.category) return -1;
                if (a.category > b.category) return 1;
                // Categories are the same, sort by priority alphabetically
                if (a.subcategory < b.subcategory) return -1;
                if (a.subcategory > b.subcategory) return 1;
                return 0;
            });
            setProductionUnitCount(sorted);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);; }
    };

    //auto select all dropdowns
    const handleAutoSelect = async () => {
        setPageName(!pageName)
        try {
            //project
            let res_project = await axios.get(SERVICE.PROJECTMASTER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const companyall = [
                ...res_project?.data?.projmaster.map((d) => ({
                    ...d,
                    label: d.name,
                    value: d.name,
                })),
            ];

            setValueProjectAdd(
                companyall.map(a => {
                    return a.value;
                })
            )
            setselectedProject(companyall);

            //category

            let res_projectc = await axios.get(SERVICE.CATEGORYPROD, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            let cresult = res_projectc.data.categoryprod.filter(
                (d) => companyall?.some((item) => d.project === item.value)
            );

            const catall = cresult.map((d) => ({
                ...d,
                label: d.name,
                value: d.name,
            }));

            setValueCategoryAdd(
                catall.map(a => {
                    return a.value;
                })
            )
            setselectedCategory(catall);
            setCategoryOption(catall);

            //subcategory

            let res = await axios.get(SERVICE.SUBCATEGORYPROD, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let scresult = res.data.subcategoryprod.filter(
                (d) => catall?.some((item) => d.categoryname === item.value)
            );

            const subcatealls = scresult.map((d) => ({
                ...d,
                label: d.name,
                value: d.name,
            }));

            setValueSubCategoryAdd(
                subcatealls.map(a => {
                    return a.value;
                })
            )
            setselectedSubCategory(subcatealls);
            setSubcategoryOption(subcatealls);

            //assignedby

            let res_category = await axios.get(SERVICE.ASSIGNEDBY, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const assinedbyall = [
                ...res_category?.data?.assignedby.map((d) => ({
                    ...d,
                    label: d.assignedname,
                    value: d.assignedname,
                })),
            ];

            setValueAssignedbyAdd(
                assinedbyall.map(a => {
                    return a.value;
                })
            )
            setselectedAssignedBy(assinedbyall);

            //assignedmode
            let res_assigned = await axios.get(SERVICE.MANAGEASSIGNEDMODE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const assignall = [
                ...res_assigned?.data?.manageassignedmode.map((d) => ({
                    ...d,
                    label: d.manageassignedname,
                    value: d.manageassignedname,
                })),
            ];

            setValueAssignedModeAdd(
                assignall.map(a => {
                    return a.value;
                })
            )
            setselectedAssignedMode(assignall);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
        }
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
        getapi();
    }, []);

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("ReportcompanyOthertask"),
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
        fetchProjectDropdowns();
        fetchAssignedmode();
        fetchAssignedby();
        fetchUnitRate();
        handleAutoSelect();
    }, []);

    // Manage Columns
    const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        project: true,
        category: true,
        subcategory: true,
        total: true,
        date: true,
        time: true,
        assignedby: true,
        assignedmode: true,
        ticket: true,
        duedate: true,
        duetime: true,
        estimation: true,
        estimationtime: true,
        flagcount: true,
        orate: true,
        oratetotal: true,
        conversion: true,
        points: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(
        initialColumnVisibility
    );
    const [selectAllChecked, setSelectAllChecked] = useState(false);


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



    const [isBtn, setIsBtn] = useState(false)
    //add function

    //submit option for saving
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedProject.length === 0) {

            setPopupContentMalert("Please Select Project");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else {
            fetchEmployee();
        }
    };
    const handleclear = (e) => {
        e.preventDefault();
        setselectedCategory([])
        setselectedAssignedBy([])
        setselectedAssignedMode([])
        setselectedProject([])
        setCategoryOption([])
        setSubcategoryOption([])
        setselectedSubCategory([])
        setValueProjectAdd("")
        setValueCategoryAdd("")
        setValueSubCategoryAdd("")
        setValueAssignedbyAdd("")
        setValueAssignedModeAdd("")
        setManageothertask({
            datemonth: "Date",
            fromdate: "",
            todate: ""
        })
        setOverallFilterdata([])
        setTotalProjects(0)
        setTotalPages(0)
        setFilteredChanges(null)
        setFilteredRowData([])
        setPageSize(10)
        setPage(1)
        setSearchQuery("")
        setselectedMonth([])
        setValueMonthAdd([])
        setSelectedYear([])
        setValueYearAdd([])
        setFilterdata(false);
        setForsearch(true)
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    };


    const [manageothertasksArray, setManageothertasksArray] = useState([])

    const [overallFilterdata, setOverallFilterdata] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [btnClick, setbtnClick] = useState(false)

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
        setStatusCheck(false)
        setPageName(!pageName)
        setFilterdata(true)
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
            project: valueProjectAdd,
            category: valueCategoryAdd,
            subcategory: valueSubCategoryAdd,
            assignedby: valueAssignedbyAdd,
            assignedmode: valueAssignedModeAdd,
            fromdate: valueProjectAdd?.length > 0 ? manageothertask.fromdate : "",
            todate: valueProjectAdd?.length > 0 ? manageothertask.todate : "",
            month: valueMonthAdd,
            year: valueYearAdd
        };


        const allFilters = [];

        if (allFilters.length > 0 && selectedColumn !== "") {
            queryParams.allFilters = allFilters
            queryParams.logicOperator = logicOperator;
        } else if (searchQuery) {
            queryParams.searchQuery = searchQuery;
        }

        try {
            let res_employee = await axios.post(SERVICE.ALL_OTHERTASKCOMPANY_SORT, queryParams, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },

            });

            const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []
            const ansOverall = res_employee?.data?.totalProjectsOverall?.length > 0 ? res_employee?.data?.totalProjectsOverall : []
            const itemsWithSerialNumbers = ans?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                date: moment(item.date).format("DD-MM-YYYY"),

            }));
            const itemsWithSerialNumbersansOverall = ansOverall?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                date: moment(item.date).format("DD-MM-YYYY"),

            }));

            // Create a map from productionUnitCount for quick lookups
            const productionUnitCountMap = new Map(
                productionUnitCount.map(puc => [
                    `${puc.project}-${puc.category}-${puc.subcategory}`,
                    puc
                ])
            );

            // Map over itemsWithSerialNumbers and update only the matched ones
            const ChangeDataOverall = itemsWithSerialNumbersansOverall.map(item => {
                // Create a key for quick lookup
                const key = `${item.project}-${item.category}-${item.subcategory}`;

                // Find the corresponding productionUnitCount object
                const isUnitProdExist = productionUnitCountMap.get(key);

                // Update item if a corresponding productionUnitCount object is found
                const points = { ...item, points: (item.orate * item.conversion).toFixed(4), }
                return isUnitProdExist ? {
                    ...item,
                    orate: isUnitProdExist.orate,
                    conversion: isUnitProdExist.conversion,
                    points: isUnitProdExist.points,
                    total: isUnitProdExist.flagcount,
                    oratetotal: isUnitProdExist.mrate * isUnitProdExist.flagcount
                } : points
            });
            // Map over itemsWithSerialNumbers and update only the matched ones
            const ChangeData = itemsWithSerialNumbers.map(item => {
                // Create a key for quick lookup
                const key = `${item.project}-${item.category}-${item.subcategory}`;

                // Find the corresponding productionUnitCount object
                const isUnitProdExist = productionUnitCountMap.get(key);

                console.log(isUnitProdExist, "isUnitProdExist")

                // Update item if a corresponding productionUnitCount object is found
                const points = { ...item, points: (item.orate * item.conversion).toFixed(4), }
                return isUnitProdExist ? {
                    ...item,
                    orate: isUnitProdExist.orate,
                    conversion: isUnitProdExist.conversion,
                    points: isUnitProdExist.points,
                    total: isUnitProdExist.flagcount,
                    oratetotal: isUnitProdExist.mrate * isUnitProdExist.flagcount
                } : points
            });

            setManageothertasksArray(ChangeDataOverall.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    project: item.project,
                    category: item.category,
                    subcategory: item.subcategory,
                    total: item.total,
                    // date: item.date,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    time: moment(
                        `${new Date().toDateString()} ${item.time}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    assignedby: item.assignedby,
                    assignedmode: item.assignedmode,
                    ticket: item.ticket,
                    duedate: moment(item.duedate).format("DD-MM-YYYY"),
                    duetime: moment(
                        `${new Date().toDateString()} ${item.duetime}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    estimation: item.estimation,
                    estimationtime: item.estimationtime,
                    orate: item.orate,
                    flagcount: item.flagcount,
                    // flagstatus: item.flagstatus,
                    conversion: item.conversion,
                    points: item.points,
                    totalflag: item.totalflag,
                    oratetotal: item?.oratetotal === undefined ? "" : Number(item?.oratetotal).toFixed(4),
                };
            }))
            setItems(ChangeDataOverall.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    project: item.project,
                    category: item.category,
                    subcategory: item.subcategory,
                    total: item.total,
                    // date: item.date,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    time: moment(
                        `${new Date().toDateString()} ${item.time}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    assignedby: item.assignedby,
                    assignedmode: item.assignedmode,
                    ticket: item.ticket,
                    duedate: moment(item.duedate).format("DD-MM-YYYY"),
                    duetime: moment(
                        `${new Date().toDateString()} ${item.duetime}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    estimation: item.estimation,
                    estimationtime: item.estimationtime,
                    orate: item.orate,
                    flagcount: item.flagcount,
                    // flagstatus: item.flagstatus,
                    conversion: item.conversion,
                    points: item.points,
                    totalflag: item.totalflag,
                    oratetotal: item?.oratetotal === undefined ? "" : Number(item?.oratetotal).toFixed(4),
                };
            }))
            setOverallFilterdata(ChangeData.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    project: item.project,
                    category: item.category,
                    subcategory: item.subcategory,
                    total: item.total,
                    // date: item.date,
                    date: item.date,
                    time: moment(
                        `${new Date().toDateString()} ${item.time}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    assignedby: item.assignedby,
                    assignedmode: item.assignedmode,
                    ticket: item.ticket,
                    duedate: moment(item.duedate).format("DD-MM-YYYY"),
                    duetime: moment(
                        `${new Date().toDateString()} ${item.duetime}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    estimation: item.estimation,
                    estimationtime: item.estimationtime,
                    orate: item.orate,
                    flagcount: item.flagcount,
                    // flagstatus: item.flagstatus,
                    conversion: item.conversion,
                    points: item.points,
                    totalflag: item.totalflag,
                    oratetotal: item?.oratetotal === undefined ? "" : Number(item?.oratetotal).toFixed(4),
                };
            }))

            setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
            setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
            setPageSize((data) => { return ans?.length > 0 ? data : 10 });
            setPage((data) => { return ans?.length > 0 ? data : 1 });
            setStatusCheck(true)
            // setSearchQuery("")
        } catch (err) {
            setStatusCheck(true)
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
        }
    };

    const fetchEmployee = async () => {
        setStatusCheck(false)
        setPageName(!pageName)

        const queryParams = {
            page: Number(page),
            pageSize: Number(pageSize),
            project: valueProjectAdd,
            category: valueCategoryAdd,
            subcategory: valueSubCategoryAdd,
            assignedby: valueAssignedbyAdd,
            assignedmode: valueAssignedModeAdd,
            fromdate: valueProjectAdd?.length > 0 ? manageothertask.fromdate : "",
            todate: valueProjectAdd?.length > 0 ? manageothertask.todate : "",
            month: valueMonthAdd,
            year: valueYearAdd
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
            let res_employee = await axios.post(SERVICE.ALL_OTHERTASKCOMPANY_SORT, queryParams, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },

            });

            const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []
            const ansOverall = res_employee?.data?.totalProjectsOverall?.length > 0 ? res_employee?.data?.totalProjectsOverall : []
            const itemsWithSerialNumbers = ans?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                date: moment(item.date).format("DD-MM-YYYY"),

            }));
            const itemsWithSerialNumbersansOverall = ansOverall?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                date: moment(item.date).format("DD-MM-YYYY"),

            }));

            // Create a map from productionUnitCount for quick lookups
            const productionUnitCountMap = new Map(
                productionUnitCount.map(puc => [
                    `${puc.project}-${puc.category}-${puc.subcategory}`,
                    puc
                ])
            );

            // Map over itemsWithSerialNumbers and update only the matched ones
            const ChangeDataOverall = itemsWithSerialNumbersansOverall.map(item => {
                // Create a key for quick lookup
                const key = `${item.project}-${item.category}-${item.subcategory}`;

                // Find the corresponding productionUnitCount object
                const isUnitProdExist = productionUnitCountMap.get(key);

                // Update item if a corresponding productionUnitCount object is found
                const points = { ...item, points: (item.orate * item.conversion).toFixed(4), }
                return isUnitProdExist ? {
                    ...item,
                    orate: isUnitProdExist.orate,
                    conversion: isUnitProdExist.conversion,
                    points: isUnitProdExist.points,
                    total: isUnitProdExist.flagcount,
                    oratetotal: isUnitProdExist.mrate * isUnitProdExist.flagcount
                } : points
            });
            // Map over itemsWithSerialNumbers and update only the matched ones
            const ChangeData = itemsWithSerialNumbers.map(item => {
                // Create a key for quick lookup
                const key = `${item.project}-${item.category}-${item.subcategory}`;

                // Find the corresponding productionUnitCount object
                const isUnitProdExist = productionUnitCountMap.get(key);

                // Update item if a corresponding productionUnitCount object is found
                const points = { ...item, points: (item.orate * item.conversion).toFixed(4), }
                return isUnitProdExist ? {
                    ...item,
                    orate: isUnitProdExist.orate,
                    conversion: isUnitProdExist.conversion,
                    points: isUnitProdExist.points,
                    total: isUnitProdExist.flagcount,
                    oratetotal: isUnitProdExist.mrate * isUnitProdExist.flagcount
                } : points
            });

            setManageothertasksArray(ChangeDataOverall.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    project: item.project,
                    category: item.category,
                    subcategory: item.subcategory,
                    total: item.total,
                    // date: item.date,
                    date: item.date,
                    time: moment(
                        `${new Date().toDateString()} ${item.time}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    assignedby: item.assignedby,
                    assignedmode: item.assignedmode,
                    ticket: item.ticket,
                    duedate: moment(item.duedate).format("DD-MM-YYYY"),
                    duetime: moment(
                        `${new Date().toDateString()} ${item.duetime}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    estimation: item.estimation,
                    estimationtime: item.estimationtime,
                    orate: item.orate,
                    flagcount: item.flagcount,
                    // flagstatus: item.flagstatus,
                    conversion: item.conversion,
                    points: item.points,
                    totalflag: item.totalflag,
                    oratetotal: item?.oratetotal === undefined ? "" : Number(item?.oratetotal).toFixed(4),
                };
            }))
            setOverallFilterdata(ChangeData.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    project: item.project,
                    category: item.category,
                    subcategory: item.subcategory,
                    total: item.total,
                    // date: item.date,
                    date: item.date,
                    time: moment(
                        `${new Date().toDateString()} ${item.time}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    assignedby: item.assignedby,
                    assignedmode: item.assignedmode,
                    ticket: item.ticket,
                    duedate: moment(item.duedate).format("DD-MM-YYYY"),
                    duetime: moment(
                        `${new Date().toDateString()} ${item.duetime}`,
                        "ddd MMM DD YYYY HH:mm"
                    ).format("hh:mm:ss A"),
                    estimation: item.estimation,
                    estimationtime: item.estimationtime,
                    orate: item.orate,
                    flagcount: item.flagcount,
                    // flagstatus: item.flagstatus,
                    conversion: item.conversion,
                    points: item.points,
                    totalflag: item.totalflag,
                    oratetotal: item?.oratetotal === undefined ? "" : Number(item?.oratetotal).toFixed(4),
                };
            }))

            setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
            setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
            setPageSize((data) => { return ans?.length > 0 ? data : 10 });
            setPage((data) => { return ans?.length > 0 ? data : 1 });
            setStatusCheck(true)
            // setSearchQuery("")
        } catch (err) {
            setStatusCheck(true)
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
        }
    };

    const [filterdata, setFilterdata] = useState(false)
    const [forsearch, setForsearch] = useState(false)

    useEffect(() => {
        if ((items?.length > 0 && filterdata) || forsearch) {

            fetchEmployee();
        }
        // fetchMangeothertaskArray();
    }, [page, pageSize, searchQuery]);

    const gridRefTableImg = useRef(null);
    // image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Company Other Task Report.png");
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
        documentTitle: "Report Company Other Task",
        pageStyle: "print",
    });
    //serial no for listing items
    const addSerialNumber = (datas) => {
        setItems(datas);
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
        setFilterdata(true)

    };
    //datatable....
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        // setPage(1);
    };
    // Split the search query into individual terms
    const searchTerms = searchQuery.toLowerCase().split(" ");
    // Modify the filtering logic to check each term
    const filteredDatas = items?.filter((item) => {
        return searchTerms.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });
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
            width: 70,
            hide: !columnVisibility.serialNumber,
            headerClassName: "bold-header",
            pinned: 'left', lockPinned: true,
        },
        {
            field: "project",
            headerName: "Project",
            flex: 0,
            width: 120,
            hide: !columnVisibility.project,
            headerClassName: "bold-header",
            pinned: 'left',
        },
        {
            field: "category",
            headerName: "Category",
            flex: 0,
            width: 150,
            hide: !columnVisibility.category,
            headerClassName: "bold-header",
            pinned: 'left',
        },
        {
            field: "subcategory",
            headerName: "Subcategory",
            flex: 0,
            width: 150,
            hide: !columnVisibility.subcategory,
            headerClassName: "bold-header",
        },
        {
            field: "date",
            headerName: "Date",
            flex: 0,
            width: 100,
            hide: !columnVisibility.date,
            headerClassName: "bold-header",
        },
        {
            field: "time",
            headerName: "Time",
            flex: 0,
            width: 100,
            hide: !columnVisibility.time,
            headerClassName: "bold-header",
        },
        {
            field: "assignedby",
            headerName: "Assignedb By",
            flex: 0,
            width: 120,
            hide: !columnVisibility.assignedby,
            headerClassName: "bold-header",
        },
        {
            field: "assignedmode",
            headerName: "Assigned Mode",
            flex: 0,
            width: 120,
            hide: !columnVisibility.assignedmode,
            headerClassName: "bold-header",
        },
        {
            field: "orate",
            headerName: "O Rate",
            flex: 0,
            width: 120,
            hide: !columnVisibility.orate,
            headerClassName: "bold-header",
        },
        {
            field: "total",
            headerName: "Flag",
            flex: 0,
            width: 120,
            hide: !columnVisibility.total,
            headerClassName: "bold-header",
        },
        {
            field: "oratetotal",
            headerName: "Total Point",
            flex: 0,
            width: 120,
            hide: !columnVisibility.oratetotal,
            headerClassName: "bold-header",
        },
        {
            field: "ticket",
            headerName: "Ticket",
            flex: 0,
            width: 100,
            hide: !columnVisibility.ticket,
            headerClassName: "bold-header",
        },
        {
            field: "duedate",
            headerName: "Due Date",
            flex: 0,
            width: 120,
            hide: !columnVisibility.duedate,
            headerClassName: "bold-header",
        },
        {
            field: "duetime",
            headerName: "Due Time",
            flex: 0,
            width: 120,
            hide: !columnVisibility.duetime,
            headerClassName: "bold-header",
        },
        {
            field: "estimation",
            headerName: "Estimation",
            flex: 0,
            width: 120,
            hide: !columnVisibility.estimation,
            headerClassName: "bold-header",
        },
        {
            field: "estimationtime",
            headerName: "Estimation Time",
            flex: 0,
            width: 120,
            hide: !columnVisibility.estimationtime,
            headerClassName: "bold-header",
        },
    ];

    const filteredSelectedColumn = columnDataTable.filter(data => data.field !== 'checkbox' && data.field !== "actions" && data.field !== "serialNumber");


    const rowDataTable = filteredDatas.map((item, index) => {
        return {
            id: item.id,
            serialNumber: item.serialNumber,
            project: item.project,
            category: item.category,
            subcategory: item.subcategory,
            total: item.total,
            // date: item.date,
            date: item.date,
            time: item.time,
            assignedby: item.assignedby,
            assignedmode: item.assignedmode,
            ticket: item.ticket,
            duedate: item.duedate,
            duetime: item.duetime,
            estimation: item.estimation,
            estimationtime: item.estimationtime,
            orate: item.orate,
            flagcount: item.flagcount,
            // flagstatus: item.flagstatus,
            conversion: item.conversion,
            points: item.points,
            oratetotal: item?.oratetotal,
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

    useEffect(() => {
        addSerialNumber(overallFilterdata);
    }, [overallFilterdata]);



    let exportColumnNames = [
        "Project",
        "Category",
        "Sub Category",
        "Date", "Time", "Assignedby", "Assignedmode",
        "O rate", "Flag", "Total Point",
        "Ticket", "Duedate", "Duetime", "Estimation", "Estimationtime"];
    let exportRowValues = ["project", "category", "subcategory",
        "date", "time", "assignedby", "assignedmode",
        "orate", "total", "oratetotal",
        "ticket", "duedate", "duetime", "estimation", "estimationtime"];

    return (
        <Box>
            <Headtitle title={"Report Company Other Task"} />
            {/* ****** Header Content ****** */}
            {/* <Typography sx={userStyle.HeaderText}>Manage Other Task</Typography> */}
            <PageHeading
                title="Report Company Other Task"
                modulename="Other Tasks"
                submodulename="Company Other Task Report"
                mainpagename=""
                subpagename=""
                subsubpagename=""
            />


            {isUserRoleCompare?.includes("acompanyothertaskreport") && (
                <Box sx={userStyle.selectcontainer}>
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Typography sx={userStyle.importheadtext}>
                                    Report Company Other Task Filter
                                </Typography>
                            </Grid>
                        </Grid>
                        <br />
                        <Grid container spacing={2}>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Project <b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <MultiSelect
                                        maxMenuHeight={300}
                                        options={projectOpt}
                                        value={selectedProject}
                                        valueRenderer={customValueRendererProjectAdd}
                                        onChange={handleProjectChangeAdd}
                                    />

                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Category
                                    </Typography>
                                    <MultiSelect
                                        maxMenuHeight={300}
                                        options={categoryOption}
                                        value={selectedCategory}
                                        valueRenderer={customValueRendererCategoryAdd}
                                        onChange={handleCategoryChangeAdd}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Sub Category
                                    </Typography>
                                    <MultiSelect
                                        maxMenuHeight={300}
                                        options={subcategoryOption}
                                        value={selectedSubCategory}
                                        valueRenderer={customValueRendererSubCategoryAdd}
                                        onChange={handleSubCategoryChangeAdd}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Assigned By
                                    </Typography>
                                    <MultiSelect
                                        maxMenuHeight={300}
                                        options={assignedbyOpt}
                                        value={selectedAssignedBy}
                                        valueRenderer={customValueRendererAssignedbyAdd}
                                        onChange={handleAssignedbyChangeAdd}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Assigned Mode
                                    </Typography>
                                    <MultiSelect
                                        maxMenuHeight={300}
                                        options={assignedmodeOpt}
                                        value={selectedAssignedMode}
                                        valueRenderer={customValueRendererAssignedModeAdd}
                                        onChange={handleAssignedModeAdd}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Date/Month
                                    </Typography>
                                    <Selects
                                        options={datemonthOption}
                                        styles={colourStyles}
                                        value={{
                                            label: manageothertask.datemonth,
                                            value: manageothertask.datemonth,
                                        }}
                                        onChange={(e) => {
                                            setManageothertask({
                                                ...manageothertask,
                                                datemonth: e.value,
                                            });
                                            if (e.value === "Month") {
                                                setManageothertask({
                                                    ...manageothertask,
                                                    datemonth: e.value,
                                                    fromdate: "",
                                                    todate: "",
                                                });
                                            } else {
                                                setselectedMonth([])
                                                setValueMonthAdd([])
                                                setSelectedYear([])
                                                setValueYearAdd([])
                                            }

                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            {manageothertask.datemonth === "Date" ?
                                <>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                From Date
                                            </Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="date"
                                                value={manageothertask.fromdate}
                                                onChange={(e) => {
                                                    const newFromDate = e.target.value;
                                                    setManageothertask((prevState) => ({
                                                        ...prevState,
                                                        fromdate: newFromDate,
                                                        todate: prevState.todate && new Date(prevState.todate) > new Date(newFromDate) ? prevState.todate : ""
                                                    }));
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
                                                value={manageothertask.todate}
                                                onChange={(e) => {
                                                    const selectedToDate = new Date(e.target.value);
                                                    const selectedFromDate = new Date(manageothertask.fromdate);
                                                    const formattedDatePresent = new Date() // Assuming you have a function to format the current date
                                                    if (selectedToDate >= selectedFromDate && selectedToDate >= new Date(selectedFromDate)) {
                                                        setManageothertask({
                                                            ...manageothertask,
                                                            todate: e.target.value
                                                        });
                                                    } else {
                                                        setManageothertask({
                                                            ...manageothertask,
                                                            todate: "" // Reset to empty string if the condition fails
                                                        });
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </> :
                                <>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Month
                                            </Typography>
                                            <MultiSelect
                                                maxMenuHeight={300}
                                                options={selectedMontOpt?.map((item) => ({
                                                    value: item.value,
                                                    label: item.value,
                                                }))}
                                                value={selectedMonth}
                                                valueRenderer={customValueRendererMonthAdd}
                                                onChange={handleMonthAdd}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Year
                                            </Typography>
                                            <MultiSelect
                                                maxMenuHeight={300}
                                                options={years?.map((item) => ({
                                                    value: item.value,
                                                    label: item.label,
                                                }))}
                                                value={selectedYear}
                                                valueRenderer={customValueRendererYearAdd}
                                                onChange={handleYearAdd}

                                            // value={{ label: selectedYear, value: selectedYear }}
                                            // valueRenderer={customValueRendererYearAdd}
                                            // onChange={handleYearChange}
                                            />
                                        </FormControl>
                                    </Grid>
                                </>
                            }
                        </Grid>

                        <br />
                        <br />
                        <Grid item md={12} sm={12} xs={12}>
                            <br />
                            <br />
                            <Grid
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "15px",
                                }}
                            >
                                <Button sx={buttonStyles.buttonsubmit} onClick={(e) => {
                                    handleSubmit(e)
                                    setbtnClick(true)
                                    setFilterdata(true)
                                    setForsearch(true)
                                }} disabled={isBtn}>
                                    Filter
                                </Button>
                                <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                                    CLEAR
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                </Box>
            )}
            <br />



            {/* ****** Table Start ****** */}

            {isUserRoleCompare?.includes("lcompanyothertaskreport") && (
                <>
                    <Box sx={userStyle.container}>
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                Report Company Other Task List
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
                                        <MenuItem value={totalProjects}>All</MenuItem>
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
                                    {isUserRoleCompare?.includes("excelcompanyothertaskreport") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                // fetchMangeothertaskArray()
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvcompanyothertaskreport") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                // fetchMangeothertaskArray()
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printcompanyothertaskreport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfcompanyothertaskreport") && (
                                        <>
                                            <Button
                                                sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)
                                                    // fetchMangeothertaskArray()
                                                }}
                                            >
                                                <FaFilePdf />
                                                &ensp;Export to PDF&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imagecompanyothertaskreport") && (
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

                                {/* <AggregatedSearchBar
                                    columnDataTable={columnDataTable}
                                    setItems={setItems}
                                    addSerialNumber={addSerialNumber}
                                    setPage={setPage}
                                    maindatas={overallFilterdata}
                                    setSearchedString={setSearchedString}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    paginated={true}
                                    totalDatas={manageothertasksArray}
                                /> */}
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
                                                        <IoMdOptions style={{ cursor: 'pointer', }} onClick={handleClickSearch} />
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
                        {!statusCheck ? (
                            <Box sx={userStyle.container}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        minHeight: "350px",
                                    }}
                                >
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
                            </Box>
                        ) : (
                            <>

                                <AggridTableForPaginationTable
                                    rowDataTable={rowDataTable}
                                    columnDataTable={columnDataTable}
                                    columnVisibility={columnVisibility}
                                    page={page}
                                    setPage={setPage}
                                    pageSize={pageSize}
                                    totalPages={totalPages}
                                    setColumnVisibility={setColumnVisibility}
                                    selectedRows={selectedRows}
                                    setSelectedRows={setSelectedRows}
                                    gridRefTable={gridRefTable}
                                    totalDatas={totalProjects}
                                    setFilteredRowData={setFilteredRowData}
                                    filteredRowData={filteredRowData}
                                    gridRefTableImg={gridRefTableImg}
                                    itemsList={manageothertasksArray}
                                />
                                {/* 
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
                                    paginated={true}
                                    filteredDatas={filteredDatas}
                                    totalDatas={totalProjects}
                                    searchQuery={searchQuery}
                                    handleShowAllColumns={handleShowAllColumns}
                                    setFilteredRowData={setFilteredRowData}
                                    filteredRowData={filteredRowData}
                                    setFilteredChanges={setFilteredChanges}
                                    filteredChanges={filteredChanges}
                                    gridRefTableImg={gridRefTableImg}
                                    itemsList={manageothertasksArray}
                                /> */}
                            </>)}

                        {/* ****** Table End ****** */}
                    </Box>
                    <Popover
                        id={idSearch}
                        open={openSearch}
                        anchorEl={anchorElSearch}
                        onClose={handleCloseSearch}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
                    >
                        <Box style={{ padding: "10px", maxWidth: '450px' }}>
                            <Typography variant="h6">Advance Search</Typography>
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseSearch}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <DialogContent sx={{ width: "100%" }}>
                                <Box sx={{
                                    width: '350px',
                                    maxHeight: '400px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <Box sx={{
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        // paddingRight: '5px'
                                    }}>
                                        <Grid container spacing={1}>
                                            <Grid item md={12} sm={12} xs={12}>
                                                <Typography>Columns</Typography>
                                                <Select fullWidth size="small"
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 200,
                                                                width: "auto",
                                                            },
                                                        },
                                                    }}
                                                    style={{ minWidth: 150 }}
                                                    value={selectedColumn}
                                                    onChange={(e) => setSelectedColumn(e.target.value)}
                                                    displayEmpty
                                                >
                                                    <MenuItem value="" disabled>Select Column</MenuItem>
                                                    {filteredSelectedColumn.map((col) => (
                                                        <MenuItem key={col.field} value={col.field}>
                                                            {col.headerName}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Grid>
                                            <Grid item md={12} sm={12} xs={12}>
                                                <Typography>Operator</Typography>
                                                <Select fullWidth size="small"
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 200,
                                                                width: "auto",
                                                            },
                                                        },
                                                    }}
                                                    style={{ minWidth: 150 }}
                                                    value={selectedCondition}
                                                    onChange={(e) => setSelectedCondition(e.target.value)}
                                                    disabled={!selectedColumn}
                                                >
                                                    {conditions.map((condition) => (
                                                        <MenuItem key={condition} value={condition}>
                                                            {condition}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Grid>
                                            <Grid item md={12} sm={12} xs={12}>
                                                <Typography>Value</Typography>
                                                <TextField fullWidth size="small"
                                                    value={["Blank", "Not Blank"].includes(selectedCondition) ? "" : filterValue}
                                                    onChange={(e) => setFilterValue(e.target.value)}
                                                    disabled={["Blank", "Not Blank"].includes(selectedCondition)}
                                                    placeholder={["Blank", "Not Blank"].includes(selectedCondition) ? "Disabled" : "Enter value"}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root.Mui-disabled': {
                                                            backgroundColor: 'rgb(0 0 0 / 26%)',
                                                        },
                                                        '& .MuiOutlinedInput-input.Mui-disabled': {
                                                            cursor: 'not-allowed',
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            {additionalFilters.length > 0 && (
                                                <>
                                                    <Grid item md={12} sm={12} xs={12}>
                                                        <RadioGroup
                                                            row
                                                            value={logicOperator}
                                                            onChange={(e) => setLogicOperator(e.target.value)}
                                                        >
                                                            <FormControlLabel value="AND" control={<Radio />} label="AND" />
                                                            <FormControlLabel value="OR" control={<Radio />} label="OR" />
                                                        </RadioGroup>
                                                    </Grid>
                                                </>
                                            )}
                                            {additionalFilters.length === 0 && (
                                                <Grid item md={4} sm={12} xs={12} >
                                                    <Button variant="contained" onClick={handleAddFilter} sx={{ textTransform: "capitalize" }} disabled={["Blank", "Not Blank"].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}>
                                                        Add Filter
                                                    </Button>
                                                </Grid>
                                            )}

                                            <Grid item md={2} sm={12} xs={12}>
                                                <Button variant="contained" onClick={() => {
                                                    fetchEmployee();
                                                    setIsSearchActive(true);
                                                    setAdvancedFilter([
                                                        ...additionalFilters,
                                                        { column: selectedColumn, condition: selectedCondition, value: filterValue }
                                                    ])
                                                }} sx={{ textTransform: "capitalize" }} disabled={["Blank", "Not Blank"].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}>
                                                    Search
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </DialogContent>
                        </Box>
                    </Popover>
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
                itemsTwo={manageothertasksArray ?? []}
                filename={"Company Other Task Report"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />

        </Box>
    );
}
export default ReportCompanyOthertaskList;