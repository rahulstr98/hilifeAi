const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subcategoryProdSchema = new Schema({
  project: {
    type: String,
    required: false,
  },
  // vendorname: {
  //     type: [String],
  //     required: false,
  // },
  categoryname: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  mode: {
    type: String,
    required: false,
  },
  production: {
    type: String,
    required: false,
  },
  mismatchmode: {
    type: [String],
    required: false,
  },
  enablepage: {
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
module.exports = mongoose.model("SubcategoryProd", subcategoryProdSchema);