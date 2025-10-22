const PenaltywaiverMonthSet = require("../../../model/modules/penalty/penaltywaivermonthset");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const moment = require("moment");

// get All PenaltywaiverMonthSet => /api/PenaltywaiverMonthSet
exports.getAllPenaltywaiverMonthSet = catchAsyncErrors(async (req, res, next) => {
  let penaltywaivermasters;
  try {
    penaltywaivermasters = await PenaltywaiverMonthSet.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!penaltywaivermasters) {
    return next(new ErrorHandler("PenaltywaiverMonthSet not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    penaltywaivermasters,
  });
});

// Create new PenaltywaiverMonthSet=> /api/PenaltywaiverMonthSet/new
exports.addPenaltywaiverMonthSet = catchAsyncErrors(async (req, res, next) => {
  let aPenaltywaivermaster = await PenaltywaiverMonthSet.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

exports.addPenaltywaiverMonthSetBulk = catchAsyncErrors(async (req, res, next) => {
  const { datas } = req.body;
  let aPenaltywaivermaster = await PenaltywaiverMonthSet.insertMany(datas);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle PenaltywaiverMonthSet => /api/PenaltywaiverMonthSet/:id
exports.getSinglePenaltywaiverMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let spenaltywaivermaster = await PenaltywaiverMonthSet.findById(id);

  if (!spenaltywaivermaster) {
    return next(new ErrorHandler("PenaltywaiverMonthSet not found!", 404));
  }
  return res.status(200).json({
    spenaltywaivermaster,
  });
});

// update PenaltywaiverMonthSet by id => /api/PenaltywaiverMonthSet/:id
exports.updatePenaltywaiverMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let upenaltywaivermaster = await PenaltywaiverMonthSet.findByIdAndUpdate(id, req.body);
  if (!upenaltywaivermaster) {
    return next(new ErrorHandler("PenaltywaiverMonthSet not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete PenaltywaiverMonthSet by id => /api/PenaltywaiverMonthSet/:id
exports.deletePenaltywaiverMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dpenaltywaivermaster = await PenaltywaiverMonthSet.findByIdAndRemove(id);

  if (!dpenaltywaivermaster) {
    return next(new ErrorHandler("PenaltywaiverMonthSet not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});




