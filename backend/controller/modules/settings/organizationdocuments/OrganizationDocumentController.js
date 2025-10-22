const OrganizationDocument = require("../../../../model/modules/settings/organisationdocuments/OrganizationDocumentModel");
const ErrorHandler = require("../../../../utils/errorhandler");
const catchAsyncErrors = require("../../../../middleware/catchAsyncError");
const OrganizationCategory = require("../../../../model/modules/settings/organisationdocuments/OrganizationDocCategoryModel");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// get all org documents = > /api/allrefdocuments
exports.getAllOrgDocument = catchAsyncErrors(async (req, res, next) => {
  let document;
  try {
    document = await OrganizationDocument.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }
  // Add serial numbers to the allorgdocument
  const allorgdocument = document.map((data, index) => ({
    serialNumber: index + 1,
    ...data.toObject(),
  }));

  return res.status(200).json({
    document: allorgdocument,
  });
});

exports.getAllOrgDocumentRequiredfiled = catchAsyncErrors(async (req, res, next) => {
  let document;
  try {
    document = await OrganizationDocument.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }

  // Add serial numbers and only include required fields
  const allorgdocument = document.map((data, index) => ({
    _id: data._id,
    serialNumber: index + 1,
    categoryname: data.categoryname,
    subcategoryname: data.subcategoryname,
    name: data.name
  }));

  return res.status(200).json({
    document: allorgdocument,
  });
});
// exports.getAllOrgDocumentRequiredfiled = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // Query only the required fields from the database to reduce data transfer
//     const documents = await OrganizationDocument.find({}, '_id categoryname subcategoryname name');

//     // If no documents found, return early
//     if (!documents || documents.length === 0) {
//       return next(new ErrorHandler("No documents found", 404));
//     }

//     // Add serial numbers to the documents
//     const allorgdocument = documents.map((data, index) => ({
//       _id: data._id,
//       serialNumber: index + 1,
//       categoryname: data.categoryname,
//       subcategoryname: data.subcategoryname,
//       name: data.name
//     }));

//     // Send response
//     res.status(200).json({
//       success: true,
//       count: allorgdocument.length,
//       documents: allorgdocument,
//     });
//   } catch (err) {
//     return next(new ErrorHandler("Error fetching documents", 500));
//   }
// });

exports.getImageAllOrgDocument = catchAsyncErrors(async (req, res, next) => {
  let document;
  try {
    document = await OrganizationDocument.find({ fileoptionname: "Image-png" }, {});
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }
  // Add serial numbers to the allorgdocument
  const allorgdocument = document.map((data, index) => ({
    serialNumber: index + 1,
    ...data.toObject(),
  }));

  return res.status(200).json({
    document: allorgdocument,
  });
});
//add new org documents => /api/refdocuments/new
// exports.addOrgDocument = catchAsyncErrors(async (req, res, next) => {
//   try {
//     await OrganizationDocument.create(req.body);
//     return res.status(200).json({
//       message: "Successfully added",
//     });
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
// });
exports.addOrgDocument = catchAsyncErrors(async (req, res, next) => {

  try {
    let document = [];

    // Handle first upload button files (e.g., invoices)
    if (req.files["document"]) {
      document = req.files["document"].map((file) => ({
        name: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        filesize: file.size,
      }));
    }

    // Parse JSON data from req.body.jsonData
    let otherJsonData = {};
    if (req.body.jsonData) {
      try {
        otherJsonData = JSON.parse(req.body.jsonData);

      } catch (error) {
        return res.status(400).json({ message: "Invalid JSON format", error });
      }
    }

    // Create expense entry with file data
    let aClubHomePage = await OrganizationDocument.create({
      ...otherJsonData, // Include other request data
      document: document,
    });

    return res.status(200).json({
      message: "Successfully added!",
      // otherpayments: newVisitor,
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error adding Visitor", error });
  }
})

// get single org document => /api/refdocument/:id
exports.getSingleOrgDocument = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let sdocument = await OrganizationDocument.findById(id);
  if (!sdocument) {
    return next(new ErrorHandler("Document not found", 404));
  }
  return res.status(200).json({
    sdocument,
  });
});

// update single org document => /api/refdocument/:id
// exports.updateOrgDocument = catchAsyncErrors(async (req, res, next) => {
//   const id = req.params.id;

//   let udocument = await OrganizationDocument.findByIdAndUpdate(id, req.body);

//   if (!udocument) {
//     return next(new ErrorHandler("Document not found", 404));
//   }
//   return res.status(200).json({
//     message: "Update Successfully",
//     udocument,
//   });
// });

exports.updateOrgDocument = catchAsyncErrors(async (req, res, next) => {
  try {


    const id = req.params.id;


    let document = [];

    // Handle first upload button files (e.g., invoices)
    if (req.files["document"]) {
      document = req.files["document"].map((file) => ({
        name: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        filesize: file.size,
      }));
    }

    // Handle deleted files
    let deletedorganizationFiles = [];
    if (req.body.deletedorganizationFiles) {
      try {
        deletedorganizationFiles = JSON.parse(req.body.deletedorganizationFiles);
        // Asynchronously delete associated files
        deletedorganizationFiles.forEach((file) => {
          const filePath = path.join(__dirname, "../../../../organizationDocumentModule", file.filename);

          // Ensure the file exists before deleting
          fs.access(filePath, fs.constants.F_OK, (err) => {
            if (!err) {
              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error(`Failed to delete file: ${filePath}`, unlinkErr);
                }
              });
            }
          });
        });
      } catch (error) {
        console.log(error, "err delete files")
        return res.status(400).json({ message: "Invalid deletedFiles format", error });
      }
    }


    let otherJsonData = {};
    if (req.body.jsonData) {
      try {
        otherJsonData = JSON.parse(req.body.jsonData);
      } catch (error) {
        console.log(error, "Invalid json format")
        return res.status(400).json({ message: "Invalid JSON format", error });
      }
    }

    // 1. Remove deleted files first
    const expense = await OrganizationDocument.findById(id);


    // Extract files array from the expense document
    const deletedFilesBase64Bills = expense.document?.filter(data => !data?.filename) || [];
    let findlDelete = [...deletedFilesBase64Bills, ...deletedorganizationFiles]
    if (findlDelete.length > 0) {
      await OrganizationDocument.findByIdAndUpdate(id, {
        $pull: {
          document: { _id: { $in: findlDelete.map((f) => new mongoose.Types.ObjectId(f._id)) } },
        },
      });
    }

    // 2. Add new files next
    if (document.length > 0) {
      await OrganizationDocument.findByIdAndUpdate(id, {
        $push: { document: { $each: document } },
      });
    }

    let udocument;
    // 3. Update other JSON data
    if (Object.keys(otherJsonData).length > 0) {
      udocument = await OrganizationDocument.findByIdAndUpdate(id, { $set: otherJsonData });
    }

    return res
      .status(200)
      .json({ message: "Updated successfully", udocument });
  } catch (err) {
    console.error("Error Updating Data:", err);
    return next(new ErrorHandler("Something went wrong", 500));
  }
});

//delete org document  by id => /api/refdocument/:id
exports.deleteOrgDocument = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ddocument = await OrganizationDocument.findByIdAndRemove(id);
  if (!ddocument) {
    return next(new ErrorHandler("Document not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

//get org sub category based on category =>/api/getsubcategoryref
exports.getorgsubcategory = catchAsyncErrors(async (req, res, next) => {
  let subcat;
  try {
    subcat = await OrganizationCategory.find({ categoryname: { $eq: req.body.categoryname } });
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

exports.getOverAllEditOrgDocuments = catchAsyncErrors(async (req, res, next) => {
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
exports.getAllOrgDocumentcategoryCheck = catchAsyncErrors(async (req, res, next) => {
  let refdocumnetcat;
  try {
    let query = {
      categoryname: req.body.checkcategory,
    };
    refdocumnetcat = await OrganizationDocument.find(query, {
      categorycode: 1,
      _id: 1,
    });
  } catch (err) { }
  if (!refdocumnetcat) {
    return next(new ErrorHandler("Document not found!", 404));
  }
  return res.status(200).json({
    refdocumnetcat,
  });
});