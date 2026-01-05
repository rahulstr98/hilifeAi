const zlib = require("zlib");
const multer = require("multer");

const BoweeDeviceCommandQueue = require("../../../model/modules/biometric/BoweeDeviceCommandQueue");
const boweeCommands = require("../../../model/modules/biometric/boweeCommands");
const Biometricattlog = require("../../../model/modules/biometric/biometricattalog");

const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

/* ===================== MULTER ===================== */

const upload = multer({
  storage: multer.memoryStorage()
});

/* ===================== HELPERS ===================== */

function unzipRecordDetailFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(buffer, (err, unzipped) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(unzipped.toString("utf8")));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function formatUnixToDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const pad = (n) => n.toString().padStart(2, "0");

  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
}

function toYMD(dateTimeStr) {
  if (!dateTimeStr) return null;
  const [d] = dateTimeStr.split(" ");
  const [dd, mm, yyyy] = d.split("-");
  return `${yyyy}-${mm}-${dd}`;
}

function getVerificationMethod(recordType) {
  const map = {
    1: "Card",
    2: "Fingerprint",
    3: "FACE",
    4: "Card + Fingerprint",
    5: "FACE + Fingerprint",
    6: "Card + FACE",
    7: "Card + Password",
    8: "FACE + Password",
    9: "Fingerprint + Password",
    10: "Password",
    32: "QR Code",
    36: "Palmprint"
  };
  return map[recordType] || "Unknown";
}

function mapAttendanceRecord(item, deviceSn) {
  if (!item) return null;

  const dateTime = formatUnixToDateTime(item.RecordDate);

  return {
    biometricUserIDC: item.UserID,
    staffNameC: item.Name,
    CardNum: item.CardNum,
    verifyC: getVerificationMethod(item.RecordType),
    clockDateTimeD: dateTime,
    clockDateOnly: toYMD(dateTime),
    recordNumber: item.RecordID,
    RecordDate: item.RecordDate,
    cloudIDC: deviceSn
  };
}

/* ===================== CONTROLLERS ===================== */

/**
 * DEVICE KEEPALIVE
 */
exports.deviceKeepAlive = catchAsyncErrors(async (req, res, next) => {
  const deviceSn = req?.body?.SN;

  if (!deviceSn) {
    return res.status(400).json({ Success: 0, Message: "SN missing" });
  }

  const command = await BoweeDeviceCommandQueue.findOne({
    deviceSn,
    status: "PENDING"
  }).sort({ createdAt: 1 });

  const response = {
    Success: 1,
    AddPeople: 0,
    DeletePeople: 0,
    SyncParameter: 0,
    Remote: 0,
    UploadWorkParameter: 0
  };

  if (!command) return res.status(200).json(response);

  const flags = boweeCommands.keepAlive?.[command.commandType];
  if (flags) Object.assign(response, flags);

  return res.status(200).json(response);
});

/**
 * DEVICE REMOTE COMMAND
 */
exports.deviceRemoteCommand = catchAsyncErrors(async (req, res, next) => {
  const deviceSn = req?.body?.SN;

  const command = await BoweeDeviceCommandQueue.findOne({
    deviceSn,
    commandType: "REMOTE",
    status: "PENDING"
  }).sort({ createdAt: 1 });

  if (!command) {
    return res.status(200).json({ Success: 0, RepostRecord: 0 });
  }

  const instructionDef =
    boweeCommands.remoteCommand?.[command.remoteAction];

  if (!instructionDef) {
    await BoweeDeviceCommandQueue.findByIdAndUpdate(command._id, {
      status: "FAILED"
    });

    return res.status(200).json({
      Success: 0,
      Message: "Invalid remoteAction"
    });
  }

  const instruction =
    typeof instructionDef === "function"
      ? instructionDef(command.payload)
      : instructionDef;

  await BoweeDeviceCommandQueue.findByIdAndUpdate(command._id, {
    status: "EXECUTED"
  });

  return res.status(200).json({
    Success: 1,
    ...instruction
  });
});

/**
 * UPLOAD IDENTIFY RECORD
 */
exports.uploadIdentifyRecord = [
  upload.any(),
  catchAsyncErrors(async (req, res, next) => {
    const recordFile = req.files?.find(
      f => f.fieldname === "RecordDetail" || f.fieldname === "recordJson"
    );

    if (!recordFile?.buffer) {
      return res.json({ Success: 0, Message: "RecordDetail missing" });
    }

    const detail = await unzipRecordDetailFromBuffer(recordFile.buffer);
    const deviceSn = req?.body?.SN;

    const record = mapAttendanceRecord(detail, deviceSn);
    try {
      await Biometricattlog.create(record);
    } catch (err) {
      if (err.code === 11000) {
        // duplicate → ACK device
        return res.status(200).json({ "Success": 1 });
      }
      throw err;
    }

    return res.status(200).json({ "Success": 0 });
  })
];
