const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Biocommandcomplete = require('../../../model/modules/biometric/biocommandcomplete');
const Biouploaduserinfo = require('../../../model/modules/biometric/uploaduserinfo');
const Biouploadtemplateinfo = require('../../../model/modules/biometric/uploadusertemplateinfo');
const Biogetdeviceinfo = require('../../../model/modules/biometric/getdeviceinfo');
const Biouploaduserfromsite = require('../../../model/modules/biometric/uploaduserfromsite');
const { getUserParticularDeviceInfoStatus } = require('./biometriconlinestatus');
const User = require("../../../model/login/auth");
let DeviceName = null
let DeviceNameCode = null
exports.getSendCommand = catchAsyncErrors(async (req, res, next) => {
    try {
        let lastDataindex = await Biocommandcomplete.findOne({
            StatusC: { $in: ["New", "Sent"] }
        }).sort({ createdAt: -1 });
        if (req?.body?.deviceCommandN) {
            let aallbiocmdcpl = await Biocommandcomplete.create({
                deviceCommandN: req?.body?.deviceCommandN,
                CloudIDC: req.body.CloudIDC,
                biometricUserIDC: req.body.biometricUserIDC,
                StatusC: "New",
                description: req.body.description ? req.body.description : "",
                param1C: "",
                param2C: "",
            });

            const string = JSON.stringify({
                "deviceCommandN": req.body?.deviceCommandN,
                "CloudIDC": req.body.CloudIDC,
                "biometricUserIDC": req.body?.biometricUserIDC,
                "param1C": "",
                "param2C": "",
                "staffNameC": ""
            });
            DeviceName = req.body.CloudIDC;
            DeviceNameCode = req.body.biometricUserIDC;
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: string
            });
        }

        const deviceCommand = lastDataindex?.deviceCommandN;
        DeviceName = lastDataindex?.CloudIDC;
        DeviceNameCode = lastDataindex?.biometricUserIDC;
        if (deviceCommand !== undefined
            && ([DeviceName]?.includes(DeviceName))
        ) {
            if (deviceCommand === "4") {
                if (!req?.body?.CloudIDC) {
                    return res.status(400).json({
                        returnStatus: false,
                        returnMessage: "CloudIDC is required",
                        returnValue: null
                    });
                }

                // Check if there is an existing "New" or "Sent" command
                const existingCommand = await Biocommandcomplete.findOne({
                    CloudIDC: DeviceName,
                    deviceCommandN: deviceCommand,
                    StatusC: { $in: ["New"] } // Ensure no duplicate "New" or "Sent" command
                });

                if (existingCommand) {
                    const string = JSON.stringify({
                        "deviceCommandN": 0,
                        "CloudIDC": DeviceName,
                        "biometricUserIDC": DeviceNameCode,
                        "param1C": "",
                        "param2C": ""
                    })
                    return res.status(200).json({
                        returnStatus: true,
                        returnMessage: "",
                        returnValue: string
                    });
                }
                // Create a new command only if no "New" or "Sent" command exists
                const newCommand = await Biocommandcomplete.create({
                    deviceCommandN: deviceCommand,
                    CloudIDC: DeviceName,
                    StatusC: "New",
                    description: req.body.description || "",
                    param1C: "",
                    param2C: "",
                });

                // Prepare the JSON response
                const responseString = JSON.stringify({
                    "deviceCommandN": deviceCommand,
                    "CloudIDC": DeviceName,
                    "biometricUserIDC": DeviceNameCode,
                    "param1C": "",
                    "param2C": ""
                });

                const executionSuccess = await executeCommand(responseString);

                if (executionSuccess) {
                    // Update status from "New" to "Sent"
                    await Biocommandcomplete.updateOne(
                        { _id: newCommand._id },
                        { $set: { StatusC: "Sent", updatedAt: new Date() } }
                    );

                    // Find and delete all "Complete" commands except the latest one
                    const completedCommands = await Biocommandcomplete.find({
                        CloudIDC: req.body.CloudIDC,
                        StatusC: "Complete"
                    }).sort({ createdAt: -1 }); // Sort by newest first

                    if (completedCommands.length > 1) {
                        const idsToDelete = completedCommands.slice(1).map(cmd => cmd._id);
                        await Biocommandcomplete.deleteMany({ _id: { $in: idsToDelete } });
                    }
                } else {
                    console.log("Execution failed. Command remains in 'New' state.");
                }

                return res.status(200).json({
                    returnStatus: true,
                    returnMessage: "Successfully Updated",
                    returnValue: responseString
                });
            }

            // else if (deviceCommand === "10") {
            //     let deviceinfo = await Biogetdeviceinfo.findOne({ cloudIDC: "BT17EVP20001125" });
            //     const userDetails = await User.find({
            //         resonablestatus: {
            //             $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
            //         }, company: "TTS", branch: "TTS-TRICHY"
            //     }, { companyname: 1, username: 1, _id: 1, company: 1, branch: 1, unit: 1, team: 1, designation: 1, department: 1 });
            //     await Promise.all(
            //         userDetails?.map(async (user, index) => {
            //             await Biouploaduserinfo.findOneAndUpdate(
            //                 { cloudIDC: req.body.CloudIDC, biometricUserIDC: index + 1 }, // Match condition
            //                 {
            //                     $setOnInsert: {
            //                         "CloudIDC": 'BT17EVP20001125',
            //                         "biometricUserIDC": index + 1,
            //                         "staffNameC": user.username,
            //                         "privilegeC": "User",
            //                         "isEnabledC": "Yes",
            //                         "pwdc": "",
            //                         "datastatus": "new",
            //                         "isFaceEnrolledC": "No",
            //                         "fingerCountN": 0,
            //                         "downloadedFaceTemplateN": 0,
            //                         "downloadedFingerTemplateN": 0,
            //                     }
            //                 },
            //                 { upsert: true, new: true } // Create a new document if it doesn't exist
            //             );
            //         })
            //     );

            // }
            // else if (deviceCommand === "11") {
            //     let deviceinfo = await Biogetdeviceinfo.findOne({ cloudIDC: req.body.CloudIDC });
            //     // console.log(req?.body, '11 Get User Info Details ')
            //     const highestUser = await Biouploaduserinfo.aggregate([
            //         {
            //             $addFields: { numericBiometricUserIDC: { $toInt: "$biometricUserIDC" } } // Convert to number
            //         },
            //         {
            //             $sort: { numericBiometricUserIDC: -1 } // Sort in descending order
            //         },
            //         {
            //             $limit: 1 // Get only the highest value
            //         }
            //     ]);

            //     const maxBiometricUserIDC = highestUser.length ? highestUser[0].numericBiometricUserIDC : null;

            //     // console.log("Highest biometricUserIDC:", maxBiometricUserIDC);

            //     await Biouploaduserinfo.findOneAndUpdate(
            //         { cloudIDC: req.body.CloudIDC, biometricUserIDC: req?.body?.biometricUserIDC }, // Match condition
            //         {
            //             $setOnInsert: {
            //                 "CloudIDC": req.body.CloudIDC,
            //                 "biometricUserIDC": maxBiometricUserIDC + 1,
            //                 "staffNameC": req?.body?.staffNameC,
            //                 "privilegeC": req?.body?.privilegeC,
            //                 "isEnabledC": "Yes",
            //                 "pwdc": "",
            //                 "datastatus": "new",
            //                 "isFaceEnrolledC": "No",
            //                 "fingerCountN": 0,
            //                 "downloadedFaceTemplateN": 0,
            //                 "downloadedFingerTemplateN": 0,
            //             }
            //         },
            //         { upsert: true, new: true } // Create a new document if it doesn't exist
            //     );
            // }
            else {
                let allbiocmdcpl = await Biocommandcomplete.find({ StatusC: { $in: ["New"] } })
                    .sort({ createdAt: -1 });

                if (allbiocmdcpl?.length > 0) {
                    const completedCommands = await Biocommandcomplete.find({
                        CloudIDC: lastDataindex?.CloudIDC,
                        StatusC: "Complete"
                    }).sort({ createdAt: -1 }); // Sort by newest first

                    if (completedCommands.length > 1) {
                        // Keep the most recent "Completed" command and delete the older ones
                        const idsToDelete = completedCommands.slice(1).map(cmd => cmd._id);
                        await Biocommandcomplete.deleteMany({ _id: { $in: idsToDelete } });
                    }
                    let lastCmd = allbiocmdcpl[0];
                    if (lastCmd.StatusC === "New") {
                        let updateResult = await Biocommandcomplete.updateOne(
                            { _id: lastCmd._id },
                            { $set: { StatusC: "Sent", updatedAt: new Date() } }
                        );
                        const string = JSON.stringify({
                            "deviceCommandN": lastCmd?.deviceCommandN,
                            "CloudIDC": lastCmd.CloudIDC,
                            "biometricUserIDC": lastCmd?.biometricUserIDC,
                            "param1C": "",
                            "param2C": "",
                            "staffNameC": ""
                        });
                        return res.status(200).json({
                            returnStatus: true,
                            returnMessage: "Successfully updated",
                            returnValue: string
                        });
                    }

                }
                else {
                    if (req?.body?.CloudIDC !== null && deviceCommand) {
                        // if (deviceCommand === "2") {
                        //     const existingUser = await Biogetdeviceinfo.findOne({ cloudIDC: DeviceName });
                        //     // if (existingUser) {
                        //     //     await Biogetdeviceinfo.deleteOne({ cloudIDC: existingUser.cloudIDC });
                        //     //     // console.log("deleted Successfully")
                        //     // }
                        // }
                        // let aallbiocmdcpl = await Biocommandcomplete.create({
                        //     deviceCommandN: deviceCommand,
                        //     CloudIDC: req.body.CloudIDC,
                        //     biometricUserIDC: req.body.biometricUserIDC,
                        //     StatusC: "New",
                        //     description: req.body.description ? req.body.description : "",
                        //     param1C: "",
                        //     param2C: "",
                        // });

                        const string = JSON.stringify({
                            "deviceCommandN": deviceCommand,
                            "CloudIDC": DeviceName,
                            "biometricUserIDC" : DeviceNameCode,
                            "param1C": "",
                            "param2C": ""
                        });
                        return res.status(200).json({
                            returnStatus: true,
                            returnMessage: "Successfully updated",
                            returnValue: string
                        });
                    }

                }
            }
        }
        else {
            return res.status(200).json({
                returnStatus: false,
                returnMessage: "",
                returnValue: ""
            });
        }
    } catch (err) {
        console.log(err, '314')
        return next(new ErrorHandler("Records not found!", 500));
    }
});






async function executeCommand(commandString) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true; // Return true if execution is successful
    } catch (error) {
        console.error("Execution failed:", error);
        return false; // Return false if execution fails
    }
}
exports.getCompleteCommand = catchAsyncErrors(async (req, res, next) => {

    try {
        let { cloudIDC } = req?.body;
        let allbiocmdcpl = await Biocommandcomplete.find({ CloudIDC: cloudIDC, StatusC: "Sent" }).sort({ createdAt: -1 });
        if (allbiocmdcpl?.length > 0) {
            let updatePromises = allbiocmdcpl.map(async (cmd) => {
                return Biocommandcomplete.updateMany(
                    { CloudIDC: cloudIDC },
                    { $set: { StatusC: "Complete", deviceCommandN: 0, updatedAt: new Date() } }  // Update fields
                );
            });
            // Wait for all updates to complete
            await Promise.all(updatePromises);
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: ""
            });
        } else {
            return res.status(200).json({
                returnStatus: false,
                returnMessage: "",
                returnValue: ""
            });
        }
    } catch (err) {
        console.log(err, '359')
        return next(new ErrorHandler("Records not found!", 500));
    }
});


exports.getDeviceInfoCommand = catchAsyncErrors(async (req, res, next) => {
    try {
      
// console.log(req?.body , "Info")
        const existingUser = await Biogetdeviceinfo.findOne({ cloudIDC: req?.body?.cloudIDC });

        if (existingUser?.cloudIDC === req?.body?.cloudIDC) {
            existingUser.totalManagerN = req?.body?.totalManagerN;
            existingUser.totalUserN = req?.body?.totalUserN;
            existingUser.totalFaceN = req?.body?.totalFaceN;
            existingUser.totalFPN = req?.body?.totalFPN;
            existingUser.totalCardN = req?.body?.totalCardN;
            existingUser.totalPWDN = req?.body?.totalPWDN;
            await existingUser.save();

            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: ""
            });
        } else {
            if (req?.body?.cloudIDC) {
                const uploadUserTemplateInfo = await Biogetdeviceinfo.findOneAndUpdate(
                    { cloudIDC: req?.body?.cloudIDC },
                    { $setOnInsert: req?.body },
                    { upsert: true, new: true }
                );
                // const uploadUserTemplateInfo = await Biogetdeviceinfo.create(req?.body);
                return res.status(200).json({
                    returnStatus: true,
                    returnMessage: "Successfully updated",
                    returnValue: ""
                });
            } else {
                return res.status(200).json({
                    returnStatus: false,
                    returnMessage: "",
                    returnValue: ""
                });
            }

        }

    } catch (err) {
        console.log(err, '414')
        return next(new ErrorHandler("Records not found!", 500));
    }
});


exports.getBioDownlodUser = catchAsyncErrors(async (req, res, next) => {
    try {
       
        const record = await Biouploaduserinfo.find({
            biometricUserIDC: DeviceNameCode,
            cloudIDC: DeviceName,
            // dataupload: "new"
        }, {
            addedby: 0,
            updatedby: 0, datastatus: 0, createdAt: 0, __v: 0
        })

        if (record?.length > 0) {
            let newData = record[0].toObject();
            // newData.cloudIDC = req?.body?.cloudIDC;
            const isProcessed = true;
            if (isProcessed) {
                await Biouploaduserinfo.updateOne(
                    { _id: newData?._id },
                    { $set: { dataupload: "sent" } }
                );
            }
            const { _id, dataupload, ...filteredData } = newData;
            const string = JSON.stringify(filteredData)
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: string
            });
        }
        else {

            return res.status(200).json({
                returnStatus: false,
                returnMessage: "",
                returnValue: ""
            });
        }
    } catch (err) {
        console.log(err, '457')
        return next(new ErrorHandler("Records not found!", 500));
    }
});


let templateNo = 0;
exports.getBioDownloadUserTemplate = catchAsyncErrors(async (req, res, next) => {
    try {

       const newData = null
        await Biouploadtemplateinfo.findOne({
            // cloudIDC: req.body.cloudIDC,
            biometricUserIDC: req.body?.biometricUserIDC,
            templateTypeC: req.body.templateTypeC,
            templateNoN: req?.body?.templateNoN,
            dataupload: "new"
        }, {
            // _id: 0,
            addedby: 0,
            updatedby: 0, createdAt: 0, __v: 0
        });
        if (newData) {
            const isProcessed = true;
            if (isProcessed) {
                await Biouploadtemplateinfo.updateOne(
                    { _id: newData?._id },
                    { $set: { dataupload: "sent" } }
                );
            }
            const string = JSON.stringify(newData)
            templateNo = templateNo + 1;
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: string
            });
        }

    } catch (err) {
        console.log(err, '505')
        return next(new ErrorHandler("Records not found!", 500));
    }
});



// Command No : 4
exports.getUploadUserTemplateInfo = catchAsyncErrors(async (req, res, next) => {
    try {
        const userInfo = req?.body;
        let userTemplateInfo = await Biouploaduserinfo.findOne({ cloudIDC: userInfo?.cloudIDC, biometricUserIDC: userInfo.biometricUserIDC });

        if (userInfo?.staffNameC) {
            userInfo.staffNameC = Buffer.from(userInfo?.staffNameC, 'base64').toString('utf-8').replace(/[^A-Za-z]/g, '');
            userInfo.datastatus = "new";
            userInfo.dataupload = "new";
        }
        console.log(userInfo?.staffNameC, userInfo?.biometricUserIDC, userInfo.cloudIDC, 'userInfo?.staffNameC')
        if (!userTemplateInfo) {
            const uploadUserTemplateInfo = await Biouploaduserinfo.findOneAndUpdate(
                { cloudIDC: userInfo.cloudIDC, biometricUserIDC: userInfo.biometricUserIDC },
                { $setOnInsert: userInfo }, // Insert only if it doesn’t exist
                { upsert: true, new: true }
            );
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: ""
            });
        }
        else {
            const string = JSON.stringify({
                "deviceCommandN": 0,
                "CloudIDC": req.body.CloudIDC,
                "biometricUserIDC": "",
                "param1C": "",
                "param2C": ""
            })
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "",
                returnValue: string
            });
        }

    } catch (err) {
        console.log(err, '551')
        return next(new ErrorHandler("Records not found!", 500));
    }
});

exports.getBioPendingUserTemplate = catchAsyncErrors(async (req, res, next) => {
    try {
        const checkOne = await Biouploaduserinfo.findOneAndUpdate({
            cloudIDC: req.body.CloudIDC,
            datastatus: { $in: ["new", "Sent"] },
            $or: [
                { $expr: { $lt: ["$downloadedFingerTemplateN", "$fingerCountN"] } },
                {
                    $and: [
                        { isFaceEnrolledC: "Yes" },
                        { downloadedFaceTemplateN: 0 }
                    ]
                }
            ]
        }, { $set: { datastatus: "Sent", updatedAt: new Date() } }, { addedby: 0, updatedby: 0, _id: 0 }).sort({ createdAt: -1 });

        console.log(checkOne?.biometricUserIDC, 'checkOne')
        if (checkOne) {
            const bioDataString = JSON.stringify(checkOne);
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: bioDataString
            });
        }
        // else {
        //     const string = JSON.stringify({
        //         "deviceCommandN": 0,
        //         "CloudIDC": req.body.CloudIDC,
        //         "biometricUserIDC": "",
        //         "param1C": "",
        //         "param2C": ""
        //     })
        //     return res.status(200).json({
        //         returnStatus: true,
        //         returnMessage: "",
        //         returnValue: string
        //     });
        // }


    } catch (err) {
        console.log(err, '595')
        return next(new ErrorHandler("Records not found!", 500));
    }
});

exports.getBioUploadUserTemplate = catchAsyncErrors(async (req, res, next) => {
    try {
        const { cloudIDC, biometricUserIDC, templateTypeC, templateC } = req.body;
        const matchingTemplatesCount = await Biouploadtemplateinfo.countDocuments({
            cloudIDC,
            biometricUserIDC,
            templateTypeC,
            templateC
        });

        // Upsert Biouploadtemplateinfo (insert if it doesn’t exist)
        const uploadUserInfoTemplate = await Biouploadtemplateinfo.findOneAndUpdate(
            {
                cloudIDC, biometricUserIDC, templateTypeC,
                templateC, statusdevice: "new"
            },
            { $setOnInsert: req.body },
            { upsert: true, new: true }
        );

        if (uploadUserInfoTemplate && req.body?.biometricUserIDC) {
            let incrementField = null;
            if (templateTypeC === "FINGER") {
                incrementField = "downloadedFingerTemplateN";
            } else if (templateTypeC === "FACE") {
                incrementField = "downloadedFaceTemplateN";
            }

            if (incrementField) {
                const existingUploadUserInfo = await Biouploaduserinfo.findOne({ cloudIDC, biometricUserIDC });

                if (existingUploadUserInfo) {
                    let incrementValue = 0;

                    if (templateTypeC === "FINGER") {
                        // Check how many templates are already created
                        const currentCount = matchingTemplatesCount;
                        incrementValue = 1; // Always increment by 1 per new insert

                        // Ensure it doesn't exceed fingerCountN
                        const newValue = existingUploadUserInfo.downloadedFingerTemplateN + incrementValue;
                        if (newValue > existingUploadUserInfo.fingerCountN) {
                            incrementValue = Math.max(0, existingUploadUserInfo.fingerCountN - existingUploadUserInfo.downloadedFingerTemplateN);
                        }
                    }

                    if (templateTypeC === "FACE") {
                        // Only increment once, when the first FACE template is added
                        if (matchingTemplatesCount === 0) {
                            incrementValue = 1;
                        }
                    }

                    if (incrementValue > 0) {
                        await Biouploaduserinfo.findOneAndUpdate(
                            { cloudIDC, biometricUserIDC },
                            { $inc: { [incrementField]: incrementValue } },
                            { new: true }
                        );
                    }
                }
            }

            return res.status(200).json({
                returnStatus: true,
                returnMessage: "Successfully updated",
                returnValue: ""
            });
        }
        else {
            return res.status(200).json({
                returnStatus: false,
                returnMessage: "",
                returnValue: ""
            });
        }
    } catch (err) {
        console.log(err, '681')
        return next(new ErrorHandler("Records not found!", 500));
    }
});


exports.getCompleteListCommand = catchAsyncErrors(async (req, res, next) => {
    // console.log(req?.body, 'getCompleteListCommand')
    try {
        let { CloudIDC } = req?.body;
        let allbiocmdcpl = await Biocommandcomplete.find({ CloudIDC, StatusC: "Sent" }).sort({ createdAt: -1 });
        if (allbiocmdcpl?.length > 0) {
            const string = JSON.stringify({
                "deviceCommandN": 0,
                "CloudIDC": req.body.CloudIDC,
                "biometricUserIDC": "",
                "param1C": "",
                "param2C": ""
            })
            return res.status(200).json({
                returnStatus: true,
                returnMessage: "",
                returnValue: string
            });
        } else {
            return res.status(200).json({
                returnStatus: false,
                returnMessage: "",
                returnValue: ""
            });
        }
    } catch (err) {
        console.log(err, '724')
        return next(new ErrorHandler("Records not found!", 500));
    }
});


exports.getUserPendingReports = catchAsyncErrors(async (req, res, next) => {
    let { company, branch, usernames, type, status, date, workmode } = req?.body;
    let users;
    try {
        let query = {}
        if (type !== "Deactivate" && usernames?.length > 0) {
            query.username = { $in: usernames }
        }
        if (type === "Deactivate") {
            query.resonablestatus = { $in: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"] }
        }
        if (type === "Deactivate" && company?.length > 0) {
            query.company = { $in: company }
        }
        if (type === "Deactivate" && branch?.length > 0) {
            query.branch = { $in: branch }
        }
        if (workmode?.length > 0) {
            query.workmode = { $in: workmode }
        }
        // console.log(query , 'query')
        const userDetails = await User.find(query, { username: 1 })
        const usernamesFilter = userDetails?.length > 0 ? userDetails?.map(data => data?.username) : [];
console.log(usernamesFilter , "usernamesFilter")

        if (type === "Unmatched") {
            const answer = await Biouploaduserinfo.aggregate([
                {
                    $lookup: {
                        from: "users", // The users collection
                        localField: "staffNameC", // Field in Biouploaduserinfo
                        foreignField: "username", // Field in users collection
                        as: "userDetails"
                    }
                },
                {
                    $match: { "userDetails": { $eq: [] } }
                },
                {
                    $addFields: { statusreport: "Un-Matched" }
                },
                {
                    $lookup: {
                        from: "biometricdevicemanagements",
                        localField: "cloudIDC",
                        foreignField: "biometricserialno",
                        as: "deviceDetails"
                    }
                },
                {
                    $addFields: {
                        company: { $arrayElemAt: ["$deviceDetails.company", 0] },
                        branch: { $arrayElemAt: ["$deviceDetails.branch", 0] },
                        unit: { $arrayElemAt: ["$deviceDetails.unit", 0] },
                        biometriccommonname: { $arrayElemAt: ["$deviceDetails.biometriccommonname", 0] },
                        statusreport: {
                            $cond: {
                                if: { $eq: ["$isEnabledC", "No"] },  // If isEnabledC is "No", mark as "Disabled"
                                then: "Disabled",
                                else: {
                                    $cond: {
                                        if: { $or: [{ $gt: ["$fingerCountN", 0] }, { $eq: ["$isFaceEnrolledC", "Yes"] }] },
                                        then: "Assigned",
                                        else: "Not-Assigned"
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $facet: {
                        assigned: [
                            { $match: { statusreport: "Assigned" } },
                            { $project: { deviceDetails: 0, userDetails: 0 } } // Exclude unnecessary fields
                        ],
                        notAssigned: [
                            { $match: { statusreport: "Not-Assigned" } },
                            { $project: { deviceDetails: 0, userDetails: 0 } }
                        ],
                        disabled: [
                            { $match: { statusreport: "Disabled" } },
                            { $project: { deviceDetails: 0, userDetails: 0 } }
                        ],

                    }
                }
            ]);

            const { assigned = [], notAssigned = [], disabled = [] } = answer[0] || {};

            users = status === "Assigned" ? assigned
                : status === "Not-Assigned" ? notAssigned
                    : status === "Disable" ? disabled
                        : [...assigned, ...notAssigned, ...disabled];


        } else {
            const answer = await Biouploaduserinfo.aggregate([
                {
                    $match: { staffNameC: { $in: usernamesFilter } }
                }, {
                    $lookup: {
                        from: "users", // The users collection
                        localField: "staffNameC", // Field in Biouploaduserinfo
                        foreignField: "username", // Field in users collection
                        as: "userDetails"
                    },
                }, {
                    $match: { "userDetails": { $ne: [] } } // Ensures staffNameC exists in users
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $lookup: {
                        from: "biometricdevicemanagements",
                        localField: "cloudIDC",
                        foreignField: "biometricserialno",
                        as: "deviceDetails"
                    }
                },
                {
                    $addFields: {
                        company: "$userDetails.company",
                        branch: "$userDetails.branch",
                        unit: "$userDetails.unit",
                        team: "$userDetails.team",
                        department: "$userDetails.department",
                        companyname: "$userDetails.companyname",
                        biometriccommonname: { $arrayElemAt: ["$deviceDetails.biometriccommonname", 0] },
                        statusreport: {
                            $cond: {
                                if: { $eq: ["$isEnabledC", "No"] },  // If isEnabledC is "No", mark as "Disabled"
                                then: "Disabled",
                                else: {
                                    $cond: {
                                        if: { $or: [{ $gt: ["$fingerCountN", 0] }, { $eq: ["$isFaceEnrolledC", "Yes"] }] },
                                        then: "Assigned",
                                        else: "Not-Assigned"
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        userDetails: 0 // Exclude the userDetails object
                    }
                },
                {
                    $group: {
                        _id: null,
                        assigned: {
                            $push: {
                                $cond: { if: { $eq: ["$statusreport", "Assigned"] }, then: "$$ROOT", else: "$$REMOVE" }
                            }
                        },
                        notAssigned: {
                            $push: {
                                $cond: { if: { $eq: ["$statusreport", "Not-Assigned"] }, then: "$$ROOT", else: "$$REMOVE" }
                            }
                        },
                        disabled: {
                            $push: {
                                $cond: { if: { $eq: ["$statusreport", "Disabled"] }, then: "$$ROOT", else: "$$REMOVE" }
                            }
                        }
                    }
                }
            ]);
            const { assigned = [], notAssigned = [], disabled = [] } = answer[0] || {};

            users = status === "Assigned" ? assigned
                : status === "Not-Assigned" ? notAssigned
                    : status === "Disable" ? disabled
                        : [...assigned, ...notAssigned, ...disabled];

        }

        if (users?.length > 0) {
            const statuses = await Promise.all(
                users.map(user =>
                    getUserParticularDeviceInfoStatus({ presentDate: date, device: user.cloudIDC }))
            );
            users = users.map((user, index) => ({
                ...user,
                status: statuses[index]
            }));
        }
        return res.status(200).json({
            success: true,
            message: "Success",
            users,
            // assignedUsers,
            // notAssignedUsers

        });
    } catch (err) {
        console.log(err, '739')
        return next(new ErrorHandler("Records not found!", 500));
    }
});




exports.getUserDetailsEditData = catchAsyncErrors(async (req, res, next) => {
    let userInfo = req?.body;
    // console.log(userInfo, 'userInfo')
    try {
        const uploadUserTemplateInfo = await Biouploaduserinfo.findOne(
            { cloudIDC: userInfo.cloudIDC, biometricUserIDC: userInfo.biometricUserIDC },
        );
        if (uploadUserTemplateInfo) {
            uploadUserTemplateInfo.cloudIDC = userInfo?.cloudIDC;
            uploadUserTemplateInfo.dataupload = userInfo?.dataupload;
            uploadUserTemplateInfo.privilegeC = userInfo?.privilegeC;
            uploadUserTemplateInfo.staffNameC = userInfo?.staffNameC;
            await uploadUserTemplateInfo.save();
        }
        // console.log(uploadUserTemplateInfo, 'uploadUserTemplateInfo')
        return res.status(200).json({
            success: true,
            message: "Success",

        });
    } catch (err) {
        console.log(err, '739')
        return next(new ErrorHandler("Records not found!", 500));
    }
});



exports.getUserDataIndCheck = catchAsyncErrors(async (req, res, next) => {
    let { company, branch, unit, team, companyname, username } = req?.body;
    let biometricData = [];
    try {
        const userData = await User.findOne({ company, branch, unit, team, companyname, username }, { _id: 0, username: 1 });
        if (userData) {
            let userNameDetails = userData?.username;
            // let userNameDetails = "rahulstr" ; 
            biometricData = await Biouploaduserinfo.find({ staffNameC: userNameDetails });
        }
        return res.status(200).json({
            success: true,
            message: "Success",
            biometricData
        });
    } catch (err) {
        console.log(err, '836')
        return next(new ErrorHandler("Records not found!", 500));
    }
});
exports.getUserDetailsEditUnmatchedData = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    try {
        if (req?.body?.mode === "Delete") {
            let biometricUnmatchedData = await Biouploaduserinfo.findByIdAndRemove(id);

        } else {
            let biometricUnmatchedData = await Biouploaduserinfo.findByIdAndUpdate(id, req.body);

        }
        return res.status(200).json({
            success: true,
            message: "Success",
        });
    } catch (err) {
        console.log(err, '739')
        return next(new ErrorHandler("Records not found!", 500));
    }
});

