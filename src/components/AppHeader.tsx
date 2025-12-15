import React from 'react'

type Props = {
  isAuthRoute: boolean
  authed: boolean
  onDashboard: () => void
  onFlow: () => void
  onConversations: () => void
  onBots: () => void
  onProfile: () => void
  onLogout: () => void
  onLogin: () => void
  onSignup: () => void
}

export default function AppHeader({ isAuthRoute, authed, onDashboard, onFlow, onConversations, onBots, onProfile, onLogout, onLogin, onSignup }: Props) {
  if (isAuthRoute) return null
  const cls = 'flex items-center justify-between p-4 border-b bg-white'

  return (
    <header className={cls}>
      <div className="font-semibold">OmniBotAI</div>
      {authed ? (
          <nav className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-200" onClick={onDashboard}>Dashboard</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={onFlow}>Fluxos</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={onConversations}>Conversas</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={onBots}>Bots</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={onProfile}>Perfil</button>
            <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={onLogout}>Logout</button>
          </nav>
        ) : (
          <nav className="flex gap-2">
            <button className="px-3 py-1 rounded bg-gray-200" onClick={onLogin}>Login</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={onSignup}>Cadastro</button>
          </nav>
        )}
    </header>
  )
}
