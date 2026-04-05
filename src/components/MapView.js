import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

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

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={7}
        >

          {/* 🟢 USER */}
          {currentLocation && (
            <Marker position={currentLocation} label="You" />
          )}

          {/* 🔴 MARKETS */}
          {markets.map((m, i) => {

            const coords = cityCoordinates[m.location];
            if (!coords) return null;

            return (
              <Marker
                key={i}
                position={coords}
                label={m.marketName}
              />
            );
          })}

        </GoogleMap>

      </LoadScript>

    </div>
  );
}

export default MapView;