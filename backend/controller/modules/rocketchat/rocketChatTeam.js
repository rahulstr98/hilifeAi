const axios = require("axios");
// const AdminOverAllSettings = require("../../../models/AdminOverAllSettings");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const rocketChatLogin = require('./rocketChatLogin'); // Adjust the path based on your project structure

exports.getRocketChatTeamNames = catchAsyncErrors(async (req, res, next) => {
    try {

        try {

            // Step 1: Login to Rocket.Chat to get authToken and userId
            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

            // Step 2: Use the authToken and userId to get team names
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
            console.log(teamResponse?.data?.teams)
            return res.status(200).json({
                rocketchatTeams: teamResponse?.data?.teams?.filter(item => item?._id !== "6721c2d42622b227202cbcec"),
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
                return next(new ErrorHandler("Error Fetching Teams!", 500));
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
            return next(new ErrorHandler("Error Fetching Teams!", 500));
        }
    }
});
exports.createRocketChatTeam = catchAsyncErrors(async (req, res, next) => {
    try {

        try {
            const { teamname, type, sidepanel } = req.body;
            // Step 1: Login to Rocket.Chat to get authToken and userId
            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();
            // Step 2: Prepare the request to create a new team
            const teamPayload = {
                name: teamname,
                type: Number(type), // 0 for private, 1 for public
                // members: [userId], // An array of member user IDs
                // room: {
                //     readOnly: true, // Optional, set based on your needs
                // },
                sidepanel: {
                    items: sidepanel
                }
            };

            // Step 3: Make the request to create the new team
            const teamResponse = await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.create`,
                teamPayload,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );

            return res.status(200).json({
                message: "Team created successfully",
                team: teamResponse.data.team, // Return the created team information
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
                return next(new ErrorHandler("Error Creating Teams!", 500));
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
            return next(new ErrorHandler("Error Creating Teams!", 500));
        }
    }
});
exports.updateRocketChatTeam = catchAsyncErrors(async (req, res, next) => {
    try {

        try {
            const { teamid, name, type } = req.body;
            // Step 1: Login to Rocket.Chat to get authToken and userId
            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

            // Step 2: Prepare the request to update a  team
            const updatePayload = {
                teamId: teamid, // The ID of the team to update
                data: {
                    name: name, // New team name
                    type: Number(type), // New team type (0 for private, 1 for public)
                },
            };

            // Step 3: Make the request to update the  team
            const updateResponse = await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.update`,
                updatePayload,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );

            return res.status(200).json({
                message: "Team updated successfully",
                team: updateResponse.data.team, // Return the updated team information
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
                return next(new ErrorHandler("Error Updating Teams!", 500));
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
            return next(new ErrorHandler("Error Updating Teams!", 500));
        }
    }
});
exports.deleteRocketChatTeam = catchAsyncErrors(async (req, res, next) => {
    try {

        try {
            const { teamid } = req.query;
            // Step 1: Login to Rocket.Chat to get authToken and userId
            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

            const deletePayload = {
                teamId: teamid, // The ID of the team to update
            };

            const deleteResponse = await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.delete`,
                deletePayload,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );

            return res.status(200).json({
                message: "Team updated successfully",
                team: deleteResponse.data.team, // Return the updated team information
            });
        } catch (error) {
            console.log(error)
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
                return next(new ErrorHandler("Error deleteing Teams!", 500));
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
            return next(new ErrorHandler("Error deleteing Teams!", 500));
        }
    }
});
// exports.deleteRocketChathilifeai = catchAsyncErrors(async (req, res, next) => {
//     try {

//         try {
//             const teamid = "6721c2d42622b227202cbcec";
//             // Step 1: Login to Rocket.Chat to get authToken and userId
//             const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

//             const deletePayload = {
//                 teamId: teamid, // The ID of the team to update
//             };

//             const deleteResponse = await axios.post(
//                 `${rocketchatdomainurl}/api/v1/teams.delete?teamId=6721c2d42622b227202cbcec`,
//                 // deletePayload,
//                 {
//                     headers: {
//                         "X-Auth-Token": authToken,
//                         "X-User-Id": userId,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );
//             console.log(deleteResponse)
//             return res.status(200).json({
//                 message: "Team updated successfully",
//                 team: deleteResponse.data.team, // Return the updated team information
//             });
//         } catch (error) {
//             console.log(error)
//             if (error.response) {
//                 return next(
//                     new ErrorHandler(
//                         error.response.data.error || "An error occurred",
//                         error.response.status || 500
//                     )
//                 );
//             } else if (error.request) {
//                 return next(
//                     new ErrorHandler("No response received from server", 500)
//                 );
//             } else {
//                 return next(new ErrorHandler("Error deleteing Teams!", 500));
//             }
//         }
//     } catch (error) {
//         if (error.response) {
//             return next(
//                 new ErrorHandler(
//                     error.response.data.message || "An error occurred",
//                     error.response.status
//                 )
//             );
//         } else {
//             return next(new ErrorHandler("Error deleteing Teams!", 500));
//         }
//     }
// });
