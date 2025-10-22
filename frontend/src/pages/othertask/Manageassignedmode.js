import React, { useState, useEffect, useRef, useContext } from "react";
import {
    Box, Typography, OutlinedInput, Select, MenuItem, Dialog,
    DialogContent, DialogActions, FormControl, Grid,
    Button, List, ListItem, DialogContentText
    , ListItemText, Popover, CircularProgress,
    Checkbox, TextField, Backdrop, IconButton
} from "@mui/material";
import { userStyle } from "../../pageStyle";
import { FaPrint, FaFilePdf } from "react-icons/fa";
import { handleApiError } from "../../components/Errorhandling";
import 'jspdf-autotable';
import axios from "axios";
import { SERVICE } from '../../services/Baseservice';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useReactToPrint } from "react-to-print";
import { UserRoleAccessContext, AuthContext } from '../../context/Appcontext';
import StyledDataGrid from "../../components/TableStyle";
import Headtitle from "../../components/Headtitle";
import { ThreeDots } from 'react-loader-spinner';
import { saveAs } from "file-saver";
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from 'html2canvas';
import ImageIcon from '@mui/icons-material/Image';
import Pagination from '../../components/Pagination';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import AlertDialog from "../../components/Alert";
import {
    DeleteConfirmation,
    PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import ExportData from "../../components/ExportData";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PageHeading from "../../components/PageHeading";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LastPageIcon from "@mui/icons-material/LastPage";

function Manageassignedmode() {
    const [isLoading, setIsLoading] = useState(false);

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
    //Delete model
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const handleClickOpen = () => {
        setIsDeleteOpen(true);
    };
    const handleCloseMod = () => {
        setIsDeleteOpen(false);
    };
    const [manageassignedmode, setManageAssignedMode] = useState({ manageassignedname: "" });
    const [assignedByArray, setAssignebyArray] = useState([])
    const [isActive, setIsActive] = useState(false)
    const [manageAssignedByEdit, setManageAssignedByEdit] = useState({ manageassignedname: "" })
    const [manageAssigned, setManageAssignedby] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [allSourceedit, setAllSourceedit] = useState([]);
    const [manageId, setManageId] = useState("")
    const [sourceCheck, setSourcecheck] = useState(false);
    const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);
    const username = isUserRoleAccess?.companyname;
    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [copiedData, setCopiedData] = useState('');
    //image
    const handleCaptureImage = () => {
        if (gridRef.current) {
            html2canvas(gridRef.current).then((canvas) => {
                canvas.toBlob((blob) => {
                    saveAs(blob, 'Assigned mode.png');
                });
            });
        }
    };
    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };
    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
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

    //Delete model
    const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
    // const handleClickOpenalert = () => {
    //     if (selectedRows.length === 0) {
    //         setIsDeleteOpenalert(true);
    //     } else {
    //         setIsDeleteOpencheckbox(true);
    //     }
    // };

    const handleClickOpenalert = () => {
        if (selectedRows.length === 0) {
            setIsDeleteOpenalert(true);
        } else {
            overallBulkdelete(selectedRows);
        }


    };


    const delInterviewcheckbox = async () => {
        setPageName(!pageName);
        try {
            if (selectedRows?.length > 0) {
                const deletePromises = selectedRows?.map((item) => {
                    return axios.delete(`${SERVICE.MANAGEASSIGNED_SINGLE}/${item}`, {
                        headers: {
                            Authorization: `Bearer ${auth.APIToken}`,
                        },
                    });
                });

                // Wait for all delete requests to complete
                await Promise.all(deletePromises);

                await fetchEmployee();
                handleCloseMod();
                setPopupContent("Deleted Successfully");
                setPopupSeverity("success");
                handleClickOpenPopup();
            }
            handleCloseModcheckbox();
            setSelectedRows([]);
            setSelectAllChecked(false);
            setPage(1);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };



    const [selectedRowsCount, setSelectedRowsCount] = useState(0);

    const overallBulkdelete = async (ids) => {
        setPageName(!pageName);
        try {
            let overallcheck = await axios.post(
                `${SERVICE.MANAGEASSIGNEDMODE_OVERALL_BULKDELETE}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                    id: ids,
                }
            );

            setSelectedRows(overallcheck?.data?.result);
            setSelectedRowsCount(overallcheck?.data?.count)
            setIsDeleteOpencheckbox(true);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
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
    const [anchorEl, setAnchorEl] = useState(null)
    const handleOpenManageColumns = (event) => {
        setAnchorEl(event.currentTarget);
        setManageColumnsOpen(true);
    };
    const handleCloseManageColumns = () => {
        setManageColumnsOpen(false);
        setSearchQueryManage("")
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const getRowClassName = (params) => {
        if ((selectedRows).includes(params.row.id)) {
            return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
        }
        return ''; // Return an empty string for other rows
    };
    // Show All Columns & Manage Columns 
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        manageassignedname: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
    // page refersh reload code
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ''; // This is required for Chrome support
    };

    const [deleteSource, setDeleteSource] = useState("");
    const [checkUser, setCheckUser] = useState();

    const rowData = async (id, name) => {
        setPageName(!pageName)
        try {

            const [res, resuser] = await Promise.all([
                axios.get(`${SERVICE.MANAGEASSIGNED_SINGLE}/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    }
                }),
                axios.post(SERVICE.MANAGEASSIGNEDMODE_OVERALL, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                    oldname: String(name),
                })
            ])

            setDeleteSource(res?.data?.manageassignedmode);
            setCheckUser(resuser?.data?.count);

            if (resuser?.data?.count > 0) {
                setPopupContentMalert(
                    <span style={{ fontWeight: "700", color: "#777" }}>
                        {`${name}`}
                        <span style={{ fontWeight: "bold", color: "black" }}> was linked</span>
                    </span>
                );
                setPopupSeverityMalert("info");
                handleClickOpenPopupMalert();
            } else {
                handleClickOpen();
            }

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    // Alert delete popup
    let Sourcesid = deleteSource?._id;
    const delSource = async (e) => {
        setPageName(!pageName)
        try {
            if (Sourcesid) {
                await axios.delete(`${SERVICE.MANAGEASSIGNED_SINGLE}/${Sourcesid}`, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    }
                });
                await fetchEmployee();
                handleCloseMod();
                setSelectedRows([]);
                setPage(1)
            }
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const delSourcecheckbox = async () => {
        setPageName(!pageName)
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.MANAGEASSIGNED_SINGLE}/${item}`, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    }
                });
            });
            // Wait for all delete requests to complete
            await Promise.all(deletePromises);
            handleCloseModcheckbox();
            setSelectedRows([]);
            setSelectAllChecked(false);
            setPage(1);
            await fetchEmployee();
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    //add function 
    const sendRequest = async () => {
        setIsActive(true)
        setPageName(!pageName)
        try {
            let subprojectscreate = await axios.post(SERVICE.MANAGEASSIGNED_CREATE, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                manageassignedname: String(manageassignedmode.manageassignedname),
                addedby: [
                    {
                        name: String(username),
                        date: String(new Date()),
                    },
                ],
            })
            await fetchEmployee();
            setIsActive(false)
            setManageAssignedMode({ manageassignedname: "" })
            setPopupContent("Added Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            setIsActive(false)
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    //submit option for saving
    const handleSubmit = (e) => {
        e.preventDefault();
        const isNameMatch = assignedByArray.some(item => item.manageassignedname.toLowerCase() == manageassignedmode.manageassignedname.toLowerCase());
        if (manageassignedmode.manageassignedname === "") {
            setPopupContentMalert("Please Enter Name");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {
            setPopupContentMalert("Data Already Exists!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            sendRequest();
        }
    }
    const handleClear = (e) => {
        e.preventDefault();
        setManageAssignedMode({ manageassignedname: "" })
        setPageSize(10)
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    }
    //Edit model...
    const [isEditOpen, setIsEditOpen] = useState(false);
    const handleClickOpenEdit = () => {
        setIsEditOpen(true);
    };
    const handleCloseModEdit = (e, reason) => {
        if (reason && reason === "backdropClick")
            return;
        setIsEditOpen(false);
    };
    // info model
    const [openInfo, setOpeninfo] = useState(false);
    const handleClickOpeninfo = () => {
        setOpeninfo(true);
    };
    const handleCloseinfo = () => {
        setOpeninfo(false);
    };

    const [ovProj, setOvProj] = useState("");
    const [ovProjCount, setOvProjCount] = useState("");
    const [getOverAllCount, setGetOverallCount] = useState("");

    //get single row to edit....
    const getCode = async (e, name) => {
        setManageId(e)
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.MANAGEASSIGNED_SINGLE}/${e}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setManageAssignedByEdit(res?.data?.manageassignedmode);
            setOvProj(name);
            await getOverallEditSection(name);
            await fetchSourceAll(e);
            handleClickOpenEdit();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    // get single row to view....
    const getviewCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.MANAGEASSIGNED_SINGLE}/${e}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setManageAssignedByEdit(res?.data?.manageassignedmode);
            handleClickOpenview();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    // get single row to view....
    const getinfoCode = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.MANAGEASSIGNED_SINGLE}/${e}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setManageAssignedByEdit(res?.data?.manageassignedmode);
            handleClickOpeninfo();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    //Project updateby edit page...
    let updateby = manageAssignedByEdit?.updatedby;
    let addedby = manageAssignedByEdit?.addedby;
    let subprojectsid = manageAssignedByEdit?._id;
    //editing the single data...
    const sendEditRequest = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.put(`${SERVICE.MANAGEASSIGNED_SINGLE}/${subprojectsid}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                manageassignedname: String(manageAssignedByEdit.manageassignedname),
                updatedby: [
                    ...updateby,
                    {
                        name: String(username),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchEmployee();
            await getOverallEditSectionUpdate();

            handleCloseModEdit();
            setPopupContent("Updated Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    const editSubmit = async (e) => {
        e.preventDefault();

        const isNameMatch = duplicateAssignedby.some(item => item.manageassignedname.toLowerCase() == manageAssignedByEdit.manageassignedname.toLowerCase());
        if (manageAssignedByEdit.manageassignedname === "") {
            setPopupContentMalert("Please Enter Name");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {
            setPopupContentMalert("Data Already Exists!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (manageAssignedByEdit.manageassignedname != ovProj && ovProjCount > 0) {

            setShowAlertpop(getOverAllCount);
            handleClickOpenerrpop();
        }
        else {
            sendEditRequest();
        }
    }


    //overall edit section for all pages
    const getOverallEditSection = async (e) => {
        setPageName(!pageName)
        try {
            let res = await axios.post(SERVICE.MANAGEASSIGNEDMODE_OVERALL, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                oldname: e,
            });

            setOvProjCount(res?.data?.count);
            setGetOverallCount(<span style={{ fontWeight: "700", color: "#777" }}>
                <span style={{ fontWeight: "bold", color: "black" }}> The </span>
                {`${e}`}
                <span style={{ fontWeight: "bold", color: "black" }}> is linked  whether you want to do changes ..??</span>
            </span>);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //overall edit section for all pages
    const getOverallEditSectionUpdate = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.post(SERVICE.MANAGEASSIGNEDMODE_OVERALL, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                oldname: ovProj,
            });
            sendEditRequestOverall(res?.data?.manageothertask);

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const sendEditRequestOverall = async (manageothertask) => {
        setPageName(!pageName)
        try {
            if (manageothertask?.length > 0) {
                let answ = manageothertask.map((d, i) => {
                    let res = axios.put(`${SERVICE.MANAGEOTHERTASK_SINGLE}/${d._id}`, {
                        headers: {
                            Authorization: `Bearer ${auth.APIToken}`,
                        },
                        assignedmode: String(manageAssignedByEdit.manageassignedname),
                    });
                });
            }

            setPopupContent("Updated Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const [assignedmodeArray, setAssignedmodeArray] = useState([])
    let exportColumnNames = ["Name"];
    let exportRowValues = ["manageassignedname"];
    //get all Sub vendormasters.
    const fetchManageAssignedMode = async () => {
        setPageName(!pageName)
        try {
            let res_vendor = await axios.get(SERVICE.MANAGEASSIGNEDMODE, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setAssignedmodeArray(res_vendor?.data?.manageassignedmode?.map((t, index) => ({
                ...t,
                Sno: index + 1,
                manageassignedname: t.manageassignedname,
            })))
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    useEffect(() => {
        fetchManageAssignedMode()
    }, [isFilterOpen])
    const [taskcategorys, setTaskcategorys] = useState([]);
    const fetchEmployee = async () => {
        setPageName(!pageName)
        try {
            let res_employee = await axios.get(SERVICE.MANAGEASSIGNEDMODE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },

            });

            const ans = res_employee?.data?.manageassignedmode?.length > 0 ? res_employee?.data?.manageassignedmode : []
            const itemsWithSerialNumber = ans?.map((item, index) => ({
                ...item,
                serialNumber: (page - 1) * pageSize + index + 1,
                // serialNumber: index + 1,
            }));
            //   setcheckemployeelist(true);
            setManageAssignedby(itemsWithSerialNumber);
            setAssignebyArray(itemsWithSerialNumber)

            setTaskcategorys(itemsWithSerialNumber);
            setSourcecheck(true)
        } catch (err) {
            setSourcecheck(true)
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    useEffect(() => {
        fetchEmployee();
    }, []);

    const [duplicateAssignedby, setDuplicateAssignedby] = useState([])

    //get all Sub vendormasters.
    const fetchSourceAll = async (e) => {
        setPageName(!pageName)
        try {
            let res_meet = await axios.get(SERVICE.MANAGEASSIGNEDMODE, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setDuplicateAssignedby(res_meet?.data?.manageassignedmode.filter(item => item._id !== e))
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Assigned mode',
        pageStyle: 'print'
    });


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
            pagename: String("Assignedmode"),
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
        fetchEmployee();
    }, [])

    useEffect(
        () => {
            const beforeUnloadHandler = (event) => handleBeforeUnload(event);
            window.addEventListener('beforeunload', beforeUnloadHandler);
            return () => {
                window.removeEventListener('beforeunload', beforeUnloadHandler);
            };
        }, []);
    const [items, setItems] = useState([]);
    const addSerialNumber = () => {
        const itemsWithSerialNumber = manageAssigned?.map((item, index) => ({ ...item, serialNumber: index + 1 }));
        setItems(itemsWithSerialNumber);
    }
    useEffect(() => {
        addSerialNumber();
    }, [manageAssigned])
    //Datatable
    const handlePageChange = (newPage) => {
        setPage(newPage);
        setSelectedRows([]);
        setSelectAllChecked(false)
    };
    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setSelectedRows([]);
        setSelectAllChecked(false)
        setPage(1);
    };
    //datatable....
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    const searchTerms = searchQuery.toLowerCase().split(" ");
    const filteredDatas = taskcategorys?.filter((item) => {
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
            <Checkbox
                checked={selectAllChecked}
                onChange={onSelectAll}
            />
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
            width: 90,
            hide: !columnVisibility.checkbox,
            headerClassName: "bold-header"
        },
        {
            field: "serialNumber", headerName: "SNo",
            flex: 0, width: 100, hide: !columnVisibility.serialNumber, headerClassName: "bold-header"
        },
        { field: "manageassignedname", headerName: "Name", flex: 0, width: 250, hide: !columnVisibility.manageassignedname, headerClassName: "bold-header" },
        {
            field: "actions",
            headerName: "Action",
            flex: 0,
            width: 250,
            minHeight: '40px !important',
            sortable: false,
            hide: !columnVisibility.actions,
            headerClassName: "bold-header",
            renderCell: (params) => (
                <Grid sx={{ display: 'flex' }}>
                    {isUserRoleCompare?.includes("eassignedmode") && (
                        <Button sx={userStyle.buttonedit} onClick={() => {

                            getCode(params.row.id, params.row.manageassignedname);
                        }}>
                            <EditOutlinedIcon sx={buttonStyles.buttonedit} />                            </Button>
                    )}
                    {isUserRoleCompare?.includes("dassignedmode") && (
                        <Button sx={userStyle.buttondelete} onClick={(e) => {
                            rowData(params.row.id, params.row.manageassignedname)
                        }}>
                            <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />                            </Button>
                    )}
                    {isUserRoleCompare?.includes("vassignedmode") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {

                                getviewCode(params.row.id);
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />                        </Button>
                    )}
                    {isUserRoleCompare?.includes("iassignedmode") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {

                                getinfoCode(params.row.id);
                            }}
                        >
                            <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />                        </Button>
                    )}
                </Grid>
            ),
        },
    ]
    const rowDataTable = filteredData.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            manageassignedname: item.manageassignedname,
        }
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
        <Box style={{ padding: "10px", minWidth: "325px", '& .MuiDialogContent-root': { padding: '10px 0' } }} >
            <Typography variant="h6">Manage Columns</Typography>
            <IconButton
                aria-label="close"
                onClick={handleCloseManageColumns}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <Box sx={{ position: 'relative', margin: '10px' }}>
                <TextField
                    label="Find column"
                    variant="standard"
                    fullWidth
                    value={searchQueryManage}
                    onChange={(e) => setSearchQueryManage(e.target.value)}
                    sx={{ marginBottom: 5, position: 'absolute', }}
                />
            </Box><br /><br />
            <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
                <List sx={{ overflow: 'auto', height: '100%', }}>
                    {filteredColumns.map((column) => (
                        <ListItem key={column.field}>
                            <ListItemText sx={{ display: 'flex' }}
                                primary={
                                    <Switch sx={{ marginTop: "-5px" }} size="small"
                                        checked={columnVisibility[column.field]}
                                        onChange={() => toggleColumnVisibility(column.field)}
                                    />
                                }
                                secondary={(column.field === "checkbox") ? "Checkbox" : column.headerName}
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
                            sx={{ textTransform: 'none', }}
                            onClick={() => setColumnVisibility(initialColumnVisibility)}
                        >
                            Show All
                        </Button>
                    </Grid>
                    <Grid item md={4}></Grid>
                    <Grid item md={4}>
                        <Button
                            variant="text"
                            sx={{ textTransform: 'none' }}
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
    const [fileFormat, setFormat] = useState('')
    return (
        <Box>
            <Headtitle title={'Assigned Mode'} />
            {/* ****** Header Content ****** */}
            {/* <Typography sx={userStyle.HeaderText}>Assigned Mode</Typography> */}
            <PageHeading
                title="Assigned Mode"
                modulename="Other Tasks"
                submodulename="Assigned Mode"
                mainpagename=""
                subpagename=""
                subsubpagename=""
            />

            {isUserRoleCompare?.includes("aassignedmode")
                && (
                    <>
                        <Box sx={userStyle.dialogbox}>
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <Typography sx={userStyle.importheadtext}>Add Assigned Mode</Typography>
                                    </Grid>
                                </Grid><br />
                                <Grid container spacing={2}>
                                    <Grid item md={4} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Name <b style={{ color: "red" }}>*</b></Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                placeholder="Please Enter Name"
                                                value={manageassignedmode.manageassignedname}
                                                onChange={(e) => {
                                                    setManageAssignedMode({ ...manageassignedmode, manageassignedname: e.target.value });
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={1} xs={6} sm={3} sx={{ marginTop: "25px" }}>
                                        <Button sx={buttonStyles.buttonsubmit} onClick={handleSubmit} disabled={isActive}>Submit</Button>
                                    </Grid>
                                    <Grid item md={1} xs={6} sm={3}>
                                        <Button sx={{ ...buttonStyles.btncancel, marginTop: "25px" }}
                                            onClick={handleClear}>Clear</Button>
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
                    // maxWidth="sm"
                    sx={{
                        overflow: 'visible',
                        '& .MuiPaper-root': {
                            overflow: 'visible',
                        },
                    }}
                >
                    <Box sx={{ padding: '20px' }}>
                        <>
                            <form onSubmit={editSubmit}>
                                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                                <Grid container spacing={2}>
                                    <Grid item md={12} xs={12} sm={12}>
                                        <Typography sx={userStyle.HeaderText}>Edit Assigned Mode</Typography>
                                    </Grid>
                                </Grid><br />
                                <Grid container spacing={2}>
                                    <Grid item md={10} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Name <b style={{ color: "red" }}>*</b></Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                placeholder="Please Enter Name"
                                                value={manageAssignedByEdit.manageassignedname}
                                                onChange={(e) => {
                                                    setManageAssignedByEdit({ ...manageAssignedByEdit, manageassignedname: e.target.value });
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <br />
                                <br />
                                <Grid container spacing={2}>
                                    <Grid item md={6} xs={6} sm={6}>
                                        <Button sx={buttonStyles.buttonsubmit} type="submit" >Update</Button>
                                    </Grid>
                                    <Grid item md={6} xs={6} sm={6}>
                                        <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit} >Cancel</Button>
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
            {isUserRoleCompare?.includes("lassignedmode") && (
                <>
                    <Box sx={userStyle.container}>
                        { /* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Assigned Mode List</Typography>
                        </Grid>
                        <br />
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label >Show entries:</label>
                                    <Select id="pageSizeSelect" value={pageSize}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 180,
                                                    width: 80,
                                                },
                                            },
                                        }}
                                        onChange={handlePageSizeChange} sx={{ width: "77px" }}>
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                        <MenuItem value={100}>100</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box >
                                    {isUserRoleCompare?.includes("excelassignedmode") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                fetchManageAssignedMode()
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvassignedmode") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                fetchManageAssignedMode()
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printassignedmode") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>&ensp;<FaPrint />&ensp;Print&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfassignedmode") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)
                                                    fetchManageAssignedMode()
                                                }}
                                            ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imageassignedmode") && (
                                        <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}> <ImageIcon sx={{ fontSize: "15px" }} />  &ensp;Image&ensp; </Button>
                                    )}
                                </Box >
                            </Grid>
                            <Grid item md={2} xs={6} sm={6}>
                                <Box>
                                    <FormControl fullWidth size="small" >
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
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>Show All Columns</Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>Manage Columns</Button>&ensp;
                        {isUserRoleCompare?.includes("bdassignedmode") && (
                            <Button sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert} >Bulk Delete</Button>)}
                        <br /><br />
                        {!sourceCheck ?
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                            :
                            <>
                                <Box
                                    style={{
                                        width: '100%',
                                        overflowY: 'hidden', // Hide the y-axis scrollbar
                                    }} ref={gridRef}
                                >
                                    <StyledDataGrid
                                        onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
                                        rows={rowsWithCheckboxes}
                                        columns={columnDataTable.filter((column) => columnVisibility[column.field])}
                                        onSelectionModelChange={handleSelectionChange}
                                        selectionModel={selectedRows}
                                        autoHeight={true}
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
                                </Box>
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
                            </>}
                    </Box>
                </>
            )
            }
            {/* Manage Column */}
            <Popover
                id={id}
                open={isManageColumnsOpen}
                anchorEl={anchorEl}
                onClose={handleCloseManageColumns}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {manageColumnsContent}
            </Popover>
            {/* view model */}
            <Dialog
                open={openview}
                onClose={handleClickOpenview}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="lg"
            >
                <Box sx={{ width: "450px", padding: '20px 50px' }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Assigned Mode</Typography>
                        <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={12} xs={12} sm={12} >
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Name</Typography>
                                    <Typography>{manageAssignedByEdit.manageassignedname}</Typography>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <br /> <br />  <br />
                        <Grid container spacing={2}>
                            <Button sx={buttonStyles.btncancel} onClick={handleCloseview}> Back </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>

            {/* <Box>
                <Dialog
                    open={isDeleteOpencheckbox}
                    onClose={handleCloseModcheckbox}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent
                        sx={{
                            width: "350px",
                            textAlign: "center",
                            alignItems: "center",
                        }}
                    >
                        <ErrorOutlineOutlinedIcon
                            sx={{ fontSize: "80px", color: "orange" }}
                        />
                        <Typography
                            variant="h5"
                            sx={{ color: "red", textAlign: "center" }}
                        >
                            {selectedRows?.length === 0 ? (
                                <>
                                    The Datas in the selected rows are already used in some
                                    pages, you can't delete.
                                </>
                            ) : (
                                <>
                                    Are you sure? Only {selectedRows?.length} datas can be
                                    deleted remaining are used in some pages.
                                </>
                            )}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleCloseModcheckbox}
                            sx={buttonStyles.btncancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            autoFocus
                            sx={buttonStyles.buttonsubmit}
                            onClick={(e) => delInterviewcheckbox(e)}
                        >
                            {" "}
                            OK{" "}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box> */}
            <Box>
                <Dialog
                    open={isDeleteOpencheckbox}
                    onClose={handleCloseModcheckbox}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} />
                        {selectedRowsCount > 0 ?
                            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>Some of the Data's are Linked in other pages. Do You want to Delete the Remaining.?</Typography>
                            :
                            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>This Data is Linked in Some pages</Typography>

                        }
                    </DialogContent>
                    <DialogActions>
                        {selectedRowsCount > 0 ?
                            <>
                                <Button onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>Cancel</Button>
                                <Button sx={buttonStyles.buttonsubmit}
                                    onClick={(e) => delInterviewcheckbox(e)}
                                > OK </Button>
                            </>
                            :
                            <Button sx={buttonStyles.buttonsubmit} onClick={handleCloseModcheckbox} >Ok</Button>
                        }
                    </DialogActions>
                </Dialog>

            </Box>

            {/* ALERT DIALOG  for the Overall delete*/}
            <Box>
                <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent>
                        <DialogContentText
                            id="alert-dialog-description"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "20px",
                                width: "350px"
                            }}
                        >
                            <InfoOutlinedIcon style={{ fontSize: "3.5rem", color: "teal" }} />              <Typography
                                sx={{ fontSize: "1.4rem", fontWeight: "600", color: "black", textAlign: "center" }}
                            >
                                {showAlertpop}
                            </Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {isLoading ? (
                            <>
                                <Backdrop sx={{ color: "blue", zIndex: (theme) => theme.zIndex.drawer + 2 }} open={isLoading}>
                                    <CircularProgress color="inherit" />
                                </Backdrop>
                            </>
                        ) : (
                            <>
                                <Grid>
                                    <Button
                                        variant="contained"
                                        style={{
                                            padding: "7px 13px",
                                            color: "white",
                                            background: "rgb(25, 118, 210)",
                                            ...buttonStyles.buttonsubmit
                                        }}
                                        onClick={() => {
                                            sendEditRequest();
                                            handleCloseerrpop();
                                        }}
                                    >
                                        ok
                                    </Button>
                                </Grid>
                            </>
                        )}
                        &nbsp;
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
                                ...buttonStyles.btncancel
                            }}
                            onClick={handleCloseerrpop}
                        >
                            Cancel
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
                filteredDataTwo={filteredDatas ?? []}
                itemsTwo={assignedmodeArray ?? []}
                filename={"Assigned mode"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="Assigned mode Info"
                addedby={addedby}
                updateby={updateby}
            />
            <DeleteConfirmation
                open={isDeleteOpen}
                onClose={handleCloseMod}
                onConfirm={delSource}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
            {/* <DeleteConfirmation
                open={isDeleteOpencheckbox}
                onClose={handleCloseModcheckbox}
                onConfirm={delSourcecheckbox}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            /> */}
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
export default Manageassignedmode;