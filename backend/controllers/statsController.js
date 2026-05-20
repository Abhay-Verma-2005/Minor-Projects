const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

const getComparisonRanges = (days) => {
  const now = new Date();
  
  const currentStart = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  const previousStart = new Date(now.getTime() - (2 * days * 24 * 60 * 60 * 1000));
  const previousEnd = currentStart;

  return { currentStart, previousStart, previousEnd };
};

const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

exports.getProviderStats = async (req, res) => {
  try {
    const providerId = new mongoose.Types.ObjectId(req.user.id);
    const { filter = 'month' } = req.query;

    const venues = await Venue.find({ providerId });
    const allBookings = venues.flatMap(v => v.bookings || []);

    const month30 = getComparisonRanges(30);
    const week7 = getComparisonRanges(7);
    const day1 = getComparisonRanges(1);

    const currentVenuesCount = venues.length;
    const prevVenuesCount = await Venue.countDocuments({ 
      providerId, 
      createdAt: { $lt: month30.currentStart } 
    });
    const venueTrend = calculateTrend(currentVenuesCount, prevVenuesCount);

    const curRequests = allBookings.filter(b => b.bookedAt >= week7.currentStart).length;
    const prevRequests = allBookings.filter(b => b.bookedAt >= week7.previousStart && b.bookedAt < week7.previousEnd).length;
    const requestsTrend = calculateTrend(curRequests, prevRequests);

    const curConfirmed = allBookings.filter(b => b.status === 'confirmed' && b.bookedAt >= week7.currentStart).length;
    const prevConfirmed = allBookings.filter(b => b.status === 'confirmed' && b.bookedAt >= week7.previousStart && b.bookedAt < week7.previousEnd).length;
    const confirmedTrend = calculateTrend(curConfirmed, prevConfirmed);

    const curRejected = allBookings.filter(b => b.status === 'rejected' && b.bookedAt >= month30.currentStart).length;
    const prevRejected = allBookings.filter(b => b.status === 'rejected' && b.bookedAt >= month30.previousStart && b.bookedAt < month30.previousEnd).length;
    const rejectedTrend = calculateTrend(curRejected, prevRejected);

    const curPending = allBookings.filter(b => b.status === 'pending' && b.bookedAt >= day1.currentStart).length;
    const prevPending = allBookings.filter(b => b.status === 'pending' && b.bookedAt >= day1.previousStart && b.bookedAt < day1.previousEnd).length;
    const pendingTrend = calculateTrend(curPending, prevPending);

    let revDays = 30;
    if (filter === 'day') revDays = 1;
    if (filter === 'week') revDays = 7;
    
    const revRange = getComparisonRanges(revDays);
    const curRevenue = allBookings
      .filter(b => b.status === 'confirmed' && b.bookedAt >= revRange.currentStart)
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const prevRevenue = allBookings
      .filter(b => b.status === 'confirmed' && b.bookedAt >= revRange.previousStart && b.bookedAt < revRange.previousEnd)
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const revenueTrend = calculateTrend(curRevenue, prevRevenue);

    res.json({
      totalVenues: { value: currentVenuesCount, trend: venueTrend },
      totalRequests: { value: curRequests, trend: requestsTrend },
      confirmed: { value: curConfirmed, trend: confirmedTrend },
      rejected: { value: curRejected, trend: rejectedTrend },
      pending: { value: curPending, trend: pendingTrend },
      revenue: { value: curRevenue, trend: revenueTrend }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrganiserStats = async (req, res) => {
  try {
    const organiserId = new mongoose.Types.ObjectId(req.user.id);
    const { period = 'total', eventId } = req.query;

    const events = await Event.find({ organiserId }).select('_id title status createdAt ticketPrice likes');
    
    let filteredEvents = events;
    const now = new Date();
    
    if (period === 'today') {
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      filteredEvents = events.filter(e => e.createdAt >= startOfToday);
    } else if (period === 'yesterday') {
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(now);
      endOfYesterday.setHours(0, 0, 0, 0);
      filteredEvents = events.filter(e => e.createdAt >= startOfYesterday && e.createdAt < endOfYesterday);
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      filteredEvents = events.filter(e => e.createdAt >= startOfWeek);
    } else if (period === 'month') {
      const startOfMonth = new Date(now);
      startOfMonth.setMonth(startOfMonth.getMonth() - 1);
      filteredEvents = events.filter(e => e.createdAt >= startOfMonth);
    }

    const totalEventsCount = filteredEvents.length;
    
    const week7 = getComparisonRanges(7);
    const prevEventsCount = await Event.countDocuments({ 
      organiserId, 
      createdAt: { $lt: week7.currentStart } 
    });
    const eventsTrend = calculateTrend(events.length, prevEventsCount);

    const liveEventsCount = events.filter(e => e.status === 'Live').length;

    const totalLikes = events.reduce((sum, e) => sum + (e.likes?.length || 0), 0);

    let bookingQuery = { paymentStatus: 'SUCCESS' };
    if (eventId && eventId !== 'total') {
      bookingQuery.eventId = new mongoose.Types.ObjectId(eventId);
    } else {
      bookingQuery.eventId = { $in: events.map(e => e._id) };
    }

    const bookings = await Booking.find(bookingQuery);
    const eventMap = events.reduce((acc, e) => ({ ...acc, [e._id.toString()]: e }), {});

    const ticketsSold = bookings.filter(b => b.status === 'active').length;
    const cancellations = bookings.filter(b => b.status === 'cancelled').length;
    const pendingRefundsCount = bookings.filter(b => b.status === 'cancelled' && b.refundStatus === 'pending').length;
    
    const revenue = bookings
      .filter(b => b.status === 'active')
      .reduce((sum, b) => {
        const evt = eventMap[b.eventId.toString()];
        return sum + (evt ? (evt.ticketPrice || 0) : 0);
      }, 0);

    const day1 = getComparisonRanges(1);
    const curSold = bookings.filter(b => b.status === 'active' && b.createdAt >= day1.currentStart).length;
    const prevSold = bookings.filter(b => b.status === 'active' && b.createdAt >= day1.previousStart && b.createdAt < day1.previousEnd).length;
    const soldTrend = calculateTrend(curSold, prevSold);

    const curRev = bookings
      .filter(b => b.status === 'active' && b.createdAt >= day1.currentStart)
      .reduce((sum, b) => sum + (eventMap[b.eventId.toString()]?.ticketPrice || 0), 0);
    const prevRev = bookings
      .filter(b => b.status === 'active' && b.createdAt >= day1.previousStart && b.createdAt < day1.previousEnd)
      .reduce((sum, b) => sum + (eventMap[b.eventId.toString()]?.ticketPrice || 0), 0);
    const revTrend = calculateTrend(curRev, prevRev);

    res.json({
      totalEvents: { value: totalEventsCount, trend: eventsTrend },
      liveEvents: { value: liveEventsCount, trend: 0 },
      ticketsSold: { value: ticketsSold, trend: soldTrend },
      cancellations: { value: cancellations, trend: 0 },
      pendingRefunds: { value: pendingRefundsCount, trend: 0 },
      revenue: { value: revenue, trend: revTrend },
      totalLikes: { value: totalLikes, trend: 0 },
      availableEvents: events.map(e => ({ id: e._id, title: e.title, status: e.status }))
    });
  } catch (error) {
    console.error("Organiser Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};
