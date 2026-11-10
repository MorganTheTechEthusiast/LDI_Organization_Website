import { Archive, CheckCircle2, ClipboardList, Clock3, DollarSign, Download, ExternalLink, Search, Trash2, UserCheck, XCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api.js";

const applicationStatuses = ["Submitted", "Awaiting Payment", "Payment Submitted", "Payment Verified", "Under Review", "Approved", "Rejected", "Payment Rejected", "Registration Completed"];
const paymentStatuses = ["Pending", "Payment Submitted", "Payment Verified", "Payment Rejected", "Refunded"];

export default function TrainingApplications() {
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState("applications");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionDialog, setActionDialog] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("ldi_user") || "{}"); } catch { return {}; } })();

  async function load() {
    const [applicationResponse, paymentResponse, statsResponse] = await Promise.all([api.get(`/admin/training-applications?search=${encodeURIComponent(search)}`), api.get("/admin/training-payments"), api.get("/admin/training-stats")]);
    setApplications(applicationResponse.data);
    setPayments(paymentResponse.data);
    setStats(statsResponse.data);
  }

  useEffect(() => { load().catch(() => setError("Could not load training management data.")); }, [search]);

  async function updateApplication(id, status) {
    try { await api.put(`/admin/training-applications/${id}`, { status }); setMessage("Application status updated and notification sent when email delivery is configured."); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "Could not update application."); }
  }

  async function updatePayment(id, status) {
    try { const response = await api.put(`/admin/training-payments/${id}`, { status }); setMessage(response.data.receipt ? `Payment verified. Receipt ${response.data.receipt.receipt_number} issued.` : "Payment status updated and applicant notification sent when email delivery is configured."); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "Could not update payment."); }
  }

  async function archiveApplication(application) {
    setActionReason("");
    setActionDialog({ type: "archive", application });
  }

  async function deleteApplication(application) {
    setActionReason("");
    setActionDialog({ type: "delete", application });
  }

  async function confirmAction() {
    if (!actionDialog || actionReason.trim().length < 10) {
      setError(`Please provide a ${actionDialog?.type === "delete" ? "deletion" : "archive"} reason of at least 10 characters.`);
      return;
    }
    setActionBusy(true);
    setError("");
    try {
      const { application, type } = actionDialog;
      if (type === "delete") {
        await api.delete(`/admin/training-applications/${application.id}`, { data: { reason: actionReason.trim() } });
        setMessage(`Application ${application.application_reference} was permanently deleted.`);
        setSelected(null);
      } else {
        await api.post(`/admin/training-applications/${application.id}/archive`, { reason: actionReason.trim() });
        setMessage(`Application ${application.application_reference} was archived. Financial records were preserved.`);
      }
      setActionDialog(null);
      setActionReason("");
      await load();
    } catch (requestError) { setError(requestError.response?.data?.message || `Could not ${actionDialog.type} application.`); }
    finally { setActionBusy(false); }
  }

  async function downloadExport(kind) {
    try { const response = await api.get(`/admin/training-export/${kind}`, { responseType: "blob" }); const url = URL.createObjectURL(response.data); const link = document.createElement("a"); link.href = url; link.download = `ldi-training-${kind}.xlsx`; link.click(); URL.revokeObjectURL(url); } catch (requestError) { setError(requestError.response?.data?.message || "Export failed."); }
  }

  return <div className="admin-page"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="admin-kicker">Girls in Tech • Cohort #2</p><h1 className="admin-page-title">Application management</h1><p className="admin-page-lede">Review applicants, verify manual payments, and keep people informed.</p></div><div className="flex gap-2"><button className={`admin-primary-button ${tab !== "applications" ? "opacity-60" : ""}`} onClick={() => setTab("applications")}><ClipboardList className="h-4 w-4" /> Applications</button><button className={`admin-secondary-button ${tab !== "payments" ? "" : "border-maroon text-maroon"}`} onClick={() => setTab("payments")}><DollarSign className="h-4 w-4" /> Payments</button></div></div>
    {message && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}{error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-maroon">{error}</p>}
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["Total applications", stats.total, ClipboardList], ["Under review", stats.under_review, Clock3], ["Approved", stats.accepted, CheckCircle2], ["Verified payments", stats.verified_payments, DollarSign], ["Registered", stats.registered, UserCheck]].map(([label, value, Icon]) => <div className="rounded-lg bg-white p-5 shadow-sm" key={label}><Icon className="mb-4 h-6 w-6 text-maroon" /><p className="text-3xl font-black text-ink">{value ?? "-"}</p><p className="mt-1 text-xs font-bold text-black/55">{label}</p></div>)}</div>
    {tab === "applications" ? <ApplicationTable applications={applications} search={search} setSearch={setSearch} updateApplication={updateApplication} archiveApplication={archiveApplication} deleteApplication={deleteApplication} canDelete={currentUser.role === "superadmin"} setSelected={setSelected} downloadExport={downloadExport} /> : <PaymentTable payments={payments} updatePayment={updatePayment} downloadExport={downloadExport} />}
    {selected && <ApplicationDetail application={selected} close={() => setSelected(null)} />}
    {actionDialog && <ApplicationActionDialog action={actionDialog.type} application={actionDialog.application} reason={actionReason} setReason={setActionReason} busy={actionBusy} close={() => setActionDialog(null)} confirm={confirmAction} />}
  </div>;
}

function ApplicationTable({ applications, search, setSearch, updateApplication, archiveApplication, deleteApplication, canDelete, setSelected, downloadExport }) {
  return <section className="rounded-lg bg-white p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><label className="flex max-w-md flex-1 items-center gap-2 rounded-md border border-black/10 px-3"><Search className="h-4 w-4 text-black/45" /><input className="w-full border-0 bg-transparent py-3 text-sm outline-none" placeholder="Search name or reference" value={search} onChange={(event) => setSearch(event.target.value)} /></label><ExportMenu downloadExport={downloadExport} /></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-ink text-white"><tr><th className="px-3 py-3">Applicant</th><th className="px-3 py-3">Reference</th><th className="px-3 py-3">County</th><th className="px-3 py-3">Submitted</th><th className="px-3 py-3">Application status</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{applications.map((item) => <tr className="border-t border-black/10" key={item.id}><td className="px-3 py-3"><strong>{item.full_name}</strong><br /><span className="text-xs text-black/55">{item.email}</span></td><td className="px-3 py-3 font-semibold text-maroon">{item.application_reference}</td><td className="px-3 py-3">{item.county || "-"}</td><td className="px-3 py-3">{String(item.submitted_at || "").slice(0, 10)}</td><td className="px-3 py-3"><select className="rounded border border-black/10 p-2 text-xs" value={item.status} onChange={(event) => updateApplication(item.id, event.target.value)}>{applicationStatuses.map((option) => <option key={option}>{option}</option>)}</select></td><td className="px-3 py-3">{item.payment_status}</td><td className="px-3 py-3"><div className="flex items-center gap-3"><button className="font-bold text-maroon hover:text-ember" onClick={() => setSelected(item)}>View</button><button type="button" className="admin-archive-button" title={`Archive ${item.application_reference}`} aria-label={`Archive ${item.application_reference}`} onClick={() => archiveApplication(item)}><Archive className="h-3.5 w-3.5" /> Archive</button>{canDelete && <button type="button" className="admin-danger-icon" title={`Permanently delete ${item.application_reference}`} aria-label={`Permanently delete ${item.application_reference}`} onClick={() => deleteApplication(item)}><Trash2 className="h-4 w-4" /></button>}</div></td></tr>)}</tbody></table>{!applications.length && <p className="p-8 text-center text-sm text-black/55">No applications found.</p>}</div></section>;
}

function PaymentTable({ payments, updatePayment, downloadExport }) {
  return <section className="rounded-lg bg-white p-5 shadow-sm"><div className="mb-5 flex justify-end"><ExportMenu downloadExport={downloadExport} /></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-ink text-white"><tr><th className="px-3 py-3">Applicant</th><th className="px-3 py-3">Reference</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Method</th><th className="px-3 py-3">Transaction / proof</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{payments.map((item) => <tr className="border-t border-black/10" key={item.id}><td className="px-3 py-3">{item.full_name}<br /><span className="text-xs text-black/55">{item.email}</span></td><td className="px-3 py-3 font-semibold text-maroon">{item.application_reference}</td><td className="px-3 py-3">{item.currency} {item.amount}</td><td className="px-3 py-3">{item.payment_method}</td><td className="px-3 py-3">{item.transaction_id || item.payment_reference || "-"}{item.evidence_url && <a className="ml-2 inline-flex items-center gap-1 font-bold text-maroon underline" href={item.evidence_url} target="_blank" rel="noreferrer">Proof <ExternalLink className="h-3 w-3" /></a>}</td><td className="px-3 py-3"><select className="rounded border border-black/10 p-2 text-xs" value={item.status} onChange={(event) => updatePayment(item.id, event.target.value)}>{paymentStatuses.map((option) => <option key={option}>{option}</option>)}</select></td></tr>)}</tbody></table>{!payments.length && <p className="p-8 text-center text-sm text-black/55">No payment submissions found.</p>}</div></section>;
}

function ApplicationDetail({ application, close }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={close}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-7" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-maroon">{application.application_reference}</p><h2 className="mt-1 text-2xl font-black text-ink">{application.full_name}</h2></div><button className="grid h-9 w-9 place-items-center rounded bg-black/5" onClick={close} aria-label="Close"><XCircle className="h-5 w-5" /></button></div><div className="mt-6 grid gap-3 text-sm text-black/70 sm:grid-cols-2"><p><strong>Email:</strong> {application.email}</p><p><strong>Phone:</strong> {application.phone}</p><p><strong>County:</strong> {application.county || "-"}</p><p><strong>Education:</strong> {application.educational_status || "-"}</p><p className="sm:col-span-2"><strong>Interest:</strong> {application.interest_reason}</p><p className="sm:col-span-2"><strong>Motivation:</strong> {application.motivation_statement}</p></div><div className="mt-7 flex justify-end"><button className="rounded-md bg-black/5 px-4 py-2 text-sm font-bold" onClick={close}>Close</button></div></div></div>;
}

function ExportMenu({ downloadExport }) { return <div className="flex flex-wrap gap-2"><select className="field px-3 py-2 text-xs font-bold" defaultValue="" onChange={(event) => { if (event.target.value) downloadExport(event.target.value); event.target.value = ""; }}><option value="">Export Excel...</option><option value="complete">All Applicants</option><option value="accepted">Approved Applicants</option><option value="rejected">Rejected Applicants</option><option value="waitlisted">Under Review</option><option value="registered">Registered Participants</option><option value="verified-payments">Verified Payments</option><option value="pending-payments">Pending Payments</option></select><button className="btn-dark px-3 py-2 text-xs" onClick={() => downloadExport("complete")}><Download className="h-4 w-4" /> Export All</button></div>; }

function ApplicationActionDialog({ action, application, reason, setReason, busy, close, confirm }) {
  const permanent = action === "delete";
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="application-action-title">
    <div className={`ldi-modal w-full max-w-lg rounded-sm bg-white p-7 shadow-soft sm:p-9 ${permanent ? "ldi-modal-danger" : ""}`}>
      <div className={`ldi-modal-icon ${permanent ? "ldi-modal-icon-danger" : "ldi-modal-icon-warning"}`}><AlertTriangle className="h-7 w-7" /></div>
      <p className="eyebrow mt-6">Administrative action</p>
      <h2 id="application-action-title" className="mt-2 text-2xl font-black text-ink">{permanent ? "Permanently delete application?" : "Archive application?"}</h2>
      <p className="mt-3 leading-7 text-black/65"><strong className="text-ink">{application.full_name}</strong><br /><span className="text-maroon">{application.application_reference}</span></p>
      <p className="mt-4 rounded-sm bg-red-50 p-4 text-sm leading-6 text-maroon">{permanent ? "This action cannot be undone. Verified payments and receipts are protected and cannot be deleted." : "This hides the application from active lists while preserving financial records and the audit trail."}</p>
      <label className="mt-5 grid gap-2"><span className="label">{permanent ? "Reason for permanent deletion" : "Reason for archiving"} <span className="text-maroon">*</span></span><textarea className="field min-h-24" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Enter at least 10 characters" autoFocus /></label>
      <p className="mt-2 text-xs text-black/50">This reason, your account, time, and action will be recorded in the audit log.</p>
      <div className="mt-7 flex justify-end gap-3"><button type="button" className="rounded-md bg-black/5 px-5 py-3 text-sm font-bold text-ink" onClick={close} disabled={busy}>Cancel</button><button type="button" className={permanent ? "admin-danger-button" : "btn-crimson"} onClick={confirm} disabled={busy}>{busy ? "Processing..." : permanent ? "Permanently delete" : "Archive application"}</button></div>
    </div>
  </div>;
}
