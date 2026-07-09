import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap
} from 'react-icons/fa';
import { NAV_LINKS, SUBJECTS } from '../../constants';

const Footer = () => {
  const topSubjects = SUBJECTS.slice(0, 6);

  return (
    <footer className="bg-slate-100 text-slate-600 border-t border-slate-200 pt-12 pb-8 dark:bg-slate-100 dark:text-slate-600 dark:border-slate-200 md:bg-slate-900 md:text-slate-300 md:border-slate-800 md:dark:bg-[#070b13] md:dark:text-slate-300 md:dark:border-slate-800">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
              <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-900 shadow-md flex items-center justify-center text-white relative overflow-hidden">
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="footer-cap-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fffbdf" />
                  </linearGradient>
                </svg>
                <FaGraduationCap style={{ fill: "url(#footer-cap-gradient)" }} className="h-6 w-6 filter drop-shadow-[0_1px_3px_rgba(212,175,55,0.4)]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 md:text-white dark:text-slate-800 md:dark:text-white">
                Home<span className="text-primary dark:text-blue-500">Tutor</span><span className="text-[#d4af37] font-black">X</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 md:text-slate-400 dark:text-slate-500 md:dark:text-slate-400 leading-relaxed">
              Connecting students and parents with top-tier, qualified tutors for personalized home and online lessons. Spark learning, build confidence, and achieve academic excellence.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-800 md:text-white dark:text-slate-800 md:dark:text-white font-semibold mb-6 text-base tracking-wide">Quick Links</h4>
            <ul className="space-y-3.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-500 hover:text-slate-850 md:text-slate-400 md:hover:text-white dark:text-slate-500 dark:hover:text-slate-800 md:dark:text-slate-400 md:dark:hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Subjects */}
          <div>
            <h4 className="text-slate-800 md:text-white dark:text-slate-800 md:dark:text-white font-semibold mb-6 text-base tracking-wide">Popular Subjects</h4>
            <ul className="space-y-3.5 text-sm">
              {topSubjects.map((sub, index) => (
                <li key={index}>
                  <Link
                    to={`/tutors?subject=${encodeURIComponent(sub)}`}
                    className="text-slate-500 hover:text-slate-850 md:text-slate-400 md:hover:text-white dark:text-slate-500 dark:hover:text-slate-800 md:dark:text-slate-400 md:dark:hover:text-white transition-colors duration-200"
                  >
                    {sub} Tuition
                  </Link>
                </li>
              ))}
            </ul>
          </div>


        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-200 md:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 dark:text-slate-400 md:text-slate-500 md:dark:text-slate-500">
          <p>© {new Date().getFullYear()} HomeTutorX. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-slate-650 md:hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-650 md:hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
