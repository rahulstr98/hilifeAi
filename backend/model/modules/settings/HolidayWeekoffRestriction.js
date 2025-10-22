const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const holidayWeekOffRestrictSchema = new Schema({
    companyname: {
        type: String,
        required: false
    },
    company: {
        type: String,
        required: false
    },
    branch: {
        type: String,
        required: false
    },
    unit: {
        type: String,
        required: false
    },
    team: {
        type: String,
        required: false
    },
    department: {
        type: String,
        required: false
    },
    designation: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    restriction: {
        type: Boolean,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
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


})

module.exports= mongoose.model('holidayweekoffrestriction' ,holidayWeekOffRestrictSchema )