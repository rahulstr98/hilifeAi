const Visitors = require("../../../model/modules/interactors/visitor");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const Addcandidate = require("../../../model/modules/recruitment/addcandidate");
const User = require("../../../model/login/auth");
const faceapi = require('face-api.js');
// get All visitors => /api/allvisitors

exports.getExistingVisitor = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    const { assignbranch, visitornameexists } = req.body;

    // Create branchFilter with valid MongoDB key-value structure
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      unit: branchObj.unit,
      interactorstatus: "visitor",
    }));

    // Add condition for `visitorname` matching `visitornameexists`
    const visitornameCondition = visitornameexists
      ? { visitorname: { $regex: visitornameexists, $options: "i" } } // Case-insensitive match
      : {};

    // Combine branchFilter with the visitorname condition using $or
    const filterQuery = {
      $or: branchFilter.map((filter) => ({ ...filter, ...visitornameCondition })),
    };

    // Query the database
    const visitors = await Visitors.find(filterQuery);


    if (!visitors) {
      return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
      // count: products.length,
      visitors,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

exports.getAllVisitors = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    const { assignbranch } = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      unit: branchObj.unit,
    }));

    // Use $or to filter incomes that match any of the branch, company, and unit combinations
    const filterQuery = { $or: branchFilter };
    visitors = await Visitors.find(filterQuery);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!visitors) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    visitors,
  });
});

exports.getAllVisitorsRegister = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {

    visitors = await Visitors.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!visitors) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    visitors,
  });
});



//visitor scan
exports.getAllVisitorsCheckout = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    visitors = await Visitors.find(
      { checkout: false, company: req.body.company, branch: req.body.branch },
      { visitorname: 1, date: 1, intime: 1 }
    );
    if (!visitors) {
      return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
      // count: products.length,
      visitors,
    });
  } catch (err) {
    return next(new ErrorHandler("Data not found", 404));
  }

});

exports.getAllVisitorsFilteredId = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    visitors = await Visitors.find({}, { _id: 0, visitorid: 1 });
    if (!visitors) {
      return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
      // count: products.length,
      visitors,
    });
  } catch (err) {
    return next(new ErrorHandler("Data not found", 404));
  }

});
exports.getAllVisitorUpdateId = catchAsyncErrors(async (req, res, next) => {
  const { outerId, outtime } = req.body;

  // Update the nested array element using array filters
  let user = await Visitors.findOneAndUpdate(
    { _id: outerId },
    {
      $set: {
        outtime: outtime,
        checkout: true,
        "followuparray.$[].outtime": outtime,
      },
    }, // Set the matched array element to updateData
    { new: true } // Return the updated document
  );

  if (!user) {
    return next(new ErrorHandler("Data not found!", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});

exports.getLastIndexVisitors = catchAsyncErrors(async (req, res, next) => {
  let visitor;
  try {
    visitor = await Visitors.findOne().sort({ _id: -1 });
  } catch (err) {
    return next(new ErrorHandler("Record not found!", 404));
  }
  if (!visitor) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    visitor,
  });
});

// Create new Connectivity=> /api/visitors/new
exports.addVisitors = catchAsyncErrors(async (req, res, next) => {
  let avisitors = await Visitors.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single interactortype => /api/visitors/:id
exports.getSingleVisitors = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let svisitors = await Visitors.findById(id);

  if (!svisitors) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    svisitors,
  });
});

// update Interactor Type by id => /api/visitors/:id
exports.updateVisitors = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uvisitors = await Visitors.findByIdAndUpdate(id, req.body);
  if (!uvisitors) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

//patching the visitors
exports.updatePatchVisitors = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uvisitors = await Visitors.updateOne({ _id: id }, { $set: req.body });
  if (!uvisitors) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete interactor type by id => /api/visitors/:id
exports.deleteVisitors = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dvisitors = await Visitors.findByIdAndRemove(id);

  if (!dvisitors) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});


exports.skippedVisitors = async (req, res) => {
  try {
    let totalProjects, totalProjectsAllData, result;
    const {
      page,
      pageSize,
      assignbranch,
      fromdate,
      searchQuery,
      allFilters,
      logicOperator,
      todate,
      company,
      branch,
      unit,
      visitortype,
      visitormode,
      visitorpurpose
    } = req.body;

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

    // Add date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    // Add other filters
    if (Array.isArray(company) && company.length > 0) {
      query.company = { $in: company };
    }
    if (Array.isArray(branch) && branch.length > 0) {
      query.branch = { $in: branch };
    }
    if (Array.isArray(unit) && unit.length > 0) {
      query.unit = { $in: unit };
    }
    if (Array.isArray(visitortype) && visitortype.length > 0) {
      query.visitortype = { $in: visitortype };
    }
    if (Array.isArray(visitormode) && visitormode.length > 0) {
      query.visitormode = { $in: visitormode };
    }
    if (Array.isArray(visitorpurpose) && visitorpurpose.length > 0) {
      query.visitorpurpose = { $in: visitorpurpose };
    }

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
          { visitortype: regex },
          { visitormode: regex },
          { visitorpurpose: regex },
          { visitorcontactnumber: regex },
          { intime: regex },
          { outtime: regex },
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
      interactorstatus: "visitor",
    }));

    // Combine all filters into $and
    const combinedFilter = {
      $and: [
        query,
        { $or: branchFilters },
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
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.skippedAllVisitors = async (req, res) => {
  try {
    let totalProjects, result, totalProjectsAllData;
    const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, fromdate, todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

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

    // Base filters - add each filter as a separate object to `filterQuery` array
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    if (Array.isArray(company) && company.length > 0) {
      query.company = { $in: company };
    }
    if (Array.isArray(branch) && branch.length > 0) {
      query.branch = { $in: branch };
    }
    if (Array.isArray(unit) && unit.length > 0) {
      query.unit = { $in: unit };
    }
    if (Array.isArray(visitortype) && visitortype.length > 0) {
      query.visitortype = { $in: visitortype };
    }
    if (Array.isArray(visitormode) && visitormode.length > 0) {
      query.visitormode = { $in: visitormode };
    }
    if (Array.isArray(visitorpurpose) && visitorpurpose.length > 0) {
      query.visitorpurpose = { $in: visitorpurpose };
    }

    const conditions = [];

    // Advanced search filter
    if (allFilters && allFilters.length > 0) {
      allFilters.forEach(filter => {
        if (filter.column && filter.condition && (filter.value || ["Blank", "Not Blank"].includes(filter.condition))) {
          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      });
    }

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
          { visitortype: regex },
          { visitormode: regex },
          { visitorpurpose: regex },
          { visitorcontactnumber: regex },
          { intime: regex },
          { outtime: regex },
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
    }

    // Apply logicOperator to combine conditions
    if (conditions.length > 0) {
      if (logicOperator === "AND") {
        query.$and = conditions;
      } else if (logicOperator === "OR") {
        query.$or = conditions;
      }
    }

    const branchFilters = assignbranch.map(branchObj => ({
      company: branchObj.company,
      branch: branchObj.branch,
      unit: branchObj.unit,
    }));

    const combinedFilter = {
      $and: [
        query,
        { $or: branchFilters },
      ],
    };

    totalProjects = await Visitors.countDocuments(combinedFilter);
    totalProjectsAllData = await Visitors.find(combinedFilter);

    // Execute the filter query on the User model
    allusers = await Visitors.find(combinedFilter)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    result = allusers;
    return res.status(200).json({
      allusers,
      totalProjects,
      result,
      totalProjectsAllData,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllVisitorsForCandidate = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    visitors = await Visitors.find({}, { visitorname: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!visitors) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    visitors,
  });
});

exports.duplicateCandidateFaceDetectorVisitor = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { faceDescriptor, id } = req.body;

      console.log(faceDescriptor, "faceDescriptor")

      // Ensure faceDescriptor is an array of numbers
      if (
        !Array.isArray(faceDescriptor) ||
        !faceDescriptor.every((num) => typeof num === "number")
      ) {
        throw new Error("Invalid face descriptor format.");
      }

      // Fetch all user face descriptors from MongoDB
      const query = id ? { _id: { $ne: id } } : {};

      const [allcandidates, allUsers, visitorcheck] = await Promise.all([
        Addcandidate.aggregate([
          { $match: query },
          {
            $project: {
              faceDescriptor: 1,
              "experiencedetails.company": 1,
              fullname: 1,
              email: 1,
              mobile: 1,
            }
          },
          { $addFields: { modelName: "Candidate" } },
        ]),
        User.aggregate([
          { $match: query },
          {
            $project: {
              faceDescriptor: 1,
              company: 1,
              branch: 1,
              unit: 1,
              companyname: 1,
              email: 1,
              mobile: "$contactpersonal",
            }
          },
          { $addFields: { modelName: "Employee" } },
        ]),
        Visitors.aggregate([
          { $match: query },
          // {
          //   $project: {
          //     faceDescriptor: 1,
          //     visitorname: 1,
          //     company: 1,
          //     branch: 1,
          //     unit: 1,
          //   }
          // },
          { $addFields: { modelName: "Visitor" } },
        ]),
      ]);

      let authenticated = false;
      const matchedData = [];
      const allData = [...allcandidates, ...allUsers, ...visitorcheck];

      // Compare face descriptors
      for (const data of allData) {
        const storedDescriptor = data?.faceDescriptor;

        if (
          !Array.isArray(storedDescriptor) ||
          storedDescriptor.length !== faceDescriptor.length
        ) {
          continue; // Skip mismatched descriptors
        }

        const distance = faceapi.euclideanDistance(
          faceDescriptor,
          storedDescriptor
        );

        if (distance < 0.4) {
          authenticated = true;
          matchedData.push({
            ...data,
            distance,
          });
        }
      }

      return res
        .status(200)
        .json({ matchfound: authenticated, matchedData });
    } catch (err) {
      console.error("Error:", err);
      return next(new ErrorHandler("Records not found!", 404));
    }
  }
);
exports.AddVisitorInList = async (req, res) => {
  try {
    let totalProjects, totalProjectsAllData, result;
    const {
      page,
      pageSize,
      assignbranch,
      fromdate,
      searchQuery,
      allFilters,
      logicOperator,
      todate,
      company,
      branch,
      unit,
      visitortype,
      visitormode,
      visitorpurpose
    } = req.body;

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

    // Add date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    // Add other filters
    if (Array.isArray(company) && company.length > 0) {
      query.company = { $in: company };
    }
    if (Array.isArray(branch) && branch.length > 0) {
      query.branch = { $in: branch };
    }
    if (Array.isArray(unit) && unit.length > 0) {
      query.unit = { $in: unit };
    }
    if (Array.isArray(visitortype) && visitortype.length > 0) {
      query.visitortype = { $in: visitortype };
    }
    if (Array.isArray(visitormode) && visitormode.length > 0) {
      query.visitormode = { $in: visitormode };
    }
    if (Array.isArray(visitorpurpose) && visitorpurpose.length > 0) {
      query.visitorpurpose = { $in: visitorpurpose };
    }

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
          { visitortype: regex },
          { visitormode: regex },
          { visitorpurpose: regex },
          { visitorcontactnumber: regex },
          { intime: regex },
          { outtime: regex },
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
      interactorstatus: { $in: ["visitor", "addresume"] },
      addvisitorin: true,
    }));

    // Combine all filters into $and
    const combinedFilter = {
      $and: [
        query,
        { $or: branchFilters },
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
