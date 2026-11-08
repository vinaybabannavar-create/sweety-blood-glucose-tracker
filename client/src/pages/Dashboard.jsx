import { useEffect, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Plus, Sparkles, CalendarDays } from 'lucide-react';
import { api } from '../services/api';
import { prettyDate, slotLabels, todayString } from '../utils/date';
import StatCard from '../components/StatCard';
import ReadingForm from '../components/ReadingForm';

export default function Dashboard() {
  const [date,setDate]=useState(todayString());
  const [report,setReport]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [modal,setModal]=useState(null);
  async function load(){setLoading(true);setError('');try{const r=await api(`/reports/daily?date=${date}`);setReport(r.data.report);}catch(e){setError(e.message);}finally{setLoading(false);}}
  useEffect(()=>{load();},[date]);
  const readings=report?.readings||[];
  const bySlot=Object.fromEntries(readings.map(r=>[r.timeSlot,r]));
  return <div className="page">
    <div className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>Your daily snapshot</h1><p className="page-sub">A clear view of your glucose readings, all in one place.</p></div><button className="btn btn-primary" onClick={()=>setModal({})}><Plus size={18}/> Add reading</button></div>
    <section className="welcome-strip"><div className="welcome-icon"><Sparkles size={21}/></div><div><strong>Small steps make a difference.</strong><p>Keep your records consistent and bring them to conversations with your healthcare professional.</p></div><div className="welcome-date"><CalendarDays size={16}/>{prettyDate(date)}</div></section>
    <div className="date-toolbar"><div><span className="eyebrow">SELECTED DAY</span><strong>{prettyDate(date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</strong></div><input aria-label="Select report date" type="date" max={todayString()} value={date} onChange={e=>setDate(e.target.value)}/></div>
    {error&&<div className="form-error">{error}</div>}
    {loading?<div className="loading-card">Loading your readings…</div>:<>
      <div className="stats-grid">
        <StatCard label="Highest reading" value={report?.highest} note="Peak for selected day" icon={ArrowUpRight} tone="peach"/>
        <StatCard label="Lowest reading" value={report?.lowest} note="Lowest for selected day" icon={ArrowDownRight} tone="blue"/>
        <StatCard label="Daily average" value={report?.average} note="Average of recorded values" icon={Activity} tone="mint"/>
        <StatCard label="Readings logged" value={`${report?.count||0}/4`} suffix="" note="Four available time slots" icon={CalendarDays} tone="lavender"/>
      </div>
      <div className="section-heading"><div><h2>Today's readings</h2><p>Your four daily time slots</p></div><span className="count-pill">{report?.count||0} of 4 recorded</span></div>
      <div className="slot-grid">{Object.entries(slotLabels).map(([slot,label],i)=>{const reading=bySlot[slot];return <article className={`slot-card ${reading?'has-reading':''}`} key={slot}><div className="slot-number">0{i+1}</div><div className="slot-content"><span>{label}</span><strong>{reading?`${reading.glucoseValue} mg/dL`:'Not recorded'}</strong><small>{reading?'Reading saved':'No entry for this slot'}</small></div><button className="slot-action" onClick={()=>setModal(reading||{})}>{reading?'Edit':'Add'}</button></article>})}</div>
      {!report?.count&&<div className="empty-state"><div className="empty-icon"><Activity/></div><h3>No readings for this day yet</h3><p>Add your first reading to start building your daily report.</p><button className="btn btn-primary" onClick={()=>setModal({})}><Plus size={17}/> Add first reading</button></div>}
    </>}
    {modal&&<ReadingForm initial={modal.id?modal:null} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load();}}/>}
  </div>;
}
