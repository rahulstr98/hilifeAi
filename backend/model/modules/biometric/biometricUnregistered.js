const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BiometricUnregisteredSchema = new Schema({
    biometricUserIDC: {
        type: String,
        required: false,
    },
    dateformat: {
        type: String,
        required: false,
    },
    clockDateTimeD: {
        type: String,
        required: false,
    },
    verifyC: {
        type: String,
        required: false,
    },
    cloudIDC: {
        type: String,
        required: false,
    },
    photourl: {
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
module.exports = mongoose.model("BiometricUnregistered", BiometricUnregisteredSchema);
