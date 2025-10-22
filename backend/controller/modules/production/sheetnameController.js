const Sheetname = require('../../../model/modules/production/sheetnameModel');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError'); 

//get All sheetname =>/api/sheetname
exports.getAllSheetname = catchAsyncErrors(async (req, res, next) => {
    let sheetname;
    try {
        sheetname = await Sheetname.find() 
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!sheetname) {
        return next(new ErrorHandler('Timesheet not found!', 404));
    }

    return res.status(200).json({
        sheetname
    });
})


//create new sheetname => /api/sheetname/new
exports.addSheetname = catchAsyncErrors(async (req, res, next) => {
   
    let sheetname = await Sheetname.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single sheetname => /api/sheetname/:id
exports.getSingleSheetname = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sheetname = await Sheetname.findById(id);
    if (!sheetname) {
        return next(new ErrorHandler('Sheet Name not found', 404));
    }
    return res.status(200).json({
        sheetname
    })
})

//update sheetname by id => /api/sheetname/:id
exports.updateSheetname = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sheetname = await Sheetname.findByIdAndUpdate(id, req.body);
    if (!sheetname) {
        return next(new ErrorHandler('Sheet Name not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete sheetname by id => /api/sheetname/:id
exports.deleteSheetname = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sheetname = await Sheetname.findByIdAndRemove(id);
    if (!sheetname) {
        return next(new ErrorHandler('Sheet Name not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})
