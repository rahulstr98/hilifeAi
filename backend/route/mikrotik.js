const express = require("express");
const mikrotik = express.Router();
require("dotenv").config();

const {
  getAllMikrotikMaster,
  addMikrotikMaster,
  getSingleMikrotikMaster,
  updateMikrotikMaster,
  deleteMikrotikMaster,
} = require("../controller/modules/mikrotik/MikrotikMaster");
mikrotik.route("/getallmikrotikmaster").get(getAllMikrotikMaster);
mikrotik.route("/createmikrotikmaster").post(addMikrotikMaster);
mikrotik
  .route("/singlemikrotikmaster/:id")
  .get(getSingleMikrotikMaster)
  .put(updateMikrotikMaster)
  .delete(deleteMikrotikMaster);

const {
  getAllMikroTikInterfaces
} = require("../controller/modules/mikrotik/Interfaces");
mikrotik.route("/getallmikrotikinterfaces").post(getAllMikroTikInterfaces);
const {
  getMikrotikProfiles,
  addMikrotikProfiles,
  deleteMikroTikProfile,
  updateMikroTikProfiles,
  getMikroTikIpPool,getMikroTikIpPoolUsedAddresses
} = require("../controller/modules/mikrotik/Profiles");
mikrotik.route("/getmikrotikprofiles").post(getMikrotikProfiles);
mikrotik.route("/getmikrotikippool").post(getMikroTikIpPool);
mikrotik.route("/createmikrotikprofile").post(addMikrotikProfiles);
mikrotik.route("/updatemikrotikprofile").put(updateMikroTikProfiles);
mikrotik.route("/deletemikrotikprofile").post(deleteMikroTikProfile);
mikrotik.route("/getmikrotikippoolusedaddresses").post(getMikroTikIpPoolUsedAddresses);

const {
  getMikrotikSecrets,
  addMikrotikSecrets,
  deleteMikroTikSecret,
  updateMikroTikSecret,
  getUserVpnDetails,
  getUserIndividualPassword,
  getAllMikrotikMasterDatas,
  getAllMikrotikMasterDatasFilter
} = require("../controller/modules/mikrotik/Secrets");
mikrotik.route("/getmikrotiksecrets").post(getMikrotikSecrets);
mikrotik.route("/createmikrotiksecret").post(addMikrotikSecrets);
mikrotik.route("/updatemikrotiksecret").put(updateMikroTikSecret);
mikrotik.route("/deletemikrotiksecret").post(deleteMikroTikSecret);
mikrotik.route("/checkuservpndetails").post(getUserVpnDetails);
mikrotik.route("/getuserindividualpassword").post(getUserIndividualPassword);
mikrotik.route("/getmikrotiksecretslocal").post(getAllMikrotikMasterDatas);
mikrotik.route("/getmikrotiksecretslocalfilter").post(getAllMikrotikMasterDatasFilter);


const {
  getAllMikroTikLogs
} = require("../controller/modules/mikrotik/Logs");
mikrotik.route("/getallmikrotiklogs").post(getAllMikroTikLogs);


const {
  getMikrotikPPPL2tpServer,
  getMikrotikPppPPTPServer,
  getMikrotikPppActiveConnections,
  removePppActiveConnection
} = require("../controller/modules/mikrotik/L2tpServer");
mikrotik.route("/getmikrotikpptpserver").post(getMikrotikPppPPTPServer);
mikrotik.route("/getmikrotikl2tpserver").post(getMikrotikPPPL2tpServer);
mikrotik.route("/getmikrotikactiveconnections").post(getMikrotikPppActiveConnections);
mikrotik.route("/removemikrotikactiveconnection").post(removePppActiveConnection);


module.exports = mikrotik;
