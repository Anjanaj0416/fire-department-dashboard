import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../config/config';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'An error occurred';
      
      if (error.response.status === 401) {
        // Unauthorized - clear auth data
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.STATION_DATA);
        window.location.href = '/login';
      }
      
      toast.error(message);
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API Methods

/**
 * Register a new fire station
 */
export const registerFireStation = async (data) => {
  const response = await api.post(API_ENDPOINTS.FIRE_REGISTER, data);
  return response.data;
};

/**
 * Login fire station
 */
export const loginFireStation = async (phone) => {
  const response = await api.post(API_ENDPOINTS.FIRE_LOGIN, { phone });
  return response.data;
};

/**
 * Get all fire stations
 */
export const getFireStations = async () => {
  const response = await api.get(API_ENDPOINTS.FIRE_STATIONS);
  return response.data;
};

/**
 * Update FCM token for the fire station
 */
export const updateFCMToken = async (stationId, fcmToken) => {
  const response = await api.put(API_ENDPOINTS.UPDATE_FCM_TOKEN, {
    stationId,
    fcmToken,
  });
  return response.data;
};

/**
 * Get all alerts for the station
 */
export const getAlerts = async () => {
  const response = await api.get(API_ENDPOINTS.ALERTS);
  return response.data;
};

/**
 * Get alert by ID
 */
export const getAlertById = async (alertId) => {
  const response = await api.get(API_ENDPOINTS.ALERT_BY_ID(alertId));
  return response.data;
};

/**
 * Update alert status
 */
export const updateAlertStatus = async (alertId, status) => {
  const response = await api.put(API_ENDPOINTS.ALERT_BY_ID(alertId), { status });
  return response.data;
};

export default api;