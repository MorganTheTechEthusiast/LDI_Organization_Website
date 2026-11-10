import { config } from "../config.js";
import jwt from "jsonwebtoken";

export const adminRoles = ["superadmin", "training_manager", "finance_reviewer", "content_editor", "support_officer", "auditor"];

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Super administrator access is required for this action." });
  }
  return next();
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (req.user?.role === "superadmin" || allowedRoles.includes(req.user?.role)) return next();
    return res.status(403).json({ message: "Your account does not have permission for this area." });
  };
}
