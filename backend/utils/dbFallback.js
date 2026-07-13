const bcrypt = require('bcryptjs');

const memoryBookings = [];
const memoryTutors = [];
const memoryUsers = [];
const memoryNotifications = [];

// Seed default users in memory (matching seed.js logic)
const initializeSeeds = () => {
  const adminPasswordHash = bcrypt.hashSync('adminpassword123', 10);
  const tutorPasswordHash = bcrypt.hashSync('tutor123', 10);
  const studentPasswordHash = bcrypt.hashSync('student123', 10);

  const defaultAdmin = {
    _id: '6a3956421c7fc8576e26c6aa',
    name: 'System Admin',
    email: 'admin@hometutorx.com',
    password: adminPasswordHash,
    role: 'Admin',
    createdAt: new Date().toISOString()
  };

  const defaultTutorProfileId = '6a3956421c7fc8576e26c6ad';
  const defaultTutorUser = {
    _id: '6a3956421c7fc8576e26c6ab',
    name: 'Default Tutor',
    email: 'tutor@hometutorx.com',
    password: tutorPasswordHash,
    role: 'Tutor',
    tutorProfile: defaultTutorProfileId,
    createdAt: new Date().toISOString()
  };

  const defaultStudentUser = {
    _id: '6a3956421c7fc8576e26c6ac',
    name: 'Default Student',
    email: 'student@hometutorx.com',
    password: studentPasswordHash,
    role: 'Student',
    phone: '9876543222',
    createdAt: new Date().toISOString()
  };

  const defaultTutorProfile = {
    _id: defaultTutorProfileId,
    userId: '6a3956421c7fc8576e26c6ab',
    fullName: 'Default Tutor',
    mobile: '9876543210',
    email: 'tutor@hometutorx.com',
    gender: 'Male',
    age: 30,
    qualification: 'M.Sc. Physics',
    university: 'Stanford University',
    graduationYear: 2018,
    experience: 5,
    subjects: ['Mathematics', 'Physics'],
    classes: ['Class 9-10', 'Class 11-12'],
    teachingMode: 'Both',
    hourlyRate: 50,
    monthlyRate: 8000,
    streetAddress: 'Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    lat: 17.4483,
    lng: 78.3741,
    bio: 'Passionate mathematics and physics tutor with 5+ years of experience helping students achieve academic excellence.',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    resumeUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    isVerified: true,
    paymentStatus: 'Paid',
    leadsCount: 12,
    viewsCount: 142,
    ownReferralCode: 'HT123456',
    createdAt: new Date().toISOString()
  };

  memoryUsers.push(defaultAdmin, defaultTutorUser, defaultStudentUser);
  memoryTutors.push(defaultTutorProfile);
};

initializeSeeds();

exports.getUsers = async () => memoryUsers;
exports.saveUser = async (user) => {
  memoryUsers.push(user);
  return user;
};
exports.getTutors = async () => memoryTutors;
exports.saveTutor = async (tutor) => {
  memoryTutors.push(tutor);
  return tutor;
};
exports.getBookings = async () => memoryBookings;
exports.saveBooking = async (booking) => {
  memoryBookings.push(booking);
  return booking;
};
exports.updateBooking = async (id, updatedBooking) => {
  const idx = memoryBookings.findIndex(b => String(b._id) === String(id));
  if (idx !== -1) {
    memoryBookings[idx] = { ...memoryBookings[idx], ...updatedBooking };
    return memoryBookings[idx];
  }
  return updatedBooking;
};
exports.updateTutor = async (id, updatedTutor) => {
  const idx = memoryTutors.findIndex(t => String(t._id) === String(id));
  if (idx !== -1) {
    memoryTutors[idx] = { ...memoryTutors[idx], ...updatedTutor };
    return memoryTutors[idx];
  }
  return updatedTutor;
};

exports.getTutorById = async (id) => {
  return memoryTutors.find(t => String(t._id) === String(id));
};

exports.deleteUser = async (userId) => {
  const idx = memoryUsers.findIndex(u => String(u._id) === String(userId));
  if (idx !== -1) {
    memoryUsers.splice(idx, 1);
  }
};

exports.deleteBookingsForTutor = async (tutorId) => {
  let i = memoryBookings.length;
  while (i--) {
    if (String(memoryBookings[i].assignedTutor) === String(tutorId)) {
      memoryBookings.splice(i, 1);
    }
  }
};

exports.deleteTutor = async (tutorId) => {
  const idx = memoryTutors.findIndex(t => String(t._id) === String(tutorId));
  if (idx !== -1) {
    memoryTutors.splice(idx, 1);
  }
};

exports.deleteBooking = async (id) => {
  const idx = memoryBookings.findIndex(b => String(b._id) === String(id));
  if (idx !== -1) {
    memoryBookings.splice(idx, 1);
    return true;
  }
  return false;
};

exports.getNotifications = async () => memoryNotifications;
exports.saveNotification = async (notification) => {
  memoryNotifications.push(notification);
  return notification;
};
exports.markNotificationAsRead = async (id) => {
  const notification = memoryNotifications.find(n => String(n._id) === String(id));
  if (notification) {
    notification.isRead = true;
  }
  return notification;
};
exports.markAllNotificationsAsRead = async (recipientId) => {
  memoryNotifications.forEach(n => {
    if (String(n.recipient) === String(recipientId)) {
      n.isRead = true;
    }
  });
};

exports.addPushSubscription = async (userId, subscription) => {
  const user = memoryUsers.find(u => String(u._id) === String(userId));
  if (user) {
    if (!user.pushSubscriptions) {
      user.pushSubscriptions = [];
    }
    const exists = user.pushSubscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(subscription);
    }
  }
  return user;
};

