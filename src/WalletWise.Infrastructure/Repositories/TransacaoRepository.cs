using Microsoft.EntityFrameworkCore;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Entities;
using WalletWise.Infrastructure.Persistence;

namespace WalletWise.Infrastructure.Repositories;

public class TransacaoRepository(AppDbContext context) : ITransacaoRepository
{
    public async Task<Guid> AddAsync(Transacao transacao, CancellationToken cancellationToken = default)
    {
        await context.Transacoes.AddAsync(transacao, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return transacao.Id;
    }

    public async Task<Transacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.Transacoes.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<List<Transacao>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Transacoes
            .OrderByDescending(t => t.DataTransacao)
            .ToListAsync(cancellationToken);

    public async Task UpdateAsync(Transacao transacao, CancellationToken cancellationToken = default)
    {
        context.Transacoes.Update(transacao);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await context.Transacoes.Where(t => t.Id == id).ExecuteDeleteAsync(cancellationToken);
    }
}
