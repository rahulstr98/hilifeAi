const EmployeeAssetReturn = require("../../../model/modules/account/employeeAssetReturnRegister.js");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");


// get All AssetReturn=> /api/allemployeeassetreturn
exports.getAllAssetReturn = catchAsyncErrors(async (req, res, next) => {
    let allassetreturn;
    try {
        const { assignbranch } = req.body;

        const branchFilter = assignbranch?.map((branchObj) => ({
            $and: [
                { company: { $elemMatch: { $eq: branchObj.company } } },
                { branch: { $elemMatch: { $eq: branchObj.branch } } },
                { unit: { $elemMatch: { $eq: branchObj.unit } } },
            ],
        }));
        let filterQuery = {};
        if (branchFilter?.length > 0 && assignbranch) {

            filterQuery = { $or: branchFilter };
        }
        allassetreturn = await EmployeeAssetReturn.find(filterQuery);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!allassetreturn) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        allassetreturn,
    });
});

// Create new AssetReturn=> /api/employeeassetreturn/new
exports.addAssetReturn = catchAsyncErrors(async (req, res, next) => {
    let checkloc = await EmployeeAssetReturn.findOne({ assetmaterialcode: req.body.assetmaterialcode, employee: req.body.employee,returndate: req.body.returndate});

    if (checkloc) {
        return next(new ErrorHandler("Data already exist!", 400));
    }

    await EmployeeAssetReturn.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle AssetReturn => /api/singleemployeeassetreturn/:id
exports.getSingleAssetReturn = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let sassetreturn = await EmployeeAssetReturn.findById(id);

    if (!sassetreturn) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        sassetreturn,
    });
});

// update AssetReturn by id => /api/singleemployeeassetreturn/:id
exports.updateAssetReturn = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let uassetreturn = await EmployeeAssetReturn.findByIdAndUpdate(id, req.body);
    if (!uassetreturn) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete AssetReturn by id => /api/singleemployeeassetreturn/:id
exports.deleteAssetReturn = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dassetreturn = await EmployeeAssetReturn.findByIdAndRemove(id);

    if (!dassetreturn) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});
