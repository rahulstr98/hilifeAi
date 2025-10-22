
const ProductionDay = require('../../../model/modules/production/productionday');
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const ProductionDayList = require('../../../model/modules/production/productiondaylist');

// get All ProductionDay => /api/productiondayss
exports.getAllProductionDay = catchAsyncErrors(async (req, res, next) => {
  let productiondays;
  try {
    productiondays = await ProductionDay.find();
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

// get All ProductionDay => /api/productiondayss
exports.checkIsProdDayCreated = catchAsyncErrors(async (req, res, next) => {
  let count,countDay;
  try {
    count = await ProductionDay.countDocuments({ date: req.body.date, filestatus:"Final" });
    countDay = await ProductionDay.countDocuments({ date: req.body.date, });
  } catch (err) {
    return next(new ErrorHandler("Data not found!", 404));
  }  return res.status(200).json({
    count,countDay
  });
});

// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
exports.getAllProductionDayUniqid = catchAsyncErrors(async (req, res, next) => {
  let productionDay,productionDayid;
  try {
    // productionoriginal = await ProductionOriginal.find();
    productionDay = await ProductionDay.findOne()
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


// Create new ProductionDay=> /api/productiondays/new
exports.addProductionDay = catchAsyncErrors(async (req, res, next) => {

  let aproductiondays = await ProductionDay.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProductionDay => /api/productiondays/:id
exports.getSingleProductionDay = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sproductiondays = await ProductionDay.findById(id);

  if (!sproductiondays) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sproductiondays,
  });
});

// update ProductionDay by id => /api/productiondays/:id
exports.updateProductionDay = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uproductiondays = await ProductionDay.findByIdAndUpdate(id, req.body);
  if (!uproductiondays) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete ProductionDay by id => /api/productiondays/:id
exports.deleteProductionDay = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dproductiondays = await ProductionDay.findByIdAndRemove(id);

  if (!dproductiondays) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});


// get All ProductionDay => /api/productiondayss
exports.prodDayDeleteByDateOrg = catchAsyncErrors(async (req, res, next) => {
  let count;
  try {
    const uniqueids = await ProductionDay.find({ date: req.body.date }, { uniqueid: 1, _id: 0 });
    const toDeleteIds = uniqueids.map((item) => item.uniqueid);
    //
    count = await ProductionDay.deleteMany({ date: req.body.date });
    let countDayList = await ProductionDayList.deleteMany({ uniqueid: { $in: toDeleteIds } });

    console.log(toDeleteIds, countDayList, 'toDeleteIds');
  } catch (err) {
    console.log(err.message);
  }
  return res.status(200).json({
    count,
  });
});

exports.productionDaysCheckAfterDaypointCreate = catchAsyncErrors(async (req, res, next) => {
  try {
    const productionupload = await ProductionDay.aggregate([
      {
        $lookup: {
          from: "daypoints", // Collection name for `DayPointsUpload`
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
          uniqueid: 1,
          filestatus:1,
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
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});


exports.productionDayLastDate = catchAsyncErrors(async (req, res, next) => {
  let productionupload;
  try {
    let datebefore = new Date(req.body.date);
    datebefore.setDate(datebefore.getDate() - 1);
    let newDateOneMinus = datebefore.toISOString().split('T')[0];

    productionupload = await ProductionDay.countDocuments({ date: newDateOneMinus });
    console.log(productionupload, 'productionprodaylastdate');
  } catch (err) {
    console.log(err.message);
  }
  return res.status(200).json({
    productionupload,
  });
});
