const Tutor = require('../models/Tutor');
const path = require('path');

exports.createTutor = async (req, res, next) => {
  try {
    const data = req.body || {};
    if (req.file) {
      data.resumeUrl = req.file.path; // Cloudinary secure URL
      data.photo = data.resumeUrl;
      console.log('Uploaded image URL from Cloudinary:', data.resumeUrl);
    }

    // Basic server-side validation
    if (!(data.fullName || data.name) || !(data.mobile || data.phone)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Parse array fields if sent as JSON strings (multipart/form-data)
    const parseIfJson = (val) => {
      if (!val) return val;
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { return JSON.parse(val); } catch (e) { return val; }
      }
      return val;
    };

    const baseName = (data.fullName || data.name || 'tutor').toLowerCase().replace(/[^a-z0-9]/g, '');
    const emailAddr = data.email || `${baseName}_${Date.now()}@tutorconnect.com`;

    const tutor = new Tutor({
      fullName: data.fullName || data.name,
      mobile: data.mobile || data.phone,
      email: emailAddr,
      gender: data.gender,
      age: data.age ? Number(data.age) : undefined,
      dateOfBirth: data.dateOfBirth,
      qualification: data.qualification || data.degree,
      university: data.university || data.institution,
      graduationYear: (data.graduationYear || data.passingYear) ? Number(data.graduationYear || data.passingYear) : undefined,
      experience: (data.experience || data.experienceYears) ? Number(data.experience || data.experienceYears) : undefined,
      previousInstitutions: parseIfJson(data.previousInstitutions) || [],
      methodology: data.methodology,
      subjects: parseIfJson(data.subjects) || [],
      classes: parseIfJson(data.classes) || [],
      competitiveExamCoaching: data.competitiveExamCoaching === 'true' || data.competitiveExamCoaching === true,
      teachingMode: data.teachingMode,
      preferredLocations: parseIfJson(data.preferredLocations) || [],
      availableTimings: parseIfJson(data.availableTimings) || [],
      feeRange: data.feeRange,
      languages: parseIfJson(data.languages) || [],
      bio: data.bio,
      resumeUrl: data.resumeUrl,
      photo: data.photo,
      streetAddress: data.streetAddress || data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
      hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
      monthlyRate: data.monthlyRate ? Number(data.monthlyRate) : undefined
    });

    const saved = await tutor.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

exports.getTutors = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.subject) filters.subjects = { $in: [req.query.subject] };
    if (req.query.search) filters.$text = { $search: req.query.search };
    const tutors = await Tutor.find(filters).sort({ createdAt: -1 }).limit(100);
    res.json(tutors);
  } catch (err) {
    next(err);
  }
};

exports.getTutorById = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });
    res.json(tutor);
  } catch (err) {
    next(err);
  }
};

exports.updateTutor = async (req, res, next) => {
  try {
    const data = req.body || {};
    if (req.file) {
      data.resumeUrl = req.file.path;
      data.photo = req.file.path;
    }
    const updated = await Tutor.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Tutor not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteTutor = async (req, res, next) => {
  try {
    const removed = await Tutor.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, message: 'Tutor not found' });
    res.json({ success: true, message: 'Tutor removed' });
  } catch (err) {
    next(err);
  }
};
