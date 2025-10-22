const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const axios = require("axios");
const MikrotikPppSecrets = require("../../../model/modules/mikrotik/MikrotikPppSecrets");
const MikrotikMaster = require("../../../model/modules/mikrotik/MikrotikMaster");
const User = require("../../../model/login/auth");

const { getSingleUserData } = require("../rocketchat/rocketChatUsers");
const { getSingleMailedUser } = require("../../login/postfixmailuser");

// Convert string to ObjectId if needed


exports.getMikrotikSecrets = catchAsyncErrors(async (req, res, next) => {
    try {
        let unmatchedNames = [], matchedNames = [];
        const { url, username, password , filterFinal} = req.body;
        const auth = Buffer.from(`${username}:${password}`).toString("base64");
        const users = await User.find(
            {
                enquirystatus: {
                    $nin: ["Enquiry Purpose"],
                },
                resonablestatus: {
                    $nin: ["Not Joined", "Postponed", "Rejected", "Closed", "Releave Employee", "Absconded", "Hold", "Terminate"],
                },
            },
            {
                username: 1,
                company: 1,
                branch: 1,
                unit: 1,
            }
        );;
        const userNames = users.map(user => user.username);
        // Fetch profiles from MikroTik
        const response = await axios.get(
            `${url}/rest/ppp/secret`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

      console.log(filterFinal, 'filterFinal')
        // Fetch all MikrotikPppSecrets from the database
        let localMikrotikSecrets = await MikrotikPppSecrets.find();

        // Map the fetched MikroTik profiles with local database profiles
        const enrichedProfiles = response.data?.map((secrets) => {
            // Find the matching secrets by .id in the local database
            const matchedProfile = localMikrotikSecrets.find(
                (localProfile) => localProfile.mikrotikid === secrets[".id"] && filterFinal?.name === localProfile?.mikrotikname
            );

            return {
                ...secrets,
                team: matchedProfile?.team?.length > 0 ? matchedProfile?.team : [],
                employeename: matchedProfile ? matchedProfile.employeename : "",
                autogenerate: matchedProfile ? matchedProfile.autogenerate : false,
                addedby: matchedProfile ? matchedProfile.addedby : [],
                updatedby: matchedProfile ? matchedProfile.updatedby : [],
                createdAt: matchedProfile ? matchedProfile.createdAt : "",
                mikrotikname: matchedProfile ? matchedProfile.mikrotikname : "",
                company: matchedProfile ? matchedProfile.company : "",
                branch: matchedProfile ? matchedProfile.branch : "",
                unit: matchedProfile ? matchedProfile.unit : "",
                temppassword: matchedProfile ? matchedProfile.temppassword : "",
                _id: matchedProfile ? matchedProfile._id : "",
            };
        });

        unmatchedNames = enrichedProfiles.filter(
            ans => !userNames.includes(ans.name)
            // (users?.some(data => data?.username === ans.name
            //     && data?.company === overalldata?.company
            //     && data?.branch === overalldata?.branch
            //     && data?.unit === overalldata?.unit)
            // )
        );
        matchedNames = enrichedProfiles.filter(
            ans => userNames.includes(ans.name)
            // users?.some(data => data?.username === ans.name
            // && data?.company === overalldata?.company
            // && data?.branch === overalldata?.branch
            // && data?.unit === overalldata?.unit
            // )
            //  && 
        );

        // Return the enriched profiles
        return res.status(200).json({
            secrets: enrichedProfiles,
            unmatchedNames,
            matchedNames
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


//function to create mikrotik secret
async function createMikroTikSecret(
    name, password, service, profile, localaddress, remoteaddress, adminusername, adminpassword, URL
) {
    try {

        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${adminusername}:${adminpassword}`
        ).toString("base64");

        // Prepare the data for the PUT request
        const data = {
            name: name,
            password: password,
            profile: profile,
            "local-address": localaddress,
            "remote-address": remoteaddress,
            service: service,
        };

        // Perform the PUT request
        const response = await axios.put(
            `${URL}/rest/ppp/secret`, // API endpoint
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
            message: "MikroTik user created successfully",
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

exports.addMikrotikSecrets = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, password, service, profile, localaddress, remoteaddress, adminusername, adminpassword, url } =
            req.body;

        // Call createMikroTikUser and capture the response
        const mikroTikResponse = await createMikroTikSecret(
            name, password, service, profile, localaddress, remoteaddress, adminusername, adminpassword, url
        );

        // If MikroTik user creation was successful and contains .id, save data in AddPassword
        if (
            mikroTikResponse &&
            mikroTikResponse.data &&
            mikroTikResponse.data[".id"]
        ) {
            await MikrotikPppSecrets.create({
                ...req.body,
                mikrotikid: mikroTikResponse.data[".id"], // Store the MikroTik .id in AddPassword
            });

            // Return success response
            return res.status(200).json({
                message: "Successfully Added and MikroTik Secret!",
            });
        } else {
            return next(new ErrorHandler("Failed to create MikroTik Secret!", 404));
        }

    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }

});


// Function to delete a MikroTik Secred by mikrotikid
async function deleteMikroTikSecrets(mikrotikId, URL, username, password) {
    try {
        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${username}:${password}`
        ).toString("base64");

        // Perform the DELETE request to remove the MikroTik user by .id
        const response = await axios.delete(
            `${URL}/rest/ppp/secret/${mikrotikId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        if (response.status === 204) {
            return {
                message: "MikroTik user deleted successfully",
                success: true,
            };
        } else {
            throw new Error("Failed to delete MikroTik user");
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


exports.deleteMikroTikSecret = catchAsyncErrors(async (req, res, next) => {

    const { url, username, password, id } = req.body;

    try {
        // Call the function to delete the MikroTik user using mikrotikId
        let response = await deleteMikroTikSecrets(id, url, username, password);
        if (response?.success) {
            await MikrotikPppSecrets.deleteOne({ mikrotikid: id });
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



//function to update mikrotik secret
async function updateMikroTikSecrets(
    id, name, password, service, profile, localaddress, remoteaddress, adminusername, adminpassword, URL
) {
    try {
        // Encode MikroTik credentials for Basic Auth
        const auth = Buffer.from(
            `${adminusername}:${adminpassword}`
        ).toString("base64");

        // Prepare the data for the PUT request
        const data = {
            name: name,
            password: password,
            profile: profile,
            "local-address": localaddress,
            "remote-address": remoteaddress,
            service: service,
        };
        // Perform the PUT request to update the user with the specified id
        const response = await axios.patch(
            `${URL}/rest/ppp/secret/${id}`, // API endpoint with the user's .id
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
        console.log(error, 'error 100')
        // Handle error and return relevant information
        if (error.response.data.detail) {

            throw new Error(error.response.data.detail);
        }
        else if (error.response) {
            throw new Error(error.response.data.message || "An error occurred");
        }
        else if (error.request) {
            throw new Error("No response received from server");
        } else {
            throw new Error("Error updating MikroTik user");
        }
    }
}

exports.updateMikroTikSecret = catchAsyncErrors(async (req, res, next) => {


    const { id, name, password, mikrotikname, service, profile, localaddress, remoteaddress, adminusername, adminpassword, url } =
        req.body;
    try {
        // Call the function to update the MikroTik user using mikrotikId
        let response = await updateMikroTikSecrets(id, name, password, service, profile, localaddress, remoteaddress, adminusername, adminpassword, url);
        if (response.success && response.data) {
            let findAlreadyExist = await MikrotikPppSecrets?.findOne({ mikrotikid: response.data[".id"], mikrotikname: mikrotikname })

            if (findAlreadyExist) {
                await MikrotikPppSecrets.findByIdAndUpdate(findAlreadyExist?._id, req.body);
            } else {
                let data = req?.body;
                delete data?.id;
                await MikrotikPppSecrets.create({
                    ...data,
                    mikrotikid: response.data[".id"],
                });
            }
        }
        return res.status(200).json({ message: "Updated successfully" });
    } catch (err) {
        //console.log(err , 'error 40')
        if (err.message === "failure: secret with the same name already exists") {
            return next(
                new ErrorHandler(
                    `Secret with the Same Name Already Exists`,
                    500
                )
            );
        } else {
            return next(
                new ErrorHandler(
                    `Failed to Update MikroTik Secret`,
                    500
                )
            );
        }

    }
});

exports.getUserVpnDetails = catchAsyncErrors(async (req, res, next) => {
    let secret, mikrotik, user = {};
    try {
        secret = await MikrotikPppSecrets.findOne({ employeename: req.body.employeename })
        if (secret) {
            let query = {
                company: secret.company,
                branch: secret.branch,
                unit: secret.unit,
                name: secret.mikrotikname
            }
            mikrotik = await MikrotikMaster.findOne(query)
        }
        if (mikrotik) {
            user = {
                id: secret.mikrotikid,
                company: mikrotik.company,
                branch: mikrotik.branch,
                unit: mikrotik.unit,
                username: mikrotik.username,
                password: mikrotik.password,
                url: mikrotik.url,
                name: mikrotik.name
            }
        }
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        user
    });
})



exports.getUserIndividualPassword = catchAsyncErrors(async (req, res, next) => {
    let password,rocketchatuser,postfixuser, user;
    try {
        password = await MikrotikPppSecrets.find({ employeename: req.body.employeename });
        user = await User.findOne({ companyname: req.body.employeename }, { rocketchatid: 1 }).lean();
        postfixuser = await getSingleMailedUser(req.body.employeename);
        
        if (user) {
            rocketchatuser = await getSingleUserData(user?.rocketchatid);
            // console.log(user ,user.rocketchatid, rocketchatuser, 'rocketchatuser');
        }
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        password , rocketchatuser, postfixuser
    });
});


exports.getAllMikrotikMasterDatas = catchAsyncErrors(async (req, res, next) => {
    let secrets;
    let { accessbranch } = req.body;
    try {
        const query = {
            $or: accessbranch?.map(item => ({
                company: item.company,
                branch: item.branch,
                unit: item.unit,
            }))
        };
        secrets = await MikrotikPppSecrets.find(query).lean();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        secrets
    });
});


exports.getAllMikrotikMasterDatasFilter = catchAsyncErrors(async (req, res, next) => {
    let secrets;
    let { company, branch, unit, name } = req.body;
    try {

        let query = {};
        const generateQuery = (company, branch, unit, name) => {
            if (company?.length > 0) {
                query.company = { $in: company }
            }
            if (branch?.length > 0) {
                query.branch = { $in: branch }
            }
            if (unit?.length > 0) {
                query.unit = { $in: unit }
            }
            if (name?.length > 0) {
                query.mikrotikname = { $in: name }
            }
        }
        const queryGen = generateQuery(company, branch, unit, name);
        secrets = await MikrotikPppSecrets.find(query).lean();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
        secrets
    });
})