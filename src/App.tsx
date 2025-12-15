import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import FlowBuilder from './pages/FlowBuilder'
import Conversations from './pages/Conversations'
import Bots from './pages/Bots'
import Profile from './pages/Profile'
import AppSidebar from './components/AppSidebar'

export default function App() {
  const ROUTE_KEY = 'app_route'
  const initialAuthed = !!localStorage.getItem('auth_token')
  const stored = (localStorage.getItem(ROUTE_KEY) || '') as
    | 'login'
    | 'signup'
    | 'dashboard'
    | 'flow'
    | 'conversations'
    | 'bots'
    | 'profile'

  const isProtected = (r: string) => r !== 'login' && r !== 'signup'
  const initialRoute:
    | 'login'
    | 'signup'
    | 'dashboard'
    | 'flow'
    | 'conversations'
    | 'bots'
    | 'profile' = initialAuthed ? (stored && isProtected(stored) ? stored : 'dashboard') : 'login'

  const [route, setRoute] = useState<
    'login' | 'signup' | 'dashboard' | 'flow' | 'conversations' | 'bots' | 'profile'
  >(initialRoute)

  const [authed, setAuthed] = useState<boolean>(initialAuthed)

  const setRoutePersist = (r: 'login' | 'signup' | 'dashboard' | 'flow' | 'conversations' | 'bots' | 'profile') => {
    setRoute(r)
    localStorage.setItem(ROUTE_KEY, r)
  }

  const goto = (r: 'login' | 'signup' | 'dashboard' | 'flow' | 'conversations' | 'bots') => () => setRoutePersist(r)
  const gotoProtected = (r: 'dashboard' | 'flow' | 'conversations' | 'bots' | 'profile') => () =>
    setRoutePersist(authed ? r : 'login')

  const isAuthRoute = route === 'login' || route === 'signup'
  const [alerts, setAlerts] = useState<Array<{ id: string; title: string; detail?: string }>>([])

  // sincroniza quando token é removido/adicionado em outras abas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token') setAuthed(!!localStorage.getItem('auth_token'))
      if (e.key === ROUTE_KEY) {
        const v = e.newValue as any
        if (v) setRoute(v)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!authed && !isAuthRoute) setRoutePersist('login')
  }, [authed, isAuthRoute])

  useEffect(() => {
    const handler = (ev: any) => {
      const r = ev?.detail?.route as
        | 'login'
        | 'signup'
        | 'dashboard'
        | 'flow'
        | 'conversations'
        | 'bots'
        | 'profile'
        | undefined
      if (r) setRoutePersist(r)
    }
    window.addEventListener('app:navigate', handler as any)
    return () => window.removeEventListener('app:navigate', handler as any)
  }, [])

  useEffect(() => {
    const handler = (ev: any) => {
      const d = ev?.detail || {}
      const id = `${Date.now()}-${Math.random()}`
      setAlerts((prev) => [{ id, title: d.title || 'Erro', detail: typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail || {}) }, ...prev].slice(0, 5))
      setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 10000)
    }
    window.addEventListener('app:error', handler as any)

    const origFetch = window.fetch
    window.fetch = async (input: any, init?: any) => {
      try {
        const res = await origFetch(input, init)
        if (!res.ok) {
          let body = ''
          try {
            body = await res.clone().text()
          } catch {}
          window.dispatchEvent(new CustomEvent('app:error', { detail: { title: `HTTP ${res.status}`, detail: body || input || '' } }))
        }
        return res
      } catch (e: any) {
        window.dispatchEvent(new CustomEvent('app:error', { detail: { title: 'Network error', detail: e?.message || String(e) } }))
        throw e
      }
    }

    return () => window.removeEventListener('app:error', handler as any)
  }, [])

  const appBg = 'bg-[#0B0F19]'

  // Layout:
  // - auth route: tela cheia (sem sidebar)
  // - app routes: sidebar + conteúdo com padding e max-width
  return (
    <div className={`min-h-screen ${appBg} text-white`}>
      {/* Sidebar só aparece fora de rotas de auth (o componente já trata isso via isAuthRoute) */}
      <div className={isAuthRoute ? '' : 'md:flex'}>
        <AppSidebar
          isAuthRoute={isAuthRoute}
          authed={authed}
          onDashboard={() => setRoutePersist('dashboard')}
          onFlow={() => setRoutePersist('flow')}
          onConversations={() => setRoutePersist('conversations')}
          onBots={() => setRoutePersist('bots')}
          onProfile={() => setRoutePersist('profile')}
          onLogout={() => {
            localStorage.removeItem('auth_token')
            setAuthed(false)
            setRoutePersist('login')
          }}
          onLogin={goto('login')}
          onSignup={goto('signup')}
        />

        <main className={isAuthRoute ? 'h-screen overflow-hidden p-0' : 'flex-1'}>
          {/* Alerts (mantive, mas deixei com tema dark + azul) */}
          <div className="fixed top-4 right-4 space-y-2 z-50">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="max-w-sm rounded-2xl border border-red-500/30 bg-red-500/10 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-red-200">{a.title}</div>
                  <button
                    className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-100 hover:bg-red-500/30 transition"
                    onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
                  >
                    Fechar
                  </button>
                </div>
                {a.detail && <div className="mt-2 text-xs text-white/70 break-all">{a.detail}</div>}
              </div>
            ))}
          </div>

          {/* Conteúdo */}
          {route === 'login' && <Login onSuccess={() => { setAuthed(true); setRoutePersist('dashboard') }} />}
          {route === 'signup' && <Signup onSuccess={() => { setAuthed(!!localStorage.getItem('auth_token')); setRoutePersist('dashboard') }} />}

          {!isAuthRoute && authed && (
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              {route === 'dashboard' && <Dashboard />}
              {route === 'flow' && <FlowBuilder />}
              {route === 'conversations' && <Conversations />}
              {route === 'bots' && <Bots />}
              {route === 'profile' && <Profile />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
