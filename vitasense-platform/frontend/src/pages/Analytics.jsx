import React from 'react'
import {useVitalsStore} from '../store/vitalsStore'
import {BarChart,Bar,XAxis,YAxis,Tooltip,CartesianGrid,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts'
import {calcHealthScore} from '../utils/healthCalc'
export default function Analytics(){
  const{history,current}=useVitalsStore()
  const score=calcHealthScore(current)
  const hrBins=[{range:'<60',count:history.filter(h=>h.heartRate<60).length},{range:'60-80',count:history.filter(h=>h.heartRate>=60&&h.heartRate<80).length},{range:'80-100',count:history.filter(h=>h.heartRate>=80&&h.heartRate<100).length},{range:'>100',count:history.filter(h=>h.heartRate>=100).length}]
  const pieData=[{name:'Healthy',value:score,color:'#22c55e'},{name:'Risk',value:100-score,color:'#1a2234'}]
  const stats=[{label:'Avg Heart Rate',val:history.length?Math.round(history.reduce((a,b)=>a+(b.heartRate||0),0)/history.length)+' BPM':current.heartRate+' BPM'},{label:'Avg SpO₂',val:history.length?(history.reduce((a,b)=>a+(b.spo2||0),0)/history.length).toFixed(1)+'%':current.spo2+'%'},{label:'Health Score',val:score+'/100'},{label:'Data Points',val:history.length.toString()}]
  return(
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-black text-white">Analytics</h1><p className="text-slate-400 text-sm">Session health data analysis</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{stats.map(s=><div key={s.label} className="glass-card p-5 text-center"><div className="text-2xl font-black text-teal-400 mb-1" style={{fontFamily:'JetBrains Mono'}}>{s.val}</div><div className="text-slate-400 text-xs">{s.label}</div></div>)}</div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6"><h3 className="text-white font-bold mb-4">Heart Rate Distribution</h3><ResponsiveContainer width="100%" height={200}><BarChart data={hrBins}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/><XAxis dataKey="range" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:11}}/><Tooltip contentStyle={{background:'#0d1224',border:'1px solid rgba(45,212,191,0.2)',borderRadius:8}}/><Bar dataKey="count" fill="#ef4444" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
        <div className="glass-card p-6 flex flex-col items-center"><h3 className="text-white font-bold mb-4 self-start">Overall Health Score</h3><PieChart width={200} height={200}><Pie data={pieData} cx={100} cy={100} innerRadius={60} outerRadius={90} startAngle={90} endAngle={-270} dataKey="value">{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart><div className="text-center -mt-4"><div className="text-4xl font-black text-green-400">{score}</div><div className="text-slate-400 text-sm">/ 100</div></div></div>
      </div>
    </div>
  )
}