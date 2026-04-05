import React, { useEffect, useState } from "react";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Admin from "./components/Admin";
import "./App.css";

function App() {
  const [page, setPage] = useState("landing");

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "admin") {
      setPage("admin");
    } else if (role === "user") {
      setPage("dashboard");
    }
  }, []);

  const renderPage = () => {
    switch (page) {
      case "landing":
        return <Landing setPage={setPage} />;
      case "login":
        return <Login setPage={setPage} />;
      case "signup":
        return <Signup setPage={setPage} />;
      case "dashboard":
        return <Dashboard setPage={setPage} />;
      case "admin":
        return <Admin setPage={setPage} />;
      default:
        return <Landing setPage={setPage} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
