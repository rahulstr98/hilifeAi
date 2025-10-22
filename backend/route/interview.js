// const express = require("express");
// const interviewRoute = express.Router();

// // connect add category ticket form controller

// const {
// getAllInterviewCategory,
//   getSingleInterviewCategory,
//   addInterviewCategory,
//   updateInterviewCategory,
//   deleteInterviewCategory,
//   overallDeleteInterviewCategory,
//   overallBulkDeleteInterviewCategory,
//   overallEditInterviewCategory,
// } = require("../controller/modules/interview/addcategoryinterview");
// interviewRoute.route("/interviewcategories").get(getAllInterviewCategory);
// interviewRoute.route("/interviewcategory/new").post(addInterviewCategory);
// interviewRoute
//   .route("/overalldelete/interviewcategory")
//   .post(overallDeleteInterviewCategory);
// interviewRoute
//   .route("/overalledit/interviewcategory")
//   .put(overallEditInterviewCategory);
// interviewRoute
//   .route("/overallbulkdelete/interviewcategory")
//   .post(overallBulkDeleteInterviewCategory);
// interviewRoute
//   .route("/interviewcategory/:id")
//   .get(getSingleInterviewCategory)
//   .put(updateInterviewCategory)
//   .delete(deleteInterviewCategory);

// const {
//   getAllRoundmaster,
//   getSingleRoundmaster,
//   addRoundmaster,
//   updateRoundmaster,
//   deleteRoundmaster,
//   overallBulkDeleteRoundMaster,
//   overallDeleteRoundMaster,
//   overallEditRoundMaster,
// } = require("../controller/modules/interview/roundmaster");
// interviewRoute.route("/roundmasters").get(getAllRoundmaster);
// interviewRoute.route("/roundmaster/new").post(addRoundmaster);
// interviewRoute
//   .route("/overalldelete/interviewroundmaster")
//   .post(overallDeleteRoundMaster);
// interviewRoute
//   .route("/overalledit/interviewroundmaster")
//   .put(overallEditRoundMaster);
// interviewRoute
//   .route("/overallbulkdelete/interviewroundmaster")
//   .post(overallBulkDeleteRoundMaster);
// interviewRoute
//   .route("/roundmaster/:id")
//   .get(getSingleRoundmaster)
//   .put(updateRoundmaster)
//   .delete(deleteRoundmaster);

// // connect interview type master from controller

// const {
//   getAllInterviewtypemaster,
//   getSingleInterviewtypemaster,
//   addInterviewtypemaster,
//   updateInterviewtypemaster,
//   deleteInterviewtypemaster,
//   overallBulkDeleteTypeMaster,
//   overallDeleteTypeMaster,
//   overallEditTypeMaster,
// } = require("../controller/modules/interview/interviewtypemaster");
// interviewRoute.route("/interviewtypemasters").get(getAllInterviewtypemaster);
// interviewRoute.route("/interviewtypemaster/new").post(addInterviewtypemaster);
// interviewRoute
//   .route("/overalldelete/interviewtypemaster")
//   .post(overallDeleteTypeMaster);
// interviewRoute
//   .route("/overalledit/interviewtypemaster")
//   .put(overallEditTypeMaster);
// interviewRoute
//   .route("/overallbulkdelete/interviewtypemaster")
//   .post(overallBulkDeleteTypeMaster);
// interviewRoute
//   .route("/interviewtypemaster/:id")
//   .get(getSingleInterviewtypemaster)
//   .put(updateInterviewtypemaster)
//   .delete(deleteInterviewtypemaster);
// // connect interviewquestions from controller

// const {
//   getAllInterviewQuestion,
//   getSingleInterviewQuestion,
//   addInterviewQuestion,
//   updateInterviewQuestion,
//   deleteInterviewQuestion,
//   overallBulkDeleteInterviewQuestions,
//   overallDeleteInterviewQuestions,
//   overallEditInterviewQuestions,
//   getInterviewQuestion,
//   getInterviewTypingQuestion,
//   skippedInterviewQuestion,
// } = require("../controller/modules/interview/interviewquestions");
// interviewRoute.route("/interviewquestions").get(getAllInterviewQuestion);
// interviewRoute.route("/allinterviewquestions").get(getInterviewQuestion);
// interviewRoute
//   .route("/allinterviewtypingquestions")
//   .get(getInterviewTypingQuestion);
// interviewRoute.route("/interviewquestion/new").post(addInterviewQuestion);
// interviewRoute
//   .route("/overalldelete/interviewquestions")
//   .post(overallDeleteInterviewQuestions);
// interviewRoute
//   .route("/overalledit/interviewquestions")
//   .put(overallEditInterviewQuestions);
// interviewRoute
//   .route("/overallbulkdelete/interviewquestions")
//   .post(overallBulkDeleteInterviewQuestions);
// interviewRoute
//   .route("/skippedinterviewquestions")
//   .post(skippedInterviewQuestion);
// interviewRoute
//   .route("/interviewquestion/:id")
//   .get(getSingleInterviewQuestion)
//   .put(updateInterviewQuestion)
//   .delete(deleteInterviewQuestion);
// // connect interviewquestions Grouping from controller

// const {
//   getAllInterviewGroupingQuestion,
//   getAllInterviewGroupingQuestionFilter,
//   getSingleInterviewGroupingQuestion,
//   addInterviewGroupingQuestion,
//   updateInterviewGroupingQuestion,
//   deleteInterviewGroupingQuestion,
//   overallBulkDeleteInterviewQuestionGrouping,
//   overallDeleteInterviewQuestionGrouping,
//   overallEditInterviewQuestionGrouping,
// } = require("../controller/modules/interview/interviewquestiongrouping");
// interviewRoute
//   .route("/interviewquestiongroupings")
//   .get(getAllInterviewGroupingQuestion);
// interviewRoute
//   .route("/interviewquestiongroupingsfilter")
//   .post(getAllInterviewGroupingQuestionFilter);
// interviewRoute
//   .route("/interviewquestiongrouping/new")
//   .post(addInterviewGroupingQuestion);
// interviewRoute
//   .route("/interviewquestiongrouping/:id")
//   .get(getSingleInterviewGroupingQuestion)
//   .put(updateInterviewGroupingQuestion)
//   .delete(deleteInterviewGroupingQuestion);
// interviewRoute
//   .route("/overalldelete/interviewquestiongrouping")
//   .post(overallDeleteInterviewQuestionGrouping);
// interviewRoute
//   .route("/overallbulkdelete/interviewquestiongrouping")
//   .post(overallBulkDeleteInterviewQuestionGrouping);
// interviewRoute
//   .route("/overalledit/interviewquestiongrouping")
//   .put(overallEditInterviewQuestionGrouping);
// //interview Form Designs
// const {
//   getAllInterviewFormDesign,
//   getSingleInterviewFormDesign,
//   addInterviewFormDesign,
//   updateInterviewFormDesign,
//   deleteInterviewFormDesign,
//   overallBulkDeleteInterviewStatusAllot,
//   overallDeleteInterviewStatusAllot,
//   overallEditInterviewStatusAllot,
// } = require("../controller/modules/interview/interviewformgenerate");
// interviewRoute.route("/interviewformdesigns").get(getAllInterviewFormDesign);
// interviewRoute.route("/interviewformdesign/new").post(addInterviewFormDesign);
// interviewRoute
//   .route("/overalldelete/interviewstatusallot")
//   .post(overallDeleteInterviewStatusAllot);
// interviewRoute
//   .route("/overallbulkdelete/interviewstatusallot")
//   .post(overallBulkDeleteInterviewStatusAllot);
// interviewRoute
//   .route("/overalledit/interviewstatusallot")
//   .put(overallEditInterviewStatusAllot);
// interviewRoute
//   .route("/interviewformdesign/:id")
//   .get(getSingleInterviewFormDesign)
//   .put(updateInterviewFormDesign)
//   .delete(deleteInterviewFormDesign);

// //interview answer allot
// //interview answer allot
// const {
//   addInterviewFormAllot,
//   deleteInterviewFormAllot,
//   getAllInterviewFormAllot,
//   getSingleInterviewFormAllot,
//   updateInterviewFormAllot,
//   overallBulkDeleteInterviewAnswerAllot,
//   overallDeleteInterviewAnswerAllot,
//   overallEditInterviewAnswerAllot,
// } = require("../controller/modules/interview/InterviewQuestionAnswerAllot");
// interviewRoute.route("/interviewanswerallots").get(getAllInterviewFormAllot);
// interviewRoute.route("/interviewanswerallot/new").post(addInterviewFormAllot);
// interviewRoute
//   .route("/overalldelete/interviewanswerallot")
//   .post(overallDeleteInterviewAnswerAllot);
// interviewRoute
//   .route("/overallbulkdelete/interviewanswerallot")
//   .post(overallBulkDeleteInterviewAnswerAllot);
// interviewRoute
//   .route("/overalledit/interviewanswerallot")
//   .put(overallEditInterviewAnswerAllot);
// interviewRoute
//   .route("/interviewanswerallot/:id")
//   .get(getSingleInterviewFormAllot)
//   .put(updateInterviewFormAllot)
//   .delete(deleteInterviewFormAllot);

// const {
//   getAllInterviewTestMaster,
//   addInterviewTestMaster,
//   getSingleInterviewTestMaster,
//   updateInterviewTestMaster,
//   deleteInterviewTestMaster,
//   overallBulkDeleteTestMaster,
//   overallDeleteTestMaster,
//   overallEditTestMaster,
// } = require("../controller/modules/interview/interviewtestmaster");
// interviewRoute.route("/interviewtestmaster").get(getAllInterviewTestMaster);
// interviewRoute.route("/interviewtestmaster/new").post(addInterviewTestMaster);
// interviewRoute
//   .route("/overalldelete/interviewtestmaster")
//   .post(overallDeleteTestMaster);
// interviewRoute
//   .route("/overalledit/interviewtestmaster")
//   .put(overallEditTestMaster);
// interviewRoute
//   .route("/overallbulkdelete/interviewtestmaster")
//   .post(overallBulkDeleteTestMaster);
// interviewRoute
//   .route("/interviewtestmaster/:id")
//   .get(getSingleInterviewTestMaster)
//   .put(updateInterviewTestMaster)
//   .delete(deleteInterviewTestMaster);
// // interview questions order backend route
// const {
//   addInterviewQuestionsOrder,
//   deleteInterviewQuestionsOrder,
//   getAllInterviewQuestionsOrder,
//   getSingleInterviewQuestionsOrder,
//   updateInterviewQuestionsOrder,
//   overallBulkDeleteInterviewQuestionOrder,
//   overallDeleteInterviewQuestionOrder,
// } = require("../controller/modules/interview/InterviewQuestionsOrderController");
// interviewRoute
//   .route("/interviewquestionsorders")
//   .get(getAllInterviewQuestionsOrder);
// interviewRoute
//   .route("/interviewquestionsorder/new")
//   .post(addInterviewQuestionsOrder);
// interviewRoute
//   .route("/interviewquestionsorder/:id")
//   .get(getSingleInterviewQuestionsOrder)
//   .put(updateInterviewQuestionsOrder)
//   .delete(deleteInterviewQuestionsOrder);
// interviewRoute
//   .route("/overalldelete/interviewquestionorder")
//   .post(overallDeleteInterviewQuestionOrder);
// interviewRoute
//   .route("/overallbulkdelete/interviewquestionorder")
//   .post(overallBulkDeleteInterviewQuestionOrder);

// // interview questions order backend route
// const {
//   addInterviewUserResponse,
//   deleteInterviewUserResponse,
//   getAllInterviewUserResponse,
//   getSingleInterviewUserResponse,
//   updateInterviewUserResponse,
//   interviewLogin,
//   getInterviewRoundById,
//   updateCandidateStatus,
//   deleteSingleInterviewRound, exitInterviewLogin
// } = require("../controller/modules/interview/interviewUserResponse");
// interviewRoute
//   .route("/interviewuserresponses")
//   .get(getAllInterviewUserResponse);
// interviewRoute.route("/interviewlogin").post(interviewLogin);
// interviewRoute
//   .route("/fetchinterviewround/:candidateid/:roundids")
//   .post(getInterviewRoundById);
// interviewRoute
//   .route("/updateinterviewrounddata/:id")
//   .put(updateCandidateStatus);
// interviewRoute
//   .route("/deleteinterviewround/:id")
//   .delete(deleteSingleInterviewRound);
// interviewRoute
//   .route("/interviewuserresponse/new")
//   .post(addInterviewUserResponse);
// interviewRoute
//   .route("/interviewuserresponse/:id")
//   .get(getSingleInterviewUserResponse)
//   .put(updateInterviewUserResponse)
//   .delete(deleteInterviewUserResponse);
// interviewRoute.route("/exitinterviewlogin").post(exitInterviewLogin);
// //interview Round Order
// const {
//   getAllInterviewroundorder,
//   getSingleInterviewroundorder,
//   addInterviewroundorder,
//   updateInterviewroundorder,
//   deleteInterviewroundorder,
//   overallBulkDeleteInterviewRoundOrder,
//   overallDeleteInterviewRoundOrder,candidatesHistory
// } = require("../controller/modules/interview/interviewroundorder");
// interviewRoute.route("/interviewroundorders").get(getAllInterviewroundorder);
// interviewRoute.route("/interviewroundorder/new").post(addInterviewroundorder);
// interviewRoute.route("/candidateshistory").post(candidatesHistory);
// interviewRoute
//   .route("/interviewroundorder/:id")
//   .get(getSingleInterviewroundorder)
//   .put(updateInterviewroundorder)
//   .delete(deleteInterviewroundorder);
// interviewRoute
//   .route("/overalldelete/interviewroundorder")
//   .post(overallDeleteInterviewRoundOrder);
// interviewRoute
//   .route("/overallbulkdelete/interviewroundorder")
//   .post(overallBulkDeleteInterviewRoundOrder);

// const {
//   getAllAssigninterviewer,
//   addAssigninterview,
//   getSingleAssigninterview,
//   updateAssigninterviewer,
//   deleteAssigninterviewer,
//   getAssignInterviewFilter, getAssignInterviewFilterManual, getAllAssigninterviewerVisitor
// } = require("../controller/modules/interview/assigninterviewer");
// interviewRoute.route("/assigninterviewers").post(getAllAssigninterviewer);
// interviewRoute.route("/assigninterviewervisitor").post(getAllAssigninterviewerVisitor);
// interviewRoute.route("/assigninterviewer/new").post(addAssigninterview);
// interviewRoute.route("/assigninterviewersfiltermanual").post(getAssignInterviewFilterManual);
// interviewRoute
//   .route("/assigninterviewersfilter")
//   .post(getAssignInterviewFilter);
// interviewRoute
//   .route("/assigninterviewer/:id")
//   .get(getSingleAssigninterview)
//   .put(updateAssigninterviewer)
//   .delete(deleteAssigninterviewer);

// //checklist type
// const {
//   getAllChecklisttype,
//   getSingleChecklisttype,
//   getAllChecklistByPagination,
//   addChecklisttype,
//   updateChecklisttype,
//   deleteChecklisttype, getAllChecklistNotAssignedByPagination
// } = require("../controller/modules/interview/checklisttype");
// interviewRoute.route("/checklisttypes").get(getAllChecklisttype);
// interviewRoute.route("/checklisttype/new").post(addChecklisttype);
// interviewRoute.route("/mychecklistbypaginationnotassigned").post(getAllChecklistNotAssignedByPagination);
// interviewRoute
//   .route("/checklisttype/:id")
//   .get(getSingleChecklisttype)
//   .put(updateChecklisttype)
//   .delete(deleteChecklisttype);
// interviewRoute
//   .route("/mychecklistbypagination")
//   .post(getAllChecklistByPagination);

// const {
//   getAllEmployeeStatus,
//   getSingleEmployeeStatus,
//   addEmployeeStatus,
//   updateEmployeeStatus,
//   deleteEmployeeStatus,
// } = require("../controller/modules/interview/EmployeeStatusController");
// interviewRoute.route("/employeestatuss").get(getAllEmployeeStatus);
// interviewRoute.route("/employeestatus/new").post(addEmployeeStatus);
// interviewRoute
//   .route("/employeestatus/:id")
//   .get(getSingleEmployeeStatus)
//   .put(updateEmployeeStatus)
//   .delete(deleteEmployeeStatus);

// const {
//   getAllChecklistInterview,
//   getSingleChecklistInterview,
//   addChecklistInterview,
//   updateChecklistInterview,
//   deleteChecklistInterview,
// } = require("../controller/modules/interview/ChecklistInterviewController");
// interviewRoute.route("/checklistinterviews").get(getAllChecklistInterview);
// interviewRoute.route("/checklistinterview/new").post(addChecklistInterview);
// interviewRoute
//   .route("/checklistinterview/:id")
//   .get(getSingleChecklistInterview)
//   .put(updateChecklistInterview)
//   .delete(deleteChecklistInterview);

// // checklist category form controller

// const {
//   getAllChecklistCategory,
//   getSingleChecklistCategory,
//   addChecklistCategory,
//   updateChecklistCategory,
//   deleteChecklistCategory,
// } = require("../controller/modules/interview/checklistcategory");
// interviewRoute.route("/checklistcategories").get(getAllChecklistCategory);
// interviewRoute.route("/checklistcategory/new").post(addChecklistCategory);
// interviewRoute
//   .route("/checklistcategory/:id")
//   .get(getSingleChecklistCategory)
//   .put(updateChecklistCategory)
//   .delete(deleteChecklistCategory);

// //connect Online Test Question For an task controller
// const {
//   addOnlineTestQuestions,
//   deleteOnlineTestQuestions,
//   getAllOnlineTestQuestions,
//   getSingleOnlineTestQuestions,
//   updateOnlineTestQuestions,
// } = require("../controller/modules/interview/onlinetestquestions");
// interviewRoute.route("/onlinetestquestions").get(getAllOnlineTestQuestions);
// interviewRoute.route("/onlinetestquestion/new").post(addOnlineTestQuestions);
// interviewRoute
//   .route("/onlinetestquestion/:id")
//   .delete(deleteOnlineTestQuestions)
//   .get(getSingleOnlineTestQuestions)
//   .put(updateOnlineTestQuestions);

// const {
//   addOnlineTestMasters,
//   deleteOnlineTestMasters,
//   getAllOnlineTestMasters,
//   getSingleOnlineTestMasters,
//   updateOnlineTestMasters,
// } = require("../controller/modules/interview/onlinetestmaster");
// interviewRoute.route("/onlinetestmasters").get(getAllOnlineTestMasters);
// interviewRoute.route("/onlinetestmaster/new").post(addOnlineTestMasters);
// interviewRoute
//   .route("/onlinetestmaster/:id")
//   .delete(deleteOnlineTestMasters)
//   .get(getSingleOnlineTestMasters)
//   .put(updateOnlineTestMasters);
// // Checklist verification master controller
// const {
//   getAllChecklistverificationmaster,
//   getSingleChecklistverificationmaster,
//   addChecklistverificationmaster,
//   updateChecklistverificationmaster,
//   deleteChecklistverificationmaster,
// } = require("../controller/modules/interview/checklistverificationmaster");
// interviewRoute
//   .route("/checklistverificationmasters")
//   .get(getAllChecklistverificationmaster);
// interviewRoute
//   .route("/checklistverificationmaster/new")
//   .post(addChecklistverificationmaster);
// interviewRoute
//   .route("/checklistverificationmaster/:id")
//   .get(getSingleChecklistverificationmaster)
//   .put(updateChecklistverificationmaster)
//   .delete(deleteChecklistverificationmaster);

// const {
//   getAllMyCheckList,
//   addMyCheckList,
//   deleteMyCheckList,
//   getSingleMyCheckList,
//   updateMyCheckList,
//   updateMyCheckListUsingObjectID,
// } = require("../controller/modules/interview/Myinterviewchecklist");
// interviewRoute.route("/mychecklist").get(getAllMyCheckList);
// interviewRoute.route("/mychecklist/new").post(addMyCheckList);
// interviewRoute
//   .route("/mychecklist/:id")
//   .delete(deleteMyCheckList)
//   .get(getSingleMyCheckList)
//   .put(updateMyCheckList);
// interviewRoute
//   .route("/mychecklist/usingobjectid/:id")
//   .put(updateMyCheckListUsingObjectID);

// const {
//   fetchUnassignedCandidates, fetchPendingLongAbsentCheckList, fetchDataAndProcess, fetchLeaveDatas, fetchPermissionDatas, fetchUserDatas, getCandidateById, exitNotificationDatas, removeUserFromExistingDatas
// } = require("../controller/modules/interview/Checklistview");
// interviewRoute.route("/checklistview").post(fetchUnassignedCandidates);
// interviewRoute.route("/interviewpendingchecklist").post(fetchDataAndProcess);
// interviewRoute.route("/interviewpendingchecklistleave").post(fetchLeaveDatas);
// interviewRoute.route("/interviewpendingchecklistpermission").post(fetchPermissionDatas);
// interviewRoute.route("/fetchuserdatas").get(fetchUserDatas);
// interviewRoute.route("/candidatefordocument/:id").get(getCandidateById);
// interviewRoute.route("/pendingchecklistlongabsent").post(fetchPendingLongAbsentCheckList);

// //newly added 02.12.2024
// interviewRoute.route("/removeemployeenamefromchecklistdatas").post(removeUserFromExistingDatas);

// //exit notification datas
// interviewRoute.route("/fetchexitnotification").post(exitNotificationDatas);

// //28.08.2024 newly added
// const { getAllChecklistModule, addChecklistModule, getSingleChecklistModule, updateChecklistModule, deleteChecklistModule, getAllChecklistModuleByPagination } = require("../controller/modules/interview/checklistmoduleselection");
// interviewRoute.route("/checklistmodule").get(getAllChecklistModule);
// interviewRoute.route("/checklistmodule/new").post(addChecklistModule);
// interviewRoute.route("/checklistmodule/:id").get(getSingleChecklistModule).put(updateChecklistModule).delete(deleteChecklistModule);
// interviewRoute.route("/checklistmodulebypagination").post(getAllChecklistModuleByPagination);

// //newly added for exit interview questions
// const { getAllExitInterviewQuestions, addExitInterviewQuestions, deleteExitInterviewQuestion, getSingleExitInterviewQuestion, updateExitInterviewQuestion } = require("../controller/modules/interview/exitinterviewquestion");

// interviewRoute.route("/exitinterviewquestions").get(getAllExitInterviewQuestions);
// interviewRoute.route("/exitinterviewquestion/new").post(addExitInterviewQuestions);
// interviewRoute
//   .route("/exitinterviewquestion/:id")
//   .delete(deleteExitInterviewQuestion)
//   .get(getSingleExitInterviewQuestion)
//   .put(updateExitInterviewQuestion);

// const { getAllExitInterviewTestMaster, addExitInterviewTestMaster, getSingleExitInterviewTestMaster, updateExitInterviewTestMaster, deleteExitInterviewTestMaster } = require("../controller/modules/interview/exitinterviewtestmaster");

// interviewRoute.route("/exitinterviewtestmaster").get(getAllExitInterviewTestMaster);
// interviewRoute.route("/exitinterviewtestmaster/new").post(addExitInterviewTestMaster);

// interviewRoute
//   .route("/exitinterviewtestmaster/:id")
//   .get(getSingleExitInterviewTestMaster)
//   .put(updateExitInterviewTestMaster)
//   .delete(deleteExitInterviewTestMaster);


// //  Interview Verification Master..
// const { addInterviewVerification, deleteInterviewVerification, getAllInterviewVerification, getSingleInterviewVerification, updateInterviewVerification, overallBulkDeleteInterviewVerification, overallDeleteInterviewVerification, overallEditInterviewVerification } = require("../controller/modules/interview/interviewVerification");
// interviewRoute.route("/allinterviewverification").get(getAllInterviewVerification);
// interviewRoute.route("/interviewverification/new").post(addInterviewVerification);
// interviewRoute.route("/singleinterviewverification/:id").get(getSingleInterviewVerification).put(updateInterviewVerification).delete(deleteInterviewVerification);
// interviewRoute
//   .route("/overalldelete/interviewverification")
//   .post(overallDeleteInterviewVerification);
// interviewRoute
//   .route("/overalledit/interviewverification")
//   .put(overallEditInterviewVerification);
// interviewRoute
//   .route("/overallbulkdelete/interviewverification")
//   .post(overallBulkDeleteInterviewVerification);

// //  Typing Test Practice Questions..
// const { addPracticeQuestions, deletePracticeQuestions, getAllPracticeQuestions, getSinglePracticeQuestions, updatePracticeQuestions } = require("../controller/modules/interview/typingPracticeQuestions");
// interviewRoute.route("/alltypingpracticequestions").get(getAllPracticeQuestions);
// interviewRoute.route("/typingpracticequestions/new").post(addPracticeQuestions);
// interviewRoute.route("/singletypingpracticequestions/:id").get(getSinglePracticeQuestions).put(updatePracticeQuestions).delete(deletePracticeQuestions);
// //  Typing Test Practice Questions Grouping..
// const { addPracticeQuestionsGrouping, deletePracticeQuestionsGrouping, getAllPracticeQuestionsGrouping, getSinglePracticeQuestionsGrouping, updatePracticeQuestionsGrouping, getIndividualPracticeSession, addPracticeQuestionResponse, getPracticeSessionQuestions, getSinglePracticeQuestionResponse, getDynamicPracticeSesionResponse, getPracticeQuestionIds } = require("../controller/modules/interview/typingPracticeQuestionsGrouping");
// interviewRoute.route("/practicequestionids").post(getPracticeQuestionIds);
// interviewRoute.route("/dynamicpracticeresponse").post(getDynamicPracticeSesionResponse);
// interviewRoute.route("/typingsessionquestions/:id").get(getPracticeSessionQuestions);
// interviewRoute.route("/singletypingpracticeresponse/:id").get(getSinglePracticeQuestionResponse);
// interviewRoute.route("/addtypingresponse").post(addPracticeQuestionResponse);
// interviewRoute.route("/typingindividualpractice").post(getIndividualPracticeSession);
// interviewRoute.route("/alltypingpracticequestionsgrouping").get(getAllPracticeQuestionsGrouping);
// interviewRoute.route("/typingpracticequestionsgrouping/new").post(addPracticeQuestionsGrouping);
// interviewRoute.route("/singletypingpracticequestionsgrouping/:id").get(getSinglePracticeQuestionsGrouping).put(updatePracticeQuestionsGrouping).delete(deletePracticeQuestionsGrouping);

// module.exports = interviewRoute;











const express = require("express");
const interviewRoute = express.Router();

// connect add category ticket form controller

const {
  getAllInterviewCategory,
  //   getSingleInterviewCategory,
  //   addInterviewCategory,
  //   updateInterviewCategory,
  //   deleteInterviewCategory,
  //   overallDeleteInterviewCategory,
  //   overallBulkDeleteInterviewCategory,
  //   overallEditInterviewCategory,
} = require("../controller/modules/interview/addcategoryinterview");
interviewRoute.route("/interviewcategories").get(getAllInterviewCategory);
// interviewRoute.route("/interviewcategory/new").post(addInterviewCategory);
// interviewRoute
//   .route("/overalldelete/interviewcategory")
//   .post(overallDeleteInterviewCategory);
// interviewRoute
//   .route("/overalledit/interviewcategory")
//   .put(overallEditInterviewCategory);
// interviewRoute
//   .route("/overallbulkdelete/interviewcategory")
//   .post(overallBulkDeleteInterviewCategory);
// interviewRoute
//   .route("/interviewcategory/:id")
//   .get(getSingleInterviewCategory)
//   .put(updateInterviewCategory)
//   .delete(deleteInterviewCategory);

// const {
//   getAllRoundmaster,
//   getSingleRoundmaster,
//   addRoundmaster,
//   updateRoundmaster,
//   deleteRoundmaster,
//   overallBulkDeleteRoundMaster,
//   overallDeleteRoundMaster,
//   overallEditRoundMaster,
// } = require("../controller/modules/interview/roundmaster");
// interviewRoute.route("/roundmasters").get(getAllRoundmaster);
// interviewRoute.route("/roundmaster/new").post(addRoundmaster);
// interviewRoute
//   .route("/overalldelete/interviewroundmaster")
//   .post(overallDeleteRoundMaster);
// interviewRoute
//   .route("/overalledit/interviewroundmaster")
//   .put(overallEditRoundMaster);
// interviewRoute
//   .route("/overallbulkdelete/interviewroundmaster")
//   .post(overallBulkDeleteRoundMaster);
// interviewRoute
//   .route("/roundmaster/:id")
//   .get(getSingleRoundmaster)
//   .put(updateRoundmaster)
//   .delete(deleteRoundmaster);

// // connect interview type master from controller

// const {
//   getAllInterviewtypemaster,
//   getSingleInterviewtypemaster,
//   addInterviewtypemaster,
//   updateInterviewtypemaster,
//   deleteInterviewtypemaster,
//   overallBulkDeleteTypeMaster,
//   overallDeleteTypeMaster,
//   overallEditTypeMaster,
// } = require("../controller/modules/interview/interviewtypemaster");
// interviewRoute.route("/interviewtypemasters").get(getAllInterviewtypemaster);
// interviewRoute.route("/interviewtypemaster/new").post(addInterviewtypemaster);
// interviewRoute
//   .route("/overalldelete/interviewtypemaster")
//   .post(overallDeleteTypeMaster);
// interviewRoute
//   .route("/overalledit/interviewtypemaster")
//   .put(overallEditTypeMaster);
// interviewRoute
//   .route("/overallbulkdelete/interviewtypemaster")
//   .post(overallBulkDeleteTypeMaster);
// interviewRoute
//   .route("/interviewtypemaster/:id")
//   .get(getSingleInterviewtypemaster)
//   .put(updateInterviewtypemaster)
//   .delete(deleteInterviewtypemaster);
// // connect interviewquestions from controller

// const {
//   getAllInterviewQuestion,
//   getSingleInterviewQuestion,
//   addInterviewQuestion,
//   updateInterviewQuestion,
//   deleteInterviewQuestion,
//   overallBulkDeleteInterviewQuestions,
//   overallDeleteInterviewQuestions,
//   overallEditInterviewQuestions,
//   getInterviewQuestion,
//   getInterviewTypingQuestion,
//   skippedInterviewQuestion,
//   getDynamicInterviewQuestion
// } = require("../controller/modules/interview/interviewquestions");
// interviewRoute.route("/dynamicinterviewquestions").post(getDynamicInterviewQuestion);
// interviewRoute.route("/interviewquestions").get(getAllInterviewQuestion);
// interviewRoute.route("/allinterviewquestions").get(getInterviewQuestion);
// interviewRoute
//   .route("/allinterviewtypingquestions")
//   .get(getInterviewTypingQuestion);
// interviewRoute.route("/interviewquestion/new").post(addInterviewQuestion);
// interviewRoute
//   .route("/overalldelete/interviewquestions")
//   .post(overallDeleteInterviewQuestions);
// interviewRoute
//   .route("/overalledit/interviewquestions")
//   .put(overallEditInterviewQuestions);
// interviewRoute
//   .route("/overallbulkdelete/interviewquestions")
//   .post(overallBulkDeleteInterviewQuestions);
// interviewRoute
//   .route("/skippedinterviewquestions")
//   .post(skippedInterviewQuestion);
// interviewRoute
//   .route("/interviewquestion/:id")
//   .get(getSingleInterviewQuestion)
//   .put(updateInterviewQuestion)
//   .delete(deleteInterviewQuestion);
// // connect interviewquestions Grouping from controller

// const {
//   getAllInterviewGroupingQuestion,
//   getAllInterviewGroupingQuestionFilter,
//   getSingleInterviewGroupingQuestion,
//   addInterviewGroupingQuestion,
//   updateInterviewGroupingQuestion,
//   deleteInterviewGroupingQuestion,
//   overallBulkDeleteInterviewQuestionGrouping,
//   overallDeleteInterviewQuestionGrouping,
//   overallEditInterviewQuestionGrouping,
// } = require("../controller/modules/interview/interviewquestiongrouping");
// interviewRoute
//   .route("/interviewquestiongroupings")
//   .get(getAllInterviewGroupingQuestion);
// interviewRoute
//   .route("/interviewquestiongroupingsfilter")
//   .post(getAllInterviewGroupingQuestionFilter);
// interviewRoute
//   .route("/interviewquestiongrouping/new")
//   .post(addInterviewGroupingQuestion);
// interviewRoute
//   .route("/interviewquestiongrouping/:id")
//   .get(getSingleInterviewGroupingQuestion)
//   .put(updateInterviewGroupingQuestion)
//   .delete(deleteInterviewGroupingQuestion);
// interviewRoute
//   .route("/overalldelete/interviewquestiongrouping")
//   .post(overallDeleteInterviewQuestionGrouping);
// interviewRoute
//   .route("/overallbulkdelete/interviewquestiongrouping")
//   .post(overallBulkDeleteInterviewQuestionGrouping);
// interviewRoute
//   .route("/overalledit/interviewquestiongrouping")
//   .put(overallEditInterviewQuestionGrouping);
// //interview Form Designs
// const {
//   getAllInterviewFormDesign,
//   getSingleInterviewFormDesign,
//   addInterviewFormDesign,
//   updateInterviewFormDesign,
//   deleteInterviewFormDesign,
//   overallBulkDeleteInterviewStatusAllot,
//   overallDeleteInterviewStatusAllot,
//   overallEditInterviewStatusAllot,
// } = require("../controller/modules/interview/interviewformgenerate");
// interviewRoute.route("/interviewformdesigns").get(getAllInterviewFormDesign);
// interviewRoute.route("/interviewformdesign/new").post(addInterviewFormDesign);
// interviewRoute
//   .route("/overalldelete/interviewstatusallot")
//   .post(overallDeleteInterviewStatusAllot);
// interviewRoute
//   .route("/overallbulkdelete/interviewstatusallot")
//   .post(overallBulkDeleteInterviewStatusAllot);
// interviewRoute
//   .route("/overalledit/interviewstatusallot")
//   .put(overallEditInterviewStatusAllot);
// interviewRoute
//   .route("/interviewformdesign/:id")
//   .get(getSingleInterviewFormDesign)
//   .put(updateInterviewFormDesign)
//   .delete(deleteInterviewFormDesign);

// //interview answer allot
// //interview answer allot
// const {
//   addInterviewFormAllot,
//   deleteInterviewFormAllot,
//   getAllInterviewFormAllot,
//   getSingleInterviewFormAllot,
//   updateInterviewFormAllot,
//   overallBulkDeleteInterviewAnswerAllot,
//   overallDeleteInterviewAnswerAllot,
//   overallEditInterviewAnswerAllot,
// } = require("../controller/modules/interview/InterviewQuestionAnswerAllot");
// interviewRoute.route("/interviewanswerallots").get(getAllInterviewFormAllot);
// interviewRoute.route("/interviewanswerallot/new").post(addInterviewFormAllot);
// interviewRoute
//   .route("/overalldelete/interviewanswerallot")
//   .post(overallDeleteInterviewAnswerAllot);
// interviewRoute
//   .route("/overallbulkdelete/interviewanswerallot")
//   .post(overallBulkDeleteInterviewAnswerAllot);
// interviewRoute
//   .route("/overalledit/interviewanswerallot")
//   .put(overallEditInterviewAnswerAllot);
// interviewRoute
//   .route("/interviewanswerallot/:id")
//   .get(getSingleInterviewFormAllot)
//   .put(updateInterviewFormAllot)
//   .delete(deleteInterviewFormAllot);

// const {
//   getAllInterviewTestMaster,
//   addInterviewTestMaster,
//   getSingleInterviewTestMaster,
//   updateInterviewTestMaster,
//   deleteInterviewTestMaster,
//   overallBulkDeleteTestMaster,
//   overallDeleteTestMaster,
//   overallEditTestMaster,
// } = require("../controller/modules/interview/interviewtestmaster");
// interviewRoute.route("/interviewtestmaster").get(getAllInterviewTestMaster);
// interviewRoute.route("/interviewtestmaster/new").post(addInterviewTestMaster);
// interviewRoute
//   .route("/overalldelete/interviewtestmaster")
//   .post(overallDeleteTestMaster);
// interviewRoute
//   .route("/overalledit/interviewtestmaster")
//   .put(overallEditTestMaster);
// interviewRoute
//   .route("/overallbulkdelete/interviewtestmaster")
//   .post(overallBulkDeleteTestMaster);
// interviewRoute
//   .route("/interviewtestmaster/:id")
//   .get(getSingleInterviewTestMaster)
//   .put(updateInterviewTestMaster)
//   .delete(deleteInterviewTestMaster);
// // interview questions order backend route
// const {
//   addInterviewQuestionsOrder,
//   deleteInterviewQuestionsOrder,
//   getAllInterviewQuestionsOrder,
//   getSingleInterviewQuestionsOrder,
//   updateInterviewQuestionsOrder,
//   overallBulkDeleteInterviewQuestionOrder,
//   overallDeleteInterviewQuestionOrder,
// } = require("../controller/modules/interview/InterviewQuestionsOrderController");
// interviewRoute
//   .route("/interviewquestionsorders")
//   .get(getAllInterviewQuestionsOrder);
// interviewRoute
//   .route("/interviewquestionsorder/new")
//   .post(addInterviewQuestionsOrder);
// interviewRoute
//   .route("/interviewquestionsorder/:id")
//   .get(getSingleInterviewQuestionsOrder)
//   .put(updateInterviewQuestionsOrder)
//   .delete(deleteInterviewQuestionsOrder);
// interviewRoute
//   .route("/overalldelete/interviewquestionorder")
//   .post(overallDeleteInterviewQuestionOrder);
// interviewRoute
//   .route("/overallbulkdelete/interviewquestionorder")
//   .post(overallBulkDeleteInterviewQuestionOrder);

// // interview questions order backend route
// const {
//   addInterviewUserResponse,
//   deleteInterviewUserResponse,
//   getAllInterviewUserResponse,
//   getSingleInterviewUserResponse,
//   updateInterviewUserResponse,
//   interviewLogin,
//   getInterviewRoundById,
//   updateCandidateStatus,
//   deleteSingleInterviewRound, exitInterviewLogin
// } = require("../controller/modules/interview/interviewUserResponse");
// interviewRoute
//   .route("/interviewuserresponses")
//   .get(getAllInterviewUserResponse);
// interviewRoute.route("/interviewlogin").post(interviewLogin);
// interviewRoute
//   .route("/fetchinterviewround/:candidateid/:roundids")
//   .post(getInterviewRoundById);
// interviewRoute
//   .route("/updateinterviewrounddata/:id")
//   .put(updateCandidateStatus);
// interviewRoute
//   .route("/deleteinterviewround/:id")
//   .delete(deleteSingleInterviewRound);
// interviewRoute
//   .route("/interviewuserresponse/new")
//   .post(addInterviewUserResponse);
// interviewRoute
//   .route("/interviewuserresponse/:id")
//   .get(getSingleInterviewUserResponse)
//   .put(updateInterviewUserResponse)
//   .delete(deleteInterviewUserResponse);
// interviewRoute.route("/exitinterviewlogin").post(exitInterviewLogin);
// //interview Round Order
// const {
//   getAllInterviewroundorder,
//   getSingleInterviewroundorder,
//   addInterviewroundorder,
//   updateInterviewroundorder,
//   deleteInterviewroundorder,
//   overallBulkDeleteInterviewRoundOrder,
//   overallDeleteInterviewRoundOrder,candidatesHistory
// } = require("../controller/modules/interview/interviewroundorder");
// interviewRoute.route("/interviewroundorders").get(getAllInterviewroundorder);
// interviewRoute.route("/interviewroundorder/new").post(addInterviewroundorder);
// interviewRoute.route("/candidateshistory").post(candidatesHistory);
// interviewRoute
//   .route("/interviewroundorder/:id")
//   .get(getSingleInterviewroundorder)
//   .put(updateInterviewroundorder)
//   .delete(deleteInterviewroundorder);
// interviewRoute
//   .route("/overalldelete/interviewroundorder")
//   .post(overallDeleteInterviewRoundOrder);
// interviewRoute
//   .route("/overallbulkdelete/interviewroundorder")
//   .post(overallBulkDeleteInterviewRoundOrder);

const {
  getAllAssigninterviewer,
  addAssigninterview,
  getSingleAssigninterview,
  updateAssigninterviewer,
  deleteAssigninterviewer,
  getAssignInterviewFilter, getAssignInterviewFilterManual, getAllAssigninterviewerVisitor
} = require("../controller/modules/interview/assigninterviewer");
interviewRoute.route("/assigninterviewers").post(getAllAssigninterviewer);
interviewRoute.route("/assigninterviewervisitor").post(getAllAssigninterviewerVisitor);
interviewRoute.route("/assigninterviewer/new").post(addAssigninterview);
interviewRoute.route("/assigninterviewersfiltermanual").post(getAssignInterviewFilterManual);
interviewRoute
  .route("/assigninterviewersfilter")
  .post(getAssignInterviewFilter);
interviewRoute
  .route("/assigninterviewer/:id")
  .get(getSingleAssigninterview)
  .put(updateAssigninterviewer)
  .delete(deleteAssigninterviewer);

//checklist type
const {
  getAllChecklisttype,
  getSingleChecklisttype,
  getAllChecklistByPagination,
  addChecklisttype,
  updateChecklisttype,
  deleteChecklisttype, getAllChecklistNotAssignedByPagination, addChecklisttypeBulk, checkCategoryUsedByOthers, checkChecklistUsedByOthers, checkAssignChecklistUsedByOthers, checklistCategoryOverallUpdate, checklistTypeOverallUpdate, checklistCategoryConnectPages, checklistTypeConnectPages
} = require("../controller/modules/interview/checklisttype");
interviewRoute.route("/checklisttypes").get(getAllChecklisttype);
interviewRoute.route("/checklisttype/new").post(addChecklisttype);
interviewRoute.route("/checklisttypebulk/new").post(addChecklisttypeBulk);
interviewRoute.route("/mychecklistbypaginationnotassigned").post(getAllChecklistNotAssignedByPagination);
interviewRoute
  .route("/checklisttype/:id")
  .get(getSingleChecklisttype)
  .put(updateChecklisttype)
  .delete(deleteChecklisttype);
interviewRoute
  .route("/mychecklistbypagination")
  .post(getAllChecklistByPagination);

interviewRoute.route("/checkcategoryusedbyothers").post(checkCategoryUsedByOthers);
interviewRoute.route("/checkchecklistusedbyothers").post(checkChecklistUsedByOthers);
interviewRoute.route("/checkassignchecklistusedbyothers").post(checkAssignChecklistUsedByOthers);
interviewRoute.route("/checklistoverallcategoryupdate").post(checklistCategoryOverallUpdate);
interviewRoute.route("/checklistoveralltypeupdate").post(checklistTypeOverallUpdate);
interviewRoute.route("/checkconnectedpages").post(checklistCategoryConnectPages);
interviewRoute.route("/checkchecklisttypeconnectedpages").post(checklistTypeConnectPages);

const {
  getAllEmployeeStatus,
  getSingleEmployeeStatus,
  addEmployeeStatus,
  updateEmployeeStatus,
  deleteEmployeeStatus,
} = require("../controller/modules/interview/EmployeeStatusController");
interviewRoute.route("/employeestatuss").get(getAllEmployeeStatus);
interviewRoute.route("/employeestatus/new").post(addEmployeeStatus);
interviewRoute
  .route("/employeestatus/:id")
  .get(getSingleEmployeeStatus)
  .put(updateEmployeeStatus)
  .delete(deleteEmployeeStatus);

const {
  getAllChecklistInterview,
  getSingleChecklistInterview,
  addChecklistInterview,
  updateChecklistInterview,
  deleteChecklistInterview,
} = require("../controller/modules/interview/ChecklistInterviewController");
interviewRoute.route("/checklistinterviews").get(getAllChecklistInterview);
interviewRoute.route("/checklistinterview/new").post(addChecklistInterview);
interviewRoute
  .route("/checklistinterview/:id")
  .get(getSingleChecklistInterview)
  .put(updateChecklistInterview)
  .delete(deleteChecklistInterview);

// checklist category form controller

const {
  getAllChecklistCategory,
  getSingleChecklistCategory,
  addChecklistCategory,
  updateChecklistCategory,
  deleteChecklistCategory,
} = require("../controller/modules/interview/checklistcategory");
interviewRoute.route("/checklistcategories").get(getAllChecklistCategory);
interviewRoute.route("/checklistcategory/new").post(addChecklistCategory);
interviewRoute
  .route("/checklistcategory/:id")
  .get(getSingleChecklistCategory)
  .put(updateChecklistCategory)
  .delete(deleteChecklistCategory);

//connect Online Test Question For an task controller
const {
  addOnlineTestQuestions,
  deleteOnlineTestQuestions,
  getAllOnlineTestQuestions,
  getSingleOnlineTestQuestions,
  updateOnlineTestQuestions,
} = require("../controller/modules/interview/onlinetestquestions");
interviewRoute.route("/onlinetestquestions").get(getAllOnlineTestQuestions);
interviewRoute.route("/onlinetestquestion/new").post(addOnlineTestQuestions);
interviewRoute
  .route("/onlinetestquestion/:id")
  .delete(deleteOnlineTestQuestions)
  .get(getSingleOnlineTestQuestions)
  .put(updateOnlineTestQuestions);

const {
  addOnlineTestMasters,
  deleteOnlineTestMasters,
  getAllOnlineTestMasters,
  getSingleOnlineTestMasters,
  updateOnlineTestMasters,
} = require("../controller/modules/interview/onlinetestmaster");
interviewRoute.route("/onlinetestmasters").get(getAllOnlineTestMasters);
interviewRoute.route("/onlinetestmaster/new").post(addOnlineTestMasters);
interviewRoute
  .route("/onlinetestmaster/:id")
  .delete(deleteOnlineTestMasters)
  .get(getSingleOnlineTestMasters)
  .put(updateOnlineTestMasters);
// Checklist verification master controller


const {
  getAllChecklistverificationmaster,
  getSingleChecklistverificationmaster,
  addChecklistverificationmaster,
  updateChecklistverificationmaster,
  getModuleBasedAssignment,
  deleteChecklistverificationmaster,
  getAllChecklistverificationmasterByPagination,
  getAllDuplicateAssignChecklistConditons
} = require('../controller/modules/interview/checklistverificationmaster');
interviewRoute.route('/checklistverificationmasters').get(getAllChecklistverificationmaster);
interviewRoute.route('/checklistverificationmaster/new').post(addChecklistverificationmaster);
interviewRoute.route('/checklistverificationmaster/:id').get(getSingleChecklistverificationmaster).put(updateChecklistverificationmaster).delete(deleteChecklistverificationmaster);
interviewRoute.route('/checklistverificationmasterbypagination').post(getAllChecklistverificationmasterByPagination);
interviewRoute.route('/duplicateassignchecklistconditions').post(getAllDuplicateAssignChecklistConditons);
interviewRoute.route('/checklistassignmentmodules').get(getModuleBasedAssignment);




const {
  getAllMyCheckList,
  addMyCheckList,
  deleteMyCheckList,
  getSingleMyCheckList,
  updateMyCheckList,
  updateMyCheckListUsingObjectID,
} = require("../controller/modules/interview/Myinterviewchecklist");
interviewRoute.route("/mychecklist").get(getAllMyCheckList);
interviewRoute.route("/mychecklist/new").post(addMyCheckList);
interviewRoute
  .route("/mychecklist/:id")
  .delete(deleteMyCheckList)
  .get(getSingleMyCheckList)
  .put(updateMyCheckList);
interviewRoute
  .route("/mychecklist/usingobjectid/:id")
  .put(updateMyCheckListUsingObjectID);

const {
  fetchUnassignedCandidates, fetchPendingLongAbsentCheckList, fetchDataAndProcess, fetchLeaveDatas, fetchPermissionDatas, fetchUserDatas, getCandidateById, exitNotificationDatas, removeUserFromExistingDatas, fetchQueuePriorityDatasMatched, replaceQueuePriorityMatchedFields
} = require("../controller/modules/interview/Checklistview");
interviewRoute.route("/checklistview").post(fetchUnassignedCandidates);
interviewRoute.route("/interviewpendingchecklist").post(fetchDataAndProcess);
interviewRoute.route("/interviewpendingchecklistleave").post(fetchLeaveDatas);
interviewRoute.route("/interviewpendingchecklistpermission").post(fetchPermissionDatas);
interviewRoute.route("/fetchuserdatas").get(fetchUserDatas);
interviewRoute.route("/candidatefordocument/:id").get(getCandidateById);
interviewRoute.route("/pendingchecklistlongabsent").post(fetchPendingLongAbsentCheckList);

//newly added 02.12.2024
interviewRoute.route("/removeemployeenamefromchecklistdatas").post(removeUserFromExistingDatas);

//exit notification datas
interviewRoute.route("/fetchexitnotification").post(exitNotificationDatas);
interviewRoute.route("/queuepriorityuserslist").post(fetchQueuePriorityDatasMatched);
interviewRoute.route("/queuepriorityuserslistmodify").post(replaceQueuePriorityMatchedFields);

//28.08.2024 newly added
const { getAllChecklistModule, addChecklistModule, getSingleChecklistModule, updateChecklistModule, deleteChecklistModule, getAllChecklistModuleByPagination } = require("../controller/modules/interview/checklistmoduleselection");
interviewRoute.route("/checklistmodule").get(getAllChecklistModule);
interviewRoute.route("/checklistmodule/new").post(addChecklistModule);
interviewRoute.route("/checklistmodule/:id").get(getSingleChecklistModule).put(updateChecklistModule).delete(deleteChecklistModule);
interviewRoute.route("/checklistmodulebypagination").post(getAllChecklistModuleByPagination);

//newly added for exit interview questions
const { getAllExitInterviewQuestions, addExitInterviewQuestions, deleteExitInterviewQuestion, getSingleExitInterviewQuestion, updateExitInterviewQuestion } = require("../controller/modules/interview/exitinterviewquestion");

interviewRoute.route("/exitinterviewquestions").get(getAllExitInterviewQuestions);
interviewRoute.route("/exitinterviewquestion/new").post(addExitInterviewQuestions);
interviewRoute
  .route("/exitinterviewquestion/:id")
  .delete(deleteExitInterviewQuestion)
  .get(getSingleExitInterviewQuestion)
  .put(updateExitInterviewQuestion);

const { getAllExitInterviewTestMaster, addExitInterviewTestMaster, getSingleExitInterviewTestMaster, updateExitInterviewTestMaster, deleteExitInterviewTestMaster } = require("../controller/modules/interview/exitinterviewtestmaster");

interviewRoute.route("/exitinterviewtestmaster").get(getAllExitInterviewTestMaster);
interviewRoute.route("/exitinterviewtestmaster/new").post(addExitInterviewTestMaster);

interviewRoute
  .route("/exitinterviewtestmaster/:id")
  .get(getSingleExitInterviewTestMaster)
  .put(updateExitInterviewTestMaster)
  .delete(deleteExitInterviewTestMaster);


//  Interview Verification Master..
const { addInterviewVerification, deleteInterviewVerification, getAllInterviewVerification, getSingleInterviewVerification, updateInterviewVerification, overallBulkDeleteInterviewVerification, overallDeleteInterviewVerification, overallEditInterviewVerification } = require("../controller/modules/interview/interviewVerification");
interviewRoute.route("/allinterviewverification").get(getAllInterviewVerification);
interviewRoute.route("/interviewverification/new").post(addInterviewVerification);
interviewRoute.route("/singleinterviewverification/:id").get(getSingleInterviewVerification).put(updateInterviewVerification).delete(deleteInterviewVerification);
interviewRoute
  .route("/overalldelete/interviewverification")
  .post(overallDeleteInterviewVerification);
interviewRoute
  .route("/overalledit/interviewverification")
  .put(overallEditInterviewVerification);
interviewRoute
  .route("/overallbulkdelete/interviewverification")
  .post(overallBulkDeleteInterviewVerification);

//  Typing Test Practice Questions..
const { addPracticeQuestions, deletePracticeQuestions, getAllPracticeQuestions, getSinglePracticeQuestions, updatePracticeQuestions } = require("../controller/modules/interview/typingPracticeQuestions");
interviewRoute.route("/alltypingpracticequestions").get(getAllPracticeQuestions);
interviewRoute.route("/typingpracticequestions/new").post(addPracticeQuestions);
interviewRoute.route("/singletypingpracticequestions/:id").get(getSinglePracticeQuestions).put(updatePracticeQuestions).delete(deletePracticeQuestions);
//  Typing Test Practice Questions Grouping..
const { addPracticeQuestionsGrouping, deletePracticeQuestionsGrouping, getAllPracticeQuestionsGrouping, getSinglePracticeQuestionsGrouping, updatePracticeQuestionsGrouping, getIndividualPracticeSession, addPracticeQuestionResponse, getPracticeSessionQuestions, getSinglePracticeQuestionResponse, getDynamicPracticeSesionResponse, getPracticeQuestionIds } = require("../controller/modules/interview/typingPracticeQuestionsGrouping");
interviewRoute.route("/practicequestionids").post(getPracticeQuestionIds);
interviewRoute.route("/dynamicpracticeresponse").post(getDynamicPracticeSesionResponse);
interviewRoute.route("/typingsessionquestions/:id").get(getPracticeSessionQuestions);
interviewRoute.route("/singletypingpracticeresponse/:id").get(getSinglePracticeQuestionResponse);
interviewRoute.route("/addtypingresponse").post(addPracticeQuestionResponse);
interviewRoute.route("/typingindividualpractice").post(getIndividualPracticeSession);
interviewRoute.route("/alltypingpracticequestionsgrouping").get(getAllPracticeQuestionsGrouping);
interviewRoute.route("/typingpracticequestionsgrouping/new").post(addPracticeQuestionsGrouping);
interviewRoute.route("/singletypingpracticequestionsgrouping/:id").get(getSinglePracticeQuestionsGrouping).put(updatePracticeQuestionsGrouping).delete(deletePracticeQuestionsGrouping);

module.exports = interviewRoute;