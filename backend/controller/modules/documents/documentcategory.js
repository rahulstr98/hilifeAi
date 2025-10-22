const DocumentCategory = require('../../../model/modules/documents/documentcategory');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Document = require('../../../model/modules/documents/adddocument');
const AssignDocumnent = require("../../../model/modules/documents/assigndocuments");
// get all documentscategory => /api/documencategories

exports.getAllDocCategory = catchAsyncErrors(async (req, res, next) => {
    let doccategory
    try {
        doccategory = await DocumentCategory.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!doccategory) {
        return next(new ErrorHandler('category not found', 404));
    }
    // Add serial numbers to the doccategory
    const alldoccategory = doccategory.map((data, index) => ({
        serialNumber: index + 1,
        ...data.toObject()
    }));

    return res.status(200).json({
        doccategory: alldoccategory
    });

})


exports.addDocCategory = catchAsyncErrors(async (req, res, next) => {
    await DocumentCategory.create(req.body);
    return res.status(200).json({
        message: 'Successfully added'
    })
})

exports.getSingleDocCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sdoccategory = await DocumentCategory.findById(id);
    if (!sdoccategory) {
        return next(new ErrorHandler('document not found'));

    }
    return res.status(200).json({
        sdoccategory
    });

});

exports.updateDocCategory = catchAsyncErrors(async (req, res, next) => {

    const id = req.params.id

    let udoccategory = await DocumentCategory.findByIdAndUpdate(id, req.body);

    if (!udoccategory) {
        return next(new ErrorHandler('document not found'));
    }
    return res.status(200).json({
        message: 'Update Successfully', udoccategory
    });
});



//delete ujobopening by id => /api/jobopening/:id
exports.deleteocumentCategory = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let ddoccategory = await DocumentCategory.findByIdAndRemove(id);
    if (!ddoccategory) {
        return next(new ErrorHandler('company not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})

exports.getOverAllEditDocuments = catchAsyncErrors(async (req, res, next) => {
    let documentsall, assignDocument, query, documents, docindex
    try {

        documentsall = await Document.find({}, {});
        const assDocument = await AssignDocumnent.find({ type: { $nin: ["Quickclaim Document"] } }, {});

        documents = documentsall.filter(item => item.categoryname?.includes(req.body.oldname))
        assignDocument = assDocument.filter(item => item.categoryname?.includes(req.body.oldname))
        // docindex = documentsall.findIndex(item => req.body.oldnamesub.includes(item.subcategoryname));

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }


    return res.status(200).json({
        count: documents.length + assignDocument.length,

        documents, assignDocument
    });
});





// get overall Bulk delete functionlity
exports.getAllOverallBulDeleteCategory = catchAsyncErrors(async (req, res, next) => {
    let selfcheck, anscheck, refcategory, result, count;
    let id = req.body.id;

    try {

        anscheck = await DocumentCategory.find();
        const answer = anscheck?.filter(data => id?.includes(data._id?.toString()))
        selfcheck = await Document.find()


        const selfch = answer.filter(answers => selfcheck?.some(data =>
            data.categoryname?.includes(answers?.categoryname) &&
            (data.subcategoryname?.includes("ALL") ? true : answers?.subcategoryname?.some(item => data.subcategoryname?.includes(item)))
        )
        )?.map(data => data._id?.toString());

        const duplicateId = [...selfch]


        result = id?.filter(data => !duplicateId?.includes(data))
        count = id?.filter(data => !duplicateId?.includes(data))?.length


    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        count: count,
        result
    });
})



