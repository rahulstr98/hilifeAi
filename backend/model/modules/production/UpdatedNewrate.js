const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UploadNewrateSchema = new Schema({
  newrate: {
    type: Number,
    required: false,
  },
  vendor: {
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
});
module.exports = mongoose.model('updatednewrates', UploadNewrateSchema);