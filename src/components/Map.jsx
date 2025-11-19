import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';
import { GOOGLE_MAPS_API_KEY, MAP_CONFIG } from '../config/config';
import { MapPin, Navigation } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const Map = ({ stationLocation, alertLocation, onGetDirections }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Error loading map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="spinner w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const center = alertLocation || stationLocation || MAP_CONFIG.DEFAULT_CENTER;

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
      }}
    >
      {/* Fire Station Marker */}
      {stationLocation && (
        <Marker
          position={stationLocation}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: MAP_CONFIG.STATION_MARKER_COLOR,
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 2,
            anchor: { x: 12, y: 22 },
          }}
          onClick={() => setSelectedMarker('station')}
        />
      )}

      {/* Alert Location Marker */}
      {alertLocation && (
        <Marker
          position={alertLocation}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: MAP_CONFIG.ALERT_MARKER_COLOR,
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 2.5,
            anchor: { x: 12, y: 22 },
          }}
          onClick={() => setSelectedMarker('alert')}
          animation={window.google.maps.Animation.BOUNCE}
        />
      )}

      {/* Info Window for Station */}
      {selectedMarker === 'station' && stationLocation && (
        <InfoWindow
          position={stationLocation}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2">
            <h3 className="font-bold text-primary-600 mb-1">Your Station</h3>
            <p className="text-sm text-gray-600">
              {stationLocation.lat.toFixed(6)}, {stationLocation.lng.toFixed(6)}
            </p>
          </div>
        </InfoWindow>
      )}

      {/* Info Window for Alert */}
      {selectedMarker === 'alert' && alertLocation && (
        <InfoWindow
          position={alertLocation}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2">
            <h3 className="font-bold text-danger-600 mb-2">Emergency Location</h3>
            <p className="text-sm text-gray-600 mb-3">
              {alertLocation.lat.toFixed(6)}, {alertLocation.lng.toFixed(6)}
            </p>
            {onGetDirections && (
              <button
                onClick={onGetDirections}
                className="flex items-center space-x-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate</span>
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default Map;