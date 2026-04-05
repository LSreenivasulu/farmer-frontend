import React, { useEffect, useState } from "react";
import Chatbot from "./Chatbot";
import BestPrice from "./BestPrice";
import MapView from "./MapView";
import Orders from "./Orders";
import "./Dashboard.css";

const API_BASE = "http://localhost:8081/api";

function Dashboard({ setPage }) {
  const [activeComponent, setActiveComponent] = useState("bestPrice");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      setPage("login");
    }
  }, [setPage]);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    const rawUserId = localStorage.getItem("userId") || localStorage.getItem("farmerId");
    const userId = rawUserId && /^[0-9]+$/.test(rawUserId) ? rawUserId : null;
    if (!userId) {
      console.error("Invalid userId in localStorage, cannot load orders", { rawUserId });
      return;
    }

    const url = `${API_BASE}/orders/user/${encodeURIComponent(userId)}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err, { userId, url });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const acceptedOrders = orders.filter((o) => o.status === "ACCEPTED").length;

  const renderComponent = () => {
    if (activeComponent === "bestPrice") return <BestPrice />;
    if (activeComponent === "mapView") return <MapView />;
    if (activeComponent === "orders") return <Orders />;
    if (activeComponent === "chatbot") return <Chatbot />;
    return <BestPrice />;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Farm Market Dashboard</h1>
          <p>Today: {today}</p>
        </div>

        <div className="header-actions">
          {localStorage.getItem("role") === "admin" && (
            <button className="btn btn-secondary" onClick={() => setPage("admin")}>Admin Panel</button>
          )}
          <button className="btn btn-danger" onClick={() => { localStorage.clear(); setPage("login"); }}>Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p>{pendingOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Accepted</h3>
          <p>{acceptedOrders}</p>
        </div>
      </div>

      <div className="controls-grid">
        <button className={`tab-btn ${activeComponent === "bestPrice" ? "active" : ""}`} onClick={() => setActiveComponent("bestPrice")}>Best Price</button>
        <button className={`tab-btn ${activeComponent === "mapView" ? "active" : ""}`} onClick={() => setActiveComponent("mapView")}>Market Map</button>
        <button className={`tab-btn ${activeComponent === "orders" ? "active" : ""}`} onClick={() => setActiveComponent("orders")}>Orders</button>
        <button className={`tab-btn ${activeComponent === "chatbot" ? "active" : ""}`} onClick={() => setActiveComponent("chatbot")}>AI Assistant</button>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card" onClick={() => setActiveComponent("bestPrice")}>
          <h4>💰 Best Price</h4>
          <p>Compare prices and pick the best market for your products.</p>
        </div>
        <div className="dashboard-card" onClick={() => setActiveComponent("mapView")}>
          <h4>📍 Market Map</h4>
          <p>Visualize nearby market hubs and price zones.</p>
        </div>
        <div className="dashboard-card" onClick={() => setActiveComponent("chatbot")}>
          <h4>🤖 AI Assistant</h4>
          <p>Get instant guidance on crop planning and selling tips.</p>
        </div>
      </div>

      <section className="dashboard-content">
        {loading ? <p>Loading...</p> : renderComponent()}
      </section>
    </div>
  );
}

export default Dashboard;
