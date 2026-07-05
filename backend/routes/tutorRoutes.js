const express = require('express');
const router = express.Router();
const { upload } = require('../utils/uploadHelper');
const tutorController = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/', protect, upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]), tutorController.createTutor);
router.get('/', tutorController.getTutors);
router.get('/my-referrals', protect, tutorController.getMyReferrals);
router.get('/:id', tutorController.getTutorById);
router.put('/:id', protect, upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]), tutorController.updateTutor);
router.delete('/:id', protect, tutorController.deleteTutor);

module.exports = router;
