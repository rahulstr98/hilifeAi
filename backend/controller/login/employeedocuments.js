const EmployeeDocuments = require('../../model/login/employeedocuments');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');
const fs = require('fs');
const path = require('path');

// get All EmployeeDocuments => /api/employeedocuments
exports.getAllEmployeeDocuments = catchAsyncErrors(async (req, res, next) => {
    let alldocuments;

    try {
        alldocuments = await EmployeeDocuments.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!alldocuments) {
        return next(new ErrorHandler('EmployeeDocuments not found', 400));
    }

    return res.status(200).json({ alldocuments });
})

// get All EmployeeDocuments => /api/employeedocuments
exports.getAllPreEmployeeDocuments = catchAsyncErrors(async (req, res, next) => {
    let alldocuments;

    try {
        alldocuments = await EmployeeDocuments.find({}, { companyname: 1, empcode: 1, commonid: 1, profileimage: 1, type: 1, _id: 1 })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!alldocuments) {
        return next(new ErrorHandler('EmployeeDocuments not found', 400));
    }

    return res.status(200).json({ alldocuments });
})

// / register employeeDocument => api/employeedocuments/new
// exports.addEmployeeDocuments = catchAsyncErrors( async (req, res, next) =>{
//     let employeeDocument = await EmployeeDocuments.create(req.body);
//     return res.status(200).json({
//         message: 'Successfully added!',employeedocument:employeeDocument
//     });
// })


exports.addEmployeeDocuments = catchAsyncErrors(async (req, res, next) => {
    console.log(JSON.parse(req?.body.addedby), "req?.body")
    try {
        const {
            empcode,
            commonid,
            companyname,
            type,
            addedby,
            name,
            data,
            remark,
            profileimage // received as plain string from body
        } = req.body;

        const query = {};

        if (empcode) query.empcode = empcode;
        if (commonid) query.commonid = commonid;
        if (companyname) query.companyname = companyname;
        if (type) query.type = type;
        if (profileimage) query.profileimage = profileimage;

        const filesMeta = (req.files || []).map((file, index) => ({
            path: file.path,
            originalname: file.originalname,
            filename: file.filename,
            name: Array.isArray(name) ? name[index] : name,
            //   data: Array.isArray(data) ? data[index] : data,
            remark: Array.isArray(remark) ? remark[index] : remark
        }));

        const employeeDocument = await EmployeeDocuments.create({
            ...query, // already string
            addedby: JSON.parse(addedby),
            files: filesMeta,
        });

        return res.status(200).json({
            message: 'Successfully added!',
            employeedocument: employeeDocument
        });
    } catch (err) {
        console.log(err, 'err')
        return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});


// get Single employeeDocument => /api/employeedocument/:id
exports.getSingleEmployeeDocument = catchAsyncErrors(async (req, res, next) => {

    const semployeedocument = await EmployeeDocuments.findById(req.params.id);


    if (!semployeedocument) {
        return next(new ErrorHandler('EmployeeDocuments not found', 404));
    }

    return res.status(200).json({
        success: true,
        semployeedocument
    })
})


// get Single employeeDocument => /api/employeedocumentcommonid/:id
exports.getSingleEmployeeDocumentByCommonid = catchAsyncErrors(async (req, res, next) => {
    const { commonid } = req.body;
    const semployeedocument = await EmployeeDocuments.findOne({ commonid }, { profileimage: 1 });

    if (!semployeedocument) {
        return res.status(200).json({});
    }

    return res.status(200).json({
        success: true,
        semployeedocument
    })
})

// get Single employeeDocument => /api/employeedocumentcommonidwithall
exports.getSingleEmployeeDocumentByCommonidWithAll = catchAsyncErrors(async (req, res, next) => {
    const { commonid } = req.body;
    const semployeedocument = await EmployeeDocuments.findOne({ commonid });

    if (!semployeedocument) {
        return next(new ErrorHandler('EmployeeDocuments not found', 404));
    }

    return res.status(200).json({
        success: true,
        semployeedocument
    })
})

// update employeedocumentswithoutmulter by id => /api/employeedocument/:id
exports.updateEmployeeDocumentWithoutMulter = catchAsyncErrors(async (req, res, next) => {

    const id = req.params.id;

    const updateemployeedocument = await EmployeeDocuments.findByIdAndUpdate(id, req.body);

    if (!updateemployeedocument) {
        return next(new ErrorHandler('EmployeeDocuments not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully!' })
})


const uploadDir = path.join(__dirname, '../../EmployeeUserDocuments');
exports.updateEmployeeDocument = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    try {
        const {
            empcode,
            commonid,
            companyname,
            type,
            addedby,
            name,
            remark,
            oldFiles,
            updatedby,
            deleteFileNames,
            profileimage // String (optional)
        } = req.body;


        const query = {};
        if (empcode) query.empcode = empcode;
        if (commonid) query.commonid = commonid;
        if (companyname) query.companyname = companyname;
        if (type) query.type = type;
        if (profileimage) query.profileimage = profileimage;
        // console.log(req?.body?.oldFiles, "req?.body")
        const parsedUpdatedBy = typeof updatedby === 'string' ? JSON.parse(updatedby) : updatedby;
        const parsedOldFiles = typeof oldFiles === 'string' ? JSON.parse(oldFiles) : oldFiles;
        const parseddeleteFileNames = typeof deleteFileNames === 'string' ? JSON.parse(deleteFileNames) : deleteFileNames;
        if (Array.isArray(parseddeleteFileNames) && parseddeleteFileNames.length > 0) {
            parseddeleteFileNames.forEach(file => {
                if (file?.filename) {
                    const filePath = path.join(uploadDir, file.filename);
                    console.log(filePath, "filePath")
                    if (fs.existsSync(filePath)) {
                        console.log(filePath, "filePath 1")
                        fs.unlinkSync(filePath);
                    }
                }
            });
        }

        const filesMeta = (req.files || []).map((file, index) => ({
            path: file.path,
            originalname: file.originalname,
            filename: file.filename,
            name: Array.isArray(name) ? name[index] : name,
            remark: Array.isArray(remark) ? remark[index] : remark
        }));

        const updateData = {
            ...query,
            updatedby: parsedUpdatedBy,
            files: [...parsedOldFiles, ...filesMeta]
        };

        const updatedDocument = await EmployeeDocuments.findByIdAndUpdate(id, updateData, {
            new: true
        });

        if (!updatedDocument) {
            return next(new ErrorHandler('EmployeeDocuments not found', 404));
        }

        return res.status(200).json({
            message: 'Updated successfully!',
            employeedocument: updatedDocument
        });

    } catch (err) {
        console.error('Update failed:', err);
        return res.status(500).json({ message: 'Update failed', error: err.message });
    }
});


// delete EmployeeDocument by id => /api/employeedocument/:id
exports.deleteEmployeeDocument = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    const dempdoc = await EmployeeDocuments.findByIdAndRemove(id);

    if (!dempdoc) {
        return next(new ErrorHandler('EmployeeDocuments not found', 404));
    }

    res.status(200).json({ message: 'Deleted successfully' })
})

exports.getAllEmployeeProfile = catchAsyncErrors(async (req, res, next) => {
    let alldocuments;

    try {
        alldocuments = await EmployeeDocuments.find({}, { profileimage: 1, commonid: 1 }).lean()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!alldocuments) {
        return next(new ErrorHandler('EmployeeDocuments not found', 400));
    }

    return res.status(200).json({ alldocuments });
})

// get Single employeeDocument => /api/employeedocumentcommonidwithallnew
exports.getSingleEmployeeDocumentByCommonidWithAllnew = catchAsyncErrors(async (req, res, next) => {
    const { commonid } = req.body;
    const semployeedocument = await EmployeeDocuments.findOne({ commonid }, { profileimage: 1, files: 1 });
    if (!semployeedocument) {
        return res.status(200).json({});
    }

    return res.status(200).json({
        success: true,
        semployeedocument
    })
})

//employee documents 
exports.getAllEmployeeDocumentsforidcard = catchAsyncErrors(async (req, res, next) => {
    let alldocuments;

    try {
        alldocuments = await EmployeeDocuments.find({}, { commonid: 1, profileimage: 1, _id: 1 })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!alldocuments) {
        return next(new ErrorHandler('EmployeeDocuments not found', 400));
    }

    return res.status(200).json({ alldocuments });
})