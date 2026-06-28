import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalculator,
  FaAtom,
  FaFlask,
  FaDna,
  FaLaptopCode,
  FaBookOpen,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { SUBJECT_CATEGORIES } from '../../constants';

const ICON_MAP = {
  FaCalculator: <FaCalculator className="h-6 w-6" />,
  FaAtom: <FaAtom className="h-6 w-6" />,
  FaFlask: <FaFlask className="h-6 w-6" />,
  FaDna: <FaDna className="h-6 w-6" />,
  FaLaptopCode: <FaLaptopCode className="h-6 w-6" />,
  FaBookOpen: <FaBookOpen className="h-6 w-6" />,
  FaChartBar: <FaChartBar className="h-6 w-6" />
};

const SubjectsCarousel = () => {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const offset = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (name) => {
    // Navigate to find tutors page with preselected subject
    navigate(`/tutors?subject=${encodeURIComponent(name)}`);
  };

  return (
    <section className="py-20 bg-white dark:bg-[#0f172a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
              Available Disciplines
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Popular Subjects
            </h3>
            <p className="text-sm text-slate-650 dark:text-slate-400 font-medium">
              Explore qualified private tutors specializing in your required academic subjects.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex gap-2.5">
            <button
              onClick={() => scroll('left')}
              className="h-11 w-11 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="h-11 w-11 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none"
              aria-label="Scroll right"
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {SUBJECT_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex-shrink-0 w-64 snap-start cursor-pointer bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 transition-all duration-300 group flex flex-col"
            >
              <div>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${cat.color} text-white shadow-md shadow-slate-100/10 group-hover:scale-110 transition-transform duration-300`}>
                  {ICON_MAP[cat.icon] || <FaCalculator />}
                </div>

                <h4 className="text-lg font-bold text-slate-850 dark:text-slate-200 mt-6 mb-1 group-hover:text-primary dark:group-hover:text-blue-450 transition-colors">
                  {cat.name}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectsCarousel;
