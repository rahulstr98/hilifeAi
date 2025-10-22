const IdleTime = require("../../model/login/idletime");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");

//get All IdleTime =>/api/IdleTime
exports.getAllIdleTime = catchAsyncErrors(async (req, res, next) => {
    let idletimes;
    try {
        idletimes = await IdleTime.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!idletimes) {
        return next(new ErrorHandler("IdleTime not found!", 404));
    }
    return res.status(200).json({
        idletimes,
    });
});

//create new IdleTime => /api/IdleTime/new
exports.addIdleTime = catchAsyncErrors(async (req, res, next) => {
    // let checkmain = await Addexists.findOne({ name: req.body.name });
    // if (checkmain) {
    //     return next(new ErrorHandler('Name already exist!', 400));
    // }
    let idletime = await IdleTime.create(req.body);
    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Single IdleTime => /api/IdleTime/:id
exports.getSingleIdleTime = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sidletime = await IdleTime.findById(id);
    if (!sidletime) {
        return next(new ErrorHandler("IdleTime not found", 404));
    }
    return res.status(200).json({
        sidletime,
    });
});

//update IdleTime by id => /api/IdleTime/:id
exports.updateIdleTime = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let uidletime = await IdleTime.findByIdAndUpdate(id, req.body);
    if (!uidletime) {
        return next(new ErrorHandler("IdleTime not found", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});

//delete IdleTime by id => /api/IdleTime/:id
exports.deleteIdleTime = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let didletime = await IdleTime.findByIdAndRemove(id);
    if (!didletime) {
        return next(new ErrorHandler("IdleTime not found", 404));
    }

    return res.status(200).json({ message: "Deleted successfully" });
});

exports.getIdleTimeFilter = catchAsyncErrors(async (req, res, next) => {
    let idletimes;
    let finalidletimes;
    const { filtertype, company, branch, unit, team, department, employee, fromdate, todate } = req.body;

    try {
        idletimes = await IdleTime.find({
            date: {
                $gte: fromdate,
                $lte: todate
            },
            loginstatus: 'loggedout'
        }, {});

        finalidletimes = idletimes.filter((data) => {
            if (filtertype === 'Individual') {
                return company?.includes(data.company) && branch?.includes(data.branch) && unit?.includes(data.unit) && team?.includes(data.team) && employee.includes(data.companyname)
            }
            else if (filtertype === 'Department') {
                return company?.includes(data.company) && department.includes(data.department)
            }
            else if (filtertype === 'Branch') {
                return company?.includes(data.company) && branch?.includes(data.branch)
            }
            else if (filtertype === 'Unit') {
                return company?.includes(data.company) && branch?.includes(data.branch) && unit?.includes(data.unit)
            }
            else if (filtertype === 'Team') {
                return company?.includes(data.company) && branch?.includes(data.branch) && unit?.includes(data.unit) && team?.includes(data.team)
            }
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!finalidletimes) {
        return next(new ErrorHandler("IdleTime not found!", 404));
    }
    return res.status(200).json({
        finalidletimes,
    });
});

exports.updateIdleEndTime = catchAsyncErrors(
    async (req, res, next) => {
        try {
            const { userId, endTime } = req.body;

            // Find the idle time for the specified user and current date where the status is 'loggedin'
            const idleTime = await IdleTime.findOne({
                userid: userId,
                loginstatus: 'loggedin',
            });

            // If no idle time is found, return an error
            if (!idleTime) {
                return res.status(404).json({ message: "No idle time found for the user." });
            }

            // Update the found idle time
            await IdleTime.updateOne(
                { _id: idleTime._id },
                {
                    $set: {
                        loginstatus: "loggedout",
                        endtime: endTime
                    },
                }
            );

            return res
                .status(200)
                .json({ message: "User Shift Updated Successfully" });
        } catch (err) {
            return next(new ErrorHandler("Error updating shift!", 500));
        }
    }
);

exports.viewIdleEndTime = catchAsyncErrors(async (req, res, next) => {
    let idletimesview;

    const { userId, currentDate } = req.body;

    try {
        idletimesview = await IdleTime.find({ userid: userId, loginstatus: 'loggedout', date: currentDate },
            {
                companyname: 1, empcode: 1, company: 1, branch: 1, unit: 1, team: 1, department: 1, date: 1, starttime: 1, endtime: 1, loginstatus: 1,
            }
        );

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!idletimesview) {
        return next(new ErrorHandler("IdleTime not found!", 404));
    }
    return res.status(200).json({
        idletimesview,
    });
});

exports.getIdleTimeForLoginPage = catchAsyncErrors(async (req, res, next) => {
    let idletimes;
    const { userId, fromdate, todate } = req.body;

    try {
        idletimes = await IdleTime.find({
            userid: userId,
            date: {
                $gte: fromdate,
                $lte: todate
            },
        }, {});

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!idletimes) {
        return next(new ErrorHandler("IdleTime not found!", 404));
    }
    return res.status(200).json({
        idletimes,
    });
});