const ClientUserID = require("../../../model/modules/production/ClientUserIDModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const moment = require("moment");

// get All ClientUserID Name => /api/clientuserids
exports.getAllClientUserID = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    clientuserid = await ClientUserID.find({},{userid:1, empname:1, empcode:1, loginallotlog:1,projectvendor:1});
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!clientuserid) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});

exports.getClientUserSort = catchAsyncErrors(async (req, res, next) => {
  let totalProjects, result, totalPages, currentPage;

  const { page, pageSize } = req.body;
  try {

      totalProjects = await ClientUserID.countDocuments();

      result = await ClientUserID.find()
          .skip((page - 1) * pageSize)
          .limit(parseInt(pageSize));

  } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
      totalProjects,
      result,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
  });
});


exports.getAllClientUserCheck = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;

  let user = req.body.empname;
  try {
    clientuserid = await ClientUserID.find({empname : user?.companyname});
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!clientuserid) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});



// get All ClientUserID Name => /api/clientuserids
exports.getLoginAllotidDetails = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    clientuserid = await ClientUserID.find({empname:req.body.name, date:{$gte:req.body.date}}, {_id:0, userid:1});
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!clientuserid) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});

// get All ClientUserID Name => /api/clientuserids
exports.getAllClientUserIDData = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    clientuserid = await ClientUserID.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!clientuserid) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});

// get All ClientUserID Name => /api/clientuserids
exports.getAllClientUserIDLimited = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    clientuserid = await ClientUserID.find({},{userid:1, empname:1, empcode:1, loginallotlog:1});
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!clientuserid) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});
// Create new ClientUserID=> /api/clientuserid/new
exports.addClientUserID = catchAsyncErrors(async (req, res, next) => {
  let aclientuserid = await ClientUserID.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ClientUserID => /api/clientuserid/:id
exports.getSingleClientUserID = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sclientuserid = await ClientUserID.findById(id);

  if (!sclientuserid) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }
  return res.status(200).json({
    sclientuserid,
  });
});

// update ClientUserID by id => /api/clientuserid/:id
exports.updateClientUserID = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  // Find the document first
  let clientUser = await ClientUserID.findById(id);
  if (!clientUser) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }

  // If updatelastlog exists, update the last log's enddate
  if (req.body.updatelastlog) {
    if (clientUser.loginallotlog && clientUser.loginallotlog.length > 0) {
      clientUser.loginallotlog[clientUser.loginallotlog.length - 1].enddate =
        moment().format("YYYY-MM-DD");
    }
  }

  // Update other fields from req.body (excluding updatelastlog)
  Object.keys(req.body).forEach((key) => {
    if (key !== "updatelastlog") {
      clientUser[key] = req.body[key];
    }
  });

  // Save the updated document
  await clientUser.save();

  return res.status(200).json({ message: "Updated successfully" });
});

// delete ClientUserID by id => /api/clientuserid/:id
exports.deleteClientUserID = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dclientuserid = await ClientUserID.findByIdAndRemove(id);

  if (!dclientuserid) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});



//update loginallotlog log
exports.updateLoginAllotLogValues = catchAsyncErrors(async (req, res, next) => {
  const { logid, logname } = req.query;
  const updateFields = req.body;

  try {
    const query = {};
    query[`${logname}._id`] = logid;

    const updateObj = { $set: {} };
    for (const key in updateFields) {
      updateObj.$set[`${logname}.$.${key}`] = updateFields[key];
    }

    const uploaddata = await ClientUserID.findOneAndUpdate(query, updateObj, {
      new: true,
    });

    if (uploaddata) {
      return res
        .status(200)
        .json({ message: "Updated successfully", succcess: true });
    } else {
      return next(new ErrorHandler("Something went wrong", 500));
    }
  } catch (err) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

//delete loginallotlog log
exports.deleteLoginAllotLog = catchAsyncErrors(async (req, res, next) => {
  const { logid, logname, mainid } = req.query;
  try {
    const query = {};
    query[`${logname}._id`] = logid;

    const update = {
      $pull: {
        [logname]: { _id: logid },
      },
    };

    const deletedata = await ClientUserID.findOneAndUpdate(query, update, {
      new: true,
    });

    if (deletedata) {
      // Check the length of the loginallotlog array
      const loginallotlog = deletedata.loginallotlog || [];
      let externalUpdate;
      if (loginallotlog.length === 0) {
        // If the array is empty, set fields to empty values and update allotted status
        externalUpdate = {
          company: "",
          branch: "",
          unit: "",
          team: "",
          empname: "",
          empcode: "",
          date: "",
          time: "",
          allotted: "unallotted",
        };
      } else {
        // If the array is not empty, use the last item's values
        const lastItem = loginallotlog[loginallotlog.length - 1];
        externalUpdate = {
          company: lastItem.company,
          branch: lastItem.branch,
          unit: lastItem.unit,
          team: lastItem.team,
          empname: lastItem.empname,
          empcode: lastItem.empcode,
          date: lastItem.date,
          time: lastItem.time,
          allotted: "allotted",
        };
      }
      // Update the external fields in the document using mainid
      await ClientUserID.findByIdAndUpdate(mainid, { $set: externalUpdate });

      return res
        .status(200)
        .json({ message: "Deleted successfully", success: true });
    } else {
      return next(new ErrorHandler("Something went wrong", 500));
    }
  } catch (err) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

exports.resetClientUserIdData = catchAsyncErrors(async (req, res, next) => {
  const { empname, empcode } = req.query;
  try {
    // Find the documents that match the given empname and empcode
    const updatedData = await ClientUserID.updateMany(
      { empname, empcode },
      {
        $set: {
          company: "",
          branch: "",
          unit: "",
          team: "",
          empname: "",
          empcode: "",
          date: "",
          time: "",
          allotted: "unallotted",
        },
      }
    );

    res.status(200).json({
      message: `${updatedData.nModified} records updated successfully`,
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

// get All ClientUserID Name => /api/clientuserids
exports.clientUseridsReportIdsOnly = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    clientuserid = await ClientUserID.find({}, { userid: 1, projectvendor: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Data not found", 404));
  }
  // if (!clientuserid) {
  //   return next(new ErrorHandler("Client User ID not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});
exports.clientUseridsLimitedUserOLD = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
  
    clientuserid = await ClientUserID.aggregate([
      { $unwind: '$loginallotlog' }, // Unwind the array for individual log processing
      {
        $sort: {
         // userid: 1,
          'loginallotlog.date': 1,
          'loginallotlog.time': 1, // Sort by date and time ascending
        },
      },
    
      {
        $group: {
          _id:{ userid:'$userid', projectvendor:'$projectvendor'},

          logs: { $push: '$loginallotlog' }, // Collect sorted logs into an array
        },
      },
      {
        $project: {
          userid: '$_id.userid',

          logs: {
            $map: {
              input: { $range: [0, { $size: '$logs' }] }, // Create an index for each log
              as: 'idx',
              in: {
                currentLog: { $arrayElemAt: ['$logs', '$$idx'] },
                endDate: {
                  $cond: {
                    if: { $lt: ['$$idx', { $subtract: [{ $size: '$logs' }, 1] }] },
                    then: { $arrayElemAt: ['$logs.date', { $add: ['$$idx', 1] }] },
                    else: null, // Null for the last log entry
                  },
                },
              },
            },
          },
        },
      },
      { $unwind: '$logs' }, // Unwind to process each log with its "endDate"
      {
        $replaceRoot: { newRoot: { $mergeObjects: ['$logs.currentLog', { endDate: '$logs.endDate' }] } },
      },
      {
        $match: {
          // projectvendor: req.body.project,
          empname: req.body.companyname,
          date: { $lte: req.body.date }, // Match log entries before or on the input date
          $or: [
            { endDate: null }, // Include the last log entry (no end date)
            { endDate: { $gt: req.body.date } }, // Include entries where the end date is after the input date
          ],
        },
      },
      {
        $sort: { date: -1, time: -1 }, // Ensure the latest log is selected
      },
      // { $limit: 1 }, // Take only the most relevant entry
    ]);
    console.log(clientuserid,'clientuserid')
  } catch (err) {
    console.log(err.message);
  }
  // if (!clientuserid) {
  //   return next(new ErrorHandler("Client User ID not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});
exports.clientUseridsLimitedUser = catchAsyncErrors(async (req, res, next) => {
  let clientuserid = [];
  try {
    //  console.log( req.body,' req.body')
    // clientuserid = await ClientUserID.aggregate([
    //   { $unwind: '$loginallotlog' }, // Unwind the array for individual log processing
    //   {
    //     $sort: {
    //       'loginallotlog.date': 1,
    //       'loginallotlog.time': 1, // Sort by date and time ascending
    //     },
    //   },
    //   {
    //     $match: {
    //       'loginallotlog.empname': req.body.companyname,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: {
    //         userid: '$userid',
    //         projectvendor: '$projectvendor',
    //       },
    //       logs: { $push: '$loginallotlog' }, // Collect sorted logs into an array
    //     },
    //   },
    //   {
    //     $project: {
    //       userid: '$_id.userid',
    //      projectvendor: '$_id.projectvendor',
    //       logs: {
    //         $map: {
    //           input: { $range: [0, { $size: '$logs' }] }, // Create an index for each log
    //           as: 'idx',
    //           in: {
    //             currentLog: { $arrayElemAt: ['$logs', '$$idx'] },

    //             calculatedEndDate: {
    //               $cond: {
    //                 if: { $lt: ['$$idx', { $subtract: [{ $size: '$logs' }, 1] }] },
    //                 then: { $arrayElemAt: ['$logs.date', { $add: ['$$idx', 1] }] },
    //                 else: null, // Null for the last log entry
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   { $unwind: '$logs' }, // Unwind to process each log with its "enddate"
    //   {
    //     $addFields: {
    //       'logs.currentLog.projectvendor':  '$projectvendor',
    //       'logs.currentLog.enddate': {
    //         $ifNull: ['$logs.currentLog.enddate', '$logs.calculatedEndDate'], // Use existing enddate, otherwise fallback
    //       },
    //     },
    //   },
    //   {
    //     $replaceRoot: { newRoot: '$logs.currentLog' },
    //   },
    //   {
    //     $match: {
    //       empname: req.body.companyname,
    //       date: { $lte: req.body.date }, // Match log entries before or on the input date
    //       $or: [
    //          { enddate: null }, // Include the last log entry (no end date)
    //         { enddate: { $gte: req.body.date } }, // Include entries where the end date is after the input date
    //       ],
    //     },
    //   },

    //   {
    //     $sort: { date: -1, time: -1 }, // Ensure the latest log is selected
    //   },
    // ]);
    loginids = await ClientUserID.find({ "loginallotlog.empname": req.body.companyname }, { userid: 1, loginallotlog: 1, projectvendor: 1 }).lean();
    let logs = loginids.flatMap((user) =>
      user.loginallotlog.map((log) => ({
        userid: user.userid,
        _id: user._id,
        projectvendor: user.projectvendor,
        date: log.date,
        time: log.time,
        empname: log.empname,
        empcode: log.empcode,
        enddate: log.enddate ? log.enddate : null,
      }))
    );

    // Step 2: Sort logs by date and time (ascending order)
    logs.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return new Date(a.date) - new Date(b.date);
    });

    // Step 3: Calculate the enddate for each log (except the last log for each userid)
    const userLogsMap = {};
    logs.forEach((log) => {
      if (!userLogsMap[log.userid]) {
        userLogsMap[log.userid] = {};
      }

      if (!userLogsMap[log.userid][log.projectvendor]) {
        userLogsMap[log.userid][log.projectvendor] = [];
      }

      userLogsMap[log.userid][log.projectvendor].push(log);
    });

    Object.values(userLogsMap).forEach((userLogs) => {
      Object.values(userLogs).forEach((logsArray) => {
        logsArray.forEach((log, idx) => {
          if (idx < logsArray.length - 1) {
            log.enddate = logsArray[idx + 1].date;
          }
        });
      });
    });
    // Step 4: Filter logs based on input date
    const filteredLogs = logs.filter((log) => {
      return new Date(log.date) <= new Date(req.body.date) && (!log.enddate || new Date(log.enddate) >= new Date(req.body.date));
    });

    // Step 5: Sort the filtered logs by date and time (descending order)
    filteredLogs.sort((a, b) => {
      if (a.date === b.date) {
        return b.time.localeCompare(a.time);
      }
      return new Date(b.date) - new Date(a.date);
    });
    clientuserid = filteredLogs.filter((d) => d.empname === req.body.companyname);

    console.log(clientuserid.length, "clientuserid");
  } catch (err) {
    console.log(err.message);
  }
  // if (!clientuserid) {
  //   return next(new ErrorHandler("Client User ID not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});
// get All ClientUserID Name => /api/clientuserids
exports.clientUserIdLimitedTimestudy = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    clientuserid = await ClientUserID.find({ projectvendor: req.body.project }, { userid: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  // if (!clientuserid) {
  //   return next(new ErrorHandler("Client User ID not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});

exports.clientUserIdLimitedTimestudyByCompnynameOLD = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    console.log(req.body, 'req.body');
    if (['Manager', 'Director', 'Admin', 'SuperAdmin', 'ADMIN'].some((role) => req.body.role.includes(role))) {
      clientuserid = await ClientUserID.find({ allotted: 'allotted', projectvendor: req.body.project }, { userid: 1 });
    } else {
      clientuserid = await ClientUserID.aggregate([
        { $unwind: '$loginallotlog' }, // Unwind the array for individual log processing
        {
          $sort: {
            userid: 1,
            'loginallotlog.date': 1,
            'loginallotlog.time': 1, // Sort by date and time ascending
          },
        },
        {
          $match: {
            projectvendor: req.body.project,
          },
        },
        {
          $project: {
            userid: 1,
            projectvendor: 1,
            loginallotlog: 1,
          },
        },
        {
          $group: {
            _id: '$userid',

            logs: { $push: '$loginallotlog' }, // Collect sorted logs into an array
          },
        },
        {
          $project: {
            userid: '$_id',

            logs: {
              $map: {
                input: { $range: [0, { $size: '$logs' }] }, // Create an index for each log
                as: 'idx',
                in: {
                  currentLog: { $arrayElemAt: ['$logs', '$$idx'] },
                  endDate: {
                    $cond: {
                      if: { $lt: ['$$idx', { $subtract: [{ $size: '$logs' }, 1] }] },
                      then: { $arrayElemAt: ['$logs.date', { $add: ['$$idx', 1] }] },
                      else: null, // Null for the last log entry
                    },
                  },
                },
              },
            },
          },
        },
        { $unwind: '$logs' }, // Unwind to process each log with its "endDate"
        {
          $replaceRoot: { newRoot: { $mergeObjects: ['$logs.currentLog', { endDate: '$logs.endDate' }] } },
        },
        {
          $match: {
            // projectvendor: req.body.project,
            empname: req.body.companyname,
            date: { $lte: req.body.date }, // Match log entries before or on the input date
            $or: [
              { endDate: null }, // Include the last log entry (no end date)
              { endDate: { $gt: req.body.date } }, // Include entries where the end date is after the input date
            ],
          },
        },
        {
          $sort: { date: -1, time: -1 }, // Ensure the latest log is selected
        },
       // { $limit: 1 }, // Take only the most relevant entry
      ]);
    }
    console.log(clientuserid.length, 'sdf');
  } catch (err) {
    console.log(err.message);
  }
  // if (!clientuserid) {
  //   return next(new ErrorHandler("Client User ID not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});
exports.clientUserIdLimitedTimestudyByCompnyname = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    if (["Manager", "Director", "Admin", "SuperAdmin", "ADMIN"].some((role) => req.body.role.includes(role))) {
      // clientuserid = await ClientUserID.find({ allotted: 'allotted', projectvendor: req.body.project }, { userid: 1 });
      // clientuserid = await ClientUserID.aggregate([
      //   { $unwind: "$loginallotlog" }, // Unwind the array for individual log processing
      //   {
      //     $sort: {
      //       "loginallotlog.date": 1,
      //       "loginallotlog.time": 1, // Sort by date and time ascending
      //     },
      //   },
      //   {
      //     $match: {
      //       projectvendor: req.body.project,
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: {
      //         userid: "$userid",
      //         projectvendor: "$projectvendor",
      //       },
      //       logs: { $push: "$loginallotlog" }, // Collect sorted logs into an array
      //     },
      //   },
      //   {
      //     $project: {
      //       userid: "$_id.userid",

      //       logs: {
      //         $map: {
      //           input: { $range: [0, { $size: "$logs" }] }, // Create an index for each log
      //           as: "idx",
      //           in: {
      //             currentLog: { $arrayElemAt: ["$logs", "$$idx"] },
      //             calculatedEndDate: {
      //               $cond: {
      //                 if: { $lt: ["$$idx", { $subtract: [{ $size: "$logs" }, 1] }] },
      //                 then: { $arrayElemAt: ["$logs.date", { $add: ["$$idx", 1] }] },
      //                 else: null, // Null for the last log entry
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   { $unwind: "$logs" }, // Unwind to process each log with its "enddate"
      //   {
      //     $addFields: {
      //       "logs.currentLog.enddate": {
      //         $ifNull: ["$logs.currentLog.enddate", "$logs.calculatedEndDate"], // Use existing enddate, otherwise fallback
      //       },
      //     },
      //   },
      //   {
      //     $replaceRoot: { newRoot: "$logs.currentLog" },
      //   },
      //   {
      //     $match: {
      //       // empname: req.body.companyname,
      //       date: { $lte: req.body.date }, // Match log entries before or on the input date
      //       $or: [
      //         { enddate: null }, // Include the last log entry (no end date)
      //         { enddate: { $gte: req.body.date } }, // Include entries where the end date is after the input date
      //       ],
      //     },
      //   },
      //   {
      //     $sort: { date: -1, time: -1 }, // Ensure the latest log is selected
      //   },
      // ]);
      loginids = await ClientUserID.find({ projectvendor: req.body.project }, { userid: 1, loginallotlog: 1, projectvendor: 1 }).lean();
      let logs = loginids.flatMap((user) =>
        user.loginallotlog.map((log) => ({
          userid: user.userid,
          projectvendor: user.projectvendor,
          date: log.date,
          time: log.time,
          empname: log.empname,
          empcode: log.empcode,
          enddate: log.enddate ? log.enddate : null,
        }))
      );

      // Step 2: Sort logs by date and time (ascending order)
      logs.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return new Date(a.date) - new Date(b.date);
      });

      // Step 3: Calculate the enddate for each log (except the last log for each userid)
      const userLogsMap = {};
      logs.forEach((log) => {
        if (!userLogsMap[log.userid]) {
          userLogsMap[log.userid] = {};
        }

        if (!userLogsMap[log.userid][log.projectvendor]) {
          userLogsMap[log.userid][log.projectvendor] = [];
        }

        userLogsMap[log.userid][log.projectvendor].push(log);
      });

      Object.values(userLogsMap).forEach((userLogs) => {
        Object.values(userLogs).forEach((logsArray) => {
          logsArray.forEach((log, idx) => {
            if (idx < logsArray.length - 1) {
              log.enddate = logsArray[idx + 1].date;
            }
          });
        });
      });
      // Step 4: Filter logs based on input date
      const filteredLogs = logs.filter((log) => {
        return new Date(log.date) <= new Date(req.body.date) && (!log.enddate || new Date(log.enddate) >= new Date(req.body.date));
      });

      // Step 5: Sort the filtered logs by date and time (descending order)
      filteredLogs.sort((a, b) => {
        if (a.date === b.date) {
          return b.time.localeCompare(a.time);
        }
        return new Date(b.date) - new Date(a.date);
      });
      clientuserid = filteredLogs;
    } else {
      // clientuserid = await ClientUserID.aggregate([
      //   { $unwind: '$loginallotlog' }, // Unwind the array for individual log processing
      //   {
      //     $sort: {
      //       userid: 1,
      //       'loginallotlog.date': 1,
      //       'loginallotlog.time': 1, // Sort by date and time ascending
      //     },
      //   },
      //   {
      //     $match: {
      //       projectvendor: req.body.project,
      //     },
      //   },
      //   {
      //     $project: {
      //       userid: 1,
      //       projectvendor: 1,
      //       loginallotlog: 1,
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: '$userid',

      //       logs: { $push: '$loginallotlog' }, // Collect sorted logs into an array
      //     },
      //   },
      //   {
      //     $project: {
      //       userid: '$_id',

      //       logs: {
      //         $map: {
      //           input: { $range: [0, { $size: '$logs' }] }, // Create an index for each log
      //           as: 'idx',
      //           in: {
      //             currentLog: { $arrayElemAt: ['$logs', '$$idx'] },
      //             endDate: {
      //               $cond: {
      //                 if: { $lt: ['$$idx', { $subtract: [{ $size: '$logs' }, 1] }] },
      //                 then: { $arrayElemAt: ['$logs.date', { $add: ['$$idx', 1] }] },
      //                 else: null, // Null for the last log entry
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   { $unwind: '$logs' }, // Unwind to process each log with its "endDate"
      //   {
      //     $replaceRoot: { newRoot: { $mergeObjects: ['$logs.currentLog', { endDate: '$logs.endDate' }] } },
      //   },
      //   {
      //     $match: {
      //       // projectvendor: req.body.project,
      //       empname: req.body.companyname,
      //       date: { $lte: req.body.date }, // Match log entries before or on the input date
      //       $or: [
      //         { endDate: null }, // Include the last log entry (no end date)
      //         { endDate: { $gt: req.body.date } }, // Include entries where the end date is after the input date
      //       ],
      //     },
      //   },
      //   {
      //     $sort: { date: -1, time: -1 }, // Ensure the latest log is selected
      //   },
      //   { $limit: 1 }, // Take only the most relevant entry
      // ]);
      // clientuserid = await ClientUserID.aggregate([
      //   { $unwind: "$loginallotlog" }, // Unwind the array for individual log processing
      //   {
      //     $sort: {
      //       "loginallotlog.date": 1,
      //       "loginallotlog.time": 1, // Sort by date and time ascending
      //     },
      //   },
      //   {
      //     $match: {
      //       projectvendor: req.body.project,
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: {
      //         userid: "$userid",
      //         projectvendor: "$projectvendor",
      //       },
      //       logs: { $push: "$loginallotlog" }, // Collect sorted logs into an array
      //     },
      //   },
      //   {
      //     $project: {
      //       userid: "$_id.userid",

      //       logs: {
      //         $map: {
      //           input: { $range: [0, { $size: "$logs" }] }, // Create an index for each log
      //           as: "idx",
      //           in: {
      //             currentLog: { $arrayElemAt: ["$logs", "$$idx"] },
      //             calculatedEndDate: {
      //               $cond: {
      //                 if: { $lt: ["$$idx", { $subtract: [{ $size: "$logs" }, 1] }] },
      //                 then: { $arrayElemAt: ["$logs.date", { $add: ["$$idx", 1] }] },
      //                 else: null, // Null for the last log entry
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   { $unwind: "$logs" }, // Unwind to process each log with its "enddate"
      //   {
      //     $addFields: {
      //       "logs.currentLog.enddate": {
      //         $ifNull: ["$logs.currentLog.enddate", "$logs.calculatedEndDate"], // Use existing enddate, otherwise fallback
      //       },
      //     },
      //   },
      //   {
      //     $replaceRoot: { newRoot: "$logs.currentLog" },
      //   },
      //   {
      //     $match: {
      //       empname: req.body.companyname,
      //       date: { $lte: req.body.date }, // Match log entries before or on the input date
      //       $or: [
      //         { enddate: null }, // Include the last log entry (no end date)
      //         { enddate: { $gte: req.body.date } }, // Include entries where the end date is after the input date
      //       ],
      //     },
      //   },
      //   {
      //     $sort: { date: -1, time: -1 }, // Ensure the latest log is selected
      //   },
      // ]);
      loginids = await ClientUserID.find({ "loginallotlog.empname": req.body.companyname, projectvendor: req.body.project }, { userid: 1, loginallotlog: 1, projectvendor: 1 }).lean();
      let logs = loginids.flatMap((user) =>
        user.loginallotlog.map((log) => ({
          userid: user.userid,
          projectvendor: user.projectvendor,
          date: log.date,
          time: log.time,
          empname: log.empname,
          empcode: log.empcode,
          enddate: log.enddate ? log.enddate : null,
        }))
      );

      // Step 2: Sort logs by date and time (ascending order)
      logs.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return new Date(a.date) - new Date(b.date);
      });

      // Step 3: Calculate the enddate for each log (except the last log for each userid)
      const userLogsMap = {};
      logs.forEach((log) => {
        if (!userLogsMap[log.userid]) {
          userLogsMap[log.userid] = {};
        }

        if (!userLogsMap[log.userid][log.projectvendor]) {
          userLogsMap[log.userid][log.projectvendor] = [];
        }

        userLogsMap[log.userid][log.projectvendor].push(log);
      });

      Object.values(userLogsMap).forEach((userLogs) => {
        Object.values(userLogs).forEach((logsArray) => {
          logsArray.forEach((log, idx) => {
            if (idx < logsArray.length - 1) {
              log.enddate = logsArray[idx + 1].date;
            }
          });
        });
      });
      // Step 4: Filter logs based on input date
      const filteredLogs = logs.filter((log) => {
        return new Date(log.date) <= new Date(req.body.date) && (!log.enddate || new Date(log.enddate) >= new Date(req.body.date));
      });

      // Step 5: Sort the filtered logs by date and time (descending order)
      filteredLogs.sort((a, b) => {
        if (a.date === b.date) {
          return b.time.localeCompare(a.time);
        }
        return new Date(b.date) - new Date(a.date);
      });
      clientuserid = filteredLogs.filter((d) => d.empname === req.body.companyname);
    }
    console.log(clientuserid.length, "sdf");
  } catch (err) {
    console.log(err.message);
  }

  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});

exports.clientUserIdLimitedTimestudyByCompnynameMulti = catchAsyncErrors(async (req, res, next) => {
  let clientuserid;
  try {
    if (["Manager", "Director", "Admin", "SuperAdmin", "ADMIN"].some((role) => req.body.role.includes(role))) {
      loginids = await ClientUserID.find({ "loginallotlog.empname": req.body.companyname, projectvendor: { $in: req.body.project } }, { userid: 1, loginallotlog: 1, projectvendor: 1 }).lean();
      let logs = loginids.flatMap((user) =>
        user.loginallotlog.map((log) => ({
          userid: user.userid,
          projectvendor: user.projectvendor,
          date: log.date,
          time: log.time,
          empname: log.empname,
          empcode: log.empcode,
          enddate: log.enddate ? log.enddate : null,
        }))
      );

      // Step 2: Sort logs by date and time (ascending order)
      logs.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return new Date(a.date) - new Date(b.date);
      });

      // Step 3: Calculate the enddate for each log (except the last log for each userid)
      const userLogsMap = {};
      logs.forEach((log) => {
        if (!userLogsMap[log.userid]) {
          userLogsMap[log.userid] = {};
        }

        if (!userLogsMap[log.userid][log.projectvendor]) {
          userLogsMap[log.userid][log.projectvendor] = [];
        }

        userLogsMap[log.userid][log.projectvendor].push(log);
      });

      Object.values(userLogsMap).forEach((userLogs) => {
        Object.values(userLogs).forEach((logsArray) => {
          logsArray.forEach((log, idx) => {
            if (idx < logsArray.length - 1) {
              log.enddate = logsArray[idx + 1].date;
            }
          });
        });
      });
      // Step 4: Filter logs based on input date
      const filteredLogs = logs.filter((log) => {
        return new Date(log.date) <= new Date(req.body.date) && (!log.enddate || new Date(log.enddate) >= new Date(req.body.date));
      });

      // Step 5: Sort the filtered logs by date and time (descending order)
      filteredLogs.sort((a, b) => {
        if (a.date === b.date) {
          return b.time.localeCompare(a.time);
        }
        return new Date(b.date) - new Date(a.date);
      });
      clientuserid = filteredLogs;
    } else {
      loginids = await ClientUserID.find({ "loginallotlog.empname": req.body.companyname, projectvendor: { $in: req.body.project } }, { userid: 1, loginallotlog: 1, projectvendor: 1 }).lean();
      let logs = loginids.flatMap((user) =>
        user.loginallotlog.map((log) => ({
          userid: user.userid,
          projectvendor: user.projectvendor,
          date: log.date,
          time: log.time,
          empname: log.empname,
          empcode: log.empcode,
          enddate: log.enddate ? log.enddate : null,
        }))
      );

      // Step 2: Sort logs by date and time (ascending order)
      logs.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return new Date(a.date) - new Date(b.date);
      });

      // Step 3: Calculate the enddate for each log (except the last log for each userid)
      const userLogsMap = {};
      logs.forEach((log) => {
        if (!userLogsMap[log.userid]) {
          userLogsMap[log.userid] = {};
        }

        if (!userLogsMap[log.userid][log.projectvendor]) {
          userLogsMap[log.userid][log.projectvendor] = [];
        }

        userLogsMap[log.userid][log.projectvendor].push(log);
      });

      Object.values(userLogsMap).forEach((userLogs) => {
        Object.values(userLogs).forEach((logsArray) => {
          logsArray.forEach((log, idx) => {
            if (idx < logsArray.length - 1) {
              log.enddate = logsArray[idx + 1].date;
            }
          });
        });
      });
      // Step 4: Filter logs based on input date
      const filteredLogs = logs.filter((log) => {
        return new Date(log.date) <= new Date(req.body.date) && (!log.enddate || new Date(log.enddate) >= new Date(req.body.date));
      });

      // Step 5: Sort the filtered logs by date and time (descending order)
      filteredLogs.sort((a, b) => {
        if (a.date === b.date) {
          return b.time.localeCompare(a.time);
        }
        return new Date(b.date) - new Date(a.date);
      });
      clientuserid = filteredLogs.filter((d) => d.empname === req.body.companyname);
    }
    console.log(clientuserid.length, "sdf");
  } catch (err) {
    console.log(err.message);
  }
  // if (!clientuserid) {
  //   return next(new ErrorHandler("Client User ID not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    clientuserid,
  });
});

exports.getSingleClientUserIDForLog = catchAsyncErrors(async (req, res, next) => {

  const id = req.params.id;

  let loginallotlogs = await ClientUserID.findById(id);

  if (!loginallotlogs) {
    return next(new ErrorHandler("Client User ID not found!", 404));
  }

  return res.status(200).json({
    sclientuserid: loginallotlogs,
  });
});

