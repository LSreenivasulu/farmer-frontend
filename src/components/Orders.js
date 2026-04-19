import React, { useState, useEffect, useCallback } from "react";
import "./Orders.css";

const API_BASE = "http://localhost:8081/api/orders"; // ✅ FIXED

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rawUserId = localStorage.getItem("userId") || localStorage.getItem("farmerId");
  const userId = rawUserId && /^[0-9]+$/.test(rawUserId) ? rawUserId : null;

  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    productPrice: "",
    description: "",
    category: "Vegetables",
  });

  // 🔄 FETCH ORDERS
  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setError("Invalid user id. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`);

      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setError("");

    } catch {
      setError("❌ Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 🔐 CHECK LOGIN
  useEffect(() => {
    if (!userId) {
      alert("Please login first");
      window.location.href = "/";
      return;
    }
    fetchOrders();
  }, [userId, fetchOrders]);

  // 📝 INPUT CHANGE
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ➕ CREATE ORDER
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!formData.productName || !formData.quantity || !formData.productPrice) {
      setError("❌ Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.productName,
          quantity: parseInt(formData.quantity),
          productPrice: parseFloat(formData.productPrice),
          description: formData.description,
          category: formData.category,
          status: "PENDING",
        }),
      });

      if (!res.ok) throw new Error();

      setSuccess("✅ Order created!");
      setShowForm(false);

      setFormData({
        productName: "",
        quantity: "",
        productPrice: "",
        description: "",
        category: "Vegetables",
      });

      fetchOrders();

    } catch {
      setError("❌ Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  // ❌ DELETE ORDER
  const deleteOrder = async (id) => {

    if (!window.confirm("Delete this order?")) return;

    try {
      setLoading(true);

      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE"
      });

      setSuccess("✅ Deleted!");
      fetchOrders();

    } catch {
      setError("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // 🎨 STATUS COLOR
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "#ff9800";
      case "ACCEPTED": return "#4caf50";
      case "DECLINED": return "#f44336";
      default: return "#9e9e9e";
    }
  };

  return (
    <div className="orders-container">

      <div className="orders-top">
        <div>
          <h1>📦 My Orders</h1>
          <p>Manage your current orders and add new product requests.</p>
        </div>

        <div className="orders-actions">
          <button
            className={`btn ${showForm ? "btn-danger" : "btn-primary"}`}
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Cancel" : "Create Order"}
          </button>

          <button className="btn btn-secondary" onClick={fetchOrders}>
            Refresh Orders
          </button>
        </div>
      </div>

      {loading && <p className="status-text">Loading...</p>}
      {error && <p className="status-text error">{error}</p>}
      {success && <p className="status-text success">{success}</p>}

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleCreateOrder}>

          <input name="productName" placeholder="Product"
            value={formData.productName}
            onChange={handleInputChange}
          />

          <input name="quantity" type="number" placeholder="Quantity"
            value={formData.quantity}
            onChange={handleInputChange}
          />

          <input name="productPrice" type="number" placeholder="Price"
            value={formData.productPrice}
            onChange={handleInputChange}
          />

          <button className="btn btn-success" type="submit">Submit Order</button>
        </form>
      )}

      {/* LIST */}
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-card-header">
            <div>
              <h3>{order.productName}</h3>
              <p className="order-subtitle">{order.category || "General"}</p>
            </div>
            <span className="order-status" style={{ background: getStatusColor(order.status) }}>
              {order.status}
            </span>
          </div>

          <div className="order-card-details">
            <div className="order-item">
              <span className="order-item-title">Quantity</span>
              <span className="order-item-value">{order.quantity}</span>
            </div>
            <div className="order-item">
              <span className="order-item-title">Price/unit</span>
              <span className="order-item-value">₹{order.productPrice}</span>
            </div>
            <div className="order-item order-total">
              <span className="order-item-title">Total</span>
              <span className="order-item-value">₹{(order.quantity * order.productPrice).toFixed(2)}</span>
            </div>
          </div>

          {order.adminResponse && (
            <p className="order-note">Admin Response: {order.adminResponse}</p>
          )}

          <div className="order-buttons">
            {order.status === "PENDING" && (
              <button className="btn btn-danger" onClick={() => deleteOrder(order.id)}>
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ))}

    </div>
  );
}
