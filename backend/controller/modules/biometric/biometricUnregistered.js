const BiometricUnregistered = require('../../../model/modules/biometric/biometricUnregistered');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");


exports.getAllBiometricUnregistered = catchAsyncErrors(async (req, res, next) => {
    let allbiometricunregistered;
    try {
        allbiometricunregistered = await BiometricUnregistered.find();
        return res.status(200).json({
            allbiometricunregistered
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})
exports.getFilteredBiometricUnregistered = catchAsyncErrors(async (req, res, next) => {
    let allbiometricunregistered;
    console.log(req?.body)
    const { fromdate, todate, biometricdevices } = req?.body;
    try {

        const cloudIds = await BiometricDeviceManagement.find({ biometriccommonname: { $in: biometricdevices } }, { biometricserialno: 1 });

        const deviceNames = cloudIds?.map(data => data?.biometricserialno);
        const allbiometricunregistered = await BiometricUnregistered.find(
            {
                cloudIDC: { $in: deviceNames },
                dateformat: {
                    $gte: fromdate,  // fromdate = "2025-10-01"
                    $lte: todate // include full day
                }
            }
        );

        return res.status(200).json({
            allbiometricunregistered
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})

exports.addBiometricUnregistered = catchAsyncErrors(async (req, res, next) => {

    try {
        let aallbiocmdcpl = await BiometricUnregistered.create(req.body);

        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Added!!",
        });
    } catch (err) {
        console.log(err)
        return next(new ErrorHandler("Records not found!", 500));
    }
})


exports.getAllDuplicateBiometricUnregistered = catchAsyncErrors(async (req, res, next) => {
    try {
        const newLogs = req.body.logs;

        if (!Array.isArray(newLogs) || newLogs.length === 0) {
            return res.status(400).json({ message: "No logs provided." });
        }

        // Build bulkWrite operations with upsert:true (only insert if not existing)
        const bulkOps = newLogs.map(log => ({
            updateOne: {
                filter: {
                    clockDateTimeD: log.clockDateTimeD,
                    cloudIDC: log.cloudIDC
                },
                update: { $setOnInsert: log },
                upsert: true
            }
        }));

        // Execute bulkWrite (ignore duplicate errors due to unique index)
        const result = await BiometricUnregistered.bulkWrite(bulkOps, { ordered: false });

        // Calculate inserted documents count
        const insertedCount = result.upsertedCount || 0;

        return res.status(200).json({
            message: "Biometric Unregistered Logs processed successfully.",
            insertedCount,
            totalReceived: newLogs.length
        });

    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key error (should be rare with bulkWrite + unique index)
            console.log("Duplicate key detected, skipping...");
            return res.status(200).json({ message: "Duplicates skipped." });
        }

        console.error("Error inserting logs:", err);
        return next(new ErrorHandler("Failed to check for duplicates.", 500));
    }
});
