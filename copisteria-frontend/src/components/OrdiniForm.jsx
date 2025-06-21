import React, { useState, useEffect } from "react";
import axios from "axios";
import { esportaOrdinePDF } from "../utils/pdfOrdine"; // Riutilizziamo anche per Ordini
import { FaFilePdf, FaEdit, FaTrash, FaEnvelope, FaCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "";
const ALIQUOTA_IVA = 0.22;

function formattaDataIt(data) {
  if (!data) return "";
  // accetta sia formato ISO (2024-07-01) che Date JS
  const d = typeof data === "string" ? new Date(data) : data;
  if (isNaN(d)) return data; // fallback su testo originale
  return d
    .toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "/");
}

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

export default function OrdiniForm() {
  const [clienti, setClienti] = useState([]);
  const [lavorazioni, setLavorazioni] = useState([]);
  const [ordini, setOrdini] = useState([]);
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
  const [ultimoOrdineId, setUltimoOrdineId] = useState(null);
  const [ricerca, setRicerca] = useState("");
  const [editId, setEditId] = useState(null);

  // Dati azienda
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
    loadOrdini();
  }, []);

  function loadOrdini() {
    axios.get(`${API_URL}/api/ordini`).then((res) => setOrdini(res.data));
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
        "Vuoi davvero eliminare questa riga dall’ordine in compilazione?"
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
    if (editId) {
      axios
        .put(`${API_URL}/api/ordini/${editId}`, {
          ...form,
          totale: totaleIvato,
          righe: righeCompilate,
        })
        .then(() => {
          setForm({ clienteId: "", data: "", note: "" });
          setRighe([]);
          setEditId(null);
          setUltimoOrdineId(null);
          loadOrdini();
          toast.success("Ordine modificato!");
        });
    } else {
      axios
        .post(`${API_URL}/api/ordini`, {
          ...form,
          totale: totaleIvato,
          righe: righeCompilate,
        })
        .then((res) => {
          setForm({ clienteId: "", data: "", note: "" });
          setRighe([]);
          setUltimoOrdineId(res.data.id);
          loadOrdini();
          toast.success("Ordine salvato!");
        });
    }
  }

  async function esportaPDF(ordine, righeOrdine) {
    if (!window.confirm("Vuoi generare ed esportare il PDF di questo ordine?"))
      return;
    const righePDF = (righeOrdine || []).map((r) => {
      const lav = lavorazioni.find((l) => l.id === parseInt(r.lavorazioneId));
      return {
        ...r,
        descrizione: r.descrizione || (lav ? lav.descrizione : ""),
        unita_misura: r.unita_misura || (lav ? lav.unita_misura : ""),
      };
    });
    const cliente = clienti.find((c) => c.id === ordine.clienteId) || {};
    const logo = await getLogoDataUrl(logoDataUrl);
    esportaOrdinePDF({
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
        data: ordine.data,
        codice: ordine.id,
        subtotale: ordine.totale / 1.22,
        iva: ordine.totale - ordine.totale / 1.22,
        totale: ordine.totale,
        termini: "Il presente ordine sarà evaso secondo i termini pattuiti.",
      },
      righe: righePDF,
      logoDataUrl: logo,
    });
  }

  async function handleDelete(ordine) {
    if (
      window.confirm("Vuoi davvero cancellare definitivamente questo ordine?")
    ) {
      await axios.delete(`${API_URL}/api/ordini/${ordine.id}`);
      toast.info("Ordine eliminato!");
      loadOrdini();
    }
  }

  async function handleEdit(ordine) {
    const resp = await axios.get(`${API_URL}/api/ordini/${ordine.id}`);
    setEditId(ordine.id);
    setUltimoOrdineId(ordine.id);
    setForm({
      clienteId: ordine.clienteId,
      data: ordine.data?.slice(0, 10) || "",
      note: ordine.note || "",
    });
    setRighe(
      (resp.data.righe || []).map((r) => ({
        ...r,
        lavorazioneId: r.lavorazioneId || "",
        descrizione: r.descrizione || "",
        quantita: r.quantita,
        prezzo_unitario: r.prezzo_unitario,
        totale_riga: r.totale_riga,
        note: r.note || "",
        unita_misura: r.unita_misura || "",
      }))
    );
    toast.info("Modifica l'ordine e salva per confermare!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Ricerca filtro live
  const ordiniFiltrati = ordini.filter((o) => {
    const cliente = clienti.find((c) => c.id === o.clienteId);
    const searchStr = [
      o.id,
      o.data,
      o.totale,
      o.note,
      cliente?.nomeAzienda,
      cliente?.nome,
      cliente?.email,
    ]
      .join(" ")
      .toLowerCase();
    return searchStr.includes(ricerca.toLowerCase());
  });

  return (
    <div>
      <ToastContainer />
      <h2>{editId ? "Modifica Ordine" : "Nuovo Ordine"}</h2>
      {/* --- Form Nuovo/Modifica Ordine --- */}
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
          {editId ? "Salva Modifiche" : "Salva Ordine"}
        </button>
        {editId && (
          <button
            type="button"
            style={{ marginLeft: 8 }}
            onClick={() => {
              setEditId(null);
              setForm({ clienteId: "", data: "", note: "" });
              setRighe([]);
              setUltimoOrdineId(null);
              toast.info("Inserimento nuovo ordine ripristinato.");
            }}
          >
            Annulla modifica
          </button>
        )}
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
        <button
          type="button"
          onClick={() =>
            esportaPDF(
              {
                ...form,
                id: ultimoOrdineId || editId,
                totale: totaleIvato,
                data: form.data,
                clienteId: form.clienteId,
              },
              righe
            )
          }
          disabled={righe.length === 0 || !(ultimoOrdineId || editId)}
          style={{
            cursor:
              righe.length === 0 || !(ultimoOrdineId || editId)
                ? "default"
                : "pointer",
          }}
          title={
            !(ultimoOrdineId || editId)
              ? "Salva prima l’ordine per PDF col numero reale"
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
      <h3 style={{ marginTop: 30 }}>Ordini inseriti</h3>
      <input
        type="text"
        placeholder="Cerca ordine per cliente, data, note..."
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
            {ordiniFiltrati.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  {clienti.find((c) => c.id === o.clienteId)?.nomeAzienda ||
                    clienti.find((c) => c.id === o.clienteId)?.nome}
                </td>
                <td>{formattaDataIt(o.data)}</td>
                <td>{o.totale} €</td>
                <td>{o.note}</td>
                <td style={{ display: "flex", gap: 5 }}>
                  {/* MODIFICA */}
                  <button
                    title="Modifica"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleEdit(o)}
                  >
                    <FaEdit color="#ff6600" />
                  </button>
                  {/* CANCELLA */}
                  <button
                    title="Cancella"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDelete(o)}
                  >
                    <FaTrash color="red" />
                  </button>
                  {/* PDF */}
                  <button
                    title="Esporta PDF"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      const resp = await axios.get(
                        `${API_URL}/api/ordini/${o.id}`
                      );
                      await esportaPDF(o, resp.data.righe);
                    }}
                  >
                    <FaFilePdf color="#ff6600" />
                  </button>
                  {/* DUPLICA (se vuoi, puoi aggiungerla come per i preventivi) */}
                  {/* <button ... >
                      <FaCopy color="#ff6600" />
                  </button> */}
                  {/* Email: puoi implementare se vuoi il flusso anche per ordine */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
