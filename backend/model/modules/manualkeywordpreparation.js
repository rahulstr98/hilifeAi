const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// --- SubSubHeading Schema ---
const SubSubHeadingSchema = new Schema({
    title: { type: String, required: false },
    id: { type: String, required: false },
    description: { type: String, required: false },
});

// --- SubHeading Schema ---
const SubHeadingSchema = new Schema({
    title: { type: String, required: false },
    id: { type: String, required: false },
    description: { type: String, required: false },
    subSubHeadings: [SubSubHeadingSchema],
});

// --- Main Heading Schema ---
const HeadingSchema = new Schema({
    title: { type: String, required: false },
    id: { type: String, required: false },
    description: { type: String, required: false },
    subHeadings: [SubHeadingSchema],
});

const manualKeywordsPreparation = new Schema({
    keywordname: {
        type: String,
        required: false,
    },
    numberingstyle: {
        type: String,
        required: false,
    },
    headings: [HeadingSchema],
    value: {
        type: String,
        required: false,
    },
    previewdocument: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    file: {
        filename: { type: String, required: false },
        path: { type: String, required: false },
        mimetype: { type: String, required: false },
        size: { type: Number, required: false },
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
        },
    ],
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
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("manualKeywordsPreparation", manualKeywordsPreparation);