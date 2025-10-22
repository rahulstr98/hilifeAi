const express = require("express");
const documentRoute = express.Router();

const { getAllRefCategory, addRefCategory, getOverallBulkDeleteReferenceCategory, getSingleRefCategory, updateRefCategory, deleteRefCategory, getOverAllEditrefdocuments } = require("../controller/modules/reference/referenceCategoryDocController");
documentRoute.route("/referencecategories").get(getAllRefCategory);
documentRoute.route("/referencecategory/new").post(addRefCategory);
documentRoute.route("/overallreferencecategorybulkdelete").post(getOverallBulkDeleteReferenceCategory);
documentRoute.route("/referencecategoryedit").post(getOverAllEditrefdocuments);
documentRoute.route("/referencecategory/:id").get(getSingleRefCategory).put(updateRefCategory).delete(deleteRefCategory);
const { getAllDocument, addDocument, getSingleDocument,getsubcategoryMultiSelect,getAllRefDocumentsFilterList, updateDocument, deleteDocument, getsubcategory,updateRefDocOverallEdit, getAllRefDocumentcategoryCheck } = require("../controller/modules/reference/addRefCategoryDocController");
documentRoute.route("/allrefdocuments").get(getAllDocument);
documentRoute.route("/refdocuments/new").post(addDocument);
documentRoute.route("/getsubcategorymultilist").post(getsubcategoryMultiSelect);
documentRoute.route("/referencedocumentfilterlist").post(getAllRefDocumentsFilterList);
documentRoute.route("/getsubcategoryref").post(getsubcategory);
documentRoute.route("/refdocumentdelete").post(getAllRefDocumentcategoryCheck);
documentRoute.route("/refdocumentOverallEdit/:id").put(updateRefDocOverallEdit);
documentRoute.route("/refdocument/:id").get(getSingleDocument).put(updateDocument).delete(deleteDocument);

module.exports = documentRoute;
