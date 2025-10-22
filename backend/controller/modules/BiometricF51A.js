const axios = require('axios');

const DEVICE_BASE_URL = process.env.DEVICE_BASE_URL;
const PASSWORD = process.env.DEVICE_PASSWORD;

/**
 * Makes a call to /getUserPower, and if data is found, then calls /getLogInfo.
 * @returns {Promise<Object>} Final result from /getLogInfo if available.
 */
// async function fetchDeviceLogs() {
//     try {
//         const userPowerResponse = await axios.post(`${DEVICE_BASE_URL}/getUserPower`, {
//             pass: PASSWORD,
//             index: 0
//         });

//         const answer = JSON.parse(userPowerResponse?.data?.data);

//         // Exclude faceImage1 and feat
//         const { faceImage1, feat, ...answerObject } = answer;



//         if (answerObject) {
//             // Proceed to get log info
//             const logInfoResponse = await axios.post(`${DEVICE_BASE_URL}/getLogInfo`, {
//                 pass: PASSWORD,
//                 flag: 0,
//                 length: 10,
//                 index: 0
//             });
//             const answer = JSON.parse(logInfoResponse?.data?.data);
//             return answer;
//         } else {
//             throw new Error('No data found in /getUserPower response');
//         }
//     } catch (err) {
//         console.error('Error fetching device logs:', err.message);
//         throw err;
//     }
// }

async function fetchRemoteControl(command, commandName) {
  try {
    // Step 1: Send command to device
    const logInfoResponse = await axios.post(`${DEVICE_BASE_URL}/${commandName}`, command);
    console.log(logInfoResponse?.data, 'logInfoResponse');

    return logInfoResponse?.data?.result; // ✅ Success
  } catch (err) {
    console.error('❌ Error fetching device logs:', err.message);
    return false; // ❌ Failure
  }
}
async function fetchRemoteControlCheck(command, commandName) {
  try {
    // Step 1: Send command to device
    const logInfoResponse = await axios.post(`${DEVICE_BASE_URL}/${commandName}`, command);
    console.log(logInfoResponse?.data, 'logInfoResponse');

    return logInfoResponse?.data; // ✅ Success
  } catch (err) {
    console.error('❌ Error fetching device logs:', err.message);
    return false; // ❌ Failure
  }
}




async function fetchDeviceLogs() {
    try {
        // Step 1: Get logs
        const logInfoResponse = await axios.post(`${DEVICE_BASE_URL}/getLogInfo`, {
            pass: PASSWORD,
            flag: 1,
            length: 10,
            index: 0
        });

        const logs = JSON.parse(logInfoResponse?.data?.data); // logs is array of objects

        if (!Array.isArray(logs)) {
            throw new Error('Log data is not an array');
        }

        const enrichedLogs = [];

        for (const log of logs) {
            const sno = log?.accNo;
          
            if (typeof sno !== 'number') continue;

            // Step 2: Get user details for each sno
            const userPowerResponse = await axios.post(`${DEVICE_BASE_URL}/getUserPower`, {
                pass: PASSWORD,
                index: (sno - 1) < 0 ? 2001 : sno - 1
            });

            const userDataRaw = userPowerResponse?.data?.data;
           
            const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
             
            if (userData) {
                const { faceImage1, feat, ...userDataFiltered } = userData;
                // Step 3: Append accName to log entry
                enrichedLogs.push({
                    ...log,
                    username: userDataFiltered.accName || null
                });
            } else {
                enrichedLogs.push({
                    ...log,
                    username: null
                });
            }
        }
console.log(enrichedLogs , "enrichedLogs")
        return enrichedLogs;
    } catch (err) {
        console.error('Error fetching device logs:', err.message);
        throw err;
    }
}





module.exports = {
    fetchDeviceLogs , fetchRemoteControl , fetchRemoteControlCheck
};
