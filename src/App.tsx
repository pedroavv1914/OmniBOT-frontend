import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FlowBuilder from './pages/FlowBuilder'

export default function App() {
  const [route, setRoute] = useState<'login'|'dashboard'|'flow'>('login')
  const goto = (r: 'login'|'dashboard'|'flow') => () => setRoute(r)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="font-semibold">OmniBotAI</div>
        <nav className="flex gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('login')}>Login</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('dashboard')}>Dashboard</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('flow')}>Fluxos</button>
        </nav>
      </header>
      <main className="p-6">
        {route === 'login' && <Login onSuccess={goto('dashboard')} />}
        {route === 'dashboard' && <Dashboard />}
        {route === 'flow' && <FlowBuilder />}
      </main>
    </div>
  )
}