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

  const onSave = async () => {
    setError('')
    try {
      const res = await saveFlow({ nodes, edges })
      setSavedId(res.id)
    } catch (e: any) {
      setError(e.message || 'Erro')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded bg-black text-white" onClick={onSave}>Salvar fluxo</button>
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