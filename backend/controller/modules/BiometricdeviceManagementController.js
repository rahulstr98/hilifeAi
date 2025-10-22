const BiometricDeviceManagement = require("../../model/modules/BiometricDeviceManagementModel");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const Area = require('../../model/modules/area');
const Hardwarespecification = require("../../model/modules/account/Hardwarespecification");
const Assetdetail = require('../../model/modules/account/assetdetails');
const IpMaster = require("../../model/modules/account/ipmodel");
const BiometricDevicesPairing = require('../../model/modules/biometric/BiometricDevicesPairingModel');
const BiometricPairedDevicesGrouping = require('../../model/modules/biometric/BiometricPairedDevicesGroupingModel');


// const { sendCommandToDevice } = require('./deviceSocket');

// exports.getDeviceNewLogs = async (req, res, next) => {
//     const command = {
//         cmd: "getnewlog",
//         stn: true
//     };

//     try {
//         const result = await sendCommandToDevice(command);
//         console.log(result , 'result')

//         return res.status(200).json({
//             message: "Logs received from device",
//             data: result
//         });
//     } catch (error) {
//         console.log(error , 'error')
//         return res.status(500).json({
//             message: "Failed to get logs",
//             error: error.message
//         });
//     }
// };



// get All BiometricDeviceManagement Name => /api/biometricdevicemanagement
exports.getAllBiometricDeviceManagement = catchAsyncErrors(async (req, res, next) => {
    let biometricdevicemanagement;
    try {
        biometricdevicemanagement = await BiometricDeviceManagement.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!biometricdevicemanagement) {
        return next(new ErrorHandler("BiometricDeviceManagement Name not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        biometricdevicemanagement,
    });
});

// Bulk Delete
exports.getOverallBulkBiometricDevicesDelete = catchAsyncErrors(async (req, res, next) => {
    let biometricdevicemanagement, result, count;
    let id = req.body.id;
    try {
        biometricdevicemanagement = await BiometricDeviceManagement.find();
        const answer = biometricdevicemanagement?.filter(data => id?.includes(data._id?.toString()));


        const devicePairing = await BiometricDevicesPairing.find({})
        const biometricPairedDevices = await BiometricPairedDevicesGrouping.find({})



        const pairingDevice = answer.filter(answers => devicePairing?.some(data => data.pairdevices?.includes(answers?.biometriccommonname)))?.map(data => data._id?.toString());
        const pairedDevice = answer.filter(answers => biometricPairedDevices?.some(data => (data?.paireddeviceone === answers?.biometriccommonname) || (data?.paireddevicetwo === answers?.biometriccommonname)))?.map(data => data._id?.toString());
        const duplicateId = [...pairingDevice, ...pairedDevice]
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
exports.getSingleBulkBiometricDevicesDelete = catchAsyncErrors(async (req, res, next) => {
    let devicename = req.body.oldname;
    let devicepairing = [], paireddevice = []
    try {
        devicepairing = await BiometricDevicesPairing.find({ pairdevices: { $in: devicename } })
        paireddevice = await BiometricPairedDevicesGrouping.find({
            $or: [
                { paireddeviceone: devicename },
                { paireddeviceone: devicename }
            ]
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        count: devicepairing?.length + paireddevice?.length,
        devicepairing, paireddevice
    });
});

// Get All Com/Bran/Unit Based Attendance Devices
exports.getAllBiometricAttendanceDevices = catchAsyncErrors(async (req, res, next) => {
    let biometricdevices = [];
    try {
        biometricdevices = await BiometricPairedDevicesGrouping.aggregate([
            {
                $project: {
                    originalid: "$_id",
                    company: 1,
                    branch: 1,
                    unit: 1,
                    floor: 1,
                    area: 1,
                    devices: {
                        $concatArrays: [
                            [
                                {
                                    paireddevice: "$paireddeviceone",
                                    pairedstatus: "$pairedstatus",
                                    attendancein: "$attendanceinone",
                                    attendanceout: "$attendanceoutone",
                                    attendanceinout: "$attendanceinoutone",
                                    exitin: "$exitinone",
                                    exitout: "$exitoutone",
                                    exitinout: "$exitinoutone",
                                    break: "$breakone"
                                }
                            ],
                            [
                                {
                                    paireddevice: "$paireddevicetwo",
                                    pairedstatus: "$pairedstatus",
                                    attendancein: "$attendanceintwo",
                                    attendanceout: "$attendanceouttwo",
                                    attendanceinout: "$attendanceinouttwo",
                                    exitin: "$exitintwo",
                                    exitout: "$exitouttwo",
                                    exitinout: "$exitinouttwo",
                                    break: "$breaktwo"
                                }
                            ]
                        ]
                    }
                }
            },
            {
                $unwind: "$devices"
            },
            {
                $match: {
                    "devices.paireddevice": { $ne: null, $ne: "" }
                }
            },
            {
                $project: {
                    originalid: 1,
                    company: 1,
                    branch: 1,
                    unit: 1,
                    floor: 1,
                    area: 1,
                    paireddevice: "$devices.paireddevice",
                    pairedstatus: "$devices.pairedstatus",
                    attendancein: "$devices.attendancein",
                    attendanceout: "$devices.attendanceout",
                    attendanceinout: "$devices.attendanceinout",
                    exitin: "$devices.exitin",
                    exitout: "$devices.exitout",
                    exitinout: "$devices.exitinout",
                    break: "$devices.break"
                }
            }
        ]);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        biometricdevices,
    });
});



exports.getBiometricAssignedIpAsset = catchAsyncErrors(async (req, res, next) => {
    let assignedip;
    const { codename } = req?.body
    try {
        assignedip = await IpMaster.aggregate([
            { $unwind: "$ipconfig" },
            { $match: { "ipconfig.assetmaterialcode": codename, "ipconfig.status": "assigned" } },
            { $replaceRoot: { newRoot: "$ipconfig" } },
            { $limit: 1 }
        ]);

    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        assignedip,
    });
});



exports.getBiometricSerialNumberAssets = catchAsyncErrors(async (req, res, next) => {
    let serialnumber, ser, result;
    try {
        result = await Assetdetail.aggregate([
            // 1. Filter Assetdetail where biometric is "Yes"
            {
                $match: {
                    biometric: "Yes"
                }
            },
            // 2. Create codename = material + "-" + code
            {
                $addFields: {
                    codename: { $concat: ["$material", "-", "$code"] }
                }
            },
            // 3. Lookup into assetips where ip: true and codename is in component
            {
                $lookup: {
                    from: "assetips",
                    let: { cname: "$codename" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$ip", true] },
                                        { $in: ["$$cname", "$component"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "matchedMaterials"
                }
            },
            // 4. Ensure there is at least one matched material
            {
                $match: {
                    $expr: {
                        $gt: [{ $size: "$matchedMaterials" }, 0]
                    }
                }
            },
            // 5. Project desired fields
            {
                $project: {
                    _id: 0,
                    floor: 1,
                    company: 1,
                    branch: 1,
                    unit: 1,
                    area: 1,
                    brand: { $arrayElemAt: ["$subcomponent.brand", 0] },
                    model: { $arrayElemAt: ["$subcomponent.model", 0] },
                    subcomponent: 1,
                    component: 1,
                    codename: 1,
                    code: 1,
                    material: 1
                }
            }
        ]);


    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        // count: products.length,
        serialnumber, ser, result
    });
});
exports.getDuplicateBiometricDeviceGrouping = catchAsyncErrors(async (req, res, next) => {
    let { company, branch, unit, floor, area } = req?.body?.deviceData;
    try {
        const deviceLocation = await BiometricDeviceManagement.find({ company, branch, unit, floor, area });

        if (deviceLocation?.length > 1) {
            return res.status(200).json({
                message: "Paired Devices Added",
                result: false
            });
        } else if (deviceLocation?.length === 1) {
            const firstDevice = deviceLocation[0];
            const secondDevice = req?.body?.deviceData;

            let isAllowed = true;
            let allowedCombination = "";

            if (firstDevice.biometricinoutattendance) {
                allowedCombination = "Second device: all attendance buttons must be false";
                if (
                    secondDevice.biometricinattendance ||
                    secondDevice.biometricoutattendance ||
                    secondDevice.biometricinoutattendance
                ) {
                    isAllowed = false;
                }
            }

            else if (firstDevice.biometricinattendance) {
                allowedCombination = "Second device: only biometricoutattendance may be true";
                if (
                    secondDevice.biometricinattendance || // same flag not allowed
                    secondDevice.biometricinoutattendance // inout not allowed
                ) {
                    isAllowed = false;
                }
            }

            else if (firstDevice.biometricoutattendance) {
                console.log(deviceLocation, "deviceLocation")
                allowedCombination = "Second device: only biometricinattendance may be true";
                if (
                    secondDevice.biometricoutattendance || // same flag not allowed
                    secondDevice.biometricinoutattendance // inout not allowed
                ) {
                    isAllowed = false;
                }
            }

            if (!isAllowed) {
                return res.status(200).json({
                    message: `${allowedCombination}`,
                    result: isAllowed
                });
            } else {
                return res.status(200).json({
                    message: `success`,
                    result: isAllowed
                });
            }


        } else {
            return res.status(200).json({
                message: `success`,
                result: true
            });
        }


    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 404));
    }
});


exports.getBiometricBrandModelAssets = catchAsyncErrors(async (req, res, next) => {
    let brandnames, modelnames;
    console.log("Hitted")
    try {
        const result = await Hardwarespecification.aggregate([
            {
                $match: {
                    type: { $in: ["Brand Master", "Asset Model"] }
                }
            },
            {
                $facet: {
                    brandnames: [
                        { $match: { type: "Brand Master" } }
                    ],
                    modelnames: [
                        { $match: { type: "Asset Model" } }
                    ]
                }
            }
        ]);

        brandnames = result[0].brandnames;
        modelnames = result[0].modelnames;
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        brandnames, modelnames
    });
});



exports.biometricdevicelastindex = catchAsyncErrors(async (req, res, next) => {
    let biocode, areacode;
    let { area } = req?.body;
    try {
        biocode = await BiometricDeviceManagement
            .find({}, { biometriccommonname: 1 })
            .sort({ createdAt: -1 })  // Fetch the latest entry
            .lean();
        areacode = await Area.findOne({ name: area }, { _id: 0, code: 1 }).lean();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        biocode, areacode
    });
});

// Create new BiometricDeviceManagement=> /api/operatingsystem/new
exports.addBiometricDeviceManagement = catchAsyncErrors(async (req, res, next) => {
    let abiometricdevicemanagement = await BiometricDeviceManagement.create(req.body);
    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle BiometricDeviceManagement => /api/operatingsystem/:id
exports.getSingleBiometricDeviceManagement = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let sbiometricdevicemanagement = await BiometricDeviceManagement.findById(id);

    if (!sbiometricdevicemanagement) {
        return next(new ErrorHandler("BiometricDeviceManagement Name not found!", 404));
    }
    return res.status(200).json({
        sbiometricdevicemanagement,
    });
});

// update BiometricDeviceManagement by id => /api/operatingsystem/:id
exports.updateBiometricDeviceManagement = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let ubiometricdevicemanagement = await BiometricDeviceManagement.findByIdAndUpdate(id, req.body);
    if (!ubiometricdevicemanagement) {
        return next(new ErrorHandler("BiometricDeviceManagement Name not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete BiometricDeviceManagement by id => /api/operatingsystem/:id
exports.deleteBiometricDeviceManagement = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dbiometricdevicemanagement = await BiometricDeviceManagement.findByIdAndRemove(id);

    if (!dbiometricdevicemanagement) {
        return next(new ErrorHandler("BiometricDeviceManagement Name not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});


function getStatus(lastOnlineTimeC, newDate) {
    const lastOnlineDate = lastOnlineTimeC;
    const newDateObj = newDate;

    // Calculate the difference in milliseconds
    const timeDifference = newDateObj - lastOnlineDate;

    // Convert the time difference to minutes
    const timeDifferenceInMinutes = timeDifference / (1000 * 60);
    // Check if the difference is less than or equal to 1 minute
    return timeDifferenceInMinutes <= 1 ? "active" : "inactive";
}

function parseDate(dateStr) {
    // Split date part and time part
    const [datePart, timePart] = dateStr.split(' ');

    // Split the date part and reverse to get "yyyy-MM-dd"
    const [day, month, year] = datePart.split('-');
    const formattedDate = `${year}-${month}-${day}T${timePart}`;

    // Create a Date object from the formatted string
    const dateObj = new Date(formattedDate);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
    }

    return dateObj;
}

exports.biometricDeviceManagement = catchAsyncErrors(async (req, res, next) => {
    let totalProjects, result, totalProjectsAllData;

    const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, } = req.body;

    // const query = {
    //     $or: assignbranch.map(item => ({
    //         company: item.company,
    //         branch: item.branch,
    //     }))
    // };
    try {

        let query = {};

        const conditions = [];

        // Advanced search filter
        if (allFilters && allFilters.length > 0) {
            allFilters.forEach(filter => {
                if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
                    conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
                }
            });
        }

        if (searchQuery && searchQuery !== undefined) {
            const searchTermsArray = searchQuery.split(" ");
            const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

            const orConditions = regexTerms.map((regex) => ({
                $or: [
                    { company: regex },
                    { branch: regex },
                    { unit: regex },
                    { floor: regex },
                    { area: regex },
                    { biometricdeviceid: regex },
                    { biometricserialno: regex },
                    { biometricassignedip: regex },
                ],
            }));

            query = {
                $and: [
                    query,
                    // {
                    //     $or: assignbranch.map(item => ({
                    //         company: item.company,
                    //         branch: item.branch,
                    //     }))
                    // },
                    ...orConditions,
                ],
            };
        }

        // Apply logicOperator to combine conditions
        if (conditions.length > 0) {
            if (logicOperator === "AND") {
                query.$and = conditions;
            } else if (logicOperator === "OR") {
                query.$or = conditions;
            }
        }

        const branchFilters = assignbranch?.map(branchObj => ({
            company: branchObj.company,
            branch: branchObj.branch,
            unit: branchObj.unit,
        }));

        const combinedFilter = {
            $and: [
                query,
                { $or: branchFilters },
            ],
        };

        totalProjects = await BiometricDeviceManagement.countDocuments(combinedFilter);
        totalProjectsAllData = await BiometricDeviceManagement.find(combinedFilter);

        result = await BiometricDeviceManagement.find(combinedFilter)
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        totalProjects,
        result,
        totalProjectsAllData,
        currentPage: page,
        totalPages: Math.ceil(totalProjects / pageSize),
    });
});


exports.biometricDeviceManagementSort = catchAsyncErrors(async (req, res, next) => {
    let deviceonlinestatus;
    try {

        const presentDate = new Date();
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
                    "deviceData": "$deviceData", // Ensure it is referenced correctly
                }

            },
        ]);

        const updatedDeviceInfo = result?.length > 0 ? result?.map(device => {
            if (device.lastOnlineTimeC) {
                const lastOnline = parseDate(req?.body.lastOnlineTimeC);
                const status = getStatus(lastOnline, presentDate);
                return { ...device, status };
            } else {
                return { ...device, status: "inactive" };
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

