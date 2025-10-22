const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const NotificationSound = require("../../../model/modules/settings/notificationsound");

// Get all NotificationSound  => /api/notificationsound
exports.getAllNotificationSound = catchAsyncErrors(async (req, res, next) => {
    let notificationsound;
    try {
        notificationsound = await NotificationSound.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        count: notificationsound.length,
        notificationsound,
    });
});

// Create NotificationSound  => /api/notificationsound
exports.createNotificationSound = catchAsyncErrors(async (req, res, next) => {
    await NotificationSound.create(req.body);
    return res.status(200).json({
        message: "Successfully added",
    });
});

// get single NotificationSound =>/api/singlemycreation/:id
exports.getSingleNotificationSound = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let snotificationsound = await MyCreation.findById(id);
    if (!snotificationsound) {
        return next(new ErrorHandler("Id not found"));
    }
    return res.status(200).json({
        snotificationsound
    });
});

// update NotificationSound to all users => /api/singlemycreation/:id
exports.updateNotificationSound = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let unotificationsound = await NotificationSound.findByIdAndUpdate(id, req.body);

    if (!unotificationsound) {
        return next(new ErrorHandler("Id not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

//delete
exports.deleteNotificationSound = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dnotificationsound = await NotificationSound.findByIdAndRemove(id);
    if (!dnotificationsound) {
        return next(new ErrorHandler("Data not found", 404));
    }

    return res.status(200).json({ message: "Deleted successfully" });
});