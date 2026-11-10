import express from "express";
import PDFDocument from "pdfkit";
import XLSX from "xlsx";
import { all, get, run } from "../db.js";
import { requireAuth, requireRoles, requireSuperAdmin } from "../middleware/auth.js";
import { applicationReceivedEmail, sendEmail, statusChangeEmail } from "../services/email.js";

export const trainingRouter = express.Router();

const PROGRAM_SLUG = "girls-in-tech-cohort-2";
const applicationStatuses = ["Submitted", "Awaiting Payment", "Payment Submitted", "Payment Verified", "Under Review", "Approved", "Rejected", "Payment Rejected", "Registration Completed"];
const paymentStatuses = ["Pending", "Payment Submitted", "Payment Verified", "Payment Rejected", "Refunded"];
const publicRequestLog = new Map();
const applicationViewer = requireRoles("training_manager", "finance_reviewer", "support_officer", "auditor");
const trainingManager = requireRoles("training_manager");
const financeReviewer = requireRoles("finance_reviewer");
const auditViewer = requireRoles("training_manager", "finance_reviewer", "auditor");

function publicRateLimit(req, res, next) {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const current = publicRequestLog.get(key) || { count: 0, started: now };
  if (now - current.started > 15 * 60 * 1000) { current.count = 0; current.started = now; }
  current.count += 1;
  publicRequestLog.set(key, current);
  if (current.count > 25) return res.status(429).json({ message: "Too many requests. Please try again later." });
  return next();
}

function parseJson(value, fallback = []) {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function text(value) {
  return String(value ?? "").trim();
}

function publicProgram(program) {
  if (!program) return null;
  return { ...program, learn_items: parseJson(program.learn_items), faq_items: parseJson(program.faq_items) };
}

async function getProgram() {
  return get("SELECT * FROM training_programs WHERE slug = ?", [PROGRAM_SLUG]);
}

async function writeAudit(userId, action, entityType, entityId, metadata = {}, context = {}) {
  await run("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [userId || null, action, entityType, entityId || null, JSON.stringify(metadata), context.ip_address || null, context.user_agent || null, context.reason || null]);
}

function auditContext(req, reason = "") {
  return { ip_address: req.ip, user_agent: req.get("user-agent"), reason };
}

async function notifySuperAdmins(subject, textBody, htmlBody) {
  const admins = await all("SELECT email FROM users WHERE role = 'superadmin' AND email IS NOT NULL");
  const fallback = text(process.env.SUPER_ADMIN_EMAIL);
  const recipients = [...new Set([...admins.map((admin) => admin.email), ...(fallback ? [fallback] : [])])];
  await Promise.all(recipients.map((to) => sendEmail({ to, subject, text: textBody, html: htmlBody })));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function notifyStatus(applicationId, status, message = "") {
  const application = await get("SELECT a.application_reference, a.full_name, a.email, p.title, p.cohort_number FROM training_applications a JOIN training_programs p ON p.id = a.program_id WHERE a.id = ?", [applicationId]);
  if (!application?.email || !application.application_reference) return;
  const email = statusChangeEmail({ applicant: application.full_name, reference: application.application_reference, program: application, status, message });
  await sendEmail({ to: application.email, ...email });
}

trainingRouter.get("/training-programs/girls-in-tech-cohort-2", async (_req, res, next) => {
  try {
    const program = await getProgram();
    if (!program) return res.status(404).json({ message: "Training program not found." });
    return res.json(publicProgram(program));
  } catch (error) { return next(error); }
});

trainingRouter.post("/training-applications", publicRateLimit, async (req, res, next) => {
  try {
    const program = await getProgram();
    if (!program || program.status !== "Open") return res.status(400).json({ message: "Applications for this program are not currently open." });

    const body = req.body || {};
    const required = ["full_name", "phone", "email", "interest_reason", "expected_outcome", "motivation_statement", "emergency_name", "emergency_phone"];
    const missing = required.filter((field) => !text(body[field]));
    if (missing.length) return res.status(400).json({ message: `Please complete: ${missing.join(", ")}.` });
    if (!validateEmail(text(body.email))) return res.status(400).json({ message: "Please provide a valid email address." });
    if (!body.declaration_accepted || !body.terms_accepted || !body.privacy_consent) return res.status(400).json({ message: "You must accept the declaration, terms, and privacy consent before submitting." });

    const duplicate = await get("SELECT application_reference FROM training_applications WHERE program_id = ? AND lower(email) = lower(?) AND deleted_at IS NULL", [program.id, text(body.email)]);
    if (duplicate) return res.status(409).json({ message: "An application already exists for this email address and cohort.", application_reference: duplicate.application_reference });

    const fields = ["program_id", "full_name", "date_of_birth", "gender", "phone", "whatsapp", "email", "residential_address", "county", "city_community", "educational_status", "institution", "highest_qualification", "occupation", "computer_experience", "previous_training", "current_skills", "has_computer", "has_smartphone", "interest_reason", "expected_outcome", "motivation_statement", "relevant_experience", "learned_from", "emergency_name", "emergency_phone", "declaration_accepted", "terms_accepted", "privacy_consent", "photo_url", "supporting_document_url"];
    const values = [program.id, ...fields.slice(1).map((field) => ["declaration_accepted", "terms_accepted", "privacy_consent"].includes(field) ? (body[field] ? 1 : 0) : text(body[field]))];
    const placeholders = fields.map(() => "?").join(", ");
    fields.push("status");
    values.push("Awaiting Payment");
    const result = await run(`INSERT INTO training_applications (${fields.join(", ")}) VALUES (${placeholders}, ?)`, values);
    const year = new Date().getFullYear();
    const reference = `LDI-GIT-C2-${year}-${String(result.id).padStart(4, "0")}`;
    await run("UPDATE training_applications SET application_reference = ? WHERE id = ?", [reference, result.id]);
    await writeAudit(null, "application_submitted", "training_application", result.id, { reference });
    const email = applicationReceivedEmail({ applicant: text(body.full_name), reference, program, amount: program.fee, paymentInstructions: program.payment_instructions });
    await sendEmail({ to: text(body.email), ...email }).catch((error) => console.error("Application confirmation email failed.", error));
    return res.status(201).json({ application_reference: reference, status: "Awaiting Payment", message: "Your application was submitted successfully. A confirmation email has been sent if email delivery is configured." });
  } catch (error) { return next(error); }
});

trainingRouter.post("/training-applications/status", publicRateLimit, async (req, res, next) => {
  try {
    const reference = text(req.body?.application_reference);
    const email = text(req.body?.email);
    if (!reference || !email || !validateEmail(email)) return res.status(400).json({ message: "Application reference and the email used to apply are required." });
    const application = await get(`SELECT a.application_reference, a.full_name, a.email, a.status, a.payment_status, a.submitted_at, p.title, p.cohort_number
      FROM training_applications a JOIN training_programs p ON p.id = a.program_id
      WHERE a.application_reference = ? AND lower(a.email) = lower(?) AND a.deleted_at IS NULL`, [reference, email]);
    if (!application) return res.status(404).json({ message: "We could not find an application with those details." });
    const payment = await get("SELECT pay.status, pay.amount, pay.currency, pay.payment_method, pay.payment_reference, pay.transaction_id, pay.evidence_url, r.receipt_number FROM training_payments pay LEFT JOIN training_receipts r ON r.payment_id = pay.id WHERE pay.application_id = ? ORDER BY pay.id DESC LIMIT 1", [await getApplicationId(reference)]);
    return res.json({ ...application, payment: payment || null });
  } catch (error) { return next(error); }
});

async function getApplicationId(reference) {
  const row = await get("SELECT id FROM training_applications WHERE application_reference = ?", [reference]);
  return row?.id;
}

async function getReceipt(receiptNumber, email = null) {
  const emailClause = email ? " AND lower(a.email) = lower(?)" : "";
  const params = email ? [receiptNumber, email] : [receiptNumber];
  return get(`SELECT r.*, a.application_reference, a.full_name, a.email, p.title, p.cohort_number, pay.amount, pay.currency, pay.payment_method, pay.payment_reference, pay.transaction_id, pay.created_at AS payment_date
    FROM training_receipts r JOIN training_applications a ON a.id = r.application_id JOIN training_programs p ON p.id = a.program_id JOIN training_payments pay ON pay.id = r.payment_id
    WHERE r.receipt_number = ?${emailClause} AND pay.status = 'Payment Verified'`, params);
}

trainingRouter.post("/training-payments", publicRateLimit, async (req, res, next) => {
  try {
    const reference = text(req.body?.application_reference);
    const email = text(req.body?.email);
    const method = text(req.body?.payment_method);
    const paymentReference = text(req.body?.payment_reference);
    const transactionId = text(req.body?.transaction_id);
    const evidenceUrl = text(req.body?.evidence_url);
    const amount = Number(req.body?.amount);
    if (!reference || !email || !method || !Number.isFinite(amount) || amount <= 0 || (!paymentReference && !transactionId && !evidenceUrl)) return res.status(400).json({ message: "Application, email, payment method, amount, and a transaction ID or payment proof are required." });
    const application = await get("SELECT * FROM training_applications WHERE application_reference = ? AND lower(email) = lower(?) AND deleted_at IS NULL", [reference, email]);
    if (!application) return res.status(404).json({ message: "Application not found." });
    const existing = await get("SELECT id FROM training_payments WHERE application_id = ? AND (payment_reference = ? OR transaction_id = ?)", [application.id, paymentReference || transactionId, transactionId || paymentReference]);
    if (existing) return res.status(409).json({ message: "This payment reference has already been submitted." });
    const result = await run("INSERT INTO training_payments (application_id, amount, currency, payment_method, payment_reference, transaction_id, evidence_url, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, 'Payment Submitted', ?)", [application.id, amount, text(req.body?.currency) || "USD", method, paymentReference || transactionId, transactionId, evidenceUrl, text(req.body?.notes)]);
    await run("UPDATE training_applications SET payment_status = 'Payment Submitted', status = 'Payment Submitted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [application.id]);
    await writeAudit(null, "payment_submitted", "training_payment", result.id, { reference });
    await notifyStatus(application.id, "Payment Submitted", "Your payment proof has been received and is waiting for manual LDI verification.").catch((error) => console.error("Payment submission email failed.", error));
    return res.status(201).json({ status: "Payment Submitted", message: "Payment submitted for administrator verification." });
  } catch (error) { return next(error); }
});

trainingRouter.get("/admin/training-applications", requireAuth, applicationViewer, async (req, res, next) => {
  try {
    const conditions = [];
    const params = [];
    if (text(req.query.search)) { conditions.push("(lower(a.full_name) LIKE lower(?) OR lower(a.application_reference) LIKE lower(?))"); params.push(`%${text(req.query.search)}%`, `%${text(req.query.search)}%`); }
    if (text(req.query.status)) { conditions.push("a.status = ?"); params.push(text(req.query.status)); }
    if (text(req.query.county)) { conditions.push("a.county = ?"); params.push(text(req.query.county)); }
    const where = conditions.length ? `WHERE a.deleted_at IS NULL AND ${conditions.join(" AND ")}` : "WHERE a.deleted_at IS NULL";
    const rows = await all(`SELECT a.*, p.title AS program_title, p.cohort_number FROM training_applications a JOIN training_programs p ON p.id = a.program_id ${where} ORDER BY a.submitted_at DESC, a.id DESC`, params);
    return res.json(rows);
  } catch (error) { return next(error); }
});

trainingRouter.get("/admin/training-applications/:id", requireAuth, applicationViewer, async (req, res, next) => {
  try {
    const application = await get("SELECT a.*, p.title AS program_title, p.cohort_number, p.fee, p.currency FROM training_applications a JOIN training_programs p ON p.id = a.program_id WHERE a.id = ? AND a.deleted_at IS NULL", [req.params.id]);
    if (!application) return res.status(404).json({ message: "Application not found." });
    const payments = await all("SELECT * FROM training_payments WHERE application_id = ? ORDER BY id DESC", [req.params.id]);
    return res.json({ ...application, payments });
  } catch (error) { return next(error); }
});

trainingRouter.post("/admin/training-applications/:id/archive", requireAuth, trainingManager, async (req, res, next) => {
  try {
    const reason = text(req.body?.reason);
    if (reason.length < 10) return res.status(400).json({ message: "A deletion reason of at least 10 characters is required." });
    const application = await get("SELECT id, application_reference, full_name, deleted_at FROM training_applications WHERE id = ?", [req.params.id]);
    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.deleted_at) return res.status(409).json({ message: "This application is already archived." });

    await run("UPDATE training_applications SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ?, deletion_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.user.id, reason, application.id]);
    await writeAudit(req.user.id, "application_archived", "training_application", application.id, { application_reference: application.application_reference, full_name: application.full_name }, auditContext(req, reason));
    await notifySuperAdmins(`LDI application archived - ${application.application_reference}`, `Admin ${req.user.email} archived ${application.full_name} (${application.application_reference}). Reason: ${reason}`, `<p><strong>${req.user.name || req.user.email}</strong> archived <strong>${application.full_name}</strong> (${application.application_reference}).</p><p>Reason: ${reason}</p>`).catch((error) => console.error("Archive alert email failed.", error));

    return res.json({ message: "Application archived. Financial records were preserved." });
  } catch (error) { return next(error); }
});

trainingRouter.delete("/admin/training-applications/:id", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const reason = text(req.body?.reason);
    if (reason.length < 10) return res.status(400).json({ message: "A deletion reason of at least 10 characters is required." });
    const application = await get("SELECT id, application_reference, full_name FROM training_applications WHERE id = ?", [req.params.id]);
    if (!application) return res.status(404).json({ message: "Application not found." });
    const verified = await get("SELECT COUNT(*) AS count FROM training_payments WHERE application_id = ? AND status = 'Payment Verified'", [application.id]);
    const receipt = await get("SELECT COUNT(*) AS count FROM training_receipts WHERE application_id = ?", [application.id]);
    if (Number(verified.count) > 0 || Number(receipt.count) > 0) return res.status(409).json({ message: "This application has verified financial records and cannot be permanently deleted. Archive it instead." });

    await run("DELETE FROM training_receipts WHERE application_id = ?", [application.id]);
    await run("DELETE FROM training_payments WHERE application_id = ?", [application.id]);
    await run("DELETE FROM application_documents WHERE application_id = ?", [application.id]);
    await run("DELETE FROM training_participants WHERE application_id = ?", [application.id]);
    await run("DELETE FROM training_applications WHERE id = ?", [application.id]);
    await writeAudit(req.user.id, "application_deleted", "training_application", application.id, { application_reference: application.application_reference, full_name: application.full_name }, auditContext(req, reason));
    await notifySuperAdmins(`LDI application permanently deleted - ${application.application_reference}`, `Super admin ${req.user.email} permanently deleted ${application.full_name} (${application.application_reference}). Reason: ${reason}`, `<p><strong>${req.user.name || req.user.email}</strong> permanently deleted <strong>${application.full_name}</strong> (${application.application_reference}).</p><p>Reason: ${reason}</p>`).catch((error) => console.error("Deletion alert email failed.", error));
    return res.json({ message: "Application permanently deleted." });
  } catch (error) { return next(error); }
});

trainingRouter.put("/admin/training-applications/:id", requireAuth, trainingManager, async (req, res, next) => {
  try {
    const existingApplication = await get("SELECT id, deleted_at FROM training_applications WHERE id = ?", [req.params.id]);
    if (!existingApplication) return res.status(404).json({ message: "Application not found." });
    if (existingApplication.deleted_at) return res.status(409).json({ message: "Archived applications cannot be edited." });
    const status = text(req.body?.status);
    if (status && !applicationStatuses.includes(status)) return res.status(400).json({ message: "Invalid application status." });
    await run("UPDATE training_applications SET status = COALESCE(?, status), admin_notes = COALESCE(?, admin_notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status || null, req.body?.admin_notes ?? null, req.params.id]);
    await writeAudit(req.user.id, "application_updated", "training_application", req.params.id, { status });
    if (status) await notifyStatus(req.params.id, status, text(req.body?.notification_message)).catch((error) => console.error("Application status email failed.", error));
    return res.json(await get("SELECT * FROM training_applications WHERE id = ?", [req.params.id]));
  } catch (error) { return next(error); }
});

trainingRouter.get("/admin/training-payments", requireAuth, requireRoles("training_manager", "finance_reviewer", "auditor"), async (_req, res, next) => {
  try {
    return res.json(await all(`SELECT pay.*, a.application_reference, a.full_name, a.email FROM training_payments pay JOIN training_applications a ON a.id = pay.application_id ORDER BY pay.created_at DESC, pay.id DESC`));
  } catch (error) { return next(error); }
});

trainingRouter.put("/admin/training-payments/:id", requireAuth, financeReviewer, async (req, res, next) => {
  try {
    const status = text(req.body?.status);
    if (!paymentStatuses.includes(status)) return res.status(400).json({ message: "Invalid payment status." });
    const payment = await get("SELECT * FROM training_payments WHERE id = ?", [req.params.id]);
    if (!payment) return res.status(404).json({ message: "Payment not found." });
    const paymentApplication = await get("SELECT deleted_at FROM training_applications WHERE id = ?", [payment.application_id]);
    if (paymentApplication?.deleted_at) return res.status(409).json({ message: "Payments for archived applications cannot be edited." });
    await run("UPDATE training_payments SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, notes = ? WHERE id = ?", [status, req.user.id, text(req.body?.notes), req.params.id]);
    let receipt = null;
    if (status === "Payment Verified") {
      const existing = await get("SELECT * FROM training_receipts WHERE payment_id = ?", [payment.id]);
      if (!existing) {
        const created = await run("INSERT INTO training_receipts (payment_id, application_id, receipt_number, issued_by) VALUES (?, ?, ?, ?)", [payment.id, payment.application_id, `LDI-REC-${new Date().getFullYear()}-${String(payment.id).padStart(4, "0")}`, req.user.id]);
        receipt = await get("SELECT * FROM training_receipts WHERE id = ?", [created.id]);
      } else receipt = existing;
      await run("UPDATE training_applications SET payment_status = 'Payment Verified', status = 'Payment Verified', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [payment.application_id]);
    } else if (["Payment Rejected", "Refunded"].includes(status)) {
      await run("UPDATE training_applications SET payment_status = ?, status = CASE WHEN ? = 'Payment Rejected' THEN 'Payment Rejected' ELSE status END, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, status, payment.application_id]);
    }
    await writeAudit(req.user.id, `payment_${status.toLowerCase().replaceAll("/", "_")}`, "training_payment", payment.id, { receipt: receipt?.receipt_number });
    await notifyStatus(payment.application_id, status, text(req.body?.notes)).catch((error) => console.error("Payment status email failed.", error));
    return res.json({ payment: await get("SELECT * FROM training_payments WHERE id = ?", [payment.id]), receipt });
  } catch (error) { return next(error); }
});

trainingRouter.post("/admin/training-participants", requireAuth, trainingManager, async (req, res, next) => {
  try {
    const application = await get("SELECT * FROM training_applications WHERE id = ?", [req.body?.application_id]);
    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.deleted_at) return res.status(409).json({ message: "Archived applications cannot be registered." });
    if (application.status !== "Approved" || application.payment_status !== "Payment Verified") return res.status(400).json({ message: "Only approved applicants with verified payment can be registered." });
    await run("INSERT INTO training_participants (application_id, program_id, group_name) VALUES (?, ?, ?)", [application.id, application.program_id, text(req.body?.group_name)]);
    await run("UPDATE training_applications SET status = 'Registration Completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [application.id]);
    await writeAudit(req.user.id, "participant_registered", "training_application", application.id, { group_name: text(req.body?.group_name) });
    return res.status(201).json({ message: "Participant registered." });
  } catch (error) { return next(error); }
});

trainingRouter.get("/admin/training-program", requireAuth, trainingManager, async (_req, res, next) => {
  try { return res.json(publicProgram(await getProgram())); } catch (error) { return next(error); }
});

trainingRouter.get("/admin/audit-logs", requireAuth, auditViewer, async (req, res, next) => {
  try {
    const params = [];
    const conditions = [];
    const search = text(req.query.search);
    const action = text(req.query.action);
    if (search) {
      conditions.push("(lower(COALESCE(u.name, '')) LIKE lower(?) OR lower(COALESCE(u.email, '')) LIKE lower(?) OR lower(COALESCE(audit_logs.metadata, '')) LIKE lower(?))");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (action) { conditions.push("audit_logs.action = ?"); params.push(action); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await all(`SELECT audit_logs.id, audit_logs.created_at, audit_logs.action, audit_logs.entity_type, audit_logs.entity_id, audit_logs.metadata, audit_logs.ip_address, audit_logs.user_agent, audit_logs.reason, u.name AS actor_name, u.email AS actor_email FROM audit_logs LEFT JOIN users u ON u.id = audit_logs.user_id ${where} ORDER BY audit_logs.created_at DESC, audit_logs.id DESC LIMIT 500`, params);
    return res.json(rows);
  } catch (error) { return next(error); }
});

trainingRouter.get("/admin/audit-export", requireAuth, auditViewer, async (_req, res, next) => {
  try {
    const rows = await all("SELECT audit_logs.created_at AS Date, u.name AS Actor, u.email AS Email, audit_logs.action AS Action, audit_logs.entity_type AS Entity, audit_logs.entity_id AS Entity_ID, audit_logs.reason AS Reason, audit_logs.ip_address AS IP_Address, audit_logs.metadata AS Details FROM audit_logs LEFT JOIN users u ON u.id = audit_logs.user_id ORDER BY audit_logs.created_at DESC, audit_logs.id DESC");
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet["!cols"] = [{ wch: 22 }, { wch: 24 }, { wch: 34 }, { wch: 26 }, { wch: 24 }, { wch: 12 }, { wch: 45 }, { wch: 20 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(workbook, sheet, "Audit Log");
    const output = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=ldi-audit-log.xlsx");
    return res.send(output);
  } catch (error) { return next(error); }
});

trainingRouter.put("/admin/training-program", requireAuth, trainingManager, async (req, res, next) => {
  try {
    const allowed = ["title", "cohort_number", "tagline", "overview", "about_ldi", "duration", "schedule", "eligibility", "currency", "deadline", "payment_instructions", "image_url", "status"];
    const fields = allowed.filter((field) => req.body[field] !== undefined);
    const values = fields.map((field) => text(req.body[field]));
    if (req.body.fee !== undefined) { fields.push("fee"); values.push(Number(req.body.fee) || 0); }
    if (req.body.learn_items !== undefined) { fields.push("learn_items"); values.push(JSON.stringify(Array.isArray(req.body.learn_items) ? req.body.learn_items : String(req.body.learn_items).split("\n").map((item) => item.trim()).filter(Boolean))); }
    if (req.body.faq_items !== undefined) { fields.push("faq_items"); values.push(JSON.stringify(Array.isArray(req.body.faq_items) ? req.body.faq_items : [])); }
    if (fields.length) await run(`UPDATE training_programs SET ${fields.map((field) => `${field} = ?`).join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE slug = ?`, [...values, PROGRAM_SLUG]);
    await writeAudit(req.user.id, "training_program_updated", "training_program", (await getProgram())?.id, { fields });
    return res.json(publicProgram(await getProgram()));
  } catch (error) { return next(error); }
});

trainingRouter.get("/training-receipts/:receiptNumber([A-Za-z0-9-]+)", async (req, res, next) => {
  try {
    const email = text(req.query.email);
    const receipt = await getReceipt(req.params.receiptNumber, email);
    if (!receipt) return res.status(404).json({ message: "Receipt not found or verification failed." });
    return res.json(receipt);
  } catch (error) { return next(error); }
});

trainingRouter.get("/training-receipts/:receiptNumber.pdf", async (req, res, next) => {
  try {
    const receiptNumber = req.params.receiptNumber.replace(/\.pdf$/, "");
    const receipt = await getReceipt(receiptNumber, text(req.query.email));
    if (!receipt) return res.status(404).json({ message: "Receipt not found or verification failed." });
    const document = new PDFDocument({ size: "A4", margin: 52 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${receipt.receipt_number}.pdf"`);
    document.pipe(res);
    document.fillColor("#6B0F1A").fontSize(24).font("Helvetica-Bold").text("LIBERIA DIGITAL INSIGHTS");
    document.fillColor("#E05A2B").fontSize(11).font("Helvetica").text("Inform. Inspire. Innovate.");
    document.moveDown(2).fillColor("#17171B").fontSize(22).font("Helvetica-Bold").text("OFFICIAL PAYMENT RECEIPT");
    document.moveDown(.5).fontSize(11).font("Helvetica").text(`Receipt number: ${receipt.receipt_number}`);
    document.text(`Issued: ${receipt.issued_at}`);
    document.moveDown(1.5).fillColor("#6B0F1A").fontSize(13).font("Helvetica-Bold").text("Applicant details");
    document.fillColor("#17171B").fontSize(11).font("Helvetica").text(`Name: ${receipt.full_name}`).text(`Application reference: ${receipt.application_reference}`).text(`Email: ${receipt.email}`);
    document.moveDown(1).fillColor("#6B0F1A").fontSize(13).font("Helvetica-Bold").text("Payment details");
    document.fillColor("#17171B").fontSize(11).font("Helvetica").text(`Program: ${receipt.title} (${receipt.cohort_number})`).text(`Amount paid: ${receipt.currency} ${receipt.amount}`).text(`Payment method: ${receipt.payment_method}`).text(`Payment reference: ${receipt.payment_reference}`).text(`Transaction ID: ${receipt.transaction_id || "Not provided"}`).text(`Payment date: ${receipt.payment_date}`).text("Status: VERIFIED / PAID");
    document.moveDown(2).fillColor("#6B0F1A").fontSize(11).font("Helvetica-Bold").text("Authorized by Liberia Digital Insights");
    document.moveDown(3).fillColor("#555555").fontSize(9).font("Helvetica").text("This receipt is issued only after administrator verification of the payment. Keep it for your records.");
    document.text("liberiadigitalinsights@gmail.com  |  +231 777 850 481  |  Monrovia, Liberia");
    document.end();
  } catch (error) { return next(error); }
});

function exportRows(kind, rows) {
  return rows.map((row) => ({
    "Application ID": row.id,
    "Applicant Reference Number": row.application_reference,
    "Full Name": row.full_name,
    "Date of Birth": row.date_of_birth,
    Gender: row.gender,
    "Phone Number": row.phone,
    "WhatsApp Number": row.whatsapp,
    Email: row.email,
    County: row.county,
    "Residential Address": row.residential_address,
    "Educational Background": row.educational_status,
    "Digital Skills Experience": row.current_skills,
    "Application Date": row.submitted_at,
    "Application Status": row.status,
    "Payment Status": row.payment_status,
    "Amount Paid": row.amount,
    "Payment Method": row.payment_method,
    "Transaction Reference": row.payment_reference,
    "Receipt Number": row.receipt_number,
    ...(kind === "registered" ? { "Participant Group": row.group_name, "Registered Date": row.registered_at } : {})
  }));
}

trainingRouter.get("/admin/training-export/:kind", requireAuth, auditViewer, async (req, res, next) => {
  try {
    const kind = text(req.params.kind);
    let rows;
    if (kind === "verified-payments" || kind === "pending-payments") {
      const status = kind === "verified-payments" ? "Payment Verified" : "Payment Submitted";
      rows = await all(`SELECT a.*, pay.amount, pay.payment_method, pay.payment_reference, r.receipt_number FROM training_applications a JOIN training_payments pay ON pay.application_id = a.id LEFT JOIN training_receipts r ON r.payment_id = pay.id WHERE a.deleted_at IS NULL AND pay.status = ? ORDER BY pay.created_at DESC`, [status]);
    } else if (kind === "registered") {
      rows = await all("SELECT a.*, pay.amount, pay.payment_method, pay.payment_reference, r.receipt_number, part.group_name, part.registered_at FROM training_applications a JOIN training_participants part ON part.application_id = a.id LEFT JOIN training_payments pay ON pay.application_id = a.id AND pay.status = 'Payment Verified' LEFT JOIN training_receipts r ON r.payment_id = pay.id WHERE a.deleted_at IS NULL ORDER BY part.registered_at DESC");
    } else {
      const normalizedStatus = { accepted: "Approved", rejected: "Rejected", waitlisted: "Under Review" }[kind];
      rows = await all(`SELECT a.*, pay.amount, pay.payment_method, pay.payment_reference, r.receipt_number FROM training_applications a LEFT JOIN training_payments pay ON pay.application_id = a.id AND pay.status = 'Payment Verified' LEFT JOIN training_receipts r ON r.payment_id = pay.id WHERE a.deleted_at IS NULL${normalizedStatus ? " AND a.status = ?" : ""} ORDER BY a.submitted_at DESC`, normalizedStatus ? [normalizedStatus] : []);
    }
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(exportRows(kind, rows));
    sheet["!cols"] = Object.keys(sheet).length ? [{ wch: 14 }, { wch: 24 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 28 }, { wch: 24 }, { wch: 36 }, { wch: 22 }, { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 24 }, { wch: 22 }] : [];
    XLSX.utils.book_append_sheet(workbook, sheet, "LDI Training Report");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="ldi-training-${kind}.xlsx"`);
    return res.send(buffer);
  } catch (error) { return next(error); }
});

trainingRouter.get("/admin/training-stats", requireAuth, auditViewer, async (_req, res, next) => {
  try {
    const [total, review, accepted, waitlisted, rejected, verified, pending, revenue, registered] = await Promise.all([
      get("SELECT COUNT(*) AS count FROM training_applications WHERE deleted_at IS NULL"), get("SELECT COUNT(*) AS count FROM training_applications WHERE deleted_at IS NULL AND status = 'Under Review'"), get("SELECT COUNT(*) AS count FROM training_applications WHERE deleted_at IS NULL AND status = 'Approved'"), get("SELECT COUNT(*) AS count FROM training_applications WHERE deleted_at IS NULL AND status = 'Under Review'"), get("SELECT COUNT(*) AS count FROM training_applications WHERE deleted_at IS NULL AND status = 'Rejected'"), get("SELECT COUNT(*) AS count FROM training_payments pay JOIN training_applications a ON a.id = pay.application_id WHERE a.deleted_at IS NULL AND pay.status = 'Payment Verified'"), get("SELECT COUNT(*) AS count FROM training_payments pay JOIN training_applications a ON a.id = pay.application_id WHERE a.deleted_at IS NULL AND pay.status IN ('Pending', 'Payment Submitted')"), get("SELECT COALESCE(SUM(pay.amount), 0) AS total FROM training_payments pay JOIN training_applications a ON a.id = pay.application_id WHERE a.deleted_at IS NULL AND pay.status = 'Payment Verified'"), get("SELECT COUNT(*) AS count FROM training_participants part JOIN training_applications a ON a.id = part.application_id WHERE a.deleted_at IS NULL")
    ]);
    return res.json({ total: Number(total?.count || 0), under_review: Number(review?.count || 0), accepted: Number(accepted?.count || 0), waitlisted: Number(waitlisted?.count || 0), rejected: Number(rejected?.count || 0), verified_payments: Number(verified?.count || 0), pending_payments: Number(pending?.count || 0), revenue: Number(revenue?.total || 0), registered: Number(registered?.count || 0) });
  } catch (error) { return next(error); }
});

