const Faceapprecord = require("../../../model/modules/attendance/facereqapprecord");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

exports.getAllFaceAppRecord = catchAsyncErrors(async (req, res, next) => {
  let allfacerecord;
  try {
    allfacerecord = await Faceapprecord.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!allfacerecord) {
    return next(new ErrorHandler("Record not found!", 404));
  }
  return res.status(200).json({
    allfacerecord,
  });
});

//create new AttendanceStatus => /api/AttendanceStatus/new
exports.addFaceappRecord = catchAsyncErrors(async (req, res, next) => {
 
  let allfacerecord = await Faceapprecord.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single AttendanceStatus => /api/AttendanceStatus/:id
exports.getSingleFaceAppRecord = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sfacerecord = await Faceapprecord.findById(id);
  if (!sfacerecord) {
    return next(new ErrorHandler("Record not found", 404));
  }
  return res.status(200).json({
    sfacerecord,
  });
});

//update AttendanceStatus by id => /api/AttendanceStatus/:id
exports.updateFaceAppRecord = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sfacerecord = await Faceapprecord.findByIdAndUpdate(id, req.body);
  if (!sfacerecord) {
    return next(new ErrorHandler("Record not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});

//delete AttendanceStatus by id => /api/AttendanceStatus/:id
exports.deleteFaceAppRecord = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sfacerecord = await Faceapprecord.findByIdAndRemove(id);
  if (!sfacerecord) {
    return next(new ErrorHandler("Record not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

