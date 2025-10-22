import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SERVICE } from "../services/Baseservice";
import {
    Container,
    Typography,
    TextField,
    Button,
    CircularProgress,
    LinearProgress,
    Box,
    Stack,
    Card,
    CardContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Grid, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
    OutlinedInput,
} from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MessageAlert from "../components/MessageAlert";
import { handleApiError } from "../components/Errorhandling";
import { AuthContext, UserRoleAccessContext } from "../context/Appcontext";
import moment from "moment-timezone";
// import "../../webpages/bdcsstemplatetwo.css";
// import "../../webpages/weddingcardtemplate.css"
import html2canvas from 'html2canvas';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import PosgenerateDialog from './PosterGenerateDialog';
import { MultiSelect } from "react-multi-select-component";
import LoadingButton from "@mui/lab/LoadingButton";


function ScreensaverForm() {

    const [btnLoading, setBtnLoading] = useState(false);
    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
    };
    const handleClosePopupMalert = () => {
        setOpenPopupMalert(false);
    };


    const [images, setImages] = useState([]);
    const [interval, setInterval] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [requestId, setRequestId] = useState(null);

    const [audioFile, setAudioFile] = useState(null);


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
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
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
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
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
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
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
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
    };

    const customValueRendererTeam = (valueTeamCat, _categoryname) => {
        return valueTeamCat?.length
            ? valueTeamCat.map(({ label }) => label)?.join(", ")
            : "Please Select Team";
    };

    const [selectedOptionsEmployee, setSelectedOptionsEmployee] = useState([]);
    let [valueEmployeeCat, setValueEmployeeCat] = useState([]);

    const handleEmployeeChange = (options) => {
        setValueEmployeeCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsEmployee(options);
    };

    const customValueRendererEmployee = (valueEmployeeCat, _categoryname) => {
        return valueEmployeeCat?.length
            ? valueEmployeeCat.map(({ label }) => label)?.join(", ")
            : "Please Select Employee";
    };


    const handleAudioChange = (e) => {
        setAudioFile(e.target.files[0]);
    };

    const handleImageChange = (e) => {
        setImages([...images, ...Array.from(e.target.files)]);
    };

    const base64ToBlob = (base64, mimeType) => {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: mimeType });
    };

    const base64ToFile = (base64, fileName, mimeType) => {
        const blob = base64ToBlob(base64, mimeType);
        return new File([blob], fileName, { type: mimeType });
    };

    // Function to simulate e.target.files from an array of base64
    const convertBase64ArrayToFileList = (base64Array) => {
        const fileList = base64Array.map((base64, index) => {
            const mimeType = 'image/png'; // Set a suitable MIME type
            const fileName = `image${Date.now()}_${index}.png`;
            return base64ToFile(base64, fileName, mimeType);
        });

        return fileList;
    };


    const handleIntervalChange = (e) => {
        const value = e.target.value;
        if (/^(?!0(\.0+)?$)\d*\.?\d*$/.test(value)) {
            setInterval(value); // Only update if value is a positive number
        }
    };

    const handleAddAllImages = (e) => {
        const files = e.target.files;
        // const fileList = convertBase64ArrayToFileList(base64DatasNew);

        // console.log(fileList, "fileList");

        setImages([...images, ...Array.from(files)]);
    };

    const handleRemoveImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
    };

    const handleRemoveAllImages = () => {
        setImages([]);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const updatedImages = [...images];
        [updatedImages[index], updatedImages[index - 1]] = [updatedImages[index - 1], updatedImages[index]];
        setImages(updatedImages);
    };

    const handleMoveDown = (index) => {
        if (index === images.length - 1) return;
        const updatedImages = [...images];
        [updatedImages[index], updatedImages[index + 1]] = [updatedImages[index + 1], updatedImages[index]];
        setImages(updatedImages);
    };


    const { isUserRoleAccess, isAssignBranch, allUsersData, allTeam, buttonStyles, } = useContext(
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

    const [base64DatasNew, setBase64DatasNew] = useState([]);

    const fetchGeneratedPoster = async () => {

        try {

            const [res_status, response, res, resFooter] = await Promise.all([
                axios.post(SERVICE.POSTERGENERATE, {
                    assignbranch: accessbranch
                }, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                }),
                axios.get(`${SERVICE.POSTERMESSAGESETTINGALL}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                }),
                axios.get(`${SERVICE.GET_OVERALL_SETTINGS}`),
                axios.get(`${SERVICE.FOOTERMESSAGESETTINGALL}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                })
            ])

            let footerMessage = resFooter?.data?.footermessage[0]?.footermessage;

            let companyLogo = res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
                ?.bdaycompanylogo;

            let getCommonIds = res_status?.data?.postergenerates?.map((item) => item?.posterdownload[0]?._id);

            let empDatas = await axios.post(SERVICE.EMPLOYEEWISHESDATAS, {
                commonid: getCommonIds
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });


            let overAllDatas = empDatas?.data?.overAlldatas;


            let imageBase64Datas = await Promise.all(
                res_status?.data?.postergenerates?.map(async (data) => {
                    let employeename = data?.posterdownload;
                    let employeenamesingle = data?.posterdownload[0]?.legalname;

                    const templatesubcat = data?.subcategoryname
                    const templatecat = data?.categoryname

                    const getWishes = response?.data?.postermessage?.find(
                        (item) => item?.categoryname === data?.categoryname &&
                            item?.subcategoryname === data?.subcategoryname
                    )?.wishingmessage;

                    const randomWish = getWishes ? getWishes[Math.floor(Math.random() * getWishes.length)] : "Happy Birthday!";

                    let foundData = overAllDatas?.find((item) => employeename[0]?._id === item?.commonid);

                    // ✅ Create a temporary div inside a React container
                    let tempDiv = document.createElement("div");
                    tempDiv.style.position = "absolute";
                    tempDiv.style.left = "-9999px"; // Hide it from view
                    tempDiv.style.width = "600px"; // Ensure proper width for rendering

                    let bdayHtml = `
                    <div id="birthdaydivtwo">
                        <div id="birthday-cardtwo">
                            <div class="companylogotwo">
                                <img src="${companyLogo}" alt="logo" height="150" width="165" />
                            </div>
                            <div id="profileImgtwo">
                                <img src="${foundData?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
                                     alt="profile" width="190" height="150" />
                                <span class="usernametwo" style="font-size: ${foundData?.companyname?.length > 11 ? '14px' : '16px'};">
                                    ${foundData?.companyname}
                                </span>
                            </div>
                            <div class="bdaydobtwo">
                                <span>${foundData?.dob ? moment(foundData?.dob).format("DD-MM-YYYY") : ""}</span>
                            </div>
                            <div class="bdaywishestwo">
                                <span>${randomWish}</span>
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
                                            <img src="${companyLogo}" alt="logo" height="150" width="165" /><br />
                                        </div>
                                        <div id="profileImgwedding">
                                            <img src="${foundData?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="" width="190" height="150" />
                                            <span class="usernamewedding"
                                           style="font-size: ${foundData?.companyname?.length > 11 ? '14px' : '16px'};"
                                            >${foundData?.companyname}</span>
                                        </div>
                                        <div class="bdaydobwedding">
                                            <span>${foundData?.dom ? moment(foundData?.dom).format("DD-MM-YYYY") : ""}</span>
                                        </div>
                                        <div class="bdaywisheswedding">
                                            <span>${randomWish}</span>
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


            // Update State with Image Data
            setBase64DatasNew(imageBase64Datas);
        } catch (error) {
            console.error("Error fetching posters:", error);
        }
    }


    const [items, setItems] = useState([]);
    const [posterGenerates, setPosterGenerates] = useState([]);
    const [posterGeneratesOverall, setPosterGeneratesOverall] = useState([]);

    const addSerialNumber = () => {
        const itemsWithSerialNumber = posterGenerates?.map((item, index) => ({
            ...item,
            serialNumber: index + 1,
        }));
        setItems(itemsWithSerialNumber);
    };

    useEffect(() => {
        addSerialNumber();
    }, [posterGenerates]);
    const [loadingNew, setLoadingNew] = useState(true); // State for loader

    const fetchPosters = async () => {
        try {

            let res_status = await axios.post(SERVICE.POSTERGENERATE, {
                assignbranch: accessbranch
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            console.log(res_status?.data?.postergenerates, "res_status?.data?.postergenerates")
            setPosterGenerates(res_status?.data?.postergenerates);
            setPosterGeneratesOverall(res_status?.data?.postergenerates);
            setLoadingNew(false);

        } catch (err) {
            setLoadingNew(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => {
        fetchPosters();
    }, [])

    const [searchQuery, setSearchQuery] = useState("");

    const searchOverAllTerms = searchQuery.toLowerCase().split(" ");

    const filteredDatas = items?.filter((item) => {
        return searchOverAllTerms.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });

    const rowDataTable = filteredDatas?.map((item) => ({
        ...item, id: item?._id
    }))

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };




    const [open, setOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    // Handle dialog open/close
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [openGenerate, setOpenGenerate] = useState(false);
    const handleOpenGenerate = () => setOpenGenerate(true);
    const handleCloseGenerate = () => setOpenGenerate(false);

    // Handle row selection
    const handleRowSelection = (id) => {
        setSelectedRows((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((rowId) => rowId !== id) : [...prevSelected, id]
        );
    };

    const handleAddSelectedImages = async (e) => {
        if (selectedRows?.length === 0) {
            setPopupContentMalert("Please Select Any Row!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        } else {
            let getImagesBase64 = selectedRows?.map((item) => {
                return rowDataTable?.find((data) => data?.id === item)?.imagebase64
            }).filter((item) => item);
            const fileList = convertBase64ArrayToFileList(getImagesBase64);
            setImages((prev) => [...prev, ...fileList]);
            handleClose();
            setSelectedRows([]);
        }

    }

    const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
        <div>
            <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
        </div>
    );

    // DataGrid columns with checkboxes
    const columns = [
        {
            field: "checkbox",
            renderHeader: (params) => (
                <CheckboxHeader
                    selectAllChecked={selectAllChecked}
                    onSelectAll={() => {
                        if (rowDataTable.length === 0) {
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
                            updatedSelectedRows = selectedRows.filter(
                                (selectedId) => selectedId !== params.row.id
                            );
                        } else {
                            updatedSelectedRows = [...selectedRows, params.row.id];
                        }

                        setSelectedRows(updatedSelectedRows);
                        // Update the "Select All" checkbox based on whether all rows are selected
                        setSelectAllChecked(
                            updatedSelectedRows.length === rowDataTable.length
                        );
                    }}
                />
            ),
            width: 80,
            sortable: false,
        },
        { field: "serialNumber", headerName: "S.No", width: 100 },
        { field: "employeename", headerName: "Name", width: 200 },
        { field: "categoryname", headerName: "Category", width: 200 },
        { field: "subcategoryname", headerName: "Sub Category", width: 200 },
        { field: "themename", headerName: "Theme Name", width: 200 },
        { field: "company", headerName: "Company", width: 200 },
        { field: "branch", headerName: "Branch", width: 200 },
        { field: "unit", headerName: "Unit", width: 200 },
        { field: "team", headerName: "Team", width: 200 },
        {
            field: "actions",
            headerName: "Actions",
            renderCell: (params) => (
                <div>
                    <Button
                        startIcon={<RemoveRedEyeIcon />}
                        variant="contained"
                        color="primary"
                        onClick={() => renderFilePreview(params?.row?.imagebase64)}
                        sx={{ background: 'linear-gradient(90deg, rgba(0,86,168,1) 0%, rgba(138,243,255,1) 100%)' }}
                    >
                        Preview
                    </Button>


                </div>
            ),
            width: 150,
            sortable: false,
        },
    ];

    const renderFilePreview = async (file) => {
        const response = await fetch(file);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        window.open(link, "_blank");
    };

    const handleFilter = async () => {
        if (valueCompanyCat.length === 0) {
            setPopupContentMalert("Please Select Company!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
            return;
        }
        let filteredDatas = posterGeneratesOverall.filter((entry) => {
            let company = valueCompanyCat.length > 0 ? valueCompanyCat : null;
            let branch = valueBranchCat.length > 0 ? valueBranchCat : null;
            let unit = valueUnitCat.length > 0 ? valueUnitCat : null;
            let team = valueTeamCat.length > 0 ? valueTeamCat : null;
            let employeename = valueEmployeeCat.length > 0 ? valueEmployeeCat : null;

            const hasIntersection = (selectedValues, entryValues) => {
                if (!selectedValues) return true; // No filter applied
                return entryValues.some(value => selectedValues.includes(value));
            };

            return (
                hasIntersection(company, entry.company) &&
                hasIntersection(branch, entry.branch) &&
                hasIntersection(unit, entry.unit) &&
                hasIntersection(team, entry.team) &&
                hasIntersection(employeename, entry.employeename)
            );
        });

        setPosterGenerates(filteredDatas);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!interval || interval === "") {
            setPopupContentMalert("Please Enter Interval!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (images?.length === 0) {
            setPopupContentMalert("Please Select Images!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {

            setLoading(true);
            setProgress(0);
            setDownloadComplete(false);

            const formData = new FormData();
            for (let i = 0; i < images.length; i++) {
                formData.append('images', images[i]);
            }
            formData.append('interval', interval);

            if (audioFile) {
                formData.append('images', audioFile);
            }

            try {
                const currentDate = new Date();
                // Format the date as DD-MM-YY
                const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear().toString().slice(-2)}`;

                // Format the time as HH:MM:SS-AM/PM
                const hours = currentDate.getHours();
                const minutes = currentDate.getMinutes().toString().padStart(2, '0');
                const seconds = currentDate.getSeconds().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedTime = `${(hours % 12 || 12).toString().padStart(2, '0')}:${minutes}:${seconds}-${ampm}`;
                console.time("time")
                const response = await axios.post(SERVICE.SCREENSAVERCREATION, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onDownloadProgress: (progressEvent) => {
                        const total = progressEvent.total || 1;
                        const currentProgress = Math.round((progressEvent.loaded / total) * 100);
                        setProgress(currentProgress);
                    }
                });
                const base64File = response?.data?.base64File;
                setRequestId(response.data.requestId);
                // Create a blob from the base64 file and download it
                const blob = new Blob([new Uint8Array(atob(base64File).split("").map(char => char.charCodeAt(0)))], { type: 'application/x-msdownload' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${isUserRoleAccess?.companyname}_${formattedDate}_${formattedTime}.scr`; // Define the desired file name
                link.click();

                setDownloadComplete(true);
                setImages([]);
                setRequestId(null);
                setAudioFile(null);
                setInterval('');
            } catch (error) {
                console.log(error)
                handleApiError(error, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
            } finally {
                console.timeEnd("time");
                setLoading(false);
            }
        }
    };

    const handleclear = () => {
        setValueCompanyCat([]);
        setSelectedOptionsCompany([]);
        setValueBranchCat([]);
        setSelectedOptionsBranch([]);
        setValueUnitCat([]);
        setSelectedOptionsUnit([]);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);

        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
        setSelectedOptionsEmployee([]);
    };

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10, // Default rows per page
    });

    useEffect(() => {
        if (requestId) {
            const intervalId = setInterval(async () => {
                try {
                    const response = await axios.get(`${SERVICE.SCREENSAVERPROGRESS}/${requestId}`);
                    setProgress(response.data.progress);
                    if (response.data.progress >= 100) {
                        clearInterval(intervalId); // Stop polling when complete
                    }
                } catch (error) {
                    console.error("Error fetching progress:", error);
                }
            }, 1000);

            return () => clearInterval(intervalId); // Clean up on component unmount
        }
    }, [requestId]);

    return (
        <Container maxWidth="md" sx={{ marginTop: '50px' }}>
            <Card variant="outlined" sx={{ padding: '20px' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Create Screensaver
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <Grid container spacing={2} >
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Interval (in seconds)"
                                        type="number"
                                        variant="outlined"
                                        value={interval}
                                        onChange={handleIntervalChange}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>


                            {/* Image Box */}
                            <Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: '10px', marginBottom: '20px', height: "300px", overflowY: "auto", }}>
                                <Typography variant="subtitle1" sx={{ marginBottom: '10px' }}>
                                    Added Images:
                                </Typography>
                                <List>
                                    {images.map((image, index) => (
                                        <ListItem key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={image.name}
                                                        style={{ width: '60px', height: '60px', borderRadius: '4px' }}
                                                    />
                                                </Grid>
                                                <Grid item xs>
                                                    <ListItemText primary={image.name} />
                                                </Grid>
                                                <Grid item>
                                                    <IconButton sx={{ color: '#fff', backgroundColor: '#11998e' }} onClick={() => handleMoveUp(index)} disabled={index === 0}>
                                                        <ArrowUpwardIcon />
                                                    </IconButton>
                                                    <IconButton sx={{ color: '#fff', backgroundColor: '#e5008d' }} onClick={() => handleMoveDown(index)} disabled={index === images.length - 1}>
                                                        <ArrowDownwardIcon />
                                                    </IconButton>
                                                    <IconButton sx={{ color: '#ff070b' }} onClick={() => handleRemoveImage(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            {/* Image Management Buttons */}
                            <Box >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={2.5}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<UploadFileIcon />}
                                            sx={{ mb: 1, fontSize: "0.7rem" }}
                                        >
                                            Add Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleImageChange}
                                            />
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<UploadFileIcon />}
                                            sx={{ mb: 1, fontSize: "0.7rem" }}
                                        >
                                            Add All
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                hidden
                                                onChange={handleAddAllImages}
                                            />
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleRemoveAllImages}
                                            sx={{ mb: 1, fontSize: "0.7rem" }}
                                        >
                                            Remove All
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} md={2.5}>
                                        <Button
                                            variant="contained"
                                            component="label"
                                            startIcon={<UploadFileIcon />}
                                            sx={{ mb: 1, fontSize: "0.7rem" }}
                                            onClick={handleOpen}
                                        >
                                            From Poster

                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Button
                                            variant="contained"
                                            component="label"
                                            startIcon={<UploadFileIcon />}
                                            sx={{ mb: 1, fontSize: "0.7rem" }}
                                            onClick={handleOpenGenerate}
                                        >
                                            Generate Poster

                                        </Button>
                                    </Grid>

                                    <Grid item xs={12} md={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={loading}
                                            fullWidth
                                            sx={{ fontSize: "0.7rem", width: '200px' }}
                                        >
                                            {loading ? 'Creating Screensaver...' : 'Create Screensaver'}
                                        </Button>
                                    </Grid>

                                </Grid>



                            </Box>

                            {/* Audio Selection */}




                            {loading && (
                                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                                    <CircularProgress color="secondary" />
                                    <Typography variant="subtitle1" sx={{ ml: 2 }}>Processing...</Typography>
                                </Box>
                            )}

                            {downloadComplete && (
                                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2, color: 'green' }}>
                                    <CheckCircleOutlineIcon />
                                    <Typography variant="subtitle1" sx={{ ml: 1 }}>Download Complete!</Typography>
                                </Box>
                            )}

                            {requestId && (
                                <Box mt={2}>
                                    <LinearProgress variant="determinate" value={progress} />
                                    <Typography variant="body2" color="textSecondary" align="center">
                                        {progress}% completed
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </form>
                </CardContent>
            </Card>
            <MessageAlert
                openPopup={openPopupMalert}
                handleClosePopup={handleClosePopupMalert}
                popupContent={popupContentMalert}
                popupSeverity={popupSeverityMalert}
            />

            {/* MUI Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg" sx={{
                marginTop: '100px',
                '& .MuiPaper-root': {
                    maxHeight: '80vh', // Increased height
                    overflow: 'auto', // Enable scroll if content exceeds max height
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}>
                <DialogTitle>Select Items</DialogTitle>
                <Box sx={{ padding: "20px 30px" }} >
                    <Grid container spacing={2}>
                        <Grid item md={2} xs={12} sm={12}>
                            <Typography>
                                Company<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <FormControl size="small" fullWidth>
                                <MultiSelect
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
                                    value={selectedOptionsCompany}
                                    onChange={(e) => {
                                        handleCompanyChange(e);
                                    }}
                                    valueRenderer={customValueRendererCompany}
                                    labelledBy="Please Select Company"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={2} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    {" "}
                                    Branch
                                </Typography>
                                <MultiSelect
                                    options={accessbranch
                                        ?.filter((comp) =>
                                            valueCompanyCat?.includes(comp.company)
                                        )
                                        ?.map((data) => ({
                                            label: data.branch,
                                            value: data.branch,
                                        }))
                                        .filter((item, index, self) => {
                                            return (
                                                self.findIndex(
                                                    (i) =>
                                                        i.label === item.label &&
                                                        i.value === item.value
                                                ) === index
                                            );
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
                        <Grid item md={2} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    {" "}
                                    Unit
                                </Typography>
                                <MultiSelect
                                    options={accessbranch
                                        ?.filter(
                                            (comp) =>
                                                valueCompanyCat?.includes(comp.company) &&
                                                valueBranchCat?.includes(comp.branch)
                                        )
                                        ?.map((data) => ({
                                            label: data.unit,
                                            value: data.unit,
                                        }))
                                        .filter((item, index, self) => {
                                            return (
                                                self.findIndex(
                                                    (i) =>
                                                        i.label === item.label &&
                                                        i.value === item.value
                                                ) === index
                                            );
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
                        <Grid item md={2} xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Team
                                </Typography>
                                <MultiSelect
                                    options={allTeam
                                        ?.filter(
                                            (u) =>
                                                valueCompanyCat?.includes(u.company) &&
                                                valueBranchCat?.includes(u.branch) &&
                                                valueUnitCat?.includes(u.unit)
                                        )
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
                        <Grid item md={2} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                                <Typography>
                                    Employee
                                </Typography>
                                <MultiSelect
                                    options={allUsersData
                                        ?.filter(
                                            (u) =>
                                                valueCompanyCat?.includes(u.company) &&
                                                valueBranchCat?.includes(u.branch) &&
                                                valueUnitCat?.includes(u.unit) &&
                                                valueTeamCat?.includes(u.team)
                                        )
                                        .map((u) => ({
                                            label: u.companyname,
                                            value: u.companyname,
                                        }))}
                                    value={selectedOptionsEmployee}
                                    onChange={(e) => {
                                        handleEmployeeChange(e);
                                    }}
                                    valueRenderer={customValueRendererEmployee}
                                    labelledBy="Please Select Employee"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item md={2} xs={12} sm={6}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignContent: "end",
                                alignItems: "end"
                            }}>
                            <Grid>
                                <LoadingButton
                                    loading={btnLoading}
                                    sx={buttonStyles.buttonsubmit}
                                    onClick={handleFilter}
                                >
                                    Filter
                                </LoadingButton>
                                &nbsp;
                                &nbsp;
                                <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                                    {" "}
                                    Clear{" "}
                                </Button>
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>

                {/* Search Box */}
                <Box sx={{ p: 2 }}>
                    <FormControl fullWidth size="small">
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Search
                        </Typography>
                        <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for items..."
                        />
                    </FormControl>
                </Box>

                {/* DataGrid */}
                <DialogContent sx={{ p: 2, flexGrow: 1 }}>
                    <DataGrid
                        rows={rowDataTable}
                        columns={columns}
                        disableSelectionOnClick
                        onRowSelectionModelChange={handleRowSelection} // Handles row selection
                        autoHeight
                        pagination
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel} // Updates pagination state
                        pageSizeOptions={[10, 20, 50]} // Options for rows per page
                        loading={loadingNew} // Show loader while data is being fetched
                    />
                </DialogContent>

                {/* Dialog Actions */}
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">Cancel</Button>
                    <Button variant="contained" onClick={(e) => {
                        handleAddSelectedImages();
                    }} sx={{ background: 'linear-gradient(90deg, rgba(37,123,196,1) 0%, rgba(24,65,111,1) 100%)' }}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openGenerate} onClose={handleCloseGenerate} fullWidth maxWidth="lg" aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description" sx={{
                    marginTop: '50px', overflow: 'visible',
                    '& .MuiPaper-root': {
                        overflow: 'visible',
                    },
                }}>

                {/* DataGrid */}
                <DialogContent sx={{ p: 2 }}>
                    <PosgenerateDialog handleCloseGenerate={handleCloseGenerate} fetchPosters={fetchPosters} />
                </DialogContent>

                {/* Dialog Actions */}
                <DialogActions>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default ScreensaverForm;
