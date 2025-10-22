const Remaindercategory = require('../../model/modules/remaindercategory');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');

// get all Remaindercategory => /api/Remaindercategory

exports.getAllRemaindercategory = catchAsyncErrors(async (req, res, next) => {
    let remaindercategory
    try {
        remaindercategory = await Remaindercategory.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!remaindercategory) {
        return next(new ErrorHandler('category not found', 404));
    }
    // Add serial numbers to the remaindercategory
    const alldoccategory = remaindercategory.map((data, index) => ({
        serialNumber: index + 1,
        ...data.toObject()
    }));

    return res.status(200).json({
        remaindercategory: alldoccategory
    });

})

exports.addRemaindercategory = catchAsyncErrors(async (req, res, next) => {
    await Remaindercategory.create(req.body);
    return res.status(200).json({
        message: 'Successfully added'
    })
})

exports.getSingleRemaindercategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sremaindercategory = await Remaindercategory.findById(id);
    if (!sremaindercategory) {
        return next(new ErrorHandler('Remaindercategory not found'));

    }
    return res.status(200).json({
        sremaindercategory
    });

});

exports.updateRemaindercategory = catchAsyncErrors(async (req, res, next) => {

    const id = req.params.id

    let uremaindercategory = await Remaindercategory.findByIdAndUpdate(id, req.body);

    if (!uremaindercategory) {
        return next(new ErrorHandler('Remaindercategory not found'));
    }
    return res.status(200).json({
        message: 'Update Successfully', uremaindercategory
    });
});



//delete Remaindercategory by id => /api/delticketcateg/:id
exports.deleteRemaindercategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dremaindercategory = await Remaindercategory.findByIdAndRemove(id);
    if (!dremaindercategory) {
        return next(new ErrorHandler('Remaindercategory not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})