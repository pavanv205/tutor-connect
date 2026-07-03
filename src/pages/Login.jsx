import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUserShield, FaChalkboardTeacher, FaEye, FaEyeSlash, FaUndo, FaGraduationCap, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import Modal from '../components/common/Modal';
import api from '../services/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState('Tutor'); // 'Tutor' or 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [forgotPasswordStep, setForgotPasswordStep] = useState('login'); // 'login' | 'request' | 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showUserNotFoundModal, setShowUserNotFoundModal] = useState(false);
  const [showIncorrectPasswordModal, setShowIncorrectPasswordModal] = useState(false);
  
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRoleQuery = new URLSearchParams(location.search).has('role');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingLocal(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || 'OTP sent successfully!');
        setForgotPasswordStep('reset');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send OTP. Please make sure the email is registered.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all the fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingLocal(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        otp,
        newPassword
      });
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || 'Password updated successfully!');
        // Pre-fill the login email with the reset email
        setEmail(resetEmail);
        // Clear reset states
        setResetEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        // Switch back to login step after a brief delay
        setTimeout(() => {
          setForgotPasswordStep('login');
          setSuccessMsg('You can now log in with your new password.');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to reset password. Please verify the OTP.');
    } finally {
      setLoadingLocal(false);
    }
  };

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (role === 'Admin') {
        navigate(from || '/admin/dashboard', { replace: true });
      } else if (role === 'Tutor') {
        navigate(from || '/tutor/dashboard', { replace: true });
      } else if (role === 'Student') {
        navigate(from || '/student/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, location]);

  // Parse query parameters to set the default active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'student') {
      setActiveTab('Student');
      setErrorMsg('');
    } else if (roleParam === 'teacher' || roleParam === 'tutor') {
      setActiveTab('Tutor');
      setErrorMsg('');
    } else if (roleParam === 'admin') {
      setActiveTab('Admin');
      setErrorMsg('');
    }
  }, [location.search]);

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
      const errMsg = err.message || '';
      if (errMsg.includes('Please create an account')) {
        setShowUserNotFoundModal(true);
      } else if (errMsg.includes('Incorrect username or password')) {
        setShowIncorrectPasswordModal(true);
      } else {
        setErrorMsg(errMsg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleQuickFill = (roleType) => {
    if (roleType === 'Admin') {
      setEmail('admin@tutorconnect.com');
      setPassword('adminpassword123');
      setActiveTab('Admin');
    } else if (roleType === 'Student') {
      setEmail('student@tutorconnect.com');
      setPassword('student123');
      setActiveTab('Student');
    } else {
      setEmail('tutor@tutorconnect.com');
      setPassword('tutor123');
      setActiveTab('Tutor');
    }
  };

  return (
    <>
      <SEO
        title={`${activeTab === 'Tutor' ? 'Teacher' : activeTab} Login`}
        description="Access the secure Tutor Connect portal to manage classes, tutor profile, and settings."
        keywords="login, teacher login, admin portal, tutor connect auth"
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
              {forgotPasswordStep === 'login' && 'Welcome back'}
              {forgotPasswordStep === 'request' && 'Forgot Password'}
              {forgotPasswordStep === 'reset' && 'Reset Password'}
            </h2>
            <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 font-medium">
              {forgotPasswordStep === 'login' && 'Sign in to manage your Tutor Connect account'}
              {forgotPasswordStep === 'request' && 'Enter your email to receive a password reset OTP'}
              {forgotPasswordStep === 'reset' && 'Enter the OTP sent to your email and set your new password'}
            </p>
          </div>

          {/* Role Tabs */}
          {forgotPasswordStep === 'login' && (
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
              {(!hasRoleQuery || activeTab === 'Tutor') && (
                <button
                  onClick={() => {
                    setActiveTab('Tutor');
                    setErrorMsg('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'Tutor'
                      ? 'bg-white text-primary shadow-md dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  } ${hasRoleQuery ? 'w-full flex-none cursor-default' : ''}`}
                  disabled={hasRoleQuery}
                >
                  <FaChalkboardTeacher className="h-4 w-4" />
                  Teacher Login
                </button>
              )}
              {(!hasRoleQuery || activeTab === 'Student') && (
                <button
                  onClick={() => {
                    setActiveTab('Student');
                    setErrorMsg('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'Student'
                      ? 'bg-white text-primary shadow-md dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  } ${hasRoleQuery ? 'w-full flex-none cursor-default' : ''}`}
                  disabled={hasRoleQuery}
                >
                  <FaGraduationCap className="h-4 w-4" />
                  Student Login
                </button>
              )}
              {(!hasRoleQuery || activeTab === 'Admin') && (
                <button
                  onClick={() => {
                    setActiveTab('Admin');
                    setErrorMsg('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'Admin'
                      ? 'bg-white text-primary shadow-md dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  } ${hasRoleQuery ? 'w-full flex-none cursor-default' : ''}`}
                  disabled={hasRoleQuery}
                >
                  <FaUserShield className="h-4 w-4" />
                  Admin Login
                </button>
              )}
            </div>
          )}

          {/* Success messages */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 text-xs font-semibold text-emerald-650 dark:text-emerald-400 flex items-center gap-3"
            >
              <span>✓</span>
              <p>{successMsg}</p>
            </motion.div>
          )}

          {/* Error messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-xs font-semibold text-rose-650 dark:text-rose-450 flex items-center gap-3"
            >
              <FaExclamationTriangle className="h-4 w-4 shrink-0 text-rose-500" />
              <p>{errorMsg}</p>
            </motion.div>
          )}

          {/* Form */}
          {forgotPasswordStep === 'login' && (
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
                      placeholder={activeTab === 'Admin' ? 'admin@tutorconnect.com' : activeTab === 'Student' ? 'student@example.com' : 'tutor@example.com'}
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
                      className="absolute right-4 text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {(activeTab === 'Tutor' || activeTab === 'Student') && (
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordStep('request');
                          setErrorMsg('');
                          setSuccessMsg('');
                          setResetEmail(email); // Autofill reset with whatever is typed
                        }}
                        className="text-xs font-extrabold text-primary hover:underline dark:text-blue-450 focus:outline-none cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
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
          )}

          {forgotPasswordStep === 'request' && (
            <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-2 uppercase tracking-wider">
                    Registered Email Address
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400"><FaEnvelope className="h-4 w-4" /></span>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="tutor@example.com"
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-805 dark:text-slate-205 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-none"
                  loading={loadingLocal}
                >
                  Send Reset OTP
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordStep('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-550 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition focus:outline-none cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {forgotPasswordStep === 'reset' && (
            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
              <div className="space-y-4">
                {/* OTP */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                    6-Digit OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-205 rounded-2xl py-3.5 px-4 text-sm text-center font-extrabold tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-2 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400"><FaLock className="h-4 w-4" /></span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-2 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400"><FaLock className="h-4 w-4" /></span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-none"
                  loading={loadingLocal}
                >
                  Reset Password
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordStep('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-550 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition focus:outline-none cursor-pointer"
                >
                  Cancel & Login
                </button>
              </div>
            </form>
          )}

          {/* Quick Helper Links / Accounts Seeding */}
          {forgotPasswordStep === 'login' && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
                Testing helper credentials
              </h4>
              <div className={`grid ${hasRoleQuery ? 'grid-cols-1' : 'grid-cols-3'} gap-2`}>
                {(!hasRoleQuery || activeTab === 'Tutor') && (
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Tutor')}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 p-2 rounded-xl text-left focus:outline-none cursor-pointer"
                  >
                    <p className="text-[9px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-0.5 text-center">Teacher</p>
                    <p className="text-[8px] text-slate-450 dark:text-slate-500 font-semibold truncate text-center">tutor@tutorconnect.com</p>
                  </button>
                )}
                {(!hasRoleQuery || activeTab === 'Student') && (
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Student')}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 p-2 rounded-xl text-left focus:outline-none cursor-pointer"
                  >
                    <p className="text-[9px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-0.5 text-center">Student</p>
                    <p className="text-[8px] text-slate-450 dark:text-slate-500 font-semibold truncate text-center">student@tutorconnect.com</p>
                  </button>
                )}
                {(!hasRoleQuery || activeTab === 'Admin') && (
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Admin')}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 p-2 rounded-xl text-left focus:outline-none cursor-pointer"
                  >
                    <p className="text-[9px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-0.5 text-center">Admin</p>
                    <p className="text-[8px] text-slate-450 dark:text-slate-500 font-semibold truncate text-center">admin@tutorconnect.com</p>
                  </button>
                )}
              </div>
              
              {activeTab === 'Tutor' && (
                <p className="text-[11px] text-slate-550 dark:text-slate-400 text-center font-medium">
                  Don't have a tutor account?{' '}
                  <button
                    onClick={() => navigate('/become-tutor')}
                    className="text-primary hover:underline font-bold dark:text-blue-400 focus:outline-none cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              )}
              {activeTab === 'Student' && (
                <p className="text-[11px] text-slate-550 dark:text-slate-400 text-center font-medium">
                  Don't have a student account?{' '}
                  <button
                    onClick={() => navigate('/register-student')}
                    className="text-primary hover:underline font-bold dark:text-blue-400 focus:outline-none cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Login Failed Modal: User Not Found */}
      <Modal
        isOpen={showUserNotFoundModal}
        onClose={() => setShowUserNotFoundModal(false)}
        title="Login Failed"
        size="sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-450 mb-4 animate-bounce">
            <FaExclamationTriangle className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            Wrong username or password
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">
            Create an account
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setShowUserNotFoundModal(false);
                if (activeTab === 'Student') {
                  navigate('/register-student');
                } else {
                  navigate('/become-tutor');
                }
              }}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl text-[11px] shadow-md cursor-pointer transition-colors"
            >
              Create an account
            </button>
            <button
              onClick={() => {
                setShowUserNotFoundModal(false);
                setForgotPasswordStep('request');
                setErrorMsg('');
                setSuccessMsg('');
                setResetEmail(email);
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl text-[11px] cursor-pointer transition-colors"
            >
              Forget password
            </button>
          </div>
        </div>
      </Modal>

      {/* Login Failed Modal: Incorrect Password */}
      <Modal
        isOpen={showIncorrectPasswordModal}
        onClose={() => setShowIncorrectPasswordModal(false)}
        title="Login Failed"
        size="sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
            <FaExclamationTriangle className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">
            Incorrect username or password.
          </p>
          <button
            onClick={() => setShowIncorrectPasswordModal(false)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md cursor-pointer transition-colors"
          >
            Try Again
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Login;
