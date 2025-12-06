import { useEffect, useState } from 'react'
import { getMe, updateMe } from '../lib/api'

export default function Profile() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const u = await getMe()
        setEmail(u?.email || '')
        setUsername(u?.username || '')
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar perfil')
      }
    })()
  }, [])

  const save = async () => {
    setLoading(true)
    setError(undefined)
    setSaved(false)
    try {
      const u = await updateMe({ email: email || undefined, username: username || undefined })
      setEmail(u?.email || email)
      setUsername(u?.username || username)
      setSaved(true)
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar perfil')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Meu Perfil</h1>
      <input className="w-full border rounded p-2 mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border rounded p-2 mb-4" placeholder="Nome de usuário" value={username} onChange={e=>setUsername(e.target.value)} />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {saved && <div className="text-green-700 mb-2">Perfil atualizado</div>}
      <button className="w-full bg-black text-white rounded p-2" onClick={save} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  )
}
