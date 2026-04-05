import React from "react";
import "./Header.css"; // optional if styling separately

function Header({ title = "🌾 FarmerSmart" }) {

  const today = new Date();

  const date = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="header">
      <div>
        <h2>{title}</h2>
        <p>📅 {date}</p>
      </div>
    </div>
  );
}

export default Header;