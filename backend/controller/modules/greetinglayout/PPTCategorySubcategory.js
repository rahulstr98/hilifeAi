const PPTCategoryAndSubCategory = require("../../../model/modules/greetinglayout/PPTCategory&Subcategory");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

//get All PPTCategoryAndSubCategory =>/api/PPTCategoryAndSubCategory
exports.getAllPPTCategoryAndSubCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        let pptcategoryAndSubCategory = await PPTCategoryAndSubCategory.find();
        if (!pptcategoryAndSubCategory) {
            return next(new ErrorHandler("PPTCategoryAndSubCategory not found!", 404));
        }
        return res.status(200).json({
            pptcategoryAndSubCategory,
        });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});

//create new PPTCategoryAndSubCategory => /api/PPTCategoryAndSubCategory/new
exports.addPPTCategoryAndSubCategory = catchAsyncErrors(async (req, res, next) => {
    let apptcategoryAndSubCategory = await PPTCategoryAndSubCategory.create(req.body);
    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Single PPTCategoryAndSubCategory => /api/PPTCategoryAndSubCategory/:id
exports.getSinglePPTCategoryAndSubCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let spptcategoryAndSubCategory = await PPTCategoryAndSubCategory.findById(id);
    if (!spptcategoryAndSubCategory) {
        return next(new ErrorHandler("PPTCategoryAndSubCategory not found", 404));
    }
    return res.status(200).json({
        spptcategoryAndSubCategory,
    });
});
//update PPTCategoryAndSubCategory by id => /api/PPTCategoryAndSubCategory/:id
exports.updatePPTCategoryAndSubCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let upptcategoryAndSubCategory = await PPTCategoryAndSubCategory.findByIdAndUpdate(id, req.body);
    if (!upptcategoryAndSubCategory) {
        return next(new ErrorHandler("PPTCategoryAndSubCategory not found", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

//delete PPTCategoryAndSubCategory by id => /api/PPTCategoryAndSubCategory/:id
exports.deletePPTCategoryAndSubCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dpptcategoryAndSubCategory = await PPTCategoryAndSubCategory.findByIdAndRemove(id);
    if (!dpptcategoryAndSubCategory) {
        return next(new ErrorHandler("PPTCategoryAndSubCategory not found", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});

exports.PPTCategoryAndSubCategoryAutoId = catchAsyncErrors(async (req, res, next) => {
    let autoid;
    try {
        // Find the last expense category document sorted by _id in descending order
        const lastexpense = await PPTCategoryAndSubCategory.findOne().sort({ _id: -1 });

        // Check if there's any document in the collection
        if (!lastexpense) {
            // If no document found, start with EC0001
            autoid = "EC0001";
        } else {
            // If a document is found, get the last generated autoid
            let lastAutoId = lastexpense.categorycode; // Assuming you have 'autoid' field in the document

            // Extract the numeric part from the last autoid
            let codenum = lastAutoId ? lastAutoId.split("EC")[1] : "0000";
            // Increment the numeric part by 1
            let nextIdNum = parseInt(codenum, 10) + 1;

            // Convert the number back to a string and pad it with leading zeros
            let nextIdStr = String(nextIdNum).padStart(4, "0");

            // Form the next autoid
            autoid = "EC" + nextIdStr;
        }
    } catch (err) {
        return next(new ErrorHandler("Record not found!", 404));
    }

    return res.status(200).json({
        autoid,
    });
});