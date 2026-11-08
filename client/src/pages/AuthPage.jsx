import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form,setForm]=useState({name:'',email:'',password:''});
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  if(user) return <Navigate to="/" replace/>;
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { if(isRegister) await register(form); else await login({email:form.email,password:form.password}); navigate('/'); }
    catch(err){setError(err.message);} finally{setBusy(false);}
  }
  return <div className="auth-page"><div className="auth-brand"><span className="brand-mark"><Activity/></span><span>Sweety</span></div><div className="auth-card">
    <p className="eyebrow">YOUR PERSONAL HEALTH JOURNAL</p><h1>{isRegister?'Create your account':'Welcome back'}</h1><p className="auth-sub">{isRegister?'Start keeping your glucose readings organized.':'Sign in to continue to your glucose dashboard.'}</p>
    <form onSubmit={submit} className="form-stack">
      {isRegister&&<label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" minLength="2" maxLength="100" required/></label>}
      <label>Email address<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label>
      <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters" minLength="8" required/></label>
      {error&&<div className="form-error" role="alert">{error}</div>}
      <button className="btn btn-primary btn-full" disabled={busy}>{busy?'Please wait…':isRegister?'Create account':'Sign in'} <ArrowRight size={17}/></button>
    </form>
    <p className="auth-switch">{isRegister?'Already have an account?':'New to Sweety?'} <Link to={isRegister?'/login':'/register'}>{isRegister?'Sign in':'Create an account'}</Link></p>
  </div><p className="auth-foot">A simple, private place to record your daily readings.</p></div>;
}
