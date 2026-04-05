import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import FormEmpresa from '../components/FormEmpresa'

const TIPOS_LAUDO = [
  {
    id: 'LAUDO-BIO',
    titulo: 'Biológico',
    subtitulo: 'NR-15 Anexo 14',
    descricao: 'Agentes biológicos: lixo urbano, esgoto, saúde, veterinária...',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: 'LAUDO-FIS',
    titulo: 'Físico',
    subtitulo: 'NR-15 Anexos 1,2,3,8',
    descricao: 'Ruído, calor, vibração, radiação não ionizante...',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    id: 'LAUDO-QUI',
    titulo: 'Químico',
    subtitulo: 'NR-15 Anexos 11,12,13',
    descricao: 'Benzeno, tolueno, poeiras minerais, agentes específicos...',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6l1 9H8L9 3zM5 21h14a1 1 0 001-1v-1a6 6 0 00-12 0v1a1 1 0 001 1z"/>
      </svg>
    ),
  },
  {
    id: 'LAUDO-PERI',
    titulo: 'Periculosidade',
    subtitulo: 'NR-16',
    descricao: 'Explosivos, inflamáveis, energia elétrica, vigilância armada...',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
]

const defaultEmpresa = () => ({
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  endereco: '',
  atividade_economica: '',
  cnae: '',
  grau_risco: '3',
  ambientes_str: '',
  banheiros: '',
})

const defaultCargo = () => ({
  nome: '',
  cbo: '',
  atividades: '',
  jornada: '08h/dia — 44h/semana',
  qtde_funcionarios: 1,
  epis_fornecidos_str: '',
})

export default function NovoLaudo() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0=tipo, 1=empresa, 2=cargos
  const [tipoDoc, setTipoDoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [empresa, setEmpresa] = useState(defaultEmpresa())
  const [cargos, setCargos] = useState([defaultCargo()])

  const updateCargo = (idx, field, value) =>
    setCargos((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)))

  const addCargo = () => setCargos((prev) => [...prev, defaultCargo()])
  const removeCargo = (idx) => setCargos((prev) => prev.filter((_, i) => i !== idx))

  const handleGerar = async () => {
    setLoading(true)
    setError('')
    try {
      const grauRisco = parseInt(empresa.grau_risco, 10)
      const payload = {
        tipo_doc: tipoDoc,
        empresa: {
          razao_social: empresa.razao_social,
          nome_fantasia: empresa.nome_fantasia || '',
          cnpj: empresa.cnpj,
          endereco: empresa.endereco,
          cnae: empresa.cnae,
          grau_risco: Number.isNaN(grauRisco) ? 3 : grauRisco,
          ambientes: empresa.ambientes_str
            ? empresa.ambientes_str.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          banheiros: empresa.banheiros || '',
        },
        cargos: cargos.map((c) => ({
          nome: c.nome,
          cbo: c.cbo || '',
          atividades: c.atividades,
          jornada: c.jornada || '08h/dia — 44h/semana',
          qtde_funcionarios: parseInt(c.qtde_funcionarios, 10) || 1,
          epis_fornecidos: c.epis_fornecidos_str
            ? c.epis_fornecidos_str.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        })),
      }
      console.log('PAYLOAD:', JSON.stringify(payload, null, 2))
      const res = await client.post('/api/v1/documentos/gerar', payload)
      navigate(`/processando/${res.data.job_id}`)
    } catch (err) {
      console.error('ERRO 422 detail:', err?.response?.status, JSON.stringify(err?.response?.data, null, 2))
      setError('Erro ao iniciar geração. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const tipoAtual = TIPOS_LAUDO.find((t) => t.id === tipoDoc)

  const STEP_LABELS = ['Tipo', 'Empresa', 'Cargos']

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl text-text-primary font-normal mb-1">Novo Laudo</h1>
        <p className="text-text-muted text-sm">
          {tipoAtual ? `${tipoAtual.titulo} · ${tipoAtual.subtitulo}` : 'Selecione o tipo de laudo para começar'}
        </p>
      </div>

      {/* Steps indicator */}
      {step > 0 && (
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                step === s ? 'bg-teal text-bg-base'
                  : step > s ? 'bg-teal/20 text-teal border border-teal/30'
                  : 'bg-surface text-text-dim border border-teal/10'
              }`}>
                {step > s ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                ) : s}
              </div>
              <span className={`text-sm ${step === s ? 'text-text-primary' : 'text-text-dim'}`}>
                {STEP_LABELS[s]}
              </span>
              {s < 2 && <div className="w-8 h-px bg-teal/15 ml-1" />}
            </div>
          ))}
        </div>
      )}

      {/* Step 0 — Tipo de Laudo */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-3">
          {TIPOS_LAUDO.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => { setTipoDoc(tipo.id); setStep(1) }}
              className={`flex flex-col gap-3 p-5 rounded-xl border text-left transition-all duration-150 hover:border-teal/40 hover:bg-teal/5 ${
                tipoDoc === tipo.id
                  ? 'border-teal bg-teal/8 text-teal'
                  : 'border-teal/10 bg-bg-card text-text-muted'
              }`}
            >
              <div className={tipoDoc === tipo.id ? 'text-teal' : 'text-text-dim'}>
                {tipo.icon}
              </div>
              <div>
                <p className={`font-medium text-sm ${tipoDoc === tipo.id ? 'text-teal' : 'text-text-primary'}`}>
                  {tipo.titulo}
                </p>
                <p className="text-text-dim text-[11px] mt-0.5">{tipo.subtitulo}</p>
                <p className="text-text-dim text-xs mt-2 leading-relaxed">{tipo.descricao}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 1 — Empresa */}
      {step === 1 && (
        <div className="bg-bg-card border border-teal/10 rounded-xl p-6 flex flex-col gap-4">
          <FormEmpresa empresa={empresa} onChange={setEmpresa} />
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(0)} className="btn-ghost flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar
            </button>
            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!empresa.razao_social.trim() || !empresa.cnpj.trim()}
            >
              Próximo
              <svg className="ml-2 inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Cargos */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {cargos.map((cargo, idx) => (
            <div key={idx} className="bg-bg-card border border-teal/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary text-sm font-medium">Cargo {idx + 1}</h3>
                {cargos.length > 1 && (
                  <button onClick={() => removeCargo(idx)} className="text-ns-error text-xs hover:underline">
                    Remover
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Cargo</label>
                  <input className="input-field" value={cargo.nome}
                    onChange={(e) => updateCargo(idx, 'nome', e.target.value)}
                    placeholder="Ex: Operador de Prensa" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-muted text-xs font-medium tracking-wide uppercase">CBO</label>
                  <input className="input-field" value={cargo.cbo}
                    onChange={(e) => updateCargo(idx, 'cbo', e.target.value)}
                    placeholder="0000-00" />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Atividades Exercidas</label>
                  <textarea className="input-field h-20 py-3 resize-none" value={cargo.atividades}
                    onChange={(e) => updateCargo(idx, 'atividades', e.target.value)}
                    placeholder="Descreva as atividades com exposição ao agente de risco..." />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Jornada</label>
                  <input className="input-field" value={cargo.jornada}
                    onChange={(e) => updateCargo(idx, 'jornada', e.target.value)}
                    placeholder="08h/dia — 44h/semana" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Nº de Funcionários</label>
                  <input className="input-field" type="number" min={1}
                    value={cargo.qtde_funcionarios}
                    onChange={(e) => updateCargo(idx, 'qtde_funcionarios', e.target.value)} />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-text-muted text-xs font-medium tracking-wide uppercase">EPIs Fornecidos</label>
                  <input className="input-field" value={cargo.epis_fornecidos_str}
                    onChange={(e) => updateCargo(idx, 'epis_fornecidos_str', e.target.value)}
                    placeholder="Ex: Luvas nitrílicas CA 38662, Máscara PFF2 CA 12345" />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addCargo} className="btn-secondary w-full justify-center">
            <svg className="mr-2 inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Adicionar Cargo
          </button>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-ns-error/8 border-l-2 border-ns-error rounded-md text-ns-error text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar
            </button>
            <button
              className="btn-primary"
              onClick={handleGerar}
              disabled={loading || cargos.some((c) => !c.nome.trim() || !c.atividades.trim())}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  Gerar Laudo
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
