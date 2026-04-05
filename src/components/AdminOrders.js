import React, { useState, useEffect } from "react";
import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responseAction, setResponseAction] = useState("ACCEPTED");
  const isAdmin = true; // assume admin access while no auth logic
  const [marketPrices, setMarketPrices] = useState([]);
  const [suggestedPrice, setSuggestedPrice] = useState("");

  // 🔒 STEP 6: ADD LOGOUT BUTTON
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Fetch all orders for admin
  useEffect(() => {
    if (isAdmin) {
      fetchAllOrders();
    }
  }, [isAdmin]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8081/api/orders");
      if (!response.ok) throw new Error("Failed to load orders");

      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
      setError("");
    } catch (err) {
      setError("❌ Could not load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by status
  const handleFilter = (status) => {
    setFilter(status);
    if (status === "ALL") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === status));
    }
  };

  // Keep page from scrolling while modal open
  React.useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedOrder]);

  // Open response modal
  const openResponseModal = async (order, action) => {
    setSelectedOrder(order);
    setResponseAction(action);
    setResponseText("");
    setSuggestedPrice("");

    // Fetch market prices for this product
    try {
      const response = await fetch(`http://localhost:8081/api/market/best/${order.productName}`);
      if (response.ok) {
        const marketData = await response.json();
        setMarketPrices([marketData]); // Wrap in array for consistency
      } else {
        setMarketPrices([]);
      }
    } catch (err) {
      console.error("Failed to fetch market prices:", err);
      setMarketPrices([]);
    }
  };

  // Submit response
  const submitResponse = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8081/api/orders/${selectedOrder.orderId}/response`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: responseAction,
            adminResponse: responseText || "",
            suggestedPrice: suggestedPrice ? parseFloat(suggestedPrice) : null,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update order");

      const updatedOrder = await response.json();
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        )
      );
      setFilteredOrders((prev) =>
        prev.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        )
      );

      setSuccess(
        `✅ Order ${responseAction.toLowerCase()} successfully!`
      );
      setSelectedOrder(null);
      setResponseText("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ Error updating order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#ff9800";
      case "ACCEPTED":
        return "#4caf50";
      case "DECLINED":
        return "#f44336";
      case "COMPLETED":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  // Get status counts
  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    ACCEPTED: orders.filter((o) => o.status === "ACCEPTED").length,
    DECLINED: orders.filter((o) => o.status === "DECLINED").length,
    COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
  };

  return (
    <>
      <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h1>📦 Order Management</h1>
        <button className="logout-btn" onClick={logout}>🚪 Logout</button>
        <p>Manage farmer orders and market requests</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{statusCounts.ALL}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{statusCounts.PENDING}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card accepted">
          <div className="stat-number">{statusCounts.ACCEPTED}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card declined">
          <div className="stat-number">{statusCounts.DECLINED}</div>
          <div className="stat-label">Declined</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-number">{statusCounts.COMPLETED}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-buttons">
        <button
          className={`btn-filter ${filter === "ALL" ? "active" : ""}`}
          onClick={() => handleFilter("ALL")}
        >
          All ({statusCounts.ALL})
        </button>
        <button
          className={`btn-filter pending ${filter === "PENDING" ? "active" : ""}`}
          onClick={() => handleFilter("PENDING")}
        >
          Pending ({statusCounts.PENDING})
        </button>
        <button
          className={`btn-filter accepted ${filter === "ACCEPTED" ? "active" : ""}`}
          onClick={() => handleFilter("ACCEPTED")}
        >
          Accepted ({statusCounts.ACCEPTED})
        </button>
        <button
          className={`btn-filter declined ${filter === "DECLINED" ? "active" : ""}`}
          onClick={() => handleFilter("DECLINED")}
        >
          Declined ({statusCounts.DECLINED})
        </button>
        <button
          className={`btn-refresh`}
          onClick={fetchAllOrders}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Orders Table/Grid */}
      <div className="orders-table">
        {loading && !filteredOrders.length ? (
          <p className="loading">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>📭 No orders found</p>
          </div>
        ) : (
          <div className="admin-orders-grid">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="admin-order-card">
                <div className="admin-order-header">
                  <div>
                    <h3>{order.productName}</h3>
                    <p className="farmer-id">👨‍🌾 Farmer ID: {order.farmerId}</p>
                  </div>
                  <span
                    className="admin-order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="admin-order-details">
                  <div className="detail-row">
                    <span className="label">Category:</span>
                    <span className="value">{order.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Quantity:</span>
                    <span className="value">{order.quantity} units</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Price/Unit:</span>
                    <span className="value">₹{order.productPrice}</span>
                  </div>
                  <div className="detail-row highlight">
                    <span className="label">Total Price:</span>
                    <span className="value">
                      ₹{(order.quantity * order.productPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.description && (
                  <div className="admin-order-description">
                    <strong>Description:</strong>
                    <p>{order.description}</p>
                  </div>
                )}

                <div className="admin-order-date">
                  📅 {new Date(order.createdAt).toLocaleString()}
                </div>

                {order.adminResponse && (
                  <div className="previous-response">
                    <strong>Your Previous Response:</strong>
                    <p>{order.adminResponse}</p>
                  </div>
                )}

                {order.status === "PENDING" && (
                  <div className="admin-order-actions">
                    <button
                      className="btn-accept"
                      onClick={() => openResponseModal(order, "ACCEPTED")}
                    >
                      ✅ Accept
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => openResponseModal(order, "DECLINED")}
                    >
                      ❌ Decline
                    </button>
                  </div>
                )}

                {order.status === "ACCEPTED" && (
                  <div className="admin-order-actions">
                    <button
                      className="btn-complete"
                      onClick={() => openResponseModal(order, "COMPLETED")}
                    >
                      ✔️ Mark Complete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      {/* Response Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {responseAction === "ACCEPTED"
                  ? "✅ Accept Order"
                  : responseAction === "DECLINED"
                  ? "❌ Decline Order"
                  : "✔️ Mark Complete"}
              </h2>
              <button
                className="close-btn"
                onClick={() => {
                  setSelectedOrder(null);
                  setMarketPrices([]);
                  setSuggestedPrice("");
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>Product:</strong> {selectedOrder.productName}
              </p>
              <p>
                <strong>Farmer ID:</strong> {selectedOrder.farmerId}
              </p>
              <p>
                <strong>Farmer's Offered Price:</strong> ₹{selectedOrder.productPrice}/unit
              </p>
              <p>
                <strong>Quantity:</strong> {selectedOrder.quantity} units
              </p>
              <p>
                <strong>Total Value:</strong> ₹{(selectedOrder.quantity * selectedOrder.productPrice).toFixed(2)}
              </p>

              {/* Market Prices Section */}
              <div className="market-prices-section">
                <h4>🏪 Current Market Prices</h4>
                {marketPrices.length > 0 ? (
                  <div className="market-price-list">
                    {marketPrices.map((market, index) => (
                      <div key={index} className="market-price-item">
                        <span className="market-name">🏪 {market.marketName}</span>
                        <span className="market-location">📍 {market.location}</span>
                        <span className="market-price">💰 ₹{market.price}/unit</span>
                        {market.date && <span className="market-date">📅 {market.date}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-market-data">📊 No market data available for this product</p>
                )}
              </div>

              {/* Suggested Price Input */}
              <div className="modal-form-group">
                <label>Suggest Market Price (₹/unit) - Optional</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                  placeholder="Enter suggested market price..."
                />
                <small>If you suggest a price, it will be included in your response to the farmer.</small>
              </div>

              <div className="modal-form-group">
                <label>Your Response/Notes</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response to the farmer..."
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => {
                  setSelectedOrder(null);
                  setMarketPrices([]);
                  setSuggestedPrice("");
                }}
              >
                Cancel
              </button>
              <button
                className={`btn-confirm ${responseAction.toLowerCase()}`}
                onClick={submitResponse}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
