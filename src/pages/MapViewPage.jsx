import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin, Clock, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Map from '../components/Map';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import { formatDate, getDirectionsUrl, calculateDistance } from '../utils/helpers';
import toast from 'react-hot-toast';

const MapViewPage = () => {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const { station } = useAuth();
  const { alerts } = useAlerts();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 MapViewPage - Looking for alert:', alertId);
    console.log('Available alerts:', alerts);
    console.log('Station data:', station);

    // Find the alert from the alerts context
    const foundAlert = alerts.find((a) => a._id === alertId);
    if (foundAlert) {
      console.log('✅ Found alert:', foundAlert);
      setAlert(foundAlert);
      setLoading(false);
    } else {
      console.error('❌ Alert not found:', alertId);
      toast.error('Alert not found');
      setLoading(false);
    }
  }, [alertId, alerts, station]);

  const handleGetDirections = () => {
    console.log('🔍 Get Directions clicked from MapView');
    console.log('Station:', station);
    console.log('Alert:', alert);

    if (!station) {
      console.error('❌ No station data');
      toast.error('Station information not available');
      return;
    }

    if (!alert) {
      console.error('❌ No alert data');
      toast.error('Alert information not available');
      return;
    }

    // ✅ Get station coordinates - support multiple formats
    let stationLat, stationLng;
    if (station.location) {
      stationLat = station.location.lat;
      stationLng = station.location.lng;
    } else if (station.lat && station.lng) {
      stationLat = station.lat;
      stationLng = station.lng;
    }

    // ✅ Get alert coordinates - support multiple formats
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

    // Validate all coordinates exist
    if (!stationLat || !stationLng) {
      console.error('❌ Station coordinates missing');
      toast.error('Station location not available');
      return;
    }

    if (!userLat || !userLng) {
      console.error('❌ Alert coordinates missing');
      toast.error('Alert location not available');
      return;
    }

    const directionsUrl = getDirectionsUrl(stationLat, stationLng, userLat, userLng);
    
    console.log('✅ Opening Google Maps:', directionsUrl);
    window.open(directionsUrl, '_blank');
    toast.success('Opening Google Maps...');
  };

  // ✅ NEW: Handle phone call
  const handleCallUser = () => {
    const phoneNumber = alert?.userPhone || alert?.phone;
    
    if (!phoneNumber) {
      toast.error('User phone number not available');
      return;
    }

    console.log('📞 Calling user:', phoneNumber);
    toast.success(`Calling ${phoneNumber}...`);
    // Open phone dialer
    window.location.href = `tel:${phoneNumber}`;
  };

  // Helper to get alert coordinates
  const getAlertLocation = () => {
    if (!alert) return null;
    
    if (alert.location) {
      return { lat: alert.location.lat, lng: alert.location.lng };
    }
    if (alert.lat && alert.lng) {
      return { lat: alert.lat, lng: alert.lng };
    }
    return null;
  };

  // Helper to get station coordinates
  const getStationLocation = () => {
    if (!station) return null;
    
    if (station.location) {
      return { lat: station.location.lat, lng: station.location.lng };
    }
    if (station.lat && station.lng) {
      return { lat: station.lat, lng: station.lng };
    }
    return null;
  };

  if (loading) {
    return <Loading message="Loading map..." />;
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Not Found</h2>
            <p className="text-gray-600 mb-6">
              The alert you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const alertLocation = getAlertLocation();
  const stationLocation = getStationLocation();
  const userPhone = alert.userPhone || alert.phone;
  
  // Calculate distance if we have both locations
  const distance = stationLocation && alertLocation
    ? calculateDistance(
        stationLocation.lat,
        stationLocation.lng,
        alertLocation.lat,
        alertLocation.lng
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Alert Details Sidebar */}
        <div className="lg:w-96 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Alert Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Alert Details</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  alert.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : alert.status === 'acknowledged'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {alert.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatDate(alert.createdAt)}</span>
            </div>
          </div>

          {/* Alert Information */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Alert Type</h3>
              <p className="text-lg font-medium text-gray-900">Fire Assistance</p>
            </div>

            {alertLocation ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Emergency Location</h3>
                <p className="text-sm text-gray-900 font-mono">
                  Lat: {alertLocation.lat.toFixed(6)}
                  <br />
                  Lng: {alertLocation.lng.toFixed(6)}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="text-sm font-semibold text-red-700 mb-2">⚠️ Location Error</h3>
                <p className="text-sm text-red-600">
                  Emergency location coordinates are missing from this alert.
                </p>
              </div>
            )}

            {/* ✅ NEW: Caller Contact Info */}
            {userPhone && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Caller Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                    <p className="text-lg text-gray-900 font-mono font-semibold">{userPhone}</p>
                  </div>
                  <button
                    onClick={handleCallUser}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Caller</span>
                  </button>
                </div>
              </div>
            )}

            {station && stationLocation ? (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Station</h3>
                  <p className="text-sm text-gray-900">{station.stationName}</p>
                  <p className="text-xs text-gray-600 mt-1 font-mono">
                    Lat: {stationLocation.lat.toFixed(6)}
                    <br />
                    Lng: {stationLocation.lng.toFixed(6)}
                  </p>
                </div>

                {distance && (
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-primary-700 mb-2">
                      Distance to Alert
                    </h3>
                    <p className="text-2xl font-bold text-primary-900">{distance} km</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="text-sm font-semibold text-yellow-700 mb-2">⚠️ Station Info</h3>
                <p className="text-sm text-yellow-600">
                  Station location not available. Please update your profile.
                </p>
              </div>
            )}

            {/* User ID (fallback if no phone) */}
            {alert.userId && !userPhone && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">User ID</h3>
                <p className="text-sm text-gray-900 font-mono">{alert.userId}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleGetDirections}
            disabled={!alertLocation || !stationLocation}
            className={`w-full flex items-center justify-center space-x-2 font-medium py-3 rounded-lg transition-colors ${
              alertLocation && stationLocation
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span>Navigate to Location</span>
          </button>

          {/* Info */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              📍 Click the button above to open Google Maps with turn-by-turn navigation to the
              emergency location.
            </p>
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 h-96 lg:h-auto">
          <Map
            stationLocation={stationLocation}
            alertLocation={alertLocation}
            onGetDirections={handleGetDirections}
            emergencyType="fire" 
          />
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;