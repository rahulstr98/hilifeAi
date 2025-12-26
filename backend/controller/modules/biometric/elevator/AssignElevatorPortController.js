const AssignElevatorPort = require('../../../../model/modules/biometric/elevator/AssignElevatorPortModel');
const ErrorHandler = require('../../../../utils/errorhandler');
const catchAsyncErrors = require('../../../../middleware/catchAsyncError');

exports.getAllAssignElevatorPort = catchAsyncErrors(async (req, res, next) => {
  let assignelevatorport;
  try {
    const { assignbranch } = req.body;

    if (assignbranch && assignbranch.length > 0) {
      const branchFilter = assignbranch?.map((branchObj) => ({
        $and: [{ company: { $elemMatch: { $eq: branchObj.company } } }, { branch: { $elemMatch: { $eq: branchObj.branch } } }],
      }));

      let filterQuery = {};
      if (branchFilter?.length > 0) {
        filterQuery = { $or: branchFilter };
      }

      assignelevatorport = await AssignElevatorPort.find(filterQuery);
    } else {
      assignelevatorport = await AssignElevatorPort.find();
    }
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }

  if (!assignelevatorport) {
    return next(new ErrorHandler('Assign Elevator Port not found!', 404));
  }

  return res.status(200).json({
    assignelevatorport,
  });
});

exports.getOverallBulkAssignElevatorPortDelete = catchAsyncErrors(async (req, res, next) => {
  let assignelevatorport, result, count;
  let id = req.body.id;
  try {
    assignelevatorport = await AssignElevatorPort.find();
    const answer = assignelevatorport?.filter((data) => id?.includes(data._id?.toString()));

    result = id;
    count = id?.length;
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }

  return res.status(200).json({
    count: count,
    result,
  });
});

exports.getSingleBulkAssignElevatorPortDelete = catchAsyncErrors(async (req, res, next) => {
  let elevatorPortId = req.body.oldname;
  let linkedData = [];

  try {
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }

  return res.status(200).json({
    count: linkedData?.length,
    linkedData,
  });
});

exports.addAssignElevatorPort = catchAsyncErrors(async (req, res, next) => {
  let aassignelevatorport = await AssignElevatorPort.create(req.body);
  return res.status(200).json({
    message: 'Successfully added!',
  });
});

exports.getSingleAssignElevatorPort = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sassignelevatorport = await AssignElevatorPort.findById(id);

  if (!sassignelevatorport) {
    return next(new ErrorHandler('Assign Elevator Port not found!', 404));
  }
  return res.status(200).json({
    sassignelevatorport,
  });
});

exports.updateAssignElevatorPort = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uassignelevatorport = await AssignElevatorPort.findByIdAndUpdate(id, req.body);
  if (!uassignelevatorport) {
    return next(new ErrorHandler('Assign Elevator Port not found!', 404));
  }
  return res.status(200).json({ message: 'Updated successfully' });
});

exports.deleteAssignElevatorPort = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dassignelevatorport = await AssignElevatorPort.findByIdAndDelete(id);

  if (!dassignelevatorport) {
    return next(new ErrorHandler('Assign Elevator Port not found!', 404));
  }
  return res.status(200).json({ message: 'Deleted successfully' });
});

exports.assignElevatorPortList = catchAsyncErrors(async (req, res, next) => {
  let totalProjects, result, totalProjectsAllData;

  const { page, pageSize, assignbranch, allFilters, logicOperator, searchQuery } = req.body;

  try {
    let query = {};
    const conditions = [];

    if (allFilters && allFilters.length > 0) {
      allFilters.forEach((filter) => {
        if (filter.column && filter.condition && (filter.value || ['Blank', 'Not Blank'].includes(filter.condition))) {
          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      });
    }

    if (searchQuery && searchQuery !== undefined) {
      const searchTermsArray = searchQuery.split(' ');
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, 'i'));

      const orConditions = regexTerms.map((regex) => ({
        $or: [{ company: { $regex: regex } }, { branch: { $regex: regex } }, { floor: { $regex: regex } }, { elevatorPort: { $regex: regex } }],
      }));

      query.$and = orConditions;
    }

    if (conditions.length > 0) {
      if (logicOperator === 'AND') {
        query.$and = conditions;
      } else if (logicOperator === 'OR') {
        query.$or = conditions;
      }
    }

    if (assignbranch && assignbranch.length > 0) {
      const branchFilters = assignbranch?.map((branchObj) => ({
        company: branchObj.company,
        branch: branchObj.branch,
      }));

      if (!query.$and) query.$and = [];
      query.$and.push({ $or: branchFilters });
    }

    totalProjects = await AssignElevatorPort.countDocuments(query);
    totalProjectsAllData = await AssignElevatorPort.find(query);

    result = await AssignElevatorPort.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }

  return res.status(200).json({
    totalProjects,
    result,
    totalProjectsAllData,
    currentPage: page,
    totalPages: Math.ceil(totalProjects / pageSize),
  });
});

function createFilterCondition(column, condition, value) {
  const conditionMap = {
    Contains: { [column]: { $regex: value, $options: 'i' } },
    'Does Not Contain': { [column]: { $not: { $regex: value, $options: 'i' } } },
    Equals: { [column]: value },
    'Does Not Equal': { [column]: { $ne: value } },
    'Begins With': { [column]: { $regex: `^${value}`, $options: 'i' } },
    'Ends With': { [column]: { $regex: `${value}$`, $options: 'i' } },
    Blank: { [column]: { $in: [null, '', undefined] } },
    'Not Blank': { [column]: { $nin: [null, '', undefined] } },
  };

  return conditionMap[condition] || { [column]: { $regex: value, $options: 'i' } };
}
