import express from "express";
import bcrypt from "bcrypt";
import { Utente } from "../models/index.js";
import { authRequired, onlyAdmin } from "../middlewares/auth.js"; // <---

const router = express.Router();

// LISTA utenti (solo admin)
router.get("/", authRequired, onlyAdmin, async (req, res) => {
  const list = await Utente.findAll();
  res.json(list);
});

// AGGIUNGI utente (solo admin)
router.post("/", authRequired, onlyAdmin, async (req, res) => {
  const {
    nome, // <-- o username, usa quello che hai nel modello!
    password,
    email,
    ruolo = "privato",
    attivo = true,
  } = req.body;
  if (!nome || !password)
    return res.status(400).json({ error: "Nome e password obbligatori" });
  const hash = await bcrypt.hash(password, 10);
  const utente = await Utente.create({
    nome,
    password_hash: hash,
    email,
    ruolo,
    attivo,
  });
  res.json(utente);
});

// MODIFICA utente (solo admin)
router.put("/:id", authRequired, onlyAdmin, async (req, res) => {
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

// DISATTIVA/ATTIVA utente (solo admin)
router.patch("/:id/attivo", authRequired, onlyAdmin, async (req, res) => {
  const utente = await Utente.findByPk(req.params.id);
  if (!utente) return res.status(404).json({ error: "Utente non trovato" });
  utente.attivo = !utente.attivo;
  await utente.save();
  res.json(utente);
});

// CANCELLA utente (solo admin)
router.delete("/:id", authRequired, onlyAdmin, async (req, res) => {
  const utente = await Utente.findByPk(req.params.id);
  if (!utente) return res.status(404).json({ error: "Utente non trovato" });
  await utente.destroy();
  res.json({ ok: true });
});

export default router;
