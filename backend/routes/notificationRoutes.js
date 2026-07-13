const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, getVapidPublicKey, subscribePush } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All notification routes are protected
router.use(protect);

router.get('/', getNotifications);
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', subscribePush);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
