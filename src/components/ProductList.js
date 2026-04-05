import React, { useEffect, useState } from "react";
import { getProducts, addProduct } from "../services/api";

function ProductList() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    location: ""
  });

  // 🔄 LOAD PRODUCTS
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ➕ ADD PRODUCT
  const handleAdd = async () => {

    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert("⚠ Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await addProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      });

      alert("✅ Product added!");

      // Reset form
      setNewProduct({
        name: "",
        price: "",
        stock: "",
        location: ""
      });

      loadProducts();

    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>🛒 Products</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* FORM */}
      <div style={{ marginBottom: "20px" }}>

        <input
          placeholder="Product Name"
          value={newProduct.name}
          onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
        />

        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
        />

        <input
          placeholder="Location"
          value={newProduct.location}
          onChange={e => setNewProduct({ ...newProduct, location: e.target.value })}
        />

        <button onClick={handleAdd} disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>

      </div>

      {/* LIST */}
      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && (
        <p>No products available</p>
      )}

      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px"
          }}
        >
          <h3>{p.name}</h3>
          <p>💰 ₹{p.price}</p>
          <p>📦 Stock: {p.stock}</p>
          <p>📍 {p.location}</p>
        </div>
      ))}

    </div>
  );
}

export default ProductList;