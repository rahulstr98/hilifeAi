import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Select, TextField, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
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
import StyledDataGrid from "../../components/TableStyle";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import FirstPageIcon from "@mui/icons-material/FirstPage";

function AccurayMaster() {
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

    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, isAssignBranch,
        buttonStyles } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);
    const [loader, setLoader] = useState(false);
    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState();
    const [openview, setOpenview] = useState(false);
    const [openInfo, setOpeninfo] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedData, setCopiedData] = useState("");
    const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        projectvendor: true,
        queue: true,
        minimumaccuracy: true,
        // subcategory: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
    const [accuracyMasterArray, setAccuracyMasterArray] = useState([]);
    const [allAccuracymasterEdit, setAllAccuracymasterEdit] = useState([]); const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    let exportColumnNames = ["Project", "Queue", "Minimum Accuracy"];
    let exportRowValues = ["projectvendor", "queue", "minimumaccuracy"];
    //useEffect
    useEffect(() => {
        addSerialNumber();
    }, [accuracyMasterArray]); useEffect(() => {
        fetchEmployee();
    }, []); useEffect(() => {
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, []);
    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };
    // Error Popup model
    const handleClickOpenerr = () => {
        setIsErrorOpen(true);
    };
    // view model
    const handleClickOpenview = () => {
        setOpenview(true);
    };
    const handleCloseview = () => {
        setOpenview(false);
    };
    const handleCloseerr = () => {
        setIsErrorOpen(false);
    };    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    }; const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };    // info model
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
    // page refersh reload
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ""; // This is required for Chrome support
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
    const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false); const handleClickOpencheckbox = () => {
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
    };    // for accuracy master
    const [projects, setProjects] = useState([]);
    const [projectsEdit, setProjectsEdit] = useState([]); const [accuracyMaster, setAccuracyMaster] = useState({
        projectvendor: "Please Select Project", queue: "", minimumaccuracy: ""
    });
    const [accuracyMasterEdit, setAccuracyMasterEdit] = useState({
        // projectvendor: "Please Select Project", queue: "", minimumaccuracy: ""
    });    //fetching Project for Dropdowns
    const fetchProjectDropdowns = async () => {
        setPageName(!pageName)
        try {
            let res_project = await axios.get(SERVICE.PROJECTMASTER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const projall = [
                ...res_project?.data?.projmaster.map((d) => ({
                    ...d,
                    label: d.name,
                    value: d.name,
                })),
            ];
            setProjects(projall);
            setProjectsEdit(projall);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    }; useEffect(() => {
        fetchProjectDropdowns();
    }, []); const [accuracyMasterFilterArray, setAccuracyMasterFilterArray] = useState([])
    const pathname = window.location.pathname;
    const fetchAccuracyMasterArray = async () => {
        setPageName(!pageName)
        try {
            let res_freq = await axios.get(SERVICE.ACCURACYMASTERGETALL, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAccuracyMasterFilterArray(res_freq?.data?.accuracymaster);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    }; useEffect(() => {
        fetchAccuracyMasterArray()
    }, [isFilterOpen])
    const [overallFilterdata, setOverallFilterdata] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);

    const fetchEmployee = async () => {
            setPageName(!pageName)

            try {
                let res_employee = await axios.get(SERVICE.ACCURACYMASTERGETALL, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
                const ans = res_employee?.data?.accuracymaster?.length > 0 ? res_employee?.data?.accuracymaster : []
                const itemsWithSerialNumber = ans?.map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                    // serialNumber: index + 1,
                }));
                //   setcheckemployeelist(true);
                setAccuracyMasterArray(itemsWithSerialNumber);
                setOverallFilterdata(itemsWithSerialNumber);
                setLoader(true)
            } catch (err) { setLoader(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

        }; useEffect(() => {
            fetchEmployee();
        }, [page, pageSize, searchQuery]); const fetchAccuracyMasterAll = async () => {
            setPageName(!pageName)
            try {
                let res_freq = await axios.get(SERVICE.ACCURACYMASTERGETALL, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
                setLoader(true);
                return res_freq?.data?.accuracymaster.filter((item) => item._id !== accuracyMasterEdit._id)
            } catch (err) { setLoader(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
        };
    //set function to get particular row
    const rowData = async (id) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.ACCURACYMASTER_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            }); setAccuracyMasterEdit(res?.data?.singleaccuracymaster);
            handleClickOpen();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    // Alert delete popup
    let brandid = accuracyMasterEdit._id;
    const delBrand = async () => {
        setPageName(!pageName)
        try {
            await axios.delete(`${SERVICE.ACCURACYMASTER_SINGLE}/${brandid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            await fetchEmployee();
            handleCloseMod();
            setSelectedRows([]);
            setPage(1);
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    const [isBtn, setIsBtn] = useState(false)    //add function
    const sendRequest = async () => {
        setIsBtn(true)
        setPageName(!pageName)
        try {
            await axios.post(SERVICE.ACCURACYMASTER_CREATE, {
                projectvendor: String(accuracyMaster.projectvendor),
                queue: String(accuracyMaster.queue),
                minimumaccuracy: Number(accuracyMaster.minimumaccuracy),
                addedby: [
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchEmployee();
            setAccuracyMaster({
                ...accuracyMaster,
                queue: "", minimumaccuracy: ""
            });
            setPopupContent("Added Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            setIsBtn(false)
        } catch (err) { setIsBtn(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };    //submit option for saving
    const handleSubmit = (e) => {
        e.preventDefault();
        const isNameMatch = accuracyMasterArray.some((item) => item.projectvendor === accuracyMaster.projectvendor
            && item.queue?.toLowerCase() === accuracyMaster.queue?.toLowerCase()
        );
        if (accuracyMaster.projectvendor === 'Please Select Project') {
            setPopupContentMalert("Please Select Project");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (accuracyMaster.queue === "") {
            setPopupContentMalert("Please Enter Queue");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (accuracyMaster.minimumaccuracy === "") {
            setPopupContentMalert("Please Enter Minimum Accuracy");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {

            setPopupContentMalert("Data Already Exists!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else {
            sendRequest();
        }
    }; const handleclear = (e) => {
        e.preventDefault();
        setAccuracyMaster({
            projectvendor: "Please Select Project", queue: "", minimumaccuracy: ""
        });
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
    //get single row to edit....
    const getCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.ACCURACYMASTER_SINGLE}/${e}`);
            setAccuracyMasterEdit(res?.data?.singleaccuracymaster);
            handleClickOpenEdit();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };    // get single row to view....
    const getviewCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.ACCURACYMASTER_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAccuracyMasterEdit(res?.data?.singleaccuracymaster);
            handleClickOpenview();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    // get single row to view....
    const getinfoCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.ACCURACYMASTER_SINGLE}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAccuracyMasterEdit(res?.data?.singleaccuracymaster);
            handleClickOpeninfo();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    //frequency master name updateby edit page...
    let updateby = accuracyMasterEdit.updatedby;
    let addedby = accuracyMasterEdit.addedby;
    let frequencyId = accuracyMasterEdit._id;
    //editing the single data...
    const sendEditRequest = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.put(`${SERVICE.ACCURACYMASTER_SINGLE}/${frequencyId}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                projectvendor: String(accuracyMasterEdit.projectvendor),
                queue: String(accuracyMasterEdit.queue),
                minimumaccuracy: Number(accuracyMasterEdit.minimumaccuracy),
                updatedby: [
                    ...updateby,
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchEmployee();
            handleCloseModEdit();
            setPopupContent("Updated Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };
    const editSubmit = async (e) => {
        e.preventDefault();
        let resdata = await fetchAccuracyMasterAll();
        const isNameMatch = resdata.some((item) => item.projectvendor === accuracyMasterEdit.projectvendor
            && item.queue?.toLowerCase() === accuracyMasterEdit.queue?.toLowerCase()
        ); if (accuracyMasterEdit.projectvendor === 'Please Select Project') {
            setPopupContentMalert("'Please Select Project");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (accuracyMasterEdit.queue === "") {
            setPopupContentMalert("Please Enter Queue");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (accuracyMasterEdit.minimumaccuracy === "") {
            setPopupContentMalert("Please Enter Minimum Accuracy");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {
            setPopupContentMalert("Data Already Exists!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            sendEditRequest();
        }
    };
    const delAreagrpcheckbox = async () => {
        setPageName(!pageName)
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.ACCURACYMASTER_SINGLE}/${item}`, {
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
            setPage(1); await fetchEmployee();
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };    //image

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("Accuracy Master"),
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
    }, []);

    const handleCaptureImage = () => {
        if (gridRef.current) {
            html2canvas(gridRef.current).then((canvas) => {
                canvas.toBlob((blob) => {
                    saveAs(blob, "Accuracy Master.png");
                });
            });
        }
    };      // Excel
    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Accuracy Master",
        pageStyle: "print",
    });    //serial no for listing items
    const addSerialNumber = () => {
        const itemsWithSerialNumber = accuracyMasterArray?.map((item, index) => ({
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
    };    // Split the search query into individual terms
    const searchTerms = searchQuery.toLowerCase().split(" ");    // Modify the filtering logic to check each term
    const filteredDatas = overallFilterdata?.filter((item) => {
        return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
    }); 
    
    const filteredData = filteredDatas.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const totalPages = Math.ceil(filteredDatas.length / pageSize);

    const visiblePages = Math.min(totalPages, 3);

    const firstVisiblePage = Math.max(1, page - 1);
    const lastVisiblePage = Math.min(
        Math.abs(firstVisiblePage + visiblePages - 1),
        totalPages
    );

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
    const columnDataTable = [
        {
            field: "checkbox",
            headerName: "Checkbox",
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
            ), renderCell: (params) => (
                <Checkbox
                    checked={selectedRows.includes(params.row.id)}
                    onChange={() => {
                        let updatedSelectedRows;
                        if (selectedRows.includes(params.row.id)) {
                            updatedSelectedRows = selectedRows.filter((selectedId) => selectedId !== params.row.id);
                        } else {
                            updatedSelectedRows = [...selectedRows, params.row.id];
                        }
                        setSelectedRows(updatedSelectedRows);
                        // Update the "Select All" checkbox based on whether all rows are selected
                        setSelectAllChecked(updatedSelectedRows.length === filteredDatas.length);
                    }}
                />
            ),
            sortable: false, // Optionally, you can make this column not sortable
            width: 75,
            hide: !columnVisibility.checkbox,
            headerClassName: "bold-header",
        },
        {
            field: "serialNumber",
            headerName: "SNo",
            flex: 0,
            width: 75,
            hide: !columnVisibility.serialNumber,
            headerClassName: "bold-header",
        },
        {
            field: "projectvendor",
            headerName: "Project",
            flex: 0,
            width: 200,
            hide: !columnVisibility.projectvendor,
            headerClassName: "bold-header",
        },
        {
            field: "queue",
            headerName: "Queue",
            flex: 0,
            width: 200,
            hide: !columnVisibility.queue,
            headerClassName: "bold-header",
        },
        {
            field: "minimumaccuracy",
            headerName: "Minimum Accuracy",
            flex: 0,
            width: 200,
            hide: !columnVisibility.minimumaccuracy,
            headerClassName: "bold-header",
        }, {
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
                    {isUserRoleCompare?.includes("eaccuracymaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getCode(params.row.id);
                            }}
                        >
                            <EditOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonedit} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("daccuracymaster") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                rowData(params.row.id);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttondelete} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("vaccuracymaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getviewCode(params.row.id);
                            }}
                        >
                            <VisibilityOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonview} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("iaccuracymaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getinfoCode(params.row.id);
                            }}
                        >
                            <InfoOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttoninfo} />
                        </Button>
                    )}
                </Grid>
            ),
        },
    ]; const rowDataTable = filteredData.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            projectvendor: item.projectvendor,
            queue: item.queue,
            minimumaccuracy: item.minimumaccuracy + " %"
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
    const [fileFormat, setFormat] = useState('')

    return (
        <Box>
            <Headtitle title={"ACCURACY MASTER"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="Accuracy Master"
                modulename="Quality"
                submodulename="Accuracy"
                mainpagename="Accuracy Master"
                subpagename=""
                subsubpagename=""
            />
            <>
                {isUserRoleCompare?.includes("aaccuracymaster") && (
                    <Box sx={userStyle.selectcontainer}>
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <Typography sx={userStyle.importheadtext}>Add Accuracy Master</Typography>
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container spacing={2}>
                                <Grid item md={4} sm={6} xs={12}>
                                    <FormControl fullWidth size="small" >
                                        <Typography>Project <b style={{ color: "red" }}>*</b></Typography>
                                        <Selects
                                            options={projects}
                                            styles={colourStyles}
                                            value={{
                                                label: accuracyMaster.projectvendor,
                                                value: accuracyMaster.projectvendor,
                                            }}
                                            onChange={(e) => {
                                                setAccuracyMaster({
                                                    ...accuracyMaster,
                                                    projectvendor: e.value,
                                                });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={6}>
                                    <Typography> Queue<b style={{ color: "red" }}>*</b> </Typography>
                                    <FormControl fullWidth size="small">
                                        <OutlinedInput
                                            value={accuracyMaster.queue}
                                            type="text"
                                            placeholder="Please Enter Queue"
                                            onChange={(e) => { setAccuracyMaster({ ...accuracyMaster, queue: e.target.value }) }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={6}>
                                    <Typography> Minimum Accuracy<b style={{ color: "red" }}>*</b> </Typography>
                                    <FormControl fullWidth size="small">
                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[-1000000-9]*"
                                            placeholder="Please Enter Minimum Accuracy"
                                            inputProps={{
                                                min: -100000,
                                                max: 100000,
                                                step: 0.01,
                                                pattern: "\\d*\\.?\\d{0,2}"
                                            }}
                                            value={accuracyMaster.minimumaccuracy}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                // Check if the new value matches the allowed pattern
                                                const isValid = /^(-?\d{0,6}(\.\d{0,2})?|1000000(\.00?)?)$/.test(newValue);
                                                if (isValid || newValue === '') {
                                                    setAccuracyMaster(prev => ({
                                                        ...prev,
                                                        minimumaccuracy: newValue
                                                    }));
                                                }
                                            }}
                                        />                                    </FormControl>
                                </Grid>                            </Grid>
                            <br />
                            <br />
                            <Grid container>
                                <Grid item md={3} xs={12} sm={6}>
                                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isBtn} sx={buttonStyles.buttonsubmit}>
                                        Submit
                                    </Button>
                                </Grid>
                                <Grid item md={3} xs={12} sm={6}>
                                    <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                                        Clear
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    </Box>
                )}
            </>
            <br /> <br />
            {/* ****** Table Start ****** */}
            {
                isUserRoleCompare?.includes("laccuracymaster") && (
                    <>
                        <Box sx={userStyle.container}>
                            {/* ******************************************************EXPORT Buttons****************************************************** */}
                            <Grid item xs={8}>
                                <Typography sx={userStyle.importheadtext}>Accuracy Master List</Typography>
                            </Grid>
                            <Grid container spacing={2} style={{...userStyle.dataTablestyle,display:'flex', alignItems:'center'}}>
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
                                        {isUserRoleCompare?.includes("excelaccuracymaster") && (
                                            <>
                                                <Button onClick={(e) => {
                                                    setIsFilterOpen(true)
                                                    fetchAccuracyMasterArray()
                                                    setFormat("xl")
                                                }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("csvaccuracymaster") && (
                                            <>
                                                <Button onClick={(e) => {
                                                    setIsFilterOpen(true)
                                                    fetchAccuracyMasterArray()
                                                    setFormat("csv")
                                                }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to CSV&ensp;</Button>
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("printaccuracymaster") && (
                                            <>
                                                <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                    &ensp;
                                                    <FaPrint />
                                                    &ensp;Print&ensp;
                                                </Button>
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("pdfaccuracymaster") && (
                                            <>
                                                <Button sx={userStyle.buttongrp}
                                                    onClick={() => {
                                                        setIsPdfFilterOpen(true)
                                                        fetchAccuracyMasterArray()
                                                    }}
                                                >
                                                    <FaFilePdf />
                                                    &ensp;Export to PDF&ensp;
                                                </Button>
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("imageaccuracymaster") && (
                                            <>
                                                <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                                                    {" "}
                                                    <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item md={2} xs={12} sm={12}>
                                    <Box>
                                        <FormControl fullWidth size="small">
                                            <Typography>Search</Typography>
                                            <OutlinedInput id="component-outlined" type="text" value={searchQuery} onChange={handleSearchChange} />
                                        </FormControl>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
                                Show All Columns
                            </Button>
                            &ensp;
                            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
                                Manage Columns
                            </Button>
                            &ensp;
                            {isUserRoleCompare?.includes("bdaccuracymaster") && (
                                <>
                                    <Button variant="contained" color="error" onClick={handleClickOpenalert} sx={buttonStyles.buttonbulkdelete}>
                                        Bulk Delete
                                    </Button>
                                </>
                            )}
                            <br />
                            <br />
                            {!loader ? (
                                <Box sx={userStyle.container}>
                                    <Box sx={{ display: "flex", justifyContent: "center", minHeight: "350px" }}>
                                        <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                                    </Box>
                                </Box>
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
                                        Showing{" "}
                                        {filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                                        {Math.min(page * pageSize, filteredDatas.length)} of{" "}
                                        {filteredDatas.length} entries
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
                                </Box>                        </>
                            )}
                            {/* ****** Table End ****** */}
                        </Box>
                    </>
                )
            }
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

            {/* view model */}
            <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <Box sx={{ width: "550px", padding: "20px 50px" }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Accuracy Master</Typography>
                        <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Project</Typography>
                                    <Typography>{accuracyMasterEdit.projectvendor}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Queue</Typography>
                                    <Typography>{accuracyMasterEdit.queue}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Minimum Accuracy</Typography>
                                    <Typography>{accuracyMasterEdit.minimumaccuracy} %</Typography>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <br /> <br /> <br />
                        <Grid container spacing={2}>
                            <Button variant="contained" color="primary" onClick={handleCloseview} sx={buttonStyles.btncancel}>
                                Back
                            </Button>
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

            {/* Edit DIALOG */}
            <Box>
                <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true} sx={{
                    overflow: 'visible',
                    '& .MuiPaper-root': {
                        overflow: 'visible',
                    },
                }}>
                    <Box sx={{ padding: "20px 50px" }}>
                        <>
                            <Grid container spacing={2}>
                                <Typography sx={userStyle.HeaderText}>Edit Accuracy Master</Typography>
                            </Grid>
                            <br />
                            <Grid container spacing={2}>
                                <Grid item md={6} sm={6} xs={12}>
                                    <FormControl fullWidth size="small" >
                                        <Typography>Project <b style={{ color: "red" }}>*</b></Typography>
                                        <Selects
                                            options={projectsEdit}
                                            styles={colourStyles}
                                            value={{
                                                label: accuracyMasterEdit.projectvendor,
                                                value: accuracyMasterEdit.projectvendor,
                                            }}
                                            onChange={(e) => {
                                                setAccuracyMasterEdit({
                                                    ...accuracyMasterEdit,
                                                    projectvendor: e.value,
                                                });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={6} xs={12} sm={6}>
                                    <Typography> Queue <b style={{ color: "red" }}>*</b></Typography>
                                    <FormControl fullWidth size="small">
                                        <OutlinedInput
                                            value={accuracyMasterEdit.queue}
                                            type="text"
                                            placeholder="Please Enter Queue"
                                            onChange={(e) => { setAccuracyMasterEdit({ ...accuracyMasterEdit, queue: e.target.value }) }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={6} xs={12} sm={6}>
                                    <Typography> Minimum Accuracy<b style={{ color: "red" }}>*</b> </Typography>
                                    <FormControl fullWidth size="small">
                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*"
                                            placeholder="Please Enter Minimum Accuracy"
                                            value={accuracyMasterEdit.minimumaccuracy}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                // Check if the new value matches the allowed pattern
                                                const isValid = /^(-?\d{0,6}(\.\d{0,2})?|1000000(\.00?)?)$/.test(newValue);
                                                if (isValid || newValue === '') {
                                                    setAccuracyMasterEdit({ ...accuracyMasterEdit, minimumaccuracy: e.target.value });
                                                }
                                            }}
                                        />                                    </FormControl>
                                </Grid>
                            </Grid>
                            <br /> <br />
                            <Grid container spacing={2}>
                                <Grid item md={6} xs={12} sm={12}>
                                    <Button variant="contained" onClick={editSubmit} sx={buttonStyles.buttonsubmit}>
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
                        </>
                    </Box>
                </Dialog>
            </Box>
            <br />
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
                filteredDataTwo={filteredDatas ?? []}
                itemsTwo={accuracyMasterFilterArray ?? []}
                filename={"Accuracy Master"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="Accuracy Master Info"
                addedby={addedby}
                updateby={updateby}
            />
            <DeleteConfirmation
                open={isDeleteOpen}
                onClose={handleCloseMod}
                onConfirm={delBrand}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
            <DeleteConfirmation
                open={isDeleteOpencheckbox}
                onClose={handleCloseModcheckbox}
                onConfirm={delAreagrpcheckbox}
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
            />        </Box >
    );
}

export default AccurayMaster;
