import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Popover, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextareaAutosize, Tooltip, Typography } from "@mui/material";
import MuiInput from "@mui/material/Input";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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
import { v4 as uuidv4 } from "uuid";
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

function UserDocumentUploadFilter() {

    const gridRefTableApplyLeave = useRef(null);
    const gridRefImageApplyLeave = useRef(null);

    const [userDocumentEdit, setUserdocumentEdit] = useState([]);
    const [userDocuments, setUserdocuments] = useState([]);
    const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, allTeam, pageName, setPageName, buttonStyles, allUsersData, allUsersLimit } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);

    const [userCheck, setUsercheck] = useState(false);
    const [btnSubmit, setBtnSubmit] = useState(false);

    // State to track advanced filter
    const [advancedFilter, setAdvancedFilter] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);
    const [filteredDataItems, setFilteredDataItems] = useState(userDocuments);
    const [filteredRowData, setFilteredRowData] = useState([]);

    const [selectedRows, setSelectedRows] = useState([]);

    // File Upload condition starting

    const [upload, setUpload] = useState([]);
    const [uploadEdit, setUploadEdit] = useState([]);

    const renderFilePreview = async (file) => {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        window.open(link, "_blank");
    };
    const handleFileDelete = (index) => {
        setUpload((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

    // Error Popup model
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState();
    const handleClickOpenerr = () => { setIsErrorOpen(true); };
    const handleCloseerr = () => {
        setIsErrorOpen(false);
        setBtnSubmit(false);
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
            pagename: String("User Document Upload Filter"),
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

    // Pre select dropdowns
    useEffect(() => {
        // Remove duplicates based on the 'company' field
        const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
            const x = acc.find((item) => item.company === current.company && item.branch === current.branch && item.unit === current.unit);
            if (!x) {
                acc.push(current);
            }
            return acc;
        }, []);

        const company = [...new Set(uniqueIsAssignBranch.map((data) => data.company))].map((data) => ({
            label: data,
            value: data,
        }));
        setSelectedCompany(company);
        setValueCompany(
            company.map((a, index) => {
                return a.value;
            })
        );
        const branch = uniqueIsAssignBranch
            ?.filter((val) => company?.map((comp) => comp.value === val.company))
            ?.map((data) => ({
                label: data.branch,
                value: data.branch,
            }))
            .filter((item, index, self) => {
                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
            });
        setSelectedBranch(branch);
        setValueBranch(
            branch.map((a, index) => {
                return a.value;
            })
        );
        const unit = uniqueIsAssignBranch
            ?.filter((val) => company?.map((comp) => comp.value === val.company) && branch?.map((comp) => comp.value === val.branch))
            ?.map((data) => ({
                label: data.unit,
                value: data.unit,
            }))
            .filter((item, index, self) => {
                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
            });
        setSelectedUnit(unit);
        setValueUnit(
            unit.map((a, index) => {
                return a.value;
            })
        );
        // Create team options based on selected company, branch, and unit
        const team = allTeam
            ?.filter((val) => company.some((comp) => comp.value === val.company) && branch.some((br) => br.value === val.branch) && unit.some((uni) => uni.value === val.unit))
            .map((data) => ({
                label: data.teamname,
                value: data.teamname,
            }));
        setSelectedTeam(team);
        setValueTeam(team.map((a) => a.value));
        const allemployees = allUsersLimit
            ?.filter((val) => company.some((comp) => comp.value === val.company) && branch.some((br) => br.value === val.branch) && unit.some((uni) => uni.value === val.unit) && team.some((team) => team.value === val.team))
            .map((data) => ({
                label: data.companyname,
                value: data.companyname,
            }));
        setSelectedEmp(allemployees);
        setValueEmp(allemployees.map((a) => a.value));
    }, [isAssignBranch]);

    // Show All Columns & Manage Columns
    const initialColumnVisibilityApplyLeave = {
        serialNumber: true,
        checkbox: true,
        company: true,
        branch: true,
        unit: true,
        team: true,
        employeename: true,
        date: true,
        createdAt: true,
        actions: true,
        document: true,
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
            let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setDeleteApply(res?.data?.suserdocumentupload);
            handleClickOpen();
        } catch (err) {

            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    // Alert delete popup
    let Applysid = deleteApply?._id;
    const delApply = async () => {
        setPageName(!pageName)
        try {
            if (Applysid) {
                await axios.delete(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${Applysid}`, {
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
                return axios.delete(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${item}`, {
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


    // List Filter functionality

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;

    const [filterUser, setFilterUser] = useState({
        filtertype: 'Individual', date: "", fromdate: today,
        todate: today,
        day: "Today"
    });

    const daysoptions = [
        { label: "Yesterday", value: "Yesterday" },
        { label: "Last Week", value: "Last Week" },
        { label: "Last Month", value: "Last Month" },
        { label: "Today", value: "Today" },
        { label: "This Week", value: "This Week" },
        { label: "This Month", value: "This Month" },
        { label: "Custom Fields", value: "Custom Fields" },
    ]


    const handleChangeFilterDate = (e) => {
        let fromDate = '';
        let toDate = moment().format('YYYY-MM-DD');
        switch (e.value) {
            case 'Today':
                setFilterUser((prev) => ({ ...prev, fromdate: toDate, todate: toDate }))
                break;
            case 'Yesterday':
                fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                toDate = fromDate; // Yesterday’s date
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'Last Week':
                fromDate = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
                toDate = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'This Week':
                fromDate = moment().startOf('week').format('YYYY-MM-DD');
                toDate = moment().endOf('week').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'Last Month':
                fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
                toDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'This Month':
                fromDate = moment().startOf('month').format('YYYY-MM-DD');
                toDate = moment().endOf('month').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'Custom Fields':
                setFilterUser((prev) => ({ ...prev, fromdate: "", todate: "" }))
                break;
            default:
                return;
        }
    }

    const [selectedCompany, setSelectedCompany] = useState([]);
    const [valueCompany, setValueCompany] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState([]);
    const [valueBranch, setValueBranch] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState([]);
    const [valueUnit, setValueUnit] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState([]);
    const [valueTeam, setValueTeam] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState([]);
    const [valueEmp, setValueEmp] = useState([]);

    //company multiselect
    const handleCompanyChangeFilter = (options) => {
        setValueCompany(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedCompany(options);
        setSelectedBranch([]);
        setValueBranch([]);
        setSelectedUnit([]);
        setValueUnit([]);
        setSelectedTeam([]);
        setValueTeam([]);
        setSelectedEmp([]);
        setValueEmp([]);
    };

    const customValueRendererCompanyFilter = (valueCompany, _categoryname) => {
        return valueCompany?.length ? valueCompany.map(({ label }) => label)?.join(', ') : 'Please Select Company';
    };

    //branchto multiselect dropdown changes
    const handleBranchChangeFilter = (options) => {
        setSelectedBranch(options);
        setValueBranch(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedUnit([]);
        setValueUnit([]);
        setSelectedTeam([]);
        setValueTeam([]);
        setSelectedEmp([]);
        setValueEmp([]);
    };

    const customValueRendererBranchFilter = (valueCate, _employeename) => {
        return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Branch';
    };

    // unitto multiselect dropdown changes
    const handleUnitChangeFilter = (options) => {
        setSelectedUnit(options);
        setValueUnit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedTeam([]);
        setValueTeam([]);
        setSelectedEmp([]);
        setValueEmp([]);
    };
    const customValueRendererUnitFilter = (valueCate, _employeename) => {
        return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Unit';
    };

    //Teamto multiselect dropdown changes
    const handleTeamChangeFilter = (options) => {
        setSelectedTeam(options);
        setValueTeam(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedEmp([]);
    };
    const customValueRendererTeamFilter = (valueCate, _employeename) => {
        return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Team';
    };

    // Employee
    const handleEmployeeChangeFilter = (options) => {
        setSelectedEmp(options);
        setValueEmp(
            options.map((a, index) => {
                return a.value;
            })
        );
    };
    const customValueRendererEmpFilter = (valueCate, _employees) => {
        return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Employee';
    };


    const handleSubmitFilter = (e) => {
        e.preventDefault();
        if (filterUser.filtertype === 'Please Select Filter Type' || filterUser.filtertype === '' || filterUser.filtertype === undefined) {
            setPopupContentMalert('Please Select Filter Type for Employee Names');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (selectedCompany?.length === 0) {
            setPopupContentMalert('Please Select Company');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (['Individual', 'Team', 'Branch', 'Unit']?.includes(filterUser.filtertype) && selectedBranch.length === 0) {
            setPopupContentMalert('Please Select Branch');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (['Individual', 'Team', 'Unit']?.includes(filterUser.filtertype) && selectedUnit.length === 0) {
            setPopupContentMalert('Please Select Unit');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (['Individual', 'Team']?.includes(filterUser.filtertype) && selectedTeam.length === 0) {
            setPopupContentMalert('Please Select Team');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (['Individual']?.includes(filterUser.filtertype) && selectedEmp.length === 0) {
            setPopupContentMalert('Please Select Employee Names');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }

        else if (filterUser.day === "Custom Fields" && filterUser.fromdate === "") {
            setPopupContentMalert("Please Select From Date");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else if (filterUser.day === "Custom Fields" && filterUser.todate === "") {
            setPopupContentMalert("Please Select To Date");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            fetchApplyleave();
        }
    };

    const handleClearFilter = async (e) => {
        e.preventDefault();
        setUpload([])
        setFilteredDataItems([]);
        setFilterUser({
            filtertype: 'Individual', fromdate: today,
            todate: today,
            day: "Today"
        });
        setSelectedCompany([]);
        setSelectedBranch([]);
        setSelectedUnit([]);
        setSelectedTeam([]);
        setSelectedEmp([]);
        setValueCompany([]);
        setValueBranch([]);
        setValueUnit([]);
        setValueTeam([]);
        setValueEmp([]);
        setPageApplyLeave(1);
        setPopupContent('Cleared Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
    };


    // info model
    const [openInfo, setOpeninfo] = useState(false);
    const handleClickOpeninfo = () => { setOpeninfo(true); };
    const handleCloseinfo = () => { setOpeninfo(false); };



    const [oldfileNamesBill, setoldfileNamesBill] = useState([]);

    const getMultipleFilesAsObjects = async (filenames, type, uniqueId) => {
        const files = [];

        for (const name of filenames) {
            const res = await axios.post(
                SERVICE.USERDOCUMENTS_EDIT_FETCH,
                { filename: `${uniqueId}$${type}$${name}` },
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                    responseType: "blob",
                }
            );

            const blob = res.data;
            const file = new File([blob], name, { type: blob.type });
            files.push(file);
        }

        return files;
    };

    const [getimgbillcode, setGetImgbillcode] = useState([]);

    const handleFetchBill = (data, remarks) => {
        const files = Array.from(data); // Ensure it's an array

        const fileReaders = [];
        const newSelectedFiles = [];

        // imageFiles.forEach((file) => {
        files.forEach((file) => {
            const reader = new FileReader();

            const readerPromise = new Promise((resolve) => {
                reader.onload = () => {
                    const fileData = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        preview: reader.result,
                    };
                    newSelectedFiles.push(fileData);
                    resolve(file);
                };
            });

            reader.readAsDataURL(file);
            fileReaders.push(readerPromise);


        });

        Promise.all(fileReaders).then((originalFiles) => {
            setUploadEdit(newSelectedFiles);
            setGetImgbillcode(newSelectedFiles);

        });
    };



    //Project updateby edit page...
    let updateby = userDocumentEdit?.updatedby;
    let addedby = userDocumentEdit?.addedby;
    let subprojectsid = userDocumentEdit?._id;

    //get all Sub vendormasters.
    const fetchApplyleave = async () => {
        setPageName(!pageName);
        setUsercheck(true);
        try {
            let res_vendor = await axios.post(SERVICE.USERDOCUMENTUPLOAD_LIST_FILTER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                type: filterUser.filtertype,
                company: [...valueCompany],
                branch: [...valueBranch],
                unit: [...valueUnit],
                team: [...valueTeam],
                employee: [...valueEmp],
                fromdate: filterUser.fromdate,
                todate: filterUser.todate,
                assignbranch: accessbranch,
            });
            let answer = res_vendor?.data?.userdocumentuploads;

            const itemsWithSerialNumber = answer?.map((item, index) => {

                return {
                    ...item,
                    id: item._id,
                    serialNumber: index + 1,
                    company: item.company,
                    branch: item.branch,
                    unit: item.unit,
                    team: item.team,
                    employeename: item.employeename,
                    date: moment(item.date).format('DD-MM-YYYY'),
                    document: item.files,
                };
            });
            setUserdocuments(itemsWithSerialNumber);
            setFilteredDataItems(itemsWithSerialNumber);
            setTotalPagesApplyLeave(Math.ceil(answer.length / pageSizeApplyLeave));

            setUsercheck(false);
        } catch (err) {
            setUsercheck(true);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };




    //id for login...
    let loginid = localStorage.LoginUserId;
    let authToken = localStorage.APIToken;

    // useEffect(() => {
    //     fetchApplyleave();
    // }, []);


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
        addSerialNumber(userDocuments);
    }, [userDocuments]);

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


    // list view option code
    const [isimgviewbill, setImgviewbill] = useState(false);
    const handleImgcodeviewbill = () => {
        setImgviewbill(true);
    };
    const handlecloseImgcodeviewbill = () => {
        setImgviewbill(false);
    };

    const getDownloadFile = async (id) => {

        let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${id}`, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
        });
        const filesbill = await getMultipleFilesAsObjects(res?.data?.suserdocumentupload?.files, "userdocuments", res?.data?.suserdocumentupload?.uniqueId);
        setoldfileNamesBill(res?.data?.suserdocumentupload?.files.map((d) => `${res?.data?.suserdocumentupload?.uniqueId}$userdocuments$${d}`));

        handleFetchBill(filesbill, res?.data?.suserdocumentupload?.files);

        handleImgcodeviewbill();
    };



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
        //     field: "checkbox",
        //     headerName: "Checkbox", // Default header name
        //     headerStyle: {
        //         fontWeight: "bold", // Apply the font-weight style to make the header text bold
        //         // Add any other CSS styles as needed
        //     },
        //     headerComponent: (params) => (
        //         <CheckboxHeader
        //             selectAllChecked={selectAllChecked}
        //             onSelectAll={() => {
        //                 if (filteredData.length === 0) {
        //                     // Do not allow checking when there are no rows
        //                     return;
        //                 }
        //                 if (selectAllChecked) {
        //                     setSelectedRows([]);
        //                 } else {
        //                     const allRowIds = filteredData.map((row) => row.id);
        //                     setSelectedRows(allRowIds);
        //                 }
        //                 setSelectAllChecked(!selectAllChecked);
        //             }}
        //         />
        //     ),

        //     cellRenderer: (params) => (
        //         <Checkbox
        //             checked={selectedRows.includes(params.data.id)}
        //             onChange={() => {
        //                 let updatedSelectedRows;
        //                 if (selectedRows.includes(params.data.id)) {
        //                     updatedSelectedRows = selectedRows.filter((selectedId) => selectedId !== params.data.id);
        //                 } else {
        //                     updatedSelectedRows = [...selectedRows, params.data.id];
        //                 }

        //                 setSelectedRows(updatedSelectedRows);

        //                 // Update the "Select All" checkbox based on whether all rows are selected
        //                 setSelectAllChecked(updatedSelectedRows.length === filteredData.length);
        //             }}
        //         />
        //     ),
        //     sortable: false, // Optionally, you can make this column not sortable
        //     width: 90,

        //     hide: !columnVisibilityApplyLeave.checkbox,
        //     headerClassName: "bold-header",
        //     lockPinned: true,
        //     pinned: 'left'
        // },
        { field: "serialNumber", headerName: "SNo", flex: 0, width: 80, hide: !columnVisibilityApplyLeave.serialNumber, headerClassName: "bold-header" },
        { field: "company", headerName: "Company", flex: 0, width: 150, hide: !columnVisibilityApplyLeave.company, headerClassName: "bold-header" },
        { field: "branch", headerName: "Branch", flex: 0, width: 150, hide: !columnVisibilityApplyLeave.branch, headerClassName: "bold-header" },
        { field: "unit", headerName: "Unit", flex: 0, width: 150, hide: !columnVisibilityApplyLeave.unit, headerClassName: "bold-header" },
        { field: "team", headerName: "Team", flex: 0, width: 150, hide: !columnVisibilityApplyLeave.team, headerClassName: "bold-header" },
        { field: "employeename", headerName: "Employee Name", flex: 0, width: 250, hide: !columnVisibilityApplyLeave.employeename, headerClassName: "bold-header" },
        { field: "date", headerName: "Date", flex: 0, width: 110, hide: !columnVisibilityApplyLeave.date, headerClassName: "bold-header" },
        {
            field: "document",
            headerName: "Document",
            sortable: false,
            flex: 0,
            width: 180,
            minHeight: "40px",
            hide: !columnVisibilityApplyLeave.document,
            cellRenderer: (params) => (
                <Grid>

                    <Button
                        sx={{
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                                backgroundColor: "#80808036", // theme.palette.primary.main
                            },
                        }}
                        onClick={() => getDownloadFile(params.data.id)}
                    >
                        view
                    </Button>
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
    let exportColumnNamescrt = ["Company", "Branch", "Unit", "Team", "Employee Name", "Date"]
    let exportRowValuescrt = ["company", "branch", "unit", "team", "employeename", "date"]

    // Print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "User Document Upload Filter",
        pageStyle: "print",
    });

    // image
    const handleCaptureImage = () => {
        if (gridRefImageApplyLeave.current) {
            domtoimage.toBlob(gridRefImageApplyLeave.current)
                .then((blob) => {
                    saveAs(blob, "User Document Upload Filter.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    return (
        <Box>
            <Headtitle title={"User Document Upload Filter"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="User Document Upload Filter"
                modulename="Leave&Permission"
                submodulename="Approve Document"
                mainpagename="User Document Upload Filter"
                subpagename=""
                subsubpagename=""
            />
            {isUserRoleCompare?.includes("auserdocumentuploadfilter") && (
                <Box sx={userStyle.selectcontainer}>
                    <Grid container spacing={2}>
                        <Grid item md={3} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    {' '}
                                    Type<b style={{ color: 'red' }}>*</b>{' '}
                                </Typography>
                                <Selects
                                    options={[
                                        { label: 'Individual', value: 'Individual' },
                                        { label: 'Company', value: 'Company' },
                                        { label: 'Branch', value: 'Branch' },
                                        { label: 'Unit', value: 'Unit' },
                                        { label: 'Team', value: 'Team' },
                                    ]}
                                    styles={colourStyles}
                                    value={{ label: filterUser.filtertype, value: filterUser.filtertype }}
                                    onChange={(e) => {
                                        setFilterUser({ ...filterUser, filtertype: e.value });
                                        setSelectedCompany([]);
                                        setValueCompany([]);
                                        setSelectedBranch([]);
                                        setValueBranch([]);
                                        setSelectedUnit([]);
                                        setValueUnit([]);
                                        setSelectedTeam([]);
                                        setValueTeam([]);
                                        setSelectedEmp([]);
                                        setValueEmp([]);
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={3} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Company<b style={{ color: 'red' }}>*</b>
                                </Typography>
                                <MultiSelect
                                    options={accessbranch
                                        ?.map((data) => ({
                                            label: data.company,
                                            value: data.company,
                                        }))
                                        .filter((item, index, self) => {
                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                        })}
                                    value={selectedCompany}
                                    onChange={(e) => {
                                        handleCompanyChangeFilter(e);
                                    }}
                                    valueRenderer={customValueRendererCompanyFilter}
                                    labelledBy="Please Select Company"
                                />
                            </FormControl>
                        </Grid>
                        {['Individual', 'Team']?.includes(filterUser.filtertype) ? (
                            <>
                                {/* Branch Unit Team */}
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            {' '}
                                            Branch<b style={{ color: 'red' }}>*</b>{' '}
                                        </Typography>
                                        <MultiSelect
                                            options={accessbranch
                                                ?.filter((comp) => valueCompany?.includes(comp.company))
                                                ?.map((data) => ({
                                                    label: data.branch,
                                                    value: data.branch,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedBranch}
                                            onChange={handleBranchChangeFilter}
                                            valueRenderer={customValueRendererBranchFilter}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            {' '}
                                            Unit<b style={{ color: 'red' }}>*</b>
                                        </Typography>
                                        <MultiSelect
                                            options={accessbranch
                                                ?.filter((comp) => valueCompany?.includes(comp.company) && valueBranch?.includes(comp.branch))
                                                ?.map((data) => ({
                                                    label: data.unit,
                                                    value: data.unit,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedUnit}
                                            onChange={handleUnitChangeFilter}
                                            valueRenderer={customValueRendererUnitFilter}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            {' '}
                                            Team<b style={{ color: 'red' }}>*</b>
                                        </Typography>
                                        <MultiSelect
                                            options={allTeam
                                                ?.filter((u) => valueCompany?.includes(u.company) && valueBranch?.includes(u.branch) && valueUnit?.includes(u.unit))
                                                .map((u) => ({
                                                    ...u,
                                                    label: u.teamname,
                                                    value: u.teamname,
                                                }))}
                                            value={selectedTeam}
                                            onChange={handleTeamChangeFilter}
                                            valueRenderer={customValueRendererTeamFilter}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                            </>
                        ) : ['Branch']?.includes(filterUser.filtertype) ? (
                            <>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            {' '}
                                            Branch<b style={{ color: 'red' }}>*</b>
                                        </Typography>
                                        <MultiSelect
                                            options={accessbranch
                                                ?.filter((comp) => valueCompany?.includes(comp.company))
                                                ?.map((data) => ({
                                                    label: data.branch,
                                                    value: data.branch,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedBranch}
                                            onChange={handleBranchChangeFilter}
                                            valueRenderer={customValueRendererBranchFilter}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                            </>
                        ) : ['Unit']?.includes(filterUser.filtertype) ? (
                            <>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            {' '}
                                            Branch<b style={{ color: 'red' }}>*</b>
                                        </Typography>
                                        <MultiSelect
                                            options={accessbranch
                                                ?.filter((comp) => valueCompany?.includes(comp.company))
                                                ?.map((data) => ({
                                                    label: data.branch,
                                                    value: data.branch,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedBranch}
                                            onChange={handleBranchChangeFilter}
                                            valueRenderer={customValueRendererBranchFilter}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            {' '}
                                            Unit<b style={{ color: 'red' }}>*</b>
                                        </Typography>
                                        <MultiSelect
                                            options={accessbranch
                                                ?.filter((comp) => valueCompany?.includes(comp.company) && valueBranch?.includes(comp.branch))
                                                ?.map((data) => ({
                                                    label: data.unit,
                                                    value: data.unit,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedUnit}
                                            onChange={handleUnitChangeFilter}
                                            valueRenderer={customValueRendererUnitFilter}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                            </>
                        ) : (
                            ''
                        )}
                        {['Individual']?.includes(filterUser.filtertype) && (
                            <Grid item md={3} sm={12} xs={12} sx={{ display: 'flex', flexDirection: 'row' }}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Employee<b style={{ color: 'red' }}>*</b>{' '}
                                    </Typography>
                                    <MultiSelect
                                        options={allUsersLimit
                                            ?.filter((comp) => valueCompany?.includes(comp.company) && selectedBranch?.map((data) => data.value)?.includes(comp.branch) && selectedUnit?.map((data) => data.value)?.includes(comp.unit) && selectedTeam?.map((data) => data.value)?.includes(comp.team))
                                            ?.map((data) => ({
                                                label: data.companyname,
                                                value: data.companyname,
                                            }))
                                            .filter((item, index, self) => {
                                                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                            })}
                                        value={selectedEmp}
                                        onChange={(e) => {
                                            handleEmployeeChangeFilter(e);
                                        }}
                                        valueRenderer={customValueRendererEmpFilter}
                                        labelledBy="Please Select Employee"
                                    />
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item md={3} xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <Typography sx={{ fontWeight: "500" }}>
                                    Days
                                </Typography>
                                <Selects
                                    options={daysoptions}
                                    // styles={colourStyles}
                                    value={{ label: filterUser.day, value: filterUser.day }}
                                    onChange={(e) => {
                                        handleChangeFilterDate(e);
                                        setFilterUser((prev) => ({ ...prev, day: e.value }))
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={3} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    {" "}
                                    From Date
                                </Typography>
                                <OutlinedInput
                                    id="from-date"
                                    type="date"
                                    disabled={filterUser.day !== "Custom Fields"}
                                    value={filterUser.fromdate}
                                    onChange={(e) => {
                                        const newFromDate = e.target.value;
                                        setFilterUser((prevState) => ({
                                            ...prevState,
                                            fromdate: newFromDate,
                                            todate: prevState.todate && new Date(prevState.todate) > new Date(newFromDate) ? prevState.todate : ""
                                        }));
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={3} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    To Date
                                </Typography>
                                <OutlinedInput
                                    id="to-date"
                                    type="date"
                                    value={filterUser.todate}
                                    disabled={filterUser.day !== "Custom Fields"}
                                    onChange={(e) => {
                                        const selectedToDate = new Date(e.target.value);
                                        const selectedFromDate = new Date(filterUser.fromdate);
                                        const formattedDatePresent = new Date() // Assuming you have a function to format the current date
                                        if (selectedToDate >= selectedFromDate && selectedToDate >= new Date(selectedFromDate)) {
                                            setFilterUser({
                                                ...filterUser,
                                                todate: e.target.value
                                            });
                                        } else {
                                            setFilterUser({
                                                ...filterUser,
                                                todate: "" // Reset to empty string if the condition fails
                                            });
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item lg={1} md={2} sm={2} xs={6}>
                            <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                                <Button sx={buttonStyles.buttonsubmit} variant="contained" onClick={handleSubmitFilter}>
                                    {' '}
                                    Filter{' '}
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item lg={1} md={2} sm={2} xs={6}>
                            <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                                <Button sx={buttonStyles.btncancel} onClick={handleClearFilter}>
                                    {' '}
                                    Clear{' '}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}
            <br />
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes("luserdocumentuploadfilter") && (
                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={12} sm={12} xs={12}>
                                <Typography sx={userStyle.importheadtext}>User Document Upload Filter List</Typography>
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
                                        <MenuItem value={userDocuments?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Box>
                                    {isUserRoleCompare?.includes("exceluserdocumentuploadfilter") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>

                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvuserdocumentuploadfilter") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printuserdocumentuploadfilter") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfuserdocumentuploadfilter") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)
                                                }}
                                            ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imageuserdocumentuploadfilter") && (
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
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsApplyLeave}>  Manage Columns  </Button>  &ensp;
                        {/* {isUserRoleCompare?.includes("bduserdocumentuploadfilter") && (
                            <>
                                <Button variant="contained" color="error" onClick={handleClickOpenalert}>
                                    Bulk Delete
                                </Button>
                            </>
                        )} */}
                        <br />
                        {/* {!userCheck ? ( */}
                        {userCheck ? (
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

            {/* document View */}

            <Dialog
                open={isimgviewbill}
                onClose={handlecloseImgcodeviewbill}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <Typography variant="h6">Document Files</Typography>

                    {getimgbillcode.map((imagefilebill, index) => (
                        <Grid container key={index}>


                            <Grid
                                item
                                md={10}
                                sm={10}
                                xs={10}
                                sx={{ display: "flex", alignItems: "center" }}
                            >
                                <Typography>{imagefilebill.name}</Typography>
                            </Grid>

                            <Grid item md={2} sm={1} xs={1}>
                                <Button
                                    sx={{
                                        padding: "14px 14px",
                                        minWidth: "40px !important",
                                        borderRadius: "50% !important",
                                        ":hover": {
                                            backgroundColor: "#80808036", // theme.palette.primary.main
                                        },
                                    }}
                                    onClick={() => renderFilePreview(imagefilebill)}
                                >
                                    <VisibilityOutlinedIcon
                                        style={{
                                            fontsize: "12px",
                                            color: "#357AE8",
                                            marginTop: "35px !important",
                                        }}
                                    />
                                </Button>
                            </Grid>
                        </Grid>
                    ))}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handlecloseImgcodeviewbill} sx={userStyle.btncancel}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
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
                filename={"User Document Upload Filter"}
                exportColumnNames={exportColumnNamescrt}
                exportRowValues={exportRowValuescrt}
                componentRef={componentRef}
            />
            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="User Document Upload Filter Info"
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

        </Box>
    );
}

export default UserDocumentUploadFilter;