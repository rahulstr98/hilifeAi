const Biouploaduserfromsite = require('../../../model/modules/biometric/uploaduserfromsite');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Biouploaduserinfo = require('../../../model/modules/biometric/uploaduserinfo');
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");


exports.getAllUploadUserFromSite = catchAsyncErrors(async (req, res, next) => {
    let alluploaduserfromsite;
    try {
        alluploaduserfromsite = await Biouploaduserfromsite.find();
        return res.status(200).json({
            alluploaduserfromsite
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
});


exports.getIndividualUploadUserFromSite = catchAsyncErrors(async (req, res, next) => {
    let individualuser;
    let { cloudIDC, staffNameC } = req?.body;
    try {
        individualuser = await Biouploaduserinfo.findOne({ cloudIDC, staffNameC }).lean();

        return res.status(200).json({
            individualuser: individualuser?.staffNameC ? true : false,
        });

    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 500));
    }
});



exports.getEditBiometricUserCheck = catchAsyncErrors(async (req, res, next) => {
    let individualuser, devicedetails;
    let { staffNameC, devicename } = req?.body;
    try {
        const userInfo = await Biouploaduserinfo.findOne({ staffNameC, cloudIDC: devicename }).lean();
        // if (userInfo?.cloudIDC) {
            devicedetails = await BiometricDeviceManagement.findOne({ biometricserialno:devicename }).lean();
        // }

        return res.status(200).json({
            individualuser: userInfo || "",
            devicedetails
        });

    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 500));
    }
})


exports.addUploadUserFromSite = catchAsyncErrors(async (req, res, next) => {

    try {
        let auploaduserfromsite = await Biouploaduserfromsite.create(req.body);
        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Updated!!",
            returnValue: ""
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})


