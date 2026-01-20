const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MAX_EXPIRY_UNIX = 4102444740;
const uploaduserinfoSchema = new Schema({
  cloudIDC: {
    type: String,
    required: false,
  },
  biometricUserIDC: {
    type: String,
    required: false,
  },
  dataupload: {
    type: String,
    required: false,
  },
  staffNameC: {
    type: String,
    required: false,
  },
  rfidc: {
    type: String,
    required: false,
  },
  pwdc: {
    type: String,
    required: false,
  },
  fingerCountN: {
    type: Number,
    required: false,
  },
  downloadedFingerTemplateN: {
    type: Number,
    required: false,
  },
  isFaceEnrolledC: {
    type: String,
    required: false,
  },
  datastatus: {
    type: String,
    required: false,
  },
  deviceBrand: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  downloadedFaceTemplateN: {
    type: Number,
    required: false,
  },
  privilegeC: {
    type: String,
    required: false,
  },
  startdate: {
    type: String,
    required: false,
  },
  expirytime: {
    type: String,
    required: false,
  },
  isEnabledC: {
    type: String,
    required: false,
  },
  companyname: {
    type: String,
    required: false,
  },
  visitorCreatedDate: {
    type: String,
    required: false,
  },
  visitorintime: {
    type: String,
    required: false,
  },
  userstatus: {
    type: String,
    required: false,
  },
  visitoremail: {
    type: String,
    required: false,
  },
  visitorcontactnumber: {
    type: String,
    required: false,
  },
  visitorpage: {
    type: String,
    required: false,
  },
  visitorpagedetails: {
    type: String,
    required: false,
  },
  visitorid: {
    type: String,
    required: false,
  },
  photoImage: {
    type: String,
    required: false,
  },
  PhotoMD5: {
    type: String,
    required: false,
  },
  cardNum: {
    type: String,
    required: false,
  },
  elevatorAccess: {
    type: String,
    required: false,
  },
  expirationTime: {
    type: Number, // unix timestamp (seconds)
    default: MAX_EXPIRY_UNIX,
    min: 0,
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
module.exports = mongoose.model("biouploaduserinfo", uploaduserinfoSchema);
