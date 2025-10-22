const Assignworkfromhome = require('../../model/modules/assignworkfromhome');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');
//get All Assignworkfromhome =>/api/Assignworkfromhome
exports.getAllAssignworkfromhome = catchAsyncErrors(async (req, res, next) => {
    let assignworkfromhomes;
    try {
        assignworkfromhomes = await Assignworkfromhome.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!assignworkfromhomes) {
        return next(new ErrorHandler('Assignworkfromhome not found!', 404));
    }
    return res.status(200).json({
        assignworkfromhomes
    });
})


//create new Assignworkfromhome => /api/Assignworkfromhome/new
exports.addAssignworkfromhome = catchAsyncErrors(async (req, res, next) => {

    let aAssignworkfromhome = await Assignworkfromhome.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });

})

// get Single Assignworkfromhome => /api/Assignworkfromhome/:id
exports.getSingleAssignworkfromhome = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sassignworkfromhome = await Assignworkfromhome.findById(id);
    if (!sassignworkfromhome) {
        return next(new ErrorHandler('Assignworkfromhome not found', 404));
    }
    return res.status(200).json({
        sassignworkfromhome
    })
})
//update Assignworkfromhome by id => /api/Assignworkfromhome/:id
exports.updateAssignworkfromhome = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let uassignworkfromhome = await Assignworkfromhome.findByIdAndUpdate(id, req.body);
    if (!uassignworkfromhome) {
        return next(new ErrorHandler('Assignworkfromhome not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})
//delete Assignworkfromhome by id => /api/Assignworkfromhome/:id
exports.deleteAssignworkfromhome = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dassignworkfromhome = await Assignworkfromhome.findByIdAndRemove(id);
    if (!dassignworkfromhome) {
        return next(new ErrorHandler('Assignworkfromhome not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})