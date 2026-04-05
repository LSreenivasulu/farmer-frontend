import React, { useEffect, useState } from "react";
import AdminOrders from "./AdminOrders";
import "./Admin.css";

function Admin({ setPage }) {
  const [activeView, setActiveView] = useState("market");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ productName: "", marketName: "", price: "", location: "" });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      alert("Unauthorized Access");
      setPage("login");
    } else {
      loadData();
    }
  }, [setPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8081/api/admin/all");
      if (!res.ok) throw new Error(res.status);
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Load error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    if (!form.productName || !form.marketName || !form.price || !form.location) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const url = editId ? `http://localhost:8081/api/admin/update/${editId}` : "http://localhost:8081/api/admin/add";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(res.status);
      setForm({ productName: "", marketName: "", price: "", location: "" });
      setEditId(null);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const editData = (item) => {
    setForm({ productName: item.productName, marketName: item.marketName, price: item.price, location: item.location });
    setEditId(item.id);
  };

  const deleteData = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8081/api/admin/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.status);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((d) => d.productName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <div className="admin-actions">
        <button className="btn btn-secondary" onClick={() => setPage("dashboard")}>Back</button>
        <button className="btn btn-danger" onClick={() => { localStorage.clear(); setPage("login"); }}>Logout</button>
      </div>

      <div className="admin-nav">
        <button className={`btn tab-btn ${activeView === "market" ? "active" : ""}`} onClick={() => setActiveView("market")}>Market Data</button>
        <button className={`btn tab-btn ${activeView === "orders" ? "active" : ""}`} onClick={() => setActiveView("orders")}>Admin Orders</button>
      </div>

      {activeView === "market" && (
        <div className="admin-panel">
          <div className="market-card">
            <div className="market-top">
              <input
                className="search-input"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" onClick={loadData}>Refresh</button>
            </div>

            <div className="market-form">
              <input placeholder="Product" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
              <input placeholder="Market" value={form.marketName} onChange={(e) => setForm({ ...form, marketName: e.target.value })} />
              <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <button className="btn btn-success" onClick={saveData}>{editId ? "Update" : "Add"}</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Product</th><th>Market</th><th>Price</th><th>Location</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 && !loading ? (
                    <tr><td colSpan="5">No Data</td></tr>
                  ) : filteredData.map((d) => (
                    <tr key={d.id}>
                      <td>{d.productName}</td>
                      <td>{d.marketName}</td>
                      <td>₹{d.price}</td>
                      <td>{d.location}</td>
                      <td>
                        <button className="btn btn-secondary" onClick={() => editData(d)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => deleteData(d.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === "orders" && <AdminOrders />}
    </div>
  );
}

export default Admin;
