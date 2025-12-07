import { useEffect, useState } from 'react'
import { listWorkspaces, createWorkspace, getActiveWorkspaceId, setActiveWorkspaceId } from '../lib/api'
import { useMemo } from 'react'

export default function Workspaces() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [active, setActive] = useState(getActiveWorkspaceId())
  const [error, setError] = useState<string|undefined>()
  const [members, setMembers] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')

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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const token = useMemo(() => localStorage.getItem('auth_token') || '', [])
  const authHeader = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token])

  const loadMembers = async () => {
    if (!active) return setMembers([])
    try {
      const res = await fetch(`${apiUrl}/workspaces/${active}/members`, { headers: { ...authHeader } })
      if (!res.ok) throw new Error('Falha ao listar membros')
      const data = await res.json()
      setMembers(data || [])
    } catch (e: any) { setError(e?.message || 'Erro ao listar membros') }
  }
  useEffect(() => { loadMembers() }, [active])

  const invite = async () => {
    setError(undefined)
    try {
      if (!active) throw new Error('Selecione uma workspace')
      const res = await fetch(`${apiUrl}/workspaces/${active}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify({ email: inviteEmail, role: 'member' }) })
      if (!res.ok) throw new Error('Falha ao adicionar membro')
      setInviteEmail('')
      await loadMembers()
    } catch (e: any) { setError(e?.message || 'Erro ao adicionar membro') }
  }

  const remove = async (user_id: string) => {
    setError(undefined)
    try {
      if (!active) throw new Error('Selecione uma workspace')
      const res = await fetch(`${apiUrl}/workspaces/${active}/members/${user_id}`, { method: 'DELETE', headers: { ...authHeader } })
      if (!res.ok) throw new Error('Falha ao remover membro')
      await loadMembers()
    } catch (e: any) { setError(e?.message || 'Erro ao remover membro') }
  }

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

      {active && (
        <div className="mt-6">
          <div className="font-semibold mb-2">Membros</div>
          <div className="flex gap-2 mb-3">
            <input className="border rounded p-2 flex-1" placeholder="Email do membro" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
            <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={invite}>Adicionar</button>
          </div>
          <div className="space-y-2">
            {members.map((m: any) => (
              <div key={m.user_id} className="border rounded p-2 flex items-center justify-between">
                <div className="text-sm">{m.user_id} • {m.role}</div>
                <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>remove(m.user_id)}>Remover</button>
              </div>
            ))}
            {members.length===0 && <div className="text-sm text-gray-600">Sem membros nesta workspace.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
