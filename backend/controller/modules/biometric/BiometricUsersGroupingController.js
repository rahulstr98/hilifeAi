const BiometricUsersGrouping = require('../../../model/modules/biometric/BiometricUsersGroupingModel');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const BiometricPairedDevicesGrouping = require('../../../model/modules/biometric/BiometricPairedDevicesGroupingModel');

// Get All User Grouping
exports.getAllUsersGrouping = catchAsyncErrors(async (req, res, next) => {
  let usersgrouping;
  try {
    usersgrouping = await BiometricUsersGrouping.find({});

    return res.status(200).json({
      usersgrouping
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
})

// Comparing devices names with the pair Devies Grouping
exports.getBiometricPairDevicesDuplicateSwitches = catchAsyncErrors(async (req, res, next) => {
  let pairdevices;
  let devicename = req.body.devicename
  try {
    pairdevices = await BiometricPairedDevicesGrouping.find({
      $or: [
        {
          paireddeviceone: { $eq: devicename },
          paireddevicetwo: { $eq: devicename },
        }
      ]
    });

    return res.status(200).json({
      pairdevices
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});


//Add New User Grouping
exports.addNewUserGrouping = catchAsyncErrors(async (req, res, next) => {

  try {
    let ausersgrouping = await BiometricUsersGrouping.create(req.body);
    return res.status(200).json({
      returnStatus: true,
      returnMessage: "Successfully Updated!!",
      returnValue: ""
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
})



// get Single getSingleUserGrouping => /api/singleusergrouping/:id
exports.getSingleUserGrouping = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let susersgrouping = await BiometricUsersGrouping.findById(id);
  if (!susersgrouping) {
    return next(new ErrorHandler("Biometric Users Grouping not found", 404));
  }
  return res.status(200).json({
    susersgrouping,
  });
});

//update updateUserGrouping by id => /api/updateusergrouping/:id
exports.updateUserGrouping = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uusersgrouping = await BiometricUsersGrouping.findByIdAndUpdate(id, req.body);
  if (!uusersgrouping) {
    return next(new ErrorHandler("Biometric Users Grouping not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});

//delete deleteUserGrouping by id => /api/deleteusergrouping/:id
exports.deleteUserGrouping = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dusersgrouping = await BiometricUsersGrouping.findByIdAndRemove(id);
  if (!dusersgrouping) {
    return next(new ErrorHandler("Biometric Users Grouping not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});
