const DocumentPreparation = require("../../model/modules/documentpreparation");
const Company = require("../../model/modules/setup/company");
const Branch = require("../../model/modules/branch");
const Unit = require("../../model/modules/unit");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const TemplateCreation = require("../../model/modules/TemplateCreationModel");
const User = require("../../model/login/auth");
const AdminOverAllSettings = require("../../model/modules/settings/AdminOverAllSettingsModel");
const IndividualSettings = require("../../model/modules/settings/IndividualSettingsModel");
const Hirerarchi = require('../../model/modules/setup/hierarchy');
const Designation = require("../../model/modules/designation");
const { authenticator } = require("otplib");
const EmployeeDocuments = require('../../model/login/employeedocuments');
const multer = require('multer');
const path = require('path');
const Noticeperiodapply = require("../../model/modules/recruitment/noticeperiodapply");
const { Hierarchyfilter } = require('../../utils/taskManagerCondition');
const Candidate = require("../../model/modules/recruitment/addcandidate");
const Visitors = require("../../model/modules/interactors/visitor");


// Set up storage for PDF files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadsDocuments/');  // Folder to store PDFs
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// get All DocumentPreparation  => /api/DocumentPreparations
exports.getAllDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  try {
    documentPreparation = await DocumentPreparation.find({}, { date: 1, printingstatus: 1, pagesize: 1, printoptions: 1, pageheight: 1, pagewidth: 1, template: 1, templateno: 1, documentname: 1, referenceno: 1, employeemode: 1, department: 1, company: 1, issuingauthority: 1, branch: 1, unit: 1, team: 1, person: 1, proption: 1, tempcode: 1, sign: 1, sealing: 1, email: 1, frommailemail: 1, mail: 1, addedby: 1, issuedpersondetails: 1, updatedby: 1, createdAt: 1, }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!documentPreparation) {
    return next(new ErrorHandler("Document Preparation not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    documentPreparation,
  });
});
// get getDepartmentDesignationBasedOnDate  => /api/departmentdesignationbasedondate
exports.getDepartmentDesignationBasedOnDate = catchAsyncErrors(async (req, res, next) => {
  let finalresult;
  // const { date, usernames } = req?.body;
  try {
    const { date, usernames } = req.body;

    const documentPreparation = await User.findOne(
      { companyname: usernames },
      { department: 1, designation: 1, departmentlog: 1, designationlog: 1 }
    ).lean();

    if (!documentPreparation) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert date to comparable format
    const targetDate = new Date(date);

    // Extract logs
    const { department, designation, departmentlog, designationlog } = documentPreparation;

    // --- 1. DOJ values ---
    const dojdepartment = departmentlog?.[0]?.department || null;
    const dojdesignation = designationlog?.[0]?.designation || null;

    // --- 2. Present values ---
    const presentdepartment = department || null;
    const presentdesignation = designation || null;

    // --- 3. Date-based values ---
    function findLogValue(logArray, key) {
      if (!Array.isArray(logArray) || logArray.length === 0) return null;

      // Sort logs by startdate just to be safe
      const sorted = logArray.sort(
        (a, b) => new Date(a.startdate) - new Date(b.startdate)
      );

      for (let i = 0; i < sorted.length; i++) {
        const current = new Date(sorted[i].startdate);
        const next = sorted[i + 1] ? new Date(sorted[i + 1].startdate) : null;

        // If date is between current and next startdate OR last one
        if (
          (targetDate >= current && next && targetDate < next) ||
          (!next && targetDate >= current)
        ) {
          return sorted[i][key];
        }
      }
      return null;
    }

    const datedepartment = findLogValue(departmentlog, "department");
    const datedesignation = findLogValue(designationlog, "designation");

    // --- Final result ---
    const result = {
      dojdepartment: dojdepartment ?? "",
      dojdesignation: dojdesignation ?? "",
      presentdepartment: presentdepartment ?? "",
      presentdesignation: presentdesignation ?? "",
      datedepartment: datedepartment ?? "",
      datedesignation: datedesignation ?? "",
      usernames: usernames ?? ""
    };


    console.log(result);
    // res.json(result);
    finalresult = result

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    finalresult,
  });
});

exports.getUserslistforEmpDocumentPrintedList = catchAsyncErrors(async (req, res, next) => {
  try {
    let { resonablestatus } = req.body;
    let userteamgroup = [];
    let query = {};

    // Build query from body except 'headers' and 'resonablestatus'
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers" && key !== "resonablestatus") {
        const value = req.body[key];
        if (value !== "ALL" && key !== "pagevalue" && value?.length > 0) {
          query[key] = { $in: value };
        }
      }
    });
    // Handle reasonable status conditions
    if (["Current List", "Notice Period", "Candidate to Intern", "Visitor to Intern", "Intern to live"]?.includes(resonablestatus)) {
      query.resonablestatus = {
        $nin: [
          "Not Joined", "Postponed", "Rejected", "Closed",
          "Releave Employee", "Absconded", "Hold", "Terminate"
        ],
      };
    } else if (resonablestatus && resonablestatus !== "Current List" && resonablestatus !== "Notice Period") {
      query.resonablestatus = resonablestatus;
    }

    // Exclude Enquiry Purpose
    query.enquirystatus = { $nin: ["Enquiry Purpose"] };
    if (["Candidate to Intern", "Visitor to Intern"]?.includes(resonablestatus)) {
      query.workmode = "Internship";
      const DbName = resonablestatus === "Candidate to Intern" ? Candidate : Visitors;
      //  console.log(query, userteamgroup,DbName, "sjbdjssn")
      const userMatch = Object.keys(query).reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});
      const pipeline = [
        {
          $match: {
            directonboardingdetails: { $exists: true, $ne: null },
            finalstatus: "Added"
          }
        },
        {
          $addFields: {
            userid: { $toObjectId: "$directonboardingdetails.employeeid" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "userdetails"
          }
        },
        {
          $match: {
            userdetails: { $elemMatch: userMatch }
          }
        },
        {
          $addFields: {
            company: { $arrayElemAt: ["$userdetails.company", 0] },
            branch: { $arrayElemAt: ["$userdetails.branch", 0] },
            unit: { $arrayElemAt: ["$userdetails.unit", 0] },
            team: { $arrayElemAt: ["$userdetails.team", 0] },
            companyname: { $arrayElemAt: ["$userdetails.companyname", 0] },
            empcode: { $arrayElemAt: ["$userdetails.empcode", 0] },
            department: { $arrayElemAt: ["$userdetails.department", 0] },
            username: { $arrayElemAt: ["$userdetails.username", 0] }
          }
        },
        {
          $project: {
            // finalstatus: 1,
            userid: 1,
            empcode: 1,
            companyname: 1,
            team: 1,
            unit: 1,
            branch: 1,
            department: 1,
            username: 1,
            company: 1,
          }
        }
      ];
      userteamgroup = await DbName.aggregate(pipeline)
      // console.log(userteamgroup, query, "yus")
      // Fetch user list
    }
    else if (resonablestatus === "Intern to live") {
      query.workmode = { "$ne": "Internship" }
      query.internstatus = "Moved";
      userteamgroup = await User.find(query, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    } else {
      userteamgroup = await User.find(query, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    }

    // Extract usernames
    const usernames = userteamgroup.map(data => data?.companyname);

    // Fetch notice period users
    const noticeperiod = await Noticeperiodapply.find(
      { empname: { $in: usernames }, status: { $in: ["Applied", "Approved"] } },
      { empname: 1, _id: 0 }
    ).lean();

    const noticePeriodNames = noticeperiod.map(data => data.empname);
    // Filter based on resonablestatus
    if (resonablestatus === "Current List") {
      userteamgroup = userteamgroup.filter(
        data => !noticePeriodNames.includes(data.companyname)
      );
    }

    if (resonablestatus === "Notice Period") {
      userteamgroup = userteamgroup.filter(
        data => noticePeriodNames.includes(data.companyname)
      );
    }
    // console.log(usernames, "usernames")

    return res.status(200).json({ userteamgroup });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});




// Employee Nameas based on Company , branch , unit , team
exports.getUserslistforEmpDocument = catchAsyncErrors(async (req, res, next) => {
  try {
    let { resonablestatus } = req.body;
    let userteamgroup = [];
    let query = {};
    // console.log(resonablestatus, 'resonablestatus')
    // Build query from body except 'headers' and 'resonablestatus'
    Object.keys(req.body).forEach((key) => {
      if (key !== "headers" && key !== "resonablestatus") {
        const value = req.body[key];
        if (value !== "ALL") {
          query[key] = value.toString();
        }
      }
    });

    // Handle reasonable status conditions
    if (["Current List", "Notice Period", "Candidate to Intern", "Visitor to Intern", "Intern to live"]?.includes(resonablestatus)) {
      query.resonablestatus = {
        $nin: [
          "Not Joined", "Postponed", "Rejected", "Closed",
          "Releave Employee", "Absconded", "Hold", "Terminate"
        ],
      };
    } else if (resonablestatus && resonablestatus !== "Current List" && resonablestatus !== "Notice Period") {
      query.resonablestatus = resonablestatus;
    }

    // Exclude Enquiry Purpose
    query.enquirystatus = { $nin: ["Enquiry Purpose"] };
    if (["Candidate to Intern", "Visitor to Intern"]?.includes(resonablestatus)) {
      query.workmode = "Internship";
      const DbName = resonablestatus === "Candidate to Intern" ? Candidate : Visitors;
      //  console.log(query, userteamgroup,DbName, "sjbdjssn")
      const userMatch = Object.keys(query).reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});
      const pipeline = [
        {
          $match: {
            directonboardingdetails: { $exists: true, $ne: null },
            finalstatus: "Added"
          }
        },
        {
          $addFields: {
            userid: { $toObjectId: "$directonboardingdetails.employeeid" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "userdetails"
          }
        },
        {
          $match: {
            userdetails: { $elemMatch: userMatch }
          }
        },
        {
          $addFields: {
            company: { $arrayElemAt: ["$userdetails.company", 0] },
            branch: { $arrayElemAt: ["$userdetails.branch", 0] },
            unit: { $arrayElemAt: ["$userdetails.unit", 0] },
            team: { $arrayElemAt: ["$userdetails.team", 0] },
            companyname: { $arrayElemAt: ["$userdetails.companyname", 0] },
            empcode: { $arrayElemAt: ["$userdetails.empcode", 0] },
            department: { $arrayElemAt: ["$userdetails.department", 0] },
            username: { $arrayElemAt: ["$userdetails.username", 0] }
          }
        },
        {
          $project: {
            // finalstatus: 1,
            userid: 1,
            empcode: 1,
            companyname: 1,
            team: 1,
            unit: 1,
            branch: 1,
            department: 1,
            username: 1,
            company: 1,
          }
        }
      ];
      userteamgroup = await DbName.aggregate(pipeline)
      // console.log(userteamgroup, query, "yus")
      // Fetch user list
    }
    else if (resonablestatus === "Intern to live") {
      query.workmode = { "$ne": "Internship" }
      query.internstatus = "Moved";
      userteamgroup = await User.find(query, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    } else {
      userteamgroup = await User.find(query, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    }




    // Extract usernames
    const usernames = userteamgroup.map(data => data?.companyname);

    // Fetch notice period users
    const noticeperiod = await Noticeperiodapply.find(
      { empname: { $in: usernames }, status: { $in: ["Applied", "Approved"] } },
      { empname: 1, _id: 0 }
    ).lean();

    const noticePeriodNames = noticeperiod.map(data => data.empname);
    // Filter based on resonablestatus
    if (resonablestatus === "Current List") {
      userteamgroup = userteamgroup.filter(
        data => !noticePeriodNames.includes(data.companyname)
      );
    }

    if (resonablestatus === "Notice Period") {
      userteamgroup = userteamgroup.filter(
        data => noticePeriodNames.includes(data.companyname)
      );
    }

    return res.status(200).json({ userteamgroup });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});
// Employee Nameas based on Department , EmployeeMode
exports.getUserListBasedDepartment = catchAsyncErrors(async (req, res, next) => {
  let { department, resonablestatus } = req?.body;
  let userteamgroup = [];
  try {

    let query = {};
    if (department) {
      query.department = department
    }

    if (["Current List", "Notice Period", "Candidate to Intern", "Visitor to Intern", "Intern to live"]?.includes(resonablestatus)) {
      query.resonablestatus = {
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
      };
    }
    else if (resonablestatus && resonablestatus !== "Current List" && resonablestatus !== "Notice Period") {
      query.resonablestatus = resonablestatus
    }

    query.enquirystatus = {
      $nin: ["Enquiry Purpose"],
    };
    if (["Candidate to Intern", "Visitor to Intern"]?.includes(resonablestatus)) {
      query.workmode = "Internship";
      const DbName = resonablestatus === "Candidate to Intern" ? Candidate : Visitors;
      //  console.log(query, userteamgroup,DbName, "sjbdjssn")
      const userMatch = Object.keys(query).reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});
      const pipeline = [
        {
          $match: {
            directonboardingdetails: { $exists: true, $ne: null },
            finalstatus: "Added"
          }
        },
        {
          $addFields: {
            userid: { $toObjectId: "$directonboardingdetails.employeeid" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "userdetails"
          }
        },
        {
          $match: {
            userdetails: { $elemMatch: userMatch }
          }
        },
        {
          $addFields: {
            company: { $arrayElemAt: ["$userdetails.company", 0] },
            branch: { $arrayElemAt: ["$userdetails.branch", 0] },
            unit: { $arrayElemAt: ["$userdetails.unit", 0] },
            team: { $arrayElemAt: ["$userdetails.team", 0] },
            companyname: { $arrayElemAt: ["$userdetails.companyname", 0] },
            empcode: { $arrayElemAt: ["$userdetails.empcode", 0] },
            department: { $arrayElemAt: ["$userdetails.department", 0] },
            username: { $arrayElemAt: ["$userdetails.username", 0] }
          }
        },
        {
          $project: {
            // finalstatus: 1,
            userid: 1,
            empcode: 1,
            companyname: 1,
            team: 1,
            unit: 1,
            branch: 1,
            department: 1,
            username: 1,
            company: 1,
          }
        }
      ];
      userteamgroup = await DbName.aggregate(pipeline)
      // console.log(userteamgroup, query, "yus")
      // Fetch user list
    }
    else if (resonablestatus === "Intern to live") {
      query.workmode = { "$ne": "Internship" }
      query.internstatus = "Moved";
      userteamgroup = await User.find(query, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    }
    else {
      userteamgroup = await User.find(query, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    }

    // Extract usernames
    const usernames = userteamgroup.map(data => data?.companyname);

    // Fetch notice period users
    const noticeperiod = await Noticeperiodapply.find(
      { empname: { $in: usernames }, status: { $in: ["Applied", "Approved"] } },
      { empname: 1, _id: 0 }
    ).lean();

    const noticePeriodNames = noticeperiod.map(data => data.empname);
    // Filter based on resonablestatus
    if (resonablestatus === "Current List") {
      userteamgroup = userteamgroup.filter(
        data => !noticePeriodNames.includes(data.companyname)
      );
    }

    if (resonablestatus === "Notice Period") {
      userteamgroup = userteamgroup.filter(
        data => noticePeriodNames.includes(data.companyname)
      );
    }

    return res.status(200).json({ userteamgroup });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    userteamgroup,
  });
});

exports.getUserApprovalPendingDocuments = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  const { companyname } = req?.body

  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in "YYYY-MM-DD" format

    documentPreparation = await DocumentPreparation.find({
      person: companyname,
      approval: "sentforapproval",
      // approvalstartdate: { $lte: currentDate }, // approvalstartdate <= current date
      // approvalenddate: { $gte: currentDate }   // approvalenddate >= current date
    }, {
      date: 1,
      template: 1,
      printoptions: 1,
      approval: 1,
      approvalsentdate: 1,
      approvedby: 1,
      approvalstartdate: 1,
      approveddate: 1,
      approvalenddate: 1,
      documentname: 1,
      person: 1,
    }).lean();

    // Calculate Remaining Days
    if (documentPreparation?.length > 0) {
      documentPreparation?.forEach(doc => {
        const approvalEndDate = new Date(doc.approvalenddate);
        const currentDateObj = new Date(currentDate);
        const timeDifference = approvalEndDate - currentDateObj;
        const remainingDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
        doc.remainingDays = remainingDays;
      });
    }

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    count: documentPreparation?.length,
    documentPreparation,
  });
});





exports.getApprovalEmployeesTemplate = catchAsyncErrors(async (req, res, next) => {
  let templates;
  const { company, branch } = req?.body
  try {
    templates = await TemplateCreation.find({ company: { $in: company }, branch: { $in: branch }, tempaltemode: "Employee" }, {
      name: 1,
      company: 1,
      branch: 1,
      documentname: 1,
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: templates?.length,
    templates,
  });
});

exports.getUserFindProfileImage = catchAsyncErrors(async (req, res, next) => {
  let image;
  const { companyname } = req?.body
  try {
    image = await EmployeeDocuments.findOne({ companyname: companyname }, {
      profileimage: 1,
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: templates?.length,
    image,
  });
});

// Approval documents
exports.getEmployeeApprovalFormDatas = catchAsyncErrors(async (req, res, next) => {
  upload.single("pdfFile")(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler("File upload failed", 500));
    }
    if (!req.file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }
    try {
      let document = Object.assign({}, req.body);
      const newDocumentUpload = {
        documentid: document?.id,
        orginpath: "Employee Documents",
        name: document?.documentname,
        preview: req?.file?.filename,
        remarks: "Employee Documents",
      };

      if (newDocumentUpload) {
        let documentUser = await EmployeeDocuments.findOne({ companyname: document?.username });
        let userDetails = await User.findOne({ companyname: document?.username }, { _id: 1, companyname: 1, empcode: 1 });
        if (documentUser) {
          const documentExists = documentUser?.files?.some(file => file?.documentid === newDocumentUpload?.documentid);
          if (!documentExists) {
            const documentUpd = await DocumentPreparation?.findByIdAndUpdate(document?.id, { approvedfilename: req?.file?.filename })
            documentUser = await EmployeeDocuments.findOneAndUpdate(
              { companyname: document?.username },
              { $push: { files: newDocumentUpload } },
              { new: true }
            );
          } else {
            console.log("Document already exists in the files array.");
          }
        }
        else if (!documentUser && userDetails) {
          const userDoc = {
            empcode: userDetails?.empcode,
            commonid: userDetails?._id,
            companyname: userDetails?.companyname,
            type: "Employee",
            files: newDocumentUpload
          }
          const documentUpd = await DocumentPreparation?.findByIdAndUpdate(document?.id, { approvedfilename: req?.file?.filename })
          let employeeDocument = await EmployeeDocuments.create(userDoc);
        }
        else {
          console.log("No document found for the given companyname.");
        }

      }


      // if (!document) {
      //   return next(new ErrorHandler("Document not found!", 404));
      // }

      res.status(200).json({
        success: true,
        message: "PDF uploaded successfully",
        // filePath: req.file.path,
        // template: document.template,
        // username: document.companyname
      });


    } catch (error) {
      console.log(error, 'error')
      return next(new ErrorHandler("Error saving document to database", 500));
    }
  });
})

exports.getHierarchyApprovalEmployeesTemplate = catchAsyncErrors(async (req, res, next) => {
  let resultArray,
    user,
    result1,
    ans1D,
    i = 1,
    result2,
    result3,
    result4,
    result5,
    result6,
    dataCheck,
    userFilter,
    result,
    hierarchyFilter,
    answerDef,
    hierarchyFinal,
    hierarchy,
    hierarchyDefList,
    resultAccessFilter,
    branch,
    hierarchySecond,
    overallMyallList,
    hierarchyMap,
    resulted,
    resultedTeam,
    uniqueData,
    uniqueDataresult,
    DataAccessMode = false,
    myallTotalNames;

  try {
    const approvalStatus = req?.body?.approval;
    let query = {};
    if (approvalStatus?.includes('notyetsent')) {
      const filteredStatuses = approvalStatus.filter(status => status !== 'notyetsent');
      query = filteredStatuses.length > 0
        ? { $or: [{ approval: { $in: filteredStatuses } }, { approval: { $exists: false } }] }
        : { approval: { $exists: false } };
    } else if (approvalStatus?.length > 0) {
      query = { approval: { $in: approvalStatus } };
    }
    let levelFinal = req.body?.sector === "all" ? ["Primary", "Secondary", "Tertiary"] : [req.body?.sector];
    let answer = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose:
            req?.body?.username, // Match supervisorchoose with username
          level: { $in: levelFinal } // Corrected unmatched quotation mark
        }
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: {
            teamControlsArray: {
              $ifNull: ["$pagecontrols", []]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: [
                        "$name",
                        "$$teamControlsArray"
                      ]
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ]
                    } // Additional condition for reportingnew array
                  ]
                }
              }
            }
          ],
          as: "reportData" // The resulting matched documents will be in this field
        }
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1
        }
      }
    ]);

    // Manager Condition Without Supervisor
    const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
    DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
    const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);


    let restrictList = answer?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)
    result = await DocumentPreparation.find(
      query,
      {
        date: 1,
        template: 1,
        printoptions: 1,
        templateno: 1,
        documentname: 1,
        referenceno: 1,
        employeemode: 1,
        approval: 1,
        approvalsentdate: 1,
        approvalstartdate: 1,
        approveddate: 1,
        approvalenddate: 1,
        department: 1,
        company: 1,
        issuingauthority: 1,
        branch: 1,
        unit: 1,
        team: 1,
        person: 1,
        tempcode: 1,
        addedby: 1,
        issuedpersondetails: 1,
        updatedby: 1,
        createdAt: 1,
      }
    ).lean();
    // Accordig to sector and list filter process
    hierarchyFilter = await Hirerarchi.find({ level: req.body.sector }).lean();
    userFilter = hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);
    hierarchyDefList = await Hirerarchi.find().lean();
    user = await User.find({ companyname: req.body.username }, { companyname: 1, designation: 1 }).lean();
    const userFilt = user.length > 0 && user[0].designation;
    const desiGroup = await Designation.find().lean();
    let HierarchyFilt = req.body.sector === "all" ?
      hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup) :
      hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup);
    const DesifFilter = desiGroup.filter((data) => HierarchyFilt.includes(data.group));
    const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
    const SameDesigUser = HierarchyFilt.includes("All") ? true : userFilt === desigName;
    //Default Loading of List
    answerDef = hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

    hierarchyFinal = req.body.sector === "all" ? (answerDef.length > 0 ? [].concat(...answerDef) : []) : hierarchyFilter.length > 0 ? [].concat(...userFilter) : [];

    hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];


    //solo
    ans1D = req.body.sector === "all" ? (answerDef.length > 0 ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)) : []) : hierarchyFilter.length > 0 ? hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)) : [];
    result1 =
      ans1D.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = ans1D.find((item2) => item2.employeename.includes(item1.person));

            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return { ...plainItem1, level: req.body.sector + "-" + matchingItem2.control };
              //   return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];

    resulted = result1;


    //team
    let branches = [];
    hierarchySecond = await Hirerarchi.find().lean();

    const subBranch =
      hierarchySecond.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : "";

    const answerFilterExcel = hierarchySecond.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name))) : [];

    result2 =
      answerFilterExcel.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel.find((item2) => item2.employeename.includes(item1.person));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return { ...plainItem1, level: req.body.sector + "-" + matchingItem2.control };
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...subBranch);

    const ans =
      subBranch.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : "";
    const answerFilterExcel2 = subBranch.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name))) : [];

    result3 =
      answerFilterExcel2.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel2.find((item2) => item2.employeename.includes(item1.person));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return { ...plainItem1, level: req.body.sector + "-" + matchingItem2.control };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...ans);

    const loop3 =
      ans.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => ans.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : "";

    const answerFilterExcel3 = ans.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => ans.includes(name))) : [];

    result4 =
      answerFilterExcel3.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel3?.find((item2) => item2.employeename.includes(item1.person));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return { ...plainItem1, level: req.body.sector + "-" + matchingItem2.control };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop3);

    const loop4 =
      loop3.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => loop3.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : [];
    const answerFilterExcel4 = loop3.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop3.includes(name))) : [];
    result5 =
      answerFilterExcel4.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel4?.find((item2) => item2.employeename.includes(item1.person));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return { ...plainItem1, level: req.body.sector + "-" + matchingItem2.control };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop4);

    const loop5 =
      loop4.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => loop4.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : "";
    const answerFilterExcel5 = loop4.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop4.includes(name))) : [];
    result6 =
      answerFilterExcel5.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel5?.find((item2) => item2.employeename.includes(item1.person));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return { ...plainItem1, level: req.body.sector + "-" + matchingItem2.control };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop5);

    resultedTeam = [...result2, ...result3, ...result4, ...result5, ...result6];
    //overall Teams List
    myallTotalNames = DataAccessMode ? uniqueNames : [...hierarchyMap, ...branches];

    const finalResult = await DocumentPreparation.find(
      {
        ...query,
        person: { $in: myallTotalNames },
      },
      {
        date: 1,
        template: 1,
        printoptions: 1,
        templateno: 1,
        documentname: 1,
        referenceno: 1,
        employeemode: 1,
        approval: 1,
        approvalsentdate: 1,
        approvalstartdate: 1,
        approveddate: 1,
        approvalenddate: 1,
        department: 1,
        company: 1,
        issuingauthority: 1,
        branch: 1,
        unit: 1,
        team: 1,
        person: 1,
        tempcode: 1,
        addedby: 1,
        issuedpersondetails: 1,
        updatedby: 1,
        createdAt: 1,
      }
    ).lean();


    overallMyallList = [...resulted, ...resultedTeam];


    const restrictTeam = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose:
            { $in: myallTotalNames }, // Match supervisorchoose with username
          level: { $in: levelFinal } // Corrected unmatched quotation mark
        }
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: {
            teamControlsArray: {
              $ifNull: ["$pagecontrols", []]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: [
                        "$name",
                        "$$teamControlsArray"
                      ]
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ]
                    } // Additional condition for reportingnew array
                  ]
                }
              }
            }
          ],
          as: "reportData" // The resulting matched documents will be in this field
        }
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1
        }
      }
    ]);
    let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter(data => data?.reportData?.length > 0)?.flatMap(Data => Data?.employeename)


    let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === "myhierarchy" ? restrictList
      : req.body.hierachy === "allhierarchy" ? restrictListTeam :
        [...restrictList, ...restrictListTeam]);


    const resultAccessFilterHierarchy = DataAccessMode ? finalResult : (req.body.hierachy === "myhierarchy" ? resulted
      : req.body.hierachy === "allhierarchy" ? resultedTeam
        : overallMyallList);


    resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFilterHierarchy?.filter(data => overallRestrictList?.includes(data?.person)) : [];
    uniqueDataresult = resultedTeam?.filter((item, index, self) =>
      index === self.findIndex(obj => obj._id === item._id)
    );
    uniqueData = resultAccessFilter?.filter((item, index, self) =>
      index === self.findIndex(obj => obj._id === item._id)
    );
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    resulted,
    resultedTeam: uniqueDataresult,
    resultAccessFilter: uniqueData,
    DataAccessMode
  });
});

exports.getApprovalEmployeesDocumentsPreparations = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  const { approval, template } = req?.body;
  try {
    let filterQuery = {}
    if (approval?.includes('notyetsent')) {
      const filteredStatuses = approval.filter(status => status !== 'notyetsent');
      filterQuery = filteredStatuses.length > 0
        ? { $or: [{ approval: { $in: filteredStatuses } }, { approval: { $exists: false } }] }
        : { approval: { $exists: false } };
    } else if (approval?.length > 0) {
      filterQuery = { approval: { $in: approval } };
    }
    if (template && template?.length > 0) {
      filterQuery.template = { $in: template }
    }
    documentPreparation = await DocumentPreparation.find({ ...filterQuery, documentneed: "Employee Approval" },
      {
        date: 1,
        template: 1,
        printoptions: 1,
        templateno: 1,
        documentname: 1,
        referenceno: 1,
        employeemode: 1,
        approval: 1,
        approvalsentdate: 1,
        approvedby: 1,
        approvalstartdate: 1,
        approveddate: 1,
        approvalenddate: 1,
        department: 1,
        company: 1,
        issuingauthority: 1,
        branch: 1,
        unit: 1,
        team: 1,
        person: 1,
        tempcode: 1,
        addedby: 1,
        issuedpersondetails: 1,
        updatedby: 1,
        createdAt: 1,
      }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: documentPreparation?.length,
    documentPreparation,
  });
});

exports.getAllVerifytwofaEmployeeApproval = catchAsyncErrors(async (req, res, next) => {

  const { companyname, otp } = req.body;


  // Finding if user exists in database
  const user = await User.findOne({ companyname: companyname }, { companyname: 1, loginUserStatus: 1 }).lean();
  if (!user) {
    return next(new ErrorHandler(" Username Not Found", 401));
  }

  const overallsettings = await AdminOverAllSettings.find().lean();
  let individualsettings = await IndividualSettings.find().lean();
  let individualtwofaswitch = individualsettings?.find((item) =>
    item.companyname.includes(user?.companyname)
  );
  let adminTwofaswitch, loginswitch;
  if (overallsettings.length === 0) {
    adminTwofaswitch = true;
    loginswitch = true;
  } else {
    adminTwofaswitch =
      overallsettings[overallsettings.length - 1].overalltwofaswitch;
    loginswitch =
      overallsettings[overallsettings.length - 1].loginrestrictionswitch;
  }

  let check = individualtwofaswitch
    ? individualtwofaswitch?.twofaswitch
    : adminTwofaswitch;

  // && !user.role.includes("Manager")

  let foundData = user?.loginUserStatus?.find((data) => data?.status === "Active")
  // console.log(foundData, companyname, user?.loginUserStatus, 'foundData')
  if (foundData?.twofaenabled && check) {
    if (!otp) {
      return res.status(201).json({
        otpneeded: true,
      });
    }
    const verified = authenticator.check(otp, foundData?.twofasecret);

    if (!verified) {
      return next(new ErrorHandler("Invalid Otp", 401));
    }
    return res.status(200).json({
      success: true,
    });
  } else {
    return res.status(200).json({
      success: true,
    });
  }
});

exports.getAllVerifytwofaEmployeeApprovalValidation = catchAsyncErrors(async (req, res, next) => {
  try {
    const { mobile, dateofbirth, companyname } = req.body;

    // console.log(dateofbirth, mobile, companyname, 'dob')
    // Finding if user exists in database
    const user = await User.findOne({
      companyname: companyname,
      dob: dateofbirth,
      $or: [
        { contactpersonal: mobile },
        { emergencyno: mobile },
        { contactfamily: mobile }
      ]

    }, { companyname: 1, loginUserStatus: 1 }).lean();
    if (!user) {
      return next(new ErrorHandler(" User Not Found", 401));
    }
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    success: true,
  });

});

exports.getAccessibleBranchAllDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation, overalldocuments;
  try {
    const { assignbranch, printed } = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      printingstatus: { $in: printed },
      documentneed: "Print Document"
    }));

    if (assignbranch?.length > 0) {
      const filterQuery = { $or: branchFilter };
      documentPreparation = await DocumentPreparation.find(filterQuery,
        {
          date: 1,
          template: 1,
          printoptions: 1,
          templateno: 1,
          documentname: 1,
          referenceno: 1,
          employeemode: 1,
          printingstatus: 1,
          printedcount: 1,
          approval: 1,
          approvalsentdate: 1,
          approvedby: 1,
          approvalstartdate: 1,
          approveddate: 1,
          approvalenddate: 1,
          department: 1,
          company: 1,
          issuingauthority: 1,
          branch: 1,
          unit: 1,
          team: 1,
          person: 1,
          tempcode: 1,
          email: 1,
          frommailemail: 1,
          mail: 1,
          addedby: 1,
          issuedpersondetails: 1,
          updatedby: 1,
          createdAt: 1,
        }).lean();
    }
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    documentPreparation, overalldocuments
  });
});
exports.getAccessibleBranchAllDocumentPreparationOverall = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation, overalldocuments;
  try {
    const { assignbranch, printed } = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      printingstatus: { $in: printed },
      documentneed: "Print Document"
    }));

    if (assignbranch?.length > 0) {
      const filterQuery = { $or: branchFilter };
      overalldocuments = await DocumentPreparation.find(filterQuery,
        {
          date: 1,
          template: 1,
          printoptions: 1,
          templateno: 1,
          documentname: 1,
          referenceno: 1,
          employeemode: 1,
          printingstatus: 1,
          approval: 1,
          approvalsentdate: 1,
          approvedby: 1,
          approvalstartdate: 1,
          approveddate: 1,
          approvalenddate: 1,
          department: 1,
          company: 1,
          issuingauthority: 1,
          branch: 1,
          unit: 1,
          team: 1,
          person: 1,
          tempcode: 1,
          email: 1,
          frommailemail: 1,
          mail: 1,
          addedby: 1,
          issuedpersondetails: 1,
          updatedby: 1,
          createdAt: 1,
        }).lean();
    }
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    overalldocuments
  });
});

// Employee DOcuments Preparation page -->>> Printed Status List
exports.getAllEmployeeDocumentsPreparationPrintedStatusList = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation, overalldocuments;
  try {
    const { aggregationPipeline, assignbranch, type, template, employeemode } = req.body;
    let resonablestatus = employeemode;
    let query = {}
    const branchFilters = assignbranch?.map(branchObj => ({
      company: branchObj.company,
      branch: branchObj.branch,
      unit: branchObj.unit,
    })) || [];
    const cleaned = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) =>
        ["template", "status", "employeemode"]?.includes(key) && !(Array.isArray(value) && value.length === 0)
      )
    );
    const filterQuery = { $or: branchFilters }
    query = { ...cleaned, ...filterQuery }
    // console.log(query, "query")

    let userQuery = {};
    if (req.body?.department?.length > 0) {
      userQuery.department = { $in: req.body?.department }
    }
    if (req.body?.branch?.length > 0) {
      userQuery.branch = { $in: req.body?.branch }
    }
    if (req.body?.unit?.length > 0) {
      userQuery.unit = { $in: req.body?.unit }
    }
    if (req.body?.team?.length > 0) {
      userQuery.team = { $in: req.body?.team }
    }
    if (req.body?.company?.length > 0) {
      userQuery.company = { $in: req.body?.company }
    }
    if (req.body?.person?.length > 0) {
      userQuery.companyname = { $in: req.body?.person }
    }

    // Handle reasonable status conditions
    if (["Current List", "Notice Period", "Candidate to Intern", "Visitor to Intern", "Intern to live"]?.includes(resonablestatus)) {
      userQuery.resonablestatus = {
        $nin: [
          "Not Joined", "Postponed", "Rejected", "Closed",
          "Releave Employee", "Absconded", "Hold", "Terminate"
        ],
      };
    } else if (resonablestatus && resonablestatus !== "Current List" && resonablestatus !== "Notice Period") {
      userQuery.resonablestatus = resonablestatus;
    }

    // Exclude Enquiry Purpose
    userQuery.enquirystatus = { $nin: ["Enquiry Purpose"] };
    if (["Candidate to Intern", "Visitor to Intern"]?.includes(resonablestatus)) {
      userQuery.workmode = "Internship";
      const DbName = resonablestatus === "Candidate to Intern" ? Candidate : Visitors;
      //  console.log(query, userteamgroup,DbName, "sjbdjssn")
      const userMatch = Object.keys(userQuery).reduce((acc, key) => {
        acc[key] = userQuery[key];
        return acc;
      }, {});
      const pipeline = [
        {
          $match: {
            directonboardingdetails: { $exists: true, $ne: null },
            finalstatus: "Added"
          }
        },
        {
          $addFields: {
            userid: { $toObjectId: "$directonboardingdetails.employeeid" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "userdetails"
          }
        },
        {
          $match: {
            userdetails: { $elemMatch: userMatch }
          }
        },
        {
          $addFields: {
            company: { $arrayElemAt: ["$userdetails.company", 0] },
            branch: { $arrayElemAt: ["$userdetails.branch", 0] },
            unit: { $arrayElemAt: ["$userdetails.unit", 0] },
            team: { $arrayElemAt: ["$userdetails.team", 0] },
            companyname: { $arrayElemAt: ["$userdetails.companyname", 0] },
            empcode: { $arrayElemAt: ["$userdetails.empcode", 0] },
            department: { $arrayElemAt: ["$userdetails.department", 0] },
            username: { $arrayElemAt: ["$userdetails.username", 0] }
          }
        },
        {
          $project: {
            // finalstatus: 1,
            userid: 1,
            empcode: 1,
            companyname: 1,
            team: 1,
            unit: 1,
            branch: 1,
            department: 1,
            username: 1,
            company: 1,
          }
        }
      ];
      userteamgroup = await DbName.aggregate(pipeline)
      // console.log(userteamgroup, userQuery, "yus")
      // Fetch user list
    }
    else if (resonablestatus === "Intern to live") {
      userQuery.workmode = { "$ne": "Internship" }
      userQuery.internstatus = "Moved";
      userteamgroup = await User.find(userQuery, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    } else {


      userteamgroup = await User.find(userQuery, {
        empcode: 1,
        companyname: 1,
        team: 1,
        unit: 1,
        branch: 1,
        department: 1,
        username: 1,
        company: 1,
      }).lean();
    }
    // console.log(userQuery, "userQuery")
    // Extract usernames
    const usernames = userteamgroup.map(data => data?.companyname);


    // console.log(usernames, "usernames")
    if (usernames?.length > 0) {
      query.person = { $in: usernames }
    }
    // console.log(query, "query")
    documentPreparation = await DocumentPreparation.find(
      query,
      {
        date: 1,
        template: 1,
        printoptions: 1,
        templateno: 1,
        documentname: 1,
        documentneed: 1,
        referenceno: 1,
        employeemode: 1,
        printingstatus: 1,
        approval: 1,
        printedcount: 1,
        approvalsentdate: 1,
        approvedby: 1,
        approvalstartdate: 1,
        approveddate: 1,
        approvalenddate: 1,
        department: 1,
        company: 1,
        issuingauthority: 1,
        branch: 1,
        unit: 1,
        team: 1,
        person: 1,
        tempcode: 1,
        email: 1,
        frommailemail: 1,
        approvedfilename: 1,
        mail: 1,
        email: 1,
        addedby: 1,
        issuedpersondetails: 1,
        updatedby: 1,
        createdAt: 1,
      }).lean();
    // }
    // else {

    //   const matchStage = branchFilters.length ? [{ $match: { $or: branchFilters } }] : [];

    //   const updatedAggregationPipeline = [...matchStage, ...aggregationPipeline];

    //   overalldocuments = await User.aggregate(updatedAggregationPipeline);

    //   if (overalldocuments[0]?.companynames?.length > 0) {
    //     const usernames = overalldocuments[0]?.companynames;
    //     const queryCondition = {
    //       $or: [
    //         { person: { $in: usernames }, printingstatus: { $in: ["Printed", "Re-Printed"] } },
    //         { person: { $in: usernames }, printingstatus: "Not-Printed", documentneed: "Employee Approval" }
    //       ]
    //     };
    //     if (status?.length > 0) {
    //       queryCondition.documentneed = { $in: status };
    //     }

    //     documentPreparation = await DocumentPreparation.find(queryCondition,
    //       {
    //         date: 1,
    //         template: 1,
    //         printoptions: 1,
    //         templateno: 1,
    //         documentname: 1,
    //         documentneed: 1,
    //         referenceno: 1,
    //         employeemode: 1,
    //         printingstatus: 1,
    //         approval: 1,
    //         documentneed: 1,
    //         printedcount: 1,
    //         approvalsentdate: 1,
    //         approvedby: 1,
    //         approvalstartdate: 1,
    //         approveddate: 1,
    //         approvalenddate: 1,
    //         department: 1,
    //         company: 1,
    //         issuingauthority: 1,
    //         branch: 1,
    //         unit: 1,
    //         team: 1,
    //         person: 1,
    //         tempcode: 1,
    //         email: 1,
    //         frommailemail: 1,
    //         approvedfilename: 1,
    //         mail: 1,
    //         email: 1,
    //         addedby: 1,
    //         issuedpersondetails: 1,
    //         updatedby: 1,
    //         createdAt: 1,
    //       }).lean();
    //   }
    // }


  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    documentPreparation
  });
});


// User LoginDetails
exports.getFilterdocumentUserLogin = catchAsyncErrors(async (req, res, next) => {
  let user;
  try {
    const { person } = req.body;

    user = await User.findOne({ companyname: person }, { loginUserStatus: 1 });

  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    user
  });
});

exports.getLastAutoIdDocumentPrep = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  try {
    documentPreparation = await DocumentPreparation.aggregate([
      {
        $addFields: {
          templatenoNumber: {
            $toInt: {
              $arrayElemAt: [
                { $split: ["$templateno", "_"] },
                -1 // get the second part after split
              ]
            }
          }
        }
      },
      {
        $sort: { templatenoNumber: -1 } // sort by numeric part descending
      },
      {
        $limit: 1
      },
      {
        $project: {
          templateno: 1,
          _id: 0
        }
      }
    ]);

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    documentPreparation,
  });
});

exports.getLastAutoIdCompanyDocumentPrep = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  try {
    documentPreparation = await DocumentPreparation.aggregate([
      {
        $sort: { _id: -1 }  // Sort by _id in descending order
      },
      {
        $limit: 1            // Limit to the last document
      }, {
        $project: {
          templateno: 1,
          _id: 0
        }
      }
    ]);
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    documentPreparation,
  });
});

exports.getDocumentPreparationCodes = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  try {

    const company = await Company.findOne({ name: req.body.company }).lean()
    const branch = await Branch.findOne({ name: req.body.branch }).lean()
    const unit = await Unit.findOne({ name: req.body.unit }).lean()
    documentPreparation = company?.code?.slice(0, 3) + branch?.code?.slice(0, 3) + unit?.code?.slice(0, 3)

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    documentPreparation,
  });
});

exports.getCompanyDocumentPreparationCodes = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  try {

    const company = await Company.findOne({ name: req.body.company }).lean()
    const branch = await Branch.findOne({ name: req.body.branch }).lean()
    documentPreparation = company?.code?.slice(0, 3) + branch?.code?.slice(0, 3)

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    documentPreparation,
  });
});

// Create new DocumentPreparation=> /api/DocumentPreparation/new
exports.addDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const { template, person } = req.body;
  // Use an aggregation pipeline to check for duplicates
  const existingDocument = await DocumentPreparation.aggregate([
    {
      $match: {
        template: { $regex: new RegExp(`^${template}$`, 'i') }, // Case-insensitive match
        person: person,
      },
    },
    { $limit: 1 } // Limit to one document to check existence
  ]);

  if (existingDocument.length > 0) {
    return res.status(400).json({
      message: "Duplicate entry found!",
    })
  }

  let aDocumentPreparation = await DocumentPreparation.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle DocumentPreparation => /api/documentPreparation/:id
exports.getSingleDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sdocumentPreparation = await DocumentPreparation.findById(id);

  if (!sdocumentPreparation) {
    return next(new ErrorHandler("Document Preparation not found!", 404));
  }
  return res.status(200).json({
    sdocumentPreparation,
  });
});

// update DocumentPreparation by id => /api/documentPreparation/:id
exports.updateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let udocumentPreparation = await DocumentPreparation.findByIdAndUpdate(id, req.body);
  if (!udocumentPreparation) {
    return next(new ErrorHandler("DocumentPreparation not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete DocumentPreparation by id => /api/documentPreparation/:id
exports.deleteDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dDocumentPreparation = await DocumentPreparation.findByIdAndRemove(id);

  if (!dDocumentPreparation) {
    return next(new ErrorHandler("Document Preparation not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});
