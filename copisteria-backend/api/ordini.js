import express from "express";
import {
  Ordine,
  RigaOrdine,
  Preventivo,
  RigaPreventivo,
} from "../models/index.js";

const router = express.Router();

// GET lista ordini
router.get("/", async (req, res) => {
  const list = await Ordine.findAll({ order: [["id", "DESC"]] });
  res.json(list);
});

// POST nuovo ordine
router.post("/", async (req, res) => {
  const { clienteId, data, note, totale, righe } = req.body;
  const ordine = await Ordine.create({
    clienteId,
    data,
    note,
    totale,
    stato: "inserito",
  });
  for (const riga of righe) {
    await RigaOrdine.create({
      ordineId: ordine.id,
      lavorazioneId: riga.lavorazioneId,
      descrizione: riga.descrizione,
      quantita: riga.quantita,
      prezzo_unitario: riga.prezzo_unitario,
      totale_riga: riga.totale_riga,
      note: riga.note,
      unita_misura: riga.unita_misura || "",
    });
  }
  res.json({ ok: true, id: ordine.id });
});

// DELETE ordine
router.delete("/:id", async (req, res) => {
  await RigaOrdine.destroy({ where: { ordineId: req.params.id } });
  await Ordine.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// PUT modifica ordine
router.put("/:id", async (req, res) => {
  const { clienteId, data, note, totale, righe } = req.body;
  await Ordine.update(
    { clienteId, data, note, totale },
    { where: { id: req.params.id } }
  );
  await RigaOrdine.destroy({ where: { ordineId: req.params.id } });
  for (const riga of righe) {
    await RigaOrdine.create({
      ordineId: req.params.id,
      lavorazioneId: riga.lavorazioneId,
      descrizione: riga.descrizione,
      quantita: riga.quantita,
      prezzo_unitario: riga.prezzo_unitario,
      totale_riga: riga.totale_riga,
      note: riga.note,
      unita_misura: riga.unita_misura || "",
    });
  }
  res.json({ ok: true });
});

// GET dettaglio ordine + righe
router.get("/:id", async (req, res) => {
  const ordine = await Ordine.findByPk(req.params.id, {
    include: [{ model: RigaOrdine, as: "righe" }],
  });
  res.json(ordine);
});

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
