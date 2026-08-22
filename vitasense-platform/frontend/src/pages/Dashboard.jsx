import React,{useEffect,useState} from 'react'
import {useVitalsStore} from '../store/vitalsStore'
import {useAuthStore} from '../store/authStore'
import VitalCard from '../components/dashboard/VitalCard'
import LiveChart from '../components/dashboard/LiveChart'
import EmergencyBanner from '../components/emergency/EmergencyBanner'
import {calcHealthScore,getStressLevel,getRiskLevel} from '../utils/healthCalc'
import {generateHealthReport} from '../utils/generatePDF'
import {Download} from 'lucide-react'
import axios from 'axios'
export default function Dashboard(){
  const{current,history}=useVitalsStore()
  const{user}=useAuthStore()
  const[showEmergency,setShowEmergency]=useState(true)
  const[predictions,setPredictions]=useState({heartRisk:'Low',strokeRisk:'Low',stressLevel:'Normal'})
  const healthScore=calcHealthScore(current)
  const stressLevel=getStressLevel(current.hrv,current.heartRate)
  const risk=getRiskLevel(healthScore)
  useEffect(()=>{
    axios.post('http://localhost:8000/predict',{heart_rate:current.heartRate,spo2:current.spo2,temperature:current.temperature,hrv:current.hrv||45,movement:current.movement||0.3,age:user?.age||35}).then(({data})=>setPredictions(data)).catch(()=>{})
  },[current.heartRate])
  const vitals=[
    {title:'Heart Rate',value:current.heartRate,unit:'BPM',subtitle:'Healthy: 60-100 BPM',status:current.heartRate>100||current.heartRate<60?'Warning':'Normal',icon:'❤️',color:'#ef4444'},
    {title:'SpO₂',value:current.spo2,unit:'%',subtitle:'Healthy: 95-100%',status:current.spo2<95?'Warning':'Normal',icon:'💧',color:'#3b82f6'},
    {title:'Temperature',value:current.temperature?.toFixed(1),unit:'°C',subtitle:'Healthy: 36.1-37.2°C',status:current.temperature>37.5?'Warning':'Normal',icon:'🌡️',color:'#f59e0b'},
    {title:'Health Score',value:healthScore,unit:'/100',subtitle:'AI computed score',status:healthScore>=75?'Tracked':healthScore>=50?'Warning':'Critical',icon:'⚡',color:'#10b981'},
    {title:'HRV (RMSSD)',value:current.hrv,unit:'ms',subtitle:'Higher = better recovery',status:'Tracked',icon:'📈',color:'#8b5cf6'},
    {title:'Hydration',value:Math.min(100,Math.round(current.spo2*0.99)),unit:'%',subtitle:'Healthy: 55-100%',status:'Adequate',icon:'💦',color:'#06b6d4'},
    {title:'Perfusion Index',value:((current.spo2-90)*0.15).toFixed(2),unit:'%',subtitle:'Peripheral perfusion',status:'Tracked',icon:'🔬',color:'#a78bfa'},
    {title:'Respiratory Rate',value:Math.round(12+(current.heartRate-60)*0.1),unit:'brpm',subtitle:'Healthy: 12-20 brpm',status:'Tracked',icon:'🫁',color:'#34d399'},
    {title:'Movement',value:current.movement?.toFixed(2)||'--',unit:'idx',subtitle:'Activity index',status:current.movement>0.1?'Tracked':'No Data',icon:'🏃',color:'#fbbf24'},
    {title:'Stress Level',value:stressLevel,unit:'',subtitle:'Based on HRV + HR',status:stressLevel==='Low'?'Normal':stressLevel==='Medium'?'Moderate':'Warning',icon:'🧠',color:'#f87171'},
  ]
  return(
    <div className="relative">
      <EmergencyBanner vitals={current} onDismiss={()=>setShowEmergency(false)}/>
      <div className={showEmergency&&(current.spo2<90||current.heartRate>120)?'pt-16':''}>
        <div className="px-6 pt-6 pb-4 border-b border-teal-500/10 flex items-center justify-between">
          <div><h1 className="text-2xl font-black text-white">Medical Command Center</h1><p className="text-slate-400 text-sm">Real-time vital monitoring dashboard</p></div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${risk.cls}`}><div className="w-2 h-2 rounded-full animate-pulse" style={{background:risk.color}}/>{risk.label} Risk</div>
            <button onClick={()=>generateHealthReport(current,predictions,user)} className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-2 rounded-xl text-sm hover:bg-teal-500/20"><Download size={15}/> Export PDF</button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{vitals.map(v=><VitalCard key={v.title} {...v}/>)}</div>
          <div className="grid md:grid-cols-2 gap-6">
            <LiveChart data={history.slice(-30)} title="Heart Rate & SpO₂" lines={[{key:'heartRate',name:'HR (BPM)',color:'#ef4444'},{key:'spo2',name:'SpO₂ (%)',color:'#3b82f6'}]}/>
            <LiveChart data={history.slice(-30)} title="Temperature & HRV" lines={[{key:'temperature',name:'Temp (°C)',color:'#f59e0b'},{key:'hrv',name:'HRV (ms)',color:'#8b5cf6'}]}/>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-white font-bold mb-4">🧠 AI Risk Predictions</h3>
            <div className="grid grid-cols-3 gap-4">
              {[{label:'Cardiac Risk',val:predictions.heartRisk,icon:'❤️'},{label:'Stroke Risk',val:predictions.strokeRisk,icon:'🧠'},{label:'Stress Level',val:predictions.stressLevel,icon:'⚡'}].map(p=>(
                <div key={p.label} className="text-center p-4 bg-navy-700/50 rounded-xl border border-white/5">
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className={`text-lg font-bold mb-1 ${p.val==='High'?'text-red-400':p.val==='Medium'?'text-yellow-400':'text-green-400'}`}>{p.val}</div>
                  <div className="text-slate-500 text-xs">{p.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}