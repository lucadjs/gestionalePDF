import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Utente } from "../models/index.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "changemeSecret123";

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  const utente = await Utente.findOne({ where: { nome: username } });
  if (!utente || !utente.attivo)
    return res
      .status(401)
      .json({ error: "Credenziali errate o utente disattivato" });

  const match = await bcrypt.compare(password, utente.password_hash);
  if (!match) return res.status(401).json({ error: "Credenziali errate" });

  // JWT: salva id, username, ruolo
  const token = jwt.sign(
    { id: utente.id, username: utente.nome, ruolo: utente.ruolo },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token, ruolo: utente.ruolo, username: utente.nome });
});

export default router;
