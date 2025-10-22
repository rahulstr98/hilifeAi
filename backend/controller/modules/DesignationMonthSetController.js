const DesignationMonthSet = require("../../model/modules/DesignationMonthSetModel");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");

// get All DesignationMonthSet Details => /api/designationmonthsets

exports.getAllDesignationMonthSet = catchAsyncErrors(async (req, res, next) => {
  let designationmonthsets;

  try {
    designationmonthsets = await DesignationMonthSet.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!designationmonthsets) {
    return next(new ErrorHandler("DesignationMonthSet details not found", 404));
  }

  return res.status(200).json({
    designationmonthsets,
  });
});

// Create new DesignationMonthSet => /api/designationmonthset/new
exports.addDesignationMonthSet = catchAsyncErrors(async (req, res, next) => {
  let adesignationmonthset = await DesignationMonthSet.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle DesignationMonthSet => /api/designationmonthset/:id

exports.getSingleDesignationMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sdesignationmonthset = await DesignationMonthSet.findById(id);

  if (!sdesignationmonthset) {
    return next(new ErrorHandler("DesignationMonthSet not found", 404));
  }

  return res.status(200).json({
    sdesignationmonthset,
  });
});

// update DesignationMonthSet by id => /api/designationmonthset/:id

exports.updateDesignationMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let udesignationmonthset = await DesignationMonthSet.findByIdAndUpdate(id, req.body);

  if (!udesignationmonthset) {
    return next(new ErrorHandler("DesignationMonthSet Details not found", 404));
  }

  return res.status(200).json({ message: "Updates successfully" });
});

// delete DesignationMonthSet by id => /api/designationmonthset/:id
exports.deleteDesignationMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ddesignationmonthset = await DesignationMonthSet.findByIdAndRemove(id);
  if (!ddesignationmonthset) {
    return next(new ErrorHandler("DesignationMonthSet Month Set not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});
exports.getAllDesignationmonthByPagination = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, searchQuery, allFilters,
    logicOperator } = req.body;

  let designationmonthsets;
  let totalDatas, paginatedData, totalDatasOverallData, isEmptyData, result;

  try {
    const anse = await DesignationMonthSet.find()
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
          { designation: regex },
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


    totalDatas = await DesignationMonthSet.countDocuments(query);
    totalDatasOverallData = await DesignationMonthSet.find();

    designationmonthsets = await DesignationMonthSet.find(query).skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    result = isEmptyData ? designationmonthsets : paginatedData


    if (!designationmonthsets) {
      return next(new ErrorHandler("DesignationMonthSet details not found", 404));
    }

    return res.status(200).json({
      designationmonthsets,
      totalDatas,
      paginatedData,
      result,
      totalDatasOverallData,
      currentPage: (isEmptyData ? page : 1),
      // totalPages: Math.ceil((isEmptyData ? totalDatas : paginatedData?.length) / pageSize),
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