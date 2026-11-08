import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Activity } from 'lucide-react';
import { api } from '../services/api';
import { prettyDate, slotLabels, todayString } from '../utils/date';
import ReadingForm from '../components/ReadingForm';
export default function History() {
  const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [modal,setModal]=useState(null);const [page,setPage]=useState(1);const [pagination,setPagination]=useState(null);
  async function load(){setLoading(true);try{const r=await api(`/readings?page=${page}&limit=20`);setItems(r.data.items);setPagination(r.data.pagination);setError('');}catch(e){setError(e.message);}finally{setLoading(false);}}
  useEffect(()=>{load();},[page]);
  async function remove(id){if(!window.confirm('Delete this reading? This action cannot be undone.'))return;try{await api(`/readings/${id}`,{method:'DELETE'});load();}catch(e){setError(e.message);}}
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">YOUR RECORDS</p><h1>Reading history</h1><p className="page-sub">Review and manage the readings you've recorded.</p></div><button className="btn btn-primary" onClick={()=>setModal({})}><Plus size={18}/> Add reading</button></div>
    {error&&<div className="form-error">{error}</div>}
    <section className="panel"><div className="panel-head"><div><h2>All readings</h2><p>Newest entries appear first.</p></div><span className="count-pill">{pagination?.total||0} total</span></div>
    {loading?<div className="loading-card">Loading history…</div>:items.length===0?<div className="empty-state compact"><div className="empty-icon"><Activity/></div><h3>No readings yet</h3><p>Your saved readings will appear here.</p></div>:<div className="table-wrap"><table><thead><tr><th>Date</th><th>Time slot</th><th>Glucose value</th><th>Actions</th></tr></thead><tbody>{items.map(r=><tr key={r.id}><td>{prettyDate(r.readingDate)}</td><td>{slotLabels[r.timeSlot]}</td><td><strong className="reading-number">{r.glucoseValue}</strong> <span className="muted">mg/dL</span></td><td><div className="table-actions"><button className="icon-btn" aria-label="Edit reading" onClick={()=>setModal(r)}><Pencil size={16}/></button><button className="icon-btn danger" aria-label="Delete reading" onClick={()=>remove(r.id)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
    <div className="pagination"><span>Page {pagination?.page||1} of {Math.max(1,pagination?.pages||1)}</span><div><button className="btn btn-secondary btn-small" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><button className="btn btn-secondary btn-small" disabled={!pagination||page>=pagination.pages} onClick={()=>setPage(p=>p+1)}>Next</button></div></div></section>
    {modal&&<ReadingForm initial={modal.id?modal:null} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load();}}/>}
  </div>;
}
