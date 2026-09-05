import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('dealflow360_token');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('dealflow360_token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    try {
      const res = await axios.post('/api/auth/signup', formData);
      if (res.data.token) {
        localStorage.setItem('dealflow360_token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      setUser(res.data.user);
      showToast(`Account created! Welcome to DEALFLOW360, ${res.data.user.name}`, 'success');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error || 'Signup failed', 'error');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('dealflow360_token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      setUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error || 'Login failed', 'error');
      return false;
    }
  };

  const demoLogin = async (role) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/demo-login', { role });
      if (res.data.token) {
        localStorage.setItem('dealflow360_token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      setUser(res.data.user);
      showToast(`Switched to Role: ${role.replace('_', ' ')} (${res.data.user.name})`, 'success');
    } catch (err) {
      const mockUsers = {
        CLIENT: { id: 'u1', name: 'Acme Procurement (Client)', email: 'client@acme.com', role: 'CLIENT', company: 'Acme Industries' },
        SALES_REP: { id: 'u2', name: 'Rahul Sharma (Sales Rep)', email: 'sales@dealflow.com', role: 'SALES_REP', company: 'DealFlow360', discountAuthority: 10 },
        SALES_MANAGER: { id: 'u4', name: 'Mr. Shah (Sales Manager)', email: 'manager@dealflow.com', role: 'SALES_MANAGER', company: 'DealFlow360' },
        FINANCE: { id: 'u5', name: 'R. Iyer (Finance)', email: 'finance@dealflow.com', role: 'FINANCE', company: 'DealFlow360' },
        FACTORY: { id: 'u6', name: 'Main Factory Ops', email: 'factory@dealflow.com', role: 'FACTORY', company: 'DealFlow360' },
        ADMIN: { id: 'u7', name: 'System Admin', email: 'admin@dealflow.com', role: 'ADMIN', company: 'DealFlow360' }
      };
      setUser(mockUsers[role] || mockUsers.SALES_REP);
      showToast(`Switched to Demo Role: ${role}`, 'info');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {}
    localStorage.removeItem('dealflow360_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    showToast('Logged out.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, demoLogin, logout, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
