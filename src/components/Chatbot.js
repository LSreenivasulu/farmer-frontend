import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const chatEndRef = useRef(null);

  // 🔽 Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // 🎤 SPEECH TO TEXT + AUTO SEND
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("❌ Speech not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setSpeechError("");
        console.log("🎤 Listening...");
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript = transcript;
          }
        }

        if (finalTranscript) {
          console.log("✅ Recognized:", finalTranscript);
          setMessage(finalTranscript);
          
          // Send message immediately after recognition
          setTimeout(() => {
            sendMessage(finalTranscript);
          }, 200);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech error:", event.error);
        let errorMsg = "❌ ";
        
        switch(event.error) {
          case "no-speech":
            errorMsg += "No speech detected. Please speak clearly.";
            break;
          case "network":
            errorMsg += "Network error. Check internet connection.";
            break;
          case "not-allowed":
            errorMsg += "Microphone permission denied. Enable in settings.";
            break;
          default:
            errorMsg += `Error: ${event.error}`;
        }
        
        setSpeechError(errorMsg);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        console.log("🎤 Listening stopped");
      };

      recognition.start();
    } catch (err) {
      console.error("Speech error:", err);
      setSpeechError("❌ Speech recognition failed");
    }
  };

  // 🤖 SEND MESSAGE FUNCTION
  const sendMessage = async (msg) => {
    const textToSend = msg || message;

    if (!textToSend.trim()) return;

    try {
      setLoading(true);
      setSpeechError("");

      // Add user message to chat
      setChat((prev) => [...prev, { q: textToSend, a: "" }]);
      setMessage("");

      // Call AI API
      const res = await fetch("http://localhost:8081/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) {
        throw new Error("API Error");
      }

      const data = await res.json();
      const reply = data.reply || "I couldn't process that. Please try again.";

      // Update chat with bot reply
      setChat((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].a = reply;
        }
        return updated;
      });

      // Speak the response
      setTimeout(() => {
        speakReply(reply);
      }, 300);
    } catch (err) {
      console.error("Error:", err);
      setChat((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].a = "❌ Error connecting to server";
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔊 TEXT TO SPEECH
  const speakReply = (text) => {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Add a small delay to ensure speech synthesis is ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (err) {
      console.error("Speech error:", err);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <h2>🤖 Farmer AI Assistant</h2>
        <p>Ask questions about crops, prices, weather, and farming tips</p>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {chat.length === 0 && (
          <div style={{ textAlign: "center", color: "#667eea", paddingTop: "40px", width: "100%" }}>
            <p style={{ fontSize: "24px", margin: "20px 0", fontWeight: "700" }}>👋 Welcome to Farmer AI Assistant!</p>
            <p style={{ fontSize: "16px", margin: "15px 0", color: "#1e293b", fontWeight: "500" }}>How can I help you today?</p>
            <div style={{ marginTop: "30px", opacity: 0.7 }}>
              <p style={{ fontSize: "15px", margin: "8px 0" }}>🎤 Use speech recognition to speak naturally</p>
              <p style={{ fontSize: "15px", margin: "8px 0" }}>⌨️ Or type your questions below</p>
              <p style={{ fontSize: "15px", margin: "8px 0" }}>🔊 Enable audio responses with TTS</p>
            </div>
          </div>
        )}

        {chat.map((c, i) => (
          <div key={i} className="chat-msg">
            <div className="user-msg">
              <p>👨‍🌾 {c.q}</p>
            </div>
            {c.a && (
              <div className="bot-msg">
                <p>🤖 {c.a}</p>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="bot-msg">
            <p className="loading">🤖 Thinking</p>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* Input Area */}
      <div className="input-area">
        {speechError && (
          <div style={{
            width: "100%",
            background: "#fee2e2",
            color: "#991b1b",
            padding: "10px 15px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "10px",
            border: "1px solid #fecaca"
          }}>
            {speechError}
          </div>
        )}
        <div className="chat-input-group">
          <input
            type="text"
            placeholder="Type your question or use microphone..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSpeechError("");
            }}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={loading}>
            📤 Send
          </button>
        </div>

        <div className="button-group">
          <button
            className={`mic-btn ${listening ? "listening" : ""}`}
            onClick={startListening}
            disabled={loading}
          >
            {listening ? "🎤 Listening..." : "🎤 Speak"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;