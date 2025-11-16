import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

const data = [
  { name: 'Seg', mensagens: 40 },
  { name: 'Ter', mensagens: 24 },
  { name: 'Qua', mensagens: 32 },
  { name: 'Qui', mensagens: 50 },
  { name: 'Sex', mensagens: 30 },
]

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Mensagens por dia</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="mensagens" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Bots</div>
        <ul className="space-y-2">
          <li className="border p-2 rounded">Bot Exemplo</li>
        </ul>
      </div>
    </div>
  )
}