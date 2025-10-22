const Attandance = require("../../../model/modules/attendance/attendance");
// const Workinghours = require('../../model/modules/assignworkinghours');
const moment = require("moment");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const User = require("../../../model/login/auth");
const Hirerarchi = require("../../../model/modules/setup/hierarchy");

const currentTime = new Date().toLocaleTimeString();
const currentDate = new Date();
var dd = String(currentDate.getDate()).padStart(2, "0");
var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
var yyyy = currentDate.getFullYear();

today = dd + "-" + mm + "-" + yyyy;

exports.getAttWithUserId = catchAsyncErrors(async (req, res, next) => {
  let attandances;

  try {
    attandances = await Attandance.find({ userid: req.body.userid });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    attandances,
  });
});
exports.getUserAttInv = catchAsyncErrors(async (req, res, next) => {
  let attandances = {};

  try {
    attandances = await Attandance.findOne({ userid: req.body.userid, date:today });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    attandances,
  });
});
// get All Attandance => /api/attandances
exports.getAllAttandance = catchAsyncErrors(async (req, res, next) => {
  let attandances;

  try {
    attandances = await Attandance.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    attandances,
  });
});
// get All Attandance => /api/attandances
exports.getIndUserAttandance = catchAsyncErrors(async (req, res, next) => {
  let attandances = {};

    attandances = await Attandance.findOne({date:req.body.date, userid:req.body.userid});

  return res.status(200).json({
    attandances,
  });
});
// var today = new Date();
// var dd = String(today.getDate()).padStart(2, '0');
// var mm = String(today.getMonth() + 1).padStart(2, '0');
// var yyyy = today.getFullYear();

// today = dd + '-' + mm + '-' + yyyy;

exports.getAllAttandanceClockout = catchAsyncErrors(async (req, res, next) => {
  let attendancesmixed, attandances, shifts;

  try {
    attandances = await Attandance.find({ clockouttime: "" });
    shifts = await Shift.find();
    attendancesmixed = attandances.map(attendance => {
      const shiftInfo = shifts.find(shift => shift.name === attendance.shiftname);
      return {
        username: attendance.username, clockintime: attendance.clockintime,
        clockouttime: attendance.clockouttime, buttonstatus: attendance.buttonstatus,
        date: attendance.date, clockinipaddress: attendance.clockinipaddress,
        userid: attendance.userid, status: attendance.status, shiftname: attendance.shiftname,
        endtime: shiftInfo ? `${shiftInfo.tohour}:${shiftInfo.tomin}:00 ${shiftInfo.totime}` : null
      };
    });



  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    attendancesmixed
  });
});

// get All Attandance with statsu true=> /api/attandancesstatus
exports.getAllAttandanceStstus = catchAsyncErrors(async (req, res, next) => {
  let attstatus;

  try {
    attstatus = await Attandance.find({status:true});
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attstatus) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    attstatus,
  });
});

//get all data for the filteringwise status (attendance report page)
exports.getAlldataFilter = catchAsyncErrors(async (req, res, next) => {
  let attandances;
  let attstatus;

  try {
    attandances = await Attandance.find();
    attstatus = attandances.filter((data, index) => {
      const itemMonth = parseInt(data.date.split("-")[1], 10);
      const itemYear = parseInt(data.date.split("-")[2], 10);
      if (req.body.username == "") {
        return itemMonth === req.body.selectedMonth && itemYear === req.body.selectedYear;
      } else {
        return itemMonth === req.body.selectedMonth && itemYear === req.body.selectedYear && req.body.username === data.username;
      }
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    attstatus,
  });
});


exports.getUserIdAttendance = catchAsyncErrors(async (req, res, next) => {
  //working
  let attandances;
  let attstatus;
  // Get today's date
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();

  var todayDate = dd + "-" + mm + "-" + yyyy;

  try {
    attandances = await Attandance.find({
      userid: req.body.loginid,
      calculatedshiftend: { $ne: "", $exists: true }
      // shiftmode: req.body.shiftmode,
      // buttonstatus: "true",
     
   }) .sort({ createdAt: -1 })
    .limit(1).lean();

    lastObject = [attandances[attandances?.length - 1]];

const filteredAttandances = lastObject?.map((attendance, index) => {
  if (lastObject.length === 0 || index !== lastObject.length - 1) {
    return attendance; // Return unchanged for all indexes except the last one
  }
  // Get current time
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const [startTime, endTime] = req.body.shifttime.split(" - ");

  // Parse start time
  const [startHour, startMinute] = startTime.split(":").map(Number);

  // Parse end time
  const [endHour, endMinute] = endTime.split(":").map(Number);
  //clockedin
  if (attendance?.buttonstatus === "true") {
    //day shift
    if (
      startHour < endHour ||
      (startHour === endHour && startMinute <= endMinute)
    ) {
      // Shift falls within the same day (day shift)
      if (
        (currentHour > startHour ||
          (currentHour === startHour && currentMinute >= startMinute)) &&
        (currentHour < endHour ||
          (currentHour === endHour && currentMinute <= endMinute))
      ) {
        if (attendance?.date === todayDate) {
          return { ...attendance, buttonname: "CLOCKOUT" };
        } else {
          return { ...attendance, buttonname: "CLOCKIN" };
        }
      } else {
        return { ...attendance, buttonname: "SHIFT CLOSED" };
      }
      //night shift
    } else {
      // Shift spans across two days
      if (
        currentHour > startHour ||
        (currentHour === startHour && currentMinute >= startMinute) ||
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute)
      ) {
        if (new Date(attendance?.calculatedshiftend) >= new Date()) {
          return { ...attendance, buttonname: "CLOCKOUT" };
        } else {
          return { ...attendance, buttonname: "CLOCKIN" };
        }
      } else {
        return { ...attendance, buttonname: "SHIFT CLOSED" };
      }
    }
  } else if (attendance?.buttonstatus === "false") {
    //clocked out

    if (
      startHour < endHour ||
      (startHour === endHour && startMinute <= endMinute)
    ) {
      // Shift falls within the same day (day shift)
      if (
        (currentHour > startHour ||
          (currentHour === startHour && currentMinute >= startMinute)) &&
        (currentHour < endHour ||
          (currentHour === endHour && currentMinute <= endMinute))
      ) {
        if (attendance?.date === todayDate) {
          return { ...attendance, buttonname: "SHIFT CLOSED" };
        } else {
          return { ...attendance, buttonname: "CLOCKIN" };
        }
      } else {
        return { ...attendance, buttonname: "SHIFT CLOSED" };
      }
    } else {
      //night shift
      // Shift spans across two days

      if (
        currentHour > startHour ||
        (currentHour === startHour && currentMinute >= startMinute) ||
        currentHour < endHour ||
        (currentHour === endHour && currentMinute <= endMinute)
      ) {
        if (new Date(attendance?.calculatedshiftend) < new Date()) {
          return { ...attendance, buttonname: "CLOCKIN" };
        } else {
          return { ...attendance, buttonname: "SHIFT CLOSED" };
        }
      } else {
        return { ...attendance, buttonname: "SHIFT CLOSED" };
      }
    }
  } else {
    return { ...attendance, buttonname: "CLOCKIN" };
  }
});

attstatus = filteredAttandances;
   
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    count: attstatus.length,
    attstatus,
  });
});

exports.getTimerUserstatusTrue = catchAsyncErrors(async (req, res, next) => {
  //working
  let attandances;
  let attstatus;
  let oneattstatus;
  let twoattstatus;
  // Get today's date
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();

  var todayDate = dd + "-" + mm + "-" + yyyy;

  // Get yesterday's date
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  dd = String(yesterday.getDate()).padStart(2, "0");
  mm = String(yesterday.getMonth() + 1).padStart(2, "0"); // January is 0!
  yyyy = yesterday.getFullYear();

  var yesterdayDate = dd + "-" + mm + "-" + yyyy;


  try {
    attandances = await Attandance.find({userid:req.body.loginid});

   
    oneattstatus = attandances.filter((data, index) => {
      if (data.userid == req.body.loginid && todayDate == data.date) {
        return data;
      }
      else if (
       data.userid == req.body.loginid &&
        yesterdayDate == data.date &&
        data.buttonstatus === "true"
      ) {
        return data;
      }
    });

    twoattstatus = attandances.filter((data, index) => {
      if (data.userid == req.body.loginid && todayDate == data.date) {
        return data;
      }
    });
   
     attstatus = req.body.shiftendtime.includes("AM") ? oneattstatus : twoattstatus;
   
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    count: attstatus.length,
    attstatus,
  });
});
exports.getTimerUserstatusFalse = catchAsyncErrors(async (req, res, next) => {
  //working
  let attandances;
  let dyesterday;
  let yesterday;
  let prevDates;
  var currentDates = new Date();
  let currentDays = currentDates.getDate();
  let yd = new Date();
  yd.setDate(currentDays - 1);
  let ans = new Date(yd);
  let ddy = String(ans.getDate()).padStart(2, "0");
  let ym = String(ans.getMonth() + 1).padStart(2, "0");
  let ysyr = ans.getFullYear();
  let yesday = ddy + "-" + ym + "-" + ysyr;
  var currentDates2 = new Date();
  let currentDays2 = currentDates2.getDate();
  let yd2 = new Date();
  yd2.setDate(currentDays2 - 2);
  let ans2 = new Date(yd2);
  let ddy2 = String(ans2.getDate()).padStart(2, "0");
  let ym2 = String(ans2.getMonth() + 1).padStart(2, "0");
  let ysyr2 = ans2.getFullYear();
  let yesday2 = ddy2 + "-" + ym2 + "-" + ysyr2;
  try {
    attandances = await Attandance.find();
    yesterday = attandances.filter((data, index) => {
      return data.userid == req.body.loginid && yesday == data.date && data.buttonstatus == "true";
    });
    dyesterday = attandances.filter((data, index) => {
      return data.userid == req.body.loginid && yesday2 == data.date && data.buttonstatus == "true";
    });
    prevDates = attandances.filter((data, index) => {
      return data.userid == req.body.loginid && yesday < data.date && data.buttonstatus == "true";
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }
  return res.status(200).json({
    count: attandances.length,
    yesterday,
    dyesterday,
    prevDates,
  });
});

exports.getAttenddancefilter = catchAsyncErrors(async (req, res, next) => {
  let attandance;
  let attandancefilter;
  let allUsers;
  try {
    allUsers = await User.find(
      {
        enquirystatus: {
          $nin: ["Enquiry Purpose"],
        },
        resonablestatus: {
          $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
        },
      },
      {
        username: 1,
        _id: 1,
        empcode: 1,
        profileimage: 1,
        companyname: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        resonablestatus: 1,
      }
    );

    let query = {};
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers" && req.body[key].length > 0) {
        query[key] = req.body[key];
      }
    });

    // Filter the allUsers array based on the conditions provided in the query object
    attandance = allUsers.filter((item) => {
      return Object.keys(query).every((key) => {
        return query[key].includes(item[key]);
      });
    });

    // attandancefilter = attandance.filter((data, index) => {
    //   if (req.body.companyname.includes(data.companyname)) {
    //     return data;
    //   } else {
    //     data;
    //   }
    // });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!attandance) {
    return next(new ErrorHandler("Users not found", 400));
  }
  return res
    .status(200)
    .json({ count: attandance.length, attandancefilter: attandance });
});


// // get All Attandance => /api/attandancesstatusdates
exports.getAllAttandanceStstusDates = catchAsyncErrors(async (req, res, next) => {
  let attandances;
  let resultdate;
  let resultdateid;
  let trail = {};

  try {
    attandances = await Attandance.find({status: true});
    resultdate = attandances.filter((data, index) => {
      return data.status == true;
    });
    resultdateid = resultdate.map((data, index) => {
      return data.userid;
    });
    resultdateid.forEach((value, index) => {
      let dates = [];
      resultdate.forEach((data) => {
        if (value == data.userid) {
          dates.push(data.date);
        }
      });
      trail[value] = dates;
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    resultdateid,
    trail,
  });
});

// get All status => /api/attandancesregular
exports.getAllAttandanceStatusAttendance = catchAsyncErrors(async (req, res, next) => {

  let attendanceresult;

  try {
    attendanceresult = await Attandance.find({userid:req.body.userid, status:true,date:"req.body.staffcurrentdate",});
    
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!attandances) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    attendanceresult,
    attstatusregular,
  });
});

exports.getAllAttendanceHierarchyList = catchAsyncErrors(async (req, res, next) => {
  let result, hierarchy, resultAccessFilter, secondaryhierarchyfinal, tertiaryhierarchyfinal, primaryhierarchyfinal, hierarchyfilter, filteredoverall, primaryhierarchy, hierarchyfilter1, secondaryhierarchy, hierarchyfilter2, tertiaryhierarchy, primaryhierarchyall, secondaryhierarchyall, tertiaryhierarchyall, branch, hierarchySecond, overallMyallList, hierarchyMap, resulted, resultedTeam, myallTotalNames, hierarchyFinal, hierarchyDefault;
  try {
    result = await User.find(
      {
        enquirystatus:{
          $nin: ["Enquiry Purpose"]
         },
        resonablestatus: {
          $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
        },
      },
      {
        companyname: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        resonablestatus: 1,
        username: 1,
        _id: 1
      }
    );

    //myhierarchy dropdown
    if (req.body.hierachy === "myhierarchy") {

      hierarchy = await Hirerarchi.find({ supervisorchoose: req.body.username, level: req.body.sector });
      hierarchyDefault = await Hirerarchi.find({ supervisorchoose: req.body.username });

      let answerDef = hierarchyDefault.map((data) => data.employeename);
      hierarchyFinal = req.body.sector === "all" ? (answerDef.length > 0 ? [].concat(...answerDef) : []) : hierarchy.length > 0 ? [].concat(...hierarchy.map((item) => item.employeename)) : [];
      hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];

      hierarchyfilter = await Hirerarchi.find({ supervisorchoose: req.body.username, level: "Primary" });
      primaryhierarchy = hierarchyfilter.map((item) => item.employeename[0]) ? hierarchyfilter.map((item) => item.employeename[0]) : [];

      hierarchyfilter1 = await Hirerarchi.find({ supervisorchoose: req.body.username, level: "Secondary" });
      secondaryhierarchy = hierarchyfilter1.map((item) => item.employeename[0]) ? hierarchyfilter1.map((item) => item.employeename[0]) : [];

      hierarchyfilter2 = await Hirerarchi.find({ supervisorchoose: req.body.username, level: "Tertiary" });
      tertiaryhierarchy = hierarchyfilter2.map((item) => item.employeename[0]) ? hierarchyfilter2.map((item) => item.employeename[0]) : [];


      resulted = result
        .map((userObj) => {
          const matchingHierarchy = hierarchyDefault.find((hierarchyObj) => hierarchyObj.employeename[0] == userObj.companyname);
          return {
            companyname: userObj.companyname,
            unit: userObj.unit,
            department: userObj.department,
            team: userObj.team,
            branch: userObj.branch,
            company: userObj.company,
            username: userObj.username,
            _id: userObj._id,
            control: matchingHierarchy ? matchingHierarchy.control : "",
          };
        })
        .filter((data) => hierarchyMap.includes(data.companyname));

    }

    if (req.body.hierachy === "allhierarchy") {
      hierarchySecond = await Hirerarchi.find({}, { employeename: 1, supervisorchoose: 1, level: 1, control: 1 });
      hierarchyDefault = await Hirerarchi.find({ supervisorchoose: req.body.username });

      let answerDef = hierarchyDefault.map((data) => data.employeename).flat();

      function findEmployeesRecursive(currentSupervisors, processedSupervisors, result) {
        const filteredData = hierarchySecond.filter((item) =>
          item.supervisorchoose.some((supervisor) => currentSupervisors.includes(supervisor) && !processedSupervisors.has(supervisor))
        );

        if (filteredData.length === 0) {
          return result;
        }

        const newEmployees = filteredData.reduce((employees, item) => {
          employees.push(...item.employeename);
          processedSupervisors.add(item.supervisorchoose[0]); // Assuming each item has only one supervisorchoose
          return employees;
        }, []);

        const uniqueNewEmployees = [...new Set(newEmployees)];
        result = [...result, ...filteredData];

        return findEmployeesRecursive(uniqueNewEmployees, processedSupervisors, result);
      }

      const processedSupervisors = new Set();
      const filteredOverallItem = findEmployeesRecursive(answerDef, processedSupervisors, []);
      let answerDeoverall = filteredOverallItem.filter((data) => req.body.sector == "all" ? ["Primary", "Secondary", "Tertiary"].includes(data.level) : data.level == req.body.sector).map(item => item.employeename[0]);

      resultedTeam = result.map((userObj) => {
        const matchingHierarchycontrol = filteredOverallItem.find(hierarchyObj => hierarchyObj.employeename[0] == userObj.companyname);
        return {
          companyname: userObj.companyname,
          unit: userObj.unit,
          department: userObj.department,
          team: userObj.team,
          branch: userObj.branch,
          company: userObj.company,
          username: userObj.username,
          _id: userObj._id,
          level: matchingHierarchycontrol ? matchingHierarchycontrol.level : "",
          control: matchingHierarchycontrol ? matchingHierarchycontrol.control : "",
        };
      })
        .filter((data) => answerDeoverall.includes(data.companyname));

      let hierarchyallfinal = await Hirerarchi.find({ employeename: { $in: answerDeoverall.map(item => item) }, level: req.body.sector });
      hierarchyFinal = req.body.sector === "all" ? (answerDeoverall.length > 0 ? [].concat(...answerDeoverall) : []) : hierarchyallfinal.length > 0 ? [].concat(...hierarchyallfinal.map((item) => item.employeename)) : [];

      primaryhierarchyall = resultedTeam.filter(item => item.level == "Primary").map(item => item.companyname);

      secondaryhierarchyall = resultedTeam.filter(item => item.level == "Secondary").map(item => item.companyname);

      tertiaryhierarchyall = resultedTeam.filter(item => item.level == "Tertiary").map(item => item.companyname);

    }


    //my + all hierarchy list dropdown

    if (req.body.hierachy === "myallhierarchy") {
      hierarchySecond = await Hirerarchi.find({}, { employeename: 1, supervisorchoose: 1, level: 1, control: 1 });
      hierarchyDefault = await Hirerarchi.find({ supervisorchoose: req.body.username });

      let answerDef = hierarchyDefault.map((data) => data.employeename);


      function findEmployeesRecursive(currentSupervisors, processedSupervisors, result) {
        const filteredData = hierarchySecond.filter((item) =>
          item.supervisorchoose.some((supervisor) => currentSupervisors.includes(supervisor) && !processedSupervisors.has(supervisor))
        );

        if (filteredData.length === 0) {
          return result;
        }

        const newEmployees = filteredData.reduce((employees, item) => {
          employees.push(...item.employeename);
          processedSupervisors.add(item.supervisorchoose[0]); // Assuming each item has only one supervisorchoose
          return employees;
        }, []);

        const uniqueNewEmployees = [...new Set(newEmployees)];
        result = [...result, ...filteredData];

        return findEmployeesRecursive(uniqueNewEmployees, processedSupervisors, result);
      }

      const processedSupervisors = new Set();
      const filteredOverallItem = findEmployeesRecursive([req.body.username], processedSupervisors, []);
      let answerDeoverall = filteredOverallItem.filter((data) => req.body.sector == "all" ? ["Primary", "Secondary", "Tertiary"].includes(data.level) : data.level == req.body.sector).map(item => item.employeename[0]);

      filteredoverall = result.map((userObj) => {
        const matchingHierarchycontrol = filteredOverallItem.find(hierarchyObj => hierarchyObj.employeename[0] == userObj.companyname);
        return {
          companyname: userObj.companyname,
          unit: userObj.unit,
          department: userObj.department,
          team: userObj.team,
          branch: userObj.branch,
          company: userObj.company,
          username: userObj.username,
          _id: userObj._id,
          level: matchingHierarchycontrol ? matchingHierarchycontrol.level : "",
          control: matchingHierarchycontrol ? matchingHierarchycontrol.control : "",
        };
      })
        .filter((data) => answerDeoverall.includes(data.companyname));

      let hierarchyallfinal = await Hirerarchi.find({ employeename: { $in: answerDeoverall.map(item => item) }, level: req.body.sector });
      hierarchyFinal = req.body.sector === "all" ? (answerDeoverall.length > 0 ? [].concat(...answerDeoverall) : []) : hierarchyallfinal.length > 0 ? [].concat(...hierarchyallfinal.map((item) => item.employeename)) : [];



      primaryhierarchyfinal = filteredoverall.filter(item => item.level == "Primary").map(item => item.companyname);

      secondaryhierarchyfinal = filteredoverall.filter(item => item.level == "Secondary").map(item => item.companyname);

      tertiaryhierarchyfinal = filteredoverall.filter(item => item.level == "Tertiary").map(item => item.companyname);




    }



    resultAccessFilter = req.body.hierachy === "myhierarchy" ? resulted : req.body.hierachy === "allhierarchy" ? resultedTeam : filteredoverall;
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!result) {
    return next(new ErrorHandler("No data found!", 404));
  }
  return res.status(200).json({
    // result
    // resulted,
    // resultedTeam,
    // branch,
    // hierarchy,
    // overallMyallList,
    resultAccessFilter,
    primaryhierarchy,
    secondaryhierarchy,
    tertiaryhierarchy,
    primaryhierarchyall,
    secondaryhierarchyall,
    tertiaryhierarchyall,
    primaryhierarchyfinal,
    secondaryhierarchyfinal, tertiaryhierarchyfinal,
  });
});






//Secondary Work Order - Hierarchy based Filter
exports.getAllAttendanceHierarchyListanother = catchAsyncErrors(async (req, res, next) => {
  let result, hierarchy, primaryhierarchy, secondaryhierarchy, hierarchyMap, resulted, tertiaryhierarchy;

  try {
    result = await User.find(
      {
        enquirystatus:{
          $nin: ["Enquiry Purpose"]
         },
        resonablestatus: {
          $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
        },
      },
      {
        companyname: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        username: 1,
        resonablestatus: 1,
        _id: 1
      }
    );
    hierarchy = await Hirerarchi.find({ supervisorchoose: req.body.username, level: "Primary" });
    hierarchyMap = hierarchy.length > 0 ? [].concat(...hierarchy.map((item) => item.employeename)) : [];

    let hierarchyfilternew = await Hirerarchi.find({ supervisorchoose: req.body.username, level: "Primary" });
    primaryhierarchy = hierarchyfilternew.map((item) => item.employeename[0]);

    let hierarchyfilternew1 = await Hirerarchi.find({ supervisorchoose: req.body.username, level: "Secondary" });
    secondaryhierarchy = hierarchyfilternew1.map((item) => item.employeename[0]);

    let hierarchyfilternew2 = await Hirerarchi.find({ supervisorchoose: req.body.username, level: "Tertiary" });
    tertiaryhierarchy = hierarchyfilternew2.map((item) => item.employeename[0]);

    //solo
    // resulted = result.filter((data) => hierarchyMap.includes(data.companyname));

    resulted = result
      .map((userObj) => {
        const matchingHierarchy = hierarchy.find((hierarchyObj) => hierarchyObj.employeename[0] == userObj.companyname);
        return {
          companyname: userObj.companyname,
          unit: userObj.unit,
          department: userObj.department,
          team: userObj.team,
          branch: userObj.branch,
          company: userObj.company,
          username: userObj.username,
          _id: userObj._id,
          control: matchingHierarchy ? matchingHierarchy.control : "",
        };
      })
      .filter((data) => hierarchyMap.includes(data.companyname));
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!result) {
    return next(new ErrorHandler("No data found!", 404));
  }
  return res.status(200).json({
    result,
    resulted,
    primaryhierarchy,
    secondaryhierarchy,
    tertiaryhierarchy,
  });
});

// // Create new Attandance => /api/attandance/new
// exports.addnewAttandance = catchAsyncErrors(async (req, res, next) => {
//   addattandance = await Attandance.create(req.body);

//   return res.status(200).json({
//     addattandance,
//     message: "Successfully added!",
//   });
// });

exports.addnewAttandance = catchAsyncErrors(async (req, res, next) => {
  const shiftn = req?.body?.shiftname?.split("to");
  const getdate = (shiftn[0]?.includes("PM") && shiftn[1]?.includes("AM")) ? req?.body?.date : moment(new Date()).format("DD-MM-YYYY");

  addattandance = await Attandance.create({username:req.body.username,userid:req.body.userid,clockintime:moment(new Date()).format("hh:mm:ss A"),date:getdate,clockinipaddress:req.body.clockinipaddress,
    status:req.body.status,buttonstatus:req.body.buttonstatus,calculatedshiftend:req.body.calculatedshiftend,shiftname:req.body.shiftname,weekoffpresentstatus:req.body.weekoffpresentstatus,
    autoclockout:req.body.autoclockout,shiftendtime:req.body.shiftendtime,shiftmode:req.body.shiftmode,clockouttime:req.body.clockouttime,attendancemanual:req.body.attendancemanual,
  });

  return res.status(200).json({
    addattandance,
    message: "Successfully added!",
  });
});

// Create new Attandance => /api/attandance/new
exports.addnewInAttandance = catchAsyncErrors(async (req, res, next) => {
 
  addattandance = await Attandance.create(req.body);

  return res.status(200).json({
    addattandance,
    message: "Successfully added!",
  });
});

// get Single Attandance => /api/attandance/:id
exports.getSingleAttandance = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sattandance = await Attandance.findById(id);

  if (!sattandance) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    sattandance,
  });
});

// update Attandance by id => /api/attandance/:id
exports.updateAttandance = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let upattandance = await Attandance.findByIdAndUpdate(id, {clockouttime:moment(new Date()).format("hh:mm:ss A"),clockoutipaddress:req.body.clockoutipaddress,buttonstatus:req.body.buttonstatus,
    autoclockout:req.body.autoclockout,attendancemanual:req.body.attendancemanual,weekoffpresentstatus:req.body.weekoffpresentstatus,ckoutstatus:req.body.ckoutstatus
  });

  if (!upattandance) {
    return next(new ErrorHandler("Data not found!", 400));
  }
  return res.status(200).json({
    message: "Updated Successfully!",
  });
});

// update Attandance by id => /api/attandance/:id
exports.getDoubleNightShiftviceAtt = catchAsyncErrors(async (req, res, next) => {

  let getdoubleshiftatt = await Attandance.find({userid: req.body.userid, date: req.body.date, shiftmode:req.body.shiftmode, buttonstatus: "true"});

  if (!getdoubleshiftatt) {
    return next(new ErrorHandler("Data not found!", 400));
  }
  return res.status(200).json({
    getdoubleshiftatt
  });
});

// update Attandance by id => /api/attandance/:id
exports.updateInAttandance = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let upattandance = await Attandance.findByIdAndUpdate(id, req.body);

  if (!upattandance) {
    return next(new ErrorHandler("Data not found!", 400));
  }
  return res.status(200).json({
    message: "Updated Successfully!",
  });
});

// delete Attandance by id => /api/attandance/:id
exports.deleteAttandance = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dattandance = await Attandance.findByIdAndRemove(id);

  if (!dattandance) {
    return next(new ErrorHandler("Data not found!", 400));
  }

  return res.status(200).json({
    message: "Deleted Successfully!",
  });
});

//attendance checklist

//update single AttendanceStatus by id => /api/updatesingleattendanceatatus/:id
exports.updateSingleAttendanceStatus = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;
    let uattendancestatus = await Attandance.findOneAndUpdate(
      {
        userid: id,
        date: moment(req.body.date).format("DD-MM-YYYY"),
        shiftmode: req.body.shiftmode,
      },
      { attendancestatus: req.body.attendancestatus },
      { new: true }
    );

    if (!uattendancestatus) {
      return next(new ErrorHandler("Attendance not found", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
  }
);

exports.findAttendacneStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    let uattendancestatus = await Attandance.find({
      userid: req.body.userid,
      date: req.body.date,
      shiftmode: req.body.shiftmode,
    });

    if (uattendancestatus?.length > 0) {
      return res.status(200).json({ found: true });
    } else {
      return res.status(200).json({ found: false });
    }
  } catch (err) {
    return next(new ErrorHandler("Records not found", 404));
  }
});

exports.undoAttendanceStatusFromChecklist = catchAsyncErrors(async (req, res, next) => {
  const { userid, date, shiftmode } = req.body;

  try {
    const attendance = await Attandance.findOne({ userid, date, shiftmode });

    if (!attendance) {
      return next(new ErrorHandler("Data not found!", 404));
    }

    if (attendance.clockintime === "00:00:00" && attendance.clockouttime === "00:00:00") {
      await Attandance.deleteOne({ _id: attendance._id });
      return res.status(200).json({ message: "Record deleted successfully." });
    } else {
      // Otherwise, update the attendancestatus to an empty string
      // attendance.attendancestatus = "";
      // await attendance.save();
      await Attandance.updateOne(
        { _id: attendance._id },
        { $unset: { attendancestatus: "" } }
      );
      return res.status(200).json({ message: "Attendance status updated successfully." });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
exports.checkNewJoiner = catchAsyncErrors(async (req, res, next) => {


  const isUserIdPresent = await Attandance.exists({ userid: req.body.userid });

  return res.status(200).json({
    newjoiner: !!isUserIdPresent,
  });
});



// Attendance Bulk Update
exports.updateBulkClockinAndClockout = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userData, shiftmode, mode, status, hour, minute, second, period } = req.body;

    if (mode === 'Update Clockin') {
      // Prepare bulk operations for MongoDB
      const bulkOperations = [];

      for (const user of userData) {
        // Extract shift start time and format it to 'HH:mm:ss A'
        const shiftStartTime = user.shift.split('to')[0].trim();
        const formattedClockinTime = status === 'Shift Start Time' ? moment(shiftStartTime, 'h:mmA').format('hh:mm:ss A') : `${hour}:${minute}:${second} ${period}`;

        // Check if attendance already exists for the user
        const existingAttendance = await Attandance.findOne({ userid: user.userid, date: user.date, shiftmode: shiftmode });

        if (existingAttendance) {
          // Update the clockintime of the existing record
          bulkOperations.push({
            updateOne: {
              filter: { userid: user.userid, date: user.date, shiftmode: shiftmode },
              update: { $set: { clockintime: formattedClockinTime, attendancemanual: true, bulkupdateclockinstatus: true } },
            },
          });
        } else {
          // Create a new attendance record
          bulkOperations.push({
            insertOne: {
              document: {
                username: user.username,
                userid: user.userid,
                date: user.date,
                clockintime: formattedClockinTime,
                clockouttime: '',
                clockinipaddress: user.clockinipaddress,
                buttonstatus: 'true',
                autoclockout: false,
                attendancemanual: true,
                status: true,
                shiftmode: user.shiftmode,
                shiftname: user.shift,
                shiftendtime: user.shiftendtime,
                bulkupdateclockinstatus: true,
              },
            },
          });
        }
      }

      // Perform bulk write operations
      if (bulkOperations.length > 0) {
        await Attandance.bulkWrite(bulkOperations);
      }

      return res.status(200).json({ message: "Attendance updated successfully." });
    }
    if (mode === 'Update Clockout') {
      const bulkOperations = [];
      const usersWithoutClockIn = [];

      for (const user of userData) {
        // Extract shift end time and format it to 'HH:mm:ss A'
        const shiftEndTime = user.shift.split('to')[1].trim();
        const formattedClockoutTime = status === 'Shift End Time' ? moment(shiftEndTime, 'h:mmA').format('hh:mm:ss A') : `${hour}:${minute}:${second} ${period}`;

        // Check if attendance already exists for the user
        const existingAttendance = await Attandance.findOne({ userid: user.userid, date: user.date, shiftmode: shiftmode });

        if (existingAttendance) {
          if (existingAttendance.clockintime !== "00:00:00") {
            // Update clockout time for the existing record
            bulkOperations.push({
              updateOne: {
                filter: { userid: user.userid, date: user.date, shiftmode: shiftmode },
                update: {
                  $set: {
                    clockouttime: formattedClockoutTime,
                    clockoutipaddress: user.clockoutipaddress,
                    buttonstatus: "false",
                    autoclockout: false,
                    attendancemanual: true,
                    bulkupdateclockoutstatus: true,
                  },
                },
              },
            });
          } else {
            // User has not clocked in; add them to the list for error response
            usersWithoutClockIn.push({ userid: user.userid, companyname: user.companyname });
          }
        } else {
          // User's attendance record is not found
          usersWithoutClockIn.push({ userid: user.userid, companyname: user.companyname });
        }
      }

      // Perform bulk write operations if there are any updates
      if (bulkOperations.length > 0) {
        await Attandance.bulkWrite(bulkOperations);
      }
      // Handle users without clock-in or missing attendance data
      if (usersWithoutClockIn.length > 0) {
        return res.status(200).json({ users: usersWithoutClockIn });
      }

      return res.status(200).json({ message: "Attendance updated successfully." });
    }
    if (mode === 'Update Both') {
      const bulkOperations = [];

      for (const user of userData) {
        // Extract shift start and end time and format it to 'HH:mm:ss A'
        const shiftStartTime = user.shift.split('to')[0].trim();
        const shiftEndTime = user.shift.split('to')[1].trim();
        const formattedClockinTime = moment(shiftStartTime, 'h:mmA').format('hh:mm:ss A');
        const formattedClockoutTime = moment(shiftEndTime, 'h:mmA').format('hh:mm:ss A');

        // Check if attendance already exists for the user
        const existingAttendance = await Attandance.findOne({ userid: user.userid, date: user.date, shiftmode: shiftmode });

        if (existingAttendance) {
          // Update the clockintime of the existing record
          bulkOperations.push({
            updateOne: {
              filter: { userid: user.userid, date: user.date, shiftmode: shiftmode },
              update: {
                $set: {
                  clockintime: formattedClockinTime,
                  clockouttime: formattedClockoutTime,
                  clockinipaddress: user.clockinipaddress,
                  clockoutipaddress: user.clockoutipaddress,
                  buttonstatus: 'false',
                  attendancemanual: true,
                  bulkupdateclockinstatus: true,
                  bulkupdateclockoutstatus: true,
                }
              },
            },
          });
        } else {
          // Create a new attendance record
          bulkOperations.push({
            insertOne: {
              document: {
                username: user.username,
                userid: user.userid,
                date: user.date,
                clockintime: formattedClockinTime,
                clockouttime: formattedClockoutTime,
                clockinipaddress: user.clockinipaddress,
                clockoutipaddress: user.clockoutipaddress,
                buttonstatus: 'false',
                autoclockout: false,
                attendancemanual: true,
                status: true,
                shiftmode: user.shiftmode,
                shiftname: user.shift,
                shiftendtime: user.shiftendtime,
                bulkupdateclockinstatus: true,
                bulkupdateclockoutstatus: true,
              },
            },
          });
        }
      }

      // Perform bulk write operations
      if (bulkOperations.length > 0) {
        await Attandance.bulkWrite(bulkOperations);
      }

      return res.status(200).json({ message: "Attendance updated successfully." });
    }
    // else {
    //   return res.status(400).json({ message: "Invalid mode or status." });
    // }
  } catch (err) {
    return next(new ErrorHandler("Error updating attendance!", 500));
  }
});

// Attendance Bulk Update Filter
exports.getBulkClockinAndClockoutBulkUpdatedData = catchAsyncErrors(async (req, res, next) => {

  let filteredData = [];

  const { fromDate, toDate, employee } = req.body;

  let query = {
    companyname: { $in: employee },
    enquirystatus: { $nin: ["Enquiry Purpose"], },
  }

  try {
    const [users, attendances] = await Promise.all([
      User.find(query,
        {
          company: 1,
          branch: 1,
          unit: 1,
          team: 1,
          department: 1,
          doj: 1,
          empcode: 1,
          companyname: 1,
          team: 1,
          floor: 1,
          username: 1,
          designation: 1,
          weekoff: 1,
          shiftallot: 1,
          shifttiming: 1,
          boardingLog: 1,
          attendancemode: 1,
          reasondate: 1,
          departmentlog: 1,
          designationlog: 1,
        }
      ),
      Attandance.find({
        $or: [
          { bulkupdateclockinstatus: true },
          { bulkupdateclockoutstatus: true },
        ]
      }),
    ])
    const filteredAttandance = attendances?.filter((item) => new Date(item.date.split("-").reverse().join("-")) >= new Date(fromDate) && new Date(item.date.split("-").reverse().join("-")) <= new Date(toDate));

    // compare with user and get matched data
    filteredData = users.flatMap((userData) => {
      // Find all matching data
      const matchedItems = filteredAttandance.filter((item) => userData._id.toString() === item.userid && userData.username === item.username);

      // Map each matched item to include the client amount
      const rows = matchedItems?.map((matchedItem) => {

        // Remove duplicate entries with the most recent entry
        const uniqueEntriesDep = {};
        userData?.departmentlog?.forEach(entry => {
          const entryDate = new Date(entry.startdate); // Parse the startdate into a date object
          const key = entry.startdate;
          if (!(key in uniqueEntriesDep)) {
            uniqueEntriesDep[key] = entry;
          }
        });

        const uniqueDepLog = Object.values(uniqueEntriesDep);
        const [columnDay, columnMonth, columnYear] = matchedItem.date?.split('-');
        const finalDate = `${columnYear}-${columnMonth}-${columnDay}`;

        // Find the relevant log entry for the given date     
        const relevantDepLogEntry = uniqueDepLog
          .filter(log => log.startdate <= finalDate)
          .sort((a, b) => new Date(b.startdate) - new Date(a.startdate))[0];

        return {
          ...matchedItem?._doc,
          company: userData?.company,
          branch: userData?.branch,
          unit: userData?.unit,
          team: userData?.team,
          department: (relevantDepLogEntry && relevantDepLogEntry?.department),
          companyname: userData?.companyname,
          empcode: userData?.empcode,
        }
      });
      return rows;
    })

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  if (!filteredData) {
    return next(new ErrorHandler("Attendance not found", 400));
  }

  return res.status(200).json({ filteredData });
});

exports.getAutoClockoutUserForBulkUpdate = catchAsyncErrors(async (req, res, next) => {
  let attendance = [];
  const { date } = req.body;
  try {
    const attendanceresult = await Attandance.find({ date, autoclockout: true, }, { userid: 1 });
    attendanceresult.filter(data => attendance.push(data.userid));
  } catch (err) {
    return next(new ErrorHandler("Attendance not found!", 404));
  }
  if (!attendance) {
    return next(new ErrorHandler("Attendance not found!", 404));
  }
  return res.status(200).json({ attendance });
});
