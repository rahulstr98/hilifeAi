const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ProductionMonthUploadSchema = new Schema(
  {
    datetimezone: {
      type: String,
      required: false,
    },
    vendor: {
      type: String,
      required: false,
    },
    fromdate: {
      type: String,
      required: false,
    },
    todate: {
      type: String,
      required: false,
    },

    Category: {
      type: String,
      required: false,
    },
    "Unit Identifier": {
      type: String,
      required: false,
    },
    uniqueid: {
      type: Number,
      required: false,
    },
    User: {
      type: String,
      required: false,
    },
    fileName: {
      type: String,
      required: false,
    },

    Date: {
      type: String,
      required: false,
    },
    formatteddate: {
      type: String,
      required: false,
    },
    formattedtime: {
      type: String,
      required: false,
    },
    filecategory: {
      type: String,
      required: false,
    },
    "Unit Rate": {
      type: Number,
      required: false,
    },

    "Flag Count": {
      type: Number,
      required: false,
    },
    section: {
      type: String,
      required: false,
    },

    addedby: [
      {
        name: {
          type: String,
          required: false,
        },
        companyname: {
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
        companyname: {
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
  },
  { strict: false }
);

ProductionMonthUploadSchema.index({ checkunique: 1 });

ProductionMonthUploadSchema.index({ uniqueid: 1, fileName: 1 });
ProductionMonthUploadSchema.index({ uniqueid: 1 });
ProductionMonthUploadSchema.index({ "Unit Rate": 1 });
ProductionMonthUploadSchema.index({ "Unit Rate": 1, vendor: 1 });
ProductionMonthUploadSchema.index({ fromdate: 1 });
ProductionMonthUploadSchema.index({ formatteddate: 1 });
ProductionMonthUploadSchema.index({ fromdate: 1, updatedunitrate: 1, unallothide: 1, "Unit Rate": 1 });
ProductionMonthUploadSchema.index({ formatteddate: 1, updatedunitrate: 1, unallothide: 1, "Unit Rate": 1 });
ProductionMonthUploadSchema.index({ User: 1, vendor: 1, fileName: 1, dupe: 1, dateobjformatdate: 1 });
ProductionMonthUploadSchema.index({ vendor: 1, updatedunitrate: 1, unallothide: 1, "Unit Rate": 1 });
ProductionMonthUploadSchema.index({ dateobjformatdate: 1, vendor: 1, unallothide: 1, "Unit Rate": 1 });

ProductionMonthUploadSchema.index({ vendor: 1, fileName: 1, dupe: 1, dateobjformatdate: 1 });

ProductionMonthUploadSchema.index({ fileName: 1, dateobjformatdate: 1, User: 1, dupe: 1 });
ProductionMonthUploadSchema.index({ "Unit Rate": 1, projectvendor: 1, fileName: 1, Category: 1, fromdate: 1 });
ProductionMonthUploadSchema.index({ fromdate: 1, vendor: 1, uniqueid: 1 });

module.exports = mongoose.model("ProductionMonthUpload", ProductionMonthUploadSchema);

