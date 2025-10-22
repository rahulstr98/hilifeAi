const express = require("express");
const interactorRoute = express.Router();

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


const { addVisitorDetailsLog, deleteVisitorDetailsLog,getAlloverallfiltervisitorsname,getSingleVisitorDetailsLogForView,getAlloverallfiltervisitorsnameLog, getAllVisitorDetailsLogGrouping,getAlloverallfiltervisitors,getSingleVisitorDetailsLogGrouping, updateVisitorDetailsLog, getSingleVisitorDetailsLog, getAllVisitorDetailsLog  } = require('../controller/modules/interactors/visitordetailslog');
interactorRoute.route('/visitordetailslog').get(getAllVisitorDetailsLog);
interactorRoute.route('/allvisitodetailsloggrouping').get(getAllVisitorDetailsLogGrouping);
interactorRoute.route('/getoverallfiltervisitors').get(getAlloverallfiltervisitors);
interactorRoute.route('/getoverallfiltervisitorsforview/:id').get(getSingleVisitorDetailsLogForView);
interactorRoute.route('/visitordetailslog/new').post(addVisitorDetailsLog);
interactorRoute.route('/alloverallfiltervisitorsname').post(getAlloverallfiltervisitorsname);
interactorRoute.route('/alloverallfiltervisitorsnamelogdatas').post(getAlloverallfiltervisitorsnameLog);
interactorRoute.route('/visitordetailslogsingleidgrouping').post(getSingleVisitorDetailsLogGrouping);
interactorRoute.route('/visitordetailslog/:id').delete(deleteVisitorDetailsLog).get(getSingleVisitorDetailsLog).put(updateVisitorDetailsLog);

module.exports = interactorRoute;
