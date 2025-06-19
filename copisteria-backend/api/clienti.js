import express from "express";
import { Cliente } from "../models/index.js";

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  const clienti = await Cliente.findAll();
  res.json(clienti);
});

app.post("/", async (req, res) => {
  const cliente = await Cliente.create(req.body);
  res.json(cliente);
});

app.put("/:id", async (req, res) => {
  await Cliente.update(req.body, { where: { id: req.params.id } });
  res.sendStatus(204);
});

app.delete("/:id", async (req, res) => {
  await Cliente.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// Exporta come handler per Vercel
export default app;
