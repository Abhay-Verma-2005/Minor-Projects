const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientRole: { type: String, enum: ['USER', 'ORGANISER', 'PROVIDER'], default: 'USER' },
  user_type:     { type: String, enum: ['user', 'organizer', 'venue_provider'], default: 'user' },
  title:         { type: String, default: '' },
  message:       { type: String, required: true },
  type:          { type: String, enum: ['reminder', 'cancellation', 'booking', 'refund', 'venue_request', 'general'], default: 'general' },
  read:          { type: Boolean, default: false },
  is_read:       { type: Boolean, default: false },
  eventId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  reference_id:  { type: mongoose.Schema.Types.ObjectId, default: null },
  reference_type:{ type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
