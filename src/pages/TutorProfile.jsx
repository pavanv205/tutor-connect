import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaStar,
  FaBriefcase,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaUserGraduate,
  FaUser,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaBookOpen,
  FaCheck,
  FaTimes,
  FaHistory
} from 'react-icons/fa';
import SEO from '../components/common/SEO';
import { tutorService } from '../services/tutorService';
import { useBookingModal } from '../context/BookingModalContext';
import { TutorProfileSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';



const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openBookingModal } = useBookingModal();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, isAuthenticated } = useAuth();
  const [profileBookings, setProfileBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const isProfileOwner = isAuthenticated && user && user.role === 'Tutor' && 
    (String(user.tutorProfile) === String(tutor?._id) || String(user.tutorProfile) === String(tutor?.id));

  useEffect(() => {
    const fetchProfileBookings = async () => {
      if (!isProfileOwner) return;
      try {
        setBookingsLoading(true);
        const res = await api.get('/bookings');
        if (res.data && res.data.success) {
          setProfileBookings(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load profile bookings:', err);
      } finally {
        setBookingsLoading(false);
      }
    };

    if (tutor) {
      fetchProfileBookings();
    }
  }, [isProfileOwner, tutor]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingBookingId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}`, { status: newStatus });
      if (res.data && res.data.success) {
        setProfileBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      console.error('Failed to update request status:', err);
    } finally {
      setUpdatingBookingId(null);
    }
  };


  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await tutorService.getTutorById(id);
        setTutor(data);
      } catch (err) {
        setError(err.message || 'Tutor not found');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <TutorProfileSkeleton />
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tutor Profile Not Found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          The tutor profile you are looking for does not exist or may have been deactivated.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/tutors')}>
            Back to Directory
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Defensive fallbacks to prevent crashes if some fields are missing
  const name = tutor.name || tutor.fullName || 'Anonymous Tutor';
  const photo = tutor.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
  const qualification = tutor.qualification || 'Verified Educator';
  const gender = tutor.gender || '';
  const age = tutor.age ? `${tutor.age} yrs` : '';
  const experience = tutor.experience !== undefined ? tutor.experience : 3;

  const state = tutor.state || '';
  const city = tutor.city || 'Bangalore';
  const street = tutor.streetAddress || tutor.address || '';
  const fullAddressParts = [];
  if (street) fullAddressParts.push(street);
  if (city) fullAddressParts.push(city);
  if (state) fullAddressParts.push(state);
  const fullAddress = fullAddressParts.length > 0 ? fullAddressParts.join(', ') : city;
  const modes = Array.isArray(tutor.modes) ? tutor.modes : ['Online'];
  const about = tutor.about || tutor.bio || 'No biography details provided.';
  const subjects = Array.isArray(tutor.subjects) ? tutor.subjects : [];
  const classes = Array.isArray(tutor.classes) ? tutor.classes : [];
  const reviews = Array.isArray(tutor.reviews) ? tutor.reviews : [];
  const hourlyRate = tutor.hourlyRate || 500;
  const monthlyRate = tutor.monthlyRate || 3000;

  return (
    <>
      <SEO
        title={name}
        description={`Read qualifications, experience, reviews, and subjects taught by ${name}.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Back navigation */}
        <div>
          <Link
            to="/tutors"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-450 transition"
          >
            <FaArrowLeft className="h-3.5 w-3.5" /> Back to Tutors Listing
          </Link>
        </div>

        {/* Profile Header Details Card */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start">
          <img
            src={photo}
            alt={name}
            className="h-28 w-28 md:h-36 md:w-36 rounded-2xl object-cover shrink-0 border border-slate-100 dark:border-slate-800 shadow-md"
          />
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {name}
              </h2>

            </div>

            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center md:justify-start gap-1.5">
              <FaGraduationCap className="text-slate-450 text-lg shrink-0" />
              <span>{qualification}</span>
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <FaBriefcase className="text-slate-405" /> {experience} Years Experience
              </span>
              <span className="flex items-center gap-1.5 text-left" title={fullAddress}>
                <FaMapMarkerAlt className="text-slate-405 shrink-0" /> 
                <span className="line-clamp-2">{fullAddress}</span>
              </span>
              {gender && (
                <span className="flex items-center gap-1.5">
                  <FaUser className="text-slate-405" /> {gender}
                </span>
              )}
              {age && (
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-slate-405" /> {age}
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              {modes.map((mode, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-slate-50 border border-slate-150/40 text-[10px] font-bold text-slate-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400"
                >
                  {mode} Classes
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Received Booking Requests (Visible only to the Profile Owner) */}
        {isProfileOwner && (
          <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="h-10 w-10 bg-primary/10 text-primary dark:bg-blue-900/20 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                <FaHistory className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Received Booking Requests ({profileBookings.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Manage sessions requested directly by students on your profile.
                </p>
              </div>
            </div>

            {bookingsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-primary dark:border-slate-800 dark:border-t-blue-500 animate-spin" />
              </div>
            ) : profileBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-medium text-slate-550 dark:text-slate-400">No requests received yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/30 dark:bg-slate-850/10 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">
                            {booking.studentName}
                          </h4>
                          <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block mt-0.5">
                            Subject: {booking.subject}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          booking.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-450'
                            : booking.status === 'Assigned' || booking.status === 'Contacted'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                            : booking.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-450'
                        }`}>
                          {booking.status === 'Pending' ? 'Pending Approval' : booking.status}
                        </span>
                      </div>

                      {booking.status === 'Pending' ? (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-[11px] font-semibold text-slate-505 dark:text-slate-455 italic flex items-center gap-1.5">
                          <span>⏳</span>
                          <span>Contact details will be unlocked once you accept this request.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          <FaPhone className="text-slate-400 shrink-0" />
                          <span>{booking.studentPhone || 'N/A'}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350 font-semibold">
                        <p>Grade / Class: <span className="text-slate-850 dark:text-slate-200">{booking.gradeClass}</span></p>
                        <p>Learning Mode: <span className="text-slate-850 dark:text-slate-200">{booking.preferredMode}</span></p>
                        {booking.preferredSlot && <p>Slot: <span className="text-slate-850 dark:text-slate-200">{booking.preferredSlot}</span></p>}
                        {booking.location && (
                          <div className="text-[10px] bg-slate-50 dark:bg-slate-850/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 italic mt-1">
                            Address: {booking.location}
                          </div>
                        )}
                      </div>

                      {booking.message && booking.message !== 'Instant booking from tutor profile' && (
                        <div className="bg-slate-50 dark:bg-slate-850/40 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-100/50 dark:border-slate-800/50">
                          <p className="font-bold text-[9px] uppercase text-slate-400 mb-0.5">Notes:</p>
                          <p className="italic">"{booking.message}"</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
                      <span className="text-[9px] text-slate-400 font-bold">
                        {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {booking.status === 'Pending' && (
                        <div className="flex gap-1.5">
                          <button
                            disabled={updatingBookingId !== null}
                            onClick={() => handleUpdateStatus(booking._id, 'Assigned')}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/45 dark:text-emerald-400 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            <FaCheck className="h-3 w-3" /> Accept
                          </button>
                          <button
                            disabled={updatingBookingId !== null}
                            onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/45 dark:text-red-450 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            <FaTimes className="h-3 w-3" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main Details and Booking splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Info tabs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About bio */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Biography & Teaching Philosophy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {about}
              </p>
            </div>

            {/* Teaching Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Teaching Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                    Subjects Taught
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-blue-50 text-primary dark:bg-blue-950/20 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100/50 dark:border-blue-900/30"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                    Grade Classes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-100/50 dark:border-amber-900/30"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Student Reviews & Feedback
              </h3>
              {reviews.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No reviews registered yet.</p>
              ) : (
                <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
                  {reviews.map((rev, i) => (
                    <div key={rev.id} className={`space-y-2.5 ${i > 0 ? 'pt-6' : ''}`}>
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                            <FaUserGraduate className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-sm font-bold text-slate-850 dark:text-slate-200">
                            {rev.reviewer}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-500 text-xs font-bold gap-1 shrink-0">
                          <FaStar className="fill-current" /> {rev.rating}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed pl-10 font-medium">
                        "{rev.comment}"
                      </p>
                      <p className="text-[10px] text-slate-400 pl-10 font-semibold uppercase tracking-wider">{rev.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Scheduling details and action booking panel */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Tutoring Session Rate
              </h3>
              <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Hourly Rate</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{hourlyRate}
                  <span className="text-xs font-bold text-slate-400 ml-1">/ Hour</span>
                </span>
              </div>

              <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Monthly Charge</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{monthlyRate}
                  <span className="text-xs font-bold text-slate-400 ml-1">/ Month</span>
                </span>
              </div>


              {/* Free demo class action button */}
              <div className="pt-2">
                {!isAuthenticated || (user && user.role === 'Student') ? (
                  <>
                    <Button
                      variant="primary"
                      className="w-full py-4 text-sm font-bold shadow-md shadow-primary/10 animate-pulse hover:animate-none"
                      onClick={() => openBookingModal(tutor)}
                    >
                      Book
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 mt-3 font-semibold">
                      No commitment required for first session.
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      className="w-full py-4 text-sm font-bold opacity-50 cursor-not-allowed"
                      disabled
                    >
                      Book
                    </Button>
                    <p className="text-[10px] text-center text-rose-500 font-bold">
                      Only students can book tutoring sessions. Log in as a student to book.
                    </p>
                  </div>
                )}
              </div>
            </div>


          </div>

        </div>

      </div>
    </>
  );
};

export default TutorProfile;
