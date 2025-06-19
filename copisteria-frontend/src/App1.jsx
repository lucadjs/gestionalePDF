import React, { useState } from "react";
import MaterialiForm from "./components/MaterialiForm";
import LavorazioniForm from "./components/LavorazioniForm";
import ClientiForm from "./components/ClientiForm";
import PreventiviForm from "./components/PreventiviForm";

const BUTTONS = [
  { key: "clienti", label: "Clienti" },
  { key: "materiali", label: "Materiali" },
  { key: "lavorazioni", label: "Lavorazioni" },
  { key: "preventivi", label: "Preventivi" },
];

export default function App() {
  const [sezione, setSezione] = useState("clienti");

  return (
    <div style={{ padding: 20 }}>
      <h1>Gestione Copisteria PDF</h1>
      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        {BUTTONS.map((btn) => (
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
      </div>

      <div>
        {sezione === "clienti" && <ClientiForm />}
        {sezione === "materiali" && <MaterialiForm />}
        {sezione === "lavorazioni" && <LavorazioniForm />}
        {sezione === "preventivi" && <PreventiviForm />}
      </div>
    </div>
  );
}
