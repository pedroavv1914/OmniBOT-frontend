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

export default function AppSidebar({
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

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState<NavKey>('dashboard') // UI-only (último clique)

  const primary = useMemo(
    () => [
      { key: 'dashboard' as const, label: 'Dashboard', desc: 'Visão geral', onClick: onDashboard, icon: 'grid' },
      { key: 'flow' as const, label: 'Fluxos', desc: 'Editor visual', onClick: onFlow, icon: 'nodes' },
      { key: 'conversations' as const, label: 'Conversas', desc: 'Inbox e histórico', onClick: onConversations, icon: 'chat' },
      { key: 'bots' as const, label: 'Bots', desc: 'Configurações', onClick: onBots, icon: 'bot' },
    ],
    [onDashboard, onFlow, onConversations, onBots]
  )

  const go = (key: NavKey, fn: () => void) => {
    setActive(key)
    setMobileOpen(false)
    fn()
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? 'Fechar' : 'Menu'}
          </button>

          <div className="flex items-center gap-2">
            <BrandMini />
            {authed ? (
              <button
                type="button"
                onClick={() => go('profile', onProfile)}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition"
              >
                Perfil
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm border-r border-white/10 bg-[#0B0F19]">
            <SidebarInner
              authed={authed}
              collapsed={false}
              active={active}
              onCollapsedToggle={() => {}}
              onCloseMobile={() => setMobileOpen(false)}
              primary={primary}
              go={go}
              onProfile={onProfile}
              onLogout={onLogout}
              onLogin={onLogin}
              onSignup={onSignup}
              mobile
            />
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-0 h-screen border-r border-white/10 bg-[#0B0F19]">
          <SidebarInner
            authed={authed}
            collapsed={collapsed}
            active={active}
            onCollapsedToggle={() => setCollapsed((v) => !v)}
            onCloseMobile={() => {}}
            primary={primary}
            go={go}
            onProfile={onProfile}
            onLogout={onLogout}
            onLogin={onLogin}
            onSignup={onSignup}
          />
        </div>
      </aside>
    </>
  )
}

/* ------------------------- Inner ------------------------- */

function SidebarInner({
  authed,
  collapsed,
  active,
  onCollapsedToggle,
  onCloseMobile,
  primary,
  go,
  onProfile,
  onLogout,
  onLogin,
  onSignup,
  mobile,
}: {
  authed: boolean
  collapsed: boolean
  active: NavKey
  onCollapsedToggle: () => void
  onCloseMobile: () => void
  primary: Array<{ key: NavKey; label: string; desc: string; onClick: () => void; icon: string }>
  go: (key: NavKey, fn: () => void) => void
  onProfile: () => void
  onLogout: () => void
  onLogin: () => void
  onSignup: () => void
  mobile?: boolean
}) {
  return (
    <div className={`${collapsed ? 'w-[88px]' : 'w-[304px]'} h-full transition-[width] duration-200 flex flex-col`}>
      {/* Brand/Header */}
      <div className="relative px-4 pt-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_30%_0%,rgba(45,127,249,0.22),transparent_60%)]" />

        <div className="relative flex items-start justify-between gap-2">
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 transition"
            onClick={() => go('dashboard', primary[0].onClick)}
            title="Ir para o Dashboard"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-300 shadow-[0_10px_30px_rgba(45,127,249,0.28)]" />
            {!collapsed ? (
              <div className="min-w-0">
                <div className="text-base font-semibold tracking-tight text-white">
                  OmniBot<span className="text-cyan-300">AI</span>
                </div>
                <div className="mt-0.5 text-xs text-white/50">Painel do Workspace</div>
              </div>
            ) : null}
          </button>

          {!mobile ? (
            <button
              type="button"
              onClick={onCollapsedToggle}
              className="mt-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
              title={collapsed ? 'Expandir' : 'Recolher'}
            >
              {collapsed ? '»' : '«'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onCloseMobile}
              className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 px-4">
        <div className="h-px bg-white/10" />
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-3">
        <div className={`mb-2 ${collapsed ? 'px-1' : 'px-2'} text-[11px] uppercase tracking-wider text-white/40`}>
          Navegação
        </div>

        <div className="space-y-2">
          {primary.map((item) => (
            <SidebarItem
              key={item.key}
              collapsed={collapsed}
              active={active === item.key}
              label={item.label}
              desc={item.desc}
              icon={item.icon}
              onClick={() => go(item.key, item.onClick)}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3 pb-4 pt-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          {authed ? (
            <>
              <button
                type="button"
                onClick={() => go('profile', onProfile)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5 hover:text-white transition"
              >
                {collapsed ? '👤' : 'Perfil'}
              </button>

              <button
                type="button"
                onClick={() => onLogout()}
                className="mt-2 w-full rounded-xl bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition"
              >
                {collapsed ? '⎋' : 'Sair'}
              </button>

              {!collapsed ? (
                <div className="mt-3 text-center text-xs text-white/45">
                  Serviços e métricas em tempo real
                </div>
              ) : null}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onLogin()}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5 hover:text-white transition"
              >
                Entrar
              </button>

              <button
                type="button"
                onClick={() => onSignup()}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(45,127,249,0.22)] hover:opacity-95 transition"
              >
                Criar conta
              </button>

              <div className="mt-3 text-center text-xs text-white/40">OmniBotAI • Autenticação</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SidebarItem({
  collapsed,
  active,
  label,
  desc,
  icon,
  onClick,
}: {
  collapsed: boolean
  active: boolean
  label: string
  desc: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative w-full rounded-2xl px-3 py-3 text-left transition',
        'border border-white/10',
        active ? 'bg-blue-500/10' : 'bg-black/20 hover:bg-white/5',
      ].join(' ')}
      title={collapsed ? label : undefined}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500 to-cyan-300" />
      ) : null}

      <div className="flex items-center gap-3">
        <div
          className={[
            'flex h-10 w-10 items-center justify-center rounded-xl border transition',
            active
              ? 'border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-cyan-400/10 text-white'
              : 'border-white/10 bg-white/5 text-white/70 group-hover:text-white',
          ].join(' ')}
        >
          <Icon name={icon} />
        </div>

        {!collapsed ? (
          <div className="min-w-0">
            <div className={`text-sm font-semibold ${active ? 'text-white' : 'text-white/85'}`}>{label}</div>
            <div className="mt-0.5 text-xs text-white/45">{desc}</div>
          </div>
        ) : null}
      </div>
    </button>
  )
}

function BrandMini() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-300" />
      <div className="text-sm font-semibold tracking-tight text-white">
        OmniBot<span className="text-cyan-300">AI</span>
      </div>
    </div>
  )
}

/* Ícones inline: sem dependências */
function Icon({ name }: { name: string }) {
  const cls = 'h-5 w-5'
  if (name === 'grid') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path d="M4 4h7v7H4V4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M13 4h7v7h-7V4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M4 13h7v7H4v-7Z" stroke="currentColor" strokeWidth="2" />
        <path d="M13 13h7v7h-7v-7Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  if (name === 'nodes') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path d="M7 7h4v4H7V7Z" stroke="currentColor" strokeWidth="2" />
        <path d="M13 13h4v4h-4v-4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M11 9h2m-6 6h2m4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  if (name === 'chat') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 18l-3 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  // bot
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6M12 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 9a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M9 12h.01M15 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
