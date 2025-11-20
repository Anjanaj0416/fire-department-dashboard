import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { useState, useEffect, useRef } from 'react';
import { GOOGLE_MAPS_API_KEY, MAP_CONFIG } from '../config/config';
import { MapPin, Navigation } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const Map = ({ stationLocation, alertLocation, onGetDirections, emergencyType = 'police' }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Get color based on emergency type
  const getEmergencyColor = () => {
    switch (emergencyType) {
      case 'police':
        return '#2563eb'; // Blue
      case 'fire':
        return '#ea580c'; // Orange
      case 'health':
      case 'ambulance':
        return '#dc2626'; // Red
      default:
        return '#2563eb';
    }
  };

  // Animated spreading circles effect
  useEffect(() => {
    if (!isLoaded || !alertLocation) return;

    let startTime = null;
    const animationDuration = 2000; // 2 seconds per cycle

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % animationDuration) / animationDuration;
      
      setAnimationProgress(progress);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoaded, alertLocation]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error loading map</p>
          <p className="text-sm text-gray-600 mb-4">
            {loadError.message || 'Failed to load Google Maps'}
          </p>
          <div className="text-left bg-red-50 p-4 rounded-lg">
            <p className="text-xs text-red-800 font-mono mb-2">Common fixes:</p>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Check Google Maps API key in config.js</li>
              <li>• Verify API key is enabled for Maps JavaScript API</li>
              <li>• Add localhost URLs to API key restrictions</li>
              <li>• Check browser console for detailed errors</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const center = alertLocation || stationLocation || MAP_CONFIG.DEFAULT_CENTER;
  const emergencyColor = getEmergencyColor();

  // Calculate circle radii and opacities for ripple effect
  const getCircleProperties = () => {
    const circles = [];
    
    // Inner circle (starts immediately)
    if (animationProgress >= 0) {
      circles.push({
        id: 'spread_1',
        radius: 1000 * animationProgress, // 0 to 1000m
        fillOpacity: 0.2 * (1 - animationProgress),
        strokeOpacity: 0.5 * (1 - animationProgress),
      });
    }

    // Middle circle (starts at 30% progress)
    if (animationProgress > 0.3) {
      const middleProgress = (animationProgress - 0.3) / 0.7;
      circles.push({
        id: 'spread_2',
        radius: 1000 * middleProgress,
        fillOpacity: 0.15 * (1 - middleProgress),
        strokeOpacity: 0.4 * (1 - middleProgress),
      });
    }

    // Outer circle (starts at 60% progress)
    if (animationProgress > 0.6) {
      const outerProgress = (animationProgress - 0.6) / 0.4;
      circles.push({
        id: 'spread_3',
        radius: 1000 * outerProgress,
        fillOpacity: 0.1 * (1 - outerProgress),
        strokeOpacity: 0.3 * (1 - outerProgress),
      });
    }

    return circles;
  };

  const circleProperties = getCircleProperties();

  // Convert hex color to rgba
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={MAP_CONFIG.DEFAULT_ZOOM}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy',
      }}
    >
      {/* Animated spreading circles from alert location - MUST render BEFORE markers */}
      {alertLocation && circleProperties.map((circle) => (
        <Circle
          key={circle.id}
          center={alertLocation}
          radius={circle.radius}
          options={{
            fillColor: hexToRgba(emergencyColor, circle.fillOpacity),
            strokeColor: hexToRgba(emergencyColor, circle.strokeOpacity),
            strokeWeight: 2,
            clickable: false,
            zIndex: 1,
          }}
        />
      ))}

      {/* Static search radius circle (5km) */}
      {alertLocation && (
        <Circle
          center={alertLocation}
          radius={5000}
          options={{
            fillColor: 'rgba(234, 179, 8, 0.1)', // Yellow with low opacity
            strokeColor: 'rgba(234, 179, 8, 0.3)',
            strokeWeight: 2,
            clickable: false,
            zIndex: 0,
          }}
        />
      )}

      {/* Station/Responder Location Marker */}
      {stationLocation && (
        <Marker
          position={stationLocation}
          onClick={() => setSelectedMarker('station')}
          options={{
            zIndex: 2,
            icon: {
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: MAP_CONFIG.STATION_MARKER_COLOR || emergencyColor,
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 2,
              anchor: new window.google.maps.Point(12, 22),
            },
          }}
        />
      )}

      {/* Alert Location Marker with Bounce Animation */}
      {alertLocation && (
        <Marker
          position={alertLocation}
          onClick={() => setSelectedMarker('alert')}
          animation={window.google.maps.Animation.BOUNCE}
          options={{
            zIndex: 3,
            icon: {
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: MAP_CONFIG.ALERT_MARKER_COLOR || '#ef4444',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 2.5,
              anchor: new window.google.maps.Point(12, 22),
            },
          }}
        />
      )}

      {/* Info Windows */}
      {selectedMarker === 'station' && stationLocation && (
        <InfoWindow
          position={stationLocation}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold text-gray-900 mb-1">Your Station</h3>
            <button
              onClick={onGetDirections}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </button>
          </div>
        </InfoWindow>
      )}

      {selectedMarker === 'alert' && alertLocation && (
        <InfoWindow
          position={alertLocation}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold text-gray-900 mb-1">Alert Location</h3>
            <p className="text-sm text-gray-600">Emergency reported here</p>
            {onGetDirections && (
              <button
                onClick={onGetDirections}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate Here</span>
              </button>
            )}
          </div>
        </InfoWindow>
      )}

      {/* Legend */}
      {alertLocation && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: MAP_CONFIG.ALERT_MARKER_COLOR || '#ef4444' }}
              ></div>
              <span className="text-gray-700">Alert Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: MAP_CONFIG.STATION_MARKER_COLOR || emergencyColor }}
              ></div>
              <span className="text-gray-700">Your Station</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2" 
                style={{ borderColor: emergencyColor }}
              ></div>
              <span className="text-gray-700">Spreading Alert</span>
            </div>
          </div>
        </div>
      )}
    </GoogleMap>
  );
};

export default Map;