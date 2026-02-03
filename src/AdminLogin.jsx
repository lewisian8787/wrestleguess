import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./api/auth.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setStatus("Logging in...");
    try {
      const data = await login({ email, password });
      if (!data.user.isAdmin) {
        setStatus("Access denied. Admin privileges required.");
        return;
      }
      navigate("/admin/event");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div style={screenStyle}>
      <h1 style={titleStyle}>Admin Login</h1>
      <form onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button style={buttonStyle}>Sign In</button>
      </form>
      {status && <p style={{ textAlign: "center", marginTop: "1rem" }}>{status}</p>}
    </div>
  );
}

const screenStyle = {
  minHeight: "100vh",
  backgroundColor: "#0b0b10",
  color: "white",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  padding: "2rem",
  maxWidth: "420px",
  margin: "0 auto",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "1.5rem",
  fontSize: "1.2rem",
  fontWeight: 600,
};

const inputStyle = {
  background: "#1a1a22",
  border: "1px solid #3a3a55",
  borderRadius: "0.5rem",
  padding: "0.75rem",
  color: "white",
  fontSize: "1rem",
};

const buttonStyle = {
  border: "none",
  borderRadius: "0.5rem",
  padding: "0.75rem",
  background:
    "radial-gradient(circle at 20% 20%, rgba(255,214,0,1) 0%, rgba(255,132,0,1) 60%, rgba(170,60,0,1) 100%)",
  color: "black",
  fontWeight: 600,
  fontSize: "1rem",
};
