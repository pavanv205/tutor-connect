import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBriefcase, FaGraduationCap, FaMapMarkerAlt, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { tutorService } from '../../services/tutorService';
import { useBookingModal } from '../../context/BookingModalContext';
import { TutorCardSkeleton } from '../common/Skeleton';
import Button from '../common/Button';



export const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();
  const { openBookingModal } = useBookingModal();

  if (!tutor) return null;

  // Safeguards for tutor properties to prevent UI crashes if some fields are missing
  const photo = tutor.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
  const name = tutor.name || tutor.fullName || 'Anonymous Tutor';
  const qualification = (tutor.qualification || 'Verified Educator').split('(')[0];
  const gender = tutor.gender || '';
  const age = tutor.age ? `${tutor.age} yrs` : '';

  const experience = tutor.experience !== undefined ? tutor.experience : 3;
  
  const state = tutor.state || '';
  const city = tutor.city || '';
  const street = tutor.streetAddress || tutor.address || '';
  const fullAddressParts = [];
  if (street) fullAddressParts.push(street);
  if (city) fullAddressParts.push(city);
  if (state) fullAddressParts.push(state);
  const fullAddress = fullAddressParts.length > 0 ? fullAddressParts.join(', ') : (tutor.city || 'Bangalore');

  const monthlyRate = tutor.monthlyRate || 3000;
  const about = tutor.about || tutor.bio || 'No biography details provided.';
  const subjects = Array.isArray(tutor.subjects) ? tutor.subjects : [];
  const hourlyRate = tutor.hourlyRate || 500;
  const id = tutor.id || '';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-slate-200/50 dark:hover:border-slate-800/80 transition-all duration-300 flex flex-col justify-between h-full group"
    >
      <div>
        {/* Header: Photo and Badges */}
        <div className="flex gap-4 items-start">
          <img
            src={photo}
            alt={name}
            className="h-16 w-16 rounded-2xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
          />
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base group-hover:text-primary dark:group-hover:text-blue-450 transition-colors">
              {name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <FaGraduationCap className="text-slate-400 text-sm" />
              <span className="truncate max-w-[150px]">{qualification}</span>
            </p>


          </div>
        </div>

        {/* Experience & City */}
        <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <FaBriefcase className="text-slate-404 text-sm" /> {experience} Yrs Exp
          </span>
          <span className="flex items-center gap-1 flex-1">
            <FaMapMarkerAlt className="text-slate-400 text-sm shrink-0" /> 
            <span className="line-clamp-2" title={fullAddress}>{fullAddress}</span>
          </span>
          {gender && (
            <span className="flex items-center gap-1">
              <FaUser className="text-slate-400 text-sm shrink-0" /> {gender}
            </span>
          )}
          {age && (
            <span className="flex items-center gap-1">
              <FaCalendarAlt className="text-slate-400 text-sm shrink-0" /> {age}
            </span>
          )}
          {tutor.distance !== undefined && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450 font-extrabold shrink-0 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
              <FaMapMarkerAlt className="h-3 w-3 text-red-500 inline mr-1" /> {Number(tutor.distance).toFixed(1)} km
            </span>
          )}
        </div>

        {/* Short Bio */}
        <p className="mt-4 text-slate-650 dark:text-slate-400 text-xs leading-relaxed font-medium line-clamp-2">
          {about}
        </p>

        {/* Subjects Tags */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {subjects.map((sub, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-350 rounded-lg text-[10px] font-bold border border-slate-100 dark:border-slate-800"
            >
              {sub}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Details & Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-3">
        <div className="flex gap-4 shrink-0">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Hourly</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              ₹{hourlyRate}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Monthly</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              ₹{monthlyRate}
            </span>
          </div>
        </div>

        <div className="card-actions">
          <Button
            variant="outline"
            size="sm"
            className="px-4 py-2 text-xs font-bold details-btn"
            onClick={() => navigate(`/tutors/${id}`)}
          >
            Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1 py-2 text-xs font-bold shadow-md shadow-primary/5 hover:scale-[1.02] transition-transform duration-200 book-btn"
            onClick={() => openBookingModal(tutor)}
          >
            Book
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await tutorService.getFeaturedTutors();
        setTutors(data);
      } catch (error) {
        console.error('Failed to load featured tutors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0B0F19] border-y border-slate-100/50 dark:border-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
              Top Rated Educators
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Featured Tutors
            </h3>
            <p className="text-sm text-slate-650 dark:text-slate-400 font-medium">
              Learn from hand-picked, verified teaching professionals with proven success tracking.
            </p>
          </div>
          <Link
            to="/tutors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary dark:text-blue-450 hover:underline shrink-0"
          >
            View All Tutors →
          </Link>
        </div>

        {/* Tutors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <TutorCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTutors;
