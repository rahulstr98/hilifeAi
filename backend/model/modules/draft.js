const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const draftSchema = new Schema({
  createrocketchat: {
    type: Boolean,
    required: false,
  },
  rocketchatemail: {
    type: String,
    required: false,
  },
  rocketchatroles: {
    type: [String],
    required: false,
  },
  faceDescriptor: {
    type: [Number],
    required: false,
  },
  religion: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: false,
    // unique: false,
  },
  usernameautogenerate: {
    type: Boolean,
    required: false,
  },
  workmode: {
    type: String,
    required: false,
  },
  internstatus: {
    type: String,
    required: false,
  },
  userprofile: {
    type: String,
    required: false,
  },
  enquirystatus: {
    type: String,
    required: false,
  },
  area: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  prefix: {
    type: String,
    required: false,
  },
  shiftgrouping: {
    type: String,
    required: false,
  },
  firstname: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  },
  legalname: {
    type: String,
    required: false,
  },
  fathername: {
    type: String,
    required: false,
  },
  mothername: {
    type: String,
    required: false,
  },
  gender: {
    type: String,

    required: false,
  },
  maritalstatus: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },

  bloodgroup: {
    type: String,
    required: false,
  },
  profileimage: {
    type: String,
    required: false,
  },
  attendancemode: {
    type: [String],
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  companyemail: {
    type: String,
    required: false,
  },
  contactpersonal: {
    type: String,
    required: false,
  },

  contactfamily: {
    type: String,
    required: false,
  },

  emergencyno: {
    type: String,

    required: false,
  },

  doj: {
    type: String,
    required: false,
  },
  samesprmnt: {
    type: Boolean,
    required: false,
  },
  dot: {
    type: String,
    required: false,
  },
  //reference details...
  referencename: {
    type: String,
    required: false,
  },
  contactno: {
    type: String,
    required: false,
  },
  details: {
    type: String,
    required: false,
  },

  //Permanenent Address
  pdoorno: {
    type: String,
    require: false,
  },
  pstreet: {
    type: String,
    require: false,
  },
  parea: {
    type: String,
    require: false,
  },
  plandmark: {
    type: String,
    require: false,
  },
  ptaluk: {
    type: String,
    require: false,
  },
  ppost: {
    type: String,
    require: false,
  },
  ppincode: {
    type: String,
    require: false,
  },
  pcountry: {
    type: String,
    require: false,
  },
  pstate: {
    type: String,
    require: false,
  },
  pcity: {
    type: String,
    require: false,
  },
  cdoorno: {
    type: String,
    require: false,
  },
  cstreet: {
    type: String,
    require: false,
  },
  carea: {
    type: String,
    require: false,
  },
  clandmark: {
    type: String,
    require: false,
  },
  ctaluk: {
    type: String,
    require: false,
  },
  cpost: {
    type: String,
    require: false,
  },
  cpincode: {
    type: String,
    require: false,
  },
  ccountry: {
    type: String,
    require: false,
  },
  cstate: {
    type: String,
    require: false,
  },
  ccity: {
    type: String,
    require: false,
  },
  experience: {
    type: String,
    require: false,
  },
  //Available
  companyname: {
    type: String,
    require: false,
  },
  //Boarding inforamtion
  branch: {
    type: String,
    require: false,
  },
  unit: {
    type: String,

    require: false,
  },
  floor: {
    type: String,
    require: false,
  },
  department: {
    type: String,
    require: false,
  },
  team: {
    type: String,
    require: false,
  },
  designation: {
    type: String,
    require: false,
  },
  shifttiming: {
    type: String,
    require: false,
  },
  reportingto: {
    type: String,
    require: false,
  },
  empcode: {
    type: String,
    require: false,
  },
  company: {
    type: String,
    require: false,
  },
  draft: {
    type: String,
    require: false,
  },
  role: [String],

  addAddQuaTodo: [
    {
      addQual: {
        type: String,
        required: false,
      },
      addInst: {
        type: String,
        required: false,
      },
      duration: {
        type: String,
        required: false,
      },
      remarks: {
        type: String,
        required: false,
      },
    },
  ],

  files: [
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
    },
  ],
  eduTodo: [
    {
      categoryedu: {
        type: String,
        required: false,
      },
      subcategoryedu: {
        type: String,
        required: false,
      },
      specialization: {
        type: String,
        required: false,
      },
      institution: {
        type: String,
        required: false,
      },
      passedyear: {
        type: String,
        required: false,
      },
      cgpa: {
        type: String,
        required: false,
      },
    },
  ],
  aadhar: {
    type: String,
    required: false,
  },
  panno: {
    type: String,
    required: false,
  },

  workhistTodo: [
    {
      empNameTodo: {
        type: String,
        required: false,
      },
      desigTodo: {
        type: String,
        required: false,
      },
      joindateTodo: {
        type: String,
        required: false,
      },
      leavedateTodo: {
        type: String,
        required: false,
      },
      dutiesTodo: {
        type: String,
        required: false,
      },
      reasonTodo: {
        type: String,
        required: false,
      },
    },
  ],
  status: {
    type: String,
    required: false,
  },
  percentage: {
    type: String,
    required: false,
  },
  intStartDate: {
    type: String,
    required: false,
  },
  intEndDate: {
    type: String,
    required: false,
  },

  modeOfInt: {
    type: String,
    required: false,
  },
  intDuration: {
    type: String,
    required: false,
  },
  intCourse: {
    type: String,
    required: false,
  },
  clickedGenerate: {
    type: String,

    required: false,
  },
  resonablestatus: {
    type: String,
    require: false,
  },
  reasondate: {
    type: String,
    require: false,
  },
  reasonname: {
    type: String,
    require: false,
  },
  empreason: {
    type: String,
    require: false,
  },
  employeecount: {
    type: String,
    required: false,
  },
  systemmode: {
    type: String,
    required: false,
  },
  dom: {
    type: String,
    required: false,
  },
  enableworkstation: {
    type: Boolean,
    required: false,
  },
  callingname: {
    type: String,
    required: false,
  },
  bankdetails: [
    {
      bankname: {
        type: String,
        required: false,
      },
      bankbranchname: {
        type: String,
        required: false,
      },
      accountholdername: {
        type: String,
        required: false,
      },
      accountnumber: {
        type: String,
        required: false,
      },
      ifsccode: {
        type: String,
        required: false,
      },
      accounttype: {
        type: String,
        required: false,
      },
      accountstatus: {
        type: String,
        required: false,
      },
      proof: [
        {
          name: {
            type: String,
            required: false,
          },
          preview: {
            type: String,
            required: false,
          },
          data: {
            type: String,
            required: false,
          },
        },
      ],
    },
  ],

  panstatus: {
    type: String,
    required: false,
  },
  panrefno: {
    type: String,
    required: false,
  },

  workstationinput: {
    type: String,
    require: false,
  },
  workstationofficestatus: {
    type: Boolean,
    require: false,
  },
  accessibletodo: [
    {
      fromcompany: {
        type: String,
        require: false,
      },
      frombranch: {
        type: String,
        require: false,
      },
      fromunit: {
        type: String,
        require: false,
      },
      company: {
        type: String,
        require: false,
      },
      branch: {
        type: String,
        require: false,
      },
      unit: {
        type: String,
        require: false,
      },
      companycode: {
        type: String,
        require: false,
      },
      branchcode: {
        type: String,
        require: false,
      },
      branchemail: {
        type: String,
        require: false,
      },
      branchaddress: {
        type: String,
        require: false,
      },
      branchstate: {
        type: String,
        require: false,
      },
      branchcity: {
        type: String,
        require: false,
      },
      branchcountry: {
        type: String,
        require: false,
      },
      branchpincode: {
        type: String,
        require: false,
      },
      unitcode: {
        type: String,
        require: false,
      },
      employee: {
        type: String,
        require: false,
      },
      employeecode: {
        type: String,
        require: false,
      },
    },
  ],
  designationlog: [
    {
      logeditedby: [
        {
          username: {
            type: String,
            required: false,
          },
          date: {
            type: String,
            required: false,
          },
        },
      ],

      username: {
        type: String,
        required: false,
      },
      updateddatetime: {
        type: Date,
        default: Date.now,
      },
      updatedusername: {
        type: String,
        require: false,
      },
      designation: {
        type: String,
        required: false,
      },
      startdate: {
        type: String,
        required: false,
      },
      branch: {
        type: String,
        require: false,
      },
      unit: {
        type: String,
        require: false,
      },
      team: {
        type: String,
        require: false,
      },
      companyname: {
        type: String,
        require: false,
      },
      time: {
        type: String,
        require: false,
      },
    },
  ],
  departmentlog: [
    {
      logeditedby: [
        {
          username: {
            type: String,
            required: false,
          },
          date: {
            type: String,
            required: false,
          },
        },
      ],
      userid: {
        type: String,
        required: false,
      },
      updateddatetime: {
        type: Date,
        default: Date.now,
      },
      updatedusername: {
        type: String,
        require: false,
      },
      username: {
        type: String,
        required: false,
      },
      department: {
        type: String,
        required: false,
      },
      startdate: {
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
      companyname: {
        type: String,

        require: false,
      },
      status: {
        type: Boolean,
        required: false,
      },
    },
  ],
  assignExpLog: [
    {
      expval: {
        type: String,
        required: false,
      },
      expmode: {
        type: String,
        required: false,
      },
      endexp: {
        type: String,
        required: false,
      },
      endexpdate: {
        type: String,
        required: false,
      },
      endtar: {
        type: String,
        required: false,
      },
      endtardate: {
        type: String,
        required: false,
      },
      updatedate: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
      },
      updatename: {
        type: String,
        required: false,
      },
      salarycode: {
        type: String,
        required: false,
      },
      basic: {
        type: String,
        required: false,
      },
      hra: {
        type: String,
        required: false,
      },
      conveyance: {
        type: String,
        required: false,
      },
      gross: {
        type: String,
        required: false,
      },
      medicalallowance: {
        type: String,
        required: false,
      },
      productionallowance: {
        type: String,
        required: false,
      },
      otherallowance: {
        type: String,
        required: false,
      },
      productionallowancetwo: {
        type: String,
        required: false,
      },
      pfdeduction: {
        type: Boolean,
        required: false,
      },
      esideduction: {
        type: Boolean,
        required: false,
      },
      ctc: {
        type: String,
        required: false,
      },
      date: {
        type: String,
        required: false,
      },

      startmonth: {
        type: String,
        required: false,
      },
      endmonth: {
        type: String,
        required: false,
      },
      startyear: {
        type: String,
        required: false,
      },
      endyear: {
        type: String,
        required: false,
      },

    },
  ],
  departmentlogdates: [
    {
      userid: {
        type: String,
        required: false,
      },
      username: {
        type: String,
        required: false,
      },
      department: {
        type: String,
        required: false,
      },
      startdate: {
        type: String,
        required: false,
      },
      futuredate: {
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
      companyname: {
        type: String,
        required: false,
      },
      status: {
        type: Boolean,
        required: false,
      },
    },
  ],

  fromwhere: {
    type: String,
    default: false,
  },

  twofaenabled: {
    type: Boolean,
    default: false,
  },
  twofatempsecret: {
    type: String,
    default: "NOTVERIFIED",
  },
  twofasecret: {
    type: String,
    default: "NOTVERIFIED",
  },
  process: {
    type: String,
    required: false,
  },
  originalpassword: {
    type: String,
    required: false,
  },
  processlog: [
    {
      logeditedby: [
        {
          username: {
            type: String,
            required: false,
          },
          date: {
            type: String,
            required: false,
          },
        },
      ],
      branch: {
        type: String,
        required: false,
      },
      company: {
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
      empname: {
        type: String,
        required: false,
      },
      process: {
        type: String,
        required: false,
      },
      processduration: {
        type: String,
        required: false,
      },
      processtype: {
        type: String,
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
      duration: {
        type: String,
        required: false,
      },
      updateddatetime: {
        type: Date,
        default: Date.now,
      },
      updatedusername: {
        type: String,
        require: false,
      },
    },
  ],

  boardingLog: [
    {
      logeditedby: [
        {
          username: {
            type: String,
            required: false,
          },
          date: {
            type: String,
            required: false,
          },
        },
      ],
      ischangecompany: {
        type: Boolean,
        required: false,
      },
      ischangebranch: {
        type: Boolean,
        required: false,
      },
      ischangeunit: {
        type: Boolean,
        required: false,
      },
      ischangeteam: {
        type: Boolean,
        required: false,
      },
      username: {
        type: String,
        required: false,
      },
      company: {
        type: String,
        required: false,
      },
      startdate: {
        type: String,
        required: false,
      },
      branch: {
        type: String,
        require: false,
      },
      unit: {
        type: String,
        require: false,
      },
      team: {
        type: String,
        require: false,
      },
      shifttype: {
        type: String,
        require: false,
      },
      shiftgrouping: {
        type: String,
        require: false,
      },
      shifttiming: {
        type: String,
        require: false,
      },
      logcreation: {
        type: String,
        require: false,
      },
      time: {
        type: String,
        require: false,
      },
      updateddatetime: {
        type: Date,
        default: Date.now,
      },
      updatedusername: {
        type: String,
        require: false,
      },
      weekoff: [String],
      todo: [
        {
          day: {
            type: String,
            require: false,
          },
          daycount: {
            type: String,
            require: false,
          },
          week: {
            type: String,
            require: false,
          },
          shiftmode: {
            type: String,
            require: false,
          },
          shiftgrouping: {
            type: String,
            require: false,
          },
          shifttiming: {
            type: String,
            require: false,
          },
        }
      ]
    },
  ],
  // workstation: {
  //   type: String,
  //   require: false,
  // },
  workstation: [String],
  weekoff: [String],
  shiftallot: [
    {
      userid: {
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
      team: {
        type: String,
        required: false,
      },
      department: {
        type: String,
        required: false,
      },
      username: {
        type: String,
        required: false,
      },
      empcode: {
        type: String,
        required: false,
      },
      shifttiming: {
        type: String,
        required: false,
      },
      lastshifttiming: {
        type: String,
        required: false,
      },
      lastShiftTimingDate: {
        type: String,
        required: false,
      },
      date: {
        type: String,
        required: false,
      },
      day: {
        type: String,
        required: false,
      },
      daycount: {
        type: String,
        required: false,
      },
      mode: {
        type: String,
        required: false,
      },
      shiftgrptype: {
        type: String,
        required: false,
      },
      shift: {
        type: String,
        require: false,
      },
      firstshift: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        require: false,
      },
      weekoff: [String],
      shiftallows: {
        type: String,
        require: false,
      },
      adjfirstshiftmode: {
        type: String,
        require: false,
      },
      adjfirstshifttime: {
        type: String,
        require: false,
      },
      adjustmenttype: {
        type: String,
        require: false,
      },
      adjshiftgrptype: {
        type: String,
        require: false,
      },
      adjchangeshift: {
        type: String,
        require: false,
      },
      adjchangeshiftime: {
        type: String,
        require: false,
      },
      adjchangereason: {
        type: String,
        require: false,
      },
      adjdate: {
        type: String,
        require: false,
      },
      adjrequestdate: {
        type: String,
        require: false,
      },
      adjapplydate: {
        type: String,
        require: false,
      },
      adjapplytime: {
        type: String,
        require: false,
      },
      adjstatus: {
        type: String,
        require: false,
      },
      adjustmentstatus: {
        type: Boolean,
        require: false,
      },
      todate: {
        type: String,
        required: false,
      },
      todateshiftmode: {
        type: String,
        required: false,
      },
      selectedDate: {
        type: String,
        require: false,
      },
      selectedShifTime: {
        type: String,
        require: false,
      },
      secondmode: {
        type: String,
        require: false,
      },
      pluseshift: {
        type: String,
        require: false,
      },
    },
  ],
  rejoin: {
    type: String,
    require: false,
  },
  reasonablestatusremarks: {
    type: String,
    require: false,
  },
  referencetodo: [
    {
      name: {
        type: String,
        required: false,
      },
      relationship: {
        type: String,
        required: false,
      },
      occupation: {
        type: String,
        required: false,
      },
      contact: {
        type: String,
        required: false,
      },
      details: {
        type: String,
        required: false,
      },
    },
  ],

  pfesistatus: {
    type: Boolean,
    required: false,
  },
  esideduction: {
    type: Boolean,
    required: false,
  },
  pfdeduction: {
    type: Boolean,
    required: false,
  },
  uan: {
    type: String,
    required: false,
  },
  pfmembername: {
    type: String,
    required: false,
  },
  insurancenumber: {
    type: String,
    required: false,
  },
  ipname: {
    type: String,
    required: false,
  },
  pfesifromdate: {
    type: String,
    required: false,
  },

  //for pf and esi
  pffromdate: {
    type: String,
    required: false,
  },
  pfenddate: {
    type: String,
    required: false,
  },
  esifromdate: {
    type: String,
    required: false,
  },
  esienddate: {
    type: String,
    required: false,
  },

  isenddate: {
    type: Boolean,
    required: false,
  },
  pfesienddate: {
    type: String,
    required: false,
  },

  pfesistatus: {
    type: Boolean,
    required: false,
  },

  assignpfesilog: [
    {
      esideduction: {
        type: Boolean,
        required: false,
      },
      pfdeduction: {
        type: Boolean,
        required: false,
      },
      uan: {
        type: String,
        required: false,
      },
      pfmembername: {
        type: String,
        required: false,
      },
      insurancenumber: {
        type: String,
        required: false,
      },
      ipname: {
        type: String,
        required: false,
      },

      pffromdate: {
        type: String,
        required: false,
      },

      pfenddate: {
        type: String,
        required: false,
      },
      esifromdate: {
        type: String,
        required: false,
      },
      esienddate: {
        type: String,
        required: false,
      },
      updatename: {
        type: String,
        required: false,
      },
      updatetime: {
        type: String,
        required: false,
      },
      date: {
        type: String,
        required: false,
      },
    },
  ],

  wordcheck: {
    type: Boolean,
    required: false,
  },
  assignExpMode: {
    type: String,
    required: false,
  },
  assignExpvalue: {
    type: String,
    required: false,
  },
  assignExpDate: {
    type: String,
    required: false,
  },

  //salaryslab
  salarysetup: {
    type: Boolean,
    default: false,
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
  productionallowancetwo: {
    type: Number,
    required: false,
  },
  otherallowance: {
    type: Number,
    required: false,
  },
  esideduction: {
    type: Boolean,
    required: false,
  },
  pfdeduction: {
    type: Boolean,
    required: false,
  },
  ctc: {
    type: Number,
    required: false,
  },
  mode: {
    type: String,
    required: false,
  },
  salarycode: {
    type: String,
    required: false,
  },
  shiftallowancelog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],

  targetpointlog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  acheivedpointlog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  penaltylog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  totalpaiddayslog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  totalabsentlog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  currmonthavglog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  currmonthattlog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  noshiftlog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  shiftallowtargetlog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  nightshiftallowlog: [
    {
      date: {
        type: String,
        required: false,
      },
      month: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
      },
    },
  ],
  addremoteworkmode: [
    {
      wfhsystemtype: [String],
      wfhconfigurationdetails: {
        type: String,
        required: false,
      },
      wfhsetupphoto: [
        {
          preview: {
            type: String,
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
          data: {
            type: String,
            required: false,
          },
          remark: {
            type: String,
            required: false,
          },
        },
      ],

      internetnetworktype: [String],
      internetdailylimit: {
        type: String,
        required: false,
      },
      internetspeed: {
        type: String,
        required: false,
      },
      internetssidname: {
        type: String,
        required: false,
      },
      internetssidphoto: [
        {
          preview: {
            type: String,
            required: false,
          },
          name: {
            type: String,
            required: false,
          },
          data: {
            type: String,
            required: false,
          },
          remark: {
            type: String,
            required: false,
          },
        },
      ],

      auditchecklistworkareasecure: {
        type: String,
        required: false,
      },

      auditchecklistwindowsongroundlevelworkarea: {
        type: String,
        required: false,
      },
      auditchecklistworkstationisstored: {
        type: String,
        required: false,
      },
      auditchecklistnoprivatelyowned: {
        type: String,
        required: false,
      },
      auditchecklistwifisecurity: {
        type: String,
        required: false,
      },
      updatename: {
        type: String,
        required: false,
      },
      updatetime: {
        type: String,
        required: false,
      },
      date: {
        type: String,
        required: false,
      },
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
    },
  ],
  shifttype: {
    type: String,
    require: false,
  },

  assignExpMode: {
    type: String,
    required: false,
  },
  assignExpvalue: {
    type: String,
    required: false,
  },
  endexp: {
    type: String,
    required: false,
  },
  endtardate: {
    type: String,
    required: false,
  },
  endtar: {
    type: String,
    required: false,
  },
  assignEndExp: {
    type: String,
    required: false,
  },
  assignExpDate: {
    type: String,
    required: false,
  },
  assignEndExpvalue: {
    type: String,
    required: false,
  },
  assignEndExpvalue: {
    type: String,
    required: false,
  },

  assignEndExpDate: {
    type: String,
    required: false,
  },
  assignEndTar: {
    type: String,
    required: false,
  },
  assignEndTarvalue: {
    type: String,
    required: false,
  },
  assignEndTarvalue: {
    type: String,
    required: false,
  },
  assignEndTarDate: {
    type: String,
    required: false,
  },
  process: {
    type: String,
    required: false,
  },
  processtype: {
    type: String,
    required: false,
  },
  processduration: {
    type: String,
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

  grosssalary: {
    type: String,
    required: false,
  },
  timemins: {
    type: String,
    required: false,
  },
  modeexperience: {
    type: String,
    required: false,
  },
  targetexperience: {
    type: String,
    required: false,
  },
  targetpts: {
    type: String,
    required: false,
  },
  expval: {
    type: String,
    required: false,
  },
  expmode: {
    type: String,
    required: false,
  },

  boardingLog: [
    {
      username: {
        type: String,
        required: false,
      },
      company: {
        type: String,
        required: false,
      },
      workstation: {
        type: [String],
        require: false,
      },
      startdate: {
        type: String,
        required: false,
      },
      branch: {
        type: String,
        require: false,
      },
      unit: {
        type: String,
        require: false,
      },
      team: {
        type: String,
        require: false,
      },
      companyname: {
        type: String,
        require: false,
      },
      process: {
        type: String,
        require: false,
      },
      shifttype: {
        type: String,
        require: false,
      },
      shiftgrouping: {
        type: String,
        require: false,
      },
      shifttiming: {
        type: String,
        require: false,
      },
      time: {
        type: String,
        require: false,
      },
      weekoff: [String],
      todo: [
        {
          day: {
            type: String,
            require: false,
          },
          daycount: {
            type: String,
            require: false,
          },
          week: {
            type: String,
            require: false,
          },
          shiftmode: {
            type: String,
            require: false,
          },
          shiftgrouping: {
            type: String,
            require: false,
          },
          shifttiming: {
            type: String,
            require: false,
          },
        },
      ],
    },
  ],

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

module.exports = mongoose.model("Draft", draftSchema);