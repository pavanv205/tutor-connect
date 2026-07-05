const mongoose = require('mongoose');

const TutorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  certificateUrl: { type: String },
  leadsCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  streetAddress: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  hourlyRate: { type: Number },
  monthlyRate: { type: Number },
  referralCode: { type: String, default: '' },
  ownReferralCode: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedDate: { type: Date }
}, { timestamps: true });

// Optimize query performance for search filters, sorting, and geo Proximity
TutorSchema.index({ state: 1, city: 1 });
TutorSchema.index({ subjects: 1 });
TutorSchema.index({ classes: 1 });
TutorSchema.index({ isVerified: 1 });
TutorSchema.index({ hourlyRate: 1 });

// Pre-save hook to generate a unique referral code if missing
TutorSchema.pre('save', async function(next) {
  if (!this.ownReferralCode) {
    let code;
    let exists = true;
    while (exists) {
      code = 'TC';
      for (let i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 6) + 1;
      }
      const count = await this.constructor.countDocuments({ ownReferralCode: code });
      if (count === 0) {
        exists = false;
      }
    }
    this.ownReferralCode = code;
  }
  next();
});

module.exports = mongoose.model('Tutor', TutorSchema);
