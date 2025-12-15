import React, { useMemo, useState } from 'react'

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

type NavKey = 'dashboard' | 'flow' | 'conversations' | 'bots' | 'profile'

export default function AppHeader({
  isAuthRoute,
  authed,
  onDashboard,
  onFlow,
  onConversations,
  onBots,
  onProfile,
  onLogout,
  onLogin,
  onSignup,
}: Props) {
  if (isAuthRoute) return null

  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState<NavKey>('dashboard') // UI-only (último clique)

  const nav = useMemo(
    () => [
      { key: 'dashboard' as const, label: 'Dashboard', onClick: onDashboard },
      { key: 'flow' as const, label: 'Fluxos', onClick: onFlow },
      { key: 'conversations' as const, label: 'Conversas', onClick: onConversations },
      { key: 'bots' as const, label: 'Bots', onClick: onBots },
    ],
    [onDashboard, onFlow, onConversations, onBots]
  )

  const go = (key: NavKey, fn: () => void) => {
    setActive(key)
    setMobileOpen(false)
    fn()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          className="group flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white/5"
          onClick={() => go('dashboard', onDashboard)}
          title="Ir para o Dashboard"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-300 shadow-[0_10px_30px_rgba(45,127,249,0.30)]">
            <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-base font-semibold tracking-tight text-white">
              OmniBot<span className="text-cyan-300">AI</span>
            </span>
            <span className="hidden text-xs text-white/50 sm:block">Chatbot multicanal</span>
          </div>
        </button>

        {/* Desktop nav */}
        {authed ? (
          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
              {nav.map((item) => (
                <NavPill
                  key={item.key}
                  label={item.label}
                  active={active === item.key}
                  onClick={() => go(item.key, item.onClick)}
                />
              ))}
            </nav>

            <button
              type="button"
              onClick={() => go('profile', onProfile)}
              className="ml-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
              title="Abrir perfil"
            >
              Perfil
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                onLogout()
              }}
              className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              title="Sair"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                onLogin()
              }}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                onSignup()
              }}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(45,127,249,0.25)] transition hover:opacity-95"
            >
              Criar conta
            </button>
          </div>
        )}

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Abrir menu"
        >
          {mobileOpen ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            {authed ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {nav.map((item) => (
                    <MobileButton
                      key={item.key}
                      label={item.label}
                      active={active === item.key}
                      onClick={() => go(item.key, item.onClick)}
                    />
                  ))}
                  <MobileButton
                    label="Perfil"
                    active={active === 'profile'}
                    onClick={() => go('profile', onProfile)}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                  <span className="text-xs text-white/50">Sessão ativa</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      onLogout()
                    }}
                    className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    onLogin()
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    onSignup()
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(45,127,249,0.25)] transition hover:opacity-95"
                >
                  Criar conta
                </button>
              </div>
            )}

            <div className="mt-3 text-center text-xs text-white/40">
              OmniBotAI • Painel
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

/* ---------- UI helpers (somente visual) ---------- */

function NavPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative rounded-lg px-3 py-2 text-sm font-medium transition',
        active
          ? 'bg-gradient-to-r from-blue-600/30 to-cyan-400/20 text-white'
          : 'text-white/70 hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      {active && (
        <span className="absolute inset-x-2 -bottom-[6px] h-[2px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" />
      )}
      {label}
    </button>
  )
}

function MobileButton({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl border px-4 py-3 text-sm font-medium transition',
        active
          ? 'border-blue-500/30 bg-blue-500/10 text-white'
          : 'border-white/10 bg-black/20 text-white/80 hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
