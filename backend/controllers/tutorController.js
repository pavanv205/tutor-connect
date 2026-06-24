const Tutor = require('../models/Tutor');
const mongoose = require('mongoose');
const { getFileUrl } = require('../utils/uploadHelper');
const path = require('path');

exports.createTutor = async (req, res, next) => {
  try {
    const data = req.body || {};
    let photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    let certificateUrl = '';
    if (req.files && req.files['resume'] && req.files['resume'][0]) {
      photoUrl = getFileUrl(req.files['resume'][0]);
      console.log('Uploaded image URL:', photoUrl);
    } else if (req.file) {
      photoUrl = getFileUrl(req.file);
      console.log('Uploaded image URL:', photoUrl);
    }
    if (req.files && req.files['certificate'] && req.files['certificate'][0]) {
      certificateUrl = getFileUrl(req.files['certificate'][0]);
      console.log('Uploaded certificate URL:', certificateUrl);
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
      resumeUrl: photoUrl,
      photo: photoUrl,
      certificateUrl: certificateUrl,
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
    if (req.query.subject && req.query.subject !== 'All') {
      filters.subjects = { $in: [req.query.subject] };
    }
    if (req.query.search) {
      const q = String(req.query.search);
      filters.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { qualification: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { subjects: { $elemMatch: { $regex: q, $options: 'i' } } },
        { state: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ];
    }
    if (req.query.gradeClass && req.query.gradeClass !== 'All') {
      filters.classes = { $in: [req.query.gradeClass] };
    }
    if (req.query.mode && req.query.mode !== 'All') {
      filters.teachingMode = req.query.mode;
    }
    if (req.query.state && req.query.state !== 'All') {
      filters.state = req.query.state;
    }
    if (req.query.division && req.query.division !== 'All') {
      filters.city = req.query.division; // division is stored in 'city' field in database
    }
    if (req.query.maxPrice) {
      filters.hourlyRate = { $lte: Number(req.query.maxPrice) };
    }

    const tutors = await Tutor.find(filters).sort({ createdAt: -1 }).limit(100).lean();
    res.json(tutors);
  } catch (err) {
    next(err);
  }
};

exports.getTutorById = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id).lean();
    if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });
    res.json(tutor);
  } catch (err) {
    next(err);
  }
};

exports.updateTutor = async (req, res, next) => {
  try {
    const data = req.body || {};
    if (req.files && req.files['resume'] && req.files['resume'][0]) {
      const fileUrl = getFileUrl(req.files['resume'][0]);
      data.resumeUrl = fileUrl;
      data.photo = fileUrl;
    } else if (req.file) {
      const fileUrl = getFileUrl(req.file);
      data.resumeUrl = fileUrl;
      data.photo = fileUrl;
    }
    if (req.files && req.files['certificate'] && req.files['certificate'][0]) {
      data.certificateUrl = getFileUrl(req.files['certificate'][0]);
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
