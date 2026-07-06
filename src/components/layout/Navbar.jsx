import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaBars, FaTimes } from 'react-icons/fa';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, user, role, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeStyle = ({ isActive }) =>
    `relative text-sm font-extrabold tracking-tight transition-colors duration-200 py-2 ${
      isActive
        ? 'text-primary dark:text-blue-400 font-black'
        : 'text-slate-950 hover:text-primary dark:text-slate-200 dark:hover:text-primary'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-[padding,background-color,border-color,box-shadow] duration-300 ${
          isScrolled
            ? 'glass shadow-md shadow-slate-100/10 dark:shadow-none py-3 border-b border-slate-100/80 dark:border-slate-800/80'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
              <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-900 shadow-md flex items-center justify-center text-white relative overflow-hidden">
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="nav-cap-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fffbdf" />
                  </linearGradient>
                </svg>
                <FaGraduationCap style={{ fill: "url(#nav-cap-gradient)" }} className="h-6 w-6 filter drop-shadow-[0_1px_3px_rgba(212,175,55,0.4)]" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Tutor<span className="text-primary dark:text-blue-500 font-extrabold">Connect</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.path} to={link.path} className={activeStyle}>
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary dark:bg-blue-400 rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Header Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <button className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-950 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:outline-none cursor-pointer">
                    <span>Hi, {user?.name ? user.name.split(' ')[0] : 'User'}</span>
                    <span className="text-[9px] text-slate-400">▼</span>
                  </button>
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                        className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2"
                      >
                        <Link
                          to={role === 'Admin' ? '/admin/dashboard' : role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard'}
                          className="block w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={logout}
                          className="block w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => setIsLoginOpen(true)}
                  onMouseLeave={() => setIsLoginOpen(false)}
                >
                  <button className="text-xs font-bold text-slate-950 hover:text-primary dark:text-white dark:hover:text-primary py-2.5 px-3 cursor-pointer focus:outline-none">
                    Login ▼
                  </button>
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isLoginOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                        className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2"
                      >
                        <Link
                          to="/login?role=student"
                          className="block py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          Student Login
                        </Link>
                        <Link
                          to="/login?role=teacher"
                          className="block py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          Tutor Login
                        </Link>
                        <Link
                          to="/login?role=admin"
                          className="block py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          Admin Login
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Actions Header */}
            <div className="flex md:hidden items-center gap-3">
              {/* Hamburger Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm md:hidden"
            />

            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-30 w-72 bg-white dark:bg-[#0f172a] shadow-2xl border-l border-slate-100 dark:border-slate-800 px-6 py-20 flex flex-col justify-between md:hidden"
            >
              {/* Menu Links */}
              <nav className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-bold transition-colors duration-200 ${
                        isActive
                          ? 'text-primary dark:text-blue-400 font-extrabold'
                          : 'text-slate-950 hover:text-primary dark:text-slate-200 dark:hover:text-primary'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                {/* Mobile Drawer Auth Links */}
                {isAuthenticated ? (
                  <>
                    <Link
                      to={role === 'Admin' ? '/admin/dashboard' : role === 'Tutor' ? '/tutor/dashboard' : '/student/dashboard'}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="text-lg font-bold text-left text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login?role=student"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Student Login
                    </Link>
                    <Link
                      to="/login?role=teacher"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Tutor Login
                    </Link>
                    <Link
                      to="/login?role=admin"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Admin Login
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
