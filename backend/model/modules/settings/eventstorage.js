const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const evenntstorageSchema = new Schema({

    eventType: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false,
    },
    timestamp: {
        type: String,
        required: false,
    },
    system: {
        type: String,
        required: false,
    },
    systemid: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: false,
    },
    employeename: {
        type: String,
        required: false,
    },
    empcode: {
        type: String,
        required: false,
    },
    date: {
        type: String,
        required: false,
    },
    time: {
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
    team: {
        type: String,
        required: false,
    },
    department: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
    },
    filename: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('eventsonpc', evenntstorageSchema);