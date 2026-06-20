import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaClipboardList, FaChartLine, FaCheck, FaTimes, FaUserSlash, FaUserCheck, FaInfoCircle } from 'react-icons/fa';
import api from '../services/api';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview', 'Tutors', 'Leads'
  const [stats, setStats] = useState({
    tutors: { total: 0, verified: 0, pending: 0 },
    bookings: { total: 0, pending: 0, contacted: 0, assigned: 0 }
  });
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
      const tutorsRes = await api.get('/tutors');
      setTutors(tutorsRes.data || []);

      // 3. Fetch Bookings/Leads
      const bookingsRes = await api.get('/bookings');
      if (bookingsRes.data && bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }
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
        setTutors(prev => prev.map(t => t._id === tutorId ? { ...t, isVerified: !isCurrentlyVerified } : t));
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

  // Assign Tutor to Student Lead
  const handleAssignTutor = async (bookingId, tutorId) => {
    setActionLoading(bookingId);
    setErrorMsg('');
    try {
      const res = await api.put(`/bookings/${bookingId}`, {
        assignedTutor: tutorId || null,
        status: tutorId ? 'Assigned' : 'Pending'
      });
      if (res.data && res.data.success) {
        // Update local state
        setBookings(prev => prev.map(b => b._id === bookingId ? {
          ...b,
          assignedTutor: tutorId ? tutors.find(t => t._id === tutorId) : null,
          status: tutorId ? 'Assigned' : 'Pending'
        } : b));
        
        // Refresh stats
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update lead tutor assignment.');
    } finally {
      setActionLoading(null);
    }
  };

  // Change Lead Status
  const handleStatusChange = async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    setErrorMsg('');
    try {
      const res = await api.put(`/bookings/${bookingId}`, { status: newStatus });
      if (res.data && res.data.success) {
        // Update local state
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
        
        // Refresh stats
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update lead status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <SEO title="Admin Dashboard" description="Manage verified tutors, student enquiries, system locations, and metrics." />

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-205 dark:border-slate-800 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Control Center</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Manage your tutor directory, verify profiles, and coordinate student leads.
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
            {['Overview', 'Tutors', 'Leads'].map(tab => (
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
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center text-xl">
                        <FaGraduationCap />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tutors</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stats.tutors.total}</h4>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center text-xl">
                        <FaUserCheck />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Tutors</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stats.tutors.verified}</h4>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white dark:bg-slate-850 dark:text-slate-300 flex items-center justify-center text-xl">
                        <FaClipboardList />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Enquiries</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stats.bookings.total}</h4>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-450 flex items-center justify-center text-xl">
                        <FaChartLine />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Leads</p>
                        <h4 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stats.bookings.pending}</h4>
                      </div>
                    </div>
                  </div>

                  {/* Summary Blocks */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tutors Summary */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-4">Registration Approvals</h3>
                      <div className="space-y-4">
                        {tutors.filter(t => !t.isVerified).slice(0, 3).length === 0 ? (
                          <p className="text-xs text-slate-450 text-center py-6 font-medium">All registered tutors are verified ✓</p>
                        ) : (
                          tutors.filter(t => !t.isVerified).slice(0, 3).map(tutor => (
                            <div key={tutor._id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{tutor.fullName}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{tutor.qualification} • {tutor.city}</p>
                              </div>
                              <Button
                                variant="primary"
                                size="xs"
                                loading={actionLoading === tutor._id}
                                onClick={() => handleVerifyTutor(tutor._id, tutor.isVerified)}
                              >
                                Approve Profile
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Bookings Summary */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-4">Recent Enquiries</h3>
                      <div className="space-y-4">
                        {bookings.slice(0, 3).length === 0 ? (
                          <p className="text-xs text-slate-450 text-center py-6 font-medium">No trial requests registered yet</p>
                        ) : (
                          bookings.slice(0, 3).map(booking => (
                            <div key={booking._id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{booking.studentName}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{booking.subject} • Class {booking.gradeClass}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                booking.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30' :
                                booking.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30' :
                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
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
                                  <img src={tutor.photo} alt={tutor.fullName} className="h-8 w-8 rounded-full object-cover border" />
                                  <div>
                                    <p className="font-bold text-slate-850 dark:text-slate-200">{tutor.fullName}</p>
                                    <p className="text-[9px] text-slate-400">{tutor.email} • {tutor.mobile}</p>
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
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold ${
                                  tutor.isVerified 
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-250 dark:bg-emerald-950/20' 
                                    : 'bg-amber-50 text-amber-600 border border-amber-250 dark:bg-amber-950/20'
                                }`}>
                                  {tutor.isVerified ? <FaCheck className="text-[7px]" /> : <FaTimes className="text-[7px]" />}
                                  {tutor.isVerified ? 'Verified' : 'Pending Review'}
                                </span>
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

              {/* TAB 3: TRIAL REQUESTS / LEADS */}
              {activeTab === 'Leads' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-5">Student Trial Enquiries</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          <th className="pb-3 pl-2">Student Details</th>
                          <th className="pb-3">Class & Subject</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Assigned Tutor</th>
                          <th className="pb-3 pr-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-350">
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No student requests registered yet.</td>
                          </tr>
                        ) : (
                          bookings.map(lead => (
                            <tr key={lead._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                              <td className="py-3.5 pl-2">
                                <p className="font-bold text-slate-850 dark:text-slate-200">{lead.studentName}</p>
                                <p className="text-[9px] text-slate-400">{lead.studentEmail || 'No Email'} • {lead.studentPhone}</p>
                                {lead.location && <p className="text-[8px] text-slate-400 italic truncate max-w-[200px] mt-0.5">{lead.location}</p>}
                              </td>
                              <td className="py-3.5 font-semibold">
                                <p className="text-slate-800 dark:text-slate-350">{lead.subject}</p>
                                <p className="text-[9px] text-slate-400">Class {lead.gradeClass} ({lead.preferredMode})</p>
                              </td>
                              <td className="py-3.5">
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg p-1 text-[11px] focus:outline-none"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Assigned">Assigned</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                              <td className="py-3.5 font-medium">
                                <select
                                  value={lead.assignedTutor?._id || ''}
                                  onChange={(e) => handleAssignTutor(lead._id, e.target.value)}
                                  className="w-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg p-1 text-[11px] focus:outline-none"
                                >
                                  <option value="">-- Unassigned --</option>
                                  {tutors.filter(t => t.isVerified).map(t => (
                                    <option key={t._id} value={t._id}>
                                      {t.fullName} ({t.city})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3.5 pr-2 text-right">
                                <span className="text-[10px] text-slate-400 font-semibold">{new Date(lead.createdAt).toLocaleDateString()}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
