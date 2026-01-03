const Biometricattlog = require("../../../model/modules/biometric/biometricattalog");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const Biouploaduserinfo = require("../../../model/modules/biometric/uploaduserinfo");
const User = require("../../../model/login/auth");
const { getUserClockinAndClockoutStatus } = require("../../login/auth");
const moment = require("moment");
const Designation = require("../../../model/modules/designation");
const Hirerarchi = require("../../../model/modules/setup/hierarchy");
const BiometricDeviceManagement = require("../../../model/modules/BiometricDeviceManagementModel");
const { Hierarchyfilter } = require("../../../utils/taskManagerCondition");
const BiometricUsersGrouping = require("../../../model/modules/biometric/BiometricUsersGroupingModel");
const BiometricPairedDevicesGrouping = require("../../../model/modules/biometric/BiometricPairedDevicesGroupingModel");

exports.getAllattLog = catchAsyncErrors(async (req, res, next) => {
  let allattlog;
  try {
    allattlog = await Biometricattlog.find();

    return res.status(200).json({
      allattlog,
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});

function toYMD(dateTimeStr) {
  if (!dateTimeStr) return null;

  // "17-10-2025 22:13:04"
  const [datePart] = dateTimeStr.split(" ");
  const [dd, mm, yyyy] = datePart.split("-");

  return `${yyyy}-${mm}-${dd}`;
}

exports.getAllDuplicateBiometricLogs = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const newLogs = req.body.logs;

      if (!Array.isArray(newLogs) || newLogs.length === 0) {
        return res.status(400).json({ message: "No logs provided." });
      }

      // Build bulkWrite operations with upsert:true (only insert if not existing)
      const bulkOps = newLogs.map((log) => ({
        updateOne: {
          filter: {
            clockDateTimeD: log.clockDateTimeD,
            clockDateOnly: toYMD(log.clockDateTimeD),
            staffNameC: log.staffNameC,
            biometricUserIDC: log.biometricUserIDC,
            cloudIDC: log.cloudIDC,
          },
          update: { $setOnInsert: log },
          upsert: true,
        },
      }));

      // Execute bulkWrite (ignore duplicate errors due to unique index)
      const result = await Biometricattlog.bulkWrite(bulkOps, {
        ordered: false,
      });

      // Calculate inserted documents count
      const insertedCount = result.upsertedCount || 0;

      return res.status(200).json({
        message: "Logs processed successfully.",
        insertedCount,
        totalReceived: newLogs.length,
      });
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error (should be rare with bulkWrite + unique index)
        console.log("Duplicate key detected, skipping...");
        return res.status(200).json({ message: "Duplicates skipped." });
      }

      console.error("Error inserting logs:", err);
      return next(new ErrorHandler("Failed to check for duplicates.", 500));
    }
  }
);

const typePriority = {
  individual: 1,
  department: 2,
  team: 3,
  unit: 4,
  branch: 5,
  company: 6,
};

//To get the users Attendance Reports
exports.getUsersAttendanceReports = catchAsyncErrors(async (req, res, next) => {
  let answer, usersCollection, filteredData;
  let { company, branch, usernames, type, userDates, workmode } = req.body;
  try {
    let query = {};
    if (type !== "Deactivate" && usernames?.length > 0) {
      query.username = { $in: usernames };
    }
    if (type === "Deactivate") {
      query.resonablestatus = {
        $in: [
          "Not Joined",
          "Postponed",
          "Rejected",
          "Closed",
          "Releave Employee",
          "Absconded",
          "Hold",
          "Terminate",
        ],
      };
    }
    if (type === "Deactivate" && company?.length > 0) {
      query.company = { $in: company };
    }
    if (type === "Deactivate" && branch?.length > 0) {
      query.branch = { $in: branch };
    }
    if (workmode?.length > 0) {
      query.workmode = { $in: workmode };
    }
    const userDetails = await User.find(query, { username: 1 });
    const usernamesFilter =
      userDetails?.length > 0 ? userDetails?.map((data) => data?.username) : [];

    const devicenames = await BiometricDeviceManagement.find(
      { biometricattendance: true },
      { biometricserialno: 1 }
    );
    answer = await getUserClockinAndClockoutStatus({
      employee: usernamesFilter,
      userDates: userDates,
    });
    usersCollection = await Biometricattlog.aggregate([
      {
        $match: {
          staffNameC: { $in: usernamesFilter },
          cloudIDC: {
            $in: devicenames?.map((data) => data?.biometricserialno),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staffNameC",
          foreignField: "username",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "biometricdevicemanagements",
          localField: "cloudIDC",
          foreignField: "biometricserialno",
          as: "biometricDevice",
        },
      },
      {
        $addFields: {
          empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
          company: { $arrayElemAt: ["$userDetails.company", 0] },
          branch: { $arrayElemAt: ["$userDetails.branch", 0] },
          unit: { $arrayElemAt: ["$userDetails.unit", 0] },
          team: { $arrayElemAt: ["$userDetails.team", 0] },
          department: { $arrayElemAt: ["$userDetails.department", 0] },
          companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
          biometriccommonname: {
            $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
          },
        },
      },
      {
        $project: {
          userDetails: 0,
        },
      },
    ]);

    filteredData = answer?.finaluser?.flatMap(
      ({ rowusername, shiftdate, shift }) => {
        const matchedUsers = usersCollection
          .filter((user) => user.staffNameC === rowusername) // Match staffNameC with rowusername
          .map((user) => {
            const startTime = shiftdate?.startTime
              ? new Date(shiftdate.startTime)
              : null;
            const endTime = shiftdate?.endTime
              ? new Date(shiftdate.endTime)
              : null;
            const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            const [day, month, year] = datePart.split("-");
            const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
            if (startTime && endTime && !isNaN(clockTime)) {
              if (clockTime >= startTime && clockTime <= endTime) {
                return {
                  ...user,
                  matchedShift: shiftdate,
                  attendancedate: shiftdate?.date,
                }; // Attach matched shift details
              }
            }
            return null;
          })
          .filter(Boolean);

        // **Step 3: Get previous day shift and count valid records**
        const prevShiftStart = shiftdate?.startTime
          ? new Date(shiftdate.startTime)
          : null;
        if (prevShiftStart) {
          prevShiftStart.setDate(prevShiftStart.getDate() - 1); // Move to previous day
        }

        const prevDayUsers = usersCollection
          .filter((user) => user.staffNameC === rowusername)
          .map((user) => {
            const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            const [day, month, year] = datePart.split("-");
            const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
            return clockTime;
          })
          .filter(
            (clockTime) =>
              prevShiftStart &&
              clockTime >= prevShiftStart &&
              clockTime <= shiftdate.startTime
          );

        const isPrevDayOdd = prevDayUsers.length % 2 !== 0;
        const isTodayOdd = matchedUsers.length % 2 !== 0;

        // **Step 4: Adjust if both previous and today's data are odd**
        if (isPrevDayOdd && isTodayOdd && matchedUsers.length > 0) {
          const firstEntry = matchedUsers.shift(); // Remove first element from today's list
          prevDayUsers.push(firstEntry); // Add it to previous day's records
        }

        let inTime = null;
        let outTime = null;
        let inTimeVerified = null;
        let outTimeVerified = null;

        if (matchedUsers.length > 0) {
          inTime = matchedUsers[0].clockDateTimeD; // First entry is always inTime
          inTimeVerified = matchedUsers[0].verifyC;

          if (matchedUsers.length % 2 === 0) {
            outTime = matchedUsers[matchedUsers.length - 1].clockDateTimeD; // Last entry as outTime
            outTimeVerified = matchedUsers[matchedUsers.length - 1].verifyC;
          }
        }
        return {
          shiftdate: shiftdate?.date ? shiftdate?.date : shift,
          ...(matchedUsers?.length > 0
            ? matchedUsers[0]
            : usersCollection.filter(
                (user) => user.staffNameC === rowusername
              )[0]),
          inTime: inTime ? formatToAmPm(inTime) : null,
          outTime: outTime ? formatToAmPm(outTime) : null,
          inTimeVerified: inTimeVerified,
          outTimeVerified: outTimeVerified,
        };
      }
    );

    function formatToAmPm(dateStr) {
      let [day, month, year, time] = dateStr.split(/[-\s]/);
      let formattedDate = new Date(`${year}-${month}-${day}T${time}`);
      let formattedTime = formattedDate.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      return `${day}-${month}-${year} ${formattedTime}`; // Remove space between time and AM/PM
    }

    return res.status(200).json({
      answer,
      usersCollection,
      filteredData: filteredData?.filter((data) => data?.companyname),
    });
  } catch (err) {
    console.log(err, "err");
    return next(new ErrorHandler("Records not found!", 500));
  }
});

exports.getUsersAttendanceReportsAaaJewellers = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;
    let { company, branch, usernames, type, userDates, workmode } = req.body;
    try {
      //console.log('Hitted Here')
      let query = {};
      if (type !== "Deactivate" && usernames?.length > 0) {
        query.username = { $in: usernames };
      }
      if (type === "Deactivate") {
        query.resonablestatus = {
          $in: [
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
            "Releave Employee",
            "Absconded",
            "Hold",
            "Terminate",
          ],
        };
      }
      if (type === "Deactivate" && company?.length > 0) {
        query.company = { $in: company };
      }
      if (type === "Deactivate" && branch?.length > 0) {
        query.branch = { $in: branch };
      }
      if (workmode?.length > 0) {
        query.workmode = { $in: workmode };
      }
      const userDetails = await User.find(query, { username: 1 });
      const usernamesFilter =
        userDetails?.length > 0
          ? userDetails?.map((data) => data?.username)
          : [];

      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        // 1. Match records where any attendance flag is true
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceoutwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);
      const biometricUsersGrouping = await BiometricUsersGrouping.aggregate([
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceouttwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            companyname: 1,
            type: 1,
            paireddeviceone: {
              device: "$paireddeviceone",
              attendancein: "$attendanceinone",
              attendanceout: "$attendanceoutone",
              attendanceinout: "$attendanceinoutone",
            },
            paireddevicetwo: {
              device: "$paireddevicetwo",
              attendancein: "$attendanceintwo",
              attendanceout: "$attendanceouttwo",
              attendanceinout: "$attendanceinouttwo",
            },
          },
        },
        { $unwind: "$companyname" },
        {
          $lookup: {
            from: "users",
            localField: "companyname",
            foreignField: "companyname",
            as: "userMatch",
          },
        },
        { $unwind: "$userMatch" },
        {
          $project: {
            _id: 0,
            companyname: 1,
            type: 1,
            username: "$userMatch.username",
            userId: "$userMatch._id",
            devices: [
              {
                device: "$paireddeviceone.device",
                attendancein: "$paireddeviceone.attendancein",
                attendanceout: "$paireddeviceone.attendanceout",
                attendanceinout: "$paireddeviceone.attendanceinout",
              },
              {
                device: "$paireddevicetwo.device",
                attendancein: "$paireddevicetwo.attendancein",
                attendanceout: "$paireddevicetwo.attendanceout",
                attendanceinout: "$paireddevicetwo.attendanceinout",
              },
            ],
          },
        },
        { $unwind: "$devices" },

        // ✅ Lookup device details from biometricdevicemanagements
        {
          $lookup: {
            from: "biometricdevicemanagements",
            let: { deviceName: "$devices.device" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$biometriccommonname", "$$deviceName"],
                  },
                },
              },
              {
                $project: {
                  biometricserialno: 1,
                  biometriccommonname: 1,
                  _id: 0,
                },
              },
            ],
            as: "matchedDevice",
          },
        },
        {
          $unwind: { path: "$matchedDevice", preserveNullAndEmptyArrays: true },
        }, // keep rows even if no match
        {
          $project: {
            companyname: 1,
            type: 1,
            username: 1,
            userId: 1,
            device: "$devices.device",
            attendancein: "$devices.attendancein",
            attendanceout: "$devices.attendanceout",
            attendanceinout: "$devices.attendanceinout",
            deviceserialnumber: "$matchedDevice.biometricserialno",
            //  matchedDevice: 1
          },
        },
      ]);
      //console.log(biometricUsersGrouping, "biometricUsersGrouping");

      // 1. Create a map of device serials to grouped biometric user data by username and type
      const biometricGroupingMap = {};

      for (const group of biometricUsersGrouping) {
        const {
          deviceserialnumber,
          username,
          type,
          attendancein,
          attendanceout,
          attendanceinout,
        } = group;

        if (!biometricGroupingMap[deviceserialnumber]) {
          biometricGroupingMap[deviceserialnumber] = [];
        }

        biometricGroupingMap[deviceserialnumber].push({
          usernames: username,
          type,
          indevice: attendancein,
          outdevice: attendanceout,
          inoutdevice: attendanceinout,
        });
      }

      const pairedSerials = Object.values(biometricGroupingMap)
        .flat()
        .filter(Boolean);
      let matchQuery = {
        staffNameC: { $in: usernamesFilter },
      };

      // only add condition if serialNos[0]?.serials exists and not empty
      if (serialNos?.[0]?.serials?.length > 0) {
        matchQuery.cloudIDC = { $in: serialNos[0].serials };
      }

      // only add $nin if pairedSerials has values
      if (pairedSerials?.length > 0) {
        matchQuery.cloudIDC = {
          ...(matchQuery.cloudIDC || {}),
          $nin: pairedSerials,
        };
      }
      // console.log(biometricGroupingMap, pairedSerials, "biometricGroupingMap")

      answer = await getUserClockinAndClockoutStatus({
        employee: usernamesFilter,
        userDates: userDates,
      });

      usersCollection = await Biometricattlog.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        // 🔹 Lookup pairing group based on device common name
        {
          $lookup: {
            from: "biometricpaireddevicesgroupings",
            let: {
              commonName: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$paireddeviceone", "$$commonName"] },
                      { $eq: ["$paireddevicetwo", "$$commonName"] },
                    ],
                  },
                },
              },
            ],
            as: "deviceMatched",
          },
        },
        {
          $addFields: {
            empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
            company: { $arrayElemAt: ["$userDetails.company", 0] },
            branch: { $arrayElemAt: ["$userDetails.branch", 0] },
            unit: { $arrayElemAt: ["$userDetails.unit", 0] },
            team: { $arrayElemAt: ["$userDetails.team", 0] },
            department: { $arrayElemAt: ["$userDetails.department", 0] },
            companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },

            // 🔹 Conditional assignment based on matching device
            isDeviceOne: {
              $eq: [
                { $first: "$deviceMatched.paireddeviceone" },
                { $first: "$biometricDevice.biometriccommonname" },
              ],
            },
          },
        },
        {
          $addFields: {
            indevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinone" },
                { $first: "$deviceMatched.attendanceintwo" },
              ],
            },
            outdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceoutone" },
                { $first: "$deviceMatched.attendanceouttwo" },
              ],
            },
            inoutdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinoutone" },
                { $first: "$deviceMatched.attendanceinouttwo" },
              ],
            },
          },
        },
        {
          $project: {
            userDetails: 0,
            biometricDevice: 0,
            deviceMatched: 0,
          },
        },
      ]);
      // console.log(usersCollection?.length, usersCollection[0])
      let filteredUsers = [];
      usersCollection.forEach((user) => {
        const userSerial = user.cloudIDC;
        const username = user.staffNameC;

        let matchedGroupings = [];

        // 🔎 Find all groupings that contain this username
        for (const [serial, groupings] of Object.entries(
          biometricGroupingMap
        )) {
          const userGroupings = groupings.filter((g) =>
            g.usernames.includes(username)
          );
          if (userGroupings.length > 0) {
            const groupingsWithSerial = userGroupings.map((g) => ({
              ...g,
              deviceSerial: serial,
            }));
            matchedGroupings.push(...groupingsWithSerial);
          }
        }

        if (matchedGroupings.length === 0) {
          filteredUsers.push(user);
          return;
        }

        // ✅ Only process if user's serial is one of the deviceSerials
        const matchedForUserSerial = matchedGroupings.filter(
          (g) => g.deviceSerial === userSerial
        );

        // We’ll store chosen priority once per username
        let chosenGrouping = null;

        if (matchedForUserSerial.length > 0) {
          // Group groupings by deviceSerial
          const devicePriorityMap = {};
          const deviceGroupingMap = {};

          matchedForUserSerial.forEach((g) => {
            const serial = g.deviceSerial;
            const existingType = devicePriorityMap[serial];

            if (
              !existingType ||
              typePriority[g.type] < typePriority[existingType]
            ) {
              devicePriorityMap[serial] = g.type;
              deviceGroupingMap[serial] = g; // Save full group to apply later
            }
          });

          const userDeviceTopPriorityType = devicePriorityMap[userSerial];
          chosenGrouping = deviceGroupingMap[userSerial];

          if (userDeviceTopPriorityType && chosenGrouping) {
            // Update the user's device flags ONLY for matching deviceSerial
            user.indevice = chosenGrouping.indevice ?? false;
            user.outdevice = chosenGrouping.outdevice ?? false;
            user.inoutdevice = chosenGrouping.inoutdevice ?? false;
          }
        }
        if (chosenGrouping) {
        }
        filteredUsers.push(user);
      });

      filteredData = answer?.finaluser?.flatMap(
        ({ rowusername, shiftdate, shift }) => {
          const matchedUsers = filteredUsers
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              if (!user.indevice && !user.outdevice && !user.inoutdevice) {
                return null;
              }
              const startTime = shiftdate?.startTime
                ? new Date(shiftdate.startTime)
                : null;
              const endTime = shiftdate?.endTime
                ? new Date(shiftdate.endTime)
                : null;
              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
              // console.log(moment(shiftdate.startTime).format("DD-MM-YYYY hh:mm:ss a"), "startTime");
              // console.log(moment(shiftdate.endTime).format("DD-MM-YYYY hh:mm:ss a"), "endTime");

              if (startTime && endTime && !isNaN(clockTime)) {
                if (clockTime >= startTime && clockTime <= endTime) {
                  return { ...user, clockTime };
                }
              }
              return null;
            })
            .filter(Boolean);
          // console.log(matchedUsers, "matchedUsers")

          // Categorize by device types
          const inDevices = matchedUsers.filter((d) => d.indevice);
          const outDevices = matchedUsers.filter((d) => d.outdevice);
          const inOutDevices = matchedUsers.filter((d) => d.inoutdevice);

          // Sort all by datetime
          const sortedInDevices = [...inDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const sortedOutDevices = [...outDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const sortedInOutDevices = [...inOutDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          //console.log(sortedInOutDevices?.length, "filteredUsers")
          let inTime = null;
          let outTime = null;
          let inTimeVerified = null;
          let inTimeVerifiedDevice = null;
          let outTimeVerified = null;
          let outTimeVerifiedDevice = null;

          // Determine inTime
          if (sortedInDevices.length > 0) {
            inTime = sortedInDevices[0].clockDateTimeD;
            inTimeVerified = sortedInDevices[0].verifyC;
            inTimeVerifiedDevice = sortedInDevices[0].biometriccommonname;
          } else if (sortedInOutDevices.length > 0) {
            inTime = sortedInOutDevices[0].clockDateTimeD;
            inTimeVerified = sortedInOutDevices[0].verifyC;
            inTimeVerifiedDevice = sortedInOutDevices[0].biometriccommonname;
          }

          // Determine outTime
          if (sortedOutDevices.length > 0) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const last =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];
            // console.log(last, "filteredUsers")

            if (last?.outdevice) {
              outTime = last.clockDateTimeD;
              outTimeVerified = last.verifyC;
              outTimeVerifiedDevice = last.biometriccommonname;
            }
          } else if (
            sortedInOutDevices.length > 1
            // && sortedInOutDevices.length % 2 === 0
          ) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const last =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];
            //console.log(last, "last")
            if (last?.inoutdevice) {
              outTime = last.clockDateTimeD;
              outTimeVerified = last.verifyC;
              outTimeVerifiedDevice = last.biometriccommonname;
            }
          }
          const fallbackUser = filteredUsers.find(
            (user) => user.staffNameC === rowusername
          );

          return {
            shiftdate: shiftdate?.date || shift,
            ...(matchedUsers?.length > 0 ? matchedUsers[0] : fallbackUser),
            inTime: inTime ? formatToAmPm(inTime) : null,
            outTime: outTime ? formatToAmPm(outTime) : null,
            inTimeVerified,
            inTimeVerifiedDevice,
            outTimeVerified,
            outTimeVerifiedDevice,
          };
        }
      );

      function formatToAmPm(dateStr) {
        let [day, month, year, time] = dateStr.split(/[-\s]/);
        let formattedDate = new Date(`${year}-${month}-${day}T${time}`);
        let formattedTime = formattedDate.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        return `${day}-${month}-${year} ${formattedTime}`; // Remove space between time and AM/PM
      }

      return res.status(200).json({
        answer,
        usersCollection,
        filteredData: filteredData?.filter((data) => data?.companyname),
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);



function addShiftStatus(data) {
  const groupedByDate = {};
  const userShiftStatusMap = {};
  const groupedByUser = {};

  // 1️⃣ Group data and detect shiftStatus
  data.forEach(item => {
    // ⚠️ Skip Week Off rows entirely
    if (item.shift === "Week Off") return;

    const dateKey = `${item.rowusername}_${item.shiftdate.date}`;
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(item);

    if (!groupedByUser[item.rowusername]) {
      groupedByUser[item.rowusername] = [];
    }
    groupedByUser[item.rowusername].push(item);

    // Detect shiftStatus from Main Shift
    if (!userShiftStatusMap[item.rowusername] && item.shiftMode === "Main Shift") {
      const shift = item.shift || "";
      const isDayShift = /AMto.*PM$/i.test(shift);
      userShiftStatusMap[item.rowusername] = isDayShift ? "Day Shift" : "Night Shift";
    }
  });

  // 2️⃣ Sort each user's records by start time
  Object.values(groupedByUser).forEach(userShifts => {
    userShifts.sort(
      (a, b) => new Date(a.shiftdate.orgStartTime) - new Date(b.shiftdate.orgStartTime)
    );
  });

  // 3️⃣ Final mapping
  return data.map(item => {
    // ⚠️ Skip all calculations for Week Off
    if (item.shift === "Week Off") {
      return {
        ...item,
        shiftStatus: "",
        hoursDifference: 0,
        nightShiftDifference: 0,
        nightShiftGapHours: 0
      };
    }

    const dateKey = `${item.rowusername}_${item.shiftdate.date}`;
    const shifts = groupedByDate[dateKey] || [];
    const userShifts = groupedByUser[item.rowusername] || [];

    let hoursDifference = 0;
    let nightShiftDifference = 0;
    let nightShiftGapHours = 0;

    // 🔹 SAME-DATE double shift calculation
    if (shifts.length === 2) {
      shifts.sort(
        (a, b) =>
          new Date(a.shiftdate.orgStartTime) - new Date(b.shiftdate.orgStartTime)
      );

      const firstEnd = new Date(shifts[0].shiftdate.orgEndTime);
      const secondStart = new Date(shifts[1].shiftdate.orgStartTime);
console.log(shifts ,firstEnd?.toString() , secondStart?.toString())
      let diffMs = secondStart - firstEnd;
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

      hoursDifference = +(diffMs / (1000 * 60 * 60)).toFixed(2);
    }

    // 🌙 EXISTING NIGHT SHIFT cross-date calculation
    if (userShiftStatusMap[item.rowusername] === "Night Shift") {
      const index = userShifts.findIndex(u => u.id === item.id);

      if (index > 0) {
        const prevShift = userShifts[index - 1];

        const prevOutTime = new Date(prevShift.shiftdate.orgEndTime);
        const presentInTime = new Date(item.shiftdate.orgStartTime);

        if (presentInTime < prevOutTime) {
          let diffMs = prevOutTime - presentInTime;
          nightShiftDifference = +(diffMs / (1000 * 60 * 60)).toFixed(2);
        }
      }
    }

    // 🌙 NEW NIGHT SHIFT USER CALCULATION
    if (
      userShiftStatusMap[item.rowusername] === "Night Shift" &&
      item.shiftMode === "Second Shift"
    ) {
      const index = userShifts.findIndex(u => u.id === item.id);

      if (index > 0) {
        const prevShift = userShifts[index - 1];

        if (prevShift.shiftMode === "Main Shift") {
          const secondShiftStart = new Date(item.shiftdate.orgStartTime);
          const prevMainShiftEnd = new Date(prevShift.shiftdate.orgEndTime);

          const diffMs = secondShiftStart - prevMainShiftEnd;

          if (diffMs > 0) {
            nightShiftGapHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);

            // 🔹 HALF GAP ADJUSTMENT
            const halfGapMs = diffMs / 2;

            prevShift.shiftdate.endTime = new Date(
              prevMainShiftEnd.getTime() + halfGapMs
            );

            item.shiftdate.startTime = new Date(
              secondShiftStart.getTime() - halfGapMs
            );
          }
        }
      }
    }

    return {
      ...item,
      shiftStatus: userShiftStatusMap[item.rowusername] || "",
      hoursDifference,
      nightShiftDifference,
      nightShiftGapHours
    };
  });
}

function addOneSecondAndFormat(isoDate, seconds) {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  // Add 1 second
  date.setSeconds(date.getSeconds() + seconds);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${pad(date.getDate())}-${pad(
      date.getMonth() + 1
    )}-${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`
  );
}

function expandDateRange(userDates) {
  if (!userDates?.length) return [];

  // Convert DD/MM/YYYY → Date
  const toDate = (d) => {
    const [day, month, year] = d.split("/");
    return new Date(year, month - 1, day);
  };

  // Sort dates
  const dates = userDates
    .map((d) => toDate(d.formattedDate))
    .sort((a, b) => a - b);

  // Add one day before & after
  const start = new Date(dates[0]);
  start.setDate(start.getDate() - 1);

  const end = new Date(dates[dates.length - 1]);
  end.setDate(end.getDate() + 1);

  // Build full range
  const result = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    // result.push(`${dd}-${mm}-${yyyy}`);
    result.push(`${yyyy}-${mm}-${dd}`);
  }

  return result;
}

function addTwoHours(isoDate, hours, mode = "Add") {
  if (!isoDate) return null;

  const date = new Date(isoDate);

  const diff = Number(hours) || 0;

  if (mode === "Sub") {
    date.setHours(date.getHours() - diff);
  } else {
    // "Add" (default)
    date.setHours(date.getHours() + diff);
    
  }

  return date;
}

function reduceHours(inputDate, hours = 1) {
    const date = new Date(inputDate); // convert string to Date if needed
    date.setHours(date.getHours() - hours);
    return date;
}

function buildDateObject(date) {
  const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1
  ).padStart(2, '0')}/${date.getFullYear()}`;

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayCount = date.getDate();
  const shiftMode = 'Main Shift';

  const weekNo = getWeekNumberInMonth(date);
  const weekNumberInMonth =
    weekNo === 1 ? `${weekNo}st Week` :
    weekNo === 2 ? `${weekNo}nd Week` :
    weekNo === 3 ? `${weekNo}rd Week` :
    `${weekNo}th Week`;

  return { formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth };
}

function getPreviousDateObject(inputFormattedDate) {
  const [dd, mm, yyyy] = inputFormattedDate.split('/').map(Number);
  const currentDate = new Date(yyyy, mm - 1, dd);

  // 🔹 Previous day
  currentDate.setDate(currentDate.getDate() - 1);

  return buildDateObject(currentDate);
}

//To get the users Attendance Reports
exports.getUsersAttendanceReportsCheck = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;
    let { company, branch, usernames, type, userDates, workmode } = req.body;
    try {
      // console.log(userDates , "Hitted Here");
      const prevDateObj = getPreviousDateObject(userDates[0].formattedDate);
      // const prevObj = getPreviousDateObject(userDates, userDates[0].formattedDate);
      // console.log(prevDateObj);
      let query = {};
      if (type !== "Deactivate" && usernames?.length > 0) {
        query.username = { $in: usernames };
      }
      if (type === "Deactivate") {
        query.resonablestatus = {
          $in: [
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
            "Releave Employee",
            "Absconded",
            "Hold",
            "Terminate",
          ],
        };
      }
      if (type === "Deactivate" && company?.length > 0) {
        query.company = { $in: company };
      }
      if (type === "Deactivate" && branch?.length > 0) {
        query.branch = { $in: branch };
      }
      if (workmode?.length > 0) {
        query.workmode = { $in: workmode };
      }
      const userDetails = await User.find(query, { username: 1 });
      const usernamesFilter =
        userDetails?.length > 0
          ? userDetails?.map((data) => data?.username)
          : [];

      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        // 1. Match records where any attendance flag is true
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceoutwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);
      const biometricUsersGrouping = await BiometricUsersGrouping.aggregate([
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceouttwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            companyname: 1,
            type: 1,
            paireddeviceone: {
              device: "$paireddeviceone",
              attendancein: "$attendanceinone",
              attendanceout: "$attendanceoutone",
              attendanceinout: "$attendanceinoutone",
            },
            paireddevicetwo: {
              device: "$paireddevicetwo",
              attendancein: "$attendanceintwo",
              attendanceout: "$attendanceouttwo",
              attendanceinout: "$attendanceinouttwo",
            },
          },
        },
        { $unwind: "$companyname" },
        {
          $lookup: {
            from: "users",
            localField: "companyname",
            foreignField: "companyname",
            as: "userMatch",
          },
        },
        { $unwind: "$userMatch" },
        {
          $project: {
            _id: 0,
            companyname: 1,
            type: 1,
            username: "$userMatch.username",
            userId: "$userMatch._id",
            devices: [
              {
                device: "$paireddeviceone.device",
                attendancein: "$paireddeviceone.attendancein",
                attendanceout: "$paireddeviceone.attendanceout",
                attendanceinout: "$paireddeviceone.attendanceinout",
              },
              {
                device: "$paireddevicetwo.device",
                attendancein: "$paireddevicetwo.attendancein",
                attendanceout: "$paireddevicetwo.attendanceout",
                attendanceinout: "$paireddevicetwo.attendanceinout",
              },
            ],
          },
        },
        { $unwind: "$devices" },

        // ✅ Lookup device details from biometricdevicemanagements
        {
          $lookup: {
            from: "biometricdevicemanagements",
            let: { deviceName: "$devices.device" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$biometriccommonname", "$$deviceName"],
                  },
                },
              },
              {
                $project: {
                  biometricserialno: 1,
                  biometriccommonname: 1,
                  _id: 0,
                },
              },
            ],
            as: "matchedDevice",
          },
        },
        {
          $unwind: { path: "$matchedDevice", preserveNullAndEmptyArrays: true },
        }, // keep rows even if no match
        {
          $project: {
            companyname: 1,
            type: 1,
            username: 1,
            userId: 1,
            device: "$devices.device",
            attendancein: "$devices.attendancein",
            attendanceout: "$devices.attendanceout",
            attendanceinout: "$devices.attendanceinout",
            deviceserialnumber: "$matchedDevice.biometricserialno",
            //  matchedDevice: 1
          },
        },
      ]);

      // 1. Create a map of device serials to grouped biometric user data by username and type
      const biometricGroupingMap = {};
      for (const group of biometricUsersGrouping) {
        const {
          deviceserialnumber,
          username,
          type,
          attendancein,
          attendanceout,
          attendanceinout,
        } = group;

        if (!biometricGroupingMap[deviceserialnumber]) {
          biometricGroupingMap[deviceserialnumber] = [];
        }

        biometricGroupingMap[deviceserialnumber].push({
          usernames: username,
          type,
          indevice: attendancein,
          outdevice: attendanceout,
          inoutdevice: attendanceinout,
        });
      }
      const pairedSerials = Object.values(biometricGroupingMap)
        .flat()
        .filter(Boolean);
      let matchQuery = {
        staffNameC: { $in: usernamesFilter },
      };

      // only add condition if serialNos[0]?.serials exists and not empty
      if (serialNos?.[0]?.serials?.length > 0) {
        matchQuery.cloudIDC = { $in: serialNos[0].serials };
      }

      // only add $nin if pairedSerials has values
      if (pairedSerials?.length > 0) {
        matchQuery.cloudIDC = {
          ...(matchQuery.cloudIDC || {}),
          $nin: pairedSerials,
        };
      }
      const resultDate = expandDateRange(userDates);
      answer = await getUserClockinAndClockoutStatus({
        employee: usernamesFilter,
        userDates: [prevDateObj , ...userDates],
        // userDates: userDates,
      });
      // console.log(answer?.finaluser , "nswer?.finaluser")
      const resultShiftValues = addShiftStatus(answer?.finaluser);
      usersCollection = await Biometricattlog.aggregate([
        {
          $match: {
            ...matchQuery,
            clockDateOnly: { $in: resultDate },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        // 🔹 Lookup pairing group based on device common name
        {
          $lookup: {
            from: "biometricpaireddevicesgroupings",
            let: {
              commonName: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$paireddeviceone", "$$commonName"] },
                      { $eq: ["$paireddevicetwo", "$$commonName"] },
                    ],
                  },
                },
              },
            ],
            as: "deviceMatched",
          },
        },
        {
          $addFields: {
            empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
            company: { $arrayElemAt: ["$userDetails.company", 0] },
            branch: { $arrayElemAt: ["$userDetails.branch", 0] },
            unit: { $arrayElemAt: ["$userDetails.unit", 0] },
            team: { $arrayElemAt: ["$userDetails.team", 0] },
            department: { $arrayElemAt: ["$userDetails.department", 0] },
            companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },

            // 🔹 Conditional assignment based on matching device
            isDeviceOne: {
              $eq: [
                { $first: "$deviceMatched.paireddeviceone" },
                { $first: "$biometricDevice.biometriccommonname" },
              ],
            },
          },
        },
        {
          $addFields: {
            indevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinone" },
                { $first: "$deviceMatched.attendanceintwo" },
              ],
            },
            outdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceoutone" },
                { $first: "$deviceMatched.attendanceouttwo" },
              ],
            },
            inoutdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinoutone" },
                { $first: "$deviceMatched.attendanceinouttwo" },
              ],
            },
          },
        },
        //         {
        //   $project: {
        //     clockDateOnly: 1,
        //     clockDateTimeD: 1,
        //     staffNameC: 1,
        //     cloudIDC: 1,
        //     empcode: 1,
        //     company: 1,
        //     branch: 1,
        //     unit: 1,
        //     team: 1,
        //     department: 1,
        //     companyname: 1,
        //     indevice: 1,
        //     outdevice: 1,
        //     inoutdevice: 1,
        //     _id: 1
        //   }
        // }
        {
          $project: {
            userDetails: 0,
            biometricDevice: 0,
            deviceMatched: 0,
          },
        },
      ]);
      const VariableCheck = usersCollection?.map(
        (data, index) =>
          `${index + 1}-${data?.biometriccommonname}-${data?.cloudIDC}-${
            data?.indevice
          }-${data?.outdevice}--${data?.inoutdevice}-${data?.clockDateTimeD}`
      );
      let filteredUsers = [];
      usersCollection.forEach((user) => {
        const userSerial = user.cloudIDC;
        const username = user.staffNameC;

        let matchedGroupings = [];

        // 🔎 Find all groupings that contain this username
        for (const [serial, groupings] of Object.entries(
          biometricGroupingMap
        )) {
          const userGroupings = groupings.filter((g) =>
            g.usernames.includes(username)
          );
          if (userGroupings.length > 0) {
            const groupingsWithSerial = userGroupings.map((g) => ({
              ...g,
              deviceSerial: serial,
            }));
            matchedGroupings.push(...groupingsWithSerial);
          }
        }

        if (matchedGroupings.length === 0) {
          filteredUsers.push(user);
          return;
        }

        // ✅ Only process if user's serial is one of the deviceSerials
        const matchedForUserSerial = matchedGroupings.filter(
          (g) => g.deviceSerial === userSerial
        );

        // We’ll store chosen priority once per username
        let chosenGrouping = null;

        if (matchedForUserSerial.length > 0) {
          // Group groupings by deviceSerial
          const devicePriorityMap = {};
          const deviceGroupingMap = {};

          matchedForUserSerial.forEach((g) => {
            const serial = g.deviceSerial;
            const existingType = devicePriorityMap[serial];

            if (
              !existingType ||
              typePriority[g.type] < typePriority[existingType]
            ) {
              devicePriorityMap[serial] = g.type;
              deviceGroupingMap[serial] = g; // Save full group to apply later
            }
          });

          const userDeviceTopPriorityType = devicePriorityMap[userSerial];
          chosenGrouping = deviceGroupingMap[userSerial];

          if (userDeviceTopPriorityType && chosenGrouping) {
            // Update the user's device flags ONLY for matching deviceSerial
            user.indevice = chosenGrouping.indevice ?? false;
            user.outdevice = chosenGrouping.outdevice ?? false;
            user.inoutdevice = chosenGrouping.inoutdevice ?? false;
          }
        }
        if (chosenGrouping) {
        }
        filteredUsers.push(user);
      });
      const shiftKeyCount = {};

      resultShiftValues.forEach((item) => {
        const key = `${item.rowusername}_${item.rowformattedDate}`;
        shiftKeyCount[key] = (shiftKeyCount[key] || 0) + 1;
      });
      const hasTwoShifts = (rowusername, rowformattedDate) => {
        const key = `${rowusername}_${rowformattedDate}`;
        return shiftKeyCount[key] > 1;
      };

      console.log( resultShiftValues?.filter(data => data?.rowformattedDate !== prevDateObj?.formattedDate), 'resultShiftValues')

      // filteredData = [resultShiftValues[0]].flatMap(
      filteredData = resultShiftValues?.filter(data => data?.rowformattedDate !== prevDateObj?.formattedDate)?.flatMap(
        ({
          rowusername,
          shiftdate,
          shift,
          shiftMode,
          shifttype,
          rowformattedDate,
          shiftStatus,
          hoursDifference,
        }) => {
          const matchedUsers = filteredUsers
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              const isDoubleShift = hasTwoShifts(rowusername, rowformattedDate);
              if (!user.indevice && !user.outdevice && !user.inoutdevice) {
                return null;
              }
              let startTime = null;
              let endTime = null;
              if (isDoubleShift) {
                if (shiftStatus === "Day Shift" && shiftMode === "Main Shift") {
                  startTime = shiftdate?.startTime;
                  endTime = addTwoHours(
                    shiftdate?.orgEndTime,
                    hoursDifference,
                    "Add"
                  );
                } else if (
                  shiftStatus === "Day Shift" &&
                  shiftMode === "Second Shift"
                ) {

                  startTime = addTwoHours(
                    shiftdate?.orgStartTime,
                    hoursDifference,
                    "Sub"
                  );
                  endTime = shiftdate?.endTime;

                } else if (
                  shiftStatus === "Night Shift" &&
                  shiftMode === "Main Shift"
                ) {
                  startTime = addTwoHours(
                    shiftdate?.orgStartTime,
                    hoursDifference,
                    "Sub"
                  );
                  endTime = shiftdate?.endTime;
                   //console.log(shiftStatus ,shiftMode , rowformattedDate ,hoursDifference,shiftdate?.orgStartTime, "endTime")

                } else if (
                  shiftStatus === "Night Shift" &&
                  shiftMode === "Second Shift"
                ) {
                  startTime = shiftdate?.startTime;
                  endTime = addTwoHours(
                    shiftdate?.orgEndTime,
                    hoursDifference,
                    "Add"
                  );
                }
              } else {
                startTime = shiftdate?.startTime
                  ? new Date(shiftdate.startTime)
                  : null;
                endTime = shiftdate?.endTime
                  ? new Date(shiftdate.endTime)
                  : null;
              }

              
              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);

              if (startTime && endTime && !isNaN(clockTime)) {
                if (clockTime >= startTime && clockTime <= endTime) {
                  return { ...user, clockTime };
                }
              }
              return null;
            })
            .filter(Boolean);

          // console.log(matchedUsers , "matchedUsers")
          // Categorize by device types
          const isDoubleShift = hasTwoShifts(rowusername, rowformattedDate);
          const inDevices = matchedUsers.filter((d) => d.indevice);
          const outDevices = matchedUsers.filter((d) => d.outdevice);
          const inOutDevices = matchedUsers.filter((d) => d.inoutdevice);

          // Sort all by datetime
          const sortedInDevices = [...inDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const sortedOutDevices = [...outDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const sortedInOutDevices = [...inOutDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          let inTime = null;
          let outTime = null;
          let inTimeVerified = null;
          let inTimeVerifiedDevice = null;
          let outTimeVerified = null;
          let outTimeVerifiedDevice = null;

          // Determine inTime
          if (!isDoubleShift && sortedInDevices.length > 0) {
            inTime = sortedInDevices[0].clockDateTimeD;
            inTimeVerified = sortedInDevices[0].verifyC;
            inTimeVerifiedDevice = sortedInDevices[0].biometriccommonname;
          } else if (!isDoubleShift && sortedInOutDevices.length > 0) {
            inTime = sortedInOutDevices[0].clockDateTimeD;
            inTimeVerified = sortedInOutDevices[0].verifyC;
            inTimeVerifiedDevice = sortedInOutDevices[0].biometriccommonname;
          } else if (isDoubleShift && matchedUsers?.length > 0) {
            const firstDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const firatDeviceIn = firstDeviceBasedOnTime[0];
            const firstInDevice = matchedUsers
              ?.filter((data) => data?.indevice || data?.inoutdevice)
              .sort((a, b) => new Date(a.clockTime) - new Date(b.clockTime));
            // const first = firstInDevice[firstInDevice.length - 1];
            inTimeVerified = firstInDevice[0]?.verifyC;
            inTimeVerifiedDevice = firstInDevice[0]?.biometriccommonname;
            if (shiftStatus === "Day Shift" && shiftMode === "Main Shift") {
              // console.log(shiftMode, "1");
              inTime = firstInDevice[0].clockDateTimeD;
             
            } else if (
              shiftStatus === "Day Shift" &&
              shiftMode === "Second Shift"
            ) {
              const ifInTime =
                shiftdate?.orgStartTime <
                parseDDMMYYYY(firstInDevice[0]?.clockDateTimeD)
                  ? addOneSecondAndFormat(shiftdate?.orgStartTime, 1)
                  : firstInDevice[0]?.clockDateTimeD;
              inTime = firstInDevice[0]?.indevice
                ? ifInTime
                : addOneSecondAndFormat(shiftdate?.orgStartTime, 1);
             
            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Main Shift"
            ) {
              const ifInTime =
                shiftdate?.orgStartTime <
                parseDDMMYYYY(firstInDevice[0]?.clockDateTimeD)
                  ? addOneSecondAndFormat(shiftdate?.orgStartTime, 1)
                  : firstInDevice[0]?.clockDateTimeD;
              inTime = firstInDevice[0]?.indevice
                ? ifInTime
                : addOneSecondAndFormat(shiftdate?.orgStartTime, 1);
// console.log(inTime,"3");

            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Second Shift"
            ) {
              inTime = firstInDevice[0].clockDateTimeD;
              console.log(inTime,"4" , matchedUsers , new Date(shiftdate?.orgStartTime)?.toString());
            }
          }

          // Determine outTime
          if (!isDoubleShift && sortedOutDevices.length > 0) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const last =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];

            if (last?.outdevice) {
              outTime = last.clockDateTimeD;
              outTimeVerified = last.verifyC;
              outTimeVerifiedDevice = last.biometriccommonname;
            }
          } else if (!isDoubleShift && sortedInOutDevices.length > 1) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const last =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];
            if (last?.inoutdevice) {
              outTime = last.clockDateTimeD;
              outTimeVerified = last.verifyC;
              outTimeVerifiedDevice = last.biometriccommonname;
            }
          } else if (isDoubleShift && matchedUsers?.length > 0) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const lastDeviceOut =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime?.length - 1];
            const lastOutDevice = matchedUsers
              ?.filter((data) => data?.outdevice || data?.inoutdevice)
              .sort((a, b) => new Date(a.clockTime) - new Date(b.clockTime));
            const last = lastOutDevice.length
              ? lastOutDevice[lastOutDevice.length - 1]
              : "";
            const hasOutDevice =
              lastDeviceOut?.outdevice || lastDeviceOut?.inoutdevice;
            const shiftEndTime = addOneSecondAndFormat(
              shiftdate?.orgEndTime,
              0
            );
            outTimeVerified = last?.verifyC;
            outTimeVerifiedDevice = last?.biometriccommonname;
            if (shiftStatus === "Day Shift" && shiftMode === "Main Shift") {
              outTime = hasOutDevice
                ? shiftdate?.orgEndTime >
                  parseDDMMYYYY(lastDeviceOut?.clockDateTimeD)
                  ? shiftEndTime
                  : lastDeviceOut?.clockDateTimeD
                : shiftEndTime;
              // console.log(shiftMode, "1");
            } else if (
              shiftStatus === "Day Shift" &&
              shiftMode === "Second Shift"
            ) {
              outTime =
                last &&
                reduceHours(shiftdate?.orgEndTime, 1) < parseDDMMYYYY(last?.clockDateTimeD)
                  ? last.clockDateTimeD
                  : shiftEndTime;
              // console.log(shiftMode, outTime, inTime ,"2");
            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Main Shift"
            ) {
               outTime = hasOutDevice
                ? reduceHours(shiftdate?.orgEndTime,1) >
                  parseDDMMYYYY(lastDeviceOut?.clockDateTimeD)
                  ? shiftEndTime
                  : lastDeviceOut?.clockDateTimeD
                : shiftEndTime;
              // console.log(shiftMode, "3");
            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Second Shift"
            ) {
              outTime =
                last &&
                 shiftdate?.orgEndTime < parseDDMMYYYY(last?.clockDateTimeD)
                  ? last.clockDateTimeD
                  : shiftEndTime;
              // console.log(shiftMode, "4");
            }
          }
          const fallbackUser = filteredUsers.find(
            (user) => user.staffNameC === rowusername
          );

          return {
            shiftdate: shiftdate?.date || shift,
            ...(matchedUsers?.length > 0 ? matchedUsers[0] : fallbackUser),
            inTime: inTime ? formatToAmPm(inTime) : null,
            outTime: outTime ? formatToAmPm(outTime) : null,
            inTimeVerified,
            inTimeVerifiedDevice,
            outTimeVerified,
            outTimeVerifiedDevice,
          };
        }
      );
      // console.log(filteredData?.length ,"hitted")
      function formatToAmPm(dateStr) {
        if (!dateStr) return null;
        let [day, month, year, time] = dateStr?.split(/[-\s]/);
        let formattedDate = new Date(`${year}-${month}-${day}T${time}`);
        let formattedTime = formattedDate.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        return `${day}-${month}-${year} ${formattedTime}`; // Remove space between time and AM/PM
      }

      return res.status(200).json({
        answer,
        usersCollection,
        filteredData: filteredData?.filter((data) => data?.companyname),
        VariableCheck,
        resultShiftValues,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

//To get the Unmacted users Attendance Reports
exports.getUnmatchedUsersAttendanceReports = catchAsyncErrors(
  async (req, res, next) => {
    let answer,
      usersCollection,
      filteredData = [];
    let {
      company,
      branch,
      unit,
      usernames,
      type,
      userDates,
      workmode,
      fromdate,
      todate,
    } = req.body;
    try {
      let query = {
        ...(company?.length && { company: { $in: company } }),
        ...(branch?.length && { branch: { $in: branch } }),
        ...(unit?.length && { unit: { $in: unit } }),
      };

      if (Object.keys(query).length) query.biometricattendance = true;

      const devicenames = await BiometricDeviceManagement.find(query, {
        biometricserialno: 1,
      });
      const answer = await Biouploaduserinfo.aggregate([
        {
          $match: {
            cloudIDC: {
              $in: devicenames?.map((data) => data?.biometricserialno),
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $match: {
            userDetails: { $eq: [] }, // Find records where staffNameC has no match in users collection
          },
        },
        {
          $project: {
            biometricUserIDC: 1,
            staffNameC: 1, // Only keep the usernames that didn't match
            _id: 0,
          },
        },
      ]);

      const unmatchedUsernames = answer.map((user) => user.staffNameC);
      const unmatchedUsernamesIDC = answer.map((user) => user.biometricUserIDC);

      usersCollection = await Biometricattlog.aggregate([
        {
          $match: {
            staffNameC: { $in: unmatchedUsernames },
            cloudIDC: {
              $in: devicenames?.map((data) => data?.biometricserialno),
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        {
          $addFields: {
            company: { $arrayElemAt: ["$biometricDevice.company", 0] },
            branch: { $arrayElemAt: ["$biometricDevice.branch", 0] },
            unit: { $arrayElemAt: ["$biometricDevice.unit", 0] },
            team: { $arrayElemAt: ["$biometricDevice.team", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },
          },
        },
        {
          $project: {
            userDetails: 0,
          },
        },
      ]);

      const groupedUsers = groupDataByDate(usersCollection, fromdate, todate);
      const attendanceSummary = calculateAttendance(groupedUsers);

      return res.status(200).json({
        answer: attendanceSummary,
        usersCollection,
        filteredData: groupedUsers,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

exports.getUnmatchedUsersAttendanceReportsCheck = catchAsyncErrors(
  async (req, res, next) => {
    let answer,
      usersCollection,
      filteredData = [];
    let {
      company,
      branch,
      unit,
      usernames,
      type,
      userDates,
      workmode,
      fromdate,
      todate,
    } = req.body;
    try {
      let query = {
        ...(company?.length && { company: { $in: company } }),
        ...(branch?.length && { branch: { $in: branch } }),
        ...(unit?.length && { unit: { $in: unit } }),
      };

      if (Object.keys(query).length) {
        query = {
          ...query,
          $or: [
            { attendanceinone: true },
            { attendanceoutone: true },
            { attendanceinoutone: true },
            { attendanceintwo: true },
            { attendanceoutwo: true },
            { attendanceinouttwo: true },
          ],
        };
      }

      // const devicenames = await BiometricDeviceManagement.find(query, { biometricserialno: 1 });
      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        {
          $match: query,
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);

      const answer = await Biouploaduserinfo.aggregate([
        {
          $match: {
            cloudIDC: { $in: serialNos?.[0]?.serials },
            status: { $ne: "Visitor" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $match: {
            userDetails: { $eq: [] }, // Find records where staffNameC has no match in users collection
          },
        },
        {
          $project: {
            biometricUserIDC: 1,
            staffNameC: 1, // Only keep the usernames that didn't match
            _id: 0,
          },
        },
      ]);

      // console.log(serialNos, answer?.length, 'serialNos')
      const unmatchedUsernames = answer.map((user) => user.staffNameC);
      // console.log(unmatchedUsernames, 'unmatchedUsernames')
      const unmatchedUsernamesIDC = answer.map((user) => user.biometricUserIDC);
      // const resultDate = expandDateRange(userDates);
      usersCollection = await Biometricattlog.aggregate([
        {
          $match: {
            staffNameC: { $in: unmatchedUsernames },
            cloudIDC: { $in: serialNos?.[0]?.serials },
            clockDateOnly: {
              $gte: fromdate, // "2025-10-15"
              $lte: todate, // "2025-10-17"
            },
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        {
          $lookup: {
            from: "biometricpaireddevicesgroupings",
            let: {
              commonName: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$paireddeviceone", "$$commonName"] },
                      { $eq: ["$paireddevicetwo", "$$commonName"] },
                    ],
                  },
                },
              },
            ],
            as: "deviceMatched",
          },
        },
        {
          $addFields: {
            // empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
            company: { $arrayElemAt: ["$biometricDevice.company", 0] },
            branch: { $arrayElemAt: ["$biometricDevice.branch", 0] },
            unit: { $arrayElemAt: ["$biometricDevice.unit", 0] },
            floor: { $arrayElemAt: ["$biometricDevice.floor", 0] },
            area: { $arrayElemAt: ["$biometricDevice.area", 0] },
            // companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },

            // 🔹 Conditional assignment based on matching device
            isDeviceOne: {
              $eq: [
                { $first: "$deviceMatched.paireddeviceone" },
                { $first: "$biometricDevice.biometriccommonname" },
              ],
            },
          },
        },
        {
          $addFields: {
            indevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinone" },
                { $first: "$deviceMatched.attendanceintwo" },
              ],
            },
            outdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceoutone" },
                { $first: "$deviceMatched.attendanceouttwo" },
              ],
            },
            inoutdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinoutone" },
                { $first: "$deviceMatched.attendanceinouttwo" },
              ],
            },
          },
        },
        {
          $project: {
            // userDetails: 0,
            biometricDevice: 0,
            deviceMatched: 0,
          },
        },
      ]);

      const groupedUsers = groupDataByDate(usersCollection, fromdate, todate);

      const attendanceSummary = calculateAttendanceCheck(groupedUsers);

      return res.status(200).json({
        answer: attendanceSummary,
        usersCollection,
        filteredData: groupedUsers,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);
exports.getBiometricVisitorsAttendanceReport = catchAsyncErrors(
  async (req, res, next) => {
    let answer,
      usersCollection,
      filteredData = [];
    let {
      company,
      branch,
      unit,
      usernames,
      type,
      userDates,
      workmode,
      fromdate,
      todate,
    } = req.body;
    try {
      let query = {
        ...(company?.length && { company: { $in: company } }),
        ...(branch?.length && { branch: { $in: branch } }),
        ...(unit?.length && { unit: { $in: unit } }),
      };

      if (Object.keys(query).length) {
        query = {
          ...query,
          $or: [
            { visitorinone: true },
            { visitoroutone: true },
            { visitorinoutone: true },
            { visitorintwo: true },
            { visitoroutwo: true },
            { visitorinouttwo: true },
            { exitintwo: true },
            { exitoutwo: true },
            { exitinouttwo: true },
            { exitione: true },
            { exitoone: true },
            { exitinouone: true },
          ],
        };
      }

      // const devicenames = await BiometricDeviceManagement.find(query, { biometricserialno: 1 });
      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        {
          $match: query,
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);

      console.log(query, serialNos?.[0]?.serials, "serialNos?.[0]?.serials");
      const answer = await Biouploaduserinfo.aggregate([
        {
          $match: {
            cloudIDC: { $in: serialNos?.[0]?.serials },
            status: "Visitor",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $match: {
            userDetails: { $eq: [] }, // Find records where staffNameC has no match in users collection
          },
        },
        {
          $project: {
            biometricUserIDC: 1,
            staffNameC: 1, // Only keep the usernames that didn't match
            _id: 0,
          },
        },
      ]);

      // console.log(serialNos, answer?.length, 'serialNos')
      const unmatchedUsernames = answer.map((user) => user.staffNameC);
      // console.log(unmatchedUsernames, 'unmatchedUsernames')
      const unmatchedUsernamesIDC = answer.map((user) => user.biometricUserIDC);
      usersCollection = await Biometricattlog.aggregate([
        {
          $match: {
            staffNameC: { $in: unmatchedUsernames },
            cloudIDC: { $in: serialNos?.[0]?.serials },
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        {
          $lookup: {
            from: "biouploaduserinfos",
            let: {
              staffName: "$staffNameC",
              cloudId: "$cloudIDC",
              biometricUserId: "$biometricUserIDC",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$staffNameC", "$$staffName"] },
                      { $eq: ["$cloudIDC", "$$cloudId"] },
                      { $eq: ["$biometricUserIDC", "$$biometricUserId"] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  visitorpage: 1,
                  visitorpagedetails: 1,
                  visitorcontactnumber: 1,
                },
              },
            ],
            as: "bioUploadInfo",
          },
        },
        {
          $addFields: {
            visitorpage: { $arrayElemAt: ["$bioUploadInfo.visitorpage", 0] },
            visitorpagedetails: {
              $arrayElemAt: ["$bioUploadInfo.visitorpagedetails", 0],
            },
            visitorcontactnumber: {
              $arrayElemAt: ["$bioUploadInfo.visitorcontactnumber", 0],
            },
          },
        },
        {
          $lookup: {
            from: "biometricpaireddevicesgroupings",
            let: {
              commonName: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$paireddeviceone", "$$commonName"] },
                      { $eq: ["$paireddevicetwo", "$$commonName"] },
                    ],
                  },
                },
              },
            ],
            as: "deviceMatched",
          },
        },
        {
          $addFields: {
            company: { $arrayElemAt: ["$biometricDevice.company", 0] },
            branch: { $arrayElemAt: ["$biometricDevice.branch", 0] },
            unit: { $arrayElemAt: ["$biometricDevice.unit", 0] },
            floor: { $arrayElemAt: ["$biometricDevice.floor", 0] },
            area: { $arrayElemAt: ["$biometricDevice.area", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },

            // 🔹 Conditional assignment based on matching device
            isDeviceOne: {
              $eq: [
                { $first: "$deviceMatched.paireddeviceone" },
                { $first: "$biometricDevice.biometriccommonname" },
              ],
            },
          },
        },
        {
          $addFields: {
            indevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.visitorinone" },
                { $first: "$deviceMatched.visitorintwo" },
              ],
            },
            outdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.visitoroutone" },
                { $first: "$deviceMatched.visitorouttwo" },
              ],
            },
            inoutdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.visitorinoutone" },
                { $first: "$deviceMatched.visitorinouttwo" },
              ],
            },
          },
        },
        {
          $project: {
            biometricDevice: 0,
            deviceMatched: 0,
            bioUploadInfo: 0,
          },
        },
      ]);

      const groupedUsers = groupDataByDate(usersCollection, fromdate, todate);
      // console.log(groupedUsers[2]);
      const attendanceSummary = calculateAttendanceCheck(groupedUsers);

      return res.status(200).json({
        answer: attendanceSummary,
        usersCollection,
        filteredData: groupedUsers,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

const groupDataByDate = (data, fromDate, endDate) => {
  const fromTimestamp = new Date(fromDate + "T00:00:00Z").getTime();
  const endTimestamp = new Date(endDate + "T23:59:59Z").getTime();

  let groupedData = [];

  // Generate entries for each date within the range
  let currentDate = new Date(fromTimestamp);
  while (currentDate.getTime() <= endTimestamp) {
    let formattedDate = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
    groupedData.push({ date: formattedDate, data: [] });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Process each record in the dataset
  data.forEach((item) => {
    if (!item.clockDateTimeD) return;

    // Convert "DD-MM-YYYY HH:mm:ss" to "YYYY-MM-DD"
    const [day, month, year, time] = item.clockDateTimeD.split(/[-\s:]/);
    const formattedDate = `${year}-${month}-${day}`;

    // Find the matching date entry and push the item into it
    const dateEntry = groupedData.find((entry) => entry.date === formattedDate);
    if (dateEntry) {
      dateEntry.data.push(item);
      // Assign company, branch, and unit from the first available record
      if (!dateEntry.company) dateEntry.company = item.company || "";
      // dateEntry.privilegeC = "User";
      if (!dateEntry.branch) dateEntry.branch = item.branch || "";
      if (!dateEntry.unit) dateEntry.unit = item.unit || "";
      if (!dateEntry.floor) dateEntry.floor = item.floor || "";
      if (!dateEntry.area) dateEntry.area = item.area || "";
      if (!dateEntry.biometriccommonname)
        dateEntry.biometriccommonname = item.biometriccommonname || "";
    }
  });

  return groupedData;
};

// To get the users exit reports
exports.getUsersExitReports = catchAsyncErrors(async (req, res, next) => {
  let answer, usersCollection, filteredData;
  let { company, branch, usernames, type, userDates, workmode } = req.body;
  try {
    let query = {};
    if (type !== "Deactivate" && usernames?.length > 0) {
      query.username = { $in: usernames };
    }
    if (type === "Deactivate") {
      query.resonablestatus = {
        $in: [
          "Not Joined",
          "Postponed",
          "Rejected",
          "Closed",
          "Releave Employee",
          "Absconded",
          "Hold",
          "Terminate",
        ],
      };
    }
    if (type === "Deactivate" && company?.length > 0) {
      query.company = { $in: company };
    }
    if (type === "Deactivate" && branch?.length > 0) {
      query.branch = { $in: branch };
    }
    if (workmode?.length > 0) {
      query.workmode = { $in: workmode };
    }
    const userDetails = await User.find(query, { username: 1 });
    const usernamesFilter =
      userDetails?.length > 0 ? userDetails?.map((data) => data?.username) : [];
    const devicenames = await BiometricDeviceManagement.find(
      { biometricexit: true },
      { biometricserialno: 1 }
    );
    answer = await getUserClockinAndClockoutStatus({
      employee: usernamesFilter,
      userDates: userDates,
    });
    usersCollection = await Biometricattlog.aggregate([
      {
        $match: {
          staffNameC: { $in: usernamesFilter },
          cloudIDC: {
            $in: devicenames?.map((data) => data?.biometricserialno),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staffNameC",
          foreignField: "username",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "biometricdevicemanagements",
          localField: "cloudIDC",
          foreignField: "biometricserialno",
          as: "biometricDevice",
        },
      },
      {
        $addFields: {
          empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
          company: { $arrayElemAt: ["$userDetails.company", 0] },
          branch: { $arrayElemAt: ["$userDetails.branch", 0] },
          unit: { $arrayElemAt: ["$userDetails.unit", 0] },
          team: { $arrayElemAt: ["$userDetails.team", 0] },
          department: { $arrayElemAt: ["$userDetails.department", 0] },
          companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
          biometriccommonname: {
            $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
          },
        },
      },
      {
        $project: {
          userDetails: 0,
        },
      },
    ]);
    filteredData = answer?.finaluser?.flatMap(
      ({ rowusername, shiftdate, shift }) => {
        const matchedUsers = usersCollection
          .filter((user) => user.staffNameC === rowusername) // Match staffNameC with rowusername
          .map((user) => {
            const startTime = shiftdate?.startTime
              ? new Date(shiftdate.startTime)
              : null;
            const endTime = shiftdate?.endTime
              ? new Date(shiftdate.endTime)
              : null;
            const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            const [day, month, year] = datePart.split("-");
            const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);

            if (startTime && endTime && !isNaN(clockTime)) {
              if (clockTime >= startTime && clockTime <= endTime) {
                return {
                  ...user,
                  matchedShift: shiftdate,
                  attendancedate: shiftdate?.date,
                }; // Attach matched shift details
              }
            }
            return null;
          })
          .filter(Boolean);

        // **Step 3: Get previous day shift and count valid records**
        const prevShiftStart = shiftdate?.startTime
          ? new Date(shiftdate.startTime)
          : null;
        if (prevShiftStart) {
          prevShiftStart.setDate(prevShiftStart.getDate() - 1); // Move to previous day
        }

        const prevDayUsers = usersCollection
          .filter((user) => user.staffNameC === rowusername)
          .map((user) => {
            const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            const [day, month, year] = datePart.split("-");
            const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
            return clockTime;
          })
          .filter(
            (clockTime) =>
              prevShiftStart &&
              clockTime >= prevShiftStart &&
              clockTime <= shiftdate.startTime
          );

        const isPrevDayOdd = prevDayUsers.length % 2 !== 0;
        const isTodayOdd = matchedUsers.length % 2 !== 0;

        // **Step 4: Adjust if both previous and today's data are odd**
        if (isPrevDayOdd && isTodayOdd && matchedUsers.length > 0) {
          const firstEntry = matchedUsers.shift(); // Remove first element from today's list
          prevDayUsers.push(firstEntry); // Add it to previous day's records
        }

        let inTime = null;
        let outTime = null;
        let inTimeVerified = null;
        let outTimeVerified = null;
        let totalHours = null;

        if (matchedUsers.length > 0) {
          inTime = matchedUsers[0].clockDateTimeD; // First entry is always inTime
          inTimeVerified = matchedUsers[0].verifyC;

          if (matchedUsers.length % 2 === 0) {
            outTime = matchedUsers[matchedUsers.length - 1].clockDateTimeD; // Last entry as outTime
            outTimeVerified = matchedUsers[matchedUsers.length - 1].verifyC;
          }
          if (inTime && outTime) {
            const parseDate = (dateString) => {
              const [datePart, timePart] = dateString.split(" ");
              const [day, month, year] = datePart.split("-");
              return new Date(`${year}-${month}-${day}T${timePart}`);
            };
            const inDate = parseDate(inTime);
            const outDate = parseDate(outTime);
            const diffMs = outDate - inDate;
            const hours = String(
              Math.floor(diffMs / (1000 * 60 * 60))
            ).padStart(2, "0");
            const minutes = String(
              Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            ).padStart(2, "0");
            const seconds = String(
              Math.floor((diffMs % (1000 * 60)) / 1000)
            ).padStart(2, "0");

            totalHours = `${hours}:${minutes}:${seconds}`;
          }
        }
        return {
          shiftdate: shiftdate?.date ? shiftdate?.date : shift,
          ...(matchedUsers?.length > 0
            ? matchedUsers[0]
            : usersCollection.filter(
                (user) => user.staffNameC === rowusername
              )[0]),
          inTime: inTime ? formatToAmPm(inTime) : null,
          outTime: outTime ? formatToAmPm(outTime) : null,
          totalHours: totalHours,
          inTimeVerified,
          outTimeVerified,
        }; // Remove null values
      }
    );

    return res.status(200).json({
      answer,
      usersCollection,
      filteredData: filteredData?.filter((data) => data?.companyname),
    });
  } catch (err) {
    console.log(err, "err");
    return next(new ErrorHandler("Records not found!", 500));
  }
});

exports.getUsersExitReportsCheck = catchAsyncErrors(async (req, res, next) => {
  let answer, usersCollection, filteredData;
  let { company, branch, usernames, type, userDates, workmode } = req.body;
  try {
    let query = {};
    if (type !== "Deactivate" && usernames?.length > 0) {
      query.username = { $in: usernames };
    }
    if (type === "Deactivate") {
      query.resonablestatus = {
        $in: [
          "Not Joined",
          "Postponed",
          "Rejected",
          "Closed",
          "Releave Employee",
          "Absconded",
          "Hold",
          "Terminate",
        ],
      };
    }
    if (type === "Deactivate" && company?.length > 0) {
      query.company = { $in: company };
    }
    if (type === "Deactivate" && branch?.length > 0) {
      query.branch = { $in: branch };
    }
    if (workmode?.length > 0) {
      query.workmode = { $in: workmode };
    }
    const userDetails = await User.find(query, { username: 1 });
    const usernamesFilter =
      userDetails?.length > 0 ? userDetails?.map((data) => data?.username) : [];

    const serialNos = await BiometricPairedDevicesGrouping.aggregate([
      // 1. Match records where any attendance flag is true
      {
        $match: {
          $or: [
            { exitinone: true },
            { exitoutone: true },
            { exitinoutone: true },
            { exitintwo: true },
            { exitoutwo: true },
            { exitinouttwo: true },
          ],
        },
      },
      {
        $project: {
          devices: ["$paireddeviceone", "$paireddevicetwo"],
        },
      },

      // 3. Flatten devices array
      { $unwind: "$devices" },

      // 4. Filter out null/empty device names
      { $match: { devices: { $ne: null, $ne: "" } } },

      // 5. Lookup in BiometricDeviceManagement
      {
        $lookup: {
          from: "biometricdevicemanagements", // check actual collection name
          localField: "devices",
          foreignField: "biometriccommonname",
          as: "matchedDevice",
        },
      },

      // 6. Flatten lookup result
      { $unwind: "$matchedDevice" },

      // 7. Collect only serial numbers (deduped)
      {
        $group: {
          _id: null,
          serials: { $addToSet: "$matchedDevice.biometricserialno" },
        },
      },

      // 8. Final projection: return only array
      {
        $project: {
          _id: 0,
          serials: 1,
        },
      },
    ]);

    const biometricUsersGrouping = await BiometricUsersGrouping.aggregate([
      {
        $match: {
          $or: [
            { exitinone: true },
            { exitoutone: true },
            { exitinoutone: true },
            { exitintwo: true },
            { exitouttwo: true },
            { exitinouttwo: true },
          ],
        },
      },
      {
        $project: {
          companyname: 1,
          type: 1,
          paireddeviceone: {
            device: "$paireddeviceone",
            exitin: "$exitinone",
            exitout: "$exitoutone",
            exitinout: "$exitinoutone",
          },
          paireddevicetwo: {
            device: "$paireddevicetwo",
            exitin: "$exitintwo",
            exitout: "$exitouttwo",
            exitinout: "$exitinouttwo",
          },
        },
      },
      { $unwind: "$companyname" },
      {
        $lookup: {
          from: "users",
          localField: "companyname",
          foreignField: "companyname",
          as: "userMatch",
        },
      },
      { $unwind: "$userMatch" },
      {
        $project: {
          _id: 0,
          companyname: 1,
          type: 1,
          username: "$userMatch.username",
          userId: "$userMatch._id",
          devices: [
            {
              device: "$paireddeviceone.device",
              exitin: "$paireddeviceone.exitin",
              exitout: "$paireddeviceone.exitout",
              exitinout: "$paireddeviceone.exitinout",
            },
            {
              device: "$paireddevicetwo.device",
              exitin: "$paireddevicetwo.exitin",
              exitout: "$paireddevicetwo.exitout",
              exitinout: "$paireddevicetwo.exitinout",
            },
          ],
        },
      },
      { $unwind: "$devices" },

      // ✅ Lookup device details from biometricdevicemanagements
      {
        $lookup: {
          from: "biometricdevicemanagements",
          let: { deviceName: "$devices.device" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$biometriccommonname", "$$deviceName"],
                },
              },
            },
            {
              $project: {
                biometricserialno: 1,
                biometriccommonname: 1,
                _id: 0,
              },
            },
          ],
          as: "matchedDevice",
        },
      },
      { $unwind: { path: "$matchedDevice", preserveNullAndEmptyArrays: true } }, // keep rows even if no match
      {
        $project: {
          companyname: 1,
          type: 1,
          username: 1,
          userId: 1,
          device: "$devices.device",
          exitin: "$devices.exitin",
          exitout: "$devices.exitout",
          exitinout: "$devices.exitinout",
          deviceserialnumber: "$matchedDevice.biometricserialno",
          //  matchedDevice: 1
        },
      },
    ]);
    // 1. Create a map of device serials to grouped biometric user data by username and type
    const biometricGroupingMap = {};

    for (const group of biometricUsersGrouping) {
      const { deviceserialnumber, username, type, exitin, exitout, exitinout } =
        group;

      if (!biometricGroupingMap[deviceserialnumber]) {
        biometricGroupingMap[deviceserialnumber] = [];
      }

      biometricGroupingMap[deviceserialnumber].push({
        usernames: username,
        type,
        indevice: exitin,
        outdevice: exitout,
        inoutdevice: exitinout,
      });
    }

    const pairedSerials = Object.values(biometricGroupingMap)
      .flat()
      .filter(Boolean);
    let matchQuery = {
      staffNameC: { $in: usernamesFilter },
    };

    // only add condition if serialNos[0]?.serials exists and not empty
    if (serialNos?.[0]?.serials?.length > 0) {
      matchQuery.cloudIDC = { $in: serialNos[0].serials };
    }

    // only add $nin if pairedSerials has values
    if (pairedSerials?.length > 0) {
      matchQuery.cloudIDC = {
        ...(matchQuery.cloudIDC || {}),
        $nin: pairedSerials,
      };
    }
    console.log(biometricGroupingMap, pairedSerials, "biometricGroupingMap");

    answer = await getUserClockinAndClockoutStatus({
      employee: usernamesFilter,
      userDates: userDates,
    });
    usersCollection = await Biometricattlog.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "staffNameC",
          foreignField: "username",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "biometricdevicemanagements",
          localField: "cloudIDC",
          foreignField: "biometricserialno",
          as: "biometricDevice",
        },
      },
      // 🔹 Lookup pairing group based on device common name
      {
        $lookup: {
          from: "biometricpaireddevicesgroupings",
          let: {
            commonName: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$paireddeviceone", "$$commonName"] },
                    { $eq: ["$paireddevicetwo", "$$commonName"] },
                  ],
                },
              },
            },
          ],
          as: "deviceMatched",
        },
      },
      {
        $addFields: {
          empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
          company: { $arrayElemAt: ["$userDetails.company", 0] },
          branch: { $arrayElemAt: ["$userDetails.branch", 0] },
          unit: { $arrayElemAt: ["$userDetails.unit", 0] },
          team: { $arrayElemAt: ["$userDetails.team", 0] },
          department: { $arrayElemAt: ["$userDetails.department", 0] },
          companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
          biometriccommonname: {
            $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
          },

          // 🔹 Conditional assignment based on matching device
          isDeviceOne: {
            $eq: [
              { $first: "$deviceMatched.paireddeviceone" },
              { $first: "$biometricDevice.biometriccommonname" },
            ],
          },
        },
      },
      {
        $addFields: {
          indevice: {
            $cond: [
              "$isDeviceOne",
              { $first: "$deviceMatched.exitinone" },
              { $first: "$deviceMatched.exitintwo" },
            ],
          },
          outdevice: {
            $cond: [
              "$isDeviceOne",
              { $first: "$deviceMatched.exitoutone" },
              { $first: "$deviceMatched.exitouttwo" },
            ],
          },
          inoutdevice: {
            $cond: [
              "$isDeviceOne",
              { $first: "$deviceMatched.exitinoutone" },
              { $first: "$deviceMatched.exitinouttwo" },
            ],
          },
        },
      },
      {
        $project: {
          userDetails: 0,
          biometricDevice: 0,
          deviceMatched: 0,
        },
      },
    ]);

    let filteredUsers = [];
    usersCollection.forEach((user) => {
      const userSerial = user.cloudIDC;
      const username = user.staffNameC;

      let matchedGroupings = [];

      // 🔎 Find all groupings that contain this username
      for (const [serial, groupings] of Object.entries(biometricGroupingMap)) {
        const userGroupings = groupings.filter((g) =>
          g.usernames.includes(username)
        );
        if (userGroupings.length > 0) {
          const groupingsWithSerial = userGroupings.map((g) => ({
            ...g,
            deviceSerial: serial,
          }));
          matchedGroupings.push(...groupingsWithSerial);
        }
      }

      if (matchedGroupings.length === 0) {
        filteredUsers.push(user);
        return;
      }

      // ✅ Only process if user's serial is one of the deviceSerials
      const matchedForUserSerial = matchedGroupings.filter(
        (g) => g.deviceSerial === userSerial
      );

      // We’ll store chosen priority once per username
      let chosenGrouping = null;

      if (matchedForUserSerial.length > 0) {
        // Group groupings by deviceSerial
        const devicePriorityMap = {};
        const deviceGroupingMap = {};

        matchedForUserSerial.forEach((g) => {
          const serial = g.deviceSerial;
          const existingType = devicePriorityMap[serial];

          if (
            !existingType ||
            typePriority[g.type] < typePriority[existingType]
          ) {
            devicePriorityMap[serial] = g.type;
            deviceGroupingMap[serial] = g; // Save full group to apply later
          }
        });

        const userDeviceTopPriorityType = devicePriorityMap[userSerial];
        chosenGrouping = deviceGroupingMap[userSerial];

        if (userDeviceTopPriorityType && chosenGrouping) {
          // Update the user's device flags ONLY for matching deviceSerial
          user.indevice = chosenGrouping.indevice ?? false;
          user.outdevice = chosenGrouping.outdevice ?? false;
          user.inoutdevice = chosenGrouping.inoutdevice ?? false;
        }
      }
      if (chosenGrouping) {
      }
      filteredUsers.push(user);
    });

    console.log(filteredUsers?.length, "filteredUsers");
    filteredData = answer?.finaluser?.flatMap(
      ({ rowusername, shiftdate, shift }) => {
        const matchedUsers = filteredUsers
          .filter((user) => user.staffNameC === rowusername) // Match staffNameC with rowusername
          .map((user) => {
            if (!user.indevice && !user.outdevice && !user.inoutdevice) {
              return null;
            }
            const startTime = shiftdate?.startTime
              ? new Date(shiftdate.startTime)
              : null;
            const endTime = shiftdate?.endTime
              ? new Date(shiftdate.endTime)
              : null;
            const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            const [day, month, year] = datePart.split("-");
            const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
            if (startTime && endTime && !isNaN(clockTime)) {
              if (clockTime >= startTime && clockTime <= endTime) {
                return {
                  ...user,
                  matchedShift: shiftdate,
                  attendancedate: shiftdate?.date,
                }; // Attach matched shift details
              }
            }
            return null;
          })
          .filter(Boolean);
        console.log(matchedUsers?.length, "matchedUsers");
        // Categorize by device types
        const inDevices = matchedUsers.filter((d) => d.indevice);
        const outDevices = matchedUsers.filter((d) => d.outdevice);
        const inOutDevices = matchedUsers.filter((d) => d.inoutdevice);

        // Sort all by datetime
        const sortedInDevices = [...inDevices].sort(
          (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
        );
        const sortedOutDevices = [...outDevices].sort(
          (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
        );
        const sortedInOutDevices = [...inOutDevices].sort(
          (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
        );
        console.log(sortedInOutDevices?.length, "filteredUsers");
        let inTime = null;
        let outTime = null;
        let inTimeVerified = null;
        let inTimeVerifiedDevice = null;
        let outTimeVerified = null;
        let outTimeVerifiedDevice = null;

        // Determine inTime
        if (sortedInDevices.length > 0) {
          inTime = sortedInDevices[0].clockDateTimeD;
          inTimeVerified = sortedInDevices[0].verifyC;
          inTimeVerifiedDevice = sortedInDevices[0].biometriccommonname;
        } else if (sortedInOutDevices.length > 0) {
          inTime = sortedInOutDevices[0].clockDateTimeD;
          inTimeVerified = sortedInOutDevices[0].verifyC;
          inTimeVerifiedDevice = sortedInOutDevices[0].biometriccommonname;
        }

        // Determine outTime
        if (sortedOutDevices.length > 0) {
          const LastDeviceBasedOnTime = matchedUsers?.sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const last = LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];
          // console.log(last, "filteredUsers")

          if (last?.outdevice) {
            outTime = last.clockDateTimeD;
            outTimeVerified = last.verifyC;
            outTimeVerifiedDevice = last.biometriccommonname;
          }
        } else if (
          sortedInOutDevices.length > 1
          // && sortedInOutDevices.length % 2 === 0
        ) {
          const LastDeviceBasedOnTime = matchedUsers?.sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const last = LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];
          console.log(last, "last");
          if (last?.inoutdevice) {
            outTime = last.clockDateTimeD;
            outTimeVerified = last.verifyC;
            outTimeVerifiedDevice = last.biometriccommonname;
          }
        }
        const fallbackUser = filteredUsers.find(
          (user) => user.staffNameC === rowusername
        );

        let totalHours = null;
        if (inTime && outTime) {
          const parseDate = (dateString) => {
            const [datePart, timePart] = dateString.split(" ");
            const [day, month, year] = datePart.split("-");
            return new Date(`${year}-${month}-${day}T${timePart}`);
          };
          const inDate = parseDate(inTime);
          const outDate = parseDate(outTime);
          const diffMs = outDate - inDate;
          const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(
            2,
            "0"
          );
          const minutes = String(
            Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          ).padStart(2, "0");
          const seconds = String(
            Math.floor((diffMs % (1000 * 60)) / 1000)
          ).padStart(2, "0");
          totalHours = `${hours}:${minutes}:${seconds}`;
        }

        return {
          shiftdate: shiftdate?.date || shift,
          ...(matchedUsers?.length > 0 ? matchedUsers[0] : fallbackUser),
          inTime: inTime ? formatToAmPm(inTime) : null,
          outTime: outTime ? formatToAmPm(outTime) : null,
          totalHours,
          inTimeVerified,
          outTimeVerified,
          inTimeVerifiedDevice,
          outTimeVerifiedDevice,
        };
      }
    );
    return res.status(200).json({
      answer,
      usersCollection,
      filteredData: filteredData?.filter((data) => data?.companyname),
    });
  } catch (err) {
    console.log(err, "err");
    return next(new ErrorHandler("Records not found!", 500));
  }
});

function formatToAmPm(dateStr) {
  let [day, month, year, time] = dateStr.split(/[-\s]/);
  let formattedDate = new Date(`${year}-${month}-${day}T${time}`);
  let formattedTime = formattedDate.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${day}-${month}-${year} ${formattedTime}`; // Remove space between time and AM/PM
}
// get week for month's start to end
function getWeekNumberInMonth(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

  // If the first day of the month is not Monday (1), calculate the adjustment
  const adjustment = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Calculate the day of the month adjusted for the starting day of the week
  const dayOfMonthAdjusted = date.getDate() + adjustment;

  // Calculate the week number based on the adjusted day of the month
  const weekNumber = Math.ceil(dayOfMonthAdjusted / 7);

  return weekNumber;
}

function isCurrentTimeInShift(startTime, endTime, dateNow) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date(dateNow);
  return now >= start && now <= end;
}

const calculateAttendance = (usersData) => {
  const parseDate = (dateTime) => {
    const [datePart, timePart] = dateTime.split(" ");
    const [day, month, year] = datePart.split("-");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  };

  function formatTime(seconds) {
    if (isNaN(seconds)) return "-";
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }
  return usersData.reduce(
    (acc, { date, company, branch, unit, biometriccommonname, data }) => {
      const groupedUsers = {};

      // Group data by username
      data.forEach((user) => {
        if (!groupedUsers[user.staffNameC]) {
          groupedUsers[user.staffNameC] = [];
        }
        groupedUsers[user.staffNameC].push(user);
      });

      // Process each user's data
      Object.entries(groupedUsers).forEach(([username, records]) => {
        records.sort(
          (a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD)
        );

        let inTime = records.length > 0 ? records[0].clockDateTimeD : null;
        let inTimeVerified = records.length > 0 ? records[0].verifyC : null;
        // let outTime = records.length > 1 ? records[records.length - 1].clockDateTimeD : null;
        let outTime =
          records.length % 2 === 0
            ? records[records.length - 1].clockDateTimeD
            : null;
        let outTimeVerified =
          records.length % 2 === 0 ? records[records.length - 1].verifyC : null;
        let totalHours = null;
        let breakHours = null;
        let biometricUserIDC =
          records.length > 0 ? records[0].biometricUserIDC : null;

        if (inTime && outTime) {
          const inDate = parseDate(inTime);
          const outDate = parseDate(outTime);
          totalHours = formatTime((outDate - inDate) / 1000);
        }

        if (records.length >= 3) {
          const secondEntry = parseDate(records[1].clockDateTimeD);
          const thirdEntry = parseDate(records[2].clockDateTimeD);
          breakHours = formatTime((thirdEntry - secondEntry) / 1000);
        }

        // Process minimal required fields
        const processedRecords = [];
        for (let i = 0; i < records.length - 1; i += 2) {
          let startTime = parseDate(records[i].clockDateTimeD);
          let endTime = parseDate(records[i + 1].clockDateTimeD);

          let breakTime = "-";
          if (i + 2 < records.length) {
            let breakStart = parseDate(records[i + 1].clockDateTimeD);
            let breakEnd = parseDate(records[i + 2].clockDateTimeD);
            breakTime = formatTime((breakEnd - breakStart) / 1000);
          }

          processedRecords.push({
            biometricUserIDC: records[i].biometricUserIDC,
            staffNameC: records[i].staffNameC,
            inTime: formatToAmPm(records[i].clockDateTimeD),
            outTime: formatToAmPm(records[i + 1].clockDateTimeD),
            totalHours: formatTime(
              (parseDate(records[i + 1].clockDateTimeD) -
                parseDate(records[i].clockDateTimeD)) /
                1000
            ),
            breakHours: breakTime,
            inTimeVerified: records[i].verifyC,
            outTimeVerified: records[i + 1].verifyC,
          });
        }

        if (records.length % 2 !== 0) {
          processedRecords.push({
            biometricUserIDC: records[records.length - 1].biometricUserIDC,
            staffNameC: records[records.length - 1].staffNameC,
            inTime: formatToAmPm(records[records.length - 1].clockDateTimeD),
            outTime: "-",
            totalHours: "-",
            breakHours: "-",
            inTimeVerified: records[records.length - 1].verifyC,
            outTimeVerified: "-",
          });
        }

        acc.push({
          date: date.split("-").reverse().join("-"),
          company,
          branch,
          unit,
          biometriccommonname,
          biometricUserIDC,
          username,
          inTime: inTime ? formatToAmPm(inTime) : null,
          outTime: outTime ? formatToAmPm(outTime) : "-", // Empty if odd count
          totalHours: outTime ? totalHours : "-", // Empty if odd count
          data: processedRecords,
          inTimeVerified,
          outTimeVerified,
        });
      });

      return acc;
    },
    []
  );
};

function parseDDMMYYYY(dateTime) {
  console.log(dateTime);
  const [datePart, timePart] = dateTime.split(" ");
  const [day, month, year] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}
const calculateAttendanceCheck = (usersData) => {
  console.log(usersData[2]?.data, "usersData");
  const parseDate = (dateTime) => {
    const [datePart, timePart] = dateTime.split(" ");
    const [day, month, year] = datePart.split("-");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "-";
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  return usersData.reduce(
    (
      acc,
      { date, company, branch, unit, floor, area, biometriccommonname, data }
    ) => {
      const groupedUsers = {};

      // Group data by username
      data.forEach((user) => {
        if (!groupedUsers[user.staffNameC]) {
          groupedUsers[user.staffNameC] = [];
        }
        groupedUsers[user.staffNameC].push(user);
      });

      Object.entries(groupedUsers).forEach(([username, records]) => {
        records.sort(
          (a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD)
        );

        const inDevices = records.filter((r) => r.indevice);
        const outDevices = records.filter((r) => r.outdevice);
        const inOutDevices = records.filter((r) => r.inoutdevice);
        let visitorcontactnumber = "";
        let visitorpage = "";
        let visitorpagedetails = "";
        const visitorSource = records.find(
          (r) => r.visitorcontactnumber || r.visitorpage || r.visitorpagedetails
        );

        if (visitorSource) {
          visitorcontactnumber = visitorSource.visitorcontactnumber || "";
          visitorpage = visitorSource.visitorpage || "";
          visitorpagedetails = visitorSource.visitorpagedetails || "";
        }
        const sortedInDevices = [...inDevices].sort(
          (a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD)
        );
        const sortedOutDevices = [...outDevices].sort(
          (a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD)
        );
        const sortedInOutDevices = [...inOutDevices].sort(
          (a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD)
        );

        let inTime = null;
        let outTime = null;
        let inTimeVerified = null;
        let inTimeVerifiedDevice = null;
        let outTimeVerified = null;
        let outTimeVerifiedDevice = null;
        let biometricUserIDC = null;
        let totalHours = "-";

        const processedRecords = [];

        // 1. Handle indevice + outdevice logic
        if (sortedInDevices.length > 0) {
          const firstIn = sortedInDevices[0];
          inTime = firstIn.clockDateTimeD;
          inTimeVerified = firstIn.verifyC;
          inTimeVerifiedDevice = firstIn.biometriccommonname;
          biometricUserIDC = firstIn.biometricUserIDC;

          const matchedOut = sortedOutDevices.find(
            (out) => parseDate(out.clockDateTimeD) > parseDate(inTime)
          );
          if (
            matchedOut &&
            sortedOutDevices[sortedOutDevices.length - 1]?.outdevice
          ) {
            outTime = matchedOut.clockDateTimeD;
            outTimeVerified = matchedOut.verifyC;
            outTimeVerifiedDevice = matchedOut.biometriccommonname;
            totalHours = formatTime(
              (parseDate(outTime) - parseDate(inTime)) / 1000
            );
          }

          // Pair inDevices and outDevices
          let outIndex = 0;
          let lastOutTime = null;
          for (let i = 0; i < sortedInDevices.length; i++) {
            const currentIn = sortedInDevices[i];
            if (
              lastOutTime &&
              parseDate(currentIn.clockDateTimeD) <= parseDate(lastOutTime)
            )
              continue;

            let selectedOut = null;
            while (outIndex < sortedOutDevices.length) {
              const potentialOut = sortedOutDevices[outIndex];
              if (
                parseDate(potentialOut.clockDateTimeD) >
                parseDate(currentIn.clockDateTimeD)
              ) {
                selectedOut = potentialOut;
                outIndex++;
                break;
              }
              outIndex++;
            }

            const startTime = currentIn.clockDateTimeD;
            const endTime = selectedOut ? selectedOut.clockDateTimeD : null;

            processedRecords.push({
              biometricUserIDC: currentIn.biometricUserIDC,
              staffNameC: currentIn.staffNameC,
              inTime: formatToAmPm(startTime),
              outTime: endTime ? formatToAmPm(endTime) : "-",
              totalHours: endTime
                ? formatTime((parseDate(endTime) - parseDate(startTime)) / 1000)
                : "-",
              breakHours: "-",
              inTimeVerified: currentIn.verifyC,
              inTimeVerifiedDevice: currentIn.biometriccommonname,
              outTimeVerified: selectedOut?.verifyC || "-",
              outTimeVerifiedDevice: selectedOut?.biometriccommonname || "-",
            });

            if (endTime) lastOutTime = endTime;
          }
        }

        // 2. Handle inoutdevice logic
        // 2. Handle inoutdevice logic (based on odd-even pattern)
        if (sortedInOutDevices.length > 0) {
          biometricUserIDC = sortedInOutDevices[0].biometricUserIDC;

          // Always assign from inoutdevice regardless of prior inTime/outTime
          const firstInout = sortedInOutDevices[0];
          inTime = firstInout.clockDateTimeD;
          inTimeVerified = firstInout.verifyC;
          inTimeVerifiedDevice = firstInout.biometriccommonname;

          // Last even index as outTime if count is even
          // if (sortedInOutDevices.length % 2 === 0) {
          if (sortedInOutDevices.length > 1) {
            const last = sortedInOutDevices[sortedInOutDevices.length - 1];
            outTime = last.clockDateTimeD;
            outTimeVerified = last.verifyC;
            outTimeVerifiedDevice = last.biometriccommonname;
            totalHours = formatTime(
              (parseDate(outTime) - parseDate(inTime)) / 1000
            );
          }

          // Pair inoutdevices: index 0→1, 2→3, ...
          for (let i = 0; i < sortedInOutDevices.length; i += 2) {
            const inRec = sortedInOutDevices[i];
            const outRec = sortedInOutDevices[i + 1]; // may be undefined

            processedRecords.push({
              biometricUserIDC: inRec.biometricUserIDC,
              staffNameC: inRec.staffNameC,
              inTime: formatToAmPm(inRec.clockDateTimeD),
              outTime: outRec ? formatToAmPm(outRec.clockDateTimeD) : "-",
              totalHours: outRec
                ? formatTime(
                    (parseDate(outRec.clockDateTimeD) -
                      parseDate(inRec.clockDateTimeD)) /
                      1000
                  )
                : "-",
              breakHours: "-",
              inTimeVerified: inRec.verifyC,
              inTimeVerifiedDevice: inRec.biometriccommonname,
              outTimeVerified: outRec?.verifyC || "-",
              outTimeVerifiedDevice: outRec?.biometriccommonname || "-",
            });
          }
        }
        console.log(data, "data");
        acc.push({
          date: date.split("-").reverse().join("-"),
          company,
          branch,
          unit,
          floor,
          area,
          biometriccommonname,
          biometricUserIDC,
          username,
          visitorcontactnumber,
          visitorpage,
          visitorpagedetails,
          inTime: inTime ? formatToAmPm(inTime) : "-",
          outTime: outTime ? formatToAmPm(outTime) : "-",
          totalHours,
          data: processedRecords,
          inTimeVerified: inTimeVerified || "-",
          inTimeVerifiedDevice: inTimeVerifiedDevice || "-",
          outTimeVerified: outTimeVerified || "-",
          outTimeVerifiedDevice: outTimeVerifiedDevice || "-",
        });
      });

      return acc;
    },
    []
  );
};

function filterShifts(finaluser, dateNow) {
  const filteredUsers = {};

  finaluser.forEach((user) => {
    if (!user?.shiftdate) return;
    const date = user.rowformattedDate;
    const shiftStart = new Date(user.shiftdate.startTime);
    const shiftEnd = new Date(user.shiftdate.endTime);

    if (isCurrentTimeInShift(shiftStart, shiftEnd, dateNow)) {
      filteredUsers[user.rowusername] = user;
    }
    // else {
    //     // If not, store the shift with the present date
    //     if (!filteredUsers[user.rowusername] || filteredUsers[user.rowusername].rowformattedDate > date) {
    //         filteredUsers[user.rowusername] = user;
    //     }
    // }
  });
  return Object.values(filteredUsers);
}

// Getting Exit List Based on Branch Wise
exports.getUsersBranchWiseExitReports = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;

    let { accessbranch, daysArray, dateNow, company, branch, workmode } =
      req.body;
    try {
      const matchStage = {
        $match: {
          resonablestatus: {
            $nin: [
              "Not Joined",
              "Postponed",
              "Rejected",
              "Closed",
              "Releave Employee",
              "Absconded",
              "Hold",
              "Terminate",
            ],
          },
        },
      };

      // Dynamically add company and branch conditions if they exist
      if (company?.length > 0 || branch?.length > 0 || workmode?.length > 0) {
        matchStage.$match.$and = [];

        if (company?.length > 0) {
          matchStage.$match.$and.push({ company: { $in: company } });
        }

        if (branch?.length > 0) {
          matchStage.$match.$and.push({ branch: { $in: branch } });
        }
        if (workmode?.length > 0) {
          matchStage.$match.$and.push({ workmode: { $in: workmode } });
        }
      }
      const aggregationPipeline = [
        matchStage,
        {
          $match: {
            $or: accessbranch.map((branch) => ({
              company: branch.company,
              branch: branch.branch,
              unit: branch.unit,
            })),
          },
        },
      ];

      const devicenames = await BiometricDeviceManagement.find(
        { biometricexit: true },
        { biometricserialno: 1 }
      );
      const userCollection = await User.aggregate([
        ...aggregationPipeline,
        {
          $project: {
            _id: 0,
            username: 1,
          },
        },
        {
          $group: {
            _id: null,
            usernames: { $push: "$username" },
          },
        },
        {
          $project: {
            _id: 0,
            usernames: 1,
          },
        },
      ]);
      const userNames = userCollection[0]?.usernames || [];
      // const userNames = ["sobanak"];

      if (userNames?.length > 0) {
        answer = await getUserClockinAndClockoutStatus({
          employee: userNames,
          userDates: daysArray,
        });

        const finalUserShiftBased = filterShifts(answer?.finaluser, dateNow);
        usersCollection = await Biometricattlog.aggregate([
          {
            $match: {
              staffNameC: { $in: userNames },
              cloudIDC: {
                $in: devicenames?.map((data) => data?.biometricserialno),
              },
              $expr: {
                $in: [
                  {
                    $dateToString: {
                      format: "%d-%m-%Y",
                      date: {
                        $dateFromString: {
                          dateString: "$clockDateTimeD",
                          format: "%d-%m-%Y %H:%M:%S",
                        },
                      },
                    },
                  },
                  [
                    moment(dateNow).format("DD-MM-YYYY"), // Today
                    moment(dateNow).subtract(1, "days").format("DD-MM-YYYY"),
                    moment(dateNow).subtract(2, "days").format("DD-MM-YYYY"), // Yesterday
                  ],
                ],
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "staffNameC",
              foreignField: "username",
              as: "userDetails",
            },
          },
          {
            $lookup: {
              from: "biometricdevicemanagements",
              localField: "cloudIDC",
              foreignField: "biometricserialno",
              as: "biometricDevice",
            },
          },
          {
            $addFields: {
              empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
              company: { $arrayElemAt: ["$userDetails.company", 0] },
              branch: { $arrayElemAt: ["$userDetails.branch", 0] },
              unit: { $arrayElemAt: ["$userDetails.unit", 0] },
              team: { $arrayElemAt: ["$userDetails.team", 0] },
              companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
              biometriccommonname: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
          },
          {
            $project: {
              _id: 0,
              staffNameC: 1,
              biometricUserIDC: 1,
              clockDateTimeD: 1,
              verifyC: 1,
              cloudIDC: 1,
              empcode: 1,
              company: 1,
              branch: 1,
              unit: 1,
              team: 1,
              companyname: 1,
              biometriccommonname: 1,
            },
          },
          {
            $group: {
              _id: { branch: "$branch", company: "$company" },
              usersInDevice: { $push: "$staffNameC" }, // Users in the device
              usersData: {
                $push: {
                  staffNameC: "$staffNameC",
                  biometricUserIDC: "$biometricUserIDC",
                  clockDateTimeD: "$clockDateTimeD",
                  verifyC: "$verifyC",
                  empcode: "$empcode",
                  company: "$company",
                  unit: "$unit",
                  team: "$team",
                  companyname: "$companyname",
                  biometriccommonname: "$biometriccommonname",
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              let: { branchName: "$_id.branch", companyName: "$_id.company" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$branch", "$$branchName"] },
                        { $eq: ["$company", "$$companyName"] },
                      ],
                    },
                    resonablestatus: {
                      $nin: [
                        "Not Joined",
                        "Postponed",
                        "Rejected",
                        "Closed",
                        "Releave Employee",
                        "Absconded",
                        "Hold",
                        "Terminate",
                      ],
                    },
                    $or: accessbranch.map((branch) => ({
                      company: branch.company,
                      branch: branch.branch,
                      unit: branch.unit,
                    })),
                  },
                },
                {
                  $count: "totalUsersInBranch",
                },
              ],
              as: "totalUsersData",
            },
          },
          {
            $addFields: {
              totalUsersInBranch: {
                $ifNull: [
                  { $arrayElemAt: ["$totalUsersData.totalUsersInBranch", 0] },
                  0,
                ],
              }, // Get count or default to 0
              totalUsersInDevice: { $size: "$usersInDevice" }, // Count users in device
            },
          },
          {
            $project: {
              branch: "$_id.branch",
              company: "$_id.company",
              users: "$usersData",
              totalUsersInBranch: 1,
              totalUsersInDevice: 1,
              _id: 0,
            },
          },
        ]);

        filteredData = finalUserShiftBased?.reduce(
          (acc, { rowusername, shiftdate, shift, shifttype }) => {
            usersCollection.forEach((branchData) => {
              const matchedUsers = branchData.users
                .filter((user) => user.staffNameC === rowusername) // Match with staffNameC inside users array
                .map((user) => {
                  const startTime = shiftdate?.startTime
                    ? new Date(shiftdate.startTime)
                    : null;
                  const endTime = shiftdate?.endTime
                    ? new Date(shiftdate.endTime)
                    : null;
                  const [datePart, timePart] = user?.clockDateTimeD.split(" ");
                  const [day, month, year] = datePart.split("-");
                  const clockTime = new Date(
                    `${year}-${month}-${day}T${timePart}`
                  );
                  if (
                    startTime &&
                    endTime &&
                    !isNaN(clockTime) &&
                    clockTime >= startTime &&
                    clockTime <= endTime
                  ) {
                    return {
                      ...user,
                      matchedShift: shiftdate,
                      shift: shift,
                      attendancedate: shiftdate?.date,
                      shifttype: shifttype,
                    };
                  }
                  return null;
                })
                .filter(Boolean);

              // **Step 3: Get previous day shift and count valid records**
              const prevShiftStart = shiftdate?.startTime
                ? new Date(shiftdate.startTime)
                : null;
              const prevShiftEnd = shiftdate?.endTime
                ? new Date(shiftdate.endTime)
                : null;

              if (prevShiftStart && prevShiftEnd) {
                prevShiftStart.setDate(prevShiftStart.getDate() - 1); // Move to the previous day
                prevShiftEnd.setDate(prevShiftEnd.getDate() - 1); // Move to the previous day
              }

              const prevDayUsers = usersCollection
                .flatMap((branch) => branch.users)
                .filter((user) => user.staffNameC === rowusername)
                .map((user) => {
                  const [datePart, timePart] = user?.clockDateTimeD.split(" ");
                  const [day, month, year] = datePart.split("-");
                  const clockTime = new Date(
                    `${year}-${month}-${day}T${timePart}`
                  );
                  return clockTime;
                })
                .filter(
                  (clockTime) =>
                    prevShiftStart &&
                    prevShiftEnd &&
                    clockTime >= prevShiftStart &&
                    clockTime <= prevShiftEnd
                );
              const isPrevDayOdd = prevDayUsers.length % 2 !== 0;
              const isTodayOdd = matchedUsers.length % 2 !== 0;

              // **Step 4: Adjust if both previous and today's data are odd**
              if (isPrevDayOdd && isTodayOdd && matchedUsers.length > 0) {
                const firstEntry = matchedUsers.shift(); // Remove first element from today's list
                prevDayUsers.push(firstEntry); // Add it to previous day's records
              }

              let inTime = null;
              let outTime = null;
              let inTimeVerified = null;
              let outTimeVerified = null;
              let totalHours = null;
              // let shiftType = null;
              // shiftType = shiftType
              if (matchedUsers.length > 0) {
                inTime = matchedUsers[0].clockDateTimeD; // First entry as inTime
                inTimeVerified = matchedUsers[0].verifyC;
                if (matchedUsers.length % 2 === 0) {
                  outTime =
                    matchedUsers[matchedUsers.length - 1].clockDateTimeD; // Last entry as outTime
                  outTimeVerified =
                    matchedUsers[matchedUsers.length - 1].verifyC;
                }
                if (inTime && outTime) {
                  const parseDate = (dateString) => {
                    const [datePart, timePart] = dateString.split(" ");
                    const [day, month, year] = datePart.split("-");
                    return new Date(`${year}-${month}-${day}T${timePart}`);
                  };
                  const inDate = parseDate(inTime);
                  const outDate = parseDate(outTime);
                  const diffMs = outDate - inDate;
                  const hours = String(
                    Math.floor(diffMs / (1000 * 60 * 60))
                  ).padStart(2, "0");
                  const minutes = String(
                    Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                  ).padStart(2, "0");
                  const seconds = String(
                    Math.floor((diffMs % (1000 * 60)) / 1000)
                  ).padStart(2, "0");

                  totalHours = `${hours}:${minutes}:${seconds}`;
                }
              }

              // Find if the branch already exists in the accumulator
              let branchEntry = acc.find(
                (entry) => entry.branch === branchData.branch
              );
              if (!branchEntry) {
                branchEntry = {
                  branch: branchData.branch,
                  company: branchData.company,
                  totalUsersInBranch: branchData.totalUsersInBranch,
                  users: [],
                  totalUsersThere: 0,

                  totalusersINDay: 0,
                  totalusersOutDay: 0,
                  pendingInOutUserDay: 0,
                  usersINDay: [],
                  usersOutDay: [],
                  usersINOUTDay: [],
                  totalinoutusersDay: 0,
                  totalusersINNight: 0,
                  totalusersOutNight: 0,
                  pendingInOutUserNight: 0,
                  usersINNight: [],
                  usersOutNight: [],
                  usersINOUTNight: [],
                  totalinoutusersNight: 0,
                };
                acc.push(branchEntry);
              }

              // Push user data into the branch group
              let userCheck = {
                ...(matchedUsers.length > 0
                  ? matchedUsers[0]
                  : branchData.users.find(
                      (user) => user.staffNameC === rowusername
                    )),
              };
              if (userCheck?.staffNameC) {
                branchEntry.users.push({
                  shiftdate: shiftdate?.date ? shiftdate?.date : shift,
                  ...(matchedUsers.length > 0
                    ? matchedUsers[0]
                    : branchData.users.find(
                        (user) => user.staffNameC === rowusername
                      )),
                  inTime: inTime ? formatToAmPm(inTime) : null,
                  outTime: outTime ? formatToAmPm(outTime) : null,
                  totalHours: totalHours,
                  shifttype: shifttype,
                  inTimeVerified: inTimeVerified,
                  outTimeVerified: outTimeVerified,
                });
              }
            });
            acc.forEach((branch) => {
              branch.totalUsersThere = branch.users.length;

              branch.usersINDay = branch.users.filter(
                (user) =>
                  user.inTime && !user.outTime && user.shifttype === "Day Shift"
              );
              branch.totalusersINDay = branch.usersINDay?.length;
              branch.usersOutDay = branch?.users?.filter(
                (user) =>
                  user.inTime && user.outTime && user.shifttype === "Day Shift"
              );
              branch.totalusersOutDay = branch?.usersOutDay?.length;
              branch.totalinoutusersDay =
                branch.totalusersINDay + branch.totalusersOutDay;
              branch.usersINOUTDay = branch.users.filter(
                (user) =>
                  !user.inTime &&
                  !user.outTime &&
                  user?.staffNameC &&
                  user.shifttype === "Day Shift"
              );
              branch.pendingInOutUserDay = branch.usersINOUTDay?.length;

              branch.usersINNight = branch.users.filter(
                (user) =>
                  user.inTime &&
                  !user.outTime &&
                  user.shifttype === "Night Shift"
              );
              branch.totalusersINNight = branch.usersINNight?.length;
              branch.usersOutNight = branch?.users?.filter(
                (user) =>
                  user.inTime &&
                  user.outTime &&
                  user.shifttype === "Night Shift"
              );
              branch.totalusersOutNight = branch?.usersOutNight?.length;
              branch.totalinoutusersNight =
                branch.totalusersINNight + branch.totalusersOutNight;
              branch.usersINOUTNight = branch.users.filter(
                (user) =>
                  !user.inTime &&
                  !user.outTime &&
                  user?.staffNameC &&
                  user.shifttype === "Night Shift"
              );
              branch.pendingInOutUserNight = branch.usersINOUTNight?.length;
            });
            return acc;
          },
          []
        );
      }
      return res.status(200).json({
        answer,
        usersCollection,
        filteredData,
      });
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

exports.getUsersBranchWiseExitReportsCheck = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;

    let { accessbranch, daysArray, dateNow, company, branch, workmode } =
      req.body;

    try {
      const matchStage = {
        $match: {
          resonablestatus: {
            $nin: [
              "Not Joined",
              "Postponed",
              "Rejected",
              "Closed",
              "Releave Employee",
              "Absconded",
              "Hold",
              "Terminate",
            ],
          },
        },
      };

      // Dynamically add company and branch conditions if they exist
      if (company?.length > 0 || branch?.length > 0 || workmode?.length > 0) {
        matchStage.$match.$and = [];

        if (company?.length > 0) {
          matchStage.$match.$and.push({ company: { $in: company } });
        }

        if (branch?.length > 0) {
          matchStage.$match.$and.push({ branch: { $in: branch } });
        }
        if (workmode?.length > 0) {
          matchStage.$match.$and.push({ workmode: { $in: workmode } });
        }
      }
      const aggregationPipeline = [
        matchStage,
        {
          $match: {
            $or: accessbranch.map((branch) => ({
              company: branch.company,
              branch: branch.branch,
              unit: branch.unit,
            })),
          },
        },
      ];

      // const devicenames = await BiometricDeviceManagement.find({
      //     $or: [
      //         { biometricinexit: true },
      //         { biometricoutexit: true },
      //         { biometricinoutexit: true },
      //     ]
      // }, { biometricserialno: 1 });

      const userCollection = await User.aggregate([
        ...aggregationPipeline,
        {
          $project: {
            _id: 0,
            username: 1,
          },
        },
        {
          $group: {
            _id: null,
            usernames: { $push: "$username" },
          },
        },
        {
          $project: {
            _id: 0,
            usernames: 1,
          },
        },
      ]);
      const userNames = userCollection[0]?.usernames || [];
      // const userNames = ["saravanakumarn"];
      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        // 1. Match records where any attendance flag is true
        {
          $match: {
            $or: [
              { exitinone: true },
              { exitoutone: true },
              { exitinoutone: true },
              { exitintwo: true },
              { exitoutwo: true },
              { exitinouttwo: true },
            ],
          },
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);

      const biometricUsersGrouping = await BiometricUsersGrouping.aggregate([
        {
          $match: {
            $or: [
              { exitinone: true },
              { exitoutone: true },
              { exitinoutone: true },
              { exitintwo: true },
              { exitouttwo: true },
              { exitinouttwo: true },
            ],
          },
        },
        {
          $project: {
            companyname: 1,
            type: 1,
            paireddeviceone: {
              device: "$paireddeviceone",
              exitin: "$exitinone",
              exitout: "$exitoutone",
              exitinout: "$exitinoutone",
            },
            paireddevicetwo: {
              device: "$paireddevicetwo",
              exitin: "$exitintwo",
              exitout: "$exitouttwo",
              exitinout: "$exitinouttwo",
            },
          },
        },
        { $unwind: "$companyname" },
        {
          $lookup: {
            from: "users",
            localField: "companyname",
            foreignField: "companyname",
            as: "userMatch",
          },
        },
        { $unwind: "$userMatch" },
        {
          $project: {
            _id: 0,
            companyname: 1,
            type: 1,
            username: "$userMatch.username",
            userId: "$userMatch._id",
            devices: [
              {
                device: "$paireddeviceone.device",
                exitin: "$paireddeviceone.exitin",
                exitout: "$paireddeviceone.exitout",
                exitinout: "$paireddeviceone.exitinout",
              },
              {
                device: "$paireddevicetwo.device",
                exitin: "$paireddevicetwo.exitin",
                exitout: "$paireddevicetwo.exitout",
                exitinout: "$paireddevicetwo.exitinout",
              },
            ],
          },
        },
        { $unwind: "$devices" },

        // ✅ Lookup device details from biometricdevicemanagements
        {
          $lookup: {
            from: "biometricdevicemanagements",
            let: { deviceName: "$devices.device" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$biometriccommonname", "$$deviceName"],
                  },
                },
              },
              {
                $project: {
                  biometricserialno: 1,
                  biometriccommonname: 1,
                  _id: 0,
                },
              },
            ],
            as: "matchedDevice",
          },
        },
        {
          $unwind: { path: "$matchedDevice", preserveNullAndEmptyArrays: true },
        }, // keep rows even if no match
        {
          $project: {
            companyname: 1,
            type: 1,
            username: 1,
            userId: 1,
            device: "$devices.device",
            exitin: "$devices.exitin",
            exitout: "$devices.exitout",
            exitinout: "$devices.exitinout",
            deviceserialnumber: "$matchedDevice.biometricserialno",
            //  matchedDevice: 1
          },
        },
      ]);

      // console.log(biometricUsersGrouping, "biometricUsersGrouping")

      // 1. Create a map of device serials to grouped biometric user data by username and type
      const biometricGroupingMap = {};

      for (const group of biometricUsersGrouping) {
        const {
          deviceserialnumber,
          username,
          type,
          exitin,
          exitout,
          exitinout,
        } = group;

        if (!biometricGroupingMap[deviceserialnumber]) {
          biometricGroupingMap[deviceserialnumber] = [];
        }

        biometricGroupingMap[deviceserialnumber].push({
          usernames: username,
          type,
          indevice: exitin,
          outdevice: exitout,
          inoutdevice: exitinout,
        });
      }

      const pairedSerials = Object.values(biometricGroupingMap)
        .flat()
        .filter(Boolean);
      let matchQuery = {
        staffNameC: { $in: userNames },
      };

      // only add condition if serialNos[0]?.serials exists and not empty
      if (serialNos?.[0]?.serials?.length > 0) {
        matchQuery.cloudIDC = { $in: serialNos[0].serials };
      }

      // only add $nin if pairedSerials has values
      if (pairedSerials?.length > 0) {
        matchQuery.cloudIDC = {
          ...(matchQuery.cloudIDC || {}),
          $nin: pairedSerials,
        };
      }
      // console.log(biometricGroupingMap, userNames, "biometricGroupingMap")

      if (userNames?.length > 0) {
        //  console.log('answer')
        answer = await getUserClockinAndClockoutStatus({
          employee: userNames,
          userDates: daysArray,
        });
        // console.log(answer, 'answer')
        const finalUserShiftBased = filterShifts(answer?.finaluser, dateNow);

        usersCollection = await Biometricattlog.aggregate([
          {
            $match: {
              ...matchQuery,
              $expr: {
                $in: [
                  {
                    $dateToString: {
                      format: "%d-%m-%Y",
                      date: {
                        $dateFromString: {
                          dateString: "$clockDateTimeD",
                          format: "%d-%m-%Y %H:%M:%S",
                        },
                      },
                    },
                  },
                  [
                    moment(dateNow).format("DD-MM-YYYY"), // Today
                    moment(dateNow).subtract(1, "days").format("DD-MM-YYYY"),
                    moment(dateNow).subtract(2, "days").format("DD-MM-YYYY"), // Yesterday
                  ],
                ],
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "staffNameC",
              foreignField: "username",
              as: "userDetails",
            },
          },
          // 🔹 Lookup pairing group based on device common name
          {
            $lookup: {
              from: "biometricdevicemanagements",
              localField: "cloudIDC",
              foreignField: "biometricserialno",
              as: "biometricDevice",
            },
          },
          {
            $lookup: {
              from: "biometricpaireddevicesgroupings",
              let: {
                commonName: {
                  $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ["$paireddeviceone", "$$commonName"] },
                        { $eq: ["$paireddevicetwo", "$$commonName"] },
                      ],
                    },
                  },
                },
              ],
              as: "deviceMatched",
            },
          },
          {
            $addFields: {
              empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
              company: { $arrayElemAt: ["$userDetails.company", 0] },
              branch: { $arrayElemAt: ["$userDetails.branch", 0] },
              unit: { $arrayElemAt: ["$userDetails.unit", 0] },
              team: { $arrayElemAt: ["$userDetails.team", 0] },
              department: { $arrayElemAt: ["$userDetails.department", 0] },
              companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
              biometriccommonname: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },

              // 🔹 Conditional assignment based on matching device
              isDeviceOne: {
                $eq: [
                  { $first: "$deviceMatched.paireddeviceone" },
                  { $first: "$biometricDevice.biometriccommonname" },
                ],
              },
            },
          },
          {
            $addFields: {
              indevice: {
                $cond: [
                  "$isDeviceOne",
                  { $first: "$deviceMatched.exitinone" },
                  { $first: "$deviceMatched.exitintwo" },
                ],
              },
              outdevice: {
                $cond: [
                  "$isDeviceOne",
                  { $first: "$deviceMatched.exitoutone" },
                  { $first: "$deviceMatched.exitouttwo" },
                ],
              },
              inoutdevice: {
                $cond: [
                  "$isDeviceOne",
                  { $first: "$deviceMatched.exitinoutone" },
                  { $first: "$deviceMatched.exitinouttwo" },
                ],
              },
            },
          },
          {
            $project: {
              company: 1,
              branch: 1,
              unit: 1,
              department: 1,
              team: 1,
              biometricUserIDC: 1,
              indevice: 1,
              outdevice: 1,
              inoutdevice: 1,
              biometriccommonname: 1,
              staffNameC: 1,
              clockDateTimeD: 1,
              verifyC: 1,
              clockDateTimeD: 1,
              empcode: 1,
              companyname: 1,
              isDeviceOne: 1,
              cloudIDC: 1,
            },
          },
          {
            $group: {
              _id: { branch: "$branch", company: "$company" },
              usersInDevice: { $push: "$staffNameC" }, // Users in the device
              usersData: {
                $push: {
                  staffNameC: "$staffNameC",
                  biometricUserIDC: "$biometricUserIDC",
                  clockDateTimeD: "$clockDateTimeD",
                  verifyC: "$verifyC",
                  empcode: "$empcode",
                  company: "$company",
                  unit: "$unit",
                  team: "$team",
                  companyname: "$companyname",
                  indevice: "$indevice",
                  outdevice: "$outdevice",
                  inoutdevice: "$inoutdevice",
                  biometriccommonname: "$biometriccommonname",
                  cloudIDC: "$cloudIDC",
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              let: { branchName: "$_id.branch", companyName: "$_id.company" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$branch", "$$branchName"] },
                        { $eq: ["$company", "$$companyName"] },
                      ],
                    },
                    resonablestatus: {
                      $nin: [
                        "Not Joined",
                        "Postponed",
                        "Rejected",
                        "Closed",
                        "Releave Employee",
                        "Absconded",
                        "Hold",
                        "Terminate",
                      ],
                    },
                    $or: accessbranch.map((branch) => ({
                      company: branch.company,
                      branch: branch.branch,
                      unit: branch.unit,
                    })),
                  },
                },
                {
                  $count: "totalUsersInBranch",
                },
              ],
              as: "totalUsersData",
            },
          },
          {
            $addFields: {
              totalUsersInBranch: {
                $ifNull: [
                  { $arrayElemAt: ["$totalUsersData.totalUsersInBranch", 0] },
                  0,
                ],
              }, // Get count or default to 0
              totalUsersInDevice: { $size: "$usersInDevice" }, // Count users in device
            },
          },
          {
            $project: {
              branch: "$_id.branch",
              company: "$_id.company",
              biometriccommonname: "$biometriccommonname",
              users: "$usersData",
              totalUsersInBranch: 1,
              totalUsersInDevice: 1,
              _id: 0,
            },
          },
        ]);

        let filteredUsers = [];
        usersCollection[0].users?.forEach((user) => {
          const userSerial = user.cloudIDC;
          const username = user.staffNameC;

          let matchedGroupings = [];

          // 🔎 Find all groupings that contain this username
          for (const [serial, groupings] of Object.entries(
            biometricGroupingMap
          )) {
            const userGroupings = groupings.filter((g) =>
              g.usernames.includes(username)
            );
            if (userGroupings.length > 0) {
              const groupingsWithSerial = userGroupings.map((g) => ({
                ...g,
                deviceSerial: serial,
              }));
              matchedGroupings.push(...groupingsWithSerial);
            }
          }

          if (matchedGroupings.length === 0) {
            filteredUsers.push(user);
            return;
          }

          // ✅ Only process if user's serial is one of the deviceSerials
          const matchedForUserSerial = matchedGroupings.filter(
            (g) => g.deviceSerial === userSerial
          );

          // We’ll store chosen priority once per username
          let chosenGrouping = null;

          if (matchedForUserSerial.length > 0) {
            // Group groupings by deviceSerial
            const devicePriorityMap = {};
            const deviceGroupingMap = {};

            matchedForUserSerial.forEach((g) => {
              const serial = g.deviceSerial;
              const existingType = devicePriorityMap[serial];

              if (
                !existingType ||
                typePriority[g.type] < typePriority[existingType]
              ) {
                devicePriorityMap[serial] = g.type;
                deviceGroupingMap[serial] = g; // Save full group to apply later
              }
            });

            const userDeviceTopPriorityType = devicePriorityMap[userSerial];
            chosenGrouping = deviceGroupingMap[userSerial];

            if (userDeviceTopPriorityType && chosenGrouping) {
              // Update the user's device flags ONLY for matching deviceSerial
              user.indevice = chosenGrouping.indevice ?? false;
              user.outdevice = chosenGrouping.outdevice ?? false;
              user.inoutdevice = chosenGrouping.inoutdevice ?? false;
            }
          }
          if (chosenGrouping) {
          }
          filteredUsers.push(user);
        });

        filteredData = finalUserShiftBased?.reduce(
          (acc, { rowusername, shiftdate, shift, shifttype }) => {
            // filteredUsers.forEach(branchData => {
            const matchedUsers = filteredUsers
              .filter((user) => user.staffNameC === rowusername) // Match with staffNameC inside users array
              .map((user) => {
                const startTime = shiftdate?.startTime
                  ? new Date(shiftdate.startTime)
                  : null;
                const endTime = shiftdate?.endTime
                  ? new Date(shiftdate.endTime)
                  : null;
                const [datePart, timePart] = user?.clockDateTimeD.split(" ");
                const [day, month, year] = datePart.split("-");
                const clockTime = new Date(
                  `${year}-${month}-${day}T${timePart}`
                );
                if (
                  startTime &&
                  endTime &&
                  !isNaN(clockTime) &&
                  clockTime >= startTime &&
                  clockTime <= endTime
                ) {
                  return {
                    ...user,
                    matchedShift: shiftdate,
                    shift: shift,
                    attendancedate: shiftdate?.date,
                    shifttype: shifttype,
                  };
                }
                return null;
              })
              .filter(Boolean);
            // console.log(matchedUsers  , "matchedUsers")
            const shiftStart = shiftdate?.startTime
              ? new Date(shiftdate.startTime)
              : null;
            let lastAvailableDateRecords = [];
            // if (shiftStart) {
            //     // Step 1: Filter all past records for the user with inoutdevice = true
            //     const pastInoutRecords = usersCollection.filter(user => user.staffNameC === rowusername)
            //         .map(user => {
            //             const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            //             const [day, month, year] = datePart.split("-");
            //             const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
            //             return {
            //                 ...user,
            //                 clockTime,
            //                 dateKey: `${year}-${month}-${day}`, // for grouping by date
            //             };
            //         })
            //         .filter(user => user.clockTime < shiftStart);
            //     // });

            //     // Step 2: Group by date
            //     const groupedByDate = {};
            //     for (const record of pastInoutRecords) {
            //         if (!groupedByDate[record.dateKey]) {
            //             groupedByDate[record.dateKey] = [];
            //         }
            //         groupedByDate[record.dateKey].push(record);
            //     }

            //     // Step 3: Find the latest dateKey with records
            //     const availableDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
            //     const lastAvailableDateKey = availableDates[0];
            //     lastAvailableDateRecords = lastAvailableDateKey ? groupedByDate[lastAvailableDateKey] : [];

            // }
            // if (lastAvailableDateRecords[lastAvailableDateRecords?.length - 1]?.verifyC == "FACE" && matchedUsers.length > 0) {
            //     const firstInoutIndex = matchedUsers.findIndex(user => user.inoutdevice === true);
            //     if (firstInoutIndex !== -1) {
            //         const firstEntry = matchedUsers.splice(firstInoutIndex, 1)[0];
            //     }
            // }

            let inTime = null;
            let outTime = null;
            let inTimeVerified = null;
            let inTimeVerifiedDevice = null;
            let outTimeVerified = null;
            let outTimeVerifiedDevice = null;
            let totalHours = null;

            if (matchedUsers.length > 0) {
              // Sort matched users by clockDateTimeD ascending
              const sortedEntries = [...matchedUsers].sort((a, b) => {
                const [datePartA, timePartA] = a.clockDateTimeD.split(" ");
                const [dayA, monthA, yearA] = datePartA.split("-");
                const [datePartB, timePartB] = b.clockDateTimeD.split(" ");
                const [dayB, monthB, yearB] = datePartB.split("-");
                const dateA = new Date(
                  `${yearA}-${monthA}-${dayA}T${timePartA}`
                );
                const dateB = new Date(
                  `${yearB}-${monthB}-${dayB}T${timePartB}`
                );
                return dateA - dateB;
              });

              // Find first inEntry
              const filteredEntry =
                sortedEntries.find(
                  (entry) =>
                    entry.indevice === true || entry?.inoutdevice === true
                ) || null;

              const inEntry =
                filteredEntry?.inoutdevice === true
                  ? sortedEntries.find(
                      (entry) =>
                        entry.verifyC == "FACE" && entry?.inoutdevice === true
                    )
                  : filteredEntry;
              let outEntry = null;
              if (sortedEntries.length > 0) {
                const lastEntry =
                  sortedEntries?.length > 1
                    ? sortedEntries[sortedEntries.length - 1]
                    : "";

                if (lastEntry.outdevice === true) {
                  outEntry = lastEntry;
                }
                // else if (sortedEntries?.filter(data => data?.inoutdevice)?.length % 2 === 0 && lastEntry?.inoutdevice === true) {
                else if (
                  sortedEntries?.filter((data) => data?.inoutdevice)?.length >
                    1 &&
                  lastEntry?.inoutdevice === true
                ) {
                  outEntry = lastEntry;
                }
              }

              inTime = inEntry?.clockDateTimeD || null;
              inTimeVerified = inEntry?.verifyC || null;
              inTimeVerifiedDevice = inEntry?.biometriccommonname || null;

              outTime = outEntry?.clockDateTimeD || null;
              outTimeVerified = outEntry?.verifyC || null;
              outTimeVerifiedDevice = outEntry?.biometriccommonname || null;
              console.log(inTime, outTime, "lastEntry");
              if (inTime && outTime) {
                const parseDate = (dateString) => {
                  const [datePart, timePart] = dateString.split(" ");
                  const [day, month, year] = datePart.split("-");
                  return new Date(`${year}-${month}-${day}T${timePart}`);
                };
                const inDate = parseDate(inTime);
                const outDate = parseDate(outTime);
                const diffMs = outDate - inDate;
                const hours = String(
                  Math.floor(diffMs / (1000 * 60 * 60))
                ).padStart(2, "0");
                const minutes = String(
                  Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                ).padStart(2, "0");
                const seconds = String(
                  Math.floor((diffMs % (1000 * 60)) / 1000)
                ).padStart(2, "0");

                totalHours = `${hours}:${minutes}:${seconds}`;
              }
            }

            // Find if the branch already exists in the accumulator
            let branchEntry = acc.find(
              (entry) => entry.branch === usersCollection[0].branch
            );
            if (!branchEntry) {
              branchEntry = {
                branch: usersCollection[0].branch,
                company: usersCollection[0].company,
                totalUsersInBranch: usersCollection[0].totalUsersInBranch,
                users: [],
                totalUsersThere: 0,

                totalusersINDay: 0,
                totalusersOutDay: 0,
                pendingInOutUserDay: 0,
                usersINDay: [],
                usersOutDay: [],
                usersINOUTDay: [],
                totalinoutusersDay: 0,
                totalusersINNight: 0,
                totalusersOutNight: 0,
                pendingInOutUserNight: 0,
                usersINNight: [],
                usersOutNight: [],
                usersINOUTNight: [],
                totalinoutusersNight: 0,
              };
              acc.push(branchEntry);
            }

            // Push user data into the branch group
            let userCheck = {
              ...(matchedUsers.length > 0
                ? matchedUsers[0]
                : filteredUsers.find(
                    (user) => user.staffNameC === rowusername
                  )),
            };
            if (userCheck?.staffNameC) {
              branchEntry.users.push({
                shiftdate: shiftdate?.date ? shiftdate?.date : shift,
                ...(matchedUsers.length > 0
                  ? matchedUsers[0]
                  : filteredUsers.find(
                      (user) => user.staffNameC === rowusername
                    )),
                inTime: inTime ? formatToAmPm(inTime) : null,
                outTime: outTime ? formatToAmPm(outTime) : null,
                totalHours: totalHours,
                shifttype: shifttype,
                inTimeVerified: inTimeVerified,
                inTimeVerifiedDevice: inTimeVerifiedDevice,
                outTimeVerified: outTimeVerified,
                outTimeVerifiedDevice: outTimeVerifiedDevice,
              });
            }
            // });
            console.log(acc[0].users, "acc");
            acc.forEach((branch) => {
              branch.totalUsersThere = branch.users.length;

              branch.usersINDay = branch.users.filter(
                (user) =>
                  user.inTime && !user.outTime && user.shifttype === "Day Shift"
              );
              branch.totalusersINDay = branch.usersINDay?.length;
              branch.usersOutDay = branch?.users?.filter(
                (user) => user.outTime && user.shifttype === "Day Shift"
              );
              branch.totalusersOutDay = branch?.usersOutDay?.length;
              branch.totalinoutusersDay =
                branch.totalusersINDay + branch.totalusersOutDay;
              branch.usersINOUTDay = branch.users.filter(
                (user) =>
                  !user.inTime &&
                  !user.outTime &&
                  user?.staffNameC &&
                  user.shifttype === "Day Shift"
              );
              branch.pendingInOutUserDay = branch.usersINOUTDay?.length;

              branch.usersINNight = branch.users.filter(
                (user) =>
                  user.inTime &&
                  !user.outTime &&
                  user.shifttype === "Night Shift"
              );
              branch.totalusersINNight = branch.usersINNight?.length;
              branch.usersOutNight = branch?.users?.filter(
                (user) => user.outTime && user.shifttype === "Night Shift"
              );
              branch.totalusersOutNight = branch?.usersOutNight?.length;
              branch.totalinoutusersNight =
                branch.totalusersINNight + branch.totalusersOutNight;
              branch.usersINOUTNight = branch.users.filter(
                (user) =>
                  !user.inTime &&
                  !user.outTime &&
                  user?.staffNameC &&
                  user.shifttype === "Night Shift"
              );
              branch.pendingInOutUserNight = branch.usersINOUTNight?.length;
            });
            return acc;
          },
          []
        );
        // console.log(filteredUsers, 'usersCollection')
      }
      return res.status(200).json({
        answer,
        usersCollection,
        filteredData,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

// Getting Non Entry Users Based On Branch wise
exports.getUsersNonEntryBranchWiseList = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;
    let {
      accessbranch,
      daysArray,
      dateNow,
      company,
      branch,
      workmode,
      shifttime,
    } = req.body;
    try {
      const matchStage = {
        $match: {
          resonablestatus: {
            $nin: [
              "Not Joined",
              "Postponed",
              "Rejected",
              "Closed",
              "Releave Employee",
              "Absconded",
              "Hold",
              "Terminate",
            ],
          },
        },
      };

      // Dynamically add company and branch conditions if they exist
      if (company?.length > 0 || branch?.length > 0 || workmode?.length > 0) {
        matchStage.$match.$and = [];

        if (company?.length > 0) {
          matchStage.$match.$and.push({ company: { $in: company } });
        }

        if (branch?.length > 0) {
          matchStage.$match.$and.push({ branch: { $in: branch } });
        }
        if (workmode?.length > 0) {
          matchStage.$match.$and.push({ workmode: { $in: workmode } });
        }
      }
      const aggregationPipeline = [
        matchStage,
        {
          $match: {
            $or: accessbranch.map((branch) => ({
              company: branch.company,
              branch: branch.branch,
              unit: branch.unit,
            })),
          },
        },
      ];
      const devicenames = await BiometricDeviceManagement.find(
        { biometricexit: true },
        { biometricserialno: 1 }
      );
      const userCollection = await User.aggregate([
        ...aggregationPipeline,
        {
          $project: {
            _id: 0,
            username: 1,
          },
        },
        {
          $group: {
            _id: null,
            usernames: { $push: "$username" },
          },
        },
        {
          $project: {
            _id: 0,
            usernames: 1,
          },
        },
      ]);
      const userNames = userCollection[0]?.usernames || [];
      // const userNames = ["vijithrar", 'apput'];
      if (userNames?.length > 0) {
        answer = await getUserClockinAndClockoutStatus({
          employee: userNames,
          userDates: daysArray,
        });
        const finalUserShiftBased = filterShifts(answer?.finaluser, dateNow);
        const shiftBasedFilter =
          shifttime?.length > 0
            ? finalUserShiftBased?.filter((data) =>
                shifttime?.includes(data?.shifttype)
              )
            : finalUserShiftBased;

        usersCollection = await Biometricattlog.aggregate([
          {
            $match: {
              staffNameC: { $in: userNames },
              cloudIDC: {
                $in: devicenames?.map((data) => data?.biometricserialno),
              },
              $expr: {
                $in: [
                  {
                    $dateToString: {
                      format: "%d-%m-%Y",
                      date: {
                        $dateFromString: {
                          dateString: "$clockDateTimeD",
                          format: "%d-%m-%Y %H:%M:%S",
                        },
                      },
                    },
                  },
                  [
                    moment(dateNow).format("DD-MM-YYYY"), // Today
                    moment(dateNow).subtract(1, "days").format("DD-MM-YYYY"), // Yesterday
                    moment(dateNow).subtract(2, "days").format("DD-MM-YYYY"), //Day Befor Yesterday
                  ],
                ],
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "staffNameC",
              foreignField: "username",
              as: "userDetails",
            },
          },
          {
            $lookup: {
              from: "biometricdevicemanagements",
              localField: "cloudIDC",
              foreignField: "biometricserialno",
              as: "biometricDevice",
            },
          },
          {
            $addFields: {
              empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
              company: { $arrayElemAt: ["$userDetails.company", 0] },
              branch: { $arrayElemAt: ["$userDetails.branch", 0] },
              unit: { $arrayElemAt: ["$userDetails.unit", 0] },
              team: { $arrayElemAt: ["$userDetails.team", 0] },
              department: { $arrayElemAt: ["$userDetails.department", 0] },
              companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
              biometriccommonname: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
          },
          {
            $project: {
              _id: 1,
              staffNameC: 1,
              biometricUserIDC: 1,
              clockDateTimeD: 1,
              cloudIDC: 1,
              empcode: 1,
              department: 1,
              company: 1,
              branch: 1,
              unit: 1,
              team: 1,
              companyname: 1,
              biometriccommonname: 1,
            },
          },
          {
            $group: {
              _id: { branch: "$branch", company: "$company" },
              usersInDevice: { $push: "$staffNameC" }, // Users in the device
              usersData: {
                $push: {
                  staffNameC: "$staffNameC",
                  biometricUserIDC: "$biometricUserIDC",
                  clockDateTimeD: "$clockDateTimeD",
                  empcode: "$empcode",
                  company: "$company",
                  branch: "$branch",
                  unit: "$unit",
                  team: "$team",
                  department: "$department",
                  companyname: "$companyname",
                  biometriccommonname: "$biometriccommonname",
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              let: { branchName: "$_id.branch", companyName: "$_id.company" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$branch", "$$branchName"] },
                        { $eq: ["$company", "$$companyName"] },
                      ],
                    },
                    resonablestatus: {
                      $nin: [
                        "Not Joined",
                        "Postponed",
                        "Rejected",
                        "Closed",
                        "Releave Employee",
                        "Absconded",
                        "Hold",
                        "Terminate",
                      ],
                    },
                    $or: accessbranch.map((branch) => ({
                      company: branch.company,
                      branch: branch.branch,
                      unit: branch.unit,
                    })),
                  },
                },
                {
                  $count: "totalUsersInBranch",
                },
              ],
              as: "totalUsersData",
            },
          },
          {
            $addFields: {
              totalUsersInBranch: {
                $ifNull: [
                  { $arrayElemAt: ["$totalUsersData.totalUsersInBranch", 0] },
                  0,
                ],
              }, // Get count or default to 0
              totalUsersInDevice: { $size: "$usersInDevice" }, // Count users in device
            },
          },
          {
            $project: {
              branch: "$_id.branch",
              company: "$_id.company",
              users: "$usersData",
              totalUsersInBranch: 1,
              totalUsersInDevice: 1,
              _id: 0,
            },
          },
        ]);
        filteredData = shiftBasedFilter?.reduce(
          (acc, { rowusername, shiftdate, shift, shifttype }) => {
            usersCollection.forEach((branchData) => {
              const matchedUsers = branchData.users
                .filter((user) => user.staffNameC === rowusername) // Match with staffNameC inside users array
                .map((user) => {
                  const startTime = shiftdate?.startTime
                    ? new Date(shiftdate.startTime)
                    : null;
                  const endTime = shiftdate?.endTime
                    ? new Date(shiftdate.endTime)
                    : null;
                  const [datePart, timePart] = user?.clockDateTimeD.split(" ");
                  const [day, month, year] = datePart.split("-");
                  const clockTime = new Date(
                    `${year}-${month}-${day}T${timePart}`
                  );

                  if (
                    startTime &&
                    endTime &&
                    !isNaN(clockTime) &&
                    clockTime >= startTime &&
                    clockTime <= endTime
                  ) {
                    return {
                      ...user,
                      matchedShift: shiftdate,
                      attendancedate: shiftdate?.date,
                      shift: shift,
                    };
                  }
                  return null;
                })
                .filter(Boolean);

              // **Step 3: Get previous day shift and count valid records**
              const prevShiftStart = shiftdate?.startTime
                ? new Date(shiftdate.startTime)
                : null;
              if (prevShiftStart) {
                prevShiftStart.setDate(prevShiftStart.getDate() - 1); // Move to previous day
              }
              const prevDayUsers = usersCollection
                .flatMap((branch) => branch.users)
                .filter((user) => user.staffNameC === rowusername)
                .map((user) => {
                  const [datePart, timePart] = user?.clockDateTimeD.split(" ");
                  const [day, month, year] = datePart.split("-");
                  const clockTime = new Date(
                    `${year}-${month}-${day}T${timePart}`
                  );
                  return clockTime;
                })
                .filter(
                  (clockTime) =>
                    prevShiftStart &&
                    clockTime >= prevShiftStart &&
                    clockTime <= shiftdate.startTime
                );

              const isPrevDayOdd = prevDayUsers.length % 2 !== 0;
              const isTodayOdd = matchedUsers.length % 2 !== 0;

              // **Step 4: Adjust if both previous and today's data are odd**
              if (isPrevDayOdd && isTodayOdd && matchedUsers.length > 0) {
                const firstEntry = matchedUsers.shift(); // Remove first element from today's list
                prevDayUsers.push(firstEntry); // Add it to previous day's records
              }

              let inTime = null;
              let outTime = null;
              let totalHours = null;

              if (matchedUsers.length > 0) {
                inTime = matchedUsers[0].clockDateTimeD; // First entry as inTime
                if (matchedUsers.length % 2 === 0) {
                  outTime =
                    matchedUsers[matchedUsers.length - 1].clockDateTimeD; // Last entry as outTime
                }
                if (inTime && outTime) {
                  const parseDate = (dateString) => {
                    const [datePart, timePart] = dateString.split(" ");
                    const [day, month, year] = datePart.split("-");
                    return new Date(`${year}-${month}-${day}T${timePart}`);
                  };
                  const inDate = parseDate(inTime);
                  const outDate = parseDate(outTime);
                  const diffMs = outDate - inDate;
                  const hours = String(
                    Math.floor(diffMs / (1000 * 60 * 60))
                  ).padStart(2, "0");
                  const minutes = String(
                    Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                  ).padStart(2, "0");
                  const seconds = String(
                    Math.floor((diffMs % (1000 * 60)) / 1000)
                  ).padStart(2, "0");

                  totalHours = `${hours}:${minutes}:${seconds}`;
                }
              }

              // Find if the branch already exists in the accumulator
              let branchEntry = acc.find(
                (entry) => entry.branch === branchData.branch
              );
              if (!branchEntry) {
                branchEntry = {
                  branch: branchData.branch,
                  company: branchData.company,
                  // totalUsersInBranch: branchData.totalUsersInBranch,
                  users: [],
                  // totalUsersThere: 0,
                  // totalusersIN: 0,
                  // totalusersOut: 0,
                  // pendingInOutUser: 0,
                  // usersIN: [],
                  // usersOut: [],
                  usersINOUT: [],
                  totalinoutusers: 0,
                };
                acc.push(branchEntry);
              }

              // Push user data into the branch group
              let userCheck = {
                ...(matchedUsers.length > 0
                  ? matchedUsers[0]
                  : branchData.users.find(
                      (user) => user.staffNameC === rowusername
                    )),
              };
              if (userCheck?.staffNameC) {
                branchEntry.users.push({
                  shiftdate: shiftdate?.date ? shiftdate?.date : shift,
                  ...(matchedUsers.length > 0
                    ? matchedUsers[0]
                    : branchData.users.find(
                        (user) => user.staffNameC === rowusername
                      )),
                  inTime: inTime ? formatToAmPm(inTime) : null,
                  outTime: outTime ? formatToAmPm(outTime) : null,
                  totalHours: totalHours,
                  shifttype: shifttype,
                  shift: shift,
                });
              }
              // branchEntry.nonusers.push({
              //     shiftdate: shiftdate?.date ? shiftdate?.date : shift,
              //     ...(matchedUsers.length > 0 ? matchedUsers[0] :
              //         branchData.users.find(user => user.staffNameC === rowusername)
              //     ),
              //     inTime: inTime ? formatToAmPm(inTime) : null,
              //     outTime: outTime ? formatToAmPm(outTime) : null,
              //     totalHours: totalHours
              // });
            });
            acc.forEach((branch) => {
              branch.usersINOUT = branch.users.filter(
                (user) => !user.inTime && !user.outTime && user?.staffNameC
              );
              branch.pendingInOutUser = branch.usersINOUT?.length;
            });
            return acc;
          },
          []
        );
      }
      return res.status(200).json({
        answer,
        usersCollection,
        filteredData,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);
exports.getUsersNonEntryBranchWiseListCheck = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;
    let {
      accessbranch,
      daysArray,
      dateNow,
      company,
      branch,
      workmode,
      shifttime,
    } = req.body;
    try {
      const matchStage = {
        $match: {
          resonablestatus: {
            $nin: [
              "Not Joined",
              "Postponed",
              "Rejected",
              "Closed",
              "Releave Employee",
              "Absconded",
              "Hold",
              "Terminate",
            ],
          },
        },
      };

      // Dynamically add company and branch conditions if they exist
      if (company?.length > 0 || branch?.length > 0 || workmode?.length > 0) {
        matchStage.$match.$and = [];

        if (company?.length > 0) {
          matchStage.$match.$and.push({ company: { $in: company } });
        }

        if (branch?.length > 0) {
          matchStage.$match.$and.push({ branch: { $in: branch } });
        }
        if (workmode?.length > 0) {
          matchStage.$match.$and.push({ workmode: { $in: workmode } });
        }
      }
      const aggregationPipeline = [
        matchStage,
        {
          $match: {
            $or: accessbranch.map((branch) => ({
              company: branch.company,
              branch: branch.branch,
              unit: branch.unit,
            })),
          },
        },
      ];
      // const devicenames = await BiometricDeviceManagement.find({
      //     $or: [
      //         { biometricinexit: true },
      //         { biometricoutexit: true },
      //         { biometricinoutexit: true },
      //     ]
      // }, { biometricserialno: 1 });

      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        // 1. Match records where any attendance flag is true
        {
          $match: {
            $or: [
              { exitinone: true },
              { exitoutone: true },
              { exitinoutone: true },
              { exitintwo: true },
              { exitoutwo: true },
              { exitinouttwo: true },
            ],
          },
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);

      const biometricUsersGrouping = await BiometricUsersGrouping.aggregate([
        {
          $match: {
            $or: [
              { exitinone: true },
              { exitoutone: true },
              { exitinoutone: true },
              { exitintwo: true },
              { exitouttwo: true },
              { exitinouttwo: true },
            ],
          },
        },
        {
          $project: {
            companyname: 1,
            type: 1,
            paireddeviceone: {
              device: "$paireddeviceone",
              exitin: "$exitinone",
              exitout: "$exitoutone",
              exitinout: "$exitinoutone",
            },
            paireddevicetwo: {
              device: "$paireddevicetwo",
              exitin: "$exitintwo",
              exitout: "$exitouttwo",
              exitinout: "$exitinouttwo",
            },
          },
        },
        { $unwind: "$companyname" },
        {
          $lookup: {
            from: "users",
            localField: "companyname",
            foreignField: "companyname",
            as: "userMatch",
          },
        },
        { $unwind: "$userMatch" },
        {
          $project: {
            _id: 0,
            companyname: 1,
            type: 1,
            username: "$userMatch.username",
            userId: "$userMatch._id",
            devices: [
              {
                device: "$paireddeviceone.device",
                exitin: "$paireddeviceone.exitin",
                exitout: "$paireddeviceone.exitout",
                exitinout: "$paireddeviceone.exitinout",
              },
              {
                device: "$paireddevicetwo.device",
                exitin: "$paireddevicetwo.exitin",
                exitout: "$paireddevicetwo.exitout",
                exitinout: "$paireddevicetwo.exitinout",
              },
            ],
          },
        },
        { $unwind: "$devices" },

        // ✅ Lookup device details from biometricdevicemanagements
        {
          $lookup: {
            from: "biometricdevicemanagements",
            let: { deviceName: "$devices.device" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$biometriccommonname", "$$deviceName"],
                  },
                },
              },
              {
                $project: {
                  biometricserialno: 1,
                  biometriccommonname: 1,
                  _id: 0,
                },
              },
            ],
            as: "matchedDevice",
          },
        },
        {
          $unwind: { path: "$matchedDevice", preserveNullAndEmptyArrays: true },
        }, // keep rows even if no match
        {
          $project: {
            companyname: 1,
            type: 1,
            username: 1,
            userId: 1,
            device: "$devices.device",
            exitin: "$devices.exitin",
            exitout: "$devices.exitout",
            exitinout: "$devices.exitinout",
            deviceserialnumber: "$matchedDevice.biometricserialno",
            //  matchedDevice: 1
          },
        },
      ]);

      // console.log(biometricUsersGrouping, "biometricUsersGrouping")

      // 1. Create a map of device serials to grouped biometric user data by username and type

      // console.log(biometricGroupingMap, userNames, "biometricGroupingMap")

      const userCollection = await User.aggregate([
        ...aggregationPipeline,
        {
          $project: {
            _id: 0,
            username: 1,
          },
        },
        {
          $group: {
            _id: null,
            usernames: { $push: "$username" },
          },
        },
        {
          $project: {
            _id: 0,
            usernames: 1,
          },
        },
      ]);
      const userNames = userCollection[0]?.usernames || [];
      // const userNames = ["saravanakumarn"];

      const biometricGroupingMap = {};

      for (const group of biometricUsersGrouping) {
        const {
          deviceserialnumber,
          username,
          type,
          exitin,
          exitout,
          exitinout,
        } = group;

        if (!biometricGroupingMap[deviceserialnumber]) {
          biometricGroupingMap[deviceserialnumber] = [];
        }

        biometricGroupingMap[deviceserialnumber].push({
          usernames: username,
          type,
          indevice: exitin,
          outdevice: exitout,
          inoutdevice: exitinout,
        });
      }

      const pairedSerials = Object.values(biometricGroupingMap)
        .flat()
        .filter(Boolean);
      let matchQuery = {
        staffNameC: { $in: userNames },
      };

      // only add condition if serialNos[0]?.serials exists and not empty
      if (serialNos?.[0]?.serials?.length > 0) {
        matchQuery.cloudIDC = { $in: serialNos[0].serials };
      }

      // only add $nin if pairedSerials has values
      if (pairedSerials?.length > 0) {
        matchQuery.cloudIDC = {
          ...(matchQuery.cloudIDC || {}),
          $nin: pairedSerials,
        };
      }
      if (userNames?.length > 0) {
        answer = await getUserClockinAndClockoutStatus({
          employee: userNames,
          userDates: daysArray,
        });
        const finalUserShiftBased = filterShifts(answer?.finaluser, dateNow);
        const shiftBasedFilter =
          shifttime?.length > 0
            ? finalUserShiftBased?.filter((data) =>
                shifttime?.includes(data?.shifttype)
              )
            : finalUserShiftBased;

        usersCollection = await Biometricattlog.aggregate([
          {
            $match: {
              staffNameC: { $in: userNames },
              cloudIDC: { $in: serialNos?.[0]?.serials },
              $expr: {
                $in: [
                  {
                    $dateToString: {
                      format: "%d-%m-%Y",
                      date: {
                        $dateFromString: {
                          dateString: "$clockDateTimeD",
                          format: "%d-%m-%Y %H:%M:%S",
                        },
                      },
                    },
                  },
                  [
                    moment(dateNow).format("DD-MM-YYYY"), // Today
                    moment(dateNow).subtract(1, "days").format("DD-MM-YYYY"), // Yesterday
                    moment(dateNow).subtract(2, "days").format("DD-MM-YYYY"), //Day Befor Yesterday
                  ],
                ],
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "staffNameC",
              foreignField: "username",
              as: "userDetails",
            },
          },
          {
            $lookup: {
              from: "biometricdevicemanagements",
              localField: "cloudIDC",
              foreignField: "biometricserialno",
              as: "biometricDevice",
            },
          },
          {
            $lookup: {
              from: "biometricpaireddevicesgroupings",
              let: {
                commonName: {
                  $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ["$paireddeviceone", "$$commonName"] },
                        { $eq: ["$paireddevicetwo", "$$commonName"] },
                      ],
                    },
                  },
                },
              ],
              as: "deviceMatched",
            },
          },
          {
            $addFields: {
              empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
              company: { $arrayElemAt: ["$userDetails.company", 0] },
              branch: { $arrayElemAt: ["$userDetails.branch", 0] },
              unit: { $arrayElemAt: ["$userDetails.unit", 0] },
              team: { $arrayElemAt: ["$userDetails.team", 0] },
              department: { $arrayElemAt: ["$userDetails.department", 0] },
              companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
              biometriccommonname: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },

              // 🔹 Conditional assignment based on matching device
              isDeviceOne: {
                $eq: [
                  { $first: "$deviceMatched.paireddeviceone" },
                  { $first: "$biometricDevice.biometriccommonname" },
                ],
              },
            },
          },
          {
            $addFields: {
              indevice: {
                $cond: [
                  "$isDeviceOne",
                  { $first: "$deviceMatched.exitinone" },
                  { $first: "$deviceMatched.exitintwo" },
                ],
              },
              outdevice: {
                $cond: [
                  "$isDeviceOne",
                  { $first: "$deviceMatched.exitoutone" },
                  { $first: "$deviceMatched.exitouttwo" },
                ],
              },
              inoutdevice: {
                $cond: [
                  "$isDeviceOne",
                  { $first: "$deviceMatched.exitinoutone" },
                  { $first: "$deviceMatched.exitinouttwo" },
                ],
              },
            },
          },
          {
            $project: {
              company: 1,
              branch: 1,
              unit: 1,
              department: 1,
              team: 1,
              biometricUserIDC: 1,
              indevice: 1,
              outdevice: 1,
              inoutdevice: 1,
              biometriccommonname: 1,
              staffNameC: 1,
              clockDateTimeD: 1,
              verifyC: 1,
              clockDateTimeD: 1,
              empcode: 1,
              companyname: 1,
              isDeviceOne: 1,
              cloudIDC: 1,
            },
          },
          {
            $group: {
              _id: { branch: "$branch", company: "$company" },
              usersInDevice: { $push: "$staffNameC" }, // Users in the device
              usersData: {
                $push: {
                  staffNameC: "$staffNameC",
                  biometricUserIDC: "$biometricUserIDC",
                  clockDateTimeD: "$clockDateTimeD",
                  verifyC: "$verifyC",
                  empcode: "$empcode",
                  company: "$company",
                  unit: "$unit",
                  team: "$team",
                  companyname: "$companyname",
                  indevice: "$indevice",
                  outdevice: "$outdevice",
                  inoutdevice: "$inoutdevice",
                  biometriccommonname: "$biometriccommonname",
                  cloudIDC: "$cloudIDC",
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              let: { branchName: "$_id.branch", companyName: "$_id.company" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$branch", "$$branchName"] },
                        { $eq: ["$company", "$$companyName"] },
                      ],
                    },
                    resonablestatus: {
                      $nin: [
                        "Not Joined",
                        "Postponed",
                        "Rejected",
                        "Closed",
                        "Releave Employee",
                        "Absconded",
                        "Hold",
                        "Terminate",
                      ],
                    },
                    $or: accessbranch.map((branch) => ({
                      company: branch.company,
                      branch: branch.branch,
                      unit: branch.unit,
                    })),
                  },
                },
                {
                  $count: "totalUsersInBranch",
                },
              ],
              as: "totalUsersData",
            },
          },
          {
            $addFields: {
              totalUsersInBranch: {
                $ifNull: [
                  { $arrayElemAt: ["$totalUsersData.totalUsersInBranch", 0] },
                  0,
                ],
              }, // Get count or default to 0
              totalUsersInDevice: { $size: "$usersInDevice" }, // Count users in device
            },
          },
          {
            $project: {
              branch: "$_id.branch",
              company: "$_id.company",
              biometriccommonname: "$biometriccommonname",
              users: "$usersData",
              totalUsersInBranch: 1,
              totalUsersInDevice: 1,
              _id: 0,
            },
          },
        ]);
        console.log(
          userNames,
          serialNos?.[0]?.serials,
          usersCollection?.length
        );
        let filteredUsers = [];
        usersCollection[0].users?.forEach((user) => {
          const userSerial = user.cloudIDC;
          const username = user.staffNameC;

          let matchedGroupings = [];

          // 🔎 Find all groupings that contain this username
          for (const [serial, groupings] of Object.entries(
            biometricGroupingMap
          )) {
            const userGroupings = groupings.filter((g) =>
              g.usernames.includes(username)
            );
            if (userGroupings.length > 0) {
              const groupingsWithSerial = userGroupings.map((g) => ({
                ...g,
                deviceSerial: serial,
              }));
              matchedGroupings.push(...groupingsWithSerial);
            }
          }

          if (matchedGroupings.length === 0) {
            filteredUsers.push(user);
            return;
          }

          // ✅ Only process if user's serial is one of the deviceSerials
          const matchedForUserSerial = matchedGroupings.filter(
            (g) => g.deviceSerial === userSerial
          );

          // We’ll store chosen priority once per username
          let chosenGrouping = null;

          if (matchedForUserSerial.length > 0) {
            // Group groupings by deviceSerial
            const devicePriorityMap = {};
            const deviceGroupingMap = {};

            matchedForUserSerial.forEach((g) => {
              const serial = g.deviceSerial;
              const existingType = devicePriorityMap[serial];

              if (
                !existingType ||
                typePriority[g.type] < typePriority[existingType]
              ) {
                devicePriorityMap[serial] = g.type;
                deviceGroupingMap[serial] = g; // Save full group to apply later
              }
            });

            const userDeviceTopPriorityType = devicePriorityMap[userSerial];
            chosenGrouping = deviceGroupingMap[userSerial];

            if (userDeviceTopPriorityType && chosenGrouping) {
              // Update the user's device flags ONLY for matching deviceSerial
              user.indevice = chosenGrouping.indevice ?? false;
              user.outdevice = chosenGrouping.outdevice ?? false;
              user.inoutdevice = chosenGrouping.inoutdevice ?? false;
            }
          }
          if (chosenGrouping) {
          }
          filteredUsers.push(user);
        });

        filteredData = shiftBasedFilter?.reduce(
          (acc, { rowusername, shiftdate, shift, shifttype }) => {
            // usersCollection.forEach(branchData => {
            const matchedUsers = filteredUsers
              .filter((user) => user.staffNameC === rowusername) // Match with staffNameC inside users array
              .map((user) => {
                const startTime = shiftdate?.startTime
                  ? new Date(shiftdate.startTime)
                  : null;
                const endTime = shiftdate?.endTime
                  ? new Date(shiftdate.endTime)
                  : null;
                const [datePart, timePart] = user?.clockDateTimeD.split(" ");
                const [day, month, year] = datePart.split("-");
                const clockTime = new Date(
                  `${year}-${month}-${day}T${timePart}`
                );

                if (
                  startTime &&
                  endTime &&
                  !isNaN(clockTime) &&
                  clockTime >= startTime &&
                  clockTime <= endTime
                ) {
                  return {
                    ...user,
                    matchedShift: shiftdate,
                    attendancedate: shiftdate?.date,
                    shift: shift,
                  };
                }
                return null;
              })
              .filter(Boolean);

            // // **Step 3: Get previous day shift and count valid records**
            // const prevShiftStart = shiftdate?.startTime ? new Date(shiftdate.startTime) : null;
            // if (prevShiftStart) {
            //     prevShiftStart.setDate(prevShiftStart.getDate() - 1); // Move to previous day
            // }
            // const prevDayUsers = usersCollection
            //     .flatMap(branch => branch.users)
            //     .filter(user => user.staffNameC === rowusername)
            //     .map(user => {
            //         const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            //         const [day, month, year] = datePart.split("-");
            //         const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
            //         return clockTime;
            //     })
            //     .filter(clockTime => prevShiftStart && clockTime >= prevShiftStart && clockTime <= shiftdate.startTime);

            // const isPrevDayOdd = prevDayUsers.length % 2 !== 0;
            // const isTodayOdd = matchedUsers.length % 2 !== 0;

            // // **Step 4: Adjust if both previous and today's data are odd**
            // if (isPrevDayOdd && isTodayOdd && matchedUsers.length > 0) {
            //     const firstEntry = matchedUsers.shift(); // Remove first element from today's list
            //     prevDayUsers.push(firstEntry); // Add it to previous day's records
            // }

            let inTime = null;
            let outTime = null;
            let totalHours = null;

            if (matchedUsers.length > 0) {
              // Sort matched users by clockDateTimeD ascending
              const sortedEntries = [...matchedUsers].sort((a, b) => {
                const [datePartA, timePartA] = a.clockDateTimeD.split(" ");
                const [dayA, monthA, yearA] = datePartA.split("-");
                const [datePartB, timePartB] = b.clockDateTimeD.split(" ");
                const [dayB, monthB, yearB] = datePartB.split("-");
                const dateA = new Date(
                  `${yearA}-${monthA}-${dayA}T${timePartA}`
                );
                const dateB = new Date(
                  `${yearB}-${monthB}-${dayB}T${timePartB}`
                );
                return dateA - dateB;
              });

              console.log(sortedEntries, "sortedEntries");
              // Find first inEntry
              const filteredEntry =
                sortedEntries.find(
                  (entry) =>
                    entry.indevice === true || entry?.inoutdevice === true
                ) || null;

              const inEntry =
                filteredEntry?.inoutdevice === true
                  ? sortedEntries.find(
                      (entry) =>
                        entry.verifyC === "FACE" && entry?.inoutdevice === true
                    )
                  : filteredEntry;
              // console.log(sortedEntries?.length, "sortedEntries")
              // Check if last entry is biometricoutexit === true
              let outEntry = null;
              if (sortedEntries.length > 0) {
                const lastEntry = sortedEntries[sortedEntries.length - 1];
                // console.log(lastEntry, "lastEntry")
                if (lastEntry.outdevice === true) {
                  outEntry = lastEntry;
                }
                // else if (sortedEntries?.filter(data => data?.inoutdevice)?.length % 2 === 0 && lastEntry?.inoutdevice === true) {
                else if (
                  sortedEntries?.filter((data) => data?.inoutdevice)?.length >
                    1 &&
                  lastEntry?.inoutdevice === true
                ) {
                  outEntry = lastEntry;
                }
              }

              inTime = inEntry?.clockDateTimeD || null;
              inTimeVerified = inEntry?.verifyC || null;
              inTimeVerifiedDevice = inEntry?.biometriccommonname || null;

              outTime = outEntry?.clockDateTimeD || null;
              outTimeVerified = outEntry?.verifyC || null;
              outTimeVerifiedDevice = outEntry?.biometriccommonname || null;

              if (inTime && outTime) {
                const parseDate = (dateString) => {
                  const [datePart, timePart] = dateString.split(" ");
                  const [day, month, year] = datePart.split("-");
                  return new Date(`${year}-${month}-${day}T${timePart}`);
                };
                const inDate = parseDate(inTime);
                const outDate = parseDate(outTime);
                const diffMs = outDate - inDate;
                const hours = String(
                  Math.floor(diffMs / (1000 * 60 * 60))
                ).padStart(2, "0");
                const minutes = String(
                  Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                ).padStart(2, "0");
                const seconds = String(
                  Math.floor((diffMs % (1000 * 60)) / 1000)
                ).padStart(2, "0");

                totalHours = `${hours}:${minutes}:${seconds}`;
              }
            }

            // Find if the branch already exists in the accumulator
            let branchEntry = acc.find(
              (entry) => entry.branch === usersCollection[0].branch
            );
            if (!branchEntry) {
              branchEntry = {
                branch: usersCollection[0].branch,
                company: usersCollection[0].company,
                users: [],
                usersINOUT: [],
                totalinoutusers: 0,
              };
              acc.push(branchEntry);
            }

            // Push user data into the branch group
            let userCheck = {
              ...(matchedUsers.length > 0
                ? matchedUsers[0]
                : filteredUsers.find(
                    (user) => user.staffNameC === rowusername
                  )),
            };
            if (userCheck?.staffNameC) {
              branchEntry.users.push({
                shiftdate: shiftdate?.date ? shiftdate?.date : shift,
                ...(matchedUsers.length > 0
                  ? matchedUsers[0]
                  : filteredUsers.find(
                      (user) => user.staffNameC === rowusername
                    )),
                inTime: inTime ? formatToAmPm(inTime) : null,
                outTime: outTime ? formatToAmPm(outTime) : null,
                totalHours: totalHours,
                shifttype: shifttype,
                shift: shift,
              });
            }
            // branchEntry.nonusers.push({
            //     shiftdate: shiftdate?.date ? shiftdate?.date : shift,
            //     ...(matchedUsers.length > 0 ? matchedUsers[0] :
            //         branchData.users.find(user => user.staffNameC === rowusername)
            //     ),
            //     inTime: inTime ? formatToAmPm(inTime) : null,
            //     outTime: outTime ? formatToAmPm(outTime) : null,
            //     totalHours: totalHours
            // });

            // });
            acc.forEach((branch) => {
              branch.usersINOUT = branch.users.filter(
                (user) => !user.inTime && !user.outTime && user?.staffNameC
              );
              branch.pendingInOutUser = branch.usersINOUT?.length;
            });
            return acc;
          },
          []
        );
      }
      return res.status(200).json({
        answer,
        usersCollection,
        filteredData,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

// t\To get the users attendance total hours reports
exports.getUsersAttendanceTotalHoursReports = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;
    let { company, branch, usernames, type, userDates, workmode } = req.body;
    try {
      let query = {};
      if (type !== "Deactivate" && usernames?.length > 0) {
        query.username = { $in: usernames };
      }
      if (type === "Deactivate") {
        query.resonablestatus = {
          $in: [
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
            "Releave Employee",
            "Absconded",
            "Hold",
            "Terminate",
          ],
        };
      }
      if (type === "Deactivate" && company?.length > 0) {
        query.company = { $in: company };
      }
      if (type === "Deactivate" && branch?.length > 0) {
        query.branch = { $in: branch };
      }
      if (workmode?.length > 0) {
        query.workmode = { $in: workmode };
      }
      const userDetails = await User.find(query, { username: 1 });
      const usernamesFilter =
        userDetails?.length > 0
          ? userDetails?.map((data) => data?.username)
          : [];
      const devicenames = await BiometricDeviceManagement.find(
        { biometricattendance: true, biometricbreak: true },
        { biometricserialno: 1 }
      );
      answer = await getUserClockinAndClockoutStatus({
        employee: usernamesFilter,
        userDates: userDates,
      });
      usersCollection = await Biometricattlog.aggregate([
        {
          $match: {
            staffNameC: { $in: usernamesFilter },
            cloudIDC: {
              $in: devicenames?.map((data) => data?.biometricserialno),
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        {
          $addFields: {
            empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
            company: { $arrayElemAt: ["$userDetails.company", 0] },
            branch: { $arrayElemAt: ["$userDetails.branch", 0] },
            unit: { $arrayElemAt: ["$userDetails.unit", 0] },
            team: { $arrayElemAt: ["$userDetails.team", 0] },
            department: { $arrayElemAt: ["$userDetails.department", 0] },
            companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },
          },
        },
        {
          $project: {
            userDetails: 0,
          },
        },
      ]);

      filteredData = answer?.finaluser?.flatMap(
        ({ rowusername, shiftdate, shift, shifttype }) => {
          const matchedUsers = usersCollection
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              const startTime = shiftdate?.startTime
                ? new Date(shiftdate.startTime)
                : null;
              const endTime = shiftdate?.endTime
                ? new Date(shiftdate.endTime)
                : null;
              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);

              if (startTime && endTime && !isNaN(clockTime)) {
                if (clockTime >= startTime && clockTime <= endTime) {
                  return {
                    ...user,
                    matchedShift: shiftdate,
                    attendancedate: shiftdate?.date,
                  };
                }
              }
              return null;
            })
            .filter(Boolean);

          // **Step 3: Get previous day shift and count valid records**
          const prevShiftStart = shiftdate?.startTime
            ? new Date(shiftdate.startTime)
            : null;
          if (prevShiftStart) {
            prevShiftStart.setDate(prevShiftStart.getDate() - 1); // Move to previous day
          }

          const prevDayUsers = usersCollection
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
              return clockTime;
            })
            .filter(
              (clockTime) =>
                prevShiftStart &&
                clockTime >= prevShiftStart &&
                clockTime <= shiftdate.startTime
            );

          const isPrevDayOdd = prevDayUsers.length % 2 !== 0;
          const isTodayOdd = matchedUsers.length % 2 !== 0;

          // **Step 4: Adjust if both previous and today's data are odd**
          if (isPrevDayOdd && isTodayOdd && matchedUsers.length > 0) {
            const firstEntry = matchedUsers.shift(); // Remove first element from today's list
            prevDayUsers.push(firstEntry); // Add it to previous day's records
          }
          let inTime = null;
          let outTime = null;
          let totalHours = null;
          let inTimeVerified = null;
          let outTimeVerified = null;
          const clockTimes = matchedUsers.map((user) => user.clockDateTimeD);
          const verfiedBy = matchedUsers.map((user) => user.verifyC);
          if (matchedUsers.length > 0) {
            inTime = matchedUsers[0].clockDateTimeD; // First entry is always inTime
            inTimeVerified = matchedUsers[0].verifyC;
            if (matchedUsers.length % 2 === 0) {
              outTime = matchedUsers[matchedUsers.length - 1].clockDateTimeD; // Last entry as outTime
              outTimeVerified = matchedUsers[matchedUsers.length - 1].verifyC;
            }
            if (inTime && outTime) {
              const parseDate = (dateString) => {
                const [datePart, timePart] = dateString.split(" ");
                const [day, month, year] = datePart.split("-");
                return new Date(`${year}-${month}-${day}T${timePart}`);
              };
              const inDate = parseDate(inTime);
              const outDate = parseDate(outTime);
              const diffMs = outDate - inDate;
              const hours = String(
                Math.floor(diffMs / (1000 * 60 * 60))
              ).padStart(2, "0");
              const minutes = String(
                Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
              ).padStart(2, "0");
              const seconds = String(
                Math.floor((diffMs % (1000 * 60)) / 1000)
              ).padStart(2, "0");

              totalHours = `${hours}:${minutes}:${seconds}`;
            }
          }
          const userDataFinal =
            matchedUsers.length > 0
              ? matchedUsers[0]
              : usersCollection.find((user) => user.staffNameC === rowusername);
          return {
            shiftdate: shiftdate?.date ? shiftdate?.date : shift,
            ...userDataFinal,
            inTime: inTime ? formatToAmPm(inTime) : null,
            outTime: outTime ? formatToAmPm(outTime) : null,
            totalHours,
            inTimeVerified,
            outTimeVerified,
            verfiedBy,
            clockTimes,
            fixedData: processTimes(
              clockTimes,
              userDataFinal,
              shiftdate?.date ? shiftdate?.date : shift,
              shift,
              shifttype,
              verfiedBy
            ),
          };
        }
      );

      return res.status(200).json({
        answer,
        usersCollection,
        filteredData: filteredData?.filter((data) => data?.companyname),
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

// t\To get the users attendance total hours reports
exports.getUsersAttendanceTotalHoursReportsCheck = catchAsyncErrors(
  async (req, res, next) => {
    let answer, usersCollection, filteredData;
    let { company, branch, usernames, type, userDates, workmode } = req.body;
    try {
      let query = {};
      if (type !== "Deactivate" && usernames?.length > 0) {
        query.username = { $in: usernames };
      }
      if (type === "Deactivate") {
        query.resonablestatus = {
          $in: [
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
            "Releave Employee",
            "Absconded",
            "Hold",
            "Terminate",
          ],
        };
      }
      if (type === "Deactivate" && company?.length > 0) {
        query.company = { $in: company };
      }
      if (type === "Deactivate" && branch?.length > 0) {
        query.branch = { $in: branch };
      }
      if (workmode?.length > 0) {
        query.workmode = { $in: workmode };
      }
      const userDetails = await User.find(query, { username: 1 });
      const usernamesFilter =
        userDetails?.length > 0
          ? userDetails?.map((data) => data?.username)
          : [];
      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        // 1. Match records where any attendance flag is true
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceoutwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);
      const biometricUsersGrouping = await BiometricUsersGrouping.aggregate([
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceouttwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            companyname: 1,
            type: 1,
            paireddeviceone: {
              device: "$paireddeviceone",
              attendancein: "$attendanceinone",
              attendanceout: "$attendanceoutone",
              attendanceinout: "$attendanceinoutone",
            },
            paireddevicetwo: {
              device: "$paireddevicetwo",
              attendancein: "$attendanceintwo",
              attendanceout: "$attendanceouttwo",
              attendanceinout: "$attendanceinouttwo",
            },
          },
        },
        { $unwind: "$companyname" },
        {
          $lookup: {
            from: "users",
            localField: "companyname",
            foreignField: "companyname",
            as: "userMatch",
          },
        },
        { $unwind: "$userMatch" },
        {
          $project: {
            _id: 0,
            companyname: 1,
            type: 1,
            username: "$userMatch.username",
            userId: "$userMatch._id",
            devices: [
              {
                device: "$paireddeviceone.device",
                attendancein: "$paireddeviceone.attendancein",
                attendanceout: "$paireddeviceone.attendanceout",
                attendanceinout: "$paireddeviceone.attendanceinout",
              },
              {
                device: "$paireddevicetwo.device",
                attendancein: "$paireddevicetwo.attendancein",
                attendanceout: "$paireddevicetwo.attendanceout",
                attendanceinout: "$paireddevicetwo.attendanceinout",
              },
            ],
          },
        },
        { $unwind: "$devices" },

        // ✅ Lookup device details from biometricdevicemanagements
        {
          $lookup: {
            from: "biometricdevicemanagements",
            let: { deviceName: "$devices.device" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$biometriccommonname", "$$deviceName"],
                  },
                },
              },
              {
                $project: {
                  biometricserialno: 1,
                  biometriccommonname: 1,
                  _id: 0,
                },
              },
            ],
            as: "matchedDevice",
          },
        },
        {
          $unwind: { path: "$matchedDevice", preserveNullAndEmptyArrays: true },
        }, // keep rows even if no match
        {
          $project: {
            companyname: 1,
            type: 1,
            username: 1,
            userId: 1,
            device: "$devices.device",
            attendancein: "$devices.attendancein",
            attendanceout: "$devices.attendanceout",
            attendanceinout: "$devices.attendanceinout",
            deviceserialnumber: "$matchedDevice.biometricserialno",
            //  matchedDevice: 1
          },
        },
      ]);
      // console.log(biometricUsersGrouping, "biometricUsersGrouping");

      // 1. Create a map of device serials to grouped biometric user data by username and type
      const biometricGroupingMap = {};

      for (const group of biometricUsersGrouping) {
        const {
          deviceserialnumber,
          username,
          type,
          attendancein,
          attendanceout,
          attendanceinout,
        } = group;

        if (!biometricGroupingMap[deviceserialnumber]) {
          biometricGroupingMap[deviceserialnumber] = [];
        }

        biometricGroupingMap[deviceserialnumber].push({
          usernames: username,
          type,
          indevice: attendancein,
          outdevice: attendanceout,
          inoutdevice: attendanceinout,
        });
      }

      const pairedSerials = Object.values(biometricGroupingMap)
        .flat()
        .filter(Boolean);
      let matchQuery = {
        staffNameC: { $in: usernamesFilter },
      };

      // only add condition if serialNos[0]?.serials exists and not empty
      if (serialNos?.[0]?.serials?.length > 0) {
        matchQuery.cloudIDC = { $in: serialNos[0].serials };
      }

      // only add $nin if pairedSerials has values
      if (pairedSerials?.length > 0) {
        matchQuery.cloudIDC = {
          ...(matchQuery.cloudIDC || {}),
          $nin: pairedSerials,
        };
      }

      answer = await getUserClockinAndClockoutStatus({
        employee: usernamesFilter,
        userDates: userDates,
      });
      console.log(matchQuery, pairedSerials, answer, "biometricGroupingMap");
      usersCollection = await Biometricattlog.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        // 🔹 Lookup pairing group based on device common name
        {
          $lookup: {
            from: "biometricpaireddevicesgroupings",
            let: {
              commonName: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$paireddeviceone", "$$commonName"] },
                      { $eq: ["$paireddevicetwo", "$$commonName"] },
                    ],
                  },
                },
              },
            ],
            as: "deviceMatched",
          },
        },
        {
          $addFields: {
            empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
            company: { $arrayElemAt: ["$userDetails.company", 0] },
            branch: { $arrayElemAt: ["$userDetails.branch", 0] },
            unit: { $arrayElemAt: ["$userDetails.unit", 0] },
            team: { $arrayElemAt: ["$userDetails.team", 0] },
            department: { $arrayElemAt: ["$userDetails.department", 0] },
            companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },

            // 🔹 Conditional assignment based on matching device
            isDeviceOne: {
              $eq: [
                { $first: "$deviceMatched.paireddeviceone" },
                { $first: "$biometricDevice.biometriccommonname" },
              ],
            },
          },
        },
        {
          $addFields: {
            indevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinone" },
                { $first: "$deviceMatched.attendanceintwo" },
              ],
            },
            outdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceoutone" },
                { $first: "$deviceMatched.attendanceouttwo" },
              ],
            },
            inoutdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinoutone" },
                { $first: "$deviceMatched.attendanceinouttwo" },
              ],
            },
          },
        },
        {
          $project: {
            userDetails: 0,
            biometricDevice: 0,
            deviceMatched: 0,
          },
        },
      ]);
      // console.log(usersCollection?.length, usersCollection[0])
      let filteredUsers = [];
      usersCollection.forEach((user) => {
        const userSerial = user.cloudIDC;
        const username = user.staffNameC;

        let matchedGroupings = [];

        // 🔎 Find all groupings that contain this username
        for (const [serial, groupings] of Object.entries(
          biometricGroupingMap
        )) {
          const userGroupings = groupings.filter((g) =>
            g.usernames.includes(username)
          );
          if (userGroupings.length > 0) {
            const groupingsWithSerial = userGroupings.map((g) => ({
              ...g,
              deviceSerial: serial,
            }));
            matchedGroupings.push(...groupingsWithSerial);
          }
        }

        if (matchedGroupings.length === 0) {
          filteredUsers.push(user);
          return;
        }

        // ✅ Only process if user's serial is one of the deviceSerials
        const matchedForUserSerial = matchedGroupings.filter(
          (g) => g.deviceSerial === userSerial
        );

        // We’ll store chosen priority once per username
        let chosenGrouping = null;

        if (matchedForUserSerial.length > 0) {
          // Group groupings by deviceSerial
          const devicePriorityMap = {};
          const deviceGroupingMap = {};

          matchedForUserSerial.forEach((g) => {
            const serial = g.deviceSerial;
            const existingType = devicePriorityMap[serial];

            if (
              !existingType ||
              typePriority[g.type] < typePriority[existingType]
            ) {
              devicePriorityMap[serial] = g.type;
              deviceGroupingMap[serial] = g; // Save full group to apply later
            }
          });

          const userDeviceTopPriorityType = devicePriorityMap[userSerial];
          chosenGrouping = deviceGroupingMap[userSerial];

          if (userDeviceTopPriorityType && chosenGrouping) {
            // Update the user's device flags ONLY for matching deviceSerial
            user.indevice = chosenGrouping.indevice ?? false;
            user.outdevice = chosenGrouping.outdevice ?? false;
            user.inoutdevice = chosenGrouping.inoutdevice ?? false;
          }
        }
        if (chosenGrouping) {
        }
        filteredUsers.push(user);
      });

      // console.log(filteredUsers , "filteredUsers")

      filteredData = answer?.finaluser?.flatMap(
        ({ rowusername, shiftdate, shift, shifttype }) => {
          const matchedUsers = filteredUsers
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              if (!user.indevice && !user.outdevice && !user.inoutdevice) {
                return null;
              }
              const startTime = shiftdate?.startTime
                ? new Date(shiftdate.startTime)
                : null;
              const endTime = shiftdate?.endTime
                ? new Date(shiftdate.endTime)
                : null;
              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
              if (startTime && endTime && !isNaN(clockTime)) {
                if (clockTime >= startTime && clockTime <= endTime) {
                  return {
                    ...user,
                    clockTime,
                    matchedShift: shiftdate,
                    attendancedate: shiftdate?.date,
                  };
                }
              }
              return null;
            })
            .filter(Boolean);

          console.log(matchedUsers, "matchedUsers1");
          const shiftStart = shiftdate?.startTime
            ? new Date(shiftdate.startTime)
            : null;
          let lastAvailableDateRecords = [];
          if (shiftStart) {
            // Step 1: Filter all past records for the user with inoutdevice = true
            //     const pastInoutRecords = filteredUsers
            //         .filter(user =>
            //             user.staffNameC === rowusername &&
            //             user.inoutdevice === true
            //         )
            //         .map(user => {
            //             const [datePart, timePart] = user?.clockDateTimeD.split(" ");
            //             const [day, month, year] = datePart.split("-");
            //             const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
            //             return {
            //                 ...user,
            //                 clockTime,
            //                 dateKey: `${year}-${month}-${day}`, // for grouping by date
            //             };
            //         })
            //         .filter(user => user.clockTime < shiftStart); // only before today's shift
            //     // Step 2: Group by date
            //     const groupedByDate = {};
            //     for (const record of pastInoutRecords) {
            //         if (!groupedByDate[record.dateKey]) {
            //             groupedByDate[record.dateKey] = [];
            //         }
            //         groupedByDate[record.dateKey].push(record);
            //     }
            //     // Step 3: Find the latest dateKey with records
            //     const availableDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
            //     const lastAvailableDateKey = availableDates[0];
            //     lastAvailableDateRecords = lastAvailableDateKey ? groupedByDate[lastAvailableDateKey] : [];
            //     // // Step 4: If odd, remove first entry
            //     // if (lastAvailableDateRecords.length % 2 !== 0) {
            //     //     lastAvailableDateRecords.shift(); // Remove first inoutdevice record
            //     // }
            // }
            // if (lastAvailableDateRecords[lastAvailableDateRecords?.length - 1]?.verifyC === "FACE" && matchedUsers.length > 0) {
            //     const firstInoutIndex = matchedUsers.findIndex(user => user.inoutdevice === true);
            //     if (firstInoutIndex !== -1) {
            //         const firstEntry = matchedUsers.splice(firstInoutIndex, 1)[0];
            //     }
          }
          const inDevices = matchedUsers.filter((u) => u.indevice);
          const outDevices = matchedUsers.filter((u) => u.outdevice);
          const inOutDevices = matchedUsers.filter((u) => u.inoutdevice);
          const sortByClockTime = (a, b) =>
            new Date(a.clockTime) - new Date(b.clockTime);
          inDevices.sort(sortByClockTime);
          outDevices.sort(sortByClockTime);
          inOutDevices.sort(sortByClockTime);

          let inTime = null,
            outTime = null;
          let inTimeVerified = null;
          let outTimeVerified = null;
          let totalHours = null;
          let inTimeVerifiedDevice = null;
          let outTimeVerifiedDevice = null;

          if (inDevices.length > 0) {
            inTime = inDevices[0].clockDateTimeD;
            inTimeVerified = inDevices[0].verifyC;
            inTimeVerifiedDevice = inDevices[0].biometriccommonname;
          } else if (inOutDevices.length > 0) {
            inTime = inOutDevices[0].clockDateTimeD;
            inTimeVerified = inOutDevices[0].verifyC;
            inTimeVerifiedDevice = inOutDevices[0].biometriccommonname;
          }

          if (outDevices.length > 0) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const lastOut =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];
            if (lastOut?.outdevice === true) {
              outEntry = lastOut;
              outTime = lastOut.clockDateTimeD;
              outTimeVerified = lastOut.verifyC;
              outTimeVerifiedDevice = lastOut.biometriccommonname;
            }
          }
          //  else if (inOutDevices.length % 2 === 0 && inOutDevices.length > 0) {
          else if (inOutDevices.length > 1) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const lastInOut =
              matchedUsers?.length > 1
                ? LastDeviceBasedOnTime[LastDeviceBasedOnTime?.length - 1]
                : "";
            if (
              lastInOut?.outdevice === true ||
              lastInOut?.inoutdevice === true
            ) {
              outTime = lastInOut.clockDateTimeD;
              outTimeVerified = lastInOut.verifyC;
              outTimeVerifiedDevice = lastInOut.biometriccommonname;
            }
          }

          if (inTime && outTime) {
            const parseDate = (dateString) => {
              const [datePart, timePart] = dateString.split(" ");
              const [day, month, year] = datePart.split("-");
              return new Date(`${year}-${month}-${day}T${timePart}`);
            };
            const inDate = parseDate(inTime);
            const outDate = parseDate(outTime);
            const diffMs = outDate - inDate;
            const hours = String(
              Math.floor(diffMs / (1000 * 60 * 60))
            ).padStart(2, "0");
            const minutes = String(
              Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            ).padStart(2, "0");
            const seconds = String(
              Math.floor((diffMs % (1000 * 60)) / 1000)
            ).padStart(2, "0");
            totalHours = `${hours}:${minutes}:${seconds}`;
          }

          const clockTimes = matchedUsers.map((u) => u.clockDateTimeD);
          const verfiedBy = matchedUsers.map((u) => u.verifyC);
          const userDataFinal =
            matchedUsers.length > 0
              ? matchedUsers[0]
              : filteredUsers.find((user) => user.staffNameC === rowusername);

          return {
            shiftdate: shiftdate?.date ? shiftdate.date : shift,
            ...userDataFinal,
            inTime: inTime ? formatToAmPm(inTime) : null,
            outTime: outTime ? formatToAmPm(outTime) : null,
            totalHours,
            inTimeVerified,
            inTimeVerifiedDevice,
            outTimeVerified,
            outTimeVerifiedDevice,
            verfiedBy,
            clockTimes,
            // fixedData: processTimesCheck(clockTimes, userDataFinal, shiftdate?.date ? shiftdate?.date : shift, shift, shifttype, verfiedBy, matchedUsers),
            modifiedData: simplifiedTimesCheckAttendance(
              matchedUsers,
              clockTimes,
              userDataFinal,
              shiftdate?.date ? shiftdate?.date : shift,
              shift,
              shifttype,
              verfiedBy
            ),
          };
        }
      );
      return res.status(200).json({
        answer,
        usersCollection,
        filteredData: filteredData?.filter((data) => data?.companyname),
      });
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

function formatToAmPm(dateStr) {
  let [day, month, year, time] = dateStr.split(/[-\s]/);
  let formattedDate = new Date(`${year}-${month}-${day}T${time}`);
  let formattedTime = formattedDate.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${day}-${month}-${year} ${formattedTime}`; // Remove space between time and AM/PM
}

const parseDate = (dateString) => {
  const [datePart, timePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("-");
  return new Date(`${year}-${month}-${day}T${timePart}`);
};
function processTimes(times, user, shiftdate, shift, shifttype, verifiedby) {
  let result = [];
  for (let i = 0; i < times.length - 1; i += 2) {
    let startTime = parseDate(times[i]);
    let endTime = parseDate(times[i + 1]);
    let totalHours = (endTime - startTime) / 1000; // Convert ms to hours

    let breakTime = "-";
    if (i + 2 < times.length) {
      let breakStart = parseDate(times[i + 1]);
      let breakEnd = parseDate(times[i + 2]);
      breakTime = (breakEnd - breakStart) / 1000; // Convert ms to minutes
    }

    result.push({
      startTime: times[i],
      inTimeVerified: verifiedby[i],
      endTime: times[i + 1],
      outTimeVerified: verifiedby[i + 1],
      username: user?.staffNameC,
      shiftdate: shiftdate,
      shift: shift,
      shifttype: shifttype,
      companyname: user?.companyname,
      empcode: user?.empcode,
      // break: breakTime ? breakTime.toFixed(2) + " mins" : null
      totalHours: formatTime(totalHours),
      break: breakTime !== null ? formatTime(breakTime) : null,
    });
  }
  if (times.length % 2 !== 0) {
    result.push({
      startTime: times[times.length - 1],
      inTimeVerified: verifiedby[verifiedby.length - 1],
      username: user?.staffNameC,
      shiftdate: shiftdate,
      shift: shift,
      shifttype: shifttype,
      companyname: user?.companyname,
      empcode: user?.empcode,
      endTime: "-",
      totalHours: "-",
      break: "-",
    });
  }
  return result;
}
function processTimesCheck(
  times,
  user,
  shiftdate,
  shift,
  shifttype,
  verifiedby,
  matchedUsers
) {
  const result = [];

  const parseDate = (dateString) => {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Sort everything by clock time
  matchedUsers.sort(
    (a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD)
  );

  const indevice = matchedUsers.find((d) => d.indevice)?.clockDateTimeD;
  const indeviceVerify = matchedUsers.find((d) => d.indevice)?.verifyC;

  const inoutDevices = matchedUsers.filter((d) => d.inoutdevice);
  const outDevice = matchedUsers.findLast((d) => d.outdevice)?.clockDateTimeD;
  const outDeviceVerify = matchedUsers.findLast((d) => d.outdevice)?.verifyC;

  const inoutTimes = inoutDevices.map((d) => d.clockDateTimeD);
  const inoutVerify = inoutDevices.map((d) => d.verifyC);

  const totalInout = inoutTimes.length;

  // 1st pair
  if (indevice && totalInout >= 2) {
    const inTime = indevice;
    const outTime = inoutTimes[1];
    const inTimeParsed = parseDate(inTime);
    const outTimeParsed = parseDate(outTime);
    const totalSec = (outTimeParsed - inTimeParsed) / 1000;

    result.push({
      startTime: inTime,
      inTimeVerified: indeviceVerify,
      endTime: outTime,
      outTimeVerified: inoutVerify[1],
      username: user?.staffNameC,
      shiftdate,
      shift,
      shifttype,
      companyname: user?.companyname,
      empcode: user?.empcode,
      totalHours: formatTime(totalSec),
      break: "-",
    });
  }

  // Next pairs from inout
  for (let i = 3; i + 1 < totalInout; i += 2) {
    const inTime = inoutTimes[i];
    const outTime = inoutTimes[i + 1];

    const inTimeParsed = parseDate(inTime);
    const outTimeParsed = parseDate(outTime);
    const totalSec = (outTimeParsed - inTimeParsed) / 1000;

    result.push({
      startTime: inTime,
      inTimeVerified: inoutVerify[i],
      endTime: outTime,
      outTimeVerified: inoutVerify[i + 1],
      username: user?.staffNameC,
      shiftdate,
      shift,
      shifttype,
      companyname: user?.companyname,
      empcode: user?.empcode,
      totalHours: formatTime(totalSec),
      break: "-",
    });
  }

  // Last unmatched inTime if odd inout count and outDevice exists
  if (totalInout % 2 !== 0 && outDevice) {
    const lastIn = inoutTimes[totalInout - 1];
    const inTimeParsed = parseDate(lastIn);
    const outTimeParsed = parseDate(outDevice);
    const totalSec = (outTimeParsed - inTimeParsed) / 1000;

    result.push({
      startTime: lastIn,
      inTimeVerified: inoutVerify[totalInout - 1],
      endTime: outDevice,
      outTimeVerified: outDeviceVerify,
      username: user?.staffNameC,
      shiftdate,
      shift,
      shifttype,
      companyname: user?.companyname,
      empcode: user?.empcode,
      totalHours: formatTime(totalSec),
      break: "-",
    });
  }

  return result;
}

// function simplifiedTimesCheck(matchedUsers) {
//     const result = [];

//     const parseDate = (dateString) => {
//         const [datePart, timePart] = dateString.split(" ");
//         const [day, month, year] = datePart.split("-");
//         return new Date(`${year}-${month}-${day}T${timePart}`);
//     };

//     matchedUsers.sort((a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD));

//     const inoutBuffer = [];
//     const outDeviceQueue = [...matchedUsers.filter(d => d.outdevice)];
//     let i = 0;

//     while (i < matchedUsers.length) {
//         const entry = matchedUsers[i];

//         if (entry.indevice) {
//             // Try to pair this indevice with the next available outdevice
//             const outEntry = outDeviceQueue.find(od => parseDate(od.clockDateTimeD) > parseDate(entry.clockDateTimeD));
//             if (outEntry) {
//                 // Remove used outDevice
//                 outDeviceQueue.splice(outDeviceQueue.indexOf(outEntry), 1);
//                 result.push({
//                     username: entry.username,
//                     clocuIDC: entry.cloudIDC,
//                     indevice: true,
//                     outdevice: true,
//                     intime: entry.clockDateTimeD,
//                     outTime: outEntry.clockDateTimeD
//                 });
//             } else {
//                 result.push({
//                     username: entry.username,
//                     clocuIDC: entry.cloudIDC,
//                     indevice: true,
//                     intime: entry.clockDateTimeD,
//                     outTime: ""
//                 });
//             }
//         } else if (entry.inoutdevice) {
//             inoutBuffer.push(entry);
//         }
//         i++;
//     }

//     for (let j = 0; j < inoutBuffer.length; j += 2) {
//         const inEntry = inoutBuffer[j];
//         const outEntry = inoutBuffer[j + 1];

//         result.push({
//             username: inEntry.username,
//             clocuIDC: inEntry.cloudIDC,
//             inoutdevice: true,
//             intime: inEntry.clockDateTimeD,
//             outTime: outEntry?.clockDateTimeD || ""
//         });
//     }

//     // Add any remaining unmatched outdevice entries
//     for (const remainingOut of outDeviceQueue) {
//         result.push({
//             username: remainingOut.username,
//             clocuIDC: remainingOut.cloudIDC,
//             outdevice: true,
//             intime: "",
//             outTime: remainingOut.clockDateTimeD
//         });
//     }

//     return result;
// }

// function simplifiedTimesCheckAttendance(matchedUsers, times, user, shiftdate, shift, shifttype, verifiedby) {
//     const result = [];
//     matchedUsers.sort((a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD));

//     const inDevices = matchedUsers.filter(u => u.indevice);
//     const outDevices = matchedUsers.filter(u => u.outdevice);
//     const inOutDevices = matchedUsers.filter(u => u.inoutdevice);
//     console.log(inOutDevices , 'inOutDevices')

//     let outDeviceIndex = 0;
//     let lastOutTime = null; // Store the last used outTime

//     for (let i = 0; i < inDevices.length; i++) {
//         const currentIn = inDevices[i];

//         // Skip if current inTime is before last outTime
//         if (lastOutTime && parseDate(currentIn.clockDateTimeD) <= parseDate(lastOutTime)) {
//             continue;
//         }

//         let selectedOut = null;
//         while (outDeviceIndex < outDevices.length) {
//             const potentialOut = outDevices[outDeviceIndex];
//             if (parseDate(potentialOut.clockDateTimeD) > parseDate(currentIn.clockDateTimeD)) {
//                 selectedOut = potentialOut;
//                 outDeviceIndex++;
//                 break;
//             }
//             outDeviceIndex++;
//         }

//         // 🛑 Do NOT forcibly assign last outDevice if no suitable one
//         // => If no correct outDevice found, outTime stays empty

//         const inTime = currentIn.clockDateTimeD;
//         const outTime = selectedOut ? selectedOut.clockDateTimeD : "";

//         // Update last used outTime
//         lastOutTime = outTime || lastOutTime;

//         result.push({
//             username: user?.staffNameC,
//             shiftdate: shiftdate,
//             shift: shift,
//             shifttype: shifttype,
//             companyname: user?.companyname,
//             empcode: user?.empcode,
//             inTime: inTime,
//             inTimeVerified: currentIn.verifyC,
//             inVerifiedDevice: currentIn.cloudIDC || currentIn.biometriccommonname,
//             outTime: outTime,
//             outTimeVerified: selectedOut?.verifyC || "",
//             outVerifiedDevice: selectedOut?.cloudIDC || selectedOut?.biometriccommonname || "",
//             totalHours: calculateTotalHours(inTime, outTime)
//         });
//     }

//     return result;
// }

function simplifiedTimesCheckAttendance(
  matchedUsers,
  times,
  user,
  shiftdate,
  shift,
  shifttype,
  verifiedby
) {
  const result = [];

  // Sort all entries by time
  matchedUsers.sort(
    (a, b) => parseDate(a.clockDateTimeD) - parseDate(b.clockDateTimeD)
  );

  // Separate by type
  const inDevices = matchedUsers.filter((u) => u.indevice);
  const outDevices = matchedUsers.filter((u) => u.outdevice);
  const inOutDevices =
    matchedUsers?.length > 1 ? matchedUsers.filter((u) => u.inoutdevice) : [];

  // 👉 Process indevice & outdevice separately
  let outDeviceIndex = 0;
  let lastOutTime = null;

  for (let i = 0; i < inDevices.length; i++) {
    const currentIn = inDevices[i];

    if (
      lastOutTime &&
      parseDate(currentIn.clockDateTimeD) <= parseDate(lastOutTime)
    ) {
      continue;
    }

    let selectedOut = null;
    while (outDeviceIndex < outDevices.length) {
      const potentialOut = outDevices[outDeviceIndex];
      if (
        parseDate(potentialOut.clockDateTimeD) >
        parseDate(currentIn.clockDateTimeD)
      ) {
        selectedOut = potentialOut;
        outDeviceIndex++;
        break;
      }
      outDeviceIndex++;
    }

    const inTime = currentIn.clockDateTimeD;
    const outTime = selectedOut ? selectedOut.clockDateTimeD : "";

    lastOutTime = outTime || lastOutTime;

    result.push({
      username: user?.staffNameC,
      shiftdate,
      shift,
      shifttype,
      companyname: user?.companyname,
      empcode: user?.empcode,
      inTime,
      inTimeVerified: currentIn.verifyC,
      inVerifiedDevice: currentIn.cloudIDC || currentIn.biometriccommonname,
      outTime,
      outTimeVerified: selectedOut?.verifyC || "",
      outVerifiedDevice:
        selectedOut?.cloudIDC || selectedOut?.biometriccommonname || "",
      totalHours: calculateTotalHours(inTime, outTime),
    });
  }

  // 👉 Process inoutdevice strictly in odd/even pairs (no mixing with indevice/outdevice)
  for (let i = 0; i < inOutDevices.length; i += 2) {
    const inEntry = inOutDevices[i];
    const outEntry = inOutDevices[i + 1]; // Might be undefined

    const inTime = inEntry?.clockDateTimeD || "";
    const outTime = outEntry?.clockDateTimeD || "";

    result.push({
      username: user?.staffNameC,
      shiftdate,
      shift,
      shifttype,
      companyname: user?.companyname,
      empcode: user?.empcode,
      inTime,
      inTimeVerified: inEntry?.verifyC || "",
      inVerifiedDevice: inEntry?.cloudIDC || inEntry?.biometriccommonname || "",
      outTime,
      outTimeVerified: outEntry?.verifyC || "",
      outVerifiedDevice:
        outEntry?.cloudIDC || outEntry?.biometriccommonname || "",
      totalHours: calculateTotalHours(inTime, outTime),
    });
  }
  result.sort((a, b) => parseDate(a.inTime) - parseDate(b.inTime));

  return result;
}

function calculateTotalHours(inTime, outTime) {
  if (!inTime || !outTime) return "";

  const inDate = parseDate(inTime);
  const outDate = parseDate(outTime);

  const diffInMs = outDate - inDate;
  const totalSeconds = Math.floor(diffInMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function calculateTotalHours(inTime, outTime) {
  if (!inTime || !outTime) return "";

  const inDate = parseDate(inTime);
  const outDate = parseDate(outTime);

  const diffInMs = outDate - inDate;
  const totalSeconds = Math.floor(diffInMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "-";
  let hrs = Math.floor(seconds / 3600);
  let mins = Math.floor((seconds % 3600) / 60);
  let secs = Math.floor(seconds % 60);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

exports.getOverallBiometricUsersAttendance = catchAsyncErrors(
  async (req, res, next) => {
    let result, totalProjects, overall;
    const {
      company,
      branch,
      unit,
      team,
      fromdate,
      todate,
      department,
      username,
      taskstatus,
      page,
      pageSize,
      allFilters,
      logicOperator,
      searchQuery,
    } = req.body;
    const skip = (page - 1) * pageSize; // Calculate the number of items to skip
    let query = {};
    let overallQuery = {};
    let queryUser = {};
    if (company.length > 0) {
      queryUser.company = { $in: company };
    }
    if (branch.length > 0) {
      queryUser.branch = { $in: branch };
    }
    if (unit.length > 0) {
      queryUser.unit = { $in: unit };
    }
    if (team.length > 0) {
      queryUser.team = { $in: team };
    }
    if (department.length > 0) {
      queryUser.department = { $in: department };
    }
    if (username?.length > 0) {
      queryUser.companyname = { $in: username };
    }
    const usernamesfilter = await User.find(queryUser, {
      companyname: 1,
      username: 1,
    }).lean();
    const UserNamesFromUser =
      usernamesfilter?.length > 0
        ? usernamesfilter?.map((data) => data?.username)
        : [];
    if (UserNamesFromUser?.length > 0) {
      query.staffNameC = { $in: UserNamesFromUser };
      overallQuery.staffNameC = { $in: UserNamesFromUser };
    }

    try {
      totalProjects = await Biometricattlog.countDocuments(query);
      overall = await Biometricattlog.find(overallQuery).lean();
      // Example filter for a specific user

      result = await Biometricattlog.aggregate([
        { $match: query }, // Apply filter based on biometricUserIDC or other conditions
        {
          $addFields: {
            parsedDateTime: {
              $dateFromString: {
                dateString: "$clockDateTimeD",
                format: "%d-%m-%Y %H:%M:%S",
              },
            },
          },
        },
        {
          $group: {
            _id: {
              dateOnly: {
                $dateToString: { format: "%d-%m-%Y", date: "$parsedDateTime" },
              },
            },
            firstEntry: { $first: "$$ROOT" }, // First entry (earliest time) of the date
            lastEntry: { $last: "$$ROOT" }, // Last entry (latest time) of the date
          },
        },
        { $sort: { "_id.dateOnly": 1 } }, // Sort by date
      ]);

      return res.status(200).json({
        totalProjects,
        currentPage: page,
        result,
        overall,
        totalPages: Math.ceil(totalProjects / pageSize),
      });
    } catch (err) {
      console.log(err, "errr");
      return next(new ErrorHandler("Records not found!", 404));
    }
  }
);

exports.addAttLog = catchAsyncErrors(async (req, res, next) => {
  try {
    const { biometricUserIDC, cloudIDC } = req.body;
    const username = await Biouploaduserinfo?.findOne(
      { biometricUserIDC, cloudIDC },
      { staffNameC: 1 }
    );
    if (username) {
      req.body.staffNameC = username.staffNameC;
    }
    req.body.photoC = biometricUserIDC == 0 ? req.body.photoC : "";
    let addattalog = await Biometricattlog.create(req.body);
    return res.status(200).json({
      returnStatus: true,
      returnMessage: "Successfully added!!",
      returnValue: "",
    });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 500));
  }
});

// Hierarchy Based Attendance Users Report
exports.getUsersTeamHierarchyAttendanceReports = catchAsyncErrors(
  async (req, res, next) => {
    let answer,
      usersCollection,
      filteredData = [];
    let resultedTeam, hierarchyNames;
    let { userDates, dateNow } = req.body;
    try {
      const answerUsernames = await getAllTrainingHierarchyReports(req);
      const userDetails =
        answerUsernames?.usernames?.length > 0
          ? await User.find(
              { companyname: { $in: answerUsernames?.usernames } },
              { username: 1 }
            )
          : [];
      const usernamesFilter =
        userDetails?.length > 0
          ? userDetails?.map((data) => data?.username)
          : [];
      const devicenames = await BiometricDeviceManagement.find(
        { biometricattendance: true, biometricbreak: true },
        { biometricserialno: 1 }
      );
      answer = await getUserClockinAndClockoutStatus({
        employee: usernamesFilter,
        userDates: userDates,
      });
      const finalUserShiftBased = filterShifts(answer?.finaluser, dateNow);
      usersCollection = await Biometricattlog.aggregate([
        {
          $match: {
            staffNameC: { $in: usernamesFilter },
            cloudIDC: {
              $in: devicenames?.map((data) => data?.biometricserialno),
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        {
          $addFields: {
            empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
            company: { $arrayElemAt: ["$userDetails.company", 0] },
            branch: { $arrayElemAt: ["$userDetails.branch", 0] },
            unit: { $arrayElemAt: ["$userDetails.unit", 0] },
            team: { $arrayElemAt: ["$userDetails.team", 0] },
            department: { $arrayElemAt: ["$userDetails.department", 0] },
            companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },
          },
        },
        {
          $project: {
            userDetails: 0,
          },
        },
      ]);

      filteredData = finalUserShiftBased?.flatMap(
        ({ rowusername, shiftdate, shift, shifttype }) => {
          const matchedUsers = usersCollection
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              const startTime = shiftdate?.startTime
                ? new Date(shiftdate.startTime)
                : null;
              const endTime = shiftdate?.endTime
                ? new Date(shiftdate.endTime)
                : null;
              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);

              if (
                startTime &&
                endTime &&
                !isNaN(clockTime) &&
                clockTime >= startTime &&
                clockTime <= endTime
              ) {
                return {
                  ...user,
                  matchedShift: shiftdate,
                  attendancedate: shiftdate?.date,
                  shifttype,
                };
              }
              return null;
            })
            .filter(Boolean);

          // **Step 3: Get previous day shift and count valid records**
          const prevShiftStart = shiftdate?.startTime
            ? new Date(shiftdate.startTime)
            : null;
          if (prevShiftStart) {
            prevShiftStart.setDate(prevShiftStart.getDate() - 1); // Move to previous day
          }

          const prevDayUsers = usersCollection
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
              return clockTime;
            })
            .filter(
              (clockTime) =>
                prevShiftStart &&
                clockTime >= prevShiftStart &&
                clockTime <= shiftdate.startTime
            );

          const isPrevDayOdd = prevDayUsers.length % 2 !== 0;
          const isTodayOdd = matchedUsers.length % 2 !== 0;

          // **Step 4: Adjust if both previous and today's data are odd**
          if (isPrevDayOdd && isTodayOdd && matchedUsers.length > 0) {
            const firstEntry = matchedUsers.shift(); // Remove first element from today's list
            prevDayUsers.push(firstEntry); // Add it to previous day's records
          }

          let inTime = null;
          let outTime = null;
          let totalHours = null;
          let inTimeVerified = null;
          let outTimeVerified = null;
          const clockTimes = matchedUsers.map((user) => user.clockDateTimeD);
          const verfiedBy = matchedUsers.map((user) => user.verifyC);

          if (matchedUsers.length > 0) {
            inTime = matchedUsers[0].clockDateTimeD;
            inTimeVerified = matchedUsers[0].verifyC;
            if (matchedUsers.length % 2 === 0) {
              outTime = matchedUsers[matchedUsers.length - 1].clockDateTimeD;
              outTimeVerified = matchedUsers[matchedUsers.length - 1].verifyC;
            }
            if (inTime && outTime) {
              const parseDate = (dateString) => {
                const [datePart, timePart] = dateString.split(" ");
                const [day, month, year] = datePart.split("-");
                return new Date(`${year}-${month}-${day}T${timePart}`);
              };
              const inDate = parseDate(inTime);
              const outDate = parseDate(outTime);
              const diffMs = outDate - inDate;
              const hours = String(
                Math.floor(diffMs / (1000 * 60 * 60))
              ).padStart(2, "0");
              const minutes = String(
                Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
              ).padStart(2, "0");
              const seconds = String(
                Math.floor((diffMs % (1000 * 60)) / 1000)
              ).padStart(2, "0");
              totalHours = `${hours}:${minutes}:${seconds}`;
            }
          }
          const userDataFinal =
            matchedUsers.length > 0
              ? matchedUsers[0]
              : usersCollection.find((user) => user.staffNameC === rowusername);
          return {
            shiftdate: shiftdate?.date ? shiftdate?.date : shift,
            ...userDataFinal,
            inTime: inTime ? formatToAmPm(inTime) : null,
            outTime: outTime ? formatToAmPm(outTime) : null,
            inTimeVerified,
            outTimeVerified,
            totalHours,
            clockTimes,
            verfiedBy,
            shift: shift,
            fixedData: processTimes(
              clockTimes,
              userDataFinal,
              shiftdate?.date ? shiftdate?.date : shift,
              shift,
              shifttype,
              verfiedBy
            ),
          };
        }
      );

      return res.status(200).json({
        answer,
        usersCollection,
        filteredData: filteredData?.filter((data) => data?.staffNameC),
        resultedTeam: answerUsernames?.resultedTeam,
        hierarchyNames: answerUsernames?.usernames,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

exports.getUsersTeamHierarchyAttendanceReportsCheck = catchAsyncErrors(
  async (req, res, next) => {
    let answer,
      usersCollection,
      filteredData = [];
    let resultedTeam, hierarchyNames;
    let { userDates, dateNow } = req.body;
    try {
      const answerUsernames = await getAllTrainingHierarchyReports(req);
      // console.log(answerUsernames, "answerUsernames")
      const userDetails =
        answerUsernames?.usernames?.length > 0
          ? await User.find(
              { companyname: { $in: answerUsernames?.usernames } },
              { username: 1 }
            )
          : [];
      const usernamesFilter =
        userDetails?.length > 0
          ? userDetails?.map((data) => data?.username)
          : [];

      // console.log(usernamesFilter, "usernamesFilter")
      // const devicenames = await BiometricDeviceManagement.find({ biometricattendance: true, biometricbreak: true }, { biometricserialno: 1 });
      const serialNos = await BiometricPairedDevicesGrouping.aggregate([
        // 1. Match records where any attendance flag is true
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceoutwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            devices: ["$paireddeviceone", "$paireddevicetwo"],
          },
        },

        // 3. Flatten devices array
        { $unwind: "$devices" },

        // 4. Filter out null/empty device names
        { $match: { devices: { $ne: null, $ne: "" } } },

        // 5. Lookup in BiometricDeviceManagement
        {
          $lookup: {
            from: "biometricdevicemanagements", // check actual collection name
            localField: "devices",
            foreignField: "biometriccommonname",
            as: "matchedDevice",
          },
        },

        // 6. Flatten lookup result
        { $unwind: "$matchedDevice" },

        // 7. Collect only serial numbers (deduped)
        {
          $group: {
            _id: null,
            serials: { $addToSet: "$matchedDevice.biometricserialno" },
          },
        },

        // 8. Final projection: return only array
        {
          $project: {
            _id: 0,
            serials: 1,
          },
        },
      ]);
      const biometricUsersGrouping = await BiometricUsersGrouping.aggregate([
        {
          $match: {
            $or: [
              { attendanceinone: true },
              { attendanceoutone: true },
              { attendanceinoutone: true },
              { attendanceintwo: true },
              { attendanceouttwo: true },
              { attendanceinouttwo: true },
            ],
          },
        },
        {
          $project: {
            companyname: 1,
            type: 1,
            paireddeviceone: {
              device: "$paireddeviceone",
              attendancein: "$attendanceinone",
              attendanceout: "$attendanceoutone",
              attendanceinout: "$attendanceinoutone",
            },
            paireddevicetwo: {
              device: "$paireddevicetwo",
              attendancein: "$attendanceintwo",
              attendanceout: "$attendanceouttwo",
              attendanceinout: "$attendanceinouttwo",
            },
          },
        },
        { $unwind: "$companyname" },
        {
          $lookup: {
            from: "users",
            localField: "companyname",
            foreignField: "companyname",
            as: "userMatch",
          },
        },
        { $unwind: "$userMatch" },
        {
          $project: {
            _id: 0,
            companyname: 1,
            type: 1,
            username: "$userMatch.username",
            userId: "$userMatch._id",
            devices: [
              {
                device: "$paireddeviceone.device",
                attendancein: "$paireddeviceone.attendancein",
                attendanceout: "$paireddeviceone.attendanceout",
                attendanceinout: "$paireddeviceone.attendanceinout",
              },
              {
                device: "$paireddevicetwo.device",
                attendancein: "$paireddevicetwo.attendancein",
                attendanceout: "$paireddevicetwo.attendanceout",
                attendanceinout: "$paireddevicetwo.attendanceinout",
              },
            ],
          },
        },
        { $unwind: "$devices" },

        // ✅ Lookup device details from biometricdevicemanagements
        {
          $lookup: {
            from: "biometricdevicemanagements",
            let: { deviceName: "$devices.device" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$biometriccommonname", "$$deviceName"],
                  },
                },
              },
              {
                $project: {
                  biometricserialno: 1,
                  biometriccommonname: 1,
                  _id: 0,
                },
              },
            ],
            as: "matchedDevice",
          },
        },
        {
          $unwind: { path: "$matchedDevice", preserveNullAndEmptyArrays: true },
        }, // keep rows even if no match
        {
          $project: {
            companyname: 1,
            type: 1,
            username: 1,
            userId: 1,
            device: "$devices.device",
            attendancein: "$devices.attendancein",
            attendanceout: "$devices.attendanceout",
            attendanceinout: "$devices.attendanceinout",
            deviceserialnumber: "$matchedDevice.biometricserialno",
            //  matchedDevice: 1
          },
        },
      ]);
      // 1. Create a map of device serials to grouped biometric user data by username and type
      const biometricGroupingMap = {};

      for (const group of biometricUsersGrouping) {
        const {
          deviceserialnumber,
          username,
          type,
          attendancein,
          attendanceout,
          attendanceinout,
        } = group;

        if (!biometricGroupingMap[deviceserialnumber]) {
          biometricGroupingMap[deviceserialnumber] = [];
        }

        biometricGroupingMap[deviceserialnumber].push({
          usernames: username,
          type,
          indevice: attendancein,
          outdevice: attendanceout,
          inoutdevice: attendanceinout,
        });
      }

      const pairedSerials = Object.values(biometricGroupingMap)
        .flat()
        .filter(Boolean);
      let matchQuery = {
        staffNameC: { $in: usernamesFilter },
      };

      // only add condition if serialNos[0]?.serials exists and not empty
      if (serialNos?.[0]?.serials?.length > 0) {
        matchQuery.cloudIDC = { $in: serialNos[0].serials };
      }

      // only add $nin if pairedSerials has values
      if (pairedSerials?.length > 0) {
        matchQuery.cloudIDC = {
          ...(matchQuery.cloudIDC || {}),
          $nin: pairedSerials,
        };
      }
      // console.log(biometricGroupingMap, pairedSerials, "biometricGroupingMap")
      const resultDate = expandDateRange(userDates);
      answer = await getUserClockinAndClockoutStatus({
        employee: usernamesFilter,
        userDates: userDates,
      });
      const finalUserShiftBased = filterShifts(answer?.finaluser, dateNow);
      const resultShiftValues = addShiftStatus(answer?.finaluser);

      usersCollection = await Biometricattlog.aggregate([
        {
          $match: {
            staffNameC: { $in: usernamesFilter },
            cloudIDC: { $in: serialNos[0].serials },
            clockDateOnly: { $in: resultDate },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "staffNameC",
            foreignField: "username",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "biometricdevicemanagements",
            localField: "cloudIDC",
            foreignField: "biometricserialno",
            as: "biometricDevice",
          },
        },
        // 🔹 Lookup pairing group based on device common name
        {
          $lookup: {
            from: "biometricpaireddevicesgroupings",
            let: {
              commonName: {
                $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$paireddeviceone", "$$commonName"] },
                      { $eq: ["$paireddevicetwo", "$$commonName"] },
                    ],
                  },
                },
              },
            ],
            as: "deviceMatched",
          },
        },
        {
          $addFields: {
            empcode: { $arrayElemAt: ["$userDetails.empcode", 0] },
            company: { $arrayElemAt: ["$userDetails.company", 0] },
            branch: { $arrayElemAt: ["$userDetails.branch", 0] },
            unit: { $arrayElemAt: ["$userDetails.unit", 0] },
            team: { $arrayElemAt: ["$userDetails.team", 0] },
            department: { $arrayElemAt: ["$userDetails.department", 0] },
            companyname: { $arrayElemAt: ["$userDetails.companyname", 0] },
            biometriccommonname: {
              $arrayElemAt: ["$biometricDevice.biometriccommonname", 0],
            },

            // 🔹 Conditional assignment based on matching device
            isDeviceOne: {
              $eq: [
                { $first: "$deviceMatched.paireddeviceone" },
                { $first: "$biometricDevice.biometriccommonname" },
              ],
            },
          },
        },
        {
          $addFields: {
            indevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinone" },
                { $first: "$deviceMatched.attendanceintwo" },
              ],
            },
            outdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceoutone" },
                { $first: "$deviceMatched.attendanceouttwo" },
              ],
            },
            inoutdevice: {
              $cond: [
                "$isDeviceOne",
                { $first: "$deviceMatched.attendanceinoutone" },
                { $first: "$deviceMatched.attendanceinouttwo" },
              ],
            },
          },
        },
        {
          $project: {
            userDetails: 0,
            biometricDevice: 0,
            deviceMatched: 0,
          },
        },
      ]);

      let filteredUsers = [];
      usersCollection.forEach((user) => {
        const userSerial = user.cloudIDC;
        const username = user.staffNameC;

        let matchedGroupings = [];

        // 🔎 Find all groupings that contain this username
        for (const [serial, groupings] of Object.entries(
          biometricGroupingMap
        )) {
          const userGroupings = groupings.filter((g) =>
            g.usernames.includes(username)
          );
          if (userGroupings.length > 0) {
            const groupingsWithSerial = userGroupings.map((g) => ({
              ...g,
              deviceSerial: serial,
            }));
            matchedGroupings.push(...groupingsWithSerial);
          }
        }

        if (matchedGroupings.length === 0) {
          filteredUsers.push(user);
          return;
        }

        // ✅ Only process if user's serial is one of the deviceSerials
        const matchedForUserSerial = matchedGroupings.filter(
          (g) => g.deviceSerial === userSerial
        );

        // We’ll store chosen priority once per username
        let chosenGrouping = null;

        if (matchedForUserSerial.length > 0) {
          // Group groupings by deviceSerial
          const devicePriorityMap = {};
          const deviceGroupingMap = {};

          matchedForUserSerial.forEach((g) => {
            const serial = g.deviceSerial;
            const existingType = devicePriorityMap[serial];

            if (
              !existingType ||
              typePriority[g.type] < typePriority[existingType]
            ) {
              devicePriorityMap[serial] = g.type;
              deviceGroupingMap[serial] = g; // Save full group to apply later
            }
          });

          const userDeviceTopPriorityType = devicePriorityMap[userSerial];
          chosenGrouping = deviceGroupingMap[userSerial];

          if (userDeviceTopPriorityType && chosenGrouping) {
            // Update the user's device flags ONLY for matching deviceSerial
            user.indevice = chosenGrouping.indevice ?? false;
            user.outdevice = chosenGrouping.outdevice ?? false;
            user.inoutdevice = chosenGrouping.inoutdevice ?? false;
          }
        }
        if (chosenGrouping) {
        }
        filteredUsers.push(user);
      });

      const shiftKeyCount = {};

      resultShiftValues.forEach((item) => {
        const key = `${item.rowusername}_${item.rowformattedDate}`;
        shiftKeyCount[key] = (shiftKeyCount[key] || 0) + 1;
      });
      const hasTwoShifts = (rowusername, rowformattedDate) => {
        const key = `${rowusername}_${rowformattedDate}`;
        return shiftKeyCount[key] > 1;
      };

      filteredData = resultShiftValues?.flatMap(
        ({
          rowusername,
          shiftdate,
          shift,
          shiftMode,
          shifttype,
          rowformattedDate,
          shiftStatus,
          hoursDifference,
        }) => {
          const matchedUsers = filteredUsers
            .filter((user) => user.staffNameC === rowusername)
            .map((user) => {
              const isDoubleShift = hasTwoShifts(rowusername, rowformattedDate);
              if (!user.indevice && !user.outdevice && !user.inoutdevice) {
                return null;
              }
              let startTime = null;
              let endTime = null;
              if (isDoubleShift) {
                if (shiftStatus === "Day Shift" && shiftMode === "Main Shift") {
                  startTime = shiftdate?.startTime;
                  endTime = addTwoHours(
                    shiftdate?.orgEndTime,
                    hoursDifference,
                    "Add"
                  );
                } else if (
                  shiftStatus === "Day Shift" &&
                  shiftMode === "Second Shift"
                ) {
                  startTime = addTwoHours(
                    shiftdate?.orgStartTime,
                    hoursDifference,
                    "Sub"
                  );
                  endTime = shiftdate?.endTime;
                } else if (
                  shiftStatus === "Night Shift" &&
                  shiftMode === "Main Shift"
                ) {
                  startTime = addTwoHours(
                    shiftdate?.orgStartTime,
                    hoursDifference,
                    "Sub"
                  );
                  endTime = shiftdate?.endTime;
                } else if (
                  shiftStatus === "Night Shift" &&
                  shiftMode === "Second Shift"
                ) {
                  startTime = shiftdate?.startTime;
                  endTime = addTwoHours(
                    shiftdate?.orgEndTime,
                    hoursDifference,
                    "Add"
                  );
                }
              } else {
                startTime = shiftdate?.startTime
                  ? new Date(shiftdate.startTime)
                  : null;
                endTime = shiftdate?.endTime
                  ? new Date(shiftdate.endTime)
                  : null;
              }

              const [datePart, timePart] = user?.clockDateTimeD.split(" ");
              const [day, month, year] = datePart.split("-");
              const clockTime = new Date(`${year}-${month}-${day}T${timePart}`);
              if (startTime && endTime && !isNaN(clockTime)) {
                if (clockTime >= startTime && clockTime <= endTime) {
                  return {
                    ...user,
                    clockTime,
                    matchedShift: shiftdate,
                    attendancedate: shiftdate?.date,
                  };
                }
              }
              return null;
            })
            .filter(Boolean);

          const isDoubleShift = hasTwoShifts(rowusername, rowformattedDate);
          const inDevices = matchedUsers.filter((u) => u.indevice);
          const outDevices = matchedUsers.filter((u) => u.outdevice);
          const inOutDevices = matchedUsers.filter((u) => u.inoutdevice);

          // Sort all by datetime
          const sortedInDevices = [...inDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const sortedOutDevices = [...outDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );
          const sortedInOutDevices = [...inOutDevices].sort(
            (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
          );

          let inTime = null,
            outTime = null;
          let inTimeVerified = null;
          let outTimeVerified = null;
          let totalHours = null;
          let inTimeVerifiedDevice = null;
          let outTimeVerifiedDevice = null;

          // Determine inTime
          if (!isDoubleShift && sortedInDevices.length > 0) {
            inTime = sortedInDevices[0].clockDateTimeD;
            inTimeVerified = sortedInDevices[0].verifyC;
            inTimeVerifiedDevice = sortedInDevices[0].biometriccommonname;
          } else if (!isDoubleShift && sortedInOutDevices.length > 0) {
            inTime = sortedInOutDevices[0].clockDateTimeD;
            inTimeVerified = sortedInOutDevices[0].verifyC;
            inTimeVerifiedDevice = sortedInOutDevices[0].biometriccommonname;
          } else if (isDoubleShift) {
            const firstDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const firatDeviceIn = firstDeviceBasedOnTime[0];
            const firstInDevice = matchedUsers
              ?.filter((data) => data?.indevice || data?.inoutdevice)
              .sort((a, b) => new Date(a.clockTime) - new Date(b.clockTime));
            // const first = firstInDevice[firstInDevice.length - 1];
            inTimeVerified = firstInDevice[0]?.verifyC;
            inTimeVerifiedDevice = firstInDevice[0]?.biometriccommonname;
            if (shiftStatus === "Day Shift" && shiftMode === "Main Shift") {
              inTime = firstInDevice[0].clockDateTimeD;
            } else if (
              shiftStatus === "Day Shift" &&
              shiftMode === "Second Shift"
            ) {
              inTime = firatDeviceIn?.indevice
                ? firatDeviceIn?.clockDateTimeD
                : addOneSecondAndFormat(shiftdate?.orgStartTime, 1);
            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Main Shift"
            ) {
              inTime = firatDeviceIn?.indevice
                ? firatDeviceIn?.clockDateTimeD
                : addOneSecondAndFormat(shiftdate?.orgStartTime, 1);
            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Second Shift"
            ) {
              inTime = firstInDevice[0].clockDateTimeD;
            }
          }

          // Determine outTime
          if (!isDoubleShift && sortedOutDevices.length > 0) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const last =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];

            if (last?.outdevice) {
              outTime = last.clockDateTimeD;
              outTimeVerified = last.verifyC;
              outTimeVerifiedDevice = last.biometriccommonname;
            }
          } else if (!isDoubleShift && sortedInOutDevices.length > 1) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const last =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime.length - 1];
            if (last?.inoutdevice) {
              outTime = last.clockDateTimeD;
              outTimeVerified = last.verifyC;
              outTimeVerifiedDevice = last.biometriccommonname;
            }
          } else if (isDoubleShift) {
            const LastDeviceBasedOnTime = matchedUsers?.sort(
              (a, b) => new Date(a.clockTime) - new Date(b.clockTime)
            );
            const lastDeviceOut =
              LastDeviceBasedOnTime[LastDeviceBasedOnTime?.length - 1];
            const lastOutDevice = matchedUsers
              ?.filter((data) => data?.outdevice || data?.inoutdevice)
              .sort((a, b) => new Date(a.clockTime) - new Date(b.clockTime));
            const last = lastOutDevice[lastOutDevice.length - 1];

            outTimeVerified = last.verifyC;
            outTimeVerifiedDevice = last.biometriccommonname;
            if (shiftStatus === "Day Shift" && shiftMode === "Main Shift") {
              outTime =
                lastDeviceOut?.outdevice || lastDeviceOut?.inoutdevice
                  ? lastDeviceOut?.clockDateTimeD
                  : addOneSecondAndFormat(shiftdate?.orgEndTime, 0);
            } else if (
              shiftStatus === "Day Shift" &&
              shiftMode === "Second Shift"
            ) {
              outTime = last.clockDateTimeD;
            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Main Shift"
            ) {
              outTime =
                lastDeviceOut?.outdevice || lastDeviceOut?.inoutdevice
                  ? lastDeviceOut?.clockDateTimeD
                  : addOneSecondAndFormat(shiftdate?.orgEndTime, 0);
            } else if (
              shiftStatus === "Night Shift" &&
              shiftMode === "Second Shift"
            ) {
              outTime = last.clockDateTimeD;
            }
          }

          if (inTime && outTime) {
            const parseDate = (dateString) => {
              const [datePart, timePart] = dateString.split(" ");
              const [day, month, year] = datePart.split("-");
              return new Date(`${year}-${month}-${day}T${timePart}`);
            };
            const inDate = parseDate(inTime);
            const outDate = parseDate(outTime);
            const diffMs = outDate - inDate;
            const hours = String(
              Math.floor(diffMs / (1000 * 60 * 60))
            ).padStart(2, "0");
            const minutes = String(
              Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            ).padStart(2, "0");
            const seconds = String(
              Math.floor((diffMs % (1000 * 60)) / 1000)
            ).padStart(2, "0");
            totalHours = `${hours}:${minutes}:${seconds}`;
          }

          const clockTimes = matchedUsers.map((u) => u.clockDateTimeD);
          const verfiedBy = matchedUsers.map((u) => u.verifyC);
          const userDataFinal =
            matchedUsers.length > 0
              ? matchedUsers[0]
              : filteredUsers.find((user) => user.staffNameC === rowusername);

          return {
            shiftdate: shiftdate?.date ? shiftdate.date : shift,
            ...userDataFinal,
            inTime: inTime ? formatToAmPm(inTime) : null,
            outTime: outTime ? formatToAmPm(outTime) : null,
            totalHours,
            inTimeVerified,
            inTimeVerifiedDevice,
            outTimeVerified,
            outTimeVerifiedDevice,
            verfiedBy,
            clockTimes,
            shifttype,
            // fixedData: processTimesCheck(clockTimes, userDataFinal, shiftdate?.date ? shiftdate?.date : shift, shift, shifttype, verfiedBy, matchedUsers),
            modifiedData: simplifiedTimesCheckAttendance(
              matchedUsers,
              clockTimes,
              userDataFinal,
              shiftdate?.date ? shiftdate?.date : shift,
              shift,
              shifttype,
              verfiedBy
            ),
          };
        }
      );

      return res.status(200).json({
        answer,
        usersCollection,
        filteredData: filteredData?.filter((data) => data?.staffNameC),
        resultedTeam: answerUsernames?.resultedTeam,
        hierarchyNames: answerUsernames?.usernames,
        DataAccessMode: answerUsernames?.DataAccessMode,
      });
    } catch (err) {
      console.log(err, "err");
      return next(new ErrorHandler("Records not found!", 500));
    }
  }
);

const getAllTrainingHierarchyReports = async (req) => {
  let overallRestrictList, answer;
  let branches = [];
  try {
    const { listpageaccessmode, sector, username, hierachy } = req.body;
    // console.log(req?.body?.role,"req")
    const pagename = "menubiometricteamattendancereport";

    let levelFinal =
      sector === "all" ? ["Primary", "Secondary", "Tertiary"] : [sector];

    let hierarchyData = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose: username, // Match supervisorchoose with username
          level: { $in: levelFinal }, // Corrected unmatched quotation mark
        },
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: {
            teamControlsArray: {
              $ifNull: ["$pagecontrols", []],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$name", "$$teamControlsArray"],
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        pagename,
                        "$reportingnew", // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ],
                    }, // Additional condition for reportingnew array
                  ],
                },
              },
            },
          ],
          as: "reportData", // The resulting matched documents will be in this field
        },
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1,
        },
      },
    ]);

    const HierarchySupervisorFind = await Hirerarchi.find({
      supervisorchoose: req?.body?.username,
    });
    DataAccessMode =
      req.body.role?.some((role) => role.toLowerCase() === "manager") &&
      HierarchySupervisorFind?.length === 0;
    const { uniqueNames, pageControlsData } = await Hierarchyfilter(
      levelFinal,
      req?.body?.pagename
    );
    let restrictList = hierarchyData
      ?.filter((data) => data?.reportData?.length > 0)
      ?.flatMap((Data) => Data?.employeename);

    let result = await User.find(
      {
        enquirystatus: { $nin: ["Enquiry Purpose"] },
        resonablestatus: {
          $nin: [
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
            "Releave Employee",
            "Absconded",
            "Hold",
            "Terminate",
          ],
        },
        ...(listpageaccessmode === "Reporting to Based"
          ? { reportingto: username }
          : {}),
      },
      { username: 1 }
    );

    let hierarchyFilter = await Hirerarchi.find({ level: sector });

    let userFilter = hierarchyFilter
      .filter((data) => data.supervisorchoose.includes(username))
      .map((data) => data.employeename);

    let hierarchyDefList = await Hirerarchi.find();

    let user = await User.find({ companyname: username });

    const userDesignation = user.length > 0 ? user[0].designation : "";
    const designations = await Designation.find();

    let HierarchyFilt =
      sector === "all"
        ? hierarchyDefList
            .filter((data) => data.supervisorchoose.includes(username))
            .map((data) => data.designationgroup)
        : hierarchyFilter
            .filter((data) => data.supervisorchoose.includes(username))
            .map((data) => data.designationgroup);

    let DesifFilter = designations.filter((data) =>
      HierarchyFilt.includes(data.group)
    );
    let desigName = DesifFilter.length > 0 ? DesifFilter[0].name : "";

    let SameDesigUser =
      HierarchyFilt.includes("All") || userDesignation === desigName;

    let hierarchyFinal =
      sector === "all"
        ? hierarchyDefList
            .filter((data) => data.supervisorchoose.includes(username))
            .map((data) => data.employeename)
            .flat()
        : hierarchyFilter.length > 0
        ? userFilter.flat()
        : [];

    let resulted = result.filter((item) =>
      hierarchyFinal.includes(item.username)
    );

    let hierarchySecond = await Hirerarchi.find();

    const findSubordinates = (supervisors) => {
      return hierarchySecond
        .filter((item) =>
          item.supervisorchoose.some((name) => supervisors.includes(name))
        )
        .map((item) => item.employeename)
        .flat();
    };

    let level1 = findSubordinates(hierarchyFinal);
    let level2 = findSubordinates(level1);
    let level3 = findSubordinates(level2);
    let level4 = findSubordinates(level3);
    let level5 = findSubordinates(level4);

    branches.push(...level1, ...level2, ...level3, ...level4, ...level5);

    let myallTotalNames = DataAccessMode
      ? uniqueNames
      : [...hierarchyFinal, ...branches];
    const finalResultTask = await User.find(
      {
        enquirystatus: { $nin: ["Enquiry Purpose"] },
        resonablestatus: {
          $nin: [
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
            "Releave Employee",
            "Absconded",
            "Hold",
            "Terminate",
          ],
        },
        ...(listpageaccessmode === "Reporting to Based"
          ? { reportingto: username }
          : {}),
      },
      { companyname: 1 }
    );

    let restrictTeam = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose: { $in: myallTotalNames },
          level: { $in: levelFinal },
        },
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: { teamControlsArray: { $ifNull: ["$pagecontrols", []] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$name", "$$teamControlsArray"] },
                    { $in: [pagename, "$reportingnew"] },
                  ],
                },
              },
            },
          ],
          as: "reportData",
        },
      },
      {
        $project: { supervisorchoose: 1, employeename: 1, reportData: 1 },
      },
    ]);

    let restrictListTeam = DataAccessMode
      ? pageControlsData
      : restrictTeam
          .filter((data) => data?.reportData?.length > 0)
          .flatMap((data) => data?.employeename);
    let overallEmpNames = DataAccessMode
      ? uniqueNames
      : hierachy === "myhierarchy"
      ? hierarchyFinal
      : hierachy === "allhierarchy"
      ? branches
      : [...hierarchyFinal, ...branches];

    let overallResList = DataAccessMode
      ? restrictListTeam
      : hierachy === "myhierarchy"
      ? restrictList
      : hierachy === "allhierarchy"
      ? restrictListTeam
      : [...restrictList, ...restrictListTeam];

    overallRestrictList = overallEmpNames?.filter((data) =>
      overallResList?.includes(data)
    );
  } catch (err) {
    console.error("Error fetching reports:", err);
    return new ErrorHandler("Records not found", 404);
  }
  return {
    usernames: [...new Set(overallRestrictList)],
    resultedTeam: [...new Set(branches)],
    DataAccessMode,
  };
};
