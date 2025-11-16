import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import { saveFlow, getFlow } from '../lib/api'
import { useState } from 'react'

const initialNodes: any[] = []
const initialEdges: any[] = []

export default function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [savedId, setSavedId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [botId, setBotId] = useState('')

  const onSave = async () => {
    setError('')
    try {
      if (botId) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/bots/${botId}/flow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes, edges })
        })
        if (!res.ok) throw new Error('Falha ao salvar fluxo do bot')
        const data = await res.json()
        setSavedId(data.id)
      } else {
        const res = await saveFlow({ nodes, edges })
        setSavedId(res.id)
      }
    } catch (e: any) {
      setError(e.message || 'Erro')
    }
  }

  const onLoadFlow = async () => {
    if (!botId) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/bots/${botId}/flow`)
      if (!res.ok) throw new Error('Fluxo do bot não encontrado')
      const flow = await res.json()
      setNodes(flow.nodes || [])
      setEdges(flow.edges || [])
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar fluxo')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input className="border rounded p-2" placeholder="Bot ID (opcional)" value={botId} onChange={e=>setBotId(e.target.value)} />
        <button className="px-3 py-1 rounded bg-black text-white" onClick={onSave}>Salvar fluxo</button>
        <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={onLoadFlow} disabled={!botId}>Carregar fluxo do bot</button>
        {savedId && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">ID: {savedId}</span>}
        {error && <span className="px-2 py-1 bg-red-100 text-red-800 rounded">{error}</span>}
      </div>
      <div className="h-[70vh] bg-white rounded shadow">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}