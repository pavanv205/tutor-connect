import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCheck, FaExclamationTriangle, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import api from '../services/api';

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
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
      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setErrorMsg('Failed to load payment gateway. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Create Razorpay Order on the server
      const orderRes = await api.post('/payments/create-order');
      if (!orderRes.data || !orderRes.data.success) {
        throw new Error(orderRes.data?.message || 'Failed to initialize order with payment gateway.');
      }
      const orderData = orderRes.data.data;
      const isMock = orderRes.data.isMock;

      // 3. Initialize Razorpay Options
      const options = {
        key: 'rzp_test_hometutorxkey', // Fallback key
        amount: orderData.amount, // ₹1.00 in paise
        currency: orderData.currency,
        name: 'HomeTutorX',
        description: 'Student Registration Fee',
        order_id: isMock ? undefined : orderData.id,
        handler: async function (response) {
          try {
            setLoading(true);
            const razorpayPaymentId = response.razorpay_payment_id;
            const razorpayOrderId = response.razorpay_order_id || orderData.id;
            const razorpaySignature = response.razorpay_signature || 'mock_signature';

            console.log('Student Payment Successful. Payment ID:', razorpayPaymentId);

            await registerStudent({
              name: firstName,
              phone,
              email,
              password,
              paymentStatus: 'Paid',
              paymentId: razorpayPaymentId,
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              razorpay_signature: razorpaySignature
            });

            setSuccessMsg('Registration successful! Welcome to HomeTutorX.');
            setTimeout(() => {
              navigate('/student/dashboard');
            }, 1500);
          } catch (error) {
            console.error(error);
            setErrorMsg(error.message || 'Registration failed. Please try again.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: firstName,
          email: email,
          contact: phone
        },
        theme: {
          color: '#3B82F6' // Primary theme blue
        },
        modal: {
          ondismiss: function() {
            setErrorMsg('Payment was cancelled. You must complete the ₹1 payment to create your account.');
            setLoading(false);
          }
        }
      };

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_hometutorxkey';
      if (razorpayKey === 'rzp_test_hometutorxkey' || isMock) {
        const simulateSuccess = window.confirm(
          "HomeTutorX Demo: Razorpay sandbox key is not configured.\n\nWould you like to simulate a successful Razorpay payment of ₹1 for this student registration?"
        );
        if (simulateSuccess) {
          const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
          options.handler({ 
            razorpay_payment_id: mockPaymentId,
            razorpay_order_id: orderData.id,
            razorpay_signature: 'mock_signature'
          });
        } else {
          options.modal.ondismiss();
        }
      } else {
        const rzp1 = new window.Razorpay({ ...options, key: razorpayKey });
        rzp1.open();
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Student Registration"
        description="Sign up as a student on HomeTutorX to browse and book tutoring classes with verified tutors."
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
              Join HomeTutorX to find your perfect tutor today
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
                  {/* Payment Method Option */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      Select Payment Method
                    </label>
                    <div className="border border-primary bg-primary/5 dark:border-blue-500 dark:bg-blue-950/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200">
                      <div className="flex items-center gap-3.5">
                        <div className="h-5 w-5 rounded-full border-2 border-primary dark:border-blue-500 flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary dark:bg-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">UPI, Cards, Netbanking, Wallets</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-semibold block">Application Fee</span>
                        <span className="text-base font-extrabold text-primary dark:text-blue-400">₹1</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Verification Notice */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 mt-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-900 shadow-md flex items-center justify-center text-white relative overflow-hidden shrink-0">
                      <svg width="0" height="0" className="absolute">
                        <linearGradient id="card-gradient-student" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#d4af37" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#fffbdf" />
                        </linearGradient>
                      </svg>
                      <FaCreditCard style={{ fill: "url(#card-gradient-student)" }} className="h-5 w-5 filter drop-shadow-[0_1px_3px_rgba(212,175,55,0.4)]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Verification Application Fee</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-normal">
                        HomeTutorX charges a one-time profile verification fee of <strong className="text-amber-600 dark:text-amber-500 font-extrabold">₹1</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
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
