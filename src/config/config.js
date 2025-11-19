// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase Cloud Messaging VAPID Key
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Alert Sound URL
export const ALERT_SOUND_URL = '/alert-sound.mp3';

// App Constants
export const APP_NAME = 'RapidAid Fire Department Dashboard';
export const APP_VERSION = '1.0.0';

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'rapidaid_fire_auth_token',
  STATION_DATA: 'rapidaid_fire_station_data',
  FCM_TOKEN: 'rapidaid_fire_fcm_token',
};

// ✅ FIXED: API Endpoints for Fire Department
export const API_ENDPOINTS = {
  FIRE_LOGIN: '/fire/login',
  FIRE_REGISTER: '/fire/register',
  FIRE_STATIONS: '/fire/stations',
  UPDATE_FCM_TOKEN: '/fire/update-token',
  FIRE_ALERTS: '/alerts?type=fire',  // ✅ FIXED: Filter by type=fire
  ALERT_BY_ID: (id) => `/alerts/${id}`,
  UPDATE_ALERT_STATUS: (id) => `/alerts/${id}/status`,
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 6.9271, lng: 79.8612 },
  DEFAULT_ZOOM: 12,
  STATION_MARKER_COLOR: '#dc2626',  // Red for fire stations
  ALERT_MARKER_COLOR: '#ff6b00',     // Orange for fire alerts
};