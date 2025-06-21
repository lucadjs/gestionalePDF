import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
// Lookup tables
const TipoLavorazione = sequelize.define(
  "tipo_lavorazione",
  {
    nome: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const Supporto = sequelize.define(
  "supporto",
  {
    nome: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const TipoMateriale = sequelize.define(
  "tipo_materiale",
  {
    nome: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

const FormatoMateriale = sequelize.define(
  "formato_materiale",
  {
    nome: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

// Materiali
const Materiale = sequelize.define(
  "materiale",
  {
    codforn: DataTypes.STRING,
    descrizione: DataTypes.STRING,
    grammatura: DataTypes.STRING,
    finitura: DataTypes.STRING,
    colore: DataTypes.STRING,
    dimensione: DataTypes.STRING,
    unita_misura: DataTypes.STRING,
    confezione: DataTypes.STRING,
    prezzo_acquisto: DataTypes.DECIMAL(10, 2),
    prezzo_vendita: DataTypes.DECIMAL(10, 2),
    note: DataTypes.TEXT,
    attivo: { type: DataTypes.TINYINT, defaultValue: 1 },
  },
  { timestamps: false }
);

Materiale.belongsTo(TipoMateriale, { foreignKey: "tipo_id" });
Materiale.belongsTo(FormatoMateriale, { foreignKey: "formato_id" });

// Lavorazioni
const Lavorazione = sequelize.define(
  "lavorazione",
  {
    descrizione: DataTypes.STRING,
    unita_misura: DataTypes.STRING,
    prezzo: DataTypes.DECIMAL(10, 2),
    grammatura: DataTypes.STRING,
    attivo: { type: DataTypes.TINYINT, defaultValue: 1 },
    note: DataTypes.TEXT,
  },
  { timestamps: false }
);

Lavorazione.belongsTo(TipoLavorazione, { foreignKey: "tipo_id" });
Lavorazione.belongsTo(Supporto, { foreignKey: "supporto_id" });

// Clienti
const Cliente = sequelize.define(
  "cliente",
  {
    categoria: { type: DataTypes.CHAR(1) }, // a=azienda, p=privato, s=studente
    nomeAzienda: { type: DataTypes.STRING },
    nome: { type: DataTypes.STRING },
    indirizzo: { type: DataTypes.STRING },
    citta: { type: DataTypes.STRING },
    provincia: { type: DataTypes.STRING(2) },
    cap: { type: DataTypes.STRING(10) },
    telefono: { type: DataTypes.STRING(50) },
    email: { type: DataTypes.STRING(100) },
    pec: { type: DataTypes.STRING(100) },
    codice_fiscale: { type: DataTypes.STRING(20) },
    partita_iva: { type: DataTypes.STRING(20) },
    codice_univoco: { type: DataTypes.STRING(7) },
    attivo: { type: DataTypes.TINYINT, defaultValue: 1 },
    attivo_web: { type: DataTypes.TINYINT, defaultValue: 0 },
    codice_sconto: { type: DataTypes.STRING(50) },
    note: { type: DataTypes.TEXT },
    data_registrazione: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ultimo_contatto: { type: DataTypes.DATE, allowNull: true },
  },
  { timestamps: false }
);

// Preventivi
const Preventivo = sequelize.define(
  "preventivo",
  {
    data: { type: DataTypes.DATEONLY },
    totale: { type: DataTypes.DECIMAL(10, 2) },
    note: DataTypes.STRING,
  },
  { timestamps: false }
);

// Utenti
const Utente = sequelize.define(
  "utente",
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    ruolo: {
      type: DataTypes.ENUM("admin", "privato", "azienda", "studente"),
      allowNull: false,
      defaultValue: "privato",
    },
    attivo: { type: DataTypes.TINYINT, defaultValue: 1 },
  },
  { timestamps: false }
);

// RigaPreventivo
const RigaPreventivo = sequelize.define(
  "riga_preventivo",
  {
    descrizione: DataTypes.STRING,
    quantita: DataTypes.INTEGER,
    prezzo_unitario: DataTypes.DECIMAL(10, 2),
    totale_riga: DataTypes.DECIMAL(10, 2),
    note: DataTypes.STRING,
  },
  { timestamps: false }
);

// RELAZIONI Preventivo e Cliente
Preventivo.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });
Cliente.hasMany(Preventivo, { foreignKey: "clienteId", as: "preventivi" });

// RELAZIONI Preventivo e RigaPreventivo
Preventivo.hasMany(RigaPreventivo, { foreignKey: "preventivoId", as: "righe" });
RigaPreventivo.belongsTo(Preventivo, {
  foreignKey: "preventivoId",
  as: "preventivo",
});

// RELAZIONE RigaPreventivo e Lavorazione
RigaPreventivo.belongsTo(Lavorazione, {
  foreignKey: "lavorazioneId",
  as: "lavorazione",
});
Lavorazione.hasMany(RigaPreventivo, {
  foreignKey: "lavorazioneId",
  as: "righe_preventivo",
});

// Ordini
const Ordine = sequelize.define(
  "ordine",
  {
    clienteId: { type: DataTypes.INTEGER, allowNull: false },
    data: { type: DataTypes.DATEONLY },
    note: DataTypes.STRING,
    totale: DataTypes.DECIMAL(10, 2),
    stato: { type: DataTypes.STRING, defaultValue: "inserito" }, // opzionale: "inserito", "consegnato", ecc
  },
  { timestamps: false }
);

const RigaOrdine = sequelize.define(
  "riga_ordine",
  {
    ordineId: { type: DataTypes.INTEGER, allowNull: false },
    lavorazioneId: { type: DataTypes.INTEGER, allowNull: false },
    descrizione: DataTypes.STRING,
    quantita: DataTypes.INTEGER,
    prezzo_unitario: DataTypes.DECIMAL(10, 2),
    totale_riga: DataTypes.DECIMAL(10, 2),
    note: DataTypes.STRING,
  },
  { timestamps: false }
);

// Relazioni
Ordine.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });
Ordine.hasMany(RigaOrdine, { foreignKey: "ordineId", as: "righe" });
RigaOrdine.belongsTo(Ordine, { foreignKey: "ordineId", as: "ordine" });

// ESPORTA TUTTO (solo qui!)
export {
  TipoLavorazione,
  Supporto,
  TipoMateriale,
  FormatoMateriale,
  Materiale,
  Lavorazione,
  Cliente,
  Preventivo,
  RigaPreventivo,
  Ordine,
  RigaOrdine,
  Utente,
  sequelize,
};
