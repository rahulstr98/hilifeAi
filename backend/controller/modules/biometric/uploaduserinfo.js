const Biouploaduserinfo = require('../../../model/modules/biometric/uploaduserinfo');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");
const { getUserListForAllUsers } = require('../../../route/bowerBiometric');
exports.getAllUploadUserInfo = catchAsyncErrors(async (req, res, next) => {
    let alluploaduserinfo;
    try {
        alluploaduserinfo = await Biouploaduserinfo.find();

        return res.status(200).json({
            alluploaduserinfo
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})
exports.getAllUserBioInfos = catchAsyncErrors(async (req, res, next) => {
    let alluploaduserinfo;
    console.log(req.body, "req.body")
    try {
        alluploaduserinfo = await Biouploaduserinfo.find({ staffNameC: req?.body.username }, { 
            staffNameC: 1, 
            cloudIDC: 1, 
            biometricUserIDC: 1, 
            privilegeC: 1 });

        return res.status(200).json({
            alluploaduserinfo
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})
exports.getAllUsersFromDeviceToDatabase = catchAsyncErrors(async (req, res, next) => {
    let { company, branch, unit, floor, area, biometricdevices } = req?.body;

    try {
        console.log(company, branch, unit, floor, area, biometricdevices, "company, branch, unit, floor, area, biometricdevices")

        // Step 1: Get Bowee devices
        const testing = await BiometricDeviceManagement.find(
            { brand: "Bowee", biometriccommonname: { $in: biometricdevices } },
            { biometricassignedip: 1 }
        ).lean();

        const deviceUrls = testing?.length > 0
            ? testing.map((data) => `http://${data.biometricassignedip}`)
            : [];

        if (!deviceUrls.length) {
            console.log("⚠️ No Bowee devices found");
            return res.status(404).json({
                success: false,
                message: "No Bowee devices found"
            });
        }

        // Step 2: Fetch users & upload
        const { totalUsers, uniqueUsers } = await userDetailsListFromBowee(deviceUrls);
        if (uniqueUsers === 0) {
            return res.status(200).json({
                success: false,
                message: "ℹ️ All users are already added, no new users to upload",
                totalFetched: totalUsers,
                totalUploaded: 0
            });
        }

        return res.status(200).json({
            success: true,
            message: `✅ ${uniqueUsers} unique users uploaded successfully (out of ${totalUsers} users fetched from devices)`,
            totalFetched: totalUsers,
            totalUploaded: uniqueUsers
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
});

const userDetailsListFromBowee = async (urls) => {
    try {
        let allUsers = [];

        // Step 1: Loop through all device URLs
        for (const url of urls) {
            const result = await getUserListForAllUsers(url);
            if (result?.success && result?.DataList?.length) {
                allUsers.push(...result.DataList);
            }
        }

        // Step 2: Remove duplicates
        const uniqueLogs = await removeDuplicateLogsForUserAddition(allUsers);

        if (uniqueLogs?.length > 0) {
            await Biouploaduserinfo.insertMany(uniqueLogs, { ordered: false });
            console.log(`✅ ${uniqueLogs.length} users uploaded successfully`);
        }

        // ✅ Return counts so API can respond
        return {
            totalUsers: allUsers.length,
            uniqueUsers: uniqueLogs.length
        };

    } catch (err) {
        console.error("Error in userDetailsListFromBowee:", err.message);
        return { totalUsers: 0, uniqueUsers: 0 };
    }
};


const removeDuplicateLogsForUserAddition = async (logs) => {
    try {
        // 1. Fetch existing logs from backend
        // const existingResponse = await axios.get(
        //     "http://192.168.1.6:7001/api/biouploaduserinfos"
        // );
        const existingResponse = await Biouploaduserinfo.find();

        const existingLogs = existingResponse || [];
        console.log(existingLogs[0], "existingLogs");

        // 2. Build a lookup set
        const existingSet = new Set(
            existingLogs.map((log) => `${log.biometricUserIDC}_${log.cloudIDC}_${log.staffNameC}`)
        );

        // 3. Filter only unique logs
        const uniqueLogs = logs.filter(
            (log) => !existingSet.has(`${log.biometricUserIDC}_${log.cloudIDC}_${log.staffNameC}`)
        );
        // console.log(uniqueLogs, "uniqueLogs")
        return uniqueLogs;
    } catch (err) {
        if (err.response) {
            console.error("Error response:", err.response.status, err.response.data);
        } else if (err.request) {
            console.error("No response received:", err.request);
        } else {
            console.error("Request setup error:", err.message);
        }
        return [];
    }
};

exports.addUploadUserInfo = catchAsyncErrors(async (req, res, next) => {

    try {
        let auploaduserinfo = await Biouploaduserinfo.create(req.body);
        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Updated!!",
            returnValue: ""
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})


exports.getDownloadUserinfo = catchAsyncErrors(async (req, res, next) => {

    try {
        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Updated!!",
            returnValue: req.body
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})