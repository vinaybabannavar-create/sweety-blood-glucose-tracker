import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { todayString, slotLabels } from '../utils/date';
const empty = { readingDate: todayString(), timeSlot: 'morning', glucoseValue: '' };
export default function ReadingForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial ? { readingDate: initial.readingDate.slice(0,10), timeSlot: initial.timeSlot, glucoseValue: String(initial.glucoseValue) } : empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(()=>{ if(initial) setForm({readingDate:initial.readingDate.slice(0,10),timeSlot:initial.timeSlot,glucoseValue:String(initial.glucoseValue)}); },[initial]);
  function update(e) { setForm({...form,[e.target.name]:e.target.value}); setError(''); }
  async function submit(e) {
    e.preventDefault(); setError('');
    if (form.glucoseValue === '') return setError('Please enter a glucose value.');
    if (!/^\d+$/.test(form.glucoseValue) || Number(form.glucoseValue)<40 || Number(form.glucoseValue)>600) return setError('Value must be a whole number between 40 and 600 mg/dl.');
    if (form.readingDate > todayString()) return setError('Date cannot be in the future.');
    setSaving(true);
    try {
      const body = {...form, glucoseValue:Number(form.glucoseValue)};
      if (initial) await api(`/readings/${initial.id}`,{method:'PUT',body:JSON.stringify(body)});
      else await api('/readings',{method:'POST',body:JSON.stringify(body)});
      onSaved();
    } catch(err) { setError(err.message); } finally { setSaving(false); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="reading-title">
    <div className="modal-head"><div><p className="eyebrow">{initial?'UPDATE ENTRY':'NEW ENTRY'}</p><h2 id="reading-title">{initial?'Edit reading':'Add glucose reading'}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close">×</button></div>
    <form onSubmit={submit} className="form-stack">
      <label>Reading date<input type="date" name="readingDate" max={todayString()} value={form.readingDate} onChange={update} required/></label>
      <label>Time slot<select name="timeSlot" value={form.timeSlot} onChange={update}>{Object.entries(slotLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label>Glucose value <span className="muted">(mg/dL)</span><div className="input-suffix"><input type="number" name="glucoseValue" min="40" max="600" step="1" placeholder="e.g. 105" value={form.glucoseValue} onChange={update}/><span>mg/dL</span></div></label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving?'Saving…':initial?'Save changes':'Save reading'}</button></div>
    </form>
  </section></div>;
}
