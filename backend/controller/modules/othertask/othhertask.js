const Manageothertask = require('../../../model/modules/othertask/othertask');
const QueueTypeMaster = require('../../../model/modules/production/queuetypemaster');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const ClientUserid = require("../../../model/modules/production/ClientUserIDModel")
const ProductionIndividual = require("../../../model/modules/production/productionindividual")
const Users = require("../../../model/login/auth")
const OtherTaskUpload = require("../../../model/modules/production/othertaskoriginalupload")
//get All Source =>/api/assignedby
exports.getAllManageothertask = catchAsyncErrors(async (req, res, next) => {
    let manageothertasks;
    try {
        manageothertasks = await Manageothertask.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!manageothertasks) {
        return next(new ErrorHandler('Manageothertask not found!', 404));
    }
    return res.status(200).json({
        manageothertasks
    });
})

exports.getOverallOthertaskSort = catchAsyncErrors(async (req, res, next) => {
    let totalProjects, results, totalProjectsOverall;

    const { page, pageSize, project, category, allFilters, logicOperator, searchQuery, subcategory, assignedby, assignedmode, fromdate, todate, month, year } = req.body;

    try {
        let query = {};

        // Apply filters for other fields
        if (Array.isArray(project) && project.length > 0) {
            query.project = { $in: project };
        }

        if (Array.isArray(category) && category.length > 0) {
            query.category = { $in: category };
        }

        if (Array.isArray(subcategory) && subcategory.length > 0) {
            query.subcategory = { $in: subcategory };
        }

        if (Array.isArray(assignedby) && assignedby.length > 0) {
            query.assignedby = { $in: assignedby };
        }

        if (Array.isArray(assignedmode) && assignedmode.length > 0) {
            query.assignedmode = { $in: assignedmode };
        }
        // Date filtering
        if (fromdate && todate) {
            const fromDateObj = fromdate;
            const toDateObj = todate;

            query.date = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
        } else if (fromdate) {
            const fromDateObj = fromdate;
            query.date = {
                $gte: fromDateObj,
            };
        } else if (todate) {
            const toDateObj = todate;
            query.date = {
                $lte: toDateObj,
            };
        }

        // Month and Year filtering
        if ((Array.isArray(month) && month.length > 0) && (Array.isArray(year) && year.length > 0)) {
            const monthIndices = month.map(m => {
                // Convert month name to its index
                const date = new Date(`${m} 01, 2000`);
                return date.getMonth() + 1; // Months are 0-indexed, so add 1
            });


            query.$expr = {
                $and: [
                    {
                        $in: [
                            { $month: { $dateFromString: { dateString: '$date' } } },
                            monthIndices
                        ]
                    },
                    {
                        $in: [
                            { $year: { $dateFromString: { dateString: '$date' } } },
                            year
                        ]
                    }
                ]
            }
        } else if (Array.isArray(month) && month.length > 0) {
            const monthIndices = month.map(m => {
                // Convert month name to its index
                const date = new Date(`${m} 01, 2000`);
                return date.getMonth() + 1; // Months are 0-indexed, so add 1
            });
            query.$expr = {
                $in: [{ $month: { $dateFromString: { dateString: '$date' } } }, monthIndices]
            };
        } else if (Array.isArray(year) && year.length > 0) {

            query.$expr = {
                $in: [{ $year: { $dateFromString: { dateString: '$date' } } }, year]
            };
        }

        let conditions = [];

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
                    { project: regex },
                    { category: regex },
                    { subcategory: regex },
                    { total: regex },
                    { date: regex },
                    { time: regex },
                    { assignedby: regex },
                    { assignedmode: regex },
                    { ticket: regex },
                    { duedate: regex },
                    { duetime: regex },
                    { estimation: regex },
                    { estimationtime: regex },
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

        const isEmpty = Object.keys(query).length === 0;

        totalProjects = isEmpty ? 0 : await Manageothertask.find(query).countDocuments();
        totalProjectsOverall = isEmpty ? 0 : await Manageothertask.find(query)


        results = await Manageothertask.find(query)
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

        const result = isEmpty ? [] : results;

        return res.status(200).json({
            totalProjects,
            totalProjectsOverall,
            result,
            currentPage: page,
            totalPages: Math.ceil(totalProjects / pageSize),
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});

exports.getOverallOthertaskCompanySort = catchAsyncErrors(async (req, res, next) => {
    let totalProjects, results, totalProjectsOverall;

    const { page, pageSize, project, searchQuery, category, allFilters, logicOperator, subcategory, assignedby, assignedmode, fromdate, todate, month, year } = req.body;


    try {
        let query = {};

        // Apply filters for other fields
        if (Array.isArray(project) && project.length > 0) {
            query.project = { $in: project };
        }

        if (Array.isArray(category) && category.length > 0) {
            query.category = { $in: category };
        }

        if (Array.isArray(subcategory) && subcategory.length > 0) {
            query.subcategory = { $in: subcategory };
        }

        if (Array.isArray(assignedby) && assignedby.length > 0) {
            query.assignedby = { $in: assignedby };
        }

        if (Array.isArray(assignedmode) && assignedmode.length > 0) {
            query.assignedmode = { $in: assignedmode };
        }
        // Date filtering
        if (fromdate && todate) {
            const fromDateObj = fromdate;
            const toDateObj = todate;

            query.date = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
        } else if (fromdate) {
            const fromDateObj = fromdate;
            query.date = {
                $gte: fromDateObj,
            };
        } else if (todate) {
            const toDateObj = todate;
            query.date = {
                $lte: toDateObj,
            };
        }

        // Month and Year filtering
        if ((Array.isArray(month) && month.length > 0) && (Array.isArray(year) && year.length > 0)) {
            const monthIndices = month.map(m => {
                // Convert month name to its index
                const date = new Date(`${m} 01, 2000`);
                return date.getMonth() + 1; // Months are 0-indexed, so add 1
            });


            query.$expr = {
                $and: [
                    {
                        $in: [
                            { $month: { $dateFromString: { dateString: '$date' } } },
                            monthIndices
                        ]
                    },
                    {
                        $in: [
                            { $year: { $dateFromString: { dateString: '$date' } } },
                            year
                        ]
                    }
                ]
            }
        } else if (Array.isArray(month) && month.length > 0) {
            const monthIndices = month.map(m => {
                // Convert month name to its index
                const date = new Date(`${m} 01, 2000`);
                return date.getMonth() + 1; // Months are 0-indexed, so add 1
            });
            query.$expr = {
                $in: [{ $month: { $dateFromString: { dateString: '$date' } } }, monthIndices]
            };
        } else if (Array.isArray(year) && year.length > 0) {

            query.$expr = {
                $in: [{ $year: { $dateFromString: { dateString: '$date' } } }, year]
            };
        }

        let conditions = [];

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
                    { project: regex },
                    { category: regex },
                    { subcategory: regex },
                    { total: regex },
                    { date: regex },
                    { time: regex },
                    { assignedby: regex },
                    { assignedmode: regex },
                    { ticket: regex },
                    { duedate: regex },
                    { duetime: regex },
                    { estimation: regex },
                    { estimationtime: regex },
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

        const isEmpty = Object.keys(query).length === 0;

        totalProjects = isEmpty ? 0 : await Manageothertask.find(query).countDocuments();
        totalProjectsOverall = isEmpty ? 0 : await Manageothertask.find(query)


        results = await Manageothertask.find(query)
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

        const result = isEmpty ? [] : results;

        return res.status(200).json({
            totalProjects,
            result,
            currentPage: page,
            totalProjectsOverall,
            totalPages: Math.ceil(totalProjects / pageSize),
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});

exports.getOverallOthertaskEmployeeSort = catchAsyncErrors(async (req, res, next) => {
    let totalProjects, results, totalProjectsOverall;

    const { page, pageSize, project, category, searchQuery, allFilters, logicOperator, subcategory, assignedby, assignedmode, fromdate, todate, month, year } = req.body;

    try {
        let query = {};

        // Apply filters for other fields
        if (Array.isArray(project) && project.length > 0) {
            query.project = { $in: project };
        }

        if (Array.isArray(category) && category.length > 0) {
            query.category = { $in: category };
        }

        if (Array.isArray(subcategory) && subcategory.length > 0) {
            query.subcategory = { $in: subcategory };
        }

        if (Array.isArray(assignedby) && assignedby.length > 0) {
            query.assignedby = { $in: assignedby };
        }

        if (Array.isArray(assignedmode) && assignedmode.length > 0) {
            query.assignedmode = { $in: assignedmode };
        }

        // Date filtering
        if (fromdate && todate) {
            const fromDateObj = fromdate;
            const toDateObj = todate;

            query.date = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
        } else if (fromdate) {
            const fromDateObj = fromdate;
            query.date = {
                $gte: fromDateObj,
            };
        } else if (todate) {
            const toDateObj = todate;
            query.date = {
                $lte: toDateObj,
            };
        }

        // Month and Year filtering
        if ((Array.isArray(month) && month.length > 0) && (Array.isArray(year) && year.length > 0)) {
            const monthIndices = month.map(m => {
                // Convert month name to its index
                const date = new Date(`${m} 01, 2000`);
                return date.getMonth() + 1; // Months are 0-indexed, so add 1
            });


            query.$expr = {
                $and: [
                    {
                        $in: [
                            { $month: { $dateFromString: { dateString: '$date' } } },
                            monthIndices
                        ]
                    },
                    {
                        $in: [
                            { $year: { $dateFromString: { dateString: '$date' } } },
                            year
                        ]
                    }
                ]
            }
        } else if (Array.isArray(month) && month.length > 0) {
            const monthIndices = month.map(m => {
                // Convert month name to its index
                const date = new Date(`${m} 01, 2000`);
                return date.getMonth() + 1; // Months are 0-indexed, so add 1
            });
            query.$expr = {
                $in: [{ $month: { $dateFromString: { dateString: '$date' } } }, monthIndices]
            };
        } else if (Array.isArray(year) && year.length > 0) {

            query.$expr = {
                $in: [{ $year: { $dateFromString: { dateString: '$date' } } }, year]
            };
        }

        let conditions = [];

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
                    { project: regex },
                    { category: regex },
                    { subcategory: regex },
                    { total: regex },
                    { date: regex },
                    { time: regex },
                    { assignedby: regex },
                    { assignedmode: regex },
                    { ticket: regex },
                    { duedate: regex },
                    { duetime: regex },
                    { estimation: regex },
                    { estimationtime: regex },
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

        const isEmpty = Object.keys(query).length === 0;

        totalProjects = isEmpty ? 0 : await Manageothertask.find(query).countDocuments();
        totalProjectsOverall = isEmpty ? 0 : await Manageothertask.find(query)


        results = await Manageothertask.find(query)
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

        const result = isEmpty ? [] : results;

        return res.status(200).json({
            totalProjects,
            result,
            currentPage: page,
            totalProjectsOverall,
            totalPages: Math.ceil(totalProjects / pageSize),
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});






//create new assignedby => /api/Manageothertask/new
exports.addManageothertask = catchAsyncErrors(async (req, res, next) => {


    let aManageothertask = await Manageothertask.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single Manageothertask => /api/Manageothertask/:id
exports.getSingleManageothertask = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let smanageothertask = await Manageothertask.findById(id);
    if (!smanageothertask) {
        return next(new ErrorHandler('Manageothertask not found', 404));
    }
    return res.status(200).json({
        smanageothertask
    })
})

//update Manageothertask by id => /api/Manageothertask/:id
exports.updateManageothertask = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let umanageothertask = await Manageothertask.findByIdAndUpdate(id, req.body);
    if (!umanageothertask) {
        return next(new ErrorHandler('Manageothertask not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete Manageothertask by id => /api/Manageothertask/:id
exports.deleteManageothertask = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dmanageothertask = await Manageothertask.findByIdAndRemove(id);
    if (!dmanageothertask) {
        return next(new ErrorHandler('Manageothertask not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})

// get All result => /api/results
exports.getOverallOthertaskSortFlag = catchAsyncErrors(async (req, res, next) => {
    let result;
    const { project, category, subcategory, fromdate, todate } = req.body;
    try {
        let query = {};

        // Apply filters for other fields
        if (Array.isArray(project) && project.length > 0) {
            query.project = { $in: project };
        }

        if (Array.isArray(category) && category.length > 0) {
            query.category = { $in: category };
        }

        if (Array.isArray(subcategory) && subcategory.length > 0) {
            query.subcategory = { $in: subcategory };
        }

        // Date filtering
        if (fromdate && todate) {
            const fromDateObj = fromdate;
            const toDateObj = todate;

            query.date = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
        } else if (fromdate) {
            const fromDateObj = fromdate;
            query.date = {
                $gte: fromDateObj,
            };
        } else if (todate) {
            const toDateObj = todate;
            query.date = {
                $lte: toDateObj,
            };
        }

        const isEmpty = Object.keys(query).length === 0;

        let productionunmatched = await Manageothertask.find(query, { project: 1, category: 1, subcategory: 1, date: 1, total: 1 }).lean();

        const unitRates = await ProductionIndividual.find({}, { vendor: 1, fromdate: 1, time: 1, category: 1, filename: 1, flagcount: 1 }).lean();

        // const unitRateMap = new Map(unitRates.map((item) => [item.vendor.split('-')[0] + "-" + item.filename + "-" + item.category, item]));
        const unitRateMap = new Map();

        unitRates.forEach((item) => {
            const key = item.fromdate + "-" + item.vendor.split('-')[0] + "-" + item.filename + "-" + item.category;
            if (!unitRateMap.has(key)) {
                unitRateMap.set(key, []);
            }
            unitRateMap.get(key).push(item);
        });

        result = productionunmatched.reduce((acc, obj) => {
            const matchUnitrate = unitRateMap.get(obj.date + "-" + obj.project + "-" + obj.category + "-" + obj.subcategory);

            // If matchUnitrate is an array, sum up the flagcounts
            const manualflagcount = matchUnitrate
                ? Array.isArray(matchUnitrate)
                    ? matchUnitrate.reduce((sum, item) => sum + Number(item.flagcount), 0)
                    : Number(matchUnitrate.flagcount)
                : 0;

            const finalflagcount = obj.total ? Number(obj.total) : 0;
            const diffflagcount = finalflagcount - manualflagcount;

            let status = '';
            if (manualflagcount === finalflagcount) {
                status = 'Reached';
            }

            else if (manualflagcount < finalflagcount) {
                status = 'Not Reached';
            }
            
            else if (manualflagcount > finalflagcount) {
                status = 'Not Reached';
            }

            acc.push({
                _id: obj._id,
                project: obj.project,
                category: obj.category,
                subcategory: obj.subcategory,
                diffflagcount: diffflagcount,
                total: obj.total,
                date: obj.date,
                manualflagcount: manualflagcount,
                status: status,
            });

            return acc;
        }, []);

    } catch (err) {
        return next(new ErrorHandler("Data not found", 404));
    }

    return res.status(200).json({
        result,
    });
});


//view all
exports.getOverallOthertaskView = catchAsyncErrors(async (req, res, next) => {
    let productionupload, mergedData, mergedDataall;
    try {
        // producionIndividual = await ProducionIndividual.find({}, {});
        let loginids = await ClientUserid.find({ loginallotlog: { $exists: true, $ne: [] } }, { empname: 1, userid: 1, loginallotlog: 1 }).lean();
        let users = await Users.find({}, { companyname: 1, empcode: 1, company: 1, unit: 1, branch: 1, team: 1, username: 1, processlog: 1, shifttiming: 1, department: 1, doj: 1, assignExpLog: 1, shiftallot: 1, boardingLog: 1 });


        let query = {
            vendor: new RegExp("^" + req.body.project),
            filename: { $in: req.body.category },
            category: { $in: req.body.subcategory },
            fromdate: { $in: req.body.fromdate },
        }
        productionupload = await ProductionIndividual.find(query, {
            vendor: 1, fromdate: 1, category: 1, filename: 1, flagcount: 1,
            unitid: 1, user: 1, alllogin: 1, section: 1, approvalstatus: 1, lateentrystatus: 1, time: 1, createdAt: 1

        });


        let mergedDataallfirst = productionupload.map((upload) => {
            const loginInfo = loginids.find((login) => login.userid === upload.user && login.projectvendor === upload.vendor);
            let loginallot = loginInfo && loginInfo.loginallotlog ? loginInfo.loginallotlog : [];
            let filteredDataDateTime = null;
            if (loginallot.length > 0) {
                const groupedByDateTime = {};

                // Group items by date and time
                loginallot.forEach((item) => {
                    const dateTime = item.date + " " + item.time; // Assuming item.updatetime contains time in HH:mm format
                    if (!groupedByDateTime[dateTime]) {
                        groupedByDateTime[dateTime] = [];
                    }
                    groupedByDateTime[dateTime].push(item);
                });
                // Extract the last item of each group
                const lastItemsForEachDateTime = Object.values(groupedByDateTime).map((group) => group[group.length - 1]);

                // Sort the last items by date and time
                lastItemsForEachDateTime.sort((a, b) => {
                    return new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time);
                });
                // Find the first item in the sorted array that meets the criteria

                for (let i = 0; i < lastItemsForEachDateTime.length; i++) {
                    const dateTime = lastItemsForEachDateTime[i].date + " " + lastItemsForEachDateTime[i].time;
                    // let datevalsplit = upload.mode == "Manual" ? upload.fromdate : upload.dateval.split(" ");
                    let datevalsplitfinal = upload.fromdate + " " + upload.time + ":00"
                    
                    /////
                    const datevalsplitfinalFormatted = datevalsplitfinal.replace(" PM:00", " PM"); // Remove ":00"
                    const parsedDatevalsplitfinal = new Date(datevalsplitfinalFormatted);
                    // Parse `dateTime`
                    const parsedDateTime = new Date(dateTime);
                    /////
                    
                    if (parsedDateTime <= parsedDatevalsplitfinal) {
                        filteredDataDateTime = lastItemsForEachDateTime[i];
                    } else {
                        break; // Break the loop if we encounter an item with date and time greater than or equal to selectedDateTime
                    }
                }
            }
            // const userInfo = loginInfo ? users.find(user => user.companyname === loginInfo.empname) : "";


            let logininfoname = loginallot.length > 0 ? filteredDataDateTime.empname : loginInfo ? loginInfo.empname : "";
            const userInfo = loginInfo ? users.find((user) => user.companyname === logininfoname) : "";
            // const userArray = loginInfo ? users.filter((user) => user.companyname === logininfoname) : "";
            return {
                user: upload.user,
                fromdate: upload.fromdate,
                todate: upload.todate,
                vendor: upload.vendor,
                category: upload.category,
                // dateval: upload.mode === "Manual" ? `${upload.fromdate} ${upload.time}:00` : upload.dateval.split(" IST")[0],
                // dateval: upload.mode === "Manual" ? `${upload.fromdate} ${upload.time}:00` : upload.dateval.split(" IST")[0],
                // olddateval: upload.mode === "Manual" ? `${upload.fromdate}T${upload.time}:00` : `${upload.dateval.split(" IST")[0]}T${upload.dateval.split(" ")[1]}`,
                createdAt: upload.createdAt,
                time: upload.time,
                filename: upload.filename,
                empname: loginInfo && loginInfo.empname,
                empcode: userInfo && userInfo.empcode,
                company: userInfo && userInfo.company,
                unit: userInfo && userInfo.unit,
                branch: userInfo && userInfo.branch,
                team: userInfo && userInfo.team,

                username: userInfo && userInfo.username,
                _id: upload._id,

                section: upload.section,
                csection: upload.updatedsection ? upload.updatedsection : "",
                flagcount: upload.flagcount,
                cflagcount: upload.updatedflag ? upload.updatedflag : "",
                lateentrystatus: upload.lateentrystatus,
                approvalstatus: upload.approvalstatus,
                unitid: upload.unitid,
                filename: upload.filename,
                points: Number(upload.unitrate) * 8.333333333333333,
                cpoints: upload.updatedunitrate ? Number(upload.updatedunitrate) * 8.333333333333333 : "",
                unitrate: Number(upload.unitrate),
                cunitrate: upload.updatedunitrate ? Number(upload.updatedunitrate) : "",
            };

        });
        mergedDataall = mergedDataallfirst.map(curr => {
            return {
                vendor: curr.vendor, // Include section
                category: curr.category,
                filename: curr.filename,
                fromdate: curr.fromdate,
                flagcount: curr.flagcount,
                unitid: curr.unitid,
                user: curr.user,
                alllogin: curr.alllogin,
                section: curr.section,
                approvalstatus: curr.approvalstatus,
                lateentrystatus: curr.lateentrystatus,
                time: curr.time,
                empname: curr.empname,
                empcode: curr.empcode,
                company: curr.company,
                unit: curr.unit,
                branch: curr.branch,
                team: curr.team,
                unitrate: curr.unitrate,
                points: curr.points,
                points: curr.points,
                createdAt: curr.createdAt,
                _id: curr._id,
            };

        });

        mergedData = mergedDataall.filter(item => item != null)
    } catch (err) {
        return next(new ErrorHandler("Data not found", 404));
    }
    if (!productionupload) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        mergedData,
    });
});

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


//othertaskconsolidatedreport
exports.getOverallOthertaskConsolidatedReport = catchAsyncErrors(async (req, res, next) => {
    let result = [], productionunmatched = [], productionindividual = [], othertaskupload = [], allData = [];
    const { project, category, subcategory, fromdate, todate } = req.body;
    try {
        let query = {};
        let queryManual = {};
        let queryothertaskupload = {};

        // Apply filters for other fields
        if (Array.isArray(project) && project.length > 0) {
            // query.project = { $in: project };
            // queryManual.vendor = { $in: project.map(item => new RegExp("^" + item)) };
            // queryothertaskupload.vendor = { $in: project.map(item => new RegExp("^" + item)) };

            query.project = project;
            queryManual.vendor = project.map(item => new RegExp("^" + item));
            queryothertaskupload.vendor = project.map(item => new RegExp("^" + item));


        }

        if (Array.isArray(category) && category.length > 0) {
            query.category = { $in: category };
            queryManual.filename = { $in: category };
            queryothertaskupload.filenameupdated = { $in: category };
        }

        if (Array.isArray(subcategory) && subcategory.length > 0) {
            query.subcategory = { $in: subcategory };
            queryManual.category = { $in: subcategory };
            queryothertaskupload.category = { $in: subcategory };
        }

        // Date filtering
        if (fromdate && todate) {
            const fromDateObj = fromdate;
            const toDateObj = todate;

            query.date = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
            queryManual.fromdate = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
            queryothertaskupload.formatteddate = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };

        } else if (fromdate) {
            const fromDateObj = fromdate;
            query.date = {
                $gte: fromDateObj,
            };
            queryManual.fromdate = {
                $gte: fromDateObj,
            };
            queryothertaskupload.formatteddate = {
                $gte: fromDateObj,
            };
        } else if (todate) {
            const toDateObj = todate;
            query.date = {
                $lte: toDateObj,
            };
            queryManual.fromdate = {
                $lte: toDateObj,
            };
            queryothertaskupload.formatteddate = {
                $lte: toDateObj,
            };
        }


        if (req.body.mode.includes('Other task queues')) {
            productionunmatched = await Manageothertask.find(query, { project: 1, category: 1, subcategory: 1, date: 1, total: 1 }).lean();

        }
        if (req.body.mode.includes('Manual Entry')) {
            productionindividual = await ProductionIndividual.find(queryManual, { vendor: 1, filename: 1, category: 1, fromdate: 1, flagcount: 1 }).lean();
        }
        if (req.body.mode.includes('Other task upload')) {
            othertaskupload = await OtherTaskUpload.find(queryothertaskupload, { vendor: 1, filenameupdated: 1, category: 1, formatteddate: 1, flagcount: 1 }).lean();
        }
        productionunmatched = productionunmatched.map(item => ({ ...item, mode: "Other task queues" }))
        productionindividual = productionindividual.map(item => ({
            ...item, date: item.fromdate, project: item.vendor.split("-")[0],
            category: item.filename, subcategory: item.category,
            mode: "Manual Entry"
        }))
        othertaskupload = othertaskupload.map(item => ({ ...item, project: item.vendor.split("-")[0], date: item.formatteddate, category: item.filenameupdated, subcategory: item.category, mode: "Other task upload" }))
        allData =
            req.body.mode.includes('Other task queues') &&
                req.body.mode.includes('Manual Entry') &&
                req.body.mode.includes('Other task upload')
                ? [...productionunmatched, ...productionindividual, ...othertaskupload]
                : req.body.mode.includes('Other task queues') &&
                    req.body.mode.includes('Manual Entry')
                    ? [...productionunmatched, ...productionindividual]
                    : req.body.mode.includes('Other task queues') &&
                        req.body.mode.includes('Other task upload')
                        ? [...productionunmatched, ...othertaskupload]
                        : req.body.mode.includes('Other task queues')
                            ? productionunmatched
                            : req.body.mode.includes('Manual Entry')
                                ? productionindividual
                                : req.body.mode.includes('Other task upload')
                                    ? othertaskupload
                                    : [];


        // console.log(othertaskupload.length, "taskupload")
        // console.log(productionindividual.length, "productionindividual")
        // console.log(productionunmatched.length, "productionunmatched")



        let Queuetypemaster = await QueueTypeMaster.find({}, { category: 1, subcategory: 1, newrate: 1, type: 1 }).lean();

        // console.log(Queuetypemaster, "Queuetypemaster")

        const QueuetypeMap = new Map(Queuetypemaster.map((item) => [item.category + "-" + item.subcategory + "-" + item.type, item]));
        // console.log(QueuetypeMap, "QueuetypeMap")

        result = allData.reduce((accumulator, currentEntry) => {
            // const finalcategory = currentEntry.mode == "Other task queues" ? currentEntry.category : currentEntry.mode == "Other task upload" ? currentEntry.filenameupdated : currentEntry.filename
            // const finalsubcategory = currentEntry.mode == "Other task queues" ? currentEntry.subcategory : currentEntry.mode == "Other task upload" ? currentEntry.category : currentEntry.category
            // const finaldate = currentEntry.mode == "Other task queues" ? currentEntry.date : currentEntry.mode == "Other task upload" ? currentEntry.formatteddate : currentEntry.fromdate
            // const finalproject = currentEntry.mode == "Other task queues" ? currentEntry.project : currentEntry.mode == "Other task upload" ? currentEntry.vendor?.split("-")[0] : currentEntry.vendor?.split("-")[0]
            const finaltotal = currentEntry.mode == "Other task queues" ? currentEntry.total : currentEntry.mode == "Other task upload" ? currentEntry.flagcount : currentEntry.flagcount

            console.log(currentEntry.mode, "mode")
            const matchQueuetype = QueuetypeMap.get(`${currentEntry.category}-${currentEntry.subcategory}-${currentEntry.mode}`);

            // console.log(matchQueuetype, "matchQueuetype")
            const newrateValue = matchQueuetype ? Number(matchQueuetype.newrate) : 0;
            // console.log(newrateValue, "newrateValue")

            const existingIndex = accumulator.findIndex((existingEntry) => {

                // const extfinalcategory = existingEntry.mode == "Other task queues" ? existingEntry.category : existingEntry.mode == "Other task upload" ? existingEntry.filenameupdated : existingEntry.filename
                // const extfinalsubcategory = existingEntry.mode == "Other task queues" ? existingEntry.subcategory : existingEntry.mode == "Other task upload" ? existingEntry.category : existingEntry.category
                // const extfinaldate = existingEntry.mode == "Other task queues" ? existingEntry.date : existingEntry.mode == "Other task upload" ? existingEntry.formatteddate : existingEntry.fromdate
                // const extfinalproject = existingEntry.mode == "Other task queues" ? existingEntry.project : existingEntry.mode == "Other task upload" ? existingEntry.vendor?.split("-")[0] : existingEntry.vendor?.split("-")[0]
                // const extfinaltotal = existingEntry.mode == "Other task queues" ? existingEntry.total : existingEntry.mode == "Other task upload" ? existingEntry.flagcount : existingEntry.flagcount


                return (
                    existingEntry.date === currentEntry.date &&
                    existingEntry.mode === currentEntry.mode &&
                    existingEntry.project === currentEntry.project &&
                    existingEntry.category === currentEntry.category &&
                    existingEntry.subcategory === currentEntry.subcategory
                )
            }
            );

            if (existingIndex !== -1) {


                // Update existing entry
                accumulator[existingIndex].total += Number(finaltotal);
                accumulator[existingIndex].newrate = newrateValue;
                accumulator[existingIndex].mode = currentEntry.mode;
                accumulator[existingIndex].totalnew += newrateValue * Number(finaltotal);
            } else {
                // Add new entry
                accumulator.push({
                    _id: currentEntry._id,
                    project: currentEntry.project,
                    category: currentEntry.category,
                    subcategory: currentEntry.subcategory,
                    total: Number(finaltotal),
                    newrate: newrateValue,
                    date: currentEntry.date,
                    mode: currentEntry.mode,
                    totalnew: (newrateValue * Number(finaltotal))
                });
            }

            return accumulator;
        }, []);
        // console.log(result[1], "asdrfe")


    } catch (err) {
        console.log(err);
    }

    return res.status(200).json({
        result,
    });
});


//individualconsolidatedreport
exports.getOverallOthertaskIndividualReport = catchAsyncErrors(async (req, res, next) => {
    let result = [], productionunmatched = [], productionindividual = [], othertaskupload = [], allData = [];
    const { project, category, subcategory, fromdate, todate } = req.body;
    try {
        let query = {};
        let queryManual = {};
        let queryothertaskupload = {};

        // Apply filters for other fields
        if (Array.isArray(project) && project.length > 0) {
            // query.project = { $in: project };
            // queryManual.vendor = { $in: project.map(item => new RegExp("^" + item)) };
            // queryothertaskupload.vendor = { $in: project.map(item => new RegExp("^" + item)) };
            query.project = project;
            queryManual.vendor = project.map(item => new RegExp("^" + item));
            queryothertaskupload.vendor = project.map(item => new RegExp("^" + item));


        }

        if (Array.isArray(category) && category.length > 0) {
            query.category = { $in: category };
            queryManual.filename = { $in: category };
            queryothertaskupload.filenameupdated = { $in: category };
        }

        if (Array.isArray(subcategory) && subcategory.length > 0) {
            query.subcategory = { $in: subcategory };
            queryManual.category = { $in: subcategory };
            queryothertaskupload.category = { $in: subcategory };
        }

        // Date filtering
        if (fromdate && todate) {
            const fromDateObj = fromdate;
            const toDateObj = todate;

            query.date = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
            queryManual.fromdate = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };
            queryothertaskupload.formatteddate = {
                $gte: fromDateObj,
                $lte: toDateObj,
            };

        } else if (fromdate) {
            const fromDateObj = fromdate;
            query.date = {
                $gte: fromDateObj,
            };
            queryManual.fromdate = {
                $gte: fromDateObj,
            };
            queryothertaskupload.formatteddate = {
                $gte: fromDateObj,
            };
        } else if (todate) {
            const toDateObj = todate;
            query.date = {
                $lte: toDateObj,
            };
            queryManual.fromdate = {
                $lte: toDateObj,
            };
            queryothertaskupload.formatteddate = {
                $lte: toDateObj,
            };
        }

        // console.log(queryothertaskupload, "queryothertaskupload")

        // console.log(req.body.mode, "mode")

        if (req.body.mode.includes('Other task queues')) {
            productionunmatched = await Manageothertask.find(query, { project: 1, category: 1, subcategory: 1, date: 1, total: 1 }).lean();

        }
        if (req.body.mode.includes('Manual Entry')) {
            productionindividual = await ProducionIndividual.find(queryManual, { vendor: 1, filename: 1, category: 1, fromdate: 1, flagcount: 1 }).lean();
        }
        if (req.body.mode.includes('Other task upload')) {
            othertaskupload = await OtherTaskUpload.find(queryothertaskupload, { vendor: 1, filenameupdated: 1, category: 1, formatteddate: 1, flagcount: 1 }).lean();
        }
        // console.log(othertaskupload.length, "taskupload")
        // console.log(productionindividual.length, "productionindividual")
        // console.log(productionunmatched.length, "productionunmatched")

        allData =
            req.body.mode.includes('Other task queues') &&
                req.body.mode.includes('Manual Entry') &&
                req.body.mode.includes('Other task upload')
                ? [...productionunmatched.map(item => ({ ...item, mode: "Other task queues" })), ...productionindividual.map(item => ({ ...item, mode: "Manual Entry" })), ...othertaskupload.map(item => ({ ...item, mode: "Other task upload" }))]
                : req.body.mode.includes('Other task queues') &&
                    req.body.mode.includes('Manual Entry')
                    ? [...productionunmatched.map(item => ({ ...item, mode: "Other task queues" })), ...productionindividual.map(item => ({ ...item, mode: "Manual Entry" }))]
                    : req.body.mode.includes('Other task queues') &&
                        req.body.mode.includes('Other task upload')
                        ? [...productionunmatched.map(item => ({ ...item, mode: "Other task queues" })), ...othertaskupload.map(item => ({ ...item, mode: "Other task upload" }))]
                        : req.body.mode.includes('Other task queues')
                            ? productionunmatched.map(item => ({ ...item, mode: "Other task queues" }))
                            : req.body.mode.includes('Manual Entry')
                                ? productionindividual.map(item => ({ ...item, mode: "Manual Entry" }))
                                : req.body.mode.includes('Other task upload')
                                    ? othertaskupload.map(item => ({ ...item, mode: "Other task upload" }))
                                    : [];


        // console.log(allData, "allData")


        let Queuetypemaster = await QueueTypeMaster.find({}, { category: 1, subcategory: 1, newrate: 1, type: 1 }).lean();

        const QueuetypeMap = new Map(Queuetypemaster.map((item) => [item.category + "-" + item.subcategory + "-" + item.type, item]));

        result = allData.map((item, index) => {

            const finalcategory = item.mode == "Other task queues" ? item.category : item.mode == "Other task upload" ? item.filenameupdated : item.filename
            const finalsubcategory = item.mode == "Other task queues" ? item.subcategory : item.mode == "Other task upload" ? item.category : item.category
            const finaldate = item.mode == "Other task queues" ? item.date : item.mode == "Other task upload" ? item.formatteddate : item.fromdate
            const finalproject = item.mode == "Other task queues" ? item.project : item.mode == "Other task upload" ? item.vendor.split("-")[0] : item.vendor.split("-")[0]
            const finaltotal = item.mode == "Other task queues" ? item.total : item.mode == "Other task upload" ? item.flagcount : item.flagcount

            const finalmode = item.mode



            // console.log(finalcategory, "finalcategory")
            // console.log(finaldate, "finaldate")
            const matchQueuetype = QueuetypeMap.get(`${finalcategory}-${finalsubcategory}-${finalmode}`);
            const newrateValue = matchQueuetype ? Number(matchQueuetype.newrate) : 0;

            return {
                _id: item._id,
                project: finalproject,
                category: finalcategory,
                subcategory: finalsubcategory,
                total: Number(finaltotal),
                newrate: newrateValue,
                date: finaldate,
                mode: item.mode,
                totalnew: (newrateValue * Number(finaltotal))
            }
        });

    } catch (err) {
        console.log(err);
    }

    return res.status(200).json({
        result,
    });
});

