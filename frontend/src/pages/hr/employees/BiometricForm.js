import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, Paper, TableRow, FormControl, Typography, OutlinedInput, Switch, IconButton, Button, Box } from '@mui/material';
import { AuthContext, UserRoleAccessContext } from '../../../context/Appcontext';
import LoadingButton from '@mui/lab/LoadingButton';
import { Visibility, Delete } from '@mui/icons-material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Selects from 'react-select'; // Ensure you have react-select installed
import imageCompression from 'browser-image-compression';
const BiometricForm = ({
  employee,
  BiometricDeviceOptions,
  setEmployee,
  auth,
  SERVICE,
  handleApiError,
  setPopupContentMalert,
  setPopupSeverityMalert,
  handleClickOpenPopupMalert,
  enableLoginName,
  third,
  BiometricPostDevice,
  setBiometricPostDevice,
  BioPostCheckDevice,
  setBioPostCheckDevice,
  pagename,
  setUsernameBio,
  profileImage,
  setCheckedBiometricAdded,
}) => {
  const { isUserRoleCompare, isUserRoleAccess, buttonStyles } = useContext(UserRoleAccessContext);
  const profileImageString = profileImage ? profileImage?.split(',')[1] : '';

  useEffect(() => {
    // Run only if profileImage exists and we haven't already set documentFiles
    if (profileImage && !documentFiles) {
      handleProfileImage(profileImage, 'ProfilePhoto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileImage]);
  const [documentFiles, setdocumentFiles] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleProfileImage(profileImage, name) {
    if (!profileImage) return;

    try {
      setLoading(true);

      let base64Data = profileImage;
      if (profileImage.includes(',')) {
        base64Data = profileImage.split(',')[1];
      }

      // Convert base64 -> Blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Compress
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedBlob = await imageCompression(blob, options);
      const previewUrl = URL.createObjectURL(compressedBlob);
      const compressedBase64 = await imageCompression.getDataUrlFromFile(compressedBlob);
      const compressedBase64Data = compressedBase64.split(',')[1];

      setdocumentFiles({
        name,
        preview: previewUrl,
        data: compressedBase64Data,
      });

      console.log('Compressed size (KB):', Math.round(compressedBlob.size / 1024));
    } catch (error) {
      console.error('Error compressing profile image:', error);
    } finally {
      setLoading(false);
    }
  }
  const handleResumeUpload = (event) => {
    const resume = event.target.files;
    const allowedExtensions = ['png'];
    const file = resume[0];
    const fileExtension = file?.name?.split('.').pop().toLowerCase();
    const preview = URL.createObjectURL(file);
    const maxFileSize = 150 * 1024;

    if (!allowedExtensions.includes(fileExtension)) {
      setPopupContentMalert('Please upload a valid PNG file.');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }
    if (file.size > maxFileSize) {
      setPopupContentMalert('Image file size must be less than 150 KB.');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1]; // Extract base64
      setdocumentFiles({
        name: file.name,
        preview: preview,
        data: base64String,
      });
    };
  };
  const [loadingBiometric, setLoadingBiometric] = useState(false);
  const [BiometricId, setBiometricId] = useState(0);
  const [deviceDetails, setDeviceDetails] = useState('');
  const [deviceUserNameAddedList, setDeviceUserNameAddedList] = useState([]);
  const [BioIndivUserCheck, setBioIndivUserCheck] = useState(false);
  const [deviceOnlineStatus, setDeviceOnlineStatus] = useState('');
  const fetchBioInfoStatus = async (device) => {
    try {
      if (!['Brand1', 'Brand2', 'Brand3']?.includes(device.brand)) {
        await axios.post(SERVICE.BIOMETRIC_GET_SEND_COMMAND, {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          deviceCommandN: '2',
          CloudIDC: device?.value,
        });
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const handleDeviceStatus = async (e) => {
    try {
      let response = await axios.post(SERVICE.BIOMETRIC_PARTICULAR_DEVICE_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        cloudIDC: e,
        date: new Date(),
      });

      // setDeviceOnlineStatus(response?.data?.deviceonlinestatus)
      setDeviceOnlineStatus('Active');
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleBiometricActionClick = () => {
    if (!employee?.biometricdevicename || employee?.biometricdevicename === 'Please Select Device') {
      setPopupContentMalert('Please Select Device Name.!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      setLoadingBiometric(true);
      if (['Brand1', 'Brand2', 'Brand3', 'Bowee']?.includes(deviceDetails?.brand)) {
        setLoadingBiometric(false);
        fetchUsersAvailability(deviceDetails, employee?.biometricdevicename);
      } else {
        setTimeout(() => {
          setLoadingBiometric(false);
          fetchUsersAvailability(deviceDetails, employee?.biometricdevicename);
        }, 25000);
      }
    }
  };

  const fetchUsersAvailability = async (device, biometricdevicename) => {
    try {
      if (['Brand1', 'Brand2', 'Brand3']?.includes(device.brand)) {
        const [res, response] = await Promise.all([
          axios.post(SERVICE.BIOMETRIC_USER_ID_CHECK, {
            headers: { Authorization: `Bearer ${auth.APIToken}` },
            device,
          }),
          axios.post(
            SERVICE.BIOMETRIC_USER_DUPLICATE_CHECK,
            {
              cloudIDC: biometricdevicename,
              staffNameC: enableLoginName ? String(third) : employee.username,
            },
            { headers: { Authorization: `Bearer ${auth.APIToken}` } }
          ),
        ]);

        let duplicateCheck = response?.data?.individualuser;
        console.log(duplicateCheck, 'duplicateCheck');
        setBioIndivUserCheck(duplicateCheck);
        if (res?.data?.alldeviceinfo) {
          setBiometricId(Number(res?.data?.alldeviceinfo));
        }
      } else if (device.brand === 'Bowee') {
        const [bowee, response] = await Promise.all([
          await axios.post(
            SERVICE.BOWER_BIOMETRIC_NEW_USERID,
            { biometricdevicename: biometricdevicename },
            {
              headers: { Authorization: `Bearer ${auth.APIToken}` },
            }
          ),
          axios.post(
            SERVICE.BIOMETRIC_USER_DUPLICATE_CHECK,
            {
              cloudIDC: biometricdevicename,
              staffNameC: enableLoginName ? String(third) : employee.username,
            },
            { headers: { Authorization: `Bearer ${auth.APIToken}` } }
          ),
        ]);

        // let bowee = await axios.post(SERVICE.BOWER_BIOMETRIC_NEW_USERID, { biometricdevicename: biometricdevicename }, {
        //     headers: { Authorization: `Bearer ${auth.APIToken}` }

        // });
        let duplicateCheck = bowee?.data?.NewUserID;

        let duplicateCheckUser = response?.data?.individualuser;
        setBiometricId(duplicateCheck);
        setBioIndivUserCheck(duplicateCheckUser);
      } else {
        const [res, response] = await Promise.all([
          axios.post(SERVICE.BIOMETRIC_GET_DEVICE_INFO_STATUS, { cloudIDC: biometricdevicename }, { headers: { Authorization: `Bearer ${auth.APIToken}` } }),
          axios.post(
            SERVICE.BIOMETRIC_USER_DUPLICATE_CHECK,
            {
              cloudIDC: biometricdevicename,
              staffNameC: enableLoginName ? String(third) : employee.username,
            },
            { headers: { Authorization: `Bearer ${auth.APIToken}` } }
          ),
        ]);

        let duplicateCheck = response?.data?.individualuser;
        setBioIndivUserCheck(duplicateCheck);
        if (res?.data?.alldeviceinfo) {
          setBiometricId(Number(res?.data?.alldeviceinfo));
        }
      }

      let biolist = await axios.post(
        SERVICE.BIOUSER_ADDED_LIST_TABLE,
        {
          username: enableLoginName ? third : employee.username,
        },
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
        }
      );
      setDeviceUserNameAddedList(biolist?.data?.alluploaduserinfo);
    } catch (err) {
      console.log(err, 'err');
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleSubmitBioCheck = (e) => {
    e.preventDefault();
    const employeeName = enableLoginName ? String(third) : employee.username;
    if (!employee.biometricdevicename || employee.biometricdevicename === 'Please Select Device') {
      setPopupContentMalert('Please Select Device Name.!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (!BiometricId || BiometricId <= 0) {
      setPopupContentMalert('Check Availability Status to get UserID!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (!pagename && (!employee?.biometricname || employee?.biometricname === '')) {
      setPopupContentMalert('Please Enter Biometric Name!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (!pagename && (!employeeName || employeeName === '')) {
      setPopupContentMalert('Please Enter Biometric Username!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (!employee?.biometricrole || employee?.biometricrole === 'Please Select Role') {
      setPopupContentMalert('Please Select Biometric User Role!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (deviceDetails?.brand === 'Brand1' && employee?.biometricrole === 'Administrator' && !documentFiles) {
      setPopupContentMalert('Please Add Face Image');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (deviceDetails?.brand === 'Brand3') {
      setPopupContentMalert('Currently Not is Use');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (['Bowee']?.includes(deviceDetails.brand) && !documentFiles) {
      setPopupContentMalert('Please Add Profile Image');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (BioIndivUserCheck) {
      setPopupContentMalert('User Already Added');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      if (['Brand1', 'Brand2', 'Brand3']?.includes(deviceDetails.brand)) {
        handleAddNewBiometricDevices();
      } else if (['Bowee']?.includes(deviceDetails.brand)) {
        handleNewUserAddBowee();
      } else {
        addUserInBioMetric();
      }
    }
  };

  const handleNewUserAddBowee = async () => {
    const PeopleJson = {
      UserID: String(BiometricId),
      Name: enableLoginName ? String(third) : employee.username,
      Job: 'Staff',
      AccessType: employee.biometricrole === 'User' ? 0 : employee.biometricrole === 'Administrator' ? 1 : 2,
      OpenTimes: 65535,
      Photo: documentFiles?.data,
    };
    try {
      const response = await axios.post(
        SERVICE.BOWER_BIOMETRIC_NEW_USER_ADD,

        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          PeopleJson: PeopleJson,
          biometricdevicename: deviceDetails.biometricserialno,
        }
      );
      if (response.data?.success) {
        let response = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD, {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          biometricUserIDC: BiometricId,
          cloudIDC: deviceDetails.biometricserialno,
          dataupload: 'new',
          downloadedFaceTemplateN: deviceDetails.brand === 'Bowee' && documentFiles?.data ? 1 : 0,
          downloadedFingerTemplateN: 0,
          fingerCountN: 0,
          isEnabledC: 'Yes',
          isFaceEnrolledC: deviceDetails.brand === 'Bowee' && documentFiles?.data ? 'Yes' : 'No',
          privilegeC: employee.biometricrole,
          pwdc: '',
          staffNameC: enableLoginName ? String(third) : employee.username,
          companyname: employee.biometricname,
        });
        setCheckedBiometricAdded(true);
      }
      setPopupContentMalert('Biometric Data Added');
      setPopupSeverityMalert('success');
      handleClickOpenPopupMalert();
      setBiometricPostDevice({
        biometricUserIDC: BiometricId,
        cloudIDC: employee.biometricdevicename,
        devicetype: 'notboxtel',
      });
      setDeviceDetails('');

      setEmployee((prev) => ({
        ...prev,
        biometricdevicename: 'Please Select Device',
        biometricrole: 'Please Select Role',
      }));

      setBiometricId(0);
      // setBioPostCheckDevice(true);
    } catch (err) {
      console.log(err, 'err');
      if (!err?.response?.data?.success) setPopupContentMalert(err?.response?.data?.message);
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
  };

  const addUserInBioMetric = async () => {
    try {
      let res = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        biometricUserIDC: BiometricId,
        cloudIDC: employee.biometricdevicename,
        dataupload: 'new',
        downloadedFaceTemplateN: 0,
        downloadedFingerTemplateN: 0,
        fingerCountN: 0,
        isEnabledC: 'Yes',
        isFaceEnrolledC: 'No',
        privilegeC: employee.biometricrole,
        pwdc: '',
        staffNameC: enableLoginName ? String(third) : employee.username,
        companyname: employee.biometricname,
      });
      setCheckedBiometricAdded(true);
      setPopupContentMalert('Biometric Data Added');
      setPopupSeverityMalert('success');
      handleClickOpenPopupMalert();
      setBiometricPostDevice({
        biometricUserIDC: BiometricId,
        cloudIDC: employee.biometricdevicename,
        devicetype: 'boxtel',
      });

      setEmployee((prev) => ({
        ...prev,
        biometricdevicename: 'Please Select Device',
        biometricrole: 'Please Select Role',
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
          cmd: 'setusername',
          count: 50,
          record: [
            {
              enrollid: BiometricId,
              name: enableLoginName ? String(third) : employee.username,
            },
          ],
        };
        let brand1CommandImage = {
          cmd: 'setuserinfo',
          enrollid: BiometricId,
          name: enableLoginName ? String(third) : employee.username,
          backupnum: 50,
          admin: employee.biometricrole === 'User' ? 0 : 1,
          record: documentFiles?.data,
        };
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 100);
        const isoString = futureDate.toISOString();
        const brand2Command = {
          pass: '',
          accNo: BiometricId,
          opType: 1,
          isManager: 0,
          password: '',
          cardSN: deviceDetails?.biometricserialno,
          endExpDate: isoString,
          timeGroup: 0,
          name: enableLoginName ? String(third) : employee.username,
          faceId1: 0,
          dept: 1,
          faceImage1: '',
          dept: 1,
        };
        const brand3Command = {
          agentNo: '82391038574',
          charset: 'UTF-8',
          content: {
            employeeDetailBeanList: [
              {
                employeeId: BiometricId,
                employeeName: enableLoginName ? String(third) : employee.username,
                employeeIc: '456465465465',
                employeePhotoWay: 'path',
                employeePhoto: documentFiles?.data,
              },
            ],
            deviceSn: deviceDetails?.biometricserialno,
          },
          deviceSn: deviceDetails?.biometricserialno,
          interType: '32001',
          requestId: '7864874687489789',
          sign: 'sfdsfdsfds',
          signType: 'RSA',
          version: '1.0.0',
        };
        let finalCommand = deviceDetails.brand === 'Brand1' ? brand1CommandAddUser : deviceDetails.brand === 'Brand2' ? brand2Command : deviceDetails.brand === 'Brand3' ? brand3Command : '';
        let res = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD_NEW, {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          command: finalCommand,
          brand: deviceDetails.brand,
          brand1: brand1CommandImage,
        });
        if (deviceDetails?.brand === 'Brand1' ? res?.data?.alldeviceinfo?.result : deviceDetails?.brand === 'Brand2' ? res?.data?.alldeviceinfo : false) {
          let response = await axios.post(SERVICE.BIOMETRIC_USER_SINGLE_ADD, {
            headers: { Authorization: `Bearer ${auth.APIToken}` },
            biometricUserIDC: BiometricId,
            cloudIDC: deviceDetails.biometricserialno,
            dataupload: 'new',
            downloadedFaceTemplateN: deviceDetails.brand === 'Brand1' && documentFiles?.data ? 1 : 0,
            downloadedFingerTemplateN: 0,
            fingerCountN: 0,
            isEnabledC: 'Yes',
            isFaceEnrolledC: deviceDetails.brand === 'Brand1' && documentFiles?.data ? 'Yes' : 'No',
            privilegeC: employee.biometricrole,
            pwdc: '',
            staffNameC: enableLoginName ? String(third) : employee.username,
            companyname: employee.biometricname,
          });
          setCheckedBiometricAdded(true);
        }

        setPopupContentMalert('Biometric Data Added');
        setPopupSeverityMalert('success');
        handleClickOpenPopupMalert();
        setBiometricPostDevice({
          biometricUserIDC: BiometricId,
          cloudIDC: employee.biometricdevicename,
          devicetype: 'notboxtel',
        });
        setDeviceDetails('');

        setEmployee((prev) => ({
          ...prev,
          biometricdevicename: 'Please Select Device',
          biometricrole: 'Please Select Role',
        }));

        setBiometricId(0);
        setBioPostCheckDevice(true);
      } else {
        setPopupContentMalert('Choose the Device Name Properly..!!');
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={2.8} xs={12} sm={12}>
        <FormControl fullWidth size="small">
          <Typography>
            Device Name<b style={{ color: 'red' }}>*</b>
          </Typography>
          <Selects
            options={BiometricDeviceOptions}
            value={{ label: employee.biometricdevicename, value: employee.biometricdevicename }}
            // isDisabled={BioOldUserCheck ? true : false}
            onChange={(e) => {
              setEmployee({ ...employee, biometricdevicename: e.value });
              fetchBioInfoStatus(e);
              setDeviceDetails(e);
              setBiometricId(0);
              handleDeviceStatus(e?.value);
            }}
          />
        </FormControl>
      </Grid>
      <Grid item md={2} xs={12} sm={12}>
        {/* <Box display="flex" flexDirection="column" alignItems="center" gap={1}> */}
        <Typography variant="subtitle1">Device Status</Typography>
        <Box display="flex" gap={1}>
          <Typography variant="h6" sx={{ color: deviceOnlineStatus === 'Active' ? 'green' : 'red' }}>
            {deviceOnlineStatus === 'Active' ? 'Online' : 'Offline'}
          </Typography>
          <Switch checked={deviceOnlineStatus === 'Active'} color="success" disabled size="medium" />
        </Box>
        {/* </Box> */}
      </Grid>

      {deviceOnlineStatus === 'Active' && (
        <>
          {BiometricId > 0 ? (
            <Grid item md={2} xs={12} sm={12} mt={3}>
              <CheckCircle sx={{ color: 'green', fontSize: 24, verticalAlign: 'middle' }} />
              <span style={{ marginLeft: 8 }}>Available</span>
            </Grid>
          ) : (
            <Grid item md={3} xs={12} sm={12} mt={3}>
              <LoadingButton variant="contained" size="small" onClick={handleBiometricActionClick} loading={loadingBiometric} sx={{ minWidth: 140 }}>
                {'Check Availability'}
              </LoadingButton>
            </Grid>
          )}

          <Grid item md={2.8} xs={12} sm={12}>
            <FormControl fullWidth size="small">
              <Typography>Biometric User Id</Typography>
              <OutlinedInput type="text" value={BiometricId} readOnly />
            </FormControl>
          </Grid>
          {!pagename && (
            <Grid item md={2.8} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>Biometric Name</Typography>
                <OutlinedInput
                  value={employee?.biometricname}
                  onChange={(e) => {
                    const inputValue = e.target?.value.replace(/[^a-zA-Z]/g, '');
                    setEmployee({ ...employee, biometricname: inputValue });
                  }}
                />
              </FormControl>
            </Grid>
          )}

          <Grid item md={2.8} xs={12} sm={12}>
            <FormControl fullWidth size="small">
              <Typography>Biometric Username</Typography>
              {pagename ? (
                <OutlinedInput value={enableLoginName ? third : employee.username} readOnly />
              ) : (
                <OutlinedInput
                  value={enableLoginName ? third : employee.username}
                  onChange={(e) => {
                    const inputValue = e.target?.value.toLowerCase().replace(/[^a-z]/g, '');
                    setUsernameBio(inputValue);
                  }}
                />
              )}
            </FormControl>
          </Grid>

          {/* Upload Section (only show when documentFiles is null) */}
          {!documentFiles && ['Brand1', 'Bowee']?.includes(deviceDetails?.brand) && (
            <Grid item xs={12} sm={12} md={3}>
              <FormControl fullWidth size="small">
                <Typography mb={1}>
                  Upload Profile<b style={{ color: 'red' }}>*</b>
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  component="label"
                  sx={{
                    '@media only screen and (max-width:550px)': {
                      marginY: '5px',
                    },
                    ...buttonStyles.buttonsubmit,
                  }}
                >
                  Upload
                  <input type="file" id="resume" accept=".png" name="file" hidden onChange={handleResumeUpload} />
                </Button>
              </FormControl>
            </Grid>
          )}

          {/* Uploaded Document Section */}
          {documentFiles && ['Brand1', 'Bowee']?.includes(deviceDetails?.brand) && (
            <Grid item xs={12} sm={12} md={3}>
              <Box textAlign="center">
                <img src={documentFiles.preview} alt="Uploaded" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 4 }} />
                <Typography variant="body2" mt={1}>
                  {documentFiles.name}
                </Typography>
                <Box display="flex" justifyContent="center" mt={1} gap={2}>
                  <IconButton color="primary" onClick={() => window.open(documentFiles.preview, '_blank')}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="error" onClick={() => setdocumentFiles(null)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          )}

          <Grid item md={2.8} xs={12} sm={12}>
            <FormControl fullWidth size="small">
              <Typography>
                Biometric Role<b style={{ color: 'red' }}>*</b>
              </Typography>
              <Selects
                options={
                  ['Brand1', 'Brand2', 'Brand3', 'Bowee']?.includes(deviceDetails?.brand)
                    ? [
                        { label: 'User', value: 'User' },
                        { label: 'Administrator', value: 'Administrator' },
                      ]
                    : [
                        { label: 'User', value: 'User' },
                        { label: 'Manager', value: 'Manager' },
                        { label: 'Administrator', value: 'Administrator' },
                      ]
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
          <Grid item md={2.8} xs={12} sm={12} mt={3}>
            <Button variant="contained" disabled={BioPostCheckDevice ? true : false} onClick={handleSubmitBioCheck}>
              Add to Biometric
            </Button>
          </Grid>
        </>
      )}
      {deviceUserNameAddedList?.length > 0 && (
        <TableContainer component={Paper}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Device User List
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>S No</b>
                </TableCell>
                <TableCell>
                  <b>Cloud ID</b>
                </TableCell>
                <TableCell>
                  <b>Staff Name</b>
                </TableCell>
                <TableCell>
                  <b>Biometric User ID</b>
                </TableCell>
                <TableCell>
                  <b>Privilege</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deviceUserNameAddedList?.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.cloudIDC}</TableCell>
                  <TableCell>{user.staffNameC}</TableCell>
                  <TableCell>{user.biometricUserIDC}</TableCell>
                  <TableCell>{user.privilegeC}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Grid>
  );
};

export default BiometricForm;
