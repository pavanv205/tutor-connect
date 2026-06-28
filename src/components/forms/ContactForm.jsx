import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaUser, FaEnvelope, FaComments, FaArrowRight } from 'react-icons/fa';
import { generalService } from '../../services/generalService';
import Button from '../common/Button';

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required('Your name is required').min(3, 'Name must be at least 3 characters'),
  email: yup.string().required('Email address is required').email('Please enter a valid email address'),
  message: yup.string().required('Please enter your message').min(15, 'Message must be at least 15 characters').max(500, 'Message cannot exceed 500 characters')
});

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await generalService.submitContact({
        ...data,
        queryType: 'General Inquiry'
      });
      if (response.success) {
        setSuccessMsg(response.message);
        reset();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Message Sent!
        </h4>
        <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed mb-6">
          {successMsg}
        </p>
        <Button variant="outline" size="sm" onClick={() => setSuccessMsg('')}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
          Full Name
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400">
            <FaUser className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Your Name"
            {...register('name')}
            className={`w-full bg-slate-50 dark:bg-slate-800/60 border ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary'
            } text-slate-850 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200`}
          />
        </div>
        {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
          Email Address
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400">
            <FaEnvelope className="h-4 w-4" />
          </span>
          <input
            type="email"
            placeholder="Your Email"
            {...register('email')}
            className={`w-full bg-slate-50 dark:bg-slate-800/60 border ${
              errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary'
            } text-slate-850 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200`}
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
      </div>



      {/* Message */}
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
          Message
        </label>
        <div className="relative flex items-start">
          <span className="absolute left-4 top-3.5 text-slate-400">
            <FaComments className="h-4 w-4" />
          </span>
          <textarea
            rows="5"
            placeholder="Type your message here..."
            {...register('message')}
            className={`w-full bg-slate-50 dark:bg-slate-800/60 border ${
              errors.message ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary'
            } text-slate-850 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200`}
          />
        </div>
        {errors.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.message.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full py-3.5 text-sm font-semibold gap-2"
        loading={loading}
        icon={<FaArrowRight className="text-xs" />}
        iconPosition="right"
      >
        Send Message
      </Button>
    </form>
  );
};

export default ContactForm;
