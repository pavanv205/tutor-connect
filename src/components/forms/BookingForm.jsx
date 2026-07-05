import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaUser, FaPhone, FaCalendarAlt, FaComments } from 'react-icons/fa';
import { CLASSES, SUBJECTS } from '../../constants';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

// Validation schema
const schema = yup.object().shape({
  studentName: yup
    .string()
    .required('Student name is required')
    .min(3, 'Name must be at least 3 characters'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number starting with 6-9'),
  gradeClass: yup
    .string()
    .required('Please select a grade/class')
    .notOneOf([''], 'Please select a grade/class'),
  subject: yup
    .string()
    .required('Please select a subject')
    .notOneOf([''], 'Please select a subject'),
  preferredSlot: yup
    .string()
    .required('Preferred slot is required'),
  mode: yup
    .string()
    .required('Please select a learning mode'),
  message: yup.string().max(300, 'Message cannot exceed 300 characters')
});

const BookingForm = ({ tutor, onSuccess, onSetTitle }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const hasSubmittedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      studentName: '',
      phone: '',
      gradeClass: '',
      subject: tutor && tutor.subjects && tutor.subjects.length > 0 ? tutor.subjects[0] : '',
      preferredSlot: '',
      mode: tutor && tutor.modes && tutor.modes.length > 0 ? tutor.modes[0] : 'Online',
      message: ''
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      onSuccess();
      navigate('/login?role=student');
      return;
    }

    if (user && user.role !== 'Student') {
      return;
    }

    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const autoSubmit = async () => {
      if (onSetTitle) onSetTitle('');
      setLoading(true);
      try {
        const payload = {
          studentName: user?.name || 'Student',
          studentEmail: user?.email || '',
          email: user?.email || '',
          phone: user?.phone || '1234567890',
          gradeClass: tutor && tutor.classes && tutor.classes.length > 0 ? tutor.classes[0] : '10th',
          subject: tutor && tutor.subjects && tutor.subjects.length > 0 ? tutor.subjects[0] : 'Mathematics',
          preferredSlot: 'Anytime',
          mode: tutor && tutor.modes && tutor.modes.length > 0 ? tutor.modes[0] : 'Online',
          message: 'Instant booking from tutor profile',
          tutorId: tutor ? (tutor._id || tutor.id) : 'general',
          tutorName: tutor ? (tutor.name || tutor.fullName) : 'Any Available Tutor'
        };
        const response = await bookingService.bookDemo(payload);
        if (response.success) {
          setSuccessMsg('Request Sent Successfully! 🎉 Redirecting to your dashboard...');
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
              navigate('/student/dashboard');
            }, 2500);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    autoSubmit();
  }, [isAuthenticated, user, tutor, navigate, onSuccess, onSetTitle]);

  const onSubmit = async (data) => {
    try {
      if (onSetTitle) onSetTitle('');
      setLoading(true);
      const payload = {
        ...data,
        studentEmail: user?.email || '',
        email: user?.email || '',
        tutorId: tutor ? (tutor._id || tutor.id) : 'general',
        tutorName: tutor ? (tutor.name || tutor.fullName) : 'Any Available Tutor'
      };
      const response = await bookingService.bookDemo(payload);
      if (response.success) {
        setSuccessMsg(response.message || 'Request Sent Successfully! 🎉 Redirecting to your dashboard...');
        reset();
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            navigate('/student/dashboard');
          }, 3000);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user && user.role !== 'Student') {
    return (
      <div className="text-center py-8 px-4">
        <div className="h-16 w-16 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
          Booking Restricted
        </h4>
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-xs mx-auto font-medium">
          Only student accounts can book classes. Please sign in as a student to request a class.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-primary dark:border-slate-850 dark:border-t-blue-500 animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Sending Request...</p>
      </div>
    );
  }

  if (successMsg) {
    return (
      <div className="text-center py-8 px-4">
        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
          Request Sent Successfully! 🎉
        </h4>
        <p className="text-slate-650 dark:text-slate-350 text-sm leading-relaxed max-w-sm mx-auto font-medium">
          The tutor will review your request and contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {tutor && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4 border border-slate-100 dark:border-slate-800">
          <img
            src={tutor.photo}
            alt={tutor.name}
            className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
          />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Booking session with</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{tutor.name}</p>
          </div>
        </div>
      )}

      {/* Student Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
          Student Name
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400">
            <FaUser className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Enter student's full name"
            {...register('studentName')}
            className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${
              errors.studentName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'
            } text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 transition-all duration-200`}
          />
        </div>
        {errors.studentName && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.studentName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Phone Number
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-400">
              <FaPhone className="h-4 w-4" />
            </span>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              {...register('phone')}
              className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${
                errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'
              } text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 transition-all duration-200`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Grade/Class */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Grade / Class
          </label>
          <select
            {...register('gradeClass')}
            className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${
              errors.gradeClass ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'
            } text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 transition-all duration-200`}
          >
            <option value="">Select Grade</option>
            {CLASSES.map((c, index) => (
              <option key={index} value={c}>{c}</option>
            ))}
          </select>
          {errors.gradeClass && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.gradeClass.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Subject
          </label>
          <select
            {...register('subject')}
            className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${
              errors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'
            } text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 transition-all duration-200`}
          >
            <option value="">Select Subject</option>
            {tutor
              ? tutor.subjects.map((s, index) => (
                  <option key={index} value={s}>{s}</option>
                ))
              : SUBJECTS.map((s, index) => (
                  <option key={index} value={s}>{s}</option>
                ))}
          </select>
          {errors.subject && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.subject.message}</p>
          )}
        </div>

        {/* Learning Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Learning Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Online', 'Offline'].map((m) => (
              <label
                key={m}
                className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                  tutor && !tutor.modes.includes(m)
                    ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  value={m}
                  disabled={tutor && !tutor.modes.includes(m)}
                  {...register('mode')}
                  className="sr-only"
                />
                <span className="text-slate-700 dark:text-slate-300">{m}</span>
              </label>
            ))}
          </div>
          {errors.mode && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.mode.message}</p>
          )}
        </div>
      </div>

      {/* Preferred Slot */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
          Preferred Date & Slot
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400">
            <FaCalendarAlt className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="e.g. Wednesday 4:00 PM or Weekend Mornings"
            {...register('preferredSlot')}
            className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${
              errors.preferredSlot ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'
            } text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 transition-all duration-200`}
          />
        </div>
        {errors.preferredSlot && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.preferredSlot.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
          Describe Learning Needs (Optional)
        </label>
        <div className="relative flex items-start">
          <span className="absolute left-4 top-3.5 text-slate-400">
            <FaComments className="h-4 w-4" />
          </span>
          <textarea
            rows="3"
            placeholder="e.g. Weak in calculus, preparing for final terms..."
            {...register('message')}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>
        {errors.message && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.message.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-3">
        <Button type="submit" variant="primary" className="w-full py-3.5 font-semibold text-sm" loading={loading}>
          Book Session
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
