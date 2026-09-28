import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('noble_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setAdmin(data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('noble_admin_token', data.data.token);
    setToken(data.data.token);
    setAdmin({
      _id: data.data._id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role
    });
    return data.data;
  };

  const logout = () => {
    localStorage.removeItem('noble_admin_token');
    setToken(null);
    setAdmin(null);
  };

  const updateProfile = async (name, email) => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Profile update failed');
    }

    setAdmin((prev) => ({ ...prev, ...data.data }));
    return data.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, updateProfile, changePassword, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
