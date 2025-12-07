import { useEffect, useState } from 'react'
import { listWorkspaces, createWorkspace, getActiveWorkspaceId, setActiveWorkspaceId } from '../lib/api'

export default function Workspaces() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [active, setActive] = useState(getActiveWorkspaceId())
  const [error, setError] = useState<string|undefined>()

  const load = async () => {
    setError(undefined)
    try { const r = await listWorkspaces(); setItems(r || []) } catch (e: any) { setError(e?.message || 'Erro ao listar') }
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    setError(undefined)
    try { const w = await createWorkspace(name); setName(''); await load(); setActiveWorkspaceId(w?.id || active); setActive(getActiveWorkspaceId()) } catch (e: any) { setError(e?.message || 'Erro ao criar') }
  }

  const choose = (id: string) => { setActiveWorkspaceId(id); setActive(id) }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Workspaces</h1>
      <div className="flex gap-2 mb-4">
        <input className="border rounded p-2 flex-1" placeholder="Nome da workspace" value={name} onChange={e=>setName(e.target.value)} />
        <button className="px-3 py-1 rounded bg-black text-white" onClick={create}>Criar</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="space-y-2">
        {items.map(w => (
          <div key={w.id} className={`border rounded p-3 flex items-center justify-between ${active===w.id?'bg-gray-50':''}`}>
            <div>
              <div className="font-semibold">{w.name}</div>
              <div className="text-xs text-gray-500">{w.id}</div>
            </div>
            <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={()=>choose(w.id)}>{active===w.id?'Selecionada':'Selecionar'}</button>
          </div>
        ))}
        {items.length===0 && <div className="text-sm text-gray-600">Nenhuma workspace. Crie a primeira acima.</div>}
      </div>
    </div>
  )
}
