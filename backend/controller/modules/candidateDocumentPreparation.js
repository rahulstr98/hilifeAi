const CandidateDocumentPreparation = require("../../model/modules/candidateDocumentPreparation");
const JobOpenings = require('../../model/modules/recruitment/jobopenings');
const Interviewroundorder = require("../../model/modules/interview/interviewroundorder");
const Company = require("../../model/modules/setup/company");
const Addcandidate = require("../../model/modules/recruitment/addcandidate");
const Branch = require("../../model/modules/branch");
const Unit = require("../../model/modules/unit");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const TemplateCreation = require("../../model/modules/TemplateCreationModel");
const multer = require('multer');
const path = require('path');
// Set up storage for PDF files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'CandidateDocuments/');  // Folder to store PDFs
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });



// get All CandidateDocumentPreparation  => /api/candidatedocumentpreparation
// get All CandidateDocumentPreparation  => /api/candidatedocumentpreparation
exports.getAllCandidateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  let candidatedocumentPreparation;
  try {
    candidatedocumentPreparation = await CandidateDocumentPreparation.find({}, {
      date: 1,
      printingstatus: 1, pagesize: 1, pageheight: 1, pagewidth: 1, template: 1, templateno: 1,
      referenceno: 1, employeemode: 1, department: 1, company: 1, issuingauthority: 1, branch: 1,
      unit: 1, team: 1, person: 1, proption: 1, tempcode: 1, sign: 1, sealing: 1, email: 1, frommailemail: 1, tocompany: 1,
      mail: 1, addedby: 1, issuedpersondetails: 1, updatedby: 1, createdAt: 1,
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!candidatedocumentPreparation) {
    return next(new ErrorHandler("Document Preparation not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    candidatedocumentPreparation,
  });
});
exports.getAllCandidateDocumentPreparationDuplicate = catchAsyncErrors(async (req, res, next) => {
  let candidatedocumentPreparation;
  try {
    candidatedocumentPreparation = await CandidateDocumentPreparation.find({}, { template: 1, person: 1, documentneed: 1 }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    candidatedocumentPreparation,
  });
});
exports.getAccessibleBranchAllCandidateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  let candidatedocumentPreparation;
  try {
    const { assignbranch } = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      printingstatus: "Not-Printed",
      documentneed: "Print Document"
    }));
    const filterQuery = { $or: branchFilter };
    candidatedocumentPreparation = await CandidateDocumentPreparation.find(filterQuery, {
      referenceno: 1, templateno: 1, template: 1, company: 1, issuingauthority: 1, branch: 1,
      unit: 1, team: 1,documentneed:1,rounds:1, tocompany: 1, printingstatus: 1, date: 1, issuedpersondetails: 1, person: 1,
      printedcount: 1, designation: 1, mail: 1
    }).lean();

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    candidatedocumentPreparation,
  });
});
exports.getLastAutoIdCandidateDocumentPrep = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  try {
    documentPreparation = await CandidateDocumentPreparation.aggregate([
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

exports.getCandidateDocumentPreparationCodes = catchAsyncErrors(async (req, res, next) => {
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

// Create new CandidateDocumentPreparation=> /api/candidatedocumentpreparation/new
exports.addCandidateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const { template, person } = req.body;
  // Use an aggregation pipeline to check for duplicates
  const existingDocument = await CandidateDocumentPreparation.aggregate([
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

  let aCandidateDocumentPrep = await CandidateDocumentPreparation.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle CandidateDocumentPreparation => /api/candidatedocumentpreparation/:id
exports.getSingleCandidateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let scandidateDocumentPreparation = await CandidateDocumentPreparation.findById(id);

  if (!scandidateDocumentPreparation) {
    return next(new ErrorHandler("Document Preparation not found!", 404));
  }
  return res.status(200).json({
    scandidateDocumentPreparation,
  });
});


// get Signle CandidateDocumentPreparation => /api/candidatedocumentpreparation/:id for Delete
exports.getDeleteSingleCandidateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  console.log(id, 'id')
  let scandidateDocumentPreparation = await CandidateDocumentPreparation.findById(id).select('_id');;
  return res.status(200).json({
    scandidateDocumentPreparation,
  });
});

// update CandidateDocumentPreparation by id => /api/candidatedocumentpreparation/:id
exports.updateCandidateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ucandidateDocumentPreparation = await CandidateDocumentPreparation.findByIdAndUpdate(id, req.body);
  if (!ucandidateDocumentPreparation) {
    return next(new ErrorHandler("Candidate Document Preparation not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete CandidateDocumentPreparation by id => /api/candidatedocumentpreparation/:id
exports.deleteCandidateDocumentPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dDocumentPreparation = await CandidateDocumentPreparation.findByIdAndRemove(id);

  if (!dDocumentPreparation) {
    return next(new ErrorHandler("Document Preparation not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});




exports.getDesignationBasedCompanyBranch = catchAsyncErrors(async (req, res, next) => {
  let designation;
  const { company, branch } = req.body
  try {

    designation = await JobOpenings.find({ company, branch }, { designation: 1 }).lean()

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    designation,
  });
});
exports.getRoundsBasedCompanyBranchDesig = catchAsyncErrors(async (req, res, next) => {
  let rounds;
  const { designation } = req.body
  try {

    rounds = await Interviewroundorder.findOne({ designation }, { designation: 1, round: 1 }).lean()

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    rounds,
  });
});

// Employee Names based on company , branch , Role , Round 
exports.getAllEmployeeNamesFromCandidates = catchAsyncErrors(async (req, res, next) => {
  let employeenames;
  const { company, branch, designation, rounds, jobopeningid } = req.body.query
  try {
    employeenames = await Addcandidate.aggregate([
      {
        $match: {
          jobopeningsid: jobopeningid,
          interviewrounds: { $exists: true, $ne: [] },
          $or: [
            { candidatestatus: { $exists: false } },
            { candidatestatus: "" }
          ]
        }
      },
      {
        $addFields: {
          lastInterviewRound: { $arrayElemAt: ["$interviewrounds", -1] }
        }
      },
      {
        $match: {
          "lastInterviewRound.roundname": { $in: rounds },
          "lastInterviewRound.roundanswerstatus": "Selected",
          "lastInterviewRound.nextround": false,
          $or: [
            { "lastInterviewRound.rounduserstatus": { $exists: false } },
            { "lastInterviewRound.rounduserstatus": "" }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          fullname: 1,
          role: 1,
          prefix: 1,
          lastname: 1,
          fullname: 1,
          gender: 1,
          mobile: 1,
          whatsapp: 1,
          adharnumber: 1,
          pannumber: 1,
          street: 1,
          city: 1,
          postalcode: 1,
          country: 1,
          state: 1,
          email: 1,
          dateofbirth: 1,
          salarytable:1,
          lastInterviewRound: {
            roundname: 1,
            roundstatus: 1,
            participants: 1,
            // interviewForm: 1,
            designation: 1,
            branch: 1,
            nextround: 1,
            roundanswerstatus: 1,
            rounduserstatus: 1,
            company: 1
          }
        }
      }
    ]);






  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    // count: products.length,
    employeenames,
  });
});


exports.getApprovalCandidatesTemplate = catchAsyncErrors(async (req, res, next) => {
  let templates;
  const { company, branch } = req?.body
  try {
    templates = await TemplateCreation.find({ company: { $in: company }, branch: { $in: branch }, tempaltemode: "Candidate" }, {
      name: 1,
      company: 1,
      branch: 1,
      documentname: 1,
    }).lean();
  } catch (err) {
    console.log(err, 'err')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: templates?.length,
    templates,
  });
});


exports.getApprovalCandidateDocumentsPreparations = catchAsyncErrors(async (req, res, next) => {
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
    documentPreparation = await CandidateDocumentPreparation.find({ ...filterQuery, documentneed: "Candidate Approval" },
      {
        date: 1,
        template: 1,
        printoptions: 1,
        templateno: 1,
        documentname: 1,
        referenceno: 1,
        employeemode: 1,
        designation: 1,
        rounds: 1,
        approval: 1,
        approvalsentdate: 1,
        approvedby: 1,
        candidateid: 1,
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


exports.getAccessBranchCandidatePrintedList = catchAsyncErrors(async (req, res, next) => {
  let documentPreparation;
  const { assignbranch, type, approval, template, company, branch } = req?.body;

  try {
console.log(template , 'template')
    // let filterQuery = {};
    const branchFilter = assignbranch?.map(branchObj => ({
      branch: branchObj.branch,
      company: branchObj.company,
    })) || [];
    
    let andConditions = [];
    
    if (branchFilter.length > 0) {
      andConditions.push({ $or: branchFilter });
    }
    
    if (company?.length > 0) {
      andConditions.push({ company: { $in: company } });
    }
    
    if (branch?.length > 0) {
      andConditions.push({ branch: { $in: branch } });
    }
    
    if (approval?.length > 0) {
      andConditions.push({ documentneed: { $in: approval } });
    }
    
    if (template?.length > 0) {
      andConditions.push({ template: { $in: template } });
    }
    
    const filterQuery = andConditions.length > 0 ? { $and: andConditions } : {};
    
    console.log(filterQuery, 'filterQuery');
    
    documentPreparation = await CandidateDocumentPreparation.find(filterQuery, {
      date: 1,
      template: 1,
      printoptions: 1,
      templateno: 1,
      documentname: 1,
      printingstatus: 1,
      rounds: 1,
      printedcount: 1,
      documentneed: 1,
      referenceno: 1,
      employeemode: 1,
      approval: 1,
      approvalsentdate: 1,
      approvedby: 1,
      approvalstartdate: 1,
      approveddate: 1,
      approvalenddate: 1,
      approvedfilename: 1,
      department: 1,
      company: 1,
      issuingauthority: 1,
      branch: 1,
      unit: 1,
      team: 1,
      person: 1,
      tempcode: 1,
      designation: 1,
      email: 1,
      mail: 1,
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


// Approval documents
exports.getCandidateApprovalFormDatas = catchAsyncErrors(async (req, res, next) => {
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
        orginpath: "Candidate Documents",
        name: document?.documentname,
        preview: req?.file?.filename,
        remarks: "Candidate Documents",
      };
      console.log(document, newDocumentUpload, 'newDocumentUpload')
      if (newDocumentUpload) {
        let documentUser = await Addcandidate.findOne({ approvalid: document?.id });
        // let userDetails = await User.findOne({ companyname: document?.username }, { _id: 1, companyname: 1, empcode: 1 });
        if (documentUser) {
          const documentExists = documentUser?.candidateDocuments?.some(file => file?.documentid === newDocumentUpload?.documentid);
          if (!documentExists) {
            const documentUpd = await CandidateDocumentPreparation?.findByIdAndUpdate(document?.id, { approvedfilename: req?.file?.filename })
            documentUser = await Addcandidate.findOneAndUpdate(
              { approvalid: document?.id },
              {
                $push: { candidateDocuments: newDocumentUpload },
                $set: { approval: "approved" }
              },
              { new: true }
            );

          } else {
            console.log("Document already exists in the files array.");
          }
        }
        else {
          console.log("No document found for the given companyname.");
        }

      }


      // if (!document) {
      //   return next(new ErrorHandler("Document not found!", 404));
      // }

      res.status(200).json({
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