const DepartmentMonth = require("../../model/modules/departmentmonthset");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");

// get All DepartmentMonth Details => /api/Departments

exports.getAllDepartmentmonth = catchAsyncErrors(async (req, res, next) => {
  let departmentdetails;

  try {
    departmentdetails = await DepartmentMonth.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!departmentdetails) {
    return next(new ErrorHandler("DepartmentMonth details not found", 404));
  }

  return res.status(200).json({
    departmentdetails,
  });
});
exports.getAllDepartmentmonthLimitedForLeave = catchAsyncErrors(async (req, res, next) => {
  let departmentdetails;

  try {
    departmentdetails = await DepartmentMonth.find({ department: req.body.empdepartment, year: req.body.year });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!departmentdetails) {
    return next(new ErrorHandler("DepartmentMonth details not found", 404));
  }

  return res.status(200).json({
    departmentdetails,
  });
});

exports.getAllDepartmentmonthLimited = catchAsyncErrors(async (req, res, next) => {
  let departmentdetails;

  try {
    departmentdetails = await DepartmentMonth.find({ monthname: req.body.monthname, year: req.body.year }, {
      department: 1, fromdate: 1, todate: 1, salary: 1, proftaxstop: 1
      , penalty: 1, esistop: 1, pfstop: 1
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!departmentdetails) {
    return next(new ErrorHandler("DepartmentMonth details not found", 404));
  }

  return res.status(200).json({
    departmentdetails,
  });
});

// get All DepartmentMonth Details => /api/Departments
exports.getAllDepartmentmonthProdLimited = catchAsyncErrors(async (req, res, next) => {
  let departmentdetails;
  try {
    const { date } = req.body;
    // departmentdetails = await DepartmentMonth.find({fromdate: { $gte: date },  todate: { $lte: date }}, { fromdate: 1, todate: 1, monthname: 1, department: 1 });
    departmentdetails = await DepartmentMonth.aggregate([
      {
        $addFields: {
          fromdate: { $toDate: "$fromdate" }, // Convert fromdate to Date format
          todate: { $toDate: "$todate" } // Convert todate to Date format
        }
      },
      {
        $match: {
          fromdate: { $lte: new Date(date) }, // Compare fromdate
          todate: { $gte: new Date(date) } // Compare todate
        }
      },
      {
        $project: {
          fromdate: 1,
          todate: 1,
          monthname: 1,
          department: 1
        }
      }
    ]);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!departmentdetails) {
    return next(new ErrorHandler("DepartmentMonth details not found", 404));
  }
  return res.status(200).json({
    departmentdetails,
  });
});

// Create new DepartmentMonth => /api/department/new
exports.addDepartmentDetailsmonth = catchAsyncErrors(async (req, res, next) => {
  let adepartmentdetails = await DepartmentMonth.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle DepartmentMonth => /api/department/:id

exports.getSingleDepartmentDetailsmonth = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sdepartmentdetails = await DepartmentMonth.findById(id);

  if (!sdepartmentdetails) {
    return next(new ErrorHandler("DepartmentMonth not found", 404));
  }

  return res.status(200).json({
    sdepartmentdetails,
  });
});

// update DepartmentMonth by id => /api/customer/:id

exports.updateDepartmentDetailsmonth = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let updepartmentdetails = await DepartmentMonth.findByIdAndUpdate(id, req.body);

  if (!updepartmentdetails) {
    return next(new ErrorHandler("DepartmentMonth Details not found", 404));
  }

  return res.status(200).json({ message: "Updates successfully" });
});

// delete DepartmentMonth by id => /api/customer/:id

// exports.deleteDepartmentDetailsmonth = catchAsyncErrors(async (req, res, next) => {
//     const id = req.params.id;
//     let ddepartmentdetails = await DepartmentMonth.findByIdAndRemove(id);

//     if (!ddepartmentdetails) {
//         return next(new ErrorHandler('DepartmentMonth Details not found', 404));
//     }

//     return res.status(200).json({ message: 'Deleted successfully' });
// })

exports.deleteDepartmentDetailsmonth = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ddepartmentdetails = await DepartmentMonth.findByIdAndRemove(id);
  if (!ddepartmentdetails) {
    return next(new ErrorHandler("DepartmentMonth Month Set not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});
exports.getAllDepartmentmonthByPagination = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, searchQuery, allFilters,
    logicOperator, } = req.body;

  let departmentdetails;
  let totalDatas, paginatedData, totalDatasWithAll, isEmptyData, result;

  try {
    const anse = await DepartmentMonth.find()
    const searchOverTerms = searchQuery?.toLowerCase()?.split(" ");
    const filteredDatas = anse?.filter((item, index) => {
      const itemString = JSON.stringify(item)?.toLowerCase();
      return searchOverTerms.every((term) => itemString.includes(term));
    })
    isEmptyData = searchOverTerms?.every(item => item.trim() === '');
    const pageSized = parseInt(pageSize);
    const pageNumberd = parseInt(page);

    paginatedData = filteredDatas.slice((pageNumberd - 1) * pageSized, pageNumberd * pageSize);

    let query = {};
    // Advanced search filter
    const conditions = [];

    if (allFilters && allFilters.length > 0) {
      allFilters.forEach((filter) => {
        if (filter.column === "month" && filter.condition === "Contains" && filter.value) {
          const monthValue = filter.value; // Get the mapped month name
          if (monthValue) {
            conditions.push({ monthname: new RegExp(monthValue, "i") }); // Use regex to match monthname
          }
        } else if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
          // Handle other filters dynamically
          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      });
    }

    // Add search query filter
    if (searchQuery && searchQuery !== undefined) {
      const searchTermsArray = searchQuery.split(" ");
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

      const orConditions = regexTerms.map((regex) => ({
        $or: [
          { department: regex },
          { year: regex },
          { monthname: regex },
          { fromdate: regex },
          { todate: regex },
          // { salary: regex },
          // { proftaxstop: regex },
          // { penalty: regex },
          // { esistop: regex },
          // { pfstop: regex },
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
      // conditions.push(...orConditions);
    }

    // Apply logicOperator to combine conditions
    if (conditions.length > 0) {
      if (logicOperator === "AND") {
        query.$and = conditions;
      } else if (logicOperator === "OR") {
        query.$or = conditions;
      }
    }

    totalDatas = await DepartmentMonth.countDocuments(query);
    totalDatasWithAll = await DepartmentMonth.find()

    departmentdetails = await DepartmentMonth.find(query).skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    result = isEmptyData ? departmentdetails : paginatedData


    if (!departmentdetails) {
      return next(new ErrorHandler("DepartmentMonth details not found", 404));
    }

    return res.status(200).json({
      departmentdetails,
      totalDatas,
      paginatedData,
      result,
      totalDatasWithAll,
      currentPage: (isEmptyData ? page : 1),
      totalPages: Math.ceil(totalDatas / pageSize),
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

exports.getYearMonthDepartmentmonth = catchAsyncErrors(async (req, res, next) => {
  let departmentdetails;

  try {
    departmentdetails = await DepartmentMonth.find({year:req.body.year, monthname:req.body.month});
  
    if (!departmentdetails) {
      return next(new ErrorHandler("Data not found", 404));
    }
  
    return res.status(200).json({
      departmentdetails,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  
});