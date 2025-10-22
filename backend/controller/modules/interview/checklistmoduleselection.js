const ChecklistModuleSelection = require('../../../model/modules/interview/checklistmoduleselection');
const ErrorHandler = require('../../../utils/errorhandler');
// const Task = require('../../../model/modules/project/task');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');

//get All ChecklistModuleSelection =>/api/ChecklistModuleSelection
exports.getAllChecklistModule = catchAsyncErrors(async (req, res, next) => {
    let checklisttypes;
    try {
        checklisttypes = await ChecklistModuleSelection.find({})
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!checklisttypes) {
        return next(new ErrorHandler('ChecklistModuleSelection not found!', 404));
    }
    return res.status(200).json({
        checklisttypes
    });
})

// Helper function to create filter condition
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

exports.getAllChecklistModuleByPagination = catchAsyncErrors(async (req, res, next) => {
    const { page, pageSize, allFilters, logicOperator, searchQuery } = req.body;

    let checklisttypes;
    let totalDatas, paginatedData, isEmptyData, result, overallItems;


    let query = {};
    let conditions = [];


    // Advanced search filter
    if (allFilters && allFilters.length > 0) {
        allFilters.forEach(filter => {
            if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
                conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
            }
        });
    }

    if (searchQuery) {
        const searchTermsArray = searchQuery.split(" ");
        const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

        const orConditions = regexTerms.map((regex) => ({
            $or: [
                { module: regex },
                { submodule: regex },
                { mainpage: regex },
                { subpage: regex },
                { subsubpage: regex },
            ],
        }));

        query = {
            $and: [
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

    try {
        const totalProjects = await ChecklistModuleSelection.countDocuments(query);
        const overallitems = await ChecklistModuleSelection.find({});
        const result = await ChecklistModuleSelection.find(query)
            .select("")
            .lean()
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize))
            .exec();

        res.status(200).json({
            totalProjects,
            result,
            currentPage: page,
            totalPages: Math.ceil(totalProjects / pageSize),
            overallitems
        });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

})

//create new ChecklistModuleSelection => /api/ChecklistModuleSelection/new
exports.addChecklistModule = catchAsyncErrors(async (req, res, next) => {
    console.log(req.body)
    let aChecklisttype = await ChecklistModuleSelection.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single ChecklistModuleSelection => /api/ChecklistModuleSelection/:id
exports.getSingleChecklistModule = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let schecklisttype = await ChecklistModuleSelection.findById(id);
    if (!schecklisttype) {
        return next(new ErrorHandler('ChecklistModuleSelection not found', 404));
    }
    return res.status(200).json({
        schecklisttype
    })
})

//update ChecklistModuleSelection by id => /api/ChecklistModuleSelection/:id
exports.updateChecklistModule = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let uchecklisttype = await ChecklistModuleSelection.findByIdAndUpdate(id, req.body);
    if (!uchecklisttype) {
        return next(new ErrorHandler('ChecklistModuleSelection not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete ChecklistModuleSelection by id => /api/ChecklistModuleSelection/:id
exports.deleteChecklistModule = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dchecklisttype = await ChecklistModuleSelection.findByIdAndRemove(id);
    if (!dchecklisttype) {
        return next(new ErrorHandler('ChecklistModuleSelection not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})