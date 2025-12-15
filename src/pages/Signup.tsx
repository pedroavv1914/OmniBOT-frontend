import { useState } from 'react'
import { register } from '../lib/api'

type Props = { onSuccess: () => void }

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Signup({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  const doSignup = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const r = await register({ email, password, username: username || undefined })
      const token = r?.token
      if (token) {
        localStorage.setItem('auth_token', token)
        onSuccess()
      } else if (r?.user_id) {
        setError('Cadastro iniciado. Verifique seu e-mail para confirmar.')
      } else {
        throw new Error('Resposta inesperada do cadastro')
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao cadastrar')
    }
    setLoading(false)
  }

  return (
    <div className="h-full flex items-center justify-center overflow-hidden">
      <div className="max-w-sm w-full mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Cadastrar</h1>
      <input className="w-full border rounded p-2 mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border rounded p-2 mb-2" placeholder="Nome de usuário (opcional)" value={username} onChange={e=>setUsername(e.target.value)} />
      <input className="w-full border rounded p-2 mb-4" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button className="w-full bg-black text-white rounded p-2" onClick={doSignup} disabled={loading}>
        {loading ? 'Carregando...' : 'Cadastrar'}
      </button>
      <div className="text-xs text-gray-500 mt-2">API: {apiUrl}</div>
      </div>
    </div>
  )
}
