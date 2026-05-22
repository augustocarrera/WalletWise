import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'

const MOEDAS = ['BRL', 'USD', 'EUR', 'JPY', 'GBP', 'ARS']
const EMPTY = {
  descricao: '',
  valor: '',
  tipo: 'Despesa',
  dataTransacao: new Date().toISOString().slice(0, 10),
  moeda: 'BRL',
}

export default function TransactionModal() {
  const { txModal, closeTxModal } = useApp()
  const { open, tx, onDone } = txModal
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    if (tx) {
      setForm({
        descricao: tx.descricao,
        valor: String(tx.valor),
        tipo: tx.tipo,
        dataTransacao: tx.dataTransacao.slice(0, 10),
        moeda: tx.moeda,
      })
    } else {
      setForm(EMPTY)
    }
    setError(null)
  }, [open, tx])

  if (!open) return null

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, valor: parseFloat(form.valor) }
      if (tx) {
        await api.atualizarTransacao(tx.id, payload)
      } else {
        await api.criarTransacao(payload)
      }
      closeTxModal()
      onDone?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
        onClick={closeTxModal}
      />
      <div className="relative bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-on-surface">
            {tx ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={closeTxModal}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <input
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Ex: Passagem aérea"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">
                Valor
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                value={form.valor}
                onChange={e => set('valor', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">
                Moeda
              </label>
              <select
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                value={form.moeda}
                onChange={e => set('moeda', e.target.value)}
              >
                {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">
                Tipo
              </label>
              <select
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
              >
                <option value="Receita">Receita</option>
                <option value="Despesa">Despesa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">
                Data
              </label>
              <input
                type="date"
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                value={form.dataTransacao}
                onChange={e => set('dataTransacao', e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-error text-sm bg-error/10 border border-error/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeTxModal}
              className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {saving ? 'Salvando...' : tx ? 'Salvar Alterações' : 'Criar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
