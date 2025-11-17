import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

type Props = { onSuccess: () => void }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function Login({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  const signIn = async () => {
    setLoading(true)
    setError(undefined)
    if (!supabaseUrl || !supabaseAnon) {
      setLoading(false)
      setError('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env do frontend e reinicie o servidor.')
      return
    }
    const supabase = createClient(supabaseUrl, supabaseAnon)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else onSuccess()
  }

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Entrar</h1>
      <input className="w-full border rounded p-2 mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border rounded p-2 mb-4" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {!supabaseUrl || !supabaseAnon ? (
        <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 mb-2 text-sm">
          Variáveis do Supabase ausentes. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env e reinicie.
        </div>
      ) : null}
      <button className="w-full bg-black text-white rounded p-2" onClick={signIn} disabled={loading}>
        {loading ? 'Carregando...' : 'Entrar'}
      </button>
    </div>
  )
}