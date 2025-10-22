
const ChatConfiguration = require("../../../model/modules/settings/ChatConfiguration");
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError')

// get All ChatConfiguration => /api/  
exports.getAllChatConfiguration = catchAsyncErrors(async (req, res, next) => {
  let chatconfiguration;
  try {
    chatconfiguration = await ChatConfiguration.find();
  } catch (err) {
    console.log(err.message);
  }
  if (!chatconfiguration) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    count: chatconfiguration.length,
    chatconfiguration,
  });
});

// Create new ChatConfiguration=> /api/ChatConfiguration/new
exports.AddChatConfiguration = catchAsyncErrors(async (req, res, next) => {

  let achatconfiguration = await ChatConfiguration.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});


// update ChatConfiguration by id => /api/ChatConfiguration/:id
exports.updateSingleChatConfiguration = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uchatconfiguration = await ChatConfiguration.findByIdAndUpdate(id, req.body);
  if (!uchatconfiguration) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

