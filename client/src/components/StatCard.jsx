export default function StatCard({ label, value, suffix = 'mg/dL', note, icon: Icon, tone = 'mint' }) {
  return <article className={`stat-card tone-${tone}`}><div className="stat-top"><span>{label}</span>{Icon && <span className="stat-icon"><Icon size={18}/></span>}</div><div className="stat-value">{value ?? '—'}<small>{value == null ? '' : suffix}</small></div><div className="stat-note">{note}</div></article>;
}
