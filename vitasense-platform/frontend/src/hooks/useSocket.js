import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useVitalsStore } from '../store/vitalsStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
export function useSocket() {
  const socketRef = useRef(null)
  const { setVitals, setConnected } = useVitalsStore()
  const { user } = useAuthStore()
  useEffect(() => {
    socketRef.current = io('/', { transports: ['websocket','polling'] })
    const s = socketRef.current
    s.on('connect', () => { setConnected(true); toast.success('Device Connected', { icon:'🔌' }) })
    s.on('disconnect', () => { setConnected(false) })
    s.on('connect_error', () => { setConnected(false) })
    s.on('vitals', (data) => setVitals(data))
    s.on('emergency', (data) => toast.error('🚨 EMERGENCY: ' + data.message, { duration:8000 }))
    s.on('new_appointment', (data) => toast.success('📅 ' + data.message, { duration:5000 }))
    if (user?.role === 'doctor' && user?.id) s.emit('join_doctor_room', user.id)
    return () => s.disconnect()
  }, [])
  return socketRef.current
}