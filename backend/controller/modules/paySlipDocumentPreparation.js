const PaySlipDocumentPreparation = require("../../model/modules/paySlipDocumentPreparationModel");
const User = require("../../model/login/auth");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const TemplatecontrolpanelModel = require('../../model/modules/documents/Templatecontrolpnael');
const PayrunList = require("../../model/modules/production/payrunlist");
//const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
// get All PaySlipDocumentPreparation  => /api/DocumentPreparations
// get All PaySlipDocumentPreparation  => /api/DocumentPreparations
exports.getAllPaySlipDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  let paySlipDocumentPreparation;
  try {
    paySlipDocumentPreparation = await PaySlipDocumentPreparation.find({}, {
      date: 1, company: 1, template: 1, filtertype: 1,
      empstatus: 1, paySlipTodo: 1, productionmonth: 1, productionyear: 1, department: 1,
      branch: 1, unit: 1, team: 1
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!paySlipDocumentPreparation) {
    return next(new ErrorHandler("Document Preparation not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    paySlipDocumentPreparation,
  });
});
exports.getAllPaySlipEmailDatas = catchAsyncErrors(async (req, res, next) => {
  let payslipemaildatas;
  try {

    payslipemaildatas = await PaySlipDocumentPreparation.find({ _id: { $in: req?.body?.selectedRows?.map(id => new mongoose.Types.ObjectId(id)) } }, { paySlipTodo: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    payslipemaildatas,
  });
});


exports.getAssignBranchPaySlipDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  let paySlipDocumentPreparation, totalProjects, overall;
  const { assignbranch, page, pageSize, allFilters, logicOperator, searchQuery } = req.body.queryParams;
  try {

    const skip = (page - 1) * pageSize; // Calculate the number of items to skip
    //Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch?.map((branchObj) => ({
      //branch: branchObj.branch,
      company: branchObj.company,
    }));
    let query = { $or: branchFilter };

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
          { date: regex },
          { productionmonth: regex },
          { productionyear: regex },
          { template: regex },
          { filtertype: regex },
          { empstatus: regex },
          { company: regex },
          { branch: { $in: regex } },
          { unit: { $in: regex } },
          { team: { $in: regex } },
        ],
      }));

      query = {
        ...query,
        $and: [
          ...orConditions,
        ]
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
    totalProjects = await PaySlipDocumentPreparation.countDocuments(query);
    paySlipDocumentPreparation = await PaySlipDocumentPreparation.find(query, {
      date: 1, company: 1, template: 1, filtertype: 1,
      empstatus: 1, paySlipTodo: 1, productionmonth: 1, productionyear: 1, department: 1,
      branch: 1, unit: 1, team: 1
    }).skip(skip)
      .limit(pageSize).lean();
  } catch (err) {
    console.log(err, 'errr')
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    paySlipDocumentPreparation,
    totalProjects,
    currentPage: page,
    totalPages: Math.ceil(totalProjects / pageSize),
  });
});


// PAyeSLip Preparaion page -> Overal Checking
exports.getAssignBranchPaySlipDocumentPreparationOverall = catchAsyncErrors(async (req, res, next) => {
  let overAllExcel, overallList;
  let { assignbranch } = req.body;
  try {

    const branchFilter = assignbranch?.map((branchObj) => ({
      //branch: branchObj.branch,
      company: branchObj.company,
    }));
    let query = { $or: branchFilter };
    overAllExcel = await PaySlipDocumentPreparation.find(query, {
      date: 1, company: 1, template: 1, filtertype: 1,
      empstatus: 1, paySlipTodo: 1, productionmonth: 1, productionyear: 1, department: 1,
      branch: 1, unit: 1, team: 1
    }).lean();
    overallList = await PaySlipDocumentPreparation.find({}, {
      date: 1, company: 1, template: 1, filtertype: 1,
      empstatus: 1, paySlipTodo: 1, productionmonth: 1, productionyear: 1, department: 1,
      branch: 1, unit: 1, team: 1
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    overallList, overAllExcel
  });
});


// get All getUserNamesBasedOnStatus => /api/usernamesbasedonstatus
exports.getUserNamesBasedOnFilterType = catchAsyncErrors(async (req, res, next) => {
  let users, payRunFilter, check;
  let { month, year, status, company } = req.body;
  try {
    const generateMongoQuery = (query) => {
      const mongoQuery = {};
      // Add department to the query if it exists
      if (query.department) {
        mongoQuery.department = { "$in": query.department }
      };
      if (query.company) {
        mongoQuery.company = query.company
      };
      if (query.empstatus) {
        mongoQuery.resonablestatus = query.empstatus
      };
      if (query.branch) {
        mongoQuery.branch = { "$in": query.branch }
      };
      if (query.unit) {
        mongoQuery.unit = { "$in": query.unit }
      };
      if (query.team) {
        mongoQuery.team = { "$in": query.team }
      };

      return mongoQuery;
    };
    const generateMongoQueryLive = (query) => {
      const mongoQuery = {};
      // Add department to the query if it exists
      if (query.department) {
        mongoQuery.department = { "$in": query.department }
      };
      if (query.company) {
        mongoQuery.company = query.company
      };
      if (query.empstatus) {
        mongoQuery.resonablestatus = undefined
      };
      if (query.branch) {
        mongoQuery.branch = { "$in": query.branch }
      };
      if (query.unit) {
        mongoQuery.unit = { "$in": query.unit }
      };
      if (query.team) {
        mongoQuery.team = { "$in": query.team }
      };

      return mongoQuery;
    };
    let query = {};
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers" && !['status'].includes(key)) {
        const value = req.body[key];
        if (value !== "" && value?.length > 0) {
          query[key] = value;
        }
      }

    });
    const mongoQueryTeam = generateMongoQuery(query);
    const mongoQueryTeamLive = generateMongoQueryLive(query);
    const teamWise = req.body.empstatus === "Live Employee" ? await User.find(mongoQueryTeamLive, {
      companyname: 1, _id: 1, company: 1, branch: 1, unit: 1, username: 1, team: 1, department: 1, email: 1
    }) : await User.find(mongoQueryTeam, {
      companyname: 1, _id: 1, company: 1, branch: 1, unit: 1, username: 1, team: 1, department: 1, email: 1
    });

    let Department = [...new Set(teamWise?.map(data => data?.department))];
    console.log(Department, "department")





    const UserCheck = Department?.length > 0 ? await PayrunList.aggregate([
      {
        $match: {
          month: month,
          department: { $in: Department },
          year: year.toString() // Ensure the year is a string for matching
        }
      },
    ]) : [];

    payRunFilter = (UserCheck?.length > 0 && teamWise?.length > 0) ? teamWise?.filter(data => {
      return UserCheck?.some(item =>
        item?.data?.some(check =>
          check.company === data?.company
          && check.branch === data?.branch
          && check.unit === data?.unit
          && check.team === data?.team
          //  && check?.companyname === data?.companyname
        )
      );
    })
      : [];
    const paySlipUsers = await PaySlipDocumentPreparation.aggregate([
      {
        $project: {
          companyname: "$paySlipTodo.companyname"
        }
      },
      {
        $group: {
          _id: null, // Grouping all documents together
          companyname: { $push: "$companyname" } // Push all companynames into an array
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the result
          companyname: 1 // Include the companyname array in the final output
        }
      }

    ]);

    const usernamesFilter = paySlipUsers?.flatMap(data => data?.companyname)?.flat()
    users = payRunFilter?.filter(data => {
      return !usernamesFilter || !usernamesFilter.includes(data?.companyname);
    });
    check = UserCheck
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    users, payRunFilter, check
  });
});
// Filtering Out Employee Names Based on Clicking generate Button in FRONTEND
exports.getFilteredEmpNamesPaySlip = catchAsyncErrors(async (req, res, next) => {
  let users, payRunFilter, check;
  let { month, year, name, empstatus, status, company } = req.body;
  try {
    const generateMongoQuery = (query) => {
      const mongoQuery = {};
      // Add department to the query if it exists
      if (query.department) {
        mongoQuery.department = { "$in": query.department }
      };
      if (query.company) {
        mongoQuery.company = query.company
      };
      if (query.empstatus) {
        mongoQuery.resonablestatus = query.empstatus
      };
      if (query.branch) {
        mongoQuery.branch = { "$in": query.branch }
      };
      if (query.unit) {
        mongoQuery.unit = { "$in": query.unit }
      };
      if (query.team) {
        mongoQuery.team = { "$in": query.team }
      };

      return mongoQuery;
    };
    const generateMongoQueryLive = (query) => {
      const mongoQuery = {};
      // Add department to the query if it exists
      if (query.department) {
        mongoQuery.department = { "$in": query.department }
      };
      if (query.company) {
        mongoQuery.company = query.company
      };
      if (query.empstatus) {
        mongoQuery.resonablestatus = undefined
      };
      if (query.branch) {
        mongoQuery.branch = { "$in": query.branch }
      };
      if (query.unit) {
        mongoQuery.unit = { "$in": query.unit }
      };
      if (query.team) {
        mongoQuery.team = { "$in": query.team }
      };

      return mongoQuery;
    };
    let query = {};
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers" && !['status'].includes(key)) {
        const value = req.body[key];
        if (value !== "" && value?.length > 0) {
          query[key] = value;
        }
      }

    });
    const mongoQueryTeam = generateMongoQuery(query);
    const mongoQueryTeamLive = generateMongoQueryLive(query);
    const teamWise = req.body.empstatus === "Live Employee" ? await User.find(mongoQueryTeamLive, {
      companyname: 1, _id: 1, company: 1, branch: 1, unit: 1, username: 1, team: 1, department: 1, email: 1
    }) : await User.find(mongoQueryTeam, {
      companyname: 1, _id: 1, company: 1, branch: 1, unit: 1, username: 1, team: 1, department: 1, email: 1
    });


    let Department = [...new Set(teamWise?.map(data => data?.department))];
    const UserCheck = Department?.length > 0 ? await PayrunList.aggregate([
      {
        $match: {
          month: month,
          department: { $in: Department },
          year: year.toString() // Ensure the year is a string for matching
        }
      },
    ]) : [];

    payRunFilter = (UserCheck?.length > 0 && teamWise?.length > 0) ? teamWise?.filter(data => {
      return UserCheck?.some(item =>
        item?.data?.some(check =>
          check.company === data?.company
          && check.branch === data?.branch
          && check.unit === data?.unit
          && check.team === data?.team
          && check?.companyname === data?.companyname
        )
      );
    })
      : [];

    const paySlipUsers = await PaySlipDocumentPreparation.aggregate([
      {
        $match: {
          productionmonth: month,
          productionyear: year?.toString(),
        }
      },
      {
        $project: {
          companyname: "$paySlipTodo.companyname"
        }
      },
      {
        $group: {
          _id: null, // Grouping all documents together
          companyname: { $push: "$companyname" } // Push all companynames into an array
        }
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the result
          companyname: 1 // Include the companyname array in the final output
        }
      }

    ]);

    const usernamesFilter = paySlipUsers?.flatMap(data => data?.companyname)?.flat()
    users = payRunFilter?.filter(data => !usernamesFilter.includes(data?.companyname));
    check = UserCheck;
    // users = teamWise



  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    users
  });
});
//getting seal and Signature based
exports.getAllSealAndSignatue = catchAsyncErrors(async (req, res, next) => {
  let users;
  let { name, empstatus, status, company } = req.body;
  try {
    let branch = req.body.branch || [];
    let unit = req.body.unit || [];
    let team = req.body.team || [];

    // Initialize the match condition with company field
    let matchCondition = {
      company: req.body.company
    };

    if (branch.length > 0) {
      matchCondition.branch = { $in: branch };
    }

    if (unit.length > 0) {
      matchCondition["documentsignature.unit"] = { $in: unit };
    }

    if (team.length > 0) {
      matchCondition["documentsignature.team"] = { $in: team };
    }


    console.log(matchCondition , 'Conditions')
    let documentPreparation = await TemplatecontrolpanelModel.aggregate([
      { $match: matchCondition }
    ])

    users = documentPreparation


  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    users
  });
});
exports.getSingleSealAndSignatue = catchAsyncErrors(async (req, res, next) => {
  let signature, seal, background;
  try {
    // BackGround Image
    let backgroundImageId = await TemplatecontrolpanelModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.body.backgroundid)
        }
      }
    ])
    let sealId = req.body?.sealid !== "123456" ? await TemplatecontrolpanelModel.aggregate([
      {
        $match: {
          "documentseal._id": new mongoose.Types.ObjectId(req.body.sealid)
        }
      },
      {
        $project: {
          documentseal: {
            $filter: {
              input: "$documentseal", // the array to filter
              as: "item", // alias for each item in the array
              cond: { $eq: ["$$item._id", new mongoose.Types.ObjectId(req.body.sealid)] } // condition for filtering
            }
          }
        }
      }
    ]) : []
    let signatureId = req.body?.signatureid !== "123456" ? await TemplatecontrolpanelModel.aggregate([
      {
        $match: {
          "documentsignature._id": new mongoose.Types.ObjectId(req.body.signatureid)
        }
      },
      {
        $project: {
          documentsignature: {
            $filter: {
              input: "$documentsignature", // the array to filter
              as: "item", // alias for each item in the array
              cond: { $eq: ["$$item._id", new mongoose.Types.ObjectId(req.body.signatureid)] } // condition for filtering
            }
          }
        }
      }
    ]) : [];

    

    seal = sealId?.length > 0 ? sealId[0]?.documentseal[0] : {};
    signature = signatureId?.length > 0 ? signatureId[0]?.documentsignature[0] : {};
    background = backgroundImageId;

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    seal, signature, background
  });
});
exports.getPaySlipRelatedPayRunDatas = catchAsyncErrors(async (req, res, next) => {
  let payRuns, payRunFilter;
  const { month, year, company, branch, unit, team, companyname } = req.body
  try {
    payRuns = await PayrunList.find();
    payRunFilter = await PayrunList.aggregate([
      {
        $match: {
          month: month,
          year: year
        }
      },
      {
        $project: {
          month: 1, year: 1,
          data: {
            $filter: {
              input: "$data",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.company", company] },
                  { $eq: ["$$item.branch", branch] },
                  { $eq: ["$$item.unit", unit] },
                  { $eq: ["$$item.team", team] },
                  { $eq: ["$$item.companyname", companyname] }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          dataSize: { $size: "$data" } // Adds a new field 'dataSize' that stores the size of the 'data' array
        }
      },
      {
        $match: {
          dataSize: { $gt: 0 } // Filters to include only documents where dataSize is greater than 0
        }
      }
    ]);

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }

  return res.status(200).json({
    payRuns, payRunFilter
  });
});







// Create new PaySlipDocumentPreparation=> /api/PaySlipDocumentPreparation/new
exports.addPaySlipDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const { template, person } = req.body;

  let aDocumentPreparation = await PaySlipDocumentPreparation.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle PaySlipDocumentPreparation => /api/payslipdocumentpreparation/:id
exports.getSinglePaySlipDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sdocumentPreparation = await PaySlipDocumentPreparation.findById(id);

  if (!sdocumentPreparation) {
    return next(new ErrorHandler("Pay Slip Document Preparation not found!", 404));
  }
  return res.status(200).json({
    sdocumentPreparation,
  });
});

// update PaySlipDocumentPreparation by id => /api/payslipdocumentpreparation/:id
exports.updatePaySlipDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let udocumentPreparation = await PaySlipDocumentPreparation.findByIdAndUpdate(id, req.body);
  if (!udocumentPreparation) {
    return next(new ErrorHandler("PaySlip documentpreparation not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete PaySlipDocumentPreparation by id => /api/payslipdocumentpreparation/:id
exports.deletePaySlipDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dDocumentPreparation = await PaySlipDocumentPreparation.findByIdAndRemove(id);

  if (!dDocumentPreparation) {
    return next(new ErrorHandler("PaySlip documentpreparation not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});