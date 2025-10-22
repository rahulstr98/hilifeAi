const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attandanceSchema = new Schema({
    username: {
        type: String,
        required: false,
    },
    shiftendtime: {
        type: String,
        required: false,
    },
    shiftmode: {
        type: String,
        required: false,
    },
    clockintime: {
        type: String,
        required: false,
    },
    clockouttime: {
        type: String,
        required: false
    },
    totalhours: {
        type: String,
        required: false
    },
    buttonstatus: {
        type: String,
        required: false
    },
    shiftname: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    calculatedshiftend: {
        type: String,
        required: false,
    },
    clockinipaddress: {
        type: String,
        required: false
    },
    clockoutipaddress: {
        type: String,
        required: false
    },
    userid: {
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        required: false
    },
    today: {
        type: String,
        required: false
    },
    timedifference: {
        type: String,
        required: false
    },
    endtime: {
        type: String,
        required: false
    },
    autoclockout: {
        type: Boolean,
        required: false
    },
    attendancemanual: {
        type: Boolean,
        required: false
    },
    attendancestatus: {
        type: String,
        required: false,
    },
    shiftmode: {
        type: String,
        required: false,
    },
    weekoffpresentstatus: {
        type: Boolean,
        required: false,
    },
    bulkupdateclockinstatus: {
        type: Boolean,
        required: false,
    },
    bulkupdateclockoutstatus: {
        type: Boolean,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

})
attandanceSchema.index({ userid: 1, date: 1 });
attandanceSchema.index({ date: 1 })
// for attendance
attandanceSchema.index({
    username: 1,
    date: 1,
    userid: 1,
    createdAt: 1
})
// for attendance controller
attandanceSchema.index({
    userid: 1,
    status: 1,
    date: 1,
    shiftmode: 1,
    buttonstatus: 1,
    bulkupdateclockinstatus: 1,
    bulkupdateclockoutstatus: 1,
    clockouttime: 1,
    calculatedshiftend: 1,
    autoclockout: 1,
})
module.exports = mongoose.model('Attandance', attandanceSchema);
