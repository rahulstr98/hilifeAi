const TaskMaintenanceNonScheduleGrouping = require("../../../model/modules/account/taskmaintenancenongrouping");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All TaskMaintenanceNonScheduleGrouping => /api/tasknonschedulegroupings
exports.getAllTaskMaintenanceNonScheduleGrouping = catchAsyncErrors(async (req, res, next) => {
    let taskmaintenancenonschedulegrouping;
    try {
        taskmaintenancenonschedulegrouping = await TaskMaintenanceNonScheduleGrouping.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!taskmaintenancenonschedulegrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        taskmaintenancenonschedulegrouping,
    });
});

// Create new TaskMaintenanceNonScheduleGrouping=> /api/taskmaintenancenonschedulegrouping/new
exports.addTaskMaintenanceNonScheduleGrouping = catchAsyncErrors(async (req, res, next) => {
    let ataskmaintenancenonschedulegrouping = await TaskMaintenanceNonScheduleGrouping.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle TaskMaintenanceNonScheduleGrouping => /api/taskmaintenancenonschedulegrouping/:id
exports.getSingleTaskMaintenanceNonScheduleGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let staskmaintenancenonschedulegrouping = await TaskMaintenanceNonScheduleGrouping.findById(id);

    if (!staskmaintenancenonschedulegrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        staskmaintenancenonschedulegrouping,
    });
});

// update TaskMaintenanceNonScheduleGrouping by id => /api/taskmaintenancenonschedulegrouping/:id
exports.updateTaskMaintenanceNonScheduleGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let utaskmaintenancenonschedulegrouping = await TaskMaintenanceNonScheduleGrouping.findByIdAndUpdate(id, req.body);
    if (!utaskmaintenancenonschedulegrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete TaskMaintenanceNonScheduleGrouping by id => /api/taskmaintenancenonschedulegrouping/:id
exports.deleteTaskMaintenanceNonScheduleGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dtaskmaintenancenonschedulegrouping = await TaskMaintenanceNonScheduleGrouping.findByIdAndRemove(id);

    if (!dtaskmaintenancenonschedulegrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});


exports.getAllTaskMaintenanceNonScheduleGroupingAccess = catchAsyncErrors(async (req, res, next) => {
    let taskmaintenancenonschedulegrouping;
    try {

        const { assignbranch } = req.body;
        let filterQuery = {};
        // Construct the filter query based on the assignbranch array
        const branchFilter = assignbranch.map((branchObj) => ({
            branch: branchObj.branch,
            company: branchObj.company,
            unit: branchObj.unit,
        }));
        const branchFilterTo = assignbranch.map((branchObj) => ({
            branchto: branchObj.branch,
            companyto: branchObj.company,
            unitto: branchObj.unit,
        }));

        // Use $or to filter incomes that match any of the branch, company, and unit combinations
        // Use $or to filter incomes that match any of the branch, company, and unit combinations
        if (branchFilter.length > 0 || branchFilterTo.length > 0) {
            filterQuery = {
                $or: [...branchFilter, ...branchFilterTo],
            };
        }
        taskmaintenancenonschedulegrouping = await TaskMaintenanceNonScheduleGrouping.find(filterQuery);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!taskmaintenancenonschedulegrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        taskmaintenancenonschedulegrouping,
    });
});