const ProductionMonthOriginal = require("../../../model/modules/production/productionmonthoriginal");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const ProductionMonthUpload = require("../../../model/modules/production/productionmonthupload");

// get All ProductionMonthOriginal => /api/productionmonthoriginals
exports.getAllProductionMonthOriginal = catchAsyncErrors(async (req, res, next) => {
  let productionmonthoriginal;
  try {
    productionmonthoriginal = await ProductionMonthOriginal.find();
  } catch (err) {
    console.log(err.message);
  }
  if (!productionmonthoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    productionmonthoriginal,
  });
});

// get All ProductionMonthOriginal => /api/productionmonthoriginals
exports.getAllProductionMonthOriginalLimited = catchAsyncErrors(async (req, res, next) => {
  let productionmonthoriginal;
  try {
    productionmonthoriginal = await ProductionMonthOriginal.find({}, { vendor: 1, fromdate: 1, todate: 1, month: 1, year: 1, uniqueid: 1, addedby: 1 }).sort({ createdAt: -1 });
  } catch (err) {
    console.log(err.message);
  }
  if (!productionmonthoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    productionmonthoriginal,
  });
});

// get All ProductionMonthOriginal => /api/productionmonthoriginals
exports.getAllProductionMonthOriginalLimitedFilter = catchAsyncErrors(async (req, res, next) => {
  let productionmonthoriginal;
  try {
    const { vendor, fromdate, todate } = req.body;

    let query = {};

    if (vendor.length > 0) {
      query.vendor = { $in: vendor };
    }
    if (fromdate != "" && todate != "") {
      (query.fromdate = { $gte: fromdate }), (query.todate = { $lte: todate });
    }

    productionmonthoriginal = await ProductionMonthOriginal.find(query, { datetimezone: 1, vendor: 1, fromdate: 1, todate: 1, overallcount: 1, percent: 1, createddate: 1, uniqueid: 1, addedby: 1 }).sort({ fromdate: -1, createdAt: -1 });
  } catch (err) {
    console.log(err.message);
  }
  if (!productionmonthoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  console.log(productionmonthoriginal.length);
  return res.status(200).json({
    // count: products.length,
    productionmonthoriginal,
  });
});

// get All ProductionMonthOriginalLIMITED => /api/productionmonthoriginalslimited
exports.getAllProductionMonthOriginalLimitedUniqid = catchAsyncErrors(async (req, res, next) => {
  let productionmonthoriginal, productionmonthoriginalid;
  try {
    // productionmonthoriginal = await ProductionMonthOriginal.find();
    productionmonthoriginalid = await ProductionMonthOriginal.findOne()
      .sort({ createdAt: -1 }) // Sorting in descending order to get the latest entry
      .exec();

    productionmonthoriginal = productionmonthoriginalid && productionmonthoriginalid.uniqueid;
  } catch (err) {
    console.log(err.message);
  }
  // if (!productionmonthoriginal) {
  //   return next(new ErrorHandler("Data not found!", 404));
  // }
  return res.status(200).json({
    productionmonthoriginal,
  });
});

// Create new ProductionMonthOriginal=> /api/productionmonthoriginal/new
exports.addProductionMonthOriginal = catchAsyncErrors(async (req, res, next) => {
  let aproductionmonthoriginal = await ProductionMonthOriginal.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProductionMonthOriginal => /api/productionmonthoriginal/:id
exports.getSingleProductionMonthOriginal = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sproductionmonthoriginal = await ProductionMonthOriginal.findById(id);

  if (!sproductionmonthoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sproductionmonthoriginal,
  });
});

// update ProductionMonthOriginal by id => /api/productionmonthoriginal/:id
exports.updateProductionMonthOriginal = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uproductionmonthoriginal = await ProductionMonthOriginal.findByIdAndUpdate(id, req.body);
  if (!uproductionmonthoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete ProductionMonthOriginal by id => /api/productionmonthoriginal/:id
exports.deleteProductionMonthOriginal = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dproductionmonthoriginal = await ProductionMonthOriginal.findByIdAndRemove(id);

  if (!dproductionmonthoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.getUniqidFromDateProdMonthupload = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date } = req.body;

    // Calculate `newDateOnePlus` and `newDateOneMinus`
    const dateoneafter = new Date(date);
    dateoneafter.setDate(dateoneafter.getDate() + 1);
    const newDateOnePlus = dateoneafter.toISOString().split("T")[0];

    // Execute queries in parallel
    const [productionmonthoriginal, productionUploadCount] = await Promise.all([ProductionMonthOriginal.find({ fromdate: { $in: [date, newDateOnePlus] } }, { overallcount: 1 }), ProductionMonthUpload.countDocuments({ fromdate: { $in: [date, newDateOnePlus] } })]);

    // Calculate the total sum from the aggregation result
    // const totalSum = productionmonthoriginal.length > 0 ? productionmonthoriginal[0].totalSum : 0;
    const totalSum = productionmonthoriginal.reduce((acc, obj) => acc + Number(obj.overallcount), 0);

    // Calculate zero count
    // const zeroCount = productionIndividualZeroCount + productionUploadZeroCount;
    console.log(totalSum, productionUploadCount, "originalcheck");
    // Return the response
    return res.status(200).json({
      totalSum,
      productionUpload: productionUploadCount,
      // count: zeroCount,
    });
  } catch (err) {
    console.log(err);
    // console.error('Error in getUniqidFromDateProdupload:', err);
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// get All ProductionMonthOriginalLIMITED => /api/productionmonthoriginalslimited
exports.productionMonthOriginalLastThree = catchAsyncErrors(async (req, res, next) => {
  let productionmonthoriginal;
  try {
    productionmonthoriginal = await ProductionMonthOriginal.find({}, { vendor: 1, percent: 1, addedby: 1, fromdate: 1, todate: 1, createddate: 1, _id: 0 }).sort({ fromdate: -1, createdAt: -1 }).limit(4);
  } catch (err) {
    console.log(err.message);
  }
  // if (!productionmonthoriginal) {
  //   return next(new ErrorHandler("Data not found!", 404));
  // }
  return res.status(200).json({
    productionmonthoriginal,
  });
});
