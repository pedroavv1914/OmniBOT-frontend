import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'

const initialNodes = []
const initialEdges = []

export default function FlowBuilder() {
  return (
    <div className="h-[70vh] bg-white rounded shadow">
      <ReactFlow nodes={initialNodes} edges={initialEdges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}