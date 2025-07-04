import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaCopy } from "react-icons/fa";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const initialFormState = {
  categoria: "",
  nomeAzienda: "",
  nome: "",
  indirizzo: "",
  citta: "",
  provincia: "",
  cap: "",
  telefono: "",
  email: "",
  pec: "",
  codice_fiscale: "",
  partita_iva: "",
  codice_univoco: "",
  attivo: 1,
  attivo_web: 0,
  codice_sconto: "",
  note: "",
  data_registrazione: "",
  ultimo_contatto: "",
};

export default function ClientiForm() {
  const [clienti, setClienti] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    loadClienti();
  }, []);

  function loadClienti() {
    axios.get(`${API_URL}/api/clienti`).then((res) => setClienti(res.data));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      axios.put(`${API_URL}/api/clienti/${editingId}`, form).then(() => {
        setForm(initialFormState);
        setEditingId(null);
        loadClienti();
      });
    } else {
      axios.post(`${API_URL}/api/clienti`, form).then(() => {
        setForm(initialFormState);
        loadClienti();
      });
    }
  }

  function handleEdit(cliente) {
    setForm({ ...cliente });
    setEditingId(cliente.id);
  }

  function handleDelete(id) {
    if (window.confirm("Vuoi cancellare questo cliente?")) {
      axios.delete(`${API_URL}/api/clienti/${id}`).then(loadClienti);
      if (editingId === id) {
        setEditingId(null);
        setForm(initialFormState);
      }
    }
  }

  function handleDuplica(cliente) {
    // Crea un nuovo oggetto senza id e data_registrazione, ultimo_contatto
    const copia = { ...cliente };
    delete copia.id;
    delete copia.data_registrazione;
    delete copia.ultimo_contatto;
    setForm(copia);
    setEditingId(null); // In modalità nuovo inserimento!
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setForm(initialFormState);
    setEditingId(null);
  }

  return (
    <div>
      <h3>Anagrafica Clienti</h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {/* ... (tutti gli input e i campi come già presenti) ... */}
        <select name="categoria" value={form.categoria} onChange={handleChange}>
          <option value="">Categoria</option>
          <option value="a">Azienda</option>
          <option value="p">Privato</option>
          <option value="s">Studente</option>
        </select>
        <input
          name="nomeAzienda"
          placeholder="Nome azienda"
          value={form.nomeAzienda}
          onChange={handleChange}
        />
        <input
          name="nome"
          placeholder="Nome o referente"
          value={form.nome}
          onChange={handleChange}
        />
        <input
          name="indirizzo"
          placeholder="Indirizzo"
          value={form.indirizzo}
          onChange={handleChange}
        />
        <input
          name="citta"
          placeholder="Città"
          value={form.citta}
          onChange={handleChange}
        />
        <input
          name="provincia"
          placeholder="Provincia"
          value={form.provincia}
          onChange={handleChange}
        />
        <input
          name="cap"
          placeholder="CAP"
          value={form.cap}
          onChange={handleChange}
        />
        <input
          name="telefono"
          placeholder="Telefono"
          value={form.telefono}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="pec"
          placeholder="PEC"
          value={form.pec}
          onChange={handleChange}
        />
        <input
          name="codice_fiscale"
          placeholder="Codice fiscale"
          value={form.codice_fiscale}
          onChange={handleChange}
        />
        <input
          name="partita_iva"
          placeholder="Partita IVA"
          value={form.partita_iva}
          onChange={handleChange}
        />
        <input
          name="codice_univoco"
          placeholder="Codice univoco"
          value={form.codice_univoco}
          onChange={handleChange}
        />
        <input
          name="codice_sconto"
          placeholder="Codice sconto"
          value={form.codice_sconto}
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

      <h4 style={{ marginTop: 10 }}>Clienti inseriti</h4>
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
              <th>Categoria</th>
              <th>Azienda</th>
              <th>Nome</th>
              <th>Indirizzo</th>
              <th>Città</th>
              <th>Provincia</th>
              <th>CAP</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>PEC</th>
              <th>CF</th>
              <th>P.IVA</th>
              <th>Codice Univoco</th>
              <th>Sconto</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clienti
              .filter((c) => {
                if (!filtro) return true;
                const values = Object.values(c).join(" ").toLowerCase();
                return values.includes(filtro.toLowerCase());
              })
              .map((c, i) => (
                <tr
                  key={c.id}
                  style={{ background: i % 2 ? "#f7f7fa" : "#fff" }}
                >
                  <td>{c.categoria}</td>
                  <td>{c.nomeAzienda}</td>
                  <td>{c.nome}</td>
                  <td>{c.indirizzo}</td>
                  <td>{c.citta}</td>
                  <td>{c.provincia}</td>
                  <td>{c.cap}</td>
                  <td>{c.telefono}</td>
                  <td>{c.email}</td>
                  <td>{c.pec}</td>
                  <td>{c.codice_fiscale}</td>
                  <td>{c.partita_iva}</td>
                  <td>{c.codice_univoco}</td>
                  <td>{c.codice_sconto}</td>
                  <td>{c.note}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      title="Duplica cliente"
                      onClick={() => handleDuplica(c)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <FaCopy color="#ff6600" />
                    </button>
                    <button
                      type="button"
                      title="Modifica"
                      onClick={() => handleEdit(c)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <FaEdit color="#ffd700" />
                    </button>
                    <button
                      type="button"
                      title="Cancella"
                      onClick={() => handleDelete(c.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <FaTrash color="red" />
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
