const Raiseissue = require("../../../model/modules/support/raiseproblem");
const User = require("../../../model/login/auth");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
//get All Role =>/api/roles
exports.getAllRaise = catchAsyncErrors(async (req, res, next) => {
  let raises;
  try {
    raises = await Raiseissue.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!raises) {
    return next(new ErrorHandler("Raiseissue not found!", 404));
  }
  return res.status(200).json({
    raises,
  });
});
exports.getAllauthRaises = catchAsyncErrors(async (req, res, next) => {
  let result = [];
  let allroles;

  try {
    allroles = await Raiseissue.find();

    if (!allroles || allroles.length === 0) {
      return next(new ErrorHandler("Raiseissue not found!", 404));
    }

    if (!Array.isArray(req.body.userrole)) {
      return next(new ErrorHandler("Raiseissue Not Add This User!", 400));
    }

    allroles.forEach((data) => {
      if (req.body.userrole.some((role) => role === data.name)) {
        data.rolenew.forEach((item) => {
          result.push(item);
        });
      }
    });

    return res.status(200).json({
      result,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

//get All Role =>/api/roles
exports.getAllRaiseName = catchAsyncErrors(async (req, res, next) => {
  let roles;
  try {
    roles = await Raiseissue.find({}, { name: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!roles) {
    return next(new ErrorHandler("Raiseissue not found!", 404));
  }
  return res.status(200).json({
    roles,
  });
});

exports.getOverAllauthRaise = catchAsyncErrors(async (req, res, next) => {
  let users;
  try {
    users = await User.find({ role: req.body.oldname });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!users) {
    return next(new ErrorHandler("Role not found!", 404));
  }
  return res.status(200).json({
    users,
    count: users.length,
  });
});


//get All Role =>/api/roles
exports.getAllauthRaise = catchAsyncErrors(async (req, res, next) => {
  let result;
  try {
    result = await Raiseissue.find({ name: req.body.userrole });
    if (!result) {
      return next(new ErrorHandler("Raiseissue not found!", 404));
    }
    return res.status(200).json({
      result,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

//create new role => /api/role/new
exports.addRaise = catchAsyncErrors(async (req, res, next) => {
  // let checkloc = await Raiseissue.findOne({ name: req.body.name });
  // if (checkloc) {
  //     return next(new ErrorHandler("Raiseissue name already exist!", 400));
  // }

  let aRole = await Raiseissue.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});
// get Single role => /api/role/:id
exports.getSingleRaise = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sraises = await Raiseissue.findById(id);
  if (!sraises) {
    return next(new ErrorHandler("Raiseissue not found", 404));
  }
  return res.status(200).json({
    sraises,
  });
});
//update role by id => /api/role/:id
exports.updateRaise = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let urole = await Raiseissue.findByIdAndUpdate(id, req.body);
  if (!urole) {
    return next(new ErrorHandler("Raiseissue not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});
//delete role by id => /api/role/:id
exports.deleteRaise = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let drole = await Raiseissue.findByIdAndRemove(id);
  if (!drole) {
    return next(new ErrorHandler("Raiseissue not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});




exports.skippedRaiseProblem = async (req, res) => {
  try {
    let totalProjects, totalProjectsOversll, result;
    const { page, pageSize, status, role, username,
      modulename, submodulename, category, subcategory, mode, allFilters, logicOperator, searchQuery,
    } = req.body;

    let query = {};

    // Check if the user is not a Manager, then add the createdby condition
    if (!role?.includes("Manager")) {
      query.createdby = username;
    }

    // Add the status condition based on the status value
    if (status === "Open") {
      query.status = "Open";
    } else if (status === "Closed") {
      query.status = "Closed";
    } else if (status === "On Progress") {
      query.status = "On Progress";
    }

    if (Array.isArray(mode) && mode.length > 0) {
      query.mode = { $in: mode };
    }

    if (Array.isArray(modulename) && modulename.length > 0) {
      query.modulename = { $in: modulename };
    }

    if (Array.isArray(submodulename) && submodulename.length > 0) {
      query.submodulename = { $in: submodulename };
    }

    if (Array.isArray(category) && category.length > 0) {
      query.category = { $in: category };
    }

    if (Array.isArray(subcategory) && subcategory.length > 0) {
      query.subcategory = { $in: subcategory };
    }

    let conditions = [];

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
          { autoid: regex },
          { status: regex },
          { mode: regex },
          { priority: regex },
          { module: regex },
          { submodule: regex },
          { mainpage: regex },
          { subsubpage: regex },
          { category: regex },
          { subcategory: regex },
          { createddate: regex },
          { createdtime: regex },
          { createdby: regex },
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

    const isEmpty = Object.keys(query).length === 0;

    totalProjects = isEmpty ? 0 : await Raiseissue.countDocuments(query);
    totalProjectsOversll = isEmpty ? 0 : await Raiseissue.find(query);

    // Ensure the page is always at least 1
    const currentPage = Math.max(1, parseInt(page));
    const skipValue = (currentPage - 1) * parseInt(pageSize);

    // Execute the filter query on the User model
    const allusers = await Raiseissue.find(query)
      .skip(skipValue)
      .limit(parseInt(pageSize));

    result = isEmpty ? [] : allusers;

    return res.status(200).json({
      allusers,
      totalProjects,
      result,
      totalProjectsOversll,
      currentPage,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.skippedStatusRaiseProblem = async (req, res) => {
  try {
    let totalProjects, totalProjectsOverall, result;
    const { page, pageSize, status, role, username, allFilters, logicOperator, searchQuery } = req.body;

    let query = {};

    // Check if the user is not a Manager, then add the createdby condition
    if (!role?.includes("Manager")) {
      query.createdby = username;
    }

    // Add the status condition based on the status value
    if (status === "Open") {
      query.status = "Open";
    } else if (status === "Closed") {
      query.status = "Closed";
    } else if (status === "On Progress") {
      query.status = "On Progress";
    }

    let conditions = [];

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
          { autoid: regex },
          { status: regex },
          { mode: regex },
          { priority: regex },
          { module: regex },
          { submodule: regex },
          { mainpage: regex },
          { subsubpage: regex },
          { category: regex },
          { subcategory: regex },
          { createddate: regex },
          { createdtime: regex },
          { createdby: regex },
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



    totalProjects = await Raiseissue.countDocuments(query);
    totalProjectsOverall = await Raiseissue.find(query);


    // Execute the filter query on the User model
    allusers = await Raiseissue.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    result = allusers;
    return res.status(200).json({
      allusers,
      totalProjects,
      result,
      totalProjectsOverall,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};



// Helper function to create filter condition
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