
const ProductionOriginal = require('../../../model/modules/production/productionoriginal');
const ProductionUpload = require("../../../model/modules/production/productionupload");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const ProducionIndividual = require("../../../model/modules/production/productionindividual")

// get All ProductionOriginal => /api/productionoriginals
exports.getAllProductionOriginal = catchAsyncErrors(async (req, res, next) => {
  let productionoriginal;
  try {
    productionoriginal = await ProductionOriginal.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!productionoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    productionoriginal,
  });
});

// get All ProductionOriginal => /api/productionoriginals
exports.getAllProductionOriginalLimited = catchAsyncErrors(async (req, res, next) => {
  let productionoriginal;
  try {
    productionoriginal = await ProductionOriginal.find({}, { datetimezone: 1, vendor: 1, fromdate: 1, todate: 1, overallcount: 1, percent: 1, createddate: 1, uniqueid: 1, addedby: 1 }).sort({ fromdate: -1, createdAt: -1 });
  } catch (err) {
    console.log(err.message);
  }
  if (!productionoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    productionoriginal,
  });
});

// get All ProductionOriginal => /api/productionoriginals
exports.getAllProductionOriginalLimitedFilter = catchAsyncErrors(async (req, res, next) => {
  let productionoriginal;
  try {
    const { vendor, fromdate, todate } = req.body;

    let query = {};

    if (vendor.length > 0) {
      query.vendor = { $in: vendor };
    }
    if (fromdate != "" && todate != "") {
      (query.fromdate = { $gte: fromdate }), (query.todate = { $lte: todate });
    }

    productionoriginal = await ProductionOriginal.find(query, { datetimezone: 1, vendor: 1, fromdate: 1, todate: 1, overallcount: 1, percent: 1, createddate: 1, uniqueid: 1, addedby: 1 }).sort({ fromdate: -1, createdAt: -1 });
  } catch (err) {
    console.log(err.message);
  }
  if (!productionoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  console.log(productionoriginal.length);
  return res.status(200).json({
    // count: products.length,
    productionoriginal,
  });
});

// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
exports.getAllProductionOriginalLimitedUniqid = catchAsyncErrors(async (req, res, next) => {
  let productionoriginal,productionoriginalid;
  try {
    // productionoriginal = await ProductionOriginal.find();
    productionoriginalid = await ProductionOriginal.findOne()
    .sort({ createdAt: -1 }) // Sorting in descending order to get the latest entry
    .exec();

   productionoriginal = productionoriginalid && productionoriginalid.uniqueid

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!productionoriginal) {
  //   return next(new ErrorHandler("Data not found!", 404));
  // }
  return res.status(200).json({
    productionoriginal,
  });
});

// Create new ProductionOriginal=> /api/productionoriginal/new
exports.addProductionOriginal = catchAsyncErrors(async (req, res, next) => {

  let aproductionoriginal = await ProductionOriginal.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProductionOriginal => /api/productionoriginal/:id
exports.getSingleProductionOriginal = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sproductionoriginal = await ProductionOriginal.findById(id);

  if (!sproductionoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sproductionoriginal,
  });
});

// update ProductionOriginal by id => /api/productionoriginal/:id
exports.updateProductionOriginal = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uproductionoriginal = await ProductionOriginal.findByIdAndUpdate(id, req.body);
  if (!uproductionoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete ProductionOriginal by id => /api/productionoriginal/:id
exports.deleteProductionOriginal = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dproductionoriginal = await ProductionOriginal.findByIdAndRemove(id);

  if (!dproductionoriginal) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});
exports.getUniqidFromDateProdupload2 = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date } = req.body;

    // Calculate `newDateOnePlus` and `newDateOneMinus`
    const dateoneafter = new Date(date);
    dateoneafter.setDate(dateoneafter.getDate() + 1);
    const newDateOnePlus = dateoneafter.toISOString().split('T')[0];

    // Execute queries in parallel
    const [productionoriginal,] = await Promise.all([ProductionOriginal.find({ fromdate: { $in: [date, newDateOnePlus] } }, { overallcount: 1, percent:1 }), 
   // ProductionUpload.countDocuments({ fromdate: { $in: [date, newDateOnePlus] } })
   ]
    );

    // Calculate the total sum from the aggregation result
    // const totalSum = productionoriginal.length > 0 ? productionoriginal[0].totalSum : 0;
 //   const totalSum = productionoriginal.reduce((acc, obj) => acc + Number(obj.overallcount), 0);
//	console.log(totalSum, productionUploadCount, 'roginalcheck')
    // Calculate zero count
    // const zeroCount = productionIndividualZeroCount + productionUploadZeroCount;
	const totalSum = productionoriginal.every( item => item.percent === "100")
	const productionUploadCount = totalSum ;
	console.log(totalSum,  'roginalcheck')
    // Return the response
    return res.status(200).json({
      totalSum,
     productionUpload: productionUploadCount,
      // count: zeroCount,
    });
  } catch (err) {
   	
    return res.status(500).json({ error: 'Server Error', details: err.message });
  }
});


exports.getUniqidFromDateProdupload = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date } = req.body;

    // Calculate `newDateOnePlus` and `newDateOneMinus`
    const dateoneafter = new Date(date);
    dateoneafter.setDate(dateoneafter.getDate() + 1);
    const newDateOnePlus = dateoneafter.toISOString().split('T')[0];

    // Execute queries in parallel
    const [productionoriginal, productionUploadCount] = await Promise.all([ProductionOriginal.find({ fromdate: { $in: [date, newDateOnePlus] } }, { overallcount: 1 }), ProductionUpload.countDocuments({ fromdate: { $in: [date, newDateOnePlus] } })]);

    const totalSum = productionoriginal.reduce((acc, obj) => acc + Number(obj.overallcount), 0);

    console.log(totalSum, productionUploadCount, 'originalcheck');
  
    return res.status(200).json({
      totalSum,
      productionUpload: productionUploadCount,
      // count: zeroCount,
    });
  } catch (err) {
    console.log(err);
    // console.error('Error in getUniqidFromDateProdupload:', err);
    return res.status(500).json({ error: 'Server Error', details: err.message });
  }
});
// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
exports.productionOriginalLastThree = catchAsyncErrors(async (req, res, next) => {
  let productionoriginal;
  try {
    productionoriginal = await ProductionOriginal.find({}, { vendor: 1, percent: 1, addedby: 1, fromdate: 1, todate: 1, createddate: 1, _id: 0 }).sort({ fromdate: -1, createdAt: -1 }).limit(4);
  } catch (err) {
    console.log(err.message);
  }
  // if (!productionoriginal) {
  //   return next(new ErrorHandler("Data not found!", 404));
  // }
  return res.status(200).json({
    productionoriginal,
  });
});


exports.productionCheckFileStatus = catchAsyncErrors(async (req, res, next) => {
  let productionupload = 0, productiontempcheckfileupload;
  try {
    const { date } = req.body;
    console.log(date, 'date123');
    if (date != '') {
      // productionupload = await ProductionOriginal.countDocuments({ fromdate: date, filestatus: 'final' });
      productiontempcheckfileupload = await ProductionOriginal.countDocuments({ fromdate: date});

      console.log(productionupload,productiontempcheckfileupload, 'productionupload');
    } else {
      productionupload = 0;
      productiontempcheckfileupload = 0
    }
  } catch (err) {
    console.log(err, 'productiontempfilestatus');
  }
  return res.status(200).json({
    productionupload:0,
    productiontempcheckfileupload
  });
});
