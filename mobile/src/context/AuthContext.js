import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import storage from '../utils/storage';
import api, { DEFAULT_API_URL, getDefaultApiUrl, getAutoDetectedHost } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState(getDefaultApiUrl());

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      const [savedToken, savedUser, savedUrl] = await Promise.all([
        storage.getItem('token'),
        storage.getItem('user'),
        storage.getItem('tms_api_url')
      ]);

      const currentDefault = getDefaultApiUrl();
      const detectedHost = getAutoDetectedHost();

      if (savedUrl) {
        // If saved URL is an old stale IP that doesn't match active detected host
        if (!savedUrl.includes(detectedHost) && (savedUrl.includes('10.') || savedUrl.includes('192.168.'))) {
          await storage.setItem('tms_api_url', currentDefault);
          setServerUrl(currentDefault);
        } else {
          setServerUrl(savedUrl);
        }
      } else {
        setServerUrl(currentDefault);
      }
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Failed to load initial auth state:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      await storage.setItem('token', receivedToken);
      await storage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async ({ username, password, email, phone }) => {
    try {
      // Regular user registration is always Role: User
      const res = await api.post('/auth/register', { username, password, email, phone, roleName: 'User' });
      const { token: receivedToken, user: receivedUser } = res.data;

      await storage.setItem('token', receivedToken);
      await storage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem('token');
      await storage.removeItem('user');
    } catch (err) {
      console.error('Logout storage clear error:', err);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateServerUrl = async (newUrl) => {
    let formatted = (newUrl || '').trim().replace(/\/+$/, '');
    if (formatted && !formatted.endsWith('/api')) {
      formatted += '/api';
    }
    await storage.setItem('tms_api_url', formatted);
    setServerUrl(formatted);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        serverUrl,
        updateServerUrl,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
