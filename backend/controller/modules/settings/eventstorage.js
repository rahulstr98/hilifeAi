
const EventLog = require('../../../model/modules/settings/eventstorage');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const User = require("../../../model/login/auth");



//create new floor => /api/floor/new
// exports.addEventStorage = catchAsyncErrors(async (req, res, next) => {
//     console.log("event triggered")

//     const events = req.body.events;
//     const system = req.body.system;

//     let previousDatas = await EventLog.find({}).lean();
//     let filtereddatas = previousDatas?.map((data) => data?.eventType);
//     let filteredEvents = events?.filter((item) => !filtereddatas?.includes(item))
//     console.log(events)
//     const regex = /^([^\[]+)\s\[(.*?)\]\s(.*?):\s(.*?)\sat\s(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})/;
//     // Save each event to the database
//     filteredEvents.forEach(async (event) => {
//         const match = event.match(regex);
//         const id = match[2].trim(); // Extract the ID
//         const username = match[3].trim();
//         const category = match[4].trim(); // Extract the category
//         const dateAndTime = match[5]; // Extract the date and time
//         let foundData = await User.findOne({ usernamepc: username }, { company: 1, branch: 1, unit: 1, team: 1, department: 1 }).lean();
//         const newEvent = new EventLog({
//             eventType: event,
//             category: category,
//             timestamp: dateAndTime,
//             systemid: id,
//             username: username,
//             system: system,
//             company: foundData?.company ?? "",
//             branch: foundData?.branch ?? "",
//             team: foundData?.team ?? "",
//             unit: foundData?.unit ?? "",
//             department: foundData?.department ?? "",
//             status: foundData ? "Matched" : 'UnMatched'

//         });
//         await newEvent.save();
//     });
//     res.send('Success');
// })


// exports.addEventStorage = catchAsyncErrors(async (req, res, next) => {
//     console.log("event triggered");
//     // console.log(req.body.logsWithFileName)
//     try {
//         const events = req.body.logs;
//         const system = req.body.system;
//         const logsWithFileName = req.body.logsWithFileName;

//         // Fetch existing event types in bulk to avoid duplicate entries
//         let previousDatas = await EventLog.find({}, 'eventType').lean(); // Fetch only eventType
//         let existingEventTypes = new Set(previousDatas.map((data) => data.eventType));

//         // Filter out events that are already logged
//         let filteredEvents = logsWithFileName.filter((item) => !existingEventTypes.has(item));

//         // const regex = /^([^\[]+)\s\[(.*?)\]\s(.*?):\s(.*?)\sat\s(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})/;
//         const regex = /^([^\[]+)\s\[(.*?)\]\s(.*?):\s(.*?)\sat\s(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})\s(.*)$/;

//         // Collect all usernames to query the User collection in one go
//         const usernamesSet = new Set(); // To avoid duplicates
//         filteredEvents.forEach(event => {

//             const match = event.match(regex);
//             console.log(match)
//             if (match) {
//                 usernamesSet.add(match[3].trim()); // Add username to set
//             }
//         });

//         // Find all users in one query
//         const usernames = Array.from(usernamesSet); // Convert set to array
//         let users = await User.find({ usernamepc: { $in: usernames } }, 'usernamepc company branch unit team department companyname empcode').lean();
//         let usersMap = {}; // Map to store user data by username
//         users.forEach(user => {
//             usersMap[user.usernamepc] = user;
//         });

//         // Prepare bulk insert for events
//         const newEventDocs = [];

//         let uniqueEvents = Array.from(new Set(filteredEvents))
//         uniqueEvents.forEach(event => {
//             const match = event.match(regex);
//             if (!match) {
//                 console.error(`Failed to parse event: ${event}`);
//                 return; // Skip this event if regex doesn't match
//             }

//             const systemName = match[1].trim();
//             const id = match[2].trim(); // Extract system ID
//             const username = match[3].trim();
//             const category = match[4].trim(); // Extract category
//             const dateAndTime = match[5]; // Extract date and time
//             const dateAndTimeNew = match[5]?.split(" ");
//             const time = dateAndTimeNew[1];
//             const [mm, dd, yy] = dateAndTimeNew[0]?.split('/')
//             const filename = match[6];

//             // Get user data from the usersMap
//             const foundData = usersMap[username] || {};

//             newEventDocs.push({
//                 eventType: event,
//                 category: category,
//                 timestamp: dateAndTime,
//                 systemid: id,
//                 username: username,
//                 system: systemName,
//                 company: foundData.company || "",
//                 branch: foundData.branch || "",
//                 team: foundData.team || "",
//                 unit: foundData.unit || "",
//                 employeename: foundData.companyname || "",
//                 empcode: foundData.empcode || "",
//                 department: foundData.department || "",
//                 status: foundData.usernamepc ? "Matched" : "Mismatched",
//                 time: time,
//                 date: `${yy}-${mm}-${dd}`,
//                 filename: filename

//             });
//         });

//         // Bulk insert new events
//         if (newEventDocs.length > 0) {
//             await EventLog.insertMany(newEventDocs);
//         }

//         res.send('Success');
//     }
//     catch (err) {
//         return next(new ErrorHandler("Records not found!", 404));
//     }
// });

// exports.deleteEventsLog = catchAsyncErrors(async (req, res, next) => {
//     try {
//         // Count the total number of records in the collection
//         const totalRecords = await EventLog.countDocuments();

//         // Check if there are more than 10 records (adjust threshold as needed)
//         if (totalRecords > 10000) {
//             // Calculate the number of records to delete
//             const recordsToDelete = totalRecords - 10000;

//             // Find the oldest records to delete
//             const oldRecords = await EventLog
//                 .find({}, "_id")
//                 .sort({ createdAt: 1 }) // Sort by createdAt in ascending order (oldest first)
//                 .limit(recordsToDelete); // Limit to the number of records to delete

//             // Extract the IDs of the records to delete
//             const idsToDelete = oldRecords.map(record => String(record._id));

//             // Delete the records from MongoDB
//             const deleteResult = await EventLog.deleteMany({ _id: { $in: idsToDelete } });

//             if (deleteResult.deletedCount > 0) {
//                 console.log(`${deleteResult.deletedCount} records deleted from the database.`);
//                 return `${deleteResult.deletedCount} old records deleted successfully.`
//             } else {
//                 console.log("No old records found to delete.");
//                 return "No old records found to delete."
//             }
//         } else {
//             console.log("No records need to be deleted. Total records are within the limit.");
//             return "No records need to be deleted. Total records are within the limit."
//         }
//     } catch (error) {
//         console.error("Error deleting old records:", error);
//         return "Error deleting old records."
//     }
// });



exports.deleteEventsLog = catchAsyncErrors(async (req, res, next) => {
    try {
        const BATCH_SIZE = 100000; // Define batch size
        const MAX_RECORDS = 100000; // Max records to keep
        let totalRecords = await EventLog.countDocuments();
        console.log(totalRecords, "total event records")

        // Check if we need to delete records
        while (totalRecords > MAX_RECORDS) {
            // Calculate the number of records to delete
            const recordsToDelete = Math.min(totalRecords - MAX_RECORDS, BATCH_SIZE);

            // Fetch oldest records
            const oldRecords = await EventLog
                .find({}, '_id')
                .sort({ createdAt: 1 })
                .limit(recordsToDelete);

            // Extract IDs to delete
            const idsToDelete = oldRecords.map(record => String(record._id));

            // Delete the records
            const deleteResult = await EventLog.deleteMany({ _id: { $in: idsToDelete } });

            console.log(`${deleteResult.deletedCount} records deleted from the database.`);

            // Update total record count
            totalRecords = await EventLog.countDocuments();
        }

        return "Old records deleted successfully, total records are now within the limit.";
    } catch (error) {
        console.error("Error deleting old records:", error);
        return "Error deleting old records."
    }
});



// exports.addEventStorage = catchAsyncErrors(async (req, res, next) => {
//     console.log("event triggered");
//     try {
//         const events = req.body.logs;
//         const system = req.body.system;
//         const logsWithFileName = req.body.logsWithFileName;

//         // Fetch existing event types in bulk to avoid duplicate entries
//         let previousDatas = await EventLog.find({}, 'eventType').lean(); // Fetch only eventType
//         let existingEventTypes = new Set(previousDatas.map((data) => {
//             // Extract eventType without filename from existing records
//             const match = data.eventType.match(/^([^\[]+)\s\[(.*?)\]\s(.*?):\s(.*?)\sat\s(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})/);
//             return match ? `${match[1].trim()} [${match[2].trim()}] ${match[3].trim()}: ${match[4].trim()} at ${match[5].trim()}` : data.eventType;
//         }));

//         // Prepare a regex to extract the eventType without filename from logsWithFileName
//         const regex = /^([^\[]+)\s\[(.*?)\]\s(.*?):\s(.*?)\sat\s(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})\s(.*)$/;

//         // Filter out events that are already logged based on eventType without filename
//         let filteredEvents = logsWithFileName.filter((event) => {
//             const match = event.match(regex);
//             if (match) {
//                 // Construct eventType without filename
//                 const eventTypeWithoutFilename = `${match[1].trim()} [${match[2].trim()}] ${match[3].trim()}: ${match[4].trim()} at ${match[5].trim()}`;
//                 // Check if the eventType (without filename) is already in the existingEventTypes set
//                 return !existingEventTypes.has(eventTypeWithoutFilename);
//             }
//             return false;
//         });

//         // Collect all usernames to query the User collection in one go
//         const usernamesSet = new Set();
//         filteredEvents.forEach(event => {
//             const match = event.match(regex);
//             if (match) {
//                 usernamesSet.add(match[3].trim());
//             }
//         });

//         // Find all users in one query
//         const usernames = Array.from(usernamesSet);
//         let users = await User.find({ username: { $in: usernames } }, 'username company branch unit team department companyname empcode').lean();
//         let usersMap = {};
//         users.forEach(user => {
//             usersMap[user.username] = user;
//         });

//         // Prepare bulk insert for events
//         const newEventDocs = [];

//         let uniqueEvents = Array.from(new Set(filteredEvents));
//         uniqueEvents.forEach(event => {
//             const match = event.match(regex);
//             if (!match) {
//                 console.error(`Failed to parse event: ${event}`);
//                 return;
//             }

//             const systemName = match[1].trim();
//             const id = match[2].trim();
//             const username = match[3].trim();
//             const category = match[4].trim();
//             const dateAndTime = match[5];
//             const dateAndTimeNew = match[5]?.split(" ");
//             const time = dateAndTimeNew[1];
//             const [mm, dd, yy] = dateAndTimeNew[0]?.split('/');
//             const filename = match[6].trim();

//             // Construct the eventType without the file path (ignoring match[6])
//             const eventType = `${systemName} [${id}] ${username}: ${category} at ${dateAndTime}`;

//             // Get user data from the usersMap
//             const foundData = usersMap[username] || {};

//             newEventDocs.push({
//                 eventType: eventType,  // Save the constructed eventType without the file path
//                 category: category,
//                 timestamp: dateAndTime,
//                 systemid: id,
//                 username: username,
//                 system: systemName,
//                 company: foundData.company || "",
//                 branch: foundData.branch || "",
//                 team: foundData.team || "",
//                 unit: foundData.unit || "",
//                 employeename: foundData.companyname || "",
//                 empcode: foundData.empcode || "",
//                 department: foundData.department || "",
//                 status: foundData.username ? "Matched" : "Mismatched",
//                 time: time,
//                 date: `${yy}-${mm}-${dd}`,
//                 filename: filename  // Store the file path separately
//             });
//         });

//         // Bulk insert new events
//         if (newEventDocs.length > 0) {
//             await EventLog.insertMany(newEventDocs);
//         }

//         res.send('Success');
//     }
//     catch (err) {
//         return next(new ErrorHandler("Records not found!", 404));
//     }
// });


exports.addEventStorage = catchAsyncErrors(async (req, res, next) => {
    console.log("event triggered");
    try {
        const events = req.body.logs;
        const system = req.body.system;
        const logsWithFileName = req.body.logsWithFileName;

        // Fetch existing event types in bulk to avoid duplicate entries
        let previousDatas = await EventLog.find({}, 'eventType').lean(); // Fetch only eventType
        let existingEventTypes = new Set(previousDatas.map((data) => {
            // Extract eventType without filename from existing records
            const match = data.eventType.match(/^([^\[]+)\s\[(.*?)\]\s(.*?):\s(.*?)\sat\s(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})/);
            return match ? `${match[1].trim()} [${match[2].trim()}] ${match[3].trim()}: ${match[4].trim()} at ${match[5].trim()}` : data.eventType;
        }));

        // Prepare a regex to extract the eventType without filename from logsWithFileName
        const regex = /^([^\[]+)\s\[(.*?)\]\s(.*?):\s(.*?)\sat\s(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})\s(.*)$/;

        // Filter out events that are already logged based on eventType without filename
        let filteredEvents = logsWithFileName.filter((event) => {
            const match = event.match(regex);
            if (match) {
                // Construct eventType without filename
                const eventTypeWithoutFilename = `${match[1].trim()} [${match[2].trim()}] ${match[3].trim()}: ${match[4].trim()} at ${match[5].trim()}`;
                // Check if the eventType (without filename) is already in the existingEventTypes set
                return !existingEventTypes.has(eventTypeWithoutFilename);
            }
            return false;
        });

        // Collect all usernames to query the User collection in one go
        const usernamesSet = new Set();
        filteredEvents.forEach(event => {
            const match = event.match(regex);
            if (match) {
                usernamesSet.add(match[3].trim());
            }
        });


        const workstationSet = new Set();
        filteredEvents.forEach(event => {
            const match = event.match(regex);
            if (match) {
                workstationSet.add(match[1].trim());
            }
        });
        const workstations = Array.from(workstationSet);

        // Convert the `workstations` array into a regex pattern to match prefixes
        const workstationRegex = workstations.map(ws => new RegExp(`^${ws}`, 'i')); // Case-insensitive prefix match

        // Find all users in one query
        const usernames = Array.from(usernamesSet);
        let users = await User.find({
            $or: [
                { username: { $in: usernames } }, // Match by username
                {
                    workstation: {
                        $elemMatch: { $in: workstationRegex } // Check if any array element matches a regex
                    }
                }
            ]
        }, 'username company branch unit team department companyname empcode workstation').lean();


        let usersMap = {};
        users.forEach(user => {
            usersMap[user.username] = user;
        });
        // Prepare bulk insert for events
        const newEventDocs = [];

        let uniqueEvents = Array.from(new Set(filteredEvents));
        uniqueEvents.forEach(event => {
            const match = event.match(regex);
            if (!match) {
                console.error(`Failed to parse event: ${event}`);
                return;
            }

            const systemName = match[1].trim();
            const id = match[2].trim();
            const username = match[3].trim();
            const category = match[4].trim();
            const dateAndTime = match[5];
            const dateAndTimeNew = match[5]?.split(" ");
            const time = dateAndTimeNew[1];
            const [mm, dd, yy] = dateAndTimeNew[0]?.split('/');
            const filename = match[6].trim();

            // Construct the eventType without the file path (ignoring match[6])
            const eventType = `${systemName} [${id}] ${username}: ${category} at ${dateAndTime}`;

            // Get user data from the usersMap
            let foundData = usersMap[username] || {};

            let matchedWorkstation = "";

            // Attempt to match workstation if username not found
            if (!foundData.username) {
                for (const user of Object.values(usersMap)) {
                    // Extract prefix from each workstation in user.workstation
                    const extractedWorkstations = user.workstation.map(ws => {
                        const match = ws.match(/^[A-Z]-[A-Z0-9]+/); // Match pattern like "G-HRA", "G-D8", etc.
                        return match ? match[0] : null; // Return the prefix if matched
                    }).filter(Boolean); // Remove null values
            
                    // Check if any extracted workstation matches the workstations array
                    const matched = extractedWorkstations.find(ws => workstations.includes(ws));
                    if (matched) {
                        matchedWorkstation = matched; // Save the matched workstation
                        foundData = user; // Update foundData to the matched user
                        break;
                    }
                }
            }
            



            newEventDocs.push({
                eventType: eventType,  // Save the constructed eventType without the file path
                category: category,
                timestamp: dateAndTime,
                systemid: id,
                username: username,
                system: systemName,
                company: foundData.company || "",
                branch: foundData.branch || "",
                team: foundData.team || "",
                unit: foundData.unit || "",
                employeename: foundData.companyname || "",
                empcode: foundData.empcode || "",
                department: foundData.department || "",
                status: foundData.username ? "Matched" : "Mismatched",
                time: time,
                date: `${yy}-${mm}-${dd}`,
                filename: filename  // Store the file path separately
            });
        });

        // Bulk insert new events
        if (newEventDocs.length > 0) {
            await EventLog.insertMany(newEventDocs);
        }

        res.send('Success');
    }
    catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});

exports.getAllEventStorage = catchAsyncErrors(async (req, res, next) => {
    let eventstorage;

    try {
        eventstorage = await EventLog.aggregate([
            {
                $group: {
                    _id: null,
                    usernames: { $addToSet: "$username" },
                    systems: { $addToSet: "$system" }
                }
            },
            {
                $project: {
                    _id: 0,
                    usernames: {
                        $filter: {
                            input: "$usernames",
                            as: "username",
                            cond: { $ne: ["$$username", ""] } // Exclude empty strings
                        }
                    },
                    systems: {
                        $filter: {
                            input: "$systems",
                            as: "system",
                            cond: { $ne: ["$$system", ""] } // Exclude empty strings
                        }
                    }
                }
            }
        ]);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!eventstorage) {
        return next(new ErrorHandler("Events not found", 400));
    }

    return res.status(200).json({ eventstorage });
});


exports.dynamicQueryEventController = async (req, res) => {
    try {
        const { aggregationPipeline } = req.body;

        // console.dir(aggregationPipeline, { depth: null, colors: true });
        const users = await EventLog.aggregate(aggregationPipeline);
        return res.status(200).json({
            users,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// update user by id => /api/user/:id
exports.updateOtherCredentials = catchAsyncErrors(async (req, res, next) => {
    try {
        const { branch, company, employeename, department, empcode, team, unit, username } = req.body

        // Prepare the update fields, excluding `username` if you don't want to update that field
        const updateFields = { branch, company, employeename, department, empcode, team, unit };

        // Update multiple users matching the `username`
        const updateResult = await EventLog.updateMany({ username: username }, { $set: updateFields });

        // Return the relevant fields in the response
        return res.status(200).json({
            message: `${updateResult.modifiedCount} users updated successfully!`,
            updateResult
        });
    } catch (err) {

        return next(new ErrorHandler("An error occurred", 500));
    }
});








