import {
  sequelize,
  Lavorazione,
  TipoLavorazione,
  Supporto,
} from "../models/index.js";

export default async function handler(req, res) {
  await sequelize.sync();

  // GET /api/lavorazioni
  if (req.method === "GET") {
    const lavorazioni = await Lavorazione.findAll({
      include: [
        { model: TipoLavorazione, attributes: ["id", "nome"] },
        { model: Supporto, attributes: ["id", "nome"] },
      ],
    });
    return res.status(200).json(lavorazioni);
  }

  // POST /api/lavorazioni
  if (req.method === "POST") {
    const lavorazione = await Lavorazione.create(req.body);
    return res.status(201).json(lavorazione);
  }

  // PUT /api/lavorazioni?id=123
  if (req.method === "PUT") {
    const id = req.query.id || req.body.id;
    if (!id) return res.status(400).json({ error: "ID mancante" });
    await Lavorazione.update(req.body, { where: { id } });
    return res.sendStatus(204);
  }

  // DELETE /api/lavorazioni?id=123
  if (req.method === "DELETE") {
    const id = req.query.id || req.body.id;
    if (!id) return res.status(400).json({ error: "ID mancante" });
    await Lavorazione.destroy({ where: { id } });
    return res.sendStatus(204);
  }

  // Metodo non consentito
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
