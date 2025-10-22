const Reportingheader = require("../../../model/modules/role/reportingheader");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const Hirerarchi = require("../../../model/modules/setup/hierarchy");
//get All Reportingheader =>/api/Reportingheader
exports.getAllReportingheader = catchAsyncErrors(async (req, res, next) => {
  let reportingheaders;
  try {
    reportingheaders = await Reportingheader.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!reportingheaders) {
    return next(new ErrorHandler("Reportingheader not found!", 404));
  }
  return res.status(200).json({
    reportingheaders,
  });
});


// //create new Reportingheader => /api/Reportingheader/new
// exports.addReportingheader = catchAsyncErrors(async (req, res, next) => {
//   let checkloc = await Reportingheader.findOne({ name: req.body.name });
//   if (checkloc) {
//     return next(new ErrorHandler("Reportingheader name already exist!", 400));
//   }

//   let aReportingheader = await Reportingheader.create(req.body);
//   return res.status(200).json({
//     message: "Successfully added!",
//   });
// });

exports.addReportingheader = catchAsyncErrors(async (req, res, next) => {
  // Convert the name to lowercase to ensure case-insensitivity
  const name = req.body.name.toLowerCase();

  // Check if a Reportingheader with the same name (case-insensitive) already exists
  let checkloc = await Reportingheader.findOne({ name });

  if (checkloc) {
    return next(new ErrorHandler("Reportingheader name already exists!", 400));
  }

  // Set the name to lowercase before saving
  let aReportingheader = await Reportingheader.create({ ...req.body, name });

  return res.status(200).json({
    message: "Successfully added!",
  });
});


// get Single Reportingheader => /api/Reportingheader/:id
exports.getSingleReportingheader = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sreportingheader = await Reportingheader.findById(id);
  if (!sreportingheader) {
    return next(new ErrorHandler("Reportingheader not found", 404));
  }
  return res.status(200).json({
    sreportingheader,
  });
});

//update role by id => /api/role/:id
exports.updateReportingheader = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ureportingheader = await Reportingheader.findByIdAndUpdate(id, req.body);
  if (!ureportingheader) {
    return next(new ErrorHandler("Reportingheader not found", 404));
  }

  return res.status(200).json({ status: true , message: "Updated successfully" });
});

//delete role by id => /api/role/:id
exports.deleteReportingheader = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dreportingheader = await Reportingheader.findByIdAndRemove(id);
  if (!dreportingheader) {
    return next(new ErrorHandler("Reportingheader not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});
// get overall delete functionlity 
exports.getAllReportingheaderCheck = catchAsyncErrors(async (req, res, next) => {
  let hirerarchi;

  try {
    hirerarchi = await Hirerarchi.find();
    let query = {
      pagecontrols: { $in: req.body.checkname },
    };

    hirerarchi = await Hirerarchi.find(query);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hirerarchi) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({
    hirerarchi,
  });
});

exports.getOverAllEditReportingheader = catchAsyncErrors(async (req, res, next) => {
  try {
    const { oldname, newname } = req.body;

    const count = await Hirerarchi.countDocuments({
      pagecontrols: oldname,
    });

    if (count === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: "No linked hierarchy pages found.",
      });
    }

    res.status(200).json({
      success: true,
      count: count,
      message: `${count} linked hierarchy page(s) found. Do you want to proceed with the changes?`,
    });


    const updateResult = await Hirerarchi.updateMany(
      { pagecontrols: oldname },
      { $set: { "pagecontrols.$[elem]": newname } },
      { arrayFilters: [{ elem: oldname }] }
    );


  } catch (err) {
    console.error(err, 'Error during updating records');
    return next(new ErrorHandler("An error occurred while updating records", 500));
  }
});

exports.getFilterReportingtoModuleList = catchAsyncErrors(async (req, res, next) => {
  let reportingheaders;
  const { modulename, submodulename, mainpagename, subpagename, subsubpagename } = req.body;
  try {
    let query = {};

    if (Array.isArray(modulename) && modulename.length > 0) {
      query.modulename = { $in: modulename };
    }
    if (Array.isArray(submodulename) && submodulename.length > 0) {
      query.submodulename = { $in: submodulename };
    }
    if (Array.isArray(mainpagename) && mainpagename.length > 0) {
      query.mainpagename = { $in: mainpagename };
    }
    if (Array.isArray(subpagename) && subpagename.length > 0) {
      query.subpagename = { $in: subpagename };
    }
    if (Array.isArray(subsubpagename) && subsubpagename.length > 0) {
      query.subsubpagename = { $in: subsubpagename };
    }
    reportingheaders = await Reportingheader.find(query);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!reportingheaders) {
    return next(new ErrorHandler("Reportingheader not found!", 404));
  }
  return res.status(200).json({
    reportingheaders,
  });
});