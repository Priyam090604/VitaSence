import React from 'react'
import {MapContainer,TileLayer,Marker,Popup,Circle} from 'react-leaflet'
import {MapPin,Phone,Clock} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'})
const hospitals=[{name:'City General Hospital',lat:22.5726,lng:88.3639,phone:'+91-33-2222-3333',dist:'0.8 km',emergency:true},{name:'Metro Heart Institute',lat:22.5800,lng:88.3700,phone:'+91-33-2345-6789',dist:'1.2 km',emergency:true},{name:'Apollo Multispecialty',lat:22.5650,lng:88.3580,phone:'+91-33-2987-6543',dist:'2.1 km',emergency:true},{name:'Community Health Center',lat:22.5780,lng:88.3580,phone:'+91-33-2111-2222',dist:'2.8 km',emergency:false}]
export default function HospitalMap(){
  const center=[22.5726,88.3639]
  return(
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-black text-white">Nearby Hospitals</h1><p className="text-slate-400 text-sm">Emergency facilities within 5km radius</p></div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card overflow-hidden" style={{height:480}}>
          <MapContainer center={center} zoom={14} style={{height:'100%',width:'100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <Circle center={center} radius={5000} color="#14b8a6" fillOpacity={0.05}/>
            {hospitals.map(h=><Marker key={h.name} position={[h.lat,h.lng]}><Popup><div className="text-sm font-semibold">{h.name}</div><div className="text-xs text-gray-500">{h.dist}</div><a href={`tel:${h.phone}`} className="text-xs text-blue-600">{h.phone}</a></Popup></Marker>)}
          </MapContainer>
        </div>
        <div className="space-y-3">{hospitals.map(h=><div key={h.name} className="glass-card p-4"><div className="flex items-start justify-between mb-2"><div className="flex items-center gap-2"><MapPin size={14} className="text-teal-400 flex-shrink-0"/><span className="text-white text-sm font-semibold">{h.name}</span></div>{h.emergency&&<span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">Emergency</span>}</div><div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Clock size={11}/>{h.dist}</div><a href={`tel:${h.phone}`} className="flex items-center gap-2 text-teal-400 text-xs"><Phone size={11}/>{h.phone}</a></div>)}</div>
      </div>
    </div>
  )
}