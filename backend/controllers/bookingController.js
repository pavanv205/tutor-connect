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
      
      // Check for duplicate active request
      if (tutorId) {
        const bookingsList = await dbFallback.getBookings();
        const existing = bookingsList.find(b => 
          String(b.assignedTutor) === String(tutorId) &&
          (String(b.studentEmail).toLowerCase() === String(resolvedEmail).toLowerCase() || String(b.studentPhone) === String(resolvedPhone)) &&
          ['Pending', 'Assigned', 'Contacted'].includes(b.status)
        );
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'You have already sent an active request to this tutor. You cannot send another until it is completed or deleted.'
          });
        }
      }
      
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
        status: 'Pending',
        assignedTutor: tutorId || undefined,
        createdAt: new Date().toISOString()
      };

      await dbFallback.saveBooking(newBooking);
      if (tutorId) {
        const tutorsList = await dbFallback.getTutors();
        const tutorObj = tutorsList.find(t => String(t._id) === String(tutorId));
        if (tutorObj) {
          tutorObj.leadsCount = (tutorObj.leadsCount || 0) + 1;
          await dbFallback.updateTutor(tutorObj._id, { leadsCount: tutorObj.leadsCount });
          const { createNotification } = require('../services/notificationService');
          await createNotification(tutorObj.userId, 'RequestSent', `You have received a new trial class request from ${studentName} for ${subject}.`);
        }
      }
      return res.status(201).json({
        success: true,
        message: 'Trial class request received successfully! We will reach out shortly.',
        bookingId: bookingId
      });
    }

    // Check for duplicate active request
    if (tutorId && mongoose.Types.ObjectId.isValid(tutorId)) {
      const existing = await Booking.findOne({
        assignedTutor: new mongoose.Types.ObjectId(tutorId),
        $or: [
          { studentEmail: { $regex: new RegExp(`^${resolvedEmail}$`, 'i') } },
          { studentPhone: resolvedPhone }
        ],
        status: { $in: ['Pending', 'Assigned', 'Contacted'] }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already sent an active request to this tutor. You cannot send another until it is completed or deleted.'
        });
      }
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
        bookingData.status = 'Pending';
      }
    }

    const booking = await Booking.create(bookingData);
    if (bookingData.assignedTutor) {
      await Tutor.findByIdAndUpdate(bookingData.assignedTutor, { $inc: { leadsCount: 1 } });
      const tutor = await Tutor.findById(bookingData.assignedTutor);
      if (tutor && tutor.userId) {
        const { createNotification } = require('../services/notificationService');
        await createNotification(tutor.userId, 'RequestSent', `You have received a new trial class request from ${studentName} for ${subject}.`);
      }
    }

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

      // If logged in user is a Student, only show bookings matching their email
      if (req.user.role === 'Student') {
        bookingsList = bookingsList.filter(b => String(b.studentEmail).toLowerCase() === String(req.user.email).toLowerCase());
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

    // If logged in user is a Student, only show bookings matching their email
    if (req.user.role === 'Student') {
      query.studentEmail = req.user.email;
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
      const originalStatus = booking.status;

      // Authorization check
      if (req.user.role === 'Tutor') {
        const tutor = tutorsList.find(t => String(t.userId) === String(req.user._id));
        if (!tutor || (booking.assignedTutor && String(booking.assignedTutor) !== String(tutor._id))) {
          return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
        }
        
        // Tutor can only update the status
        if (req.body.status) {
          // If tutor is accepting a pending booking and it's unassigned, assign themselves
          if (req.body.status === 'Assigned' && booking.status === 'Pending' && !booking.assignedTutor) {
            const tutor = tutorsList.find(t => String(t.userId) === String(req.user._id));
            if (tutor) {
              booking.assignedTutor = tutor._id;
            }
          }
          booking.status = req.body.status;
        }
      } else if (req.user.role === 'Student') {
        // Student can only update their own bookings
        if (String(booking.studentEmail).toLowerCase() !== String(req.user.email).toLowerCase()) {
          return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
        }
        // Student can only update status to Completed or Deleted
        if (req.body.status) {
          if (req.body.status !== 'Completed' && req.body.status !== 'Deleted') {
            return res.status(400).json({ success: false, message: 'Invalid status update for student' });
          }
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
      if (booking.status === 'Assigned' && originalStatus !== 'Assigned') {
        const usersList = await dbFallback.getUsers();
        const studentUser = usersList.find(u => u.email.toLowerCase() === booking.studentEmail.toLowerCase() && u.role === 'Student');
        if (studentUser) {
          const tutorObj = tutorsList.find(t => String(t._id) === String(booking.assignedTutor));
          const tutorName = tutorObj ? tutorObj.fullName : 'Your Tutor';
          const { createNotification } = require('../services/notificationService');
          await createNotification(studentUser._id, 'RequestAccepted', `Your trial request for ${booking.subject} has been accepted by ${tutorName}.`);
        }
      }
      return res.status(200).json({
        success: true,
        data: updated
      });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const originalStatus = booking.status;

    // Authorization check
    if (req.user.role === 'Tutor') {
      const tutor = await Tutor.findOne({ userId: req.user._id });
      if (!tutor || (booking.assignedTutor && String(booking.assignedTutor) !== String(tutor._id))) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
      }
      
      // Tutor can only update the status
      if (req.body.status) {
        // If tutor is accepting a pending booking, assign themselves
        if (req.body.status === 'Assigned' && booking.status === 'Pending') {
          booking.assignedTutor = tutor._id;
        }
        booking.status = req.body.status;
      }
    } else if (req.user.role === 'Student') {
      // Student can only update their own bookings
      if (String(booking.studentEmail).toLowerCase() !== String(req.user.email).toLowerCase()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
      }
      // Student can only update status to Completed or Deleted
      if (req.body.status) {
        if (req.body.status !== 'Completed' && req.body.status !== 'Deleted') {
          return res.status(400).json({ success: false, message: 'Invalid status update for student' });
        }
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

    if (booking.status === 'Assigned' && originalStatus !== 'Assigned') {
      const User = require('../models/User');
      const studentUser = await User.findOne({ email: booking.studentEmail, role: 'Student' });
      if (studentUser) {
        const tutor = await Tutor.findById(booking.assignedTutor);
        const tutorName = tutor ? tutor.fullName : 'Your Tutor';
        const { createNotification } = require('../services/notificationService');
        await createNotification(studentUser._id, 'RequestAccepted', `Your trial request for ${booking.subject} has been accepted by ${tutorName}.`);
      }
    }

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

// @desc    Delete booking request
// @route   DELETE /api/bookings/:id
// @access  Private (Admin, Tutor, or Student)
exports.deleteBooking = async (req, res, next) => {
  try {
    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running deleteBooking in Fallback mode.');
      const bookingsList = await dbFallback.getBookings();
      const tutorsList = await dbFallback.getTutors();
      
      const booking = bookingsList.find(b => String(b._id) === String(req.params.id));
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Authorization check
      if (req.user.role === 'Tutor') {
        const tutor = tutorsList.find(t => String(t.userId) === String(req.user._id));
        if (!tutor || (booking.assignedTutor && String(booking.assignedTutor) !== String(tutor._id))) {
          return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
        }
      } else if (req.user.role === 'Student') {
        if (String(booking.studentEmail).toLowerCase() !== String(req.user.email).toLowerCase()) {
          return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
        }
      }

      await dbFallback.deleteBooking(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Booking deleted successfully'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check
    if (req.user.role === 'Tutor') {
      const tutor = await Tutor.findOne({ userId: req.user._id });
      if (!tutor || (booking.assignedTutor && String(booking.assignedTutor) !== String(tutor._id))) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
      }
    } else if (req.user.role === 'Student') {
      if (String(booking.studentEmail).toLowerCase() !== String(req.user.email).toLowerCase()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
      }
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    console.error(`[BOOKING SYSTEM ERROR] Uncaught error in deleteBooking | Method: ${req.method} | Path: ${req.originalUrl} | Error: ${err.message}`);
    next(err);
  }
};

