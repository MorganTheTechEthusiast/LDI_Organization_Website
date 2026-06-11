import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import pg from "pg";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "ldi.sqlite");
const dbClient = (process.env.DB_CLIENT || "sqlite").toLowerCase();
const postgresUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL;

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

sqlite3.verbose();

const sqliteDb = dbClient === "sqlite" ? new sqlite3.Database(process.env.SQLITE_PATH || dbPath) : null;
const pgPool =
  dbClient === "postgres"
    ? createPostgresPool()
    : null;

export const db = {
  close: () => closeDb()
};

function createPostgresPool() {
  if (!postgresUrl) {
    throw new Error(
      "DB_CLIENT=postgres requires DATABASE_URL. In Railway, add DATABASE_URL as a reference to your PostgreSQL service connection string."
    );
  }

  return new pg.Pool({
    connectionString: postgresUrl,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined
  });
}

function toPostgresSql(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export function run(sql, params = []) {
  if (dbClient === "postgres") {
    let query = toPostgresSql(sql);
    if (/^\s*insert\s+/i.test(query) && !/\sreturning\s+/i.test(query)) {
      query = `${query} RETURNING id`;
    }

    return pgPool.query(query, params).then((result) => ({
      id: result.rows[0]?.id,
      changes: result.rowCount
    }));
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function all(sql, params = []) {
  if (dbClient === "postgres") {
    return pgPool.query(toPostgresSql(sql), params).then((result) => result.rows);
  }

  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function get(sql, params = []) {
  if (dbClient === "postgres") {
    return pgPool.query(toPostgresSql(sql), params).then((result) => result.rows[0]);
  }

  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function closeDb() {
  if (dbClient === "postgres") {
    await pgPool.end();
    return;
  }

  await new Promise((resolve, reject) => {
    sqliteDb.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function initDb() {
  const idColumn = dbClient === "postgres" ? "SERIAL PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT";

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id ${idColumn},
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id ${idColumn},
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      image_url TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id ${idColumn},
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Upcoming', 'Ongoing', 'Completed')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS team_members (
      id ${idColumn},
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      bio TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      linkedin TEXT,
      twitter TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id ${idColumn},
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS partners (
      id ${idColumn},
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      description TEXT NOT NULL,
      website TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id ${idColumn},
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
