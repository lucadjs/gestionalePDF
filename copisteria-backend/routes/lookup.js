import {
  sequelize,
  TipoLavorazione,
  Supporto,
  TipoMateriale,
  FormatoMateriale,
} from "../models/index.js";

export default async function handler(req, res) {
  await sequelize.sync();

  // GET /api/lookup?type=tipi_lavorazione
  // GET /api/lookup?type=supporti
  // GET /api/lookup?type=tipi_materiale
  // GET /api/lookup?type=formati_materiale

  if (req.method === "GET") {
    const { type } = req.query;

    if (type === "tipi_lavorazione") {
      const items = await TipoLavorazione.findAll();
      return res.status(200).json(items);
    }
    if (type === "supporti") {
      const items = await Supporto.findAll();
      return res.status(200).json(items);
    }
    if (type === "tipi_materiale") {
      const items = await TipoMateriale.findAll();
      return res.status(200).json(items);
    }
    if (type === "formati_materiale") {
      const items = await FormatoMateriale.findAll();
      return res.status(200).json(items);
    }
    // Nessun tipo valido trovato
    return res.status(400).json({ error: "Parametro type non valido" });
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
