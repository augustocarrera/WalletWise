import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useApp } from '../context/AppContext'
import TopBar from '../components/TopBar'

const _now = new Date()
const SYMBOL = { BRL: 'R$', USD: '$', EUR: '€', JPY: '¥', GBP: '£', ARS: '$' }

export default function Transactions() {
  const { openTxModal } = useApp()
  const [month, setMonth] = useState({ year: _now.getFullYear(), month: _now.getMonth() })
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.listarTransacoes()
      setTransacoes(data ?? [])
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = [...transacoes]
    .filter(tx => {
      const d = new Date(tx.dataTransacao)
      return d.getFullYear() === month.year && d.getMonth() === month.month
    })
    .sort((a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao))

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await api.deletarTransacao(confirmDelete.id)
      setConfirmDelete(null)
      load()
    } catch {} finally {
      setDeleting(false)
    }
  }

  function prevMonth() {
    setMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 })
  }
  function nextMonth() {
    setMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar month={month} onPrev={prevMonth} onNext={nextMonth} onAdd={() => openTxModal(null, load)} />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-20">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Extrato de Transações</h2>
              <p className="text-sm text-outline mt-0.5">{filtered.length} transações neste mês</p>
            </div>
            <button
              onClick={() => openTxModal(null, load)}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Nova Transação
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-xs text-outline uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Data</th>
                  <th className="px-6 py-4 font-bold">Descrição / Tipo</th>
                  <th className="px-6 py-4 font-bold">Moeda</th>
                  <th className="px-6 py-4 font-bold">Valor Original</th>
                  <th className="px-6 py-4 font-bold text-right">Valor BRL</th>
                  <th className="px-6 py-4 font-bold text-center">Cotação</th>
                  <th className="px-6 py-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-5">
                          <div className="h-4 bg-surface-container-high rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-4xl block mb-2 text-outline">receipt_long</span>
                      Nenhuma transação neste mês
                    </td>
                  </tr>
                ) : filtered.map(tx => {
                  const isReceita = tx.tipo === 'Receita'
                  return (
                    <tr key={tx.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4 text-sm text-on-surface whitespace-nowrap">
                        {new Date(tx.dataTransacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isReceita ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                            <span className="material-symbols-outlined text-[20px]">
                              {isReceita ? 'trending_up' : 'trending_down'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-on-surface block">{tx.descricao}</span>
                            <span className={`text-xs font-medium ${isReceita ? 'text-secondary' : 'text-error'}`}>
                              {tx.tipo}
                            </span>
                          </div>
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openTxModal(tx, load)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(tx)}
                            title="Excluir"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-error text-3xl">warning</span>
              <h3 className="text-lg font-bold text-on-surface">Excluir Transação</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">
              Deseja excluir <strong className="text-on-surface">"{confirmDelete.descricao}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-error text-on-error text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
