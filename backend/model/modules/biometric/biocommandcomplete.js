const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const biocommandcompleteSchema = new Schema({
    deviceCommandN: {
        type: Number,
        required: false,
    },
    CloudIDC: {
        type: String,
        required: false,
    },
    biometricUserIDC: {
        type: String,
        required: false,
    },
    param1C: {
        type: String,
        required: false,
    },
    param2C: {
        type: String,
        required: false,
    },
    StatusC: {
        type: String,
        required: false,
    },
    biometricUserIDC: {
        type: String,
        required: false,
    },
    deviceCommandN: {
        type: String,
        required: false,
    },
    description: {
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
module.exports = mongoose.model('biocommandcomplete', biocommandcompleteSchema);
