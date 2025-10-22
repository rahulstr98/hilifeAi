const MinimumPoints = require("../../../model/modules/production/minimumpoints");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All MinimumPoints => /api/minimumpointss
exports.getAllMinimumPoints = catchAsyncErrors(async (req, res, next) => {
  let minimumpoints;
  try {
    minimumpoints = await MinimumPoints.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!minimumpoints) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    minimumpoints,
  });
});

// Create new MinimumPoints=> /api/minimumpoints/new
exports.addMinimumPoints = catchAsyncErrors(async (req, res, next) => {
  let aminimumpoints = await MinimumPoints.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle MinimumPoints => /api/minimumpoints/:id
exports.getSingleMinimumPoints = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sminimumpoints = await MinimumPoints.findById(id);

  if (!sminimumpoints) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sminimumpoints,
  });
});

// update MinimumPoints by id => /api/minimumpoints/:id
exports.updateMinimumPoints = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uminimumpoints = await MinimumPoints.findByIdAndUpdate(id, req.body);
  if (!uminimumpoints) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete MinimumPoints by id => /api/minimumpoints/:id
exports.deleteMinimumPoints = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dminimumpoints = await MinimumPoints.findByIdAndRemove(id);

  if (!dminimumpoints) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.deleteMultipleMinimumPoints = catchAsyncErrors(
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
      await MinimumPoints.deleteMany({ _id: { $in: batchIds } });
    }

    return res
      .status(200)
      .json({ message: "Deleted successfully", success: true });
  }
);

exports.getAllMinimumPointsAcessbranch = catchAsyncErrors(async (req, res, next) => {
  const { assignbranch } = req.body;

  const query = {
    $or: assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
      unit: item.unit,
    }))
  };

  let minimumpoints;
  try {
    minimumpoints = await MinimumPoints.find(query);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!minimumpoints) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    minimumpoints,
  });
});

exports.getAllMinimumPointsSort = catchAsyncErrors(async (req, res, next) => {
  let totalProjects, result, totalProjectsdata, currentPage;

  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, } = req.body;


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
          { name: regex },
          { empcode: regex },
          { team: regex },
          { department: regex },
          { totalpaiddays: regex },
          { monthpoint: regex },
          { daypoint: regex },
          { year: regex },
          { month: regex },
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

    totalProjects = await MinimumPoints.countDocuments(combinedFilter);
    totalProjectsdata = await MinimumPoints.find(combinedFilter);

    result = await MinimumPoints.find(combinedFilter)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));



    return res.status(200).json({
      totalProjects,
      totalProjectsdata,
      result,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
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
