import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

import { esportaPreventivoPDF } from "../utils/pdfPreventivo";
import {
  FaFilePdf,
  FaEdit,
  FaCheckCircle,
  FaTrash,
  FaEnvelope,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

// Utility: prende logo da upload, o da /public/logo.png
async function getLogoDataUrl(logoDataUrl) {
  if (logoDataUrl) return logoDataUrl;
  const res = await fetch("/logo.png");
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

const ALIQUOTA_IVA = 0.22;

export default function PreventiviForm() {
  const [clienti, setClienti] = useState([]);
  const [lavorazioni, setLavorazioni] = useState([]);
  const [preventivi, setPreventivi] = useState([]);
  const [righe, setRighe] = useState([]);
  const [form, setForm] = useState({ clienteId: "", data: "", note: "" });
  const [riga, setRiga] = useState({
    lavorazioneId: "",
    descrizione: "",
    quantita: 1,
    prezzo_unitario: 0,
    totale_riga: 0,
    unita_misura: "",
    note: "",
  });
  const [logoDataUrl, setLogoDataUrl] = useState();
  const [ultimoPreventivoId, setUltimoPreventivoId] = useState(null);
  const [ricerca, setRicerca] = useState("");
  const ragioneSociale = "Copisteria PDF";
  const ragioneSociale1 = "di Daniele Denaci";
  const indirizzoAzienda = "Via Messina 40A";
  const cittaAzienda = "09126 Cagliari";
  const telefono = "Telefono: 070.343121\nWhatsapp: 3294058588";
  const sito = "www.copisteriapdf.it";
  const email = "info@copisteriapdf.it";

  useEffect(() => {
    axios.get(`${API_URL}/api/clienti`).then((res) => setClienti(res.data));
    axios
      .get(`${API_URL}/api/lavorazioni`)
      .then((res) => setLavorazioni(res.data));
    loadPreventivi();
  }, []);

  function loadPreventivi() {
    axios
      .get(`${API_URL}/api/preventivi`)
      .then((res) => setPreventivi(res.data));
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRigaChange(e) {
    let val = e.target.value;
    let nuovo = { ...riga, [e.target.name]: val };
    if (e.target.name === "lavorazioneId") {
      const lav = lavorazioni.find((l) => l.id === parseInt(val));
      nuovo.prezzo_unitario = lav ? lav.prezzo : 0;
      nuovo.descrizione = lav ? lav.descrizione : "";
      nuovo.unita_misura = lav ? lav.unita_misura : "";
    }
    if (e.target.name === "unita_misura") {
      nuovo.unita_misura = val;
    }
    if (e.target.name === "descrizione") {
      nuovo.descrizione = val;
    }
    const quantita =
      e.target.name === "quantita" ? Number(val) : Number(riga.quantita);
    const prezzo_unitario =
      e.target.name === "prezzo_unitario"
        ? Number(val)
        : Number(nuovo.prezzo_unitario);
    nuovo.totale_riga = (quantita * prezzo_unitario).toFixed(2);
    setRiga(nuovo);
  }

  function addRiga() {
    const lav = lavorazioni.find((l) => l.id === parseInt(riga.lavorazioneId));
    setRighe([
      ...righe,
      {
        ...riga,
        descrizione: riga.descrizione || (lav ? lav.descrizione : ""),
        unita_misura: riga.unita_misura || (lav ? lav.unita_misura : ""),
        totale_riga: (riga.quantita * riga.prezzo_unitario).toFixed(2),
      },
    ]);
    setRiga({
      lavorazioneId: "",
      descrizione: "",
      quantita: 1,
      prezzo_unitario: 0,
      totale_riga: 0,
      note: "",
      unita_misura: "",
    });
  }

  function removeRiga(idx) {
    if (
      window.confirm(
        "Vuoi davvero eliminare questa riga dal preventivo in compilazione?"
      )
    ) {
      setRighe(righe.filter((_, i) => i !== idx));
    }
  }

  const totaleNetto = righe.reduce(
    (sum, r) => sum + (parseFloat(r.totale_riga) || 0),
    0
  );
  const iva = (totaleNetto * ALIQUOTA_IVA).toFixed(2);
  const totaleIvato = (totaleNetto + parseFloat(iva)).toFixed(2);

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoDataUrl(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const righeCompilate = righe.map((r) => {
      const lav = lavorazioni.find((l) => l.id === parseInt(r.lavorazioneId));
      return {
        ...r,
        descrizione: r.descrizione || (lav ? lav.descrizione : ""),
      };
    });
    axios
      .post(`${API_URL}/api/preventivi`, {
        ...form,
        totale: totaleIvato,
        righe: righeCompilate,
      })
      .then((res) => {
        setForm({ clienteId: "", data: "", note: "" });
        setRighe([]);
        setUltimoPreventivoId(res.data.id);
        loadPreventivi();
        toast.success("Preventivo salvato!");
      });
  }

  async function esportaPDF(preventivo, righePreventivo) {
    if (
      !window.confirm("Vuoi generare ed esportare il PDF di questo preventivo?")
    )
      return;
    const righePDF = (righePreventivo || []).map((r) => {
      const lav = lavorazioni.find((l) => l.id === parseInt(r.lavorazioneId));
      return {
        ...r,
        descrizione: r.descrizione || (lav ? lav.descrizione : ""),
        unita_misura: r.unita_misura || (lav ? lav.unita_misura : ""),
      };
    });
    const cliente = clienti.find((c) => c.id === preventivo.clienteId) || {};
    // Ottieni il logo in base64 (upload o /logo.png)
    const logo = await getLogoDataUrl(logoDataUrl);
    esportaPreventivoPDF({
      dati: {
        ragioneSociale,
        ragioneSociale1,
        indirizzo: indirizzoAzienda,
        citta: cittaAzienda,
        telefono,
        sito,
        email,
        destinatario: cliente.nomeAzienda || cliente.nome || "",
        destinatario_indirizzo: cliente.indirizzo || "",
        spedizione: cliente.nomeAzienda || cliente.nome || "",
        spedizione_indirizzo: cliente.indirizzo || "",
        data: preventivo.data,
        codice: preventivo.id,
        subtotale: preventivo.totale / 1.22,
        iva: preventivo.totale - preventivo.totale / 1.22,
        totale: preventivo.totale,
        termini:
          "Il presente preventivo ha una validità di 30 gg.\nPagamento alla consegna.",
      },
      righe: righePDF,
      logoDataUrl: logo,
    });
  }

  async function handleDelete(preventivo) {
    if (
      window.confirm(
        "Vuoi davvero cancellare definitivamente questo preventivo?"
      )
    ) {
      await axios.delete(`${API_URL}/api/preventivi/${preventivo.id}`);
      toast.info("Preventivo eliminato!");
      loadPreventivi();
    }
  }

  async function handleConvertiOrdine(preventivo) {
    if (
      window.confirm(
        "Confermi la conversione di questo preventivo in ordine?\nNon sarà più possibile riconvertirlo."
      )
    ) {
      await axios.post(`${API_URL}/api/preventivi/${preventivo.id}/converti`);
      toast.success("Preventivo convertito in ordine!");
      loadPreventivi();
    }
  }

  async function handleSendEmail(preventivo) {
    if (
      window.confirm("Vuoi inviare il preventivo via email al cliente ora?")
    ) {
      await axios.post(`${API_URL}/api/preventivi/${preventivo.id}/email`);
      toast.success("Email inviata!");
    }
  }

  function handleEdit(preventivo) {
    if (
      window.confirm(
        "Attenzione: la funzione modifica/duplicazione non è ancora implementata. Vuoi continuare?"
      )
    ) {
      toast.info("Funzione in sviluppo!");
    }
  }

  // Ricerca filtro live
  const preventiviFiltrati = preventivi.filter((p) => {
    const cliente = clienti.find((c) => c.id === p.clienteId);
    const searchStr = [
      p.id,
      p.data,
      p.totale,
      p.note,
      cliente?.nomeAzienda,
      cliente?.nome,
      cliente?.email,
    ]
      .join(" ")
      .toLowerCase();
    return searchStr.includes(ricerca.toLowerCase());
  });

  // Funzione di controllo: preventivo già convertito in ordine?
  function isConverted(p) {
    return (p.note || "").toLowerCase().includes("convertito in ordine n");
  }

  return (
    <div>
      <ToastContainer />
      <h2>Nuovo Preventivo</h2>
      {/* --- Form Nuovo Preventivo --- */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        <select
          name="clienteId"
          value={form.clienteId}
          onChange={handleFormChange}
        >
          <option value="">Seleziona cliente</option>
          {clienti.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomeAzienda || c.nome}
            </option>
          ))}
        </select>
        <input
          name="data"
          type="date"
          value={form.data}
          onChange={handleFormChange}
        />
        <input
          name="note"
          placeholder="Note"
          value={form.note}
          onChange={handleFormChange}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={righe.length === 0 || !form.clienteId}>
          Salva preventivo
        </button>
      </form>
      <hr />
      <h3>Aggiungi lavorazione</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          name="lavorazioneId"
          value={riga.lavorazioneId}
          onChange={handleRigaChange}
        >
          <option value="">Scegli lavorazione</option>
          {lavorazioni.map((l) => (
            <option key={l.id} value={l.id}>
              {l.descrizione}
            </option>
          ))}
        </select>
        <input
          name="descrizione"
          type="text"
          placeholder="Descrizione lavorazione"
          value={riga.descrizione}
          onChange={handleRigaChange}
          style={{ minWidth: 200 }}
        />
        <input
          name="quantita"
          type="number"
          min="1"
          value={riga.quantita}
          onChange={handleRigaChange}
          placeholder="Q.tà"
        />
        <input
          name="prezzo_unitario"
          type="number"
          min="0"
          step="0.01"
          value={riga.prezzo_unitario}
          onChange={handleRigaChange}
          placeholder="Prezzo unitario"
        />
        <input
          name="note"
          placeholder="Note"
          value={riga.note}
          onChange={handleRigaChange}
        />
        <button
          type="button"
          onClick={addRiga}
          disabled={!riga.lavorazioneId || !riga.quantita}
          style={{
            cursor:
              !riga.lavorazioneId || !riga.quantita ? "default" : "pointer",
          }}
        >
          Aggiungi
        </button>
      </div>
      <div style={{ margin: "16px 0" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          style={{ marginRight: 16 }}
        />
        {/* Esporta PDF solo sul preventivo corrente in inserimento */}
        <button
          type="button"
          onClick={() =>
            esportaPDF(
              {
                ...form,
                id: ultimoPreventivoId,
                totale: totaleIvato,
                data: form.data,
              },
              righe
            )
          }
          disabled={righe.length === 0 || !ultimoPreventivoId}
          style={{
            cursor:
              righe.length === 0 || !ultimoPreventivoId ? "default" : "pointer",
          }}
          title={
            !ultimoPreventivoId
              ? "Salva prima il preventivo per PDF col numero reale"
              : "Esporta PDF"
          }
        >
          <FaFilePdf
            style={{ color: "#ff6600", fontSize: 18, verticalAlign: "middle" }}
          />{" "}
          Esporta PDF
        </button>
      </div>
      {/* Tabella righe */}
      <div
        style={{
          maxHeight: 220,
          overflowY: "auto",
          marginTop: 12,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      >
        <table
          border="1"
          cellPadding={4}
          style={{ width: "100%", fontSize: 13 }}
        >
          <thead>
            <tr>
              <th>Lavorazione</th>
              <th>Descrizione</th>
              <th>Quantità</th>
              <th>U.M.</th>
              <th>Prezzo unitario</th>
              <th>Totale riga</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {righe.map((r, i) => (
              <tr key={i}>
                <td>
                  {lavorazioni.find((l) => l.id === parseInt(r.lavorazioneId))
                    ?.descrizione || ""}
                </td>
                <td>{r.descrizione}</td>
                <td>{r.quantita}</td>
                <td>{r.unita_misura}</td>
                <td>{r.prezzo_unitario}</td>
                <td>{r.totale_riga}</td>
                <td>{r.note}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeRiga(i)}
                    style={{
                      color: "red",
                      cursor: "pointer",
                    }}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Totale con IVA */}
      <div style={{ marginTop: 8, fontWeight: "bold" }}>
        Totale netto: {totaleNetto.toFixed(2)} €<br />
        IVA 22%: {iva} €<br />
        <span style={{ fontSize: 18 }}>Totale ivato: {totaleIvato} €</span>
      </div>
      <h3 style={{ marginTop: 30 }}>Preventivi inseriti</h3>
      <input
        type="text"
        placeholder="Cerca preventivo per cliente, data, note..."
        value={ricerca}
        onChange={(e) => setRicerca(e.target.value)}
        style={{ marginBottom: 6, width: 300 }}
      />
      <div
        style={{
          maxHeight: 220,
          overflowY: "auto",
          marginTop: 10,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      >
        <table
          border="1"
          cellPadding={4}
          style={{ width: "100%", fontSize: 13 }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Totale</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {preventiviFiltrati.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {clienti.find((c) => c.id === p.clienteId)?.nomeAzienda ||
                    clienti.find((c) => c.id === p.clienteId)?.nome}
                </td>
                <td>{p.data ? p.data.slice(0, 10) : ""}</td>
                <td>{p.totale} €</td>
                <td>{p.note}</td>
                <td style={{ display: "flex", gap: 5 }}>
                  <button
                    title="Converti in ordine"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: isConverted(p) ? "not-allowed" : "pointer",
                      opacity: isConverted(p) ? 0.4 : 1,
                    }}
                    disabled={isConverted(p)}
                    onClick={() => !isConverted(p) && handleConvertiOrdine(p)}
                  >
                    <FaCheckCircle color="#ff6600" />
                  </button>
                  <button
                    title="Modifica/duplica"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleEdit(p)}
                  >
                    <FaEdit color="#ff6600" />
                  </button>
                  <button
                    title="Cancella"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDelete(p)}
                  >
                    <FaTrash color="red" />
                  </button>
                  <button
                    title="Esporta PDF"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      const resp = await axios.get(
                        `${API_URL}/api/preventivi/${p.id}`
                      );
                      await esportaPDF(p, resp.data.righe);
                    }}
                  >
                    <FaFilePdf color="#ff6600" />
                  </button>
                  <button
                    title="Invia email"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSendEmail(p)}
                  >
                    <FaEnvelope color="#ff6600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
