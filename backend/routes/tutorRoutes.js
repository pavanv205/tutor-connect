const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const tutorController = require('../controllers/tutorController');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tutor_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage });

// Routes
router.post('/', upload.single('resume'), tutorController.createTutor);
router.get('/', tutorController.getTutors);
router.get('/:id', tutorController.getTutorById);
router.put('/:id', upload.single('resume'), tutorController.updateTutor);
router.delete('/:id', tutorController.deleteTutor);

module.exports = router;
