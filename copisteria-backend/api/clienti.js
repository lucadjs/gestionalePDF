// /copisteria-backend/api/clienti.js
import mysql from "mysql2/promise";

export default async function handler(req, res) {
  // CORS (essenziale su Vercel)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Connessione DB (usa le variabili da .env)
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // --- GET: Tutti i clienti
    if (req.method === "GET") {
      const [rows] = await connection.query("SELECT * FROM clienti");
      return res.status(200).json(rows);
    }

    // --- POST: Nuovo cliente
    if (req.method === "POST") {
      const data = req.body;
      const [result] = await connection.execute(
        `INSERT INTO clienti 
        (categoria, nomeAzienda, nome, indirizzo, citta, provincia, cap, telefono, email, pec, codice_fiscale, partita_iva, codice_univoco, attivo, attivo_web, codice_sconto, note, data_registrazione, ultimo_contatto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.categoria || null,
          data.nomeAzienda || null,
          data.nome || null,
          data.indirizzo || null,
          data.citta || null,
          data.provincia || null,
          data.cap || null,
          data.telefono || null,
          data.email || null,
          data.pec || null,
          data.codice_fiscale || null,
          data.partita_iva || null,
          data.codice_univoco || null,
          data.attivo ?? 1,
          data.attivo_web ?? 0,
          data.codice_sconto || null,
          data.note || null,
          data.data_registrazione || null,
          data.ultimo_contatto || null,
        ]
      );
      // Ritorna il nuovo record
      const [newCliente] = await connection.query(
        "SELECT * FROM clienti WHERE id = ?",
        [result.insertId]
      );
      return res.status(201).json(newCliente[0]);
    }

    // --- PUT: Aggiorna cliente
    if (req.method === "PUT") {
      const id = req.query.id || req.body.id;
      if (!id) return res.status(400).json({ error: "ID mancante" });
      const data = req.body;
      await connection.execute(
        `UPDATE clienti SET 
        categoria = ?, nomeAzienda = ?, nome = ?, indirizzo = ?, citta = ?, provincia = ?, cap = ?, telefono = ?, email = ?, pec = ?, codice_fiscale = ?, partita_iva = ?, codice_univoco = ?, attivo = ?, attivo_web = ?, codice_sconto = ?, note = ?, data_registrazione = ?, ultimo_contatto = ?
        WHERE id = ?`,
        [
          data.categoria || null,
          data.nomeAzienda || null,
          data.nome || null,
          data.indirizzo || null,
          data.citta || null,
          data.provincia || null,
          data.cap || null,
          data.telefono || null,
          data.email || null,
          data.pec || null,
          data.codice_fiscale || null,
          data.partita_iva || null,
          data.codice_univoco || null,
          data.attivo ?? 1,
          data.attivo_web ?? 0,
          data.codice_sconto || null,
          data.note || null,
          data.data_registrazione || null,
          data.ultimo_contatto || null,
          id,
        ]
      );
      return res.sendStatus(204);
    }

    // --- DELETE: Cancella cliente
    if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;
      if (!id) return res.status(400).json({ error: "ID mancante" });
      await connection.execute("DELETE FROM clienti WHERE id = ?", [id]);
      return res.sendStatus(204);
    }

    // Metodo non consentito
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Metodo ${req.method} non consentito`);
  } catch (error) {
    console.error("Errore API /api/clienti:", error);
    return res.status(500).json({ error: "Errore server: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
}
