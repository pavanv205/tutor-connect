const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TUTORS_FILE = path.join(DATA_DIR, 'tutors.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure database directory and files exist
const initDb = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Seed default admin in fallback users.json if it doesn't exist
    try {
      await fs.access(USERS_FILE);
    } catch {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);
      
      const defaultAdmin = [{
        _id: 'mock-admin-id',
        name: 'System Admin',
        email: 'admin@tutorconnect.com',
        password: hashedPassword,
        role: 'Admin',
        createdAt: new Date().toISOString()
      }, {
        _id: 'mock-tutor-user-id',
        name: 'Anita Sharma',
        email: 'tutor_demo@tutorconnect.com',
        password: await bcrypt.hash('tutor123', salt),
        role: 'Tutor',
        tutorProfile: 'mock-tutor-profile-id',
        createdAt: new Date().toISOString()
      }];
      await fs.writeFile(USERS_FILE, JSON.stringify(defaultAdmin, null, 2), 'utf8');
    }

    try {
      await fs.access(TUTORS_FILE);
    } catch {
      // Seed default tutor profile
      const defaultTutor = [{
        _id: 'mock-tutor-profile-id',
        userId: 'mock-tutor-user-id',
        fullName: 'Anita Sharma',
        email: 'tutor_demo@tutorconnect.com',
        mobile: '9876543210',
        gender: 'Female',
        age: 28,
        qualification: 'M.Sc. in Physics',
        university: 'Delhi University',
        graduationYear: 2018,
        experience: 5,
        subjects: ['Physics', 'Mathematics'],
        classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
        teachingMode: 'Both',
        hourlyRate: 400,
        monthlyRate: 5000,
        streetAddress: 'Outer Ring Road, Marathahalli',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560037',
        bio: 'Dedicated physics and math tutor focused on building fundamental concepts.',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
        resumeUrl: '',
        isVerified: true,
        createdAt: new Date().toISOString()
      }];
      await fs.writeFile(TUTORS_FILE, JSON.stringify(defaultTutor, null, 2), 'utf8');
    }

    try {
      await fs.access(BOOKINGS_FILE);
    } catch {
      await fs.writeFile(BOOKINGS_FILE, '[]', 'utf8');
    }
  } catch (err) {
    console.error('Failed to initialize fallback file database:', err);
  }
};

// Initialize DB files
initDb();

const readJson = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
};

const writeJson = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = {
  // Users Fallback Methods
  getUsers: () => readJson(USERS_FILE),
  saveUser: async (user) => {
    const users = await readJson(USERS_FILE);
    users.push(user);
    await writeJson(USERS_FILE, users);
    return user;
  },
  
  // Tutors Fallback Methods
  getTutors: () => readJson(TUTORS_FILE),
  getTutorById: async (id) => {
    const tutors = await readJson(TUTORS_FILE);
    return tutors.find(t => t._id === id);
  },
  saveTutor: async (tutor) => {
    const tutors = await readJson(TUTORS_FILE);
    tutors.push(tutor);
    await writeJson(TUTORS_FILE, tutors);
    return tutor;
  },
  updateTutor: async (id, data) => {
    const tutors = await readJson(TUTORS_FILE);
    const idx = tutors.findIndex(t => t._id === id);
    if (idx === -1) return null;
    tutors[idx] = { ...tutors[idx], ...data };
    await writeJson(TUTORS_FILE, tutors);
    return tutors[idx];
  },
  deleteTutor: async (id) => {
    const tutors = await readJson(TUTORS_FILE);
    const filtered = tutors.filter(t => t._id !== id);
    await writeJson(TUTORS_FILE, filtered);
    return true;
  },

  // Bookings Fallback Methods
  getBookings: () => readJson(BOOKINGS_FILE),
  saveBooking: async (booking) => {
    const bookings = await readJson(BOOKINGS_FILE);
    bookings.push(booking);
    await writeJson(BOOKINGS_FILE, bookings);
    return booking;
  },
  updateBooking: async (id, data) => {
    const bookings = await readJson(BOOKINGS_FILE);
    const idx = bookings.findIndex(b => b._id === id);
    if (idx === -1) return null;
    bookings[idx] = { ...bookings[idx], ...data };
    await writeJson(BOOKINGS_FILE, bookings);
    return bookings[idx];
  }
};
