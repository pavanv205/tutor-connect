import SEO from '../components/common/SEO';

import { FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

const CONTACT_INFO = [
  {
    icon: <FaWhatsapp />,
    title: 'WhatsApp / Phone',
    color: 'text-green-500',
    type: 'phone',
    details: [
      { label: '+91 98850 64713', href: 'https://wa.me/919885064713?text=Hi%2C%20I%20found%20you%20on%20TutorConnect%20and%20would%20like%20to%20enquire%20about%20tuition.' }
    ]
  },
  {
    icon: <FaEnvelope />,
    title: 'Email Supports',
    color: 'text-amber-500',
    type: 'email',
    details: [
      { label: 'supporttutorconnect@gmail.com', href: 'mailto:supporttutorconnect@gmail.com' }
    ]
  },
  {
    icon: <FaMapMarkerAlt />,
    title: 'Registered Office',
    color: 'text-rose-500',
    type: 'text',
    details: [
      { label: 'Vizianagaram, Andhrapradesh, India', href: null }
    ]
  }
];

const ContactUs = () => {
  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with TutorConnect support. Submit your queries, seek tutor matching assistance, or reach out to our office in Indiranagar, Bangalore."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">
        
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
            Reach Out
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            We are Here to Help
          </h2>
          <p className="text-base text-slate-650 dark:text-slate-400 font-medium">
            Have questions about fees, tutor qualifications, online video classes, or application approvals? Reach out and we'll reply within 12 hours.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CONTACT_INFO.map((info, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4"
            >
              <div className={`h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xl shadow-sm ${info.color}`}>
                {info.icon}
              </div>
              <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base">{info.title}</h3>
              <div className="space-y-2">
                {info.details.map((detail, dIdx) => (
                  detail.href ? (
                    <a
                      key={dIdx}
                      href={detail.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs font-semibold text-primary dark:text-blue-400 hover:underline transition-colors"
                    >
                      {detail.label}
                    </a>
                  ) : (
                    <p key={dIdx} className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {detail.label}
                    </p>
                  )
                ))}
              </div>
            </div>
          ))}
        </section>



      </div>
    </>
  );
};

export default ContactUs;
