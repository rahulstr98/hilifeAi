const express = require("express");
const permissionRoute = express.Router();

//password category
const { getAllPermissions, getSinglePermission, getAllPermissionsHome, getActiveApplyPermissionsHierarchyBased, getActiveApplyPermissionsHierarchyBasedPage, getActiveApplyPermissions, getAllApprovedPermissions, updatePermission, addPermission, deletePermission, getApplyPermissionEmpIdFilter, getApplyPermissionListFilter } = require("../controller/modules/permission/permission");
permissionRoute.route("/persmissions").get(getAllPermissions);
permissionRoute.route("/persmission/new").post(addPermission);
permissionRoute.route("/approvedpersmissions").get(getAllApprovedPermissions);
permissionRoute.route("/persmission/:id").get(getSinglePermission).put(updatePermission).delete(deletePermission);
permissionRoute.route("/activeuserpersmissions").get(getActiveApplyPermissions);
permissionRoute.route("/persmissionshome").post(getAllPermissionsHome);
permissionRoute.route("/activeuserpermissions_hierarchybased").post(getActiveApplyPermissionsHierarchyBased);
permissionRoute.route("/activeuserpermissions_hierarchybased_page").post(getActiveApplyPermissionsHierarchyBasedPage);
permissionRoute.route("/applypermissionemployeeidfilter").post(getApplyPermissionEmpIdFilter);
permissionRoute.route("/applypermissionlistfilter").post(getApplyPermissionListFilter);
module.exports = permissionRoute;
