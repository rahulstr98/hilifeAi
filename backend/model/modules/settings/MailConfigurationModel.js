const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mailConfigurationSchema = new Schema({
    configurationtype: {
        type: String,
        required: false
    },
    hostname: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    databasename: {
        type: String,
        required: false
    },
    port: {
        type: String,
        required: false
    },
    quotaallocation: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
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
})
module.exports = mongoose.model('mailconfiguration', mailConfigurationSchema);