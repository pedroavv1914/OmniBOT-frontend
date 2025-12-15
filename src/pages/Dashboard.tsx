import { useEffect, useState } from 'react'
import { getMe, listBots, listConversations, listNumbers, getHealth } from '../lib/api'

export default function Dashboard() {
  const [ownerId, setOwnerId] = useState('')
  const [bots, setBots] = useState<any[]>([])
  const [numbers, setNumbers] = useState<any[]>([])
  const [convs, setConvs] = useState<any[]>([])
  const [health, setHealth] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  const load = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const me = await getMe()
      const owner = me?.auth_user_id || me?.id || ''
      setOwnerId(owner)
      const [bs, ns, hs] = await Promise.all([
        listBots(owner),
        listNumbers(owner),
        getHealth()
      ])
      setBots(bs)
      setNumbers(ns)
      setHealth(hs)
      const cs = await listConversations({ limit: 100 })
      setConvs(cs)
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const convOpen = convs.filter((c:any)=>c.status==='open').length
  const convClosed = convs.filter((c:any)=>c.status==='closed').length
  const botsActive = bots.filter((b:any)=>b.is_active !== false).length
  const numbersLinked = numbers.filter((n:any)=>!!n.bot_id).length
  const supabaseOk = !!health?.supabase
  const redisOk = !!health?.redis
  const uniqueContacts = Array.from(new Set(convs.map((c:any)=>String(c.contact_identifier)))).length
  const byChannel: Record<string, number> = convs.reduce((acc:any, c:any)=>{ const ch = String(c.channel||''); acc[ch] = (acc[ch]||0)+1; return acc }, {})
  const byBotId: Record<string, number> = convs.reduce((acc:any, c:any)=>{ const b = String(c.bot_id||''); acc[b] = (acc[b]||0)+1; return acc }, {})
  const topBots = Object.entries(byBotId).filter(([k])=>!!k).map(([botId, count])=>({ botId, count, name: (bots.find((b:any)=>b.id===botId)?.name)||botId }))
    .sort((a,b)=>b.count-a.count).slice(0,5)
  const topChannels = Object.entries(byChannel).map(([channel, count])=>({ channel, count })).sort((a,b)=>b.count-a.count)
  const withoutNumber = bots.filter((b:any)=>!numbers.some((n:any)=>n.bot_id===b.id)).length
  const numbersWithoutBot = numbers.filter((n:any)=>!n.bot_id).length
  const recent = [...convs].sort((a:any,b:any)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,8)

  const Card = ({ title, value, hint, ok }: { title: string, value: string|number, hint?: string, ok?: boolean }) => (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
      {ok !== undefined && (
        <div className={`mt-2 inline-flex items-center text-xs px-2 py-0.5 rounded ${ok?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{ok?'OK':'Indisponível'}</div>
      )}
    </div>
  )

  const ListCard = ({ title, items }: { title: string, items: Array<{ label: string, sub?: string }> }) => (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
      <div className="text-sm text-gray-600">{title}</div>
      <ul className="mt-2 space-y-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center justify-between p-2 border rounded-lg">
            <div className="font-medium">{it.label}</div>
            {it.sub && <div className="text-xs text-gray-600">{it.sub}</div>}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card title="Bots" value={bots.length} hint={`${botsActive} ativos • ${withoutNumber} sem número`} />
        <Card title="Números" value={numbers.length} hint={`${numbersLinked} conectados • ${numbersWithoutBot} livres`} />
        <Card title="Conversas" value={convs.length} hint={`${convOpen} abertas • ${convClosed} fechadas`} />
        <Card title="Contatos únicos" value={uniqueContacts} />
        <Card title="Canais ativos" value={topChannels.length} hint={topChannels.map(tc=>tc.channel).slice(0,3).join(', ')} />
        <Card title="Serviços" value={supabaseOk && redisOk ? 'OK' : 'Parcial'} ok={supabaseOk && redisOk} hint={`Supabase ${supabaseOk?'OK':'NOK'} • Filas ${redisOk?'OK':'NOK'}`} />
      </div>

      <div className="lg:col-span-2">
        <ListCard title="Top Bots" items={topBots.map(tb=>({ label: tb.name, sub: `${tb.count} conversas` }))} />
      </div>
      <div className="lg:col-span-2">
        <ListCard title="Canais" items={topChannels.map(tc=>({ label: tc.channel||'-', sub: `${tc.count} conversas` }))} />
      </div>

      <div className="lg:col-span-4">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <div className="text-sm text-gray-600">Últimas conversas</div>
          <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {recent.map((c:any, idx:number)=> (
              <li key={idx} className="p-2 border rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(c.contact_identifier)}</div>
                  <div className="text-xs text-gray-600">{String(c.channel)} • {String(c.status)}</div>
                </div>
                <div className="text-xs text-gray-500 font-mono">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && <div className="lg:col-span-4 text-red-600">{error}</div>}
      {loading && <div className="lg:col-span-4 text-gray-500">Carregando...</div>}
    </div>
  )
}
