import React from 'react'
import {useAuthStore} from '../store/authStore'
import {useVitalsStore} from '../store/vitalsStore'
import {calcHealthScore} from '../utils/healthCalc'
export default function Profile(){
  const{user}=useAuthStore();const{current}=useVitalsStore();const score=calcHealthScore(current)
  return(
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-black text-white mb-6">Profile</h1>
      <div className="glass-card p-8 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-3xl font-black">{user?.name?.[0]?.toUpperCase()||'U'}</div>
          <div><h2 className="text-2xl font-black text-white">{user?.name||'User'}</h2><p className="text-teal-400 capitalize">{user?.role||'patient'}</p><p className="text-slate-400 text-sm">{user?.email}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4">{[{label:'Account Type',val:user?.role||'Patient'},{label:'Health Score',val:score+'/100'},{label:'Device Status',val:'Connected'},{label:'Monitoring',val:'Active'}].map(f=><div key={f.label} className="p-4 bg-navy-700/50 rounded-xl border border-white/5"><p className="text-slate-400 text-xs mb-1">{f.label}</p><p className="text-white font-semibold text-sm">{f.val}</p></div>)}</div>
      </div>
      <div className="glass-card p-6"><h3 className="text-white font-bold mb-4">Health Preferences</h3><div className="space-y-3">{['Email Alerts','Emergency Notifications','Daily Health Report','Anomaly Detection'].map(p=><div key={p} className="flex items-center justify-between py-2 border-b border-white/5"><span className="text-slate-300 text-sm">{p}</span><div className="w-10 h-6 bg-teal-500 rounded-full flex items-center justify-end pr-1 cursor-pointer"><div className="w-4 h-4 bg-white rounded-full"/></div></div>)}</div></div>
    </div>
  )
}