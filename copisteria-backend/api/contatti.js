import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /api/contatti
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Compila tutti i campi" });
    }

    // Configura SMTP (riusa Gmail o provider che già usi)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Oggetto e testo email
    const subject = `Richiesta informazioni da ${name}`;
    const text = `Hai ricevuto un nuovo messaggio dal sito Copisteria PDF:

Nome: ${name}
Email: ${email}
Messaggio:
${message}
`;

    // Invia email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "luca.digiacinto@protonmail.com", // la tua casella
      subject,
      text,
      replyTo: email, // così puoi rispondere direttamente al cliente
    });

    res.json({ ok: true, msg: "Email inviata con successo!" });
  } catch (err) {
    console.error("Errore invio email da form:", err);
    res.status(500).json({ error: "Errore invio email" });
  }
});

export default router;
