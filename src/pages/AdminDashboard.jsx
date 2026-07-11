import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaCheck, FaTimes, FaUserSlash, FaUserCheck, FaInfoCircle, FaDatabase, FaServer } from 'react-icons/fa';
import api from '../services/api';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import { getAvatarStyle } from '../utils/avatarHelper';

const formatVerifiedDate = (dateString) => {
  if (!dateString) return 'Not Verified';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Not Verified';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ColorfulUsersIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Left User Gradient: Sky Blue */}
      <linearGradient id="leftGrad" x1="2.5" y1="9" x2="8.5" y2="20">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      
      {/* Right User Gradient: Emerald Green */}
      <linearGradient id="rightGrad" x1="15.5" y1="9" x2="21.5" y2="20">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      
      {/* Center User Gradient: Indigo-Violet */}
      <linearGradient id="centerGrad" x1="7" y1="3" x2="17" y2="20">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>

    {/* Left User */}
    <circle cx="6.5" cy="10" r="2.5" fill="url(#leftGrad)" />
    <path d="M6.5 13.5C4.5 13.5 2.5 15.1 2.5 17.5V19.5H10.5V17.5C10.5 15.1 8.5 13.5 6.5 13.5Z" fill="url(#leftGrad)" />

    {/* Right User */}
    <circle cx="17.5" cy="10" r="2.5" fill="url(#rightGrad)" />
    <path d="M17.5 13.5C15.5 13.5 13.5 15.1 13.5 17.5V19.5H22.5V17.5C22.5 15.1 20.5 13.5 17.5 13.5Z" fill="url(#rightGrad)" />

    {/* Center User (Drawn last to overlap left/right) */}
    <circle cx="12" cy="7" r="3" fill="url(#centerGrad)" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
    <path d="M12 11C9.24 11 7 13.24 7 16V18.5C7 19.33 7.67 20 8.5 20H15.5C16.33 20 17 19.33 17 18.5V16C17 13.24 14.76 11 12 11Z" fill="url(#centerGrad)" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
  </svg>
);

const ColorfulDatabaseIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Glossy Server Metallic Gradient */}
      <linearGradient id="dbMetallicGrad" x1="4" y1="2" x2="20" y2="22">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      
      {/* Light border accents */}
      <linearGradient id="dbHighlightGrad" x1="12" y1="2" x2="12" y2="22">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>

    {/* Top Cylinder */}
    <path d="M4 6C4 7.66 7.58 9 12 9C16.42 9 20 7.66 20 6C20 4.34 16.42 3 12 3C7.58 3 4 4.34 4 6Z" fill="url(#dbMetallicGrad)" stroke="url(#dbHighlightGrad)" strokeWidth="1" />
    <path d="M20 6V10C20 11.66 16.42 13 12 13C7.58 13 4 11.66 4 10V6" fill="url(#dbMetallicGrad)" fillOpacity="0.85" stroke="url(#dbHighlightGrad)" strokeWidth="1" />

    {/* Middle Cylinder */}
    <path d="M20 11V15C20 16.66 16.42 18 12 18C7.58 18 4 15.66 4 14V11" fill="url(#dbMetallicGrad)" fillOpacity="0.85" stroke="url(#dbHighlightGrad)" strokeWidth="1" />

    {/* Bottom Cylinder */}
    <path d="M20 16V20C20 21.66 16.42 23 12 23C7.58 23 4 21.66 4 20V16" fill="url(#dbMetallicGrad)" fillOpacity="0.85" stroke="url(#dbHighlightGrad)" strokeWidth="1" />
    
    {/* Ellipses lines on cylinders for depth */}
    <path d="M4 10C4 11.66 7.58 13 12 13C16.42 13 20 11.66 20 10" stroke="url(#dbHighlightGrad)" strokeWidth="1" />
    <path d="M4 15C4 16.66 7.58 18 12 18C16.42 18 20 16.66 20 15" stroke="url(#dbHighlightGrad)" strokeWidth="1" />
  </svg>
);

const ColorfulGiftIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Box Wrap/Lid Gradient: Rose/Coral */}
      <linearGradient id="lidGrad" x1="2" y1="6" x2="22" y2="10">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
      
      {/* Box Body Gradient: Gold/Orange */}
      <linearGradient id="bodyGrad" x1="4" y1="10" x2="20" y2="21">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      
      {/* Ribbon Gradient: Glowing Red */}
      <linearGradient id="ribbonGrad" x1="12" y1="2" x2="12" y2="21">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
    </defs>

    {/* Ribbon Bow Loops */}
    <path d="M12 7C9.5 7 7.5 5.5 7.5 3.5C7.5 1.5 9.5 1 12 5C14.5 1 16.5 1.5 16.5 3.5C16.5 5.5 14.5 7 12 7Z" fill="url(#ribbonGrad)" />
    <path d="M12 7.5C11.17 7.5 10.5 6.83 10.5 6C10.5 5.17 11.17 4.5 12 4.5C12.83 4.5 13.5 5.17 13.5 6C13.5 6.83 12.83 7.5 12 7.5Z" fill="#FEE2E2" />

    {/* Gift Box Body */}
    <rect x="4" y="10" width="16" height="11" rx="2" fill="url(#bodyGrad)" />
    
    {/* Gift Box Lid */}
    <rect x="3" y="7" width="18" height="3.5" rx="1.5" fill="url(#lidGrad)" className="stroke-white dark:stroke-slate-900" strokeWidth="0.5" />
    
    {/* Ribbon Vertical and Horizontal Stripes */}
    <rect x="10.5" y="7" width="3" height="14" fill="url(#ribbonGrad)" />
    <rect x="3" y="11.5" width="18" height="2" fill="url(#ribbonGrad)" />
  </svg>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview', 'Tutors', 'Referrals'
  const [stats, setStats] = useState({
    tutors: { total: 0, verified: 0, pending: 0 },
    students: { total: 0 }
  });
  const [tutors, setTutors] = useState([]);
  const [showCapacityDetails, setShowCapacityDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [referralSearch, setReferralSearch] = useState('');
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });

  // Fetch admin dashboard details
  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Stats
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // 2. Fetch Tutors
      const tutorsRes = await api.get('/tutors', { params: { adminView: true } });
      setTutors(tutorsRes.data || []);


    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setErrorMsg('Failed to fetch admin data. Make sure MongoDB is connected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Verify / Approve Tutor profile
  const handleVerifyTutor = async (tutorId, isCurrentlyVerified) => {
    setActionLoading(tutorId);
    setErrorMsg('');
    try {
      const res = await api.put(`/admin/tutors/${tutorId}/verify`, { isVerified: !isCurrentlyVerified });
      if (res.data && res.data.success) {
        // Update local state
        setTutors(prev => prev.map(t => t._id === tutorId ? { 
          ...t, 
          isVerified: !isCurrentlyVerified,
          verifiedAt: !isCurrentlyVerified ? new Date().toISOString() : null,
          verifiedDate: !isCurrentlyVerified ? new Date().toISOString() : null 
        } : t));
        // Refresh stats
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update verification status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Tutor
  const handleDeleteTutor = async (tutorId) => {
    if (!window.confirm('Are you sure you want to remove this tutor profile?')) return;
    setActionLoading(tutorId);
    setErrorMsg('');
    try {
      const res = await api.delete(`/tutors/${tutorId}`);
      if (res.data && res.data.success) {
        setTutors(prev => prev.filter(t => t._id !== tutorId));
        // Refresh stats
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete tutor profile.');
    } finally {
      setActionLoading(null);
    }
  };



  const uniqueMonths = React.useMemo(() => {
    const months = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Find the earliest year in the database, defaulting to current year
    let earliestYear = currentYear;
    if (tutors.length > 0) {
      const years = tutors
        .map(t => t.createdAt ? new Date(t.createdAt).getFullYear() : null)
        .filter(y => y !== null && !isNaN(y));
      if (years.length > 0) {
        earliestYear = Math.min(...years);
      }
    }
    
    // Generate all 12 months for each year from earliestYear to currentYear
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
    
    // Sort chronologically descending (most recent first)
    return months.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [tutors]);

  const referralData = React.useMemo(() => {
    const [selYear, selMonth] = selectedMonthYear.split('-').map(Number);

    // 1. Calculate total referrals
    const referredTutors = tutors.filter(t => t.referralCode);
    const totalReferrals = referredTutors.length;

    // 2. Calculate referrals in selected month
    const referralsInSelectedMonth = referredTutors.filter(t => {
      const created = new Date(t.createdAt);
      return created.getFullYear() === selYear && created.getMonth() === selMonth;
    }).length;

    // 3. Map tutors to their referral statistics
    const referrersList = tutors
      .filter(t => t.ownReferralCode) // only tutors with referral codes
      .map(referrer => {
        const referredList = tutors.filter(t => t.referralCode === referrer.ownReferralCode);
        const selectedMonthList = referredList.filter(t => {
          const created = new Date(t.createdAt);
          return created.getFullYear() === selYear && created.getMonth() === selMonth;
        });

        return {
          id: referrer._id,
          name: referrer.fullName || referrer.name,
          email: referrer.email,
          mobile: referrer.mobile,
          ownReferralCode: referrer.ownReferralCode,
          photo: referrer.photo,
          totalReferred: referredList.length,
          referredInSelectedMonth: selectedMonthList.length,
          referredUsers: referredList.map(t => ({
            id: t._id,
            name: t.fullName || t.name,
            email: t.email,
            mobile: t.mobile,
            photo: t.photo,
            createdAt: t.createdAt
          }))
        };
      });

    // 4. Find Top Referrer
    let topReferrer = { name: 'None', count: 0 };
    referrersList.forEach(r => {
      if (r.totalReferred > topReferrer.count) {
        topReferrer = { name: r.name, count: r.totalReferred };
      }
    });

    return {
      totalReferrals,
      referralsInSelectedMonth,
      topReferrer,
      referrersList
    };
  }, [tutors, selectedMonthYear]);

  const selectedMonthLabel = uniqueMonths.find(m => m.value === selectedMonthYear)?.label || 'Selected Month';

  return (
    <>
      <SEO title="Admin Dashboard" description="Manage verified tutors, system locations, and metrics." />

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-205 dark:border-slate-800 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Control Center</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Manage your tutor directory and verify profiles.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDashboardData} loading={loading}>
              Refresh Board
            </Button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-3">
              <FaInfoCircle className="h-4 w-4 shrink-0" />
              <div>
                <p>{errorMsg}</p>
                <p className="text-[10px] opacity-80 mt-1">If MongoDB is down, this dashboard will remain empty. Start your MongoDB server to test full-stack features.</p>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            {['Overview', 'Tutors', 'Referrals'].map(tab => (
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
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'Overview' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div 
                      onClick={() => setActiveTab('Tutors')}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-900 shadow-md dark:bg-black dark:border-slate-950 flex items-center justify-center text-xl shrink-0 relative overflow-visible">
                        <svg width="0" height="0" className="absolute">
                          <linearGradient id="cap-gradient-admin" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d4af37" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#fffbdf" />
                          </linearGradient>
                        </svg>
                        <FaGraduationCap style={{ fill: "url(#cap-gradient-admin)" }} className="filter drop-shadow-[0_1px_4px_rgba(212,175,55,0.5)]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tutors</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stats.tutors?.total || 0}</h4>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setActiveTab('Tutors')}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                        <FaUserCheck />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Tutors</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stats.tutors?.verified || 0}</h4>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 cursor-default">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                        <ColorfulUsersIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Students</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stats.students?.total || 0}</h4>
                      </div>
                    </div>

                    {/* New Storage Capacity Stat Card */}
                    <div 
                      onClick={() => setShowCapacityDetails(prev => !prev)}
                      className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ${
                        showCapacityDetails ? 'border-primary dark:border-blue-500' : 'border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 flex items-center justify-center shrink-0">
                          <ColorfulDatabaseIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Storage Capacity</p>
                          <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">
                            {(100 - Math.max(
                              Math.min((((stats.students?.total || 0) * 0.5 + (stats.tutors?.total || 0) * 3.5 + (stats.bookings?.total || 0) * 1.0) / 1024 / 512) * 100, 100),
                              Math.min(((stats.tutors?.total || 0) * 1.2 / 25000) * 100, 100)
                            )).toFixed(2)}% Free
                          </h4>
                        </div>
                      </div>
                      <svg 
                        className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showCapacityDetails ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Storage Capacity Section */}
                  {showCapacityDetails && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                      <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100">Storage & System Capacity Dashboard</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Estimated system limits based on MongoDB (512 MB Free tier) and Cloudinary (25 GB Free tier).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left: Storage Usage progress bars */}
                      <div className="space-y-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Usage Metrics</h4>
                        
                        {/* MongoDB Metric */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-330">
                            <span>MongoDB Database (512 MB Free)</span>
                            <span>{(((stats.students?.total || 0) * 0.5 + (stats.tutors?.total || 0) * 3.5 + (stats.bookings?.total || 0) * 1.0) / 1024).toFixed(4)} MB ({Math.min((((stats.students?.total || 0) * 0.5 + (stats.tutors?.total || 0) * 3.5 + (stats.bookings?.total || 0) * 1.0) / 1024 / 512) * 100, 100).toFixed(4)}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-500" 
                              style={{ width: `${Math.min((((stats.students?.total || 0) * 0.5 + (stats.tutors?.total || 0) * 3.5 + (stats.bookings?.total || 0) * 1.0) / 1024 / 512) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Cloudinary Metric */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-330">
                            <span>Cloudinary Asset CDN (25 GB Free)</span>
                            <span>{((stats.tutors?.total || 0) * 0.9).toFixed(2)} MB ({Math.min(((stats.tutors?.total || 0) * 0.9 / 25000) * 100, 100).toFixed(4)}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 transition-all duration-500" 
                              style={{ width: `${Math.min(((stats.tutors?.total || 0) * 0.9 / 25000) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Remaining Limit estimations */}
                      <div className="space-y-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Capacity Estimations</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
                              <FaGraduationCap />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Max Tutor Logins</p>
                              <h4 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">
                                {Math.max(0, Math.min(
                                  Math.floor((512 * 1024 - ((stats.students?.total || 0) * 0.5 + (stats.tutors?.total || 0) * 3.5 + (stats.bookings?.total || 0) * 1.0)) / 3.5),
                                  Math.floor((25000 - (stats.tutors?.total || 0) * 0.9) / 0.9)
                                )).toLocaleString()}
                              </h4>
                              <p className="text-[8px] text-slate-400 font-bold tracking-tight leading-tight mt-0.5">Bounded by Cloudinary</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Max Student Logins</p>
                              <h4 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">
                                {Math.max(0, Math.floor((512 * 1024 - ((stats.students?.total || 0) * 0.5 + (stats.tutors?.total || 0) * 3.5 + (stats.bookings?.total || 0) * 1.0)) / 0.5)).toLocaleString()}
                              </h4>
                              <p className="text-[8px] text-slate-400 font-bold tracking-tight leading-tight mt-0.5">Bounded by MongoDB</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-850/40 p-4 rounded-2xl text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed border border-slate-100 dark:border-slate-800 font-semibold">
                      <p className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[9px] tracking-wider mb-1">Calculation parameters:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Student registration size:</strong> ~0.5 KB inside MongoDB. Students do not upload files.</li>
                        <li><strong>Tutor profile registration size:</strong> ~3.5 KB inside MongoDB (profile, subjects, classes, location coordinates) + ~900 KB average inside Cloudinary CDN for attachments (profile picture, verified certificates).</li>
                        <li><strong>Booking Request size:</strong> ~1.0 KB inside MongoDB.</li>
                      </ul>
                    </div>
                  </div>
                  )}
                </div>
              )}

              {/* TAB 2: TUTORS MANAGEMENT */}
              {activeTab === 'Tutors' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-5">Tutor Accounts Directory</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          <th className="pb-3 pl-2">Name</th>
                          <th className="pb-3">Subject & Experience</th>
                          <th className="pb-3">Location</th>
                          <th className="pb-3">Verification</th>
                          <th className="pb-3 pr-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-350">
                        {tutors.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No registered tutors yet.</td>
                          </tr>
                        ) : (
                          tutors.map(tutor => (
                            <tr key={tutor._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                              <td className="py-3.5 pl-2">
                                <div className="flex items-center gap-3">
                                  {tutor.photo && !tutor.photo.includes('photo-1535713875002-d1d0cf377fde') ? (
                                    <img src={tutor.photo} alt={tutor.fullName} className="h-8 w-8 rounded-full object-cover border" />
                                  ) : (
                                    <div className={`h-8 w-8 rounded-full font-extrabold flex items-center justify-center text-xs shrink-0 ${getAvatarStyle(tutor.fullName)}`}>
                                      {(tutor.fullName || 'T').trim().charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-850 dark:text-slate-200">{tutor.fullName}</p>
                                    <p className="text-[9px] text-slate-400">
                                      {tutor.email} • {tutor.mobile}
                                      {tutor.referralCode && ` • Referral: ${tutor.referralCode}`}
                                      {tutor.paymentId && ` • Fee: ₹1 Paid (ID: ${tutor.paymentId})`}
                                      {tutor.certificateUrl && (
                                        <>
                                          {' • '}
                                          <a 
                                            href={tutor.certificateUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-primary dark:text-blue-400 hover:underline font-bold"
                                          >
                                            📄 Certificate
                                          </a>
                                        </>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5">
                                <p className="font-semibold text-slate-800 dark:text-slate-350">{tutor.qualification}</p>
                                <p className="text-[9px] text-slate-400">{(tutor.subjects || []).slice(0, 3).join(', ')} • {tutor.experience} Yrs Exp</p>
                              </td>
                              <td className="py-3.5">
                                <p>{tutor.city || 'N/A'}</p>
                                <p className="text-[9px] text-slate-400">{tutor.state}</p>
                              </td>
                              <td className="py-3.5">
                                <div className="flex flex-col items-start gap-1">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold ${
                                    tutor.isVerified 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-250 dark:bg-emerald-950/20' 
                                      : 'bg-amber-50 text-amber-600 border border-amber-250 dark:bg-amber-950/20'
                                  }`}>
                                    Status: {tutor.isVerified ? 'Verified ✅' : 'Pending'}
                                  </span>
                                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                                    Verified Date: {formatVerifiedDate(tutor.verifiedDate)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 pr-2 text-right space-x-2">
                                <Button
                                  variant={tutor.isVerified ? 'outline' : 'primary'}
                                  size="xs"
                                  loading={actionLoading === tutor._id}
                                  onClick={() => handleVerifyTutor(tutor._id, tutor.isVerified)}
                                >
                                  {tutor.isVerified ? 'Unverify' : 'Verify'}
                                </Button>
                                <button
                                  onClick={() => handleDeleteTutor(tutor._id)}
                                  disabled={actionLoading === tutor._id}
                                  className="text-rose-500 hover:text-rose-700 disabled:opacity-50 inline-block font-extrabold focus:outline-none ml-2"
                                  title="Delete Tutor Profile"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

              {/* TAB 3: REFERRALS ANALYTICS */}
              {activeTab === 'Referrals' && (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] transition-all">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                        <ColorfulUsersIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Referred Signups</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{referralData.totalReferrals}</h4>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] transition-all">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                        <FaUserCheck />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Referred in {selectedMonthLabel}</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{referralData.referralsInSelectedMonth}</h4>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] transition-all">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50/75 dark:bg-indigo-950/20 flex items-center justify-center shrink-0">
                        <ColorfulGiftIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Referrer</p>
                        <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 mt-1 max-w-[200px] truncate">
                          {referralData.topReferrer.name} ({referralData.topReferrer.count} joins)
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* List Section */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:items-center gap-3">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100">Referrer Directory</h3>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Tutors who generated unique referral codes and recruited new signups.</p>
                        </div>
                        
                        {/* Month Selector dropdown */}
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
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
                          placeholder="Search referrer name or code..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-800 dark:text-slate-205 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wide">
                            <th className="pb-3 pl-2">Referrer</th>
                            <th className="pb-3">Referral Code</th>
                            <th className="pb-3 text-center">Joins in {selectedMonthLabel}</th>
                            <th className="pb-3 text-center">Total Joins</th>
                            <th className="pb-3 pr-2 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-350">
                          {referralData.referrersList.filter(r => {
                            const query = referralSearch.toLowerCase();
                            return r.name.toLowerCase().includes(query) || r.ownReferralCode.toLowerCase().includes(query);
                          }).length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No referrers matched your query.</td>
                            </tr>
                          ) : (
                            referralData.referrersList
                              .filter(r => {
                                const query = referralSearch.toLowerCase();
                                return r.name.toLowerCase().includes(query) || r.ownReferralCode.toLowerCase().includes(query);
                              })
                              .sort((a, b) => b.totalReferred - a.totalReferred)
                              .map(referrer => (
                                <tr key={referrer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                                  <td className="py-3.5 pl-2">
                                    <div className="flex items-center gap-3">
                                      {referrer.photo && !referrer.photo.includes('photo-1535713875002-d1d0cf377fde') ? (
                                        <img src={referrer.photo} alt={referrer.name} className="h-8 w-8 rounded-full object-cover border" />
                                      ) : (
                                        <div className={`h-8 w-8 rounded-full font-extrabold flex items-center justify-center text-xs shrink-0 ${getAvatarStyle(referrer.name)}`}>
                                          {(referrer.name || 'T').trim().charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-bold text-slate-850 dark:text-slate-200">{referrer.name}</p>
                                        <p className="text-[9px] text-slate-400">{referrer.email} • {referrer.mobile}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5">
                                    <span className="font-mono font-bold bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-650 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60 tracking-wide text-[10px]">
                                      {referrer.ownReferralCode}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                    {referrer.referredInSelectedMonth}
                                  </td>
                                  <td className="py-3.5 text-center font-bold text-slate-800 dark:text-slate-100">
                                    {referrer.totalReferred}
                                  </td>
                                  <td className="py-3.5 pr-2 text-right">
                                    <Button
                                      variant="outline"
                                      size="xs"
                                      disabled={referrer.totalReferred === 0}
                                      onClick={() => setSelectedReferrer(referrer)}
                                    >
                                      View Joins
                                    </Button>
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

            </>
          )}
        </div>
      </div>

      {/* DETAIL MODAL FOR REFERRAL JOINS */}
      {selectedReferrer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="fixed inset-0 cursor-default" 
            onClick={() => setSelectedReferrer(null)}
          />
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 relative z-10 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100">
                  Referred Tutors ({selectedReferrer.totalReferred})
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Tutors registered using {selectedReferrer.name}'s code ({selectedReferrer.ownReferralCode})
                </p>
              </div>
              <button 
                onClick={() => setSelectedReferrer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-black focus:outline-none"
              >
                &times;
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {selectedReferrer.referredUsers.map(user => (
                <div 
                  key={user.id}
                  className="bg-slate-50 dark:bg-slate-850/40 border border-slate-100/50 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    {user.photo && !user.photo.includes('photo-1535713875002-d1d0cf377fde') ? (
                      <img src={user.photo} alt={user.name} className="h-8 w-8 rounded-full object-cover border" />
                    ) : (
                      <div className={`h-8 w-8 rounded-full font-extrabold flex items-center justify-center text-xs shrink-0 ${getAvatarStyle(user.name)}`}>
                        {(user.name || 'T').trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{user.name}</p>
                      <p className="text-[9px] text-slate-400">{user.email} • {user.mobile}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Join Date</span>
                    <span className="text-[10px] font-semibold text-slate-650 dark:text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedReferrer(null)}>
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
