const TeamChannelGrouping = require("../../../model/modules/rocketchat/rocketChatTeamChannelGrouping");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const axios = require("axios");
const rocketChatLogin = require('./rocketChatLogin');
const User = require("../../../model/login/auth");
const pLimit = require('p-limit');

// get All TeamChannelGrouping => /api/getallrocketchatteamchannelgrouping
exports.getAllTeamChannelGrouping = catchAsyncErrors(async (req, res, next) => {
    let teamchannelgrouping;
    try {
        teamchannelgrouping = await TeamChannelGrouping.find();
    } catch (err) {
        return next(new ErrorHandler("Something Went Wrong!", 404));
    }
    if (!teamchannelgrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        teamchannelgrouping,
    });
});

// Create new TeamChannelGrouping=> /api/createrocketchatteamchannelgrouping
exports.createTeamChannelGrouping = catchAsyncErrors(async (req, res, next) => {
    try {

        const { type, workmode, company, branch, unit, team, employeename, designation, department, rocketchatteam, rocketchatteamid, rocketchatchannel, rocketchatchannelid, process, shiftgrouping, shift } = req.body;
        // console.log(req.body)
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

        const workmodeFunc = (() => {
            if (workmode.includes("Office") && workmode.includes("Remote")) {
                // If workmode includes both, no filtering
                return {};
            } else if (workmode.includes("Office")) {
                // If workmode includes only "Office"
                return { workmode: { $ne: "Remote" } };
            } else if (workmode.includes("Remote")) {
                // If workmode includes only "Remote"
                return { workmode: "Remote" };
            }
            return {};
        });
        let workModeCondition = await workmodeFunc();
        let pipeline = [];
        if (type !== "Shift") {
            pipeline = [
                {
                    $match: {
                        company: { $in: company },
                        ...workModeCondition,
                        ...(type === "Branch" && { branch: { $in: branch } }),
                        ...(type === "Unit" && { branch: { $in: branch }, unit: { $in: unit } }),
                        ...(type === "Team" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team } }),
                        ...(type === "Department" && { branch: { $in: branch }, unit: { $in: unit }, department: { $in: department } }),
                        ...(type === "Designation" && { branch: { $in: branch }, unit: { $in: unit }, designation: { $in: designation } }),
                        ...(type === "Individual" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                        ...(type === "VPN Type" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                        ...(type === "Process" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, process: { $in: process } }),

                    },
                },
                {
                    $match: {
                        rocketchatid: { $exists: true, $ne: "" },
                        resonablestatus: { $nin: resonablestatusarray },
                    },
                },
                {
                    $project: {
                        rocketchatid: 1,
                        rocketchatroles: 1,
                        rocketchatteamid: 1,
                        rocketchatchannelid: 1,
                        username: 1,
                        companyname: 1,
                    },
                },
            ];
        } else if (type === "Shift") {
            console.log(req.body)
            //pipeline for single shift grouping and shift time
            // pipeline = [
            // {
            //     $match: {
            //         company: { $in: company },
            //         branch: { $in: branch },
            //         unit: { $in: unit },
            //         team: { $in: team },
            //         ...workModeCondition,
            //     }
            // },
            // {
            //     $addFields: {
            //         lastBoardingLog: {
            //             $arrayElemAt: ["$boardingLog", -1]
            //         },
            //         todoFilteredCount: {
            //             $size: {
            //                 $filter: {
            //                     input: {
            //                         $ifNull: [
            //                             {
            //                                 $arrayElemAt: [
            //                                     "$boardingLog.todo",
            //                                     -1
            //                                 ]
            //                             },
            //                             []
            //                         ]
            //                     },
            //                     as: "todoItem",
            //                     cond: {
            //                         $and: [
            //                             {
            //                                 $in: [
            //                                     // { $literal: shiftgrouping },
            //                                     "Night_12",
            //                                     {
            //                                         $cond: {
            //                                             if: { $isArray: "$$todoItem.shiftgrouping" },
            //                                             then: "$$todoItem.shiftgrouping",
            //                                             else: ["$$todoItem.shiftgrouping"]
            //                                         }
            //                                     }
            //                                 ]
            //                             },
            //                             {
            //                                 $in: [
            //                                     // { $literal: shift },
            //                                     "08:00PMto08:00AM",
            //                                     {
            //                                         $cond: {
            //                                             if: { $isArray: "$$todoItem.shifttiming" },
            //                                             then: "$$todoItem.shifttiming",
            //                                             else: ["$$todoItem.shifttiming"]
            //                                         }
            //                                     }
            //                                 ]
            //                             }
            //                         ]
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // },
            // {
            //     $match: {
            //         $expr: {
            //             $or: [
            //                 {
            //                     $and: [
            //                         { $eq: ["$lastBoardingLog.shifttype", "Standard"] },
            //                         {
            //                             $in: [
            //                                 // { $literal: shiftgrouping },
            //                                 "Night_12",
            //                                 {
            //                                     $cond: {
            //                                         if: { $isArray: "$lastBoardingLog.shiftgrouping" },
            //                                         then: "$lastBoardingLog.shiftgrouping",
            //                                         else: ["$lastBoardingLog.shiftgrouping"]
            //                                     }
            //                                 }
            //                             ]
            //                         },
            //                         {
            //                             $in: [
            //                                 // { $literal: shift },
            //                                 "08:00PMto08:00AM",
            //                                 {
            //                                     $cond: {
            //                                         if: { $isArray: "$lastBoardingLog.shifttiming" },
            //                                         then: "$lastBoardingLog.shifttiming",
            //                                         else: ["$lastBoardingLog.shifttiming"]
            //                                     }
            //                                 }
            //                             ]
            //                         }
            //                     ]
            //                 },
            //                 { $gt: ["$todoFilteredCount", 0] }
            //             ]
            //         }
            //     }
            // },
            // {
            //     $match: {
            //         rocketchatid: { $exists: true, $ne: "" },
            //         resonablestatus: { $nin: resonablestatusarray },
            //     },
            // },
            // {
            //     $project: {
            //         rocketchatid: 1,
            //         rocketchatroles: 1,
            //         rocketchatteamid: 1,
            //         rocketchatchannelid: 1,
            //         username: 1,
            //         companyname: 1,
            //     },
            // },
            // ];

            pipeline = [
                {
                    $match: {
                        company: { $in: company },
                        branch: { $in: branch },
                        unit: { $in: unit },
                        team: { $in: team },
                        ...workModeCondition,
                    }
                },
                {
                    $addFields: {
                        lastBoardingLog: {
                            $arrayElemAt: ["$boardingLog", -1]
                        },
                        todoFilteredCount: {
                            $size: {
                                $filter: {
                                    input: {
                                        $ifNull: [
                                            {
                                                $arrayElemAt: [
                                                    "$boardingLog.todo",
                                                    -1
                                                ]
                                            },
                                            []
                                        ]
                                    },
                                    as: "todoItem",
                                    cond: {
                                        $and: [
                                            {
                                                $gt: [
                                                    {
                                                        $size: {
                                                            $setIntersection: [
                                                                req.body.shiftgrouping,
                                                                {
                                                                    $cond: {
                                                                        if: { $isArray: "$$todoItem.shiftgrouping" },
                                                                        then: "$$todoItem.shiftgrouping",
                                                                        else: ["$$todoItem.shiftgrouping"]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    0
                                                ]
                                            },
                                            {
                                                $gt: [
                                                    {
                                                        $size: {
                                                            $setIntersection: [
                                                                req.body.shift,
                                                                {
                                                                    $cond: {
                                                                        if: { $isArray: "$$todoItem.shifttiming" },
                                                                        then: "$$todoItem.shifttiming",
                                                                        else: ["$$todoItem.shifttiming"]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $or: [
                                {
                                    $and: [
                                        { $eq: ["$lastBoardingLog.shifttype", "Standard"] },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            req.body.shiftgrouping,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$lastBoardingLog.shiftgrouping" },
                                                                    then: "$lastBoardingLog.shiftgrouping",
                                                                    else: ["$lastBoardingLog.shiftgrouping"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            req.body.shift,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$lastBoardingLog.shifttiming" },
                                                                    then: "$lastBoardingLog.shifttiming",
                                                                    else: ["$lastBoardingLog.shifttiming"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                },
                                { $gt: ["$todoFilteredCount", 0] }
                            ]
                        }
                    }
                },
                {
                    $match: {
                        rocketchatid: { $exists: true, $ne: "" },
                        resonablestatus: { $nin: resonablestatusarray },
                    },
                },
                {
                    $project: {
                        rocketchatid: 1,
                        rocketchatroles: 1,
                        rocketchatteamid: 1,
                        rocketchatchannelid: 1,
                        username: 1,
                        companyname: 1,
                    },
                },
            ];

        }
        // console.log(pipeline)

        const results = await User.aggregate(pipeline);
        const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();
        const rocketChatUsersList = await getRocketChatUsersList(rocketchatdomainurl, authToken, userId);

        const rocketChatUserIds = rocketChatUsersList.map(user => user._id);

        // Filter valid Rocket.Chat users
        const validRocketChatUsers = results.filter(user => rocketChatUserIds.includes(user.rocketchatid));
        const unmatchedRocketChatUsers = results.filter(user => !rocketChatUserIds.includes(user.rocketchatid));

        // console.log(results);
        const membersToAddInTeam = validRocketChatUsers
            ?.filter(user => !user.rocketchatteamid.some(id => rocketchatteamid.includes(id)))
            ?.map(user => ({
                userId: user.rocketchatid,
                roles: user.rocketchatroles || ["member"], // Default to "member" if no roles are specified
            }));

        console.log(membersToAddInTeam, "membersToAddInTeam")
        if (membersToAddInTeam.length > 0 && rocketchatteamid?.length === 1) {
            const teamId = rocketchatteamid?.toString();
            console.log(teamId, "teamId")
            console.log(rocketchatteamid, "rocketchatteamid")


            try {

                const response = await axios.post(
                    `${rocketchatdomainurl}/api/v1/teams.addMembers`,
                    {
                        teamId,
                        members: membersToAddInTeam,
                    },
                    {
                        headers: {
                            "X-Auth-Token": authToken,
                            "X-User-Id": userId,
                            "Content-Type": "application/json",
                        },
                    }
                );

                // Update users with the new team ID, only if it does not exist in the array
                await User.updateMany(
                    { rocketchatid: { $in: membersToAddInTeam.map(member => member.userId) } },
                    { $addToSet: { rocketchatteamid: teamId } }
                );

                console.log("Users successfully added to the team:", response.data);
            } catch (error) {
                console.error("Error adding users to the team:", error.response ? error.response.data : error.message);

                throw new ErrorHandler(
                    error.response?.data || "Failed to Add Users to the Team",
                    error.response?.status || 500
                );
            }
        } else {
            console.log("No users to add to the team.");
        }

        const channelUserMap = {};

        // Map each channel ID to the users that need to be added
        for (const user of validRocketChatUsers) {
            rocketchatchannelid.forEach(channelId => {
                if (!user.rocketchatchannelid.includes(channelId)) {
                    if (!channelUserMap[channelId]) {
                        channelUserMap[channelId] = [];
                    }
                    channelUserMap[channelId].push(user.rocketchatid);
                }
            });
        }
        // console.log(channelUserMap, "channelUserMap")


        // Send bulk invite requests for each channel with multiple users
        for (const [channelId, userIds] of Object.entries(channelUserMap)) {
            try {
                await axios.post(
                    `${rocketchatdomainurl}/api/v1/groups.invite`,
                    {
                        roomId: channelId,
                        userIds: userIds, // Adding multiple users to the same channel at once
                    },
                    {
                        headers: {
                            "X-Auth-Token": authToken,
                            "X-User-Id": userId,
                            "Content-Type": "application/json",
                        },
                    }
                );

                // Update users with the new channel ID, only if it does not exist in the array
                await User.updateMany(
                    { rocketchatid: { $in: userIds } },
                    { $addToSet: { rocketchatchannelid: channelId } }
                );

                console.log(`Added users to channel ${channelId}:`, userIds);
            } catch (error) {
                console.error(`Error adding users to channel ${channelId}:`, error.response ? error.response.data : error.message);

                throw new ErrorHandler(
                    error.response?.data || "Failed to Add Users to the Channel",
                    error.response?.status || 500
                );
            }
        }


        // Clear Rocket.Chat fields for unmatched users
        await User.updateMany(
            { rocketchatid: { $in: unmatchedRocketChatUsers.map(user => user.rocketchatid) } },
            {
                $set: {
                    rocketchatid: "",
                    rocketchatemail: "",
                    rocketchatroles: [],
                    rocketchatteamid: [],
                    rocketchatchannelid: [],
                },
            }
        );


        // Update matched users with email and roles from Rocket.Chat
        const updates = validRocketChatUsers.map(matchedUser => {
            const rocketChatUser = rocketChatUsersList.find(user => user._id === matchedUser.rocketchatid);
            return {
                updateOne: {
                    filter: { rocketchatid: matchedUser.rocketchatid },
                    update: {
                        $set: {
                            rocketchatemail: rocketChatUser?.emails?.[0]?.address || "",
                            rocketchatroles: rocketChatUser?.roles || [],
                        },
                    },
                },
            };
        });

        if (updates.length > 0) {
            await User.bulkWrite(updates);
        }

        await TeamChannelGrouping.create(req.body);

        return res.status(200).json({
            message: "Successfully Created!",
        });
    } catch (err) {
        console.log(err)
        return res.status(200).json({
            message: "Successfully Created!",
        });
    }
});

// get Signle TeamChannelGrouping => /api/singlerocketchatteamchannelgrouping/:id
exports.getSingleTeamChannelGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let steamchannelgrouping = await TeamChannelGrouping.findById(id);

    if (!steamchannelgrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        steamchannelgrouping,
    });
});
// Query to check if any document contains at least one matching element in any of the specified arrays
// const existingData = await TeamChannelGrouping.findOne({
//     _id: { $ne: id },
//     type: type,
//     $and: [
//         { company: { $elemMatch: { $in: company } } },
//         { branch: { $elemMatch: { $in: branch } } },
//         { unit: { $elemMatch: { $in: unit } } },
//         { team: { $elemMatch: { $in: team } } },
//         { department: { $elemMatch: { $in: department } } },
//         { rocketchatteam: { $elemMatch: { $in: rocketchatteam } } },
//         { rocketchatchannel: { $elemMatch: { $in: rocketchatchannel } } }
//     ]
// });
// update TeamChannelGrouping by id => /api/singlerocketchatteamchannelgrouping/:id
// exports.updateTeamChannelGrouping = catchAsyncErrors(async (req, res, next) => {
//     const id = req.params.id;

//     const { type, company, branch, unit, team, department, rocketchatteam, rocketchatteamid, rocketchatchannel, rocketchatchannelid } = req.body;



//     // If matching data is found, return an error
//     // if (existingData) {
//     //     return next(new ErrorHandler("Data already exists!", 400));
//     // }
//     let uteamchannelgrouping = await TeamChannelGrouping.findByIdAndUpdate(id, req.body);
//     if (!uteamchannelgrouping) {
//         return next(new ErrorHandler("Data not found!", 404));
//     }
//     return res.status(200).json({ message: "Updated successfully" });
// });


exports.updateTeamChannelGrouping = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Assuming the grouping ID is in the request parameters
    const { type, company, branch, unit, team, employeename, designation, department, rocketchatteamid, rocketchatchannelid, process, shiftgrouping, shift, workmode } = req.body;


    const workmodeFunc = (() => {
        if (workmode.includes("Office") && workmode.includes("Remote")) {
            // If workmode includes both, no filtering
            return {};
        } else if (workmode.includes("Office")) {
            // If workmode includes only "Office"
            return { workmode: { $ne: "Remote" } };
        } else if (workmode.includes("Remote")) {
            // If workmode includes only "Remote"
            return { workmode: "Remote" };
        }
        return {};
    });
    let workModeCondition = await workmodeFunc();

    const resonablestatusarray = [
        "Absconded", "Hold", "Terminate", "Releave Employee",
        "Not Joined", "Postponed", "Rejected", "Closed"
    ];

    // Step 1: Retrieve existing grouping and users related to old teams/channels
    let steamchannelgrouping = await TeamChannelGrouping.findById(id);
    if (!steamchannelgrouping) return next(new ErrorHandler("Grouping not found", 404));

    const remainingNewTeamIds = rocketchatteamid.filter(value => !steamchannelgrouping.rocketchatteamid.includes(value));
    const remainingNewChannelIds = rocketchatchannelid.filter(value => !steamchannelgrouping.rocketchatchannelid.includes(value));

    const oldTeamIds = steamchannelgrouping.rocketchatteamid.filter(value => !rocketchatteamid.includes(value));
    const oldChannelIds = steamchannelgrouping.rocketchatchannelid.filter(value => !rocketchatchannelid.includes(value));
    console.log(oldTeamIds, "oldTeamIds")
    console.log(oldChannelIds, "oldChannelIds")
    console.log(req.body, "req.body")


    let pipelineusersToUpdate = [];
    if (type !== "Shift") {
        pipelineusersToUpdate = [
            {
                $match: {
                    company: { $in: company },
                    ...workModeCondition,
                    ...(type === "Branch" && { branch: { $in: branch } }),
                    ...(type === "Unit" && { branch: { $in: branch }, unit: { $in: unit } }),
                    ...(type === "Team" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team } }),
                    ...(type === "Department" && { branch: { $in: branch }, unit: { $in: unit }, department: { $in: department } }),
                    ...(type === "Designation" && { branch: { $in: branch }, unit: { $in: unit }, designation: { $in: designation } }),
                    ...(type === "Individual" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                    ...(type === "VPN Type" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                    ...(type === "Process" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, process: { $in: process } }),
                    $or: [
                        { rocketchatteamid: { $in: oldTeamIds } },
                        { rocketchatchannelid: { $in: oldChannelIds } }
                    ]
                },
            },

            {
                $project: {
                    rocketchatid: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                    username: 1,
                    companyname: 1,

                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    designation: 1,
                    process: 1,
                    workmode: 1,
                    boardingLog: 1
                },
            },
        ];
    } else if (type === "Shift") {

        pipelineusersToUpdate = [
            {
                $match: {
                    company: { $in: company },
                    branch: { $in: branch },
                    unit: { $in: unit },
                    team: { $in: team },
                    ...workModeCondition,
                    $or: [
                        { rocketchatteamid: { $in: oldTeamIds } },
                        { rocketchatchannelid: { $in: oldChannelIds } }
                    ]
                }
            },
            {
                $addFields: {
                    lastBoardingLog: {
                        $arrayElemAt: ["$boardingLog", -1]
                    },
                    todoFilteredCount: {
                        $size: {
                            $filter: {
                                input: {
                                    $ifNull: [
                                        {
                                            $arrayElemAt: [
                                                "$boardingLog.todo",
                                                -1
                                            ]
                                        },
                                        []
                                    ]
                                },
                                as: "todoItem",
                                cond: {
                                    $and: [
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            req.body.shiftgrouping,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$$todoItem.shiftgrouping" },
                                                                    then: "$$todoItem.shiftgrouping",
                                                                    else: ["$$todoItem.shiftgrouping"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            req.body.shift,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$$todoItem.shifttiming" },
                                                                    then: "$$todoItem.shifttiming",
                                                                    else: ["$$todoItem.shifttiming"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    $expr: {
                        $or: [
                            {
                                $and: [
                                    { $eq: ["$lastBoardingLog.shifttype", "Standard"] },
                                    {
                                        $gt: [
                                            {
                                                $size: {
                                                    $setIntersection: [
                                                        req.body.shiftgrouping,
                                                        {
                                                            $cond: {
                                                                if: { $isArray: "$lastBoardingLog.shiftgrouping" },
                                                                then: "$lastBoardingLog.shiftgrouping",
                                                                else: ["$lastBoardingLog.shiftgrouping"]
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    {
                                        $gt: [
                                            {
                                                $size: {
                                                    $setIntersection: [
                                                        req.body.shift,
                                                        {
                                                            $cond: {
                                                                if: { $isArray: "$lastBoardingLog.shifttiming" },
                                                                then: "$lastBoardingLog.shifttiming",
                                                                else: ["$lastBoardingLog.shifttiming"]
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            },
                            { $gt: ["$todoFilteredCount", 0] }
                        ]
                    }
                }
            },
            {
                $project: {
                    rocketchatid: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                    username: 1,
                    companyname: 1,

                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    designation: 1,
                    process: 1,
                    workmode: 1,
                    boardingLog: 1
                },
            },
        ];

    }
    const usersAggrigate = await User.aggregate(pipelineusersToUpdate);


    const usersWithShift = usersAggrigate.map(user => {
        // Initialize empty shiftgrouping and shift arrays
        let shiftgrouping = [];
        let shift = [];

        // Check if the boardingLog is not empty or undefined
        if (user.boardingLog && user.boardingLog.length > 0) {
            const lastBoardingLog = user.boardingLog[user.boardingLog.length - 1];

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

        // Return updated user with shiftgrouping and shift arrays
        return {
            ...user,
            shiftgrouping,
            shift
        };
    });


    const usersToUpdate = await findRocketChatTeamChannelIdsAlreadyIn(usersWithShift, oldTeamIds, oldChannelIds, id);

    let pipeline = [];
    if (type !== "Shift") {
        pipeline = [
            {
                $match: {
                    company: { $in: company },
                    ...workModeCondition,
                    ...(type === "Branch" && { branch: { $in: branch } }),
                    ...(type === "Unit" && { branch: { $in: branch }, unit: { $in: unit } }),
                    ...(type === "Team" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team } }),
                    ...(type === "Department" && { branch: { $in: branch }, unit: { $in: unit }, department: { $in: department } }),
                    ...(type === "Designation" && { branch: { $in: branch }, unit: { $in: unit }, designation: { $in: designation } }),
                    ...(type === "Individual" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                    ...(type === "VPN Type" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                    ...(type === "Process" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, process: { $in: process } }),
                },
            },
            {
                $match: {
                    rocketchatid: { $exists: true, $ne: "" },
                    resonablestatus: { $nin: resonablestatusarray },
                },
            },
            {
                $project: {
                    rocketchatid: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                    username: 1,
                    companyname: 1
                },
            },
        ];
    } else if (type === "Shift") {

        pipeline = [
            {
                $match: {
                    company: { $in: company },
                    branch: { $in: branch },
                    unit: { $in: unit },
                    team: { $in: team },
                    ...workModeCondition,
                }
            },
            {
                $addFields: {
                    lastBoardingLog: {
                        $arrayElemAt: ["$boardingLog", -1]
                    },
                    todoFilteredCount: {
                        $size: {
                            $filter: {
                                input: {
                                    $ifNull: [
                                        {
                                            $arrayElemAt: [
                                                "$boardingLog.todo",
                                                -1
                                            ]
                                        },
                                        []
                                    ]
                                },
                                as: "todoItem",
                                cond: {
                                    $and: [
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            req.body.shiftgrouping,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$$todoItem.shiftgrouping" },
                                                                    then: "$$todoItem.shiftgrouping",
                                                                    else: ["$$todoItem.shiftgrouping"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            req.body.shift,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$$todoItem.shifttiming" },
                                                                    then: "$$todoItem.shifttiming",
                                                                    else: ["$$todoItem.shifttiming"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    $expr: {
                        $or: [
                            {
                                $and: [
                                    { $eq: ["$lastBoardingLog.shifttype", "Standard"] },
                                    {
                                        $gt: [
                                            {
                                                $size: {
                                                    $setIntersection: [
                                                        req.body.shiftgrouping,
                                                        {
                                                            $cond: {
                                                                if: { $isArray: "$lastBoardingLog.shiftgrouping" },
                                                                then: "$lastBoardingLog.shiftgrouping",
                                                                else: ["$lastBoardingLog.shiftgrouping"]
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    {
                                        $gt: [
                                            {
                                                $size: {
                                                    $setIntersection: [
                                                        req.body.shift,
                                                        {
                                                            $cond: {
                                                                if: { $isArray: "$lastBoardingLog.shifttiming" },
                                                                then: "$lastBoardingLog.shifttiming",
                                                                else: ["$lastBoardingLog.shifttiming"]
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            },
                            { $gt: ["$todoFilteredCount", 0] }
                        ]
                    }
                }
            },
            {
                $match: {
                    rocketchatid: { $exists: true, $ne: "" },
                    resonablestatus: { $nin: resonablestatusarray },
                },
            },
            {
                $project: {
                    rocketchatid: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                    username: 1,
                    companyname: 1,
                },
            },
        ];

    }
    const usersToUpdateNew = await User.aggregate(pipeline);

    if (!usersToUpdate.length && !usersToUpdateNew?.length) {
        await TeamChannelGrouping.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({ message: "No users found to update." });
    }

    const { authToken, userId: rocketChatUserId, rocketchatdomainurl } = await rocketChatLogin();

    const rocketChatUsersList = await getRocketChatUsersList(rocketchatdomainurl, authToken, rocketChatUserId);

    const rocketChatUserIds = rocketChatUsersList.map(user => user._id);
    const matchedUsers = usersToUpdate.filter(user => rocketChatUserIds.includes(user.rocketchatid));
    const matchedUsersNew = usersToUpdateNew.filter(user => rocketChatUserIds.includes(user.rocketchatid));
    if (!matchedUsers.length && !matchedUsersNew?.length) {
        console.log("No matched users found in Rocket.Chat.");
        await TeamChannelGrouping.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({ message: "No users found to update." });
    }

    const unmatchedUsers = usersToUpdate.filter(user => !rocketChatUserIds.includes(user.rocketchatid));
    const unmatchedUsersNew = usersToUpdateNew.filter(user => !rocketChatUserIds.includes(user.rocketchatid));

    const limit = pLimit(5); // Batch processing limit
    const batchSize = 10;
    // const userIds = matchedUsers.map(user => user.rocketchatid);
    const userIds = matchedUsers;

    // Step 2: Batch remove users from old teams and channels
    const userChunks = [];
    for (let i = 0; i < userIds.length; i += batchSize) userChunks.push(userIds.slice(i, i + batchSize));

    for (const chunk of userChunks) {
        const removalPromises = chunk.map(userId => limit(async () => {
            for (let teamId of userId?.teamsToRemove) await removeUserFromRocketChat(userId.rocketchatid, teamId, null, authToken, rocketChatUserId, rocketchatdomainurl);
            for (let channelId of userId?.channelsToRemove) await removeUserFromRocketChat(userId.rocketchatid, null, channelId, authToken, rocketChatUserId, rocketchatdomainurl);
        }));
        await Promise.all(removalPromises);
    }

    await Promise.all(
        matchedUsers.map(async (user) => {
            let updatedTeamIds = user.rocketchatteamid.filter(id => !user?.teamsToRemove.includes(id));
            let updatedChannelIds = user.rocketchatchannelid.filter(id => !user?.channelsToRemove.includes(id));
            await User.findByIdAndUpdate(user._id, {
                rocketchatteamid: updatedTeamIds,
                rocketchatchannelid: updatedChannelIds
            });
        })
    );

    // Step 3: Add users to new teams
    const membersToAddInTeam = matchedUsersNew
        .filter(user => !user.rocketchatteamid.some(id => remainingNewTeamIds.includes(id)))
        .map(user => ({ userId: user.rocketchatid, roles: user.rocketchatroles || ["member"] }));

    if (membersToAddInTeam.length > 0 && remainingNewTeamIds?.length === 1) {
        try {
            const teamId = remainingNewTeamIds.toString();
            await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.addMembers`,
                { teamId, members: membersToAddInTeam },
                { headers: { "X-Auth-Token": authToken, "X-User-Id": rocketChatUserId, "Content-Type": "application/json" } }
            );
            await User.updateMany(
                { rocketchatid: { $in: membersToAddInTeam.map(member => member.userId) } },
                { $addToSet: { rocketchatteamid: teamId } }
            );
        } catch (error) {
            return next(new ErrorHandler(error.response?.data || "Failed to Add Users to the Team", error.response?.status || 500));
        }
    }

    // Step 4: Add users to new channels
    const channelUserMap = {};
    for (const user of matchedUsersNew) {
        remainingNewChannelIds.forEach(channelId => {
            if (!user.rocketchatchannelid.includes(channelId)) {
                if (!channelUserMap[channelId]) channelUserMap[channelId] = [];
                channelUserMap[channelId].push(user.rocketchatid);
            }
        });
    }

    for (const [channelId, userIds] of Object.entries(channelUserMap)) {
        try {
            await axios.post(
                `${rocketchatdomainurl}/api/v1/groups.invite`,
                { roomId: channelId, userIds },
                { headers: { "X-Auth-Token": authToken, "X-User-Id": rocketChatUserId, "Content-Type": "application/json" } }
            );
            await User.updateMany(
                { rocketchatid: { $in: userIds } },
                { $addToSet: { rocketchatchannelid: channelId } }
            );
        } catch (error) {
            return next(new ErrorHandler(error.response?.data || "Failed to Add Users to the Channel", error.response?.status || 500));
        }
    }

    let overAllUnmatchedUsers = [...unmatchedUsers, ...unmatchedUsersNew]
    let overAllMatchedUsers = [...matchedUsers, ...matchedUsersNew]

    await User.updateMany(
        { rocketchatid: { $in: overAllUnmatchedUsers.map(user => user.rocketchatid) } },
        {
            $set: {
                rocketchatid: "",
                rocketchatemail: "",
                rocketchatroles: [],
                rocketchatteamid: [],
                rocketchatchannelid: [],
            },
        }
    );
    const updates = overAllMatchedUsers.map(matchedUser => {
        const rocketChatUser = rocketChatUsersList.find(user => user._id === matchedUser.rocketchatid);
        return {
            updateOne: {
                filter: { rocketchatid: matchedUser.rocketchatid },
                update: {
                    $set: {
                        rocketchatemail: rocketChatUser?.emails?.[0]?.address || "",
                        rocketchatroles: rocketChatUser?.roles || [],
                    },
                },
            },
        };
    });

    if (updates.length > 0) {
        await User.bulkWrite(updates);
    }

    // Step 5: Update TeamChannelGrouping
    await TeamChannelGrouping.findByIdAndUpdate(id, req.body, { new: true });

    return res.status(200).json({ message: "Users successfully updated in teams and channels!" });
});

// Combined update controller for Team and Channel
// exports.updateTeamChannelGrouping = catchAsyncErrors(async (req, res, next) => {
//     const { id } = req.params; // Assuming the grouping ID is in the request parameters
//     const { type, company, branch, unit, team, employeename, designation, department, rocketchatteamid, rocketchatchannelid } = req.body;




//     const resonablestatusarray = [
//         "Absconded", "Hold", "Terminate", "Releave Employee",
//         "Not Joined", "Postponed", "Rejected", "Closed"
//     ];

//     // Step 1: Retrieve existing grouping and users related to old teams/channels
//     let steamchannelgrouping = await TeamChannelGrouping.findById(id);
//     if (!steamchannelgrouping) return next(new ErrorHandler("Grouping not found", 404));

//     const remainingNewTeamIds = rocketchatteamid.filter(value => !steamchannelgrouping.rocketchatteamid.includes(value));
//     const remainingNewChannelIds = rocketchatchannelid.filter(value => !steamchannelgrouping.rocketchatchannelid.includes(value));

//     const oldTeamIds = steamchannelgrouping.rocketchatteamid.filter(value => !rocketchatteamid.includes(value));
//     const oldChannelIds = steamchannelgrouping.rocketchatchannelid.filter(value => !rocketchatchannelid.includes(value));
//     console.log(req.body, "req.body")
//     let matchConditions, pipeline;
//     if (type === "Individual") {
//         const oldusers = steamchannelgrouping.employeename.filter(value => !employeename.includes(value));
//         console.log(oldusers, "oldusers")
//         matchConditions = {
//             company: { $in: company },
//             branch: { $in: branch },
//             unit: { $in: unit },
//             team: { $in: team },
//             companyname: { $in: oldusers },
//         };
//     } else {
//         matchConditions = {
//             company: { $in: company },
//             ...(type === "Branch" && { branch: { $in: branch } }),
//             ...(type === "Unit" && { branch: { $in: branch }, unit: { $in: unit } }),
//             ...(type === "Team" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team } }),
//             ...(type === "Department" && { branch: { $in: branch }, unit: { $in: unit }, department: { $in: department } }),
//             ...(type === "Designation" && { branch: { $in: branch }, unit: { $in: unit }, designation: { $in: designation } }),
//         };
//     }

//     const usersToUpdate = await User.find({
//         $and: [
//             {
//                 $or: [
//                     { rocketchatteamid: { $in: oldTeamIds } },
//                     { rocketchatchannelid: { $in: oldChannelIds } }
//                 ]
//             },
//             { resonablestatus: { $nin: resonablestatusarray } },
//             matchConditions, // Add dynamic matching conditions
//         ]
//     }, {
//         rocketchatid: 1,
//         rocketchatroles: 1,
//         rocketchatteamid: 1,
//         rocketchatchannelid: 1,
//         username: 1,
//         companyname: 1
//     });


//     if (type === "Individual") {
//         const newUsers = employeename.filter(value => !steamchannelgrouping.employeename.includes(value));
//         console.log(newUsers, "newUsers")
//         pipeline = [
//             {
//                 $match: {
//                     company: { $in: company },
//                     branch: { $in: branch },
//                     unit: { $in: unit },
//                     team: { $in: team },
//                     companyname: { $in: newUsers },
//                 },
//             },
//             {
//                 $match: {
//                     rocketchatid: { $exists: true, $ne: "" },
//                     resonablestatus: { $nin: resonablestatusarray },
//                 },
//             },
//             {
//                 $project: {
//                     rocketchatid: 1,
//                     rocketchatroles: 1,
//                     rocketchatteamid: 1,
//                     rocketchatchannelid: 1,
//                     username: 1,
//                     companyname: 1
//                 },
//             },
//         ]
//     } else {
//         pipeline = [
//             {
//                 $match: {
//                     company: { $in: company },
//                     ...(type === "Branch" && { branch: { $in: branch } }),
//                     ...(type === "Unit" && { branch: { $in: branch }, unit: { $in: unit } }),
//                     ...(type === "Team" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team } }),
//                     ...(type === "Department" && { branch: { $in: branch }, unit: { $in: unit }, department: { $in: department } }),
//                     ...(type === "Designation" && { branch: { $in: branch }, unit: { $in: unit }, designation: { $in: designation } }),
//                 },
//             },
//             {
//                 $match: {
//                     rocketchatid: { $exists: true, $ne: "" },
//                     resonablestatus: { $nin: resonablestatusarray },
//                 },
//             },
//             {
//                 $project: {
//                     rocketchatid: 1,
//                     rocketchatroles: 1,
//                     rocketchatteamid: 1,
//                     rocketchatchannelid: 1,
//                     username: 1,
//                     companyname: 1
//                 },
//             },
//         ];
//     }
//     console.log(matchConditions, "matchConditions")
//     console.log(pipeline, "pipeline")
//     const usersToUpdateNew = await User.aggregate(pipeline);

//     if (!usersToUpdate.length && !usersToUpdateNew?.length) {
//         await TeamChannelGrouping.findByIdAndUpdate(id, req.body, { new: true });
//         return res.status(200).json({ message: "No users found to update." });
//     }

//     const { authToken, userId: rocketChatUserId, rocketchatdomainurl } = await rocketChatLogin();

//     const rocketChatUsersList = await getRocketChatUsersList(rocketchatdomainurl, authToken, rocketChatUserId);

//     const rocketChatUserIds = rocketChatUsersList.map(user => user._id);
//     const matchedUsers = usersToUpdate.filter(user => rocketChatUserIds.includes(user.rocketchatid));
//     const matchedUsersNew = usersToUpdateNew.filter(user => rocketChatUserIds.includes(user.rocketchatid));
//     if (!matchedUsers.length && !matchedUsersNew?.length) {
//         console.log("No matched users found in Rocket.Chat.");
//         await TeamChannelGrouping.findByIdAndUpdate(id, req.body, { new: true });
//         return res.status(200).json({ message: "No users found to update." });
//     }

//     const unmatchedUsers = usersToUpdate.filter(user => !rocketChatUserIds.includes(user.rocketchatid));
//     const unmatchedUsersNew = usersToUpdateNew.filter(user => !rocketChatUserIds.includes(user.rocketchatid));

//     const limit = pLimit(5); // Batch processing limit
//     const batchSize = 10;
//     const userIds = matchedUsers.map(user => user.rocketchatid);

//     // Step 2: Batch remove users from old teams and channels
//     const userChunks = [];
//     for (let i = 0; i < userIds.length; i += batchSize) userChunks.push(userIds.slice(i, i + batchSize));

//     for (const chunk of userChunks) {
//         const removalPromises = chunk.map(userId => limit(async () => {
//             for (let teamId of oldTeamIds) await removeUserFromRocketChat(userId, teamId, null, authToken, rocketChatUserId, rocketchatdomainurl);
//             for (let channelId of oldChannelIds) await removeUserFromRocketChat(userId, null, channelId, authToken, rocketChatUserId, rocketchatdomainurl);
//         }));
//         await Promise.all(removalPromises);
//     }

//     await Promise.all(
//         matchedUsers.map(async (user) => {
//             let updatedTeamIds = user.rocketchatteamid.filter(id => !oldTeamIds.includes(id));
//             let updatedChannelIds = user.rocketchatchannelid.filter(id => !oldChannelIds.includes(id));
//             await User.findByIdAndUpdate(user._id, {
//                 rocketchatteamid: updatedTeamIds,
//                 rocketchatchannelid: updatedChannelIds
//             });
//         })
//     );

//     // Step 3: Add users to new teams
//     const membersToAddInTeam = matchedUsersNew
//         .filter(user => !user.rocketchatteamid.some(id => remainingNewTeamIds.includes(id)))
//         .map(user => ({ userId: user.rocketchatid, roles: user.rocketchatroles || ["member"] }));

//     if (membersToAddInTeam.length > 0 && remainingNewTeamIds?.length === 1) {
//         try {
//             const teamId = remainingNewTeamIds.toString();
//             await axios.post(
//                 `${rocketchatdomainurl}/api/v1/teams.addMembers`,
//                 { teamId, members: membersToAddInTeam },
//                 { headers: { "X-Auth-Token": authToken, "X-User-Id": rocketChatUserId, "Content-Type": "application/json" } }
//             );
//             await User.updateMany(
//                 { rocketchatid: { $in: membersToAddInTeam.map(member => member.userId) } },
//                 { $addToSet: { rocketchatteamid: teamId } }
//             );
//         } catch (error) {
//             return next(new ErrorHandler(error.response?.data || "Failed to Add Users to the Team", error.response?.status || 500));
//         }
//     }

//     // Step 4: Add users to new channels
//     const channelUserMap = {};
//     for (const user of matchedUsersNew) {
//         remainingNewChannelIds.forEach(channelId => {
//             if (!user.rocketchatchannelid.includes(channelId)) {
//                 if (!channelUserMap[channelId]) channelUserMap[channelId] = [];
//                 channelUserMap[channelId].push(user.rocketchatid);
//             }
//         });
//     }

//     for (const [channelId, userIds] of Object.entries(channelUserMap)) {
//         try {
//             await axios.post(
//                 `${rocketchatdomainurl}/api/v1/groups.invite`,
//                 { roomId: channelId, userIds },
//                 { headers: { "X-Auth-Token": authToken, "X-User-Id": rocketChatUserId, "Content-Type": "application/json" } }
//             );
//             await User.updateMany(
//                 { rocketchatid: { $in: userIds } },
//                 { $addToSet: { rocketchatchannelid: channelId } }
//             );
//         } catch (error) {
//             return next(new ErrorHandler(error.response?.data || "Failed to Add Users to the Channel", error.response?.status || 500));
//         }
//     }

//     let overAllUnmatchedUsers = [...unmatchedUsers, ...unmatchedUsersNew]
//     let overAllMatchedUsers = [...matchedUsers, ...matchedUsersNew]

//     await User.updateMany(
//         { rocketchatid: { $in: overAllUnmatchedUsers.map(user => user.rocketchatid) } },
//         {
//             $set: {
//                 rocketchatid: "",
//                 rocketchatemail: "",
//                 rocketchatroles: [],
//                 rocketchatteamid: [],
//                 rocketchatchannelid: [],
//             },
//         }
//     );
//     const updates = overAllMatchedUsers.map(matchedUser => {
//         const rocketChatUser = rocketChatUsersList.find(user => user._id === matchedUser.rocketchatid);
//         return {
//             updateOne: {
//                 filter: { rocketchatid: matchedUser.rocketchatid },
//                 update: {
//                     $set: {
//                         rocketchatemail: rocketChatUser?.emails?.[0]?.address || "",
//                         rocketchatroles: rocketChatUser?.roles || [],
//                     },
//                 },
//             },
//         };
//     });

//     if (updates.length > 0) {
//         await User.bulkWrite(updates);
//     }

//     // Step 5: Update TeamChannelGrouping
//     await TeamChannelGrouping.findByIdAndUpdate(id, req.body, { new: true });

//     return res.status(200).json({ message: "Users successfully updated in teams and channels!" });
// });




const getRocketChatUsersList = async (domain, token, adminId) => {
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



// Function to remove multiple users one by one for teams and channels
const removeUserFromRocketChat = async (userId, teamId, channelId, authToken, rocketChatUserId, rocketchatdomainurl) => {
    try {
        // Removing user from team
        if (teamId) {
            const teamResponse = await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.removeMember`,
                {
                    teamId,
                    userId, // The user to remove
                },
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": rocketChatUserId,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(`User ${userId} successfully removed from team ${teamId}:`, teamResponse.data);
        }

        // Removing user from channel (group)
        if (channelId) {
            const channelResponse = await axios.post(
                `${rocketchatdomainurl}/api/v1/groups.kick`,
                {
                    roomId: channelId,
                    userId, // The user to remove
                },
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": rocketChatUserId,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(`User ${userId} successfully removed from channel ${channelId}:`, channelResponse.data);
        }
    } catch (error) {
        console.error(`Error removing user ${userId} from team ${teamId} or channel ${channelId}:`, error.response ? error.response.data : error.message);
    }
};


const findRocketChatTeamChannelIdsAlreadyIn = async (body, teamIds, channelIds, groupingId) => {
    try {
        const resultsForEachUser = await Promise.all(
            body.map(async (user) => {
                const {
                    company,
                    branch,
                    unit,
                    team,
                    department,
                    designation,
                    companyname,
                    workmode,
                    process,
                    shiftgrouping,
                    shift,
                } = user;
                let rocketWorkMode = workmode === "Remote" ? "Remote" : "Office";
                const pipeline = [
                    {
                        $match: {
                            $expr: {
                                $ne: [{ $toString: "$_id" }, groupingId]
                            }
                        }
                    },
                    {
                        $match: {
                            $and: [
                                {
                                    $or: [
                                        { rocketchatteamid: { $in: teamIds } },
                                        { rocketchatchannelid: { $in: channelIds } },
                                    ],
                                },
                                {
                                    $or: [
                                        {
                                            type: "Company",
                                            company: { $in: [company] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Branch",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Unit",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Team",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            team: { $in: [team] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Department",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            department: { $in: [department] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Designation",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            designation: { $in: [designation] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Individual",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            team: { $in: [team] },
                                            employeename: { $in: [companyname] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "VPN Type",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            team: { $in: [team] },
                                            employeename: { $in: [companyname] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Process",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            team: { $in: [team] },
                                            process: { $in: [process] },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                        {
                                            type: "Shift",
                                            company: { $in: [company] },
                                            branch: { $in: [branch] },
                                            unit: { $in: [unit] },
                                            team: { $in: [team] },
                                            shiftgrouping: { $in: shiftgrouping },
                                            shift: { $in: shift },
                                            workmode: { $in: [rocketWorkMode] },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            rocketchatteamid: 1,
                            rocketchatchannelid: 1,
                            // rocketchatteam: 1,
                            // rocketchatchannel: 1,
                        },
                    },
                ];

                const results = await TeamChannelGrouping.aggregate(pipeline);
                // console.log(results)

                // Concatenate all values of rocketchatteamid and rocketchatchannelid into separate arrays
                const allRocketChatTeamIds = results.flatMap((doc) => doc.rocketchatteamid || []);
                const allRocketChatChannelIds = results.flatMap((doc) => doc.rocketchatchannelid || []);

                // Remove duplicates
                const uniqueRocketChatTeamIds = [...new Set(allRocketChatTeamIds)];
                const uniqueRocketChatChannelIds = [...new Set(allRocketChatChannelIds)];

                const teamsToremove = teamIds.filter(value => !uniqueRocketChatTeamIds.includes(value));
                const channelsToRemove = channelIds.filter(value => !uniqueRocketChatChannelIds.includes(value));

                return {
                    ...user,
                    prevrocketchatteamid: uniqueRocketChatTeamIds || [],
                    prevrocketchatchannelid: uniqueRocketChatChannelIds || [],
                    teamsToRemove: teamsToremove || [],
                    channelsToRemove: channelsToRemove || [],
                    // prevrocketchatteamnames: results.flatMap((doc) => doc.rocketchatteam || []),
                    // prevrocketchatchannenames: results.flatMap((doc) => doc.rocketchatchannel || []),
                };
            })
        );

        return resultsForEachUser || [];
    } catch (error) {
        console.error("Error finding Rocket.Chat Team and Channel IDs for each user:", error);
        throw error;
    }
};


// const findRocketChatTeamChannelIdsAlreadyIn = async (body,teamIds,channelIds,groupingId) => {

//     const { company, branch, unit, team, department, designation, companyname, workmode, process,shiftgrouping , shift  } = body;
//     console.log(body)
//     const pipeline = [
//         {
//             $match: {
//                 $and: [
//                     { _id : { $ne: groupingId } }, // Exclude the specified groupingId
//                     {
//                         $or: [
//                             { rocketchatteamid: { $in: teamIds } },
//                             { rocketchatchannelid: { $in: channelIds } },
//                         ],
//                     },
//                     {
//                 $or: [
//                     {
//                         type: "Company",
//                         company: { $in: [company] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Branch",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Unit",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Team",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         team: { $in: [team] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Department",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         department: { $in: [department] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Designation",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         designation: { $in: [designation] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Individual",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         team: { $in: [team] },
//                         employeename: { $in: [companyname] },

//                     },
//                     {
//                         type: "VPN Type",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         team: { $in: [team] },
//                         employeename: { $in: [companyname] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Process",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         team: { $in: [team] },
//                         process: { $in: [process] },
//                         workmode: { $in: [workmode] },

//                     },
//                     {
//                         type: "Shift",
//                         company: { $in: [company] },
//                         branch: { $in: [branch] },
//                         unit: { $in: [unit] },
//                         team: { $in: [team] },
//                         shiftgrouping: { $in: shiftgrouping },
//                         shift: { $in: shift },
//                         workmode: { $in: [workmode] },

//                     },
//                 ],
//             },
//         ],

//             },
//         },
//         {
//             $project: {
//                 rocketchatteamid: 1,
//                 rocketchatchannelid: 1,
//             },
//         },
//     ];

//     try {
//         const results = await TeamChannelGrouping.aggregate(pipeline);

//         // Concatenate all values of rocketchatteamid and rocketchatchannelid into separate arrays
//         const allRocketChatTeamIds = results.flatMap((doc) => doc.rocketchatteamid || []);
//         const allRocketChatChannelIds = results.flatMap((doc) => doc.rocketchatchannelid || []);

//         // Remove duplicates
//         const uniqueRocketChatTeamIds = [...new Set(allRocketChatTeamIds)];
//         const uniqueRocketChatChannelIds = [...new Set(allRocketChatChannelIds)];
//         console.log(uniqueRocketChatTeamIds,
//             uniqueRocketChatChannelIds, "grp")
//         return {
//             rocketchatteamids: uniqueRocketChatTeamIds || [],
//             rocketchatchannelids: uniqueRocketChatChannelIds || [],
//         };
//     } catch (error) {
//         console.error("Error finding Rocket.Chat Team and Channel IDs:", error);
//         throw error;
//     }
// };

exports.deleteTeamChannelGrouping = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Assuming the grouping ID is in the request parameters

    // Step 1: Find the grouping object (TeamChannelGrouping) by ID
    let steamchannelgrouping = await TeamChannelGrouping.findById(id);
    if (!steamchannelgrouping) {
        return next(new ErrorHandler("Grouping not found", 404));
    }




    // Get the team and channel IDs that need to be processed
    const { rocketchatteamid, rocketchatchannelid, type, company, branch, unit, team, department, designation, employeename, workmode, process, shiftgrouping, shift } = steamchannelgrouping;


    const workmodeFunc = (() => {
        if (workmode.includes("Office") && workmode.includes("Remote")) {
            // If workmode includes both, no filtering
            return {};
        } else if (workmode.includes("Office")) {
            // If workmode includes only "Office"
            return { workmode: { $ne: "Remote" } };
        } else if (workmode.includes("Remote")) {
            // If workmode includes only "Remote"
            return { workmode: "Remote" };
        }
        return {};
    });
    let workModeCondition = await workmodeFunc();

    let pipelineusersToUpdate = [];
    if (type !== "Shift") {
        pipelineusersToUpdate = [
            {
                $match: {
                    company: { $in: company },
                    ...workModeCondition,
                    ...(type === "Branch" && { branch: { $in: branch } }),
                    ...(type === "Unit" && { branch: { $in: branch }, unit: { $in: unit } }),
                    ...(type === "Team" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team } }),
                    ...(type === "Department" && { branch: { $in: branch }, unit: { $in: unit }, department: { $in: department } }),
                    ...(type === "Designation" && { branch: { $in: branch }, unit: { $in: unit }, designation: { $in: designation } }),
                    ...(type === "Individual" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                    ...(type === "VPN Type" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, companyname: { $in: employeename } }),
                    ...(type === "Process" && { branch: { $in: branch }, unit: { $in: unit }, team: { $in: team }, process: { $in: process } }),
                    $or: [
                        { rocketchatteamid: { $in: rocketchatteamid } },
                        { rocketchatchannelid: { $in: rocketchatchannelid } }
                    ]
                },
            },

            {
                $project: {
                    rocketchatid: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                    username: 1,
                    companyname: 1,

                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    designation: 1,
                    process: 1,
                    workmode: 1,
                    boardingLog: 1
                },
            },
        ];
    } else if (type === "Shift") {

        pipelineusersToUpdate = [
            {
                $match: {
                    company: { $in: company },
                    branch: { $in: branch },
                    unit: { $in: unit },
                    team: { $in: team },
                    ...workModeCondition,
                    $or: [
                        { rocketchatteamid: { $in: rocketchatteamid } },
                        { rocketchatchannelid: { $in: rocketchatchannelid } }
                    ]
                }
            },
            {
                $addFields: {
                    lastBoardingLog: {
                        $arrayElemAt: ["$boardingLog", -1]
                    },
                    todoFilteredCount: {
                        $size: {
                            $filter: {
                                input: {
                                    $ifNull: [
                                        {
                                            $arrayElemAt: [
                                                "$boardingLog.todo",
                                                -1
                                            ]
                                        },
                                        []
                                    ]
                                },
                                as: "todoItem",
                                cond: {
                                    $and: [
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            shiftgrouping,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$$todoItem.shiftgrouping" },
                                                                    then: "$$todoItem.shiftgrouping",
                                                                    else: ["$$todoItem.shiftgrouping"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            shift,
                                                            {
                                                                $cond: {
                                                                    if: { $isArray: "$$todoItem.shifttiming" },
                                                                    then: "$$todoItem.shifttiming",
                                                                    else: ["$$todoItem.shifttiming"]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    $expr: {
                        $or: [
                            {
                                $and: [
                                    { $eq: ["$lastBoardingLog.shifttype", "Standard"] },
                                    {
                                        $gt: [
                                            {
                                                $size: {
                                                    $setIntersection: [
                                                        shiftgrouping,
                                                        {
                                                            $cond: {
                                                                if: { $isArray: "$lastBoardingLog.shiftgrouping" },
                                                                then: "$lastBoardingLog.shiftgrouping",
                                                                else: ["$lastBoardingLog.shiftgrouping"]
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    {
                                        $gt: [
                                            {
                                                $size: {
                                                    $setIntersection: [
                                                        shift,
                                                        {
                                                            $cond: {
                                                                if: { $isArray: "$lastBoardingLog.shifttiming" },
                                                                then: "$lastBoardingLog.shifttiming",
                                                                else: ["$lastBoardingLog.shifttiming"]
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            },
                            { $gt: ["$todoFilteredCount", 0] }
                        ]
                    }
                }
            },
            {
                $project: {
                    rocketchatid: 1,
                    rocketchatroles: 1,
                    rocketchatteamid: 1,
                    rocketchatchannelid: 1,
                    username: 1,
                    companyname: 1,

                    company: 1,
                    branch: 1,
                    unit: 1,
                    team: 1,
                    department: 1,
                    designation: 1,
                    process: 1,
                    workmode: 1,
                    boardingLog: 1
                },
            },
        ];

    }
    const usersAggrigate = await User.aggregate(pipelineusersToUpdate);


    if (!usersAggrigate.length) {
        console.log("No users found with the specified team/channel IDs.");
        await TeamChannelGrouping.findByIdAndDelete(id);
        return res.status(200).json({ message: "No users found to remove." });
    }


    const usersWithShift = usersAggrigate.map(user => {
        // Initialize empty shiftgrouping and shift arrays
        let shiftgrouping = [];
        let shift = [];

        // Check if the boardingLog is not empty or undefined
        if (user.boardingLog && user.boardingLog.length > 0) {
            const lastBoardingLog = user.boardingLog[user.boardingLog.length - 1];

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

        // Return updated user with shiftgrouping and shift arrays
        return {
            ...user,
            shiftgrouping,
            shift
        };
    });

    // console.log(usersWithShift)


    const usersToUpdate = await findRocketChatTeamChannelIdsAlreadyIn(usersWithShift, rocketchatteamid, rocketchatchannelid, id);

    // Step 3: Extract the user IDs for bulk removal



    // Step 4: Retrieve Rocket.Chat login info
    const { authToken, userId: rocketChatUserId, rocketchatdomainurl } = await rocketChatLogin();
    const rocketChatUsersList = await getRocketChatUsersList(rocketchatdomainurl, authToken, rocketChatUserId);

    const rocketChatUserIds = rocketChatUsersList.map(user => user._id);
    const matchedUsers = usersToUpdate.filter(user => rocketChatUserIds.includes(user.rocketchatid));

    // const userIds = matchedUsers.map(user => user.rocketchatid);
    const userIds = matchedUsers;
    const unmatchedUsers = usersToUpdate.filter(user => !rocketChatUserIds.includes(user.rocketchatid));

    if (!matchedUsers.length) {
        console.log("No matched users found in Rocket.Chat.");
        await TeamChannelGrouping.findByIdAndDelete(id);
        return res.status(200).json({ message: "No matched users found to remove." });
    }
    // Step 5: Create a rate limiter with a concurrency of 5 (or any desired number)
    const limit = pLimit(5);  // Adjust concurrency based on your needs

    // Step 6: Batch processing - Remove users from teams and channels in batches of 10 users
    const batchSize = 10; // Process 10 users at a time
    const userChunks = [];

    for (let i = 0; i < userIds.length; i += batchSize) {
        userChunks.push(userIds.slice(i, i + batchSize));
    }

    try {
        // Process each batch of users
        for (let chunk of userChunks) {
            // Run batch removals for this chunk
            const removalPromises = chunk.map(userId => {
                return limit(async () => {
                    // Remove from all teams
                    for (let teamId of userId.teamsToRemove) {
                        await removeUserFromRocketChat(userId.rocketchatid, teamId, null, authToken, rocketChatUserId, rocketchatdomainurl);
                    }

                    // Remove from all channels
                    for (let channelId of userId.channelsToRemove) {
                        await removeUserFromRocketChat(userId.rocketchatid, null, channelId, authToken, rocketChatUserId, rocketchatdomainurl);
                    }
                });
            });

            // Wait for all removals in this batch to complete
            await Promise.all(removalPromises);
        }

        // Step 7: Update users' `rocketchatteamid` and `rocketchatchannelid` arrays in the database
        await Promise.all(
            matchedUsers.map(async (user) => {
                let updatedTeamIds = user.rocketchatteamid.filter(id => !user?.teamsToRemove?.includes(id));
                let updatedChannelIds = user.rocketchatchannelid.filter(id => !user?.channelsToRemove.includes(id));

                await User.findByIdAndUpdate(user._id, {
                    rocketchatteamid: updatedTeamIds,
                    rocketchatchannelid: updatedChannelIds
                });
            })
        );


        await User.updateMany(
            { rocketchatid: { $in: unmatchedUsers.map(user => user.rocketchatid) } },
            {
                $set: {
                    rocketchatid: "",
                    rocketchatemail: "",
                    rocketchatroles: [],
                    rocketchatteamid: [],
                    rocketchatchannelid: [],
                },
            }
        );
        const updates = matchedUsers.map(matchedUser => {
            const rocketChatUser = rocketChatUsersList.find(user => user._id === matchedUser.rocketchatid);
            return {
                updateOne: {
                    filter: { rocketchatid: matchedUser.rocketchatid },
                    update: {
                        $set: {
                            rocketchatemail: rocketChatUser?.emails?.[0]?.address || "",
                            rocketchatroles: rocketChatUser?.roles || [],
                        },
                    },
                },
            };
        });

        if (updates.length > 0) {
            await User.bulkWrite(updates);
        }
        // Optional: If you want to delete the grouping itself after removing users, you can do:
        await TeamChannelGrouping.findByIdAndDelete(id);

        return res.status(200).json({ message: "Users successfully removed from teams and channels, and grouping deleted!" });
    } catch (error) {
        console.error("Error during batch removal:", error);
        return next(new ErrorHandler("Error during batch removal", 500));
    }
});

//get rocketchat role names

//function to goin rocketchat

exports.getRocketChatRoleNames = catchAsyncErrors(async (req, res, next) => {
    try {

        try {

            // Step 1: Login to Rocket.Chat to get authToken and userId
            const { authToken, userId, rocketchatdomainurl } = await rocketChatLogin();

            // Step 2: Use the authToken and userId to get team names
            const teamResponse = await axios.get(
                `${rocketchatdomainurl}/api/v1/roles.list`,
                {
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-User-Id": userId,
                        "Content-Type": "application/json",
                    },
                }
            );

            return res.status(200).json({
                rocketchatRoles: teamResponse?.data?.roles,
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
                return next(new ErrorHandler("Error Fetching Roles!", 500));
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
            return next(new ErrorHandler("Error Fetching Roles!", 500));
        }
    }
});



// add new user in individual;


exports.addUserInIndividual = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Assuming the grouping ID is in the request parameters
    const { company, branch, unit, team, employeename, updatedby, workmode } = req.body;

    const resonablestatusarray = [
        "Absconded", "Hold", "Terminate", "Releave Employee",
        "Not Joined", "Postponed", "Rejected", "Closed"
    ];

    // Step 1: Retrieve existing grouping and users related to old teams/channels
    let steamchannelgrouping = await TeamChannelGrouping.findById(id);
    if (!steamchannelgrouping) return next(new ErrorHandler("Grouping not found", 404));


    // Merge new values into existing arrays, ensuring uniqueness
    const updatedData = {
        company: Array.from(new Set([...(steamchannelgrouping.company || []), ...(req.body.company || [])])),
        branch: Array.from(new Set([...(steamchannelgrouping.branch || []), ...(req.body.branch || [])])),
        unit: Array.from(new Set([...(steamchannelgrouping.unit || []), ...(req.body.unit || [])])),
        team: Array.from(new Set([...(steamchannelgrouping.team || []), ...(req.body.team || [])])),
        employeename: Array.from(new Set([...(steamchannelgrouping.employeename || []), ...(req.body.employeename || [])])),
        workmode: Array.from(new Set([...(steamchannelgrouping?.workmode || []), ...(req.body.workmode || [])])),
        updatedby
    };

    const workmodeFunc = (() => {
        if (workmode.includes("Office") && workmode.includes("Remote")) {
            // If workmode includes both, no filtering
            return {};
        } else if (workmode.includes("Office")) {
            // If workmode includes only "Office"
            return { workmode: { $ne: "Remote" } };
        } else if (workmode.includes("Remote")) {
            // If workmode includes only "Remote"
            return { workmode: "Remote" };
        }
        return {};
    });
    let workModeCondition = await workmodeFunc();

    const pipeline = [
        {
            $match: {
                company: { $in: company },
                branch: { $in: branch },
                unit: { $in: unit },
                team: { $in: team },
                companyname: { $in: employeename },
                ...workModeCondition,
            },
        },
        {
            $match: {
                rocketchatid: { $exists: true, $ne: "" },
                resonablestatus: { $nin: resonablestatusarray },
            },
        },
        {
            $project: {
                rocketchatid: 1,
                rocketchatroles: 1,
                rocketchatteamid: 1,
                rocketchatchannelid: 1,
                username: 1,
                companyname: 1
            },
        },
    ];
    const usersToUpdateNew = await User.aggregate(pipeline);


    const { authToken, userId: rocketChatUserId, rocketchatdomainurl } = await rocketChatLogin();

    const rocketChatUsersList = await getRocketChatUsersList(rocketchatdomainurl, authToken, rocketChatUserId);

    const rocketChatUserIds = rocketChatUsersList.map(user => user._id);
    const matchedUsersNew = usersToUpdateNew.filter(user => rocketChatUserIds.includes(user.rocketchatid));
    if (!matchedUsersNew?.length) {
        console.log("No matched users found in Rocket.Chat.");
        await TeamChannelGrouping.findByIdAndUpdate(id, updatedData, { new: true });
        return res.status(200).json({ message: "No users found to update." });
    }


    // Step 3: Add users to new teams
    const membersToAddInTeam = matchedUsersNew
        .filter(user => !user.rocketchatteamid.some(id => steamchannelgrouping?.rocketchatteamid.includes(id)))
        .map(user => ({ userId: user.rocketchatid, roles: user.rocketchatroles || ["member"] }));

    if (membersToAddInTeam.length > 0 && steamchannelgrouping?.rocketchatteamid?.length === 1) {
        try {
            const teamId = steamchannelgrouping?.rocketchatteamid.toString();
            await axios.post(
                `${rocketchatdomainurl}/api/v1/teams.addMembers`,
                { teamId, members: membersToAddInTeam },
                { headers: { "X-Auth-Token": authToken, "X-User-Id": rocketChatUserId, "Content-Type": "application/json" } }
            );
            await User.updateMany(
                { rocketchatid: { $in: membersToAddInTeam.map(member => member.userId) } },
                { $addToSet: { rocketchatteamid: teamId } }
            );
        } catch (error) {
            return next(new ErrorHandler(error.response?.data || "Failed to Add Users to the Team", error.response?.status || 500));
        }
    }

    // Step 4: Add users to new channels
    const channelUserMap = {};
    for (const user of matchedUsersNew) {
        steamchannelgrouping?.rocketchatchannelid.forEach(channelId => {
            if (!user.rocketchatchannelid.includes(channelId)) {
                if (!channelUserMap[channelId]) channelUserMap[channelId] = [];
                channelUserMap[channelId].push(user.rocketchatid);
            }
        });
    }

    for (const [channelId, userIds] of Object.entries(channelUserMap)) {
        try {
            await axios.post(
                `${rocketchatdomainurl}/api/v1/groups.invite`,
                { roomId: channelId, userIds },
                { headers: { "X-Auth-Token": authToken, "X-User-Id": rocketChatUserId, "Content-Type": "application/json" } }
            );
            await User.updateMany(
                { rocketchatid: { $in: userIds } },
                { $addToSet: { rocketchatchannelid: channelId } }
            );
        } catch (error) {
            return next(new ErrorHandler(error.response?.data || "Failed to Add Users to the Channel", error.response?.status || 500));
        }
    }

    let overAllMatchedUsers = matchedUsersNew

    const updates = overAllMatchedUsers.map(matchedUser => {
        const rocketChatUser = rocketChatUsersList.find(user => user._id === matchedUser.rocketchatid);
        return {
            updateOne: {
                filter: { rocketchatid: matchedUser.rocketchatid },
                update: {
                    $set: {
                        rocketchatemail: rocketChatUser?.emails?.[0]?.address || "",
                        rocketchatroles: rocketChatUser?.roles || [],
                    },
                },
            },
        };
    });

    if (updates.length > 0) {
        await User.bulkWrite(updates);
    }

    // Step 5: Update TeamChannelGrouping
    await TeamChannelGrouping.findByIdAndUpdate(id, updatedData, { new: true });

    return res.status(200).json({ message: "Users successfully updated in teams and channels!" });
});
exports.removeUserInIndividual = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Assuming the grouping ID is in the request parameters
    const { employeename, updatedby } = req.body;

    const resonablestatusarray = [
        "Absconded", "Hold", "Terminate", "Releave Employee",
        "Not Joined", "Postponed", "Rejected", "Closed"
    ];

    // Step 1: Retrieve existing grouping and users related to old teams/channels
    let steamchannelgrouping = await TeamChannelGrouping.findById(id);
    if (!steamchannelgrouping) return next(new ErrorHandler("Grouping not found", 404));


    // Merge new values into existing arrays, ensuring uniqueness
    const updatedData = {
        employeename: (steamchannelgrouping.employeename || []).filter(
            name => !(req.body.employeename || []).includes(name)
        ),
        updatedby
    };

    const matchConditions = {
        companyname: { $in: employeename },
    };
    const usersAggrigate = await User.find({
        $and: [
            {
                $or: [
                    { rocketchatteamid: { $in: steamchannelgrouping?.rocketchatteamid } },
                    { rocketchatchannelid: { $in: steamchannelgrouping?.rocketchatchannelid } }
                ]
            },
            { resonablestatus: { $nin: resonablestatusarray } },
            matchConditions, // Add dynamic matching conditions
        ]
    }, {
        rocketchatid: 1,
        rocketchatroles: 1,
        rocketchatteamid: 1,
        rocketchatchannelid: 1,
        username: 1,
        companyname: 1,

        company: 1,
        branch: 1,
        unit: 1,
        team: 1,
        department: 1,
        designation: 1,
        process: 1,
        workmode: 1,
        boardingLog: 1
    }).lean();
    if (!usersAggrigate.length) {
        await TeamChannelGrouping.findByIdAndUpdate(id, updatedData, { new: true });
        return res.status(200).json({ message: "No users found to update." });
    }



    const usersWithShift = usersAggrigate.map(user => {
        // Initialize empty shiftgrouping and shift arrays
        let shiftgrouping = [];
        let shift = [];

        // Check if the boardingLog is not empty or undefined
        if (user.boardingLog && user.boardingLog.length > 0) {
            const lastBoardingLog = user.boardingLog[user.boardingLog.length - 1];

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

        // Return updated user with shiftgrouping and shift arrays
        return {
            ...user,
            shiftgrouping,
            shift
        };
    });


    const usersToUpdate = await findRocketChatTeamChannelIdsAlreadyIn(usersWithShift, steamchannelgrouping.rocketchatteamid, steamchannelgrouping.rocketchatchannelid, id);

    // const oldTeamIds = steamchannelgrouping.rocketchatteamid;
    // const oldChannelIds = steamchannelgrouping.rocketchatchannelid;

    const { authToken, userId: rocketChatUserId, rocketchatdomainurl } = await rocketChatLogin();

    const rocketChatUsersList = await getRocketChatUsersList(rocketchatdomainurl, authToken, rocketChatUserId);

    const rocketChatUserIds = rocketChatUsersList.map(user => user._id);

    const matchedUsers = usersToUpdate.filter(user => rocketChatUserIds.includes(user.rocketchatid))
    const limit = pLimit(5); // Batch processing limit
    const batchSize = 10;
    // const userIds = matchedUsers.map(user => user.rocketchatid);
    const userIds = matchedUsers;

    // Step 2: Batch remove users from old teams and channels
    const userChunks = [];
    for (let i = 0; i < userIds.length; i += batchSize) userChunks.push(userIds.slice(i, i + batchSize));

    for (const chunk of userChunks) {
        const removalPromises = chunk.map(userId => limit(async () => {
            for (let teamId of userId?.teamsToRemove) await removeUserFromRocketChat(userId.rocketchatid, teamId, null, authToken, rocketChatUserId, rocketchatdomainurl);
            for (let channelId of userId?.channelsToRemove) await removeUserFromRocketChat(userId.rocketchatid, null, channelId, authToken, rocketChatUserId, rocketchatdomainurl);
        }));
        await Promise.all(removalPromises);
    }

    await Promise.all(
        matchedUsers.map(async (user) => {
            let updatedTeamIds = user.rocketchatteamid.filter(id => !user?.teamsToRemove.includes(id));
            let updatedChannelIds = user.rocketchatchannelid.filter(id => !user?.channelsToRemove.includes(id));
            await User.findByIdAndUpdate(user._id, {
                rocketchatteamid: updatedTeamIds,
                rocketchatchannelid: updatedChannelIds
            });
        })
    );

    let overAllMatchedUsers = matchedUsers
    const updates = overAllMatchedUsers.map(matchedUser => {
        const rocketChatUser = rocketChatUsersList.find(user => user._id === matchedUser.rocketchatid);
        return {
            updateOne: {
                filter: { rocketchatid: matchedUser.rocketchatid },
                update: {
                    $set: {
                        rocketchatemail: rocketChatUser?.emails?.[0]?.address || "",
                        rocketchatroles: rocketChatUser?.roles || [],
                    },
                },
            },
        };
    });
    if (updates.length > 0) {
        await User.bulkWrite(updates);
    }

    // Step 5: Update TeamChannelGrouping
    await TeamChannelGrouping.findByIdAndUpdate(id, updatedData, { new: true });

    return res.status(200).json({ message: "Users successfully updated in teams and channels!" });
});