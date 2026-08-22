import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useVitalsStore } from '../store/vitalsStore'
import { useSocket } from '../hooks/useSocket'
import {
  LayoutDashboard, Activity, Brain, BarChart3, AlertTriangle,
  MessageSquare, MapPin, User, LogOut, Cpu, Calendar,
  ChevronLeft, ChevronRight, Truck, Stethoscope
} from 'lucide-react'

export default function Layout() {
  useSocket()
  const { user, logout } = useAuthStore()
  const { connected, current } = useVitalsStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const isDoctor = user?.role === 'doctor'

  const navItems = [
    { to: '/app/dashboard',    icon: LayoutDashboard, label: 'Command Center' },
    { to: '/app/live',         icon: Activity,        label: 'Live Monitoring' },
    { to: '/app/predictions',  icon: Brain,           label: 'AI Predictions' },
    { to: '/app/analytics',    icon: BarChart3,       label: 'Analytics' },
    { to: '/app/digital-twin', icon: Cpu,             label: 'Digital Twin' },
    // Role-based
    ...(isDoctor
      ? [{ to: '/app/doctor', icon: Stethoscope, label: 'Doctor Dashboard', badge: 'New' }]
      : [
          { to: '/app/appointments', icon: Calendar,   label: 'Appointments', badge: 'New' },
          { to: '/app/ambulance',    icon: Truck,      label: '🚑 Ambulance',  badge: 'New' },
        ]
    ),
    { to: '/app/chat',         icon: MessageSquare,   label: 'AI Assistant' },
    { to: '/app/hospitals',    icon: MapPin,          label: 'Hospitals' },
    { to: '/app/emergency',    icon: AlertTriangle,   label: 'Emergency' },
    { to: '/app/profile',      icon: User,            label: 'Profile' },
  ]

  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 bg-navy-800 border-r border-teal-500/10 flex flex-col transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-teal-500/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-lg">❤️</div>
          {!collapsed && <div>
            <div className="font-bold text-white text-sm">VitaSense</div>
            <div className="text-teal-400 text-xs capitalize">{user?.role || 'user'} Portal</div>
          </div>}
        </div>

        {/* Device status */}
        {!collapsed && (
          <div className="mx-3 mt-3 p-2 rounded-lg bg-navy-700 border border-teal-500/10">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}/>
              <span className={connected ? 'text-green-400' : 'text-red-400'}>
                {connected ? 'Device Online' : 'No Device'}
              </span>
            </div>
            {connected && (
              <div className="flex gap-3 mt-1 text-xs text-slate-400">
                <span>❤️ {current.heartRate}</span>
                <span>💧 {current.spo2}%</span>
              </div>
            )}
          </div>
        )}

        {/* Role badge */}
        {!collapsed && (
          <div className="mx-3 mt-2">
            <div className={`text-center py-1 rounded-lg text-xs font-bold ${isDoctor ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
              {isDoctor ? '👨‍⚕️ Doctor View' : '👤 Patient View'}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative ${
                  isActive ? 'nav-active' : 'text-slate-400 hover:text-white hover:bg-navy-700'
                }`}>
              <Icon size={18} className="flex-shrink-0"/>
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {badge && <span className="text-xs bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full">{badge}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-teal-500/10">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role || 'patient'}</div>
              </div>
            </div>
          )}
          <button onClick={() => { logout(); navigate('/') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut size={16}/>
            {!collapsed && 'Sign Out'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-navy-900 shadow-lg hover:bg-teal-400 transition-colors">
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-navy-900">
        <Outlet />
      </main>
    </div>
  )
}