const UpdatedNewrate = require('../../../model/modules/production/UpdatedNewrate');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const ProductionUpload = require("../../../model/modules/production/productionupload");

//get All UpdatedNewrate =>/api/UpdatedNewrate
exports.getAllUpdatedNewrate = catchAsyncErrors(async (req, res, next) => {
  let updatedunitrates;
  try {
    updatedunitrates = await UpdatedNewrate.find();
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!updatedunitrates) {
    return next(new ErrorHandler('Timesheet not found!', 404));
  }

  return res.status(200).json({
    updatedunitrates,
  });
});

//get All UpdatedNewrate =>/api/UpdatedNewrate
exports.getAllUpdatedNewrateLimited = catchAsyncErrors(async (req, res, next) => {
  let updatedunitrates;
  try {
    updatedunitrates = await UpdatedNewrate.find({}, { newrate: 1, vendor: 1, category: 1, subcategory: 1 });
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!updatedunitrates) {
    return next(new ErrorHandler('Timesheet not found!', 404));
  }

  return res.status(200).json({
    updatedunitrates,
  });
});

//create new UpdatedNewrate => /api/UpdatedNewrate/new
exports.addUpdatedNewrate = catchAsyncErrors(async (req, res, next) => {
  try {
    let aupdatedunitrate = await UpdatedNewrate.create(req.body);
    return res.status(200).json({
      message: 'Successfully added!',
    });
  } catch (Err) {
    console.log(Err, 'err');
  }
});

// get Single UpdatedNewrate => /api/UpdatedNewrate/:id
exports.getSingleUpdatedNewrate = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let supdatedunitrate = await UpdatedNewrate.findById(id);
  if (!supdatedunitrate) {
    return next(new ErrorHandler('Sheet Name not found', 404));
  }
  return res.status(200).json({
    supdatedunitrate,
  });
});

//update UpdatedNewrate by id => /api/UpdatedNewrate/:id
exports.updateUpdatedNewrate = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uupdatedunitrate = await UpdatedNewrate.findByIdAndUpdate(id, req.body);
  if (!uupdatedunitrate) {
    return next(new ErrorHandler('Sheet Name not found', 404));
  }

  return res.status(200).json({ message: 'Updated successfully' });
});

//delete UpdatedNewrate by id => /api/UpdatedNewrate/:id
exports.deleteUpdatedNewrate = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dupdatedunitrate = await UpdatedNewrate.findByIdAndRemove(id);
  if (!dupdatedunitrate) {
    return next(new ErrorHandler('Sheet Name not found', 404));
  }

  return res.status(200).json({ message: 'Deleted successfully' });
});

exports.zeroNewrateOverallReport = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("newrate")
    const { projectvendor, filename, category,fromdate, todate } = req.body;

    const pipeline = [
      // Match stage for filtering ProductionUpload
      {
        $match: {
          unitrate:0,
         ...(projectvendor && projectvendor.length > 0 && { vendor: { $in: projectvendor } }),
         ...(filename && filename.length > 0 && { filenameupdated: { $in: filename } }),
         ...(category && category.length > 0 && { category: { $in: category } }),
          fromdate: { $gte: fromdate, $lte: todate },
        },
      },

      {
        $group: {
          _id: {
            filenameupdated: '$filenameupdated',
            vendor: '$vendor',
            category: '$category',
          },
          flagcount: { $sum: { $toInt: '$flagcount' } },
          count: { $sum: 1 },
          dateval: { $first: '$dateval' }, // Use $first to include a single value
          fromdate: { $first: '$fromdate' },
          todate: { $first: '$todate' },
          unitrate: { $first: '$unitrate' },
        }


      }, {
        $project: {
          _id: 0,
          category: '$_id.category',
          filenameupdated: '$_id.filenameupdated',
          vendor: '$_id.vendor',
          dateval: '$dateval',
          fromdate: '$fromdate',
          todate: '$todate',
          flagcount: '$flagcount',
          count: '$count',
          unitrate: '$unitrate',
        }

      },

      // Lookup to join with QueueTypeMaster
      {
        $lookup: {
          from: 'updatednewrates', // Replace with the actual collection name
          let: {
            category: '$category',
            filenameupdated: '$filenameupdated',
            vendor: { $arrayElemAt: [{ $split: ["$vendor", "-"] }, 0] },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                  { $eq: ['$subcategory', '$$category'] },
                  { $eq: ['$category', '$$filenameupdated'] },
                  { $eq: ['$vendor', '$$vendor'] },
                  ],
                },
              },
            },
          ],
          as: 'unitrateDetails',
        },
      },
      // Unwind the joined array to work with individual matches
      { $unwind: { path: "$unitrateDetails", preserveNullAndEmptyArrays: false } },

      // Project the required fields and compute totals and differences
      {


        $project: {
          filenameupdated: '$filenameupdated',
          vendor: { $arrayElemAt: [{ $split: ["$vendor", "-"] }, 0] },
          vendornew: { $arrayElemAt: [{ $split: ["$vendor", "-"] }, 1] },
          // processdate: { $substr: ['$dateval', 0, 10] },
          category: '$category',
          // subcategory: '$category',
          flagcount: '$flagcount',
          matchcount: '$count',
          orate: '$unitrate',
          newrate: { $toDouble: { $ifNull: ['$unitrateDetails.newrate', 0] } },
          formatteddate: `${fromdate} to ${todate}`,
          oldtotal: {
            $round: [{ $multiply: ['$unitrate', '$flagcount'] }, 5],
          },
          newtotal: {
            $round: [{ $multiply: [{ $toDouble: { $ifNull: ['$unitrateDetails.newrate', 0] } }, '$flagcount'] }, 5],
          },
          difference: {
            $round: [
              {
                $subtract: [{ $multiply: [{ $toDouble: '$unitrateDetails.newrate' }, '$flagcount'] }, { $multiply: ['$unitrate', '$flagcount'] }],
              },
              5,
            ],
          },
        }
      },

      {
        $group: {
          _id: {
            filenameupdated: "$filenameupdated",
            vendor: "$vendor",
            vendornew: "$vendornew",
            category: "$category",
          },
          // subcategory: { "$first": "$subcategory" },
          flagcount: { "$first": "$flagcount" },
          matchcount: { "$first": "$matchcount" },
          orate: { "$first": "$orate" },
          formatteddate: { "$first": "$formatteddate" },
          newrate: { "$first": "$newrate" },
          oldtotal: { "$first": "$oldtotal" },
          newtotal: { "$first": "$newtotal" },
          difference: { "$first": "$difference" },
        },
      },
    
      {
        $project: {
          _id: 0,
          filenameupdated: "$_id.filenameupdated",
          vendor: "$_id.vendor",
          vendornew: "$_id.vendornew",
          category: "$_id.category",
          flagcount: 1,
          formatteddate:1,
          matchcount: 1,
          orate: 1,
          newrate: 1,
          oldtotal: 1,
          newtotal: 1,
          difference: 1,
        },
      },

      // Sort the results
      // { $sort: { filenameupdated: 1 } },
    ];

    // Execute the aggregation pipeline
    const result = await ProductionUpload.aggregate(pipeline);
  //  console.log(result[0], "res")
    // Return the result
    return res.status(200).json({
      prodresult: result,
      count: result.length,
    });
  } catch (err) {
    console.log(err, "error");
    return next(new ErrorHandler("Records not found!", 404));
  }
});

exports.updatedNewrateDupeCheck = catchAsyncErrors(async (req, res, next) => {
  let count;
  try {
    const {vendor,category, subcategory} = req.body
    count = await UpdatedNewrate.countDocuments({vendor,category, subcategory});
  } catch (err) {
    console.log(err,'err')
    return next(new ErrorHandler('Records not found!', 404));
  }
  return res.status(200).json({
    count,
  });
});
