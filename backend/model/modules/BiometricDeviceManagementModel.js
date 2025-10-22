const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BiometricdevicemanagementSchema = new Schema({
    company: {
        type: String,
        required: false,
    },
    isVisitor: {
        type: Boolean,
        default: false
    },
    branch: {
        type: String,
        required: false,
    },
    biometriccommonname: {
        type: String,
        required: false,
    },
    mode: {
        type: String,
        required: false,
    },
    brand: {
        type: String,
        required: false,
    },
    model: {
        type: String,
        required: false,
    },
    unit: {
        type: String,
        required: false,
    },
    floor: {
        type: String,
        required: false,
    },
    area: {
        type: String,
        required: false,
    },
    biometricdeviceid: {
        type: String,
        required: false,
    },
    biometricserialno: {
        type: String,
        required: false,
    },
    biometricassignedip: {
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
module.exports = mongoose.model("Biometricdevicemanagement", BiometricdevicemanagementSchema);
