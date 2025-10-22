const ProductionTemp = require('../../../model/modules/production/productiontemp');
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const ProductionTempUploadAll = require("../../../model/modules/production/productiontempuploadall");

// get All ProductionTemp => /api/productiontemps
exports.getAllProductionTemp = catchAsyncErrors(async (req, res, next) => {
  let productiontemp;
  try {
    productiontemp = await ProductionTemp.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!productiontemp) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    productiontemp,
  });
});

// get All ProductionTemp => /api/productiontemps
exports.getAllProductionTempLimited = catchAsyncErrors(async (req, res, next) => {
  let productiontemp;
  try {
    productiontemp = await ProductionTemp.find({}, { datetimezone: 1, vendor: 1, fromdate: 1, filestatus: 1, todate: 1, overallcount: 1, percent: 1, createddate: 1, uniqueid: 1, addedby: 1 }).sort({ fromdate: -1, createdAt: -1 });
  } catch (err) {
    console.log(err.message);
  }
  if (!productiontemp) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    productiontemp,
  });
});

// get All ProductionOriginal => /api/productionoriginals
exports.getAllProductionTempLimitedFilter = catchAsyncErrors(async (req, res, next) => {
  let productiontemp;
  try {
    const { vendor, fromdate, todate } = req.body;

    let query = {};

    if (vendor.length > 0) {
      query.vendor = { $in: vendor };
    }

    if (fromdate !== "" && todate !== "") {
      query.fromdate = { $gte: fromdate };
      query.todate = { $lte: todate };
    }

    productiontemp = await ProductionTemp.find(query, { datetimezone: 1, vendor: 1, fromdate: 1, todate: 1, overallcount: 1, percent: 1, createddate: 1, uniqueid: 1, addedby: 1, filestatus: 1, }).sort({ fromdate: -1, createdAt: -1 });
  } catch (err) {
    console.log(err.message);
  }
  if (!productiontemp) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  console.log(productiontemp.length);
  return res.status(200).json({
    // count: products.length,
    productiontemp,
  });
});
// get All ProductionTempLIMITED => /api/productiontempslimited
exports.getAllProductionTempLimitedUniqid = catchAsyncErrors(async (req, res, next) => {
  let productiontemp, productiontempid;
  try {
    // productiontemp = await ProductionTemp.find();
    productiontempid = await ProductionTemp.findOne()
      .sort({ createdAt: -1 }) // Sorting in descending order to get the latest entry
      .exec();

    productiontemp = productiontempid && productiontempid.uniqueid

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!productiontemp) {
  //   return next(new ErrorHandler("Data not found!", 404));
  // }
  return res.status(200).json({
    productiontemp,
  });
});

// Create new ProductionTemp=> /api/productiontemp/new
exports.addProductionTemp = catchAsyncErrors(async (req, res, next) => {

  let aproductiontemp = await ProductionTemp.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProductionTemp => /api/productiontemp/:id
exports.getSingleProductionTemp = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sproductiontemp = await ProductionTemp.findById(id);

  if (!sproductiontemp) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sproductiontemp,
  });
});

// update ProductionTemp by id => /api/productiontemp/:id
exports.updateProductionTemp = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uproductiontemp = await ProductionTemp.findByIdAndUpdate(id, req.body);
  if (!uproductiontemp) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete ProductionTemp by id => /api/productiontemp/:id
exports.deleteProductionTemp = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dproductiontemp = await ProductionTemp.findByIdAndRemove(id);

  if (!dproductiontemp) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});


// get All ProductionOriginal => /api/productionoriginals
exports.getUniqidFromDateProduploadTemp = catchAsyncErrors(async (req, res, next) => {
  let productionoriginal, productionUpload, totalSum;
  try {
    const { date } = req.body;
    let dateoneafter = new Date(date);
    dateoneafter.setDate(dateoneafter.getDate() + 1);
    let newDateOnePlus = dateoneafter.toISOString().split("T")[0];

    let datebefore = new Date(date);
    datebefore.setDate(datebefore.getDate() - 1);
    let newDateOneMinus = datebefore.toISOString().split("T")[0];

    const [productionoriginal,productionUploadCount] = await Promise.all([ProductionTemp.find({ fromdate: { $in: [date, newDateOnePlus] } }, { overallcount: 1, }), 
   ProductionTempUploadAll.countDocuments({ fromdate: { $in: [date, newDateOnePlus] } })
   ]
    );
	const totalSum = productionoriginal.reduce((acc,obj) => acc+ Number(obj.overallcount), 0)
	
		
    // Return the response
    return res.status(200).json({
      totalSum,
     productionUpload: productionUploadCount,
    
    });

  } catch (err) {
    return next(new ErrorHandler("Data not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    totalSum, productionUpload
  });
});

// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
exports.productionTempLastThree = catchAsyncErrors(async (req, res, next) => {
  let productiontemp;
  try {
    productiontemp = await ProductionTemp.find({}, { vendor: 1, addedby: 1, fromdate: 1, percent: 1, todate: 1, filestatus: 1, createddate: 1, _id: 0 }).sort({ fromdate: -1, createdAt: -1 }).limit(4);
  } catch (err) {
    console.log(err.message);
  }
  return res.status(200).json({
    productiontemp,
  });
});

// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
exports.productionTempCheckFileStatus = catchAsyncErrors(async (req, res, next) => {
  let productiontemp, productiontempcheckfileupload;
  try {
    const { date } = req.body;
    console.log(date, 'date123');
    if (date != '') {
      productiontemp = await ProductionTemp.countDocuments({ fromdate: date, filestatus: 'final' });
      productiontempcheckfileupload = await ProductionTemp.countDocuments({ fromdate: date});

    } else {
      productiontemp = 0;
      productiontempcheckfileupload = 0
    }
  } catch (err) {
    console.log(err, 'productiontempfilestatus');
  }
  return res.status(200).json({
    productiontemp,
    productiontempcheckfileupload
  });
});

// get All ProductionTemp => /api/productiontemps
exports.productionTempLastDate = catchAsyncErrors(async (req, res, next) => {
  let productiontemp, vendorlength, vendors;
  try {
    const { date } = req.body;
    console.log(date, "date");
    if (date != "") {
      let datebefore = new Date(date);
      datebefore.setDate(datebefore.getDate() - 1);
      let newDateOneMinus = datebefore.toISOString().split("T")[0];
      let productiontempoverall = await ProductionTemp.countDocuments({});
      let productiontempbeforedate = await ProductionTemp.countDocuments({ fromdate: newDateOneMinus });
      let productiontempbeforedatevendors = await ProductionTemp.find({ fromdate: newDateOneMinus }, { vendor: 1, _id: 0 });
      vendors = productiontempbeforedatevendors ? [...new Set(productiontempbeforedatevendors.map(d => d.vendor))] : [];
      console.log(vendors)
      productiontemp = productiontempbeforedate === 0 ? 3 : productiontempoverall === 0 ? 3 : await ProductionTemp.countDocuments({ fromdate: newDateOneMinus, filestatus: "final" });
      console.log(productiontemp, "productiontemp");
    } else {
      productiontemp = 0;
    }
  } catch (err) {
    console.log(err);
  }

  return res.status(200).json({

    productiontemp, vendorlength: vendors.length
  });
});

// get All ProductionOriginalLIMITED => /api/productionoriginalslimited
exports.productionTempFinalVendorCreated = catchAsyncErrors(async (req, res, next) => {
  let productiontemp;
  try {
    const { date, vendor } = req.body;
    console.log(date, vendor)
    if (date != '' && vendor != '') {
      productiontemp = await ProductionTemp.countDocuments({ fromdate: date,vendor:vendor, filestatus: 'final' });
      console.log(productiontemp, 'productiontemp');
    } else {
      productiontemp = 0;
    }
  } catch (err) {
    console.log(err.message);
  }
  return res.status(200).json({
    productiontemp,
  });
});
