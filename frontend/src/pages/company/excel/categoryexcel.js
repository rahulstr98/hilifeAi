import React, { useState, useEffect, useRef, useContext } from "react";
import {
    Box, Typography, OutlinedInput, Dialog, Select, TableRow, TableCell, MenuItem, TableBody,
    DialogContent, DialogActions, FormControl, Grid, Paper, Table, TableHead, TableContainer, Button, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton
} from "@mui/material";
import { userStyle, colourStyles } from "../../../pageStyle";
import { FaFileCsv, FaFileExcel, FaPrint, FaFilePdf } from "react-icons/fa";
import { StyledTableRow, StyledTableCell } from "../../../components/Table";
import { handleApiError } from "../../../components/Errorhandling";
import { SERVICE } from '../../../services/Baseservice';
import jsPDF from "jspdf";
import 'jspdf-autotable';
import Selects from "react-select";
import axios from "axios";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StyledDataGrid from "../../../components/TableStyle";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useReactToPrint } from "react-to-print";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import moment from 'moment-timezone';
import { UserRoleAccessContext, AuthContext } from '../../../context/Appcontext';
import Headtitle from "../../../components/Headtitle";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import Papa from "papaparse";
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import html2canvas from 'html2canvas';
import ImageIcon from '@mui/icons-material/Image';
import LoadingButton from "@mui/lab/LoadingButton";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


function CategoryMaster() {
    const gridRef = useRef(null);

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowsCount, setSelectedRowsCount] = useState(0);
    const [isBtn, setIsBtn] = useState(false);

    const [searchQueryManage, setSearchQueryManage] = useState("");


    const [category, setCategory] = useState({ name: "" });
    const [categoryid, setCategoryid] = useState({ name: "" });
    const [categories, setCategories] = useState([]);
    const [selectedProject, setSelectedProject] = useState("Please Select Project");
    const [selectedProjectedit, setSelectedProjectedit] = useState('');
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [selectedVendorsedit, setSelectedVendorsedit] = useState([]);
    const [allModuleedit, setAllModuleedit] = useState([]);
    const [projects, setProjects] = useState([]);

    const [timePointsList, setTimePointsList] = useState([])
    const { isUserRoleCompare, isUserRoleAccess } = useContext(UserRoleAccessContext);
    const [copiedData, setCopiedData] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    const [fileFormat, setFormat] = useState('')
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = fileFormat === "xl" ? '.xlsx' : '.csv';
    const exportToCSV = (csvData, fileName) => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };

    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };
    const handleExportXL = (isfilter) => {

        if (isfilter === "filtered") {
            exportToCSV(
                filteredData?.map((item, index) => ({
                    "Sno": index + 1,
                    "Project Name": item.project,
                    "Category Name": item.name,


                })),
                fileName,
            );
        } else if (isfilter === "overall") {
            exportToCSV(
                items.map((item, index) => ({
                    "Sno": index + 1,
                    "Project Name": item.project,
                    "Category Name": item.name,
                })),
                fileName,
            );

        }

        setIsFilterOpen(false)
    };

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
            filteredData?.map((item, index) => ({
                "serialNumber": index + 1,
                name: item.name,
                project: item.project,

            })) :
            items.map((item, index) => ({
                "serialNumber": index + 1,
                name: item.name,
                project: item.project,
            }))
            ;

        // Generate PDF
        doc.autoTable({
            theme: "grid",
            styles: {
                fontSize: 5,
                cellWidth: 'auto'
            },
            columns: columnsWithSerial,
            body: dataWithSerial,
        });

        doc.save("Catgeory.pdf");
    };



    //image
    const handleCaptureImage = () => {
        if (gridRef.current) {
            html2canvas(gridRef.current).then((canvas) => {
                canvas.toBlob((blob) => {
                    saveAs(blob, 'Category.png');
                });
            });
        }
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };

    //OVERALL EDIT FUNCTIONALITY
    const [ovProj, setOvProj] = useState("");
    const [getOverAllCount, setGetOverallCount] = useState("");
    const [ovProjcount, setOvProjcount] = useState()

    //OVERDELETE FUNCTIONALITY 
    const [checksubcategory, setChecksubcategory] = useState();
    const [checktimepoints, setChecktimepoints] = useState();

    const [vendors, setVendors] = useState([])

    const username = isUserRoleAccess.username;

    const renderSelectedVendors = () => {
        const selectedVendorNames = selectedVendors.map(vendorValue => {
            const vendor = vendors.find(v => v.name === vendorValue.value);
            return vendor ? vendor.name : '';
        });
        return selectedVendorNames.join(', '); // Join selected vendor names with commas
    };

    const renderSelectedVendorsEdit = () => {
        const selectedVendorNamesEdit = selectedVendorsedit.map(vendorValue => {
            const vendor = vendors.find(v => v.name === vendorValue.value);
            return vendor ? vendor.name : '';
        });
        return selectedVendorNamesEdit.join(', '); // Join selected vendor names with commas
    };

    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { auth } = useContext(AuthContext);

    // Error Popup model
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState();
    const handleClickOpenerr = () => {
        setIsErrorOpen(true);
        setIsBtn(false)
    };
    const handleCloseerr = () => {
        setIsErrorOpen(false);
        setIsBtn(false)
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


    // view model
    const [openview, setOpenview] = useState(false);

    const handleClickOpenview = () => {
        setOpenview(true);
    };

    const handleCloseview = () => {
        setOpenview(false);
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
        if (selectedRows.length == 0) {
            setIsDeleteOpenalert(true);
        } else {
            getOverallDeleteSection(selectedRows)

        }
    };


    //overall edit section for all pages
    const getOverallDeleteSection = async (e) => {
        try {
            let res = await axios.post(SERVICE.CATEGORYEXCEL_BULK_DELETE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                id: e,
            });
            setSelectedRows(res?.data?.result);
            setSelectedRowsCount(res?.data?.count)

            setIsDeleteOpencheckbox(true);


         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
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



    //set function to get particular row
    const [deletemodule, setDeletemodule] = useState({});

    const [checkSubmodule, setCheckSubmodule] = useState();

    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ''; // This is required for Chrome support
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
        project: true,
        name: true,
        actions: true,
    };

    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);


    const rowData = async (id, name) => {
        try {
            const [res, ressub, restime] = await Promise.all([
                axios.get(`${SERVICE.CATEGORYEXCEL_SINGLE}/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    },
                }),
                axios.post(SERVICE.SUBCATEGORY_CATEGORYCHECK, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    },
                    checkcate: String(name)
    
                }),
                axios.post(SERVICE.TIMEPOINTSCATEGORYCHECK, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    },
                    checkcate: String(name)
                })
            ]);
            setDeletemodule(res?.data?.scategory);
            setChecksubcategory(ressub?.data?.subcategory)
            setChecktimepoints(restime?.data?.timepoints)

            if ((ressub?.data?.subcategory).length > 0 || (restime?.data?.timepoints).length > 0) {
                handleClickOpenCheck();
            }
            else {
                handleClickOpen();
            }
         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };
    //fetching Project for Dropdowns
    const fetchProjectDropdowns = async () => {
        try {
            let res_project = await axios.get(SERVICE.PROJECTMASTER, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            const projall = [...res_project?.data?.projmaster.map((d) => (
                {
                    ...d,
                    label: d.name,
                    value: d.name
                }
            ))];
            setProjects(projall);

        } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };



    // Alert delete popup
    let categoriesexcelid = deletemodule._id;
    const delModule = async () => {
        try {
            await axios.delete(
                `${SERVICE.CATEGORYEXCEL_SINGLE}/${categoriesexcelid}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
            });
            await fetchAllCategory();
            setPage(1);
            setSelectedRows([]);
            handleCloseMod();
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: 'orange' }} />
                    <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Deleted Successfully"}</p>
                </>
            );
            handleClickOpenerr();

         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    const delProjectcheckbox = async () => {
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.CATEGORYEXCEL_SINGLE}/${item}`, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    }
                });
            });

            // Wait for all delete requests to complete
            await Promise.all(deletePromises);

            await fetchAllCategory();
            handleCloseModcheckbox();
            setSelectedRows([]);
            setSelectAllChecked(false);
            setPage(1);
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: 'orange' }} />
                    <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Deleted Successfully"}</p>
                </>
            );
            handleClickOpenerr();
       } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    const fetchAllTimePoints = async () => {
        try {
            let res_queue = await axios.get(SERVICE.TIMEPOINTS, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setTimePointsList(res_queue.data.timepoints)
         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };



    //add function...
    const sendRequest = async () => {
        setIsBtn(true)
        try {

            let modules = await axios.post(SERVICE.CATEGORYEXCEL_CREATE, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                project: String(selectedProject),
                name: String(category.name),
                addedby: [
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            let res = await axios.post(SERVICE.TIMEPOINTS_CREATE, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                project: String(selectedProject),
                category: String(category.name),
                subcategory: String("ALL"),
                time: String("00:00:00"),
                rate: Number(0),
                ratetopoints: Number("8.333333333333333").toFixed(14),
                points: Number(0),
                state: String("ALL"),
                flagcount: Number(1).toFixed(3),
                addedby: [
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            await fetchAllCategory();
            await fetchAllTimePoints();
            setCategory({ ...vendors, name: "" });
            setIsBtn(false)
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: 'orange' }} />
                    <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Added Successfully"}</p>
                </>
            );
            handleClickOpenerr();
        } catch (err) {setIsBtn(false);handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    //submit option for saving
    const handleSubmit = (e) => {
        e.preventDefault();
        const isNameMatch = categories?.some(item => item?.name?.toLowerCase() === (category?.name)?.toLowerCase() && item.project === selectedProject);
        if (selectedProject === "" || selectedProject == "Please Select Project") {
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "100px", color: "orange" }}
                    />
                    <p style={{ fontSize: "20px", fontWeight: 900 }}>
                        {"Please Select Project"}
                    </p>
                </>
            );
            handleClickOpenerr();
        }
        else if (category.name === "") {
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "100px", color: "orange" }}
                    />
                    <p style={{ fontSize: "20px", fontWeight: 900 }}>
                        {"Please Enter Category Name"}
                    </p>
                </>
            );
            handleClickOpenerr();
        }
        else if (isNameMatch) {
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "100px", color: "orange" }}
                    />
                    <p style={{ fontSize: "20px", fontWeight: 900 }}>
                        {"Name already Exists!"}
                    </p>
                </>
            );
            handleClickOpenerr();
        }
        else {
            sendRequest();
        }
    };


    const handleclear = (e) => {
        e.preventDefault();
        setSelectedProject("Please Select Project");
        setSelectedVendors([]);
        setCategory({ name: "" })
        setShowAlert(
            <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: 'orange' }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Cleared Successfully"}</p>
            </>
        );
        handleClickOpenerr();
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


    //id for login...
    let loginid = localStorage.LoginUserId;
    let authToken = localStorage.APIToken;


    //get single row to edit....
    const getCode = async (e, name, vendorname) => {
        try {

            let res = await axios.get(`${SERVICE.CATEGORYEXCEL_SINGLE}/${e}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
            });
            setCategoryid(res?.data?.scategory);
            setSelectedProjectedit(res?.data?.scategory.project)
            setOvProj(name);
            getOverallEditSection(name);
         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };
    // get single row to view....
    const getviewCode = async (e) => {
        try {
            let res = await axios.get(`${SERVICE.CATEGORYEXCEL_SINGLE}/${e}`, {

                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
            });
            setCategoryid(res?.data?.scategory);
         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    // get single row to view....
    const getinfoCode = async (e) => {
        try {
            let res = await axios.get(`${SERVICE.CATEGORYEXCEL_SINGLE}/${e}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
            });
            setCategoryid(res?.data?.scategory);
         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    //Module updateby edit page...
    let updateby = categoryid?.updatedby;
    let addedby = categoryid?.addedby;


    let categoriesid = categoryid?._id;

    //editing the single data...
    const sendEditRequest = async () => {
        try {
            let res = await axios.put(`${SERVICE.CATEGORYEXCEL_SINGLE}/${categoriesid}`,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    },
                    project: selectedProjectedit,
                    name: String(categoryid.name),
                    updatedby: [
                        ...updateby, {
                            name: String(isUserRoleAccess.companyname),
                            date: String(new Date()),
                        },
                    ],
                }
            );

            await fetchAllCategory();
            await getOverallEditSectionUpdate();
            handleCloseModEdit();
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: 'orange' }} />
                    <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Updated Successfully"}</p>
                </>
            );
            handleClickOpenerr();
         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };


    const editSubmit = async (e) => {
        e.preventDefault();
        let resdata = await fetchCategoryexcelAll();
        const isNameMatch = resdata?.some(item => item?.name?.toLowerCase() === (categoryid?.name)?.toLowerCase() && item.project === selectedProjectedit);
        if (selectedProjectedit === "") {
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "100px", color: "orange" }}
                    />
                    <p style={{ fontSize: "20px", fontWeight: 900 }}>
                        {"Please Select Project"}
                    </p>
                </>
            );
            handleClickOpenerr();
        }
        else if (categoryid.name === "") {
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "100px", color: "orange" }}
                    />
                    <p style={{ fontSize: "20px", fontWeight: 900 }}>
                        {"Please Enter  Name"}
                    </p>
                </>
            );
            handleClickOpenerr();
        }
        else if (isNameMatch) {
            setShowAlert(
                <>
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "100px", color: "orange" }}
                    />
                    <p style={{ fontSize: "20px", fontWeight: 900 }}>
                        {"Name already Exists!"}
                    </p>
                </>
            );
            handleClickOpenerr();
        }
        else if (categoryid.name != ovProj && ovProjcount > 0) {
            setShowAlertpop(
                <>
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "100px", color: "orange" }}
                    />
                    <p style={{ fontSize: "20px", fontWeight: 900 }}>
                        {getOverAllCount}
                    </p>
                </>
            );
            handleClickOpenerrpop()
        }
        
        else {
            sendEditRequest();
        }
    };


    //overall edit section for all pages 
    const getOverallEditSection = async (e) => {
        try {
            let res = await axios.post(SERVICE.OVERALL_CATEGORYEXCEL, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                oldname: e,
            });
            setOvProjcount(res.data.count)

            setGetOverallCount(`The ${e} is linked in 
       ${res?.data?.subcategory?.length > 0 ? "subcatetory ," : ""}
       ${res?.data?.timepoints?.length > 0 ? "time and points" : ""} 
       ${res?.data?.excelmapdata?.length > 0 ? "Allotted Queue" : ""}
       ${res?.data?.excelmapresperson?.length > 0 ? "Allotted Resperson" : ""} whether you want to do changes ..??`)

         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    //overall edit section for all pages 
    const getOverallEditSectionUpdate = async () => {
        try {
            let res = await axios.post(SERVICE.OVERALL_CATEGORYEXCEL, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                oldname: ovProj,
            });
            sendEditRequestOverall(res?.data?.subcategory, res?.data?.timepoints, res?.data?.excelmapdata, res?.data?.excelmapresperson)

         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };



    const sendEditRequestOverall = async (subcategory, timepoints, excelmapdata, excelmapresperson) => {
        try {


            if (subcategory.length > 0) {
                let answ = subcategory.map((d, i) => {
                    let res = axios.put(`${SERVICE.SUBCATEGORYEXCEL_SINGLE}/${d._id}`, {
                        headers: {
                            'Authorization': `Bearer ${auth.APIToken}`
                        },
                        categoryname: String(categoryid.name),

                    });

                })

            }
            if (timepoints.length > 0) {
                let answ = timepoints.map((d, i) => {
                    let res = axios.put(`${SERVICE.TIMEPOINTS_SINGLE}/${d._id}`, {
                        headers: {
                            'Authorization': `Bearer ${auth.APIToken}`
                        },
                        category: String(categoryid.name),

                    });

                })

            }
            // if (excelmapdata.length > 0) {
            //     let answ = excelmapdata.map((d, i) => {
            //         let res = axios.put(`${SERVICE.EXCELMAPDATA_SINGLE}/${d._id}`, {
            //             headers: {
            //                 'Authorization': `Bearer ${auth.APIToken}`
            //             },
            //             category: String(categoryid.name),

            //         });

            //     })

            // }
            // if (excelmapresperson.length > 0) {
            //     let answ = excelmapresperson.map((d, i) => {
            //         let res = axios.put(`${SERVICE.EXCELMAPDATARESPERSON_SINGLE}/${d._id}`, {
            //             headers: {
            //                 'Authorization': `Bearer ${auth.APIToken}`
            //             },
            //             category: String(categoryid.name),

            //         });

            //     })

            // }


         } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };




    //get all category.
    const fetchAllCategory = async () => {
        try {
            let res_module = await axios.get(SERVICE.CATEGORYEXCEL, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
            });

            setCategories(res_module?.data?.categoryexcel);
        } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    //get all modules.
    const fetchCategoryexcelAll = async () => {
        try {
            let res_module = await axios.get(SERVICE.CATEGORYEXCEL, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
            });
            return res_module?.data?.categoryexcel.filter(item => item._id !== categoryid._id)

        } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    //get all category.
    const fetchVendor = async () => {
        try {
            let res = await axios.get(SERVICE.VENDORMASTER, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
            });
            setVendors(res?.data?.vendormaster)
        } catch (err) {handleApiError(err, setShowAlert, handleClickOpenerr);}
    };

    const [vendorsfetch, setVendorsfetch] = useState([]);
    const [vendorsfetchedit, setVendorsfetchedit] = useState([]);

    const handleProjectChange = (e) => {
        const selectedProject = e.value;
        setSelectedProject(selectedProject);
    };


    const checkcategorydata = categories?.map((item, index) => ({
        ...item,
        project: item.project,
        categoryname: item.name,
        sno: index + 1

    }));

    //pdf....
    const columns = [
        { title: "Project Name", field: "project" },
        { title: "Category Name", field: "name" },

    ];
  
    // Excel
    const fileName = "Category";
    const [categoryData, setcategoryData] = useState([]);

    // get particular columns for export excel
    const getexcelDatas = async () => {
            var data = checkcategorydata?.map((t, index) => ({
                "Sno": index + 1,
                "project Name": t.project,
                "Category Name": t.categoryname,
            }));
            setcategoryData(data);
    };

    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Category",
        pageStyle: "print",
    });



    const [items, setItems] = useState([]);

    useEffect(() => {
        getexcelDatas()
    }, [category, categoryid])

    useEffect(() => {
        getexcelDatas()
    }, [categories])

    useEffect(() => {
        fetchAllCategory();
        fetchVendor();
        fetchAllTimePoints();
    }, [])

    useEffect(() => {
        fetchProjectDropdowns();
    }, [isEditOpen, categoryid])

    useEffect(
        () => {
            const beforeUnloadHandler = (event) => handleBeforeUnload(event);
            window.addEventListener('beforeunload', beforeUnloadHandler);
            return () => {
                window.removeEventListener('beforeunload', beforeUnloadHandler);
            };
        }, []);

    const addSerialNumber = () => {
        const itemsWithSerialNumber = categories?.map((item, index) => ({ ...item, serialNumber: index + 1 }));
        setItems(itemsWithSerialNumber);
    }

    useEffect(() => {
        addSerialNumber();
    }, [categories])

    //table sorting
    const [sorting, setSorting] = useState({ column: '', direction: '' });
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
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(1);
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
    const lastVisiblePage = Math.min(Math.abs(firstVisiblePage + visiblePages - 1), totalPages);


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
                        setSelectAllChecked(updatedSelectedRows.length === filteredData.length);

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
        { field: "project", headerName: "Project Name", flex: 0, width: 250, hide: !columnVisibility.project, headerClassName: "bold-header" },
        { field: "name", headerName: "Name", flex: 0, width: 250, hide: !columnVisibility.name, headerClassName: "bold-header" },

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
                <Grid sx={{ display: "flex" }}>
                    {isUserRoleCompare?.includes("ecategorymaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                handleClickOpenEdit();
                                getCode(params.row.id, params.row.name, params.row.vendorname);
                            }}
                        >
                            <EditOutlinedIcon style={{ fontsize: "large" }} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("dcategorymaster") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                rowData(params.row.id, params.row.name);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon
                                style={{ fontsize: "large" }}
                            />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("vcategorymaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                handleClickOpenview();
                                getviewCode(params.row.id);
                            }}
                        >
                            <VisibilityOutlinedIcon style={{ fontsize: "large" }} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("icategorymaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                handleClickOpeninfo();
                                getinfoCode(params.row.id);
                            }}
                        >
                            <InfoOutlinedIcon style={{ fontsize: "large" }} />
                        </Button>
                    )}

                </Grid>
            ),
        },
    ]

    const rowDataTable = filteredData.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            project: item.project,
            name: item.name,
        }
    });

    const rowsWithCheckboxes = rowDataTable.map((row) => ({
        ...row,
        // Create a custom field for rendering the checkbox
        checkbox: selectedRows?.includes(row.id),
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

    return (
        <Box>
            <Headtitle title={'CATEGORYEXCEL'} />
            {/* ****** Header Content ****** */}
            <Typography sx={userStyle.HeaderText}>Category </Typography>
            {isUserRoleCompare?.includes("acategorymaster") && (
                <Box sx={userStyle.dialogbox}>
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Typography sx={userStyle.importheadtext}>Add Category</Typography>
                            </Grid>
                        </Grid>
                        <br />
                        <Grid container spacing={2}>
                            <Grid item md={4} xs={12} sm={12}>
                                <Typography>Project <b style={{ color: "red" }}>*</b></Typography>
                                <FormControl size="small" fullWidth>
                                    <Selects
                                        options={projects}
                                        styles={colourStyles}
                                        value={{ label: selectedProject, value: selectedProject }}
                                        onChange={handleProjectChange}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Name <b style={{ color: "red" }}>*</b></Typography>
                                    <OutlinedInput
                                        id="component-outlined"
                                        type="text"
                                        placeholder="Please Enter Category Name"
                                        value={category.name}
                                        onChange={(e) => {
                                            setCategory({ ...category, name: e.target.value });
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <br />
                        <br />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={2.5} lg={2.5}>
                                <LoadingButton
                                    loading={isBtn}
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                >
                                    SUBMIT
                                </LoadingButton>


                            </Grid>
                            <Grid item xs={12} sm={6} md={2.5} lg={2.5}>
                                <Button
                                    sx={userStyle.btncancel}
                                    onClick={handleclear}
                                >
                                    Clear
                                </Button>

                            </Grid>
                        </Grid>
                    </>
                </Box>
            )}
            <Box>
                {/* edit model */}
                <Dialog
                    open={isEditOpen}
                    onClose={handleCloseModEdit}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth={true}
                    sx={{
                        overflow: 'visible',
                        '& .MuiPaper-root': {
                            overflow: 'visible',
                        },
                    }}
                >

                    <Box sx={{ padding: '20px 30px' }}>
                        <>
                            <Grid container spacing={2}>
                                <Grid item md={12} xs={12} sm={12}>
                                    <Typography sx={userStyle.HeaderText}>  Edit Category</Typography>
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container spacing={2}>
                                <Grid item md={6} xs={12} sm={12}>
                                    <Typography>Project <b style={{ color: "red" }}>*</b></Typography>
                                    <FormControl fullWidth size="small" >
                                        <Selects
                                            options={projects}
                                            styles={colourStyles}
                                            value={{ label: selectedProjectedit, value: selectedProjectedit }}
                                            onChange={(e) => setSelectedProjectedit(e.value)}

                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={6} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Name <b style={{ color: "red" }}>*</b></Typography>
                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            placeholder="Please Enter Category Name"
                                            value={categoryid.name}
                                            onChange={(e) => {
                                                setCategoryid({ ...categoryid, name: e.target.value });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <br /> <br />
                            <br /> <br />
                            <br /> <br />
                            <Grid container spacing={2}>
                                <Grid item md={6} xs={12} sm={6}>
                                    <Button variant="contained" onClick={editSubmit}>  Update</Button>
                                </Grid>
                                <Grid item md={6} xs={12} sm={6}>
                                    <Button sx={userStyle.btncancel} onClick={handleCloseModEdit}> Cancel </Button>
                                </Grid>
                            </Grid>

                        </>
                    </Box>

                </Dialog>
            </Box>
            <br />
            {/* ****** Table Start ****** */}

            {isUserRoleCompare?.includes("lcategorymaster") && (
                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        {/*       
          <Box sx={userStyle.container} > */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Category List</Typography>
                        </Grid>
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
                                        <MenuItem value={(categories?.length)}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box >
                                    {isUserRoleCompare?.includes("excelcategorymaster") && (
                                        // <>
                                        //     <ExportXL csvData={filteredData.map((item, index) => {
                                        //         return {
                                        //             Sno: item.serialNumber,
                                        //             project: item.project,
                                        //             CategoryName: item.name,
                                        //         }
                                        //     })} fileName={fileName} />

                                        // </>
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvcategorymaster") && (
                                        // <>
                                        //     <ExportCSV csvData={filteredData.map((item, index) => {
                                        //         return {
                                        //             Sno: item.serialNumber,
                                        //             project: item.project,
                                        //             CategoryName: item.name,
                                        //         }
                                        //     })} fileName={fileName} />
                                        // </>
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>

                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printcategorymaster") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfcategorymaster") && (
                                        // <>
                                        //     <Button sx={userStyle.buttongrp} onClick={() => downloadPdf()}>
                                        //         <FaFilePdf />
                                        //         &ensp;Export to PDF&ensp;
                                        //     </Button>
                                        // </>
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)

                                                }}                                                ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imagecategorymaster") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}> <ImageIcon sx={{ fontSize: "15px" }} />  &ensp;Image&ensp; </Button>
                                        </>
                                    )}
                                </Box >
                            </Grid>
                            <Grid item md={2} xs={12} sm={12}>
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
                        {isUserRoleCompare?.includes("bdcategorymaster") && (
                            <Button variant="contained" color="error" onClick={handleClickOpenalert} >Bulk Delete</Button>
                        )}
                        <br />
                        <br />

                        <>
                            <Box
                                style={{
                                    width: '100%',
                                    overflowY: 'hidden', // Hide the y-axis scrollbar
                                }}
                            >
                                <StyledDataGrid
                                    onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
                                    rows={rowsWithCheckboxes}
                                    columns={columnDataTable.filter((column) => columnVisibility[column.field])}
                                    onSelectionModelChange={handleSelectionChange}
                                    selectionModel={selectedRows}
                                    autoHeight={true}
                                    ref={gridRef}
                                    density="compact"
                                    hideFooter
                                    getRowClassName={getRowClassName}
                                    disableRowSelectionOnClick
                                />


                            </Box>

                            <Box style={userStyle.dataTablestyle}>
                                <Box>
                                    Showing {filteredData.length > 0 ? ((page - 1) * pageSize) + 1 : 0} to {Math.min(page * pageSize, filteredDatas?.length)} of {filteredDatas?.length} entries
                                </Box>
                                <Box>
                                    <Button onClick={() => setPage(1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                                        <FirstPageIcon />
                                    </Button>
                                    <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                                        <NavigateBeforeIcon />
                                    </Button>
                                    {pageNumbers?.map((pageNumber) => (
                                        <Button key={pageNumber} sx={userStyle.paginationbtn} onClick={() => handlePageChange(pageNumber)} className={((page)) === pageNumber ? 'active' : ''} disabled={page === pageNumber}>
                                            {pageNumber}
                                        </Button>
                                    ))}
                                    {lastVisiblePage < totalPages && <span>...</span>}
                                    <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                                        <NavigateNextIcon />
                                    </Button>
                                    <Button onClick={() => setPage((totalPages))} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                                        <LastPageIcon />
                                    </Button>
                                </Box>
                            </Box>
                            {/* ****** Table End ****** */}
                        </>
                        {/* } */}
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

            {/* Delete Modal */}
            <Box>
                {/* ALERT DIALOG */}
                <Dialog
                    open={isDeleteOpen}
                    onClose={handleCloseMod}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent
                        sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
                    >
                        <ErrorOutlineOutlinedIcon
                            sx={{ fontSize: "80px", color: "orange" }}
                        />
                        <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
                            Are you sure?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseMod} sx={userStyle.btncancel}>
                            Cancel
                        </Button>
                        <Button
                            autoFocus
                            variant="contained"
                            color="error"
                            onClick={(e) => delModule(categoriesexcelid)}
                        >
                            {" "}
                            OK{" "}
                        </Button>
                    </DialogActions>
                </Dialog>





                {/* print layout */}
                <TableContainer component={Paper} sx={userStyle.printcls}>
                    <Table
                        sx={{ minWidth: 700 }}
                        aria-label="customized table"
                        id="usertable"
                        ref={componentRef}
                    >
                        <TableHead sx={{ fontWeight: "600" }}>
                            <TableRow>
                                <TableCell> SI.No</TableCell>
                                <TableCell> Project Name</TableCell>
                                <TableCell>Category Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {filteredData?.length > 0 &&
                                filteredData?.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.project}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            {/* view model */}
            <Dialog
                open={openview}
                onClose={handleCloseview}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Box sx={{ width: '550px', padding: '20px 50px' }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Category</Typography>
                        <br /><br />
                        <Grid container spacing={2}>
                            <Grid item md={12} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Project</Typography>
                                    <Typography>{categoryid.project}</Typography>
                                </FormControl>
                            </Grid><br />

                            <Grid item md={12} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Name</Typography>
                                    <Typography>{categoryid.name}</Typography>
                                </FormControl>
                            </Grid><br />
                        </Grid>
                        <br /> <br /><br />
                        <Grid container spacing={2}>
                            <Button variant="contained" onClick={handleCloseview}> Back </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>

            {/* this is info view details */}

            <Dialog
                open={openInfo}
                onClose={handleCloseinfo}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Box sx={{ width: '550px', padding: '20px 50px' }}>
                    <>
                        <Typography sx={userStyle.HeaderText}>Category Info </Typography>
                        <br /><br />
                        <Grid container spacing={2}>
                            <Grid item md={12} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">addedby</Typography>
                                    <Table>
                                        <TableHead>
                                            <StyledTableCell sx={{ padding: '5px 10px !important' }}>{"SNO"}.</StyledTableCell>
                                            <StyledTableCell sx={{ padding: '5px 10px !important' }}> {"UserName"}</StyledTableCell>
                                            <StyledTableCell sx={{ padding: '5px 10px !important' }}> {"Date"}</StyledTableCell>
                                        </TableHead>
                                        <TableBody>
                                            {addedby?.map((item, i) => (
                                                <StyledTableRow>
                                                    <StyledTableCell sx={{ padding: '5px 10px !important' }}>{i + 1}.</StyledTableCell>
                                                    <StyledTableCell sx={{ padding: '5px 10px !important' }}> {item.name}</StyledTableCell>
                                                    <StyledTableCell sx={{ padding: '5px 10px !important' }}> {moment(item.date).format('DD-MM-YYYY hh:mm:ss a')}</StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </FormControl>
                            </Grid>
                            <br />
                            <Grid item md={12} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Updated by</Typography>
                                    <Table>
                                        <TableHead>
                                            <StyledTableCell sx={{ padding: '5px 10px !important' }}>{"SNO"}.</StyledTableCell>
                                            <StyledTableCell sx={{ padding: '5px 10px !important' }}> {"UserName"}</StyledTableCell>
                                            <StyledTableCell sx={{ padding: '5px 10px !important' }}> {"Date"}</StyledTableCell>
                                        </TableHead>
                                        <TableBody>
                                            {updateby?.map((item, i) => (
                                                <StyledTableRow>
                                                    <StyledTableCell sx={{ padding: '5px 10px !important' }}>{i + 1}.</StyledTableCell>
                                                    <StyledTableCell sx={{ padding: '5px 10px !important' }}> {item.name}</StyledTableCell>
                                                    <StyledTableCell sx={{ padding: '5px 10px !important' }}> {moment(item.date).format('DD-MM-YYYY hh:mm:ss a')}</StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <br /> <br /><br />
                        <Grid container spacing={2}>
                            <Button variant="contained" onClick={handleCloseinfo}> Back </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>


            {/* ALERT DIALOG */}
            <Box>
                <Dialog
                    open={isErrorOpen}
                    onClose={handleCloseerr}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
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
                        <Button variant="contained" style={{
                            padding: '7px 13px',
                            color: 'white',
                            background: 'rgb(25, 118, 210)'
                        }} onClick={() => {
                            sendEditRequest();
                            handleCloseerrpop();
                        }}>
                            ok
                        </Button>
                        <Button
                            style={{
                                backgroundColor: '#f4f4f4',
                                color: '#444',
                                boxShadow: 'none',
                                borderRadius: '3px',
                                padding: '7px 13px',
                                border: '1px solid #0000006b',
                                '&:hover': {
                                    '& .css-bluauu-MuiButtonBase-root-MuiButton-root': {
                                        backgroundColor: '#f4f4f4',
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
                                <Button onClick={handleCloseModcheckbox} sx={userStyle.btncancel}>Cancel</Button>
                                <Button variant="contained" color='error'
                                    onClick={(e) => delProjectcheckbox(e)}
                                > OK </Button>
                            </>
                            :
                            <Button variant="contained" color='error' onClick={handleCloseModcheckbox} sx={userStyle.btncancel}>Ok</Button>
                        }
                    </DialogActions>
                </Dialog>

            </Box>
            {/* <Box>
                <Dialog
                    open={isDeleteOpencheckbox}
                    onClose={handleCloseModcheckbox}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} />
                        <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>Are you sure?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModcheckbox} sx={userStyle.btncancel}>Cancel</Button>
                        <Button autoFocus variant="contained" color='error'
                            onClick={delProjectcheckbox}
                        > OK </Button>
                    </DialogActions>
                </Dialog>

            </Box> */}
            <Box>
                {/* ALERT DIALOG */}
                <Dialog
                    open={isDeleteOpenalert}
                    onClose={handleCloseModalert}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        <ErrorOutlineOutlinedIcon sx={{ fontSize: "70px", color: 'orange' }} />
                        <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>Please Select any Row</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus variant="contained" color='error'
                            onClick={handleCloseModalert}
                        > OK </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            {/*Export XL Data  */}
            <Dialog open={isFilterOpen} onClose={handleCloseFilterMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogContent sx={{ textAlign: "center", alignItems: "center", justifyContent: "center" }}>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseFilterMod}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {fileFormat === "xl" ? <FaFileExcel style={{ fontSize: "80px", color: "green" }} />
                        :
                        <FaFileCsv style={{ fontSize: "80px", color: "green" }} />
                    }
                    <Typography variant="h5" sx={{ textAlign: "center" }}>
                        Choose Export
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus variant="contained"
                        onClick={(e) => {
                            handleExportXL("filtered")
                        }}
                    >
                        Export Filtered Data
                    </Button>
                    <Button autoFocus variant="contained"
                        onClick={(e) => {
                            handleExportXL("overall")
                        }}
                    >
                        Export Over All Data
                    </Button>
                </DialogActions>
            </Dialog>
            {/*Export pdf Data  */}
            <Dialog open={isPdfFilterOpen} onClose={handleClosePdfFilterMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogContent sx={{ textAlign: "center", alignItems: "center", justifyContent: "center" }}>
                    <IconButton
                        aria-label="close"
                        onClick={handleClosePdfFilterMod}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <PictureAsPdfIcon sx={{ fontSize: "80px", color: "red" }} />
                    <Typography variant="h5" sx={{ textAlign: "center" }}>
                        Choose Export
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={(e) => {
                            downloadPdf("filtered")
                            setIsPdfFilterOpen(false);
                        }}
                    >
                        Export Filtered Data
                    </Button>
                    <Button variant="contained"
                        onClick={(e) => {
                            downloadPdf("overall")
                            setIsPdfFilterOpen(false);
                        }}
                    >
                        Export Over All Data
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ALERT DIALOG Delete*/}
            <Dialog
                open={isCheckOpen}
                onClose={handleCloseCheck}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} />
                    <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
                        {checksubcategory?.length > 0 && checktimepoints?.length > 0 ? (
                            <>
                                <span style={{ fontWeight: '700', color: '#777' }}>
                                    {`${deletemodule.name} `}
                                </span>was linked in <span style={{ fontWeight: '700' }}>  Subcategory & Time and points  </span>
                            </>
                        ) : checksubcategory?.length > 0 || checktimepoints?.length > 0 ? (
                            <>
                                <span style={{ fontWeight: '700', color: '#777' }}>
                                    {`${deletemodule.name} `}
                                </span>
                                was linked in{' '}
                                <span style={{ fontWeight: '700' }}>
                                    {checksubcategory?.length ? ' Subcategory' : ''}
                                    {checktimepoints?.length ? ' Time and points' : ''}
                                </span>
                            </>
                        ) : (
                            ''
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCheck} autoFocus variant="contained" color='error'> OK </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default CategoryMaster;