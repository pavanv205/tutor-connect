const mongoose = require('mongoose');

const TutorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  gender: { type: String },
  age: { type: Number },
  dateOfBirth: { type: Date },
  qualification: { type: String },
  university: { type: String },
  graduationYear: { type: Number },
  experience: { type: Number },
  previousInstitutions: { type: [String], default: [] },
  methodology: { type: String },
  subjects: { type: [String], default: [] },
  classes: { type: [String], default: [] },
  competitiveExamCoaching: { type: Boolean, default: false },
  teachingMode: { type: String },
  preferredLocations: { type: [String], default: [] },
  availableTimings: { type: [String], default: [] },
  feeRange: { type: String },
  languages: { type: [String], default: [] },
  bio: { type: String },
  resumeUrl: { type: String },
  photo: { type: String },
  streetAddress: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  hourlyRate: { type: Number },
  monthlyRate: { type: Number },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Tutor', TutorSchema);
