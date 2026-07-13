import { motion } from 'framer-motion';
import { FaGraduationCap, FaUserCheck } from 'react-icons/fa';
import SEO from '../components/common/SEO';

const VALUES = [
  {
    icon: (
      <>
        <svg width="0" height="0" className="absolute">
          <linearGradient id="cap-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fffbdf" />
          </linearGradient>
        </svg>
        <FaGraduationCap style={{ fill: "url(#cap-gradient)" }} className="filter drop-shadow-[0_1px_4px_rgba(212,175,55,0.5)]" />
      </>
    ),
    title: 'Academic Excellence',
    description: 'We prioritize personalized, high-quality learning that supports academic success and unlocks students\' potential.',
    iconClass: 'bg-slate-950 border-slate-900 shadow-md dark:bg-black dark:border-slate-950'
  },
  {
    icon: <FaUserCheck />,
    title: 'Trust & Safety',
    description: 'Every tutor undergoes thorough identification, background, and academic credential screening before joining.',
    iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
  },
  {
    icon: (
      <div className="scale-[0.15] transform-gpu origin-center absolute select-none pointer-events-none">
        <div className="emoji">
          <div className="eyes">
            <div className="eye1"></div>
            <div className="eye2"></div>
          </div>
          <div className="mouth">
            <div className="mask">
              <div className="teeth"></div>
              <div className="toungue"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    title: 'Student Centricity',
    description: 'We match teaching methodologies to the student\'s learning style, ensuring interest, pace compatibility, and conceptual clarity.',
    iconClass: 'bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
  }
];

const AboutUs = () => {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about HomeTutorX, our vision to transform tutoring, and the verified leadership team connecting qualified educators with students."
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-20">
        
        {/* Story & Introduction */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest block">
              Our Journey
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Transforming Home Tuition in India
            </h1>
            <p className="text-sm text-slate-650 dark:text-slate-450 leading-relaxed font-medium">
               HomeTutorX was founded in 2026 to address a common parent struggle: finding qualified, reliable home tutors who genuinely understand a student's individual learning speed and requirements. 
            </p>
            <p className="text-sm text-slate-650 dark:text-slate-455 leading-relaxed font-medium">
              What started as a localized tutor directory in Vizianagaram has evolved into a robust nationwide platform connecting thousands of parents with pre-screened, certified subject matter experts. We combine the personal touch of face-to-face home tuition with modern scheduling tools.
            </p>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-xl border border-slate-100 dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&h=450&q=80"
                alt="Classroom learning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-900 shadow-md dark:bg-black dark:border-slate-950 flex items-center justify-center relative overflow-visible">
              <svg width="0" height="0" className="absolute">
                <linearGradient id="rocket-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7f1d1d" />
                  <stop offset="60%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ff8a8a" />
                </linearGradient>
              </svg>
              <motion.div
                whileHover={{ y: -3, x: 3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 512 512"
                  className="h-5 w-5 filter drop-shadow-[0_1px_4px_rgba(239,68,68,0.6)]"
                  style={{ fill: "url(#rocket-gradient)" }}
                >
                  <path d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375Z" />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white">Our Mission</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              To empower students with personalized private education by connecting them with certified, passionate educators who build solid concepts, inspire confidence, and guide them toward long-term academic excellence.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center relative overflow-hidden">
              <div className="scale-[0.24] transform-gpu origin-center absolute select-none pointer-events-none">
                <div className="eye-lid">
                  <div className="eye">
                    <div className="cornea">
                      <div className="white-pupil"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white">Our Vision</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              To build a trusted global learning network that makes verified, customized home and online private tutoring accessible to every learner, shaping the future of supplemental education.
            </p>
          </div>
        </section>

        {/* Core Values / Why Choose Us */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Why Parents Choose Us
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4 group"
              >
                <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center text-xl shadow-sm transition-transform duration-300 group-hover:scale-110 relative ${val.iconClass}`}>
                  {val.icon}
                </div>
                <h4 className="font-bold text-slate-850 dark:text-slate-205 text-base">{val.title}</h4>
                <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-medium">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
};

export default AboutUs;
