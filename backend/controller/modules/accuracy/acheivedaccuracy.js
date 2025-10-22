const AcheivedAccuracy = require('../../../model/modules/accuracy/acheivedaccuracy');
const ExpectedAccuracy = require('../../../model/modules/accuracy/expectedaccuracy');
const Category = require('../../../model/modules/setup/category');
const Subcategory = require('../../../model/modules/setup/subcategory');
const Timepoints = require('../../../model/modules/setup/timepoints');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Excelmapdata = require('../../../model/modules/excel/excelmapdata');
const Excelmaprespersondata = require('../../../model/modules/excel/excelmapresperson');
const ClientUserID = require('../../../model/modules/production/ClientUserIDModel');
const AchievedAccuracyIndividual = require('../../../model/modules/accuracy/achievedaccuracyindividual');
const moment = require("moment");

const AchievedAccuracyIndividualUploaddata = require("../../../model/modules/accuracy/achievedaccuracyindividualuploaddata");

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

exports.overallAchievedAccuracyIndividualList = catchAsyncErrors(async (req, res, next) => {

    try {

        const achievedAccuracyPipeline = [
            {
                $project: {
                    id: 1,
                    date: 1,
                    project: 1,
                    vendor: 1,
                    queue: 1,
                    loginid: 1,
                    accuracy: 1,
                    totalfield: 1,
                    projectvendor: {
                        $replaceAll: { input: "$vendor", find: "_", replacement: "-" }
                    }
                }
            }
        ];

        const [achievedAccuracyData, clientUserData] = await Promise.all([
            AchievedAccuracyIndividualUploaddata.aggregate(achievedAccuracyPipeline).allowDiskUse(true), // Replace `YourModel` with the relevant model
            ClientUserID.find().lean() // Replace `ClientUserModel` with the relevant model for user data
        ]);

        // Separate allotted and unallotted data
        const allottedUsers = clientUserData.filter(user => user.allotted === "allotted");
        // const unAllottedUsers = clientUserData.filter(user => user.allotted === "unallotted");


        // Transform allotted user data
        const finalAllottedList = allottedUsers.map(user => ({
            loginid: user.userid,
            projectvendor: user.projectvendor,
            loginallotlog: user.loginallotlog.map(log => ({
                company: log.company,
                branch: log.branch,
                unit: log.unit,
                team: log.team,
                employeename: log.empname,
                date: log.date
            }))
        }));
        // Combine data for allotted users
        const allottedCombinedData = achievedAccuracyData.map(data => {
            const matchingUser = finalAllottedList.find(user =>
                data.loginid === user.loginid &&
                data.projectvendor.replace(/[_-]/g, "") === user.projectvendor.replace(/[_-]/g, "")
            );

            if (!matchingUser) return null;

            const recentLog = matchingUser.loginallotlog
                .filter(log => moment(data?.date).format("YYYY-MM-DD") >= moment(log?.date).format("YYYY-MM-DD"))

            const mostRecentDate = recentLog?.length > 0
                ? recentLog?.reduce((latest, current) => {
                    const latestDate = new Date(latest.date);
                    const currentDate = new Date(current.date);
                    return currentDate > latestDate ? current : latest;
                }, recentLog[0]) : null;


            return {
                ...data,
                company: mostRecentDate?.company || "",
                branch: mostRecentDate?.branch || "",
                unit: mostRecentDate?.unit || "",
                team: mostRecentDate?.team || "",
                employeename: mostRecentDate?.employeename || ""
            };
        }).filter(item => item !== null);


        // Step 1: Create a Set of IDs from allottedCombinedData
        const allottedIds = new Set(allottedCombinedData.map(item => item._id));
        // Step 2: Filter unallotted data
        const unAllottedCombinedData = achievedAccuracyData.filter(data => !allottedIds.has(data._id));

        const finalData = [...allottedCombinedData, ...unAllottedCombinedData]

        return res.status(200).json({ overalllength: finalData.length, finalData });

    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


exports.getOverallAchievedAccuracyIndividualByPagination = catchAsyncErrors(async (req, res, next) => {

    try {
        const { page = 1, pageSize = 10, allFilters, logicOperator, searchQuery } = req.body;

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

        // Search query filter
        if (searchQuery) {
            const searchTermsArray = searchQuery.split(" ");
            const regexTerms = searchTermsArray.map(term => new RegExp(term, "i"));

            const orConditions = regexTerms.map(regex => ({
                $or: [
                    { project: regex },
                    { vendor: regex },
                    { queue: regex },
                    { loginid: regex },
                    { accuracy: regex },
                    { totalfield: regex },
                ],
            }));

            query = {
                $and: [...orConditions],
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

        const achievedAccuracyPipeline = [
            {
                $match: query, // Add query to filter results
            },
            {
                $project: {
                    id: 1,
                    date: 1,
                    project: 1,
                    vendor: 1,
                    queue: 1,
                    loginid: 1,
                    accuracy: 1,
                    totalfield: 1,
                    projectvendor: {
                        $replaceAll: { input: "$vendor", find: "_", replacement: "-" },
                    },
                },
            },
        ];

        const [achievedAccuracyData, clientUserData] = await Promise.all([
            AchievedAccuracyIndividualUploaddata.aggregate(achievedAccuracyPipeline)
                .allowDiskUse(true)
                .skip((page - 1) * pageSize) // Apply pagination offset
                .limit(pageSize), // Limit results to pageSize
            ClientUserID.find().lean(),
        ]);

        const allottedUsers = clientUserData.filter(user => user.allotted === "allotted");

        const finalAllottedList = allottedUsers.map(user => ({
            loginid: user.userid,
            projectvendor: user.projectvendor,
            loginallotlog: user.loginallotlog.map(log => ({
                company: log.company,
                branch: log.branch,
                unit: log.unit,
                team: log.team,
                employeename: log.empname,
                date: log.date,
            })),
        }));

        const allottedCombinedData = achievedAccuracyData.map(data => {
            const matchingUser = finalAllottedList.find(user =>
                data.loginid === user.loginid &&
                data.projectvendor.replace(/[_-]/g, "") === user.projectvendor.replace(/[_-]/g, "")
            );

            if (!matchingUser) return null;

            const recentLog = matchingUser.loginallotlog.filter(log =>
                moment(data?.date).format("YYYY-MM-DD") >= moment(log?.date).format("YYYY-MM-DD")
            );

            const mostRecentDate =
                recentLog?.length > 0
                    ? recentLog?.reduce((latest, current) => {
                        const latestDate = new Date(latest.date);
                        const currentDate = new Date(current.date);
                        return currentDate > latestDate ? current : latest;
                    }, recentLog[0])
                    : null;

            return {
                ...data,
                company: mostRecentDate?.company || "",
                branch: mostRecentDate?.branch || "",
                unit: mostRecentDate?.unit || "",
                team: mostRecentDate?.team || "",
                employeename: mostRecentDate?.employeename || "",
            };
        }).filter(item => item !== null);

        const allottedIds = new Set(allottedCombinedData.map(item => item._id));
        const unAllottedCombinedData = achievedAccuracyData.filter(data => !allottedIds.has(data._id));

        const finalData = [...allottedCombinedData, ...unAllottedCombinedData];

        const totalProjectsData = await AchievedAccuracyIndividualUploaddata.aggregate([
            { $match: query },
            { $count: "total" },
        ]);

        const totalProjects = totalProjectsData.length > 0 ? totalProjectsData[0].total : 0;

        return res.status(200).json({
            overalllength: finalData.length,
            result: finalData,
            totalProjects,
            currentPage: page,
            totalPages: Math.ceil(totalProjects / pageSize),
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }

})

exports.filteredAcheivedAccuracy = catchAsyncErrors(async (req, res, next) => {

    const { project, vendor, queue, fromdate, todate } = req.body;
    // Initialize query object properly
    let dateFilter = {};
    if (fromdate && todate) {
        dateFilter.date = {
            $gte: new Date(fromdate),
            $lte: new Date(todate),
        };
    } else if (fromdate) {
        dateFilter.date = { $gte: new Date(fromdate) };
    } else if (todate) {
        dateFilter.date = { $lte: new Date(todate) };
    }

    let query = { ...dateFilter };


    // Add conditions only if values are provided and are arrays
    if (Array.isArray(project) && project.length > 0) query.project = { $in: project };
    if (Array.isArray(vendor) && vendor.length > 0) query.vendor = { $in: vendor };
    if (Array.isArray(queue) && queue.length > 0) query.queue = { $in: queue };
    try {

        let acheivedaccuracy = [];

        // Only query the database if there are filter criteria
        if (Object.keys(query).length > 0) {
            acheivedaccuracy = await AcheivedAccuracy.find(query);
        }

        // Send the response
        return res.status(200).json({
            acheivedaccuracy,
        });
    } catch (err) {
        // Log the error and pass it to the error handler middleware
        return next(new ErrorHandler('An error occurred while fetching records', 500));
    }
})



// exports.getOverallAchivedAccuracySort = catchAsyncErrors(async (req, res, next) => {
//     const { page, pageSize, searchQuery } = req.body;

//     let allusers;
//     let totalProjects, paginatedData, isEmptyData, result;

//     try {
//         // const query = searchQuery ? { companyname: { $regex: searchQuery, $options: 'i' } } : {};
//         const anse = await AcheivedAccuracy.find()
//         const searchOverTerms = searchQuery?.toLowerCase()?.split(" ");
//         const filteredDatas = anse?.filter((item, index) => {
//             const itemString = JSON.stringify(item)?.toLowerCase();
//             return searchOverTerms.every((term) => itemString.includes(term));
//         })
//         isEmptyData = searchOverTerms?.every(item => item.trim() === '');
//         const pageSized = parseInt(pageSize);
//         const pageNumberd = parseInt(page);

//         paginatedData = filteredDatas.slice((pageNumberd - 1) * pageSized, pageNumberd * pageSize);



//         totalProjects = await AcheivedAccuracy.countDocuments();

//         allusers = await AcheivedAccuracy.find()
//             .skip((page - 1) * pageSize)
//             .limit(parseInt(pageSize));

//         result = isEmptyData ? allusers : paginatedData

//     } catch (err) {
//         return next(new ErrorHandler("Records not found!", 404));
//     }
//     // return res.status(200).json({ count: allusers.length, allusers });
//     return res.status(200).json({
//         allusers,
//         totalProjects,
//         paginatedData,
//         result,
//         currentPage: (isEmptyData ? page : 1),
//         totalPages: Math.ceil((isEmptyData ? totalProjects : paginatedData?.length) / pageSize),
//     });
// });

exports.getOverallAchivedAccuracySort = catchAsyncErrors(async (req, res, next) => {
    let totalProjects, result, totalProjectsOveallData, totalPages, currentPage;
    const { frequency, page, pageSize } = req.body;
    try {
        totalProjects = await AcheivedAccuracy.countDocuments();
        totalProjectsOveallData = await AcheivedAccuracy.find();
        result = await AcheivedAccuracy.find()
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        totalProjects,
        result,
        totalProjectsOveallData,
        currentPage: page,
        totalPages: Math.ceil(totalProjects / pageSize),
    });
});


// get All acheivedaccuracy => /api/acheivedaccuracy
exports.getAllAcheivedAccuracy = catchAsyncErrors(async (req, res, next) => {
    let acheivedaccuracy;
    try {
        acheivedaccuracy = await AcheivedAccuracy.find()
    } catch (err) {
        // return next(new ErrorHandler("Records not found!", 404));
    }
    if (!acheivedaccuracy) {
        return next(new ErrorHandler('Expected accuracy not found!', 404));
    }
    return res.status(200).json({
        // count: products.length,
        acheivedaccuracy
    });
})


exports.addAcheivedAccuracy = catchAsyncErrors(async (req, res, next) => {
    try {
        const { project, vendor, queue, date, clientstatus, internalstatus } = req.body;

        const existingRecords = await AcheivedAccuracy.find({
            project,
            vendor,
            queue,
            date,
            clientstatus,
            internalstatus

        });


        if (existingRecords.length > 0) {
            return res.status(400).json({
                message: 'This Data is Already Exists!'
            });
        }

        const newRecord = await AcheivedAccuracy.create(req.body);

        return res.status(200).json({
            message: 'Successfully added!',
            data: newRecord
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});


// get Single acheivedaccuracy => /api/acheivedaccuracy/:id
exports.getSingleAcheivedAccuracy = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let sacheivedaccuracy = await AcheivedAccuracy.findById(id);

    if (!sacheivedaccuracy) {
        return next(new ErrorHandler('AcheivedAccuracy not found!', 404));
    }
    return res.status(200).json({
        sacheivedaccuracy
    })
})

// get Single expectedaccuracy => /api/expectedaccuracy/single
exports.getSingleExpectedAccuracyByDetails = catchAsyncErrors(async (req, res, next) => {
    // const id = req.params.id;

    const { project, queue, acheivedaccuracy } = req.body;

    let existinglist = await ExpectedAccuracy.find({
        project, queue, $and: [
            { expectedaccuracyfrom: { $lte: acheivedaccuracy } },
            { expectedaccuracyto: { $gte: acheivedaccuracy } }
        ]
    });

    if (existinglist.length > 0) {
        return res.status(200).json({
            existinglist
        })

    }

    else {
        return next(new ErrorHandler('Data not found!', 404));
    }

    // if (!sacheivedaccuracy) {
    //     return next(new ErrorHandler('AcheivedAccuracy not found!', 404));
    // }
    // return res.status(200).json({
    //     sacheivedaccuracy
    // })
})

// get Single achievedaccuracy => /api/achievedaccuracy/single
exports.getSingleAchivedAccuracyByDetails = catchAsyncErrors(async (req, res, next) => {
    // const id = req.params.id;

    const { project, queue, expectedaccuracyfrom, expectedaccuracyto } = req.body;

    let existinglist = await AcheivedAccuracy.find({
        project, queue, $and: [
            { acheivedaccuracy: { $lte: expectedaccuracyto } },
            { acheivedaccuracy: { $gte: expectedaccuracyfrom } }
        ]
    });

    if (existinglist.length > 0) {

        return res.status(200).json({
            existinglist
        });
    }



    else {
        return next(new ErrorHandler('Data not found!', 404));
    }

})


// update acheivedaccuracy by id => /api/acheivedaccuracy/:id
exports.updateAcheivedAccuracy = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    try {
        const { project, vendor, queue, acheivedaccuracy, date } = req.body;

        const existingRecords = await AcheivedAccuracy.find({
            project,
            vendor,
            queue,
            date,
            acheivedaccuracy,
            _id: { $ne: id }

        });


        if (existingRecords.length > 0) {
            return res.status(400).json({
                message: 'This Data is Already Exists!'
            });
        }

        // If no existing records or no duplicate subcategory found, create a new record
        let uacheivedaccuracy = await AcheivedAccuracy.findByIdAndUpdate(id, req.body);
        if (!uacheivedaccuracy) {
            return next(new ErrorHandler('AcheivedAccuracy not found!', 404));
        }

        return res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }

})

// update acheivedaccuracy by id => /api/acheivedaccuracy/:id
exports.updateAcheivedAccuracyById = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    try {
        // If no existing records or no duplicate subcategory found, create a new record
        let uacheivedaccuracy = await AcheivedAccuracy.findByIdAndUpdate(id, req.body);
        if (!uacheivedaccuracy) {
            return next(new ErrorHandler('AcheivedAccuracy not found!', 404));
        }

        return res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }

})

// delete acheivedaccuracy by id => /api/acheivedaccuracy/:id
exports.deleteAcheivedAccuracy = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dacheivedaccuracy = await AcheivedAccuracy.findByIdAndRemove(id);

    if (!dacheivedaccuracy) {
        return next(new ErrorHandler('AcheivedAccuracy not found!', 404));
    }
    return res.status(200).json({ message: 'Deleted successfully' });
})


