const express = require("express");
const attandanceRoute = express.Router();
//usernew login
const { getUserIdAttendance, getAlldatacolumnFilter,getAutoClockoutUserForBulkUpdate,updateBulkClockinAndClockout,checkNewJoiner,getIndUserAttandance,undoAttendanceStatusFromChecklist,getAttWithUserId,getDoubleNightShiftviceAtt, getAllAttandanceClockout,getAllAttendanceHierarchyListanother, getAllAttendanceHierarchyList, getAlldataFilter, getAllAttandance, getAllAttandanceStstusClockout, getAllAttandanceStstusClockoutWithWorkinghours, getAllAttandanceStstusClockoutWithWorkinghoursToday, getAllAttandanceStatusAttendance, getAllAttandanceStstusCurrentDate, addnewAttandance, getTimerUserstatusTrue, getTimerUserstatusFalse, getAllAttandanceStstusDates, getAllAttandanceStstus, getSingleAttandance, updateAttandance, deleteAttandance,
    addnewInAttandance,updateInAttandance, getUserAttInv,getBulkClockinAndClockoutBulkUpdatedData, findAttendacneStatus,updateSingleAttendanceStatus } = require("../controller/modules/attendance/attendance");

attandanceRoute.route("/attandances").get(getAllAttandance);
attandanceRoute.route("/userindividualattandances").post(getIndUserAttandance);
attandanceRoute.route("/attandancesstatus").get(getAllAttandanceStstus);
attandanceRoute.route("/attandanceidfilter").post(getAttWithUserId);
attandanceRoute.route("/userattindv").post(getUserAttInv);
// attandanceRoute.route('/attandancesstatusclockouttrue').get(getAllAttandanceStstusClockout);
// attandanceRoute.route('/attandancesstatusclockoutwithworkinghours').get(getAllAttandanceStstusClockoutWithWorkinghours);
// attandanceRoute.route('/attandancesstatusclockoutwithworkinghourstoday').get(getAllAttandanceStstusClockoutWithWorkinghoursToday);
// attandanceRoute.route('/attandancesstatuscurrentdates').get(getAllAttandanceStstusCurrentDate);
attandanceRoute.route("/attandancesstatususerdates").post(getAllAttandanceStatusAttendance);
attandanceRoute.route("/attandancesstatusdates").get(getAllAttandanceStstusDates);
attandanceRoute.route("/attandance/new").post(addnewAttandance);
attandanceRoute.route("/attandanceid").post(getUserIdAttendance);
attandanceRoute.route("/findattendance").post(findAttendacneStatus);
attandanceRoute.route("/doubleattendanceforusers").post(getDoubleNightShiftviceAtt);
attandanceRoute.route("/attandancetrue").post(getTimerUserstatusTrue);
attandanceRoute.route("/attandancefalse").post(getTimerUserstatusFalse);
attandanceRoute.route("/attandance/:id").get(getSingleAttandance).put(updateAttandance).delete(deleteAttandance);
attandanceRoute.route("/attendancefilter").post(getAlldataFilter);
attandanceRoute.route("/attendancehierarchyfilter").post(getAllAttendanceHierarchyList);
attandanceRoute.route("/attendancehierarchyfilteranother").post(getAllAttendanceHierarchyListanother);
attandanceRoute.route("/attandanceclockout").get(getAllAttandanceClockout);
attandanceRoute.route("/attandanceclockintimecreate").post(addnewInAttandance);
attandanceRoute.route("/attandanceclockinouttimeedit/:id").put(updateInAttandance);
attandanceRoute.route("/checknewjoiner").post(checkNewJoiner);
attandanceRoute.route("/attendancebulkupdate").post(updateBulkClockinAndClockout);
attandanceRoute.route("/attendancebulkupdatereport").post(getBulkClockinAndClockoutBulkUpdatedData);
attandanceRoute.route("/getautoclockoutuserforbulkupdate").post(getAutoClockoutUserForBulkUpdate);

attandanceRoute
  .route("/updatesingleattendanceatatus/:id")
  .put(updateSingleAttendanceStatus);
  attandanceRoute.route("/undoattendancestatusfromchecklist").post(undoAttendanceStatusFromChecklist);

// attandanceRoute.route('/attendancecolumnfilter').post(getAlldatacolumnFilter)

const { getAllAttendanceStatus, addAttendanceStatus, getSingleAttendanceStatus, updateAttendanceStatus, deleteAttendanceStatus } = require("../controller/modules/attendance/attendancestatusmaster");
attandanceRoute.route("/attendancestatus").get(getAllAttendanceStatus);
attandanceRoute.route("/attendancestatus/new").post(addAttendanceStatus);
attandanceRoute.route("/attendancestatus/:id").delete(deleteAttendanceStatus).get(getSingleAttendanceStatus).put(updateAttendanceStatus);

const { getAllAttendanceModeStatus, addAttendanceModeStatus,getAlloveralleditattstatus,getAlloveralldeleteattstatus, getSingleAttendanceModeStatus, updateAttendanceModeStatus, deleteAttendanceModeStatus } = require("../controller/modules/attendance/attendancemodestatus");
attandanceRoute.route("/allattendancemodestatus").get(getAllAttendanceModeStatus);
attandanceRoute.route("/attendancemodestatus/new").post(addAttendanceModeStatus);
attandanceRoute.route("/attendancemodestatus/:id").delete(deleteAttendanceModeStatus).get(getSingleAttendanceModeStatus).put(updateAttendanceModeStatus);
attandanceRoute.route("/attendancemodestatusoveralldelete").post(getAlloveralldeleteattstatus);
attandanceRoute.route("/attendancemodestatusoveralledit").post(getAlloveralleditattstatus);

const { getAllFaceAppRecord, addFaceappRecord, getSingleFaceAppRecord, updateFaceAppRecord, deleteFaceAppRecord } = require("../controller/modules/attendance/facereqapprecord");
attandanceRoute.route("/attenrecord").get(getAllFaceAppRecord);
attandanceRoute.route("/attenrecord/new").post(addFaceappRecord);
attandanceRoute.route("/attenrecord/:id").delete(deleteFaceAppRecord).get(getSingleFaceAppRecord).put(updateFaceAppRecord);

module.exports = attandanceRoute;
