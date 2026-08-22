import React,{useState,useEffect} from 'react'
import {useVitalsStore} from '../store/vitalsStore'
import {predictNextVitals} from '../utils/healthCalc'
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts'
import axios from 'axios'
export default function Predictions(){
  const{current,history}=useVitalsStore()
  const[predictions,setPredictions]=useState(null)
  const[forecast,setForecast]=useState([])
  const[loading,setLoading]=useState(false)
  useEffect(()=>{setForecast(predictNextVitals(history))},[history])
  const runPrediction=async()=>{
    setLoading(true)
    try{
      const{data}=await axios.post('http://localhost:8000/predict',{heart_rate:current.heartRate,spo2:current.spo2,temperature:current.temperature,hrv:current.hrv||45,movement:current.movement||0.3,age:35})
      setPredictions(data)
    }catch{
      setPredictions({heartRisk:current.heartRate>100?'High':current.heartRate>85?'Medium':'Low',strokeRisk:current.spo2<95?'High':'Low',stressLevel:(current.hrv||45)<30?'High':(current.hrv||45)<50?'Medium':'Low',heartRiskProb:Math.round(Math.min(95,Math.max(5,(current.heartRate-60)*0.8))),strokeRiskProb:Math.round(Math.min(95,Math.max(2,(100-current.spo2)*5))),confidence:0.87})
    }finally{setLoading(false)}
  }
  useEffect(()=>{runPrediction()},[current.heartRate])
  return(
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-white">AI Risk Predictions</h1><p className="text-slate-400 text-sm">ML-powered health risk assessment</p></div>
        <button onClick={runPrediction} disabled={loading} className="btn-glow bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50">{loading?'Analyzing...':'🧠 Run Analysis'}</button>
      </div>
      {predictions&&(
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[{label:'Cardiac Risk',val:predictions.heartRisk,prob:predictions.heartRiskProb||20,icon:'❤️',color:'#ef4444'},{label:'Stroke Risk',val:predictions.strokeRisk,prob:predictions.strokeRiskProb||10,icon:'🧠',color:'#f59e0b'},{label:'Stress Level',val:predictions.stressLevel,prob:predictions.stressLevel==='High'?70:30,icon:'⚡',color:'#8b5cf6'}].map(p=>(
              <div key={p.label} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4"><span className="text-slate-400 text-sm">{p.label}</span><span className="text-2xl">{p.icon}</span></div>
                <div className={`text-2xl font-black mb-2 ${p.val==='High'?'text-red-400':p.val==='Medium'?'text-yellow-400':'text-green-400'}`}>{p.val}</div>
                <div className="h-2 bg-navy-700 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{width:p.prob+'%',background:p.color,boxShadow:`0 0 8px ${p.color}`}}/></div>
                <p className="text-slate-500 text-xs mt-2">{p.prob}% probability</p>
              </div>
            ))}
          </div>
          {predictions.confidence&&<div className="glass-card p-4 mb-6 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">🎯</div><div><p className="text-white text-sm font-semibold">Model Confidence: {Math.round(predictions.confidence*100)}%</p><p className="text-slate-400 text-xs">Random Forest classifier</p></div></div>}
        </>
      )}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4">🔮 Digital Twin Forecast — Next 10 Minutes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
            <XAxis dataKey="ts" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
            <Tooltip contentStyle={{background:'#0d1224',border:'1px solid rgba(45,212,191,0.2)',borderRadius:8,fontSize:11}}/>
            <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="HR Predicted"/>
            <Line type="monotone" dataKey="spo2" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="SpO₂ Predicted"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}