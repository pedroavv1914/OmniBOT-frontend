import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import { saveFlow } from '../lib/api'
import { useState } from 'react'

const initialNodes: any[] = []
const initialEdges: any[] = []

export default function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [savedId, setSavedId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [botId, setBotId] = useState('')
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const addNode = (type: string) => {
    const id = `${type}-${Date.now()}`
    const position = { x: 100 + nodes.length * 40, y: 100 + nodes.length * 20 }
    const defaults: any = {
      message: { text: 'Mensagem' },
      question: { text: 'Pergunta?', var: 'resposta' },
      condition: { keyword: 'pedido' },
      api: { url: 'https://api.example.com', method: 'GET', responsePath: '' },
      delay: { ms: 500 },
      ai: {}
    }
    setNodes([...nodes, { id, type, position, data: defaults[type] ?? {} }])
  }

  const onSave = async () => {
    setError('')
    try {
      if (botId) {
        const res = await fetch(`${baseUrl}/bots/${botId}/flow`, {
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
      const res = await fetch(`${baseUrl}/bots/${botId}/flow`)
      if (!res.ok) throw new Error('Fluxo do bot não encontrado')
      const flow = await res.json()
      setNodes(flow.nodes || [])
      setEdges(flow.edges || [])
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar fluxo')
    }
  }

  const onPublish = async () => {
    if (!botId || !savedId) return
    try {
      const res = await fetch(`${baseUrl}/bots/${botId}/flow/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedId })
      })
      if (!res.ok) throw new Error('Falha ao publicar fluxo')
    } catch (e: any) {
      setError(e.message || 'Erro ao publicar')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center flex-wrap">
        <input className="border rounded p-2" placeholder="Bot ID (opcional)" value={botId} onChange={e=>setBotId(e.target.value)} />
        <button className="px-3 py-1 rounded bg-black text-white" onClick={onSave}>Salvar fluxo</button>
        <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={onLoadFlow} disabled={!botId}>Carregar fluxo do bot</button>
        {savedId && botId && <button className="px-3 py-1 rounded bg-green-700 text-white" onClick={onPublish}>Publicar fluxo</button>}
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>addNode('message')}>+ Mensagem</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>addNode('question')}>+ Pergunta</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>addNode('condition')}>+ Condição</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>addNode('api')}>+ API</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>addNode('delay')}>+ Delay</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>addNode('ai')}>+ IA</button>
        </div>
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