const Biouploadtemplateinfo = require('../../../model/modules/biometric/uploadusertemplateinfo');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError'); 

exports.getAllUploadtemplateUserInfo = catchAsyncErrors(async (req, res, next) => {
    let alluploadusertmpinfo;
    try {
        alluploadusertmpinfo = await Biouploadtemplateinfo.find();

        return res.status(200).json({
            alluploadusertmpinfo
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})


exports.addUploadUserTemplateInfo = catchAsyncErrors(async (req, res, next) => {
    
  try{
    let auploadusertmpinfo = await Biouploadtemplateinfo.create(req.body);
    return res.status(200).json({
        returnStatus : true,
        returnMessage:"Successfully Updated!!",
        returnValue:""
    });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
})

exports.getpendingUserTemplateDownlod = catchAsyncErrors(async (req, res, next) => {
    
    try{
      return res.status(200).json({
          returnStatus : true,
          returnMessage:"Successfully Updated!!",
          returnValue:req.body
      });
  
      } catch (err) {
          return next(new ErrorHandler("Records not found!", 500));
      }
  })

 

  exports.getDownloadUserTemplate = catchAsyncErrors(async (req, res, next) => {
    
    try{
      return res.status(200).json({
          returnStatus : true,
          returnMessage:"Successfully Updated!!",
          returnValue:req.body
      });
  
      } catch (err) {
          return next(new ErrorHandler("Records not found!", 500));
      }
  })
