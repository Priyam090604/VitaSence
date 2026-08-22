import React,{useState,useRef,useEffect} from 'react'
import {useVitalsStore} from '../store/vitalsStore'
import {useVoice} from '../hooks/useVoice'
import axios from 'axios'
import {Send,Mic,MicOff,Bot,User} from 'lucide-react'
const WELCOME={role:'assistant',content:"👋 Hi! I'm VitaBot, your AI health assistant.\n\nI can see your live vitals and help you understand your health. Ask me about symptoms, conditions, medications, or diet.\n\n⚠️ I provide general information only — always consult a doctor.",ts:new Date()}
const RULES={
  'heart rate':(v)=>v.heartRate>100?`Your heart rate is elevated at ${v.heartRate} BPM. Consider resting and monitoring. Not medical advice.`:`Your heart rate is ${v.heartRate} BPM — within the 60-100 BPM range.`,
  'spo2':(v)=>v.spo2<95?`⚠️ Your SpO₂ is ${v.spo2}%, below normal (95-100%). Seek medical attention if persistent. Not medical advice.`:`Your SpO₂ is ${v.spo2}% — excellent!`,
  'temperature':(v)=>v.temperature>37.5?`Your temperature is ${v.temperature}°C — slightly elevated. Stay hydrated. Not medical advice.`:`Your temperature ${v.temperature}°C is normal.`,
  'stress':()=>'Stress tips: 4-7-8 breathing, take short walks, limit caffeine, maintain sleep schedule. Not medical advice.',
}
export default function ChatPage(){
  const{current}=useVitalsStore()
  const[messages,setMessages]=useState([WELCOME])
  const[input,setInput]=useState('')
  const[loading,setLoading]=useState(false)
  const bottomRef=useRef(null)
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[messages])
  const{listening,start:startVoice,stop:stopVoice}=useVoice((text)=>setInput(text))
  const getFallback=(q)=>{const lower=q.toLowerCase();for(const[k,fn] of Object.entries(RULES)){if(lower.includes(k))return fn(current)}return `Based on your vitals (HR:${current.heartRate}, SpO₂:${current.spo2}%), your health looks ${current.spo2>=95&&current.heartRate<=100?'good':'to need monitoring'}. Consult a healthcare professional.\n\n⚠️ Not medical advice.`}
  const sendMessage=async(text=input)=>{
    const msg=(text||'').trim();if(!msg)return
    setInput('');setMessages(p=>[...p,{role:'user',content:msg,ts:new Date()}]);setLoading(true)
    try{
      const{data}=await axios.post('/api/chat',{message:msg,vitals:current,sessionId:'user123'})
      setMessages(p=>[...p,{role:'assistant',content:data.response,ts:new Date()}])
    }catch{setMessages(p=>[...p,{role:'assistant',content:getFallback(msg),ts:new Date()}])}
    finally{setLoading(false)}
  }
  const suggestions=['What does my heart rate mean?','Explain my SpO2 level','How can I reduce stress?','Is my temperature normal?']
  const fmt=(s)=>s.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')
  return(
    <div className="flex flex-col h-screen">
      <div className="px-6 pt-6 pb-4 border-b border-teal-500/10">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-lg">🤖</div><div><h1 className="text-xl font-black text-white">VitaBot — AI Health Assistant</h1><p className="text-slate-400 text-xs">Gemini AI powered · Live vitals connected</p></div></div>
        <div className="flex gap-2 mt-3 flex-wrap">{Object.entries({'❤️':current.heartRate+' BPM','💧':current.spo2+'%','🌡️':current.temperature+'°C','⚡':(current.healthScore||82)+'/100'}).map(([icon,val])=><span key={icon} className="glass-card px-3 py-1 text-xs text-teal-400">{icon} {val}</span>)}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m,i)=>(
          <div key={i} className={`flex gap-3 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${m.role==='user'?'bg-blue-600':'bg-gradient-to-br from-teal-500 to-purple-600'}`}>{m.role==='user'?<User size={14}/>:<Bot size={14}/>}</div>
            <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role==='user'?'bg-blue-600/20 border border-blue-500/30 text-white rounded-tr-sm':'glass-card rounded-tl-sm'}`} dangerouslySetInnerHTML={{__html:fmt(m.content)}}/>
          </div>
        ))}
        {loading&&<div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center"><Bot size={14}/></div><div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm"><div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-teal-400 rounded-full typing-dot" style={{animationDelay:i*0.2+'s'}}/>)}</div></div></div>}
        <div ref={bottomRef}/>
      </div>
      {messages.length===1&&<div className="px-6 pb-2 flex gap-2 flex-wrap">{suggestions.map(s=><button key={s} onClick={()=>sendMessage(s)} className="glass-card px-3 py-2 text-xs text-teal-400 hover:border-teal-500/50 transition-colors">{s}</button>)}</div>}
      <div className="px-6 py-4 border-t border-teal-500/10">
        <div className="flex gap-3">
          <button onClick={listening?stopVoice:startVoice} className={`p-3 rounded-xl border transition-all ${listening?'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse':'border-teal-500/20 text-teal-400 hover:bg-teal-500/10'}`}>{listening?<MicOff size={18}/>:<Mic size={18}/>}</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMessage()} className="flex-1 bg-navy-700 border border-teal-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500" placeholder={listening?'🎤 Listening...':'Ask about your health...'}/>
          <button onClick={()=>sendMessage()} disabled={!input.trim()||loading} className="p-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white disabled:opacity-50"><Send size={18}/></button>
        </div>
      </div>
    </div>
  )
}