const express = require('express');
const router = express.Router();
const { upload } = require('../utils/uploadHelper');
const { registerTutor, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]), registerTutor);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
