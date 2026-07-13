import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import SEO from '../components/common/SEO';
import Hero from '../components/sections/Hero';
import SubjectsCarousel from '../components/sections/SubjectsCarousel';

import HowItWorks from '../components/sections/HowItWorks';

import { FAQS } from '../constants';


const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);


  return (
    <>
      <SEO
        title="Home"
        description="Find verified local home tutors and interactive online tuition for boards prep, school levels, JEE, NEET, and language learning."
        keywords="home tuition, online classes, physics tutor, math tutor, private teachers, JEE NEET prep"
      />

      {/* Hero Section */}
      <Hero />

      {/* Stats Bar */}
      <section className="py-8 bg-slate-900 text-white dark:bg-[#070b13] border-y border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-primary dark:text-blue-500">98%</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Grade Improvement</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-500">12,000+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Hours Taught</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary dark:text-blue-500">150+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Subjects Covered</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-500">4.9/5</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Categories Slider */}
      <SubjectsCarousel />

      {/* How It Works Section */}
      <HowItWorks />





      {/* FAQ Accordion Section */}
      <section className="py-20 bg-slate-50 dark:bg-[#0B0F19] border-t border-slate-100/50 dark:border-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
              Have Questions?
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex justify-between items-center py-5 px-6 font-bold text-slate-800 dark:text-slate-250 text-left focus:outline-none hover:text-primary dark:hover:text-blue-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400 shrink-0 ml-4"
                    >
                      <FaChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-slate-650 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-50 dark:border-slate-800/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>


    </>
  );
};

export default Home;
