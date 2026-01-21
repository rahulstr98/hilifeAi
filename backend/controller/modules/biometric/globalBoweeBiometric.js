const zlib = require("zlib");
const multer = require("multer");

const BoweeDeviceCommandQueue = require("../../../model/modules/biometric/BoweeDeviceCommandQueue");
const boweeCommands = require("../../../model/modules/biometric/boweeCommands");
const Biometricattlog = require("../../../model/modules/biometric/biometricattalog");
const Biouploaduserinfo = require("../../../model/modules/biometric/uploaduserinfo");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const crypto = require("crypto");
/* ===================== MULTER ===================== */

const upload = multer({
  storage: multer.memoryStorage(),
});

const fs = require("fs");
const path = require("path");

function saveBiometricPhoto({ SN, biometricUserIDC, photoFile }) {
  const baseDir = path.resolve(process.cwd(), "uploads/biometric");
  const deviceDir = path.join(baseDir, SN);

  console.log("📁 Base directory:", baseDir);
  console.log("📁 Device directory:", deviceDir);

  fs.mkdirSync(deviceDir, { recursive: true });

  const ext = photoFile.mimetype === "image/png" ? ".png" : ".jpg";
  const fileName = `${biometricUserIDC}${ext}`;
  const filePath = path.join(deviceDir, fileName);

  console.log("🖼️ Saving photo as:", fileName);
  console.log("📍 Full file path:", filePath);

  fs.writeFileSync(filePath, photoFile.buffer);

  const exists = fs.existsSync(filePath);
  console.log("✅ File written successfully:", exists);

  const photoMD5 = crypto
    .createHash("md5")
    .update(photoFile.buffer)
    .digest("hex");

  console.log("🔑 Photo MD5:", photoMD5);
  console.log("📦 Photo size (bytes):", photoFile.size);

  return {
    imagePath: `/uploads/biometric/${SN}/${fileName}`,
    photoMD5,
    size: photoFile.size,
    mimeType: photoFile.mimetype,
  };
}

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
    date.getMonth() + 1,
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
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
    36: "Palmprint",
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
    cloudIDC: deviceSn,
  };
}
function updateUserDetailsInCollection(item, deviceSn) {
  if (!item) return null;

  return {
    biometricUserIDC: item.UserID,
    staffNameC: item.Name,
    pwdc: item.Password,
    isFaceEnrolledC: item?.Photo ? "Yes" : "No",
    PhotoMD5: item?.PhotoMD5,
    downloadedFaceTemplateN: item?.Photo ? 1 : 0,
    privilegeC: item?.AccessType === 1 ? "Administrator" : "User",
    isEnabledC: item?.OpenTimes === 65535 ? "Yes" : "No",
    cloudIDC: deviceSn,
    dataupload: "Sent",
  };
}

function isPhotoPath(photoImage) {
  if (!photoImage) return false;

  // multer saved path usually starts like this
  if (typeof photoImage === "string" && photoImage.startsWith("/uploads/")) {
    return true; // ✅ it's a path
  }

  return false; // ❌ not a path (so base64 or something else)
}

function pathToBase64Only(photoPath) {
  // photoPath example: /uploads/biometric/FC-8245H25047289/2.jpg

  // Convert to absolute path (because fs needs full path)
  const absolutePath = path.join(process.cwd(), photoPath);

  // Read file buffer
  const fileBuffer = fs.readFileSync(absolutePath);

  // Convert buffer to base64 string
  const base64Only = fileBuffer.toString("base64");

  return base64Only; // ✅ same as base64Image.split("base64,")[1]
}

function buildPhotoFields(base64Image) {
  if (!base64Image) {
    return {
      Photo: "",
    };
  }
  const isPath = isPhotoPath(base64Image);
  const cleanBase64 = base64Image.includes("base64,")
    ? base64Image.split("base64,")[1]
    : base64Image;

  const buffer = Buffer.from(cleanBase64, "base64");

  return {
    Photo: isPath ? pathToBase64Only(base64Image) : cleanBase64, // ✅ RAW BASE64 ONLY
  };
}

function buildUserDetails(users) {
  return users.map((user) => {
    console.log(user.photoImage ? true : false);
    const photoFields = buildPhotoFields(user.photoImage, user?.photoPath);

    return {
      UserID: user.biometricUserIDC,
      Code: user.biometricUserIDC,
      Name: user.staffNameC,
      AccessType: user.privilegeC === "User" ? 0 : 1,
      ExpirationDate: user.expirationTime,
      OpenTimes: user.isEnabledC === "Yes" ? 65535 : 0,
      KeepOpen: 0,
      Timegroup: 1,
      Holidays: "",
      Fingerprints: [],
      Palmveins: [],
      Elevators: user?.elevatorPorts ?? "",
      CardNum: user?.cardNum,
      ...photoFields,
    };
  });
}
/* ===================== CONTROLLERS ===================== */

/**
 * DEVICE KEEPALIVE
 */
exports.deviceKeepAlive = catchAsyncErrors(async (req, res, next) => {
  const deviceSn = req?.body?.SN;
  console.log(deviceSn, "DevicceSN");
  if (!deviceSn) {
    return res.status(400).json({ Success: 0, Message: "SN missing" });
  }

  const now = new Date();

  const formattedDate = now
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", ""); // "13-08-2025 17:14:38"

  await Biouploaduserinfo.updateOne(
    { cloudIDC: deviceSn }, // find by deviceSn
    {
      $set: {
        lastOnlineTimeC: formattedDate,
      },
      $setOnInsert: {
        cloudIDC: deviceSn, // insert only if new
      },
    },
    { upsert: true },
  );

  const command = await BoweeDeviceCommandQueue.findOne({
    deviceSn,
    status: "PENDING",
  }).sort({ createdAt: 1 });

  const response = {
    Success: 1,
    AddPeople: await hasPendingAddPeopleDatas(deviceSn),
    DeletePeople: await hasPendingDeletePeopleDatas(deviceSn),
    SyncParameter: 0,
    Remote: 0,
    UploadWorkParameter: 0,
  };
  console.log(response, "response");
  if (!command) return res.status(200).json(response);

  const flags = boweeCommands.keepAlive?.[command.commandType];
  if (flags) Object.assign(response, flags);

  return res.status(200).json(response);
});

const hasPendingDeletePeopleDatas = async (deviceSn) => {
  const count = await Biouploaduserinfo.countDocuments({
    cloudIDC: deviceSn,
    dataupload: { $in: ["new", "Sent"] },
    status: "delete",
  });

  return count > 0 ? 1 : 0;
};
const hasPendingAddPeopleDatas = async (deviceSn) => {
  const count = await Biouploaduserinfo.countDocuments({
    cloudIDC: deviceSn,
    dataupload: "new",
  });

  return count > 0 ? 1 : 0;
};

/**
 * DEVICE REMOTE COMMAND
 */
exports.deviceRemoteCommand = catchAsyncErrors(async (req, res, next) => {
  const deviceSn = req?.body?.SN;
  console.log(deviceSn, "response Remote Command");
  const command = await BoweeDeviceCommandQueue.findOne({
    deviceSn,
    commandType: "REMOTE",
    status: "PENDING",
  }).sort({ createdAt: 1 });

  if (!command) {
    return res.status(200).json({ Success: 0, RepostRecord: 0 });
  }

  const instructionDef = boweeCommands.remoteCommand?.[command.remoteAction];

  if (!instructionDef) {
    await BoweeDeviceCommandQueue.findByIdAndUpdate(command._id, {
      status: "FAILED",
    });

    return res.status(200).json({
      Success: 0,
      Message: "Invalid remoteAction",
    });
  }

  const instruction =
    typeof instructionDef === "function"
      ? instructionDef(command.payload)
      : instructionDef;

  await BoweeDeviceCommandQueue.findByIdAndUpdate(command._id, {
    status: "EXECUTED",
  });
  console.log(instruction, "instruction Remote Command");
  return res.status(200).json({
    Success: 1,
    ...instruction,
  });
});

/**
 * UPLOAD IDENTIFY RECORD
 */
exports.uploadIdentifyRecord = [
  upload.any(),
  catchAsyncErrors(async (req, res, next) => {
    const recordFile = req.files?.find(
      (f) => f.fieldname === "RecordDetail" || f.fieldname === "recordJson",
    );

    if (!recordFile?.buffer) {
      return res.json({ Success: 0, Message: "RecordDetail missing" });
    }

    const detail = await unzipRecordDetailFromBuffer(recordFile.buffer);
    const deviceSn = req?.body?.SN;

    const record = mapAttendanceRecord(detail, deviceSn);
    console.log(record, deviceSn, "uploadIdentifyRecord");
    try {
      await Biometricattlog.create(record);
    } catch (err) {
      if (err.code === 11000) {
        // duplicate → ACK device
        return res.status(200).json({ Success: 1 });
      }
      throw err;
    }

    return res.status(200).json({ Success: 0 });
  }),
];

exports.downloadPeopleList = async (req, res) => {
  const { SN, Limit } = req.body;
  console.log(req.body, "downloadPeopleList");
  if (!SN || !Limit) {
    return res.json({ Success: 0, Message: "SN or Limit missing" });
  }

  const maxLimit = Math.min(Limit, 1000);

  // 1️⃣ Get pending people for this device
  const recordDetails = await Biouploaduserinfo.find({
    cloudIDC: SN,
    dataupload: "new",
  }).limit(maxLimit);
  const records = buildUserDetails(recordDetails);
  //console.log(records, "downloadPeopleListResult");
  // 2️⃣ STOP condition (VERY IMPORTANT)
  //if (records.length === 0) {
  return res.status(200).json({
    Success: await hasPendingAddPeopleDatas(SN),
    PeopleCount: records?.length,
    PeopleList: records,
  });
  //}
};

exports.downloadPeopleListResult = async (req, res) => {
  const { SN, SuccessCount, FailCount, FailList = [] } = req.body;
  console.log(req.body, "downloadPeopleListResult");
  if (!SN) {
    return res.json({ Success: 0, Message: "SN missing" });
  }

  // 1️⃣ Mark successful imports
  if (SuccessCount > 0 && FailCount === 0) {
    await Biouploaduserinfo.updateMany(
      {
        cloudIDC: SN,
        dataupload: "new",
      },
      {
        $set: { dataupload: "Sent" },
      },
    );
  }

  if (FailCount > 0) {
    return res.json({ Success: 0, Message: "Data missing" });
  }
  // 2️⃣ Mark failed imports
  for (const fail of FailList) {
  }

  // 3️⃣ Acknowledge device
  res.json({
    Success: 0,
    Message: "Result stored",
  });
};

// Push ALl People will send the ALL the user information from the device to the Database
// Query People where inside the USER ID will be given and that will be given specific information of user from the device
//When Updated in Web it will automatically recieved with the Update Type 2
exports.pushPeople = [
  upload.any(),
  catchAsyncErrors(async (req, res, next) => {
    const { SN, PushType, UserID } = req.body;

    if (!SN || !PushType) {
      return res.json({ Success: 0, Message: "SN or PushType missing" });
    }

    const files = req.files || [];
    const detailFile = files.find((f) => f.fieldname === "Detail");
    const photoFile = files.find((f) => f.fieldname === "Photo");

    let detailJson = null;
    if (detailFile) {
      try {
        const decoded = await new Promise((resolve, reject) => {
          zlib.gunzip(detailFile.buffer, (err, buf) =>
            err ? reject(err) : resolve(buf),
          );
        });

        detailJson = JSON.parse(decoded.toString("utf-8"));
      } catch (err) {
        console.error("❌ Detail unzip / parse failed:", err);
        return res.json({ Success: 0, Message: "Detail decode failed" });
      }
    }

    const pushType = Number(PushType);
    const userIdFromDetail = detailJson?.UserID;

    const userFilter = {
      cloudIDC: SN,
      biometricUserIDC: UserID || userIdFromDetail,
    };

    const userData = detailJson
      ? updateUserDetailsInCollection(detailJson, SN)
      : null;

    let userDoc = null;
    let photoMeta = null;

    if (photoFile?.buffer) {
      photoMeta = saveBiometricPhoto({
        SN,
        biometricUserIDC: userFilter.biometricUserIDC,
        photoFile,
      });
    }
    switch (pushType) {
      /* -------- ADD -------- */
      case 1:
        if (!detailJson) {
          return res.json({ Success: 0, Message: "Detail required for Add" });
        }

        userDoc = await Biouploaduserinfo.findOne(userFilter);
        if (!userDoc) {
          userDoc = await Biouploaduserinfo.create(userData);
          console.log("➕ User added:", userFilter.biometricUserIDC);
        }
        break;

      /* -------- UPDATE (UPSERT) -------- */
      case 2:
        if (!detailJson) {
          return res.json({
            Success: 0,
            Message: "Detail required for Update",
          });
        }

        userDoc = await Biouploaduserinfo.findOneAndUpdate(
          userFilter,
          {
            $set: userData,
            $setOnInsert: {
              cloudIDC: SN,
              biometricUserIDC: userFilter.biometricUserIDC,
              createdAt: new Date(),
            },
          },
          { new: true, upsert: true },
        );

        console.log("✏️ User updated / inserted:", userFilter.biometricUserIDC);
        break;

      /* -------- DELETE -------- */
      case 3:
        await Biouploaduserinfo.findOneAndDelete(userFilter);
        console.log("🗑️ User deleted:", userFilter.biometricUserIDC);
        break;

      /* -------- QUERY (INSERT IF MISSING) -------- */
      case 4:
        if (!detailJson) {
          return res.json({
            Success: 0,
            Message: "Detail required for Query",
          });
        }

        userDoc = await Biouploaduserinfo.findOneAndUpdate(
          userFilter,
          {
            $setOnInsert: {
              ...userData,
              cloudIDC: SN,
              biometricUserIDC: userFilter.biometricUserIDC,
              createdAt: new Date(),
            },
          },
          { new: true, upsert: true },
        );

        console.log("🔍 QUERY processed:", userFilter.biometricUserIDC);
        break;

      default:
        return res.json({
          Success: 0,
          Message: "Invalid PushType",
        });
    }

    if (photoMeta && userDoc) {
      // 🔹 Update photo reference in biouploaduserinfo
      await Biouploaduserinfo.updateOne(userFilter, {
        $set: {
          photoImage: photoMeta.imagePath,
          PhotoMD5: photoMeta.photoMD5,
        },
      });

      console.log("🧩 imagePath synced into biouploaduserinfo");
    }
    return res.status(200).json({ Success: 1 });
  }),
];

exports.DeletePeopleList = catchAsyncErrors(async (req, res, next) => {
  try {
    const { SN } = req.body;
    console.log("Hitted Delete People");
    if (!SN) {
      return res.json({
        Success: 0,
        Message: "SN missing",
      });
    }

    // 1️⃣ Fetch pending delete users
    const recordDetails = await Biouploaduserinfo.find({
      cloudIDC: SN,
      dataupload: { $in: ["new", "Sent"] },
      status: "delete",
    });

    // 2️⃣ STOP condition → no records
    if (!recordDetails || recordDetails.length === 0) {
      return res.status(200).json({
        Success: 0, // ✅ STOP cycle
      });
    }

    await Biouploaduserinfo.updateMany(
      { _id: { $in: recordDetails.map((d) => d._id?.toString()) } },
      { $set: { dataupload: "deleted", status: "deleted" } },
    );

    // 3️⃣ Continue delete cycle
    return res.status(200).json({
      Success: 1,
      DeleteAll: 0,
      DeleteCount: recordDetails.length,
      DeleteList: recordDetails.map((d) => d.biometricUserIDC),
    });
  } catch (err) {
    console.error("DeletePeopleList error:", err);
    return res.status(500).json({
      Success: 0,
      Message: "Server error",
    });
  }
});

// Edge case

/*
1. check if the PhotPath variable has value , if not update
2. run daily to store if any photoPath is not available
3.need to run to get the latest userID
4.need to cconvert into base64 while sending back as edit
5.maintain an variable to create /update and delete
*/
