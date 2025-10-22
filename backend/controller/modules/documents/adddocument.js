const Document = require('../../../model/modules/documents/adddocument');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const multer = require('multer');
const path = require('path');

const AssignDocument = require("../../../model/modules/documents/assigndocuments");


exports.getAllDocument = catchAsyncErrors(async (req, res, next) => {
    let document
    try {
        document = await Document.find({}, { categoryname: 1, subcategoryname: 1, type: 1, module: 1, customer: 1, queue: 1, process: 1, form: 1, addedby: 1, updatedby: 1, _id: 1, document: 1, });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!document) {
        return next(new ErrorHandler('Document not found', 404));
    }
    // Add serial numbers to the doccategory
    const alldoccategory = document.map((data, index) => ({
        serialNumber: index + 1,
        ...data.toObject()
    }));

    return res.status(200).json({
        document: alldoccategory
    });

});




exports.getAllDocumentFilter = catchAsyncErrors(async (req, res, next) => {
    let document;

    const { category, type, subcategory, module } = req.body;
    try {

        let query = {
            type: type,
            categoryname: { $in: category },
            
        };
        
        // Include module only if its length is greater than 1
        if (module.length > 0) {
            query.module = { $in: module };
        }
             if (subcategory.length > 0 && !subcategory?.includes("ALL")) {
            query.subcategoryname = { $in: subcategory };
        }

        document =await Document.find(query, {
                categoryname: 1, subcategoryname: 1, type: 1,
                module: 1, customer: 1, queue: 1, process: 1, form: 1, addedby: 1,
                updatedby: 1, _id: 1, document: 1,
            }).lean();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        document
    });

})


exports.getFilterAllDocument = catchAsyncErrors(async (req, res, next) => {
    let document = [];
    try {
        document = req.body.subcategoryname?.includes("ALL") ? await Document.find({ type: req.body.type, categoryname: { $in: req.body.categoryname } }, { categoryname: 1, subcategoryname: 1, type: 1, module: 1, customer: 1, queue: 1, process: 1, form: 1, _id: 1, }) : 
await Document.find({ type: req.body.type, categoryname: { $in: req.body.categoryname }, subcategoryname: { $in: req.body.subcategoryname } }, { categoryname: 1, subcategoryname: 1, type: 1, module: 1, customer: 1, queue: 1, process: 1, form: 1, _id: 1, });;

        // Add serial numbers to the doccategory
        const alldoccategory = document.map((data, index) => ({
            serialNumber: index + 1,
            ...data.toObject()
        }));

        return res.status(200).json({
            document: alldoccategory
        });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

})
exports.getAllassignedDocument = catchAsyncErrors(async (req, res, next) => {
    try {
        const [documents, assignedDocs] = await Promise.all([
            Document.find({}, { categoryname: 1, subcategoryname: 1, type: 1, module: 1, customer: 1, queue: 1, process: 1, form: 1, addedby: 1, updatedby: 1, _id: 1, }),
            AssignDocument.find({ employeedbid: req.body.userid }) // Corrected model name and query syntax
        ]);
        return res.status(200).json({
            documents,
            assignedDocs
        });
    } catch (err) {

        return next(new ErrorHandler("Records not found!", 404));
    }
});
exports.getAllDocumentTraining = catchAsyncErrors(async (req, res, next) => {
    let document
    try {
        document = await Document.find({ type: "Quickclaim Document" }, { type: 1, module: 1, customer: 1, queue: 1, process: 1, createdAt: 1, form: 1, })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!document) {
        return next(new ErrorHandler('Document not found', 404));
    }
    // Add serial numbers to the doccategory
    const alldoccategory = document.map((data, index) => ({
        serialNumber: index + 1,
        ...data.toObject()
    }));

    return res.status(200).json({
        document: alldoccategory
    });

})

exports.getFiltertrainingDocument = catchAsyncErrors(async (req, res, next) => {
    let document
    try {
        document = await Document.find({
            type: "Quickclaim Document", module: req.body.module, customer: req.body.customer,

            queue: req.body.queue, process: req.body.process
        }, {})
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!document) {
        return next(new ErrorHandler('Document not found', 404));
    }
    // Add serial numbers to the doccategory
    const alldoccategory = document.map((data, index) => ({
        serialNumber: index + 1,
        ...data.toObject()
    }));

    return res.status(200).json({
        document: alldoccategory
    });

})

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'documents/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /\.(xlsx|xls|csv|pdf|txt)$/;
    const allowedMimeTypes = /^(application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/csv|application\/pdf|text\/plain)$/;

    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only Documents are allowed'));
    }
};

// Initialize multer with the storage engine and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});



exports.addDocument =
    [
        upload.array('document'), // Change to handle multiple files
        catchAsyncErrors(async (req, res, next) => {
            try {
                // Prepare an array to hold the document details
                const document = req.files.map(file => ({
                    name: file.filename,
                    path: file.path,
                    size: file.size,
                }));

                // Create document details including other form data
                const documentDetails = {
                    document, // Store all documents
                    ...req.body,
                };

                await Document.create(documentDetails);
                return res.status(200).json({
                    message: 'Successfully added',
                    documents: documentDetails // Optionally return the document details
                });
            } catch (err) {
                return next(new ErrorHandler("Records not found!", 404));
            }
        })
    ];



exports.getSingleDocument = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let sdocument = await Document.findById(id);

    if (!sdocument) {
        return next(new ErrorHandler('Document not found'));

    }
    return res.status(200).json({
        sdocument
    });

});

exports.updateDocument = [upload.array('document'), catchAsyncErrors(async (req, res, next) => {
    let udocument;

    if (req.files?.length > 0) {
        const documentMap = req.files.map(file => ({
            name: file.filename,
            path: file.path,
            size: file.size,
        }));

        const id = req.params.id
        let sdocument = await Document.findById(id);
        let documentdRemain = sdocument?.document?.filter(data => req?.body?.documentsfile?.includes(data?.name))
        let document = [...documentdRemain, ...documentMap];
        const documentDetails = {
            // Store all documents
            ...req.body,
            document: req.files?.length > 0 ? document : [],
            documentstext: req.body.documentstext ? req.body.documentstext : [],
        };


        udocument = await Document.findByIdAndUpdate(id, documentDetails);
    }
    if (req.files?.length === undefined || req.files?.length < 1) {
        const id = req.params.id;

        const documentDetails = {
            ...req.body,
            document: [],
            documentstext: req.body.documentstext ? req.body.documentstext : [],
        };
        udocument = await Document.findByIdAndUpdate(id, documentDetails);
    }


    if (!udocument) {
        return next(new ErrorHandler('Document not found'));
    }
    return res.status(200).json({
        message: 'Update Successfully', udocument
    });
})];



//delete ujobopening by id => /api/jobopening/:id
exports.deleteDocument = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let ddocument = await Document.findByIdAndRemove(id);
    if (!ddocument) {
        return next(new ErrorHandler('Document not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})


// get overall delete functionlity
exports.getAllDocumentcategoryCheck = catchAsyncErrors(async (req, res, next) => {
    let documnetcat, assigndocument;
    try {
        let query = {
            categoryname: req.body.checkcat,
        };
        let queryAssign = {
            categoryname: req.body.checkcat,
            type: { $nin: ["Quickclaim Document"] }
        };
        documnetcat = await Document.find(query, {
            categorycode: 1,
            _id: 1,
        });
        assigndocument = await AssignDocument.find(queryAssign, {
            categoryname: 1,
            _id: 1,
        });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!documnetcat && !assigndocument) {
        return next(new ErrorHandler("Document not found!", 404));
    }
    return res.status(200).json({
        documnetcat, assigndocument
    });
});


