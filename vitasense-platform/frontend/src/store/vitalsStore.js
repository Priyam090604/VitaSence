import { create } from 'zustand'
export const useVitalsStore = create((set,get) => ({
  current: { heartRate:75, spo2:98, temperature:37.1, movement:0.3, hrv:45, healthScore:82 },
  history: [], connected: false,
  setVitals: (v) => { const ts = new Date().toLocaleTimeString(); set(s=>({ current:{...s.current,...v}, history:[...s.history.slice(-60),{...v,ts}] })) },
  setConnected: (c) => set({ connected: c }),
  getLatest: () => get().current,
}))