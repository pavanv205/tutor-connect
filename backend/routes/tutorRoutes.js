const express = require('express');
const router = express.Router();
const { upload } = require('../utils/uploadHelper');
const tutorController = require('../controllers/tutorController');

// Routes
router.post('/', upload.single('resume'), tutorController.createTutor);
router.get('/', tutorController.getTutors);
router.get('/:id', tutorController.getTutorById);
router.put('/:id', upload.single('resume'), tutorController.updateTutor);
router.delete('/:id', tutorController.deleteTutor);

module.exports = router;
