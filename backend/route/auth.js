const express = require("express");
const authRoute = express.Router();

//authorized route
const { isAuthorized } = require("../middleware/routeauthorised");
const { getMulterMiddleware } = require('../middleware/EmployeeDocumentsMulter');
const { uploadRemoteWorkModeFiles } = require("../middleware/RemoteEmployeeListMulter");
const checkLDAPSetting = require('../middleware/LDAPSetting.js');


// connect customer group controller
const { getAllUsers, getAlluserDataFilterLongAbsend, getBiometricUsersAll, dayPointsFilterForSingleDateWithAttendance, getAllUserClockinAndClockoutStatusWithShiftModeFilterBulkUpdate, getAllEmployeesForHolidayWeekoffFilter, getAllRemoteIndividualuserFilter, getAllRemoteHierarchyBasedUsers, getAllunallotRemoteuserFilter, updateLoginAllotMoveToLive, internCodeAutogenerate, getAllUserClockinAndClockoutStatusFilterProdDayPoint, getAllEmployeesForAttendanceFilterProdDayPoint, getLimitedUserReportProductionMulti, getTeamWiseEmployees, createRocketChatAccountInEdit, getAllEmployeesForAttendanceFilterForShiftAdjFilterPage, updateBulkUsersShiftAllotObjects, getAlluserDataFilterLongAbsendCompleted, getAllUsersPostergenerate, getAllTheLogUsers, getAlluserDataFilterLongAbsendHierarchy,
  getAllEmployeesForAttendanceFilter, getFilteredUserForShiftAdjusment, dynamicQueryUserControllerSort, getAllUserstatusAnswerDefine, getAllEmployeesForAttendanceFilterIndividualType, getAllUserClockinAndClockoutStatusAttModeBasedFilter,getAllNotInEmployees, getAlluserDataFilterLongAbsendHierarchyHome,
  deleteUsersShiftAllot, getAllUsersnewFilter, updateBulkUsersShiftAllotObjectsForWeekoffAdjustmentOpt, getIndividualUserLoginStatus, getHierarchyBasedEmployeeStatus, getAllUsersexceldataAssignbranchHome,
  undoPayrunListInnerDataUser, updateVerifyUser, getAllUsersAssignbranch, createRocketChatNewuser, getAllUsersexceldataByAssign, getAllUserTotalShiftDaysHome,
  getAllUsersexceldataAssignbranch, getSingleRemoteWorkMode,
  updateAnyLogValuesOfRemoteWorkmode, getCurrentServerTime,
  updateRemoteWorkmode,
  dynamicQueryUserController, getUserCredentials, getAllUserTemporaryLoginStatus, checkEmployeeEmptyFields, getAllProfileImage, getAllUserClockinAndClockoutStatusCheckLogin, getAllUserLoginStatusAction,
  getAllUserstatusDepCheck, getAllShiftToUserBulkDelete, deleteShiftAnyLog, getAllUserProductionDayShiftAttendanceFilter, getAllUsersEmployee, getAllUserLoginExpStatus, getAllUserLoginStatus, getAllUserLoginStatusFilter, deleteAnyLog, getAllUserProductionDayShiftFilter, updateAnyLogValues,
  getAllUserClockinAndClockoutStatusLoginCheck, updatePayrunListInnerDataUser, getUserDocumentPrep, getAllUserAttendancePayRun, getAllUsersWithoutStatus, getUserWithStatus, getAllTemplateUsers, getOnBoardingSalaryFix, getFormerUserNames, checkduplicateemployeenameedit,
  getAllFilteredUsers, checkduplicateemployeenamecreate, getAllUsersnew, getAllSalaryFixFilterReport, updateUsersShiftLogLastObjects, getAllSalaryFixFilter, getUsersAllData, getAllEnquieryUsers, getAllDactiveIntern, getAllRemoteuserFilter, getAllUserProduction,
  viewpassword, getAllUserClockinAndClockoutStatusMyIndividual, getAllUserClockinAndClockoutStatusForMontLopCalFilterPayrun, getAllUserClockinAndClockoutStatusForMontLopCalFilterPayRunMasterFetch, getAllUserClockinAndClockoutStatusForMontLopCalFilterMinPointsNew,
  getAllUserClockinAndClockoutStatusForMontLopCalFilterPayRunnew, getAllUserClockinAndClockoutStatusForMontLopCalFilterMinPoints, getAllUserClockinAndClockoutStatusLeave, getAllUserClockinAndClockoutStatusForMontLopCal,
  getAllUserClockinAndClockoutStatusForMontLopCalFilter, getAllUserAttMonthCountFilterLimited, getAllUserAttMonthCount, getAllUserAttMonthCountFilter, getAllIntern, updateIntern, userscheckBranch,
  getAllTheUsers, getSingleUserSignleRole, verifyUserEmail, verifytwofa, verifychecktwofa, usersLimitedEmpcode, usersLimitedEmpcodeCreate, usersLimitedEmpcodeNonmanual, updateUsersShiftAllotObjects,
  updateUsersShiftAllotObjectsStatus, getAllUsersLogin, getAllUserstatus, getAllAddEmployeeLimit, getHrManager, getAttenddancefilter, getAllUserstaskProfile, getAllUsersexceldata, getAllUserslimit, regAuth,
  loginAuth, logincheckAuth, updateDateAfterLogin, loginOut, forgotPassword, resetPassword, getSingleUser, updateUser, deleteUser, updateUserPwd, getAllUserCheck, getAllSkillToUser, getAllRoleToUser, getAllTeamToUser,
  getAllShiftToUser, getAllUserBranch, getAllQualToUser, updateLoginAllotLogPages, getAllDesigToUser, getAllUnitToUser, getAllDepartmentToUser, getAllFloorToUser, getAllUserscompanyname, getAllUserClockinAndClockoutStatus, getAllUserClockinAndClockoutStatusFilter, getAllEmployeesForAttendanceFilterForAccessbranchWiseList,
  getAllShiftToUserOverAllBulkDelete, getAlluserDataFilter, employeeCodeAutogenerate, getAllUsersnewFilterMissingfield, getAllTheUsersEmployee, getAllUsersWithXEmployee, getAllUserAaccessibleBranch, getAllUsersCompanyname, getHierarchyBasedEmployeeStatusdefault,
  getAllUserEnquiryLive, getAllUsersVisitorRegister, getAllUserClockinAndClockoutStatusDocumentPreparation, getAllUserClockinAndClockoutStatusForMontLopCalFilterDocPrep, getAllUserClockinAndClockoutStatusForMontLopCalFilterFinalSalary,
  updateUserPwdReset, getAllUserClockinAndClockoutStatusLogin, getAllusersLimitedFinalsalary, deleteUserLogObjects, getAllUserClockinAndClockoutStatusIndividualHierarchyFilter, getAllUsersPayrunexceldataFinal, getAllUserAttMonthCountFilterPayRunMaster,
  getAllUserClockinAndClockoutStatusIndividual,getAlluserDataFilterLongAutoClockOutHierarchy, getAllUserHomeCountNotClockInList, getAllUserHomeCountNotClockIn, getAllUserHomeCountReleive, getUserWithStatusHomeCount, getHierarchyBasedEmployeeWorkstation, getHierarchyBasedEmployeeWorkstationhira, duplicateFaceDetector, getAllUsersPayrunexceldata, getAllUserClockinAndClockoutStatusFilterDateWise, getAllUserClockinAndClockoutStatusIndividualFilter, getAllUserTotalShiftDays, updatePCUsername } = require("../controller/login/auth");
authRoute.route("/usersproductiondayshiftfilter").post(getAllUserProductionDayShiftFilter);
authRoute.route("/userslimitcompanyname").get(getAllUserscompanyname);
authRoute.route('/teamautoclockoutrestrictionlist').post(getAlluserDataFilterLongAutoClockOutHierarchy);

authRoute.route("/getallusersdata").get(getUsersAllData);
authRoute.route("/userclockinclockoutstatuslogincheck").post(getAllUserClockinAndClockoutStatusLoginCheck);
authRoute.route("/usersexceldataassignbranch").post(getAllUsersexceldataAssignbranch);
authRoute.route("/usersexceldatabyassignbranch").post(getAllUsersexceldataByAssign);
authRoute.route("/usershiftallotsdelete").post(deleteUsersShiftAllot);
authRoute.route("/individualusersloginstatus").post(getIndividualUserLoginStatus);
// authRoute.route("/authenticate").post(authenticateUser);
authRoute.route("/userwithstatushomecount").post(getUserWithStatusHomeCount);
authRoute.route("/userhomecountrelieve").get(getAllUserHomeCountReleive);
authRoute.route("/userhomecountnotclockin").get(getAllUserHomeCountNotClockIn);
authRoute.route("/userforallattendancefilterforaccessbranchwiselist").post(getAllEmployeesForAttendanceFilterForAccessbranchWiseList);
authRoute.route("/userhomecountnotclockinlist").get(getAllUserHomeCountNotClockInList);
authRoute.route("/hierarchybasedemployeeworkstationhira").post(getHierarchyBasedEmployeeWorkstationhira);
authRoute.route("/hierarchybasedemployeeworkstation").post(getHierarchyBasedEmployeeWorkstation);
authRoute.route("/duplicatefacecheck").post(duplicateFaceDetector);
authRoute.route("/hierarchybasedemployeeloginstatus").post(getHierarchyBasedEmployeeStatus);
authRoute.route("/hierarchybasedemployeeloginstatusdefault").post(getHierarchyBasedEmployeeStatusdefault);
authRoute.route("/getalluserscompanyname").get(getAllUsersCompanyname);
authRoute.route("/usershiftadjustmentfilter").post(getFilteredUserForShiftAdjusment);
authRoute.route("/userforallattendancefilter").post(getAllEmployeesForAttendanceFilter);
authRoute.route("/usersnewfiltermissingfield").post(getAllUsersnewFilterMissingfield);
authRoute.route("/getfilteralluserdatalongabsend").post(getAlluserDataFilterLongAbsend);
authRoute.route("/longabsentrestrictionhierarchylist").post(getAlluserDataFilterLongAbsendHierarchy);
authRoute.route("/getfilteralluserdatalongabsendcompleted").post(getAlluserDataFilterLongAbsendCompleted);
authRoute.route("/usersstatusanswerdefine").post(getAllUserstatusAnswerDefine);
authRoute.route("/interncodeautogenerate").post(internCodeAutogenerate);
authRoute.route("/getalluserstotalshiftdayshome").post(getAllUserTotalShiftDaysHome);
authRoute.route("/usersassignuserbranch").post(getAllUsersAssignbranch);
authRoute.route("/usersexceldataassignbranchhome").get(getAllUsersexceldataAssignbranchHome);
authRoute.route("/userforallholidayweekofffilter").post(getAllEmployeesForHolidayWeekoffFilter);

authRoute.route("/getsingleremoteworkmode").get(getSingleRemoteWorkMode);
authRoute.route("/updateanylogvaluesofremoteworkmode").put(uploadRemoteWorkModeFiles , updateAnyLogValuesOfRemoteWorkmode);
authRoute.route("/updateremoteworkmode/:employeeid").put(uploadRemoteWorkModeFiles , updateRemoteWorkmode);
authRoute.route("/user/shiftcheckbulkdelete").post(getAllShiftToUserOverAllBulkDelete);
authRoute.route("/getcurrentservertime").get(getCurrentServerTime);
// authRoute.route("/createrocketchatuser").post(createRocketChatNewuser);
//log update/delete
authRoute.route("/deleteanylog").delete(deleteAnyLog);
authRoute.route("/deleteshiftanylog").delete(deleteShiftAnyLog);
authRoute.route("/updateanylog").put(updateAnyLogValues);
authRoute.route("/temporaryloginstatus").get(getAllUserTemporaryLoginStatus);

authRoute.route("/usercredentials").post(getUserCredentials);

authRoute.route("/getemployeemissingfields").get(checkEmployeeEmptyFields);

authRoute.route("/getallprofileimages").get(getAllProfileImage);
authRoute.route("/user/shiftcheckbulk").post(getAllShiftToUserBulkDelete);
//expiry data
//emplogin status
authRoute.route("/usersloginstatus").get(getAllUserLoginStatus);
authRoute.route("/usersloginstatusfilter").post(getAllUserLoginStatusFilter);
authRoute.route("/usersloginexpiredstatus").get(getAllUserLoginExpStatus);
//newly added 19.11.2024
authRoute.route("/getallteamwiseusers").post(getTeamWiseEmployees);
authRoute.route("/usersstatusdepCheck").post(getAllUserstatusDepCheck);

authRoute.route("/employeecodeautogenerate").post(employeeCodeAutogenerate);
authRoute.route("/userforallattendancefilterforshiftadjfilterpage").post(getAllEmployeesForAttendanceFilterForShiftAdjFilterPage);

authRoute.route("/daypointsfilterforsingledatewithattendance").post(dayPointsFilterForSingleDateWithAttendance);

authRoute.route("/usersproductiondayshiftattendancefilter").post(getAllUserProductionDayShiftAttendanceFilter);
authRoute.route("/alluserenquierylive").get(getAllUserEnquiryLive);
authRoute.route("/usersbranchcheck").get(userscheckBranch);
authRoute.route("/userpwreset/:id").put(updateUserPwdReset);
authRoute.route("/formerusernames").get(getFormerUserNames);
authRoute.route("/onboardingsalaryfixfilter").post(getOnBoardingSalaryFix);
authRoute.route("/userwithstatus").post(getUserWithStatus);
authRoute.route("/getalltemplateusers").get(getAllTemplateUsers);
authRoute.route("/verifiedlist/:id").put(updateVerifyUser);
authRoute.route("/checkcompanynamecreate").post(checkduplicateemployeenamecreate);
authRoute.route("/longabsentrestrictionhierarchylistHome").post(getAlluserDataFilterLongAbsendHierarchyHome);
authRoute.route("/checkcompanynameedit").post(checkduplicateemployeenameedit);
authRoute.route("/userspostergenerate").post(getAllUsersPostergenerate);
authRoute.route("/alluseremployee").get(getAllTheUsersEmployee);
authRoute.route("/getfilteralluserdata").post(getAlluserDataFilter);
authRoute.route('/:id/verify/:token').get(verifyUserEmail);
authRoute.route("/usersenquirystatus").get(getAllEnquieryUsers);
authRoute.route("/allusers").get(getAllTheUsers);
authRoute.route("/alluserslog").get(getAllTheLogUsers);
authRoute.route("/verification/viewpassword").post(viewpassword);
authRoute.route("/userwithaccessiblebranch").post(getAllUserAaccessibleBranch);
authRoute.route("/userswithxemployee").get(getAllUsersWithXEmployee);
authRoute.route("/users").get(getAllUsers); // this is for get all users
authRoute.route("/usersloginallot").get(getAllUsersLogin);
authRoute.route("/usersloginstatusaction").get(getAllUserLoginStatusAction);
authRoute.route("/userslimit").get(getAllAddEmployeeLimit);
authRoute.route("/usersalllimit").get(getAllUserslimit);
authRoute.route("/usersexceldata").get(getAllUsersexceldata);
authRoute.route("/getalluseremployee").get(getAllUsersEmployee);
authRoute.route("/auth/new").post(regAuth); // this is for signup create
authRoute.route("/dynamicqueryuserapi").post(dynamicQueryUserController);
authRoute.route("/usersnewfilter").post(getAllUsersnewFilter);
// authRoute.route('/password/forgot').post(forgotPassword);
// authRoute.route('/password/reset/:token'api/user/teamcheck).put(resetPassword);
authRoute.route("/usertaskprofile").post(getAllUserstaskProfile); //get task with user profile
authRoute.route("/auth/:id").get(getSingleUser).put(updateUser).delete(deleteUser);
authRoute.route("/userpw/:id").put(updateUserPwd);
//new auth
authRoute.route("/pcnameuser/:id").put(updatePCUsername);
authRoute.route("/authlog").post(loginAuth);
authRoute.route("/authlogcheck").post(logincheckAuth);
authRoute.route("/updateTimeAfterLogin").post(updateDateAfterLogin);
authRoute.route("/authout").get(loginOut);
authRoute.route("/userswithoutstatus").get(getAllUsersWithoutStatus);
authRoute.route("/attendfilter").post(getAttenddancefilter); // this is for get all attendaance filter
authRoute.route("/checkuser").post(getAllUserCheck); // this is for get all users
authRoute.route("/checkuserbranch").post(getAllUserBranch); // this is for get all branchuser
authRoute.route("/user/unitcheck").post(getAllUnitToUser); // this is for get all unituser
authRoute.route("/user/floorcheck").post(getAllFloorToUser); // this is for get all flooruser
authRoute.route("/user/departmentcheck").post(getAllDepartmentToUser);
authRoute.route("/userattmonthstatusfilterlimited").post(getAllUserAttMonthCountFilterLimited);
authRoute.route("/user/desigcheck").post(getAllDesigToUser);
authRoute.route("/user/teamcheck").post(getAllTeamToUser);
authRoute.route("/user/qualcheck").post(getAllQualToUser);
authRoute.route("/user/skillcheck").post(getAllSkillToUser);
authRoute.route("/user/shiftcheck").post(getAllShiftToUser);
authRoute.route("/filteredusers").post(getAllFilteredUsers);
authRoute.route("/gethrmanagers").get(getHrManager);
authRoute.route("/authmultipleroles/:id").get(getSingleUserSignleRole);
authRoute.route("/usersstatus").get(getAllUserstatus); // this is for get all users
authRoute.route("/verifytwofa").post(verifytwofa);
authRoute.route("/verifytwofacheck").post(verifychecktwofa);
authRoute.route("/usershiftallotsupdate").post(updateUsersShiftAllotObjects);
authRoute.route("/usershiftallotsupdatestatus").post(updateUsersShiftAllotObjectsStatus);
authRoute.route("/userslimitedempcode").post(usersLimitedEmpcode);
authRoute.route("/userslimitedempcodecreate").post(usersLimitedEmpcodeCreate);
authRoute.route("/userslimitedempcodenonmanual").get(usersLimitedEmpcodeNonmanual);
authRoute.route("/userclockinclockoutstatus").post(getAllUserClockinAndClockoutStatus);
authRoute.route("/userclockinclockoutstatusfilter").post(getAllUserClockinAndClockoutStatusFilter);
authRoute
  .route("/userclockinclockoutstatusfilterdatewise")
  .post(getAllUserClockinAndClockoutStatusFilterDateWise);
// authRoute.route("/userclockinclockoutstatusformontlopcal").post(getAllUserClockinAndClockoutStatusForMontLopCal);
authRoute.route("/userclockinclockoutstatusformontlopcalfilter").post(getAllUserClockinAndClockoutStatusForMontLopCalFilter);
authRoute.route("/usersprod").get(getAllUserProduction);

authRoute.route("/updateloginallotdetailsmovetolive").post(updateLoginAllotMoveToLive);
authRoute.route("/updateloginallotdetailsemployeelog").post(updateLoginAllotLogPages);
//att month status
//authRoute.route("/userattmonthstatus").post(getAllUserAttMonthCount);
//authRoute.route("/userattmonthstatusfilter").post(getAllUserAttMonthCountFilter);

//boarding llog last entry update
authRoute.route("/boardinglogupdate").post(updateUsersShiftLogLastObjects);

// authRoute.route("/createrocketchataccountinedit").post(createRocketChatAccountInEdit);

// att indvl status
authRoute.route("/userclockinclockoutstatusindvl").post(getAllUserClockinAndClockoutStatusIndividual);
authRoute.route("/userclockinclockoutstatusindvlfilter").post(getAllUserClockinAndClockoutStatusIndividualFilter);
authRoute.route("/userclockinclockoutstatusmyindvl").post(getAllUserClockinAndClockoutStatusMyIndividual);
authRoute.route("/userclockinclockoutstatusindvlhierarchyfilter").post(getAllUserClockinAndClockoutStatusIndividualHierarchyFilter);
authRoute.route("/usershiftallotsbulkupdate").post(updateBulkUsersShiftAllotObjects);
authRoute.route("/salaryfixfilterreport").post(getAllSalaryFixFilterReport);
//inter changes
authRoute.route("/updateinternstatus/:id").put(updateIntern);
authRoute.route("/allinterns").get(getAllIntern); // this is for get all interns
authRoute.route("/deactiveallinterns").get(getAllDactiveIntern); // this is for get all interns
//emplogin status

authRoute.route("/usershiftallotsbulkupdateforweekoffadjopt").post(updateBulkUsersShiftAllotObjectsForWeekoffAdjustmentOpt);

authRoute.route("/biometricusersall").post(getBiometricUsersAll);
//payrunmaster
authRoute.route("/userspayrundatalimited").get(getAllUsersPayrunexceldata);
authRoute.route("/userattmonthstatusfilterpayrunmaster").post(getAllUserAttMonthCountFilterPayRunMaster);
authRoute.route("/deleteuserlogobjects").post(deleteUserLogObjects);
authRoute.route("/getallusersattendancepayrun").post(getAllUserAttendancePayRun);
authRoute.route("/updatepayrunlistinnerdatauser").post(updatePayrunListInnerDataUser);
authRoute.route("/undopayrunlistinnerdatauser").post(undoPayrunListInnerDataUser);
authRoute.route("/userslimitedreportprodMulti").post(getLimitedUserReportProductionMulti);

authRoute.route("/userclockinclockoutstatuswithshiftmodefilterbulkupdate").post(getAllUserClockinAndClockoutStatusWithShiftModeFilterBulkUpdate);

//payrun final salary
authRoute.route("/userclockinclockoutstatusformontlopcalfilterfinalsalary").post(getAllUserClockinAndClockoutStatusForMontLopCalFilterFinalSalary);
authRoute.route("/userspayrundatalimitedfinal").post(getAllUsersPayrunexceldataFinal);
authRoute.route("/userslimitedfinalsalary").post(getAllusersLimitedFinalsalary);
authRoute.route("/usernamesearch").post(getUserDocumentPrep);
// authRoute.route("/userclockinclockoutstatusformontlopcalfilterpayrun").post(getAllUserClockinAndClockoutStatusForMontLopCalFilterPayrun);
// authRoute.route("/userclockinclockoutstatusformontlopcalfilterminpoints").post(getAllUserClockinAndClockoutStatusForMontLopCalFilterMinPoints);
// authRoute.route("/userclockinclockoutstatusformontlopcalfilterpayrunnew").post(getAllUserClockinAndClockoutStatusForMontLopCalFilterPayRunnew);
authRoute.route("/userclockinclockoutstatusformontlopcalfilterminpointsnew").post(getAllUserClockinAndClockoutStatusForMontLopCalFilterMinPointsNew);
authRoute.route("/userclockinclockoutstatusformontlopcalfilterpayrunmasterfetch").post(getAllUserClockinAndClockoutStatusForMontLopCalFilterPayRunMasterFetch);
authRoute.route("/allnotinemployees").get(getAllNotInEmployees);
//apply leave section  
authRoute.route("/userclockinclockoutstatusleave").post(getAllUserClockinAndClockoutStatusLeave);

authRoute.route("/getfilterremoteuser").post(getAllRemoteuserFilter);
authRoute.route("/unallotgetfilterremoteuser").post(getAllunallotRemoteuserFilter);
authRoute.route("/userclockinclockoutstatuslogin").post(getAllUserClockinAndClockoutStatusLogin);
authRoute.route("/userclockinclockoutstatusloginstatuscheck").post(getAllUserClockinAndClockoutStatusCheckLogin);
authRoute.route("/usersnew").get(getAllUsersnew);
authRoute.route("/getfilterremoteindividualuser").post(getAllRemoteIndividualuserFilter);
authRoute.route("/getfilteredhierarchyremotelist").post(getAllRemoteHierarchyBasedUsers);
//document production/att condition
authRoute.route("/userclockinclockoutstatusdocprep").post(getAllUserClockinAndClockoutStatusDocumentPreparation);
authRoute.route("/userclockinclockoutstatusformontlopcalfilterdocprep").post(getAllUserClockinAndClockoutStatusForMontLopCalFilterDocPrep);
authRoute.route("/dynamicqueryuserapisort").post(dynamicQueryUserControllerSort);
//visitor scan
authRoute.route("/uservisitorregister").post(getAllUsersVisitorRegister);
authRoute.route("/userforallattendancefilterindividualtype").post(getAllEmployeesForAttendanceFilterIndividualType);
authRoute.route("/userclockinclockoutstatusattmodebasedfilter").post(getAllUserClockinAndClockoutStatusAttModeBasedFilter);
authRoute.route('/userclockinclockoutstatusfilterproddaypoint').post(getAllUserClockinAndClockoutStatusFilterProdDayPoint);
authRoute.route('/userforallattendancefilterproddaypoint').post(getAllEmployeesForAttendanceFilterProdDayPoint);
authRoute.route("/salaryfixfilter").post(getAllSalaryFixFilter);
//for employeedocuments
const { getAllEmployeeDocuments, getAllPreEmployeeDocuments, getAllEmployeeDocumentsforidcard, getSingleEmployeeDocumentByCommonidWithAllnew, getAllEmployeeProfile, getSingleEmployeeDocument,updateEmployeeDocumentWithoutMulter, updateEmployeeDocument, deleteEmployeeDocument, addEmployeeDocuments, getSingleEmployeeDocumentByCommonid, getSingleEmployeeDocumentByCommonidWithAll } = require("../controller/login/employeedocuments");
authRoute.route("/employeedocuments").get(getAllEmployeeDocuments);
authRoute.route("/employeedocumentsnew/new").get(getAllEmployeeDocuments);
authRoute.route("/employeedocuments/new").post(getMulterMiddleware('employeedocuments') , addEmployeeDocuments);
authRoute.route("/employeedocument/:id").get(getSingleEmployeeDocument).put(getMulterMiddleware('employeedocuments') ,updateEmployeeDocument).delete(deleteEmployeeDocument);
authRoute.route("/employeedocumentcommonid").post(getSingleEmployeeDocumentByCommonid)
authRoute.route("/employeedocumentcommonidwithall").post(getSingleEmployeeDocumentByCommonidWithAll)
authRoute.route("/employeeprofile").get(getAllEmployeeProfile)
authRoute.route("/employeedocumentupdate/:id").put(updateEmployeeDocumentWithoutMulter)
authRoute.route("/preemployeedocuments").get(getAllPreEmployeeDocuments);
authRoute.route("/employeedocumentsidcard").get(getAllEmployeeDocumentsforidcard);
authRoute.route("/employeedocumentcommonidwithallnew").post(getSingleEmployeeDocumentByCommonidWithAllnew);
authRoute.route("/getalluserstotalshiftdays").post(getAllUserTotalShiftDays);

const {
  updateOverallEmployeename,
  updateOverallEmployeeCode,
} = require("../controller/login/OverallEmployeenameUpdate");

authRoute.route("/employeenameoverallupdate").put(updateOverallEmployeename);
authRoute.route("/employeecodeoverallupdate").put(updateOverallEmployeeCode);


const {
  updateOverallBranchname,
  getAllBranchCheck
} = require("../controller/login/OverallBranchnameUpdate");
authRoute.route("/branchoverallupdate").put(updateOverallBranchname);
authRoute.route("/branchAllCheck").post(getAllBranchCheck);

const {
  updateOverallTeamname,
  getAllTeamCheck,
  allTeamBulkCheck
} = require("../controller/login/OverallTeamUpdate");

authRoute.route("/overallupdatecheck").put(updateOverallTeamname);
authRoute.route("/overalldelcheck").post(getAllTeamCheck);
authRoute.route("/overallbulkdelcheck").post(allTeamBulkCheck);

const {
  updateOverallDepartmentname,
  getAllDepartmentCheck,
  DepartmentOverallCheckBulkdelete
} = require("../controller/login/OverallDepatmentUpdate");

authRoute.route("/departoverallupdate").put(updateOverallDepartmentname);
authRoute.route("/departoverallcheck").post(getAllDepartmentCheck);
authRoute.route("/departoverallbulkcheck").post(DepartmentOverallCheckBulkdelete);


const {
  updateOverallDesignationname,
  getAllDesignationCheck,
  designationbulkcheck
} = require("../controller/login/OverallDesignationUpdate");

authRoute.route("/desigoverallupdate").put(updateOverallDesignationname);
authRoute.route("/desigoverallcheck").post(getAllDesignationCheck);
authRoute.route("/designationbulkcheck").post(designationbulkcheck);

const userActivityMulter = require("../middleware/userActivityMulter.js");
const { createUserActivity, hiTrackerNotInstalledUsers, dynamicQueryUserActivityController, getAllUserActivityStorage, createUserActivityScreenshot, dynamicQueryUserActivityScreenshotController, createUserActivityLiveScreen, dynamicQueryUserActivityLiveScreenController } = require("../controller/login/userActivity.js");
authRoute.route("/saveuseractivityscrennshot").post(userActivityMulter.single("screenshot"), createUserActivityScreenshot);
authRoute.route("/saveuseractivity").post(createUserActivity);
authRoute.route("/hitrackernotinstalledusers").post(hiTrackerNotInstalledUsers);
authRoute.route("/getalluseractivitystorage").get(getAllUserActivityStorage);
authRoute.route("/dynamicqueryuseractivitycontroller").post(dynamicQueryUserActivityController);
authRoute.route("/dynamicqueryuseractivityscreeenshotcontroller").post(dynamicQueryUserActivityScreenshotController);
authRoute.route("/createlivescreendata").post(createUserActivityLiveScreen);
authRoute.route("/dynamicqueryuseractivitylivescreencontroller").post(dynamicQueryUserActivityLiveScreenController);

const { getMailedUsers, createUserMaildomain, updateDomainMailUser, createUserMailFromEmployeeCreate, queryCompanyMail } = require("../controller/login/postfixmailuser");
authRoute.route("/postfixmailusers").get(getMailedUsers);
authRoute.route("/postfixmailusercreate").post(createUserMaildomain);
authRoute.route("/postfixmailusercreatebyemployee").post(createUserMailFromEmployeeCreate);
authRoute.route("/querycompanymail").post(queryCompanyMail);
authRoute.route("/updatepassworddomainmail").post(updateDomainMailUser);


//newly added 14.11.2024
const { getRemoveBG } = require("../controller/login/removebg");
authRoute.route("/getremovebg").post(getRemoveBG);

const { getBiometricAttendance, getAllBiometricAttendance } = require("../controller/login/mscontroler");
authRoute.route("/biometric").post(getBiometricAttendance);
authRoute.route("/biometricalldata").post(getAllBiometricAttendance);

const { removeOverallEmployeename } = require("../controller/login/overallemployeenamedelete");
authRoute.route("/employeenameremoval").post(removeOverallEmployeename);

//for employeesignatures
const { getAllEmployeesignature, getAllPreEmployeesignature, getIndividualUserESignature, getAllEmployeeSignaturesforidcard, getSingleEmployeeSignatureByCommonidWithAllnew, getAllEmployeesignatureProfile, getSingleEmployeesignature, updateEmployeesignature, deleteEmployeesignature, addEmployeesignature, getSingleEmployeeSignatureByCommonid, getSingleEmployeeSignatureByCommonidWithAll } = require("../controller/login/employeesignature.js");
authRoute.route("/employeesignatures").get(getAllEmployeesignature);
authRoute.route("/employeesignatures/new").post(addEmployeesignature);
authRoute.route("/employeesignature/:id").get(getSingleEmployeesignature).put(updateEmployeesignature).delete(deleteEmployeesignature);
authRoute.route("/employeesignaturecommonid").post(getSingleEmployeeSignatureByCommonid)
authRoute.route("/useresignaturefilter").post(getIndividualUserESignature)
authRoute.route("/employeesignaturecommonidwithall").post(getSingleEmployeeSignatureByCommonidWithAll)
authRoute.route("/employeesignatureprofile").get(getAllEmployeesignatureProfile);
authRoute.route("/preemployeesignatures").get(getAllPreEmployeesignature);
authRoute.route("/employeesignaturesidcard").get(getAllEmployeeSignaturesforidcard);
authRoute.route("/employeesignaturecommonidwithallnew").post(getSingleEmployeeSignatureByCommonidWithAllnew);





const {
  createUserInLDAP,
  getAllUsersFromLDAP,
  createOrganizationalUnit,
  getOrganizationalUnits,
  deleteUserByUsernameFromLDAP,
  updateUserAccountControlInLDAP,
  deleteOrganizationalUnit,
  unlockUserAccount,
  checkLDAPConnection,
  editOrganizationalUnit,
  unlockUser,
  getUserAttributes,
  getLdapSchema,
  getUserFromLDAP,
  authenticateUser,
  resetUserPassword,
  checkIfRolesExist,
  lockedAndUnlockedUsersList,
  getLockedAndUnlockedUsers,
  lockUser,
  getDisabledAndEnabledUsers,
  disableDomainUser,
  enableDomainUser,
  createUsersInLDAP,
  deleteUsersInLDAP,
  getUsersByAccountControl,
  updateUserDetails,
  checkLDAPConnectionNew,
  createUserInLDAPWithFirstLogin,
  createUserInLDAPWithUserAccountControl,
  getLockoutPolicy,
  createUserInLDAPWithOu,
  checkUserInLDAP,
  getalluserlongabsentlist,
  getHierarchyDisabledAndEnabledUsers,
  getHierarchyLockedAndUnlockedUsers,
  getHierarchyUsersByAccountControl,
} = require('../controller/login/domainuser');

// authRoute.route("/checkldapconnection").get(checkLDAPConnection);
authRoute.route('/checkldapconnection').post(checkLDAPConnection);
authRoute.route('/createdomainUser').post(checkLDAPSetting, createUserInLDAP);
authRoute.route('/getalldomainusers').get(checkLDAPSetting, getAllUsersFromLDAP);

authRoute.route('/unlockuser').post(checkLDAPSetting, unlockUser);

authRoute.route('/getalluserattributes').post(checkLDAPSetting, getUserAttributes);

authRoute.route('/unlockdomainuseraccount').post(checkLDAPSetting, unlockUserAccount);
authRoute.route('/updateorganizationunit').post(checkLDAPSetting, editOrganizationalUnit);
authRoute.route('/createorganizationunit').post(checkLDAPSetting, createOrganizationalUnit);
authRoute.route('/deleteorganizationunit').post(checkLDAPSetting, deleteOrganizationalUnit);
authRoute.route('/getallorganizationunit').get(checkLDAPSetting, getOrganizationalUnits);
authRoute.route('/deletedomainUser').post(checkLDAPSetting, deleteUserByUsernameFromLDAP);
authRoute.route('/updatedomainUser').post(checkLDAPSetting, updateUserAccountControlInLDAP);

authRoute.route('/updateindividualuserdetails').post(checkLDAPSetting, updateUserDetails);

authRoute.route('/getldapschema').get(checkLDAPSetting, getLdapSchema);
authRoute.route('/getuserfromldap').post(checkLDAPSetting, getUserFromLDAP);

authRoute.route('/checkifrolesexist').get(checkLDAPSetting, checkIfRolesExist);

authRoute.route('/authenticateuser').post(checkLDAPSetting, authenticateUser);
authRoute.route('/resetuserpassword').post(checkLDAPSetting, resetUserPassword);

authRoute.route('/lockedandunlockeduserslist').post(checkLDAPSetting, lockedAndUnlockedUsersList);

authRoute.route('/getlockedandunlockeduserslist').post(checkLDAPSetting, getLockedAndUnlockedUsers);

authRoute.route('/conditiontolockuser').post(checkLDAPSetting, lockUser);

authRoute.route('/conditiontodisableuser').post(checkLDAPSetting, disableDomainUser);

authRoute.route('/conditiontoenableuser').post(checkLDAPSetting, enableDomainUser);

authRoute.route('/getenabledanddisableduserslist').post(checkLDAPSetting, getDisabledAndEnabledUsers);

authRoute.route('/createusersinldapwithou').post(checkLDAPSetting, createUsersInLDAP);

authRoute.route('/deleteusersinldapwithou').post(checkLDAPSetting, deleteUsersInLDAP);

authRoute.route('/getusersbyuseraccountcontrol').post(checkLDAPSetting, getUsersByAccountControl);

authRoute.route('/checkldapsconnectionnew').get(checkLDAPConnectionNew);

authRoute.route('/createuserwithfirstlogin').post(checkLDAPSetting, createUserInLDAPWithFirstLogin);

authRoute.route('/createuserwithuseraccountcontrolbased').post(checkLDAPSetting, createUserInLDAPWithUserAccountControl);

authRoute.route('/getuserlockedpolicy').get(checkLDAPSetting, getLockoutPolicy);

authRoute.route('/createuserwithoubased').post(checkLDAPSetting, createUserInLDAPWithOu);

authRoute.route('/checkuserispresent').post(checkUserInLDAP);

authRoute.route('/getlongabsentuserslistforldap').get(getalluserlongabsentlist);

//01.04.2025
authRoute.route('/hierarchybaseddisabledandenableduserslist').post(getHierarchyDisabledAndEnabledUsers);
authRoute.route('/hierarchybasedlockeduserslist').post(getHierarchyLockedAndUnlockedUsers);
authRoute.route('/hierarchybaseddomainuserslist').post(getHierarchyUsersByAccountControl);







module.exports = authRoute;
