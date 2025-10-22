const Typemasterdocument = require('../../../model/modules/documents/typemasterdocument');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const DocumentCategory = require('../../../model/modules/documents/documentcategory');
const AssignDocumnent = require("../../../model/modules/documents/assigndocuments");
const Document = require('../../../model/modules/documents/adddocument');

//get All Typemasterdocument =>/api/Typemasterdocument
exports.getAllTypemasterdocument = catchAsyncErrors(async (req, res, next) => {
    let typemasterdouments;
    try {
        typemasterdouments = await Typemasterdocument.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!typemasterdouments) {
        return next(new ErrorHandler('Typemasterdocument not found!', 404));
    }
    return res.status(200).json({
        typemasterdouments
    });
})



//get All Linked Overall Edit Find  =>/api/typemasterdocoveralledit
exports.getAllTypeMasterDocOverallEdit = catchAsyncErrors(async (req, res, next) => {
    let docCategory, assignDoc, addDoc;
    let { oldname } = req?.body;
    try {
        docCategory = await DocumentCategory.find({ typemastername: { $in: oldname } })
        assignDoc = await AssignDocumnent.find({ type: oldname })
        addDoc = await Document.find({ type: oldname })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        count: docCategory?.length + assignDoc.length + addDoc?.length,
        docCategory, assignDoc, addDoc
    });
})

exports.getAllTypeMasterDocOverallDelete = catchAsyncErrors(async (req, res, next) => {
    let selfcheck, anscheck, refcategory, result, count;
        let docCategory, assignDoc, addDoc;

    let id = req.body.id;

    try {

        docCategory = await Typemasterdocument.find();
        const answer = docCategory?.filter(data => id?.includes(data._id?.toString()))
        
        
        selfcheck = await DocumentCategory.find()
        assignDoc = await AssignDocumnent.find()
        addDoc = await Document.find()


        docCategory = answer.filter(answers => selfcheck?.some(data =>
            data.typemastername?.includes(answers?.name)))?.map(data => data._id?.toString());
        anscheck = answer.filter(answers => assignDoc?.some(data =>
            data.type === answers?.name))?.map(data => data._id?.toString());
        refcategory = answer.filter(answers => addDoc?.some(data =>
            data.type === answers?.name))?.map(data => data._id?.toString());

        const duplicateId = [...docCategory , ...refcategory , ...anscheck]


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

//create new Typemasterdocument => /api/Typemasterdocument/new
exports.addTypemasterdocument = catchAsyncErrors(async (req, res, next) => {

    let aTypemasterdocument = await Typemasterdocument.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single Typemasterdocument => /api/Typemasterdocument/:id
exports.getSingleTypemasterdocument = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let stypemasterdocument = await Typemasterdocument.findById(id);
    if (!stypemasterdocument) {
        return next(new ErrorHandler('Typemasterdocument not found', 404));
    }
    return res.status(200).json({
        stypemasterdocument
    })
})

//update Typemasterdocument by id => /api/Typemasterdocument/:id
exports.updateTypemasterdocument = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let utypemasterdocument = await Typemasterdocument.findByIdAndUpdate(id, req.body);
    if (!utypemasterdocument) {
        return next(new ErrorHandler('Typemasterdocument not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete Typemasterdocument by id => /api/Typemasterdocument/:id
exports.deleteTypemasterdocument = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dtypemasterdocument = await Typemasterdocument.findByIdAndRemove(id);
    if (!dtypemasterdocument) {
        return next(new ErrorHandler('Typemasterdocument not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})