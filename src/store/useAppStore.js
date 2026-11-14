import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_PASSWORD } from '../data/demoData'
import { useDataStore } from './useDataStore'

const defaultSettings = {
  storeName: 'SmartPOS Market',
  logo: '🛍️',
  logoImage: '',
  address: '#12, Street 271, Toul Kork, Phnom Penh, Cambodia',
  phone: '+855 23 456 789',
  email: 'hello@smartpos.com',
  website: 'www.smartpos.com',
  currency: 'USD',
  taxRate: 5,
  receiptFooter: 'Thank you for shopping with us!',
  receiptNote: 'Please keep this receipt for returns within 7 days.',
  showLogo: true,
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function applyLanguage(language) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      session: null,
      theme: 'light',
      language: 'en',
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      settings: defaultSettings,

      login: (email, password, remember = true) => {
        const users = useDataStore.getState().users
        const user = users.find(
          (item) => item.email.toLowerCase() === String(email).trim().toLowerCase(),
        )
        if (!user) {
          const error = new Error('invalid_credentials')
          error.code = 'invalid_credentials'
          throw error
        }
        if (user.status !== 'active') {
          const error = new Error('inactive_account')
          error.code = 'inactive_account'
          throw error
        }
        if (password !== (user.password || DEMO_PASSWORD)) {
          const error = new Error('invalid_credentials')
          error.code = 'invalid_credentials'
          throw error
        }
        const session = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          remember,
        }
        set({ session, mobileSidebarOpen: false })
        return session
      },

      logout: () => set({ session: null, mobileSidebarOpen: false }),

      updateProfile: (patch) => {
        const session = get().session
        if (!session) return
        useDataStore.getState().updateUser(session.id, patch)
        set({ session: { ...session, ...patch } })
      },

      changePassword: (currentPassword, nextPassword) => {
        const session = get().session
        if (!session) {
          const error = new Error('not_authenticated')
          error.code = 'not_authenticated'
          throw error
        }
        const user = useDataStore.getState().users.find((item) => item.id === session.id)
        if (!user) {
          const error = new Error('not_authenticated')
          error.code = 'not_authenticated'
          throw error
        }
        if (currentPassword !== (user.password || DEMO_PASSWORD)) {
          const error = new Error('invalid_password')
          error.code = 'invalid_password'
          throw error
        }
        useDataStore.getState().updateUser(session.id, { password: nextPassword })
      },

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme: () => {
        const theme = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(theme)
        set({ theme })
      },
      setLanguage: (language) => {
        applyLanguage(language)
        set({ language })
      },
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'smartpos.app.v1',
      version: 1,
      partialize: (state) => ({
        session: state.session,
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        applyTheme(state.theme)
        applyLanguage(state.language)
      },
    },
  ),
)
