const Noticeperiodapply = require('../../../model/modules/recruitment/noticeperiodapply');
const ErrorHandler = require('../../../utils/errorhandler');
const User = require('../../../model/login/auth');
// const Task = require('../../../model/modules/project/task');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');

//get All Noticeperiodapply =>/api/Noticeperiodapply
exports.getAllNoticeperiodapply = catchAsyncErrors(async (req, res, next) => {
  let noticeperiodapply, files;
  try {
    // files = await Noticeperiodapply.find({},{files:1})
    noticeperiodapply = await Noticeperiodapply.find(
      {},
      {
        empname: 1,
        replacename: 1,
        empcode: 1,
        reasonleavingname: 1,
        noticedate: 1,
        exitstatus: 1,
        other: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        status: 1,
        approvedStatus: 1,
        rejectStatus: 1,
        recheckStatus: 1,
        approvenoticereq: 1,
        rejectnoticereq: 1,
        rechecknoticereq: 1,
        requestfile: 1,
        requestdate: 1,
        requestdatestatus: 1,
        approvedthrough: 1,
        cancelreason: 1,
        continuereason: 1,
        cancelstatus: 1,
        continuestatus: 1,
        requestdatereason: 1,
        meetingscheduled: 1,
        username: 1,
        password: 1,
        interviewscheduled: 1,
        date: 1,
        time: 1,
        testname: 1,
        interviewForm: 1,
        confirmationstatus: 1,
        meetingremarks: 1,
        meetingcompleted: 1,
      }
    );
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!noticeperiodapply) {
    return next(new ErrorHandler('Noticeperiodapply not found!', 404));
  }
  return res.status(200).json({
    noticeperiodapply,
    files,
  });
});

exports.getAllNoticePeriodApplyByPagination = catchAsyncErrors(async (req, res, next) => {
  const { page, pageSize, allFilters, logicOperator, searchQuery, isEmployee, employeeName, accessbranch, fromwhere } = req.body;

  console.log(req.body);

  let query = {};
  let conditions = [];

  console.log('Requested');

  console.time('Requested');

  // Advanced search filter
  if (allFilters && allFilters.length > 0) {
    allFilters.forEach((filter) => {
      if (filter.column && filter.condition && (filter.value || ['Blank', 'Not Blank'].includes(filter.condition))) {
        conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
      }
    });
  }

  if (searchQuery) {
    const searchTermsArray = searchQuery.split(' ');
    const regexTerms = searchTermsArray.map((term) => new RegExp(term, 'i'));

    const orConditions = regexTerms.map((regex) => ({
      $or: [{ empcode: regex }, { empname: regex }, { company: regex }, { branch: regex }, { unit: regex }, { team: regex }, { department: regex }, { noticedate: regex }, { meetingremarks: regex }, { approvenoticereq: regex }],
    }));

    query = {
      $and: [...orConditions],
    };
  }

  // Apply logicOperator to combine conditions
  if (conditions.length > 0) {
    if (logicOperator === 'AND') {
      query.$and = conditions;
    } else if (logicOperator === 'OR') {
      query.$or = conditions;
    }
  }

  if (accessbranch && accessbranch.length > 0) {
    const assignBranchQuery = {
      $or: accessbranch.map((item) => ({
        company: item.company,
        branch: item.branch,
        unit: item.unit,
      })),
    };

    // Merge with existing query
    if (!query.$and) query.$and = [];
    query.$and.push(assignBranchQuery);
  }

  if (isEmployee) {
    const empQuery = {
      empname: employeeName,
    };
    if (!query.$and) query.$and = [];
    query.$and.push(empQuery);
  }

  console.timeEnd('Requested');
  try {
    const deactivatedUsers = await User.find(
      {
        enquirystatus: {
          $nin: ['Enquiry Purpose'],
        },
        resonablestatus: {
          $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
        },
      },
      { companyname: 1 }
    ).lean();
    const deactivatedEmpNames = deactivatedUsers.map((user) => user.companyname);

    if (!query.$and) query.$and = [];

    if (fromwhere === 'live' || fromwhere === 'all') {
      query.$and.push({ empname: { $nin: deactivatedEmpNames } });
    } else if (fromwhere === 'notlive') {
      query.$and.push({ empname: { $in: deactivatedEmpNames } });
    } else if (fromwhere === 'recheck') {
      query.$and.push({ recheckStatus: { $eq: 'true' }, empname: { $nin: deactivatedEmpNames } });
    } else if (fromwhere === 'approve') {
      query.$and.push({ approvedStatus: { $ne: 'true' }, recheckStatus: { $ne: 'true' }, rejectStatus: { $ne: 'true' }, empname: { $nin: deactivatedEmpNames } });
    } else if (fromwhere === 'approved') {
      query.$and.push({ approvedStatus: { $eq: 'true' }, cancelstatus: { $eq: false }, continuestatus: { $eq: false }, empname: { $nin: deactivatedEmpNames } });
    }

    console.time('Requested1');

    const totalCountAgg = await Noticeperiodapply.aggregate([{ $match: query }, { $group: { _id: null, count: { $sum: 1 } } }]);
    totalProjects = totalCountAgg[0]?.count || 0;
    console.timeEnd('Requested1');
    console.time('Requested2');
    const result = await Noticeperiodapply.find(query, {
      empname: 1,
      replacename: 1,
      empcode: 1,
      reasonleavingname: 1,
      noticedate: 1,
      exitstatus: 1,
      other: 1,
      branch: 1,
      company: 1,
      unit: 1,
      team: 1,
      department: 1,
      status: 1,
      approvedStatus: 1,
      rejectStatus: 1,
      recheckStatus: 1,
      approvenoticereq: 1,
      rejectnoticereq: 1,
      rechecknoticereq: 1,
      requestfile: 1,
      requestdate: 1,
      requestdatestatus: 1,
      approvedthrough: 1,
      cancelreason: 1,
      continuereason: 1,
      cancelstatus: 1,
      continuestatus: 1,
      requestdatereason: 1,
      meetingscheduled: 1,
      username: 1,
      password: 1,
      interviewscheduled: 1,
      date: 1,
      time: 1,
      testname: 1,
      interviewForm: 1,
      confirmationstatus: 1,

      interviewcategory: 1,
      interviewtype: 1,
      venue: 1,
      interviewmode: 1,
      branchvenue: 1,
      floorvenue: 1,
      link: 1,
      date: 1,
      time: 1,
      interviewer: 1,
      updatedby: 1,
      hrupload: 1,
      meetingremarks: 1,
      meetingcompleted: 1,
    })
      .select('')
      .lean()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();
    console.timeEnd('Requested2');
    res.status(200).json({
      totalProjects,
      result,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
      overallitems: [],
    });
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler('Records not found!', 404));
  }
});

//28.08.2024
exports.getAllNoticeperiodapplyByAssignBranch = catchAsyncErrors(async (req, res, next) => {
  let noticeperiodapply, files;

  const { assignbranch } = req.body;

  const assignBranchQuery = assignbranch.map((item) => ({
    company: item.company,
    branch: item.branch,
    unit: item.unit,
  }));

  const deactivatedUsers = await User.find(
    {
      enquirystatus: { $nin: ['Enquiry Purpose'] },
      resonablestatus: {
        $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
      },
    },
    { companyname: 1 }
  ).lean();

  const deactivatedEmpNames = deactivatedUsers.map((user) => user.companyname);

  const query = {
    $and: [{ $or: assignBranchQuery }, { empname: { $nin: deactivatedEmpNames } }],
  };

  console.log(query, 'query');
  try {
    // files = await Noticeperiodapply.find({},{files:1})
    if (assignbranch.length > 0) {
      noticeperiodapply = await Noticeperiodapply.find(query, {
        empname: 1,
        replacename: 1,
        empcode: 1,
        reasonleavingname: 1,
        noticedate: 1,
        exitstatus: 1,
        other: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        status: 1,
        approvedStatus: 1,
        rejectStatus: 1,
        recheckStatus: 1,
        approvenoticereq: 1,
        rejectnoticereq: 1,
        rechecknoticereq: 1,
        requestfile: 1,
        requestdate: 1,
        requestdatestatus: 1,
        approvedthrough: 1,
        cancelreason: 1,
        continuereason: 1,
        cancelstatus: 1,
        continuestatus: 1,
        requestdatereason: 1,
        meetingscheduled: 1,
        username: 1,
        password: 1,
        interviewscheduled: 1,
        date: 1,
        time: 1,
        testname: 1,
        interviewForm: 1,
        confirmationstatus: 1,

        interviewcategory: 1,
        interviewtype: 1,
        venue: 1,
        interviewmode: 1,
        branchvenue: 1,
        floorvenue: 1,
        link: 1,
        date: 1,
        time: 1,
        interviewer: 1,
        updatedby: 1,
        meetingremarks: 1,
        meetingcompleted: 1,
      });
    } else {
      noticeperiodapply = [];
    }
    console.log(noticeperiodapply.length, 'noticeperiodapply');
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!noticeperiodapply) {
    return next(new ErrorHandler('Noticeperiodapply not found!', 404));
  }
  return res.status(200).json({
    noticeperiodapply,
    files,
  });
});

exports.getAllNoticeperiodapplyByAssignBranchHome = catchAsyncErrors(async (req, res, next) => {
  let noticeperiodapply, files;

  const { assignbranch } = req.body;

  const assignBranchQuery = assignbranch.map((item) => ({
    company: item.company,
    branch: item.branch,
    unit: item.unit,
  }));

  const deactivatedUsers = await User.find(
    {
      enquirystatus: { $nin: ['Enquiry Purpose'] },
      resonablestatus: {
        $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
      },
    },
    { companyname: 1 }
  ).lean();

  const deactivatedEmpNames = deactivatedUsers.map((user) => user.companyname);

  const query = {
    $and: [{ $or: assignBranchQuery }, { empname: { $nin: deactivatedEmpNames } }],
  };
  (query.status = { $in: ['Applied'] }), (query.rejectstatus = false), (query.cancelstatus = false), (query.continuestatus = false), console.log(query, 'query');
  try {
    // files = await Noticeperiodapply.find({},{files:1})
    if (assignbranch.length > 0) {
      noticeperiodapply = await Noticeperiodapply.find(query, {
        empname: 1,
        replacename: 1,
        empcode: 1,
        reasonleavingname: 1,
        noticedate: 1,
        exitstatus: 1,
        other: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        status: 1,
        approvedStatus: 1,
        rejectStatus: 1,
        recheckStatus: 1,
        approvenoticereq: 1,
        rejectnoticereq: 1,
        rechecknoticereq: 1,
        requestfile: 1,
        requestdate: 1,
        requestdatestatus: 1,
        approvedthrough: 1,
        cancelreason: 1,
        continuereason: 1,
        cancelstatus: 1,
        continuestatus: 1,
        requestdatereason: 1,
        meetingscheduled: 1,
        username: 1,
        password: 1,
        interviewscheduled: 1,
        date: 1,
        time: 1,
        testname: 1,
        interviewForm: 1,
        confirmationstatus: 1,

        interviewcategory: 1,
        interviewtype: 1,
        venue: 1,
        interviewmode: 1,
        branchvenue: 1,
        floorvenue: 1,
        link: 1,
        date: 1,
        time: 1,
        interviewer: 1,
        updatedby: 1,
        meetingremarks: 1,
        meetingcompleted: 1,
      });
    } else {
      noticeperiodapply = [];
    }
    console.log(noticeperiodapply.length, 'noticeperiodapply');
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!noticeperiodapply) {
    return next(new ErrorHandler('Noticeperiodapply not found!', 404));
  }
  return res.status(200).json({
    noticeperiodapply,
    files,
  });
});

exports.getAllChecklistNoticeperiodapply = catchAsyncErrors(async (req, res, next) => {
  let noticeperiodapply, files;
  try {
    // files = await Noticeperiodapply.find({},{files:1})

    const deactivatedUsers = await User.find(
      {
        enquirystatus: { $nin: ['Enquiry Purpose'] },
        resonablestatus: {
          $in: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
        },
      },
      { companyname: 1 }
    ).lean();

    const deactivatedEmpNames = deactivatedUsers.map((user) => user.companyname);

    const query = {
      $and: [{ empname: { $nin: deactivatedEmpNames } }, { approvedStatus: 'true', cancelstatus: false, continuestatus: false }],
    };

    noticeperiodapply = await Noticeperiodapply.find(query, {
      empname: 1,
      replacename: 1,
      empcode: 1,
      reasonleavingname: 1,
      noticedate: 1,
      exitstatus: 1,
      other: 1,
      branch: 1,
      company: 1,
      unit: 1,
      team: 1,
      department: 1,
      status: 1,
      approvedStatus: 1,
      rejectStatus: 1,
      recheckStatus: 1,
      approvenoticereq: 1,
      rejectnoticereq: 1,
      rechecknoticereq: 1,
      requestfile: 1,
      requestdate: 1,
      requestdatestatus: 1,
      approvedthrough: 1,
      cancelreason: 1,
      continuereason: 1,
      cancelstatus: 1,
      continuestatus: 1,
      requestdatereason: 1,
      meetingscheduled: 1,
      meetingremarks: 1,
      meetingcompleted: 1,
    });
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!noticeperiodapply) {
    return next(new ErrorHandler('Noticeperiodapply not found!', 404));
  }
  return res.status(200).json({
    noticeperiodapply,
    files,
  });
});
exports.getNoticeperiodapplyForLeave = catchAsyncErrors(async (req, res, next) => {
  let noticeperiodapply, files;
  try {
    console.log('stsrt');
    // files = await Noticeperiodapply.find({},{files:1})
    noticeperiodapply = await Noticeperiodapply.find(
      { empcode: req.body.empid, status: { $in: ['Applied'] }, rejectStatus: false, cancelstatus: false, continuestatus: false },
      {
        empname: 1,
        replacename: 1,
        empcode: 1,
        reasonleavingname: 1,
        noticedate: 1,
        other: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        status: 1,
        approvedStatus: 1,
        rejectStatus: 1,
        recheckStatus: 1,
        approvenoticereq: 1,
        rejectnoticereq: 1,
        rechecknoticereq: 1,
        requestfile: 1,
        requestdate: 1,
        requestdatestatus: 1,
        approvedthrough: 1,
        cancelreason: 1,
        continuereason: 1,
        cancelstatus: 1,
        continuestatus: 1,
        requestdatereason: 1,
        meetingscheduled: 1,
        meetingremarks: 1,
        meetingcompleted: 1,
      }
    );
    if (!noticeperiodapply) {
      return res.status(200).json({
        noticeperiodapply: [],
        files: [],
      });
    }

    return res.status(200).json({
      noticeperiodapply,
      files,
    });
  } catch (err) {
    console.log(err, 'erno1');
    return next(new ErrorHandler('Records not found!', 404));
  }
});

//create new Noticeperiodapply => /api/Noticeperiodapply/new
exports.addNoticeperiodapply = catchAsyncErrors(async (req, res, next) => {
  let checkmain = await Noticeperiodapply.findOne({
    empcode: req.body.empcode,
    $or: [
      {
        $and: [{ status: 'Applied' }, { approvedStatus: { $exists: false } }, { cancelstatus: false }, { continuestatus: false }, { rejectStatus: { $exists: false } }, { recheckStatus: { $exists: false } }],
      },
      {
        $and: [{ status: 'Applied' }, { approvedStatus: true }, { cancelstatus: false }, { continuestatus: false }, { rejectStatus: { $exists: false } }, { recheckStatus: { $exists: false } }],
      },
    ],
  });
  if (checkmain) {
    return next(new ErrorHandler('Notice Period Already Applied or Approved!', 400));
  }
  let aNoticeperiodapply = await Noticeperiodapply.create(req.body);
  return res.status(200).json({
    message: 'Successfully added!',
  });
});

// get Single Noticeperiodapply => /api/Noticeperiodapply/:id
exports.getSingleNoticeperiodapply = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let snoticeperiodapply = await Noticeperiodapply.findById(id);
  if (!snoticeperiodapply) {
    return next(new ErrorHandler('Noticeperiodapply not found', 404));
  }
  return res.status(200).json({
    snoticeperiodapply,
  });
});

exports.updateNoticeperiodapply = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find and update the document
    let unoticeperiodapply = await Noticeperiodapply.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on the updated document
    });

    // If the document is not found, throw an error
    if (!unoticeperiodapply) {
      return next(new ErrorHandler('Noticeperiodapply not found', 404));
    }

    // Respond with success message
    return res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    // Pass the error to the next middleware (error handler)
    return next(new ErrorHandler(error.message || 'An error occurred', 500));
  }
});

//delete Noticeperiodapply by id => /api/Noticeperiodapply/:id
exports.deleteNoticeperiodapply = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dnoticeperiodapply = await Noticeperiodapply.findByIdAndRemove(id);
  if (!dnoticeperiodapply) {
    return next(new ErrorHandler('Noticeperiodapply not found', 404));
  }

  return res.status(200).json({ message: 'Deleted successfully' });
});

exports.dynamicQueryNoticeController = async (req, res) => {
  try {
    const { aggregationPipeline } = req.body;

    const users = await Noticeperiodapply.aggregate(aggregationPipeline);

    return res.status(200).json({
      users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
