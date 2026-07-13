const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const dbFallback = require('../utils/dbFallback');
const webpush = require('web-push');

const createNotification = async (recipientId, type, message) => {
  try {
    const isOffline = mongoose.connection.readyState !== 1;
    let newNotification;
    let recipientUser;

    if (isOffline) {
      console.log(`🔌 MongoDB is offline. Saving notification in fallback memory for recipient: ${recipientId}`);
      const notificationId = 'fallback-notification-' + Math.random().toString(36).substr(2, 9);
      newNotification = {
        _id: notificationId,
        recipient: String(recipientId),
        type,
        message,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await dbFallback.saveNotification(newNotification);

      const usersList = await dbFallback.getUsers();
      recipientUser = usersList.find(u => String(u._id) === String(recipientId));
    } else {
      newNotification = await Notification.create({
        recipient: recipientId,
        type,
        message
      });

      const User = require('../models/User');
      recipientUser = await User.findById(recipientId);
    }

    // Trigger Web Push lock screen notifications if active subscriptions exist
    if (recipientUser && recipientUser.pushSubscriptions && recipientUser.pushSubscriptions.length > 0) {
      // Determine redirection URL based on user role
      const redirectUrl = recipientUser.role === 'Tutor' 
        ? '/tutor/dashboard' 
        : recipientUser.role === 'Student' 
        ? '/student/dashboard' 
        : '/admin/dashboard';

      const payload = JSON.stringify({
        title: 'HomeTutorX Notification',
        body: message,
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: { url: redirectUrl }
      });

      // Dispatch pushes to all registered user endpoints in parallel
      const sendPromises = recipientUser.pushSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload);
        } catch (error) {
          console.error('[PUSH ERROR] Failed to deliver push notification:', error.message);
          
          // Clear expired/gone subscriptions (HTTP 410 / 404)
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[PUSH SERVICE] Removing dead subscription for endpoint: ${sub.endpoint}`);
            if (isOffline) {
              const idx = recipientUser.pushSubscriptions.findIndex(s => s.endpoint === sub.endpoint);
              if (idx !== -1) {
                recipientUser.pushSubscriptions.splice(idx, 1);
              }
            } else {
              const User = require('../models/User');
              await User.findByIdAndUpdate(recipientId, {
                $pull: { pushSubscriptions: { endpoint: sub.endpoint } }
              });
            }
          }
        }
      });

      await Promise.all(sendPromises);
    }

    return newNotification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

module.exports = {
  createNotification
};
