const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attandanceSchema = new Schema({
    clockintime: {
        type: String,
        required: false,
    },
    clockouttime: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
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
    profileimage:{
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

})


module.exports = mongoose.model('Faceapprecord', attandanceSchema);