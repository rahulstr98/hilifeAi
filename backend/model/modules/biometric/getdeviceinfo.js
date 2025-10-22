const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const getdeviceinfoSchema = new Schema({

    cloudIDC: {
        type: String,
        required: false,
    },
    totalManagerN: {
        type: Number,
        required: false,
    },
    totalUserN: {
        type: Number,
        required: false,
    },
    totalFaceN: {
        type: Number,
        required: false,
    },
    totalFPN: {
        type: Number,
        required: false,
    },
    totalCardN: {
        type: Number,
        required: false,
    },
    totalPWDN: {
        type: Number,
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
module.exports = mongoose.model('biogetdeviceinfo', getdeviceinfoSchema);