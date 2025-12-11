const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VisitorsSchema = new Schema({
  salarytable: [
    {
      mimetype: {
        type: String,
        required: false,
      },
      filename: {
        type: String,
        required: false,
      },
      filesize: {
        type: String,
        required: false,
      },
      onboardas: {
        type: String,
        required: false,
      },
      salarystatus: {
        type: String,
        required: false,
      },
      movetolive: {
        type: Boolean,
        required: false,
      },
      basic: {
        type: Number,
        required: false,
      },
      hra: {
        type: Number,
        required: false,
      },
      conveyance: {
        type: Number,
        required: false,
      },
      medicalallowance: {
        type: Number,
        required: false,
      },
      productionallowance: {
        type: Number,
        required: false,
      },
      shiftallowance: {
        type: Number,
        required: false,
      },
      grossmonthsalary: {
        type: Number,
        required: false,
      },
      annualgrossctc: {
        type: Number,
        required: false,
      },
      otherallowance: {
        type: Number,
        required: false,
      },
      performanceincentive: {
        type: Number,
        required: false,
      },
    },
  ],
  directonboardingdetails: {
    employeeid: {
      type: String,
      required: false,
    },
    onboardby: {
      type: String,
      required: false,
    },
    onboardat: {
      type: String,
      required: false,
    },
  },
  exemployeeid: {
    type: String,
    required: false,
  },
  finalstatus: {
    type: String,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
  pgenerateviapincode: {
    type: Boolean,
    required: false,
  },
  pvillageorcity: {
    type: String,
    required: false,
  },
  pdistrict: {
    type: String,
    required: false,
  },
  cgenerateviapincode: {
    type: Boolean,
    required: false,
  },
  cvillageorcity: {
    type: String,
    required: false,
  },
  cdistrict: {
    type: String,
    required: false,
  },
  addesstype: {
    type: String,
    required: false,
  },
  personalprefix: {
    type: String,
    required: false,
  },
  referencename: {
    type: String,
    required: false,
  },
  landmarkpositionprefix: {
    type: String,
    required: false,
  },
  landmarkname: {
    type: String,
    required: false,
  },
  houseflatnumber: {
    type: String,
    required: false,
  },
  streetroadname: {
    type: String,
    required: false,
  },
  localityareaname: {
    type: String,
    required: false,
  },
  pcountry: {
    type: String,
    required: false,
  },
  pstate: {
    type: String,
    required: false,
  },
  pbuildingapartmentname: {
    type: String,
    required: false,
  },
  paddressone: {
    type: String,
    required: false,
  },
  paddresstwo: {
    type: String,
    required: false,
  },
  paddressthree: {
    type: String,
    required: false,
  },
  caddressone: {
    type: String,
    required: false,
  },
  caddresstwo: {
    type: String,
    required: false,
  },
  caddressthree: {
    type: String,
    required: false,
  },
  ppost: {
    type: String,
    required: false,
  },
  cpost: {
    type: String,
    required: false,
  },
  ptaluk: {
    type: String,
    required: false,
  },
  ctaluk: {
    type: String,
    required: false,
  },
  cbuildingapartmentname: {
    type: String,
    required: false,
  },
  pcity: {
    type: String,
    required: false,
  },
  ppincode: {
    type: String,
    required: false,
  },
  gpscoordinate: {
    type: String,
    required: false,
  },
  //currentAddress
  samesprmnt: {
    type: Boolean,
    required: false,
  },
  caddesstype: {
    type: String,
    required: false,
  },
  cpersonalprefix: {
    type: String,
    required: false,
  },
  creferencename: {
    type: String,
    required: false,
  },
  clandmarkpositionprefix: {
    type: String,
    required: false,
  },
  clandmarkname: {
    type: String,
    required: false,
  },
  chouseflatnumber: {
    type: String,
    required: false,
  },
  cstreetroadname: {
    type: String,
    required: false,
  },
  clocalityareaname: {
    type: String,
    required: false,
  },
  ccountry: {
    type: String,
    required: false,
  },
  cstate: {
    type: String,
    required: false,
  },
  ccity: {
    type: String,
    required: false,
  },
  cpincode: {
    type: String,
    required: false,
  },
  cgpscoordinate: {
    type: String,
    required: false,
  },
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
  visitorid: {
    type: String,
    required: false,
  },
  visitorcommonid: {
    type: String,
    required: false,
  },
  visitortype: {
    type: String,
    required: false,
  },
  visitormode: {
    type: String,
    required: false,
  },
  date: {
    type: String,
    required: false,
  },
  requestvisitorfollowupdate: {
    type: String,
    required: false,
  },

  requestvisitorfollowaction: {
    type: String,
    required: false,
  },
  requestfollowupactionupdate: {
    type: String,
    required: false,
  },
  requestfollowupactionuptime: {
    type: String,
    required: false,
  },

  prefix: {
    type: String,
    required: false,
  },
  visitorname: {
    type: String,
    required: false,
  },
  intime: {
    type: String,
    required: false,
  },
  visitorpurpose: {
    type: String,
    required: false,
  },
  visitorcontactnumber: {
    type: String,
    required: false,
  },
  visitoremail: {
    type: String,
    required: false,
  },
  visitorcompnayname: {
    type: String,
    required: false,
  },
  documenttype: {
    type: String,
    required: false,
  },
  documentnumber: {
    type: String,
    required: false,
  },
  meetingdetails: {
    type: Boolean,
    required: false,
  },
  meetingpersoncompany: {
    type: [String],
    required: false,
  },
  meetingpersonbranch: {
    type: [String],
    required: false,
  },
  meetingpersonunit: {
    type: [String],
    required: false,
  },
  meetingpersondepartment: {
    type: [String],
    required: false,
  },
  meetingpersonteam: {
    type: [String],
    required: false,
  },
  meetingpersonemployeename: {
    type: String,
    required: false,
  },
  meetinglocationcompany: {
    type: [String],
    required: false,
  },
  meetinglocationbranch: {
    type: [String],
    required: false,
  },
  meetinglocationunit: {
    type: [String],
    required: false,
  },
  meetinglocationfloor: {
    type: [String],
    required: false,
  },
  meetinglocationarea: {
    type: String,
    required: false,
  },
  enquiredbranchnumber: {
    type: String,
    required: false,
  },
  enquiredbranchemail: {
    type: String,
    required: false,
  },
  escortinformation: {
    type: Boolean,
    required: false,
  },
  escortdetails: {
    type: String,
    required: false,
  },
  equipmentborrowed: {
    type: String,
    required: false,
  },
  outtime: {
    type: String,
    required: false,
  },
  remark: {
    type: String,
    required: false,
  },
  followupaction: {
    type: String,
    required: false,
  },
  followupdate: {
    type: String,
    required: false,
  },
  followuptime: {
    type: String,
    required: false,
  },
  visitorbadge: {
    type: String,
    required: false,
  },
  visitorsurvey: {
    type: String,
    required: false,
  },
  detailsaddedy: {
    type: String,
    required: false,
  },
  interactorstatus: {
    type: String,
    required: false,
  },

  visitorfirstname: {
    type: String,
    required: false,
  },
  enquirystatusforinteractorstatus: {
    type: Boolean,
    required: false,
  },
  requestvisitorfollowupstatus: {
    type: Boolean,
    required: false,
  },
  visitorlastname: {
    type: String,
    required: false,
  },
  visitorcontactnumber: {
    type: String,
    required: false,
  },
  visitoremail: {
    type: String,
    required: false,
  },
  visitorwhatsapp: {
    type: String,
    required: false,
  },
  visitorphonecheck: {
    type: Boolean,
    required: false,
  },
  addvisitorin: {
    type: Boolean,
    required: false,
  },
  visitoroutentry: {
    type: Boolean,
    required: false,
  },
  addcandidate: {
    type: Boolean,
    required: false,
  },
  checkout: {
    type: Boolean,
    required: false,
  },
  unique: {
    type: Number,
    required: false,
  },

  files: [
    {
      base64: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      preview: {
        type: String,
        required: false,
      },
      size: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
      },
    },
  ],

  followuparray: [
    {
      visitordocument: [
        {
          data: {
            type: String,
            required: false,
          },

          preview: {
            type: String,
            required: false,
          },
          remark: {
            type: String,
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
          filename: {
            type: String,
            required: false,
          },
          filesize: {
            type: String,
            required: false,
          },
          remark: {
            type: String,
            required: false,
          },
          mimetype: {
            type: String,
            required: false,
          },
        },
      ],
      pgenerateviapincode: {
        type: Boolean,
        required: false,
      },
      pvillageorcity: {
        type: String,
        required: false,
      },
      pdistrict: {
        type: String,
        required: false,
      },
      cgenerateviapincode: {
        type: Boolean,
        required: false,
      },
      cvillageorcity: {
        type: String,
        required: false,
      },
      cdistrict: {
        type: String,
        required: false,
      },
      addesstype: {
        type: String,
        required: false,
      },
      personalprefix: {
        type: String,
        required: false,
      },
      referencename: {
        type: String,
        required: false,
      },
      landmarkpositionprefix: {
        type: String,
        required: false,
      },
      landmarkname: {
        type: String,
        required: false,
      },
      houseflatnumber: {
        type: String,
        required: false,
      },
      streetroadname: {
        type: String,
        required: false,
      },
      localityareaname: {
        type: String,
        required: false,
      },
      pcountry: {
        type: String,
        required: false,
      },
      pstate: {
        type: String,
        required: false,
      },
      pbuildingapartmentname: {
        type: String,
        required: false,
      },
      paddressone: {
        type: String,
        required: false,
      },
      paddresstwo: {
        type: String,
        required: false,
      },
      paddressthree: {
        type: String,
        required: false,
      },
      caddressone: {
        type: String,
        required: false,
      },
      caddresstwo: {
        type: String,
        required: false,
      },
      caddressthree: {
        type: String,
        required: false,
      },
      ppost: {
        type: String,
        required: false,
      },
      cpost: {
        type: String,
        required: false,
      },
      ptaluk: {
        type: String,
        required: false,
      },
      ctaluk: {
        type: String,
        required: false,
      },
      cbuildingapartmentname: {
        type: String,
        required: false,
      },
      pcity: {
        type: String,
        required: false,
      },
      ppincode: {
        type: String,
        required: false,
      },
      gpscoordinate: {
        type: String,
        required: false,
      },
      //currentAddress
      samesprmnt: {
        type: Boolean,
        required: false,
      },
      caddesstype: {
        type: String,
        required: false,
      },
      cpersonalprefix: {
        type: String,
        required: false,
      },
      creferencename: {
        type: String,
        required: false,
      },
      clandmarkpositionprefix: {
        type: String,
        required: false,
      },
      clandmarkname: {
        type: String,
        required: false,
      },
      chouseflatnumber: {
        type: String,
        required: false,
      },
      cstreetroadname: {
        type: String,
        required: false,
      },
      clocalityareaname: {
        type: String,
        required: false,
      },
      ccountry: {
        type: String,
        required: false,
      },
      cstate: {
        type: String,
        required: false,
      },
      ccity: {
        type: String,
        required: false,
      },
      cpincode: {
        type: String,
        required: false,
      },
      cgpscoordinate: {
        type: String,
        required: false,
      },

      ticketid: {
        type: String,
        required: false,
      },
      ticketstatus: {
        type: String,
        required: false,
      },
      tickethandledby: {
        type: [String],
        required: false,
      },
      ticketprepared: {
        checkbox: {
          type: Boolean,
          required: false,
        },
        date: {
          type: String,
          required: false,
        },
        time: {
          type: String,
          required: false,
        },
        documentpreparedby: {
          type: String,
          required: false,
        },
      },

      requestvisitorfollowupdate: {
        type: String,
        required: false,
      },
      requestvisitorfollowaction: {
        type: String,
        required: false,
      },
      requestfollowupactionupdate: {
        type: String,
        required: false,
      },
      requestfollowupactionuptime: {
        type: String,
        required: false,
      },
      requestdocument: [
        {
          data: {
            type: String,
            required: false,
          },

          preview: {
            type: String,
            required: false,
          },
          remark: {
            type: String,
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
          filename: {
            type: String,
            required: false,
          },
          filesize: {
            type: String,
            required: false,
          },
          remark: {
            type: String,
            required: false,
          },
          mimetype: {
            type: String,
            required: false,
          },
        },
      ],
      enquiredbranchemail: {
        type: String,
        required: false,
      },
      enquiredbranchnumber: {
        type: String,
        required: false,
      },
      visitortype: {
        type: String,
        required: false,
      },
      visitormode: {
        type: String,
        required: false,
      },
      visitorpurpose: {
        type: String,
        required: false,
      },
      meetingdetails: {
        type: Boolean,
        required: false,
      },

      intime: {
        type: String,
        required: false,
      },
      meetingpersoncompany: {
        type: [String],
        required: false,
      },
      meetingpersonbranch: {
        type: [String],
        required: false,
      },
      meetingpersonunit: {
        type: [String],
        required: false,
      },
      meetingpersondepartment: {
        type: [String],
        required: false,
      },
      meetingpersonteam: {
        type: [String],
        required: false,
      },
      meetingpersonemployeename: {
        type: String,
        required: false,
      },
      meetinglocationcompany: {
        type: [String],
        required: false,
      },
      meetinglocationbranch: {
        type: [String],
        required: false,
      },
      meetinglocationunit: {
        type: [String],
        required: false,
      },
      meetinglocationfloor: {
        type: [String],
        required: false,
      },
      meetinglocationarea: {
        type: String,
        required: false,
      },
      escortinformation: {
        type: Boolean,
        required: false,
      },

      escortdetails: {
        type: String,
        required: false,
      },
      equipmentborrowed: {
        type: String,
        required: false,
      },
      outtime: {
        type: String,
        required: false,
      },

      remark: {
        type: String,
        required: false,
      },

      followupaction: {
        type: String,
        required: false,
      },
      followupdate: {
        type: String,
        required: false,
      },
      followuptime: {
        type: String,
        required: false,
      },
      visitorbadge: {
        type: String,
        required: false,
      },
      visitorsurvey: {
        type: String,
        required: false,
      },
    },
  ],
  visitordocument: [
    {
      data: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      preview: {
        type: String,
        required: false,
      },
      remark: {
        type: String,
        required: false,
      },
      filename: {
        type: String,
        required: false,
      },
      filesize: {
        type: String,
        required: false,
      },
      mimetype: {
        type: String,
        required: false,
      },
    },
  ],
  requestdocument: [
    {
      data: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      preview: {
        type: String,
        required: false,
      },
      remark: {
        type: String,
        required: false,
      },
      filename: {
        type: String,
        required: false,
      },
      filesize: {
        type: String,
        required: false,
      },
      mimetype: {
        type: String,
        required: false,
      },
    },
  ],
  faceDescriptor: [Number],
  branchforwardlog: [
    {
      oldcompany: {
        type: String,
        required: false,
      },
      oldbranch: {
        type: String,
        required: false,
      },
      oldunit: {
        type: String,
        required: false,
      },
      createdusername: {
        type: String,
        required: false,
      },
      creadteddate: {
        type: Date,
        default: Date.now,
      },
      forwardbranch: {
        type: String,
        required: false,
      },
      forwardunit: {
        type: String,
        required: false,
      },
      reason: {
        type: String,
        required: false,
      },
    },
  ],
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
VisitorsSchema.index({
  company: 1,
  category: 1,
  branch: 1,
  unit: 1,
  date: 1,
  visitorid: 1,
  prefix: 1,
  visitorname: 1,
  visitoremail: 1,
  visitortype: 1,
  visitormode: 1,
  visitorpurpose: 1,
  visitorcontactnumber: 1,
  intime: 1,
  outtime: 1,
  interactorstatus: 1,
  isBtnEnable: 1,
  addvisitorin: 1,
  followuparray: { $slice: -1 },
});
module.exports = mongoose.model('visitors', VisitorsSchema);
