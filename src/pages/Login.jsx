import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../store/auth'
import client from '../api/client'

export default function Login() {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setLoading(true)
    setError('')

    try {
      // Valida a key tentando listar documentos
      auth.set(apiKey.trim())
      await client.get('/api/v1/documentos/')
      navigate('/historico')
    } catch (err) {
      auth.clear()
      const status = err.response?.status
      if (status === 401 || status === 403) {
        setError('API key inválida. Verifique e tente novamente.')
      } else {
        setError('Erro ao conectar com o servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(46,185,182,0.10) 0%, transparent 65%),
          linear-gradient(rgba(46,185,182,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,185,182,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 48px 48px, 48px 48px',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal/10 border border-teal/20 rounded-xl mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2EB9B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl text-text-primary font-normal mb-1">Nord SST</h1>
          <p className="text-text-muted text-sm">Gestão de Documentos SST</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-teal/10 rounded-xl p-8 shadow-lg">
          <h2 className="text-text-primary text-base font-medium mb-1">Entrar</h2>
          <p className="text-text-muted text-sm mb-6">Informe sua API key para acessar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-muted text-xs font-medium tracking-wide uppercase">
                API Key
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="nordsst_live_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-ns-error/8 border-l-2 border-ns-error rounded-md text-ns-error text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Verificando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-dim text-xs mt-6">
          Segurança e Saúde do Trabalho · Norte do Brasil
        </p>
      </div>
    </div>
  )
}
