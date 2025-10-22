const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BiometricPairedDevicesGroupingSchema = new Schema({
    company: {
        type: String,
        required: false,
    },
    branch: {
        type: String,
        required: false,
    },
    biometricdevicename: {
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
    paireddeviceone: {
        type: String,
        required: false,
    },
    pairedstatus: {
        type: Boolean,
        required: false,
    },
    paireddevicetwo: {
        type: String,
        required: false,
    },
    attendanceinone: {
        type: Boolean,
        required: false,
    },
    attendanceoutone: {
        type: Boolean,
        required: false,
    },
    attendanceinoutone: {
        type: Boolean,
        required: false,
    },
    exitinone: {
        type: Boolean,
        required: false,
    },
    exitoutone: {
        type: Boolean,
        required: false,
    },
    exitinoutone: {
        type: Boolean,
        required: false,
    },
    breakone: {
        type: Boolean,
        required: false,
    },
    breaktwo: {
        type: Boolean,
        required: false,
    },
     attendanceintwo: {
        type: Boolean,
        required: false,
    },
    attendanceouttwo: {
        type: Boolean,
        required: false,
    },
    attendanceinouttwo: {
        type: Boolean,
        required: false,
    },
    exitintwo: {
        type: Boolean,
        required: false,
    },
    exitouttwo: {
        type: Boolean,
        required: false,
    },
    exitinouttwo: {
        type: Boolean,
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
module.exports = mongoose.model("BiometricPairedDevicesGrouping", BiometricPairedDevicesGroupingSchema);
