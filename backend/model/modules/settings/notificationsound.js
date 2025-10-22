const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notificationSoundSchema = new Schema({
    sound: {
        type: String,
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
module.exports = mongoose.model('notificationSound', notificationSoundSchema);