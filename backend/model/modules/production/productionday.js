const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductionDaySchema = new Schema({

   
    date: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: false,
    },
    companyname: {
        type: String,
        required: false,
    },
    createddate:{
        type: String,
        required: false,
    },
   filestatus: {
    type: String,
    required: false,
  },
    uniqueid:{
        type: Number,
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

        }],
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

        }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})
ProductionDaySchema.index({date:1})
module.exports = mongoose.model('ProductionDay', ProductionDaySchema);
