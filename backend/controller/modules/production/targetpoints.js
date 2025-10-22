const Targetpoints = require("../../../model/modules/production/targetpoints");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const User = require("../../../model/login/auth");

// get All targetpoints => /api/targetpoints
exports.getAlltargetpoints = catchAsyncErrors(async (req, res, next) => {
  let targetpoints;
  try {
    targetpoints = await Targetpoints.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!targetpoints) {
    return next(new ErrorHandler("Targetpoints not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    targetpoints,
  });
});

// get All targetpoints => /api/targetpoints
exports.getTargetpointslimited = catchAsyncErrors(async (req, res, next) => {
  let targetpoints;
  try {
    targetpoints = await Targetpoints.find({}, { company: 1, branch: 1, points: 1, processcode: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!targetpoints) {
    return next(new ErrorHandler("Targetpoints not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    targetpoints,
  });
});
// Create new targetpoints=> /api/targetpoints/new
exports.addtargetpoints = catchAsyncErrors(async (req, res, next) => {
  let atargetpoints = await Targetpoints.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle targetpoints => /api/targetpoints/:id
exports.getSingletargetpoints = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let stargetpoints = await Targetpoints.findById(id);

  if (!stargetpoints) {
    return next(new ErrorHandler("Targetpoints not found!", 404));
  }
  return res.status(200).json({
    stargetpoints,
  });
});

// update targetpoints by id => /api/targetpoints/:id
exports.updatetargetpoints = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let utargetpoints = await Targetpoints.findByIdAndUpdate(id, req.body);
  if (!utargetpoints) {
    return next(new ErrorHandler("Targetpoints not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete targetpoints by id => /api/targetpoints/:id
exports.deletetargetpoints = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dtargetpoints = await Targetpoints.findByIdAndRemove(id);

  if (!dtargetpoints) {
    return next(new ErrorHandler("Targetpoints not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

// exports.getOverallTargetpointsSort = catchAsyncErrors(async (req, res, next) => {
//   let totalProjects, result, totalProjectsAllData, currentPage;

//   const { page, pageSize, assignbranch } = req.body;

//   const query = {
//     $or: assignbranch.map(item => ({
//       company: item.company,
//       branch: item.branch,
//     }))
//   };

//   try {

//     totalProjects = await Targetpoints.find(query).countDocuments();
//     totalProjectsAllData = await Targetpoints.find(query);

//     result = await Targetpoints.find(query)
//       .skip((page - 1) * pageSize)
//       .limit(parseInt(pageSize));

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }

//   return res.status(200).json({
//     totalProjects,
//     result,
//     currentPage: page,
//     totalPages: Math.ceil(totalProjects / pageSize),
//     totalProjectsAllData
//   });
// });
exports.getOverallTargetpointsSort = catchAsyncErrors(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    assignbranch = [],
    allFilters = [],
    logicOperator = "AND",
    searchQuery = "",
    company = [],
    branch = [],
    process = [],
  } = req.body;


  const querynonfilteroverall = assignbranch.length
    ? {
      $or: assignbranch.map(item => ({
        company: item.company,
        branch: item.branch,
      })),
    }
    : {};

  let query = {
    code: { $in: process },
    company: { $in: company },
    branch: { $in: branch },
  };

  let queryoverall = { ...query };
  let conditions = [];

  // Advanced filters
  if (allFilters.length > 0) {
    allFilters.forEach(filter => {
      if (
        filter.column &&
        filter.condition &&
        (filter.value || ["Blank", "Not Blank"].includes(filter.condition))
      ) {
        conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
      }
    });
  }

  // Search query
  if (searchQuery) {
    const searchTermsArray = searchQuery.split(" ");
    const regexTerms = searchTermsArray.map(term => new RegExp(term, "i"));

    const orConditions = regexTerms.map(regex => ({
      $or: [
        { company: regex },
        { branch: regex },
        { experience: regex },
        { processcode: regex },
        { code: regex },
        { points: regex },
        { pointstable: regex },
      ],
    }));

    query = {
      $and: [
        { code: { $in: process }, company: { $in: company }, branch: { $in: branch } },
        ...orConditions,
      ],
    };
  }

  // Apply logic operator
  if (conditions.length > 0) {
    if (logicOperator === "AND") {
      query.$and = [...(query.$and || []), ...conditions];
    } else if (logicOperator === "OR") {
      query.$or = [...(query.$or || []), ...conditions];
    }
  }


  try {
    const totalProjects = await Targetpoints.countDocuments(query);
    const totalProjectsdata = await Targetpoints.find(queryoverall);
    const totalProjectsAllData = assignbranch.length
      ? await Targetpoints.find(querynonfilteroverall)
      : [];

    const result = await Targetpoints.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .lean();

    res.status(200).json({
      totalProjects,
      totalProjectsdata,
      totalProjectsAllData,
      result,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.error("Error Fetching Records:", err.message);
    return next(new ErrorHandler("An error occurred while fetching records!", 500));
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
exports.targetpointsbulkdelete = catchAsyncErrors(
  async (req, res, next) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler("Invalid IDs provided", 400));
    }
    // Define a batch size for deletion
    // const batchSize = Math.ceil(ids.length / 10);
    const batchSize = 10000;

    // Loop through IDs in batches
    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);

      // Delete records in the current batch
      await Targetpoints.deleteMany({ _id: { $in: batchIds } });
    }

    return res
      .status(200)
      .json({ message: "Deleted successfully", success: true });
  }
);

exports.getTargetpointslimitedAssignedbranch = catchAsyncErrors(async (req, res, next) => {

  const { assignbranch } = req.body;
  const query = {
    $or: assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
    }))
  };


  let targetpoints;
  try {
    targetpoints = await Targetpoints.find(query, { company: 1, branch: 1, points: 1, processcode: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!targetpoints) {
    return next(new ErrorHandler("Targetpoints not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    targetpoints,
  });
});


exports.targetPointsFiltered = catchAsyncErrors(async (req, res, next) => {
  const { company, branch, unit } = req.body;
  let targetpointsusers;
  try {
    targetpointsusers = await User.find(
      {
        enquirystatus: {
          $nin: ["Enquiry Purpose"],
        },
        // $or: [{ reasondate: { $exists: false } }, { reasondate: "" }, { reasondate: { $gte: req.body.fromdate } }],
        resonablestatus: {
          $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
        },
        company: { $in: company },
        branch: { $in: branch },
        unit: { $in: unit },
      },
      { _id: 1, company: 1, branch: 1, unit: 1, experience: 1, doj: 1, team: 1, empcode: 1, companyname: 1, assignExpLog: 1, processlog: 1 }
    );
    // console.log(targetpointsusers[0]);
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!targetpointsusers) {
  //   return next(new ErrorHandler("Targetpoints not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    targetpointsusers,
  });
});
exports.targetPointsAllLimited = catchAsyncErrors(async (req, res, next) => {
  let targetpoints;
  try {
    targetpoints = await Targetpoints.find({}, { company: 1, branch: 1, processcode: 1, code: 1, points: 1 });
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!targetpoints) {
  //   return next(new ErrorHandler("Targetpoints not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    targetpoints,
  });
});


// Filter functionality
exports.getTargetpointsFilter = catchAsyncErrors(async (req, res, next) => {
  const { company, branch, process, page, pageSize } = req.body;

  try {
    // Query the database with filters
    const query = {
      code: { $in: process },
      company: { $in: company },
      branch: { $in: branch },
    };

    const totalProjects = await Targetpoints.countDocuments(query)
    const totalProjectsdata = await Targetpoints.find(query)
    const targetpointFilters = await Targetpoints.find(query)
      .select("")
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();

    res.status(200).json({
      totalProjects,
      totalProjectsdata,
      targetpointFilters,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });

  } catch (err) {
    // Catch and return errors
    return next(new ErrorHandler(err.message || "Error fetching target points!", 500));
  }
});

