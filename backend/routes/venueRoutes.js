const express = require('express');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();

const datesOverlap = (startA, endA, startB, endB) => startA <= endB && startB <= endA;
const calcDays = (start, end) => Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

const getNormalizedDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const checkOverlap = (venue, start, end, excludeId = null) => {
  return venue.bookings.some(b => {
    if (excludeId && b._id.toString() === excludeId.toString()) return false;
    if (b.status !== 'confirmed' && b.status !== 'accepted') return false;
    
    const bStart = getNormalizedDate(b.startDate || b.dateFrom);
    const bEnd = getNormalizedDate(b.endDate || b.dateTo || b.startDate || b.dateFrom);
    
    return datesOverlap(start, end, bStart, bEnd);
  });
};

router.get('/my-venues', authMiddleware, roleMiddleware(['PROVIDER']), async (req, res) => {
  try {
    const venues = await Venue.find({ providerId: req.user.id }).sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching your venues' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { city, state } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: new RegExp(city, 'i') };
    if (state) filter.state = { $regex: new RegExp(state, 'i') };
    
    const venues = await Venue.find(filter).populate('providerId', 'name email').sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: 'Server error searching venues' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).populate('providerId', 'name email');
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/create', authMiddleware, roleMiddleware(['PROVIDER']), async (req, res) => {
  try {
    const { name, state, city, address, latitude, longitude, capacity, pricePerDay, layoutDescription, imageUrl, venueShape } = req.body;

    if (!name || !state || !city || !capacity || !pricePerDay) {
      return res.status(400).json({ message: 'Name, state, city, capacity and price are required' });
    }

    const venue = new Venue({
      providerId: req.user.id,
      name, state, city,
      address: address || '',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      capacity: Number(capacity),
      pricePerDay: Number(pricePerDay),
      layoutDescription: layoutDescription || '',
      images: imageUrl ? [imageUrl] : [],
      venueShape: venueShape || '',
    });

    await venue.save();
    res.status(201).json(venue);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating venue' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['PROVIDER']), async (req, res) => {
  try {
    const venue = await Venue.findOneAndDelete({ _id: req.params.id, providerId: req.user.id });
    if (!venue) return res.status(404).json({ message: 'Venue not found or not yours' });
    res.json({ message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'PROVIDER') return res.status(403).json({ message: 'Venue providers cannot review their own venues' });
    
    const { rating, text } = req.body;
    if (!rating || !text) return res.status(400).json({ message: 'Rating and text required' });

    let user = await User.findById(req.user.id);
    if (!user) {
      const Organiser = require('../models/Organiser');
      user = await Organiser.findById(req.user.id);
    }
    
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    venue.reviews.push({ userId: req.user.id, name: user.name, rating: Number(rating), text });
    await venue.save();
    
    res.json(venue.reviews[venue.reviews.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/book', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const { eventId, startDate, endDate } = req.body;
    if (!eventId || !startDate || !endDate) return res.status(400).json({ message: 'eventId, startDate and endDate are required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    const start = getNormalizedDate(startDate);
    const end = getNormalizedDate(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return res.status(400).json({ message: 'Invalid date format' });
    if (end < start) return res.status(400).json({ message: 'endDate must be on or after startDate' });
    if (start < getNormalizedDate(new Date())) return res.status(400).json({ message: 'Cannot book past dates' });

    if (checkOverlap(venue, start, end)) {
      return res.status(409).json({ message: 'Dates already taken — overlaps with a confirmed booking' });
    }

    const days = calcDays(start, end);
    const totalPrice = days * (venue.pricePerDay || 0);

    venue.bookings.push({
      organiserId: req.user.id, eventId, startDate: start, endDate: end, days, totalPrice, status: 'pending', bookedAt: new Date()
    });
    await venue.save();

    try {
      const Organiser = require('../models/Organiser');
      const organiser = await Organiser.findById(req.user.id);
      await createNotification(
        venue.providerId, 'PROVIDER', 'venue_request',
        `New request from ${organiser?.name || 'An organiser'} for "${venue.name}" — ${start.toLocaleDateString('en-IN')} to ${end.toLocaleDateString('en-IN')} — ₹${totalPrice.toLocaleString()}`,
        eventId
      );
    } catch (notifErr) {}

    res.status(201).json({ message: 'Booking request sent', booking: venue.bookings[venue.bookings.length - 1] });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.patch('/:venueId/booking/:bookingId/accept', authMiddleware, roleMiddleware(['PROVIDER']), async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.venueId, providerId: req.user.id });
    if (!venue) return res.status(404).json({ message: 'Venue not found or not yours' });

    const booking = venue.bookings.id(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking request not found' });
    if (booking.status !== 'pending') return res.status(400).json({ message: `Booking is already ${booking.status}` });

    const bStart = getNormalizedDate(booking.startDate || booking.dateFrom);
    const bEnd = getNormalizedDate(booking.endDate || booking.dateTo || booking.startDate || booking.dateFrom);

    if (checkOverlap(venue, bStart, bEnd, booking._id)) {
      return res.status(409).json({ message: 'Cannot accept — dates overlap with another confirmed booking' });
    }

    booking.status = 'confirmed';
    await venue.save();

    const event = await Event.findById(booking.eventId);
    if (event && event.status === 'Draft') {
      event.status = 'Live';
      await event.save();
    }

    await createNotification(
      booking.organiserId, 'ORGANISER', 'venue_request',
      `Venue "${venue.name}" confirmed! Your event "${event?.title || 'your event'}" is now live.`,
      booking.eventId
    );

    res.json({ message: 'Booking confirmed', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:venueId/booking/:bookingId/reject', authMiddleware, roleMiddleware(['PROVIDER']), async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.venueId, providerId: req.user.id });
    if (!venue) return res.status(404).json({ message: 'Venue not found or not yours' });

    const booking = venue.bookings.id(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking request not found' });
    if (booking.status !== 'pending') return res.status(400).json({ message: `Booking is already ${booking.status}` });

    booking.status = 'rejected';
    await venue.save();

    await createNotification(
      booking.organiserId, 'ORGANISER', 'venue_request',
      `Venue request for "${venue.name}" was rejected. Please choose another venue.`,
      booking.eventId
    );

    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/bookings', authMiddleware, roleMiddleware(['PROVIDER']), async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.id, providerId: req.user.id });
    if (!venue) return res.status(404).json({ message: 'Venue not found or not yours' });

    const populated = await Venue.findById(venue._id)
      .populate('bookings.organiserId', 'name email')
      .populate('bookings.eventId', 'title date');

    res.json(populated.bookings || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
