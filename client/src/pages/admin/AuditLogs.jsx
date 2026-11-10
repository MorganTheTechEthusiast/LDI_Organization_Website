import { Download, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api.js";

const actions = ["", "application_archived", "application_deleted", "application_updated", "payment_payment verified", "payment_payment rejected", "application_submitted", "payment_submitted"];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get(`/admin/audit-logs?search=${encodeURIComponent(search)}&action=${encodeURIComponent(action)}`);
      setLogs(data);
      setError("");
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not load audit activity."); }
  }

  useEffect(() => { load(); }, [search, action]);

  async function exportLogs() {
    try {
      const response = await api.get("/admin/audit-export", { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ldi-audit-log.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not export audit activity."); }
  }

  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">Governance & accountability</p><h1 className="admin-page-title">Audit activity</h1><p className="admin-page-lede">A read-only record of administrative actions across applications and payments.</p></div><button className="admin-primary-button" onClick={exportLogs}><Download className="h-4 w-4" /> Export audit log</button></div>
    {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-maroon">{error}</p>}
    <section className="admin-panel audit-panel"><div className="audit-toolbar"><label className="audit-search"><Search className="h-4 w-4" /><input placeholder="Search actor, email, or applicant" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select className="field audit-filter" value={action} onChange={(event) => setAction(event.target.value)}><option value="">All activity</option>{actions.filter(Boolean).map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></div><div className="audit-notice"><ShieldCheck className="h-4 w-4" /><span>Audit entries cannot be edited or deleted from the dashboard.</span></div><div className="overflow-x-auto"><table className="audit-table"><thead><tr><th>Date</th><th>Actor</th><th>Action</th><th>Record</th><th>Reason / details</th><th>IP address</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{new Date(log.created_at).toLocaleString()}</td><td><strong>{log.actor_name || "System / applicant"}</strong><small>{log.actor_email || ""}</small></td><td><span className={`audit-action ${log.action.includes("delete") || log.action.includes("archive") ? "audit-action-danger" : ""}`}>{log.action.replaceAll("_", " ")}</span></td><td>{log.entity_type}<small>#{log.entity_id || "-"}</small></td><td>{log.reason || log.metadata || "-"}</td><td>{log.ip_address || "-"}</td></tr>)}</tbody></table>{!logs.length && <p className="p-8 text-center text-sm text-black/55">No audit activity found.</p>}</div></section>
  </div>;
}
