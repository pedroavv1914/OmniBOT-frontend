const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
function authHeader() {
  const t = localStorage.getItem('auth_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function getHealth() {
  const res = await fetch(`${baseUrl}/health`)
  if (!res.ok) throw new Error('Falha no health')
  return res.json()
}

export async function getDevToken() {
  const res = await fetch(`${baseUrl}/auth/dev-token`, { method: 'POST' })
  if (!res.ok) throw new Error('Falha ao obter token de dev')
  return res.json()
}

export async function saveFlow(payload: any) {
  const res = await fetch(`${baseUrl}/bot_flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Falha ao salvar fluxo')
  return res.json()
}

export async function getFlow(id: string) {
  const res = await fetch(`${baseUrl}/bot_flows/${id}`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Fluxo não encontrado')
  return res.json()
}

export async function createConversation(payload: { bot_id: string, channel: string, contact_identifier: string }) {
  const res = await fetch(`${baseUrl}/conversations`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Falha ao criar conversa')
  return res.json()
}

export async function listMessages(conversation_id: string) {
  const res = await fetch(`${baseUrl}/conversations/${conversation_id}/messages`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao obter mensagens')
  return res.json()
}

export function streamConversation(conversation_id: string) {
  return new EventSource(`${baseUrl}/conversations/${conversation_id}/stream`)
}

export async function sendIncomingEvent(payload: { conversation_id: string, text: string }) {
  const res = await fetch(`${baseUrl}/events/incoming`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Falha ao enfileirar evento')
  return res.json()
}

export async function sendMessage(conversation_id: string, payload: any) {
  const res = await fetch(`${baseUrl}/conversations/${conversation_id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Falha ao enviar mensagem')
  return res.json()
}

export async function createBot(payload: { workspace_id: string, name: string, description?: string }) {
  const res = await fetch(`${baseUrl}/bots`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Falha ao criar bot')
  return res.json()
}

export async function listBots(workspace_id: string) {
  const res = await fetch(`${baseUrl}/bots?workspace_id=${encodeURIComponent(workspace_id)}`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao listar bots')
  return res.json()
}

export async function listFlowsByBot(botId: string) {
  const res = await fetch(`${baseUrl}/bots/${botId}/flows`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao listar flows do bot')
  return res.json()
}