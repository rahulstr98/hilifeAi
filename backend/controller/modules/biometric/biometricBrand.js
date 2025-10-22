const BioMetricBrand = require("../../../model/modules/biometric/biometricBrandModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const { sendCommandToDevice, sendCommandToDeviceAttendance } = require('../../modules/deviceSocket');
const { fetchRemoteControl, fetchRemoteControlCheck } = require('../../modules/BiometricF51A.js');
const { sendToDeviceGateway, sendToDeviceGatewayAddUser } = require('../../modules/BiometricOpenApi.js');
const { sendCommandToBoweeDevice, sendUserDetailsToDevice, deleteSingleBoweeUser, getUserDetailsFromBoweeDevice } = require('../../../route/bowerBiometric.js');
const PASSWORD = process.env.DEVICE_PASSWORD;
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");
const Biouploaduserinfo = require('../../../model/modules/biometric/uploaduserinfo');
const axios = require("axios");

// get All BioMetricBrand => /api/biometricbrandmodel
exports.getAllBioMetricBrand = catchAsyncErrors(async (req, res, next) => {
  let allbiometricbrandmodel;
  try {
    allbiometricbrandmodel = await BioMetricBrand.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!allbiometricbrandmodel) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    allbiometricbrandmodel,
  });
});
exports.getBiometricDeviceBrandIdentification = catchAsyncErrors(async (req, res, next) => {
  let devicebrand;
  let { CloudIDC } = req?.body;
  try {
    devicebrand = await BiometricDeviceManagement.findOne({ biometricserialno: CloudIDC }).lean();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    devicebrand,
  });
});

// Create new BioMetricBrand=> /api/biometricbrandmodel/new
exports.addBioMetricBrand = catchAsyncErrors(async (req, res, next) => {
  let abiometricbrandmodel = await BioMetricBrand.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle BioMetricBrand => /api/biometricbrandmodel/:id
exports.getSingleBioMetricBrand = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sbiometricbrandmodel = await BioMetricBrand.findById(id);

  if (!sbiometricbrandmodel) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({
    sbiometricbrandmodel,
  });
});

// update BioMetricBrand by id => /api/biometricbrandmodel/:id
exports.updateBioMetricBrand = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ubiometricbrandmodel = await BioMetricBrand.findByIdAndUpdate(id, req.body);
  if (!ubiometricbrandmodel) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete BioMetricBrand by id => /api/biometricbrandmodel/:id
exports.deleteBioMetricBrand = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dbiometricbrandmodel = await BioMetricBrand.findByIdAndRemove(id);

  if (!dbiometricbrandmodel) {
    return next(new ErrorHandler("Data not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});



// delete BioMetricBrand by id => /api/biometricbrandmodel/:id
exports.addNewUserBiometricBrand = catchAsyncErrors(async (req, res, next) => {
  const { command, brand, brand1 } = req?.body;
  let alldeviceinfo = [];
  let alldeviceProfileRole = [];
  if (brand === "Brand1") {
    alldeviceinfo = await getCommandForDeviceAIIdAddUser(command, brand);
    alldeviceProfileRole = await getCommandForDeviceAIIdAddUser(brand1, brand);
  }
  else if (brand === "Brand2") {
    let finalCommand = { ...command, pass: PASSWORD }
    alldeviceinfo = await fetchRemoteControl(finalCommand, "setUserPower");
  } else if (brand === "Brand3") {
    alldeviceinfo = await sendToDeviceGatewayAddUser(command);
  }

  if (alldeviceinfo && alldeviceProfileRole) {

    return res.status(200).json({ alldeviceinfo, message: "Command executed successfully" });
  } else {
    return res.status(500).json({ message: "Failed to send command to device" });
  }
});

const getCommandForDeviceAIIdAddUser = async (command, brand) => {
  let commandSend = {};
  if (brand === "Brand1") {
    commandSend = command;
  }
  const result = await sendCommandToDeviceAttendance(commandSend);
  return result;
};





exports.getBiometricAvailableUserId = catchAsyncErrors(async (req, res, next) => {
  const { device } = req?.body;
  let alldeviceinfo = [];

  if (device?.brand === "Brand1") {
    alldeviceinfo = await getCommandForDeviceAIIdCheck("ID Check");
  } else if (device?.brand === "Brand2") {
    alldeviceinfo = await getCommandBiometricF51ACheck("ID Check");
  } else if (device?.brand === "Brand3") {
    alldeviceinfo = 1
    // await getCommandBiometricLinkIdCheck("ID Check");
  }
  if (alldeviceinfo) {
    return res.status(200).json({ alldeviceinfo, message: "Command executed successfully" });
  } else {
    console.log("Error removing duplicate logs:", res.message);
    return res.status(500).json({ message: "Failed to send command to device" });
  }
});

const getCommandForDeviceAIIdCheck = async (command) => {
  let commandSend = {};

  if (command === "ID Check") {
    commandSend = {
      "cmd": "getuserlist",
      "stn": true
    };
  }
  if (command === "Add User") {
    commandSend = {
      "cmd": "getuserlist",
      "stn": true
    };
  }
  const result = await sendCommandToDeviceAttendance(commandSend);
  const missing = findMissingEnrollId(result) === null ? 1 : findMissingEnrollId(result);
  return missing;
};
const getCommandBiometricF51ACheck = async (command) => {
  let commandSend = {};
  let commandName = ''
  if (command === "ID Check") {
    commandSend = {
      pass: PASSWORD,
    };
    commandName = "getDeviceInfo"
  }

  const result = await fetchRemoteControlCheck(commandSend, commandName);
  const parsedData = JSON.parse(result?.data);
  parsedData.regPowCnt += 1;
  const countresult = parsedData.regPowCnt
  return countresult;
}

function findMissingEnrollId(response) {
  const enrollIds = response.record.map(user => user.enrollid);
  const maxId = Math.max(...enrollIds);

  for (let i = 1; i <= maxId + 1; i++) {
    if (!enrollIds.includes(i)) {
      return i;
    }
  }

  return null; // no missing found (unlikely)
}








//Executing the biometric commadn to open , close , restart, reset and delete all records
exports.executeBiometricCommandExecution = catchAsyncErrors(async (req, res, next) => {
  const { biometricDeviceManagement, command, role } = req?.body;
  // console.log(biometricDeviceManagement, "biometricDeviceManagement")
const deviceIpAddress = await BiometricDeviceManagement.findOne({biometricserialno : biometricDeviceManagement?.biometricserialno})
 const deviceURL = `http://${deviceIpAddress?.biometricassignedip}`;
  /*const deviceURL = biometricDeviceManagement?.biometricserialno === "FC-8190H25031119" ? process.env.BOWER_DEVICE_URL : biometricDeviceManagement?.biometricserialno === "FC-8190H25031124" ? process.env.BOWER_DEVICE_URL2 : "";*/
  // console.log(deviceURL, "deviceURL")

  let isSuccess = false;
  if (biometricDeviceManagement?.brandname === "Brand1") {
    isSuccess = await getCommandForDeviceAI(command, biometricDeviceManagement?.command);
  } else if (biometricDeviceManagement?.brandname === "Brand2") {
    isSuccess = await getCommandBiometricF51A(command);
  } else if (biometricDeviceManagement?.brandname === "Brand3") {
    isSuccess = await getCommandBiometricLink(command);
  }
  else if (biometricDeviceManagement?.brandname === "Bowee") {
    if (!["Enable", "Disable", "Edit", "Delete"]?.includes(command)) {
      isSuccess = await getCommandBoweeBiometric(command, biometricDeviceManagement?.biometricUserIDC, deviceURL);
    }
    else if (command === "Delete") {
      isSuccess = await deleteSingleBoweeUser(biometricDeviceManagement?.biometricUserIDC, deviceURL);
    } else {
      isSuccess = await getCommandBoweeBiometricUserEdit(biometricDeviceManagement, command, role, deviceURL);
    }

  }
  if (isSuccess) {
    return res.status(200).json({ message: "Command executed successfully" });
  } else {
    return res.status(500).json({ message: "Failed to send command to device" });
  }
});


exports.getSingleUserProfileString = catchAsyncErrors(async (req, res, next) => {
  try {
    const { biometricDeviceManagement } = req.body;
        const deviceIpAddress = await BiometricDeviceManagement.findOne({biometricserialno : biometricDeviceManagement?.biometricserialno})
const deviceURL = `http://${deviceIpAddress?.biometricassignedip}`;

    let base64String;
    // console.log(biometricDeviceManagement, "biometricDeviceManagement")
    const userDetails = await getUserDetailsFromBoweeDevice(biometricDeviceManagement?.biometricUserIDC);

    if (userDetails?.Photo) {
      const URL = `${deviceURL}${userDetails.Photo}`;
      base64String = await getBase64FromImageUrl(URL);
    }

    if (base64String) {
      return res.status(200).json({ base64String, message: "Command executed successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send command to device" });
    }

  } catch (error) {
    console.error("Error in getSingleUserProfileString:", error);
    return res.status(500).json({ message: "An unexpected error occurred", error: error.message });
  }
});



const getCommandBoweeBiometricUserEdit = async (biometricDeviceManagement, command, role, deviceURL) => {
// console.log("Hitted")
  const userDetails = await getUserDetailsFromBoweeDevice(biometricDeviceManagement?.biometricUserIDC, deviceURL);
  const URL = `${deviceURL}${userDetails?.Photo}`;

  if (userDetails?.Photo) {
    const base64String = await getBase64FromImageUrl(URL);
    const roleName = command === "Edit" ? role : biometricDeviceManagement?.command?.privilegeC;
    const Username = command === "Edit" ? userDetails?.Name : biometricDeviceManagement?.command?.staffNameC;
    const PeopleJson = {
      "UserID": String(biometricDeviceManagement?.biometricUserIDC),
      "Name": Username,
      "Job": "Staff",
      "AccessType": roleName === "User"
        ? 0
        : roleName === "Administrator"
          ? 1
          : 2,
      "OpenTimes": command === "Enable" ? 65535 : command === "Disable" ? 0 : userDetails?.OpenTimes,
      "Photo": base64String
    };
// console.log(PeopleJson , deviceURL)
    const answer = await sendUserDetailsToDevice(PeopleJson, base64String , deviceURL);
    return answer; // ✅ Return here
  } else {
    return { success: false, message: "Photo not found" }; // Handle missing photo
  }
};


async function getBase64FromImageUrl(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const base64String = Buffer.from(response.data, 'binary').toString('base64');
  return base64String; // just the base64 part, no prefix
}


const getCommandBoweeBiometric = async (command, device, deviceURL) => {
  let commandSend = {};
  if (command === "Door Open") { commandSend = { "OpenDoor": true } }
  else if (command === "Remote Normal Open") { commandSend = { "KeepOpen": true }; }
  else if (command === "Remote Door Closing") { commandSend = { "CloseDoor": true }; }
  else if (command === "Remote Locking") { commandSend = { "LockDoor": true }; }
  else if (command === "Unlock") { commandSend = { "UnlockDoor": true }; }
  else if (command === "Fire Alarm") { commandSend = { "FireAlarm": true }; }
  else if (command === "Turn Off Alarm") { commandSend = { "CloseAlarm": true }; }
  else if (command === "Device Restart") { commandSend = { "Restart": true }; }
  else if (command === "Reset") { commandSend = { "Recover": true }; }

  const result = await sendCommandToBoweeDevice(commandSend, deviceURL);
  return result;
};

const getCommandForDeviceAI = async (command, exeCommand) => {
  let commandSend = {};

  if (command === "Door Open") {
    commandSend = { cmd: "opendoor", doornum: 1 };
  } else if (command === "Device Restart") {
    commandSend = { cmd: "reboot" };
  } else if (command === "Device Reset") {
    commandSend = { cmd: "initsys" };
    await deleteManyBioMetricBrands("Brand1")
  } else if (command === "Delete User Records") {
    commandSend = { cmd: "cleanuser" };
    await deleteManyBioMetricBrands("Brand1")
  } else if (command === "Delete All Logs") {
    commandSend = { cmd: "cleanlog" };
  }
  else if (["Enable", "Disable", 'Delete']?.includes(command)) {
    commandSend = exeCommand;
  }

  const result = await sendCommandToDevice(commandSend);
  return result;
};




const getCommandBiometricF51A = async (command) => {
  let commandSend = {};
  let commandName = ''
  if (command === "Door Open") {
    commandSend = {
      pass: PASSWORD,
      doorId: 1
    };
    commandName = "openDoorControl"
  }
  if (command === "Device Restart") {
    commandSend = {
      pass: PASSWORD,
    };
    commandName = "restartDevice"
  }
  if (command === "Device Reset") {
    commandSend = {
      pass: PASSWORD,
    };
    commandName = "resetDevice"
    await deleteManyBioMetricBrands("Brand2")
  }
  if (command === "Delete User Records") {
    commandSend = {
      pass: PASSWORD,
    };
    commandName = "deleteAllUserPower"
    await deleteManyBioMetricBrands("Brand2")
  }
  if (command === "Delete All Logs") {
    commandSend = {
      pass: PASSWORD,
    };
    commandName = "deleteAllLog"
  }

  const result = await fetchRemoteControl(commandSend, commandName);
  return result;
}


const getCommandBiometricLink = async (command) => {
  let interType = "";
  if (command === "Door Open") {
    interType = "31001";
  }
  if (command === "Device Restart") {
    interType = "31002";
  }
  if (command === "Device Reset") {
    interType = "31004";
    await deleteManyBioMetricBrands("Brand3")
  }
  if (command === "Shutdown") {
    interType = "31003";
  }
  if (command === "Delete User Records") {
    interType = "31005";
    await deleteManyBioMetricBrands("Brand3")
  }
  const result = await sendToDeviceGateway(interType);
  return result;

}



const deleteManyBioMetricBrands = async (brandname) => {
  try {
    const devicebrand = await BiometricDeviceManagement.findOne({ brand: brandname }).lean();

    if (!devicebrand) {
      console.warn(`No device found for brand: ${brandname}`);
      return;
    }

    const result = await Biouploaduserinfo.deleteMany({
      cloudIDC: devicebrand.biometricserialno,
    });

  } catch (error) {
    console.log("Error deleting documents:", error);
  }
};

