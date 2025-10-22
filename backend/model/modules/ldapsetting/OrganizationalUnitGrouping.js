const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const organizationalunitgroupingSchema = new Schema({
  type: {
    type: String,
    required: false,
  },
  workmode: {
    type: String,
    required: false,
  },
  company: {
    type: [String],
    required: false,
  },
  branch: {
    type: [String],
    required: false,
  },
  unit: {
    type: [String],
    required: false,
  },
  team: {
    type: [String],
    required: false,
  },
  department: {
    type: [String],
    required: false,
  },
  designation: {
    type: [String],
    required: false,
  },
  process: {
    type: [String],
    required: false,
  },
  shiftgrouping: {
    type: [String],
    required: false,
  },
  shifttiming: {
    type: [String],
    required: false,
  },
  employee: {
    type: [String],
    required: false,
  },
  organizationalunit: {
    type: String,
    required: false,
  },
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
module.exports = mongoose.model('organizationalunitgrouping', organizationalunitgroupingSchema);
