const Deptmonthsetauto = require("../../model/modules/departmentmonthsetauto");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");

// get All Deptmonthsetauto Details => /api/Departments

exports.getAllDeptmonthsetauto = catchAsyncErrors(async (req, res, next) => {
    let deptmonthsetauto;

    try {
        deptmonthsetauto = await Deptmonthsetauto.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!deptmonthsetauto) {
        return next(new ErrorHandler("Deptmonthsetauto details not found", 404));
    }

    return res.status(200).json({
        deptmonthsetauto,
    });
});

// Create new Deptmonthsetauto => /api/department/new
exports.addDeptmonthsetauto = catchAsyncErrors(async (req, res, next) => {
    let adeptmonthsetauto = await Deptmonthsetauto.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle Deptmonthsetauto => /api/department/:id

exports.getSingleDeptmonthsetauto = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let sdeptmonthsetauto = await Deptmonthsetauto.findById(id);

    if (!sdeptmonthsetauto) {
        return next(new ErrorHandler("Deptmonthsetauto not found", 404));
    }

    return res.status(200).json({
        sdeptmonthsetauto,
    });
});

// update Deptmonthsetauto by id => /api/customer/:id

exports.updateDeptmonthsetauto = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let updeptmonthsetauto = await Deptmonthsetauto.findByIdAndUpdate(id, req.body);

    if (!updeptmonthsetauto) {
        return next(new ErrorHandler("Deptmonthsetauto Details not found", 404));
    }

    return res.status(200).json({ message: "Updates successfully" });
});
exports.deleteDeptmonthsetauto = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let ddeptmonthsetauto = await Deptmonthsetauto.findByIdAndRemove(id);
    if (!ddeptmonthsetauto) {
        return next(new ErrorHandler("Deptmonthsetauto Month Set not found", 404));
    }

    return res.status(200).json({ message: "Deleted successfully" });
});
exports.getAllDepMonthAutoByPagination = catchAsyncErrors(async (req, res, next) => {
    const { page, pageSize, searchQuery, allFilters,
        logicOperator,
    } = req.body;

    let deptmonthsetauto;
    let totalDatas, paginatedData, totalDatasOverall, isEmptyData, result;

    try {


        const anse = await Deptmonthsetauto.find()
        const searchOverTerms = searchQuery?.toLowerCase()?.split(" ");
        const filteredDatas = anse?.filter((item, index) => {
            const itemString = JSON.stringify(item)?.toLowerCase();
            return searchOverTerms.every((term) => itemString.includes(term));
        })
        isEmptyData = searchOverTerms?.every(item => item.trim() === '');
        const pageSized = parseInt(pageSize);
        const pageNumberd = parseInt(page);

        paginatedData = filteredDatas.slice((pageNumberd - 1) * pageSized, pageNumberd * pageSize);

        let query = {};
        // Advanced search filter
        const conditions = [];
        if (allFilters && allFilters.length > 0) {
            allFilters.forEach((filter) => {
                if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
                    conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
                }
            });
        }

        // Add search query filter
        if (searchQuery && searchQuery !== undefined) {
            const searchTermsArray = searchQuery.split(" ");
            const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

            const orConditions = regexTerms.map((regex) => ({
                $or: [
                    { department: regex },
                    { year: regex },
                    { startdate: regex },
                    // { salary: regex },
                    // { proftaxstop: regex },
                    // { penalty: regex },
                    // { esistop: regex },
                    // { pfstop: regex },
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
            // conditions.push(...orConditions);
        }

        // Apply logicOperator to combine conditions
        if (conditions.length > 0) {
            if (logicOperator === "AND") {
                query.$and = conditions;
            } else if (logicOperator === "OR") {
                query.$or = conditions;
            }
        }

        totalDatas = await Deptmonthsetauto.countDocuments(query);
        totalDatasOverall = await Deptmonthsetauto.find();
        deptmonthsetauto = await Deptmonthsetauto.find(query).skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

        result = isEmptyData ? deptmonthsetauto : paginatedData


        if (!deptmonthsetauto) {
            return next(new ErrorHandler("Deptmonthsetauto details not found", 404));
        }

        return res.status(200).json({
            deptmonthsetauto,
            totalDatas,
            paginatedData,
            result,
            totalDatasOverall,
            currentPage: (isEmptyData ? page : 1),
            totalPages: Math.ceil(totalDatas / pageSize),
        });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});

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