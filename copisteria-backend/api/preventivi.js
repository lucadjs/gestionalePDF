import express from "express";
import {
  Preventivo,
  RigaPreventivo,
  Ordine,
  RigaOrdine,
  Cliente,
} from "../models/index.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { format, utcToZonedTime } from "date-fns-tz";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

function formattaDataITA(data = new Date()) {
  const timeZone = "Europe/Rome";
  const zonedDate = utcToZonedTime(data, timeZone);
  return format(zonedDate, "dd/MM/yyyy HH:mm", { timeZone });
}

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

// --- PUT modifica preventivo + righe ---
router.put("/:id", async (req, res) => {
  const { clienteId, data, note, totale, righe } = req.body;
  // Aggiorna preventivo
  await Preventivo.update(
    { clienteId, data, note, totale },
    { where: { id: req.params.id } }
  );
  // Elimina righe vecchie e reinserisci nuove
  await RigaPreventivo.destroy({ where: { preventivoId: req.params.id } });
  for (const riga of righe) {
    await RigaPreventivo.create({
      preventivoId: req.params.id,
      lavorazioneId: riga.lavorazioneId,
      descrizione: riga.descrizione,
      quantita: riga.quantita,
      prezzo_unitario: riga.prezzo_unitario,
      totale_riga: riga.totale_riga,
      note: riga.note,
    });
  }
  res.json({ ok: true });
});

// --- POST duplica preventivo (ritorna nuovo id) ---
// POST /api/preventivi/:id/duplica
router.post("/:id/duplica", async (req, res) => {
  const prev = await Preventivo.findByPk(req.params.id, {
    include: [{ model: RigaPreventivo, as: "righe" }],
  });
  if (!prev) return res.status(404).json({ error: "Preventivo non trovato" });

  // Nuovo preventivo (NO conversione, note vuote)
  const newPrev = await Preventivo.create({
    clienteId: prev.clienteId,
    data: new Date(),
    note: "",
    totale: prev.totale,
  });
  for (const r of prev.righe) {
    await RigaPreventivo.create({
      preventivoId: newPrev.id,
      lavorazioneId: r.lavorazioneId,
      descrizione: r.descrizione,
      quantita: r.quantita,
      prezzo_unitario: r.prezzo_unitario,
      totale_riga: r.totale_riga,
      note: r.note,
    });
  }
  res.json({ ok: true, id: newPrev.id });
});

// --- POST converti in ordine (già presente) ---
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

    // Aggiorna note
    let noteAggiornate = prev.note ? prev.note + " | " : "";
    noteAggiornate += `Convertito in ordine n° ${ordine.id}`;
    await prev.update({ note: noteAggiornate });

    res.json({ ok: true, ordineId: ordine.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore conversione ordine" });
  }
});
// --- INVIO EMAIL con allegato PDF (BASE64 dal frontend) ---
router.post("/:id/email", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;
    const preventivo = await Preventivo.findByPk(req.params.id, {
      include: [
        { model: RigaPreventivo, as: "righe" },
        { model: Cliente, as: "cliente" },
      ],
    });
    if (!preventivo)
      return res.status(404).json({ error: "Preventivo non trovato" });

    const cliente = preventivo.cliente;
    if (!cliente?.email)
      return res.status(400).json({ error: "Email cliente mancante" });

    // Prepara email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Oggetto e messaggio personalizzabili
    const subject = `Copisteria PDF Preventivo n° ${preventivo.id}`;
    const text = `Buongiorno ${cliente.nomeAzienda || cliente.nome || ""},

in allegato trova il preventivo richiesto (n° ${
      preventivo.id
    }) con tutti i dettagli.  
Per qualsiasi domanda non esiti a contattarci.

Cordiali saluti,
Copisteria PDF`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: cliente.email,
      subject,
      text,
      attachments: [
        {
          filename: `Copisteria PDF_preventivo n. ${preventivo.id}.pdf`,
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
      ],
    });
    // Aggiorna note
    let noteAggiornate = preventivo.note ? preventivo.note + " | " : "";
    noteAggiornate += `Inviata email in data ${formattaDataITA()}`;
    await preventivo.update({ note: noteAggiornate });

    res.json({ ok: true });
  } catch (err) {
    console.error("Errore invio email:", err);
    res.status(500).json({ error: "Errore invio email" });
  }
});

export default router;
