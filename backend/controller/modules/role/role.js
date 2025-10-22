const Role = require("../../../model/modules/role/role");
const User = require("../../../model/login/auth");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const AssignBranch = require("../../../model/modules/assignbranch");
const Reportingheader = require("../../../model/modules/role/reportingheader");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

//get All Role =>/api/roles
exports.getAllRole = catchAsyncErrors(async (req, res, next) => {
  let roles;
  try {
    roles = await Role.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!roles) {
    return next(new ErrorHandler("Role not found!", 404));
  }
  return res.status(200).json({
    roles,
  });
});








exports.getAccessibleBranchUserRoles = catchAsyncErrors(async (req, res, next) => {
  const { rolenames, companyname, empcode } = req?.body;
  let deletionResult;
  try {
    deletionResult = await AssignBranch.deleteMany({
      moduleselection: "Role Based",
      employee: companyname,
      employeecode: empcode,
      modulevalue: { $nin: rolenames }
    });
  } catch (err) {
    console.log(err, 'err');
    return next(new ErrorHandler("Failed to delete matching records.", 500));
  }

  return res.status(200).json({
    success: true,
    deletedCount: deletionResult.deletedCount,
  });
});


exports.getAllauthRoles = catchAsyncErrors(async (req, res, next) => {
  let result = [];
  let allroles;

  try {
    allroles = await Role.find();

    if (!allroles || allroles.length === 0) {
      return next(new ErrorHandler("Role not found!", 404));
    }

    if (!Array.isArray(req.body.userrole)) {
      return next(new ErrorHandler("Role Not Add This User!", 400));
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
exports.getAllRoleName = catchAsyncErrors(async (req, res, next) => {
  let roles;
  try {
    roles = await Role.find({}, { name: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!roles) {
    return next(new ErrorHandler("Role not found!", 404));
  }
  return res.status(200).json({
    roles,
  });
});

exports.getOverAllauthRole = catchAsyncErrors(async (req, res, next) => {
  let users;
  try {
    users = await User.find({
      enquirystatus: {
        $nin: ["Enquiry Purpose"]
      }, role: req.body.oldname
    }, { company: 1, branch: 1, unit: 1, role: 1 });
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
exports.getAllauthRole = catchAsyncErrors(async (req, res, next) => {
  let result;
  try {
    result = await Role.find({ name: req.body.userrole });
    if (!result) {
      return next(new ErrorHandler("Role not found!", 404));
    }
    return res.status(200).json({
      result,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

// //create new role => /api/role/new
// exports.addRole = catchAsyncErrors(async (req, res, next) => {
//   let checkloc = await Role.findOne({ name: req.body.name });
//   if (checkloc) {
//     return next(new ErrorHandler("Role name already exist!", 400));
//   }

//   let aRole = await Role.create(req.body);
//   return res.status(200).json({
//     message: "Successfully added!",
//   });
// });

exports.addRole = catchAsyncErrors(async (req, res, next) => {
  const name = req.body.name;


  let checkloc = await Role.findOne({
    name: { $regex: `^${name}$`, $options: "i" }
  });

  if (checkloc) {
    return next(new ErrorHandler("Role name already exists!", 400));
  }

  let aRole = await Role.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});


// get Single role => /api/role/:id
exports.getSingleRole = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let srole = await Role.findById(id);
  if (!srole) {
    return next(new ErrorHandler("Role not found", 404));
  }
  return res.status(200).json({
    srole,
  });
});
// //update role by id => /api/role/:id
// exports.updateRole = catchAsyncErrors(async (req, res, next) => {
//   const id = req.params.id;
//   let urole = await Role.findByIdAndUpdate(id, req.body);
//   if (!urole) {
//     return next(new ErrorHandler("Role not found", 404));
//   }

//   return res.status(200).json({ message: "Updated successfully" });
// });
exports.updateRole = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  if (req.body.name) {
    const existingHeader = await Role.findOne({
      _id: { $ne: id },
      name: { $regex: `^${req.body.name}$`, $options: "i" }
    });

    if (existingHeader) {
      return next(new ErrorHandler("Role name already exists!", 400));
    }
  }

  let urole = await Role.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  // Check if the Role exists
  if (!urole) {
    return next(new ErrorHandler("Role not found", 404));
  }

  // Return success message with the updated data (optional)
  return res.status(200).json({ status: true, message: "Updated successfully", urole });
});

//delete role by id => /api/role/:id
exports.deleteRole = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let drole = await Role.findByIdAndRemove(id);
  if (!drole) {
    return next(new ErrorHandler("Role not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

// checking where the role name is linked
exports.getOverallEditUsersCheck = catchAsyncErrors(async (req, res, next) => {
  let role, count;
  try {
    role = await User.find(
      {
        enquirystatus: {
          $nin: ["Enquiry Purpose"],
        },
        resonablestatus: {
          $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
        },
        role: { $elemMatch: { $eq: req?.body?.rolename } },
      },
      { _id: 1, role: 1, companyname: 1 }
    )?.lean();

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    role,
    count: role?.length
  });
});

// checking bulk where the role name is linked
exports.getOverallBulkEditUsersCheck = catchAsyncErrors(async (req, res, next) => {
  let role, count, result, priority;
  let id = req.body.id;
  try {
    role = await User.find(
      {
        enquirystatus: {
          $nin: ["Enquiry Purpose"],
        },
        resonablestatus: {
          $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
        },
      },
      { _id: 1, role: 1, companyname: 1 }
    )?.lean();


    priority = await Role.find({}, { _id: 1, name: 1 }).lean()
    const answer = priority?.filter(data => id?.includes(data._id?.toString()))
    const selfcheck = answer?.filter(answer =>
      role?.some(data => data.role?.includes(answer?.name)))?.map(data => data._id?.toString());

    const duplicateId = [...selfcheck]

    result = id?.filter(data => !duplicateId?.includes(data))
    count = id?.filter(data => !duplicateId?.includes(data))?.length
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: count,
    result
  });
});





exports.getRoleBasedAutoFetchUrls = catchAsyncErrors(async (req, res, next) => {
  let roles, matchedModules;
  let { rolename, menuitems, modulename } = req?.body

  try {
    if (modulename === "Role Based") {
      roles = await Role.findOne({ name: rolename });
    } else if ('Reporting To Header Based') {
      roles = await Reportingheader.findOne({ name: rolename });

    }
    matchedModules = extractAllowedModules(roles, menuitems);

    // console.log(matchedModules);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    roles, matchedModules
  });
});


function extractAllowedModules(role, menuItems) {
  const result = {
    modulenames: [],
    moduledbnames: [],
    modulenamesurl: [],

    submodulenames: [],
    submoduledbnames: [],
    submodulenamesurl: [],

    mainpagenames: [],
    mainpagedbnames: [],
    mainpagenamesurl: [],

    subpagenames: [],
    subpagedbnames: [],
    subpagenamesurl: [],

    subsubpagenames: [],
    subsubpagedbnames: [],
    subsubpagenamesurl: [],
  };

  const roleSections = [
    { type: "modulename", values: role.modulename || [] },
    { type: "submodulename", values: role.submodulename || [] },
    { type: "mainpagename", values: role.mainpagename || [] },
    { type: "subpagename", values: role.subpagename || [] },
    { type: "subsubpagename", values: role.subsubpagename || [] },
  ];

  const keyMap = {
    modulename: {
      name: "modulenames",
      dbname: "moduledbnames",
      url: "modulenamesurl",
    },
    submodulename: {
      name: "submodulenames",
      dbname: "submoduledbnames",
      url: "submodulenamesurl",
    },
    mainpagename: {
      name: "mainpagenames",
      dbname: "mainpagedbnames",
      url: "mainpagenamesurl",
    },
    subpagename: {
      name: "subpagenames",
      dbname: "subpagedbnames",
      url: "subpagenamesurl",
    },
    subsubpagename: {
      name: "subsubpagenames",
      dbname: "subsubpagedbnames",
      url: "subsubpagenamesurl",
    },
  };

  function traverse(items) {
    for (const item of items) {
      for (const section of roleSections) {
        if (section.values.includes(item.title)) {
          const keys = keyMap[section.type];
          result[keys.name].push(item.title);
          result[keys.dbname].push(item.dbname || "");

          // Only push the URL if it's non-empty
          if (item.url) {
            result[keys.url].push(item.url);
          }
        }
      }

      if (item.submenu && Array.isArray(item.submenu)) {
        traverse(item.submenu);
      }
    }
  }

  traverse(menuItems);
  return result;
}



exports.getAssignBranchDuplicateFilter = catchAsyncErrors(async (req, res, next) => {
  let roles, matchedModules, matchedModulesalert;

  try {
    const object = req?.body;



    const allowedSelectionsMapAlert = {
      "Role Based": ["Role Based"],
      "Reporting To Header Based": ["Reporting To Header Based", "Role Based"],
      "Module Based": ["Module Based", "Reporting To Header Based", "Role Based"]
    };
    const allowedSelections = allowedSelectionsMapAlert[object.moduleselection] || [];
    const baseMatch = {
      company: object.company,
      branch: object.branch,
      unit: object.unit,
      fromcompany: object.fromcompany,
      frombranch: object.frombranch,
      fromunit: object.fromunit,
      employee: { $in: object.employeename },
      moduleselection: { $in: allowedSelections }
    };
    console.log(baseMatch, 'baseMatch')
    // Conditionally add array filters only if arrays are not empty
    if (object.modulename?.length > 0) {
      baseMatch.modulename = { $elemMatch: { $in: object.modulename } };
    }
    if (object.submodulename?.length > 0) {
      baseMatch.submodulename = { $elemMatch: { $in: object.submodulename } };
    }
    if (object.mainpagename?.length > 0) {
      baseMatch.mainpagename = { $elemMatch: { $in: object.mainpagename } };
    }
    if (object.subpagename?.length > 0) {
      baseMatch.subpagename = { $elemMatch: { $in: object.subpagename } };
    }
    if (object.subsubpagename?.length > 0) {
      baseMatch.subsubpagename = { $elemMatch: { $in: object.subsubpagename } };
    }

    // ➕ Add exclusion only if not editing
    if (object.page === "edit" && object.editid) {
      baseMatch._id = { $ne: new ObjectId(object.editid) };
    }
    // Alert
    roles = await AssignBranch.aggregate([
      { $match: baseMatch },
      {
        $project: {
          _id: 1,
          fromcompany: 1,
          frombranch: 1,
          fromunit: 1,
          employee: 1,
          moduleselection: 1,
          // Unmatched
          modulename: { $setDifference: ["$modulename", object.modulename] },
          submodulename: { $setDifference: ["$submodulename", object.submodulename] },
          mainpagename: { $setDifference: ["$mainpagename", object.mainpagename] },
          subpagename: { $setDifference: ["$subpagename", object.subpagename] },
          subsubpagename: { $setDifference: ["$subsubpagename", object.subsubpagename] },

          // Matched
          matchedmodulename: { $setIntersection: ["$modulename", object.modulename] },
          matchedsubmodulename: { $setIntersection: ["$submodulename", object.submodulename] },
          matchedmainpagename: { $setIntersection: ["$mainpagename", object.mainpagename] },
          matchedsubpagename: { $setIntersection: ["$subpagename", object.subpagename] },
          matchedsubsubpagename: { $setIntersection: ["$subsubpagename", object.subsubpagename] },
        }
      },
      {
        $addFields: {
          overallpagename: {
            $concatArrays: [
              "$modulename",
              "$submodulename",
              "$mainpagename",
              "$subpagename",
              "$subsubpagename"
            ]
          },
          matchedcombinednames: {
            $concatArrays: [
              "$matchedmodulename",
              "$matchedsubmodulename",
              "$matchedmainpagename",
              "$matchedsubpagename",
              "$matchedsubsubpagename"
            ]
          },
          matchedids: "$_id"
        }
      },
      {
        $match: {
          $or: [
            { "modulename.0": { $exists: true } },
            { "matchedmodulename.0": { $exists: true } },
            { "submodulename.0": { $exists: true } },
            { "matchedsubmodulename.0": { $exists: true } },
            { "mainpagename.0": { $exists: true } },
            { "matchedmainpagename.0": { $exists: true } },
            { "subpagename.0": { $exists: true } },
            { "matchedsubpagename.0": { $exists: true } },
            { "subsubpagename.0": { $exists: true } },
            { "matchedsubsubpagename.0": { $exists: true } }
          ]
        }
      }
    ]);
    console.log(roles?.length)

    if (roles) {
      matchedModulesalert = findMatchedPathsAlert(object?.menuitems, roles);
    }
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    roles, matchedModules, matchedModulesalert
  });
})


exports.getAssignBranchDuplicateFilterAndUpdate = catchAsyncErrors(async (req, res, next) => {
  let roles, matchedModules, matchedModulesalert;

  try {
    const object = req?.body;
    const allowedSelectionsMap = {
      "Role Based": ["Module Based", "Reporting To Header Based"],
      "Reporting To Header Based": ["Module Based"]
    };
    const allowedSelections = allowedSelectionsMap[object.moduleselection] || [];
    const baseMatch = {
      company: object.company,
      branch: object.branch,
      unit: object.unit,
      fromcompany: object.fromcompany,
      frombranch: object.frombranch,
      fromunit: object.fromunit,
      employee: { $in: object.employeename },
      moduleselection: { $in: allowedSelections }
    };

    // Conditionally add array filters only if arrays are not empty
    if (object.modulename?.length > 0) {
      baseMatch.modulename = { $elemMatch: { $in: object.modulename } };
    }
    if (object.submodulename?.length > 0) {
      baseMatch.submodulename = { $elemMatch: { $in: object.submodulename } };
    }
    if (object.mainpagename?.length > 0) {
      baseMatch.mainpagename = { $elemMatch: { $in: object.mainpagename } };
    }
    if (object.subpagename?.length > 0) {
      baseMatch.subpagename = { $elemMatch: { $in: object.subpagename } };
    }
    if (object.subsubpagename?.length > 0) {
      baseMatch.subsubpagename = { $elemMatch: { $in: object.subsubpagename } };
    }
    // ➕ Add exclusion only if not editing
    if (object.page === "edit" && object.editid) {
      baseMatch._id = { $ne: new ObjectId(object.editid) };
    }

    // Alert
    roles = await AssignBranch.aggregate([
      {
        $match: {
          company: object.company,
          branch: object.branch,
          unit: object.unit,
          fromcompany: object.fromcompany,
          frombranch: object.frombranch,
          fromunit: object.fromunit,
          employee: { $in: object.employeename },
          moduleselection: { $in: allowedSelections },
          ...(object.modulename && {
            $expr: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ["$modulename", []] } }, 0] },
                then: {
                  $gt: [{ $size: { $setIntersection: ["$modulename", object.modulename] } }, 0]
                },
                else: true
              }
            }
          }),
          ...(object.submodulename && {
            $expr: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ["$submodulename", []] } }, 0] },
                then: {
                  $gt: [{ $size: { $setIntersection: ["$submodulename", object.submodulename] } }, 0]
                },
                else: true
              }
            }
          }),
          ...(object.mainpagename && {
            $expr: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ["$mainpagename", []] } }, 0] },
                then: {
                  $gt: [{ $size: { $setIntersection: ["$mainpagename", object.mainpagename] } }, 0]
                },
                else: true
              }
            }
          }),
          ...(object.subpagename && {
            $expr: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ["$subpagename", []] } }, 0] },
                then: {
                  $gt: [{ $size: { $setIntersection: ["$subpagename", object.subpagename] } }, 0]
                },
                else: true
              }
            }
          }),
          ...(object.subsubpagename && {
            $expr: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ["$subsubpagename", []] } }, 0] },
                then: {
                  $gt: [{ $size: { $setIntersection: ["$subsubpagename", object.subsubpagename] } }, 0]
                },
                else: true
              }
            }
          })
        }
      },

      {
        $project: {
          _id: 1,
          fromcompany: 1,
          frombranch: 1,
          fromunit: 1,
          employee: 1,
          moduleselection: 1,

          // Unmatched pages
          modulename: { $setDifference: ["$modulename", object.modulename] },
          submodulename: { $setDifference: ["$submodulename", object.submodulename] },
          mainpagename: { $setDifference: ["$mainpagename", object.mainpagename] },
          subpagename: { $setDifference: ["$subpagename", object.subpagename] },
          subsubpagename: { $setDifference: ["$subsubpagename", object.subsubpagename] },

          // Matched pages
          matchedmodulename: { $setIntersection: ["$modulename", object.modulename] },
          matchedsubmodulename: { $setIntersection: ["$submodulename", object.submodulename] },
          matchedmainpagename: { $setIntersection: ["$mainpagename", object.mainpagename] },
          matchedsubpagename: { $setIntersection: ["$subpagename", object.subpagename] },
          matchedsubsubpagename: { $setIntersection: ["$subsubpagename", object.subsubpagename] }
        }
      },

      {
        $addFields: {
          overallpagename: {
            $concatArrays: [
              "$modulename",
              "$submodulename",
              "$mainpagename",
              "$subpagename",
              "$subsubpagename"
            ]
          },
          matchedcombinednames: {
            $concatArrays: [
              "$matchedmodulename",
              "$matchedsubmodulename",
              "$matchedmainpagename",
              "$matchedsubpagename",
              "$matchedsubsubpagename"
            ]
          },
          matchedids: "$_id"
        }
      },
      {
        $match: {
          $or: [
            { "modulename.0": { $exists: true } },
            { "matchedmodulename.0": { $exists: true } },
            { "submodulename.0": { $exists: true } },
            { "matchedsubmodulename.0": { $exists: true } },
            { "mainpagename.0": { $exists: true } },
            { "matchedmainpagename.0": { $exists: true } },
            { "subpagename.0": { $exists: true } },
            { "matchedsubpagename.0": { $exists: true } },
            { "subsubpagename.0": { $exists: true } },
            { "matchedsubsubpagename.0": { $exists: true } }
          ]
        }
      }
    ]);


    console.log(roles?.length)
    if (roles) {
      matchedModules = findMatchedPaths(object?.menuitems, roles);
      const levels = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'];
      if (matchedModules?.length > 0) {
        for (const item of matchedModules) {
          const { id } = item;
          const doc = await AssignBranch.findById(id);
          if (!doc) continue;

          const updatedFields = {};
          const removedUrlsSet = new Set();
          let targetLevelForNameRemoval = null;
          for (let i = levels.length - 1; i >= 0; i--) {
            const key = levels[i];
            if (item[key]) {
              targetLevelForNameRemoval = key;
              break;
            }
          }
          for (const level of levels) {
            const urlKeys = [`${level}url`, `${level}urlforedit`];
            for (const urlKey of urlKeys) {
              const urlVal = item[urlKey];
              if (urlVal) removedUrlsSet.add(urlVal);
            }
          }
          for (const level of levels) {
            const nameKey = level;
            const urlKey = `${level}url`;
            const urlEditKey = `${level}urlforedit`;

            const existingNames = doc[nameKey] || [];
            const existingUrls = doc[urlKey] || [];
            const existingEditUrls = doc[urlEditKey] || [];
            let newNames = existingNames;
            if (level === targetLevelForNameRemoval) {
              const valueToRemove = item[nameKey];
              newNames = existingNames.filter(name => name !== valueToRemove);
            }
            const newUrls = existingUrls.filter(url => !removedUrlsSet.has(url));
            const newEditUrls = existingEditUrls.filter(url => !removedUrlsSet.has(url));

            updatedFields[nameKey] = newNames;
            updatedFields[urlKey] = newUrls;
            updatedFields[urlEditKey] = newEditUrls;
          }

          //  console.log(updatedFields, '✅ updatedFields for:', id);
          await AssignBranch.updateOne({ _id: id }, { $set: updatedFields });
        }
      }
    }

  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    status: true, roles, matchedModules, matchedModulesalert
  });
})

function findMatchedPaths(menuItems, matchArray) {
  const levels = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'];
  const results = [];

  const titleToPathMap = new Map();

  function recursiveSearch(items, pathTitles = [], callback) {
    for (const item of items) {
      const newPath = [...pathTitles, item.title];

      if (!item.submenu || item.submenu.length === 0) {
        callback(item, newPath, item.url || null);
      }

      if (item.submenu && item.submenu.length) {
        recursiveSearch(item.submenu, newPath, callback);
      }
    }
  }

  // Store both path and url for leaf nodes
  recursiveSearch(menuItems, [], (item, path, url) => {
    titleToPathMap.set(item.title, { path, url });
  });

  for (const matchObj of matchArray) {
    const { _id, matchedcombinednames } = matchObj;

    for (const pageName of matchedcombinednames) {
      const matched = titleToPathMap.get(pageName);
      if (matched) {
        const { path, url } = matched;
        const result = { id: _id };

        let finalLevel = null;

        levels.forEach((lvl, idx) => {
          const value = path[idx] || null;
          result[lvl] = value;
          if (value !== null) finalLevel = lvl; // keep track of the deepest filled level
        });

        if (finalLevel && url) {
          result[`${finalLevel}url`] = url; // e.g. mainpagenameurl: "/page"
        }

        results.push(result);
      }
    }
  }

  return results;
}




function findMatchedPathsAlert(menuItems, matchArray) {
  const levels = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'];
  const results = [];

  // Recursive search to find all leaf nodes (items without submenu)
  function recursiveSearch(items, pathTitles = [], levelIndex = 0, callback) {
    for (const item of items) {
      const newPath = [...pathTitles, item.title];

      if (!item.submenu || item.submenu.length === 0) {
        callback(item, newPath, levelIndex);
      }

      if (item.submenu && item.submenu.length) {
        recursiveSearch(item.submenu, newPath, levelIndex + 1, callback);
      }
    }
  }

  // Map: title -> { path, url, levelIndex }
  const titleToInfoMap = new Map();

  recursiveSearch(menuItems, [], 0, (item, path, levelIndex) => {
    titleToInfoMap.set(item.title, {
      path,
      url: item.url || null,
      levelIndex,
    });
  });

  // Build final matched result
  for (const matchObj of matchArray) {
    const { _id, matchedcombinednames, fromcompany, employee, frombranch, fromunit } = matchObj;

    for (const pageName of matchedcombinednames) {
      const match = titleToInfoMap.get(pageName);
      if (match) {
        const { path, url, levelIndex } = match;
        const result = {
          id: _id,
          fromcompany,
          frombranch,
          fromunit,
          employee,
          url: null, // Will assign to correct level
        };

        levels.forEach((lvl, idx) => {
          result[lvl] = path[idx] || null;
        });

        // Set the url only for the correct matched level
        if (levelIndex >= 0 && levelIndex < levels.length) {
          result.url = url;
        }

        results.push(result);
      }
    }
  }

  return results;
}

function groupMatchedPathsById(flatResults) {
  const levels = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'];
  const groupedMap = new Map();

  for (const entry of flatResults) {
    const { id } = entry;

    if (!groupedMap.has(id)) {
      // Initialize structure with arrays for names and urls
      const initialData = { id };
      for (const level of levels) {
        initialData[level] = [];
        initialData[`${level}url`] = [];
      }
      groupedMap.set(id, initialData);
    }

    const group = groupedMap.get(id);

    for (const level of levels) {
      const value = entry[level];
      const urlKey = `${level}url`;
      const urlValue = entry[urlKey];

      if (value && !group[level].includes(value)) {
        group[level].push(value);
      }

      if (urlValue && !group[urlKey].includes(urlValue)) {
        group[urlKey].push(urlValue);
      }
    }
  }

  return Array.from(groupedMap.values());
}




exports.getUpdateRoleBasesOnEditRole = catchAsyncErrors(async (req, res, next) => {
  let roles, assignBranch, resultVariable;
  const { rolename, menuitems } = req?.body
  try {
    const levels = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'];

    // Step 1: Find AssignBranch with the role
    const assignDocs = await AssignBranch.find({
      moduleselection: "Role Based",
      modulevalue: rolename
    });

    console.log(assignDocs?.length, "Hitted")
    if (!assignDocs) {
      console.log("❌ AssignBranch not found for", rolename);
      return;
    }
    const roleDoc = await Role.findOne({ name: rolename });
    if (!roleDoc) {
      console.log("❌ Role not found for", rolename);
      return;
    }

    for (const assignDoc of assignDocs) {
      const updatedFields = {};

      for (const level of levels) {
        const roleValues = roleDoc[level] || [];
        const assignValues = assignDoc[level] || [];

        // Keep only values that are in role
        const cleaned = assignValues.filter(val => roleValues.includes(val));

        // Add new values from role that are missing
        const missing = roleValues.filter(val => !assignValues.includes(val));

        const final = [...new Set([...cleaned, ...missing])];

        updatedFields[level] = final;
      }

      const urlsMapped = mapNamesToUrls(menuitems, updatedFields);
      const assignBranch = mergeUrlsAcrossAllFields(urlsMapped);

      await AssignBranch.updateOne(
        { _id: assignDoc._id },
        { $set: assignBranch }
      );
    }



    function mergeUrlsAcrossAllFields(resultDoc) {
      // Combine all URLs from the individual arrays
      const allUrlsSet = new Set([
        ...(resultDoc.modulenameurl || []),
        ...(resultDoc.submodulenameurl || []),
        ...(resultDoc.mainpagenameurl || []),
        ...(resultDoc.subpagenameurl || []),
        ...(resultDoc.subsubpagenameurl || [])
      ]);

      // Convert set back to array
      const allUrlsArray = Array.from(allUrlsSet);

      // Assign to each URL field
      return {
        ...resultDoc,
        modulenameurl: allUrlsArray,
        submodulenameurl: allUrlsArray,
        mainpagenameurl: allUrlsArray,
        subpagenameurl: allUrlsArray,
        subsubpagenameurl: allUrlsArray
      };
    }

    function findUrlByDbName(menuList, targetDbName) {
      for (const item of menuList) {
        if (item.title === targetDbName && item.url) {
          return item.url;
        }
        if (item.submenu && Array.isArray(item.submenu)) {
          const found = findUrlByDbName(item.submenu, targetDbName);
          if (found) return found;
        }
      }
      return null;
    }

    // 2. Function to generate url arrays
    function mapNamesToUrls(menuItemsList, resultDoc) {
      const modulenameurl = (resultDoc.modulename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const submodulenameurl = (resultDoc.submodulename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const mainpagenameurl = (resultDoc.mainpagename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const subpagenameurl = (resultDoc.subpagename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const subsubpagenameurl = (resultDoc.subsubpagename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);

      return {
        ...resultDoc,
        modulenameurl,
        submodulenameurl,
        mainpagenameurl,
        subpagenameurl,
        subsubpagenameurl,
        modulenameurlforedit: modulenameurl,
        submodulenameurlforedit: submodulenameurl,
        mainpagenameurlforedit: mainpagenameurl,
        subpagenameurlforedit: subpagenameurl,
        subsubpagenameurlforedit: subsubpagenameurl,
      };
    }

    // Example usage:


    console.log(assignBranch, 'AssignBranch')

  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    roles, assignBranch, resultVariable, menuitems
  });
});

exports.getUpdateRoleBasesOnEditReportingToHeader = catchAsyncErrors(async (req, res, next) => {
  let roles, assignBranch, resultVariable;
  const { rolename, menuitems } = req?.body
  try {
    const levels = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'];

    // Step 1: Find AssignBranch with the role
    const assignDocs = await AssignBranch.find({
      moduleselection: "Reporting To Header Based",
      modulevalue: rolename
    });
    if (!assignDocs) {
      console.log("❌ AssignBranch not found for", rolename);
      return;
    }
    const roleDoc = await Reportingheader.findOne({ name: rolename });
    if (!roleDoc) {
      console.log("❌ Reporting Header not found for", rolename);
      return;
    }

    for (const assignDoc of assignDocs) {
      const updatedFields = {};

      for (const level of levels) {
        const roleValues = roleDoc[level] || [];
        const assignValues = assignDoc[level] || [];

        // Keep only values that are in role
        const cleaned = assignValues.filter(val => roleValues.includes(val));

        // Add new values from role that are missing
        const missing = roleValues.filter(val => !assignValues.includes(val));

        const final = [...new Set([...cleaned, ...missing])];

        updatedFields[level] = final;
      }

      const urlsMapped = mapNamesToUrls(menuitems, updatedFields);
      const assignBranch = mergeUrlsAcrossAllFields(urlsMapped);

      await AssignBranch.updateOne(
        { _id: assignDoc._id },
        { $set: assignBranch }
      );
    }


    function mergeUrlsAcrossAllFields(resultDoc) {
      // Combine all URLs from the individual arrays
      const allUrlsSet = new Set([
        ...(resultDoc.modulenameurl || []),
        ...(resultDoc.submodulenameurl || []),
        ...(resultDoc.mainpagenameurl || []),
        ...(resultDoc.subpagenameurl || []),
        ...(resultDoc.subsubpagenameurl || [])
      ]);

      // Convert set back to array
      const allUrlsArray = Array.from(allUrlsSet);

      // Assign to each URL field
      return {
        ...resultDoc,
        modulenameurl: allUrlsArray,
        submodulenameurl: allUrlsArray,
        mainpagenameurl: allUrlsArray,
        subpagenameurl: allUrlsArray,
        subsubpagenameurl: allUrlsArray
      };
    }

    function findUrlByDbName(menuList, targetDbName) {
      for (const item of menuList) {
        if (item.title === targetDbName && item.url) {
          return item.url;
        }
        if (item.submenu && Array.isArray(item.submenu)) {
          const found = findUrlByDbName(item.submenu, targetDbName);
          if (found) return found;
        }
      }
      return null;
    }

    // 2. Function to generate url arrays
    function mapNamesToUrls(menuItemsList, resultDoc) {
      const modulenameurl = (resultDoc.modulename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const submodulenameurl = (resultDoc.submodulename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const mainpagenameurl = (resultDoc.mainpagename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const subpagenameurl = (resultDoc.subpagename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);
      const subsubpagenameurl = (resultDoc.subsubpagename || []).map(name => findUrlByDbName(menuItemsList, name)).filter(Boolean);

      return {
        ...resultDoc,
        modulenameurl,
        submodulenameurl,
        mainpagenameurl,
        subpagenameurl,
        subsubpagenameurl,
        modulenameurlforedit: modulenameurl,
        submodulenameurlforedit: submodulenameurl,
        mainpagenameurlforedit: mainpagenameurl,
        subpagenameurlforedit: subpagenameurl,
        subsubpagenameurlforedit: subsubpagenameurl,
      };
    }

    // Example usage:


    console.log(assignBranch, 'AssignBranch')

  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    roles, assignBranch, resultVariable, menuitems
  });
});


