import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const RUOLI = [
  { value: "admin", label: "Admin" },
  { value: "privato", label: "Privato" },
  { value: "azienda", label: "Azienda" },
  { value: "studente", label: "Studente" },
];

export default function UtentiForm() {
  const [utenti, setUtenti] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    password: "",
    email: "",
    ruolo: "privato",
    attivo: true,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadUtenti();
  }, []);

  function loadUtenti() {
    axios.get(`${API_URL}/api/utenti`).then((res) => setUtenti(res.data));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || (!editId && !form.password))
      return alert("Nome e password obbligatori!");
    if (editId) {
      axios.put(`${API_URL}/api/utenti/${editId}`, form).then(() => {
        setEditId(null);
        setForm({
          nome: "",
          password: "",
          email: "",
          ruolo: "privato",
          attivo: true,
        });
        loadUtenti();
      });
    } else {
      axios.post(`${API_URL}/api/utenti`, form).then(() => {
        setForm({
          nome: "",
          password: "",
          email: "",
          ruolo: "privato",
          attivo: true,
        });
        loadUtenti();
      });
    }
  }

  function handleEdit(u) {
    setEditId(u.id);
    setForm({
      nome: u.nome,
      password: "",
      email: u.email || "",
      ruolo: u.ruolo || "privato",
      attivo: u.attivo,
    });
  }

  function handleDelete(u) {
    if (window.confirm("Vuoi eliminare questo utente?")) {
      axios.delete(`${API_URL}/api/utenti/${u.id}`).then(loadUtenti);
    }
  }

  function toggleAttivo(u) {
    axios.patch(`${API_URL}/api/utenti/${u.id}/attivo`).then(loadUtenti);
  }

  return (
    <div>
      <h2>{editId ? "Modifica Utente" : "Nuovo Utente"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <input
          name="nome"
          placeholder="Nome utente"
          value={form.nome}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder={editId ? "Nuova Password (opzionale)" : "Password"}
          type="password"
          value={form.password}
          onChange={handleChange}
          required={!editId}
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <select name="ruolo" value={form.ruolo} onChange={handleChange}>
          {RUOLI.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <label>
          <input
            name="attivo"
            type="checkbox"
            checked={form.attivo}
            onChange={handleChange}
          />
          Attivo
        </label>
        <button type="submit">
          {editId ? "Salva Modifiche" : "Aggiungi Utente"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({
                nome: "",
                password: "",
                email: "",
                ruolo: "privato",
                attivo: true,
              });
            }}
          >
            Annulla
          </button>
        )}
      </form>
      <h3>Utenti Registrati</h3>
      <table
        border="1"
        cellPadding={4}
        style={{ width: "100%", marginTop: 10 }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Ruolo</th>
            <th>Attivo</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {utenti.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.ruolo}</td>
              <td>
                <input
                  type="checkbox"
                  checked={u.attivo}
                  onChange={() => toggleAttivo(u)}
                />
              </td>
              <td>
                <button onClick={() => handleEdit(u)}>Modifica</button>
                <button
                  onClick={() => handleDelete(u)}
                  style={{ color: "red", marginLeft: 4 }}
                >
                  Elimina
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
