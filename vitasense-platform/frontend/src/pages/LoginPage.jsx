import React,{useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {useAuthStore} from '../store/authStore'
import toast from 'react-hot-toast'
export default function LoginPage(){
  const[form,setForm]=useState({email:'',password:''})
  const[loading,setLoading]=useState(false)
  const{login}=useAuthStore()
  const navigate=useNavigate()
  const handleSubmit=async(e)=>{
    e.preventDefault();setLoading(true)
    try{await login(form.email,form.password);toast.success('Welcome back!');navigate('/app/dashboard')}
    catch(err){toast.error(err.response?.data?.message||'Login failed')}
    finally{setLoading(false)}
  }
  const demoLogin=async(role)=>{
    setLoading(true)
    const creds=role==='doctor'?{email:'doctor@vitasense.ai',password:'demo123'}:{email:'patient@vitasense.ai',password:'demo123'}
    try{await login(creds.email,creds.password);navigate('/app/dashboard')}
    catch{toast.error('Please sign up first or run the seed script')}
    finally{setLoading(false)}
  }
  return(
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"/><div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"/></div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-2xl">❤️</div><span className="gradient-text text-2xl font-black">VitaSense</span></Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">Welcome back</h1>
          <p className="text-slate-400">Sign in to your health dashboard</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="text-slate-400 text-sm mb-2 block">Email</label><input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full bg-navy-700 border border-teal-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" placeholder="you@example.com"/></div>
            <div><label className="text-slate-400 text-sm mb-2 block">Password</label><input type="password" required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="w-full bg-navy-700 border border-teal-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" placeholder="••••••••"/></div>
            <button type="submit" disabled={loading} className="w-full btn-glow bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50">{loading?'Signing in...':'Sign In'}</button>
          </form>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={()=>demoLogin('patient')} className="border border-teal-500/20 text-teal-400 py-2 rounded-xl text-sm hover:bg-teal-500/10 transition-colors">👤 Demo Patient</button>
            <button onClick={()=>demoLogin('doctor')} className="border border-blue-500/20 text-blue-400 py-2 rounded-xl text-sm hover:bg-blue-500/10 transition-colors">👨‍⚕️ Demo Doctor</button>
          </div>
          <p className="text-center text-slate-400 text-sm mt-6">No account? <Link to="/signup" className="text-teal-400 hover:text-teal-300">Create one →</Link></p>
        </div>
      </div>
    </div>
  )
}