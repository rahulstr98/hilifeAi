const axios = require("axios");
// const AdminOverAllSettings = require("../../../models/AdminOverAllSettings");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const rocketChatLogin = require('./rocketChatLogin');
const User = require("../../../model/login/auth");
const rocketChatTeamChannelGrouping = require("../../../model/modules/rocketchat/rocketChatTeamChannelGrouping");
const { ObjectId } = require("mongodb");
const pLimit = require('p-limit');
const ChatConfiguration = require('../../../model/modules/settings/ChatConfiguration');
const checkRocketChatHealth = async () => {
    try {

        const rocketchatCredentials = await ChatConfiguration.findOne()
            .sort({ createdAt: -1 })
            .select("domainurl username password");

        const response = await axios.get(`${rocketchatCredentials?.domainurl}/api/v1/info`);
console.log(response.status)
        return response.status === 200;
    } catch (error) {
        console.log(error)
        return false;
    }
};
exports.activeStatusRocketChatUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { roccketchatUserId, activeStatus } = req.body; // userId of the Rocket.Chat user to deactivate
        // Step 1: Log in to Rocket.Chat to get authToken and userId
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();
        const user = await User.findOne({ rocketchatid: roccketchatUserId });
        if (!user) {
            return next(new ErrorHandler("User Not Found!", 500));
        }
        const { rocketchatteamid, rocketchatchannelid } = user;
        if (activeStatus === false) {
            for (const teamId of rocketchatteamid) {
                await axios.post(
                    `${rocketchatdomainurl}/api/v1/teams.removeMember`,
                    { teamId, userId: roccketchatUserId },
                    {
                        headers: {
                            "X-Auth-Token": authToken,
                            "X-User-Id": userId,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            for (const channelId of rocketchatchannelid) {
                await axios.post(
                    `${rocketchatdomainurl}/api/v1/groups.kick`,
                    { roomId: channelId, userId: roccketchatUserId },
                    {
                        headers: {
                            "X-Auth-Token": authToken,
                            "X-User-Id": userId,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }
        }

        // Step 2: Send request to update the user's active status to false
        const updatePayload = {
            userId: roccketchatUserId, // The ID of the user to deactivate
            data: {
                active: activeStatus, // Set active status to false to deactivate
            },
        };

        const deactivateResponse = await axios.post(
            `${rocketchatdomainurl}/api/v1/users.update`,
            updatePayload,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            }
        );
        user.rocketchatteamid = [];
        user.rocketchatchannelid = [];

        console.log(user);
        console.log(activeStatus)
        if (user?.companyname && !activeStatus) {

            await rocketChatTeamChannelGrouping.updateMany(
                {
                    type: { $in: ["Individual", "VPN Type"] }, // Filter by type
                    employeename: user?.companyname,               // Check if the name exists in the array
                },
                {
                    $pull: { employeename: user?.companyname }     // Remove the name from the array
                }
            );

            // Delete documents where employeename array is empty
            await rocketChatTeamChannelGrouping.deleteMany({
                type: { $in: ["Individual", "VPN Type"] }, // Ensure the type is correct
                employeename: { $size: 0 }                 // Check if the array is now empty
            });
        }
        await user.save();

        return res.status(200).json({
            message: `User ${activeStatus ? "activated" : "deactivated"} successfully`,
            user: deactivateResponse.data.user, // Return updated user data
        });
    } catch (error) {
        console.log(error);
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
            return next(new ErrorHandler("Error deactivating user!", 500));
        }
    }
});



exports.updateRocketChatUserDetails = async (rocketChatUserId, name, email, password, username, roles) => {
    console.log(roles)
    console.log(password, "Password")
    try {
        // Step 1: Log in to Rocket.Chat to get authToken and userId
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        // Step 2: Construct payload for updating user details
        const updatePayload = {
            userId: rocketChatUserId,
            data: {
                ...(name && { name }),           // Update name if provided
                ...(email && { email }),         // Update email if provided
                ...(password && { password }),   // Update password if provided
                ...(username && { username }),   // Update username if provided
                ...(roles && { roles }),         // Update roles if provided
            },
        };

        // Step 3: Send the request to update the user's details
        const updateResponse = await axios.post(
            `${rocketchatdomainurl}/api/v1/users.update`,
            updatePayload,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            }
        );

        return {
            message: "User details updated successfully",
            user: updateResponse.data.user, // Return updated user data
        };
    } catch (error) {
        console.error("Error updating user details:", error);
        throw new ErrorHandler(
            error.response?.data?.error || "Failed to update user details",
            error.response?.status || 500
        );
    }
};


//api to delete rocket chat user




//api to list rocketchat users

exports.getRocketChatUsersList = catchAsyncErrors(async (req, res, next) => {
    try {


        const { company = [],
            branch = [],
            unit = [],
            team = [],
            department = [],
            designation = [],
            employeename = [],
            rocketchatteamid = [],
            rocketchatchannelid = [],
            assigncompany = [],
            assignbranch = [],
            assignunit = [], } = req.body;

        // ["Username"]?.includes(type) ? [{
        //     $match: {
        //         $and: [
        //             ...(usernames.length > 0
        //                 ? [
        //                     {
        //                         username: { $in: usernames },
        //                     },
        //                 ]
        //                 : [])

        //         ],
        //     },
        // },] :

        const aggregationPipeline = [
            {
                $match: {
                    $and: [
                        ...(company.length > 0 ? [{ company: { $in: company } }] : [{ company: { $in: assigncompany } }]),
                        ...(branch.length > 0 ? [{ branch: { $in: branch } }] : [{ branch: { $in: assignbranch } }]),
                        ...(unit.length > 0 ? [{ unit: { $in: unit } }] : [{ unit: { $in: assignunit } }]),
                        ...(team.length > 0 ? [{ team: { $in: team } }] : []),
                        ...(department.length > 0 ? [{ department: { $in: department } }] : []),
                        ...(designation.length > 0 ? [{ designation: { $in: designation } }] : []),
                        ...(employeename.length > 0 ? [{ companyname: { $in: employeename } }] : []),
                        ...(rocketchatteamid.length > 0 ? [{ rocketchatteamid: { $in: rocketchatteamid } }] : []),
                        ...(rocketchatchannelid.length > 0 ? [{ rocketchatchannelid: { $in: rocketchatchannelid } }] : []),
                        { rocketchatid: { $type: "string", $exists: true } }, // rocketchatid must be defined and a string
                    ],
                },
            },
            {
                $project: {
                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    designation: 1,
                    empcode: 1,
                    username: 1,
                    companyname: 1,
                    workmode: 1,
                    rocketchatid: 1,
                    rocketchatemail: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                },
            },
        ];
        const users = await User.aggregate(aggregationPipeline)
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        const [teamResponse, privateChannelsResponse] = await Promise.all([
            axios.get(`${rocketchatdomainurl}/api/v1/teams.listAll`, {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            }),
            axios.get(`${rocketchatdomainurl}/api/v1/groups.list`, {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            }),
        ]);


        const teams = teamResponse.data.teams;
        const channels = privateChannelsResponse.data.groups;
        console.log(teams, "teams")
        console.log(channels, "channels")

        // Map Rocket.Chat teams and channels by ID for quick access
        const teamMap = new Map();
        const channelMap = new Map();


        teams.forEach(team => {
            teamMap.set(team._id, { teamId: team._id, teamName: team.name });
        });

        channels.forEach(channel => {
            channelMap.set(channel._id, { channelId: channel._id, channelName: channel.name, teamId: channel.teamId });
        });


        const userDataWithChannelsAndTeams = users?.flatMap(user => {
            // Determine the status based on the arrays' presence
            const status = user.rocketchatchannelid?.length > 0 && user.rocketchatteamid?.length > 0
                ? "Both"
                : user.rocketchatchannelid?.length > 0
                    ? "Channel"
                    : user.rocketchatteamid?.length > 0
                        ? "Team"
                        : user.rocketchatid ? "None" : null;

            if (status === "Both" || status === "Channel") {
                // If status is "Both" or "Channel", map based on rocketchatchannelid
                return user.rocketchatchannelid.map(channelId => {
                    const channel = channelMap.get(channelId);
                    const team = teamMap.get(channel?.teamId);

                    return {
                        _id: new ObjectId(),
                        username: user.username,
                        empcode: user.empcode,
                        employeeid: user._id,
                        workmode: user.workmode,
                        companyname: user.companyname,
                        company: user.company,
                        branch: user.branch,
                        unit: user.unit,
                        team: user.team,
                        department: user.department,
                        designation: user.designation,
                        rocketchatid: user.rocketchatid,
                        rocketchatemail: user.rocketchatemail,
                        rocketchatroles: user.rocketchatroles,
                        channelId: channel?.channelId || null,
                        channelName: channel?.channelName || null,
                        teamId: team?.teamId || null,
                        teamName: team?.teamName || null,
                        status: status,
                    };
                });
            }
            // else if (status === "Team") {
            //     // If status is "Team", map based on rocketchatteamid only
            //     return user.rocketchatteamid.map(teamId => {
            //         const team = teamMap.get(teamId);

            //         return {
            //             _id: new ObjectId(),
            //             username: user.username,
            //             empcode: user.empcode,
            //             employeeid: user._id,
            //             workmode: user.workmode,
            //             companyname: user.companyname,
            //             company: user.company,
            //             branch: user.branch,
            //             unit: user.unit,
            //             team: user.team,
            //             department: user.department,
            //             designation: user.designation,
            //             rocketchatid: user.rocketchatid,
            //             rocketchatemail: user.rocketchatemail,
            //             rocketchatroles: user.rocketchatroles,
            //             channelId: null, // No channel ID since we're using team only
            //             channelName: null, // No channel name since we're using team only
            //             teamId: team?.teamId || null,
            //             teamName: team?.teamName || null,
            //             status: status,
            //         };
            //     });
            // } else if (status === "None") {
            //     // If status is "None", return one object with basic info only
            //     return [{
            //         _id: new ObjectId(),
            //         username: user.username,
            //         empcode: user.empcode,
            //         employeeid: user._id,
            //         workmode: user.workmode,
            //         companyname: user.companyname,
            //         company: user.company,
            //         branch: user.branch,
            //         unit: user.unit,
            //         team: user.team,
            //         department: user.department,
            //         designation: user.designation,
            //         rocketchatid: user.rocketchatid,
            //         rocketchatemail: user.rocketchatemail,
            //         rocketchatroles: user.rocketchatroles,
            //         channelId: null,
            //         channelName: null,
            //         teamId: null,
            //         teamName: null,
            //         status: status,
            //     }];
            // }
            else {
                // If no rocketchatid and no channels or teams, return an empty array
                return [];
            }
        })// Apply filtering based on rocketchatchannelid and rocketchatteamid if they are not empty
            .filter(entry => {
                if (rocketchatchannelid?.length > 0 && rocketchatteamid?.length > 0) {
                    return rocketchatchannelid.includes(entry.channelId) && rocketchatteamid.includes(entry.teamId);
                } else if (rocketchatteamid?.length > 0) {
                    return rocketchatteamid.includes(entry.teamId);
                } else if (rocketchatchannelid?.length > 0) {
                    return rocketchatchannelid.includes(entry.channelId);
                }
                // If status is "None", don't filter, so always return true
                return true;
            });

        return res.status(200).json({
            users: userDataWithChannelsAndTeams,
        });
    } catch (error) {
        console.log(error);
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
            return next(new ErrorHandler("Error Filtering user!", 500));
        }
    }
});
//api to remove user from channel

exports.removeUserFromChannel = catchAsyncErrors(async (req, res, next) => {
    try {
        const { employeeid, channelId, teamId } = req.body.deleteData;

        const user = await User.findById(employeeid);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();


        // Remove the user from each specified channel in Rocket.Chat
        // Attempt to remove user from the channel on Rocket.Chat
        const removeResponse = await axios.post(
            `${rocketchatdomainurl}/api/v1/groups.kick`,
            {
                roomId: channelId, // ID of the channel to remove user from
                userId: user.rocketchatid // User's Rocket.Chat ID
            },
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            }
        );

        //  // If removal is successful, update user's rocketchatchannelid in the database
        if (removeResponse.data.success) {
            user.rocketchatchannelid = user.rocketchatchannelid.filter(channelIds => channelId !== channelIds);
            await user.save();

            console.log(`User successfully removed from channel ${channelId}`)
        } else {
            throw new Error("Failed to remove user from channel in Connects");
        }


        // If a teamId is provided, check if user should be removed from the team as well
        if (teamId) {
            // Fetch all channels in the specified team
            const teamChannelsResponse = await axios.get(`${rocketchatdomainurl}/api/v1/teams.listRooms?teamId=${teamId}`, {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                    "Content-Type": "application/json",
                },
            });

            const teamChannels = teamChannelsResponse.data.rooms || [];
            const userIsInTeamChannels = teamChannels.some(channel => user.rocketchatchannelid.includes(channel._id));

            if (!userIsInTeamChannels) {
                // Remove the user from the team in Rocket.Chat
                const removeTeamResponse = await axios.post(
                    `${rocketchatdomainurl}/api/v1/teams.removeMember`,
                    {
                        teamId: teamId, // Team ID to remove user from
                        userId: user.rocketchatid
                    },
                    {
                        headers: {
                            "X-Auth-Token": authToken,
                            "X-User-Id": userId,
                            "Content-Type": "application/json",
                        },
                    }
                );

                // If team removal is successful, update user's rocketchatteamid in the database
                if (removeTeamResponse.data.success) {
                    user.rocketchatteamid = user.rocketchatteamid === teamId ? "" : user.rocketchatteamid;

                    user.rocketchatteamid = user.rocketchatteamid.filter(teamIds => teamId !== teamIds);
                    await user.save();
                    console.log(`User successfully removed from team ${teamId}`);
                } else {
                    throw new Error("Failed to remove user from team in Rocket.Chat");
                }
            }
        }
        return res.status(200).json({
            success: true,
            message: "User successfully removed from channel and team if necessary",
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
            return next(new ErrorHandler("Error removing user from channels!", 500));
        }
    }
});

const findRocketChatTeamChannelIds = async (body) => {
    const { company, branch, unit, team, department, designation, companyname, workmode, process, shiftgrouping, shift } = body;
    console.log(body)
    const pipeline = [
        {
            $match: {
                $or: [
                    {
                        type: "Company",
                        company: { $in: [company] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Branch",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Unit",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Team",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        team: { $in: [team] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Department",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        department: { $in: [department] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Designation",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        designation: { $in: [designation] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Individual",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        team: { $in: [team] },
                        employeename: { $in: [companyname] },
                    },
                    {
                        type: "VPN Type",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        team: { $in: [team] },
                        employeename: { $in: [companyname] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Process",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        team: { $in: [team] },
                        process: { $in: [process] },
                        workmode: { $in: [workmode] },
                    },
                    {
                        type: "Shift",
                        company: { $in: [company] },
                        branch: { $in: [branch] },
                        unit: { $in: [unit] },
                        team: { $in: [team] },
                        workmode: { $in: [workmode] },
                        shiftgrouping: { $in: shiftgrouping },
                        shift: { $in: shift },
                    },
                ],
            },
        },
        {
            $project: {
                rocketchatteamid: 1,
                rocketchatchannelid: 1,
            },
        },
    ];

    try {
        const results = await rocketChatTeamChannelGrouping.aggregate(pipeline);

        // Concatenate all values of rocketchatteamid and rocketchatchannelid into separate arrays
        const allRocketChatTeamIds = results.flatMap((doc) => doc.rocketchatteamid || []);
        const allRocketChatChannelIds = results.flatMap((doc) => doc.rocketchatchannelid || []);

        // Remove duplicates
        const uniqueRocketChatTeamIds = [...new Set(allRocketChatTeamIds)];
        const uniqueRocketChatChannelIds = [...new Set(allRocketChatChannelIds)];
        console.log(uniqueRocketChatTeamIds,
            uniqueRocketChatChannelIds, "grp")
        return {
            rocketchatteamids: uniqueRocketChatTeamIds || [],
            rocketchatchannelids: uniqueRocketChatChannelIds || [],
        };
    } catch (error) {
        console.error("Error finding Rocket.Chat Team and Channel IDs:", error);
        throw error;
    }
};



const updateUserRocketchatTeams = async (rocketChatUserId, rocketChatUserRole, array1, array2) => {
    try {
        // array1 is from user
        //array2 is from grouping
        // Step 1: Log in to Rocket.Chat
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        // Step 2: Identify teams to add and remove based on array comparison
        const teamsToAdd = array2.filter(teamId => !array1.includes(teamId));
        const teamsToRemove = array1.filter(teamId => !array2.includes(teamId));

        // Step 3: Add the user to the teams in `teamsToAdd`
        for (const teamId of teamsToAdd) {
            await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.addMembers`,
                {
                    teamId: teamId,
                    members: [
                        {
                            userId: rocketChatUserId,
                            roles: rocketChatUserRole || ["member"], // Adjust roles if needed
                        },
                    ],
                },
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Add the team ID to array1 after adding to team
            array1.push(teamId);
        }

        // Step 4: Remove the user from the teams in `teamsToRemove`
        for (const teamId of teamsToRemove) {
            await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.removeMember`,
                {
                    teamId: teamId,
                    userId: rocketChatUserId,
                },
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );
            // Remove the team ID from array1 after removing from team
            const index = array1.indexOf(teamId);
            if (index > -1) {
                array1.splice(index, 1);
            }

        }

        return {
            message: "User's team memberships updated successfully",
            addedToTeams: teamsToAdd,
            removedFromTeams: teamsToRemove,
            updatedTeamsArray: array1 // Return the updated array1
        };
    } catch (error) {
        console.error("Error updating user teams:", error);
        throw new ErrorHandler(
            error.response?.data?.message || "Failed to update user teams",
            error.response?.status || 500
        );
    }
};
const updateUserRocketchatChannels = async (rocketChatUserId, array1, array2) => {
    try {
        // array1 is from user
        //array2 is from grouping
        // Step 1: Log in to Rocket.Chat
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        // Step 2: Identify teams to add and remove based on array comparison
        const groupsToAdd = array2.filter(groupId => !array1.includes(groupId));
        const groupsToRemove = array1.filter(groupId => !array2.includes(groupId));

        // Step 3: Add the user to the teams in `groupsToAdd`
        for (const groupId of groupsToAdd) {
            await axios.post(
                `${rocketchatdomainurl}/api/v1/groups.invite`,
                {
                    roomId: groupId,
                    userId: rocketChatUserId,
                },
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );
            // Add the group ID to array1 after adding to group
            array1.push(groupId);
        }

        // Step 4: Remove the user from the teams in `groupsToRemove`
        for (const groupId of groupsToRemove) {
            await axios.post(
                `${rocketchatdomainurl}/api/v1/groups.kick`,
                {
                    roomId: groupId,
                    userId: rocketChatUserId,
                },
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );
            // Remove the group ID from array1 after removing from group
            const index = array1.indexOf(groupId);
            if (index > -1) {
                array1.splice(index, 1);
            }
        }

        return {
            message: "User's Channel memberships updated successfully",
            addedToChannels: groupsToAdd,
            removedFromChannels: groupsToRemove,
            updatedChannelArray: array1 // Return the updated array1
        };
    } catch (error) {
        console.error("Error updating user channels:", error);
        throw new ErrorHandler(
            error.response?.data?.message || "Failed to update user channels",
            error.response?.status || 500
        );
    }
};

exports.createRocketChatUserInHrms = async (req, res) => {
    try {
        const {
            rocketchatUserId,
            email,
            username,
            // name,
            // nickname,
            roles,
            // rocketchatTeamIds,
            // rocketchatChannelIds
        } = req.body;
        console.log(req.body, "webhook user joined")
        // const token = req.headers['x-rocketchat-token'] || req.body.token;
        // const expectedToken = 'ys1nn3gvqdh'; // Replace with your actual token

        // if (token !== expectedToken) {
        //     return res.status(401).json({ message: "Unauthorized: Invalid token" });
        // }
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {

            let shiftgrouping = [];
            let shift = [];

            // Check if the user's boardingLog exists and has entries
            if (existingUser.boardingLog && existingUser.boardingLog.length > 0) {
                const lastBoardingLog = existingUser.boardingLog[existingUser.boardingLog.length - 1];

                // If shifttype is "Standard", push shiftgrouping and shifttiming values
                if (lastBoardingLog.shifttype === "Standard") {
                    if (lastBoardingLog.shiftgrouping) {
                        shiftgrouping.push(lastBoardingLog.shiftgrouping);
                    }
                    if (lastBoardingLog.shifttiming) {
                        shift.push(lastBoardingLog.shifttiming);
                    }
                } else if (lastBoardingLog.shifttype !== "Standard") {
                    // If shifttype is not "Standard", check the todo array
                    const todo = lastBoardingLog.todo;

                    if (todo && todo.length > 0) {
                        // Iterate over the todo array and push shiftgrouping and shifttiming
                        todo.forEach(item => {
                            if (item.shiftgrouping) {
                                shiftgrouping.push(item.shiftgrouping);
                            }
                            if (item.shifttiming) {
                                shift.push(item.shifttiming);
                            }
                        });
                    }
                }
            }
            let userObj = {
                company: existingUser?.company,
                branch: existingUser?.branch,
                unit: existingUser?.unit,
                team: existingUser?.team,
                department: existingUser?.department,
                designation: existingUser?.designation,
                companyname: existingUser?.companyname,
                process: existingUser?.process,
                workmode: existingUser?.workmode === "Remote" ? "Remote" : "Office",
                shiftgrouping,
                shift
            }

            const { rocketchatteamids, rocketchatchannelids } = await findRocketChatTeamChannelIds(userObj);

            const teamUpdateResult = await updateUserRocketchatTeams(rocketchatUserId, roles, [], rocketchatteamids);
            let updatedTeamsArray = teamUpdateResult?.updatedTeamsArray
            const channelUpdateResult = await updateUserRocketchatChannels(rocketchatUserId, [], rocketchatchannelids);
            let updatedChannelArray = channelUpdateResult?.updatedChannelArray;
            // Update the existing user's Rocket.Chat details
            existingUser.rocketchatid = rocketchatUserId;
            existingUser.rocketchatemail = email;
            existingUser.rocketchatroles = roles;
            existingUser.rocketchatteamid = updatedTeamsArray || [];
            existingUser.rocketchatchannelid = updatedChannelArray || [];

            // Save the updated user document
            await existingUser.save();

            return res.status(200).json({ message: "User updated successfully in MERN app", user: existingUser });
        } else {
            console.log("does not exist");

            return res.status(400).json({ message: "User Does not exist" });
        }


    } catch (error) {
        console.error("Error creating Rocket.Chat user:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.mergeRocketChatRoomsInHrms = async (req, res) => {
    try {
        console.log(req.body, "webhook joined room")
        const {
            rocketchatUserId,
            username,
        } = req.body;
        // console.log(req.body)
        // const token = req.headers['x-rocketchat-token'] || req.body.token;
        // const expectedToken = 'ys1nn3gvqdh'; // Replace with your actual token

        // if (token !== expectedToken) {
        //     return res.status(401).json({ message: "Unauthorized: Invalid token" });
        // }
        // Check if user already exists
        const existingUser = await User.findOne({ rocketchatid: rocketchatUserId });
        if (existingUser) {
            // Update the existing user's Rocket.Chat details
            // existingUser.rocketchatid = rocketchatUserId;
            existingUser.rocketchatemail = req?.body?.userDatas?.emails ? req?.body?.userDatas?.emails[0].address : "";
            existingUser.rocketchatroles = req?.body?.userDatas?.roles;

            // Initialize the arrays if they are undefined or null
            existingUser.rocketchatteamid = existingUser.rocketchatteamid || [];
            existingUser.rocketchatchannelid = existingUser.rocketchatchannelid || [];
            if (req?.body?.roomData?.teamMain) {
                // Check if the teamId is already in the array
                if (!existingUser.rocketchatteamid.includes(req?.body?.roomData?.teamId)) {
                    // If not present, concatenate the teamId to the array
                    existingUser.rocketchatteamid.push(req?.body?.roomData?.teamId);
                }

            }

            if (!req?.body?.roomData?.teamMain && req?.body?.roomData?._id) {
                if (!existingUser.rocketchatchannelid.includes(req?.body?.roomData?._id)) {

                    existingUser.rocketchatchannelid.push(req?.body?.roomData?._id);
                }
            }
            // existingUser.rocketchatchannelid = rocketchatChannelIds;

            // Save the updated user document
            await existingUser.save();

            return res.status(200).json({ message: "User Rooms updated successfully in MERN app" });
        } else {
            console.log("does not exist")
            return res.status(400).json({ message: "User Does Not Exist" });
        }


    } catch (error) {
        console.error("Error updating Rocket.Chat rooms id:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.removeRocketChatRoomsInHrms = async (req, res) => {
    try {
        console.log(req.body, "webhook left room")
        const {
            rocketchatUserId,
            username,
        } = req.body;
        // console.log(req.body)
        // const token = req.headers['x-rocketchat-token'] || req.body.token;
        // const expectedToken = 'ys1nn3gvqdh'; // Replace with your actual token

        // if (token !== expectedToken) {
        //     return res.status(401).json({ message: "Unauthorized: Invalid token" });
        // }
        // Check if user already exists
        const existingUser = await User.findOne({ rocketchatid: rocketchatUserId });
        if (existingUser) {
            // Update the existing user's Rocket.Chat details
            // existingUser.rocketchatid = rocketchatUserId;


            existingUser.rocketchatteamid = existingUser.rocketchatteamid || [];
            existingUser.rocketchatchannelid = existingUser.rocketchatchannelid || [];


            if (req?.body?.roomData?.teamMain) {
                if (existingUser.rocketchatteamid.includes(req?.body?.roomData?.teamId)) {
                    existingUser.rocketchatteamid = existingUser.rocketchatteamid.filter(id => id !== req?.body?.roomData?.teamId);
                }

            }

            if (!req?.body?.roomData?.teamMain && req?.body?.roomData?._id) {
                if (existingUser.rocketchatchannelid.includes(req?.body?.roomData?._id)) {
                    existingUser.rocketchatchannelid = existingUser.rocketchatchannelid.filter(id => id !== req?.body?.roomData?._id);
                }
            }
            // existingUser.rocketchatchannelid = rocketchatChannelIds;

            // Save the updated user document
            await existingUser.save();

            return res.status(200).json({ message: "User Rooms updated successfully in MERN app" });
        } else {
            console.log("does not exist")
            return res.status(400).json({ message: "User Does Not Exist" });
        }


    } catch (error) {
        console.error("Error updating Rocket.Chat rooms id:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getRocketChatUsersListFunction = async (domain, token, adminId) => {
    try {
        let allUsers = [];
        let offset = 0;
        const count = 50; // Number of users to fetch per request

        while (true) {
            const response = await axios.get(`${domain}/api/v1/users.list`, {
                headers: {
                    "X-Auth-Token": token,
                    "X-User-Id": adminId,
                    "Content-Type": "application/json",
                },
                params: {
                    offset,
                    count,
                },
            });

            const users = response?.data?.users || [];

            // Filter out 'app' type users
            const filteredUsers = users.filter(user => user?.type !== "app" && user?.type !== "bot");
            allUsers = allUsers.concat(filteredUsers);

            // If fewer users are returned than 'count', we've reached the end
            if (users.length < count) break;

            // Increment the offset for the next request
            offset += count;
        }

        return allUsers;
    } catch (error) {
        console.log(`Error Fetching Users: ${error.message}`);
        return [];
    }
};


exports.getRocketChatUsersListFromRocket = catchAsyncErrors(async (req, res, next) => {
    try {


        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        const chatUsers = await getRocketChatUsersListFunction(rocketchatdomainurl, authToken, userId)

        return res.status(200).json({
            users: chatUsers
        });
    } catch (error) {
        console.log(error);
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
            return next(new ErrorHandler("Error Fetching Users!", 500));
        }
    }
});


//mismatched linked not linked
exports.getRocketChatUsersListMerge = catchAsyncErrors(async (req, res, next) => {
    try {

        const {
            type,
            registrationstatus = [],
            employementtype = [],
            accountstatus = [],
            status = [],
            company = [],
            branch = [],
            unit = [],
            team = [],
            department = [],
            designation = [],
            employee = [], } = req.body;

        const resonablestatusarray = [
            "Absconded",
            "Hold",
            "Terminate",
            "Releave Employee",
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
        ];

        const aggregationPipeline = [
            {
                $match: {
                    resonablestatus: { $nin: resonablestatusarray },
                },
            },
            {
                $project: {
                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    designation: 1,
                    empcode: 1,
                    username: 1,
                    companyname: 1,
                    workmode: 1,
                    rocketchatid: 1,
                    rocketchatemail: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                    originalpassword: 1,
                },
            },
        ];
        const localusers = await User.aggregate(aggregationPipeline)
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        const chatUsers = await getRocketChatUsersListFunction(rocketchatdomainurl, authToken, userId)

        // const [teamResponse, privateChannelsResponse] = await Promise.all([
        //     axios.get(`${rocketchatdomainurl}/api/v1/teams.listAll`, {
        //         headers: {
        //             "X-Auth-Token": authToken,
        //             "X-User-Id": userId,
        //             "Content-Type": "application/json",
        //         },
        //     }),
        //     axios.get(`${rocketchatdomainurl}/api/v1/groups.list`, {
        //         headers: {
        //             "X-Auth-Token": authToken,
        //             "X-User-Id": userId,
        //             "Content-Type": "application/json",
        //         },
        //     }),
        // ]);


        // const teams = teamResponse.data.teams;
        // const channels = privateChannelsResponse.data.groups;


        // Map Rocket.Chat teams and channels by ID for quick access
        // const teamMap = new Map();
        // const channelMap = new Map();


        // teams.forEach(team => {
        //     teamMap.set(team._id, { teamId: team._id, teamName: team.name });
        // });

        // channels.forEach(channel => {
        //     channelMap.set(channel._id, { channelId: channel._id, channelName: channel.name, teamId: channel.teamId });
        // });
        const result = chatUsers?.map((chatUser) => {
            // Find a local user by matching rocketchatid with chatUser _id
            const localUserById = localusers.find((localUser) => localUser.rocketchatid === chatUser._id);

            // Find a local user by matching username with chatUser username if ID doesn't match
            const localUserByUsername = !localUserById
                ? localusers.find((localUser) => localUser.username === chatUser.username)
                : null;

            if (localUserById) {
                // Case: ID matches
                return {
                    accountstatus: "linked",
                    accountstatustype: "Linked",
                    _id: chatUser._id,
                    rocketchat: {
                        name: chatUser.name || "",
                        username: chatUser.username || "",
                        email: chatUser.emails?.[0]?.address || "",
                        roles: chatUser.roles || [],
                        status: chatUser.status || "",
                        active: chatUser.active || false,
                        type: chatUser.type || "",
                        lastLogin: chatUser.lastLogin || "",
                        registrationstatus: chatUser.active === false
                            ? "Deactivated"
                            : chatUser.active === true && chatUser.lastLogin
                                ? "Active"
                                : "Pending",
                    },
                    local: {
                        company: localUserById.company || "",
                        branch: localUserById.branch || "",
                        unit: localUserById.unit || "",
                        team: localUserById.team || "",
                        department: localUserById.department || "",
                        designation: localUserById.designation || "",
                        employeecode: localUserById.empcode || "",
                        username: localUserById.username || "",
                        employeename: localUserById.companyname || "",
                        password: localUserById.originalpassword || "",
                        workmode: localUserById.workmode === "Internship" ? "Internship" : "Employee",
                        employeeid: localUserById._id || "",
                    },
                };
            } else if (localUserByUsername) {
                // Case: Username matches but ID does not
                return {
                    accountstatus: "notlinked",
                    accountstatustype: "Not Linked",
                    _id: chatUser._id,
                    rocketchat: {
                        name: chatUser.name || "",
                        username: chatUser.username || "",
                        email: chatUser.emails?.[0]?.address || "",
                        roles: chatUser.roles || [],
                        status: chatUser.status || "",
                        active: chatUser.active || false,
                        type: chatUser.type || "",
                        lastLogin: chatUser.lastLogin || "",
                        registrationstatus: chatUser.active === false
                            ? "Deactivated"
                            : chatUser.active === true && chatUser.lastLogin
                                ? "Active"
                                : "Pending",
                    },
                    local: {
                        company: localUserByUsername.company || "",
                        branch: localUserByUsername.branch || "",
                        unit: localUserByUsername.unit || "",
                        team: localUserByUsername.team || "",
                        department: localUserByUsername.department || "",
                        designation: localUserByUsername.designation || "",
                        employeeid: localUserByUsername._id || "",
                        username: localUserByUsername.username || "",
                        employeename: localUserByUsername.companyname || "",
                        password: localUserByUsername.originalpassword || "",
                        workmode: localUserByUsername.workmode === "Internship" ? "Internship" : "Employee",
                        employeecode: localUserByUsername.empcode || "",
                    },
                };
            } else {
                // Case: No match
                return {
                    accountstatus: "mismatched",
                    accountstatustype: "Mismatched",
                    _id: chatUser._id,
                    rocketchat: {
                        name: chatUser.name || "",
                        username: chatUser.username || "",
                        email: chatUser.emails?.[0]?.address || "",
                        roles: chatUser.roles || [],
                        status: chatUser.status || "",
                        active: chatUser.active || false,
                        type: chatUser.type || "",
                        lastLogin: chatUser.lastLogin || "",
                        registrationstatus: chatUser.active === false
                            ? "Deactivated"
                            : chatUser.active === true && chatUser.lastLogin
                                ? "Active"
                                : "Pending",
                    },
                    local: {
                        company: "",
                        branch: "",
                        unit: "",
                        team: "",
                        department: "",
                        designation: "",
                        employeecode: "",
                        username: "",
                        employeename: "",
                        workmode: "",
                        employeeid: "",
                        password: "",
                    },
                };
            }
        });

        const normalizedStatus = status.map((stat) => stat.toLowerCase());

        const filteredResult = result.filter((item) => {
            const { local, rocketchat } = item;

            // Filter based on `type`
            if (type === "Company" && company.length && !company.includes(local.company)) {
                return false;
            }
            if (type === "Branch" && (company.length && !company.includes(local.company) || branch.length && !branch.includes(local.branch))) {
                return false;
            }
            if (type === "Unit" && (
                (company.length && !company.includes(local.company)) ||
                (branch.length && !branch.includes(local.branch)) ||
                (unit.length && !unit.includes(local.unit))
            )) {
                return false;
            }
            if (type === "Team" && (
                (company.length && !company.includes(local.company)) ||
                (branch.length && !branch.includes(local.branch)) ||
                (unit.length && !unit.includes(local.unit)) ||
                (team.length && !team.includes(local.team))
            )) {
                return false;
            }
            if (type === "Department" && (
                (company.length && !company.includes(local.company)) ||
                (branch.length && !branch.includes(local.branch)) ||
                (unit.length && !unit.includes(local.unit)) ||
                (department.length && !department.includes(local.department))
            )) {
                return false;
            }
            if (type === "Designation" && (
                (company.length && !company.includes(local.company)) ||
                (branch.length && !branch.includes(local.branch)) ||
                (unit.length && !unit.includes(local.unit)) ||
                (designation.length && !designation.includes(local.designation))
            )) {
                return false;
            }
            if (type === "Individual" && (
                (company.length && !company.includes(local.company)) ||
                (branch.length && !branch.includes(local.branch)) ||
                (unit.length && !unit.includes(local.unit)) ||
                (team.length && !team.includes(local.team)) ||
                (employee.length && !employee.includes(local.employeename))
            )) {
                return false;
            }

            // Filter based on `employementtype` (Work mode)
            if (employementtype.length) {
                if (employementtype.length === 1) {
                    if (employementtype.includes("Internship") && local.workmode !== "Internship") {
                        return false;
                    }
                    if (employementtype.includes("Employee") && local.workmode === "Internship") {
                        return false;
                    }
                }
            }

            // Filter based on `accountstatus`
            if (
                accountstatus.length &&
                !accountstatus.includes(item.accountstatustype)
            ) {
                return false;
            }

            // Filter based on `status` (Rocket.Chat status)
            if (
                normalizedStatus.length &&
                !normalizedStatus.includes(rocketchat.status.toLowerCase())
            ) {
                return false;
            }

            // Filter based on ` registration status` (Rocket.Chat Registration status)
            if (
                registrationstatus.length &&
                !registrationstatus.includes(rocketchat.registrationstatus)
            ) {
                return false;
            }

            // If all conditions pass, include the item
            return true;
        });
        console.log(result?.length, "result")
        console.log(filteredResult?.length, "filteredResult")

        return res.status(200).json({
            chatUsers,
            mergedusers: filteredResult,
            // rocketchatteams: teams,
            // rocketchatchannels: channels,
        });
    } catch (error) {
        console.log(error);
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
            return next(new ErrorHandler("Error Filtering user!", 500));
        }
    }
});

//delet rocketchat user
exports.deleteRocketChatUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { userid, employeeid } = req.body;
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        const response = await axios.post(
            `${rocketchatdomainurl}/api/v1/users.delete`,
            { userId: userid },
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
            }
        );

        if (employeeid) {
            const user = await User.findByIdAndUpdate(
                employeeid, // Find user by _id (assumes employeeid is the user's MongoDB ObjectId)
                {
                    $set: {
                        rocketchatid: "",
                        rocketchatemail: "",
                        rocketchatroles: [],
                        rocketchatteamid: [],
                        rocketchatchannelid: [],
                    },
                },
                { new: true } // Returns the updated document
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found in the database",
                });
            }
        }

        if (response?.data?.success) {
            return res.status(200).json({ success: true, message: "User deleted successfully" });
        } else {
            return res.status(400).json({ success: true, message: "Failed to delete user" });
        }
    } catch (error) {
        console.error(error);
        throw new ErrorHandler(
            error.response?.data?.message || "Error Deleting User",
            error.response?.status || 500
        );
    }
});
//edit rocketchat user
exports.editRocketChatUserDetails = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id,
            name,
            username,
            password,
            email,
            employeeid,
            roles } = req.body;
        console.log(req.body)
        const { user: updatedUserDetails } = await exports.updateRocketChatUserDetails(id, name, email, password, username, roles);
        console.log(updatedUserDetails)
        if (employeeid && updatedUserDetails) {
            const user = await User.findByIdAndUpdate(
                employeeid, // Find user by _id (assumes employeeid is the user's MongoDB ObjectId)
                {
                    $set: {
                        rocketchatid: updatedUserDetails?._id,
                        rocketchatemail: updatedUserDetails?.emails?.[0]?.address,
                        rocketchatroles: updatedUserDetails?.roles,
                    },
                },
                { new: true } // Returns the updated document
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found in the database",
                });
            }
        }

        return res.status(200).json({ success: true, message: "User Updated successfully" });

    } catch (error) {
        console.error(error);
        throw new ErrorHandler(
            error.response?.data?.message || "Error Updating User Details",
            error.response?.status || 500
        );
    }
});


exports.getSingleRocketChatUser = catchAsyncErrors(async (req, res, next) => {
    try {


        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();
        console.log(authToken, userId, rocketchatdomainurl)

        const response = await axios.get(
            `${rocketchatdomainurl}/api/v1/users.info?userId=${req.params.id}`,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
            }
        );

        const roomsResponse = await axios.get(
            `${rocketchatdomainurl}/api/v1/users.listTeams?userId=${req.params.id}`,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
            }
        );
        const userTeams = roomsResponse?.data?.teams || [];
        if (response?.data?.success) {
            return res.status(200).json({
                user: response?.data?.user,
                success: true,
                userTeams
            });
        } else {
            return res.status(200).json({
                users: {},
                success: false,
                userTeams: []
            });
        }


    } catch (error) {
        console.log(error);
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
            return next(new ErrorHandler("Error Fetching Users!", 500));
        }
    }
});


exports.getSingleUserData = async (userid) => {
    try {


        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        const response = await axios.get(
            `${rocketchatdomainurl}/api/v1/users.info?userId=${userid}`,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
            }
        );

        const teamsResponse = await axios.get(
            `${rocketchatdomainurl}/api/v1/users.listTeams?userId=${userid}`,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
            }
        );
        const userTeams = teamsResponse?.data?.teams || [];
        return { userExist: response?.data?.success, singleUser: response?.data?.user, userTeams }

    } catch (error) {
        console.log(error, 'err');
        return { userExist: false }
        // throw new ErrorHandler(
        //     error.response?.data?.message || "Error Getting Single UserData",
        //     error.response?.status || 500
        // );
    }
};


exports.getHierarchyBasedUsersList = async (employeenames) => {
    try {


        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();


        const rocketChatUsers = await getRocketChatUsersListFunction(rocketchatdomainurl, authToken, userId)
        let userRocketChatUsersList = await User.find(
            { companyname: { $in: employeenames } },
            { rocketchatid: 1, _id: 0 }
        ).lean();


        let RocketChatIds = userRocketChatUsersList?.map(data => data?.rocketchatid)?.filter(data => data !== undefined);
        let chatUsers = rocketChatUsers?.filter(data => RocketChatIds?.includes(data?._id))


        return {
            users: chatUsers
        };
    } catch (error) {
        console.log(error);
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
            return next(new ErrorHandler("Error Fetching Users!", 500));
        }
    }
};

const getUserPrivateGroups = async (authToken, userId, rocketchatdomainurl, username, userPrivateChannels) => {
    // Limit the number of concurrent requests (e.g., 5 at a time)
    const limit = pLimit(5);

    // Array to store results
    const userPrivateGroups = [];

    // Function to check if user is a member of a group
    const checkGroupMembership = async (group) => {
        try {
            const membersResponse = await axios.get(
                `${rocketchatdomainurl}/api/v1/groups.members?roomId=${group._id}`,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                    },
                }
            );
            const isMember = membersResponse?.data?.members?.some(
                (member) => member.username === username
            );
            if (isMember) {
                userPrivateGroups.push(group);
            }
        } catch (error) {
            console.error(`Error fetching members for group ${group._id}:`, error?.response?.data || error.message);
        }
    };

    // Process groups in batches with a concurrency limit
    const promises = userPrivateChannels.map((group) => limit(() => checkGroupMembership(group)));

    // Wait for all the batch requests to complete
    await Promise.all(promises);

    return userPrivateGroups;
};
exports.getSingleUserWithTeamChannelData = async (userid) => {
    try {
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        // Fetch user information
        const userResponse = await axios.get(
            `${rocketchatdomainurl}/api/v1/users.info?userId=${userid}`,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
            }
        );





        // Fetch user teams
        const teamsResponse = await axios.get(
            `${rocketchatdomainurl}/api/v1/users.listTeams?userId=${userid}`,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
            }
        );


        // Fetch user groups (private and public channels)
        // const publicChannelResponse = await axios.get(
        //     `${rocketchatdomainurl}/api/v1/channels.list.joined`,
        //     {
        //         headers: {
        //             "X-Auth-Token": authToken,
        //             "X-User-Id": userId,
        //         },
        //     }
        // );

        const privateChannelResponse = await axios.get(
            `${rocketchatdomainurl}/api/v1/groups.listAll`,
            {
                headers: {
                    "X-Auth-Token": authToken,
                    "X-User-Id": userId,
                },
                params: { count: 1000 },
            }
        );

        const userPrivateChannels = privateChannelResponse?.data?.groups?.filter(item => !item?.teamMain) || [];
        // Filter private groups for user's membership
        let userPrivateGroups = await getUserPrivateGroups(authToken, userId, rocketchatdomainurl, userResponse?.data?.user?.username, userPrivateChannels)
        // const userPublicChannels = publicChannelResponse?.data?.channels || [];
        // console.log(userPublicChannels?.map(data => data?._id), "publicChannelids");

        const userTeams = teamsResponse?.data?.teams || [];
        const userTeamsIds = teamsResponse?.data?.teams?.map(data => data?._id) || [];
        const userPrivateChannelsIds = userPrivateGroups?.map(item => item?._id) || [];




        // console.log(userTeams?.map(data => data?._id), "teamId");
        // console.log(userPrivateGroups?.map(item => item?.name));
        // console.log(userPrivateChannels?.length);
        // console.log(userPrivateGroups?.length);

        return {
            userExist: userResponse?.data?.success,
            singleUser: userResponse?.data?.user,
            userTeams,
            userTeamsIds,
            userPrivateChannelsIds,
            // userPublicChannels,
            userPrivateChannels: userPrivateGroups,
        };

    } catch (error) {
        console.error(error, 'err');
        return { userExist: false };
    }
};


exports.mergeRocketChatUserInHrms = async (req, res) => {
    try {
        const {
            rocketchatUserId,
            employeeid,
        } = req.body;

        let singleUserData = await exports.getSingleUserWithTeamChannelData(rocketchatUserId);


        // userExist,
        // singleUser,
        // userTeams,
        // userTeamsIds,
        // userPrivateChannelsIds,
        // userPrivateChannels,

        // const token = req.headers['x-rocketchat-token'] || req.body.token;
        // const expectedToken = 'ys1nn3gvqdh'; // Replace with your actual token

        // if (token !== expectedToken) {
        //     return res.status(401).json({ message: "Unauthorized: Invalid token" });
        // }
        // Check if user already exists
        const existingUser = await User.findById(employeeid);
        if (existingUser && singleUserData?.userExist) {

            let shiftgrouping = [];
            let shift = [];

            // Check if the user's boardingLog exists and has entries
            if (existingUser.boardingLog && existingUser.boardingLog.length > 0) {
                const lastBoardingLog = existingUser.boardingLog[existingUser.boardingLog.length - 1];

                // If shifttype is "Standard", push shiftgrouping and shifttiming values
                if (lastBoardingLog.shifttype === "Standard") {
                    if (lastBoardingLog.shiftgrouping) {
                        shiftgrouping.push(lastBoardingLog.shiftgrouping);
                    }
                    if (lastBoardingLog.shifttiming) {
                        shift.push(lastBoardingLog.shifttiming);
                    }
                } else if (lastBoardingLog.shifttype !== "Standard") {
                    // If shifttype is not "Standard", check the todo array
                    const todo = lastBoardingLog.todo;

                    if (todo && todo.length > 0) {
                        // Iterate over the todo array and push shiftgrouping and shifttiming
                        todo.forEach(item => {
                            if (item.shiftgrouping) {
                                shiftgrouping.push(item.shiftgrouping);
                            }
                            if (item.shifttiming) {
                                shift.push(item.shifttiming);
                            }
                        });
                    }
                }
            }
            let userObj = {
                company: existingUser?.company,
                branch: existingUser?.branch,
                unit: existingUser?.unit,
                team: existingUser?.team,
                department: existingUser?.department,
                designation: existingUser?.designation,
                companyname: existingUser?.companyname,
                process: existingUser?.process,
                workmode: existingUser?.workmode === "Remote" ? "Remote" : "Office",
                shiftgrouping,
                shift
            }

            let userRoles = singleUserData?.singleUser?.roles || [];
            let userEmail = singleUserData?.singleUser?.emails?.[0]?.address || "";
            let userAlreadyExistTeamIds = singleUserData?.userTeamsIds || [];
            let userAlreadyExistChannelIds = singleUserData?.userPrivateChannelsIds || [];

            const { rocketchatteamids, rocketchatchannelids } = await findRocketChatTeamChannelIds(userObj);

            // Remove team IDs that already exist
            let newTeamIds = rocketchatteamids?.filter(teamId => !userAlreadyExistTeamIds.includes(teamId));

            // Remove channel IDs that already exist
            let newChannelIds = rocketchatchannelids.filter(channelId => !userAlreadyExistChannelIds.includes(channelId));

            const teamUpdateResult = await updateUserRocketchatTeams(rocketchatUserId, userRoles, [], newTeamIds);
            // let updatedTeamsArray = teamUpdateResult?.updatedTeamsArray
            let updatedTeamsArray = [...new Set([...userAlreadyExistTeamIds, ...teamUpdateResult?.updatedTeamsArray])]
            const channelUpdateResult = await updateUserRocketchatChannels(rocketchatUserId, [], newChannelIds);
            // let updatedChannelArray = channelUpdateResult?.updatedChannelArray;
            let updatedChannelArray = [...new Set([...userAlreadyExistChannelIds, ...channelUpdateResult?.updatedChannelArray])];
            // Update the existing user's Rocket.Chat details
            existingUser.rocketchatid = rocketchatUserId;
            existingUser.rocketchatemail = userEmail;
            existingUser.rocketchatroles = userRoles;
            existingUser.rocketchatteamid = updatedTeamsArray || [];
            existingUser.rocketchatchannelid = updatedChannelArray || [];

            // Save the updated user document
            await existingUser.save();

            return res.status(200).json({ success: true, message: "User merged successfully in HRMS app", user: existingUser });
        } else {
            console.log("does not exist");


            return res.status(400).json({ success: false, message: "User Does not exist" });
        }


    } catch (error) {
        console.error("Error creating Rocket.Chat user:", error);
        res.status(500).json({ message: "Server error" });
    }
};





exports.getRocketChatUnAssignedUsersList = catchAsyncErrors(async (req, res, next) => {
    try {

        const {
            type,
            company = [],
            branch = [],
            unit = [],
            team = [],
            department = [],
            designation = [],
            employee = [],
            assignbranch = [],
        } = req.body;

        // const branchFilter = assignbranch?.map((branchObj) => ({
        //     $and: [
        //         { company: { $eq: branchObj.company } },
        //         { branch: { $eq: branchObj.branch } },
        //         { unit: { $eq: branchObj.unit } },
        //     ],
        // }));

        // {
        //     $match: {
        //         $or: branchFilter,
        //     },
        // },
        const resonablestatusarray = [
            "Absconded",
            "Hold",
            "Terminate",
            "Releave Employee",
            "Not Joined",
            "Postponed",
            "Rejected",
            "Closed",
        ];

        const aggregationPipeline = [
            {
                $match: {
                    company: { $in: company },
                    resonablestatus: { $nin: resonablestatusarray },
                    ...(type === "Branch" && { branch: { $in: branch } }),
                    ...(type === "Unit" && { branch: { $in: branch }, unit: { $in: unit } }),
                    ...(type === "Team" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team } }),
                    ...(type === "Department" && { branch: { $in: branch }, unit: { $in: unit }, department: { $in: department } }),
                    ...(type === "Designation" && { branch: { $in: branch }, unit: { $in: unit }, designation: { $in: designation } }),
                    ...(type === "Individual" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employee } }),
                },
            },

            {
                $project: {
                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    designation: 1,
                    empcode: 1,
                    username: 1,
                    companyname: 1,
                    workmode: 1,
                    companyemail: 1,
                    originalpassword: 1,
                    rocketchatid: 1,
                    rocketchatemail: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                },
            },
        ];
        const localusers = await User.aggregate(aggregationPipeline)

        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

        const chatUsers = await getRocketChatUsersListFunction(rocketchatdomainurl, authToken, userId)


        const chatUserIds = new Set(chatUsers.map(chatUser => chatUser._id));
        const chatUserUserNames = new Set(chatUsers.map(chatUser => chatUser.username));


        // Filter unmatched local users
        const unmatchedLocalUsers = localusers.filter(localUser => {
            // Exclude users already in chatUserUserNames
            if (chatUserUserNames.has(localUser.username)) {
                return false; // Skip this user
            }

            return (
                !localUser.rocketchatid || // Include users with empty or undefined rocketchatid
                !chatUserIds.has(localUser.rocketchatid) // Include users whose rocketchatid is not in chatUserIds
            );
        });

        // const normalizedStatus = status.map((stat) => stat.toLowerCase());

        // const filteredResult = result.filter((item) => {
        //     const { local, rocketchat } = item;

        //     // Filter based on `type`
        //     if (type === "Company" && company.length && !company.includes(local.company)) {
        //         return false;
        //     }
        //     if (type === "Branch" && (company.length && !company.includes(local.company) || branch.length && !branch.includes(local.branch))) {
        //         return false;
        //     }
        //     if (type === "Unit" && (
        //         (company.length && !company.includes(local.company)) ||
        //         (branch.length && !branch.includes(local.branch)) ||
        //         (unit.length && !unit.includes(local.unit))
        //     )) {
        //         return false;
        //     }
        //     if (type === "Team" && (
        //         (company.length && !company.includes(local.company)) ||
        //         (branch.length && !branch.includes(local.branch)) ||
        //         (unit.length && !unit.includes(local.unit)) ||
        //         (team.length && !team.includes(local.team))
        //     )) {
        //         return false;
        //     }
        //     if (type === "Department" && (
        //         (company.length && !company.includes(local.company)) ||
        //         (branch.length && !branch.includes(local.branch)) ||
        //         (unit.length && !unit.includes(local.unit)) ||
        //         (department.length && !department.includes(local.department))
        //     )) {
        //         return false;
        //     }
        //     if (type === "Designation" && (
        //         (company.length && !company.includes(local.company)) ||
        //         (branch.length && !branch.includes(local.branch)) ||
        //         (unit.length && !unit.includes(local.unit)) ||
        //         (designation.length && !designation.includes(local.designation))
        //     )) {
        //         return false;
        //     }
        //     if (type === "Individual" && (
        //         (company.length && !company.includes(local.company)) ||
        //         (branch.length && !branch.includes(local.branch)) ||
        //         (unit.length && !unit.includes(local.unit)) ||
        //         (team.length && !team.includes(local.team)) ||
        //         (employee.length && !employee.includes(local.employeename))
        //     )) {
        //         return false;
        //     }

        //     // Filter based on `employementtype` (Work mode)
        //     if (employementtype.length) {
        //         if (employementtype.length === 1) {
        //             if (employementtype.includes("Internship") && local.workmode !== "Internship") {
        //                 return false;
        //             }
        //             if (employementtype.includes("Employee") && local.workmode === "Internship") {
        //                 return false;
        //             }
        //         }
        //     }

        //     // Filter based on `accountstatus`
        //     if (
        //         accountstatus.length &&
        //         !accountstatus.includes(item.accountstatustype)
        //     ) {
        //         return false;
        //     }

        //     // Filter based on `status` (Rocket.Chat status)
        //     if (
        //         normalizedStatus.length &&
        //         !normalizedStatus.includes(rocketchat.status.toLowerCase())
        //     ) {
        //         return false;
        //     }

        //     // Filter based on ` registration status` (Rocket.Chat Registration status)
        //     if (
        //         registrationstatus.length &&
        //         !registrationstatus.includes(rocketchat.registrationstatus)
        //     ) {
        //         return false;
        //     }

        //     // If all conditions pass, include the item
        //     return true;
        // });

        return res.status(200).json({
            unmatchedLocalUsers
        });
    } catch (error) {
        console.log(error);
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
            return next(new ErrorHandler("Error Filtering user!", 500));
        }
    }
});


exports.checkRocketchat = catchAsyncErrors(async (req, res, next) => {
    try {



        const chatUsers = await checkRocketChatHealth()


        return res.status(200).json({
            rockectchatlive: chatUsers
        });
    } catch (error) {
        return res.status(200).json({
            rockectchatlive: false
        });
    }
});

