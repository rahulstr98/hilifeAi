const TaskDesignationGrouping = require('../../../model/modules/task/taskdesignationgrouping');
const ErrorHandler = require('../../../utils/errorhandler');
// const Task = require('../../../model/modules/project/task');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const User = require("../../../model/login/auth");

//get All TaskDesignationGrouping =>/api/TaskDesignationGrouping
exports.getAllTaskDesignationGrouping = catchAsyncErrors(async (req, res, next) => {
    let taskdesignationgrouping;
    try {
        taskdesignationgrouping = await TaskDesignationGrouping.find().lean()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!taskdesignationgrouping) {
        return next(new ErrorHandler('Task Designation Grouping not found!', 404));
    }
    return res.status(200).json({
        taskdesignationgrouping
    });
});


exports.getAllTaskDesignationGroupingAssignBranch = catchAsyncErrors(async (req, res, next) => {
    let taskdesignationgrouping;
    let { accessbranch } = req.body
    try {

        const query = {
            $or: [{
                company: [],
            }, ...accessbranch?.map(item => ({
                company: item.company,
            }))]
        };
        taskdesignationgrouping = await TaskDesignationGrouping.find(query, {
            category: 1, subcategory: 1, schedulestatus: 1,
            taskassign: 1, type: 1, priority: 1, frequency: 1,process:1, designation: 1, department: 1, company: 1, branch: 1
            , unit: 1, team: 1, employeenames: 1, description: 1
        }).lean()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        taskdesignationgrouping
    });
})








exports.getAllEmployeeNames = catchAsyncErrors(async (req, res, next) => {
    let users;
    try {
        let query = {};
        Object.keys(req.body).forEach((key) => {
            if (key !== "headers" && !['type'].includes(key)) {
                const value = req.body[key];
                if (value !== "" && value?.length > 0) {
                    query[key] = value;
                }
            }
        });
        const generateMongoQuery = (query) => {
            const mongoQuery = {};
            // Add department to the query if it exists
            if (query.department && query.department?.length > 0) {
                mongoQuery.department = { "$in": query.department }
            };
            if (query.designation && query.designation?.length > 0) {
                mongoQuery.designation = { "$in": query.designation }
            };
            if (query.company && query.company?.length > 0) {
                mongoQuery.company = { "$in": query.company }
            };
            if (query.branch && query.branch?.length > 0) {
                mongoQuery.branch = { "$in": query.branch }
            };
            if (query.unit && query.unit?.length > 0) {
                mongoQuery.unit = { "$in": query.unit }
            };
            if (query.team && query.team?.length > 0) {
                mongoQuery.team = { "$in": query.team }
            };

            return mongoQuery;
        };
        const mongoQueryTeam = generateMongoQuery(query);
        users = await User.find(mongoQueryTeam, {
            _id: 1, department: 1,
            designation: 1, company: 1, branch: 1, unit: 1, team: 1, companyname: 1
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        count: users?.length,
        users,
    });
});
exports.getAllTaskDesignationGroupingActive = catchAsyncErrors(async (req, res, next) => {
    let taskdesignationgrouping;
    try {
        taskdesignationgrouping = await TaskDesignationGrouping.find({ schedulestatus: "Active" }, {}).lean()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!taskdesignationgrouping) {
        return next(new ErrorHandler('Task Designation Grouping not found!', 404));
    }
    return res.status(200).json({
        taskdesignationgrouping
    });
})


//create new TaskDesignationGrouping => /api/TaskDesignationGrouping/new
exports.addTaskDesignationGrouping = catchAsyncErrors(async (req, res, next) => {
    // let checkmain = await Addexists.findOne({ name: req.body.name });
    // if (checkmain) {
    //     return next(new ErrorHandler('Name already exist!', 400));
    // }
    let aTaskDesignationGrouping = await TaskDesignationGrouping.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single TaskDesignationGrouping => /api/TaskDesignationGrouping/:id
exports.getSingleTaskDesignationGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let staskdesignationgrouping = await TaskDesignationGrouping.findById(id);
    if (!staskdesignationgrouping) {
        return next(new ErrorHandler('Task Designation Grouping not found', 404));
    }
    return res.status(200).json({
        staskdesignationgrouping
    })
})

//update TaskDesignationGrouping by id => /api/TaskDesignationGrouping/:id
exports.updateTaskDesignationGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let utaskdesignationgrouping = await TaskDesignationGrouping.findByIdAndUpdate(id, req.body);
    if (!utaskdesignationgrouping) {
        return next(new ErrorHandler('Task Designation Grouping not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete TaskDesignationGrouping by id => /api/TaskDesignationGrouping/:id
exports.deleteTaskDesignationGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dtaskdesignationgrouping = await TaskDesignationGrouping.findByIdAndRemove(id);
    if (!dtaskdesignationgrouping) {
        return next(new ErrorHandler('Task Designation Grouping not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})
