const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rocketChatTeamChannelGroupingSchema = new Schema({

    type: {
        type: String,
        required: false,
    },
    workmode: {
        type: [String],
        required: false,
    },
    company: {
        type: [String],
        required: false,
    },
    branch: {
        type: [String],
        required: false,
    },
    unit: {
        type: [String],
        required: false,
    },
    team: {
        type: [String],
        required: false,
    },
    department: {
        type: [String],
        required: false,
    },
    employeename: {
        type: [String],
        required: false,
    },
    designation: {
        type: [String],
        required: false,
    },
    process: {
        type: [String],
        required: false,
    },
    shiftgrouping: {
        type: [String],
        required: false,
    },
    shift: {
        type: [String],
        required: false,
    },
    rocketchatteam: {
        type: [String],
        required: false,
    },
    rocketchatteamid: {
        type: [String],
        required: false,
    },
    rocketchatchannel: {
        type: [String],
        required: false,
    },
    rocketchatchannelid: {
        type: [String],
        required: false,
    },
    addedby: [
        {
            name: {
                type: String,
                required: false,
            },
            date: {
                type: String,
                required: false,
            },

        }],
    updatedby: [
        {
            name: {
                type: String,
                required: false,
            },
            date: {
                type: String,
                required: false,
            },

        }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('RocketChatTeamChannelGrouping', rocketChatTeamChannelGroupingSchema);