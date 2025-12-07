import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import FlowBuilder from './pages/FlowBuilder'
import Conversations from './pages/Conversations'
import Bots from './pages/Bots'
import Config from './pages/Config'
import Profile from './pages/Profile'
import Workspaces from './pages/Workspaces'

export default function App() {
  const ROUTE_KEY = 'app_route'
  const initialAuthed = !!localStorage.getItem('auth_token')
  const stored = (localStorage.getItem(ROUTE_KEY) || '') as 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile'
  const isProtected = (r: string) => r !== 'login' && r !== 'signup'
  const initialRoute: 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile' =
    stored && (!isProtected(stored) || initialAuthed) ? stored : (initialAuthed ? 'dashboard' : 'login')
  const [route, setRoute] = useState<'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile'|'workspaces'>(initialRoute)
  const [authed, setAuthed] = useState<boolean>(initialAuthed)
  const setRoutePersist = (r: 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile'|'workspaces') => { setRoute(r); localStorage.setItem(ROUTE_KEY, r) }
  const goto = (r: 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'workspaces') => () => setRoutePersist(r)
  const gotoProtected = (r: 'dashboard'|'flow'|'conversations'|'bots'|'profile'|'workspaces') => () => setRoutePersist(authed ? r : 'login')
  const isAuthRoute = route === 'login' || route === 'signup'
  const [alerts, setAlerts] = useState<Array<{ id: string, title: string, detail?: string }>>([])

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
      const d = ev?.detail || {}
      const id = `${Date.now()}-${Math.random()}`
      setAlerts(prev => [{ id, title: d.title || 'Erro', detail: typeof d.detail==='string'? d.detail : JSON.stringify(d.detail||{}) }, ...prev].slice(0, 5))
      setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 10000)
    }
    window.addEventListener('app:error', handler as any)
    const origFetch = window.fetch
    window.fetch = async (input: any, init?: any) => {
      try {
        const res = await origFetch(input, init)
        if (!res.ok) {
          let body = ''
          try { body = await res.clone().text() } catch {}
          window.dispatchEvent(new CustomEvent('app:error', { detail: { title: `HTTP ${res.status}`, detail: body || (input||'') } }))
        }
        return res
      } catch (e: any) {
        window.dispatchEvent(new CustomEvent('app:error', { detail: { title: 'Network error', detail: e?.message || String(e) } }))
        throw e
      }
    }
    return () => window.removeEventListener('app:error', handler as any)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="font-semibold">OmniBotAI</div>
        {!isAuthRoute && authed ? (
          <nav className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('dashboard')}>Dashboard</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('flow')}>Fluxos</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('conversations')}>Conversas</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('bots')}>Bots</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('workspaces')}>Workspaces</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('config')}>Configuração</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('profile')}>Perfil</button>
            <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => { localStorage.removeItem('auth_token'); setAuthed(false); setRoutePersist('login') }}>Logout</button>
          </nav>
        ) : (
          <nav className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('login')}>Login</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('signup')}>Cadastro</button>
          </nav>
        )}
      </header>
      <main className="p-6">
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {alerts.map(a => (
            <div key={a.id} className="max-w-sm bg-white border border-red-300 shadow rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-red-700">{a.title}</div>
                <button className="text-xs px-2 py-1 bg-red-600 text-white rounded" onClick={()=>setAlerts(prev=>prev.filter(x=>x.id!==a.id))}>Fechar</button>
              </div>
              {a.detail && <div className="mt-1 text-xs text-gray-700 break-all">{a.detail}</div>}
            </div>
          ))}
        </div>
        {route === 'login' && <Login onSuccess={() => { setAuthed(true); setRoutePersist('dashboard') }} />}
        {route === 'signup' && <Signup onSuccess={() => { setAuthed(!!localStorage.getItem('auth_token')); setRoutePersist('dashboard') }} />}
        {!isAuthRoute && authed && route === 'dashboard' && <Dashboard />}
        {!isAuthRoute && authed && route === 'flow' && <FlowBuilder />}
        {!isAuthRoute && authed && route === 'conversations' && <Conversations />}
        {!isAuthRoute && authed && route === 'bots' && <Bots />}
        {!isAuthRoute && authed && route === 'config' && <Config />}
        {!isAuthRoute && authed && route === 'workspaces' && <Workspaces />}
        {!isAuthRoute && authed && route === 'profile' && <Profile />}
      </main>
    </div>
  )
}
