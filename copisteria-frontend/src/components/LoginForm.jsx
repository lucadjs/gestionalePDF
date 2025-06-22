import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore("");
    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });
      // Salva il token in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("ruolo", res.data.ruolo);
      localStorage.setItem("username", res.data.username);
      onLogin && onLogin(res.data); // callback (puoi settare utente loggato nello stato globale/app)
    } catch (err) {
      setErrore(err.response?.data?.error || "Errore di autenticazione");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 500, margin: "30px auto" }}
    >
      <h2>CopisteriaPDF - GESTIONALE</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {errore && <div style={{ color: "red" }}>{errore}</div>}
    </form>
  );
}
