const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UnitrateManualApprovalSchema = new Schema({
  project: {
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
  mrate: {
    type: String,
    required: false,
  },
  points: {
    type: String,
    required: false,
  },
  isedited: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("UnitrateManualApproval", UnitrateManualApprovalSchema);