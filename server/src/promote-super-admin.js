import { closeDb, get, initDb, run } from "./db.js";

const email = process.argv[2]?.trim().toLowerCase();

async function main() {
  if (process.env.DB_CLIENT?.trim().toLowerCase() !== "postgres") {
    throw new Error("Refusing to continue: set DB_CLIENT=postgres before running this command.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required and must point to the production PostgreSQL database.");
  }
  if (!email) {
    throw new Error("Usage: npm run promote-super-admin --workspace server -- admin@example.com");
  }

  await initDb();
  const user = await get("SELECT id, name, email, role FROM users WHERE lower(email) = lower(?)", [email]);
  if (!user) throw new Error(`No user found for ${email}. Create the account first, then run this command again.`);

  await run("UPDATE users SET role = 'superadmin' WHERE id = ?", [user.id]);
  console.log(`Promoted ${user.email} (${user.name}) to superadmin without changing the password.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await closeDb();
});
