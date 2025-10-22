const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const companySchema = new Schema({
  
    code:{
        type: String,
        required: false,
    },
    name:{
        type: String,
        required: false,
    },
    addedby:[
        {
        name:{
            type: String,
            required: false,
        },
        date:{
            type: String,
            required: false,
        },
    
    }],
    updatedby:[
        {
        name:{
            type: String,
            required: false,
        },
        date:{
            type: String,
            required: false,
        },
    
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('Company',companySchema);