import { useState, useMemo } from 'react'
import { getHealth, getDevToken } from '../lib/api'

export default function Config() {
  const [health, setHealth] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [tokenPresent, setTokenPresent] = useState<boolean>(!!localStorage.getItem('auth_token'))

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const claims = useMemo(() => {
    const t = localStorage.getItem('auth_token')
    if (!t) return undefined as any
    const parts = t.split('.')
    if (parts.length !== 3) return undefined as any
    try {
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : ''
      const json = atob(b64 + pad)
      return JSON.parse(json)
    } catch {
      return undefined as any
    }
  }, [tokenPresent])

  const checkHealth = async () => {
    setError('')
    setHealth('')
    try {
      const r = await getHealth()
      setHealth(JSON.stringify(r))
    } catch (e: any) {
      setError(e.message || 'Erro no health')
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setTokenPresent(false)
  }

  const getTokenDev = async () => {
    setError('')
    try {
      const r = await getDevToken()
      if (r?.token) {
        localStorage.setItem('auth_token', r.token)
        setTokenPresent(true)
      } else {
        setError('Token não recebido')
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao obter token')
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Ambiente</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">API URL</div>
            <div className="font-mono text-sm">{apiUrl}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Supabase URL</div>
            <div className="font-mono text-sm">{supabaseUrl || 'não definido'}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Supabase ANON</div>
            <div className="font-mono text-sm">{supabaseAnon ? 'definido' : 'não definido'}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Token de sessão</div>
            <div className="font-mono text-sm">{tokenPresent ? 'presente' : 'ausente'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="font-semibold">Verificações</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={checkHealth}>Testar /health</button>
          <button className="px-3 py-1 rounded bg-green-700 text-white" onClick={getTokenDev}>Obter token dev</button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={logout} disabled={!tokenPresent}>Logout</button>
        </div>
        {health && <div className="text-green-700 bg-green-100 border border-green-300 rounded p-2 text-sm">{health}</div>}
        {error && <div className="text-red-700 bg-red-100 border border-red-300 rounded p-2 text-sm">{error}</div>}
        {claims && (
          <div className="mt-2">
            <div className="text-sm text-gray-600">Claims</div>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(claims, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}