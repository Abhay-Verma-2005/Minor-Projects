const cron = require('node-cron');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationHelper');

function initCronJobs() {
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running hourly ticket status management...');
    const now = new Date();

    try {
      const pastEvents = await Event.find({ date: { $lt: now } });

      for (const event of pastEvents) {
        await Booking.updateMany(
          { eventId: event._id, status: 'active' },
          { $set: { status: 'expired' } }
        );

        if (event.status === 'Live') {
          event.status = 'Completed';
          await event.save();
        }
      }

      const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      await Event.updateMany(
        {
          date: { $lte: sixHoursFromNow, $gt: now },
          cancellationAllowed: true,
        },
        { $set: { cancellationAllowed: false } }
      );

      const sixHalfHrStart = new Date(now.getTime() + 6 * 60 * 60 * 1000 + 25 * 60 * 1000);
      const sixHalfHrEnd   = new Date(now.getTime() + 6 * 60 * 60 * 1000 + 35 * 60 * 1000);

      const eventsIn6HalfHours = await Event.find({
        date: { $gte: sixHalfHrStart, $lte: sixHalfHrEnd },
        status: 'Live',
      });

      for (const event of eventsIn6HalfHours) {
        const bookings = await Booking.find({ eventId: event._id, status: 'active' });

        const notifiedUsers = new Set();
        for (const booking of bookings) {
          const uid = booking.userId.toString();
          if (notifiedUsers.has(uid)) continue;
          notifiedUsers.add(uid);

          const existing = await Notification.findOne({
            userId: booking.userId,
            eventId: event._id,
            type: 'reminder',
            message: { $regex: 'starts in 6 hours 30 minutes' },
          });

          if (!existing) {
            await createNotification(
              booking.userId,
              'USER',
              'reminder',
              `Your event "${event.title}" starts in 6 hours 30 minutes!`,
              event._id
            );
          }
        }
      }

      console.log('[CRON] Hourly job completed successfully.');
    } catch (err) {
      console.error('[CRON] Error in hourly job:', err);
    }
  });

  console.log('[CRON] Scheduled hourly ticket status management job.');
}

module.exports = { initCronJobs };
