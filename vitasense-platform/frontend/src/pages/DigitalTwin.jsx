import React,{useRef,Suspense} from 'react'
import {Canvas,useFrame} from '@react-three/fiber'
import {OrbitControls,Sphere,Cylinder} from '@react-three/drei'
import {useVitalsStore} from '../store/vitalsStore'
import {calcHealthScore} from '../utils/healthCalc'
function Heart({active}){const ref=useRef();useFrame(()=>{if(ref.current){const s=active?1+Math.sin(Date.now()*0.005)*0.08:1;ref.current.scale.set(s,s,s)}});return(<group ref={ref} position={[0,0.3,0.3]}><Sphere args={[0.18,16,16]}><meshStandardMaterial color={active?'#ef4444':'#991b1b'} emissive={active?'#ef4444':'#000'} emissiveIntensity={active?0.5:0}/></Sphere></group>)}
function Brain({stressed}){const ref=useRef();useFrame(()=>{if(ref.current&&stressed)ref.current.rotation.y+=0.005});return(<group ref={ref} position={[0,0.8,0]}><Sphere args={[0.22,16,16]}><meshStandardMaterial color={stressed?'#8b5cf6':'#4c1d95'} emissive={stressed?'#8b5cf6':'#000'} emissiveIntensity={stressed?0.4:0}/></Sphere></group>)}
function Body({hrHigh,stressed}){return(<group><Cylinder args={[0.3,0.28,1.0,16]} position={[0,0,0]}><meshStandardMaterial color="#1e3a5f" metalness={0.3} roughness={0.7}/></Cylinder><Sphere args={[0.28,16,16]} position={[0,0.85,0]}><meshStandardMaterial color="#1e3a5f"/></Sphere><Cylinder args={[0.12,0.10,0.9,12]} position={[-0.15,-0.95,0]}><meshStandardMaterial color="#1a2234"/></Cylinder><Cylinder args={[0.12,0.10,0.9,12]} position={[0.15,-0.95,0]}><meshStandardMaterial color="#1a2234"/></Cylinder><Cylinder args={[0.08,0.07,0.85,12]} position={[-0.42,0,0]} rotation={[0,0,Math.PI/8]}><meshStandardMaterial color="#1a2234"/></Cylinder><Cylinder args={[0.08,0.07,0.85,12]} position={[0.42,0,0]} rotation={[0,0,-Math.PI/8]}><meshStandardMaterial color="#1a2234"/></Cylinder><Heart active={hrHigh}/><Brain stressed={stressed}/></group>)}
export default function DigitalTwin(){
  const{current}=useVitalsStore()
  const hrHigh=current.heartRate>90;const stressed=(current.hrv||45)<40;const score=calcHealthScore(current)
  return(
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-black text-white">3D Digital Twin</h1><p className="text-slate-400 text-sm">Real-time body visualization · Drag to rotate</p></div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card" style={{height:500}}>
          <Canvas camera={{position:[0,0,4],fov:45}}>
            <ambientLight intensity={0.4}/><pointLight position={[5,5,5]} intensity={1} color="#2dd4bf"/><pointLight position={[-5,-5,-5]} intensity={0.3} color="#8b5cf6"/>
            <Suspense fallback={null}><Body hrHigh={hrHigh} stressed={stressed}/><OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5}/></Suspense>
          </Canvas>
        </div>
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-white font-bold mb-4">Active Alerts</h3>
            <div className="space-y-3">
              {[{label:'Heart',active:hrHigh,msg:hrHigh?'Elevated HR':'Normal',color:'#ef4444',icon:'❤️'},{label:'Brain',active:stressed,msg:stressed?'High stress':'Calm',color:'#8b5cf6',icon:'🧠'},{label:'Lungs',active:current.spo2<95,msg:current.spo2<95?'Low SpO₂':'Normal',color:'#3b82f6',icon:'🫁'},{label:'Temperature',active:current.temperature>37.5,msg:current.temperature>37.5?'Elevated':'Normal',color:'#f59e0b',icon:'🌡️'}].map(s=>(
                <div key={s.label} className="flex items-center justify-between p-3 rounded-xl border border-white/5" style={{background:s.active?s.color+'15':'rgba(255,255,255,0.02)'}}>
                  <div className="flex items-center gap-2"><span>{s.icon}</span><span className="text-sm text-white">{s.label}</span></div>
                  <span className="text-xs font-medium" style={{color:s.active?s.color:'#22c55e'}}>{s.active?'⚠️ ':'✓ '}{s.msg}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-white font-bold mb-3">Health Score</h3>
            <div className="text-5xl font-black mb-2" style={{color:score>=75?'#22c55e':score>=50?'#f59e0b':'#ef4444',fontFamily:'JetBrains Mono'}}>{score}<span className="text-2xl text-slate-400">/100</span></div>
            <div className="h-2 bg-navy-700 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:score+'%',background:score>=75?'#22c55e':score>=50?'#f59e0b':'#ef4444'}}/></div>
          </div>
        </div>
      </div>
    </div>
  )
}