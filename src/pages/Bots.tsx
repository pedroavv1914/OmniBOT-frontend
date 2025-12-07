import { useEffect, useState } from 'react'
import { createBot, listBots, getActiveWorkspaceId } from '../lib/api'

export default function Bots() {
  const [workspaceId, setWorkspaceId] = useState(getActiveWorkspaceId() || 'ws-demo')
  const [name, setName] = useState('Meu Bot')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  const load = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const data = await listBots(workspaceId)
      setItems(data)
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
      await createBot({ workspace_id: workspaceId, name, description })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [workspaceId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Criar Bot</div>
        <input className="w-full border rounded p-2 mb-2" placeholder="Workspace ID" value={workspaceId} onChange={e=>setWorkspaceId(e.target.value)} />
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
              <div className="text-sm text-gray-600">id: {b.id} • ws: {b.workspace_id}</div>
              {b.description && <div className="text-sm">{b.description}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
