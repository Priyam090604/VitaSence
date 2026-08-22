import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useVitalsStore } from '../store/vitalsStore'
import {
  Calendar, Clock, User, CheckCircle, AlertTriangle,
  Plus, X, ChevronRight, Stethoscope, Phone, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM',
]

const SPECIALIZATIONS = ['General Physician','Cardiologist','Pulmonologist','Neurologist','Endocrinologist']

export default function PatientDashboard() {
  const { user } = useAuthStore()
  const { current } = useVitalsStore()
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [showBooking, setShowBooking] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [bookingForm, setBookingForm] = useState({ date: '', time: '', reason: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('book')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [docRes, apptRes] = await Promise.all([
        axios.get('/api/appointments/doctors'),
        axios.get('/api/appointments/my'),
      ])
      setDoctors(docRes.data.doctors || [])
      setAppointments(apptRes.data.appointments || [])
    } catch {
      setDoctors(DEMO_DOCTORS)
      setAppointments(DEMO_MY_APPOINTMENTS)
    } finally { setLoading(false) }
  }

  const bookAppointment = async () => {
    if (!selectedDoctor || !bookingForm.date || !bookingForm.time) {
      toast.error('Please fill all fields')
      return
    }
    setSubmitting(true)
    try {
      await axios.post('/api/appointments/book', {
        doctorId: selectedDoctor._id || selectedDoctor.id,
        ...bookingForm,
        vitals: { heartRate: current.heartRate, spo2: current.spo2, temperature: current.temperature }
      })
      toast.success('Appointment booked! ✅')
      setShowBooking(false)
      setSelectedDoctor(null)
      setBookingForm({ date: '', time: '', reason: '' })
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  const statusColors = {
    pending:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    completed: 'bg-green-500/15 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  }

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    completed: Star,
    cancelled: X,
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">My Healthcare</h1>
          <p className="text-slate-400 text-sm">Book appointments & manage your health</p>
        </div>
        <button onClick={() => setShowBooking(true)}
          className="btn-glow flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
          <Plus size={16}/> Book Appointment
        </button>
      </div>

      {/* Health Summary */}
      <div className="glass-card p-5 mb-6 bg-gradient-to-r from-teal-900/20 to-blue-900/20 border-teal-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Your Current Health Status</p>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black ${current.healthScore >= 75 ? 'text-green-400' : current.healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {current.healthScore || 82}/100
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${current.healthScore >= 75 ? 'risk-low' : current.healthScore >= 50 ? 'risk-medium' : 'risk-high'}`}>
                {current.healthScore >= 75 ? 'Healthy' : current.healthScore >= 50 ? 'Monitor' : 'Needs Care'}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'HR', val: current.heartRate + ' BPM', color: '#ef4444' },
              { label: 'SpO₂', val: current.spo2 + '%', color: '#3b82f6' },
              { label: 'Temp', val: current.temperature + '°C', color: '#f59e0b' },
            ].map(v => (
              <div key={v.label} className="text-center">
                <div className="text-lg font-black" style={{ color: v.color, fontFamily: 'JetBrains Mono' }}>{v.val}</div>
                <div className="text-slate-500 text-xs">{v.label}</div>
              </div>
            ))}
          </div>
          {(current.spo2 < 95 || current.heartRate > 100) && (
            <Link to="/app/emergency" className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors">
              <AlertTriangle size={14}/> Emergency Help
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-navy-800 p-1 rounded-xl w-fit">
        {[{ id: 'book', label: 'Find Doctors' }, { id: 'appointments', label: 'My Appointments' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
            {t.id === 'appointments' && appointments.length > 0 && (
              <span className="ml-2 bg-teal-500/20 text-teal-400 text-xs px-1.5 py-0.5 rounded-full">{appointments.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Find Doctors */}
      {activeTab === 'book' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc, i) => (
            <div key={doc._id || i} className="glass-card p-5 hover:border-teal-500/30 transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                  👨‍⚕️
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold">Dr. {doc.name}</h3>
                  <p className="text-teal-400 text-xs">{doc.specialization || SPECIALIZATIONS[i % SPECIALIZATIONS.length]}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{doc.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}/>)}
                <span className="text-slate-400 text-xs">(4.{i+2}/5)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-1"><Clock size={11}/> Mon–Sat</div>
                <div className="flex items-center gap-1"><Calendar size={11}/> Available</div>
              </div>
              <button onClick={() => { setSelectedDoctor(doc); setShowBooking(true) }}
                className="w-full py-2.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-semibold hover:bg-teal-500/20 transition-colors flex items-center justify-center gap-2">
                <Calendar size={14}/> Book Appointment
              </button>
            </div>
          ))}
          {doctors.length === 0 && !loading && (
            <div className="col-span-3 glass-card p-10 text-center">
              <Stethoscope size={40} className="mx-auto text-slate-600 mb-3"/>
              <p className="text-slate-400">No doctors registered yet.</p>
              <p className="text-slate-500 text-xs mt-1">Doctors will appear here after signing up with the Doctor role.</p>
            </div>
          )}
        </div>
      )}

      {/* My Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Calendar size={40} className="mx-auto text-slate-600 mb-3"/>
              <p className="text-slate-400">No appointments yet.</p>
              <button onClick={() => setActiveTab('book')} className="mt-3 text-teal-400 text-sm hover:text-teal-300">
                Book your first appointment →
              </button>
            </div>
          ) : appointments.map((appt, i) => {
            const StatusIcon = statusIcons[appt.status] || Clock
            return (
              <div key={appt._id || i} className="glass-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
                  👨‍⚕️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold text-sm">Dr. {appt.doctorName || appt.doctorId?.name || 'Doctor'}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs border flex items-center gap-1 ${statusColors[appt.status]}`}>
                      <StatusIcon size={10}/>{appt.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{appt.reason || 'General Checkup'}</p>
                  <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs">
                    <span className="flex items-center gap-1"><Calendar size={10}/>{appt.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/>{appt.time}</span>
                  </div>
                </div>
                {appt.status === 'confirmed' && (
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-400 text-center">
                      ✓ Confirmed
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowBooking(false)}>
          <div className="glass-card w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-teal-500/10">
              <h2 className="text-white font-bold flex items-center gap-2"><Calendar size={18} className="text-teal-400"/> Book Appointment</h2>
              <button onClick={() => setShowBooking(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Doctor select */}
              {!selectedDoctor ? (
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Select Doctor</label>
                  <div className="space-y-2">
                    {doctors.map((doc, i) => (
                      <button key={doc._id || i} onClick={() => setSelectedDoctor(doc)}
                        className="w-full flex items-center gap-3 p-3 bg-navy-700 rounded-xl border border-white/5 hover:border-teal-500/30 transition-colors text-left">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">👨‍⚕️</div>
                        <div>
                          <p className="text-white text-sm font-medium">Dr. {doc.name}</p>
                          <p className="text-slate-400 text-xs">{doc.specialization || SPECIALIZATIONS[i % SPECIALIZATIONS.length]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">👨‍⚕️</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Dr. {selectedDoctor.name}</p>
                      <p className="text-teal-400 text-xs">{selectedDoctor.specialization || 'General Physician'}</p>
                    </div>
                    <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 hover:text-white"><X size={14}/></button>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Date</label>
                    <input type="date" value={bookingForm.date} min={new Date().toISOString().split('T')[0]}
                      onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full bg-navy-700 border border-teal-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"/>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map(t => (
                        <button key={t} onClick={() => setBookingForm(f => ({ ...f, time: t }))}
                          className={`py-2 rounded-lg text-xs font-medium border transition-all ${bookingForm.time === t ? 'bg-teal-500/20 border-teal-500/50 text-teal-400' : 'border-white/10 text-slate-400 hover:border-teal-500/30 hover:text-white'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Reason for Visit</label>
                    <input type="text" value={bookingForm.reason}
                      onChange={e => setBookingForm(f => ({ ...f, reason: e.target.value }))}
                      placeholder="e.g. Chest pain, Routine checkup..."
                      className="w-full bg-navy-700 border border-teal-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"/>
                  </div>
                  <button onClick={bookAppointment} disabled={submitting || !bookingForm.date || !bookingForm.time}
                    className="w-full btn-glow bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? 'Booking...' : <><CheckCircle size={16}/> Confirm Booking</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DEMO_DOCTORS = [
  { _id: '1', name: 'Arjun Mehta', email: 'dr.arjun@hospital.com', specialization: 'Cardiologist' },
  { _id: '2', name: 'Priya Sharma', email: 'dr.priya@hospital.com', specialization: 'General Physician' },
  { _id: '3', name: 'Rahul Verma', email: 'dr.rahul@hospital.com', specialization: 'Pulmonologist' },
]
const DEMO_MY_APPOINTMENTS = [
  { _id: '1', doctorName: 'Arjun Mehta', reason: 'Heart checkup', date: '2024-12-28', time: '10:30 AM', status: 'confirmed' },
  { _id: '2', doctorName: 'Priya Sharma', reason: 'General checkup', date: '2024-12-25', time: '11:00 AM', status: 'completed' },
]
