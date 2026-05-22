import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useApp } from '../context/AppContext'
import TopBar from '../components/TopBar'
import MiniChart, { calcTrend, chartAxisLabels } from '../components/MiniChart'

const _now = new Date()

const SYMBOL = { BRL: 'R$', USD: '$', EUR: '€', JPY: '¥', GBP: '£', ARS: '$' }

const CURRENCY_BADGE = {
  USD: 'bg-primary text-on-primary',
  EUR: 'bg-accent text-on-surface',
  JPY: 'bg-error text-on-error',
  GBP: 'bg-secondary text-on-secondary',
  ARS: 'bg-outline-variant text-on-surface',
  BRL: 'bg-surface-container-high text-on-surface',
}

const REC_STYLE = {
  ComprarAgora: { text: 'text-secondary', dot: 'bg-secondary', label: 'Bom momento', chartCls: 'text-secondary' },
  Neutro:       { text: 'text-accent',    dot: 'bg-accent',    label: 'Estável',     chartCls: 'text-accent'   },
  Aguardar:     { text: 'text-error',     dot: 'bg-error',     label: 'Aguarde',     chartCls: 'text-error'    },
}

const fmtBRL = v => {
  const n = Number(v ?? 0)
  const dec = n < 0.01 ? 6 : n < 1 ? 4 : 2
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: dec, maximumFractionDigits: dec })
}
const fmtNum = (v, dec = 0) => Number(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
const fmtRate = v => {
  const n = Number(v ?? 0)
  const dec = n < 0.01 ? 6 : n < 1 ? 4 : 2
  return n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export default function Dashboard() {
  const { openTxModal } = useApp()
  const navigate = useNavigate()
  const [month, setMonth] = useState({ year: _now.getFullYear(), month: _now.getMonth() })
  const [resumo, setResumo] = useState(null)
  const [transacoes, setTransacoes] = useState([])
  const [metas, setMetas] = useState([])
  const [analises, setAnalises] = useState({})

  const loadResumo = useCallback(async () => {
    try {
      const data = await api.resumoMensal(month.year, month.month + 1)
      setResumo(data)
    } catch {}
  }, [month])

  const loadAll = useCallback(async () => {
    try {
      const [txs, mts] = await Promise.all([api.listarTransacoes(), api.listarMetas()])
      setTransacoes(txs ?? [])
      setMetas(mts ?? [])

      const primeiraAtiva = (mts ?? []).find(m => m.valorAcumulado < m.valorAlvo)
      const goalMoeda = primeiraAtiva?.moeda

      const moedas = [...new Set([
        ...(goalMoeda && goalMoeda !== 'BRL' ? [goalMoeda] : []),
      ])]

      if (moedas.length > 0) {
        const settled = await Promise.allSettled(moedas.map(m => api.analiseCambio(m)))
        const obj = {}
        moedas.forEach((m, i) => {
          if (settled[i].status === 'fulfilled') obj[m] = settled[i].value
        })
        setAnalises(obj)
      }
    } catch {}
  }, [])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => { loadResumo() }, [loadResumo])

  function prevMonth() {
    setMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 })
  }
  function nextMonth() {
    setMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 })
  }

  const primeiraAtiva = metas.find(m => m.valorAcumulado < m.valorAlvo)
  const metaAnalise = primeiraAtiva ? analises[primeiraAtiva.moeda] : null
  const progress = primeiraAtiva
    ? Math.min(100, Math.round(primeiraAtiva.valorAcumulado / primeiraAtiva.valorAlvo * 100))
    : 0

  const mesesRestantes = primeiraAtiva
    ? Math.max(1, Math.round((new Date(primeiraAtiva.dataAlvo) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    : 0

  const monthlySavings = (() => {
    if (!primeiraAtiva || (!metaAnalise && primeiraAtiva.moeda !== 'BRL')) return null
    const restante = primeiraAtiva.valorAlvo - primeiraAtiva.valorAcumulado
    if (restante <= 0) return 0
    return (restante * (metaAnalise?.cotacaoAtual ?? 1)) / mesesRestantes
  })()

  const recentTxs = [...transacoes]
    .sort((a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao))
    .slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar month={month} onPrev={prevMonth} onNext={nextMonth} onAdd={() => openTxModal(null, () => { loadAll(); loadResumo() })} />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard label="Total Receitas" value={fmtBRL(resumo?.totalReceitas)}
            icon="trending_up" iconCls="bg-secondary/10 text-secondary"
            sub={resumo ? <span className="text-sm text-secondary flex items-center gap-1 mt-2 font-medium">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> vs mês anterior
            </span> : null} />
          <KpiCard label="Total Despesas" value={fmtBRL(resumo?.totalDespesas)}
            icon="trending_down" iconCls="bg-error/10 text-error"
            sub={resumo ? <span className="text-sm text-error flex items-center gap-1 mt-2 font-medium">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span> vs mês anterior
            </span> : null} />
          <KpiCard label="Saldo" value={fmtBRL(resumo?.saldo)}
            icon="account_balance" iconCls="bg-primary/10 text-primary"
            sub={<span className="text-sm text-primary flex items-center gap-1 mt-2 font-medium">
              <span className="material-symbols-outlined text-[14px]">info</span> Disponível no mês
            </span>} />
          <KpiCard label="Transações" value={resumo?.totalTransacoes ?? '—'}
            icon="swap_horiz" iconCls="bg-accent/10 text-accent"
            sub={<span className="text-sm text-outline flex items-center gap-1 mt-2 font-medium">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span> Este mês
            </span>} />
        </section>

        {/* Metas de Viagem — full width */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[26px]">track_changes</span>
              <h3 className="text-xl font-bold text-on-surface">Metas de Viagem</h3>
            </div>
            <button onClick={() => navigate('/metas')} className="text-primary font-bold text-sm hover:underline">
              Ver todas
            </button>
          </div>

          {primeiraAtiva ? (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-10 items-start">
              {/* Left: goal info */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-2xl font-bold text-on-surface">{primeiraAtiva.descricao}</h4>
                  <p className="text-xl font-bold text-primary mt-1">
                    {primeiraAtiva.moeda === 'BRL'
                      ? `R$ ${fmtNum(primeiraAtiva.valorAlvo, 0)}`
                      : metaAnalise
                        ? `R$ ${fmtNum(primeiraAtiva.valorAlvo * metaAnalise.cotacaoAtual, 0)}`
                        : `${primeiraAtiva.moeda} ${fmtNum(primeiraAtiva.valorAlvo, 0)}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-outline font-semibold">
                    <span>Progresso Atual</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {monthlySavings !== null && (
                  <div className="bg-surface-container-low border border-outline-variant p-5 rounded-lg flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">tips_and_updates</span>
                    </div>
                    <p className="text-base text-on-surface">
                      Para atingir esta meta, guarde{' '}
                      <strong className="text-secondary font-bold">{fmtBRL(monthlySavings)}</strong>{' '}
                      por mês pelos próximos <strong className="font-bold">{mesesRestantes}</strong> meses.
                    </p>
                  </div>
                )}
              </div>

              {/* Right: exchange panel */}
              {primeiraAtiva.moeda !== 'BRL' && (
                <GoalExchangePanel analise={metaAnalise} moeda={primeiraAtiva.moeda} />
              )}
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline mb-3">flag</span>
              <p className="text-on-surface-variant font-medium">Nenhuma meta ativa ainda.</p>
              <button onClick={() => navigate('/metas')} className="mt-3 text-primary font-bold text-sm hover:underline">
                Criar meta →
              </button>
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-surface">Transações Recentes</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-container-high text-on-surface-variant rounded-lg transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button onClick={() => navigate('/transacoes')} className="text-primary font-bold text-sm hover:underline px-2">
                Ver extrato completo
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-xs text-outline uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Data</th>
                  <th className="px-6 py-4 font-bold">Descrição</th>
                  <th className="px-6 py-4 font-bold">Moeda</th>
                  <th className="px-6 py-4 font-bold">Valor Original</th>
                  <th className="px-6 py-4 font-bold text-right">Valor BRL</th>
                  <th className="px-6 py-4 font-bold text-center">Cotação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                      Nenhuma transação registrada
                    </td>
                  </tr>
                ) : recentTxs.map(tx => (
                  <TxRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant text-center">
            <button onClick={() => navigate('/transacoes')} className="text-primary font-bold text-sm hover:underline">
              Ver extrato completo →
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}

function GoalExchangePanel({ analise, moeda }) {
  const rec    = analise ? REC_STYLE[analise.recomendacao] : null
  const pct    = analise ? ((analise.cotacaoAtual - analise.mediaUltimos30Dias) / analise.mediaUltimos30Dias * 100) : null
  const trend  = calcTrend(analise?.historico)
  const labels = chartAxisLabels(analise?.historico?.length ?? 30)
  const badgeCls = CURRENCY_BADGE[moeda] ?? 'bg-surface-container-high text-on-surface'

  return (
    <div className="bg-surface-container-low/60 p-6 rounded-xl border border-outline-variant/70">
      {!analise ? (
        <div className="space-y-4 animate-pulse">
          <div className="flex justify-between">
            <div className="space-y-2 flex-1 mr-4">
              <div className="h-3 w-3/4 bg-surface-container-high rounded" />
              <div className="h-8 w-1/2 bg-surface-container-high rounded" />
            </div>
            <div className="w-12 h-12 bg-surface-container-high rounded-full" />
          </div>
          <div className="h-[100px] bg-surface-container-high rounded" />
          <div className="h-3 w-full bg-surface-container-high rounded" />
        </div>
      ) : (
        <>
          {/* Rate + badge */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-outline uppercase font-semibold tracking-wider mb-1.5">
                Cotação Atual {moeda}/BRL
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface tabular-nums">{fmtRate(analise.cotacaoAtual)}</span>
                <span className={`text-sm font-semibold flex items-center ${pct < -1 ? 'text-secondary' : pct > 1 ? 'text-error' : 'text-accent'}`}>
                  <span className="material-symbols-outlined text-[14px]">{pct >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                  {Math.abs(pct).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${badgeCls}`}>
              {moeda}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[100px] w-full">
            {analise.historico?.length >= 2
              ? <MiniChart historico={analise.historico} colorCls={rec?.chartCls ?? 'text-secondary'} chartId={`dash-${moeda}`} />
              : <div className="h-full flex items-center justify-center rounded-lg bg-surface-container-high/40">
                  <p className="text-xs text-outline">Reinicie o backend para carregar o gráfico</p>
                </div>
            }
          </div>

          {/* Axis labels */}
          <div className="flex justify-between text-[11px] text-outline font-medium mt-2 px-1">
            {labels.map((l, i) => <span key={i}>{l}</span>)}
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-2 mt-4">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trend.dot}`} />
              <p className="text-xs text-on-surface-variant">{trend.text}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KpiCard({ label, value, icon, iconCls, sub }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm card-hover transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-outline uppercase font-semibold tracking-wider">{label}</span>
        <span className={`p-2 ${iconCls} rounded-lg`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
      </div>
      <p className="text-2xl font-bold text-on-surface mt-3">{value ?? '—'}</p>
      {sub}
    </div>
  )
}

function TxRow({ tx }) {
  const isReceita = tx.tipo === 'Receita'
  return (
    <tr className="hover:bg-surface-container-low transition-colors">
      <td className="px-6 py-4 text-sm text-on-surface whitespace-nowrap">
        {new Date(tx.dataTransacao).toLocaleDateString('pt-BR')}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isReceita ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
            <span className="material-symbols-outlined text-[20px]">{isReceita ? 'trending_up' : 'trending_down'}</span>
          </div>
          <span className="text-sm font-bold text-on-surface">{tx.descricao}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-outline font-medium">{tx.moeda}</td>
      <td className="px-6 py-4 text-sm text-outline font-medium whitespace-nowrap">
        {SYMBOL[tx.moeda] ?? ''} {Number(tx.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${isReceita ? 'text-secondary' : 'text-error'}`}>
        {Number(tx.valorEmBrl ?? tx.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-6 py-4 text-center">
        <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant">
          {tx.cotacaoUsada ? Number(tx.cotacaoUsada).toFixed(4) : '1.0000'}
        </span>
      </td>
    </tr>
  )
}
