const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Exclude from queries by default
  },
  role: {
    type: String,
    enum: ['Admin', 'Tutor', 'Student'],
    default: 'Tutor'
  },
  phone: {
    type: String
  },
  tutorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  paymentId: {
    type: String
  },
   subscriptionExpiresAt: {
    type: Date
  },
  pushSubscriptions: [
    {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      }
    }
  ]
}, {
  timestamps: true
});

// Encrypt password using bcryptjs before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure an email can be used for both Student and Tutor roles independently
UserSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
