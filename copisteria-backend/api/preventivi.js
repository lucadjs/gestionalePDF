import express from "express";
import {
  Preventivo,
  RigaPreventivo,
  Ordine,
  RigaOrdine,
} from "../models/index.js";
// Serve per invio mail e generazione PDF
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// se usi import puoi cambiare __dirname così:
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- GET lista preventivi (senza righe) ---
router.get("/", async (req, res) => {
  const list = await Preventivo.findAll({ order: [["id", "DESC"]] });
  res.json(list);
});

// --- POST nuovo preventivo con righe ---
router.post("/", async (req, res) => {
  const { clienteId, data, note, totale, righe } = req.body;
  const preventivo = await Preventivo.create({ clienteId, data, note, totale });
  for (const riga of righe) {
    await RigaPreventivo.create({
      preventivoId: preventivo.id,
      lavorazioneId: riga.lavorazioneId,
      descrizione: riga.descrizione,
      quantita: riga.quantita,
      prezzo_unitario: riga.prezzo_unitario,
      totale_riga: riga.totale_riga,
      note: riga.note,
    });
  }
  res.json({ ok: true, id: preventivo.id });
});

// --- GET dettagli preventivo con righe ---
router.get("/:id", async (req, res) => {
  const prev = await Preventivo.findByPk(req.params.id, {
    include: [{ model: RigaPreventivo, as: "righe" }],
  });
  res.json(prev);
});

// --- DELETE elimina preventivo (e righe) ---
router.delete("/:id", async (req, res) => {
  await RigaPreventivo.destroy({ where: { preventivoId: req.params.id } });
  await Preventivo.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// --- POST converti in ordine ---
router.post("/:id/converti", async (req, res) => {
  try {
    const prev = await Preventivo.findByPk(req.params.id, {
      include: [{ model: RigaPreventivo, as: "righe" }],
    });
    if (!prev) return res.status(404).json({ error: "Preventivo non trovato" });

    // Crea ordine
    const ordine = await Ordine.create({
      clienteId: prev.clienteId,
      data: new Date(),
      totale: prev.totale,
      note: prev.note,
      stato: "inserito",
    });

    // Copia le righe
    for (const riga of prev.righe) {
      await RigaOrdine.create({
        ordineId: ordine.id,
        lavorazioneId: riga.lavorazioneId,
        descrizione: riga.descrizione,
        quantita: riga.quantita,
        prezzo_unitario: riga.prezzo_unitario,
        totale_riga: riga.totale_riga,
        note: riga.note,
      });
    }

    // Aggiorna le note del preventivo
    let noteAggiornate = prev.note ? prev.note + " | " : "";
    noteAggiornate += `Convertito in ordine n° ${ordine.id}`;
    await prev.update({ note: noteAggiornate });

    res.json({ ok: true, ordineId: ordine.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore conversione ordine" });
  }
});

// --- POST invia email (con PDF allegato) ---
router.post("/:id/email", async (req, res) => {
  // Trova preventivo e righe
  const prev = await Preventivo.findByPk(req.params.id, {
    include: [{ model: RigaPreventivo, as: "righe" }],
  });
  // Trova il cliente per email
  const clienti = await import("../models/index.js"); // (import dinamico se serve)
  const cliente = await clienti.Cliente.findByPk(prev.clienteId);

  // --- Genera PDF temporaneo con pdfmake ---
  // Lato backend NON usare pdfmake (meglio pdfkit o pdf-lib), ma qui puoi simulare PDF:
  const fakePdfPath = path.join(__dirname, `preventivo_${prev.id}.pdf`);
  fs.writeFileSync(fakePdfPath, "PDF FAKE: Genera con pdf-lib, pdfkit, etc..."); // solo placeholder!

  // --- Email con nodemailer ---
  const transporter = nodemailer.createTransport({
    host: "smtp.tuoprovider.it", // es. smtp.gmail.com se usi gmail
    port: 465,
    secure: true,
    auth: {
      user: "TUA_EMAIL@dominio.it",
      pass: "TUA_PASSWORD",
    },
  });

  try {
    await transporter.sendMail({
      from: '"Copisteria PDF" <TUA_EMAIL@dominio.it>',
      to: cliente.email,
      subject: `Il tuo preventivo n°${prev.id} - Copisteria PDF`,
      text: `Buongiorno ${cliente.nomeAzienda || cliente.nome},

in allegato trova il preventivo n°${prev.id}. Grazie per averci scelto!
Cordiali saluti,
Copisteria PDF
www.copisteriapdf.it`,
      attachments: [
        {
          filename: `preventivo_${prev.id}.pdf`,
          path: fakePdfPath,
        },
      ],
    });
    res.json({ ok: true });
  } catch (e) {
    res
      .status(500)
      .json({ ok: false, message: "Errore invio email", error: e });
  }
  // elimina il file temporaneo
  if (fs.existsSync(fakePdfPath)) fs.unlinkSync(fakePdfPath);
});

export default router;
