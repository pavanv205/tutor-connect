import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaBars, FaTimes, FaBell } from 'react-icons/fa';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, user, role, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      Promise.resolve().then(() => {
        setNotifications([]);
      });
      return;
    }

    Promise.resolve().then(() => {
      fetchNotifications();
      import('../../utils/pushSubscriptionHelper')
        .then(({ subscribeUserToPush }) => {
          subscribeUserToPush();
        })
        .catch(err => console.error('Failed to load push subscription helper:', err));
    });

    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const notificationDropdown = (
    <AnimatePresence>
      {isNotificationsOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => setIsNotificationsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-bold text-primary dark:text-blue-500 hover:underline border-none bg-transparent cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <span className="text-xl mb-2 text-slate-350">🔔</span>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (!n.isRead) handleMarkAsRead(n._id);
                      setIsNotificationsOpen(false);
                    }}
                    className={`flex gap-3 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      !n.isRead ? 'bg-slate-50/40 dark:bg-slate-800/10' : ''
                    }`}
                  >
                    {/* Indicator dot */}
                    <div className="flex items-center">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          !n.isRead ? 'bg-primary dark:bg-blue-500' : 'bg-transparent'
                        }`}
                      />
                    </div>
                    {/* Message body */}
                    <div className="flex-1 space-y-1">
                      <p className={`text-xs leading-relaxed text-left ${
                        !n.isRead ? 'text-slate-800 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'
                      }`}>
                        {n.message}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-505 text-left font-semibold">
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

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
        ? 'text-slate-950 dark:text-white font-black'
        : 'text-slate-950 hover:text-slate-950 dark:text-slate-950 dark:hover:text-white'
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
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Home<span className="text-primary dark:text-blue-500">Tutor</span><span className="text-[#d4af37] font-black">X</span>
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
                          className="absolute left-0 right-0 bottom-0 h-0.5 bg-slate-950 dark:bg-white rounded-full"
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
                <>
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:outline-none cursor-pointer relative"
                    >
                      <FaBell style={{ color: '#FFD700' }} className="h-4.5 w-4.5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white dark:ring-[#070b13]">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {/* Render Dropdown */}
                    {notificationDropdown}
                  </div>

                  <div
                    className="relative"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <button className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-955 dark:text-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:outline-none cursor-pointer">
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
                </>
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => setIsLoginOpen(true)}
                  onMouseLeave={() => setIsLoginOpen(false)}
                >
                  <button className="text-xs font-bold text-slate-950 hover:text-slate-950 dark:text-slate-950 dark:hover:text-white py-2.5 px-3 cursor-pointer focus:outline-none">
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
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:outline-none cursor-pointer relative"
                  >
                    <FaBell style={{ color: '#FFD700' }} className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white dark:ring-[#070b13]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {/* Render Dropdown */}
                  {notificationDropdown}
                </div>
              )}
              {/* Hamburger Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-955 dark:text-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus:outline-none"
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
                          ? 'text-slate-950 dark:text-white font-extrabold'
                          : 'text-slate-950 hover:text-slate-950 dark:text-slate-950 dark:hover:text-white'
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
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-slate-800 dark:hover:text-white transition-colors"
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
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      Student Login
                    </Link>
                    <Link
                      to="/login?role=teacher"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      Tutor Login
                    </Link>
                    <Link
                      to="/login?role=admin"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-slate-950 dark:text-slate-200 hover:text-slate-800 dark:hover:text-white transition-colors"
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
