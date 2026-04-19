import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

const containerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "10px"
};

// 📍 CITY COORDINATES
const cityCoordinates = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mysore: { lat: 12.2958, lng: 76.6394 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Kolar: { lat: 13.1377, lng: 78.1298 }
};

// 📏 DISTANCE FUNCTION
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function MapView({ markets = [] }) {

  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [error, setError] = useState("");
  const [pickedLocations, setPickedLocations] = useState([]);

  // 📍 GET USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        setError("⚠ Location access denied. Showing default location.");
      }
    );
  }, []);

  // 📍 FIND NEAREST MARKET
  useEffect(() => {

    if (!currentLocation || markets.length === 0) return;

    let min = Infinity;
    let near = null;

    markets.forEach((m) => {

      const coords = cityCoordinates[m.location];
      if (!coords) return;

      const dist = getDistance(
        currentLocation.lat,
        currentLocation.lng,
        coords.lat,
        coords.lng
      );

      if (dist < min) {
        min = dist;
        near = { ...m, distance: dist.toFixed(2) };
      }
    });

    setNearest(near);

  }, [currentLocation, markets]);

  // 📍 LOCATION PICKER COMPONENT
  function LocationPicker() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPickedLocations(prev => [...prev, { lat, lng }]);
      },
    });
    return null;
  }

  // 📍 DEFAULT CENTER (Bangalore)
  const center = currentLocation || { lat: 12.9716, lng: 77.5946 };

  return (
    <div>

      <h2>📍 Smart Market Finder</h2>

      {/* ERROR MESSAGE */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* NO DATA */}
      {markets.length === 0 && (
        <p>⚠ No market data available</p>
      )}

      {/* NEAREST MARKET */}
      {nearest && (
        <div style={{
          background: "#d4edda",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px"
        }}>
          <h3>Nearest Market</h3>
          <p>🏪 {nearest.marketName}</p>
          <p>📍 {nearest.location}</p>
          <p>💰 ₹{nearest.price}</p>
          <p>📏 {nearest.distance} km</p>
        </div>
      )}

      <MapContainer center={[center.lat, center.lng]} zoom={10} style={containerStyle}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <LocationPicker />

        {/* 🟢 USER */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>You</Popup>
          </Marker>
        )}

        {/* 🔴 MARKETS */}
        {markets.map((m, i) => {
          const coords = cityCoordinates[m.location];
          if (!coords) return null;

          return (
            <Marker key={i} position={[coords.lat, coords.lng]}>
              <Popup>{m.marketName}</Popup>
            </Marker>
          );
        })}

        {/* 🛒 PICKED LOCATIONS */}
        {pickedLocations.map((loc, i) => (
          <Marker key={`picked-${i}`} position={[loc.lat, loc.lng]}>
            <Popup>Placed at {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* PICKED LOCATIONS LIST */}
      {pickedLocations.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <h3>Picked Locations</h3>
          <ul>
            {pickedLocations.map((loc, i) => (
              <li key={i}>Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

export default MapView;