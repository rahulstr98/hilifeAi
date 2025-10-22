const Employeesignature = require('../../model/login/employeesignature');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');
const User = require('../../model/login/auth');
const TemplatecontrolpanelModel = require('../../model/modules/documents/Templatecontrolpnael')

// get All Employeesignature => /api/employeesignature
exports.getAllEmployeesignature = catchAsyncErrors(async (req, res, next) => {
    let empsignatures;

    try {
        empsignatures = await Employeesignature.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!empsignatures) {
        return next(new ErrorHandler('Employeesignature not found', 400));
    }

    return res.status(200).json({ empsignatures });
})

// get All Employeesignature => /api/employeesignature
exports.getAllPreEmployeesignature = catchAsyncErrors(async (req, res, next) => {
    let empsignatures;

    try {
        empsignatures = await Employeesignature.find({}, { companyname: 1, empcode: 1, commonid: 1, profileimage: 1, type: 1, _id: 1, signatureimage: 1, commonsignatureid: 1 })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!empsignatures) {
        return next(new ErrorHandler('Employeesignature not found', 400));
    }

    return res.status(200).json({ empsignatures });
})

// / register Employeesignature => api/employeesignatures/new
exports.addEmployeesignature = catchAsyncErrors(async (req, res, next) => {
    let employeeSignature = await Employeesignature.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!', employeesignature: employeeSignature
    });
})


// get Single Employeesignature => /api/Employeesignature/:id
exports.getSingleEmployeesignature = catchAsyncErrors(async (req, res, next) => {

    const semployeesignature = await Employeesignature.findById(req.params.id);


    if (!semployeesignature) {
        return next(new ErrorHandler('Employeesignature not found', 404));
    }

    return res.status(200).json({
        success: true,
        semployeesignature
    })
})


// get Single employeeSignature => /api/employeesignaturecommonid/:id
exports.getSingleEmployeeSignatureByCommonid = catchAsyncErrors(async (req, res, next) => {
    // const { commonid } = req.body;
    const { commonsignatureid } = req.body;
    const semployeesignature = await Employeesignature.findOne({ commonsignatureid }, { profileimage: 1, signatureimage: 1 });

    if (!semployeesignature) {
        return res.status(200).json({});
    }

    return res.status(200).json({
        success: true,
        semployeesignature
    })
})


//Individual User to find Signature using companyname
exports.getIndividualUserESignature = catchAsyncErrors(async (req, res, next) => {
    let semployeesignature , tempControlPanel;

    try {
        const { companyname } = req.body;
        const userDetails = await User.findOne({ companyname }, { _id: 1 , company : 1 , branch : 1}).lean();
        if (userDetails) {
            tempControlPanel = await TemplatecontrolpanelModel.findOne({ company : userDetails?.company, branch : userDetails?.branch }, { _id: 1 , fromemail:1 }).lean();
            semployeesignature = await Employeesignature.findOne({ commonsignatureid: userDetails?._id?.toString() }, { profileimage: 1, signatureimage: 1 });
        }

        // if (!semployeesignature) {
        //     return res.status(200).json({});
        // }
    }
    catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        success: true,
        semployeesignature , tempControlPanel
    })
})

// get Single employeeSignature => /api/employeesignaturecommonidwithall
exports.getSingleEmployeeSignatureByCommonidWithAll = catchAsyncErrors(async (req, res, next) => {
    const { commonsignatureid } = req.body;
    const semployeesignature = await Employeesignature.findOne({ commonsignatureid });

    if (!semployeesignature) {
        return next(new ErrorHandler('Employeesignature not found', 404));
    }

    return res.status(200).json({
        success: true,
        semployeesignature
    })
})

// update employeesignatures by id => /api/employeesignature/:id
exports.updateEmployeesignature = catchAsyncErrors(async (req, res, next) => {

    const id = req.params.id;

    const updateemployeesignature = await Employeesignature.findByIdAndUpdate(id, req.body);

    if (!updateemployeesignature) {
        return next(new ErrorHandler('Employeesignature not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully!' })
})

// delete EmployeeSignature by id => /api/employeesignature/:id
exports.deleteEmployeesignature = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    const dempsignature = await Employeesignature.findByIdAndRemove(id);

    if (!dempsignature) {
        return next(new ErrorHandler('Employeesignature not found', 404));
    }

    res.status(200).json({ message: 'Deleted successfully' })
})

exports.getAllEmployeesignatureProfile = catchAsyncErrors(async (req, res, next) => {
    let empsignatures;

    try {
        empsignatures = await Employeesignature.find({}, { profileimage: 1, commonid: 1, commonsignatureid: 1, signatureimage: 1, })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!empsignatures) {
        return next(new ErrorHandler('Employeesignature not found', 400));
    }

    return res.status(200).json({ empsignatures });
})

// get Single employeeSignature => /api/employeesignaturecommonidwithallnew
exports.getSingleEmployeeSignatureByCommonidWithAllnew = catchAsyncErrors(async (req, res, next) => {
    const { commonsignatureid } = req.body;
    const semployeesignature = await Employeesignature.findOne({ commonsignatureid }, { profileimage: 1, files: 1, signatureimage: 1 });
    if (!semployeesignature) {
        return res.status(200).json({});
    }

    return res.status(200).json({
        success: true,
        semployeesignature
    })
})

//employee signatures 
exports.getAllEmployeeSignaturesforidcard = catchAsyncErrors(async (req, res, next) => {
    let empsignatures;

    try {
        empsignatures = await Employeesignature.find({}, { commonid: 1, profileimage: 1, _id: 1, signatureimage: 1, commonsignatureid: 1 })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!empsignatures) {
        return next(new ErrorHandler('Employeesignature not found', 400));
    }

    return res.status(200).json({ empsignatures });
})
