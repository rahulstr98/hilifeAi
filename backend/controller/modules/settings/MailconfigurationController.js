
const Mailconfiguration = require("../../../model/modules/settings/MailConfigurationModel");
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError')

// get All Mailconfiguration => /api/  
exports.getAllMailconfiguration = catchAsyncErrors(async (req, res, next) => {
  let mailconfiguration;
  try {
    mailconfiguration = await Mailconfiguration.find();
  } catch (err) {
    console.log(err.message);
  }
  if (!mailconfiguration) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    count: mailconfiguration.length,
    mailconfiguration,
  });
});

// Create new Mailconfiguration=> /api/Mailconfiguration/new
exports.AddMailconfiguration = catchAsyncErrors(async (req, res, next) => {

  let amailconfiguration = await Mailconfiguration.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});


// update Mailconfiguration by id => /api/Mailconfiguration/:id
exports.updateSingleMailconfiguration = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let umailconfiguration = await Mailconfiguration.findByIdAndUpdate(id, req.body);
  if (!umailconfiguration) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

