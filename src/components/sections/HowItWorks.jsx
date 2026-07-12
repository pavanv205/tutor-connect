import { motion } from 'framer-motion';
import { FaSearch, FaBookReader } from 'react-icons/fa';

const STEPS = [
  {
    step: '01',
    title: 'Search & Choose',
    description: 'Browse verified tutor profiles, compare qualifications, teaching experience, modes (online/offline), and rates.',
    icon: <FaSearch className="h-6 w-6" />,
    color: 'bg-blue-50 text-primary border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50'
  },
  {
    step: '02',
    title: 'Begin Learning',
    description: 'Finalize schedules and payment terms directly with your tutor, and start customized home or online learning classes.',
    icon: <FaBookReader className="h-6 w-6" />,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/50'
  }
];

const HowItWorks = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12
      }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-[#0f172a] relative">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
            Simple & Transparent
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            How HomeTutorX Works
          </h3>
          <p className="text-base text-slate-650 dark:text-slate-400 font-medium">
            Get personalized learning for your student in two easy steps.
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="relative bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-100/10 dark:hover:shadow-none transition-all duration-300 group"
            >
              {/* Connector line for large screens */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[75%] w-[50%] h-[2px] bg-slate-100 dark:bg-slate-800 -z-1" />
              )}

              <div className="flex justify-between items-start mb-6">
                {/* Step Icon */}
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${step.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                {/* Step Number */}
                <span className="text-4xl font-black text-slate-200 dark:text-slate-700 tracking-tight select-none">
                  {step.step}
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-850 dark:text-slate-200 mb-3 group-hover:text-primary dark:group-hover:text-blue-450 transition-colors">
                {step.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
