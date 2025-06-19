import { sequelize, Cliente } from "../models/index.js";

export default async function handler(req, res) {
  await sequelize.sync(); // Assicura che le tabelle esistano

  // GET /api/clienti
  if (req.method === "GET") {
    const clienti = await Cliente.findAll();
    return res.status(200).json(clienti);
  }

  // POST /api/clienti
  if (req.method === "POST") {
    const cliente = await Cliente.create(req.body);
    return res.status(201).json(cliente);
  }

  // PUT /api/clienti?id=123
  if (req.method === "PUT") {
    const id = req.query.id || req.body.id;
    if (!id) return res.status(400).json({ error: "ID mancante" });
    await Cliente.update(req.body, { where: { id } });
    return res.sendStatus(204);
  }

  // DELETE /api/clienti?id=123
  if (req.method === "DELETE") {
    const id = req.query.id || req.body.id;
    if (!id) return res.status(400).json({ error: "ID mancante" });
    await Cliente.destroy({ where: { id } });
    return res.sendStatus(204);
  }

  // Metodo non consentito
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
