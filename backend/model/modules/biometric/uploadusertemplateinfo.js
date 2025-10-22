const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uploadusertemplateinfoSchema = new Schema({

    cloudIDC: {
        type: String,
        required: false,
    },
    biometricUserIDC: {
        type: String,
        required: false,
    },
    templateNoN: {
        type: Number,
        required: false,
    },
    templateTypeC: {
        type: String,
        required: false,
    },
    templateC: {
        type: String,
        required: false,
    },
    duressC: {
        type: String,
        required: false,
    },
    statusdevice: {
        type: String,
        required: false,
    },
    dataupload: {
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
module.exports = mongoose.model('biouploadtemplateinfo', uploadusertemplateinfoSchema);
