import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaUndo, FaMap, FaList, FaLocationArrow } from 'react-icons/fa';
import SEO from '../components/common/SEO';
import { SUBJECTS, CLASSES, MODES, STATES, STATE_CITIES } from '../constants';
import { tutorService } from '../services/tutorService';
import { TutorCard } from '../components/sections/FeaturedTutors';
import { TutorListSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import TutorMap from '../components/common/TutorMap';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const FindTutors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userCoords, setUserCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  
  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const [divisionSearchQuery, setDivisionSearchQuery] = useState('');

  // Mobile states
  const [isMobileStateDropdownOpen, setIsMobileStateDropdownOpen] = useState(false);
  const [mobileStateSearchQuery, setMobileStateSearchQuery] = useState('');
  
  const [isMobileDivisionDropdownOpen, setIsMobileDivisionDropdownOpen] = useState(false);
  const [mobileDivisionSearchQuery, setMobileDivisionSearchQuery] = useState('');

  // Read initial states from URL query params
  const searchVal = searchParams.get('search') || '';
  const subjectVal = searchParams.get('subject') || 'All';
  const classVal = searchParams.get('class') || 'All';
  const modeVal = searchParams.get('mode') || 'All';
  const stateVal = searchParams.get('state') || 'All';
  const divisionVal = searchParams.get('division') || 'All';
  const maxPriceVal = searchParams.get('price') || '500';

  const filteredStates = React.useMemo(() => {
    return STATES.filter(s =>
      s.toLowerCase().includes(stateSearchQuery.toLowerCase())
    );
  }, [stateSearchQuery]);

  const mobileFilteredStates = React.useMemo(() => {
    return STATES.filter(s =>
      s.toLowerCase().includes(mobileStateSearchQuery.toLowerCase())
    );
  }, [mobileStateSearchQuery]);

  const sortedDivisions = React.useMemo(() => {
    const allStateDivisions = stateVal !== 'All' ? (STATE_CITIES[stateVal] || []) : [];
    if (!divisionSearchQuery.trim()) {
      return allStateDivisions;
    }
    const query = divisionSearchQuery.toLowerCase();
    const matches = allStateDivisions.filter(d => d.toLowerCase().includes(query));
    const nonMatches = allStateDivisions.filter(d => !d.toLowerCase().includes(query));
    return [...matches, ...nonMatches];
  }, [stateVal, divisionSearchQuery]);

  const mobileSortedDivisions = React.useMemo(() => {
    const allStateDivisions = stateVal !== 'All' ? (STATE_CITIES[stateVal] || []) : [];
    if (!mobileDivisionSearchQuery.trim()) {
      return allStateDivisions;
    }
    const query = mobileDivisionSearchQuery.toLowerCase();
    const matches = allStateDivisions.filter(d => d.toLowerCase().includes(query));
    const nonMatches = allStateDivisions.filter(d => !d.toLowerCase().includes(query));
    return [...matches, ...nonMatches];
  }, [stateVal, mobileDivisionSearchQuery]);

  // Apply filters and fetch tutors
  useEffect(() => {
    let active = true;

    const fetchFilteredTutors = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = {
          search: searchVal,
          subject: subjectVal,
          gradeClass: classVal,
          mode: modeVal,
          state: stateVal,
          division: divisionVal,
          maxPrice: maxPriceVal
        };
        const responseData = await tutorService.getTutors(filters);

        if (!active) return;

        // Ensure tutor data is parsed safely as an array
        let data = [];
        if (Array.isArray(responseData)) {
          data = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          data = responseData.data;
        } else if (responseData && Array.isArray(responseData.tutors)) {
          data = responseData.tutors;
        } else if (responseData) {
          data = typeof responseData === 'object' ? [responseData] : [];
        }

        // Filter out any potential invalid/null records
        data = data.filter(Boolean);

        if (userCoords) {
          data = data.map(tutor => {
            if (tutor && tutor.lat && tutor.lng) {
              const dist = calculateDistance(userCoords.lat, userCoords.lng, tutor.lat, tutor.lng);
              return { ...tutor, distance: dist };
            }
            return tutor;
          });
          // Sort closest first
          data.sort((a, b) => {
            if (!a || a.distance === undefined) return 1;
            if (!b || b.distance === undefined) return -1;
            return a.distance - b.distance;
          });
        }

        setTutors(data);
      } catch (err) {
        if (!active) return;
        console.error('Error fetching filtered tutors:', err);
        setError(err.message || 'Failed to fetch tutors. Please check your internet connection.');
        setTutors([]); // Safely fallback to empty array
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchFilteredTutors();

    return () => {
      active = false;
    };
  }, [searchVal, subjectVal, classVal, modeVal, stateVal, divisionVal, maxPriceVal, userCoords]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoLoading(false);
      },
      (error) => {
        console.error('Error fetching geolocation:', error);
        setGeoError('Unable to retrieve location. Please allow location access.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleStateChange = (stateName) => {
    const newParams = new URLSearchParams(searchParams);
    if (stateName === 'All' || stateName === '') {
      newParams.delete('state');
    } else {
      newParams.set('state', stateName);
    }
    newParams.delete('division'); // Reset division when state changes
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <>
      <SEO
        title="Find Tutors"
        description="Search qualified local tutors and online tutors. Filter by subject, grade level, city, pricing, and mode. Find the perfect fit today."
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Banner header */}
        <div className="mb-10 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Find the Perfect Private Tutor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Search verified tutors for home-visit classes and interactive online learning sessions.
          </p>
        </div>

        {/* Controls: Search, Location, View Mode Toggle */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input Bar */}
          <div className="relative flex items-center flex-1 bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800 rounded-2xl p-2 w-full max-w-2xl">
            <FaSearch className="text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Search by tutor name, qualification, or keywords..."
              value={searchVal}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full bg-transparent border-none text-slate-800 dark:text-slate-200 py-2 px-4 text-sm focus:outline-none focus:ring-0"
            />
            {searchVal && (
              <button
                onClick={() => updateParam('search', '')}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-2"
                aria-label="Clear search"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Action buttons (Proximity Search and Map Toggle) */}
          <div className="flex gap-3 items-center shrink-0">
            {/* Find Near Me Button */}
            <Button
              variant={userCoords ? "success" : "outline"}
              size="sm"
              onClick={handleGetLocation}
              disabled={geoLoading}
              className={`py-3 px-4 text-xs font-bold gap-1.5 transition-all rounded-xl ${
                userCoords 
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200/80 dark:border-emerald-900/50" 
                  : "border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FaLocationArrow className={`h-3 w-3 ${geoLoading ? 'animate-spin' : ''} ${userCoords ? 'text-emerald-500' : 'text-slate-400'}`} />
              {geoLoading ? (
                "Locating..."
              ) : userCoords ? (
                <span className="inline-flex items-center gap-1">
                  Location Active <span className="loader scale-pin"></span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  Find Near Me <span className="loader scale-pin"></span>
                </span>
              )}
            </Button>

            {/* List / Map view mode toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/20 dark:border-slate-850 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-primary dark:text-blue-450 shadow-sm font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <FaList className="h-3 w-3" /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-slate-900 text-primary dark:text-blue-450 shadow-sm font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <FaMap className="h-3 w-3" /> Map
              </button>
            </div>
          </div>
        </div>

        {geoError && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2 max-w-xl">
            <span>⚠️</span> {geoError}
            <button onClick={() => setGeoError(null)} className="ml-auto text-rose-400 hover:text-rose-650 bg-transparent border-none cursor-pointer">✕</button>
          </div>
        )}

        {/* Main Content Split: Filter Sidebar & Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-extrabold text-slate-850 dark:text-slate-250 flex items-center gap-2">
                <FaFilter className="h-3.5 w-3.5" /> Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-400 hover:text-primary hover:underline transition"
              >
                Reset All
              </button>
            </div>

            {/* Filter segments */}
            <div className="space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                  Subject
                </label>
                <select
                  value={subjectVal}
                  onChange={(e) => updateParam('subject', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="All">All Subjects</option>
                  {SUBJECTS.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Grade Class */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                  Class / Grade
                </label>
                <select
                  value={classVal}
                  onChange={(e) => updateParam('class', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="All">All Grades</option>
                  {CLASSES.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                  Teaching Mode
                </label>
                <select
                  value={modeVal}
                  onChange={(e) => updateParam('mode', e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="All">All Modes</option>
                  {MODES.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>
                        {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-2 uppercase tracking-wide">
                  State
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-xl py-2.5 px-3 text-sm text-left focus:outline-none focus:border-primary flex items-center justify-between shadow-sm"
                  >
                    <span className={stateVal !== 'All' ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
                      {stateVal !== 'All' ? stateVal : 'All States'}
                    </span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </button>

                  {isStateDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setIsStateDropdownOpen(false); setStateSearchQuery(''); }} />
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-2 max-h-72">
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
                          <input
                            type="text"
                            value={stateSearchQuery}
                            onChange={(e) => setStateSearchQuery(e.target.value)}
                            placeholder="Search state..."
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-0.5 max-h-48 pr-1 custom-scrollbar">
                          <button
                            type="button"
                            onClick={() => {
                              handleStateChange('All');
                              setIsStateDropdownOpen(false);
                              setStateSearchQuery('');
                            }}
                            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              stateVal === 'All'
                                ? 'bg-primary text-white dark:bg-blue-500'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            All States
                          </button>
                          {filteredStates.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                handleStateChange(s);
                                setIsStateDropdownOpen(false);
                                setStateSearchQuery('');
                              }}
                              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                stateVal === s
                                  ? 'bg-primary text-white dark:bg-blue-500'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Division */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 mb-2 uppercase tracking-wide">
                  Division
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={stateVal === 'All'}
                    onClick={() => setIsDivisionDropdownOpen(!isDivisionDropdownOpen)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-xl py-2.5 px-3 text-sm text-left focus:outline-none focus:border-primary flex items-center justify-between shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className={divisionVal !== 'All' ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
                      {divisionVal !== 'All' ? divisionVal : stateVal !== 'All' ? 'All Divisions' : 'Select state first'}
                    </span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </button>

                  {isDivisionDropdownOpen && stateVal !== 'All' && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setIsDivisionDropdownOpen(false); setDivisionSearchQuery(''); }} />
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-2 max-h-72">
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
                          <input
                            type="text"
                            value={divisionSearchQuery}
                            onChange={(e) => setDivisionSearchQuery(e.target.value)}
                            placeholder="Search division..."
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-0.5 max-h-48 pr-1 custom-scrollbar">
                          <button
                            type="button"
                            onClick={() => {
                              updateParam('division', 'All');
                              setIsDivisionDropdownOpen(false);
                              setDivisionSearchQuery('');
                            }}
                            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              divisionVal === 'All'
                                ? 'bg-primary text-white dark:bg-blue-500'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            All Divisions
                          </button>
                          {sortedDivisions.map((d, idx) => {
                            const isMatch = !divisionSearchQuery.trim() || d.toLowerCase().includes(divisionSearchQuery.toLowerCase());
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  updateParam('division', d);
                                  setIsDivisionDropdownOpen(false);
                                  setDivisionSearchQuery('');
                                }}
                                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-between ${
                                  divisionVal === d
                                    ? 'bg-primary text-white dark:bg-blue-500'
                                    : isMatch
                                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                                    : 'text-slate-400 dark:text-slate-505 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 opacity-65'
                                }`}
                              >
                                <span>{d}</span>
                                {divisionSearchQuery.trim() !== '' && isMatch && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold shrink-0">
                                    Match
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </aside>

          {/* Mobile Filter trigger buttons */}
          <div className="flex lg:hidden justify-between items-center mb-4 gap-4 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 py-3 text-xs gap-1.5"
              icon={<FaFilter className="h-3 w-3" />}
            >
              Filter Options
            </Button>
            {(searchVal || subjectVal !== 'All' || classVal !== 'All' || modeVal !== 'All' || stateVal !== 'All' || divisionVal !== 'All') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="py-3 text-xs gap-1"
                icon={<FaUndo className="h-3 w-3" />}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Tutors Listing Main Grid */}
          <main className="lg:col-span-3">
            {!loading && !error && Array.isArray(tutors) && tutors.length > 0 && (
              <div className="mb-6 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-205/60 dark:border-slate-800 rounded-2xl py-3.5 px-5 shadow-sm">
                <span className="text-sm font-extrabold text-slate-850 dark:text-slate-200">
                  {tutors.length} {tutors.length === 1 ? 'Active Tutor' : 'Active Tutors'} Found
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Showing verified profiles
                </span>
              </div>
            )}
            {error ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/20 rounded-3xl p-8 shadow-sm">
                <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Failed to Load Tutors
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                  {error}
                </p>
                <Button variant="primary" onClick={handleResetFilters}>
                  Reset Filters & Retry
                </Button>
              </div>
            ) : loading ? (
              <TutorListSkeleton count={6} />
            ) : !Array.isArray(tutors) || tutors.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-505 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUndo className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-2">
                  No Tutors Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any tutor profiles matching your current selection. Try resetting filters or searching with broader keywords.
                </p>
                <Button variant="primary" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : viewMode === 'map' ? (
              <TutorMap tutors={tutors} userCoords={userCoords} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor.id || tutor._id} tutor={tutor} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Filter overlays */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          {/* Drawer container */}
          <div className="relative w-80 max-w-full ml-auto bg-white dark:bg-[#0f172a] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10 border-l border-slate-100 dark:border-slate-800">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-850 dark:text-slate-205 flex items-center gap-2">
                  <FaFilter className="h-3.5 w-3.5" /> Filters
                </span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-slate-450 hover:text-slate-800 dark:hover:text-white focus:outline-none"
                  aria-label="Close filters"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Filters list */}
              <div className="space-y-5">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 mb-2 uppercase tracking-wide">
                    Subject
                  </label>
                  <select
                    value={subjectVal}
                    onChange={(e) => updateParam('subject', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-3 px-3 text-sm focus:outline-none"
                  >
                    <option value="All">All Subjects</option>
                    {SUBJECTS.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 mb-2 uppercase tracking-wide">
                    Class
                  </label>
                  <select
                    value={classVal}
                    onChange={(e) => updateParam('class', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-3 px-3 text-sm focus:outline-none"
                  >
                    <option value="All">All Grades</option>
                    {CLASSES.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 mb-2 uppercase tracking-wide">
                    Mode
                  </label>
                  <select
                    value={modeVal}
                    onChange={(e) => updateParam('mode', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-3 px-3 text-sm focus:outline-none"
                  >
                    <option value="All">All Modes</option>
                    {MODES.map((m, idx) => (
                      <option key={idx} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 mb-2 uppercase tracking-wide">
                    State
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMobileStateDropdownOpen(!isMobileStateDropdownOpen)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-3 px-3 text-sm text-left focus:outline-none flex items-center justify-between shadow-sm"
                    >
                      <span className={stateVal !== 'All' ? 'text-slate-850 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
                        {stateVal !== 'All' ? stateVal : 'All States'}
                      </span>
                      <span className="text-slate-400 text-xs">▼</span>
                    </button>

                    {isMobileStateDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setIsMobileStateDropdownOpen(false); setMobileStateSearchQuery(''); }} />
                        <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-2 max-h-72">
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
                            <input
                              type="text"
                              value={mobileStateSearchQuery}
                              onChange={(e) => setMobileStateSearchQuery(e.target.value)}
                              placeholder="Search state..."
                              autoFocus
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 space-y-0.5 max-h-48 pr-1 custom-scrollbar">
                            <button
                              type="button"
                              onClick={() => {
                                handleStateChange('All');
                                setIsMobileStateDropdownOpen(false);
                                setMobileStateSearchQuery('');
                              }}
                              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                stateVal === 'All'
                                  ? 'bg-primary text-white dark:bg-blue-500'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                              }`}
                            >
                              All States
                            </button>
                            {mobileFilteredStates.map((s, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  handleStateChange(s);
                                  setIsMobileStateDropdownOpen(false);
                                  setMobileStateSearchQuery('');
                                }}
                                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                  stateVal === s
                                    ? 'bg-primary text-white dark:bg-blue-500'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Division */}
                <div>
                  <label className="block text-xs font-bold text-slate-455 mb-2 uppercase tracking-wide">
                    Division
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={stateVal === 'All'}
                      onClick={() => setIsMobileDivisionDropdownOpen(!isMobileDivisionDropdownOpen)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-3 px-3 text-sm text-left focus:outline-none flex items-center justify-between shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className={divisionVal !== 'All' ? 'text-slate-850 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
                        {divisionVal !== 'All' ? divisionVal : stateVal !== 'All' ? 'All Divisions' : 'Select state first'}
                      </span>
                      <span className="text-slate-400 text-xs">▼</span>
                    </button>

                    {isMobileDivisionDropdownOpen && stateVal !== 'All' && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setIsMobileDivisionDropdownOpen(false); setMobileDivisionSearchQuery(''); }} />
                        <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-2 max-h-72">
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
                            <input
                              type="text"
                              value={mobileDivisionSearchQuery}
                              onChange={(e) => setMobileDivisionSearchQuery(e.target.value)}
                              placeholder="Search division..."
                              autoFocus
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 space-y-0.5 max-h-48 pr-1 custom-scrollbar">
                            <button
                              type="button"
                              onClick={() => {
                                updateParam('division', 'All');
                                setIsMobileDivisionDropdownOpen(false);
                                setMobileDivisionSearchQuery('');
                              }}
                              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                divisionVal === 'All'
                                  ? 'bg-primary text-white dark:bg-blue-500'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                              }`}
                            >
                              All Divisions
                            </button>
                            {mobileSortedDivisions.map((d, idx) => {
                              const isMatch = !mobileDivisionSearchQuery.trim() || d.toLowerCase().includes(mobileDivisionSearchQuery.toLowerCase());
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    updateParam('division', d);
                                    setIsMobileDivisionDropdownOpen(false);
                                    setMobileDivisionSearchQuery('');
                                  }}
                                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-between ${
                                    divisionVal === d
                                      ? 'bg-primary text-white dark:bg-blue-500'
                                      : isMatch
                                      ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                                      : 'text-slate-400 dark:text-slate-505 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 opacity-65'
                                  }`}
                                >
                                  <span>{d}</span>
                                  {mobileDivisionSearchQuery.trim() !== '' && isMatch && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold shrink-0">
                                      Match
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="primary"
                className="w-full py-3 font-semibold text-sm"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FindTutors;
