const IpMaster = require("../../../model/modules/account/ipmodel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const IpCategory = require("../../../model/modules/account/ipcategory");
const Addpassword = require("../../../model/modules/password/addPasswordModel");


// get overall delete functionality
exports.getOverAllDeleteIP = catchAsyncErrors(async (req, res, next) => {
  let ipcat, ipcatmaster, countlength;
  try {

    ipcat = await Addpassword.find({ assignedip: { $in: req.body.checkunit } }, {});

    // ipcatmaster = await IpMaster.find({
    //   ipconfig: {
    //     $elemMatch: {
    //       status: "assigned",
    //       ipaddress: { $in: req.body.checkunit },
    //     },
    //   },
    // },
    //   {
    //     "ipconfig.$": 1, // This projects only the first matching element from the ipconfig array
    //   }
    // );

    ipcatmaster = await IpMaster.aggregate([
      {
        $match: {
          "ipconfig.status": "assigned",
          "ipconfig.ipaddress": { $in: req.body.checkunit }
        }
      },
      {
        $project: {
          ipconfig: {
            $filter: {
              input: "$ipconfig",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.status", "assigned"] },
                  { $in: ["$$item.ipaddress", req.body.checkunit] }
                ]
              }
            }
          }
        }
      }
    ]);

    countlength = ipcatmaster.length + ipcat.length

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!countlength) {
  //   return next(new ErrorHandler("IpMaster not found!", 404));
  // }
  return res.status(200).json({
    countlength, ipcat, ipcatmaster
  });
});





// get All IpMaster Name => /api/ipmasters
exports.getAllIpMaster = catchAsyncErrors(async (req, res, next) => {
  let ipmaster;
  try {
    ipmaster = await IpMaster.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!ipmaster) {
    return next(new ErrorHandler("ipmaster Name not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    ipmaster,
  });
});

// Create new IpMaster=> /api/ipmaster/new
exports.addIpMaster = catchAsyncErrors(async (req, res, next) => {
  // let checkloc = await IpMaster.findOne({ name: req.body.name });

  // if (checkloc) {
  //     return next(new ErrorHandler("ipmaster Name already exist!", 400));
  // }

  let aipmaster = await IpMaster.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle IpMaster => /api/ipmaster/:id
exports.getSingleIpMaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sipmaster = await IpMaster.findById(id);

  if (!sipmaster) {
    return next(new ErrorHandler("ipmaster Name not found!", 404));
  }
  return res.status(200).json({
    sipmaster,
  });
});

// update IpMaster by id => /api/ipmaster/:id
exports.updateIpMaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uipmaster = await IpMaster.findByIdAndUpdate(id, req.body);
  if (!uipmaster) {
    return next(new ErrorHandler("ipmaster Name not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete IpMaster by id => /api/ipmaster/:id
exports.deleteIpMaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dipmaster = await IpMaster.findByIdAndRemove(id);

  if (!dipmaster) {
    return next(new ErrorHandler("ipmaster Name not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.getipsubcategory = catchAsyncErrors(async (req, res, next) => {
  let subcatip;
  try {
    subcatip = await IpCategory.find({
      categoryname: { $eq: req.body.categoryname },
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!subcatip) {
    return next(new ErrorHandler("SubCategory  not found!", 404));
  }
  return res.status(200).json({
    subcatip,
  });
});

exports.updateIpObjects = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      updatevalue,
      company,
      branch,
      unit,
      team,
      employeename,
      assignedthrough,
      floor,
      area,
      location,
      assetmaterial,
       assetmaterialcode,
      addedby,
      ipaddress,
      status,
    } = req.body;
    // Construct an array of update operations for each item in changecheckedlabel
    const updateOperations =
    // changecheckedlabel.map(changedProduct => (
    {
      updateOne: {
        filter: {
          "ipconfig._id": updatevalue,
        },
        update: {
          $set: {
            "ipconfig.$.ipaddress": ipaddress,
            "ipconfig.$.company": company,
            "ipconfig.$.branch": branch,
            "ipconfig.$.unit": unit,
            "ipconfig.$.team": team,
            "ipconfig.$.employeename": employeename,
            "ipconfig.$.assignedthrough": assignedthrough,
            "ipconfig.$.floor": floor,
            "ipconfig.$.location": location,
            "ipconfig.$.area": area,
            "ipconfig.$.assetmaterial": assetmaterial,
             "ipconfig.$.assetmaterialcode": assetmaterialcode,
            "ipconfig.$.status": status,
            "ipconfig.$.addedby": addedby,
          },
        },
      },
    };
    // ));
    // Execute the update operations one by one to check and update the matching 'Printed' statuses to 'Re-Printed'
    // for (const operation of updateOperations) {
    const { filter, update } = updateOperations.updateOne;

    const ipmaster = await IpMaster.findOne(filter);

    if (ipmaster) {
      const product = ipmaster.ipconfig.id(filter["ipconfig._id"]);

      await IpMaster.updateOne(filter, update);
    }
    // }

    return res.status(200).json({ message: "IPmaster updated successfully" });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
    return next(new ErrorHandler("Error updating stock!", 500));
  }
});

exports.updateIpObjectsupdatedby = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      updatevalue,
      company,
      branch,
      unit,
      floor,
      area,
      location,
      assetmaterial,
         assetmaterialcode,
      updatedby,
      ipaddress,
    } = req.body;

    const updateOperations = {
      updateOne: {
        filter: {
          "ipconfig._id": updatevalue,
        },
        update: {
          $set: {
            "ipconfig.$.ipaddress": ipaddress,
            "ipconfig.$.company": company,
            "ipconfig.$.branch": branch,
            "ipconfig.$.unit": unit,
            "ipconfig.$.floor": floor,
            "ipconfig.$.location": location,
            "ipconfig.$.area": area,
            "ipconfig.$.assetmaterial": assetmaterial,
            "ipconfig.$.assetmaterialcode": assetmaterialcode,
            "ipconfig.$.status": "assigned",
            "ipconfig.$.updatedby": updatedby,
          },
        },
      },
    };
    // ));

    // Execute the update operations one by one to check and update the matching 'Printed' statuses to 'Re-Printed'
    // for (const operation of updateOperations) {
    const { filter, update } = updateOperations.updateOne;

    const ipmaster = await IpMaster.findOne(filter);

    if (ipmaster) {
      const product = ipmaster.ipconfig.id(filter["ipconfig._id"]);

      await IpMaster.updateOne(filter, update);
    }

    return res.status(200).json({ message: "IPmaster updated successfully" });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
    return next(new ErrorHandler("Error updating stock!", 500));
  }
});

exports.deleteIpObjects = catchAsyncErrors(async (req, res, next) => {
  try {
    const { updatevalue } = req.body;

    // Construct an array of update operations for each item in changecheckedlabel
    const updateOperations =
    // changecheckedlabel.map(changedProduct => (
    {
      updateOne: {
        filter: {
          "ipconfig._id": updatevalue,
        },
        update: {
          $set: {
            // "ipconfig.$.ipaddress": "getid",
            "ipconfig.$.company": "",
            "ipconfig.$.branch": "",
            "ipconfig.$.unit": "",
            "ipconfig.$.floor": "",
            "ipconfig.$.location": "",
            "ipconfig.$.area": "",
            "ipconfig.$.assetmaterial": "",
              "ipconfig.$.assetmaterialcode": "",
            "ipconfig.$.status": "",
          },
        },
      },
    };
    // ));

    // Execute the update operations one by one to check and update the matching 'Printed' statuses to 'Re-Printed'
    // for (const operation of updateOperations) {
    const { filter, update } = updateOperations.updateOne;

    const ipmaster = await IpMaster.findOne(filter);

    if (ipmaster) {
      const product = ipmaster.ipconfig.id(filter["ipconfig._id"]);

      await IpMaster.updateOne(filter, update);
    }
    // }

    return res.status(200).json({ message: "IPmaster updated successfully" });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
    return next(new ErrorHandler("Error updating stock!", 500));
  }
});


// get All IpMaster Name => /api/ipmasters
exports.getAllIpMasterAccess = catchAsyncErrors(async (req, res, next) => {
  let ipmaster;
  try {

    ipmaster = await IpMaster.find(filterQuery);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!ipmaster) {
    return next(new ErrorHandler("ipmaster Name not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    ipmaster,
  });
});


exports.getAllIpConfigunAssigned = catchAsyncErrors(async (req, res, next) => {
  let ipconfigArray;

  try {
    // Using aggregation to process and filter the data
    const result = await IpMaster.aggregate([
      {
        $project: {
          ipconfig: {
            $filter: {
              input: "$ipconfig", // The ipconfig array field
              as: "config", // Variable name for each element
              cond: { $ne: ["$$config.status", "assigned"] }, // Filter condition
            },
          },
        },
      },
      {
        $unwind: "$ipconfig", // Flatten the filtered ipconfig arrays
      },
      {
        $group: {
          _id: null, // Group all documents into a single group
          allIpConfigs: { $push: "$ipconfig" }, // Collect all ipconfig objects
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          allIpConfigs: 1, // Include the concatenated array
        },
      },
    ]);

    ipconfigArray = result.length > 0 ? result[0].allIpConfigs : [];
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    ipconfigArray, // Respond with the filtered concatenated array
  });
});
