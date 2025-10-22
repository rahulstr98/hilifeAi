const axios = require("axios");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const rocketChatLogin = require('./rocketChatLogin');

exports.getRocketChatChannelNames = catchAsyncErrors(async (req, res, next) => {
    try {

        try {

            // Step 1: Login to Rocket.Chat to get authToken and userId
            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

            // Step 2: Use the authToken and userId to get channel names
            // Step 2: Use the authToken and userId to get public channel names
            const publicChannelsResponse = await axios.get(
                `${rocketchatdomainurl}/api/v1/channels.list`,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Step 3: Use the authToken and userId to get private channel (group) names
            const privateChannelsResponse = await axios.get(
                `${rocketchatdomainurl}/api/v1/groups.list?count=5000`,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );
            // const allRoomms = await axios.get(
            //     `${rocketchatdomainurl}//api/v1/rooms.get`,
            //     {
            //         headers: {
            //             "X-Auth-Token": authToken,
            //             "X-User-Id": userId,
            //             "Content-Type": "application/json",
            //         },
            //     }
            // );


            const teamResponse = await axios.get(
                `${rocketchatdomainurl}/api/v1/teams.listAll`,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );

            const teamNamesMap = teamResponse.data.teams.reduce((acc, team) => {
                acc[team._id] = team.name; // Assuming team response has _id and name
                return acc;
            }, {});
            let all = [
                ...privateChannelsResponse?.data?.groups,
                ...publicChannelsResponse?.data?.channels
            ]

            let public = publicChannelsResponse?.data?.channels?.filter(item => !item?.teamMain)?.map(data => ({
                _id: data?._id,
                ts: data?.ts,
                t: data?.t,
                u: data?.u,
                name: data?.name,
                usernames: data?.usernames,
                msgs: data?.msgs,
                userscount: data?.usersCount,
                _updatedAt: data?._updatedAt,
                teamId: "",
                teamName: teamNamesMap[data?.teamId] || "",
                type: "public"
            }));
            let private = privateChannelsResponse?.data?.groups?.filter(item => !item?.teamMain)?.map(data => ({
                _id: data?._id,
                ts: data?.ts,
                t: data?.t,
                u: data?.u,
                name: data?.name,
                usernames: data?.usernames,
                msgs: data?.msgs,
                userscount: data?.usersCount,
                _updatedAt: data?._updatedAt,
                teamId: data?.teamId,
                teamName: teamNamesMap[data?.teamId] || "",
                type: "private"
            }));

            // Combine both public and private channels
            const allChannels = [
                ...public || [],
                ...private || []
            ];
            return res.status(200).json({
                // allRoommsComut: allRoomms?.data?.update?.length,
                // allRoomms: allRoomms?.data?.update,
                all,
                rocketchatChannels: allChannels,
                publicChannels: public,
                privateChannels: private,
            });
        } catch (error) {
            if (error.response) {
                return next(
                    new ErrorHandler(
                        error.response.data.error || "An error occurred",
                        error.response.status || 500
                    )
                );
            } else if (error.request) {
                return next(
                    new ErrorHandler("No response received from server", 500)
                );
            } else {
                return next(new ErrorHandler("Error Fetching Channel!", 500));
            }
        }
    } catch (error) {
        if (error.response) {
            return next(
                new ErrorHandler(
                    error.response.data.message || "An error occurred",
                    error.response.status
                )
            );
        } else {
            return next(new ErrorHandler("Error Fetching Channel!", 500));
        }
    }
});
exports.createRocketChatChannel = catchAsyncErrors(async (req, res, next) => {
    try {

        try {
            const { name, type, teamid } = req.body;

            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();
            let endpoint;
            let payload;

            if (type === 'Public') {
                // Endpoint and payload for public channel creation
                endpoint = `${rocketchatdomainurl}/api/v1/channels.create`;
                payload = {
                    name,
                    // readOnly: !!readOnly, // Convert to boolean
                    // excludeSelf: !!excludeSelf,
                    // customFields: customFields || {},
                    extraData: {
                        // broadcast: true,
                        // encrypted: false,
                        teamId: teamid
                    }
                };
            } else if (type === 'Private') {
                // Endpoint and payload for private group creation
                endpoint = `${rocketchatdomainurl}/api/v1/groups.create`;
                payload = {
                    name,
                    // members: members || [],
                    // readOnly: !!readOnly,
                    // customFields: customFields || {}
                    extraData: {
                        // broadcast: true,
                        // encrypted: false,
                        teamId: teamid
                    }
                };
            } else {
                return next(new ErrorHandler("Invalid type provided. Use 'public' or 'private'", 400));
            }
            const createResponse = await axios.post(endpoint, payload, {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            });

            return res.status(200).json({
                message: "Channel created successfully",
                team: createResponse.data, // Return the created team information
            });
        } catch (error) {
            if (error.response) {
                return next(
                    new ErrorHandler(
                        error.response.data.error || "An error occurred",
                        error.response.status || 500
                    )
                );
            } else if (error.request) {
                return next(
                    new ErrorHandler("No response received from server", 500)
                );
            } else {
                return next(new ErrorHandler("Error Creating Channel!", 500));
            }
        }
    } catch (error) {
        console.log(error, "2")
        if (error.response) {
            return next(
                new ErrorHandler(
                    error.response.data.message || "An error occurred",
                    error.response.status
                )
            );
        } else {
            return next(new ErrorHandler("Error Creating Channel!", 500));
        }
    }
});
exports.updateRocketChatChannel = catchAsyncErrors(async (req, res, next) => {
    try {


        try {
            const { name, type, id } = req.body;

            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();
            let endpoint;
            let payload = {
                name,
                roomId: id
            };

            if (type === 'public') {
                // Endpoint and payload for public channel creation
                endpoint = `${rocketchatdomainurl}/api/v1/channels.rename`;

            } else if (type === 'private') {
                // Endpoint and payload for private group creation
                endpoint = `${rocketchatdomainurl}/api/v1/groups.rename`;

            } else {
                return next(new ErrorHandler("Invalid type provided. Use 'public' or 'private'", 400));
            }
            const createResponse = await axios.post(endpoint, payload, {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            });

            return res.status(200).json({
                message: "Channel Updated successfully",
                team: createResponse.data, // Return the created team information
            });
        } catch (error) {
            if (error.response) {
                return next(
                    new ErrorHandler(
                        error.response.data.error || "An error occurred",
                        error.response.status || 500
                    )
                );
            } else if (error.request) {
                return next(
                    new ErrorHandler("No response received from server", 500)
                );
            } else {
                return next(new ErrorHandler("Error Updating Channel!", 500));
            }
        }
    } catch (error) {
        if (error.response) {
            return next(
                new ErrorHandler(
                    error.response.data.message || "An error occurred",
                    error.response.status
                )
            );
        } else {
            return next(new ErrorHandler("Error Updating Channel!", 500));
        }
    }
});
exports.deleteRocketChatChannel = catchAsyncErrors(async (req, res, next) => {
    try {

        try {
            const { channelid, type } = req.query;
            // Step 1: Login to Rocket.Chat to get authToken and userId
            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();
            let deleteResponse;
            const deletePayload = {
                roomId: channelid, // The ID of the team to update
            };
            if (type === "public") {
                deleteResponse = await axios.post(
                    `${rocketchatdomainurl}/api/v1/channels.delete`,
                    deletePayload,
                    {
                        headers: {
                            "X-Auth-Token": authToken,
                            "X-User-Id": userId,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } else if (type === "private") {
                deleteResponse = await axios.post(
                    `${rocketchatdomainurl}/api/v1/groups.delete`,
                    deletePayload,
                    {
                        headers: {
                            "X-Auth-Token": authToken,
                            "X-User-Id": userId,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } else {
                return next(
                    new ErrorHandler(
                        "Invalid Channel Type",
                        400
                    )
                );
            }


            return res.status(200).json({
                message: "Channel deleted successfully",
            });
        } catch (error) {
            if (error.response) {
                return next(
                    new ErrorHandler(
                        error.response.data.error || "An error occurred",
                        error.response.status || 500
                    )
                );
            } else if (error.request) {
                return next(
                    new ErrorHandler("No response received from server", 500)
                );
            } else {
                return next(new ErrorHandler("Error deleteing Channel!", 500));
            }
        }
    } catch (error) {
        if (error.response) {
            return next(
                new ErrorHandler(
                    error.response.data.message || "An error occurred",
                    error.response.status
                )
            );
        } else {
            return next(new ErrorHandler("Error deleteing Channel!", 500));
        }
    }
});
