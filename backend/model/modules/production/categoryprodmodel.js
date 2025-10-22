const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const categoryProdSchema = new Schema({
  project: {
    type: String,
    required: false,
  },
  vendorname: {
    type: [String],
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  production: {
    type: String,
    required: false,
  },
  keyword: {
    type: [String],
    required: false,
  },
  flagstatus: {
    type: String,
    required: false,
  },
  flagstatusorg: {
    type: String,
    required: false,
  },
  flagstatustemp: {
    type: String,
    required: false,
  },

  flagmanualcalctemp: {
    type: String,
    required: false,
  },

  flagmanualcalcorg: {
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
 
mrateprimary:[{
 keyword: {
    type: String,
    required: false,
  },
  matchcase: {
    type: String,
    required: false,
  },
  mrate:{
    type: String,
    required: false,
  },
}],
  
  mratesecondary:[{
    keyword: {
       type: String,
       required: false,
     },
     mrate:{
       type: String,
       required: false,
     },
   }],
  mratereconcile:[{
    keyword: {
       type: String,
       required: false,
     },
     mrate:{
       type: String,
       required: false,
     },
   }],
  
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
module.exports = mongoose.model("CategoryProd", categoryProdSchema);
