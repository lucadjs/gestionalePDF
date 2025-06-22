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
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("ruolo", res.data.ruolo);
      localStorage.setItem("username", res.data.username);
      onLogin && onLogin(res.data);
    } catch (err) {
      setErrore(err.response?.data?.error || "Errore di autenticazione");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 350,
        margin: "60px auto",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        padding: 28,
        border: "1px solid #eee",
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
        alignItems: "stretch",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 8 }}>
        CopisteriaPDF - GESTIONALE
      </h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
        required
        style={{
          padding: 10,
          fontSize: 16,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{
          padding: 10,
          fontSize: 16,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
      <button
        type="submit"
        style={{
          padding: 12,
          fontSize: 16,
          borderRadius: 6,
          border: "none",
          background: "#ff6600",
          color: "#fff",
          fontWeight: "bold",
          marginTop: 8,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        Login
      </button>
      {errore && (
        <div style={{ color: "red", textAlign: "center", marginTop: 4 }}>
          {errore}
        </div>
      )}
    </form>
  );
}
