const Biouploaduserinfo = require("../../../model/modules/biometric/uploaduserinfo");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");
const {
  getUserListForAllUsers,
  getUserListByName,
} = require("../../../route/bowerBiometric");
const axios = require("axios");
const cron = require("node-cron");
const Visitors = require("../../../model/modules/interactors/visitor");
const nodemailer = require("nodemailer");
const User = require("../../../model/login/auth");
const AssignElevatorPort = require("../../../model/modules/biometric/elevator/AssignElevatorPortModel");
const moment = require("moment");
const {
  sendCommandToBoweeDevice,
  sendUserDetailsToDevice,
  deleteSingleBoweeUser,
  getUserDetailsFromBoweeDevice,
} = require("../../../route/bowerBiometric.js");
const mongoose = require("mongoose");
exports.getAllUploadUserInfo = catchAsyncErrors(async (req, res, next) => {
  let alluploaduserinfo;
  try {
    alluploaduserinfo = await Biouploaduserinfo.find();

    return res.status(200).json({
      alluploaduserinfo,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});
exports.getNewUserIdGlobal = catchAsyncErrors(async (req, res, next) => {
  try {
    const deviceName = req?.body?.biometricdevicename;

    if (!deviceName) {
      return res.status(400).json({
        Success: 0,
        Message: "biometricdevicename is required",
      });
    }

    const result = await Biouploaduserinfo.aggregate([
      {
        $match: {
          cloudIDC: deviceName,
          biometricUserIDC: { $regex: "^[0-9]+$" }, // ensure numeric strings only
        },
      },
      {
        $project: {
          numericUserId: { $toLong: "$biometricUserIDC" },
        },
      },
      {
        $group: {
          _id: null,
          maxUserId: { $max: "$numericUserId" },
        },
      },
    ]);
    console.log(result, "result");
    const maxUserId = result.length > 0 ? result[0].maxUserId : 0;

    return res.status(200).json({
      Success: 1,
      maxUserId,
      nextUserId: maxUserId + 1, // optional
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});

exports.getFilteredBiometricVisitorDetails = catchAsyncErrors(
  async (req, res, next) => {
    let visitorslist;
    let { devices, approval } = req?.body;
    console.log(devices, approval, "devices , approval");
    try {
      const mapStatus = {
        Enable: "Yes",
        Disable: "No",
      };

      const resultApprovalStatus = approval.map((a) => mapStatus[a]);
      visitorslist = await Biouploaduserinfo.find({
        cloudIDC: { $in: devices },
        isEnabledC: { $in: resultApprovalStatus },
        userstatus: "Visitor",
      });
      // console.log(resultApprovalStatus, "resultApprovalStatus")
      visitorslist = await Biouploaduserinfo.aggregate([
        // 1️⃣ Filter visitors based on array and status
        {
          $match: {
            cloudIDC: { $in: devices }, // devices is an array
            isEnabledC: { $in: resultApprovalStatus },
            userstatus: "Visitor",
          },
        },

        // 2️⃣ Lookup device details based on cloudIDC <-> biometric serial number
        {
          $lookup: {
            from: "biometricdevicemanagements", // collection name in lowercase/plural form
            localField: "cloudIDC", // field in Biouploaduserinfo
            foreignField: "biometricserialno", // field in BiometricDeviceManagement
            as: "deviceInfo",
          },
        },

        // 3️⃣ Unwind device info
        { $unwind: "$deviceInfo" },

        // 4️⃣ Select required output
        {
          $project: {
            _id: 1,
            visitorid: 1,
            visitorcontactnumber: 1,
            visitoremail: 1,
            visitorintime: 1,
            visitorCreatedDate: 1,
            companyname: 1,
            isEnabledC: 1,
            expirytime: 1,
            startdate: 1,
            privilegeC: 1,
            status: 1,
            isFaceEnrolledC: 1,
            staffNameC: 1,
            biometricUserIDC: 1,
            cloudIDC: 1,
            visitorpage: 1,
            visitorpagedetails: 1,
            // cloudIDC: 1,

            // Pick required fields from device meta
            company: "$deviceInfo.company",
            branch: "$deviceInfo.branch",
            unit: "$deviceInfo.unit",
            floor: "$deviceInfo.floor",
            area: "$deviceInfo.area",
          },
        },
      ]);

      return res.status(200).json({
        visitorslist,
      });
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 500));
    }
  },
);

exports.getAllUserBioInfos = catchAsyncErrors(async (req, res, next) => {
  let alluploaduserinfo;
  console.log(req.body, "req.body");
  try {
    alluploaduserinfo = await Biouploaduserinfo.find(
      { staffNameC: req?.body.username },
      {
        staffNameC: 1,
        cloudIDC: 1,
        biometricUserIDC: 1,
        privilegeC: 1,
      },
    );

    return res.status(200).json({
      alluploaduserinfo,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});

exports.addFloorWiseUserAccessInBiometricDevice = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const deviceDetails = req?.body?.user;
      const oldEditData = deviceDetails?.oldEditData;
      console.log("hitted");
      /* -------------------- PARALLEL DB FETCH -------------------- */
      const [users, biometricDevices, elevatorPorts] = await Promise.all([
        User.find(
          {
            company: { $in: deviceDetails?.company },
            branch: { $in: deviceDetails?.branch },
            unit: { $in: deviceDetails?.unit },
            team: { $in: deviceDetails?.team },
            companyname: { $in: deviceDetails?.employeename },
          },
          { _id: 0, username: 1 },
        ),

        BiometricDeviceManagement.find(
          {
            company: deviceDetails?.devicecompany,
            branch: deviceDetails?.devicebranch,
            floor: { $in: deviceDetails?.devicefloor },
            isElevator: true,
            brand: "Bowee",
          },
          { _id: 0, biometricserialno: 1 },
        ),

        AssignElevatorPort.find(
          {
            company: deviceDetails?.devicecompany,
            branch: deviceDetails?.devicebranch,
            floor: { $in: deviceDetails?.devicefloor },
          },
          { _id: 0, elevatorPort: 1 },
        ),
      ]);

      console.log(
        users?.length,
        biometricDevices?.length,
        elevatorPorts?.length,
      );
      const usernames = users?.map((u) => u.username)?.toString() || "";
      const devices =
        biometricDevices?.map((d) => d.biometricserialno)?.toString() || "";
      const ports = elevatorPorts?.map((p) => p.elevatorPort)?.toString() || "";

      const finalArray = usernames.flatMap((staffNameC) =>
        devices.map((cloudIDC) => ({
          staffNameC,
          cloudIDC,
          elevatorPorts: ports,
        })),
      );

      if (finalArray.length > 0) {
        const bulkOps = finalArray.map(
          ({ staffNameC, cloudIDC, elevatorPorts }) => ({
            updateOne: {
              filter: { staffNameC, cloudIDC },
              update: { $set: { elevatorPorts } },
              upsert: false,
            },
          }),
        );

        const result = await Biouploaduserinfo.bulkWrite(bulkOps);
        console.log("Updated elevatorPorts successfully:", result);
      }

      // if (users?.length && biometricDevices?.length && elevatorPorts?.length) {
      //   const portString = elevatorPorts.map((p) => p.elevatorPort).join(",");

      //   /* -------------------- COMMON BIOMETRIC PROCESSOR -------------------- */
      //   const processBiometric = async (users, devices, port, actionFn) => {
      //     const cache = new Map();

      //     for (const user of users) {
      //       for (const device of devices) {
      //         const payload = {
      //           username: user.username,
      //           assignedip: `http://${device.biometricassignedip}`,
      //           portnumber: port,
      //         };

      //         const cacheKey = `${payload.assignedip}|${payload.username}`;

      //         let biometricUser;
      //         if (cache.has(cacheKey)) {
      //           biometricUser = cache.get(cacheKey);
      //         } else {
      //           biometricUser = await getUserListByName(
      //             payload.assignedip,
      //             payload.username
      //           );
      //           cache.set(cacheKey, biometricUser);
      //         }

      //         if (biometricUser) {
      //           await actionFn(payload, biometricUser);
      //         }
      //       }
      //     }
      //   };

      //   /* -------------------- ADD / UPDATE FLOORS -------------------- */
      //   await processBiometric(
      //     users,
      //     biometricDevices,
      //     portString,
      //     EditBoweeFloorDetailsInBiometric
      //   );

      //   /* -------------------- DELETE FLOORS / USERS -------------------- */
      //   if (deviceDetails?.deleteemployee?.length > 0) {
      //     console.log(deviceDetails?.deleteemployee , "deviceDetails?.deleteemployee")
      //     const deleteUsers = await User.find(
      //       { companyname: { $in: deviceDetails.deleteemployee } },
      //       { _id: 0, username: 1 }
      //     );

      //     let deleteDevices = biometricDevices;
      //     let deletePorts = portString;
      //     await processBiometric(
      //       deleteUsers,
      //       deleteDevices,
      //       deletePorts,
      //       DeleteBoweeFloorDetailsInBiometric
      //     );
      //   }

      //   return res.status(200).json({
      //     message: "Biometric floor access updated successfully",
      //     summary: {
      //       usersCount: users.length,
      //       devicesCount: biometricDevices.length,
      //       ports: portString,
      //     },
      //   });
      // }
    } catch (err) {
      console.error(err);
      return next(new ErrorHandler("Records not found!", 500));
    }
  },
);

const EditBoweeFloorDetailsInBiometric = async (biodetails, userid) => {
  console.log(biodetails, userid, "Hitted");
  const userDetails = await getUserDetailsFromBoweeDevice(
    userid,
    biodetails.assignedip,
  );
  const URL = `${biodetails?.assignedip}${userDetails?.Photo}`;

  if (userDetails?.Photo) {
    const base64String = await getBase64FromImageUrl(URL);
    const PeopleJson = {
      UserID: String(userid),
      Name: biodetails?.username,
      Photo: base64String,
      Elevators: biodetails?.portnumber,
    };
    // console.log(PeopleJson , deviceURL)
    const answer = await sendUserDetailsToDevice(
      PeopleJson,
      base64String,
      biodetails.assignedip,
    );
    return answer; // ✅ Return here
  } else {
    return { success: false, message: "Photo not found" }; // Handle missing photo
  }
};
const DeleteBoweeFloorDetailsInBiometric = async (biodetails, userid) => {
  console.log(biodetails, userid, "Hitted");
  const userDetails = await getUserDetailsFromBoweeDevice(
    userid,
    biodetails.assignedip,
  );
  const URL = `${biodetails?.assignedip}${userDetails?.Photo}`;

  if (userDetails?.Photo) {
    const base64String = await getBase64FromImageUrl(URL);
    const PeopleJson = {
      UserID: String(userid),
      Name: biodetails?.username,
      Photo: base64String,
      Elevators: "",
    };
    // console.log(PeopleJson , deviceURL)
    const answer = await sendUserDetailsToDevice(
      PeopleJson,
      base64String,
      biodetails.assignedip,
    );
    return answer; // ✅ Return here
  } else {
    return { success: false, message: "Photo not found" }; // Handle missing photo
  }
};

exports.getAllUsersFromDeviceToDatabase = catchAsyncErrors(
  async (req, res, next) => {
    let { company, branch, unit, floor, area, biometricdevices } = req?.body;

    try {
      console.log(
        company,
        branch,
        unit,
        floor,
        area,
        biometricdevices,
        "company, branch, unit, floor, area, biometricdevices",
      );

      // Step 1: Get Bowee devices
      const testing = await BiometricDeviceManagement.find(
        { brand: "Bowee", biometriccommonname: { $in: biometricdevices } },
        { biometricassignedip: 1 },
      ).lean();

      const deviceUrls =
        testing?.length > 0
          ? testing.map((data) => `http://${data.biometricassignedip}`)
          : [];

      if (!deviceUrls.length) {
        console.log("⚠️ No Bowee devices found");
        return res.status(404).json({
          success: false,
          message: "No Bowee devices found",
        });
      }

      // Step 2: Fetch users & upload
      const { totalUsers, uniqueUsers } =
        await userDetailsListFromBowee(deviceUrls);
      if (uniqueUsers === 0) {
        return res.status(200).json({
          success: false,
          message: "ℹ️ All users are already added, no new users to upload",
          totalFetched: totalUsers,
          totalUploaded: 0,
        });
      }

      return res.status(200).json({
        success: true,
        message: `✅ ${uniqueUsers} unique users uploaded successfully (out of ${totalUsers} users fetched from devices)`,
        totalFetched: totalUsers,
        totalUploaded: uniqueUsers,
      });
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 500));
    }
  },
);

const userDetailsListFromBowee = async (urls) => {
  try {
    let allUsers = [];

    // Step 1: Loop through all device URLs
    for (const url of urls) {
      const result = await getUserListForAllUsers(url);
      if (result?.success && result?.DataList?.length) {
        allUsers.push(...result.DataList);
      }
    }

    // Step 2: Remove duplicates
    const uniqueLogs = await removeDuplicateLogsForUserAddition(allUsers);

    if (uniqueLogs?.length > 0) {
      await Biouploaduserinfo.insertMany(uniqueLogs, { ordered: false });
      console.log(`✅ ${uniqueLogs.length} users uploaded successfully`);
    }

    // ✅ Return counts so API can respond
    return {
      totalUsers: allUsers.length,
      uniqueUsers: uniqueLogs.length,
    };
  } catch (err) {
    console.error("Error in userDetailsListFromBowee:", err.message);
    return { totalUsers: 0, uniqueUsers: 0 };
  }
};

const removeDuplicateLogsForUserAddition = async (logs) => {
  try {
    // 1. Fetch existing logs from backend
    // const existingResponse = await axios.get(
    //     "http://192.168.1.6:7001/api/biouploaduserinfos"
    // );
    const existingResponse = await Biouploaduserinfo.find();

    const existingLogs = existingResponse || [];
    console.log(existingLogs[0], "existingLogs");

    // 2. Build a lookup set
    const existingSet = new Set(
      existingLogs.map(
        (log) => `${log.biometricUserIDC}_${log.cloudIDC}_${log.staffNameC}`,
      ),
    );

    // 3. Filter only unique logs
    const uniqueLogs = logs.filter(
      (log) =>
        !existingSet.has(
          `${log.biometricUserIDC}_${log.cloudIDC}_${log.staffNameC}`,
        ),
    );
    // console.log(uniqueLogs, "uniqueLogs")
    return uniqueLogs;
  } catch (err) {
    if (err.response) {
      console.error("Error response:", err.response.status, err.response.data);
    } else if (err.request) {
      console.error("No response received:", err.request);
    } else {
      console.error("Request setup error:", err.message);
    }
    return [];
  }
};

exports.addUploadUserInfo = catchAsyncErrors(async (req, res, next) => {
  try {
    let auploaduserinfo = await Biouploaduserinfo.create(req.body);
    return res.status(200).json({
      returnStatus: true,
      returnMessage: "Successfully Updated!!",
      returnValue: "",
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});

exports.getDownloadUserinfo = catchAsyncErrors(async (req, res, next) => {
  try {
    return res.status(200).json({
      returnStatus: true,
      returnMessage: "Successfully Updated!!",
      returnValue: req.body,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});
exports.getBiometricVisitorDeletionDetails = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { id, outTime } = req?.body;

      if (!id) {
        return next(new ErrorHandler("Missing visitor ID", 400));
      }

      // 1️⃣ Fetch visitor
      const visitorData = await Visitors.findById(id);
      if (!visitorData) {
        return next(new ErrorHandler("Visitor not found", 404));
      }

      // 2️⃣ Get all uploaded biometric users that match
      const bioUpload = await Biouploaduserinfo.find({
        status: "Visitor",
        visitorCreatedDate: visitorData.date,
        visitorintime: visitorData.intime,
        staffNameC: visitorData.visitorname,
      });

      // 3️⃣ Delete each biometric user (SEQUENTIAL – recommended)
      if (bioUpload?.length > 0) {
        for (const item of bioUpload) {
          try {
            // Get device assigned to this visitor
            const deviceIpAddress = await BiometricDeviceManagement.findOne({
              biometricserialno: item?.cloudIDC,
            });

            if (!deviceIpAddress?.biometricassignedip) {
              console.log(
                `⚠️ Device IP not found for serial: ${item?.cloudIDC}`,
              );
              continue; // skip this item
            }

            const deviceURL = `http://${deviceIpAddress.biometricassignedip}`;

            await getCommandBoweeBiometricUserDisable(item, deviceURL);
          } catch (err) {
            console.log(
              `❌ Delete failed for user ${item.biometricUserIDC}`,
              err.message,
            );
          }
        }
      }

      // 4️⃣ Return response
      return res.status(200).json({
        returnStatus: true,
        returnMessage: "Successfully Updated!!",
      });
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler("Records not found!", 500));
    }
  },
);

exports.getVisitorsEnableListDetailsById = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { ids } = req.body;

      // console.log(ids, startdate, expirytime);
      const todayData = new Date().toISOString().slice(0, 10);
      // Validate: ids must be array
      if (!Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorHandler("No visitor IDs provided", 400));
      }

      // Fetch all visitors
      const userDetails = await Biouploaduserinfo.find({ _id: { $in: ids } });

      if (!userDetails.length) {
        return next(new ErrorHandler("No visitor details found", 404));
      }

      // Process each user (parallel)
      const visitorslist = await Promise.all(
        userDetails.map(async (user) => {
          console.log(user, "user");
          if (todayData === user?.visitorCreatedDate) {
            try {
              // Get device assigned to visitor
              const deviceInfo = await BiometricDeviceManagement.findOne({
                biometricserialno: user.cloudIDC,
              });

              const deviceURL = `http://${deviceInfo?.biometricassignedip}`;

              console.log("User:", user.staffNameC);
              console.log("Device URL:", deviceURL);

              // Run biometric edit command
              const status = await getCommandBoweeBiometricUserEdit(
                user,
                user?.visitorCreatedDate,
                user?.expirytime,
                deviceURL,
              );

              return {
                user: user.staffNameC,
                deviceURL,
                success: true,
                status,
              };
            } catch (error) {
              console.error(
                "Device update failed for:",
                user.staffNameC,
                error,
              );

              return {
                user: user.staffNameC,
                success: false,
                error: error.message,
              };
            }
          } else {
            console.log("Hitted 295");

            // perform update only for this user
            await Biouploaduserinfo.updateOne(
              { _id: user._id },
              {
                $set: {
                  startdate: user?.visitorCreatedDate,
                  expirytime: user?.expirytime,
                },
              },
            );

            return {
              user: user.staffNameC,
              success: true,
              message: "Startdate/expiry updated",
            };
          }
        }),
      );

      return res.status(200).json({
        success: true,
        visitorslist,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  },
);

function getUnixFromDateTime(dateStr, timeStr) {
  try {
    // 🔹 Indefinite
    if (!dateStr || !timeStr) {
      return 0;
    }

    const [year, month, day] = dateStr.split("-").map(Number);

    const timeParts = timeStr.split(":").map(Number);
    const hour = timeParts[0] || 0;
    const minute = timeParts[1] || 0;
    const second = timeParts[2] || 0;

    const inputDate = new Date(year, month - 1, day, hour, minute, second);

    if (isNaN(inputDate.getTime())) {
      return 0;
    }

    // 🔹 Max allowed: 2099-12-31 23:59:00
    const MAX_DATE = new Date("2099-12-31T23:59:00");

    const finalDate = inputDate > MAX_DATE ? MAX_DATE : inputDate;

    return Math.floor(finalDate.getTime() / 1000);
  } catch (err) {
    console.error("getUnixFromDateTime error:", err);
    return 0;
  }
}

exports.getVisitorsEnableListDetailsByIdGlobal = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { ids } = req.body;
      console.log(ids, "iDS");
      if (!Array.isArray(ids) || !ids.length) {
        return res.status(400).json({
          success: false,
          message: "IDs array is required",
        });
      }

      // 🔹 Fetch users
      const users = await Biouploaduserinfo.find({
        _id: { $in: ids },
      });
      console.log(users?.length, "users");
      // 🔹 Update each user
      const bulkOps = users.map((user) => {
        const expirationTime = getUnixFromDateTime(
          user.visitorCreatedDate, // YYYY-MM-DD
          user.expirytime, // HH:mm / HH:mm:ss
        );

        return {
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: {
                expirationTime, // ✅ unix seconds
                startdate: user.visitorCreatedDate,
                dataupload: "new",
                isEnabledC: "Yes",
              },
            },
          },
        };
      });

      if (bulkOps.length) {
        await Biouploaduserinfo.bulkWrite(bulkOps);
      }

      return res.status(200).json({
        success: true,
        updatedCount: bulkOps.length,
      });
    } catch (err) {
      console.error("Enable visitor error:", err);
      return next(new ErrorHandler("Records not found!", 500));
    }
  },
);

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Cron Job Running at Midnight:", new Date());

    // Your async function call
    await runMidnightTask();

    console.log("Cron Job Completed");
  } catch (error) {
    console.error("Cron Job Failed:", error);
  }
});

async function runMidnightTask() {
  try {
    console.log("Running async midnight task...");

    const todayData = new Date().toISOString().slice(0, 10);

    // Fetch today's visitors
    const userDetails = await Biouploaduserinfo.find({ startdate: todayData });

    if (!userDetails.length) {
      return {
        success: false,
        message: "No visitor details found for today",
        visitorslist: [],
      };
    }

    // Process each visitor in parallel
    const visitorslist = await Promise.all(
      userDetails.map(async (user) => {
        try {
          // Get device IP
          const deviceIpAddress = await BiometricDeviceManagement.findOne({
            biometricserialno: user.cloudIDC,
          });

          const deviceURL = `http://${deviceIpAddress?.biometricassignedip}`;
          console.log("User:", user.staffNameC);
          console.log("Device URL:", deviceURL);

          // Run biometric edit command
          const result = await getCommandBoweeBiometricUserEdit(
            user,
            user.startdate,
            user.expirytime,
            deviceURL,
          );

          return {
            user: user.staffNameC,
            deviceURL,
            success: true,
            result,
          };
        } catch (error) {
          console.error("Device update failed:", user.staffNameC, error);
          return {
            user: user.staffNameC,
            success: false,
            error: error.message,
          };
        }
      }),
    );

    // Return results for cron or manual call
    return {
      success: true,
      date: todayData,
      visitorslist,
    };
  } catch (error) {
    console.error("Midnight task failed:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

function getUnixFromDateTime(dateStr, timeStr) {
  try {
    if (!dateStr || !timeStr) {
      console.warn("Missing date or time");
      return null;
    }

    // DATE: "YYYY-MM-DD"
    const [year, month, day] = dateStr.split("-").map(Number);

    // TIME: "HH:MM"
    const [hour, minute] = timeStr.split(":").map(Number);

    // Create JS date (Note: month is 0-indexed)
    const finalDate = new Date(year, month - 1, day, hour, minute, 0, 0);

    if (isNaN(finalDate.getTime())) {
      console.warn("Invalid date/time passed");
      return null;
    }

    // Convert to UNIX (seconds)
    return Math.floor(finalDate.getTime() / 1000);
  } catch (error) {
    console.error("Error in getUnixFromDateTime:", error);
    return null;
  }
}

const getCommandBoweeBiometricUserEdit = async (
  biometricDeviceManagement,
  expiryDate,
  expiryTime,
  deviceURL,
) => {
  const userDetails = await getUserDetailsFromBoweeDevice(
    biometricDeviceManagement?.biometricUserIDC,
    deviceURL,
  );

  if (!userDetails?.Photo) {
    return { success: false, message: "Photo not found" };
  }

  const URL = `${deviceURL}${userDetails.Photo}`;
  const expirationToday = getUnixFromDateTime(expiryDate, expiryTime);

  const base64String = await getBase64FromImageUrl(URL);

  const PeopleJson = {
    UserID: String(biometricDeviceManagement?.biometricUserIDC),
    Name: biometricDeviceManagement?.staffNameC,
    Job: "Staff",
    AccessType: "User",
    OpenTimes: 65535,
    ExpirationDate: expirationToday,
    Photo: base64String,
  };

  let answer = null;

  // 🔁 Try up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(
      `Attempt ${attempt} to update device for user: ${PeopleJson.UserID}`,
    );

    answer = await sendUserDetailsToDevice(PeopleJson, base64String, deviceURL);

    if (answer) {
      console.log("Success on attempt", attempt);
      break;
    }

    console.log("Failed attempt", attempt);

    // ⏳ wait 1 sec before next retry
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // ❌ If after 3 tries still failed → return failure
  if (!answer) {
    return { success: false, message: "Failed after 3 attempts" };
  }

  // ✅ Update database only on final success
  const id = biometricDeviceManagement?._id;
  const { visitoremail, staffNameC, visitorintime } = biometricDeviceManagement;
  const sentEmailTracker = new Set();
  if (!sentEmailTracker.has(visitoremail)) {
    await sendVisitorScheduleEmail({
      email: visitoremail,
      name: staffNameC,
      date: expiryDate,
      time: visitorintime,
      company: "HILIFE.AI",
    });

    // Mark email as sent for this ID
    sentEmailTracker.add(visitoremail);
  }
  await Biouploaduserinfo.findByIdAndUpdate(
    id,
    {
      $set: {
        startdate: expiryDate,
        expirytime: expiryTime,
        isEnabledC: "Yes",
      },
    },
    { new: true },
  );

  return answer;
};

const getCommandBoweeBiometricUserDisable = async (
  biometricDeviceManagement,
  deviceURL,
) => {
  // console.log("Hitted")
  const userDetails = await getUserDetailsFromBoweeDevice(
    biometricDeviceManagement?.biometricUserIDC,
    deviceURL,
  );
  const URL = `${deviceURL}${userDetails?.Photo}`;

  if (userDetails?.Photo) {
    const base64String = await getBase64FromImageUrl(URL);
    const PeopleJson = {
      UserID: String(biometricDeviceManagement?.biometricUserIDC),
      Name: biometricDeviceManagement?.staffNameC,
      Job: "Staff",
      AccessType: 0,
      OpenTimes: 0,
      Photo: base64String,
    };
    // console.log(PeopleJson , deviceURL)
    const answer = await sendUserDetailsToDevice(
      PeopleJson,
      base64String,
      deviceURL,
    );
    return answer; // ✅ Return here
  } else {
    return { success: false, message: "Photo not found" }; // Handle missing photo
  }
};

async function getBase64FromImageUrl(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const base64String = Buffer.from(response.data, "binary").toString("base64");
  return base64String; // just the base64 part, no prefix
}

async function sendVisitorScheduleEmail({ email, name, date, time, company }) {
  try {
    // Combine date & time
    const scheduleDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "cshankari27@gmail.com",
        pass: "vqhzwuklzypwruyu",
      },
    });

    // Email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visitor Schedule</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h2 {
            text-align: center;
            color: #333;
          }
          p {
            color: #555;
            line-height: 1.6;
          }
          .footer {
            margin-top: 20px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Visitor Appointment Confirmation</h2>
          
          <p>Dear <strong>${name}</strong>,</p>

          <p>
            This is a confirmation for your visit to our office.
            Please be informed that your scheduled appointment is on:
          </p>

          <p>
            <strong>Date:</strong> ${date}<br>
            <strong>Time:</strong> ${time}
          </p>

          <p>
            Kindly ensure your arrival on time. If you need any assistance, feel free to contact us.
          </p>

          <p class="footer">
            Regards,<br>
            ${company}
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: "cshankari27@gmail.com",
      to: email,
      subject: `Your Visit to ${company} - Scheduled on ${date}`,
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return { success: true, message: "Visitor schedule email sent!", info };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, message: "Failed to send email", error };
  }
}
