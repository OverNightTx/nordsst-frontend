import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

const STATUS_STEPS = [
  { key: 'pendente', label: 'Job criado' },
  { key: 'processando', label: 'Analisando com IA' },
  { key: 'gerado', label: 'Documento gerado' },
]

const STATUS_PROGRESS = {
  pendente: 20,
  processando: 60,
  gerado: 100,
  erro: 100,
}

export default function Processando() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('pendente')
  const [numeroLaudo, setNumeroLaudo] = useState(null)
  const [error, setError] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const intervalRef = useRef(null)

  const fetchStatus = async () => {
    try {
      const res = await client.get(`/api/v1/documentos/status/${jobId}`)
      const data = res.data
      setStatus(data.status)

      if (data.numero_laudo) setNumeroLaudo(data.numero_laudo)

      if (data.status === 'gerado') {
        clearInterval(intervalRef.current)
        // Fetch download URL
        try {
          const dl = await client.get(`/api/v1/documentos/${jobId}/download`)
          setDownloadUrl(dl.data.download_url)
        } catch {
          // non-critical
        }
      } else if (data.status === 'erro') {
        clearInterval(intervalRef.current)
        setError(true)
      }
    } catch {
      // Keep polling
    }
  }

  useEffect(() => {
    fetchStatus()
    intervalRef.current = setInterval(fetchStatus, 3000)
    return () => clearInterval(intervalRef.current)
  }, [jobId])

  const progress = STATUS_PROGRESS[status] ?? 20
  const isGerado = status === 'gerado'
  const isErro = status === 'erro'

  return (
    <div className="max-w-lg mx-auto px-6 py-16 flex flex-col items-center">
      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
        isErro ? 'bg-ns-error/10 border border-ns-error/20' : 'bg-teal/10 border border-teal/20'
      }`}>
        {isGerado ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EB9B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        ) : isErro ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        ) : (
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EB9B6" strokeWidth="1.5">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        )}
      </div>

      <h1 className="font-display text-xl text-text-primary font-normal mb-2 text-center">
        {isGerado ? 'Laudo gerado com sucesso' : isErro ? 'Erro na geração' : 'Gerando laudo...'}
      </h1>

      {numeroLaudo && (
        <p className="text-text-muted text-sm mb-1 text-center">
          Nº {numeroLaudo}
        </p>
      )}

      <p className="text-text-dim text-xs text-center mb-8">
        {isGerado
          ? 'O documento DOCX está pronto para download'
          : isErro
          ? 'Ocorreu um erro durante o processamento'
          : 'Aguarde enquanto a IA analisa e gera o documento...'}
      </p>

      {/* Progress bar */}
      <div className="w-full mb-8">
        <div className="flex justify-between text-xs text-text-dim mb-2">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isErro ? 'bg-ns-error' : 'bg-teal'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full flex flex-col gap-2 mb-8">
        {STATUS_STEPS.map((step, idx) => {
          const stepProgress = idx === 0 ? 'pendente' : idx === 1 ? 'processando' : 'gerado'
          const isDone =
            (stepProgress === 'pendente') ||
            (stepProgress === 'processando' && (status === 'processando' || status === 'gerado')) ||
            (stepProgress === 'gerado' && status === 'gerado')

          return (
            <div key={step.key} className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-surface">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone && !isErro ? 'bg-teal/20' : 'bg-surface border border-teal/15'
              }`}>
                {isDone && !isErro && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#2EB9B6" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>
              <span className={`text-sm ${isDone && !isErro ? 'text-text-primary' : 'text-text-dim'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        {isGerado && downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-center">
            <svg className="mr-2 inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Baixar Documento
          </a>
        )}
        <button
          onClick={() => navigate('/historico')}
          className={isGerado ? 'btn-secondary w-full justify-center' : 'btn-primary w-full justify-center'}
        >
          Ver Histórico
        </button>
        {(isGerado || isErro) && (
          <button onClick={() => navigate('/novo')} className="btn-ghost w-full justify-center">
            Gerar Novo Laudo
          </button>
        )}
      </div>
    </div>
  )
}
