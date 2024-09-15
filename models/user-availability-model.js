const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

const availabilitySchema = new Schema({
    startTime: { type: Date , required: true},
    endTime: {type: Date, required: true},
    userId: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    intervalType: {type: String, required: true}
},{timestamps: true });

module.exports = mongoose.model('UserAvailability',availabilitySchema);
