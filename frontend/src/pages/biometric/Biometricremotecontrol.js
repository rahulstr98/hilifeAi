import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    Box, Button, Dialog,
    DialogActions, DialogContent, FormControl, DialogTitle,
    Grid,
    OutlinedInput,
    Typography,
    Switch,
    Paper
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Selects from "react-select";
import { handleApiError } from "../../components/Errorhandling.js";
import Headtitle from "../../components/Headtitle.js";
import MessageAlert from "../../components/MessageAlert.js";
import PageHeading from "../../components/PageHeading.js";
import { AuthContext, UserRoleAccessContext } from '../../context/Appcontext.js';
import { userStyle, colourStyles } from "../../pageStyle.js";
import { SERVICE } from '../../services/Baseservice.js';

import DoorFrontIcon from '@mui/icons-material/DoorFront';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';


function BiometricRemoteControl() {
    const [biometricDeviceManagement, setBiometricDeviceManagement] = useState({
        company: "Please Select Company",
        branch: "Please Select Branch",
        unit: "Please Select Unit",
        floor: "Please Select Floor",
        area: "Please Select Area",
        branchcode: "",
        unitcode: "",
        floorcode: "",
        biometricserialno: "",
        biometricassignedip: "",
        brandname: "Please Select Brand Name", model: "Please Select Model",
        biometricdeviceid: "Please Select Biometric Device ID",
        devicetype: "Please Select Device Type",
        mode: "Please Select Mode",
    });

    const [deviceOnlineStatus, setDeviceOnlineStatus] = useState("");


    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");

    const [model, setModel] = useState([])
    const [biometricidOpt, setBiometricidOpt] = useState([])
    const [brandName, setBrandName] = useState([])
    const [biometricBrandOpt, setBiometricBrandOpt] = useState([])
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
    };
    const handleClosePopupMalert = () => {
        setOpenPopupMalert(false);
    };
    const brandButtonAccess = {
        Brand1: ["remotecontrol", "maintenance", "dooropen", "restart", "deletuserinfo", "reset", "deletealllogs"],
        Brand2: ["remotecontrol", "maintenance", "dooropen", "restart", "reset", "deletuserinfo", "deletealllogs"],
        Brand3: ["remotecontrol", "maintenance", "dooropen", "restart", "shutdown", "reset", "deletuserinfo"],
        Bowee: ["remotecontrol", "unlock", "maintenance", "turnoffalarm", "firealarm", "alarm", "doornormalopen", "remotedoorclosing", "remotelocking", "dooropen", "restart", "reset"],
    };

    const allowedActions = brandButtonAccess[biometricDeviceManagement.brandname] || [];
    console.log(biometricDeviceManagement.brandname, "biometricDeviceManagement.brandname")

    const { isUserRoleCompare, allareagrouping, isAssignBranch, allfloor, pageName, setPageName, isUserRoleAccess } = useContext(UserRoleAccessContext);
    const accessbranch = isUserRoleAccess?.role?.includes("Manager")
        ? isAssignBranch?.map((data) => ({
            branch: data.branch,
            company: data.company,
            unit: data.unit,
            branchcode: data.branchcode,
            unitcode: data.unitcode,
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
                branchcode: data.branchcode,
                unitcode: data.unitcode,
            }));


    const filteredAreas = allareagrouping.filter(area =>

        accessbranch.some(access =>
            access.company === area.company &&
            access.branch === area.branch &&
            access.unit === area.unit
        )
    );

    // Button Code popup functionality
    const [openDialog, setOpenDialog] = useState(false);

    const handleRemoteDoorOpen = () => {
        // Do your operation here
        setOpenDialog(true); // Show popup
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };
    const handleDeviceStatus = async (e) => {
        try {

            let response = await axios.post(SERVICE.BIOMETRIC_PARTICULAR_DEVICE_STATUS, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                cloudIDC: e,
                date: new Date()
            });
            console.log(response?.data)
            setDeviceOnlineStatus(response?.data?.deviceonlinestatus)







        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

    }
    const handleClickOpenSettings = async (e) => {
        try {
            if (e) {
                let response = await axios.post(SERVICE.BIOMETRIC_COMMAND_EXECUTION, {
                    headers: {
                        'Authorization': `Bearer ${auth.APIToken}`
                    },
                    biometricDeviceManagement: biometricDeviceManagement,
                    command: e
                });
                handleRemoteDoorOpen();
            }

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

    }


    // get all branches
    const fetchBranddropdown = async (area) => {
        setPageName(!pageName);

        try {
            // let res_branch = await axios.get(SERVICE.ALLBIOMETRICBRANDMODEL, {
            let res_branch = await axios.get(SERVICE.ALL_BIOMETRICDEVICEMANAGEMENT, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
console.log(res_branch?.data?.biometricdevicemanagement , "res_branch?.data?.biometricdevicemanagement")
            setBrandName(
                // res_branch?.data?.allbiometricbrandmodel
                res_branch?.data?.biometricdevicemanagement?.filter(data =>
                    data?.company === biometricDeviceManagement?.company &&
                    data?.branch === biometricDeviceManagement?.branch &&
                    data?.unit === biometricDeviceManagement?.unit &&
                    data?.floor === biometricDeviceManagement?.floor &&
                    data?.area === area)?.map((item) => ({
                        label: item?.brand,
                        value: item?.brand,
                    }))
                    ?.filter((item, index, self) =>
                        index === self.findIndex((t) => (
                            t.value === item.value
                        ))
                    )
            )
            setBiometricBrandOpt(res_branch?.data?.biometricdevicemanagement?.filter(data => data?.company === biometricDeviceManagement?.company &&
                data?.branch === biometricDeviceManagement?.branch &&
                data?.unit === biometricDeviceManagement?.unit &&
                data?.floor === biometricDeviceManagement?.floor &&
                data?.area === area))
        } catch (err) {
            // setIsCompany(true);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const { auth } = useContext(AuthContext);
    // page refersh reload code
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ''; // This is required for Chrome support
    };

    useEffect(
        () => {
            const beforeUnloadHandler = (event) => handleBeforeUnload(event);
            window.addEventListener('beforeunload', beforeUnloadHandler);
            return () => {
                window.removeEventListener('beforeunload', beforeUnloadHandler);
            };
        }, []);

    return (
        <Box>
            <Headtitle title={'Biometric Remote Control'} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="Biometric Remote Control"
                modulename="Production"
                submodulename="SetUp"
                mainpagename="Ac-Point Calculation"
                subpagename=""
                subsubpagename=""
            />
            {isUserRoleCompare?.includes("abiometricremotecontrol")
                && (
                    <>

                        <Box sx={userStyle.dialogbox}>
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <Typography sx={userStyle.importheadtext}>Add Biometric Remote Control</Typography>
                                    </Grid>
                                </Grid><br />
                                <Grid container spacing={2}>

                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Company <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={accessbranch.map((data) => ({
                                                    label: data.company,
                                                    value: data.company,
                                                })).filter((item, index, self) => {
                                                    return (
                                                        self.findIndex(
                                                            (i) =>
                                                                i.label === item.label &&
                                                                i.value === item.value
                                                        ) === index
                                                    );
                                                })}
                                                styles={colourStyles}
                                                value={{
                                                    label: biometricDeviceManagement.company,
                                                    value: biometricDeviceManagement.company,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDeviceManagement({
                                                        ...biometricDeviceManagement,
                                                        company: e.value,
                                                        branchcode: "",
                                                        unitcode: "",
                                                        floorcode: "",
                                                        branch: "Please Select Branch",
                                                        unit: "Please Select Unit",
                                                        floor: "Please Select Floor",
                                                        area: "Please Select Area",
                                                        biometricserialno: "",
                                                        biometricassignedip: "",
                                                        brandname: "Please Select Brand Name", model: "Please Select Model",
                                                        biometricdeviceid: "Please Select Biometric Device ID",
                                                        devicetype: "Please Select Device Type",
                                                        mode: "Please Select Mode",
                                                    });
                                                    setBrandName([])
                                                    setModel([])
                                                    setBiometricidOpt([])
                                                    setBiometricBrandOpt([])
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Branch<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={accessbranch?.filter((comp) =>
                                                    comp.company === biometricDeviceManagement?.company
                                                ).map((data) => ({
                                                    label: data.branch,
                                                    value: data.branch,
                                                    branchcode: data.branchcode,
                                                })).filter((item, index, self) => {
                                                    return (
                                                        self.findIndex(
                                                            (i) =>
                                                                i.label === item.label &&
                                                                i.value === item.value
                                                        ) === index
                                                    );
                                                })}
                                                styles={colourStyles}
                                                value={{
                                                    label: biometricDeviceManagement.branch,
                                                    value: biometricDeviceManagement.branch,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDeviceManagement({
                                                        ...biometricDeviceManagement,
                                                        branch: e.value,
                                                        branchcode: e.branchcode,
                                                        unitcode: "",
                                                        floorcode: "",
                                                        unit: "Please Select Unit",
                                                        floor: "Please Select Floor",
                                                        area: "Please Select Area",

                                                        biometricserialno: "",
                                                        biometricassignedip: "",
                                                        brandname: "Please Select Brand Name", model: "Please Select Model",
                                                        biometricdeviceid: "Please Select Biometric Device ID",
                                                        devicetype: "Please Select Device Type",
                                                        mode: "Please Select Mode",
                                                    });
                                                    setBrandName([])
                                                    setModel([])
                                                    setBiometricBrandOpt([])
                                                    setBiometricidOpt([])
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Unit<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={accessbranch?.filter((comp) =>
                                                    comp.company === biometricDeviceManagement?.company
                                                    && comp.branch === biometricDeviceManagement?.branch
                                                ).map((data) => ({
                                                    label: data.unit,
                                                    value: data.unit,
                                                    unitcode: data.unitcode,
                                                })).filter((item, index, self) => {
                                                    return (
                                                        self.findIndex(
                                                            (i) =>
                                                                i.label === item.label &&
                                                                i.value === item.value
                                                        ) === index
                                                    );
                                                })}
                                                styles={colourStyles}
                                                value={{
                                                    label: biometricDeviceManagement.unit,
                                                    value: biometricDeviceManagement.unit,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDeviceManagement({
                                                        ...biometricDeviceManagement,
                                                        unit: e.value,
                                                        unitcode: e.unitcode,

                                                        biometricserialno: "",
                                                        biometricassignedip: "",
                                                        brandname: "Please Select Brand Name", model: "Please Select Model",
                                                        biometricdeviceid: "Please Select Biometric Device ID",
                                                        devicetype: "Please Select Device Type",
                                                        mode: "Please Select Mode",
                                                    });
                                                    setBrandName([])
                                                    setBiometricidOpt([])
                                                    setModel([])
                                                    setBiometricBrandOpt([])
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Floor<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={allfloor
                                                    ?.filter((u) =>
                                                        biometricDeviceManagement?.branch === u.branch
                                                    )
                                                    .map((u) => ({
                                                        ...u,
                                                        label: u.name,
                                                        value: u.name,
                                                    })).filter((item, index, self) => {
                                                        return (
                                                            self.findIndex(
                                                                (i) =>
                                                                    i.label === item.label &&
                                                                    i.value === item.value
                                                            ) === index
                                                        );
                                                    })}
                                                styles={colourStyles}
                                                value={{
                                                    label: biometricDeviceManagement.floor,
                                                    value: biometricDeviceManagement.floor,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDeviceManagement({
                                                        ...biometricDeviceManagement,
                                                        floor: e.value,
                                                        floorcode: e.code,
                                                        area: "Please Select Area",
                                                        biometricserialno: "",
                                                        biometricassignedip: "",
                                                        brandname: "Please Select Brand Name", model: "Please Select Model",
                                                        biometricdeviceid: "Please Select Biometric Device ID",
                                                        devicetype: "Please Select Device Type",
                                                        mode: "Please Select Mode",
                                                    });
                                                    setBrandName([])
                                                    setModel([])
                                                    setBiometricidOpt([])
                                                    setBiometricBrandOpt([])

                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Area<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                maxMenuHeight={300}
                                                options={
                                                    filteredAreas
                                                        .filter(
                                                            (item) =>
                                                                biometricDeviceManagement?.floor === item.floor && biometricDeviceManagement?.branch === item.branch)
                                                        .flatMap((item) => item.area).map((location) => ({
                                                            label: location,
                                                            value: location,
                                                        }))}
                                                placeholder="Please Select Area"
                                                value={{
                                                    label: biometricDeviceManagement.area,
                                                    value: biometricDeviceManagement.area,
                                                }}
                                                onChange={(e) => {

                                                    setBiometricDeviceManagement({
                                                        ...biometricDeviceManagement,
                                                        area: e.value,
                                                        biometricserialno: "",
                                                        biometricassignedip: "",
                                                        brandname: "Please Select Brand Name", model: "Please Select Model",
                                                        biometricdeviceid: "Please Select Biometric Device ID",
                                                        devicetype: "Please Select Device Type",
                                                        mode: "Please Select Mode",
                                                    });
                                                    fetchBranddropdown(e.value)
                                                }}
                                            />

                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Brand Name<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={brandName}
                                                value={{ label: biometricDeviceManagement.brandname, value: biometricDeviceManagement.brandname }}
                                                onChange={(e) => {
                                                    setBiometricDeviceManagement({
                                                        ...biometricDeviceManagement,
                                                        brandname: e.value,
                                                        model: "Please Select Model",
                                                        biometricserialno: "",
                                                        biometricassignedip: "",
                                                        biometricdeviceid: "Please Select Biometric Device ID",
                                                    });
                                                    setModel(
                                                        biometricBrandOpt
                                                            ?.filter((item) => item?.brand === e.value)
                                                            ?.map((item) => ({
                                                                label: item?.model,
                                                                value: item?.model,
                                                            }))
                                                            ?.filter((item, index, self) =>
                                                                index === self.findIndex((t) => t.value === item.value)
                                                            )
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Model<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={model}
                                                value={{ label: biometricDeviceManagement.model, value: biometricDeviceManagement.model }}
                                                onChange={(e) => {
                                                    setBiometricDeviceManagement({
                                                        ...biometricDeviceManagement, model: e.value,
                                                        biometricdeviceid: "Please Select Biometric Device ID"
                                                    });
                                                    setBiometricidOpt(
                                                        biometricBrandOpt
                                                            ?.filter((item) => item?.brand && item.model === e.value)
                                                            ?.map((item) => ({
                                                                label: item?.biometricdeviceid,
                                                                value: item?.biometricdeviceid,
                                                                biometricserialno: item?.biometricserialno,
                                                                _id: item?._id
                                                            }))
                                                            ?.filter((item, index, self) =>
                                                                index === self.findIndex((t) => t.value === item.value)
                                                            )
                                                    );
                                                }}

                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Biometric Device ID<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={biometricidOpt}
                                                value={{ label: biometricDeviceManagement.biometricdeviceid, value: biometricDeviceManagement.biometricdeviceid }}
                                                onChange={(e) => {
                                                    setBiometricDeviceManagement({ ...biometricDeviceManagement, biometricdeviceid: e.value, biometricserialno: e?.biometricserialno });
                                                    handleDeviceStatus(e?.biometricserialno)
                                                    // vendorid(e._id);
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Biometric Serial No <b style={{ color: "red" }}>*</b></Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                value={biometricDeviceManagement?.biometricserialno}

                                            />
                                        </FormControl>
                                    </Grid>


                                    {deviceOnlineStatus && <Grid item md={3} xs={12} sm={12}>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Device Status
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ color: deviceOnlineStatus === 'Active' ? 'green' : 'red' }}
                                                >
                                                    {deviceOnlineStatus === 'Active' ? 'Online' : 'Offline'}
                                                </Typography>
                                                <Switch
                                                    checked={deviceOnlineStatus === 'Active'}
                                                    color="success"
                                                    disabled
                                                    size="medium"
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>}

                                </Grid>
                                <br />
                                <br />

                                {/* This is button starting */}

                                {/* {biometricDeviceManagement.biometricdeviceid && ( */}
                                {biometricDeviceManagement.biometricdeviceid !== "Please Select Biometric Device ID" && deviceOnlineStatus === "Active" && (
                                    <>
                                        {/* Remote Control Section */}
                                        {allowedActions.includes("remotecontrol") && (
                                            <Grid container spacing={3}>
                                                <Grid item md={12} xs={12} sm={12}>
                                                    <Typography sx={userStyle.HeaderText}>Remote Control</Typography>
                                                </Grid>
                                                {allowedActions.includes("dooropen") && (
                                                    <Grid item md={2.5} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Door Open")}
                                                            sx={{
                                                                backgroundColor: '#009688',
                                                                color: '#fff',
                                                                '&:hover': { backgroundColor: '#00796b' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<DoorFrontIcon />}
                                                        >
                                                            Remote Door Opening
                                                        </Button>
                                                    </Grid>)}

                                                {allowedActions.includes("doornormalopen") && (
                                                    <Grid item md={2.5} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Remote Normal Open")}
                                                            sx={{
                                                                backgroundColor: '#009688',
                                                                color: '#fff',
                                                                '&:hover': { backgroundColor: '#00796b' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<DoorSlidingIcon />}
                                                        >
                                                            Remote Normal Open
                                                        </Button>
                                                    </Grid>)}

                                                {allowedActions.includes("remotedoorclosing") && (
                                                    <Grid item md={2.5} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Remote Door Closing")}
                                                            sx={{
                                                                backgroundColor: '#009688',
                                                                color: '#fff',
                                                                '&:hover': { backgroundColor: '#00796b' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<DoorSlidingIcon />}
                                                        >
                                                            Remote Door Closing
                                                        </Button>
                                                    </Grid>)}
                                                {allowedActions.includes("remotelocking") && (
                                                    <Grid item md={2.5} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Remote Locking")}
                                                            sx={{
                                                                backgroundColor: '#009688',
                                                                color: '#fff',
                                                                '&:hover': { backgroundColor: '#00796b' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<LockIcon />}
                                                        >
                                                            Remote Locking
                                                        </Button>
                                                    </Grid>
                                                )}
                                                {allowedActions.includes("unlock") && (
                                                    <Grid item md={2} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Unlock")}
                                                            sx={{
                                                                backgroundColor: '#009688',
                                                                color: '#fff',
                                                                '&:hover': { backgroundColor: '#00796b' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<LockOpenIcon />}
                                                        >
                                                            Unlock
                                                        </Button>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        )}

                                        <br /><br />

                                        {/* Alarm Section */}
                                        {allowedActions.includes("alarm") && (
                                            <Grid container spacing={3}>
                                                <Grid item md={12} xs={12} sm={12}>
                                                    <Typography sx={userStyle.HeaderText}>Alarm</Typography>
                                                </Grid>
                                                {allowedActions.includes("firealarm") && (
                                                    <Grid item md={3} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Fire Alarm")}
                                                            sx={{
                                                                backgroundColor: '#f44336',
                                                                color: '#fff',
                                                                '&:hover': { backgroundColor: '#d32f2f' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<NotificationsActiveIcon />}
                                                        >
                                                            Fire Alarm
                                                        </Button>
                                                    </Grid>
                                                )}
                                                {allowedActions.includes("turnoffalarm") && (<Grid item md={3} sm={12} xs={12}>
                                                    <Button
                                                        onClick={() => handleClickOpenSettings("Turn Off Alarm")}
                                                        sx={{
                                                            backgroundColor: '#009688',
                                                            color: '#fff',
                                                            '&:hover': { backgroundColor: '#00796b' },
                                                            textTransform: 'none',
                                                            width: '100%',
                                                        }}
                                                        startIcon={<NotificationsOffIcon />}
                                                    >
                                                        Turn Off Alarm
                                                    </Button>
                                                </Grid>
                                                )}
                                            </Grid>)}
                                        <br /><br />
                                        {/* Equipment Maintenance Section */}
                                        {allowedActions.includes("maintenance") && (
                                            <Grid container spacing={3}>
                                                <Grid item md={12} xs={12} sm={12}>
                                                    <Typography sx={userStyle.HeaderText}>Equipment Maintenance</Typography>
                                                </Grid>

                                                {allowedActions.includes("restart") && (
                                                    <Grid item md={3} sm={12} xs={12}>
                                                        <Button

                                                            sx={{
                                                                backgroundColor: '#ffc107',
                                                                color: '#000',
                                                                '&:hover': { backgroundColor: '#ffb300' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            onClick={() => handleClickOpenSettings("Device Restart")}
                                                            startIcon={<RestartAltIcon />}
                                                        >
                                                            Device Restart
                                                        </Button>
                                                    </Grid>
                                                )}
                                                {allowedActions.includes("shutdown") && (
                                                    <Grid item md={3} sm={12} xs={12}>
                                                        <Button
                                                            sx={{
                                                                backgroundColor: '#ffc107',
                                                                color: '#000',
                                                                '&:hover': { backgroundColor: '#ffb300' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            onClick={() => handleClickOpenSettings("Shutdown")}
                                                            startIcon={<PowerSettingsNewIcon />}
                                                        >
                                                            Device ShutDown
                                                        </Button>
                                                    </Grid>
                                                )}
                                                {allowedActions.includes("deletuserinfo") && (
                                                    <Grid item md={3} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Delete User Records")}
                                                            sx={{
                                                                backgroundColor: '#ffc107',
                                                                color: '#000',
                                                                '&:hover': { backgroundColor: '#ffb300' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<PersonRemoveIcon />}
                                                        >
                                                            Delete User Records
                                                        </Button>
                                                    </Grid>
                                                )}
                                                {allowedActions.includes("deletealllogs") && (
                                                    <Grid item md={3} sm={12} xs={12}>
                                                        <Button
                                                            onClick={() => handleClickOpenSettings("Delete All Logs")}
                                                            sx={{
                                                                backgroundColor: '#ffc107',
                                                                color: '#000',
                                                                '&:hover': { backgroundColor: '#ffb300' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<RestoreFromTrashIcon />}
                                                        >
                                                            Delete All Logs
                                                        </Button>
                                                    </Grid>
                                                )}
                                                {allowedActions.includes("reset") && (
                                                    <Grid item md={3} sm={12} xs={12}>
                                                        <Button
                                                            sx={{
                                                                backgroundColor: '#f44336',
                                                                color: '#fff',
                                                                '&:hover': { backgroundColor: '#d32f2f' },
                                                                textTransform: 'none',
                                                                width: '100%',
                                                            }}
                                                            startIcon={<SettingsBackupRestoreIcon />}
                                                            onClick={() => handleClickOpenSettings("Device Reset")}
                                                        >
                                                            Restore Factory
                                                        </Button>
                                                    </Grid>
                                                )}
                                            </Grid>)}


                                        <br /><br />
                                    </>
                                )}
                                {/* This is button ending */}


                            </>
                        </Box>
                    </>
                )}

            {/* Dialog Popup for button click */}
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: 8,
                        p: 2,
                        minWidth: 350,
                    },
                }}
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ color: 'green', fontSize: 60 }} />
                </DialogTitle>

                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Operation Successful!
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Your action has been completed successfully.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                        onClick={handleDialogClose}
                        variant="contained"
                        color="success"
                        sx={{ px: 4, borderRadius: 3 }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            {/* EXTERNAL COMPONENTS -------------- START */}
            {/* VALIDATION */}
            <MessageAlert
                openPopup={openPopupMalert}
                handleClosePopup={handleClosePopupMalert}
                popupContent={popupContentMalert}
                popupSeverity={popupSeverityMalert}
            />
        </Box>
    );
}

export default BiometricRemoteControl;