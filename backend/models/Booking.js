const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  bookingId:     { type: String, required: true, unique: true },
  qrCode:        { type: String, required: true },       
  qrImage:       { type: String, default: '' },           
  seatNumber:    { type: String },
  paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'SUCCESS' },
  status:        { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  refundStatus:  { type: String, enum: ['not_applicable', 'pending', 'completed'], default: 'not_applicable' },
  refundAmount:  { type: Number, default: 0 },
  refundDate:    { type: Date, default: null },
  scannedAt:     { type: Date, default: null },        
  cancelledAt:   { type: Date, default: null },
  eventDate:     { type: Date },
  attendanceStatus: { type: String, enum: ['not_attended', 'attended', 'cancelled'], default: 'not_attended' },
}, { timestamps: true });

bookingSchema.index({ qrCode: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
