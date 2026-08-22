import React from 'react'
export default function VitalCard({ title,value,unit,subtitle,status,icon,color='#2dd4bf' }) {
  const sc={Normal:'text-green-400 bg-green-400/10 border-green-400/30',Tracked:'text-teal-400 bg-teal-400/10 border-teal-400/30',Warning:'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',Critical:'text-red-400 bg-red-400/10 border-red-400/30',Adequate:'text-green-400 bg-green-400/10 border-green-400/30','No Data':'text-slate-400 bg-slate-400/10 border-slate-400/30',Moderate:'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'}
  return (
    <div className="glass-card p-5 hover:border-teal-500/30 transition-all duration-300 animate-slide-up relative overflow-hidden group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:`radial-gradient(circle at 70% 50%, ${color}08, transparent)`}}/>
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
            {status&&<span className={`mt-1 inline-flex text-xs px-2 py-0.5 rounded-full border ${sc[status]||sc.Normal}`}>{status}</span>}
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white" style={{fontFamily:'JetBrains Mono,monospace',textShadow:`0 0 20px ${color}50`}}>{value}</span>
          {unit&&<span className="text-slate-400 text-sm mb-1">{unit}</span>}
        </div>
        {subtitle&&<p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}