const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mssqlSchema = new Schema({


    Punch_Tag: {
        type: String,
        required: false,
    },
    Dev_Direction: {
        type: String,
        required: false,
    },
    Emp_id: {
        type: String,
        require: false,
    },
    temperature: {
        type: String,
        require: false,
    },
    remarks: {
        type: String,
        require: false,
    },
    Punch_RawDate: {
        type: String,
        required: false,
    },
    Punch_Img: {
        type: String,
        required: false,
    },

    sno_id: {
        type: String,
        required: false,
    },
    Apl_userid: {
        type: String,
        required: false,
    },
    att_status: {
        type: String,
        required: false,
    },
    Card_Number: {
        type: String,
        required: false,
    },
    Att_PunchRecDate: {
        type: String,
        required: false,
    },
    antipass: {
        type: String,
        require: false,
    },
    Punch_month: {
        type: String,
        required: false,
    },
    Dev_Id: {
        type: String,
        require: false,
    },
    Dev_Location: {
        type: String,
        require: false,
    },
    Att_PunchDownDate: {
        type: String,
        require: false,
    },
    Dev_Verify: {
        type: String,
        require: false,
    },
    Aprved_Tag: {
        type: String,
        require: false,
    },
    tran_id: {
        type: String,
        require: false,
    },
    comp_id: {
        type: String,
        require: false,
    },

    employee_id: {
        type: String,
        require: false,
    },
    employee_code: {
        type: String,
        require: false,
    },
    employee_fname: {
        type: String,
        require: false,
    },
    employee_lname: {
        type: String,
        require: false,
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
module.exports = mongoose.model("biometricdata", mssqlSchema);