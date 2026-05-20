const Notification = require('../models/Notification');

async function createNotification(recipientId, recipientRole, type, message, eventId = null) {
  try {
    await Notification.create({
      userId: recipientId,
      recipientRole,
      type,
      message,
      read: false,
      eventId,
    });
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
  }
}

module.exports = { createNotification };
