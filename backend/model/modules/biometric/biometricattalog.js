const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const biometricattlogSchema = new Schema({

    biometricUserIDC: {
        type: String,
        required: false,
    },
    clockDateTimeD: {
        type: String,
        required: false,
    },
    cloudIDC: {
        type: String,
        required: false,
    },
    machineNoN: {
        type: Number,
        required: false,
    },
    workCodeN: {
        type: Number,
        required: false,
    },
    statusC: {
        type: String,
        required: false,
    },
    verifyC: {
        type: String,
        required: false,
    },
    staffNameC: {
        type: String,
        required: false,
    },
    photoC: {
        type: String,
        required: false,
    },
    reserved1C: {
        type: String,
        required: false,
    },
    reserved2C: {
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

biometricattlogSchema.index(
  { clockDateTimeD: 1, staffNameC: 1, biometricUserIDC: 1, cloudIDC: 1 },
  { unique: true }
);
module.exports = mongoose.model('biometricattlog', biometricattlogSchema);
