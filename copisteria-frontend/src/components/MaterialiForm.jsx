import React, { useEffect, useState } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const initialFormState = {
  codforn: "",
  tipo_id: "",
  formato_id: "",
  descrizione: "",
  grammatura: "",
  finitura: "",
  colore: "",
  dimensione: "",
  unita_misura: "",
  confezione: "",
  prezzo_acquisto: "",
  prezzo_vendita: "",
  note: "",
  attivo: 1,
};

export default function MaterialiForm() {
  const [materiali, setMateriali] = useState([]);
  const [tipi, setTipi] = useState([]);
  const [formati, setFormati] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/lookup/tipi_materiale`)
      .then((res) => setTipi(res.data));
    axios
      .get(`${API_BASE_URL}/api/lookup/formati_materiale`)
      .then((res) => setFormati(res.data));
    loadMateriali();
  }, []);

  function loadMateriali() {
    axios
      .get(`${API_BASE_URL}/api/materiali`)
      .then((res) => setMateriali(res.data));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      axios.put(`${API_BASE_URL}/api/materiali/${editingId}`, form).then(() => {
        setForm(initialFormState);
        setEditingId(null);
        loadMateriali();
      });
    } else {
      axios.post(`${API_BASE_URL}0/api/materiali`, form).then(() => {
        setForm(initialFormState);
        loadMateriali();
      });
    }
  }

  function handleEdit(materiale) {
    setForm({ ...materiale });
    setEditingId(materiale.id);
  }

  function handleDelete(id) {
    if (window.confirm("Vuoi cancellare questo materiale?")) {
      axios.delete(`${API_BASE_URL}/api/materiali/${id}`).then(loadMateriali);
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
      <h2>Gestione Materiali</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        <input
          name="codforn"
          placeholder="Codice fornitore"
          value={form.codforn}
          onChange={handleChange}
        />
        <select name="tipo_id" value={form.tipo_id} onChange={handleChange}>
          <option value="">Tipo materiale</option>
          {tipi.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        <select
          name="formato_id"
          value={form.formato_id}
          onChange={handleChange}
        >
          <option value="">Formato</option>
          {formati.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
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
          name="grammatura"
          placeholder="Grammatura"
          value={form.grammatura}
          onChange={handleChange}
        />
        <input
          name="finitura"
          placeholder="Finitura"
          value={form.finitura}
          onChange={handleChange}
        />
        <input
          name="colore"
          placeholder="Colore"
          value={form.colore}
          onChange={handleChange}
        />
        <input
          name="dimensione"
          placeholder="Dimensione"
          value={form.dimensione}
          onChange={handleChange}
        />
        <input
          name="unita_misura"
          placeholder="Unità misura"
          value={form.unita_misura}
          onChange={handleChange}
        />
        <input
          name="confezione"
          placeholder="Confezione"
          value={form.confezione}
          onChange={handleChange}
        />
        <input
          name="prezzo_acquisto"
          type="number"
          placeholder="Prezzo acquisto"
          value={form.prezzo_acquisto}
          onChange={handleChange}
        />
        <input
          name="prezzo_vendita"
          type="number"
          placeholder="Prezzo vendita"
          value={form.prezzo_vendita}
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

      <h3 style={{ marginTop: 10 }}>Materiali inseriti</h3>
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
              <th>Codforn</th>
              <th>Tipo</th>
              <th>Formato</th>
              <th>Descrizione</th>
              <th>Grammatura</th>
              <th>Finitura</th>
              <th>Colore</th>
              <th>Dimensione</th>
              <th>Unità misura</th>
              <th>Confezione</th>
              <th>Prezzo acquisto</th>
              <th>Prezzo vendita</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {materiali
              .filter((m) => {
                if (!filtro) return true;
                const values = Object.values(m).join(" ").toLowerCase();
                return values.includes(filtro.toLowerCase());
              })
              .map((m, i) => (
                <tr
                  key={m.id}
                  style={{ background: i % 2 ? "#f7f7fa" : "#fff" }}
                >
                  <td>{m.codforn}</td>
                  <td>{tipi.find((t) => t.id === m.tipo_id)?.nome}</td>
                  <td>{formati.find((f) => f.id === m.formato_id)?.nome}</td>
                  <td>{m.descrizione}</td>
                  <td>{m.grammatura}</td>
                  <td>{m.finitura}</td>
                  <td>{m.colore}</td>
                  <td>{m.dimensione}</td>
                  <td>{m.unita_misura}</td>
                  <td>{m.confezione}</td>
                  <td>{m.prezzo_acquisto}</td>
                  <td>{m.prezzo_vendita}</td>
                  <td>{m.note}</td>
                  <td>
                    <button type="button" onClick={() => handleEdit(m)}>
                      Modifica
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
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
