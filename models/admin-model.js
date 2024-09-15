const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
   fullName: {type: String, required: true},
   emailId: {type:  String,required: true},
   password: {type: String,required: true},
   mobileNo: {type: String,required: true} 
},{timestamps: true});

module.exports = mongoose.model('Admin',adminSchema);