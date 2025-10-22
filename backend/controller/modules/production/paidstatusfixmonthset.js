const PaidstatusfixMonthSet = require("../../../model/modules/production/paidstatusfixmonthset");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const PayrunList = require("../../../model/modules/production/payrunlist");
const axios = require("axios");
// get All PaidstatusfixMonthSet => /api/processteams
exports.getAllPaidstatusfixMonthSet = catchAsyncErrors(async (req, res, next) => {
  let paidstatusfixs;
  try {
    paidstatusfixs = await PaidstatusfixMonthSet.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!paidstatusfixs) {
    return next(new ErrorHandler("PaidstatusfixMonthSet not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    paidstatusfixs,
  });
});


// Create new PaidstatusfixMonthSet => /api/PaidstatusfixMonthSet/new
exports.addPaidstatusfixMonthSet = catchAsyncErrors(async (req, res, next) => {
  let aPaidstatusfix = await PaidstatusfixMonthSet.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle PaidstatusfixMonthSet => /api/PaidstatusfixMonthSet/:id
exports.getSinglePaidstatusfixMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let spaidstatusfix = await PaidstatusfixMonthSet.findById(id);

  if (!spaidstatusfix) {
    return next(new ErrorHandler("PaidstatusfixMonthSet not found!", 404));
  }
  return res.status(200).json({
    spaidstatusfix,
  });
});

// update PaidstatusfixMonthSet by id => /api/PaidstatusfixMonthSet/:id
exports.updatePaidstatusfixMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let upaidstatusfix = await PaidstatusfixMonthSet.findByIdAndUpdate(id, req.body);
  if (!upaidstatusfix) {
    return next(new ErrorHandler("PaidstatusfixMonthSet not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete PaidstatusfixMonthSet by id => /api/PaidstatusfixMonthSet/:id
exports.deletePaidstatusfixMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dpaidstatusfix = await PaidstatusfixMonthSet.findByIdAndRemove(id);

  if (!dpaidstatusfix) {
    return next(new ErrorHandler("PaidstatusfixMonthSet not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});