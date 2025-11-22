import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAlerts } from '../services/apiService';
import { onMessageListener } from '../services/firebaseService';
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

  // ✅ IMPROVED: Play alert sound - tries MP3, then WAV, then beep
  const playAlertSound = useCallback(() => {
    const trySound = async (url, name) => {
      try {
        const audio = new Audio(url);
        audio.volume = 0.8;
        await audio.play();
        console.log(`✅ ${name} sound played successfully`);
        return true;
      } catch (error) {
        console.error(`❌ ${name} failed:`, error.message);
        return false;
      }
    };

    const playSequence = async () => {
      console.log('🔊 Attempting to play alert sound...');
      
      // Try MP3 first
      if (await trySound('/alert-sound.mp3', 'MP3')) return;
      
      // Try WAV as backup
      if (await trySound('/alert-sound.wav', 'WAV')) return;
      
      // Use fallback beep
      console.log('🔔 Using fallback beep sound...');
      try {
        const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSF1xe/glEcNCVGn5O+zYhoGPJPY88p2KwUme8rx3I4+CRhvwu/mnUsQDlOq5vC2Yxw=');
        beep.volume = 0.8;
        await beep.play();
        console.log('✅ Fallback beep played');
      } catch (beepError) {
        console.error('❌ All sound methods failed:', beepError);
      }
    };

    playSequence();
  }, []);

  // Fetch alerts from backend
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAlerts();
      
      if (response.success && response.data) {
        const newAlerts = response.data;
        const previousAlertIds = alerts.map(a => a._id);
        
        // Check if there are any NEW alerts we haven't seen before
        const hasNewAlerts = newAlerts.some(alert => 
          !previousAlertIds.includes(alert._id) && alert.status === 'pending'
        );
        
        // If there are new pending alerts, play sound
        if (hasNewAlerts && alerts.length > 0) {
          console.log('🔔 New alert detected via polling!');
          playAlertSound();
        }
        
        setAlerts(newAlerts);
        
        // Count unread alerts (status: pending)
        const unread = newAlerts.filter((alert) => alert.status === 'pending').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [alerts, playAlertSound]);

  // Handle new alert from FCM
  const handleNewAlert = useCallback(
    (payload) => {
      console.log('🚨 New alert received:', payload);
      
      // Play alert sound
      playAlertSound();
      
      // Show toast notification
      toast.error('🚨 New Fire Emergency Alert!', {
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

  // ✅ NEW: Auto-refresh alerts every 5 seconds to detect new ones
  useEffect(() => {
    // Initial fetch
    fetchAlerts();
    
    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchAlerts();
    }, 10000); // Check every 5 seconds
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchAlerts]);

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