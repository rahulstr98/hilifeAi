const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const typingPracticeResponseSchema = new Schema({



    company: {
        type: String,
        required: false,
    },
    branch: {
        type: String,
        required: false,
    },
    unit: {
        type: String,
        required: false,
    },
    team: {
        type: String,
        required: false,
    },
    department: {
        type: String,
        required: false,
    },
    employeename: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: false,
    },
    designation: {
        type: String,
        required: false,
    },

    category: {
        type: [String],
        required: false,
    },
    subcategory: {
        type: [String],
        required: false,
    },
    groupingid: {
        type: String,
        required: false,
    },
    overallresult: {
        type: Boolean,
        required: false,
    },
    employeedbid: {
        type: String,
        required: false,
    },
    result: [
        {
            question: {
                type: String,
                required: false,
            },
            questionid: {
                type: String,
                required: false,
            },
            accuracy: {
                type: String,
                required: false,
            },
            accuracystatus: {
                type: Boolean,
                required: false,
            },
            speed: {
                type: String,
                required: false,
            },
            speedstatus: {
                type: Boolean,
                required: false,
            },
            mistakes: {
                type: String,
                required: false,
            },
            mistakesstatus: {
                type: Boolean,
                required: false,
            },
            timetaken: {
                type: String,
                required: false,
            },
            actualtime: {
                type: String,
                required: false,
            },
            actualspeed: {
                type: String,
                required: false,
            },
            actualacuuracy: {
                type: String,
                required: false,
            },
            actualmistakes: {
                type: String,
                required: false,
            },
            individualresult: {
                type: Boolean,
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

    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('typingPracticeResponse', typingPracticeResponseSchema);