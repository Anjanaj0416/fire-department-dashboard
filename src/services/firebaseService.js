import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig, VAPID_KEY } from '../config/config';
import toast from 'react-hot-toast';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Request permission for notifications and get FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      toast.error('Please enable notifications to receive alerts');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    toast.error('Failed to get notification permission');
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    
    // Call the callback with the payload
    if (callback) {
      callback(payload);
    }
    
    // Show browser notification
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/fire-icon.svg',
          badge: '/fire-icon.svg',
          tag: 'rapidaid-alert',
          requireInteraction: true,
        });
      }
    }
  });
};

export default messaging;