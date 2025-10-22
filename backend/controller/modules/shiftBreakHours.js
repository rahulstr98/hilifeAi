const ShiftBreakHours = require('../../model/modules/shiftBreakHours');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');


// get All ShiftBreakHours=> /api/allshiftbreakhours
exports.getAllShiftBreakHours = catchAsyncErrors(async (req, res, next) => {
    let allShiftBreakHours;
    try {

        allShiftBreakHours = await ShiftBreakHours.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!allShiftBreakHours) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        allShiftBreakHours,
    });
});

// Create new ShiftBreakHours=> /api/shiftbreakhours/new
exports.addShiftBreakHours = catchAsyncErrors(async (req, res, next) => {


    await ShiftBreakHours.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle ShiftBreakHours => /api/singleshiftbreakhours/:id
exports.getSingleShiftBreakHours = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let singleShiftBreakHours = await ShiftBreakHours.findById(id);

    if (!singleShiftBreakHours) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        singleShiftBreakHours,
    });
});

// update ShiftBreakHours by id => /api/singleshiftbreakhours/:id
exports.updateShiftBreakHours = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let updateShiftBreakHours = await ShiftBreakHours.findByIdAndUpdate(id, req.body);
    if (!updateShiftBreakHours) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete ShiftBreakHours by id => /api/singleshiftbreakhours/:id
exports.deleteShiftBreakHours = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let deleteShiftBreakHours = await ShiftBreakHours.findByIdAndRemove(id);

    if (!deleteShiftBreakHours) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});