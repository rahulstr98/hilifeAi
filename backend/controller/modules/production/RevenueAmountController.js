const RevenueAmount = require("../../../model/modules/production/RevenueAmountModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All RevenueAmount => /api/revenueamounts
exports.getAllRevenueAmount = catchAsyncErrors(async (req, res, next) => {
  let revenueamounts;
  try {
    revenueamounts = await RevenueAmount.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!revenueamounts) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    revenueamounts,
  });
});

// get All RevenueAmount => /api/revenueamounts
exports.getRevenueamountLimited = catchAsyncErrors(async (req, res, next) => {
  let revenueamounts;
  try {
    revenueamounts = await RevenueAmount.find({}, { company: 1, branch: 1, processcode: 1, amount: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!revenueamounts) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    revenueamounts,
  });
});

// get All RevenueAmount => /api/revenueamounts
exports.getRevenueamountLimited = catchAsyncErrors(async (req, res, next) => {
  let revenueamounts;
  try {
    revenueamounts = await RevenueAmount.find({}, { company: 1, branch: 1, processcode: 1, amount: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!revenueamounts) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    revenueamounts,
  });
});

// Create new RevenueAmount=> /api/revenueamount/new
exports.addRevenueAmount = catchAsyncErrors(async (req, res, next) => {
  let arevenueamount = await RevenueAmount.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle RevenueAmount => /api/revenueamount/:id
exports.getSingleRevenueAmount = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let srevenueamount = await RevenueAmount.findById(id);

  if (!srevenueamount) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    srevenueamount,
  });
});

// update RevenueAmount by id => /api/revenueamount/:id
exports.updateRevenueAmount = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let urevenueamount = await RevenueAmount.findByIdAndUpdate(id, req.body);
  if (!urevenueamount) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete RevenueAmount by id => /api/revenueamount/:id
exports.deleteRevenueAmount = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let drevenueamount = await RevenueAmount.findByIdAndRemove(id);

  if (!drevenueamount) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});
// exports.getOverallRevenueAmountSort = catchAsyncErrors(async (req, res, next) => {
//   let totalProjects, result, totalProjectsAllData, totalPages, currentPage;


//   const { page, assignbranch, pageSize } = req.body;

//   const query = {
//     $or: assignbranch.map(item => ({
//       company: item.company,
//       branch: item.branch,
//     }))
//   };
//   try {

//     totalProjects = await RevenueAmount.countDocuments(query);
//     totalProjectsAllData = await RevenueAmount.find(query);

//     result = await RevenueAmount.find()
//       .skip((page - 1) * pageSize)
//       .limit(parseInt(pageSize));

//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }

//   return res.status(200).json({
//     totalProjects,
//     result,
//     totalProjectsAllData,
//     currentPage: page,
//     totalPages: Math.ceil(totalProjects / pageSize),
//   });
// });

exports.getOverallRevenueAmountSort = catchAsyncErrors(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    assignbranch = [],
    allFilters = [],
    logicOperator = "AND",
    searchQuery = "",
    company = [],
    branch = [],
    processcode = [],
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
    // processcode: { $in: processcode },
    processcode: { $in: processcode.map(item => new RegExp("^" + item)) },
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
        { processcode: regex },
        { amount: regex }
      ],
    }));

    query = {
      $and: [
        { processcode: { $in: processcode.map(item => new RegExp("^" + item)) }, company: { $in: company }, branch: { $in: branch } },
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
    const totalProjects = await RevenueAmount.countDocuments(query);
    const totalProjectsdata = await RevenueAmount.find(queryoverall);
    const totalProjectsAllData = assignbranch.length
      ? await RevenueAmount.find(querynonfilteroverall)
      : [];

    const result = await RevenueAmount.find(query)
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
    return next(new ErrorHandler("An error occurred while fetching records!", 500));
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


exports.revenueAmountfileDel = catchAsyncErrors(
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
      await RevenueAmount.deleteMany({ _id: { $in: batchIds } });
    }

    return res
      .status(200)
      .json({ message: "Deleted successfully", success: true });
  }
);

exports.getAllRevenueAmountAssignBranch = catchAsyncErrors(async (req, res, next) => {

  const { assignbranch } = req.body;
  const query = {
    $or: assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
    }))
  };

  let revenueamounts;
  try {
    revenueamounts = await RevenueAmount.find(query);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!revenueamounts) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    revenueamounts,
  });
});

exports.getRevenueamountLimitedHome = catchAsyncErrors(async (req, res, next) => {
  let revenueamounts;
  try {
    revenueamounts = await RevenueAmount.find({ processcode: { $in: req.body.processcode } }, { company: 1, branch: 1, processcode: 1, amount: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!revenueamounts) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    revenueamounts,
  });
});

// Filter functionality
exports.getRevenueamountFilter = catchAsyncErrors(async (req, res, next) => {
  const { company, branch, processcode, page, pageSize } = req.body;

  try {
    // Query the database with filters
    const query = {
      // processcode: { $in: processcode },
      processcode: { $in: processcode.map(item => new RegExp("^" + item)) },
      company: { $in: company },
      branch: { $in: branch },
    };


    const totalProjects = await RevenueAmount.countDocuments(query)
    const totalProjectsdata = await RevenueAmount.find(query)
    const revenueamountFilters = await RevenueAmount.find(query)
      .select("")
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();

    res.status(200).json({
      totalProjects,
      totalProjectsdata,
      revenueamountFilters,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    // Catch and return errors
    return next(new ErrorHandler(err.message || "Error fetching target points!", 500));
  }
});