const Categoryprod = require("../../../model/modules/production/categoryprodmodel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const SubCategoryprod = require("../../../model/modules/production/subcategoryprodmodel");
const Projectmaster = require('../../../model/modules/setup/project');
const Unitrate = require("../../../model/modules/production/productionunitrate");
const QueueTypeMaster = require('../../../model/modules/production/queuetypemaster');

// get All categoryprod => /api/categoryprod
exports.getAllCategoryprod = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find();
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

exports.CategoryprodSort = catchAsyncErrors(async (req, res, next) => {
  let totalProjects, result, totalPages, currentPage;

  const { page, pageSize } = req.body;
  try {
    totalProjects = await Categoryprod.countDocuments();

    result = await Categoryprod.find()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    totalProjects,
    result,
    currentPage: page,
    totalPages: Math.ceil(totalProjects / pageSize),
  });
});

// get All subcategoryprod => /api/subcategoryprod
// exports.CategoryprodSort = catchAsyncErrors(async (req, res, next) => {
//   let result;
//   try {
//     const page = req.body.page || 1; // Get this value from the client request
//     const limit = req.body.pageSize || 100; // Set a reasonable limit for the number of documents per page
//     const searchTerm = req.body.searchterm; // Get this value from the client request (e.g., from a query parameter)

//     // Build the search criteria conditionally
//     let searchCriteria = {};
//     if (searchTerm) {
//       const searchTermsArray = searchTerm.split(" ");
//       const regexTerms = searchTermsArray.map((term) => new RegExp(term, "i"));

//       // searchCriteria = {
//       //   $or: [
//       //     { project: { $in: regexTerms } },
//       //     { categoryname: { $in: regexTerms } }, // Match any word in categoryname
//       //     { name: { $in: regexTerms } }, // Match any word in name
//       //     { mismatchmode: { $in: regexTerms } }, // Match any word in name
//       //   ],
//       // };
//       searchCriteria = {
//         $and: regexTerms.map((regex) => ({
//           $or: [{ project: regex }, { categoryname: regex }, { name: regex }, { mismatchmode: regex }],
//         })),
//       };
//     }
//     // Fetch all matching documents to get total count
//     totalProjects = await Categoryprod.countDocuments(searchCriteria);

//     // Fetch all matching documents for the search criteria if searchTerm is provided, otherwise fetch all documents
//     const allMatchingDocs = searchTerm
//       ? await Categoryprod.find(searchCriteria).select("_id name categoryname project mode mismatchmode").lean().exec()
//       : await Categoryprod.find().select("_id name categoryname project mode mismatchmode").lean().exec();

//     // Perform pagination on all matching documents
//     result = allMatchingDocs.slice((page - 1) * limit, page * limit);
//   } catch (err) {
 // return next(new ErrorHandler('Data not found!', 404));
  //   }
//   if (!result) {
//     return next(new ErrorHandler("SubCategoryprod not found!", 404));
//   }
//   return res.status(200).json({
//     // count: products.length,
//     result,
//     totalProjects,
//   });
// });

// get All categoryprod => /api/categoryprod
exports.getAllCategoryprodLimited = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({}, { name: 1, project: 1, flagstatus: 1, mismatchmode: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

// Create new categoryprod=> /api/categoryprod/new
exports.addCategoryprod = catchAsyncErrors(async (req, res, next) => {
  try {
    // Create new Categoryprod entry
    let acategoryprod = await Categoryprod.create(req.body);
    return res.status(200).json({
      message: "Successfully added!",
      data: acategoryprod,
    });
  } catch (error) {
    // Pass any errors to the centralized error handler
    next(error);
  }
});

// get Signle categoryprod => /api/categoryprod/:id
exports.getSingleCategoryprod = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let scategoryprod = await Categoryprod.findById(id);

  if (!scategoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    scategoryprod,
  });
});

// update categoryprod by id => /api/categoryprod/:id
exports.updateCategoryprod = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ucategoryprod = await Categoryprod.findByIdAndUpdate(id, req.body);
  if (!ucategoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete categoryprod by id => /api/categoryprod/:id
exports.deleteCategoryprod = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dcategoryprod = await Categoryprod.findByIdAndRemove(id);

  if (!dcategoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

// get All ProductionUpload => /api/productionuploads
exports.checkCategoryForProdUpload = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    const { project, category } = req.body;
    categoryprod = await Categoryprod.find({ project: project, name: { $in: category } }, { project: 1, name: 1, flagstatus: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    categoryprod,
  });
});

// get All ProductionUpload => /api/productionuploads
exports.categoryLimitedKeyword = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({ keyword: { $exists: true, $ne: [] } }, { project: 1, name: 1, keyword: 1, _id: 0 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    categoryprod,
  });
});

// get All ProductionUpload => /api/productionuploads
exports.categoryLimitedNameonly = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    const projectName = req.body.project.split("-")[0];
    categoryprod = await Categoryprod.find({ project: projectName }, { name: 1, _id: 0 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    categoryprod,
  });
});

// get All categoryprod => /api/categoryprod
exports.getAllCategoryprodLimitedOriginal = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({ $or: [{ flagstatusorg: "Yes" }, { flagstatus: "Yes" }] }, { name: 1, project: 1, flagstatusorg: 1, flagstatus: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

// get All categoryprod => /api/categoryprod
exports.getAllCategoryprodLimitedTemp = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({ $or: [{ flagstatustemp: "Yes" }, { flagstatus: "Yes" }] }, { name: 1, project: 1, flagstatus: 1, flagstatustemp: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

exports.fetchEnbalePagesBasedProjCateSub = catchAsyncErrors(async (req, res, next) => {
  let result = false;
  try {
    const { project, category, subcategory } = req.body;
    const projectData = await Projectmaster.findOne({ name: project }, { enablepage: 1 });
    const categoryData = await Categoryprod.findOne({ project, name: category }, { enablepage: 1 });
    const subcategoryData = await SubCategoryprod.findOne({ project, categoryname: category, name: subcategory }, { enablepage: 1 });

    // Check the project enablepage
    if (projectData && projectData.enablepage) {
      result = true;
    }
    // Check the category enablepage
    else if (categoryData && categoryData.enablepage) {
      result = true;
    }
    // Check the subcategory enablepage
    else if (subcategoryData && subcategoryData.enablepage) {
      result = true;
    }
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  // if (!result) {
  //   return next(new ErrorHandler("Project not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    result,
  });
});

// get All categoryprod => /api/categoryprod
exports.categoryProdLimitedOrgFlagCalc = catchAsyncErrors(async (req, res, next) => {
  let categoryprod = [];
  try {
    categoryprod = await Categoryprod.find({ flagmanualcalcorg: { $exists: true, $ne: "" }, flagstatusorg: "Yes" }, { name: 1, project: 1, flagmanualcalcorg: 1 });
    if (!categoryprod) {
      return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
      // count: products.length,
      categoryprod,
    });
  } catch (err) {
    return next(new ErrorHandler("Data not found!", 404));
  }
 
});

// get All categoryprod => /api/categoryprod
exports.categoryProdLimitedTempFlagCalc = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({ flagmanualcalctemp: { $exists: true, $ne: "" }, flagstatustemp: "Yes" }, { name: 1, project: 1, flagmanualcalctemp: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

// get All categoryprod => /api/categoryprod
exports.categoryOverAllCheckDelete = catchAsyncErrors(async (req, res, next) => {
  let subcategorycount, unitratecount;
  try {
    subcategorycount = await SubCategoryprod.countDocuments({ categoryname: req.body.category, project: req.body.project });
    unitratecount = await Unitrate.countDocuments({ category: req.body.category, project: req.body.project });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    count: subcategorycount + unitratecount,
    subcategorycount,
    unitratecount,
  });
});

// get All categoryprod => /api/categoryprod
exports.categoryOverAllCheckDeleteBulk = catchAsyncErrors(async (req, res, next) => {
  let subcategory, unitrate;
  try {
    let querysubcategory = { $or: req.body.projectcategory.map((item) => ({ categoryname: item.category, project: item.project })) };
    let querycategory = { $or: req.body.projectcategory.map((item) => ({ category: item.category, project: item.project })) };

    subcategory = await SubCategoryprod.find(querysubcategory, { categoryname: 1, project: 1 });
    unitrate = await Unitrate.find(querycategory, { category: 1, project: 1 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    count: subcategory.length + unitrate.length,
    subcategory,
    unitrate,
  });
});

exports.categoryOverAllCheckEdit = catchAsyncErrors(async (req, res, next) => {
  let subcategorycount, unitratecount;
  try {
    subcategorycount = await SubCategoryprod.countDocuments({ categoryname: req.body.category, project: req.body.project });
    unitratecount = await Unitrate.countDocuments({ category: req.body.category, project: req.body.project });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    count: subcategorycount + unitratecount,
    subcategorycount,
    unitratecount,
  });
});

exports.categoryProdOverAllEditBulkUpdate = catchAsyncErrors(async (req, res, next) => {
  let updatedSubcategories, updatedUnitrates;
  try {
    const { project, category, subcategorycount, unitratecount, updatedcategory } = req.body;

    if (subcategorycount > 0) {
      updatedSubcategories = await SubCategoryprod.updateMany({ project: project, categoryname: category }, { $set: { categoryname: updatedcategory } });
    }
    if (unitratecount > 0) {
      updatedUnitrates = await Unitrate.updateMany({ project: project, category: category }, { $set: { category: updatedcategory } });
    }
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    updatedSubcategories,
    updatedUnitrates,
  });
});

// get All ProductionUpload => /api/productionuploads
exports.categoryOverAllNonLinkBulkDelete = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.deleteMany({
      $or: req.body.nonLinkedCategories.map((item) => ({
        project: item.project,
        name: item.category,
      })),
    });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    categoryprod,
  });
});


// get All categoryprod => /api/categoryprod
exports.categoryProdLimitedUnallot = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({ project: { $in: req.body.project } }, { name: 1, _id: 0 });
  } catch (err) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

// get All categoryprod => /api/categoryprod
exports.categoryProdLimitedReportsMulti = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({ project: { $in: req.body.projectvendor } }, { name: 1, _id: 0 });
  } catch (err) {
    console.log(err.message);
  }
  // if (!categoryprod) {
  //   return next(new ErrorHandler("Categoryprod not found!", 404));
  // }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

exports.categoryProdLimitedProductionQueueType = catchAsyncErrors(async (req, res, next) => {
  let categoryprod, queuetypemaster, unitrate;

  try {
    // Fetch required data from the database
    categoryprod = await Categoryprod.find({ project: req.body.projectvendor }, { name: 1, _id: 0 });
    unitrate = await Unitrate.find({ project: req.body.projectvendor }, { project: 1, category: 1, subcategory: 1, _id: 0 });
    queuetypemaster = await QueueTypeMaster.find({ vendor: new RegExp("^" + req.body.projectvendor), type: { $in: req.body.type } }, { vendor: 1, category: 1, subcategory: 1, type: 1, _id: 0 });
    //   console.log(req.body.projectvendor, "queuetypemaster")
    // Function to group unitrate or queuetypemaster by project and category
    const getGroupedCategories = (data) => {
      return data.reduce((acc, item) => {
        const { project, category, subcategory } = item;
        // console.log(/)
        if (!acc[project]) acc[project] = {};
        if (!acc[project][category]) acc[project][category] = new Set();
        acc[project][category].add(subcategory);
        return acc;
      }, {});
    };


    const getAvailableCategories = (project, unitrate, queuetypemaster, categoryprod) => {

      const groupedUnitrate = getGroupedCategories(unitrate);
      const groupedQueuetypemaster = getGroupedCategories(queuetypemaster);


      return categoryprod.filter(({ name: category }) => {
        //  console.log(category, "cat")
        const subcategories = groupedUnitrate[project]?.[category] || new Set();
        const queueSubcategories = groupedQueuetypemaster[project]?.[category] || new Set();


        return [...subcategories].some(sub => !queueSubcategories.has(sub));
      }).map(({ name }) => name);
    };


    const availableCategories = getAvailableCategories(
      req.body.projectvendor,
      unitrate,
      queuetypemaster.map(d => ({ ...d._doc, project: d._doc.vendor.split("-")[0], type: d._doc.type })),
      categoryprod
    );


    return res.status(200).json({
      categoryprod: availableCategories,
    });
  } catch (err) {
    console.log(err, "cprod");
    return res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

exports.getAllCategoryprodLimitedProject = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.find({},{project:1, name:1});
  } catch (err) {
    console.log(err.message);
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

exports.getDefaultMrateCategory = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
   
    categoryprod = await Categoryprod.findOne({name:req.body.category, project:req.body.project},{ mrateprimary:1,    mratesecondary:1,    mratereconcile:1})
  } catch (err) {
    console.log(err.message);
  }
  if (!categoryprod) {
    return next(new ErrorHandler("Categoryprod not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    categoryprod,
  });
});

// get All categoryprod => /api/categoryprod
exports.categoryDupeCheck = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    categoryprod = await Categoryprod.countDocuments({ project:  req.body.project , name :req.body.name });
    console.log(categoryprod)
  } catch (err) {
    console.log(err);
  }
 
  return res.status(200).json({
    categoryprod
  });
});

// get All categoryprod => /api/categoryprod
exports.blukMrateKeywordsUpdate = catchAsyncErrors(async (req, res, next) => {
  let categoryprod;
  try {
    const { ids, mrateprimarykeywords,selectPrimaryChecked,selectSecondaryChecked,selectReconcileChecked, mratesecondarykeywords, mratereconcilekeywords, mrateprimary, mratesecondary,  mratereconcile} = req.body

    const updatedData = {
      ...(selectPrimaryChecked ? {mrateprimarykeywords:mrateprimarykeywords} : {}),
      ...(selectPrimaryChecked ? { mrateprimary: mrateprimary } : {}),
      ...(selectSecondaryChecked ? {mratesecondarykeywords:mratesecondarykeywords} : {}),
      ...(selectSecondaryChecked ? { mratesecondary: mratesecondary } : {}),
      ...(selectReconcileChecked ? {mratereconcilekeywords:mratereconcilekeywords }: {}),
      ...(selectReconcileChecked ? { mratereconcile: mratereconcile } : {})
    
    }
   
    categoryprod = await Categoryprod.updateMany({ _id:{$in:ids} }, { 
      $set: updatedData    
    });
      console.log(categoryprod,'categoryprod')
  } catch (err) {
    console.log(err);
  }
 
  return res.status(200).json({
    categoryprod
  });
});

