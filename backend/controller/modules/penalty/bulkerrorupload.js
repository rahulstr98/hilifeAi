const BulkErrorUploadpoints = require("../../../model/modules/penalty/bulkerrorupload");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All BulkErrorUploadpoints => /api/BulkErrorUploadpoints
exports.getAllBulkErrorUploadpoints = catchAsyncErrors(async (req, res, next) => {
    let bulkerroruploadpoints;
    try {
        bulkerroruploadpoints = await BulkErrorUploadpoints.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!bulkerroruploadpoints) {
        return next(new ErrorHandler("BulkErrorUploadpoints not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        bulkerroruploadpoints,
    });
});

// Create new BulkErrorUploadpoints=> /api/BulkErrorUploadpoints/new
exports.addBulkErrorUploadpoints = catchAsyncErrors(async (req, res, next) => {
    let abulkerroruploadpoints = await BulkErrorUploadpoints.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle bulkerroruploadpoints => /api/bulkerroruploadpoints/:id
exports.getSingleBulkErrorUploadpoints = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let sbulkerroruploadpoints = await BulkErrorUploadpoints.findById(id);

    if (!sbulkerroruploadpoints) {
        return next(new ErrorHandler("BulkErrorUploadpoints not found!", 404));
    }
    return res.status(200).json({
        sbulkerroruploadpoints,
    });
});

// update bulkerroruploadpoints by id => /api/bulkerroruploadpoints/:id
exports.updateBulkErrorUploadpoints = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let ubulkerroruploadpoints = await BulkErrorUploadpoints.findByIdAndUpdate(id, req.body);
    if (!ubulkerroruploadpoints) {
        return next(new ErrorHandler("BulkErrorUploadpoints not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete bulkerroruploadpoints by id => /api/bulkerroruploadpoints/:id
exports.deleteBulkErrorUploadpoints = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dbulkerroruploadpoints = await BulkErrorUploadpoints.findByIdAndRemove(id);

    if (!dbulkerroruploadpoints) {
        return next(new ErrorHandler("BulkErrorUploadpoints not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});


exports.deleteMultipleBulkErrorUpload = catchAsyncErrors(
    async (req, res, next) => {
        const ids = req.body.ids;
        if (!Array.isArray(ids) || ids.length === 0) {
            return next(new ErrorHandler("Invalid IDs provided", 400));
        }

        // Define a batch size for deletion
        // const batchSize = Math.ceil(ids.length / 10);
        const batchSize = 10000;

        // Loop through IDs in batches
        for (let i = 0; i < ids.length; i += batchSize) {
            const batchIds = ids.slice(i, i + batchSize);

            // Delete records in the current batch
            await BulkErrorUploadpoints.deleteMany({ _id: { $in: batchIds } });
        }

        return res
            .status(200)
            .json({ message: "Deleted successfully", success: true });
    }
);


exports.getAllBulkErrorUploadpointsFilter = catchAsyncErrors(async (req, res, next) => {
    let bulkerroruploadpoints;

    try {
        bulkerroruploadpoints = await BulkErrorUploadpoints.find({
            fromdate: { $gte: req.body.fromdate, $lte: req.body.todate }
        }, {});
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!bulkerroruploadpoints) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        bulkerroruploadpoints,
    });
});

exports.getAllBulkErrorUploadpointsFilename = catchAsyncErrors(async (req, res, next) => {
    let bulkerroruploadpoints;

    try {
        bulkerroruploadpoints = await BulkErrorUploadpoints.find({
            filename: { $eq: req.body.filename }
        }, {});
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!bulkerroruploadpoints) {
        return next(new ErrorHandler("BulkErrorUploadpoints not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        bulkerroruploadpoints,
    });
});



exports.getAllBulkErrorIploadUniqid = catchAsyncErrors(async (req, res, next) => {
    let bulkerroruploadpoints, bulkdata;
    try {
        // productionoriginal = await ProductionOriginal.find();
        bulkdata = await BulkErrorUploadpoints.findOne({ filename: { $ne: "nonexcel" } })
            .sort({ createdAt: -1 }) // Sorting in descending order to get the latest entry
            .exec();

        bulkerroruploadpoints = bulkdata && bulkdata.uniqueid;
    } catch (err) {
        return next(new ErrorHandler('Data not found!', 401));

    }
    // if (!productionoriginal) {
    //   return next(new ErrorHandler("Data not found!", 404));
    // }
    return res.status(200).json({
        bulkerroruploadpoints,
    });
});



exports.getAllBulkErrorUploadListFilter = catchAsyncErrors(async (req, res, next) => {
    let bulkerroruploadpoints;
    try {
        const { projectvendor, process, loginid } = req.body;
        let query = {};

        if (projectvendor && projectvendor.length > 0) {
            query.projectvendor = { $in: projectvendor };
        }

        if (process && process.length > 0) {
            query.process = { $in: process };
        }

        if (loginid && loginid.length > 0) {
            query.loginid = { $in: loginid };
        }


        bulkerroruploadpoints = await BulkErrorUploadpoints.find(query);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!bulkerroruploadpoints) {
        return next(new ErrorHandler('Ebreadingdetails not found!', 404));
    }
    return res.status(200).json({
        bulkerroruploadpoints
    });
})


