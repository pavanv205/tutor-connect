import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaUserPlus, FaStar, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import Button from '../common/Button';

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 bg-slate-50 dark:bg-[#0B0F19]">
      {/* Background blobs for visual appeal */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 -mr-40 -mt-20 dark:bg-blue-500/5" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl -z-10 -ml-20 -mb-20 dark:bg-amber-500/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Tagline */}
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 uppercase tracking-wider"
            >
              <FaStar className="h-3 w-3" /> Connect. Learn. Excel.
            </motion.span>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white"
            >
              Personalized <span className="text-blue-600 dark:text-blue-400">Home & Online</span> Tuition
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-650 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Connect with top-rated, certified local home tutors and interactive online educators tailored to your student's learning style. Boost confidence and grades.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/tutors')}
                icon={<FaSearch className="text-xs" />}
                iconPosition="left"
              >
                Find a Tutor
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/become-tutor')}
                icon={<FaUserPlus className="text-xs" />}
                iconPosition="left"
              >
                Become a Tutor
              </Button>
            </motion.div>

            {/* Simple Trust Banner */}
            <motion.div
              variants={itemVariants}
              className="pt-6 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-xs text-slate-400 font-semibold uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">✓ 100% Verified Profiles</span>
              <span className="flex items-center gap-1.5">✓ Personal Support</span>
            </motion.div>
          </motion.div>

          {/* Hero Right Media / Illustrative Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-5 relative"
          >
            {/* Main Image Container */}
            <div className="relative mx-auto max-w-[420px] rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-tr from-primary to-indigo-500 p-1.5 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&h=750&q=80"
                alt="Student learning with a tutor"
                className="w-full h-full object-cover rounded-[1.25rem] brightness-95"
              />
              {/* Overlay styling for modern aesthetics */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent rounded-[1.25rem] z-10" />
            </div>

            {/* Float Metric Card 1 */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="absolute top-1/4 -left-6 z-20 glass border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3"
            >
              <div className="h-10 w-10 bg-primary text-white rounded-lg flex items-center justify-center">
                <FaUserGraduate className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Happy Students</p>
              </div>
            </motion.div>

            {/* Float Metric Card 2 */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="absolute bottom-12 -right-6 z-20 glass border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3"
            >
              <div className="h-10 w-10 bg-amber-500 text-slate-900 rounded-lg flex items-center justify-center">
                <FaChalkboardTeacher className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Expert Tutors</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
