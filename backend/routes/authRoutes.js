const express = require('express');
const router = express.Router();
const { upload } = require('../utils/uploadHelper');
const { registerTutor, registerStudent, login, getMe, checkEmail } = require('../controllers/authController');
const { forgotPassword, verifyOtp, resetPassword } = require('../controllers/passwordController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if Cloudinary configuration is complete
const checkCloudinaryConfig = (req, res, next) => {
  const missing = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
  
  if (missing.length > 0) {
    console.warn(`[CONFIG WARNING] Cloudinary configuration is incomplete. Missing: ${missing.join(', ')}. Falling back to local upload storage.`);
  }
  next();
};

// Middleware wrapper for Multer upload error handling
const handleUpload = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      console.error('[UPLOAD ERROR] Multer/Cloudinary upload failed:', err.message);
      
      // Handle file size limit exceeded
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size limit exceeded. Maximum allowed size is 2MB per file.'
        });
      }
      
      // Handle custom file type exclusions or other multer errors
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
    }
    next();
  });
};

router.post('/register', checkCloudinaryConfig, handleUpload, registerTutor);
router.post('/register-student', registerStudent);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/check-email', checkEmail);

module.exports = router;
