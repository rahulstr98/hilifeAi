const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ldapsettingSchema = new Schema({
  ldapurl: {
    type: String,
    required: false,
  },
  cnname: {
    type: String,
    required: false,
  },
  useraccountcontrol: {
    type: String,
    required: false,
  },
  cnnametwo: {
    type: String,
    required: false,
  },
  dcnameone: {
    type: String,
    required: false,
  },
  dcnametwo: {
    type: String,
    required: false,
  },
  ldappassword: {
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
module.exports = mongoose.model('ldapsetting', ldapsettingSchema);
