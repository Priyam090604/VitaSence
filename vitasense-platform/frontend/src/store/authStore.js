import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
export const useAuthStore = create(persist(
  (set, get) => ({
    token: null, user: null,
    login: async (email, password) => {
      const { data } = await axios.post('/api/auth/login', { email, password })
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
      set({ token: data.token, user: data.user })
      return data
    },
    signup: async (payload) => {
      const { data } = await axios.post('/api/auth/signup', payload)
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
      set({ token: data.token, user: data.user })
      return data
    },
    logout: () => { delete axios.defaults.headers.common['Authorization']; set({ token: null, user: null }) },
    init: () => { const t = get().token; if (t) axios.defaults.headers.common['Authorization'] = 'Bearer ' + t }
  }),
  { name: 'vitasense-auth' }
))