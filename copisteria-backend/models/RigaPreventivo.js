const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const RigaPreventivo = sequelize.define("riga_preventivo", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    preventivoId: { type: DataTypes.INTEGER, allowNull: false },
    lavorazioneId: { type: DataTypes.INTEGER, allowNull: false },
    descrizione: { type: DataTypes.STRING },
    quantita: { type: DataTypes.INTEGER },
    prezzo_unitario: { type: DataTypes.DECIMAL(10, 2) },
    totale_riga: { type: DataTypes.DECIMAL(10, 2) },
    note: { type: DataTypes.STRING },
  });
  return RigaPreventivo;
};
