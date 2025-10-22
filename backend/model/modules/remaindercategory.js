const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const remainderCategorySchema = new Schema({
    categoryname: {
        type: String,
        required: false,
    },
    subcategoryname: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    addedby: [
        {
            name: {
                type: String,
                required: false,
            },
            date: {
                type: Date,
                default: Date.now,
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
                type: Date,
                default: Date.now,
            },
        },
    ],
});
module.exports = mongoose.model('Remaindercategory', remainderCategorySchema);
