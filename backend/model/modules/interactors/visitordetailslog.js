const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VisitordetailsLog = new Schema({
    visitorname: {
        type: String,
        required: false,
    },
    visitorcontactnumber: {
        type: String,
        required: false,
    },
    visitoremail: {
        type: String,
        required: false,
    },
    materialcarrying: [String],
    visitorcommonid: {
        type: String,
        required: false
    },
    files: [
        {

            name: {
                type: String,
                required: false,
            },
            preview: {
                type: String,
                required: false,
            },
            size: {
                type: String,
                required: false,
            },
            type: {
                type: String,
                required: false,
            },
        },
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
module.exports = mongoose.model("visitorddetailslog", VisitordetailsLog);
