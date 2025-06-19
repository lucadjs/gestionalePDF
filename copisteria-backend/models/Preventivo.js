const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Preventivo = sequelize.define("preventivo", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    clienteId: { type: DataTypes.INTEGER, allowNull: false },
    data: { type: DataTypes.DATEONLY },
    totale: { type: DataTypes.DECIMAL(10, 2) },
    note: { type: DataTypes.STRING },
  });
  return Preventivo;
};
