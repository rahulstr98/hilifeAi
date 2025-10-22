import React, { useState, useContext } from "react";
import axios from "axios";
import { Grid,  Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,TableRow,
    Paper,FormControl, Typography, OutlinedInput, IconButton, Button, Box } from "@mui/material";
import { UserRoleAccessContext } from "../../../context/Appcontext";
import LoadingButton from "@mui/lab/LoadingButton";
import { Visibility, Delete } from '@mui/icons-material';
import CheckCircle from "@mui/icons-material/CheckCircle";
import Selects from "react-select"; // Ensure you have react-select installed
import imageCompression from "browser-image-compression";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

const Loader = ({ loading, message }) => {
    return (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
            <div style={{ textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#edf1f7' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#edf1f7' }}>
                    {message}
                </Typography>
            </div>
        </Backdrop>
    );
};
const BiometricFormdevUser = ({ employee, BiometricDeviceOptions, setEmployee, auth, SERVICE, handleApiError, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert, enableLoginName, third, BiometricPostDevice, setBiometricPostDevice, BioPostCheckDevice, setBioPostCheckDevice, pagename, setUsernameBio, accessbranch }) => {
    const { buttonStyles, allfloor, allTeam, allUsersData, allareagrouping } = useContext(
        UserRoleAccessContext
    );
    const [documentFiles, setdocumentFiles] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Image is compressing...!');
    const handleResumeUpload = (event) => {
        const resume = event.target.files;
        const allowedExtensions = ["png"];
        const file = resume[0];
        const fileExtension = file?.name?.split('.').pop().toLowerCase();
        const preview = URL.createObjectURL(file);
        const maxFileSize = 150 * 1024;

        if (!allowedExtensions.includes(fileExtension)) {
            setPopupContentMalert("Please upload a valid PNG file.");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return;
        }
        if (file.size > maxFileSize) {
            setPopupContentMalert("Image file size must be less than 150 KB.");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {

            const base64String = reader.result.split(",")[1]; // Extract base64
            setdocumentFiles({
                name: file.name,
                preview: preview,
                data: base64String,
            });
        };

    };



    async function handleProfileImage(profileImage, name) {
        if (!profileImage) return;

        let base64Data = profileImage;

        // 1. If it has "data:image/..." prefix, extract only the base64 part
        if (profileImage.includes(",")) {
            base64Data = profileImage.split(",")[1];
        }

        // 2. Convert base64 -> Blob (for compression)
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" }); // adjust type if needed

        // 3. Compress image using browser-image-compression
        const options = {
            maxSizeMB: 0.4, // ~400 KB
            maxWidthOrHeight: 1920, // optional, lower if you want smaller resolution
            useWebWorker: true,
        };

        const compressedBlob = await imageCompression(blob, options);

        // 4. Create preview URL
        const previewUrl = URL.createObjectURL(compressedBlob);

        // 5. Convert compressed Blob back to base64 (if you need to send it to backend)
        const compressedBase64 = await imageCompression.getDataUrlFromFile(compressedBlob);
        const compressedBase64Data = compressedBase64.split(",")[1]; // remove prefix

        // 6. Save in state
        setdocumentFiles({
            name: name,
            preview: previewUrl,
            data: compressedBase64Data, // store compressed base64 data
        });
        setLoading(false)
        console.log(
            "Compressed size (KB):",
            Math.round(compressedBlob.size / 1024)
        );
    }


    const handleEmployeeDocuments = async (id, name) => {
        try {
            let responsenew = await axios.post(
                SERVICE.EMPLOYEEDOCUMENT_SINGLEWITHALLBYCOMMONID,
                {
                    commonid: id,
                }
            );
            const profileImage = responsenew?.data?.semployeedocument?.profileimage ? responsenew?.data?.semployeedocument?.profileimage : "";
            if (profileImage) {
                setLoading(true)
                handleProfileImage(profileImage, "ProfilePhoto");

            }

            console.log(responsenew?.data?.semployeedocument)
        }
        catch (err) {

        }
    }
    const [loadingBiometric, setLoadingBiometric] = useState(false);
    const [BiometricId, setBiometricId] = useState(0);
    const [deviceDetails, setDeviceDetails] = useState("");
        const [deviceUserNameAddedList, setDeviceUserNameAddedList] = useState([]);
    
    // const [BioIndivUserCheck, setBioIndivUserCheck] = useState(false);

    const fetchBioInfoStatus = async (device) => {
        try {

            if (!["Brand1", "Brand2", "Brand3", "Bowee"]?.includes(device.brand)) {
                await axios.post(SERVICE.BIOMETRIC_GET_SEND_COMMAND, {
                    headers: { Authorization: `Bearer ${auth.APIToken}` },
                    deviceCommandN: "2",
                    CloudIDC: device?.value,

                });
            }

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    const handleBiometricActionClick = () => {
        if (!employee?.devicetype || employee?.devicetype === "Please Select Device Type") {
            setPopupContentMalert("Please Select Device Type.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.devicetype === "Location" && (!employee?.devicecompany || employee?.devicecompany === "Please Select Company")) {
            setPopupContentMalert("Please Select Device Company.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.devicetype === "Location" && (!employee?.devicebranch || employee?.devicebranch === "Please Select Branch")) {
            setPopupContentMalert("Please Select Device Branch.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.devicetype === "Location" && (!employee?.deviceunit || employee?.deviceunit === "Please Select Unit")) {
            setPopupContentMalert("Please Select Device Unit.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.devicetype === "Location" && (!employee?.devicefloor || employee?.devicefloor === "Please Select Floor")) {
            setPopupContentMalert("Please Select Device Floor.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.devicetype === "Location" && (!employee?.devicearea || employee?.devicearea === "Please Select Area")) {
            setPopupContentMalert("Please Select Device Area.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (!employee?.biometricdevicename || employee?.biometricdevicename === "Please Select Device") {
            setPopupContentMalert("Please Select Device Name.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }

        else {

            setLoadingBiometric(true);
            if (["Brand1", "Brand2", "Brand3", "Bowee"]?.includes(deviceDetails?.brand)) {
                setLoadingBiometric(false);
                fetchUsersAvailability(deviceDetails, employee?.biometricdevicename);
            } else {
                setTimeout(() => {
                    setLoadingBiometric(false);
                    fetchUsersAvailability(deviceDetails, employee?.biometricdevicename);
                }, 30000);
            }

        }
    };




    const checkBiometricUserDuplicate = async (biometricdevicename, staffNameC) => {
        try {
            const response = await axios.post(
                SERVICE.BIOMETRIC_USER_DUPLICATE_CHECK,
                {
                    cloudIDC: biometricdevicename,
                    staffNameC: String(staffNameC)
                },
                {
                    headers: { Authorization: `Bearer ${auth.APIToken}` }
                }
            );
console.log(response?.data?.individualuser , "response?.data?.individualuser")
            return response?.data?.individualuser;
        } catch (err) {
            console.error("Error in checkBiometricUserDuplicate:", err);
            return false;
        }
    };

    const fetchUsersAvailability = async (device, biometricdevicename) => {
        try {
            if (["Brand1", "Brand2", "Brand3"]?.includes(device.brand)) {
                const [res] = await Promise.all([
                    axios.post(SERVICE.BIOMETRIC_USER_ID_CHECK, {
                        headers: { Authorization: `Bearer ${auth.APIToken}` }, device

                    }),
                ]);
                if (res?.data?.alldeviceinfo) {
                    setBiometricId(Number(res?.data?.alldeviceinfo));
                }
            } else if (device.brand === "Bowee") {
                let bowee = await axios.post(SERVICE.BOWER_BIOMETRIC_NEW_USERID, { biometricdevicename: biometricdevicename }, {
                    headers: { Authorization: `Bearer ${auth.APIToken}` }

                });
                let duplicateCheck = bowee?.data?.NewUserID;
                setBiometricId(duplicateCheck);
            }
            else {
                const [res] = await Promise.all([
                    axios.post(SERVICE.BIOMETRIC_GET_DEVICE_INFO_STATUS, { cloudIDC: biometricdevicename }, { headers: { Authorization: `Bearer ${auth.APIToken}` } }),
                ]);
                if (res?.data?.alldeviceinfo) {
                    setBiometricId(Number(res?.data?.alldeviceinfo));
                }
            }
                        let biolist = await axios.post(SERVICE.BIOUSER_ADDED_LIST_TABLE, {
                            username: enableLoginName ? third : employee.username
                        }, {
                            headers: { Authorization: `Bearer ${auth.APIToken}` }
                        });
                        setDeviceUserNameAddedList(biolist?.data?.alluploaduserinfo)
            

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const handleSubmitBioCheck = async (e) => {
        e.preventDefault();
        const duplicateUserCheck = await checkBiometricUserDuplicate(employee.biometricdevicename, enableLoginName ? String(third) : employee.username,)
        console.log(duplicateUserCheck, "duplicateUserCheck", employee.biometricdevicename, "employee.biometricdevicename", enableLoginName ? String(third) : employee.username, " enableLoginName ? String(third) : employee.username")
        const employeeName = String(third)
        if (!employee.biometricdevicename || employee.biometricdevicename === "Please Select Device") {
            setPopupContentMalert("Please Select Device Name.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        } else if (!BiometricId || BiometricId <= 0) {
            setPopupContentMalert("Check Availability Status to get UserID!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (!employee?.usertype || employee?.usertype === "Please Select User Type") {
            setPopupContentMalert("Please Select User Type.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.usertype === "Existing" && (!employee?.usercompany || employee?.usercompany === "Please Select Company")) {
            setPopupContentMalert("Please Select User Company.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.usertype === "Existing" && (!employee?.userbranch || employee?.userbranch === "Please Select Branch")) {
            setPopupContentMalert("Please Select User Branch.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.usertype === "Existing" && (!employee?.userunit || employee?.userunit === "Please Select Unit")) {
            setPopupContentMalert("Please Select User Unit.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.usertype === "Existing" && (!employee?.userteam || employee?.userteam === "Please Select Team")) {
            setPopupContentMalert("Please Select User Team.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.usertype === "Existing" && (!employee?.biometricname || employee?.biometricname === "Please Select Biometric Name")) {
            setPopupContentMalert("Please Select Biometric Name.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.usertype === "New User" && (!employee?.biometricname || employee?.biometricname === "")) {
            setPopupContentMalert("Please Enter Biometric Name.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (employee?.usertype === "New User" && (!third || third === "")) {
            setPopupContentMalert("Please Enter Biometric User Name.!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (!employee?.biometricrole || employee?.biometricrole === "Please Select Role") {
            setPopupContentMalert("Please Select Biometric User Role!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (deviceDetails?.brand === "Brand1" && employee?.biometricrole === "Administrator" && !documentFiles) {
            setPopupContentMalert("Please Add Face Image");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (deviceDetails?.brand === "Brand3") {
            setPopupContentMalert("Currently Not is Use");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (duplicateUserCheck) {
            setPopupContentMalert("User Already Added");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Bowee"]?.includes(deviceDetails.brand) && !documentFiles) {
            setPopupContentMalert("Please Add Profile Image");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            if (["Brand1", "Brand2", "Brand3"]?.includes(deviceDetails.brand)) {
                handleAddNewBiometricDevices();
            }
            else if (["Bowee"]?.includes(deviceDetails.brand)) {
                handleNewUserAddBowee();
            } else {
                addUserInBioMetric();
            }

            console.log('Success 257')


        }
    };


    const handleNewUserAddBowee = async () => {
        try {


            const PeopleJson = {
                "UserID": String(BiometricId),
                "Name": enableLoginName ? String(third) : employee.username,
                "Job": "Staff",
                "AccessType": employee.biometricrole === "User" ? 0 : employee.biometricrole === "Administrator" ? 1 : 2,
                "OpenTimes": 65535,
                "Photo": documentFiles?.data
            };

            const response = await axios.post(
                SERVICE.BOWER_BIOMETRIC_NEW_USER_ADD,

                {
                    headers: { Authorization: `Bearer ${auth.APIToken}` },
                    PeopleJson: PeopleJson,
                    biometricdevicename: deviceDetails.biometricserialno
                }
            );
            if (response.data?.success) {
                let response = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD, {
                    headers: { Authorization: `Bearer ${auth.APIToken}` },
                    biometricUserIDC: BiometricId,
                    cloudIDC: deviceDetails.biometricserialno,
                    dataupload: "new",
                    downloadedFaceTemplateN: (deviceDetails.brand === "Bowee" && documentFiles?.data) ? 1 : 0,
                    downloadedFingerTemplateN: 0,
                    fingerCountN: 0,
                    isEnabledC: "Yes",
                    isFaceEnrolledC: (deviceDetails.brand === "Bowee" && documentFiles?.data) ? "Yes" : "No",
                    privilegeC: employee.biometricrole,
                    pwdc: "",
                    staffNameC: enableLoginName ? String(third) : employee.username,
                    companyname: employee.biometricname,
                });
            }
            setPopupContentMalert("Biometric Data Added");
            setPopupSeverityMalert("success");
            handleClickOpenPopupMalert();
            setBiometricPostDevice({
                biometricUserIDC: BiometricId,
                cloudIDC: employee.biometricdevicename,
                devicetype: "notboxtel",
            });
            setDeviceDetails("")

            setEmployee((prev) => ({
                ...prev,
                devicetype: "Please Select Device Type",
                devicecompany: "Please Select Company",
                devicebranch: "Please Select Branch",
                deviceunit: "Please Select Unit",
                devicefloor: "Please Select Floor",
                devicearea: "Please Select Area",
                userbranch: "Please Select Branch",
                usercompany: "Please Select Company",
                userunit: "Please Select Unit",
                userteam: "Please Select Team",
                userarea: "Please Select Area",
                biometricdevicename: "Please Select Device",
                biometricrole: "Please Select Role",
                usertype: "Please Select User Type",
                biometricname: "Please Select Biometric Name",
                biometricuserid: "",
            }));

            setBiometricId(0);
            setBioPostCheckDevice(true);
        }
        catch (err) {
            console.log(err, "Err")
            if (!err?.response?.data?.success) {
                setPopupContentMalert(err?.response?.data?.message);
                setPopupSeverityMalert("warning");
                handleClickOpenPopupMalert();
            }

        }
    }




    const addUserInBioMetric = async () => {
        try {
            let res = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
                biometricUserIDC: BiometricId,
                cloudIDC: employee.biometricdevicename,
                dataupload: "new",
                downloadedFaceTemplateN: 0,
                downloadedFingerTemplateN: 0,
                fingerCountN: 0,
                isEnabledC: "Yes",
                isFaceEnrolledC: "No",
                privilegeC: employee.biometricrole,
                pwdc: "",
                staffNameC: enableLoginName ? String(third) : employee.username,
                companyname: employee.biometricname,
            });

            setPopupContentMalert("Biometric Data Added");
            setPopupSeverityMalert("success");
            handleClickOpenPopupMalert();
            setBiometricPostDevice({
                biometricUserIDC: BiometricId,
                cloudIDC: employee.biometricdevicename,
                devicetype: "boxtel",
            });

            setEmployee((prev) => ({
                ...prev,
                devicetype: "Please Select Device Type",
                devicecompany: "Please Select Company",
                devicebranch: "Please Select Branch",
                deviceunit: "Please Select Unit",
                devicefloor: "Please Select Floor",
                devicearea: "Please Select Area",
                userbranch: "Please Select Branch",
                usercompany: "Please Select Company",
                userunit: "Please Select Unit",
                userteam: "Please Select Team",
                userarea: "Please Select Area",
                biometricdevicename: "Please Select Device",
                biometricrole: "Please Select Role",
                usertype: "Please Select User Type",
                biometricname: "Please Select Biometric Name",
                biometricuserid: "",
            }));

            setBiometricId(0);
            setBioPostCheckDevice(true);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const handleAddNewBiometricDevices = async () => {
        try {
            if (deviceDetails) {
                let brand1CommandAddUser = {
                    "cmd": "setusername",
                    "count": 50,
                    "record": [
                        {
                            "enrollid": BiometricId,
                            "name": enableLoginName ? String(third) : employee.username,

                        }
                    ]
                }
                let brand1CommandImage = {
                    "cmd": "setuserinfo",
                    "enrollid": BiometricId,
                    "name": enableLoginName ? String(third) : employee.username,
                    "backupnum": 50,
                    "admin": employee.biometricrole === "User" ? 0 : 1,
                    "record": documentFiles?.data
                }
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 100);
                const isoString = futureDate.toISOString();
                const brand2Command =
                {
                    "pass": "",
                    "accNo": BiometricId,
                    "opType": 1,
                    "isManager": 0,
                    "password": "",
                    "cardSN": deviceDetails?.biometricserialno,
                    "endExpDate": isoString,
                    "timeGroup": 0,
                    "name": enableLoginName ? String(third) : employee.username,
                    "faceId1": 0,
                    "dept": 1,
                    "faceImage1": "",
                    "dept": 1
                }
                const brand3Command = {
                    "agentNo": "82391038574",
                    "charset": "UTF-8",
                    "content": {
                        "employeeDetailBeanList": [
                            {
                                "employeeId": BiometricId,
                                "employeeName": enableLoginName ? String(third) : employee.username,
                                "employeeIc": "456465465465",
                                "employeePhotoWay": "path",
                                "employeePhoto": documentFiles?.data,
                            }
                        ],
                        "deviceSn": deviceDetails?.biometricserialno,
                    },
                    "deviceSn": deviceDetails?.biometricserialno,
                    "interType": "32001",
                    "requestId": "7864874687489789",
                    "sign": "sfdsfdsfds",
                    "signType": "RSA",
                    "version": "1.0.0"
                }
                let finalCommand = deviceDetails.brand === "Brand1" ? brand1CommandAddUser :
                    deviceDetails.brand === "Brand2" ? brand2Command :
                        deviceDetails.brand === "Brand3" ? brand3Command : "";
                let res = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD_NEW, {
                    headers: { Authorization: `Bearer ${auth.APIToken}` },
                    command: finalCommand,
                    brand: deviceDetails.brand,
                    brand1: brand1CommandImage,

                });
                if (deviceDetails?.brand === "Brand1" ? res?.data?.alldeviceinfo?.result : deviceDetails?.brand === "Brand2" ? res?.data?.alldeviceinfo : false) {
                    let response = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD, {
                        headers: { Authorization: `Bearer ${auth.APIToken}` },
                        biometricUserIDC: BiometricId,
                        cloudIDC: deviceDetails.biometricserialno,
                        dataupload: "new",
                        downloadedFaceTemplateN: (deviceDetails.brand === "Brand1" && documentFiles?.data) ? 1 : 0,
                        downloadedFingerTemplateN: 0,
                        fingerCountN: 0,
                        isEnabledC: "Yes",
                        isFaceEnrolledC: (deviceDetails.brand === "Brand1" && documentFiles?.data) ? "Yes" : "No",
                        privilegeC: employee.biometricrole,
                        pwdc: "",
                        staffNameC: enableLoginName ? String(third) : employee.username,
                        companyname: employee.biometricname,
                    });
                }

                setPopupContentMalert("Biometric Data Added");
                setPopupSeverityMalert("success");
                handleClickOpenPopupMalert();
                setBiometricPostDevice({
                    biometricUserIDC: BiometricId,
                    cloudIDC: employee.biometricdevicename,
                    devicetype: "notboxtel",
                });
                setDeviceDetails("")

                setEmployee((prev) => ({
                    ...prev,
                    devicetype: "Please Select Device Type",
                    devicecompany: "Please Select Company",
                    devicebranch: "Please Select Branch",
                    deviceunit: "Please Select Unit",
                    devicefloor: "Please Select Floor",
                    devicearea: "Please Select Area",
                    userbranch: "Please Select Branch",
                    usercompany: "Please Select Company",
                    userunit: "Please Select Unit",
                    userteam: "Please Select Team",
                    userarea: "Please Select Area",
                    biometricdevicename: "Please Select Device",
                    biometricrole: "Please Select Role",
                    usertype: "Please Select User Type",
                    biometricname: "Please Select Biometric Name",
                    biometricuserid: "",
                }));

                setBiometricId(0);
                setBioPostCheckDevice(true);
            }
            else {
                setPopupContentMalert("Choose the Device Name Properly..!!");
                setPopupSeverityMalert("warning");
                handleClickOpenPopupMalert();
            }

        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                    <Typography>
                        Device Type<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                        options={[{ label: "Device Name", value: "Device Name" }, { label: "Location", value: "Location" }]}
                        value={{ label: employee.devicetype, value: employee.devicetype }}
                        onChange={(e) => {
                            setEmployee({
                                ...employee, devicetype: e.value,
                                devicecompany: "Please Select Company",
                                devicebranch: "Please Select Branch",
                                deviceunit: "Please Select Unit",
                                devicefloor: "Please Select Floor",
                                devicearea: "Please Select Area",
                                biometricdevicename: "Please Select Device",
                            });
                            setBiometricId(0);
                        }}
                    />
                </FormControl>
            </Grid>

            {employee?.devicetype === "Location" &&
                <>
                    <Grid item md={3} xs={12} sm={12}>
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
                                value={{ label: employee.devicecompany, value: employee.devicecompany }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, devicecompany: e.value,
                                        devicebranch: "Please Select Branch",
                                        deviceunit: "Please Select Unit",
                                        devicefloor: "Please Select Floor",
                                        devicearea: "Please Select Area",
                                        biometricdevicename: "Please Select Device",
                                    });
                                    setBiometricId(0);
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Branch<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={accessbranch?.filter(data => data?.company === employee?.devicecompany)
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
                                value={{ label: employee.devicebranch, value: employee.devicebranch }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, devicebranch: e.value,
                                        deviceunit: "Please Select Unit",
                                        devicefloor: "Please Select Floor",
                                        devicearea: "Please Select Area",
                                        biometricdevicename: "Please Select Device",
                                    });
                                    setBiometricId(0);
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Unit<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={accessbranch?.filter(data => data?.branch === employee?.devicebranch
                                    && data?.company === employee?.devicecompany)
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
                                value={{ label: employee.deviceunit, value: employee.deviceunit }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, deviceunit: e.value,
                                        devicefloor: "Please Select Floor",
                                        devicearea: "Please Select Area",
                                        biometricdevicename: "Please Select Device",
                                    });
                                    setBiometricId(0);
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Floor<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={allfloor?.filter(data => data?.branch === employee?.devicebranch)
                                    ?.map((data) => ({
                                        label: data.name,
                                        value: data.name,
                                    }))
                                    .filter((item, index, self) => {
                                        return (
                                            self.findIndex(
                                                (i) =>
                                                    i.label === item.label && i.value === item.value
                                            ) === index
                                        );
                                    })}
                                value={{ label: employee.devicefloor, value: employee.devicefloor }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, devicefloor: e.value,
                                        devicearea: "Please Select Area",
                                        biometricdevicename: "Please Select Device",
                                    });
                                    setBiometricId(0);
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
                                options={allareagrouping
                                    ?.filter(data =>
                                        data?.company === employee.devicecompany &&
                                        data?.branch === employee.devicebranch &&
                                        data?.unit === employee.deviceunit &&
                                        data?.floor === employee.devicefloor
                                    )
                                    ?.flatMap(data =>
                                        (data.area || []).map(areaItem => ({
                                            label: String(areaItem),
                                            value: String(areaItem),
                                        }))
                                    )
                                    .filter((item, index, self) =>
                                        self.findIndex(i => i.label === item.label && i.value === item.value) === index
                                    )
                                }
                                value={{ label: employee.devicearea, value: employee.devicearea }}
                                onChange={(e) => {
                                    setEmployee({ ...employee, devicearea: e.value, biometricdevicename: "Please Select Device", });
                                    setBiometricId(0);
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Device Name<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={BiometricDeviceOptions?.filter(data => data?.company === employee.devicecompany &&
                                    data?.branch === employee.devicebranch &&
                                    data?.unit === employee.deviceunit && data?.floor === employee.devicefloor && data?.area === employee.devicearea)}
                                value={{ label: employee.biometricdevicename, value: employee.biometricdevicename }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({ ...employee, biometricdevicename: e.value });
                                    fetchBioInfoStatus(e);
                                    setDeviceDetails(e)
                                    setBiometricId(0);
                                }}
                            />
                        </FormControl>
                    </Grid>
                </>
            }

            {employee?.devicetype === "Device Name" &&
                <Grid item md={2.8} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                        <Typography>
                            Device Name<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                            options={BiometricDeviceOptions}
                            value={{ label: employee.biometricdevicename, value: employee.biometricdevicename }}
                            // isDisabled={BioOldUserCheck ? true : false}
                            onChange={(e) => {
                                setEmployee({ ...employee, biometricdevicename: e.value });
                                fetchBioInfoStatus(e);
                                setDeviceDetails(e)
                                setBiometricId(0);
                            }}
                        />
                    </FormControl>
                </Grid>
            }

            {
                BiometricId > 0 ? (
                    <Grid item md={3} xs={12} sm={12} mt={3}>
                        <CheckCircle sx={{ color: "green", fontSize: 24, verticalAlign: "middle" }} />
                        <span style={{ marginLeft: 8 }}>Available</span>
                    </Grid>
                ) : (
                    <Grid item md={3} xs={12} sm={12} mt={3}>
                        <LoadingButton variant="contained" size="small" onClick={handleBiometricActionClick} loading={loadingBiometric} sx={{ minWidth: 140 }}>
                            {"Check Availability"}
                        </LoadingButton>
                    </Grid>
                )
            }


            {/* <Grid container spacing={2}> */}
            <Grid item md={2.8} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                    <Typography>Biometric User Id</Typography>
                    <OutlinedInput type="text" value={BiometricId} readOnly />
                </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                    <Typography>
                        User Type<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                        options={[{ label: "Existing", value: "Existing" }, { label: "New User", value: "New User" }]}
                        value={{ label: employee.usertype, value: employee.usertype }}
                        onChange={(e) => {
                            setEmployee({
                                ...employee, usertype: e.value,
                                biometricname: e.value === "New User" ? "" : "Please Select Biometric Name",
                                usercompany: "Please Select Company",
                                userbranch: "Please Select Branch",
                                userunit: "Please Select Unit",
                                userteam: "Please Select Team",
                                userid: "",
                            });
                            setUsernameBio("")
                        }}
                    />
                </FormControl>
            </Grid>

            {
                employee?.usertype === "Existing" &&
                <>
                    <Grid item md={3} xs={12} sm={12}>
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
                                value={{ label: employee.usercompany, value: employee.usercompany }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, usercompany: e.value,
                                        biometricname: "Please Select Biometric Name",
                                        userbranch: "Please Select Branch",
                                        userunit: "Please Select Unit",
                                        userteam: "Please Select Team",
                                        userid: "",

                                    });
                                    setUsernameBio("")
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Branch<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={accessbranch?.filter(data => data?.company === employee?.usercompany)
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
                                value={{ label: employee.userbranch, value: employee.userbranch }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, userbranch: e.value,
                                        biometricname: "Please Select Biometric Name",
                                        userunit: "Please Select Unit",
                                        userteam: "Please Select Team",
                                        userid: "",
                                    });
                                    setUsernameBio("")
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Unit<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={accessbranch?.filter(data => data?.branch === employee?.userbranch &&
                                    data?.company === employee?.usercompany)
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
                                value={{ label: employee.userunit, value: employee.userunit }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, userunit: e.value,
                                        biometricname: "Please Select Biometric Name",
                                        userteam: "Please Select Team",
                                        userid: "",
                                    });
                                    setUsernameBio("")
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Team<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={allTeam?.filter(data => data?.company === employee?.usercompany &&
                                    data?.branch === employee?.userbranch &&
                                    data?.unit === employee?.userunit)
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
                                value={{
                                    label: employee.userteam, value: employee.userteam,
                                }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, userteam: e.value,
                                        biometricname: "Please Select Biometric Name",
                                        userid: "",
                                    });
                                    setUsernameBio("")
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                Biometric Name<b style={{ color: "red" }}>*</b>
                            </Typography>
                            <Selects
                                options={allUsersData?.filter(data => data?.company === employee?.usercompany &&
                                    data?.branch === employee?.userbranch &&
                                    data?.unit === employee?.userunit && data?.team === employee.userteam)
                                    ?.map((data) => ({
                                        label: data.companyname,
                                        value: data.companyname,
                                        empcode: data.empcode,
                                        username: data.username,
                                        commmonid: data?._id
                                    }))
                                    .filter((item, index, self) => {
                                        return (
                                            self.findIndex(
                                                (i) =>
                                                    i.label === item.label && i.value === item.value
                                            ) === index
                                        );
                                    })}
                                value={{ label: employee.biometricname, value: employee.biometricname }}
                                // isDisabled={BioOldUserCheck ? true : false}
                                onChange={(e) => {
                                    setEmployee({
                                        ...employee, biometricname: e.value,
                                        userid: e.empcode,
                                    })
                                    handleEmployeeDocuments(e?.commmonid, e.value)
                                    setUsernameBio(e.username)
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item md={2.8} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                            <Typography>
                                User id
                            </Typography>
                            <OutlinedInput
                                value={employee?.userid}
                                readOnly
                            />
                        </FormControl>
                    </Grid>
                </>
            }

            {employee?.usertype === "New User" &&
                <Grid item md={2.8} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                        <Typography>
                            Biometric Name
                        </Typography>
                        <OutlinedInput
                            value={employee?.biometricname}
                            onChange={(e) => {
                                const inputValue = e.target?.value.replace(/[^a-zA-Z]/g, "");
                                setEmployee({ ...employee, biometricname: inputValue });

                            }}
                        />
                    </FormControl>
                </Grid>}

            <Grid item md={2.8} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                    <Typography>
                        Biometric Username
                    </Typography>
                    {employee?.usertype === "Existing" ? <OutlinedInput
                        value={third}
                        readOnly
                    /> :
                        <OutlinedInput
                            value={third}
                            onChange={(e) => {

                                const inputValue = e.target?.value.toLowerCase().replace(/[^a-z]/g, "");
                                setUsernameBio(inputValue)
                            }
                            }
                        />}
                </FormControl>
            </Grid>

            {/* Upload Section (only show when documentFiles is null) */}
            {!documentFiles && ["Brand1", "Bowee"]?.includes(deviceDetails?.brand) && (
                <Grid item xs={12} sm={12} md={3}>
                    <FormControl fullWidth size="small">
                        <Typography mb={1}>Upload Profile</Typography>
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
                                accept=".png"
                                name="file"
                                hidden
                                onChange={handleResumeUpload}
                            />
                        </Button>
                    </FormControl>
                </Grid>
            )}

            {/* Uploaded Document Section */}
            {documentFiles && (
                <Grid item xs={12} sm={12} md={3}>
                    <Box textAlign="center">
                        <img
                            src={documentFiles.preview}
                            alt="Uploaded"
                            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: 4 }}
                        />
                        <Typography variant="body2" mt={1}>{documentFiles.name}</Typography>
                        <Box display="flex" justifyContent="center" mt={1} gap={2}>
                            <IconButton
                                color="primary"
                                onClick={() => window.open(documentFiles.preview, "_blank")}
                            >
                                <Visibility />
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={() => setdocumentFiles(null)}
                            >
                                <Delete />
                            </IconButton>
                        </Box>
                    </Box>
                </Grid>
            )}

            <Grid item md={2.8} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                    <Typography>
                        Biometric Role<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                        options={["Brand1", "Brand2", "Brand3", "Bowee"]?.includes(deviceDetails?.brand) ?
                            [{ label: "User", value: "User" }, { label: "Administrator", value: "Administrator" }]
                            :
                            [{ label: "User", value: "User" }, { label: "Manager", value: "Manager" }, { label: "Administrator", value: "Administrator" }]
                        }
                        value={{
                            label: employee.biometricrole,
                            value: employee.biometricrole,
                        }}
                        onChange={(e) => {
                            setEmployee({
                                ...employee,
                                biometricrole: e.value,
                            });
                            // fetchBioInfoStatus(e.value)
                        }}
                    />

                </FormControl>

            </Grid>
            {/* </Grid> */}
            <Loader loading={loading} message={loadingMessage} />
            <Grid item md={2.8} xs={12} sm={12} mt={3}>
                <Button variant="contained" disabled={BioPostCheckDevice ? true : false} onClick={handleSubmitBioCheck}>Add to Biometric</Button>
            </Grid>
                        {deviceUserNameAddedList?.length > 0 &&
                            <TableContainer component={Paper}>
                                <Typography variant="h6" sx={{ p: 2 }}>
                                    Device User List
                                </Typography>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Cloud ID</b></TableCell>
                                            <TableCell><b>Staff Name</b></TableCell>
                                            <TableCell><b>Biometric User ID</b></TableCell>
                                            <TableCell><b>Privilege</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deviceUserNameAddedList?.map((user, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{user.cloudIDC}</TableCell>
                                                <TableCell>{user.staffNameC}</TableCell>
                                                <TableCell>{user.biometricUserIDC}</TableCell>
                                                <TableCell>{user.privilegeC}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>}
        </Grid>

    );
};

export default BiometricFormdevUser;
