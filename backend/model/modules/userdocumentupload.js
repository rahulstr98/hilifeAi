const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userdocumentuploadSchema = new Schema({
  modulename: {
    type: String,
    required: false,
  },

  submodulename: {
    type: String,
    required: false,
  },
  mainpagename: {
    type: String,
    required: false,
  },
  subpagename: {
    type: String,
    required: false,
  },
  subsubpagename: {
    type: String,
    required: false,
  },
  employeename: {
    type: String,
    required: false,
  },
  access: {
    type: String,
    required: false,
  },
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
  date: {
    type: String,
    required: false,
  },

  uniqueId: {
    type: String,
    required: false,
  },
  files: {
    type: [String],
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
module.exports = mongoose.model('Userdocumentupload', userdocumentuploadSchema);
