import React,{useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {useAuthStore} from '../store/authStore'
import toast from 'react-hot-toast'
export default function SignupPage(){
  const[form,setForm]=useState({name:'',email:'',password:'',role:'patient'})
  const[loading,setLoading]=useState(false)
  const{signup}=useAuthStore()
  const navigate=useNavigate()
  const handleSubmit=async(e)=>{
    e.preventDefault();setLoading(true)
    try{await signup(form);toast.success('Account created!');navigate('/app/dashboard')}
    catch(err){toast.error(err.response?.data?.message||'Signup failed')}
    finally{setLoading(false)}
  }
  return(
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-2xl">❤️</div><span className="gradient-text text-2xl font-black">VitaSense</span></Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">Create account</h1>
          <p className="text-slate-400">Start your health intelligence journey</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[{key:'name',label:'Full Name',type:'text',ph:'Dr. John Doe'},{key:'email',label:'Email',type:'email',ph:'you@hospital.com'},{key:'password',label:'Password',type:'password',ph:'••••••••'}].map(f=>(
              <div key={f.key}><label className="text-slate-400 text-sm mb-2 block">{f.label}</label><input type={f.type} required value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="w-full bg-navy-700 border border-teal-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" placeholder={f.ph}/></div>
            ))}
            <div><label className="text-slate-400 text-sm mb-2 block">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {['patient','doctor'].map(r=>(
                  <button key={r} type="button" onClick={()=>setForm(p=>({...p,role:r}))} className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.role===r?'border-teal-500 bg-teal-500/10 text-teal-400':'border-teal-500/20 text-slate-400 hover:border-teal-500/40'}`}>{r==='patient'?'👤 Patient':'👨‍⚕️ Doctor'}</button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-glow bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50">{loading?'Creating...':'Create Account'}</button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-6">Have an account? <Link to="/login" className="text-teal-400 hover:text-teal-300">Sign in →</Link></p>
        </div>
      </div>
    </div>
  )
}