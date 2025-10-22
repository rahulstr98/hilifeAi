const Termsandcondition = require("../../model/modules/TermsandconditionModel");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const TemplateCreation = require("../../model/modules/TemplateCreationModel");
const DocumentPreparation = require("../../model/modules/documentpreparation");


// get All Termsandcondition Name => /api/termsandcondition
exports.getAllTermsandcondition = catchAsyncErrors(async (req, res, next) => {
    let termsandcondition;
    try {
        termsandcondition = await Termsandcondition.find().lean();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!termsandcondition) {
        return next(new ErrorHandler("Termsandcondition not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        termsandcondition,
    });
});


// Delete Terms and condtions
exports.getOverallDeleteTermsConditions = catchAsyncErrors(async (req, res, next) => {
    let template, document;
    try {

        template = await TemplateCreation.find({
            termsAndConditons: { $in: [req.body.id] }
        }, { _id: 1, termsAndConditons: 1 }).lean();
        document = await DocumentPreparation.find({
            termsAndConditons: { $in: [req.body.id] }
        }, { _id: 1, termsAndConditons: 1 }).lean();

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        count: template.length + document?.length, template, document
    });
});


// Bulk Delete for Terms & Conditions 
exports.getOverallBulkDeleteTermsConditions = catchAsyncErrors(async (req, res, next) => {
    let template, document, result, count;
    let id = req.body.id;
    try {
        template = await TemplateCreation.find({
            termsAndConditons: { $in: id }
        }, { _id: 1, termsAndConditons: 1 }).lean();
        document = await DocumentPreparation.find({
            termsAndConditons: { $in: id }
        }, { _id: 1, termsAndConditons: 1 }).lean();

        const templateCreation = template?.flatMap(data => data?.termsAndConditons);
        const documentPrep = document?.flatMap(data => data?.termsAndConditons);
        const duplicateId = [...templateCreation , ...documentPrep];

        result = id?.filter(data => !duplicateId?.includes(data));
        count = id?.filter(data => !duplicateId?.includes(data))?.length;

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        count: count,
        result
    });
});



// Edit for Terms & Conditions in Template Creation
exports.getOverallEditTermsTemplate = catchAsyncErrors(async (req, res, next) => {
    let template, document, result, count;
    let id = req.body.id;
    try {

        document = await DocumentPreparation.find({
            termsAndConditons: { $in: id } , template : req.body.template
        }, { _id: 1, termsAndConditons: 1 }).lean();

        const documentPrep = document?.flatMap(data => data?.termsAndConditons);
        const duplicateId = [...documentPrep];

        result = id?.filter(data => !duplicateId?.includes(data));
        count = id?.filter(data => !duplicateId?.includes(data))?.length;

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        count: count,
        result,document
    });
})





// Create new Termsandcondition=> /api/termsandcondition/new
exports.addTermsandcondition = catchAsyncErrors(async (req, res, next) => {
    // let checkloc = await Termsandcondition.findOne({ name: req.body.name });

    // if (checkloc) {
    //     return next(new ErrorHandler("Name already exist!", 400));
    // }

    let atermsandcondition = await Termsandcondition.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle Termsandcondition => /api/termsandcondition/:id
exports.getSingleTermsandcondition = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let stermsandcondition = await Termsandcondition.findById(id);

    if (!stermsandcondition) {
        return next(new ErrorHandler("Termsandcondition Name not found!", 404));
    }
    return res.status(200).json({
        stermsandcondition,
    });
});

// update Termsandcondition by id => /api/termsandcondition/:id
exports.updateTermsandcondition = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let utermsandcondition = await Termsandcondition.findByIdAndUpdate(id, req.body);
    if (!utermsandcondition) {
        return next(new ErrorHandler("Termsandcondition Name not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete Termsandcondition by id => /api/termsandcondition/:id
exports.deleteTermsandcondition = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dtermsandcondition = await Termsandcondition.findByIdAndRemove(id);

    if (!dtermsandcondition) {
        return next(new ErrorHandler("Termsandcondition Name not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});