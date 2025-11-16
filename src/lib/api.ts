const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function saveFlow(payload: any) {
  const res = await fetch(`${baseUrl}/bot_flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Falha ao salvar fluxo')
  return res.json()
}

export async function getFlow(id: string) {
  const res = await fetch(`${baseUrl}/bot_flows/${id}`)
  if (!res.ok) throw new Error('Fluxo não encontrado')
  return res.json()
}