import React, { useState } from "react";
import { signup } from "../services/api";
import "./Signup.css";

function Signup({ setPage }) {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");

    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!data.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (res.success) {
        alert("Account created successfully!");
        setPage("login");
      } else {
        setError(res.message || "Email already exists");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <p>Create your account to access FarmerSmart dashboard</p>

        <input
          type="text"
          placeholder="Full Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={data.confirmPassword}
          onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
        />

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" onClick={handleSignup} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="auth-note">
          Already have an account? <span onClick={() => setPage("login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
