const express = require('express');
const biometricdevicebrandRoute = express.Router();





const { getAllBioMetricBrand, getSingleBioMetricBrand, addNewUserBiometricBrand, getSingleUserProfileString, getBiometricDeviceBrandIdentification, getBiometricAvailableUserId, deleteBioMetricBrand, executeBiometricCommandExecution, updateBioMetricBrand, addBioMetricBrand } = require("../controller/modules/biometric/biometricBrand");
biometricdevicebrandRoute.route("/allbiometricbrandmodel").get(getAllBioMetricBrand);
biometricdevicebrandRoute.route("/biometricdevicebrandidentification").post(getBiometricDeviceBrandIdentification);
biometricdevicebrandRoute.route("/biometricbrandmodel/new").post(addBioMetricBrand);
biometricdevicebrandRoute.route("/biometriccommandexecution").post(executeBiometricCommandExecution);
biometricdevicebrandRoute.route("/biometricuseridcheck").post(getBiometricAvailableUserId);
biometricdevicebrandRoute.route("/biometricsingleuseradd").post(addNewUserBiometricBrand);
biometricdevicebrandRoute.route("/biometricsingleuserProfile").post(getSingleUserProfileString);
biometricdevicebrandRoute.route("/biometricbrandmodel/:id").delete(deleteBioMetricBrand).get(getSingleBioMetricBrand).put(updateBioMetricBrand);

const { getNewUserIdList, addNewUserToDevice,addNewVisitorToDevice, getAttendanceDetails } = require("./bowerBiometric");
biometricdevicebrandRoute.route("/getnewbiometricuserid").post(getNewUserIdList);
biometricdevicebrandRoute.route("/getnewbiometricuseradd").post(addNewUserToDevice);
biometricdevicebrandRoute.route("/addnewbiometricvisitor").post(addNewVisitorToDevice);
biometricdevicebrandRoute.route("/getattendanceDetails").post(getAttendanceDetails);



const { getAllUsersGrouping, addNewUserGrouping, deleteUserGrouping, getSingleUserGrouping,getBiometricPairDevicesDuplicateSwitches, updateUserGrouping } = require("../controller/modules/biometric/BiometricUsersGroupingController.js");
biometricdevicebrandRoute.route("/getallbiometricusersgrouping").get(getAllUsersGrouping);
biometricdevicebrandRoute.route("/addnewbiometricusersgrouping").post(addNewUserGrouping);
biometricdevicebrandRoute.route('/biometricpairdevicesduplicateswitches').post(getBiometricPairDevicesDuplicateSwitches);
biometricdevicebrandRoute.route("/biometricusersgrouping/:id").delete(deleteUserGrouping).get(getSingleUserGrouping).put(updateUserGrouping);



// connect remainder category form controller
const { getAllBiometricDevicesPairing, getAllBiometricDevicesAreaBased, getSingleBulkBiometricPairingDelete, getOverallBulkBiometricPairingDeviceDelete, getAllBiometricPairedDevicesAreaBased, getSingleBiometricDevicesPairing, addBiometricDevicesPairing, updateBiometricDevicesPairing, deleteBiometricDevicesPairing } = require('../controller/modules/biometric/BiometricDevicesPairingController.js');
biometricdevicebrandRoute.route('/biometricdevicespairing').get(getAllBiometricDevicesPairing);
biometricdevicebrandRoute.route('/biometricdevicesbasedonarea').post(getAllBiometricDevicesAreaBased);
biometricdevicebrandRoute.route('/biometricpaireddevicesbasedonarea').post(getAllBiometricPairedDevicesAreaBased);
biometricdevicebrandRoute.route('/overallbulkbiometricdevicepairingdelete').post(getOverallBulkBiometricPairingDeviceDelete);
biometricdevicebrandRoute.route('/singlebiometricpairingdelete').post(getSingleBulkBiometricPairingDelete);
biometricdevicebrandRoute.route('/biometricdevicespairing/new').post(addBiometricDevicesPairing);
biometricdevicebrandRoute.route('/biometricdevicespairing/:id').get(getSingleBiometricDevicesPairing).put(updateBiometricDevicesPairing).delete(deleteBiometricDevicesPairing);

// connect remainder category form controller
const { getAllBiometricPairedDevicesGrouping, getSingleBiometricPairedDevicesGrouping,getAllBiometricPairedDevicesAndUnpairedUser, getAllBiometricPairedDevicesAndUnpaired, addBiometricPairedDevicesGrouping, updateBiometricPairedDevicesGrouping, deleteBiometricPairedDevicesGrouping } = require('../controller/modules/biometric/BiometricPairedDevicesGroupingController.js');
biometricdevicebrandRoute.route('/biometricpaireddevicegroupings').get(getAllBiometricPairedDevicesGrouping);
biometricdevicebrandRoute.route('/biometricpaireddevicesandunpaired').post(getAllBiometricPairedDevicesAndUnpaired);
biometricdevicebrandRoute.route('/biometricpaireddevicesandunpaireduser').post(getAllBiometricPairedDevicesAndUnpairedUser);
biometricdevicebrandRoute.route('/biometricpaireddevicegrouping/new').post(addBiometricPairedDevicesGrouping);
biometricdevicebrandRoute.route('/biometricpaireddevicegrouping/:id').get(getSingleBiometricPairedDevicesGrouping).put(updateBiometricPairedDevicesGrouping).delete(deleteBiometricPairedDevicesGrouping);







const { getBiometricTestStatus } = require("../controller/modules/biometric/biometricteststatus");
biometricdevicebrandRoute.route("/biometricteststatus").get(getBiometricTestStatus);

const { getAllattLog, addAttLog, getUsersAttendanceReports, getUsersAttendanceReportsCheck,
    getUsersBranchWiseExitReports, getUsersTeamHierarchyAttendanceReports, getUsersTeamHierarchyAttendanceReportsCheck,
    getUnmatchedUsersAttendanceReports, getUsersNonEntryBranchWiseList, getUsersNonEntryBranchWiseListCheck,
    getUsersBranchWiseExitReportsCheck,
    getUsersAttendanceTotalHoursReportsCheck, getUnmatchedUsersAttendanceReportsCheck,
    getBiometricVisitorsAttendanceReport,
    getUsersAttendanceTotalHoursReports, getUsersExitReports, getAllDuplicateBiometricLogs, getUsersExitReportsCheck, getOverallBiometricUsersAttendance } = require("../controller/modules/biometric/biometricattalog");
biometricdevicebrandRoute.route("/biometricattlogs").get(getAllattLog);
biometricdevicebrandRoute.route("/duplicatebiometriclogs").post(getAllDuplicateBiometricLogs);
biometricdevicebrandRoute.route("/biometricuserattendancereport").post(getUsersAttendanceReports);
biometricdevicebrandRoute.route("/biometricuserattendancereportcheck").post(getUsersAttendanceReportsCheck);
biometricdevicebrandRoute.route("/biometricunmatchedusersattendancereport").post(getUnmatchedUsersAttendanceReports);
biometricdevicebrandRoute.route("/biometricunmatchedusersattendancereportcheck").post(getUnmatchedUsersAttendanceReportsCheck);
biometricdevicebrandRoute.route("/biometricvisitorsattendancereportcheck").post(getBiometricVisitorsAttendanceReport);
biometricdevicebrandRoute.route("/biometricexitreport").post(getUsersExitReports);
biometricdevicebrandRoute.route("/biometricexitreportcheck").post(getUsersExitReportsCheck);
biometricdevicebrandRoute.route("/biometricbranchwiseexitreport").post(getUsersBranchWiseExitReports);
biometricdevicebrandRoute.route("/biometricbranchwiseexitreportcheck").post(getUsersBranchWiseExitReportsCheck);
biometricdevicebrandRoute.route("/biometricnonentrybranchwiselist").post(getUsersNonEntryBranchWiseList);
biometricdevicebrandRoute.route("/biometricnonentrybranchwiselistcheck").post(getUsersNonEntryBranchWiseListCheck);
biometricdevicebrandRoute.route("/biometricuserattendancetotalhoursreport").post(getUsersAttendanceTotalHoursReports);
biometricdevicebrandRoute.route("/biometricuserattendancetotalhoursreportcheck").post(getUsersAttendanceTotalHoursReportsCheck);
biometricdevicebrandRoute.route("/biometricusersteamattendancereport").post(getUsersTeamHierarchyAttendanceReports);
biometricdevicebrandRoute.route("/biometricusersteamattendancereportcheck").post(getUsersTeamHierarchyAttendanceReportsCheck);
biometricdevicebrandRoute.route("/biometricattlog/new").post(addAttLog);
biometricdevicebrandRoute.route("/overallbiometricusersattendance").post(getOverallBiometricUsersAttendance);

const { getAllDeviceinfo, addDeviceinfo, getDeviceinfoFromSite } = require("../controller/modules/biometric/getdeviceinfo");
biometricdevicebrandRoute.route("/getbiometricdeviceinfo").get(getAllDeviceinfo);
biometricdevicebrandRoute.route("/getbiometricdeviceinfofromsite").post(getDeviceinfoFromSite);

// biometricdevicebrandRoute.route("/biometricparticulardevices").post(getParticularDeviceinfo);
// biometricdevicebrandRoute.route("/bioonlinestatus/new").post(addDeviceinfo);

const { getAllOnlineStatus, addOnlineStatus, getParticularOnlineStatus, getParticularDeviceOnlineStatus } = require("../controller/modules/biometric/biometriconlinestatus");
biometricdevicebrandRoute.route("/biooallonlinestatus").get(getAllOnlineStatus);
biometricdevicebrandRoute.route("/biometricdevicestatuslist").post(getParticularOnlineStatus);
biometricdevicebrandRoute.route("/biometricparticulardevicestatus").post(getParticularDeviceOnlineStatus);
biometricdevicebrandRoute.route("/bioonlinestatus/new").post(addOnlineStatus);

const { getAllBiocommandcomplete, addCommandComplete } = require("../controller/modules/biometric/biocommandcomplete");
biometricdevicebrandRoute.route("/bioallcmdcomplete").get(getAllBiocommandcomplete);
biometricdevicebrandRoute.route("/biocmdcpl/new").post(addCommandComplete);

const { getSendCommand, getCompleteCommand, getCompleteListCommand, getBioDownlodUser,
    getBioUploadUserTemplate, getBioDownloadUserTemplate, getUserDataIndCheck, getBioPendingUserTemplate,
    getUploadUserTemplateInfo, getDeviceInfoCommand, getUserPendingReports, getUserDetailsEditUnmatchedData, getUserDetailsEditData } = require("../controller/modules/biometric/biosendcommnad");
biometricdevicebrandRoute.route("/biosendcommand").post(getSendCommand);
biometricdevicebrandRoute.route("/biouploadusertemplateinfo").post(getUploadUserTemplateInfo);
biometricdevicebrandRoute.route("/biocompletedcommand").post(getCompleteCommand);
biometricdevicebrandRoute.route("/bionotcompletecommand").post(getCompleteListCommand);
biometricdevicebrandRoute.route("/bioDeviceInfoCommand").post(getDeviceInfoCommand);
biometricdevicebrandRoute.route("/biometricIndividualUserCheck").post(getUserPendingReports);
biometricdevicebrandRoute.route("/biometricedituserdata").post(getUserDetailsEditData);
biometricdevicebrandRoute.route("/biometricUserDataIndCheck").post(getUserDataIndCheck);
biometricdevicebrandRoute.route("/biometriceditunmatcheduserdata/:id").put(getUserDetailsEditUnmatchedData);

//Checking
biometricdevicebrandRoute.route("/biodownloaduser").post(getBioDownlodUser);
biometricdevicebrandRoute.route("/biouploadusertemplate").post(getBioUploadUserTemplate);
biometricdevicebrandRoute.route("/biodownloadusertemplate").post(getBioDownloadUserTemplate);
biometricdevicebrandRoute.route("/biopendingusertemplate").post(getBioPendingUserTemplate);


const { getAllUploadUserInfo, addUploadUserInfo,getAllUserBioInfos,getBiometricVisitorDeletionDetails,getVisitorsEnableListDetailsById,getFilteredBiometricVisitorDetails ,getAllUsersFromDeviceToDatabase} = require("../controller/modules/biometric/uploaduserinfo");
biometricdevicebrandRoute.route("/biouploaduserinfos").get(getAllUploadUserInfo);
biometricdevicebrandRoute.route("/getfilteredbiometricvisitordetails").post(getFilteredBiometricVisitorDetails);
biometricdevicebrandRoute.route("/enablevisitorsdetailsbyid").post(getVisitorsEnableListDetailsById);
biometricdevicebrandRoute.route("/biometricvisitordeletiondetails").post(getBiometricVisitorDeletionDetails);
biometricdevicebrandRoute.route("/biometricusersaddedlist").post(getAllUserBioInfos);
biometricdevicebrandRoute.route("/importbiometricusersfromdevice").post(getAllUsersFromDeviceToDatabase);
biometricdevicebrandRoute.route("/addbiometricIndividualUser/new").post(addUploadUserInfo);



const { getAllBiometricUnregistered, addBiometricUnregistered ,getFilteredBiometricUnregistered , getAllDuplicateBiometricUnregistered} = require("../controller/modules/biometric/biometricUnregistered.js");
biometricdevicebrandRoute.route("/biometricunregisteredusers").get(getAllBiometricUnregistered);
biometricdevicebrandRoute.route("/duplicatebiometricunregisteredusers").post(getAllDuplicateBiometricUnregistered);
biometricdevicebrandRoute.route("/biometricunregisteredusersfilter").post(getFilteredBiometricUnregistered);
biometricdevicebrandRoute.route("/addbiometricunregistereduser/new").post(addBiometricUnregistered);



// BIOMETRIC DEVICE RELATED ROUTES WHICH WAS LINKED FROM SITE
const { getAllUploadUserFromSite, addUploadUserFromSite, getEditBiometricUserCheck, getIndividualUploadUserFromSite } = require("../controller/modules/biometric/uploaduserfromsite");
biometricdevicebrandRoute.route("/biometricusersadditionlist").get(getAllUploadUserFromSite);
biometricdevicebrandRoute.route("/biometricIndividualduplicateUserCheck").post(getIndividualUploadUserFromSite);
// biometricdevicebrandRoute.route("/addbiometricIndividualUser/new").post(addUploadUserFromSite);
biometricdevicebrandRoute.route("/biometriceditusercheck").post(getEditBiometricUserCheck);


//connect taskschedule form controller
// const { getAllBioMetricBrand, getSingleBioMetricBrand, deleteBioMetricBrand, updateBioMetricBrand, addBioMetricBrand } = require('../controller/modules/biometric/biometricBrand');
// biometricdevicebrandRoute.route('/allbiometricbrandmodel').get(getAllBioMetricBrand);
// biometricdevicebrandRoute.route('/biometricbrandmodel/new').post(addBioMetricBrand);
// biometricdevicebrandRoute.route('/biometricbrandmodel/:id').delete(deleteBioMetricBrand).get(getSingleBioMetricBrand).put(updateBioMetricBrand);

//connect taskschedule form controller
// const { getAllBioMetricDeviceMaster, getSingleBioMetricDeviceMaster, deleteBioMetricDeviceMaster, addBioMetricDeviceMaster, updateBioMetricDeviceMaster } = require('../controller/modules/biometric/biometricdevicemaster');
// biometricdevicebrandRoute.route('/allbiometricdevicemaster').get(getAllBioMetricDeviceMaster);
// biometricdevicebrandRoute.route('/biometricdevicemaster/new').post(addBioMetricDeviceMaster);
// biometricdevicebrandRoute.route('/biometricdevicemaster/:id').delete(deleteBioMetricDeviceMaster).get(getSingleBioMetricDeviceMaster).put(updateBioMetricDeviceMaster);

// // Newly Added from biometric.js to use three biometric Devices
// const {
//   getAllBioMetricBrand,
//   getSingleBioMetricBrand,
//   addNewUserBiometricBrand,
//   getBiometricDeviceBrandIdentification,
//   getBiometricAvailableUserId,
//   deleteBioMetricBrand,
//   executeBiometricCommandExecution,
//   updateBioMetricBrand,
//   addBioMetricBrand,
// } = require('../controller/modules/biometric/biometricBrand');
// biometricdevicebrandRoute.route('/allbiometricbrandmodel').get(getAllBioMetricBrand);
// biometricdevicebrandRoute.route('/biometricdevicebrandidentification').post(getBiometricDeviceBrandIdentification);
// biometricdevicebrandRoute.route('/biometricbrandmodel/new').post(addBioMetricBrand);
// biometricdevicebrandRoute.route('/biometriccommandexecution').post(executeBiometricCommandExecution);
// biometricdevicebrandRoute.route('/biometricuseridcheck').post(getBiometricAvailableUserId);
// biometricdevicebrandRoute.route('/biometricsingleuseradd').post(addNewUserBiometricBrand);
// biometricdevicebrandRoute.route('/biometricbrandmodel/:id').delete(deleteBioMetricBrand).get(getSingleBioMetricBrand).put(updateBioMetricBrand);

// // Bower Biometric Device
// const { getNewUserIdList, addNewUserToDevice, getAttendanceDetails } = require('./bowerBiometric');
// biometricdevicebrandRoute.route('/getnewbiometricuserid').post(getNewUserIdList);
// biometricdevicebrandRoute.route('/getnewbiometricuseradd').post(addNewUserToDevice);
// biometricdevicebrandRoute.route('/getattendanceDetails').post(getAttendanceDetails);

// const { getAllUsersGrouping, addNewUserGrouping, deleteUserGrouping, getSingleUserGrouping, getBiometricPairDevicesDuplicateSwitches, updateUserGrouping } = require('../controller/modules/biometric/BiometricUsersGroupingController.js');
// biometricdevicebrandRoute.route('/getallbiometricusersgrouping').get(getAllUsersGrouping);
// biometricdevicebrandRoute.route('/addnewbiometricusersgrouping').post(addNewUserGrouping);
// biometricdevicebrandRoute.route('/biometricpairdevicesduplicateswitches').post(getBiometricPairDevicesDuplicateSwitches);

// biometricdevicebrandRoute.route('/biometricusersgrouping/:id').delete(deleteUserGrouping).get(getSingleUserGrouping).put(updateUserGrouping);

// // connect remainder category form controller
// const {
//   getAllBiometricDevicesPairing,
//   getAllBiometricDevicesAreaBased,
//   getAllBiometricPairedDevicesAreaBased,
//   getSingleBiometricDevicesPairing,
//   addBiometricDevicesPairing,
//   updateBiometricDevicesPairing,
//   deleteBiometricDevicesPairing,
//   getOverallBulkBiometricPairingDeviceDelete,
//   getSingleBulkBiometricPairingDelete,
// } = require('../controller/modules/biometric/BiometricDevicesPairingController.js');
// biometricdevicebrandRoute.route('/biometricdevicespairing').get(getAllBiometricDevicesPairing);
// biometricdevicebrandRoute.route('/biometricdevicesbasedonarea').post(getAllBiometricDevicesAreaBased);
// biometricdevicebrandRoute.route('/overallbulkbiometricdevicepairingdelete').post(getOverallBulkBiometricPairingDeviceDelete);
// biometricdevicebrandRoute.route('/singlebiometricpairingdelete').post(getSingleBulkBiometricPairingDelete);
// biometricdevicebrandRoute.route('/biometricpaireddevicesbasedonarea').post(getAllBiometricPairedDevicesAreaBased);
// biometricdevicebrandRoute.route('/biometricdevicespairing/new').post(addBiometricDevicesPairing);
// biometricdevicebrandRoute.route('/biometricdevicespairing/:id').get(getSingleBiometricDevicesPairing).put(updateBiometricDevicesPairing).delete(deleteBiometricDevicesPairing);

// const { getAllUploadUserInfo, addUploadUserInfo, getAllUsersFromDeviceToDatabase } = require('../controller/modules/biometric/uploaduserinfo');
// biometricdevicebrandRoute.route('/biouploaduserinfos').get(getAllUploadUserInfo);
// biometricdevicebrandRoute.route('/importbiometricusersfromdevice').post(getAllUsersFromDeviceToDatabase);
// biometricdevicebrandRoute.route('/addbiometricIndividualUser/new').post(addUploadUserInfo);

// // connect remainder category form controller
// const {
//   getAllBiometricPairedDevicesGrouping,
//   getSingleBiometricPairedDevicesGrouping,
//   getAllBiometricPairedDevicesAndUnpaired,
//   addBiometricPairedDevicesGrouping,
//   updateBiometricPairedDevicesGrouping,
//   deleteBiometricPairedDevicesGrouping,
// } = require('../controller/modules/biometric/BiometricPairedDevicesGroupingController.js');
// biometricdevicebrandRoute.route('/biometricpaireddevicegroupings').get(getAllBiometricPairedDevicesGrouping);
// biometricdevicebrandRoute.route('/biometricpaireddevicesandunpaired').post(getAllBiometricPairedDevicesAndUnpaired);
// biometricdevicebrandRoute.route('/biometricpaireddevicegrouping/new').post(addBiometricPairedDevicesGrouping);
// biometricdevicebrandRoute.route('/biometricpaireddevicegrouping/:id').get(getSingleBiometricPairedDevicesGrouping).put(updateBiometricPairedDevicesGrouping).delete(deleteBiometricPairedDevicesGrouping);

module.exports = biometricdevicebrandRoute;