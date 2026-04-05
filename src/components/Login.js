import React, { useState } from "react";
import { login } from "../services/api";
import "./Login.css";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("farmerId", email);
      setPage("admin");
      return;
    }

    try {
      const res = await login({ email, password });

      if (res.success) {
        const userId = res.user?.id ?? res.user?.userId ?? res.user?.uid;
        if (!userId) {
          throw new Error("Login succeeded but server did not return user id");
        }

        localStorage.setItem("role", "user");
        localStorage.setItem("userId", userId);
        localStorage.setItem("userEmail", email);
        setPage("dashboard");
      } else {
        setError(res.message || "Invalid email or password");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to manage your orders and market data.</p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" onClick={handleLogin}>
          Login
        </button>

        <p className="auth-note">
          Don’t have an account? <span onClick={() => setPage("signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
