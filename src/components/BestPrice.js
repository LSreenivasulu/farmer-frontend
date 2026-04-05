import React, { useState } from "react";
import "./BestPrice.css";

function BestPrice() {
  const [product, setProduct] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);

  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      const found = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript)
        .join(" ");

      if (found) {
        setProduct(found);
        searchProduct(found);
      }
    };

    recognition.onerror = () => {
      setError("Speech recognition error. Try again.");
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const searchProduct = async (productName) => {
    if (!productName.trim()) {
      setError("Please enter a product name.");
      return;
    }

    setError("");
    setData(null);

    try {
      const response = await fetch(`http://localhost:8081/api/market/best/${productName}`);
      if (!response.ok) {
        setError("No market price found for this product.");
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="best-price">
      <div className="best-price-container">
        <div className="input-group">
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchProduct(product)}
            placeholder="Product name (Tomato, Rice, Wheat...)"
          />
          <div className="button-group">
            <button className="check-btn" onClick={() => searchProduct(product)}>
              🔍 Search
            </button>
            <button className={`speech-btn ${listening ? "listening" : ""}`} onClick={startSpeech}>
              {listening ? "🎤 Listening..." : "🎤 Speak"}
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {data && (
          <div className="result-box">
            <h3>Best Price Match</h3>
            <p>
              <b>Market:</b> {data.marketName}
            </p>
            <p>
              <b>Location:</b> {data.location}
            </p>
            <p>
              <b>Price:</b> ₹{data.price}
            </p>
            {data.date && (
              <p>
                <b>Date:</b> {data.date}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BestPrice;