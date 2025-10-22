const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SoftwarespecificationSchema = new Schema({
  name: {
    type: String,
    required: false,
  },
  type: {
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

SoftwarespecificationSchema.index({
  type: 1,
  name: 1,
})

module.exports = mongoose.model("Softwarespecification", SoftwarespecificationSchema);
