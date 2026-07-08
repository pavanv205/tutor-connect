import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCreditCard, FaLock, FaExclamationTriangle, FaCheck, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import api from '../services/api';

const SubscriptionExpired = () => {
  const { user, renewSubscription, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if NOT expired
  const isExpired = user && user.role === 'Tutor' && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date();
  if (!isExpired) {
    // If not expired, redirect to their home dashboard
    if (user?.role === 'Tutor') {
      return <Navigate to="/tutor/dashboard" replace />;
    } else if (user?.role === 'Student') {
      return <Navigate to="/student/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRenew = async () => {
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

      // Create Razorpay Order on the server
      const orderRes = await api.post('/payments/create-order');
      if (!orderRes.data || !orderRes.data.success) {
        throw new Error(orderRes.data?.message || 'Failed to initialize order with payment gateway.');
      }
      const orderData = orderRes.data.data;
      const isMock = orderRes.data.isMock;

      // 2. Initialize Options
      const options = {
        key: 'rzp_test_tutorconnectkey', // Fallback key
        amount: orderData.amount, // ₹29.00 in paise
        currency: orderData.currency,
        name: 'TutorConnect',
        description: `${user.role} Subscription Renewal`,
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        order_id: isMock ? undefined : orderData.id,
        handler: async function (response) {
          try {
            setLoading(true);
            const razorpayPaymentId = response.razorpay_payment_id;
            const razorpayOrderId = response.razorpay_order_id || orderData.id;
            const razorpaySignature = response.razorpay_signature || 'mock_signature';

            console.log('Renewal Payment Successful. Payment ID:', razorpayPaymentId);

            await renewSubscription({
              paymentId: razorpayPaymentId,
              paymentStatus: 'Paid',
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              razorpay_signature: razorpaySignature
            });

            setSuccessMsg('Subscription renewed successfully! Restoring access...');
            setTimeout(() => {
              if (user.role === 'Tutor') {
                navigate('/tutor/dashboard');
              } else {
                navigate('/student/dashboard');
              }
            }, 1500);
          } catch (error) {
            console.error(error);
            setErrorMsg(error.message || 'Renewal failed. Please try again.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#3B82F6' // Primary theme blue
        },
        modal: {
          ondismiss: function() {
            setErrorMsg('Payment cancelled. You must complete the ₹29 payment to renew your subscription.');
            setLoading(false);
          }
        }
      };

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_tutorconnectkey';
      if (razorpayKey === 'rzp_test_tutorconnectkey' || isMock) {
        const simulateSuccess = window.confirm(
          "TutorConnect Demo: Razorpay sandbox key is not configured.\n\nWould you like to simulate a successful Razorpay renewal payment of ₹29?"
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
      setErrorMsg(error.message || 'Renewal failed. Please try again.');
      setLoading(false);
    }
  };

  const formattedExpiry = user.subscriptionExpiresAt 
    ? new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'N/A';

  return (
    <>
      <SEO
        title="Subscription Expired"
        description="Your TutorConnect subscription has expired. Please renew your subscription plan to continue accessing services."
      />

      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative blur elements */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 dark:bg-blue-500/5" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -z-10 dark:bg-rose-500/5" />

        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl glass relative text-center">
          
          {/* Locked Icon Animation */}
          <div className="mx-auto h-20 w-20 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-450 rounded-full flex items-center justify-center shadow-inner animate-pulse">
            <FaLock className="h-9 w-9" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Subscription Expired
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              Your 6-month TutorConnect subscription expired on <strong className="text-rose-600 dark:text-rose-400">{formattedExpiry}</strong>.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-xs font-semibold text-rose-650 dark:text-rose-400 flex items-center gap-3 text-left"
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
              className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 text-xs font-semibold text-emerald-650 dark:text-emerald-400 flex items-center gap-3 text-left"
            >
              <span><FaCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" /></span>
              <p>{successMsg}</p>
            </motion.div>
          )}

          {/* Offer Details */}
          <div className="border border-primary bg-primary/5 dark:border-blue-500 dark:bg-blue-950/10 rounded-2xl p-5 flex items-center justify-between transition-all duration-200">
            <div className="flex items-center gap-3.5 text-left">
              <div className="h-5 w-5 rounded-full border-2 border-primary dark:border-blue-500 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary dark:bg-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">6-Month Renewal</h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Full tutor & student connections</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Renewal Fee</span>
              <span className="text-lg font-extrabold text-primary dark:text-blue-400">₹29</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Button
              onClick={handleRenew}
              variant="primary"
              loading={loading}
              className="w-full py-4 text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-none cursor-pointer"
            >
              Renew Subscription Now
            </Button>

            <button
              onClick={logout}
              className="w-full py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FaSignOutAlt className="h-3 w-3" /> Log Out
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default SubscriptionExpired;
