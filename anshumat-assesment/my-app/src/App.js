import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useState } from "react";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function Navbar({ token, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">ResumeBuilder</h1>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✖" : "☰"}
          </button>
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            {!token && (
              <>
                <li>
                  <Link to="/Signup" onClick={() => setMenuOpen(false)}>
                    Signup
                  </Link>
                </li>
                <li>
                  <Link to="/Signin" onClick={() => setMenuOpen(false)}>
                    Signin
                  </Link>
                </li>
              </>
            )}
            {token && (
              <>
                <li>
                  <Link to="/Dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    className="logout-btn"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Overlay covers left 40% only */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} ResumeBuilder. All rights reserved.</p>
    </footer>
  );
}

function App() {
  const token = localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/Signin";
  }

  return (
    <BrowserRouter style={{ width: "100%" }}>
      <Navbar token={token} onLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/Signin" />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Signin" element={<Signin />} />
          <Route
            path="/Dashboard"
            element={token ? <Dashboard /> : <Navigate to="/Signin" />}
          />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
