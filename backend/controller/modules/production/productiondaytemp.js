
const ProductionDayTemp = require('../../../model/modules/production/productiondaytemp');
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const ProductionDayListTemp = require("../../../model/modules/production/productiondaylisttemp");
// get All ProductionDayTemp => /api/productiondayss
exports.getAllProductionDayTemp = catchAsyncErrors(async (req, res, next) => {
  let productiondays;
  try {
    productiondays = await ProductionDayTemp.find();
    if (!productiondays) {
      return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
      // count: products.length,
      productiondays,
    });
  } catch (err) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  
});

// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
exports.getAllProductionDayUniqidTemp = catchAsyncErrors(async (req, res, next) => {
  let productionDay, productionDayid;
  try {
    // productionoriginal = await ProductionOriginal.find();
    productionDay = await ProductionDayTemp.findOne()
      .sort({ createdAt: -1 }) // Sorting in descending order to get the latest entry
      .exec();

    productionDayid = productionDay ? productionDay.uniqueid : 0

  } catch (err) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  // if (!productionoriginal) {
  //   return next(new ErrorHandler("Data not found!", 404));
  // }
  return res.status(200).json({
    productionDayid,
  });
});

// get All ProductionDayTemp => /api/productiondayss
exports.checkIsProdDayCreatedTemp = catchAsyncErrors(async (req, res, next) => {
  let count;
  try {
    count = await ProductionDayTemp.countDocuments({ date: req.body.date, filestatus: "Final" });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    count,
  });
});


// Create new ProductionDayTemp=> /api/productiondays/new
exports.addProductionDayTemp = catchAsyncErrors(async (req, res, next) => {

  let aproductiondays = await ProductionDayTemp.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProductionDayTemp => /api/productiondays/:id
exports.getSingleProductionDayTemp = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sproductiondays = await ProductionDayTemp.findById(id);

  if (!sproductiondays) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sproductiondays,
  });
});

// update ProductionDayTemp by id => /api/productiondays/:id
exports.updateProductionDayTemp = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uproductiondays = await ProductionDayTemp.findByIdAndUpdate(id, req.body);
  if (!uproductiondays) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete ProductionDayTemp by id => /api/productiondays/:id
exports.deleteProductionDayTemp = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dproductiondays = await ProductionDayTemp.findByIdAndRemove(id);

  if (!dproductiondays) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

// delete ProductionDay by unid matching unitidval => /api/productiondays/:unitidval
exports.prodDayDeleteByDate = catchAsyncErrors(async (req, res, next) => {
  try {
    let getids = await ProductionDayTemp.find({ date: req.body.date }, { uniqueid: 1 });
    // Delete documents with matching unid
    let result = await ProductionDayTemp.deleteMany({ date: req.body.date });

    let result1 = await ProductionDayListTemp.deleteMany({ uniqueid: { $in: getids.map((d) => d.uniqueid) } });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

// get All ProductionDay => /api/productiondayss
exports.productionDayTempLastDate = catchAsyncErrors(async (req, res, next) => {
  let productiontemp;
  try {
    let datebefore = new Date(req.body.date);
    datebefore.setDate(datebefore.getDate() - 1);
    let newDateOneMinus = datebefore.toISOString().split("T")[0];

    productiontemp = await ProductionDayTemp.countDocuments({ date: newDateOneMinus });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({
    productiontemp,
  });
});


// get All ProductionDayTemp => /api/productiondayss
exports.checkIsProdDayCreatedTempDayCreate = catchAsyncErrors(async (req, res, next) => {
  let count;
  try {
    count = await ProductionDayTemp.countDocuments({ date: req.body.date });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    count,
  });
});

exports.productionDaysCheckAfterDaypointCreateTemp = catchAsyncErrors(async (req, res, next) => {
  try {
    const productionupload = await ProductionDayTemp.aggregate([
      {
        $lookup: {
          from: "daypointstemps", // Collection name for `DayPointsUpload`
          localField: "date",
          foreignField: "date",
          as: "daypointsupload",
        },
      },
      {
        $addFields: {
          status: {
            $cond: {
              if: { $gt: [{ $size: "$daypointsupload" }, 0] }, // Check if daypoints array is not empty
              then: "Created",
              else: "Not Created",
            },
          },
        },
      },
      {
        $project: {
          // daypoints: 0, // Remove the daypoints array from the output
          date: 1,
          username: 1,
          companyname: 1,
          createddate: 1,
          filestatus: 1,
          uniqueid: 1,
          status: 1,
        },
      },
      {
        $sort: { date: -1 }, // Sort by date in descending order
      },
    ]);

    // if (!productionupload || productionupload.length === 0) {
    //   return next(new ErrorHandler("Data not found!", 404));
    // }

    return res.status(200).json({
      productionupload,
    });
  } catch (err) {
    console.error(err.message);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});