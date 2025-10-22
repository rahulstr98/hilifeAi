const AcpointcalculationModel = require('../../../model/modules/production/acpointscalculation');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');

//get All AcpointcalculationModel =>/api/AcpointcalculationModel
exports.getAllAcpointCalculation = catchAsyncErrors(async (req, res, next) => {
    let acpointcalculation;
    try {
        acpointcalculation = await AcpointcalculationModel.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!acpointcalculation) {
        return next(new ErrorHandler('AcpointcalculationModel not found!', 404));
    }

    return res.status(200).json({
        acpointcalculation
    });
})

exports.acpointCalculationSort = catchAsyncErrors(async (req, res, next) => {
    let totalProjects, result, totalProjectsAllData, totalPages, currentPage;

    const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, } = req.body;

    // const query = {
    //     $or: assignbranch.map(item => ({
    //         company: item.company,
    //         branch: item.branch,
    //     }))
    // };
    try {

        let query = {};

        const conditions = [];

        // Advanced search filter
        if (allFilters && allFilters.length > 0) {
            allFilters.forEach(filter => {
                if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
                    conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
                }
            });
        }

        if (searchQuery && searchQuery !== undefined) {
            const searchTermsArray = searchQuery.split(" ");
            const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

            const orConditions = regexTerms.map((regex) => ({
                $or: [
                    { company: regex },
                    { branch: regex },
                    { department: regex },
                    { dividevalue: regex },
                    { multiplevalue: regex },
                ],
            }));

            query = {
                $and: [
                    query,
                    // {
                    //     $or: assignbranch.map(item => ({
                    //         company: item.company,
                    //         branch: item.branch,
                    //     }))
                    // },
                    ...orConditions,
                ],
            };
        }

        // Apply logicOperator to combine conditions
        if (conditions.length > 0) {
            if (logicOperator === "AND") {
                query.$and = conditions;
            } else if (logicOperator === "OR") {
                query.$or = conditions;
            }
        }

        const branchFilters = assignbranch?.map(branchObj => ({
            company: branchObj.company,
            branch: branchObj.branch,
        }));

        const combinedFilter = {
            $and: [
                query,
                { $or: branchFilters },
            ],
        };

        totalProjects = await AcpointcalculationModel.countDocuments(combinedFilter);
        totalProjectsAllData = await AcpointcalculationModel.find(combinedFilter);

        result = await AcpointcalculationModel.find(combinedFilter)
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        totalProjects,
        result,
        totalProjectsAllData,
        currentPage: page,
        totalPages: Math.ceil(totalProjects / pageSize),
    });
});

//create new AcpointcalculationModel => /api/AcpointcalculationModel/new
exports.addAcpointCalculation = catchAsyncErrors(async (req, res, next) => {
    // let checkmain = await Addexists.findOne({ name: req.body.name });
    // if (checkmain) {
    //     return next(new ErrorHandler('Name already exist!', 400));
    // }

    let acpointcalculation = await AcpointcalculationModel.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single AcpointcalculationModel => /api/AcpointcalculationModel/:id
exports.getSingleAcpointCalculation = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let acpointcalculation = await AcpointcalculationModel.findById(id);
    if (!acpointcalculation) {
        return next(new ErrorHandler('AcpointcalculationModel not found', 404));
    }
    return res.status(200).json({
        acpointcalculation
    })
})

//update AcpointcalculationModel by id => /api/AcpointcalculationModel/:id
exports.updateAcpointCalculation = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let acpointcalculation = await AcpointcalculationModel.findByIdAndUpdate(id, req.body);
    if (!acpointcalculation) {
        return next(new ErrorHandler('AcpointcalculationModel not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete AcpointcalculationModel by id => /api/AcpointcalculationModel/:id
exports.deleteAcpointCalculation = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let acpointcalculation = await AcpointcalculationModel.findByIdAndRemove(id);
    if (!acpointcalculation) {
        return next(new ErrorHandler('AcpointcalculationModel not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})

exports.acpointCalculationAssignBranch = catchAsyncErrors(async (req, res, next) => {
    const { assignbranch } = req.body;

    const query = {
        $or: assignbranch.map(item => ({
            company: item.company,
            branch: item.branch,
        }))
    };

    let acpointcalculation;
    try {
        acpointcalculation = await AcpointcalculationModel.find(query)
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!acpointcalculation) {
        return next(new ErrorHandler('AcpointcalculationModel not found!', 404));
    }

    return res.status(200).json({
        acpointcalculation
    });
})

function createFilterCondition(column, condition, value) {
    switch (condition) {
        case "Contains":
            return { [column]: new RegExp(value, 'i') };
        case "Does Not Contain":
            return { [column]: { $not: new RegExp(value, 'i') } };
        case "Equals":
            return { [column]: value };
        case "Does Not Equal":
            return { [column]: { $ne: value } };
        case "Begins With":
            return { [column]: new RegExp(`^${value}`, 'i') };
        case "Ends With":
            return { [column]: new RegExp(`${value}$`, 'i') };
        case "Blank":
            return { [column]: { $exists: false } };
        case "Not Blank":
            return { [column]: { $exists: true } };
        default:
            return {};
    }
}