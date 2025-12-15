import { useEffect, useState } from 'react'
import { getMe, listBots, listConversations, listNumbers, getHealth } from '../lib/api'

export default function Dashboard() {
  const [ownerId, setOwnerId] = useState('')
  const [bots, setBots] = useState<any[]>([])
  const [numbers, setNumbers] = useState<any[]>([])
  const [convs, setConvs] = useState<any[]>([])
  const [health, setHealth] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const load = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const me = await getMe()
      const owner = me?.auth_user_id || me?.id || ''
      setOwnerId(owner)
      const [bs, ns, hs] = await Promise.all([listBots(owner), listNumbers(owner), getHealth()])
      setBots(bs)
      setNumbers(ns)
      setHealth(hs)
      const cs = await listConversations({ limit: 100 })
      setConvs(cs)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const convOpen = convs.filter((c: any) => c.status === 'open').length
  const convClosed = convs.filter((c: any) => c.status === 'closed').length
  const botsActive = bots.filter((b: any) => b.is_active !== false).length
  const numbersLinked = numbers.filter((n: any) => !!n.bot_id).length
  const supabaseOk = !!health?.supabase
  const redisOk = !!health?.redis
  const uniqueContacts = Array.from(new Set(convs.map((c: any) => String(c.contact_identifier)))).length
  const byChannel: Record<string, number> = convs.reduce((acc: any, c: any) => {
    const ch = String(c.channel || '')
    acc[ch] = (acc[ch] || 0) + 1
    return acc
  }, {})
  const byBotId: Record<string, number> = convs.reduce((acc: any, c: any) => {
    const b = String(c.bot_id || '')
    acc[b] = (acc[b] || 0) + 1
    return acc
  }, {})
  const topBots = Object.entries(byBotId)
    .filter(([k]) => !!k)
    .map(([botId, count]) => ({ botId, count, name: bots.find((b: any) => b.id === botId)?.name || botId }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const topChannels = Object.entries(byChannel)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count)
  const withoutNumber = bots.filter((b: any) => !numbers.some((n: any) => n.bot_id === b.id)).length
  const numbersWithoutBot = numbers.filter((n: any) => !n.bot_id).length
  const recent = [...convs]
    .sort((a: any, b: any) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 8)

  const StatCard = ({
    title,
    value,
    hint,
    chip,
  }: {
    title: string
    value: string | number
    hint?: string
    chip?: { label: string; tone: 'ok' | 'warn' | 'bad' | 'info' }
  }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.35)] transition hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-white/70">{title}</div>
        {chip ? <Chip label={chip.label} tone={chip.tone} /> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {hint && <div className="mt-2 text-xs text-white/55">{hint}</div>}
    </div>
  )

  const Panel = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-white/80">{title}</div>
        {right}
      </div>
      {children}
    </div>
  )

  return (
    <div className="h-full overflow-hidden bg-[#0B0F19] text-white">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl h-full px-4 py-4 sm:px-5 overflow-hidden">
        {/* Header row */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Dashboard</div>
            <div className="mt-1 text-sm text-white/60">
              Visão geral do seu workspace e saúde dos serviços.
              {ownerId ? <span className="ml-2 font-mono text-xs text-white/40">owner: {ownerId}</span> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>

            <div className="hidden sm:block">
              <Chip
                label={supabaseOk && redisOk ? 'Serviços OK' : 'Serviços parciais'}
                tone={supabaseOk && redisOk ? 'ok' : 'warn'}
              />
            </div>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard title="Bots" value={bots.length} hint={`${botsActive} ativos • ${withoutNumber} sem número`} chip={{ label: `${botsActive} ativos`, tone: botsActive > 0 ? 'ok' : 'warn' }} />
          <StatCard title="Números" value={numbers.length} hint={`${numbersLinked} conectados • ${numbersWithoutBot} livres`} chip={{ label: `${numbersLinked} conectados`, tone: numbersLinked > 0 ? 'info' : 'warn' }} />
          <StatCard title="Conversas" value={convs.length} hint={`${convOpen} abertas • ${convClosed} fechadas`} chip={{ label: `${convOpen} abertas`, tone: convOpen > 0 ? 'info' : 'ok' }} />
          <StatCard title="Contatos únicos" value={uniqueContacts} hint="Baseado nas últimas 100 conversas" />
          <StatCard title="Canais ativos" value={topChannels.length} hint={topChannels.map((tc) => tc.channel).slice(0, 3).join(', ') || '—'} />
          <StatCard
            title="Serviços"
            value={supabaseOk && redisOk ? 'OK' : 'Parcial'}
            hint={`Supabase ${supabaseOk ? 'OK' : 'NOK'} • Filas ${redisOk ? 'OK' : 'NOK'}`}
            chip={{ label: supabaseOk && redisOk ? 'Operacional' : 'Atenção', tone: supabaseOk && redisOk ? 'ok' : 'warn' }}
          />
        </div>

        {/* Mid panels */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel
            title="Top Bots"
            right={<span className="text-xs text-white/45">últimas 100 conversas</span>}
          >
            <ul className="space-y-2">
              {topBots.length ? (
                topBots.map((tb) => (
                  <li
                    key={tb.botId}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2 transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{tb.name}</div>
                      <div className="mt-1 font-mono text-xs text-white/45">{tb.botId}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip label={`${tb.count} conversas`} tone="info" />
                    </div>
                  </li>
                ))
              ) : (
                <EmptyState text="Nenhum dado de bots ainda." />
              )}
            </ul>
          </Panel>

          <Panel title="Canais" right={<span className="text-xs text-white/45">distribuição</span>}>
            <ul className="space-y-2">
              {topChannels.length ? (
                topChannels.map((tc) => (
                  <li
                    key={tc.channel || '-'}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2 transition hover:bg-white/5"
                  >
                    <div className="text-sm font-medium text-white">{tc.channel || '-'}</div>
                    <Chip label={`${tc.count} conversas`} tone="info" />
                  </li>
                ))
              ) : (
                <EmptyState text="Nenhum canal registrado ainda." />
              )}
            </ul>
          </Panel>
        </div>

        {/* Recent conversations */}
        <div className="mt-4">
          <Panel
            title="Últimas conversas"
            right={<span className="text-xs text-white/45">{recent.length ? `mostrando ${recent.length}` : ''}</span>}
          >
            {recent.length ? (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {recent.map((c: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2 transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{String(c.contact_identifier)}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                        <Badge label={String(c.channel)} />
                        <Badge label={String(c.status)} tone={c.status === 'open' ? 'info' : 'ok'} />
                      </div>
                    </div>
                    <div className="ml-4 text-right font-mono text-xs text-white/45">
                      {c.created_at ? new Date(c.created_at).toLocaleString() : '-'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="Nenhuma conversa recente encontrada." />
            )}
          </Panel>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4 text-sm text-white/55">Carregando...</div>
        )}
      </div>
    </div>
  )
}

/* ---------------- UI helpers (somente visual) ---------------- */

function Chip({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'bad' | 'info' }) {
  const map: Record<string, string> = {
    ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    warn: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100',
    bad: 'border-red-500/30 bg-red-500/10 text-red-200',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${map[tone]}`}>
      {label}
    </span>
  )
}

function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'ok' | 'info' }) {
  const map: Record<string, string> = {
    neutral: 'border-white/10 bg-white/5 text-white/70',
    ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
  }
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${map[tone]}`}>{label}</span>
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/55">
      {text}
    </div>
  )
}
