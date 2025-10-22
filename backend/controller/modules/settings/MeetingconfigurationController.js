
const MeetingConfiguration = require("../../../model/modules/settings/MeetingConfigurationModel");
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError')

// get All MeetingConfiguration => /api/  
exports.getAllMeetingconfiguration = catchAsyncErrors(async (req, res, next) => {
  let meetingconfiguration;
  try {
    meetingconfiguration = await MeetingConfiguration.find();
  } catch (err) {
    console.log(err.message);
  }
  if (!meetingconfiguration) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    count: meetingconfiguration.length,
    meetingconfiguration,
  });
});

// Create new MeetingConfiguration=> /api/MeetingConfiguration/new
exports.AddMeetingconfiguration = catchAsyncErrors(async (req, res, next) => {

  let ameetingconfiguration = await MeetingConfiguration.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});


// update MeetingConfiguration by id => /api/MeetingConfiguration/:id
exports.updateSingleMeetingconfiguration = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let umeetingconfiguration = await MeetingConfiguration.findByIdAndUpdate(id, req.body);
  if (!umeetingconfiguration) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

