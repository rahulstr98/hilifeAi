const Raiseticketmaster = require("../../../model/modules/tickets/raiseticketmaster");
const ErrorHandler = require("../../../utils/errorhandler");
// const Task = require('../../../model/modules/project/task');
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const Hirerarchi = require("../../../model/modules/setup/hierarchy");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require("../../../model/login/auth");
const WorkStationShortNameGeneration = require('../../../utils/workstationShortName');

///Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'raiseTicketMaster/');
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






exports.getAllWorkStationShortNameTickets = catchAsyncErrors(async (req, res, next) => {
  let { access, username, allnames } = req?.body;
  let raisetickets, workstations, finalData
  try {
    if (access === "Employee") {
      raisetickets = await User.findOne({ username: username }, { workstation: 1 }).lean();
      workstations = raisetickets?.workstation
    }
    else if (allnames?.length && access === "Manager") {
      raisetickets = await User.find({ username: { $in: allnames } }, { workstation: 1 }).lean();
      workstations = raisetickets?.flatMap(data => data?.workstation)
    }

    const shortNames = await WorkStationShortNameGeneration();
    finalData = shortNames?.filter(data => workstations?.includes(`${data?.cabinname}(${data?.branch}-${data?.floor})`))

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({ finalData });
});










//get All Raiseticketmaster =>/api/Raiseticketmaster
exports.getAllRaiseTicket = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    raisetickets = await Raiseticketmaster.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!raisetickets) {
    return next(new ErrorHandler("Raise Ticket not found!", 404));
  }
  return res.status(200).json({
    raisetickets,
  });
});
exports.getAllRaiseTicketOpen = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    raisetickets = await Raiseticketmaster.find({ raiseself: "Open" }, {
      _id: 1,
      employeename: 1,
      employeecode: 1,
      category: 1,
      subcategory: 1,
      subsubcategory: 1,
      workstation: 1,
      materialname: 1,
      type: 1,
      raiseddate: 1,
      raisedby: 1,
      resolverby: 1,
      resolvedate: 1,
      raiseticketcount: 1,
      textAreaCloseDetails: 1,
      reason: 1,
      priority: 1,
      raiseself: 1,
      duedate: 1,
      title: 1,
      description: 1,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!raisetickets) {
    return next(new ErrorHandler("Raise Ticket not found!", 404));
  }
  return res.status(200).json({
    raisetickets,
  });
});
exports.getAllRaiseTicketClosed = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    raisetickets = await Raiseticketmaster.find({ raiseself: { $in: ["Closed", "Resolved"] } }, {
      _id: 1,
      employeename: 1,
      employeecode: 1,
      category: 1,
      subcategory: 1,
      subsubcategory: 1,
      workstation: 1,
      materialname: 1,
      type: 1,
      raiseddate: 1,
      raisedby: 1,
      resolverby: 1,
      resolvedate: 1,
      raiseticketcount: 1,
      textAreaCloseDetails: 1,
      reason: 1,
      priority: 1,
      raiseself: 1,
      duedate: 1,
      title: 1,
      description: 1,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!raisetickets) {
    return next(new ErrorHandler("Raise Ticket not found!", 404));
  }
  return res.status(200).json({
    raisetickets,
  });
});
exports.getAllRaiseTicketEditDuplication = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    raisetickets = await Raiseticketmaster.find({ _id: req.body.individualid });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!raisetickets) {
    return next(new ErrorHandler("Raise Ticket not found!", 404));
  }
  return res.status(200).json({
    raisetickets,
  });
});


exports.getAllRaiseTicketLast = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    const answer = await Raiseticketmaster.aggregate([
      {
        $addFields: {
          ticketNumber: {
            $toInt: {
              $arrayElemAt: [
                { $split: ["$raiseticketcount", "#"] },
                1
              ]
            }
          }
        }
      },
      { $sort: { ticketNumber: -1 } },
      { $limit: 1 },
      {
        $project: {
          raiseticketcount: 1,
          _id: 0
        }
      }
    ]);

    raisetickets = answer ? answer : []
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    raisetickets,
  });
});


exports.getAllRaiseTicketWithoutClosed = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    raisetickets = await Raiseticketmaster.find({ raiseself: { $nin: ["Closed", "Reject", "Resolved"] } });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!raisetickets) {
    return next(new ErrorHandler("Raise Ticket not found!", 404));
  }
  return res.status(200).json({
    raisetickets,
  });
});





exports.getAllRaiseTicketFilteredDatas = catchAsyncErrors(async (req, res, next) => {
  let result, totalProjects, overallList;
  // let { value, username, role, page, pageSize } = req.body;
  const { value, username, role, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
  let type = req.body.type
  try {
    let query = {};
    let queryParams = {};
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers" && !["page", 'pageSize', "username", "role", 'type'].includes(key)) {
        const value = req.body[key];
        if (value !== "" && value !== "ALL" && value?.length > 0) {
          query[key] = value;
        }
      }
    });


    const generateMongoQuery = (query) => {
      const mongoQuery = {};

      // Add company to the query if it exists
      if (query.company && Array.isArray(query.company)) {
        mongoQuery.company = { $in: query.company };
      }
      if (query.branch) {
        mongoQuery.branch = query.branch;
      }
      if (query.unit) {
        mongoQuery.unit = query.unit;
      }
      if (query.team) {
        mongoQuery.team = query.team;
      }
      if (query.category) {
        mongoQuery.category = query.category;
      }
      if (query.subcategory) {
        mongoQuery.subcategory = query.subcategory;
      }
      if (query.subsubcategory) {
        mongoQuery.subsubcategory = query.subsubcategory;
      }
      if (query.value && !query.value?.includes("All Ticket")) {
        mongoQuery.raiseself = query.value;
      }
      // If employeename is an array, use $in to match any of the names
      if (query.employeename && Array.isArray(query.employeename)) {
        mongoQuery.employeename = { $in: query.employeename };
      }

      return mongoQuery;
    };




    const mongoQuery = generateMongoQuery(query);

    let conditions = [];
    // Advanced search filter
    if (allFilters && allFilters.length > 0) {
      allFilters.forEach(filter => {
        if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      });
    }
    queryParams = {
      ...mongoQuery
    }
    if (searchQuery && searchQuery !== undefined) {
      const searchTermsArray = searchQuery.split(" ");
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));
      const orConditions = regexTerms.map((regex) => ({
        $or: [
          { raiseddate: regex },
          { raisedby: regex },
          { raiseself: regex },
          { category: regex },
          { subcategory: regex },
          { subsubcategory: regex },
          { type: regex },
          { reason: regex },
          { priority: regex },
          { ticketclosed: regex },
          { employeename: { $in: regex } },
          { employeecode: { $in: regex } },
          { checkRaiseResolve: regex },
          { textAreaCloseDetails: regex },
          { resolvedate: regex },
          { raiseticketcount: regex },
        ],
      }));

      queryParams = {
        ...mongoQuery,
        $and: [
          ...orConditions,
        ]
      };
    }
    // Apply logicOperator to combine conditions
    if (conditions.length > 0) {
      if (logicOperator === "AND") {
        queryParams.$and = conditions;
      } else if (logicOperator === "OR") {
        queryParams.$or = conditions;
      }
    }

    totalProjects = role == true
      ? await Raiseticketmaster.find(queryParams).countDocuments() :
      await Raiseticketmaster.countDocuments({ ...queryParams, employeename: username });


    overallList = role == true
      ? await Raiseticketmaster.find(mongoQuery, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
      }) :
      await Raiseticketmaster.find({ ...queryParams, employeename: username }, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
      });

    result = role == true
      ? await Raiseticketmaster.find(queryParams, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
      }).skip((page - 1) * pageSize)
        .limit(parseInt(pageSize)) :
      await Raiseticketmaster.find({ ...queryParams, employeename: username }, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
      })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));


  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    totalProjects,
    result,
    overallList,
    currentPage: page,
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

exports.getAllRaiseTicketFilteredIndividualDatas = catchAsyncErrors(async (req, res, next) => {
  let result, totalProjects, overallList;
  const { value, username, role, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;

  try {

    let query = {
      employeename: username
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
          { raiseddate: regex },
          { raisedby: regex },
          { raiseself: regex },
          { category: regex },
          { subcategory: regex },
          { subsubcategory: regex },
          { type: regex },
          { reason: regex },
          { priority: regex },
          { ticketclosed: regex },
          { employeename: { $in: regex } },
          { employeecode: { $in: regex } },
          { checkRaiseResolve: regex },
          { textAreaCloseDetails: regex },
          { resolvedate: regex },
          { raiseticketcount: regex },
        ],
      }));

      query = {
        employeename: username,
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

    totalProjects = await Raiseticketmaster.countDocuments(query);
    overallList = await Raiseticketmaster.find({ employeename: username });
    result = role == true
      ?
      (value == "All Ticket" ? await Raiseticketmaster.find(query).skip((page - 1) * pageSize)
        .limit(parseInt(pageSize)) : await Raiseticketmaster.find(query).skip((page - 1) * pageSize)
          .limit(parseInt(pageSize)))
      :
      await Raiseticketmaster.find(query, {})
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));


  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    totalProjects,
    overallList,
    result,
    currentPage: page,
    totalPages: Math.ceil(totalProjects / pageSize),
  });
});

exports.getAllRaiseTicketFilteredDatasOverall = catchAsyncErrors(async (req, res, next) => {
  let result, totalProjects;
  let { value, username, role } = req.body;
  try {
    result = role == true
      ?
      await Raiseticketmaster.find({}, {
        priority: 1, raiseself: 1, workstation: 1, materialname: 1, type: 1, raiseself: 1, textAreaCloseDetails: 1,
        raiseticketcount: 1, raisedby: 1, raiseddate: 1, ticketclosed: 1, resolvedate: 1,
        duedate: 1, title: 1, description: 1, reason: 1, employeename: 1, employeecode: 1, category: 1, subcategory: 1, subsubcategory: 1, _id: 1
      })
      :
      await Raiseticketmaster.find({ raiseself: value, employeename: username }, {
        priority: 1, raiseself: 1, workstation: 1, materialname: 1, type: 1, raiseself: 1, textAreaCloseDetails: 1,
        raiseticketcount: 1, raisedby: 1, raiseddate: 1, ticketclosed: 1, resolvedate: 1,
        duedate: 1, title: 1, description: 1, reason: 1, employeename: 1, employeecode: 1, category: 1, subcategory: 1, subsubcategory: 1, _id: 1
      })



  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result,
    sss
  });
});


exports.getAllTicketsReports = catchAsyncErrors(async (req, res, next) => {
  let result, totalProjects, overallList, overallListIndividual;
  let { username, role, page, pageSize, allFilters, logicOperator, searchQuery } = req.body;
  let type = req.body.type
  try {
    let query = {};
    let queryParams = {};
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers" && !["page", 'pageSize', 'value', "username", "role", 'type'].includes(key)) {
        const value = req.body[key];
        if (value !== "" && value !== "ALL" && value?.length > 0) {
          query[key] = value;
        }
      }
    });
    const generateMongoQuery = (query) => {
      const mongoQuery = {};

      // Add company to the query if it exists
      if (query.company && Array.isArray(query.company)) {
        mongoQuery.company = { $in: query.company };
      }
      if (query.branch) {
        mongoQuery.branch = query.branch;
      }
      if (query.unit) {
        mongoQuery.unit = query.unit;
      }
      if (query.team) {
        mongoQuery.team = query.team;
      }
      if (query.category) {
        mongoQuery.category = query.category;
      }
      if (query.subcategory) {
        mongoQuery.subcategory = query.subcategory;
      }
      if (query.subsubcategory) {
        mongoQuery.subsubcategory = query.subsubcategory;
      }
      // If employeename is an array, use $in to match any of the names
      if (query.employeename && Array.isArray(query.employeename)) {
        mongoQuery.employeename = { $in: query.employeename };
      }

      return mongoQuery;
    };


    const mongoQuery = generateMongoQuery(query);

    let conditions = [];
    // Advanced search filter
    if (allFilters && allFilters.length > 0) {
      allFilters.forEach(filter => {
        if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      });
    }
    queryParams = {
      ...mongoQuery
    }
    if (searchQuery && searchQuery !== undefined) {
      const searchTermsArray = searchQuery.split(" ");
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));
      const orConditions = regexTerms.map((regex) => ({
        $or: [
          { raiseddate: regex },
          // { raisedby: regex },
          { raiseself: regex },
          { type: regex },
          { reason: regex },
          { raiseticketcount: regex },
          { employeename: { $in: regex } },
          { employeecode: { $in: regex } },
          { checkRaiseResolve: regex },

        ],
      }));

      queryParams = {
        ...mongoQuery,
        $and: [
          ...orConditions,
        ]
      };
    }
    // Apply logicOperator to combine conditions
    if (conditions.length > 0) {
      if (logicOperator === "AND") {
        queryParams.$and = conditions;
      } else if (logicOperator === "OR") {
        queryParams.$or = conditions;
      }
    }
    totalProjects = role == true
      ?
      await Raiseticketmaster.find(queryParams).countDocuments() :
      await Raiseticketmaster.countDocuments({ ...queryParams, employeename: username });


    overallList = role == true
      ?
      await Raiseticketmaster.find(mongoQuery, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseddate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
        createdAt: 1
      }) :
      await Raiseticketmaster.find({ ...queryParams, employeename: username }, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseddate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
        createdAt: 1
      });

    overallListIndividual = await Raiseticketmaster.find({ employeename: username }, {
      _id: 1,
      employeename: 1,
      employeecode: 1,
      category: 1,
      subcategory: 1,
      subsubcategory: 1,
      workstation: 1,
      materialname: 1,
      type: 1,
      raiseddate: 1,
      raisedby: 1,
      resolverby: 1,
      resolvedate: 1,
      raiseddate: 1,
      raiseticketcount: 1,
      textAreaCloseDetails: 1,
      reason: 1,
      priority: 1,
      raiseself: 1,
      duedate: 1,
      title: 1,
      description: 1,
      createdAt: 1
    });


    result = role == true
      ?
      await Raiseticketmaster.find(queryParams, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
        createdAt: 1
      }).skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
      :
      await Raiseticketmaster.find({ ...queryParams, employeename: username }, {
        _id: 1,
        employeename: 1,
        employeecode: 1,
        category: 1,
        subcategory: 1,
        subsubcategory: 1,
        workstation: 1,
        materialname: 1,
        type: 1,
        raiseddate: 1,
        raisedby: 1,
        resolverby: 1,
        resolvedate: 1,
        raiseticketcount: 1,
        textAreaCloseDetails: 1,
        reason: 1,
        priority: 1,
        raiseself: 1,
        duedate: 1,
        title: 1,
        description: 1,
        createdAt: 1
      }).skip((page - 1) * pageSize).limit(parseInt(pageSize));


  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    totalProjects,
    overallList,
    result,
    currentPage: page,
    overallListIndividual,
    totalPages: Math.ceil(totalProjects / pageSize),
  });
});




exports.getAllTicketsReportsOverall = catchAsyncErrors(async (req, res, next) => {
  let result, totalProjects;
  let { username, role } = req.body;
  try {
    result = role == true
      ?
      await Raiseticketmaster.find({}, { employeename: 1, employeecode: 1, createdAt: 1, raiseself: 1, ticketclosed: 1, _id: 1 })
      :
      await Raiseticketmaster.find({ employeename: username }, { employeename: 1, employeecode: 1, createdAt: 1, raiseself: 1, ticketclosed: 1, _id: 1 })



  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result,

  });
});

exports.getAllRaiseHierarchyFilter = catchAsyncErrors(async (req, res, next) => {
  let raisetickets, hierarchyDefList, hierarchyMap, result, conditionCheck, Supervisorchoose, EmployeeNames, controlNames, controlNamesSplice;
  try {

    hierarchyDefList = await Hirerarchi.find();
    hierarchyMap = hierarchyDefList.find(item => item.employeename.includes(req.body.empname))?.control

    controlNames = hierarchyMap ? [`${hierarchyMap?.slice(0, -1)}1`, `${hierarchyMap?.slice(0, -1)}2`, `${hierarchyMap?.slice(0, -1)}3`, `${hierarchyMap?.slice(0, -1)}4`] : []
    if (hierarchyMap) {
      result = hierarchyMap[hierarchyMap?.length - 1]?.toString();
      switch (result) {
        case "0":
          conditionCheck = hierarchyMap ? hierarchyDefList?.filter(data => [`${hierarchyMap?.slice(0, -1)}1`, `${hierarchyMap?.slice(0, -1)}2`, `${hierarchyMap?.slice(0, -1)}3`, `${hierarchyMap?.slice(0, -1)}4`].includes(data.control)) : [];
          break;
        case "1":
          conditionCheck = hierarchyMap ? hierarchyDefList?.filter(data => [`${hierarchyMap?.slice(0, -1)}2`, `${hierarchyMap?.slice(0, -1)}3`, `${hierarchyMap?.slice(0, -1)}4`].includes(data.control)) : [];
          break;
        case "2":
          conditionCheck = hierarchyMap ? hierarchyDefList?.filter(data => [`${hierarchyMap?.slice(0, -1)}3`, `${hierarchyMap?.slice(0, -1)}4`].includes(data.control)) : [];
          break;
        case "3":
          conditionCheck = hierarchyMap ? hierarchyDefList?.filter(data => [`${hierarchyMap?.slice(0, -1)}3`].includes(data.control)) : [];
          break;
      }


      Supervisorchoose = conditionCheck?.flatMap(item => item.supervisorchoose)
      EmployeeNames = conditionCheck?.flatMap(item => item.employeename)

    }

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hierarchyDefList) {
    return next(new ErrorHandler("Raise Tickets Hierarchies  not found!", 404));
  }
  return res.status(200).json({
    raisetickets: [...(Supervisorchoose?.length > 0 ? Supervisorchoose : []), ...(EmployeeNames?.length > 0 ? EmployeeNames : [])],
  });
});

//create new Raiseticketmaster => /api/Raiseticketmaster/new
exports.addRaiseTicket = catchAsyncErrors(async (req, res, next) => {
  // let checkmain = await Addexists.findOne({ name: req.body.name });
  // if (checkmain) {
  //     return next(new ErrorHandler('Name already exist!', 400));
  // }
  let araiseticket = await Raiseticketmaster.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single Raiseticketmaster => /api/Raiseticketmaster/:id
exports.getSingleRaiseTicket = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sraiseticket = await Raiseticketmaster.findById(id);
  if (!sraiseticket) {
    return next(new ErrorHandler("Raise Ticket not found", 404));
  }
  return res.status(200).json({
    sraiseticket,
  });
});

//update Raiseticketmaster by id => /api/Raiseticketmaster/:id
exports.updateRaiseTicket = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uraiseticket = await Raiseticketmaster.findByIdAndUpdate(id, req.body);
  if (!uraiseticket) {
    return next(new ErrorHandler("Raise Ticket not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});

//delete Raiseticketmaster by id => /api/Raiseticketmaster/:id
exports.deleteRaiseTicket = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let draiseticket = await Raiseticketmaster.findByIdAndRemove(id);
  if (!draiseticket) {
    return next(new ErrorHandler("Raise Ticket not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});






exports.getAllRaiseTicketForwardedEmployee = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    raisetickets = await Raiseticketmaster.aggregate([
      {
        $match: {
          raiseself: "Forwarded",
          forwardedemployee: {
            $elemMatch: {
              $eq: req?.body?.username
            }
          }
        }
      }
    ])

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({ raisetickets });
});
exports.getAllRaiseTicketUserForwardedEmployee = catchAsyncErrors(async (req, res, next) => {
  let raisetickets;
  try {
    raisetickets = await Raiseticketmaster.aggregate([
      {
        $match: {
          "forwardedlog.forwardedby":
            req.body.username,
          raiseself: {
            $in: [
              "Hold",
              "Details Needed",
              "Reject",
              "In-Reapir",
              "Forwarded"
            ]
          }
        }
      }
    ])

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({ raisetickets });
});

exports.getAllRaiseTicketFilteredIndividualDatasHome = catchAsyncErrors(async (req, res, next) => {
  let result;
  let { username } = req.body;

  try {
    result = await Raiseticketmaster.countDocuments({ employeename: username });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result,
  });
});


exports.dynamicTicketController = catchAsyncErrors(async (req, res, next) => {
  let raiseticket;
  try {
    const { pipeline } = req.body
    raiseticket = await Raiseticketmaster.aggregate(pipeline);
    return res.status(200).json({
      raiseticket,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

});




//create new RaiseticketmasterMulter => /api/RaiseticketmasterMulter/new
exports.addRaiseTicketMulter = [
  upload.array('files'), // Accept multiple files with the field name 'files'
  catchAsyncErrors(async (req, res, next) => {
    try {
      const id = req.params.id;

      // File info (multiple files)
      const documents = req.files?.map(file => ({
        name: file.filename,
        path: file.path,
        size: file.size,
      })) || [];
      const ticketData = {
        visitordocumentstatus: req.body.visitordocumentstatus,
        accessdrop: req.body.accessdrop,
        branch: req.body.branch,
        company: JSON.parse(req.body.company),
        raiseticketcount: req.body.raiseticketcount,
        raisedby: req.body.raisedby,
        raiseddate: req.body.raiseddate,
        resolverby: JSON.parse(req.body.resolverby),
        unit: req.body.unit,
        team: req.body.team,
        accessEmp: req.body.accessEmp,
        category: req.body.category,
        subcategory: req.body.subcategory,
        subsubcategory: req.body.subsubcategory,
        type: req.body.type,
        reason: req.body.reason,
        raiseTeamGroup: req.body.raiseTeamGroup,
        status: req.body.status,
        priority: req.body.priority,
        duedate: req.body.duedate,
        resolvedate: req.body.resolvedate,
        title: req.body.title,
        raiseself: req.body.raiseself,
        workstation: req.body.workstation,
        materialname: req.body.materialname,
        marginQuill: req.body.marginQuill,
        orientationQuill: req.body.orientationQuill,
        pagesizeQuill: req.body.pagesizeQuill,
        materialcode: req.body.materialcode,
        materialnamecut: req.body.materialnamecut,
        description: req.body.description,
        employeename: req.body.accessdrop === "Employee" ? req.body.employeename : JSON.parse(req.body.employeename),
        employeecode: req.body.accessdrop === "Employee" ? req.body.employeecode : JSON.parse(req.body.employeecode),
        checkRaiseResolve: req.body.checkRaiseResolve,
        workassetgroup: req.body.workassetgroup,
        requiredfields: JSON.parse(req.body.requiredfields),
        checkingNewtable: JSON.parse(req.body.checkingNewtable),
        companyRaise: JSON.parse(req.body.companyRaise),
        employeenameRaise: JSON.parse(req.body.employeenameRaise),
        selfcheckpointsmaster: JSON.parse(req.body.selfcheckpointsmaster),
        addedby: JSON.parse(req.body.addedby),
        forwardedlog: JSON.parse(req.body.forwardedlog),
        files: documents
      }

      let araiseticket = await Raiseticketmaster.create(ticketData);
      return res.status(200).json({
        message: "Successfully added!",
        araiseticket
      });

    } catch (err) {
      console.log(err, 'rr')
      return next(new ErrorHandler("Error uploading files!", 500));
    }
  }),
];


exports.editRaiseTicketMulter = [
  upload.array('files'), // Accept multiple files with the field name 'files'
  catchAsyncErrors(async (req, res, next) => {
    try {
      const id = req.params.id;
      const deletedimages = JSON.parse(req.body.deletedimages || '[]');
      // Delete files from multer directory
      deletedimages.forEach(filename => {
        const filePath = path.join(__dirname, "../../../raiseTicketMaster", filename);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filename}:`, err.message);
          } else {
            console.log(`Successfully deleted file: ${filename}`);
          }
        });
      });

      const oldImages = JSON.parse(req.body.oldimages) || [];
      // File info (multiple files)
      const documents = req.files?.map(file => ({
        name: file.filename,
        path: file.path,
        size: file.size,
      })) || [];

      const ticketData = {
        accessdrop: req.body.accessdrop,
        branch: req.body.branch,
        company: JSON.parse(req.body.company),
        raiseticketcount: req.body.raiseticketcount,
        raisedby: req.body.raisedby,
        raiseddate: req.body.raiseddate,
        resolverby: JSON.parse(req.body.resolverby),
        unit: req.body.unit,
        team: req.body.team,
        accessEmp: req.body.accessEmp,
        resolvedate: req.body.resolvedate,
        category: req.body.category,
        subcategory: req.body.subcategory,
        subsubcategory: req.body.subsubcategory,
        type: req.body.type,
        reason: req.body.reason,
        raiseTeamGroup: req.body.raiseTeamGroup,
        status: req.body.status,
        priority: req.body.priority,
        duedate: req.body.duedate,
        title: req.body.title,
        raiseself: req.body.raiseself,
        workstation: req.body.workstation,
        materialname: req.body.materialname,
        materialcode: req.body.materialcode,
        marginQuill: req.body.marginQuill,
        orientationQuill: req.body.orientationQuill,
        pagesizeQuill: req.body.pagesizeQuill,
        materialnamecut: req.body.materialnamecut,
        description: req.body.description,
        employeename: req.body.accessdrop === "Employee" ? req.body.employeename : JSON.parse(req.body.employeename),
        employeecode: req.body.accessdrop === "Employee" ? req.body.employeecode : JSON.parse(req.body.employeecode),
        checkRaiseResolve: req.body.checkRaiseResolve,
        workassetgroup: req.body.workassetgroup,
        requiredfields: JSON.parse(req.body.requiredfields),
        checkingNewtable: JSON.parse(req.body.checkingNewtable),
        companyRaise: JSON.parse(req.body.companyRaise),
        deletedimages: JSON.parse(req.body.deletedimages),
        oldimages: oldImages,
        employeenameRaise: JSON.parse(req.body.employeenameRaise),
        selfcheckpointsmaster: JSON.parse(req.body.selfcheckpointsmaster),
        updatedby: JSON.parse(req.body.updatedby),
        forwardedlog: JSON.parse(req.body.forwardedlog),
        files: [...oldImages, ...documents]
      }
      let uraiseticket = await Raiseticketmaster.findByIdAndUpdate(id, ticketData);
      if (!uraiseticket) {
        return next(new ErrorHandler("Raise Ticket not found", 404));
      }

      return res.status(200).json({ message: "Updated successfully" });
      // let araiseticket = await Raiseticketmaster.create(ticketData);
      // return res.status(200).json({
      //   message: "Successfully added!",
      // });

    } catch (err) {
      console.log(err, 'rr')
      return next(new ErrorHandler("Error uploading files!", 500));
    }
  }),
];




