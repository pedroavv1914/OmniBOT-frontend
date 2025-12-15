import { useEffect, useState } from 'react'
import { createBot, listBots, getMe, listNumbers, createNumber, updateNumber, deleteNumber, initWhatsapp, streamWhatsappStatus, mockWhatsappScan } from '../lib/api'

export default function Bots() {
  const [ownerId, setOwnerId] = useState('')
  const [name, setName] = useState('Meu Bot')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [numbers, setNumbers] = useState<any[]>([])
  const [qrInfo, setQrInfo] = useState<{ number_id: string, qr_text: string, session_id: string, expires_at: number }|null>(null)
  const [qrStatus, setQrStatus] = useState<string>('')
  const sseRef = useState<EventSource|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  const load = async () => {
    setLoading(true)
    setError(undefined)
    try {
      if (!ownerId) {
        const me = await getMe()
        setOwnerId(me?.auth_user_id || me?.id || '')
      }
      const owner = ownerId || (await getMe()).auth_user_id
      const data = await listBots(owner)
      const nums = await listNumbers(owner)
      setItems(data)
      setNumbers(nums)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const me = ownerId || (await getMe()).auth_user_id
      await createBot({ owner_id: me, name, description, phone_number: phone })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [ownerId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Criar Bot</div>
        <input className="w-full border rounded p-2 mb-2" placeholder="Número WhatsApp (opcional)" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input className="w-full border rounded p-2 mb-2" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border rounded p-2 mb-4" placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} />
        <button className="w-full bg-black text-white rounded p-2" onClick={create} disabled={loading}>Criar</button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
      <div className="bg-white p-4 rounded shadow md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Bots</div>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={load} disabled={loading}>Atualizar</button>
        </div>
        <ul className="space-y-2">
          {items.map((b:any) => (
            <li key={b.id} className="border p-2 rounded">
              <div className="font-semibold">{b.name}</div>
              <div className="text-sm text-gray-600">id: {b.id} • owner: {b.owner_id} • fone: {b.phone_number||'-'}</div>
              {b.description && <div className="text-sm">{b.description}</div>}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <div className="font-semibold mb-2">Números</div>
          <div className="flex gap-2 mb-3">
            <input className="border rounded p-2 flex-1" placeholder="Novo número" value={phone} onChange={e=>setPhone(e.target.value)} />
            <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={async()=>{ try { const owner = ownerId || (await getMe()).auth_user_id; await createNumber({ owner_id: owner, phone_number: phone }); setPhone(''); await load() } catch (e:any) { setError(e.message) } }}>Cadastrar</button>
          </div>
        <ul className="space-y-2">
          {numbers.map((n:any) => (
            <li key={n.id} className="border p-2 rounded">
              <div className="text-sm">{n.phone_number}</div>
              <div className="flex items-center gap-2 mt-2">
                <select className="border rounded p-1" value={n.bot_id||''} onChange={async(e)=>{ try { await updateNumber(n.id, { bot_id: e.target.value||undefined }); await load() } catch (err:any) { setError(err.message) } }}>
                  <option value="">Sem bot</option>
                  {items.map((b:any)=>(<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
                <button className="px-3 py-1 rounded bg-green-700 text-white" onClick={async()=>{
                  try {
                    const r = await initWhatsapp(n.id)
                    setQrInfo({ number_id: n.id, qr_text: r.qr_text, session_id: r.session_id, expires_at: r.expires_at })
                    setQrStatus('pending')
                    const es = streamWhatsappStatus(n.id)
                    es.onmessage = (ev) => { try { const d = JSON.parse(ev.data); setQrStatus(d.status) } catch {} }
                  } catch (err:any) { setError(err.message) }
                }}>Conectar</button>
                <button className="px-3 py-1 rounded bg-red-700 text-white" onClick={async()=>{ try { await deleteNumber(n.id); await load() } catch (err:any) { setError(err.message) } }}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
        {qrInfo && (
          <div className="mt-6 p-4 border rounded">
            <div className="font-semibold mb-2">WhatsApp • Sessão</div>
            <div className="text-sm mb-2">Status: {qrStatus}</div>
            <img alt="QR" className="border rounded" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrInfo.qr_text)}`} />
            <div className="text-xs text-gray-600 mt-2">Expira: {new Date(qrInfo.expires_at).toLocaleTimeString()}</div>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={()=>setQrInfo(null)}>Fechar</button>
              <button className="px-3 py-1 rounded bg-blue-700 text-white" onClick={async()=>{ try { await mockWhatsappScan(qrInfo.number_id) } catch (err:any) { setError(err.message) } }}>Simular leitura</button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
