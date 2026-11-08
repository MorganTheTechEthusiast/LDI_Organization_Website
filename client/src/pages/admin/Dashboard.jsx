import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CheckCircle2, ClipboardList, FileText, Image, Mail, Newspaper, Plus, Users, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";

const inventory = [
  ["Posts", "/blog-posts", Newspaper, "Published stories"],
  ["Events", "/events", CalendarDays, "Events"],
  ["Videos", "/videos", Video, "Video interviews"],
  ["Training", "/trainings", ClipboardList, "Training programs"],
  ["Opportunities", "/opportunities", BriefcaseBusiness, "Opportunities"],
  ["Team", "/team-members", Users, "Team members"],
  ["Gallery", "/gallery", Image, "Gallery moments"],
  ["Messages", "/contact-messages", Mail, "Contact messages"],
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [trainingStats, setTrainingStats] = useState({});

  useEffect(() => {
    Promise.all(inventory.map(([label, endpoint]) => api.get(endpoint).then((response) => [label, response.data.length]).catch(() => [label, 0])))
      .then((entries) => setCounts(Object.fromEntries(entries)));
    api.get("/admin/training-stats").then((response) => setTrainingStats(response.data)).catch(() => {});
  }, []);

  const totalContent = useMemo(() => Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0), [counts]);
  const pipelineTotal = Number(trainingStats.total || 0);
  const pipeline = [
    ["Submitted", Number(trainingStats.total || 0) - Number(trainingStats.under_review || 0) - Number(trainingStats.accepted || 0), "#e05a2b"],
    ["Under review", Number(trainingStats.under_review || 0), "#ffbd74"],
    ["Accepted", Number(trainingStats.accepted || 0), "#28775b"],
  ].map(([label, value, color]) => [label, Math.max(0, value), color]);

  return (
    <div className="admin-page admin-analytics-page">
      <div className="admin-page-heading"><div><p className="admin-kicker">LDI operations</p><h1 className="admin-page-title">Dashboard overview</h1><p className="admin-page-lede">A clear view of your content, community, and current program activity.</p></div><div className="admin-heading-actions"><Link className="admin-secondary-button" to="/admin/messages"><Mail className="h-4 w-4" /> Messages <span className="admin-action-count">{counts.Messages ?? 0}</span></Link><Link className="admin-primary-button" to="/admin/posts"><Plus className="h-4 w-4" /> Create content</Link></div></div>
      <div className="admin-kpi-grid"><Kpi label="Total content" value={totalContent} note="Across your CMS" icon={FileText} tone="orange" href="/admin/posts" /><Kpi label="Applications" value={trainingStats.total ?? 0} note="Girls in Tech • Cohort #2" icon={ClipboardList} tone="red" href="/admin/training-applications" /><Kpi label="Opportunities" value={counts.Opportunities ?? 0} note="Published to the hub" icon={BriefcaseBusiness} tone="green" href="/admin/opportunities" /><Kpi label="Team members" value={counts.Team ?? 0} note="People behind the work" icon={Users} tone="blue" href="/admin/team" /></div>
      <div className="admin-analytics-grid">
        <section className="admin-chart-card admin-chart-card-wide"><PanelHeader eyebrow="Publishing overview" title="Content inventory" link="/admin/posts" linkText="Manage content" /><div className="admin-bar-chart">{inventory.slice(0, 6).map(([label, endpoint, Icon, description]) => { const value = Number(counts[label] || 0); const max = Math.max(...inventory.slice(0, 6).map(([item]) => Number(counts[item] || 0)), 1); return <Link to={`/admin${endpoint}`} className="admin-bar-row" key={label}><span className="admin-bar-label"><Icon className="h-4 w-4" />{label}</span><span className="admin-bar-track"><span className="admin-bar-fill" style={{ width: `${Math.max(value ? 8 : 2, (value / max) * 100)}%` }} /></span><strong>{value}</strong><small>{description}</small></Link>; })}</div><div className="admin-chart-footer"><span><strong>{totalContent}</strong> total records</span><span><strong>{counts.Posts ?? 0}</strong> published stories</span><span><strong>{counts.Events ?? 0}</strong> events listed</span></div></section>
        <section className="admin-chart-card"><PanelHeader eyebrow="Training program" title="Application pipeline" link="/admin/training-applications" linkText="Open applications" /><div className="admin-donut-layout"><div className="admin-donut" style={{ background: `conic-gradient(#e05a2b 0 ${(pipeline[0][1] / Math.max(pipelineTotal, 1)) * 100}%, #ffbd74 ${(pipeline[0][1] / Math.max(pipelineTotal, 1)) * 100}% ${((pipeline[0][1] + pipeline[1][1]) / Math.max(pipelineTotal, 1)) * 100}%, #28775b ${((pipeline[0][1] + pipeline[1][1]) / Math.max(pipelineTotal, 1)) * 100}% 100%)` }}><span>{pipelineTotal}</span></div><div className="admin-legend">{pipeline.map(([label, value, color]) => <div key={label}><span className="admin-legend-dot" style={{ background: color }} /><span>{label}</span><strong>{value}</strong></div>)}</div></div><div className="admin-chart-footer"><span><strong>{trainingStats.verified_payments ?? 0}</strong> verified payments</span><span><strong>{trainingStats.registered ?? 0}</strong> registered</span></div></section>
        <section className="admin-chart-card"><PanelHeader eyebrow="Operational focus" title="What needs attention" /><div className="admin-focus-list"><FocusItem color="orange" value={trainingStats.under_review ?? 0} label="Applications under review" link="/admin/training-applications" /><FocusItem color="red" value={trainingStats.pending_payments ?? 0} label="Payments pending verification" link="/admin/training-applications" /><FocusItem color="blue" value={counts.Messages ?? 0} label="Messages awaiting response" link="/admin/messages" /><FocusItem color="green" value={counts.Opportunities ?? 0} label="Opportunities currently listed" link="/admin/opportunities" /></div><div className="admin-status-note"><CheckCircle2 className="h-4 w-4" /><span>Workspace connected and ready</span></div></section>
      </div>
      <section className="admin-resource-strip"><div><p className="admin-kicker">Quick access</p><h2 className="admin-panel-title">Manage your platform</h2></div><div className="admin-resource-links">{inventory.map(([label, endpoint, Icon]) => <Link key={label} to={`/admin${endpoint}`}><Icon className="h-4 w-4" /><span>{label}</span><ArrowUpRight className="h-3.5 w-3.5" /></Link>)}</div></section>
    </div>
  );
}

function Kpi({ label, value, note, icon: Icon, tone, href }) { return <Link to={href} className={`admin-kpi-card ${tone}`}><div className="admin-kpi-top"><div><p className="admin-kpi-value">{value}</p><p className="admin-kpi-label">{label}</p></div><span className="admin-kpi-icon"><Icon className="h-5 w-5" /></span></div><div className="admin-kpi-bottom"><span>{note}</span><ArrowUpRight className="h-4 w-4" /></div></Link>; }
function PanelHeader({ eyebrow, title, link, linkText }) { return <div className="admin-chart-header"><div><p className="admin-kicker">{eyebrow}</p><h2 className="admin-panel-title">{title}</h2></div>{link && <Link className="admin-text-link" to={link}>{linkText} <ArrowUpRight className="h-3.5 w-3.5" /></Link>}</div>; }
function FocusItem({ color, value, label, link }) { return <Link to={link} className="admin-focus-item"><span className={`admin-focus-icon ${color}`}><ArrowUpRight className="h-3.5 w-3.5" /></span><span><strong>{value}</strong><small>{label}</small></span><ArrowUpRight className="ml-auto h-4 w-4 text-black/25" /></Link>; }
