const ProcessQueueName = require("../../../model/modules/production/ProcessQueueNameModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

const Targetpoints = require("../../../model/modules/production/targetpoints");
const ERAAmount = require("../../../model/modules/production/EraAmountModel");
const RevenueAmount = require("../../../model/modules/production/RevenueAmountModel");
const SalarySlab = require("../../../model/modules/setup/SalarySlabModel");

// get All ProcessQueueName => /api/processqueuename
exports.getAllProcessQueueName = catchAsyncErrors(async (req, res, next) => {
  let processqueuename;
  try {
    processqueuename = await ProcessQueueName.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!processqueuename) {
    return next(new ErrorHandler("Process Queue Name not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    processqueuename,
  });
});



// get All ProcessQueueName_UnAssignedReports => /api/processqueuenameunassignedreports
exports.getAllProcessQueueNameUnAssignedReports = catchAsyncErrors(async (req, res, next) => {
  let processqueuename;
  let { company, branch } = req?.body;
  try {
    processqueuename = await ProcessQueueName.find({ company: { $in: company }, branch: { $in: branch } }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    processqueuename,
  });
});


exports.getAllUnassignedReportList = catchAsyncErrors(async (req, res, next) => {
  let targetpointFilters;
  let { company, branch, process, mode } = req?.body;
  const result = company.flatMap(c => branch.map(b => `${c}__${b}`));
  try {
    const pipeline = [
      {
        $match: {
          company: { $in: company },
          branch: { $in: branch }
        }
      },
      {
        $group: {
          _id: null,
          targetCodes: {
            $addToSet: {
              $concat: ["$company", "__", "$branch", "__", "$processcode"] // Combine fields with '__'
            }
          },
        }
      },
      {
        $addFields: {
          expectedCombinations: {
            $reduce: {
              input: result,
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  process.map((proc) => ({
                    $concat: ["$$this", "__", proc]
                  }))
                ]
              }
            }
          },
          combinations: "$expectedCombinations"
        }
      },
      {
        $project: {
          _id: 0,
          targetCodes: 1,
          unmatchedProcesses: {
            $filter: {
              input: "$expectedCombinations",
              as: "comb",
              cond: { $not: { $in: ["$$comb", "$targetCodes"] } }
            }
          },
          combinations: 1
        }
      },
      {
        $unwind: "$unmatchedProcesses"
      },

      {
        $lookup: {
          from: "processqueuenames",
          let: { unmatchedProcess: "$unmatchedProcesses" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $concat: ["$company", "__", "$branch", "__", "$name"] }, "$$unmatchedProcess"] }
                  ]
                }
              }
            }
          ],
          as: "matchedProcess"
        }
      },
      {
        $unwind: {
          path: "$matchedProcess",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          company: "$matchedProcess.company",
          branch: "$matchedProcess.branch",
          code: "$matchedProcess.code",
          process: "$matchedProcess.name",
          mode: mode,
          // targetCodes: 1, 
          // unmatchedProcesses: "$unmatchedProcesses",
          // combinations: 1
        }
      }
    ];




    const pipelineERA = [
      {
        $match: {
          company: { $in: company },
          branch: { $in: branch }
        }
      },
      {
        $addFields: {
          processcodeWithoutNumbers: {
            $reduce: {
              input: {
                $map: {
                  input: { $range: [0, { $strLenCP: `$${mode === "Salary Slab" ? "salarycode" : "processcode"}` }] }, // Create an array of character indexes
                  as: "i",
                  in: { $substrCP: [`$${mode === "Salary Slab" ? "salarycode" : "processcode"}`, "$$i", 1] } // Get each character
                }
              },
              initialValue: "",
              in: {
                $cond: {
                  if: {
                    $in: [
                      { $toLower: "$$this" },
                      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] // Check if the character is a number
                    ]
                  },
                  then: "$$value", // Skip numbers
                  else: { $concat: ["$$value", "$$this"] } // Concatenate non-numbers
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          targetCodes: {
            $addToSet: {
              $concat: ["$company", "__", "$branch", "__", "$processcodeWithoutNumbers"] // Combine fields with '__'
            }
          }
        }
      },
      {
        $addFields: {

          expectedCombinations: {
            $reduce: {
              input: result,
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  process.map((proc) => ({
                    $concat: ["$$this", "__", proc]
                  }))
                ]
              }
            }
          },
          combinations: "$expectedCombinations"
        }
      },
      {
        $project: {
          _id: 0,
          targetCodes: 1,
          unmatchedProcesses: {
            $filter: {
              input: "$expectedCombinations",
              as: "proc",
              cond: { $not: { $in: ["$$proc", "$targetCodes"] } }
            }
          }
        }
      },
      {
        $unwind: "$unmatchedProcesses"
      },
      {
        $lookup: {
          from: "processqueuenames", // Name of the collection to join with
          let: { unmatchedProcess: "$unmatchedProcesses" }, // Pass unmatchedProcess as a variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $concat: ["$company", "__", "$branch", "__", "$name"] }, "$$unmatchedProcess"] }
                  ]
                }
              }
            }
          ],
          as: "matchedProcess" // Alias for the matched results
        }
      },
      {
        $unwind: {
          path: "$matchedProcess", // Unwind the matchedProcess array
          preserveNullAndEmptyArrays: false // Retain documents without a match
        }
      },
      {
        $project: {
          company: "$matchedProcess.company",
          branch: "$matchedProcess.branch",
          code: "$matchedProcess.code",
          process: "$matchedProcess.name", // Include the name from Processqueuename
          mode: mode,
          // targetCodes: 1, 
          // unmatchedProcesses: "$unmatchedProcesses",
        }
      }
    ];




    if (mode === "Target Points") {
      targetpointFilters = await Targetpoints.aggregate(pipeline);
    }
    if (mode === "ERA Amount") {
      targetpointFilters = await ERAAmount.aggregate(pipelineERA);
    }
    if (mode === "Salary Slab") {
      targetpointFilters = await SalarySlab.aggregate(pipelineERA);
    }
    if (mode === "Revenue Amount") {
      targetpointFilters = await RevenueAmount.aggregate(pipelineERA);
    }

  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    targetpointFilters,
  });
});

// Create new ProcessQueueName=> /api/processqueuename/new
exports.addProcessQueueName = catchAsyncErrors(async (req, res, next) => {
  let aprocessqueuename = await ProcessQueueName.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle ProcessQueueName => /api/processqueuename/:id
exports.getSingleProcessQueueName = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sprocessqueuename = await ProcessQueueName.findById(id);

  if (!sprocessqueuename) {
    return next(new ErrorHandler("Process Queue Name not found!", 404));
  }
  return res.status(200).json({
    sprocessqueuename,
  });
});

// update ProcessQueueName by id => /api/processqueuename/:id
exports.updateProcessQueueName = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uprocessqueuename = await ProcessQueueName.findByIdAndUpdate(id, req.body);
  if (!uprocessqueuename) {
    return next(new ErrorHandler("Process Queue Name not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete ProcessQueueName by id => /api/processqueuename/:id
exports.deleteProcessQueueName = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dprocessqueuename = await ProcessQueueName.findByIdAndRemove(id);

  if (!dprocessqueuename) {
    return next(new ErrorHandler("Process Queue Name not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});


exports.processQueueNameSort = catchAsyncErrors(async (req, res, next) => {

  let totalProjects, result, totalProjectsData, totalPages, currentPage;
  try {

    const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery, } = req.body;


    let query = {};

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
          { name: regex },
          { code: regex },
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

    const branchFilters = assignbranch?.map(branchObj => ({
      company: branchObj.company,
      branch: branchObj.branch,
    }));

    const combinedFilter = {
      $and: [
        query,
        { $or: branchFilters },
      ],
    };


    totalProjects = await ProcessQueueName?.countDocuments(combinedFilter);
    totalProjectsData = await ProcessQueueName?.find(combinedFilter);

    result = await ProcessQueueName.find(combinedFilter)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    return res.status(200).json({
      totalProjects,
      result,
      totalProjectsData,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    console.log(err)
    return next(new ErrorHandler("Records not found!", 404));
  }
});

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
