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
  const [route, setRoute] = useState<'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config'|'profile'>('login')
  const [authed, setAuthed] = useState<boolean>(!!localStorage.getItem('auth_token'))
  const goto = (r: 'login'|'signup'|'dashboard'|'flow'|'conversations'|'bots'|'config') => () => setRoute(r)
  const gotoProtected = (r: 'dashboard'|'flow'|'conversations'|'bots'|'profile') => () => setRoute(authed ? r : 'login')

  // sincroniza quando token é removido/adicionado em outras abas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token') setAuthed(!!localStorage.getItem('auth_token'))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="font-semibold">OmniBotAI</div>
        <nav className="flex gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('login')}>Login</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('signup')}>Cadastro</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('dashboard')}>Dashboard</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('flow')}>Fluxos</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('conversations')}>Conversas</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('bots')}>Bots</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('config')}>Configuração</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={gotoProtected('profile')}>Perfil</button>
        </nav>
      </header>
      <main className="p-6">
        {route === 'login' && <Login onSuccess={() => { setAuthed(true); setRoute('dashboard') }} />}
        {route === 'signup' && <Signup onSuccess={() => { setAuthed(!!localStorage.getItem('auth_token')); setRoute('dashboard') }} />}
        {route === 'dashboard' && <Dashboard />}
        {route === 'flow' && <FlowBuilder />}
        {route === 'conversations' && <Conversations />}
        {route === 'bots' && <Bots />}
        {route === 'config' && <Config />}
        {route === 'profile' && <Profile />}
      </main>
    </div>
  )
}
