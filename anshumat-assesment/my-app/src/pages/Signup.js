import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  async function handleSignup() {
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!res.ok) throw new Error("Signup failed");
      alert("Signup successful! Please login.");
      navigate("/signin");
    } catch (err) {
      alert("Signup failed. Try another email.");
    }
  }

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
      />
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="Password"
      />
      <button className="btn-primary" onClick={handleSignup}>
        Sign Up
      </button>
      <p className="auth-text">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}
