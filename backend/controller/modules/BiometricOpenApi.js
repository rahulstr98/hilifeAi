const axios = require('axios');
const FormData = require('form-data');
const DEVICE_API = process.env.DEVICE_GATEWAY_API;
// Utility function to send form-data to device gateway API
async function sendToDeviceGateway(interType) {
    try {
        const content = {
            deviceSn: "ZY20240822028",
            pageNo: 1,
            pageSize: 500,
            startNoteTime: "2025-09-11",
            endNoteTime: "2025-09-11"
        };
        const form = new FormData();
        form.append("agentNo", "82391038574");
        form.append("charset", "UTF-8");
        form.append("content", JSON.stringify(content)); // content is an object
        form.append("deviceSn", "ZY20240822028");
        form.append("interType", interType);
        form.append("requestId", "7864874687489789");
        form.append("sign", "sfdsfdsfds");
        form.append("signType", "RSA");
        form.append("version", "1.0.0");

        const response = await axios.post(
            DEVICE_API,
            form,
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        );
        const ArrayRecords = response.data?.data?.records?.map(item => ({
            biometricUserIDC: item.employeeId,
            clockDateTimeD: item.noteTime,
            verifyC: getVerificationMethod(item.noteWay),
            staffNameC: item.employeeName,
            cloudIDC: item?.deviceSn
        }));
        console.log('✅ API response from gateway:', ArrayRecords, ArrayRecords?.length);
        return response.data?.code === 200 || response.data?.data === "success";
    } catch (error) {
        console.error('❌ Error sending data to device gateway:', error.message);
        throw error;
    }
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
async function fetchDeviceRecords(interType) {
    try {

        const content = {
            deviceSn: "ZY20240822028",
            pageNo: 1,
            pageSize: 500,
            startNoteTime: getTodayDate(),
            endNoteTime: getTodayDate()
        };
        const form = new FormData();
        form.append("agentNo", "82391038574");
        form.append("charset", "UTF-8");
        form.append("content", JSON.stringify(content)); // content is an object
        form.append("deviceSn", "ZY20240822028");
        form.append("interType", interType);
        form.append("requestId", "7864874687489789");
        form.append("sign", "sfdsfdsfds");
        form.append("signType", "RSA");
        form.append("version", "1.0.0");

        const response = await axios.post(
            DEVICE_API,
            form,
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        );
        const ArrayRecords = response.data?.data?.records?.map(item => ({
            biometricUserIDC: item.employeeId,
            clockDateTimeD: formatDateTime(item.noteTime),
            verifyC: getVerificationMethod(item.noteWay),
            staffNameC: item.employeeName,
            cloudIDC: item?.deviceSn
        }));
        // console.log('✅ API response from gateway:', ArrayRecords, ArrayRecords?.length);
        return response.data?.code === 200 ? ArrayRecords : [];
    } catch (error) {
        console.error('❌ Error sending data to device gateway:', error.message);
        throw error;
    }
}

function formatDateTime(input) {
  const date = new Date(input);

  // Extract parts
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}



async function sendToDeviceGatewayAddUser(payload) {
    try {
        // Prepare FormData
        const form = new FormData();
        payload.content.deviceSn = payload.deviceSn;
        form.append("agentNo", payload.agentNo);
        form.append("charset", payload.charset);
        form.append("content", JSON.stringify(payload.content)); // Must be stringified
        form.append("deviceSn", payload.deviceSn);
        form.append("interType", payload.interType);
        form.append("requestId", payload.requestId);
        form.append("sign", payload.sign);
        form.append("signType", payload.signType);
        form.append("version", payload.version);
        const response = await axios.post(
            DEVICE_API,
            form,
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        );

        console.log('✅ API response from gateway:', response.data?.data?.records);
        return response.data?.code === 200 || response.data?.data === "success";
    } catch (error) {
        console.error('❌ Error sending data to device gateway:', error.message);
        throw error;
    }
}
const getVerificationMethod = (recordType) => {
    switch (recordType) {
        case '0': return "FACE";
        case '1': return "CARD";
    }
}
module.exports = { sendToDeviceGateway, fetchDeviceRecords, sendToDeviceGatewayAddUser };
