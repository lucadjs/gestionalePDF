import {
  sequelize,
  Preventivo,
  RigaPreventivo,
  Ordine,
  RigaOrdine,
} from "../models/index.js";

export default async function handler(req, res) {
  await sequelize.sync();

  // GET /api/preventivi?id=   (dettagli) oppure solo lista
  if (req.method === "GET") {
    const { id } = req.query;
    if (id) {
      const prev = await Preventivo.findByPk(id, {
        include: [{ model: RigaPreventivo, as: "righe" }],
      });
      return res.status(200).json(prev);
    } else {
      const list = await Preventivo.findAll({ order: [["id", "DESC"]] });
      return res.status(200).json(list);
    }
  }

  // POST /api/preventivi  (crea nuovo preventivo + righe)
  if (req.method === "POST") {
    const { clienteId, data, note, totale, righe } = req.body;
    const preventivo = await Preventivo.create({
      clienteId,
      data,
      note,
      totale,
    });
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
    return res.status(201).json({ ok: true, id: preventivo.id });
  }

  // DELETE /api/preventivi?id=
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID mancante" });
    await RigaPreventivo.destroy({ where: { preventivoId: id } });
    await Preventivo.destroy({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  // POST /api/preventivi?id=...&converti=1  (converte in ordine)
  if (req.method === "PUT" && req.query.converti) {
    try {
      const { id } = req.query;
      const prev = await Preventivo.findByPk(id, {
        include: [{ model: RigaPreventivo, as: "righe" }],
      });
      if (!prev)
        return res.status(404).json({ error: "Preventivo non trovato" });

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

      let noteAggiornate = prev.note ? prev.note + " | " : "";
      noteAggiornate += `Convertito in ordine n° ${ordine.id}`;
      await prev.update({ note: noteAggiornate });

      return res.status(200).json({ ok: true, ordineId: ordine.id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Errore conversione ordine" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
