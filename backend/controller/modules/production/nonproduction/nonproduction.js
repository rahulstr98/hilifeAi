const Nonproduction = require("../../../../model/modules/production/nonproduction/nonproduction");
const ErrorHandler = require("../../../../utils/errorhandler");
const catchAsyncErrors = require("../../../../middleware/catchAsyncError");

// get All Nonproduction => /api/Nonproduction
exports.getAllNonproduction = catchAsyncErrors(async (req, res, next) => {
  let nonproduction;
  try {
    nonproduction = await Nonproduction.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!nonproduction) {
    return next(new ErrorHandler("Nonproduction not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    nonproduction,
  });
});

// Create new Nonproduction => /api/Nonproduction/new
exports.addNonproduction = catchAsyncErrors(async (req, res, next) => {
  let anonproduction= await Nonproduction.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle Nonproduction => /api/Nonproduction/:id
exports.getSingleNonproduction = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let snonproduction = await Nonproduction.findById(id);

  if (!snonproduction) {
    return next(new ErrorHandler("Nonproduction not found!", 404));
  }
  return res.status(200).json({
    snonproduction,
  });
});

// update Nonproduction by id => /api/Nonproduction/:id
exports.updateNonproduction = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let unonproduction = await Nonproduction.findByIdAndUpdate(id, req.body);
  if (!unonproduction) {
    return next(new ErrorHandler("Nonproduction not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete Nonproduction by id => /api/Nonproduction/:id
exports.deleteNonproduction = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dnonproduction = await Nonproduction.findByIdAndRemove(id);

  if (!dnonproduction) {
    return next(new ErrorHandler("Nonproduction not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});


//Filter COntroller
exports.getAllNonProductionFilter = catchAsyncErrors(async (req, res) => {
  try {
    let filteredUsers;
    const { fromdate, todate, company, branch, unit, team, employee } = req.body;

    const filterQuery = {};

    if (fromdate && todate) {
      filterQuery.date = { $gte: fromdate, $lte: todate };
    }
    

    if (Array.isArray(company) && company.length > 0) {
      filterQuery.company = { $in: company };
    }

    if (Array.isArray(branch) && branch.length > 0) {
      filterQuery.branch = { $in: branch };
    }

    if (Array.isArray(unit) && unit.length > 0) {
      filterQuery.unit = { $in: unit };
    }

    if (Array.isArray(team) && team.length > 0) {
      filterQuery.team = { $in: team };
    }

    if (Array.isArray(employee) && employee.length > 0) {
      filterQuery.name = { $in: employee };
    }

    filteredUsers = await Nonproduction.find(filterQuery, {});

    return res.status(200).json({ filterdatanonproduction: filteredUsers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

exports.getAllNonproductionListFilter = catchAsyncErrors(async (req, res, next) => {
  let nonproduction;

  const { base, category, subcategory, fromdate, todate } = req.body;

  const frmdate = moment(fromdate).format("DD-MM-YYYY")
  const tdate = moment(todate).format("DD-MM-YYYY")
  console.log(frmdate)
  console.log(tdate)
  try {
   
    const query = {};


    if (base) {
      if (base === "All") {
        query.mode = { $in: [/Time/i, /Count/i] }; 
      } else {
        query.mode = { $regex: new RegExp(base, "i") }; 
      }
    }

    if (category?.length) {
      query.category = { $in: category }; 
    }

    if (subcategory?.length) {
      query.subcategory = { $in: subcategory }; 
    }

    if (fromdate && todate) {
      query.date = {
        $gte: fromdate, 
        $lte: todate,  
      };
    } else if (fromdate) {
      query.date = { $gte: fromdate }; 
    } else if (todate) {
      query.date = { $lte: todate }; 
    }
    
    nonproduction = await Nonproduction.find(query);

    if (!nonproduction || nonproduction.length === 0) {
      return res.status(200).json({
        count: 0,
        nonproduction: [],
      });
    }

    return res.status(200).json({
      count: nonproduction.length,
      nonproduction,
    });
  } catch (err) {
    return next(new ErrorHandler("Error fetching records!", 500));
  }
});