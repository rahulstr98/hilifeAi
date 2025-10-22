const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const employeesignatureSchema = new Schema({
    empcode: {
        type: String,
        required: false,
    },
    commonid: {
        type: String,
        required: false,
    },
    commonsignatureid: {
        type: String,
        required: false,
    },
    companyname: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: false,
    },
    profileimage: {
        type: String,
        required: false,
    },
    signatureimage: {
        type: String,
        required: false,
    },
    files: [
        {
            data: {
                type: String,
                required: false,
            },
            name: {
                type: String,
                required: false,
            },
            orginpath: {
                type: String,
                required: false,
            },
            documentid: {
                type: String,
                required: false,
            },
            preview: {
                type: String,
                required: false,
            },
            remark: {
                type: String,
                required: false,
            },
        },
    ],

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

module.exports = mongoose.model("employeesignature", employeesignatureSchema);