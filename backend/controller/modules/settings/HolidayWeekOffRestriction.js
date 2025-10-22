const HolidayWeekOffRestriction = require("../../../model/modules/settings/HolidayWeekoffRestriction");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncError = require("../../../middleware/catchAsyncError");
const User = require('../../../model/login/auth');

//get All holidayWeeoff Restrictions userdetails => /api/holidayweekoffrestrictions
exports.getAllholidayWeekoffDetails = catchAsyncError(async (req, res, next) => {
    let holidayweekoff;
    try {
        holidayweekoff = await HolidayWeekOffRestriction.find();
    } catch (err) {
        console.log(err?.message)
    }
    return res.status(200).json({
        holidayweekoff
    })
});


//find the details b username and date
exports.deleteUserHolidayWeekoffRestriction = catchAsyncError(async (req, res, next) => {
    let userholidayweekoff;
    try {
        if (req.body?.type === "weekoffholiday") {
            userholidayweekoff = await HolidayWeekOffRestriction.find({ companyname: req?.body?.companyname, date: req?.body?.date });
        }
        if (req.body?.type === "attendance") {
            const attendance = await HolidayWeekOffRestriction.find({ companyname: req?.body?.companyname });
            if (attendance?.length > 0) {
                const idsToDelete = attendance.map(item => item._id);
                await HolidayWeekOffRestriction.deleteMany({ _id: { $in: idsToDelete } });
            }

        }
    } catch (err) {
        console.log(err?.message)
    }
    return res.status(200).json({
        userholidayweekoff
    })
});


//find the details of users and date
exports.getUsersHolidayWeekoffRestrictions = catchAsyncError(async (req, res, next) => {
    let usersresult;
    let { company, branch, unit, team, department, designation, companyname } = req.body;
    try {
        const fields = {
            company,
            branch,
            unit,
            team,
            department,
            designation,
            companyname
        }
        const query = Object.entries(fields).reduce((acc, [key, value]) => {
            if (value && value.length > 0) {
                acc[key] = { $in: value };
            }
            return acc;
        }, {});
        const useeDatabaseDetails = await User.find(query, { companyname: 1 });
        const companynames = useeDatabaseDetails?.length > 0 ? useeDatabaseDetails?.map(data => data?.companyname) : [];
        usersresult = await HolidayWeekOffRestriction.find({ companyname: { $in: companynames }, date: req?.body?.date });
    } catch (err) {
        console.log(err?.message)
    }
    return res.status(200).json({
        usersresult
    })
});


// create new HolidayWeekoff Restrictions ==>> api/holidayweekoffrestriction/new
exports.addHolidayWeekOffRestriction = catchAsyncError(async (req, res, next) => {
    let aholidayweekoffrestriction = await HolidayWeekOffRestriction.create(req.body);
    return res.status(200).json({
        message: "Successfully Added"
    })
})

//get Single HolidayWeekoffRestriction ===>>> /api/holidayweekoffrestriction/:id

exports.getSingleHolidayWeekOffrestriction = catchAsyncError(async (req, res, next) => {
    let sholidayweekoffrestriction;
    const id = req.params.id;
    sholidayweekoffrestriction = await HolidayWeekOffRestriction.findById(id)
    if (!sholidayweekoffrestriction) {
        return next(new ErrorHandler("Data not Found"))
    }
    return res.status(200).json({
        sholidayweekoffrestriction
    })

})
//Update HolidayWeekOff Restriction ==>> /api/holidayweekoffrestriction/:id
exports.updateSingleHolidayWeekoffRestriction = catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    let uholidayweekoffrestriction = await HolidayWeekOffRestriction.findByIdAndUpdate(id, req.body);
    if (!uholidayweekoffrestriction) {
        return next(new ErrorHandler("Data not found!", 400));
    }
    return res.status(200).json({ message: "Updated Successfully" });
});

//Delete HolidayWeekoff Restriction ===>> /api/holidayweekoffrestriction
exports.deleteSingleHolidayWeekoffRestriction = catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    let dholidayweekoffrestriction = await HolidayWeekOffRestriction.findByIdAndRemove(id);
    if (!dholidayweekoffrestriction) {
        return next(new ErrorHandler("User not found"));
    }
    return res.status(200).json({ message: "Deleted Successfully" })
})
