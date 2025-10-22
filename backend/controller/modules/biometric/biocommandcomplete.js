const Biocommandcomplete = require('../../../model/modules/biometric/biocommandcomplete');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError'); 

exports.getAllBiocommandcomplete = catchAsyncErrors(async (req, res, next) => {
    let allbiocmdcpl;
    try {
        allbiocmdcpl = await Biocommandcomplete.find();
        return res.status(200).json({
            allbiocmdcpl
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})

exports.addCommandComplete = catchAsyncErrors(async (req, res, next) => {

    try {
        let aallbiocmdcpl = await Biocommandcomplete.create(req.body);

        if (aallbiocmdcpl) {
            aallbiocmdcpl.status = "Completed"
            await aallbiocmdcpl.save()
        }

        return res.status(200).json({
            returnStatus: true,
            returnMessage: "Successfully Updated!!",
            returnValue: aallbiocmdcpl,
            status: aallbiocmdcpl.status
        });
    } catch (err) {
        console.log(err)
        return next(new ErrorHandler("Records not found!", 500));
    }
})

