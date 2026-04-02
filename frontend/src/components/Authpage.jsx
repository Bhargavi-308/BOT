
import { useState } from "react";
import { api } from "../api";

export default function AuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "register") {
        await api.register({ email, password });
        setSuccess("Registration successful. Please log in.");
        setMode("login");
      } else {
        const data = await api.login({ email, password });
        localStorage.setItem("token", data.access_token);
        await onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>AI Chatbot</h1>
        <p>{mode === "register" ? "Create your account" : "Login to continue"}</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>

          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "register" ? "Register" : "Login"}
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}
      </div>
    </div>
  );
}
