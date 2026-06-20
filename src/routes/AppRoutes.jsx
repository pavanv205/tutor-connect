import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Custom loading spinner fallback
const LoadingPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-primary dark:border-slate-800 dark:border-t-blue-500 animate-spin" />
      <p className="text-sm font-semibold text-slate-550 dark:text-slate-400">Loading TutorConnect...</p>
    </div>
  </div>
);

// Lazy loaded page components
const Home = lazy(() => import('../pages/Home'));
const FindTutors = lazy(() => import('../pages/FindTutors'));
const TutorProfile = lazy(() => import('../pages/TutorProfile'));
const BecomeTutor = lazy(() => import('../pages/BecomeTutor'));
const AboutUs = lazy(() => import('../pages/AboutUs'));
const ContactUs = lazy(() => import('../pages/ContactUs'));
const Login = lazy(() => import('../pages/Login'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const TutorDashboard = lazy(() => import('../pages/TutorDashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tutors" element={<FindTutors />} />
        <Route path="/tutors/:id" element={<TutorProfile />} />
        <Route path="/become-tutor" element={<BecomeTutor />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Tutor']}>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
