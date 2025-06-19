import express from "express";
import { Materiale, TipoMateriale, FormatoMateriale } from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const materiali = await Materiale.findAll({
    include: [
      { model: TipoMateriale, attributes: ["id", "nome"] },
      { model: FormatoMateriale, attributes: ["id", "nome"] },
    ],
  });
  res.json(materiali);
});

router.post("/", async (req, res) => {
  const materiale = await Materiale.create(req.body);
  res.json(materiale);
});

router.put("/:id", async (req, res) => {
  await Materiale.update(req.body, { where: { id: req.params.id } });
  res.sendStatus(204);
});

router.delete("/:id", async (req, res) => {
  await Materiale.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

export default router;
