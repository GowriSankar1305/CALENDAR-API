const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sessionSchema = new Schema({
    sessionType: {type: String,required: true},
    adminId: {type: Schema.Types.ObjectId,ref: 'Admin',required: true},
    attendees: [{type: Schema.Types.ObjectId,ref: 'User',required: true}],
    startDate: {type: Date, required: true},
    endDate: {type: Date,required: true},
    title: {type: String, required: true},
    description: {type: String,required: false},
    location: {type: String,required: true}
},{timestamps: true});