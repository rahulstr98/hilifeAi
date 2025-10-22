const BiometricPairedDevicesGrouping = require('../../../model/modules/biometric/BiometricPairedDevicesGroupingModel');
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");
const BiometricDevicesPairing = require('../../../model/modules/biometric/BiometricDevicesPairingModel');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');

// Get All Devices Pairing
exports.getAllBiometricPairedDevicesGrouping = catchAsyncErrors(async (req, res, next) => {
    let biometricpaireddevicesgrouping;
    try {
        biometricpaireddevicesgrouping = await BiometricPairedDevicesGrouping.find({});

        return res.status(200).json({
            biometricpaireddevicesgrouping
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
});



exports.getAllBiometricPairedDevicesAndUnpaired = catchAsyncErrors(async (req, res, next) => {
    let biometricdevices, biodevices;
    const { company, branch, unit, floor, area } = req?.body
    try {
        biometricdevices = await BiometricDeviceManagement.find({ company, branch, unit, floor, area }).lean();
        const biopairdevices = await BiometricDevicesPairing.find({ company, branch, unit, floor, area }).lean();
        const pairedSet = new Set(
            biopairdevices.flatMap(device => device.pairdevices || [])
        );
        const unmatchedDevices = biometricdevices
            .filter(name => !pairedSet.has(name?.biometriccommonname));

        const newBiodeviceEntries = unmatchedDevices.map(name => ({
            ...name,
            pairdevices: [name?.biometriccommonname]
        }));
        const finalData = [...biopairdevices, ...newBiodeviceEntries];

        return res.status(200).json({
            biodevices: finalData
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})

// Paired Device based on Company,branch
exports.getAllBiometricPairedDevicesAndUnpairedUser = catchAsyncErrors(async (req, res, next) => {
    let biometricdevices, biodevices;
    const { company, branch } = req?.body
    try {
        biometricdevices = await BiometricDeviceManagement.find({ company: { $in: company }, branch: { $in: branch } }).lean();
        const biopairdevices = await BiometricDevicesPairing.find({ company: { $in: company }, branch: { $in: branch } }).lean();
        const pairedSet = new Set(
            biopairdevices.flatMap(device => device.pairdevices || [])
        );
        const unmatchedDevices = biometricdevices
            .filter(name => !pairedSet.has(name?.biometriccommonname));

        const newBiodeviceEntries = unmatchedDevices.map(name => ({
            ...name,
            pairdevices: [name?.biometriccommonname]
        }));
        const finalData = [...biopairdevices, ...newBiodeviceEntries];

        return res.status(200).json({
            biodevices: finalData
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})

//Add New Devices Pairing
exports.addBiometricPairedDevicesGrouping = catchAsyncErrors(async (req, res, next) => {

    try {
        let abiometricpaireddevicesgrouping = await BiometricPairedDevicesGrouping.create(req.body);
        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Updated!!",
            returnValue: ""
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})



// get Single getSingleBiometricPairedDevicesGrouping => /api/singledevicespairing/:id
exports.getSingleBiometricPairedDevicesGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sbiometricpaireddevicesgrouping = await BiometricPairedDevicesGrouping.findById(id);
    if (!sbiometricpaireddevicesgrouping) {
        return next(new ErrorHandler("Biometric Paired Devices Grouping not found", 404));
    }
    return res.status(200).json({
        sbiometricpaireddevicesgrouping,
    });
});

//update updateBiometricPairedDevicesGrouping by id => /api/updatedevicespairing/:id
exports.updateBiometricPairedDevicesGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let ubiometricpaireddevicesgrouping = await BiometricPairedDevicesGrouping.findByIdAndUpdate(id, req.body);
    if (!ubiometricpaireddevicesgrouping) {
        return next(new ErrorHandler("Biometric Paired Devices Grouping not found", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});

//delete deleteBiometricPairedDevicesGrouping by id => /api/deletedevicespairing/:id
exports.deleteBiometricPairedDevicesGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dbiometricpaireddevicesgrouping = await BiometricPairedDevicesGrouping.findByIdAndRemove(id);
    if (!dbiometricpaireddevicesgrouping) {
        return next(new ErrorHandler("Biometric Paired Devices Grouping not found", 404));
    }

    return res.status(200).json({ message: "Deleted successfully" });
});
