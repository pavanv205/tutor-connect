import { FaShieldAlt, FaUserShield, FaRegEnvelope } from 'react-icons/fa';
import SEO from '../components/common/SEO';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Review the privacy policies and practices of HomeTutorX regarding how we collect, store, protect, and use your personal information."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-450 items-center justify-center text-xl shadow-inner mb-2 animate-bounce">
            <FaShieldAlt />
          </div>
          <span className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest block">
            Legal & Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Last Updated: July 2026
          </p>
        </div>

        {/* Introduction Card */}
        <section className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <FaUserShield className="text-primary dark:text-blue-400 text-lg shrink-0" />
            Introduction & Scope
          </h3>
          <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
            Welcome to HomeTutorX ("we," "our," or "us"). We are committed to protecting your privacy and ensuring your personal data is handled securely and transparently. This Privacy Policy details how we collect, store, process, and protect your personal information when you use our web application, search for tutors, book tutoring classes, or register as an educator.
          </p>
          <p className="text-sm text-slate-650 dark:text-slate-405 leading-relaxed font-medium">
            By registering an account or booking tutoring classes on our platform, you acknowledge and agree to the practices outlined in this Privacy Policy.
          </p>
        </section>

        {/* Detailed Sections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-10 space-y-10 shadow-sm">
          {/* Section 1 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Information We Collect
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              We collect information to facilitate the tutor-student matching process and ensure verification requirements are met:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li>
                <strong>Account Credentials:</strong> Full name, email address, password, role designation (Student, Tutor, or Admin), and contact details.
              </li>
              <li>
                <strong>Tutor Profile Information:</strong> Teaching experience, highest academic qualifications, subject specializations, hourly/monthly rates, classes taught, teaching modes (Online/Offline), and profile biography.
              </li>
              <li>
                <strong>Verifications & Uploads:</strong> Profile photos and academic certificates/resumes uploaded for tutor verification.
              </li>
              <li>
                <strong>Geolocation Data:</strong> If you use the "Live Location" features to assist with offline tuition matches, we capture latitude and longitude coordinates.
              </li>
              <li>
                <strong>Booking Inquiries:</strong> Booking details, requested slots, selected subjects, and personalized note messages sent during request submissions.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              2. How We Use Your Data
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Your data is processed strictly for the following purposes:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li>To match student learning demands with relevant nearby tutors.</li>
              <li>To verify the authenticity of educator qualifications through backend administrative reviews.</li>
              <li>To handle bookings and display scheduling statuses (Pending, Assigned, Completed, Deleted) on user dashboards.</li>
              <li>To share contact details (mobile numbers) between students and teachers once a tutor accepts a requested booking.</li>
              <li>To improve web performance, coordinate geolocation proximity searches, and troubleshoot app errors.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              3. Data Security & Storage
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              We employ industry-standard encryption, password hashing using <code>bcryptjs</code>, and secure MongoDB hosting to safeguard your credentials. Geolocation coordinates, phone numbers, and certificate uploads are kept confidential. In alignment with our data policies, uploads like certificates are compressed and stored securely.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-405 leading-relaxed font-medium">
              However, please note that no internet transmission is 100% secure. While we take every effort to protect your records, we cannot guarantee absolute data security.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              4. Sharing With Third Parties
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              We respect your privacy. We do not sell or rent your personal information to third-party advertisers. Information sharing is restricted to:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li><strong>Tutors & Students:</strong> Exchanging contact info only after a booking is approved and accepted.</li>
              <li><strong>Cloud Storage:</strong> Securing uploaded photos/resumes via integrated cloud platforms (e.g. Cloudinary).</li>
              <li><strong>Payment Processors:</strong> Secure handling of payments via Razorpay for student registration and tutor subscriptions. Transaction information is processed safely; credit card or bank details are not collected or stored on our servers.</li>
              <li><strong>Legal Compliance:</strong> Releasing records if required by local regulations, judicial mandates, or law enforcement requests.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              5. Your Rights & Choices
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              You retain full rights to manage your account:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
              <li><strong>Access:</strong> Review your profile credentials at any time on your dashboard.</li>
              <li><strong>Correction:</strong> Update biography details, subjects, prices, and settings.</li>
              <li><strong>Deletion:</strong> You can request account deactivation and removal of credentials by contacting support.</li>
            </ul>
          </div>
        </div>

        {/* Support Contact Footer */}
        <section className="bg-slate-900 text-white dark:bg-[#070b13] border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white text-xl mx-auto shadow-inner">
            <FaRegEnvelope />
          </div>
          <h3 className="text-lg font-bold">Have privacy questions?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            If you need clarification about this policy, want to request account deletion, or have questions about how geolocation details are processed, please reach out.
          </p>
          <p className="text-xs font-bold text-primary dark:text-blue-400">
            supporthometutorx@gmail.com
          </p>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;
