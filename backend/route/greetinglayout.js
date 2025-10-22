const express = require("express");
const greetingsRoute = express.Router();


const { getAllSubcategorymaster, getSingleSubcategorymaster, addSubcategorymaster, getoverallSubCategorymaster, updateSubcategorymaster, deleteSubcategorymaster } = require("../controller/modules/greetinglayout/subcategorymaster");
greetingsRoute.route("/subcategorymasters").get(getAllSubcategorymaster);
greetingsRoute.route("/subcategorymaster/new").post(addSubcategorymaster);
greetingsRoute.route("/overallsubcategorymaster").post(getoverallSubCategorymaster);
greetingsRoute.route("/subcategorymaster/:id").get(getSingleSubcategorymaster).put(updateSubcategorymaster).delete(deleteSubcategorymaster);

// Category master from controller
const { getAllCategorymaster, addCategorymaster, getSingleCategorymaster, getoverallCategorymaster, overallCategorymasterbulkdelete, updateCategorymaster, deleteCategorymaster } = require("../controller/modules/greetinglayout/categorymaster");
greetingsRoute.route("/themecategorymasters").get(getAllCategorymaster);
greetingsRoute.route("/themecategorymaster/new").post(addCategorymaster);
greetingsRoute.route("/themecategorymaster/:id").get(getSingleCategorymaster).put(updateCategorymaster).delete(deleteCategorymaster);
greetingsRoute.route("/overallcategorymaster").post(getoverallCategorymaster)
greetingsRoute.route("/overallcategorymasterbulkdelete").post(overallCategorymasterbulkdelete)

const { getAllCategoryThemeGrouping, addCategoryThemeGrouping, categoryThemeGroupingOverall, getSingleCategoryThemeGrouping, updateCategoryThemeGrouping, deleteCategoryThemeGrouping } = require("../controller/modules/greetinglayout/categorythemegrouping");
greetingsRoute.route("/categorythemegroupings").get(getAllCategoryThemeGrouping);
greetingsRoute.route("/categorythemegrouping/new").post(addCategoryThemeGrouping);
greetingsRoute.route("/categorythemegroupingoverall").post(categoryThemeGroupingOverall);
greetingsRoute.route("/categorythemegrouping/:id").get(getSingleCategoryThemeGrouping).put(updateCategoryThemeGrouping).delete(deleteCategoryThemeGrouping);


const { getAllPosterGenerate, addPosterGenerate, getSinglePosterGenerate,PostergenerateSort, getAllUsersDatesWeddingAnniversary, getAllUsersDates, updatePosterGenerate, deletePosterGenerate, getAllPosterGenerateGroup } = require("../controller/modules/greetinglayout/postergenerate");
greetingsRoute.route("/postergenerates").post(getAllPosterGenerate);
greetingsRoute.route("/postergenerategroup").post(getAllPosterGenerateGroup);
greetingsRoute.route("/postergenerate/new").post(addPosterGenerate);
greetingsRoute.route("/postergeneratesort").post(PostergenerateSort);
greetingsRoute.route("/postergenerate/:id").get(getSinglePosterGenerate).put(updatePosterGenerate).delete(deletePosterGenerate);
greetingsRoute.route("/postergenerategroupgetbirthday").get(getAllUsersDates);
greetingsRoute.route("/postergenerategroupgetweddingannivesary").get(getAllUsersDatesWeddingAnniversary);

//POSTER MESSAGE
const { getAllPosterMessage, deletePosterMessage, updatePosterMessage, PosterMessagesettingoverall, getSinglePosterMessage, addPosterMessage } = require("../controller/modules/greetinglayout/Postermessagesetting");
greetingsRoute.route("/postermessagesetting").get(getAllPosterMessage);
greetingsRoute.route("/postermessagesetting/new").post(addPosterMessage);
greetingsRoute.route("/postermessagesettingoverall").post(PosterMessagesettingoverall);
greetingsRoute.route("/postermessagesetting/:id").get(getSinglePosterMessage).put(updatePosterMessage).delete(deletePosterMessage);


//Footer MESSAGE
const { getAllFooterMessage, updateFooterMessage, addFooterMessage } = require("../controller/modules/greetinglayout/Footermessage");
greetingsRoute.route("/footermessage").get(getAllFooterMessage);
greetingsRoute.route("/footermessage/new").post(addFooterMessage);
greetingsRoute.route("/footermessage/:id").put(updateFooterMessage);


const { getAllPPTCategoryAndSubCategory, addPPTCategoryAndSubCategory, getSinglePPTCategoryAndSubCategory, deletePPTCategoryAndSubCategory, updatePPTCategoryAndSubCategory, PPTCategoryAndSubCategoryAutoId } = require("../controller/modules/greetinglayout/PPTCategorySubcategory");
greetingsRoute.route("/pptcategory&subcategory").get(getAllPPTCategoryAndSubCategory);
greetingsRoute.route("/pptcategory&subcategory/new").post(addPPTCategoryAndSubCategory);
greetingsRoute.route("/pptcategory&subcategory/:id").get(getSinglePPTCategoryAndSubCategory).put(updatePPTCategoryAndSubCategory).delete(deletePPTCategoryAndSubCategory);
greetingsRoute.route("/pptcategory&subcategoryautoid").get(PPTCategoryAndSubCategoryAutoId);


const { getAllPowerPoint, deletePowerPoint, getSinglePowerPoint, updatePowerPoint, addPowerPoint,  } = require("../controller/modules/greetinglayout/PowerPoint");
greetingsRoute.route("/powerpoint").get(getAllPowerPoint);
greetingsRoute.route("/powerpoint/new").post(addPowerPoint);
greetingsRoute.route("/powerpoint/:id").get(getSinglePowerPoint).put(updatePowerPoint).delete(deletePowerPoint);

module.exports = greetingsRoute;
