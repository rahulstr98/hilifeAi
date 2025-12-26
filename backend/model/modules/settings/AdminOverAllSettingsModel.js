const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const adminOverAllSettingsSchema = new Schema({
  faceverificationswitch: {
    type: Boolean,
    required: false,
  },
  overalltwofaswitch: {
    type: Boolean,
    required: false,
  },
  iprestrictionswitch: {
    type: Boolean,
    required: false,
  },
  mobilerestrictionswitch: {
    type: Boolean,
    required: false,
  },
  candidatedocumentemailtemplate: {
    type: String,
    required: false,
  },
  notificationswitch: {
    type: Boolean,
    required: false,
  },
  notificationimage: {
    type: String,
    required: false,
  },
  notificationdocument: {
    type: String,
    required: false,
  },

  notificationControl: {
    type: Boolean,
    required: false,
  },
  notificationfiletype: {
    type: String,
    required: false,
  },
  notificationsound: {
    type: String,
    required: false,
  },
  companykeyproducts: {
    type: Boolean,
    required: false,
  },
  hiconnectapikey: {
    type: String,
    required: false,
  },
  emaildomain: {
    type: String,
    required: false,
  },

  hiconnecturl: {
    type: String,
    required: false,
  },
  todoconnections: [
    {
      hiconnectapikey: {
        type: String,
        required: false,
      },
      hiconnecturl: {
        type: String,
        required: false,
      },
      statusdetail: {
        type: String,
        required: false,
      },
      apikeystatus: {
        type: Boolean,
        required: false,
      },
    },
  ],
  jobapplydays: {
    type: Number,
    required: false,
  },
  contactemail: {
    type: String,
    required: false,
  },
  loginapprestriction: {
    type: String,
    required: false,
  },
  externalloginapprestriction: {
    type: String,
    required: false,
  },
  bothloginapprestriction: {
    type: String,
    required: false,
  },
  companyawards: {
    type: Boolean,
    required: false,
  },
  jobrequirements: {
    type: Boolean,
    required: false,
  },
  jorolesresponsibility: {
    type: Boolean,
    required: false,
  },
  jobperks: {
    type: Boolean,
    required: false,
  },

  loginbyworkstation: {
    primary: {
      type: Boolean,
      required: false,
    },
    secondary: {
      type: Boolean,
      required: false,
    },
    wfh: {
      type: Boolean,
      required: false,
    },
    unauthorized: {
      type: Boolean,
      required: false,
    },
  },
  chatboxlink: {
    type: String,
    required: false,
  },
  companyname: {
    type: String,
    required: false,
  },
  companyshortname: {
    type: String,
    required: false,
  },
  companyfullname: {
    type: String,
    required: false,
  },
  todos: [
    {
      company: {
        type: String,
        required: false,
      },
      branch: {
        type: [String],
        required: false,
      },
      empcodedigits: {
        type: String,
        required: false,
      },
    },
  ],
  companylogo: {
    type: String,
    required: false,
  },
  companylogoshape: {
    type: String,
    required: false,
  },
  companydescription: {
    type: String,
    required: false,
  },
  repeatinterval: {
    type: Number,
    required: false,
  },
  emaildescription: {
    type: String,
    required: false,
  },
  subjectname: {
    type: String,
    required: false,
  },
  allkeyproducts: [String],
  allawardsrecognitions: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },

  loginrestrictionswitch: {
    type: Boolean,
    required: false,
  },
  autologoutswitch: {
    type: Boolean,
    required: false,
  },
  autologoutmins: {
    type: String,
    required: false,
  },
  empdigits: {
    type: Boolean,
    required: false,
  },
  empcodedigits: {
    type: String,
    required: false,
  },
  rolesandres: {
    type: String,
    required: false,
  },
  jobrequirementsAdd: {
    type: String,
    required: false,
  },
  jobbenefits: {
    type: String,
    required: false,
  },
  shiftstart: {
    type: String,
    required: false,
  },
  shiftend: {
    type: String,
    required: false,
  },
  advanceapprovalmonth: {
    type: String,
    required: false,
  },
  loanapprovalmonth: {
    type: String,
    required: false,
  },
  careerimg: {
    type: String,
    required: false,
  },
  bdaycompanylogo: {
    type: String,
    required: false,
  },
  bdayfootertext: {
    type: String,
    required: false,
  },
  bdaywishes: {
    type: String,
    required: false,
  },
  internalurl: {
    type: [String],
    required: false,
  },
  externalurl: {
    type: [String],
    required: false,
  },
  loginmode: {
    type: String,
    required: false,
  },
  listpageaccessmode: {
    type: String,
    required: false,
  },

  watermark: {
    type: String,
    required: false,
  },
  opacitywatermark: {
    type: Number,
    default: 0.05,
  },
  opacitytextwatermark: {
    type: String,
    default: 'Semi-transparent (20% visible)',
  },
  colorsandfonts: {
    navbgcolour: {
      type: String,
      default: '#1976d2',
    },
    navfontcolour: {
      type: String,
      default: '#ffffff',
    },
    companylogobfcolour: {
      type: String,
      default: '#1976d2',
    },
    submitbgcolour: {
      type: String,
      default: '#1976d2',
    },
    submitfontcolour: {
      type: String,
      default: '#ffffff',
    },
    clearcancelbgcolour: {
      type: String,
      default: '#f4f4f4',
    },
    clearcancelfontcolour: {
      type: String,
      default: '#444',
    },
    bulkdeletebgcolour: {
      type: String,
      default: '#d32f2f',
    },
    bulkdeletefontcolour: {
      type: String,
      default: '#ffffff',
    },
    editiconcolour: {
      type: String,
      default: '#1976d2',
    },
    deleteiconcolour: {
      type: String,
      default: '#1976d2',
    },
    viewiconcolour: {
      type: String,
      default: '#1976d2',
    },
    infoiconcolour: {
      type: String,
      default: '#1976d2',
    },
    pageheadingfontsize: {
      type: String,
      default: 'medium',
    },
  },

  quotainmb: {
    type: String,
    defalut: '60',
    required: false,
  },
  passwordupdatedays: {
    type: String,
    required: false,
  },
  passwordupdatealertdays: {
    type: String,
    required: false,
  },

  minimumlength: {
    type: String,
    required: false,
  },
  maximumlengh: {
    type: String,
    required: false,
  },
  uppercase: {
    type: String,
    required: false,
  },
  lowercase: {
    type: String,
    required: false,
  },
  specialcharacter: {
    type: String,
    required: false,
  },
  imageformat: {
    type: [String],
    required: false,
  },
  dimensionswidth: {
    type: String,
    required: false,
  },
  height: {
    type: String,
    required: false,
  },
  filesize: {
    type: String,
    required: false,
  },
  backgroundcolour: {
    type: String,
    default: '#ffffff',
  },
  elevatorswitch: {
    type: Boolean,
    required: false,
    default: false,
  },
  selectedfloors: {
    type: [Number],
    required: false,
    default: [],
  },
  selectall: {
    type: Boolean,
    required: false,
    default: false,
  },

  // addedby: [
  //     {
  //         name: {
  //             type: String,
  //             required: false,
  //         },
  //         date: {
  //             type: String,
  //             required: false,
  //         },

  //     }],
  // updatedby: [
  //     {
  //         name: {
  //             type: String,
  //             required: false,
  //         },
  //         date: {
  //             type: String,
  //             required: false,
  //         },

  //     }],
});
module.exports = mongoose.model('adminOverAllSettings', adminOverAllSettingsSchema);
