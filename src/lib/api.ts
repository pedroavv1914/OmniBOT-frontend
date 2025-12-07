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

export async function listConversations(params: { bot_id?: string, workspace_id?: string, limit?: number, offset?: number, status?: string }) {
  const qs = new URLSearchParams()
  if (params.bot_id) qs.set('bot_id', params.bot_id)
  if (params.workspace_id) qs.set('workspace_id', params.workspace_id)
  if (params.limit !== undefined) qs.set('limit', String(params.limit))
  if (params.offset !== undefined) qs.set('offset', String(params.offset))
  if (params.status) qs.set('status', params.status)
  const res = await fetch(`${baseUrl}/conversations?` + qs.toString(), { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao listar conversas')
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

export async function setWorkspacePlan(workspace_id: string, plan: 'free'|'pro'|'enterprise') {
  const res = await fetch(`${baseUrl}/workspaces/${encodeURIComponent(workspace_id)}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ plan })
  })
  if (!res.ok) throw new Error('Falha ao alterar plano')
  return res.json()
}

export async function getWorkspaceUsage(workspace_id: string) {
  const res = await fetch(`${baseUrl}/workspaces/${encodeURIComponent(workspace_id)}/usage`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao obter uso da workspace')
  return res.json()
}

export async function register(payload: { email: string, password: string, username?: string }) {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Falha no cadastro')
  return res.json()
}

export async function getMe() {
  const res = await fetch(`${baseUrl}/users/me`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao obter usuário')
  return res.json()
}

export async function updateMe(payload: { username?: string, email?: string }) {
  const res = await fetch(`${baseUrl}/users/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Falha ao atualizar usuário')
  return res.json()
}

export async function createCheckoutSession(workspace_id: string, plan: 'pro'|'enterprise') {
  const origin = window.location.origin
  const res = await fetch(`${baseUrl}/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ workspace_id, plan, success_url: `${origin}/?checkout=success`, cancel_url: `${origin}/?checkout=cancel` })
  })
  if (!res.ok) throw new Error('Falha ao criar sessão de checkout')
  return res.json()
}

export async function listWorkspaces() {
  const res = await fetch(`${baseUrl}/workspaces`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao listar workspaces')
  return res.json()
}

export async function createWorkspace(name: string) {
  const res = await fetch(`${baseUrl}/workspaces`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ name }) })
  if (!res.ok) throw new Error('Falha ao criar workspace')
  return res.json()
}

export const getActiveWorkspaceId = () => localStorage.getItem('workspace_id') || ''
export const setActiveWorkspaceId = (id: string) => localStorage.setItem('workspace_id', id)

export async function renameWorkspace(id: string, name: string) {
  const res = await fetch(`${baseUrl}/workspaces/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ name }) })
  if (!res.ok) throw new Error('Falha ao renomear workspace')
  return res.json()
}

export async function deleteWorkspace(id: string) {
  const res = await fetch(`${baseUrl}/workspaces/${id}`, { method: 'DELETE', headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Falha ao excluir workspace')
  return res.json()
}
export async function requestPasswordReset(email: string) {
  const origin = window.location.origin
  const res = await fetch(`${baseUrl}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, redirectTo: `${origin}/` })
  })
  if (!res.ok) throw new Error('Falha ao solicitar reset')
  return res.json()
}
