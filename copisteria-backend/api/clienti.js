// /copisteria-backend/api/clienti.js
import { sequelize, Cliente } from "../models/index.js";

export default async function handler(req, res) {
  // CORS headers per tutte le richieste
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Gestione preflight CORS per richieste OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // SOLO IN LOCALE se vuoi forzare la creazione delle tabelle, MAI in produzione su Vercel
    // if (process.env.NODE_ENV === "development") await sequelize.sync();

    // GET: lista clienti
    if (req.method === "GET") {
      const clienti = await Cliente.findAll();
      return res.status(200).json(clienti);
    }

    // POST: nuovo cliente
    if (req.method === "POST") {
      const cliente = await Cliente.create(req.body);
      return res.status(201).json(cliente);
    }

    // PUT: aggiorna cliente
    if (req.method === "PUT") {
      const id = req.query.id || req.body.id;
      if (!id) return res.status(400).json({ error: "ID mancante" });
      await Cliente.update(req.body, { where: { id } });
      return res.sendStatus(204);
    }

    // DELETE: elimina cliente
    if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;
      if (!id) return res.status(400).json({ error: "ID mancante" });
      await Cliente.destroy({ where: { id } });
      return res.sendStatus(204);
    }

    // Metodo non consentito
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Metodo ${req.method} non consentito`);
  } catch (error) {
    // Log dettagliato lato Vercel
    console.error("Errore API /api/clienti:", error);
    res.status(500).json({ error: "Errore server: " + error.message });
  }
}
