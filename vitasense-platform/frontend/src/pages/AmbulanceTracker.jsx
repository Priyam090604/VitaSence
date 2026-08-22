import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import axios from 'axios'
import { useVitalsStore } from '../store/vitalsStore'
import { useAuthStore } from '../store/authStore'
import { AlertTriangle, Phone, MapPin, Clock, CheckCircle, Navigation, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ambulanceIcon = L.divIcon({
  html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚑</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16]
})
const patientIcon = L.divIcon({
  html: '<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">📍</div>',
  className: '', iconSize: [28, 28], iconAnchor: [14, 28]
})

function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.setView(center, map.getZoom()) }, [center])
  return null
}

const STATUS_STEPS = [
  { key: 'requested', label: 'Request Sent', icon: '📞', done: true },
  { key: 'dispatched', label: 'Ambulance Dispatched', icon: '🚨', done: false },
  { key: 'en_route', label: 'En Route to You', icon: '🚑', done: false },
  { key: 'arrived', label: 'Arrived', icon: '✅', done: false },
]

export default function AmbulanceTracker() {
  const { current } = useVitalsStore()
  const { user } = useAuthStore()
  const [stage, setStage] = useState('idle')       // idle | requesting | tracking
  const [ambulanceData, setAmbulanceData] = useState(null)
  const [userLocation, setUserLocation] = useState({ lat: 22.5726, lng: 88.3639 })
  const [loading, setLoading] = useState(false)
  const [locationName, setLocationName] = useState('Detecting your location...')
  const trackInterval = useRef(null)

  // Get user geolocation
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationName('Your current location')
      },
      () => setLocationName('Durgapur, West Bengal (default)')
    )
  }, [])

  const requestAmbulance = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/ambulance/request', {
        location: { lat: userLocation.lat, lng: userLocation.lng, address: locationName },
        vitals: { heartRate: current.heartRate, spo2: current.spo2, temperature: current.temperature },
        hospitalName: 'City General Hospital'
      })
      setAmbulanceData(data.ambulance)
      setStage('tracking')
      toast.success('🚑 Ambulance dispatched!')
      startTracking(data.ambulance._id)
    } catch {
      // Demo mode
      const demo = {
        _id: 'demo123',
        ambulanceId: 'AMB-' + Math.floor(Math.random()*900+100),
        driverName: 'Rajesh Kumar',
        driverPhone: '+91-98765-43210',
        estimatedArrival: 8,
        status: 'dispatched',
        progress: 0,
        patientLocation: { lat: userLocation.lat, lng: userLocation.lng },
        ambulanceLocation: { lat: userLocation.lat + 0.018, lng: userLocation.lng + 0.012 },
        hospitalName: 'City General Hospital'
      }
      setAmbulanceData(demo)
      setStage('tracking')
      toast.success('🚑 Ambulance dispatched! (Demo mode)')
      startDemoTracking()
    } finally { setLoading(false) }
  }

  const startTracking = (id) => {
    trackInterval.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/ambulance/track/${id}`)
        setAmbulanceData(data.ambulance)
        if (data.ambulance.status === 'arrived') {
          clearInterval(trackInterval.current)
          toast.success('🎉 Ambulance has arrived!')
        }
      } catch { /* ignore */ }
    }, 3000)
  }

  let demoProgress = 0
  const startDemoTracking = () => {
    trackInterval.current = setInterval(() => {
      demoProgress += 5
      const prog = Math.min(100, demoProgress)
      const status = prog >= 95 ? 'arrived' : prog >= 30 ? 'en_route' : 'dispatched'
      const remaining = Math.max(0, Math.ceil(8 - (prog / 100) * 8))
      setAmbulanceData(prev => ({
        ...prev,
        progress: prog,
        status,
        estimatedArrival: remaining,
        ambulanceLocation: {
          lat: prev.ambulanceLocation.lat - (0.018 / 20),
          lng: prev.ambulanceLocation.lng - (0.012 / 20),
        }
      }))
      if (prog >= 100) {
        clearInterval(trackInterval.current)
        toast.success('🎉 Ambulance has arrived!')
      }
    }, 1500)
  }

  useEffect(() => () => clearInterval(trackInterval.current), [])

  const cancelRequest = () => {
    clearInterval(trackInterval.current)
    setStage('idle')
    setAmbulanceData(null)
    toast('Request cancelled', { icon: '❌' })
  }

  const currentStatus = ambulanceData?.status || 'requested'
  const stepsDone = { requested: 1, dispatched: 2, en_route: 3, arrived: 4 }[currentStatus] || 1

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="text-3xl">🚑</span> Ambulance Tracker
          </h1>
          <p className="text-slate-400 text-sm">Emergency dispatch with real-time GPS tracking</p>
        </div>
        <a href="tel:112" className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-500/30 transition-colors">
          <Phone size={15}/> Call 112
        </a>
      </div>

      {/* Vitals Warning */}
      {(current.spo2 < 95 || current.heartRate > 100) && (
        <div className="glass-card p-4 mb-6 border-red-500/30 emergency-flash">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400 animate-pulse flex-shrink-0" size={20}/>
            <div>
              <p className="text-red-300 font-bold text-sm">⚠️ Abnormal vitals detected</p>
              <p className="text-red-400 text-xs">
                {current.spo2 < 95 && `SpO₂ low: ${current.spo2}% · `}
                {current.heartRate > 100 && `HR elevated: ${current.heartRate} BPM`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          {stage === 'idle' && (
            <div className="glass-card p-6 text-center">
              <div className="text-6xl mb-4">🚑</div>
              <h3 className="text-white font-bold text-lg mb-2">Request Emergency Ambulance</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                An ambulance will be dispatched to your location immediately with real-time GPS tracking.
              </p>
              <div className="p-3 bg-navy-700/50 rounded-xl border border-white/5 mb-4 text-left">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><MapPin size={11}/> Your Location</p>
                <p className="text-white text-sm">{locationName}</p>
                <p className="text-slate-500 text-xs mt-0.5">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
              </div>
              <button onClick={requestAmbulance} disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-red-900/30">
                {loading ? '📡 Dispatching...' : '🆘 Request Ambulance'}
              </button>
              <p className="text-slate-500 text-xs mt-3">Emergency services will be notified automatically</p>
            </div>
          )}

          {stage === 'tracking' && ambulanceData && (
            <>
              {/* Status Steps */}
              <div className="glass-card p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Navigation size={16} className="text-teal-400"/> Ambulance Status</h3>
                <div className="space-y-3">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i < stepsDone
                    const active = i === stepsDone - 1
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${done ? 'bg-teal-500/20 border-2 border-teal-500' : 'bg-navy-700 border border-white/10'} ${active ? 'shadow-lg shadow-teal-500/30' : ''}`}>
                          {done ? <CheckCircle size={14} className="text-teal-400"/> : <span className="text-slate-500 text-xs">{i+1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${done ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                          {active && ambulanceData.estimatedArrival > 0 && (
                            <p className="text-teal-400 text-xs">~{ambulanceData.estimatedArrival} min away</p>
                          )}
                        </div>
                        <span className={done ? 'opacity-100' : 'opacity-30'}>{step.icon}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>En route</span>
                    <span>{ambulanceData.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-teal-500 rounded-full transition-all duration-1000"
                      style={{ width: (ambulanceData.progress || 0) + '%' }}/>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="glass-card p-5">
                <h3 className="text-white font-bold mb-3 text-sm">Driver Details</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-xl">👨</div>
                  <div>
                    <p className="text-white font-semibold">{ambulanceData.driverName}</p>
                    <p className="text-slate-400 text-xs">{ambulanceData.ambulanceId}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone</span>
                    <a href={`tel:${ambulanceData.driverPhone}`} className="text-teal-400 hover:text-teal-300">{ambulanceData.driverPhone}</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hospital</span>
                    <span className="text-white text-xs">{ambulanceData.hospitalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ETA</span>
                    <span className={`font-bold ${ambulanceData.estimatedArrival <= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {ambulanceData.estimatedArrival === 0 ? 'Arrived! 🎉' : ambulanceData.estimatedArrival + ' minutes'}
                    </span>
                  </div>
                </div>
                {ambulanceData.status !== 'arrived' && (
                  <button onClick={cancelRequest} className="w-full mt-4 py-2 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-colors">
                    Cancel Request
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 glass-card overflow-hidden" style={{ height: 520 }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <MapRecenter center={ambulanceData ? [ambulanceData.ambulanceLocation?.lat, ambulanceData.ambulanceLocation?.lng] : null}/>

            {/* Patient marker */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={patientIcon}>
              <Popup><strong>📍 Your Location</strong><br/>{locationName}</Popup>
            </Marker>

            {/* Ambulance marker */}
            {ambulanceData?.ambulanceLocation && (
              <Marker position={[ambulanceData.ambulanceLocation.lat, ambulanceData.ambulanceLocation.lng]} icon={ambulanceIcon}>
                <Popup>
                  <strong>🚑 {ambulanceData.ambulanceId}</strong><br/>
                  Driver: {ambulanceData.driverName}<br/>
                  ETA: {ambulanceData.estimatedArrival} min
                </Popup>
              </Marker>
            )}

            {/* Route line */}
            {ambulanceData?.ambulanceLocation && (
              <Polyline
                positions={[
                  [ambulanceData.ambulanceLocation.lat, ambulanceData.ambulanceLocation.lng],
                  [userLocation.lat, userLocation.lng]
                ]}
                color="#ef4444" weight={3} dashArray="8 6" opacity={0.8}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}