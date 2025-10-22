const ProcessTeam = require("../../../model/modules/production/ProcessTeamModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All ProcessTeam => /api/processteams
exports.getAllProcessTeam = catchAsyncErrors(async (req, res, next) => {
  let processteam;
  try {
    processteam = await ProcessTeam.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!processteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    processteam,
  });
});

exports.processTeamSort = catchAsyncErrors(async (req, res, next) => {
  let totalProjects, result, totalProjectsAllData, totalPages, currentPage;

  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, } = req.body;

  // const query = {
  //   $or: assignbranch.map(item => ({
  //     company: item.company,
  //     branch: item.branch,
  //   }))
  // };
  console.log(allFilters, "all")
  try {

    let query = {};

    const conditions = [];

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
          { company: regex },
          { branch: regex },
          { unit: regex },
          { team: regex },
          { process: regex },
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

    const branchFilters = assignbranch?.map(branchObj => ({
      company: branchObj.company,
      branch: branchObj.branch,
      unit: branchObj.unit,
    }));

    const combinedFilter = {
      $and: [
        query,
        { $or: branchFilters },
      ],
    };



    totalProjects = await ProcessTeam.countDocuments(combinedFilter);
    totalProjectsAllData = await ProcessTeam.find(combinedFilter);

    result = await ProcessTeam.find(combinedFilter)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    totalProjects,
    result,
    totalProjectsAllData,
    currentPage: page,
    totalPages: Math.ceil(totalProjects / pageSize),
  });
});

exports.getFilterProcessNamesLimited = catchAsyncErrors(async (req, res, next) => {
  let processteam;
  try {

    processteam = await ProcessTeam.find({}, { _id: 0, process: 1, company: 1, branch: 1, unit: 1, team: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!processteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    processteam,
  });
});

exports.getFilterProcessNames = catchAsyncErrors(async (req, res, next) => {
  let processteam;
  try {
    let query = {};
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers") {
        const value = req.body[key];
        if (value !== "ALL") {
          query[key] = value.toString();
        }
      }
    });
    processteam = await ProcessTeam.find(query);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!processteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    processteam,
  });
});

// Create new ProcessTeam=> /api/processteam/new
exports.addProcessTeam = catchAsyncErrors(async (req, res, next) => {
  let aprocessteam = await ProcessTeam.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProcessTeam => /api/processteam/:id
exports.getSingleProcessTeam = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sprocessteam = await ProcessTeam.findById(id);

  if (!sprocessteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sprocessteam,
  });
});

// update ProcessTeam by id => /api/processteam/:id
exports.updateProcessTeam = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uprocessteam = await ProcessTeam.findByIdAndUpdate(id, req.body);
  if (!uprocessteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete ProcessTeam by id => /api/processteam/:id
exports.deleteProcessTeam = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dprocessteam = await ProcessTeam.findByIdAndRemove(id);

  if (!dprocessteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.getAllProcessTeamAssignbranch = catchAsyncErrors(async (req, res, next) => {
  const { assignbranch } = req.body;

  const query = {
    $or: assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
    }))
  };

  let processteam;
  try {
    processteam = await ProcessTeam.find(query);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!processteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    processteam,
  });
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

exports.getFilterProcessLimitedCompanyBranch = catchAsyncErrors(async (req, res, next) => {
  let processteam;
  try {
    processteam = await ProcessTeam.find({ company: { $in: req.body.company }, branch: { $in: req.body.branch }, unit: { $in: req.body.unit } }, { _id: 0, process: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  if (!processteam) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    processteam,
  });
});
