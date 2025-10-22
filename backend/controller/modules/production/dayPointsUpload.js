const DayPointsUpload = require("../../../model/modules/production/dayPointsUpload");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const { ObjectId } = require("mongodb");
const MinimumPoints = require("../../../model/modules/production/minimumpoints");
const Department = require("../../../model/modules/department");
const User = require("../../../model/login/auth");
const SalarySlabs = require("../../../model/modules/setup/SalarySlabModel");
const ShortageMaster = require("../../../model/modules/production/Shortagemaster");
const RevenueAmount = require("../../../model/modules/production/RevenueAmountModel");
const AcPointVal = require("../../../model/modules/production/acpointscalculation");
const DepartmentMonth = require("../../../model/modules/departmentmonthset");
const ProductionDay = require('../../../model/modules/production/productionday');
const DayPointsUploadTemp = require('../../../model/modules/production/daypointsuploadtemp');
const ProductionUpload = require('../../../model/modules/production/productionupload');
const ProducionIndividual = require('../../../model/modules/production/productionindividual');
const ProductionDayList = require('../../../model/modules/production/productiondaylist');
// get All ClientUserID Name => /api/clientuserids
exports.getAllDayPointsUpload = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload;
  try {
    daypointsupload = await DayPointsUpload.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!daypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});
//document preparation
exports.getDocumentPrepProductionDate = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload;
  const { user, date } = req.body
  try {
    const uplodedData = await DayPointsUpload.findOne({ date: date }, {});
    daypointsupload = uplodedData ?  uplodedData?.uploaddata?.filter(data => data?.name === user?.value &&
      data?.companyname === user?.company &&
      data?.branch === user?.branch &&
      data?.unit === user?.unit &&
      data?.team === user?.team
    ) : ""
 

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});

// get All ClientUserID Name => /api/clientuserids
exports.checkDayPointdate = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload;
  try {
    daypointsupload = await DayPointsUpload.find({ date: req.body.date }, { _id: 1 });
  } catch (err) {
    return next(new ErrorHandler("Data not found", 404));
  }
  if (!daypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});

// get All ClientUserID Name => /api/clientuserids
exports.getAllDayPointsUploadLimited = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload;
  try {
    daypointsupload = await DayPointsUpload.find({}, { filename: 1, date: 1, type: 1, addedby:1 }).sort({ date: -1 });
  } catch (err) {
    console.log(err.message);
  }
  if (!daypointsupload) {
    return next(new ErrorHandler('Day Points Upload not found!', 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});
exports.dayPointsMonthYearFilter = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload,answer;
  try {
    const { ismonth, isyear, } = req.body;

    const from_date = new Date(isyear, ismonth - 1, 1);

    // Calculate the last day of the previous month
    const last_day_prev_month = new Date(from_date.getFullYear(), from_date.getMonth(), 0);

    // Get the 15th day of the previous month
    const before_month_date = new Date(last_day_prev_month.getFullYear(), last_day_prev_month.getMonth(), 25);

    // Get the 15th day of the next month
    const next_month = new Date(from_date.getFullYear(), from_date.getMonth() + 1, 5);
    
    let fromdate = before_month_date.toISOString().split('T')[0];
    let todate = next_month.toISOString().split('T')[0];
    const conditions = [];

    if (fromdate && todate) {
      conditions.push({
        $and: [
          { $gte: [{ $toDate: "$$upload.date" }, { $toDate: fromdate }] },
          { $lte: [{ $toDate: "$$upload.date" }, { $toDate: todate }] }
        ]
      });
    }
  
    const cond = {
      $and: conditions,
    };
    
    daypointsupload = await DayPointsUpload.aggregate([
      {
        $project: {
          uploaddata: {
            $filter: {
              input: "$uploaddata",
              as: "upload",
              cond: cond,
            },
          },
        },
      },
    ]);
    

    answer = daypointsupload.flatMap((data) => data.uploaddata );

    

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!answer) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    answer,
  });

});
exports.dayPointsMonthYearFilterNxtMonth = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload, answer;
  try {
    const { ismonth, isyear } = req.body;

    const from_date = new Date(isyear, ismonth - 1, 1);

    // Calculate the last day of the previous month
    const last_day_prev_month = new Date(from_date.getFullYear(), from_date.getMonth(), 0);

    // Get the 15th day of the previous month
    const before_month_date = new Date(last_day_prev_month.getFullYear(), last_day_prev_month.getMonth(), 20);

    // Get the 15th day of the next month
    const next_month = new Date(from_date.getFullYear(), from_date.getMonth() + 1, 10);

    let fromdate = before_month_date.toISOString().split('T')[0];
    let todate = next_month.toISOString().split('T')[0];

    // console.log(fromdate,todate,ismonth,isyear,'todate')

    // const conditions = [];

    // if (fromdate && todate) {
    //   conditions.push({
    //     $and: [{ $gte: [{ $toDate: '$$upload.date' }, { $toDate: fromdate }] }, { $lte: [{ $toDate: '$$upload.date' }, { $toDate: todate }] }],
    //   });
    // }

    // const cond = {
    //   $and: conditions,
    // };
    let query = {}
    if (fromdate && todate) {
      query.date={ $gte:fromdate, $lte:todate}
    }
    console.log(fromdate,todate, 'fromdate,todate')

    daypointsupload = await DayPointsUploadTemp.find(query,{uploaddata:1});

    // daypointsupload = await DayPointsUploadTemp.aggregate([
    //   {
    //     $project: {
    //       uploaddata: {
    //         $filter: {
    //           input: '$uploaddata',
    //           as: 'upload',
    //           cond: cond,
    //         },
    //       },
    //     },
    //   },
    // ]);
    console.log(daypointsupload.length)
    answer = daypointsupload.flatMap((data) => data.uploaddata);
  } catch (err) {
    console.log(err.message, 'err');
  }
  if (!answer) {
    return next(new ErrorHandler('Day Points Upload not found!', 404));
  }
  return res.status(200).json({
    // count: products.length,
    answer,
  });
});
exports.dayPointsfilter = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload, minipoints, productionupload;
  try {
    const { fromdate, todate, less, greater, compare, betweenfrom, betweento, company, unit, team, branch, empnames } = req.body;
    let userQuery = {
      enquirystatus: {
        $nin: ['Enquiry Purpose'],
      },
       companyname: {$in:empnames},
      $or: [{ reasondate: { $exists: false } }, { reasondate: { $eq: '' } }, { reasondate: { $gte: todate } }],
    };

    const date = todate

    const [salSlabs, manageshortagemasters, revenueAmount, acPointCal,departments,usersAll] = await Promise.all([
      SalarySlabs.find({}, { company: 1, branch: 1, salarycode: 1, basic: 1, hra: 1, salaryslablimited: 1, medicalallowance: 1, conveyance: 1, productionallowance: 1, otherallowance: 1 }),
      ShortageMaster.find({}, { department: 1, from: 1, to: 1, amount: 1 }),
      RevenueAmount.find({}, { branch: 1, company: 1, processcode: 1, amount: 1 }),
      AcPointVal.find({}, { branch: 1, company: 1, department: 1, dividevalue: 1, multiplevalue: 1 }),
      Department.find({}, { deptname: 1, prod: 1 }),
      User.find(userQuery,{ department: 1, company: 1, branch: 1, unit: 1, team: 1, empcode: 1, companyname: 1, departmentlog: 1, doj: 1 }),
  ]);

  let users = usersAll.map((item) => {
    let findUserDepartment = item.department;
  
    // Handling department change with departmentlog
    if (item.departmentlog && item.departmentlog.length > 0) {
      if (item.departmentlog.length > 1) {
        // Sort department logs by startdate descending
        const sortedDepartmentLog = item.departmentlog.sort((a, b) => {
          // First, compare startdate
          const startDateComparison = new Date(b.startdate) - new Date(a.startdate);
          if (startDateComparison !== 0) {
            return startDateComparison;
          }

          // If startdate is the same, compare createdat
          return b.updateddatetime - a.updateddatetime;
        });

        // Find the relevant department change based on the 'date'
        const findDept =
          sortedDepartmentLog.length > 1 && sortedDepartmentLog.map((item) => item.department).includes('Internship')
            ? sortedDepartmentLog.filter((item) => item.department != 'Internship').find((dept) => new Date(date) >= new Date(dept.startdate))
            : sortedDepartmentLog.find((dept) => new Date(date) >= new Date(dept.startdate));
        findUserDepartment = findDept ? findDept.department : item.department;
      } else if (item.departmentlog.length === 1) {
        findUserDepartment = new Date(date) >= new Date(item.departmentlog[0].startdate) ? item.departmentlog[0].department : item.department;
      } else {
        findUserDepartment = item.department;
      }
    }
    return {
      ...item._doc,
      department: findUserDepartment,
    };
  });
    // console.log(users.length,'empnames',empnames)

    const conditions = [];

    if (fromdate && todate) {
      conditions.push({ $and: [{ $gte: ['$$upload.date', fromdate] }, { $lte: ['$$upload.date', todate] }] });
    }

    if (company && company.length > 0) {
      conditions.push({ $in: ['$$upload.companyname', company] });
    }

    if (branch && branch.length > 0) {
      conditions.push({ $in: ['$$upload.branch', branch] });
    }

    if (unit && unit.length > 0) {
      conditions.push({ $in: ['$$upload.unit', unit] });
    }

    if (team && team.length > 0) {
      conditions.push({ $in: ['$$upload.team', team] });
    }

    if (empnames && empnames.length > 0) {
      conditions.push({ $in: ['$$upload.name', empnames] });
    }

    const cond = {
      $and: conditions,
    };

    daypointsupload = await DayPointsUpload.aggregate([
      {
        $match:{
          date:{$gte:fromdate, $lte:todate}
        }
      },
      {
        $project: {
          uploaddata: {
            $filter: {
              input: '$uploaddata',
              as: 'upload',
              cond: cond,
            },
          },
        },
      },
    ]);
    // console.log(daypointsupload.length, daypointsupload[0],'daypointsupload')

    let answer = daypointsupload.flatMap((data) =>
      data.uploaddata.map((upload) => ({
        companyname: upload.companyname,
        name: upload.name,
        empcode: upload.empcode,
        branch: upload.branch,
        unit: upload.unit,
        team: upload.team,
        date: upload.date,
        target: upload.target,
        exper: upload.exper,
        point: upload.point,
        processcode: upload.processcode,
        avgpoint: upload.avgpoint,
        daystatus: upload.daypointsts,
        weekoff: upload.weekoff,
        id: upload._id,
        mainid: data._id,
      }))
    );

   
    const itemsWithSerialNumber = answer?.map((item, index) => {
   
      const findUserDepartment = users.find(d => d.companyname === item.name)?.department;
      const prodTrue = departments.find(data => data.deptname  === findUserDepartment)?.prod
    
      let findexpval = Number(item.exper) < 1 ? '00' : Number(item.exper) <= 9 ? `0${Number(item.exper)}` : item.exper;
      let processcodeexpvalue =`${item.processcode}${findexpval}`
      //findsalary from salaryslab
      let findSalDetails = salSlabs.find((d) => d.company === item.companyname && d.branch === item.branch && d.salarycode === processcodeexpvalue);
      //shortageamount from shortage master
      let findShortage = manageshortagemasters.find((d) => d.department === findUserDepartment && Number(item.exper) >= Number(d.from) && Number(item.exper) <= Number(d.to));
      //revenue amount from revenue  master
      let findRevenueAllow = revenueAmount.find((d) => d.company === item.companyname && d.branch === item.branch && d.processcode === processcodeexpvalue);

      let findAcPointVal = acPointCal.find((d) => d.company === item.companyname && d.branch === item.branch && d.department === findUserDepartment);

      // GROSS VALUE
      let grossValue = findSalDetails
          ? Number(findSalDetails.basic) + Number(findSalDetails.hra) + Number(findSalDetails.conveyance) + Number(findSalDetails.medicalallowance) + Number(findSalDetails.productionallowance) + Number(findSalDetails.otherallowance)
          : 0;

      let egvalue = Number(grossValue) + (findShortage ? Number(findShortage.amount) : 0);

      let hfvalue = egvalue - (findRevenueAllow ? Number(findRevenueAllow.amount) : 0);
      // let i60value = Number(hfvalue) / 60;
      // let j85value = (i60value * 8.5) / 27;
      let i60value = Number(hfvalue) / (findAcPointVal && Number(findAcPointVal.multiplevalue));
      let j85value = (i60value * (findAcPointVal && Number(findAcPointVal.dividevalue))) / 27;

      return {
        // assignExpLog: item.assignExpLog,
        branch: item.branch,
        department: findUserDepartment,
        empcode: item.empcode,
        name: item.name,
        point: item.point,
        companyname: item.companyname,
        // processlog: item.processlog,
         prod: prodTrue,
        // doj: item.doj,
        date: item.date,
        exper: item.exper,
        target: item.target,

        team: item.team,
        unit: item.unit,
        id: item.id,
        daystatus: item.daystatus,
        weekoff: item.weekoff,
        daypoint: Number(j85value),
      };
    });
  // console.log(itemsWithSerialNumber[0],'itemsWithSerialNumber')

    let belowMin = itemsWithSerialNumber.reduce((acc, current) => {
      const existingItemIndex = acc.findIndex(
        (item) =>
          item.name === current.name 
        // &&
        //   // && item.companyname === current.companyname
        //   item.branch === current.branch &&
        //   item.unit === current.unit &&
        //   item.team === current.team &&
        //   item.empcode === current.empcode
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        const existingItem = acc[existingItemIndex];

        existingItem.point += Number(current.point);
        existingItem.daypoint += Number(current.daypoint);
        existingItem.target +=  current.weekoff === "Week Off" || current.weekoff === "Not Allotted" || current.weekoff === "Not Allot" ? 0 : Number(current.target);
        existingItem.date.push(current.date);

        existingItem.avgpoint = (existingItem.point / existingItem.target) * 100;

        // Convert the dates array to Date objects
        const dateObjects = existingItem.date.map((date) => new Date(date));

        // Find the earliest (from) and latest (to) dates
        const fromDate = new Date(Math.min(...dateObjects));
        const toDate = new Date(Math.max(...dateObjects));

        // Format the dates as strings in "YYYY-MM-DD" format
        const formattedFromDate = fromDate.toISOString().split('T')[0];
        const formattedToDate = toDate.toISOString().split('T')[0];

        // Update start and end date
        existingItem.startDate = fromDate;
        existingItem.endDate = toDate;
        existingItem.targetsingle = Number(current.target);
      } else {
        // Add new item
        acc.push({
          companyname: current.companyname,
          name: current.name,
          daypoint: Number(current.daypoint),
          avgpoint: (Number(current.point) / Number(current.target)) * 100,
          point: Number(current.point),
          target: Number(current.target),
          _id: current.id,
          branch: current.branch,
          date: [current.date],
          unit: current.unit,
          team: current.team,
          empcode: current.empcode,
          doj: current.doj,
          department: current.department,
          exper: current.exper,
          targetsingle: current.target,
          prod: current.prod,
          startDate: current.date,
          endDate: current.date,
          daystatus: current.daystatus,
          weekoff: current.weekoff,
        });
      }
      return acc;
    }, []);

    if (compare == 'Below Minimum Points') {
      productionupload = belowMin.filter((item) => Number(item.daypoint) > Number(item.point) && item.prod === true);
    } else if (compare == 'Below Target Points') {
      productionupload = belowMin.filter((item) => Number(item.target) > Number(item.point) && item.prod === true);
    } else if (compare == 'Less than') {
      productionupload = belowMin.filter((item) => Number(item.avgpoint) < Number(less) && item.prod === true);
    } else if (compare == 'Greater than') {
      productionupload = belowMin.filter((item) => Number(item.avgpoint) > Number(greater) && item.prod === true);
    } else if (compare == 'Between') {
      productionupload = belowMin.filter((item) => Number(item.avgpoint) >= Number(betweenfrom) && Number(item.avgpoint) <= Number(betweento) && item.prod === true);
    } else {
      productionupload = belowMin.filter((item) => item.prod === true);
    }
    // console.log(productionupload.length, productionupload[0],'productionupload')
  } catch (err) {
    console.log(err,'err')
    return next(new ErrorHandler('Records not found!', 404));
    // return next(new ErrorHandler('Internal Server Error', 500));
  }
  if (!productionupload) {
    return next(new ErrorHandler('Day Points Upload not found!', 404));
  }
  return res.status(200).json(productionupload);
});
// get All ClientUserID Name => /api/clientuserids
exports.dayPointsDatasFetch = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload, minpoints, productionupload;
  try {
    const { fromdate, todate } = req.body;
    minpoints = await MinimumPoints.find({}, { name: 1, company: 1, branch: 1, unit: 1, team: 1, empcode: 1, month: 1, year: 1, daypoint: 1, department: 1 });
    departments = await Department.find({}, { deptname: 1, prod: 1 });
    users = await User.find({resonablestatus:{
      $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
    }}, { department: 1, company: 1, branch: 1, unit: 1, team: 1, empcode: 1, companyname: 1 });

    const conditions = [];

    if (fromdate && todate) {
      conditions.push({ $and: [{ $gte: ["$$upload.date", fromdate] }, { $lte: ["$$upload.date", todate] }] });
    }

    const cond = {
      $and: conditions,
    };

    daypointsupload = await DayPointsUpload.aggregate([
      {
        $project: {
          uploaddata: {
            $filter: {
              input: "$uploaddata",
              as: "upload",
              cond: cond,
            },
          },
        },
      },
    ]);

    let answer = daypointsupload.flatMap((data) =>
      data.uploaddata.map((upload) => ({
        companyname: upload.companyname,
        name: upload.name,
        empcode: upload.empcode,
        branch: upload.branch,
        unit: upload.unit,
        team: upload.team,
        date: upload.date,
        target: upload.target,
        point: upload.point,
        avgpoint: upload.avgpoint,
        id: upload._id,
        mainid: data._id,
      }))
    );

    const filteredArray = answer.map((obj1) => {
      const splitDate = obj1.date.split("-");
      const oldyear = splitDate[0];
      const oldmonth = splitDate[1];

      const matchingMinpoint = minpoints.find((obj2) => {
        return obj1.name === obj2.name && obj1.branch === obj2.branch && obj1.companyname === obj2.company && obj1.empcode === obj2.empcode && obj1.unit === obj2.unit && Number(oldmonth) === Number(obj2.month) && Number(oldyear) === Number(obj2.year) && obj1.team === obj2.team;
      });

      if (matchingMinpoint) {
        obj1.daypoint = matchingMinpoint.daypoint;
      }

      const matchingMinpointuser = users.find((obj2) => {
        return obj1.name === obj2.companyname && obj1.branch === obj2.branch && obj1.companyname === obj2.company && obj1.unit === obj2.unit && obj1.team === obj2.team;
      });

      if (matchingMinpointuser) {
        obj1.department = matchingMinpointuser.department;
      }

      const matchingMinpointdept = departments.find((obj2) => {
        return obj1.department === obj2.deptname;
      });

      if (matchingMinpointdept) {
        obj1.prod = matchingMinpointdept.prod;
      }

      return obj1;
    });

    productionuploads = filteredArray.reduce((acc, current) => {
      const existingItemIndex = acc.findIndex((item) => item.name === current.name && item.company === current.company && item.branch === current.branch && item.unit === current.unit && item.team === current.team && item.empcode === current.empcode);

      if (existingItemIndex !== -1) {
        // Update existing item
        const existingItem = acc[existingItemIndex];
        existingItem.daypoint += Number(current.daypoint);
        // existingItem.avgpoint += Number(current.avgpoint);
        existingItem.point += Number(current.point);
        existingItem.target += Number(current.target);
        existingItem.date.push(current.date);

        // Convert the dates array to Date objects
        const dateObjects = existingItem.date.map((date) => new Date(date));

        // Find the earliest (from) and latest (to) dates
        const fromDate = new Date(Math.min(...dateObjects));
        const toDate = new Date(Math.max(...dateObjects));

        // Format the dates as strings in "YYYY-MM-DD" format
        const formattedFromDate = fromDate.toISOString().split("T")[0];
        const formattedToDate = toDate.toISOString().split("T")[0];

        // Update start and end date
        existingItem.startDate = fromDate;
        existingItem.endDate = toDate;
        existingItem.avgpoint = (existingItem.point / existingItem.target) * 100;
      } else {
        // Add new item
        acc.push({
          companyname: current.companyname,
          name: current.name,
          daypoint: Number(current.daypoint),
          avgpoint: Number(current.avgpoint),
          point: Number(current.point),
          target: Number(current.target),
          date: [current.date], // Store date as an array
          _id: current.id,
          branch: current.branch,
          unit: current.unit,
          team: current.team,
          empcode: current.empcode,
          department: current.department,
          startDate: current.date, // Initial start date
          endDate: current.date, // Initial end date
        });
      }

      return acc;
    }, []);
    productionupload = productionuploads.filter((item) => item.prod === true);

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!productionupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    productionupload,
  });
})
// Create new DayPointsUpload=> /api/clientuserid/new
exports.addDayPointsUpload = catchAsyncErrors(async (req, res, next) => {
  let adaypointsupload = await DayPointsUpload.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle DayPointsUpload => /api/clientuserid/:id
exports.getSingleDayPointsUpload = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sdaypointsupload = await DayPointsUpload.findById(id);

  if (!sdaypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    sdaypointsupload,
  });
});

// update DayPointsUpload by id => /api/clientuserid/:id
exports.updateDayPointsUpload = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let udaypointsupload = await DayPointsUpload.findByIdAndUpdate(id, req.body);
  if (!udaypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

exports.updateDayPointsSingleUpload = catchAsyncErrors(
  async (req, res, next) => {
    const subid = req.params.id;
    req.body.id = subid;
    try {
      const uploaddata = await DayPointsUpload.findOneAndUpdate(
        { "uploaddata._id": subid },
        { $set: { "uploaddata.$": req.body } },
        { new: true }
      );

      if (uploaddata) {
        return res.status(200).json({ message: "Updated successfully" });
      } else {
        return next(new ErrorHandler("Something went wrong", 500));
      }
    } catch (err) {
      return next(new ErrorHandler("Internal Server Error", 500)); // Handle internal server error
    }
  }
);

// delete DayPointsUpload by id => /api/clientuserid/:id
exports.deleteDayPointsUpload = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let ddaypointsupload = await DayPointsUpload.findByIdAndRemove(id);

  if (!ddaypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});
// get All ClientUserID Name => /api/clientuserids
// get All ClientUserID Name => /api/clientuserids
exports.getEmployeeProductionLastThreeMonths = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload = [],
    productiondaylists,
    productions,
    productionsManual;
  try {
    const { empname, department } = req.body;

    let dateNow = new Date();
    let datevalue = dateNow.toISOString().split('T')[0];
    // console.log(datevalue, 'datevalue');
    // Extract the full month name and year
    const curr_monthName = dateNow.toLocaleString('en-US', { month: 'long' }); // Example: "December"
    const curr_year = dateNow.getFullYear();

    const findCurrdeptMonthSets = await DepartmentMonth.findOne(
      {
        fromdate: { $lte: datevalue },
        todate: { $gte: datevalue },
        year: dateNow.getFullYear(),
        department: department,
      },
      { monthname: 1, year: 1, fromdate: 1, todate: 1 }
    );

    let currMonthYear = findCurrdeptMonthSets ? findCurrdeptMonthSets : { monthname: curr_monthName, year: String(curr_year) };
    // console.log(currMonthYear, findCurrdeptMonthSets, 'currMonthYear');
    // Function to get previous months
    const getPreviousMonths = (currentMonth, currentYear, monthsBack) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      let monthIndex = months.indexOf(currentMonth);
      let previousMonths = [];

      for (let i = 1; i <= monthsBack; i++) {
        monthIndex -= 1;

        if (monthIndex < 0) {
          monthIndex = 11; // wrap around to December
          currentYear -= 1; // go back a year
        }
        previousMonths.push({ monthname: months[monthIndex], year: currentYear });
      }

      return previousMonths;
    };

    let currMonthFromdate = findCurrdeptMonthSets ? findCurrdeptMonthSets.fromdate : '';
    let currMonthTodate = findCurrdeptMonthSets ? findCurrdeptMonthSets.todate : '';
    // console.log(currMonthFromdate, currMonthTodate, findCurrdeptMonthSets, 'dfsd');
    // Get the three previous months
    const previousMonths = getPreviousMonths(currMonthYear.monthname, currMonthYear.year, 3);

    let query = {
      // $or: previousMonths,
      $or: [...previousMonths, { monthname: currMonthYear.monthname, year: currMonthYear.year }],
      department: department,
    };

    const lastThreedeptMonthSets = await DepartmentMonth.find(query, { _id: 0, fromdate: 1, todate: 1 });

    let finalFromToDate = lastThreedeptMonthSets.sort((a, b) => new Date(a.fromdate) - new Date(b.fromdate));

    const result = {
      fromdate: finalFromToDate[0].fromdate,
      // todate: finalFromToDate[finalFromToDate.length - 1].todate
      todate: datevalue,
    };

    let productionDayid = await ProductionDay.find({ date: { $gte: currMonthFromdate, $lte: currMonthTodate } }, { uniqueid: 1, _id: 0 });
    let LastProductionDayDate = await ProductionDay.findOne({}, { date: 1, _id: 0 }).sort({ date: -1 });

    let productionUniqIds = productionDayid.map((item) => item.uniqueid);
    // console.log(productionUniqIds, 'productionUniqIds');
    const prodquery = {
      user: { $in: productionUniqIds },
      fromdate: { $gte: currMonthFromdate, $lte: currMonthTodate },
    };

    const prodqueryManual = {
      user: { $in: productionUniqIds },
      status: 'Approved',
      fromdate: { $gte: currMonthFromdate, $lte: currMonthTodate },
    };

    const [productionsAll, productionsManualAll, productiondaylistsAll, daypointsupload] = await Promise.all([
      ProductionUpload.find(prodquery, { filename: 1, dateval: 1, user: 1 }).lean(),
      ProducionIndividual.find(prodqueryManual, { filename: 1, fromdate: 1, time: 1, user: 1, mode: 1 }).lean(),
      ProductionDayList.find({ uniqueid: { $in: productionUniqIds }, empname: empname }, {}),
      DayPointsUpload.find({ date: { $gte: result.fromdate, $lte: result.todate } }, { uploaddata: 1, date: 1 }),
    ]);
    productiondaylists = productiondaylistsAll;
    productions = productionsAll;
    productionsManual = productionsManualAll;
    // console.log(result, 'finalFromToDate');
    return res.status(200).json({
      // count: products.length,
      daypointsupload,
      finalFromToDate,
      query,
      result,
      productiondaylists,
      productions,
      productionsManual,
      lastprodcreateddate: LastProductionDayDate.date,
    });
  } catch (err) {
    console.log(err, 'hdfg');
  }
});

exports.getEmployeeProductionDayListLastThreeMonths = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload = [],
    productiondaylists,
    productions,
    productionsManual;
  try {
    const { empname, department } = req.body;
    // console.log(req.body, 'req.body');
    let dateNow = new Date();
    let datevalue = dateNow.toISOString().split('T')[0];
    // console.log(datevalue, 'datevalue');
    // Extract the full month name and year
    const curr_monthName = dateNow.toLocaleString('en-US', { month: 'long' }); // Example: "December"
    const curr_year = dateNow.getFullYear();

    const findCurrdeptMonthSets = await DepartmentMonth.findOne(
      {
        fromdate: { $lte: datevalue },
        todate: { $gte: datevalue },
        year: String(dateNow.getFullYear()),
        department: department,
      },
      { monthname: 1, year: 1, fromdate: 1, todate: 1 }
    );

    let currMonthYear = findCurrdeptMonthSets ? findCurrdeptMonthSets : { monthname: curr_monthName, year: String(curr_year) };

    // Function to get previous months
    const getPreviousMonths = (currentMonth, currentYear, monthsBack) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      let monthIndex = months.indexOf(currentMonth);
      let previousMonths = [];

      for (let i = 1; i <= monthsBack; i++) {
        monthIndex -= 1;

        if (monthIndex < 0) {
          monthIndex = 11; // wrap around to December
          currentYear -= 1; // go back a year
        }
        previousMonths.push({ monthname: months[monthIndex], year: currentYear });
      }

      return previousMonths;
    };

    let currMonthFromdate = findCurrdeptMonthSets ? findCurrdeptMonthSets.fromdate : '';
    let currMonthTodate = findCurrdeptMonthSets ? findCurrdeptMonthSets.todate : '';
    // console.log(currMonthFromdate, currMonthTodate, findCurrdeptMonthSets, 'dfsd');
    // Get the three previous months
    const previousMonths = getPreviousMonths(currMonthYear?.monthname, currMonthYear?.year, 3);
    console.log(previousMonths, 'previousMonths');
    let query = {
      // $or: previousMonths,
      $or: [...previousMonths, { monthname: currMonthYear.monthname, year: currMonthYear.year }],
      department: department,
    };

    const lastThreedeptMonthSets = await DepartmentMonth.find(query, { _id: 0, fromdate: 1, todate: 1 });

    let finalFromToDate = lastThreedeptMonthSets.sort((a, b) => new Date(a.fromdate) - new Date(b.fromdate));

    const result = {
      fromdate: finalFromToDate[0]?.fromdate,
      // todate: finalFromToDate[finalFromToDate.length - 1].todate
      todate: datevalue,
    };
console.log(currMonthFromdate,currMonthTodate,'currMonthTodate')
    let productionDayid = await ProductionDay.find({ date: { $gte: currMonthFromdate, $lte: currMonthTodate } }, { uniqueid: 1, _id: 0 });
    let LastProductionDayDate = await ProductionDay.findOne({}, { date: 1, _id: 0 }).sort({ date: -1 });

    let productionUniqIds = productionDayid.map((item) => item.uniqueid);
    console.log({ uniqueid: { $in: productionUniqIds }, empname: empname });
    
    
    // console.log(productionUniqIds, 'productionUniqIds');
    // const prodquery = {
    //   user: { $in: productionUniqIds },
    //   fromdate: { $gte: currMonthFromdate, $lte: currMonthTodate },
    // };

    // const prodqueryManual = {
    //   user: { $in: productionUniqIds },
    //   status: 'Approved',
    //   fromdate: { $gte: currMonthFromdate, $lte: currMonthTodate },
    // };
    // console.log({ uniqueid: { $in: productionUniqIds }, empname: empname });

    const pipeline = [
      {
        // Match documents where the date is within the specified range
        $match: {
          date: {
            $gte: result.fromdate,
            $lte: result.todate,
          },
        },
      },
      {
        // Filter the uploaddata array to include only the specified employee name
        $project: {
          date: 1,
          uploaddata: {
            $filter: {
              input: '$uploaddata',
              as: 'data',
              cond: { $eq: ['$$data.name', empname] }, // Replace "user1" with your desired empname
            },
          },
        },
      },
      {
        // Remove entries where uploaddata becomes empty after filtering
        $match: {
          'uploaddata.0': { $exists: true },
        },
      },
    ];

    const [
      // productionsAll, productionsManualAll,
      productiondaylistsAll,
      daypointsupload,
    ] = await Promise.all([
      // ProductionUpload.find(prodquery, { filename: 1, dateval: 1, user: 1 }).lean(),
      // ProducionIndividual.find(prodqueryManual, { filename: 1, fromdate: 1, time: 1, user: 1, mode: 1 }).lean(),
      ProductionDayList.find({ uniqueid: { $in: productionUniqIds }, empname: empname }, {}),
      DayPointsUpload.aggregate(pipeline),
    ]);
    productiondaylists = productiondaylistsAll;
    // productions = productionsAll;
    // productionsManual = productionsManualAll;
    // console.log(result, 'finalFromToDate');
    return res.status(200).json({
      // count: products.length,
      daypointsupload,
      finalFromToDate,
      query,
      result,
      productiondaylists,
      // productions,
      // productionsManual,
      lastprodcreateddate: LastProductionDayDate.date,
    });
  } catch (err) {
    console.log(err, 'hdfg');
  }
});

exports.getAllDayPointsUploadLimitedDateOnly = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload;
  try {
    daypointsupload = await DayPointsUpload.find({}, { date: 1 });
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!daypointsupload) {
    return next(new ErrorHandler('Day Points Upload not found!', 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});

exports.getAllDayPointsUploadLimitedDateOnly = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload;
  try {
    daypointsupload = await DayPointsUpload.find({}, { date: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!daypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});



exports.getDayPointIdByDate = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload;
  try {

    daypointsupload = await DayPointsUpload.findOne({ date: req.body.date }, { _id: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!daypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});

exports.getCheckDaypointIsCreated = catchAsyncErrors(async (req, res, next) => {
  let count;
  try {
    count = await DayPointsUpload.countDocuments({ date: req.body.date });
    let count1 = await ProductionDay.countDocuments({ date: req.body.date, filestatus:"Final" });

    count  = count1 > 0  ?count : 0
    console.log(count, 'test');
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  } return res.status(200).json({
    count,
  });
});

exports.getProdDateUsingDayPoints = catchAsyncErrors(async (req, res, next) => {
  let daypoints, produniqids;
  try {

    let dateoneafter = new Date(req.body.fromdate);
    dateoneafter.setDate(dateoneafter.getDate() + 1);
    let newDateOnePlus = dateoneafter.toISOString().split("T")[0];

    let datebefore = new Date(req.body.fromdate);
    datebefore.setDate(datebefore.getDate() - 1);
    let newDateOneMinus = datebefore.toISOString().split("T")[0];

    // count = await DayPointsUpload.countDocuments({ date: req.body.date });
    daypoints = await DayPointsUpload.aggregate([
      {
        $match: { date: { $in: [req.body.fromdate, newDateOnePlus, newDateOneMinus] } }
      },
      {
        $project: {
          uploaddata: {
            $map: {
              input: "$uploaddata",
              as: "item",
              in: {
                date: "$$item.date",
                fromtodate: "$$item.fromtodate",
                users: "$$item.users"
              }
            }
          }
        }
      }
    ]);
    produniqids = await ProductionDay.find({ date: { $in: [req.body.fromdate, newDateOneMinus, newDateOnePlus] } }, { date: 1, _id: 0 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  } return res.status(200).json({
    daypoints, produniqids
  });
});

exports.dayPointsfilterHome = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload, minipoints, productionupload;
  try {
    const { fromdate, todate, compare, } = req.body;
    // minpoints = await MinimumPoints.find({}, { name: 1, company: 1, branch: 1, unit: 1, team: 1, empcode: 1, month: 1, year: 1, daypoint: 1, department: 1 });
    let departments = await Department.find({}, { deptname: 1, prod: 1 });
    let users = await User.find({
      resonablestatus: {
        $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
      }
    }, { department: 1, company: 1, branch: 1, unit: 1, team: 1, empcode: 1, companyname: 1, assignExpLog: 1, processlog: 1, doj: 1 });
    let salSlabs = await SalarySlabs.find({}, { company: 1, branch: 1, salarycode: 1, basic: 1, hra: 1, salaryslablimited: 1, medicalallowance: 1, conveyance: 1, productionallowance: 1, otherallowance: 1 });
    let manageshortagemasters = await ShortageMaster.find({}, { department: 1, from: 1, to: 1, amount: 1 });
    let revenueAmount = await RevenueAmount.find({}, { branch: 1, company: 1, processcode: 1, amount: 1 });
    let acPointCal = await AcPointVal.find({}, { branch: 1, company: 1, department: 1, dividevalue: 1, multiplevalue: 1 });

    const conditions = [];

    if (fromdate && todate) {
      conditions.push({ $and: [{ $gte: ["$$upload.date", fromdate] }, { $lte: ["$$upload.date", todate] }] });
    }


    const cond = {
      $and: conditions,
    };

    daypointsupload = await DayPointsUpload.aggregate([
      {
        $project: {
          uploaddata: {
            $filter: {
              input: "$uploaddata",
              as: "upload",
              cond: cond,
            },
          },
        },
      },
    ]);

    let answer = daypointsupload.flatMap((data) =>
      data.uploaddata.map((upload) => ({
        companyname: upload.companyname,
        name: upload.name,
        empcode: upload.empcode,
        branch: upload.branch,
        unit: upload.unit,
        team: upload.team,
        date: upload.date,
        target: upload.target,
        point: upload.point,
        avgpoint: upload.avgpoint,
        id: upload._id,
        mainid: data._id,
      }))
    );

    const filteredArray = answer.map((obj1) => {
      const splitDate = obj1.date.split("-");
      const oldyear = splitDate[0];
      const oldmonth = splitDate[1];

     

      const matchingMinpointuser = users.find((obj2) => {
        return (
          obj1.name === obj2.companyname &&
          obj1.branch === obj2.branch &&
          // obj1.companyname === obj2.company
          //  && obj1.empcode === obj2.empcode
          // &&
          obj1.unit === obj2.unit &&
          obj1.team === obj2.team
        );
      });

      if (matchingMinpointuser) {
        obj1.department = matchingMinpointuser.department;
        obj1.assignExpLog = matchingMinpointuser.assignExpLog;
        obj1.processlog = matchingMinpointuser.processlog;
        obj1.doj = matchingMinpointuser.doj;
      }

      const matchingMinpointdept = departments.find((obj2) => {
        return obj1.department === obj2.deptname;
      });

      if (matchingMinpointdept) {
        obj1.prod = matchingMinpointdept.prod;
      }

      return obj1;
    });
    const itemsWithSerialNumber = filteredArray?.map((item, index) => {
      const groupedByMonth = {};
      // Group items by month
      item.assignExpLog &&
        item.assignExpLog.forEach((d) => {
          const monthYear = d.updatedate.split("-").slice(0, 2).join("-");
          if (!groupedByMonth[monthYear]) {
            groupedByMonth[monthYear] = [];
          }
          groupedByMonth[monthYear].push(d);
        });

      // Extract the last item of each group
      const lastItemsForEachMonth = Object.values(groupedByMonth).map((group) => group[group.length - 1]);

      // Filter the data array based on the month and year
      lastItemsForEachMonth.sort((a, b) => {
        return new Date(a.updatedate) - new Date(b.updatedate);
      });

      // Find the first item in the sorted array that meets the criteria
      let filteredDataMonth = null;
      for (let i = 0; i < lastItemsForEachMonth.length; i++) {
        const date = lastItemsForEachMonth[i].updatedate;

        if (item.date >= date) {
          filteredDataMonth = lastItemsForEachMonth[i];
        }

        else {
          break;
        }
      }
      // let modevalue = item.assignExpLog[item.assignExpLog.length - 1];
      let modevalue = filteredDataMonth;

      // Calculate difference in months between findDate and item.doj

      let differenceInMonths, differenceInMonthsexp, differenceInMonthstar;
      if (modevalue) {
        //findexp end difference yes/no
        if (modevalue.endexp === "Yes") {
          differenceInMonthsexp = Math.floor((new Date(modevalue.endexpdate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
          if (modevalue.expmode === "Add") {
            differenceInMonthsexp += parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Minus") {
            differenceInMonthsexp -= parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Fix") {
            differenceInMonthsexp = parseInt(modevalue.expval);
          }
        } else {
          differenceInMonthsexp = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
          if (modevalue.expmode === "Add") {
            differenceInMonthsexp += parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Minus") {
            differenceInMonthsexp -= parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Fix") {
            differenceInMonthsexp = parseInt(modevalue.expval);
          } else {
            // differenceInMonths = parseInt(modevalue.expval);
            differenceInMonthsexp = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
          }
        }

        //findtar end difference yes/no
        if (modevalue.endtar === "Yes") {
          differenceInMonthstar = Math.floor((new Date(modevalue.endtardate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
          if (modevalue.expmode === "Add") {
            differenceInMonthstar += parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Minus") {
            differenceInMonthstar -= parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Fix") {
            differenceInMonthstar = parseInt(modevalue.expval);
          }
        } else {
          differenceInMonthstar = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
          if (modevalue.expmode === "Add") {
            differenceInMonthstar += parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Minus") {
            differenceInMonthstar -= parseInt(modevalue.expval);
          } else if (modevalue.expmode === "Fix") {
            differenceInMonthstar = parseInt(modevalue.expval);
          } else {
            // differenceInMonths = parseInt(modevalue.expval);
            differenceInMonthstar = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
          }
        }

        differenceInMonths = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
        if (modevalue.expmode === "Add") {
          differenceInMonths += parseInt(modevalue.expval);
        } else if (modevalue.expmode === "Minus") {
          differenceInMonths -= parseInt(modevalue.expval);
        } else if (modevalue.expmode === "Fix") {
          differenceInMonths = parseInt(modevalue.expval);
        } else {
          // differenceInMonths = parseInt(modevalue.expval);
          differenceInMonths = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
        }
      } else {
        differenceInMonthsexp = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
        differenceInMonthstar = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
        differenceInMonths = Math.floor((new Date(item.date) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
      }

      const groupedByMonthProcs = {};

      // Group items by month
      item.processlog &&
        item.processlog.forEach((d) => {
          const monthYear = d.date.split("-").slice(0, 2).join("-");
          if (!groupedByMonthProcs[monthYear]) {
            groupedByMonthProcs[monthYear] = [];
          }
          groupedByMonthProcs[monthYear].push(d);
        });

      // Extract the last item of each group
      const lastItemsForEachMonthPros = Object.values(groupedByMonthProcs).map((group) => group[group.length - 1]);

      // Filter the data array based on the month and year
      lastItemsForEachMonthPros.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      // Find the first item in the sorted array that meets the criteria
      let filteredItem = null;

      for (let i = 0; i < lastItemsForEachMonthPros.length; i++) {
        const date = lastItemsForEachMonthPros[i].date;
       
        if (item.date >= date) {
          filteredItem = lastItemsForEachMonthPros[i];
        }
       
        else {
          break;
        }
      }

      let getprocessCode = filteredItem ? filteredItem.process : "";

      // let procCodecheck = item.doj ? getprocessCode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : 0) : "";
      let processcodeexpvalue = item.doj && modevalue && modevalue.expmode == "Manual" ? modevalue.salarycode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : "00") : item.doj ? getprocessCode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : "00") : "";
      //findsalary from salaryslab
      let findSalDetails = salSlabs.find((d) => d.company === item.companyname && d.branch === item.branch && d.salarycode === processcodeexpvalue);
      //shortageamount from shortage master
      let findShortage = manageshortagemasters.find((d) => d.department === item.department && differenceInMonths >= Number(d.from) && differenceInMonths <= Number(d.to));
      //revenue amount from revenue  master
      let findRevenueAllow = revenueAmount.find((d) => d.company === item.companyname && d.branch === item.branch && d.processcode === processcodeexpvalue);

      let findAcPointVal = acPointCal.find((d) => d.company === item.companyname && d.branch === item.branch && d.department === item.department);

      // GROSS VALUE
      let grossValue = modevalue && modevalue.expmode == "Manual" ? modevalue.gross : findSalDetails ? Number(findSalDetails.basic) + Number(findSalDetails.hra) + Number(findSalDetails.conveyance) + Number(findSalDetails.medicalallowance) + Number(findSalDetails.productionallowance) + Number(findSalDetails.otherallowance) : "";

      let egvalue = Number(grossValue) + (findShortage ? Number(findShortage.amount) : 0);

      let hfvalue = egvalue - (findRevenueAllow ? Number(findRevenueAllow.amount) : 0);
      // let i60value = Number(hfvalue) / 60;
      // let j85value = (i60value * 8.5) / 27;
      let i60value = Number(hfvalue) / (findAcPointVal && Number(findAcPointVal.multiplevalue));
      let j85value = (i60value * (findAcPointVal && Number(findAcPointVal.dividevalue)) / 27);

      return {
        assignExpLog: item.assignExpLog,
        branch: item.branch,
        department: item.department,
        empcode: item.empcode,
        name: item.name,
        point: item.point,
        companyname: item.companyname,
        processlog: item.processlog,
        prod: item.prod,
        doj: item.doj,
        date: item.date,
        target: item.target,
        team: item.team,
        unit: item.unit,
        id: item.id,
        daypoint: Number(j85value),
      };
    });
    // let filtereary = filteredArray.map(item => item[0])
    let belowMin = itemsWithSerialNumber.reduce((acc, current) => {
      const existingItemIndex = acc.findIndex(
        (item) =>
          item.name === current.name &&
          // && item.companyname === current.companyname
          item.branch === current.branch &&
          item.unit === current.unit &&
          item.team === current.team &&
          item.empcode === current.empcode
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        const existingItem = acc[existingItemIndex];

        existingItem.point += Number(current.point);
        existingItem.daypoint += Number(current.daypoint);
        existingItem.target += Number(current.target);
        existingItem.date.push(current.date);

        existingItem.avgpoint = (existingItem.point / existingItem.target) * 100;

        // Convert the dates array to Date objects
        const dateObjects = existingItem.date.map((date) => new Date(date));

        // Find the earliest (from) and latest (to) dates
        const fromDate = new Date(Math.min(...dateObjects));
        const toDate = new Date(Math.max(...dateObjects));

        // Format the dates as strings in "YYYY-MM-DD" format
        const formattedFromDate = fromDate.toISOString().split("T")[0];
        const formattedToDate = toDate.toISOString().split("T")[0];

        // Update start and end date
        existingItem.startDate = fromDate;
        existingItem.endDate = toDate;
      } else {
        // Add new item
        acc.push({
          companyname: current.companyname,
          name: current.name,
          daypoint: Number(current.daypoint),
          avgpoint: (Number(current.point) / Number(current.target)) * 100,
          point: Number(current.point),
          target: Number(current.target),
          _id: current.id,
          branch: current.branch,
          date: [current.date],
          unit: current.unit,
          team: current.team,
          empcode: current.empcode,
          doj: current.doj,
          department: current.department,
          prod: current.prod,
          startDate: current.date,
          endDate: current.date,
        });
      }
      return acc;
    }, []);

    if (compare == "Below Minimum Points") {
      productionupload = belowMin.filter((item) => Number(item.daypoint) > Number(item.point) && item.prod === true);
    } else if (compare == "Below Target Points") {
      productionupload = belowMin.filter((item) => Number(item.target) > Number(item.point) && item.prod === true);
    } else if (compare == "Less than") {
      productionupload = belowMin.filter((item) => Number(item.avgpoint) < Number(less) && item.prod === true);
    } else if (compare == "Greater than") {
      productionupload = belowMin.filter((item) => Number(item.avgpoint) > Number(greater) && item.prod === true);
    } else if (compare == "Between") {
      productionupload = belowMin.filter((item) => Number(item.avgpoint) >= Number(betweenfrom) && Number(item.avgpoint) <= Number(betweento) && item.prod === true);
    } else {
      productionupload = belowMin.filter((item) => item.prod === true);
    }
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!productionupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json(productionupload);
});

// get All ProductionDay => /api/productiondayss
exports.dayPointDeleteByDate = catchAsyncErrors(async (req, res, next) => {
  let count;
  try {
    count = await DayPointsUpload.deleteMany({ date: req.body.date });

  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({
    count,
  });
});

// get All ProductionDay => /api/productiondayss
exports.checkLastDayPointOrg = catchAsyncErrors(async (req, res, next) => {
  let count;
  try {

    count = await DayPointsUpload.countDocuments({ date: req.body.date });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({
    count,
  });
});

exports.getAllDayPointByDate = catchAsyncErrors(async (req, res, next) => {
  let daypointsupload, productionconsolidated;
  try {


    let daypointsuploadall = await DayPointsUpload.find({ date: { $gte: req.body.fromdate, $lte: req.body.todate } }, { uploaddata: 1 });


    daypointsupload = daypointsuploadall.map(data => data.uploaddata).flat()
      .reduce((acc, current) => {
        const existingItemIndex = acc.findIndex(
          (item) => item.name === current.name 
          //&& item.companyname === current.companyname && item.branch === current.branch &&
        //    item.unit === current.unit && item.team === current.team &&
        //    item.empcode === current.empcode
        );

        const allowpoint = (current.conshiftpoints) && current.shiftsts == "Enable" ? Number(current.conshiftpoints) : current.allowancepoint ? Number(current.allowancepoint) : 0


        if (existingItemIndex !== -1) {
          // Update existing item
          const existingItem = acc[existingItemIndex];

          existingItem.point += Number(current.point);
          existingItem.manual += Number(current.manual);
          existingItem.target += current.daypointsts != "WEEKOFF" ? Number(current.target) : 0;
          existingItem.date.push(current.date);
          existingItem.production += Number(current.production);
          existingItem.allowancepoint += allowpoint;



          existingItem.noallowancepoint = Number(existingItem.point - existingItem.allowancepoint)


          existingItem.avgpoint = existingItem.target > 0 ? (existingItem.point / existingItem.target) * 100 : 0;

          // Convert the dates array to Date objects
          const dateObjects = existingItem.date.map((date) => new Date(date));

          // Find the earliest (from) and latest (to) dates
          const fromDate = new Date(Math.min(...dateObjects));
          const toDate = new Date(Math.max(...dateObjects));
          // Update start and end date
          existingItem.startDate = fromDate;
          existingItem.endDate = toDate;
        } else {
          // Add new item
          acc.push({
            ...current._doc,
            companyname: current.companyname,
            manual: Number(current.manual),
            avgpoint: ((Number(current.point) / Number(current.target)) * 100),
            point: Number(current.point),
            target: Number(current.target),
            _id: current.id,
            exper: Number(current.exper),
            branch: current.branch,
            date: [current.date],
            unit: current.unit,
            team: current.team,
            empcode: current.empcode,
            weekoff: current.daypointstatus,
            // doj: current.doj,
            // department: current.department,
            production: Number(Number(current.production).toFixed(2)),
            startDate: current.date,
            endDate: current.date,
            allowancepoint: allowpoint,
            // noallowancepoint:Number(current.noallowancepoint),
            noallowancepoint: (Number(current.point) - Number(allowpoint))
          });
        }
        return acc;
      }, []);



    // console.log(daypointsupload[0])


  } catch (err) {
    console.log(err, "daypointsupload")
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!daypointsupload) {
    return next(new ErrorHandler("Day Points Upload not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    daypointsupload,
  });
});


exports.getAllProductionsByUserForCurrMonthView = catchAsyncErrors(async (req, res, next) => {
  let productiondaylists = [],
    productiondaylistsManual = [];
  try {
    const { fromtodate, filename, mode, user } = req.body;

    const [firstDate, secondDate] = fromtodate.split('$');
    const [fromDateonly, fromTime] = firstDate.split('T');
    const [toDateonly, toTime] = secondDate.split('T');

    const uploadfromdate = `${fromDateonly}T${fromTime.split('.000Z')[0]}`;
    const uploadtodate = `${toDateonly}T${toTime.split('.000Z')[0]}`;

    if (mode === 'Production') {
      productiondaylists = await ProductionUpload.find(
        { dateobjformatdate: { $gte: uploadfromdate, $lte: uploadtodate }, filenameupdated: filename, user: user, dupe: 'No' },
        {
          project: 1,
          category: 1,
          filenameupdated: 1,
          fromtodate: 1,
          user: 1,
          unitid: 1,
          unitrate: 1,
          dateval: 1,
          vendor: 1,
          points: 1,
          flagcount: 1,
          section: 1,
        }
      );
    }
 
    if (mode === 'Manual') {
      productiondaylistsManual = await ProducionIndividual.find(
        { fromdate: { $gte: fromDateonly, $lte: toDateonly }, filename: filename, user: user, status: 'Approved' },
        {
          project: 1,
          category: 1,
          filename: 1,
          fromtodate: 1,
          user: 1,
          unitid: 1,
          unitrate: 1,
          fromdate: 1,
          time: 1,
          vendor: 1,
          points: 1,
          mode: 1,
          flagcount: 1,
          section: 1,
        }
      );
    }
  } catch (err) {
    console.log(err.message);
  }

  return res.status(200).json({
    // count: products.length,
    productiondaylists,
    productiondaylistsManual,
  });
});

// get All ProductionDay => /api/productiondayss
exports.productionDayPointLast = catchAsyncErrors(async (req, res, next) => {
  let productionupload;
  try {
    let datebefore = new Date(req.body.date);
    datebefore.setDate(datebefore.getDate() - 1);
    let newDateOneMinus = datebefore.toISOString().split('T')[0];

    productionupload = await DayPointsUpload.countDocuments({ date: newDateOneMinus });
    console.log(productionupload, newDateOneMinus, 'productiontempDAYpointlast');
  } catch (err) {
    console.log(err.message);
  }
  return res.status(200).json({
    productionupload,
  });
});


// delete ProductionDay by unid matching unitidval => /api/productiondays/:unitidval
exports.dayPointDeleteByDateOrg = catchAsyncErrors(async (req, res, next) => {
  // Delete documents with matching unid
  let result = await DayPointsUpload.deleteMany({ date: req.body.date });

  // Check if any documents were deleted
  // if (result.deletedCount === 0) {
  //   return next(new ErrorHandler('Data not found!', 404));
  // }

  return res.status(200).json({ message: 'Deleted successfully' });
});
