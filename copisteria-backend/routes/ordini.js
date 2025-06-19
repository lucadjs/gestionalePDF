import {
  sequelize,
  Ordine,
  RigaOrdine,
  Preventivo,
  RigaPreventivo,
} from "../models/index.js";

export default async function handler(req, res) {
  await sequelize.sync();

  // Solo POST /api/ordini-da-preventivo?id=123
  if (req.method === "POST") {
    const preventivoId = req.query.id || req.body.id;
    if (!preventivoId)
      return res.status(400).json({ error: "ID preventivo mancante" });

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

    // Copia le righe dal preventivo
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

    return res.status(200).json({ ok: true, ordineId: ordine.id });
  }

  // Metodo non consentito
  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
