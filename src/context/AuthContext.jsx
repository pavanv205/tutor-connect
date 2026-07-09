import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logout action (declared early to prevent TDZ errors in useEffect)
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Load user data on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.success) {
          setUser(res.data.data);
        } else {
          // Token invalid, clear it
          logout();
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login action
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        if (res.data.requireOtp) {
          return res.data;
        }
        const { token: userToken, user: userData } = res.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      const errMsg = err.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  // Register tutor action (multipart form data)
  const registerTutor = async (formData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  // Register student action
  const registerStudent = async (studentData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register-student', studentData);
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  // Renew subscription action
  const renewSubscription = async (paymentData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/renew-subscription', paymentData);
      if (res.data && res.data.success) {
        setUser(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      const errMsg = err.message || 'Renewal failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    logout,
    registerTutor,
    registerStudent,
    renewSubscription,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
