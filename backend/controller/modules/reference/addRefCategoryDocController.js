const ReferenceCategory = require("../../../model/modules/reference/addRefCategoryDocModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const ReferenceSubCategory = require("../../../model/modules/reference/referenceCategoryDocModel");
const ReferenceDoc = require("../../../model/modules/reference/referenceCategoryDocModel");
const multer = require('multer');
const path = require('path');
const express = require('express');
const app = express();

// get all ref documents = > /api/allrefdocuments
exports.getAllDocument = catchAsyncErrors(async (req, res, next) => {
  let document;
  try {
    document = await ReferenceCategory.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }
  // Add serial numbers to the doccategory
  const alldoccategory = document.map((data, index) => ({
    serialNumber: index + 1,
    ...data.toObject(),
  }));

  return res.status(200).json({
    document: alldoccategory,
  });
});




exports.getsubcategoryMultiSelect = catchAsyncErrors(async (req, res, next) => {
  let subcat;
  try {
    subcat = await ReferenceSubCategory.find({ categoryname: { $in: req.body.categoryname } });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    subcat,
  });
});


exports.getAllRefDocumentsFilterList = catchAsyncErrors(async (req, res, next) => {
  let document;
  const { category, subcategory } = req.body;
  try {
    let query = {};
    if (category?.length > 0) {
      query.categoryname = category;
    }
    if (subcategory?.length > 0 && !subcategory?.includes("ALL")) {
      query.subcategoryname = subcategory;
    }
    document = await ReferenceCategory.find(query, {}).lean();
  } catch (err) {
    console.log(err, 'err-addrefcontr')
    return next(new ErrorHandler("Records not found!", 404));
  }


  return res.status(200).json({
    document,
  });
});




// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'reference/');
  },
  filename: function (req, file, cb) {
    cb(null, "Reference_document" + '-' + Date.now() + path.extname(file.originalname));
  }
});


// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /\.(xlsx|xls|csv|pdf|txt)$/;
  const allowedMimeTypes = /^(application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/csv|application\/pdf|text\/plain)$/;

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only Documents are allowed'));
  }
};
// Initialize multer with the storage engine and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});

// //add new ref documents => /api/refdocuments/new
// exports.addDocument = catchAsyncErrors(async (req, res, next) => {
//   try {
//     await ReferenceCategory.create(req.body);
//     return res.status(200).json({
//       message: "Successfully added",
//     });
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
// });
// Define the addDocument controller
exports.addDocument = [
  upload.fields(
    Array.from({ length: 9 }, (_, index) => ({
      name: `referencetodo[${index}][document]`,
      maxCount: 4,
    }))
  ),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const referencetodo = [];


      if (req.files) {
        Object.keys(req.files).forEach((key, index) => {
          const documents = req.files[key] || [];
          const keyindex = Number(key?.split("[")[1]?.substring(0, 1))
          const itemDocuments = documents?.map((file, index) => ({
            name: file.filename,
            path: file.path,
            size: file.size,
          }));
          referencetodo.push({
            document: itemDocuments[0],
            documentstext: req.body["referencetodo"][keyindex]?.documentstext || '',
            label: req.body["referencetodo"][keyindex]?.label || '',
            name: req.body["referencetodo"][keyindex]?.name || '',
            marginQuill: req.body["referencetodo"][keyindex]?.marginQuill || '',
            orientationQuill: req.body["referencetodo"][keyindex]?.orientationQuill || '',
            pagesizeQuill: req.body["referencetodo"][keyindex]?.pagesizeQuill || '',
            no: req.body["referencetodo"][keyindex]?.no || index + 1,
          });
        });
      }



      if (req.body?.referencetodo?.length > 0) {
        req.body.referencetodo?.forEach((item, index) => {
          if (item?.documentstext !== "") {
            referencetodo.push({
              document: item?.document && typeof item.document === 'object' ? item.document : undefined, // Ensure document is an object or undefined
              documentstext: item?.documentstext || '', // Fallback to empty string
              label: item?.label || '', // Fallback to empty string
              name: item?.name || '',
              marginQuill: item?.marginQuill || '',
              orientationQuill: item?.orientationQuill || '',
              pagesizeQuill: item?.pagesizeQuill || '',
              no: item?.no || (index + 1) // Assign index + 1 if `no` is not provided
            });
          }

        });
      }

      const data = {
        referencetodo,
        categoryname: req.body.categoryname || '',
        subcategoryname: req.body.subcategoryname || '',
        step: req.body.step || '',
        // marginQuill: req.body.marginQuill || '',
        // orientationQuill: req.body.orientationQuill || '',
        // pagesizeQuill: req.body.pagesizeQuill || '',
        addedby: Array.isArray(req.body.addedby) && req.body.addedby.length > 0
          ? {
            name: req.body.addedby[0].name || '',
            date: req.body.addedby[0].date || '',
          }
          : {}
      };

      // Simulate saving data to the database
      await ReferenceCategory.create(data);

      return res.status(200).json({ message: 'Successfully added' });
    } catch (err) {
      console.error(err);
      return next(new ErrorHandler('Records not found!', 404));
    }
  }),
];










// get single ref document => /api/refdocument/:id
exports.getSingleDocument = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sdocument = await ReferenceCategory.findById(id);
  if (!sdocument) {
    return next(new ErrorHandler("Document not found", 404));
  }
  return res.status(200).json({
    sdocument,
  });
});


exports.updateRefDocOverallEdit = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const udocument = await ReferenceCategory.findByIdAndUpdate(id, req?.body);
  if (!udocument) {
    return next(new ErrorHandler("Document not found", 404));
  }
  return res.status(200).json({
    udocument,
  });
});

// update single ref document => /api/refdocument/:id
exports.updateDocument = [upload.fields(
  Array.from({ length: 9 }, (_, index) => ({
    name: `referencetodo[${index}][document]`,
    maxCount: 4,
  }))
), catchAsyncErrors(async (req, res, next) => {
  try {
    const referencetodoNew = [];
    const id = req.params.id;
    let udocument;
    let sdocument = await ReferenceCategory.findById(id);
    let documentdRemain = req?.body?.referenceArray?.length > 0 ? sdocument?.referencetodo?.filter(data => req?.body?.referenceArray?.includes(data?.document[0]?.name)) : []
    // Ensure req.files and loop through referencetodo array
    if (req.files) {
      Object.keys(req.files).forEach((key, index) => {
        const documents = req.files[key] || [];
        const keyindex = Number(key?.split("[")[1]?.substring(0, 1))

        const itemDocuments = documents.map((file, index) => ({
          name: file.filename,
          path: file.path,
          size: file.size,
        }));
        referencetodoNew.push({
          document: itemDocuments[0],
          documentstext: req.body["referencetodo"][keyindex]?.documentstext || '',
          label: req.body["referencetodo"][keyindex]?.label || '',
          name: req.body["referencetodo"][keyindex]?.name || '',
          marginQuill: req.body["referencetodo"][keyindex]?.marginQuill || '',
          orientationQuill: req.body["referencetodo"][keyindex]?.orientationQuill || '',
          pagesizeQuill: req.body["referencetodo"][keyindex]?.pagesizeQuill || '',
          no: req.body["referencetodo"][keyindex]?.no || index + 1,
        });
      });
    }
    const documentsText = req.body.referencetodo?.filter(data => data?.documentstext !== "")
    if (req.body?.referencetodo?.length > 0 && req?.files?.length === undefined && documentsText?.length > 0) {
      req.body.referencetodo.forEach((item, index) => {
        if (item?.documentstext !== "") {
          referencetodoNew.push({
            document: item?.document && typeof item.document === 'object' ? item.document : undefined, // Ensure document is an object or undefined
            documentstext: item?.documentstext || '', // Fallback to empty string
            label: item?.label || '', // Fallback to empty string
            name: item?.name || '',
            pagesizeQuill: item?.pagesizeQuill || '',
            orientationQuill: item?.orientationQuill || '',
            marginQuill: item?.marginQuill || '',
            no: item?.no || (index + 1) // Assign index + 1 if `no` is not provided
          });
        }
      });
    }



    let referencetodo = [...documentdRemain, ...referencetodoNew];

    const data = {
      referencetodo,
      categoryname: req.body.categoryname || '',
      subcategoryname: req.body.subcategoryname || '',
      step: req.body.step || '',
      // marginQuill: req.body.marginQuill || '',
      // orientationQuill: req.body.orientationQuill || '',
      // pagesizeQuill: req.body.pagesizeQuill || '',
      updatedby: Array.isArray(req.body.updatedby) && req.body.updatedby.length > 0
        ? req.body.updatedby.map(item => ({
          name: item.name || '',
          date: item.date || '',
        }))
        : [],
    };
    udocument = await ReferenceCategory.findByIdAndUpdate(id, data);
    if (!udocument) {
      return next(new ErrorHandler("Document not found", 404));
    }
    return res.status(200).json({
      message: "Update Successfully",
      udocument,
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler('Records not found!', 404));
  }
})];

//delete document  by id => /api/refdocument/:id
exports.deleteDocument = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ddocument = await ReferenceCategory.findByIdAndRemove(id);
  if (!ddocument) {
    return next(new ErrorHandler("Document not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

//get sub category based on category =>/api/getsubcategoryref
exports.getsubcategory = catchAsyncErrors(async (req, res, next) => {
  let subcat;
  try {
    subcat = await ReferenceSubCategory.find({ categoryname: { $eq: req.body.categoryname } });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!subcat) {
    return next(new ErrorHandler("Category  not found!", 404));
  }
  return res.status(200).json({
    subcat,
  });
});

exports.getOverAllEditRefDocuments = catchAsyncErrors(async (req, res, next) => {
  let documentsall, query, documents, docindex;
  try {
    documentsall = await Document.find(query, {});

    documents = documentsall.filter((item) => item.categoryname == req.body.oldname && req.body.oldnamesub.includes(item.subcategoryname));

    docindex = documentsall.findIndex((item) => req.body.oldnamesub.includes(item.subcategoryname));

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: documents.length,

    documents,
    docindex,
  });
});

// get overall delete functionlity
exports.getAllRefDocumentcategoryCheck = catchAsyncErrors(async (req, res, next) => {
  let refdocumnetcat;
  try {
    let query = {
      categoryname: req.body.checkcategory,
    };
    refdocumnetcat = await ReferenceCategory.find(query, {
      categorycode: 1,
      _id: 1,
    });
  } catch (err) { }
  if (!refdocumnetcat) {
    return next(new ErrorHandler("RefDocument not found!", 404));
  }
  return res.status(200).json({
    refdocumnetcat,
  });
});
