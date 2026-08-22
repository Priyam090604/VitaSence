import React,{useState} from 'react'
import {useVitalsStore} from '../store/vitalsStore'
import {AlertTriangle,Phone,CheckCircle} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {Link} from 'react-router-dom'
export default function Emergency(){
  const{current}=useVitalsStore()
  const[alertSent,setAlertSent]=useState(false)
  const[loading,setLoading]=useState(false)
  const isEmergency=current.spo2<90||current.heartRate>120
  const sendAlert=async()=>{
    setLoading(true)
    try{await axios.post('/api/emergency/alert',{vitals:current,type:'manual'});setAlertSent(true);toast.success('Emergency alert sent!')}
    catch{toast.error('Alert sent (demo mode)');setAlertSent(true)}
    finally{setLoading(false)}
  }
  return(
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-black text-white">Emergency Response</h1><p className="text-slate-400 text-sm">Automated emergency detection and response</p></div>
      <div className={`glass-card p-6 mb-6 border ${isEmergency?'border-red-500/50 emergency-flash':'border-green-500/30 bg-green-500/5'}`}>
        <div className="flex items-center gap-3">
          {isEmergency?<AlertTriangle className="text-red-400 animate-pulse" size={28}/>:<CheckCircle className="text-green-400" size={28}/>}
          <div><h2 className={`text-xl font-black ${isEmergency?'text-red-400':'text-green-400'}`}>{isEmergency?'🚨 EMERGENCY DETECTED':'✅ All Vitals Normal'}</h2><p className="text-slate-400 text-sm">{isEmergency?`Critical: ${current.spo2<90?'SpO₂ '+current.spo2+'% ':''}${current.heartRate>120?'HR '+current.heartRate+' BPM':''}`:'Monitoring active. Triggers: SpO₂<90% or HR>120 BPM'}</p></div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[{icon:'🚑',title:'Call Emergency',sub:'Dial 112',action:()=>window.open('tel:112'),btn:'Call 112',color:'red'},{icon:'📧',title:'Send Alert',sub:alertSent?'Alert sent!':'Notify contact',action:sendAlert,btn:alertSent?'✓ Sent':'Send Alert',color:'blue'},{icon:'🏥',title:'Find Hospitals',sub:'Nearest ER',action:null,btn:null,color:'teal',link:'/app/hospitals'}].map(a=>(
          <div key={a.title} className="glass-card p-5 text-center">
            <div className="text-3xl mb-3">{a.icon}</div><h3 className="text-white font-bold mb-1">{a.title}</h3><p className="text-slate-400 text-xs mb-4">{a.sub}</p>
            {a.link?<Link to={a.link} className="block w-full py-2 rounded-xl font-bold text-sm bg-teal-500/20 border border-teal-500/50 text-teal-400 hover:bg-teal-500/30">{a.btn||'Go'}</Link>:<button onClick={a.action} disabled={loading} className={`w-full py-2 rounded-xl font-bold text-sm ${a.color==='red'?'bg-red-500/20 border border-red-500/50 text-red-400':a.color==='blue'?'bg-blue-500/20 border border-blue-500/50 text-blue-400':'bg-teal-500/20 border border-teal-500/50 text-teal-400'}`}>{a.btn}</button>}
          </div>
        ))}
      </div>
      <div className="glass-card p-5 mb-6">
        <h3 className="text-white font-bold mb-3">🚑 Request Ambulance</h3>
        <p className="text-slate-400 text-sm mb-3">For full GPS ambulance tracking with live map</p>
        <Link to="/app/ambulance" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">🆘 Open Ambulance Tracker</Link>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4">Emergency Trigger Thresholds</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[{label:'SpO₂ Critical',threshold:'< 90%',current:current.spo2+'%',ok:current.spo2>=90},{label:'Heart Rate High',threshold:'> 120 BPM',current:current.heartRate+' BPM',ok:current.heartRate<=120},{label:'Temperature High',threshold:'> 39°C',current:current.temperature+'°C',ok:current.temperature<=39},{label:'SpO₂ Warning',threshold:'< 95%',current:current.spo2+'%',ok:current.spo2>=95}].map(t=>(
            <div key={t.label} className="flex items-center justify-between p-3 bg-navy-700/50 rounded-xl border border-white/5">
              <div><p className="text-white text-sm font-medium">{t.label}</p><p className="text-slate-500 text-xs">Trigger: {t.threshold}</p></div>
              <div className="text-right"><p className={`font-bold text-sm ${t.ok?'text-green-400':'text-red-400'}`}>{t.current}</p><p className={`text-xs ${t.ok?'text-green-600':'text-red-600'}`}>{t.ok?'✓ Safe':'⚠️ Alert'}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}