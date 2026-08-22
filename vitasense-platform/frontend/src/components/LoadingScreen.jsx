import React from 'react'
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-navy-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-teal-500 opacity-20 pulse-ring"/>
          <div className="absolute inset-2 rounded-full border-2 border-teal-400 opacity-40 pulse-ring" style={{animationDelay:'0.3s'}}/>
          <div className="absolute inset-4 rounded-full bg-teal-500 flex items-center justify-center text-2xl">❤️</div>
        </div>
        <h2 className="gradient-text text-2xl font-bold mb-2">VitaSense</h2>
        <p className="text-slate-400 text-sm">Initializing Health Intelligence...</p>
        <div className="mt-4 flex justify-center gap-1">
          {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-teal-500 rounded-full typing-dot" style={{animationDelay:i*0.2+'s'}}/>)}
        </div>
      </div>
    </div>
  )
}