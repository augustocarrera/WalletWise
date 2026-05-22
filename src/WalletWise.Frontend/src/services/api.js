const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5191'

const h = { 'Content-Type': 'application/json' }

async function req(url, opts = {}) {
  const res = await fetch(`${BASE}${url}`, opts)
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) {
    const firstValidation = data?.errors ? Object.values(data.errors).flat()[0] : null
    throw new Error(data?.mensagem ?? data?.title ?? firstValidation ?? `Erro ${res.status}`)
  }
  return data
}

export const api = {
  // Transações
  listarTransacoes: ()         => req('/api/transacoes'),
  criarTransacao:   (d)        => req('/api/transacoes', { method: 'POST', headers: h, body: JSON.stringify(d) }),
  atualizarTransacao: (id, d)  => req(`/api/transacoes/${id}`, { method: 'PUT',  headers: h, body: JSON.stringify(d) }),
  deletarTransacao: (id)       => req(`/api/transacoes/${id}`, { method: 'DELETE' }),

  // Metas
  listarMetas:      ()         => req('/api/metas'),
  criarMeta:        (d)        => req('/api/metas', { method: 'POST',   headers: h, body: JSON.stringify(d) }),
  atualizarMeta:    (id, d)    => req(`/api/metas/${id}`,        { method: 'PUT',    headers: h, body: JSON.stringify(d) }),
  excluirMeta:      (id)       => req(`/api/metas/${id}`,        { method: 'DELETE' }),
  adicionarAporte:  (id, v)    => req(`/api/metas/${id}/aporte`, { method: 'PATCH',  headers: h, body: JSON.stringify({ valor: v }) }),

  // Relatório mensal
  resumoMensal: (ano, mes)     => req(`/api/relatorios/resumo-mensal?ano=${ano}&mes=${mes}`),

  // Análise cambial
  analiseCambio: (moeda)       => req(`/api/analise-cambio/${moeda}`),
}
