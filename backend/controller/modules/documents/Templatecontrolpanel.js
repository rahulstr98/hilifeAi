const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const User = require("../../../model/login/auth");
const TemplatecontrolpanelModel = require("../../../model/modules/documents/Templatecontrolpnael");
const mongoose = require("mongoose");
const TemplateCreation = require("../../../model/modules/TemplateCreationModel");

// Get TemplatecontrolpanelModel  => /api/TemplatecontrolpanelModel
exports.getAllTemplatecontrolpanelModel = catchAsyncErrors(
  async (req, res, next) => {
    let templatecontrolpanel;
    try {
      templatecontrolpanel = await TemplatecontrolpanelModel.find(
        {},
        {
          company: 1,
          branch: 1,
          _id: 1,
          companyurl: 1,
          companyname: 1,
          address: 1,
        }
      ).lean();
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    if (!templatecontrolpanel) {
      return next(new ErrorHandler("Data not found", 404));
    }
    return res.status(200).json({
      templatecontrolpanel,
    });
  }
);
exports.getAaccessibleBranchAllTemplatecontrolpanelModel = catchAsyncErrors(
  async (req, res, next) => {
    let templatecontrolpanel;
    try {
      const { assignbranch } = req.body;
      const branchFilter = assignbranch.map((branchObj) => ({
        branch: branchObj.branch,
        company: branchObj.company,
      }));
      templatecontrolpanel = await TemplatecontrolpanelModel.find(
        { $or: branchFilter },
        {
          company: 1,
          branch: 1,
          _id: 1,
          companyurl: 1,
          companyname: 1,
          address: 1,
        }
      ).lean();
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    if (!templatecontrolpanel) {
      return next(new ErrorHandler("Data not found", 404));
    }
    return res.status(200).json({
      templatecontrolpanel,
    });
  }
);
exports.getAllFilterTemplatecontrolpanelModel = catchAsyncErrors(
  async (req, res, next) => {
    let templatecontrolpanel = [],
      headerfooter;
    const { company, branch, template , pagename} = req?.body;

    console.log(company, branch, template,pagename, "company, branch, template");
    try {
      templatecontrolpanel = await TemplatecontrolpanelModel.findOne(
        { company, branch },
        {
          _id: 1,
          templatecontrolpanellog: {
            $slice: -1, // Get the last item from the array
          },
        }
      ).lean();

      if (template) {
        headerfooter = await TemplateCreation.findOne(
          { company, branch, name: template , tempaltemode : pagename },
          { header: 1, footer: 1 }
        );
      }
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
      templatecontrolpanel,
      headerfooter,
    });
  }
);
exports.getAllDuplicateTemplatecontrolpanel = catchAsyncErrors(
  async (req, res, next) => {
    let templatecontrolpanel;
    try {
      templatecontrolpanel = await TemplatecontrolpanelModel.find(
        {},
        { company: 1, branch: 1, _id: 1 }
      ).lean();
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    if (!templatecontrolpanel) {
      return next(new ErrorHandler("Data not found", 404));
    }
    return res.status(200).json({
      templatecontrolpanel,
    });
  }
);
exports.getAllUserDetailsDocuments = catchAsyncErrors(
  async (req, res, next) => {
    let result, templatecontrolpanel, checkLog;
    //     user : userFind
    const user = req?.body?.user;
    try {
      templatecontrolpanel = await TemplatecontrolpanelModel.find(
        { company: user?.company, branch: user?.branch },
        { templatecontrolpanellog: 1 }
      ).lean();
      checkLog = templatecontrolpanel?.map(
        (data) =>
          data?.templatecontrolpanellog[
            data?.templatecontrolpanellog?.length - 1
          ]
      );
      result =
        user != "none"
          ? checkLog?.filter(
              (data) =>
                data?.company == user?.company && data?.branch === user?.branch
            )
          : [];
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
      result,
    });
  }
);

// Create TemplatecontrolpanelModel  => /api/TemplatecontrolpanelModel
const parseSafe = (str) => {
  try {
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
};

// 🧱 Step 1: Group files based on their prefix (before `_`)
// 🧩 Helper to group dynamic (array-style) file fields
const groupFilesByField = (files) => {
  const grouped = {};

  files.forEach((file) => {
    const parts = file.fieldname.split("_");

    // Example: documentseal_0_document
    if (parts.length === 3) {
      const [key, index, subKey] = parts;

      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][index]) grouped[key][index] = {};

      grouped[key][index][subKey] = {
        name: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }

    // Example: letterheadbodycontent (no underscore)
    else if (parts.length === 1) {
      const key = parts[0];

      grouped[key] = {
        name: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }
  });

  return grouped;
};

// 🧩 Step 2: In your controller
exports.createTemplatecontrolpanelModel = catchAsyncErrors(
  async (req, res, next) => {
    // console.log("🧾 req.body:", req.body);
    // console.log("📂 req.files:", req.files);
    try {
      // Group files dynamically
      const groupedFiles = groupFilesByField(req.files || []);

      // Extract normal string fields
      const {
        company,
        branch,
        emailformat,
        fromemail,
        ccemail,
        bccemail,
        companyurl,
        companyname,
        address,
        sealtype,
        toCompany,
        qrInfo,
        addedby,
      } = req.body;

      const StringItems = {
        company,
        branch,
        emailformat,
        fromemail,
        ccemail: parseSafe(ccemail),
        bccemail: parseSafe(bccemail),
        companyurl,
        companyname,
        address,
        sealtype,
        toCompany: parseSafe(toCompany),
        qrInfo: parseSafe(qrInfo),
        addedby: parseSafe(addedby),
      };

      // 🧱 Step 3: Reconstruct complex fields (TODO-type)
      const buildTodoArray = (prefix) => {
        const result = [];

        // find all keys that start with prefix + "_index_"
        Object.keys(req.body).forEach((key) => {
          if (key.startsWith(prefix + "_")) {
            const [_, index, field] = key.split("_");
            if (!result[index]) result[index] = {};
            result[index][field] = req.body[key];
          }
        });

        // Merge file data if exists
        if (groupedFiles[prefix]) {
          Object.keys(groupedFiles[prefix]).forEach((index) => {
            const fileObj = groupedFiles[prefix][index];
            result[index] = { ...(result[index] || {}), ...fileObj };
          });
        }

        return result.filter(Boolean);
      };

      // ✅ Step 4: Construct file data (merged)
      const FileItems = {
        letterheadcontentheader: buildTodoArray("letterheadcontentheader"),
        letterheadcontentfooter: buildTodoArray("letterheadcontentfooter"),
        documentseal: buildTodoArray("documentseal"),
        documentsignature: buildTodoArray("documentsignature"),

        // normal file-only fields (not array)
        letterheadbodycontent: groupedFiles.letterheadbodycontent || {},
        idcardfrontheader: groupedFiles.idcardfrontheader || {},
        idcardfrontfooter: groupedFiles.idcardfrontfooter || {},
        idcardbackheader: groupedFiles.idcardbackheader || {},
        idcardbackfooter: groupedFiles.idcardbackfooter || {},
        documentcompany: groupedFiles.documentcompany || {},
      };

      // ✅ Step 5: Combine
      const dataToSave = { ...StringItems, ...FileItems };
      const finalDataSave = {
        ...dataToSave,
        templatecontrolpanellog: [dataToSave],
      };

      // console.log(
      //   //   finalDataSave,
      //   "📦 Final structured data:",
      //   JSON.stringify(finalDataSave, null, 2)
      // );

      // Save to MongoDB or perform further logic
      let data = await TemplatecontrolpanelModel.create(finalDataSave);

      return res.status(200).json({
        message: "Successfully added",
        data: dataToSave,
      });
    } catch (err) {
      console.log(err, "err");
    }
  }
);

// get single TemplatecontrolpanelModel =>/api/TemplatecontrolpanelModel/:id
exports.getSingleTemplatecontrolpanelModel = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;
    let stemplatecontrolpanel = await TemplatecontrolpanelModel.findById(id);
    if (!stemplatecontrolpanel) {
      return next(new ErrorHandler("Id not found"));
    }
    return res.status(200).json({
      stemplatecontrolpanel,
    });
  }
);

// update TemplatecontrolpanelModel to all users => /api/TemplatecontrolpanelModel/:id
// exports.updateTemplatecontrolpanelModel = catchAsyncErrors(
//   async (req, res, next) => {
//     const id = req.params.id;
//     let utemplatecontrolpanel =
//       await TemplatecontrolpanelModel.findByIdAndUpdate(id, req.body);

//     if (!utemplatecontrolpanel) {
//       return next(new ErrorHandler("Id not found!", 404));
//     }
//     return res.status(200).json({ message: "Updated successfully" });
//   }
// );

const groupFilesByFieldEdit = (files) => {
  const grouped = {};

  files.forEach((file) => {
    const parts = file.fieldname.split("_");

    // Example: documentseal_0_document
    if (parts.length === 3) {
      const [key, index, subKey] = parts;

      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][index]) grouped[key][index] = {};

      grouped[key][index][subKey] = {
        name: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }

    // Example: letterheadbodycontent (no underscore)
    else if (parts.length === 1) {
      const key = parts[0];

      grouped[key] = {
        name: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }
  });

  return grouped;
};

exports.updateTemplatecontrolpanelModel = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const id = req.params.id;

      // 🧩 Step 1: Group uploaded files (new)
      const groupedFiles = groupFilesByFieldEdit(req.files || []);

      // console.log(req?.files, req?.body);

      // 🧩 Step 2: Safe JSON parser
      const parseSafe = (str) => {
        try {
          return str ? JSON.parse(str) : [];
        } catch {
          return [];
        }
      };

      const buildTodoArrayEdit = (prefix) => {
        const result = [];

        // find all keys that start with prefix + "_index_"
        Object.keys(req.body).forEach((key) => {
          if (key.startsWith(prefix + "_")) {
            const [_, index, field] = key.split("_");
            if (!result[index]) result[index] = {};
            result[index][field] = req.body[key];
          }
        });

        // Merge file data if exists
        if (groupedFiles[prefix]) {
          Object.keys(groupedFiles[prefix]).forEach((index) => {
            const fileObj = groupedFiles[prefix][index];
            result[index] = { ...(result[index] || {}), ...fileObj };
          });
        }

        // 🔹 Convert known file fields (string ➜ object)
        result.forEach((item) => {
          if (
            prefix === "letterheadcontentheader" &&
            typeof item.headerimage === "string"
          ) {
            try {
              item.headerimage = JSON.parse(item.headerimage);
            } catch {
              item.headerimage = { name: item.headerimage };
            }
          }

          if (
            prefix === "letterheadcontentfooter" &&
            typeof item.footerimage === "string"
          ) {
            try {
              item.footerimage = JSON.parse(item.footerimage);
            } catch {
              item.footerimage = { name: item.footerimage };
            }
          }

          if (
            (prefix === "documentseal" || prefix === "documentsignature") &&
            typeof item.document === "string"
          ) {
            try {
              item.document = JSON.parse(item.document);
            } catch {
              item.document = { name: item.document };
            }
          }
        });

        return result.filter(Boolean);
      };
      // 🧩 Step 3: Extract string fields
      // Extract normal string fields
      const {
        company,
        branch,
        emailformat,
        fromemail,
        ccemail,
        bccemail,
        companyurl,
        companyname,
        address,
        sealtype,
        toCompany,
        qrInfo,
        updatedby,
        templatecontrolpanellog,
        letterheadbodycontent_old,
        idcardfrontheader_old,
        idcardfrontfooter_old,
        idcardbackheader_old,
        idcardbackfooter_old,
        documentcompany_old,
      } = req.body;
      // console.log(req.body
      // );
      const StringItems = {
        company,
        branch,
        emailformat,
        fromemail,
        ccemail: parseSafe(ccemail),
        bccemail: parseSafe(bccemail),
        companyurl,
        companyname,
        address,
        sealtype,
        toCompany: parseSafe(toCompany),
        qrInfo: parseSafe(qrInfo),
        updatedby: parseSafe(updatedby),
        // letterheadbodycontent: parseSafe(letterheadbodycontent),
        // idcardfrontheader: parseSafe(idcardfrontheader),
        // idcardfrontfooter: parseSafe(idcardfrontfooter),
        // idcardbackheader: parseSafe(idcardbackheader),
        // idcardbackfooter: parseSafe(idcardbackfooter),
        // documentcompany: parseSafe(documentcompany),
        templatecontrolpanellog: parseSafe(templatecontrolpanellog),
      };

      // 🧱 Step 3: Reconstruct complex fields (TODO-type)

      // ✅ Step 4: Construct file data (merged)
      const FileItems = {
        letterheadcontentheader: buildTodoArrayEdit("letterheadcontentheader"),
        letterheadcontentfooter: buildTodoArrayEdit("letterheadcontentfooter"),
        documentseal: buildTodoArrayEdit("documentseal"),
        documentsignature: buildTodoArrayEdit("documentsignature"),

        // normal file-only fields (not array)
        letterheadbodycontent:
          groupedFiles.letterheadbodycontent ||
          parseSafe(letterheadbodycontent_old),
        idcardfrontheader:
          groupedFiles.idcardfrontheader || parseSafe(idcardfrontheader_old),
        idcardfrontfooter:
          groupedFiles.idcardfrontfooter || parseSafe(idcardfrontfooter_old),
        idcardbackheader:
          groupedFiles.idcardbackheader || parseSafe(idcardbackheader_old),
        idcardbackfooter:
          groupedFiles.idcardbackfooter || parseSafe(idcardbackfooter_old),
        documentcompany:
          groupedFiles.documentcompany || parseSafe(documentcompany_old),
      };

      // ✅ Step 5: Combine
      const dataToSave = { ...StringItems, ...FileItems };

      const finalDataSave = {
        ...dataToSave,
        templatecontrolpanellog: [
          ...StringItems?.templatecontrolpanellog,
          dataToSave,
        ],
      };

      // 🧩 Step 7: Update DB
      const updatedDoc = await TemplatecontrolpanelModel.findByIdAndUpdate(
        id,
        { $set: finalDataSave },
        { new: true }
      );

      if (!finalDataSave) {
        return next(new ErrorHandler("Template not found!", 404));
      }

      res.status(200).json({
        message: "Updated successfully",
        data: finalDataSave,
      });
    } catch (err) {
      console.log(err, "err");
    }
  }
);

exports.deleteTemplatecontrolpanelModel = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;
    let templatecontrolpanel =
      await TemplatecontrolpanelModel.findByIdAndRemove(id);
    if (!templatecontrolpanel) {
      return next(new ErrorHandler("Data not found", 404));
    }

    return res.status(200).json({ message: "Deleted successfully" });
  }
);

exports.deleteSingleObject = catchAsyncErrors(async (req, res, next) => {
  const { parentId, itemId } = req.params;

  // Validate the IDs
  if (
    !mongoose.Types.ObjectId.isValid(parentId) ||
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    // Find the document
    const document = await TemplatecontrolpanelModel.findById(parentId);
    if (!document) {
      return res.status(404).send({ message: "Parent document not found" });
    }
    // Check if the item exists in the array
    const itemIndex = document.templatecontrolpanellog.findIndex((item) =>
      item._id.equals(itemId)
    );
    if (itemIndex === -1) {
      return res.status(404).send({ message: "Item not found in the array" });
    }

    document.templatecontrolpanellog.splice(itemIndex, 1);

    await document.save();

    res.status(200).send({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "An error occurred", error });
  }
});
