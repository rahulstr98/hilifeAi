const express = require("express");
const interactorRoute = express.Router();
const visitorMulter = require('../middleware/visitorMulter');
const visitorinformationMulter = require('../middleware/visitorinformationMulter');

//interactor type  route
const { getAllInteractorType, addInteractorType, deleteInteractorType, updateInteractorType, overallBulkDeleteInteracterType, interactorTypeOverall, getSingleInteractorType } = require('../controller/modules/interactors/interactortype');
interactorRoute.route('/interactortype').get(getAllInteractorType);
interactorRoute.route('/interactortype/new').post(addInteractorType);
interactorRoute.route('/interactortypeoverall').post(interactorTypeOverall);
interactorRoute.route('/interactortypeoveralloverallBulkdelete').post(overallBulkDeleteInteracterType);
interactorRoute.route('/interactortype/:id').delete(deleteInteractorType).get(getSingleInteractorType).put(updateInteractorType);

//interactor purpose  route
const { getAllInteractorPurpose, addInteractorPurpose, deleteInteractorPurpose, InteractorPurposeOverallBulkdelete, InteractorPurposeOverall, updateInteractorPurpose, getSingleInteractorPurpose } = require('../controller/modules/interactors/interactorpurpose');
interactorRoute.route('/interactorpurpose').get(getAllInteractorPurpose);
interactorRoute.route('/interactorpurpose/new').post(addInteractorPurpose);
interactorRoute.route('/interactorpurposeoverallbulkdelete').post(InteractorPurposeOverallBulkdelete);
interactorRoute.route('/interactorpurposeoverall').post(InteractorPurposeOverall);
interactorRoute.route('/interactorpurpose/:id').delete(deleteInteractorPurpose).get(getSingleInteractorPurpose).put(updateInteractorPurpose);

//interactor mode route
const { getAllInteractorMode, addInteractorMode, deleteInteractorMode, updateInteractorMode, InteractorModeOverall, InteractorModeOverallBulkdelete, getSingleInteractorMode } = require('../controller/modules/interactors/interactormode');
interactorRoute.route('/interactormode').get(getAllInteractorMode);
interactorRoute.route('/interactormode/new').post(addInteractorMode);
interactorRoute.route('/interactormodeoverall').post(InteractorModeOverall);
interactorRoute.route('/interactormodeoveralloverallBulkdelete').post(InteractorModeOverallBulkdelete);
interactorRoute.route('/interactormode/:id').delete(deleteInteractorMode).get(getSingleInteractorMode).put(updateInteractorMode);

//visitors backend route in interactor file

//visitors backend route in interactor file

const {
  addVisitors,
  deleteVisitors,
  getAllVisitors,
  getSingleVisitors,
  updateVisitors,
  skippedVisitors,
  skippedAllVisitors, getAllVisitorsForCandidate, getExistingVisitor,
  getLastIndexVisitors, getAllVisitorUpdateId, getAllVisitorsCheckout,AddVisitorInList, duplicateCandidateFaceDetectorVisitor, getAllVisitorsFilteredId, getAllVisitorsRegister
} = require("../controller/modules/interactors/visitor");
interactorRoute.route("/allvisitors").post(getAllVisitors);
interactorRoute.route("/checkexistingvisitor").post(getExistingVisitor);
interactorRoute.route("/allvisitorsregister").get(getAllVisitorsRegister);
interactorRoute.route("/lastindexvisitors").get(getLastIndexVisitors);
interactorRoute.route("/skippedvisitors").post(skippedVisitors);
interactorRoute.route("/addvisitorin").post(AddVisitorInList);
interactorRoute.route("/visitorsfilteredid").get(getAllVisitorsFilteredId);
interactorRoute.route("/allvisitorscheckout").post(getAllVisitorsCheckout);
interactorRoute.route("/visitorsupdateid").post(getAllVisitorUpdateId);
interactorRoute.route("/skippedallvisitors").post(skippedAllVisitors);
interactorRoute.route("/visitors/new").post(addVisitors);
interactorRoute.route("/duplicatecandidatefacecheckvisitor").post(duplicateCandidateFaceDetectorVisitor);
interactorRoute.route("/allvisitorsforcandidate").get(getAllVisitorsForCandidate);
interactorRoute
  .route("/visitors/:id")
  .delete(deleteVisitors)
  .get(getSingleVisitors)
  .put(updateVisitors);



const { getAllManageTypePG, addManageTypePG, updateManageTypePG, addManageTypePGOverall, managetypepgoverallmanagetypegbulkdelete, deleteManageTypePG, getSingleManageTypePG } = require('../controller/modules/interactors/managetypepurposegrouping');
interactorRoute.route('/managetypepg').get(getAllManageTypePG);
interactorRoute.route('/managetypepg/new').post(addManageTypePG);
interactorRoute.route('/managetypepgoverallmanagetypeg').post(addManageTypePGOverall);
interactorRoute.route('/managetypepgoverallmanagetypegbulkdelete').post(managetypepgoverallmanagetypegbulkdelete);
interactorRoute.route('/managetypepg/:id').delete(deleteManageTypePG).get(getSingleManageTypePG).put(updateManageTypePG);


const {
  addVisitorDetailsLog,
  getvisitorNames,
  deleteVisitorDetailsLog,
  getAlloverallfiltervisitorsname,
  getSingleVisitorDetailsLogforProfile,
  getSingleVisitorDetailsLogWithoutfiles,
  getAllVisitorDetailsLogForProfile,
  getSingleVisitorDetailsLogForView,
  getAlloverallfiltervisitorsnameLog,
  getAllVisitorDetailsLogGrouping,
  getAlloverallfiltervisitors,
  getSingleVisitorDetailsLogGrouping,
  updateVisitorDetailsLog,
  getSingleVisitorDetailsLog,
  getAllVisitorDetailsLog,
} = require('../controller/modules/interactors/visitordetailslog');
interactorRoute.route('/getvisitornames').get(getvisitorNames);
interactorRoute.route('/visitordetailslog').get(getAllVisitorDetailsLog);
interactorRoute.route('/visitordetailslogforprofilesingle/:id').get(getSingleVisitorDetailsLogforProfile);
interactorRoute.route('/visitordetailslogforprofile/:id').get(getAllVisitorDetailsLogForProfile);
interactorRoute.route('/allvisitodetailsloggrouping').get(getAllVisitorDetailsLogGrouping);
interactorRoute.route('/getoverallfiltervisitors').get(getAlloverallfiltervisitors);
interactorRoute.route('/getoverallfiltervisitorsforview/:id').get(getSingleVisitorDetailsLogForView);
interactorRoute.route('/visitordetailslog/new').post(addVisitorDetailsLog);
interactorRoute.route('/alloverallfiltervisitorsname').post(getAlloverallfiltervisitorsname);
interactorRoute.route('/alloverallfiltervisitorsnamelogdatas').post(getAlloverallfiltervisitorsnameLog);
interactorRoute.route('/visitordetailslogsingleidgrouping').post(getSingleVisitorDetailsLogGrouping);
interactorRoute.route('/visitordetailslog/:id').delete(deleteVisitorDetailsLog).get(getSingleVisitorDetailsLog).put(updateVisitorDetailsLog);
interactorRoute.route('/visitordetailslogwithoutfiles/:id').get(getSingleVisitorDetailsLogWithoutfiles);





//visitors information master backend route in interactor file
const {
  addVisitorInformations,
  deleteVisitorInformations,
  getAllVisitorInformations,
  getSingleVisitorInformations,
  updateVisitorInformations,
  skippedVisitorInformations,
  skippedAllVisitorInformations,
  getAllVisitorInformationsForCandidate,
  getExistingVisitorInformation,
  getLastIndexVisitorInformations,
  getAllVisitorInformationUpdateId,
  updatePatchVisitorInformations,
  skippedAllVisitorInformationsDetailslog,
  skippedAllVisitorInformationsDetailslogExports,
  skippedVisitorInformationsExports,
  skippedVisitorInformationsExportsAll,
  getAllVisitorInformationsCheckout,
  AddVisitorInformationInList,
  duplicateCandidateFaceDetectorVisitorInformationForInterview,
  duplicateCandidateFaceDetectorVisitorInformation,
  getAllVisitorInformationsFilteredId,
  updateVisitorInformationsForStatus,
  getAllVisitorInformationsRegister,
  visitorInformationBranchforwardlist,
  skippedBranchVisitorInformations,
  skippedVisitorInformationsBranchforwarded,
  skippedVisitorInformationsApproval,
  getAllVisitorinformationmaster,
  getAllVisitorInformationDetailsForProfile,
} = require('../controller/modules/interactors/visitorinformationmaster');
interactorRoute.route('/allvisitorinformations').post(getAllVisitorInformations);
interactorRoute.route('/checkexistingvisitorinformation').post(getExistingVisitorInformation);
interactorRoute.route('/allvisitorinformationsregister').get(getAllVisitorInformationsRegister);
interactorRoute.route('/lastindexvisitorinformations').get(getLastIndexVisitorInformations);
interactorRoute.route('/skippedvisitorinformations').post(skippedVisitorInformations);
interactorRoute.route('/skippedvisitorinformationapprovals').post(skippedVisitorInformationsApproval);
interactorRoute.route('/branchskippedvisitorinformations').post(skippedBranchVisitorInformations);
interactorRoute.route('/skippedvisitorinformationsbranchforwarded').post(skippedVisitorInformationsBranchforwarded);
interactorRoute.route('/visitorinformationbranchforwardlists').post(visitorInformationBranchforwardlist);
interactorRoute.route('/skippedvisitorinformationsexports').post(skippedVisitorInformationsExports);
interactorRoute.route('/skippedallvisitorinformationsall').post(skippedVisitorInformationsExportsAll);
interactorRoute.route('/addvisitorinformationin').post(AddVisitorInformationInList);
interactorRoute.route('/visitorinformationsfilteredid').get(getAllVisitorInformationsFilteredId);
interactorRoute.route('/allvisitorinformationscheckout').post(getAllVisitorInformationsCheckout);
interactorRoute.route('/visitorinformationsupdateid').post(getAllVisitorInformationUpdateId);
interactorRoute.route('/skippedallvisitorinformations').post(skippedAllVisitorInformations);
interactorRoute.route('/skippedallvisitorinformationsdetailslog').post(skippedAllVisitorInformationsDetailslog);
interactorRoute.route('/skippedallvisitorinformationsdetailslogexports').post(skippedAllVisitorInformationsDetailslogExports);
interactorRoute.route('/updateinteractoraddresumevisitorinformation/:id').put(updatePatchVisitorInformations);
interactorRoute.route('/visitorinformationdetailsforprofile/:id').get(getAllVisitorInformationDetailsForProfile);
interactorRoute.route('/visitorinformations/new').post(
  visitorinformationMulter.fields([
    { name: 'visitordocument', maxCount: 10 }, // First upload button (e.g., bills)
  ]),
  addVisitorInformations
);
interactorRoute.route('/duplicatecandidatefacecheckvisitorinformation').post(duplicateCandidateFaceDetectorVisitorInformation);
interactorRoute.route('/visitorinformationmasters').post(getAllVisitorinformationmaster);
interactorRoute.route('/duplicatecandidatefacecheckvisitorinformationforinterview').post(duplicateCandidateFaceDetectorVisitorInformationForInterview);
interactorRoute.route('/allvisitorinformationsforcandidate').get(getAllVisitorInformationsForCandidate);
interactorRoute.route('/visitorinformationstatusupdate/:id').put(updateVisitorInformationsForStatus);
interactorRoute
  .route('/visitorinformations/:id')
  .delete(deleteVisitorInformations)
  .get(getSingleVisitorInformations)
  .put(
    visitorinformationMulter.fields([
      { name: 'visitordocument', maxCount: 10 }, // First upload button (e.g., bills)
    ]),
    updateVisitorInformations
  );


module.exports = interactorRoute;
