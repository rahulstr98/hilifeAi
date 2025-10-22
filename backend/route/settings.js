const express = require("express");
const settingsRoute = express.Router();
const organizationDocumentMulter = require("../middleware/organizationDocument");


//status master name route
const { updateOverAllSettings, createOverAllSettings, getLastOverAllSettings,getOverAllSettings, getOverAllSettingsAssignBranch, getOverAllSettingsLastIndex, getSingleOverAllSettings } = require("../controller/modules/settings/ControlPanelController");
// settingsRoute.route('/updatetwofaswitch/:id').put(updateTwofaSwitch);
// settingsRoute.route('/updatetwofaswitchuser/:id').get(getTwoFAupdateduser);
settingsRoute.route("/getoverallsettings").get(getOverAllSettings);
settingsRoute.route("/lastgetoverallsettings").get(getLastOverAllSettings);
settingsRoute.route("/createoverallsettings").post(createOverAllSettings);
settingsRoute.route("/getoverallsettingslastindex").get(getOverAllSettingsLastIndex);
settingsRoute.route("/singleoverallsettings/:id").put(updateOverAllSettings).get(getSingleOverAllSettings);
settingsRoute.route("/getoverallsettingsassignbranch").post(getOverAllSettingsAssignBranch);

const { getAllUsersSwitchDetails, addIndividualSettings, getUserIndividualLastIndex, getUserIndividual, deleteIndividualSettings, getAllIndividualSettings, getSingleIndividualSettings, updateIndividualSettings } = require("../controller/modules/settings/IndividualSettingsController");
settingsRoute.route("/getoverallusersswitch").get(getAllUsersSwitchDetails);
settingsRoute.route("/allindividualsettings").post(getAllIndividualSettings);
settingsRoute.route("/individualsettings/new").post(addIndividualSettings);
settingsRoute.route("/userindividuallastindex").get(getUserIndividualLastIndex);
settingsRoute.route("/userindividual").post(getUserIndividual);
settingsRoute.route("/individualsettings/:id").delete(deleteIndividualSettings).get(getSingleIndividualSettings).put(updateIndividualSettings);

//clokinip
const { addClockinIp, deleteClockinIp, getAllUsersDom, getAllUsersDoj, getAssignAllClockinIp, getAllClockinIp, getSingleClockinIp, updateClockinIp, getIPbyBranch, getAllUsersDates, getAllUsersDob } = require("../controller/modules/settings/ClockinipController");
settingsRoute.route("/allclockinip").get(getAllClockinIp);
settingsRoute.route("/assignallclockinip").post(getAssignAllClockinIp);
settingsRoute.route("/getallusersdates").get(getAllUsersDates);
settingsRoute.route("/getallusersdob").get(getAllUsersDob);
settingsRoute.route("/getallusersdoj").get(getAllUsersDoj);
settingsRoute.route("/getallusersdom").get(getAllUsersDom);
settingsRoute.route("/clockinip/new").post(addClockinIp);
settingsRoute.route("/getipbybranch").post(getIPbyBranch);
settingsRoute.route("/clockinip/:id").get(getSingleClockinIp).put(updateClockinIp).delete(deleteClockinIp);

//passwordlist
const { getAllUsersForPassword, getSingleUserPassword, updateSingleUserPassword, getAllUsersForPasswordAssignbranch } = require("../controller/modules/settings/PasswordListController");
settingsRoute.route("/alluserspasswordchange").get(getAllUsersForPassword);
settingsRoute.route("/singleuserpasswordchange/:id").get(getSingleUserPassword).put(updateSingleUserPassword);
settingsRoute.route("/alluserspasswordchangeassignbranch").post(getAllUsersForPasswordAssignbranch);
//Organization Documents

//category subcategory

const { addOrgCategory, deleteOrgCategory, overallBulkDeleteOrganizationCategory, getAllOrgCategory, getSingleOrgCategory, updateOrgCategory, getOverAllEditOrgdocuments } = require('../controller/modules/settings/organizationdocuments/OrganizationDocCategoryController');

settingsRoute.route("/organizationdocumentcategorys").get(getAllOrgCategory);
settingsRoute.route("/organizationdocumentcategory/new").post(addOrgCategory);
settingsRoute.route("/organizationcategorydocumentedit").post(getOverAllEditOrgdocuments);
settingsRoute.route("/organizationdocumentcategory/:id").delete(deleteOrgCategory).get(getSingleOrgCategory).put(updateOrgCategory);
settingsRoute
  .route("/overallbulkdelete/organizationcategory")
  .post(overallBulkDeleteOrganizationCategory);

  const { addOrgDocument, deleteOrgDocument, getAllOrgDocument,getAllOrgDocumentRequiredfiled, getImageAllOrgDocument, getAllOrgDocumentcategoryCheck, getSingleOrgDocument, getorgsubcategory, updateOrgDocument } = require("../controller/modules/settings/organizationdocuments/OrganizationDocumentController");
  settingsRoute.route("/allorgdocuments").get(getAllOrgDocument);
  settingsRoute.route("/allorgdocumentsrequiredfield").get(getAllOrgDocumentRequiredfiled);
  settingsRoute.route("/imageorgdocuments").get(getImageAllOrgDocument);
  // settingsRoute.route("/orgdocuments/new").post(addOrgDocument);
  settingsRoute.route("/orgdocuments/new").post(organizationDocumentMulter.fields([
    { name: "document", maxCount: 10 },
  ]), addOrgDocument);
  settingsRoute.route("/getorgsubcategoryref").post(getorgsubcategory);
  settingsRoute.route("/orgdocumentdelete").post(getAllOrgDocumentcategoryCheck);
  settingsRoute.route("/orgdocument/:id").get(getSingleOrgDocument)
    .put(organizationDocumentMulter.fields([
      { name: "document", maxCount: 10 },
    ]), updateOrgDocument)
    .delete(deleteOrgDocument);

// bankdetails verification route
const { Postbankdetailsverification, Getallbankdetailsverificationusers, Getsingleuserdetails, Deleteuser, Updateuserdetails, Getsingleempidbaseduserdetails, Getsingleempidbaseduserdetailsarray } = require('../controller/modules/Bankdetailsverification');
settingsRoute.route("/bankdetailsverfication/new").post(Postbankdetailsverification);
settingsRoute.route("/bankdetailsverfication/all").get(Getallbankdetailsverificationusers);
settingsRoute.route("/bankdetailsverfication/single/:id").get(Getsingleuserdetails).put(Updateuserdetails).delete(Deleteuser);
settingsRoute.route("/bankdetailsverfication/single/empidbased/:empid").get(Getsingleempidbaseduserdetails);
settingsRoute.route("/bankdetailsverfication/single/empidbasedarr/:empid").get(Getsingleempidbaseduserdetailsarray);

const {
  getAllRaise,
  addRaise,
  updateRaise,
  getSingleRaise,
  getAllauthRaises,
  getAllauthRaise,
  deleteRaise,
  getOverAllauthRaise,
  getAllRaiseName,
  skippedRaiseProblem, skippedStatusRaiseProblem
} = require("../controller/modules/support/raiseproblem");
settingsRoute.route("/raises").get(getAllRaise);
settingsRoute.route("/raise/new").post(addRaise);
settingsRoute.route("/raise/:id").get(getSingleRaise).put(updateRaise).delete(deleteRaise);
settingsRoute.route("/overallraise").post(getOverAllauthRaise);
settingsRoute.route("/raisename").get(getAllRaiseName);
settingsRoute.route("/authraise").post(getAllauthRaise);
settingsRoute.route("/authraises").post(getAllauthRaises);
settingsRoute.route("/skippedraiseproblem").post(skippedRaiseProblem);
settingsRoute.route("/skippedraiseproblemstatus").post(skippedStatusRaiseProblem);


const { getAllCategoryMaster, addCategoryMaster, getSingleCategoryMaster, CategoryMasterOverallCategory, CategoryMasterOverallCategoryBulkdelete, updateCategoryMaster, deleteCategoryMaster } = require("../controller/modules/support/categorymaster");
settingsRoute.route("/categorymaster").get(getAllCategoryMaster);
settingsRoute.route("/categorymaster/new").post(addCategoryMaster);
settingsRoute.route("/overallcategorymastersupport").post(CategoryMasterOverallCategory);
settingsRoute.route("/overallcategorymastersupportbulkdelete").post(CategoryMasterOverallCategoryBulkdelete);
settingsRoute.route("/categorymaster/:id").get(getSingleCategoryMaster).put(updateCategoryMaster).delete(deleteCategoryMaster);

//Attendance Control Criteria
const {
  createAttendanceControlCriteria,
  getAllAttendanceControlCriteria,
  getSingleAttendanceControlCriteria,
  updateAttendanceControlCriteria,getAllAttendanceControlCriteriaLastIndexPayAmount,
  getAllAttendanceControlCriteriaLastIndex, getAllAttendanceControlCriteriaAssignBranch
} = require("../controller/modules/settings/Attendancecontrolcriteria");
settingsRoute
  .route("/allattendancecontrolcriterialastindex")
  .get(getAllAttendanceControlCriteriaLastIndex);
settingsRoute.route("/allattendancecontrolcriteriaassignbranch").post(getAllAttendanceControlCriteriaAssignBranch);
settingsRoute
  .route("/allattendancecontrolcriteria")
  .get(getAllAttendanceControlCriteria);
settingsRoute
  .route("/createattendancecontrolcriteria")
  .post(createAttendanceControlCriteria);
  settingsRoute.route("/allattendancecontrolcriterialastindexpayamount").get(getAllAttendanceControlCriteriaLastIndexPayAmount);
settingsRoute
  .route("/singleattendancecontrolcriteria/:id")
  .put(updateAttendanceControlCriteria)
  .get(getSingleAttendanceControlCriteria);

//My Creation
const {
  createMyCreation,
  getAllMyCreation,
  getSingleMyCreation,
  updateMyCreation,
  deleteMyCreation,
} = require("../controller/modules/settings/mycreation");
settingsRoute.route("/allmycreation").get(getAllMyCreation);
settingsRoute.route("/createmycreation").post(createMyCreation);
settingsRoute
  .route("/singlemycreation/:id")
  .put(updateMyCreation)
  .get(getSingleMyCreation)
  .delete(deleteMyCreation);


//AUTOLOGOUT
const {
  createAutoLogout,
  getAllAutoLogout,
  getSingleAutoLogout,
  updateAutoLogout, getAllAutoLogoutassignbranch
} = require("../controller/modules/settings/autologout");
settingsRoute.route("/allautologout").get(getAllAutoLogout);
settingsRoute.route("/allautologoutassignbranch").post(getAllAutoLogoutassignbranch);
settingsRoute.route("/createautologout").post(createAutoLogout);
settingsRoute
  .route("/singleautologout/:id")
  .put(updateAutoLogout)
  .get(getSingleAutoLogout);


const { getAllUsercheck, getSingleUsercheck, addUsercheck, skippedemployees } = require("../controller/modules/settings/Maintenancelog");
settingsRoute.route("/maintenancelog").get(getAllUsercheck);
settingsRoute.route("/maintenancelogsingle/:id").get(getSingleUsercheck)
settingsRoute.route("/maintenancelog/new").post(addUsercheck);
settingsRoute.route("/skippedemployee").post(skippedemployees);

//Template List - My Verification
const { addTemplateVerification, getAllTemplateVerification, getAllTemplateVerificationAssignBranch, getSingleTemplateVerification, updateTemplateVerification } = require("../controller/modules/settings/Templatelist");

settingsRoute.route("/myverification/new").post(addTemplateVerification);
settingsRoute.route("/myverifications").get(getAllTemplateVerification);
settingsRoute.route("/myverification").get(getSingleTemplateVerification);
settingsRoute.route("/myverification/:id").put(updateTemplateVerification);

settingsRoute.route("/myverificationsassignbranchuser").post(getAllTemplateVerificationAssignBranch);

const { addMyverification, getAllMyverification, getSingleMyverification, updateMyverification, getAllMyverificationAssignbranch } = require("../controller/modules/settings/Myverification");
settingsRoute.route("/myfieldverification/new").post(addMyverification);
settingsRoute.route("/myfieldverifications").get(getAllMyverification);
settingsRoute.route("/myfieldverification/:id").put(updateMyverification).get(getSingleMyverification);
settingsRoute.route("/myfieldverificationsassignbranch").post(getAllMyverificationAssignbranch);

const { addEventStorage, dynamicQueryEventController, getAllEventStorage, updateOtherCredentials } = require("../controller/modules/settings/eventstorage");
settingsRoute.route("/eventsonpc").post(addEventStorage);
settingsRoute.route("/queryeventsonpc").post(dynamicQueryEventController);
settingsRoute.route("/alleventstorage").get(getAllEventStorage);
settingsRoute.route("/updatemultipleusers").put(updateOtherCredentials);

//mailconfiguration
const { getAllMailconfiguration, updateSingleMailconfiguration, AddMailconfiguration } = require("../controller/modules/settings/MailconfigurationController");
settingsRoute.route("/mailconfigurationall").get(getAllMailconfiguration);
settingsRoute.route("/mailconfiguration/:id").put(updateSingleMailconfiguration);
settingsRoute.route("/mailconfiguration/new").post(AddMailconfiguration);

//meetingconfiguration
const { AddMeetingconfiguration, getAllMeetingconfiguration, updateSingleMeetingconfiguration } = require("../controller/modules/settings/MeetingconfigurationController");
settingsRoute.route("/meetingconfigurationall").get(getAllMeetingconfiguration);
settingsRoute.route("/meetingconfiguration/:id").put(updateSingleMeetingconfiguration);
settingsRoute.route("/meetingconfiguration/new").post(AddMeetingconfiguration);

const { createNotificationSound, deleteNotificationSound, getAllNotificationSound, getSingleNotificationSound, updateNotificationSound } = require('../controller/modules/settings/notificationsound');

settingsRoute.route("/notificationsounds").get(getAllNotificationSound);
settingsRoute.route("/notificationsound/new").post(createNotificationSound);
settingsRoute.route("/notificationsound/:id").delete(deleteNotificationSound).get(getSingleNotificationSound).put(updateNotificationSound);

//chatconfiguration
const { getAllChatConfiguration, AddChatConfiguration, updateSingleChatConfiguration } = require("../controller/modules/settings/Chatconfiguration");
settingsRoute.route("/chatconfigurationall").get(getAllChatConfiguration);
settingsRoute.route("/chatconfiguration/:id").put(updateSingleChatConfiguration);
settingsRoute.route("/chatconfiguration/new").post(AddChatConfiguration);


const { getAllholidayWeekoffDetails,
  addHolidayWeekOffRestriction,
  getSingleHolidayWeekOffrestriction,
  updateSingleHolidayWeekoffRestriction,
  deleteSingleHolidayWeekoffRestriction,
  deleteUserHolidayWeekoffRestriction,
  getUsersHolidayWeekoffRestrictions
} = require("../controller/modules/settings/HolidayWeekOffRestriction");
settingsRoute.route("/allholidayWeekoffrestrictions").get(getAllholidayWeekoffDetails);
settingsRoute.route("/holidayWeekoffrestriction/new").post(addHolidayWeekOffRestriction);
settingsRoute.route("/deleteholidayweekoffrestriction").post(deleteUserHolidayWeekoffRestriction);
settingsRoute.route("/usersholidayweekofstatus").post(getUsersHolidayWeekoffRestrictions);
settingsRoute.route("/holidayWeekoffrestriction/:id")
  .delete(deleteSingleHolidayWeekoffRestriction)
  .get(getSingleHolidayWeekOffrestriction)
  .put(updateSingleHolidayWeekoffRestriction);
  
module.exports = settingsRoute;
