const UnitrateManualApproval = require("../../../model/modules/production/unitratemanualapproval");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const Unitrate = require("../../../model/modules/production/productionunitrate");

// get All UnitrateManualApproval => /api/UnitrateManualApproval
exports.getAllUnitrateManualApproval = catchAsyncErrors(async (req, res, next) => {
  let unitratemanualapproval;
  try {
    unitratemanualapproval = await UnitrateManualApproval.find();
  } catch (err) {
    console.log(err.message);
  }
  if (!unitratemanualapproval) {
    return next(new ErrorHandler("Managecategory not found!", 404));
  }
  return res.status(200).json({
    unitratemanualapproval,
  });
});

// Create new UnitrateManualApproval=> /api/UnitrateManualApproval/new
exports.addUnitrateManualApproval = catchAsyncErrors(async (req, res, next) => {
  let aunitratemanualapproval = await UnitrateManualApproval.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle UnitrateManualApproval => /api/UnitrateManualApproval/:id
exports.getSingleUnitrateManualApproval = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sunitratemanualapproval = await UnitrateManualApproval.findById(id);

  if (!sunitratemanualapproval) {
    return next(new ErrorHandler("UnitrateManualApproval not found!", 404));
  }
  return res.status(200).json({
    sunitratemanualapproval,
  });
});

// update UnitrateManualApproval by id => /api/UnitrateManualApproval/:id
exports.updateUnitrateManualApproval = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let uunitratemanualapproval = await UnitrateManualApproval.findByIdAndUpdate(id, req.body);

  if (!uunitratemanualapproval) {
    return next(new ErrorHandler("UnitrateManualApproval not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete UnitrateManualApproval by id => /api/UnitrateManualApproval/:id
exports.deleteUnitrateManualApproval = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dunitratemanualapproval = await UnitrateManualApproval.findByIdAndRemove(id);

  if (!dunitratemanualapproval) {
    return next(new ErrorHandler("UnitrateManualApproval Name not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

// get All UnitrateManualApproval => /api/UnitrateManualApproval
exports.unitRateManualMrateUpdate = catchAsyncErrors(async (req, res, next) => {
  let updatedUnitrates, unitratemanualapproval;
  try {
    const { project, category, subcategory, mrate, points } = req.body;
    console.log(req.body);
    unitratemanualapproval = await UnitrateManualApproval.updateOne({ project: project, category: category, subcategory: subcategory }, { $set: { isedited: true } });
    updatedUnitrates = await Unitrate.updateMany({ project: project, category: category, subcategory: subcategory }, { $set: { mrate: mrate, points: points } });
    console.log(unitratemanualapproval, updatedUnitrates);
  } catch (err) {
    console.log(err.message);
  }

  return res.status(200).json({
    unitratemanualapproval,
  });
});

// get All UnitrateManualApproval => /api/UnitrateManualApproval
exports.getAllUnitrateManualNotApproval = catchAsyncErrors(async (req, res, next) => {
  let unitratemanualapproval;
  try {
    unitratemanualapproval = await UnitrateManualApproval.find({ $or: [{ isedited: false }, { isedited: { $exists: false } }] });
  } catch (err) {
    console.log(err.message);
  }
  if (!unitratemanualapproval) {
    return next(new ErrorHandler("Managecategory not found!", 404));
  }
  return res.status(200).json({
    unitratemanualapproval,
  });
});