// models/utente.js
export default (sequelize, DataTypes) => {
  const Utente = sequelize.define(
    "utente",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password_hash: {
        // <-- solo questa, non password!
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ruolo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "privato",
      },
      attivo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "utente",
      timestamps: false,
    }
  );

  return Utente;
};
