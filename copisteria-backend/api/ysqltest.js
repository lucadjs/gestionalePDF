import mysql from "mysql2";
export default function handler(req, res) {
  res.status(200).json({ msg: "mysql2 funziona" });
}
