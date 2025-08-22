import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Compila tutti i campi" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Copisteria PDF" <${process.env.GMAIL_USER}>`,
      to: "info@copisteriapdf.it",
      subject: `Richiesta informazioni da ${name}`,
      text: `Nome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}\n`,
      replyTo: email,
    });

    res.json({ ok: true, msg: "Email inviata con successo!" });
  } catch (err) {
    console.error("Errore invio email da form:", err);
    res.status(500).json({ error: "Errore invio email" });
  }
});

export default router;
