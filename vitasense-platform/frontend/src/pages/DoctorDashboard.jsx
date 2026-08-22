import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useVitalsStore } from '../store/vitalsStore'
import {
  Users, Calendar, CheckCircle, Clock, AlertTriangle,
  Activity, FileText, ChevronRight, X, Eye, Stethoscope,
  TrendingUp, Heart, Thermometer, Droplets, Send
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ totalAppts: 0, pendingAppts: 0, completedAppts: 0, totalPatients: 0 })
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [reportForm, setReportForm] = useState({ diagnosis: '', prescription: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 30000)
    return () => clearInterval(t)
  }, [])

  const fetchAll = async () => {
    try {
      const [statsRes, apptsRes, patientsRes] = await Promise.all([
        axios.get('/api/doctor/stats'),
        axios.get('/api/appointments/doctor'),
        axios.get('/api/doctor/patients'),
      ])
      setStats(statsRes.data)
      setAppointments(apptsRes.data.appointments || [])
      setPatients(patientsRes.data.patients || [])
    } catch (e) {
      // Demo data when backend not running
      setStats({ totalAppts: 12, pendingAppts: 3, completedAppts: 8, totalPatients: 5 })
      setAppointments(DEMO_APPOINTMENTS)
      setPatients(DEMO_PATIENTS)
    } finally { setLoading(false) }
  }

  const fetchPatientData = async (patientId) => {
    try {
      const { data } = await axios.get(`/api/doctor/patient/${patientId}`)
      setPatientData(data)
    } catch {
      setPatientData({
        patient: { name: 'Demo Patient', email: 'patient@demo.com', age: 35 },
        vitals: DEMO_VITALS,
        appointments: DEMO_APPOINTMENTS.slice(0, 3),
        reports: []
      })
    }
  }

  const openPatient = (patient) => {
    setSelectedPatient(patient)
    fetchPatientData(patient._id || patient.id)
    setActiveTab('vitals')
  }

  const updateAppointment = async (id, updates) => {
    try {
      await axios.patch(`/api/appointments/${id}`, updates)
      toast.success('Appointment updated')
      fetchAll()
    } catch { toast.error('Update failed') }
  }

  const submitReport = async () => {
    if (!selectedPatient || !reportForm.diagnosis) return
    setSubmitting(true)
    try {
      await axios.post('/api/doctor/report', {
        patientId: selectedPatient._id || selectedPatient.id,
        ...reportForm,
        vitals: patientData?.vitals?.[0] || {}
      })
      toast.success('Report saved!')
      setReportForm({ diagnosis: '', prescription: '', notes: '' })
      fetchPatientData(selectedPatient._id || selectedPatient.id)
    } catch { toast.error('Failed to save report') } finally { setSubmitting(false) }
  }

  const statusColors = {
    pending:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    completed: 'bg-green-500/15 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-slate-400 text-sm">Loading doctor dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-full">
      {/* Main Panel */}
      <div className={`flex-1 overflow-y-auto transition-all ${selectedPatient ? 'mr-0' : ''}`}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-teal-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">👨‍⚕️</div>
              <div>
                <h1 className="text-2xl font-black text-white">Dr. {user?.name}</h1>
                <p className="text-slate-400 text-sm">Medical Command Center · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-green-400 text-xs font-medium">On Duty</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Patients', val: stats.totalPatients, icon: Users, color: '#3b82f6', bg: 'from-blue-900/20' },
              { label: 'Total Appointments', val: stats.totalAppts, icon: Calendar, color: '#8b5cf6', bg: 'from-purple-900/20' },
              { label: 'Pending', val: stats.pendingAppts, icon: Clock, color: '#f59e0b', bg: 'from-amber-900/20' },
              { label: 'Completed', val: stats.completedAppts, icon: CheckCircle, color: '#22c55e', bg: 'from-green-900/20' },
            ].map(s => (
              <div key={s.label} className={`glass-card p-5 bg-gradient-to-br ${s.bg} to-transparent`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">{s.label}</span>
                  <s.icon size={18} style={{ color: s.color }}/>
                </div>
                <div className="text-3xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace', textShadow: `0 0 20px ${s.color}50` }}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          {/* Appointments Table */}
          <div className="glass-card">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-bold flex items-center gap-2"><Calendar size={18} className="text-teal-400"/> Appointments</h2>
              <span className="text-slate-400 text-sm">{appointments.length} total</span>
            </div>
            <div className="divide-y divide-white/5">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No appointments yet</div>
              ) : appointments.map((appt, i) => (
                <div key={appt._id || i} className="flex items-center justify-between p-4 hover:bg-white/2 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(appt.patientName || appt.patientId?.name || 'P')?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{appt.patientName || appt.patientId?.name || 'Patient'}</p>
                      <p className="text-slate-400 text-xs">{appt.reason || 'General Checkup'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-white text-sm">{appt.date}</p>
                      <p className="text-slate-400 text-xs">{appt.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[appt.status]}`}>
                      {appt.status}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {appt.status === 'pending' && (
                        <button onClick={() => updateAppointment(appt._id, { status: 'confirmed' })}
                          className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors text-xs">
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button onClick={() => updateAppointment(appt._id, { status: 'completed' })}
                          className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs">
                          Complete
                        </button>
                      )}
                    </div>
                    <button onClick={() => {
                      const patient = appt.patientId || { _id: appt.patientId, name: appt.patientName }
                      openPatient(patient)
                    }} className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 opacity-0 group-hover:opacity-100 transition-all">
                      <Eye size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient List */}
          <div className="glass-card">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-teal-400"/> My Patients</h2>
              <span className="text-slate-400 text-sm">{patients.length} registered</span>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-3">
              {patients.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-slate-500">No patients yet. Patients will appear after booking appointments.</div>
              ) : patients.map((p, i) => (
                <button key={p._id || i} onClick={() => openPatient(p)}
                  className="flex items-center gap-3 p-4 bg-navy-700/50 rounded-xl border border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all text-left group">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {p.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{p.name}</p>
                    <p className="text-slate-400 text-xs truncate">{p.email}</p>
                    {p.age && <p className="text-slate-500 text-xs">Age: {p.age}</p>}
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-teal-400 transition-colors flex-shrink-0"/>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Side Panel */}
      {selectedPatient && (
        <div className="w-full md:w-96 border-l border-teal-500/10 bg-navy-800 flex flex-col overflow-hidden animate-slide-up">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-teal-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold">
                {selectedPatient.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{selectedPatient.name}</p>
                <p className="text-slate-400 text-xs">{selectedPatient.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X size={18}/>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-teal-500/10">
            {[
              { id: 'vitals', label: 'Vitals', icon: Activity },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'write', label: 'Write Rx', icon: Stethoscope },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all ${
                  activeTab === t.id ? 'text-teal-400 border-b-2 border-teal-400 bg-teal-500/5' : 'text-slate-400 hover:text-white'
                }`}>
                <t.icon size={13}/>{t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* VITALS TAB */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                {/* Latest vitals cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Heart Rate', val: patientData?.vitals?.[0]?.heartRate || 75, unit: 'BPM', icon: Heart, color: '#ef4444' },
                    { label: 'SpO₂', val: patientData?.vitals?.[0]?.spo2 || 98, unit: '%', icon: Droplets, color: '#3b82f6' },
                    { label: 'Temperature', val: patientData?.vitals?.[0]?.temperature || 37.1, unit: '°C', icon: Thermometer, color: '#f59e0b' },
                    { label: 'Health Score', val: patientData?.vitals?.[0]?.healthScore || 82, unit: '/100', icon: TrendingUp, color: '#22c55e' },
                  ].map(v => (
                    <div key={v.label} className="bg-navy-700/50 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <v.icon size={12} style={{ color: v.color }}/>
                        <span className="text-slate-400 text-xs">{v.label}</span>
                      </div>
                      <div className="text-xl font-black" style={{ color: v.color, fontFamily: 'JetBrains Mono' }}>{v.val}<span className="text-xs text-slate-400 ml-1">{v.unit}</span></div>
                    </div>
                  ))}
                </div>

                {/* Vitals history chart */}
                {patientData?.vitals?.length > 1 && (
                  <div className="bg-navy-700/30 rounded-xl p-3 border border-white/5">
                    <p className="text-slate-400 text-xs mb-3">Heart Rate History</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={patientData.vitals.slice(-20).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                        <XAxis dataKey="ts" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ background: '#0d1224', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 8, fontSize: 10 }}/>
                        <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} name="HR"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Risk Assessment */}
                <div className="bg-navy-700/30 rounded-xl p-3 border border-white/5">
                  <p className="text-slate-400 text-xs mb-3 flex items-center gap-1"><AlertTriangle size={11}/> Risk Assessment</p>
                  {[
                    { label: 'Cardiac Risk', val: patientData?.vitals?.[0]?.heartRate > 100 ? 'High' : 'Low' },
                    { label: 'SpO₂ Status', val: (patientData?.vitals?.[0]?.spo2 || 98) < 95 ? 'Warning' : 'Normal' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-slate-300 text-xs">{r.label}</span>
                      <span className={`text-xs font-bold ${r.val === 'High' || r.val === 'Warning' ? 'text-red-400' : 'text-green-400'}`}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                {!patientData?.reports?.length ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    <FileText size={32} className="mx-auto mb-2 opacity-30"/>
                    No reports yet. Write the first one →
                  </div>
                ) : patientData.reports.map((r, i) => (
                  <div key={i} className="bg-navy-700/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-teal-400 text-xs font-semibold">Report #{i+1}</span>
                      <span className="text-slate-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.diagnosis && <p className="text-white text-sm mb-1"><span className="text-slate-400">Diagnosis: </span>{r.diagnosis}</p>}
                    {r.prescription && <p className="text-white text-sm mb-1"><span className="text-slate-400">Rx: </span>{r.prescription}</p>}
                    {r.notes && <p className="text-slate-400 text-xs mt-2">{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* WRITE RX TAB */}
            {activeTab === 'write' && (
              <div className="space-y-4">
                <p className="text-slate-400 text-xs">Write a prescription / report for {selectedPatient.name}</p>
                {[
                  { key: 'diagnosis', label: 'Diagnosis', ph: 'e.g. Hypertension, Grade 1' },
                  { key: 'prescription', label: 'Prescription / Rx', ph: 'e.g. Amlodipine 5mg OD × 30 days' },
                  { key: 'notes', label: 'Additional Notes', ph: 'Clinical observations, follow-up plan...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-slate-400 text-xs mb-1.5 block">{f.label}</label>
                    <textarea
                      value={reportForm[f.key]}
                      onChange={e => setReportForm(p => ({ ...p, [f.key]: e.target.value }))}
                      rows={f.key === 'notes' ? 4 : 2}
                      placeholder={f.ph}
                      className="w-full bg-navy-700 border border-teal-500/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>
                ))}
                <button onClick={submitReport} disabled={submitting || !reportForm.diagnosis}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-all">
                  {submitting ? 'Saving...' : <><Send size={15}/> Save Report</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Demo data when backend offline ──
const DEMO_APPOINTMENTS = [
  { _id: '1', patientName: 'Rahul Sharma', reason: 'Chest pain checkup', date: '2024-12-28', time: '10:30 AM', status: 'pending' },
  { _id: '2', patientName: 'Priya Patel', reason: 'Hypertension follow-up', date: '2024-12-28', time: '11:00 AM', status: 'confirmed' },
  { _id: '3', patientName: 'Amit Kumar', reason: 'Diabetes monitoring', date: '2024-12-27', time: '09:00 AM', status: 'completed' },
  { _id: '4', patientName: 'Sneha Gupta', reason: 'General checkup', date: '2024-12-26', time: '03:00 PM', status: 'completed' },
]
const DEMO_PATIENTS = [
  { _id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', age: 42 },
  { _id: '2', name: 'Priya Patel', email: 'priya@example.com', age: 35 },
  { _id: '3', name: 'Amit Kumar', email: 'amit@example.com', age: 58 },
]
const DEMO_VITALS = [
  { heartRate: 88, spo2: 97, temperature: 37.2, healthScore: 78, ts: '10:00' },
  { heartRate: 92, spo2: 96, temperature: 37.3, healthScore: 74, ts: '10:30' },
  { heartRate: 85, spo2: 98, temperature: 37.1, healthScore: 81, ts: '11:00' },
]
