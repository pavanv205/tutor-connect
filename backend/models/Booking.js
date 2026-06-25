const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Please add a student name'],
    trim: true
  },
  studentEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    lowercase: true,
    trim: true
  },
  studentPhone: {
    type: String,
    required: [true, 'Please add a contact phone number']
  },
  subject: {
    type: String,
    required: [true, 'Please specify the subject']
  },
  gradeClass: {
    type: String,
    required: [true, 'Please specify the class/grade']
  },
  message: {
    type: String
  },
  preferredMode: {
    type: String,
    enum: ['Online', 'Offline', 'Both'],
    default: 'Both'
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Assigned', 'Rejected'],
    default: 'Pending'
  },
  assignedTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
