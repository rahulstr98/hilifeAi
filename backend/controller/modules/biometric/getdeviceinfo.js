const Biogetdeviceinfo = require('../../../model/modules/biometric/getdeviceinfo');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Biouploaduserfromsite = require('../../../model/modules/biometric/uploaduserfromsite');
const Biouploaduserinfo = require('../../../model/modules/biometric/uploaduserinfo');
exports.getAllDeviceinfo = catchAsyncErrors(async (req, res, next) => {
    let alldeviceinfo;
    try {
        const { cloudIDC, totalManagerN, totalUserN, totalFaceN, totalFPN, totalCardN, totalPWDN } = req?.body;
        alldeviceinfo = await Biogetdeviceinfo.find(cloudIDC, totalManagerN, totalUserN, totalFaceN, totalFPN, totalCardN, totalPWDN);

        return res.status(200).json({
            alldeviceinfo
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
});


exports.getDeviceinfoFromSite = catchAsyncErrors(async (req, res, next) => {
    try {

        const { cloudIDC, oldusercheck } = req.body;

        if (!cloudIDC) {
            return res.status(400).json({
                success: false,
                message: "CloudIDC is required",
            });
        }

        const alldeviceinfo = await Biogetdeviceinfo.findOne({ cloudIDC });
        let countFinal = 0; // Declare global variable

        const findMissingBiometricID = async () => {
            const users = await Biouploaduserinfo.aggregate([
                {
                    $match: {
                        cloudIDC: req?.body.cloudIDC,
                    }
                },
                {
                    $addFields: { numericBiometricUserIDC: { $toInt: "$biometricUserIDC" } } // Convert to number
                },
                {
                    $sort: { numericBiometricUserIDC: 1 }
                },
                {
                    $project: { _id: 0, numericBiometricUserIDC: 1 }
                }
            ]);

            const ids = users.map(user => user.numericBiometricUserIDC);

            for (let i = 1; i <= Math.max(...ids); i++) {
                if (!ids.includes(i)) {
                    countFinal = i; // Update countFinal
                    return i;
                }
            }

            countFinal = Math.max(...ids) + 1; // Update countFinal if no missing number
            return countFinal;
        };
        countFinal = await findMissingBiometricID();




        if (!alldeviceinfo) {
            return res.status(404).json({
                success: false,
                message: "No device info found",
            });
        }

        let count = alldeviceinfo ? ((alldeviceinfo?.totalUserN + 1 > countFinal) ? countFinal : alldeviceinfo?.totalUserN + 1) : 0
        console.log(alldeviceinfo, countFinal, count, (count + 1 > countFinal) ? countFinal : count + 1)
        return res.status(200).json({
            success: true,
            message: "Success",
            alldeviceinfo: count,
        });
    } catch (err) {
        console.log(err, 'err')
        return next(new ErrorHandler("Records not found!", 500));
    }
});




exports.addDeviceinfo = catchAsyncErrors(async (req, res, next) => {

    try {
        let addattalog = await Biogetdeviceinfo.create(req.body);
        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Updated!!",
            returnValue: ""
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})
