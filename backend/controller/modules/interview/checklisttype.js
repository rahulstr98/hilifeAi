const Checklisttype = require('../../../model/modules/interview/checklisttype');
const Checklistverificationmaster = require('../../../model/modules/interview/checklistverificationmaster');
const Mychecklist = require('../../../model/modules/interview/Myinterviewchecklist');
const ErrorHandler = require('../../../utils/errorhandler');
// const Task = require('../../../model/modules/project/task');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');

//get All Checklisttype =>/api/Checklisttype
exports.getAllChecklisttype = catchAsyncErrors(async (req, res, next) => {
    let checklisttypes;
    try {
        checklisttypes = await Checklisttype.find({})
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!checklisttypes) {
        return next(new ErrorHandler('Checklisttype not found!', 404));
    }
    return res.status(200).json({
        checklisttypes
    });
})

exports.getAllChecklistByPagination = catchAsyncErrors(async (req, res, next) => {
    const { page, pageSize, allFilters, logicOperator, searchQuery } = req.body;

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
                { estimation: regex },
                { estimationtime: regex },
                { checklist: regex },
                { category: regex },

                { subcategory: regex },
                { details: regex },
                { information: regex },
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


    let checklisttypes;
    let totalDatas, paginatedData, isEmptyData, result, overallItems;

    try {
        const totalProjects = await Checklisttype.countDocuments(query);
        const overallitems = await Checklisttype.find({});
        const result = await Checklisttype.find(query)
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



//create new Checklisttype => /api/Checklisttype/new
exports.addChecklisttype = catchAsyncErrors(async (req, res, next) => {
    // let checkmain = await Addexists.findOne({ name: req.body.name });
    // if (checkmain) {
    //     return next(new ErrorHandler('Name already exist!', 400));
    // }
    let aChecklisttype = await Checklisttype.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})


exports.addChecklisttypeBulk = catchAsyncErrors(async (req, res, next) => {
    const { datas } = req.body;
    try {

        let aChecklisttype = await Checklisttype.insertMany(datas);
        return res.status(200).json({
            message: 'Successfully added!'
        });
    } catch (err) {
        console.log(err);
    }

})


exports.checkCategoryUsedByOthers = catchAsyncErrors(async (req, res, next) => {
    const { combinedData } = req.body;
    try {

        const conditions = combinedData.map(item => ({
            category: item.category,
            subcategory: item.subcategory
        }));
        const conditionsNew = combinedData.map(item => ({
            categoryname: item.category,
            subcategoryname: item.subcategory
        }));


        const [existingEntries, existingEntriesNew] = await Promise.all([
            Checklisttype.find({ $or: conditions }),
            Checklistverificationmaster.find({ $or: conditionsNew }),
        ]);
        if (existingEntries.length > 0 || existingEntriesNew.length > 0) {
            const matchedConditionsFirst = combinedData.filter(item =>
                existingEntries.some(entry =>
                    entry.category === item.category && entry.subcategory === item.subcategory
                )
            );

            const matchedConditionsNew = combinedData.filter(item =>
                existingEntriesNew.some(entry =>
                    entry.categoryname === item.category && entry.subcategoryname === item.subcategory
                )
            );

            let matchedConditions = [...new Set([...matchedConditionsFirst, ...matchedConditionsNew])];
            let popupMessage;
            if (existingEntries.length > 0 && existingEntriesNew.length > 0) {
                popupMessage = "Category and Subacategory Linked to Checklist Type and Assign Checklist Pages"
            } else if (existingEntries.length > 0) {
                popupMessage = "Category and Subacategory Linked to Checklist Type Page"
            }
            else if (existingEntriesNew.length > 0) {
                popupMessage = "Category and Subacategory Linked to Assign Checklist Page"
            } else {
                popupMessage = "Not Connected Any of the Pages"
            }
            return res.status(200).json({
                message: 'Category and Subcategory already used.',
                exists: true,
                foundData: [...existingEntries, ...existingEntriesNew], // Returning found data
                matchedConditions: matchedConditions,
                popupMessage
            });
        }

        return res.status(200).json({ message: 'No conflicts found.', exists: false });
    } catch (err) {
        console.log(err);
    }

})

exports.checkChecklistUsedByOthers = catchAsyncErrors(async (req, res, next) => {
    const { combinedData } = req.body;
    try {
        // Construct conditions using $elemMatch for array matching
        const conditions = combinedData.map(item => ({
            groups: {
                $elemMatch: {
                    category: item.category,
                    subcategory: item.subcategory,
                    checklist: item.checklist,
                    details: item.details,
                    information: item.information
                }
            }
        }));

        const conditionsNew = combinedData.map(item => ({
            categoryname: item.category,
            subcategoryname: item.subcategory,
            checklisttype: item.details,
        }));

        // Query to find existing entries
        const [existingEntries, existingEntriesNew] = await Promise.all([
            Mychecklist.find({ $or: conditions }),
            Checklistverificationmaster.find({
                $or: conditionsNew
            })
        ])

        if (existingEntries.length > 0 || existingEntriesNew.length > 0) {
            // Find which items match existing entries
            const matchedConditionsFirst = combinedData.filter(item =>
                existingEntries.some(entry =>
                    entry.groups.some(group =>
                        group.category === item.category && group.subcategory === item.subcategory && group.checklist === item.checklist && group.details === item.details && group.information === item.information
                    )
                )
            );

            const matchedConditionsNew = combinedData.filter(item =>
                existingEntriesNew.some(entry =>
                    entry.categoryname === item.category && entry.subcategoryname === item.subcategory && entry.checklisttype.includes(item.details)
                )
            );

            let matchedConditions = [...new Set([...matchedConditionsFirst, ...matchedConditionsNew])];
            let popupMessage;
            if (existingEntries.length > 0 && existingEntriesNew.length > 0) {
                popupMessage = "Checklist Type Linked to My Checklist and Assign Checklist Pages"
            } else if (existingEntries.length > 0) {
                popupMessage = "Checklist Type Linked to My Checklist Page"
            }
            else if (existingEntriesNew.length > 0) {
                popupMessage = "Checklist Type Linked to Assign Checklist Page"
            } else {
                popupMessage = "Not Connected Any of the Pages"
            }

            return res.status(200).json({
                message: 'Checklist Type already used.',
                exists: true,
                foundData: [...existingEntries, ...existingEntriesNew], // Returning found data
                matchedConditions: matchedConditions,
                popupMessage
            });
        }

        return res.status(200).json({ message: 'No conflicts found.', exists: false });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

exports.checkAssignChecklistUsedByOthers = catchAsyncErrors(async (req, res, next) => {
    const { combinedData } = req.body;

    try {
        // Construct conditions using $elemMatch for array matching
        const conditions = combinedData.map(item => ({
            groups: {
                $elemMatch: {
                    category: item.category,
                    subcategory: item.subcategory,
                    details: Array.isArray(item.checklisttype) ? { $in: item.checklisttype } : item.checklisttype,
                    employee: Array.isArray(item.employee) ? { $in: item.employee } : item.employee
                }
            }
        }));
        // Query to find existing entries
        const existingEntries = await Mychecklist.find({ $or: conditions });
        if (existingEntries.length > 0) {
            // Find which items match existing entries
            const matchedConditions = combinedData.filter(item =>
                existingEntries.some(entry =>
                    entry.groups.some(group =>
                        group.category === item.category &&
                        group.subcategory === item.subcategory &&
                        item.checklisttype.includes(group.details)
                        &&
                        item.employee.some(emp => group.employee.includes(emp))
                    )
                )
            );

            return res.status(200).json({
                message: 'Assigned Checklist already used.',
                exists: true,
                foundData: existingEntries, // Returning found data
                matchedConditions: matchedConditions
            });
        }

        return res.status(200).json({ message: 'No conflicts found.', exists: false });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

exports.checklistCategoryOverallUpdate = catchAsyncErrors(async (req, res, next) => {
    const { oldcategory, category } = req.body;

    try {
        // Update Checklisttype model where category matches oldcategory
        await Checklisttype.updateMany(
            { category: oldcategory },
            { $set: { category } }
        );

        // Update Checklistverificationmaster model where categoryname matches oldcategory
        await Checklistverificationmaster.updateMany(
            { categoryname: oldcategory },
            { $set: { categoryname: category } }
        );

        // Update Mychecklist model where groups contain oldcategory
        await Mychecklist.updateMany(
            { "groups.category": oldcategory },
            { $set: { "groups.$[].category": category } }
        );


        return res.status(200).json({ message: "Categories updated successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});


exports.checklistCategoryConnectPages = catchAsyncErrors(async (req, res, next) => {
    const { category } = req.body;

    try {
        // Update Checklisttype model where category matches oldcategory
        const [checklistType, assignChecklist, myChecklist] = await Promise.all([
            Checklisttype.find({ category }),
            Checklistverificationmaster.find({ categoryname: category }),
            Mychecklist.find(
                { "groups.category": category },
            )
        ]);
        let popupMessage;
        if (checklistType.length > 0 && assignChecklist.length > 0 && myChecklist.length > 0) {
            popupMessage = "This Data is linked to Checklist Type, Assign Checklist, and Mychecklist Pages!";
        } else if (checklistType.length > 0 && assignChecklist.length > 0) {
            popupMessage = "This Data is linked to Checklist Type and Assign Checklist Pages!";
        } else if (checklistType.length > 0 && myChecklist.length > 0) {
            popupMessage = "This Data is linked to Checklist Type and Mychecklist Pages!";
        } else if (assignChecklist.length > 0 && myChecklist.length > 0) {
            popupMessage = "This Data is linked to Assign Checklist and Mychecklist Pages!";
        } else if (checklistType.length > 0) {
            popupMessage = "This Data is linked to the Checklist Type Page!";
        } else if (assignChecklist.length > 0) {
            popupMessage = "This Data is linked to the Assign Checklist Page!";
        } else if (myChecklist.length > 0) {
            popupMessage = "This Data is linked to the Mychecklist Page!";
        } else {
            popupMessage = "No linked data found.";
        }


        return res.status(200).json({ message: popupMessage });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});


exports.checklistTypeOverallUpdate = catchAsyncErrors(async (req, res, next) => {
    const { oldcategory, oldsubcategory, oldchecklist, olddetails, category, subcategory, checklist, details } = req.body;

    try {
        // Update only matching elements in the 'groups' array
        await Mychecklist.updateMany(
            { "groups.category": oldcategory, "groups.subcategory": oldsubcategory, "groups.checklist": oldchecklist, "groups.details": olddetails },
            {
                $set: {
                    "groups.$[group].category": category,
                    "groups.$[group].subcategory": subcategory,
                    "groups.$[group].checklist": checklist,
                    "groups.$[group].details": details,

                }
            },
            {
                arrayFilters: [
                    { "group.category": oldcategory, "group.subcategory": oldsubcategory, "group.checklist": oldchecklist, "group.details": olddetails }
                ]
            }
        );

        let updatedData = await Checklistverificationmaster.updateMany(
            {
                categoryname: oldcategory,
                subcategoryname: oldsubcategory,
                checklisttype: olddetails  // Match only where checklisttype contains olddetails
            },
            {
                $set: { "checklisttype.$[elem]": details }  // Replace only the matched element
            },
            {
                arrayFilters: [{ "elem": olddetails }]  // Match the specific element in checklisttype array
            }
        );

        return res.status(200).json({ message: "Checklist Details updated successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});


exports.checklistTypeConnectPages = catchAsyncErrors(async (req, res, next) => {
    const { category, subcategory, details, checklist } = req.body;

    try {
        // Update Checklisttype model where category matches oldcategory
        const [assignChecklist, myChecklist] = await Promise.all([

            Checklistverificationmaster.find({
                categoryname: category,
                subcategoryname: subcategory,
                checklisttype: details
            }),
            Mychecklist.find({
                "groups.category": category, "groups.subcategory": subcategory, "groups.checklist": checklist, "groups.details": details,
            }
            )
        ]);
        let popupMessage;
        if (assignChecklist.length > 0 && myChecklist.length > 0) {
            popupMessage = "This Data is linked to Assign Checklist and Mychecklist Pages!";
        } else if (assignChecklist.length > 0) {
            popupMessage = "This Data is linked to the Assign Checklist Page!";
        } else if (myChecklist.length > 0) {
            popupMessage = "This Data is linked to the Mychecklist Page!";
        } else {
            popupMessage = "No linked data found.";
        }

        return res.status(200).json({ message: popupMessage });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});




// get Single Checklisttype => /api/Checklisttype/:id
exports.getSingleChecklisttype = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let schecklisttype = await Checklisttype.findById(id);
    if (!schecklisttype) {
        return next(new ErrorHandler('Checklisttype not found', 404));
    }
    return res.status(200).json({
        schecklisttype
    })
})

//update Checklisttype by id => /api/Checklisttype/:id
exports.updateChecklisttype = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let uchecklisttype = await Checklisttype.findByIdAndUpdate(id, req.body);
    if (!uchecklisttype) {
        return next(new ErrorHandler('Checklisttype not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete Checklisttype by id => /api/Checklisttype/:id
exports.deleteChecklisttype = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dchecklisttype = await Checklisttype.findByIdAndRemove(id);
    if (!dchecklisttype) {
        return next(new ErrorHandler('Checklisttype not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})

exports.getAllChecklistNotAssignedByPagination = catchAsyncErrors(async (req, res, next) => {

    const { page, pageSize, allFilters, logicOperator, searchQuery } = req.body;

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
                { estimation: regex },
                { estimationtime: regex },
                { checklist: regex },
                { category: regex },

                { subcategory: regex },
                { details: regex },
                { information: regex },
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


    let checklisttypes;

    try {
        const totalProjectsData = await Checklisttype.aggregate([
            { $match: query }, // Apply the same query
            {
                $lookup: {
                    from: 'checklistverificationmasters',
                    let: {
                        currentCategory: "$category",
                        currentSubcategory: "$subcategory",
                        currentChecklist: "$details"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$categoryname", "$$currentCategory"] },
                                        { $eq: ["$subcategoryname", "$$currentSubcategory"] },
                                        { $in: ["$$currentChecklist", "$checklisttype"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'result'
                }
            },
            {
                $addFields: {
                    hasResult: { $gt: [{ $size: "$result" }, 0] } // Add 'hasResult' field
                }
            },
            {
                $match: {
                    hasResult: false // Filter for documents where result array is empty
                }
            },
            {
                $count: "total"
            }
        ]);
        const totalProjects = totalProjectsData.length > 0 ? totalProjectsData[0].total : 0;
        checklisttypes = await Checklisttype.aggregate([
            {
                $match: query // Use the dynamic query in the aggregation
            },
            {
                $lookup: {
                    from: 'checklistverificationmasters',
                    let: {
                        currentCategory: "$category",
                        currentSubcategory: "$subcategory",
                        currentChecklist: "$details"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$categoryname", "$$currentCategory"] },
                                        { $eq: ["$subcategoryname", "$$currentSubcategory"] },
                                        { $in: ["$$currentChecklist", "$checklisttype"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'result'
                }
            },
            {
                $addFields: {
                    hasResult: { $gt: [{ $size: "$result" }, 0] } // Add 'hasResult' field
                }
            },
            {
                $match: {
                    hasResult: false // Filter for documents where result array is empty
                }
            },
            {
                $skip: (page - 1) * pageSize // Implement pagination
            },
            {
                $limit: pageSize // Set page size
            }
        ]);


        let overallitems = await Checklisttype.aggregate([
            {
                $match: query // Use the dynamic query in the aggregation
            },
            {
                $lookup: {
                    from: 'checklistverificationmasters',
                    let: {
                        currentCategory: "$category",
                        currentSubcategory: "$subcategory",
                        currentChecklist: "$details"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$categoryname", "$$currentCategory"] },
                                        { $eq: ["$subcategoryname", "$$currentSubcategory"] },
                                        { $in: ["$$currentChecklist", "$checklisttype"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'result'
                }
            },
            {
                $addFields: {
                    hasResult: { $gt: [{ $size: "$result" }, 0] } // Add 'hasResult' field
                }
            },
            {
                $match: {
                    hasResult: false // Filter for documents where result array is empty
                }
            },
        ]);

        return res.status(200).json({
            result: checklisttypes,
            totalProjects,
            currentPage: page,
            totalPages: Math.ceil(totalProjects / pageSize),
            overallitems

        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

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
