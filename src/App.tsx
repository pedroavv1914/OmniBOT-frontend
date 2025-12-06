import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import FlowBuilder from './pages/FlowBuilder'
import Conversations from './pages/Conversations'
import Bots from './pages/Bots'
import Config from './pages/Config'
import Profile from './pages/Profile'

export default function App() {
  const ROUTE_KEY = 'app_route'
  const initialAuthed = !!localStorage.getItem('auth_token')
  const stored = (localStorage.getItem(ROUTE_KEY) || '') as 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile'
  const isProtected = (r: string) => r !== 'login' && r !== 'signup'
  const initialRoute: 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile' =
    stored && (!isProtected(stored) || initialAuthed) ? stored : (initialAuthed ? 'dashboard' : 'login')
  const [route, setRoute] = useState<'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile'>(initialRoute)
  const [authed, setAuthed] = useState<boolean>(initialAuthed)
  const setRoutePersist = (r: 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile') => { setRoute(r); localStorage.setItem(ROUTE_KEY, r) }
  const goto = (r: 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config') => () => setRoutePersist(r)
  const gotoProtected = (r: 'dashboard'|'flow'|'conversations'|'bots'|'profile') => () => setRoutePersist(authed ? r : 'login')
  const isAuthRoute = route === 'login' || route === 'signup'

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
            <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('config')}>Configuração</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('profile')}>Perfil</button>
          </nav>
        ) : (
          <nav className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('login')}>Login</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('signup')}>Cadastro</button>
          </nav>
        )}
      </header>
      <main className="p-6">
        {route === 'login' && <Login onSuccess={() => { setAuthed(true); setRoutePersist('dashboard') }} />}
        {route === 'signup' && <Signup onSuccess={() => { setAuthed(!!localStorage.getItem('auth_token')); setRoutePersist('dashboard') }} />}
        {!isAuthRoute && authed && route === 'dashboard' && <Dashboard />}
        {!isAuthRoute && authed && route === 'flow' && <FlowBuilder />}
        {!isAuthRoute && authed && route === 'conversations' && <Conversations />}
        {!isAuthRoute && authed && route === 'bots' && <Bots />}
        {!isAuthRoute && authed && route === 'config' && <Config />}
        {!isAuthRoute && authed && route === 'profile' && <Profile />}
      </main>
    </div>
  )
}
