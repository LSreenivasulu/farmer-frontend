import React from "react";
import "./Landing.css";
import logo from "../assets/logo.svg";

function Landing({ setPage }) {
  return (
    <div className="landing">
      <div className="overlay" />

      <header className="landing-top">
          <div className="landing-brand">
          <img src={logo} alt="SREENU's Smart Farm Market logo" className="landing-logo" />
          <div>
            <h1>SREENU's SMART FARM MARKET</h1>
            <p className="brand-subtitle">Designed by L. Sreenivasulu</p>
          </div>
        </div>
        <p>Smart farming platform for buying, selling, and market insights.</p>
      </header>

      <main className="landing-content">
        <section className="hero-card">
          <div>
            <h2>Grow Better. Sell Faster.</h2>
            <p>
              Connect with buyers and suppliers, track trends, and manage orders in one professional dashboard.
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => setPage("signup")}>
                Get Started
              </button>
              <button className="btn btn-secondary" onClick={() => setPage("login")}>
                Login
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="pill">Fresh Crops</div>
            <div className="pill">Instant Pricing</div>
            <div className="pill">AI Recommendations</div>
          </div>
        </section>

        <section className="features-section">
          <h3>Featured Categories</h3>
          <div className="feature-cards">
            <article className="feature-card">
              <div className="icon">🌱</div>
              <h4>Fertilizers</h4>
              <p>Quality nutrients for maximum harvest.</p>
            </article>
            <article className="feature-card">
              <div className="icon">🌾</div>
              <h4>Crops</h4>
              <p>Fresh farm produce and staples.</p>
            </article>
            <article className="feature-card">
              <div className="icon">🚜</div>
              <h4>Equipment</h4>
              <p>Tools & machinery for every farm size.</p>
            </article>
            <article className="feature-card">
              <div className="icon">💧</div>
              <h4>Seeds</h4>
              <p>High quality seeds with germination guarantees.</p>
            </article>
          </div>
        </section>
        <div className="designer-credit">
          Designed by L. Sreenivasulu · Phone: 6301600267
        </div>
      </main>
    </div>
  );
}

export default Landing;

