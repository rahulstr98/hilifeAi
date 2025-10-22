const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tasksubcategorySchema = new Schema({
  subcategoryname: {
    type: String,
    required: false,
  },

  category: {
    type: String,
    required: false,
  },
    moduleSelect: {
    type: Boolean,
    required: false,
  },
  module: {
    type: String,
    required: false,
  },
  submodule: {
    type: String,
    required: false,
  },
  mainpage: {
    type: String,
    required: false,
  },
  subpage: {
    type: String,
    required: false,
  },
  subsubpage: {
    type: String,
    required: false,
  },
  description: {
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
module.exports = mongoose.model("Tasksubcategory", tasksubcategorySchema);
