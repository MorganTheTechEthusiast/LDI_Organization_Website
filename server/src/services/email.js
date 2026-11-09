import nodemailer from "nodemailer";

const sender = process.env.MAIL_FROM || process.env.SMTP_USER || "liberiadigitalinsights@gmail.com";

function resolvePublicAppUrl() {
  const configured = process.env.PUBLIC_APP_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const candidate = configured.split(",").map((value) => value.trim()).find(Boolean) || "http://localhost:5173";
  const normalized = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    return new URL(normalized).origin;
  } catch {
    console.warn(`Invalid PUBLIC_APP_URL: ${configured}. Falling back to http://localhost:5173.`);
    return "http://localhost:5173";
  }
}

const publicAppUrl = resolvePublicAppUrl();

const transporter = process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : null;

export function emailConfigured() {
  return Boolean(process.env.BREVO_API_KEY || transporter);
}

async function sendViaBrevo({ to, subject, html, text }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: { name: "Liberia Digital Insights", email: sender },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text
    })
  });

  if (!response.ok) {
    throw new Error(`Brevo email failed (${response.status}): ${await response.text()}`);
  }

  return { sent: true, configured: true, provider: "brevo" };
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    console.warn("Email notification skipped: recipient address is missing.");
    return { sent: false, configured: false };
  }

  // Prefer HTTPS email delivery because Railway SMTP connections may time out.
  if (process.env.BREVO_API_KEY) {
    return sendViaBrevo({ to, subject, html, text });
  }

  if (!transporter) {
    console.warn("Email notification skipped: configure BREVO_API_KEY or SMTP_USER/SMTP_PASS.");
    return { sent: false, configured: false };
  }

  await transporter.sendMail({ from: sender, to, subject, text, html });
  return { sent: true, configured: true, provider: "smtp" };
}

function shell(content) {
  return `<!doctype html><html><body style="margin:0;background:#f8f9fa;color:#17171b;font-family:Arial,sans-serif"><div style="max-width:620px;margin:24px auto;background:#fff;border:1px solid #eadde0"><div style="padding:24px 28px;background:#6b0f1a;color:#fff"><div style="font-size:20px;font-weight:700">LIBERIA DIGITAL INSIGHTS</div><div style="margin-top:5px;color:#ffbd74;font-size:12px;font-weight:700;letter-spacing:1px">INFORM. INSPIRE. INNOVATE.</div></div><div style="padding:28px">${content}</div><div style="padding:18px 28px;border-top:1px solid #eee;color:#777;font-size:12px">Liberia Digital Insights · liberiadigitalinsights@gmail.com · +231777850481</div></div></body></html>`;
}

function button(label, href) {
  return `<a href="${href}" style="display:inline-block;margin-top:18px;padding:12px 18px;background:#6b0f1a;color:#fff;text-decoration:none;font-weight:700;font-size:13px">${label}</a>`;
}

export function applicationReceivedEmail({ applicant, reference, program, amount, paymentInstructions }) {
  const statusUrl = `${publicAppUrl}/training/girls-in-tech-cohort-2#status`;
  const payment = Number(amount) > 0 ? `${program.currency || "USD"} ${amount}` : "See the official payment instructions from LDI";
  return {
    subject: `LDI application received · ${reference}`,
    text: `Thank you ${applicant}. Your application for ${program.title} (${program.cohort_number}) was received. Application reference: ${reference}. Status: Awaiting Payment. Amount: ${payment}. Payment instructions: ${paymentInstructions || "Contact LDI for authorized payment instructions."} Check your status: ${statusUrl}`,
    html: shell(`<p style="font-size:16px">Hello ${applicant},</p><h1 style="color:#6b0f1a;font-size:24px">Your application was received</h1><p>Thank you for applying to <strong>${program.title} · ${program.cohort_number}</strong>.</p><div style="padding:16px;background:#fff4ef;border-left:4px solid #e05a2b"><strong>Application reference</strong><div style="margin-top:6px;color:#6b0f1a;font-size:20px;font-weight:700">${reference}</div><div style="margin-top:8px">Current status: <strong>Awaiting Payment</strong></div></div><p style="margin-top:20px"><strong>Payment amount:</strong> ${payment}</p><p><strong>Payment instructions</strong><br>${paymentInstructions || "Contact LDI for authorized Orange Money or MTN payment instructions."}</p><p>After payment, return to the application portal and submit your transaction ID or payment screenshot for manual verification.</p>${button("Check application status", statusUrl)}`)
  };
}

export function statusChangeEmail({ applicant, reference, program, status, message }) {
  const statusUrl = `${publicAppUrl}/training/girls-in-tech-cohort-2#status`;
  return {
    subject: `LDI application update · ${reference}`,
    text: `Hello ${applicant}. Your LDI application ${reference} for ${program.title} has been updated to: ${status}. ${message || "Please check the application portal for the latest details."} ${statusUrl}`,
    html: shell(`<p style="font-size:16px">Hello ${applicant},</p><h1 style="color:#6b0f1a;font-size:24px">Your application has been updated</h1><p>Your application for <strong>${program.title} · ${program.cohort_number}</strong> has a new status.</p><div style="padding:16px;background:#fff4ef;border-left:4px solid #e05a2b"><strong>Application reference</strong><div style="margin-top:6px;color:#6b0f1a;font-size:18px;font-weight:700">${reference}</div><div style="margin-top:8px">New status: <strong>${status}</strong></div></div>${message ? `<p>${message}</p>` : ""}${button("View application status", statusUrl)}`)
  };
}
