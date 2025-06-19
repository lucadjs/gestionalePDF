import { sequelize } from "../models/index.js";

export default async function handler(req, res) {
  try {
    await sequelize.authenticate();
    res.status(200).json({ msg: "Connesso al database!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
