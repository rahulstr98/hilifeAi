const ProcessMonthSet = require("../../model/modules/ProcessMonthSetModel");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");

// get All ProcessMonthSet Details => /api/processmonthsets

exports.getAllProcessMonthSet = catchAsyncErrors(async (req, res, next) => {
  let processmonthsets;

  try {
    processmonthsets = await ProcessMonthSet.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!processmonthsets) {
    return next(new ErrorHandler("ProcessMonthSet details not found", 404));
  }

  return res.status(200).json({
    processmonthsets,
  });
});

// Create new ProcessMonthSet => /api/processmonthset/new
exports.addProcessMonthSet = catchAsyncErrors(async (req, res, next) => {
  let aprocessmonthset = await ProcessMonthSet.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProcessMonthSet => /api/processmonthset/:id

exports.getSingleProcessMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sprocessmonthset = await ProcessMonthSet.findById(id);

  if (!sprocessmonthset) {
    return next(new ErrorHandler("ProcessMonthSet not found", 404));
  }

  return res.status(200).json({
    sprocessmonthset,
  });
});

// update ProcessMonthSet by id => /api/processmonthset/:id

exports.updateProcessMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let uprocessmonthset = await ProcessMonthSet.findByIdAndUpdate(id, req.body);

  if (!uprocessmonthset) {
    return next(new ErrorHandler("ProcessMonthSet Details not found", 404));
  }

  return res.status(200).json({ message: "Updates successfully" });
});

// delete ProcessMonthSet by id => /api/processmonthset/:id
exports.deleteProcessMonthSet = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dprocessmonthset = await ProcessMonthSet.findByIdAndRemove(id);
  if (!dprocessmonthset) {
    return next(new ErrorHandler("ProcessMonthSet Month Set not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});
exports.getAllProcessmonthByPagination = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, searchQuery, allFilters,
    logicOperator } = req.body;

  let processmonthsets;
  let totalDatas, paginatedData, totalDatasOverallData, isEmptyData, result;

  try {
    const anse = await ProcessMonthSet.find()
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
          { process: regex },
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


    totalDatas = await ProcessMonthSet.countDocuments(query);
    totalDatasOverallData = await ProcessMonthSet.find();

    processmonthsets = await ProcessMonthSet.find(query).skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    result = isEmptyData ? processmonthsets : paginatedData


    if (!processmonthsets) {
      return next(new ErrorHandler("ProcessMonthSet details not found", 404));
    }

    return res.status(200).json({
      processmonthsets,
      totalDatas,
      paginatedData,
      result, totalDatasOverallData,
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