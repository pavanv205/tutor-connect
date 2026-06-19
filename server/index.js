const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
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

async function readTutors() {
  try {
    const raw = await fs.readFile(TUTORS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
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

app.post('/api/tutors/register', async (req, res) => {
  try {
    const payload = req.body || {};
    const tutors = await readTutors();
    const id = 'TUT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const created = {
      id,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    tutors.unshift(created);
    await writeTutors(tutors);
    res.json({ success: true, message: 'Registration application submitted! We will review your profile and contact you soon.', applicationId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to register tutor.' });
  }
});

app.listen(PORT, () => {
  console.log(`TutorConnect API listening on http://localhost:${PORT}`);
});
