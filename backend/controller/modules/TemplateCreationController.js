const TemplateCreation = require("../../model/modules/TemplateCreationModel");
const DocumentPreparation = require("../../model/modules/documentpreparation");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");

// get All TemplateCreation  => /api/templatecreations
exports.getAllTemplate = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  try {
    templatecreation = await TemplateCreation.find().lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!templatecreation) {
    return next(new ErrorHandler("Template Name not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    templatecreation,
  });
});
exports.getAccssibleAllTemplate = catchAsyncErrors(async (req, res, next) => {
  // let templatecreation , overalllist;
  try {
    const { assignbranch } = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
    }));
    // templatecreation = await TemplateCreation.find({$or: branchFilter,},{pageformat:0}).lean();
    // overalllist = await TemplateCreation.find({},{pageformat:0}).lean();
    const [templatecreation, overalllist] = await Promise.all([
      TemplateCreation.find({ $or: branchFilter, }, { pageformat: 0 }).lean(),
      TemplateCreation.find({}, { pageformat: 0 }).lean()
    ]);

    return res.status(200).json({
      // count: products.length,
      templatecreation, overalllist
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

});
exports.getEmployeeAllTemplate = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  try {
    const { assignbranch } = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
    }));
    templatecreation = await TemplateCreation.find({ $or: branchFilter, tempaltemode: "Employee" }, {}).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!templatecreation) {
    return next(new ErrorHandler("Template Name not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    templatecreation,
  });
});
exports.getCandidateFilteredTemplate = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  try {
    const { assignbranch , company , branch , name , documentname} = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
    }));

    templatecreation = await TemplateCreation.findOne({ $or: branchFilter, tempaltemode: "Candidate" , company : company , branch : branch ,name : name , documentname : documentname  }, {}).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    templatecreation,
  });
});
exports.getCompanyAllTemplate = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  try {
    templatecreation = await TemplateCreation.find({ tempaltemode: "Company" }, {
      company: 1, branch: 1, name: 1, pageformat: 1, headvalue: 1,tempcode:1, pagemode :1 ,pagesize: 1, seal: 1, signature: 1
    }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    templatecreation,
  });
});
exports.getCompanyAllTemplateFilter = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  const { company, branch, template } = req?.body;
  try {
    templatecreation = await TemplateCreation.findOne({ tempaltemode: "Company", company: company, branch: branch, name: template },
      { pageformat: 1 }).lean();
  } catch (err) {
    console.log(err, 'errr')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    templatecreation,
  });
});
// Candidate Documents from Template Creation 
exports.getCandidateTemplateDocuments = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  const { company, branch} = req?.body;
  try {

    templatecreation = await TemplateCreation.find({ tempaltemode: "Candidate", company: company, branch: branch }).lean();
  } catch (err) {
    console.log(err, 'errr')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    templatecreation,
  });
});
// Candidate Documents from Template Creation 
exports.getCandidateTemplateDocumentsAssignBranch = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  try {
    const { assignbranch } = req.body;

    // Construct the filter query based on the assignbranch array
    const branchFilter = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
    }));
    templatecreation = await TemplateCreation.find({ $or: branchFilter, tempaltemode: "Candidate" }, {}).lean();
  } catch (err) {
    console.log(err, 'errr')
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    templatecreation,
  });
});
exports.getOverallEditTemplate = catchAsyncErrors(async (req, res, next) => {
  let templatecreation;
  try {
    templatecreation = await DocumentPreparation.find({ template: req.body.name }, {}).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: templatecreation.length,
    templatecreation,
  });
});
exports.getOverallEditTemplatedelete = catchAsyncErrors(async (req, res, next) => {
  let result, documnentprep, taskcate, count;
  let id = req.body.id
  try {

    taskcate = await TemplateCreation.find().lean()
    const answer = taskcate?.filter(data => id?.includes(data._id?.toString()))

    documnentprep = await DocumentPreparation.find().lean()
    const unmatchedSubCate = answer.filter(answers => documnentprep.some(sub => sub.template === answers.name))?.map(data => data._id?.toString());

    const duplicateId = [...unmatchedSubCate]
    result = id?.filter(data => !duplicateId?.includes(data))
    count = id?.filter(data => !duplicateId?.includes(data))?.length
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: count,
    result
  });
})
// Create new TemplateCreation=> /api/templatecreation/new
exports.addTemplate = catchAsyncErrors(async (req, res, next) => {
  let atemplatecreation = await TemplateCreation.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle TemplateCreation => /api/brandmaster/:id
exports.getSingleTemplate = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let stemplatecreation = await TemplateCreation.findById(id);

  if (!stemplatecreation) {
    return next(new ErrorHandler("Template Name not found!", 404));
  }
  return res.status(200).json({
    stemplatecreation,
  });
});

// update TemplateCreation by id => /api/brandmaster/:id
exports.updateTemplate = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let utemplatecreation = await TemplateCreation.findByIdAndUpdate(id, req.body);
  if (!utemplatecreation) {
    return next(new ErrorHandler("Template Name not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete TemplateCreation by id => /api/brandmaster/:id
exports.deleteTemplate = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dtemplatecreation = await TemplateCreation.findByIdAndRemove(id);

  if (!dtemplatecreation) {
    return next(new ErrorHandler("Template Name not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});