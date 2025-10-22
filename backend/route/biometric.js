const express = require("express");
const biometricRoute = express.Router();





const { getAllBioMetricBrand, getSingleBioMetricBrand, addNewUserBiometricBrand, getSingleUserProfileString, getBiometricDeviceBrandIdentification, getBiometricAvailableUserId, deleteBioMetricBrand, executeBiometricCommandExecution, updateBioMetricBrand, addBioMetricBrand } = require("../controller/modules/biometric/biometricBrand");
biometricRoute.route("/allbiometricbrandmodel").get(getAllBioMetricBrand);
biometricRoute.route("/biometricdevicebrandidentification").post(getBiometricDeviceBrandIdentification);
biometricRoute.route("/biometricbrandmodel/new").post(addBioMetricBrand);
biometricRoute.route("/biometriccommandexecution").post(executeBiometricCommandExecution);
biometricRoute.route("/biometricuseridcheck").post(getBiometricAvailableUserId);
biometricRoute.route("/biometricsingleuseradd").post(addNewUserBiometricBrand);
biometricRoute.route("/biometricsingleuserProfile").post(getSingleUserProfileString);
biometricRoute.route("/biometricbrandmodel/:id").delete(deleteBioMetricBrand).get(getSingleBioMetricBrand).put(updateBioMetricBrand);

const { getNewUserIdList, addNewUserToDevice,addNewVisitorToDevice, getAttendanceDetails } = require("./bowerBiometric");
biometricRoute.route("/getnewbiometricuserid").post(getNewUserIdList);
biometricRoute.route("/getnewbiometricuseradd").post(addNewUserToDevice);
biometricRoute.route("/addnewbiometricvisitor").post(addNewVisitorToDevice);
biometricRoute.route("/getattendanceDetails").post(getAttendanceDetails);



const { getAllUsersGrouping, addNewUserGrouping, deleteUserGrouping, getSingleUserGrouping,getBiometricPairDevicesDuplicateSwitches, updateUserGrouping } = require("../controller/modules/biometric/BiometricUsersGroupingController.js");
biometricRoute.route("/getallbiometricusersgrouping").get(getAllUsersGrouping);
biometricRoute.route("/addnewbiometricusersgrouping").post(addNewUserGrouping);
biometricRoute.route('/biometricpairdevicesduplicateswitches').post(getBiometricPairDevicesDuplicateSwitches);
biometricRoute.route("/biometricusersgrouping/:id").delete(deleteUserGrouping).get(getSingleUserGrouping).put(updateUserGrouping);



// connect remainder category form controller
const { getAllBiometricDevicesPairing, getAllBiometricDevicesAreaBased, getSingleBulkBiometricPairingDelete, getOverallBulkBiometricPairingDeviceDelete, getAllBiometricPairedDevicesAreaBased, getSingleBiometricDevicesPairing, addBiometricDevicesPairing, updateBiometricDevicesPairing, deleteBiometricDevicesPairing } = require('../controller/modules/biometric/BiometricDevicesPairingController.js');
biometricRoute.route('/biometricdevicespairing').get(getAllBiometricDevicesPairing);
biometricRoute.route('/biometricdevicesbasedonarea').post(getAllBiometricDevicesAreaBased);
biometricRoute.route('/biometricpaireddevicesbasedonarea').post(getAllBiometricPairedDevicesAreaBased);
biometricRoute.route('/overallbulkbiometricdevicepairingdelete').post(getOverallBulkBiometricPairingDeviceDelete);
biometricRoute.route('/singlebiometricpairingdelete').post(getSingleBulkBiometricPairingDelete);
biometricRoute.route('/biometricdevicespairing/new').post(addBiometricDevicesPairing);
biometricRoute.route('/biometricdevicespairing/:id').get(getSingleBiometricDevicesPairing).put(updateBiometricDevicesPairing).delete(deleteBiometricDevicesPairing);

// connect remainder category form controller
const { getAllBiometricPairedDevicesGrouping, getSingleBiometricPairedDevicesGrouping,getAllBiometricPairedDevicesAndUnpairedUser, getAllBiometricPairedDevicesAndUnpaired, addBiometricPairedDevicesGrouping, updateBiometricPairedDevicesGrouping, deleteBiometricPairedDevicesGrouping } = require('../controller/modules/biometric/BiometricPairedDevicesGroupingController.js');
biometricRoute.route('/biometricpaireddevicegroupings').get(getAllBiometricPairedDevicesGrouping);
biometricRoute.route('/biometricpaireddevicesandunpaired').post(getAllBiometricPairedDevicesAndUnpaired);
biometricRoute.route('/biometricpaireddevicesandunpaireduser').post(getAllBiometricPairedDevicesAndUnpairedUser);
biometricRoute.route('/biometricpaireddevicegrouping/new').post(addBiometricPairedDevicesGrouping);
biometricRoute.route('/biometricpaireddevicegrouping/:id').get(getSingleBiometricPairedDevicesGrouping).put(updateBiometricPairedDevicesGrouping).delete(deleteBiometricPairedDevicesGrouping);







const { getBiometricTestStatus } = require("../controller/modules/biometric/biometricteststatus");
biometricRoute.route("/biometricteststatus").get(getBiometricTestStatus);

const { getAllattLog, addAttLog, getUsersAttendanceReports, getUsersAttendanceReportsCheck,
    getUsersBranchWiseExitReports, getUsersTeamHierarchyAttendanceReports, getUsersTeamHierarchyAttendanceReportsCheck,
    getUnmatchedUsersAttendanceReports, getUsersNonEntryBranchWiseList, getUsersNonEntryBranchWiseListCheck,
    getUsersBranchWiseExitReportsCheck,
    getUsersAttendanceTotalHoursReportsCheck, getUnmatchedUsersAttendanceReportsCheck,
    getUsersAttendanceTotalHoursReports, getUsersExitReports, getAllDuplicateBiometricLogs, getUsersExitReportsCheck, getOverallBiometricUsersAttendance } = require("../controller/modules/biometric/biometricattalog");
biometricRoute.route("/biometricattlogs").get(getAllattLog);
biometricRoute.route("/duplicatebiometriclogs").post(getAllDuplicateBiometricLogs);
biometricRoute.route("/biometricuserattendancereport").post(getUsersAttendanceReports);
biometricRoute.route("/biometricuserattendancereportcheck").post(getUsersAttendanceReportsCheck);
biometricRoute.route("/biometricunmatchedusersattendancereport").post(getUnmatchedUsersAttendanceReports);
biometricRoute.route("/biometricunmatchedusersattendancereportcheck").post(getUnmatchedUsersAttendanceReportsCheck);
biometricRoute.route("/biometricexitreport").post(getUsersExitReports);
biometricRoute.route("/biometricexitreportcheck").post(getUsersExitReportsCheck);
biometricRoute.route("/biometricbranchwiseexitreport").post(getUsersBranchWiseExitReports);
biometricRoute.route("/biometricbranchwiseexitreportcheck").post(getUsersBranchWiseExitReportsCheck);
biometricRoute.route("/biometricnonentrybranchwiselist").post(getUsersNonEntryBranchWiseList);
biometricRoute.route("/biometricnonentrybranchwiselistcheck").post(getUsersNonEntryBranchWiseListCheck);
biometricRoute.route("/biometricuserattendancetotalhoursreport").post(getUsersAttendanceTotalHoursReports);
biometricRoute.route("/biometricuserattendancetotalhoursreportcheck").post(getUsersAttendanceTotalHoursReportsCheck);
biometricRoute.route("/biometricusersteamattendancereport").post(getUsersTeamHierarchyAttendanceReports);
biometricRoute.route("/biometricusersteamattendancereportcheck").post(getUsersTeamHierarchyAttendanceReportsCheck);
biometricRoute.route("/biometricattlog/new").post(addAttLog);
biometricRoute.route("/overallbiometricusersattendance").post(getOverallBiometricUsersAttendance);

const { getAllDeviceinfo, addDeviceinfo, getDeviceinfoFromSite } = require("../controller/modules/biometric/getdeviceinfo");
biometricRoute.route("/getbiometricdeviceinfo").get(getAllDeviceinfo);
biometricRoute.route("/getbiometricdeviceinfofromsite").post(getDeviceinfoFromSite);

// biometricRoute.route("/biometricparticulardevices").post(getParticularDeviceinfo);
// biometricRoute.route("/bioonlinestatus/new").post(addDeviceinfo);

const { getAllOnlineStatus, addOnlineStatus, getParticularOnlineStatus, getParticularDeviceOnlineStatus } = require("../controller/modules/biometric/biometriconlinestatus");
biometricRoute.route("/biooallonlinestatus").get(getAllOnlineStatus);
biometricRoute.route("/biometricdevicestatuslist").post(getParticularOnlineStatus);
biometricRoute.route("/biometricparticulardevicestatus").post(getParticularDeviceOnlineStatus);
biometricRoute.route("/bioonlinestatus/new").post(addOnlineStatus);

const { getAllBiocommandcomplete, addCommandComplete } = require("../controller/modules/biometric/biocommandcomplete");
biometricRoute.route("/bioallcmdcomplete").get(getAllBiocommandcomplete);
biometricRoute.route("/biocmdcpl/new").post(addCommandComplete);

const { getSendCommand, getCompleteCommand, getCompleteListCommand, getBioDownlodUser,
    getBioUploadUserTemplate, getBioDownloadUserTemplate, getUserDataIndCheck, getBioPendingUserTemplate,
    getUploadUserTemplateInfo, getDeviceInfoCommand, getUserPendingReports, getUserDetailsEditUnmatchedData, getUserDetailsEditData } = require("../controller/modules/biometric/biosendcommnad");
biometricRoute.route("/biosendcommand").post(getSendCommand);
biometricRoute.route("/biouploadusertemplateinfo").post(getUploadUserTemplateInfo);
biometricRoute.route("/biocompletedcommand").post(getCompleteCommand);
biometricRoute.route("/bionotcompletecommand").post(getCompleteListCommand);
biometricRoute.route("/bioDeviceInfoCommand").post(getDeviceInfoCommand);
biometricRoute.route("/biometricIndividualUserCheck").post(getUserPendingReports);
biometricRoute.route("/biometricedituserdata").post(getUserDetailsEditData);
biometricRoute.route("/biometricUserDataIndCheck").post(getUserDataIndCheck);
biometricRoute.route("/biometriceditunmatcheduserdata/:id").put(getUserDetailsEditUnmatchedData);

//Checking
biometricRoute.route("/biodownloaduser").post(getBioDownlodUser);
biometricRoute.route("/biouploadusertemplate").post(getBioUploadUserTemplate);
biometricRoute.route("/biodownloadusertemplate").post(getBioDownloadUserTemplate);
biometricRoute.route("/biopendingusertemplate").post(getBioPendingUserTemplate);


const { getAllUploadUserInfo, addUploadUserInfo,getAllUserBioInfos ,getAllUsersFromDeviceToDatabase} = require("../controller/modules/biometric/uploaduserinfo");
biometricRoute.route("/biouploaduserinfos").get(getAllUploadUserInfo);
biometricRoute.route("/biometricusersaddedlist").post(getAllUserBioInfos);
biometricRoute.route("/importbiometricusersfromdevice").post(getAllUsersFromDeviceToDatabase);
biometricRoute.route("/addbiometricIndividualUser/new").post(addUploadUserInfo);



const { getAllBiometricUnregistered, addBiometricUnregistered ,getFilteredBiometricUnregistered , getAllDuplicateBiometricUnregistered} = require("../controller/modules/biometric/biometricUnregistered.js");
biometricRoute.route("/biometricunregisteredusers").get(getAllBiometricUnregistered);
biometricRoute.route("/duplicatebiometricunregisteredusers").post(getAllDuplicateBiometricUnregistered);
biometricRoute.route("/biometricunregisteredusersfilter").post(getFilteredBiometricUnregistered);
biometricRoute.route("/addbiometricunregistereduser/new").post(addBiometricUnregistered);



// BIOMETRIC DEVICE RELATED ROUTES WHICH WAS LINKED FROM SITE
const { getAllUploadUserFromSite, addUploadUserFromSite, getEditBiometricUserCheck, getIndividualUploadUserFromSite } = require("../controller/modules/biometric/uploaduserfromsite");
biometricRoute.route("/biometricusersadditionlist").get(getAllUploadUserFromSite);
biometricRoute.route("/biometricIndividualduplicateUserCheck").post(getIndividualUploadUserFromSite);
// biometricRoute.route("/addbiometricIndividualUser/new").post(addUploadUserFromSite);
biometricRoute.route("/biometriceditusercheck").post(getEditBiometricUserCheck);





module.exports = biometricRoute;


