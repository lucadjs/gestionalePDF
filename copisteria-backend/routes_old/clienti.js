import express from "express";
import { Cliente } from "../models/index.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const cliente = await Cliente.findAll();
  res.json(cliente);
});

router.post("/", async (req, res) => {
  const cliente = await Cliente.create(req.body);
  res.json(cliente);
});

router.put("/:id", async (req, res) => {
  await Cliente.update(req.body, { where: { id: req.params.id } });
  res.sendStatus(204);
});

router.delete("/:id", async (req, res) => {
  await Cliente.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

export default router;
