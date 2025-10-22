const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MikroTikPppSecretsSchema = new Schema({

    mikrotikid: {
        type: String,
        required: false,
    },
    team: {
        type: [String],
        required: false,
    },
    employeename: {
        type: String,
        required: false,
    },
    company: {
        type: String,
        required: false,
    },
    branch: {
        type: String,
        required: false,
    },
    unit: {
        type: String,
        required: false,
    },
    autogenerate: {
        type: Boolean,
        required: false,
    },
    mikrotikname: {
        type: String,
        required: false,
    },
    temppassword: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    service: {
        type: String,
        required: false,
    },
    profile: {
        type: String,
        required: false,
    },
    localaddress: {
        type: String,
        required: false,
    },
    remoteaddress: {
        type: String,
        required: false,
    },
    adminusername: {
        type: String,
        required: false,
    },
    adminpassword: {
        type: String,
        required: false,
    },
    url: {
        type: String,
        required: false,
    },
    name: {
        type: String,
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
        },
    ],
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
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("mikrotikpppsecrets", MikroTikPppSecretsSchema);
