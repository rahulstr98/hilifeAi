const MikrotikMaster = require("../../../model/modules/mikrotik/MikrotikMaster");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All MikrotikMaster => /api/getallmikrotikmaster
exports.getAllMikrotikMaster = catchAsyncErrors(async (req, res, next) => {
  let mikrotikmaster;
  try {
    mikrotikmaster = await MikrotikMaster.find();
  } catch (err) {
    return next(new ErrorHandler("Error Fetching Data!", 404));
  }
  if (!mikrotikmaster) {
    return next(new ErrorHandler("No Data found!", 404));
  }
  return res.status(200).json({
    mikrotikmaster,
  });
});

// Create new Mikrotik Master=> /api/createmikrotikmaster
exports.addMikrotikMaster = catchAsyncErrors(async (req, res, next) => {
  const { company, branch, unit, url, name } = req.body;
  let checkloc = await MikrotikMaster.findOne({ company, branch, unit, name });
  // url: { $regex: new RegExp(`^${url}$`, 'i') }
  if (checkloc) {
    return next(new ErrorHandler("Data already exist!", 400));
  }

  let amikrotikmaster = await MikrotikMaster.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle Mikrotik Master => /api/singlemikrotikmaster/:id
exports.getSingleMikrotikMaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let smikrotikmaster = await MikrotikMaster.findById(id);

  if (!smikrotikmaster) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    smikrotikmaster,
  });
});

// update MikrotikMaster by id => /api/singlemikrotikmaster/:id
exports.updateMikrotikMaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const { company, branch, unit, url, name } = req.body;

  // Check for duplicate data (excluding the current document by ID)
  let duplicateCheck = await MikrotikMaster.findOne({
    _id: { $ne: id }, // Exclude the current document by ID
    company: { $regex: new RegExp(`^${company}$`, 'i') },
    branch: { $regex: new RegExp(`^${branch}$`, 'i') },
    unit: { $regex: new RegExp(`^${unit}$`, 'i') },
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    // url: { $regex: new RegExp(`^${url}$`, 'i') }
  });

  if (duplicateCheck) {
    return next(new ErrorHandler("Data Already Exist found!", 400)); // Return error if duplicate found
  }

  let umikrotikmaster = await MikrotikMaster.findByIdAndUpdate(id, req.body);

  return res.status(200).json({ message: "Updated successfully" });
});

// delete MikrotikMaster by id => /api/singlemikrotikmaster/:id
exports.deleteMikrotikMaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dmikrotikmaster = await MikrotikMaster.findByIdAndRemove(id);

  if (!dmikrotikmaster) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});
