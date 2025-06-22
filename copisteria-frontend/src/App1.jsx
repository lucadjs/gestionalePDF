import React, { useState, useEffect } from "react";
import MaterialiForm from "./components/MaterialiForm";
import LavorazioniForm from "./components/LavorazioniForm";
import ClientiForm from "./components/ClientiForm";
import PreventiviForm from "./components/PreventiviForm";
import OrdiniForm from "./components/OrdiniForm";
import UtentiForm from "./components/UtentiForm";
import LoginForm from "./components/LoginForm";
import axios from "axios";

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
    <div style={{ padding: 20 }}>
      <h1>Gestione Copisteria PDF</h1>
      <div style={{ marginBottom: 12, display: "flex", gap: 12 }}>
        {BUTTONS.filter(
          (btn) => !btn.admin || utente.ruolo === "admin" // Se admin true, mostra solo se admin
        ).map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSezione(btn.key)}
            style={{
              background: sezione === btn.key ? "#ffd700" : "#eee",
              fontWeight: sezione === btn.key ? "bold" : "normal",
              border: "1px solid #bbb",
              borderRadius: 6,
              padding: "8px 16px",
              cursor: "pointer",
              outline: "none",
              boxShadow:
                sezione === btn.key ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
            }}
          >
            {btn.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontStyle: "italic", fontSize: 14 }}>
          Utente: <b>{utente.nome}</b> ({utente.ruolo})
        </span>
        <button
          style={{ marginLeft: 8, color: "#c00", fontWeight: "bold" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div>
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
