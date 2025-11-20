import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

type Props = { onSuccess: () => void }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  const signIn = async () => {
    setLoading(true)
    setError(undefined)
    try {
      if (!supabaseUrl || !supabaseAnon) {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email || 'dev', password })
        })
        if (!res.ok) throw new Error('Falha no login (backend)')
        const r = await res.json()
        if (r?.token) {
          localStorage.setItem('auth_token', r.token)
          onSuccess()
        } else {
          throw new Error('Token não recebido')
        }
      } else {
        const supabase = createClient(supabaseUrl, supabaseAnon)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token
        if (token) localStorage.setItem('auth_token', token)
        onSuccess()
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao entrar')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Entrar</h1>
      <input className="w-full border rounded p-2 mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border rounded p-2 mb-4" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {!supabaseUrl || !supabaseAnon ? (
        <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 mb-2 text-sm">
          Variáveis do Supabase ausentes no frontend. Tentando login pelo backend.
        </div>
      ) : null}
      <button className="w-full bg-black text-white rounded p-2" onClick={signIn} disabled={loading}>
        {loading ? 'Carregando...' : 'Entrar'}
      </button>
    </div>
  )
}