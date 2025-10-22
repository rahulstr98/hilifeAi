const express = require("express");
const leaveRoute = express.Router();

// connect apply leave form controller

const { getAllApplyleave, getAllApplyleaveFilterHome, getAllUserAppliedHierarchyBasedLeaves, getAllUserAppliedHierarchyBasedLeavesPage, getAllApplyleaveApprovedForUserShiftRoasterAssignbranchHome, getSingleApplyleave, getAllApplyleaveHomeList, getAllApplyleaveHome, getActiveApplyleave, getAllApprovedLeave, addApplyleave, getAllApplyleaveApprovedForUserShiftRoasterAssignbranch, updateApplyleave, getAllApplyleaveApprovedForUserShiftRoaster, getAllApplyleaveFilter, deleteApplyleave, getApplyLeaveEmpIdFilter, getApplyLeaveListFilter } = require("../controller/modules/leave/applyleave");
leaveRoute.route("/applyleaves").get(getAllApplyleave);
leaveRoute.route("/applyleave/new").post(addApplyleave);
leaveRoute.route("/applyleavesfilter").get(getAllApplyleaveFilter);
leaveRoute.route("/approvedleaves").get(getAllApprovedLeave);
leaveRoute.route("/applyleave/:id").get(getSingleApplyleave).put(updateApplyleave).delete(deleteApplyleave);
leaveRoute.route("/activeuserapplyleaves").get(getActiveApplyleave);
leaveRoute.route("/activeuserleaves_hierarchybased").post(getAllUserAppliedHierarchyBasedLeaves);
leaveRoute.route("/activeuserleaves_hierarchybased_page").post(getAllUserAppliedHierarchyBasedLeavesPage);
leaveRoute.route("/applyleavesapproved").post(getAllApplyleaveApprovedForUserShiftRoaster);
leaveRoute.route("/applyleavesapprovedassignbranch").post(getAllApplyleaveApprovedForUserShiftRoasterAssignbranch);
leaveRoute.route("/applyleaveshome").get(getAllApplyleaveHome);
leaveRoute.route("/applyleaveshomelist").get(getAllApplyleaveHomeList);
leaveRoute.route("/applyleavesfilterhomecount").post(getAllApplyleaveFilterHome);
leaveRoute.route("/applyleavesapprovedassignbranchhome").get(getAllApplyleaveApprovedForUserShiftRoasterAssignbranchHome);
leaveRoute.route("/applyleaveemployeeidfilter").post(getApplyLeaveEmpIdFilter);
leaveRoute.route("/applyleaveelistfilter").post(getApplyLeaveListFilter);

const { getAllLeavecriteria, getSingleLeavecriteria, addLeavecriteria, updateLeavecriteria, getAllLeavecriteriaForApplyLeave, deleteLeavecriteria } = require("../controller/modules/leave/leavecriteria");
leaveRoute.route("/leavecriterias").get(getAllLeavecriteria);
leaveRoute.route("/leavecriteria/new").post(addLeavecriteria);
leaveRoute.route("/leavecriteria/:id").get(getSingleLeavecriteria).put(updateLeavecriteria).delete(deleteLeavecriteria);
leaveRoute.route("/leavecriteriaforapplyleave").post(getAllLeavecriteriaForApplyLeave);

const { getAllLeavetype, getSingleLeavetype, addLeavetype, deleteLeavetype, updateLeavetype } = require("../controller/modules/leave/leavetype");
leaveRoute.route("/leavetype").get(getAllLeavetype);
leaveRoute.route("/leavetype/new").post(addLeavetype);
leaveRoute.route("/leavetype/:id").get(getSingleLeavetype).put(updateLeavetype).delete(deleteLeavetype);

const {
  addLeaveVerifcation,
  deleteLeaveVerifcation,
  updateLeaveVerifcation,
  getAllLeaveVerifcation,
  getSingleLeaveVerifcation,
  getAllLeaveVerifcationAssignBranch
} = require("../controller/modules/leave/leaveverification");
leaveRoute.route("/leaveverifications").get(getAllLeaveVerifcation);
leaveRoute.route("/leaveverification/new").post(addLeaveVerifcation);
leaveRoute.route("/leaveverificationsassignbranch").post(getAllLeaveVerifcationAssignBranch);
leaveRoute
  .route("/leaveverification/:id")
  .get(getSingleLeaveVerifcation)
  .put(updateLeaveVerifcation)
  .delete(deleteLeaveVerifcation);


module.exports = leaveRoute;
