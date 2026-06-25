const Booking = require('../models/Booking');
const Tutor = require('../models/Tutor');
const mongoose = require('mongoose');
const dbFallback = require('../utils/dbFallback');

// @desc    Create a new student request / trial booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res, next) => {
  try {
    const { studentName, studentEmail, studentPhone, subject, gradeClass, message, preferredMode, location, tutorId } = req.body || {};

    const resolvedPhone = studentPhone || req.body.phone;
    const resolvedMode = preferredMode || req.body.mode || 'Both';
    const resolvedEmail = studentEmail || req.body.email || '';

    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running createBooking in Fallback mode.');
      const bookingId = 'fallback-booking-' + Math.random().toString(36).substr(2, 9);
      
      const newBooking = {
        _id: bookingId,
        studentName,
        studentEmail: resolvedEmail,
        studentPhone: resolvedPhone,
        subject,
        gradeClass,
        message,
        preferredMode: resolvedMode,
        location,
        status: tutorId ? 'Assigned' : 'Pending',
        assignedTutor: tutorId || undefined,
        createdAt: new Date().toISOString()
      };

      await dbFallback.saveBooking(newBooking);
      return res.status(201).json({
        success: true,
        message: 'Trial class request received successfully! We will reach out shortly.',
        bookingId: bookingId
      });
    }

    const bookingData = {
      studentName,
      studentEmail: resolvedEmail,
      studentPhone: resolvedPhone,
      subject,
      gradeClass,
      message,
      preferredMode: resolvedMode,
      location,
      status: 'Pending'
    };

    // If a tutor was selected, assign the tutor directly
    if (tutorId && mongoose.Types.ObjectId.isValid(tutorId)) {
      const tutor = await Tutor.findById(tutorId);
      if (tutor) {
        bookingData.assignedTutor = tutor._id;
        bookingData.status = 'Assigned';
      }
    }

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      message: 'Trial class request received successfully! We will reach out shortly.',
      bookingId: booking._id
    });
  } catch (err) {
    console.error(`[BOOKING SYSTEM ERROR] Uncaught error in createBooking | Method: ${req.method} | Path: ${req.originalUrl} | Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    next(err);
  }
};

// @desc    Get all trial bookings / leads
// @route   GET /api/bookings
// @access  Private (Admin or Tutor)
exports.getBookings = async (req, res, next) => {
  try {
    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running getBookings in Fallback mode.');
      let bookingsList = await dbFallback.getBookings();
      const tutorsList = await dbFallback.getTutors();

      // If logged in user is a Tutor, only show bookings assigned to them
      if (req.user.role === 'Tutor') {
        const tutor = tutorsList.find(t => String(t.userId) === String(req.user._id));
        if (!tutor) {
          return res.status(404).json({ success: false, message: 'Tutor profile not found' });
        }
        bookingsList = bookingsList.filter(b => String(b.assignedTutor) === String(tutor._id));
      }

      // Populate tutor details manually
      const populatedBookings = bookingsList.map(booking => {
        const assignedTutor = booking.assignedTutor 
          ? tutorsList.find(t => String(t._id) === String(booking.assignedTutor)) 
          : null;
        return {
          ...booking,
          assignedTutor: assignedTutor ? {
            _id: assignedTutor._id,
            fullName: assignedTutor.fullName,
            mobile: assignedTutor.mobile,
            email: assignedTutor.email,
            subjects: assignedTutor.subjects
          } : null
        };
      });

      return res.status(200).json({
        success: true,
        count: populatedBookings.length,
        data: populatedBookings
      });
    }

    let query = {};

    // If logged in user is a Tutor, only show bookings assigned to them
    if (req.user.role === 'Tutor') {
      const tutor = await Tutor.findOne({ userId: req.user._id });
      if (!tutor) {
        return res.status(404).json({ success: false, message: 'Tutor profile not found' });
      }
      query.assignedTutor = tutor._id;
    }

    // Populate tutor details
    const bookings = await Booking.find(query)
      .populate('assignedTutor', 'fullName mobile email subjects')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(`[BOOKING SYSTEM ERROR] Uncaught error in getBookings | Method: ${req.method} | Path: ${req.originalUrl} | Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    next(err);
  }
};

// @desc    Update trial booking status / details
// @route   PUT /api/bookings/:id
// @access  Private (Admin or Tutor)
exports.updateBooking = async (req, res, next) => {
  try {
    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running updateBooking in Fallback mode.');
      const bookingsList = await dbFallback.getBookings();
      const tutorsList = await dbFallback.getTutors();
      
      const booking = bookingsList.find(b => String(b._id) === String(req.params.id));
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Authorization check
      if (req.user.role === 'Tutor') {
        const tutor = tutorsList.find(t => String(t.userId) === String(req.user._id));
        if (!tutor || String(booking.assignedTutor) !== String(tutor._id)) {
          return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
        }
        
        // Tutor can only update the status
        if (req.body.status) {
          booking.status = req.body.status;
        }
      } else {
        // Admin can update anything
        const { status, assignedTutor } = req.body;
        if (status) booking.status = status;
        if (assignedTutor !== undefined) {
          booking.assignedTutor = assignedTutor || undefined;
          if (assignedTutor && booking.status === 'Pending') {
            booking.status = 'Assigned';
          }
        }
      }

      const updated = await dbFallback.updateBooking(req.params.id, booking);
      return res.status(200).json({
        success: true,
        data: updated
      });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check
    if (req.user.role === 'Tutor') {
      const tutor = await Tutor.findOne({ userId: req.user._id });
      if (!tutor || String(booking.assignedTutor) !== String(tutor._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
      }
      
      // Tutor can only update the status
      if (req.body.status) {
        booking.status = req.body.status;
      }
    } else {
      // Admin can update anything
      const { status, assignedTutor } = req.body;
      if (status) booking.status = status;
      if (assignedTutor !== undefined) {
        booking.assignedTutor = assignedTutor || undefined;
        if (assignedTutor && booking.status === 'Pending') {
          booking.status = 'Assigned';
        }
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(`[BOOKING SYSTEM ERROR] Uncaught error in updateBooking | Method: ${req.method} | Path: ${req.originalUrl} | Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    next(err);
  }
};
