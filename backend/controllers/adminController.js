const Tutor = require('../models/Tutor');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');
const dbFallback = require('../utils/dbFallback');

// @desc    Get dashboard metrics / stats for admin
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running getDashboardStats in Fallback mode.');
      const tutorsList = await dbFallback.getTutors();
      const bookingsList = await dbFallback.getBookings();

      const totalTutors = tutorsList.length;
      const verifiedTutors = tutorsList.filter(t => t.isVerified).length;
      const pendingTutors = tutorsList.filter(t => !t.isVerified).length;

      const totalBookings = bookingsList.length;
      const pendingBookings = bookingsList.filter(b => b.status === 'Pending').length;
      const contactedBookings = bookingsList.filter(b => b.status === 'Contacted').length;
      const assignedBookings = bookingsList.filter(b => b.status === 'Assigned').length;

      return res.status(200).json({
        success: true,
        data: {
          tutors: {
            total: totalTutors,
            verified: verifiedTutors,
            pending: pendingTutors
          },
          bookings: {
            total: totalBookings,
            pending: pendingBookings,
            contacted: contactedBookings,
            assigned: assignedBookings
          }
        }
      });
    }

    const totalTutors = await Tutor.countDocuments();
    const verifiedTutors = await Tutor.countDocuments({ isVerified: true });
    const pendingTutors = await Tutor.countDocuments({ isVerified: false });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const contactedBookings = await Booking.countDocuments({ status: 'Contacted' });
    const assignedBookings = await Booking.countDocuments({ status: 'Assigned' });

    res.status(200).json({
      success: true,
      data: {
        tutors: {
          total: totalTutors,
          verified: verifiedTutors,
          pending: pendingTutors
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          contacted: contactedBookings,
          assigned: assignedBookings
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify / Approve a tutor profile
// @route   PUT /api/admin/tutors/:id/verify
// @access  Private (Admin only)
exports.verifyTutor = async (req, res, next) => {
  try {
    const { isVerified } = req.body;

    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running verifyTutor in Fallback mode.');
      const updated = await dbFallback.updateTutor(req.params.id, {
        isVerified: isVerified !== undefined ? isVerified : true
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Tutor not found' });
      }

      return res.status(200).json({
        success: true,
        message: `Tutor verification status set to: ${updated.isVerified}`,
        data: updated
      });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { isVerified: isVerified !== undefined ? isVerified : true },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    res.status(200).json({
      success: true,
      message: `Tutor verification status set to: ${tutor.isVerified}`,
      data: tutor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin update tutor profile directly (e.g. edit coordinates, name, etc)
// @route   PUT /api/admin/tutors/:id
// @access  Private (Admin only)
exports.adminUpdateTutor = async (req, res, next) => {
  try {
    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running adminUpdateTutor in Fallback mode.');
      const updated = await dbFallback.updateTutor(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Tutor not found' });
      }
      return res.status(200).json({
        success: true,
        data: updated
      });
    }

    const tutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    res.status(200).json({
      success: true,
      data: tutor
    });
  } catch (err) {
    next(err);
  }
};
