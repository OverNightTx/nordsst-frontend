import { useState } from 'react'

function useToast() {
  const [toast, setToast] = useState(null)
  const show = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }
  return { toast, show }
}

export default function FormEmpresa({ empresa, onChange }) {
  const [cnpjLoading, setCnpjLoading] = useState(false)
  const { toast, show: showToast } = useToast()

  const update = (field, value) => onChange({ ...empresa, [field]: value })

  const handleCnpjBlur = async () => {
    const digits = empresa.cnpj.replace(/\D/g, '')
    if (digits.length !== 14) return

    setCnpjLoading(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      if (!res.ok) {
        showToast('CNPJ não encontrado', 'error')
        return
      }
      const data = await res.json()
      const parts = [data.logradouro, data.numero, data.bairro].filter(Boolean)
      const endereco = parts.join(', ') + (data.municipio ? ` — ${data.municipio}` : '') + (data.uf ? `/${data.uf}` : '')
      const cnae = data.cnae_fiscal
        ? `${data.cnae_fiscal} — ${data.cnae_fiscal_descricao ?? ''}`
        : empresa.cnae

      onChange({
        ...empresa,
        razao_social: data.razao_social ?? empresa.razao_social,
        nome_fantasia: data.nome_fantasia ?? empresa.nome_fantasia,
        endereco: endereco || empresa.endereco,
        cnae: cnae,
      })
      showToast('Dados preenchidos automaticamente')
    } catch {
      showToast('Erro ao consultar CNPJ', 'error')
    } finally {
      setCnpjLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-ns-error/10 border border-ns-error/30 text-ns-error'
              : 'bg-teal/10 border border-teal/30 text-teal'
          }`}
        >
          {toast.type === 'error' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* CNPJ com spinner */}
        <div className="flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">CNPJ</label>
          <div className="relative">
            <input
              className="input-field pr-9"
              value={empresa.cnpj}
              onChange={(e) => update('cnpj', e.target.value)}
              onBlur={handleCnpjBlur}
              placeholder="00.000.000/0000-00"
            />
            {cnpjLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin text-teal" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Grau de Risco</label>
          <select className="input-field" value={empresa.grau_risco} onChange={(e) => update('grau_risco', e.target.value)}>
            {['1','2','3','4'].map((g) => (
              <option key={g} value={g}>Grau {g}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Razão Social</label>
          <input className="input-field" value={empresa.razao_social}
            onChange={(e) => update('razao_social', e.target.value)}
            placeholder="Nome completo da empresa" />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Nome Fantasia</label>
          <input className="input-field" value={empresa.nome_fantasia}
            onChange={(e) => update('nome_fantasia', e.target.value)}
            placeholder="Nome fantasia (opcional)" />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Endereço</label>
          <input className="input-field" value={empresa.endereco}
            onChange={(e) => update('endereco', e.target.value)}
            placeholder="Rua, número, bairro, cidade — UF" />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Atividade Econômica</label>
          <input className="input-field" value={empresa.atividade_economica}
            onChange={(e) => update('atividade_economica', e.target.value)}
            placeholder="Descrição da atividade principal" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">CNAE</label>
          <input className="input-field" value={empresa.cnae}
            onChange={(e) => update('cnae', e.target.value)}
            placeholder="0000-0/00" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Ambientes Avaliados</label>
          <input className="input-field" value={empresa.ambientes_str}
            onChange={(e) => update('ambientes_str', e.target.value)}
            placeholder="Ex: Salão, Cozinha, Depósito" />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-text-muted text-xs font-medium tracking-wide uppercase">Instalações Sanitárias</label>
          <input className="input-field" value={empresa.banheiros}
            onChange={(e) => update('banheiros', e.target.value)}
            placeholder="Ex: 01 banheiro de funcionários + 02 banheiros de clientes" />
        </div>
      </div>
    </div>
  )
}
