import React, { useState } from "react";
import "../login.css";

const LOGO_URL = "/logo.png";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore("");
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Autenticazione fallita");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("ruolo", data.ruolo);
      localStorage.setItem("nome", data.nome);
      onLogin && onLogin(data);
    } catch (err) {
      setErrore("Errore di autenticazione");
    }
  }

  return (
    <div className="login-bg">
      <div className="login-centerbox">
        <img
          src={LOGO_URL}
          alt="Logo CopisteriaPDF"
          className="login-logo-img"
        />
        <form className="login-form-col" onSubmit={handleSubmit}>
          <h2 className="login-title">GESTIONALE</h2>
          <input
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="login-btn" type="submit">
            Login
          </button>
          {errore && <div className="login-error">{errore}</div>}
        </form>
      </div>
    </div>
  );
}
