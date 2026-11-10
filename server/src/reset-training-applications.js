import { closeDb, all, get, initDb, run } from "./db.js";

const args = new Set(process.argv.slice(2));
const programSlug = process.env.TRAINING_PROGRAM_SLUG?.trim() || "girls-in-tech-cohort-2";

function usage() {
  console.error("This command permanently removes all applications and related test records for one training program.");
  console.error("Usage: npm run reset-training-applications --workspace server -- --confirm-reset");
}

async function main() {
  if (!args.has("--confirm-reset")) {
    usage();
    throw new Error("Reset cancelled. Add --confirm-reset only after confirming the target database and test data.");
  }

  const client = process.env.DB_CLIENT?.trim().toLowerCase();
  if (!["postgres", "sqlite"].includes(client)) {
    throw new Error("Set DB_CLIENT to postgres or sqlite before running the reset.");
  }
  if (client === "postgres" && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when DB_CLIENT=postgres.");
  }

  await initDb();
  const program = await get("SELECT id, slug, title, cohort_number FROM training_programs WHERE slug = ?", [programSlug]);
  if (!program) throw new Error(`No training program found for slug: ${programSlug}`);

  const applications = await all("SELECT id, application_reference FROM training_applications WHERE program_id = ?", [program.id]);
  const otherProgramApplications = await get("SELECT COUNT(*) AS count FROM training_applications WHERE program_id <> ?", [program.id]);
  if (Number(otherProgramApplications?.count || 0) !== 0) {
    throw new Error("Other training-program applications exist. Refusing to reset the global ID sequence; archive or reset those records separately first.");
  }
  const applicationIds = applications.map((row) => row.id);
  console.log(`Target: ${program.title} (${program.cohort_number})`);
  console.log(`Applications to remove: ${applications.length}`);
  console.log("Audit logs will be preserved.");

  for (const applicationId of applicationIds) {
    await run("DELETE FROM training_receipts WHERE application_id = ?", [applicationId]);
    await run("DELETE FROM training_participants WHERE application_id = ?", [applicationId]);
    await run("DELETE FROM application_documents WHERE application_id = ?", [applicationId]);
    await run("DELETE FROM training_payments WHERE application_id = ?", [applicationId]);
  }
  await run("DELETE FROM training_applications WHERE program_id = ?", [program.id]);

  if (client === "postgres") {
    await run("ALTER SEQUENCE training_applications_id_seq RESTART WITH 1");
  } else {
    await run("DELETE FROM sqlite_sequence WHERE name = ?", ["training_applications"]);
  }

  console.log("Training application data reset successfully.");
  console.log("The next application will receive LDI-GIT-C2-2026-0001 when submitted in 2026.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
