const express = require("express");
const globalBiometricRoute = express.Router();




const {
  deviceKeepAlive,
  deviceRemoteCommand,
  uploadIdentifyRecord,
  downloadPeopleList,
  downloadPeopleListResult,
  pushPeople,
  DeletePeopleList
} = require("../controller/modules/biometric/globalBoweeBiometric");

// Device → Server
globalBiometricRoute.route("/Device/Keepalive").post(deviceKeepAlive);
globalBiometricRoute.route("/Device/RemoteCommand").post(deviceRemoteCommand);
globalBiometricRoute.route("/Record/UploadIdentifyRecord").post(uploadIdentifyRecord);
globalBiometricRoute.route("/People/DownloadPeopleList").post(downloadPeopleList);
globalBiometricRoute.route("/People/DownloadPeopleListResult").post(downloadPeopleListResult);
globalBiometricRoute.route("/People/PushPeople").post(pushPeople);
globalBiometricRoute.route("/People/DeletePeopleList").post(DeletePeopleList);



module.exports = globalBiometricRoute;
