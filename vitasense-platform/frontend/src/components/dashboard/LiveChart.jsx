import React from 'react'
import {AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend} from 'recharts'
const CT=({active,payload,label})=>{if(!active||!payload?.length)return null;return <div className="glass-card p-3 text-xs"><p className="text-slate-400 mb-1">{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color}}>{p.name}: {p.value}</p>)}</div>}
export default function LiveChart({data,lines=[],title,height=200}){
  return(
    <div className="glass-card p-5">
      <h3 className="text-white font-semibold mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>{lines.map(l=><linearGradient key={l.key} id={`g-${l.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={l.color} stopOpacity={0.3}/><stop offset="95%" stopColor={l.color} stopOpacity={0}/></linearGradient>)}</defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
          <XAxis dataKey="ts" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:11,color:'#94a3b8'}}/>
          {lines.map(l=><Area key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} fill={`url(#g-${l.key})`} strokeWidth={2} dot={false} activeDot={{r:4,fill:l.color}}/>)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}