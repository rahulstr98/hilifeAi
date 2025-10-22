const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const InterviewVerificationSchema = new Schema({
    candidatestatusexp: {
        type: [String],
        required: false,
    },
    workmode: {
        type: [String],
        required: false,
    },

    mode: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false,
    },
    subcategory: {
        type: String,
        required: false,
    },
    question: {
        type: String,
        required: false,
    },

    optionsArray: [
        {
            status: {
                type: String,
                required: false,
            },
            options: {
                type: String,
                required: false,
            },

        }],

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
module.exports = mongoose.model('InterviewVerification', InterviewVerificationSchema);