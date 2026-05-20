const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationHelper');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();

const SERVER_SECRET = process.env.SERVER_SECRET || 'eventick_qr_secret_2026';

function generateQrHash(bookingId, eventId, userId) {
  return crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(`${bookingId}:${eventId}:${userId}`)
    .digest('hex');
}

router.post('/book', authMiddleware, roleMiddleware(['USER']), async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body;
    const qty = Math.min(10, Math.max(1, parseInt(quantity) || 1));

    const event = await Event.findById(eventId).populate('venueId');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'Live') return res.status(400).json({ message: 'Event is not live' });
    if (event.soldTickets + qty > event.totalTickets) {
      return res.status(400).json({ message: `Only ${event.totalTickets - event.soldTickets} seats remaining` });
    }

    const activeBookings = await Booking.find({ eventId: event._id, status: 'active' });
    const takenSeats = new Set(activeBookings.map(b => parseInt(b.seatNumber)));

    const assignedSeats = [];
    let currentSeat = 1;
    for (let i = 0; i < qty; i++) {
      while (takenSeats.has(currentSeat)) currentSeat++;
      assignedSeats.push(currentSeat);
      takenSeats.add(currentSeat);
    }

    const bookings = [];
    for (let i = 0; i < qty; i++) {
      const bookingId = uuidv4();
      const qrHash = generateQrHash(bookingId, event._id.toString(), req.user.id);
      const qrImage = await QRCode.toDataURL(qrHash);

      const booking = new Booking({
        userId:        req.user.id,
        eventId,
        bookingId,
        qrCode:        qrHash,
        qrImage,
        seatNumber:    String(assignedSeats[i]),
        paymentStatus: 'SUCCESS',
        status:        'active',
        eventDate:     event.date,
      });
      await booking.save();
      bookings.push(booking);

      event.attendees.push({
        userId:   req.user.id,
        ticketId: booking._id,
        qrCode:   qrHash,
        status:   'absent',
      });
    }

    event.soldTickets += qty;
    await event.save();

    const booker = await User.findById(req.user.id);
    const bookerName = booker?.name || 'A user';

    await createNotification(
      req.user.id, 'USER', 'booking',
      `Booking confirmed for "${event.title}" — ${qty} ticket${qty > 1 ? 's' : ''}.`,
      event._id
    );

    await createNotification(
      event.organiserId, 'ORGANISER', 'booking',
      `New booking by ${bookerName} for "${event.title}" — ${qty} ticket${qty > 1 ? 's' : ''}.`,
      event._id
    );

    const populated = await Promise.all(
      bookings.map(b => b.populate({ path: 'eventId', populate: { path: 'venueId' } }))
    );
    res.status(201).json(populated.length === 1 ? populated[0] : populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/cancel', authMiddleware, roleMiddleware(['USER']), async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Booking is not active' });
    }

    const event = await Event.findById(booking.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const now = new Date();
    const eventDate = new Date(event.date);
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

    if (hoursUntilEvent <= 6) {
      return res.status(400).json({
        message: 'Cancellation closed — event starts within 6 hours',
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = now;
    booking.refundStatus = 'pending';
    booking.refundAmount = event.ticketPrice || 0;
    booking.attendanceStatus = 'cancelled';
    await booking.save();

    event.soldTickets = Math.max(0, event.soldTickets - 1);
    event.cancelledTickets = (event.cancelledTickets || 0) + 1;
    const attendee = event.attendees.find(
      a => a.ticketId && a.ticketId.toString() === booking._id.toString()
    );
    if (attendee) attendee.status = 'cancelled';
    await event.save();

    const canceller = await User.findById(req.user.id);
    const cancellerName = canceller?.name || 'A user';

    await createNotification(
      req.user.id, 'USER', 'cancellation',
      `Your ticket for "${event.title}" has been cancelled. Refund of ₹${event.ticketPrice} is pending.`,
      event._id
    );

    await createNotification(
      event.organiserId, 'ORGANISER', 'cancellation',
      `${cancellerName} cancelled their ticket for "${event.title}". Refund of ₹${event.ticketPrice} is pending.`,
      event._id
    );

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-tickets', authMiddleware, roleMiddleware(['USER']), async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({ path: 'eventId', populate: { path: 'venueId' } })
      .sort({ createdAt: -1 });

    const now = new Date();
    const result = bookings.map(b => {
      const obj = b.toObject();
      if (obj.eventId && obj.eventId.date) {
        const eventDate = new Date(obj.eventId.date);
        const hoursLeft = (eventDate - now) / (1000 * 60 * 60);
        obj.canCancel = obj.status === 'active' && hoursLeft > 6;
        obj.hoursUntilEvent = hoursLeft;
      } else {
        obj.canCancel = false;
        obj.hoursUntilEvent = 0;
      }
      return obj;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/process-refund', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const event = await Event.findById(booking.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organiserId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your event' });
    }

    if (booking.refundStatus !== 'pending') {
      return res.status(400).json({ message: `Refund is already ${booking.refundStatus}` });
    }

    booking.refundStatus = 'completed';
    booking.refundDate = new Date();
    await booking.save();

    await createNotification(
      booking.userId, 'USER', 'refund',
      `Refund of ₹${booking.refundAmount} for "${event.title}" has been processed.`,
      event._id
    );

    res.json({ message: 'Refund processed', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
