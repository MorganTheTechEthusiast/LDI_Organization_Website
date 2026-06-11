import dotenv from "dotenv";
import pg from "pg";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultSqlitePath = path.join(__dirname, "..", "data", "ldi.sqlite");
const sqlitePath = process.env.SQLITE_PATH || defaultSqlitePath;
const postgresUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL;

const confirmed = process.argv.includes("--yes") || process.env.CONFIRM_MIGRATE_TO_POSTGRES === "true";

const tables = [
  "users",
  "blog_posts",
  "events",
  "team_members",
  "gallery",
  "partners",
  "contact_messages"
];

const schemas = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    image_url TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Upcoming', 'Ongoing', 'Completed')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    bio TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    linkedin TEXT,
    twitter TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`
];

function sqliteAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function closeSqlite(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function insertRows(pgClient, table, rows) {
  if (!rows.length) return 0;

  const columns = Object.keys(rows[0]);
  const quotedColumns = columns.map(quoteIdentifier).join(", ");

  for (const row of rows) {
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    const values = columns.map((column) => row[column]);
    await pgClient.query(
      `INSERT INTO ${quoteIdentifier(table)} (${quotedColumns}) VALUES (${placeholders})`,
      values
    );
  }

  await pgClient.query(
    `SELECT setval(
      pg_get_serial_sequence($1, 'id'),
      COALESCE((SELECT MAX(id) FROM ${quoteIdentifier(table)}), 1),
      (SELECT COUNT(*) > 0 FROM ${quoteIdentifier(table)})
    )`,
    [table]
  );

  return rows.length;
}

async function main() {
  if (!confirmed) {
    throw new Error(
      "Migration not confirmed. Re-run with --yes or set CONFIRM_MIGRATE_TO_POSTGRES=true. This will replace rows in PostgreSQL."
    );
  }

  if (!postgresUrl) {
    throw new Error("Missing DATABASE_URL. Add your production PostgreSQL URL to server/.env or Railway variables.");
  }

  const sqliteDb = new sqlite3.Database(sqlitePath);
  const pgPool = new pg.Pool({
    connectionString: postgresUrl,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined
  });

  const pgClient = await pgPool.connect();

  try {
    await pgClient.query("BEGIN");

    for (const schema of schemas) {
      await pgClient.query(schema);
    }

    await pgClient.query(`TRUNCATE ${tables.map(quoteIdentifier).join(", ")} RESTART IDENTITY CASCADE`);

    for (const table of tables) {
      const rows = await sqliteAll(sqliteDb, `SELECT * FROM ${quoteIdentifier(table)} ORDER BY id ASC`);
      const count = await insertRows(pgClient, table, rows);
      console.log(`Migrated ${count} row(s) into ${table}.`);
    }

    await pgClient.query("COMMIT");
    console.log("SQLite to PostgreSQL migration completed successfully.");
  } catch (error) {
    await pgClient.query("ROLLBACK");
    throw error;
  } finally {
    pgClient.release();
    await pgPool.end();
    await closeSqlite(sqliteDb);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
