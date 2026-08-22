import React from 'react'
import {useVitalsStore} from '../store/vitalsStore'
import {useAuthStore} from '../store/authStore'
import {ComposedChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts'
import {Wifi,WifiOff,Volume2} from 'lucide-react'
import {generateHealthReport} from '../utils/generatePDF'
export default function LiveMonitoring(){
  const{current,history,connected}=useVitalsStore()
  const{user}=useAuthStore()
  const speakSummary=()=>{
    const msg=new SpeechSynthesisUtterance(`Current vitals: Heart rate ${current.heartRate} BPM. SpO2 ${current.spo2} percent. Temperature ${current.temperature} celsius.`)
    speechSynthesis.speak(msg)
  }
  return(
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="text-2xl font-black text-white">Live Monitoring</h1><p className="text-slate-400 text-sm">Real-time vital signs streaming</p></div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${connected?'border-green-500/30 bg-green-500/10 text-green-400':'border-red-500/30 bg-red-500/10 text-red-400'}`}>{connected?<Wifi size={14}/>:<WifiOff size={14}/>}{connected?'Device Connected':'No Device'}</div>
          <button onClick={speakSummary} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-sm"><Volume2 size={14}/> Voice Summary</button>
          <button onClick={()=>generateHealthReport(current,{},user)} className="bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-2 rounded-xl text-sm">Export Report</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{label:'Heart Rate',val:current.heartRate,unit:'BPM',color:'#ef4444',bg:'from-red-900/20'},{label:'SpO₂',val:current.spo2,unit:'%',color:'#3b82f6',bg:'from-blue-900/20'},{label:'Temperature',val:current.temperature?.toFixed(1),unit:'°C',color:'#f59e0b',bg:'from-amber-900/20'},{label:'Health Score',val:current.healthScore||82,unit:'/100',color:'#10b981',bg:'from-green-900/20'}].map(v=>(
          <div key={v.label} className={`glass-card p-6 bg-gradient-to-br ${v.bg} to-transparent`}>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">{v.label}</p>
            <div className="flex items-end gap-2"><span className="text-4xl font-black" style={{color:v.color,fontFamily:'JetBrains Mono',textShadow:`0 0 20px ${v.color}60`}}>{v.val}</span><span className="text-slate-400 text-sm mb-1">{v.unit}</span></div>
          </div>
        ))}
      </div>
      <div className="glass-card p-6 mb-6">
        <h3 className="text-white font-bold mb-1">PPG Signal — Photoplethysmography</h3>
        <p className="text-slate-400 text-xs mb-4">Continuous waveform from MAX sensor</p>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={history.slice(-40)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
            <XAxis dataKey="ts" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:'#0d1224',border:'1px solid rgba(45,212,191,0.2)',borderRadius:8,fontSize:11}}/>
            <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} name="HR"/>
            <Line type="monotone" dataKey="spo2" stroke="#06b6d4" strokeWidth={2} dot={false} name="SpO₂"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-4">📡 Sensor Data</h3>
          <div className="space-y-3">
            {[{label:'MAX30102 (SpO₂/HR)',val:connected?'Active':'Inactive',ok:connected},{label:'DS18B20 (Temp)',val:connected?current.temperature+'°C':'--',ok:connected},{label:'ADXL335 (Movement)',val:connected?current.movement?.toFixed(3):'--',ok:connected},{label:'Sample Rate',val:'2 Hz',ok:true},{label:'Last Update',val:new Date().toLocaleTimeString(),ok:true}].map(s=>(
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 text-sm">{s.label}</span>
                <span className={`text-sm font-medium ${s.ok?'text-green-400':'text-red-400'}`}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-4">📷 Camera Data</h3>
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-teal-500/20 rounded-xl">
            <p className="text-slate-500 text-sm">Camera module</p>
            <p className="text-slate-600 text-xs">rPPG analysis available when enabled</p>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between"><span>rPPG Heart Rate</span><span className="text-teal-400">{current.heartRate} BPM</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}