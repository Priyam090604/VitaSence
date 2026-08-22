import React,{useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import {Wifi,ChevronRight,Heart} from 'lucide-react'
const features=[
  {icon:'❤️',title:'Real-Time Vitals',desc:'Live HR, SpO2, temperature and movement from ESP32 sensors every 2 seconds.',color:'#ef4444'},
  {icon:'🧠',title:'AI Risk Prediction',desc:'ML models predict cardiac risk, stroke probability and stress levels instantly.',color:'#8b5cf6'},
  {icon:'🏥',title:'Digital Twin',desc:'3D body visualization highlighting affected organ systems in real time.',color:'#06b6d4'},
  {icon:'🚨',title:'Emergency Response',desc:'Auto alerts with email notifications and hospital locator for critical vitals.',color:'#f59e0b'},
  {icon:'🤖',title:'AI Health Assistant',desc:'Context-aware chatbot powered by Gemini AI with live vital awareness.',color:'#10b981'},
  {icon:'📅',title:'Appointments',desc:'Patients book doctors, doctors manage patient health data and write prescriptions.',color:'#3b82f6'},
  {icon:'🚑',title:'Ambulance Tracker',desc:'Request emergency ambulance with live GPS tracking on interactive map.',color:'#f43f5e'},
  {icon:'📊',title:'Advanced Analytics',desc:'HRV computation, health score tracking and predictive forecasting.',color:'#a78bfa'},
]
const steps=[
  {num:'01',title:'Connect Device',desc:'Attach ESP32 with MAX30102 and DS18B20. Powers on and auto-connects via WiFi.'},
  {num:'02',title:'Stream Vitals',desc:'Sensor data streams via WebSocket every 2 seconds. PPG signal captured.'},
  {num:'03',title:'AI Analysis',desc:'ML models process vitals, compute health score, predict risks in real time.'},
  {num:'04',title:'Act & Alert',desc:'Emergency alerts sent automatically. AI assistant provides guidance.'},
]
const tech=['React + Vite','Tailwind CSS','Node.js','MongoDB','Python FastAPI','Scikit-learn','ESP32','Socket.IO','Gemini AI','Three.js','JWT Auth','Nodemailer']
export default function LandingPage(){
  const[hr,setHr]=useState(72)
  useEffect(()=>{const t=setInterval(()=>setHr(h=>Math.round(68+Math.sin(Date.now()/2000)*8)),1000);return()=>clearInterval(t)},[])
  return(
    <div className="min-h-screen bg-navy-900 text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-teal-500/10 backdrop-blur-xl bg-navy-900/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">❤️</div><span className="font-bold text-lg gradient-text">VitaSense</span></div>
          <div className="hidden md:flex items-center gap-8 text-slate-400 text-sm">
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#how" className="hover:text-teal-400 transition-colors">How It Works</a>
            <a href="#tech" className="hover:text-teal-400 transition-colors">Technology</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-300 text-sm hover:text-white px-4 py-2">Sign In</Link>
            <Link to="/signup" className="btn-glow bg-gradient-to-r from-teal-500 to-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">Get Started →</Link>
          </div>
        </div>
      </nav>
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"/><div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"/></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 text-teal-400 text-sm mb-8"><Wifi size={14} className="animate-pulse"/> Live Platform · Doctor + Patient Portals · Ambulance Tracker</div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight"><span className="gradient-text">AI-Powered</span><br/><span className="text-white">Health Intelligence</span><br/><span className="text-slate-400 text-4xl md:text-5xl">for the modern world</span></h1>
            <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">Real-time IoT vital monitoring, ML risk prediction, digital twin, AI chatbot, doctor-patient appointments, and live ambulance tracking.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-glow bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 justify-center">Launch Platform <ChevronRight size={20}/></Link>
              <Link to="/login" className="border border-teal-500/30 text-teal-400 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-500/10 text-center">View Demo</Link>
            </div>
          </div>
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="glass-card p-6 border-teal-500/20">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-white font-bold">Medical Command Center</h3><p className="text-slate-400 text-sm">Real-time vital monitoring dashboard</p></div>
                <div className="flex items-center gap-2 text-green-400 text-sm"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>Device Connected</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{label:'Heart Rate',value:hr+' BPM',color:'#ef4444',icon:'❤️'},{label:'SpO₂',value:'98%',color:'#3b82f6',icon:'💧'},{label:'Temperature',value:'36.8°C',color:'#f59e0b',icon:'🌡️'},{label:'Health Score',value:'87/100',color:'#10b981',icon:'⚡'}].map(v=>(
                  <div key={v.label} className="bg-navy-700/50 rounded-xl p-4 border border-white/5">
                    <div className="text-lg mb-1">{v.icon}</div>
                    <div className="font-bold text-xl text-white" style={{color:v.color,fontFamily:'JetBrains Mono'}}>{v.value}</div>
                    <div className="text-slate-500 text-xs">{v.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="py-20 px-6 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14"><h2 className="text-4xl font-black text-white mb-4">Everything You Need</h2><p className="text-slate-400">A complete health intelligence ecosystem</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f=>(
              <div key={f.title} className="glass-card p-6 hover:border-teal-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{background:f.color+'20',border:`1px solid ${f.color}40`}}>{f.icon}</div>
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="how" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14"><h2 className="text-4xl font-black text-white mb-4">How It Works</h2></div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(s=>(
              <div key={s.num} className="glass-card p-6">
                <div className="text-4xl font-black gradient-text mb-4">{s.num}</div>
                <h3 className="text-white font-bold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="tech" className="py-20 px-6 bg-navy-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14"><h2 className="text-4xl font-black text-white mb-4">Powered By</h2></div>
          <div className="flex flex-wrap justify-center gap-3">
            {tech.map(t=><div key={t} className="glass-card px-4 py-2 text-slate-300 text-sm hover:border-teal-500/30 transition-all">{t}</div>)}
          </div>
        </div>
      </section>
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">Ready to Monitor?</h2>
          <Link to="/signup" className="btn-glow inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xl"><Heart size={24}/> Launch Platform</Link>
        </div>
      </section>
      <footer className="border-t border-teal-500/10 py-8 px-6 text-center text-slate-500 text-sm">
        <p>© 2024 VitaSense — AI Multimodal Health Intelligence Platform</p>
        <p className="mt-1 text-xs">⚠ For demonstration and research purposes. Not a medical device.</p>
      </footer>
    </div>
  )
}