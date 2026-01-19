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

const { getNewUserIdList, addNewUserToDevice,addNewVisitorToDevice, addNewVisitorToDeviceGlobal,getAttendanceDetails } = require("./bowerBiometric");
biometricRoute.route("/getnewbiometricuserid").post(getNewUserIdList);
biometricRoute.route("/getnewbiometricuseradd").post(addNewUserToDevice);
biometricRoute.route("/addnewbiometricvisitor").post(addNewVisitorToDevice);
biometricRoute.route("/addnewbiometricvisitorGlobal").post(addNewVisitorToDeviceGlobal);
biometricRoute.route("/getattendanceDetails").post(getAttendanceDetails);



const { getAllUsersGrouping, addNewUserGrouping, deleteUserGrouping, getSingleUserGrouping,getBiometricPairDevicesDuplicateSwitches, updateUserGrouping } = require("../controller/modules/biometric/BiometricUsersGroupingController.js");
biometricRoute.route("/getallbiometricusersgrouping").get(getAllUsersGrouping);
biometricRoute.route("/addnewbiometricusersgrouping").post(addNewUserGrouping);
biometricRoute.route('/biometricpairdevicesduplicateswitches').post(getBiometricPairDevicesDuplicateSwitches);
biometricRoute.route("/biometricusersgrouping/:id").delete(deleteUserGrouping).get(getSingleUserGrouping).put(updateUserGrouping);



// connect remainder category form controller
const { getAllBiometricDevicesPairing, getAllBiometricDevicesAreaBased,getAllBiometricDevicesAreaRfidBased, getSingleBulkBiometricPairingDelete, getOverallBulkBiometricPairingDeviceDelete, getAllBiometricPairedDevicesAreaBased, getSingleBiometricDevicesPairing, addBiometricDevicesPairing, updateBiometricDevicesPairing, deleteBiometricDevicesPairing } = require('../controller/modules/biometric/BiometricDevicesPairingController.js');
biometricRoute.route('/biometricdevicespairing').get(getAllBiometricDevicesPairing);
biometricRoute.route('/biometricdevicesbasedonarea').post(getAllBiometricDevicesAreaBased);
biometricRoute.route('/biometricdevicesbasedonarearfiddetails').post(getAllBiometricDevicesAreaRfidBased);
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

const { getAllattLog, addAttLog,  getUsersAttendanceReportsCheck,
      getUsersTeamHierarchyAttendanceReportsCheck,
     getUsersNonEntryBranchWiseListCheck,
    getUsersBranchWiseExitReportsCheck,
    getUsersAttendanceTotalHoursReportsCheck, getUnmatchedUsersAttendanceReportsCheck,
    getBiometricVisitorsAttendanceReport,
      getAllDuplicateBiometricLogs, getUsersExitReportsCheck} = require("../controller/modules/biometric/biometricattalog");
biometricRoute.route("/biometricattlogs").get(getAllattLog);
biometricRoute.route("/duplicatebiometriclogs").post(getAllDuplicateBiometricLogs);
biometricRoute.route("/biometricuserattendancereportcheck").post(getUsersAttendanceReportsCheck);
biometricRoute.route("/biometricunmatchedusersattendancereportcheck").post(getUnmatchedUsersAttendanceReportsCheck);
biometricRoute.route("/biometricvisitorsattendancereportcheck").post(getBiometricVisitorsAttendanceReport);
biometricRoute.route("/biometricexitreportcheck").post(getUsersExitReportsCheck);
biometricRoute.route("/biometricbranchwiseexitreportcheck").post(getUsersBranchWiseExitReportsCheck);
biometricRoute.route("/biometricnonentrybranchwiselistcheck").post(getUsersNonEntryBranchWiseListCheck);
biometricRoute.route("/biometricuserattendancetotalhoursreportcheck").post(getUsersAttendanceTotalHoursReportsCheck);
biometricRoute.route("/biometricusersteamattendancereportcheck").post(getUsersTeamHierarchyAttendanceReportsCheck);
biometricRoute.route("/biometricattlog/new").post(addAttLog);
// biometricRoute.route("/overallbiometricusersattendance").post(getOverallBiometricUsersAttendance);

const { getAllDeviceinfo, addDeviceinfo, getDeviceinfoFromSite } = require("../controller/modules/biometric/getdeviceinfo");
biometricRoute.route("/getbiometricdeviceinfo").get(getAllDeviceinfo);
biometricRoute.route("/getbiometricdeviceinfofromsite").post(getDeviceinfoFromSite);

// biometricRoute.route("/biometricparticulardevices").post(getParticularDeviceinfo);
// biometricRoute.route("/bioonlinestatus/new").post(addDeviceinfo);

const { getAllOnlineStatus, addOnlineStatus, getParticularOnlineStatus,getBiometricDevicesOfflineHistory, getParticularDeviceOnlineStatus } = require("../controller/modules/biometric/biometriconlinestatus");
biometricRoute.route("/biooallonlinestatus").get(getAllOnlineStatus);
biometricRoute.route("/biometricdevicestatuslist").post(getParticularOnlineStatus);
biometricRoute.route("/biometricdevicesofflinehistory").post(getBiometricDevicesOfflineHistory);
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


const { getAllUploadUserInfo, addUploadUserInfo,getAllUserBioInfos,getNewUserIdGlobal,addFloorWiseUserAccessInBiometricDevice,getBiometricVisitorDeletionDetails,getVisitorsEnableListDetailsByIdGlobal,getVisitorsEnableListDetailsById,getFilteredBiometricVisitorDetails ,getAllUsersFromDeviceToDatabase} = require("../controller/modules/biometric/uploaduserinfo");
biometricRoute.route("/biouploaduserinfos").get(getAllUploadUserInfo);
biometricRoute.route("/getnewbiometricuseridglobal").post(getNewUserIdGlobal);
biometricRoute.route("/getfilteredbiometricvisitordetails").post(getFilteredBiometricVisitorDetails);
biometricRoute.route("/enablevisitorsdetailsbyid").post(getVisitorsEnableListDetailsById);
biometricRoute.route("/enablevisitorsdetailsbyidglobal").post(getVisitorsEnableListDetailsByIdGlobal);
biometricRoute.route("/biometricvisitordeletiondetails").post(getBiometricVisitorDeletionDetails);
biometricRoute.route("/biometricusersaddedlist").post(getAllUserBioInfos);
biometricRoute.route("/importbiometricusersfromdevice").post(getAllUsersFromDeviceToDatabase);
biometricRoute.route("/floorwiseuseraccessbiometricdevice").post(addFloorWiseUserAccessInBiometricDevice);
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



const { getAllLiftAuthorityAccessManagement, getSingleLiftAuthorityAccessManagement, deleteLiftAuthorityAccessManagement, addLiftAuthorityAccessManagement, updateLiftAuthorityAccessManagement } = require('../controller/modules/biometric/elevator/liftauthorityaccessmanagement');
biometricRoute.route('/allliftauthorityaccessmanagements').get(getAllLiftAuthorityAccessManagement);
biometricRoute.route('/liftauthorityaccessmanagement/new').post(addLiftAuthorityAccessManagement);
biometricRoute.route('/liftauthorityaccessmanagement/:id').delete(deleteLiftAuthorityAccessManagement).get(getSingleLiftAuthorityAccessManagement).put(updateLiftAuthorityAccessManagement);

const {
  addAssignElevatorPort,
  deleteAssignElevatorPort,
  updateAssignElevatorPort,
  getAllAssignElevatorPort,
  getSingleAssignElevatorPort,
  assignElevatorPortList,
  getOverallBulkAssignElevatorPortDelete,
  getSingleBulkAssignElevatorPortDelete,
} = require('../controller/modules/biometric/elevator/AssignElevatorPortController.js');

biometricRoute.route('/assignelevatorports').get(getAllAssignElevatorPort);
biometricRoute.route('/assignelevatorport/new').post(addAssignElevatorPort);
biometricRoute.route('/assignelevatorportlist').post(assignElevatorPortList);
biometricRoute.route('/overallbulkassignelevatorportdelete').post(getOverallBulkAssignElevatorPortDelete);
biometricRoute.route('/singleassignelevatorportdelete').post(getSingleBulkAssignElevatorPortDelete);
biometricRoute.route('/assignelevatorport/:id').get(getSingleAssignElevatorPort).put(updateAssignElevatorPort).delete(deleteAssignElevatorPort);



module.exports = biometricRoute;


