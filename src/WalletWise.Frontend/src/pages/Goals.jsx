import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import TopBar from '../components/TopBar'
import MiniChart, { calcTrend, chartAxisLabels } from '../components/MiniChart'

const _now = new Date()

const PAISES = [
  { pais: 'Brasil',              moeda: 'BRL', bandeira: '🇧🇷' },
  { pais: 'África do Sul',      moeda: 'ZAR', bandeira: '🇿🇦' },
  { pais: 'Arábia Saudita',     moeda: 'SAR', bandeira: '🇸🇦' },
  { pais: 'Argentina',          moeda: 'ARS', bandeira: '🇦🇷' },
  { pais: 'Austrália',          moeda: 'AUD', bandeira: '🇦🇺' },
  { pais: 'Bolívia',            moeda: 'BOB', bandeira: '🇧🇴' },
  { pais: 'Canadá',             moeda: 'CAD', bandeira: '🇨🇦' },
  { pais: 'Chile',              moeda: 'CLP', bandeira: '🇨🇱' },
  { pais: 'China',              moeda: 'CNY', bandeira: '🇨🇳' },
  { pais: 'Colômbia',           moeda: 'COP', bandeira: '🇨🇴' },
  { pais: 'Coreia do Sul',      moeda: 'KRW', bandeira: '🇰🇷' },
  { pais: 'Dinamarca',          moeda: 'DKK', bandeira: '🇩🇰' },
  { pais: 'Egito',              moeda: 'EGP', bandeira: '🇪🇬' },
  { pais: 'Emirados Árabes',    moeda: 'AED', bandeira: '🇦🇪' },
  { pais: 'Estados Unidos',     moeda: 'USD', bandeira: '🇺🇸' },
  { pais: 'Filipinas',          moeda: 'PHP', bandeira: '🇵🇭' },
  { pais: 'Hong Kong',          moeda: 'HKD', bandeira: '🇭🇰' },
  { pais: 'Hungria',            moeda: 'HUF', bandeira: '🇭🇺' },
  { pais: 'Índia',              moeda: 'INR', bandeira: '🇮🇳' },
  { pais: 'Indonésia',          moeda: 'IDR', bandeira: '🇮🇩' },
  { pais: 'Israel',             moeda: 'ILS', bandeira: '🇮🇱' },
  { pais: 'Japão',              moeda: 'JPY', bandeira: '🇯🇵' },
  { pais: 'Kuwait',             moeda: 'KWD', bandeira: '🇰🇼' },
  { pais: 'Malásia',            moeda: 'MYR', bandeira: '🇲🇾' },
  { pais: 'Marrocos',           moeda: 'MAD', bandeira: '🇲🇦' },
  { pais: 'México',             moeda: 'MXN', bandeira: '🇲🇽' },
  { pais: 'Nigéria',            moeda: 'NGN', bandeira: '🇳🇬' },
  { pais: 'Noruega',            moeda: 'NOK', bandeira: '🇳🇴' },
  { pais: 'Nova Zelândia',      moeda: 'NZD', bandeira: '🇳🇿' },
  { pais: 'Paquistão',          moeda: 'PKR', bandeira: '🇵🇰' },
  { pais: 'Paraguai',           moeda: 'PYG', bandeira: '🇵🇾' },
  { pais: 'Peru',               moeda: 'PEN', bandeira: '🇵🇪' },
  { pais: 'Polônia',            moeda: 'PLN', bandeira: '🇵🇱' },
  { pais: 'Qatar',              moeda: 'QAR', bandeira: '🇶🇦' },
  { pais: 'Reino Unido',        moeda: 'GBP', bandeira: '🇬🇧' },
  { pais: 'Rep. Tcheca',        moeda: 'CZK', bandeira: '🇨🇿' },
  { pais: 'Rússia',             moeda: 'RUB', bandeira: '🇷🇺' },
  { pais: 'Singapura',          moeda: 'SGD', bandeira: '🇸🇬' },
  { pais: 'Suécia',             moeda: 'SEK', bandeira: '🇸🇪' },
  { pais: 'Suíça',              moeda: 'CHF', bandeira: '🇨🇭' },
  { pais: 'Tailândia',          moeda: 'THB', bandeira: '🇹🇭' },
  { pais: 'Taiwan',             moeda: 'TWD', bandeira: '🇹🇼' },
  { pais: 'Turquia',            moeda: 'TRY', bandeira: '🇹🇷' },
  { pais: 'Ucrânia',            moeda: 'UAH', bandeira: '🇺🇦' },
  { pais: 'Uruguai',            moeda: 'UYU', bandeira: '🇺🇾' },
  { pais: 'Vietnã',             moeda: 'VND', bandeira: '🇻🇳' },
  { pais: 'Zona do Euro',       moeda: 'EUR', bandeira: '🇪🇺' },
]

const REC = {
  ComprarAgora: { textCls: 'text-secondary', bgCls: 'bg-secondary/10 border-secondary/20', icon: 'check_circle', label: 'Bom momento para comprar', chartCls: 'text-secondary' },
  Neutro:       { textCls: 'text-accent',    bgCls: 'bg-accent/10 border-accent/20',       icon: 'remove_circle', label: 'Câmbio estável — neutro', chartCls: 'text-accent'   },
  Aguardar:     { textCls: 'text-error',     bgCls: 'bg-error/10 border-error/20',         icon: 'schedule',      label: 'Aguarde — câmbio alto',   chartCls: 'text-error'    },
}

const EMPTY_FORM = { descricao: '', valorAlvo: '', moeda: 'USD', pais: 'Estados Unidos', bandeira: '🇺🇸', prazo: '' }
const PAIS_MAP = Object.fromEntries(PAISES.map(p => [p.pais, p]))

const fmtBRL = v => {
  const n = Number(v ?? 0)
  const dec = n < 0.01 ? 6 : n < 1 ? 4 : 2
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: dec, maximumFractionDigits: dec })
}
const fmtNum = v => Number(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

function inputCls() {
  return 'w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary transition-colors'
}
function labelCls() {
  return 'block text-xs font-bold text-outline uppercase tracking-wider mb-1.5'
}

function ExchangePanel({ analise, moeda, loading, onRetry, chartId = 'panel' }) {
  const rec    = analise ? REC[analise.recomendacao] : null
  const pct    = analise ? ((analise.cotacaoAtual - analise.mediaUltimos30Dias) / analise.mediaUltimos30Dias * 100) : null
  const trend  = calcTrend(analise?.historico)
  const labels = chartAxisLabels(analise?.historico?.length ?? 30)

  return (
    <div className="bg-surface-container-low/60 p-5 rounded-xl border border-outline-variant/70 flex flex-col gap-4">
      {loading && !analise ? (
        <div className="space-y-3 animate-pulse">
          {[55, 80, 100, 100, 65].map((w, i) => (
            <div key={i} className="h-4 bg-surface-container-high rounded" style={{ width: `${w}%` }} />
          ))}
          <div className="h-20 bg-surface-container-high rounded" />
        </div>
      ) : !analise ? (
        <div className="flex flex-col items-center justify-center h-full py-4 gap-2 text-center">
          <span className="material-symbols-outlined text-3xl text-outline">wifi_off</span>
          <p className="text-xs text-outline">Sem dados de câmbio disponíveis</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 flex items-center gap-1 text-xs text-primary font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs text-outline uppercase font-semibold tracking-wider mb-1">Cotação Atual {moeda}/BRL</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface tabular-nums">{fmtBRL(analise.cotacaoAtual)}</span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${pct < -1 ? 'text-secondary' : pct > 1 ? 'text-error' : 'text-accent'}`}>
                <span className="material-symbols-outlined text-[13px]">{pct >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                {Math.abs(pct).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-[80px] w-full">
            {analise.historico?.length >= 2
              ? <MiniChart historico={analise.historico} colorCls={rec?.chartCls ?? 'text-secondary'} chartId={chartId} />
              : <div className="h-full flex items-center justify-center rounded-lg bg-surface-container-high/40">
                  <p className="text-[10px] text-outline text-center">Reinicie o backend para carregar o gráfico</p>
                </div>
            }
          </div>

          <div className="flex justify-between text-[10px] text-outline font-medium -mt-2 px-0.5">
            {labels.map((l, i) => <span key={i}>{l}</span>)}
          </div>

          {trend && (
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trend.dot}`} />
              <p className="text-xs text-on-surface-variant">{trend.text}</p>
            </div>
          )}

          <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${rec?.bgCls ?? 'bg-surface-container border-outline-variant'}`}>
            <span className={`material-symbols-outlined icon-filled text-[18px] flex-shrink-0 ${rec?.textCls ?? 'text-outline'}`}>{rec?.icon ?? 'info'}</span>
            <p className={`text-xs font-bold ${rec?.textCls ?? 'text-outline'}`}>{rec?.label ?? 'Analisando...'}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function Goals() {
  const [month, setMonth]               = useState({ year: _now.getFullYear(), month: _now.getMonth() })
  const [metas, setMetas]               = useState([])
  const [analises, setAnalises]         = useState({})
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [formError, setFormError]       = useState(null)
  const [aporteId, setAporteId]         = useState(null)
  const [aporteVal, setAporteVal]       = useState('')
  const [formAnalise, setFormAnalise]   = useState(null)
  const [formAnaliseLoading, setFormAnaliseLoading] = useState(false)

  const [paisSearch, setPaisSearch] = useState('')
  const [valorMode, setValorMode]   = useState('local') // 'local' | 'brl'

  useEffect(() => {
    if (!paisSearch.trim()) return
    const filtered = PAISES.filter(p =>
      p.pais.toLowerCase().includes(paisSearch.toLowerCase()) ||
      p.moeda.toLowerCase().includes(paisSearch.toLowerCase())
    )
    if (filtered.length === 1) {
      const p = filtered[0]
      setForm(f => ({ ...f, pais: p.pais, moeda: p.moeda, bandeira: p.bandeira }))
      setValorMode('local')
      setPaisSearch('')
    }
  }, [paisSearch])

  // Edit
  const [editId, setEditId]       = useState(null)
  const [editForm, setEditForm]   = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState(null)

  // Delete
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting]               = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const mts = await api.listarMetas()
      setMetas(mts ?? [])
      const moedas = [...new Set((mts ?? []).filter(m => m.moeda !== 'BRL').map(m => m.moeda))]
      if (moedas.length > 0) {
        const settled = await Promise.allSettled(moedas.map(m => api.analiseCambio(m)))
        const obj = {}
        moedas.forEach((m, i) => { if (settled[i].status === 'fulfilled') obj[m] = settled[i].value })
        setAnalises(obj)
      }
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!showForm || form.moeda === 'BRL') { setFormAnalise(null); return }
    setFormAnaliseLoading(true)
    api.analiseCambio(form.moeda)
      .then(setFormAnalise).catch(() => setFormAnalise(null))
      .finally(() => setFormAnaliseLoading(false))
  }, [showForm, form.moeda])

  function setPaisField(paisName) {
    const p = PAIS_MAP[paisName]
    if (p) {
      setForm(f => ({ ...f, pais: p.pais, moeda: p.moeda, bandeira: p.bandeira }))
      setValorMode('local')
    }
  }

  function calcMonthly(meta) {
    const analise = analises[meta.moeda]
    if (!analise && meta.moeda !== 'BRL') return null
    const meses = Math.max(1, Math.round((new Date(meta.dataAlvo) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    const restante = meta.valorAlvo - meta.valorAcumulado
    if (restante <= 0) return 0
    return (restante * (analise?.cotacaoAtual ?? 1)) / meses
  }

  function openEdit(meta) {
    const prazo = new Date(meta.dataAlvo)
    const mm = String(prazo.getMonth() + 1).padStart(2, '0')
    setEditId(meta.id)
    setEditForm({ descricao: meta.descricao, valorAlvo: String(meta.valorAlvo), moeda: meta.moeda, prazo: `${prazo.getFullYear()}-${mm}` })
    setEditError(null)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true); setFormError(null)
    try {
      const nome = form.descricao.trim() || `Viagem para ${form.pais}`
      let valorAlvo = parseFloat(form.valorAlvo)
      if (valorMode === 'brl' && form.moeda !== 'BRL' && formAnalise?.cotacaoAtual) {
        valorAlvo = valorAlvo / formAnalise.cotacaoAtual
      }
      await api.criarMeta({ nome, descricao: nome, valorAlvo, moeda: form.moeda, dataAlvo: new Date(form.prazo + '-01').toISOString() })
      setShowForm(false); setForm(EMPTY_FORM); setPaisSearch(''); setValorMode('local'); load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  async function handleEdit(e) {
    e.preventDefault()
    setEditSaving(true); setEditError(null)
    try {
      const meta = metas.find(m => m.id === editId)
      await api.atualizarMeta(editId, {
        nome: editForm.descricao,
        descricao: editForm.descricao,
        valorAlvo: parseFloat(editForm.valorAlvo),
        dataAlvo: new Date(editForm.prazo + '-01').toISOString(),
      })
      setEditId(null); setEditForm(null); load()
    } catch (err) { setEditError(err.message) }
    finally { setEditSaving(false) }
  }

  async function handleDelete(id) {
    setDeleting(true)
    try {
      await api.excluirMeta(id)
      setConfirmDeleteId(null); load()
    } catch {} finally { setDeleting(false) }
  }

  async function handleAporte(id) {
    const v = parseFloat(aporteVal)
    if (!v || v <= 0) return
    try {
      await api.adicionarAporte(id, v)
      setAporteId(null); setAporteVal(''); load()
    } catch {}
  }

  async function retryAnalise(moeda) {
    try {
      const analise = await api.analiseCambio(moeda)
      setAnalises(prev => ({ ...prev, [moeda]: analise }))
    } catch {}
  }

  function retryFormAnalise() {
    setFormAnaliseLoading(true)
    api.analiseCambio(form.moeda)
      .then(setFormAnalise).catch(() => setFormAnalise(null))
      .finally(() => setFormAnaliseLoading(false))
  }

  function prevMonth() { setMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 }) }
  function nextMonth() { setMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 }) }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar month={month} onPrev={prevMonth} onNext={nextMonth} />

      {/* Edit Modal */}
      {editId && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-on-surface">Editar Meta</h3>
              <button onClick={() => setEditId(null)} className="p-1 text-outline hover:text-on-surface transition-colors rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className={labelCls()}>Descrição</label>
                <input className={inputCls()} value={editForm.descricao} onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))} required />
              </div>
              <div>
                <label className={labelCls()}>Valor Alvo ({editForm.moeda})</label>
                <input type="number" min="1" step="any" className={inputCls()} value={editForm.valorAlvo} onChange={e => setEditForm(f => ({ ...f, valorAlvo: e.target.value }))} required />
              </div>
              <div>
                <label className={labelCls()}>Prazo</label>
                <input type="month" className={inputCls()} value={editForm.prazo} onChange={e => setEditForm(f => ({ ...f, prazo: e.target.value }))} required />
              </div>
              {editError && <p className="text-error text-sm bg-error/10 border border-error/20 px-3 py-2 rounded-lg">{editError}</p>}
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={editSaving} className="px-5 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                  {editSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Metas de Viagem</h2>
            <p className="text-sm text-outline mt-0.5">Acompanhe suas metas com câmbio e histórico em tempo real</p>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setFormAnalise(null); setPaisSearch(''); setValorMode('local') }}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">{showForm ? 'close' : 'add'}</span>
            {showForm ? 'Cancelar' : 'Nova Meta'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-6">Nova Meta de Viagem</h3>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6 items-start">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className={labelCls()}>Descrição <span className="text-outline normal-case font-normal">(opcional)</span></label>
                  <input
                    className={inputCls()}
                    value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    placeholder={`Viagem para ${form.pais}`}
                  />
                </div>
                <div>
                  <label className={labelCls()}>País de Destino</label>
                  <input
                    className={`${inputCls()} mb-1`}
                    placeholder="Buscar país ou moeda..."
                    value={paisSearch}
                    onChange={e => setPaisSearch(e.target.value)}
                  />
                  <select
                    className={inputCls()}
                    value={form.pais}
                    onChange={e => { setPaisField(e.target.value); setPaisSearch('') }}
                    size={paisSearch ? Math.min(6, PAISES.filter(p =>
                      p.pais.toLowerCase().includes(paisSearch.toLowerCase()) ||
                      p.moeda.toLowerCase().includes(paisSearch.toLowerCase())
                    ).length + 1) : 1}
                  >
                    {(paisSearch
                      ? PAISES.filter(p =>
                          p.pais.toLowerCase().includes(paisSearch.toLowerCase()) ||
                          p.moeda.toLowerCase().includes(paisSearch.toLowerCase())
                        )
                      : PAISES
                    ).map(p => <option key={p.moeda} value={p.pais}>{p.bandeira} {p.pais} ({p.moeda})</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Valor Alvo</label>
                    {form.moeda !== 'BRL' && (
                      <div className="flex rounded-lg overflow-hidden border border-outline-variant text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setValorMode('local')}
                          className={`px-3 py-1 transition-colors ${valorMode === 'local' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                          {form.moeda}
                        </button>
                        <button
                          type="button"
                          onClick={() => setValorMode('brl')}
                          className={`px-3 py-1 transition-colors ${valorMode === 'brl' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                          R$
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline font-medium pointer-events-none select-none">
                      {valorMode === 'brl' || form.moeda === 'BRL' ? 'R$' : form.moeda}
                    </span>
                    <input
                      type="number" min="0.01" step="any"
                      className={`${inputCls()} pl-12`}
                      value={form.valorAlvo}
                      onChange={e => setForm(f => ({ ...f, valorAlvo: e.target.value }))}
                      required
                    />
                  </div>
                  {form.moeda !== 'BRL' && formAnalise?.cotacaoAtual && form.valorAlvo > 0 && (
                    <p className="text-xs text-outline mt-1.5">
                      {valorMode === 'local'
                        ? `≈ R$ ${fmtNum(parseFloat(form.valorAlvo) * formAnalise.cotacaoAtual)} ao câmbio atual`
                        : `≈ ${form.moeda} ${fmtNum(parseFloat(form.valorAlvo) / formAnalise.cotacaoAtual)} ao câmbio atual`}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls()}>Prazo</label>
                  <input type="month" className={inputCls()} value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} required />
                </div>
                {formError && <p className="text-error text-sm bg-error/10 border border-error/20 px-3 py-2 rounded-lg">{formError}</p>}
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all">
                    {saving ? 'Criando...' : 'Criar Meta'}
                  </button>
                </div>
              </form>

              {form.moeda !== 'BRL' ? (
                <ExchangePanel analise={formAnalise} moeda={form.moeda} loading={formAnaliseLoading} onRetry={retryFormAnalise} chartId="form-preview" />
              ) : (
                <div className="flex flex-col items-center justify-center bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant p-8 text-center gap-2">
                  <span className="text-4xl">🇧🇷</span>
                  <p className="text-sm font-medium text-on-surface">Meta em Reais</p>
                  <p className="text-xs text-outline">Sem análise cambial necessária</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="space-y-6">
            {[0, 1].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden animate-pulse">
                <div className="px-6 py-5 border-b border-outline-variant flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container-high rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 bg-surface-container-high rounded" />
                    <div className="h-3 w-24 bg-surface-container-high rounded" />
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr,260px] gap-6">
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-surface-container-high rounded" />
                    <div className="h-3 w-full bg-surface-container-high rounded-full" />
                    <div className="h-16 bg-surface-container-high rounded-lg" />
                  </div>
                  <div className="h-48 bg-surface-container-high rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : metas.length === 0 ? (
          <div className="text-center py-24 bg-surface-container-lowest rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">flag</span>
            <p className="text-on-surface-variant font-medium text-lg">Nenhuma meta criada ainda</p>
            <p className="text-sm text-outline mt-1 mb-4">Crie sua primeira meta de viagem e acompanhe o câmbio</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-xl">add</span>
              Criar primeira meta
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {metas.map(meta => {
              const pais      = PAISES.find(p => p.moeda === meta.moeda)
              const analise   = analises[meta.moeda]
              const progress  = Math.min(100, Math.round(meta.valorAcumulado / meta.valorAlvo * 100))
              const monthly   = calcMonthly(meta)
              const completed = meta.valorAcumulado >= meta.valorAlvo
              const hasFx     = meta.moeda !== 'BRL'
              const isDeleting = confirmDeleteId === meta.id

              return (
                <div key={meta.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm card-hover transition-all overflow-hidden">
                  {/* Header */}
                  <div className="px-6 pt-5 pb-5 border-b border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-3xl flex-shrink-0">{pais?.bandeira ?? '🌍'}</span>
                      <div className="min-w-0">
                        <h4 className="text-lg font-bold text-on-surface truncate">{meta.descricao}</h4>
                        <p className="text-sm text-outline">{pais?.pais ?? meta.moeda}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                      {completed && (
                        <span className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold border border-secondary/20 mr-2">
                          Concluída ✓
                        </span>
                      )}
                      <button
                        onClick={() => openEdit(meta)}
                        title="Editar meta"
                        className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(isDeleting ? null : meta.id)}
                        title="Excluir meta"
                        className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Delete confirmation banner */}
                  {isDeleting && (
                    <div className="px-6 py-3 bg-error/5 border-b border-error/20 flex items-center justify-between gap-4 flex-wrap">
                      <p className="text-sm text-on-surface font-medium">
                        Tem certeza? Esta ação <strong className="text-error">não pode ser desfeita</strong>.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors font-medium">
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(meta.id)}
                          disabled={deleting}
                          className="px-4 py-1.5 bg-error text-on-error text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                          {deleting ? 'Excluindo...' : 'Confirmar exclusão'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Body */}
                  <div className={`p-6 grid gap-6 items-start ${hasFx ? 'grid-cols-1 lg:grid-cols-[1fr,260px]' : 'grid-cols-1'}`}>
                    {/* Left */}
                    <div className="space-y-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-outline uppercase font-semibold tracking-wider">Acumulado</p>
                          <p className="text-xl font-bold text-on-surface tabular-nums">
                            {meta.moeda === 'BRL' || !analise
                              ? `${meta.moeda} ${fmtNum(meta.valorAcumulado)}`
                              : fmtBRL(meta.valorAcumulado * analise.cotacaoAtual)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-outline uppercase font-semibold tracking-wider">Meta</p>
                          <p className="text-xl font-bold text-primary tabular-nums">
                            {meta.moeda === 'BRL' || !analise
                              ? `${meta.moeda} ${fmtNum(meta.valorAlvo)}`
                              : fmtBRL(meta.valorAlvo * analise.cotacaoAtual)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm text-outline font-semibold">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${completed ? 'bg-secondary' : 'bg-primary'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-outline">
                          Prazo: {new Date(meta.dataAlvo).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>

                      {!completed && monthly !== null && (
                        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg flex gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-secondary text-[18px]">tips_and_updates</span>
                          </div>
                          <p className="text-sm text-on-surface">
                            Para atingir esta meta, guarde <strong className="text-secondary font-bold">{fmtBRL(monthly)}</strong> por mês.
                          </p>
                        </div>
                      )}

                      {!completed && (
                        aporteId === meta.id ? (
                          <div className="flex gap-2">
                            <input
                              type="number" min="0.01" step="any" autoFocus
                              className="flex-1 border border-outline-variant rounded-lg px-3 py-2 bg-surface text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors"
                              placeholder={`Valor em ${meta.moeda}`}
                              value={aporteVal}
                              onChange={e => setAporteVal(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAporte(meta.id)}
                            />
                            <button onClick={() => handleAporte(meta.id)} className="px-4 py-2 bg-secondary text-on-secondary text-sm font-bold rounded-lg hover:opacity-90 whitespace-nowrap">
                              Depositar
                            </button>
                            <button onClick={() => { setAporteId(null); setAporteVal('') }} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setAporteId(meta.id); setAporteVal('') }}
                            className="w-full py-2.5 border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Adicionar Aporte
                          </button>
                        )
                      )}
                    </div>

                    {/* Right: chart panel */}
                    {hasFx && (
                      <ExchangePanel analise={analise} moeda={meta.moeda} loading={false} onRetry={() => retryAnalise(meta.moeda)} chartId={meta.id} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
