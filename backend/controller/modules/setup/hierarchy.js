const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const Designationgroup = require("../../../model/modules/designationgroup");
const Department = require("../../../model/modules/department");
const Branch = require("../../../model/modules/branch");
const Unit = require("../../../model/modules/unit");
const Teams = require("../../../model/modules/teams");
const DesignationLog = require('../../../model/modules/departmentanddesignationgrouping');
const DesignationMaster = require('../../../model/modules/designation');
const MikrotikPppSecrets = require("../../../model/modules/mikrotik/MikrotikPppSecrets");
const User = require("../../../model/login/auth");
const Designation = require("../../../model/modules/designation");
const Hirerarchi = require("../../../model/modules/setup/hierarchy");
const Controls = require("../../../model/modules/controlName");
const Noticeperiod = require("../../../model/modules/recruitment/noticeperiodapply");
const { getHierarchyBasedUsersList } = require("../rocketchat/rocketChatUsers");
const { getMultipleUsers } = require("../../login/postfixmailuser");
const { Hierarchyfilter } = require('../../../utils/taskManagerCondition');


//get Location wise filter=>/api/locationwiseall
exports.getDesignationControl = catchAsyncErrors(async (req, res, next) => {
  let designationgroups;
  try {
    designationgroups = await Designationgroup.find({ name: { $eq: req.body.name } });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));

  }
  if (!designationgroups) {
    return next(new ErrorHandler("Details not found!", 404));
  }
  return res.status(200).json({
    designationgroups,
  });
});

//get Location wise filter=>/api/locationwiseall
exports.getLocationwiseFilter = catchAsyncErrors(async (req, res, next) => {

  let designationgroups, department, branch, branches, deesig;

  try {
    if (req.body.company == "All") {
      department = await Department.find();
      branch = await Branch.find();
    } else {
      department = await Department.find();
      branch = await Branch.find({ company: { $eq: req.body.company } });
    }


  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!(department && branch)) {
    return next(new ErrorHandler("Details not found!", 404));
  }
  return res.status(200).json({
    department,
    branch,
  });
});
//get branch wise unit filter =>/api/areas
exports.getBranchWiseunit = catchAsyncErrors(async (req, res, next) => {
  let units;

  try {
    if (req.body.branch == "All") {
      units = await Unit.find({});
    } else {
      units = await Unit.find({ branch: { $eq: req.body.branch } });
    }
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!units) {
    return next(new ErrorHandler("Details not found!", 404));
  }
  return res.status(200).json({
    units,
  });
});
//get unit wise Team filter =>/api/areas
exports.getUnitwiseTeam = catchAsyncErrors(async (req, res, next) => {
  let teams;
  try {
    if (req.body.unit == "All") {
      teams = await Teams.find({});

    } else {
      teams = await Teams.find({ unit: { $eq: req.body.unit } });
    }
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!teams) {
    return next(new ErrorHandler("Details not found!", 404));
  }
  return res.status(200).json({
    teams,
  });
});

exports.getAllUserWiseFilter = catchAsyncErrors(async (req, res, next) => {
  let desig, designation, desigFinal, anwerFinal;

  try {
    let query = {};
    designation = await Designation.find();

    Object.keys(req.body).forEach((key) => {
      if (key !== "headers") {
        const value = req.body[key];
        if (value !== "" && value !== "All") {
          if (key === "designationgroup") {
            desigFinal = designation.filter((data) => value.includes(data.group));

            desig = desigFinal.map((item) => item.name);
          } else {
            query[key] = { $eq: value.toString() };
          }
        }
      }
    });

  
    const result = await User.find(query, { resonablestatus: 1, unit: 1, empcode: 1, companyname: 1, team: 1, username: 1, email: 1, branch: 1, designation: 1, team: 1 });
   console.log(result?.map(data => `${data?.resonablestatus}-${data?.companyname}`),query, "query")
    anwerFinal = desig ? result.filter((data) => desig.includes(data.designation) && !["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"].includes(data.resonablestatus)) : result.filter((item) => !["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"].includes(item.resonablestatus));

    // Replace `User` with your user model
    return res.status(200).json({
      users: anwerFinal,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
    return res.status(500).json({
      error: "Internal server error",
    });

  }
});

// get All Hirerarchi => /api/hirerarchies
exports.getAllHirerarchi = catchAsyncErrors(async (req, res, next) => {
  let hirerarchi;
  try {
    hirerarchi = await Hirerarchi.find();

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hirerarchi) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({
    hirerarchi,
  });
});
// get All Hirerarchi List indivudual=> /api/hirerarchies
exports.getHierarchyGroupListInidividual = catchAsyncErrors(async (req, res, next) => {
  let hirerarchi, allUsersData, alldesignation;
  const resulted = [];
  const resultGroup = [];
  try {
    hirerarchi = await Hirerarchi.find();

    alldesignation = await Designation.find();
    allUsersData = await User.find({}, { department: 1, designation: 1, company: 1, branch: 1, unit: 1, team: 1, companyname: 1, username: 1 });

    // Loop through the first array
    hirerarchi?.forEach((item1) => {
      // Find the corresponding item in the second array

      const matchingItem = allUsersData.find((item2) => item1.employeename.includes(item2.companyname));

      if (matchingItem) {
        resulted.push({
          _id: item1._id,
          company: matchingItem.company,
          branch: matchingItem.branch,
          unit: matchingItem.unit,
          employeename: matchingItem.companyname,
          designation: matchingItem.designation,
          team: matchingItem.team,
          department: matchingItem.department,
          supervisorchoose: item1.supervisorchoose,
          mode: item1.mode,
          level: item1.level,
          control: item1.control,
          pagecontrols: item1.pagecontrols,
          updatedby: item1.updatedby,
          addedby: item1.addedby,
        });
      }
    });

    let ans = resulted.forEach((item1) => {
      // Find the corresponding item in the second array
      const matchingItem = alldesignation.find((item2) => item1.designation === item2.name);
      // If a match is found, combine the properties
      if (matchingItem) {
        resultGroup.push({
          _id: item1._id,
          company: item1.company,
          branch: item1.branch,
          unit: item1.unit,
          employeename: item1.employeename,
          designation: item1.designation,
          team: item1.team,

          department: item1.department,
          supervisorchoose: item1.supervisorchoose,
          mode: item1.mode,
          level: item1.level,
          control: item1.control,
          pagecontrols: item1.pagecontrols,
          designationgroup: matchingItem.group,
          updatedby: item1.updatedby,
          addedby: item1.addedby,
        });
      } else {
        resultGroup.push({
          _id: item1._id,
          company: item1.company,
          branch: item1.branch,
          unit: item1.unit,
          employeename: item1.employeename,
          designation: item1.designation,
          team: item1.team,
          department: item1.department,
          supervisorchoose: item1.supervisorchoose,
          mode: item1.mode,
          level: item1.level,
          control: item1.control,
          pagecontrols: item1.pagecontrols,
          designationgroup: "",
          updatedby: item1.updatedby,
          addedby: item1.addedby,
        });
      }
    });



  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    hirerarchi, resultGroup
  });
});





exports.getAllUserWiseFilteredit = catchAsyncErrors(async (req, res, next) => {
  let desig, designation, company, comps, desigFinal, anwerFinal, result;
  try {
    let query;
    designation = await Designation.find();
    Object.keys(req.body).forEach((key) => {

      if (key !== "headers") {
        const value = req.body[key];

        if (value !== "" && value !== "All") {
          if (key === "designationgroup") {
            desigFinal = designation.filter((data) => value.includes(data.group));
            desig = desigFinal.map((item) => item.name);
          } else {
            query[key] = { $eq: value.toString() };
          }
        }
      }
    });
    let querynew = {
      resonablestatus: {
        $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"]
      },
    };

    let finalquery = query ? { $and: [query, querynew] } : querynew;

    result = await User.find(finalquery, {
      unit: 1,
      empcode: 1,
      companyname: 1,
      team: 1,
      username: 1,
      email: 1,
      branch: 1,
      designation: 1,
    });

    anwerFinal = desig && desig.length > 0 ? result.filter((data) => desig.includes(data.designation)) : result;

    // Replace `User` with your user model
    return res.status(200).json({
      users: anwerFinal,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

exports.checkHierarchyAddNewEmp = catchAsyncErrors(async (req, res, next) => {
  let hirerarchi, hierarchyupdate, resultString, desigFinal, designations, designationGrp;
  try {
    const { company, department, designation, branch, team, unit } = req.body;

    hirerarchi = await Hirerarchi.find();

    designations = await Designation.find();

    designationGrp = designations.find((data) => designation === data.name);
    console.log(company, department, designation, branch, team, unit, designationGrp.group, "company, department, designation, branch, team, unit")

    const condition1 = hirerarchi.filter((item) => {
      if (item.company === company
        && item.branch === ""
        && item.unit === ""
        && item.team === ""
        && item.department === ""
        && item.access === "all" &&
        (item.designationgroup === designationGrp.group || item.designationgroup === "All")) {
        return item;
      }
    });

    const condition5 = hirerarchi.filter((item) => {
      if (item.branch === ""
        && item.unit === "" &&
        item.team === "" &&
        item.department === "" &&
        item.access === "all"
        && (item.designationgroup === designationGrp.group || item.designationgroup === "All")
        && (item.company === company || item.company === "All")) {
        return item;
      }
    });

    const condition6 = hirerarchi.filter((item) => {
      if ((item.department === department || item.department == "All")
        && item.branch === ""
        && item.unit === ""
        && item.team === ""
        && item.access === "all"
        && (item.designationgroup === designationGrp.group || item.designationgroup === "All")
        && (item.company === company || item.company === "All")) {

        return item;
      }
    });

    const condition2 = hirerarchi.filter((item) => {
      if ((item.branch === branch || item.branch === "All")
        && item.unit === ""
        && item.team === ""
        && item.access === "all"
        && (item.designationgroup === designationGrp.group || item.designationgroup === "All")
        && (item.company === company || item.company === "All")) {
        return item;
      }
    });

    const condition3 = hirerarchi.filter((item) => {
      if ((item.unit === unit || item.unit === "All")
        && (item.branch === branch || item.branch === "All")
        && item.team === ""
        && item.access === "all"
        && (item.designationgroup === designationGrp.group || item.designationgroup === "All")
        && (item.company === company || item.company === "All")) {
        return item;
      }
    });

    const condition4 = hirerarchi.filter((item) => {
      // item.team === team && item.access === "all"
      if ((item.team === team || item.team === "All")
        && (item.unit === unit || item.unit === "All")
        && (item.branch === branch || item.branch === "All")
        && item.access === "all"
        && (item.designationgroup === designationGrp.group || item.designationgroup === "All")
        && (item.company === company || item.company === "All")) {
        return item;
      }
    });



    let con1value = condition1 && condition1.length > 0 ? condition1 : [];
    let con2value = condition2 && condition2.length > 0 ? condition2 : [];
    let con3value = condition3 && condition3.length > 0 ? condition3 : [];
    let con4value = condition4 && condition4.length > 0 ? condition4 : [];
    let con5value = condition5 && condition5.length > 0 ? condition5 : [];
    let con6value = condition6 && condition6.length > 0 ? condition6 : [];

    console.log(condition1.length, condition2.length, condition3.length, condition4.length, condition5.length, condition6?.length)
    resultString = [...con1value, ...con2value, ...con3value, ...con4value, ...con5value, ...con6value];
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hirerarchi) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({
    hierarchyupdate,
    resultString,
  });
});

exports.checkHierarchyEditEmpDetails = catchAsyncErrors(async (req, res, next) => {
  let hirerarchi, hierarchyupdate, resultString, desigFinal, condition1, condition2, condition3, condition4, allCondata, hirerarchiall;
  try {
    const { company, department, designation, branch, team, unit, companyname, empcode, oldcompany, oldbranch, oldunit, oldteam } = req.body;
    let query = {

      // employeename:req.body.companyname,
      employeename: {
        $in: req.body.companyname,
      },
      empcode: req.body.empcode,
    };
    hirerarchi = await Hirerarchi.find(query, {});
    hirerarchiall = await Hirerarchi.find();
    designations = await Designation.find();

    designationGrp = designations.find((data) => designation === data.name);

    if (hirerarchi.length > 0) {
      if (company !== oldcompany) {
        condition1 = hirerarchiall.filter((item) => {
          if (item.company === company && item.branch === "" && item.unit === "" && item.team === "" && item.department === "" && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All")) {
            return item;
          }
        });
      }
      if (branch !== oldbranch) {
        condition2 = hirerarchiall.filter((item) => {
          if ((item.branch === branch || item.branch === "All") && item.unit === "" && item.team === "" && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All") && (item.company === company || item.company === "All")) {

            return item;
          }
        });
      }
      if (unit !== oldunit) {

        condition3 = hirerarchiall.filter((item) => {
          if ((item.unit === unit || item.unit === "All")
            && (item.branch === branch || item.branch === "All")
            && item.team === "" && item.access === "all"
            && (item.designationgroup === designationGrp.group || item.designationgroup === "All")
            && (item.company === company || item.company === "All")) {
            return item;
          }
        });
      }
      if (team !== oldteam) {
        condition4 = hirerarchiall.filter((item) => {
          // item.team === team && item.access === "all"
          if ((item.team === team || item.team === "All")
            && (item.unit === unit || item.unit === "All")
            && (item.branch === branch || item.branch === "All")
            && item.access === "all" &&
            (item.designationgroup === designationGrp.group || item.designationgroup === "All")
            && (item.company === company || item.company === "All")) {
            return item;
          }
        });
      }
    }

    console.log(condition4, "condition4")
    let con1value = condition1 && condition1.length > 0 ? condition1 : [];
    let con2value = condition2 && condition2.length > 0 ? condition2 : [];
    let con3value = condition3 && condition3.length > 0 ? condition3 : [];
    let con4value = condition4 && condition4.length > 0 ? condition4 : [];
    allCondata = [...con1value, ...con2value, ...con3value, ...con4value];
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hirerarchi) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({
    hirerarchi,
    allCondata,
  });
});



exports.getAllHierarchyTeamAndDesignation = catchAsyncErrors(async (req, res, next) => {
  let oldname = req.body.oldname;
  let newname = req.body.newname;
  let type = req.body.type;
  let username = req.body.username;
  let hierarchy, hierarchyfindchange, hierarchyold, hierarchyoldsupervisor, designation;

  try {


    hierarchy = await Hirerarchi.find()
    designation = (type === "Designation" && newname !== "All") ? await Designation.find({ name: newname }) : [];
    hierarchyold = hierarchy.filter(data => data.employeename?.includes(username))
    hierarchyoldsupervisor = hierarchy.filter(data => data.supervisorchoose?.includes(username))


    hierarchyfindchange = type === "Team" ? hierarchy.filter(data => data.team === newname && data.level === "Primary") :
      type === "Designation" ? hierarchy.filter(data => data?.designationgroup === (designation?.length > 0 ? designation[0]?.group : "") && data.level === "Primary") : []




  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hierarchyold && !hierarchyfindchange && !hierarchyoldsupervisor) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }

  return res.status(200).json({
    hierarchyold,
    hierarchyfindchange,
    hierarchyoldsupervisor
  });
});

exports.checkHierarchyEditEmpDetailsDesignation = catchAsyncErrors(async (req, res, next) => {
  let hirerarchiall, allCondataold, allCondata, condition1, condition2, condition3, condition4, condition6;
  try {
    const { company, designation, olddesignation, companyname, branch, unit, team, department } = req.body;

    let query = {
      supervisorchoose: {
        $in: req.body.companyname,
      },
    };
    hirerarchi = await Hirerarchi.find(query, {});
    hirerarchiall = await Hirerarchi.find();
    designations = await Designation.find();

    designationGrp = designations.find((data) => designation == data.name);
    olddesignationGrp = designations.find((data) => olddesignation == data.name);

    allCondataolddata = hirerarchiall.filter((item) => {
      if ((item.company === company || item.company === "All") && item.branch === "" && item.unit === "" && item.team === "" && item.department === "" && item.access === "all" && item.employeename.includes(companyname) && (item.designationgroup === olddesignationGrp.group || item.designationgroup === "All")) {

        return item;
      }
    });

    if (designationGrp.group !== olddesignationGrp.group) {
      allCondataold = hirerarchiall.filter((item) => {
        if ((item.company === company || item.company === "All") && item.branch === "" && item.unit === "" && item.team === "" && item.department === "" && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All")) {
          return item;
        }
      });
      condition1 = hirerarchiall.filter((item) => {
        if (item.company === company && item.branch === "" && item.unit === "" && item.team === "" && item.department === "" && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All")) {
          return item;
        }
      });
      condition4 = hirerarchiall.filter((item) => {
        // item.team === team && item.access === "all"
        if ((item.team === team || item.team === "All") && (item.unit === unit || item.unit === "All") && (item.branch === branch || item.branch === "All") && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All") && (item.company === company || item.company === "All")) {
          return item;
        }
      });
      condition2 = hirerarchiall.filter((item) => {
        if ((item.branch === branch || item.branch === "All") && item.unit === "" && item.team === "" && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All") && (item.company === company || item.company === "All")) {
          return item;
        }
      });
      condition3 = hirerarchiall.filter((item) => {
        if ((item.unit === unit || item.unit === "All") && (item.branch === branch || item.branch === "All") && item.team === "" && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All") && (item.company === company || item.company === "All")) {
          return item;
        }
      });
      condition6 = hirerarchiall.filter((item) => {
        if ((item.department === department || item.department == "All") && item.branch === "" && item.unit === "" && item.team === "" && item.access === "all" && (item.designationgroup === designationGrp.group || item.designationgroup === "All") && (item.company === company || item.company === "All")) {
          return item;
        }
      });
    }

    let allCondataoldval = allCondataold && allCondataold.length > 0 ? allCondataold : [];
    let con1value = condition1 && condition1.length > 0 ? condition1 : [];
    let con2value = condition2 && condition2.length > 0 ? condition2 : [];
    let con3value = condition3 && condition3.length > 0 ? condition3 : [];
    let con4value = condition4 && condition4.length > 0 ? condition4 : [];
    let con6value = condition6 && condition6.length > 0 ? condition6 : [];
    allCondata = [...allCondataoldval, ...con1value, ...con2value, ...con3value, ...con4value, ...con6value];

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hirerarchiall) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({
    hirerarchiall,
    allCondata,
    hirerarchi,
    allCondataolddata,
  });

});


exports.hierarchyEditMatchcheck = catchAsyncErrors(async (req, res, next) => {
  let hirerarchi, hierarchyemp, hierarchysameempmodelevcont, hierarchysuplvl, hierarchysamesupemp;
  try {
    let query = req.body.department === "" ?
      {
        branch: req.body.branch,
        designationgroup: req.body.designationgroup,
        unit: req.body.unit,
        team: req.body.team,
        supervisorchoose: {
          $in: req.body.supervisorchoose,
        },
        mode: req.body.mode,
        level: req.body.level,
        employeename: {
          $in: req.body.employeename,
        },
        _id: {
          $nin: req.body.unids,
        },
      } : {
        designationgroup: req.body.designationgroup,
        department: req.body.department,
        supervisorchoose: {
          $in: req.body.supervisorchoose,
        },
        mode: req.body.mode,
        level: req.body.level,
        employeename: {
          $in: req.body.employeename,
        },
        _id: {
          $nin: req.body.unids,
        },
      };


    hirerarchi = await Hirerarchi.find(query, {});

    let queryemp = req.body.department === "" ? {
      branch: req.body.branch,
      designationgroup: req.body.designationgroup,
      unit: req.body.unit,
      team: req.body.team,
      level: req.body.level,
      supervisorchoose: {
        $in: req.body.supervisorchoose,
      },
      employeename: {
        $in: req.body.employeename,
      },
      _id: {
        $nin: req.body.unids,
      },
    } : {
      designationgroup: req.body.designationgroup,
      department: req.body.department,
      level: req.body.level,
      supervisorchoose: {
        $in: req.body.supervisorchoose,
      },
      employeename: {
        $in: req.body.employeename,
      },
      _id: {
        $nin: req.body.unids,
      },

    };

    hierarchyemp = await Hirerarchi.find(queryemp, {});

    let querysuplvl = req.body.department === "" ? {
      branch: req.body.branch,
      designationgroup: req.body.designationgroup,
      unit: req.body.unit,
      team: req.body.team,
      supervisorchoose: {
        $in: req.body.supervisorchoose,
      },
      employeename: {
        $in: req.body.employeename,
      },
      mode: req.body.mode,
      _id: {
        $nin: req.body.unids,
      },
    } : {
      designationgroup: req.body.designationgroup,
      department: req.body.department,
      mode: req.body.mode,
      supervisorchoose: {
        $in: req.body.supervisorchoose,
      },
      employeename: {
        $in: req.body.employeename,
      },
      _id: {
        $nin: req.body.unids,
      },
    };

    hierarchysuplvl = await Hirerarchi.find(querysuplvl, {});

    let querysamesupemp = req.body.department === "" ? {
      branch: req.body.branch,
      designationgroup: req.body.designationgroup,
      unit: req.body.unit,
      team: req.body.team,
      supervisorchoose: {
        $in: req.body.supervisorchoose,
      },
      employeename: {
        $in: req.body.employeename,
      },
      _id: {
        $nin: req.body.unids,
      },
    } : {
      designationgroup: req.body.designationgroup,
      department: req.body.department,
      supervisorchoose: {
        $in: req.body.supervisorchoose,
      },
      employeename: {
        $in: req.body.employeename,
      },
      _id: {
        $nin: req.body.unids,
      },
    };

    hierarchysamesupemp = await Hirerarchi.find(querysamesupemp, {});

    let queryControl = req.body.department === "" ?
      {
        branch: req.body.branch,
        designationgroup: req.body.designationgroup,
        unit: req.body.unit,
        team: req.body.team,
        mode: req.body.mode,
        level: req.body.level,
        control: req.body.control,
        employeename: {
          $in: req.body.employeename,
        },
        _id: {
          $nin: req.body.unids,
        },
      } : {
        designationgroup: req.body.designationgroup,

        department: req.body.department,
        control: req.body.control,
        mode: req.body.mode,
        level: req.body.level,
        employeename: {
          $in: req.body.employeename,
        },
        _id: {
          $nin: req.body.unids,
        },
      };

    hierarchysameempmodelevcont = await Hirerarchi.find(queryControl, {});

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    hirerarchi,
    hierarchyemp,
    hierarchysuplvl,
    hierarchysamesupemp,
    hierarchysameempmodelevcont
  });
});


//get not assign hierarchy data
exports.getNotAssignHierarchyData = catchAsyncErrors(async (req, res, next) => {
  let hierarchy, removedDuplicates, teamall, filtered, filtered2, filtered1, flattenedFiltered, removedDuplicatesTeam, branchall, notassignlistteam, designationGrp, notassignlist, controls, overallNotassign;
  try {
    hierarchy = await Hirerarchi.find();
    const removeDuplicates = (arr) => {
      const seen = new Set();
      return arr.filter((obj) => {
        const key = `${obj.designationgroup}-${obj.department}-${obj.company}-${obj.branch}-${obj.unit}-${obj.team}-${obj.level}`;
        if (!seen.has(key)) {
          seen.add(key);
          return true;
        }
        return false;
      });
    };

    removedDuplicates = removeDuplicates(hierarchy);

    const Priorities = ["Primary", "Secondary", "Tertiary"];

    teamall = await Teams.find();
    designationGrp = await Designationgroup.find();
    branchall = await Branch.find();
    controls = await Controls.find();

    const removeDuplicatesTeam = (arr) => {
      const seen = new Set();
      return arr.filter((obj) => {
        const key = `${obj.department}-${obj.branch}-${obj.unit}`;
        if (!seen.has(key)) {
          seen.add(key);
          return true;
        }
        return false;
      });
    };

    removedDuplicatesTeam = removeDuplicatesTeam(teamall);

    const altered = removedDuplicatesTeam.map((item) => ({ branch: item.branch, teamname: "All", department: item.department, unit: item.unit }));


    let overallTeam = [...teamall, ...altered];

    notassignlistteam = overallTeam.flatMap((item) => Priorities.map((priority) => ({ team: item.teamname, branch: item.branch, company: branchall?.find((br) => br.name === item.branch)?.company, unit: item.unit, department: item.department, level: priority })));

    notassignlist = notassignlistteam.flatMap((item) => designationGrp.map((grp) => ({ team: item.team, branch: item.branch, company: item.company, department: item.department, unit: item.unit, level: item.level, designationgroup: grp.name })));

    overallNotassign = notassignlist.flatMap((item) => controls.map((ctrl) => ({ team: item.team, branch: item.branch, company: item.company, department: item.department, unit: item.unit, level: item.level, designationgroup: item.designationgroup, control: ctrl.name })));

    filtered = overallNotassign.filter((obj1) => !removedDuplicates.some((obj2) => `${obj2.designationgroup}-${obj2.department}-${obj2.company}-${obj2.branch}-${obj2.unit}-${obj2.team}-${obj2.level}` === `${obj1.designationgroup}-${obj2.department === "" ? "" : obj1.department}-${obj1.company}-${obj2.branch === "" ? "" : obj1.branch}-${obj2.unit === "" ? "" : obj1.unit}-${obj2.team === "" ? "" : obj1.team}-${obj1.level}`));
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!hierarchy) {
    return next(new ErrorHandler("Hierarchy not found!", 404));
  }
  return res.status(200).json({
    hierarchy,
    removedDuplicates,
    overallNotassign,
    filtered,
    flattenedFiltered,
  });
});

// Create new Hirerarchi => /api/hirerarchi/new
exports.addHirerarchi = catchAsyncErrors(async (req, res, next) => {
  let ahirerarchi = await Hirerarchi.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single Hirerarchi => /api/hirerarchi/:id
exports.getSingleHirerarchi = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let shirerarchi = await Hirerarchi.findById(id);
  if (!shirerarchi) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({
    shirerarchi,
  });
});

// update Hirerarchi by id => /api/hirerarchi/:id
exports.updateHirerarchi = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uhirerarchi = await Hirerarchi.findByIdAndUpdate(id, req.body);
  if (!uhirerarchi) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete Hirerarchi by id => /api/hirerarchi/:id
exports.deleteHirerarchi = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dhirerarchi = await Hirerarchi.findByIdAndRemove(id);
  if (!dhirerarchi) {
    return next(new ErrorHandler("Hirerarchi not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.getAllHierarchyListSalary = catchAsyncErrors(async (req, res, next) => {
  let result, hierarchy, resultAccessFilter, DataAccessMode = false, filteredoverall, hierarchySecond, hierarchyMap, resulted, resultedTeam, hierarchyFinal, hierarchyDefault;

  try {
    const { listpageaccessmode } = req.body;

    let levelFinal = req.body?.sector === "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body?.sector];
    let answer = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose: req?.body?.username, // Match supervisorchoose with username
          level: { $in: levelFinal }, // Corrected unmatched quotation mark
        },
      },
      {
        $lookup: {
          from: 'reportingheaders',
          let: {
            teamControlsArray: {
              $ifNull: ['$pagecontrols', []],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ['$name', '$$teamControlsArray'],
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        '$reportingnew', // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ],
                    }, // Additional condition for reportingnew array
                  ],
                },
              },
            },
          ],
          as: 'reportData', // The resulting matched documents will be in this field
        },
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1,
        },
      },
    ]);
    let restrictList = answer?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);


    if (listpageaccessmode === "Reporting to Based") {
      let usersss = await User.find(
        {
          enquirystatus: {
            $nin: ["Enquiry Purpose"],
          },
          resonablestatus: {
            $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
          },
          reportingto: req.body.username,
        },
        {
          empcode: 1,
          companyname: 1,
        }
      ).lean();
    }

    result = await User.find(
      {
        enquirystatus: {
          $nin: ["Enquiry Purpose"],
        },
        // resonablestatus: {
        //   $nin: ["Releave Employee", "Absconded", "Hold", "Terminate"],
        // },
      },
      {
        companyname: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        originalpassword: 1,
        resonablestatus: 1,
        username: 1,
        // _id: 1
      }
    );
    const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
    DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
    const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);
    console.log(DataAccessMode, uniqueNames?.length, pageControlsData?.length, "Length")
    //myhierarchy dropdown
    if (req.body.hierachy === "myhierarchy" && (listpageaccessmode === "Hierarchy Based" || listpageaccessmode === "Overall")) {
      hierarchy = await Hirerarchi.find({
        supervisorchoose: req.body.username,
        level: req.body.sector,
      });
      hierarchyDefault = await Hirerarchi.find({
        supervisorchoose: req.body.username,
      });

      let answerDef = hierarchyDefault.map((data) => data.employeename);

      hierarchyFinal = req.body.sector === "all" ? (answerDef.length > 0 ? [].concat(...answerDef) : []) : hierarchy.length > 0 ? [].concat(...hierarchy.map((item) => item.employeename)) : [];
      hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];

      hierarchyfilter = await Hirerarchi.find({
        supervisorchoose: req.body.username,
        level: "Primary",
      });
      resulted = result.filter((data) => hierarchyMap.includes(data.companyname));
    }
    // all hierarchy list dropdown
    if (req.body.hierachy === "allhierarchy" && (listpageaccessmode === "Hierarchy Based" || listpageaccessmode === "Overall")) {
      hierarchySecond = await Hirerarchi.find({}, { employeename: 1, supervisorchoose: 1, level: 1, control: 1 });

      let sectorFinal = req.body.sector == "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body.sector];

      hierarchyDefault = await Hirerarchi.find({
        supervisorchoose: req.body.username,
        level: { $in: sectorFinal },
      });

      let answerDef = hierarchyDefault.map((data) => data.employeename).flat();

      function findEmployeesRecursive(currentSupervisors, processedSupervisors, result) {
        const filteredData = hierarchySecond.filter((item) => item.supervisorchoose.some((supervisor) => currentSupervisors.includes(supervisor) && !processedSupervisors.has(supervisor)));

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
      let answerDeoverall = filteredOverallItem.filter((data) => (req.body.sector == "all" ? ["Primary", "Secondary", "Tertiary"].includes(data.level) : data.level == req.body.sector)).map((item) => item.employeename[0]);

      resultedTeam = result.filter((data) => answerDeoverall.includes(data.companyname));

      let hierarchyallfinal = await Hirerarchi.find({
        employeename: { $in: answerDeoverall.map((item) => item) },
        level: req.body.sector,
      });
      hierarchyFinal = req.body.sector === "all" ? (answerDeoverall.length > 0 ? [].concat(...answerDeoverall) : []) : hierarchyallfinal.length > 0 ? [].concat(...hierarchyallfinal.map((item) => item.employeename)) : [];
    }
    //my + all hierarchy list dropdown
    if (req.body.hierachy === "myallhierarchy" && (listpageaccessmode === "Hierarchy Based" || listpageaccessmode === "Overall")) {
      hierarchySecond = await Hirerarchi.find({}, { employeename: 1, supervisorchoose: 1, level: 1, control: 1 });

      let sectorFinal = req.body.sector == "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body.sector];

      hierarchyDefault = await Hirerarchi.find({
        supervisorchoose: req.body.username,
        level: { $in: sectorFinal },
      });

      let answerDef = hierarchyDefault.map((data) => data.employeename);

      function findEmployeesRecursive(currentSupervisors, processedSupervisors, result) {
        const filteredData = hierarchySecond.filter((item) => item.supervisorchoose.some((supervisor) => currentSupervisors.includes(supervisor) && (req.body.sector == "all" ? ["Primary", "Secondary", "Tertiary"].includes(item.level) : req.body.sector == item.level) && !processedSupervisors.has(supervisor)));

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
      let answerDeoverall = filteredOverallItem.filter((data) => (req.body.sector == "all" ? ["Primary", "Secondary", "Tertiary"].includes(data.level) : data.level == req.body.sector)).map((item) => item.employeename[0]);

      filteredoverall = result.filter((data) => answerDeoverall.includes(data.companyname));
    }

    if (listpageaccessmode === "Reporting to Based") {
      reportingtobaseduser = result;
    }

    let finalsupervisor = DataAccessMode ? uniqueNames : (req.body.hierachy == "myhierarchy" ? resulted?.map((Data) => Data?.companyname) : req.body.hierachy == "allhierarchy" ? resultedTeam?.map((Data) => Data?.companyname) : filteredoverall?.map((Data) => Data?.companyname));
    const finalResultTask = await User.find(
      {
        enquirystatus: {
          $nin: ["Enquiry Purpose"],
        },
        companyname: { $in: finalsupervisor },
        // resonablestatus: {
        //   $nin: ["Releave Employee", "Absconded", "Hold", "Terminate"],
        // },
      },
      {
        companyname: 1,
        branch: 1,
        company: 1,
        unit: 1,
        team: 1,
        department: 1,
        originalpassword: 1,
        resonablestatus: 1,
        username: 1,
        // _id: 1
      }
    );
    const restrictTeam = await Hirerarchi.aggregate([
      {
        $match: {
          $or: [
            {
              supervisorchoose: { $in: finalsupervisor }, // Matches if supervisorchoose field has a value in finalsupervisor
            },
            {
              employeename: { $in: finalsupervisor }, // Matches if employeename field has a value in finalsupervisor
            },
          ],
          level: { $in: levelFinal }, // Matches if level field has a value in levelFinal
        },
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: {
            teamControlsArray: {
              $ifNull: ["$pagecontrols", []],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$name", "$$teamControlsArray"],
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        "$reportingnew", // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ],
                    }, // Additional condition for reportingnew array
                  ],
                },
              },
            },
          ],
          as: "reportData", // The resulting matched documents will be in this field
        },
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1,
        },
      },
    ]);


    let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);

    let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === 'myhierarchy' ?
      restrictList : req.body.hierachy === 'allhierarchy' ?
        restrictListTeam : [...restrictList, ...restrictListTeam]);

    const resultAccessFilterHierarchy = DataAccessMode ? finalResultTask : (req.body.hierachy === "myhierarchy" ?
      resulted : req.body.hierachy === "allhierarchy" ? resultedTeam :
        filteredoverall);




    resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFilterHierarchy?.filter((data) => overallRestrictList?.includes(data?.companyname)) : [];
  } catch (err) {
    // console.log(err, "err");
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    resultAccessFilter,
    resultedTeam,
    DataAccessMode
  });
});



exports.getAllNoticeHierarchyList = catchAsyncErrors(async (req, res, next) => {
  let resultAccessFilter, filteredoverall, hierarchySecond;


  try {
    const { listpageaccessmode = "Hierarchy Based" } = req.body;

    let prodresult;

    if (listpageaccessmode === "Reporting to Based") {
      let reportingusers = await User.find(
        {
          enquirystatus: {
            $nin: ["Enquiry Purpose"],
          },
          resonablestatus: {
            $nin: [
              "Not Joined",
              "Postponed",
              "Rejected",
              "Closed",
              "Releave Employee",
              "Absconded",
              "Hold",
              "Terminate",
            ],

          },
          reportingto: req.body.username,
        },
        {
          empcode: 1,
          companyname: 1,
        }
      ).lean();
      const companyNames = reportingusers.map((user) => user.companyname);
      prodresult = await Noticeperiod.find({
        empname: { $in: companyNames }, // Use companyNames array here
      });
    } else {
      prodresult = await Noticeperiod.find();
    }

    //myhierarchy dropdown
    // if (req.body.hierachy === "myallhierarchy") {
    hierarchySecond = await Hirerarchi.find(
      {},
      { employeename: 1, supervisorchoose: 1, level: 1, control: 1 }
    );
    hierarchyDefault = await Hirerarchi.find(
      { supervisorchoose: { $in: [req.body.username] } },
      {}
    );

    function findEmployeesRecursive(
      currentSupervisors,
      processedSupervisors,
      result
    ) {
      const filteredData = hierarchySecond.filter((item) =>
        item.supervisorchoose.some(
          (supervisor) =>
            currentSupervisors.includes(supervisor) &&
            !processedSupervisors.has(supervisor)
        )
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

      return findEmployeesRecursive(
        uniqueNewEmployees,
        processedSupervisors,
        result
      );
    }

    const processedSupervisors = new Set();
    const filteredOverallItem = findEmployeesRecursive(
      [req.body.username],
      processedSupervisors,
      []
    );
    let answerDeoverall = filteredOverallItem
      .filter((data) =>
        req.body.sector == "all"
          ? ["Primary", "Secondary", "Tertiary"].includes(data.level)
          : data.level == req.body.sector
      )
      .map((item) => item.employeename[0]);

    filteredoverall = prodresult
      .map((userObj) => {
        const matchingHierarchycontrol = filteredOverallItem.find(
          (hierarchyObj) => hierarchyObj.employeename[0] == userObj.empname
        );
        return {
          empname: userObj.empname,
          empcode: userObj.empcode,
          company: userObj.company,
          branch: userObj.branch,
          unit: userObj.unit,
          team: userObj.team,
          department: userObj.department,
          reasonleavingname: userObj.reasonleavingname,
          approvenoticereq: userObj.approvenoticereq,
          status: userObj.status,
          noticedate: userObj.noticedate,
          files: userObj.files,
          requestdatestatus: userObj.requestdatestatus,
          cancelstatus: userObj.cancelstatus,
          continuestatus: userObj.continuestatus,
          meetingscheduled: userObj.meetingscheduled,
          requestdatereason: userObj.requestdatereason,
          approvedStatus: userObj.approvedStatus,
          approvedthrough: userObj.approvedthrough,
          rejectStatus: userObj.rejectStatus,
          recheckStatus: userObj.recheckStatus,
          rejectnoticereq: userObj.rejectnoticereq,
          cancelreason: userObj.cancelreason,
          continuereason: userObj.continuereason,
          _id: userObj._id,
        };
      })
      .filter((data) => answerDeoverall.includes(data.empname));

    let hierarchyallfinal = await Hirerarchi.find({
      employeename: { $in: answerDeoverall.map((item) => item) },
      level: req.body.sector,
    });
    hierarchyFinal =
      req.body.sector === "all"
        ? answerDeoverall.length > 0
          ? [].concat(...answerDeoverall)
          : []
        : hierarchyallfinal.length > 0
          ? [].concat(...hierarchyallfinal.map((item) => item.employeename))
          : [];

    resultAccessFilter = filteredoverall;

    resultAccessFilter =
      listpageaccessmode === "Hierarchy Based" ||
        listpageaccessmode === "Overall"
        ? filteredoverall
        : prodresult;
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!resultAccessFilter) {
  //   return next(new ErrorHandler("No data found!", 404));
  // }
  return res.status(200).json({
    resultAccessFilter,
  });
});
exports.getAllHierarchyReportingTo = catchAsyncErrors(async (req, res, next) => {
  let result;
  try {
    const { company, branch, unit, team, companyname } = req.body;
    const resultHierarchy = await Hirerarchi.aggregate([
      {
        $facet: {
          matchedData: [
            {
              $match: {
                $and: [
                  { team: team },
                  { supervisorchoose: { $nin: [companyname] } }
                ]
              }
            },
            { $unwind: "$supervisorchoose" },
            { $group: { _id: null, supervisorchoose: { $addToSet: "$supervisorchoose" } } },
            { $project: { _id: 0, supervisorchoose: 1 } }
          ],
          allData: [
            {
              $match:
              {
                $and: [
                  { $or: [{ company: company }, { company: "All" }] },
                  { $or: [{ branch: branch }, { branch: "All" }] },
                  { $or: [{ unit: unit }, { unit: "All" }] },
                  {
                    $or: [
                      { team: "All" }
                    ]
                  }
                ]
              }
              ,
            },
            { $unwind: "$supervisorchoose" },
            { $group: { _id: null, supervisorchoose: { $addToSet: "$supervisorchoose" } } },
            { $project: { _id: 0, supervisorchoose: 1 } }
          ]
        }
      },
      {
        $project: {
          result: {
            $cond: {
              if: { $gt: [{ $size: "$matchedData" }, 0] },
              then: "$matchedData",
              else: "$allData"
            }
          }
        }
      },
      { $unwind: "$result" }
    ]
    );

    //console.log(req?.body ,resultHierarchy[0]?.result?.supervisorchoose, 'req');

    const companyNamesResult = resultHierarchy?.length > 0 ? resultHierarchy[0]?.result?.supervisorchoose : []
    resultUsers = await User.find({
      resonablestatus: {
        $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"]
      },
      companyname: { $in: companyNamesResult }
    }, { companyname: 1 });

    result = [
      {
        result: {
          supervisorchoose: resultUsers?.length > 0 ? resultUsers?.map(data => data?.companyname) : []
        }
      }
    ];

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result,
  });
});
// Newly Added Hierarchy User Based Restriction


exports.getAllUserReportingToChange = catchAsyncErrors(async (req, res, next) => {
  let result, result2;
  try {
    const { replacename, oldname } = req.body;
    result = await User.find({ reportingto: oldname }, { _id: 1, companyname: 1, username: 1 }).lean();

    const idsToUpdate = result?.map(doc => doc?.username);
    // Step 3: Update all documents with the new `reportingto` value
    if (idsToUpdate?.length > 0) {
      const updateResult = await User.updateMany(
        { username: { $in: idsToUpdate } },
        { $set: { reportingto: replacename } } // Update the `reportingto` field
      );
    }
  } catch (err) {
    console.log(err, "err")
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    result,
  });
});



exports.getUserBasedHierarchyRestriction = catchAsyncErrors(async (req, res, next) => {
  let result;
  try {
    const { username, company, branch, unit, team, designation } = req.body;

    const designationGroup = await Designation.findOne({ name: designation })


    result = await Hirerarchi.aggregate([
      {
        $facet: {
          // First facet to match by employeename
          allvalues: [
            {
              $match: {
                employeename: username
              }
            }
          ],
          desigAll: [
            {
              $match: {
                employeename: username,
                designationgroup: "All",
                team: team // Match with the specified team
              }
            }
          ],
          teamDesigAll: [
            {
              $match: {
                employeename: "All", // Fixed: Should be 'employeename'
                team: team,
                designationgroup: designationGroup?.group  // Match where designation group is "All"
              }
            }
          ],
          userDesigAll: [
            {
              $match: {
                employeename: "All",
                team: team,
                designationgroup: "All"
              }
            }
          ],
          userdesigvalue: [
            {
              $match: {
                employeename: username,
                team: "All",
                designationgroup: designationGroup?.group // Match by designation group
              }
            }
          ],
          userteamAll: [
            {
              $match: {
                employeename: "All",
                team: "All",
                designationgroup: designationGroup?.group // Match where designation group is "All"
              }
            }
          ],
          desigteamaAll: [
            {
              $match: {
                employeename: username,
                designationgroup: "All",
                team: "All" // Match where team is "All"
              }
            }
          ],
          everyall: [
            {
              $match: {
                employeename: "All",
                designationgroup: "All",
                team: "All" // Match where team is "All"
              }
            }
          ],



        }
      },
      {
        $project: {
          matches: {
            $cond: {
              if: { $gt: [{ $size: "$allvalues" }, 0] },
              then: "$allvalues",
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$desigAll" }, 0] },
                  then: "$desigAll",
                  else: {
                    $cond: {
                      if: { $gt: [{ $size: "$teamDesigAll" }, 0] },
                      then: "$teamDesigAll",
                      else: {
                        $cond: {
                          if: { $gt: [{ $size: "$userDesigAll" }, 0] },
                          then: "$userDesigAll",
                          else: {
                            $cond: {
                              if: { $gt: [{ $size: "$userdesigvalue" }, 0] },
                              then: "$userdesigvalue",
                              else: {
                                $cond: {
                                  if: { $gt: [{ $size: "$userteamAll" }, 0] },
                                  then: "$userteamAll",
                                  else: {
                                    $cond: {
                                      if: { $gt: [{ $size: "$desigteamaAll" }, 0] },
                                      then: "$desigteamaAll",
                                      else: {
                                        $cond: {
                                          if: { $gt: [{ $size: "$everyall" }, 0] },
                                          then: "$everyall",
                                          else: [] // Return an empty array if no matches
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);


  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));

  }

  return res.status(200).json({
    result,
  });
});

// get All Hirerarchi Deisgnation Log Relation=> /api/ss
exports.getAllHierarchyDesignationLogRelations = catchAsyncErrors(async (req, res, next) => {
  let newdata, olddata, olddataEmp;
  let { designation, desiggroup, user } = req.body;
  try {

    const CompanyStatus = req.body.company === 'none' ? user.company : req.body.company;
    const BranchStatus = req.body.branch === 'none' ? user.branch : req.body.branch;
    const UnitStatus = req.body.unit === 'none' ? user.unit : req.body.unit;
    const TeamStatus = req.body.team === 'none' ? user.team : req.body.team;
    const DepartmentStatus = req.body.department === 'none' ? user.department : req.body.department;
    console.log(user?.boardingLog?.length, desiggroup, BranchStatus, UnitStatus, TeamStatus, DepartmentStatus, "desig group")
    //Supervisor
    //checking the data exist for new Hierarchy Group with conditions (department ? department : team )
    newdata = await Hirerarchi.aggregate([
      {
        $match: {
          designationgroup: { $in: [desiggroup, "All"] },
          employeename: { $ne: user?.companyname },
          supervisorchoose: { $ne: user?.companyname },
        }
      },
      {
        $facet: {
          nonEmptyDepartment: [
            {
              $match: {
                department: { $ne: "" }
              }
            },
            {
              $match: {
                department: {
                  $in: [DepartmentStatus, "All"]
                }
              }
            }
          ],
          emptyDepartment: [
            {
              $match: {
                department: { $eq: "" },
              }
            },
            {
              $match: {
                branch: { $in: [BranchStatus, "All"] },
                unit: { $in: [UnitStatus, "All"] },
                team: { $in: [TeamStatus] }
              }
            }
          ],
          emptyDepartmentAll: [
            {
              $match: {
                department: { $eq: "" },
              }
            },
            {
              $match: {
                branch: { $in: [BranchStatus, "All"] },
                unit: { $in: [UnitStatus, "All"] },
                team: { $in: ["All"] }
              }
            }
          ],
        }
      },
      {
        $project: {
          primaryDep: {
            $filter: {
              input: "$emptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryDep: {
            $filter: {
              input: "$emptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryDep: {
            $filter: {
              input: "$emptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          },
          primaryDepAll: {
            $filter: {
              input: "$emptyDepartmentAll",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryDepAll: {
            $filter: {
              input: "$emptyDepartmentAll",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryDepAll: {
            $filter: {
              input: "$emptyDepartmentAll",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          },
          primaryNotDep: {
            $filter: {
              input: "$nonEmptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryNotDep: {
            $filter: {
              input: "$nonEmptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryNotDep: {
            $filter: {
              input: "$nonEmptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          }
        }
      }
    ]

    );



    //identify the user data related to the companyname to replace
    olddata = await Hirerarchi.aggregate([
      {
        "$match": {
          "supervisorchoose": user?.companyname,
          "$expr": {
            "$cond": [
              {
                "$ne": [
                  { "$ifNull": ["$department", ""] },
                  ""
                ]
              },
              {
                "$or": [
                  { "department": user?.department },
                  { "department": "All" }
                ]
              },
              {
                "$and": [
                  { "unit": user?.unit },
                  {
                    "$or": [
                      { "team": user?.team },
                      { "team": "All" }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    ]
    );

    // Employee
    //identify the user data related to the companyname to replace
    olddataEmp = await Hirerarchi.aggregate([
      {
        $match: {
          employeename: user?.companyname,
        }
      }
    ]
    );

    console.log(olddataEmp?.length , user?.companyname)
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    newdata, olddata, olddataEmp
  });
});


// get All Hirerarchi Deisgnation Log Relation=> /api/sds
exports.getAllReportingToDesignationUserHierarchyRelation = catchAsyncErrors(async (req, res, next) => {
  let newdata;
  let { designation, desiggroup, user } = req.body;
  try {
    const CompanyStatus = req.body.company === 'none' ? user.company : req.body.company;
    const BranchStatus = req.body.branch === 'none' ? user.branch : req.body.branch;
    const UnitStatus = req.body.unit === 'none' ? user.unit : req.body.unit;
    const TeamStatus = req.body.team === 'none' ? user.team : req.body.team;
    const DepartmentStatus = req.body.department === 'none' ? user.department : req.body.department;
    console.log(DepartmentStatus, "DepartmentStatus")
    //Supervisor
    //checking the data exist for new Hierarchy Group with conditions (department ? department : team )
    newdata = await Hirerarchi.aggregate([
      {
        $match: {
          designationgroup: desiggroup,
          employeename: { $ne: user?.companyname },
          supervisorchoose: { $ne: user?.companyname },
        }
      },
      {
        $facet: {
          nonEmptyDepartment: [
            {
              $match: {
                department: { $ne: "" }
              }
            },
            {
              $match: {
                department: {
                  $in: [DepartmentStatus, "All"]
                }
              }
            }
          ],
          emptyDepartment: [
            {
              $match: {
                department: { $eq: "" },
              }
            },
            {
              $match: {
                branch: { $in: [BranchStatus, "All"] },
                unit: { $in: [UnitStatus, "All"] },
                team: { $in: [TeamStatus] }
              }
            }
          ],
          emptyDepartmentAll: [
            {
              $match: {
                department: { $eq: "" },
              }
            },
            {
              $match: {
                branch: { $in: [user?.branch, "All"] },
                unit: { $in: [user?.unit, "All"] },
                team: { $in: ["All"] }
              }
            }
          ],
        }
      },
      {
        $project: {
          primaryDep: {
            $filter: {
              input: "$emptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryDep: {
            $filter: {
              input: "$emptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryDep: {
            $filter: {
              input: "$emptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          },
          primaryDepAll: {
            $filter: {
              input: "$emptyDepartmentAll",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryDepAll: {
            $filter: {
              input: "$emptyDepartmentAll",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryDepAll: {
            $filter: {
              input: "$emptyDepartmentAll",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          },
          primaryNotDep: {
            $filter: {
              input: "$nonEmptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryNotDep: {
            $filter: {
              input: "$nonEmptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryNotDep: {
            $filter: {
              input: "$nonEmptyDepartment",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          }
        }
      },
      {
        $project: {
          primaryDepLength: { $size: "$primaryDep" },
          secondaryDepLength: { $size: "$secondaryDep" },
          tertiaryDepLength: { $size: "$tertiaryDep" },
          primaryDepAllLength: { $size: "$primaryDepAll" },
          secondaryDepAllLength: { $size: "$secondaryDepAll" },
          tertiaryDepAllLength: { $size: "$tertiaryDepAll" },
          primaryNotDepLength: { $size: "$primaryNotDep" },
          secondaryNotDepLength: { $size: "$secondaryNotDep" },
          tertiaryNotDepLength: { $size: "$tertiaryNotDep" },
          primaryDep: 1,
          secondaryDep: 1,
          tertiaryDep: 1,
          primaryDepAll: 1,
          secondaryDepAll: 1,
          tertiaryDepAll: 1,
          primaryNotDepLength: 1,
          secondaryNotDepLength: 1,
          tertiaryNotDepLength: 1,
        }
      },
      {
        $project: {
          result: {
            $switch: {
              branches: [
                {
                  case: { $gt: ["$primaryDepLength", 0] },
                  then: "$primaryDep"
                },
                {
                  case: { $gt: ["$secondaryDepLength", 0] },
                  then: "$secondaryDep"
                },
                {
                  case: { $gt: ["$tertiaryDepLength", 0] },
                  then: "$tertiaryDep"
                },
                {
                  case: { $gt: ["$primaryDepAllLength", 0] },
                  then: "$primaryDepAll"
                },
                {
                  case: { $gt: ["$secondaryDepAllLength", 0] },
                  then: "$secondaryDepAll"
                },
                {
                  case: { $gt: ["$tertiaryDepAllLength", 0] },
                  then: "$tertiaryDepAll"
                }
                ,
                {
                  case: { $gt: ["$primaryNotDepLength", 0] },
                  then: "$primaryNotDep"
                }
                ,
                {
                  case: { $gt: ["$secondaryNotDepLength", 0] },
                  then: "$secondaryNotDep"
                }
                ,
                {
                  case: { $gt: ["$tertiaryNotDepLength", 0] },
                  then: "$tertiaryNotDep"
                }
              ],
              default: null
            }
          }
        }
      }
    ]
    );

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    newdata
  });
});

exports.getAllHierarchyProcessTeamRelations = catchAsyncErrors(async (req, res, next) => {
  let newdata, olddata, supData;
  let { team, oldteam, user, oldDatasTeam, desiggroup } = req.body;
  try {
    //console.log(oldDatasTeam?.company , oldDatasTeam?.branch , oldDatasTeam?.unit , oldDatasTeam?.team, oldteam, "user")
    console.log(user?.company, user?.branch, user?.unit, user?.team, oldteam, "user")

    newdata = await Hirerarchi.aggregate([
      {
        $facet: {
          team: [
            {
              $match: {
                designationgroup: { $in: [desiggroup, "All"] },
                branch: { $in: [user?.branch, "All"] },
                unit: { $in: [user?.unit, "All"] },
                employeename: { $nin: [user.companyname] },
                team: team
              }
            }
          ],
          all: [
            {
              $match: {
                designationgroup: { $in: [desiggroup, "All"] },
                branch: { $in: [user?.branch, "All"] },
                unit: { $in: [user?.unit, "All"] },
                employeename: { $nin: [user.companyname] },
                team: "All"
              }
            }
          ]
        }
      },
    ]);


    // //identify the user data related to the companyname to replace
    olddata = await Hirerarchi.aggregate([
      {
        $match: {
          designationgroup: { $in: [desiggroup, "All"] },
          branch: { $in: [oldDatasTeam?.branch, "All"] },
          unit: { $in: [oldDatasTeam?.unit, "All"] },
          team: { $in: [oldteam, "All"] },
          employeename: oldDatasTeam.companyname,
        }
      }
    ]);
    supData = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose: user.companyname,
        }
      }
    ]);

  } catch (err) {
    console.log(err, "err")
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    newdata, olddata, supData
    // olddataEmp
  });
});




exports.getNotAssignHierarchyDataBackend = catchAsyncErrors(async (req, res, next) => {
  let teamsdetails, desiglog, designation, combinedResultsArrayIndex, combinedResultsArray, overallNotassign, controls, combinedResultsArrayDepartment;

  try {
    const { assignbranch } = req.body;
    controls = await Designationandcontrolgrouping.find();
    let filterQuery = {};
    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      unit: branchObj.unit,
    }));

    // Use $or to filter incomes that match any of the branch, company, and unit combinations
    if (branchFilter.length > 0) {
      filterQuery = { $or: branchFilter };
    }
    const ans1 = await Hirerarchi.find();
    // Fetch teams and designation logs from the database
    teamsdetails = await Teams.find(filterQuery, { company: 1, branch: 1, unit: 1, teamname: 1, department: 1 });
    desiglog = await DesignationLog.find({}, { department: 1, designation: 1 });
    designation = await DesignationMaster.find({}, { group: 1, name: 1 });

    if (!teamsdetails || !desiglog || !designation) {
      return next(new ErrorHandler("Teams details, Designation log, or Designation Master not found", 404));
    }

    // Combine the data
    const combinedResults = teamsdetails.map(team => {
      // Find the designation(s) that match the department of the current team
      const matchingDesignations = desiglog.filter(log => log.department === team.department);

      // Create a new object with all the necessary fields, matching designations, and group
      return matchingDesignations.map(desig => {
        // Find the matching group from the designation master based on the designation name
        const matchingGroup = designation.find(desigMaster => desigMaster.name === desig.designation);

        return {
          company: team.company,
          branch: team.branch,
          unit: team.unit,
          teamname: team.teamname,
          department: team.department,
          designation: desig.designation,
          group: matchingGroup ? matchingGroup.group : null, // Add group or null if no match is found
        };
      });
    }).flat(); // Flatten the array since map within map creates nested arrays
    const Priorities = ["Primary", "Secondary", "Tertiary"];

    overallNotassign = combinedResults.flatMap((item) => {
      const matchingItems = controls.filter(data => data.designationgroupname === item.group);
      if (matchingItems?.length > 0) {
        return matchingItems.flatMap((ctrl) =>
          Priorities.map((priority) => ({
            team: item.teamname,
            branch: item.branch,
            company: item.company,
            department: item.department,
            unit: item.unit,
            designation: item.designation,
            designationgroup: item.group,
            control: ctrl.controlname,
            level: priority
          }))
        )
      }
      return [];

    }


    );


    // Manual matching process
    combinedResultsArray = overallNotassign.filter(doc1 =>
      !ans1.some(doc2 => {
        if (doc2?.department === "All") {
          return doc1?.designationgroup === doc2?.designationgroup && doc1?.control === doc2?.control && doc1?.level === doc2?.level
        }
        else
          if (doc2?.department !== "All" && doc2?.department !== "") {
            return doc1?.designationgroup === doc2?.designationgroup && doc1?.department === doc2?.department && doc1?.control === doc2?.control && doc1?.level === doc2?.level
          }
          else if (doc2?.department === "") {
            if (doc2?.company === "All") {
              return doc1?.designationgroup === doc2?.designationgroup && doc1?.control === doc2?.control && doc1?.level === doc2?.level
                &&
                doc1?.control === doc2?.control
                && doc1?.level === doc2?.level && doc1?.control === doc2?.control && doc1?.level === doc2?.level
            }
            else if (doc2?.branch === "All") {
              return doc1?.designationgroup === doc2?.designationgroup
                && doc1?.company === doc2?.company && doc1?.control === doc2?.control && doc1?.level === doc2?.level
            }
            else if (doc2?.unit === "All") {
              return doc1?.designationgroup === doc2?.designationgroup && doc1?.company === doc2?.company
                && doc1?.branch === doc2?.branch && doc1?.control === doc2?.control && doc1?.level === doc2?.level
            }
            else if (doc2?.team === "All") {

              return doc1?.designationgroup === doc2?.designationgroup && doc1?.company === doc2?.company
                & doc1?.branch === doc2?.branch && doc1?.unit === doc2?.unit && doc1?.control === doc2.control
                && doc1?.level === doc2?.level
            }
            else if (doc2?.team !== "All" && doc2?.unit !== "All" && doc2?.branch !== "All" && doc2?.company !== "All") {
              return doc1?.designationgroup === doc2?.designationgroup && doc1?.company === doc2?.company
                && doc1?.branch === doc2?.branch && doc1?.unit === doc2?.unit && doc1?.team === doc2?.team
                && doc1?.control === doc2?.control && doc1?.level === doc2?.level
            }
          }
      }
      )
    );
    const index = Number(req?.body?.id);
    combinedResultsArrayIndex = combinedResultsArray[index - 1];


    return res.status(200).json({
      combinedResultsArray,
      combinedResultsArrayIndex
    });
  } catch (err) {

    return next(new ErrorHandler("Records not found!", 404));
  }
});

exports.getAllReportingToUserHierarchyRelation = catchAsyncErrors(async (req, res, next) => {
  let newdata, olddata, supData;
  let { team, oldteam, user, desiggroup } = req.body;
  try {
    newdata = await Hirerarchi.aggregate([
      {
        $facet: {
          team: [
            {
              $match: {
                designationgroup: { $in: [desiggroup, "All"] },
                branch: { $in: [user?.branch, "All"] },
                unit: { $in: [user?.unit, "All"] },
                team: team
              }
            }
          ],
          all: [
            {
              $match: {
                designationgroup: { $in: [desiggroup, "All"] },
                branch: { $in: [user?.branch, "All"] },
                unit: { $in: [user?.unit, "All"] },
                team: "All"
              }
            }
          ]
        }
      },
      {
        $project: {
          primaryDep: {
            $filter: {
              input: "$team",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryDep: {
            $filter: {
              input: "$team",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryDep: {
            $filter: {
              input: "$team",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          },
          primaryDepAll: {
            $filter: {
              input: "$all",
              as: "item",
              cond: { $eq: ["$$item.level", "Primary"] }
            }
          },
          secondaryDepAll: {
            $filter: {
              input: "$all",
              as: "item",
              cond: { $eq: ["$$item.level", "Secondary"] }
            }
          },
          tertiaryDepAll: {
            $filter: {
              input: "$all",
              as: "item",
              cond: { $eq: ["$$item.level", "Tertiary"] }
            }
          },
        }
      },
      {
        $project: {
          primaryDepLength: { $size: "$primaryDep" },
          secondaryDepLength: { $size: "$secondaryDep" },
          tertiaryDepLength: { $size: "$tertiaryDep" },
          primaryDepAllLength: { $size: "$primaryDepAll" },
          secondaryDepAllLength: { $size: "$secondaryDepAll" },
          tertiaryDepAllLength: { $size: "$tertiaryDepAll" },
          primaryDep: 1,
          secondaryDep: 1,
          tertiaryDep: 1,
          primaryDepAll: 1,
          secondaryDepAll: 1,
          tertiaryDepAll: 1,
        }
      },
      {
        $project: {
          result: {
            $switch: {
              branches: [
                {
                  case: { $gt: ["$primaryDepLength", 0] },
                  then: "$primaryDep"
                },
                {
                  case: { $gt: ["$secondaryDepLength", 0] },
                  then: "$secondaryDep"
                },
                {
                  case: { $gt: ["$tertiaryDepLength", 0] },
                  then: "$tertiaryDep"
                },
                {
                  case: { $gt: ["$primaryDepAllLength", 0] },
                  then: "$primaryDepAll"
                },
                {
                  case: { $gt: ["$secondaryDepAllLength", 0] },
                  then: "$secondaryDepAll"
                },
                {
                  case: { $gt: ["$tertiaryDepAllLength", 0] },
                  then: "$tertiaryDepAll"
                }
              ],
              default: null
            }
          }
        }
      }
    ]);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    newdata, olddata, supData
    // olddataEmp
  });
});

exports.getAllHierarchyActionEmployeesList = catchAsyncErrors(async (req, res, next) => {
  let hierarchyEmpSupSame, hierarchySupempSame, hierarchysup, hierarchyemp;
  const { user, oldname } = req.body;
  // console.log(user  , 'user , hsupervisor  , hemployeename')
  try {
    // const hierarchyOldSupervisor = await Hirerarchi.find({ supervisorchoose: oldname }).lean();
    hierarchySupempSame = await Hirerarchi.find({ supervisorchoose: user?.value, employeename: oldname }).lean();
    hierarchyEmpSupSame = await Hirerarchi.find({ supervisorchoose: oldname, employeename: user?.value }).lean();


    // orginal Data
    const hierarchySupervisor = await Hirerarchi.find({ supervisorchoose: user?.value }).lean();


    // Employeenames and supervisor which we want to edit
    const hierarchyOldSupervisorWithout = await Hirerarchi.find({ supervisorchoose: oldname }).lean();
    const hierarchyOldEmployeenamewithout = await Hirerarchi.find({ employeename: oldname }).lean();

    const checkNewEmp = hierarchySupervisor?.some(data => {
      const empl = data?.employeename;
      const empNames = hierarchyOldSupervisorWithout?.map(d => d.employeename).flat();

      return empl?.some(item => empNames?.includes(item)) &&
        hierarchyOldSupervisorWithout?.some(jem => jem.level === data?.level);
    });


    const checkNewSup = hierarchySupervisor?.some(data => {
      const empl = data?.supervisorchoose;
      const empNames = hierarchyOldSupervisorWithout?.map(d => d.supervisorchoose).flat();

      return empl?.some(item => empNames?.includes(item)) &&
        hierarchyOldEmployeenamewithout?.some(jem => jem.level === data?.level);
    });



    //console.log( checkNewSup, checkNewEmp, 'user');


    hierarchysup = checkNewSup;
    hierarchyemp = checkNewEmp;


  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    hierarchySupempSame, hierarchysup, hierarchyemp, hierarchyEmpSupSame
  });
});
exports.getAllHierarchyBasedEmployeeFind = catchAsyncErrors(async (req, res, next) => {
  let hierarchydata;
  const { companyname, empcode } = req.body;
  try {
    const hierarchyData = await Hirerarchi.aggregate([
      {
        $match: {
          employeename: { $in: [companyname] }  // matches if companyname exists in employeename array
        }
      },
      {
        $project: {
          level: 1,
          supervisorchoose: {
            $cond: [
              { $isArray: "$supervisorchoose" },
              "$supervisorchoose",
              ["$supervisorchoose"]  // convert to array if it's a single value
            ]
          }
        }
      },
      {
        $unwind: "$supervisorchoose"
      },
      {
        $group: {
          _id: "$level",
          supervisors: { $addToSet: "$supervisorchoose" } // removes duplicates automatically
        }
      }
    ]);

    // Convert array result into object format like { Primary: [...], Secondary: [...], Tertiary: [...] }
    const groupedResult = hierarchyData.reduce((acc, curr) => {
      acc[curr._id] = curr.supervisors;
      return acc;
    }, {});

    hierarchydata = groupedResult
    // console.log(groupedSupervisors);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    hierarchydata
  });
});