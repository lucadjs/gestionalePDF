import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "changemeSecret123";

// Verifica token
export function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Token mancante" });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token non valido" });
  }
}

// Solo admin
export function onlyAdmin(req, res, next) {
  if (req.user?.ruolo !== "admin")
    return res.status(403).json({ error: "Permesso negato" });
  next();
}
