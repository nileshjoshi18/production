import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MapComponent = ({ markers = [], center, zoom = 13 }) => {
  const [selectedMarker, setSelectedMarker] = React.useState(null);

  const mapStyles = {
    height: "100%",
    width: "100%"
  };

  const defaultCenter = {
    lat: 20.5937, // Default to India's center
    lng: 78.9629
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={zoom}
        center={center || defaultCenter}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3>{selectedMarker.title}</h3>
              <p>{selectedMarker.description}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent; 