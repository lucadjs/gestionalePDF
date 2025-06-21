// routes/utenti.js
import express from "express";
import bcrypt from "bcrypt";
import { Utente } from "../models/index.js";
const router = express.Router();

// LISTA utenti (admin solo) - puoi proteggerla con middleware in seguito
router.get("/", async (req, res) => {
  const list = await Utente.findAll();
  res.json(list);
});

// AGGIUNGI utente (admin)
router.post("/", async (req, res) => {
  const {
    nome, // CAMBIATO da username a nome!
    password,
    email,
    ruolo = "privato",
    attivo = true,
  } = req.body;
  if (!nome || !password)
    return res.status(400).json({ error: "Nome e password obbligatori" });
  const hash = await bcrypt.hash(password, 10);
  const utente = await Utente.create({
    nome, // CAMBIATO da username a nome!
    password_hash: hash,
    email,
    ruolo,
    attivo,
  });
  res.json(utente);
});

// MODIFICA utente (puoi anche proteggere per ruolo admin)
router.put("/:id", async (req, res) => {
  const { email, ruolo, attivo, password } = req.body;
  const utente = await Utente.findByPk(req.params.id);
  if (!utente) return res.status(404).json({ error: "Utente non trovato" });
  utente.email = email ?? utente.email;
  utente.ruolo = ruolo ?? utente.ruolo;
  utente.attivo = attivo ?? utente.attivo;
  if (password) utente.password_hash = await bcrypt.hash(password, 10);
  await utente.save();
  res.json(utente);
});

// DISATTIVA/ATTIVA utente (toggle)
router.patch("/:id/attivo", async (req, res) => {
  const utente = await Utente.findByPk(req.params.id);
  if (!utente) return res.status(404).json({ error: "Utente non trovato" });
  utente.attivo = !utente.attivo;
  await utente.save();
  res.json(utente);
});

// CANCELLA utente (solo admin)
router.delete("/:id", async (req, res) => {
  const utente = await Utente.findByPk(req.params.id);
  if (!utente) return res.status(404).json({ error: "Utente non trovato" });
  await utente.destroy();
  res.json({ ok: true });
});

export default router;
