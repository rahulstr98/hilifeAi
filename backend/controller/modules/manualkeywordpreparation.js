const ManualKeywordsPreparation = require("../../model/modules/manualkeywordpreparation");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
// get All ManualKeywordsPreparation  => /api/manualkeywordpreparations
exports.getAllManualKeywordsPreparation = catchAsyncErrors(async (req, res, next) => {
    let manualkeywordpreparation;
    try {
        manualkeywordpreparation = await ManualKeywordsPreparation.find().lean();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        manualkeywordpreparation,
    });
});

// Create new ManualKeywordsPreparation=> /api/manualkeywordpreparation/new
// exports.addManualKeywordsPreparation = catchAsyncErrors(async (req, res, next) => {
//     let amanualkeywordpreparation = await ManualKeywordsPreparation.create(req.body);

//     return res.status(200).json({
//         message: "Successfully added!",
//     });
// });


exports.addManualKeywordsPreparation = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log(req?.body, "Hitted Successffully")
        // Parse stringified objects if necessary
        console.log(req.body.headings, req.body.addedby, "req.body.headings")
        let addedby = [];
        let headings = [];
        if (req.body.addedby) {
            addedby = JSON.parse(req.body.addedby); // because we sent as string from frontend
        }
        if (req.body.headings) {
            headings = JSON.parse(req.body.headings); // because we sent as string from frontend
        }

        // Build the object for MongoDB
        const manualKeywordData = {
            keywordname: req.body.keywordname,
            value: req.body.value,
            description: req.body.description,
            previewdocument: req.body.previewdocument,
            addedby: addedby,
            headings: headings,
            numberingstyle: req.body.numberingstyle,
        };

        // If file was uploaded, add file details
        if (req.file) {
            manualKeywordData.file = {
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size,
            };
        }

        let amanualkeywordpreparation = await ManualKeywordsPreparation.create(manualKeywordData);

        return res.status(200).json({
            message: "Successfully added!",
            data: amanualkeywordpreparation,
        });
    } catch (err) {
        next(err);
    }
});


// get Signle ManualKeywordsPreparation => /api/manualkeywordpreparation/:id
exports.getSingleManualKeywordsPreparation = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let smanualkeywordpreparation = await ManualKeywordsPreparation.findById(id);

    if (!smanualkeywordpreparation) {
        return next(new ErrorHandler("Manual keywords Preparation not found!", 404));
    }
    return res.status(200).json({
        smanualkeywordpreparation,
    });
});

// update ManualKeywordsPreparation by id => /api/manualkeywordpreparation/:id
// exports.updateManualKeywordsPreparation = catchAsyncErrors(async (req, res, next) => {
//     const id = req.params.id;
//     let umanualkeywordpreparation = await ManualKeywordsPreparation.findByIdAndUpdate(id, req.body);
//     if (!umanualkeywordpreparation) {
//         return next(new ErrorHandler("Manual Keyword Preparation not found!", 404));
//     }
//     return res.status(200).json({ message: "Updated successfully" });
// });


exports.updateManualKeywordsPreparation = catchAsyncErrors(async (req, res, next) => {
    try {
        const id = req.params.id;

        // Parse stringified objects if necessary
        let updatedby = [];
        let headings = [];
        if (req.body.updatedby) {
            updatedby = JSON.parse(req.body.updatedby); // parse if sent as string
        }

        if (req.body.headings) {
            headings = JSON.parse(req.body.headings); // because we sent as string from frontend
        }

        // Build object for update
        const manualKeywordData = {
            keywordname: req.body.keywordname,
            value: req.body.value,
            description: req.body.description,
            updatedby: updatedby,
            previewdocument: req.body.previewdocument,
            headings: headings,
            numberingstyle: req.body.numberingstyle,
            file: req.body.oldfile ? JSON.parse(req.body.oldfile) : ""
        };
        // console.log(req.body.deletefileName,req.file)
        // If file was uploaded, add file details
        if (req.file) {
            manualKeywordData.file = {
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size,
            };
        }
        if (req.body.deletefileName) {
            const filePath = path.join(process.cwd(), "ManualDocumentPreparation", req.body.deletefileName);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error deleting file:", err.message);
                } else {
                    console.log("Old file deleted:", filePath);
                    // manualKeywordData.file = "";
                }
            });
        }

        // console.log(manualKeywordData, "Manual KeyWord");
        let umanualkeywordpreparation = await ManualKeywordsPreparation.findByIdAndUpdate(
            id,
            manualKeywordData,
            { new: true, runValidators: true }
        );

        if (!umanualkeywordpreparation) {
            return next(new ErrorHandler("Manual Keyword Preparation not found!", 404));
        }

        return res.status(200).json({
            message: "Updated successfully",
            // data: umanualkeywordpreparation,
        });
    } catch (err) {
        console.log(err, 'err')
        next(err);
    }
});


// delete ManualKeywordsPreparation by id => /api/manualkeywordpreparation/:id
exports.deleteManualKeywordsPreparation = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dmanualkeywordpreparation = await ManualKeywordsPreparation.findByIdAndRemove(id);

    if (!dmanualkeywordpreparation) {
        return next(new ErrorHandler("Manual Keyword Preparation not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});