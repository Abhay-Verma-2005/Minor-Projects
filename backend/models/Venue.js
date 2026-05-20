const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:   { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text:   { type: String, required: true },
}, { timestamps: true });

const venueBookingSchema = new mongoose.Schema({
  organiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organiser', required: true },
  eventId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  days:        { type: Number, required: true },
  totalPrice:  { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  bookedAt:    { type: Date, default: Date.now },
});

const venueSchema = new mongoose.Schema({
  providerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'VenueProvider', required: true },
  name:              { type: String, required: true },
  state:             { type: String, required: true },
  city:              { type: String, required: true },
  address:           { type: String, default: '' },
  latitude:          { type: Number, default: null },
  longitude:         { type: Number, default: null },
  capacity:          { type: Number, required: true },
  pricePerDay:       { type: Number, required: true },
  layoutDescription: { type: String, default: '' },
  images:            [{ type: String }],
  venueShape:        { type: String, default: '' },
  status:            { type: String, enum: ['AVAILABLE', 'BOOKED'], default: 'AVAILABLE' },
  reviews:           [reviewSchema],
  bookings:          [venueBookingSchema],
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
