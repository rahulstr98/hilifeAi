const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const documentPreparationSchema = new Schema({
  date: {
    type: String,
    required: false,
  },
  marginQuill: {
    type: String,
    required: false,
  },
  manualdate: {
    type: String,
    required: false,
  },
  orientationQuill: {
    type: String,
    required: false,
  },
  pagesizeQuill: {
    type: String,
    required: false,
  },
  documentname: {
    type: String,
    required: false,
  },
  documentneed: {
    type: String,
    required: false,
  },
  printoptions: {
    type: String,
    required: false,
  },
  printedcount: {
    type: Number,
    required: false,
  },
  frommailemail: {
    type: String,
    required: false,
  },
  approval: {
    type: String,
    required: false,
  },
  approvalsentdate: {
    type: String,
    required: false,
  },
  approvedby: {
    type: String,
    required: false,
  },
  approveddate: {
    type: String,
    required: false,
  },
  approvalstartdate: {
    type: String,
    required: false,
  },
  approvalenddate: {
    type: String,
    required: false,
  },
  termsAndConditons: {
    type: [String],
    required: false,
  },
  approvedfilename: {
    type: String,
    required: false,
  },
  qrcode: {
    type: String,
    required: false,
  },
  printingstatus: {
    type: String,
    required: false,
  },
  pagenumberneed: {
    type: String,
    required: false,
  },
  signatureneed: {
    type: String,
    required: false,
  },
  topcontent: {
    type: String,
    required: false,
  },
  bottomcontent: {
    type: String,
    required: false,
  },
  usersignature: {
    type: String,
    required: false,
  },
  signaturetype: {
    type: String,
    required: false,
  },
  qrcodevalue: {
    type: String,
    required: false,
  },
  qrCodeNeed: {
    type: Boolean,
    required: false,
  },
  watermark: {
    type: String,
    required: false,
  },
  pagesize: {
    type: String,
    required: false,
  },
  pageheight: {
    type: String,
    required: false,
  },
  pagewidth: {
    type: String,
    required: false,
  },
  template: {
    type: String,
    required: false,
  },
  templateno: {
    type: String,
    required: false,
  },
  document: {
    type: String,
    required: false,
  },
  referenceno: {
    type: String,
    required: false,
  },
  employeemode: {
    type: String,
    required: false,
  },
  department: {
    type: String,
    required: false,
  },
  company: {
    type: String,
    required: false,
  },
  issuingauthority: {
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
  person: {
    type: String,
    required: false,
  },
  print: {
    type: String,
    required: false,
  },
  proption: {
    type: String,
    required: false,
  },
  pagesize: {
    type: String,
    required: false,
  },
  head: {
    type: String,
    required: false,
  },
  foot: {
    type: String,
    required: false,
  },
  headvalue: {
    type: [String],
    required: false,
  },
  signature: {
    type: String,
    required: false,
  },
  tempcode: {
    type: String,
    required: false,
  },
  sign: {
    type: String,
    required: false,
  },
  sealing: {
    type: String,
    required: false,
  },
  seal: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  mail: {
    type: String,
    required: false,
  },
  issuedpersondetails: {
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
      localip: {
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
module.exports = mongoose.model("documentPreparation", documentPreparationSchema);