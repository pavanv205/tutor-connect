import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUserShield, FaChalkboardTeacher, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';

const Login = () => {
  const [activeTab, setActiveTab] = useState('Tutor'); // 'Tutor' or 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (role === 'Admin') {
        navigate(from || '/admin/dashboard', { replace: true });
      } else if (role === 'Tutor') {
        navigate(from || '/tutor/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setLoadingLocal(true);

    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleQuickFill = (roleType) => {
    if (roleType === 'Admin') {
      setEmail('admin@tutorconnect.com');
      setPassword('adminpassword123');
      setActiveTab('Admin');
    } else {
      setEmail('tutor_demo@tutorconnect.com');
      setPassword('tutor123');
      setActiveTab('Tutor');
    }
  };

  return (
    <>
      <SEO
        title={`${activeTab} Login`}
        description="Access the secure Tutor Connect portal to manage classes, leads, tutor profile, and trial requests."
        keywords="login, tutor login, admin portal, tutor connect auth"
      />

      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 dark:bg-blue-500/5" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 dark:bg-amber-500/5" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl glass"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 font-medium">
              Sign in to manage your Tutor Connect account
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('Tutor');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'Tutor'
                  ? 'bg-white text-primary shadow-md dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FaChalkboardTeacher className="h-4 w-4" />
              Tutor Login
            </button>
            <button
              onClick={() => {
                setActiveTab('Admin');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'Admin'
                  ? 'bg-white text-primary shadow-md dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FaUserShield className="h-4 w-4" />
              Admin Login
            </button>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 text-xs font-semibold text-red-650 dark:text-red-400 flex items-center gap-3"
            >
              <span>⚠️</span>
              <p>{errorMsg}</p>
            </motion.div>
          )}

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaEnvelope className="h-4 w-4" /></span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'Admin' ? 'admin@tutorconnect.com' : 'tutor@example.com'}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaLock className="h-4 w-4" /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-650 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-4 text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-none"
                loading={loadingLocal}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Quick Helper Links / Accounts Seeding */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
              Testing helper credentials
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('Tutor')}
                className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 p-2.5 rounded-xl text-left focus:outline-none"
              >
                <p className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-0.5">Tutor Login</p>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold truncate">tutor_demo@tutorconnect.com</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Admin')}
                className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 p-2.5 rounded-xl text-left focus:outline-none"
              >
                <p className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-0.5">Admin Login</p>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold truncate">admin@tutorconnect.com</p>
              </button>
            </div>
            
            {activeTab === 'Tutor' && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
                Don't have a tutor account?{' '}
                <button
                  onClick={() => navigate('/become-tutor')}
                  className="text-primary hover:underline font-bold dark:text-blue-400 focus:outline-none"
                >
                  Register here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
