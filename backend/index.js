const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDb = require("./config/connection");
const nodemailer = require("nodemailer");
const authRoute = require("./route/auth");
const draftRoute = require("./route/draft");
const companyRoute = require("./route/setup");
const projectsRoute = require("./route/project");
const hrmoduleRoute = require("./route/hr");
const hrfacilityRoute = require("./route/hrfacility");
const roleRoute = require("./route/role");
const excelRoute = require("./route/excel");
const attendanceRoute = require("./route/attendance");
const accountRoute = require("./route/account");
const remarkRoute = require("./route/remarks");
const ticketRoute = require("./route/tickets");
const leaveRoute = require("./route/leave");
const stockRoute = require("./route/stock");
const expenseRoute = require("./route/expense");
const interviewRoute = require("./route/interview");
const referenceRoute = require("./route/reference");
const passwordRoute = require("./route/password");
const productionRoute = require("./route/production");
const clientSupport = require("./route/clientsupport");
const hiConnect = require("./route/hiconnect");
const settingRoute = require("./route/settings");
const taskRoute = require("./route/task");
const permissionRoute = require("./route/permission");
const Accuracy = require('./route/accuracymaster');
const Biometric = require('./route/biometric');
const ebRoute = require("./route/eb");
const multer = require("multer");
const cron = require("node-cron");
const moment = require("moment");
const axios = require("axios");
const Interactor = require("./route/interactor");
const fs = require("fs");
const path = require("path");
const mime = require('mime-types');
const employeeapi = require("./model/modules/settings/Maintenancelog");
const errorMiddleware = require("./middleware/errorHandle");
const Department = require("./model/modules/department");
const Departmentmonthset = require("./model/modules/departmentmonthset");
const Attandance = require("./model/modules/attendance/attendance");
const Shift = require("./model/modules/shift");
const Designation = require("./model/modules/designation");
const Designationmonthset = require("./model/modules/DesignationMonthSetModel");
const Paiddatemode = require("./model/modules/production/paiddatemode");
const greetingsRoute = require("./route/greetinglayout");
const Process = require("./model/modules/production/ProcessQueueNameModel");
const Processmonthset = require("./model/modules/ProcessMonthSetModel");
const AttendanceControlCriteria = require("./model/modules/settings/Attendancecontrolcriteria");
const Designationgroup = require("./model/modules/designationgroup");
const NotAddedBills = require("./model/modules/expense/NotaddedBills");
const SchedulePaymentMaster = require("./model/modules/expense/SchedulePaymentMaster");
const pm2 = require("pm2");
const { getDay, getDate, getMonth, format } = require("date-fns");
const { ObjectId } = require('mongodb');
const TemplatecontrolpanelModel = require('./model/modules/documents/Templatecontrolpnael')
const Departmentanddesignationgrouping = require('./model/modules/departmentanddesignationgrouping');
const idleTimeRoute = require("./route/idletime");
const mikrotik = require("./route/mikrotik");
const { fetchAndStoreMikroTikLogs } = require("./controller/modules/mikrotik/Logs.js");
const { deleteUserActivityScreenshot } = require("./controller/login/userActivity");
const IdleTime = require("./model/login/idletime");
const Cors = require("cors");
const User = require("./model/login/auth");

const bowerBiometric = require('./route/bowerBiometric');
const zlib = require('zlib');
// const Visitors = require(".model/modules/interactors/visitor");

const TaskForUser = require("./model/modules/task/taskforuser");
// Setting up config fileapp.use
const { initWebSocket  , sendCommandToDeviceAttendance} = require('./controller/modules/deviceSocket.js');
const { fetchDeviceLogs } = require('./controller/modules/BiometricF51A.js');
const BiometricUnregisteredUsers = require('./model/modules/biometric/biometricUnregistered.js');

// const BiometricDeviceManagementModel = require('./model/modules/BiometricDeviceManagementModel');
const { getAttendanceDetails , getUserListForAllUsers , getUserListForAllVisitors ,deleteMultipleVisitor} = require('./route/bowerBiometric.js');


const { fetchDeviceRecords } = require('./controller/modules/BiometricOpenApi.js');
// cron.schedule("* * * * *", async () => {
//   try {
//     const OpenApiDetails = await fetchDeviceRecords("42001");

//     if (OpenApiDetails?.length > 0) {
//       const uniqueLogs = await removeDuplicateLogsForUserAddition(OpenApiDetails);
//       if(uniqueLogs?.length){
//                const response = await axios.post(
//           `http://192.168.1.5:7001/api/biometricattlog/new`,
//           uniqueLogs
//         );
//       }
//       console.log(uniqueLogs, "uniqueLogs");
//     } else {
//       console.log("No records found.");
//     }
//   } catch (error) {
//     console.error("Error running cron job:", error);
//   }
// });

async function urlToBase64(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    // Prepend mime type (important for previews)
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    console.error("Error converting to base64:", err.message);
  }
} 

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?* ]/g, "_"); // replace invalid chars with "_"
}

async function saveUrlAsFile(imageUrl, filename) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");

  const uploadDir = path.join(__dirname, "BiometricUnregisteredUsers");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const safeFilename = sanitizeFilename(filename);
  const filePath = path.join(uploadDir, safeFilename);

  fs.writeFileSync(filePath, buffer);

    return `/BiometricUnregisteredUsers/${safeFilename}`;
}



function formatUnixToDateTime(timestamp) {
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getEndOfTodayUnix() {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59
  );
  return Math.floor(endOfDay.getTime() / 1000);
}

const nowInSeconds = Math.floor(Date.now() / 1000);
const expirationToday = getEndOfTodayUnix();

console.log("Now:", nowInSeconds, formatUnixToDateTime(1756201064345408/1000));
console.log("Expiration (end of today):", expirationToday, formatUnixToDateTime(expirationToday));

const addNewVisitorToBoweeDevice = async()=>{
try{
     
 const bowee = await axios.post("http://192.168.1.5:7001/api/addnewbiometricvisitor",
        {
          biometricdevicename : "FC-8190H25065069" ,
          PeopleJson : PeopleJson
        });
}
catch(err){
  console.log("errMessage : " + err.message)
}
}








// (async () => {
//      const result = await getUserListForAllVisitors("http://192.168.85.14");
// if(result?.DataList?.length > 0){
//   const ids =result?.DataList?.map(data => data?.biometricUserIDC);
//   console.log("Result:", ids);
//        const resultDelete = await deleteMultipleVisitor(ids,"http://192.168.85.14")
// }

  
// })();


async function main(result) {
  try {
    const dataCheck = await Promise.all(
      result?.ArrayUnRegisterRecords?.map(async (data) => {
        const rawFilename = `${data?.cloudIDC}-${data?.clockDateTimeD}.jpg`;
        return {
          ...data,
          photourl: await saveUrlAsFile(data.photoC, rawFilename),
        };
      }) || []
    );

    removeDuplicateUnregisteredLogs(dataCheck)
    console.log(dataCheck, "dataCheck");
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}


// main();


// Run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  try {
    const todayDate = new Date();
    const cutoffDateObj = new Date();
    cutoffDateObj.setDate(todayDate.getDate() - 7);

    // format YYYY-MM-DD
    const yyyy = cutoffDateObj.getFullYear();
    const mm = String(cutoffDateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(cutoffDateObj.getDate()).padStart(2, "0");
    const cutoffDate = `${yyyy}-${mm}-${dd}`;
    // const cutoffDate = `2025-10-01`;

    // 1. Find all records to delete
    const oldRecords = await BiometricUnregisteredUsers.find({
      dateformat: { $lt: cutoffDate }
    });
    console.log(oldRecords , "ddn")

    // 2. Delete files from filesystem
    for (const record of oldRecords) {
      if (record.photourl) {
        // If you saved URL like "/BiometricUnregisteredUsers/xxx.jpg"
        const filename = record.photourl.split("/").pop(); 
        const filePath = path.join(__dirname, "BiometricUnregisteredUsers", filename);

        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`[CRON] Deleted file: ${filePath}`);
          } catch (err) {
            console.error(`[CRON] Failed to delete file ${filePath}`, err);
          }
        }
      }
    }

    // 3. Delete records from DB
    const result = await BiometricUnregisteredUsers.deleteMany({
      dateformat: { $lt: cutoffDate }
    });

    console.log(`[CRON] Deleted ${result.deletedCount} DB records older than ${cutoffDate}`);
  } catch (err) {
    console.error("Error deleting old records:", err);
  }
});





// cron.schedule('* * * * *', async () => {
//   console.log('🔄 Running attendance fetch at', new Date().toLocaleString());
//   const biometricdevicemanagement = await BiometricDeviceManagement.find({ brand: "Bowee" }, { biometricassignedip: 1 });

//   const IPAddresss = biometricdevicemanagement?.map(data => `http://${data?.biometricassignedip}`);
//   // console.log(IPAddresss , 'IPAddresss');
//   if (IPAddresss?.length > 0) {
//     const deviceUrls = IPAddresss;

//     for (const url of deviceUrls) {
//       try {
//         const result = await getAttendanceDetails(url);

//         if (result.success) {
//           // removeDuplicateLogs(result.ArrayRecords);
//           main(result)
//           console.log(`✅ Attendance fetched from ${url}`);
//         } else {
//           console.error(`❌ Failed to fetch from ${url}:`, result.message);
//         }
//       } catch (err) {
//         console.error(`🔥 Error fetching from ${url}:`, err.message);
//       }
//     }
//   }

// });








const RemoteWorkMode = require("./model/login/remoteworkmode")// adjust path
const EmployeeDocuments = require("./model/login/employeedocuments.js")// adjust path
const uploadDir = path.join(__dirname, './RemoteEmployeeLists');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
function getMimeExtension(mimeType) {
  return {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf'
  }[mimeType] || '';
}
const saveBase64FileRemote = async (base64String, nameHint = 'file') => {
  try {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) throw new Error('Invalid base64 format');

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = getMimeExtension(mimeType);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return {
      filename,
      name: nameHint,
      path: filePath,
      mimetype: mimeType,
    };
  } catch (error) {
    console.error(`❌ Error saving file: ${nameHint}`, error.message);
    return null;
  }
};
async function migrateBase64PhotosToFiles() {
  try {
    const allDocs = await RemoteWorkMode.aggregate([
  {
    $match: {
      addremoteworkmode: {
        $elemMatch: {
          $or: [
            { "wfhsetupphoto.0": { $exists: true } },
            { "internetssidphoto.0": { $exists: true } }
          ]
        }
      }
    }
  }
]);;
    console.log(`Total Documents: ${allDocs?.length}`);

    for (const doc of allDocs) {
      let updated = false;

      for (const entry of doc.addremoteworkmode || []) {
        const newWFHPhotos = [];
        for (const img of entry.wfhsetupphoto || []) {
          // console.log('🧪 img object:', JSON.stringify(img, null, 2));
          if (img?.preview?.startsWith('data:')) {
          
            const file = await saveBase64FileRemote(img.preview, img.name || 'WFH Setup');
            if (file) {
              newWFHPhotos.push(file);
              updated = true;
            }
          }
        }
        entry.wfhsetupphoto = newWFHPhotos;

        const newSSIDPhotos = [];
        for (const img of entry.internetssidphoto || []) {
          if (img?.preview?.startsWith('data:')) {
            const file = await saveBase64FileRemote(img.preview, img.name || 'SSID Photo');
            if (file) {
              newSSIDPhotos.push(file);
              updated = true;
            }
          }
        }
        entry.internetssidphoto = newSSIDPhotos;
      }

      if (updated) {
        await doc.save();
        console.log(`✅ Updated: ${doc.employeeid}`);
      }
    }

    console.log('✅ All documents processed.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}
async function saveBase64FileEmployee(base64Data, filename = 'file') {
  try {
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = path.extname(filename) || '.bin';
    const mimeType = mime.lookup(ext) || 'application/octet-stream';
    const extension = mime.extension(mimeType) || 'bin';

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${filename}`;
    const uploadDir = path.join(__dirname, './EmployeeUserDocuments');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    return {
      originalname: filename,
      filename: uniqueName,
      path: filePath,
      mimetype: mimeType,
    };
  } catch (err) {
    console.error('❌ Failed to save file:', err.message);
    return null;
  }
}
async function migrateEmployeeDocumentsBase64() {
  try {
const docs = await EmployeeDocuments.find({
  files: {
    $exists: true,
    $not: { $size: 0 }, // Ensures files array is not empty
    // $elemMatch: { data: { $exists: true, $ne: null } } // At least one item has data
  }
});


    console.log(`Total documents to migrate: ${docs.length}`);

    for (const doc of docs) {
      let updated = false;
      const newFiles = [];

      for (const file of doc.files || []) {
        if (file?.data && file.orginpath !== "Employee Documents" && !file?.path) {
          const converted = await saveBase64FileEmployee(file.data, file.name || 'file');
          if (converted) {
            newFiles.push({
              ...converted,
              name: file.name || converted.originalname,
              remark: file.remark || '',
            });
            updated = true;
          }
        } else {
          // already multer style? keep as is
          newFiles.push(file);
        }
      }

      if (updated) {
        doc.files = newFiles;
        await doc.save();
        console.log(`✅ Migrated: ${doc.empcode}`);
      }
    }

    // console.log('✅ Migration complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}


// Start migration
// migrateBase64PhotosToFiles();
// migrateEmployeeDocumentsBase64();

// initWebSocket();
const INTERVAL_MS = 8000; // every 10 seconds
function formatToDDMMYYYYWithTime(datetimeStr) {
    const date = new Date(datetimeStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}



const crypto = require('crypto');



// setInterval(async () => {
//   try {
//     const logs = await fetchDeviceLogs();
//     //const logsCommand = await sendCommandToDeviceAttendance({ cmd: "getnewlog", stn: true });
// //  console.log(logs , "logs")
//     let combinedResult = [];

//     // // ✅ Handle logsCommand (new logs from device)
//     // if (logsCommand?.record?.length > 0) {
//     //   const resultCommand = logsCommand.record.map(item => ({
//     //     biometricUserIDC: item?.enrollid,
//     //     clockDateTimeD: formatToDDMMYYYYWithTime(item?.time),
//     //     cloudIDC: logsCommand?.sn,
//     //     verifyC: item?.mode === 2 ? "Pass" :item?.mode === 8 ? "FACE" : "",
//     //     staffNameC: item?.name
//     //   }));
//     //   combinedResult.push(...resultCommand);
//     // }

//     if (logs?.length > 0) {
//       const result = logs.map(item => ({
//         biometricUserIDC: item?.accNo,
//         clockDateTimeD: formatToDDMMYYYYWithTime(item?.passTime),
//         cloudIDC: item?.deviceKey,
//         verifyC: item?.mode === 2 ? "Pass" : "",
//         staffNameC: item?.username
//       }));
//       combinedResult.push(...result);
//     }

//     // console.log(combinedResult , "combinedResult")
//     // // ✅ Deduplicate combined logs
//     // if (combinedResult.length > 0) {
//     //   removeDuplicateLogs(combinedResult);
//     // }

//   } catch (err) {
//     console.error('❌ Failed to fetch logs:', err.message);
//   }
// }, INTERVAL_MS);

const Hierarchy = require("./model/modules/setup/hierarchy.js");

const getHierarchyCombinedDatas = async () => {
    try {
        const response = await axios.get("http://192.168.1.5:7001/api/hirerarchies");

        const groupList = response.data.hirerarchi;

          const groupedData = groupList.reduce((acc, item) => {
            const key = [
              item.company, item.designationgroup, item.department,
              item.branch, item.unit, item.team, item.mode,
              item.level, item.control, item.supervisorchoose, item.pagecontrols
            ].join('|');

            if (!acc[key]) {
              acc[key] = { 
                ...item, 
                employeename: [...item.employeename], 
                unid: [item._id], 
                empids: [item.empcode] 
              };
            } else {
              acc[key].employeename.push(...item.employeename);
              acc[key].unid.push(item._id);
              acc[key].empids.push(item.empcode);
            }

            return acc;
          }, {});
          const groupedArrayAggregate =await Hierarchy.aggregate([
            // 1. Only include documents where access === "all"
            { $match: { access: "all" } },

            // 2. Group by the combined fields
            {
              $group: {
                _id: {
                  company: "$company",
                  designationgroup: "$designationgroup",
                  department: "$department",
                  branch: "$branch",
                  unit: "$unit",
                  team: "$team",
                  mode: "$mode",
                  level: "$level",
                  control: "$control",
                  supervisorchoose: "$supervisorchoose",
                  pagecontrols: "$pagecontrols"
                },
                employeename: { $push: "$employeename" }, // Collect all employeenames
                unid: { $push: "$_id" },                 // Collect _ids
                empids: { $push: "$empcode" }            // Collect empcodes
              }
            },
            {
                $lookup: {
                  from: "teams", // your MongoDB collection name
                  localField: "_id.branch",
                  foreignField: "branch", // field in teams collection that matches branch
                  as: "branchTeams"
                }
              },
                {
                  $addFields: {
                    team: {
                      $cond: {
                        if: { $and: [ { $eq: ["$_id.team", "All"] }, { $ne: ["$_id.branch", "All"] } ] },
                        // then: "$branchTeams.teamname", // replace with array of team names
                         then: { $map: { input: "$branchTeams", as: "t", in: "$$t.teamname" } },
                        else: ["$_id.team"]
                      }
                    }
                  }
                },
            // 3. Re-shape the document
            {
              $project: {
                _id: 0,
                company: "$_id.company",
                designationgroup: "$_id.designationgroup",
                department: "$_id.department",
                branch: "$_id.branch",
                unit: "$_id.unit",
                // team: "$_id.team",
                team: 1, 
                mode: "$_id.mode",
                level: "$_id.level",
                control: "$_id.control",
                supervisorchoose: "$_id.supervisorchoose",
                pagecontrols: "$_id.pagecontrols",
                employeename: 1,
                unid: 1,
                empids: 1
              }
            }
          ])

          console.log(groupedArrayAggregate?.filter(data => data?.branch !== "All")
          ?.map(data => `${data?.team}-${data?.branch}`), 'groupedArrayAggregate')
          // console.log(groupedArrayAggregate?.filter(data => data?.team !== "All")
          // ?.map(data => data?.team), 'groupedArrayAggregate')

        const groupedArray = Object.values(groupedData);
        const filteredGroups = groupedArray.filter(group =>group.access === "all");
        const filteredGroupsCombined = groupedArray.filter(group =>group.access === "all")
      // Team-based array
      const teamBasedArray = filteredGroupsCombined.filter(group =>
        group.company?.trim() &&
        group.branch?.trim() &&
        group.unit?.trim() &&
        group.team?.trim() &&
        group.designationgroup?.trim()
      );

      // Department-based array
      const departmentBasedArray = filteredGroupsCombined.filter(group =>
        group.company?.trim() &&
        group.department?.trim() &&
        group.designationgroup?.trim()
      );

      //console.log("Team Based Array:", teamBasedArray?.filter(data => data?.team !== "All")?.map(data => `${data?.company}-${data?.branch}-${data?.unit}-${data?.team}-${data?.designationgroup}`));
      //console.log("Team Based Array ALL:", teamBasedArray?.filter(data => data?.team == "All")?.map(data => `${data?.company}-${data?.branch}-${data?.unit}-${data?.team}-${data?.designationgroup}`));
      // console.log("Department Based Array:", departmentBasedArray?.map(data => `${data?.company}-${data?.department}-${data?.designationgroup}`));
        const filteredGroupsNotAll = groupedArray.filter(group =>group.access !== "all");
        //console.log(groupList?.length ,groupedArray?.length ,filteredGroups?.length, filteredGroupsNotAll?.length, '385 index')
    } catch (err) {
        console.error("Error hirerarchi in index 386 :", err.message);
    }
};
// getHierarchyCombinedDatas()




const removeDuplicateLogs = async (logs) => {
    try {
        const response = await axios.post("http://192.168.1.5:7001/api/duplicatebiometriclogs", {
            logs: logs
        });

        const uniqueLogs = response.data.uniqueLogs;
    } catch (err) {
        console.error("Error removing duplicate logs:", err.message);
    }
};
const removeDuplicateUnregisteredLogs = async (logs) => {
    try {
        const response = await axios.post("http://192.168.1.5:7001/api/duplicatebiometricunregisteredusers", {
            logs: logs
        });

        const uniqueLogs = response.data.uniqueLogs;
    } catch (err) {
        console.error("Error removing duplicate logs:", err.message);
    }
};

// const userDetailsList = async () => {
//   try {
//         const usersstatus = await User.aggregate([
//   // 1. Filter users by resonablestatus
//   {
//     $match: {
//       resonablestatus: {
//         $nin: [
//           "Not Joined",
//           "Postponed",
//           "Rejected",
//           "Closed",
//           "Releave Employee",
//           "Absconded",
//           "Hold",
//           "Terminate"
//         ]
//       }
//     }
//   },

//   // // 2. Lookup into EmployeeDocuments using _id and companyname
//   // {
//   //   $lookup: {
//   //     from: "employeedocuments", // Use actual MongoDB collection name
//   //     let: {
//   //       userId: { $toString: "$_id" },
//   //       userCompanyName: "$companyname"
//   //     },
//   //     pipeline: [
//   //       {
//   //         $match: {
//   //           $expr: {
//   //             $and: [
//   //               // { $eq: ["$commonId", "$$userId"] },
//   //               { $eq: ["$companyname", "$$userCompanyName"] }
//   //             ]
//   //           }
//   //         }
//   //       },
//   //       {
//   //         $project: {
//   //           profileimage: 1
//   //         }
//   //       }
//   //     ],
//   //     as: "documents"
//   //   }
//   // },

//   // // 3. Add profileimage from first matching document
//   // {
//   //   $addFields: {
//   //     profileimage: { $arrayElemAt: ["$documents.profileimage", 0] }
//   //   }
//   // },

//   // 4. Final projection
//   {
//     $project: {
//       resonablestatus: 1,
//       company: 1,
//       empcode: 1,
//       companyname: 1,
//       addremoteworkmode: 1,
//       team: 1,
//       username: 1,
//       unit: 1,
//       branch: 1,
//       profileimage: 1
//     }
//   }
// ]);
//   } catch (err) {
//     console.error("Error fetching unique logs:", err.message);
    
//     // Optional: Show full response error (if available)
//     if (err.response) {
//       console.error("Server Response:", err.response.data);
//     }
//   }
// };
// userDetailsList();



const userDetailsList = async () => {
  try {
    const usersstatus = await User.aggregate([
      {
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
              "Terminate"
            ]
          }
        }
      },
      {
        $project: {
          resonablestatus: 1,
          company: 1,
          empcode: 1,
          companyname: 1,
          addremoteworkmode: 1,
          team: 1,
          username: 1,
          unit: 1,
          branch: 1,
          profileimage: 1
        }
      }
    ]);

    return usersstatus;
  } catch (err) {
    console.error("Error fetching users:", err.message);
    if (err.response) {
      console.error("Server Response:", err.response.data);
    }
    return [];
  }
};

const BiometricDeviceManagement = require("./model/modules/BiometricDeviceManagementModel");

// Deleting the Visitor
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled login job at midnight...');
  try {
    const deviceManagement = await BiometricDeviceManagement.find(
      { isVisitor: true },
      { biometricassignedip: 1 }
    );

    const ipAddresses = deviceManagement
      ?.map(data => data?.biometricassignedip)
      .filter(Boolean); // removes null/undefined

    if (!ipAddresses?.length) {
      console.log('No visitor devices found.');
      return;
    }

    // Loop through each IP address
    for (const ip of ipAddresses) {
      const deviceUrl = `http://${ip}`;
      console.log(`Processing device: ${deviceUrl}`);

      const result = await getUserListForAllVisitors(deviceUrl);

      if (result?.DataList?.length > 0) {
        const ids = result.DataList.map(data => data.biometricUserIDC);
        console.log(`Deleting ${ids.length} visitors from ${deviceUrl}`);
        await deleteMultipleVisitor(ids, deviceUrl);
      } else {
        console.log(`No visitors found for device: ${deviceUrl}`);
      }
    }

    console.log('All visitor devices processed successfully.');
  } catch (err) {
    console.error('Scheduled job failed:', err.message);
  }
}, {
  timezone: 'Asia/Kolkata'
});



// cron.schedule('0 0 * * *', async () => {
//   console.log('Running scheduled login job at midnight...');
//   try {
//     const visitorCollection = await Visitors.find(
//       { isVisitor: true },
//       { biometricassignedip: 1 }
//     );

//     console.log('All visitor devices processed successfully.');
//   } catch (err) {
//     console.error('Scheduled job failed:', err.message);
//   }
// }, {
//   timezone: 'Asia/Kolkata'
// });


// Main entry
const syncAllBoweeUsers = async () => {
  try {
    // Step 1: Get all Bowee device IPs
    const biometricdevicemanagement = await BiometricDeviceManagement.find(
      { brand: "Bowee" },
      { biometricassignedip: 1 }
    );

    // Step 2: Map to device URLs (add port + protocol)
    const deviceUrls = biometricdevicemanagement.map(
      (data) => `http://${data.biometricassignedip}`
    );

    if (!deviceUrls.length) {
      console.log("⚠️ No Bowee devices found");
      return;
    }

    // Step 3: Pass URLs to your main user fetching function
    await userDetailsListFromBowee(deviceUrls);
  } catch (err) {
    console.error("Error in syncAllBoweeUsers:", err.message);
  }
};

const userDetailsListFromBowee = async (urls) => {
  try {
    let allUsers = [];

    // Step 1: Loop through all device URLs
    for (const url of urls) {
      const result = await getUserListForAllUsers(url);
//  console.log(result , `result`);
      if (result?.success && result?.DataList?.length) {
        allUsers.push(...result.DataList);
      }
    }

    // Step 2: Remove duplicates (send allUsers to your API)
    const uniqueLogs = await removeDuplicateLogsForUserAddition(allUsers);

    // Step 3: Upload only unique users
    for (const user of uniqueLogs) {
      try {
        // const response = await axios.post(
        //   `http://192.168.8.14:7000/api/addbiometricIndividualUser/new`,
        //   user
        // );

        console.log(`✅ User ${user.staffNameC}- ${user.cloudIDC} uploaded successfully`);
      } catch (err) {
        console.error(`❌ Failed to upload ${user.staffNameC}:`, err.message);
      }
    }

  } catch (err) {
    console.error("Error in userDetailsListFromBowee:", err.message);
  }
};

const removeDuplicateLogsForUserAddition = async (logs) => {
  try {
    // 1. Fetch existing logs from backend
    const existingResponse = await axios.get(
      "http://192.168.1.5:7001/api/biouploaduserinfos"
    );

    const existingLogs = existingResponse.data.alluploaduserinfo || [];
    console.log(existingLogs, "existingLogs");

    // 2. Build a lookup set
    const existingSet = new Set(
      existingLogs.map((log) => `${log.userId}_${log.timestamp}`)
    );

    // 3. Filter only unique logs
    const uniqueLogs = logs.filter(
      (log) => !existingSet.has(`${log.userId}_${log.timestamp}`)
    );

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

// prevent overlapping runs
let isSyncRunning = false;

// cron.schedule("*/10 * * * *", async () => {
//   if (isSyncRunning) {
//     console.log("⚠️ Previous sync still running, skipping this run.");
//     return;
//   }

//   isSyncRunning = true;
//   try {
//     console.log("⏳ Starting Bowee sync job...");
//     // await syncAllBoweeUsers();
//     console.log("✅ Bowee sync job finished");
//   } catch (err) {
//     console.error("❌ Error in cron job:", err.message);
//   } finally {
//     isSyncRunning = false;
//   }
// });

// const userDetailsListFromBowee = async () => {
// const result = await getUserListForAllUsers();

// if (result?.success && result?.DataList?.length) {
//   for (const user of result.DataList) {
//     try {
//       const response = await axios.post(
//         `http://192.168.8.14:7000/api/addbiometricIndividualUser/new`,
//         user,
//       );

//       console.log(`User ${user.staffNameC} uploaded successfully`);
//     } catch (err) {
//       console.error(`Failed to upload ${user.staffNameC}:`, err.message);
//     }
//   }
// }


// };

// userDetailsListFromBowee()

const FormData = require('form-data');

function addNewUserToDevice(peopleObj, photoPath, token) {
  const form = new FormData();
  form.append('PeopleJson', JSON.stringify(peopleObj));

  // console.log(token , photoPath)
  if (photoPath && photoPath.buffer) {
    form.append('Photo', photoPath.buffer, {
      filename: photoPath.originalname,
      contentType: photoPath.mimetype
    });
  }
  const headers = {
    ...form.getHeaders(),
    'Authorization': `Bearer ${token}`, // 🔑 Authorization is required
    'Content-Length': form.getLengthSync(), // Optional but helps
  };
  return axios.post(`${process.env.BOWER_DEVICE_URL}/api/People/New`, form, {
    headers,
    timeout: 10000, // Optional: set timeout
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })
    .then(res => {
      return { success: res.data?.result, content: res.data?.content };
    })
.catch(err => {
    return {
      success: false,
      error: err.response?.data || err.message || 'Unknown error',
      status: err.response?.status || 500
    };
  });

}
const performLogin = async () => {
  const adminPassword = process.env.BOWER_DEVICE_PASSWORD;
  const hash = crypto.randomUUID();
  const saltedPassword = hash + adminPassword + hash;
  const hashedPassword = crypto.createHash('md5').update(saltedPassword).digest('hex').toUpperCase();

  const payload = {
    password: hashedPassword,
    Hash: hash
  };

  try {
    const response = await axios.post(`${process.env.BOWER_DEVICE_URL}/api/User/Login`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const token = response.data.content.token;
    return token; // 🔸 return the token
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    throw err;
  }
};

// const boweeDeviceCheckUserId = async () => {
//   try {
//     const response = await axios.get("http://localhost:7001/api/getnewbiometricuserid");
//     const uniqueLogs = response.data?.NewUserID;
//             const PeopleJson = {
//             "UserID": String(uniqueLogs),
//             "Name": usersstatus[0]?.username,
//             "Job": "Staff",
//             "AccessType": 0,
//             "OpenTimes": 65535,
//             "Photo": usersstatus[0]?.profileimage
//         };
//          const token = await performLogin();
//     const responseUser = await addNewUserToDevice(PeopleJson, usersstatus[0]?.profileimage , token); // Use `await` here

//         console.log(PeopleJson , 'PeopleJson')
//   } catch (err) {
//     console.error("Error fetching unique logs:", err.message);
    
//     // Optional: Show full response error (if available)
//     if (err.response) {
//       console.error("Server Response:", err.response.data);
//     }
//   }
// };

// // Call the function
// boweeDeviceCheckUserId();


// dotenv.config();

// Serve static files
// app.use(express.static(path.join(__dirname, 'public')));


// Connection to database mongodb
// connectDb();


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const syncAllUsersToDevice = async () => {
  const users = await userDetailsList();

  for (const user of users) {
    try {
      const response = await axios.get("http://localhost:7001/api/getnewbiometricuserid");
      const uniqueUserID = response.data?.NewUserID;

      const PeopleJson = {
        UserID: String(uniqueUserID),
        Name: user?.username,
        Job: "Staff",
        AccessType: 0,
        OpenTimes: 65535,
        Photo: user?.profileimage
      };

      // 🔐 First token attempt
      let token = await performLogin();
      let responseUser = await addNewUserToDevice(PeopleJson, user?.profileimage, token);

      // ❌ If upload fails, retry with new token
      if (!responseUser.success) {
        console.warn(`Initial upload failed for ${user.username}. Retrying with new token...`);
        token = await performLogin(); // 🔁 Get new token
        responseUser = await addNewUserToDevice(PeopleJson, user?.profileimage, token);
      }

      if (responseUser.success) {
        console.log(`✅ Uploaded user ${user.username} with ID ${uniqueUserID}`);
      } else {
        console.error(`❌ Failed to upload user ${user.username} after retry:`, responseUser.error);
      }

      await sleep(5000); // ⏳ Wait before next user
    } catch (err) {
      console.error(`💥 Unexpected error uploading user ${user.username}:`, err.message || err);
    }
  }
};

// syncAllUsersToDevice();


// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const syncAllUsersToDevices = async () => {
  const users = await userDetailsList();

  for (const user of users) {
    let attempt = 0;
    const maxAttempts = 3;
    let success = false;

    while (attempt < maxAttempts && !success) {
      attempt++;
      try {
        const response = await axios.get("http://localhost:7001/api/getnewbiometricuserid");
        const uniqueUserID = response.data?.NewUserID;

        const PeopleJson = {
          UserID: String(uniqueUserID),
          Name: user?.username,
          Job: "Staff",
          AccessType: 0,
          OpenTimes: 65535,
          Photo: user?.profileimage
        };

        let token = await performLogin();
        let responseUser = await addNewUserToDevice(PeopleJson, user?.profileimage, token);

        if (!responseUser.success) {
          console.warn(`⚠️ Attempt ${attempt}: Upload failed for ${user.username}, retrying with new token...`);
          token = await performLogin();
          responseUser = await addNewUserToDevice(PeopleJson, user?.profileimage, token);
        }

        if (responseUser.success) {
          console.log(`✅ Uploaded user ${user.username} with ID ${uniqueUserID} on attempt ${attempt}`);
          success = true;
        } else {
          console.error(`❌ Attempt ${attempt} failed for ${user.username}:`, responseUser.error);
        }

      } catch (err) {
        console.error(`💥 Attempt ${attempt} crashed for ${user.username}:`, err.message || err);
      }

      if (!success && attempt < maxAttempts) {
        console.log(`🔁 Retrying user ${user.username} after delay...`);
        await sleep(3000); // Wait before retry
      }
    }

    if (!success) {
      console.error(`❌ Giving up on user ${user.username} after ${maxAttempts} attempts`);
    }

    await sleep(2000); // Wait before next user
  }
};

// syncAllUsersToDevices()

const upload = multer();
const Busboy = require('busboy'); // ✅ no .default needed


const app = express();


app.use(Cors());

const port = process.env.PORT || 7001;
const env = process.env.NODE_ENV;
const http = require('http');
const server = http.createServer(app); // ✅ Use http.createServer to get full control



// const server = app.listen(port, () => console.log(`Server started at ${env} mode port ${port}`));
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  server.close(() => {
    process.exit(1);
  });
});



// // Your route handler
// app.get('/login', (req, res) => {
//   // Extract token from query parameters
//   const token = req.query.token;

//   if (!token) {
//     return res.status(400).send('Token is required');
//   }

//   // Proceed to validate the token or perform other actions
//   res.send('Token received');
// });

// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });

// app.get("/login", async (req, res) => {
//   const token = req.query.token;
//   try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id);

//       if (!user) {
//           return res.status(401).send("Unauthorized");
//       }

//       // Redirect to the dashboard with user information
//       res.redirect(`/dashboard?userId=${user._id}`);
//   } catch (err) {
//       res.status(400).send("Invalid token");
//   }
// });

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api", permissionRoute, authRoute, idleTimeRoute, taskRoute, mikrotik, settingRoute, productionRoute, passwordRoute, expenseRoute, referenceRoute, interviewRoute, leaveRoute, stockRoute, ticketRoute, projectsRoute, draftRoute, hrmoduleRoute, roleRoute, companyRoute, hrfacilityRoute, excelRoute, attendanceRoute, remarkRoute, accountRoute, ebRoute,Biometric, Interactor, Accuracy, hiConnect, clientSupport, greetingsRoute);

//face detection api
app.use("/api/weights", express.static(path.join(__dirname, "weights")));
app.use("/RemoteEmployeeLists", express.static(path.join(__dirname, "RemoteEmployeeLists")));
app.use("/EmployeeUserDocuments", express.static(path.join(__dirname, "EmployeeUserDocuments")));
app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/reference', express.static(path.join(__dirname, 'reference')));
app.use('/taskUserPanel', express.static(path.join(__dirname, 'taskUserPanel')));
app.use('/raiseTicketMaster', express.static(path.join(__dirname, 'raiseTicketMaster')));
app.use('/uploadsDocuments', express.static(path.join(__dirname, 'uploadsDocuments')));
app.use('/candidateDocuments', express.static(path.join(__dirname, 'candidateDocuments')));
app.use('/BiometricUnregisteredUsers', express.static(path.join(__dirname, 'BiometricUnregisteredUsers')));
app.use('/ManualDocumentPreparation', express.static(path.join(__dirname, 'ManualDocumentPreparation')));
app.use("/api/organizationdocumentfiles", express.static(path.join(__dirname, "organizationdocumentModule")));
app.use('/api/useractivity', express.static(path.join(__dirname, 'useractivity')));
app.use(bodyParser.json());




// app.post('/Device/Keepalive', (req, res) => {
//   // Handle device keep-alive logic
//   console.log(req?.body , moment().format("DD-MM-YYYY hh:mm:ss A") , "Running")
//   res.json({
//     Success: 0,
//     AddPeople: 1,
//     DeletePeople: 0,
//     SyncParameter: 1,
//     Remote: 1,
//     UploadWorkParameter: 0
//   });
// });

// Simulated pending actions per device SN (for demo)


app.post('/Device/Keepalive', async (req, res) => {
  console.log('Keepalive hit:', req.body);
try {
  const allusers = await axios.post(`http://192.168.8.14:7000/api/bioonlinestatus/new`, {
    cloudIDC: req.body?.SN,
    lastOnlineTimeC : formatToDDMMYYYYWithTime(new Date())
  });
} catch (error) {
  console.error("Error posting to bioonlinestatus/new:", error?.response?.data || error.message);
}

  // Respond immediately
  res.json({
"Success":1,
"AddPeople":0,
"DeletePeople":0,
"SyncParameter":0,
"Remote":0,
"UploadWorkParameter": 0
});
});

app.post('/Device/RemoteCommand', async (req, res) => {
 console.log('RemoteCommand hit:', req.body);

  // Respond immediately
  res.json({
Success: 0,   
//  PushAllPeople:1,
  //  RepostRecord:1,
"QueryPeople":[25]
  }); 
});


app.post('/People/DeletePeopleList', async (req, res) => {
 console.log('DeletePeopleList hit:', req.body);

  // Respond immediately
  res.json({
"Success": 0,   
"DeleteList":[25]
  }); 
});
// app.post('/Device/DownloadWorkSetting', async (req, res) => {
// //  console.log('DownloadWorkSetting hit:', req.body ,req?.headers);

//   // Respond immediately
//   res.json({
// Success: 1,   
//   }); 
// });
app.post('/Device/Remote', async (req, res) => {
 console.log('Remote hit:', req.body ,req?.headers );

  // Respond immediately
  res.json({
Success: 1,   
  }); 
});

//Store unique records here
const uniquePunches = [];

app.post('/Record/UploadSystemRecord',async(req, res) => {
  const { SN, RecordDetail } = req.body;
console.log( req?.files , req?.headers, "UploadSystemRecord");
 res.json({
Success: 1,   
  }); 
});
app.post('/Record/UploadIdentifyRecord', (req, res) => {
  // console.log( req?.files ,res?.body ,  req?.headers, "UploadIdentifyRecord");
  res.json({"Success": 1, message: "Received identify record" });

});



// Authorization simulation (custom logic can replace this)
const isDeviceAuthorized = (sn) => {
  const authorizedDevices = ['FC-8380T12345678', 'FC-8190H25031119'];
  return authorizedDevices.includes(sn);
};











const uniqueUsers = [];

// 🔹 Forward personnel data directly from client to biometric device
app.post('/api/People/New', upload.fields([
  { name: 'PeopleJson', maxCount: 1 },
  { name: 'Photo', maxCount: 1 },
]), async (req, res) => {

  const peopleJsonRaw = req.body.PeopleJson;
//console.log(req.body ,'peopleJsonRaw')
  if (!peopleJsonRaw) {
    return res.status(400).json({
      result: false,
      errCode: 3,
      message: 'Missing PeopleJson or Authorization header',
    });
  }

  try {
    const peopleJson = JSON.parse(peopleJsonRaw);
//console.log(peopleJson ,'peopleJson')
    const response = await addUserToDevice(peopleJson);
    return res.json({
Success: 1,
peopleJson
  });
  } catch (err) {
    console.error('❌ Error:', err.message);
    return res.status(500).json({
      result: false,
      errCode: 1,
      message: 'Failed to forward PeopleJson to device',
    });
  }
});


app.post('/People/PushPeople', upload.any(),(req, res) => {
  const detailFile = req.files.find(f => f.fieldname === 'Detail');
let peopleJSON={}
  if (!detailFile) {
    console.error('❌ No Detail file received');
    return res.status(400).json({ Success: 0, Message: 'No Detail file found' });
  }

  zlib.gunzip(detailFile.buffer, (err, decodedBuffer) => {
    if (err) {
      console.error('❌ Failed to unzip Detail:', err);
      return res.status(500).json({ Success: 0, Message: 'Failed to unzip Detail' });
    }

    try {
      const personnelData = JSON.parse(decodedBuffer.toString('utf-8'));
      const { SN } = req.body;
      const { CardNum, Photo, UserID, Name, Password } = personnelData;

      const newUser = { SN, CardNum, UserID, Name, Password };

      // 🔍 Check for existing user by UserID
      const exists = uniqueUsers.some(user => user.UserID === newUser.UserID);

      if (!exists) {
        uniqueUsers.push(newUser); // ✅ Add only if unique
        //console.log('✅ New user added:', newUser);
      } else {
        //console.log(`⚠️ Duplicate user skipped: ${newUser.UserID}`);
        console.log(uniqueUsers, "Unique users");
    //addUserToDevice(peopleJSON)
      }
//console.log("Hitted");
      res.json({ Success: 1 , peopleJSON});
    } catch (parseErr) {
      console.error('❌ Failed to parse personnel JSON:', parseErr);
      return res.status(500).json({ Success: 0, Message: 'Invalid JSON in Detail' });
    }
  });
});





// 4. DownloadPeopleList (sends personnel list to device)

app.post('/People/DownloadPeopleList', async (req, res) => {
  const { SN, Limit } = req.body;

  console.log('DownloadPeopleList hit:', req.body, req.headers);

  // Fetch personnel data from your DB based on the device SN (this is mock data)
  const allPeople = [
    {
      UserID: "24",
      Name: "John Doe",
      Job: "Developer",
      Department: "IT Department",
      IdentityCard: "ID12345678",
      Attachment: "Employee Badge Holder",
      Photo: "",
      PhotoMD5: "",
      PhotoLen: 55020,
      Password: "1234",
      CardNum: "",
      QRCode: "",
      AccessType: 0, // 0: normal, 1: admin, 2: blacklist
      ExpirationDate: 0, // 0 = never expires
      OpenTimes: 65535,
      KeepOpen: 1,
      Timegroup: 6,
      Holidays: "1,3,5,7",
      Elevators: "1,2,3,4,5",
      FaceFeature: "",
      FaceFeatureMD5: "",
      Fingerprints: [],
      Palmveins: []
    },
    {
      UserID: "25",
      Name: "Jane Smith",
      Job: "Manager",
      Department: "Sales",
      IdentityCard: "",
      Attachment: "",
      Photo: "",
      PhotoMD5: "",
      PhotoLen: 54321,
      Password: "5678",
      CardNum: "9876543210123456",
      QRCode: "",
      AccessType: 0,
      ExpirationDate: 0,
      OpenTimes: 65535,
      KeepOpen: 0,
      Timegroup: 3,
      Holidays: "",
      Elevators: "",
      FaceFeature: "",
      FaceFeatureMD5: "",
      Fingerprints: [],
      Palmveins: []
    }
  ];

  const limitedList = allPeople.slice(0, Limit || 50);

  // If no personnel left to send, return PeopleCount = 0
  if (limitedList.length === 0) {
    return res.json({
      Success: 1,
      Message: "No more personnel to send",
      PeopleCount: 0,
      PeopleList: []
    });
  }

  // Respond with the personnel list
  res.json({
    Success: 1,
    Message: "Sending personnel data",
    PeopleCount: limitedList.length,
    PeopleList: limitedList
  });
});


// 5. DownloadPeopleListResult (device sends result after processing list)
app.post('/People/DownloadPeopleListResult', async (req, res) => {
  console.log('DownloadPeopleListResult hit:', req.body);

  // Log received result
  // res.data is not valid in Express — use req.body
  console.log('Device result:', req.body);

  res.json({
    Success: 0,
    Message: "Acknowledged"
  });
});



// 4. DownloadPeopleList (sends personnel list to device)
app.post('/People/Search', async (req, res) => {
  console.log('Search hit:', req.body);


  res.json({
    Success: 1,
  });
});




cron.schedule('0 1 * * *', async () => {
  console.log('Running scheduled login job...');
  try {
    // const token = await performLogin();
    // Save the token somewhere if needed (DB, memory, file, etc.)
  } catch (err) {
    console.error('Scheduled login failed:', err.message);
  }
});
server.listen(port, () => {
  console.log(`Server started at ${env} mode port ${port}`);
});


const mergeChunks = async (fileName, totalChunks) => {
  const chunkDir = __dirname + "/chunks";
  const mergedFilePath = __dirname + "/merged_files";

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
  console.log("Chunks merged successfully");
};

app.post("/api/upload", upload.single("file"), async (req, res) => {
  // console.log("Hit");

  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const fileName = req.body.originalname;

  const chunkDir = __dirname + "/chunks"; // Directory to save chunks
  // console.log(chunkDir, 'chunkDir')
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);
    // console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

    if (chunkNumber === totalChunks - 1) {
      // If this is the last chunk, merge all chunks into a single file
      await mergeChunks(fileName, totalChunks);
      console.log("File merged successfully");
    }

    res.status(200).json({ message: "Chunk uploaded successfully" });
  } catch (error) {
    console.error("Error saving chunk:", error);
    res.status(500).json({ error: "Error saving chunk" });
  }
});

app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'merged_files', filename);

    // Log the file path to check if this part is being executed
    // console.log('File Path:', filePath);

    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/octet-stream');
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    // Log any errors that occur during file retrieval
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});



// target points pages starting functionality

const mergeChunkss = async (fileName, totalChunks) => {
  const chunkDir = __dirname + "/chunkss";
  const mergedFilePath = __dirname + "/uploads";

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
  // console.log("Chunks merged successfully");
};

app.post("/api/uploadfile", upload.single("file"), async (req, res) => {
  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const fileName = req.body.originalname;
  // const fileConj = ;
  const fileSize = req.body.filesize;
  // console.log(chunk, chunkNumber, totalChunks, fileName)
  const chunkDir = __dirname + "/chunkss"; // Directory to save chunks
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);

    if (chunkNumber === totalChunks - 1) {
      await mergeChunkss(fileName, totalChunks);
    }

    res.status(200).json({ message: "Chunk uploaded successfully" });
  } catch (error) {
    console.error("Error saving chunk:", error);
    res.status(500).json({ error: "Error saving chunk" });
  }
});

app.get('/api/downloads/:filename', (req, res) => {

  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);


    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/octet-stream');
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    // Log any errors that occur during file retrieval
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// target points pages ending functionality


// Revenue amount pages starting functionality

const mergeChunkssRevenue = async (fileName, totalChunks) => {
  const chunkDir = __dirname + "/chunkss";
  const mergedFilePath = __dirname + "/revenueuploads";

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
  // console.log("Chunks merged successfully");
};

app.post("/api/revenueuploadfile", upload.single("file"), async (req, res) => {
  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const fileName = req.body.originalname;

  const fileSize = req.body.filesize;
  const chunkDir = __dirname + "/chunkss"; // Directory to save chunks
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);

    if (chunkNumber === totalChunks - 1) {
      // If this is the last chunk, merge all chunks into a single file
      await mergeChunkssRevenue(fileName, totalChunks);

    }

    res.status(200).json({ message: "Chunk uploaded successfully" });
  } catch (error) {
    console.error("Error saving chunk:", error);
    res.status(500).json({ error: "Error saving chunk" });
  }
});

app.get('/api/revenuedownloads/:filename', (req, res) => {

  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'revenueuploads', filename);


    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/octet-stream');
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    // Log any errors that occur during file retrieval
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Revenue amount pages ending functionality

// ERA amount pages starting functionality

const mergeChunkssEra = async (fileName, totalChunks) => {
  const chunkDir = __dirname + "/chunkss";
  const mergedFilePath = __dirname + "/eraamountuploads";

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
  // console.log("Chunks merged successfully");
};

app.post("/api/eraamountuploadfile", upload.single("file"), async (req, res) => {
  // console.log("Hit");
  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const fileName = req.body.originalname;
  const fileSize = req.body.filesize;
  const chunkDir = __dirname + "/chunkss"; // Directory to save chunks
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);

    if (chunkNumber === totalChunks - 1) {
      // If this is the last chunk, merge all chunks into a single file
      await mergeChunkssEra(fileName, totalChunks);
      // console.log("File merged successfully");
    }

    res.status(200).json({ message: "Chunk uploaded successfully" });
  } catch (error) {
    console.error("Error saving chunk:", error);
    res.status(500).json({ error: "Error saving chunk" });
  }
});

app.get('/api/eraamountdownloads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'eraamountuploads', filename);
    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/octet-stream');
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    // Log any errors that occur during file retrieval
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ERA amount pages ending functionality

//--------------------------- BIRTHDAY WISHES -----------------------------------
app.post("/api/schedule-birthdayemail", (req, res) => {
  const { email, date, time, name, company } = req.body;

  // Parse the date and time strings into a Moment object
  const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

  // Set up the Nodemailer transporter
  const transporters = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cshankari27@gmail.com",
      pass: "vqhzwuklzypwruyu"
    }
  });

  // Define the email message
  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject: `Happy Birthday ${name}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Birthday Wishes</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
   
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
   
        h1 {
          color: #333;
          text-align: center;
        }
   
        p {
          color: #555;
          line-height: 1.6;
        }
   
        .birthday-gift {
          text-align: center;
          margin-top: 20px;
        }
   
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
   
        .signature {
          margin-top: 20px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Happy Birthday ${name}! 🎉🎂</h1>
   
        <p>
          Dear ${name},
        </p>
   
        <p>
          Wishing you a fantastic and joyful birthday! 🎈 On this special day, we want to take a moment to celebrate you and express our gratitude for the incredible contributions you make to our team.
        </p>
   
        <p>
          May this year bring you immense joy, new adventures, and continued success both personally and professionally. Your hard work, dedication, and positive attitude inspire us all.
        </p>
   
        <p>
          We hope you take some time today to relax, enjoy the company of your loved ones, and indulge in your favorite treats!
        </p>
   
        <div class="signature">
          Best wishes,<br>
          ${company}
        </div>
      </div>
    </body>
    </html>`

  };

  // // Schedule the email to be sent at the specified time
  // cron.schedule(scheduledTime.format("m H D M d"), () => {
  //   transporters.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       res
  //         .status(500)
  //         .json({ message: "An error occurred while sending the email." });
  //     } else {
  //       res.json({ message: "Email sent successfully!" });
  //     }
  //   });
  // });

  // Send a response to the client
  res.json({ message: "Email scheduled successfully!" });
});

//--------------------------- WEDDING ANNIVERSARY WISHES -----------------------------------
app.post("/api/schedule-weddingemail", (req, res) => {
  const { email, date, time, name, company } = req.body;

  // Parse the date and time strings into a Moment object
  const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

  // Set up the Nodemailer transporter
  const transporters = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cshankari27@gmail.com",
      pass: "vqhzwuklzypwruyu"
    }
  });

  // Define the email message
  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject: `Happy Wedding Anniversary ${name}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Anniversary Wishes</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
   
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
   
        h1 {
          color: #333;
          text-align: center;
        }
   
        p {
          color: #555;
          line-height: 1.6;
        }
   
        .celebration-image {
          text-align: center;
          margin-top: 20px;
        }
   
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
   
        .signature {
          margin-top: 20px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Celebrating Love and Togetherness! 💑</h1>
   
        <p>
          Dear ${name},
        </p>
   
        <p>
          On this special day, we are overjoyed to extend our heartfelt congratulations on your wedding anniversary! 🎉 Today marks another year of love, companionship, and cherished moments together.
        </p>
   
        <p>
          Your commitment to each other is truly inspiring, and we feel privileged to share in the joy of this milestone. May your journey continue to be filled with love, laughter, and countless beautiful memories.
        </p>
   
        <p>
          Wishing you both a wonderful celebration and many more years of happiness ahead!
        </p>
   
        <div class="signature">
          Best wishes,<br>
          ${company}
        </div>
      </div>
    </body>
    </html>
    `

  };

  // // Schedule the email to be sent at the specified time
  // cron.schedule(scheduledTime.format("m H D M d"), () => {
  //   transporters.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       res
  //         .status(500)
  //         .json({ message: "An error occurred while sending the email." });
  //     } else {
  //       res.json({ message: "Email sent successfully!" });
  //     }
  //   });
  // });

  // Send a response to the client
  res.json({ message: "Email scheduled successfully!" });
});

//--------------------------- WORK ANNIVERSARY WISHES -----------------------------------
app.post("/api/schedule-workanniversaryemail", (req, res) => {
  const { email, date, time, name, company } = req.body;

  // Parse the date and time strings into a Moment object
  const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

  // Set up the Nodemailer transporter
  const transporters = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cshankari27@gmail.com",
      pass: "vqhzwuklzypwruyu"
    }
  });

  // Define the email message
  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject: `Happy Work Anniversary ${name}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Anniversary Wishes</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
   
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
   
        h1 {
          color: #333;
          text-align: center;
        }
   
        p {
          color: #555;
          line-height: 1.6;
        }
   
        .congratulations-image {
          text-align: center;
          margin-top: 20px;
        }
   
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
   
        .signature {
          margin-top: 20px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Congratulations on Your Work Anniversary! 🎉</h1>
   
        <p>
          Dear ${name},
        </p>
   
        <p>
          Happy work anniversary! 🥳 It's an honor to celebrate this milestone with you as you mark another year of dedication, hard work, and valuable contributions to our team.
        </p>
   
        <p>
          Your commitment and passion are truly appreciated. We are grateful for the positive impact you've made, and we look forward to many more successful years together.
        </p>
   
        <p>
          Thank you for your outstanding efforts and for being an integral part of our team's success.
        </p>
   
        <div class="signature">
          Best wishes,<br>
          ${company}
        </div>
      </div>
    </body>
    </html>
   
    `

  };

  // // Schedule the email to be sent at the specified time
  // cron.schedule(scheduledTime.format("m H D M d"), () => {
  //   transporters.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       res
  //         .status(500)
  //         .json({ message: "An error occurred while sending the email." });
  //     } else {
  //       res.json({ message: "Email sent successfully!" });
  //     }
  //   });
  // });

  // Send a response to the client
  res.json({ message: "Email scheduled successfully!" });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cshankari27@gmail.com",
    pass: "srgvavrpyvkznjyl",
  },
});

app.post("/send-email", (req, res) => {
  const { name, email, message, company } = req.body;

  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject: "Your account details",
    html: `<html>

    <head>
        <style>
            /* Add your CSS styles here */
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
            }
   
            .message {
                color: #333;
                border: 1px solid #ccc;
                background-color: #fff;
                width: 550px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
   
            }
   
            .topbar {
                height: 70px;
                background: #1976d2;
                position: relative;
            }
   
            .companyname {
                position: absolute;
                color: white;
                margin: 0;
                padding-top: 15px;
                text-decoration: none;
                width: 100%;
                text-align: center;
            }
   
            h2 a {
                color: white !important;
                text-decoration: none;
            }
   
            .maincontent {
                padding: 30px;
                /* Add margin to push content below the topbar */
            }
   
            .buttonstyle {
                display: flex;
                justify-content: center;
            }
   
            .btn {
                padding: 8px 20px;
                background: #1976d2;
                box-shadow: 0px 0px 5px #0000004d;
                border: none;
                border-radius: 5px;
                color: white;
            }
        </style>
    </head>
   
    <body>
        <div class="message">
            <div class="topbar">
                <h2 class="companyname">${company}</h2>
            </div>
            <div class="maincontent">
                <p><strong>Your account info:-</strong></p>
                <br />
                <p><strong>Username:</strong> ${name}</p>
                <p><strong>Password:</strong> ${message}</p>
                <br />
                <br />
                <div class="buttonstyle">
                <a href="hihrms.com"><button class="btn">Login</button></a>
                </div>
            </div>
        </div>
    </body>
   
    </html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send("Error sending email");
    } else {
      res.status(200).send("Email sent successfully");
    }
  });
});


app.post("/api/interviewmail", (req, res) => {
  const {
    username,
    password,
    roundname,
    applicantname,
    duration,
    startdate,
    starttime,
    deadlinedate,
    deadlinetime,
    company,
    branch,
    roundlink,
    email,
    role,
  } = req.body;

  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject: `Invitation to Interview with ${company}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f6f6f6;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 80%;
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                padding: 10px 0;
                border-bottom: 1px solid #ddd;
            }
            .header img {
                width: 100px;
                margin-bottom: 10px;
            }
            .content {
                padding: 20px;
            }
            .content h2 {
                color: #007BFF;
            }
            .details {
                margin: 20px 0;
            }
            .details table {
                width: 100%;
                border-collapse: collapse;
            }
            .details th, .details td {
                text-align: left;
                padding: 8px;
                border-bottom: 1px solid #ddd;
            }
            .details th {
                background-color: #f1f1f1;
            }
            .footer {
                text-align: center;
                padding: 20px;
                border-top: 1px solid #ddd;
                margin-top: 20px;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://yourcompanylogo.com/logo.png" alt="Company Logo">
                <h1>Interview Invitation</h1>
            </div>
            <div class="content">
                <h2>Dear ${applicantname},</h2>
                <p>We are pleased to invite you to an interview for the ${role} position at ${company}. Please find the details of the interview below:</p>
                <div class="details">
                    <table>
                        <tr>
                            <th>Round Name</th>
                            <td>${roundname}</td>
                        </tr>
                        <tr>
                            <th>Interview Duration</th>
                            <td>${duration}</td>
                        </tr>
                        <tr>
                            <th>Start Date</th>
                            <td>${startdate}</td>
                        </tr>
                        <tr>
                            <th>Start Time</th>
                            <td>${starttime}</td>
                        </tr>
                        <tr>
                            <th>Deadline Date</th>
                            <td>${deadlinedate}</td>
                        </tr>
                        <tr>
                            <th>Deadline Time</th>
                            <td>${deadlinetime}</td>
                        </tr>
                        <tr>
                            <th>Company</th>
                            <td>${company}</td>
                        </tr>
                        <tr>
                            <th>Branch</th>
                            <td>${branch}</td>
                        </tr>
                        <tr>
                            <th>Interview Link</th>
                            <td><a href=${roundlink} target="_blank">Click here to join the interview</a></td>
                        </tr>
                        <tr>
                            <th>Username</th>
                            <td>${username}</td>
                        </tr>
                        <tr>
                            <th>Password</th>
                            <td>${password}</td>
                        </tr>
                    </table>
                </div>
                <p>If you have any questions or need to reschedule, please do not hesitate to contact us.</p>
                <p>We look forward to speaking with you.</p>
                <p>Sincerely,<br>${company} Recruitment Team</p>
            </div>
            <div class="footer">
                &copy; [Year] ${company}. All rights reserved. <br>
                [Company Address] | [Company Phone] | [Company Email]
            </div>
        </div>
    </body>
    </html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send("Error sending email");
    } else {
      res.status(200).send("Email sent successfully");
    }
  });
});

// //maintenance log
// cron.schedule("0 0 * * *", async () => {
//   try {
//     console.log("Running cron job...");

//     const threeDaysAgo = new Date();
//     threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

//     await employeeapi.deleteMany({ date: { $lt: threeDaysAgo } });
//     console.log("Old records deleted successfully");
//   } catch (error) {
//     console.error("Error deleting old records:", error);
//   }
// });
//Attendance auto logout generation
const currentTime = new Date().toLocaleTimeString();

//1 hour'0 0 * * * *'
//1 min '* * * * *'
//5hr '0 */5 * *'
// cron.schedule('* * * * *', async () => {
//   var atttoday = new Date();
//   var attdd = String(atttoday.getDate()).padStart(2, "0");
//   var attmm = String(atttoday.getMonth() + 1).padStart(2, "0"); // January is 0!
//   var attyyyy = atttoday.getFullYear();

//   var atttodayDate = attdd + "-" + attmm + "-" + attyyyy;

//   // Get yesterday's date
//   var attyesterday = new Date(atttoday);
//   attyesterday.setDate(atttoday.getDate() - 1);
//   attdd = String(attyesterday.getDate()).padStart(2, "0");
//   attmm = String(attyesterday.getMonth() + 1).padStart(2, "0"); // January is 0!
//   attyyyy = attyesterday.getFullYear();

//   var attyesterdayDate = attdd + "-" + attmm + "-" + attyyyy;
//   const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

//   try {
//     let attendances = await Attandance.find({ date: attyesterdayDate, buttonstatus: "true" }).exec();
//     let shifts = await Shift.find().exec();

//     let attendancesmixed = attendances.map(attendance => {
//       const shiftInfo = shifts.find(shift => shift.name === attendance.shiftname);
//       return {
//         username: attendance.username,
//         clockintime: attendance.clockintime,
//         clockouttime: attendance.clockouttime,
//         buttonstatus: attendance.buttonstatus,
//         date: attendance.date,
//         clockinipaddress: attendance.clockinipaddress,
//         userid: attendance.userid,
//         status: attendance.status,
//         shiftname: attendance.shiftname,
//         starttime: shiftInfo ? `${shiftInfo.fromhour}:${shiftInfo.frommin}:00 ${shiftInfo.fromtime}` : null,
//         endtime: shiftInfo ? `${shiftInfo.tohour}:${shiftInfo.tomin}:00 ${shiftInfo.totime}` : null,
//         _id: attendance._id
//       };
//     });



//     const result = attendancesmixed.filter((data, index) => {
//       const currentTimeObj = new Date(`2000-01-01 ${currentTime}`);
//       const endTimeObj = new Date(`2000-01-01 ${data.starttime}`);
//       const endTimeMinus4Hours = new Date(endTimeObj.getTime() - 5 * 60 * 60 * 1000);

//       if (currentTimeObj > endTimeMinus4Hours) {

//         return data
//       }
//     })

//     await updateUser(result);
//   } catch (error) {
//     console.error('Error in scheduled job:', error);
//   }
// });

const updateUser = async (result) => {
  try {
    // Ensure all axios requests are completed before moving on
    await Promise.all(result.map(async (item) => {
      await axios.put(`http://192.168.85.194:7001/api/attandance/${item._id}`, {
        clockouttime: item.endtime,
        buttonstatus: "false",
        autoclockout: Boolean(true)
      });
    }));

  } catch (error) {
    console.error('Error updating users:', error);
  }
};

//every month last date
//0 0 28-31 * *


//Paid date fix autogeneration
// cron.schedule('0 0 28 * *', async () => {
//   const monthNames = ["January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"];
//   const cmonth = new Date().getMonth();
//   let monthName;
//   let year;
//   if (cmonth == 11) {
//     monthName = monthNames[0];
//     year = new Date().getFullYear();
//     year = Number(year) + 1
//   } else {
//     monthName = monthNames[Number(cmonth) + 1];
//     year = new Date().getFullYear();
//   }
//   const month = new Date().getMonth() + 1;

//   try {
//     let paiddatemode = await Paiddatemode.find().exec();

//     const transformedData = paiddatemode.flatMap(item => {
//       return item.department.map(department => ({
//         department: department,
//         date: item.date,
//         type: item.type,
//         paymode: item.paymode
//       }));
//     });

//     const finalres = transformedData.forEach((data, index) => {
//       const resdate = Number(month) + 1;
//       const finaldate = month >= 10 && month == 11 ? "01" : month >= 10 ? (Number(month) + 2) : '0' + (Number(month) + 2);
//       const samefinaldate = resdate >= 10 ? resdate : '0' + resdate;
//       const changeddate = data.type == "Next Month" && month == 12 ? year + "-" + "02" + "-" + data.date
//         :
//         data.type == "Next Month" && month == 11 ? (Number(year) + 1) + "-" + finaldate + "-" + data.date
//           :
//           data.type == "Next Month" && month >= 8 ? year + "-" + (Number(month) + 2) + "-" + data.date
//             :
//             data.type == "Next Month" ? year + "-" + finaldate + "-" + data.date
//               :
//               month == 12 ? year + "-" + "01" + "-" + data.date
//                 :
//                 year + "-" + samefinaldate + "-" + data.date;
//       axios.post(`http://192.168.85.194:7001/api/paiddatefix/new`, {
//         department: [data.department],
//         month: String(monthName),
//         year: String(year),
//         date: String(changeddate),
//         paymode: String(data.paymode),
//       });
//     })
//   } catch (error) {
//     console.error('Error in scheduled job:', error);
//   }
// });



//Department monthset
//  Datefield
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + "-" + mm + "-" + "01";

if (today === yyyy + "-" + mm + "-" + "01") {

  cron.schedule('0 0 1 * *', async () => {
    try {

      function getDaysInMonth(monthName, year) {
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        return new Date(year, monthIndex + 1, 0).getDate();
      }

      let year = Number(yyyy) + 1;
      let monthsarray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const currentMonthIndex = new Date().getMonth();
      const currentMonth = monthsarray[currentMonthIndex];
      // const prevMonthIndex = (currentMonthIndex - 1 + 12) % 12; // Handle negative index

      // console.log([prevMonth , currentMonth], "[prevMonth, currentMonth]");

      function getMonthsUpTo(currentMonth) {
        const monthsarray = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        // Find the index of the current month
        const currentMonthIndex = monthsarray.indexOf(currentMonth);

        // Return the sliced array from the start to the current month
        return monthsarray.slice(0, currentMonthIndex + 1);
      }



      const prevMonth = getMonthsUpTo(currentMonth);
      // console.log(prevMonth, "[prevMonth, currentMonth]");
      let result = prevMonth?.map((month, index) => {
        return {
          month: month,
          days: getDaysInMonth(month, year)
        };
      });

      let deptmonthsets = await Departmentmonthset.find().lean();
      let desigmonthsets = await Designationmonthset.find().lean();
      let desiggrps = await Departmentanddesignationgrouping.find().lean();
      let deptdecember = deptmonthsets.filter(item => item.monthname === "December" && Number(item.year) == Number(yyyy));
      let desiggrp = desiggrps.filter((d) => deptdecember.map(item => item.department).includes(d.department));


      // Initialize result array
      let resultarrayvalStartdates = [];
      const result1 = [];
      let resultarrayval = [];
      // Loop over start dates
      for (const { todate, department, salary, proftaxstop, penalty, esistop, pfstop } of deptdecember) {
        let currentDate = new Date(todate);
        currentDate.setDate(currentDate.getDate() + 1); // Get the next day of the previous month's todate
        for (let i = 0; i < result.length; i++) {
          let month = result[i].month;
          let days = result[i].days;
          let indexOfMay = monthsarray.indexOf(month);
          let todate;
          if (i === 0) {
            // For January, use the specified start date
            todate = new Date(currentDate);
            todate.setDate(todate.getDate() + days - 1); // -1 because we want the last day of the month
          } else {
            let lastEntry = resultarrayval[resultarrayval.length - 1];
            let beforemonthtodate = new Date(lastEntry?.todate); // Get the previous month's todate
            beforemonthtodate.setDate(beforemonthtodate.getDate() + 1); // Get the next day of the previous month's todate
            currentDate = new Date(beforemonthtodate); // Set currentDate to the next day
            todate = new Date(currentDate);
            todate.setDate(todate.getDate() + days - 1); // Calculate the end date
          }

          let totaldays = Math.ceil((todate - currentDate) / (1000 * 60 * 60 * 24)) + 1;

          resultarrayval.push({
            department: department,
            monthname: month,
            month: indexOfMay + 1,
            year: Number(yyyy) + 1,
            days: days,
            salary: salary,
            proftaxstop: proftaxstop,
            penalty: penalty,
            esistop: esistop,
            pfstop: pfstop,
            fromdate: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
            todate: `${todate.getFullYear()}-${(todate.getMonth() + 1).toString().padStart(2, '0')}-${todate.getDate().toString().padStart(2, '0')}`,
            totaldays: totaldays
          });
          // Move to the next month's start date
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      const nonDuplicates = resultarrayval.filter(
        (ur) =>
          !deptmonthsets.some((oldItem) => {

            return ur.monthname === oldItem.monthname && ur.year == oldItem.year && ur.department == oldItem.department;
          })
      );
      nonDuplicates.forEach((arrayItem) => {
        desiggrp.forEach((desgItem) => {
          result1.push({ ...arrayItem, designation: desgItem.designation, });
        });
      });

      // console.log(result1 , 'result1')
      const nonDuplicatesDesig = result1?.filter(data => (data?.designation !== "undefined" ||data?.designation !== undefined)).filter(
        (ur) =>
          !desigmonthsets.some((oldItem) => {

            return ur.monthname === oldItem.monthname &&
              String(ur.year) === String(oldItem.year)
              && ur.designation === oldItem.designation;
          })
      );
      const seen = new Set();
      const uniqueResult1 = nonDuplicatesDesig.filter((item) => {
        const uniqueKey = `${item.monthname}-${item.designation}-${item.year}-${item.fromdate}-${item.todate}`;
        if (seen.has(uniqueKey)) {
          return false; // Duplicate found, exclude it
        }
        seen.add(uniqueKey);
        return true; // Unique, include it
      });
      //  console.log(nonDuplicatesDesig)

      await updateUserdept(nonDuplicates, uniqueResult1);
    } catch (error) {
      console.error('Error in department job:', error);
    }
  });

}

const updateUserdept = async (depts, desigs) => {
  try {
    if (depts.length > 0) {
      await Promise.all(depts.map(async (item) => {

        await axios.post(`http://192.168.0.110:7002/api/departmentmonthset/new`, {
          year: item.year,
          month: item.month,
          department: item.department,
          monthname: item.monthname,
          todate: item.todate,
          fromdate: item.fromdate,
          totaldays: item.totaldays,
          salary: item.salary,
          proftaxstop: item.proftaxstop,
          penalty: item.penalty,
          esistop: item.esistop,
          pfstop: item.pfstop,
        });

      }));
    }
    if (desigs.length > 0) {
      await Promise.all(desigs.map(async (item) => {

        await axios.post(`http://192.168.0.110:7001/api/designationmonthset/new`, {
          year: String(item.year),
          month: String(item.month),
          designation: String(item.designation),
          monthname: String(item.monthname),
          todate: String(item.todate),
          fromdate: String(item.fromdate),
          totaldays: String(item.totaldays),
        });

      }));
    }

    console.log('Department Monthset updated successfully');

  } catch (error) {
    // console.error('Error updating Department:', error);
  }
};

//othertask download
const mergeChunksOthertask = async (fileName, totalChunks) => {
  const chunkDir = __dirname + "/chunks";
  const mergedFilePath = __dirname + "/othertask_merged_files";

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
  console.log("Chunks merged successfully");
};





// //Department monthset
// //  Datefield
// var today = new Date();
// var dd = String(today.getDate()).padStart(2, "0");
// var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
// var yyyy = today.getFullYear();
// today = yyyy + "-" + mm + "-" + "01";

// if (today === yyyy + "-" + mm + "-" + "01") {

//   // cron.schedule('0 0 1 * *', async () => {
//   //   try {

//   //     function getDaysInMonth(monthName, year) {
//   //       const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
//   //       return new Date(year, monthIndex + 1, 0).getDate();
//   //     }

//   //     let year = Number(yyyy) + 1;
//   //     let monthsarray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   //     const currentMonthIndex = new Date().getMonth();
//   //     const currentMonth = monthsarray[currentMonthIndex];
//   //     // const prevMonthIndex = (currentMonthIndex - 1 + 12) % 12; // Handle negative index

//   //     // console.log([prevMonth , currentMonth], "[prevMonth, currentMonth]");

//   //     function getMonthsUpTo(currentMonth) {
//   //       const monthsarray = [
//   //         "January", "February", "March", "April", "May", "June",
//   //         "July", "August", "September", "October", "November", "December"
//   //       ];

//   //       // Find the index of the current month
//   //       const currentMonthIndex = monthsarray.indexOf(currentMonth);

//   //       // Return the sliced array from the start to the current month
//   //       return monthsarray.slice(0, currentMonthIndex + 1);
//   //     }



//   //     const prevMonth = getMonthsUpTo(currentMonth);
//   //     // console.log(prevMonth, "[prevMonth, currentMonth]");
//   //     let result = prevMonth?.map((month, index) => {
//   //       return {
//   //         month: month,
//   //         days: getDaysInMonth(month, year)
//   //       };
//   //     });

//   //     let deptmonthsets = await Departmentmonthset.find().lean();
//   //     let desigmonthsets = await Designationmonthset.find().lean();
//   //     let desiggrps = await Departmentanddesignationgrouping.find().lean();
//   //     let deptdecember = deptmonthsets.filter(item => item.monthname === "December" && Number(item.year) == Number(yyyy));
//   //     let desiggrp = desiggrps.filter((d) => deptdecember.map(item => item.department).includes(d.department));


//   //     // Initialize result array
//   //     let resultarrayvalStartdates = [];
//   //     const result1 = [];
//   //     let resultarrayval = [];
//   //     // Loop over start dates
//   //     for (const { todate, department, salary, proftaxstop, penalty, esistop, pfstop } of deptdecember) {
//   //       let currentDate = new Date(todate);
//   //       currentDate.setDate(currentDate.getDate() + 1); // Get the next day of the previous month's todate
//   //       for (let i = 0; i < result.length; i++) {
//   //         let month = result[i].month;
//   //         let days = result[i].days;
//   //         let indexOfMay = monthsarray.indexOf(month);
//   //         let todate;
//   //         if (i === 0) {
//   //           // For January, use the specified start date
//   //           todate = new Date(currentDate);
//   //           todate.setDate(todate.getDate() + days - 1); // -1 because we want the last day of the month
//   //         } else {
//   //           let lastEntry = resultarrayval[resultarrayval.length - 1];
//   //           let beforemonthtodate = new Date(lastEntry?.todate); // Get the previous month's todate
//   //           beforemonthtodate.setDate(beforemonthtodate.getDate() + 1); // Get the next day of the previous month's todate
//   //           currentDate = new Date(beforemonthtodate); // Set currentDate to the next day
//   //           todate = new Date(currentDate);
//   //           todate.setDate(todate.getDate() + days - 1); // Calculate the end date
//   //         }

//   //         let totaldays = Math.ceil((todate - currentDate) / (1000 * 60 * 60 * 24)) + 1;

//   //         resultarrayval.push({
//   //           department: department,
//   //           monthname: month,
//   //           month: indexOfMay + 1,
//   //           year: Number(yyyy) + 1,
//   //           days: days,
//   //           salary: salary,
//   //           proftaxstop: proftaxstop,
//   //           penalty: penalty,
//   //           esistop: esistop,
//   //           pfstop: pfstop,
//   //           fromdate: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
//   //           todate: `${todate.getFullYear()}-${(todate.getMonth() + 1).toString().padStart(2, '0')}-${todate.getDate().toString().padStart(2, '0')}`,
//   //           totaldays: totaldays
//   //         });
//   //         // Move to the next month's start date
//   //         currentDate.setDate(currentDate.getDate() + 1);
//   //       }
//   //     }


//   //     // console.log(result1.length, "oo", result?.length, resultarrayval?.length, desiggrp?.length)

//   //     const nonDuplicates = resultarrayval.filter(
//   //       (ur) =>
//   //         !deptmonthsets.some((oldItem) => {

//   //           return ur.monthname === oldItem.monthname && ur.year == oldItem.year && ur.department == oldItem.department;
//   //         })
//   //     );
//   //     nonDuplicates.forEach((arrayItem) => {
//   //       desiggrp.forEach((desgItem) => {
//   //         result1.push({ ...arrayItem, designation: desgItem.designation, });
//   //       });
//   //     });

//   //     // console.log(result1 , 'result1')
//   //     const nonDuplicatesDesig = result1?.filter(data => (data?.designation !== "undefined" ||data?.designation !== undefined)).filter(
//   //       (ur) =>
//   //         !desigmonthsets.some((oldItem) => {

//   //           return ur.monthname === oldItem.monthname &&
//   //             String(ur.year) === String(oldItem.year)
//   //             && ur.designation === oldItem.designation;
//   //         })
//   //     );
//   //     const seen = new Set();
//   //     const uniqueResult1 = nonDuplicatesDesig.filter((item) => {
//   //       const uniqueKey = `${item.monthname}-${item.designation}-${item.year}-${item.fromdate}-${item.todate}`;
//   //       if (seen.has(uniqueKey)) {
//   //         return false; // Duplicate found, exclude it
//   //       }
//   //       seen.add(uniqueKey);
//   //       return true; // Unique, include it
//   //     });
//   //     //  console.log(nonDuplicatesDesig)

//   //     await updateUserdept(nonDuplicates, uniqueResult1);
//   //   } catch (error) {
//   //     console.error('Error in department job:', error);
//   //   }
//   // });

// }

// const updateUserdept = async (depts, desigs) => {
//   try {

//     // const isDuplicate = depts.some((item) => item.department == selectDepartment && item.year == selectedYear);

//     if (depts.length > 0) {
//       await Promise.all(depts.map(async (item) => {

//         await axios.post(`http://192.168.85.194:7001/api/departmentmonthset/new`, {
//           year: item.year,
//           month: item.month,
//           department: item.department,
//           monthname: item.monthname,
//           todate: item.todate,
//           fromdate: item.fromdate,
//           totaldays: item.totaldays,
//           salary: item.salary,
//           proftaxstop: item.proftaxstop,
//           penalty: item.penalty,
//           esistop: item.esistop,
//           pfstop: item.pfstop,
//         });

//       }));
//     }
//     if (desigs.length > 0) {
//       await Promise.all(desigs.map(async (item) => {

//         await axios.post(`http://192.168.85.194:7001/api/designationmonthset/new`, {
//           year: String(item.year),
//           month: String(item.month),
//           designation: String(item.designation),
//           monthname: String(item.monthname),
//           todate: String(item.todate),
//           fromdate: String(item.fromdate),
//           totaldays: String(item.totaldays),
//         });

//       }));
//     }

//     console.log('Department Monthset updated successfully');

//   } catch (error) {
//     // console.error('Error updating Department:', error);
//   }
// };

//scheduledpayment

// //Define the cron job to run daily at 12:01 AM
// cron.schedule("1 0 * * *", async () => {
//   try {
//     const currentDay = getDay(new Date());
//     const currentDate = String(getDate(new Date())).padStart(2, "0");
//     const currentMonth = String(getMonth(new Date()) + 1).padStart(2, "0"); // Adding 1 because getMonth returns 0-indexed months

//     const dayOfWeek = [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];
//     const dayName = dayOfWeek[currentDay];

//     const documents = await SchedulePaymentMaster.find({
//       $and: [
//         {
//           $or: [
//             { frequency: "Daily" },
//             { frequency: "Weekly", daywiseandweeklydays: { $in: dayName } },
//             { frequency: "Monthly", datewiseandmonthlydate: currentDate },
//             {
//               frequency: "Annually",
//               annuallymonth: currentMonth,
//               annuallyday: currentDate,
//             },
//           ],
//         },
//         { status: "Active" },
//       ],
//     });

//     const documentsWithReminderDate = documents?.map((doc) => {
//       const { _id, ...rest } = doc.toObject(); // Convert to plain JavaScript object
//       return {
//         ...rest,
//         reminderdate: new Date(),
//       };
//     });

//     await NotAddedBills.insertMany(documentsWithReminderDate);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// });


// user password reset

app.post("/api/user-credentials", (req, res) => {
  const { companyname, email, pagelink } = req.body;
  // Set up the Nodemailer transporter
  const transporters = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cshankari27@gmail.com",
      pass: "vqhzwuklzypwruyu"
    }
  });

  // Define the email message
  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject: `Password Reset - ${companyname}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Options </title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h1 {
          color: #333;
          text-align: center;
        }
    
        p {
          color: #555;
          line-height: 1.6;
        }
    
        .congratulations-image {
          text-align: center;
          margin-top: 20px;
        }
    
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
    
        .signature {
          margin-top: 20px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container"> 
        <p>
          Dear ${companyname},
        </p>
        <p> 
        Your request for an password reset is accepted by our management side 
        </p>
        <p> 
        Here's the reset link,Please click this below link and follow the instructions
         </p>
        <div>
         ${pagelink}  
        </div>
      </div>
    </body>
    </html>
    
    `

  };

  // Schedule the email to be sent at the specified time
  transporters.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "An error occurred while sending the email." });
    } else {
      console.log(`Email sent: ${info.response}`);
      res.json({ message: "Email sent successfully!" });
    }
  });


  // Send a response to the client
  res.json({ message: "Email scheduled successfully!" });
});

//Addd these mail function 
app.post("/api/documentpreparationmail", async (req, res) => {
  const { document, companyname, letter, email, emailformat, fromemail,approval, ccemail, bccemail, tempid , pagename} = req.body;
  console.log(req?.body , "1")
  let pdfBuffer;
  if(pagename === "Employee" && approval === "approved"){
    pdfBuffer = fs.readFileSync(path.join(__dirname, 'uploadsDocuments', document));
  }
  else {
     pdfBuffer = Buffer.from(document, 'base64');

  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "cshankari27@gmail.com",
        pass: "vqhzwuklzypwruyu"
      }
    });    // Define the email message
    const mailOptions = {
      from: fromemail,
      cc: ccemail,
      bcc: bccemail,
      to: "vrahulmba005@gmail.com",
      // to: email,
      subject: `${tempid}- ${companyname}`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document for ${companyname}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #F4F4F4
;
            margin: 0;
            padding: 0;
          }          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }        </style>
      </head>
      <body>
        <div class="container">
          ${emailformat}
        </div>
        </div>      </body>
      </html>      `,
      attachments: [
        {
          filename: `${letter}_${companyname}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while sending the email." });
  }
});
//Addd these mail function 
app.post("/api/candidatedocumentpreparationmail", async (req, res) => {
  const { document, companyname, letter, email, emailformat, fromemail,approval, ccemail, bccemail, tempid , pagename} = req.body;
  console.log(pagename ,approval , pagename === "Candidate" && approval === "approved", 'pagename')
  let pdfBuffer;
  if(pagename === "Candidate" && approval === "approved"){

    pdfBuffer = fs.readFileSync(path.join(__dirname, 'candidateDocuments', document));
  }
  else {
     pdfBuffer = Buffer.from(document, 'base64');

  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "cshankari27@gmail.com",
        pass: "vqhzwuklzypwruyu"
      }
    });    // Define the email message
    const mailOptions = {
      from: fromemail,
      cc: ccemail,
      bcc: bccemail,
      to: "vrahulmba005@gmail.com",
      // to: email,
      subject: `${tempid}- ${companyname}`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document for ${companyname}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #F4F4F4
;
            margin: 0;
            padding: 0;
          }          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }        </style>
      </head>
      <body>
        <div class="container">
          ${emailformat}
        </div>
        </div>      </body>
      </html>      `,
      attachments: [
        {
          filename: `${letter}_${companyname}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while sending the email." });
  }
});

//attendance double shift vice auto generation of values
const convertTo24HourFormat = (time) => {
  let [hours, minutes] = time?.slice(0, -2)?.split(":");
  hours = parseInt(hours, 10);
  if (time?.slice(-2) === "PM" && hours !== 12) {
    hours += 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};
function addFutureTimeToCurrentTime(futureTime) {
  // Parse the future time string into hours and minutes
  const [futureHours, futureMinutes] = futureTime?.split(":").map(Number);

  // Get the current time
  const currentTime = new Date();

  // Get the current date
  const currentDate = currentTime.getDate();

  // Get the current hours and minutes
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Calculate the time difference
  let timeDifferenceHours = futureHours - currentHours;
  let timeDifferenceMinutes = futureMinutes - currentMinutes;

  // Adjust for negative time difference
  if (timeDifferenceMinutes < 0) {
    timeDifferenceHours--;
    timeDifferenceMinutes += 60;
  }

  // Check if the future time falls on the next day
  if (timeDifferenceHours < 0) {
    // Add 1 day to the current date
    currentTime.setDate(currentDate + 1);
    timeDifferenceHours += 24;
  }

  // Create a new Date object by adding the time difference to the current time
  console.log(timeDifferenceHours, ":", timeDifferenceMinutes);

  const newDate = new Date();
  newDate.setHours(newDate.getHours() + timeDifferenceHours);
  newDate.setMinutes(newDate.getMinutes() + timeDifferenceMinutes);

  console.log(moment(newDate).format("DD-MM-YYYY hh:mm:ss A"));

  return newDate;
}
// cron.schedule("0 0 * * 6", async () => {
//   try {
//     console.log("Cron Running weekly Once To Export BiometricDaata...");
//     let allusers = await axios.post("http://192.168.8.14:7000/api/biosendcommand", {
//       deviceCommandN: "4",
//       CloudIDC: "BT17EVP20001125"
//     });
//     console.log("Added successfully");
//   } catch (error) {
//     console.error("Error deleting old records:", error?.message);
//   }
// });
// cron.schedule('*/30 * * * *', async () => {
//   var today = new Date();
//   var dd = String(today.getDate()).padStart(2, "0");
//   var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
//   var yyyy = today.getFullYear();
//   today = yyyy + "-" + mm + "-" + dd;

//   let mtoday = dd + "-" + mm + "-" + yyyy;
//   let startMonthDate = new Date(today);
//   let endMonthDate = new Date(today);
//   const userDates = [];
//   let findsecondashift;
//   while (startMonthDate <= endMonthDate) {
//     const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
//     const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });
//     const dayCount = startMonthDate.getDate();
//     const shiftMode = 'Main Shift';

//     userDates.push({ formattedDate, dayName, dayCount, shiftMode });

//     // Move to the next day
//     startMonthDate.setDate(startMonthDate.getDate() + 1);
//   }

//   try {
//     let allusers = await axios.post("http://192.168.85.194:7001/api/userclockinclockoutstatus", {
//       userDates: userDates
//     });
//     let attconcrieteria = await AttendanceControlCriteria.find();

//     let resattcr = attconcrieteria[0]?.clockout;
//     console.log(resattcr, 'resattcr')

//     let findsecondashift = allusers?.data?.finaluser.filter((data, index) => {
//       return data.shiftMode === "Second Shift"
//     })
//     let findmainashift = allusers?.data?.finaluser.filter((data, index) => {
//       return data.shiftMode === "Main Shift"
//     })
//     let finalmainusers = [];
//     let finadfinalusers = findsecondashift.map((data, index) => {
//       let fdata = data
//       findmainashift.forEach((resdata, i) => {
//         if (resdata.empcode === data.empcode) {

//           finalmainusers.push(resdata)
//         }

//       })

//       return fdata
//     })
//     let checkifdoubleshift = [];
//     finadfinalusers.forEach((sdata, sindex) => {
//       let sshift = sdata?.shift?.split('to');
//       finalmainusers.forEach((mdata, mindex) => {
//         let mshift = mdata?.shift?.split('to');
//         if ((mshift[0]?.includes("PM") && mshift[1]?.includes("AM")) && (sdata.userid === mdata.userid && sshift[1] === mshift[0])) {
//           checkifdoubleshift.push(sdata)
//         } else if (sdata.userid === mdata.userid && sshift[0] === mshift[1]) {
//           checkifdoubleshift.push(sdata)
//         }
//       })
//     })

//     let fresmainusers = []

//     let fressecondusers = checkifdoubleshift.map((sdata, sindex) => {
//       finalmainusers.forEach((mdata, mindex) => {

//         if (sdata.userid === mdata.userid) {
//           fresmainusers.push(mdata)
//         }
//       })

//       return sdata
//     })
//     let mainnightusers = [];
//     let maindayusers = [];
//     fresmainusers.map((data, i) => {
//       let rdata = data?.shift?.split('to');
//       if (rdata[0]?.includes("PM") && rdata[1]?.includes("AM")) {
//         mainnightusers.push(data);
//       } else {
//         maindayusers.push(data);
//       }
//     })

//     let result = [...fresmainusers, ...fressecondusers];

//     let updatefornightshift = fressecondusers.forEach((sdata, si) => {
//       let sshift = sdata?.shift?.split("to");
//       mainnightusers.forEach((mdata, mindex) => {
//         if (sdata.userid === mdata.userid) {
//           const currentTime = new Date();            // sshift[1] has format "07:00PM" or "10:00AM"
//           const sshiftEndTime = sshift[1].trim();            // Extract hours, minutes, and period (AM/PM)
//           const hours = parseInt(sshiftEndTime.substr(0, 2), 10);
//           const minutes = parseInt(sshiftEndTime.substr(3, 2), 10);
//           const period = sshiftEndTime.substr(5, 2).toUpperCase();            // Convert shift end time to 24-hour format and create a Date object
//           let endHours = hours;
//           if (period === 'PM' && hours !== 12) {
//             endHours += 12;
//           } else if (period === 'AM' && hours === 12) {
//             endHours = 0;
//           } const endTimeObj = new Date();
//           endTimeObj.setHours(endHours, minutes, 0, 0);            // Subtract 4 hours from the shift end time
//           endTimeObj.setHours(endTimeObj.getHours() - 4); console.log(currentTime, 'currentTime');
//           console.log(endTimeObj, 'endTimeMinus4Hours', sshift[1]);
//           if (currentTime >= endTimeObj) {
//             let mshift = mdata?.shift?.split("to")

//             axios.post("http://192.168.85.194:7001/api/doubleattendanceforusers", {
//               userid: sdata.userid,
//               date: mtoday,
//               shiftmode: "Second Shift"
//             }).then(res => {
//               if (res?.data?.getdoubleshiftatt?.length > 0) {
//                 const [startTimes, endTimes] = mdata?.shift?.split("to");
//                 const convertedEndTime = convertTo24HourFormat(endTimes);
//                 const end = convertedEndTime;
//                 let [endHour, endMinute] = end?.slice(0, -2)?.split(":");
//                 endHour = parseInt(endHour, 10);
//                 endHour += Number(resattcr);

//                 console.log(endHour, 'endHour');
//                 const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end?.slice(-2)}`;
//                 const calculatedshiftend = addFutureTimeToCurrentTime(newEnd);
//                 if (calculatedshiftend) {
//                   const couttime = sshift[1]?.slice(0, (sshift[1]?.length - 2)) + ":00" + " " + sshift[1]?.slice(-2);
//                   axios.put(`http://192.168.85.194:7001/api/attandance/${res?.data?.getdoubleshiftatt[0]?._id}`, {
//                     clockouttime: couttime,
//                     clockoutipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
//                     buttonstatus: "false",
//                     autoclockout: Boolean(false),
//                     attendancemanual: Boolean(false)
//                   })
//                   const cltime = mshift[0]?.slice(0, (mshift[0]?.length - 2)) + ":00" + " " + mshift[0]?.slice(-2);
//                   axios.post('http://192.168.85.194:7001/api/attandance/new', {
//                     username: String(res?.data?.getdoubleshiftatt[0]?.username),
//                     userid: String(res?.data?.getdoubleshiftatt[0]?.userid),
//                     clockintime: cltime,
//                     date: res?.data?.getdoubleshiftatt[0]?.date,
//                     clockinipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
//                     status: true,
//                     buttonstatus: "true",
//                     calculatedshiftend: calculatedshiftend,
//                     shiftname: String(mdata.shift),
//                     autoclockout: Boolean(false),
//                     shiftendtime: String(mshift[1]),
//                     shiftmode: String("Main Shift"),
//                     clockouttime: "",
//                     attendancemanual: Boolean(false)
//                   })
//                 }

//               }
//             })

//           }
//         }
//       })
//     })
//     let updatefordayshift = fressecondusers.forEach((sddata, si) => {

//       fresmainusers.forEach((mddata, mindex) => {
//         if (sddata.userid === mddata.userid) {
//           let mdshift = mddata?.shift?.split("to");
//           const currentTime = new Date();            // sshift[1] has format "07:00PM" or "10:00AM"
//           const sshiftEndTime = mdshift[1].trim();            // Extract hours, minutes, and period (AM/PM)
//           const hours = parseInt(sshiftEndTime.substr(0, 2), 10);
//           const minutes = parseInt(sshiftEndTime.substr(3, 2), 10);
//           const period = sshiftEndTime.substr(5, 2).toUpperCase();            // Convert shift end time to 24-hour format and create a Date object
//           let endHours = hours;
//           if (period === 'PM' && hours !== 12) {
//             endHours += 12;
//           } else if (period === 'AM' && hours === 12) {
//             endHours = 0;
//           } const endTimeObj = new Date();
//           endTimeObj.setHours(endHours, minutes, 0, 0);            // Subtract 4 hours from the shift end time
//           endTimeObj.setHours(endTimeObj.getHours() - 4);
//           console.log(currentTime, 'currentTime');
//           console.log(endTimeObj, 'endTimeMinus4Hours', mdshift[1]);
//           if (currentTime >= endTimeObj) {
//             let sdshift = sddata?.shift?.split("to");

//             axios.post("http://192.168.85.194:7001/api/doubleattendanceforusers", {
//               userid: sddata.userid,
//               date: mtoday,
//               shiftmode: "Main Shift"
//             }).then(res => {

//               if (res?.data?.getdoubleshiftatt?.length > 0) {
//                 const [startTimes, endTimes] = sddata?.shift?.split("to");
//                 const convertedEndTime = convertTo24HourFormat(endTimes);
//                 const end = convertedEndTime;
//                 let [endHour, endMinute] = end?.slice(0, -2)?.split(":");
//                 endHour = parseInt(endHour, 10);
//                 endHour += Number(resattcr);

//                 console.log(endHour, 'endHour');
//                 const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end?.slice(-2)}`;
//                 const calculatedshiftend = addFutureTimeToCurrentTime(newEnd);
//                 if (calculatedshiftend) {
//                   const couttime = mdshift[1]?.slice(0, (mdshift[1]?.length - 2)) + ":00" + " " + mdshift[1]?.slice(-2);
//                   axios.put(`http://192.168.85.194:7001/api/attandance/${res?.data?.getdoubleshiftatt[0]?._id}`, {
//                     clockouttime: couttime,
//                     clockoutipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
//                     buttonstatus: "false",
//                     autoclockout: Boolean(false),
//                     attendancemanual: Boolean(false)
//                   })
//                   const cltime = sdshift[0]?.slice(0, (sdshift[0]?.length - 2)) + ":00" + " " + sdshift[0]?.slice(-2);
//                   axios.post('http://192.168.85.194:7001/api/attandance/new', {
//                     username: String(res?.data?.getdoubleshiftatt[0]?.username),
//                     userid: String(res?.data?.getdoubleshiftatt[0]?.userid),
//                     clockintime: cltime,
//                     date: res?.data?.getdoubleshiftatt[0]?.date,
//                     clockinipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
//                     status: true,
//                     buttonstatus: "true",
//                     calculatedshiftend: calculatedshiftend,
//                     shiftname: String(sddata.shift),
//                     autoclockout: Boolean(false),
//                     shiftendtime: String(sddata.shift),
//                     shiftmode: String("Second Shift"),
//                     clockouttime: "",
//                     attendancemanual: Boolean(false)
//                   })
//                 }

//               }
//             })

//           }
//         }
//       })
//     })
//     // console.log(result.length, 'allusers');
//     // console.log(mainnightusers.length, 'mainnightusers')
//     // console.log(maindayusers.length, 'maindayusers')

//   } catch (error) {
//     console.error('Error in scheduled job:', error);
//   }
// });
// async function backfillFormattedDate() {
//   try {
//     const batchSize = 5000;
//     const cursor = TaskForUser.find({ formattedDate: { $exists: false } }).cursor();
//     let bulkOps = [];

//     for await (const doc of cursor) {
//       if (doc.taskassigneddate) {
//         const formatted = moment(doc.taskassigneddate, 'DD-MM-YYYY');
//         if (formatted.isValid()) {
//           bulkOps.push({
//             updateOne: {
//               filter: { _id: doc._id },
//               update: { $set: { formattedDate: formatted.toDate() } }
//             }
//           });
//         }
//       }

//       if (bulkOps.length >= batchSize) {
//         await TaskForUser.bulkWrite(bulkOps);
//         console.log(`Updated ${bulkOps.length} documents`);
//         bulkOps = [];
//       }
//     }

//     if (bulkOps.length > 0) {
//       await TaskForUser.bulkWrite(bulkOps);
//       console.log(`Updated ${bulkOps.length} documents`);
//     }

//     console.log("✅ formattedDate backfill complete");
//   } catch (error) {
//     console.error("❌ Error in backfillFormattedDate:", error);
//   }
// }

// backfillFormattedDate();


//payslip document preparation
app.post("/api/payslipdocumentmail", async (req, res) => {
  const { controlid, fileName, fileData, usermail, paymonth, payyear } = req.body;
  let backgroundImageId = await TemplatecontrolpanelModel.findOne({ _id: new ObjectId(controlid) }, {})

  const pdfBuffer = Buffer.from(fileData, 'base64');
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "cshankari27@gmail.com",
        pass: "vqhzwuklzypwruyu"
      }
    });

    // Define the email message
    const mailOptions = {
      from: "vrahuldgl1998@gmail.com",
      cc: backgroundImageId?.ccemail,
      bcc: backgroundImageId?.bccemail,
      to: usermail,
      //  to: "personalforchatgpt@gmail.com",
      subject: `Pay Slip for ${paymonth}-${payyear}`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Options </title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
      
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
    
        </style>
      </head>
      <body>
        <div class="container"> 
          ${backgroundImageId?.emailformat}
        </div>
        </div>

      </body>
      </html>
      
      `,
      attachments: [
        {
          filename: `${fileName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "An error occurred while sending the email." });
  }
});

//mikrotik & useractivity func
// // Schedule the task to run every day at midnight
// cron.schedule("0 0 * * *", async () => {
//   console.log("Cron job running at midnight to fetch MikroTik logs");
//   console.log("Cron job running at midnight to Delete User Activity Screenshot");
//   let result = await fetchAndStoreMikroTikLogs(); // Call your log-fetching function
//   let resultDelete = await deleteUserActivityScreenshot(); // Call your log-fetching function
//   // console.log(result)
//   // console.log(resultDelete)
// });

//idle time feature
//autologout after 1hr from the logintime
// const autoLogout = async () => {
//   try {

//     let idleTimes = await IdleTime.find({ loginstatus: 'loggedin' });

//     idleTimes.forEach(async (item) => {

//       let now = new Date();

//       let startTime = new Date(item.starttime);

//       // Calculate the difference in milliseconds
//       let diff = now - startTime;

//       // Check the role and set the time limit
//       let timeLimitMinutes = item.role.includes("Manager") ? 60 : 15;

//       // Convert difference to minutes
//       let diffMinutes = Math.floor(diff / 1000 / 60);

//       if (diffMinutes >= timeLimitMinutes) {
//         try {
//           await axios.post(
//             `http://192.168.85.194:7001/api/idleendtimeupdate`,
//             {
//               userId: item.userid,
//               endTime: now
//             }
//           );

//           console.log(`User ${item.username} logged out successfully.`);
//         } catch (error) {
//           // console.error('Error in axios request:', error.response ? error.response.data : error.message);
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error in autoLogout:', error);
//   }
// };

// // Set an interval to check every minute
// setInterval(autoLogout, 60000);  // Check every 1 minute

//idle hours delete function
// delete previous month's data from the idletime on new month's start date
// cron.schedule('0 0 1 * *', async () => {

//   console.log("Cron job started for deleting previous month's data...");

//   let now = new Date();

//   // Calculate the first day of the current month
//   let firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//   // Convert format 'YYYY-MM-DD'
//   let firstDayOfCurrentMonthStr = firstDayOfCurrentMonth.toISOString().split('T')[0];

//   try {
//     await IdleTime.deleteMany({ date: { $lt: firstDayOfCurrentMonthStr } });

//     console.log('Old idle time records deleted successfully');
//   } catch (error) {
//     console.error('Error deleting old idle time records:', error);
//   }
// });
// Handling middleware error
app.use(errorMiddleware);


// // Connect to PM2
//  pm2.connect((err) => {
//    if (err) {
//      console.error(err);
//      process.exit(1);
//    }

// //   // Start the application as a PM2 managed process
//    pm2.start({
//      name: 'YourAppName', // Replace 'YourAppName' with your actual application name
//      script: 'index.js',
//      max_memory_restart: '8G', // Restart the app if it exceeds 8GB of memory usage
//      env: {
//        NODE_ENV: env
//      }
//    }, (err) => {
//      if (err) {
//        console.error(err);
//        process.exit(1);
//      }
//      console.log('App started successfully with PM2');
//    });
//  });


// const express = require("express");
// const compression = require("compression");
// //const rateLimit = require("express-rate-limit");
// const cluster = require("cluster");
// const os = require("os");
// const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
// const connectDb = require("./config/connection");
// const cron = require("node-cron");
// const moment = require("moment");
// const archiver = require("archiver");
// const axios = require("axios");
// const {execSync} = require("child_process");
// const fs = require("fs");
// const path = require("path");
// const employeeapi = require("./model/modules/settings/Maintenancelog");
// const errorMiddleware = require("./middleware/errorHandle");
// const Departmentmonthset = require("./model/modules/departmentmonthset");
// const Attandance = require("./model/modules/attendance/attendance");
// const Shift = require("./model/modules/shift");
// const Designationmonthset = require("./model/modules/DesignationMonthSetModel");
// const Departmentanddesignationgrouping = require('./model/modules/departmentanddesignationgrouping');
// const Designationgroup = require("./model/modules/designationgroup");
// const Paiddatemode = require("./model/modules/production/paiddatemode");
// const IdleTime = require("./model/login/idletime");
// const AttendanceControlCriteria = require("./model/modules/settings/Attendancecontrolcriteria");
// const NotAddedBills = require("./model/modules/expense/NotaddedBills");
// const SchedulePaymentMaster = require("./model/modules/expense/SchedulePaymentMaster");
// const pm2 = require("pm2");
// const { getDay, getDate, getMonth, format } = require("date-fns");
// const { ObjectId } = require('mongodb');
// const { PDFDocument } = require('pdf-lib');
// const TemplatecontrolpanelModel = require('./model/modules/documents/Templatecontrolpnael')
// // const idleTimeRoute = require("./route/idletime");
// const { deleteUserActivityScreenshot, deleteUserActivityLog } = require("./controller/login/userActivity");
// const Cors = require("cors");
// // Setting up config file
// var socketIo = require('socket.io');
// //const { initSocket, getIo } = require("./socket");

// const http = require('http');

// const userActivityLiveScreen = require("./model/login/userActivityLiveScreen.js");
// const imagePath = path.join(__dirname, 'public/images/bdaytemplatetwo.png');
// const imagePathWed = path.join(__dirname, 'public/images/weddingtemplate.png');
// const imageBase64 = fs.readFileSync(imagePath, 'base64');
// const imageBase64wed = fs.readFileSync(imagePathWed, 'base64');
// const User = require('./model/login/auth');
// const AdminOverAllSettings = require('./model/modules/settings/AdminOverAllSettingsModel')
// const PosterGenerate = require('./model/modules/greetinglayout/postergenerate');
// const puppeteer = require('puppeteer');
// const FooterMessage = require("./model/modules/greetinglayout/footermessage");


// dotenv.config();
// // Connection to database mongodb
// connectDb();
// //cluster utilize all cpu cores
// if (cluster.isMaster) {
//     const numCPUs = os.cpus().length;
//     for (let i = 0; i < numCPUs; i++) cluster.fork();
//   } else {
// const app = express();
// const multer = require("multer");
// const upload = multer();

// app.use(compression());
// app.use(bodyParser.json({ limit: "500mb" }));
// app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
// app.use(express.json());
// app.use(cookieParser());
// app.use(Cors());

// // Rate limiting
// //const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
// //app.use(limiter);

// // Lazy load routes
// app.use('/api', require('./route/auth'));
// app.use('/api', require('./route/settings'));
// app.use('/api', require('./route/hr'));
// app.use('/api', require('./route/setup'));
// app.use('/api', require('./route/hrfacility'));
// app.use('/api', require('./route/attendance'));
// app.use('/api', require('./route/idletime'));
// app.use('/api', require('./route/task'));
// app.use('/api', require('./route/permission'));
// app.use('/api', require('./route/production'));
// app.use('/api', require('./route/password'));
// app.use('/api', require('./route/expense'));
// app.use('/api', require('./route/reference'));
// app.use('/api', require('./route/interview'));
// app.use('/api', require('./route/leave'));
// app.use('/api', require('./route/stock'));
// app.use('/api', require('./route/tickets'));
// app.use('/api', require('./route/project'));
// app.use('/api', require('./route/draft'));
// app.use('/api', require('./route/role'));
// app.use('/api', require('./route/excel'));
// app.use('/api', require('./route/remarks'));
// app.use('/api', require('./route/account'));
// app.use('/api', require('./route/eb'));
// app.use('/api', require('./route/interactor'));
// app.use('/api', require('./route/accuracymaster'));
// app.use('/api', require('./route/hiconnect'));
// app.use('/api', require('./route/clientsupport'));
// app.use('/api', require('./route/greetinglayout'));
// app.use('/api', require('./route/mikrotik'));

// app.use("/api/weights", express.static(path.join(__dirname, "weights")));

// app.use('/documents', express.static(path.join(__dirname, 'documents')));

// app.use('/reference', express.static(path.join(__dirname, 'reference')));

// app.use('/api/useractivity', express.static(path.join(__dirname, 'useractivity')));

// const mergeChunks = async (fileName, totalChunks) => {
//   const chunkDir = __dirname + "/chunks";
//   const mergedFilePath = __dirname + "/merged_files";

//   if (!fs.existsSync(mergedFilePath)) {
//     fs.mkdirSync(mergedFilePath);
//   }

//   const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
//   for (let i = 0; i < totalChunks; i++) {
//     const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
//     const chunkBuffer = await fs.promises.readFile(chunkFilePath);
//     writeStream.write(chunkBuffer);
//     fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
//   }

//   writeStream.end();
//   console.log("Chunks merged successfully");
// };
// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   console.log("Hit");
  
//   const chunk = req.file.buffer;
//   const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
//   const totalChunks = Number(req.body.totalChunks); // Sent from the client
//   const fileName = req.body.originalname;

//   const chunkDir = __dirname + "/chunks"; // Directory to save chunks
//   // console.log(chunkDir, 'chunkDir')
//   if (!fs.existsSync(chunkDir)) {
//     fs.mkdirSync(chunkDir);
//   }

//   const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

//   try {
//     await fs.promises.writeFile(chunkFilePath, chunk);
//     // console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

//     if (chunkNumber === totalChunks - 1) {
//       // If this is the last chunk, merge all chunks into a single file
//       await mergeChunks(fileName, totalChunks);
//       console.log("File merged successfully");
//     }

//     res.status(200).json({ message: "Chunk uploaded successfully" });
//   } catch (error) {
//     console.error("Error saving chunk:", error);
//     res.status(500).json({ error: "Error saving chunk" });
//   }
// });
// app.get('/api/download/:filename', (req, res) => {
//   try {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, 'merged_files', filename);

//     // Log the file path to check if this part is being executed
//     // console.log('File Path:', filePath);

//     if (fs.existsSync(filePath)) {
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.pipe(res);

//       // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//       res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//       res.setHeader('Content-type', 'application/octet-stream');
//     } else {
//       res.status(404).send('File not found');
//     }
//   } catch (error) {
//     // Log any errors that occur during file retrieval
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// //prodution file bulk download
// app.post("/api/download-bulk", (req, res) => {
//   const { filenames, vendor, date } = req.body; // Expect an array of filenames
//   const zipFileName = `${vendor}-${date}.zip`;
//   res.attachment(zipFileName);
//   const archiver = require("archiver");
//   const archive = archiver("zip", {
//     zlib: { level: 9 }, // Sets the compression level
//   });

//   archive.on("error", (err) => {
//     throw err;
//   });

//   // Pipe the archive data to the response
//   archive.pipe(res);

//   // Add each file to the ZIP archive
//   filenames.forEach((file) => {
//     const filePath = path.join(__dirname, "merged_files", file);
//     archive.file(filePath, { name: file.split("$")[3] });
//   });

//   // Finalize the ZIP file
//   archive.finalize();
// });

// //--------------------------- BIRTHDAY WISHES -----------------------------------
// app.post("/api/schedule-birthdayemail", (req, res) => {
//   const { email,  date, time,name, company  } = req.body;
//   const nodemailer = require("nodemailer");

//   // Parse the date and time strings into a Moment object
//   const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

//   // Set up the Nodemailer transporter
//   const transporters = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "cshankari27@gmail.com",
//       pass: "vqhzwuklzypwruyu"
//     }
//   });

//   // Define the email message
//   const mailOptions = {
//     from: "cshankari27@gmail.com",
//     to: email,
//     subject:`Happy Birthday ${name}`,
//     html: `<!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Birthday Wishes</title>
//       <style>
//         body {
//           font-family: 'Arial', sans-serif;
//           background-color: #f4f4f4;
//           margin: 0;
//           padding: 0;
//         }
   
//         .container {
//           max-width: 600px;
//           margin: 20px auto;
//           padding: 20px;
//           background-color: #fff;
//           border-radius: 8px;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//         }
   
//         h1 {
//           color: #333;
//           text-align: center;
//         }
   
//         p {
//           color: #555;
//           line-height: 1.6;
//         }
   
//         .birthday-gift {
//           text-align: center;
//           margin-top: 20px;
//         }
   
//         img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 4px;
//         }
   
//         .signature {
//           margin-top: 20px;
//           text-align: right;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <h1>Happy Birthday ${name}! 🎉🎂</h1>
   
//         <p>
//           Dear ${name},
//         </p>
   
//         <p>
//           Wishing you a fantastic and joyful birthday! 🎈 On this special day, we want to take a moment to celebrate you and express our gratitude for the incredible contributions you make to our team.
//         </p>
   
//         <p>
//           May this year bring you immense joy, new adventures, and continued success both personally and professionally. Your hard work, dedication, and positive attitude inspire us all.
//         </p>
   
//         <p>
//           We hope you take some time today to relax, enjoy the company of your loved ones, and indulge in your favorite treats!
//         </p>
   
//         <div class="signature">
//           Best wishes,<br>
//           ${company}
//         </div>
//       </div>
//     </body>
//     </html>`
   
//   };

//   // Schedule the email to be sent at the specified time
//   cron.schedule(scheduledTime.format("m H D M d"), () => {
//     transporters.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         res
//           .status(500)
//           .json({ message: "An error occurred while sending the email." });
//       } else {
//         res.json({ message: "Email sent successfully!" });
//       }
//     });
//   });

//   // Send a response to the client
//   res.json({ message: "Email scheduled successfully!" });
// });

// //--------------------------- WEDDING ANNIVERSARY WISHES -----------------------------------
// app.post("/api/schedule-weddingemail", (req, res) => {
//   const { email,  date, time,name, company  } = req.body;
//   const nodemailer = require("nodemailer");

//   // Parse the date and time strings into a Moment object
//   const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

//   // Set up the Nodemailer transporter
//   const transporters = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "cshankari27@gmail.com",
//       pass: "vqhzwuklzypwruyu"
//     }
//   });

//   // Define the email message
//   const mailOptions = {
//     from: "cshankari27@gmail.com",
//     to: email,
//     subject:`Happy Wedding Anniversary ${name}`,
//     html: `<!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Anniversary Wishes</title>
//       <style>
//         body {
//           font-family: 'Arial', sans-serif;
//           background-color: #f4f4f4;
//           margin: 0;
//           padding: 0;
//         }
   
//         .container {
//           max-width: 600px;
//           margin: 20px auto;
//           padding: 20px;
//           background-color: #fff;
//           border-radius: 8px;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//         }
   
//         h1 {
//           color: #333;
//           text-align: center;
//         }
   
//         p {
//           color: #555;
//           line-height: 1.6;
//         }
   
//         .celebration-image {
//           text-align: center;
//           margin-top: 20px;
//         }
   
//         img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 4px;
//         }
   
//         .signature {
//           margin-top: 20px;
//           text-align: right;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <h1>Celebrating Love and Togetherness! 💑</h1>
   
//         <p>
//           Dear ${name},
//         </p>
   
//         <p>
//           On this special day, we are overjoyed to extend our heartfelt congratulations on your wedding anniversary! 🎉 Today marks another year of love, companionship, and cherished moments together.
//         </p>
   
//         <p>
//           Your commitment to each other is truly inspiring, and we feel privileged to share in the joy of this milestone. May your journey continue to be filled with love, laughter, and countless beautiful memories.
//         </p>
   
//         <p>
//           Wishing you both a wonderful celebration and many more years of happiness ahead!
//         </p>
   
//         <div class="signature">
//           Best wishes,<br>
//           ${company}
//         </div>
//       </div>
//     </body>
//     </html>
//     `
   
//   };

//   // Schedule the email to be sent at the specified time
//   cron.schedule(scheduledTime.format("m H D M d"), () => {
//     transporters.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         res
//           .status(500)
//           .json({ message: "An error occurred while sending the email." });
//       } else {
//         res.json({ message: "Email sent successfully!" });
//       }
//     });
//   });

//   // Send a response to the client
//   res.json({ message: "Email scheduled successfully!" });
// });

// //--------------------------- WORK ANNIVERSARY WISHES -----------------------------------
// app.post("/api/schedule-workanniversaryemail", (req, res) => {
//   const { email,  date, time,name, company  } = req.body;
//   const nodemailer = require("nodemailer");

//   // Parse the date and time strings into a Moment object
//   const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

//   // Set up the Nodemailer transporter
//   const transporters = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "cshankari27@gmail.com",
//       pass: "vqhzwuklzypwruyu"
//     }
//   });

//   // Define the email message
//   const mailOptions = {
//     from: "cshankari27@gmail.com",
//     to: email,
//     subject:`Happy Work Anniversary ${name}`,
//     html: `<!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Work Anniversary Wishes</title>
//       <style>
//         body {
//           font-family: 'Arial', sans-serif;
//           background-color: #f4f4f4;
//           margin: 0;
//           padding: 0;
//         }
   
//         .container {
//           max-width: 600px;
//           margin: 20px auto;
//           padding: 20px;
//           background-color: #fff;
//           border-radius: 8px;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//         }
   
//         h1 {
//           color: #333;
//           text-align: center;
//         }
   
//         p {
//           color: #555;
//           line-height: 1.6;
//         }
   
//         .congratulations-image {
//           text-align: center;
//           margin-top: 20px;
//         }
   
//         img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 4px;
//         }
   
//         .signature {
//           margin-top: 20px;
//           text-align: right;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <h1>Congratulations on Your Work Anniversary! 🎉</h1>
   
//         <p>
//           Dear ${name},
//         </p>
   
//         <p>
//           Happy work anniversary! 🥳 It's an honor to celebrate this milestone with you as you mark another year of dedication, hard work, and valuable contributions to our team.
//         </p>
   
//         <p>
//           Your commitment and passion are truly appreciated. We are grateful for the positive impact you've made, and we look forward to many more successful years together.
//         </p>
   
//         <p>
//           Thank you for your outstanding efforts and for being an integral part of our team's success.
//         </p>
   
//         <div class="signature">
//           Best wishes,<br>
//           ${company}
//         </div>
//       </div>
//     </body>
//     </html>
   
//     `
   
//   };

//   // Schedule the email to be sent at the specified time
//   cron.schedule(scheduledTime.format("m H D M d"), () => {
//     transporters.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         res
//           .status(500)
//           .json({ message: "An error occurred while sending the email." });
//       } else {
//         res.json({ message: "Email sent successfully!" });
//       }
//     });
//   });

//   // Send a response to the client
//   res.json({ message: "Email scheduled successfully!" });
// });



// app.post("/send-email", (req, res) => {
//   const { name, email, message, company } = req.body;

//   const mailOptions = {
//     from: "cshankari27@gmail.com",
//     to: email,
//     subject: "Your account details",
//     html: `<html>

//     <head>
//         <style>
//             /* Add your CSS styles here */
//             body {
//                 font-family: Arial, sans-serif;
//                 background-color: #f5f5f5;
//             }
   
//             .message {
//                 color: #333;
//                 border: 1px solid #ccc;
//                 background-color: #fff;
//                 width: 550px;
//                 position: absolute;
//                 top: 50%;
//                 left: 50%;
//                 transform: translate(-50%, -50%);
   
//             }
   
//             .topbar {
//                 height: 70px;
//                 background: #1976d2;
//                 position: relative;
//             }
   
//             .companyname {
//                 position: absolute;
//                 color: white;
//                 margin: 0;
//                 padding-top: 15px;
//                 text-decoration: none;
//                 width: 100%;
//                 text-align: center;
//             }
   
//             h2 a {
//                 color: white !important;
//                 text-decoration: none;
//             }
   
//             .maincontent {
//                 padding: 30px;
//                 /* Add margin to push content below the topbar */
//             }
   
//             .buttonstyle {
//                 display: flex;
//                 justify-content: center;
//             }
   
//             .btn {
//                 padding: 8px 20px;
//                 background: #1976d2;
//                 box-shadow: 0px 0px 5px #0000004d;
//                 border: none;
//                 border-radius: 5px;
//                 color: white;
//             }
//         </style>
//     </head>
   
//     <body>
//         <div class="message">
//             <div class="topbar">
//                 <h2 class="companyname">${company}</h2>
//             </div>
//             <div class="maincontent">
//                 <p><strong>Your account info:-</strong></p>
//                 <br />
//                 <p><strong>Username:</strong> ${name}</p>
//                 <p><strong>Password:</strong> ${message}</p>
//                 <br />
//                 <br />
//                 <div class="buttonstyle">
//                 <a href="hihrms.com"><button class="btn">Login</button></a>
//                 </div>
//             </div>
//         </div>
//     </body>
   
//     </html>`,
//   };

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "cshankari27@gmail.com",
//       pass: "srgvavrpyvkznjyl",
//     },
//   });

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       res.status(500).send("Error sending email");
//     } else {
//       res.status(200).send("Email sent successfully");
//     }
//   });
// });


// app.post("/api/interviewmail", (req, res) => {
//   const {
//     username,
//     password,
//     roundname,
//     applicantname,
//     duration,
//     startdate,
//     starttime,
//     deadlinedate,
//     deadlinetime,
//     company,
//     branch,
//     roundlink,
//     email,
//     role,
//   } = req.body;

//   const mailOptions = {
//     from: "cshankari27@gmail.com",
//     to: email,
//     subject: `Invitation to Interview with ${company}`,
//     html: `<!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//             body {
//                 font-family: Arial, sans-serif;
//                 line-height: 1.6;
//                 color: #333;
//                 background-color: #f6f6f6;
//                 margin: 0;
//                 padding: 0;
//             }
//             .container {
//                 width: 80%;
//                 max-width: 600px;
//                 margin: 20px auto;
//                 padding: 20px;
//                 border: 1px solid #ddd;
//                 border-radius: 10px;
//                 background-color: #ffffff;
//             }
//             .header {
//                 text-align: center;
//                 padding: 10px 0;
//                 border-bottom: 1px solid #ddd;
//             }
//             .header img {
//                 width: 100px;
//                 margin-bottom: 10px;
//             }
//             .content {
//                 padding: 20px;
//             }
//             .content h2 {
//                 color: #007BFF;
//             }
//             .details {
//                 margin: 20px 0;
//             }
//             .details table {
//                 width: 100%;
//                 border-collapse: collapse;
//             }
//             .details th, .details td {
//                 text-align: left;
//                 padding: 8px;
//                 border-bottom: 1px solid #ddd;
//             }
//             .details th {
//                 background-color: #f1f1f1;
//             }
//             .footer {
//                 text-align: center;
//                 padding: 20px;
//                 border-top: 1px solid #ddd;
//                 margin-top: 20px;
//                 font-size: 0.9em;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <div class="header">
//                 <img src="https://yourcompanylogo.com/logo.png" alt="Company Logo">
//                 <h1>Interview Invitation</h1>
//             </div>
//             <div class="content">
//                 <h2>Dear ${applicantname},</h2>
//                 <p>We are pleased to invite you to an interview for the ${role} position at ${company}. Please find the details of the interview below:</p>
//                 <div class="details">
//                     <table>
//                         <tr>
//                             <th>Round Name</th>
//                             <td>${roundname}</td>
//                         </tr>
//                         <tr>
//                             <th>Interview Duration</th>
//                             <td>${duration}</td>
//                         </tr>
//                         <tr>
//                             <th>Start Date</th>
//                             <td>${startdate}</td>
//                         </tr>
//                         <tr>
//                             <th>Start Time</th>
//                             <td>${starttime}</td>
//                         </tr>
//                         <tr>
//                             <th>Deadline Date</th>
//                             <td>${deadlinedate}</td>
//                         </tr>
//                         <tr>
//                             <th>Deadline Time</th>
//                             <td>${deadlinetime}</td>
//                         </tr>
//                         <tr>
//                             <th>Company</th>
//                             <td>${company}</td>
//                         </tr>
//                         <tr>
//                             <th>Branch</th>
//                             <td>${branch}</td>
//                         </tr>
//                         <tr>
//                             <th>Interview Link</th>
//                             <td><a href=${roundlink} target="_blank">Click here to join the interview</a></td>
//                         </tr>
//                         <tr>
//                             <th>Username</th>
//                             <td>${username}</td>
//                         </tr>
//                         <tr>
//                             <th>Password</th>
//                             <td>${password}</td>
//                         </tr>
//                     </table>
//                 </div>
//                 <p>If you have any questions or need to reschedule, please do not hesitate to contact us.</p>
//                 <p>We look forward to speaking with you.</p>
//                 <p>Sincerely,<br>${company} Recruitment Team</p>
//             </div>
//             <div class="footer">
//                 &copy; [Year] ${company}. All rights reserved. <br>
//                 [Company Address] | [Company Phone] | [Company Email]
//             </div>
//         </div>
//     </body>
//     </html>
//     `,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       res.status(500).send("Error sending email");
//     } else {
//       res.status(200).send("Email sent successfully");
//     }
//   });
// });

// //maintenance log
// cron.schedule("0 0 * * *", async () => {
//   try {
//     console.log("Running cron job...");

//     const threeDaysAgo = new Date();
//     threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

//     await employeeapi.deleteMany({ date: { $lt: threeDaysAgo } });
//     console.log("Old records deleted successfully");
//   } catch (error) {
//     console.error("Error deleting old records:", error);
//   }
// });
// //Attendance auto logout generation
// const currentTime = new Date().toLocaleTimeString();

 
 

// //1 hour'0 0 * * * *'

// //1 min '* * * * *'

// //5hr '0 */5 * *'

// cron.schedule('0 0 * * * *', async () => {
// var atttoday = new Date();
//   var attdd = String(atttoday.getDate()).padStart(2, "0");
//   var attmm = String(atttoday.getMonth() + 1).padStart(2, "0"); // January is 0!
//   var attyyyy = atttoday.getFullYear();

//   var atttodayDate = attdd  + "-" + attmm + "-" + attyyyy;

//   // Get yesterday's date
//   var attyesterday = new Date(atttoday);
//   attyesterday.setDate(atttoday.getDate() - 1);
//   attdd = String(attyesterday.getDate()).padStart(2, "0");
//   attmm = String(attyesterday.getMonth() + 1).padStart(2, "0"); // January is 0!
//   attyyyy = attyesterday.getFullYear();

//   var attyesterdayDate = attdd + "-" + attmm + "-" + attyyyy;
// const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

//   try {
//     let attendances = await Attandance.find({ date:attyesterdayDate,buttonstatus: "true" }).exec();
//     let shifts = await Shift.find().exec();
    
//     let attendancesmixed = attendances.map(attendance => {
//       const shiftInfo = shifts.find(shift => shift.name === attendance.shiftname);
//       return {
//         username: attendance.username,
//         clockintime: attendance.clockintime,
//         clockouttime: attendance.clockouttime,
//         buttonstatus: attendance.buttonstatus,
//         date: attendance.date,
//         clockinipaddress: attendance.clockinipaddress,
//         userid: attendance.userid,
//         status: attendance.status,
//         shiftname: attendance.shiftname,
//         starttime: shiftInfo ? `${shiftInfo.fromhour}:${shiftInfo.frommin}:00 ${shiftInfo.fromtime}` : null,
//         endtime: shiftInfo ? `${shiftInfo.tohour}:${shiftInfo.tomin}:00 ${shiftInfo.totime}` : null,
//         _id: attendance._id
//       };
//     });
    
    

//     const result = attendancesmixed.filter((data, index)=>{
// const currentTimeObj = new Date(`2000-01-01 ${currentTime}`);
//   const endTimeObj = new Date(`2000-01-01 ${data.starttime}`);
//   const endTimeMinus4Hours = new Date(endTimeObj.getTime() - 5 * 60 * 60 * 1000);

// if (currentTimeObj > endTimeMinus4Hours) {

//  return data
//   }
//     })

//   await updateUser(result);
//   } catch (error) {
//     console.error('Error in scheduled job:', error);
//   }
// });

// const updateUser = async (result) => {
//   try {
//     // Ensure all axios requests are completed before moving on
//     await Promise.all(result.map(async (item) => {
//       await axios.put(`http://192.168.85.100:8003/api/attandanceclockinouttimeedit/${item._id}`, {
//         clockouttime: item.endtime,
//         buttonstatus: "false",
//         autoclockout: Boolean(true)
//       });
//     }));

//   } catch (error) {
//     console.error('Error updating users:', error);
//   }
// };

// //every month last date
// //0 0 28-31 * *
// //Paid date fix autogeneration
// cron.schedule('0 0 28 * *', async () => {
//   const monthNames = ["January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"];
//   const cmonth = new Date().getMonth();
//   let monthName;
//   let year;
//   if (cmonth == 11) {
//     monthName = monthNames[0];
//     year = new Date().getFullYear();
//     year = Number(year) + 1
//   } else {
//     monthName = monthNames[Number(cmonth) + 1];
//     year = new Date().getFullYear();
//   }
//   const month = new Date().getMonth() + 1;

//   try {
//     let paiddatemode = await Paiddatemode.find().exec();

//     const transformedData = paiddatemode.flatMap(item => {
//       return item.department.map(department => ({
//         department: department,
//         date: item.date,
//         type: item.type,
//         paymode: item.paymode
//       }));
//     });

//     const finalres = transformedData.forEach((data, index) => {
//       const resdate = Number(month) + 1;
//       const finaldate = month >= 10 && month == 11 ? "01" : month >= 10 ? (Number(month) + 2) : '0' + (Number(month) + 2);
//       const samefinaldate = resdate >= 10 ? resdate : '0' + resdate;
//       const changeddate = data.type == "Next Month" && month == 12 ? year + "-" + "02" + "-" + data.date
//         :
//         data.type == "Next Month" && month == 11 ? (Number(year) + 1) + "-" + finaldate + "-" + data.date
//           :
//           data.type == "Next Month" && month >= 8 ? year + "-" + (Number(month) + 2) + "-" + data.date
//             :
//             data.type == "Next Month" ? year + "-" + finaldate + "-" + data.date
//               :
//               month == 12 ? year + "-" + "01" + "-" + data.date
//                 :
//                 year + "-" + samefinaldate + "-" + data.date;

//       const [y, m, d] = changeddate.split('-');
//       const lastDayOfMonth = new Date(y, m, 0).getDate();
//       const validatedDate = d > lastDayOfMonth
//         ? `${y}-${m}-${lastDayOfMonth}`
//         : changeddate;
//       axios.post(`http://192.168.85.100:8003/api/paiddatefix/new`, {
//         department: [data.department],
//         month: String(monthName),
//         year: String(year),
//         date: String(validatedDate),
//         paymode: String(data.paymode),
// afterexpiry:String("Disable"),
//       });
//     })
//   } catch (error) {
//     console.error('Error in scheduled job:', error);
//   }
// });


// //Department monthset
// //  Datefield
// var today = new Date();
// var dd = String(today.getDate()).padStart(2, "0");
// var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
// var yyyy = today.getFullYear();
// today = yyyy + "-" + mm + "-" + "01";

// if (today === yyyy + "-" + mm + "-" + "01") {

//   cron.schedule('0 0 1 * *', async () => {
//     try {

//       function getDaysInMonth(monthName, year) {
//         const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
//         return new Date(year, monthIndex + 1, 0).getDate();
//       }

//       let year = Number(yyyy) + 1;
//       let monthsarray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//       const currentMonthIndex = new Date().getMonth();
//       const currentMonth = monthsarray[currentMonthIndex];
//       // const prevMonthIndex = (currentMonthIndex - 1 + 12) % 12; // Handle negative index

//       // console.log([prevMonth , currentMonth], "[prevMonth, currentMonth]");

//       function getMonthsUpTo(currentMonth) {
//         const monthsarray = [
//           "January", "February", "March", "April", "May", "June",
//           "July", "August", "September", "October", "November", "December"
//         ];

//         // Find the index of the current month
//         const currentMonthIndex = monthsarray.indexOf(currentMonth);

//         // Return the sliced array from the start to the current month
//         return monthsarray.slice(0, currentMonthIndex + 1);
//       }



//       const prevMonth = getMonthsUpTo(currentMonth);
//       // console.log(prevMonth, "[prevMonth, currentMonth]");
//       let result = prevMonth?.map((month, index) => {
//         return {
//           month: month,
//           days: getDaysInMonth(month, year)
//         };
//       });

//       let deptmonthsets = await Departmentmonthset.find().lean();
//       let desigmonthsets = await Designationmonthset.find().lean();
//       let desiggrps = await Departmentanddesignationgrouping.find().lean();
//       let deptdecember = deptmonthsets.filter(item => item.monthname === "December" && Number(item.year) == Number(yyyy));
//       let desiggrp = desiggrps.filter((d) => deptdecember.map(item => item.department).includes(d.department));


//       // Initialize result array
//       let resultarrayvalStartdates = [];
//       const result1 = [];
//       let resultarrayval = [];
//       // Loop over start dates
//       for (const { todate, department, salary, proftaxstop, penalty, esistop, pfstop } of deptdecember) {
//         let currentDate = new Date(todate);
//         currentDate.setDate(currentDate.getDate() + 1); // Get the next day of the previous month's todate
//         for (let i = 0; i < result.length; i++) {
//           let month = result[i].month;
//           let days = result[i].days;
//           let indexOfMay = monthsarray.indexOf(month);
//           let todate;
//           if (i === 0) {
//             // For January, use the specified start date
//             todate = new Date(currentDate);
//             todate.setDate(todate.getDate() + days - 1); // -1 because we want the last day of the month
//           } else {
//             let lastEntry = resultarrayval[resultarrayval.length - 1];
//             let beforemonthtodate = new Date(lastEntry?.todate); // Get the previous month's todate
//             beforemonthtodate.setDate(beforemonthtodate.getDate() + 1); // Get the next day of the previous month's todate
//             currentDate = new Date(beforemonthtodate); // Set currentDate to the next day
//             todate = new Date(currentDate);
//             todate.setDate(todate.getDate() + days - 1); // Calculate the end date
//           }

//           let totaldays = Math.ceil((todate - currentDate) / (1000 * 60 * 60 * 24)) + 1;

//           resultarrayval.push({
//             department: department,
//             monthname: month,
//             month: indexOfMay + 1,
//             year: Number(yyyy) + 1,
//             days: days,
//             salary: salary,
//             proftaxstop: proftaxstop,
//             penalty: penalty,
//             esistop: esistop,
//             pfstop: pfstop,
//             fromdate: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
//             todate: `${todate.getFullYear()}-${(todate.getMonth() + 1).toString().padStart(2, '0')}-${todate.getDate().toString().padStart(2, '0')}`,
//             totaldays: totaldays
//           });
//           // Move to the next month's start date
//           currentDate.setDate(currentDate.getDate() + 1);
//         }
//       }


//       // console.log(result1.length, "oo", result?.length, resultarrayval?.length, desiggrp?.length)

//       const nonDuplicates = resultarrayval.filter(
//         (ur) =>
//           !deptmonthsets.some((oldItem) => {

//             return ur.monthname === oldItem.monthname && ur.year == oldItem.year && ur.department == oldItem.department;
//           })
//       );
//       nonDuplicates.forEach((arrayItem) => {
//         desiggrp.forEach((desgItem) => {
//           result1.push({ ...arrayItem, designation: desgItem.designation, });
//         });
//       });

//       // console.log(result1 , 'result1')
//       const nonDuplicatesDesig = result1?.filter(data => (data?.designation !== "undefined" ||data?.designation !== undefined)).filter(
//         (ur) =>
//           !desigmonthsets.some((oldItem) => {

//             return ur.monthname === oldItem.monthname &&
//               String(ur.year) === String(oldItem.year)
//               && ur.designation === oldItem.designation;
//           })
//       );
//       const seen = new Set();
//       const uniqueResult1 = nonDuplicatesDesig.filter((item) => {
//         const uniqueKey = `${item.monthname}-${item.designation}-${item.year}-${item.fromdate}-${item.todate}`;
//         if (seen.has(uniqueKey)) {
//           return false; // Duplicate found, exclude it
//         }
//         seen.add(uniqueKey);
//         return true; // Unique, include it
//       });
//       //  console.log(nonDuplicatesDesig)

//       await updateUserdept(nonDuplicates, uniqueResult1);
//     } catch (error) {
//       console.error('Error in department job:', error);
//     }
//   });

// }

// const updateUserdept = async (depts, desigs) => {
//   try {

//     // const isDuplicate = depts.some((item) => item.department == selectDepartment && item.year == selectedYear);

//     if (depts.length > 0) {
//       await Promise.all(depts.map(async (item) => {

//         await axios.post(`http://192.168.85.100:8003/api/departmentmonthset/new`, {
//           year: item.year,
//           month: item.month,
//           department: item.department,
//           monthname: item.monthname,
//           todate: item.todate,
//           fromdate: item.fromdate,
//           totaldays: item.totaldays,
//           salary: item.salary,
//           proftaxstop: item.proftaxstop,
//           penalty: item.penalty,
//           esistop: item.esistop,
//           pfstop: item.pfstop,
//         });

//       }));
//     }
//     if (desigs.length > 0) {
//       await Promise.all(desigs.map(async (item) => {

//         await axios.post(`http://192.168.85.100:8003/api/designationmonthset/new`, {
//           year: String(item.year),
//           month: String(item.month),
//           designation: String(item.designation),
//           monthname: String(item.monthname),
//           todate: String(item.todate),
//           fromdate: String(item.fromdate),
//           totaldays: String(item.totaldays),
//         });

//       }));
//     }

//     console.log('Department Monthset updated successfully');

//   } catch (error) {
//     // console.error('Error updating Department:', error);
//   }
// };

// //othertask download
// const mergeChunksOthertask = async (fileName, totalChunks) => {
//   const chunkDir = __dirname + "/chunks";
//   const mergedFilePath = __dirname + "/othertask_merged_files";

//   if (!fs.existsSync(mergedFilePath)) {
//     fs.mkdirSync(mergedFilePath);
//   }

//   const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
//   for (let i = 0; i < totalChunks; i++) {
//     const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
//     const chunkBuffer = await fs.promises.readFile(chunkFilePath);
//     writeStream.write(chunkBuffer);
//     fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
//   }

//   writeStream.end();
//   console.log("Chunks merged successfully");
// };

// app.post("/api/uploadothertask", upload.single("file"), async (req, res) => {
//   console.log("Hit");
//   // console.log(req.body, 'req')
//   const chunk = req.file.buffer;
//   const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
//   const totalChunks = Number(req.body.totalChunks); // Sent from the client
//   const fileName = req.body.originalname;
//   // const fileConj = ;
//   // const fileSize = req.body.filesize;
//   // console.log(chunk,chunkNumber,totalChunks,fileName)
//   const chunkDir = __dirname + "/chunks"; // Directory to save chunks
//   // console.log(chunkDir, 'chunkDir')
//   if (!fs.existsSync(chunkDir)) {
//     fs.mkdirSync(chunkDir);
//   }

//   const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

//   try {
//     await fs.promises.writeFile(chunkFilePath, chunk);
//     // console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

//     if (chunkNumber === totalChunks - 1) {
//       // If this is the last chunk, merge all chunks into a single file
//       await mergeChunksOthertask(fileName, totalChunks);
//       console.log("File merged successfully");
//     }

//     res.status(200).json({ message: "Chunk uploaded successfully" });
//   } catch (error) {
//     console.error("Error saving chunk:", error);
//     res.status(500).json({ error: "Error saving chunk" });
//   }
// });

// app.get("/api/downloadothertask/:filename", (req, res) => {
//   try {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, "othertask_merged_files", filename);
//     // console.log(__dirname, '__dirname')
//     // Log the file path to check if this part is being executed
//     // console.log('File Path:', filePath);

//     if (fs.existsSync(filePath)) {
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.pipe(res);

//       // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//       res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//       res.setHeader("Content-type", "application/octet-stream");
//     } else {
//       res.status(404).send("File not found");
//     }
//   } catch (error) {
//     // Log any errors that occur during file retrieval
//     // console.error('Error:', error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/api/download-othertask-bulk", (req, res) => {
//   const { filenames, vendor, date } = req.body;
//   const zipFileName = `${vendor}-${date}.zip`;
//   res.attachment(zipFileName);

//   const archive = archiver("zip", {
//     zlib: { level: 9 },
//   });

//   archive.on("error", (err) => {
//     throw err;
//   });

//   // Pipe the archive data to the response
//   archive.pipe(res);

//   // Add each file to the ZIP archive
//   filenames.forEach((file) => {
//     const filePath = path.join(__dirname, "othertask_merged_files", file);
//     archive.file(filePath, { name: file.split("$")[3] });
//   });

//   // Finalize the ZIP file
//   archive.finalize();
// });
// //scheduledpayment

// //Define the cron job to run daily at 12:01 AM
// cron.schedule("1 0 * * *", async () => {
//   try {
//     const currentDay = getDay(new Date());
//     const currentDate = String(getDate(new Date())).padStart(2, "0");
//     const currentMonth = String(getMonth(new Date()) + 1).padStart(2, "0"); // Adding 1 because getMonth returns 0-indexed months

//     const dayOfWeek = [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];
//     const dayName = dayOfWeek[currentDay];

//     const documents = await SchedulePaymentMaster.find({
//       $and: [
//         {
//           $or: [
//             { frequency: "Daily" },
//             { frequency: "Weekly", daywiseandweeklydays: { $in: dayName } },
//             { frequency: "Monthly", datewiseandmonthlydate: currentDate },
//             {
//               frequency: "Annually",
//               annuallymonth: currentMonth,
//               annuallyday: currentDate,
//             },
//           ],
//         },
//         { status: "Active" },
//       ],
//     });

//     const documentsWithReminderDate = documents?.map((doc) => {
//       const { _id, ...rest } = doc.toObject(); // Convert to plain JavaScript object
//       return {
//         ...rest,
//         reminderdate: new Date(),
//         masterid:_id?.toString(),
//       };
//     });

//     await NotAddedBills.insertMany(documentsWithReminderDate);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// });


// // user password reset

// app.post("/api/user-credentials", (req, res) => {
//   const { companyname , email , pagelink } = req.body;
//   const nodemailer = require("nodemailer");

//   // Set up the Nodemailer transporter
//   const transporters = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "cshankari27@gmail.com",
//       pass: "vqhzwuklzypwruyu"
//     }
//   });

//   // Define the email message
//   const mailOptions = {
//     from: "cshankari27@gmail.com",
//     to: email,
//     subject:`Password Reset - ${companyname}`,
//     html: `<!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Password Reset Options </title>
//       <style>
//         body {
//           font-family: 'Arial', sans-serif;
//           background-color: #f4f4f4;
//           margin: 0;
//           padding: 0;
//         }
    
//         .container {
//           max-width: 600px;
//           margin: 20px auto;
//           padding: 20px;
//           background-color: #fff;
//           border-radius: 8px;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//         }
    
//         h1 {
//           color: #333;
//           text-align: center;
//         }
    
//         p {
//           color: #555;
//           line-height: 1.6;
//         }
    
//         .congratulations-image {
//           text-align: center;
//           margin-top: 20px;
//         }
    
//         img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 4px;
//         }
    
//         .signature {
//           margin-top: 20px;
//           text-align: right;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container"> 
//         <p>
//           Dear ${companyname},
//         </p>
//         <p> 
//         Your request for an password reset is accepted by our management side 
//         </p>
//         <p> 
//         Here's the reset link,Please click this below link and follow the instructions
//          </p>
//         <div>
//          ${pagelink}  
//         </div>
//       </div>
//     </body>
//     </html>
    
//     `
    
//   };

//   // Schedule the email to be sent at the specified time
//     transporters.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//         res
//           .status(500)
//           .json({ message: "An error occurred while sending the email." });
//       } else {
//         console.log(`Email sent: ${info.response}`);
//         res.json({ message: "Email sent successfully!" });
//       }
//     });
 

//   // Send a response to the client
//   res.json({ message: "Email scheduled successfully!" });
// });

// //document mail
// app.post("/api/documentpreparationmail", async (req, res) => {
//   const { document, companyname, letter, email, emailformat, fromemail, ccemail, bccemail, tempid } = req.body;
//   const nodemailer = require("nodemailer");

//   const pdfBuffer = Buffer.from(document, 'base64');  try {
//     const transporter = nodemailer.createTransport({
//       host: "mail.ttsbs.in",
//       port: 587,
//       secure: false, // Set to true if using port 465
//       auth: {
//         user: "hrms@ttsbs.in",
//         pass: "TTSHrms@123$",
//       },
//       tls: {
//         rejectUnauthorized: false, // Allow self-signed certificates
//       },
//     });    // Define the email message
//     const mailOptions = {
//       from: fromemail,
//       cc: ccemail,
//       bcc: bccemail,
//       to: email,
//       subject: `${tempid}- ${companyname}`,
//       html: `<!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Password Reset Options</title>
//         <style>
//           body {
//             font-family: 'Arial', sans-serif;
//             background-color: #F4F4F4
// ;
//             margin: 0;
//             padding: 0;
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             padding: 20px;
//             background-color: #fff;
//             border-radius: 8px;
//             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           ${emailformat}
//         </div>
//       </body>
//       </html>`,
//       attachments: [
//         {
//           filename: `${letter}_${companyname}.pdf`,
//           content: pdfBuffer,
//           contentType: 'application/pdf',
//         },
//       ],
//     };    // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`Email sent: ${info.response}`);
//     res.json({ message: "Email sent successfully!" });
//   } catch (error) {
//     console.error(error,'er1');
//     res.status(500).json({ message: "An error occurred while sending the email." });
//   }
// });

// //attendance double shift vice auto generation of values
// const convertTo24HourFormat = (time) => {
//   let [hours, minutes] = time?.slice(0, -2)?.split(":");
//   hours = parseInt(hours, 10);
//   if (time?.slice(-2) === "PM" && hours !== 12) {
//     hours += 12;
//   }
//   return `${String(hours).padStart(2, "0")}:${minutes}`;
// };
// function addFutureTimeToCurrentTime(futureTime) {
//   // Parse the future time string into hours and minutes
//   const [futureHours, futureMinutes] = futureTime?.split(":").map(Number);

//   // Get the current time
//   const currentTime = new Date();

//   // Get the current date
//   const currentDate = currentTime.getDate();

//   // Get the current hours and minutes
//   const currentHours = currentTime.getHours();
//   const currentMinutes = currentTime.getMinutes();

//   // Calculate the time difference
//   let timeDifferenceHours = futureHours - currentHours;
//   let timeDifferenceMinutes = futureMinutes - currentMinutes;

//   // Adjust for negative time difference
//   if (timeDifferenceMinutes < 0) {
//     timeDifferenceHours--;
//     timeDifferenceMinutes += 60;
//   }

//   // Check if the future time falls on the next day
//   if (timeDifferenceHours < 0) {
//     // Add 1 day to the current date
//     currentTime.setDate(currentDate + 1);
//     timeDifferenceHours += 24;
//   }

//   // Create a new Date object by adding the time difference to the current time
//   console.log(timeDifferenceHours, ":", timeDifferenceMinutes);

//   const newDate = new Date();
//   newDate.setHours(newDate.getHours() + timeDifferenceHours);
//   newDate.setMinutes(newDate.getMinutes() + timeDifferenceMinutes);

//   console.log(moment(newDate).format("DD-MM-YYYY hh:mm:ss A"));

//   return newDate;
// }
// cron.schedule('*/30 * * * *', async () => {    
//   var today = new Date();
//   var dd = String(today.getDate()).padStart(2, "0");
//   var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
//   var yyyy = today.getFullYear();
//   today = yyyy + "-" + mm + "-" + dd;

//   let mtoday =  dd + "-" + mm + "-" + yyyy;
//     let startMonthDate = new Date(today);
//     let endMonthDate = new Date(today);
//     const userDates = [];
//     let findsecondashift;
//     while (startMonthDate <= endMonthDate) {
//       const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
//       const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });
//       const dayCount = startMonthDate.getDate();
//       const shiftMode = 'Main Shift';

//       userDates.push({ formattedDate, dayName, dayCount, shiftMode });

//       // Move to the next day
//       startMonthDate.setDate(startMonthDate.getDate() + 1);
//   }
  
//     try {
//       let allusers = await axios.post("http://192.168.85.100:8003/api/userclockinclockoutstatus",{
//         userDates: userDates
//       });
//       let attconcrieteria = await AttendanceControlCriteria.find();

//       let resattcr = attconcrieteria[0]?.clockout;
//       console.log(resattcr,'resattcr')

//       let findsecondashift = allusers?.data?.finaluser.filter((data,index)=>{
//         return data.shiftMode === "Second Shift"
//       })
//       let findmainashift = allusers?.data?.finaluser.filter((data,index)=>{
//         return data.shiftMode === "Main Shift"
//       })
//       let finalmainusers = [];
//       let finadfinalusers = findsecondashift.map((data, index)=>{
//         let fdata = data
//         findmainashift.forEach((resdata, i)=>{
//           if(resdata.empcode === data.empcode){
            
//             finalmainusers.push(resdata)
//           }

//         })

//         return fdata
//       })
//       let checkifdoubleshift =[];
//       finadfinalusers.forEach((sdata, sindex)=>{
//         let sshift = sdata?.shift?.split('to');
//         finalmainusers.forEach((mdata, mindex)=>{
//           let mshift = mdata?.shift?.split('to');
//           if((mshift[0]?.includes("PM") && mshift[1]?.includes("AM")) && (sdata.userid === mdata.userid && sshift[1] === mshift[0])){
//             checkifdoubleshift.push(sdata)
//           }else if(sdata.userid === mdata.userid && sshift[0] === mshift[1]){
//             checkifdoubleshift.push(sdata)
//           }
//         })
//       })

//       let fresmainusers = []

//       let fressecondusers = checkifdoubleshift.map((sdata, sindex)=>{
//         finalmainusers.forEach((mdata, mindex)=>{
         
//           if(sdata.userid === mdata.userid){
//             fresmainusers.push(mdata)
//           }
//         })

//         return sdata
//       })
//       let mainnightusers = [];
//       let maindayusers = [];
//       fresmainusers.map((data,i)=>{
//           let rdata = data?.shift?.split('to');
//           if(rdata[0]?.includes("PM") && rdata[1]?.includes("AM")){
//             mainnightusers.push(data);
//           }else{
//             maindayusers.push(data);
//           }
//       })

//       let result = [...fresmainusers,...fressecondusers];

//       let updatefornightshift = fressecondusers.forEach((sdata, si)=>{
//         let sshift = sdata?.shift?.split("to");
//         mainnightusers.forEach((mdata, mindex)=>{
//          if (sdata.userid === mdata.userid) {
//             const currentTime = new Date();            // sshift[1] has format "07:00PM" or "10:00AM"
//             const sshiftEndTime = sshift[1].trim();            // Extract hours, minutes, and period (AM/PM)
//             const hours = parseInt(sshiftEndTime.substr(0, 2), 10);
//             const minutes = parseInt(sshiftEndTime.substr(3, 2), 10);
//             const period = sshiftEndTime.substr(5, 2).toUpperCase();            // Convert shift end time to 24-hour format and create a Date object
//             let endHours = hours;
//             if (period === 'PM' && hours !== 12) {
//                 endHours += 12;
//             } else if (period === 'AM' && hours === 12) {
//                 endHours = 0;
//             }            const endTimeObj = new Date();
//             endTimeObj.setHours(endHours, minutes, 0, 0);            // Subtract 4 hours from the shift end time
//             endTimeObj.setHours(endTimeObj.getHours() - 4);            console.log(currentTime, 'currentTime');
//             console.log(endTimeObj, 'endTimeMinus4Hours', sshift[1]);            
//             if (currentTime >= endTimeObj) {
//             let mshift = mdata?.shift?.split("to")
           
//      		        axios.post("http://192.168.85.100:8003/api/doubleattendanceforusers", {
//                 userid: sdata.userid,
//                 date: mtoday,
//                 shiftmode: "Second Shift"
//             }).then(res => {		
//     if(res?.data?.getdoubleshiftatt?.length > 0){
//       const [startTimes, endTimes] = mdata?.shift?.split("to");
//       const convertedEndTime =  convertTo24HourFormat(endTimes);
//       const end = convertedEndTime;
//       let [endHour, endMinute] = end?.slice(0, -2)?.split(":");
//       endHour = parseInt(endHour, 10);
//       endHour += Number(resattcr);
      
//       console.log(endHour,'endHour');
//       const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end?.slice(-2)}`;                  
//       const calculatedshiftend = addFutureTimeToCurrentTime(newEnd);
//      if(calculatedshiftend){
//       const couttime = sshift[1]?.slice(0, (sshift[1]?.length - 2)) + ":00" + " " + sshift[1]?.slice(-2);
//       axios.put(`http://192.168.85.100:8003/api/attandance/${res?.data?.getdoubleshiftatt[0]?._id}`,{
//         clockouttime: couttime,
//         clockoutipaddress:res?.data?.getdoubleshiftatt[0]?.clockinipaddress ,
//         buttonstatus: "false",
//         autoclockout:Boolean(false),
//         attendancemanual: Boolean(false)
//       })
//       const cltime = mshift[0]?.slice(0, (mshift[0]?.length - 2)) + ":00" + " " + mshift[0]?.slice(-2);
//       axios.post('http://192.168.85.100:8003/api/attandance/new',{
//         username: String(res?.data?.getdoubleshiftatt[0]?.username),
//         userid: String(res?.data?.getdoubleshiftatt[0]?.userid),
//         clockintime: cltime,
//         date: res?.data?.getdoubleshiftatt[0]?.date,
//         clockinipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
//         status: true,
//         buttonstatus: "true",
//         calculatedshiftend: calculatedshiftend,
//         shiftname:String(mdata.shift),
//         autoclockout:Boolean(false),
//         shiftendtime:String(mshift[1]),
//         shiftmode:String("Main Shift"),
//         clockouttime: "",
//         attendancemanual: Boolean(false)
//       })
//      }
      
// }
// 		})
                
//             }
//         }
//         })
//       })
//       let updatefordayshift = fressecondusers.forEach((sddata, si)=>{
        
//         fresmainusers.forEach((mddata, mindex)=>{
//          if (sddata.userid === mddata.userid) {
//           let mdshift = mddata?.shift?.split("to");
//             const currentTime = new Date();            // sshift[1] has format "07:00PM" or "10:00AM"
//             const sshiftEndTime = mdshift[1].trim();            // Extract hours, minutes, and period (AM/PM)
//             const hours = parseInt(sshiftEndTime.substr(0, 2), 10);
//             const minutes = parseInt(sshiftEndTime.substr(3, 2), 10);
//             const period = sshiftEndTime.substr(5, 2).toUpperCase();            // Convert shift end time to 24-hour format and create a Date object
//             let endHours = hours;
//             if (period === 'PM' && hours !== 12) {
//                 endHours += 12;
//             } else if (period === 'AM' && hours === 12) {
//                 endHours = 0;
//             }            const endTimeObj = new Date();
//             endTimeObj.setHours(endHours, minutes, 0, 0);            // Subtract 4 hours from the shift end time
//             endTimeObj.setHours(endTimeObj.getHours() - 4);           
//              console.log(currentTime, 'currentTime');
//             console.log(endTimeObj, 'endTimeMinus4Hours', mdshift[1]);            
//             if (currentTime >= endTimeObj) {
//             let sdshift = sddata?.shift?.split("to");
           
// 		        axios.post("http://192.168.85.100:8003/api/doubleattendanceforusers", {
//                 userid: sddata.userid,
//                 date: mtoday,
//                 shiftmode: "Main Shift"
//             }).then(res => {
		
//     if(res?.data?.getdoubleshiftatt?.length > 0){
//       const [startTimes, endTimes] = sddata?.shift?.split("to");
//       const convertedEndTime =  convertTo24HourFormat(endTimes);
//       const end = convertedEndTime;
//       let [endHour, endMinute] = end?.slice(0, -2)?.split(":");
//       endHour = parseInt(endHour, 10);
//       endHour += Number(resattcr);
      
//       console.log(endHour,'endHour');
//       const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end?.slice(-2)}`;                  
//       const calculatedshiftend = addFutureTimeToCurrentTime(newEnd);
//      if(calculatedshiftend){
//       const couttime = mdshift[1]?.slice(0, (mdshift[1]?.length - 2)) + ":00" + " " + mdshift[1]?.slice(-2);
//       axios.put(`http://192.168.85.100:8003/api/attandance/${res?.data?.getdoubleshiftatt[0]?._id}`,{
//         clockouttime: couttime,
//         clockoutipaddress:res?.data?.getdoubleshiftatt[0]?.clockinipaddress ,
//         buttonstatus: "false",
//         autoclockout:Boolean(false),
//         attendancemanual: Boolean(false)
//       })
//       const cltime = sdshift[0]?.slice(0, (sdshift[0]?.length - 2)) + ":00" +   " " + sdshift[0]?.slice(-2);
//       axios.post('http://192.168.85.100:8003/api/attandance/new',{
//         username: String(res?.data?.getdoubleshiftatt[0]?.username),
//         userid: String(res?.data?.getdoubleshiftatt[0]?.userid),
//         clockintime: cltime,
//         date: res?.data?.getdoubleshiftatt[0]?.date,
//         clockinipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
//         status: true,
//         buttonstatus: "true",
//         calculatedshiftend: calculatedshiftend,
//         shiftname:String(sddata.shift),
//         autoclockout:Boolean(false),
//         shiftendtime:String(sddata.shift),
//         shiftmode:String("Second Shift"),
//         clockouttime: "",
//         attendancemanual: Boolean(false)
//       })
//      }
      
// }
// 		})
                
//             }
//         }
//         })
//       })
//      console.log(result.length,'allusers');
//      console.log(mainnightusers.length,'mainnightusers')
//      console.log(maindayusers.length,'maindayusers')
      
//     } catch (error) {
//       console.error('Error in scheduled job:', error);
//     }
//   });
  
  
// //payslip document preparation
// app.post("/api/payslipdocumentmail", async (req, res) => {
//   const {controlid , fileName ,  fileData , usermail , paymonth , payyear} = req.body;
//   let backgroundImageId = await TemplatecontrolpanelModel.findOne({ _id: new ObjectId(controlid)},{})
//   const nodemailer = require("nodemailer");

//   const pdfBuffer = Buffer.from(fileData, 'base64');
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "cshankari27@gmail.com",
//         pass: "vqhzwuklzypwruyu"
//       }
//     });

//     // Define the email message
//     const mailOptions = {
//       from: "vrahuldgl1998@gmail.com",
//       cc: backgroundImageId?.ccemail,
//       bcc:backgroundImageId?.bccemail,
//       to: usermail,
//       //  to: "personalforchatgpt@gmail.com",
//       subject: `Pay Slip for ${paymonth}-${payyear}`,
//       html: `<!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Password Reset Options </title>
//         <style>
//           body {
//             font-family: 'Arial', sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 0;
//           }
      
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             padding: 20px;
//             background-color: #fff;
//             border-radius: 8px;
//             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//           }
    
//         </style>
//       </head>
//       <body>
//         <div class="container"> 
//           ${backgroundImageId?.emailformat}
//         </div>
//         </div>

//       </body>
//       </html>
      
//       `,
//       attachments: [
//         {
//           filename: `${fileName}.pdf`,
//           content: pdfBuffer,
//           contentType: 'application/pdf'
//         }
//       ]
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);

//     res.json({ message: "Email sent successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "An error occurred while sending the email." });
//   }
// });

  
// //mikrotik & useractivity fun
// // Schedule the task to run every day at midnight
// cron.schedule("0 0 * * *", async () => {
//   console.log("Cron job running at midnight to fetch MikroTik logs");
//   console.log("Cron job running at midnight to Delete User Activity and Screenshot");
//   let result = await fetchAndStoreMikroTikLogs(); // Call your log-fetching function
//   let resultDelete = await deleteUserActivityScreenshot(); // Call your log-fetching function
//   let resultDeleteUserActivity = await deleteUserActivityLog(); // Call your log-fetching 
// });


// //autologout after 1hr from the 
// const currentYear = new Date().getFullYear();

// const AutoPostercreate = async () => {
//   try {
//     const today = new Date();
//     const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
//     const todayDay = String(today.getDate()).padStart(2, "0");

//     const overallsettings = await AdminOverAllSettings.find();

//     const footerMessage = await FooterMessage.find()

//     const userTodayBD = await User.find({
//       dob: { $regex: `-${todayMonth}-${todayDay}$` }
//     });

//     const employeeCount = userTodayBD.length;

//     if (employeeCount > 0) {

//       let remainingEmployees = employeeCount;

//       // Generate 3-person templates for every set of 3 employees
//       const numberOfThreePersonTemplates = Math.floor(remainingEmployees / 3);
//       let processedEmployees = 0;

//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();

//       for (let i = 0; i < numberOfThreePersonTemplates; i += 3) {
//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 3);;
//         processedEmployees += 3;
//         remainingEmployees -= 3;

//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Birthday!";

//         // const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 1);
//         // const employee = employeesForTemplate.map((item) => item?.value);
//         // const randomWish = "Happy Birthday!";
//         const yearChange0 = moment(employeesForTemplate[0]?.dob).format("DD-MM-YYYY")
//         const yearChange1 = moment(employeesForTemplate[1]?.dob).format("DD-MM-YYYY")
//         const yearChange2 = moment(employeesForTemplate[2]?.dob).format("DD-MM-YYYY")
//         const [day0, month0] = yearChange0.split("-");
//         const [day1, month1] = yearChange1.split("-");
//         const [day2, month2] = yearChange2.split("-");
//         const newDate0 = `${day0}-${month0}-${currentYear}`;
//         const newDate1 = `${day1}-${month1}-${currentYear}`;
//         const newDate2 = `${day2}-${month2}-${currentYear}`;
//         const idArray = [employeesForTemplate[0]?.companyname, employeesForTemplate[1]?.companyname, employeesForTemplate[2]?.companyname];
//         const users = await User.aggregate([
//           {
//             $match: {
//               $and: [
//                 {
//                   enquirystatus: {
//                     $nin: ["Enquiry Purpose"],
//                   },
//                 },
//                 {
//                   resonablestatus: {
//                     $nin: [
//                       "Not Joined",
//                       "Postponed",
//                       "Rejected",
//                       "Closed",
//                       "Releave Employee",
//                       "Absconded",
//                       "Hold",
//                       "Terminate",
//                     ],
//                   },
//                 },
//                 ...(idArray.length > 0
//                   ? [
//                     {
//                       companyname: { $in: idArray },
//                     },
//                   ]
//                   : []),
//               ],
//             },
//           },
//           {
//             "$lookup": {
//               "from": "employeedocuments",
//               "let": { "userId": { "$toString": "$_id" } },
//               "pipeline": [
//                 {
//                   "$match": {
//                     "$expr": {
//                       "$eq": ["$commonid", "$$userId"]
//                     }
//                   }
//                 }
//               ],
//               "as": "employeeDocuments"
//             }
//           },
//           {
//             "$unwind": "$employeeDocuments"
//           },
//           {
//             "$replaceRoot": { "newRoot": "$employeeDocuments" }
//           },
//           {
//             "$project": {
//               "_id": 1,
//               "commonid": 1,
//               "profileimage": 1
//             }
//           }
//         ]);


//         // Generate HTML for the template
//         let bdayHtml = `
//                                         <div style="
//                                            display: flex;
//                                           justify-content: center;
//                                           align-items: center;
//                                           width: 100%;
//                                           height: 100%;
//                                         ">
//                                             <div style="
//                                               position: relative;
//                                               width: 500px;
//                                               height: 520px;
//                                               background-image: url('data:image/png;base64,${imageBase64}');
//                                               background-position: center;
//                                               background-size: contain;
//                                               background-repeat: no-repeat;
//                                               box-sizing: border-box;
//                                             ">
//                                                 <div style="
//                                                     position: absolute;
//                                                     top: 15px;
//                                                     right: 10px;
//                                                 ">
//                                                     <img src="${overallsettings[0]?.companylogo}" alt="logo" style="
//                                                        width: 90px;
//                                                         height: 90px;
//                                                         font-family: "League Spartan", serif;
//                                                     " /><br />
//                                                 </div>
//                                                 <div id="emponediv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 220px;
//                                                         left: 330px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                         font-family: "League Spartan", serif;
//                                                     ">
//                                                         <img src="${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         "/>                                                        
//                                                             <span style="
//                                                                 transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                                 font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'}
//                                                             ">
//                                                         ${employeesForTemplate[0]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                            position: absolute;
//                                                           bottom: -16px;
//                                                           left: -240px;
//                                                           width: 460px;
//                                                           font-family: "League Spartan", serif;
//                                                           font-size: 15px;
//                                                           font-weight: 500;
//                                                           letter-spacing: 1px;
//                                                           word-spacing: 1px;
//                                                           margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate0 ? newDate0 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div id="emptwodiv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 220px;
//                                                         left: 80px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                     ">
//                                                         <img src="${users[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         " />                                                        
//                                                             <span style="
//                                                                 transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                                 font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'}
//                                                             " >                                                    
//                                                         ${employeesForTemplate[1]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                            position: absolute;
//                                                             text-align: start;
//                                                             bottom: -16px;
//                                                             left: 258px;
//                                                             width: 460px;
//                                                             font-family: "League Spartan", serif;
//                                                             font-size: 15px;
//                                                             font-weight: 500;
//                                                             letter-spacing: 1px;
//                                                             word-spacing: 1px;
//                                                             margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate1 ? newDate1 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div id="empthreediv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 280px;
//                                                         left: 205px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                     ">
//                                                         <img src="${users[2]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         " />
//                                                             <span style="
//                                                                transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                             " style="font-size: ${employeesForTemplate[2]?.companyname?.length > 11 ? '11px' : 'initial'}">
//                                                             ${employeesForTemplate[2]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                             position: absolute;
//                                                             text-align: start;
//                                                             bottom: -16px;
//                                                             left: 7px;
//                                                             width: 460px;
//                                                             font-family: "League Spartan", serif;
//                                                             font-size: 15px;
//                                                             font-weight: 500;
//                                                             letter-spacing: 1px;
//                                                             word-spacing: 1px;
//                                                             margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate2 ? newDate2 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div style="
//                                                    position: absolute;
//                                                     text-align: center;
//                                                     bottom: 65px;
//                                                     left: 30px;
//                                                     width: 460px;
//                                                     font-family: "League Spartan", serif;
//                                                     font-size: 18px;
//                                                     font-weight: 500;
//                                                     letter-spacing: 1px;
//                                                     word-spacing: 1px;
//                                                 ">
//                                                     <span style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'}">
//                                                         ${randomWish}
//                                                     </span>
//                                                 </div>
//                                                 <div style="
//                                                   position: absolute;
//                                                   bottom: 10px;
//                                                   left: 220px;
//                                                 ">
//                                                     <span>${footerMessage[0]?.footermessage === "" || footerMessage[0]?.footermessage === undefined || footerMessage[0]?.footermessage === "undefined" ? "" : footerMessage[0]?.footermessage}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     `;

//         await page.setContent(bdayHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });



//         await PosterGenerate.create({
//           company: [...new Set(employeesForTemplate.map((emp) => emp?.company).filter(Boolean))],
//           branch: [...new Set(employeesForTemplate.map((emp) => emp?.branch).filter(Boolean))],
//           unit: [...new Set(employeesForTemplate.map((emp) => emp?.unit).filter(Boolean))],
//           team: [...new Set(employeesForTemplate.map((emp) => emp?.team).filter(Boolean))],
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           categoryname: String("Birthday"),
//           subcategoryname: String("Birthday"),
//           themename: "3-Person Manual Template",
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           addedby: [
//             {
//               name: String("Birthday"),
//               date: String(new Date()),
//             },
//           ],
//         });
//       }

//       if (remainingEmployees === 2) {

//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 2);
//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Birthday!";
//         const yearChange0 = moment(employeesForTemplate[0]?.dob).format("DD-MM-YYYY")
//         const yearChange1 = moment(employeesForTemplate[1]?.dob).format("DD-MM-YYYY")
//         const [day0, month0] = yearChange0.split("-");
//         const [day1, month1] = yearChange1.split("-");
//         const newDate0 = `${day0}-${month0}-${currentYear}`;
//         const newDate1 = `${day1}-${month1}-${currentYear}`;

//         const idArray = [employeesForTemplate[0]?.companyname, employeesForTemplate[1]?.companyname];
//         const users = await User.aggregate(
//           [
//             {
//               $match: {
//                 $and: [
//                   {
//                     enquirystatus: {
//                       $nin: ["Enquiry Purpose"],
//                     },
//                   },
//                   {
//                     resonablestatus: {
//                       $nin: [
//                         "Not Joined",
//                         "Postponed",
//                         "Rejected",
//                         "Closed",
//                         "Releave Employee",
//                         "Absconded",
//                         "Hold",
//                         "Terminate",
//                       ],
//                     },
//                   },
//                   ...(idArray.length > 0
//                     ? [
//                       {
//                         companyname: { $in: idArray },
//                       },
//                     ]
//                     : []),
//                 ],
//               },
//             },
//             {
//               "$lookup": {
//                 "from": "employeedocuments",
//                 "let": { "userId": { "$toString": "$_id" } },
//                 "pipeline": [
//                   {
//                     "$match": {
//                       "$expr": {
//                         "$eq": ["$commonid", "$$userId"]
//                       }
//                     }
//                   }
//                 ],
//                 "as": "employeeDocuments"
//               }
//             },
//             {
//               "$unwind": "$employeeDocuments"
//             },
//             {
//               "$replaceRoot": { "newRoot": "$employeeDocuments" }
//             },
//             {
//               "$project": {
//                 "_id": 1,
//                 "commonid": 1,
//                 "profileimage": 1
//               }
//             }
//           ]
//         );

//         let bdayHtml = `
//                       <div style="
//                          display: flex;
//                           justify-content: center;
//                           align-items: center;
//                           width: 100%;
//                           height: 100%;
//                       ">
//                           <div style="
//                             position: relative;
//                             width: 500px;
//                             height: 520px;
//                             background-image: url('data:image/png;base64,${imageBase64}');
//                             background-position: center;
//                             background-size: contain;
//                             background-repeat: no-repeat;
//                             box-sizing: border-box;
//                           ">
//                               <div style="
//                                  position: absolute;
//                                   top: 15px;
//                                   right: 195px;
//                               ">
//                                   <img src="${overallsettings[0]?.companylogo}" alt="logo" style="
//                                     width: 95px;
//                                     height: 95px;
//                                   " /><br />
//                               </div>
//                               <div id="twoempprofile">
//                                   <div id="emponediv">
//                                       <div style="
//                                           position: absolute;
//                                           top: 220px;
//                                           left: 270px;
//                                           display: flex;
//                                           flex-direction: column;
//                                       ">
//                                           <img src='${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" style="
//                                               transform: rotate(0deg);
//                                               width: 150px;
//                                               height: 150px;
//                                               border-radius: 3px;
//                                           " />
//                                           <span style="
//                                             transform: rotate(0deg);
//                                             text-align: center;
//                                             font-family: "League Spartan", cursive;
//                                             font-weight: 900;
//                                             font-style: bold;
//                                             font-size: 20px;
//                                             margin-top: 5px;
//                                             font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'};
//                                           "
                                              
//                                           >${employeesForTemplate[0]?.companyname}</span>
//                                           <span class="bdaydobtwo2nos">${newDate0 ? newDate0 : ""}</span>
//                                       </div>
//                                   </div>
//                                   <div id="emptwodiv">
//                                       <div style="
//                                           position: absolute;
//                                           top: 220px;
//                                           left: 80px;
//                                           display: flex;
//                                           flex-direction: column;
//                                       ">
//                                           <img src='${users[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" style="
//                                               transform: rotate(0deg);
//                                               width: 150px;
//                                               height: 150px;
//                                               border-radius: 3px;
//                                           " />
//                                           <span id="usernametwotwo2nos" class="usernametwo2nos"
//                                               style="font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'};"
//                                           >${employeesForTemplate[1]?.companyname}</span>
//                                           <span class="bdaydobtwotwo2nos">${newDate0 ? newDate0 : ""}</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div style="
//                                   position: absolute;
//                                   text-align: center;
//                                   bottom: 48px;
//                                   left: 84px;
//                                   width: 360px;
//                                   font-family: "League Spartan", serif;
//                                   font-size: 18px;
//                                   font-weight: 500;
//                                   letter-spacing: 1px;
//                                   word-spacing: 1px;
//                               ">
//                                   <span
//                                       style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'};"
//                                   >${randomWish}</span>
//                               </div>
//                               <div style="
//                                 position: absolute;
//                                 bottom: 10px;
//                                 left: 220px;
//                                 font-family: "League Spartan", serif;
//                               ">
//                                   <span>${footerMessage[0]?.footermessage === "" || footerMessage[0]?.footermessage === undefined || footerMessage[0]?.footermessage === "undefined" ? "" : footerMessage[0]?.footermessage}</span>
//                               </div>
//                           </div>
//                       </div>
//                   `;

//         await page.setContent(bdayHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: [...new Set(employeesForTemplate.map((emp) => emp?.company).filter(Boolean))],
//           branch: [...new Set(employeesForTemplate.map((emp) => emp?.branch).filter(Boolean))],
//           unit: [...new Set(employeesForTemplate.map((emp) => emp?.unit).filter(Boolean))],
//           team: [...new Set(employeesForTemplate.map((emp) => emp?.team).filter(Boolean))],
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           categoryname: String("Birthday"),
//           subcategoryname: String("Birthday"),
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           themename: "2-Person Manual Template",
//           addedby: [
//             {
//               name: String("Birthday"),
//               date: String(new Date()),
//             },
//           ],
//         });
//         processedEmployees += 2;
//         remainingEmployees -= 2;
//       }

//       if (remainingEmployees === 1) {

//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 1);
//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Birthday!";
//         const yearChange = moment(employeesForTemplate[0]?.dob).format("DD-MM-YYYY")
//         const [day, month] = yearChange.split("-");
//         const newDate = `${day}-${month}-${currentYear}`;
//         const idArray = [employeesForTemplate[0]?.companyname];
//         const users = await User.aggregate([
//           {
//             $match: {
//               $and: [
//                 {
//                   enquirystatus: {
//                     $nin: ["Enquiry Purpose"],
//                   },
//                 },
//                 {
//                   resonablestatus: {
//                     $nin: [
//                       "Not Joined",
//                       "Postponed",
//                       "Rejected",
//                       "Closed",
//                       "Releave Employee",
//                       "Absconded",
//                       "Hold",
//                       "Terminate",
//                     ],
//                   },
//                 },
//                 ...(idArray.length > 0
//                   ? [
//                     {
//                       companyname: { $in: idArray },
//                     },
//                   ]
//                   : []),
//               ],
//             },
//           },
//           {
//             "$lookup": {
//               "from": "employeedocuments",
//               "let": { "userId": { "$toString": "$_id" } },
//               "pipeline": [
//                 {
//                   "$match": {
//                     "$expr": {
//                       "$eq": ["$commonid", "$$userId"]
//                     }
//                   }
//                 }
//               ],
//               "as": "employeeDocuments"
//             }
//           },
//           {
//             "$unwind": "$employeeDocuments"
//           },
//           {
//             "$replaceRoot": { "newRoot": "$employeeDocuments" }
//           },
//           {
//             "$project": {
//               "_id": 1,
//               "commonid": 1,
//               "profileimage": 1
//             }
//           }
//         ]);

//         let bdayHtml = `
//                         <div style="
//                           display: flex;
//                           justify-content: center;
//                           align-items: center;
//                           width: 100%;
//                           height: 100%;
//                         ">
//                           <div style="
//                             position: relative;
//                             width: 500px;
//                             height: 520px;
//                             background-image: url('data:image/png;base64,${imageBase64}');
//                             background-position: center;
//                             background-size: contain;
//                             background-repeat: no-repeat;
//                             box-sizing: border-box;
//                           ">
//                             <div style="
//                               position: absolute;
//                               top: 15px;
//                               right: 195px;
//                             ">
//                               <img src="${overallsettings[0]?.companylogo}" alt="logo" style="height: 95px; width: 95px;" />
//                             </div>
//                             <div style="
//                               position: absolute;
//                               top: 220px;
//                               left: 175px;
//                               display: flex;
//                               flex-direction: column;
//                               align-items: center;
//                             ">
//                               <img src="${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
//                                 alt="profile" 
//                                 style="
//                                   transform: rotate(0deg);
//                                   width: 150px;
//                                   height: 150px;
//                                   border-radius: 3px;
//                                 " 
//                               />
//                               <span style="
//                                 transform: rotate(0deg);
//                                 text-align: center;
//                                 font-family: 'League Spartan', cursive;
//                                 font-weight: 900;
//                                 font-style: bold;
//                                 font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '14px' : '16px'};
//                                 margin-top: 5px;
//                               ">
//                                 ${employeesForTemplate[0]?.companyname}
//                               </span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               text-align: center;
//                               bottom: 110px;
//                               left: 22px;
//                               width: 460px;
//                               font-family: 'League Spartan', serif;
//                               font-size: 15px;
//                               font-weight: 500;
//                               letter-spacing: 1px;
//                               word-spacing: 1px;
//                               margin-bottom: 1px;
//                             ">
//                               <span>${newDate ? newDate : "" || ""}</span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               text-align: center;
//                               bottom: 48px;
//                               left: 84px;
//                               width: 360px;
//                               font-family: 'League Spartan', serif;
//                               font-size: 18px;
//                               font-weight: 500;
//                               letter-spacing: 1px;
//                               word-spacing: 1px;
//                             ">
//                               <span style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'};">
//                                 ${randomWish}
//                               </span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               bottom: 10px;
//                               left: 220px;
//                               font-family: 'League Spartan', serif;
//                             ">
//                               <span>${footerMessage[0]?.footermessage}</span>
//                             </div>
//                           </div>
//                         </div>
//                       `;

//         await page.setContent(bdayHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: employeesForTemplate[0]?.company,
//           branch: employeesForTemplate[0]?.branch,
//           unit: employeesForTemplate[0]?.unit,
//           team: employeesForTemplate[0]?.team,
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           categoryname: String("Birthday"),
//           subcategoryname: String("Birthday"),
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           themename: "1-Person Manual Template",
//           addedby: [
//             {
//               name: String("Birthday"),
//               date: String(new Date()),
//             },
//           ],
//         });

//       }

//       await browser.close();
//     }
//   } catch (error) {
//     console.error('Error in autoLogout:', error);
//   }
// };

// const AutoPostercreateWedding = async () => {
//   try {
//     const today = new Date();
//     console.log(today, "today")
//     const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
//     const todayDay = String(today.getDate()).padStart(2, "0");

//     const overallsettings = await AdminOverAllSettings.find();

//     const footerMessage = await FooterMessage.find()

//     const userTodayBD = await User.find({
//       dom: { $regex: `-${todayMonth}-${todayDay}$` }
//     });

//     const employeeCount = userTodayBD.length;
//     console.log(employeeCount, "employeeCount")

//     if (employeeCount > 0) {

//       let remainingEmployees = employeeCount;

//       // Generate 3-person templates for every set of 3 employees
//       const numberOfThreePersonTemplates = Math.floor(remainingEmployees / 3);
//       let processedEmployees = 0;

//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();

//       for (let i = 0; i < numberOfThreePersonTemplates; i += 3) {
//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 3);;
//         processedEmployees += 3;
//         remainingEmployees -= 3;

//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Wedding Anniversary!";

//         const yearChange0 = moment(employeesForTemplate[0]?.dom).format("DD-MM-YYYY")
//         const yearChange1 = moment(employeesForTemplate[1]?.dom).format("DD-MM-YYYY")
//         const yearChange2 = moment(employeesForTemplate[2]?.dom).format("DD-MM-YYYY")
//         const [day0, month0] = yearChange0.split("-");
//         const [day1, month1] = yearChange1.split("-");
//         const [day2, month2] = yearChange2.split("-");
//         const newDate0 = `${day0}-${month0}-${currentYear}`;
//         const newDate1 = `${day1}-${month1}-${currentYear}`;
//         const newDate2 = `${day2}-${month2}-${currentYear}`;
//         const idArray = [employeesForTemplate[0]?.companyname, employeesForTemplate[1]?.companyname, employeesForTemplate[2]?.companyname];
//         const users = await User.aggregate([
//           {
//             $match: {
//               $and: [
//                 {
//                   enquirystatus: {
//                     $nin: ["Enquiry Purpose"],
//                   },
//                 },
//                 {
//                   resonablestatus: {
//                     $nin: [
//                       "Not Joined",
//                       "Postponed",
//                       "Rejected",
//                       "Closed",
//                       "Releave Employee",
//                       "Absconded",
//                       "Hold",
//                       "Terminate",
//                     ],
//                   },
//                 },
//                 ...(idArray.length > 0
//                   ? [
//                     {
//                       companyname: { $in: idArray },
//                     },
//                   ]
//                   : []),
//               ],
//             },
//           },
//           {
//             "$lookup": {
//               "from": "employeedocuments",
//               "let": { "userId": { "$toString": "$_id" } },
//               "pipeline": [
//                 {
//                   "$match": {
//                     "$expr": {
//                       "$eq": ["$commonid", "$$userId"]
//                     }
//                   }
//                 }
//               ],
//               "as": "employeeDocuments"
//             }
//           },
//           {
//             "$unwind": "$employeeDocuments"
//           },
//           {
//             "$replaceRoot": { "newRoot": "$employeeDocuments" }
//           },
//           {
//             "$project": {
//               "_id": 1,
//               "commonid": 1,
//               "profileimage": 1
//             }
//           }
//         ]);

//         // Generate HTML for the template
//         let weddingHtml = `
//                                         <div style="
//                                            display: flex;
//                                           justify-content: center;
//                                           align-items: center;
//                                           width: 100%;
//                                           height: 100%;
//                                         ">
//                                             <div style="
//                                               position: relative;
//                                               width: 500px;
//                                               height: 520px;
//                                               background-image: url('data:image/png;base64,${imageBase64wed}');
//                                               background-position: center;
//                                               background-size: contain;
//                                               background-repeat: no-repeat;
//                                               box-sizing: border-box;
//                                             ">
//                                                 <div style="
//                                                     position: absolute;
//                                                     top: 15px;
//                                                     right: 10px;
//                                                 ">
//                                                     <img src="${overallsettings[0]?.companylogo}" alt="logo" style="
//                                                        width: 90px;
//                                                         height: 90px;
//                                                         font-family: "League Spartan", serif;
//                                                     " /><br />
//                                                 </div>
//                                                 <div id="emponediv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 220px;
//                                                         left: 330px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                         font-family: "League Spartan", serif;
//                                                     ">
//                                                         <img src="${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         "/>                                                        
//                                                             <span style="
//                                                                 transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                                 font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'}
//                                                             ">
//                                                         ${employeesForTemplate[0]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                            position: absolute;
//                                                           bottom: -16px;
//                                                           left: -240px;
//                                                           width: 460px;
//                                                           font-family: "League Spartan", serif;
//                                                           font-size: 15px;
//                                                           font-weight: 500;
//                                                           letter-spacing: 1px;
//                                                           word-spacing: 1px;
//                                                           margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate0 ? newDate0 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div id="emptwodiv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 220px;
//                                                         left: 80px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                     ">
//                                                         <img src="${users[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         " />                                                        
//                                                             <span style="
//                                                                 transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                                 font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'}
//                                                             " >                                                    
//                                                         ${employeesForTemplate[1]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                            position: absolute;
//                                                             text-align: start;
//                                                             bottom: -16px;
//                                                             left: 258px;
//                                                             width: 460px;
//                                                             font-family: "League Spartan", serif;
//                                                             font-size: 15px;
//                                                             font-weight: 500;
//                                                             letter-spacing: 1px;
//                                                             word-spacing: 1px;
//                                                             margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate1 ? newDate1 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div id="empthreediv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 280px;
//                                                         left: 205px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                     ">
//                                                         <img src="${users[2]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         " />
//                                                             <span style="
//                                                                transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                             " style="font-size: ${employeesForTemplate[2]?.companyname?.length > 11 ? '11px' : 'initial'}">
//                                                             ${employeesForTemplate[2]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                             position: absolute;
//                                                             text-align: start;
//                                                             bottom: -16px;
//                                                             left: 7px;
//                                                             width: 460px;
//                                                             font-family: "League Spartan", serif;
//                                                             font-size: 15px;
//                                                             font-weight: 500;
//                                                             letter-spacing: 1px;
//                                                             word-spacing: 1px;
//                                                             margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate2 ? newDate2 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div style="
//                                                    position: absolute;
//                                                     text-align: center;
//                                                     bottom: 65px;
//                                                     left: 30px;
//                                                     width: 460px;
//                                                     font-family: "League Spartan", serif;
//                                                     font-size: 18px;
//                                                     font-weight: 500;
//                                                     letter-spacing: 1px;
//                                                     word-spacing: 1px;
//                                                 ">
//                                                     <span style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'}">
//                                                         ${randomWish}
//                                                     </span>
//                                                 </div>
//                                                 <div style="
//                                                   position: absolute;
//                                                   bottom: 10px;
//                                                   left: 220px;
//                                                 ">
//                                                     <span>${footerMessage[0]?.footermessage === "" || footerMessage[0]?.footermessage === undefined || footerMessage[0]?.footermessage === "undefined" ? "" : footerMessage[0]?.footermessage}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     `;

//         await page.setContent(weddingHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: [...new Set(employeesForTemplate.map((emp) => emp?.company).filter(Boolean))],
//           branch: [...new Set(employeesForTemplate.map((emp) => emp?.branch).filter(Boolean))],
//           unit: [...new Set(employeesForTemplate.map((emp) => emp?.unit).filter(Boolean))],
//           team: [...new Set(employeesForTemplate.map((emp) => emp?.team).filter(Boolean))],
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           categoryname: String("Wedding"),
//           subcategoryname: String("Wedding"),
//           themename: "3-Person Manual Template",
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           addedby: [
//             {
//               name: String("Wedding"),
//               date: String(new Date()),
//             },
//           ],
//         });
//       }

//       if (remainingEmployees === 2) {

//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 2);
//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Wedding Anniversary!";
//         const yearChange0 = moment(employeesForTemplate[0]?.dom).format("DD-MM-YYYY")
//         const yearChange1 = moment(employeesForTemplate[1]?.dom).format("DD-MM-YYYY")
//         const [day0, month0] = yearChange0.split("-");
//         const [day1, month1] = yearChange1.split("-");
//         const newDate0 = `${day0}-${month0}-${currentYear}`;
//         const newDate1 = `${day1}-${month1}-${currentYear}`;

//         const idArray = [employeesForTemplate[0]?.companyname, employeesForTemplate[1]?.companyname];
//         const users = await User.aggregate(
//           [
//             {
//               $match: {
//                 $and: [
//                   {
//                     enquirystatus: {
//                       $nin: ["Enquiry Purpose"],
//                     },
//                   },
//                   {
//                     resonablestatus: {
//                       $nin: [
//                         "Not Joined",
//                         "Postponed",
//                         "Rejected",
//                         "Closed",
//                         "Releave Employee",
//                         "Absconded",
//                         "Hold",
//                         "Terminate",
//                       ],
//                     },
//                   },
//                   ...(idArray.length > 0
//                     ? [
//                       {
//                         companyname: { $in: idArray },
//                       },
//                     ]
//                     : []),
//                 ],
//               },
//             },
//             {
//               "$lookup": {
//                 "from": "employeedocuments",
//                 "let": { "userId": { "$toString": "$_id" } },
//                 "pipeline": [
//                   {
//                     "$match": {
//                       "$expr": {
//                         "$eq": ["$commonid", "$$userId"]
//                       }
//                     }
//                   }
//                 ],
//                 "as": "employeeDocuments"
//               }
//             },
//             {
//               "$unwind": "$employeeDocuments"
//             },
//             {
//               "$replaceRoot": { "newRoot": "$employeeDocuments" }
//             },
//             {
//               "$project": {
//                 "_id": 1,
//                 "commonid": 1,
//                 "profileimage": 1
//               }
//             }
//           ]
//         );

//         let weddingHtml = `
//                       <div style="
//                          display: flex;
//                           justify-content: center;
//                           align-items: center;
//                           width: 100%;
//                           height: 100%;
//                       ">
//                           <div style="
//                             position: relative;
//                             width: 500px;
//                             height: 520px;
//                             background-image: url('data:image/png;base64,${imageBase64wed}');
//                             background-position: center;
//                             background-size: contain;
//                             background-repeat: no-repeat;
//                             box-sizing: border-box;
//                           ">
//                               <div style="
//                                  position: absolute;
//                                   top: 15px;
//                                   right: 195px;
//                               ">
//                                   <img src="${overallsettings[0]?.companylogo}" alt="logo" style="
//                                     width: 95px;
//                                     height: 95px;
//                                   " /><br />
//                               </div>
//                               <div id="twoempprofile">
//                                   <div id="emponediv">
//                                       <div style="
//                                           position: absolute;
//                                           top: 220px;
//                                           left: 270px;
//                                           display: flex;
//                                           flex-direction: column;
//                                       ">
//                                           <img src='${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" style="
//                                               transform: rotate(0deg);
//                                               width: 150px;
//                                               height: 150px;
//                                               border-radius: 3px;
//                                           " />
//                                           <span style="
//                                             transform: rotate(0deg);
//                                             text-align: center;
//                                             font-family: "League Spartan", cursive;
//                                             font-weight: 900;
//                                             font-style: bold;
//                                             font-size: 20px;
//                                             margin-top: 5px;
//                                             font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'};
//                                           "
                                              
//                                           >${employeesForTemplate[0]?.companyname}</span>
//                                           <span class="bdaydobtwo2nos">${newDate0 ? newDate0 : ""}</span>
//                                       </div>
//                                   </div>
//                                   <div id="emptwodiv">
//                                       <div style="
//                                           position: absolute;
//                                           top: 220px;
//                                           left: 80px;
//                                           display: flex;
//                                           flex-direction: column;
//                                       ">
//                                           <img src='${users[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" style="
//                                               transform: rotate(0deg);
//                                               width: 150px;
//                                               height: 150px;
//                                               border-radius: 3px;
//                                           " />
//                                           <span id="usernametwotwo2nos" class="usernametwo2nos"
//                                               style="font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'};"
//                                           >${employeesForTemplate[1]?.companyname}</span>
//                                           <span class="bdaydobtwotwo2nos">${newDate0 ? newDate0 : ""}</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div style="
//                                   position: absolute;
//                                   text-align: center;
//                                   bottom: 48px;
//                                   left: 84px;
//                                   width: 360px;
//                                   font-family: "League Spartan", serif;
//                                   font-size: 18px;
//                                   font-weight: 500;
//                                   letter-spacing: 1px;
//                                   word-spacing: 1px;
//                               ">
//                                   <span
//                                       style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'};"
//                                   >${randomWish}</span>
//                               </div>
//                               <div style="
//                                 position: absolute;
//                                 bottom: 10px;
//                                 left: 220px;
//                                 font-family: "League Spartan", serif;
//                               ">
//                                   <span>${footerMessage[0]?.footermessage === "" || footerMessage[0]?.footermessage === undefined || footerMessage[0]?.footermessage === "undefined" ? "" : footerMessage[0]?.footermessage}</span>
//                               </div>
//                           </div>
//                       </div>
//                   `;

//         await page.setContent(weddingHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: [...new Set(employeesForTemplate.map((emp) => emp?.company).filter(Boolean))],
//           branch: [...new Set(employeesForTemplate.map((emp) => emp?.branch).filter(Boolean))],
//           unit: [...new Set(employeesForTemplate.map((emp) => emp?.unit).filter(Boolean))],
//           team: [...new Set(employeesForTemplate.map((emp) => emp?.team).filter(Boolean))],
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           categoryname: String("Wedding"),
//           subcategoryname: String("Wedding"),
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           themename: "2-Person Manual Template",
//           addedby: [
//             {
//               name: String("Wedding"),
//               date: String(new Date()),
//             },
//           ],
//         });
//         processedEmployees += 2;
//         remainingEmployees -= 2;
//       }

//       if (remainingEmployees === 1) {

//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 1);
//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Wedding Anniversary!";
//         const yearChange = moment(employeesForTemplate[0]?.dom).format("DD-MM-YYYY")
//         const [day, month] = yearChange.split("-");
//         const newDate = `${day}-${month}-${currentYear}`;
//         const idArray = [employeesForTemplate[0]?.companyname];
//         const users = await User.aggregate([
//           {
//             $match: {
//               $and: [
//                 {
//                   enquirystatus: {
//                     $nin: ["Enquiry Purpose"],
//                   },
//                 },
//                 {
//                   resonablestatus: {
//                     $nin: [
//                       "Not Joined",
//                       "Postponed",
//                       "Rejected",
//                       "Closed",
//                       "Releave Employee",
//                       "Absconded",
//                       "Hold",
//                       "Terminate",
//                     ],
//                   },
//                 },
//                 ...(idArray.length > 0
//                   ? [
//                     {
//                       companyname: { $in: idArray },
//                     },
//                   ]
//                   : []),
//               ],
//             },
//           },
//           {
//             "$lookup": {
//               "from": "employeedocuments",
//               "let": { "userId": { "$toString": "$_id" } },
//               "pipeline": [
//                 {
//                   "$match": {
//                     "$expr": {
//                       "$eq": ["$commonid", "$$userId"]
//                     }
//                   }
//                 }
//               ],
//               "as": "employeeDocuments"
//             }
//           },
//           {
//             "$unwind": "$employeeDocuments"
//           },
//           {
//             "$replaceRoot": { "newRoot": "$employeeDocuments" }
//           },
//           {
//             "$project": {
//               "_id": 1,
//               "commonid": 1,
//               "profileimage": 1
//             }
//           }
//         ]);

//         let weddingHtml = `
//                         <div style="
//                           display: flex;
//                           justify-content: center;
//                           align-items: center;
//                           width: 100%;
//                           height: 100%;
//                         ">
//                           <div style="
//                             position: relative;
//                             width: 500px;
//                             height: 520px;
//                             background-image: url('data:image/png;base64,${imageBase64wed}');
//                             background-position: center;
//                             background-size: contain;
//                             background-repeat: no-repeat;
//                             box-sizing: border-box;
//                           ">
//                             <div style="
//                               position: absolute;
//                               top: 15px;
//                               right: 195px;
//                             ">
//                               <img src="${overallsettings[0]?.companylogo}" alt="logo" style="height: 95px; width: 95px;" />
//                             </div>
//                             <div style="
//                               position: absolute;
//                               top: 220px;
//                               left: 175px;
//                               display: flex;
//                               flex-direction: column;
//                               align-items: center;
//                             ">
//                               <img src="${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
//                                 alt="profile" 
//                                 style="
//                                   transform: rotate(0deg);
//                                   width: 150px;
//                                   height: 150px;
//                                   border-radius: 3px;
//                                 " 
//                               />
//                               <span style="
//                                 transform: rotate(0deg);
//                                 text-align: center;
//                                 font-family: 'League Spartan', cursive;
//                                 font-weight: 900;
//                                 font-style: bold;
//                                 font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '14px' : '16px'};
//                                 margin-top: 5px;
//                               ">
//                                 ${employeesForTemplate[0]?.companyname}
//                               </span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               text-align: center;
//                               bottom: 110px;
//                               left: 22px;
//                               width: 460px;
//                               font-family: 'League Spartan', serif;
//                               font-size: 15px;
//                               font-weight: 500;
//                               letter-spacing: 1px;
//                               word-spacing: 1px;
//                               margin-bottom: 1px;
//                             ">
//                               <span>${newDate ? newDate : "" || ""}</span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               text-align: center;
//                               bottom: 48px;
//                               left: 84px;
//                               width: 360px;
//                               font-family: 'League Spartan', serif;
//                               font-size: 18px;
//                               font-weight: 500;
//                               letter-spacing: 1px;
//                               word-spacing: 1px;
//                             ">
//                               <span style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'};">
//                                 ${randomWish}
//                               </span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               bottom: 10px;
//                               left: 220px;
//                               font-family: 'League Spartan', serif;
//                             ">
//                               <span>${footerMessage[0]?.footermessage}</span>
//                             </div>
//                           </div>
//                         </div>
//                       `;

//         await page.setContent(weddingHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: employeesForTemplate[0]?.company,
//           branch: employeesForTemplate[0]?.branch,
//           unit: employeesForTemplate[0]?.unit,
//           team: employeesForTemplate[0]?.team,
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           categoryname: String("Wedding"),
//           subcategoryname: String("Wedding"),
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           themename: "1-Person Manual Template",
//           addedby: [
//             {
//               name: String("Wedding"),
//               date: String(new Date()),
//             },
//           ],
//         });

//       }

//       await browser.close();
//     }
//   } catch (error) {
//     console.error('Error in autoLogout:', error);
//   }
// };

// const AutoPostercreateWork = async () => {
//   try {
//     const today = new Date();
//     console.log(today, "today")
//     const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
//     const todayDay = String(today.getDate()).padStart(2, "0");

//     const overallsettings = await AdminOverAllSettings.find();

//     const footerMessage = await FooterMessage.find()

//     const userTodayBD = await User.find({
//       doj: { $regex: `-${todayMonth}-${todayDay}$` }
//     });

//     const employeeCount = userTodayBD.length;
//     console.log(employeeCount, "employeeCount")

//     if (employeeCount > 0) {

//       let remainingEmployees = employeeCount;

//       // Generate 3-person templates for every set of 3 employees
//       const numberOfThreePersonTemplates = Math.floor(remainingEmployees / 3);
//       let processedEmployees = 0;

//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();

//       for (let i = 0; i < numberOfThreePersonTemplates; i += 3) {
//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 3);;
//         processedEmployees += 3;
//         remainingEmployees -= 3;

//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Work Anniversary!";

//         const yearChange0 = moment(employeesForTemplate[0]?.doj).format("DD-MM-YYYY")
//         const yearChange1 = moment(employeesForTemplate[1]?.doj).format("DD-MM-YYYY")
//         const yearChange2 = moment(employeesForTemplate[2]?.doj).format("DD-MM-YYYY")
//         const [day0, month0] = yearChange0.split("-");
//         const [day1, month1] = yearChange1.split("-");
//         const [day2, month2] = yearChange2.split("-");
//         const newDate0 = `${day0}-${month0}-${currentYear}`;
//         const newDate1 = `${day1}-${month1}-${currentYear}`;
//         const newDate2 = `${day2}-${month2}-${currentYear}`;
//         const idArray = [employeesForTemplate[0]?.companyname, employeesForTemplate[1]?.companyname, employeesForTemplate[2]?.companyname];
//         const users = await User.aggregate([
//           {
//             $match: {
//               $and: [
//                 {
//                   enquirystatus: {
//                     $nin: ["Enquiry Purpose"],
//                   },
//                 },
//                 {
//                   resonablestatus: {
//                     $nin: [
//                       "Not Joined",
//                       "Postponed",
//                       "Rejected",
//                       "Closed",
//                       "Releave Employee",
//                       "Absconded",
//                       "Hold",
//                       "Terminate",
//                     ],
//                   },
//                 },
//                 ...(idArray.length > 0
//                   ? [
//                     {
//                       companyname: { $in: idArray },
//                     },
//                   ]
//                   : []),
//               ],
//             },
//           },
//           {
//             "$lookup": {
//               "from": "employeedocuments",
//               "let": { "userId": { "$toString": "$_id" } },
//               "pipeline": [
//                 {
//                   "$match": {
//                     "$expr": {
//                       "$eq": ["$commonid", "$$userId"]
//                     }
//                   }
//                 }
//               ],
//               "as": "employeeDocuments"
//             }
//           },
//           {
//             "$unwind": "$employeeDocuments"
//           },
//           {
//             "$replaceRoot": { "newRoot": "$employeeDocuments" }
//           },
//           {
//             "$project": {
//               "_id": 1,
//               "commonid": 1,
//               "profileimage": 1
//             }
//           }
//         ]);

//         // Generate HTML for the template
//         let weddingHtml = `
//                                         <div style="
//                                            display: flex;
//                                           justify-content: center;
//                                           align-items: center;
//                                           width: 100%;
//                                           height: 100%;
//                                         ">
//                                             <div style="
//                                               position: relative;
//                                               width: 500px;
//                                               height: 520px;
//                                               background-image: url('data:image/png;base64,${imageBase64wed}');
//                                               background-position: center;
//                                               background-size: contain;
//                                               background-repeat: no-repeat;
//                                               box-sizing: border-box;
//                                             ">
//                                                 <div style="
//                                                     position: absolute;
//                                                     top: 15px;
//                                                     right: 10px;
//                                                 ">
//                                                     <img src="${overallsettings[0]?.companylogo}" alt="logo" style="
//                                                        width: 90px;
//                                                         height: 90px;
//                                                         font-family: "League Spartan", serif;
//                                                     " /><br />
//                                                 </div>
//                                                 <div id="emponediv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 220px;
//                                                         left: 330px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                         font-family: "League Spartan", serif;
//                                                     ">
//                                                         <img src="${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         "/>                                                        
//                                                             <span style="
//                                                                 transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                                 font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'}
//                                                             ">
//                                                         ${employeesForTemplate[0]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                            position: absolute;
//                                                           bottom: -16px;
//                                                           left: -240px;
//                                                           width: 460px;
//                                                           font-family: "League Spartan", serif;
//                                                           font-size: 15px;
//                                                           font-weight: 500;
//                                                           letter-spacing: 1px;
//                                                           word-spacing: 1px;
//                                                           margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate0 ? newDate0 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div id="emptwodiv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 220px;
//                                                         left: 80px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                     ">
//                                                         <img src="${users[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         " />                                                        
//                                                             <span style="
//                                                                 transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                                 font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'}
//                                                             " >                                                    
//                                                         ${employeesForTemplate[1]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                            position: absolute;
//                                                             text-align: start;
//                                                             bottom: -16px;
//                                                             left: 258px;
//                                                             width: 460px;
//                                                             font-family: "League Spartan", serif;
//                                                             font-size: 15px;
//                                                             font-weight: 500;
//                                                             letter-spacing: 1px;
//                                                             word-spacing: 1px;
//                                                             margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate1 ? newDate1 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div id="empthreediv">
//                                                     <div style="
//                                                         position: absolute;
//                                                         top: 280px;
//                                                         left: 205px;
//                                                         display: flex;
//                                                         flex-direction: column;
//                                                     ">
//                                                         <img src="${users[2]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Profile Pic" style="
//                                                            transform: rotate(0deg);
//                                                             width: 100px;
//                                                             height: 100px;
//                                                             border-radius: 3px;
//                                                             font-family: "League Spartan", serif;
//                                                         " />
//                                                             <span style="
//                                                                transform: rotate(0deg);
//                                                                 text-align: center;
//                                                                 font-family: "League Spartan", serif;
//                                                                 font-weight: 900;
//                                                                 font-style: bold;
//                                                                 font-size: 14px;
//                                                                 margin-top: 5px;
//                                                             " style="font-size: ${employeesForTemplate[2]?.companyname?.length > 11 ? '11px' : 'initial'}">
//                                                             ${employeesForTemplate[2]?.companyname}
//                                                         </span>
//                                                         <span style="
//                                                             position: absolute;
//                                                             text-align: start;
//                                                             bottom: -16px;
//                                                             left: 7px;
//                                                             width: 460px;
//                                                             font-family: "League Spartan", serif;
//                                                             font-size: 15px;
//                                                             font-weight: 500;
//                                                             letter-spacing: 1px;
//                                                             word-spacing: 1px;
//                                                             margin-bottom: 1px;
//                                                         ">
//                                                             ${newDate2 ? newDate2 : ""}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div style="
//                                                    position: absolute;
//                                                     text-align: center;
//                                                     bottom: 65px;
//                                                     left: 30px;
//                                                     width: 460px;
//                                                     font-family: "League Spartan", serif;
//                                                     font-size: 18px;
//                                                     font-weight: 500;
//                                                     letter-spacing: 1px;
//                                                     word-spacing: 1px;
//                                                 ">
//                                                     <span style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'}">
//                                                         ${randomWish}
//                                                     </span>
//                                                 </div>
//                                                 <div style="
//                                                   position: absolute;
//                                                   bottom: 10px;
//                                                   left: 220px;
//                                                 ">
//                                                     <span>${footerMessage[0]?.footermessage === "" || footerMessage[0]?.footermessage === undefined || footerMessage[0]?.footermessage === "undefined" ? "" : footerMessage[0]?.footermessage}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     `;

//         await page.setContent(weddingHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: [...new Set(employeesForTemplate.map((emp) => emp?.company).filter(Boolean))],
//           branch: [...new Set(employeesForTemplate.map((emp) => emp?.branch).filter(Boolean))],
//           unit: [...new Set(employeesForTemplate.map((emp) => emp?.unit).filter(Boolean))],
//           team: [...new Set(employeesForTemplate.map((emp) => emp?.team).filter(Boolean))],
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           categoryname: String("Work"),
//           subcategoryname: String("Work"),
//           themename: "3-Person Manual Template",
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           addedby: [
//             {
//               name: String("Work"),
//               date: String(new Date()),
//             },
//           ],
//         });
//       }

//       if (remainingEmployees === 2) {

//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 2);
//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Work Anniversary!";
//         const yearChange0 = moment(employeesForTemplate[0]?.doj).format("DD-MM-YYYY")
//         const yearChange1 = moment(employeesForTemplate[1]?.doj).format("DD-MM-YYYY")
//         const [day0, month0] = yearChange0.split("-");
//         const [day1, month1] = yearChange1.split("-");
//         const newDate0 = `${day0}-${month0}-${currentYear}`;
//         const newDate1 = `${day1}-${month1}-${currentYear}`;

//         const idArray = [employeesForTemplate[0]?.companyname, employeesForTemplate[1]?.companyname];
//         const users = await User.aggregate(
//           [
//             {
//               $match: {
//                 $and: [
//                   {
//                     enquirystatus: {
//                       $nin: ["Enquiry Purpose"],
//                     },
//                   },
//                   {
//                     resonablestatus: {
//                       $nin: [
//                         "Not Joined",
//                         "Postponed",
//                         "Rejected",
//                         "Closed",
//                         "Releave Employee",
//                         "Absconded",
//                         "Hold",
//                         "Terminate",
//                       ],
//                     },
//                   },
//                   ...(idArray.length > 0
//                     ? [
//                       {
//                         companyname: { $in: idArray },
//                       },
//                     ]
//                     : []),
//                 ],
//               },
//             },
//             {
//               "$lookup": {
//                 "from": "employeedocuments",
//                 "let": { "userId": { "$toString": "$_id" } },
//                 "pipeline": [
//                   {
//                     "$match": {
//                       "$expr": {
//                         "$eq": ["$commonid", "$$userId"]
//                       }
//                     }
//                   }
//                 ],
//                 "as": "employeeDocuments"
//               }
//             },
//             {
//               "$unwind": "$employeeDocuments"
//             },
//             {
//               "$replaceRoot": { "newRoot": "$employeeDocuments" }
//             },
//             {
//               "$project": {
//                 "_id": 1,
//                 "commonid": 1,
//                 "profileimage": 1
//               }
//             }
//           ]
//         );

//         let weddingHtml = `
//                       <div style="
//                          display: flex;
//                           justify-content: center;
//                           align-items: center;
//                           width: 100%;
//                           height: 100%;
//                       ">
//                           <div style="
//                             position: relative;
//                             width: 500px;
//                             height: 520px;
//                             background-image: url('data:image/png;base64,${imageBase64wed}');
//                             background-position: center;
//                             background-size: contain;
//                             background-repeat: no-repeat;
//                             box-sizing: border-box;
//                           ">
//                               <div style="
//                                  position: absolute;
//                                   top: 15px;
//                                   right: 195px;
//                               ">
//                                   <img src="${overallsettings[0]?.companylogo}" alt="logo" style="
//                                     width: 95px;
//                                     height: 95px;
//                                   " /><br />
//                               </div>
//                               <div id="twoempprofile">
//                                   <div id="emponediv">
//                                       <div style="
//                                           position: absolute;
//                                           top: 220px;
//                                           left: 270px;
//                                           display: flex;
//                                           flex-direction: column;
//                                       ">
//                                           <img src='${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" style="
//                                               transform: rotate(0deg);
//                                               width: 150px;
//                                               height: 150px;
//                                               border-radius: 3px;
//                                           " />
//                                           <span style="
//                                             transform: rotate(0deg);
//                                             text-align: center;
//                                             font-family: "League Spartan", cursive;
//                                             font-weight: 900;
//                                             font-style: bold;
//                                             font-size: 20px;
//                                             margin-top: 5px;
//                                             font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '11px' : 'initial'};
//                                           "
                                              
//                                           >${employeesForTemplate[0]?.companyname}</span>
//                                           <span class="bdaydobtwo2nos">${newDate0 ? newDate0 : ""}</span>
//                                       </div>
//                                   </div>
//                                   <div id="emptwodiv">
//                                       <div style="
//                                           position: absolute;
//                                           top: 220px;
//                                           left: 80px;
//                                           display: flex;
//                                           flex-direction: column;
//                                       ">
//                                           <img src='${users[1]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}' alt="" style="
//                                               transform: rotate(0deg);
//                                               width: 150px;
//                                               height: 150px;
//                                               border-radius: 3px;
//                                           " />
//                                           <span id="usernametwotwo2nos" class="usernametwo2nos"
//                                               style="font-size: ${employeesForTemplate[1]?.companyname?.length > 11 ? '11px' : 'initial'};"
//                                           >${employeesForTemplate[1]?.companyname}</span>
//                                           <span class="bdaydobtwotwo2nos">${newDate0 ? newDate0 : ""}</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div style="
//                                   position: absolute;
//                                   text-align: center;
//                                   bottom: 48px;
//                                   left: 84px;
//                                   width: 360px;
//                                   font-family: "League Spartan", serif;
//                                   font-size: 18px;
//                                   font-weight: 500;
//                                   letter-spacing: 1px;
//                                   word-spacing: 1px;
//                               ">
//                                   <span
//                                       style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'};"
//                                   >${randomWish}</span>
//                               </div>
//                               <div style="
//                                 position: absolute;
//                                 bottom: 10px;
//                                 left: 220px;
//                                 font-family: "League Spartan", serif;
//                               ">
//                                   <span>${footerMessage[0]?.footermessage === "" || footerMessage[0]?.footermessage === undefined || footerMessage[0]?.footermessage === "undefined" ? "" : footerMessage[0]?.footermessage}</span>
//                               </div>
//                           </div>
//                       </div>
//                   `;

//         await page.setContent(weddingHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: [...new Set(employeesForTemplate.map((emp) => emp?.company).filter(Boolean))],
//           branch: [...new Set(employeesForTemplate.map((emp) => emp?.branch).filter(Boolean))],
//           unit: [...new Set(employeesForTemplate.map((emp) => emp?.unit).filter(Boolean))],
//           team: [...new Set(employeesForTemplate.map((emp) => emp?.team).filter(Boolean))],
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           categoryname: String("Work"),
//           subcategoryname: String("Work"),
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           themename: "2-Person Manual Template",
//           addedby: [
//             {
//               name: String("Work"),
//               date: String(new Date()),
//             },
//           ],
//         });
//         processedEmployees += 2;
//         remainingEmployees -= 2;
//       }

//       if (remainingEmployees === 1) {

//         const employeesForTemplate = userTodayBD.slice(processedEmployees, processedEmployees + 1);
//         const employee = employeesForTemplate.map((item) => item?.companyname);
//         const randomWish = "Happy Work Anniversary!";
//         const yearChange = moment(employeesForTemplate[0]?.doj).format("DD-MM-YYYY")
//         const [day, month] = yearChange.split("-");
//         const newDate = `${day}-${month}-${currentYear}`;
//         const idArray = [employeesForTemplate[0]?.companyname];
//         const users = await User.aggregate([
//           {
//             $match: {
//               $and: [
//                 {
//                   enquirystatus: {
//                     $nin: ["Enquiry Purpose"],
//                   },
//                 },
//                 {
//                   resonablestatus: {
//                     $nin: [
//                       "Not Joined",
//                       "Postponed",
//                       "Rejected",
//                       "Closed",
//                       "Releave Employee",
//                       "Absconded",
//                       "Hold",
//                       "Terminate",
//                     ],
//                   },
//                 },
//                 ...(idArray.length > 0
//                   ? [
//                     {
//                       companyname: { $in: idArray },
//                     },
//                   ]
//                   : []),
//               ],
//             },
//           },
//           {
//             "$lookup": {
//               "from": "employeedocuments",
//               "let": { "userId": { "$toString": "$_id" } },
//               "pipeline": [
//                 {
//                   "$match": {
//                     "$expr": {
//                       "$eq": ["$commonid", "$$userId"]
//                     }
//                   }
//                 }
//               ],
//               "as": "employeeDocuments"
//             }
//           },
//           {
//             "$unwind": "$employeeDocuments"
//           },
//           {
//             "$replaceRoot": { "newRoot": "$employeeDocuments" }
//           },
//           {
//             "$project": {
//               "_id": 1,
//               "commonid": 1,
//               "profileimage": 1
//             }
//           }
//         ]);

//         let weddingHtml = `
//                         <div style="
//                           display: flex;
//                           justify-content: center;
//                           align-items: center;
//                           width: 100%;
//                           height: 100%;
//                         ">
//                           <div style="
//                             position: relative;
//                             width: 500px;
//                             height: 520px;
//                             background-image: url('data:image/png;base64,${imageBase64wed}');
//                             background-position: center;
//                             background-size: contain;
//                             background-repeat: no-repeat;
//                             box-sizing: border-box;
//                           ">
//                             <div style="
//                               position: absolute;
//                               top: 15px;
//                               right: 195px;
//                             ">
//                               <img src="${overallsettings[0]?.companylogo}" alt="logo" style="height: 95px; width: 95px;" />
//                             </div>
//                             <div style="
//                               position: absolute;
//                               top: 220px;
//                               left: 175px;
//                               display: flex;
//                               flex-direction: column;
//                               align-items: center;
//                             ">
//                               <img src="${users[0]?.profileimage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
//                                 alt="profile" 
//                                 style="
//                                   transform: rotate(0deg);
//                                   width: 150px;
//                                   height: 150px;
//                                   border-radius: 3px;
//                                 " 
//                               />
//                               <span style="
//                                 transform: rotate(0deg);
//                                 text-align: center;
//                                 font-family: 'League Spartan', cursive;
//                                 font-weight: 900;
//                                 font-style: bold;
//                                 font-size: ${employeesForTemplate[0]?.companyname?.length > 11 ? '14px' : '16px'};
//                                 margin-top: 5px;
//                               ">
//                                 ${employeesForTemplate[0]?.companyname}
//                               </span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               text-align: center;
//                               bottom: 110px;
//                               left: 22px;
//                               width: 460px;
//                               font-family: 'League Spartan', serif;
//                               font-size: 15px;
//                               font-weight: 500;
//                               letter-spacing: 1px;
//                               word-spacing: 1px;
//                               margin-bottom: 1px;
//                             ">
//                               <span>${newDate ? newDate : "" || ""}</span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               text-align: center;
//                               bottom: 48px;
//                               left: 84px;
//                               width: 360px;
//                               font-family: 'League Spartan', serif;
//                               font-size: 18px;
//                               font-weight: 500;
//                               letter-spacing: 1px;
//                               word-spacing: 1px;
//                             ">
//                               <span style="font-size: ${randomWish?.length > 50 ? '11px' : 'initial'};">
//                                 ${randomWish}
//                               </span>
//                             </div>
//                             <div style="
//                               position: absolute;
//                               bottom: 10px;
//                               left: 220px;
//                               font-family: 'League Spartan', serif;
//                             ">
//                               <span>${footerMessage[0]?.footermessage}</span>
//                             </div>
//                           </div>
//                         </div>
//                       `;

//         await page.setContent(weddingHtml);
//         const imageBase64img = await page.screenshot({ encoding: "base64", fullPage: true });

//         await PosterGenerate.create({
//           company: employeesForTemplate[0]?.company,
//           branch: employeesForTemplate[0]?.branch,
//           unit: employeesForTemplate[0]?.unit,
//           team: employeesForTemplate[0]?.team,
//           entrydate: String(moment(today)?.format("YYYY-MM-DD")),
//           employeename: employee,
//           posterdownload: employeesForTemplate,
//           categoryname: String("Work"),
//           subcategoryname: String("Work"),
//           imagebase64: `data:image/png;base64,${imageBase64img}`,
//           themename: "1-Person Manual Template",
//           addedby: [
//             {
//               name: String("Work"),
//               date: String(new Date()),
//             },
//           ],
//         });

//       }

//       await browser.close();
//     }
//   } catch (error) {
//     console.error('Error in autoLogout:', error);
//   }
// };

// //Define the cron job to run daily at 12:01 AM
// cron.schedule("1 0 * * *", async () => {
//   try {

//     const AutoPosterBd = await AutoPostercreate();
//     const AutoPosterWedding = await AutoPostercreateWedding();
//     const AutoPosterWork = await AutoPostercreateWork();
//     console.log("Poster Created Successfully")
//     console.log(AutoPosterBd)
//     console.log(AutoPosterWedding)
//     console.log(AutoPosterWork)

//   } catch (error) {
//     console.error("Error:", error);
//   }
// });

// //idle time
// //autologout after 1hr from the logintime
// const autoLogout = async () => {
//   try {
//     let idleTimes = await IdleTime.find({ loginstatus: 'loggedin' });
//     idleTimes.forEach(async (item) => {
//       let now = new Date();
//       let startTime = new Date(item.starttime);
//       // Calculate the difference in milliseconds
//       let diff = now - startTime;
//       // Check the role and set the time limit
//       let timeLimitMinutes = item.role.includes("Manager") ? 60 : 15;
//       // Convert difference to minutes
//       let diffMinutes = Math.floor(diff / 1000 / 60);
//       if (diffMinutes >= timeLimitMinutes) {
//         try {
//           await axios.post(
//             `http://192.168.85.100:8003/api/idleendtimeupdate`,
//             {
//               userId: item.userid,
//               endTime: now
//             }
//           );
//           console.log(`User ${item.username} logged out successfully.`);
//         } catch (error) {
//           console.error('Error in axios request:', error.response ? error.response.data : error.message);
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error in autoLogout:', error);
//   }
// };

// // Set an interval to check every minute
// setInterval(autoLogout, 15 * 60 * 1000);  // Check every 1 minute


// // Backup the database on 192.168.85.100
// const backupDB = () => {
//   console.log("Backup process started...");

//   const backupDir = path.join("/home", process.env.USER, "Desktop/mongo_db_backups");  // Define your backup directory

//   // Check if the backup directory exists and create it if it doesn't
//   if (!fs.existsSync(backupDir)) {
//     fs.mkdirSync(backupDir);
//     console.log("Created BACKUP_DIR:", backupDir);
//   }

//   const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//   const backupFolderPath = `${backupDir}/${timestamp}`;
//   const mongoURI = "mongodb://admin:admin@192.168.85.100:27017/ttshrms?authSource=admin"; // Update the URI

//   const mongodumpPath = `/usr/bin/mongodump`;
//   const backupCommand = `${mongodumpPath} --uri=${mongoURI} --out=${backupFolderPath}`;

//   try {
//     execSync(backupCommand);
//     console.log("MongoDB backup completed successfully.");
//   } catch (error) {
//     console.error(`Error during the backup process: ${error.message}`);
//   }
// };

// // Restore the latest backup
// const restoreDB = () => {
//   console.log("Restore process started...");

//   const backupDir = path.join("/home", process.env.USER, "Desktop/mongo_db_backups");

//   // Get the latest backup folder
//   const backups = fs.readdirSync(backupDir);
//   if (backups.length === 0) {
//     console.error("No backups found to restore.");
//     return;
//   }

//   const latestBackup = backups.sort((a, b) => b.localeCompare(a))[0];
//   const latestBackupPath = `${backupDir}/${latestBackup}`;
//   const mongoURI = "mongodb://admin:admin@192.168.85.100:27017/ttshrms?authSource=admin"; // Update the URI

//   console.log(`Restoring from backup: ${latestBackupPath}`);

//   const mongorestorePath = `/usr/bin/mongorestore`;
//   const restoreCommand = `${mongorestorePath} --uri=${mongoURI} --drop ${latestBackupPath}`;

//   try {
//     execSync(restoreCommand);
//     console.log("Database restore completed successfully.");
//   } catch (error) {
//     console.error(`Error during the restore process: ${error.message}`);
//   }
// };

// // Transfer the backup to another IP (192.168.85.100)
// const transferBackup = () => {
//   console.log("Transferring backup to 192.168.85.100...");

//   const backupDir = path.join("/home", process.env.USER, "Desktop/mongo_db_backups");
//   const remoteBackupDir = path.join("/home", "anubhuthi", "Desktop/BACKUP_DIR");
//   //const transferCommand = `rsync -avz ${backupDir}/ anubhuthi@192.168.85.100:${remoteBackupDir}`;
  
//   console.log("BC Completed backupDir")
//   //console.log(remoteBackupDir, 'remoteBackupDir');

//   try {
//     execSync(transferCommand);
//     console.log(transferCommand, 'try')
//     console.log("Backup successfully transferred to 192.168.85.100.");
//   } catch (error) {
//     console.error(`Error transferring backup: ${error.message}`);
//   }
// };

// // Schedule the backup, restore, and transfer every day at a specific time
// // cron.schedule("*/2 * * * *", () => {
//   // backupDB();
//    //restoreDB();
//    //transferBackup();  // Transfer after backup and restore
//  //});

// //useractivescreen

// //hrms idle hours delete function
// // delete previous month's data from the idletime on new month's start date
// cron.schedule('0 0 1 * *', async () => {

//   console.log("Cron job started for deleting previous month's data...");

//   let now = new Date();

//   // Calculate the first day of the current month
//   let firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//   // Convert format 'YYYY-MM-DD'
//   let firstDayOfCurrentMonthStr = firstDayOfCurrentMonth.toISOString().split('T')[0];

//   try {
//     await IdleTime.deleteMany({ date: { $lt: firstDayOfCurrentMonthStr } });

//     console.log('Old idle time records deleted successfully');
//   } catch (error) {
//     console.error('Error deleting old idle time records:', error);
//   }
// });

// // target points pages starting functionality

// const mergeChunkss = async (fileName, totalChunks) => {
//   const chunkDir = __dirname + "/chunkss";
//   const mergedFilePath = __dirname + "/uploads";

//   if (!fs.existsSync(mergedFilePath)) {
//     fs.mkdirSync(mergedFilePath);
//   }

//   const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
//   for (let i = 0; i < totalChunks; i++) {
//     const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
//     const chunkBuffer = await fs.promises.readFile(chunkFilePath);
//     writeStream.write(chunkBuffer);
//     fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
//   }

//   writeStream.end();
//   // console.log("Chunks merged successfully");
// };

// app.post("/api/uploadfile", upload.single("file"), async (req, res) => {
//   // console.log("Hit");
//   const chunk = req.file.buffer;
//   const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
//   const totalChunks = Number(req.body.totalChunks); // Sent from the client
//   const fileName =  req.body.originalname;
//   // const fileConj = ;
//   const fileSize = req.body.filesize;
//   // console.log(chunk,chunkNumber,totalChunks,fileName)
//   const chunkDir = __dirname + "/chunkss"; // Directory to save chunks
//   // console.log(__dirname,'__dirname')
//   if (!fs.existsSync(chunkDir)) {
//     fs.mkdirSync(chunkDir);
//   }

//   const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

//   try {
//     await fs.promises.writeFile(chunkFilePath, chunk);
//     // console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

//     if (chunkNumber === totalChunks - 1) {
//       // If this is the last chunk, merge all chunks into a single file
//       await mergeChunkss(fileName, totalChunks);
//       // console.log("File merged successfully");
//     }

//     res.status(200).json({ message: "Chunk uploaded successfully" });
//   } catch (error) {
//     console.error("Error saving chunk:", error);
//     res.status(500).json({ error: "Error saving chunk" });
//   }
// });

// app.get('/api/downloads/:filename', (req, res) => {
//   // console.log('dgdgd')
//   try {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, 'uploads', filename);
//     // console.log(filename,'filename')
//     // console.log(filePath,'filePath')

//     // Log the file path to check if this part is being executed
//     // console.log('File Path:', filePath);

//     if (fs.existsSync(filePath)) {
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.pipe(res);

//       // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//       res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//       res.setHeader('Content-type', 'application/octet-stream');
//     } else {
//       res.status(404).send('File not found');
//     }
//   } catch (error) {
//     // Log any errors that occur during file retrieval
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.delete("/api/monthupload-start-batch-delete", async (req, res) => {
//   try {
//     const { filter, batchSize = 25000, id } = req.body;
//     await deleteQueue.add("batchDelete", { filter, batchSize, id });

//     res.json({ message: "Deletion job added to queue" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // target points pages ending functionality

// // Revenue amount pages starting functionality

// const mergeChunkssRevenue = async (fileName, totalChunks) => {
//   const chunkDir = __dirname + "/chunkss";
//   const mergedFilePath = __dirname + "/revenueuploads";

//   if (!fs.existsSync(mergedFilePath)) {
//     fs.mkdirSync(mergedFilePath);
//   }

//   const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
//   for (let i = 0; i < totalChunks; i++) {
//     const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
//     const chunkBuffer = await fs.promises.readFile(chunkFilePath);
//     writeStream.write(chunkBuffer);
//     fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
//   }

//   writeStream.end();
//   // console.log("Chunks merged successfully");
// };

// app.post("/api/revenueuploadfile", upload.single("file"), async (req, res) => {
//   // console.log("Hit");
//   const chunk = req.file.buffer;
//   const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
//   const totalChunks = Number(req.body.totalChunks); // Sent from the client
//   const fileName =  req.body.originalname;
//   // const fileConj = ;
//   const fileSize = req.body.filesize;
//   // console.log(chunk,chunkNumber,totalChunks,fileName)
//   const chunkDir = __dirname + "/chunkss"; // Directory to save chunks
//   // console.log(__dirname,'__dirname')
//   if (!fs.existsSync(chunkDir)) {
//     fs.mkdirSync(chunkDir);
//   }

//   const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

//   try {
//     await fs.promises.writeFile(chunkFilePath, chunk);
//     // console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

//     if (chunkNumber === totalChunks - 1) {
//       // If this is the last chunk, merge all chunks into a single file
//       await mergeChunkssRevenue(fileName, totalChunks);
//       // console.log("File merged successfully");
//     }

//     res.status(200).json({ message: "Chunk uploaded successfully" });
//   } catch (error) {
//     console.error("Error saving chunk:", error);
//     res.status(500).json({ error: "Error saving chunk" });
//   }
// });

// app.get('/api/revenuedownloads/:filename', (req, res) => {
//   // console.log('dgdgd')
//   try {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, 'revenueuploads', filename);
//     // console.log(filename,'filename')
//     // console.log(filePath,'filePath')

//     // Log the file path to check if this part is being executed
//     // console.log('File Path:', filePath);

//     if (fs.existsSync(filePath)) {
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.pipe(res);

//       // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//       res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//       res.setHeader('Content-type', 'application/octet-stream');
//     } else {
//       res.status(404).send('File not found');
//     }
//   } catch (error) {
//     // Log any errors that occur during file retrieval
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // Revenue amount pages ending functionality

// // ERA amount pages starting functionality

// const mergeChunkssEra = async (fileName, totalChunks) => {
//   const chunkDir = __dirname + "/chunkss";
//   const mergedFilePath = __dirname + "/eraamountuploads";

//   if (!fs.existsSync(mergedFilePath)) {
//     fs.mkdirSync(mergedFilePath);
//   }

//   const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
//   for (let i = 0; i < totalChunks; i++) {
//     const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
//     const chunkBuffer = await fs.promises.readFile(chunkFilePath);
//     writeStream.write(chunkBuffer);
//     fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
//   }

//   writeStream.end();
//   // console.log("Chunks merged successfully");
// };

// app.post("/api/eraamountuploadfile", upload.single("file"), async (req, res) => {
//   // console.log("Hit");
//   const chunk = req.file.buffer;
//   const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
//   const totalChunks = Number(req.body.totalChunks); // Sent from the client
//   const fileName =  req.body.originalname;
//   // const fileConj = ;
//   const fileSize = req.body.filesize;
//   // console.log(chunk,chunkNumber,totalChunks,fileName)
//   const chunkDir = __dirname + "/chunkss"; // Directory to save chunks
//   // console.log(__dirname,'__dirname')
//   if (!fs.existsSync(chunkDir)) {
//     fs.mkdirSync(chunkDir);
//   }

//   const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

//   try {
//     await fs.promises.writeFile(chunkFilePath, chunk);
//     // console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

//     if (chunkNumber === totalChunks - 1) {
//       // If this is the last chunk, merge all chunks into a single file
//       await mergeChunkssEra(fileName, totalChunks);
//       // console.log("File merged successfully");
//     }

//     res.status(200).json({ message: "Chunk uploaded successfully" });
//   } catch (error) {
//     console.error("Error saving chunk:", error);
//     res.status(500).json({ error: "Error saving chunk" });
//   }
// });

// app.get('/api/eraamountdownloads/:filename', (req, res) => {
//   // console.log('dgdgd')
//   try {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, 'eraamountuploads', filename);
//     // console.log(filename,'filename')
//     // console.log(filePath,'filePath')

//     // Log the file path to check if this part is being executed
//     // console.log('File Path:', filePath);

//     if (fs.existsSync(filePath)) {
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.pipe(res);

//       // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//       res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//       res.setHeader('Content-type', 'application/octet-stream');
//     } else {
//       res.status(404).send('File not found');
//     }
//   } catch (error) {
//     // Log any errors that occur during file retrieval
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // ERA amount pages ending functionality


// // Create an HTTP server and integrate it with Socket.IO
// const server = http.createServer(app);
// app.use(Cors({ origin: "*" }));
// const io = socketIo(server);


// const BASE_URL = "http://192.168.85.100:8003";
// app.get('/api/livescreen/:id', async (req, res) => {
//   const roomId = req.params.id; // Get the room ID from the URL
// console.log(roomId,'roomId')
//   try {
//     // Fetch the user activity data based on the roomId
//     const userActivity = await userActivityLiveScreen.findOne({ _id: roomId });

//     if (!userActivity || !userActivity.live) {
//       // If the activity does not exist or is not live, show the appropriate message
//       return res.send(`
//               <!DOCTYPE html>
//               <html lang="en">
//               <head>
//                   <title>Screecast Viewer</title>
//                   <style>
//                       body {
//                           background: linear-gradient(45deg, #7b0909, #6771b8b8);
//                           color: white;
//                           font-family: Arial, sans-serif;
//                           text-align: center;
//                           padding: 20px;
//                       }
//                       h1 {
//                           font-size: 24px;
//                       }
//                       .message {
//                           background: rgba(0, 0, 0, 0.7);
//                           padding: 20px;
//                           border-radius: 10px;
//                       }
//                   </style>
//               </head>
//               <body>
//                   <div class="message">
//                       <h1>User is not sharing the screen.</h1>
//                   </div>
//               </body>
//               </html>
//           `);
//     }

//     // If live is true, render the screen sharing page
//     res.send(`
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//               <title>Screecast Viewer</title>
//               <style>
//                   body {
//                       background: linear-gradient(45deg, #7b0909, #6771b8b8);
//                       color: white;
//                       font-family: Arial, sans-serif;
//                       text-align: center;
//                       padding: 20px;
//                   }
//                   .info {
//                         display: flex;              
//                         flex-direction: row;       
//                         justify-content: space-between;
//                         align-items: center;      
//                         margin-bottom: 20px;
//                         padding: 10px;            
//                         background: rgba(255, 255, 255, 0.1); 
//                         border-radius: 10px;       
//                     }
//                   img {
//                       width: 90%;
//                       height: 90%;
//                       margin-top: 2%;
//                       margin-left: 5%;
//                   }
//                   .message {
//                       background: rgba(0, 0, 0, 0.7);
//                       padding: 20px;
//                       border-radius: 10px;
//                   }
//               </style>
//           </head>
//           <body>
//               <div class="info">
//                   <h2>Employee Details</h2>
//                   <p><strong>Employee Name:</strong> ${userActivity?.employeename || ""}</p>
//                   <p><strong>Employee Code:</strong> ${userActivity.employeecode || ""}</p>
//                   <p><strong>Username:</strong> ${userActivity?.username || ""}</p>
//                   <p><strong>Device Name:</strong> ${userActivity?.devicename || ""}</p>
//                   <p><strong>MAC Address:</strong> ${userActivity?.macaddress || ""}</p>
//                   <p><strong>Local IP:</strong> ${userActivity?.localip || ""}</p>
//               </div>
//               <img id="screenshot" />
//               <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
//               <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.0.4/socket.io.js" crossorigin="anonymous"></script>
//               <script>
//                   window.onload = function () {
//                       const room = "${roomId}"; // Use the room ID from the URL
//                       if (room.trim().length == 0) {
//                           document.write("<h1> Room ID is mandatory to join </h1>");
//                           return;
//                       }  

//                       const socket = io.connect("http://192.168.85.100:8003");
//                       socket.emit("join-message", room);
//                       socket.on('screen-data', function (message) {
//                           $("#screenshot").attr("src", "data:image/png;base64," + message);
//                       });
//                   }
//               </script>
//           </body>
//           </html>
//       `);
//   } catch (error) {
//     console.error('Error fetching user activity:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });
// const heartbeatTimeouts = {};
// // Socket.IO integration
// io.on('connection', (socket) => {

//   // Join a room
//   socket.on("join-message", (roomId) => {
//     socket.join(roomId);
//     console.log("User joined in a room: " + roomId);
//   });


//   // When the app sends its status
//   socket.on('app-status', async (data) => {
//     const { macAddress, appstatus } = data;
//     await userActivityLiveScreen.findOneAndUpdate({ macaddress: macAddress }, { appstatus: appstatus === 'online' });
//     console.log(`${macAddress} is now ${appstatus}`);

//     // Start monitoring heartbeats
//     startHeartbeatMonitoring(macAddress);
//   });

//   // When the app sends a heartbeat
//   socket.on('app-heartbeat', async (data) => {
//     const { macAddress } = data;
//     //console.log(`Heartbeat received from ${macAddress}`);

//     // Reset heartbeat timeout
//     startHeartbeatMonitoring(macAddress);
//   });

//   // Handle screen data
//   socket.on("screen-data", (data) => {
//     try {
//       data = JSON.parse(data);
//       const room = data.room;
//       const imgStr = data.image;
//       socket.broadcast.to(room).emit('screen-data', imgStr);
//     } catch (error) {
//       console.error('Error processing screen data:', error);
//     }



//   });

//   function startHeartbeatMonitoring(macAddress) {
//     // Clear any existing timeout
//     if (heartbeatTimeouts[macAddress]) {
//       clearTimeout(heartbeatTimeouts[macAddress]);
//     }

//     // Set a timeout to mark the device as offline if no heartbeat is received
//     heartbeatTimeouts[macAddress] = setTimeout(async () => {
//       await userActivityLiveScreen.findOneAndUpdate({ macaddress: macAddress }, { appstatus: false });
//       console.log(`${macAddress} is now offline`);
//     }, 15000); // 15 seconds timeout
//   }

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

// app.put('/api/update-livescreen-status/:id', async (req, res) => {
//   const id = req.params.id; // Get the ID from the request parameters
//   const { live } = req.body; // Get the new live status from the request body

//   // Ensure that the live status is provided and is a boolean
//   if (live === undefined || typeof live !== 'boolean') {
//     return res.status(400).json({ message: 'Invalid live status. Must be a boolean.', success: false });
//   }

//   // Find the document by ID and update the live status
//   let updatedDocument = await userActivityLiveScreen.findByIdAndUpdate(id, { live }, { new: true });
//   console.log(updatedDocument, "updatedDocument")
//   // If the document is not found, return a 404 error
//   if (!updatedDocument) {
//     return next(new ErrorHandler('Accuracymaster not found', 404));
//   }
//   io.emit('live-status-changed', { macAddress: updatedDocument?.macaddress, live: updatedDocument?.live, roomId: updatedDocument?._id });

//   return res.status(200).json({ message: 'Live status updated successfully', data: updatedDocument });

// });

// app.use(errorMiddleware);
// // Handling middleware error
// const port = process.env.PORT || 8003;
// const env = process.env.NODE_ENV;
// server.listen(port, () => {
//   console.log(`Server started at ${env} mode on port ${port}`);
//  //  initSocket(server);
// });

// process.on("uncaughtException", (err) => {
//   console.log(`ERROR: ${err}`);
//   console.log("Shutting down due to uncaught exception");
//   server.close(() => {
//     process.exit(1);
//   });
// });
	
// // // Connect to PM2
// //  pm2.connect((err) => {
// //    if (err) {
// //      console.error(err);
// //      process.exit(1);
// //    }

// // //   // Start the application as a PM2 managed process
// //    pm2.start({
// //      name: 'YourAppName', // Replace 'YourAppName' with your actual application name
// //      script: 'index.js',
// //      max_memory_restart: '8G', // Restart the app if it exceeds 8GB of memory usage
// //      env: {
// //        NODE_ENV: env
// //      }
// //    }, (err) => {
// //      if (err) {
// //        console.error(err);
// //        process.exit(1);
// //      }
// //      console.log('App started successfully with PM2');
// //    });
// //  });

//   }