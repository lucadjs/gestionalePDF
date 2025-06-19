import express from "express";
import {
  Ordine,
  RigaOrdine,
  Preventivo,
  RigaPreventivo,
} from "../models/index.js";

const router = express.Router();

// POST /api/ordini/da-preventivo/:id
router.post("/da-preventivo/:id", async (req, res) => {
  const preventivoId = req.params.id;
  const prev = await Preventivo.findByPk(preventivoId, {
    include: [{ model: RigaPreventivo, as: "righe" }],
  });

  if (!prev) return res.status(404).json({ error: "Preventivo non trovato" });

  // Crea nuovo ordine
  const ordine = await Ordine.create({
    clienteId: prev.clienteId,
    data: new Date(),
    note: prev.note,
    totale: prev.totale,
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

  res.json({ ok: true, ordineId: ordine.id });
});

export default router;
