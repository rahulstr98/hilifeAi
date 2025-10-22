const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError'); 

//get All Leavetype =>/api/Leavetype
exports.getBiometricTestStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        return res.status(200).json({
            returnStatus :true,
            returnMessage:"Successfully connected!!!",
            returnValue:""
            
        }); 
    } catch (err) {
        return next(new ErrorHandler("👎 Connection not found!", 500));
    }
    
})
