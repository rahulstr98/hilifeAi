const Biometriconlinestatus = require('../../../model/modules/biometric/biometriconlinestatus');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");

exports.getAllOnlineStatus = catchAsyncErrors(async (req, res, next) => {
    let allonlinestatus;
    try {
        allonlinestatus = await Biometriconlinestatus.find();
        return res.status(200).json({
            allonlinestatus
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})

function getStatus(lastOnlineTimeC, newDate) {
    const lastOnlineDate = lastOnlineTimeC;
    const newDateObj = new Date(newDate);
    const timeDifference = newDateObj - lastOnlineDate;
    const timeDifferenceInMinutes = timeDifference / (1000 * 60);
    return timeDifferenceInMinutes <= 1.8 ? "Active" : "In-Active";
}

function parseDate(dateStr) {
    // Split date part and time part
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('-');
    const formattedDate = `${year}-${month}-${day}T${timePart}`;
    const dateObj = new Date(formattedDate);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
    }

    return dateObj;
}


exports.getUserParticularDeviceInfoStatus = async ({ presentDate, device }) => {
    let updatedDeviceInfo;

    try {

        const result = await BiometricDeviceManagement.aggregate([
            {
                $match: {
                    biometricserialno: device
                }
            },
            {
                $lookup: {
                    from: "biometriconlinestatuses",
                    localField: "biometricserialno",
                    foreignField: "cloudIDC",
                    as: "deviceData",
                },
            },
            {
                $unwind: {
                    path: "$deviceData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    cloudIDC: 1,
                    biometricserialno: 1,
                    company: 1,
                    branch: 1,
                    unit: 1,
                    floor: 1,
                    area: 1,
                    biometricdeviceid: 1,
                    biometricserialno: 1,
                    biometricassignedip: 1,
                    "lastOnlineTimeC": "$deviceData.lastOnlineTimeC", // Ensure it is referenced correctly
                }

            },
        ]);
        updatedDeviceInfo = result?.length > 0 ? result?.map(device => {
            if (device.lastOnlineTimeC) {
                const lastOnline = parseDate(device?.lastOnlineTimeC);
                const status = getStatus(lastOnline, presentDate);
                return { ...device, status };
            } else {
                return { ...device, status: "In-Active" };
            }
        }) : [];



    } catch (err) {
        console.log(err, 'err')
        new ErrorHandler("Records not found!", 404);
    }
    return updatedDeviceInfo[0]?.status;
};

const getUserParticularDeviceStatus = async ({ presentDate, device }) => {
    let updatedDeviceInfo;

    try {

        const result = await BiometricDeviceManagement.aggregate([
            {
                $match: {
                    biometricserialno: device
                }
            },
            {
                $lookup: {
                    from: "biometriconlinestatuses",
                    localField: "biometricserialno",
                    foreignField: "cloudIDC",
                    as: "deviceData",
                },
            },
            {
                $unwind: {
                    path: "$deviceData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    cloudIDC: 1,
                    biometricserialno: 1,
                    company: 1,
                    branch: 1,
                    unit: 1,
                    floor: 1,
                    area: 1,
                    biometricdeviceid: 1,
                    biometricserialno: 1,
                    biometricassignedip: 1,
                    "lastOnlineTimeC": "$deviceData.lastOnlineTimeC", // Ensure it is referenced correctly
                }

            },
        ]);
        updatedDeviceInfo = result?.length > 0 ? result?.map(device => {
            if (device.lastOnlineTimeC) {
                const lastOnline = parseDate(device?.lastOnlineTimeC);
                const status = getStatus(lastOnline, presentDate);
                return { ...device, status };
            } else {
                return { ...device, status: "In-Active" };
            }
        }) : [];



    } catch (err) {
        console.log(err, 'err')
        new ErrorHandler("Records not found!", 404);
    }
    return updatedDeviceInfo[0]?.status;
};

exports.getParticularOnlineStatus = catchAsyncErrors(async (req, res, next) => {
    let deviceonlinestatus;
    try {
        const { presentDate } = req?.body;
        const result = await BiometricDeviceManagement.aggregate([
            {
                $lookup: {
                    from: "biometriconlinestatuses",
                    localField: "biometricserialno",
                    foreignField: "cloudIDC",
                    as: "deviceData",
                },
            },
            {
                $unwind: {
                    path: "$deviceData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    cloudIDC: 1,
                    biometricserialno: 1,
                    company: 1,
                    branch: 1,
                    unit: 1,
                    floor: 1,
                    area: 1,
                    biometricdeviceid: 1,
                    biometricserialno: 1,
                    biometricassignedip: 1,
                    "lastOnlineTimeC": "$deviceData.lastOnlineTimeC", // Ensure it is referenced correctly
                }

            },
        ]);
        const updatedDeviceInfo = result?.length > 0 ? result?.map(device => {
            if (device.lastOnlineTimeC) {
                const lastOnline = parseDate(device?.lastOnlineTimeC);
                const status = getStatus(lastOnline, presentDate);
                return { ...device, status };
            } else {
                return { ...device, status: "In-Active" };
            }
        }) : [];
        return res.status(200).json({
            deviceonlinestatus: updatedDeviceInfo
        });

    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 500));
    }
})
exports.getParticularDeviceOnlineStatus = catchAsyncErrors(async (req, res, next) => {
    let deviceonlinestatus;
    try {
        const { date, cloudIDC } = req?.body;
        deviceonlinestatus =await getUserParticularDeviceStatus({ presentDate: date, device: cloudIDC })
        return res.status(200).json({
            deviceonlinestatus
        });

    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 500));
    }
})

exports.addOnlineStatus = catchAsyncErrors(async (req, res, next) => {
    try {
console.log(req?.body , "Online Status")
        const existingUser = await Biometriconlinestatus.findOne({ cloudIDC: req?.body.cloudIDC });

        if (existingUser) {
            existingUser.lastOnlineTimeC = req?.body?.lastOnlineTimeC; // Set the current time or your desired value
            await existingUser.save();
        } else {
            const newUser = new Biometriconlinestatus(req?.body);
            await newUser.save();
        }

        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Updated!!",
            returnValue: ""
        });
    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 500));
    }
})
