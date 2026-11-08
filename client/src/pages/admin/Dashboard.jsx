import { ArrowUpRight, BriefcaseBusiness, CalendarDays, ClipboardList, FilePlus2, GraduationCap, Image, Lightbulb, Mail, Newspaper, Plus, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { Link } from "react-router-dom";

const cards = [
  ["Posts", "/blog-posts", Newspaper],
  ["Events", "/events", CalendarDays],
  ["Videos", "/videos", Video],
  ["Training", "/trainings", GraduationCap],
  ["Opportunities", "/opportunities", BriefcaseBusiness],
  ["Team", "/team-members", Users],
  ["Youth Innovation", "/youth-innovators", Lightbulb],
  ["Gallery", "/gallery", Image],
  ["Messages", "/contact-messages", Mail]
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [trainingStats, setTrainingStats] = useState({});

  useEffect(() => {
    Promise.all(cards.map(([label, endpoint]) => api.get(endpoint).then((res) => [label, res.data.length]).catch(() => [label, 0]))).then((entries) => {
      setCounts(Object.fromEntries(entries));
    });
    api.get("/admin/training-stats").then((response) => setTrainingStats(response.data)).catch(() => {});
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-kicker">Workspace overview</p><h1 className="admin-page-title">Good day, administrator.</h1><p className="admin-page-lede">Keep Liberia Digital Insights current, useful, and connected.</p></div><div className="admin-heading-actions"><Link className="admin-secondary-button" to="/" target="_blank"><ArrowUpRight className="h-4 w-4" /> View live site</Link><Link className="admin-primary-button" to="/admin/posts"><Plus className="h-4 w-4" /> Publish content</Link></div></div>
      <div className="admin-stat-grid">
        <div className="admin-stat-card admin-stat-featured"><div className="admin-stat-icon"><ClipboardList className="h-5 w-5" /></div><div><p className="admin-stat-value">{trainingStats.total ?? "-"}</p><p className="admin-stat-label">Training applications</p></div><Link to="/admin/training-applications" className="admin-stat-link">Review <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
        <div className="admin-stat-card"><div className="admin-stat-icon orange"><GraduationCap className="h-5 w-5" /></div><div><p className="admin-stat-value">{trainingStats.accepted ?? "-"}</p><p className="admin-stat-label">Accepted applicants</p></div><span className="admin-stat-note">Cohort #2</span></div>
        <div className="admin-stat-card"><div className="admin-stat-icon green"><FilePlus2 className="h-5 w-5" /></div><div><p className="admin-stat-value">{trainingStats.verified_payments ?? "-"}</p><p className="admin-stat-label">Verified payments</p></div><span className="admin-stat-note">Payments</span></div>
        <div className="admin-stat-card"><div className="admin-stat-icon blue"><Newspaper className="h-5 w-5" /></div><div><p className="admin-stat-value">{counts.Posts ?? "-"}</p><p className="admin-stat-label">Published stories</p></div><span className="admin-stat-note">Live content</span></div>
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Content pulse</p><h2 className="admin-panel-title">Your publishing inventory</h2></div><Link to="/admin/posts" className="admin-text-link">Manage content <ArrowUpRight className="h-4 w-4" /></Link></div><div className="admin-inventory-grid">
        {cards.map(([label, endpoint, Icon]) => (
          <Link to={`/admin${endpoint}`} key={label} className="admin-inventory-item">
            <span className="admin-inventory-icon"><Icon className="h-4 w-4" /></span><span><strong>{counts[label] ?? "-"}</strong><small>{label}</small></span><ArrowUpRight className="admin-inventory-arrow h-4 w-4" />
          </Link>
        ))}
      </div></section>
        <aside className="admin-panel admin-attention-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Next actions</p><h2 className="admin-panel-title">Needs attention</h2></div></div><div className="admin-attention-list"><Link to="/admin/training-applications" className="admin-attention-item"><span className="admin-attention-dot orange" /><span><strong>{trainingStats.under_review ?? 0} applications under review</strong><small>Review applicant progress</small></span><ArrowUpRight className="h-4 w-4" /></Link><Link to="/admin/training-applications" className="admin-attention-item"><span className="admin-attention-dot red" /><span><strong>{trainingStats.pending_payments ?? 0} payments pending</strong><small>Verify submitted payments</small></span><ArrowUpRight className="h-4 w-4" /></Link><Link to="/admin/messages" className="admin-attention-item"><span className="admin-attention-dot blue" /><span><strong>{counts.Messages ?? 0} contact messages</strong><small>Respond to your community</small></span><ArrowUpRight className="h-4 w-4" /></Link></div></aside>
      </div>
      <section className="admin-quick-actions"><div><p className="admin-kicker">Shortcuts</p><h2 className="admin-panel-title">Move the work forward</h2></div><div className="admin-quick-grid"><Link to="/admin/posts"><Newspaper className="h-5 w-5" /><span><strong>Publish a story</strong><small>Share an insight or update</small></span><ArrowUpRight className="h-4 w-4" /></Link><Link to="/admin/opportunities"><BriefcaseBusiness className="h-5 w-5" /><span><strong>Add opportunity</strong><small>Connect people to possibility</small></span><ArrowUpRight className="h-4 w-4" /></Link><Link to="/admin/team"><Users className="h-5 w-5" /><span><strong>Update the team</strong><small>Keep your people directory current</small></span><ArrowUpRight className="h-4 w-4" /></Link></div></section>
    </div>
  );
}
