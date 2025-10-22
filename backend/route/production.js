const express = require("express");
const productionRoute = express.Router();
//Client User ID route

const { addClientUserID, deleteClientUserID,getAllClientUserCheck,clientUseridsLimitedUser,getSingleClientUserIDForLog,clientUserIdLimitedTimestudyByCompnynameMulti,clientUseridsReportIdsOnly,updateLoginAllotLogValues,deleteLoginAllotLog,
  resetClientUserIdData,clientUserIdLimitedTimestudy, clientUserIdLimitedTimestudyByCompnyname,getClientUserSort,getAllClientUserIDData,getLoginAllotidDetails,getAllClientUserID,getAllClientUserIDLimited, getSingleClientUserID, updateClientUserID } = require("../controller/modules/production/ClientUserIDController");
productionRoute.route("/clientuserids").get(getAllClientUserID);
productionRoute.route("/clientuseridsdata").get(getAllClientUserIDData);
productionRoute.route("/clientuseridsort").post(getClientUserSort);
productionRoute.route("/loginallotlog").delete(deleteLoginAllotLog).put(updateLoginAllotLogValues);
productionRoute.route("/resetclientuserid").put(resetClientUserIdData);
productionRoute.route("/clientuseridusercheck").post(getAllClientUserCheck);
productionRoute.route("/clientuserid/new").post(addClientUserID);
productionRoute.route("/clientuseridslimited").get(getAllClientUserIDLimited);
productionRoute.route("/clientuserid/:id").delete(deleteClientUserID).get(getSingleClientUserID).put(updateClientUserID);
productionRoute.route("/getloginallotiddetails").post(getLoginAllotidDetails);
productionRoute.route("/clientuseridsreportidsonly").get(clientUseridsReportIdsOnly);
productionRoute.route("/clientuseridlimiteduser").post(clientUseridsLimitedUser);
productionRoute.route("/clientuseridlimitedtimestudy").post(clientUserIdLimitedTimestudy);
productionRoute.route("/clientuseridlimitedtimestudybycompanyname").post(clientUserIdLimitedTimestudyByCompnyname);
productionRoute.route("/clientuseridlimitedtimestudybycompanynameMulti").post(clientUserIdLimitedTimestudyByCompnynameMulti);
productionRoute.route("/clientuseridforlog/:id").get(getSingleClientUserIDForLog);
//Process Queue Name route

const { addProcessQueueName, deleteProcessQueueName, getAllUnassignedReportList, getAllProcessQueueName,getAllProcessQueueNameUnAssignedReports, processQueueNameSort, getSingleProcessQueueName, updateProcessQueueName } = require("../controller/modules/production/ProcessQueueNameController");
productionRoute.route("/processqueuenames").get(getAllProcessQueueName);
productionRoute.route("/processqueuename/new").post(addProcessQueueName);
productionRoute.route("/processqueuenamesort").post(processQueueNameSort);
productionRoute.route("/processqueuename/:id").delete(deleteProcessQueueName).get(getSingleProcessQueueName).put(updateProcessQueueName);
productionRoute.route("/processqueuenamesunassignedreports").post(getAllProcessQueueNameUnAssignedReports);
productionRoute.route("/unassignedreportlist").post(getAllUnassignedReportList);

const { addtargetpoints, deletetargetpoints,getTargetpointsFilter,targetPointsFiltered, targetPointsAllLimited,getOverallTargetpointsSort, getTargetpointslimitedAssignedbranch, targetpointsbulkdelete, getTargetpointslimited, getAlltargetpoints, getSingletargetpoints, updatetargetpoints } = require("../controller/modules/production/targetpoints");
productionRoute.route("/targetpoints").get(getAlltargetpoints);
productionRoute.route("/targetpoint/new").post(addtargetpoints);
productionRoute.route("/targetpointsbulkdelete").post(targetpointsbulkdelete);
productionRoute.route("/targetpointsort").post(getOverallTargetpointsSort);
productionRoute.route("/targetpoint/:id").delete(deletetargetpoints).get(getSingletargetpoints).put(updatetargetpoints);
productionRoute.route("/targetpointslimited").get(getTargetpointslimited);
productionRoute.route("/targetpointslimitedassignbranch").post(getTargetpointslimitedAssignedbranch);
productionRoute.route("/targetpointsalllimited").get(targetPointsAllLimited);
productionRoute.route("/targetpointsfiltered").post(targetPointsFiltered);
productionRoute.route("/targetpointsfilters").post(getTargetpointsFilter);

//ERA Amount route
const { addEraAmount, deleteEraAmount, getAllEraAmount, getAllEraAmountAssignBranch, getOverallERAAmountBySortDefault, getEraAmountFilter, geterabulkdel, getAllEraAmountLimited, getOverallERAAmountBySort, getSingleEraAmount, updateEraAmount, getAllEraAmountPaginatedTableColumnFilter } = require("../controller/modules/production/EraAmountController");
productionRoute.route("/eraamounts").get(getAllEraAmount);
productionRoute.route("/eraamount/new").post(addEraAmount);
productionRoute.route("/eraamountbulkdel").post(geterabulkdel);
productionRoute.route("/eraamount/:id").delete(deleteEraAmount).get(getSingleEraAmount).put(updateEraAmount);
productionRoute.route("/eraamountslimited").get(getAllEraAmountLimited);
productionRoute.route("/eraamountsort").post(getOverallERAAmountBySort);
productionRoute.route("/eraamountsassignbranch").post(getAllEraAmountAssignBranch);
productionRoute.route("/eraamountsfilters").post(getEraAmountFilter);
productionRoute.route("/eraamountsortdefault").post(getOverallERAAmountBySortDefault);
productionRoute.route("/eraamountspaginatedtablecolumnfilter").post(getAllEraAmountPaginatedTableColumnFilter);

const { addRevenueAmount, deleteRevenueAmount, getRevenueamountLimitedHome, getRevenueamountFilter, getRevenueamountLimited, getAllRevenueAmountAssignBranch, revenueAmountfileDel, getOverallRevenueAmountSort, getAllRevenueAmount, getSingleRevenueAmount, updateRevenueAmount } = require("../controller/modules/production/RevenueAmountController");
productionRoute.route("/revenueamounts").get(getAllRevenueAmount);
productionRoute.route("/revenueamount/new").post(addRevenueAmount);
productionRoute.route("/revenueamountbulk").post(revenueAmountfileDel);
productionRoute.route("/revenueamountlimited").get(getRevenueamountLimited);
productionRoute.route("/revenueamountsort").post(getOverallRevenueAmountSort);
productionRoute.route("/revenueamount/:id").delete(deleteRevenueAmount).get(getSingleRevenueAmount).put(updateRevenueAmount);
productionRoute.route("/revenueamountassignbranch").post(getAllRevenueAmountAssignBranch);
productionRoute.route("/revenueamountlimitedhome").post(getRevenueamountLimitedHome);
productionRoute.route("/revenueamountsfilters").post(getRevenueamountFilter);

//Process Team route
const { addProcessTeam, getFilterProcessNames, getFilterProcessLimitedCompanyBranch, deleteProcessTeam, getAllProcessTeamAssignbranch, processTeamSort, getFilterProcessNamesLimited, getAllProcessTeam, getSingleProcessTeam, updateProcessTeam } = require("../controller/modules/production/ProcessTeamController");
productionRoute.route("/processteams").get(getAllProcessTeam);
productionRoute.route("/processteam/new").post(addProcessTeam);
productionRoute.route("/processteamsort").post(processTeamSort);
productionRoute.route("/processteam_filter").post(getFilterProcessNames);
productionRoute.route("/processteamfilterlimited").get(getFilterProcessNamesLimited);
productionRoute.route("/processteam/:id").delete(deleteProcessTeam).get(getSingleProcessTeam).put(updateProcessTeam);
productionRoute.route("/processteamsassignbranch").post(getAllProcessTeamAssignbranch);
productionRoute.route("/processlimitedbycompanybranch").post(getFilterProcessLimitedCompanyBranch);

const { getAllProductionConsolidated, addProductionConsolidated, getFilterProductionConsolidated, getSingleProductionConsolidated, updateProductionConsolidated, deleteProductionConsolidated } = require("../controller/modules/production/productionConsolidated");
productionRoute.route("/productionconsolidateds").get(getAllProductionConsolidated);
productionRoute.route("/productionconsolidated/new").post(addProductionConsolidated);
productionRoute.route("/filterproductionconsolidated").post(getFilterProductionConsolidated);
productionRoute.route("/productionconsolidated/:id").delete(deleteProductionConsolidated).get(getSingleProductionConsolidated).put(updateProductionConsolidated);

const { addDayPointsUpload,getAllDayPointsUpload,dayPointDeleteByDateOrg,productionDayPointLast,getEmployeeProductionDayListLastThreeMonths,getAllDayPointByDate,checkLastDayPointOrg,dayPointDeleteByDate,getProdDateUsingDayPoints,dayPointsfilterHome,getCheckDaypointIsCreated,getDayPointIdByDate,getAllDayPointsUploadLimitedDateOnly,getSingleDayPointsUpload,getEmployeeProductionLastThreeMonths,getDocumentPrepProductionDate,checkDayPointdate,getAllDayPointsUploadLimited,updateDayPointsUpload,dayPointsMonthYearFilterNxtMonth,deleteDayPointsUpload,updateDayPointsSingleUpload,dayPointsfilter,dayPointsDatasFetch,dayPointsMonthYearFilter} = require("../controller/modules/production/dayPointsUpload");
productionRoute.route("/daypoints").get(getAllDayPointsUpload);
productionRoute.route("/checkdaypointiscreated").post(getCheckDaypointIsCreated);
 productionRoute.route('/getemployeeproductiondaylistlastthreemonths').post(getEmployeeProductionDayListLastThreeMonths);
productionRoute.route("/daypointsfilterhome").post(dayPointsfilterHome);
productionRoute.route("/checklastdaypointorg").post(checkLastDayPointOrg);
productionRoute.route("/daypointdeletebydate").post(dayPointDeleteByDate);
productionRoute.route("/getemployeeproductionlastthreemonths").post(getEmployeeProductionLastThreeMonths);
productionRoute.route("/daypoint/new").post(addDayPointsUpload);
productionRoute.route("/attendancedatefilter").post(getDocumentPrepProductionDate);
productionRoute.route("/getproddateusingdaypoints").post(getProdDateUsingDayPoints);
productionRoute.route("/daypoint/:id").delete(deleteDayPointsUpload).get(getSingleDayPointsUpload).put(updateDayPointsUpload);
productionRoute.route("/daypointsmonthwisefilter").post(dayPointsMonthYearFilter);
productionRoute.route("/singledaypoint/:id").put(updateDayPointsSingleUpload);
productionRoute.route("/checkdaypointdate").post(checkDayPointdate);
productionRoute.route("/daypointsfilter").post(dayPointsfilter);
productionRoute.route("/daypointsdatasfetch").post(dayPointsDatasFetch);
productionRoute.route("/daypointsmonthwisefilternxtmonth").post(dayPointsMonthYearFilterNxtMonth);
productionRoute.route("/daypointslimited").get(getAllDayPointsUploadLimited);
productionRoute.route("/daypointslimiteddateonly").get(getAllDayPointsUploadLimitedDateOnly);
productionRoute.route("/getdaypointidbydate").post(getDayPointIdByDate);
productionRoute.route("/getdaypointsdate").post(getAllDayPointByDate);
productionRoute.route('/productiondaypointlast').post(productionDayPointLast);
productionRoute.route('/daypointdeletebydateorg').post(dayPointDeleteByDateOrg);

const {
  addTempPointsUpload,
  getAllTempPointsUpload,
  getSingleTempPointsUpload,
  updateTempPointsUpload,
  deleteTempPointsUpload,
  updateTempPointsSingleUpload,
  tempPointsfilterHome,
  tempPointsDatasFetch
} = require("../controller/modules/production/tempPointsUpload");
productionRoute.route("/temppoints").get(getAllTempPointsUpload);
productionRoute.route("/temppoint/new").post(addTempPointsUpload);
productionRoute.route("/singletemppoint/:id").put(updateTempPointsSingleUpload);
productionRoute
  .route("/temppoint/:id")
  .delete(deleteTempPointsUpload)
  .get(getSingleTempPointsUpload)
  .put(updateTempPointsUpload);
productionRoute.route("/temppointsdatasfetch").post(tempPointsDatasFetch);
const { getAllProductionTempConsolidated, addProductionTempConsolidated, getFilterProductionTempConsolidated, getSingleProductionTempConsolidated, updateProductionTempConsolidated, deleteProductionTempConsolidated } = require("../controller/modules/production/productionTempConsolidated");
productionRoute.route("/productiontempconsolidateds").get(getAllProductionTempConsolidated);
productionRoute.route("/productiontempconsolidated/new").post(addProductionTempConsolidated);
productionRoute.route("/filterproductiontempconsolidated").post(getFilterProductionTempConsolidated);
productionRoute.route("/productiontempconsolidated/:id").delete(deleteProductionTempConsolidated).get(getSingleProductionTempConsolidated).put(updateProductionTempConsolidated);
productionRoute.route("/temppointsfilterhome").post(tempPointsfilterHome);
//  training details backend route
const { addMinimumPoints, deleteMultipleMinimumPoints, getAllMinimumPointsSort, deleteMinimumPoints, getAllMinimumPointsAcessbranch, getAllMinimumPoints, getSingleMinimumPoints, updateMinimumPoints } = require("../controller/modules/production/minimumpoints");
productionRoute.route("/minimumpointss").get(getAllMinimumPoints);
productionRoute.route("/minimumpointssort").post(getAllMinimumPointsSort);
productionRoute.route("/minimumpoints/new").post(addMinimumPoints);
productionRoute.route("/minimumpointssaccessbranch").post(getAllMinimumPointsAcessbranch);
productionRoute.route("/minimumpoints/:id").get(getSingleMinimumPoints).put(updateMinimumPoints).delete(deleteMinimumPoints);
productionRoute
  .route("/minimumpointsbulkdelete")
  .post(deleteMultipleMinimumPoints);


// Paid Status fix route
const { addPaidstatusfix,deletePaidstatusfix,getAllPaidstatusfix,getOverAllEditPayrunList,getAllPayrunCheck,getAllFilterPaidStatusfixDatas,getAllPaidstatusfixFiltered,PaidstatusfixSort,getPaidstatusfixLimited,xeroxPaidStatusFixFilter,getSinglePaidstatusfix,updatePaidstatusfix } = require("../controller/modules/production/paidstatusfix");
productionRoute.route("/paidstatusfixs").get(getAllPaidstatusfix);
productionRoute.route("/paidstatusfixsort").post(PaidstatusfixSort);
productionRoute.route("/paidstatusfix/new").post(addPaidstatusfix);
productionRoute.route("/xeroxpaidstatusfixfilter").post(xeroxPaidStatusFixFilter);
productionRoute.route("/paidstatusfixsfiltered").post(getAllPaidstatusfixFiltered);
productionRoute.route("/paidstatusfixslimited").post(getPaidstatusfixLimited);
productionRoute.route("/filterpaidstatusfixdatas").post(getAllFilterPaidStatusfixDatas);
productionRoute.route("/paidstatusfix/:id").get(getSinglePaidstatusfix).put(updatePaidstatusfix).delete(deletePaidstatusfix);
productionRoute.route("/checkpaidstatuspayrun").post(getAllPayrunCheck);
productionRoute.route("/getoveralleditpayrunlist").post(getOverAllEditPayrunList);

// Paid Date fix route
const { addPaiddatefix,deletePaiddatefix,getAllPaiddatefix,paidDateFixUpdateSingle,paidDateFixedFutureDatesOnly,getAllPaiddatefixFiltered,PaiddatefixSort,getSinglePaiddatefix,updatePaiddatefix } = require("../controller/modules/production/paiddatefix");
productionRoute.route("/paiddatefixs").get(getAllPaiddatefix);
productionRoute.route("/paiddatefix/new").post(addPaiddatefix);
productionRoute.route("/paiddatefixssort").post(PaiddatefixSort);
productionRoute.route("/paiddatefixedfuturedatesonly").get(paidDateFixedFutureDatesOnly);
productionRoute.route("/paiddatefixfitlered").post(getAllPaiddatefixFiltered);
productionRoute.route("/paiddatefixupdatesingle").post(paidDateFixUpdateSingle);
productionRoute.route("/paiddatefix/:id").get(getSinglePaiddatefix).put(updatePaiddatefix).delete(deletePaiddatefix);

// Paid Date mode route
const { addPaiddatemode,deletePaiddatemode,getOverAllEditPaiddatefix,getAllPaiddatefixCheck,getAllPaiddatemode,getXeoxFilterPaiddatemode,getSinglePaiddatemode,updatePaiddatemode } = require("../controller/modules/production/paiddatemode");
productionRoute.route("/paiddatemodes").get(getAllPaiddatemode);
productionRoute.route("/paiddatemode/new").post(addPaiddatemode);
productionRoute.route("/xeroxfilterpaiddatemodes").post(getXeoxFilterPaiddatemode);
productionRoute.route("/paiddatemode/:id").get(getSinglePaiddatemode).put(updatePaiddatemode).delete(deletePaiddatemode);
productionRoute.route("/checkpaiddatefix").post(getAllPaiddatefixCheck);
productionRoute.route("/getoveralleditpaiddatefix").post(getOverAllEditPaiddatefix);

//  production original backend route
const { addProductionOriginal,deleteProductionOriginal,productionCheckFileStatus,productionOriginalLastThree,getUniqidFromDateProdupload,getAllProductionOriginalLimitedFilter,getAllProductionOriginal,getAllProductionOriginalLimited,getAllProductionOriginalLimitedUniqid,getSingleProductionOriginal,updateProductionOriginal } = require("../controller/modules/production/productionoriginal");
productionRoute.route("/productionoriginals").get(getAllProductionOriginal);
productionRoute.route("/productionoriginal/new").post(addProductionOriginal);
productionRoute.route("/productionoriginal/:id").get(getSingleProductionOriginal).put(updateProductionOriginal).delete(deleteProductionOriginal);
productionRoute.route("/productionoriginalslimited").get(getAllProductionOriginalLimited);
productionRoute.route("/productionoriginalslimiteduniqid").get(getAllProductionOriginalLimitedUniqid);
productionRoute.route("/productionoriginalslimitedfilter").post(getAllProductionOriginalLimitedFilter);
productionRoute.route("/getuniqidfromdateprodupload").post(getUniqidFromDateProdupload);
productionRoute.route("/productionoriginallastthree").get(productionOriginalLastThree);
productionRoute.route('/productioncheckfilestatus').post(productionCheckFileStatus);

//  production upload backend route
const {getAllProductionUploadFilenames,productionUploadRawdataFilterForNewrate,getAllProductionUploadQueueMasterFilterUnAssigned, getAllProductionUploadQueueMasterFilterCount,getAllProductionTempSummaryReport,getAllProductionUploadFilterUsers, getAllProductionUploadOriginalSummaryReport,getSingleDateDataforprodDayAllBatch,getAllProductionTempSummaryReportView, undoFieldNameBulk,productionDayCategoryIdFilter,getAllProductionUploadQueueMasterFilter,getAllProductionUploadOriginalSummaryReportView, productionMismatchStatusDateFilter,getAllProductionUploadFilenamesonlyBulkDownload,bulkProductionOrgUpdateCategorySubcategory,bulkDeleteUnitRateUnallot,updateBulkDatasUnitandFlag,updateBulkDatasUnitandSection,updateBulkDatasFlagOnly,updateBulkDatasUnitOnly,getProductionUploadDatasById,undoFieldName,productionUploadCheckMismatchPresentFilter,productionUploadCheckStatus,getMismatchUpdatedList,getAllProductionUnAllotFilterViewManual,getProductionSingleDayUser,productionUploadCheckZeroMismatchPresent,getSingleDateDataforprodDay,getAllProductionUnAllotFilter,getAllProductionUnAllotFilterView,getAllProductionUploadFilter,getAllProductionReportFilter,productionUploadOverAllFetchLimited,productionUploadOverAllFetchLimitedNew,getAllProductionUploadGetdeletedatasall,getAllProductionUploadGetdeletedatas,deleteProductionUploadsMutli,getAllProductionUploadFilenamesonly, addProductionUpload,deleteProductionUpload,getAllProductionUpload,getSingleProductionUpload,updateProductionUpload,productionUploadUnitrateOverallFetchlimited } = require("../controller/modules/production/productionupload");
productionRoute.route("/productionuploadoriginalsummayreportview").post(getAllProductionUploadOriginalSummaryReportView);
productionRoute.route("/productiontempsummayreportview").post(getAllProductionTempSummaryReportView);
productionRoute.route("/productionuploadqueuemasterfilterunassigned").post(getAllProductionUploadQueueMasterFilterUnAssigned);
productionRoute.route("/productionuploads").get(getAllProductionUpload);
productionRoute.route("/productionupload/new").post(addProductionUpload);
productionRoute.route('/productionuploadrawdatafilterfornewrate').post(productionUploadRawdataFilterForNewrate);
productionRoute.route("/productionuploadqueuemasterfilter").post(getAllProductionUploadQueueMasterFilter);
productionRoute.route("/productiontempsummayreport").post(getAllProductionTempSummaryReport);
productionRoute.route("/productionupload/:id").get(getSingleProductionUpload).put(updateProductionUpload).delete(deleteProductionUpload);
productionRoute.route("/productionmismatchstatusdatefilter").post(productionMismatchStatusDateFilter);
productionRoute.route("/productionuploadfilenamelist").post(getAllProductionUploadFilenames);
productionRoute.route("/productionuploadfilenameonly").post(getAllProductionUploadFilenamesonly);
productionRoute.route("/updatefieldundonamebulk").post(undoFieldNameBulk);
productionRoute.route("/productionuploadfilenameonlybulkdownload").post(getAllProductionUploadFilenamesonlyBulkDownload);
productionRoute.route("/productiondaygetsingledatedataday").post(getSingleDateDataforprodDay);
productionRoute.route("/productionuploadgetdeletedatas").post(getAllProductionUploadGetdeletedatas);
productionRoute.route("/productionuploadgetdeletedatasall").post(getAllProductionUploadGetdeletedatasall);
productionRoute.route("/productionuploaddeletemulti").post(deleteProductionUploadsMutli);
productionRoute.route("/productionuploadoverallfetchlimited").post(productionUploadOverAllFetchLimited);
productionRoute.route("/productionuploadoverallfetchlimitednew").post(productionUploadOverAllFetchLimitedNew);
productionRoute.route("/productionuploadfilter").post(getAllProductionUploadFilter)
productionRoute.route("/productionreportfilter").post(getAllProductionReportFilter);
productionRoute.route("/getproductionsignledayuser").post(getProductionSingleDayUser);
productionRoute.route("/checkzeromismatchpresent").post(productionUploadCheckZeroMismatchPresent);
productionRoute.route("/productionuploadunitrateoverallfetchlimited").post(productionUploadUnitrateOverallFetchlimited);
productionRoute.route("/productionuploadqueuemasterfiltercount").post(getAllProductionUploadQueueMasterFilterCount);
productionRoute.route('/productiondaygetsingledatedatadayallbatch').post(getSingleDateDataforprodDayAllBatch);
productionRoute.route("/productionunallotfilter").post(getAllProductionUnAllotFilter);
productionRoute.route("/productionunallotfilterview").post(getAllProductionUnAllotFilterView);
productionRoute.route("/productionunallotfilterviewmanual").post(getAllProductionUnAllotFilterViewManual);
productionRoute.route("/getmismatchupdatedlist").post(getMismatchUpdatedList);
productionRoute.route("/updatefieldundoname").post(undoFieldName);
productionRoute.route("/productionuploadoriginalsummayreport").post(getAllProductionUploadOriginalSummaryReport);
productionRoute.route("/productionuploadcheckstatus").post(productionUploadCheckStatus);
productionRoute.route("/getmismatchdatasid").post(productionUploadCheckMismatchPresentFilter);
productionRoute.route("/getproductionuploaddatasbyid").post(getProductionUploadDatasById);
productionRoute.route("/updatedbulkdatasunitandflag").post(updateBulkDatasUnitandFlag);
productionRoute.route("/updatedbulkdatasunitonly").post(updateBulkDatasUnitOnly);
productionRoute.route("/updatedbulkdatasflagonly").post(updateBulkDatasFlagOnly);
productionRoute.route("/updatedbulkdatasunitandsection").post(updateBulkDatasUnitandSection);
productionRoute.route("/bulkdeleteunitrateunallot").post(bulkDeleteUnitRateUnallot);
productionRoute.route("/bulkproductionorgupdatecategorysubcategory").post(bulkProductionOrgUpdateCategorySubcategory);
productionRoute.route('/productionuploadfilterusers').post(getAllProductionUploadFilterUsers);
//  production temp backend route
const { addProductionTemp,deleteProductionTemp,productionTempLastThree,productionTempLastDate,getUniqidFromDateProduploadTemp,productionTempCheckFileStatus,getAllProductionTempLimitedFilter,getAllProductionTemp,getAllProductionTempLimited,getAllProductionTempLimitedUniqid,getSingleProductionTemp,updateProductionTemp, productionTempFinalVendorCreated } = require("../controller/modules/production/productiontemp");
productionRoute.route("/productionstemp").get(getAllProductionTemp);
productionRoute.route("/productiontemp/new").post(addProductionTemp);
productionRoute.route("/productiontemp/:id").get(getSingleProductionTemp).put(updateProductionTemp).delete(deleteProductionTemp);
productionRoute.route("/productiontemplimited").get(getAllProductionTempLimited);
productionRoute.route("/productiontemplimiteduniqid").get(getAllProductionTempLimitedUniqid);
productionRoute.route("/productiontemplimitedfilter").post(getAllProductionTempLimitedFilter);
productionRoute.route("/productiontempcheckfilestatus").post(productionTempCheckFileStatus);
productionRoute.route("/productiondaycategoryidfilter").post(productionDayCategoryIdFilter); 
productionRoute.route("/productiontemplastdate").post(productionTempLastDate);
productionRoute.route("/productiontemplastthree").get(productionTempLastThree);
productionRoute.route("/getuniqidfromdateproduploadtemp").post(getUniqidFromDateProduploadTemp);
productionRoute.route('/productiontempfinalvendorcreated').post(productionTempFinalVendorCreated);
//  production upload backend route
const { getAllProductionTempUploadAllFilenames,undoFieldNameBulkTemp,productionTempFlagUpdateBulkInUpload,productionMismatchStatusDateFilterTemp,getAllProductionTempUploadAllFilenamesonlyBulkDownload,getAllproductiontempFilter,getAllproductionAttendancesFilter, getSingleDateDataforprodDayTemp,getAllProductionTempReportFilter,productionDayCategoryIdFilterTemp, getProductionSingleDayUserTemp, productionUploadCheckZeroMismatchPresentTemp, undoFieldNameTemp, productionUploadCheckStatusTemp, getMismatchUpdatedListTemp, getProductionUploadDatasByIdManualTemp, bulkProductionTempUpdateCategorySubcategory, getProductionUploadDatasByIdTemp, productionTempCheckMismatchPresentFilter, bulkDeleteUnitRateUnallottemp, updateBulkDatasUnitandSectiontemp, 
  updateBulkDatasFlagOnlytemp, updateBulkDatasUnitandFlagtemp, updateBulkDatasUnitOnlytemp,getSingleDateDataforprodDayTempAllBatch, productionTempUploadOverAllFetchLimited, getAllProductionUnAllotFilterTemp, getAllProductionUnAllotFilterViewTemp, getAllProductionUnAllotFilterViewTempManual, productionTempUploadOverAllFetchLimitedNew, getAllProductionTempUploadAllGetdeletedatasall, getAllProductionTempUploadAllGetdeletedatas, deleteProductionTempUploadAllsMutli, getAllProductionTempUploadAllFilenamesonly, addProductionTempUploadAll, deleteProductionTempUploadAll, getAllProductionTempUploadAll, getSingleProductionTempUploadAll, updateProductionTempUploadAll } = require("../controller/modules/production/productiontempuploadall");
productionRoute.route("/productiontempuploadsall").get(getAllProductionTempUploadAll);
productionRoute.route("/productiontempuploadall/new").post(addProductionTempUploadAll);
productionRoute.route('/productiondaygetsingledatedatadayallbatchtemp').post(getSingleDateDataforprodDayTempAllBatch);
productionRoute.route("/productionmismatchstatusdatefiltertemp").post(productionMismatchStatusDateFilterTemp);
productionRoute.route("/productiontempreportfilter").post(getAllProductionTempReportFilter);
productionRoute.route("/productiontempfilter").post(getAllproductiontempFilter);
productionRoute.route("/productiondaycategoryidfiltertemp").post(productionDayCategoryIdFilterTemp);
productionRoute.route("/updatefieldundonamebulktemp").post(undoFieldNameBulkTemp);
productionRoute.route("/productiontempuploadall/:id").get(getSingleProductionTempUploadAll).put(updateProductionTempUploadAll).delete(deleteProductionTempUploadAll);
productionRoute.route("/productiontempuploadallfilenamelist").post(getAllProductionTempUploadAllFilenames);
productionRoute.route("/productiontempuploadallfilenameonly").post(getAllProductionTempUploadAllFilenamesonly);
productionRoute.route("/productiontempuploadallgetdeletedatas").post(getAllProductionTempUploadAllGetdeletedatas);
productionRoute.route("/productiontempuploadallgetdeletedatasall").post(getAllProductionTempUploadAllGetdeletedatasall);
productionRoute.route("/productiontempuploadalldeletemulti").post(deleteProductionTempUploadAllsMutli);
productionRoute.route("/productiontempuploadalloverallfetchlimited").post(productionTempUploadOverAllFetchLimited);
productionRoute.route("/productiontempuploadoverallfetchlimitednew").post(productionTempUploadOverAllFetchLimitedNew);
productionRoute.route("/productiontempuploadallfilenameonlybulkdownload").post(getAllProductionTempUploadAllFilenamesonlyBulkDownload);
productionRoute.route("/productiontempunallotfiltertemp").post(getAllProductionUnAllotFilterTemp);
productionRoute.route("/productiontempviewfilter").post(getAllProductionUnAllotFilterViewTemp);
productionRoute.route("/productiontempviewmanualfilter").post(getAllProductionUnAllotFilterViewTempManual);

productionRoute.route("/updatedbulkdatasunitandflagtemp").post(updateBulkDatasUnitandFlagtemp);
productionRoute.route("/updatedbulkdatasunitonlytemp").post(updateBulkDatasUnitOnlytemp);
productionRoute.route("/updatedbulkdatasflagonlytemp").post(updateBulkDatasFlagOnlytemp);
productionRoute.route("/updatedbulkdatasunitandsectiontemp").post(updateBulkDatasUnitandSectiontemp);
productionRoute.route("/bulkdeleteunitrateunallottemp").post(bulkDeleteUnitRateUnallottemp);

productionRoute.route("/getmismatchdatasidtemp").post(productionTempCheckMismatchPresentFilter);
productionRoute.route("/getproductionuploaddatasbyidtemp").post(getProductionUploadDatasByIdTemp);
productionRoute.route("/getproductionuploaddatasbyidmanualtemp").post(getProductionUploadDatasByIdManualTemp);
productionRoute.route("/bulkproductiontempupdatecategorysubcategory").post(bulkProductionTempUpdateCategorySubcategory);

productionRoute.route("/getmismatchupdatedlisttemp").post(getMismatchUpdatedListTemp);
productionRoute.route("/updatefieldundonametemp").post(undoFieldNameTemp);
productionRoute.route("/productionuploadcheckstatustemp").post(productionUploadCheckStatusTemp);
productionRoute.route("/checkzeromismatchpresenttemp").post(productionUploadCheckZeroMismatchPresentTemp);
productionRoute.route("/getproductionsignledayusertemp").post(getProductionSingleDayUserTemp);
productionRoute.route("/productiondaygetsingledatedatadaytemp").post(getSingleDateDataforprodDayTemp);
productionRoute.route("/productiontempattendancesfilter").post(getAllproductionAttendancesFilter);
productionRoute.route('/productiontempflagupdatebulkinupload').post(productionTempFlagUpdateBulkInUpload);

//  training details backend route
const { addUnitrate,deleteUnitrate,getAllUnitrateOrateSubCategory,unitrateUnallottedListFilter,productionUnitrateMrateUpdate,
getAllUnitrateOrateCategory,unitrateUnallotSingleUpdate,unitrateUnallottedList,getAllUnitrate,getSingleUnitrate,checkUnitRateForProdUpload,unitrateSort,checkUnitrateForManualCreation,getprodunitrategetmulti,getAllUnitrateProdLimited,getProductionUnitrateProUploadLimited,updateUnitrate,unitrateFilterCategoriesLimited,unitrateFilterCategoryLimited,unitrateFilterLimited } = require("../controller/modules/production/productionunitrate");
productionRoute.route("/unitsrate").get(getAllUnitrate);
productionRoute.route("/unitrate/new").post(addUnitrate);
productionRoute.route("/unitsratesort").post(unitrateSort);
productionRoute.route("/unitrateunallotsingleupdate").post(unitrateUnallotSingleUpdate);
productionRoute.route("/unitrate/:id").get(getSingleUnitrate).put(updateUnitrate).delete(deleteUnitrate);
productionRoute.route("/unitratefilterlimited").post(unitrateFilterLimited);
productionRoute.route("/getprodunitrategetmulti").post(getprodunitrategetmulti);
productionRoute.route("/checkunitrateformanualcreation").post(checkUnitrateForManualCreation);
productionRoute.route("/unitratefiltercategorylimited").post(unitrateFilterCategoryLimited);
productionRoute.route("/unitratefiltercategorieslimited").post(unitrateFilterCategoriesLimited);
productionRoute.route("/unitrateprodlimited").get(getAllUnitrateProdLimited);
productionRoute.route("/productionunitrateproduploadlimited").get(getProductionUnitrateProUploadLimited);
productionRoute.route("/checkunitrateforprodupload").post(checkUnitRateForProdUpload);
productionRoute.route("/unitrateunallottedlist").get(unitrateUnallottedList);
productionRoute.route("/unitrateunallottedlistfilter").post(unitrateUnallottedListFilter);
productionRoute.route("/unitsrateoratesubcategory").post(getAllUnitrateOrateSubCategory);
productionRoute.route("/unitrateoratecategory").post(getAllUnitrateOrateCategory);
productionRoute.route('/productionunitartemrateupdate').post(productionUnitrateMrateUpdate);

//  training details backend route
const { addCategoryprod,deleteCategoryprod,categoryProdLimitedProductionQueueType,getDefaultMrateCategory,categoryDupeCheck,blukMrateKeywordsUpdate,
getAllCategoryprodLimitedProject,categoryProdLimitedUnallot,categoryProdLimitedReportsMulti,categoryOverAllNonLinkBulkDelete,categoryProdOverAllEditBulkUpdate,categoryOverAllCheckEdit,categoryOverAllCheckDeleteBulk,categoryOverAllCheckDelete,categoryProdLimitedTempFlagCalc,categoryLimitedNameonly,categoryProdLimitedOrgFlagCalc,getAllCategoryprodLimitedTemp,fetchEnbalePagesBasedProjCateSub,getAllCategoryprodLimitedOriginal,categoryLimitedKeyword,getAllCategoryprodLimited,checkCategoryForProdUpload,CategoryprodSort,getAllCategoryprod,getSingleCategoryprod,updateCategoryprod } = require("../controller/modules/production/categoryprod");
productionRoute.route("/categoriesprod").get(getAllCategoryprod);
productionRoute.route("/categoryprod/new").post(addCategoryprod);
productionRoute.route("/categoryprodlimited").get(getAllCategoryprodLimited);
productionRoute.route("/categoryprodlimitedunallot").post(categoryProdLimitedUnallot);
productionRoute.route("/categoryprodlimitedorgflagcalc").get(categoryProdLimitedOrgFlagCalc);
productionRoute.route("/categoriesprodsort").post(CategoryprodSort);
productionRoute.route("/categoryprodlimitedoriginal").get(getAllCategoryprodLimitedOriginal);
productionRoute.route("/categoryprodlimitedtemp").get(getAllCategoryprodLimitedTemp);
productionRoute.route("/categoryprod/:id").get(getSingleCategoryprod).put(updateCategoryprod).delete(deleteCategoryprod);
productionRoute.route("/checkcategoryforprodupload").post(checkCategoryForProdUpload);
productionRoute.route("/categorylimitedkeyword").get(categoryLimitedKeyword);
productionRoute.route("/fetchenbalepagesbasedprojcatesub").post(fetchEnbalePagesBasedProjCateSub);
productionRoute.route("/categorylimitednameonly").post(categoryLimitedNameonly);
productionRoute.route("/categoryprodlimitedtempflagcalc").get(categoryProdLimitedTempFlagCalc);
productionRoute.route("/categoryoverallcheckdelete").post(categoryOverAllCheckDelete);
productionRoute.route("/categoryoverallcheckdeletebulk").post(categoryOverAllCheckDeleteBulk);
productionRoute.route("/categoryprodoveralledit").post(categoryOverAllCheckEdit);
productionRoute.route("/categoryprodoveralleditbulkupdate").post(categoryProdOverAllEditBulkUpdate);
productionRoute.route("/categoryoverallnonlinkbulkdelete").post(categoryOverAllNonLinkBulkDelete);
productionRoute.route("/categoryprodlimitedreportsmultiselect").post(categoryProdLimitedReportsMulti);
productionRoute.route("/categoryprodlimitedproductionqueuetypemaster").post(categoryProdLimitedProductionQueueType);
productionRoute.route('/getallcategorprodlimitedproject').get(getAllCategoryprodLimitedProject);
productionRoute.route('/getdefaultmratecategory').post(getDefaultMrateCategory);
productionRoute.route('/categorydupecheck').post(categoryDupeCheck);
productionRoute.route('/blukmratekeywordsupdate').post(blukMrateKeywordsUpdate);
//  training details backend route
const { addSubCategoryprod,deleteSubCategoryprod,subCategoryProdLimitedUnallot,subCategoryProdLimitedReportsMulti,subCategoryOverAllNonLinkBulkDelete,subCategoryProdOverAllEditBulkUpdate,subCategoryOverAllCheckEdit,subCategoryOverAllCheckDeleteBulk,subCategoryOverAllCheckDelete,checkSubCategoryForProdUpload,subcategoryAllLimitedByProjCate,getListSubcategoryProdLimitedReport,getListSubcaegoryprodLimited,getListSubcaegoryprodLimitedPagination,checkSubCategoryForManualCreation,getUnitrateAllSubCategoryprod,getAllSubCategoryprod,getAllSubCategoryprodLimited,getSingleSubCategoryprod,updateSubCategoryprod } = require("../controller/modules/production/subcategoryprod");
productionRoute.route("/subcategoriesprod").get(getAllSubCategoryprod);
productionRoute.route("/subcategoryprod/new").post(addSubCategoryprod);
productionRoute.route("/subcategoryprodlimitedunallot").post(subCategoryProdLimitedUnallot);
productionRoute.route("/unitratecatsubprod").post(getUnitrateAllSubCategoryprod);
productionRoute.route("/subcategoryalllimitedbyprojcate").post(subcategoryAllLimitedByProjCate);
productionRoute.route("/subcategoryprod/:id").get(getSingleSubCategoryprod).put(updateSubCategoryprod).delete(deleteSubCategoryprod);
productionRoute.route("/subcategoryprodlimited").get(getAllSubCategoryprodLimited);
productionRoute.route("/getlistsubcategoryprodlimited").get(getListSubcaegoryprodLimited);
productionRoute.route("/checksubcategoryformanualcreation").post(checkSubCategoryForManualCreation);
productionRoute.route("/getlistsubcategoryprodlimitedpagination").post(getListSubcaegoryprodLimitedPagination);
productionRoute.route("/checksubcategoryforprodupload").post(checkSubCategoryForProdUpload);
productionRoute.route("/getlistsubcategoryprodlimitedreport").get(getListSubcategoryProdLimitedReport);
productionRoute.route("/subcategoryoverallcheckdelete").post(subCategoryOverAllCheckDelete);
productionRoute.route("/subcategoryoverallcheckdeletebulk").post(subCategoryOverAllCheckDeleteBulk);
productionRoute.route("/subcategoryprodoveralledit").post(subCategoryOverAllCheckEdit);
productionRoute.route("/subcategoryprodoveralleditbulkupdate").post(subCategoryProdOverAllEditBulkUpdate);
productionRoute.route("/subcategoryoverallnonlinkbulkdelete").post(subCategoryOverAllNonLinkBulkDelete);
productionRoute.route("/subcategoryprodlimitedreportsmultiselect").post(subCategoryProdLimitedReportsMulti);


const {
    addCategoryprocessmap,
    deleteCategoryprocessmap,
    getAllCategoryprocessmap,
    getSingleCategoryprocessmap,
    updateCategoryprocessmap,
    deleteMultipleCategoryprocessmap,
    categoryprocessmapSort,
    getAllcategoryprocessmapslimited,getAllCategoryprocessmapAssignBranch
  } = require("../controller/modules/production/categoryprocessmap");
  productionRoute.route("/categoryprocessmaps").get(getAllCategoryprocessmap);
  productionRoute.route("/categoryprocessmapssort").post(categoryprocessmapSort);
  productionRoute.route("/categoryprocessmap/new").post(addCategoryprocessmap);
  productionRoute.route("/categoryprocessmapsassignbranch").post(getAllCategoryprocessmapAssignBranch);
  productionRoute.route("/categoryprocessmapslimited").get(getAllcategoryprocessmapslimited);
  productionRoute
    .route("/categoryprocessmapmutidelete")
    .post(deleteMultipleCategoryprocessmap);
  productionRoute
    .route("/categoryprocessmap/:id")
    .get(getSingleCategoryprocessmap)
    .put(updateCategoryprocessmap)
    .delete(deleteCategoryprocessmap);

    const { getAllManagecategory, getSingleManagecategory, ManagecategorySort,updateManagecategory, addManagecategory, deleteManagecategory } = require("../controller/modules/production/managecategory");
    productionRoute.route("/managecategorys").get(getAllManagecategory);
    productionRoute.route("/managecategoryssort").post(ManagecategorySort);
    productionRoute.route("/managecategory/new").post(addManagecategory);
    productionRoute.route("/managecategory/:id").delete(deleteManagecategory).get(getSingleManagecategory).put(updateManagecategory);
  
    //Production process queue
const { getAllProductionProcessQueue, addProductionProcessQueue, productionProcessQueueLimitedByProject, getSingleProductionProcessQueue, updateProductionProcessQueue, deleteProductionProcessQueue } = require("../controller/modules/penalty/productionprocessqueue");
productionRoute.route("/productionprocessqueue").get(getAllProductionProcessQueue);
productionRoute.route("/productionprocessqueue/new").post(addProductionProcessQueue);
productionRoute.route("/productionprocessqueuelimitedbyproject").post(productionProcessQueueLimitedByProject);
productionRoute.route("/productionprocessqueue/:id").get(getSingleProductionProcessQueue).put(updateProductionProcessQueue).delete(deleteProductionProcessQueue);

//for penalty error upload
const { getAllPenaltyErrorUpload, addPenaltyErrorUpload, getAllPenaltyErrorUploadFilterStatus, getAllPenaltyErrorUploadFilter, getSinglePenaltyErrorUpload, updatePenaltyErrorUpload, deletePenaltyErrorUpload } = require("../controller/modules/penalty/errortype");
productionRoute.route("/errortypes").get(getAllPenaltyErrorUpload);
productionRoute.route("/errortype/new").post(addPenaltyErrorUpload);
productionRoute.route("/errortype/:id").get(getSinglePenaltyErrorUpload).put(updatePenaltyErrorUpload).delete(deletePenaltyErrorUpload);
productionRoute.route("/errortypefilter").post(getAllPenaltyErrorUploadFilter);
productionRoute.route("/errortypefilterstatus").post(getAllPenaltyErrorUploadFilterStatus);


const { addpayruncontrol, deletepayruncontrol, getAllpayruncontrol,getUserNamesbasedOnStatusPayRun,getFilterPayRunreportData ,getFilterPayRunEmployeenamesData,getAllpayruncontrolByAssignBranch,getAllpayruncontrolLimited, getSinglepayruncontrol, updatepayruncontrol } = require("../controller/modules/production/payruncontrol");
productionRoute.route("/payruncontrols").get(getAllpayruncontrol);
productionRoute.route("/payruncontrol/new").post(addpayruncontrol);
productionRoute.route("/employeenamesstatuswisepayrun").post(getUserNamesbasedOnStatusPayRun);
productionRoute.route("/filterpayrunemployeenames").post(getFilterPayRunEmployeenamesData);
productionRoute.route("/filterpayrunreportdata").post(getFilterPayRunreportData);
productionRoute.route("/payruncontrolslimited").get(getAllpayruncontrolLimited);
productionRoute.route("/payruncontrol/:id").delete(deletepayruncontrol).get(getSinglepayruncontrol).put(updatepayruncontrol);
productionRoute.route("/payruncontrolsbyassignbranch").post(getAllpayruncontrolByAssignBranch);




//Experience BAsewavier master
const { getAllExperiencebase, addExperiencebase, getSingleExperiencebase, updateExperiencebase, deleteExperiencebase } = require("../controller/modules/production/experiencebasewavier");
productionRoute.route("/expericencebases").get(getAllExperiencebase);
productionRoute.route("/expericencebase/new").post(addExperiencebase);
productionRoute.route("/expericencebase/:id").get(getSingleExperiencebase).put(updateExperiencebase).delete(deleteExperiencebase);

//Master Filed name
const { getAllMasterfieldname, addMasterfieldname, fetchFieldNameByProcess,  getSingleMasterfieldname, updateMasterfieldname, deleteMasterfieldname } = require("../controller/modules/production/masterfieldname");
productionRoute.route("/masterfieldnames").get(getAllMasterfieldname);
productionRoute.route("/masterfieldname/new").post(addMasterfieldname);
productionRoute.route("/fetchfieldnamebyprocess").post(fetchFieldNameByProcess);
productionRoute.route("/masterfieldname/:id").get(getSingleMasterfieldname).put(updateMasterfieldname).delete(deleteMasterfieldname);

//Other Penaltyname
const { getAllOtherpenaltycontrol, addOtherpenaltycontrol, getSingleOtherpenaltycontrol, updateOtherpenaltycontrol, deleteOtherpenaltycontrol } = require("../controller/modules/production/otherpenaltycontrol");
productionRoute.route("/otherpenaltycontrols").get(getAllOtherpenaltycontrol);
productionRoute.route("/otherpenaltycontrol/new").post(addOtherpenaltycontrol);
productionRoute.route("/otherpenaltycontrol/:id").get(getSingleOtherpenaltycontrol).put(updateOtherpenaltycontrol).delete(deleteOtherpenaltycontrol);

//for error reason
const { getAllPenaltyErrorReason, addPenaltyErrorReason,getAllPenaltyErrorReasonFilter, getSinglePenaltyErrorReason, updatePenaltyErrorReason, deletePenaltyErrorReason } = require("../controller/modules/production/errorreason");
productionRoute.route("/penaltyerrorreason").get(getAllPenaltyErrorReason);
productionRoute.route("/penaltyerrorreason/new").post(addPenaltyErrorReason);
productionRoute.route("/penaltyerrorreasonfilter").post(getAllPenaltyErrorReasonFilter);
productionRoute.route("/penaltyerrorreason/:id").get(getSinglePenaltyErrorReason).put(updatePenaltyErrorReason).delete(deletePenaltyErrorReason);

//for error control
const { getAllPenaltyErrorControl, addPenaltyErrorControl, getSinglePenaltyErrorControl, updatePenaltyErrorControl, deletePenaltyErrorControl } = require("../controller/modules/production/errorcontrol");

productionRoute.route("/penaltyerrorcontrol").get(getAllPenaltyErrorControl);
productionRoute.route("/penaltyerrorcontrol/new").post(addPenaltyErrorControl);
productionRoute.route("/penaltyerrorcontrol/:id").get(getSinglePenaltyErrorControl).put(updatePenaltyErrorControl).delete(deletePenaltyErrorControl);


const { getAllManageidlework, getSingleManageidlework, updateManageidlework, addManageidlework, deleteManageidlework } = require("../controller/modules/production/idlework");
productionRoute.route("/manageidleworks").get(getAllManageidlework);
productionRoute.route("/manageidlework/new").post(addManageidlework);
productionRoute.route("/manageidlework/:id").delete(deleteManageidlework).get(getSingleManageidlework).put(updateManageidlework);


const { getAllNonProductionUnitRate, addNonProductionUnitRate, getSingleNonProductionUnitRate, updateNonProductionUnitRate, deleteNonProductionUnitRate } = require("../controller/modules/production/nonproductionunitrate");
productionRoute.route("/nonproductionunitrate").get(getAllNonProductionUnitRate);
productionRoute.route("/nonproductionunitrate/new").post(addNonProductionUnitRate);
productionRoute.route("/nonproductionunitrate/:id").get(getSingleNonProductionUnitRate).put(updateNonProductionUnitRate).delete(deleteNonProductionUnitRate);

//for category and subcategory
const { getAllCategoryAndSubcategory, addCategoryAndSubcategory, getSingleCategoryAndSubcategory, updateCategoryAndSubcategory, deleteCategoryAndSubcategory } = require("../controller/modules/production/categoryandsubcategory");
productionRoute.route("/categoryandsubcategory").get(getAllCategoryAndSubcategory);
productionRoute.route("/categoryandsubcategory/new").post(addCategoryAndSubcategory);
productionRoute.route("/categoryandsubcategory/:id").get(getSingleCategoryAndSubcategory).put(updateCategoryAndSubcategory).delete(deleteCategoryAndSubcategory);



const { getAllManageCategoryPercentage, addManageCategoryPercentage, getSingleManageCategoryPercentage, updateManageCategoryPercentage, deleteManageCategoryPercentage } = require("../controller/modules/production/categorypercentage");
productionRoute.route("/managecategorypercentage").get(getAllManageCategoryPercentage);
productionRoute.route("/managecategorypercentage/new").post(addManageCategoryPercentage);
productionRoute.route("/managecategorypercentage/:id").get(getSingleManageCategoryPercentage).put(updateManageCategoryPercentage).delete(deleteManageCategoryPercentage);

//for production client rate
const { getAllProductionClientRate, addProductionClientRate, getSingleProductionClientRate, deleteProductionClientRate, updateProductionClientRate } = require("../controller/modules/production/productionclientrate");
productionRoute.route("/productionclientrate").get(getAllProductionClientRate);
productionRoute.route("/productionclientrate/new").post(addProductionClientRate);
productionRoute.route("/productionclientrate/:id").get(getSingleProductionClientRate).put(updateProductionClientRate).delete(deleteProductionClientRate);


const { getAllNonproductionunitallot, deleteNonproductionunitallot, updateNonproductionunitallot, getSingleNonproductionunitallot, addNonproductionunitallot } = require("../controller/modules/production/nonproduction/NonproductionunitallotController");
productionRoute.route("/nonproductionunitallot").get(getAllNonproductionunitallot);
productionRoute.route("/nonproductionunitallot/new").post(addNonproductionunitallot);
productionRoute.route("/nonproductionunitallot/:id").get(getSingleNonproductionunitallot).put(updateNonproductionunitallot).delete(deleteNonproductionunitallot);

const {addPenaltyClientAmountUpload, updatePenaltyClientAmountUpload, deletePenaltyClientAmountUpload, getAllPenaltyClientAmountUpload, getSinglePenaltyClientAmountUpload, updatePenaltyClientAmountSingleUpload} = require("../controller/modules/production/penaltyclienterrorupload");
productionRoute.route("/penaltyclientamounts").get(getAllPenaltyClientAmountUpload);
productionRoute.route("/penaltyclientamount/new").post(addPenaltyClientAmountUpload);
productionRoute
  .route("/penaltyclientamount/:id")
  .delete(deletePenaltyClientAmountUpload)
  .get(getSinglePenaltyClientAmountUpload)
  .put(updatePenaltyClientAmountUpload);
productionRoute.route("/singlepenaltyclientamount/:id").put(updatePenaltyClientAmountSingleUpload);

// Penalty day upload
const {  addPenaltydayupload, getAllPenaltydayupload, getAllPenaltydayuploadFilter, getAllPenaltydayuploadFilterList, getPenaltydayuploadLimited, getSinglePenaltydayupload, updatePenaltydayupload,deletePenaltydayupload, updatePenaltydaySingleupload,} = require("../controller/modules/penalty/penaltydayupload");
productionRoute.route("/penaltydayuploads").post(getAllPenaltydayupload);
productionRoute.route("/penaltydayupload/new").post(addPenaltydayupload);
productionRoute.route("/penaltydayupload/:id").delete(deletePenaltydayupload).get(getSinglePenaltydayupload).put(updatePenaltydayupload);
productionRoute.route("/singlepenaltydayupload/:id").put(updatePenaltydaySingleupload);
productionRoute.route("/penaltydayuploadsfiltered").post(getPenaltydayuploadLimited);
productionRoute.route("/penaltydayuploadsfilterlist").post(getAllPenaltydayuploadFilterList);
productionRoute.route("/penaltydayuploadsfilter").post(getAllPenaltydayuploadFilter);


// manage penalty month 
const { getAllManagepenaltymonth, addManagepenaltymonth, getFilterManagepenaltymonth, getSingleManagepenaltymonth, updateManagepenaltymonth, deleteManagepenaltymonth } = require("../controller/modules/penalty/penaltymonth");
productionRoute.route("/managepenaltymonths").get(getAllManagepenaltymonth);
productionRoute.route("/managepenaltymonth/new").post(addManagepenaltymonth);
productionRoute.route("/filtermanagepenaltymonth").post(getFilterManagepenaltymonth);
productionRoute.route("/managepenaltymonth/:id").delete(deleteManagepenaltymonth).get(getSingleManagepenaltymonth).put(updateManagepenaltymonth);

//Manage shortage master controller
const { addManageshortagemaster, deleteManageshortagemaster, getAllManageshortagemaster,ManageshortagemasterSOrt, getSingleManageshortagemaster, updateManageshortagemaster } = require("../controller/modules/production/shortagemaster");
productionRoute.route("/manageshortagemasters").get(getAllManageshortagemaster);
productionRoute.route("/manageshortagemaster/new").post(addManageshortagemaster);
productionRoute.route("/manageshortagemasterssort").post(ManageshortagemasterSOrt);
productionRoute.route("/manageshortagemaster/:id").delete(deleteManageshortagemaster).get(getSingleManageshortagemaster).put(updateManageshortagemaster);


const {
  addPenaltyAmountConsolidated,
  deletePenaltyAmountConsolidated,
  getAllPenaltyAmountConsolidated,
  getSinglePenaltyAmountConsolidated,
  updatePenaltyAmountConsolidated,
  getFilterPenaltyAmountConsolidated,
} = require("../controller/modules/penalty/penaltyamountconsolidate");
productionRoute
  .route("/allpenaltyamountconsolidate")
  .get(getAllPenaltyAmountConsolidated);
productionRoute
  .route("/penaltyamountconsolidate/new")
  .post(addPenaltyAmountConsolidated);
productionRoute
  .route("/filterpenaltyamountconsolidated")
  .post(getFilterPenaltyAmountConsolidated);
productionRoute
  .route("/penaltyamountconsolidate/:id")
  .delete(deletePenaltyAmountConsolidated)
  .get(getSinglePenaltyAmountConsolidated)
  .put(updatePenaltyAmountConsolidated);

  //  production individual backend route
const {
  getAllProductionHierarchyList, getAllProductionHierarchyListHome, getAllPendingIndividualLimited,
  getAllOnprogressIndividualLimited, getAllCompleteIndividualLimited, ProductionIndividualSort,
  ManualStatusviceIndividualSort, ManualstatusviceIndividualExcelOverall, getAllManualUploadFilter,
  getUserIdManual, getAllProductionHierarchyListanother, getAllProductionLoginAllotHierarchyList,
  ProductionIndividualExcelOverall, getAllProductionIndividualLimited, getAllProductionIndividualDateFilter,
  addProductionIndividual, deleteProductionIndividual, getAllProductionIndividual,getAllProductionIndividualListFilter,
  getSingleProductionIndividual, updateProductionIndividual, productionIndividualCreateBulk,
  productionIndividualDupeCheck, getAllProductionIndividualLimitedExcel,productionManaulDupeCheck, getAllProductionIndividualLimitedOverallExcel, getAllProductionIndividualManualOverallExcel
} = require("../controller/modules/production/productionindividual");
productionRoute.route("/productionindividuals").get(getAllProductionIndividual);
productionRoute.route("/productionindividual/new").post(addProductionIndividual);
productionRoute.route("/productionindividualdupecheck").post(productionIndividualDupeCheck);
productionRoute.route("/productionindividualcreatebulk").post(productionIndividualCreateBulk);
productionRoute.route("/productionhierarchyfilterhome").post(getAllProductionHierarchyListHome);
productionRoute.route("/productionindividualexceloverall").post(ProductionIndividualExcelOverall);
productionRoute.route("/manualstatusviceindividualsort").post(ManualStatusviceIndividualSort);
productionRoute.route("/productionloginallothierarchyfilter").post(getAllProductionLoginAllotHierarchyList);
productionRoute.route("/manualstatusindividualexceloverall").post(ManualstatusviceIndividualExcelOverall);
productionRoute.route("/productionindividualsort").post(ProductionIndividualSort);
productionRoute.route("/productionindividuallimited").post(getAllProductionIndividualLimited);
productionRoute.route("/productionindividualdatefilter").post(getAllProductionIndividualDateFilter);
productionRoute.route("/onprogressindividuallimited").post(getAllOnprogressIndividualLimited);
productionRoute.route("/pendingindividuallimited").post(getAllPendingIndividualLimited);
productionRoute.route("/complatedindividuallimited").post(getAllCompleteIndividualLimited);
productionRoute.route("/productionindividual/:id").get(getSingleProductionIndividual).put(updateProductionIndividual).delete(deleteProductionIndividual);
productionRoute.route("/productionhierarchyfilter").post(getAllProductionHierarchyList);
productionRoute.route("/productionhierarchyfilteranother").post(getAllProductionHierarchyListanother);
productionRoute.route("/productionmanualuploadfilter").post(getAllManualUploadFilter)
productionRoute.route("/myproductionindividual").post(getUserIdManual);
productionRoute.route("/productionindividualexcel").post(getAllProductionIndividualLimitedExcel);
productionRoute.route("/productionindividualoveallexcel").get(getAllProductionIndividualLimitedOverallExcel);
productionRoute.route("/productionindividualoveallexcelpending").post(getAllProductionIndividualManualOverallExcel);
productionRoute.route("/productionindividuallistfilter").post(getAllProductionIndividualListFilter);
productionRoute.route("/productionmanualentrydupecheck").post(productionManaulDupeCheck);
// penalty client error
const { getAllPenaltyClientError, addPenaltyClientError, deletePenaltyClientError, getSinglePenaltyClientError, updatePenaltyClientError, getAllPenaltyClientErrorForDateFilterWithAsgnBranch, getAllPenaltyClientErrorForDateFilter } = require("../controller/modules/penalty/penaltyclienterror");
productionRoute.route("/penaltyclienterror").post(getAllPenaltyClientError);
productionRoute.route("/penaltyclienterror/new").post(addPenaltyClientError);
productionRoute.route("/penaltyclienterror/:id").delete(deletePenaltyClientError).get(getSinglePenaltyClientError).put(updatePenaltyClientError);
productionRoute.route("/penaltyclienterrordatefilterwithasgnbranch").post(getAllPenaltyClientErrorForDateFilterWithAsgnBranch);
productionRoute.route("/penaltyclienterrordatefilter").post(getAllPenaltyClientErrorForDateFilter);

const { getAllAcpointCalculation, acpointCalculationSort, updateAcpointCalculation, acpointCalculationAssignBranch, deleteAcpointCalculation, getSingleAcpointCalculation, addAcpointCalculation } = require("../controller/modules/production/acpointscalculation");
productionRoute.route("/acpointcalculation").get(getAllAcpointCalculation);
productionRoute.route("/acpointcalculationsort").post(acpointCalculationSort);
productionRoute.route("/acpointcalculation/new").post(addAcpointCalculation);
productionRoute.route("/acpointcalculation/:id").get(getSingleAcpointCalculation).put(updateAcpointCalculation).delete(deleteAcpointCalculation);
productionRoute.route("/acpointcalculationassignbranch").post(acpointCalculationAssignBranch);

//CategoryDateChange Route
const { getAllCategorydatechange, updateCategorydatechange, categorydatechangeSort,addCategorydatechange, deleteCategorydatechange, getSingleCategorydatechange} = require("../controller/modules/production/categorydatechange");
productionRoute.route("/categorydatechange").get(getAllCategorydatechange);
productionRoute.route("/categorydatechange/new").post(addCategorydatechange);
productionRoute.route("/categorydatechangesort").post(categorydatechangeSort);
productionRoute.route("/categorydatechange/:id").get(getSingleCategorydatechange).put(updateCategorydatechange).delete(deleteCategorydatechange);

//Penaltyerroruploadpoints Route
const { getAllPenaltyerroruploadpoints,PenaltyErrorUploadSort, updatePenaltyerroruploadpoints,getAllPenaltyerroruploadpointsProjectBasedFilter, getAllPenaltyerroruploadpointsDateFilter, deletePenaltyerroruploadpoints,deleteMultiplePenaltyErrorUpload, getSinglePenaltyerroruploadpoints, addPenaltyerroruploadpoints } = require("../controller/modules/penalty/penaltyerrorupload");
productionRoute.route("/penaltyerroruploads").get(getAllPenaltyerroruploadpoints);
productionRoute.route("/penaltyerroruploads/new").post(addPenaltyerroruploadpoints);
productionRoute.route("/multiplepenaltyerroruploads").post(deleteMultiplePenaltyErrorUpload);
productionRoute.route("/penaltyerroruploadssort").post(PenaltyErrorUploadSort);
productionRoute.route("/penaltyerroruploads/:id").get(getSinglePenaltyerroruploadpoints).put(updatePenaltyerroruploadpoints).delete(deletePenaltyerroruploadpoints);
productionRoute.route("/penaltyerroruploadsdatefilter").post(getAllPenaltyerroruploadpointsDateFilter);
productionRoute.route("/penaltyerroruploadsprojectbasedfilter").post(getAllPenaltyerroruploadpointsProjectBasedFilter);
//Wavier Percentage Route
const { getAllWavierpercentage, updateWavierpercentage, addWavierpercentage, getSingleWavierpercentage, deleteWavierpercentage } = require("../controller/modules/penalty/wavierpercentage");
productionRoute.route("/wavierpercentage").get(getAllWavierpercentage);
productionRoute.route("/wavierpercentage/new").post(addWavierpercentage);
productionRoute.route("/wavierpercentage/:id").get(getSingleWavierpercentage).put(updateWavierpercentage).delete(deleteWavierpercentage);

//for non production 
//for non production 
const { getAllNonproduction, deleteNonproduction, getSingleNonproduction,getAllNonproductionListFilter, updateNonproduction, addNonproduction, getAllNonProductionFilter } = require("../controller/modules/production/nonproduction/nonproduction");
productionRoute.route("/nonproduction").get(getAllNonproduction);
productionRoute.route("/nonproduction/new").post(addNonproduction);
productionRoute.route("/nonproductionfilterlist").post(getAllNonproductionListFilter);
productionRoute.route("/nonproductionfilter").post(getAllNonProductionFilter);
productionRoute.route("/nonproduction/:id").get(getSingleNonproduction).put(updateNonproduction).delete(deleteNonproduction);

const { getOriginalMismatchFilteredData, getUpdateFlagCount, getOriginalUnmatchedData, getOriginalUnmatchedDataCountCheck,getTempMismatchFilteredData, getUpdateTempFlagCount, getTempUnmatchedData } = require("../controller/modules/production/originalmismatchfiltercontroller");
productionRoute.route("/originalmismatchfilter").post(getOriginalMismatchFilteredData);
productionRoute.route("/originalmismatchfilter/updateflagcount").put(getUpdateFlagCount);
productionRoute.route("/originalunmatchfilter").post(getOriginalUnmatchedData);

productionRoute.route("/tempmismatchfilter").post(getTempMismatchFilteredData);
productionRoute.route("/tempmismatchfilter/updateflagcount").put(getUpdateTempFlagCount);
productionRoute.route("/tempunmatchfilter").post(getTempUnmatchedData);
productionRoute.route("/originalunmatchfiltercountcheck").post(getOriginalUnmatchedDataCountCheck);

const { addProductionDay, deleteProductionDay,productionDaysCheckAfterDaypointCreate,checkIsProdDayCreated,prodDayDeleteByDateOrg, getAllProductionDay,getAllProductionDayUniqid, productionDayLastDate,getSingleProductionDay, updateProductionDay } = require("../controller/modules/production/productionday");
productionRoute.route("/productiondays").get(getAllProductionDay);
productionRoute.route("/productionday/new").post(addProductionDay);
productionRoute.route("/productionday/:id").get(getSingleProductionDay).put(updateProductionDay).delete(deleteProductionDay);
productionRoute.route("/productiondaysuniqid").get(getAllProductionDayUniqid);
productionRoute.route("/proddaydeletebydateorg").post(prodDayDeleteByDateOrg);
productionRoute.route("/checkisproddaycreated").post(checkIsProdDayCreated);
productionRoute.route("/productiondayscheckafterdaypointcreate").get(productionDaysCheckAfterDaypointCreate);
productionRoute.route('/productiondaylastdate').post(productionDayLastDate);


//  PROD Day list backend route
const { addProductionDayList, deleteProductionDayList, getUserWeekOffDays,getUserWeekOffDaysEmployeePoints,getUserWeekOffDaysAttendance, getAllProductionsByUserForCurrMonthView, getAllProductionsByUserForCurrMonth, deleteProductionDayByUnid, getEmpProductionDayLastThreeMonths, getAllProductionDayListByDate, productionDayListGetDeleteLimited, productionDayListGetViewLimited, getAllProductionDayList, getAllProductionDayListUniqid, getSingleProductionDayList, updateProductionDayList } = require("../controller/modules/production/productiondaylist");
productionRoute.route("/productiondaylists").get(getAllProductionDayList);
productionRoute.route("/productiondaylist/new").post(addProductionDayList);
productionRoute.route("/productiondaylist/:id").get(getSingleProductionDayList).put(updateProductionDayList).delete(deleteProductionDayList);
productionRoute.route("/productiondaylistgetdeletelimited").post(productionDayListGetDeleteLimited);
productionRoute.route("/productiondaylistgetviewlimited").post(productionDayListGetViewLimited);
productionRoute.route("/productiondaylistdeleteuniqud").post(deleteProductionDayByUnid);
productionRoute.route("/productiondaylistsgetbydate").post(getAllProductionDayListByDate);
productionRoute.route("/getempproductiondaylastthreemonths").post(getEmpProductionDayLastThreeMonths);
productionRoute.route("/getuserweekoffdays").post(getUserWeekOffDays);
productionRoute.route("/getallproductionsbyuserforcurrmonth").post(getAllProductionsByUserForCurrMonth);
productionRoute.route("/getallproductionsbyuserforcurrmonthview").post(getAllProductionsByUserForCurrMonthView);
productionRoute.route("/getuserweekoffdaysattendance").post(getUserWeekOffDaysAttendance);
productionRoute.route('/getuserweekoffdaysemployeepoints').post(getUserWeekOffDaysEmployeePoints);
//  training details backend route
const { addProductionDayTemp, deleteProductionDayTemp,productionDayTempLastDate,productionDaysCheckAfterDaypointCreateTemp, checkIsProdDayCreatedTempDayCreate,prodDayDeleteByDate,getAllProductionDayTemp, checkIsProdDayCreatedTemp, getAllProductionDayUniqidTemp, getSingleProductionDayTemp, updateProductionDayTemp } = require("../controller/modules/production/productiondaytemp");
productionRoute.route("/productiondaystemp").get(getAllProductionDayTemp);
productionRoute.route("/productiondaytemp/new").post(addProductionDayTemp);
productionRoute.route("/productiondayscheckafterdaypointcreatetemp").get(productionDaysCheckAfterDaypointCreateTemp);
productionRoute.route("/proddaydeletebydate").post(prodDayDeleteByDate);
productionRoute.route("/productiondaytemplastdate").post(productionDayTempLastDate);
productionRoute.route("/checkisproddaycreatedtempdaycreate").post(checkIsProdDayCreatedTempDayCreate);

productionRoute.route("/productiondaytemp/:id").get(getSingleProductionDayTemp).put(updateProductionDayTemp).delete(deleteProductionDayTemp);
productionRoute.route("/productiondaysuniqidtemp").get(getAllProductionDayUniqidTemp);
productionRoute.route("/checkisproddaycreatedtemp").post(checkIsProdDayCreatedTemp);

//  PROD Day list backend route
const { addProductionDayListTemp, getAllProductionDayListByDateTemp, deleteProductionDayListTemp,getAllProductionsByUserForCurrMonthTemp,getAllProductionsByUserForCurrMonthViewTemp,getEmpProductionDayLastThreeMonthsTemp, deleteProductionDayByUnidTemp, productionDayListGetDeleteLimitedTemp, productionDayListGetViewLimitedTemp, getAllProductionDayListTemp, getAllProductionDayListUniqidTemp, getSingleProductionDayListTemp, updateProductionDayListTemp } = require("../controller/modules/production/productiondaylisttemp");
productionRoute.route("/productiondayliststemp").get(getAllProductionDayListTemp);
productionRoute.route("/productiondaylisttemp/new").post(addProductionDayListTemp);
productionRoute.route("/getempproductiondaylastthreemonthstemp").post(getEmpProductionDayLastThreeMonthsTemp);
productionRoute.route("/getallproductionsbyuserforcurrmonthtemp").post(getAllProductionsByUserForCurrMonthTemp);
productionRoute.route("/getallproductionsbyuserforcurrmonthviewtemp").post(getAllProductionsByUserForCurrMonthViewTemp);
productionRoute.route("/productiondaylisttemp/:id").get(getSingleProductionDayListTemp).put(updateProductionDayListTemp).delete(deleteProductionDayListTemp);
productionRoute.route("/productiondaylistgetdeletelimitedtemp").post(productionDayListGetDeleteLimitedTemp);
productionRoute.route("/productiondaylistgetviewlimitedtemp").post(productionDayListGetViewLimitedTemp);
productionRoute.route("/productiondaylistdeleteuniqudtemp").post(deleteProductionDayByUnidTemp);
productionRoute.route("/productiondaylistsgetbydatetemp").post(getAllProductionDayListByDateTemp);

const { addDayPointsUploadTemp,tempPointsfilter,getAllDayPointTempByDate,getEmployeeProductionDayListLastThreeMonthsTemp,getCheckDaypointIsCreatedTemp,dayPointTempDeleteByDate,productionDayPointTempLast, getDayPointIdByDateTemp,getAllDayPointsUploadTemp, getAllDayPointsUploadTempDateOnly, getSingleDayPointsUploadTemp, getEmployeeProductionLastThreeMonthsTemp,checkDayPointdateTemp, getAllDayPointsUploadLimitedTemp, updateDayPointsUploadTemp, dayPointsMonthYearFilterNxtMonthTemp, deleteDayPointsUploadTemp, updateDayPointsSingleUploadTemp, dayPointsfilterTemp, dayPointsDatasFetchTemp, dayPointsMonthYearFilterTemp } = require("../controller/modules/production/daypointsuploadtemp");
productionRoute.route("/daypointstemp").get(getAllDayPointsUploadTemp);
productionRoute.route("/checkdaypointiscreatedtemp").post(getCheckDaypointIsCreatedTemp);
productionRoute.route("/daypointtemp/new").post(addDayPointsUploadTemp);
 productionRoute.route('/getemployeeproductiondaylistlastthreemonthstemp').post(getEmployeeProductionDayListLastThreeMonthsTemp);
productionRoute.route("/daypointtempdeletebydate").post(dayPointTempDeleteByDate);
productionRoute.route("/productiondaypointtemplast").post(productionDayPointTempLast);
productionRoute.route("/daypointstempdateonly").get(getAllDayPointsUploadTempDateOnly);
productionRoute.route("/getemployeeproductionlastthreemonthstemp").post(getEmployeeProductionLastThreeMonthsTemp);
productionRoute.route("/daypointtemp/:id").delete(deleteDayPointsUploadTemp).get(getSingleDayPointsUploadTemp).put(updateDayPointsUploadTemp);
productionRoute.route("/daypointsmonthwisefiltertemp").post(dayPointsMonthYearFilterTemp);
productionRoute.route("/singledaypointtemp/:id").put(updateDayPointsSingleUploadTemp);
productionRoute.route("/checkdaypointdatetemp").post(checkDayPointdateTemp);
productionRoute.route("/daypointsfiltertemp").post(dayPointsfilterTemp);
productionRoute.route("/daypointsdatasfetchtemp").post(dayPointsDatasFetchTemp);
productionRoute.route('/temppointsfilter').post(tempPointsfilter);
productionRoute.route("/daypointsmonthwisefilternxtmonthtemp").post(dayPointsMonthYearFilterNxtMonthTemp);
productionRoute.route("/daypointslimitedtemp").get(getAllDayPointsUploadLimitedTemp);
productionRoute.route("/getdaypointidbydatetemp").post(getDayPointIdByDateTemp);
productionRoute.route("/daypointstempbydate").post(getAllDayPointTempByDate);
//payrunlist

//  training details backend route
const { addPayrunList, deletePayrunList,payrunBulkUndo,checkPayRunIsCreatedForAttendanceBulkUpdate,getAllPayrunListLimitedFilteredLossPayrun,payrunBulkUpdateUsingFileUpload,checkPayRunIsCreatedForAttendance,checkPayRunIsCreatedForPenaltyDayUpload,getAllPayrunListConsolidatedDateTemp, getAllPayrunListConsolidatedDate,checkIsPayRunGenerated,payrunListDupeCheck,payrunListSingleUserLastThreeMonths,getAllPayrunListLimitedFiltered,updateInnerDataSingleUserRerun,updateBankReleaseClose,deletePayrunBulkData,getPayrunBulkDataExcel,getBankReleasePayrunListMonthwise,payRunListSentSalaryFixDate,confirmConsolidatedReleaseSave,confirmHoldReleaseSave,updateRemoveReject,fixHoldSalaryReject,undoFieldNameConfirmListFix,confirmFixHoldSalaryLogUpdate,confirmFixHoldSalaryDate,confirmFixSalaryDate,fetchPayRunListDataMonthwise, updateInnerDataSingleUserWaiver,updatePayrunListInnerData, checkPayRunIsCreated, undoPayrunListInnerData, getYearMonthPayrunList,getAllPayrunList, getAllPayrunListLimited, getSinglePayrunList, updatePayrunList } = require("../controller/modules/production/payrunlist");
productionRoute.route("/payrunlists").get(getAllPayrunList);
productionRoute.route("/yearmonthpayrunlist").post(getYearMonthPayrunList);
productionRoute.route("/checkpayruniscreatedforattendancebulkupdate").post(checkPayRunIsCreatedForAttendanceBulkUpdate);
productionRoute.route("/payrunlistlimitedfiltered").post(getAllPayrunListLimitedFiltered)
productionRoute.route("/payrunlist/new").post(addPayrunList);
productionRoute.route("/bankreleaseclosed").post(updateBankReleaseClose);
productionRoute.route("/fetchbankreleasepayrunlistmonthwise").post(getBankReleasePayrunListMonthwise);
productionRoute.route("/payrunlistdupecheck").post(payrunListDupeCheck);
productionRoute.route("/payrunlistsingleuserlastthreemonths").post(payrunListSingleUserLastThreeMonths);
productionRoute.route("/payrunlist/:id").get(getSinglePayrunList).put(updatePayrunList).delete(deletePayrunList);
productionRoute.route("/payrunlistlimited").get(getAllPayrunListLimited);
productionRoute.route("/updatepayrunlistinnerdata").post(updatePayrunListInnerData);
productionRoute.route("/undopayrunlistinnerdata").post(undoPayrunListInnerData);
productionRoute.route("/checkpayruniscreated").post(checkPayRunIsCreated);
productionRoute.route("/confirmfixsalarydate").post(confirmFixSalaryDate);
productionRoute.route("/fixholdsalaryreject").post(fixHoldSalaryReject);
productionRoute.route("/updateremovereject").post(updateRemoveReject);
productionRoute.route("/confirmholdreleasesave").post(confirmHoldReleaseSave);
productionRoute.route("/confirmconsolidatedreleasesave").post(confirmConsolidatedReleaseSave);
productionRoute.route("/undofieldnameconfirmlistfix").post(undoFieldNameConfirmListFix);
productionRoute.route("/confirmfixholdsalarydate").post(confirmFixHoldSalaryDate);
productionRoute.route("/confirmfixholdsalarylogupdate").post(confirmFixHoldSalaryLogUpdate);
productionRoute.route("/updateinnerdatasingleuserrerun").post(updateInnerDataSingleUserRerun);
productionRoute.route("/updateinnerdatasingleuserwaiver").post(updateInnerDataSingleUserWaiver);
productionRoute.route("/payrunlistsentsalaryfixdate").post(payRunListSentSalaryFixDate);
productionRoute.route("/fetchpayrunlistdatamonthwise").post(fetchPayRunListDataMonthwise);
productionRoute.route("/getpayrunbulkdataexcel").post(getPayrunBulkDataExcel);
productionRoute.route("/deletepayrunbulkdata").post(deletePayrunBulkData);
productionRoute.route('/checkispayrungenerated').post(checkIsPayRunGenerated);
productionRoute.route("/checkpayruniscreatedforattendance").post(checkPayRunIsCreatedForAttendance);
productionRoute.route("/payrunlistsconsolidateddate").post(getAllPayrunListConsolidatedDate);
productionRoute.route("/payrunlistsconsolidateddatetemp").post(getAllPayrunListConsolidatedDateTemp);
productionRoute.route("/checkpayruniscreatedforpenaltydayupload").post(checkPayRunIsCreatedForPenaltyDayUpload);
productionRoute.route('/payrunbulkundo').post(payrunBulkUndo);
productionRoute.route('/payrunbulkupdateusingfileupload').post(payrunBulkUpdateUsingFileUpload);
productionRoute.route('/payrunlistlimitedfilteredlosspayrun').post(getAllPayrunListLimitedFilteredLossPayrun);
//Wavier Percentage Route
const { getAllConsolidatedSalaryRelease, updateConsolidatedSalaryRelease, addConsolidatedSalaryRelease, consolidatedSalaryReleaseMonthWise, getSingleConsolidatedSalaryRelease, deleteConsolidatedSalaryRelease } = require("../controller/modules/production/consolidatedsalaryrelease");
productionRoute.route("/consolidatedsalaryrelease").get(getAllConsolidatedSalaryRelease);
productionRoute.route("/consolidatedsalaryrelease/new").post(addConsolidatedSalaryRelease);
productionRoute.route("/consolidatedsalaryrelease/:id").get(getSingleConsolidatedSalaryRelease).put(updateConsolidatedSalaryRelease).delete(deleteConsolidatedSalaryRelease);
productionRoute.route("/consolidatedsalaryreleasemonthwise").post(consolidatedSalaryReleaseMonthWise);

//Wavier Percentage Route
const { getAllHoldSalaryRelease, updateHoldSalaryRelease, holdSalaryYetToConfirmList, addHoldSalaryRelease, getSingleHoldSalaryRelease, deleteHoldSalaryRelease } = require("../controller/modules/production/holdsalaryrelease");
productionRoute.route("/holdsalaryrelease").get(getAllHoldSalaryRelease);
productionRoute.route("/holdsalaryrelease/new").post(addHoldSalaryRelease);
productionRoute.route("/holdsalaryrelease/:id").get(getSingleHoldSalaryRelease).put(updateHoldSalaryRelease).delete(deleteHoldSalaryRelease);
productionRoute.route("/holdsalaryyettoconfirmlist").post(holdSalaryYetToConfirmList);


//Wavier Percentage Route
const { getAllBankRelease, updateBankRelease, addBankRelease, bankReleaseLimited, checkWithBankRelease, getSingleBankRelease, deleteBankRelease } = require("../controller/modules/production/bankrelease");
productionRoute.route("/bankrelease").get(getAllBankRelease);
productionRoute.route("/bankrelease/new").post(addBankRelease);
productionRoute.route("/bankrelease/:id").get(getSingleBankRelease).put(updateBankRelease).delete(deleteBankRelease);
productionRoute.route("/checkwithbankrelease").post(checkWithBankRelease)
productionRoute.route("/bankreleaselimited").get(bankReleaseLimited);

//Bulkerroruploadpoints Route
const { getAllBulkErrorUploadpoints, getAllBulkErrorUploadpointsFilename, getAllBulkErrorUploadListFilter, getAllBulkErrorIploadUniqid, updateBulkErrorUploadpoints, deleteBulkErrorUploadpoints, getAllBulkErrorUploadpointsFilter, getSingleBulkErrorUploadpoints, addBulkErrorUploadpoints, deleteMultipleBulkErrorUpload } = require("../controller/modules/penalty/bulkerrorupload");
productionRoute.route("/bulkerroruploads").get(getAllBulkErrorUploadpoints);
productionRoute.route("/bulkerroruploadsfilterlist").post(getAllBulkErrorUploadListFilter);
productionRoute.route("/bulkerroruploads/new").post(addBulkErrorUploadpoints);
productionRoute.route("/bulkerroruploadsunique").get(getAllBulkErrorIploadUniqid);
productionRoute.route("/bulkerroruploadsfilename").post(getAllBulkErrorUploadpointsFilename);
productionRoute.route("/multiplebulkerroruploads").post(deleteMultipleBulkErrorUpload);
productionRoute.route("/multiplebulkerroruploadsfilter").post(getAllBulkErrorUploadpointsFilter);
productionRoute.route("/bulkerroruploadssingle/:id").get(getSingleBulkErrorUploadpoints).put(updateBulkErrorUploadpoints).delete(deleteBulkErrorUploadpoints);

//Penaltytotalfieldupload Route 
const { getAllPenaltytotalfieldupload, updatePenaltytotalfieldupload, getAllPenaltytotalfielduploadInvalidReject,deletePenaltytotalfieldupload, getPenaltyTotalFieldLoginProject,
  getAllPenaltytotalfielduploadFilter, deleteMultiplePenaltytotalfieldupload, getSinglePenaltytotalfieldupload,
  getAllErrorUploadHierarchyList, getAllValidationErrorFilter, getAllPenaltytotalfielduploadValidationEntry,
  getAllInvalidErrorEntryHierarchyList, getAllValidateErrorEntryHierarchyList, getAllCheckManagerPenaltyTotal,
  addPenaltytotalfieldupload } = require("../controller/modules/penalty/penaltytotalfieldupload");
productionRoute.route("/penaltytotalfielduploads").get(getAllPenaltytotalfieldupload);
productionRoute.route("/penaltytotalfieldupload/new").post(addPenaltytotalfieldupload);
productionRoute.route("/multiplepenaltytotalfieldupload").post(deleteMultiplePenaltytotalfieldupload);
productionRoute.route("/penaltytotalfieldupload/:id").get(getSinglePenaltytotalfieldupload).put(updatePenaltytotalfieldupload).delete(deletePenaltytotalfieldupload);
productionRoute.route("/penaltytotaluploadinvalidreject").post(getAllPenaltytotalfielduploadInvalidReject);

productionRoute.route("/penaltytotalfielduploaddatefilters").post(getAllPenaltytotalfielduploadFilter);
productionRoute.route("/penaltytotalfielduploadloginproject").post(getPenaltyTotalFieldLoginProject);
productionRoute.route("/erroruploadconfirmhierarchylist").post(getAllErrorUploadHierarchyList);
productionRoute.route("/validationerrorfilters").post(getAllValidationErrorFilter);
productionRoute.route("/penaltytotalfielduploadsvalidation").get(getAllPenaltytotalfielduploadValidationEntry);

productionRoute.route("/invaliderrorentryhierarchy").post(getAllInvalidErrorEntryHierarchyList);
productionRoute.route("/validaterrorentryhierarchy").post(getAllValidateErrorEntryHierarchyList);
productionRoute.route("/checkmanager").post(getAllCheckManagerPenaltyTotal);
  
//Wavier Percentage Route
const { getAllErrorMode, updateErrorMode, addErrorMode,getAllErrorModeFilter, getOrginData, ErrorModeUnallotList, ErrorModeAllotedList, getSingleErrorMode, deleteErrorMode } = require("../controller/modules/penalty/errormode");
productionRoute.route("/errormodes").get(getAllErrorMode);
productionRoute.route("/errormode/new").post(addErrorMode);
productionRoute.route("/errormode/:id").get(getSingleErrorMode).put(updateErrorMode).delete(deleteErrorMode);
productionRoute.route("/errormodeunallotlist").post(ErrorModeUnallotList);
productionRoute.route("/errormodeallotedlist").post(ErrorModeAllotedList);
productionRoute.route("/getorgindata").post(getOrginData);
productionRoute.route("/errormodefilter").post(getAllErrorModeFilter);

//Penaltywaivermaster Route
const { getAllPenaltywaivermaster, updatePenaltywaivermaster, deletePenaltywaivermaster, getSinglePenaltywaivermaster, addPenaltywaivermaster, getAllPenaltywaivermasterForClientErrorRestrictions, getAllPenaltywaivermasterForClientErrorRestrictionsApprovalPage } = require("../controller/modules/penalty/penaltywaivermaster");
productionRoute.route("/penaltywaivermasters").get(getAllPenaltywaivermaster);
productionRoute.route("/penaltywaivermaster/new").post(addPenaltywaivermaster);
productionRoute.route("/penaltywaivermaster/:id").get(getSinglePenaltywaivermaster).put(updatePenaltywaivermaster).delete(deletePenaltywaivermaster);
productionRoute.route("/penaltywaivermastersforclienterrorrestrictions").post(getAllPenaltywaivermasterForClientErrorRestrictions);
productionRoute.route("/penaltywaivermastersforclienterrorrestrictionsapprovalpage").post(getAllPenaltywaivermasterForClientErrorRestrictionsApprovalPage);

//for penalty error upload
const {
  getAllUnitrateManualApproval,
  addUnitrateManualApproval,
  unitRateManualMrateUpdate,
  getSingleUnitrateManualApproval,
  updateUnitrateManualApproval,
  deleteUnitrateManualApproval,
  getAllUnitrateManualNotApproval,
} = require("../controller/modules/production/unitratemanualapproval");
productionRoute.route("/unitratemanualapprovals").get(getAllUnitrateManualApproval);
productionRoute.route("/unitratemanualapproval/new").post(addUnitrateManualApproval);
productionRoute.route("/unitratemanualmrateupdate").post(unitRateManualMrateUpdate);
productionRoute.route("/unitratemanualnotapprovals").get(getAllUnitrateManualNotApproval);
productionRoute.route("/unitratemanualapproval/:id").get(getSingleUnitrateManualApproval).put(updateUnitrateManualApproval).delete(deleteUnitrateManualApproval);

//MANUAL CLIENT INFO
const {
  getAllManualClientInfo,
  addManualClientInfo,
  getAllManualClientInfoFilter,
  getAllManualClientInfoLimited,
  getSingleManualClientInfo,
  updateManualClientInfo,
  deleteManualClientInfo,timeStudyCompletedList,
  getAllTimeStudyReportSelfFilter,timeStudyDupeCheck
} = require("../controller/modules/production/manualclientinfo");
productionRoute.route("/manualclientinfo").get(getAllManualClientInfo);
productionRoute.route("/manualclientinfo/new").post(addManualClientInfo);
productionRoute.route("/manualclientinfoslimited").post(getAllManualClientInfoLimited);
productionRoute.route("/manualclientinfosfilter").post(getAllManualClientInfoFilter);
productionRoute.route("/manualclientinfosfilterselfreport").post(getAllTimeStudyReportSelfFilter);
productionRoute.route("/manualclientinfo/:id").get(getSingleManualClientInfo).put(updateManualClientInfo).delete(deleteManualClientInfo);
productionRoute.route("/timestudydupecheck").post(timeStudyDupeCheck);
productionRoute.route("/timestudycompletedlist").post(timeStudyCompletedList);

//Sheetname Route
const { getAllSheetname, updateSheetname, deleteSheetname, getSingleSheetname, addSheetname } = require("../controller/modules/production/sheetnameController");
productionRoute.route("/sheetname").get(getAllSheetname);
productionRoute.route("/sheetname/new").post(addSheetname);
productionRoute.route("/sheetname/:id").get(getSingleSheetname).put(updateSheetname).delete(deleteSheetname);

//Type MAster

const { addTypeMaster, deleteTypeMaster, getAllTypeMaster, getSingleTypeMaster, updateTypeMaster } = require("../controller/modules/production/typemaster");
productionRoute.route("/productiontypemasters").get(getAllTypeMaster);
productionRoute.route("/productiontypemaster/new").post(addTypeMaster);
productionRoute.route("/productiontypemaster/:id").delete(deleteTypeMaster).get(getSingleTypeMaster).put(updateTypeMaster);


//queue Type MAster
const { addQueueTypeMaster, deleteQueueTypeMaster, getAllQueueTypeMaster,checkQueueTypeForProdUpload, getAllQueueTypeMasterVendorMasterDrop,getSingleQueueTypeMaster, getAllQueueTypeMasterSubCatetoryWiseType,
  getAllQueueTypeMasterCatetoryWiseType, getAllQueueTypeMasterVendorDrop, getAllQueueTypeMasterCategoryDrop, getAllQueueTypeMasterTypeDrop,checkQueueTypeForProdUploadMatched,checkQueueTypeForProdUploadCategoryCreate,
  getAllQueueTypeMasterDuplicate, fetchORateValueQueuemaster, updateQueueTypeMaster, getAllQueueTypeMasterUnitRate } = require("../controller/modules/production/queuetypemaster");
productionRoute.route("/productionqueuequeuetypemasters").get(getAllQueueTypeMaster);
productionRoute.route("/productionqueuemasterunitrate").get(getAllQueueTypeMasterUnitRate);
productionRoute.route("/orratevaluequeuemaster").post(fetchORateValueQueuemaster);
productionRoute.route("/queuetypemasterduplicate").post(getAllQueueTypeMasterDuplicate);
productionRoute.route("/queuetypesubcategorywisetype").post(getAllQueueTypeMasterSubCatetoryWiseType);
productionRoute.route("/productionqueuetypemaster/new").post(addQueueTypeMaster);
productionRoute.route("/productionqueuetypemaster/:id").delete(deleteQueueTypeMaster).get(getSingleQueueTypeMaster).put(updateQueueTypeMaster);
productionRoute.route("/queuetypecategorywisetype").post(getAllQueueTypeMasterCatetoryWiseType);
productionRoute.route("/queuetypevendordrop").get(getAllQueueTypeMasterVendorDrop);
productionRoute.route("/queuetypecategorydrop").post(getAllQueueTypeMasterCategoryDrop);
productionRoute.route("/queuetypetypedrop").post(getAllQueueTypeMasterTypeDrop);
productionRoute.route("/queuetypevendormasterdrop").post(getAllQueueTypeMasterVendorMasterDrop);

productionRoute.route("/queuetypeothertaskupload").post(checkQueueTypeForProdUpload);
productionRoute.route("/queuetypeothertaskuploadmatched").post(checkQueueTypeForProdUploadMatched);
productionRoute.route("/queuetypeothertaskuploadcategorycreate").post(checkQueueTypeForProdUploadCategoryCreate);


// client error month amount
const { getAllClienterrormonthamounts, addClienterrormonthamounts, deleteClienterrormonthamounts, getSingleClienterrormonthamounts, updateClienterrormonthamounts, getAllClientErrorMonthAmountConsolidate, getAllClientErrorWaiver, getAllClientErrorForwardHierarchyFilter, getAllClientErrorWaiverApprovalHierarchyWithDateFilter, getAllClientErrorWaiverApprovalHierarchyWithDateFilterNanTable, getDepartmentBasedOnDateFilter, getAllClientErrorOverallReport } = require("../controller/modules/penalty/clienterrormonthamount");
productionRoute.route("/clienterrormonthamount").get(getAllClienterrormonthamounts);
productionRoute.route("/clienterrormonthamount/new").post(addClienterrormonthamounts);
productionRoute.route("/clienterrormonthamount/:id").delete(deleteClienterrormonthamounts).get(getSingleClienterrormonthamounts).put(updateClienterrormonthamounts);
productionRoute.route("/clienterrormonthamountconsolidate").post(getAllClientErrorMonthAmountConsolidate);
productionRoute.route("/clienterrorwaiver").post(getAllClientErrorWaiver);
productionRoute.route("/clienterrorforwardhierarchy").post(getAllClientErrorForwardHierarchyFilter);
productionRoute.route("/clienterrorwaiverapprovalhierarchywithdate").post(getAllClientErrorWaiverApprovalHierarchyWithDateFilter);
productionRoute.route("/clienterrorwaiverapprovalhierarchywithdatenantable").post(getAllClientErrorWaiverApprovalHierarchyWithDateFilterNanTable);
productionRoute.route("/getdepartmentmonthsetbasedondatefilter").post(getDepartmentBasedOnDateFilter);
productionRoute.route("/clienterroroverallreport").post(getAllClientErrorOverallReport);

//othertask upload controller
const { addOtherTaskUpload, deleteOtherTaskUpload, OtherTaskUploadLastThree, getUniqidFromDateOtherTaskupload, getAllOtherTaskUploadLimitedFilter, getAllOtherTaskUpload, getAllOtherTaskUploadLimited, getAllOtherTaskUploadLimitedUniqid, getSingleOtherTaskUpload, updateOtherTaskUpload } = require("../controller/modules/production/othertaskupload");
productionRoute.route("/othertaskuploads").get(getAllOtherTaskUpload);
productionRoute.route("/othertaskupload/new").post(addOtherTaskUpload);
productionRoute.route("/othertaskupload/:id").get(getSingleOtherTaskUpload).put(updateOtherTaskUpload).delete(deleteOtherTaskUpload);
productionRoute.route("/othertaskuploadslimited").get(getAllOtherTaskUploadLimited);
productionRoute.route("/othertaskuploadslimiteduniqid").get(getAllOtherTaskUploadLimitedUniqid);
productionRoute.route("/othertaskuploadslimitedfilter").post(getAllOtherTaskUploadLimitedFilter);
productionRoute.route("/getuniqidfromdateproduploadother").post(getUniqidFromDateOtherTaskupload);
productionRoute.route("/othertaskuploadlastthree").get(OtherTaskUploadLastThree);




//othertask original upload backend route
const { getAllProductionUploadFilenamesOther, bulkProductionOrgUpdateCategorySubcategoryOther,
  bulkDeleteUnitRateUnallotOther, updateBulkDatasUnitandFlagOther, updateBulkDatasUnitandSectionOther, updateBulkDatasFlagOnlyOther,
  updateBulkDatasUnitOnlyOther, getProductionUploadDatasByIdOther, undoFieldNameOther, productionUploadCheckMismatchPresentFilterOther,
  productionUploadCheckStatusOther, getMismatchUpdatedListOther, getAllProductionUnAllotFilterViewManualOther, getProductionSingleDayUserOther,
  productionUploadCheckZeroMismatchPresentOther, getSingleDateDataforprodDayOther, getAllProductionUnAllotFilterOther,
  getAllProductionUnAllotFilterViewOther, productionUploadOverAllFetchLimitedOther,
  productionUploadOverAllFetchLimitedNewOther,
  getAllProductionUploadGetdeletedatasallOther, getAllProductionUploadGetdeletedatasOther, deleteProductionUploadsMutliOther,
  getAllProductionUploadFilenamesonlyOther, addProductionUploadOther, deleteProductionUploadOther, getAllProductionUploadOther,
  getSingleProductionUploadOther, updateProductionUploadOther,
  productionUploadUnitrateOverallFetchlimitedOther,
  getAllProductionUploadFilenamesonlyBulkDownloadOther
}
  = require("../controller/modules/production/othertaskoriginalupload");
productionRoute.route("/productionuploadsother").get(getAllProductionUploadOther);
productionRoute.route("/productionuploadfilenameonlybulkdownloadother").post(getAllProductionUploadFilenamesonlyBulkDownloadOther);
productionRoute.route("/productionuploadother/new").post(addProductionUploadOther);
productionRoute.route("/productionuploadother/:id").get(getSingleProductionUploadOther).put(updateProductionUploadOther).delete(deleteProductionUploadOther);
productionRoute.route("/productionuploadfilenamelistother").post(getAllProductionUploadFilenamesOther);
productionRoute.route("/productionuploadfilenameonlyother").post(getAllProductionUploadFilenamesonlyOther);
productionRoute.route("/productiondaygetsingledatedatadayother").post(getSingleDateDataforprodDayOther);
productionRoute.route("/productionuploadgetdeletedatasother").post(getAllProductionUploadGetdeletedatasOther);
productionRoute.route("/productionuploadgetdeletedatasallother").post(getAllProductionUploadGetdeletedatasallOther);
productionRoute.route("/productionuploaddeletemultiother").post(deleteProductionUploadsMutliOther);
productionRoute.route("/productionuploadoverallfetchlimitedother").post(productionUploadOverAllFetchLimitedOther);
productionRoute.route("/productionuploadoverallfetchlimitednewother").post(productionUploadOverAllFetchLimitedNewOther);
productionRoute.route("/getproductionsignledayuserother").post(getProductionSingleDayUserOther);
productionRoute.route("/checkzeromismatchpresentother").post(productionUploadCheckZeroMismatchPresentOther);
productionRoute.route("/productionuploadunitrateoverallfetchlimitedother").post(productionUploadUnitrateOverallFetchlimitedOther);
productionRoute.route("/productionunallotfilterother").post(getAllProductionUnAllotFilterOther);
productionRoute.route("/productionunallotfilterviewother").post(getAllProductionUnAllotFilterViewOther);
productionRoute.route("/productionunallotfilterviewmanualother").post(getAllProductionUnAllotFilterViewManualOther);
productionRoute.route("/getmismatchupdatedlistother").post(getMismatchUpdatedListOther);
productionRoute.route("/updatefieldundonameother").post(undoFieldNameOther);
productionRoute.route("/productionuploadcheckstatusother").post(productionUploadCheckStatusOther);
productionRoute.route("/getmismatchdatasidother").post(productionUploadCheckMismatchPresentFilterOther);
productionRoute.route("/getproductionuploaddatasbyidother").post(getProductionUploadDatasByIdOther);
productionRoute.route("/updatedbulkdatasunitandflagother").post(updateBulkDatasUnitandFlagOther);
productionRoute.route("/updatedbulkdatasunitonlyother").post(updateBulkDatasUnitOnlyOther);
productionRoute.route("/updatedbulkdatasflagonlyother").post(updateBulkDatasFlagOnlyOther);
productionRoute.route("/updatedbulkdatasunitandsectionother").post(updateBulkDatasUnitandSectionOther);
productionRoute.route("/bulkdeleteunitrateunallotother").post(bulkDeleteUnitRateUnallotOther);
productionRoute.route("/bulkproductionorgupdatecategorysubcategoryother").post(bulkProductionOrgUpdateCategorySubcategoryOther);


const { getAllUpdatedNewrate, getAllUpdatedNewrateLimited,zeroNewrateOverallReport, updateUpdatedNewrate, deleteUpdatedNewrate, getSingleUpdatedNewrate,updatedNewrateDupeCheck, addUpdatedNewrate } = require('../controller/modules/production/UpdatedNewrate');
productionRoute.route('/updatednewrates').get(getAllUpdatedNewrate);
productionRoute.route('/updatednewrateslimited').get(getAllUpdatedNewrateLimited);
productionRoute.route('/updatednewrate/new').post(addUpdatedNewrate);
productionRoute.route('/updatednewrate/:id').get(getSingleUpdatedNewrate).put(updateUpdatedNewrate).delete(deleteUpdatedNewrate);
productionRoute.route('/zeronewrateoverallreport').post(zeroNewrateOverallReport);
productionRoute.route('/updatednewratedupecheck').post(updatedNewrateDupeCheck);

//production upload bulk controller
const { getAllProductionuploadBulk, addProductionuploadBulk, getSingleProductionuploadBulk, getAllProductionuploadBulkFilter, updateProductionuploadBulk, deleteProductionuploadBulk, getAllProductionuploadBulkUndo } = require("../controller/modules/production/productionuploadbulk");
productionRoute.route("/productionuploadbulks").get(getAllProductionuploadBulk);
productionRoute.route("/productionsummaryuploadpbulkfilter").post(getAllProductionuploadBulkFilter);
productionRoute.route("/productionsummarybulkundo").post(getAllProductionuploadBulkUndo);
productionRoute.route("/productionuploadbulk/new").post(addProductionuploadBulk);
productionRoute.route("/productionuploadbulk/:id").get(getSingleProductionuploadBulk).put(updateProductionuploadBulk).delete(deleteProductionuploadBulk);




//production temp bulk controller
const { getAllProductiontempBulk, addProductiontempBulk, getSingleProductiontempBulk, updateProductiontempBulk,
  deleteProductiontempBulk, getAllProductiontempBulkUndo, getAllProductiontempBulkFilter } = require("../controller/modules/production/productiontempbulk");
productionRoute.route("/productiontempbulks").get(getAllProductiontempBulk);
productionRoute.route("/productionsummarytempbulkfilter").post(getAllProductiontempBulkFilter);
productionRoute.route("/productionsummarytempbulkundo").post(getAllProductiontempBulkUndo);
productionRoute.route("/productiontempbulk/new").post(addProductiontempBulk);
productionRoute.route("/productiontempbulk/:id").get(getSingleProductiontempBulk).put(updateProductiontempBulk).delete(deleteProductiontempBulk);


const { getAllPaidstatusfixMonthSet, addPaidstatusfixMonthSet, deletePaidstatusfixMonthSet, getSinglePaidstatusfixMonthSet, updatePaidstatusfixMonthSet } = require("../controller/modules/production/paidstatusfixmonthset");
productionRoute.route("/paidstatusfixmonthset").get(getAllPaidstatusfixMonthSet);
productionRoute.route("/paidstatusfixmonthset/new").post(addPaidstatusfixMonthSet);
productionRoute.route("/paidstatusfixmonthset/:id").delete(deletePaidstatusfixMonthSet).get(getSinglePaidstatusfixMonthSet).put(updatePaidstatusfixMonthSet);


const { getAllPenaltywaiverMonthSet, addPenaltywaiverMonthSet, getSinglePenaltywaiverMonthSet, updatePenaltywaiverMonthSet, deletePenaltywaiverMonthSet,addPenaltywaiverMonthSetBulk } = require("../controller/modules/penalty/penaltywaivermonthset");
productionRoute.route("/penaltywaivermonthset").get(getAllPenaltywaiverMonthSet);
productionRoute.route("/penaltywaivermonthset/new").post(addPenaltywaiverMonthSet);
productionRoute.route("/penaltywaivermonthset/:id").get(getSinglePenaltywaiverMonthSet).put(updatePenaltywaiverMonthSet).delete(deletePenaltywaiverMonthSet);
productionRoute.route("/penaltywaivermonthsetbulk/new").post(addPenaltywaiverMonthSetBulk);



//  production original backend route
const {
  addProductionMonthOriginal,
  deleteProductionMonthOriginal,
  getAllProductionMonthOriginalLimitedFilter,
  getUniqidFromDateProdMonthupload,
  getAllProductionMonthOriginal,
  getAllProductionMonthOriginalLimited,
  getAllProductionMonthOriginalLimitedUniqid,
  getSingleProductionMonthOriginal,
  updateProductionMonthOriginal,
  productionMonthOriginalLastThree,
} = require("../controller/modules/production/productionmonthoriginal");
productionRoute.route("/productionmonthoriginals").get(getAllProductionMonthOriginal);
productionRoute.route("/productionmonthoriginal/new").post(addProductionMonthOriginal);
productionRoute.route("/productionmonthoriginal/:id").get(getSingleProductionMonthOriginal).put(updateProductionMonthOriginal).delete(deleteProductionMonthOriginal);
productionRoute.route("/productionmonthoriginalslimited").get(getAllProductionMonthOriginalLimited);
productionRoute.route("/productionmonthoriginalslimiteduniqid").get(getAllProductionMonthOriginalLimitedUniqid);
productionRoute.route("/productionmonthoriginalslimitedfilter").post(getAllProductionMonthOriginalLimitedFilter);
productionRoute.route("/getuniqidfromdateprodupload").post(getUniqidFromDateProdMonthupload);
productionRoute.route("/productionmonthoriginallastthree").get(productionMonthOriginalLastThree);

//  production upload backend route
// const {
//   getAllProductionMonthUploadFilenames,
//   addProductionMonthUpload,
//   deleteProductionMonthUpload,
//   getAllProductionMonthUpload,
//   getSingleProductionMonthUpload,
//   updateProductionMonthUpload,
//   getAllProductionMonthUploadFilenamesonly,
//   getAllProductionMonthUploadFilenamesonlyBulkDownload,
//   productionMonthUploadCheckStatus,
//   getAllProductionMonthUploadGetdeletedatasall,
//   deleteProductionMonthUploadsMutli,
//   uploadFilesMonth,
// } = require("../controller/modules/production/productionmonthupload");
// productionRoute.route("/productionmonthuploads").get(getAllProductionMonthUpload);
// productionRoute.route("/productionmonthupload/new").post(addProductionMonthUpload);
// productionRoute.route("/productionmonthupload/:id").get(getSingleProductionMonthUpload).put(updateProductionMonthUpload).delete(deleteProductionMonthUpload);
// productionRoute.route("/productionmonthuploadfilenamelist").post(getAllProductionMonthUploadFilenames);
// productionRoute.route("/productionmonthuploadfilenameonly").post(getAllProductionMonthUploadFilenamesonly);
// productionRoute.route("/productionmonthuploadfilenameonlybulkdownload").post(getAllProductionMonthUploadFilenamesonlyBulkDownload);
// productionRoute.route("/productionmonthuploadcheckstatus").post(productionMonthUploadCheckStatus);
// productionRoute.route("/productionmonthuploadgetdeletedatasall").post(getAllProductionMonthUploadGetdeletedatasall);
// productionRoute.route("/productionmonthuploaddeletemulti").post(deleteProductionMonthUploadsMutli);
// productionRoute.route("/upload-excel").post(uploadFilesMonth);

//  JOBS ROUTE
const { getJobStatus } = require("../controller/modules/production/jobController");
productionRoute.route("/getjobstatus").get(getJobStatus);

module.exports = productionRoute;
