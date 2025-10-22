const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");


const AssignBranch = require("../../model/modules/assignbranch");

const Holiday = require("../../model/modules/setup/holidayModel");
const ScheduleMeeting = require("../../model/modules/setup/schedulemeeting");
const Events = require("../../model/modules/setup/eventsModel");
const Addcandidate = require("../../model/modules/recruitment/addcandidate");
const IndividualSettings = require("../../model/modules/settings/IndividualSettingsModel");
const AttendanceControlCriteria = require("../../model/modules/settings/Attendancecontrolcriteria");
const AutoLogout = require("../../model/modules/settings/autologout");
const Templatelist = require("../../model/modules/settings/Templatelist");
const FileShare = require("../../model/modules/setup/announcement/FileShareModel");
const Visitor = require("../../model/modules/interactors/visitor");
const Checklistverificationmaster = require("../../model/modules/interview/checklistverificationmaster");
const MyCheckList = require("../../model/modules/interview/Myinterviewchecklist");
const Assignedinterviewer = require("../../model/modules/interview/assigninterviewer");
const Leavecriteria = require("../../model/modules/leave/leavecriteria");
const LeaveVerification = require("../../model/modules/leave/leaveverification");
const AssignDocument = require("../../model/modules/documents/assigndocuments");
const Maintenance = require("../../model/modules/account/maintenance");
const TaskMaintenanceNonScheduleGrouping = require("../../model/modules/account/taskmaintenancenongrouping");
const Addpassword = require("../../model/modules/password/addPasswordModel");
const TaskNonScheduleGrouping = require("../../model/modules/task/nonschedulegrouping");
const TaskMaintenanceForUser = require("../../model/modules/account/taskmaintenanceforuser");
const TaskForUser = require("../../model/modules/task/taskforuser");
const Teamgrouping = require("../../model/modules/tickets/teamgrouping");
const Raiseticketmaster = require("../../model/modules/tickets/raiseticketmaster");
const Templatecontrolpanel = require("../../model/modules/documents/Templatecontrolpnael");

const Nonproduction = require("../../model/modules/production/nonproduction/nonproduction");
const NonProductionunitAllot = require("../../model/modules/production/nonproduction/NonProductionunitallotModel");
const TrainingNonSchedule = require("../../model/modules/task/tasknonscheduletraining");
const TrainingUserResponse = require("../../model/modules/task/trainingUserResponse");
const Weekoffpresent = require("../../model/modules/weekoffcontrolpanel");
const TrainingForUser = require("../../model/modules/task/trainingforuser");
const TaskDesignationGrouping = require("../../model/modules/task/taskdesignationgrouping");
const TrainingDetails = require("../../model/modules/task/trainingdetails");

const batchSize = 5; // Define a batch size



const IpMaster = require("../../model/modules/account/ipmodel");
const Userchecks = require("../../model/modules/settings/Maintenancelog")
const PosterGenerate = require('../../model/modules/greetinglayout/postergenerate');

const removeEmployeeOperations = (employeeName) => [


    Maintenance.updateMany(
        {},
        { $pull: { employeenameto: employeeName } }
    ).then(() => Maintenance.deleteMany({ employeenameto: { $size: 0 } })).then(() => console.log("Maintenance update successful"))
        .catch(err => console.error("Maintenance model error:", err)),

    IpMaster.deleteMany({ 'ipconfig.employeename': employeeName }).then(() => console.log("IpMaster update successful"))
        .catch(err => console.error("IpMaster model error:", err)),

    Userchecks.deleteMany({ companyname: employeeName }).then(() => console.log("Userchecks update successful"))
        .catch(err => console.error("Userchecks model error:", err)),

    PosterGenerate.updateMany(
        {},
        { $pull: { employeename: employeeName } }
    ).then(() => PosterGenerate.deleteMany({ employeename: { $size: 0 } })).then(() => console.log("PosterGenerate update successful"))
        .catch(err => console.error("PosterGenerate model error:", err)),

    // Direct deletion from the main field
    AssignBranch.deleteMany({ employee: employeeName }).then(() => console.log("AssignBranch update successful"))
        .catch(err => console.error("AssignBranch model error:", err)),

    Holiday.updateMany(
        {},
        { $pull: { employee: employeeName } }
    ).then(() => Holiday.deleteMany({ employee: { $size: 0 } })).then(() => console.log("Holiday update successful"))
        .catch(err => console.error("Holiday model error:", err)),

    ScheduleMeeting.updateMany(
        {},
        { $pull: { participants: employeeName, interviewer: employeeName } }
    ).then(() => ScheduleMeeting.deleteMany({ participants: { $size: 0 }, interviewer: { $size: 0 } })).then(() => console.log("ScheduleMeeting update successful"))
        .catch(err => console.error("ScheduleMeeting model error:", err)),

    Events.updateMany(
        {},
        { $pull: { participants: employeeName } }
    ).then(() => Events.deleteMany({ participants: { $size: 0 } })).then(() => console.log("Events update successful"))
        .catch(err => console.error("Events model error:", err)),

    Addcandidate.updateMany(
        { interviewrounds: { $exists: true, $not: { $size: 0 } } },
        { $pull: { "interviewrounds.$[].interviewer": employeeName } }
    ).then(() => console.log("Addcandidate update successful"))
        .catch(err => console.error("Addcandidate model error:", err)),

    IndividualSettings.deleteMany({ companyname: employeeName }).then(() => console.log("IndividualSettings update successful"))
        .catch(err => console.error("IndividualSettings model error:", err)),

    AttendanceControlCriteria.updateMany(
        {},
        { $pull: { todos: { employeename: employeeName } } }
    ).then(() => console.log("AttendanceControlCriteria update successful"))
        .catch(err => console.error("AttendanceControlCriteria model error:", err)),

    AutoLogout.updateMany(
        {},
        { $pull: { todos: { employeename: employeeName } } }
    ).then(() => console.log("AutoLogout update successful"))
        .catch(err => console.error("AutoLogout model error:", err)),

    Templatelist.deleteMany({ employeename: employeeName }).then(() => console.log("Templatelist update successful"))
        .catch(err => console.error("Templatelist model error:", err)),

    FileShare.deleteMany({ employeename: employeeName }).then(() => console.log("FileShare update successful"))
        .catch(err => console.error("FileShare model error:", err)),

    Visitor.updateMany(
        {
            $or: [
                { "followuparray.meetingpersonemployeename": employeeName },
                { meetingpersonemployeename: employeeName }
            ]
        },
        {
            $set: {
                "followuparray.$[elem].meetingpersonemployeename": "",
                "meetingpersonemployeename": ""
            }
        },
        {
            arrayFilters: [{ "elem.meetingpersonemployeename": employeeName }]
        }
    )
        .then(() => console.log("Visitor update successful"))
        .catch(err => console.error("Error updating Visitor:", err)),

    Checklistverificationmaster.updateMany(
        { employee: employeeName },  // Find documents that have the 'employeeName'
        { $pull: { employee: employeeName } }  // Remove 'employeeName' from 'employee' array
    )
        .then(() => {
            return Checklistverificationmaster.deleteMany(
                { employee: { $size: 0 } }  // Find documents where 'employee' array is now empty
            );
        }).then(() => console.log("Checklistverificationmaster update successful"))
        .catch(err => console.error("Checklistverificationmaster model error:", err)),

    MyCheckList.updateMany(
        {},
        { $pull: { "groups.$[].employee": employeeName } }
    ).then(() => {
        // Remove any groups that have no employees
        return MyCheckList.updateMany(
            { "groups.employee": { $size: 0 } },
            { $pull: { groups: { employee: { $size: 0 } } } }
        );
    }).then(() => {
        // Delete the document if all groups are empty
        return MyCheckList.deleteMany({ "groups": { $size: 0 } });
    }).then(() => console.log("MyCheckList update successful"))
        .catch(err => console.error("MyCheckList model error:", err)),

    Assignedinterviewer.updateMany({}, { $pull: { employee: employeeName } }).then(() => Assignedinterviewer.deleteMany({ employee: { $size: 0 } }))
        .then(() => console.log("Assignedinterviewer update successful"))
        .catch(err => console.error("Assignedinterviewer model error:", err)),

    Leavecriteria.updateMany({}, { $pull: { employee: employeeName } }).then(() => console.log("Leavecriteria update successful"))
        .catch(err => console.error("Leavecriteria model error:", err)),

    LeaveVerification.updateMany(
        {},
        {
            $pull: { employeenamefrom: employeeName, employeenameto: employeeName }
        }
    ).then(() => LeaveVerification.deleteMany({ employeenamefrom: { $size: 0 }, employeenameto: { $size: 0 } })).then(() => console.log("LeaveVerification update successful"))
        .catch(err => console.error("LeaveVerification model error:", err)),

    AssignDocument.updateMany({}, { $pull: { employeename: employeeName } }).then(() => AssignDocument.deleteMany({ employeename: { $size: 0 } })).then(() => console.log("AssignDocument update successful"))
        .catch(err => console.error("AssignDocument model error:", err)),

    Maintenance.updateMany({}, { $pull: { employeenameto: employeeName } }).then(() => Maintenance.deleteMany({ employeenameto: { $size: 0 } })).then(() => console.log("Maintenance update successful"))
        .catch(err => console.error("Maintenance model error:", err)),

    TaskMaintenanceNonScheduleGrouping.updateMany(
        {},
        { $pull: { employeenames: employeeName } }
    ).then(() => TaskMaintenanceNonScheduleGrouping.deleteMany({ employeenames: { $size: 0 } })).then(() => console.log("TaskMaintenanceNonScheduleGrouping update successful"))
        .catch(err => console.error("TaskMaintenanceNonScheduleGrouping model error:", err)),

    Addpassword.deleteMany({ employeename: employeeName }).then(() => console.log("Addpassword update successful"))
        .catch(err => console.error("Addpassword model error:", err)),

    TaskNonScheduleGrouping.updateMany(
        {},
        { $pull: { employeenames: employeeName } }
    ).then(() => TaskNonScheduleGrouping.deleteMany({ employeenames: { $size: 0 } })).then(() => console.log("TaskNonScheduleGrouping update successful"))
        .catch(err => console.error("TaskNonScheduleGrouping model error:", err)),

    TaskMaintenanceForUser.deleteMany({ username: employeeName }).then(() => console.log("TaskMaintenanceForUser update successful"))
        .catch(err => console.error("TaskMaintenanceForUser model error:", err)),

    TaskForUser.deleteMany(
        { username: employeeName },
    ).then(() => console.log("TaskForUser update successful"))
        .catch(err => console.error("TaskForUser model error:", err)),

    Teamgrouping.updateMany(
        {},
        {
            $pull: { employeenamefrom: employeeName, employeenameto: employeeName }
        }
    ).then(() => Teamgrouping.deleteMany({ employeenamefrom: { $size: 0 }, employeenameto: { $size: 0 } })).then(() => console.log("Teamgrouping update successful"))
        .catch(err => console.error("Teamgrouping model error:", err)),

    Raiseticketmaster.updateMany(
        {},
        {
            $pull: {
                forwardedemployee: employeeName,
                employeename: employeeName,
                employeenameRaise: employeeName
            }
        }
    ).then(() => Raiseticketmaster.deleteMany({ employeename: { $size: 0 } })).then(() => console.log("Raiseticketmaster update successful"))
        .catch(err => console.error("Raiseticketmaster model error:", err)),

    Templatecontrolpanel.updateMany(
        {
            "templatecontrolpanellog.documentsignature.employee": employeeName
        },
        {
            $pull: {
                "templatecontrolpanellog.$[].documentsignature": { employee: employeeName }
            }
        }
    )
        .then(() =>
            Templatecontrolpanel.deleteMany({
                "templatecontrolpanellog": { $exists: true, $size: 0 }
            })
        )
        .then(() => console.log("Templatecontrolpanel update successful"))
        .catch(err => console.error("Templatecontrolpanel model error:", err)),

    Nonproduction.deleteMany({ name: employeeName }).then(() => console.log("Nonproduction update successful"))
        .catch(err => console.error("Nonproduction model error:", err)),

    NonProductionunitAllot.deleteMany({ employeename: employeeName }).then(() => console.log("NonProductionunitAllot update successful"))
        .catch(err => console.error("NonProductionunitAllot model error:", err)),

    TrainingNonSchedule.updateMany(
        {},
        { $pull: { employeenames: employeeName } }
    ).then(() => TrainingNonSchedule.deleteMany({ employeenames: { $size: 0 } })).then(() => console.log("TrainingNonSchedule update successful"))
        .catch(err => console.error("TrainingNonSchedule model error:", err)),

    TrainingUserResponse.deleteMany({ username: employeeName }).then(() => console.log("TrainingUserResponse update successful"))
        .catch(err => console.error("TrainingUserResponse model error:", err)),

    Weekoffpresent.updateMany(
        {},
        { $pull: { employee: employeeName } }
    ).deleteMany({ employee: employeeName }).then(() => console.log("Weekoffpresent update successful"))
        .catch(err => console.error("Weekoffpresent model error:", err)),

    TaskDesignationGrouping.updateMany(
        { taskdesignationlog: { $exists: true } },
        {
            $pull: {
                employeenames: employeeName,
                "taskdesignationlog.$[].employeenames": employeeName
            }
        }
    ).then(() => TaskDesignationGrouping.deleteMany({ employeenames: { $size: 0 }, "taskdesignationlog.$[].employeenames": { $size: 0 } })).then(() => console.log("TaskDesignationGrouping update successful"))
        .catch(err => console.error("TaskDesignationGrouping model error:", err)),

    TrainingDetails.updateMany(
        {},
        {
            $pull: {
                employeenames: employeeName,
                "trainingdetailslog.$[].employeenames": employeeName
            }
        }
    )
    .catch(err => console.error("TrainingDetails model error:", err)),

    TrainingForUser.deleteMany({ username: employeeName }).then(() => console.log("TrainingForUser update successful"))
        .catch(err => console.error("TrainingForUser model error:", err)),
];


const runBatchUpdates = async (operations, batchSize, from) => {
    for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        try {
            // Execute the batch operations
            await Promise.all(batch.map((op) => op.catch((err) => ({ error: err })))); // Catch individual errors in batch
            // console.log(`${from} Batch ${Math.ceil(i / batchSize) + 1} executed successfully`);
        } catch (error) {
            console.error(`${from} Error in batch ${Math.ceil(i / batchSize) + 1}:`, error);
        }
    }
};

exports.removeOverallEmployeename = catchAsyncErrors(async (req, res, next) => {
    const { companyname } = req.body;

    try {
        // Run batch updates for the operations
        const operations = removeEmployeeOperations(companyname);
        await runBatchUpdates(operations, batchSize, "Employee Name Removal");

        return res.status(200).json({
            success: true,
            message: "Employee references removed successfully",
        });
    } catch (error) {
        // General error handling for unexpected issues
        console.error("Error during employee removal:", error);

        if (error.response) {
            return next(
                new ErrorHandler(
                    error.response.data.message || "An error occurred during the operation",
                    error.response.status || 500
                )
            );
        } else if (error.request) {
            return next(new ErrorHandler("No response received from server", 500));
        } else {
            return next(new ErrorHandler("Error removing employee references!", 500));
        }
    }
});


