const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ShiftBreakHoursSchema = new Schema({
    shifthrs: {
        type: String,
        required: false,
    },
    shiftmins: {
        type: String,
        required: false,
    },
    breakhrs: {
        type: String,
        required: false,
    },
    breakmins: {
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
module.exports = mongoose.model('ShiftBreakHours', ShiftBreakHoursSchema);