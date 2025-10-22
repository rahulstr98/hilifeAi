const Managepenaltymonth = require("../../../model/modules/penalty/penaltymonth");
const Penaltydayupload = require("../../../model/modules/penalty/penaltydayupload");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All Managepenaltymonth Name => /api/Managepenaltymonth
exports.getAllManagepenaltymonth = catchAsyncErrors(async (req, res, next) => {
    let managepenaltymonth;
    try { 
        managepenaltymonth = await Managepenaltymonth.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!managepenaltymonth) {
        return next(new ErrorHandler("Managepenaltymonth  not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        managepenaltymonth,
    });
});


// get All Managepenaltymonth Name => /api/Managepenaltymonth
exports.getFilterManagepenaltymonth = catchAsyncErrors(async (req, res, next) => {
    let managepenaltymonth, daypoints, ans;
    try {
        managepenaltymonth = await Managepenaltymonth.find({ _id: req.body.id });
        daypoints = await Penaltydayupload.find();
        let answer = daypoints.map((data) => data.uploaddata).flat();
        ans = answer.filter(data => data.date >= managepenaltymonth[0].fromdate && data.date <= managepenaltymonth[0].todate)
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        managepenaltymonth, ans
    });
});
// Create new Managepenaltymonth=> /api/Managepenaltymonth/new
exports.addManagepenaltymonth = catchAsyncErrors(async (req, res, next) => {
    let aManagepenaltymonth = await Managepenaltymonth.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle Managepenaltymonth => /api/Managepenaltymonth/:id
exports.getSingleManagepenaltymonth = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let smanagepenaltymonth = await Managepenaltymonth.findById(id);

    if (!smanagepenaltymonth) {
        return next(new ErrorHandler("Managepenaltymonth  not found!", 404));
    }
    return res.status(200).json({
        smanagepenaltymonth,
    });
});

// update Managepenaltymonth by id => /api/Managepenaltymonth/:id
exports.updateManagepenaltymonth = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    if (!umanagepenaltymonth) {
        return next(new ErrorHandler("Managepenaltymonth not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete Managepenaltymonth by id => /api/Managepenaltymonth/:id
exports.deleteManagepenaltymonth = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dmanagepenaltymonth = await Managepenaltymonth.findByIdAndRemove(id);

    if (!dmanagepenaltymonth) {
        return next(new ErrorHandler("Managepenaltymonth  not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});
