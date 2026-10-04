import bcrypt from "bcryptjs";
import { closeDb, initDb, get, run } from "./db.js";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const email = argument("email", "superadmin@liberiadigitalinsights.org");
const password = argument("password", "LDI-SuperAdmin-2026!");
const name = argument("name", "LDI Super Administrator");

async function main() {
  if (!email || !password || password.length < 12) {
    throw new Error("A valid email and a password of at least 12 characters are required.");
  }

  await initDb();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await get("SELECT id FROM users WHERE email = ?", [email]);

  if (existing) {
    await run("UPDATE users SET name = ?, password_hash = ?, role = ? WHERE id = ?", [name, passwordHash, "super_admin", existing.id]);
    console.log(`Super admin updated: ${email}`);
  } else {
    await run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [name, email, passwordHash, "super_admin"]);
    console.log(`Super admin created: ${email}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await closeDb();
});
