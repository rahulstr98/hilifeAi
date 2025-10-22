const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ebreadingdetailSchema = new Schema({
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
  floor: {
    type: String,
    required: false,
  },
  area: {
    type: String,
    required: false,
  },


  usercompany: {
    type: String,
    required: false,
  },
  userbranch: {
    type: String,
    required: false,
  },
    userunit: {
    type: String,
    required: false,
  },
    userteam: {
    type: String,
    required: false,
  },
    userdepartment: {
    type: String,
    required: false,
  },
  userdesignation: {
    type: String,
    required: false,
  },
  usercompanyname: {
    type: String,
    required: false,
  },
   usershift: {
    type: String,
    required: false,
  },
   usershifttype: {
    type: String,
    required: false,
  },


  usageunit: {
    type: String,
    required: false,
  },
  currentusageunit: {
    type: String,
    required: false,
  },
  currentstatus: {
    type: String,
    required: false,
  },
  servicenumber: {
    type: String,
    required: false,
  },
  readingmode: {
    type: String,
    required: false,
  },
  date: {
    type: String,
    required: false,
  },
  enddate: {
    type: String,
    required: false,
  },
  time: {
    type: String,
    required: false,
  },
  // kwhreading: {
  //     type: String,
  //     required: false,
  // },
  openkwh: {
    type: String,
    required: false,
  },
  kvah: {
    type: String,
    required: false,
  },
  kwhunit: {
    type: String,
    required: false,
  },
  kvahunit: {
    type: String,
    required: false,
  },
  pf: {
    type: String,
    required: false,
  },
  md: {
    type: String,
    required: false,
  },
  pfrphase: {
    type: String,
    required: false,
  },
  pfyphase: {
    type: String,
    required: false,
  },
  pfbphase: {
    type: String,
    required: false,
  },
  pfcurrent: {
    type: String,
    required: false,
  },
  pfaverage: {
    type: String,
    required: false,
  },
  mdrphase: {
    type: String,
    required: false,
  },
  mdyphase: {
    type: String,
    required: false,
  },
  mdbphase: {
    type: String,
    required: false,
  },
  mdcurrent: {
    type: String,
    required: false,
  },
  mdaverage: {
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
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, floor: 1, servicenumber: 1, readingmode: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, servicenumber: 1, readingmode: 1, currentstatus: 1, date: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, area: 1, servicenumber: 1, readingmode: 1, time: 1, date: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, area: 1, servicenumber: 1, readingmode: 1, time: 1, date: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, area: 1, servicenumber: 1, readingmode: 1, time: 1, date: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, area: 1, servicenumber: 1, readingmode: 1, time: 1, date: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, area: 1, servicenumber: 1, readingmode: 1, date: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, area: 1, servicenumber: 1, readingmode: 1, time: 1, date: 1 });
ebreadingdetailSchema.index({ company: 1, branch: 1, unit: 1, floor: 1, area: 1, servicenumber: 1, readingmode: 1, date: 1 });
ebreadingdetailSchema.index({ servicenumber: 1 });
module.exports = mongoose.model('Ebreadingdetail', ebreadingdetailSchema);