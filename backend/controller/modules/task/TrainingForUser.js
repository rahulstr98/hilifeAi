const TrainingForUser = require("../../../model/modules/task/trainingforuser");
const Team = require("../../../model/modules/teams");
const User = require("../../../model/login/auth");
const Hirerarchi = require("../../../model/modules/setup/hierarchy");
const Designationgroup = require("../../../model/modules/designationgroup");
const Designation = require("../../../model/modules/designation");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const TrainingDetails = require('../../../model/modules/task/trainingdetails');
const OnlineTestMaster = require('../../../model/modules/interview/onlinetestmaster');
const moment = require("moment");
const { Hierarchyfilter } = require('../../../utils/taskManagerCondition');

//const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
// get All TrainingForUser => /api/trainingforusers
exports.getAllTrainingForUser = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser;
  try {
    trainingforuser = await TrainingForUser.find({}, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      taskassign: 1,
      assignId: 1,
      created: 1,
      shiftEndTime: 1,
      dueFromdate: 1,
      taskassigneddate: 1,
      estimation: 1,
      estimationtime: 1,
      estimationtraining: 1,
      testnames: 1,
      questioncount: 1,
      typeofpage: 1,
      required: 1,
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!trainingforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    trainingforuser,
  });
});
exports.getAllTrainingForUserSingle = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser;
  const { username } = req?.body;

  try {
    trainingforuser = await TrainingForUser.find(username, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      taskassign: 1,
      assignId: 1,
      created: 1,
      shiftEndTime: 1,
      dueFromdate: 1,
      taskassigneddate: 1,
      estimation: 1,
      estimationtime: 1,
      scheduledDates: 1,
      estimationtraining: 1,
      testnames: 1,
      questioncount: 1,
      typeofpage: 1,
      required: 1,
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!trainingforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    trainingforuser,
  });
});

//Training Running Status
exports.getUserTrainingsRunningStatus = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser;

  let { trainingid, username, state } = req.body
  try {
    trainingforuser = await TrainingForUser.findOne({ _id: { $ne: new mongoose.Types.ObjectId(trainingid) }, state: state, username: username }).lean() !== null;
  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    trainingforuser,
  });
});




exports.getAllTrainingForUserPostponed = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser, training;
  let username = req.body.username;
  let status = req.body.status;

  try {
    trainingforuser = await TrainingForUser.find({ username: username, taskstatus: status },
      {
        username: 1,
        taskstatus: 1,
        taskassigneddate: 1,
        taskdetails: 1,
        timetodo: 1,
        frequency: 1,
        schedule: 1,
        trainingdetails: 1,
        duration: 1,
        mode: 1,
        testnames: 1,
        priority: 1,
        taskassign: 1,
        assignId: 1,
        created: 1,
        shiftEndTime: 1,
        dueFromdate: 1,
        taskassigneddate: 1,
        estimation: 1,
        estimationtime: 1,
        estimationtraining: 1,
        testnames: 1,
        questioncount: 1,
        typeofpage: 1,
        required: 1,
      }
    ).lean();
  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    trainingforuser,
  });
});
exports.getAllTrainingForUserOnprogress = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser, training;
  let username = req.body.username;
  let status = req.body.status;


  try {
    trainingforuser = await TrainingForUser.find({ username: username, taskstatus: status }, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      taskassign: 1,
      assignId: 1,
      created: 1,
      shiftEndTime: 1,
      dueFromdate: 1,
      taskassigneddate: 1,
      estimation: 1,
      estimationtime: 1,
      estimationtraining: 1,
      testnames: 1,
      questioncount: 1,
      typeofpage: 1,
      required: 1,
    }).lean();
  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    trainingforuser,
  });
});


exports.getAllTrainingForUserReports = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser, training, totalProjects, totalPages, overallList;

  let { required, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  let query = {
    required: { $in: required }
  };
  let conditions = []

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
        { taskstatus: regex },
        { taskassigneddate: regex },
        { taskdetails: regex },
        { frequency: regex },
        { completedbyuser: regex },
        { userdescription: regex },
        { category: regex },
        { subcategory: regex },
        { duration: regex },
        { breakup: regex },
        { required: { $in: regex } },
        { schedule: regex },
        { trainingdetails: regex },
      ],
    }));

    query = {
      required: { $in: required },
      $and: [
        ...orConditions,
      ]
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
    trainingforuser = await TrainingForUser.find(query,
      {
        username: 1,
        taskstatus: 1,
        taskassigneddate: 1,
        taskdetails: 1,
        timetodo: 1,
        frequency: 1,
        schedule: 1,
        trainingdetails: 1,
        duration: 1,
        mode: 1,
        testnames: 1,
        priority: 1,
        required: 1,
        breakup: 1,
        description: 1,
        trainingdetails: 1,

      }).lean().find(query)
      .skip(skip)
      .limit(pageSize);

    totalProjects = await TrainingForUser.countDocuments(query);
    overallList = await TrainingForUser.find({ required: { $in: required } }, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      required: 1,
      breakup: 1,
      description: 1,
      trainingdetails: 1,
    }).lean();





  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    totalProjects: totalProjects,
    currentPage: page,
    trainingforuser,
    overallList,
    totalPages: Math.ceil(totalProjects / pageSize),

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

exports.getAllTrainingForUserReportsOverall = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser, training, totalProjects, totalPages;
  let required = req.body.required;

  try {


    trainingforuser = await TrainingForUser.find({
      required: { $elemMatch: { $in: required } }
    }, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      required: 1,
      breakup: 1,
      description: 1,
      trainingdetails: 1,

    }).lean();

  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    trainingforuser,
  });
});
exports.getAllTrainingForUserCompleted = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser, training;
  let username = req.body.username;
  let status = req.body.status;

  try {
    trainingforuser = await TrainingForUser.find({
      username: username,
      taskstatus: { $in: status }
    }, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      taskdetails: 1,
      trainingdetails: 1,
      totalmarks: 1,
      totalmarksobtained: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,

    }).lean();

  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    trainingforuser,
  });
});


exports.getAllTrainingForUserAssignId = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  let assignid = req.body.assignId
  try {
    taskforuser = await TrainingForUser.find({
      assignId: assignid,
      taskassign: "Team",
      username: { $ne: req.body.username }
    }, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      taskassign: 1,
      assignId: 1,
      created: 1,
      shiftEndTime: 1,
      dueFromdate: 1,
      taskassigneddate: 1,
      estimation: 1,
      estimationtime: 1,
      estimationtraining: 1,
      testnames: 1,
      questioncount: 1,
      typeofpage: 1,
      required: 1,
    }).lean();

  } catch (err) {

    return next(new ErrorHandler("Records not found", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser
  });
});



exports.getAllTrainingHierarchyReports = catchAsyncErrors(async (req, res, next) => {
  let taskforuser, result,
    resultArray,
    user,
    result1,
    ans1D,
    i = 1,
    result2,
    result3,
    result4,
    result5,
    result6,
    result7,
    result8,
    dataCheck,
    userFilter,
    excelmapdata,
    excelmapdataresperson,

    hierarchyFilter,
    excels,
    answerDef,
    hierarchyFinal,
    hierarchy,
    hierarchyDefault,
    hierarchyDefList,
    resultAccessFilter,
    branch,
    hierarchySecond,
    overallMyallList,
    hierarchyMap,
    resulted = [],
    resultedTeam = [],
    reportingusers,
    DataAccessMode = false,
    myallTotalNames;

  let uniqueElements, nonscheduledata;
  const fromDate = new Date(req.body.fromdate);
  fromDate.setHours(0, 0, 0, 0);

  const toDate = new Date(req.body.todate);
  toDate.setHours(23, 59, 59, 999);
  try {
    const { listpageaccessmode } = req.body;
    let levelFinal = req.body?.sector === "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body?.sector]
    let answer = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose:
            req?.body?.username, // Match supervisorchoose with username
          level: { $in: levelFinal } // Corrected unmatched quotation mark
        }
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: {
            teamControlsArray: {
              $ifNull: ["$pagecontrols", []]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: [
                        "$name",
                        "$$teamControlsArray"
                      ]
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ]
                    } // Additional condition for reportingnew array
                  ]
                }
              }
            }
          ],
          as: "reportData" // The resulting matched documents will be in this field
        }
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1
        }
      }
    ]);


    // Manager Condition Without Supervisor
    const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
    DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
    const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);


    let restrictList = answer?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)

    result = await User.find(
      {
        enquirystatus: {
          $nin: ["Enquiry Purpose"],
        },
        resonablestatus: {
          $nin: [
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
            "Releave Employee",
            "Absconded",
            "Hold",
            "Terminate",
          ],
        },
        ...(listpageaccessmode === "Reporting to Based"
          ? { reportingto: req.body.username }
          : {}),
      },
      {
        empcode: 1,
        companyname: 1,
        username: 1,
        branch: 1,
        unit: 1,
        designation: 1,
        team: 1,
        department: 1,
        company: 1,
        extratime: 1,
        extrastatus: 1,
        extradate: 1,
        loginUserStatus: 1, workstation: 1, workstationshortname: 1, workstationinput: 1,
      }
    );

    if (listpageaccessmode === "Reporting to Based") {
      reportingusers = await User.find(
        {
          enquirystatus: {
            $nin: ["Enquiry Purpose"],
          },
          resonablestatus: {
            $nin: [
              "Not Joined",
              "Postponed",
              "Rejected",
              "Closed",
              "Releave Employee",
              "Absconded",
              "Hold",
              "Terminate",
            ],
          },
          reportingto: req.body.username,
        },
        {
          empcode: 1,
          companyname: 1,
        }
      ).lean();
      const companyNames = reportingusers.map((user) => user.companyname);
      result = await TrainingForUser.aggregate([
        {
          $addFields: {
            formattedDate: {
              $dateFromString: {
                dateString: "$taskassigneddate",
                format: "%d-%m-%Y",
              },
            },
          },
        },
        {
          $match: {
            username: { $in: companyNames }, // Ensure `companyNames` is defined and an array
            formattedDate: {
              $gte: new Date(req?.body?.fromdate),
              $lte: new Date(req?.body?.todate),
            },
          },
        },
        {
          $project: {
            username: 1,
            taskstatus: 1,
            taskassigneddate: 1,
            taskdetails: 1,
            timetodo: 1,
            frequency: 1,
            schedule: 1,
            trainingdetails: 1,
            duration: 1,
            mode: 1,
            testnames: 1,
            priority: 1,
            taskassign: 1,
            assignId: 1,
            created: 1,
            shiftEndTime: 1,
            dueFromdate: 1,
            taskassigneddate: 1,
            estimation: 1,
            estimationtime: 1,
            estimationtraining: 1,
            testnames: 1,
            questioncount: 1,
            typeofpage: 1,
            required: 1,
          },
        },
      ]);
    } else {
      result = await TrainingForUser.aggregate([
        {
          $addFields: {
            formattedDate: {
              $dateFromString: {
                dateString: "$taskassigneddate",
                format: "%d-%m-%Y",
              },
            },
          },
        },
        {
          $match: {
            formattedDate: {
              $gte: new Date(req?.body?.fromdate),
              $lte: new Date(req?.body?.todate),
            },
          },
        },
        {
          $project: {
            username: 1,
            taskstatus: 1,
            taskassigneddate: 1,
            taskdetails: 1,
            timetodo: 1,
            frequency: 1,
            schedule: 1,
            trainingdetails: 1,
            duration: 1,
            mode: 1,
            testnames: 1,
            priority: 1,
            taskassign: 1,
            assignId: 1,
            created: 1,
            shiftEndTime: 1,
            dueFromdate: 1,
            taskassigneddate: 1,
            estimation: 1,
            estimationtime: 1,
            estimationtraining: 1,
            testnames: 1,
            questioncount: 1,
            typeofpage: 1,
            required: 1,
          },
        },
      ]);
    }



    // Accordig to sector and list filter process
    hierarchyFilter = await Hirerarchi.find({ level: req.body.sector });
    userFilter = hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

    hierarchyDefList = await Hirerarchi.find();
    user = await User.find({ companyname: req.body.username });
    const userFilt = user.length > 0 && user[0].designation;
    const desiGroup = await Designation.find();
    let HierarchyFilt = req.body.sector === "all" ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup) : hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup);
    const DesifFilter = desiGroup.filter((data) => HierarchyFilt.includes(data.group));
    const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
    const SameDesigUser = HierarchyFilt.includes("All") ? true : userFilt === desigName;
    //Default Loading of List
    answerDef = hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

    hierarchyFinal = req.body.sector === "all" ? (answerDef.length > 0 ? [].concat(...answerDef) : []) : hierarchyFilter.length > 0 ? [].concat(...userFilter) : [];

    hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];
    //solo
    ans1D = req.body.sector === "all" ? (answerDef.length > 0 ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)) : []) : hierarchyFilter.length > 0 ? hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)) : [];

    result1 =
      ans1D.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = ans1D.find((item2) => item2.employeename.includes(item1.username));
            if (matchingItem2) {
              return item1;
            }
          })
          .filter((item) => item !== undefined)
        : [];

    resulted = result1;

    //team
    let branches = [];
    hierarchySecond = await Hirerarchi.find();

    const subBranch =
      hierarchySecond.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : "";

    const answerFilterExcel = hierarchySecond.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name))) : [];

    result2 =
      answerFilterExcel.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel.find((item2) => item2.employeename.includes(item1.username));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
              return item1
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
        : "";
    const answerFilterExcel2 = subBranch.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name))) : [];

    result3 =
      answerFilterExcel2.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel2.find((item2) => item2.employeename.includes(item1.username));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              return item1
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
        : "";

    const answerFilterExcel3 = ans.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => ans.includes(name))) : [];

    result4 =
      answerFilterExcel3.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel3?.find((item2) => item2.employeename.includes(item1.username));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              return item1
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
            const matchingItem2 = answerFilterExcel4?.find((item2) => item2.employeename.includes(item1.username));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              return item1
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
        : "";
    const answerFilterExcel5 = loop4.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop4.includes(name))) : [];
    result6 =
      answerFilterExcel5.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel5?.find((item2) => item2.employeename.includes(item1.username));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              return item1
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop5);

    resultedTeam = [...result2, ...result3, ...result4, ...result5, ...result6];
    //overall Teams List
    myallTotalNames = DataAccessMode ? uniqueNames : [...new Set([...hierarchyMap, ...branches])];
    overallMyallList = [...resulted, ...resultedTeam];
    const restrictTeam = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose:
            { $in: myallTotalNames }, // Match supervisorchoose with username
          level: { $in: levelFinal } // Corrected unmatched quotation mark
        }
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: {
            teamControlsArray: {
              $ifNull: ["$pagecontrols", []]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: [
                        "$name",
                        "$$teamControlsArray"
                      ]
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ]
                    } // Additional condition for reportingnew array
                  ]
                }
              }
            }
          ],
          as: "reportData" // The resulting matched documents will be in this field
        }
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1
        }
      }
    ]);
    const finalResultTask = await TrainingForUser.aggregate([
      {
        $addFields: {
          formattedDate: {
            $dateFromString: {
              dateString: "$taskassigneddate",
              format: "%d-%m-%Y",
              onError: null,
            },
          },
        },
      },
      {
        $match: {
          username: { $in: myallTotalNames },
          formattedDate: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $project: {
          username: 1,
          taskstatus: 1,
          taskassigneddate: 1,
          taskdetails: 1,
          timetodo: 1,
          frequency: 1,
          schedule: 1,
          trainingdetails: 1,
          duration: 1,
          mode: 1,
          testnames: 1,
          priority: 1,
          taskassign: 1,
          assignId: 1,
          created: 1,
          shiftEndTime: 1,
          dueFromdate: 1,
          taskassigneddate: 1,
          estimation: 1,
          estimationtime: 1,
          estimationtraining: 1,
          testnames: 1,
          questioncount: 1,
          typeofpage: 1,
          required: 1,
        },
      },
    ]);
    let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)
    let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === "myhierarchy" ? restrictList
      : req.body.hierachy === "allhierarchy" ? restrictListTeam : [...restrictList, ...restrictListTeam]);



    let resultAccessFiltered = DataAccessMode ? finalResultTask : (
      req.body.hierachy === "myhierarchy" &&
        (listpageaccessmode === "Hierarchy Based" ||
          listpageaccessmode === "Overall")
        ? resulted
        : req.body.hierachy === "allhierarchy" &&
          (listpageaccessmode === "Hierarchy Based" ||
            listpageaccessmode === "Overall")
          ? resultedTeam
          : req.body.hierachy === "myallhierarchy" &&
            (listpageaccessmode === "Hierarchy Based" ||
              listpageaccessmode === "Overall")
            ? overallMyallList
            : result);

    resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFiltered?.filter(data => overallRestrictList?.includes(data?.username)) : [];



  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found", 404));
  }
  return res.status(200).json({
    resultAccessFilter, resultedTeam, DataAccessMode
  });
});


exports.getAllTrainingHierarchySummaryReports = catchAsyncErrors(
  async (req, res, next) => {
    let
      result,
      user,
      result1,
      ans1D,
      i = 1,
      result2,
      result3,
      result4,
      result5,
      result6,
      dataCheck,
      userFilter,
      excelmapdata,
      excelmapdataresperson,
      hierarchyFilter,
      excels,
      answerDef,
      hierarchyFinal,
      hierarchy,
      hierarchyDefault,
      hierarchyDefList,
      resultAccessFilter,
      branch,
      hierarchySecond,
      overallMyallList,
      hierarchyMap,
      resulted = [],
      resultedTeam = [],
      resultAccessFiltered = [],
      reportingusers,
      DataAccessMode = false,
      myallTotalNames;


    const { listpageaccessmode } = req.body;

    let uniqueElements, nonscheduledata;
    const fromDate = new Date(req.body.fromdate);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(req.body.todate);
    toDate.setHours(23, 59, 59, 999);
    try {
      let levelFinal = req.body?.sector === "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body?.sector]
      let answer = await Hirerarchi.aggregate([
        {
          $match: {
            supervisorchoose:
              req?.body?.username, // Match supervisorchoose with username
            level: { $in: levelFinal } // Corrected unmatched quotation mark
          }
        },
        {
          $lookup: {
            from: "reportingheaders",
            let: {
              teamControlsArray: {
                $ifNull: ["$pagecontrols", []]
              }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $in: [
                          "$name",
                          "$$teamControlsArray"
                        ]
                      }, // Check if 'name' is in 'teamcontrols' array
                      {
                        $in: [
                          req?.body?.pagename,
                          "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
                        ]
                      } // Additional condition for reportingnew array
                    ]
                  }
                }
              }
            ],
            as: "reportData" // The resulting matched documents will be in this field
          }
        },
        {
          $project: {
            supervisorchoose: 1,
            employeename: 1,
            reportData: 1
          }
        }
      ]);

      // Manager Condition Without Supervisor
      const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
      DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
      const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);


      let restrictList = answer?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)
      const from = moment.tz(req.body.fromdate, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day').toDate();
      const to = moment.tz(req.body.todate, 'YYYY-MM-DD', 'Asia/Kolkata').endOf('day').toDate();


      if (listpageaccessmode === "Reporting to Based") {
        reportingusers = await User.find(
          {
            enquirystatus: {
              $nin: ["Enquiry Purpose"],
            },
            resonablestatus: {
              $nin: [
                "Not Joined",
                "Postponed",
                "Rejected",
                "Closed",
                "Releave Employee",
                "Absconded",
                "Hold",
                "Terminate",
              ],
            },
            reportingto: req.body.username,
          },
          {
            empcode: 1,
            companyname: 1,
          }
        ).lean();
        const companyNames = reportingusers.map((user) => user.companyname);
        result = await TrainingForUser.aggregate([
          {
            $match: {
              username: { $in: companyNames }, // Ensure `companyNames` is defined and an array
              created: {
                $gte: from,
                $lte: to,
              },
            },
          },
          {
            $project: {
              username: 1,
              taskstatus: 1,
              taskassigneddate: 1,
              taskdetails: 1,
              timetodo: 1,
              frequency: 1,
              schedule: 1,
              trainingdetails: 1,
              duration: 1,
              mode: 1,
              testnames: 1,
              priority: 1,
              taskassign: 1,
              assignId: 1,
              created: 1,
              shiftEndTime: 1,
              dueFromdate: 1,
              taskassigneddate: 1,
              estimation: 1,
              estimationtime: 1,
              estimationtraining: 1,
              testnames: 1,
              questioncount: 1,
              typeofpage: 1,
              required: 1,
            },
          },
        ]);
      } else {
        result = await TrainingForUser.aggregate([
          {
            $match: {
              created: {
                $gte: from.toISOString(),
                $lte: to.toISOString(),
              },
            },
          },
          {
            $project: {
              username: 1,
              taskstatus: 1,
              taskassigneddate: 1,
              taskdetails: 1,
              timetodo: 1,
              frequency: 1,
              schedule: 1,
              trainingdetails: 1,
              duration: 1,
              mode: 1,
              testnames: 1,
              priority: 1,
              taskassign: 1,
              assignId: 1,
              created: 1,
              shiftEndTime: 1,
              dueFromdate: 1,
              taskassigneddate: 1,
              estimation: 1,
              estimationtime: 1,
              estimationtraining: 1,
              testnames: 1,
              questioncount: 1,
              typeofpage: 1,
              required: 1,
            },
          },
        ]);

      }



      // Accordig to sector and list filter process
      hierarchyFilter = await Hirerarchi.find({ level: req.body.sector });
      userFilter = hierarchyFilter
        .filter((data) => data.supervisorchoose.includes(req.body.username))
        .map((data) => data.employeename);
      hierarchyDefList = await Hirerarchi.find();
      user = await User.find({ companyname: req.body.username }, { designation: 1 });
      const userFilt = user.length > 0 && user[0].designation;
      const desiGroup = await Designation.find();
      let HierarchyFilt =
        req.body.sector === "all"
          ? hierarchyDefList
            .filter((data) =>
              data.supervisorchoose.includes(req.body.username)
            )
            .map((data) => data.designationgroup)
          : hierarchyFilter
            .filter((data) =>
              data.supervisorchoose.includes(req.body.username)
            )
            .map((data) => data.designationgroup);
      const DesifFilter = desiGroup.filter((data) =>
        HierarchyFilt.includes(data.group)
      );
      const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
      const SameDesigUser = HierarchyFilt.includes("All")
        ? true
        : userFilt === desigName;
      //Default Loading of List
      answerDef = hierarchyDefList
        .filter((data) => data.supervisorchoose.includes(req.body.username))
        .map((data) => data.employeename);

      hierarchyFinal =
        req.body.sector === "all"
          ? answerDef.length > 0
            ? [].concat(...answerDef)
            : []
          : hierarchyFilter.length > 0
            ? [].concat(...userFilter)
            : [];

      hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];
      //solo
      ans1D =
        req.body.sector === "all"
          ? answerDef.length > 0
            ? hierarchyDefList.filter((data) =>
              data.supervisorchoose.includes(req.body.username)
            )
            : []
          : hierarchyFilter.length > 0
            ? hierarchyFilter.filter((data) =>
              data.supervisorchoose.includes(req.body.username)
            )
            : [];

      result1 =
        ans1D.length > 0
          ? result
            .map((item1) => {
              const matchingItem2 = ans1D.find((item2) =>
                item2.employeename.includes(item1.username)
              );
              if (matchingItem2) {
                return item1;
              }
            })
            .filter((item) => item !== undefined)
          : [];

      resulted = result1;

      //team
      let branches = [];
      hierarchySecond = await Hirerarchi.find();

      const subBranch =
        hierarchySecond.length > 0
          ? hierarchySecond
            .filter((item) =>
              item.supervisorchoose.some((name) =>
                hierarchyMap.includes(name)
              )
            )
            .map((item) => item.employeename)
            .flat()
          : "";

      const answerFilterExcel =
        hierarchySecond.length > 0
          ? hierarchySecond.filter((item) =>
            item.supervisorchoose.some((name) => hierarchyMap.includes(name))
          )
          : [];

      result2 =
        answerFilterExcel.length > 0
          ? result
            .map((item1) => {
              const matchingItem2 = answerFilterExcel.find((item2) =>
                item2.employeename.includes(item1.username)
              );
              if (matchingItem2) {
                // If a match is found, inject the control property into the corresponding item in an1
                // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
                return item1;
              }
            })
            .filter((item) => item !== undefined)
          : [];
      branches.push(...subBranch);

      const ans =
        subBranch.length > 0
          ? hierarchySecond
            .filter((item) =>
              item.supervisorchoose.some((name) => subBranch.includes(name))
            )
            .map((item) => item.employeename)
            .flat()
          : "";
      const answerFilterExcel2 =
        subBranch.length > 0
          ? hierarchySecond.filter((item) =>
            item.supervisorchoose.some((name) => subBranch.includes(name))
          )
          : [];

      result3 =
        answerFilterExcel2.length > 0
          ? result
            .map((item1) => {
              const matchingItem2 = answerFilterExcel2.find((item2) =>
                item2.employeename.includes(item1.username)
              );
              if (matchingItem2) {
                // If a match is found, inject the control property into the corresponding item in an1
                return item1;
              }
            })
            .filter((item) => item !== undefined)
          : [];
      branches.push(...ans);

      const loop3 =
        ans.length > 0
          ? hierarchySecond
            .filter((item) =>
              item.supervisorchoose.some((name) => ans.includes(name))
            )
            .map((item) => item.employeename)
            .flat()
          : "";

      const answerFilterExcel3 =
        ans.length > 0
          ? hierarchySecond.filter((item) =>
            item.supervisorchoose.some((name) => ans.includes(name))
          )
          : [];

      result4 =
        answerFilterExcel3.length > 0
          ? result
            .map((item1) => {
              const matchingItem2 = answerFilterExcel3?.find((item2) =>
                item2.employeename.includes(item1.username)
              );
              if (matchingItem2) {
                // If a match is found, inject the control property into the corresponding item in an1
                return item1;
              }
            })
            .filter((item) => item !== undefined)
          : [];
      branches.push(...loop3);

      const loop4 =
        loop3.length > 0
          ? hierarchySecond
            .filter((item) =>
              item.supervisorchoose.some((name) => loop3.includes(name))
            )
            .map((item) => item.employeename)
            .flat()
          : [];
      const answerFilterExcel4 =
        loop3.length > 0
          ? hierarchySecond.filter((item) =>
            item.supervisorchoose.some((name) => loop3.includes(name))
          )
          : [];
      result5 =
        answerFilterExcel4.length > 0
          ? result
            .map((item1) => {
              const matchingItem2 = answerFilterExcel4?.find((item2) =>
                item2.employeename.includes(item1.username)
              );
              if (matchingItem2) {
                // If a match is found, inject the control property into the corresponding item in an1
                return item1;
              }
            })
            .filter((item) => item !== undefined)
          : [];
      branches.push(...loop4);

      const loop5 =
        loop4.length > 0
          ? hierarchySecond
            .filter((item) =>
              item.supervisorchoose.some((name) => loop4.includes(name))
            )
            .map((item) => item.employeename)
            .flat()
          : "";
      const answerFilterExcel5 =
        loop4.length > 0
          ? hierarchySecond.filter((item) =>
            item.supervisorchoose.some((name) => loop4.includes(name))
          )
          : [];
      result6 =
        answerFilterExcel5.length > 0
          ? result
            .map((item1) => {
              const matchingItem2 = answerFilterExcel5?.find((item2) =>
                item2.employeename.includes(item1.username)
              );
              if (matchingItem2) {
                // If a match is found, inject the control property into the corresponding item in an1
                return item1;
              }
            })
            .filter((item) => item !== undefined)
          : [];
      branches.push(...loop5);

      resultedTeam = [
        ...result2,
        ...result3,
        ...result4,
        ...result5,
        ...result6,
      ];
      //overall Teams List
      myallTotalNames = DataAccessMode ? uniqueNames : [...new Set([...hierarchyMap, ...branches])];;
      overallMyallList = [...resulted, ...resultedTeam];
      const finalResultTask = await TrainingForUser.aggregate([
        {
          $addFields: {
            formattedDate: {
              $dateFromString: {
                dateString: "$taskassigneddate",
                format: "%d-%m-%Y",
                onError: null,
              },
            },
          },
        },
        {
          $match: {
            username: { $in: myallTotalNames },
            formattedDate: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $project: {
            username: 1,
            taskstatus: 1,
            taskassigneddate: 1,
            taskdetails: 1,
            timetodo: 1,
            frequency: 1,
            schedule: 1,
            trainingdetails: 1,
            duration: 1,
            mode: 1,
            testnames: 1,
            priority: 1,
            taskassign: 1,
            assignId: 1,
            created: 1,
            shiftEndTime: 1,
            dueFromdate: 1,
            taskassigneddate: 1,
            estimation: 1,
            estimationtime: 1,
            estimationtraining: 1,
            testnames: 1,
            questioncount: 1,
            typeofpage: 1,
            required: 1,
          },
        },
      ]);


      const restrictTeam = await Hirerarchi.aggregate([
        {
          $match: {
            supervisorchoose:
              { $in: myallTotalNames }, // Match supervisorchoose with username
            level: { $in: levelFinal } // Corrected unmatched quotation mark
          }
        },
        {
          $lookup: {
            from: "reportingheaders",
            let: {
              teamControlsArray: {
                $ifNull: ["$pagecontrols", []]
              }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $in: [
                          "$name",
                          "$$teamControlsArray"
                        ]
                      }, // Check if 'name' is in 'teamcontrols' array
                      {
                        $in: [
                          req?.body?.pagename,
                          "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
                        ]
                      } // Additional condition for reportingnew array
                    ]
                  }
                }
              }
            ],
            as: "reportData" // The resulting matched documents will be in this field
          }
        },
        {
          $project: {
            supervisorchoose: 1,
            employeename: 1,
            reportData: 1
          }
        }
      ]);
       let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)
      let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === "myhierarchy" ? restrictList :
         req.body.hierachy === "allhierarchy" ? restrictListTeam : 
         [...restrictList, ...restrictListTeam]);

      resultAccessFiltered = DataAccessMode ? finalResultTask : (
        req.body.hierachy === "myhierarchy" &&
          (listpageaccessmode === "Hierarchy Based" ||
            listpageaccessmode === "Overall")
          ? resulted
          : req.body.hierachy === "allhierarchy" &&
            (listpageaccessmode === "Hierarchy Based" ||
              listpageaccessmode === "Overall")
            ? resultedTeam
            : req.body.hierachy === "myallhierarchy" &&
              (listpageaccessmode === "Hierarchy Based" ||
                listpageaccessmode === "Overall")
              ? overallMyallList
              : result);
      resultAccessFilter = overallRestrictList?.length > 0 ? [...new Set(resultAccessFiltered?.filter(data => overallRestrictList?.includes(data?.username)))] : [];
      const finalUsernames = resultAccessFilter?.length > 0 ? [...new Set(resultAccessFilter?.map(data => data?.username))] : [];
      const userNamesCollectios = await User.find({ companyname: { $in: finalUsernames } }, { companyname: 1, company: 1, branch: 1, unit: 1, team: 1, department: 1 })
      // Grouping logic
      const finalResult = groupTasksByUser(resultAccessFilter, userNamesCollectios);
      return res.status(200).json({
        resultAccessFilter: finalResult, finalResult, resultedTeam ,DataAccessMode 
      });

    } catch (err) {
      console.log(err, 'err')
      return next(new ErrorHandler("Records not found", 404));
    }

  }
);



function groupTasksByUser(tasks, users) {
  const resultMap = {};

  const statusKeyMap = {
    "assigned": "assigned",
    "completed": "completed",
    "not applicable to me": "notApplicable",
    "finished by others": "finishedOthers",
    "postponed": "postponed",
    "pending": "pending",
    "paused": "paused",
    "progress": "progress",
  };

  const defaultKeys = Object.values(statusKeyMap);

  // Map users by companyname for quick lookup
  const userMap = {};
  users.forEach(user => {
    userMap[user.companyname] = user;
  });

  tasks.forEach(task => {
    const username = task.username;
    const status = task.taskstatus.toLowerCase().trim();
    const baseKey = statusKeyMap[status];
    if (!baseKey) return; // skip unknown statuses
    function generate15DigitId() {
      const timestamp = Date.now().toString(); // 13 digits
      const random = Math.floor(Math.random() * 90 + 10).toString(); // 2 digits
      return timestamp + random;
    }
    if (!resultMap[username]) {
      // Get matching user by companyname
      const matchedUser = userMap[username] || {};

      // Initialize default keys and user info
      resultMap[username] = {
        username,
        company: matchedUser.company || "",
        branch: matchedUser.branch || "",
        unit: matchedUser.unit || "",
        team: matchedUser.team || "",
        department: matchedUser.department || "",
        _id: generate15DigitId(),
      };

      defaultKeys.forEach(key => {
        resultMap[username][`${key}Count`] = 0;
        resultMap[username][`${key}Task`] = [];
      });
    }

    const userObj = resultMap[username];
    userObj[`${baseKey}Count`]++;
    userObj[`${baseKey}Task`].push(task);
  });

  return Object.values(resultMap);
}


exports.getAllTrainingForUserOverallReports = catchAsyncErrors(async (req, res, next) => {
  let trainingforuser, training, totalProjects, totalPages, overallList;

  let { company, branch, unit, team, fromdate, todate, department, username, taskstatus, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;
  let query = {
    taskstatus: { $in: taskstatus }
  };
  let overallQuery = {
    taskstatus: { $in: taskstatus }
  };
  let queryUser = {};
  if (company.length > 0) {
    queryUser.company = { $in: company };
  }
  if (branch.length > 0) {
    queryUser.branch = { $in: branch };
  }
  if (unit.length > 0) {
    queryUser.unit = { $in: unit };
  }
  if (team.length > 0) {
    queryUser.team = { $in: team };
  }
  if (department.length > 0) {
    queryUser.department = { $in: department };
  }
  if (username?.length > 0) {
    queryUser.companyname = { $in: username };
  }
  const usernamesfilter = await User.find(queryUser, { companyname: 1 }).lean();
  const UserNamesFromUser = usernamesfilter?.length > 0 ? usernamesfilter?.map(data => data?.companyname) : [];
  if (UserNamesFromUser?.length > 0) {
    query.username = { $in: UserNamesFromUser };
    overallQuery.username = { $in: UserNamesFromUser };


  }
  if (fromdate && todate) {
    query = {
      ...query,
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: "$taskassigneddate",
                  format: "%d-%m-%Y"
                }
              },
              new Date(fromdate)
            ]
          },
          {
            $lte: [
              {
                $dateFromString: {
                  dateString: "$taskassigneddate",
                  format: "%d-%m-%Y"
                }
              },
              new Date(todate)
            ]
          }
        ]
      }
    };
    overallQuery = {
      ...overallQuery,
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: "$taskassigneddate",
                  format: "%d-%m-%Y"
                }
              },
              new Date(fromdate)
            ]
          },
          {
            $lte: [
              {
                $dateFromString: {
                  dateString: "$taskassigneddate",
                  format: "%d-%m-%Y"
                }
              },
              new Date(todate)
            ]
          }
        ]
      }
    };

  }
  let conditions = []

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
        { taskstatus: regex },
        { taskassigneddate: regex },
        { taskdetails: regex },
        { frequency: regex },
        { completedbyuser: regex },
        { userdescription: regex },
        { category: regex },
        { subcategory: regex },
        { duration: regex },
        { breakup: regex },
        { required: { $in: regex } },
        { schedule: regex },
        { trainingdetails: regex },
      ],
    }));

    query = {
      ...query,
      $and: [
        ...orConditions,
      ]
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
    trainingforuser = UserNamesFromUser?.length > 0 ? await TrainingForUser.find(query,
      {
        username: 1,
        taskstatus: 1,
        taskassigneddate: 1,
        taskdetails: 1,
        timetodo: 1,
        frequency: 1,
        schedule: 1,
        trainingdetails: 1,
        duration: 1,
        mode: 1,
        testnames: 1,
        priority: 1,
        required: 1,
        breakup: 1,
        description: 1,
        trainingdetails: 1,

      }).lean()
      .skip(skip)
      .limit(pageSize) : [];
    totalProjects = UserNamesFromUser?.length > 0 ? await TrainingForUser.countDocuments(query) : 0;
    overallList = UserNamesFromUser?.length > 0 ? await TrainingForUser.find(overallQuery, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      required: 1,
      breakup: 1,
      description: 1,
      trainingdetails: 1,
    }).lean() : [];
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    totalProjects: totalProjects,
    currentPage: page,
    trainingforuser,
    overallList,
    totalPages: Math.ceil(totalProjects / pageSize),

  });
});



// Create new TrainingForUser=> /api/trainingforuser/new
exports.addTrainingForUser = catchAsyncErrors(async (req, res, next) => {

  const { category, subcategory, username, frequency, duration, taskassigneddate, trainingdetails, taskdetails, taskdate, tasktime, timetodo } = req.body;

  const existingRecords = taskdetails === "Mandatory" ? await TrainingForUser.find({
    username,
    trainingdetails,
    frequency,
    duration,
    taskassigneddate,
    taskdetails,
    timetodo
  }, {
    username: 1,
    taskstatus: 1,
    taskassigneddate: 1,
    taskdetails: 1,
    timetodo: 1,
    frequency: 1,
    schedule: 1,
    trainingdetails: 1,
    duration: 1,
    mode: 1,
    testnames: 1,
    priority: 1,
    taskassign: 1,
    assignId: 1,
    created: 1,
    shiftEndTime: 1,
    dueFromdate: 1,
    taskassigneddate: 1,
    estimation: 1,
    estimationtime: 1,
    estimationtraining: 1,
    testnames: 1,
    questioncount: 1,
    typeofpage: 1,
    required: 1,
  }).lean() : await TrainingForUser.find({
    trainingdetails,
    username,
    taskdate,
    tasktime,
    taskdetails

  }, {
    username: 1,
    taskstatus: 1,
    taskassigneddate: 1,
    taskdetails: 1,
    timetodo: 1,
    frequency: 1,
    schedule: 1,
    trainingdetails: 1,
    duration: 1,
    mode: 1,
    testnames: 1,
    priority: 1,
    taskassign: 1,
    assignId: 1,
    created: 1,
    shiftEndTime: 1,
    dueFromdate: 1,
    taskassigneddate: 1,
    estimation: 1,
    estimationtime: 1,
    estimationtraining: 1,
    testnames: 1,
    questioncount: 1,
    typeofpage: 1,
    required: 1,
  }).lean();

  if (existingRecords?.length > 0) {
    return res.status(400).json({
      message: 'This Data is Already Exists!'
    });
  }

  let atrainingforuser = await TrainingForUser.create(req.body);

  return res.status(200).json({
    message: 'Successfully added!',
    data: atrainingforuser
  });

});

// get Signle TrainingForUser => /api/trainingforuser/:id
exports.getSingleTrainingForUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let strainingforuser = await TrainingForUser.findById(id);

  if (!strainingforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    strainingforuser,
  });
});



exports.getAllTrainingForUserAutoGenerate = catchAsyncErrors(async (req, res, next) => {
  const { updatedAns, dateNow, username, final } = req.body;
  let uniqueElements, nonscheduledata;

  try {
    // Query to fetch matching tasks for uniqueElements
    const existingTasks = await TrainingForUser.find({
      username: username,
      shiftEndTime: { $gte: dateNow }
    }, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      taskassign: 1,
      assignId: 1,
      created: 1,
      shiftEndTime: 1,
      dueFromdate: 1,
      taskassigneddate: 1,
      estimation: 1,
      estimationtime: 1,
      estimationtraining: 1,
      testnames: 1,
      questioncount: 1,
      typeofpage: 1,
      required: 1,
    }).lean();

    const existingTasksFinal = await TrainingForUser.find({
      username: username,
      status: "Active",
      shiftEndTime: { $gte: dateNow }
    }, {
      username: 1,
      taskstatus: 1,
      taskassigneddate: 1,
      taskdetails: 1,
      timetodo: 1,
      frequency: 1,
      schedule: 1,
      trainingdetails: 1,
      duration: 1,
      mode: 1,
      testnames: 1,
      priority: 1,
      taskassign: 1,
      assignId: 1,
      created: 1,
      shiftEndTime: 1,
      dueFromdate: 1,
      taskassigneddate: 1,
      estimation: 1,
      estimationtime: 1,
      estimationtraining: 1,
      testnames: 1,
      questioncount: 1,
      typeofpage: 1,
      required: 1,
    }).lean();

    // Filter updatedAns based on the existingTasks query
    uniqueElements = updatedAns?.filter(obj1 => {
      return obj1.required === "Mandatory" ? !existingTasks?.some(obj2 =>
        obj2.required?.includes(obj1.required)
        && obj1.frequency === obj2.frequency
        && obj1.schedule === obj2.schedule
        && obj1.trainingdetails === obj2.trainingdetails
        && dateNow <= new Date(obj2.shiftEndTime) && obj2?.taskdetails === "Mandatory")
        :
        !existingTasks?.some(obj2 =>
          obj1.trainingdetails === obj2.trainingdetails
          &&
          obj2.required?.includes(obj1.required)
          && dateNow <= new Date(obj2.shiftEndTime))
    }
    );

    let userStatus = final?.length > 0 ? final?.filter(item2 => {
      const matchingItem = existingTasksFinal?.find(data1 =>
        ["Completed", "Finished By Others", "Not Applicable to Me"]?.includes(data1?.taskstatus))

      if (matchingItem?.orginalid !== item2._id) {
        return item2; // Include this item in the filtered array
      }
    }) : [];

    return res.status(200).json({
      uniqueElements,
      userStatus
    });
  } catch (err) {

    return next(new ErrorHandler("Records not found", 404));
  }
});



exports.getAllSortedTrainingUsers = catchAsyncErrors(async (req, res, next) => {
  let taskforuser, sortedTasks;
  let username = req.body?.username;
  let todaysDate = req.body?.todaysDate;
  let PresentDate = req.body.date;
  try {
    taskforuser = await TrainingForUser.find({}, {
      taskstatus: 1,
      taskdetails: 1,
      timetodo: 1,
      username: 1,
      priority: 1,
      trainingdetails: 1,
      frequency: 1,
      schedule: 1,
      questioncount: 1,
      typequestion: 1,
      category: 1,
      subcategory: 1,
      duration: 1,
      breakup: 1,
      description: 1,
      required: 1,
      taskassigneddate: 1,
      trainingdocuments: 1,

    }).lean();

    const frequencyOrder = {
      Daily: 1,
      "Date wise": 2,
      "Day wise": 3,
      Weekly: 4,
      Monthly: 5,
      Annually: 6,
    };
    const priorityOrder = {
      High: 1,
      Medium: 2,
      Low: 3,
    };


    let anstaskOnProgress = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data.taskstatus === "OnProgress") : []
    let anstaskUserPanelSchedule = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "Mandatory" && data.taskstatus === "Assigned") : []
    let anstaskUserPanelOther = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails !== "Mandatory" && data.taskstatus === "Assigned") : []
    //Assigned
    let finalSchedule = anstaskUserPanelSchedule?.length > 0 ? anstaskUserPanelSchedule?.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]) : [];
    let onProgressTask = anstaskOnProgress?.length > 0 ? anstaskOnProgress : []

    let final = [...onProgressTask, ...finalSchedule, ...anstaskUserPanelOther]


    const uniqueObjects = [];
    const uniqueKeys = new Set();
    final?.forEach(obj => {
      const key = `${obj.trainingdetails}-${obj.username}-${obj.frequency}-${obj.duration}-${obj.taskassigneddate}`;
      if (!uniqueKeys.has(key)) {
        uniqueObjects.push(obj);
        uniqueKeys.add(key);

      }
      return uniqueObjects;
    });


    // Filter today's tasks
    const todayTasks = final?.filter(task => task?.taskassigneddate === todaysDate);

    // Filter tasks for other dates
    const otherTasks = final?.filter(task => task?.taskassigneddate !== todaysDate);

    // Sort tasks by both date and time
    otherTasks?.sort((a, b) => {
      // Convert date string to Date object
      const dateA = new Date(a.taskassigneddate);
      const dateB = new Date(b.taskassigneddate);

      // Compare dates first
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return dateA - dateB;
    });


    function compareTime(a, b) {
      if (a?.timetodo?.length === 0 && b?.timetodo?.length === 0) {
        return 0; // Both have no time specified
      } else if (a.timetodo.length === 0) {
        return 1; // a has no time, move it to the end
      } else if (b.timetodo.length === 0) {
        return -1; // b has no time, move it to the end
      } else {
        // Compare time based on hour, minute, and time type (AM/PM)
        const timeA = a.timetodo[0];
        const timeB = b.timetodo[0];

        // Convert hour to 24-hour format for comparison
        const hourA = parseInt(timeA.hour) + (timeA.timetype.toUpperCase() === 'PM' ? 12 : 0);
        const hourB = parseInt(timeB.hour) + (timeB.timetype.toUpperCase() === 'PM' ? 12 : 0);

        const hourDiff = hourA - hourB;

        if (hourDiff !== 0) {
          return hourDiff;
        } else {
          // If hours are the same, compare minutes
          const minDiff = parseInt(timeA.min) - parseInt(timeB.min);
          if (minDiff !== 0) {
            return minDiff;
          } else {
            // If minutes are also the same, compare time type
            if (timeA.timetype.toUpperCase() === 'AM' && timeB.timetype.toUpperCase() === 'PM') {
              return -1;
            } else if (timeA.timetype.toUpperCase() === 'PM' && timeB.timetype.toUpperCase() === 'AM') {
              return 1;
            } else {
              return 0; // Both time types are the same
            }
          }
        }
      }
    }

    // Sort the uniqueElements array using the compareTime function
    todayTasks.sort(compareTime);
    sortedTasks = otherTasks?.concat(todayTasks);





  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    sortedTasks,
  });
});
exports.getAllTrainingOnlineTestQuestions = catchAsyncErrors(async (req, res, next) => {
  let trainingdetails, trainingforuser, taskforuser;
  let data = req.body.data;
  try {
    trainingforuser = await TrainingForUser.aggregate([
      {
        $match: {
          typequestion: data?.type,
          taskstatus: "Assigned",
          testnames: `${data?.testname}-(${data?.category}-${data?.subcategory})`
        }
      },
      {
        $project: {
          taskstatus: 1,
          taskdetails: 1,
          timetodo: 1,
          username: 1,
          priority: 1,
          testnames: 1,
          trainingdetails: 1,
          frequency: 1,
          schedule: 1,
          questioncount: 1,
          typequestion: 1,
          category: 1,
          subcategory: 1,
          duration: 1,
          breakup: 1,
          description: 1,
          required: 1,
          taskassigneddate: 1
        }
      }
    ])
    trainingdetails = await TrainingDetails.aggregate([
      {
        $match: {
          typequestion: data?.type,
          status: "Active",
          testnames: `${data?.testname}-(${data?.category}-${data?.subcategory})`
        }
      },
      {
        $project: {
          _id: 1,
          questioncount: 1,
          typequestion: 1,
          testnames: 1,
          trainingdetailslog: 1
        }
      }
    ])
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    trainingforuser,
    trainingdetails
  });
});
exports.getAllTrainingOnlineTestQuestionsBulkDelete = catchAsyncErrors(async (req, res, next) => {
  let trainingdetails, trainingforuser, result, count;
  let ids = req.body.id;
  try {

    const orgDataas = await OnlineTestMaster.find();
    const orgTrainUser = await TrainingForUser.find({}, {
      typequestion: 1,
      taskstatus: 1,
      testnames: 1
    }).lean();
    const orgTrainDetails = await TrainingDetails.find({ status: "Active" }, {
      typequestion: 1,
      status: 1,
      testnames: 1
    }).lean();

    const datas = orgDataas?.filter(data => ids?.includes(data._id?.toString()));

    const unmatchedTrainingUser = datas.filter(answers => orgTrainUser.some(sub =>
      sub.typequestion === answers.type && sub.taskstatus === "Assigned" &&
      sub.testnames === `${answers?.testname}-(${answers?.category}-${answers?.subcategory})`))
      ?.map(data => data._id?.toString());

    const unmatchedTrainingDetails = datas.filter(answers => orgTrainDetails.some(sub =>
      sub.typequestion === answers.type && sub.status === "Active" &&
      sub.testnames === `${answers?.testname}-(${answers?.category}-${answers?.subcategory})`))
      ?.map(data => data._id?.toString());

    const duplicateId = [...unmatchedTrainingUser, ...unmatchedTrainingDetails]
    result = ids?.filter(data => !duplicateId?.includes(data))
    count = ids?.filter(data => !duplicateId?.includes(data))?.length



  } catch (err) {

    return next(new ErrorHandler("Records not found 1!", 404));
  }
  return res.status(200).json({
    result,
    count
  });
});

// update TrainingForUser by id => /api/trainingforuser/:id
exports.updateTrainingForUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let utrainingforuser = await TrainingForUser.findByIdAndUpdate(id, req.body);
  if (!utrainingforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete TrainingForUser by id => /api/trainingforuser/:id
exports.deleteTrainingForUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dtrainingforuser = await TrainingForUser.findByIdAndRemove(id);

  if (!dtrainingforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});
