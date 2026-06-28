const Tutor = require('../models/Tutor');
const mongoose = require('mongoose');
const { getFileUrl } = require('../utils/uploadHelper');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to determine if the request is from an admin
const checkIsAdmin = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      if (!process.env.JWT_SECRET) return false;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;
      if (mongoose.connection.readyState !== 1) {
        const dbFallback = require('../utils/dbFallback');
        const usersList = await dbFallback.getUsers();
        user = usersList.find(u => String(u._id) === String(decoded.id));
      } else {
        user = await User.findById(decoded.id);
      }
      return user && user.role === 'Admin';
    } catch (err) {
      return false;
    }
  }
  return false;
};

// Helper to log only in development mode
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const devError = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

exports.createTutor = async (req, res, next) => {
  try {
    const data = req.body || {};
    let photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    let certificateUrl = '';
    
    if (req.files && req.files['resume'] && req.files['resume'][0]) {
      photoUrl = getFileUrl(req.files['resume'][0]);
      devLog('Uploaded image URL:', photoUrl);
    } else if (req.file) {
      photoUrl = getFileUrl(req.file);
      devLog('Uploaded image URL:', photoUrl);
    }
    
    if (req.files && req.files['certificate'] && req.files['certificate'][0]) {
      certificateUrl = getFileUrl(req.files['certificate'][0]);
      devLog('Uploaded certificate URL:', certificateUrl);
    }

    // 1. Guard check: Check if user already has a tutor profile
    const existingTutor = await Tutor.findOne({ userId: req.user._id });
    if (existingTutor) {
      return res.status(400).json({ success: false, message: 'A tutor profile already exists for this user account' });
    }

    // 2. Request Input Validation
    const nameVal = data.fullName || data.name;
    const phoneVal = data.mobile || data.phone;
    const emailVal = data.email;
    const genderVal = data.gender;
    const qualificationVal = data.qualification || data.degree;
    const subjectsVal = data.subjects;
    const classesVal = data.classes;
    const teachingModeVal = data.teachingMode;

    if (!nameVal || !phoneVal || !emailVal || !genderVal || !qualificationVal || !subjectsVal || !classesVal || !teachingModeVal) {
      return res.status(400).json({ success: false, message: 'Missing required tutor profile fields' });
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(emailVal)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Phone validation (min 10 characters)
    if (phoneVal.length < 10) {
      return res.status(400).json({ success: false, message: 'Phone number must be at least 10 characters long' });
    }

    // Parse array fields if sent as JSON strings (multipart/form-data)
    const parseIfJson = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { return JSON.parse(val); } catch (e) { return [val]; }
      }
      return [val];
    };

    const parsedSubjects = parseIfJson(subjectsVal);
    const parsedClasses = parseIfJson(classesVal);

    if (parsedSubjects.length === 0 || parsedClasses.length === 0) {
      return res.status(400).json({ success: false, message: 'Please specify at least one subject and class' });
    }

    // Validation for rate values if provided
    if (data.hourlyRate !== undefined && data.hourlyRate !== '') {
      const rate = Number(data.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        return res.status(400).json({ success: false, message: 'Hourly rate must be a non-negative number' });
      }
    }

    if (data.monthlyRate !== undefined && data.monthlyRate !== '') {
      const rate = Number(data.monthlyRate);
      if (isNaN(rate) || rate < 0) {
        return res.status(400).json({ success: false, message: 'Monthly rate must be a non-negative number' });
      }
    }

    const tutor = new Tutor({
      userId: req.user._id,
      fullName: nameVal,
      mobile: phoneVal,
      email: emailVal,
      gender: genderVal,
      age: data.age ? Number(data.age) : undefined,
      dateOfBirth: data.dateOfBirth,
      qualification: qualificationVal,
      university: data.university || data.institution,
      graduationYear: (data.graduationYear || data.passingYear) ? Number(data.graduationYear || data.passingYear) : undefined,
      experience: (data.experience || data.experienceYears) ? Number(data.experience || data.experienceYears) : undefined,
      previousInstitutions: parseIfJson(data.previousInstitutions) || [],
      methodology: data.methodology,
      subjects: parsedSubjects,
      classes: parsedClasses,
      competitiveExamCoaching: data.competitiveExamCoaching === 'true' || data.competitiveExamCoaching === true,
      teachingMode: teachingModeVal,
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

// Local filter helper for fallback
function applyFallbackFilters(list, query) {
  const { search, subject, gradeClass, mode, state, division, maxPrice } = query || {};
  let res = list;
  if (search) {
    const q = String(search).toLowerCase();
    res = res.filter(
      (t) =>
        (t.fullName && t.fullName.toLowerCase().includes(q)) ||
        (t.qualification && t.qualification.toLowerCase().includes(q)) ||
        (t.bio && t.bio.toLowerCase().includes(q)) ||
        (t.subjects || []).some((s) => s.toLowerCase().includes(q)) ||
        (t.city && t.city.toLowerCase().includes(q)) ||
        (t.state && t.state.toLowerCase().includes(q))
    );
  }
  if (subject && subject !== 'All') {
    res = res.filter((t) => (t.subjects || []).some((s) => s.toLowerCase() === String(subject).toLowerCase()));
  }
  if (gradeClass && gradeClass !== 'All') {
    res = res.filter((t) => (t.classes || []).some((c) => String(c).toLowerCase() === String(gradeClass).toLowerCase()));
  }
  if (mode && mode !== 'All') {
    res = res.filter((t) => String(t.teachingMode).toLowerCase() === String(mode).toLowerCase());
  }
  if (state && state !== 'All') {
    res = res.filter((t) => String(t.state).toLowerCase() === String(state).toLowerCase());
  }
  if (division && division !== 'All') {
    res = res.filter((t) => String(t.city).toLowerCase() === String(division).toLowerCase());
  }
  if (maxPrice) {
    res = res.filter((t) => Number(t.hourlyRate || 0) <= Number(maxPrice));
  }
  return res;
}

exports.getTutors = async (req, res, next) => {
  try {
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      console.log('🔌 MongoDB is offline. Running getTutors in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const tutorsList = await dbFallback.getTutors();
      
      const adminView = req.query.adminView === 'true';
      let showAll = false;
      if (adminView) {
        const isAdmin = await checkIsAdmin(req);
        if (isAdmin) {
          showAll = true;
        }
      }
      const tutorsListFiltered = showAll ? tutorsList : tutorsList.filter(t => t.isVerified);
      
      const filtered = applyFallbackFilters(tutorsListFiltered, req.query);
      
      const page = parseInt(req.query.page, 10);
      const limit = parseInt(req.query.limit, 10) || 10;

      if (!isNaN(page) && page >= 1) {
        const skip = (page - 1) * limit;
        const total = filtered.length;
        const pageData = filtered.slice(skip, skip + limit);
        return res.json({
          success: true,
          data: pageData,
          tutors: pageData,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        });
      }
      return res.json(filtered);
    }

    // Build filters object for MongoDB query
    const filters = {};
    const { search, subject, gradeClass, mode, state, division, maxPrice, adminView } = req.query || {};

    let showAll = false;
    if (adminView === 'true') {
      const isAdmin = await checkIsAdmin(req);
      if (isAdmin) {
        showAll = true;
      }
    }

    if (!showAll) {
      filters.isVerified = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filters.$or = [
        { fullName: searchRegex },
        { qualification: searchRegex },
        { bio: searchRegex },
        { subjects: searchRegex },
        { city: searchRegex },
        { state: searchRegex }
      ];
    }
    if (subject && subject !== 'All') {
      filters.subjects = new RegExp(`^${subject}$`, 'i');
    }
    if (gradeClass && gradeClass !== 'All') {
      filters.classes = new RegExp(`^${gradeClass}$`, 'i');
    }
    if (mode && mode !== 'All') {
      filters.teachingMode = new RegExp(`^${mode}$`, 'i');
    }
    if (state && state !== 'All') {
      filters.state = new RegExp(`^${state}$`, 'i');
    }
    if (division && division !== 'All') {
      filters.city = new RegExp(`^${division}$`, 'i');
    }
    if (maxPrice) {
      filters.hourlyRate = { $lte: Number(maxPrice) };
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10) || 10;

    if (!isNaN(page) && page >= 1) {
      const skip = (page - 1) * limit;
      const total = await Tutor.countDocuments(filters);
      console.log('[GET TUTORS] Total matching docs:', total);
      const tutors = await Tutor.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      console.log('[GET TUTORS] Returned page count:', tutors.length);

      return res.json({
        success: true,
        data: tutors,
        tutors: tutors, // backward compatibility
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    }

    const tutors = await Tutor.find(filters).sort({ createdAt: -1 }).limit(100).lean();
    console.log('[GET TUTORS] Returned docs count (no pagination):', tutors.length);
    res.json(tutors);
  } catch (err) {
    // Detailed error logging
    console.error('[GET TUTORS] ERROR:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    next(err);
  }
};

exports.getTutorById = async (req, res, next) => {
  try {
    let tutor;
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running getTutorById in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const tutorsList = await dbFallback.getTutors();
      tutor = tutorsList.find(t => String(t._id) === String(req.params.id));
    } else {
      tutor = await Tutor.findById(req.params.id).lean();
    }
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }
    // Retain direct object return value for frontend compatibility
    res.json(tutor);
  } catch (err) {
    next(err);
  }
};

exports.updateTutor = async (req, res, next) => {
  try {
    const isOffline = mongoose.connection.readyState !== 1;
    let tutor;
    if (isOffline) {
      console.log('🔌 MongoDB is offline. Running updateTutor in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const tutorsList = await dbFallback.getTutors();
      tutor = tutorsList.find(t => String(t._id) === String(req.params.id));
    } else {
      tutor = await Tutor.findById(req.params.id);
    }
    
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    // Route security: Only the profile owner or an Admin can update
    if (tutor.userId && tutor.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

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

    let updated;
    if (isOffline) {
      const dbFallback = require('../utils/dbFallback');
      updated = await dbFallback.updateTutor(req.params.id, { ...tutor, ...data });
    } else {
      updated = await Tutor.findByIdAndUpdate(req.params.id, data, { new: true });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteTutor = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    // Route security: Only the profile owner or an Admin can delete
    if (tutor.userId && tutor.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this profile' });
    }

    await Tutor.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: 'Tutor removed' } });
  } catch (err) {
    next(err);
  }
};
