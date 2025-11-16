import { useState } from 'react'
import Login from './pages/Login.tsx'
import Dashboard from './pages/Dashboard.tsx'
import FlowBuilder from './pages/FlowBuilder.tsx'
import Conversations from './pages/Conversations.tsx'
import Bots from './pages/Bots.tsx'

export default function App() {
  const [route, setRoute] = useState<'login'|'dashboard'|'flow'|'conversations'|'bots'>('login')
  const goto = (r: 'login'|'dashboard'|'flow'|'conversations'|'bots') => () => setRoute(r)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="font-semibold">OmniBotAI</div>
        <nav className="flex gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('login')}>Login</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('dashboard')}>Dashboard</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('flow')}>Fluxos</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('conversations')}>Conversas</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={goto('bots')}>Bots</button>
        </nav>
      </header>
      <main className="p-6">
        {route === 'login' && <Login onSuccess={goto('dashboard')} />}
        {route === 'dashboard' && <Dashboard />}
        {route === 'flow' && <FlowBuilder />}
        {route === 'conversations' && <Conversations />}
        {route === 'bots' && <Bots />}
      </main>
    </div>
  )
}