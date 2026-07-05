import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';

const RegisterStudent = () => {
  const [step, setStep] = useState(1);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  // Validate step 1
  const handleNextStep = () => {
    if (!firstName.trim()) {
      setErrorMsg('Please enter your first name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    // Simple phone format checking (e.g. 10 digits)
    const phoneRegex = /^[0-9]{10,12}$/;
    if (!phoneRegex.test(phone.replace(/[\s-+()]/g, ''))) {
      setErrorMsg('Please enter a valid phone number (10-12 digits).');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password || !confirmPassword) {
      setErrorMsg('Please fill in all details.');
      return;
    }
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      await registerStudent({
        name: firstName,
        phone,
        email,
        password
      });
      setSuccessMsg('Registration successful! Welcome to TutorConnect.');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Student Registration"
        description="Sign up as a student on TutorConnect to browse and book tutoring classes with verified tutors."
      />

      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 dark:bg-blue-500/5" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 dark:bg-amber-500/5" />

        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl glass relative">
          
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create Student Account
            </h2>
            <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 font-medium">
              Join TutorConnect to find your perfect tutor today
            </p>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-colors duration-200 ${step === 1 ? 'bg-primary text-white' : 'bg-emerald-500 text-white'}`}>
              {step > 1 ? <FaCheck className="w-3.5 h-3.5" /> : '1'}
            </div>
            <div className={`h-1 w-16 rounded transition-colors duration-200 ${step > 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-colors duration-200 ${step === 2 ? 'bg-primary text-white' : 'bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              2
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-xs font-semibold text-rose-650 dark:text-rose-400 flex items-center gap-3"
            >
              <span className="text-sm"><FaExclamationTriangle className="h-4 w-4 shrink-0 text-rose-500" /></span>
              <p>{errorMsg}</p>
            </motion.div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 text-xs font-semibold text-emerald-650 dark:text-emerald-400 flex items-center gap-3"
            >
              <span><FaCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" /></span>
              <p>{successMsg}</p>
            </motion.div>
          )}

          {/* Wizard Steps */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    First Name
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400"><FaUser className="h-4 w-4" /></span>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400"><FaPhone className="h-4 w-4" /></span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition duration-200"
                  >
                    Next Step <FaArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 mb-2 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-slate-400"><FaEnvelope className="h-4 w-4" /></span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-350 mb-2 uppercase tracking-wider">
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
                        className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-350 mb-2 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-slate-400"><FaLock className="h-4 w-4" /></span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-850 transition focus:outline-none cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FaArrowLeft className="h-3 w-3" /> Back
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="w-2/3 py-4 text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-none cursor-pointer"
                    >
                      Register & Login
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-bold dark:text-blue-400 focus:outline-none cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default RegisterStudent;
