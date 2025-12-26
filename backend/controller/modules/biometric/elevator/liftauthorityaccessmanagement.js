const LiftAuthorityAccessManagement = require("../../../../model/modules/biometric/elevator/liftauthorityaccessmanagement");
const ErrorHandler = require('../../../../utils/errorhandler');
const catchAsyncErrors = require('../../../../middleware/catchAsyncError');
const moment = require('moment');

//get All LiftAuthorityAccessManagement =>/api/LiftAuthorityAccessManagement
exports.getAllLiftAuthorityAccessManagement = catchAsyncErrors(async (req, res, next) => {
  let liftauthorityaccessmanagements;

  try {
    liftauthorityaccessmanagements = await LiftAuthorityAccessManagement.find();
  } catch (err) {

    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!liftauthorityaccessmanagements) {
    return next(new ErrorHandler('LiftAuthorityAccessManagement not found!', 404));
  }
  return res.status(200).json({
    liftauthorityaccessmanagements,
  });
});

//create new LiftAuthorityAccessManagement => /api/LiftAuthorityAccessManagement/new
exports.addLiftAuthorityAccessManagement = catchAsyncErrors(async (req, res, next) => {
  let aLiftAuthorityAccessManagement = await LiftAuthorityAccessManagement.create(req.body);
  return res.status(200).json({
    message: 'Successfully added!',
  });
});

// get Single LiftAuthorityAccessManagement => /api/LiftAuthorityAccessManagement/:id
exports.getSingleLiftAuthorityAccessManagement = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sliftauthorityaccessmanagement = await LiftAuthorityAccessManagement.findById(id);
  if (!sliftauthorityaccessmanagement) {
    return next(new ErrorHandler('LiftAuthorityAccessManagement not found', 404));
  }
  return res.status(200).json({
    sliftauthorityaccessmanagement,
  });
});

//update LiftAuthorityAccessManagement by id =>LiftAuthorityAccessManagement/api/v/:id
exports.updateLiftAuthorityAccessManagement = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uliftauthorityaccessmanagement = await LiftAuthorityAccessManagement.findByIdAndUpdate(id, req.body);
  if (!uliftauthorityaccessmanagement) {
    return next(new ErrorHandler('LiftAuthorityAccessManagement not found', 404));
  }

  return res.status(200).json({ message: 'Updated successfully' });
});

//delete LiftAuthorityAccessManagement by id => /api/LiftAuthorityAccessManagement/:id
exports.deleteLiftAuthorityAccessManagement = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dliftauthorityaccessmanagement = await LiftAuthorityAccessManagement.findByIdAndDelete(id);
  // let dchitschememaster = await ChitSchemeMaster.findByIdAndRemove(id);
  if (!dliftauthorityaccessmanagement) {
    return next(new ErrorHandler('LiftAuthorityAccessManagement not found', 404));
  }

  return res.status(200).json({ message: 'Deleted successfully' });
});