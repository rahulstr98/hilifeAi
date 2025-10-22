const Paidstatusfix = require("../../../model/modules/production/paidstatusfix");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const PayrunList = require("../../../model/modules/production/payrunlist");
const axios = require("axios");
// get All Paidstatusfix => /api/processteams
exports.getAllPaidstatusfix = catchAsyncErrors(async (req, res, next) => {
  let paidstatusfixs;
  try {
    paidstatusfixs = await Paidstatusfix.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!paidstatusfixs) {
    return next(new ErrorHandler("Paidstatusfix not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    paidstatusfixs,
  });
});

exports.xeroxPaidStatusFixFilter = catchAsyncErrors(async (req, res, next) => {
  let statusresults;
  try {
    // statusresults = await Paidstatusfix.find(
    //   {
    //     month: { $regex: new RegExp(req.body.frommonth, 'i') }, // 'i' flag for case-insensitivity
    //     // year: req.body.fromyear, // 'i' flag for case-insensitivity
    //     year: { $in: [req.body.fromyear, String(req.body.fromyear), Number(req.body.fromyear)] } 

    //   },
    //   {}
    // );
    console.log(req.body.path,'req.body.path')
    statusresults = await Paidstatusfix.aggregate([
      {
        $match: {
          month: { $regex: new RegExp(req.body.frommonth, 'i') }, // Case-insensitive month match
          year: { $in: [req.body.fromyear, String(req.body.fromyear), Number(req.body.fromyear)] }
        }
      },
      {
        $project: {
          _id: 0, // Exclude MongoDB _id field
          department: 1,
          month: { $literal: String(req.body.tomonth) }, // Replace with new month
          year: { $literal: String(req.body.toyear) }, // Replace with new year
          frequency: 1,
          absentmodes: 1,
          fromvalue: 1,
          tovalue: 1,
          achievedmodes: 1,
          frompoint: 1,
          topoint: 1,
          currentabsentmodes: 1,
          currentabsentvalue: 1,
          currentachievedmodes: 1,
          currentachievedvalue: 1,
          paidstatus: {
            $concat: [
              {
                $substrCP: [ 
                  { $toString: req.body.toyear }, 
                  2, 
                  2 
                ] // Extract last two digits of toyear (e.g., "2025" → "25")
              },
              { $substrCP: [req.body.tomonth, 0, 3] }, // First 3 letters of the month
              "_",
              { $arrayElemAt: [{ $split: ["$paidstatus", "_"] }, 1] }, // Second part of paidstatus
              "_",
              { $arrayElemAt: [{ $split: ["$paidstatus", "_"] }, 2] }  // Third part of paidstatus
            ]
            
            
          },
          addedby: [{ 
            name: { $literal: String(req.body.companyname) }, 
            date: { $literal: String(new Date()) }
          }]
        }
      }
    ]);
    
    // Send all transformed records in a **single API call**
    await axios.post(req.body.path, statusresults, {
      headers: {
        Authorization: String(req.body.Authorization),
      }
    });
    
  } catch (err) {
    console.log(err.message,'er1');
  }
  // if (!statusresults) {
  //   return next(new ErrorHandler('Data not found!', 404));
  // }
  // return res.status(200).json({
  //   statusresults,
  // });
  return res.status(200).json({ message: 'Created successfully' });
});


// get Limited Paidstatusfix => /api/processteams
exports.getPaidstatusfixLimited = catchAsyncErrors(async (req, res, next) => {
  let paidstatusfixs;
  try {
    const reqMonth = req.body.month.toLowerCase(); // Convert req.body.month to lowercase
    const reqYear = req.body.year;

    paidstatusfixs = await Paidstatusfix.find(
      { month: { $regex: new RegExp('^' + reqMonth, 'i') }, year: reqYear },
      {
        department: 1, month: 1, year: 1, frequency: 1, absentmodes: 1, fromvalue: 1, tovalue: 1,
        achievedmodes: 1, frompoint: 1, topoint: 1, currentabsentmodes: 1, currentabsentvalue: 1, currentachievedmodes: 1, currentachievedvalue: 1, paidstatus: 1
      });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!paidstatusfixs) {
    return next(new ErrorHandler("Paidstatusfix not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    paidstatusfixs,
  });
});

// Create new Paidstatusfix => /api/Paidstatusfix/new
exports.addPaidstatusfix = catchAsyncErrors(async (req, res, next) => {
  let aPaidstatusfix = await Paidstatusfix.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle Paidstatusfix => /api/Paidstatusfix/:id
exports.getSinglePaidstatusfix = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let spaidstatusfix = await Paidstatusfix.findById(id);

  if (!spaidstatusfix) {
    return next(new ErrorHandler("Paidstatusfix not found!", 404));
  }
  return res.status(200).json({
    spaidstatusfix,
  });
});

// update Paidstatusfix by id => /api/Paidstatusfix/:id
exports.updatePaidstatusfix = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let upaidstatusfix = await Paidstatusfix.findByIdAndUpdate(id, req.body);
  if (!upaidstatusfix) {
    return next(new ErrorHandler("Paidstatusfix not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete Paidstatusfix by id => /api/Paidstatusfix/:id
exports.deletePaidstatusfix = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dpaidstatusfix = await Paidstatusfix.findByIdAndRemove(id);

  if (!dpaidstatusfix) {
    return next(new ErrorHandler("Paidstatusfix not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.PaidstatusfixSort = catchAsyncErrors(async (req, res, next) => {
  let totalProjects, result, totalPages, currentPage;

  const { page, pageSize } = req.body;
  try {

    totalProjects = await Paidstatusfix.countDocuments();

    result = await Paidstatusfix.find()
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

// get All Paidstatusfix => /api/processteams
exports.getAllPaidstatusfixFiltered = catchAsyncErrors(async (req, res, next) => {
  let paidstatusfixs;
  try {
    const reqMonth = req.body.month.toLowerCase();
    const query = {
      month: { $regex: new RegExp("^" + reqMonth, "i") },
      year: req.body.year,
      paidstatus: { $regex: "MANUAL" },
    };

    paidstatusfixs = await Paidstatusfix.find(query, { paidstatus: 1, _id: 0, department: 1 });
  } catch (err) {
    return next(new ErrorHandler("Data not found", 404));
  }
  // if (!paidstatusfixs) {
  //   return next(new ErrorHandler("Paidstatusfix not found!", 404));
  // }
  return res.status(200).json({

    paidstatusfixs,
  });
});

// // get all pagination controller filterwise
// exports.getAllFilterPaidStatusfixDatas = async (req, res, next) => {
//   try {
//     const { monthfilter, yearfilter, frequencystatusfilter, page, pageSize } = req.body;
//     const filterQuery = {};

//     if (monthfilter && monthfilter.length > 0) {
//       filterQuery.month = { $in: monthfilter };
//     }
//     if (yearfilter && yearfilter.length > 0) {
//       filterQuery.year = { $in: yearfilter };
//     }
//     if (frequencystatusfilter && frequencystatusfilter.length > 0) {
//       filterQuery.frequency = { $in: frequencystatusfilter };
//     }

//     const isEmpty = (obj) => {
//       return Object.keys(obj).length === 0;
//     };

//     const totalProjects = !isEmpty(filterQuery) ? await Paidstatusfix.countDocuments(filterQuery) : 0;
//     const totalDatas = await Paidstatusfix.find(filterQuery);
//     const result = isEmpty(filterQuery) ? [] : await Paidstatusfix.find(filterQuery)
//       .skip((page - 1) * pageSize)
//       .limit(parseInt(pageSize));

//     const totalPages = isEmpty(filterQuery) ? 0 : Math.ceil(totalProjects / pageSize);

//     return res.status(200).json({
//       totalProjects,
//       result,
//       currentPage: page,
//       totalPages,
//       totalDatas
//     });

//   } catch (err) {
//     console.error(err);
//     return next(new ErrorHandler("Internal server error", 500));
//   }
// };

exports.getAllFilterPaidStatusfixDatas = async (req, res, next) => {

  try {
    const { monthfilter, yearfilter, logicOperator, allFilters, searchQuery, frequencystatusfilter, page, pageSize, department } = req.body;

    let filterQuery = {};

    if (monthfilter && monthfilter.length > 0) {
      filterQuery.month = { $in: monthfilter };
    }
    if (yearfilter && yearfilter.length > 0) {
      filterQuery.year = { $in: yearfilter };
    }
    if (frequencystatusfilter && frequencystatusfilter.length > 0) {
      filterQuery.frequency = { $in: frequencystatusfilter };
    }
    if (department && department.length > 0) {
      filterQuery.department = { $in: department };
    }

    let conditions = [];

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
          { department: regex },
          { month: regex },
          { year: regex },
          { frequency: regex },
          { absentmodes: regex },
          { fromvalue: regex },
          { tovalue: regex },
          { achievedmodes: regex },
          { frompoint: regex },
          { topoint: regex },
          { currentabsentmodes: regex },
          { currentabsentvalue: regex },
          { currentachievedmodes: regex },
          { currentachievedvalue: regex },
          { paidstatus: regex },
        ],
      }));

      filterQuery = {
        $and: [
          filterQuery,
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
        filterQuery.$and = conditions;
      } else if (logicOperator === "OR") {
        filterQuery.$or = conditions;
      }
    }

    const isEmpty = (obj) => {
      return Object.keys(obj).length === 0;
    };

    const totalProjects = !isEmpty(filterQuery) ? await Paidstatusfix.find(filterQuery).countDocuments() : 0;
    const totalDatas = await Paidstatusfix.find(filterQuery);
    const result = await Paidstatusfix.find(filterQuery)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));
    // const result = isEmpty(filterQuery) ? [] : await Paidstatusfix.find(filterQuery)
    //   .skip((page - 1) * pageSize)
    //   .limit(parseInt(pageSize));



    const totalPages = isEmpty(filterQuery) ? 0 : Math.ceil(totalProjects / pageSize);

    return res.status(200).json({
      totalProjects,
      result,
      currentPage: page,
      totalPages,
      totalDatas
    });

  } catch (err) {
    console.log(err);
    return next(new ErrorHandler("Internal server error", 500));
  }
};
// get overall delete functionlity  pay run
exports.getAllPayrunCheck = catchAsyncErrors(async (req, res, next) => {
  let payrunlists, count;

  try {

    payrunlists = await PayrunList.aggregate([
      {
        $match: {
          // department: req.body.checkpayrundepartment,
          "data.paidstatus": req.body.checkpayrunpaidstatus
        }
      }
    ]);

    count = payrunlists.length

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!payrunlists) {
    return next(new ErrorHandler("PayrunList not found!", 404));
  }
  return res.status(200).json({
    payrunlists,
    count
  });
});




// get All Paiddate fix  =>overall edit  payrun
exports.getOverAllEditPayrunList = catchAsyncErrors(async (req, res, next) => {
  let payrunlists;
  try {

    payrunlists = await PayrunList.aggregate([
      {
        $match: {
          department: { $in: req.body.oldname2 },
          "data.paidstatus": req.body.oldname
        }
      }
    ]);

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!payrunlists) {
    return next(new ErrorHandler("PayrunList not found", 404));
  }
  return res.status(200).json({
    count: payrunlists.length,
    payrunlists,
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
