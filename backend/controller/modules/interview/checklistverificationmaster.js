const Checklistverificationmaster = require('../../../model/modules/interview/checklistverificationmaster');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Checklisttype = require('../../../model/modules/interview/checklisttype');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

//get All Checklistverificationmaster =>/api/Checklistverificationmaster
exports.getAllChecklistverificationmaster = catchAsyncErrors(async (req, res, next) => {
  let checklistverificationmasters;
  try {
    checklistverificationmasters = await Checklistverificationmaster.find()
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!checklistverificationmasters) {
    return next(new ErrorHandler('Checklistverificationmaster not found!', 404));
  }
  return res.status(200).json({
    checklistverificationmasters
  });
})

exports.getAllChecklistverificationmasterByPagination = catchAsyncErrors(
  async (req, res, next) => {
    console.time("start");
    const { page, pageSize, allFilters, logicOperator, searchQuery } = req.body;

    let query = {};
    let conditions = [];

    // Advanced search filter
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

    if (searchQuery) {
      const searchTermsArray = searchQuery.split(" ");
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

      const orConditions = regexTerms.map((regex) => ({
        $or: [
          { checklisttype: regex },
          { categoryname: regex },
          { subcategoryname: regex },
          { company: regex },

          { branch: regex },
          { unit: regex },
          { team: regex },
          { employee: regex },
        ],
      }));

      query = {
        $and: [...orConditions],
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

    try {
      const totalProjects = await Checklistverificationmaster.countDocuments(
        query
      );
      const result = await Checklistverificationmaster.find(query)
        .select("")
        .lean()
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
        .exec();
      console.timeEnd("start");
      res.status(200).json({
        totalProjects,
        result,
        currentPage: page,
        totalPages: Math.ceil(totalProjects / pageSize),

      });
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
  }
);


//create new Checklistverificationmaster => /api/Checklistverificationmaster/new
exports.addChecklistverificationmaster = catchAsyncErrors(async (req, res, next) => {
  // let checkmain = await Addexists.findOne({ name: req.body.name });
  // if (checkmain) {
  //     return next(new ErrorHandler('Name already exist!', 400));
  // }
  let aChecklistverificationmaster = await Checklistverificationmaster.create(req.body);
  return res.status(200).json({
    message: 'Successfully added!'
  });
})

// get Single Checklistverificationmaster => /api/Checklistverificationmaster/:id
exports.getSingleChecklistverificationmaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let schecklistverificationmaster = await Checklistverificationmaster.findById(id);
  if (!schecklistverificationmaster) {
    return next(new ErrorHandler('Checklistverificationmaster not found', 404));
  }
  return res.status(200).json({
    schecklistverificationmaster
  })
})

//update Checklistverificationmaster by id => /api/Checklistverificationmaster/:id
exports.updateChecklistverificationmaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uchecklistverificationmaster = await Checklistverificationmaster.findByIdAndUpdate(id, req.body);
  if (!uchecklistverificationmaster) {
    return next(new ErrorHandler('Checklistverificationmaster not found', 404));
  }

  return res.status(200).json({ message: 'Updated successfully' });
})

//delete Checklistverificationmaster by id => /api/Checklistverificationmaster/:id
exports.deleteChecklistverificationmaster = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dchecklistverificationmaster = await Checklistverificationmaster.findByIdAndRemove(id);
  if (!dchecklistverificationmaster) {
    return next(new ErrorHandler('Checklistverificationmaster not found', 404));
  }

  return res.status(200).json({ message: 'Deleted successfully' });
})


exports.getModuleBasedAssignment = catchAsyncErrors(async (req, res, next) => {
  let checklistverificationmasters;
  try {
    checklistverificationmasters = await Checklistverificationmaster.aggregate([
      {
        $lookup: {
          from: "checklisttypes",
          let: { localField1: "$categoryname", localField2: "$subcategoryname" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$localField1"] },
                    { $eq: ["$subcategory", "$$localField2"] }
                  ]
                }
              }
            },
            { $limit: 1 }, // Return only one matching document
            {
              $project: {
                module: 1,
                submodule: 1,
                mainpage: 1,
                subpage: 1,
                subsubpage: 1
              }
            }
          ],
          as: "result"
        }
      },
      {
        $unwind: {
          path: "$result",
          preserveNullAndEmptyArrays: true // Keeps documents even if no match found
        }
      },
      {
        $addFields: {
          module: "$result.module",
          submodule: "$result.submodule",
          mainpage: "$result.mainpage",
          subpage: "$result.subpage",
          subsubpage: "$result.subsubpage"
        }
      },
      {
        $project: {
          result: 0,
          checklisttype: 0,
          company: 0,
          branch: 0,
          unit: 0,
          team: 0,
          employee: 0,
          addedby: 0,
          createdAt: 0,
          updatedby: 0,
          __v: 0,
        }
      }
    ])

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!checklistverificationmasters) {
    return next(new ErrorHandler('Checklistverificationmaster not found!', 404));
  }
  return res.status(200).json({
    checklistverificationmasters
  });
})


exports.getAllDuplicateAssignChecklistConditons = catchAsyncErrors(async (req, res, next) => {
  let result;
  try {
    // console.log(req?.body, "req?.body")
    const object = req?.body;

    const baseMatch = {
      categoryname: object.categoryname,
      subcategoryname: object.subcategoryname,
      checklisttype: { $in: object.checklisttype },
      company: { $in: object.company },
      branch: { $in: object.branch },
      unit: { $in: object.unit },
      team: { $in: object.team },
      employee: { $in: object.employee }
    }
    if (object.page === "edit" && object.editid) {
      baseMatch._id = { $ne: new ObjectId(object.editid) };
    }
    result = await Checklistverificationmaster.aggregate([
      {
        $match: baseMatch
      },
      {
        $lookup: {
          from: "users", // Adjust if your user collection is named differently
          localField: "employee",
          foreignField: "companyname", // Assumes 'username' matches 'employee'
          as: "employeeDetails"
        }
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
    $project: {
      categoryname: 1,
      subcategoryname: 1,
      checklisttype: 1,
      employee: "$employeeDetails.companyname",
      usercompany: "$employeeDetails.company",       // from employeeDetails
      userbranch: "$employeeDetails.branch",
      userunit: "$employeeDetails.unit",
      userteam: "$employeeDetails.team",
      username: "$employeeDetails.username"      // optional
    }
  }
      // {
      //   $group: {
      //     _id: "$employee",
      //     categoryname: { $first: "$categoryname" },
      //     subcategoryname: { $first: "$subcategoryname" },
      //     company: { $first: "$company" },
      //     branch: { $first: "$branch" },
      //     unit: { $first: "$unit" },
      //     team: { $first: "$team" },
      //     employee: { $first: "$employee" },
      //     checklisttype: { $first: "$checklisttype" },
      //     // checklisttypeDetails: { $push: "$checklisttypeDetails" },
      //     usercompany: { $first: "$employeeDetails.company" },
      //     userbranch: { $first: "$employeeDetails.branch" },
      //     userunit: { $first: "$employeeDetails.unit" },
      //     userteam: { $first: "$employeeDetails.team" },
      //      usernames: { $addToSet: "$employeeDetails.username" }
      //   }
      // }
    ]);

    console.log(result[0] , "result")

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result
  });
})