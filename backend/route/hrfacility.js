const express = require("express");
const hrfacilityRoute = express.Router();

// connect Branch controller
const { getAllBranch, addBranch, getBranchLimited, getAllBranchAccessBranch, getBranchLimitedByCompanyAccess, getBranchAddress, getAllBranchQrCode, updateBranch, getSingleBranch, deleteBranch, getOverAllBranch, getAllBranchCheck } = require("../controller/modules/branch");

hrfacilityRoute.route("/branches").get(getAllBranch);
hrfacilityRoute.route("/branch/new").post(addBranch);
hrfacilityRoute.route("/branchesqrcode").post(getAllBranchQrCode);
hrfacilityRoute.route("/branch/:id").get(getSingleBranch).put(updateBranch).delete(deleteBranch);
hrfacilityRoute.route("/getoverallbranch").post(getOverAllBranch);
hrfacilityRoute.route("/checkbranch").post(getAllBranchCheck);
hrfacilityRoute.route("/branchaddress").post(getBranchAddress);
hrfacilityRoute.route("/branchlimited").post(getBranchLimited);
hrfacilityRoute.route("/branchesaccessbranch").post(getAllBranchAccessBranch);
hrfacilityRoute.route("/branchlimitedbycompanyaccess").post(getBranchLimitedByCompanyAccess);
// connect "Unit" controller
const { getQueueReports, getUnitResult, getAllBranchUnitsLimited, getAllUnitAccessBranch, getUnitsLimitedByAccess, getCustDropdowns, getAllBranchUnits, getProcessDropdowns, getUnitarrayList, getAllUnit, addUnit, updateUnit, getSingleUnit, deleteUnit, getOverAllUnits, getAllUnitCheck } = require("../controller/modules/unit");

hrfacilityRoute.route("/units").get(getAllUnit);
hrfacilityRoute.route("/unit/new").post(addUnit);
hrfacilityRoute.route("/unit/:id").get(getSingleUnit).put(updateUnit).delete(deleteUnit);
hrfacilityRoute.route("/unitresult").post(getUnitResult);
hrfacilityRoute.route("/unitarraylist").post(getUnitarrayList);
hrfacilityRoute.route("/unitsaccessbranch").post(getAllUnitAccessBranch);
hrfacilityRoute.route("/custdropdowns").post(getCustDropdowns);
hrfacilityRoute.route("/processdropdwons").post(getProcessDropdowns);
hrfacilityRoute.route("/queuereports").post(getQueueReports);
hrfacilityRoute.route("/getoverallunits").post(getOverAllUnits);
hrfacilityRoute.route("/unitcheck").post(getAllUnitCheck);
hrfacilityRoute.route("/branchunits").post(getAllBranchUnits);
hrfacilityRoute.route("/unitslimited").post(getAllBranchUnitsLimited);
hrfacilityRoute.route("/unitlimitedbycompanyaccess").post(getUnitsLimitedByAccess);

// connect Area controller..
const { getAllArea, addArea, updateArea, getSingleArea, deleteArea } = require("../controller/modules/area");
hrfacilityRoute.route("/areas").get(getAllArea);
hrfacilityRoute.route("/area/new").post(addArea);
hrfacilityRoute.route("/area/:id").get(getSingleArea).put(updateArea).delete(deleteArea);
// connect customer group controller
const { getAllLocationDetails, addLocationDetails, updateLocationDetails, getSingleLocationDetails, deleteLocationDetails } = require("../controller/modules/location");

hrfacilityRoute.route("/locations").get(getAllLocationDetails);
hrfacilityRoute.route("/location/new").post(addLocationDetails);
hrfacilityRoute.route("/location/:id").get(getSingleLocationDetails).put(updateLocationDetails).delete(deleteLocationDetails);

// connect Floor controller..

const { getAllFloor, addFloor, updateFloor, getSingleFloor, deleteFloor, getOverAllFloor, getAllFloorCheck } = require("../controller/modules/floor");
hrfacilityRoute.route("/floors").get(getAllFloor);
hrfacilityRoute.route("/floor/new").post(addFloor);
hrfacilityRoute.route("/floor/:id").get(getSingleFloor).put(updateFloor).delete(deleteFloor);
hrfacilityRoute.route("/getoverallfloor").post(getOverAllFloor);
hrfacilityRoute.route("/floorcheck").post(getAllFloorCheck);

// connect Intern Course controller..

const { getAllInternCourse, addInternCourse, updateInternCourse, getSingleInternCourse, deleteInternCourse } = require("../controller/modules/internCourse");
hrfacilityRoute.route("/internCourses").get(getAllInternCourse);
hrfacilityRoute.route("/internCourse/new").post(addInternCourse);
hrfacilityRoute.route("/internCourse/:id").get(getSingleInternCourse).put(updateInternCourse).delete(deleteInternCourse);

const { getAllFilterfloorManpower, getAllManpower, getAllFilterareaManpower, getSingleManpower, addManpower, updateManpower, deleteManpower } = require("../controller/modules/manpower");
hrfacilityRoute.route("/allmanpowers").get(getAllManpower);
hrfacilityRoute.route("/floormanpowers").post(getAllFilterfloorManpower);
hrfacilityRoute.route("/manpowerareas").post(getAllFilterareaManpower);
hrfacilityRoute.route("/manpower/new").post(addManpower);
hrfacilityRoute.route("/manpower/:id").get(getSingleManpower).put(updateManpower).delete(deleteManpower);

// connect Areagrouping controller..

const { getAllAreagrouping, addAreagrouping, updateAreagrouping, getSingleAreagrouping, deleteAreagrouping } = require("../controller/modules/areagrouping");
hrfacilityRoute.route("/areagroupings").get(getAllAreagrouping);
hrfacilityRoute.route("/areagrouping/new").post(addAreagrouping);
hrfacilityRoute.route("/areagrouping/:id").get(getSingleAreagrouping).put(updateAreagrouping).delete(deleteAreagrouping);

// connect Locationgrouping controller..

const { getAllLocationgrouping, addLocationgrouping, updateLocationgrouping, getSingleLocationgrouping, deleteLocationgrouping } = require("../controller/modules/locationgrouping");
hrfacilityRoute.route("/locationgroupings").get(getAllLocationgrouping);
hrfacilityRoute.route("/locationgrouping/new").post(addLocationgrouping);
hrfacilityRoute.route("/locationgrouping/:id").get(getSingleLocationgrouping).put(updateLocationgrouping).delete(deleteLocationgrouping);

// connect work Station controller..
const { addWorkStation, deleteWorkStation, getAllWorkStation, getAllWorkStationAccess, getSingleWorkStation, updateWorkStation } = require("../controller/modules/workstationcontroller");
hrfacilityRoute.route("/workstations").get(getAllWorkStation);
hrfacilityRoute.route("/workstationsaccess").post(getAllWorkStationAccess);
hrfacilityRoute.route("/workstation/new").post(addWorkStation);
hrfacilityRoute.route("/workstation/:id").get(getSingleWorkStation).put(updateWorkStation).delete(deleteWorkStation);

// connect Assign Branch controller..
const { getAllAssignBranch, addAssignBranch, getAssignbranchfilter, getAllUnAssignBranch, usersAssignBranch, addAssignBranchAccessible, getSingleUserbranch, getSingleAssignBranch, updateAssignBranch, deleteAssignBranch } = require("../controller/modules/assignbranch");
hrfacilityRoute.route("/assignbranches").get(getAllAssignBranch);
hrfacilityRoute.route("/assignbranch/new").post(addAssignBranch);
hrfacilityRoute.route("/assignbranchesaccessible").post(addAssignBranchAccessible);
hrfacilityRoute.route("/unassignbranches").post(getAllUnAssignBranch);
hrfacilityRoute.route("/assignbranch/:id").get(getSingleAssignBranch).put(updateAssignBranch).delete(deleteAssignBranch);
hrfacilityRoute.route("/usersassignbranch").post(usersAssignBranch);
hrfacilityRoute.route("/singleassignbranch").post(getSingleUserbranch);
hrfacilityRoute.route("/assignbranchfilters").post(getAssignbranchfilter);
// connect Weekoffpresent controller..
const { getAllWeekoffpresent, addWeekoffpresent, updateWeekoffpresent, getSingleWeekoffpresent, deleteWeekoffpresent, getAllWeekoffpresentFilter } = require("../controller/modules/weekoffcontrolpanel");
hrfacilityRoute.route("/weekoffpresents").get(getAllWeekoffpresent);
hrfacilityRoute.route("/weekoffpresent/new").post(addWeekoffpresent);
hrfacilityRoute.route("/weekoffpresent/:id").get(getSingleWeekoffpresent).put(updateWeekoffpresent).delete(deleteWeekoffpresent);
hrfacilityRoute.route("/weekoffpresentfilter").post(getAllWeekoffpresentFilter);

const { updateOverallUnitname, getAllCheckDeleteUnit } =
    require("../controller/login/OverallUnitnameUpdate");
hrfacilityRoute.route("/unitoverallupdate").put(updateOverallUnitname);
hrfacilityRoute.route("/unitoverallcheck").post(getAllCheckDeleteUnit);

const { updateOverallAreaname, getAllCheckDeleteArea } =
    require("../controller/login/OverallAreaUpdate");
hrfacilityRoute.route("/overallareasupdate").put(updateOverallAreaname);
hrfacilityRoute.route("/overallareascheck").post(getAllCheckDeleteArea);

const { updateOverallLocationname,
    getAllCheckDeleteLocation
} =
    require("../controller/login/OverallLocationUpdate");
hrfacilityRoute.route("/locationoverallupdate").put(updateOverallLocationname);
hrfacilityRoute.route("/locationoverallcheck").post(getAllCheckDeleteLocation);

const { updateOverallFloorname,
    getAllCheckDeleteFloor
} =
    require("../controller/login/OverallFloorUpdate");
hrfacilityRoute.route("/flooroverallupdate").put(updateOverallFloorname);
hrfacilityRoute.route("/flooroverallcheck").post(getAllCheckDeleteFloor);

const { getAllApplyworkfromhome, getSingleApplyworkfromhome, getActiveApplyworkfromhome, getAllApprovedLeave,getActiveApplyWFHHierarchyBasedPage, addApplyworkfromhome, getApplyWFHEmpIdFilter, getAllApplyworkfromhomeApprovedForUserShiftRoasterAssignbranch, updateApplyworkfromhome, getAllApplyworkfromhomeApprovedForUserShiftRoaster, getAllApplyworkfromhomeFilter, deleteApplyworkfromhome } = require("../controller/modules/applyworkfromhome");
hrfacilityRoute.route("/applyworkfromhomes").get(getAllApplyworkfromhome);
hrfacilityRoute.route("/applyworkfromhome/new").post(addApplyworkfromhome);
hrfacilityRoute.route("/applyleavesfilter").get(getAllApplyworkfromhomeFilter);
hrfacilityRoute.route("/approvedleaves").get(getAllApprovedLeave);
hrfacilityRoute.route("/applyworkfromhome/:id").get(getSingleApplyworkfromhome).put(updateApplyworkfromhome).delete(deleteApplyworkfromhome);
hrfacilityRoute.route("/activeuserapplyworkfromhomes").get(getActiveApplyworkfromhome);
hrfacilityRoute.route("/applyworkfromhomesapproved").post(getAllApplyworkfromhomeApprovedForUserShiftRoaster);
hrfacilityRoute.route("/applyworkfromhomesapprovedassignbranch").post(getAllApplyworkfromhomeApprovedForUserShiftRoasterAssignbranch);
hrfacilityRoute.route('/applyworkfromhomebyemployeeid').post(getApplyWFHEmpIdFilter);
hrfacilityRoute.route('/hierarcybasedworkfromhomelist').post(getActiveApplyWFHHierarchyBasedPage);

// Assign work from home controller
const { getAllAssignworkfromhome, addAssignworkfromhome, updateAssignworkfromhome, getSingleAssignworkfromhome, deleteAssignworkfromhome } = require("../controller/modules/assignworkfromhome");
hrfacilityRoute.route("/assignworkfromhomes").get(getAllAssignworkfromhome);
hrfacilityRoute.route("/assignworkfromhome/new").post(addAssignworkfromhome);
hrfacilityRoute.route("/assignworkfromhome/:id").get(getSingleAssignworkfromhome).put(updateAssignworkfromhome).delete(deleteAssignworkfromhome);



const {
    addBiometricDeviceManagement,
    deleteBiometricDeviceManagement,
    updateBiometricDeviceManagement,
    getAllBiometricDeviceManagement,
    getSingleBiometricDeviceManagement,
    biometricDeviceManagementSort,
    biometricDeviceManagement,
    getBiometricBrandModelAssets,
    getBiometricSerialNumberAssets,
    getOverallBulkBiometricDevicesDelete,
    getSingleBulkBiometricDevicesDelete,
    getDuplicateBiometricDeviceGrouping,
    biometricdevicelastindex,
    getAllBiometricAttendanceDevices,
    // getDeviceNewLogs,
    getBiometricAssignedIpAsset
} = require("../controller/modules/BiometricdeviceManagementController.js");
hrfacilityRoute.route("/biometricdevicemanagements").get(getAllBiometricDeviceManagement);
hrfacilityRoute.route("/biometricattendancedevicenames").get(getAllBiometricAttendanceDevices);
hrfacilityRoute.route("/biometricdevicemanagement/new").post(addBiometricDeviceManagement);
hrfacilityRoute.route("/biometricdevicemanagementsort").get(biometricDeviceManagementSort);
hrfacilityRoute.route("/biometricdevicelastindex").post(biometricdevicelastindex);
hrfacilityRoute.route("/biometricdevicemanagementlist").post(biometricDeviceManagement);
hrfacilityRoute.route("/biometricbranndmodelassets").post(getBiometricBrandModelAssets);
hrfacilityRoute.route("/biometricserialnumberassets").post(getBiometricSerialNumberAssets);
hrfacilityRoute.route("/overallbullbiometricdevicedelete").post(getOverallBulkBiometricDevicesDelete);
hrfacilityRoute.route("/singlebiodevicemanagementdelete").post(getSingleBulkBiometricDevicesDelete);
hrfacilityRoute.route("/getduplicatebiometricdevicegrouping").post(getDuplicateBiometricDeviceGrouping);
// hrfacilityRoute.route("/getdevicenewlogs").post(getDeviceNewLogs);
hrfacilityRoute.route("/biometricassignedipasset").post(getBiometricAssignedIpAsset);
hrfacilityRoute
    .route("/biometricdevicemanagement/:id")
    .get(getSingleBiometricDeviceManagement)
    .put(updateBiometricDeviceManagement)
    .delete(deleteBiometricDeviceManagement);




// connect user document upload controller..
const {
    getAllUserdocumentupload,
    addUserdocumentupload,
    updateUserdocumentupload,
    getSingleUserdocumentupload,
    deleteUserdocumentupload,
    getAllUserdocumentsDeleteBulk,
    getAllUserdocumentsDelete,
    uploadChunkUserdocuments,
    getAllUserdocumentsEditFetch,
    getUserdocumentuploadListFilter,
    getFilteredUserdocumentuploads,
    getFilteredUserdocumentuploadsForLeave,
    getUserUploadDocumentsForRemote,
    getFilteredUserdocumentuploadsForPermission,
} = require('../controller/modules/userdocumentupload.js');
hrfacilityRoute.route('/userdocumentuploads').get(getAllUserdocumentupload);
hrfacilityRoute.route('/getfiltereduserdocumentuploads').post(getFilteredUserdocumentuploads);
hrfacilityRoute.route('/useruploaddocumentforremote').post(getUserUploadDocumentsForRemote);
hrfacilityRoute.route('/userdocumentupload/new').post(addUserdocumentupload);
hrfacilityRoute.route('/userdocumentupload/:id').get(getSingleUserdocumentupload).put(updateUserdocumentupload).delete(deleteUserdocumentupload);
hrfacilityRoute.route('/getfiltereduserdocumentuploadsforleave').post(getFilteredUserdocumentuploadsForLeave);
hrfacilityRoute.route('/getfiltereduserdocumentuploadsforpermission').post(getFilteredUserdocumentuploadsForPermission);



// connect remainder category form controller
const { getAllRemaindercategory, getSingleRemaindercategory, addRemaindercategory, updateRemaindercategory, deleteRemaindercategory } = require('../controller/modules/remaindercategory.js');
hrfacilityRoute.route('/remaindercategories').get(getAllRemaindercategory);
hrfacilityRoute.route('/remaindercategory/new').post(addRemaindercategory);
hrfacilityRoute.route('/remaindercategory/:id').get(getSingleRemaindercategory).put(updateRemaindercategory).delete(deleteRemaindercategory);

// multer route
hrfacilityRoute.route('/uploadchunkuserdocuments').post(uploadChunkUserdocuments);
hrfacilityRoute.route('/userdocumentsdelete').post(getAllUserdocumentsDelete);
hrfacilityRoute.route('/userdocumentseditfetch').post(getAllUserdocumentsEditFetch);
hrfacilityRoute.route('/userdocumentsdeletebulk/:id').post(getAllUserdocumentsDeleteBulk);
// filter functionality
hrfacilityRoute.route('/userdocumentuploadlistfilter').post(getUserdocumentuploadListFilter);


module.exports = hrfacilityRoute;
