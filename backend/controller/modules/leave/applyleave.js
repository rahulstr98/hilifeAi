const Applyleave = require('../../../model/modules/leave/applyleave');
const ErrorHandler = require('../../../utils/errorhandler');
const User = require("../../../model/login/auth");
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Leavetype = require('../../../model/modules/leave/leavetype');
const LeaveVerification = require("../../../model/modules/leave/leaveverification");
const Hirerarchi = require('../../../model/modules/setup/hierarchy');
const Designation = require("../../../model/modules/designation");
const MyCheckList = require('../../../model/modules/interview/Myinterviewchecklist');
const { Hierarchyfilter } = require('../../../utils/taskManagerCondition');


//get All Applyleave =>/api/Applyleave
exports.getAllApplyleave = catchAsyncErrors(async (req, res, next) => {
    let applyleaves;
    try {
        applyleaves = await Applyleave.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler('Applyleave not found!', 404));
    }
    return res.status(200).json({
        applyleaves
    });
})
exports.getActiveApplyleave = catchAsyncErrors(async (req, res, next) => {
    let applyleaves;
    let users;
    try {
        users = await User.find(
            {

                resonablestatus: {
                    $in: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
                },
            },
            {

                companyname: 1,
            }
        );

        let companyname = users.map(d => d.companyname)
        applyleaves = await Applyleave.find({ employeename: { $nin: companyname }, status: "Applied" }, {});
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler('Data not found!', 404));
    }
    return res.status(200).json({
        applyleaves
    });
})
//get All Applyleave =>/api/Applyleavefilter
exports.getAllApplyleaveFilter = catchAsyncErrors(async (req, res, next) => {
    let applyleaves;
    try {
        applyleaves = await Applyleave.find(
            {},
            {
                company: 1,
                branch: 1,
                unit: 1,
                team: 1,
                department: 1,
                date: 1,
                status: 1,
                employeename: 1,
                employeeid: 1,
                leavetype: 1,
                reasonforleave: 1,
                rejectedreason: 1,
                numberofdays: 1,
            }
        );
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler("Applyleave not found!", 404));
    }
    return res.status(200).json({
        applyleaves,
    });
});

//create new Applyleave => /api/Applyleave/new
exports.addApplyleave = catchAsyncErrors(async (req, res, next) => {
    // let checkmain = await Addexists.findOne({ name: req.body.name });
    // if (checkmain) {
    //     return next(new ErrorHandler('Name already exist!', 400));
    // }
    let aApplyleave = await Applyleave.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single Applyleave => /api/Applyleave/:id
exports.getSingleApplyleave = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let sapplyleave = await Applyleave.findById(id);
    if (!sapplyleave) {
        return next(new ErrorHandler('Applyleave not found', 404));
    }
    return res.status(200).json({
        sapplyleave
    })
})

//update Applyleave by id => /api/Applyleave/:id
exports.updateApplyleave = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let uapplyleave = await Applyleave.findByIdAndUpdate(id, req.body);
    if (!uapplyleave) {
        return next(new ErrorHandler('Applyleave not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete Applyleave by id => /api/Applyleave/:id
exports.deleteApplyleave = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dapplyleave = await Applyleave.findByIdAndRemove(id);
    if (!dapplyleave) {
        return next(new ErrorHandler('Applyleave not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})

exports.getAllApplyleaveApprovedForUserShiftRoaster = catchAsyncErrors(async (req, res, next) => {
    let applyleave;
    let leavetype;
    let applyleaves = [];
    try {
        applyleave = await Applyleave.find({}, { status: req.body.status, usershifts: 1, leavetype: 1, employeeid: 1 },);
        leavetype = await Leavetype.find();

        leavetype?.map((type) => {
            applyleave?.forEach((d) => {
                if (type.leavetype === d.leavetype) {
                    d.usershifts.forEach((shift) => {
                        applyleaves.push({
                            date: shift.formattedDate,
                            leavetype: d.leavetype,
                            status: d.status,
                            code: type.code,
                            tookleavecheckstatus: shift.tookleavecheckstatus,
                            leavestatus: shift.leavestatus,
                            shiftcount: shift.shiftcount,
                            empcode: d.employeeid,
                        });
                    });
                }
            });
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler('Applyleave not found!', 404));
    }
    return res.status(200).json({
        applyleaves
    });
})
exports.getAllApprovedLeave = catchAsyncErrors(async (req, res, next) => {
    let approvedleaves;
    try {
        approvedleaves = await Applyleave.find({ status: 'Approved' })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!approvedleaves) {
        return res.json({});
    }
    return res.status(200).json({
        approvedleaves
    });
});
exports.getAllApplyleaveApprovedForUserShiftRoasterAssignbranch = catchAsyncErrors(async (req, res, next) => {
    const { assignbranch } = req.body;


    const query = {}
    if (assignbranch.length > 0) {
        query.$or = assignbranch.map(item => ({
            company: item.company,
            branch: item.branch,
            unit: item.unit

        }))
    };

    let applyleave;
    let leavetype;
    let applyleaves = [];
    try {
        applyleave = await Applyleave.find(query, { status: req.body.status, usershifts: 1, leavetype: 1, employeeid: 1 },);
        leavetype = await Leavetype.find(query);

        leavetype?.map((type) => {
            applyleave?.forEach((d) => {
                if (type.leavetype === d.leavetype) {
                    d.usershifts.forEach((shift) => {
                        applyleaves.push({
                            date: shift.formattedDate,
                            leavetype: d.leavetype,
                            status: d.status,
                            code: type.code,
                            tookleavecheckstatus: shift.tookleavecheckstatus,
                            leavestatus: shift.leavestatus,
                            shiftcount: shift.shiftcount,
                            empcode: d.employeeid,
                        });
                    });
                }
            });
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler('Applyleave not found!', 404));
    }
    return res.status(200).json({
        applyleaves
    });
})

exports.getAllApplyleaveHome = catchAsyncErrors(async (req, res, next) => {
    let applyleaves;
    try {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
        applyleaves = await Applyleave.countDocuments({ status: "Approved", date: { $in: formattedDate } }, { date: 1 })
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        applyleaves
    });
})



exports.getAllApplyleaveHomeList = catchAsyncErrors(async (req, res, next) => {
    let applyleaves;
    try {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
        applyleaves = await Applyleave.find({ status: "Approved", date: { $in: formattedDate } }, {})

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler('Applyleave not found!', 404));
    }
    return res.status(200).json({
        applyleaves
    });
});


//Hierarchy Based applied Users
exports.getAllUserAppliedHierarchyBasedLeaves = catchAsyncErrors(async (req, res, next) => {
    let user, result1, finalToShow, ans1D, DataAccessMode = false, result2, result3, result4, result5, result6, userFilter, result, hierarchyFilter, answerDef, hierarchyFinal, hierarchyDefList, resultAccessFilter, hierarchySecond, overallMyallList, hierarchyMap, resulted, resultedTeam, myallTotalNames, count;

    try {
        // console.log( req.body, "req.body")
        let levelFinal = req.body?.sector === 'all' ? ['Primary', 'Secondary', 'Tertiary'] : [req.body?.sector];
        let answer = await Hirerarchi.aggregate([
            {
                $match: {
                    supervisorchoose: req?.body?.username, // Match supervisorchoose with username
                    level: { $in: levelFinal }, // Corrected unmatched quotation mark
                },
            },
            {
                $lookup: {
                    from: 'reportingheaders',
                    let: {
                        teamControlsArray: {
                            $ifNull: ['$pagecontrols', []],
                        },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $in: ['$name', '$$teamControlsArray'],
                                        }, // Check if 'name' is in 'teamcontrols' array
                                        {
                                            $in: [
                                                req?.body?.pagename,
                                                '$reportingnew', // Check if 'menuteamloginstatus' is in 'reportingnew' array
                                            ],
                                        }, // Additional condition for reportingnew array
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'reportData', // The resulting matched documents will be in this field
                },
            },
            {
                $project: {
                    supervisorchoose: 1,
                    employeename: 1,
                    reportData: 1,
                },
            },
        ]);

        // Manager Condition Without Supervisor
        const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
        DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
        const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);




        let restrictList = answer?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);
        const users = await User.find(
            {
                resonablestatus: {
                    $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
                },
            },
            {
                employeename: 1,
                companyname: 1,
            }
        );

        let companyname = users.map((d) => d.companyname);
        result = await Applyleave.find(
            { employeename: { $nin: companyname }, status: 'Applied' },
            {
                leavetype: 1,
                employeename: 1,
                access: 1,
                reasonforleave: 1,
                date: 1,
                todate: 1,
                team: 1,
                status: 1,
                employeeid: 1,
                numberofdays: 1,
                noofdays: 1,
            }
        ).lean();

        // Accordig to sector and list filter process
        hierarchyFilter = await Hirerarchi.find({ level: req.body.sector }).lean();
        userFilter = hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

        hierarchyDefList = await Hirerarchi.find().lean();
        user = await User.find({ companyname: req.body.username }, { designation: 1 }).lean();
        const userFilt = user.length > 0 && user[0].designation;
        const desiGroup = await Designation.find().lean();
        let HierarchyFilt = req.body.sector === 'all' ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup) : hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup);
        const DesifFilter = desiGroup.filter((data) => HierarchyFilt.includes(data.group));
        const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
        const SameDesigUser = HierarchyFilt.includes('All') ? true : userFilt === desigName;
        //Default Loading of List
        answerDef = hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

        hierarchyFinal = req.body.sector === 'all' ? (answerDef.length > 0 ? [].concat(...answerDef) : []) : hierarchyFilter.length > 0 ? [].concat(...userFilter) : [];

        hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];

        //solo
        ans1D = req.body.sector === 'all' ? (answerDef.length > 0 ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)) : []) : hierarchyFilter.length > 0 ? hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)) : [];
        result1 =
            ans1D.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = ans1D.find((item2) => item2.employeename.includes(item1.employeename));

                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            //   return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];

        resulted = result1;

        //team
        let branches = [];
        hierarchySecond = await Hirerarchi.find().lean();

        const subBranch =
            hierarchySecond.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';

        const answerFilterExcel = hierarchySecond.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name))) : [];

        result2 =
            answerFilterExcel.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            // If a match is found, inject the control property into the corresponding item in an1
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...subBranch);

        const ans =
            subBranch.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';
        const answerFilterExcel2 = subBranch.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name))) : [];

        result3 =
            answerFilterExcel2.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel2.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...ans);

        const loop3 =
            ans.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => ans.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';

        const answerFilterExcel3 = ans.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => ans.includes(name))) : [];

        result4 =
            answerFilterExcel3.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel3?.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...loop3);

        const loop4 =
            loop3.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => loop3.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : [];
        const answerFilterExcel4 = loop3.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop3.includes(name))) : [];
        result5 =
            answerFilterExcel4.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel4?.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...loop4);

        const loop5 =
            loop4.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => loop4.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';
        const answerFilterExcel5 = loop4.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop4.includes(name))) : [];
        result6 =
            answerFilterExcel5.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel5?.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...loop5);

        resultedTeam = [...result2, ...result3, ...result4, ...result5, ...result6];
        //overall Teams List
        myallTotalNames = DataAccessMode ? uniqueNames : [...hierarchyMap, ...branches];
        const usersFinal = await User.find(
            {
                resonablestatus: {
                    $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
                },
            },
            {
                employeename: 1,
                companyname: 1,
            }
        );
        const finalUserNames = usersFinal?.map(data => data?.companyname);
        const filteredEmployeeNames = myallTotalNames?.filter(data => !finalUserNames?.includes(data))
        const finalResult = await Applyleave.find(
            { employeename: { $in: filteredEmployeeNames }, status: { $in: ['Applied'] } },
            {
                leavetype: 1,
                employeename: 1,
                access: 1,
                reasonforleave: 1,
                date: 1,
                todate: 1,
                company: 1,
                branch: 1,
                unit: 1,
                team: 1,
                department: 1,
                designation: 1,
                status: 1,
                employeeid: 1,
                numberofdays: 1,
                noofdays: 1,
            }
        ).lean();



        overallMyallList = [...resulted, ...resultedTeam];

        const restrictTeam = await Hirerarchi.aggregate([
            {
                $match: {
                    supervisorchoose: { $in: myallTotalNames }, // Match supervisorchoose with username
                    level: { $in: levelFinal }, // Corrected unmatched quotation mark
                },
            },
            {
                $lookup: {
                    from: 'reportingheaders',
                    let: {
                        teamControlsArray: {
                            $ifNull: ['$pagecontrols', []],
                        },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $in: ['$name', '$$teamControlsArray'],
                                        }, // Check if 'name' is in 'teamcontrols' array
                                        {
                                            $in: [
                                                req?.body?.pagename,
                                                '$reportingnew', // Check if 'menuteamloginstatus' is in 'reportingnew' array
                                            ],
                                        }, // Additional condition for reportingnew array
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'reportData', // The resulting matched documents will be in this field
                },
            },
            {
                $project: {
                    supervisorchoose: 1,
                    employeename: 1,
                    reportData: 1,
                },
            },
        ]);
        let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);
        let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === 'myhierarchy' ? restrictList : req.body.hierachy === 'allhierarchy' ? restrictListTeam : [...restrictList, ...restrictListTeam]);

        let resultAccessFiltered = DataAccessMode ? finalResult : (req.body.hierachy === 'myhierarchy' ? resulted : req.body.hierachy === 'allhierarchy' ? resultedTeam : req.body.hierachy === 'myallhierarchy' ? overallMyallList : result);
        const myCheckList = await MyCheckList.find({ candidatename: { $in: overallRestrictList }, status: 'progress', mainpage: 'Apply Leave' }).lean();

        resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFiltered?.filter((data) => overallRestrictList?.includes(data?.employeename)) : [];


        uniqueDataresult = resultedTeam?.filter((item, index, self) => index === self.findIndex((obj) => obj._id === item._id));
        uniqueData = resultAccessFilter?.filter((item, index, self) => index === self.findIndex((obj) => obj._id === item._id));

        finalToShow = uniqueData.map((item) => {
            let foundData = myCheckList?.find((dataNew) => dataNew.commonid == item._id);
            let areAllGroupsCompleted;
            areAllGroupsCompleted = foundData?.groups?.every((itemNew) => (itemNew.data !== undefined && itemNew.data !== '') || itemNew.files !== undefined);

            if (areAllGroupsCompleted) {
                return {
                    ...item,
                    updatestatus: 'Completed',
                };
            } else {
                return {
                    ...item,
                    updatestatus: 'Not Completed',
                };
            }
        });
    } catch (err) {
        console.log(err, 'err');
        return next(new ErrorHandler('Records not found!', 404));
    }
    return res.status(200).json({
        resultedTeam: uniqueDataresult,
        resultAccessFilter: finalToShow,
        count: finalToShow?.length,
        DataAccessMode
        // hierarchyFilter,
        // myallTotalNames,
    });
});
//Hierarchy Based applied Users
exports.getAllUserAppliedHierarchyBasedLeavesPage = catchAsyncErrors(async (req, res, next) => {
    let user, result1, ans1D, result2, result3, DataAccessMode = false, result4, result5, result6, userFilter, result, hierarchyFilter, answerDef, hierarchyFinal, hierarchyDefList, resultAccessFilter, hierarchySecond, overallMyallList, hierarchyMap, resulted, resultedTeam, myallTotalNames, count, uniqueData, finalToShow;
    try {
        // console.log( req.body, "req.body")
        let levelFinal = req.body?.sector === 'all' ? ['Primary', 'Secondary', 'Tertiary'] : [req.body?.sector];
        let answer = await Hirerarchi.aggregate([
            {
                $match: {
                    supervisorchoose: req?.body?.username, // Match supervisorchoose with username
                    level: { $in: levelFinal }, // Corrected unmatched quotation mark
                },
            },
            {
                $lookup: {
                    from: 'reportingheaders',
                    let: {
                        teamControlsArray: {
                            $ifNull: ['$pagecontrols', []],
                        },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $in: ['$name', '$$teamControlsArray'],
                                        }, // Check if 'name' is in 'teamcontrols' array
                                        {
                                            $in: [
                                                req?.body?.pagename,
                                                '$reportingnew', // Check if 'menuteamloginstatus' is in 'reportingnew' array
                                            ],
                                        }, // Additional condition for reportingnew array
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'reportData', // The resulting matched documents will be in this field
                },
            },
            {
                $project: {
                    supervisorchoose: 1,
                    employeename: 1,
                    reportData: 1,
                },
            },
        ]);


        // Manager Condition Without Supervisor
        const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
        DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
        const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);


        let restrictList = answer?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);
        const users = await User.find(
            {
                resonablestatus: {
                    $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
                },
            },
            {
                employeename: 1,
                companyname: 1,
            }
        );

        let companyname = users.map((d) => d.companyname);
        result = await Applyleave.find(
            { employeename: { $nin: companyname }, status: { $in: ['Applied'] } },
            {
                leavetype: 1,
                employeename: 1,
                access: 1,
                reasonforleave: 1,
                date: 1,
                todate: 1,
                company: 1,
                branch: 1,
                unit: 1,
                team: 1,
                department: 1,
                designation: 1,
                status: 1,
                employeeid: 1,
                numberofdays: 1,
                noofdays: 1,
            }
        ).lean();
        // Accordig to sector and list filter process
        hierarchyFilter = await Hirerarchi.find({ level: req.body.sector }).lean();
        userFilter = hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

        hierarchyDefList = await Hirerarchi.find().lean();
        user = await User.find({ companyname: req.body.username }, { designation: 1 }).lean();
        const userFilt = user.length > 0 && user[0].designation;
        const desiGroup = await Designation.find().lean();
        let HierarchyFilt = req.body.sector === 'all' ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup) : hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup);
        const DesifFilter = desiGroup.filter((data) => HierarchyFilt.includes(data.group));
        const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
        const SameDesigUser = HierarchyFilt.includes('All') ? true : userFilt === desigName;
        //Default Loading of List
        answerDef = hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

        hierarchyFinal = req.body.sector === 'all' ? (answerDef.length > 0 ? [].concat(...answerDef) : []) : hierarchyFilter.length > 0 ? [].concat(...userFilter) : [];

        hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];

        //solo
        ans1D = req.body.sector === 'all' ? (answerDef.length > 0 ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)) : []) : hierarchyFilter.length > 0 ? hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)) : [];
        result1 =
            ans1D.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = ans1D.find((item2) => item2.employeename.includes(item1.employeename));

                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            //   return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];

        resulted = result1;

        //team
        let branches = [];
        hierarchySecond = await Hirerarchi.find().lean();

        const subBranch =
            hierarchySecond.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';

        const answerFilterExcel = hierarchySecond.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name))) : [];

        result2 =
            answerFilterExcel.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            // If a match is found, inject the control property into the corresponding item in an1
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...subBranch);

        const ans =
            subBranch.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';
        const answerFilterExcel2 = subBranch.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name))) : [];

        result3 =
            answerFilterExcel2.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel2.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...ans);

        const loop3 =
            ans.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => ans.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';

        const answerFilterExcel3 = ans.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => ans.includes(name))) : [];

        result4 =
            answerFilterExcel3.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel3?.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...loop3);

        const loop4 =
            loop3.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => loop3.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : [];
        const answerFilterExcel4 = loop3.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop3.includes(name))) : [];
        result5 =
            answerFilterExcel4.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel4?.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...loop4);

        const loop5 =
            loop4.length > 0
                ? hierarchySecond
                    .filter((item) => item.supervisorchoose.some((name) => loop4.includes(name)))
                    .map((item) => item.employeename)
                    .flat()
                : '';
        const answerFilterExcel5 = loop4.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop4.includes(name))) : [];
        result6 =
            answerFilterExcel5.length > 0
                ? result
                    .map((item1) => {
                        const matchingItem2 = answerFilterExcel5?.find((item2) => item2.employeename.includes(item1.employeename));
                        if (matchingItem2) {
                            const plainItem1 = item1.toObject ? item1.toObject() : item1;
                            return {
                                ...plainItem1,
                                level: req.body.sector + '-' + matchingItem2.control,
                            };
                            // If a match is found, inject the control property into the corresponding item in an1
                            // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                        }
                    })
                    .filter((item) => item !== undefined)
                : [];
        branches.push(...loop5);

        resultedTeam = [...result2, ...result3, ...result4, ...result5, ...result6];
        //overall Teams List
        myallTotalNames = DataAccessMode ? uniqueNames : [...hierarchyMap, ...branches];

        const usersFinal = await User.find(
            {
                resonablestatus: {
                    $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
                },
            },
            {
                employeename: 1,
                companyname: 1,
            }
        );
        const finalUserNames = usersFinal?.map(data => data?.companyname);
        const filteredEmployeeNames = myallTotalNames?.filter(data => !finalUserNames?.includes(data))
        const finalResult = await Applyleave.find(
            { employeename: { $in: filteredEmployeeNames }, status: { $in: ['Applied'] } },
            {
                leavetype: 1,
                employeename: 1,
                access: 1,
                reasonforleave: 1,
                date: 1,
                todate: 1,
                company: 1,
                branch: 1,
                unit: 1,
                team: 1,
                department: 1,
                designation: 1,
                status: 1,
                employeeid: 1,
                numberofdays: 1,
                noofdays: 1,
            }
        ).lean();
        overallMyallList = [...resulted, ...resultedTeam];

        const restrictTeam = await Hirerarchi.aggregate([
            {
                $match: {
                    supervisorchoose: { $in: myallTotalNames }, // Match supervisorchoose with username
                    level: { $in: levelFinal }, // Corrected unmatched quotation mark
                },
            },
            {
                $lookup: {
                    from: 'reportingheaders',
                    let: {
                        teamControlsArray: {
                            $ifNull: ['$pagecontrols', []],
                        },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $in: ['$name', '$$teamControlsArray'],
                                        }, // Check if 'name' is in 'teamcontrols' array
                                        {
                                            $in: [
                                                req?.body?.pagename,
                                                '$reportingnew', // Check if 'menuteamloginstatus' is in 'reportingnew' array
                                            ],
                                        }, // Additional condition for reportingnew array
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'reportData', // The resulting matched documents will be in this field
                },
            },
            {
                $project: {
                    supervisorchoose: 1,
                    employeename: 1,
                    reportData: 1,
                },
            },
        ]);

        let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);
        let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === 'myhierarchy' ? restrictList : req.body.hierachy === 'allhierarchy' ? restrictListTeam : [...restrictList, ...restrictListTeam]);

        let resultAccessFiltered = DataAccessMode ? finalResult : (req.body.hierachy === 'myhierarchy' ? resulted : req.body.hierachy === 'allhierarchy' ? resultedTeam : req.body.hierachy === 'myallhierarchy' ? overallMyallList : result);
        const myCheckList = await MyCheckList.find({ candidatename: { $in: overallRestrictList }, status: 'progress', mainpage: 'Apply Leave' }).lean();
        resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFiltered?.filter((data) => overallRestrictList?.includes(data?.employeename)) : [];
        uniqueData = resultAccessFilter?.filter((item, index, self) => index === self.findIndex((obj) => obj._id === item._id));

        finalToShow = uniqueData.map((item) => {
            let foundData = myCheckList?.find((dataNew) => dataNew.commonid == item._id);
            let areAllGroupsCompleted;
            areAllGroupsCompleted = foundData?.groups?.every((itemNew) => (itemNew.data !== undefined && itemNew.data !== '') || itemNew.files !== undefined);

            if (areAllGroupsCompleted) {
                return {
                    ...item,
                    updatestatus: 'Completed',
                };
            } else {
                return {
                    ...item,
                    updatestatus: 'Not Completed',
                };
            }
        });
    } catch (err) {
        console.log(err, 'err');
        return next(new ErrorHandler('Records not found!', 404));
    }
    return res.status(200).json({
        resultedTeam,
        resultAccessFilter: finalToShow,
        count: finalToShow?.length,
        DataAccessMode
        // hierarchyFilter,
        // myallTotalNames,
    });
});

exports.getAllApplyleaveFilterHome = catchAsyncErrors(async (req, res, next) => {
    let applyleaves, leaveverification;
    try {
        // console.log(req.body, "request")
        if (!req.body.role.includes("Manager")) {
            leaveverification = await LeaveVerification.find({ employeenameto: { $in: req.body.username } }, { employeenamefrom: 1, _id: 0 })
            // console.log(leaveverification.map(d => d.employeenamefrom).flat(), "leaveveri")
            applyleaves = await Applyleave.countDocuments(
                {
                    status: "Applied",
                    employeename: { $in: leaveverification.map(d => d.employeenamefrom).flat() }
                },
                {
                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    date: 1,
                    status: 1,
                    employeename: 1,
                    employeeid: 1,
                    leavetype: 1,
                    reasonforleave: 1,
                    rejectedreason: 1,
                    numberofdays: 1,
                }
            );

        } else {

            applyleaves = await Applyleave.countDocuments(
                { status: "Applied", },
                {
                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    date: 1,
                    status: 1,
                    employeename: 1,
                    employeeid: 1,
                    leavetype: 1,
                    reasonforleave: 1,
                    rejectedreason: 1,
                    numberofdays: 1,
                }
            );


        }


    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler("Applyleave not found!", 404));
    }
    return res.status(200).json({
        applyleaves,
    });
});


exports.getAllApplyleaveApprovedForUserShiftRoasterAssignbranchHome = catchAsyncErrors(async (req, res, next) => {


    let applyleave;
    let leavetype;
    let applyleaves = [];
    try {
        applyleave = await Applyleave.find({ status: "Approved" }, { status: 1, usershifts: 1, leavetype: 1, employeeid: 1 },);
        leavetype = await Leavetype.find();

        leavetype?.map((type) => {
            applyleave?.forEach((d) => {
                if (type.leavetype === d.leavetype) {
                    d.usershifts.forEach((shift) => {
                        applyleaves.push({
                            date: shift.formattedDate,
                            leavetype: d.leavetype,
                            status: d.status,
                            code: type.code,
                            tookleavecheckstatus: shift.tookleavecheckstatus,
                            leavestatus: shift.leavestatus,
                            shiftcount: shift.shiftcount,
                            empcode: d.employeeid,
                        });
                    });
                }
            });
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    // if (!applyleaves) {
    //     return next(new ErrorHandler('Applyleave not found!', 404));
    // }
    return res.status(200).json({
        applyleaves
    });
})

// Leave history for apply leave page's submit and update
exports.getApplyLeaveEmpIdFilter = catchAsyncErrors(async (req, res, next) => {
    let applyleaves;
    try {
        applyleaves = await Applyleave.find({ employeeid: { $eq: req.body.employeeid } }, {})
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler('Applyleave not found!', 404));
    }
    return res.status(200).json({ applyleaves });
})

exports.getApplyLeaveListFilter = catchAsyncErrors(async (req, res, next) => {
    let applyleaves;
    const { type, company, branch, unit, team, employee, leavetype, assignbranch } = req.body;

    let query = {
        company: { $in: company },
    };

    const accessquery = {
        $or: assignbranch.map(item => ({
            company: item.company,
            branch: item.branch,
            unit: item.unit,
        }))
    };

    try {
        switch (type) {
            case "Individual":
                query = {
                    branch: { $in: branch },
                    unit: { $in: unit },
                    team: { $in: team },
                    employeename: { $in: employee },
                    leavetype: { $in: leavetype },
                };
                break;

            case "Company":
                query = {
                    leavetype: { $in: leavetype },
                };
                break;

            case "Branch":
                query = {
                    branch: { $in: branch },
                    leavetype: { $in: leavetype },
                };
                break;

            case "Unit":
                query = {
                    branch: { $in: branch },
                    unit: { $in: unit },
                    leavetype: { $in: leavetype },
                };
                break;

            case "Team":
                query = {
                    branch: { $in: branch },
                    unit: { $in: unit },
                    team: { $in: team },
                    leavetype: { $in: leavetype },
                };
                break;

            default:
                return next(new ErrorHandler("Invalid filter type provided", 400));
        }

        const combinedQuery = {
            $and: [query, accessquery],
        };

        applyleaves = await Applyleave.find(combinedQuery, {});

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!applyleaves) {
        return next(new ErrorHandler('Applyleave not found!', 404));
    }
    return res.status(200).json({ applyleaves });
})
