import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CheckCircle2, ClipboardList, FileText, Image, Mail, Newspaper, Plus, Users, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";

const inventory = [
  ["Posts", "/blog-posts", "/admin/posts", Newspaper, "Published stories", ["content_editor"]],
  ["Events", "/events", "/admin/events", CalendarDays, "Events", ["content_editor"]],
  ["Videos", "/videos", "/admin/videos", Video, "Video interviews", ["content_editor"]],
  ["Training", "/trainings", "/admin/trainings", ClipboardList, "Training programs", ["content_editor", "training_manager"]],
  ["Opportunities", "/opportunities", "/admin/opportunities", BriefcaseBusiness, "Opportunities", ["content_editor"]],
  ["Team", "/team-members", "/admin/team", Users, "Team members", ["content_editor"]],
  ["Gallery", "/gallery", "/admin/gallery", Image, "Gallery moments", ["content_editor"]],
  ["Messages", "/contact-messages", "/admin/messages", Mail, "Contact messages", ["support_officer", "training_manager", "auditor"]],
];

function readUser() {
  try { return JSON.parse(localStorage.getItem("ldi_user") || "{}"); } catch { return {}; }
}

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [trainingStats, setTrainingStats] = useState({});
  const currentUser = readUser();
  const canAccess = (roles = []) => currentUser.role === "superadmin" || roles.includes(currentUser.role);

  useEffect(() => {
    Promise.all(inventory.map(([label, endpoint]) => api.get(endpoint).then((response) => [label, response.data.length]).catch(() => [label, 0])))
      .then((entries) => setCounts(Object.fromEntries(entries)));
    api.get("/admin/training-stats").then((response) => setTrainingStats(response.data)).catch(() => {});
  }, []);

  const totalContent = useMemo(() => Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0), [counts]);
  const pipelineTotal = Number(trainingStats.total || 0);
  const pipeline = [["Submitted", Number(trainingStats.total || 0) - Number(trainingStats.under_review || 0) - Number(trainingStats.accepted || 0), "#e05a2b"], ["Under review", Number(trainingStats.under_review || 0), "#ffbd74"], ["Accepted", Number(trainingStats.accepted || 0), "#28775b"]].map(([label, value, color]) => [label, Math.max(0, value), color]);

  return <div className="admin-page admin-analytics-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">LDI operations</p><h1 className="admin-page-title">Dashboard overview</h1><p className="admin-page-lede">A clear view of your content, community, and current program activity.</p></div><div className="admin-heading-actions"><ActionLink allowed={canAccess(["support_officer", "training_manager", "auditor"])} className="admin-secondary-button" to="/admin/messages"><Mail className="h-4 w-4" /> Messages <span className="admin-action-count">{counts.Messages ?? 0}</span></ActionLink>{canAccess(["content_editor"]) && <Link className="admin-primary-button" to="/admin/posts"><Plus className="h-4 w-4" /> Create content</Link>}</div></div>
    <div className="admin-kpi-grid"><Kpi label="Total content" value={totalContent} note="Across your CMS" icon={FileText} tone="orange" href="/admin/posts" allowed={canAccess(["content_editor"])} /><Kpi label="Applications" value={trainingStats.total ?? 0} note="Girls in Tech - Cohort #2" icon={ClipboardList} tone="red" href="/admin/training-applications" allowed={canAccess(["training_manager", "finance_reviewer", "support_officer", "auditor"])} /><Kpi label="Opportunities" value={counts.Opportunities ?? 0} note="Published to the hub" icon={BriefcaseBusiness} tone="green" href="/admin/opportunities" allowed={canAccess(["content_editor"])} /><Kpi label="Team members" value={counts.Team ?? 0} note="People behind the work" icon={Users} tone="blue" href="/admin/team" allowed={canAccess(["content_editor"])} /></div>
    <div className="admin-analytics-grid">
      <section className="admin-chart-card admin-chart-card-wide"><PanelHeader eyebrow="Publishing overview" title="Content inventory" link="/admin/posts" linkText="Manage content" allowed={canAccess(["content_editor"])} /><div className="admin-bar-chart">{inventory.slice(0, 6).map(([label, endpoint, adminPath, Icon, description, roles]) => { const value = Number(counts[label] || 0); const max = Math.max(...inventory.slice(0, 6).map(([item]) => Number(counts[item] || 0)), 1); const allowed = canAccess(roles); return <ActionLink to={adminPath} allowed={allowed} className="admin-bar-row" key={label}><span className="admin-bar-label"><Icon className="h-4 w-4" />{label}</span><span className="admin-bar-track"><span className="admin-bar-fill" style={{ width: `${Math.max(value ? 8 : 2, (value / max) * 100)}%` }} /></span><strong>{value}</strong><small>{description}{!allowed ? " - read only" : ""}</small></ActionLink>; })}</div><div className="admin-chart-footer"><span><strong>{totalContent}</strong> total records</span><span><strong>{counts.Posts ?? 0}</strong> published stories</span><span><strong>{counts.Events ?? 0}</strong> events listed</span></div></section>
      <section className="admin-chart-card"><PanelHeader eyebrow="Training program" title="Application pipeline" link="/admin/training-applications" linkText="Open applications" allowed={canAccess(["training_manager", "finance_reviewer", "support_officer", "auditor"])} /><div className="admin-donut-layout"><div className="admin-donut" style={{ background: `conic-gradient(#e05a2b 0 ${(pipeline[0][1] / Math.max(pipelineTotal, 1)) * 100}%, #ffbd74 ${(pipeline[0][1] / Math.max(pipelineTotal, 1)) * 100}% ${((pipeline[0][1] + pipeline[1][1]) / Math.max(pipelineTotal, 1)) * 100}%, #28775b ${((pipeline[0][1] + pipeline[1][1]) / Math.max(pipelineTotal, 1)) * 100}% 100%)` }}><span>{pipelineTotal}</span></div><div className="admin-legend">{pipeline.map(([label, value, color]) => <div key={label}><span className="admin-legend-dot" style={{ background: color }} /><span>{label}</span><strong>{value}</strong></div>)}</div></div><div className="admin-chart-footer"><span><strong>{trainingStats.verified_payments ?? 0}</strong> verified payments</span><span><strong>{trainingStats.registered ?? 0}</strong> registered</span></div></section>
      <section className="admin-chart-card"><PanelHeader eyebrow="Operational focus" title="What needs attention" /><div className="admin-focus-list"><FocusItem color="orange" value={trainingStats.under_review ?? 0} label="Applications under review" link="/admin/training-applications" allowed={canAccess(["training_manager", "finance_reviewer", "support_officer", "auditor"])} /><FocusItem color="red" value={trainingStats.pending_payments ?? 0} label="Payments pending verification" link="/admin/training-applications" allowed={canAccess(["training_manager", "finance_reviewer", "auditor"])} /><FocusItem color="blue" value={counts.Messages ?? 0} label="Messages awaiting response" link="/admin/messages" allowed={canAccess(["support_officer", "training_manager", "auditor"])} /><FocusItem color="green" value={counts.Opportunities ?? 0} label="Opportunities currently listed" link="/admin/opportunities" allowed={canAccess(["content_editor"])} /></div><div className="admin-status-note"><CheckCircle2 className="h-4 w-4" /><span>Workspace connected and ready</span></div></section>
    </div>
    <section className="admin-resource-strip"><div><p className="admin-kicker">Quick access</p><h2 className="admin-panel-title">Workspace overview</h2><p className="admin-readonly-note">{currentUser.role === "superadmin" ? "Full administrative access" : "Read-only items are shown for visibility and cannot be opened from this role."}</p></div><div className="admin-resource-links">{inventory.map(([label, , adminPath, Icon, , roles]) => <ActionLink key={label} to={adminPath} allowed={canAccess(roles)}><Icon className="h-4 w-4" /><span>{label}{!canAccess(roles) && <small>Read only</small>}</span><ArrowUpRight className="h-3.5 w-3.5" /></ActionLink>)}</div></section>
  </div>;
}

function ActionLink({ allowed, to, className = "", children }) {
  if (allowed) return <Link to={to} className={className}>{children}</Link>;
  return <span className={`${className} admin-action-disabled`} aria-disabled="true" title="You have read-only access to this area">{children}</span>;
}

function Kpi({ label, value, note, icon: Icon, tone, href, allowed }) { return <ActionLink to={href} allowed={allowed} className={`admin-kpi-card ${tone}`}><div className="admin-kpi-top"><div><p className="admin-kpi-value">{value}</p><p className="admin-kpi-label">{label}</p></div><span className="admin-kpi-icon"><Icon className="h-5 w-5" /></span></div><div className="admin-kpi-bottom"><span>{note}{!allowed && " - read only"}</span><ArrowUpRight className="h-4 w-4" /></div></ActionLink>; }
function PanelHeader({ eyebrow, title, link, linkText, allowed }) { return <div className="admin-chart-header"><div><p className="admin-kicker">{eyebrow}</p><h2 className="admin-panel-title">{title}</h2></div>{link && <ActionLink className="admin-text-link" to={link} allowed={allowed}>{allowed ? linkText : "Read only"} <ArrowUpRight className="h-3.5 w-3.5" /></ActionLink>}</div>; }
function FocusItem({ color, value, label, link, allowed }) { return <ActionLink to={link} allowed={allowed} className="admin-focus-item"><span className={`admin-focus-icon ${color}`}><ArrowUpRight className="h-3.5 w-3.5" /></span><span><strong>{value}</strong><small>{label}{!allowed ? " - read only" : ""}</small></span><ArrowUpRight className="ml-auto h-4 w-4 text-black/25" /></ActionLink>; }
