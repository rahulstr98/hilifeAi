const BiometricDevicesPairing = require('../../../model/modules/biometric/BiometricDevicesPairingModel');
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const BiometricPairedDevicesGrouping = require('../../../model/modules/biometric/BiometricPairedDevicesGroupingModel');

// Get All Devices Pairing
exports.getAllBiometricDevicesPairing = catchAsyncErrors(async (req, res, next) => {
  let devicespairing;
  try {
    devicespairing = await BiometricDevicesPairing.find({});

    return res.status(200).json({
      devicespairing
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});
// Bulk Delete
exports.getOverallBulkBiometricPairingDeviceDelete = catchAsyncErrors(async (req, res, next) => {
  let devicespairing, result, count;
  let id = req.body.id;
  try {
    devicespairing = await BiometricDevicesPairing.find();
    const answer = devicespairing?.filter(data => id?.includes(data._id?.toString()));


    const biometricPairedDevices = await BiometricPairedDevicesGrouping.find({})
    const pairedDevice = answer.filter(answers => biometricPairedDevices?.some(data => (answers?.pairdevices?.includes(data?.paireddeviceone)) || (answers?.pairdevices?.includes(data?.paireddevicetwo))))?.map(data => data._id?.toString());
    const duplicateId = [...pairedDevice]
    result = id?.filter(data => !duplicateId?.includes(data))
    count = id?.filter(data => !duplicateId?.includes(data))?.length

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: count,
    result
  });
});
exports.getSingleBulkBiometricPairingDelete = catchAsyncErrors(async (req, res, next) => {
  let devicename = req.body.oldname;
  let paireddevice = [];
  console.log(devicename , "devicename")
  try {
    paireddevice = await BiometricPairedDevicesGrouping.find({
      $or: [
        { paireddeviceone: { $in: devicename } },
        { paireddevicetwo: { $in: devicename } }
      ]
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: paireddevice?.length, paireddevice
  });
});



exports.getAllBiometricDevicesAreaBased = catchAsyncErrors(async (req, res, next) => {
  let biodevices;
  const { company, branch, unit, floor, area } = req?.body
  try {
    biodevices = await BiometricDeviceManagement.find({ company, branch, unit, floor, area }).lean();

    return res.status(200).json({
      biodevices
    });

  } catch (err) {
    console.log(err, "err")
    return next(new ErrorHandler("Records not found!", 500));
  }
})
exports.getAllBiometricPairedDevicesAreaBased = catchAsyncErrors(async (req, res, next) => {
  let biodevices;
  const { company, branch, unit, floor, area } = req?.body
  try {
    biodevices = await BiometricDevicesPairing.find({ company, branch, unit, floor, area }).lean();

    return res.status(200).json({
      biodevices
    });

  } catch (err) {
    console.log(err, "err")
    return next(new ErrorHandler("Records not found!", 500));
  }
})

//Add New Devices Pairing
exports.addBiometricDevicesPairing = catchAsyncErrors(async (req, res, next) => {

  try {
    let adevicespairing = await BiometricDevicesPairing.create(req.body);
    return res.status(200).json({
      returnStatus: true,
      returnMessage: "Successfully Updated!!",
      returnValue: ""
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
})



// get Single getSingleBiometricDevicesPairing => /api/singledevicespairing/:id
exports.getSingleBiometricDevicesPairing = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sdevicespairing = await BiometricDevicesPairing.findById(id);
  if (!sdevicespairing) {
    return next(new ErrorHandler("Biometric Devices Pairing not found", 404));
  }
  return res.status(200).json({
    sdevicespairing,
  });
});

//update updateBiometricDevicesPairing by id => /api/updatedevicespairing/:id
exports.updateBiometricDevicesPairing = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let udevicespairing = await BiometricDevicesPairing.findByIdAndUpdate(id, req.body);
  if (!udevicespairing) {
    return next(new ErrorHandler("Biometric Devices Pairing not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});

//delete deleteBiometricDevicesPairing by id => /api/deletedevicespairing/:id
exports.deleteBiometricDevicesPairing = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ddevicespairing = await BiometricDevicesPairing.findByIdAndRemove(id);
  if (!ddevicespairing) {
    return next(new ErrorHandler("Biometric Devices Pairing not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});
