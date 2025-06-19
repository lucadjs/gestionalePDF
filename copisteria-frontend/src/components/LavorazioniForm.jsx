import React, { useEffect, useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "";

const initialFormState = {
  tipo_id: "",
  descrizione: "",
  unita_misura: "",
  prezzo: "",
  supporto_id: "",
  grammatura: "",
  note: "",
  attivo: 1,
};

export default function LavorazioniForm() {
  const [lavorazioni, setLavorazioni] = useState([]);
  const [tipiLav, setTipiLav] = useState([]);
  const [supporti, setSupporti] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/lookup/tipi_lavorazione`)
      .then((res) => setTipiLav(res.data));
    axios
      .get(`${API_URL}/api/lookup/supporti`)
      .then((res) => setSupporti(res.data));
    loadLavorazioni();
  }, []);

  function loadLavorazioni() {
    axios
      .get(`${API_URL}/api/lavorazioni`)
      .then((res) => setLavorazioni(res.data));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      axios.put(`${API_URL}/api/lavorazioni/${editingId}`, form).then(() => {
        setForm(initialFormState);
        setEditingId(null);
        loadLavorazioni();
      });
    } else {
      axios.post(`${API_URL}/api/lavorazioni`, form).then(() => {
        setForm(initialFormState);
        loadLavorazioni();
      });
    }
  }

  function handleEdit(lav) {
    setForm({ ...lav });
    setEditingId(lav.id);
  }

  function handleDelete(id) {
    if (window.confirm("Vuoi cancellare questa lavorazione?")) {
      axios.delete(`${API_URL}/api/lavorazioni/${id}`).then(loadLavorazioni);
      if (editingId === id) {
        setEditingId(null);
        setForm(initialFormState);
      }
    }
  }

  function handleCancel() {
    setForm(initialFormState);
    setEditingId(null);
  }

  return (
    <div>
      <h2>Gestione Lavorazioni</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        <select name="tipo_id" value={form.tipo_id} onChange={handleChange}>
          <option value="">Tipo lavorazione</option>
          {tipiLav.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        <input
          name="descrizione"
          placeholder="Descrizione"
          value={form.descrizione}
          onChange={handleChange}
        />
        <input
          name="unita_misura"
          placeholder="Unità misura"
          value={form.unita_misura}
          onChange={handleChange}
        />
        <input
          name="prezzo"
          type="number"
          placeholder="Prezzo"
          value={form.prezzo}
          onChange={handleChange}
        />
        <select
          name="supporto_id"
          value={form.supporto_id}
          onChange={handleChange}
        >
          <option value="">Supporto</option>
          {supporti.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
        <input
          name="grammatura"
          placeholder="Grammatura"
          value={form.grammatura}
          onChange={handleChange}
        />
        <input
          name="note"
          placeholder="Note"
          value={form.note}
          onChange={handleChange}
        />
        <button type="submit">{editingId ? "Salva modifica" : "Salva"}</button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            style={{ background: "#ffcccc" }}
          >
            Annulla modifica
          </button>
        )}
      </form>

      <input
        placeholder="Cerca in tutti i campi..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{ margin: "16px 0", width: 240 }}
      />

      <h3 style={{ marginTop: 10 }}>Lavorazioni inserite</h3>
      <div
        style={{
          maxHeight: 320,
          overflowY: "auto",
          marginTop: 10,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      >
        <table
          border="1"
          cellPadding={4}
          style={{ width: "100%", fontSize: 13, background: "#fff" }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#f8f8f8",
              zIndex: 2,
            }}
          >
            <tr>
              <th>Tipo</th>
              <th>Descrizione</th>
              <th>Unità misura</th>
              <th>Prezzo</th>
              <th>Supporto</th>
              <th>Grammatura</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {lavorazioni
              .filter((l) => {
                if (!filtro) return true;
                const values = Object.values(l).join(" ").toLowerCase();
                return values.includes(filtro.toLowerCase());
              })
              .map((l, i) => (
                <tr
                  key={l.id}
                  style={{ background: i % 2 ? "#f7f7fa" : "#fff" }}
                >
                  <td>{tipiLav.find((t) => t.id === l.tipo_id)?.nome}</td>
                  <td>{l.descrizione}</td>
                  <td>{l.unita_misura}</td>
                  <td>{l.prezzo}</td>
                  <td>{supporti.find((s) => s.id === l.supporto_id)?.nome}</td>
                  <td>{l.grammatura}</td>
                  <td>{l.note}</td>
                  <td>
                    <button type="button" onClick={() => handleEdit(l)}>
                      Modifica
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(l.id)}
                      style={{ color: "red" }}
                    >
                      Cancella
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
