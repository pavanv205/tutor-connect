const express = require('express');
const router = express.Router();
const { getDashboardStats, verifyTutor, adminUpdateTutor } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getDashboardStats);
router.put('/tutors/:id/verify', verifyTutor);
router.put('/tutors/:id', adminUpdateTutor);

module.exports = router;
