const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const axios = require("axios");
const { ObjectId } = require("mongodb");

exports.getMikrotikPPPL2tpServer = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password } = req.body;
        const auth = Buffer.from(`${username}:${password}`).toString("base64");

        // Fetch profiles from MikroTik
        const response = await axios.get(
            `${url}/rest/interface/l2tp-server/server`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        let l2tpserver = response.data;

        // Return the enriched profiles
        return res.status(200).json({
            l2tpserver
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
            return next(new ErrorHandler("Error Fetching Data!", 500));
        }
    }
});


//function to update mikrotik l2tp server
async function updateMikroTikL2tpServers(bodycontent) {
    try {

        const { adminusername, adminpassword, url } = bodycontent;
        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${adminusername}:${adminpassword}`
        ).toString("base64");

        // Prepare the data for the PUT request
        const data = bodycontent?.l2tpserverdetails;
        const response = await axios.patch(
            `${url}/rest/interface/l2tp-server/server`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        // Return the response data
        return {
            message: "MikroTik l2tp server updated successfully",
            data: response?.data,
            success: true,
        };
    } catch (error) {
        // Handle error and return relevant information
        if (error.response) {
            throw new Error(error.response.data.message || "An error occurred");
        } else if (error.request) {
            throw new Error("No response received from server");
        } else {
            throw new Error("Error updating MikroTik L2TP Server");
        }
    }
}
//function to update mikrotik l2tp server
async function createMikroTikL2tpServer(bodycontent) {
    try {

        const { adminusername, adminpassword, url } = bodycontent;
        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${adminusername}:${adminpassword}`
        ).toString("base64");

        // Prepare the data for the PUT request
        const data = bodycontent?.l2tpserverdetails;
        // Perform the PUT request to update the user with the specified id
        const response = await axios.put(
            `${url}/rest/interface/l2tp-server/server`, // API endpoint with the user's .id
            data, // Data to be sent in the PUT request
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        // Return the response data
        return {
            message: "MikroTik L2tp server created successfully",
            data: response?.data,
            success: true,
        };
    } catch (error) {
        // Handle error and return relevant information
        if (error.response) {
            throw new Error(error.response.data.message || "An error occurred");
        } else if (error.request) {
            throw new Error("No response received from server");
        } else {
            throw new Error("Error updating MikroTik L2TP Server");
        }
    }
}



exports.updateMikroTikL2tpServer = catchAsyncErrors(async (req, res, next) => {

    try {
        let response;
        if (req.body.create) {
            response = await createMikroTikL2tpServer(req.body);
        } else {
            response = await updateMikroTikL2tpServers(req.body);
        }


        return res.status(200).json({ message: "Updated successfully", l2tpserver: response?.data });
    } catch (err) {
        return next(
            new ErrorHandler(
                `Failed to Update MikroTik L2TP Server`,
                500
            )
        );
    }
});



//function to get PPP PPTP Server Details
exports.getMikrotikPppPPTPServer = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password } = req.body;
        const auth = Buffer.from(`${username}:${password}`).toString("base64");

        // Fetch profiles from MikroTik
        const response = await axios.get(
            `${url}/rest/interface/pptp-server/server`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        let pptpserver = response.data;

        // Return the enriched profiles
        return res.status(200).json({
            pptpserver
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
            return next(new ErrorHandler("Error Fetching Data!", 500));
        }
    }
});



//function to get PPP PPTP Active Connection Details
exports.getMikrotikPppActiveConnections = catchAsyncErrors(async (req, res, next) => {
    try {
        const { logindetails } = req.body; // Array of objects containing url, username, password, name
        let allPppConnections = []; // This will hold the concatenated result

        // Loop through each login detail and fetch PPP active connections
        for (let details of logindetails) {
            const { url, username, password, name } = details;

            // Authorization header with base64 encoding
            const auth = Buffer.from(`${username}:${password}`).toString("base64");

            try {
                // Fetch PPP active connections from MikroTik for the current URL
                const response = await axios.get(
                    `${url}/rest/ppp/active`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Basic ${auth}`,
                        },
                    }
                );

                let pppConnections = response.data;

                // Add the name of the current router to each PPP active connection entry
                pppConnections = pppConnections.map(connection => ({
                    ...connection,
                    source: name,
                    mikrotikurl: url,
                    adminusername: username,
                    adminpassword: password,
                    _id: new ObjectId(),
                }));

                // Concatenate the result to the overall array
                allPppConnections = allPppConnections.concat(pppConnections);

            } catch (error) {
                return next(new ErrorHandler('Data not found!', 500));
                // You can decide to continue fetching from other URLs even if one fails
            }
        }

        // Return the combined PPP active connections
        return res.status(200).json({
            activeconnections: allPppConnections
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
            return next(new ErrorHandler("Error Fetching Data!", 500));
        }
    }
});


//remove mikrotik ppp active connection
exports.removePppActiveConnection = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password, connectionId } = req.body;
        const auth = Buffer.from(`${username}:${password}`).toString("base64");

        // Fetch all active PPP connections to verify the connectionId exists
        const response = await axios.get(
            `${url}/rest/ppp/active`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        const activeConnections = response.data;

        // Check if the connectionId exists
        const connection = activeConnections.find(conn => conn[".id"] === connectionId);

        if (!connection) {
            return next(new ErrorHandler("Connection not found", 404));
        }

        // Remove the PPP active connection
        await axios.delete(
            `${url}/rest/ppp/active/${connectionId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        return res.status(200).json({
            message: `PPP Active connection with ID: ${connectionId} has been removed`,
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
            return next(new ErrorHandler("Error removing PPP active connection", 500));
        }
    }
});