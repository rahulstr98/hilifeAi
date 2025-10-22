const Stock = require("../../../model/modules/stockpurchase/stock");
const User = require("../../../model/login/auth");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");



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

//get All Stocks =>/api/stock
exports.getAllStock = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {
    stock = await Stock.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});

// exports.getAllStockAccess = catchAsyncErrors(async (req, res, next) => {
//   let stock;
//   try {
//     const { assignbranch } = req.body;
//     let filterQuery = {};

//     // Construct the filter query based on the assignbranch array
//     const branchFilter = assignbranch.map((branchObj) => ({
//       branch: branchObj.branch,
//       company: branchObj.company,
//       unit: branchObj.unit,
//     }));

//     // Use $or to filter incomes that match any of the branch, company, and unit combinations
//     // if (branchFilter.length > 0) {
//     filterQuery = { $or: branchFilter };

//     console.log(filterQuery, "filter")
//     // }
//     stock = await Stock.find(filterQuery);
//   } catch (err) {
//     console.log(err, "sdf")
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!stock) {
//     return next(new ErrorHandler("Stock not found!", 404));
//   }
//   return res.status(200).json({
//     stock,
//   });
// });


exports.getAllStockAccess = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, requestmode } = req.body;
  // console.log(req.body, "bodypurchase")
  let query = {};
  // Construct the filter query based on the assignbranch array
  const branchFilter = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));

  query = {
    $or: branchFilter,
    requestmode: "Asset Material"

  };

  let queryoverall = {};
  // Construct the filter query based on the assignbranch array
  const branchFilterOverall = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));

  queryoverall = { $or: branchFilterOverall, requestmode: "Asset Material" };

  let conditions = [];

  // Advanced search filter
  if (allFilters && allFilters.length > 0) {
    allFilters.forEach(filter => {
      console.log(filter, "filter")
      if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
        if (filter.column == "purchasedate" || filter.column == "billdate") {
          const [day, month, year] = filter.value.split("/")
          let formattedValue = `${year}-${month}-${day}`
          conditions.push(createFilterCondition(filter.column, filter.condition, formattedValue));
        }
        else {

          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      }
    });
  }



  if (searchQuery && searchQuery !== undefined) {
    const searchTermsArray = searchQuery.split(" ").filter(term => term.trim() !== ""); // Remove empty terms
    const regexTerms = searchTermsArray.map((term) => {
      if (!isNaN(term)) {
        return parseInt(term, 10); // Convert numeric term to Number
      }

      // Check if the term is in the date format DD/MM/YYYY
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (dateRegex.test(term)) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = term.split("/");
        const formattedDate = `${year}-${month}-${day}`;
        return new RegExp(formattedDate, "i");
      }

      return new RegExp(term, "i"); // Default case: string regex
    });

    const regexFields = [
      "company",
      "branch",
      "unit",
      "floor",
      "area",
      "location",
      "requestmode",
      "vendorgroup",
      "vendor",
      "gstno",
      "billno",
      "assettype",
      "producthead",
      "productname",
      "warranty",
      "purchasedate",
      "productdetails",
      "warrantydetails",
      "quantity",
      "uom",
      "rate",
      "billdate",
    ];

    const orConditions = regexTerms.map((regex) => {


      // General regex case
      return {
        $or: [
          ...regexFields.map(field => ({ [field]: regex })),


          // {
          //   // Add condition for array `stockmaterialarray`
          //   stockmaterialarray: {
          //     $elemMatch: {
          //       $or: [
          //         { uomnew: regex },
          //         { quantitynew: regex },
          //         { materialnew: regex },
          //         { productdetailsnew: regex },
          //         { uomcodenew: regex }
          //       ],
          //     },
          //   },
          // },
        ],
      };
    });

    query = {
      $and: [
        { requestmode: "Asset Material" },
        {
          $or: assignbranch.map((branchObj) => ({
            branch: branchObj.branch,
            company: branchObj.company,
            unit: branchObj.unit,
          })),
        },
        ...orConditions,
      ],
    };
  }

  console.log(query, "query")
  // Apply logicOperator to combine conditions
  if (conditions.length > 0) {
    if (logicOperator === "AND") {
      query.$and = conditions;
    } else if (logicOperator === "OR") {
      query.$or = conditions;
    }
  }
  // console.log(conditions, "conditions")
  try {

    const totalProjects = await Stock.countDocuments(query);

    const totalProjectsData = await Stock.find(queryoverall);

    const result = await Stock.find(query)
      .select("")
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();
    console.log(result.length, 'resultpurchase')
    res.status(200).json({
      totalProjects,
      totalProjectsData,
      result,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.log(err, "stock")
    return next(new ErrorHandler("Records not found!", 404));
  }
});



exports.getAllStockAccessStock = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, requestmode } = req.body;

  let query = {};
  // Construct the filter query based on the assignbranch array
  const branchFilter = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));

  query = {
    $or: branchFilter,
    requestmode: "Stock Material",
    // status: "Transfer"
  };

  let queryoverall = {};
  // Construct the filter query based on the assignbranch array
  const branchFilterOverall = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));

  queryoverall = {
    $or: branchFilterOverall, requestmode: "Stock Material"
    // , status: "Transfer"
  };

  let conditions = [];

  // Advanced search filter
  if (allFilters && allFilters.length > 0) {
    allFilters.forEach(filter => {
      console.log(filter, "filter")
      if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
        if (filter.column == "purchasedate" || filter.column == "billdate") {
          const [day, month, year] = filter.value.split("/")
          let formattedValue = `${year}-${month}-${day}`
          conditions.push(createFilterCondition(filter.column, filter.condition, formattedValue));
        }
        else {

          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      }
    });
  }



  if (searchQuery && searchQuery !== undefined) {
    const searchTermsArray = searchQuery.split(" ").filter(term => term.trim() !== ""); // Remove empty terms
    const regexTerms = searchTermsArray.map((term) => {
      if (!isNaN(term)) {
        return parseInt(term, 10); // Convert numeric term to Number
      }

      // Check if the term is in the date format DD/MM/YYYY
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (dateRegex.test(term)) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = term.split("/");
        const formattedDate = `${year}-${month}-${day}`;
        return new RegExp(formattedDate, "i");
      }

      return new RegExp(term, "i"); // Default case: string regex
    });

    const regexFields = [
      "company",
      "branch",
      "unit",
      "floor",
      "area",
      "location",
      "requestmode",
      "stockcategory",
      "stocksubcategory",
      "quantitynew",
      "uomnew",
      "materialnew",
      "productdetailsnew",
      "gstno",
      "billno",
      "warrantydetails",
      "warranty",
      "purchasedate",
      "billdate",
      "rate",
      "vendorgroup",
      "vendor",
    ];

    const orConditions = regexTerms.map((regex) => {


      // General regex case
      return {
        $or: [
          ...regexFields.map(field => ({ [field]: regex })),
          {
            // Add condition for array `stockmaterialarray`
            stockmaterialarray: {
              $elemMatch: {
                $or: [
                  { uomnew: regex },
                  { quantitynew: regex },
                  { materialnew: regex },
                  { productdetailsnew: regex },
                  { uomcodenew: regex }
                ],
              },
            },
          },
        ],
      };
    });

    query = {
      $and: [
        { requestmode: "Stock Material" },
        {
          $or: assignbranch.map((branchObj) => ({
            branch: branchObj.branch,
            company: branchObj.company,
            unit: branchObj.unit,
          })),
        },
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
  // console.log(conditions, "conditions")
  try {

    const totalProjects = await Stock.countDocuments(query);

    const totalProjectsData = await Stock.find(queryoverall);

    const result = await Stock.find(query)
      .select("")
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();
    console.log(result.length, 'resultstock')
    res.status(200).json({
      totalProjects,
      totalProjectsData,
      result,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.log(err, "stock")
    return next(new ErrorHandler("Records not found!", 404));
  }
});


//create new stock => /api/stock/new
exports.addStock = catchAsyncErrors(async (req, res, next) => {
  let astock = await Stock.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single stock=> /api/stock/:id
exports.getSingleStock = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sstock = await Stock.findById(id);
  if (!sstock) {
    return next(new ErrorHandler("Stock not found", 404));
  }
  return res.status(200).json({
    sstock,
  });
});
//update stock by id => /api/stock/:id
exports.updateStock = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ustock = await Stock.findByIdAndUpdate(id, req.body);
  if (!ustock) {
    return next(new ErrorHandler("Stock not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});
//delete stock by id => /api/stock/:id
exports.deleteStock = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dstock = await Stock.findByIdAndRemove(id);
  if (!dstock) {
    return next(new ErrorHandler("Stock not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

exports.Stocktrasnferfilter = catchAsyncErrors(async (req, res, next) => {
  let stocks;
  try {
    stocks = await Stock.find({ productname: req.body.productname, branch: req.body.branch, producthead: req.body.producthead }, { productname: 1, producthead: 1, quantity: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stocks) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stocks,
  });
});


exports.getAllStockPurchaseLimitedTransfer = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({ status: "Transfer" },
      { requestmode: 1, company: 1, status: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, stockmaterialarray: 1, quantity: 1 });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});

exports.getAllStockPurchaseLimitedTransferLog = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({
      $or: [
        { status: "Transfer", },
        { handover: "handover", requestmode: "Stock Material", productname: req.body.material }
      ],
      company: req.body.company, branch: req.body.branch, unit: req.body.unit, floor: req.body.floor, area: req.body.area, location: req.body.location
    },
      {
        requestmode: 1, company: 1, status: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, employeenameto: 1, countquantity: 1,
        stockmaterialarray: 1, quantity: 1, addedby: 1
      });
    console.log(stock, "viewstock")
  } catch (err) {
    console.log(err, "viewser")
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!stock) {
  //   return next(new ErrorHandler("Stock not found!", 404));
  // }
  return res.status(200).json({
    stock,
  });
});





exports.getAllStockPurchaseLimited = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({
      requestmode: req.body.assetmat, company: req.body.companyto,
      branch: { $in: req.body.branchto }, unit: { $in: req.body.unitto },
      handover: { $exists: false }
    },
      {
        requestmode: 1, company: 1, branch: 1, unit: 1,
        asset: 1, assettype: 1, component: 1, floor: 1, area: 1, location: 1, productname: 1, stockmaterialarray: 1, quantity: 1
      });


  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});


exports.getAllStockPurchaseLimitedHandover = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({ handover: "handover" },
      { company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1, employeenameto: 1 });
    console.log(stock, "stock")
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});


exports.getAllStockPurchaseLimitedUsageCount = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({ handover: "usagecount" },
      {
        company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1,
        employeenameto: 1, usagedate: 1, usagetime: 1, description: 1, usercompany: 1, userbranch: 1, userunit: 1,
        userfloor: 1, userarea: 1, userlocation: 1, useremployee: 1, userteam: 1, description: 1, filesusagecount: 1
      });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});


exports.getAllStockPurchaseLimitedUsageCountNotification = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.countDocuments({ employeenameto: req.body.username, handover: "handover" });



  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});

exports.getAllStockPurchaseLimitedUsageCountNotificationList = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {
    const query = {}
    query.employeenameto = { $in: req.body.username };
    // query.requestmode = { $in: req.body.assetmat };
    query.handover = {
      $in: ["handover", "usagecount"],

    },


      stock = await Stock.find(query,
        {
          company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1,
          employeenameto: 1, usagedate: 1, usagetime: 1, description: 1, usercompany: 1, userbranch: 1, userunit: 1,
          userfloor: 1, userarea: 1, userlocation: 1, useremployee: 1, userteam: 1, description: 1, requestmode: 1
        });
    console.log(stock, "stocknot")

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});


exports.getAllStockPurchaseLimitedHandoverTodo = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({
      handover: "handover", productname: req.body.productname, company: req.body.company, branch: req.body.branch, unit: req.body.unit, floor: req.body.floor, area: req.body.area,
      location: req.body.location
    },
      { company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1, employeenameto: 1, addedby: 1 });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});


exports.getAllStockPurchaseLimitedHandoverTodoReturn = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({
      handover: "return", productname: req.body.productname, company: req.body.company, branch: req.body.branch, unit: req.body.unit, floor: req.body.floor, area: req.body.area,
      location: req.body.location
    },
      { company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1, employeenameto: 1, addedby: 1 });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});

exports.getAllStockPurchaseLimitedHandoverTodoNotification = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({
      handover: "handover", productname: req.body.productname, branch: req.body.branch, unit: req.body.unit, floor: req.body.floor, area: req.body.area,
      location: req.body.location, employeenameto: req.body.employeenameto
    },
      { company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1, employeenameto: 1, addedby: 1 });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});


exports.getAllStockPurchaseLimitedHandoverTodoReturnNotification = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({
      handover: "return", productname: req.body.productname, branch: req.body.branch, unit: req.body.unit, floor: req.body.floor, area: req.body.area,
      location: req.body.location, employeenameto: req.body.employeenameto
    },
      { company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1, employeenameto: 1, addedby: 1 });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});



exports.getAllStockPurchaseLimitedHandoverandReturn = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({
      handover: { $in: ["handover", "return"] }, productname: req.body.productname, branch: req.body.branch, unit: req.body.unit, floor: req.body.floor, area: req.body.area,
      location: req.body.location
    },
      { company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1, employeenameto: 1, addedby: 1, handover: 1 });
    console.log(stock, "astosdfljrwlj")
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});

exports.getAllStockPurchaseLimitedReturn = catchAsyncErrors(async (req, res, next) => {
  let stock;
  try {

    stock = await Stock.find({ handover: "return" },
      { company: 1, branch: 1, unit: 1, floor: 1, area: 1, location: 1, productname: 1, countquantity: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stock) {
    return next(new ErrorHandler("Stock not found!", 404));
  }
  return res.status(200).json({
    stock,
  });
});


exports.getOverallStockTableSort = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, searchQuery } = req.body;

  let allusers;
  let totalProjects, paginatedData, isEmptyData, result;

  try {
    // const query = searchQuery ? { companyname: { $regex: searchQuery, $options: 'i' } } : {};
    const anse = await Stock.find()
    const searchOverTerms = searchQuery?.toLowerCase()?.split(" ");
    const filteredDatas = anse?.filter((item, index) => {
      const itemString = JSON.stringify(item)?.toLowerCase();
      return searchOverTerms.every((term) => itemString.includes(term));
    })
    isEmptyData = searchOverTerms?.every(item => item.trim() === '');
    const pageSized = parseInt(pageSize);
    const pageNumberd = parseInt(page);

    paginatedData = filteredDatas.slice((pageNumberd - 1) * pageSized, pageNumberd * pageSize);

    totalProjects = await Stock.countDocuments();

    allusers = await Stock.find()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    result = isEmptyData ? allusers : paginatedData

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  // return res.status(200).json({ count: allusers.length, allusers });
  return res.status(200).json({
    allusers,
    totalProjects,
    paginatedData,
    result,
    currentPage: (isEmptyData ? page : 1),
    totalPages: Math.ceil((isEmptyData ? totalProjects : paginatedData?.length) / pageSize),
  });
});