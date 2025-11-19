import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getDirectionsUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AlertCard = ({ alert }) => {
  const navigate = useNavigate();
  const { station } = useAuth();

  const handleViewOnMap = () => {
    navigate(`/map/${alert._id}`);
  };

  const handleGetDirections = () => {
    console.log('🔍 Get Directions clicked');
    console.log('Station:', station);
    console.log('Alert:', alert);

    if (!station) {
      console.error('❌ No station data available');
      alert('Station information not available. Please log in again.');
      return;
    }

    if (!alert) {
      console.error('❌ No alert data available');
      alert('Alert information not available.');
      return;
    }

    // ✅ Get station coordinates - check multiple formats
    let stationLat, stationLng;
    if (station.location) {
      stationLat = station.location.lat;
      stationLng = station.location.lng;
    } else if (station.lat && station.lng) {
      stationLat = station.lat;
      stationLng = station.lng;
    }

    // ✅ Get alert coordinates - check multiple formats
    let userLat, userLng;
    if (alert.location) {
      userLat = alert.location.lat;
      userLng = alert.location.lng;
    } else if (alert.lat && alert.lng) {
      userLat = alert.lat;
      userLng = alert.lng;
    }

    console.log('📍 Extracted coordinates:', {
      station: { lat: stationLat, lng: stationLng },
      alert: { lat: userLat, lng: userLng }
    });

    // Validate coordinates
    if (!stationLat || !stationLng) {
      console.error('❌ Station coordinates missing:', station);
      alert('Station location not available. Please update your station profile.');
      return;
    }

    if (!userLat || !userLng) {
      console.error('❌ Alert coordinates missing:', alert);
      alert('Alert location not available.');
      return;
    }

    const directionsUrl = getDirectionsUrl(stationLat, stationLng, userLat, userLng);
    
    console.log('✅ Opening Google Maps:', directionsUrl);
    window.open(directionsUrl, '_blank');
  };

  // ✅ NEW: Handle phone call
  const handleCallUser = () => {
    const phoneNumber = alert.userPhone || alert.phone;
    
    if (!phoneNumber) {
      alert('User phone number not available');
      return;
    }

    console.log('📞 Calling user:', phoneNumber);
    // Open phone dialer
    window.location.href = `tel:${phoneNumber}`;
  };

  // Helper to get coordinates from alert
  const getAlertCoordinates = () => {
    if (alert.location) {
      return { lat: alert.location.lat, lng: alert.location.lng };
    }
    if (alert.lat && alert.lng) {
      return { lat: alert.lat, lng: alert.lng };
    }
    return null;
  };

  const coords = getAlertCoordinates();
  const userPhone = alert.userPhone || alert.phone;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-danger-500">
      {/* Alert Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-danger-100 rounded-full">
            <MapPin className="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Emergency Alert - Fire Assistance</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(alert.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            alert.status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : alert.status === 'acknowledged'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          Status: {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
        </span>
      </div>

      {/* Location Info */}
      {coords ? (
        <div className="mb-4 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Location Coordinates</h4>
          <p className="text-sm text-gray-900 font-mono">
            Lat: {coords.lat.toFixed(6)}
            <br />
            Lng: {coords.lng.toFixed(6)}
          </p>
          {alert.distance && (
            <p className="text-sm text-gray-600 mt-2">
              📍 {alert.distance.toFixed(2)} km from your station
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600">⚠️ Location coordinates unavailable</p>
        </div>
      )}

      {/* ✅ NEW: User Contact Info */}
      {userPhone && (
        <div className="mb-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-700 mb-2">Caller Information</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-semibold">Phone Number:</p>
              <p className="text-lg text-gray-900 font-mono">{userPhone}</p>
            </div>
            <button
              onClick={handleCallUser}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              title="Call User"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>
          </div>
        </div>
      )}

      {/* User ID (fallback if no phone) */}
      {alert.userId && !userPhone && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">User ID:</span> {alert.userId}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleViewOnMap}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <MapPin className="w-5 h-5" />
          <span>View on Map</span>
        </button>
        <button
          onClick={handleGetDirections}
          disabled={!coords}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 font-medium rounded-lg transition-colors ${
            coords
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span>Get Directions</span>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;