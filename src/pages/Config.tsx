import { useEffect, useState } from 'react'
import { setWorkspacePlan, getWorkspaceUsage, createCheckoutSession, getActiveWorkspaceId } from '../lib/api'

export default function Config() {
  const [wsId, setWsId] = useState('')
  const [wsPlan, setWsPlan] = useState<'free'|'pro'|'enterprise'>('free')
  const [wsUsage, setWsUsage] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => { const id = getActiveWorkspaceId(); if (id) { setWsId(id); refreshUsage(id) } }, [])

  const refreshUsage = async (id: string) => {
    try { const usage = await getWorkspaceUsage(id); setWsUsage(usage) } catch {}
  }

  const changePlan = async () => {
    setError('')
    try {
      if (!wsId) throw new Error('Informe o Workspace ID')
      await setWorkspacePlan(wsId, wsPlan)
      await refreshUsage(wsId)
    } catch (e: any) {
      setError(e.message || 'Erro ao alterar plano')
    }
  }

  const startCheckout = async () => {
    setError('')
    try {
      if (!wsId) throw new Error('Informe o Workspace ID')
      if (wsPlan === 'free') throw new Error('Selecione pro ou enterprise para checkout')
      const s = await createCheckoutSession(wsId, wsPlan as any)
      if (s?.url) window.location.href = s.url
    } catch (e: any) {
      setError(e.message || 'Erro ao iniciar checkout')
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="font-semibold">Plano da Workspace</div>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-2 items-center">
            <input className="border rounded p-2 flex-1" placeholder="Workspace ID" value={wsId} onChange={e=>setWsId(e.target.value)} />
            <select className="border rounded p-2" value={wsPlan} onChange={e=>setWsPlan(e.target.value as any)}>
              <option value="free">free</option>
              <option value="pro">pro</option>
              <option value="enterprise">enterprise</option>
            </select>
            <button className="px-3 py-1 rounded bg-blue-700 text-white" onClick={changePlan}>Aplicar</button>
            <button className="px-3 py-1 rounded bg-purple-700 text-white" onClick={startCheckout}>Checkout</button>
          </div>
          {wsUsage && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="border rounded p-2">
                <div className="text-gray-600">Plano</div>
                <div className="font-mono">{wsUsage.plan}</div>
              </div>
              <div className="border rounded p-2">
                <div className="text-gray-600">Uso</div>
                <div className="font-mono">{wsUsage.count} / {wsUsage.limit} ({wsUsage.period})</div>
              </div>
            </div>
          )}
          {error && <div className="text-red-700 bg-red-100 border border-red-300 rounded p-2 text-sm">{error}</div>}
        </div>
      </div>
    </div>
  )
}
