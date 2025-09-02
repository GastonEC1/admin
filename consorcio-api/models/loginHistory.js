const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginHistorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  ipAddress: String,
  country: String,
  city: String,
  lat: Number,
  lon: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);