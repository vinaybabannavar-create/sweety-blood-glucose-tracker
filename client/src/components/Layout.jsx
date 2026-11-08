import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, CalendarDays, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate('/login'); }
  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/history', label: 'Reading history', icon: Activity },
    { to: '/reports', label: 'Reports', icon: CalendarDays },
  ];
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand"><span className="brand-mark"><Activity size={21}/></span><span>Sweety<small>GLUCOSE TRACKER</small></span></Link>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==='/'} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="user-chip"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="user-meta"><strong>{user?.name}</strong><small>{user?.email}</small></div></div><button className="logout-btn" onClick={handleLogout}><LogOut size={17}/> Sign out</button></div>
    </aside>
    {open && <button className="mobile-scrim" onClick={()=>setOpen(false)} aria-label="Close menu"/>}
    <main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button><span className="topbar-label">Your health, one reading at a time.</span><div className="topbar-right"><span className="status-dot"/> Personal workspace</div></header><div className="content"><Outlet/></div></main>
  </div>;
}
