const PowerPoint = require("../../../model/modules/greetinglayout/PowerPoint");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

//get All PowerPoint =>/api/PowerPoint
exports.getAllPowerPoint = catchAsyncErrors(async (req, res, next) => {
    try {
        let powerpoint = await PowerPoint.find();
        if (!powerpoint) {
            return next(new ErrorHandler("PowerPoint not found!", 404));
        }
        return res.status(200).json({
            powerpoint,
        });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});

//create new PowerPoint => /api/PowerPoint/new
exports.addPowerPoint = catchAsyncErrors(async (req, res, next) => {
    let powerpoint = await PowerPoint.create(req.body);
    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Single PowerPoint => /api/PowerPoint/:id
exports.getSinglePowerPoint = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let spowerpoint = await PowerPoint.findById(id);
    if (!spowerpoint) {
        return next(new ErrorHandler("PowerPoint not found", 404));
    }
    return res.status(200).json({
        spowerpoint,
    });
});
//update PowerPoint by id => /api/PowerPoint/:id
exports.updatePowerPoint = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let upowerpoint = await PowerPoint.findByIdAndUpdate(id, req.body);
    if (!upowerpoint) {
        return next(new ErrorHandler("PowerPoint not found", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

//delete PowerPoint by id => /api/PowerPoint/:id
exports.deletePowerPoint = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dpowerpoint = await PowerPoint.findByIdAndRemove(id);
    if (!dpowerpoint) {
        return next(new ErrorHandler("PowerPoint not found", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});
