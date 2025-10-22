const Stockmanage = require("../../../model/modules/stockpurchase/stockmanage");
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


//get All Stockmanages =>/api/stockmanage
exports.getAllStockmanage = catchAsyncErrors(async (req, res, next) => {
  let stockmanage;
  try {
    stockmanage = await Stockmanage.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stockmanage) {
    return next(new ErrorHandler("Stockmanage not found!", 404));
  }
  return res.status(200).json({
    stockmanage,
  });
});

// exports.getAllStockmanageAccess = catchAsyncErrors(async (req, res, next) => {
//   let stockmanage;
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

//     filterQuery = { $or: branchFilter };

//     stockmanage = await Stockmanage.find(filterQuery);
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!stockmanage) {
//     return next(new ErrorHandler("Stockmanage not found!", 404));
//   }
//   return res.status(200).json({
//     stockmanage,
//   });
// });






exports.getAllStockmanageAccess = catchAsyncErrors(async (req, res, next) => {
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
        // if (filter.column == "purchasedate") {
        //   const [day, month, year] = filter.value.split("/")
        //   let formattedValue = `${year}-${month}-${day}`
        //   conditions.push(createFilterCondition(filter.column, filter.condition, formattedValue));
        // }
        // else {

        conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        // }
      }
    });
  }

  // if (searchQuery && searchQuery !== undefined) {
  //   const searchTermsArray = searchQuery.split(" ");
  //   const regexTerms = searchTermsArray.map((term) => {

  //     if (!isNaN(term)) {
  //       return parseInt(term, 10); // Convert to Number
  //     }

  //     // Check if the term is in the date format DD/MM/YYYY
  //     const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  //     if (dateRegex.test(term)) {
  //       // Convert DD/MM/YYYY to YYYY-MM-DD
  //       const [day, month, year] = term.split("/");
  //       const formattedDate = `${year}-${month}-${day}`;
  //       return new RegExp(formattedDate, "i");
  //     }
  //     return new RegExp(term, "i");
  //   });
  //   // console.log(regexTerms, "regexTerms")
  //   const orConditions = regexTerms.map((regex) => {
  //     if (typeof regex === "number") {
  //       // Special case for numeric values
  //       return {
  //         $or: [
  //           { quantity: regex }, // Match numeric fields
  //         ],
  //       };
  //     }
  //     return {
  //       $or: [
  //         { company: regex },
  //         { branch: regex },
  //         { unit: regex },
  //         { floor: regex },
  //         { area: regex },
  //         { location: regex },
  //         { workstation: regex },
  //         { requestmode: regex },
  //         { asset: regex },
  //         { assettype: regex },
  //         { material: regex },
  //         { component: regex },
  //         { productdetails: regex },
  //         { uom: regex },
  //         {stockmaterialarray:regex}       
  //       ],
  //     }
  //   });
  //   // console.log(searchQuery, "searchQuery")
  //   query = {
  //     $and: [
  //       {
  //         $or: assignbranch.map((branchObj) => ({
  //           branch: branchObj.branch,
  //           company: branchObj.company,
  //           unit: branchObj.unit,
  //         }))
  //       },
  //       ...orConditions,
  //     ],
  //   };
  // }


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
      "company", "branch", "unit", "floor", "area", "location",
      "workstation", "requestmode", "asset", "assettype", "requesttime", "requestdate",
      "material", "component", "productdetails", "uom"
    ];

    const orConditions = regexTerms.map((regex) => {

      if (typeof regex === "number") {
        // Special case for numeric values
        return {
          $or: [{ quantity: regex }], // Match numeric fields
        };
      }

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

    const totalProjects = await Stockmanage.countDocuments(query);

    const totalProjectsData = await Stockmanage.find(queryoverall);

    const result = await Stockmanage.find(query)
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



exports.getAllStockmanageAccessStock = catchAsyncErrors(async (req, res, next) => {
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
    requestmode: "Stock Material"

  };

  let queryoverall = {};
  // Construct the filter query based on the assignbranch array
  const branchFilterOverall = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));

  queryoverall = { $or: branchFilterOverall, requestmode: "Stock Material" };

  let conditions = [];

  // Advanced search filter
  // if (allFilters && allFilters.length > 0) {
  //   allFilters.forEach(filter => {
  //     console.log(filter, "filterstock")
  //     if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {


  //       conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));

  //     }
  //   });
  // }

  // Advanced search filter
  if (allFilters && allFilters.length > 0) {
    allFilters.forEach(filter => {
      // console.log(filter, "filterstock");

      if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {

        // Handle special case for `stockmaterialarray`
        if (["uomnew", "quantitynew", "materialnew", "productdetailsnew", "uomcodenew"].includes(filter.column)) {
          const condition = {};

          // Convert numeric filter values to string if required (e.g., for quantitynew)
          const filterValue = typeof filter.value === "number" ? filter.value.toString() : filter.value;

          condition["stockmaterialarray"] = {
            $elemMatch: createFilterCondition(filter.column, filter.condition, filterValue),
          };

          conditions.push(condition);
        } else {
          // Handle regular fields
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
      "requesttime", "requestdate",
    ];

    const orConditions = regexTerms.map((regex) => {
      console.log(regex, "regex")



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
                  // {
                  //   quantitynew: typeof regex === "number"
                  //     ? regex.toString() // Convert number to string
                  //     : regex, // Use regex directly if not a number
                  // },
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
  console.log(conditions, "conditionsstock")
  try {

    const totalProjects = await Stockmanage.countDocuments(query);

    const totalProjectsData = await Stockmanage.find(queryoverall);

    const result = await Stockmanage.find(query)
      .select("")
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();
    console.log(result.length, 'resultasset')
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







exports.getAllStockmanageFilteredAccess = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, requestmode } = req.body;

  let query = {};
  // Construct the filter query based on the assignbranch array
  const branchFilter = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));
  filterQuery = { $or: branchFilter };

  query = {
    updating: "",
    ...filterQuery,


  };

  let queryoverall = {};
  // Construct the filter query based on the assignbranch array
  const branchFilterOverall = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));
  let filterQueryoverall = { $or: branchFilterOverall };

  queryoverall = {
    updating: "",
    ...filterQueryoverall,
  };

  let conditions = [];

  // Advanced search filter
  // if (allFilters && allFilters.length > 0) {
  //   allFilters.forEach(filter => {
  //     console.log(filter, "filterstock")
  //     if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {


  //       conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));

  //     }
  //   });
  // }

  // Advanced search filter
  if (allFilters && allFilters.length > 0) {
    allFilters.forEach(filter => {
      // console.log(filter, "filterstock");

      if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {

        // Handle special case for `stockmaterialarray`
        if (["uomnew", "quantitynew", "materialnew", "productdetailsnew", "uomcodenew"].includes(filter.column)) {
          const condition = {};

          // Convert numeric filter values to string if required (e.g., for quantitynew)
          const filterValue = typeof filter.value === "number" ? filter.value.toString() : filter.value;

          condition["stockmaterialarray"] = {
            $elemMatch: createFilterCondition(filter.column, filter.condition, filterValue),
          };

          conditions.push(condition);
        } else {
          // Handle regular fields
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
      "company", "branch", "unit", "floor", "area", "location",
      "workstation", "requestmode", "asset", "assettype",
      "material", "component", "productdetails", "uom",
      "requesttime", "requestdate",
    ];

    const orConditions = regexTerms.map((regex) => {
      console.log(regex, "regex")



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
                  // {
                  //   quantitynew: typeof regex === "number"
                  //     ? regex.toString() // Convert number to string
                  //     : regex, // Use regex directly if not a number
                  // },
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
        { updating: "" },
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
  // console.log(conditions, "conditionsstock")
  try {

    const totalProjects = await Stockmanage.countDocuments(query);

    const totalProjectsData = await Stockmanage.find(queryoverall);

    const result = await Stockmanage.find(query)
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








exports.getAllStockmanageAccess = catchAsyncErrors(async (req, res, next) => {
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
        // if (filter.column == "purchasedate") {
        //   const [day, month, year] = filter.value.split("/")
        //   let formattedValue = `${year}-${month}-${day}`
        //   conditions.push(createFilterCondition(filter.column, filter.condition, formattedValue));
        // }
        // else {

        conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        // }
      }
    });
  }

  // if (searchQuery && searchQuery !== undefined) {
  //   const searchTermsArray = searchQuery.split(" ");
  //   const regexTerms = searchTermsArray.map((term) => {

  //     if (!isNaN(term)) {
  //       return parseInt(term, 10); // Convert to Number
  //     }

  //     // Check if the term is in the date format DD/MM/YYYY
  //     const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  //     if (dateRegex.test(term)) {
  //       // Convert DD/MM/YYYY to YYYY-MM-DD
  //       const [day, month, year] = term.split("/");
  //       const formattedDate = `${year}-${month}-${day}`;
  //       return new RegExp(formattedDate, "i");
  //     }
  //     return new RegExp(term, "i");
  //   });
  //   // console.log(regexTerms, "regexTerms")
  //   const orConditions = regexTerms.map((regex) => {
  //     if (typeof regex === "number") {
  //       // Special case for numeric values
  //       return {
  //         $or: [
  //           { quantity: regex }, // Match numeric fields
  //         ],
  //       };
  //     }
  //     return {
  //       $or: [
  //         { company: regex },
  //         { branch: regex },
  //         { unit: regex },
  //         { floor: regex },
  //         { area: regex },
  //         { location: regex },
  //         { workstation: regex },
  //         { requestmode: regex },
  //         { asset: regex },
  //         { assettype: regex },
  //         { material: regex },
  //         { component: regex },
  //         { productdetails: regex },
  //         { uom: regex },
  //         {stockmaterialarray:regex}       
  //       ],
  //     }
  //   });
  //   // console.log(searchQuery, "searchQuery")
  //   query = {
  //     $and: [
  //       {
  //         $or: assignbranch.map((branchObj) => ({
  //           branch: branchObj.branch,
  //           company: branchObj.company,
  //           unit: branchObj.unit,
  //         }))
  //       },
  //       ...orConditions,
  //     ],
  //   };
  // }


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
      "company", "branch", "unit", "floor", "area", "location",
      "workstation", "requestmode", "asset", "assettype",
      "material", "component", "productdetails", "uom"
    ];

    const orConditions = regexTerms.map((regex) => {

      if (typeof regex === "number") {
        // Special case for numeric values
        return {
          $or: [{ quantity: regex }], // Match numeric fields
        };
      }

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

    const totalProjects = await Stockmanage.countDocuments(query);

    const totalProjectsData = await Stockmanage.find(queryoverall);

    const result = await Stockmanage.find(query)
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











exports.getAllStockmanageFiltered = catchAsyncErrors(async (req, res, next) => {
  let stockmanage;
  try {
    stockmanage = await Stockmanage.find({ updating: "" });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!stockmanage) {
    return next(new ErrorHandler("Stockmanage not found!", 404));
  }
  return res.status(200).json({
    stockmanage,
  });
});

// exports.getAllStockmanageFilteredAccess = catchAsyncErrors(async (req, res, next) => {
//   let stockmanage, query;
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
//     // }

//     query = {
//       updating: "",
//       ...filterQuery,

//     }
//     stockmanage = await Stockmanage.find(query);
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
//   if (!stockmanage) {
//     return next(new ErrorHandler("Stockmanage not found!", 404));
//   }
//   return res.status(200).json({
//     stockmanage,
//   });
// });


exports.getAllStockmanageFilteredAccess = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, requestmode } = req.body;

  let query = {};
  // Construct the filter query based on the assignbranch array
  const branchFilter = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));
  filterQuery = { $or: branchFilter };

  query = {
    updating: "",
    ...filterQuery,


  };

  let queryoverall = {};
  // Construct the filter query based on the assignbranch array
  const branchFilterOverall = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));
  let filterQueryoverall = { $or: branchFilterOverall };

  queryoverall = {
    updating: "",
    ...filterQueryoverall,
  };

  let conditions = [];

  // Advanced search filter
  // if (allFilters && allFilters.length > 0) {
  //   allFilters.forEach(filter => {
  //     console.log(filter, "filterstock")
  //     if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {


  //       conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));

  //     }
  //   });
  // }

  // Advanced search filter
  if (allFilters && allFilters.length > 0) {
    allFilters.forEach(filter => {
      // console.log(filter, "filterstock");

      if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {

        // Handle special case for `stockmaterialarray`
        if (["uomnew", "quantitynew", "materialnew", "productdetailsnew", "uomcodenew"].includes(filter.column)) {
          const condition = {};

          // Convert numeric filter values to string if required (e.g., for quantitynew)
          const filterValue = typeof filter.value === "number" ? filter.value.toString() : filter.value;

          condition["stockmaterialarray"] = {
            $elemMatch: createFilterCondition(filter.column, filter.condition, filterValue),
          };

          conditions.push(condition);
        } else {
          // Handle regular fields
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
      "company", "branch", "unit", "floor", "area", "location",
      "workstation", "requestmode", "asset", "assettype",
      "material", "component", "productdetails", "uom"
    ];

    const orConditions = regexTerms.map((regex) => {

      console.log(regex, "popo")
      if (typeof regex === "number") {

        // Special case for numeric values
        return {
          $or: [
            {
              requestmode: "Asset Material", quantity: regex
            }, // Match numeric fields (e.g., `quantity`)
            {
              // Add condition for array `stockmaterialarray`
              requestmode: "Stock Material",
              stockmaterialarray: {
                $elemMatch: {
                  // Convert quantitynew (string) to a number for comparison
                  quantitynew: {
                    $eq: regex.toString(), // Ensure we're comparing as strings if stored as string in DB
                  },
                },
              },
            },
          ],
        };
      }
      else {
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
      }
    });

    query = {
      $and: [
        { updating: "" },
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
  // console.log(conditions, "conditionsstock")
  try {

    const totalProjects = await Stockmanage.countDocuments(query);

    const totalProjectsData = await Stockmanage.find(queryoverall);

    const result = await Stockmanage.find(query)
      .select("")
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();
    console.log(result.length, 'resultstock123')
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


//create new stockmanage => /api/stockmanage/new
exports.addStockmanage = catchAsyncErrors(async (req, res, next) => {
  let astockmanage = await Stockmanage.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single stockmanage=> /api/stockmanage/:id
exports.getSingleStockmanage = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sstockmanage = await Stockmanage.findById(id);
  if (!sstockmanage) {
    return next(new ErrorHandler("Stockmanage not found", 404));
  }
  return res.status(200).json({
    sstockmanage,
  });
});
//update stockmanage by id => /api/stockmanage/:id
exports.updateStockmanage = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ustockmanage = await Stockmanage.findByIdAndUpdate(id, req.body);
  if (!ustockmanage) {
    return next(new ErrorHandler("Stockmanage not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});
//delete stockmanage by id => /api/stockmanage/:id
exports.deleteStockmanage = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dstockmanage = await Stockmanage.findByIdAndRemove(id);
  if (!dstockmanage) {
    return next(new ErrorHandler("Stockmanage not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

















