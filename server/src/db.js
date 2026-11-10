import fs from "fs";
import path from "path";
import "./config.js";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envDir = path.resolve(__dirname, "..");

const postgresUrl = String(process.env.DATABASE_URL || "").trim();
const configuredSqlitePath = String(process.env.SQLITE_PATH || "").trim();
const dbClient = process.env.DB_CLIENT?.trim().toLowerCase() ||
  (postgresUrl ? "postgres" : configuredSqlitePath ? "sqlite" : "");

if (!dbClient || !["sqlite", "postgres"].includes(dbClient)) {
  throw new Error("Set DB_CLIENT to postgres or sqlite, with DATABASE_URL or SQLITE_PATH respectively.");
}

if (dbClient === "postgres" && !postgresUrl) {
  throw new Error("Postgres requires DATABASE_URL in server/.env or the production environment.");
}

if (dbClient === "sqlite" && !configuredSqlitePath) {
  throw new Error("SQLite requires SQLITE_PATH in server/.env. Set DATABASE_URL in production to use Postgres.");
}

const sqlitePath = configuredSqlitePath === ":memory:" || path.isAbsolute(configuredSqlitePath)
  ? configuredSqlitePath
  : path.resolve(envDir, configuredSqlitePath);
const sqliteDir = path.dirname(sqlitePath);

if (dbClient === "sqlite" && !fs.existsSync(sqliteDir)) {
  fs.mkdirSync(sqliteDir, { recursive: true });
}

let sqliteDb = null;
if (dbClient === "sqlite") {
  const { default: sqlite3 } = await import("sqlite3");
  sqlite3.verbose();
  sqliteDb = new sqlite3.Database(sqlitePath);
}
const pgPool =
  dbClient === "postgres"
    ? createPostgresPool()
    : null;

export const db = {
  close: () => closeDb()
};

function createPostgresPool() {
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

  async function ensureColumns(table, columns) {
    const existing = dbClient === "postgres"
      ? await all("SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ?", [table])
      : await all(`PRAGMA table_info(${table})`);
    const existingNames = new Set(existing.map((column) => column.column_name || column.name));
    for (const [name, definition] of Object.entries(columns)) {
      if (!existingNames.has(name)) {
        await run(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
      }
    }
  }

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
    CREATE TABLE IF NOT EXISTS video_interviews (
      id ${idColumn},
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_title TEXT,
      date TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      video_url TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS trainings (
      id ${idColumn},
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      course TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      duration TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      registration_url TEXT,
      status TEXT NOT NULL DEFAULT 'Upcoming',
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id ${idColumn},
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      organization TEXT,
      description TEXT NOT NULL,
      deadline TEXT,
      location TEXT,
      image_url TEXT NOT NULL,
      opportunity_url TEXT,
      status TEXT NOT NULL DEFAULT 'Open',
      featured INTEGER NOT NULL DEFAULT 0,
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
    CREATE TABLE IF NOT EXISTS youth_innovators (
      id ${idColumn},
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT,
      bio TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      website TEXT,
      linkedin TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
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

  await run(`
    CREATE TABLE IF NOT EXISTS training_programs (
      id ${idColumn},
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      cohort_number TEXT NOT NULL,
      tagline TEXT NOT NULL,
      overview TEXT NOT NULL,
      about_ldi TEXT NOT NULL,
      learn_items TEXT NOT NULL,
      duration TEXT NOT NULL,
      schedule TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      deadline TEXT,
      payment_instructions TEXT,
      faq_items TEXT,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'Open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS training_applications (
      id ${idColumn},
      program_id INTEGER NOT NULL,
      application_reference TEXT UNIQUE,
      full_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      phone TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT NOT NULL,
      residential_address TEXT,
      county TEXT,
      city_community TEXT,
      educational_status TEXT,
      institution TEXT,
      highest_qualification TEXT,
      occupation TEXT,
      computer_experience TEXT,
      previous_training TEXT,
      current_skills TEXT,
      has_computer TEXT,
      has_smartphone TEXT,
      interest_reason TEXT,
      expected_outcome TEXT,
      motivation_statement TEXT,
      relevant_experience TEXT,
      learned_from TEXT,
      emergency_name TEXT,
      emergency_phone TEXT,
      declaration_accepted INTEGER NOT NULL DEFAULT 0,
      terms_accepted INTEGER NOT NULL DEFAULT 0,
      privacy_consent INTEGER NOT NULL DEFAULT 0,
      photo_url TEXT,
      supporting_document_url TEXT,
      status TEXT NOT NULL DEFAULT 'Submitted',
      payment_status TEXT NOT NULL DEFAULT 'Pending',
      admin_notes TEXT,
      deleted_at TEXT,
      deleted_by INTEGER,
      deletion_reason TEXT,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS application_documents (
      id ${idColumn},
      application_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      file_url TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS training_payments (
      id ${idColumn},
      application_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      payment_method TEXT NOT NULL,
      payment_reference TEXT NOT NULL,
      transaction_id TEXT,
      evidence_url TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      reviewed_by INTEGER,
      reviewed_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS training_receipts (
      id ${idColumn},
      payment_id INTEGER NOT NULL UNIQUE,
      application_id INTEGER NOT NULL,
      receipt_number TEXT NOT NULL UNIQUE,
      issued_by INTEGER,
      issued_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS training_participants (
      id ${idColumn},
      application_id INTEGER NOT NULL UNIQUE,
      program_id INTEGER NOT NULL,
      group_name TEXT,
      registration_status TEXT NOT NULL DEFAULT 'Registered',
      registered_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id ${idColumn},
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      metadata TEXT,
      ip_address TEXT,
      user_agent TEXT,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Keep databases created by an earlier training release compatible with the
  // current application without requiring a destructive reset.
  await ensureColumns("training_programs", {
    image_url: "TEXT",
    status: "TEXT DEFAULT 'Open'",
    created_at: "TEXT",
    updated_at: "TEXT",
  });
  await ensureColumns("training_applications", {
    application_reference: "TEXT",
    date_of_birth: "TEXT",
    gender: "TEXT",
    whatsapp: "TEXT",
    residential_address: "TEXT",
    county: "TEXT",
    city_community: "TEXT",
    educational_status: "TEXT",
    institution: "TEXT",
    highest_qualification: "TEXT",
    occupation: "TEXT",
    computer_experience: "TEXT",
    previous_training: "TEXT",
    current_skills: "TEXT",
    has_computer: "TEXT",
    has_smartphone: "TEXT",
    interest_reason: "TEXT",
    expected_outcome: "TEXT",
    motivation_statement: "TEXT",
    relevant_experience: "TEXT",
    learned_from: "TEXT",
    emergency_name: "TEXT",
    emergency_phone: "TEXT",
    declaration_accepted: "INTEGER DEFAULT 0",
    terms_accepted: "INTEGER DEFAULT 0",
    privacy_consent: "INTEGER DEFAULT 0",
    photo_url: "TEXT",
    supporting_document_url: "TEXT",
    status: "TEXT DEFAULT 'Submitted'",
    payment_status: "TEXT DEFAULT 'Pending'",
    admin_notes: "TEXT",
    deleted_at: "TEXT",
    deleted_by: "INTEGER",
    deletion_reason: "TEXT",
    submitted_at: "TEXT",
    updated_at: "TEXT",
  });
  await ensureColumns("training_payments", {
    transaction_id: "TEXT",
    evidence_url: "TEXT",
    status: "TEXT DEFAULT 'Pending'",
    reviewed_by: "INTEGER",
    reviewed_at: "TEXT",
    notes: "TEXT",
    created_at: "TEXT",
  });
  await ensureColumns("training_receipts", {
    issued_by: "INTEGER",
    issued_at: "TEXT",
  });
  await ensureColumns("audit_logs", {
    ip_address: "TEXT",
    user_agent: "TEXT",
    reason: "TEXT",
  });
  if (dbClient === "postgres") {
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_training_applications_reference ON training_applications (application_reference) WHERE application_reference IS NOT NULL");
  } else {
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_training_applications_reference ON training_applications (application_reference)");
  }

  await run("CREATE INDEX IF NOT EXISTS idx_training_applications_program ON training_applications (program_id)");
  await run("CREATE INDEX IF NOT EXISTS idx_training_applications_status ON training_applications (status)");
  await run("CREATE INDEX IF NOT EXISTS idx_training_payments_status ON training_payments (status)");

  const defaultProgram = {
    slug: "girls-in-tech-cohort-2",
    title: "Girls in Tech Digital Skills Training Program",
    cohort: "Cohort #2",
    tagline: "Empowering Young Women Through Digital Skills, Technology, and Opportunity.",
    overview: "A practical, supportive learning experience helping young Liberian women build confidence with technology and prepare for meaningful digital opportunities.",
    about: "Liberia Digital Insights connects people to trusted technology information, practical learning, and opportunity. This program is part of our commitment to making digital participation more accessible for young women in Liberia.",
    learn: JSON.stringify(["Digital literacy and online safety", "Productivity tools and professional communication", "Introduction to web, design, and digital creation", "Career readiness, entrepreneurship, and opportunity discovery"]),
    duration: "6 months",
    schedule: "Schedule will be shared with accepted applicants.",
    eligibility: "Young women in Liberia who are motivated to learn, can commit to the training schedule, and have access to a smartphone. No advanced technical background is required.",
    fee: 0,
    currency: "USD",
    deadline: "",
    payment: "Application and training fees will be communicated by LDI. Do not send money until an authorized LDI administrator confirms the official payment instructions.",
    faq: JSON.stringify([{ question: "Do I need previous coding experience?", answer: "No. The program is designed for beginners and emerging learners." }, { question: "Will submitting an application guarantee selection?", answer: "No. Applications are reviewed against the published requirements and available cohort capacity." }, { question: "How will I know my application status?", answer: "Use your application reference and email address on the status checker after submitting." }])
  };
  await run(`
    INSERT INTO training_programs (slug, title, cohort_number, tagline, overview, about_ldi, learn_items, duration, schedule, eligibility, fee, currency, deadline, payment_instructions, faq_items, status)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open'
    WHERE NOT EXISTS (SELECT 1 FROM training_programs WHERE slug = ?)
  `, [defaultProgram.slug, defaultProgram.title, defaultProgram.cohort, defaultProgram.tagline, defaultProgram.overview, defaultProgram.about, defaultProgram.learn, defaultProgram.duration, defaultProgram.schedule, defaultProgram.eligibility, defaultProgram.fee, defaultProgram.currency, defaultProgram.deadline, defaultProgram.payment, defaultProgram.faq, defaultProgram.slug]);
}
