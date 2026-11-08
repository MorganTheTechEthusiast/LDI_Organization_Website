import { CheckCircle2, ClipboardList, Clock3, DollarSign, Download, Search, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api.js";

const applicationStatuses = ["Submitted", "Under Review", "Accepted", "Waitlisted", "Not Selected", "Payment Pending", "Registration Completed"];
const paymentStatuses = ["Pending", "Under Review", "Verified/Paid", "Rejected", "Refunded"];

export default function TrainingApplications() {
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState("applications");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [applicationResponse, paymentResponse, statsResponse] = await Promise.all([api.get(`/admin/training-applications?search=${encodeURIComponent(search)}`), api.get("/admin/training-payments"), api.get("/admin/training-stats")]);
    setApplications(applicationResponse.data);
    setPayments(paymentResponse.data);
    setStats(statsResponse.data);
  }

  useEffect(() => { load().catch(() => setError("Could not load training management data.")); }, [search]);

  async function updateApplication(id, status) {
    try { await api.put(`/admin/training-applications/${id}`, { status }); setMessage("Application status updated."); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "Could not update application."); }
  }

  async function updatePayment(id, status) {
    try { const response = await api.put(`/admin/training-payments/${id}`, { status }); setMessage(response.data.receipt ? `Payment verified. Receipt ${response.data.receipt.receipt_number} issued.` : "Payment status updated."); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "Could not update payment."); }
  }

  async function downloadExport(kind) {
    try {
      const response = await api.get(`/admin/training-export/${kind}`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ldi-training-${kind}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError.response?.data?.message || "Export failed."); }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase text-maroon">Girls in Tech • Cohort #2</p><h1 className="text-3xl font-black text-ink">Application Management</h1></div><div className="flex gap-2"><button className={`rounded-md px-4 py-2 text-sm font-bold ${tab === "applications" ? "bg-maroon text-white" : "bg-black/5 text-ink"}`} onClick={() => setTab("applications")}>Applications</button><button className={`rounded-md px-4 py-2 text-sm font-bold ${tab === "payments" ? "bg-maroon text-white" : "bg-black/5 text-ink"}`} onClick={() => setTab("payments")}>Payments</button></div></div>
      {message && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}{error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-maroon">{error}</p>}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["Total applications", stats.total, ClipboardList], ["Under review", stats.under_review, Clock3], ["Accepted", stats.accepted, CheckCircle2], ["Verified payments", stats.verified_payments, DollarSign], ["Registered", stats.registered, UserCheck]].map(([label, value, Icon]) => <div className="rounded-lg bg-white p-5 shadow-sm" key={label}><Icon className="mb-4 h-6 w-6 text-maroon" /><p className="text-3xl font-black text-ink">{value ?? "-"}</p><p className="mt-1 text-xs font-bold text-black/55">{label}</p></div>)}</div>
      {tab === "applications" ? <section className="rounded-lg bg-white p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><label className="flex max-w-md flex-1 items-center gap-2 rounded-md border border-black/10 px-3"><Search className="h-4 w-4 text-black/45" /><input className="w-full border-0 bg-transparent py-3 text-sm outline-none" placeholder="Search name or reference" value={search} onChange={(event) => setSearch(event.target.value)} /></label><ExportMenu downloadExport={downloadExport} /></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-ink text-white"><tr><th className="px-3 py-3">Applicant</th><th className="px-3 py-3">Reference</th><th className="px-3 py-3">County</th><th className="px-3 py-3">Submitted</th><th className="px-3 py-3">Application status</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{applications.map((item) => <tr className="border-t border-black/10" key={item.id}><td className="px-3 py-3"><strong>{item.full_name}</strong><br /><span className="text-xs text-black/55">{item.email}</span></td><td className="px-3 py-3 font-semibold text-maroon">{item.application_reference}</td><td className="px-3 py-3">{item.county || "-"}</td><td className="px-3 py-3">{String(item.submitted_at || "").slice(0, 10)}</td><td className="px-3 py-3"><select className="rounded border border-black/10 p-2 text-xs" value={item.status} onChange={(event) => updateApplication(item.id, event.target.value)}>{applicationStatuses.map((option) => <option key={option}>{option}</option>)}</select></td><td className="px-3 py-3">{item.payment_status}</td><td className="px-3 py-3"><button className="font-bold text-maroon hover:text-ember" onClick={() => setSelected(item)}>View</button></td></tr>)}</tbody></table>{!applications.length && <p className="p-8 text-center text-sm text-black/55">No applications found.</p>}</div></section> : <section className="rounded-lg bg-white p-5 shadow-sm"><div className="mb-5 flex justify-end"><ExportMenu downloadExport={downloadExport} /></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-ink text-white"><tr><th className="px-3 py-3">Applicant</th><th className="px-3 py-3">Reference</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Method</th><th className="px-3 py-3">Payment reference</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{payments.map((item) => <tr className="border-t border-black/10" key={item.id}><td className="px-3 py-3">{item.full_name}<br /><span className="text-xs text-black/55">{item.email}</span></td><td className="px-3 py-3 font-semibold text-maroon">{item.application_reference}</td><td className="px-3 py-3">{item.currency} {item.amount}</td><td className="px-3 py-3">{item.payment_method}</td><td className="px-3 py-3">{item.payment_reference}</td><td className="px-3 py-3"><select className="rounded border border-black/10 p-2 text-xs" value={item.status} onChange={(event) => updatePayment(item.id, event.target.value)}>{paymentStatuses.map((option) => <option key={option}>{option}</option>)}</select></td></tr>)}</tbody></table>{!payments.length && <p className="p-8 text-center text-sm text-black/55">No payment submissions found.</p>}</div></section>}
      {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setSelected(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-7" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-maroon">{selected.application_reference}</p><h2 className="mt-1 text-2xl font-black text-ink">{selected.full_name}</h2></div><button className="grid h-9 w-9 place-items-center rounded bg-black/5" onClick={() => setSelected(null)} aria-label="Close">×</button></div><div className="mt-6 grid gap-3 text-sm text-black/70 sm:grid-cols-2"><p><strong>Email:</strong> {selected.email}</p><p><strong>Phone:</strong> {selected.phone}</p><p><strong>County:</strong> {selected.county || "-"}</p><p><strong>Education:</strong> {selected.educational_status || "-"}</p><p className="sm:col-span-2"><strong>Interest:</strong> {selected.interest_reason}</p><p className="sm:col-span-2"><strong>Motivation:</strong> {selected.motivation_statement}</p></div><div className="mt-7 flex justify-end"><button className="rounded-md bg-black/5 px-4 py-2 text-sm font-bold" onClick={() => setSelected(null)}>Close</button></div></div></div>}
    </div>
  );
}

function ExportMenu({ downloadExport }) {
  return <div className="flex flex-wrap gap-2"><select className="field px-3 py-2 text-xs font-bold" defaultValue="" onChange={(event) => { if (event.target.value) downloadExport(event.target.value); event.target.value = ""; }}><option value="">Export Excel...</option><option value="complete">All Applicants</option><option value="accepted">Accepted Applicants</option><option value="rejected">Rejected Applicants</option><option value="waitlisted">Waitlisted Applicants</option><option value="registered">Registered Participants</option><option value="verified-payments">Verified Payments</option><option value="pending-payments">Pending Payments</option></select><button className="btn-dark px-3 py-2 text-xs" onClick={() => downloadExport("complete")}><Download className="h-4 w-4" /> Export All</button></div>;
}
