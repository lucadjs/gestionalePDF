import {
  sequelize,
  Materiale,
  TipoMateriale,
  FormatoMateriale,
} from "../models/index.js";

export default async function handler(req, res) {
  await sequelize.sync();

  // GET /api/materiali
  if (req.method === "GET") {
    const materiali = await Materiale.findAll({
      include: [
        { model: TipoMateriale, attributes: ["id", "nome"] },
        { model: FormatoMateriale, attributes: ["id", "nome"] },
      ],
    });
    return res.status(200).json(materiali);
  }

  // POST /api/materiali
  if (req.method === "POST") {
    const materiale = await Materiale.create(req.body);
    return res.status(201).json(materiale);
  }

  // PUT /api/materiali?id=123
  if (req.method === "PUT") {
    const id = req.query.id || req.body.id;
    if (!id) return res.status(400).json({ error: "ID mancante" });
    await Materiale.update(req.body, { where: { id } });
    return res.sendStatus(204);
  }

  // DELETE /api/materiali?id=123
  if (req.method === "DELETE") {
    const id = req.query.id || req.body.id;
    if (!id) return res.status(400).json({ error: "ID mancante" });
    await Materiale.destroy({ where: { id } });
    return res.sendStatus(204);
  }

  // Metodo non consentito
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
