const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const InteractorModeSchema = new Schema({
  name: {
    type: String,
    required: false,
  },
  prevprojectname: {
    type: String,
    required: false,
  },
  addcandidate: {
    type: Boolean,
    required: false,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('interactormode', InteractorModeSchema);
