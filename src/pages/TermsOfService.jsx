import React from 'react';
import { motion } from 'framer-motion';
import { FaFileContract, FaRegHandshake, FaExclamationTriangle, FaRegEnvelope } from 'react-icons/fa';
import SEO from '../components/common/SEO';

const TermsOfService = () => {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Read the terms and conditions for using TutorConnect, managing bookings, student/tutor accounts, and booking guidelines."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-450 items-center justify-center text-xl shadow-inner mb-2 animate-bounce">
            <FaFileContract />
          </div>
          <span className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest block">
            Agreement & Conditions
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Last Updated: July 2026
          </p>
        </div>

        {/* Overview Card */}
        <section className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <FaRegHandshake className="text-primary dark:text-blue-400 text-lg shrink-0" />
            Terms Agreement
          </h3>
          <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
            Welcome to TutorConnect. These Terms of Service ("Terms") govern your access to and use of our website, databases, matchmaking algorithms, and services. By registering as a Student or a Tutor, booking sessions, or accessing any section of the platform, you agree to comply with and be bound by these legal terms.
          </p>
          <p className="text-sm text-slate-650 dark:text-slate-405 leading-relaxed font-medium">
            Please read these Terms carefully before proceeding. If you do not agree to all terms and conditions set forth herein, you must immediately cease using the platform.
          </p>
        </section>

        {/* Detailed Sections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-10 space-y-10 shadow-sm">
          {/* Section 1 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Services Offered
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              TutorConnect is an educational search and matching directory that connects independent tutors ("Educators") with students and parents ("Students"). We facilitate:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li>Profile listings of verified and pre-screened private tutors.</li>
              <li>Booking engines for free or paid lessons.</li>
              <li>Dashboard tracking systems allowing both tutors and students to manage booking states (Pending, Assigned, Completed, Cancelled).</li>
              <li>Proximity geolocation calculations to aid matching offline/home lessons.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              2. User Obligations & Conduct
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              As a user, you agree to:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li><strong>Information Accuracy:</strong> Provide genuine, current, and complete details when registering profiles, qualifications, and billing slots.</li>
              <li><strong>Security:</strong> Take full responsibility for securing account passwords and API access keys.</li>
              <li><strong>Appropriate Conduct:</strong> Maintain professional and ethical communication when interacting with other users. Harassment, abuse, or spamming is grounds for instant termination.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              3. Tutor Verification Disclaimer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium flex items-start gap-2.5">
              <FaExclamationTriangle className="text-amber-500 text-lg shrink-0 mt-0.5" />
              <span>
                <strong>Verification Limits:</strong> Although TutorConnect screens qualification certificates and profile photos, we do not perform comprehensive background checks or criminal vetting. Parents and students are strongly encouraged to inspect physical identification, verify credentials in person, and supervise the first sessions.
              </span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-405 leading-relaxed font-medium">
              TutorConnect is not liable for any issues, disputes, damages, or occurrences that happen during offline or online home tuitions.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              4. Booking, Completion & Cancellation Rules
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              The booking system coordinates booking statuses to maintain high matching metrics:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li>A booking request begins in <strong>Pending</strong> status, visible to both student and tutor.</li>
              <li>Once accepted, the status updates to <strong>Assigned</strong>, and contact details are unlocked.</li>
              <li>Both Students and Tutors have the authority to update booking records to <strong>Completed</strong> or <strong>Cancelled</strong> through their respective dashboards.</li>
              <li>Students have a dedicated button to cancel requests directly from their student portal, preventing schedule confusion.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              5. Intellectual Property
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              All branding assets, site design, text formatting, and proprietary matchmaking codes are the intellectual property of TutorConnect. You may not copy, extract, scraper-harvest, or reuse code segments without express written authorization.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              6. Limitation of Liability
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              TutorConnect does not guarantee that matching will result in a specific academic grade or learning outcome. Under no circumstances will TutorConnect, its developers, or its team be held liable for direct or indirect damages, personal injuries, loss of profits, or data loss occurring as a result of platform usage.
            </p>
          </div>
        </div>

        {/* Contact Support Section */}
        <section className="bg-slate-900 text-white dark:bg-[#070b13] border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white text-xl mx-auto shadow-inner">
            <FaRegEnvelope />
          </div>
          <h3 className="text-lg font-bold">Need assistance with our Terms?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            If you represent an educational institution, have inquiries regarding policy compliance, or wish to clarify billing and dispute guidelines, please contact support.
          </p>
          <p className="text-xs font-bold text-primary dark:text-blue-400">
            supporttutorconnect@gmail.com
          </p>
        </section>
      </div>
    </>
  );
};

export default TermsOfService;
