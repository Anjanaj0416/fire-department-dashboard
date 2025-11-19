import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAlerts } from '../services/apiService';
import { onMessageListener } from '../services/firebaseService';
import { ALERT_SOUND_URL } from '../config/config';
import toast from 'react-hot-toast';

const AlertContext = createContext(null);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [audio] = useState(new Audio(ALERT_SOUND_URL));

  // Play alert sound
  const playAlertSound = useCallback(() => {
    audio.play().catch((error) => {
      console.error('Error playing alert sound:', error);
    });
  }, [audio]);

  // Fetch alerts from backend
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAlerts();
      
      if (response.success && response.data) {
        setAlerts(response.data);
        
        // Count unread alerts (status: pending)
        const unread = response.data.filter((alert) => alert.status === 'pending').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new alert from FCM
  const handleNewAlert = useCallback(
    (payload) => {
      console.log('New alert received:', payload);
      
      // Play alert sound
      playAlertSound();
      
      // Show toast notification
      toast.error('🚨 New Emergency Alert!', {
        duration: 5000,
        style: {
          background: '#dc2626',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
      
      // Add alert to list
      if (payload.data) {
        const newAlert = {
          _id: payload.data.alertId || Date.now().toString(),
          type: payload.data.type || 'fire',
          location: {
            lat: parseFloat(payload.data.lat),
            lng: parseFloat(payload.data.lng),
          },
          status: 'pending',
          createdAt: payload.data.timestamp || new Date().toISOString(),
        };
        
        setAlerts((prev) => [newAlert, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
      
      // Fetch latest alerts from backend
      fetchAlerts();
    },
    [fetchAlerts, playAlertSound]
  );

  // Listen for FCM messages
  useEffect(() => {
    onMessageListener(handleNewAlert);
  }, [handleNewAlert]);

  // Mark alert as read
  const markAsRead = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert._id === alertId ? { ...alert, status: 'acknowledged' } : alert
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  const value = {
    alerts,
    loading,
    unreadCount,
    fetchAlerts,
    markAsRead,
    clearAlerts,
    playAlertSound,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};