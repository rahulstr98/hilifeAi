const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const remoteworkmodeSchema = new Schema({
    employeeid: {
        type: String,
        required: false
    },
    addremoteworkmode: [{


        wfhsystemtype: [String],
        wfhconfigurationdetails: {
            type: String,
            required: false,
        },
        withoutdetails: {
            type: Boolean,
            required: false,
        },
        wfhsetupphoto: [
            {
                filename: String,
                preview: String,
                name: String,
                path: String,
                mimetype: String,
            }
        ],
        workstationinput: {
            type: String,
            required: false,
        },


        internetnetworktype: [String],
        internetdailylimit: {
            type: String,
            required: false,
        },
        internetspeed: {
            type: String,
            required: false,
        },
        internetssidname: {
            type: String,
            required: false,
        },
        internetssidphoto: [
            {
                filename: String,
                preview: String,
                name: String,
                path: String,
                mimetype: String,
            }
        ],

        auditchecklistworkareasecure: {
            type: String,
            required: false,
        },

        auditchecklistwindowsongroundlevelworkarea: {
            type: String,
            required: false,
        },
        auditchecklistworkstationisstored: {
            type: String,
            required: false,
        },
        auditchecklistnoprivatelyowned: {
            type: String,
            required: false,
        },
        auditchecklistwifisecurity: {
            type: String,
            required: false,
        },
        updatename: {
            type: String,
            required: false,
        },
        updatetime: {
            type: String,
            required: false,
        },
        date: {
            type: String,
            required: false,
        },
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

    }]
});

module.exports = mongoose.model("RemoteWorkMode", remoteworkmodeSchema);