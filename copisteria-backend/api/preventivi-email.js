import { sequelize, Preventivo, RigaPreventivo } from "../models/index.js";
import nodemailer from "nodemailer";
// import fs from "fs";
// import path from "path";

// Esempio base: senza allegato, solo invio email testo
export default async function handler(req, res) {
  await sequelize.sync();

  if (req.method === "POST") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID preventivo mancante" });

    const prev = await Preventivo.findByPk(id, {
      include: [{ model: RigaPreventivo, as: "righe" }],
    });

    // (Qui puoi prendere anche il cliente per email se necessario)

    const transporter = nodemailer.createTransport({
      host: "smtp.tuoprovider.it", // cambia con il tuo
      port: 465,
      secure: true,
      auth: {
        user: "TUA_EMAIL@dominio.it",
        pass: "TUA_PASSWORD",
      },
    });

    try {
      await transporter.sendMail({
        from: '"Copisteria PDF" <TUA_EMAIL@dominio.it>',
        to: "cliente@email.it", // Qui devi recuperare il vero destinatario!
        subject: `Il tuo preventivo n°${prev.id} - Copisteria PDF`,
        text: `Gentile cliente, trova in allegato il preventivo n°${prev.id}.`,
        // attachments: [{ ... }],
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res
        .status(500)
        .json({ ok: false, message: "Errore invio email", error: e });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
