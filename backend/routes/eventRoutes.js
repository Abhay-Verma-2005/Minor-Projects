const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/', async (req, res) => {
  try {
    const { city, search } = req.query;
    let events = await Event.find({ status: { $in: ['Live', 'Completed'] } })
      .populate('venueId')
      .populate('organiserId', 'name')
      .sort({ createdAt: -1 });

    if (city) {
      events = events.filter(e =>
        e.venueId?.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (search) {
      events = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.venueId?.city?.toLowerCase().includes(search.toLowerCase()) ||
        e.venueId?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const events = await Event.find({ status: 'Live' })
      .populate('venueId')
      .populate('organiserId', 'name')
      .sort({ createdAt: -1 });

    const nearby = events
      .filter(e => {
        const vLat = e.venueId?.latitude;
        const vLng = e.venueId?.longitude;
        if (!vLat || !vLng) return false;
        return haversine(Number(lat), Number(lng), vLat, vLng) <= Number(radius);
      })
      .slice(0, 8);

    res.json(nearby);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-events', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const events = await Event.find({ organiserId: req.user.id })
      .populate('venueId')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching your events' });
  }
});

router.post('/create', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const { venueId, title, description, date, endDate, ticketPrice, totalTickets, bannerImage, photos, hashtags, ticketTheme, status } = req.body;
    if (!venueId || !title || !description || !date || !ticketPrice || !totalTickets) {
      return res.status(400).json({ message: 'All required fields must be filled (venueId, title, description, date, ticketPrice, totalTickets)' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid start date format' });
    }

    let parsedEndDate = null;
    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: 'Invalid end date format' });
      }
    }

    const event = new Event({
      organiserId:  req.user.id,
      venueId,
      title,
      description,
      date:         parsedDate,
      endDate:      parsedEndDate,
      ticketPrice:  Number(ticketPrice),
      totalTickets: Number(totalTickets),
      bannerImage:  bannerImage || '',
      photos:       Array.isArray(photos) ? photos : [],
      hashtags:     Array.isArray(hashtags) ? hashtags : [],
      ticketTheme:  ticketTheme || '',
      status:       status || 'Draft',
    });
    await event.save();
    const populated = await event.populate('venueId');
    res.status(201).json(populated);
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(500).json({ message: 'Server error creating event: ' + err.message });
  }
});

router.patch('/:id/status', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Draft', 'Live', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organiserId: req.user.id },
      { status },
      { new: true }
    ).populate('venueId');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organiserId: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found or not yours' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/attendees', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const bookings = await Booking.find({ eventId: req.params.id })
      .populate('userId', 'name email')
      .populate('eventId', 'ticketPrice');

    const response = bookings.map(booking => {
      const price = booking.refundAmount || (booking.eventId && booking.eventId.ticketPrice) || 0;
      return {
        _id:              booking._id,
        userId:           booking.userId,
        ticketId:         booking._id,
        bookingId:        booking.bookingId,
        purchaseDate:     booking.createdAt,
        ticketPrice:      price,
        seatNumber:       booking.seatNumber,
        attendanceStatus: booking.attendanceStatus,
        ticketStatus:     booking.status,
        refundStatus:     booking.refundStatus,
        refundAmount:     booking.refundAmount,
        refundDate:       booking.refundDate,
        scannedAt:        booking.scannedAt,
        isCancelled:      booking.status === 'cancelled',
      };
    });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/pending-refunds', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const refunds = await Booking.find({
      eventId: req.params.id,
      status: 'cancelled',
      refundStatus: 'pending',
    })
      .populate('userId', 'name email')
      .populate('eventId', 'title ticketPrice');

    res.json(refunds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/attendance/:ticketId', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const { attended } = req.body;
    const event = await Event.findOne({ _id: req.params.id, organiserId: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found or not yours' });

    const attendee = event.attendees.find(a => a.ticketId.toString() === req.params.ticketId);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found' });
    if (attendee.status === 'cancelled') return res.status(400).json({ message: 'Booking is cancelled' });

    attendee.status = attended ? 'attended' : 'absent';
    await event.save();

    await Booking.findByIdAndUpdate(req.params.ticketId, {
      attendanceStatus: attended ? 'attended' : 'not_attended',
      scannedAt: attended ? new Date() : null,
    });

    res.json({ message: 'Attendance updated', attendee });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/scan', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  try {
    const { qrData } = req.body;
    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({ message: 'reject (invalid)' });
    }

    const qrHash = qrData.trim();

    const booking = await Booking.findOne({ qrCode: qrHash, eventId: req.params.id });
    if (!booking) return res.status(404).json({ message: 'reject (invalid)' });

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'reject (cancelled)' });
    }

    if (booking.scannedAt) {
      return res.status(400).json({ message: 'reject (duplicate)' });
    }

    booking.scannedAt = new Date();
    booking.attendanceStatus = 'attended';
    await booking.save();

    const event = await Event.findOne({ _id: req.params.id, organiserId: req.user.id });
    if (event) {
      const attendee = event.attendees.find(a => a.ticketId.toString() === booking._id.toString());
      if (attendee) {
        attendee.status = 'attended';
        await event.save();
      }
    }

    res.json({ message: 'mark as checked-in', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const idx = event.likes.findIndex(id => id.toString() === req.user.id);
    if (idx === -1) event.likes.push(req.user.id);
    else event.likes.splice(idx, 1);
    await event.save();
    res.json({ likes: event.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const idx = event.saves.findIndex(id => id.toString() === req.user.id);
    if (idx === -1) event.saves.push(req.user.id);
    else event.saves.splice(idx, 1);
    await event.save();
    res.json({ saves: event.saves.length, saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });
    const user  = await User.findById(req.user.id);
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.comments.push({ userId: req.user.id, name: user.name, text: text.trim() });
    await event.save();
    res.json(event.comments[event.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
