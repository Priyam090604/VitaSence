import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

const LandingPage    = lazy(() => import('./pages/LandingPage'))
const LoginPage      = lazy(() => import('./pages/LoginPage'))
const SignupPage     = lazy(() => import('./pages/SignupPage'))
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const LiveMonitoring = lazy(() => import('./pages/LiveMonitoring'))
const Predictions    = lazy(() => import('./pages/Predictions'))
const Analytics      = lazy(() => import('./pages/Analytics'))
const Emergency      = lazy(() => import('./pages/Emergency'))
const ChatPage       = lazy(() => import('./pages/ChatPage'))
const Profile        = lazy(() => import('./pages/Profile'))
const HospitalMap    = lazy(() => import('./pages/HospitalMap'))
const DigitalTwin    = lazy(() => import('./pages/DigitalTwin'))
// NEW PAGES
const DoctorDashboard  = lazy(() => import('./pages/DoctorDashboard'))
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'))
const AmbulanceTracker = lazy(() => import('./pages/AmbulanceTracker'))

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={hasError:false,error:null}}
  static getDerivedStateFromError(e){return{hasError:true,error:e}}
  render(){
    if(this.state.hasError)return(
      <div style={{minHeight:'100vh',background:'#0a0e1a',color:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px',textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:'12px'}}>⚠️</div>
        <h2 style={{color:'#ef4444',marginBottom:'8px'}}>App Error — Open F12 to see details</h2>
        <pre style={{background:'#1a2234',padding:'12px',borderRadius:'8px',color:'#fca5a5',fontSize:'11px',maxWidth:'560px',overflow:'auto',textAlign:'left'}}>{String(this.state.error)}</pre>
        <button onClick={()=>window.location.reload()} style={{marginTop:'16px',background:'#14b8a6',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer'}}>🔄 Reload</button>
      </div>
    )
    return this.props.children
  }
}
export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#0d1224', color: '#e2e8f0', border: '1px solid rgba(45,212,191,0.2)' }
      }}/>
      <ErrorBoundary><Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/"        element={<LandingPage />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/signup"  element={<SignupPage />} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="live"         element={<LiveMonitoring />} />
            <Route path="predictions"  element={<Predictions />} />
            <Route path="analytics"    element={<Analytics />} />
            <Route path="digital-twin" element={<DigitalTwin />} />
            <Route path="chat"         element={<ChatPage />} />
            <Route path="hospitals"    element={<HospitalMap />} />
            <Route path="emergency"    element={<Emergency />} />
            <Route path="profile"      element={<Profile />} />
            {/* NEW ROUTES */}
            <Route path="doctor"       element={<DoctorDashboard />} />
            <Route path="appointments" element={<PatientDashboard />} />
            <Route path="ambulance"    element={<AmbulanceTracker />} />
          </Route>
        </Routes>
      </Suspense></ErrorBoundary>
    </>
  )
}