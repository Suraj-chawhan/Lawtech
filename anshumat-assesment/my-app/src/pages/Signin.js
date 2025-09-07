import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function Signin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!data.token) throw new Error("Invalid credentials");
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed. Check credentials.");
    }
  }

  return (
    <div className="auth-card">
      <h2>Sign In</h2>
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
      <button className="btn-primary" onClick={handleLogin}>
        Sign In
      </button>
      <p className="auth-text">
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
