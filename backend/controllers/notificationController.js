const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const dbFallback = require('../utils/dbFallback');
const webpush = require('web-push');

let vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Auto-generate VAPID keys dynamically if missing from environment variables
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.log('[PUSH SERVICE] Generating dynamic VAPID keys...');
  const keys = webpush.generateVAPIDKeys();
  vapidKeys.publicKey = keys.publicKey;
  vapidKeys.privateKey = keys.privateKey;
}

webpush.setVapidDetails(
  'mailto:supporthometutorx@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const isOffline = mongoose.connection.readyState !== 1;
    let list = [];
    if (isOffline) {
      const all = await dbFallback.getNotifications();
      // Filter by recipient string comparison
      list = all.filter(n => String(n.recipient) === String(req.user._id));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      list = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const isOffline = mongoose.connection.readyState !== 1;
    let updated;
    if (isOffline) {
      updated = await dbFallback.markNotificationAsRead(req.params.id);
    } else {
      updated = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { isRead: true },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications for user as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      await dbFallback.markAllNotificationsAsRead(req.user._id);
    } else {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get VAPID public key for frontend push subscription
// @route   GET /api/notifications/vapid-public-key
// @access  Private
exports.getVapidPublicKey = (req, res) => {
  res.status(200).json({
    success: true,
    publicKey: vapidKeys.publicKey
  });
};

// @desc    Subscribe client to browser Web Push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
exports.subscribePush = async (req, res, next) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, message: 'Invalid push subscription payload' });
    }

    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      await dbFallback.addPushSubscription(req.user._id, subscription);
    } else {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Avoid adding duplicate endpoints
      const exists = user.pushSubscriptions.find(s => s.endpoint === subscription.endpoint);
      if (!exists) {
        user.pushSubscriptions.push(subscription);
        await user.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Push subscription registered successfully'
    });
  } catch (err) {
    next(err);
  }
};
