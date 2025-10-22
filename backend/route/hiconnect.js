const express = require("express");
const hiConnect = express.Router();
require("dotenv").config();

const {
  getMattermostChannelNames,
  getMattermostTeamNames,
  deactivateMattermostUser,

  createMattermostTeamName,
  deleteMattermostTeamName,
  restoreMattermostTeamName,
  updateMattermostTeamName,

  getAllTeamMattermostChannels,
  createMattermostChannel,
  deleteMattermostChannel,
  restoreMattermostChannel,
  updateMattermostChannel,
} = require("../controller/login/hiconnect");

hiConnect.route("/getmattermostteamnames").get(getMattermostTeamNames);
hiConnect.route("/getmattermostchannelnames").get(getMattermostChannelNames);

hiConnect
  .route("/deactivatemattermostuser/:userId")
  .delete(deactivateMattermostUser);

//create team

hiConnect.route("/createmattermostteam").post(createMattermostTeamName);
hiConnect.route("/deletemattermostteam").delete(deleteMattermostTeamName);
hiConnect.route("/restoremattermostteam").post(restoreMattermostTeamName);
hiConnect.route("/updatemattermostteam").put(updateMattermostTeamName);

//create channel

hiConnect
  .route("/getmattermostallteamchannels")
  .get(getAllTeamMattermostChannels);
hiConnect.route("/createmattermostchannel").post(createMattermostChannel);
hiConnect.route("/deletemattermostchannel").delete(deleteMattermostChannel);
hiConnect.route("/restoremattermostchannel").post(restoreMattermostChannel);
hiConnect.route("/updatemattermostchannel").put(updateMattermostChannel);


//rocketchat teams
const {
  getRocketChatTeamNames,
  createRocketChatTeam, deleteRocketChatTeam, updateRocketChatTeam
} = require("../controller/modules/rocketchat/rocketChatTeam");
hiConnect.route("/getrocketchatteams").get(getRocketChatTeamNames);
hiConnect.route("/createrocketchatteam").post(createRocketChatTeam);
hiConnect.route("/updaterocketchatteam").put(updateRocketChatTeam);
hiConnect.route("/deleterocketchatteam").delete(deleteRocketChatTeam);
//rocketchat channels
const {
  getRocketChatChannelNames,
  deleteRocketChatChannel,
  createRocketChatChannel,
  updateRocketChatChannel
} = require("../controller/modules/rocketchat/rocketChatChannel");
hiConnect.route("/getrocketchatchannels").get(getRocketChatChannelNames);
hiConnect.route("/createrocketchatchannel").post(createRocketChatChannel);
hiConnect.route("/updaterocketchatchannel").put(updateRocketChatChannel);
hiConnect.route("/deleterocketchatchannel").delete(deleteRocketChatChannel);

//rocketchat users
const { getRocketChatUsersListMerge, getSingleRocketChatUser,checkRocketchat, getRocketChatUnAssignedUsersList,mergeRocketChatUserInHrms,createRocketChatUserInHrms, mergeRocketChatRoomsInHrms, removeRocketChatRoomsInHrms, deleteRocketChatUser, activeStatusRocketChatUser, getRocketChatUsersListFromRocket, getRocketChatUsersList, removeUserFromChannel, editRocketChatUserDetails } = require("../controller/modules/rocketchat/rocketChatUsers")
hiConnect.route("/rocketchat/webhook/mergeuser").post(createRocketChatUserInHrms);
hiConnect.route("/rocketchat/webhook/user-joined-room").post(mergeRocketChatRoomsInHrms);
hiConnect.route("/rocketchat/webhook/user-left-room").post(removeRocketChatRoomsInHrms);
hiConnect.route("/activestatusrocketchatuser").post(activeStatusRocketChatUser);
hiConnect.route("/filterrocketchatuser").post(getRocketChatUsersList);
hiConnect.route("/getallrocketchatusers").get(getRocketChatUsersListFromRocket);
hiConnect.route("/removeuserfromchannel").post(removeUserFromChannel);
hiConnect.route("/singlerocketchatuserdata/:id/").get(getSingleRocketChatUser);
hiConnect.route("/getrocketchatandhrmsusers").post(getRocketChatUsersListMerge);
hiConnect.route("/deleterocketchatuser").post(deleteRocketChatUser);
hiConnect.route("/updaterocketchatuserdetails").put(editRocketChatUserDetails);
hiConnect.route("/mergerocketchatuserdetails").post(mergeRocketChatUserInHrms);
hiConnect.route("/getrocketchatunassignedusers").post(getRocketChatUnAssignedUsersList);
hiConnect.route("/checkrocketchathealth").get(checkRocketchat);
//rocketchat team and channel grouping
const {
  createTeamChannelGrouping,
  deleteTeamChannelGrouping,
  getAllTeamChannelGrouping,
  getSingleTeamChannelGrouping,
  updateTeamChannelGrouping,
  getRocketChatRoleNames,
  addUserInIndividual,
  removeUserInIndividual
} = require("../controller/modules/rocketchat/rocketChatTeamChannelGrouping");
hiConnect.route("/getallrocketchatteamchannelgrouping").get(getAllTeamChannelGrouping);
hiConnect.route("/createrocketchatteamchannelgrouping").post(createTeamChannelGrouping);
hiConnect.route("/singlerocketchatteamchannelgrouping/:id").get(getSingleTeamChannelGrouping).put(updateTeamChannelGrouping).delete(deleteTeamChannelGrouping);
hiConnect.route("/getrocketchatroles").get(getRocketChatRoleNames);
hiConnect.route("/addnewuserinindividual/:id").put(addUserInIndividual);
hiConnect.route("/removeuserinindividual/:id").put(removeUserInIndividual);

module.exports = hiConnect;
