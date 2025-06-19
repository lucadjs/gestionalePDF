import express from "express";
import { Lavorazione, TipoLavorazione, Supporto } from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const lavorazioni = await Lavorazione.findAll({
    include: [
      { model: TipoLavorazione, attributes: ["id", "nome"] },
      { model: Supporto, attributes: ["id", "nome"] },
    ],
  });
  res.json(lavorazioni);
});

router.post("/", async (req, res) => {
  const lavorazione = await Lavorazione.create(req.body);
  res.json(lavorazione);
});

router.put("/:id", async (req, res) => {
  await Lavorazione.update(req.body, { where: { id: req.params.id } });
  res.sendStatus(204);
});

router.delete("/:id", async (req, res) => {
  await Lavorazione.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

export default router;
