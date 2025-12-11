const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ManagetypepurposegroupingSchema = new Schema({
  interactorstype: {
    type: String,
    required: false,
  },
  interactorspurpose: {
    type: [String],
    required: false,
  },
  addcandidate: {
    type: Boolean,
    required: false,
  },
  requestdocument: {
    type: Boolean,
    required: false,
  },
  duedays: {
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
module.exports = mongoose.model('Managetypepurposegrouping', ManagetypepurposegroupingSchema);
