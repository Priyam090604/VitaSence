import React,{useState,useEffect} from 'react'
import {AlertTriangle,Phone,X} from 'lucide-react'
export default function EmergencyBanner({vitals,onDismiss}){
  const [timer,setTimer]=useState(30)
  const isEmergency=vitals.spo2<90||vitals.heartRate>120
  useEffect(()=>{if(!isEmergency)return;const t=setInterval(()=>setTimer(p=>Math.max(0,p-1)),1000);return()=>clearInterval(t)},[isEmergency])
  if(!isEmergency)return null
  return(
    <div className="fixed top-0 left-0 right-0 z-50 emergency-flash">
      <div className="bg-red-900/90 backdrop-blur border-b border-red-500/50 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400 animate-pulse" size={20}/>
            <div>
              <p className="text-red-300 font-bold text-sm">🚨 MEDICAL EMERGENCY DETECTED</p>
              <p className="text-red-400 text-xs">{vitals.spo2<90&&`SpO₂ Critical: ${vitals.spo2}% · `}{vitals.heartRate>120&&`Heart Rate: ${vitals.heartRate} BPM`}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center"><p className="text-red-300 text-xs">Ambulance in</p><p className="text-white font-bold text-2xl font-mono">{String(Math.floor(timer/60)).padStart(2,'0')}:{String(timer%60).padStart(2,'0')}</p></div>
            <a href="tel:112" className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm"><Phone size={16}/> Call 112</a>
            <button onClick={onDismiss} className="text-red-400 hover:text-white"><X size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}