const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const meetingConfigurationSchema = new Schema({
    meetprovider: {
        type: String,
        required: false
    },
    domainurl: {
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
module.exports = mongoose.model('meetingconfiguration', meetingConfigurationSchema);