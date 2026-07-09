import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SEO from '../components/common/SEO';
import Button from '../components/common/Button';
import { FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBookOpen, FaUser, FaHistory, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingBookingId(bookingId);
    setError('');
    try {
      const res = await api.put(`/bookings/${bookingId}`, { status: newStatus });
      if (res.data && res.data.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update request status. Please try again.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking request?')) {
      return;
    }
    setUpdatingBookingId(bookingId);
    setError('');
    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      if (res.data && res.data.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete booking request.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const loadStudentBookings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      if (res.data && res.data.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch request status. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStudentBookings();
  }, [loadStudentBookings]);

  return (
    <>
      <SEO title="Student Dashboard" description="Track the status of your requested home and online tuition classes." />

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Welcome back, {user?.name || 'Student'}. Track your session requests and tutor details here.
              </p>
            </div>
            <div>
              <Button onClick={() => navigate('/tutors')} variant="primary" size="sm">
                Find Tutors
              </Button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-55 dark:bg-red-950/20 text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-3">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* LOADING STATE */}
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-primary dark:border-slate-800 dark:border-t-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center gap-2">
                <FaHistory className="text-primary dark:text-blue-400" />
                Requests Status ({bookings.length})
              </h3>

              {bookings.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaGraduationCap className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">No Booking Requests Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mb-6">
                    You have not requested any tutoring sessions. Connect with our highly qualified teachers to get started.
                  </p>
                  <Button onClick={() => navigate('/tutors')} variant="outline" size="sm">
                    Browse Teachers
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookings.map(booking => (
                    <div 
                      key={booking._id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Status Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                              {booking.subject}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                              Grade {booking.gradeClass} • {booking.preferredMode}
                            </p>
                          </div>
                           {booking.status === 'Deleted' || booking.status === 'Completed' ? (
                            <button
                              disabled={updatingBookingId !== null}
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="text-[10px] font-extrabold px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors uppercase tracking-wider shadow-sm"
                            >
                              <FaTrash className="h-2.5 w-2.5" />
                              Delete
                            </button>
                          ) : (
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              booking.status === 'Pending'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-450'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                            }`}>
                              {booking.status === 'Pending' ? 'Pending Approval' : booking.status}
                            </span>
                          )}
                        </div>

                        {/* Assigned Tutor Block */}
                        {booking.assignedTutor ? (
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Assigned Teacher Details</p>
                            <div className="flex items-center gap-2">
                              <FaUser className="text-primary dark:text-blue-400 shrink-0 h-3.5 w-3.5" />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {booking.assignedTutor.fullName}
                              </span>
                            </div>
                            {booking.status === 'Pending' ? (
                              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-455 italic flex items-center gap-1.5 pt-1">
                                <span>⏳</span>
                                <span>Awaiting response. Contact details will be unlocked once accepted.</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-550 dark:text-slate-450">
                                <FaPhone className="shrink-0 text-slate-400" />
                                <span>{booking.assignedTutor.mobile}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3.5 rounded-2xl text-[11px] font-semibold text-slate-500 dark:text-slate-450 italic flex items-center gap-2">
                            <span>⏳</span>
                            <span>HomeTutorX support team is reviewing your profile to match the best tutor.</span>
                          </div>
                        )}

                        {/* Location Details if offline */}
                        {booking.location && (
                          <div className="text-xs font-semibold text-slate-650 dark:text-slate-350 flex items-start gap-2">
                            <FaMapMarkerAlt className="text-slate-400 shrink-0 mt-0.5" />
                            <span>Address: {booking.location}</span>
                          </div>
                        )}

                        {/* Student Notes */}
                        {booking.message && booking.message !== 'Instant booking from tutor profile' && (
                          <div className="bg-slate-50 dark:bg-slate-800/10 p-3 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-100/50 dark:border-slate-800/50">
                            <p className="font-bold text-[9px] uppercase text-slate-450 dark:text-slate-505 tracking-wider mb-0.5">Your Notes:</p>
                            <p className="leading-relaxed">"{booking.message}"</p>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center justify-between mt-3">
                        <span>Requested: {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>

                        {booking.status === 'Pending' && (
                          <button
                            disabled={updatingBookingId !== null}
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this tuition request?')) {
                                handleUpdateBookingStatus(booking._id, 'Deleted');
                              }
                            }}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            <FaTimes className="h-3 w-3" />
                            Delete Request
                          </button>
                        )}

                        {booking.status === 'Assigned' && (
                          <div className="flex gap-2">
                            <button
                              disabled={updatingBookingId !== null}
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this tuition request?')) {
                                  handleUpdateBookingStatus(booking._id, 'Deleted');
                                }
                              }}
                              className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              <FaTimes className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
