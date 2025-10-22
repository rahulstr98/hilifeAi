const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const organizationalunitSchema = new Schema({
  type: {
    type: String,
    required: false,
  },
  name: {
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
module.exports = mongoose.model('organizationalunit', organizationalunitSchema);
