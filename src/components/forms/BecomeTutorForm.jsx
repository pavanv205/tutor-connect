import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaBook, FaUpload, FaSearch } from 'react-icons/fa';
import { SUBJECTS, CLASSES, CITIES, STATES, STATE_CITIES } from '../../constants';
import { tutorService } from '../../services/tutorService';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import api from '../../services/api';
import { compressImage } from '../../utils/imageCompression';

// Global schema for full validation
const validationSchema = yup.object().shape({
  // Step 1
  name: yup.string().required('Full name is required').min(3, 'Name must be at least 3 characters'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  gender: yup.string().required('Gender is required'),
  age: yup.number().typeError('Age must be a valid number').required('Age is required').min(18, 'Must be at least 18').max(100, 'Invalid age'),
  phone: yup.string().required('Phone number is required').matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit number'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  bio: yup.string().required('About section is required'),
  
  // Step 2
  degree: yup.string().required('Highest qualification is required'),
  institution: yup.string().required('College / University name is required'),
  passingYear: yup.number().typeError('Passing year must be a number').required('Passing year is required').min(1980, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future'),
  experienceYears: yup.number().typeError('Experience must be a number').required('Experience is required').min(0, 'Cannot be negative').max(50, 'Invalid experience'),

  // Step 3
  subjects: yup.array().min(1, 'Select at least one subject to teach'),
  classes: yup.array().min(1, 'Select at least one class grade'),
  teachingMode: yup.string().required('Please select preferred teaching mode'),
  hourlyRate: yup.number()
    .typeError('Hourly rate must be a number')
    .required('Hourly rate is required')
    .min(100, 'Minimum hourly charge is 100')
    .max(500, 'Maximum hourly charge is 500'),
  monthlyRate: yup.number()
    .typeError('Monthly charge must be a number')
    .required('Monthly charge is required')
    .min(500, 'Minimum monthly charge is 500')
    .max(15000, 'Maximum monthly charge is 15000'),

  // Step 4
  streetAddress: yup.string()
    .required('Street address is required'),
  pincode: yup.string().required('Postal code is required').matches(/^\d{6}$/, 'Must be a valid 6-digit pin code'),
  referralCode: yup.string().optional()
});

const STEPS = [
  { title: 'Personal Details', icon: <FaUser /> },
  { title: 'Education & Exp', icon: <FaGraduationCap /> },
  { title: 'Teaching Prefs', icon: <FaBook /> },
  { title: 'Location & Profile', icon: <FaUpload /> }
];

const BecomeTutorForm = () => {
  const { registerTutor: registerTutorAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateError, setCertificateError] = useState('');
  // New state for certificate preview & size (for images)
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState(null);
  const [certificateOriginalSize, setCertificateOriginalSize] = useState(null);
  const [certificateCompressionLoading, setCertificateCompressionLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressionLoading, setCompressionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    getValues,
    setValue,
    setError,
    watch
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      gender: '',
      age: '',
      phone: '',
      state: '',
      city: '',
      bio: '',
      degree: '',
      institution: '',
      passingYear: '',
      experienceYears: '',
      subjects: [],
      classes: [],
      teachingMode: 'Both',
      hourlyRate: '',
      monthlyRate: '',
      streetAddress: '',
      pincode: '',
      referralCode: '',
      lat: '',
      lng: ''
    }
  });

  // Watch fields for rendering checkbox states
  const watchedSubjects = watch('subjects');
  const watchedClasses = watch('classes');
  const watchedTeachingMode = watch('teachingMode');
  const watchedLat = watch('lat');
  const watchedLng = watch('lng');
  const hasFetchedLoc = !!watchedLat;
  const watchedState = watch('state');
  const watchedCity = watch('city');

  useEffect(() => {
    if (watchedState) {
      setValue('city', '');
    }
  }, [watchedState, setValue]);

  // Cleanup object URLs for both profile and certificate previews when component unmounts or files change
  useEffect(() => {
    return () => {
      if (compressedPreviewUrl) URL.revokeObjectURL(compressedPreviewUrl);
      if (certificatePreviewUrl) URL.revokeObjectURL(certificatePreviewUrl);
    };
  }, []);

  const citiesForSelectedState = watchedState ? (STATE_CITIES[watchedState] || []) : [];

  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');

  const filteredStates = STATES.filter(s =>
    s.toLowerCase().includes(stateSearchQuery.toLowerCase())
  );

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const sortedCities = React.useMemo(() => {
    const allStateCities = STATE_CITIES[watchedState] || [];
    if (!citySearchQuery.trim()) {
      return allStateCities;
    }
    const query = citySearchQuery.toLowerCase();
    const matches = allStateCities.filter(c => c.toLowerCase().includes(query));
    const nonMatches = allStateCities.filter(c => !c.toLowerCase().includes(query));
    
    // Sort matches so that cities starting with the query appear first
    matches.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(query);
      const bStarts = b.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });
    
    return [...matches, ...nonMatches];
  }, [watchedState, citySearchQuery]);

  const handleFetchLiveLocation = () => {
    const confirmLocation = window.confirm("Use only at your home location. Do you want to continue?");
    if (!confirmLocation) {
      return;
    }

    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }

    setLocLoading(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('lat', position.coords.latitude, { shouldValidate: true });
        setValue('lng', position.coords.longitude, { shouldValidate: true });
        setLocLoading(false);
      },
      (error) => {
        console.error('Error fetching geolocation:', error);
        setLocError('Location permission denied or timed out.');
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleNext = async () => {
    // Validate fields belonging to the current step
    let fieldsToValidate = [];
    if (currentStep === 0) {
      fieldsToValidate = ['name', 'email', 'password', 'gender', 'age', 'phone', 'streetAddress', 'state', 'city', 'bio'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['degree', 'institution', 'passingYear', 'experienceYears'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['subjects', 'classes', 'teachingMode', 'hourlyRate', 'monthlyRate'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      if (currentStep === 0) {
        try {
          setLoading(true);
          setSubmitError('');
          const emailVal = getValues('email');
          const res = await api.post('/auth/check-email', { email: emailVal });
          if (res.data && res.data.success && res.data.exists) {
            setError('email', { type: 'manual', message: 'Email already registered' });
            return;
          }
        } catch (err) {
          console.error('Email check failed:', err);
        } finally {
          setLoading(false);
        }
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const filename = file.name.toLowerCase();
      
      // 1. Reject invalid temporary files
      if (filename.includes('.trashed-') || filename.startsWith('.trashed-')) {
        setResumeError('Invalid file type: temporary trashed files are not allowed');
        setResumeFile(null);
        setCompressedPreviewUrl(null);
        setOriginalSize(null);
        return;
      }
      
      // 2. Validate types
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
      const hasAllowedExt = allowedExts.some(ext => filename.endsWith(ext));
      const isAllowedType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      
        // Validate file type
        if (!isAllowedType && !hasAllowedExt) {
          setResumeError('Only image files (JPEG, PNG, WEBP) are allowed');
          setResumeFile(null);
          setCompressedPreviewUrl(null);
          setOriginalSize(null);
          return;
        }
        // Proceed with compression for any size (no 2MB restriction)
        setResumeError('');
        try {
          setCompressionLoading(true);
          const result = await compressImage(file, 500 * 1024);
          setResumeFile(result.file);
          setCompressedPreviewUrl(result.previewUrl);
          setOriginalSize(result.originalSize);
        } catch (err) {
          console.error('Image compression failed:', err);
          // Fallback to original
          setResumeFile(file);
          setCompressedPreviewUrl(URL.createObjectURL(file));
          setOriginalSize(file.size);
        } finally {
          setCompressionLoading(false);
        }
        return;
    }
  };

  const handleCertificateChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filename = file.name.toLowerCase();

    // 1. Reject invalid temporary files
    if (filename.includes('.trashed-') || filename.startsWith('.trashed-')) {
      setCertificateError('Invalid file type: temporary trashed files are not allowed');
      setCertificateFile(null);
      setCertificatePreviewUrl(null);
      setCertificateOriginalSize(null);
      return;
    }

    // 2. Validate allowed extensions & MIME types
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const hasAllowedExt = allowedExts.some(ext => filename.endsWith(ext));
    const isAllowedType = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type);

    if (!isAllowedType && !hasAllowedExt) {
      setCertificateError('Only image files (JPEG, PNG, WEBP) or PDFs are allowed');
      setCertificateFile(null);
      setCertificatePreviewUrl(null);
      setCertificateOriginalSize(null);
      return;
    }

    // Reset any previous error
    setCertificateError('');

    // 3. If the file is an image, compress it like the profile photo
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isImage = imageMimeTypes.includes(file.type) || 
                    ['.jpg', '.jpeg', '.png', '.webp'].some(ext => filename.endsWith(ext));

    if (isImage) {
      try {
        setCertificateCompressionLoading(true);
        const result = await compressImage(file, 500 * 1024); // target 500KB
        setCertificateFile(result.file);
        setCertificatePreviewUrl(result.previewUrl);
        setCertificateOriginalSize(result.originalSize);
      } catch (err) {
        console.error('Certificate image compression failed:', err);
        // Fallback to original image
        setCertificateFile(file);
        setCertificatePreviewUrl(URL.createObjectURL(file));
        setCertificateOriginalSize(file.size);
      } finally {
        setCertificateCompressionLoading(false);
      }
    } else {
      // It's a PDF – no compression needed
      setCertificateFile(file);
      setCertificatePreviewUrl(null);
      setCertificateOriginalSize(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setSubmitError('');
      const formData = new FormData();
      // Append primitive fields
      for (const key of Object.keys(data)) {
        const val = data[key];
        if (Array.isArray(val)) {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, val ?? '');
        }
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      if (certificateFile) {
        formData.append('certificate', certificateFile);
      }

      const response = await registerTutorAuth(formData);
      if (response) {
        setSuccessMsg('Application Submitted! We have created your tutor account. You can log in using your credentials after admin review.');
      }
    } catch (error) {
      console.error(error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject) => {
    const current = getValues('subjects') || [];
    if (current.includes(subject)) {
      setValue('subjects', current.filter((s) => s !== subject), { shouldValidate: true });
    } else {
      setValue('subjects', [...current, subject], { shouldValidate: true });
    }
  };

  const toggleClass = (cls) => {
    const current = getValues('classes') || [];
    if (current.includes(cls)) {
      setValue('classes', current.filter((c) => c !== cls), { shouldValidate: true });
    } else {
      setValue('classes', [...current, cls], { shouldValidate: true });
    }
  };

  if (successMsg) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto shadow-xl">
        <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Application Submitted!
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {successMsg}
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/'}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
      {/* Progress Steps Header */}
      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          {/* Progress bar background line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
          {/* Active progress bar line */}
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary dark:bg-blue-500 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center z-10 relative">
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                  idx < currentStep
                    ? 'bg-primary border-primary text-white'
                    : idx === currentStep
                    ? 'bg-white border-primary text-primary dark:bg-slate-900 dark:text-blue-400 dark:border-blue-400 ring-4 ring-primary/10'
                    : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                {idx < currentStep ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`text-xs font-semibold mt-2 hidden sm:block ${
                  idx === currentStep ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Personal Details */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <h4 className="text-lg font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaUser className="h-4 w-4" /></span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Gender
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaUser className="h-4 w-4" /></span>
                  <select
                    {...register('gender')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.gender.message}</p>}
              </div>
              
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Age
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaUser className="h-4 w-4" /></span>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    {...register('age')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.age && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.age.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaPhone className="h-4 w-4" /></span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    {...register('phone')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400">✉</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400">🔒</span>
                  <input
                    type="password"
                    placeholder="Create a password (min 6 chars)"
                    {...register('password')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-1.5 uppercase tracking-wide">
                  Preferred State
                </label>
                <input type="hidden" {...register('state')} />
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaMapMarkerAlt className="h-4 w-4" /></span>
                  <button
                    type="button"
                    onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-left focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 flex items-center justify-between"
                  >
                    <span className={watchedState ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                      {watchedState || 'Select State'}
                    </span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </button>

                  {isStateDropdownOpen && (
                    <>
                      {/* Backdrop overlay */}
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsStateDropdownOpen(false);
                          setStateSearchQuery('');
                        }}
                      />
                      
                      {/* Search box & options dropdown */}
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 flex flex-col gap-2 max-h-72">
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-slate-400 text-xs"><FaSearch className="absolute left-3 text-slate-400 text-xs pointer-events-none" /></span>
                          <input
                            type="text"
                            value={stateSearchQuery}
                            onChange={(e) => setStateSearchQuery(e.target.value)}
                            placeholder="Search state..."
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                          />
                        </div>
                        
                        <div className="overflow-y-auto flex-1 space-y-0.5 max-h-48 pr-1 custom-scrollbar">
                          {filteredStates.length === 0 ? (
                            <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-4">No states found</p>
                          ) : (
                            filteredStates.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setValue('state', s, { shouldValidate: true });
                                  setIsStateDropdownOpen(false);
                                  setStateSearchQuery('');
                                }}
                                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                  watchedState === s
                                    ? 'bg-primary text-white dark:bg-blue-500'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                                }`}
                              >
                                {s}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {errors.state && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.state.message}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-550 mb-1.5 uppercase tracking-wide">
                  Preferred Division
                </label>
                <input type="hidden" {...register('city')} />
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaMapMarkerAlt className="h-4 w-4" /></span>
                  <button
                    type="button"
                    disabled={!watchedState}
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-left focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className={watchedCity ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                      {watchedCity || (watchedState ? 'Select Division' : 'Select state first')}
                    </span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </button>

                  {isCityDropdownOpen && watchedState && (
                    <>
                      {/* Backdrop overlay */}
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCityDropdownOpen(false);
                          setCitySearchQuery('');
                        }}
                      />
                      
                      {/* Search box & options dropdown */}
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 flex flex-col gap-2 max-h-72">
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-slate-400 text-xs"><FaSearch className="absolute left-3 text-slate-400 text-xs pointer-events-none" /></span>
                          <input
                            type="text"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            placeholder="Search division..."
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                          />
                        </div>
                        
                        <div className="overflow-y-auto flex-1 space-y-0.5 max-h-48 pr-1 custom-scrollbar">
                          {sortedCities.map((c, i) => {
                            const isMatch = citySearchQuery.trim() === '' || c.toLowerCase().includes(citySearchQuery.toLowerCase());
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setValue('city', c, { shouldValidate: true });
                                  setIsCityDropdownOpen(false);
                                  setCitySearchQuery('');
                                }}
                                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-between ${
                                  watchedCity === c
                                    ? 'bg-primary text-white dark:bg-blue-500'
                                    : isMatch
                                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 opacity-65'
                                }`}
                              >
                                <span>{c}</span>
                                {citySearchQuery.trim() !== '' && isMatch && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold shrink-0">
                                    Match
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {errors.city && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.city.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Street Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaMapMarkerAlt className="h-4 w-4" /></span>
                  <input
                    type="text"
                    placeholder="Enter street address"
                    {...register('streetAddress')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.streetAddress && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.streetAddress.message}</p>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                Professional Bio / Teaching Philosophy
              </label>
              <textarea
                rows="4"
                placeholder="Introduce yourself and explain your teaching methodology (min 30 characters)..."
                {...register('bio')}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
              {errors.bio && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.bio.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: Qualifications & Experience */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h4 className="text-lg font-bold text-slate-855 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
              Academic Qualifications & Work Experience
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Degree */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Highest Degree / Qualification
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaGraduationCap className="h-4 w-4" /></span>
                  <select
                    {...register('degree')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 appearance-none"
                  >
                    <option value="">Select Qualification</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Degree">Degree</option>
                    <option value="BTech">BTech</option>
                    <option value="Post-Graduation">Post-Graduation</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.degree && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.degree.message}</p>}
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  University / College / School
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaGraduationCap className="h-4 w-4" /></span>
                  <input
                    type="text"
                    placeholder="e.g. Delhi University, IIT Bombay"
                    {...register('institution')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.institution && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.institution.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Passing Year */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Year of Graduation
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2018"
                  {...register('passingYear')}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
                {errors.passingYear && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.passingYear.message}</p>}
              </div>

              {/* Experience Years */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Total Teaching Experience (Years)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400"><FaBriefcase className="h-4 w-4" /></span>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    {...register('experienceYears')}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
                {errors.experienceYears && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.experienceYears.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Teaching Preferences */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h4 className="text-lg font-bold text-slate-855 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
              Teaching Preferences
            </h4>

            {/* Subjects Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                Subjects You Can Teach (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUBJECTS.map((sub, idx) => {
                  const isChecked = watchedSubjects?.includes(sub);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSubject(sub)}
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
              {errors.subjects && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.subjects.message}</p>}
            </div>

            {/* Classes Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                Grades / Classes (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CLASSES.map((cls, idx) => {
                  const isChecked = watchedClasses?.includes(cls);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-200 ${
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
              {errors.classes && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.classes.message}</p>}
            </div>

            {/* Teaching Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-wide">
                Preferred Teaching Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Online', 'Offline', 'Both'].map((m) => {
                  const isSelected = watchedTeachingMode === m;
                  return (
                    <label
                      key={m}
                      className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-450 font-extrabold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={m}
                        {...register('teachingMode')}
                        className="sr-only"
                      />
                      <span>{m}</span>
                    </label>
                  );
                })}
              </div>
              {errors.teachingMode && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.teachingMode.message}</p>}
            </div>

            {/* Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Hourly Rate (₹) (100 - 500)
                </label>
                <input
                  type="number"
                  placeholder="Hourly rate (100 - 500)"
                  {...register('hourlyRate')}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
                {errors.hourlyRate && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.hourlyRate.message}</p>}
              </div>

              {/* Monthly Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Monthly Charges (₹) (500 - 15000)
                </label>
                <input
                  type="number"
                  placeholder="Monthly charges (500 - 15000)"
                  {...register('monthlyRate')}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
                {errors.monthlyRate && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.monthlyRate.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Location & Profile */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h4 className="text-lg font-bold text-slate-855 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
              Location & Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Pin Code */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Pin Code
                </label>
                <input
                  type="text"
                  placeholder="6-digit code"
                  {...register('pincode')}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.pincode.message}</p>}
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter referral code if any"
                  {...register('referralCode')}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
                {errors.referralCode && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.referralCode.message}</p>}
              </div>
            </div>

            {/* Live Location Option */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
              <div className="relative group flex items-center">
                <button
                  type="button"
                  onClick={handleFetchLiveLocation}
                  disabled={locLoading}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all duration-200 ${
                    hasFetchedLoc
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/50'
                      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {locLoading ? (
                    <span>Fetching Location...</span>
                  ) : hasFetchedLoc ? (
                    <span>Live Location Linked <FaCheck className="h-3.5 w-3.5 text-emerald-500 inline ml-1" /></span>
                  ) : (
                    <>
                      <span>Use Live Location</span>
                      <span className="loader scale-pin"></span>
                    </>
                  )}
                </button>

                {/* Styled Tooltip Popup on Hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                  <div className="bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-lg text-center leading-normal dark:bg-slate-800 border border-slate-700">
                    Use only at your home location
                  </div>
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 transform rotate-45 -mt-1 shadow-md"></div>
                </div>
              </div>

              {/* Persistent Amber Warning Text */}
              <span className="text-[11px] text-amber-600 dark:text-amber-450 font-bold bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 px-3 py-2 rounded-xl flex items-center gap-1.5">
                <FaExclamationTriangle className="h-4 w-4 shrink-0 text-amber-500" /> Use only at your home location.
              </span>

              {locError && <span className="text-xs text-rose-500 font-semibold">{locError}</span>}
              {hasFetchedLoc && (
                <span className="text-[10px] text-slate-400 font-bold dark:text-slate-505">
                  Latitude: {watchedLat?.toFixed(4)}, Longitude: {watchedLng?.toFixed(4)}
                </span>
              )}
              <input type="hidden" {...register('lat')} />
              <input type="hidden" {...register('lng')} />
            </div>

            {/* Profile Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                Upload Profile Photo (Optional) (IMAGE - Max 2MB)
              </label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-200">
                <input
                  type="file"
                  id="resume"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2.5">
                  <div className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <FaUpload className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-primary dark:text-blue-500 hover:underline">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-slate-400">Image file (JPEG, PNG, WEBP) up to 2MB</p>
                </div>
              </div>
              {compressionLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary dark:text-blue-450 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                  <span className="loader scale-75 shrink-0"></span>
                  <span>Compressing and optimizing image...</span>
                </div>
              )}
              {resumeFile && !compressionLoading && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-250/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Visual Image Preview */}
                    {compressedPreviewUrl && (
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-slate-250/30 shadow-sm shrink-0 bg-slate-105 dark:bg-slate-850 flex items-center justify-center z-0">
                        <img src={compressedPreviewUrl} alt="Profile preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-205 max-w-[180px] sm:max-w-[240px] truncate">{resumeFile.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {(resumeFile.size / 1024).toFixed(0)} KB
                        </span>
                        {originalSize && originalSize !== resumeFile.size && (
                          <>
                            <span className="text-[9px] font-bold text-emerald-650 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                              Saved {(((originalSize - resumeFile.size) / originalSize) * 100).toFixed(0)}%
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold line-through">
                              {(originalSize / 1024).toFixed(0)} KB
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      setCompressedPreviewUrl(null);
                      setOriginalSize(null);
                    }}
                    className="text-xs font-bold text-rose-500 hover:underline shrink-0"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
              {(resumeError || errors.resume) && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {resumeError || errors.resume?.message}
                </p>
              )}
            </div>

            {/* Educational Certificate Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                Upload Educational Certificate (PDF or IMAGE - Max 2MB)
              </label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-850/20 transition-all duration-200">
                <input
                  type="file"
                  id="certificate"
                  accept="image/*,application/pdf"
                  onChange={handleCertificateChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2.5">
                  <div className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <FaUpload className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-primary dark:text-blue-500 hover:underline">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-slate-400">PDF or Image file (JPEG, PNG, WEBP) up to 2MB</p>
                </div>
              </div>
              {certificateCompressionLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary dark:text-blue-450 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                  <span className="loader scale-75 shrink-0"></span>
                  <span>Compressing and optimizing certificate image...</span>
                </div>
              )}
              {certificateFile && !certificateCompressionLoading && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-250/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-455 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                      {certificateFile.name.split('.').pop().toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-205 max-w-[180px] sm:max-w-[240px] truncate">
                        {certificateFile.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {certificateFile.size > 1048576 
                            ? `${(certificateFile.size / (1024 * 1024)).toFixed(2)} MB` 
                            : `${(certificateFile.size / 1024).toFixed(0)} KB`}
                        </span>
                        {certificateOriginalSize && certificateOriginalSize !== certificateFile.size && (
                          <>
                            <span className="text-[9px] font-bold text-emerald-650 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                              Saved {(((certificateOriginalSize - certificateFile.size) / certificateOriginalSize) * 100).toFixed(0)}%
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold line-through">
                              {(certificateOriginalSize / 1024).toFixed(0)} KB
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {certificatePreviewUrl && (
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-slate-250/30 shadow-sm bg-slate-105 dark:bg-slate-850 flex items-center justify-center z-0">
                        <img
                          src={certificatePreviewUrl}
                          alt="Certificate preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (certificatePreviewUrl) URL.revokeObjectURL(certificatePreviewUrl);
                        setCertificateFile(null);
                        setCertificatePreviewUrl(null);
                        setCertificateOriginalSize(null);
                      }}
                      className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove Certificate
                    </button>
                  </div>
                </div>
              )}
              {certificateError && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {certificateError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit Error Message */}
        {submitError && (
          <div className="p-4 mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450">
            <strong>Submission Failed:</strong> {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className={`${currentStep === 0 ? 'invisible' : ''}`}
          >
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" variant="primary" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button type="submit" variant="primary" loading={loading}>
              Submit Application
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BecomeTutorForm;
