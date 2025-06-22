import React, { useState, useEffect } from "react";
import MaterialiForm from "./components/MaterialiForm";
import LavorazioniForm from "./components/LavorazioniForm";
import ClientiForm from "./components/ClientiForm";
import PreventiviForm from "./components/PreventiviForm";
import OrdiniForm from "./components/OrdiniForm";
import UtentiForm from "./components/UtentiForm";
import LoginForm from "./components/LoginForm";
import axios from "axios";
import "./login.css"; // <-- Qui metterai il CSS sotto

const BUTTONS = [
  { key: "utenti", label: "Utenti", admin: true }, // solo admin!
  { key: "clienti", label: "Clienti" },
  { key: "materiali", label: "Materiali" },
  { key: "lavorazioni", label: "Lavorazioni" },
  { key: "preventivi", label: "Preventivi" },
  { key: "ordini", label: "Ordini" },
];

export default function App() {
  const [sezione, setSezione] = useState("clienti");
  const [utente, setUtente] = useState(null);

  // Al mount: leggi da localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const ruolo = localStorage.getItem("ruolo");
    const nome = localStorage.getItem("nome");
    if (token) {
      setUtente({ token, ruolo, nome });
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    }
  }, []);

  function handleLogin(user) {
    setUtente(user);
    axios.defaults.headers.common["Authorization"] = "Bearer " + user.token;
  }

  function handleLogout() {
    setUtente(null);
    localStorage.removeItem("token");
    localStorage.removeItem("ruolo");
    localStorage.removeItem("nome");
    delete axios.defaults.headers.common["Authorization"];
  }

  if (!utente) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="app-bg">
      {/* ----- TOP BAR FISSA ----- */}
      <div className="top-bar">
        <h1 className="top-bar-title">Gestionale Copisteria PDF</h1>
        <div className="top-bar-buttons">
          {BUTTONS.filter((btn) => !btn.admin || utente.ruolo === "admin").map(
            (btn) => (
              <button
                key={btn.key}
                onClick={() => setSezione(btn.key)}
                className={
                  sezione === btn.key ? "top-bar-btn active" : "top-bar-btn"
                }
              >
                {btn.label}
              </button>
            )
          )}
          <div style={{ flex: 1 }} />
          <span className="user-label">
            Utente: <b>{utente.nome}</b> ({utente.ruolo})
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ---- CONTENUTO SCROLLABILE ---- */}
      <div className="main-content">
        {sezione === "utenti" && utente.ruolo === "admin" && <UtentiForm />}
        {sezione === "clienti" && <ClientiForm />}
        {sezione === "materiali" && <MaterialiForm />}
        {sezione === "lavorazioni" && <LavorazioniForm />}
        {sezione === "preventivi" && <PreventiviForm />}
        {sezione === "ordini" && <OrdiniForm />}
      </div>
    </div>
  );
}
