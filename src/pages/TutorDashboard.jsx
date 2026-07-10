import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import { SUBJECTS, CLASSES } from '../constants';
import { FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBookOpen, FaUser, FaCheck, FaTimes, FaGraduationCap, FaGift } from 'react-icons/fa';

const ColorfulGiftIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lidGrad" x1="5" y1="11" x2="19" y2="14">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
      <linearGradient id="bodyGrad" x1="6" y1="14" x2="18" y2="21">
        <stop offset="0%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
      <linearGradient id="ribbonGrad" x1="7" y1="6" x2="17" y2="21">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
    {/* Bow */}
    <path d="M12 9C13.8 6 17 6 17 9C17 11 14.5 11 12 11C9.5 11 7 11 7 9C7 6 10.2 6 12 9Z" fill="url(#ribbonGrad)" />
    {/* Lid */}
    <rect x="5" y="11" width="14" height="3" rx="1.5" fill="url(#lidGrad)" />
    {/* Body */}
    <path d="M6 14H18V19.5C18 20.33 17.33 21 16.5 21H7.5C6.67 21 6 20.33 6 19.5V14Z" fill="url(#bodyGrad)" />
    {/* Vertical Ribbon */}
    <rect x="11" y="11" width="2" height="10" fill="url(#ribbonGrad)" />
    {/* Horizontal Ribbon under lid */}
    <rect x="5" y="12.2" width="14" height="0.6" fill="url(#ribbonGrad)" opacity="0.3" />
  </svg>
);

const ColorfulUsersIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Central User Gradient */}
      <linearGradient id="centerGrad" x1="9" y1="4" x2="15" y2="20">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      {/* Left User Gradient */}
      <linearGradient id="leftGrad" x1="2" y1="7" x2="9" y2="20">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      {/* Right User Gradient */}
      <linearGradient id="rightGrad" x1="15" y1="7" x2="22" y2="20">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    
    {/* Left User */}
    <circle cx="6" cy="8.5" r="2.5" fill="url(#leftGrad)" />
    <path d="M6 12C3.79 12 2 13.79 2 16V18C2 18.55 2.45 19 3 19H9C9.55 19 10 18.55 10 18V16C10 13.79 8.21 12 6 12Z" fill="url(#leftGrad)" />

    {/* Right User */}
    <circle cx="18" cy="8.5" r="2.5" fill="url(#rightGrad)" />
    <path d="M18 12C15.79 12 14 13.79 14 16V18C14 18.55 14.45 19 15 19H21C21.55 19 22 18.55 22 18V16C22 13.79 20.21 12 18 12Z" fill="url(#rightGrad)" />

    {/* Center User (Drawn last to overlap left/right) */}
    <circle cx="12" cy="7" r="3" fill="url(#centerGrad)" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
    <path d="M12 11C9.24 11 7 13.24 7 16V18.5C7 19.33 7.67 20 8.5 20H15.5C16.33 20 17 19.33 17 18.5V16C17 13.24 14.76 11 12 11Z" fill="url(#centerGrad)" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
  </svg>
);

import { getAvatarStyle } from '../utils/avatarHelper';

const TutorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile'); // 'Profile', 'Student Requests', 'Referrals', 'Settings'
  const [tutorProfile, setTutorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [bookings, setBookings] = useState([]);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const [referrals, setReferrals] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}`;
  });
  const [referralSearch, setReferralSearch] = useState('');

  const uniqueMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    let earliestYear = currentYear;
    if (referrals.length > 0) {
      const years = referrals
        .map(r => r.createdAt ? new Date(r.createdAt).getFullYear() : null)
        .filter(y => y !== null && !isNaN(y));
      if (years.length > 0) {
        earliestYear = Math.min(...years);
      }
    }
    
    for (let y = earliestYear; y <= currentYear; y++) {
      for (let m = 0; m < 12; m++) {
        months.push({
          year: y,
          month: m,
          label: new Date(y, m).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
          value: `${y}-${m}`
        });
      }
    }
    
    return months.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [referrals]);

  const selectedMonthLabel = uniqueMonths.find(m => m.value === selectedMonthYear)?.label || 'Selected Month';

  const referralStats = useMemo(() => {
    const [selYear, selMonth] = selectedMonthYear.split('-').map(Number);
    
    let joinsInSelectedMonth = 0;
    const list = referrals.map(r => {
      const created = new Date(r.createdAt);
      const isSelectedMonth = created.getFullYear() === selYear && created.getMonth() === selMonth;
      if (isSelectedMonth) {
        joinsInSelectedMonth++;
      }
      return {
        ...r,
        joinedInSelectedMonth: isSelectedMonth
      };
    });

    return {
      totalReferrals: referrals.length,
      joinsInSelectedMonth,
      list
    };
  }, [referrals, selectedMonthYear]);

  // Load Tutor Profile
  const loadDashboardData = useCallback(async () => {
    if (!user || !user.tutorProfile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      // 1. Fetch tutor profile
      const tutorId = typeof user.tutorProfile === 'object' ? user.tutorProfile._id : user.tutorProfile;
      const profileRes = await api.get(`/tutors/${tutorId}`);
      setTutorProfile(profileRes.data || null);

      // 2. Fetch tutor bookings
      const bookingsRes = await api.get('/bookings');
      if (bookingsRes.data && bookingsRes.data.success) {
        setBookings(bookingsRes.data.data || []);
      }

      // 3. Fetch referrals
      const referralsRes = await api.get('/tutors/my-referrals');
      if (referralsRes.data && referralsRes.data.success) {
        setReferrals(referralsRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load dashboard data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingBookingId(bookingId);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put(`/bookings/${bookingId}`, { status: newStatus });
      if (res.data && res.data.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
        setMessage({ text: `Request status updated to ${newStatus}!`, type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to update request status.', type: 'error' });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Delete Booking Completely
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking request?')) {
      return;
    }
    setUpdatingBookingId(bookingId);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      if (res.data && res.data.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        setMessage({ text: 'Booking request removed completely.', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to delete booking request.', type: 'error' });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboardData]);

  // Handle Text Profile Inputs
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setTutorProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Toggle Array (Subjects, Classes)
  const handleArrayToggle = (field, item) => {
    setTutorProfile(prev => {
      const list = prev[field] || [];
      const updated = list.includes(item)
        ? list.filter(i => i !== item)
        : [...list, item];
      return { ...prev, [field]: updated };
    });
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put(`/tutors/${tutorProfile._id}`, tutorProfile);
      if (res.data && res.data.success) {
        setTutorProfile(res.data.data);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to update profile details.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };



  // Settings: Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      // Direct user password update if endpoint existed; here we simulate/stub
      setTimeout(() => {
        setMessage({ text: 'Settings updated successfully! (Mocked password change)', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '' });
        setSaving(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to update credentials.', type: 'error' });
      setSaving(false);
    }
  };

  return (
    <>
      <SEO title="Tutor Dashboard" description="Update your tuition availability, rates, and profile credentials." />

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tutor Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Welcome back, {tutorProfile?.fullName || user?.name || 'Tutor'}. Manage your tutor profile and settings here.
            </p>
          </div>

          {/* Feedback Messages */}
          {message.text && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
            }`}>
              <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
              <p>{message.text}</p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            {['Profile', 'Student Requests', 'Referrals', 'Settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 text-sm font-extrabold border-b-2 transition-all focus:outline-none ${
                  activeTab === tab
                    ? 'border-primary text-primary dark:border-blue-500 dark:text-blue-400 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-primary dark:border-slate-800 dark:border-t-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              {activeTab === 'Profile' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Profile Verification Status Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    tutorProfile?.isVerified 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {tutorProfile?.isVerified ? (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Profile verification status</p>
                    <p className={`text-sm font-extrabold ${
                      tutorProfile?.isVerified 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {tutorProfile?.isVerified ? 'Verified Profile' : 'Pending Verification'}
                    </p>
                  </div>
                </div>

                {/* Total Student Leads Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                    <ColorfulUsersIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Student Leads</p>
                    <p className="text-xl font-extrabold text-slate-850 dark:text-slate-100">
                      {tutorProfile?.leadsCount ?? 0}
                    </p>
                  </div>
                </div>

                {/* Total Views Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center relative overflow-hidden shrink-0">
                    <div className="scale-[0.16] transform-gpu origin-center absolute select-none pointer-events-none">
                      <div className="eye-lid">
                        <div className="eye">
                          <div className="cornea">
                            <div className="white-pupil"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Views</p>
                    <p className="text-xl font-extrabold text-slate-850 dark:text-slate-100">
                      {tutorProfile?.viewsCount ?? 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50/75 dark:bg-indigo-950/20 flex items-center justify-center shrink-0">
                    <ColorfulGiftIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">My Referral Code</p>
                    <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30 select-all tracking-wider font-mono">
                      {tutorProfile?.ownReferralCode || 'HT-PENDING'}
                    </p>
                  </div>
                </div>
              </div>
              )}

              {/* TAB 2: PROFILE MANAGEMENT */}
              {activeTab === 'Profile' && tutorProfile && (
                <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 border-b pb-3">Edit Profile Details</h3>
                  
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Hourly Rate (₹)</label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={tutorProfile.hourlyRate || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Monthly Rate (₹)</label>
                      <input
                        type="number"
                        name="monthlyRate"
                        value={tutorProfile.monthlyRate || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>

                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Experience (Years)</label>
                      <input
                        type="number"
                        name="experience"
                        value={tutorProfile.experience || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Street Address</label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={tutorProfile.streetAddress || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">Preferred Division</label>
                      <input
                        type="text"
                        name="city"
                        value={tutorProfile.city || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Pin Code</label>
                      <input
                        type="text"
                        name="pincode"
                        value={tutorProfile.pincode || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Professional Biography</label>
                    <textarea
                      name="bio"
                      rows="4"
                      value={tutorProfile.bio || ''}
                      onChange={handleProfileChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Array Choices (Subjects) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Subjects Taught</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {SUBJECTS.map(sub => {
                        const isChecked = tutorProfile.subjects?.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleArrayToggle('subjects', sub)}
                            className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-200 ${
                              isChecked
                                ? 'bg-primary/10 border-primary text-primary dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                                : 'border-slate-200 text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Array Choices (Classes) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Grades / Classes</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {CLASSES.map(cls => {
                        const isChecked = tutorProfile.classes?.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => handleArrayToggle('classes', cls)}
                            className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-200 ${
                              isChecked
                                ? 'bg-primary/10 border-primary text-primary dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                                : 'border-slate-200 text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            {cls}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <Button type="submit" variant="primary" loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB 2: STUDENT REQUESTS */}
              {activeTab === 'Student Requests' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                      Total Requests ({bookings.length})
                    </h3>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaEnvelope className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">No Student Requests</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                        When students request a class with you, their contact details and requirements will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookings.map(booking => (
                        <div 
                          key={booking._id}
                          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 relative overflow-hidden flex flex-col justify-between"
                        >
                          <div className="space-y-4">
                            {/* Card Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary/10 text-primary dark:bg-blue-900/20 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                                  <FaUser className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                                    {booking.studentName}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                    Tutoring Lead
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                booking.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-450'
                                  : booking.status === 'Assigned'
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                                  : booking.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                              }`}>
                                {booking.status === 'Pending' ? 'Pending Approval' : booking.status === 'Assigned' ? 'Assigned' : booking.status}
                              </span>
                            </div>

                             {/* Contact Grid */}
                             {booking.status === 'Pending' ? (
                               <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl text-[11px] font-semibold text-slate-500 dark:text-slate-455 italic flex items-center gap-1.5">
                                 <span>⏳</span>
                                 <span>Contact details will be unlocked once you accept this request.</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400">
                                 <FaPhone className="text-slate-400 shrink-0" />
                                 <span>{booking.studentPhone || 'N/A'}</span>
                               </div>
                             )}

                            {/* Requirement Details */}
                            <div className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
                              <div>
                                <span>Subject: <strong className="text-slate-800 dark:text-slate-200">{booking.subject}</strong></span>
                              </div>
                              <div>
                                <span>Class: <strong className="text-slate-800 dark:text-slate-200">{booking.gradeClass}</strong></span>
                              </div>
                              <div>
                                <span>Mode: <strong className="text-slate-800 dark:text-slate-200">{booking.preferredMode}</strong></span>
                              </div>
                              {booking.location && (
                                <div className="text-[11px] bg-slate-50 dark:bg-slate-800/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mt-1 italic">
                                  Address: {booking.location}
                                </div>
                              )}
                              {/* Message */}
                              {booking.message && booking.message !== 'Instant booking from tutor profile' && (
                                <div className="bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                                  <p className="font-bold text-[10px] uppercase text-slate-400 dark:text-slate-505 tracking-wider mb-1">Student Notes:</p>
                                  <p className="leading-relaxed">"{booking.message}"</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3 mt-4">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                              Received: {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>

                            {booking.status === 'Pending' && (
                              <div className="flex gap-2">
                                <button
                                  disabled={updatingBookingId !== null}
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'Assigned')}
                                  className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                  <FaCheck className="h-3 w-3" />
                                  Accept
                                </button>
                                <button
                                  disabled={updatingBookingId !== null}
                                  onClick={() => handleDeleteBooking(booking._id)}
                                  className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-655 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                  <FaTimes className="h-3 w-3" />
                                  Decline
                                </button>
                              </div>
                            )}

                            {booking.status === 'Assigned' && (
                              <div className="flex gap-2">
                                <button
                                  disabled={updatingBookingId !== null}
                                  onClick={() => handleDeleteBooking(booking._id)}
                                  className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-655 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer transition-colors"
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

              {/* TAB 3: REFERRALS ANALYTICS */}
              {activeTab === 'Referrals' && (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] transition-all">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 flex items-center justify-center text-xl shrink-0">
                        <ColorfulGiftIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Referred Signups</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{referralStats.totalReferrals}</h4>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] transition-all">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                        <FaUser className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Referred in {selectedMonthLabel}</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{referralStats.joinsInSelectedMonth}</h4>
                      </div>
                    </div>
                  </div>

                  {/* List Section */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:items-center gap-3">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100">Referrals Directory</h3>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Tutors who registered using your unique referral code.</p>
                        </div>
                        
                        {/* Month Selector dropdown */}
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-300">
                          <span>Month:</span>
                          <select
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="bg-transparent focus:outline-none cursor-pointer text-primary dark:text-blue-400 font-extrabold pr-1"
                          >
                            {uniqueMonths.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Search */}
                      <div className="relative flex items-center max-w-xs w-full">
                        <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
                        <input
                          type="text"
                          value={referralSearch}
                          onChange={(e) => setReferralSearch(e.target.value)}
                          placeholder="Search referred tutor..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-800 dark:text-slate-205 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wide">
                            <th className="pb-3 pl-2">Referred Tutor</th>
                            <th className="pb-3 text-center">Registration Date</th>
                            <th className="pb-3 pr-2 text-right">Joined in {selectedMonthLabel}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-350">
                          {referralStats.list.filter(r => {
                            const query = referralSearch.toLowerCase();
                            return r.name.toLowerCase().includes(query) || r.email.toLowerCase().includes(query);
                          }).length === 0 ? (
                            <tr>
                              <td colSpan="3" className="py-8 text-center text-slate-400 font-medium">No referred tutors found.</td>
                            </tr>
                          ) : (
                            referralStats.list
                              .filter(r => {
                                const query = referralSearch.toLowerCase();
                                return r.name.toLowerCase().includes(query) || r.email.toLowerCase().includes(query);
                              })
                              .map(ref => (
                                <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                                  <td className="py-3.5 pl-2">
                                    <div className="flex items-center gap-3">
                                      {ref.photo && !ref.photo.includes('photo-1535713875002-d1d0cf377fde') ? (
                                        <img src={ref.photo} alt={ref.name} className="h-8 w-8 rounded-full object-cover border" />
                                      ) : (
                                        <div className={`h-8 w-8 rounded-full font-extrabold flex items-center justify-center text-xs ${getAvatarStyle(ref.name)}`}>
                                          {ref.name.trim().charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="font-bold text-slate-850 dark:text-slate-200">{ref.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 text-center font-semibold text-slate-650 dark:text-slate-300">
                                    {new Date(ref.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </td>
                                  <td className="py-3.5 pr-2 text-right">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      ref.joinedInSelectedMonth
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                        : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                      {ref.joinedInSelectedMonth ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'Settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Password Form */}
                  <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center gap-2">
                      <FaLock className="text-primary dark:text-blue-500" />
                      Change Password
                    </h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" variant="primary" loading={saving}>
                        Update Credentials
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TutorDashboard;
