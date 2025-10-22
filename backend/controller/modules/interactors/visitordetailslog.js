const VisitorDetailsLog = require('../../../model/modules/interactors/visitordetailslog');
const ErrorHandler = require('../../../utils/errorhandler');
// const Task = require('../../../model/modules/project/task');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Visitors = require("../../../model/modules/interactors/visitor");

//get All VisitorDetailsLog =>/api/VisitorDetailsLog
exports.getAllVisitorDetailsLog = catchAsyncErrors(async (req, res, next) => {
  let visitordetailslog;
  try {
    visitordetailslog = await VisitorDetailsLog.find()
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!visitordetailslog) {
    return next(new ErrorHandler('VisitorDetailsLog not found!', 404));
  }
  return res.status(200).json({
    visitordetailslog
  });
})


//create new VisitorDetailsLog => /api/VisitorDetailsLog/new
exports.addVisitorDetailsLog = catchAsyncErrors(async (req, res, next) => {
  // let checkmain = await Addexists.findOne({ name: req.body.name });
  // if (checkmain) {
  //     return next(new ErrorHandler('Name already exist!', 400));
  // }
  let avisitordetailslog = await VisitorDetailsLog.create(req.body);
  return res.status(200).json({
    message: 'Successfully added!'
  });
})

exports.getSingleVisitorDetailsLog = catchAsyncErrors(async (req, res, next) => {
  const visitorcommonid = req.params.id.replace(/#/g, "-"); // Extract visitorid from URL parameter

  console.log(visitorcommonid, "visitorcommonid")
  // Find the document where visitorid matches the given id
  const svisitordetailslog = await VisitorDetailsLog.find({ visitorcommonid });

  if (!svisitordetailslog) {
    return next(new ErrorHandler('VisitorDetailsLog not found', 404));
  }

  return res.status(200).json({
    svisitordetailslog,
  });
});


exports.updateVisitorDetailsLog = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id; // The ID to compare with visitorid
  const updateData = req.body; // The data to update

  // Find the document where visitorid matches the provided id and update it
  const uvisitordetailslog = await VisitorDetailsLog.findOneAndUpdate(
    { visitorid: id }, // Filter condition
    updateData,        // Data to update
    { new: true }      // Return the updated document
  );

  if (!uvisitordetailslog) {
    return next(new ErrorHandler('VisitorDetailsLog not found', 404));
  }

  return res.status(200).json({ message: 'Updated successfully', data: uvisitordetailslog });
});


//delete VisitorDetailsLog by id => /api/VisitorDetailsLog/:id
exports.deleteVisitorDetailsLog = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dvisitordetailslog = await VisitorDetailsLog.findByIdAndRemove(id);
  if (!dvisitordetailslog) {
    return next(new ErrorHandler('VisitorDetailsLog not found', 404));
  }

  return res.status(200).json({ message: 'Deleted successfully' });
})

//get All getAllVisitorDetailsLogGrouping =>/api/getAllVisitorDetailsLogGrouping
exports.getAllVisitorDetailsLogGrouping = catchAsyncErrors(async (req, res, next) => {
  try {
    const visitordetailslog = await VisitorDetailsLog.aggregate([
      {
        $group: {
          _id: "$visitorcommonid", // Group by the visitorid field
          logs: { $push: "$$ROOT" }, // Collect the original records for each visitorid
          lastLog: { $last: "$$ROOT" }
        }
      },
      {
        $sort: { "_id": 1 } // Sort by visitorid to maintain a consistent order
      },
      {
        $project: {
          _id: 1, // Include only the logs field
          currectvisitoremail: "$lastLog.visitoremail", // Include the visitoremail from the last log
          currectvisitorcontactnumber: "$lastLog.visitorcontactnumber", // Include the visitorcontactnumber from the last log
          currectvisitorname: "$lastLog.visitorname", // Include the visitorname from the last log
        }
      },

    ]);

    if (!visitordetailslog || visitordetailslog.length === 0) {
      return next(new ErrorHandler('VisitorDetailsLog not found!', 404));
    }

    return res.status(200).json({
      visitordetailslog
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

//get getSingleVisitorDetailsLogGrouping =>/api/getSingleVisitorDetailsLogGrouping
exports.getSingleVisitorDetailsLogGrouping = catchAsyncErrors(async (req, res, next) => {
  const { visitorid } = req.body;

  try {
    const visitordetailslog = await VisitorDetailsLog.aggregate([
      {
        $match: {
          visitorid: visitorid // Match only the records with the specified visitorid
        }
      },
      {
        $group: {
          _id: "$visitorid", // Group by the visitorid field
          logs: { $push: "$$ROOT" }, // Collect the original records for each visitorid
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          logs: 1, // Include only the logs field
        }
      },

    ]);

    if (!visitordetailslog || visitordetailslog.length === 0) {
      return next(new ErrorHandler('VisitorDetailsLog not found!', 404));
    }

    return res.status(200).json({
      visitordetailslog
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

//getAlloverallfiltervisitors
exports.getAlloverallfiltervisitors = catchAsyncErrors(async (req, res, next) => {
  try {

    const visitorNamesArray = await Visitors.aggregate([
      {
        $group: {
          _id: null, // Group all documents into a single group
          visitorNames: { $addToSet: "$visitorname" }, // Collect unique visitor names into an array
        },
      },
      {
        $project: {
          _id: 0, // Exclude the `_id` field
          visitorNames: 1, // Include only the `visitorNames` array
        },
      },
    ]);

    const visitordetailslog = visitorNamesArray[0]?.visitorNames || [];

    console.log(visitordetailslog, "visitordetailslog")

    if (!visitordetailslog || visitordetailslog.length === 0) {
      return next(new ErrorHandler('VisitorDetailsLog not found!', 404));
    }

    return res.status(200).json({
      visitordetailslog
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

exports.getAlloverallfiltervisitorsname = async (req, res) => {
  try {
    let totalProjects, totalProjectsAllData, result;
    const {
      page,
      pageSize,
      assignbranch,
      visitorname,
      searchQuery,
      allFilters,
      logicOperator,
    } = req.body;

    console.log(searchQuery, "searchQuery");

    // Return an empty response if assignbranch is not provided or empty
    if (!Array.isArray(assignbranch) || assignbranch.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        totalProjectsAllData: [],
        currentPage: page,
        totalPages: 0,
      });
    }

    let query = {};

    // Add `visitorname` filter
    if (Array.isArray(visitorname) && visitorname.length > 0) {
      query.visitorname = { $in: visitorname };
    }

    // Advanced search filter
    const conditions = [];
    if (allFilters && allFilters.length > 0) {
      allFilters.forEach((filter) => {
        if (
          filter.column &&
          filter.condition &&
          (filter.value || ["Blank", "Not Blank"].includes(filter.condition))
        ) {
          conditions.push(
            createFilterCondition(filter.column, filter.condition, filter.value)
          );
        }
      });
    }

    // Add search query filter
    if (searchQuery && searchQuery !== undefined) {
      const searchTermsArray = searchQuery.split(" ");
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

      const orConditions = regexTerms.map((regex) => ({
        $or: [
          { company: regex },
          { branch: regex },
          { unit: regex },
          { date: regex },
          { visitorid: regex },
          { visitorname: regex },
        ],
      }));
      query = {
        $and: [
          query,
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

    // Add conditions based on each branchObj in assignbranch
    const branchFilters = assignbranch.map((branchObj) => ({
      company: branchObj.company,
      branch: branchObj.branch,
      unit: branchObj.unit,
    }));

    // Combine all filters into $and
    const combinedFilter = {
      $and: [
        query,
        { $or: branchFilters },
      ],
    };

    // Use aggregation to fetch the most recent document for each visitorname
    const aggregationPipeline = [
      { $match: combinedFilter }, // Apply combined filters
      { $sort: { createdAt: -1 } }, // Sort by `createdAt` in descending order
      {
        $group: {
          _id: { visitorname: "$visitorname", visitorcommonid: "$visitorcommonid" }, // Group by both `visitorname` and `visitorcommonid`
          mostRecentDocument: { $first: "$$ROOT" }, // Select the most recent document
        },
      },
      {
        $replaceRoot: { newRoot: "$mostRecentDocument" }, // Replace root with the most recent document
      },
    ];


    totalProjectsAllData = await Visitors.aggregate(aggregationPipeline);

    // Count total projects
    totalProjects = totalProjectsAllData.length;

    // Apply pagination
    result = totalProjectsAllData.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + parseInt(pageSize)
    );

    // Return the response
    return res.status(200).json({
      result,
      totalProjects,
      totalProjectsAllData,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


//getAlloverallfiltervisitorsnameLog
exports.getAlloverallfiltervisitorsnameLog = async (req, res) => {
  try {
    let totalProjects, totalProjectsAllData, result;
    const {
      page,
      pageSize,
      assignbranch,
      visitorname,
      searchQuery,
      allFilters,
      logicOperator,
      visitorcommonid
    } = req.body;


    console.log(req.body, "visitorcommonid")

    // Return an empty response if assignbranch is not provided or empty
    if (!Array.isArray(assignbranch) || assignbranch.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        totalProjectsAllData: [],
        currentPage: page,
        totalPages: 0,
      });
    }

    let query = {};


    // if (Array.isArray(visitorname) && visitorname.length > 0) {
    //   query.visitorname = { $in: visitorname };
    // }


    // Advanced search filter
    const conditions = [];
    if (allFilters && allFilters.length > 0) {
      allFilters.forEach((filter) => {
        if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      });
    }

    // Add search query filter
    if (searchQuery && searchQuery !== undefined) {
      const searchTermsArray = searchQuery.split(" ");
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

      const orConditions = regexTerms.map((regex) => ({
        $or: [
          { company: regex },
          { branch: regex },
          { unit: regex },
          { date: regex },
          { visitorid: regex },
          { visitorname: regex },
        ],
      }));
      query = {
        $and: [
          query,
          // {
          //     $or: assignbranch.map(item => ({
          //         company: item.company,
          //         branch: item.branch,
          //     }))
          // },
          ...orConditions,
        ],
      };
      // conditions.push(...orConditions);
    }

    // Apply logicOperator to combine conditions
    if (conditions.length > 0) {
      if (logicOperator === "AND") {
        query.$and = conditions;
      } else if (logicOperator === "OR") {
        query.$or = conditions;
      }
    }

    // Add conditions based on each branchObj in assignbranch
    const branchFilters = assignbranch.map((branchObj) => ({
      company: branchObj.company,
      branch: branchObj.branch,
      unit: branchObj.unit,
    }));

    // Combine all filters into $and
    const combinedFilter = {
      $and: [
        query,
        { $or: branchFilters },
        {
          visitorcommonid: { $in: visitorcommonid }, // Match visitorcommonid with specified IDs
        },
      ],
    };

    // Query the database based on combined filters
    totalProjectsAllData = await Visitors.find(combinedFilter);
    totalProjects = await Visitors.countDocuments(combinedFilter);
    result = await Visitors.find(combinedFilter)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    return res.status(200).json({
      result,
      totalProjects,
      totalProjectsAllData,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal server error" });
  }
};

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

exports.getSingleVisitorDetailsLogForView = catchAsyncErrors(async (req, res, next) => {
  const visitorcommonid = req.params.id; // Extract visitorcommonid from URL parameter

  console.log(visitorcommonid)
  // Find the most recently created document where visitorcommonid matches
  const svisitordetailslog = await VisitorDetailsLog.find({ visitorcommonid })
    .sort({ createdAt: -1 }) // Sort by createdAt in descending order
    .limit(1); // Get the most recent document

  if (!svisitordetailslog || svisitordetailslog.length === 0) {
    return next(new ErrorHandler('VisitorDetailsLog not found', 404));
  }

  return res.status(200).json({
    svisitordetailslog: svisitordetailslog[0], // Return the first document in the array
  });
});



