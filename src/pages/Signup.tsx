import { useState } from 'react'
import { register } from '../lib/api'

type Props = { onSuccess: () => void }

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Signup({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

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

  const goToLogin = () => {
    localStorage.setItem('app_route', 'login')
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { route: 'login' } }))
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.55)]">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-300 shadow-[0_10px_30px_rgba(45,127,249,0.35)]" />
              <div className="text-2xl font-semibold tracking-tight">
                OmniBot<span className="text-cyan-300">AI</span>
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Criar conta</h1>
            <p className="mt-2 text-sm text-white/70">
              Crie sua conta e comece a automatizar seu atendimento multicanal.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 pb-8">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/80">Endereço de e-mail</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  placeholder="seuemail@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">Nome de usuário (opcional)</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  placeholder="Ex: pedro.ribeiro"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">Senha</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  placeholder="Crie uma senha segura"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <p className="mt-2 text-xs text-white/55">
                  Dica: use pelo menos 8 caracteres, com letras e números.
                </p>
              </div>

              {error && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    error.includes('Verifique seu e-mail')
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                      : 'border border-red-500/30 bg-red-500/10 text-red-200'
                  }`}
                >
                  {error}
                </div>
              )}

              <button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(45,127,249,0.25)] transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={doSignup}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Cadastrar'}
              </button>

              <div className="text-center text-sm text-white/70">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  className="text-blue-300 hover:text-blue-200 transition"
                  onClick={goToLogin}
                >
                  Voltar para login
                </button>
              </div>

              <div className="text-center text-xs text-white/35">API: {apiUrl}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 border-t border-white/10 px-8 py-6 text-center">
            <div className="text-xs text-white/55">
              Ao se cadastrar, você concorda com nossos{' '}
              <a className="text-blue-300 hover:text-blue-200 transition" href="/termos">
                Termos
              </a>{' '}
              e{' '}
              <a className="text-blue-300 hover:text-blue-200 transition" href="/privacidade">
                Política de Privacidade
              </a>
              .
            </div>
            <div className="text-xs text-white/40">© {new Date().getFullYear()} OmniBotAI. Todos os direitos reservados.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
