
const SalarySlab = require("../../../model/modules/setup/SalarySlabModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");



exports.getSalarySlabProcessQueue = catchAsyncErrors(async (req, res, next) => {
  let salaryslab;
  try {
    salaryslab = await SalarySlab.find({}, { processqueue: 1, _id: 0 }).lean();
    const uniqueProcessQueue = [
      ...new Set(salaryslab.flatMap(item => item.processqueue))
    ];
    return res.status(200).json({
      processqueue: uniqueProcessQueue,
    });
  } catch (err) {
    return next(new ErrorHandler("Error fetching records!", 500));
  }

});

// get All SalarySlab => /api/salaryslabs
exports.getAllSalarySlab = catchAsyncErrors(async (req, res, next) => {
  let salaryslab;
  try {
    salaryslab = await SalarySlab.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!salaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    salaryslab,
  });
});

// get All SalarySlab => /api/salaryslabs
exports.getsalarySlabProcessFilter = catchAsyncErrors(async (req, res, next) => {
  let salaryslab, uniqueSalarySlab;
  try {
    salaryslab = await SalarySlab.find({ processqueue: req.body.process }, { salarycode: 1, processqueue: 1 });
    // uniqueSalarySlab = Array.from(new Set(salaryslab.map(item => item.salarycode)));

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!salaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    salaryslab,
  });
});

// get All SalarySlab => /api/salaryslabs
exports.salarySlabFilter = catchAsyncErrors(async (req, res, next) => {
  let salaryslab;
  try {

    salaryslab = await SalarySlab.find({}, {
      company: 1, branch: 1, salarycode: 1, basic: 1, hra: 1, salaryslablimited: 1,
      medicalallowance: 1, conveyance: 1, productionallowance: 1, productionallowancetwo: 1, otherallowance: 1, esipercentage: 1, esimaxsalary: 1,
      pfpercentage: 1, pfemployeepercentage: 1, esiemployeepercentage: 1

    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!salaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    salaryslab,
  });
});


// Create new SalarySlab=> /api/salaryslab/new
exports.addSalarySlab = catchAsyncErrors(async (req, res, next) => {

  let asalaryslab = await SalarySlab.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle SalarySlab => /api/salaryslab/:id
exports.getSingleSalarySlab = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let ssalaryslab = await SalarySlab.findById(id);

  if (!ssalaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    ssalaryslab,
  });
});

// update SalarySlab by id => /api/salaryslab/:id
exports.updateSalarySlab = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let usalaryslab = await SalarySlab.findByIdAndUpdate(id, req.body);
  if (!usalaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete SalarySlab by id => /api/salaryslab/:id
exports.deleteSalarySlab = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dsalaryslab = await SalarySlab.findByIdAndRemove(id);

  if (!dsalaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});


exports.getsalarySlabProcessFilterSort = catchAsyncErrors(async (req, res, next) => {
  let totalProjects, result, totalPages, currentPage;

  const { frequency, page, pageSize } = req.body;
  try {

    totalProjects = await SalarySlab.countDocuments();


    result = await SalarySlab.find()
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


exports.getAllSalarySlabListFilter = catchAsyncErrors(async (req, res, next) => {
  let salaryslab;
  try {

    const { company, branch, process } = req.body;
    let query = {};

    if (company && company.length > 0) {
      query.company = { $in: company };
    }

    if (branch && branch.length > 0) {
      query.branch = { $in: branch };
    }

    if (process && process.length > 0) {
      query.processqueue = { $in: process };
    }



    salaryslab = await SalarySlab.find(query);

    return res.status(200).json({
      salaryslab,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

exports.salarySlabFilterAssignbranch = catchAsyncErrors(async (req, res, next) => {
  const { assignbranch } = req.body;



  const query = {}
  if (assignbranch.length > 0) {
    query.$or = assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
    }))
  };

  let salaryslab;
  try {

    salaryslab = await SalarySlab.find(query, {
      company: 1, branch: 1, salarycode: 1, basic: 1, hra: 1, salaryslablimited: 1,
      medicalallowance: 1, conveyance: 1, productionallowance: 1, productionallowancetwo: 1, otherallowance: 1, esipercentage: 1, esimaxsalary: 1,
      pfpercentage: 1, pfemployeepercentage: 1, esiemployeepercentage: 1

    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!salaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    salaryslab,
  });
});


// exports.getsalarySlabProcessFilterSortByAssignBranch = catchAsyncErrors(async (req, res, next) => {
//   const { page, pageSize, allFilters, logicOperator, searchQuery } = req.body;

//   let query = {};
//   let conditions = [];


//   // Advanced search filter
//   if (allFilters && allFilters.length > 0) {
//     allFilters.forEach(filter => {
//       if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
//         conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
//       }
//     });
//   }

//   if (searchQuery) {
//     const searchTermsArray = searchQuery.split(" ");
//     const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

//     // const orConditions = regexTerms.map((regex) => ({
//     //   $or: [
//     //     { company: regex },
//     //     { branch: regex },
//     //     { salarycode: regex },
//     //     { processqueue: regex },
//     //     { checkinput: regex },

//     //   ],
//     // }));

//     const orConditions = regexTerms.map((regex) => {
//       const numValue = parseFloat(searchQuery); // Attempt to convert the searchQuery to a number
//       const numericConditions = [];

//       // Add numeric fields if conversion is successful
//       if (!isNaN(numValue)) {
//         numericConditions.push(
//           { basic: numValue },
//           { hra: numValue },
//           { conveyance: numValue },
//           { medicalallowance: numValue },
//           { productionallowance: numValue },
//           { productionallowancetwo: numValue },
//           { otherallowance: numValue },
//           { shiftallowance: numValue },
//           { esipercentage: numValue },
//           { esimaxsalary: numValue },
//           { esiemployeepercentage: numValue },
//           { pfpercentage: numValue },
//           { pfemployeepercentage: numValue },

//         );
//       }

//       return {
//         $or: [
//           { company: regex },
//           { branch: regex },
//           { salarycode: regex },   // String comparison for text-based fields
//           { processqueue: regex },
//           { checkinput: regex },
//           ...numericConditions      // Add numeric comparisons
//         ],
//       };
//     });

//     query = {
//       $and: [
//         ...orConditions,
//       ],
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

//     const totalProjects = await SalarySlab.countDocuments(query);
//     const overallitems = await SalarySlab.find({});
//     const result = await SalarySlab.find(query)
//       .select("")
//       .lean()
//       .skip((page - 1) * pageSize)
//       .limit(parseInt(pageSize))
//       .exec();

//     res.status(200).json({
//       totalProjects,
//       result,
//       currentPage: page,
//       totalPages: Math.ceil(totalProjects / pageSize),
//       overallitems
//     });


//   } catch (err) {
//     console.log(err)
//     return next(new ErrorHandler("Records not found!", 404));
//   }
// });

exports.getsalarySlabProcessFilterSortByAssignBranch = catchAsyncErrors(async (req, res, next) => {

  const { page, pageSize, allFilters, logicOperator, searchQuery, assignbranch, companies, branches, process } = req.body;

  let query = {
    $or: assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
    }))
  };



  let queryoverall = {
    $or: assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
    }))
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

  if (searchQuery) {
    const searchTermsArray = searchQuery.split(" ");
    const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

    const orConditions = regexTerms.map((regex) => {
      const numValue = parseFloat(searchQuery); // Attempt to convert the searchQuery to a number
      const numericConditions = [];

      // Add numeric fields if conversion is successful
      if (!isNaN(numValue)) {
        numericConditions.push(
          { basic: numValue },
          { hra: numValue },
          { conveyance: numValue },
          { medicalallowance: numValue },
          { productionallowance: numValue },
          { productionallowancetwo: numValue },
          { otherallowance: numValue },
          { shiftallowance: numValue },
          { esipercentage: numValue },
          { esimaxsalary: numValue },
          { esiemployeepercentage: numValue },
          { pfpercentage: numValue },
          { pfemployeepercentage: numValue },

        );
      }

      return {
        $or: [
          { company: regex },
          { branch: regex },
          { salarycode: regex },   // String comparison for text-based fields
          { processqueue: regex },
          { checkinput: regex },
          ...numericConditions      // Add numeric comparisons
        ],
      };
    });

    query = {
      $and: [
        {
          $or: assignbranch.map(item => ({
            company: item.company,
            branch: item.branch,
          }))
        },
        ...orConditions,
      ],
    };
  }


  // Adding companies, branches, and processes filters if they exist
  if (companies?.length > 0) {
    query.company = { $in: companies };
    queryoverall.company = { $in: companies };
  }
  if (branches?.length > 0) {
    query.branch = { $in: branches };
    queryoverall.branch = { $in: branches };
  }
  if (process?.length > 0) {
    query.processqueue = { $in: process };
    queryoverall.processqueue = { $in: process };
  }



  // Apply logicOperator to combine conditions
  if (conditions.length > 0) {
    if (logicOperator === "AND") {
      query.$and = conditions;
    } else if (logicOperator === "OR") {
      query.$or = conditions;
    }
  }

  console.log(query);
  try {

    const totalProjects = await SalarySlab.countDocuments(query);
    const overallitems = await SalarySlab.find(queryoverall);
    const result = await SalarySlab.find(query)
      .select("")
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();

    res.status(200).json({
      totalProjects,
      result,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
      overallitems
    });


  } catch (err) {
    console.log(err)
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

exports.salarySlabFilterAssignbranchHome = catchAsyncErrors(async (req, res, next) => {

  let salaryslab;
  try {

    salaryslab = await SalarySlab.find({ salarycode: { $in: req.body.processcode } }, {
      company: 1, branch: 1, salarycode: 1, basic: 1, hra: 1, salaryslablimited: 1,
      medicalallowance: 1, conveyance: 1, productionallowance: 1, productionallowancetwo: 1, otherallowance: 1, esipercentage: 1, esimaxsalary: 1,
      pfpercentage: 1, pfemployeepercentage: 1, esiemployeepercentage: 1

    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!salaryslab) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    salaryslab,
  });
});