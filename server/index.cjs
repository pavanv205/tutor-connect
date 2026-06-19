const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const upload = multer();
const PORT = process.env.PORT || 5000; // default to 5000 to match VITE_API_URL
const DATA_DIR = path.join(__dirname, 'data');
const TUTORS_FILE = path.join(DATA_DIR, 'tutors.json');

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const CITY_COORDS = {
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 }
};

const SEED_COORDS = {
  '1': { lat: 12.9654, lng: 77.5852 }, // Bangalore - Anita Sharma
  '2': { lat: 19.0820, lng: 72.8885 }, // Mumbai - Rohit Patel
  '3': { lat: 28.6210, lng: 77.2152 }, // Delhi - Dr. Priya Deshmukh
  '4': { lat: 17.3910, lng: 78.4950 }, // Hyderabad - Sarah Jenkins
  '5': { lat: 12.9815, lng: 77.6056 }, // Bangalore - Vikram Sen
  '6': { lat: 19.0722, lng: 72.8732 }  // Mumbai - Amit Deshpande
};

const SEED_ADDRESSES = {
  '1': 'Flat 402, Lotus Heights Apartment, Outer Ring Road, Marathahalli Sector Three, Near Kalamandir Metro, Bangalore 560037',
  '2': 'Block C, Villa No 85, Windermere Society, Palm Beach Road, Vashi Sector Seventeen, Mumbai Maharashtra 400703',
  '3': 'House 142, Second Floor Extension, Double Storey Block A, Lajpat Nagar Phase Two, Delhi 110024',
  '4': 'Plot 58, Sunrise Enclave Colony, Jubilee Hills Road Number Ten, Opposite Hyderabad Public School, Hyderabad 500033',
  '5': 'Penthouse A, Skyline Towers, 80 Feet Road, Koramangala Block Four, Near Wipro Park Junction, Bangalore 560034',
  '6': 'Apartment 304, Sea Breeze Vista, Carter Road Bandra West, Near Joggers Park Promenade, Mumbai Maharashtra 400050'
};

function mockGeocode(city) {
  const normalized = String(city || 'Bangalore').toLowerCase().trim();
  const center = CITY_COORDS[normalized] || CITY_COORDS['bangalore'];
  // Generate random offset within ~5km
  const latOffset = (Math.random() - 0.5) * 0.08;
  const lngOffset = (Math.random() - 0.5) * 0.08;
  return {
    lat: Number((center.lat + latOffset).toFixed(6)),
    lng: Number((center.lng + lngOffset).toFixed(6))
  };
}

async function readTutors() {
  try {
    const raw = await fs.readFile(TUTORS_FILE, 'utf8');
    const tutors = JSON.parse(raw || '[]');
    let modified = false;
    const updatedTutors = tutors.map(t => {
      let updated = { ...t };
      let changed = false;
      if (updated.lat === undefined || updated.lng === undefined) {
        const coords = SEED_COORDS[t.id] || mockGeocode(t.city);
        updated = { ...updated, ...coords };
        changed = true;
      }
      if (updated.address === undefined) {
        updated.address = SEED_ADDRESSES[t.id] || 'Plot 404, Tech Park Boulevard Phase One, Near City Center Circle, Bangalore Karnataka 560001';
        changed = true;
      }
      if (updated.streetAddress === undefined) {
        updated.streetAddress = updated.address;
        changed = true;
      }
      if (changed) {
        modified = true;
      }
      return updated;
    });
    if (modified) {
      await writeTutors(updatedTutors);
    }
    return updatedTutors;
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeTutors(tutors) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TUTORS_FILE, JSON.stringify(tutors, null, 2), 'utf8');
}

// Basic filters helper
function applyFilters(list, filters) {
  const { search, subject, gradeClass, mode, city, maxPrice } = filters;
  let res = list;
  if (search) {
    const q = String(search).toLowerCase();
    res = res.filter(
      (t) =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.qualification && t.qualification.toLowerCase().includes(q)) ||
        (t.about && t.about.toLowerCase().includes(q)) ||
        (t.subjects || []).some((s) => s.toLowerCase().includes(q))
    );
  }
  if (subject && subject !== 'All') {
    res = res.filter((t) => (t.subjects || []).some((s) => s.toLowerCase() === String(subject).toLowerCase()));
  }
  if (gradeClass && gradeClass !== 'All') {
    res = res.filter((t) => (t.classes || []).some((c) => String(c).toLowerCase() === String(gradeClass).toLowerCase()));
  }
  if (mode && mode !== 'All') {
    res = res.filter((t) => (t.modes || []).some((m) => String(m).toLowerCase() === String(mode).toLowerCase()));
  }
  if (city && city !== 'All') {
    res = res.filter((t) => String(t.city).toLowerCase() === String(city).toLowerCase());
  }
  if (maxPrice) {
    res = res.filter((t) => Number(t.hourlyRate || 0) <= Number(maxPrice));
  }
  return res;
}

app.get('/api/tutors', async (req, res) => {
  try {
    const tutors = await readTutors();
    const filtered = applyFilters(tutors, req.query || {});
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to read tutors.' });
  }
});

app.get('/api/tutors/:id', async (req, res) => {
  try {
    const tutors = await readTutors();
    const t = tutors.find((x) => String(x.id) === String(req.params.id));
    if (!t) return res.status(404).json({ message: 'Tutor not found' });
    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to read tutor.' });
  }
});

app.put('/api/tutors/:id', async (req, res) => {
  try {
    const payload = req.body || {};
    const tutors = await readTutors();
    const idx = tutors.findIndex(t => String(t.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tutor not found' });

    tutors[idx] = { ...tutors[idx], ...payload };
    if (payload.streetAddress) {
      tutors[idx].address = payload.streetAddress;
    } else if (payload.address) {
      tutors[idx].streetAddress = payload.address;
    }

    await writeTutors(tutors);
    res.json({ success: true, data: tutors[idx] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update tutor' });
  }
});

// Helper to parse array fields if sent as JSON strings (multipart/form-data)
const parseIfJson = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return [val];
    }
  }
  if (typeof val === 'string') return [val];
  return val;
};

// Common tutor creator function to construct standardized Tutor objects
const createTutorObject = (data) => {
  const id = 'TUT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  const name = data.name || data.fullName || 'Anonymous Tutor';
  const qualification = data.qualification || data.degree || 'Verified Educator';
  const about = data.bio || data.about || 'No biography details provided.';
  const subjects = parseIfJson(data.subjects);
  const classes = parseIfJson(data.classes);
  
  let modes = [];
  if (data.modes) {
    modes = parseIfJson(data.modes);
  } else {
    const modeVal = data.teachingMode || 'Both';
    if (modeVal === 'Both') {
      modes = ['Online', 'Offline'];
    } else {
      modes = [modeVal];
    }
  }
  
  const city = data.city || 'Bangalore';
  const state = data.state || '';
  const coords = mockGeocode(city);
  const lat = data.lat ? Number(data.lat) : coords.lat;
  const lng = data.lng ? Number(data.lng) : coords.lng;
  const hourlyRate = Number(data.hourlyRate || data.feeRange || 500);
  const monthlyRate = Number(data.monthlyRate || 3000);
  const experience = Number(data.experienceYears || data.experience || 3);
  const photo = data.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
  
  return {
    id,
    name,
    qualification,
    about,
    subjects,
    classes,
    modes,
    gender: data.gender || '',
    age: data.age ? Number(data.age) : undefined,
    city,
    state,
    lat,
    lng,
    hourlyRate,
    monthlyRate,
    experience,
    photo,
    streetAddress: data.streetAddress || data.address,
    address: data.streetAddress || data.address,
    rating: 5.0,
    reviewsCount: 0,
    reviews: [],
    availability: ['Mon - Fri (4:00 PM - 7:00 PM)'],
    createdAt: new Date().toISOString()
  };
};

app.post('/api/tutors/register', upload.any(), async (req, res) => {
  try {
    const payload = req.body || {};
    const tutors = await readTutors();
    const created = createTutorObject(payload);
    tutors.unshift(created);
    await writeTutors(tutors);
    res.json({ success: true, message: 'Registration application submitted! We will review your profile and contact you soon.', applicationId: created.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to register tutor.' });
  }
});

// Since the frontend might send POST /tutors for multipart registration, let's handle that as well in this server
app.post('/api/tutors', upload.any(), async (req, res) => {
  try {
    const payload = req.body || {};
    const tutors = await readTutors();
    const created = createTutorObject(payload);
    tutors.unshift(created);
    await writeTutors(tutors);
    res.json({ success: true, message: 'Registration application submitted! We will review your profile and contact you soon.', applicationId: created.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to register tutor.' });
  }
});

app.listen(PORT, () => {
  console.log(`TutorConnect API listening on http://localhost:${PORT}`);
});
