// const TaskForUser = require("../../../model/modules/task/taskforuser");
// const ErrorHandler = require("../../../utils/errorhandler");
// const catchAsyncErrors = require("../../../middleware/catchAsyncError");
// const Team = require("../../../model/modules/teams");
// const User = require("../../../model/login/auth");
// const Hirerarchi = require("../../../model/modules/setup/hierarchy");
// const Designationgroup = require("../../../model/modules/designationgroup");
// const Designation = require("../../../model/modules/designation");
// const axios = require("axios");
// const Shift = require('../../../model/modules/shift');
// const moment = require("moment");
// const TaskScheduleGrouping = require("../../../model/modules/task/TaskScheduleGroupingModel");
// const TaskDesignationGrouping = require('../../../model/modules/task/taskdesignationgrouping');
// const TaskNonScheduleGrouping = require("../../../model/modules/task/nonschedulegrouping");
// const TrainingDetails = require('../../../model/modules/task/trainingdetails');
// const TrainingForUser = require("../../../model/modules/task/trainingforuser");
// const multer = require('multer');
// const path = require('path');

// ///Set up storage engine for multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'taskUserPanel/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// // File filter to only accept images
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /\.(xlsx|xls|csv|pdf|txt|png|jpg|jpeg)$/;
//   const allowedMimeTypes = /^(application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/csv|application\/pdf|text\/plain)$/;

//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedMimeTypes.test(file.mimetype);
//   return cb(null, true);
//   // if (extname && mimetype) {
//   //     return cb(null, true);
//   // } else {
//   //     cb(new Error('Only Documents are allowed'));
//   // }
// };

// // Initialize multer with the storage engine and file filter
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   // limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
// });



// // get All TaskForUser => /api/taskschedulegroupings
// exports.getAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   try {
//     taskforuser = await TaskForUser.find({}, {
//       category: 1,
//       subcategory: 1, frequency: 1, schedule: 1,
//       username: 1, date: 1, shiftEndTime: 1,
//       taskdetails: 1, taskstatus: 1, taskassigneddate: 1,
//       timetodo: 1,
//       taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1,
//       weekdays: 1, annumonth: 1, duration: 1, priority: 1
//     }).lean();
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!taskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });


// exports.getAllTaskForAssingnedhome = catchAsyncErrors(async (req, res, next) => {
//   let fromdate, todate;
//   const today = new Date();
//   const selectedFilter = req.body.selectedfilter;

//   // Utility function to format date as 'YYYY-MM-DD'
//   const formatDate = (date) => {
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   // Set date ranges based on the selected filter
//   switch (selectedFilter) {


//     case "Last Month":
//       fromdate = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)); // 1st of last month
//       todate = formatDate(new Date(today.getFullYear(), today.getMonth(), 0)); // Last day of last month
//       break;
//     case "Last Week":
//       const startOfLastWeek = new Date(today);
//       startOfLastWeek.setDate(today.getDate() - (today.getDay() + 6) % 7 - 7); // Last Monday
//       const endOfLastWeek = new Date(startOfLastWeek);
//       endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Last Sunday
//       fromdate = formatDate(startOfLastWeek);
//       todate = formatDate(endOfLastWeek);
//       break;
//     case "Yesterday":
//       const yesterday = new Date(today);
//       yesterday.setDate(today.getDate() - 1);
//       fromdate = todate = formatDate(yesterday);
//       break;

//     case "Today":
//       fromdate = todate = formatDate(today);
//       break;
//     case "Tomorrow":
//       const tomorrow = new Date(today);
//       tomorrow.setDate(today.getDate() + 1);
//       fromdate = todate = formatDate(tomorrow);
//       break;
//     case "This Week":
//       const startOfThisWeek = new Date(today);
//       startOfThisWeek.setDate(today.getDate() - (today.getDay() + 6) % 7); // Monday
//       const endOfThisWeek = new Date(startOfThisWeek);
//       endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // Sunday
//       fromdate = formatDate(startOfThisWeek);
//       todate = formatDate(endOfThisWeek);
//       break;
//     case "This Month":
//       fromdate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
//       todate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));


//       break;

//     default:
//       fromdate = "";
//   }




//   let taskforuser;

//   try {
//     const statuses = ["Assigned", "Pending", "Finished By Others", "Not Applicable to Me", "Postponed", "Paused", "Completed"];

//     let query = {

//     }



//     const [
//       taskforuserAssigned,
//       taskforuserPending,
//       taskforuserFinished,
//       taskforuserApplicable,
//       taskforuserPostponed,
//       taskforuserPaused,
//       taskforuserCompleted
//     ] = await Promise.all(
//       statuses.map(status => TaskForUser.countDocuments({
//         ...(fromdate && todate
//           ? { taskassigneddate: { $gte: fromdate, $lte: todate } }
//           : fromdate
//             ? { taskassigneddate: { $eq: fromdate } }
//             : {}),
//         taskstatus: status
//       }))
//     );

//     taskforuser = {
//       taskforuserAssigned,
//       taskforuserPending,
//       taskforuserFinished,
//       taskforuserApplicable,
//       taskforuserPostponed,
//       taskforuserPaused,
//       taskforuserCompleted
//     }



//     return res.status(200).json({
//       taskforuser
//     });
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
// });


// exports.getAllNonscheduleTaskLogReassign = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   try {
//     taskforuser = await TaskForUser.find({
//       category: req.body.category,
//       subcategory: req.body.subcategory,
//       username: { $in: req.body.username },
//       taskdate: req.body.taskdate,
//       tasktime: req.body.tasktime,
//       taskdetails: "nonschedule"
//     }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, 
//       shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, 
//       taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!taskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });
// exports.getAllNonscheduleTaskLogForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   try {
//     taskforuser = await TaskForUser.find({ orginalid: req.body.originalid }, {
//       category: 1, subcategory: 1,
//       frequency: 1, schedule: 1,
//       username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1,
//       taskassigneddate: 1, timetodo: 1, taskdate: 1, breakup: 1, breakupcount: 1,
//       required:1,
//       taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1
//     }).lean();
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });
// exports.getINDIVIDUALAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   try {
//     taskforuser = await TaskForUser.find({ state: "running", username: req.body.username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!taskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });
// exports.getCompletedAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser, result;
//   let totalProjects, overallList;
//   let frequency = ["Completed", "Finished By Others", "Not Applicable to Me"];
//   // let { username, page, pageSize } = req.body;
//   const { username, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
//   try {
//     let query = {
//       username: username,
//       taskstatus: { $in: frequency }
//     };
//     let conditions = [];
//     // Advanced search filter
//     if (allFilters && allFilters.length > 0) {
//       allFilters.forEach(filter => {
//         if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
//           conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
//         }
//       });
//     }
//     if (searchQuery && searchQuery !== undefined) {
//       const searchTermsArray = searchQuery.split(" ");
//       const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));
//       const orConditions = regexTerms.map((regex) => ({
//         $or: [
//           { taskstatus: regex },
//           { taskassigneddate: regex },
//           { taskdetails: regex },
//           { frequency: regex },
//           { completedbyuser: regex },
//           { userdescription: regex },
//           { category: regex },
//           { subcategory: regex },
//           { duration: regex },
//           { breakup: regex },
//           { required: { $in: regex } },
//           { schedule: regex },
//           { priority: regex },
//         ],
//       }));

//       query = {
//         username: username,
//         taskstatus: { $in: frequency },
//         $and: [
//           ...orConditions,
//         ]
//       };
//     }
//     // Apply logicOperator to combine conditions
//     if (conditions.length > 0) {
//       if (logicOperator === "AND") {
//         query.$and = conditions;
//       } else if (logicOperator === "OR") {
//         query.$or = conditions;
//       }
//     }
//     result = await TaskForUser.find(query, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).skip((page - 1) * pageSize)
//       .limit(parseInt(pageSize));

//     totalProjects = await TaskForUser.find(query, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).countDocuments()
//     overallList = await TaskForUser.find({ username: username, taskstatus: { $in: frequency } }, {
//       _id: 1,
//       taskstatus: 1,
//       taskassigneddate: 1, timetodo: 1,
//       taskdetails: 1,
//       frequency: 1,
//       completedbyuser: 1,
//       userdescription: 1,
//       category: 1,
//       subcategory: 1,
//       duration: 1,
//       breakup: 1,
//       required: 1,
//       schedule: 1,
//       priority: 1,
//       timetodo: 1
//     }).lean();

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }

//   return res.status(200).json({
//     // count: products.length,
//     totalProjects: totalProjects,
//     currentPage: page,
//     result,
//     overallList,
//     totalPages: Math.ceil(totalProjects / pageSize),
//   });
// });




// exports.getAllTaskUserOverallReports = catchAsyncErrors(async (req, res, next) => {
//   let result, totalProjects, overall;
//   const { company, branch, unit, team, fromdate, todate, department, username, taskstatus, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
//   const skip = (page - 1) * pageSize; // Calculate the number of items to skip
//   let query = {
//     taskstatus: { $in: taskstatus }
//   };
//   let overallQuery = {
//     taskstatus: { $in: taskstatus }
//   };
//   let queryUser = {};
//   if (company.length > 0) {
//     queryUser.company = { $in: company };
//   }
//   if (branch.length > 0) {
//     queryUser.branch = { $in: branch };
//   }
//   if (unit.length > 0) {
//     queryUser.unit = { $in: unit };
//   }
//   if (team.length > 0) {
//     queryUser.team = { $in: team };
//   }
//   if (department.length > 0) {
//     queryUser.department = { $in: department };
//   }
//   if (username?.length > 0) {
//     queryUser.companyname = { $in: username };
//   }
//   const usernamesfilter = await User.find(queryUser, { companyname: 1 }).lean();
//   const UserNamesFromUser = usernamesfilter?.length > 0 ? usernamesfilter?.map(data => data?.companyname) : [];
//   if (UserNamesFromUser?.length > 0) {
//     query.username = { $in: UserNamesFromUser };
//     overallQuery.username = { $in: UserNamesFromUser };


//   }
//   if (fromdate && todate) {
//     query = {
//       ...query,
//       $expr: {
//         $and: [
//           {
//             $gte: [
//               {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y"
//                 }
//               },
//               new Date(fromdate)
//             ]
//           },
//           {
//             $lte: [
//               {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y"
//                 }
//               },
//               new Date(todate)
//             ]
//           }
//         ]
//       }
//     };
//     overallQuery = {
//       ...overallQuery,
//       $expr: {
//         $and: [
//           {
//             $gte: [
//               {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y"
//                 }
//               },
//               new Date(fromdate)
//             ]
//           },
//           {
//             $lte: [
//               {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y"
//                 }
//               },
//               new Date(todate)
//             ]
//           }
//         ]
//       }
//     };

//   }

//   let conditions = [];
//   // Advanced search filter
//   if (allFilters && allFilters.length > 0) {
//     allFilters.forEach(filter => {
//       if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
//         conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
//       }
//     });
//   }
//   if (searchQuery && searchQuery !== undefined) {
//     const searchTermsArray = searchQuery.split(" ");
//     const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));
//     const orConditions = regexTerms.map((regex) => ({
//       $or: [
//         { taskstatus: regex },
//         { taskassigneddate: regex },
//         { taskdetails: regex },
//         { frequency: regex },
//         { completedbyuser: regex },
//         { userdescription: regex },
//         { category: regex },
//         { subcategory: regex },
//         { duration: regex },
//         { breakup: regex },
//         { required: { $in: regex } },
//         { schedule: regex },
//       ],
//     }));

//     query = {
//       ...query,
//       $and: [
//         ...orConditions,
//       ]
//     };
//   }
//   // Apply logicOperator to combine conditions
//   if (conditions.length > 0) {
//     if (logicOperator === "AND") {
//       query.$and = conditions;
//     } else if (logicOperator === "OR") {
//       query.$or = conditions;
//     }
//   }
//   try {
//     // First, count the total number of projects matching the frequency criteria
//     totalProjects = UserNamesFromUser?.length > 0 ? await TaskForUser.countDocuments(query) : 0;
//     overall = UserNamesFromUser?.length > 0 ? await TaskForUser.find(overallQuery,
//       {
//         category: 1,
//         subcategory: 1,
//         frequency: 1,
//         schedule: 1,
//         username: 1,
//         date: 1,
//         shiftEndTime: 1,
//         taskdetails: 1,
//         timetodo: 1,
//         description: 1,
//         taskstatus: 1,
//         taskassigneddate: 1, timetodo: 1,
//         taskdate: 1,
//         taskassign: 1,
//         breakup: 1,
//         assignId: 1,
//         monthdate: 1,
//         weekdays: 1,
//         annumonth: 1,
//         required: 1,
//         duration: 1,
//         priority: 1
//       }).lean() : [];
//     // Then, find the projects with pagination
//     result = UserNamesFromUser?.length > 0 ? await TaskForUser.find(query,
//       {
//         category: 1,
//         subcategory: 1,
//         frequency: 1,
//         schedule: 1,
//         username: 1,
//         date: 1,
//         shiftEndTime: 1,
//         taskdetails: 1,
//         timetodo: 1,
//         description: 1,
//         taskstatus: 1,
//         taskassigneddate: 1, timetodo: 1,
//         taskdate: 1,
//         taskassign: 1,
//         breakup: 1,
//         assignId: 1,
//         monthdate: 1,
//         weekdays: 1,
//         annumonth: 1,
//         required: 1,
//         duration: 1,
//         priority: 1
//       }).lean()
//       .skip(skip)
//       .limit(pageSize) : [];

//     return res.status(200).json({
//       totalProjects,
//       currentPage: page,
//       result,
//       overall,
//       totalPages: Math.ceil(totalProjects / pageSize),
//     });
//   } catch (err) {
//     console.log(err, 'errr')
//     return next(new ErrorHandler("Records not found!", 404));
//   }
// });


// exports.getOnprogressAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   try {
//     taskforuser = await TaskForUser.find({ taskstatus: ["Paused", "Pending", "Postponed"], username: req.body.username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();;
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!taskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });
// exports.getManualAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   try {
//     taskforuser = await TaskForUser.find({ taskdetails: "Manual", username: req.body.username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!taskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });
// exports.getAllManualAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   try {
//     taskforuser = await TaskForUser.find({ taskdetails: "Manual" }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!taskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });
// // exports.getAllManualAllTaskForUserIDS = catchAsyncErrors(async (req, res, next) => {
// //   let taskforuser, idArray;


// //   try {
// //     taskforuser = await TaskForUser.aggregate([
// //       {
// //         $match: {
// //           taskdetails: "Manual",
// //           taskname: req.body.taskname,
// //           tasktime : req.body.tasktime
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: null,               
// //           ids: { $push: "$_id" }    
// //         }
// //       },
// //       {
// //         $project: {
// //           _id: 0,                  
// //           ids: 1           
// //         }
// //       }
// //     ]);
// //   } catch (err) {
// //     console.log(err , 'err')
// //     return next(new ErrorHandler("Records not found!", 404));
// //   }
// //   return res.status(200).json({
// //     // count: products.length,
// //     taskforuser,
// //   });
// // });
// exports.getAllTaskForUserOnprogress = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   let username = req.body.username;
//   let anstaskUserPanel;
//   try {
//     taskforuser = await TaskForUser.find({ username: username, taskstatus: ["Paused", "Pending"] }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//     anstaskUserPanel = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username
//       === username && ["Paused", "Pending"]?.includes(data?.taskstatus) && data.taskdetails !== "Manual") : []
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!taskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     anstaskUserPanel,
//   });
// });
// exports.getAllTaskForUserManual = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser, answer;
//   let username = req.body.username;
//   let role = req.body.role?.map(data => data?.toUpperCase());
//   let anstaskUserPanel;
//   try {
//     const query = {
//       taskdetails: "Manual",
//       ...(role?.some(data => ["MANAGER", "SUPERADMIN", "SUPER ADMIN"].includes(data)) ? {} : { username })
//     };
//     taskforuser = await TaskForUser.find(query, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//     answer = await TaskForUser.find({ taskdetails: "Manual" }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//     anstaskUserPanel = answer
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!answer) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser, anstaskUserPanel
//   });
// });
// exports.getAllTaskForUserCompleted = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   let username = req.body.username;
//   let anstaskUserPanel;
//   try {
//     anstaskUserPanel = await TaskForUser.find({
//       username: username,
//       taskdetails: { $ne: "Manual" },
//       taskstatus: { $in: ["Completed", "Finished By Others", "Not Applicable to Me"] }
//     }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!anstaskUserPanel) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     anstaskUserPanel,
//   });
// });

// exports.getCompletedAllTaskForUserOverall = catchAsyncErrors(async (req, res, next) => {
//   let result;

//   let { username } = req.body;
//   try {


//     result = await TaskForUser.find({ taskstatus: ["Completed", "Finished By Others", "Not Applicable to Me"], username: username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }

//   return res.status(200).json({
//     result,
//   });
// });

// exports.getAllTaskUserReportsOverall = catchAsyncErrors(async (req, res, next) => {
//   let result;

//   const { frequency } = req.body;
//   try {


//     result = await TaskForUser.find({
//       frequency: { $in: frequency },
//     }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }

//   return res.status(200).json({
//     result,
//   });
// });

// exports.getAllTaskUserReports = catchAsyncErrors(async (req, res, next) => {
//   let result, totalProjects, overall;
//   const { frequency, status, fromdate, todate, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
//   const skip = (page - 1) * pageSize; // Calculate the number of items to skip
//   let query = {};
//   let Overallquery = {};
//   if (frequency?.length > 0) {
//     query.frequency = { $in: frequency }
//     Overallquery.frequency = { $in: frequency }
//   }
//   if (status?.length > 0) {
//     query.taskstatus = { $in: status }
//     Overallquery.taskstatus = { $in: status }
//   }

//   if (fromdate && todate) {
//     query = {
//       ...query,
//       $expr: {
//         $and: [
//           {
//             $gte: [
//               {
//                 $dateFromString: {
//                   dateString: {
//                     $ifNull: ["$taskassigneddate", "$taskdate"]
//                   },
//                   format: {
//                     $cond: {
//                       if: { $ifNull: ["$taskassigneddate", false] },
//                       then: "%d-%m-%Y",
//                       else: "%Y-%m-%d"
//                     }
//                   }
//                 }
//               },
//               new Date(fromdate)
//             ]
//           },
//           {
//             $lte: [
//               {
//                 $dateFromString: {
//                   dateString: {
//                     $ifNull: ["$taskassigneddate", "$taskdate"]
//                   },
//                   format: {
//                     $cond: {
//                       if: { $ifNull: ["$taskassigneddate", false] },
//                       then: "%d-%m-%Y",
//                       else: "%Y-%m-%d"
//                     }
//                   }
//                 }
//               },
//               new Date(todate)
//             ]
//           }
//         ]
//       }
//     }



//     Overallquery = {
//       ...Overallquery,
//       $expr: {
//         $and: [
//           {
//             $gte: [
//               {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y"
//                 }
//               },
//               new Date(fromdate)
//             ]
//           },
//           {
//             $lte: [
//               {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y"
//                 }
//               },
//               new Date(todate)
//             ]
//           }
//         ]
//       }
//     };
//   }

//   let conditions = [];

//   // Advanced search filter
//   if (allFilters && allFilters.length > 0) {
//     allFilters.forEach(filter => {
//       if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
//         conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
//       }
//     });
//   }
//   if (searchQuery && searchQuery !== undefined) {
//     const searchTermsArray = searchQuery.split(" ");
//     const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));
//     const orConditions = regexTerms.map((regex) => ({
//       $or: [
//         { taskstatus: regex },
//         { taskassigneddate: regex },
//         { taskdetails: regex },
//         { frequency: regex },
//         { completedbyuser: regex },
//         { userdescription: regex },
//         { category: regex },
//         { subcategory: regex },
//         { duration: regex },
//         { breakup: regex },
//         { required: { $in: regex } },
//         { schedule: regex },
//       ],
//     }));

//     query = {
//       $and: [
//         ...orConditions,
//       ]
//     };
//   }
//   // Apply logicOperator to combine conditions
//   if (conditions.length > 0) {
//     if (logicOperator === "AND") {
//       query.$and = conditions;
//     } else if (logicOperator === "OR") {
//       query.$or = conditions;
//     }
//   }

//   try {
//     // First, count the total number of projects matching the frequency criteria
//     totalProjects = await TaskForUser.countDocuments(query);
//     overall = await TaskForUser.find(Overallquery,
//       {
//         category: 1,
//         subcategory: 1,
//         frequency: 1,
//         schedule: 1,
//         username: 1,
//         date: 1,
//         shiftEndTime: 1,
//         taskdetails: 1,
//         timetodo: 1,
//         description: 1,
//         taskstatus: 1,
//         taskassigneddate: 1,
//         taskdate: 1,
//         taskassign: 1,
//         breakup: 1,
//         assignId: 1,
//         monthdate: 1,
//         weekdays: 1,
//         annumonth: 1,
//         required: 1,
//         duration: 1,
//         priority: 1
//       }).lean();

//     // Then, find the projects with pagination
//     result = await TaskForUser.find(query,
//       {
//         category: 1,
//         subcategory: 1,
//         frequency: 1,
//         schedule: 1,
//         username: 1,
//         date: 1,
//         shiftEndTime: 1,
//         taskdetails: 1,
//         timetodo: 1,
//         description: 1,
//         taskstatus: 1,
//         taskassigneddate: 1, timetodo: 1,
//         taskdate: 1,
//         taskassign: 1,
//         breakup: 1,
//         assignId: 1,
//         monthdate: 1,
//         weekdays: 1,
//         annumonth: 1,
//         required: 1,
//         duration: 1,
//         priority: 1
//       }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean()
//       .skip(skip)
//       .limit(pageSize);

//     return res.status(200).json({
//       totalProjects,
//       currentPage: page,
//       result,
//       overall,
//       totalPages: Math.ceil(totalProjects / pageSize),
//     });
//   } catch (err) {
//     console.log(err, 'err')
//     return next(new ErrorHandler("Records not found!", 404));
//   }
// });

// // Helper function to create filter condition
// function createFilterCondition(column, condition, value) {
//   switch (condition) {
//     case "Contains":
//       return { [column]: new RegExp(value, 'i') };
//     case "Does Not Contain":
//       return { [column]: { $not: new RegExp(value, 'i') } };
//     case "Equals":
//       return { [column]: value };
//     case "Does Not Equal":
//       return { [column]: { $ne: value } };
//     case "Begins With":
//       return { [column]: new RegExp(`^${value}`, 'i') };
//     case "Ends With":
//       return { [column]: new RegExp(`${value}$`, 'i') };
//     case "Blank":
//       return { [column]: { $exists: false } };
//     case "Not Blank":
//       return { [column]: { $exists: true } };
//     default:
//       return {};
//   }
// }




// exports.getAllTaskForUserAutoGenerate = catchAsyncErrors(async (req, res, next) => {
//   const { updatedAns, username } = req.body;
//   let uniqueElements, nonscheduledata;

//   try {
//     // Query to fetch matching tasks for uniqueElements
//     const existingTasks = await TaskForUser.find({
//       username: username,
//       taskdetails: "schedule",
//       shiftEndTime: { $gte: new Date() }
//     }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//     // Filter updatedAns based on the existingTasks query
//     uniqueElements = updatedAns?.filter(obj1 =>
//       !existingTasks.some(obj2 =>
//         obj1.category === obj2.category &&
//         obj1.subcategory === obj2.subcategory &&
//         obj1.frequency === obj2.frequency &&
//         obj1.schedule === obj2.schedule
//       )
//     );

//     // Query to fetch non-scheduled tasks
//     nonscheduledata = await TaskForUser.find({
//       username: username,
//       taskdetails: "nonschedule",
//       taskdate: moment(new Date()).format("YYYY-MM-DD")
//     }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//     if (!uniqueElements && !nonscheduledata) {
//       return next(new ErrorHandler("Records not found", 404));
//     }

//     return res.status(200).json({
//       uniqueElements,
//       nonscheduledata,
//     });
//   } catch (err) {
//     return next(new ErrorHandler("Records not found", 404));
//   }
// });

// exports.getAllTaskHierarchyReports = catchAsyncErrors(
//   async (req, res, next) => {
//     let taskforuser,
//       result,
//       resultArray,
//       user,
//       result1,
//       ans1D,
//       i = 1,
//       result2,
//       result3,
//       result4,
//       result5,
//       result6,
//       result7,
//       result8,
//       dataCheck,
//       userFilter,
//       excelmapdata,
//       excelmapdataresperson,
//       hierarchyFilter,
//       excels,
//       answerDef,
//       hierarchyFinal,
//       hierarchy,
//       hierarchyDefault,
//       hierarchyDefList,
//       resultAccessFilter,
//       branch,
//       hierarchySecond,
//       overallMyallList,
//       hierarchyMap,
//       resulted = [],
//       resultedTeam = [],
//       reportingusers,
//       myallTotalNames;


//     const { listpageaccessmode } = req.body;

//     let uniqueElements, nonscheduledata;

//     try {
//       const fromDate = moment(req.body.fromdate, "DD-MM-YYYY").toDate();
//       const toDate = moment(req.body.todate, "DD-MM-YYYY").toDate();
//       let levelFinal = req.body?.sector === "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body?.sector]
//       let answer = await Hirerarchi.aggregate([
//         {
//           $match: {
//             supervisorchoose:
//               req?.body?.username, // Match supervisorchoose with username
//             level: { $in: levelFinal } // Corrected unmatched quotation mark
//           }
//         },
//         {
//           $lookup: {
//             from: "reportingheaders",
//             let: {
//               teamControlsArray: {
//                 $ifNull: ["$pagecontrols", []]
//               }
//             },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       {
//                         $in: [
//                           "$name",
//                           "$$teamControlsArray"
//                         ]
//                       }, // Check if 'name' is in 'teamcontrols' array
//                       {
//                         $in: [
//                           req?.body?.pagename,
//                           "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
//                         ]
//                       } // Additional condition for reportingnew array
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: "reportData" // The resulting matched documents will be in this field
//           }
//         },
//         {
//           $project: {
//             supervisorchoose: 1,
//             employeename: 1,
//             reportData: 1
//           }
//         }
//       ]);
//       let restrictList = answer?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)

//       result = await User.find(
//         {
//           enquirystatus: {
//             $nin: ["Enquiry Purpose"],
//           },
//           resonablestatus: {
//             $nin: [
//               "Not Joined",
//               "Postponed",
//               "Rejected",
//               "Closed",
//               "Releave Employee",
//               "Absconded",
//               "Hold",
//               "Terminate",
//             ],
//           },
//           ...(listpageaccessmode === "Reporting to Based"
//             ? { reportingto: req.body.username }
//             : {}),
//         },
//         {
//           empcode: 1,
//           companyname: 1,
//           username: 1,
//           branch: 1,
//           unit: 1,
//           designation: 1,
//           team: 1,
//           department: 1,
//           company: 1,
//           extratime: 1,
//           extrastatus: 1,
//           extradate: 1,
//           loginUserStatus: 1, workstation: 1, workstationshortname: 1, workstationinput: 1,
//         }
//       );


//       if (listpageaccessmode === "Reporting to Based") {
//         reportingusers = await User.find(
//           {
//             enquirystatus: {
//               $nin: ["Enquiry Purpose"],
//             },
//             resonablestatus: {
//               $nin: [
//                 "Not Joined",
//                 "Postponed",
//                 "Rejected",
//                 "Closed",
//                 "Releave Employee",
//                 "Absconded",
//                 "Hold",
//                 "Terminate",
//               ],
//             },
//             reportingto: req.body.username,
//           },
//           {
//             empcode: 1,
//             companyname: 1,
//           }
//         ).lean();
//         const companyNames = reportingusers.map((user) => user.companyname);
//         result = await TaskForUser.aggregate([
//           {
//             $addFields: {
//               formattedDate: {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y",
//                 },
//               },
//             },
//           },
//           {
//             $match: {
//               username: { $in: companyNames }, // Ensure `companyNames` is defined and an array
//               formattedDate: {
//                 $gte: new Date(req?.body?.fromdate),
//                 $lte: new Date(req?.body?.todate),
//               },
//             },
//           },
//           {
//             $project: {
//               category: 1,
//               subcategory: 1,
//               frequency: 1,
//               schedule: 1,
//               username: 1,
//               date: 1,
//               shiftEndTime: 1,
//               taskdetails: 1,
//               timetodo: 1,
//               description: 1,
//               taskstatus: 1,
//               taskassigneddate: 1,
//               taskdate: 1,
//               taskassign: 1,
//               breakup: 1,
//               assignId: 1,
//               monthdate: 1,
//               weekdays: 1,
//               annumonth: 1,
//               required: 1,
//               duration: 1,
//               priority: 1,
//             },
//           },
//         ]);
//       } else {
//         result = await TaskForUser.aggregate([
//           {
//             $addFields: {
//               formattedDate: {
//                 $dateFromString: {
//                   dateString: "$taskassigneddate",
//                   format: "%d-%m-%Y",
//                 },
//               },
//             },
//           },
//           {
//             $match: {
//               formattedDate: {
//                 $gte: new Date(req?.body?.fromdate),
//                 $lte: new Date(req?.body?.todate),
//               },
//             },
//           },
//           {
//             $project: {
//               category: 1,
//               subcategory: 1,
//               frequency: 1,
//               schedule: 1,
//               username: 1,
//               date: 1,
//               shiftEndTime: 1,
//               taskdetails: 1,
//               timetodo: 1,
//               description: 1,
//               taskstatus: 1,
//               taskassigneddate: 1, timetodo: 1,
//               taskdate: 1,
//               taskassign: 1,
//               breakup: 1,
//               assignId: 1,
//               monthdate: 1,
//               weekdays: 1,
//               annumonth: 1,
//               required: 1,
//               duration: 1,
//               priority: 1
//             },
//           },
//         ]);

//       }

//       // Accordig to sector and list filter process
//       hierarchyFilter = await Hirerarchi.find({ level: req.body.sector });
//       userFilter = hierarchyFilter
//         .filter((data) => data.supervisorchoose.includes(req.body.username))
//         .map((data) => data.employeename);

//       hierarchyDefList = await Hirerarchi.find();
//       user = await User.find({ companyname: req.body.username });
//       const userFilt = user.length > 0 && user[0].designation;
//       const desiGroup = await Designation.find();
//       let HierarchyFilt =
//         req.body.sector === "all"
//           ? hierarchyDefList
//             .filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             .map((data) => data.designationgroup)
//           : hierarchyFilter
//             .filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             .map((data) => data.designationgroup);
//       const DesifFilter = desiGroup.filter((data) =>
//         HierarchyFilt.includes(data.group)
//       );
//       const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
//       const SameDesigUser = HierarchyFilt.includes("All")
//         ? true
//         : userFilt === desigName;
//       //Default Loading of List
//       answerDef = hierarchyDefList
//         .filter((data) => data.supervisorchoose.includes(req.body.username))
//         .map((data) => data.employeename);

//       hierarchyFinal =
//         req.body.sector === "all"
//           ? answerDef.length > 0
//             ? [].concat(...answerDef)
//             : []
//           : hierarchyFilter.length > 0
//             ? [].concat(...userFilter)
//             : [];

//       hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];
//       //solo
//       ans1D =
//         req.body.sector === "all"
//           ? answerDef.length > 0
//             ? hierarchyDefList.filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             : []
//           : hierarchyFilter.length > 0
//             ? hierarchyFilter.filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             : [];

//       result1 =
//         ans1D.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = ans1D.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];

//       resulted = result1;

//       //team
//       let branches = [];
//       hierarchySecond = await Hirerarchi.find();

//       const subBranch =
//         hierarchySecond.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) =>
//                 hierarchyMap.includes(name)
//               )
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";

//       const answerFilterExcel =
//         hierarchySecond.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => hierarchyMap.includes(name))
//           )
//           : [];

//       result2 =
//         answerFilterExcel.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...subBranch);

//       const ans =
//         subBranch.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => subBranch.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";
//       const answerFilterExcel2 =
//         subBranch.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => subBranch.includes(name))
//           )
//           : [];

//       result3 =
//         answerFilterExcel2.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel2.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...ans);

//       const loop3 =
//         ans.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => ans.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";

//       const answerFilterExcel3 =
//         ans.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => ans.includes(name))
//           )
//           : [];

//       result4 =
//         answerFilterExcel3.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel3?.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...loop3);

//       const loop4 =
//         loop3.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => loop3.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : [];
//       const answerFilterExcel4 =
//         loop3.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => loop3.includes(name))
//           )
//           : [];
//       result5 =
//         answerFilterExcel4.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel4?.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...loop4);

//       const loop5 =
//         loop4.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => loop4.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";
//       const answerFilterExcel5 =
//         loop4.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => loop4.includes(name))
//           )
//           : [];
//       result6 =
//         answerFilterExcel5.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel5?.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...loop5);

//       resultedTeam = [
//         ...result2,
//         ...result3,
//         ...result4,
//         ...result5,
//         ...result6,
//       ];
//       //overall Teams List
//       myallTotalNames = [...hierarchyMap, ...branches];
//       overallMyallList = [...resulted, ...resultedTeam];
//       const restrictTeam = await Hirerarchi.aggregate([
//         {
//           $match: {
//             supervisorchoose:
//               { $in: myallTotalNames }, // Match supervisorchoose with username
//             level: { $in: levelFinal } // Corrected unmatched quotation mark
//           }
//         },
//         {
//           $lookup: {
//             from: "reportingheaders",
//             let: {
//               teamControlsArray: {
//                 $ifNull: ["$pagecontrols", []]
//               }
//             },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       {
//                         $in: [
//                           "$name",
//                           "$$teamControlsArray"
//                         ]
//                       }, // Check if 'name' is in 'teamcontrols' array
//                       {
//                         $in: [
//                           req?.body?.pagename,
//                           "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
//                         ]
//                       } // Additional condition for reportingnew array
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: "reportData" // The resulting matched documents will be in this field
//           }
//         },
//         {
//           $project: {
//             supervisorchoose: 1,
//             employeename: 1,
//             reportData: 1
//           }
//         }
//       ]);
//       let restrictListTeam = restrictTeam?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)
//       let overallRestrictList = req.body.hierachy === "myhierarchy" ? restrictList : req.body.hierachy === "allhierarchy" ? restrictListTeam : [...restrictList, ...restrictListTeam];



//       let resultAccessFiltered =
//         req.body.hierachy === "myhierarchy" &&
//           (listpageaccessmode === "Hierarchy Based" ||
//             listpageaccessmode === "Overall")
//           ? resulted
//           : req.body.hierachy === "allhierarchy" &&
//             (listpageaccessmode === "Hierarchy Based" ||
//               listpageaccessmode === "Overall")
//             ? resultedTeam
//             : req.body.hierachy === "myallhierarchy" &&
//               (listpageaccessmode === "Hierarchy Based" ||
//                 listpageaccessmode === "Overall")
//               ? overallMyallList
//               : result;

//       resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFiltered?.filter(data => overallRestrictList?.includes(data?.username)) : [];


//     } catch (err) {
//       return next(new ErrorHandler("Records not found", 404));
//     }
//     return res.status(200).json({
//       resultAccessFilter, resultedTeam
//     });
//   }
// );


// exports.getAllTaskForUserAssignId = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser;
//   let assignid = req.body.assignId
//   let orginalid = req.body.orginalid
//   try {
//     const task = await TaskForUser.find({ assignId: assignid, orginalid: orginalid, taskassign: "Team" }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//     taskforuser = task?.filter(data => data?.username !== req.body.username)

//   } catch (err) {
//     return next(new ErrorHandler("Records not found", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser
//   });
// });

// exports.getAllSortedTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser, sortedTasks;
//   let username = req.body?.username;
//   let todaysDate = req.body?.todaysDate;
//   let PresentDate = req.body.date;
//   try {
//     taskforuser = await TaskForUser.find({ username: username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, tasktime: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//     const frequencyOrder = {
//       Daily: 1,
//       "Date wise": 2,
//       "Day wise": 3,
//       Weekly: 4,
//       Monthly: 5,
//       Annually: 6,
//     };
//     const priorityOrder = {
//       High: 1,
//       Medium: 2,
//       Low: 3,
//     };

//     function compareTimeNonSchedule(a, b) {
//       if (a?.tasktime === b?.tasktime) {
//         return 0;
//       } else if (a.tasktime === "") {
//         return 1;
//       } else if (b.tasktime === "") {
//         return -1;
//       } else {
//         const timeA = a.tasktime.split(":");
//         const timeB = b.tasktime.split(":");
//         const hourDiff = parseInt(timeA[0]) - parseInt(timeB[0]);
//         if (hourDiff !== 0) {
//           return hourDiff;
//         } else {
//           return parseInt(timeA[1]) - parseInt(timeB[1]);
//         }
//       }
//     }

//     let anstaskOnProgress = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data.taskstatus === "OnProgress") : []
//     let anstaskUserPanelSchedule = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "schedule" && data.taskstatus === "Assigned") : []
//     let anstaskUserPanelNonScheduleFixed = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency === "Fixed" && data.taskstatus === "Assigned").sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]) : [];
//     let anstaskUserPanelNonScheduleAnyTime = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency !== "Fixed" && data.taskstatus === "Assigned") : [];
//     anstaskUserPanelNonScheduleAnyTime?.sort((a, b) => compareTimeNonSchedule(a, b));
//     //Assigned
//     let finalSchedule = anstaskUserPanelSchedule?.length > 0 ? anstaskUserPanelSchedule?.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]) : [];
//     let onProgressTask = anstaskOnProgress?.length > 0 ? anstaskOnProgress : []

//     let final = [...onProgressTask, ...finalSchedule, ...anstaskUserPanelNonScheduleFixed, ...anstaskUserPanelNonScheduleAnyTime]


//     const uniqueObjects = [];
//     const uniqueKeys = new Set();
//     final?.forEach(obj => {
//       const key = `${obj.category}-${obj.subcategory}-${obj.username}-${obj.frequency}-${obj.duration}-${obj.taskassigneddate}`;
//       if (!uniqueKeys.has(key)) {
//         uniqueObjects.push(obj);
//         uniqueKeys.add(key);

//       }
//       return uniqueObjects;
//     });


//     // Filter today's tasks
//     const todayTasks = final?.filter(task => task?.taskassigneddate === todaysDate);

//     // Filter tasks for other dates
//     const otherTasks = final?.filter(task => task?.taskassigneddate !== todaysDate);

//     // Sort tasks by both date and time
//     otherTasks?.sort((a, b) => {
//       // Convert date string to Date object
//       const dateA = new Date(a.taskassigneddate);
//       const dateB = new Date(b.taskassigneddate);

//       // Compare dates first
//       if (dateA < dateB) return -1;
//       if (dateA > dateB) return 1;
//       return dateA - dateB;
//     });


//     function compareTime(a, b) {
//       if (a?.timetodo?.length === 0 && b?.timetodo?.length === 0) {
//         return 0; // Both have no time specified
//       } else if (a.timetodo.length === 0) {
//         return 1; // a has no time, move it to the end
//       } else if (b.timetodo.length === 0) {
//         return -1; // b has no time, move it to the end
//       } else {
//         // Compare time based on hour, minute, and time type (AM/PM)
//         const timeA = a.timetodo[0];
//         const timeB = b.timetodo[0];

//         // Convert hour to 24-hour format for comparison
//         const hourA = parseInt(timeA.hour) + (timeA.timetype.toUpperCase() === 'PM' ? 12 : 0);
//         const hourB = parseInt(timeB.hour) + (timeB.timetype.toUpperCase() === 'PM' ? 12 : 0);

//         const hourDiff = hourA - hourB;

//         if (hourDiff !== 0) {
//           return hourDiff;
//         } else {
//           // If hours are the same, compare minutes
//           const minDiff = parseInt(timeA.min) - parseInt(timeB.min);
//           if (minDiff !== 0) {
//             return minDiff;
//           } else {
//             // If minutes are also the same, compare time type
//             if (timeA.timetype.toUpperCase() === 'AM' && timeB.timetype.toUpperCase() === 'PM') {
//               return -1;
//             } else if (timeA.timetype.toUpperCase() === 'PM' && timeB.timetype.toUpperCase() === 'AM') {
//               return 1;
//             } else {
//               return 0; // Both time types are the same
//             }
//           }
//         }
//       }
//     }

//     // Sort the uniqueElements array using the compareTime function
//     todayTasks.sort(compareTime);
//     sortedTasks = otherTasks?.concat(todayTasks);

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!sortedTasks) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     sortedTasks,
//   });
// });
// const convertTimeToAMPMFormat = (time) => {
//   let [hour, minute] = time.split(':').map(Number);
//   let timetype = 'AM';

//   if (hour >= 12) {
//     timetype = 'PM';
//     if (hour > 12) {
//       hour -= 12;
//     }
//   }

//   if (hour === 0) {
//     hour = 12;
//   }

//   return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute} ${timetype}`;
// };



// const taskSorted = async (user) => {
//   let taskforuser, sortedTasks;
//   let username = user;
//   let todaysDate = moment(new Date()).format("YYYY-MM-DD");
//   let PresentDate = new Date().toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   }).split('/').join('-');
//   try {
//     taskforuser = await TaskForUser.find({ username: username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

//     const frequencyOrder = {
//       Daily: 1,
//       "Date wise": 2,
//       "Day wise": 3,
//       Weekly: 4,
//       Monthly: 5,
//       Annually: 6,
//     };
//     const priorityOrder = {
//       High: 1,
//       Medium: 2,
//       Low: 3,
//     };

//     function compareTimeNonSchedule(a, b) {
//       if (a?.tasktime === b?.tasktime) {
//         return 0;
//       } else if (a.tasktime === "") {
//         return 1;
//       } else if (b.tasktime === "") {
//         return -1;
//       } else {
//         const timeA = a.tasktime.split(":");
//         const timeB = b.tasktime.split(":");
//         const hourDiff = parseInt(timeA[0]) - parseInt(timeB[0]);
//         if (hourDiff !== 0) {
//           return hourDiff;
//         } else {
//           return parseInt(timeA[1]) - parseInt(timeB[1]);
//         }
//       }
//     }

//     let anstaskOnProgress = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data.taskstatus === "OnProgress") : []
//     let anstaskUserPanelSchedule = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "schedule" && data.taskstatus === "Assigned") : []
//     let anstaskUserPanelNonScheduleFixed = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency === "Fixed" && data.taskstatus === "Assigned").sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]) : [];
//     let anstaskUserPanelNonScheduleAnyTime = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency !== "Fixed" && data.taskstatus === "Assigned") : [];
//     anstaskUserPanelNonScheduleAnyTime?.sort((a, b) => compareTimeNonSchedule(a, b));
//     //Assigned
//     let finalSchedule = anstaskUserPanelSchedule?.length > 0 ? anstaskUserPanelSchedule?.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]) : [];
//     let onProgressTask = anstaskOnProgress?.length > 0 ? anstaskOnProgress : []

//     let final = [...onProgressTask, ...finalSchedule, ...anstaskUserPanelNonScheduleFixed, ...anstaskUserPanelNonScheduleAnyTime]


//     const uniqueObjects = [];
//     const uniqueKeys = new Set();
//     final?.forEach(obj => {
//       const key = `${obj.category}-${obj.subcategory}-${obj.username}-${obj.frequency}-${obj.duration}-${obj.taskassigneddate}`;
//       if (!uniqueKeys.has(key)) {
//         uniqueObjects.push(obj);
//         uniqueKeys.add(key);

//       }
//       return uniqueObjects;
//     });


//     // Filter today's tasks
//     const todayTasks = final?.filter(task => task?.taskassigneddate === todaysDate);

//     // Filter tasks for other dates
//     const otherTasks = final?.filter(task => task?.taskassigneddate !== todaysDate);

//     // Sort tasks by both date and time
//     otherTasks?.sort((a, b) => {
//       // Convert date string to Date object
//       const dateA = new Date(a.taskassigneddate);
//       const dateB = new Date(b.taskassigneddate);

//       // Compare dates first
//       if (dateA < dateB) return -1;
//       if (dateA > dateB) return 1;
//       return dateA - dateB;
//     });


//     function compareTime(a, b) {
//       if (a?.timetodo?.length === 0 && b?.timetodo?.length === 0) {
//         return 0; // Both have no time specified
//       } else if (a.timetodo.length === 0) {
//         return 1; // a has no time, move it to the end
//       } else if (b.timetodo.length === 0) {
//         return -1; // b has no time, move it to the end
//       } else {
//         // Compare time based on hour, minute, and time type (AM/PM)
//         const timeA = a.timetodo[0];
//         const timeB = b.timetodo[0];

//         // Convert hour to 24-hour format for comparison
//         const hourA = parseInt(timeA.hour) + (timeA.timetype.toUpperCase() === 'PM' ? 12 : 0);
//         const hourB = parseInt(timeB.hour) + (timeB.timetype.toUpperCase() === 'PM' ? 12 : 0);

//         const hourDiff = hourA - hourB;

//         if (hourDiff !== 0) {
//           return hourDiff;
//         } else {
//           // If hours are the same, compare minutes
//           const minDiff = parseInt(timeA.min) - parseInt(timeB.min);
//           if (minDiff !== 0) {
//             return minDiff;
//           } else {
//             // If minutes are also the same, compare time type
//             if (timeA.timetype.toUpperCase() === 'AM' && timeB.timetype.toUpperCase() === 'PM') {
//               return -1;
//             } else if (timeA.timetype.toUpperCase() === 'PM' && timeB.timetype.toUpperCase() === 'AM') {
//               return 1;
//             } else {
//               return 0; // Both time types are the same
//             }
//           }
//         }
//       }
//     }

//     // Sort the uniqueElements array using the compareTime function
//     todayTasks.sort(compareTime);
//     const answer = otherTasks?.concat(todayTasks);
//     sortedTasks = answer?.length > 0 ? answer?.map((item, index) => ({
//       serialNumber: index + 1,
//       id: item._id,
//       taskstatus: item.taskstatus,
//       taskassigneddate: item.taskassigneddate,
//       priority: item.priority,
//       category: item.category,
//       tasktime: item?.taskdetails === "nonschedule" ? item.schedule === "Any Time" ? "" : convertTimeToAMPMFormat(item.tasktime) : item.schedule === "Any Time" ? "" : `${item?.timetodo[0]?.hour}:${item?.timetodo[0]?.min} ${item?.timetodo[0]?.timetype}`,
//       frequency: item.frequency,
//       subcategory: item.subcategory,
//       taskdetails: item.taskdetails,
//       schedule: item.schedule,
//       duration: item.duration,
//       type: item.type,
//       required: item?.required?.map((t, i) => `${i + 1 + ". "}` + t).toString(),
//       breakup: item?.breakup,
//       description: item?.description ? item?.description : "",
//     })) : [];


//     return sortedTasks;
//   } catch (err) {
//     console.log(err?.message, 'TaskSorted')
//   }
// };
// const trainingSorterd = async (user) => {
//   let taskforuser, sortedTasks;
//   let username = user;
//   let todaysDate = moment(new Date()).format("YYYY-MM-DD");
//   let PresentDate = new Date().toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   }).split('/').join('-');
//   try {
//     taskforuser = await TrainingForUser.find({}, {
//       taskstatus: 1,
//       taskdetails: 1,
//       timetodo: 1,
//       username: 1,
//       priority: 1,
//       trainingdetails: 1,
//       frequency: 1,
//       schedule: 1,
//       questioncount: 1,
//       typequestion: 1,
//       category: 1,
//       subcategory: 1,
//       duration: 1,
//       breakup: 1,
//       description: 1,
//       required: 1,
//       taskassigneddate: 1, timetodo: 1,
//       trainingdocuments: 1,

//     }).lean();

//     const frequencyOrder = {
//       Daily: 1,
//       "Date wise": 2,
//       "Day wise": 3,
//       Weekly: 4,
//       Monthly: 5,
//       Annually: 6,
//     };
//     const priorityOrder = {
//       High: 1,
//       Medium: 2,
//       Low: 3,
//     };


//     let anstaskOnProgress = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data.taskstatus === "OnProgress") : []
//     let anstaskUserPanelSchedule = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "Mandatory" && data.taskstatus === "Assigned") : []
//     let anstaskUserPanelOther = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails !== "Mandatory" && data.taskstatus === "Assigned") : []
//     //Assigned
//     let finalSchedule = anstaskUserPanelSchedule?.length > 0 ? anstaskUserPanelSchedule?.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]) : [];
//     let onProgressTask = anstaskOnProgress?.length > 0 ? anstaskOnProgress : []

//     let final = [...onProgressTask, ...finalSchedule, ...anstaskUserPanelOther]


//     const uniqueObjects = [];
//     const uniqueKeys = new Set();
//     final?.forEach(obj => {
//       const key = `${obj.trainingdetails}-${obj.username}-${obj.frequency}-${obj.duration}-${obj.taskassigneddate}`;
//       if (!uniqueKeys.has(key)) {
//         uniqueObjects.push(obj);
//         uniqueKeys.add(key);

//       }
//       return uniqueObjects;
//     });


//     // Filter today's tasks
//     const todayTasks = final?.filter(task => task?.taskassigneddate === todaysDate);

//     // Filter tasks for other dates
//     const otherTasks = final?.filter(task => task?.taskassigneddate !== todaysDate);

//     // Sort tasks by both date and time
//     otherTasks?.sort((a, b) => {
//       // Convert date string to Date object
//       const dateA = new Date(a.taskassigneddate);
//       const dateB = new Date(b.taskassigneddate);

//       // Compare dates first
//       if (dateA < dateB) return -1;
//       if (dateA > dateB) return 1;
//       return dateA - dateB;
//     });


//     function compareTime(a, b) {
//       if (a?.timetodo?.length === 0 && b?.timetodo?.length === 0) {
//         return 0; // Both have no time specified
//       } else if (a.timetodo.length === 0) {
//         return 1; // a has no time, move it to the end
//       } else if (b.timetodo.length === 0) {
//         return -1; // b has no time, move it to the end
//       } else {
//         // Compare time based on hour, minute, and time type (AM/PM)
//         const timeA = a.timetodo[0];
//         const timeB = b.timetodo[0];

//         // Convert hour to 24-hour format for comparison
//         const hourA = parseInt(timeA.hour) + (timeA.timetype.toUpperCase() === 'PM' ? 12 : 0);
//         const hourB = parseInt(timeB.hour) + (timeB.timetype.toUpperCase() === 'PM' ? 12 : 0);

//         const hourDiff = hourA - hourB;

//         if (hourDiff !== 0) {
//           return hourDiff;
//         } else {
//           // If hours are the same, compare minutes
//           const minDiff = parseInt(timeA.min) - parseInt(timeB.min);
//           if (minDiff !== 0) {
//             return minDiff;
//           } else {
//             // If minutes are also the same, compare time type
//             if (timeA.timetype.toUpperCase() === 'AM' && timeB.timetype.toUpperCase() === 'PM') {
//               return -1;
//             } else if (timeA.timetype.toUpperCase() === 'PM' && timeB.timetype.toUpperCase() === 'AM') {
//               return 1;
//             } else {
//               return 0; // Both time types are the same
//             }
//           }
//         }
//       }
//     }

//     // Sort the uniqueElements array using the compareTime function
//     todayTasks.sort(compareTime);
//     const answer = otherTasks?.concat(todayTasks);

//     sortedTasks = answer?.length > 0 ? answer?.map((item, index) => ({
//       serialNumber: index + 1,
//       id: item._id,
//       taskstatus: item.taskstatus,
//       taskassigneddate: item.taskassigneddate,
//       trainingdetails: item.trainingdetails,
//       tasktime: item?.taskdetails !== "Mandatory" ? "" :
//         item.schedule === "Any Time" ? "" :
//           `${item?.timetodo[0]?.hour}:${item?.timetodo[0]?.min} ${item?.timetodo[0]?.timetype}`,
//       frequency: item.frequency,
//       taskdetails: item.taskdetails,
//       schedule: item.schedule,
//       duration: item.duration,
//       type: item.type,
//       required: item?.required?.map((t, i) => `${i + 1 + ". "}` + t).toString(),
//     })) : [];


//     return sortedTasks;
//   } catch (err) {
//     console.log(err?.message, 'TaskSorted')
//   }
// };



// // Create new TaskForUser=> /api/taskforuser/new
// exports.addTaskForUser = catchAsyncErrors(async (req, res, next) => {

//   const { category, subcategory, username, frequency, duration, taskassigneddate, taskdetails, taskdate, tasktime, timetodo } = req.body;
//   const existingRecords = taskdetails === "schedule" ? await TaskForUser.find({
//     category,
//     subcategory,
//     username,
//     frequency,
//     duration,
//     taskassigneddate,
//     taskdetails,
//     timetodo

//   }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean() :
//     await TaskForUser.find({
//       category,
//       subcategory,
//       username,
//       taskdate,
//       tasktime,
//       taskdetails,
//       schedule: req.body.schedule

//     }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//   if (existingRecords?.filter(data => data.taskdetails !== "Manual")?.length > 0) {
//     return res.status(400).json({
//       message: 'This Data is Already Exists!'
//     });
//   }

//   if (req.body.taskassigneddate) {
//     req.body.formattedDate = moment(req.body.taskassigneddate, "DD-MM-YYYY").toDate();
//   }

//   let ataskforuser = await TaskForUser.create(req.body);

//   return res.status(200).json({
//     message: 'Successfully added!',
//     data: ataskforuser
//   });

// });

// // get Signle TaskForUser => /api/taskforuser/:id
// exports.getSingleTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   const id = req.params.id;

//   let staskforuser = await TaskForUser.findById(id);

//   if (!staskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({
//     staskforuser,
//   });
// });

// // update TaskForUser by id => /api/taskforuser/:id
// exports.updateTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   const id = req.params.id;
//   let utaskforuser = await TaskForUser.findByIdAndUpdate(id, req.body);
//   if (!utaskforuser) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({ message: "Updated successfully" });
// });

// // delete TaskForUser by id => /api/taskforuser/:id
// exports.deleteTaskForUser = catchAsyncErrors(async (req, res, next) => {
//   const id = req.params.id;

//   let dtaskschedulegrouping = await TaskForUser.findByIdAndRemove(id);

//   if (!dtaskschedulegrouping) {
//     return next(new ErrorHandler("Data not found!", 404));
//   }
//   return res.status(200).json({ message: "Deleted successfully" });
// });

// exports.getAllTaskForUserUsername = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser, task;
//   let username = req.body.username;
//   let state = req.body.state;
//   let id = req.body.id
//   try {
//     task = await TaskForUser.find({ username: username, state: state }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
//     taskforuser = task?.find(data => data?._id?.toString() !== id)
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }

//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });



// //to get pending task count
// exports.getPendingTaskCount = catchAsyncErrors(async (req, res, next) => {
//   let task;
//   let username = req.query.username;
//   try {
//     task = await TaskForUser.countDocuments({
//       username: username,
//       taskstatus: {
//         $nin: ["Completed", "Not Applicable to Me", "Finished By Others"],
//       },
//     });
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   return res.status(200).json({
//     count: task,
//   });
// });
// exports.getPendingTaskCountUsername = catchAsyncErrors(async (req, res, next) => {
//   let task;
//   let username = req.query.username;
//   try {
//     const pendingDates = await TaskForUser.aggregate([
//       {
//         $match: {
//           username: username,
//           taskstatus: {
//             $nin: ["Completed", "Not Applicable to Me", "Finished By Others"],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$taskassigneddate",
//         },
//       },
//       {
//         $count: "uniquePendingDates"
//       }
//     ]);

//     task = pendingDates[0]?.uniquePendingDates || 0;

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   return res.status(200).json({
//     count: task,
//   });
// });








// //to get pending task count
// exports.gettriggeredWhileClockIn = catchAsyncErrors(async (req, res, next) => {
//   let task;
//   // let username = req.query.username;
//   let { isUserRoleAccess, shifttiming, cin, cout, weekOffShow, holidayShow } = req?.body
//   let userShiftDetails = await fetchUsers(req?.body?.isUserRoleAccess);
//   let calculatedTime = userShiftDetails ? await updateTimeRange(userShiftDetails, cin, cout) : "00:00";
//   let checkShiftTiming = await checkTimeRange(calculatedTime);
//   try {
//     const res_task = await TaskScheduleGrouping.find().lean();
//     const res_shift_User = await Shift.find().lean();
//     const res_task_Schedule = await TaskScheduleGrouping.find().lean();
//     const userChecknonschedule = await TaskNonScheduleGrouping.find().lean();
//     const res_task_Desig = await TaskDesignationGrouping.aggregate([
//       {
//         $match: {
//           schedulestatus: "Active"
//         }
//       },
//     ]);

//     const shiftUser = res_shift_User?.find(item => item.name === isUserRoleAccess.shifttiming)

//     let taskStatusDep = res_task_Desig?.filter(data => {
//       if (data?.type === "Designation") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && data.branch?.includes(isUserRoleAccess?.branch)
//           && data.unit?.includes(isUserRoleAccess?.unit)
//           && data.designation?.includes(isUserRoleAccess?.designation)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Department") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && data.branch?.includes(isUserRoleAccess?.branch)
//           && data.unit?.includes(isUserRoleAccess?.unit) && data.department?.includes(isUserRoleAccess?.department)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Company") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Unit") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && data.branch?.includes(isUserRoleAccess?.branch)
//           && data.unit?.includes(isUserRoleAccess?.unit)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Branch") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && data.branch?.includes(isUserRoleAccess?.branch)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Team") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && data.branch?.includes(isUserRoleAccess?.branch)
//           && data.unit?.includes(isUserRoleAccess?.unit)
//           && data.team?.includes(isUserRoleAccess?.team)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Process") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && data.branch?.includes(isUserRoleAccess?.branch)
//           && data.unit?.includes(isUserRoleAccess?.unit)
//           && data.team?.includes(isUserRoleAccess?.team) &&
//           data.process?.includes(isUserRoleAccess?.process)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Individual") {
//         return data.company?.includes(isUserRoleAccess?.company)
//           && data.branch?.includes(isUserRoleAccess?.branch)
//           && data.unit?.includes(isUserRoleAccess?.unit)
//           && data.team?.includes(isUserRoleAccess?.team)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//     })


//     let userTaskDesignation = taskStatusDep?.length > 0 ? taskStatusDep?.flatMap(data => data.employeenames) : []
//     const DuplicateRemoval = [...new Set(userTaskDesignation)]
//     const userDuplicate = DuplicateRemoval?.includes("ALL") ? [isUserRoleAccess?.companyname] : DuplicateRemoval?.filter(data => data === isUserRoleAccess?.companyname)

//     const frequencyOrder = {
//       Daily: 1,
//       "Date wise": 2,
//       "Day wise": 3,
//       Weekly: 4,
//       Monthly: 5,
//       Annually: 6,
//     };
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);
//     const tomorrowNight = new Date(today);
//     tomorrowNight.setDate(today.getDate() + 1);
//     // const dayOfWeekTomorrow = tomorrow.toLocaleString('en-US', { weekday: 'long' });
//     const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
//     const currentDay = today.getDate();
//     const dayOfMonth = today.getMonth() + 1;

//     // Convert shift start and end times to 24-hour format
//     tomorrowNight.setHours(shiftUser?.totime === 'AM' ? shiftUser?.tohour : Number(shiftUser?.tohour) + 12, shiftUser?.tomin, 0, 0);

//     const updatedArray = taskStatusDep?.length > 0 ? res_task?.map(item2 => {
//       const ans = item2.schedule === "Fixed" ? `${item2.frequency}-${item2.schedule}-${item2?.timetodo[0]?.hour}:${item2?.timetodo[0]?.min} ${item2?.timetodo[0]?.timetype}` : `${item2.frequency}-${item2.schedule}`
//       const matchingItem = taskStatusDep.find(item1 => {
//         if (item1?.type === "Designation") {
//           return item1.category === item2.category
//             && item1.subcategory === item2.subcategory &&
//             item1.company?.includes(isUserRoleAccess?.company)
//             && item1.branch?.includes(isUserRoleAccess?.branch)
//             && item1.unit?.includes(isUserRoleAccess?.unit)
//             &&
//             item1?.designation?.includes(isUserRoleAccess?.designation) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans);
//         }
//         if (item1?.type === "Department") {
//           return item1.category === item2.category &&
//             item1.subcategory === item2.subcategory &&
//             item1.company?.includes(isUserRoleAccess?.company)
//             && item1.branch?.includes(isUserRoleAccess?.branch)
//             && item1.unit?.includes(isUserRoleAccess?.unit)
//             &&
//             item1?.department?.includes(isUserRoleAccess?.department) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans)
//         }
//         if (item1?.type === "Individual") {
//           return item1.category === item2.category
//             && item1.subcategory === item2.subcategory
//             && item1?.company?.includes(isUserRoleAccess?.company)
//             && item1?.branch?.includes(isUserRoleAccess?.branch) &&
//             item1?.unit?.includes(isUserRoleAccess?.unit) &&
//             item1?.team?.includes(isUserRoleAccess?.team) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans)
//         }
//         if (item1?.type === "Company") {
//           return item1.category === item2.category
//             && item1.subcategory === item2.subcategory
//             && item1?.company?.includes(isUserRoleAccess?.company)
//             && (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans)
//         }
//         if (item1?.type === "Branch") {
//           return item1.category === item2.category
//             && item1.subcategory === item2.subcategory
//             && item1?.company?.includes(isUserRoleAccess?.company)
//             && item1?.branch?.includes(isUserRoleAccess?.branch) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans)
//         }
//         if (item1?.type === "Unit") {
//           return item1.category === item2.category
//             && item1.subcategory === item2.subcategory
//             && item1?.company?.includes(isUserRoleAccess?.company)
//             && item1?.branch?.includes(isUserRoleAccess?.branch) &&
//             item1?.unit?.includes(isUserRoleAccess?.unit) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans)
//         }
//         if (item1?.type === "Team") {
//           return item1.category === item2.category
//             && item1.subcategory === item2.subcategory
//             && item1?.company?.includes(isUserRoleAccess?.company)
//             && item1?.branch?.includes(isUserRoleAccess?.branch) &&
//             item1?.unit?.includes(isUserRoleAccess?.unit) &&
//             item1?.team?.includes(isUserRoleAccess?.team) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans)
//         }
//         if (item1?.type === "Process") {
//           return item1.category === item2.category
//             && item1.subcategory === item2.subcategory
//             && item1?.company?.includes(isUserRoleAccess?.company)
//             && item1?.branch?.includes(isUserRoleAccess?.branch) &&
//             item1?.unit?.includes(isUserRoleAccess?.unit) &&
//             item1?.team?.includes(isUserRoleAccess?.team) &&
//             item1?.process?.includes(isUserRoleAccess?.process) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
//             item1?.frequency?.includes(ans)
//         }
//       })

//       if (matchingItem) {
//         return { ...item2, schedulestatus: matchingItem?.schedulestatus, taskassign: matchingItem?.taskassign, assignId: matchingItem?._id, priority: matchingItem.priority, description: matchingItem.description, documentfiles: matchingItem.documentfiles };
//       }
//     }) : [];

//     let anstaskUserPanel = updatedArray?.length > 0 ? updatedArray?.filter(item => item !== undefined) : []
//     const getNextDays = (currentDays) => {
//       const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//       return currentDays.map(currentDay => {
//         const currentDayIndex = daysOfWeek.indexOf(currentDay);
//         const nextDayIndex = (currentDayIndex + 1) % 7; // Ensure it wraps around to Sunday if needed
//         return daysOfWeek[nextDayIndex];
//       });
//     };

//     let priorityCheck = anstaskUserPanel?.length > 0 ? anstaskUserPanel?.filter((item) => {
//       if (item?.frequency === "Daily" && weekOffShow && holidayShow) {
//         //Shift Basis 
//         if (checkShiftTiming === "Morning" && item?.schedule === "Fixed" && weekOffShow) {
//           return item;

//         }
//         else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed" && weekOffShow) {
//           return item;
//         }
//         //Anytime Basis 
//         else if (item?.schedule === "Any Time" && weekOffShow) {
//           return item;

//         }
//       }
//       if ((item?.frequency === "Day Wise" || item?.frequency === "Weekly" && weekOffShow && holidayShow)) {
//         if (checkShiftTiming === "Morning" && item?.schedule === "Fixed") {
//           return item?.weekdays?.includes(dayOfWeek);

//         }
//         else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed") {
//           const dayOfWeekTomorrow = getNextDays(item?.weekdays);
//           const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
//           const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
//           return item?.weekdays?.includes(dayOfWeek);
//         }
//         //Anytime Basis s
//         else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {
//           const dayOfWeekTomorrow = getNextDays(item?.weekdays);
//           const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
//           const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
//           return item?.weekdays?.includes(dayOfWeek);


//         }
//         else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
//           const dayOfWeekTomorrow = getNextDays(item?.weekdays);
//           const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
//           const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
//           return item?.weekdays?.includes(dayOfWeek);
//         }

//       }
//       if (item?.frequency === "Monthly" || item?.frequency === "Date Wise" && weekOffShow && holidayShow) {
//         //Shift Basis 
//         if (checkShiftTiming === "Morning" && item?.schedule === "Fixed") {
//           const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//           return item?.monthdate == formattedDay;

//         }
//         else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed") {
//           const today = new Date();


//           const tomorrow = new Date(today);
//           tomorrow.setDate(today.getDate() - 1);
//           const tomorrowNight = new Date(tomorrow);
//           if (new Date().getDate() == Number(item?.monthdate)) {
//             return item;

//           } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
//             return item
//           }

//         }
//         //Anytime Basis 
//         else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {
//           const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//           return item?.monthdate == formattedDay;

//         }
//         else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
//           const today = new Date();
//           const tomorrow = new Date(today);
//           tomorrow.setDate(today.getDate() - 1);
//           const tomorrowNight = new Date(tomorrow);
//           if (new Date().getDate() == Number(item?.monthdate)) {
//             return item;

//           } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
//             return item
//           }

//         }
//       }
//       if (item?.frequency === "Annually" && weekOffShow && holidayShow) {
//         //Shift Basis 
//         if (checkShiftTiming === "Morning" && item?.schedule === "Fixed" && weekOffShow) {
//           const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//           const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
//           return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);
//         }
//         else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed" && weekOffShow) {

//           const today = new Date();

//           const tomorrow = new Date(today);
//           tomorrow.setDate(today.getDate() - 1);
//           const tomorrowNight = new Date(tomorrow);

//           if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
//             return item;

//           } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
//             return item
//           }

//         }
//         //Anytime Basis 
//         else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time" && weekOffShow) {
//           const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//           const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
//           return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);

//         }
//         else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time" && weekOffShow) {
//           const today = new Date();

//           const tomorrow = new Date(today);
//           tomorrow.setDate(today.getDate() - 1);
//           const tomorrowNight = new Date(tomorrow);

//           if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
//             return item;

//           } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
//             return item
//           }
//         }
//       }
//     }) : [];


//     let final = priorityCheck.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]);
//     const updatedAns1 = final.map(item => {
//       const matchingItem = res_task_Schedule?.find(ansItem => ansItem._id === item._id);
//       if (matchingItem) {
//         return { ...item, weekdays: matchingItem.weekdays, };
//       }
//       return item;
//     });

//     const existingTasks = await TaskForUser.find({
//       username: isUserRoleAccess?.companyname,
//       taskdetails: "schedule",
//       shiftEndTime: { $gte: new Date() }
//     }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();


//     // Filter updatedAns based on the existingTasks query
//     let unique = updatedAns1?.filter(obj1 =>
//       !existingTasks.some(obj2 =>
//         obj1.category === obj2.category &&
//         obj1.subcategory === obj2.subcategory &&
//         obj1.frequency === obj2.frequency &&
//         obj1.schedule === obj2.schedule
//       )
//     );

//     // Query to fetch non-scheduled tasks
//     let nonscheduledata = await TaskForUser.find({
//       username: isUserRoleAccess.companyname,
//       taskdetails: "nonschedule",
//       taskdate: moment(new Date()).format("YYYY-MM-DD")
//     },).lean();

//     let uniqueElements = unique?.length > 0 ? unique : []
//     const answerUserNonSchedule = nonscheduledata?.length ? nonscheduledata : []

//     let nonschedule = userChecknonschedule?.filter(data => data?.employeenames?.includes(isUserRoleAccess?.companyname) && data?.date === moment(new Date()).format("YYYY-MM-DD"))
//     let result = [];
//     let answer = nonschedule?.length > 0 && nonschedule?.forEach(item => {
//       item?.employeenames?.forEach(username => {
//         let newItem = {
//           category: String(item.category),
//           subcategory: String(item.subcategory),
//           taskdate: String(item.date),
//           tasktime: String(item.time),
//           type: String(item.type),
//           orginalid: item._id,
//           designation: item.designation,
//           schedule: item.schedule,
//           department: item.department,
//           priority: item.priority,
//           company: item.company,
//           branch: item.branch,
//           unit: item.unit,
//           team: item.team,
//           username: username,
//           taskdetails: "nonschedule",
//           duration: String(item.duration),
//           breakupcount: String(item.breakupcount),
//           breakup: item.breakup,
//           required: item.required,
//           taskstatus: "Assigned"
//         };
//         result.push(newItem);
//       });
//     });




//     let uniqueElementsNonSchedule = result?.length > 0 ? result?.filter(obj1 => !answerUserNonSchedule?.some(obj2 =>
//       obj1.category === obj2.category
//       && obj1.subcat === obj2.subcat &&
//       obj2?.taskdate === moment(new Date()).format("YYYY-MM-DD")
//       && obj2.username === isUserRoleAccess?.companyname
//       && obj2?.orginalid == obj1?.orginalid
//       && obj2?.taskdetails === "nonschedule"
//     )) : [];

//     // Split the time range into start and end times
//     const [startTimeStr, endTimeStr] = userShiftDetails?.split('-');

//     // Parse start time
//     const [startHourStr, startMinStr, startTimetype] = startTimeStr ? startTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
//     let startHour = parseInt(startHourStr);
//     const startMin = parseInt(startMinStr);

//     // Parse end time
//     const [endHourStr, endMinStr, endTimetype] = endTimeStr ? endTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
//     let endHour = parseInt(endHourStr);
//     const endMin = parseInt(endMinStr);

//     // Create shift start and end objects
//     const shiftStart = { hour: String(startHour)?.padStart(2, '0'), min: String(startMin).padStart(2, '0'), timetype: startTimetype };
//     const shiftEnd = { hour: String(endHour)?.padStart(2, '0'), min: String(endMin).padStart(2, '0'), timetype: endTimetype };


//     function findClosestElements(FromThis, shiftStart, shiftEnd) {
//       const groupedElements = {};

//       // Group elements by cate and subcate
//       FromThis.forEach(element => {
//         const key = element?.category + '-' + element?.subcategory + '-' + element?.frequency;
//         if (!groupedElements[key]) {
//           groupedElements[key] = [];
//         }
//         groupedElements[key].push(element);
//       });

//       // Filter out elements with the same cate and subcate and find the closest element
//       const closestElements = [];
//       for (const key in groupedElements) {
//         const group = groupedElements[key];
//         let closestTimeDiff = Infinity;
//         let closestElement;
//         group.forEach(element => {
//           const time = element.timetodo[0];

//           const timeString = `${time?.hour}:${time?.min} ${time?.timetype}`;

//           const diff = getTimeDifference(timeString, shiftStart);
//           // checkShiftTiming === "Evening" ? 

//           const maximumCheck = diff >= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

//           const maximumCheckEve = diff <= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

//           if (diff >= 0 && diff < closestTimeDiff && (checkShiftTiming === "Evening" ? (maximumCheck || maximumCheckEve) : diff <= getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart))) {

//             closestTimeDiff = diff;
//             closestElement = element;
//           }
//         });
//         if (closestElement) {
//           closestElements.push(closestElement);
//         } else {
//           closestElements.push([]);
//         }

//       }
//       return closestElements;
//     }

//     function getTimeDifference(time1, time2) {
//       const date1 = new Date('2000-01-01 ' + time1);
//       const date2 = new Date('2000-01-01 ' + time2.hour + ':' + time2.min + ' ' + time2.timetype);
//       const shiftEndTime = new Date('2000-01-01 ' + shiftEnd.hour + ':' + shiftEnd.min + ' ' + shiftEnd.timetype);
//       if (date1 < shiftEndTime && checkShiftTiming === "Evening") {
//         return Math.abs((date1 - date2) / (1000 * 60));
//       } else {
//         return (date1 - date2) / (1000 * 60);
//       }

//     }

//     const closestElements = findClosestElements(uniqueElements?.filter(data => data.schedule !== "Any Time"), shiftStart, shiftEnd);
//     const answerClosest = closestElements?.some(data => Array.isArray(data));
//     const closestFilter = answerClosest ? closestElements?.filter(data => data.length !== 0) : closestElements
//     const removeDuplicates = (dataArray, filterArray) => {
//       return dataArray.filter(item => {
//         const found = filterArray.find(filterItem => (
//           filterItem?.category === item?.category &&
//           filterItem?.subcategory === item?.subcategory &&
//           filterItem?.frequency === item?.frequency &&
//           filterItem?.schedule === item?.schedule &&
//           moment(new Date()).format("DD-MM-YYYY") === filterItem.taskassigneddate
//         ));
//         return !found;
//       });
//     };

//     const tasksList = await taskSorted(isUserRoleAccess.companyname);
//     const RemoveDuplicateClosest = removeDuplicates(closestFilter, tasksList || []);
//     const removedLengthDuplicate = RemoveDuplicateClosest.filter(array => array.length > 0);
//     const answerUnique = uniqueElements?.filter(data => data.schedule !== "Fixed")
//     const filterTimeTodo = [...RemoveDuplicateClosest, ...answerUnique]
//     const uniqueScheduleNonschedule = [...uniqueElementsNonSchedule, ...filterTimeTodo];
//     if (calculatedTime) {
//       const taskGenerateCombine = generateTaskCombine(userDuplicate, filterTimeTodo, calculatedTime, result);
//       if (taskGenerateCombine?.length > 0) {
//         let ataskforuser = await TaskForUser.insertMany(taskGenerateCombine);

//       }
//     }
//     await exports.gettriggeredWhileClockInForTraining(req, res, next);
//   } catch (err) {
//     console.log(err, 'taskforuser-2075')
//     return next(new ErrorHandler("Records not found!", 404));
//   }

// });



// //to get pending task count
// exports.gettriggeredWhileClockInForTraining = catchAsyncErrors(async (req, res, next) => {
//   let trainingdetails;
//   // let username = req.query.username;
//   let { isUserRoleAccess, shifttiming, cin, cout, weekOffShow, holidayShow } = req?.body
//   let userShiftDetails = await fetchUsers(req?.body?.isUserRoleAccess);
//   let calculatedTime = userShiftDetails ? await updateTimeRange(userShiftDetails, cin, cout) : "00:00";
//   let checkShiftTiming = await checkTimeRange(calculatedTime);
//   try {
//     trainingdetails = await TrainingDetails.find({ status: "Active" }, {
//       trainingdetails: 1,
//       category: 1,
//       subcategory: 1,
//       duration: 1,
//       trainingdocuments: 1,
//       estimationtimetraining: 1,
//       estimationtraining: 1,
//       mode: 1,
//       taskassign: 1,
//       required: 1,
//       date: 1,
//       status: 1,
//       questioncount: 1,
//       time: 1,
//       deadlinedate: 1,
//       frequency: 1,
//       schedule: 1,
//       weekdays: 1,
//       typequestion: 1,
//       monthdate: 1,
//       annuday: 1,
//       annumonth: 1,
//       estimationtime: 1,
//       estimation: 1,
//       type: 1,
//       designation: 1,
//       department: 1,
//       company: 1,
//       branch: 1,
//       unit: 1,
//       team: 1,
//       employeenames: 1,
//       isOnlineTest: 1,
//       testnames: 1,
//       timetodo: 1,
//       dueDateCheck: 1
//     }).lean();
//     const res_shift_User = await Shift.find().lean();

//     const shiftUser = res_shift_User?.find(item => item.name === isUserRoleAccess.shifttiming)

//     let taskStatusDep = trainingdetails?.filter(data => {
//       if (data?.type === "Designation") {
//         return data.designation?.includes(isUserRoleAccess?.designation)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//       if (data.type === "Department") {
//         return data.department?.includes(isUserRoleAccess?.department)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))


//       }
//       if (data.type === "Employee") {
//         return data.company?.includes(isUserRoleAccess?.company) && data.branch?.includes(isUserRoleAccess?.branch) && data.unit?.includes(isUserRoleAccess?.unit) && data.team?.includes(isUserRoleAccess?.team)
//           && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
//       }
//     })


//     let userTaskDesignation = taskStatusDep?.length > 0 ? taskStatusDep?.flatMap(data => data.employeenames) : []
//     const DuplicateRemoval = [...new Set(userTaskDesignation)]
//     const userDuplicate = DuplicateRemoval?.includes("ALL") ? [isUserRoleAccess?.companyname] : DuplicateRemoval?.filter(data => data === isUserRoleAccess?.companyname)

//     const frequencyOrder = {
//       Daily: 1,
//       "Date wise": 2,
//       "Day wise": 3,
//       Weekly: 4,
//       Monthly: 5,
//       Annually: 6,
//     };
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);
//     const tomorrowNight = new Date(today);
//     tomorrowNight.setDate(today.getDate() + 1);
//     // const dayOfWeekTomorrow = tomorrow.toLocaleString('en-US', { weekday: 'long' });
//     const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
//     const currentDay = today.getDate();
//     const dayOfMonth = today.getMonth() + 1;

//     // Convert shift start and end times to 24-hour format
//     tomorrowNight.setHours(shiftUser?.totime === 'AM' ? shiftUser?.tohour : Number(shiftUser?.tohour) + 12, shiftUser?.tomin, 0, 0);

//     function addEstimationToDate(userDOJ, estimation) {
//       // Split estimation into value and unit
//       const [value, unit] = estimation.split("-");

//       // Parse the value as a number
//       const intValue = parseInt(value);

//       // Create a new Date object based on user's date of joining
//       const newUserDOJ = new Date(userDOJ);

//       // Add the specified duration
//       if (unit === "Month") {
//         newUserDOJ.setMonth(newUserDOJ.getMonth() + intValue);
//       } else if (unit === "Year") {
//         newUserDOJ.setFullYear(newUserDOJ.getFullYear() + intValue);
//       } else if (unit === "Days") {
//         newUserDOJ.setDate(newUserDOJ.getDate() + intValue);
//       }

//       return newUserDOJ;
//     }

//     const updatedArray = taskStatusDep?.length > 0 ? taskStatusDep.map(item2 => {
//       const matchingItem = taskStatusDep.find(item1 => {
//         if (item1?.type === "Designation") {
//           return item1?.designation?.includes(isUserRoleAccess?.designation) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL'))
//         }
//         if (item1?.type === "Department") {
//           return item1?.department?.includes(isUserRoleAccess?.department) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL'))
//         }
//         if (item1?.type === "Employee") {
//           return item1?.company?.includes(isUserRoleAccess?.company)
//             && item1?.branch?.includes(isUserRoleAccess?.branch) &&
//             item1?.unit?.includes(isUserRoleAccess?.unit) &&
//             item1?.team?.includes(isUserRoleAccess?.team) &&
//             (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL'))
//         }
//       })

//       if (matchingItem) {
//         const newDate = addEstimationToDate(isUserRoleAccess?.doj, `${item2.estimationtime}-${item2.estimation}`);
//         return { ...item2, dueDateCheck: new Date() >= newDate, dueFromdate: newDate.toDateString() };
//       }
//     }) : [];

//     let anstaskUserPanel = updatedArray?.length > 0 ? updatedArray?.filter(item => item !== undefined) : []

//     const getNextDays = (currentDays) => {
//       const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//       return currentDays.map(currentDay => {
//         const currentDayIndex = daysOfWeek.indexOf(currentDay);
//         const nextDayIndex = (currentDayIndex + 1) % 7; // Ensure it wraps around to Sunday if needed
//         return daysOfWeek[nextDayIndex];
//       });
//     };

//     let priorityCheck = anstaskUserPanel?.length > 0 ? anstaskUserPanel?.filter((item) => {
//       if (item?.required === "Mandatory" && item.dueDateCheck && weekOffShow && holidayShow && item.status === "Active") {
//         if (item?.frequency === "Daily" && weekOffShow && holidayShow) {
//           //Shift Basis 
//           if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based" && weekOffShow) {
//             return item;

//           }
//           else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based" && weekOffShow) {
//             return item;
//           }
//           //Anytime Basis 
//           else if (item?.schedule === "Any Time" && weekOffShow) {
//             return item;

//           }
//         }
//         if ((item?.frequency === "Day Wise" || item?.frequency === "Weekly" && weekOffShow && holidayShow)) {
//           if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based") {

//             return item?.weekdays?.includes(dayOfWeek);


//           }
//           else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based") {
//             const dayOfWeekTomorrow = getNextDays(item?.weekdays);
//             const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
//             const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
//             return item?.weekdays?.includes(dayOfWeek);
//           }
//           //Anytime Basis s
//           else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {

//             return item?.weekdays?.includes(dayOfWeek);


//           }
//           else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
//             const dayOfWeekTomorrow = getNextDays(item?.weekdays);
//             const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
//             const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
//             return item?.weekdays?.includes(dayOfWeek);
//           }

//         }
//         if (item?.frequency === "Monthly" || item?.frequency === "Date Wise" && weekOffShow && holidayShow) {
//           //Shift Basis 
//           if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based") {
//             const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//             return item?.monthdate == formattedDay;

//           }
//           else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based") {
//             const today = new Date();


//             const tomorrow = new Date(today);
//             tomorrow.setDate(today.getDate() - 1);
//             const tomorrowNight = new Date(tomorrow);
//             if (new Date().getDate() == Number(item?.monthdate)) {
//               return item;

//             } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
//               return item
//             }

//           }
//           //Anytime Basis 
//           else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {
//             const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//             return item?.monthdate == formattedDay;

//           }
//           else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
//             const today = new Date();
//             const tomorrow = new Date(today);
//             tomorrow.setDate(today.getDate() - 1);
//             const tomorrowNight = new Date(tomorrow);
//             if (new Date().getDate() == Number(item?.monthdate)) {
//               return item;

//             } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
//               return item
//             }

//           }
//         }
//         if (item?.frequency === "Annually" && weekOffShow && holidayShow) {
//           //Shift Basis 
//           if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based" && weekOffShow) {
//             const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//             const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
//             return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);
//           }
//           else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based" && weekOffShow) {

//             const today = new Date();

//             const tomorrow = new Date(today);
//             tomorrow.setDate(today.getDate() - 1);
//             const tomorrowNight = new Date(tomorrow);

//             if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
//               return item;

//             } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
//               return item
//             }

//           }
//           //Anytime Basis 
//           else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time" && weekOffShow) {
//             const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
//             const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
//             return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);

//           }
//           else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time" && weekOffShow) {
//             const today = new Date();

//             const tomorrow = new Date(today);
//             tomorrow.setDate(today.getDate() - 1);
//             const tomorrowNight = new Date(tomorrow);

//             if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
//               return item;

//             } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
//               return item
//             }
//           }
//         }
//       } if (item?.required === "NonSchedule" && weekOffShow && holidayShow && item.status === "Active") {
//         const NonSchedule = new Date();
//         const locateDateDead = new Date(item.deadlinedate);

//         return NonSchedule <= locateDateDead
//       }
//       if (item?.required === "Schedule" && weekOffShow && holidayShow && item.status === "Active") {
//         const todayDateCheck = moment(new Date()).format("DD-MM-YYYY");
//         const locateDate = moment(new Date(item.date)).format("DD-MM-YYYY");
//         return todayDateCheck === locateDate

//       }


//     }) : [];
//     let final = priorityCheck.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]);


//     const updatedAns1 = final.map(item => {
//       const matchingItem = trainingdetails?.find(ansItem => ansItem._id === item._id);
//       if (matchingItem) {
//         return { ...item, weekdays: matchingItem.weekdays, };
//       }
//       return item;
//     });

//     const existingTasks = await TrainingForUser.find({
//       username: isUserRoleAccess?.companyname,
//       shiftEndTime: { $gte: new Date() }
//     }).lean();


//     const existingTasksFinal = await TrainingForUser.find({
//       username: isUserRoleAccess?.companyname,
//       status: "Active",
//       shiftEndTime: { $gte: new Date() }
//     })?.lean();


//     // Filter updatedAns1 based on the existingTasks query
//     let unique = updatedAns1?.filter(obj1 => {
//       return obj1.required === "Mandatory" ? !existingTasks?.some(obj2 =>
//         obj2.required?.includes(obj1.required)
//         && obj1.frequency === obj2.frequency
//         && obj1.schedule === obj2.schedule
//         && obj1.trainingdetails === obj2.trainingdetails
//         && new Date() <= new Date(obj2.shiftEndTime) && obj2?.taskdetails === "Mandatory")
//         :
//         !existingTasks?.some(obj2 =>
//           obj1.trainingdetails === obj2.trainingdetails
//           &&
//           obj2.required?.includes(obj1.required)
//           && new Date() <= new Date(obj2.shiftEndTime))
//     }
//     );


//     let userStatus = final?.length > 0 ? final?.filter(item2 => {
//       const matchingItem = existingTasksFinal?.find(data1 =>
//         ["Completed", "Finished By Others", "Not Applicable to Me"]?.includes(data1?.taskstatus))

//       if (matchingItem?.orginalid !== item2._id) {
//         return item2; // Include this item in the filtered array
//       }
//     }) : [];

//     let uniqueElements = unique?.length > 0 ? unique : []
//     // Split the time range into start and end times
//     const [startTimeStr, endTimeStr] = userShiftDetails?.split('-');
//     // Parse start time
//     const [startHourStr, startMinStr, startTimetype] = startTimeStr ? startTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
//     let startHour = parseInt(startHourStr);
//     const startMin = parseInt(startMinStr);

//     // Parse end time
//     const [endHourStr, endMinStr, endTimetype] = endTimeStr ? endTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
//     let endHour = parseInt(endHourStr);
//     const endMin = parseInt(endMinStr);

//     // Create shift start and end objects
//     const shiftStart = { hour: String(startHour)?.padStart(2, '0'), min: String(startMin).padStart(2, '0'), timetype: startTimetype };
//     const shiftEnd = { hour: String(endHour)?.padStart(2, '0'), min: String(endMin).padStart(2, '0'), timetype: endTimetype };


//     function findClosestElements(FromThis, shiftStart, shiftEnd) {
//       const groupedElements = {};

//       // Group elements by cate and subcate
//       FromThis.forEach(element => {
//         const key = element?.category + '-' + element?.subcategory + '-' + element?.frequency;
//         if (!groupedElements[key]) {
//           groupedElements[key] = [];
//         }
//         groupedElements[key].push(element);
//       });

//       // Filter out elements with the same cate and subcate and find the closest element
//       const closestElements = [];
//       for (const key in groupedElements) {
//         const group = groupedElements[key];
//         let closestTimeDiff = Infinity;
//         let closestElement;
//         group.forEach(element => {
//           const time = element.timetodo[0];

//           const timeString = `${time?.hour}:${time?.min} ${time?.timetype}`;

//           const diff = getTimeDifference(timeString, shiftStart);
//           // checkShiftTiming === "Evening" ? 

//           const maximumCheck = diff >= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

//           const maximumCheckEve = diff <= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

//           if (diff >= 0 && diff < closestTimeDiff && (checkShiftTiming === "Evening" ? (maximumCheck || maximumCheckEve) : diff <= getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart))) {

//             closestTimeDiff = diff;
//             closestElement = element;
//           }
//         });
//         if (closestElement) {
//           closestElements.push(closestElement);
//         } else {
//           closestElements.push([]);
//         }

//       }
//       return closestElements;
//     }

//     function getTimeDifference(time1, time2) {
//       const date1 = new Date('2000-01-01 ' + time1);
//       const date2 = new Date('2000-01-01 ' + time2.hour + ':' + time2.min + ' ' + time2.timetype);
//       const shiftEndTime = new Date('2000-01-01 ' + shiftEnd.hour + ':' + shiftEnd.min + ' ' + shiftEnd.timetype);
//       if (date1 < shiftEndTime && checkShiftTiming === "Evening") {
//         return Math.abs((date1 - date2) / (1000 * 60));
//       } else {
//         return (date1 - date2) / (1000 * 60);
//       }

//     }

//     const closestElements = findClosestElements(uniqueElements?.filter(data => data.schedule !== "Any Time"), shiftStart, shiftEnd);
//     const answerClosest = closestElements?.some(data => Array.isArray(data));
//     const closestFilter = answerClosest ? closestElements?.filter(data => data.length !== 0) : closestElements
//     const removeDuplicates = (dataArray, filterArray) => {
//       return dataArray.filter(item => {
//         const found = filterArray.find(filterItem => (
//           filterItem?.required.includes(item?.required) &&
//           filterItem?.trainingdetails === item?.trainingdetails &&
//           filterItem?.frequency === item?.frequency &&
//           filterItem?.schedule === item?.schedule &&
//           moment(new Date()).format("DD-MM-YYYY") === filterItem.taskassigneddate
//         ));
//         return !found;
//       });
//     };

//     const trainingList = await trainingSorterd(isUserRoleAccess.companyname);
//     const RemoveDuplicateClosest = removeDuplicates(closestFilter, trainingList || []);
//     const removedLengthDuplicate = RemoveDuplicateClosest.filter(array => array.length > 0);
//     const answerUnique = uniqueElements?.filter(data => data.schedule !== "Time-Based")
//     const filterTimeTodo = [...RemoveDuplicateClosest, ...answerUnique]
//     if (calculatedTime) {
//       const trainingGenerateCombine = generateTrainingCombine(userDuplicate, filterTimeTodo, calculatedTime);
//       if (trainingGenerateCombine?.length > 0) {
//         let ataskforuser = await TrainingForUser.insertMany(trainingGenerateCombine);

//       }
//     }
//     return res.status(200).json({
//       count: 'executed'
//     });
//   } catch (err) {
//     console.log(err?.message, 'taskforuser-1718')
//     return next(new ErrorHandler("Records not found!", 404));
//   }

// });


// const generateTaskCombine = (userPostCall, CheckExtraTasksSchedule, calculatedTime, result) => {
//   let ans = [];
//   let ansnonschedule = [];
//   const split = calculatedTime?.split("-")
//   const shiftEndTime = addFutureTimeToCurrentTime(split[1])
//   const parsedDate = new Date(shiftEndTime);
//   // Convert to ISO 8601 format
//   const isoDate = parsedDate.toISOString();
//   userPostCall.forEach((employeeName) => {
//     CheckExtraTasksSchedule.forEach((category) => {
//       ans.push({
//         category: category.category,
//         username: employeeName,
//         subcategory: category.subcategory,
//         priority: category.priority,
//         timetodo: category?.timetodo?.length > 0 ? category?.timetodo : [],
//         monthdate: category?.timetodo ? category.monthdate : "",
//         weekdays: category?.weekdays?.length > 0 ? category?.weekdays : [],
//         annumonth: category.annuday ? category.annuday : "",
//         annuday: category.annumonth ? category.annumonth : "",
//         schedule: String(category.schedule),
//         frequency: String(category.frequency),
//         duration: String(category.duration),
//         taskassign: String(category.taskassign),
//         assignId: String(category.assignId),
//         breakupcount: String(category.breakupcount),
//         breakup: category?.breakup,
//         required: category?.required,
//         description: category?.description ? category?.description : "",
//         documentfiles: category?.documentfiles ? category?.documentfiles : "",
//         orginalid: category?._id ? category?._id : category?.orginalid,
//         taskstatus: "Assigned",
//         created: new Date().toISOString(),
//         shiftEndTime: isoDate,
//         taskdetails: "schedule",
//         taskassigneddate: moment(new Date()).format("DD-MM-YYYY"),
//         formattedDate: new Date(),

//       });
//     });
//   });


//   result.forEach((data) => {
//     ansnonschedule.push({
//       category: String(data.category),
//       subcategory: String(data.subcategory),
//       username: data?.username,
//       frequency: "",
//       description: "",
//       duration: String(data.duration),
//       orginalid: data.orginalid,
//       taskdate: moment(data?.taskdate).format("YYYY-MM-DD"),
//       tasktime: String(data.tasktime),
//       breakupcount: String(data.breakupcount),
//       breakup: data?.breakup,
//       schedule: String(data.schedule),
//       required: data?.required,
//       priority: String(data.priority),
//       taskstatus: "Assigned",
//       created: new Date().toISOString(),
//       shiftEndTime: isoDate,
//       taskdetails: data?.taskdetails,
//       taskassigneddate: moment(new Date()).format("DD-MM-YYYY")

//     });
//   });

//   return [...ans, ...ansnonschedule];
// }
// const generateTrainingCombine = (userPostCall, CheckExtraTasksSchedule, calculatedTime) => {
//   let ans = [];
//   let ansnonschedule = [];
//   const split = calculatedTime?.split("-")
//   const shiftEndTime = addFutureTimeToCurrentTime(split[1])
//   const parsedDate = new Date(shiftEndTime);
//   // Convert to ISO 8601 format
//   const isoDate = parsedDate.toISOString();
//   userPostCall.forEach((employeeName) => {
//     CheckExtraTasksSchedule.forEach((category) => {
//       ans.push({
//         category: category.category,
//         trainingdetails: category.trainingdetails,
//         username: employeeName,
//         subcategory: category.subcategory,
//         trainingdocuments: category.trainingdocuments,
//         estimationtimetraining: category.estimationtimetraining,
//         estimationtraining: category.estimationtraining,
//         estimationtime: category.estimationtime,
//         estimation: category.estimation,
//         taskassign: String(category.taskassign),
//         assignId: String(category._id),
//         documentslist: category.documentslist,
//         timetodo: category?.timetodo?.length > 0 ? category?.timetodo : [],
//         monthdate: category?.timetodo ? category.monthdate : "",
//         weekdays: category?.weekdays?.length > 0 ? category?.weekdays : [],
//         annumonth: category.annuday ? category.annuday : "",
//         annuday: category.annumonth ? category.annumonth : "",
//         schedule: String(category.schedule),
//         isOnlineTest: String(category.isOnlineTest),
//         testnames: String(category.testnames),
//         dueDateCheck: category.dueDateCheck ? category.dueDateCheck : "",
//         mode: category.mode ? category.mode : "",
//         questioncount: category.questioncount ? category.questioncount : "",
//         typequestion: category.typequestion ? category.typequestion : "",
//         dueFromdate: category.dueFromdate ? category.dueFromdate : "",
//         frequency: String(category.frequency) ? category?.frequency : "",
//         duration: String(category.duration) ? category?.duration : "",
//         required: category?.required ? category?.required : [],
//         documentfiles: category?.documentfiles ? category?.documentfiles : "",
//         orginalid: category?._id ? category?._id : category?.orginalid,
//         taskstatus: "Assigned",
//         typeofpage: "Training",
//         created: new Date().toISOString(),
//         shiftEndTime: isoDate,
//         taskassigneddate: moment(new Date()).format("DD-MM-YYYY"),
//         formattedDate: new Date(),
//         endtraining: category?.endtraining ? category?.endtraining : "",
//         taskdetails: category?.required,
//       });
//     });
//   });


//   return ans;
// }


// const convertTo24HourFormat = (time) => {
//   let [hours, minutes] = time?.slice(0, -2).split(":");
//   hours = parseInt(hours, 10);
//   if (time.slice(-2) === "PM" && hours !== 12) {
//     hours += 12;
//   }
//   return `${String(hours).padStart(2, "0")}:${minutes}`;
// };


// const fetchUsers = async (isUserRoleAccess) => {

//   try {
//     const newcurrentTime = new Date();
//     const currentHour = newcurrentTime.getHours();
//     const currentMinute = newcurrentTime.getMinutes();
//     const period = currentHour >= 12 ? 'PM' : 'AM';
//     const mainShiftTiming = isUserRoleAccess?.mainshifttiming?.split('-');
//     const secondShiftTiming = isUserRoleAccess?.issecondshift ? isUserRoleAccess?.secondshifttiming?.split('-') : "";
//     const secondShiftStart = isUserRoleAccess?.issecondshift ? secondShiftTiming[0]?.split(':') : "";
//     const secondShiftEnd = isUserRoleAccess?.issecondshift ? secondShiftTiming[1].split(':') : "";
//     const secondShiftStartHour = isUserRoleAccess?.issecondshift ? parseInt(convertTo24HourFormat(secondShiftTiming[0]), 10) : "";
//     const secondShiftStartMinute = isUserRoleAccess?.issecondshift ? parseInt(secondShiftStart[1]?.slice(0, 2), 10) : "";
//     const secondShiftStartPeriod = isUserRoleAccess?.issecondshift ? secondShiftStart[1]?.slice(2) : "";

//     const secondShiftEndHour = isUserRoleAccess?.issecondshift ? parseInt(convertTo24HourFormat(secondShiftTiming[1]), 10) : "";
//     const secondShiftEndMinute = isUserRoleAccess?.issecondshift ? parseInt(secondShiftEnd[1]?.slice(0, 2), 10) : "";
//     const secondShiftEndPeriod = isUserRoleAccess?.issecondshift ? secondShiftEnd[1]?.slice(2) : "";

//     const isInSecondShift =
//       ((currentHour > secondShiftStartHour || (currentHour === secondShiftStartHour && currentMinute >= secondShiftStartMinute)) &&
//         (currentHour < secondShiftEndHour || (currentHour === secondShiftEndHour && currentMinute <= secondShiftEndMinute))) &&
//       period === secondShiftStartPeriod;

//     const isNtgInSecondShift =
//       ((currentHour > secondShiftStartHour || (currentHour === secondShiftStartHour && currentMinute >= secondShiftStartMinute))) &&
//       period === secondShiftStartPeriod;

//     if (mainShiftTiming[0]?.includes("PM") && mainShiftTiming[1]?.includes("AM")) {
//       if (isUserRoleAccess?.issecondshift && isInSecondShift) {

//         const regularshift = isUserRoleAccess?.secondshifttiming;
//         return regularshift;
//       } else {
//         const regularshift = isUserRoleAccess?.mainshifttiming;
//         return regularshift
//       }
//     } else {
//       if (isUserRoleAccess?.issecondshift && isInSecondShift) {
//         const regularshift = isUserRoleAccess?.secondshifttiming;
//         return regularshift
//       } else {

//         const regularshift = isUserRoleAccess?.mainshifttiming;
//         return regularshift
//       }
//     }
//   }
//   catch (err) {
//     console.log(err?.message, 'err - 1824')
//   }
// }

// const updateTimeRange = async (e, cin, cout) => {

//   try {
//     const [startTimes, endTimes] = e.split("-");
//     // Convert start time to 24-hour format
//     const convertedStartTime = await convertTo24HourFormat(startTimes);
//     // Convert end time to 24-hour format
//     const convertedEndTime = await convertTo24HourFormat(endTimes);
//     const start = convertedStartTime;
//     const end = convertedEndTime;
//     // Convert start time to 24-hour format
//     let [startHour, startMinute] = start?.slice(0, -2).split(":");

//     startHour = parseInt(startHour, 10);

//     // Convert end time to 24-hour format
//     let [endHour, endMinute] = end?.slice(0, -2).split(":");
//     endHour = parseInt(endHour, 10);
//     // Add hours from startTime and endTime
//     startHour -= cin ? Number(cin) : 0;
//     endHour += cout ? Number(cout) : 0;

//     // Format the new start and end times
//     const newStart = `${String(startHour).padStart(
//       2,
//       "0"
//     )}:${startMinute}${start.slice(-2)}`;

//     const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end.slice(
//       -2
//     )}`;

//     return `${newStart} - ${newEnd}`;
//   } catch (err) {
//     console.log(err?.message, 'err')
//   }
// };

// function addFutureTimeToCurrentTime(futureTime) {
//   // Parse the future time string into hours and minutes
//   const [futureHours, futureMinutes] = futureTime.split(":").map(Number);

//   // Get the current time
//   const currentTime = new Date();

//   // Get the current date
//   const currentDate = currentTime.getDate();

//   // Get the current hours and minutes
//   const currentHours = currentTime.getHours();
//   const currentMinutes = currentTime.getMinutes();

//   // Calculate the time difference
//   let timeDifferenceHours = futureHours - currentHours;
//   let timeDifferenceMinutes = futureMinutes - currentMinutes;

//   // Adjust for negative time difference
//   if (timeDifferenceMinutes < 0) {
//     timeDifferenceHours--;
//     timeDifferenceMinutes += 60;
//   }

//   // Check if the future time falls on the next day
//   if (timeDifferenceHours < 0) {
//     // Add 1 day to the current date
//     currentTime.setDate(currentDate + 1);
//     timeDifferenceHours += 24;
//   }

//   // Create a new Date object by adding the time difference to the current time
//   const newDate = new Date();
//   newDate.setHours(newDate.getHours() + timeDifferenceHours);
//   newDate.setMinutes(newDate.getMinutes() + timeDifferenceMinutes);

//   return newDate;
// }


// const checkTimeRange = async (e) => {
//   try {


//     // Get current time
//     const currentTime = new Date();
//     const currentHour = currentTime.getHours();
//     const currentMinute = currentTime.getMinutes();
//     const [startTime, endTime] = e.split(" - ");

//     // Parse start time
//     const [startHour, startMinute] = startTime.split(":").map(Number);

//     // Parse end time
//     const [endHour, endMinute] = endTime.split(":").map(Number);

//     if (
//       startHour < endHour ||
//       (startHour === endHour && startMinute <= endMinute)
//     ) {
//       // Shift falls within the same day Shift
//       if (
//         (currentHour > startHour ||
//           (currentHour === startHour && currentMinute >= startMinute)) &&
//         (currentHour < endHour ||
//           (currentHour === endHour && currentMinute <= endMinute))
//       ) {
//         return "Morning"
//       } else {
//         return "Morning False"
//       }
//     }
//     //Night Shift
//     else {
//       if (
//         currentHour > startHour ||
//         (currentHour === startHour && currentMinute >= startMinute) ||
//         currentHour < endHour ||
//         (currentHour === endHour && currentMinute <= endMinute)
//       ) {
//         return "Evening"
//       } else {
//         return "Evening False"
//       }
//     }
//   }
//   catch (err) {
//     console.log(err.message)
//   }
// };




// // update TaskForUser by id => /api/taskforuser/:id
// exports.updateMulterTaskForUser = [
//   upload.single('file'), // Accept a single file with the field name 'file'
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const id = req.params.id;

//       // File info
//       const document = req.file
//         ? {
//           name: req.file.filename,
//           path: req.file.path,
//           size: req.file.size,
//         }
//         : null;
//       const index = parseInt(req.body.index);

//       // Parse the incoming tableFormat (an array of tasks)
//       let parsedTableFormat = [];
//       if (req.body.tableFormat) {
//         try {
//           parsedTableFormat = JSON.parse(req.body.tableFormat);
//         } catch (error) {
//           return res.status(400).json({ message: "Invalid tableFormat JSON" });
//         }
//       }

//       const taskDoc = await TaskForUser.findById(id);
//       if (!taskDoc) {
//         return next(new ErrorHandler("Data not found!", 404));
//       }

//       // Ensure tableFormat is initialized
//       if (!Array.isArray(taskDoc.tableFormat)) {
//         taskDoc.tableFormat = [];
//       }

//       if (taskDoc.tableFormat.length === 0) {
//         // Add files to the object at the specified index in parsedTableFormat
//         if (parsedTableFormat[index]) {
//           parsedTableFormat[index].files = document || [];
//         }

//         // Push the whole array to taskDoc.tableFormat
//         taskDoc.tableFormat = [...parsedTableFormat];
//       } else {
//         // If data exists, just update files at that index
//         if (taskDoc.tableFormat[index]) {
//           taskDoc.tableFormat[index].files = document || [];
//           taskDoc.tableFormat[index].reason = parsedTableFormat[index].reason || "";
//           taskDoc.tableFormat[index].status = parsedTableFormat[index].status || "";
//         } else {
//           return res.status(400).json({ message: `No entry found at index ${index} in existing tableFormat` });
//         }
//       }

//       // Save the updated task
//       await taskDoc.save();

//       return res.status(200).json({
//         message: "Updated successfully",
//         data: taskDoc,
//       });

//     } catch (err) {
//       console.log(err, 'rr')
//       return next(new ErrorHandler("Error updating document!", 500));
//     }
//   }),
// ];




// exports.getAllTaskHierarchySummaryReports = catchAsyncErrors(
//   async (req, res, next) => {
//     let
//       result,
//       user,
//       result1,
//       ans1D,
//       i = 1,
//       result2,
//       result3,
//       result4,
//       result5,
//       result6,
//       dataCheck,
//       userFilter,
//       excelmapdata,
//       excelmapdataresperson,
//       hierarchyFilter,
//       excels,
//       answerDef,
//       hierarchyFinal,
//       hierarchy,
//       hierarchyDefault,
//       hierarchyDefList,
//       resultAccessFilter,
//       branch,
//       hierarchySecond,
//       overallMyallList,
//       hierarchyMap,
//       resulted = [],
//       resultedTeam = [],
//       resultAccessFiltered = [],
//       reportingusers,
//       myallTotalNames;


//     const { listpageaccessmode } = req.body;

//     let uniqueElements, nonscheduledata;
//     try {
//       const fromDate = moment(req.body.fromdate, "DD-MM-YYYY").toDate();
//       const toDate = moment(req.body.todate, "DD-MM-YYYY").toDate();
//       let levelFinal = req.body?.sector === "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body?.sector]
//       let answer = await Hirerarchi.aggregate([
//         {
//           $match: {
//             supervisorchoose:
//               req?.body?.username, // Match supervisorchoose with username
//             level: { $in: levelFinal } // Corrected unmatched quotation mark
//           }
//         },
//         {
//           $lookup: {
//             from: "reportingheaders",
//             let: {
//               teamControlsArray: {
//                 $ifNull: ["$pagecontrols", []]
//               }
//             },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       {
//                         $in: [
//                           "$name",
//                           "$$teamControlsArray"
//                         ]
//                       }, // Check if 'name' is in 'teamcontrols' array
//                       {
//                         $in: [
//                           req?.body?.pagename,
//                           "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
//                         ]
//                       } // Additional condition for reportingnew array
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: "reportData" // The resulting matched documents will be in this field
//           }
//         },
//         {
//           $project: {
//             supervisorchoose: 1,
//             employeename: 1,
//             reportData: 1
//           }
//         }
//       ]);
//       let restrictList = answer?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)

//       // result = await User.find(
//       //   {
//       //     enquirystatus: {
//       //       $nin: ["Enquiry Purpose"],
//       //     },
//       //     resonablestatus: {
//       //       $nin: [
//       //         "Not Joined",
//       //         "Postponed",
//       //         "Rejected",
//       //         "Closed",
//       //         "Releave Employee",
//       //         "Absconded",
//       //         "Hold",
//       //         "Terminate",
//       //       ],
//       //     },
//       //     ...(listpageaccessmode === "Reporting to Based"
//       //       ? { reportingto: req.body.username }
//       //       : {}),
//       //   },
//       //   {
//       //     empcode: 1,
//       //     companyname: 1,
//       //     username: 1,
//       //     branch: 1,
//       //     unit: 1,
//       //     designation: 1,
//       //     team: 1,
//       //     department: 1,
//       //     company: 1,
//       //     extratime: 1,
//       //     extrastatus: 1,
//       //     extradate: 1,
//       //     loginUserStatus: 1, workstation: 1, workstationshortname: 1, workstationinput: 1,
//       //   }
//       // );
//       const from = moment.tz(req.body.fromdate, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day').toDate();
//       const to = moment.tz(req.body.todate, 'YYYY-MM-DD', 'Asia/Kolkata').endOf('day').toDate();
//       console.log(from, to)


//       if (listpageaccessmode === "Reporting to Based") {
//         reportingusers = await User.find(
//           {
//             enquirystatus: {
//               $nin: ["Enquiry Purpose"],
//             },
//             resonablestatus: {
//               $nin: [
//                 "Not Joined",
//                 "Postponed",
//                 "Rejected",
//                 "Closed",
//                 "Releave Employee",
//                 "Absconded",
//                 "Hold",
//                 "Terminate",
//               ],
//             },
//             reportingto: req.body.username,
//           },
//           {
//             empcode: 1,
//             companyname: 1,
//           }
//         ).lean();
//         const companyNames = reportingusers.map((user) => user.companyname);
//         result = await TaskForUser.aggregate([
//           {
//             $match: {
//               username: { $in: companyNames }, // Ensure `companyNames` is defined and an array
//               formattedDate: {
//                 $gte: from,
//                 $lte: to,
//               },
//             },
//           },
//           {
//             $project: {
//               category: 1,
//               subcategory: 1,
//               frequency: 1,
//               schedule: 1,
//               username: 1,
//               date: 1,
//               shiftEndTime: 1,
//               taskdetails: 1,
//               timetodo: 1,
//               description: 1,
//               taskstatus: 1,
//               taskassigneddate: 1,
//               taskdate: 1,
//               taskassign: 1,
//               breakup: 1,
//               assignId: 1,
//               monthdate: 1,
//               weekdays: 1,
//               annumonth: 1,
//               required: 1,
//               duration: 1,
//               priority: 1,
//             },
//           },
//         ]);
//       } else {
//         result = await TaskForUser.aggregate([
//           {
//             $match: {
//               formattedDate: {
//                 $gte: from,
//                 $lte: to,
//               },
//             },
//           },
//           {
//             $project: {
//               category: 1,
//               subcategory: 1,
//               frequency: 1,
//               schedule: 1,
//               username: 1,
//               date: 1,
//               shiftEndTime: 1,
//               taskdetails: 1,
//               timetodo: 1,
//               description: 1,
//               taskstatus: 1,
//               taskassigneddate: 1, timetodo: 1,
//               taskdate: 1,
//               taskassign: 1,
//               breakup: 1,
//               assignId: 1,
//               monthdate: 1,
//               weekdays: 1,
//               annumonth: 1,
//               required: 1,
//               duration: 1,
//               priority: 1
//             },
//           },
//         ]);

//       }




//       console.log(result?.length, 'result')
//       // Accordig to sector and list filter process
//       hierarchyFilter = await Hirerarchi.find({ level: req.body.sector });
//       userFilter = hierarchyFilter
//         .filter((data) => data.supervisorchoose.includes(req.body.username))
//         .map((data) => data.employeename);
//       hierarchyDefList = await Hirerarchi.find();
//       user = await User.find({ companyname: req.body.username }, { designation: 1 });
//       const userFilt = user.length > 0 && user[0].designation;
//       const desiGroup = await Designation.find();
//       let HierarchyFilt =
//         req.body.sector === "all"
//           ? hierarchyDefList
//             .filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             .map((data) => data.designationgroup)
//           : hierarchyFilter
//             .filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             .map((data) => data.designationgroup);
//       const DesifFilter = desiGroup.filter((data) =>
//         HierarchyFilt.includes(data.group)
//       );
//       const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
//       const SameDesigUser = HierarchyFilt.includes("All")
//         ? true
//         : userFilt === desigName;
//       //Default Loading of List
//       answerDef = hierarchyDefList
//         .filter((data) => data.supervisorchoose.includes(req.body.username))
//         .map((data) => data.employeename);

//       hierarchyFinal =
//         req.body.sector === "all"
//           ? answerDef.length > 0
//             ? [].concat(...answerDef)
//             : []
//           : hierarchyFilter.length > 0
//             ? [].concat(...userFilter)
//             : [];

//       hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];
//       //solo
//       ans1D =
//         req.body.sector === "all"
//           ? answerDef.length > 0
//             ? hierarchyDefList.filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             : []
//           : hierarchyFilter.length > 0
//             ? hierarchyFilter.filter((data) =>
//               data.supervisorchoose.includes(req.body.username)
//             )
//             : [];

//       result1 =
//         ans1D.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = ans1D.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];

//       resulted = result1;

//       //team
//       let branches = [];
//       hierarchySecond = await Hirerarchi.find();

//       const subBranch =
//         hierarchySecond.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) =>
//                 hierarchyMap.includes(name)
//               )
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";

//       const answerFilterExcel =
//         hierarchySecond.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => hierarchyMap.includes(name))
//           )
//           : [];

//       result2 =
//         answerFilterExcel.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...subBranch);

//       const ans =
//         subBranch.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => subBranch.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";
//       const answerFilterExcel2 =
//         subBranch.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => subBranch.includes(name))
//           )
//           : [];

//       result3 =
//         answerFilterExcel2.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel2.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...ans);

//       const loop3 =
//         ans.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => ans.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";

//       const answerFilterExcel3 =
//         ans.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => ans.includes(name))
//           )
//           : [];

//       result4 =
//         answerFilterExcel3.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel3?.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...loop3);

//       const loop4 =
//         loop3.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => loop3.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : [];
//       const answerFilterExcel4 =
//         loop3.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => loop3.includes(name))
//           )
//           : [];
//       result5 =
//         answerFilterExcel4.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel4?.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...loop4);

//       const loop5 =
//         loop4.length > 0
//           ? hierarchySecond
//             .filter((item) =>
//               item.supervisorchoose.some((name) => loop4.includes(name))
//             )
//             .map((item) => item.employeename)
//             .flat()
//           : "";
//       const answerFilterExcel5 =
//         loop4.length > 0
//           ? hierarchySecond.filter((item) =>
//             item.supervisorchoose.some((name) => loop4.includes(name))
//           )
//           : [];
//       result6 =
//         answerFilterExcel5.length > 0
//           ? result
//             .map((item1) => {
//               const matchingItem2 = answerFilterExcel5?.find((item2) =>
//                 item2.employeename.includes(item1.username)
//               );
//               if (matchingItem2) {
//                 // If a match is found, inject the control property into the corresponding item in an1
//                 return item1;
//               }
//             })
//             .filter((item) => item !== undefined)
//           : [];
//       branches.push(...loop5);

//       resultedTeam = [
//         ...result2,
//         ...result3,
//         ...result4,
//         ...result5,
//         ...result6,
//       ];
//       //overall Teams List
//       myallTotalNames = [...new Set([...hierarchyMap, ...branches])];;
//       overallMyallList = [...resulted, ...resultedTeam];
//       const restrictTeam = await Hirerarchi.aggregate([
//         {
//           $match: {
//             supervisorchoose:
//               { $in: myallTotalNames }, // Match supervisorchoose with username
//             level: { $in: levelFinal } // Corrected unmatched quotation mark
//           }
//         },
//         {
//           $lookup: {
//             from: "reportingheaders",
//             let: {
//               teamControlsArray: {
//                 $ifNull: ["$pagecontrols", []]
//               }
//             },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       {
//                         $in: [
//                           "$name",
//                           "$$teamControlsArray"
//                         ]
//                       }, // Check if 'name' is in 'teamcontrols' array
//                       {
//                         $in: [
//                           req?.body?.pagename,
//                           "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
//                         ]
//                       } // Additional condition for reportingnew array
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: "reportData" // The resulting matched documents will be in this field
//           }
//         },
//         {
//           $project: {
//             supervisorchoose: 1,
//             employeename: 1,
//             reportData: 1
//           }
//         }
//       ]);
//       let restrictListTeam = restrictTeam?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)
//       let overallRestrictList = req.body.hierachy === "myhierarchy" ? restrictList : req.body.hierachy === "allhierarchy" ? restrictListTeam : [...restrictList, ...restrictListTeam];
//       resultAccessFiltered =
//         req.body.hierachy === "myhierarchy" &&
//           (listpageaccessmode === "Hierarchy Based" ||
//             listpageaccessmode === "Overall")
//           ? resulted
//           : req.body.hierachy === "allhierarchy" &&
//             (listpageaccessmode === "Hierarchy Based" ||
//               listpageaccessmode === "Overall")
//             ? resultedTeam
//             : req.body.hierachy === "myallhierarchy" &&
//               (listpageaccessmode === "Hierarchy Based" ||
//                 listpageaccessmode === "Overall")
//               ? overallMyallList
//               : result;
//       resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFiltered?.filter(data => overallRestrictList?.includes(data?.username)) : [];
//       const finalUsernames = resultAccessFilter?.length > 0 ? [...new Set(resultAccessFilter?.map(data => data?.username))] : [];
//       const userNamesCollectios = await User.find({ companyname: { $in: finalUsernames } }, { companyname: 1, company: 1, branch: 1, unit: 1, team: 1, department: 1 })
//       // Grouping logic
//       const finalResult = groupTasksByUser(resultAccessFilter, userNamesCollectios);
//       return res.status(200).json({
//         resultAccessFilter: finalResult, finalResult, resultedTeam
//       });

//     } catch (err) {
//       console.log(err, 'err')
//       return next(new ErrorHandler("Records not found", 404));
//     }

//   }
// );


// function groupTasksByUser(tasks, users) {
//   const resultMap = {};

//   const statusKeyMap = {
//     "assigned": "assigned",
//     "completed": "completed",
//     "not applicable to me": "notApplicable",
//     "finished by others": "finishedOthers",
//     "postponed": "postponed",
//     "pending": "pending",
//     "paused": "paused",
//     "progress": "progress",
//   };

//   const defaultKeys = Object.values(statusKeyMap);

//   // Map users by companyname for quick lookup
//   const userMap = {};
//   users.forEach(user => {
//     userMap[user.companyname] = user;
//   });

//   tasks.forEach(task => {
//     const username = task.username;
//     const status = task.taskstatus.toLowerCase().trim();
//     const baseKey = statusKeyMap[status];
//     if (!baseKey) return; // skip unknown statuses
//     function generate15DigitId() {
//       const timestamp = Date.now().toString(); // 13 digits
//       const random = Math.floor(Math.random() * 90 + 10).toString(); // 2 digits
//       return timestamp + random;
//     }
//     if (!resultMap[username]) {
//       // Get matching user by companyname
//       const matchedUser = userMap[username] || {};

//       // Initialize default keys and user info
//       resultMap[username] = {
//         username,
//         company: matchedUser.company || "",
//         branch: matchedUser.branch || "",
//         unit: matchedUser.unit || "",
//         team: matchedUser.team || "",
//         department: matchedUser.department || "",
//         _id: generate15DigitId(),
//       };

//       defaultKeys.forEach(key => {
//         resultMap[username][`${key}Count`] = 0;
//         resultMap[username][`${key}Task`] = [];
//       });
//     }

//     const userObj = resultMap[username];
//     userObj[`${baseKey}Count`]++;
//     userObj[`${baseKey}Task`].push(task);
//   });

//   return Object.values(resultMap);
// }



const TaskForUser = require("../../../model/modules/task/taskforuser");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const Team = require("../../../model/modules/teams");
const User = require("../../../model/login/auth");
const Hirerarchi = require("../../../model/modules/setup/hierarchy");
const Designationgroup = require("../../../model/modules/designationgroup");
const Designation = require("../../../model/modules/designation");
const axios = require("axios");
const Shift = require('../../../model/modules/shift');
const moment = require("moment");
const TaskScheduleGrouping = require("../../../model/modules/task/TaskScheduleGroupingModel");
const TaskDesignationGrouping = require('../../../model/modules/task/taskdesignationgrouping');
const TaskNonScheduleGrouping = require("../../../model/modules/task/nonschedulegrouping");
const TrainingDetails = require('../../../model/modules/task/trainingdetails');
const TrainingForUser = require("../../../model/modules/task/trainingforuser");
const multer = require('multer');
const path = require('path');
const { Hierarchyfilter } = require('../../../utils/taskManagerCondition');
const Ebreadingdetails = require('../../../model/modules/eb/ebreadingdetails');
const Tasksubcategory = require('../../../model/modules/task/tasksubcategory');

///Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'taskUserPanel/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /\.(xlsx|xls|csv|pdf|txt|png|jpg|jpeg)$/;
  const allowedMimeTypes = /^(application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/csv|application\/pdf|text\/plain)$/;

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);
  return cb(null, true);
  // if (extname && mimetype) {
  //     return cb(null, true);
  // } else {
  //     cb(new Error('Only Documents are allowed'));
  // }
};

// Initialize multer with the storage engine and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});




function to24Hour(time12h) {
  const date = new Date(`1970-01-01T${time12h}`);
  return date.toTimeString().slice(0, 5); // "HH:MM"
}

function getFromToDateFromShift(shift, completedDate) {
  const [from12, to12] = shift.split('to');

  const fromMoment = moment(`${completedDate} ${from12.trim()}`, 'YYYY-MM-DD hh:mmA');
  const toMoment = moment(`${completedDate} ${to12.trim()}`, 'YYYY-MM-DD hh:mmA');

  let durationHours = moment.duration(toMoment.diff(fromMoment)).asHours();

  // Handle overnight shift (e.g. 10PM to 6AM)
  if (durationHours < 0) {
    durationHours += 24;
  }

  const fromDate = fromMoment.toDate();
  const toDate = fromMoment.clone().add(durationHours, 'hours').toDate();

  return { fromDate, toDate };
}






// get All TaskForUser => /api/taskschedulegroupings
exports.getAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    taskforuser = await TaskForUser.find({}, {
      category: 1,
      subcategory: 1, frequency: 1, schedule: 1,
      username: 1, date: 1, shiftEndTime: 1,
      tasktime: 1,
      taskdetails: 1, taskstatus: 1, taskassigneddate: 1,
      timetodo: 1,
      taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1,
      weekdays: 1, annumonth: 1, duration: 1, priority: 1
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});



exports.getAllTaskForAssingnedhome = catchAsyncErrors(async (req, res, next) => {
  let fromdate, todate;
  const today = new Date();
  const selectedFilter = req.body.selectedfilter;

  // Utility function to format date as 'YYYY-MM-DD'
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Set date ranges based on the selected filter
  switch (selectedFilter) {


    case "Last Month":
      fromdate = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)); // 1st of last month
      todate = formatDate(new Date(today.getFullYear(), today.getMonth(), 0)); // Last day of last month
      break;
    case "Last Week":
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - (today.getDay() + 6) % 7 - 7); // Last Monday
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Last Sunday
      fromdate = formatDate(startOfLastWeek);
      todate = formatDate(endOfLastWeek);
      break;
    case "Yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      fromdate = todate = formatDate(yesterday);
      break;

    case "Today":
      fromdate = todate = formatDate(today);
      break;
    case "Tomorrow":
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      fromdate = todate = formatDate(tomorrow);
      break;
    case "This Week":
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(today.getDate() - (today.getDay() + 6) % 7); // Monday
      const endOfThisWeek = new Date(startOfThisWeek);
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // Sunday
      fromdate = formatDate(startOfThisWeek);
      todate = formatDate(endOfThisWeek);
      break;
    case "This Month":
      fromdate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
      todate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));


      break;

    default:
      fromdate = "";
  }




  let taskforuser;

  try {
    const statuses = ["Assigned", "Pending", "Finished By Others", "Not Applicable to Me", "Postponed", "Paused", "Completed"];

    let query = {

    }



    const [
      taskforuserAssigned,
      taskforuserPending,
      taskforuserFinished,
      taskforuserApplicable,
      taskforuserPostponed,
      taskforuserPaused,
      taskforuserCompleted
    ] = await Promise.all(
      statuses.map(status => TaskForUser.countDocuments({
        ...(fromdate && todate
          ? { taskassigneddate: { $gte: fromdate, $lte: todate } }
          : fromdate
            ? { taskassigneddate: { $eq: fromdate } }
            : {}),
        taskstatus: status
      }))
    );

    taskforuser = {
      taskforuserAssigned,
      taskforuserPending,
      taskforuserFinished,
      taskforuserApplicable,
      taskforuserPostponed,
      taskforuserPaused,
      taskforuserCompleted
    }



    return res.status(200).json({
      taskforuser
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});


exports.getAllNonscheduleTaskLogReassign = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    taskforuser = await TaskForUser.find({
      category: req.body.category,
      subcategory: req.body.subcategory,
      username: { $in: req.body.username },
      taskdate: req.body.taskdate,
      tasktime: req.body.tasktime,
      taskdetails: "nonschedule"
    }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, tasktime: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, breakup: 1, breakupcount: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});
exports.getAllNonscheduleTaskLogForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    taskforuser = await TaskForUser.find({ orginalid: req.body.originalid }, { category: 1, tasktime: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});
exports.getINDIVIDUALAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    taskforuser = await TaskForUser.find({ state: "running", username: req.body.username }, { category: 1, tasktime: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});
exports.getCompletedAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser, result;
  let totalProjects, overallList;
  let frequency = ["Completed", "Finished By Others", "Not Applicable to Me"];
  // let { username, page, pageSize } = req.body;
  const { username, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
  try {
    let query = {
      username: username,
      taskstatus: { $in: frequency }
    };
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
          { priority: regex },
        ],
      }));

      query = {
        username: username,
        taskstatus: { $in: frequency },
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
    result = await TaskForUser.find(query, { category: 1, subcategory: 1, tasktime: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    totalProjects = await TaskForUser.find(query, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).countDocuments()
    overallList = await TaskForUser.find({ username: username, taskstatus: { $in: frequency } }, {
      _id: 1,
      taskstatus: 1,
      taskassigneddate: 1, timetodo: 1,
      taskdetails: 1,
      frequency: 1,
      completedbyuser: 1,
      userdescription: 1,
      category: 1,
      subcategory: 1,
      duration: 1,
      breakup: 1,
      required: 1,
      schedule: 1,
      priority: 1,
      timetodo: 1
    }).lean();

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    totalProjects: totalProjects,
    currentPage: page,
    result,
    overallList,
    totalPages: Math.ceil(totalProjects / pageSize),
  });
});




exports.getAllTaskUserOverallReports = catchAsyncErrors(async (req, res, next) => {
  let result, totalProjects, overall;
  const { company, branch, unit, team, fromdate, todate, department, username, taskstatus, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
  const skip = (page - 1) * pageSize; // Calculate the number of items to skip
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

  const from = moment.tz(req.body.fromdate, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day').toDate();
  const to = moment.tz(req.body.todate, 'YYYY-MM-DD', 'Asia/Kolkata').endOf('day').toDate();

  if (fromdate && todate) {
    query = {
      ...query,
      formattedDate: {
        $gte: from,
        $lte: to,
      },
    }



    overallQuery = {
      ...overallQuery,
      formattedDate: {
        $gte: from,
        $lte: to,
      },
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
    // First, count the total number of projects matching the frequency criteria
    totalProjects = UserNamesFromUser?.length > 0 ? await TaskForUser.countDocuments(query) : 0;
    overall = UserNamesFromUser?.length > 0 ? await TaskForUser.find(overallQuery,
      {
        category: 1,
        subcategory: 1,
        frequency: 1,
        schedule: 1,
        username: 1,
        date: 1,
        shiftEndTime: 1,
        taskdetails: 1,
        timetodo: 1,
        description: 1,
        taskstatus: 1,
        taskassigneddate: 1, timetodo: 1,
        taskdate: 1,
        taskassign: 1,
        breakup: 1,
        assignId: 1,
        monthdate: 1,
        tasktime: 1,
        weekdays: 1,
        annumonth: 1,
        required: 1,
        duration: 1,
        priority: 1
      }).lean() : [];
    // Then, find the projects with pagination
    result = UserNamesFromUser?.length > 0 ? await TaskForUser.find(query,
      {
        category: 1,
        subcategory: 1,
        frequency: 1,
        schedule: 1,
        username: 1,
        date: 1,
        shiftEndTime: 1,
        taskdetails: 1,
        timetodo: 1,
        description: 1,
        tasktime: 1,
        taskstatus: 1,
        taskassigneddate: 1, timetodo: 1,
        taskdate: 1,
        taskassign: 1,
        breakup: 1,
        assignId: 1,
        monthdate: 1,
        weekdays: 1,
        annumonth: 1,
        required: 1,
        duration: 1,
        priority: 1
      }).lean()
      .skip(skip)
      .limit(pageSize) : [];

    return res.status(200).json({
      totalProjects,
      currentPage: page,
      result,
      overall,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.log(err, 'errr')
    return next(new ErrorHandler("Records not found!", 404));
  }
});


exports.getOnprogressAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    taskforuser = await TaskForUser.find({ taskstatus: ["Paused", "Pending", "Postponed"], username: req.body.username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, tasktime: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();;
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});
exports.getManualAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    taskforuser = await TaskForUser.find({ taskdetails: "Manual", username: req.body.username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});
exports.getAllManualAllTaskForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    taskforuser = await TaskForUser.find({ taskdetails: "Manual" }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, tasktime: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});
// exports.getAllManualAllTaskForUserIDS = catchAsyncErrors(async (req, res, next) => {
//   let taskforuser, idArray;


//   try {
//     taskforuser = await TaskForUser.aggregate([
//       {
//         $match: {
//           taskdetails: "Manual",
//           taskname: req.body.taskname,
//           tasktime : req.body.tasktime
//         }
//       },
//       {
//         $group: {
//           _id: null,               
//           ids: { $push: "$_id" }    
//         }
//       },
//       {
//         $project: {
//           _id: 0,                  
//           ids: 1           
//         }
//       }
//     ]);
//   } catch (err) {
//     console.log(err , 'err')
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     taskforuser,
//   });
// });
exports.getAllTaskForUserOnprogress = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  let username = req.body.username;
  let anstaskUserPanel;
  try {
    taskforuser = await TaskForUser.find({ username: username, taskstatus: ["Paused", "Pending"] }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, tasktime: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
    anstaskUserPanel = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username
      === username && ["Paused", "Pending"]?.includes(data?.taskstatus) && data.taskdetails !== "Manual") : []
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!taskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    anstaskUserPanel,
  });
});
exports.getAllTaskForUserManual = catchAsyncErrors(async (req, res, next) => {
  let taskforuser, answer;
  let username = req.body.username;
  let role = req.body.role?.map(data => data?.toUpperCase());
  let anstaskUserPanel;
  try {
    const query = {
      taskdetails: "Manual",
      ...(role?.some(data => ["MANAGER", "SUPERADMIN", "SUPER ADMIN"].includes(data)) ? {} : { username })
    };
    taskforuser = await TaskForUser.find(query, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, tasktime: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
    answer = await TaskForUser.find({ taskdetails: "Manual" }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, tasktime: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

    anstaskUserPanel = answer
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!answer) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser, anstaskUserPanel
  });
});
exports.getAllTaskForUserCompleted = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  let username = req.body.username;
  let anstaskUserPanel;
  try {
    anstaskUserPanel = await TaskForUser.find({
      username: username,
      taskdetails: { $ne: "Manual" },
      taskstatus: { $in: ["Completed", "Finished By Others", "Not Applicable to Me"] }
    }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, tasktime: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!anstaskUserPanel) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    anstaskUserPanel,
  });
});

exports.getCompletedAllTaskForUserOverall = catchAsyncErrors(async (req, res, next) => {
  let result;

  let { username } = req.body;
  try {


    result = await TaskForUser.find({ taskstatus: ["Completed", "Finished By Others", "Not Applicable to Me"], username: username }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, tasktime: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result,
  });
});

exports.getAllTaskUserReportsOverall = catchAsyncErrors(async (req, res, next) => {
  let result;

  const { frequency } = req.body;
  try {


    result = await TaskForUser.find({
      frequency: { $in: frequency },
    }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, tasktime: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result,
  });
});



exports.getPendingTaskCountUsername = catchAsyncErrors(async (req, res, next) => {
  let task;
  let username = req.query.username;
  try {
    const pendingDates = await TaskForUser.aggregate([
      {
        $match: {
          username: username,
          taskstatus: {
            $nin: ["Completed", "Not Applicable to Me", "Finished By Others"],
          },
        },
      },
      {
        $group: {
          _id: "$taskassigneddate",
        },
      },
      {
        $count: "uniquePendingDates"
      }
    ]);

    task = pendingDates[0]?.uniquePendingDates || 0;

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    count: task,
  });
});


exports.getAllTaskHierarchySummaryReports = catchAsyncErrors(async (req, res, next) => {
  let result,
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

    const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
    DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
    const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);

    console.log(DataAccessMode, 'DataAccessMode')

    let restrictList = answer?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);

    // result = await User.find(
    //   {
    //     enquirystatus: {
    //       $nin: ["Enquiry Purpose"],
    //     },
    //     resonablestatus: {
    //       $nin: [
    //         "Not Joined",
    //         "Postponed",
    //         "Rejected",
    //         "Closed",
    //         "Releave Employee",
    //         "Absconded",
    //         "Hold",
    //         "Terminate",
    //       ],
    //     },
    //     ...(listpageaccessmode === "Reporting to Based"
    //       ? { reportingto: req.body.username }
    //       : {}),
    //   },
    //   {
    //     empcode: 1,
    //     companyname: 1,
    //     username: 1,
    //     branch: 1,
    //     unit: 1,
    //     designation: 1,
    //     team: 1,
    //     department: 1,
    //     company: 1,
    //     extratime: 1,
    //     extrastatus: 1,
    //     extradate: 1,
    //     loginUserStatus: 1, workstation: 1, workstationshortname: 1, workstationinput: 1,
    //   }
    // );
    const from = moment.tz(req.body.fromdate, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day').toDate();
    const to = moment.tz(req.body.todate, 'YYYY-MM-DD', 'Asia/Kolkata').endOf('day').toDate();

    if (listpageaccessmode === 'Reporting to Based') {
      reportingusers = await User.find(
        {
          enquirystatus: {
            $nin: ['Enquiry Purpose'],
          },
          resonablestatus: {
            $nin: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
          },
          reportingto: req.body.username,
        },
        {
          empcode: 1,
          companyname: 1,
        }
      ).lean();
      const companyNames = reportingusers.map((user) => user.companyname);
      result = await TaskForUser.aggregate([
        {
          $match: {
            username: { $in: companyNames }, // Ensure `companyNames` is defined and an array
            formattedDate: {
              $gte: from,
              $lte: to,
            },
          },
        },
        {
          $project: {
            category: 1,
            subcategory: 1,
            frequency: 1,
            schedule: 1,
            username: 1,
            date: 1,
            shiftEndTime: 1,
            taskdetails: 1,
            timetodo: 1,
            description: 1,
            taskstatus: 1,
            taskassigneddate: 1,
            taskdate: 1,
            taskassign: 1,
            breakup: 1,
            assignId: 1,
            monthdate: 1,
            weekdays: 1,
            tasktime: 1,
            annumonth: 1,
            required: 1,
            duration: 1,
            priority: 1,
          },
        },
      ]);
    } else {
      result = await TaskForUser.aggregate([
        {
          $match: {
            formattedDate: {
              $gte: from,
              $lte: to,
            },
          },
        },
        {
          $project: {
            category: 1,
            subcategory: 1,
            frequency: 1,
            schedule: 1,
            username: 1,
            date: 1,
            shiftEndTime: 1,
            taskdetails: 1,
            timetodo: 1,
            description: 1,
            taskstatus: 1,
            taskassigneddate: 1,
            timetodo: 1,
            taskdate: 1,
            taskassign: 1,
            breakup: 1,
            assignId: 1,
            tasktime: 1,
            monthdate: 1,
            weekdays: 1,
            annumonth: 1,
            required: 1,
            duration: 1,
            priority: 1,
          },
        },
      ]);
    }
    // Accordig to sector and list filter process
    hierarchyFilter = await Hirerarchi.find({ level: req.body.sector });
    userFilter = hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);
    hierarchyDefList = await Hirerarchi.find();
    user = await User.find({ companyname: req.body.username }, { designation: 1 });
    const userFilt = user.length > 0 && user[0].designation;
    const desiGroup = await Designation.find();
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
        : '';

    const answerFilterExcel = hierarchySecond.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name))) : [];

    result2 =
      answerFilterExcel.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel.find((item2) => item2.employeename.includes(item1.username));
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
          .filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : '';
    const answerFilterExcel2 = subBranch.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name))) : [];

    result3 =
      answerFilterExcel2.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel2.find((item2) => item2.employeename.includes(item1.username));
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
          .filter((item) => item.supervisorchoose.some((name) => ans.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : '';

    const answerFilterExcel3 = ans.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => ans.includes(name))) : [];

    result4 =
      answerFilterExcel3.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel3?.find((item2) => item2.employeename.includes(item1.username));
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
              return item1;
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
            const matchingItem2 = answerFilterExcel5?.find((item2) => item2.employeename.includes(item1.username));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              return item1;
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop5);

    resultedTeam = [...result2, ...result3, ...result4, ...result5, ...result6];
    //overall Teams List
    myallTotalNames = DataAccessMode ? uniqueNames : [...new Set([...hierarchyMap, ...branches])];
    const finalResultTask = await TaskForUser.aggregate([
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
          category: 1,
          subcategory: 1,
          frequency: 1,
          schedule: 1,
          username: 1,
          date: 1,
          shiftEndTime: 1,
          taskdetails: 1,
          timetodo: 1,
          description: 1,
          taskstatus: 1,
          taskassigneddate: 1, timetodo: 1,
          taskdate: 1,
          taskassign: 1,
          breakup: 1,
          assignId: 1,
          tasktime: 1,
          monthdate: 1,
          weekdays: 1,
          annumonth: 1,
          required: 1,
          duration: 1,
          priority: 1
        },
      },
    ]);
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


    let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === 'myhierarchy' ?
      restrictList : req.body.hierachy === 'allhierarchy' ?
        restrictListTeam : [...restrictList, ...restrictListTeam]);


    resultAccessFiltered = DataAccessMode ? finalResultTask : (
      req.body.hierachy === 'myhierarchy' && (listpageaccessmode === 'Hierarchy Based' || listpageaccessmode === 'Overall')
        ? resulted
        : req.body.hierachy === 'allhierarchy' && (listpageaccessmode === 'Hierarchy Based' || listpageaccessmode === 'Overall')
          ? resultedTeam
          : req.body.hierachy === 'myallhierarchy' && (listpageaccessmode === 'Hierarchy Based' || listpageaccessmode === 'Overall')
            ? overallMyallList
            : result);
    resultAccessFilter = overallRestrictList?.length > 0 ? [...new Set(resultAccessFiltered?.filter((data) => overallRestrictList?.includes(data?.username)))] : [];
    const finalUsernames = resultAccessFilter?.length > 0 ? [...new Set(resultAccessFilter?.map((data) => data?.username))] : [];
    const userNamesCollectios = await User.find({ companyname: { $in: finalUsernames } }, { companyname: 1, company: 1, branch: 1, unit: 1, team: 1, department: 1 });
    // Grouping logic
    const finalResult = groupTasksByUser(resultAccessFilter, userNamesCollectios);
    return res.status(200).json({
      resultAccessFilter: finalResult,
      finalResult,
      resultedTeam,
      DataAccessMode

    });
  } catch (err) {
    console.log(err, 'err');
    return next(new ErrorHandler('Records not found', 404));
  }
});



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


exports.getAllTaskUserReports = catchAsyncErrors(async (req, res, next) => {
  let result, totalProjects, overall;
  const { frequency, status, fromdate, todate, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
  const skip = (page - 1) * pageSize; // Calculate the number of items to skip
  let query = {};
  let Overallquery = {};
  const from = moment.tz(req.body.fromdate, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day').toDate();
  const to = moment.tz(req.body.todate, 'YYYY-MM-DD', 'Asia/Kolkata').endOf('day').toDate();

  if (frequency?.length > 0) {
    query.frequency = { $in: frequency }
    Overallquery.frequency = { $in: frequency }
  }
  if (status?.length > 0) {
    query.taskstatus = { $in: status }
    Overallquery.taskstatus = { $in: status }
  }


  if (fromdate && todate) {
    query = {
      ...query,
      formattedDate: {
        $gte: from,
        $lte: to,
      },
    }



    Overallquery = {
      ...Overallquery,
      formattedDate: {
        $gte: from,
        $lte: to,
      },
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
        { taskstatus: regex },
        { taskassigneddate: regex },
        { taskdate: regex },
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
      ],
    }));

    query = {
      ...query,
      $and: [
        ...orConditions,
      ]
    };
  }

  // console.log(query, req?.body?.fromdate, 'qwuery')
  // Apply logicOperator to combine conditions
  if (conditions.length > 0) {
    if (logicOperator === "AND") {
      query.$and = conditions;
    } else if (logicOperator === "OR") {
      query.$or = conditions;
    }
  }

  try {
    // First, count the total number of projects matching the frequency criteria
    totalProjects = await TaskForUser.countDocuments(query);
    overall = await TaskForUser.find(Overallquery,
      {
        category: 1,
        subcategory: 1,
        frequency: 1,
        schedule: 1,
        username: 1,
        date: 1,
        shiftEndTime: 1,
        taskdetails: 1,
        timetodo: 1,
        description: 1,
        taskstatus: 1,
        taskassigneddate: 1,
        taskdate: 1,
        taskassign: 1,
        breakup: 1,
        assignId: 1,
        monthdate: 1,
        weekdays: 1,
        tasktime: 1,
        annumonth: 1,
        required: 1,
        duration: 1,
        priority: 1
      }).lean();

    // Then, find the projects with pagination
    result = await TaskForUser.find(query,
      {
        category: 1,
        subcategory: 1,
        frequency: 1,
        schedule: 1,
        username: 1,
        date: 1,
        shiftEndTime: 1,
        taskdetails: 1,
        timetodo: 1,
        description: 1,
        taskstatus: 1,
        tasktime: 1,
        taskassigneddate: 1, timetodo: 1,
        taskdate: 1,
        taskassign: 1,
        breakup: 1,
        assignId: 1,
        monthdate: 1,
        weekdays: 1,
        annumonth: 1,
        required: 1,
        duration: 1,
        priority: 1
      }).lean()
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      totalProjects,
      currentPage: page,
      result,
      overall,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
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




exports.getAllTaskForUserAutoGenerate = catchAsyncErrors(async (req, res, next) => {
  const { updatedAns, username } = req.body;
  let uniqueElements, nonscheduledata;

  try {
    // Query to fetch matching tasks for uniqueElements
    const existingTasks = await TaskForUser.find({
      username: username,
      taskdetails: "schedule",
      shiftEndTime: { $gte: new Date() }
    }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

    // Filter updatedAns based on the existingTasks query
    uniqueElements = updatedAns?.filter(obj1 =>
      !existingTasks.some(obj2 =>
        obj1.category === obj2.category &&
        obj1.subcategory === obj2.subcategory &&
        obj1.frequency === obj2.frequency &&
        obj1.schedule === obj2.schedule
      )
    );

    // Query to fetch non-scheduled tasks
    nonscheduledata = await TaskForUser.find({
      username: username,
      taskdetails: "nonschedule",
      taskdate: moment(new Date()).format("YYYY-MM-DD")
    }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

    if (!uniqueElements && !nonscheduledata) {
      return next(new ErrorHandler("Records not found", 404));
    }

    return res.status(200).json({
      uniqueElements,
      nonscheduledata,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found", 404));
  }
});

exports.getAllTaskHierarchyReports = catchAsyncErrors(
  async (req, res, next) => {
    let taskforuser,
      result,
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

    const fromDate = new Date(req.body.fromdate);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(req.body.todate);
    toDate.setHours(23, 59, 59, 999);

    const { listpageaccessmode } = req.body;

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
      // console.log(restrictList?.length, "6009")
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




      // console.log(result?.length, "6048")
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
        result = await TaskForUser.aggregate([
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
              category: 1,
              subcategory: 1,
              frequency: 1,
              schedule: 1,
              username: 1,
              date: 1,
              shiftEndTime: 1,
              taskdetails: 1,
              timetodo: 1,
              description: 1,
              taskstatus: 1,
              taskassigneddate: 1,
              taskdate: 1,
              taskassign: 1,
              breakup: 1,
              assignId: 1,
              monthdate: 1,
              tasktime: 1,
              weekdays: 1,
              annumonth: 1,
              required: 1,
              duration: 1,
              priority: 1,
            },
          },
        ]);
      } else {
        result = await TaskForUser.aggregate([
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
              category: 1,
              subcategory: 1,
              frequency: 1,
              schedule: 1,
              username: 1,
              date: 1,
              shiftEndTime: 1,
              taskdetails: 1,
              timetodo: 1,
              description: 1,
              taskstatus: 1,
              taskassigneddate: 1, timetodo: 1,
              taskdate: 1,
              taskassign: 1,
              breakup: 1,
              assignId: 1,
              tasktime: 1,
              monthdate: 1,
              weekdays: 1,
              annumonth: 1,
              required: 1,
              duration: 1,
              priority: 1
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
      user = await User.find({ companyname: req.body.username });
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
      myallTotalNames = DataAccessMode ? uniqueNames : [...hierarchyMap, ...branches];
      const finalResult = await TaskForUser.aggregate([
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
            category: 1,
            subcategory: 1,
            frequency: 1,
            schedule: 1,
            username: 1,
            date: 1,
            shiftEndTime: 1,
            taskdetails: 1,
            timetodo: 1,
            description: 1,
            taskstatus: 1,
            taskassigneddate: 1, timetodo: 1,
            taskdate: 1,
            taskassign: 1,
            breakup: 1,
            assignId: 1,
            tasktime: 1,
            monthdate: 1,
            weekdays: 1,
            annumonth: 1,
            required: 1,
            duration: 1,
            priority: 1
          },
        },
      ]);
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

      let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)
      let overallRestrictList = DataAccessMode ? restrictListTeam :
        (req.body.hierachy === "myhierarchy" ? restrictList :
          req.body.hierachy === "allhierarchy" ? restrictListTeam
            : [...restrictList, ...restrictListTeam]);

      // console.log(DataAccessMode ? "pageControlsData" : "restrictTeam", restrictListTeam, 'restrictListTeam')


      let resultAccessFiltered = DataAccessMode ? finalResult : (
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


    resultAccessFilter = overallRestrictList?.length > 0 ? [...new Set(resultAccessFiltered?.filter((data) => overallRestrictList?.includes(data?.username)))] : [];
    } catch (err) {
      console.log(err, 'err')
      return next(new ErrorHandler("Records not found", 404));
    }
    return res.status(200).json({
      resultAccessFilter, resultedTeam, DataAccessMode
    });
  }
);

// async function Hierarchyfilter(hierarchyData, pagename) {
//   try {
//     const hierarchyResults = await Hirerarchi.find({
//       level: { $in: hierarchyData }
//     }).lean();

//     const namesArray = hierarchyResults.flatMap((item) => {
//       const employee = Array.isArray(item.employeename) ? item.employeename : [item.employeename];
//       const supervisor = Array.isArray(item.supervisorchoose) ? item.supervisorchoose : [item.supervisorchoose];
//       return [...employee, ...supervisor];
//     });
//     // console.log()
//     // Remove undefined/null and duplicates
//     const uniqueNames = [...new Set(namesArray.filter(Boolean))];

//     const pageReportData = await Hirerarchi.aggregate([
//       {
//         $match: {
//           level: { $in: hierarchyData } // Corrected unmatched quotation mark
//         }
//       },
//       {
//         $lookup: {
//           from: "reportingheaders",
//           let: {
//             teamControlsArray: {
//               $ifNull: ["$pagecontrols", []]
//             }
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     {
//                       $in: [
//                         "$name",
//                         "$$teamControlsArray"
//                       ]
//                     }, // Check if 'name' is in 'teamcontrols' array
//                     {
//                       $in: [
//                         pagename,
//                         "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
//                       ]
//                     } // Additional condition for reportingnew array
//                   ]
//                 }
//               }
//             }
//           ],
//           as: "reportData" // The resulting matched documents will be in this field
//         }
//       },
//       {
//         $project: {
//           supervisorchoose: 1,
//           employeename: 1,
//           reportData: 1
//         }
//       }
//     ]);

//     const reportDataArray = pageReportData?.filter(data => data?.reportData?.length > 0)?.flatMap((item) => {
//       const employee = Array.isArray(item.employeename) ? item.employeename : [item.employeename];
//       const supervisor = Array.isArray(item.supervisorchoose) ? item.supervisorchoose : [item.supervisorchoose];
//       return [...employee, ...supervisor];
//     });
//     const pageControlsData = [...new Set(reportDataArray.filter(Boolean))];

//     // console.log(reportDataArray, 'reportDataArray')
//     return {
//       uniqueNames,
//       pageControlsData
//     };
//   } catch (error) {
//     console.error("Error fetching hierarchy data:", error);
//     return {
//       uniqueNames: [],
//       pageControlsData: []
//     };
//   }
// }









exports.getAllSortedTaskForUser = catchAsyncErrors(async (req, res, next) => {
  let taskforuser, sortedTasks;
  let username = req.body?.username;
  let todaysDate = req.body?.todaysDate;
  let PresentDate = req.body.date;
  try {
    taskforuser = await TaskForUser.find({ username: username }, { category: 1, tasktime: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

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

    function compareTimeNonSchedule(a, b) {
      if (a?.tasktime === b?.tasktime) {
        return 0;
      } else if (a.tasktime === "") {
        return 1;
      } else if (b.tasktime === "") {
        return -1;
      } else {
        const timeA = a.tasktime.split(":");
        const timeB = b.tasktime.split(":");
        const hourDiff = parseInt(timeA[0]) - parseInt(timeB[0]);
        if (hourDiff !== 0) {
          return hourDiff;
        } else {
          return parseInt(timeA[1]) - parseInt(timeB[1]);
        }
      }
    }

    let anstaskOnProgress = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data.taskstatus === "OnProgress") : []
    let anstaskUserPanelSchedule = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "schedule" && data.taskstatus === "Assigned") : []
    let anstaskUserPanelNonScheduleFixed = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency === "Fixed" && data.taskstatus === "Assigned").sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]) : [];
    let anstaskUserPanelNonScheduleAnyTime = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency !== "Fixed" && data.taskstatus === "Assigned") : [];
    anstaskUserPanelNonScheduleAnyTime?.sort((a, b) => compareTimeNonSchedule(a, b));
    //Assigned
    let finalSchedule = anstaskUserPanelSchedule?.length > 0 ? anstaskUserPanelSchedule?.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]) : [];
    let onProgressTask = anstaskOnProgress?.length > 0 ? anstaskOnProgress : []

    let final = [...onProgressTask, ...finalSchedule, ...anstaskUserPanelNonScheduleFixed, ...anstaskUserPanelNonScheduleAnyTime]


    const uniqueObjects = [];
    const uniqueKeys = new Set();
    final?.forEach(obj => {
      const key = `${obj.category}-${obj.subcategory}-${obj.username}-${obj.frequency}-${obj.duration}-${obj.taskassigneddate}`;
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
  if (!sortedTasks) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    sortedTasks,
  });
});
const convertTimeToAMPMFormat = (time) => {
  let [hour, minute] = time.split(':').map(Number);
  let timetype = 'AM';

  if (hour >= 12) {
    timetype = 'PM';
    if (hour > 12) {
      hour -= 12;
    }
  }

  if (hour === 0) {
    hour = 12;
  }

  return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute} ${timetype}`;
};



const taskSorted = async (user) => {
  let taskforuser, sortedTasks;
  let username = user;
  let todaysDate = moment(new Date()).format("YYYY-MM-DD");
  let PresentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
  try {
    taskforuser = await TaskForUser.find({ username: username }, { category: 1, tasktime: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();

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

    function compareTimeNonSchedule(a, b) {
      if (a?.tasktime === b?.tasktime) {
        return 0;
      } else if (a.tasktime === "") {
        return 1;
      } else if (b.tasktime === "") {
        return -1;
      } else {
        const timeA = a.tasktime.split(":");
        const timeB = b.tasktime.split(":");
        const hourDiff = parseInt(timeA[0]) - parseInt(timeB[0]);
        if (hourDiff !== 0) {
          return hourDiff;
        } else {
          return parseInt(timeA[1]) - parseInt(timeB[1]);
        }
      }
    }

    let anstaskOnProgress = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data.taskstatus === "OnProgress") : []
    let anstaskUserPanelSchedule = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "schedule" && data.taskstatus === "Assigned") : []
    let anstaskUserPanelNonScheduleFixed = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency === "Fixed" && data.taskstatus === "Assigned").sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]) : [];
    let anstaskUserPanelNonScheduleAnyTime = taskforuser?.length > 0 ? taskforuser?.filter(data => data?.username === username && data.taskdetails !== "Manual" && data?.taskdetails === "nonschedule" && data?.taskdate === PresentDate && data?.frequency !== "Fixed" && data.taskstatus === "Assigned") : [];
    anstaskUserPanelNonScheduleAnyTime?.sort((a, b) => compareTimeNonSchedule(a, b));
    //Assigned
    let finalSchedule = anstaskUserPanelSchedule?.length > 0 ? anstaskUserPanelSchedule?.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]) : [];
    let onProgressTask = anstaskOnProgress?.length > 0 ? anstaskOnProgress : []

    let final = [...onProgressTask, ...finalSchedule, ...anstaskUserPanelNonScheduleFixed, ...anstaskUserPanelNonScheduleAnyTime]


    const uniqueObjects = [];
    const uniqueKeys = new Set();
    final?.forEach(obj => {
      const key = `${obj.category}-${obj.subcategory}-${obj.username}-${obj.frequency}-${obj.duration}-${obj.taskassigneddate}`;
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
    const answer = otherTasks?.concat(todayTasks);
    sortedTasks = answer?.length > 0 ? answer?.map((item, index) => ({
      serialNumber: index + 1,
      id: item._id,
      taskstatus: item.taskstatus,
      taskassigneddate: item.taskassigneddate,
      priority: item.priority,
      category: item.category,
      tasktime: item?.taskdetails === "nonschedule" ? item.schedule === "Any Time" ? "" : convertTimeToAMPMFormat(item.tasktime) : item.schedule === "Any Time" ? "" : `${item?.timetodo[0]?.hour}:${item?.timetodo[0]?.min} ${item?.timetodo[0]?.timetype}`,
      frequency: item.frequency,
      subcategory: item.subcategory,
      taskdetails: item.taskdetails,
      schedule: item.schedule,
      duration: item.duration,
      type: item.type,
      required: item?.required?.map((t, i) => `${i + 1 + ". "}` + t).toString(),
      breakup: item?.breakup,
      description: item?.description ? item?.description : "",
    })) : [];


    return sortedTasks;
  } catch (err) {
    console.log(err?.message, 'TaskSorted')
  }
};
const trainingSorterd = async (user) => {
  let taskforuser, sortedTasks;
  let username = user;
  let todaysDate = moment(new Date()).format("YYYY-MM-DD");
  let PresentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
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
      tasktime: 1,
      taskassigneddate: 1, timetodo: 1,
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
    const answer = otherTasks?.concat(todayTasks);

    sortedTasks = answer?.length > 0 ? answer?.map((item, index) => ({
      serialNumber: index + 1,
      id: item._id,
      taskstatus: item.taskstatus,
      taskassigneddate: item.taskassigneddate,
      trainingdetails: item.trainingdetails,
      tasktime: item?.taskdetails !== "Mandatory" ? "" :
        item.schedule === "Any Time" ? "" :
          `${item?.timetodo[0]?.hour}:${item?.timetodo[0]?.min} ${item?.timetodo[0]?.timetype}`,
      frequency: item.frequency,
      taskdetails: item.taskdetails,
      schedule: item.schedule,
      duration: item.duration,
      type: item.type,
      required: item?.required?.map((t, i) => `${i + 1 + ". "}` + t).toString(),
    })) : [];


    return sortedTasks;
  } catch (err) {
    console.log(err?.message, 'TaskSorted')
  }
};


// Create new TaskForUser=> /api/taskforuser/new
exports.addTaskForUser = catchAsyncErrors(async (req, res, next) => {

  const { category, subcategory, username, frequency, duration, taskassigneddate, taskdetails, taskdate, tasktime, timetodo } = req.body;
  const existingRecords = taskdetails === "schedule" ? await TaskForUser.find({
    category,
    subcategory,
    username,
    frequency,
    duration,
    taskassigneddate,
    taskdetails,
    timetodo

  }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean() :
    await TaskForUser.find({
      category,
      subcategory,
      username,
      taskdate,
      tasktime,
      taskdetails,
      schedule: req.body.schedule

    }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, tasktime: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
  // console.log(existingRecords , 'existingRecords')
  if (existingRecords?.filter(data => data.taskdetails !== "Manual")?.length > 0) {
    return res.status(400).json({
      message: 'This Data is Already Exists!'
    });
  }

  if (req.body.taskassigneddate) {
    req.body.formattedDate = moment(req.body.taskassigneddate, "DD-MM-YYYY").toDate();
  }

  let ataskforuser = await TaskForUser.create(req.body);

  return res.status(200).json({
    message: 'Successfully added!',
    data: ataskforuser
  });

});

// get Signle TaskForUser => /api/taskforuser/:id
exports.getSingleTaskForUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let staskforuser = await TaskForUser.findById(id);

  if (!staskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    staskforuser,
  });
});

// update TaskForUser by id => /api/taskforuser/:id
exports.updateTaskForUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let utaskforuser = await TaskForUser.findByIdAndUpdate(id, req.body);
  if (!utaskforuser) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});





// delete TaskForUser by id => /api/taskforuser/:id
exports.deleteTaskForUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dtaskschedulegrouping = await TaskForUser.findByIdAndRemove(id);

  if (!dtaskschedulegrouping) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.getAllTaskForUserUsername = catchAsyncErrors(async (req, res, next) => {
  let taskforuser, task;
  let username = req.body.username;
  let state = req.body.state;
  let id = req.body.id
  try {
    task = await TaskForUser.find({ username: username, state: state }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, tasktime: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
    taskforuser = task?.find(data => data?._id?.toString() !== id)
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    taskforuser,
  });
});



//to get pending task count
exports.getPendingTaskCount = catchAsyncErrors(async (req, res, next) => {
  let task;
  let username = req.query.username;
  try {
    task = await TaskForUser.countDocuments({
      username: username,
      // taskstatus: { $ne: "Completed" },
      taskstatus: {
        $nin: ["Completed", "Not Applicable to Me", "Finished By Others"],
      },
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    count: task,
  });
});







//to get pending task count
exports.gettriggeredWhileClockIn = catchAsyncErrors(async (req, res, next) => {
  let task;
  // let username = req.query.username;
  let { isUserRoleAccess, shifttiming, cin, cout, weekOffShow, holidayShow } = req?.body
  let userShiftDetails = await fetchUsers(req?.body?.isUserRoleAccess);
  let calculatedTime = userShiftDetails ? await updateTimeRange(userShiftDetails, cin, cout) : "00:00";
  let checkShiftTiming = await checkTimeRange(calculatedTime);
  try {
    const res_task = await TaskScheduleGrouping.find().lean();
    const res_shift_User = await Shift.find().lean();
    const res_task_Schedule = await TaskScheduleGrouping.find().lean();
    const userChecknonschedule = await TaskNonScheduleGrouping.find().lean();
    const res_task_Desig = await TaskDesignationGrouping.aggregate([
      {
        $match: {
          schedulestatus: "Active"
        }
      },
    ]);

    const shiftUser = res_shift_User?.find(item => item.name === isUserRoleAccess.shifttiming)

    let taskStatusDep = res_task_Desig?.filter(data => {
      if (data?.type === "Designation") {
        return data.company?.includes(isUserRoleAccess?.company)
          && data.branch?.includes(isUserRoleAccess?.branch)
          && data.unit?.includes(isUserRoleAccess?.unit)
          && data.designation?.includes(isUserRoleAccess?.designation)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Department") {
        return data.company?.includes(isUserRoleAccess?.company)
          && data.branch?.includes(isUserRoleAccess?.branch)
          && data.unit?.includes(isUserRoleAccess?.unit) && data.department?.includes(isUserRoleAccess?.department)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Company") {
        return data.company?.includes(isUserRoleAccess?.company)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Unit") {
        return data.company?.includes(isUserRoleAccess?.company)
          && data.branch?.includes(isUserRoleAccess?.branch)
          && data.unit?.includes(isUserRoleAccess?.unit)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Branch") {
        return data.company?.includes(isUserRoleAccess?.company)
          && data.branch?.includes(isUserRoleAccess?.branch)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Team") {
        return data.company?.includes(isUserRoleAccess?.company)
          && data.branch?.includes(isUserRoleAccess?.branch)
          && data.unit?.includes(isUserRoleAccess?.unit)
          && data.team?.includes(isUserRoleAccess?.team)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Process") {
        return data.company?.includes(isUserRoleAccess?.company)
          && data.branch?.includes(isUserRoleAccess?.branch)
          && data.unit?.includes(isUserRoleAccess?.unit)
          && data.team?.includes(isUserRoleAccess?.team) &&
          data.process?.includes(isUserRoleAccess?.process)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Individual") {
        return data.company?.includes(isUserRoleAccess?.company)
          && data.branch?.includes(isUserRoleAccess?.branch)
          && data.unit?.includes(isUserRoleAccess?.unit)
          && data.team?.includes(isUserRoleAccess?.team)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
    })


    let userTaskDesignation = taskStatusDep?.length > 0 ? taskStatusDep?.flatMap(data => data.employeenames) : []
    const DuplicateRemoval = [...new Set(userTaskDesignation)]
    const userDuplicate = DuplicateRemoval?.includes("ALL") ? [isUserRoleAccess?.companyname] : DuplicateRemoval?.filter(data => data === isUserRoleAccess?.companyname)

    const frequencyOrder = {
      Daily: 1,
      "Date wise": 2,
      "Day wise": 3,
      Weekly: 4,
      Monthly: 5,
      Annually: 6,
    };
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowNight = new Date(today);
    tomorrowNight.setDate(today.getDate() + 1);
    // const dayOfWeekTomorrow = tomorrow.toLocaleString('en-US', { weekday: 'long' });
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
    const currentDay = today.getDate();
    const dayOfMonth = today.getMonth() + 1;

    // Convert shift start and end times to 24-hour format
    tomorrowNight.setHours(shiftUser?.totime === 'AM' ? shiftUser?.tohour : Number(shiftUser?.tohour) + 12, shiftUser?.tomin, 0, 0);

    const updatedArray = taskStatusDep?.length > 0 ? res_task?.map(item2 => {
      const ans = item2.schedule === "Fixed" ? `${item2.frequency}-${item2.schedule}-${item2?.timetodo[0]?.hour}:${item2?.timetodo[0]?.min} ${item2?.timetodo[0]?.timetype}` : `${item2.frequency}-${item2.schedule}`
      const matchingItem = taskStatusDep.find(item1 => {
        if (item1?.type === "Designation") {
          return item1.category === item2.category
            && item1.subcategory === item2.subcategory &&
            item1.company?.includes(isUserRoleAccess?.company)
            && item1.branch?.includes(isUserRoleAccess?.branch)
            && item1.unit?.includes(isUserRoleAccess?.unit)
            &&
            item1?.designation?.includes(isUserRoleAccess?.designation) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans);
        }
        if (item1?.type === "Department") {
          return item1.category === item2.category &&
            item1.subcategory === item2.subcategory &&
            item1.company?.includes(isUserRoleAccess?.company)
            && item1.branch?.includes(isUserRoleAccess?.branch)
            && item1.unit?.includes(isUserRoleAccess?.unit)
            &&
            item1?.department?.includes(isUserRoleAccess?.department) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans)
        }
        if (item1?.type === "Individual") {
          return item1.category === item2.category
            && item1.subcategory === item2.subcategory
            && item1?.company?.includes(isUserRoleAccess?.company)
            && item1?.branch?.includes(isUserRoleAccess?.branch) &&
            item1?.unit?.includes(isUserRoleAccess?.unit) &&
            item1?.team?.includes(isUserRoleAccess?.team) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans)
        }
        if (item1?.type === "Company") {
          return item1.category === item2.category
            && item1.subcategory === item2.subcategory
            && item1?.company?.includes(isUserRoleAccess?.company)
            && (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans)
        }
        if (item1?.type === "Branch") {
          return item1.category === item2.category
            && item1.subcategory === item2.subcategory
            && item1?.company?.includes(isUserRoleAccess?.company)
            && item1?.branch?.includes(isUserRoleAccess?.branch) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans)
        }
        if (item1?.type === "Unit") {
          return item1.category === item2.category
            && item1.subcategory === item2.subcategory
            && item1?.company?.includes(isUserRoleAccess?.company)
            && item1?.branch?.includes(isUserRoleAccess?.branch) &&
            item1?.unit?.includes(isUserRoleAccess?.unit) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans)
        }
        if (item1?.type === "Team") {
          return item1.category === item2.category
            && item1.subcategory === item2.subcategory
            && item1?.company?.includes(isUserRoleAccess?.company)
            && item1?.branch?.includes(isUserRoleAccess?.branch) &&
            item1?.unit?.includes(isUserRoleAccess?.unit) &&
            item1?.team?.includes(isUserRoleAccess?.team) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans)
        }
        if (item1?.type === "Process") {
          return item1.category === item2.category
            && item1.subcategory === item2.subcategory
            && item1?.company?.includes(isUserRoleAccess?.company)
            && item1?.branch?.includes(isUserRoleAccess?.branch) &&
            item1?.unit?.includes(isUserRoleAccess?.unit) &&
            item1?.team?.includes(isUserRoleAccess?.team) &&
            item1?.process?.includes(isUserRoleAccess?.process) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL')) &&
            item1?.frequency?.includes(ans)
        }
      })

      if (matchingItem) {
        return { ...item2, schedulestatus: matchingItem?.schedulestatus, taskassign: matchingItem?.taskassign, assignId: matchingItem?._id, priority: matchingItem.priority, description: matchingItem.description, documentfiles: matchingItem.documentfiles };
      }
    }) : [];

    let anstaskUserPanel = updatedArray?.length > 0 ? updatedArray?.filter(item => item !== undefined) : []
    const getNextDays = (currentDays) => {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return currentDays.map(currentDay => {
        const currentDayIndex = daysOfWeek.indexOf(currentDay);
        const nextDayIndex = (currentDayIndex + 1) % 7; // Ensure it wraps around to Sunday if needed
        return daysOfWeek[nextDayIndex];
      });
    };

    let priorityCheck = anstaskUserPanel?.length > 0 ? anstaskUserPanel?.filter((item) => {
      if (item?.frequency === "Daily" && weekOffShow && holidayShow) {
        //Shift Basis 
        if (checkShiftTiming === "Morning" && item?.schedule === "Fixed" && weekOffShow) {
          return item;

        }
        else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed" && weekOffShow) {
          return item;
        }
        //Anytime Basis 
        else if (item?.schedule === "Any Time" && weekOffShow) {
          return item;

        }
      }
      if ((item?.frequency === "Day Wise" || item?.frequency === "Weekly" && weekOffShow && holidayShow)) {
        if (checkShiftTiming === "Morning" && item?.schedule === "Fixed") {
          return item?.weekdays?.includes(dayOfWeek);

        }
        else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed") {
          const dayOfWeekTomorrow = getNextDays(item?.weekdays);
          const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
          const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
          return item?.weekdays?.includes(dayOfWeek);
        }
        //Anytime Basis s
        else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {
          const dayOfWeekTomorrow = getNextDays(item?.weekdays);
          const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
          const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
          return item?.weekdays?.includes(dayOfWeek);


        }
        else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
          const dayOfWeekTomorrow = getNextDays(item?.weekdays);
          const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
          const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
          return item?.weekdays?.includes(dayOfWeek);
        }

      }
      if (item?.frequency === "Monthly" || item?.frequency === "Date Wise" && weekOffShow && holidayShow) {
        //Shift Basis 
        if (checkShiftTiming === "Morning" && item?.schedule === "Fixed") {
          const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
          return item?.monthdate == formattedDay;

        }
        else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed") {
          const today = new Date();


          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() - 1);
          const tomorrowNight = new Date(tomorrow);
          if (new Date().getDate() == Number(item?.monthdate)) {
            return item;

          } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
            return item
          }

        }
        //Anytime Basis 
        else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {
          const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
          return item?.monthdate == formattedDay;

        }
        else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() - 1);
          const tomorrowNight = new Date(tomorrow);
          if (new Date().getDate() == Number(item?.monthdate)) {
            return item;

          } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
            return item
          }

        }
      }
      if (item?.frequency === "Annually" && weekOffShow && holidayShow) {
        //Shift Basis 
        if (checkShiftTiming === "Morning" && item?.schedule === "Fixed" && weekOffShow) {
          const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
          const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
          return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);
        }
        else if (checkShiftTiming === "Evening" && item?.schedule === "Fixed" && weekOffShow) {

          const today = new Date();

          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() - 1);
          const tomorrowNight = new Date(tomorrow);

          if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
            return item;

          } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
            return item
          }

        }
        //Anytime Basis 
        else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time" && weekOffShow) {
          const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
          const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
          return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);

        }
        else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time" && weekOffShow) {
          const today = new Date();

          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() - 1);
          const tomorrowNight = new Date(tomorrow);

          if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
            return item;

          } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
            return item
          }
        }
      }
    }) : [];


    let final = priorityCheck.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]);
    const updatedAns1 = final.map(item => {
      const matchingItem = res_task_Schedule?.find(ansItem => ansItem._id === item._id);
      if (matchingItem) {
        return { ...item, weekdays: matchingItem.weekdays, };
      }
      return item;
    });

    const existingTasks = await TaskForUser.find({
      username: isUserRoleAccess?.companyname,
      taskdetails: "schedule",
      shiftEndTime: { $gte: new Date() }
    }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();


    // Filter updatedAns based on the existingTasks query
    let unique = updatedAns1?.filter(obj1 =>
      !existingTasks.some(obj2 =>
        obj1.category === obj2.category &&
        obj1.subcategory === obj2.subcategory &&
        obj1.frequency === obj2.frequency &&
        obj1.schedule === obj2.schedule
      )
    );

    // Query to fetch non-scheduled tasks
    let nonscheduledata = await TaskForUser.find({
      username: isUserRoleAccess.companyname,
      taskdetails: "nonschedule",
      taskdate: moment(new Date()).format("YYYY-MM-DD")
    },).lean();

    let uniqueElements = unique?.length > 0 ? unique : []
    const answerUserNonSchedule = nonscheduledata?.length ? nonscheduledata : []

    let nonschedule = userChecknonschedule?.filter(data => data?.employeenames?.includes(isUserRoleAccess?.companyname) && data?.date === moment(new Date()).format("YYYY-MM-DD"))
    let result = [];
    let answer = nonschedule?.length > 0 && nonschedule?.forEach(item => {
      item?.employeenames?.forEach(username => {
        let newItem = {
          category: String(item.category),
          subcategory: String(item.subcategory),
          taskdate: String(item.date),
          tasktime: String(item.time),
          type: String(item.type),
          orginalid: item._id,
          designation: item.designation,

          schedule: item.schedule,
          department: item.department,
          priority: item.priority,
          company: item.company,
          branch: item.branch,
          unit: item.unit,
          team: item.team,
          username: username,
          taskdetails: "nonschedule",
          duration: String(item.duration),
          breakupcount: String(item.breakupcount),
          breakup: item.breakup,
          required: item.required,
          taskstatus: "Assigned"
        };
        result.push(newItem);
      });
    });




    let uniqueElementsNonSchedule = result?.length > 0 ? result?.filter(obj1 => !answerUserNonSchedule?.some(obj2 =>
      obj1.category === obj2.category
      && obj1.subcat === obj2.subcat &&
      obj2?.taskdate === moment(new Date()).format("YYYY-MM-DD")
      && obj2.username === isUserRoleAccess?.companyname
      && obj2?.orginalid == obj1?.orginalid
      && obj2?.taskdetails === "nonschedule"
    )) : [];

    // Split the time range into start and end times
    const [startTimeStr, endTimeStr] = userShiftDetails?.split('-');

    // Parse start time
    const [startHourStr, startMinStr, startTimetype] = startTimeStr ? startTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
    let startHour = parseInt(startHourStr);
    const startMin = parseInt(startMinStr);

    // Parse end time
    const [endHourStr, endMinStr, endTimetype] = endTimeStr ? endTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
    let endHour = parseInt(endHourStr);
    const endMin = parseInt(endMinStr);

    // Create shift start and end objects
    const shiftStart = { hour: String(startHour)?.padStart(2, '0'), min: String(startMin).padStart(2, '0'), timetype: startTimetype };
    const shiftEnd = { hour: String(endHour)?.padStart(2, '0'), min: String(endMin).padStart(2, '0'), timetype: endTimetype };


    function findClosestElements(FromThis, shiftStart, shiftEnd) {
      const groupedElements = {};

      // Group elements by cate and subcate
      FromThis.forEach(element => {
        const key = element?.category + '-' + element?.subcategory + '-' + element?.frequency;
        if (!groupedElements[key]) {
          groupedElements[key] = [];
        }
        groupedElements[key].push(element);
      });

      // Filter out elements with the same cate and subcate and find the closest element
      const closestElements = [];
      for (const key in groupedElements) {
        const group = groupedElements[key];
        let closestTimeDiff = Infinity;
        let closestElement;
        group.forEach(element => {
          const time = element.timetodo[0];

          const timeString = `${time?.hour}:${time?.min} ${time?.timetype}`;

          const diff = getTimeDifference(timeString, shiftStart);
          // checkShiftTiming === "Evening" ? 

          const maximumCheck = diff >= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

          const maximumCheckEve = diff <= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

          if (diff >= 0 && diff < closestTimeDiff && (checkShiftTiming === "Evening" ? (maximumCheck || maximumCheckEve) : diff <= getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart))) {

            closestTimeDiff = diff;
            closestElement = element;
          }
        });
        if (closestElement) {
          closestElements.push(closestElement);
        } else {
          closestElements.push([]);
        }

      }
      return closestElements;
    }

    function getTimeDifference(time1, time2) {
      const date1 = new Date('2000-01-01 ' + time1);
      const date2 = new Date('2000-01-01 ' + time2.hour + ':' + time2.min + ' ' + time2.timetype);
      const shiftEndTime = new Date('2000-01-01 ' + shiftEnd.hour + ':' + shiftEnd.min + ' ' + shiftEnd.timetype);
      if (date1 < shiftEndTime && checkShiftTiming === "Evening") {
        return Math.abs((date1 - date2) / (1000 * 60));
      } else {
        return (date1 - date2) / (1000 * 60);
      }

    }

    const closestElements = findClosestElements(uniqueElements?.filter(data => data.schedule !== "Any Time"), shiftStart, shiftEnd);
    const answerClosest = closestElements?.some(data => Array.isArray(data));
    const closestFilter = answerClosest ? closestElements?.filter(data => data.length !== 0) : closestElements
    const removeDuplicates = (dataArray, filterArray) => {
      return dataArray.filter(item => {
        const found = filterArray.find(filterItem => (
          filterItem?.category === item?.category &&
          filterItem?.subcategory === item?.subcategory &&
          filterItem?.frequency === item?.frequency &&
          filterItem?.schedule === item?.schedule &&
          moment(new Date()).format("DD-MM-YYYY") === filterItem.taskassigneddate
        ));
        return !found;
      });
    };

    const tasksList = await taskSorted(isUserRoleAccess.companyname);
    const RemoveDuplicateClosest = removeDuplicates(closestFilter, tasksList || []);
    const removedLengthDuplicate = RemoveDuplicateClosest.filter(array => array.length > 0);
    const answerUnique = uniqueElements?.filter(data => data.schedule !== "Fixed")
    const filterTimeTodo = [...RemoveDuplicateClosest, ...answerUnique]
    const uniqueScheduleNonschedule = [...uniqueElementsNonSchedule, ...filterTimeTodo];
    if (calculatedTime) {
      const taskGenerateCombine = generateTaskCombine(userDuplicate, filterTimeTodo, calculatedTime, result);
      if (taskGenerateCombine?.length > 0) {
        let ataskforuser = await TaskForUser.insertMany(taskGenerateCombine);

      }
    }
    await exports.gettriggeredWhileClockInForTraining(req, res, next);
  } catch (err) {
    console.log(err, 'taskforuser-2075')
    return next(new ErrorHandler("Records not found!", 404));
  }

});


//to get pending task count
exports.gettriggeredWhileClockInForTraining = catchAsyncErrors(async (req, res, next) => {
  let trainingdetails;
  // let username = req.query.username;
  let { isUserRoleAccess, shifttiming, cin, cout, weekOffShow, holidayShow } = req?.body
  let userShiftDetails = await fetchUsers(req?.body?.isUserRoleAccess);
  let calculatedTime = userShiftDetails ? await updateTimeRange(userShiftDetails, cin, cout) : "00:00";
  let checkShiftTiming = await checkTimeRange(calculatedTime);
  try {
    trainingdetails = await TrainingDetails.find({ status: "Active" }, {
      trainingdetails: 1,
      category: 1,
      subcategory: 1,
      duration: 1,
      trainingdocuments: 1,
      estimationtimetraining: 1,
      estimationtraining: 1,
      mode: 1,
      taskassign: 1,
      required: 1,
      date: 1,
      status: 1,
      questioncount: 1,
      time: 1,
      deadlinedate: 1,
      frequency: 1,
      schedule: 1,
      weekdays: 1,
      typequestion: 1,
      monthdate: 1,
      annuday: 1,
      annumonth: 1,
      estimationtime: 1,
      estimation: 1,
      type: 1,
      designation: 1,
      department: 1,
      company: 1,
      branch: 1,
      unit: 1,
      team: 1,
      employeenames: 1,
      isOnlineTest: 1,
      testnames: 1,
      timetodo: 1,
      dueDateCheck: 1
    }).lean();
    const res_shift_User = await Shift.find().lean();

    const shiftUser = res_shift_User?.find(item => item.name === isUserRoleAccess.shifttiming)

    let taskStatusDep = trainingdetails?.filter(data => {
      if (data?.type === "Designation") {
        return data.designation?.includes(isUserRoleAccess?.designation)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
      if (data.type === "Department") {
        return data.department?.includes(isUserRoleAccess?.department)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))


      }
      if (data.type === "Employee") {
        return data.company?.includes(isUserRoleAccess?.company) && data.branch?.includes(isUserRoleAccess?.branch) && data.unit?.includes(isUserRoleAccess?.unit) && data.team?.includes(isUserRoleAccess?.team)
          && (data.employeenames?.includes(isUserRoleAccess?.companyname) || data?.employeenames?.includes('ALL'))
      }
    })


    let userTaskDesignation = taskStatusDep?.length > 0 ? taskStatusDep?.flatMap(data => data.employeenames) : []
    const DuplicateRemoval = [...new Set(userTaskDesignation)]
    const userDuplicate = DuplicateRemoval?.includes("ALL") ? [isUserRoleAccess?.companyname] : DuplicateRemoval?.filter(data => data === isUserRoleAccess?.companyname)

    const frequencyOrder = {
      Daily: 1,
      "Date wise": 2,
      "Day wise": 3,
      Weekly: 4,
      Monthly: 5,
      Annually: 6,
    };
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowNight = new Date(today);
    tomorrowNight.setDate(today.getDate() + 1);
    // const dayOfWeekTomorrow = tomorrow.toLocaleString('en-US', { weekday: 'long' });
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
    const currentDay = today.getDate();
    const dayOfMonth = today.getMonth() + 1;

    // Convert shift start and end times to 24-hour format
    tomorrowNight.setHours(shiftUser?.totime === 'AM' ? shiftUser?.tohour : Number(shiftUser?.tohour) + 12, shiftUser?.tomin, 0, 0);

    function addEstimationToDate(userDOJ, estimation) {
      // Split estimation into value and unit
      const [value, unit] = estimation.split("-");

      // Parse the value as a number
      const intValue = parseInt(value);

      // Create a new Date object based on user's date of joining
      const newUserDOJ = new Date(userDOJ);

      // Add the specified duration
      if (unit === "Month") {
        newUserDOJ.setMonth(newUserDOJ.getMonth() + intValue);
      } else if (unit === "Year") {
        newUserDOJ.setFullYear(newUserDOJ.getFullYear() + intValue);
      } else if (unit === "Days") {
        newUserDOJ.setDate(newUserDOJ.getDate() + intValue);
      }

      return newUserDOJ;
    }

    const updatedArray = taskStatusDep?.length > 0 ? taskStatusDep.map(item2 => {
      const matchingItem = taskStatusDep.find(item1 => {
        if (item1?.type === "Designation") {
          return item1?.designation?.includes(isUserRoleAccess?.designation) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL'))
        }
        if (item1?.type === "Department") {
          return item1?.department?.includes(isUserRoleAccess?.department) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL'))
        }
        if (item1?.type === "Employee") {
          return item1?.company?.includes(isUserRoleAccess?.company)
            && item1?.branch?.includes(isUserRoleAccess?.branch) &&
            item1?.unit?.includes(isUserRoleAccess?.unit) &&
            item1?.team?.includes(isUserRoleAccess?.team) &&
            (item1.employeenames?.includes(isUserRoleAccess?.companyname) || item1?.employeenames?.includes('ALL'))
        }
      })

      if (matchingItem) {
        const newDate = addEstimationToDate(isUserRoleAccess?.doj, `${item2.estimationtime}-${item2.estimation}`);
        return { ...item2, dueDateCheck: new Date() >= newDate, dueFromdate: newDate.toDateString() };
      }
    }) : [];

    let anstaskUserPanel = updatedArray?.length > 0 ? updatedArray?.filter(item => item !== undefined) : []

    const getNextDays = (currentDays) => {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return currentDays.map(currentDay => {
        const currentDayIndex = daysOfWeek.indexOf(currentDay);
        const nextDayIndex = (currentDayIndex + 1) % 7; // Ensure it wraps around to Sunday if needed
        return daysOfWeek[nextDayIndex];
      });
    };

    let priorityCheck = anstaskUserPanel?.length > 0 ? anstaskUserPanel?.filter((item) => {
      if (item?.required === "Mandatory" && item.dueDateCheck && weekOffShow && holidayShow && item.status === "Active") {
        if (item?.frequency === "Daily" && weekOffShow && holidayShow) {
          //Shift Basis 
          if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based" && weekOffShow) {
            return item;

          }
          else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based" && weekOffShow) {
            return item;
          }
          //Anytime Basis 
          else if (item?.schedule === "Any Time" && weekOffShow) {
            return item;

          }
        }
        if ((item?.frequency === "Day Wise" || item?.frequency === "Weekly" && weekOffShow && holidayShow)) {
          if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based") {

            return item?.weekdays?.includes(dayOfWeek);


          }
          else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based") {
            const dayOfWeekTomorrow = getNextDays(item?.weekdays);
            const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
            const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
            return item?.weekdays?.includes(dayOfWeek);
          }
          //Anytime Basis s
          else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {

            return item?.weekdays?.includes(dayOfWeek);


          }
          else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
            const dayOfWeekTomorrow = getNextDays(item?.weekdays);
            const ans = item?.weekdays?.push(...dayOfWeekTomorrow)
            const nightDays = [dayOfWeek, ...dayOfWeekTomorrow]
            return item?.weekdays?.includes(dayOfWeek);
          }

        }
        if (item?.frequency === "Monthly" || item?.frequency === "Date Wise" && weekOffShow && holidayShow) {
          //Shift Basis 
          if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based") {
            const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
            return item?.monthdate == formattedDay;

          }
          else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based") {
            const today = new Date();


            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() - 1);
            const tomorrowNight = new Date(tomorrow);
            if (new Date().getDate() == Number(item?.monthdate)) {
              return item;

            } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
              return item
            }

          }
          //Anytime Basis 
          else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time") {
            const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
            return item?.monthdate == formattedDay;

          }
          else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time") {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() - 1);
            const tomorrowNight = new Date(tomorrow);
            if (new Date().getDate() == Number(item?.monthdate)) {
              return item;

            } else if (tomorrowNight.getDate() == Number(item?.monthdate)) {
              return item
            }

          }
        }
        if (item?.frequency === "Annually" && weekOffShow && holidayShow) {
          //Shift Basis 
          if (checkShiftTiming === "Morning" && item?.schedule === "Time-Based" && weekOffShow) {
            const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
            const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
            return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);
          }
          else if (checkShiftTiming === "Evening" && item?.schedule === "Time-Based" && weekOffShow) {

            const today = new Date();

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() - 1);
            const tomorrowNight = new Date(tomorrow);

            if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
              return item;

            } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
              return item
            }

          }
          //Anytime Basis 
          else if ((checkShiftTiming === "Morning" || checkShiftTiming === "Morning False") && item?.schedule === "Any Time" && weekOffShow) {
            const formattedDay = Number(currentDay) < 10 ? `0${currentDay}` : currentDay;
            const formattedMonth = Number(dayOfMonth) < 10 ? `0${dayOfMonth}` : dayOfMonth;
            return Number(item?.annumonth) == Number(formattedMonth) && Number(item?.annuday) == Number(formattedDay);

          }
          else if ((checkShiftTiming === "Evening" || checkShiftTiming === "Evening False") && item?.schedule === "Any Time" && weekOffShow) {
            const today = new Date();

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() - 1);
            const tomorrowNight = new Date(tomorrow);

            if (new Date().getDate() == Number(item?.annuday) && new Date().getMonth() + 1 == Number(item?.annumonth)) {
              return item;

            } else if (tomorrowNight.getDate() == Number(item?.annuday) && tomorrowNight.getMonth() + 1 == Number(item?.annumonth)) {
              return item
            }
          }
        }
      } if (item?.required === "NonSchedule" && weekOffShow && holidayShow && item.status === "Active") {
        const NonSchedule = new Date();
        const locateDateDead = new Date(item.deadlinedate);

        return NonSchedule <= locateDateDead
      }
      if (item?.required === "Schedule" && weekOffShow && holidayShow && item.status === "Active") {
        const todayDateCheck = moment(new Date()).format("DD-MM-YYYY");
        const locateDate = moment(new Date(item.date)).format("DD-MM-YYYY");
        return todayDateCheck === locateDate

      }


    }) : [];
    let final = priorityCheck.sort((a, b) => frequencyOrder[a.frequency] - frequencyOrder[b.frequency]);


    const updatedAns1 = final.map(item => {
      const matchingItem = trainingdetails?.find(ansItem => ansItem._id === item._id);
      if (matchingItem) {
        return { ...item, weekdays: matchingItem.weekdays, };
      }
      return item;
    });

    const existingTasks = await TrainingForUser.find({
      username: isUserRoleAccess?.companyname,
      shiftEndTime: { $gte: new Date() }
    }).lean();


    const existingTasksFinal = await TrainingForUser.find({
      username: isUserRoleAccess?.companyname,
      status: "Active",
      shiftEndTime: { $gte: new Date() }
    })?.lean();


    // Filter updatedAns1 based on the existingTasks query
    let unique = updatedAns1?.filter(obj1 => {
      return obj1.required === "Mandatory" ? !existingTasks?.some(obj2 =>
        obj2.required?.includes(obj1.required)
        && obj1.frequency === obj2.frequency
        && obj1.schedule === obj2.schedule
        && obj1.trainingdetails === obj2.trainingdetails
        && new Date() <= new Date(obj2.shiftEndTime) && obj2?.taskdetails === "Mandatory")
        :
        !existingTasks?.some(obj2 =>
          obj1.trainingdetails === obj2.trainingdetails
          &&
          obj2.required?.includes(obj1.required)
          && new Date() <= new Date(obj2.shiftEndTime))
    }
    );


    let userStatus = final?.length > 0 ? final?.filter(item2 => {
      const matchingItem = existingTasksFinal?.find(data1 =>
        ["Completed", "Finished By Others", "Not Applicable to Me"]?.includes(data1?.taskstatus))

      if (matchingItem?.orginalid !== item2._id) {
        return item2; // Include this item in the filtered array
      }
    }) : [];

    let uniqueElements = unique?.length > 0 ? unique : []
    // Split the time range into start and end times
    const [startTimeStr, endTimeStr] = userShiftDetails?.split('-');
    // Parse start time
    const [startHourStr, startMinStr, startTimetype] = startTimeStr ? startTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
    let startHour = parseInt(startHourStr);
    const startMin = parseInt(startMinStr);

    // Parse end time
    const [endHourStr, endMinStr, endTimetype] = endTimeStr ? endTimeStr?.split(/:|(?=[AP]M)/) : ""; // Split by colon or lookahead for AM/PM
    let endHour = parseInt(endHourStr);
    const endMin = parseInt(endMinStr);

    // Create shift start and end objects
    const shiftStart = { hour: String(startHour)?.padStart(2, '0'), min: String(startMin).padStart(2, '0'), timetype: startTimetype };
    const shiftEnd = { hour: String(endHour)?.padStart(2, '0'), min: String(endMin).padStart(2, '0'), timetype: endTimetype };


    function findClosestElements(FromThis, shiftStart, shiftEnd) {
      const groupedElements = {};

      // Group elements by cate and subcate
      FromThis.forEach(element => {
        const key = element?.category + '-' + element?.subcategory + '-' + element?.frequency;
        if (!groupedElements[key]) {
          groupedElements[key] = [];
        }
        groupedElements[key].push(element);
      });

      // Filter out elements with the same cate and subcate and find the closest element
      const closestElements = [];
      for (const key in groupedElements) {
        const group = groupedElements[key];
        let closestTimeDiff = Infinity;
        let closestElement;
        group.forEach(element => {
          const time = element.timetodo[0];

          const timeString = `${time?.hour}:${time?.min} ${time?.timetype}`;

          const diff = getTimeDifference(timeString, shiftStart);
          // checkShiftTiming === "Evening" ? 

          const maximumCheck = diff >= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

          const maximumCheckEve = diff <= (Math?.abs(getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart)))

          if (diff >= 0 && diff < closestTimeDiff && (checkShiftTiming === "Evening" ? (maximumCheck || maximumCheckEve) : diff <= getTimeDifference(`${shiftEnd?.hour}:${shiftEnd?.min} ${shiftEnd?.timetype}`, shiftStart))) {

            closestTimeDiff = diff;
            closestElement = element;
          }
        });
        if (closestElement) {
          closestElements.push(closestElement);
        } else {
          closestElements.push([]);
        }

      }
      return closestElements;
    }

    function getTimeDifference(time1, time2) {
      const date1 = new Date('2000-01-01 ' + time1);
      const date2 = new Date('2000-01-01 ' + time2.hour + ':' + time2.min + ' ' + time2.timetype);
      const shiftEndTime = new Date('2000-01-01 ' + shiftEnd.hour + ':' + shiftEnd.min + ' ' + shiftEnd.timetype);
      if (date1 < shiftEndTime && checkShiftTiming === "Evening") {
        return Math.abs((date1 - date2) / (1000 * 60));
      } else {
        return (date1 - date2) / (1000 * 60);
      }

    }

    const closestElements = findClosestElements(uniqueElements?.filter(data => data.schedule !== "Any Time"), shiftStart, shiftEnd);
    const answerClosest = closestElements?.some(data => Array.isArray(data));
    const closestFilter = answerClosest ? closestElements?.filter(data => data.length !== 0) : closestElements
    const removeDuplicates = (dataArray, filterArray) => {
      return dataArray.filter(item => {
        const found = filterArray.find(filterItem => (
          filterItem?.required.includes(item?.required) &&
          filterItem?.trainingdetails === item?.trainingdetails &&
          filterItem?.frequency === item?.frequency &&
          filterItem?.schedule === item?.schedule &&
          moment(new Date()).format("DD-MM-YYYY") === filterItem.taskassigneddate
        ));
        return !found;
      });
    };

    const trainingList = await trainingSorterd(isUserRoleAccess.companyname);
    const RemoveDuplicateClosest = removeDuplicates(closestFilter, trainingList || []);
    const removedLengthDuplicate = RemoveDuplicateClosest.filter(array => array.length > 0);
    const answerUnique = uniqueElements?.filter(data => data.schedule !== "Time-Based")
    const filterTimeTodo = [...RemoveDuplicateClosest, ...answerUnique]
    if (calculatedTime) {
      const trainingGenerateCombine = generateTrainingCombine(userDuplicate, filterTimeTodo, calculatedTime);
      if (trainingGenerateCombine?.length > 0) {
        let ataskforuser = await TrainingForUser.insertMany(trainingGenerateCombine);

      }
    }
    return res.status(200).json({
      count: 'executed'
    });
  } catch (err) {
    console.log(err?.message, 'taskforuser-1718')
    return next(new ErrorHandler("Records not found!", 404));
  }

});


const generateTaskCombine = (userPostCall, CheckExtraTasksSchedule, calculatedTime, result) => {
  let ans = [];
  let ansnonschedule = [];
  const split = calculatedTime?.split("-")
  const shiftEndTime = addFutureTimeToCurrentTime(split[1])
  const parsedDate = new Date(shiftEndTime);
  // Convert to ISO 8601 format
  const isoDate = parsedDate.toISOString();
  userPostCall.forEach((employeeName) => {
    CheckExtraTasksSchedule.forEach((category) => {
      ans.push({
        category: category.category,
        username: employeeName,
        subcategory: category.subcategory,
        priority: category.priority,
        timetodo: category?.timetodo?.length > 0 ? category?.timetodo : [],
        monthdate: category?.timetodo ? category.monthdate : "",
        weekdays: category?.weekdays?.length > 0 ? category?.weekdays : [],
        annumonth: category.annuday ? category.annuday : "",
        annuday: category.annumonth ? category.annumonth : "",
        schedule: String(category.schedule),
        frequency: String(category.frequency),
        duration: String(category.duration),
        taskassign: String(category.taskassign),
        assignId: String(category.assignId),
        breakupcount: String(category.breakupcount),
        breakup: category?.breakup,
        required: category?.required,
        description: category?.description ? category?.description : "",
        documentfiles: category?.documentfiles ? category?.documentfiles : "",
        orginalid: category?._id ? category?._id : category?.orginalid,
        taskstatus: "Assigned",
        created: new Date().toISOString(),
        shiftEndTime: isoDate,
        taskdetails: "schedule",
        taskassigneddate: moment(new Date()).format("DD-MM-YYYY"),
        formattedDate: new Date(),

      });
    });
  });


  result.forEach((data) => {
    ansnonschedule.push({
      category: String(data.category),
      subcategory: String(data.subcategory),
      username: data?.username,
      frequency: "",
      description: "",
      duration: String(data.duration),
      orginalid: data.orginalid,
      taskdate: moment(data?.taskdate).format("YYYY-MM-DD"),
      tasktime: String(data.tasktime),
      breakupcount: String(data.breakupcount),
      breakup: data?.breakup,
      schedule: String(data.schedule),
      required: data?.required,
      priority: String(data.priority),
      taskstatus: "Assigned",
      created: new Date().toISOString(),
      shiftEndTime: isoDate,
      taskdetails: data?.taskdetails,
      taskassigneddate: moment(new Date()).format("DD-MM-YYYY"),
      formattedDate: new Date(),

    });
  });

  return [...ans, ...ansnonschedule];
}
const generateTrainingCombine = (userPostCall, CheckExtraTasksSchedule, calculatedTime) => {
  let ans = [];
  let ansnonschedule = [];
  const split = calculatedTime?.split("-")
  const shiftEndTime = addFutureTimeToCurrentTime(split[1])
  const parsedDate = new Date(shiftEndTime);
  // Convert to ISO 8601 format
  const isoDate = parsedDate.toISOString();
  userPostCall.forEach((employeeName) => {
    CheckExtraTasksSchedule.forEach((category) => {
      ans.push({
        category: category.category,
        trainingdetails: category.trainingdetails,
        username: employeeName,
        subcategory: category.subcategory,
        trainingdocuments: category.trainingdocuments,
        estimationtimetraining: category.estimationtimetraining,
        estimationtraining: category.estimationtraining,
        estimationtime: category.estimationtime,
        estimation: category.estimation,
        taskassign: String(category.taskassign),
        assignId: String(category._id),
        documentslist: category.documentslist,
        timetodo: category?.timetodo?.length > 0 ? category?.timetodo : [],
        monthdate: category?.timetodo ? category.monthdate : "",
        weekdays: category?.weekdays?.length > 0 ? category?.weekdays : [],
        annumonth: category.annuday ? category.annuday : "",
        annuday: category.annumonth ? category.annumonth : "",
        schedule: String(category.schedule),
        isOnlineTest: String(category.isOnlineTest),
        testnames: String(category.testnames),
        dueDateCheck: category.dueDateCheck ? category.dueDateCheck : "",
        mode: category.mode ? category.mode : "",
        questioncount: category.questioncount ? category.questioncount : "",
        typequestion: category.typequestion ? category.typequestion : "",
        dueFromdate: category.dueFromdate ? category.dueFromdate : "",
        frequency: String(category.frequency) ? category?.frequency : "",
        duration: String(category.duration) ? category?.duration : "",
        required: category?.required ? category?.required : [],
        documentfiles: category?.documentfiles ? category?.documentfiles : "",
        orginalid: category?._id ? category?._id : category?.orginalid,
        taskstatus: "Assigned",
        typeofpage: "Training",
        created: new Date().toISOString(),
        shiftEndTime: isoDate,
        taskassigneddate: moment(new Date()).format("DD-MM-YYYY"),
        formattedDate: new Date(),
        endtraining: category?.endtraining ? category?.endtraining : "",
        taskdetails: category?.required,
      });
    });
  });


  return ans;
}


const convertTo24HourFormat = (time) => {
  let [hours, minutes] = time?.slice(0, -2).split(":");
  hours = parseInt(hours, 10);
  if (time.slice(-2) === "PM" && hours !== 12) {
    hours += 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};


const fetchUsers = async (isUserRoleAccess) => {

  try {
    const newcurrentTime = new Date();
    const currentHour = newcurrentTime.getHours();
    const currentMinute = newcurrentTime.getMinutes();
    const period = currentHour >= 12 ? 'PM' : 'AM';
    const mainShiftTiming = isUserRoleAccess?.mainshifttiming?.split('-');
    const secondShiftTiming = isUserRoleAccess?.issecondshift ? isUserRoleAccess?.secondshifttiming?.split('-') : "";
    const secondShiftStart = isUserRoleAccess?.issecondshift ? secondShiftTiming[0]?.split(':') : "";
    const secondShiftEnd = isUserRoleAccess?.issecondshift ? secondShiftTiming[1].split(':') : "";
    const secondShiftStartHour = isUserRoleAccess?.issecondshift ? parseInt(convertTo24HourFormat(secondShiftTiming[0]), 10) : "";
    const secondShiftStartMinute = isUserRoleAccess?.issecondshift ? parseInt(secondShiftStart[1]?.slice(0, 2), 10) : "";
    const secondShiftStartPeriod = isUserRoleAccess?.issecondshift ? secondShiftStart[1]?.slice(2) : "";

    const secondShiftEndHour = isUserRoleAccess?.issecondshift ? parseInt(convertTo24HourFormat(secondShiftTiming[1]), 10) : "";
    const secondShiftEndMinute = isUserRoleAccess?.issecondshift ? parseInt(secondShiftEnd[1]?.slice(0, 2), 10) : "";
    const secondShiftEndPeriod = isUserRoleAccess?.issecondshift ? secondShiftEnd[1]?.slice(2) : "";

    const isInSecondShift =
      ((currentHour > secondShiftStartHour || (currentHour === secondShiftStartHour && currentMinute >= secondShiftStartMinute)) &&
        (currentHour < secondShiftEndHour || (currentHour === secondShiftEndHour && currentMinute <= secondShiftEndMinute))) &&
      period === secondShiftStartPeriod;

    const isNtgInSecondShift =
      ((currentHour > secondShiftStartHour || (currentHour === secondShiftStartHour && currentMinute >= secondShiftStartMinute))) &&
      period === secondShiftStartPeriod;

    if (mainShiftTiming[0]?.includes("PM") && mainShiftTiming[1]?.includes("AM")) {
      if (isUserRoleAccess?.issecondshift && isInSecondShift) {

        const regularshift = isUserRoleAccess?.secondshifttiming;
        return regularshift;
      } else {
        const regularshift = isUserRoleAccess?.mainshifttiming;
        return regularshift
      }
    } else {
      if (isUserRoleAccess?.issecondshift && isInSecondShift) {
        const regularshift = isUserRoleAccess?.secondshifttiming;
        return regularshift
      } else {

        const regularshift = isUserRoleAccess?.mainshifttiming;
        return regularshift
      }
    }
  }
  catch (err) {
    console.log(err?.message, 'err - 1824')
  }
}

const updateTimeRange = async (e, cin, cout) => {

  try {
    const [startTimes, endTimes] = e.split("-");
    // Convert start time to 24-hour format
    const convertedStartTime = await convertTo24HourFormat(startTimes);
    // Convert end time to 24-hour format
    const convertedEndTime = await convertTo24HourFormat(endTimes);
    const start = convertedStartTime;
    const end = convertedEndTime;
    // Convert start time to 24-hour format
    let [startHour, startMinute] = start?.slice(0, -2).split(":");

    startHour = parseInt(startHour, 10);

    // Convert end time to 24-hour format
    let [endHour, endMinute] = end?.slice(0, -2).split(":");
    endHour = parseInt(endHour, 10);
    // Add hours from startTime and endTime
    startHour -= cin ? Number(cin) : 0;
    endHour += cout ? Number(cout) : 0;

    // Format the new start and end times
    const newStart = `${String(startHour).padStart(
      2,
      "0"
    )}:${startMinute}${start.slice(-2)}`;

    const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end.slice(
      -2
    )}`;

    return `${newStart} - ${newEnd}`;
  } catch (err) {
    console.log(err?.message, 'err')
  }
};

function addFutureTimeToCurrentTime(futureTime) {
  // Parse the future time string into hours and minutes
  const [futureHours, futureMinutes] = futureTime.split(":").map(Number);

  // Get the current time
  const currentTime = new Date();

  // Get the current date
  const currentDate = currentTime.getDate();

  // Get the current hours and minutes
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Calculate the time difference
  let timeDifferenceHours = futureHours - currentHours;
  let timeDifferenceMinutes = futureMinutes - currentMinutes;

  // Adjust for negative time difference
  if (timeDifferenceMinutes < 0) {
    timeDifferenceHours--;
    timeDifferenceMinutes += 60;
  }

  // Check if the future time falls on the next day
  if (timeDifferenceHours < 0) {
    // Add 1 day to the current date
    currentTime.setDate(currentDate + 1);
    timeDifferenceHours += 24;
  }

  // Create a new Date object by adding the time difference to the current time
  const newDate = new Date();
  newDate.setHours(newDate.getHours() + timeDifferenceHours);
  newDate.setMinutes(newDate.getMinutes() + timeDifferenceMinutes);

  return newDate;
}


const checkTimeRange = async (e) => {
  try {


    // Get current time
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const [startTime, endTime] = e.split(" - ");

    // Parse start time
    const [startHour, startMinute] = startTime.split(":").map(Number);

    // Parse end time
    const [endHour, endMinute] = endTime.split(":").map(Number);

    if (
      startHour < endHour ||
      (startHour === endHour && startMinute <= endMinute)
    ) {
      // Shift falls within the same day Shift
      if (
        (currentHour > startHour ||
          (currentHour === startHour && currentMinute >= startMinute)) &&
        (currentHour < endHour ||
          (currentHour === endHour && currentMinute <= endMinute))
      ) {
        return "Morning"
      } else {
        return "Morning False"
      }
    }
    //Night Shift
    else {
      if (
        currentHour > startHour ||
        (currentHour === startHour && currentMinute >= startMinute) ||
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute)
      ) {
        return "Evening"
      } else {
        return "Evening False"
      }
    }
  }
  catch (err) {
    console.log(err.message)
  }
};





// update TaskForUser multer by id => /api/taskforuser/:id
exports.updateMulterTaskForUser = [
  upload.single('file'), // Accept a single file with the field name 'file'
  catchAsyncErrors(async (req, res, next) => {
    try {
      const id = req.params.id;

      // File info
      const document = req.file
        ? {
          name: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        }
        : null;
      const index = parseInt(req.body.index);

      // Parse the incoming tableFormat (an array of tasks)
      let parsedTableFormat = [];
      if (req.body.tableFormat) {
        try {
          parsedTableFormat = JSON.parse(req.body.tableFormat);
        } catch (error) {
          return res.status(400).json({ message: "Invalid tableFormat JSON" });
        }
      }

      const taskDoc = await TaskForUser.findById(id);
      if (!taskDoc) {
        return next(new ErrorHandler("Data not found!", 404));
      }

      // Ensure tableFormat is initialized
      if (!Array.isArray(taskDoc.tableFormat)) {
        taskDoc.tableFormat = [];
      }

      if (taskDoc.tableFormat.length === 0) {
        // Add files to the object at the specified index in parsedTableFormat
        if (parsedTableFormat[index]) {
          parsedTableFormat[index].files = document || [];
        }

        // Push the whole array to taskDoc.tableFormat
        taskDoc.tableFormat = [...parsedTableFormat];
      } else {
        // If data exists, just update files at that index
        if (taskDoc.tableFormat[index]) {
          taskDoc.tableFormat[index].files = document || [];
          taskDoc.tableFormat[index].reason = parsedTableFormat[index].reason || "";
          taskDoc.tableFormat[index].status = parsedTableFormat[index].status || "";
        } else {
          return res.status(400).json({ message: `No entry found at index ${index} in existing tableFormat` });
        }
      }

      // Save the updated task
      await taskDoc.save();

      return res.status(200).json({
        message: "Updated successfully",
        data: taskDoc,
      });

    } catch (err) {
      console.log(err, 'rr')
      return next(new ErrorHandler("Error updating document!", 500));
    }
  }),
];




function formatToDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}
// While Clicking Completed => Check whether there is page wise pending task 
exports.getPagWisePendingtaskWhileCompleting = catchAsyncErrors(async (req, res, next) => {
  const { completedby, completeddate, subcategory, taskdetails, shift } = req?.body;
  let finalValue, ebReadingDetails, status = false, redirection = false;
  try {
    let query = {};
    const { fromDate, toDate } = getFromToDateFromShift(shift, completeddate);
    const taskStatusResult = await TaskForUser?.find({ taskassign: "Team", assignId: taskdetails?.assignId, taskstatus: "Completed" })?.lean();
    if (taskStatusResult?.length > 0) {
      status = true;
      redirection = true
    } else {
      const subCatModules = await Tasksubcategory.findOne({ subcategoryname: subcategory }, { updatedby: 0, addedby: 0 });
      const userDetails = await User.findOne({ companyname: completedby }, { companyname: 1, company: 1, branch: 1, unit: 1, team: 1, empcode: 1, floor: 1, area: 1 });
      if (taskdetails.schedule === "Fixed") {
        const completedTimeOnly = moment(completeddate).format("HH:mm");
        console.log(completedTimeOnly, "completedTimeOnly")
        query.usercompany = userDetails?.company;
        query.userbranch = userDetails?.branch;
        query.userunit = userDetails?.unit;
        query.userteam = userDetails?.team;
        query.usercompanyname = completedby;
        query.date = formatToDDMMYYYY(taskdetails?.taskassigneddate);
      }
      else if (taskdetails.schedule === "Any Time") {
        query.usercompany = userDetails?.company;
        query.userbranch = userDetails?.branch;
        query.userunit = userDetails?.unit;
        query.userteam = userDetails?.team;
        query.usercompanyname = completedby;
        query.date = formatToDDMMYYYY(taskdetails?.taskassigneddate);
      }
      if (subCatModules) {
        finalValue =
          subCatModules.subsubpage?.trim() ||
          subCatModules.subpage?.trim() ||
          subCatModules.mainpage?.trim() ||
          subCatModules.submodule?.trim() ||
          subCatModules.module?.trim() ||
          null;
      }

      if (finalValue === "EB Reading Details") {

        const baseMatch = {
          usercompany: query?.usercompany,
          userbranch: query?.userbranch,
          userunit: query?.userunit,
          userteam: query?.userteam,
          usercompanyname: completedby,
          date: formatToDDMMYYYY(taskdetails?.taskassigneddate),
        };
        let ebReadingDetailscount = [];
        if (taskdetails.schedule === "Fixed") {
          ebReadingDetailscount = await Ebreadingdetails.aggregate([
            { $match: baseMatch },
            {
              $addFields: {
                combinedDateTime: {
                  $dateFromString: {
                    dateString: {
                      $concat: [
                        "$date",
                        "T",
                        { $ifNull: ["$time", "00:00"] },
                        ":00"
                      ]
                    },
                    timezone: "Asia/Kolkata"
                  }
                }
              }
            },
            {
              $match: {
                combinedDateTime: {
                  $gte: new Date(fromDate),
                  $lte: new Date(toDate)
                }
              }
            }
          ]);
        } else if (taskdetails.schedule === "Any Time") {
          ebReadingDetailscount = await Ebreadingdetails.aggregate([
            { $match: baseMatch }
          ]);
        }

        ebReadingDetails = ebReadingDetailscount?.length;


        redirection = ebReadingDetails !== 0;
        status = ebReadingDetails !== 0;
      } else {
        redirection = true
        status = true
      }
    }

  } catch (err) {
    console.log(err)
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // status: 
    status, finalValue, redirection
  });
});
exports.getUsersTaskBasedOnPageModules = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  try {
    const pagename = req?.body?.pagename;
    const userDetails = req?.body?.userobject;
    taskforuser = await TaskForUser.aggregate([
      {
        $match: {
          taskstatus: { $in: ["Pending", "Paused", "Assigned"] },
          username: userDetails?.companyname
        }
      },
      {
        $lookup: {
          from: "tasksubcategories", // your Tasksubcategory collection (check actual name in DB)
          let: {
            category: "$category",
            subcategory: "$subcategory"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        { $eq: ["$module", pagename] },
                        { $eq: ["$submodule", pagename] },
                        { $eq: ["$mainpage", pagename] },
                        { $eq: ["$subpage", pagename] },
                        { $eq: ["$subsubpage", pagename] }
                      ]
                    },
                    { $eq: ["$category", "$$category"] },
                    { $eq: ["$subcategoryname", "$$subcategory"] }
                  ]
                }
              }
            }
          ],
          as: "matchedSubcat"
        }
      },
      {
        $match: {
          matchedSubcat: { $ne: [] } // only keep TaskForUsers that matched category/subcategory in subcategory doc
        }
      },
      {
        $project: {
          matchedSubcat: 0 // optional: remove the lookup result if not needed
        }
      }
    ]);


    console.log(taskforuser?.length, 'result')

  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    taskforuser
  });
});
exports.UpdateTaskForUserAsCompleted = catchAsyncErrors(async (req, res, next) => {
  const { _id, taskassign, assignId, username } = req.body.userdata;
  let staskforuser, gtaskforuser;
  const updateDetails = {
    taskstatus: "Completed",
    state: "paused",
    completedbyuser: username
  }
  if (taskassign === "Individual") {
    staskforuser = await TaskForUser.findByIdAndUpdate(_id, updateDetails);
  } else {
    gtaskforuser = await TaskForUser.updateMany(
      { taskassign, assignId },
      { $set: updateDetails }
    );
  }
  console.log(_id, "Id ", gtaskforuser?.length, "staskforuser")
  return res.status(200).json({ message: "Updated successfully" });
});
exports.getAllTaskForUserAssignIdTeamCheck = catchAsyncErrors(async (req, res, next) => {
  let taskforuser = false;
  let assignid = req.body.assignId
  let orginalid = req.body.orginalid
  try {
    const task = await TaskForUser.find({ assignId: assignid, orginalid: orginalid, taskassign: "Team", taskstatus: "Completed" }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
    taskforuser = task?.length > 0 ? true : false

  } catch (err) {
    return next(new ErrorHandler("Records not found", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser
  });
});
exports.getAllTaskForUserAssignId = catchAsyncErrors(async (req, res, next) => {
  let taskforuser;
  let assignid = req.body.assignId
  let orginalid = req.body.orginalid
  try {
    const task = await TaskForUser.find({ assignId: assignid, orginalid: orginalid, taskassign: "Team", taskstatus: { $ne: "Completed" } }, { category: 1, subcategory: 1, frequency: 1, schedule: 1, username: 1, date: 1, shiftEndTime: 1, taskdetails: 1, taskstatus: 1, taskassigneddate: 1, timetodo: 1, taskdate: 1, taskassign: 1, assignId: 1, monthdate: 1, weekdays: 1, annumonth: 1, duration: 1, priority: 1 }).lean();
    taskforuser = task?.filter(data => data?.username !== req.body.username)

  } catch (err) {
    return next(new ErrorHandler("Records not found", 404));
  }
  return res.status(200).json({
    // count: products.length,
    taskforuser
  });
});