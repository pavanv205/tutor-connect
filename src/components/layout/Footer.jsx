import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap
} from 'react-icons/fa';
import { NAV_LINKS, SUBJECTS } from '../../constants';

const Footer = () => {
  const topSubjects = SUBJECTS.slice(0, 6);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-8 dark:bg-[#070b13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <FaGraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Tutor<span className="text-primary dark:text-blue-500">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting students and parents with top-tier, qualified tutors for personalized home and online lessons. Spark learning, build confidence, and achieve academic excellence.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-base tracking-wide">Quick Links</h4>
            <ul className="space-y-3.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Subjects */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-base tracking-wide">Popular Subjects</h4>
            <ul className="space-y-3.5 text-sm">
              {topSubjects.map((sub, index) => (
                <li key={index}>
                  <Link
                    to={`/tutors?subject=${encodeURIComponent(sub)}`}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {sub} Tuition
                  </Link>
                </li>
              ))}
            </ul>
          </div>


        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
