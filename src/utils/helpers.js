/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time to readable string
 */
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Extract coordinates from Google Maps link - IMPROVED VERSION
 * Supports multiple Google Maps URL formats
 */
export const extractCoordinatesFromLink = (link) => {
  try {
    if (!link) return null;

    // Method 1: Check for @ coordinates (most common)
    // Example: https://www.google.com/maps/place/fire+Station/@7.0675882,79.9597962,17z
    const atMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2]),
      };
    }

    // Method 2: Check for ?q= parameter
    // Example: https://maps.google.com/?q=7.0675882,79.9597962
    const qMatch = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return {
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2]),
      };
    }

    // Method 3: Check for /place/ with coordinates
    const placeMatch = link.match(/\/place\/[^/]+\/@?(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (placeMatch) {
      return {
        lat: parseFloat(placeMatch[1]),
        lng: parseFloat(placeMatch[2]),
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return null;
  }
};

/**
 * Validate phone number (Sri Lankan format)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(?:\+94|0)?[1-9]\d{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: 077 123 4567
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Validate Google Maps link - IMPROVED VERSION
 * Now actually checks if coordinates can be extracted
 */
export const validateGoogleMapsLink = (link) => {
  if (!link) return false;
  
  // Check if it's a Google Maps URL
  const isGoogleMapsUrl = 
    link.includes('google.com/maps') || 
    link.includes('maps.google.com') ||
    link.includes('maps.app.goo.gl') ||
    link.includes('goo.gl/maps');
  
  if (!isGoogleMapsUrl) return false;
  
  // Try to extract coordinates
  const coords = extractCoordinatesFromLink(link);
  
  // Return true if coordinates were successfully extracted
  return coords !== null && coords.lat !== null && coords.lng !== null;
};

/**
 * Get validation feedback for Google Maps link
 * Returns object with isValid boolean and message string
 */
export const getGoogleMapsLinkFeedback = (link) => {
  if (!link || link.trim() === '') {
    return {
      isValid: false,
      type: 'info',
      message: 'Paste your Google Maps share link here'
    };
  }

  // Check if it looks like a Google Maps URL
  const isGoogleMapsUrl = 
    link.includes('google.com/maps') || 
    link.includes('maps.google.com') ||
    link.includes('maps.app.goo.gl') ||
    link.includes('goo.gl/maps');

  if (!isGoogleMapsUrl) {
    return {
      isValid: false,
      type: 'error',
      message: 'This doesn\'t look like a Google Maps link. Please use a link from Google Maps.'
    };
  }

  // Try to extract coordinates
  const coords = extractCoordinatesFromLink(link);

  if (!coords) {
    return {
      isValid: false,
      type: 'warning',
      message: 'Could not extract coordinates from this link. Make sure it includes location coordinates (like @7.067,79.959).'
    };
  }

  // Validate coordinates are in Sri Lanka (approximately)
  if (coords.lat < 5.9 || coords.lat > 10.0 || coords.lng < 79.0 || coords.lng > 82.0) {
    return {
      isValid: false,
      type: 'warning',
      message: `Coordinates (${coords.lat}, ${coords.lng}) seem to be outside Sri Lanka. Please verify the location.`
    };
  }

  // All checks passed!
  return {
    isValid: true,
    type: 'success',
    message: `✓ Valid location: ${coords.lat}, ${coords.lng}`,
    coordinates: coords
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance.toFixed(2);
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get directions URL for Google Maps
 */
export const getDirectionsUrl = (fromLat, fromLng, toLat, toLng) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=driving`;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};