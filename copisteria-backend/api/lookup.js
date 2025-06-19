import express from "express";
import {
  TipoLavorazione,
  Supporto,
  TipoMateriale,
  FormatoMateriale,
} from "../models/index.js";

const router = express.Router();

router.get("/tipi_lavorazione", async (req, res) => {
  const items = await TipoLavorazione.findAll();
  res.json(items);
});
router.get("/supporti", async (req, res) => {
  const items = await Supporto.findAll();
  res.json(items);
});
router.get("/tipi_materiale", async (req, res) => {
  const items = await TipoMateriale.findAll();
  res.json(items);
});
router.get("/formati_materiale", async (req, res) => {
  const items = await FormatoMateriale.findAll();
  res.json(items);
});

export default router;
