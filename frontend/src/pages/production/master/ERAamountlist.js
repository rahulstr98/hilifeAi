import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { MultiSelect } from "react-multi-select-component";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Select, TextField, Typography, InputAdornment, Tooltip, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaDownload, FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaTrash, FaSearch } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import AggregatedSearchBar from '../../../components/AggregatedSearchBar';
import AggridTable from "../../../components/AggridTable";
import AggridTableForPaginationTable from "../../../components/AggridTableForPaginationTable.js";
import AlertDialog from "../../../components/Alert.js";
import { DeleteConfirmation, PleaseSelectRow, } from "../../../components/DeleteConfirmation.js";
import { handleApiError } from "../../../components/Errorhandling.js";
import ExportData from "../../../components/ExportData.js";
import Headtitle from "../../../components/Headtitle.js";
import InfoPopup from "../../../components/InfoPopup.js";
import MessageAlert from "../../../components/MessageAlert.js";
import PageHeading from "../../../components/PageHeading.js";
import { AuthContext, UserRoleAccessContext } from "../../../context/Appcontext.js";
import { userStyle, colourStyles } from "../../../pageStyle.js";
import { SERVICE } from "../../../services/Baseservice.js";
import domtoimage from 'dom-to-image';
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";

function EraAmountList() {

    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);

    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => { setOpenPopupMalert(true); };
    const handleClosePopupMalert = () => { setOpenPopupMalert(false); };
    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupSeverity, setPopupSeverity] = useState("");
    const handleClickOpenPopup = () => { setOpenPopup(true); };
    const handleClosePopup = () => { setOpenPopup(false); };

    let exportColumnNames2 = ['Company', 'Branch', 'Process Code', 'Amount'];
    let exportRowValues2 = ['company', 'branch', 'processcode', 'amount'];

    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [eraAmounts, setEraAmounts] = useState([]);
    const [eraAmountEdit, setEraAmountEdit] = useState([]);
    const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
    const [loading, setLoading] = useState(false);
    const { auth } = useContext(AuthContext);
    const [selectedCompanyEdit, setSelectedCompanyEdit] = useState("Please Select Company");
    const [selectedBranchEdit, setSelectedBranchEdit] = useState("Please Select Branch");
    const [selectedBranchCodeEdit, setSelectedBranchCodeEdit] = useState("");
    const [eraAmountmanual, setEraAmountmanual] = useState({ processcode: "", amount: "" });

    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [items, setItems] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedData, setCopiedData] = useState("");
    const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    //SECOND DATATABLE
    const gridRefTable = useRef(null);
    const [isHandleChange, setIsHandleChange] = useState(false);

    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        company: true,
        branch: true,
        processcode: true,
        amount: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

    const accessbranch = isUserRoleAccess?.role?.includes("Manager")
        ? isAssignBranch?.map((data) => ({
            branch: data.branch,
            company: data.company,
            codeval: data.branchcode
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
                codeval: data.branchcode
            }));

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };

    const [isFilterOpen2, setIsFilterOpen2] = useState(false);
    const [isPdfFilterOpen2, setIsPdfFilterOpen2] = useState(false);

    // page refersh reload
    const handleCloseFilterMod2 = () => {
        setIsFilterOpen2(false);
    };
    const handleClosePdfFilterMod2 = () => {
        setIsPdfFilterOpen2(false);
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };

    const username = isUserRoleAccess.companyname;

    // Error Popup model 
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState();
    const handleClickOpenerr = () => {
        setIsErrorOpen(true);
    };
    const handleCloseerr = () => {
        setIsErrorOpen(false);
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

    // view model
    const [openview, setOpenview] = useState(false);
    const handleClickOpenview = () => {
        setOpenview(true);
    };
    const handleCloseview = () => {
        setOpenview(false);
    };

    // info model
    const [openInfo, setOpeninfo] = useState(false);
    const handleClickOpeninfo = () => {
        setOpeninfo(true);
    };
    const handleCloseinfo = () => {
        setOpeninfo(false);
    };

    //Delete single model
    const [isDeleteSingleOpen, setIsDeleteSingleOpen] = useState(false);
    const handleClickSingleOpen = () => {
        setIsDeleteSingleOpen(true);
    };
    const handleCloseSingleMod = () => {
        setIsDeleteSingleOpen(false);
        setDeletesingledata({});
    };

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
        setSelectedRows([]);
        setSelectAllChecked(false);
    };

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

    // filter option state
    const [targetFilter, setTargetFilter] = useState([]);
    const [targetdetailFilter, setTargetdetailFilter] = useState({
        company: "Please Select Company",
        branch: "Please Select Branch",
        unit: "Please Select Unit",
        team: "Please Select Team",
        type: "Please Select Type",
        salaryrange: "Please Select Salary Range",
        amountvalue: "",
        process: "Please Select Process",
        from: "",
        to: ""

    });
    const [ProcessOptions, setProcessOptions] = useState([]);
    const [selectedCompanyFrom, setSelectedCompanyFrom] = useState([]);
    const [selectedBranchFrom, setSelectedBranchFrom] = useState([]);
    const [selectedProcessFrom, setSelectedProcessFrom] = useState([]);

    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);

    const handleCompanyChangeFrom = (options) => {
        setSelectedCompanyFrom(options);
        setSelectedBranchFrom([]);
        setSelectedProcessFrom([])

        setTargetdetailFilter({
            ...targetdetailFilter,
            process: "Please Select Process",
        })
    };
    const customValueRendererCompanyFrom = (valueCate, _company) => {
        return valueCate.length
            ? valueCate.map(({ label }) => label).join(", ")
            : "Please select Company";
    };

    const handleBranchChangeFrom = async (options) => {
        setSelectedBranchFrom(options);
        setSelectedProcessFrom([])
        setTargetdetailFilter({
            ...targetdetailFilter,
            process: "Please Select Process",
        })
        await fetchProcessQueue(options.map(d => d.value))
    };
    const customValueRendererBranchFrom = (valueCate, _branch) => {
        return valueCate.length
            ? valueCate.map(({ label }) => label).join(", ")
            : "Please select Branch";
    };

    const handleProcessChangeFrom = (options) => {
        setSelectedProcessFrom(options);

        setTargetdetailFilter({
            ...targetdetailFilter,
            process: "Please Select Process",
        })
        setProcessnames(options.map(item => item.name))
    };
    const customValueRendererProcessFrom = (valueCate, _process) => {
        return valueCate.length
            ? valueCate.map(({ label }) => label).join(", ")
            : "Please select Process";
    };

    const fetchCompanyAll = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.get(SERVICE.COMPANY, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let companyalldata = res?.data?.companies.map((item) => ({
                ...item,
                value: item.name,
                label: item.name,
            }));
            setCompanies(companyalldata);
        } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
    };
    const fetchBranchAll = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.get(SERVICE.BRANCH, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            setBranches(res.data.branch);
        } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
    };
    const [processnames, setProcessnames] = useState([])
    const fetchProcessQueue = async (pro) => {
        setPageName(!pageName);
        try {
            // Fetch process queue names from the API
            let res_freq = await axios.get(SERVICE.ALL_PROCESSQUEUENAME, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            let data_set = res_freq?.data?.processqueuename.filter(data =>
                pro.includes(data.branch) &&
                selectedCompanyFrom.some(comp => comp.value === data.company)
            );

            const all = data_set.map(d => ({
                ...d,
                label: d.code,
                value: d.code,
                name: d.name,
            }));

            // Set unique options in process options
            setProcessOptions(all.filter((item, index, self) => {
                return self.findIndex(i => i.label === item.label && i.value === item.value) === index;
            }));
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => {
        fetchCompanyAll();
        fetchBranchAll();
    }, [])

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const getRowClassName = (params) => {
        if (selectedRows.includes(params.row.id)) {
            return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
        }
        return ""; // Return an empty string for other rows
    };

    const [overallFilterdataAll, setOverallFilterdataAll] = useState([]);
    const [overallFilterdata, setOverallFilterdata] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // State to track advanced filter
    const [advancedFilter, setAdvancedFilter] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);
    const [filteredDataItems, setFilteredDataItems] = useState([]);
    //  const [filteredRowData, setFilteredRowData] = useState([]);
    const [logicOperator, setLogicOperator] = useState("AND");

    const [selectedColumn, setSelectedColumn] = useState("");
    const [selectedCondition, setSelectedCondition] = useState("Contains");
    const [filterValue, setFilterValue] = useState("");
    const [additionalFilters, setAdditionalFilters] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const conditions = ["Contains", "Does Not Contain", "Equals", "Does Not Equal", "Begins With", "Ends With", "Blank", "Not Blank"]; // AgGrid-like conditions

    // Search bar
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

    // Show filtered combination in the search bar
    const getSearchDisplay = () => {
        if (advancedFilter && advancedFilter.length > 0) {
            return advancedFilter.map((filter, index) => {
                let showname = columnDataTable.find(col => col.field === filter.column)?.headerName;
                return `${showname} ${filter.condition} "${filter.value}"`;
            }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
        }
        return searchQuery;
    };

    // Disable the search input if the search is active
    const isSearchDisabled = isSearchActive || additionalFilters.length > 0;

    const handleResetSearch = async () => {
        setLoader(true);
        // Reset all filters and pagination state
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
            // assignbranch: accessbranch,
            company: selectedCompanyFrom.map((item) => item.value),
            branch: selectedBranchFrom.map((item) => item.value),
            // processcode: selectedProcessFrom.map((item) => item.value),
            processcode: processnames,
        };

        const allFilters = [];
        // Only include advanced filters if they exist, otherwise just use regular searchQuery
        if (allFilters.length > 0 && selectedColumn !== "") {
            queryParams.allFilters = allFilters
            queryParams.logicOperator = logicOperator;
        } else if (searchQuery) {
            queryParams.searchQuery = "";  // Use searchQuery for regular search
        }

        try {
            let res_employee = await axios.post(SERVICE.ERAAMOUNTS_FILTER, queryParams, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            const ans = res_employee?.data?.eraamountFilters?.length > 0 ? res_employee?.data?.eraamountFilters : []
            const ansTotal = res_employee?.data?.totalProjectsdata?.length > 0 ? res_employee?.data?.totalProjectsdata : []
            const itemsWithSerialNumber = ans?.map((item, index) => ({
                ...item,
                id: item._id,
                serialNumber: (page - 1) * pageSize + index + 1,
                company: item.company,
                branch: item.branch,
                processcode: item.processcode,
                amount: Number(item.amount),
            }));
            const itemsWithSerialNumberTotal = ansTotal?.map((item, index) => ({
                ...item,
                id: item._id,
                serialNumber: (page - 1) * pageSize + index + 1,
                company: item.company,
                branch: item.branch,
                processcode: item.processcode,
                amount: Number(item.amount),
            }));

            setTargetFilter(itemsWithSerialNumber);
            setFilteredChanges(null);

            setOverallFilterdata(itemsWithSerialNumber.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    company: item.company,
                    branch: item.branch,
                    processcode: item.processcode,
                    amount: Number(item.amount),
                };
            }));
            setItems(itemsWithSerialNumber.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    company: item.company,
                    branch: item.branch,
                    processcode: item.processcode,
                    amount: Number(item.amount),
                };
            }))
            setOverallFilterdataAll(itemsWithSerialNumberTotal.map((item, index) => {
                return {
                    id: item._id,
                    serialNumber: item.serialNumber,
                    company: item.company,
                    branch: item.branch,
                    processcode: item.processcode,
                    amount: Number(item.amount),
                };
            }));
            setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
            setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
            setPageSize((data) => { return ans?.length > 0 ? data : 10 });
            setPage((data) => { return ans?.length > 0 ? data : 1 });
            setLoader(false)

            // Trigger a table refresh if necessary
            setPageName((prev) => !prev); // Force re-render
        } catch (err) {
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    const fetchEmployee = async () => {
        setPageName(!pageName);
        setLoader(true);

        const queryParams = {
            page: Number(page),
            pageSize: Number(pageSize),
            company: selectedCompanyFrom?.map((item) => item.value) || [],
            branch: selectedBranchFrom?.map((item) => item.value) || [],
            // processcode: selectedProcessFrom.length > 0 ? selectedProcessFrom?.map((item) => item.value) : [],
            processcode: processnames || [],
        };

        const allFilters = [
            ...(additionalFilters || []),
            { column: selectedColumn, condition: selectedCondition, value: filterValue }
        ];

        if (allFilters.length > 0 && selectedColumn !== "") {
            queryParams.allFilters = allFilters;
            queryParams.logicOperator = logicOperator;
        } else if (searchQuery) {
            queryParams.searchQuery = searchQuery;
        }

        try {
            const res_employee = await axios.post(SERVICE.ERAAMOUNT_SORT, queryParams, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            const ans = res_employee?.data?.result || []; // Default to empty array if no result
            const totalProjects = res_employee?.data?.totalProjects || 0;
            const totalPages = res_employee?.data?.totalPages || 0;

            // if (ans.length === 0) {
            //   // Do not trigger any alert, just clear the data
            //   setTargetFilter([]);
            //   setOverallFilterdata([]);
            //   setTotalProjects(0);
            //   setTotalPages(0);
            //   setPageSize(10);
            //   setPage(1);
            // } else {
            const itemsWithSerialNumber = ans?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                id: item._id,
                company: item.company,
                branch: item.branch,
                processcode: item.processcode,
                amount: Number(item.amount),
            }));

            const itemsWithSerialNumberTotal = ans?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                id: item._id,
                company: item.company,
                branch: item.branch,
                processcode: item.processcode,
                amount: Number(item.amount),
            }));

            setTargetFilter(itemsWithSerialNumber);
            setFilteredChanges(null);
            setOverallFilterdata(itemsWithSerialNumberTotal);

            setTotalProjects(totalProjects);
            setTotalPages(totalPages);
            setPageSize(ans?.length > 0 ? pageSize : 10);
            setPage(ans?.length > 0 ? page : 1);
            // }

            setLoader(false);
        } catch (err) {
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    // useEffect(() => {
    //   fetchEmployee();
    // }, [page, pageSize, searchQuery]);

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("ERA Amount List"),
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
        getapi();
    }, [])

    const [eraAmountEditArray, setEraAmountEditArray] = useState([])
    const [editsingleData, setEditsingleData] = useState({ processcode: "", amount: "" });

    const fetchEraAmountDataArray = async () => {
        setPageName(!pageName)
        try {
            let Res = await axios.post(SERVICE.ERAAMOUNTSASSIGNBRANCH, {
                assignbranch: accessbranch
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setEraAmountEdit(Res?.data?.eraamounts.filter((item) => item._id !== editsingleData._id));
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    useEffect(() => {
        fetchEraAmountDataArray()
    }, []);

    //delete singledata functionality
    const [deletesingleData, setDeletesingledata] = useState();
    const rowDataSingleDelete = async (id) => {
        setPageName(!pageName)
        try {
            let Res = await axios.get(`${SERVICE.ERAAMOUNT_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setDeletesingledata(Res?.data?.seraamount);
            handleClickSingleOpen();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const deleteSingleList = async () => {
        setPageName(!pageName)
        let deleteSingleid = deletesingleData?._id;
        try {
            const deletePromises = await axios.delete(`${SERVICE.ERAAMOUNT_SINGLE}/${deleteSingleid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            handleCloseSingleMod();
            setFilteredChanges(null);
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            // await fetchEmployee();
            await fetchFilter();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    //edit get data functionality single list
    const [viewsingleData, setviewsingleData] = useState({ processcode: "", amount: "" });

    const rowdatasingleedit = async (id) => {
        setPageName(!pageName)
        try {
            let Res = await axios.get(`${SERVICE.ERAAMOUNT_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setEditsingleData(Res?.data?.seraamount);
            setSelectedCompanyEdit(Res?.data?.seraamount?.company);
            setSelectedBranchEdit(Res?.data?.seraamount?.branch);
            handleClickOpenEdit();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const rowdatasingleview = async (id) => {
        setPageName(!pageName)
        try {
            let Res = await axios.get(`${SERVICE.ERAAMOUNT_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setviewsingleData(Res?.data?.seraamount);
            handleClickOpenview();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const editSubmit = async (e) => {

        let Res = await axios.get(SERVICE.ERAAMOUNTS, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
        });
        const eraAmountEditArray = Res?.data?.eraamounts.filter((item) => item._id !== editsingleData._id);
        e.preventDefault();
        const isNameMatch = eraAmountEditArray?.some((item) => item.company?.toLowerCase() == selectedCompanyEdit?.toLowerCase()
            && item.branch?.toLowerCase() == selectedBranchEdit?.toLowerCase()
            && item.processcode?.toLowerCase() == editsingleData.processcode?.toLowerCase()
            && item.amount?.toLowerCase() == editsingleData.amount?.toLowerCase());

        if (selectedCompanyEdit === "Please Select Company") {
            setPopupContentMalert("Please Select Company");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else if (selectedBranchEdit === "Please Select Branch") {
            setPopupContentMalert("Please Select Branch");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else if (editsingleData.processcode === "") {
            setPopupContentMalert("Please Enter Process Code");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else if (editsingleData.amount === "") {
            setPopupContentMalert("Please Enter Amount");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else if (isNameMatch) {
            setPopupContentMalert("Data already exists!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else {
            sendEditRequest();
        }
    };

    const sendEditRequest = async () => {
        setPageName(!pageName)
        let editid = editsingleData._id;
        try {
            let res = await axios.put(`${SERVICE.ERAAMOUNT_SINGLE}/${editid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: String(selectedCompanyEdit),
                branch: String(selectedBranchEdit),
                processcode: String(editsingleData.processcode),
                amount: String(editsingleData.amount),
                updatedby: [
                    ...updateby,
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            handleCloseModEdit();
            await fetchEraAmountDataArray();
            // await fetchEmployee();
            await fetchFilter();
            setEraAmountmanual({ ...eraAmountmanual, processcode: "", amount: "" });
            setPopupContent("Updated Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    //submit option for saving 
    const fetchFilter = async () => {
        setPageName(!pageName); // Toggle page name
        setLoader(true); // Set loader state

        const queryParams = {
            page: Number(page),
            pageSize: Number(pageSize),
            // assignbranch: accessbranch,
            company: selectedCompanyFrom.map((item) => item.value),
            branch: selectedBranchFrom.map((item) => item.value),
            // processcode: selectedProcessFrom.map((item) => item.value),
            processcode: processnames,

        };
        // const allFilters = [
        //   ...additionalFilters,
        //   { column: selectedColumn, condition: selectedCondition, value: filterValue }
        // ];
        // if (allFilters.length > 0 && selectedColumn !== "") {
        //   queryParams.allFilters = allFilters
        //   queryParams.logicOperator = logicOperator;
        // } else if (searchQuery) {
        //   queryParams.searchQuery = searchQuery;
        // }

        try {
            const response = await axios.post(
                SERVICE.ERAAMOUNTS_FILTER,
                queryParams,
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                }
            );

            const filteredData = response?.data?.eraamountFilters || [];

            const itemsWithSerialNumber = filteredData.map((item, index) => ({
                ...item,
                id: item._id,
                serialNumber: (page - 1) * pageSize + index + 1,
            }));

            // Update state with the filtered data
            setOverallFilterdata(itemsWithSerialNumber);
            setTargetFilter(itemsWithSerialNumber);

            setTotalProjects(filteredData?.length > 0 ? response?.data?.totalProjects : 0);
            setTotalPages(filteredData?.length > 0 ? response?.data?.totalPages : 0);
            setPageSize((data) => { return filteredData?.length > 0 ? data : 10 });
            setPage((data) => { return filteredData?.length > 0 ? data : 1 });
            setSearchQuery("")

            setLoader(false); // Stop loader
        } catch (err) {
            setLoader(false); // Stop loader on error
            console.error(err, "Error fetching era amount");
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const handleSubmitFilter = (e) => {
        e.preventDefault();
        if (selectedCompanyFrom.length === 0) {
            setPopupContentMalert("Please Select Company");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (selectedBranchFrom.length === 0) {
            setPopupContentMalert("Please Select Branch");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (selectedProcessFrom.length === 0) {
            setPopupContentMalert("Please Select Process");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }

        else {
            // setSearchQuery("")
            fetchFilter()
        }
    }

    const handleClearFilter = async (e) => {
        e.preventDefault();
        setTargetdetailFilter({
            ...targetdetailFilter,

            process: "Please Select Process",
            from: "",
            to: ""
        })
        setSelectedCompanyFrom([]);
        setSelectedBranchFrom([]);
        setSelectedProcessFrom([]);

        setProcessOptions([])
        setSearchQuery("")
        // fetchFilter();
        setTargetFilter([]);
        setOverallFilterdata([]);
        setPage(1);
        setPageSize(10);
        setTotalProjects(0);
        setTotalPages(0);
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    }


    const gridRefTableImg = useRef(null);
    // image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Upload Data List.png");
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
        documentTitle: "ERA Amount",
        pageStyle: "print",
    });

    //serial no for listing items

    const addSerialNumber = (datas) => {
        setItems(datas);
    };
    // useEffect(() => {
    //   addSerialNumber(overallFilterdata);
    // }, [overallFilterdata]);
    // useEffect(() => {
    //   addSerialNumber(eraAmounts);
    // }, [eraAmounts]);
    useEffect(() => {
        addSerialNumber(targetFilter);
    }, [targetFilter]);

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setSelectedRows([]);
        setSelectAllChecked(false);
        setPage(1);
    };
    //datatable....
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setFilterValue(event.target.value);
        fetchEmployee();
        setPage(1);
    };

    let updateby = editsingleData.updatedby;
    let addedby = editsingleData.addedby;

    const getinfoCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.ERAAMOUNT_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setEditsingleData(res?.data?.seraamount);
            handleClickOpeninfo();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    // Split the search query into individual terms
    const searchTerms = searchQuery.toLowerCase().split(" ");

    // Modify the filtering logic to check each term
    const filteredDatas = items?.filter((item) => {
        return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
    });

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
            pinned: 'left', lockPinned: true,
        },
        {
            field: "company",
            headerName: "Company",
            flex: 0,
            width: 200,
            hide: !columnVisibility.company,
            headerClassName: "bold-header",
            pinned: 'left', lockPinned: true,
        },
        {
            field: "branch",
            headerName: "Branch",
            flex: 0,
            width: 200,
            hide: !columnVisibility.branch,
            headerClassName: "bold-header",
            pinned: 'left', lockPinned: true,
        },
        {
            field: "processcode",
            headerName: "Process Code",
            flex: 0,
            width: 200,
            hide: !columnVisibility.processcode,
            headerClassName: "bold-header",
        },
        {
            field: "amount",
            headerName: "Amount",
            flex: 0,
            width: 200,
            hide: !columnVisibility.amount,
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
                    {isUserRoleCompare?.includes("eeraamount") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                rowdatasingleedit(params.data.id);
                            }}
                        >
                            <EditOutlinedIcon sx={buttonStyles.buttonedit} />            </Button>
                    )}
                    {isUserRoleCompare?.includes("deraamount") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                rowDataSingleDelete(params.data.id);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />            </Button>
                    )}
                    {isUserRoleCompare?.includes("veraamount") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                rowdatasingleview(params.data.id);
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />            </Button>
                    )}
                    {isUserRoleCompare?.includes("ieraamount") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getinfoCode(params.data.id);
                            }}
                        >
                            <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />            </Button>
                    )}
                </Grid>
            ),
        },
    ];

    const filteredSelectedColumn = columnDataTable.filter(data => data.field !== 'checkbox' && data.field !== "actions" && data.field !== "serialNumber");

    const rowDataTable = filteredDatas.map((item, index) => {
        return {
            // id: item.id,
            id: item._id,
            serialNumber: item.serialNumber,
            company: item.company,
            branch: item.branch,
            processcode: item.processcode,
            amount: Number(item.amount),
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

    //SECOND TABLE FDATA AND FUNCTIONS

    const [loader, setLoader] = useState(false);

    const deleteAllDataList = async () => {
        setPageName(!pageName)
        setLoader(true)
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.ERAAMOUNT_SINGLE}/${item}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
            });
            await Promise.all(deletePromises);
            setIsHandleChange(false);
            handleCloseModcheckbox();
            setFilteredChanges(null);
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            await fetchEraAmountDataArray();
            // await fetchEmployee();
            await fetchFilter();
            setLoader(false)
        } catch (err) { setLoader(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    // page refersh reload
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ""; // This is required for Chrome support
    };

    useEffect(() => {
        localStorage.removeItem("filterModel");
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, []);

    //  Datefield
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + "-" + mm + "-" + yyyy;

    const [fileFormat, setFormat] = useState('')

    return (
        <Box>
            <Headtitle title={"ERA AMOUNT"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="ERA Amount"
                modulename="Production"
                submodulename="SetUp"
                mainpagename="ERA Amount List"
                subpagename=""
                subsubpagename=""
            />
            <br />
            {isUserRoleCompare?.includes("arevenueamountlist")
                && (
                    <Box sx={userStyle.selectcontainer}>

                        <Grid container spacing={2}>
                            <Grid item md={12} xs={12} sm={12}>
                                <Typography sx={userStyle.HeaderText}>ERA Amount Filter</Typography>
                            </Grid>
                        </Grid><br />
                        <Grid container spacing={2}>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Company<b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <MultiSelect
                                        options={isAssignBranch?.map(data => ({
                                            label: data.company,
                                            value: data.company,
                                        })).filter((item, index, self) => {
                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                        })}

                                        styles={colourStyles}

                                        value={selectedCompanyFrom}
                                        onChange={handleCompanyChangeFrom}
                                        valueRenderer={customValueRendererCompanyFrom}
                                        labelledBy="Please Select Company"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Branch<b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <MultiSelect
                                        options={isAssignBranch?.filter(
                                            (comp) =>
                                                selectedCompanyFrom.map(data => data.value).includes(comp.company)
                                        )?.map(data => ({
                                            label: data.branch,
                                            value: data.branch,
                                        })).filter((item, index, self) => {
                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                        })}

                                        styles={colourStyles}

                                        value={selectedBranchFrom}
                                        onChange={handleBranchChangeFrom}
                                        valueRenderer={customValueRendererBranchFrom}
                                        labelledBy="Please Select Branch"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <Typography>
                                    Process<b style={{ color: "red" }}>*</b>
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <MultiSelect
                                        options={ProcessOptions}

                                        styles={colourStyles}

                                        value={selectedProcessFrom}
                                        onChange={handleProcessChangeFrom}
                                        valueRenderer={customValueRendererProcessFrom}
                                        labelledBy="Please Select Process"
                                    />
                                </FormControl>
                            </Grid>

                        </Grid>
                        <br />  <br />
                        <Grid container spacing={2}>
                            <Grid item md={3} xs={12} sm={6}>
                                <Button variant='contained' color='primary' onClick={handleSubmitFilter}>Filter</Button>
                            </Grid>
                            <Grid item md={2.5} xs={12} sm={6}>
                                <Button sx={userStyle.btncancel} onClick={handleClearFilter}>Clear</Button>

                            </Grid>
                        </Grid>
                    </Box>

                )}
            <br />
            {/* ****** Table Start ****** */}

            {isUserRoleCompare?.includes("leraamount") && (
                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Upload Data List</Typography>
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
                                    {isUserRoleCompare?.includes("exceleraamount") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen2(true)
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csveraamount") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen2(true)
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printeraamount") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdferaamount") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen2(true)
                                                }}
                                            >
                                                <FaFilePdf />
                                                &ensp;Export to PDF&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imageeraamount") && (
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
                        &ensp;
                        {isUserRoleCompare?.includes("bderaamount") && (
                            <Button sx={buttonStyles.buttonbulkdelete}
                                size="small" onClick={handleClickOpenalert} >
                                Bulk Delete
                            </Button>)}
                        <br />
                        <br />
                        {loader ? (
                            <Box sx={{ display: "flex", justifyContent: "center", minHeight: "350px" }}>
                                <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                            </Box>
                        ) : (<>
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
                                itemsList={overallFilterdataAll}
                            // itemsList={overallFilterdata}
                            />
                        </>
                        )}
                        {/* ****** Table End ****** */}
                    </Box>

                    {/* Search Bar */}
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
            )
            }
            {/* ****** Table End ****** */}
            {/* view model */}
            <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
                <DialogContent>
                    <Box sx={{ padding: "20px 30px" }}>
                        <Grid container spacing={2}>
                            <Grid item md={12} xs={12} sm={6}>
                                <Typography sx={userStyle.HeaderText}>ERA Amount View</Typography>
                            </Grid>
                        </Grid>
                        <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={6} xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <Typography>Company</Typography>
                                    <Typography>{viewsingleData.company}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <Typography>Branch</Typography>
                                    <Typography>{viewsingleData.branch}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <Typography>Process Code</Typography>
                                    <Typography>{viewsingleData.processcode}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <Typography>Amount</Typography>
                                    <Typography>{viewsingleData.amount}</Typography>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <br /> <br /> <br />
                        <Grid container spacing={2}>
                            <Button variant="contained" color="primary" onClick={handleCloseview}
                                sx={{ ...buttonStyles.btncancel, marginLeft: "15px" }}>
                                Back
                            </Button>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
            {/* Edit DIALOG */}
            <Dialog
                open={isEditOpen}
                onClose={handleCloseModEdit}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="sm"
                fullWidth={true}
                sx={{
                    overflow: "visible",
                    "& .MuiPaper-root": {
                        overflow: "visible",
                    },
                }}
            >
                <Box sx={userStyle.dialogbox}>
                    <Grid container spacing={2}>
                        <Grid item md={12} xs={12} sm={6}>
                            <Typography sx={userStyle.HeaderText}> ERA Amount Edit</Typography>
                        </Grid>
                    </Grid>
                    <br /> <br />
                    <Grid container spacing={2}>
                        <Grid item md={6} xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Company<b style={{ color: "red" }}>*</b>
                                </Typography>
                                <Selects
                                    maxMenuHeight={250}
                                    options={accessbranch?.map(data => ({
                                        label: data.company,
                                        value: data.company,
                                    })).filter((item, index, self) => {
                                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                    })}
                                    placeholder="Please Select Company"
                                    value={{ label: selectedCompanyEdit, value: selectedCompanyEdit }}
                                    onChange={(e) => {
                                        setSelectedCompanyEdit(e.value);
                                        setSelectedBranchEdit("Please Select Branch");
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={6} xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Branch<b style={{ color: "red" }}>*</b>
                                </Typography>
                                <Selects
                                    maxMenuHeight={250}
                                    options={accessbranch?.filter(
                                        (comp) =>
                                            comp.company === selectedCompanyEdit
                                    )?.map(data => ({
                                        label: data.branch,
                                        value: data.branch,
                                    })).filter((item, index, self) => {
                                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                    })}
                                    placeholder="Please Select Branch"
                                    value={{ label: selectedBranchEdit, value: selectedBranchEdit }}
                                    onChange={(e) => {
                                        setSelectedBranchEdit(e.value);
                                        setSelectedBranchCodeEdit(e.codeval);
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={6} xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Process Code<b style={{ color: "red" }}>*</b>
                                </Typography>
                                <OutlinedInput
                                    placeholder="Please Enter Process Code"
                                    value={editsingleData.processcode}
                                    onChange={(e) => {
                                        setEditsingleData({
                                            ...editsingleData,
                                            processcode: e.target.value,
                                        });
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={6} xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Amount<b style={{ color: "red" }}>*</b>
                                </Typography>
                                <OutlinedInput
                                    placeholder="Please Enter Amount"
                                    value={editsingleData.amount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            setEditsingleData({
                                                ...editsingleData,
                                                amount: value,
                                            });
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>{" "}
                    <br /> <br />
                    <Grid container spacing={2} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Grid item md={6} xs={12} sm={12}>
                            <Button sx={buttonStyles.buttonsubmit} onClick={editSubmit}>
                                {" "}
                                Update
                            </Button>
                        </Grid>
                        <br />
                        <Grid item md={6} xs={12} sm={12}>
                            <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                                {" "}
                                Cancel{" "}
                            </Button>
                        </Grid>
                    </Grid>
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
            <br />

            {/* second table starts */}
            {/* EXTERNAL COMPONENTS -------------- START */}
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
                isFilterOpen={isFilterOpen2}
                handleCloseFilterMod={handleCloseFilterMod2}
                fileFormat={fileFormat}
                setIsFilterOpen={setIsFilterOpen2}
                isPdfFilterOpen={isPdfFilterOpen2}
                setIsPdfFilterOpen={setIsPdfFilterOpen2}
                handleClosePdfFilterMod={handleClosePdfFilterMod2}
                filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
                // itemsTwo={eraAmountsArray ?? []}
                itemsTwo={overallFilterdata ?? []}
                filename={"EraAmount"}
                exportColumnNames={exportColumnNames2}
                exportRowValues={exportRowValues2}
                componentRef={componentRef}
            />
            {/* INFO */}
            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="ERA Amount Info"
                addedby={addedby}
                updateby={updateby}
            />
            {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
            <DeleteConfirmation
                open={isDeleteSingleOpen}
                onClose={handleCloseSingleMod}
                onConfirm={deleteSingleList}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
            {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}
            <DeleteConfirmation
                open={isDeleteOpencheckbox}
                onClose={handleCloseModcheckbox}
                onConfirm={deleteAllDataList}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
            {/* PLEASE SELECT ANY ROW */}
            <PleaseSelectRow
                open={isDeleteOpenalert}
                onClose={handleCloseModalert}
                message="Please Select any Row"
                iconColor="orange"
                buttonText="OK"
            />
            {/* EXTERNAL COMPONENTS -------------- END */}
            {/* second table ends */}

            <br />

        </Box >
    );
}

export default EraAmountList;