import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const STATUS_BADGE = {
  gerado: 'badge-success',
  processando: 'badge-warning',
  pendente: 'badge-teal',
  erro: 'badge-error',
}

const STATUS_LABEL = {
  gerado: 'Gerado',
  processando: 'Processando',
  pendente: 'Pendente',
  erro: 'Erro',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Historico() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)
  const limit = 10

  const fetchDocs = async (p = 1) => {
    setLoading(true)
    try {
      const res = await client.get('/api/v1/documentos/', { params: { page: p, limit } })
      setDocs(res.data.items ?? [])
      setTotal(res.data.total ?? 0)
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs(page)
  }, [page])

  const handleDownload = async (jobId) => {
    setDownloadingId(jobId)
    try {
      const res = await client.get(`/api/v1/documentos/${jobId}/download`)
      window.open(res.data.download_url, '_blank')
    } catch {
      // Could show a toast in the future
    } finally {
      setDownloadingId(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-text-primary font-normal mb-1">Histórico</h1>
          <p className="text-text-muted text-sm">
            {total > 0 ? `${total} documento${total !== 1 ? 's' : ''} gerado${total !== 1 ? 's' : ''}` : 'Nenhum documento ainda'}
          </p>
        </div>
        <button onClick={() => navigate('/novo')} className="btn-primary flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Novo Laudo
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-teal/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-text-dim text-sm">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Carregando...
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B6178" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              </svg>
            </div>
            <p className="text-text-muted text-sm">Nenhum laudo gerado ainda</p>
            <button onClick={() => navigate('/novo')} className="btn-secondary mt-1">
              Gerar primeiro laudo
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-teal/8">
                <th className="text-left px-6 py-3 text-text-dim text-xs font-medium uppercase tracking-wide">Nº Laudo</th>
                <th className="text-left px-6 py-3 text-text-dim text-xs font-medium uppercase tracking-wide">Empresa</th>
                <th className="text-left px-6 py-3 text-text-dim text-xs font-medium uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-text-dim text-xs font-medium uppercase tracking-wide">Data</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, idx) => (
                <tr
                  key={doc.job_id}
                  className={`border-b border-teal/5 hover:bg-surface/50 transition-colors ${idx === docs.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-6 py-4 text-sm text-text-primary font-mono">
                    {doc.numero_laudo ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted max-w-[200px] truncate">
                    {doc.empresa_nome ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={STATUS_BADGE[doc.status] ?? 'badge-teal'}>
                      {STATUS_LABEL[doc.status] ?? doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-dim whitespace-nowrap">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {doc.status === 'gerado' ? (
                      <button
                        onClick={() => handleDownload(doc.job_id)}
                        disabled={downloadingId === doc.job_id}
                        className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 ml-auto"
                      >
                        {downloadingId === doc.job_id ? (
                          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                          </svg>
                        )}
                        Download
                      </button>
                    ) : doc.status === 'processando' || doc.status === 'pendente' ? (
                      <button
                        onClick={() => navigate(`/processando/${doc.job_id}`)}
                        className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        Ver status
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-text-dim text-xs">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
