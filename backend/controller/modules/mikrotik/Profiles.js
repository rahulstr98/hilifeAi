const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const axios = require("axios");
const MikrotikPppProfiles = require("../../../model/modules/mikrotik/MikrotikPppProfiles");

exports.getMikrotikProfiles = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password } = req.body;
        const auth = Buffer.from(`${username}:${password}`).toString("base64");

        // Fetch profiles from MikroTik
        const response = await axios.get(
            `${url}/rest/ppp/profile`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );


        // Fetch all MikrotikPppProfiles from the database
        let localMikrotikProfiles = await MikrotikPppProfiles.find();

        // Map the fetched MikroTik profiles with local database profiles
        const enrichedProfiles = response.data.map((profile) => {
            // Find the matching profile by .id in the local database
            const matchedProfile = localMikrotikProfiles.find(
                (localProfile) => localProfile.mikrotikid === profile[".id"]
            );

            // If a matching profile is found, add 'addedby' and 'updatedby' arrays, otherwise default to empty arrays
            return {
                ...profile,
                addedby: matchedProfile ? matchedProfile.addedby : [],
                updatedby: matchedProfile ? matchedProfile.updatedby : [],
                createdAt: matchedProfile ? matchedProfile.createdAt : ""
            };
        });

        // Return the enriched profiles
        return res.status(200).json({
            profiles: enrichedProfiles
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


//to get mikrotik IP Pool
exports.getMikroTikIpPool = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password } = req.body;
        const auth = Buffer.from(
            `${username}:${password}`
        ).toString("base64");
        const response = await axios.get(
            `${url}/rest/ip/pool`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return res.status(200).json({
            ippool: response.data,
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

//function to create mikrotik profile
async function createMikroTikProfile(
    name, localaddress, remoteaddress, dnsserver, bridgelearning, adminusername, adminpassword, URL
) {
    try {


        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${adminusername}:${adminpassword}`
        ).toString("base64");

        // Prepare the data for the PUT request
        const data = {
            name: name,
            "local-address": localaddress,
            "remote-address": remoteaddress,
            "dns-server": dnsserver,
            "bridge-learning": bridgelearning,
        };

        // Perform the PUT request
        const response = await axios.put(
            `${URL}/rest/ppp/profile`, // API endpoint
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
            message: "MikroTik Profiles created successfully",
            data: response.data,
            success: true,
        };
    } catch (error) {
        // Return error information
        if (error.response) {
            throw new Error(error.response.data.message || "An error occurred");
        } else if (error.request) {
            throw new Error("No response received from server");
        } else {
            throw new Error("Error updating MikroTik user");
        }
    }
}

exports.addMikrotikProfiles = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, localaddress, remoteaddress, dnsserver, bridgelearning, adminusername, adminpassword, url } =
            req.body;

        // Call createMikroTikUser and capture the response
        const mikroTikResponse = await createMikroTikProfile(
            name, localaddress, remoteaddress, dnsserver, bridgelearning, adminusername, adminpassword, url
        );

        // If MikroTik user creation was successful and contains .id, save data in AddPassword
        if (
            mikroTikResponse &&
            mikroTikResponse.data &&
            mikroTikResponse.data[".id"]
        ) {
            await MikrotikPppProfiles.create({
                ...req.body,
                mikrotikid: mikroTikResponse.data[".id"], // Store the MikroTik .id in AddPassword
            });

            // Return success response
            return res.status(200).json({
                message: "Successfully Added and MikroTik Profile!",
            });
        } else {
            return next(new ErrorHandler("Failed to create MikroTik Profiles!", 404));
        }

    } catch (err) {
        return next(new ErrorHandler("Something Went Wrong!", 404));
    }

});


// Function to delete a MikroTik Profile by mikrotikid
async function deleteMikroTikProfiles(mikrotikId, URL, username, password) {
    try {
        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${username}:${password}`
        ).toString("base64");

        // Perform the DELETE request to remove the MikroTik user by .id
        const response = await axios.delete(
            `${URL}/rest/ppp/profile/${mikrotikId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        if (response.status === 204) {
            return {
                message: "MikroTik Profile deleted successfully",
                success: true,
            };
        } else {
            throw new Error("Failed to delete MikroTik Profile");
        }
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "An error occurred");
        } else if (error.request) {
            throw new Error("No response received from server");
        } else {
            throw new Error("Error deleting MikroTik user");
        }
    }
}


exports.deleteMikroTikProfile = catchAsyncErrors(async (req, res, next) => {

    const { url, username, password, id } = req.body;


    try {
        // Call the function to delete the MikroTik user using mikrotikId
        let response = await deleteMikroTikProfiles(id, url, username, password);
        if (response?.success) {
            await MikrotikPppProfiles.deleteOne({ mikrotikid: id });
        }
        return res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        return next(
            new ErrorHandler(
                `Failed to Delete user from MikroTik: ${err.message}`,
                500
            )
        );
    }
});



//function to update mikrotik profiles
async function updateMikroTikProfile(
    id, name, localaddress, remoteaddress, dnsserver, bridgelearning, adminusername, adminpassword, URL
) {
    try {


        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${adminusername}:${adminpassword}`
        ).toString("base64");

        // Prepare the data for the PUT request
        const data = {
            name: name,
            "local-address": localaddress,
            "remote-address": remoteaddress,
            "dns-server": dnsserver,
            "bridge-learning": bridgelearning,
        };

        // Perform the PUT request to update the user with the specified id
        const response = await axios.patch(
            `${URL}/rest/ppp/profile/${id}`, // API endpoint with the user's .id
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
            message: "MikroTik user updated successfully",
            data: response.data,
            success: true,
        };
    } catch (error) {
        // Handle error and return relevant information
        if (error.response) {
            throw new Error(error.response.data.message || "An error occurred");
        } else if (error.request) {
            throw new Error("No response received from server");
        } else {
            throw new Error("Error updating MikroTik user");
        }
    }
}



exports.updateMikroTikProfiles = catchAsyncErrors(async (req, res, next) => {


    const { id, name, localaddress, remoteaddress, dnsserver, bridgelearning, adminusername, adminpassword, url } =
        req.body;
    try {
        // Call the function to update the MikroTik user using mikrotikId
        let response = await updateMikroTikProfile(id, name, localaddress, remoteaddress, dnsserver, bridgelearning, adminusername, adminpassword, url);
        if (response.success && response.data) {
            let findAlreadyExist = await MikrotikPppProfiles?.findOne({ mikrotikid: response.data[".id"] })
            if (findAlreadyExist) {
                await MikrotikPppProfiles.findByIdAndUpdate(findAlreadyExist?._id, req.body);
            } else {
                await MikrotikPppProfiles.create({
                    ...req.body,
                    mikrotikid: response.data[".id"],
                });
            }
        }
        return res.status(200).json({ message: "Updated successfully" });
    } catch (err) {
        return next(
            new ErrorHandler(
                `Failed to Update MikroTik Profiles`,
                500
            )
        );
    }
});


//to get mikrotik IP Pool Used Addresses
exports.getMikroTikIpPoolUsedAddresses = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password } = req.body;
        const auth = Buffer.from(
            `${username}:${password}`
        ).toString("base64");
        const response = await axios.get(
            `${url}/rest/ip/pool/used`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return res.status(200).json({
            ippoolusedaddresses: response.data,
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