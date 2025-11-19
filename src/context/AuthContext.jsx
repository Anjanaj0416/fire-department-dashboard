import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/config';
import { loginFireStation, registerFireStation, updateFCMToken } from '../services/apiService';
import { requestNotificationPermission } from '../services/firebaseService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const stationData = localStorage.getItem(STORAGE_KEYS.STATION_DATA);
      
      console.log('Checking auth on mount:', { hasToken: !!token, hasStation: !!stationData });
      
      if (token && stationData) {
        try {
          const parsed = JSON.parse(stationData);
          setStation(parsed);
          console.log('Auth restored from localStorage:', parsed);
        } catch (error) {
          console.error('Error parsing station data:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register new  station
  const register = async (formData) => {
    try {
      setLoading(true);
      const response = await registerFireStation(formData);
      
      console.log('Registration response:', response);
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        return true;
      }
      
      toast.error(response.error || 'Registration failed');
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login  station - IMPROVED WITH BETTER ERROR HANDLING
  const login = async (phone) => {
    try {
      setLoading(true);
      const response = await loginFireStation(phone);
      
      console.log('Login response:', response);
      
      // Access response directly (not response.data)
      if (response.success && response.token && response.data) {
      const { data: stationData, token } = response;
        
        console.log('Login successful, saving data:', { stationData, token: token.substring(0, 20) + '...' });
        
        // IMPORTANT: Save to localStorage FIRST
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.STATION_DATA, JSON.stringify(stationData));
        
        // Then update state
        setStation(stationData);
        console.log('Station state updated:', stationData);
        
        // Handle FCM in background - DON'T let it block login
        handleFCMToken(stationData.id).catch(err => {
          console.warn('FCM setup failed (non-critical):', err);
        });
        
        toast.success(`Welcome, ${stationData.stationName}!`);
        
        // IMPORTANT: Set loading to false BEFORE returning
        setLoading(false);
        
        return true;
      }
      
      setLoading(false);
      toast.error(response.error || 'Login failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Handle FCM token separately - non-blocking
  const handleFCMToken = async (stationId) => {
    try {
      console.log('Requesting notification permission...');
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        console.log('FCM token received, updating...');
        localStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
        await updateFCMToken(stationId, fcmToken);
        console.log('FCM token updated successfully');
      } else {
        console.warn('No FCM token received');
      }
    } catch (fcmError) {
      // Don't fail login if FCM fails
      console.warn('FCM token setup failed:', fcmError.message);
    }
  };

  // Logout
  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.STATION_DATA);
    localStorage.removeItem(STORAGE_KEYS.FCM_TOKEN);
    setStation(null);
    toast.success('Logged out successfully');
  };

  const value = {
    station,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!station,
  };

  console.log('AuthContext value:', { 
    hasStation: !!station, 
    loading, 
    isAuthenticated: !!station 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};