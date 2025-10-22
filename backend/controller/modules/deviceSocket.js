const WebSocket = require('ws');
const BiometricDeviceManagement = require("../../model/modules/BiometricDeviceManagementModel");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

let clientSocket = null; // <-- shared across module

exports.getAllBiometricDeviceManagement = catchAsyncErrors(async (req, res, next) => {
    let biometricdevicemanagement;
    try {
        biometricdevicemanagement = await BiometricDeviceManagement.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!biometricdevicemanagement) {
        return next(new ErrorHandler("BiometricDeviceManagement Name not found!", 404));
    }
    return res.status(200).json({ biometricdevicemanagement });
});

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

function initWebSocket() {
    const wss = new WebSocket.Server({ port: WEBSOCKET_PORT }, () => {
        console.log('✅ WebSocket server listening on port 7788');
    });

    wss.on('connection', (ws, req) => {
        console.log('📡 Device connected from:', req.socket.remoteAddress);
        clientSocket = ws; // <-- Store in outer scoped variable

        // const sendCommand = () => {
        //     const command = {
        //         cmd: "senduser",
        //         enrollid: 1,
        //         name: "rahulv",
        //         backupnum: 50,        // 0~9: fingerprint, 20–27: static face, 30–37: palm, 50: photo
        //         admin: 0,
        //         record: imageUrl// This should be a string of appropriate content (Base64, number, etc.)
        //     };

        //     try {
        //         ws.send(JSON.stringify(command));
        //     } catch (err) {
        //         console.error('❌ Failed to send command:', err.message);
        //     }
        // };

        // const interval = setInterval(() => {
        //     if (ws.readyState === WebSocket.OPEN) {
        //         sendCommand();
        //         console.log('Sent')
        //     }
        // }, 50000);

        // ws.on('message', async (message) => {
        //     try {
        //         const data = JSON.parse(message);
        //         if (data?.record?.length > 0) {
        //             let result = [];
        //             data.record.forEach(item => {
        //                 result.push({
        //                     biometricUserIDC: item?.enrollid,
        //                     clockDateTimeD: formatToDDMMYYYYWithTime(item?.time),
        //                     cloudIDC: data?.sn,
        //                     verifyC: item?.mode === 2 ? "Pass" : "",
        //                     staffNameC: item?.name
        //                 });
        //             });
        //             console.log('✅ Parsed record:', result);
        //         }
        //     } catch (err) {
        //         console.error('❌ Invalid JSON from device:', message);
        //     }
        // });

        ws.on('close', () => {
            console.log('🔌 Device disconnected');
            // clearInterval(interval);
            clientSocket = null;
        });

        ws.on('error', (err) => {
            console.error('❌ WebSocket error:', err);
            // clearInterval(interval);
            clientSocket = null;
        });
    });
}

function sendCommandToDeviceAttendance(command) {
    console.log('📤 Sending command to device:', command);

    return new Promise((resolve, reject) => {
        if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
            const handler = (message) => {
                try {
                    const data = JSON.parse(message);
                    clientSocket.off('message', handler); // Clean up listener
                    resolve(data); // Return response
                } catch (err) {
                    console.error('❌ Failed to parse response from device:', err.message);
                    clientSocket.off('message', handler);
                    reject(err);
                }
            };

            clientSocket.on('message', handler);
            clientSocket.send(JSON.stringify(command));
        } else {
            console.error('❌ Device not connected or socket not open');
            reject(new Error('Device not connected or socket not open'));
        }
    });
}


function sendCommandToDevice(command) {
    return new Promise((resolve, reject) => {
        console.log('📤 Sending command to device:', command);

        if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
            try {
                clientSocket.send(JSON.stringify(command), (err) => {
                    if (err) {
                        console.error('❌ Failed to send command:', err.message);
                        return resolve(false);
                    } else {
                        console.log('✅ Command sent successfully', command);
                        return resolve(true);
                    }
                });
            } catch (err) {
                console.error('❌ Exception while sending command:', err.message);
                return resolve(false);
            }
        } else {
            console.error('❌ Device not connected or socket not open');
            return resolve(false);
        }
    });
}



module.exports = { initWebSocket, sendCommandToDevice, sendCommandToDeviceAttendance };
