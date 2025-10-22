const Maintenance = require("../../../model/modules/account/maintenance");
const User = require("../../../model/login/auth");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");


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

//get All Maintenances =>/api/maintenances
exports.getAllMaintenance = catchAsyncErrors(async (req, res, next) => {
  let maintenances;
  try {
    maintenances = await Maintenance.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!maintenances) {
    return next(new ErrorHandler("Maintenance not found!", 404));
  }
  return res.status(200).json({
    maintenances,
  });
});
exports.getAllMaintenanceActive = catchAsyncErrors(async (req, res, next) => {
  let maintenances;
  try {
    maintenances = await Maintenance.find({ schedulestatus: "Active" }, {});
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!maintenances) {
    return next(new ErrorHandler("Maintenance not found!", 404));
  }
  return res.status(200).json({
    maintenances,
  });
});

//create new maintenance => /api/maintenance/new
exports.addMaintenance = catchAsyncErrors(async (req, res, next) => {
  let amaintenance = await Maintenance.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single maintenance=> /api/maintenance/:id
exports.getSingleMaintenance = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let smaintenance = await Maintenance.findById(id);
  if (!smaintenance) {
    return next(new ErrorHandler("Maintenance not found", 404));
  }
  return res.status(200).json({
    smaintenance,
  });
});
//update maintenance by id => /api/maintenance/:id
exports.updateMaintenance = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let umaintenance = await Maintenance.findByIdAndUpdate(id, req.body);
  if (!umaintenance) {
    return next(new ErrorHandler("Maintenance not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});
//delete maintenance by id => /api/maintenance/:id
exports.deleteMaintenance = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dmaintenance = await Maintenance.findByIdAndRemove(id);
  if (!dmaintenance) {
    return next(new ErrorHandler("Maintenance not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});



exports.getAllMaintenanceAccess = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery } = req.body;

  let query = {};

  const branchFilter = assignbranch.map((branchObj) => ({
    branch: branchObj.branch,
    company: branchObj.company,
    unit: branchObj.unit,
  }));
  const branchFilterTo = assignbranch.map((branchObj) => ({
    branchto: branchObj.branch,
    companyto: branchObj.company,
    unitto: branchObj.unit,
  }));


  query = {
    $or: [...branchFilter, ...branchFilterTo],
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


  if (searchQuery && searchQuery !== undefined) {
    const searchTermsArray = searchQuery.split(" ");
    const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

    const orConditions = regexTerms.map((regex) => ({
      $or: [
        { company: regex },
        { branch: regex },
        { unit: regex },
        { duration: regex },
        { breakup: regex },
        { monthdate: regex },
        { breakupcount: regex },
        { required: regex },
        { area: regex },
        { location: regex },
        { assetmaterial: regex },
        { maintenancedetails: regex },
        { frequency: regex },
        { schedule: regex },
        { companyto: regex },
        { branchtolist: regex },
        { unittolist: regex },
        { teamtolist: regex },
        { employeenametolist: regex },
        { vendor: regex },
        { priority: regex },
        { address: regex },
        { emailid: regex },
        { phonenumberone: regex },
        { timetodo: regex },
        { weekdays: regex },
        { annumonth: regex },
        { monthdate: regex },
        { vendorgroup: regex },
      ],
    }));

    query = {
      $and: [
        {
          $or: [...branchFilter, ...branchFilterTo]

        },
        // {
        //   $or: assignbranch.map((branchObj) => ({
        //     branch: branchObj.branch,
        //     company: branchObj.company,
        //     unit: branchObj.unit,
        //   }))
        // }, {
        //   $or: assignbranch.map((branchObj) => ({
        //     branchto: branchObj.branch,
        //     companyto: branchObj.company,
        //     unitto: branchObj.unit,
        //   }))
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
  try {

    const totalProjects = await Maintenance.countDocuments(query);

    const result = await Maintenance.find(query)
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
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});