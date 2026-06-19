import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TutorMap = ({ tutors, userCoords }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    // 1. Initialize map if it doesn't exist yet
    if (!mapInstanceRef.current) {
      // Create map instance
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Create a layer group for tutor markers
      const markersGroup = window.L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear previous markers
    markersGroup.clearLayers();

    const bounds = [];

    // 2. Plot User Location if available
    if (userCoords && userCoords.lat && userCoords.lng) {
      const userLatLng = [userCoords.lat, userCoords.lng];
      bounds.push(userLatLng);

      const pulsingIcon = window.L.divIcon({
        className: 'custom-pulsing-icon-wrapper',
        html: '<div class="pulsing-user-marker"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = window.L.marker(userLatLng, { icon: pulsingIcon });
      userMarker.bindPopup('<div class="text-xs font-bold text-center text-slate-800">You are here 📍</div>');
      markersGroup.addLayer(userMarker);
    }

    // 3. Plot Tutor Locations
    tutors.forEach((tutor) => {
      if (!tutor.lat || !tutor.lng) return;

      const tutorLatLng = [tutor.lat, tutor.lng];
      bounds.push(tutorLatLng);

      // Create a custom avatar icon for the tutor
      const avatarIcon = window.L.divIcon({
        className: 'custom-avatar-icon-wrapper',
        html: `
          <div class="tutor-avatar-marker">
            <img src="${tutor.photo}" alt="${tutor.name}" />
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      // Create marker and attach popup
      const marker = window.L.marker(tutorLatLng, { icon: avatarIcon });

      // Build beautiful popup HTML content
      const subjectsHtml = (tutor.subjects || [])
        .slice(0, 3)
        .map(sub => `<span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded text-[9px] font-bold border border-slate-200/50">${sub}</span>`)
        .join(' ');

      const distanceHtml = tutor.distance !== undefined
        ? `<div class="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
             <span>📍</span> ${Number(tutor.distance).toFixed(1)} km away
           </div>`
        : '';

      const popupHtml = `
        <div class="p-1 min-w-[200px] text-slate-800 font-sans">
          <div class="flex items-center gap-3 mb-2">
            <img src="${tutor.photo}" alt="${tutor.name}" class="h-10 w-10 rounded-lg object-cover border border-slate-200" />
            <div>
              <h4 class="font-extrabold text-[13px] m-0 text-slate-900 leading-tight">${tutor.name}</h4>
              <div class="flex items-center gap-1 text-[10px] mt-0.5 text-amber-500 font-bold">
                ★ ${tutor.rating || 'New'} <span class="text-slate-400 font-normal">(${tutor.reviewsCount || 0})</span>
              </div>
            </div>
          </div>
          <p class="text-[10px] text-slate-500 font-semibold m-0 leading-tight truncate">${tutor.qualification}</p>
          ${distanceHtml}
          <div class="flex flex-wrap gap-1 mt-2 mb-3">
            ${subjectsHtml}
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span class="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Rate</span>
              <span class="text-xs font-bold text-slate-900">₹${tutor.hourlyRate}/hr</span>
            </div>
            <button id="btn-profile-${tutor.id}" class="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition border-none cursor-pointer">
              Profile
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle navigate to profile on click of the popup button
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-profile-${tutor.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/tutors/${tutor.id}`);
          };
        }
      });

      markersGroup.addLayer(marker);
    });

    // 4. Center map view
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      // Fallback center: Bangalore
      map.setView([12.9716, 77.5946], 12);
    }
  }, [tutors, userCoords, navigate]);

  // Clean up Leaflet map instance on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm z-10">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '100%' }} />
    </div>
  );
};

export default TutorMap;
