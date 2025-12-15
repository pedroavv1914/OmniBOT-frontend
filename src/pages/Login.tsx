import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'
import { requestPasswordReset } from '../lib/api'

type Props = { onSuccess: () => void }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [resetInfo, setResetInfo] = useState<string | undefined>()

  const signIn = async () => {
    setLoading(true)
    setError(undefined)
    try {
      // tenta primeiro pelo backend
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const r = await res.json()
        if (r?.token) {
          localStorage.setItem('auth_token', r.token)
          onSuccess()
          setLoading(false)
          return
        }
      }
      // se backend falhar e houver Supabase, tenta Supabase
      if (supabaseUrl && supabaseAnon) {
        const supabase = createClient(supabaseUrl, supabaseAnon)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token
        if (!token) throw new Error('Sessão não iniciada')
        localStorage.setItem('auth_token', token)
        onSuccess()
      } else {
        throw new Error('Falha no login (backend)')
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao entrar')
    }
    setLoading(false)
  }

  const resetPassword = async () => {
    setLoading(true)
    setError(undefined)
    setResetInfo(undefined)
    try {
      await requestPasswordReset(email)
      setResetInfo('Se o e-mail existir, enviamos instruções de recuperação.')
    } catch (e: any) {
      setError(e?.message || 'Erro ao solicitar reset')
    }
    setLoading(false)
  }

  return (
    <div className="h-full bg-[#0B0F19] text-white flex items-center justify-center px-4 overflow-hidden relative">
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
            <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
            <p className="mt-2 text-sm text-white/70">
              Acesse seu painel e gerencie seus bots multicanal.
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
                <label className="mb-2 block text-sm text-white/80">Senha</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  placeholder="Digite sua senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    className="text-sm text-blue-300 hover:text-blue-200 transition disabled:opacity-50"
                    onClick={resetPassword}
                    disabled={loading || !email}
                    title={!email ? 'Informe seu e-mail para recuperar a senha' : 'Recuperar senha'}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {!supabaseUrl || !supabaseAnon ? (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                  Variáveis do Supabase ausentes no frontend. Tentando login pelo backend.
                </div>
              ) : null}

              {resetInfo && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {resetInfo}
                </div>
              )}

              <button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(45,127,249,0.25)] transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={signIn}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Entrar'}
              </button>

              <div className="text-center text-sm text-white/70">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  className="text-blue-300 hover:text-blue-200 transition"
                  onClick={() => { localStorage.setItem('app_route', 'signup'); window.dispatchEvent(new CustomEvent('app:navigate', { detail: { route: 'signup' } })) }}
                >
                  Criar conta
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 border-t border-white/10 px-8 py-6 text-center">
            <div className="text-xs text-white/55">
              Ao entrar, você concorda com nossos{' '}
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
