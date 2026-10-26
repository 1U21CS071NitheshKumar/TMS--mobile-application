import axios from 'axios';
import storage from '../utils/storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Current active LAN IP of the host machine
export const ACTIVE_LAN_IP = '10.44.187.140';

export const getAutoDetectedHost = () => {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
    }
    // 1. Try Expo Constants hostUri (e.g. "10.44.187.140:8081")
    const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoGo?.debuggerHost || Constants?.manifest?.debuggerHost;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return host;
      }
    }
    // 2. Try NativeModules scriptURL
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch {
    // Fall back to active host IP
  }
  return ACTIVE_LAN_IP;
};

export const getDefaultApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  const host = getAutoDetectedHost();
  return `http://${host}:5000/api`;
};

export const DEFAULT_API_URL = getDefaultApiUrl();

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 10000,
});

// Configure dynamic baseURL from storage if customized
export const getBaseURL = async () => {
  try {
    let saved = await storage.getItem('tms_api_url');
    const autoDefault = getDefaultApiUrl();
    const detectedHost = getAutoDetectedHost();

    // Auto-migrate stale IPs (e.g. old IPs that no longer match the current active host)
    if (saved && !saved.includes(detectedHost) && (saved.includes('10.') || saved.includes('192.168.'))) {
      saved = autoDefault;
      await storage.setItem('tms_api_url', autoDefault);
    }
    return saved || autoDefault;
  } catch {
    return getDefaultApiUrl();
  }
};

api.interceptors.request.use(async (config) => {
  try {
    const autoDefault = getDefaultApiUrl();
    const detectedHost = getAutoDetectedHost();
    let customUrl = await storage.getItem('tms_api_url');

    // Auto-migrate stale outdated IPs
    if (customUrl && !customUrl.includes(detectedHost) && (customUrl.includes('10.') || customUrl.includes('192.168.'))) {
      customUrl = autoDefault;
      await storage.setItem('tms_api_url', autoDefault);
    }

    if (customUrl) {
      customUrl = customUrl.trim().replace(/\/+$/, '');
      if (!customUrl.endsWith('/api')) {
        customUrl += '/api';
      }
      config.baseURL = customUrl;
    } else {
      config.baseURL = autoDefault;
    }

    const token = await storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Silent recovery so network requests proceed with default baseURL
  }
  return config;
});

// Auto-recovery: If request fails due to Network Error, retry against ACTIVE_LAN_IP
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.message === 'Network Error' || !error.response) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const fallbackUrl = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${ACTIVE_LAN_IP}:5000/api`;
      if (originalRequest.baseURL !== fallbackUrl) {
        originalRequest.baseURL = fallbackUrl;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
