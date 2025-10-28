const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 🧩 Reusable File Schema
const fileSchema = new Schema(
  {
    name: { type: String, required: false },
    originalname: { type: String, required: false },
    path: { type: String, required: false },
    mimetype: { type: String, required: false },
    size: { type: Number, required: false },
  },
  { _id: false }
);

const templatecontrolpanelSchema = new Schema({
  company: String,
  branch: String,
  emailformat: String,
  fromemail: String,
  toemail: String,
  ccemail: [String],
  bccemail: [String],

  letterheadcontentheader: [
    {
      headername: String,
      headerimage: fileSchema,
    },
  ],

  letterheadcontentfooter: {
    footername: String,
    footerimage: fileSchema,
  },

  qrInfo: [{ details: String }],

  letterheadbodycontent: fileSchema,

  companyurl: String,

  idcardfrontheader: fileSchema,
  idcardfrontfooter: fileSchema,
  idcardbackheader: fileSchema,
  idcardbackfooter: fileSchema,

  companyname: String,
  address: String,

  toCompany: [
    {
      toCompanyname: String,
      toAddress: String,
    },
  ],

  documentcompany: fileSchema,

  documentseal: [
    {
      name: String,
      seal: String,
      document: fileSchema,
    },
  ],

  documentsignature: [
    {
      allBranch: Boolean,
      unit: String,
      team: String,
      employee: String,
      signaturename: String,
      seal: String,
      topcontent: String,
      bottomcontent: String,
      document: fileSchema,
    },
  ],

  // ✅ Keep log schema structure similar (optional)
  templatecontrolpanellog: [
    {
      company: String,
      branch: String,
      emailformat: String,
      fromemail: String,
      toemail: String,
      ccemail: [String],
      bccemail: [String],
      qrInfo: [{ details: String }],
      letterheadcontentheader: [
        { headername: String, headerimage: fileSchema },
      ],
      letterheadcontentfooter: [
        { footername: String, footerimage: fileSchema },
      ],
      letterheadbodycontent: fileSchema,
      companyurl: String,
      idcardfrontheader: fileSchema,
      idcardfrontfooter: fileSchema,
      idcardbackheader: fileSchema,
      idcardbackfooter: fileSchema,
      companyname: String,
      address: String,
      toCompany: [
        {
          toCompanyname: String,
          toAddress: String,
        },
      ],
      documentcompany: fileSchema,
      documentseal: [
        {
          name: String,
          seal: String,
          document: fileSchema,
        },
      ],
      documentsignature: [
        {
          allBranch: Boolean,
          unit: String,
          team: String,
          employee: String,
          signaturename: String,
          seal: String,
          topcontent: String,
          bottomcontent: String,
          document: fileSchema,
        },
      ],
      addedby: [{ name: String, date: String }],
      updatedby: [{ name: String, date: String }],
    },
  ],

  addedby: [{ name: String, date: String }],
  updatedby: [{ name: String, date: String }],
});

module.exports = mongoose.model(
  "templatecontrolpanel",
  templatecontrolpanelSchema
);
