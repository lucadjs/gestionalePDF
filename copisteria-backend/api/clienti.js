import { sequelize, Cliente } from "../models/index.js";

export default async function handler(req, res) {
  // CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Attiva solo se vuoi forzare le tabelle, in locale
    // if (process.env.NODE_ENV === "development") await sequelize.sync();

    if (req.method === "GET") {
      const clienti = await Cliente.findAll();
      return res.status(200).json(clienti);
    }

    if (req.method === "POST") {
      const cliente = await Cliente.create(req.body);
      return res.status(201).json(cliente);
    }

    if (req.method === "PUT") {
      const id = req.query.id || req.body.id;
      if (!id) return res.status(400).json({ error: "ID mancante" });
      await Cliente.update(req.body, { where: { id } });
      return res.sendStatus(204);
    }

    if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;
      if (!id) return res.status(400).json({ error: "ID mancante" });
      await Cliente.destroy({ where: { id } });
      return res.sendStatus(204);
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Metodo ${req.method} non consentito`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore server: " + error.message });
  }
}
