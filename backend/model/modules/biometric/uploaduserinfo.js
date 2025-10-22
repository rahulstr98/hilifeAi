const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uploaduserinfoSchema = new Schema({

    cloudIDC: {
        type: String,
        required: false,
    },
    biometricUserIDC: {
        type: String,
        required: false,
    },
    dataupload: {
        type: String,
        required: false,
    },
    staffNameC: {
        type: String,
        required: false,
    },
    rfidc: {
        type: String,
        required: false,
    },
    pwdc: {
        type: String,   
        required: false,
    },
    fingerCountN: {
        type: Number,
        required: false,
    },
    downloadedFingerTemplateN: {
        type: Number,
        required: false,
    },
    isFaceEnrolledC: {
        type: String,
        required: false,
    },
    datastatus: {
        type: String,
        required: false,
    },
    downloadedFaceTemplateN: {
        type: Number,
        required: false,
    },
    privilegeC: {
        type: String,
        required: false,
    },
    isEnabledC: {
        type: String,
        required: false,
    },
    companyname: {
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
module.exports = mongoose.model('biouploaduserinfo', uploaduserinfoSchema);
