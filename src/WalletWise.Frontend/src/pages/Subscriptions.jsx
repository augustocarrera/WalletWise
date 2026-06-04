import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import TopBar from '../components/TopBar'
import { MOEDAS } from '../constants/moedas'

const _now = new Date()

const EMPTY_FORM = { nome: '', valor: '', moeda: 'BRL', diaVencimento: '5' }

const fmtValor = (valor, moeda) =>
  Number(valor ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: moeda ?? 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

function inputCls() {
  return 'w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary transition-colors'
}
function labelCls() {
  return 'block text-xs font-bold text-outline uppercase tracking-wider mb-1.5'
}

export default function Subscriptions() {
  const [month, setMonth] = useState({ year: _now.getFullYear(), month: _now.getMonth() })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState(null)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.listarMensalidades()
      setItems(data ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true); setFormError(null)
    try {
      await api.criarMensalidade({
        nome: form.nome.trim(),
        valor: parseFloat(form.valor),
        moeda: form.moeda,
        diaVencimento: parseInt(form.diaVencimento, 10),
      })
      setShowForm(false); setForm(EMPTY_FORM); load()
    } catch (err) { setFormError(err.message) }
    finally { setSaving(false) }
  }

  async function handleEdit(e) {
    e.preventDefault()
    setEditSaving(true); setEditError(null)
    try {
      await api.atualizarMensalidade(editId, {
        nome: editForm.nome.trim(),
        valor: parseFloat(editForm.valor),
        moeda: editForm.moeda,
        diaVencimento: parseInt(editForm.diaVencimento, 10),
      })
      setEditId(null); setEditForm(null); load()
    } catch (err) { setEditError(err.message) }
    finally { setEditSaving(false) }
  }

  async function handleDelete(id) {
    setDeleting(true)
    try {
      await api.excluirMensalidade(id)
      setConfirmDeleteId(null); load()
    } catch {} finally { setDeleting(false) }
  }

  async function handleAlternar(id) {
    try {
      await api.alternarMensalidade(id)
      load()
    } catch {}
  }

  function openEdit(item) {
    setEditId(item.id)
    setEditForm({
      nome: item.nome,
      valor: String(item.valor),
      moeda: item.moeda,
      diaVencimento: String(item.diaVencimento),
    })
    setEditError(null)
  }

  const ativas = items.filter(i => i.ativa)
  const inativas = items.filter(i => !i.ativa)
  const totalMensal = ativas.reduce((s, i) => i.moeda === 'BRL' ? s + i.valor : s, 0)

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
              <h3 className="text-lg font-bold text-on-surface">Editar Assinatura</h3>
              <button onClick={() => setEditId(null)} className="p-1 text-outline hover:text-on-surface rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className={labelCls()}>Nome</label>
                <input className={inputCls()} value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls()}>Valor</label>
                  <input type="number" min="0.01" step="any" className={inputCls()} value={editForm.valor} onChange={e => setEditForm(f => ({ ...f, valor: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls()}>Moeda</label>
                  <select className={inputCls()} value={editForm.moeda} onChange={e => setEditForm(f => ({ ...f, moeda: e.target.value }))}>
                    {MOEDAS.map(m => <option key={m.code} value={m.code}>{m.code}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls()}>Dia de Vencimento</label>
                <input type="number" min="1" max="28" className={inputCls()} value={editForm.diaVencimento} onChange={e => setEditForm(f => ({ ...f, diaVencimento: e.target.value }))} required />
                <p className="text-xs text-outline mt-1">Entre 1 e 28 (evitar final de mês)</p>
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

      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Assinaturas</h2>
            <p className="text-sm text-outline mt-0.5">Gerencie suas cobranças mensais recorrentes</p>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setFormError(null) }}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">{showForm ? 'close' : 'add'}</span>
            {showForm ? 'Cancelar' : 'Nova Assinatura'}
          </button>
        </div>

        {/* Summary */}
        {!loading && ativas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <p className="text-xs text-outline uppercase font-semibold tracking-wider mb-1">Assinaturas Ativas</p>
              <p className="text-2xl font-bold text-on-surface">{ativas.length}</p>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <p className="text-xs text-outline uppercase font-semibold tracking-wider mb-1">Total Mensal (BRL)</p>
              <p className="text-2xl font-bold text-error">
                {totalMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              {ativas.some(i => i.moeda !== 'BRL') && (
                <p className="text-xs text-outline mt-1">+ cobranças em moeda estrangeira</p>
              )}
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <p className="text-xs text-outline uppercase font-semibold tracking-wider mb-1">Próximo Vencimento</p>
              <p className="text-2xl font-bold text-on-surface">
                {ativas.length > 0
                  ? `Dia ${Math.min(...ativas.map(i => i.diaVencimento))}`
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-5">Nova Assinatura</h3>
            <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
              <div>
                <label className={labelCls()}>Nome da Assinatura</label>
                <input
                  className={inputCls()}
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Netflix, Spotify, Academia..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls()}>Valor</label>
                  <input
                    type="number" min="0.01" step="any"
                    className={inputCls()}
                    value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls()}>Moeda</label>
                  <select className={inputCls()} value={form.moeda} onChange={e => setForm(f => ({ ...f, moeda: e.target.value }))}>
                    {MOEDAS.map(m => <option key={m.code} value={m.code}>{m.code}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls()}>Dia de Vencimento</label>
                <input
                  type="number" min="1" max="28"
                  className={inputCls()}
                  value={form.diaVencimento}
                  onChange={e => setForm(f => ({ ...f, diaVencimento: e.target.value }))}
                  required
                />
                <p className="text-xs text-outline mt-1">Entre 1 e 28 (evitar final de mês)</p>
              </div>
              {formError && <p className="text-error text-sm bg-error/10 border border-error/20 px-3 py-2 rounded-lg">{formError}</p>}
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all">
                  {saving ? 'Criando...' : 'Criar Assinatura'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-surface-container-high rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-surface-container-high rounded" />
                  <div className="h-3 w-24 bg-surface-container-high rounded" />
                </div>
                <div className="h-6 w-24 bg-surface-container-high rounded-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 && !showForm ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">subscriptions</span>
            <p className="text-on-surface-variant font-medium text-lg">Nenhuma assinatura cadastrada</p>
            <p className="text-sm text-outline mt-1 mb-4">Adicione suas cobranças mensais recorrentes</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-xl">add</span>
              Adicionar assinatura
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {ativas.length > 0 && (
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Ativas</p>
                <div className="space-y-3">
                  {ativas.map(item => (
                    <SubscriptionCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEdit(item)}
                      onToggle={() => handleAlternar(item.id)}
                      onDelete={() => setConfirmDeleteId(item.id)}
                      isConfirmingDelete={confirmDeleteId === item.id}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                      onConfirmDelete={() => handleDelete(item.id)}
                      deleting={deleting}
                    />
                  ))}
                </div>
              </div>
            )}
            {inativas.length > 0 && (
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3 mt-6">Pausadas</p>
                <div className="space-y-3">
                  {inativas.map(item => (
                    <SubscriptionCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEdit(item)}
                      onToggle={() => handleAlternar(item.id)}
                      onDelete={() => setConfirmDeleteId(item.id)}
                      isConfirmingDelete={confirmDeleteId === item.id}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                      onConfirmDelete={() => handleDelete(item.id)}
                      deleting={deleting}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionCard({ item, onEdit, onToggle, onDelete, isConfirmingDelete, onCancelDelete, onConfirmDelete, deleting }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl border shadow-sm transition-all overflow-hidden ${item.ativa ? 'border-outline-variant' : 'border-outline-variant/50 opacity-60'}`}>
      <div className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.ativa ? 'bg-error/10 text-error' : 'bg-surface-container-high text-outline'}`}>
          <span className="material-symbols-outlined text-[20px]">
            {item.ativa ? 'repeat' : 'pause_circle'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm truncate ${item.ativa ? 'text-on-surface' : 'text-on-surface-variant'}`}>{item.nome}</p>
          <p className="text-xs text-outline">Vence todo dia <strong>{item.diaVencimento}</strong></p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-base font-bold tabular-nums ${item.ativa ? 'text-error' : 'text-outline'}`}>
            {fmtValor(item.valor, item.moeda)}
          </p>
          <p className="text-xs text-outline">{item.moeda} / mês</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={onToggle}
            title={item.ativa ? 'Pausar' : 'Reativar'}
            className={`p-2 rounded-lg transition-colors ${item.ativa ? 'text-outline hover:text-accent hover:bg-accent/10' : 'text-outline hover:text-secondary hover:bg-secondary/10'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.ativa ? 'pause' : 'play_arrow'}</span>
          </button>
          <button
            onClick={onEdit}
            title="Editar"
            className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={onDelete}
            title="Excluir"
            className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>

      {isConfirmingDelete && (
        <div className="px-5 py-3 bg-error/5 border-t border-error/20 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-on-surface font-medium">
            Tem certeza? Esta ação <strong className="text-error">não pode ser desfeita</strong>.
          </p>
          <div className="flex gap-2">
            <button onClick={onCancelDelete} className="px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors font-medium">
              Cancelar
            </button>
            <button
              onClick={onConfirmDelete}
              disabled={deleting}
              className="px-4 py-1.5 bg-error text-on-error text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {deleting ? 'Excluindo...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
