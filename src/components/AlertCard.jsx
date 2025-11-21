import { MapPin, Navigation, Clock, Phone, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getDirectionsUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AlertCard = ({ alert: alertData, dashboardType = 'fire' }) => {  // ✅ Added dashboardType prop
  const navigate = useNavigate();
  const { healthCenter } = useAuth();

  // ✅ Dashboard-specific colors
  const colors = {
    police: {
      border: 'border-blue-500',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: 'text-blue-600',
      badge: 'bg-blue-50 text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    fire: {
      border: 'border-red-500',
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600',
      badge: 'bg-red-50 text-red-700',
      button: 'bg-red-600 hover:bg-red-700'
    },
    health: {
      border: 'border-green-500',
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: 'text-green-600',
      badge: 'bg-green-50 text-green-700',
      button: 'bg-green-600 hover:bg-green-700'
    }
  };

  const colorScheme = colors[dashboardType] || colors.health;

  // ✅ Dashboard-specific titles
  const titles = {
    police: 'Emergency Alert - Police Assistance',
    fire: 'Fire Emergency - Immediate Response Required',
    health: 'Medical Emergency - Health Assistance'
  };

  const handleViewOnMap = () => {
    navigate(`/map/${alertData._id}`);
  };

  const handleGetDirections = () => {
    console.log('🗺️ Get Directions clicked');
    console.log('Health Center:', healthCenter);
    console.log('Alert:', alertData);

    if (!healthCenter) {
      console.error('❌ No health center data available');
      window.alert('Health center information not available. Please log in again.');
      return;
    }

    if (!alertData) {
      console.error('❌ No alert data available');
      window.alert('Alert information not available.');
      return;
    }

    // Get health center coordinates
    let stationLat, stationLng;
    if (healthCenter.location) {
      stationLat = healthCenter.location.lat;
      stationLng = healthCenter.location.lng;
    } else if (healthCenter.lat && healthCenter.lng) {
      stationLat = healthCenter.lat;
      stationLng = healthCenter.lng;
    }

    // Get alert coordinates
    let userLat, userLng;
    if (alertData.location) {
      userLat = alertData.location.lat;
      userLng = alertData.location.lng;
    } else if (alertData.lat && alertData.lng) {
      userLat = alertData.lat;
      userLng = alertData.lng;
    }

    console.log('📍 Extracted coordinates:', {
      healthCenter: { lat: stationLat, lng: stationLng },
      alert: { lat: userLat, lng: userLng }
    });

    if (!stationLat || !stationLng) {
      console.error('❌ Health center coordinates missing:', healthCenter);
      window.alert('Health center location not available. Please update your profile.');
      return;
    }

    if (!userLat || !userLng) {
      console.error('❌ Alert coordinates missing:', alertData);
      window.alert('Alert location not available.');
      return;
    }

    const directionsUrl = getDirectionsUrl(stationLat, stationLng, userLat, userLng);

    console.log('✅ Opening Google Maps:', directionsUrl);
    window.open(directionsUrl, '_blank');
  };

  const handleCallUser = () => {
    const phoneNumber = alertData.userPhone || alertData.phone;

    if (!phoneNumber) {
      window.alert('User phone number not available');
      return;
    }

    console.log('📞 Calling user:', phoneNumber);
    window.location.href = `tel:${phoneNumber}`;
  };

  // Helper to get coordinates from alert
  const getAlertCoordinates = () => {
    if (alertData.location) {
      return { lat: alertData.location.lat, lng: alertData.location.lng };
    }
    if (alertData.lat && alertData.lng) {
      return { lat: alertData.lat, lng: alertData.lng };
    }
    return null;
  };

  const coords = getAlertCoordinates();
  const userPhone = alertData.userPhone || alertData.phone;
  const reportCount = alertData.reportCount || 1;  // ✅ Get report count

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${colorScheme.border}`}>
      {/* Alert Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${colorScheme.bg} rounded-full`}>
            <MapPin className={`w-6 h-6 ${colorScheme.icon}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{titles[dashboardType]}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(alertData.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${alertData.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : alertData.status === 'acknowledged'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}
          >
            Status: {alertData.status.charAt(0).toUpperCase() + alertData.status.slice(1)}
          </span>

          {/* ✅ NEW: Report Count Badge */}
          {reportCount > 1 && (
            <div className={`flex items-center space-x-1 px-3 py-1 ${colorScheme.badge} rounded-full`}>
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold">
                {reportCount} {reportCount === 1 ? 'person' : 'people'} reported this
              </span>
            </div>
          )}
        </div>
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
          {alertData.distance && (
            <p className="text-sm text-gray-600 mt-2">
              📍 {alertData.distance.toFixed(2)} km from your health center
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600">⚠️ Location coordinates unavailable</p>
        </div>
      )}

      {/* User Contact Info */}
      {userPhone && (
        <div className={`mb-4 ${colorScheme.bg} rounded-lg p-4 border ${colorScheme.border}`}>
          <h4 className={`text-sm font-semibold ${colorScheme.text} mb-2`}>Patient Information</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-semibold">Phone Number:</p>
              <p className="text-lg text-gray-900 font-mono">{userPhone}</p>
            </div>
            <button
              onClick={handleCallUser}
              className={`flex items-center space-x-2 px-4 py-2 ${colorScheme.button} text-white font-medium rounded-lg transition-colors`}
              title="Call Patient"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>
          </div>
        </div>
      )}

      {/* ✅ NEW: Multiple Reporters Info */}
      {reportCount > 1 && alertData.reporters && alertData.reporters.length > 1 && (
        <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            All Reporters ({reportCount})
          </h4>
          <div className="space-y-2">
            {alertData.reporters.map((reporter, index) => (
              <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                <span className="text-gray-600">Reporter {index + 1}</span>
                {reporter.userPhone && (
                  <a
                    href={`tel:${reporter.userPhone}`}
                    className={`${colorScheme.text} font-mono font-semibold hover:underline`}
                  >
                    {reporter.userPhone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User ID (fallback if no phone) */}
      {alertData.userId && !userPhone && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">User ID:</span> {alertData.userId}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleViewOnMap}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 ${colorScheme.button} text-white font-medium rounded-lg transition-colors`}
        >
          <MapPin className="w-5 h-5" />
          <span>View on Map</span>
        </button>
        <button
          onClick={handleGetDirections}
          disabled={!coords}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 font-medium rounded-lg transition-colors ${coords
              ? 'bg-gray-900 hover:bg-gray-800 text-white'
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