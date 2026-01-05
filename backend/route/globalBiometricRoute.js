const express = require("express");
const globalBiometricRoute = express.Router();




const {
  deviceKeepAlive,
  deviceRemoteCommand,
  uploadIdentifyRecord
} = require("../controller/modules/biometric/globalBoweeBiometric");

// Device → Server
globalBiometricRoute.route("/Device/Keepalive").post(deviceKeepAlive);
globalBiometricRoute.route("/Device/RemoteCommand").post(deviceRemoteCommand);
globalBiometricRoute.route("/Record/UploadIdentifyRecord").post(uploadIdentifyRecord);



module.exports = globalBiometricRoute;
