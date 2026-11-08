import { useEffect, useState } from 'react';
import { Activity, CalendarDays, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api';
import { prettyDate, slotLabels, todayString } from '../utils/date';
import StatCard from '../components/StatCard';
export default function Reports() {
  const [date,setDate]=useState(todayString());const [daily,setDaily]=useState(null);const [mtd,setMtd]=useState(null);const [monthly,setMonthly]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{let alive=true;setLoading(true);Promise.all([
    api(`/reports/daily?date=${date}`),api(`/reports/month-to-date?date=${date}`),api(`/reports/monthly?date=${date}`)
  ]).then(([a,b,c])=>{if(alive){setDaily(a.data.report);setMtd(b.data.report);setMonthly(c.data.report);setError('');}}).catch(e=>alive&&setError(e.message)).finally(()=>alive&&setLoading(false));return()=>{alive=false;};},[date]);
  const chartData=(daily?.readings||[]).map(r=>({slot:slotLabels[r.timeSlot].replace(' (fasting)',''),value:r.glucoseValue}));
  function Stats({data}){return <div className="mini-stats"><div><small>Highest</small><strong>{data?.highest??'—'}</strong></div><div><small>Lowest</small><strong>{data?.lowest??'—'}</strong></div><div><small>Average</small><strong>{data?.average??'—'}</strong></div><div><small>Readings</small><strong>{data?.count??0}</strong></div></div>;}
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">INSIGHTS</p><h1>Reports & trends</h1><p className="page-sub">Understand your recorded readings across useful date ranges.</p></div></div>
    <div className="date-toolbar"><div><span className="eyebrow">REPORTS THROUGH</span><strong>{prettyDate(date,{day:'numeric',month:'long',year:'numeric'})}</strong></div><input type="date" max={todayString()} value={date} onChange={e=>setDate(e.target.value)}/></div>
    {error&&<div className="form-error">{error}</div>}
    {loading?<div className="loading-card">Calculating reports…</div>:<>
      <div className="report-grid"><section className="panel report-panel"><div className="report-title"><div className="report-icon"><Activity/></div><div><h2>Daily report</h2><p>{prettyDate(daily.startDate)}</p></div></div><Stats data={daily}/><div className="report-list">{daily.readings.length?daily.readings.map(r=><div className="report-row" key={r.id}><span>{slotLabels[r.timeSlot]}</span><strong>{r.glucoseValue} mg/dL</strong></div>):<p className="muted">No readings recorded for this day.</p>}</div></section>
      <section className="panel report-panel"><div className="report-title"><div className="report-icon peach"><CalendarDays/></div><div><h2>Month-to-date</h2><p>{prettyDate(mtd.startDate)} – {prettyDate(mtd.endDate)}</p></div></div><Stats data={mtd}/><div className="report-footnote">Includes readings from the first day of this month through the selected date.</div></section>
      <section className="panel report-panel"><div className="report-title"><div className="report-icon blue"><TrendingUp/></div><div><h2>Previous month</h2><p>{prettyDate(monthly.startDate)} – {prettyDate(monthly.endDate)}</p></div></div><Stats data={monthly}/><div className="report-footnote">Complete previous calendar month.</div></section></div>
      <section className="panel chart-panel"><div className="panel-head"><div><h2>Daily reading comparison</h2><p>Recorded values for the selected day (mg/dL).</p></div></div>{chartData.length?<div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{top:12,right:16,left:0,bottom:8}}><CartesianGrid strokeDasharray="3 3" stroke="#e8efeb"/><XAxis dataKey="slot" tick={{fontSize:11,fill:'#74827b'}}/><YAxis tick={{fontSize:11,fill:'#74827b'}}/><Tooltip/><Line type="monotone" dataKey="value" stroke="#24966b" strokeWidth={3} dot={{r:5,fill:'#24966b'}}/></LineChart></ResponsiveContainer></div>:<div className="chart-empty">Add daily readings to see them plotted here.</div>}</section>
    </>}
  </div>;
}
