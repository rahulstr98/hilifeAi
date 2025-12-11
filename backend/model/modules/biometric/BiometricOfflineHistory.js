const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const biometricOfflineHistorySchema = new Schema({
cloudIDC: String,
deviceNameID:{ type: mongoose.Schema.Types.ObjectId, ref: "Biometricdevicemanagement" }, 
    date: String, // yyyy-mm-dd
    offlineHistory: [
        {
            lastOnline: String,
            offlineTime: String // updated on further cron runs
        }
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
module.exports = mongoose.model('biometricofflinehistory', biometricOfflineHistorySchema);