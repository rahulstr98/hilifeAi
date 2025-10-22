
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const crypto = require('crypto');
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const QRCode = require("qrcode");
const fs = require("fs");
// Configure multer
const storage = multer.memoryStorage(); // keeps file in memory
const upload = multer({ storage })
const BiometricDeviceManagement = require("../model/modules/BiometricDeviceManagementModel");
const nodemailer = require("nodemailer");
const path = require("path");

const performLogin = async (url) => {

  if (!url) {
    return null
  }
  const adminPassword = process.env.BOWER_DEVICE_PASSWORD;
  const hash = crypto.randomUUID();
  const saltedPassword = hash + adminPassword + hash;
  const hashedPassword = crypto.createHash('md5').update(saltedPassword).digest('hex').toUpperCase();

  const payload = {
    password: hashedPassword,
    Hash: hash
  };
  // console.log(payload ,adminPassword, "url")
  try {
    const response = await axios.post(`${url}/api/User/Login`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const token = response.data.content.token;
    return token; // 🔸 return the token
  } catch (err) {
    console.log('Login failed:', err.response?.data || err.message);
    throw err;
  }
};


// Get New User Id from the BOWER Biometric Device to add an user
exports.getNewUserIdList = catchAsyncErrors(async (req, res, next) => {
  try {
    const deviceIpAddress = await BiometricDeviceManagement.findOne({ biometricserialno: req?.body?.biometricdevicename })
    const deviceURL = `http://${deviceIpAddress?.biometricassignedip}`;
    const token = await performLogin(deviceURL);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not received",
      });
    }

    const response = await axios.post(
      `${deviceURL}/api/People/GetNewID`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response?.data;

    if (result?.result === true && result?.content?.NewUserID) {
      return res.status(200).json({
        success: true,
        NewUserID: result.content.NewUserID,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result?.error || 'Failed to retrieve NewUserID',
        errCode: result?.errCode || 10001,
      });
    }

  } catch (err) {
    console.log('Error in getNewUserIdList:', err);
    return next(new ErrorHandler("Records not found!", 500));
  }
});

// Adding new user to the BOWER Biometric Device
exports.addNewUserToDevice = catchAsyncErrors(async (req, res, next) => {
  try {
    const deviceIpAddress = await BiometricDeviceManagement.findOne({ biometricserialno: req?.body?.biometricdevicename })
    const deviceURL = `http://${deviceIpAddress?.biometricassignedip}`;
    /*const deviceURL = req?.body?.biometricdevicename === "FC-8190H25031119" ? process.env.BOWER_DEVICE_URL : req?.body?.biometricdevicename === "FC-8190H25031124" ? process.env.BOWER_DEVICE_URL2 : "";*/

    const token = await performLogin(deviceURL);
    if (!token) {
      return res.status(401).json({ success: false, message: "Token not received" });
    }

    const rawPeopleJson = req.body.PeopleJson;
    // console.log(rawPeopleJson , "rawPeopleJson")
    const base64Photo = req.file; // This is base64 string
    if (!rawPeopleJson) {
      return res.status(400).json({ success: false, message: "PeopleJson is required" });
    }
console.log(rawPeopleJson?.photo?.slice(0,20) , rawPeopleJson?.Photo?.slice(0,20) , "base64Photo")
    const response = await addNewUserToDevice(rawPeopleJson, base64Photo, token, deviceURL); // Use `await` here

    if (response.success) {
      return res.status(200).json({ success: true, data: response.content });
    } else {
      return res.status(500).json({ success: false, message: response.error || "User is not Added" });
    }
  } catch (err) {
    console.error("Error in addNewUserToDevice:", err);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

function addNewUserToDevice(peopleObj, photoPath, token, deviceurl) {
  const form = new FormData();
  form.append('PeopleJson', JSON.stringify(peopleObj));
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
  return axios.post(`${deviceurl}/api/People/New`, form, {
    headers,
    timeout: 10000, // Optional: set timeout
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })
    .then(res => {
      return { success: res.data?.result, content: res.data?.content };
    })
    .catch(err => {
      console.error('Error:', err.response?.data || err.message);
      return { success: false, error: err.response?.data || err.message };
    });

}

// Remote Commands from Biometric Remote Control UI page
exports.sendCommandToBoweeDevice = async (command, url) => {
  try {
    const token = await performLogin(url);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not received",
      });

    }
    const response = await axios.post(
      `${url}/api/Device/Remote`,
      command,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response?.status === 200
  }
  catch (error) {
    return false
  }
}

// Delete the user from HRMS to the DEVICE
exports.deleteSingleBoweeUser = async (userid, url) => {
  try {
    const token = await performLogin(url);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not received",
      });
    }
    const command = {
      "UserIDs": [String(userid)]
    }
    const response = await axios.post(
      `${url}/api/People/Delete`,
      command,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response?.status === 200
  }
  catch (error) {
    return false
  }
}

exports.deleteMultipleVisitor = async (userid, url) => {
  try {
    const token = await performLogin(url);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not received",
      });
    }
    const command = {
      "UserIDs": userid
    }
    const response = await axios.post(
      `${url}/api/People/Delete`,
      command,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response?.status === 200
  }
  catch (error) {
    return false
  }
}


exports.getUserDetailsFromBoweeDevice = async (id, url) => {
  try {
    const token = await performLogin(url);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not received",
      });

    }

    let command = {
      "UserID": String(id)
    }
    const response = await axios.post(
      `${url}/api/People/GetDetail`,
      command,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response?.data?.content
  }
  catch (error) {
    return error?.message
  }
}

exports.sendUserDetailsToDevice = async (rawPeopleJson, base64Photo, url) => {
  try {
    const token = await performLogin(url);
    if (!token) {
      return {
        success: false,
        message: "Token not received",
      };

    }
    const response = await addNewUserToDevice(rawPeopleJson, base64Photo, token, url); // Use `await` here
    if (response.success) {
      return response.success
    } else {
      return false
    }
  }
  catch (error) {
    console.log(error, "error")
    return false
  }
}


// exports.getAttendanceDetails = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const token = await performLogin();

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Token not received",
//       });
//     }

//     const nowInSeconds = Math.floor(Date.now() / 1000); // current time in seconds
//     const oneHourAgoInSeconds = nowInSeconds - 7200;     // 3600 seconds = 1 hour

//     console.log("1 hour ago:", oneHourAgoInSeconds);
//     console.log("Now:", nowInSeconds);

//     const command = {
//       PageIndex: 1,
//       PageSize: 1000,
//       BeginDate: oneHourAgoInSeconds,
//       EndDate: nowInSeconds
//     };

//     const response = await axios.post(
//       `${process.env.BOWER_DEVICE_URL}/api/Record/Identify/Search`,
//       command,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     const result = response?.data;
//     const ArrayRecords = result?.content?.DataList?.map(item => ({
//       biometricUserIDC: item.UserID,
//       clockDateTimeD: formatUnixToDateTime(item.RecordDate),
//       verifyC: getVerificationMethod(item.RecordType),
//       staffNameC: item.Name
//     }));

//     if (result?.result === true) {
//       return res.status(200).json({
//         success: true,
//         DataList: result.content,
//         ArrayRecords:ArrayRecords,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: result?.error || 'Failed to retrieve NewUserID',
//         errCode: result?.errCode || 10001,
//       });
//     }

//   } catch (err) {
//     console.error('Error in getNewUserIdList:', err);
//     return next(new ErrorHandler("Records not found!", 500));
//   }
// });




// Get Attendance Details
exports.getAttendanceDetails = async (url) => {
  try {
    const token = await performLogin(url);

    if (!token) {
      console.error("Token not received");
      return { success: false, message: "Token not received" };
    }

    const nowInSeconds = Math.floor(Date.now() / 1000); // current time in seconds
    const oneHourAgoInSeconds = nowInSeconds - 1440000;     // 2 hours ago

    const command = {
      PageIndex: 1,
      PageSize: 1000,
      BeginDate: oneHourAgoInSeconds,
      EndDate: nowInSeconds
    };

    const devicename = await axios.get(`${url}/api/GetDeviceSN`);
    const response = await axios.post(
      `${url}/api/Record/Identify/Search`,
      command,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response?.data;
    // console.log(result?.content?.DataList , "result?.content?.DataList")
    if (result?.result === true) {
      const ArrayRecords = result?.content?.DataList?.map(item => ({
        biometricUserIDC: item.UserID,
        clockDateTimeD: formatUnixToDateTime(item.RecordDate),
        verifyC: getVerificationMethod(item.RecordType),
        staffNameC: item.Name,
        cloudIDC: devicename?.data?.result ? devicename?.data?.content : ""
      }));
      const ArrayUnRegisterRecords = result?.content?.DataList?.filter(data => data?.UserID === "0")?.map(item => ({
        biometricUserIDC: item.UserID,
        dateformat: formatUnixToDate(item.RecordDate),
        clockDateTimeD: formatUnixToDateTime(item.RecordDate),
        verifyC: getVerificationMethod(item.RecordType),
        staffNameC: item.Name,
        cloudIDC: devicename?.data?.result ? devicename?.data?.content : "",
        photoC: `${url}${item.Photo}`
      }));

      return {
        success: true,
        DataList: result.content,
        ArrayRecords,
        ArrayUnRegisterRecords
      };
    } else {
      return {
        success: false,
        message: result?.error || 'Failed to retrieve NewUserID',
        errCode: result?.errCode || 10001
      };
    }
  } catch (err) {
    console.error('Error in fetchAttendanceDetails:', err);
    return {
      success: false,
      message: "Records not found!"
    };
  }
};


exports.getUserListForAllUsers = async (url) => {
  try {
    const token = await performLogin(url);

    if (!token) {
      console.error("Token not received");
      return { success: false, message: "Token not received" };
    }

    const devicename = await axios.get(`${url}/api/GetDeviceSN`);
    const deviceID = devicename?.data?.result ? devicename?.data?.content : "";

    const pageSize = 50;
    let pageIndex = 1;
    let totalPages = 1;
    let allUsers = [];

    do {
      const command = {
        PageIndex: pageIndex,
        PageSize: pageSize
      };

      const response = await axios.post(
        `${url}/api/People/Search`,
        command,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response?.data;

      if (result?.result === true) {
        const dataList = result?.content?.DataList || [];
        const totalCount = result?.content?.TotalCount || 0;

        // Calculate total pages only once (first request)
        if (pageIndex === 1) {
          totalPages = Math.ceil(totalCount / pageSize);
        }

        const formattedData = dataList.map(item => ({
          biometricUserIDC: item.UserID,
          downloadedFaceTemplateN: item?.photo ? 1 : 0,
          privilegeC: item?.AccessType === 1 ? "Administrator" : "User",
          isFaceEnrolledC: item?.photo ? "Yes" : "No",
          isEnabledC: item?.OpenTimes === 65535 ? "Yes" : "No",
          staffNameC: item.Name,
          cloudIDC: deviceID
        }));

        allUsers.push(...formattedData);
        pageIndex++;
      } else {
        console.error('Error in response:', result?.error);
        break;
      }
    } while (pageIndex <= totalPages);

    return {
      success: true,
      DataList: allUsers,
      TotalCount: allUsers.length
    };
  } catch (err) {
    console.error('Error in getUserListForAllUsers:', err);
    return {
      success: false,
      message: "Records not found!"
    };
  }
};


exports.getUserListForAllVisitors = async (url) => {
  try {
    const token = await performLogin(url);

    if (!token) {
      console.error("Token not received");
      return { success: false, message: "Token not received" };
    }

    const devicename = await axios.get(`${url}/api/GetDeviceSN`);
    const deviceID = devicename?.data?.result ? devicename?.data?.content : "";

    const pageSize = 100;
    let pageIndex = 1;
    let totalPages = 1;
    let allUsers = [];

    do {
      const command = {
        PageIndex: pageIndex,
        PageSize: pageSize
      };

      const response = await axios.post(
        `${url}/api/People/Search`,
        command,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response?.data;

      if (result?.result === true) {
        const dataList = result?.content?.DataList || [];
        const totalCount = result?.content?.TotalCount || 0;

        // Calculate total pages only once (first request)
        if (pageIndex === 1) {
          totalPages = Math.ceil(totalCount / pageSize);
        }

        const formattedData = dataList
          ?.filter(data => data?.ExpirationDate < Math.floor(Date.now() / 1000))
          .map(item => ({
            biometricUserIDC: item.UserID,
            downloadedFaceTemplateN: item?.photo ? 1 : 0,
            privilegeC: item?.AccessType === 1 ? "Administrator" : "User",
            isFaceEnrolledC: item?.photo ? "Yes" : "No",
            isEnabledC: item?.OpenTimes === 65535 ? "Yes" : "No",
            staffNameC: item.Name,
            cloudIDC: deviceID,
            ExpirationDate: item?.ExpirationDate,
          }));

        allUsers.push(...formattedData);
        pageIndex++;
      } else {
        console.error('Error in response:', result?.error);
        break;
      }
    } while (pageIndex <= totalPages);

    return {
      success: true,
      DataList: allUsers,
      TotalCount: allUsers.length
    };
  } catch (err) {
    console.error('Error in getUserListForAllUsers:', err);
    return {
      success: false,
      message: "Records not found!"
    };
  }
};



// Helper to format Unix timestamp (seconds) to dd-MM-yyyy HH:mm:ss
function formatUnixToDateTime(timestamp) {
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function formatUnixToDate(timestamp) {
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}


function getEndOfTodayUnix(date) {
  // Convert to Date object if it's not already one
  const now = date ? new Date(date) : new Date();
console.log(now , "now")
  if (isNaN(now.getTime())) {
    // Invalid date fallback
    console.warn("Invalid date passed to getEndOfTodayUnix, using current date instead.");
    return Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);
  }

  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59
  );

  return Math.floor(endOfDay.getTime() / 1000);
}


const nowInSeconds = Math.floor(Date.now() / 1000);



function encodeWrinfo(userId, time) {
  const text = `user_id=${userId}_time=${time}`;
  return Buffer.from(text, "utf-8").toString("base64");
}

// Example usage
const encoded = encodeWrinfo(3, Date.now());
console.log(encoded);

// Adding new user to the BOWER Biometric Device
// exports.addNewVisitorToDevice = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // Array of device serial numberss (you can pass this in req.body)
//     console.log("Hitted")
//     const deviceSerials = req.body.deviceSerials || [
//       "FC-8190H25065069",
//       "FC-8245H25047289",
//       // "FC-8245H25047260"

//     ];

//     const base64Photo = req.file; // if photo uploaded
//     const results = [];
//     const qrAttachments = [];

//     // Loop through devices
//     for (const serial of deviceSerials) {
//       let attempt = 0;
//       let success = false;
//       let lastError = null;

//       while (attempt < 2 && !success) { // retry max 2 times (first + retry after token refresh)
//         attempt++;
//         try {
//           const deviceIpAddress = await BiometricDeviceManagement.findOne({ biometricserialno: serial });
//           if (!deviceIpAddress) {
//             results.push({ serial, success: false, error: "Device not found" });
//             break;
//           }

//           const deviceURL = `http://${deviceIpAddress.biometricassignedip}`;
//           let token = await performLogin(deviceURL);

//           if (!token) {
//             results.push({ serial, success: false, error: "Token not received" });
//             break;
//           }

//           // Get unique ID
//           const userid = await axios.post(
//             `${deviceURL}/api/People/GetNewID`,
//             {},
//             {
//               headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//               }
//             }
//           );
//           const deviceDetails = await axios.post(
//             `${deviceURL}/api/Device/GetDetail`,
//             { "SystemInfo": true, "Language": true, },
//             {
//               headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//               }
//             }
//           );
//           console.log(deviceDetails?.data?.content?.SystemTime, "deviceDetails")

//           const uniqueUserID = userid.data?.content?.NewUserID;
//           const PeopleJson = {
//             "UserID": uniqueUserID,
//             "Name": req.body.name || "visitor1",
//             "Job": req.body.job || "Staff",
//             "AccessType": 0,
//             "OpenTimes": 65535,
//             "ExpirationDate": req.body.expirationDate || expirationToday
//           };

//           const response = await addNewVisitorToDevice(PeopleJson, base64Photo, token, deviceURL ,serial);
//           if (response.success) {
//             success = true;
//             results.push({ serial, success: true, data: response.content, qrinfo: response?.userDetails });
//                         const qrData = await qrCodeInfoImage(
//               response.userDetails?.QRCode,
//               response.userDetails,
//               serial
//             );
//             console.log(qrData , "qrData")
//             qrAttachments.push(qrData);
//           } else {
//             lastError = response.error || "User not added";
//             // If it looks like token issue → retry once
//             if (attempt < 2) continue;
//             results.push({ serial, success: false, error: lastError });
//           }
//         } catch (err) {
//           lastError = err.message;
//           // If token-related error, retry
//           if (attempt < 2 && (err.response?.status === 401 || err.message.includes("token"))) {
//             continue;
//           }
//           results.push({ serial, success: false, error: lastError });
//         }
//       }
//     }
//     if (qrAttachments.length > 0) {
//       await sendVisitorQRMail("vrahulmba005@gmail.com", qrAttachments);
//     }
//     // Check if all succeeded
//     const allSucceeded = results.every(r => r.success);
//     return res.status(allSucceeded ? 200 : 207).json({
//       success: allSucceeded,
//       results
//     });

//   } catch (err) {
//     console.error("Error in addNewVisitorToDevices:", err.message);
//     return next(new ErrorHandler("Internal server error", 500));
//   }
// });
//  async function addNewVisitorToDevice(peopleObj, photoPath, token, deviceurl ,serial) {
//   try {
//     const form = new FormData();
//     form.append('PeopleJson', JSON.stringify(peopleObj));

//     if (photoPath && photoPath.buffer) {
//       form.append('Photo', photoPath.buffer, {
//         filename: photoPath.originalname,
//         contentType: photoPath.mimetype
//       });
//     }

//     const headers = {
//       ...form.getHeaders(),
//       'Authorization': `Bearer ${token}`,
//       'Content-Length': form.getLengthSync(),
//     };

//     // Add new visitor
//     const res = await axios.post(`${deviceurl}/api/People/New`, form, {
//       headers,
//       timeout: 10000,
//       maxBodyLength: Infinity,
//       maxContentLength: Infinity
//     });
//     console.log(res.data?.result, "res.data?.result")
//     // Check if People/New was successful
//     if (res.data?.result) {
//       // Only then get device details
//       const deviceDetails = await axios.post(
//         `${deviceurl}/api/People/Search`,
//         {
//           "PageIndex": 1,
//           "PageSize": 100,
//           "UserID": `${peopleObj?.UserID}`
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );


//       return {
//         success: true,
//         content: res.data?.content,
//         userDetails: deviceDetails.data?.content?.DataList[0],
//       };
//     } else {
//       return {
//         success: false,
//         content: res.data?.content || 'People/New failed',
//       };
//     }

//   } catch (err) {
//     console.error('Error:', err.response?.data || err.message);
//     return { success: false, error: err.response?.data || err.message };
//   }
// }

// function qrCodeInfoImage(qrinfo, userDetails, serial) {
//   return new Promise((resolve, reject) => {
//     const fileName = path.join(
//       __dirname,
//       `${userDetails?.Name}_${userDetails?.UserID}_${serial}.png`
//     );

//     const options = { margin: 2, width: 300 };

//     QRCode.toFile(fileName, qrinfo, options, (err) => {
//       if (err) return reject(err);
//       console.log("QR code saved as", fileName);
//       resolve({ path: fileName, cid: `${userDetails?.UserID}_${serial}@hilife.ai` });
//     });
//   });
// }

// async function sendVisitorQRMail(usermail, qrAttachments) {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "cshankari27@gmail.com",
//       pass: "vqhzwuklzypwruyu"
//     }
//   });

//   // Generate HTML for a grid layout
//   let qrHtml = `<div style="display:flex; flex-wrap: wrap; justify-content: center;">`;

//   qrAttachments.forEach((qr, index) => {
//     qrHtml += `
//       <div style="flex: 0 0 30%; text-align: center; margin: 10px;">
//         <p style="margin-bottom: 5px;">QR Code ${index + 1}</p>
//         <img src="cid:${qr.cid}" style="width: 100%; max-width: 200px;" />
//       </div>
//     `;
//   });

//   qrHtml += `</div>`;

//   const mailOptions = {
//     from: "vrahuldgl1998@gmail.com",
//     to: usermail,
//     subject: "Visitor Access QR Codes - HILIFE.AI Private Limited",
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <p>Dear Visitor,</p>
//         <p>Here are your access QR codes for HILIFE.AI Private Limited:</p>
//         ${qrHtml}
//         <p style="margin-top: 20px;">Please use these QR codes to access the premises.</p>
//       </div>
//     `,
//     attachments: qrAttachments.map(qr => ({
//       filename: path.basename(qr.path),
//       path: qr.path,
//       cid: qr.cid
//     }))
//   };

//   await transporter.sendMail(mailOptions);
//   console.log("Email sent successfully with embedded QR codes in grid layout!");
// }







// Helper to convert RecordType to verifyC


exports.addNewVisitorToDevice = catchAsyncErrors(async (req, res, next) => {
  try {
    let deviceSerials = [];
    // req.body.deviceSerials || [
    //   "FC-8190H25065069",
    //   "FC-8245H25047289",
    //   // "FC-8245H25047260"
    // ];
    const { company, branch } = req?.body;
    console.log(req?.body , "body")
    const BioDeviceDetails = await BiometricDeviceManagement.find({ company, branch, isVisitor: true }, { biometricserialno: 1 });
     console.log(BioDeviceDetails?.length , "BioDeviceDetails")
    if (BioDeviceDetails?.length > 0) {
      deviceSerials = BioDeviceDetails?.map(data => data?.biometricserialno)
    }
    console.log(deviceSerials , "deviceSerials")
    const base64Photo = req.file; // if photo uploaded
    const results = [];

    for (const serial of deviceSerials) {
      let attempt = 0;
      let success = false;
      let lastError = null;

      while (attempt < 2 && !success) {
        attempt++;
        try {
          const deviceIpAddress = await BiometricDeviceManagement.findOne({ biometricserialno: serial });
          if (!deviceIpAddress) {
            results.push({ serial, success: false, error: "Device not found" });
            break;
          }

          const deviceURL = `http://${deviceIpAddress.biometricassignedip}`;
          const token = await performLogin(deviceURL);

          if (!token) {
            results.push({ serial, success: false, error: "Token not received" });
            break;
          }

          // Get unique ID for the new visitor
          const useridRes = await axios.post(
            `${deviceURL}/api/People/GetNewID`,
            {},
            {
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            }
          );
          const uniqueUserID = useridRes.data?.content?.NewUserID;
          const expirationToday = getEndOfTodayUnix(req.body.date);
          const PeopleJson = {
            UserID: uniqueUserID,
            Name: req.body.name || "visitor1",
            Job: req.body.job || "Staff",
            AccessType: 0,
            OpenTimes: 65535,
            Photo: req?.body.photo,
            ExpirationDate: expirationToday
          };

          // Add the visitor to the device
          const response = await addVisitorToDeviceSimple(PeopleJson, base64Photo, token, deviceURL);

          if (response.success) {
            success = true;
            results.push({ serial, success: true, data: response.content });
          } else {
            lastError = response.error || "User not added";
            if (attempt < 2) continue;
            results.push({ serial, success: false, error: lastError });
          }

        } catch (err) {
          lastError = err.message;
          if (attempt < 2 && (err.response?.status === 401 || err.message.includes("token"))) continue;
          results.push({ serial, success: false, error: lastError });
        }
      }
    }

    const allSucceeded = results.every(r => r.success);
    return res.status(allSucceeded ? 200 : 207).json({ success: allSucceeded, results });

  } catch (err) {
    console.error("Error in addNewVisitorToDevice:", err.message);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

// --- Simplified function to add visitor to a device ---
async function addVisitorToDeviceSimple(peopleObj, photoPath, token, deviceURL) {
  try {
    const form = new FormData();
    form.append('PeopleJson', JSON.stringify(peopleObj));

    if (photoPath && photoPath.buffer) {
      form.append('Photo', photoPath.buffer, {
        filename: photoPath.originalname,
        contentType: photoPath.mimetype
      });
    }

    const headers = {
      ...form.getHeaders(),
      'Authorization': `Bearer ${token}`,
      'Content-Length': form.getLengthSync()
    };

    const res = await axios.post(`${deviceURL}/api/People/New`, form, {
      headers,
      timeout: 10000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    if (res.data?.result) {
      return { success: true, content: res.data?.content };
    } else {
      return { success: false, content: res.data?.content || "People/New failed" };
    }

  } catch (err) {
    console.error('Error adding visitor:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}


function getVerificationMethod(recordType) {
  switch (recordType) {
    case 1: return "Card";
    case 2: return "Fingerprint";
    case 3: return "FACE";
    case 4: return "Card + Fingerprint";
    case 5: return "FACE + Fingerprint";
    case 6: return "Card + FACE";
    case 7: return "Card + Password";
    case 8: return "FACE + Password";
    case 9: return "Fingerprint + Password";
    case 10: return "Password verification (User ID + Password)";
    case 11: return "Card + Fingerprint + Password";
    case 12: return "Card + FACE + Password";
    case 13: return "Fingerprint + FACE + Password";
    case 14: return "Card + Fingerprint + FACE";
    case 15: return "Repeat Verification";
    case 16: return "Expired";
    case 17: return "Opening Period Expired";
    case 18: return "Not Open on Holidays";
    case 19: return "Unregistered User";
    case 20: return "Detection Lock";
    case 21: return "Valid Times Used Up";
    case 22: return "Locked - Prohibit Door Open";
    case 23: return "Reported Lost Card";
    case 24: return "Blacklist Card";
    case 25: return "Open Door Without Verification";
    case 26: return "Card Swiping Disabled";
    case 27: return "Fingerprint Disabled";
    case 28: return "Controller Expired";
    case 29: return "Valid - Expiry Soon";
    case 30: return "High Body Temp - Denied";
    case 31: return "Visitor Password";
    case 32: return "QR Code";
    case 33: return "User Added via Device";
    case 34: return "User Modified via Device";
    case 35: return "User Deleted via Device";
    case 36: return "Palmprint";
    case 37: return "Card + Palmprint + FACE";
    case 38: return "Palmprint + Password";
    case 39: return "Card + Palmprint";
    case 40: return "FACE + Palmprint";
    case 41: return "Card + Palmprint + Password";
    case 42: return "Palmprint + FACE + Password";
    case 43: return "Fingerprint + Palmprint + FACE";
    case 44: return "Combined Verification - Wait";
    case 45: return "Combined Verification Failed";
    case 46: return "Combined Verification Completed";
    case 47: return "Person + Identity Card";
    default: return "Unknown";
  }
}