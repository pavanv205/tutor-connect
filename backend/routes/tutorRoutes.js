const express = require('express');
const router = express.Router();
const { upload } = require('../utils/uploadHelper');
const tutorController = require('../controllers/tutorController');

// Routes
router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]), tutorController.createTutor);
router.get('/', tutorController.getTutors);
router.get('/:id', tutorController.getTutorById);
router.put('/:id', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]), tutorController.updateTutor);
router.delete('/:id', tutorController.deleteTutor);

module.exports = router;
