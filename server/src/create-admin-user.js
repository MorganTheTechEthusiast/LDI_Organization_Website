import bcrypt from "bcryptjs";
import { closeDb, get, initDb, run } from "./db.js";
import { adminRoles } from "./middleware/auth.js";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : "";
}

const email = argument("email").trim().toLowerCase();
const password = argument("password");
const name = argument("name").trim();
const role = argument("role").trim();

async function main() {
  if (!email || !password || !name || !role) throw new Error("Usage: npm run create-admin-user --workspace server -- --email user@example.com --password 'strong-password' --name 'User Name' --role content_editor");
  if (!adminRoles.includes(role)) throw new Error(`Invalid role. Use: ${adminRoles.join(", ")}`);
  if (password.length < 12) throw new Error("The password must be at least 12 characters.");

  await initDb();
  const hash = await bcrypt.hash(password, 12);
  const existing = await get("SELECT id FROM users WHERE lower(email) = lower(?)", [email]);
  if (existing) {
    await run("UPDATE users SET name = ?, password_hash = ?, role = ? WHERE id = ?", [name, hash, role, existing.id]);
    console.log(`Admin account updated: ${email} (${role})`);
  } else {
    await run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [name, email, hash, role]);
    console.log(`Admin account created: ${email} (${role})`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await closeDb();
});
