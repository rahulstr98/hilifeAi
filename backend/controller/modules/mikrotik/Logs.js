const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const axios = require("axios");
const Logs = require("../../../model/modules/mikrotik/Logs");
const MikrotikMaster = require("../../../model/modules/mikrotik/MikrotikMaster");

const moment = require('moment');

function parseDate(time) {
    let parsedTime;

    // Check if the time is in 'MM-DD hh:mm:ss' format (missing year)
    if (/^\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(time)) {
        // Add the current year
        const currentYear = moment().format('YYYY');
        parsedTime = moment(`${currentYear}-${time}`, 'YYYY-MM-DD HH:mm:ss');
    }
    // Check if the time is in 'HH:mm:ss' format (only time)
    else if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
        // Add the current date
        const currentDate = moment().format('MM-DD-YYYY');
        parsedTime = moment(`${currentDate} ${time}`, 'MM-DD-YYYY HH:mm:ss');
    }
    // Check if the time is in 'MM-DD-YYYY HH:mm:ss' format (full date with full year)
    else if (/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(time)) {
        // Parse the full date as is
        parsedTime = moment(time, 'MM-DD-YYYY HH:mm:ss');
    }
    // Check if the time is in 'MM-DD-YY HH:mm:ss' format (two-digit year)
    else if (/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(time)) {
        // Parse with a two-digit year (interprets 00-69 as 2000-2069 and 70-99 as 1970-1999)
        parsedTime = moment(time, 'MM-DD-YY HH:mm:ss');
    } else {
        parsedTime = time
    }

    // Return the parsed date as a JavaScript Date object (or any desired format)
    return parsedTime.toISOString();  // Or use `.format('YYYY-MM-DD HH:mm:ss')` for formatted output
}


// exports.getAllMikroTikLogs = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { url, username, password } = req.body;
//         const auth = Buffer.from(
//             `${username}:${password}`
//         ).toString("base64");
//         const response = await axios.get(
//             `${url}/rest/log`,
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Basic ${auth}`,
//                 },
//             }
//         );
//         return res.status(200).json({
//             allmikrotiklogs: response.data,
//         });
//     } catch (error) {
//         if (error.response) {
//             return next(
//                 new ErrorHandler(
//                     error.response.data.message || "An error occurred",
//                     error.response.status || 500
//                 )
//             );
//         } else if (error.request) {
//             return next(new ErrorHandler("No response received from server", 500));
//         } else {
//             return next(new ErrorHandler("Error Fetching Datas!", 500));
//         }
//     }
// });


exports.fetchAndStoreMikroTikLogs = catchAsyncErrors(async (req, res, next) => {
    try {
        // Step 1: Delete logs older than 30 days
        const expirationDate = moment().subtract(30, 'days').toDate(); // Get the date 30 days ago
        await Logs.deleteMany({ createdAt: { $lt: expirationDate } });

        // Fetch all MikroTik credentials from MikrotikMaster collection
        const mikrotikMasters = await MikrotikMaster.find();

        for (let master of mikrotikMasters) {
            const { url, username, password } = master;
            const auth = Buffer.from(`${username}:${password}`).toString("base64");

            try {
                // Fetch the logs from MikroTik REST API for each master
                const response = await axios.get(`${url}/rest/log`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Basic ${auth}`,
                    },
                });

                const fetchedLogs = response.data;

                // Iterate over the fetched logs and store only the new logs in the database
                for (let logEntry of fetchedLogs) {
                    let formatedDate = await parseDate(logEntry.time)
                    const existingLog = await Logs.findOne({
                        message: logEntry.message, // Assuming the message field is unique
                        time: formatedDate,       // You can add other conditions if needed
                        url
                    });

                    // If no existing log is found, insert the new log
                    if (!existingLog) {
                        await Logs.create({
                            ...logEntry,
                            mikrotikid: logEntry[".id"],
                            time: formatedDate,
                            url
                        });
                    }
                }
            } catch (error) {
                return next(new ErrorHandler('Data not found!', 500));

            }
        }

        // Return success response (optional if you're using this for cron jobs)
        return "Mikrotik Logs fetched and stored successfully"
    } catch (error) {
        return next(new ErrorHandler("Error fetching logs from MikroTik", 500));
    }
});



exports.getAllMikroTikLogs = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password, fromdate, fromtime, todate, totime } = req.body;
        const auth = Buffer.from(`${username}:${password}`).toString("base64");

        // Fetch the logs from MikroTik REST API
        const response = await axios.get(`${url}/rest/log`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${auth}`,
            },
        });

        const fetchedLogs = response.data;

        // Iterate over the fetched logs and store only the new logs in the database
        for (let logEntry of fetchedLogs) {
            // Check if the log already exists in the database
            let formatedDate = await parseDate(logEntry.time)
            const existingLog = await Logs.findOne({
                message: logEntry.message, // Assuming the message field is unique
                time: formatedDate,       // You can add other conditions if needed
                url
            });


            // If no existing log is found, insert the new log
            if (!existingLog) {

                await Logs.create({
                    ...logEntry,
                    mikrotikid: logEntry[".id"],
                    time: formatedDate,
                    url
                }); // Create a new log entry in the database
            }
        }

        const query = { url };
        let startDate, endDate;
        // Set startDate based on fromdate and fromtime
        if (fromdate) {
            startDate = moment(fromdate).startOf('day'); // Start of the day for fromdate
            if (fromtime) {
                const [hours, minutes,seconds] = fromtime.split(':').map(Number);
                startDate.hours(hours).minutes(minutes).seconds(seconds).milliseconds(0);
            }
        }

        // Set endDate based on todate and totime
        if (todate) {
            endDate = moment(todate).endOf('day'); // End of the day for todate
            if (totime) {
                const [hours, minutes , seconds] = totime.split(':').map(Number);
                endDate.hours(hours).minutes(minutes).seconds(seconds).milliseconds(999);
            }
        }

        // If both dates are provided, add them to the query
        if (startDate && endDate) {
            query.time = {
                $gte: new Date(startDate).toISOString(),
                $lte: new Date(endDate).toISOString()
            };
        } else if (startDate) { // If only startDate is provided
            query.time = {
                $gte: new Date(startDate).toISOString()
            };
        } else if (endDate) { // If only endDate is provided
            query.time = {
                $lte: new Date(endDate).toISOString()
            };
        }
        // Fetch all logs from the database to return in the response
        const storedLogs = await Logs.find(query);

        // Return success response with the stored logs
        return res.status(200).json({
            allmikrotiklogs: storedLogs, // Send the logs stored in your MongoDB collection
        });
    } catch (error) {
        if (error.response) {
            return next(
                new ErrorHandler(
                    error.response.data.message || "An error occurred",
                    error.response.status || 500
                )
            );
        } else if (error.request) {
            return next(new ErrorHandler("No response received from server", 500));
        } else {
            return next(new ErrorHandler("Error Fetching Datas!", 500));
        }
    }
});