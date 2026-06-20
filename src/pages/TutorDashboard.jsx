import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import { SUBJECTS, CLASSES, STATES } from '../constants';
import { FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaLock, FaUsers } from 'react-icons/fa';

const TutorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Leads'); // 'Leads', 'Profile', 'Documents', 'Settings'
  const [tutorProfile, setTutorProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  // Load Tutor Profile & Leads
  const loadDashboardData = async () => {
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

      // 2. Fetch Leads (Bookings assigned to this tutor)
      const leadsRes = await api.get('/bookings');
      if (leadsRes.data && leadsRes.data.success) {
        setLeads(leadsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load dashboard data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

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

  // Lead Status Change (Tutor can mark contacted/etc)
  const handleLeadStatusChange = async (leadId, newStatus) => {
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put(`/bookings/${leadId}`, { status: newStatus });
      if (res.data && res.data.success) {
        setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
        setMessage({ text: 'Lead status updated!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to update lead status.', type: 'error' });
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
      <SEO title="Tutor Dashboard" description="Manage your student leads, update tuition availability, rates, and profile credentials." />

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tutor Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Welcome back, {tutorProfile?.fullName || user?.name || 'Tutor'}. Manage your student enquiries and details here.
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
            {['Leads', 'Profile', 'Settings'].map(tab => (
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
              {/* TAB 1: LEADS / INQUIRIES */}
              {activeTab === 'Leads' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <FaUsers className="text-primary dark:text-blue-500" />
                    Assigned Student Trial Enquiries (Leads)
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          <th className="pb-3 pl-2">Student Name</th>
                          <th className="pb-3">Subject & Class</th>
                          <th className="pb-3">Phone & Mode</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 pr-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-350">
                        {leads.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No leads assigned to your profile yet.</td>
                          </tr>
                        ) : (
                          leads.map(lead => (
                            <tr key={lead._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                              <td className="py-3.5 pl-2">
                                <p className="font-bold text-slate-850 dark:text-slate-200">{lead.studentName}</p>
                                <p className="text-[9px] text-slate-400">{lead.studentEmail || 'No Email'}</p>
                              </td>
                              <td className="py-3.5 font-semibold">
                                <p className="text-slate-800 dark:text-slate-350">{lead.subject}</p>
                                <p className="text-[9px] text-slate-400">Class {lead.gradeClass}</p>
                              </td>
                              <td className="py-3.5">
                                <p className="font-semibold">{lead.studentPhone}</p>
                                <p className="text-[9px] text-slate-450">{lead.preferredMode} Mode</p>
                              </td>
                              <td className="py-3.5">
                                <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded ${
                                  lead.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30' :
                                  lead.status === 'Contacted' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30' :
                                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="py-3.5 pr-2 text-right space-x-2">
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => handleLeadStatusChange(lead._id, 'Contacted')}
                                  className={lead.status === 'Contacted' ? 'hidden' : ''}
                                >
                                  Mark Contacted
                                </Button>
                                <Button
                                  variant="accent"
                                  size="xs"
                                  onClick={() => handleLeadStatusChange(lead._id, 'Rejected')}
                                  className={lead.status === 'Rejected' ? 'hidden' : ''}
                                >
                                  Reject
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE MANAGEMENT */}
              {activeTab === 'Profile' && tutorProfile && (
                <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <h3 className="text-base font-extrabold text-slate-855 dark:text-slate-100 border-b pb-3">Edit Profile Details</h3>
                  
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
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Highest Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={tutorProfile.qualification || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-3 px-4 text-sm focus:outline-none"
                      />
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

              {/* TAB 3: SETTINGS */}
              {activeTab === 'Settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Password Form */}
                  <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold text-slate-855 dark:text-slate-100 border-b pb-3 flex items-center gap-2">
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
