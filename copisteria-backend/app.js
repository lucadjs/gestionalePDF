import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  sequelize,
  TipoLavorazione,
  Supporto,
  TipoMateriale,
  FormatoMateriale,
} from "./models/index.js";
import materialiRoutes from "./api/materiali.js";
import lavorazioniRoutes from "./api/lavorazioni.js";
import lookupRoutes from "./api/lookup.js";
import clientiRoutes from "./api/clienti.js";
import preventiviRouter from "./api/preventivi.js";
import ordiniRoutes from "./api/ordini.js";
import utentiRouter from "./api/utenti.js";

dotenv.config();

const app = express();

// Aumenta limiti per JSON e URL-encoded (fino a 20MB, puoi aumentare se serve)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use(cors());
app.use(express.json());

app.use("/api/materiali", materialiRoutes);
app.use("/api/lavorazioni", lavorazioniRoutes);
app.use("/api/lookup", lookupRoutes);
app.use("/api/clienti", clientiRoutes);
app.use("/api/preventivi", preventiviRouter);
app.use("/api/ordini", ordiniRoutes);
app.use("/api/utenti", utentiRouter);

app.get("/", (req, res) => res.send("API Copisteria OK"));

async function populateLookup() {
  await TipoLavorazione.bulkCreate(
    [
      { nome: "stampa" },
      { nome: "rilegatura" },
      { nome: "scansione" },
      { nome: "plastificazione" },
      { nome: "invio email" },
    ],
    { ignoreDuplicates: true }
  );
  await Supporto.bulkCreate(
    [
      { nome: "carta" },
      { nome: "cartoncino" },
      { nome: "vinile" },
      { nome: "pvc" },
      { nome: "tela" },
      { nome: "adesivo" },
    ],
    { ignoreDuplicates: true }
  );
  await TipoMateriale.bulkCreate(
    [
      { nome: "carta" },
      { nome: "cartoncino" },
      { nome: "vinile" },
      { nome: "pvc" },
      { nome: "tela" },
      { nome: "adesivo" },
    ],
    { ignoreDuplicates: true }
  );
  await FormatoMateriale.bulkCreate(
    [
      { nome: "A7" },
      { nome: "A6" },
      { nome: "A5" },
      { nome: "A4" },
      { nome: "A3" },
      { nome: "A2" },
      { nome: "A1" },
      { nome: "A0" },
      { nome: "A0+" },
      { nome: "33x48" },
      { nome: "32x45" },
      { nome: "50x70" },
      { nome: "70x100" },
      { nome: "106x76" },
      { nome: "personalizzato" },
      { nome: "297 mm" },
      { nome: "420 mm" },
      { nome: "610 mm" },
      { nome: "914 mm" },
      { nome: "1067 mm" },
      { nome: "1370 mm" },
      { nome: "1600 mm" },
    ],
    { ignoreDuplicates: true }
  );
}

sequelize.sync().then(async () => {
  await populateLookup();
  app.listen(process.env.PORT || 4000, () => {
    console.log("Server avviato sulla porta", process.env.PORT || 4000);
  });
});
