const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MikroTikLogs = new Schema({

    mikrotikid: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: false,
    },
    time: {
        type: String,
        required: false,
    },
    topics: {
        type: String,
        required: false,
    },
    url: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("mikrotiklogs", MikroTikLogs);