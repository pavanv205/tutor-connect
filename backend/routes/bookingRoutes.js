const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createBooking);
router.get('/', protect, getBookings);
router.put('/:id', protect, updateBooking);

module.exports = router;
