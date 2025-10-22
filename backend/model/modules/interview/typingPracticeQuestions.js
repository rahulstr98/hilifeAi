const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TypingPracticeQuestionSchema = new Schema({
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
    typingspeed: {
        type: String,
        required: false,
    },
    typingspeedvalidation: {
        type: String,
        required: false,
    },
    typingspeedfrom: {
        type: String,
        required: false,
    },
    typingspeedto: {
        type: String,
        required: false,
    },
    typingspeedstatus: {
        type: String,
        required: false,
    },

    typingaccuracy: {
        type: String,
        required: false,
    },
    typingaccuracyvalidation: {
        type: String,
        required: false,
    },
    typingaccuracyfrom: {
        type: String,
        required: false,
    },
    typingaccuracyto: {
        type: String,
        required: false,
    },
    typingaccuracystatus: {
        type: String,
        required: false,
    },

    typingmistakes: {
        type: String,
        required: false,
    },
    typingmistakesvalidation: {
        type: String,
        required: false,
    },
    typingmistakesfrom: {
        type: String,
        required: false,
    },
    typingmistakesto: {
        type: String,
        required: false,
    },
    typingmistakesstatus: {
        type: String,
        required: false,
    },

    typingduration: {
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
module.exports = mongoose.model('typingPracticeQuestion', TypingPracticeQuestionSchema);