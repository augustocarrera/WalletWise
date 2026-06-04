using Microsoft.EntityFrameworkCore;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Entities;
using WalletWise.Infrastructure.Persistence;

namespace WalletWise.Infrastructure.Repositories;

public class MensalidadeRepository(AppDbContext context) : IMensalidadeRepository
{
    public async Task<IEnumerable<Mensalidade>> ListarAsync(CancellationToken ct = default)
        => await context.Mensalidades.OrderBy(m => m.DiaVencimento).ToListAsync(ct);

    public async Task<Mensalidade?> ObterAsync(Guid id, CancellationToken ct = default)
        => await context.Mensalidades.FindAsync([id], ct);

    public async Task AdicionarAsync(Mensalidade mensalidade, CancellationToken ct = default)
        => await context.Mensalidades.AddAsync(mensalidade, ct);

    public Task RemoverAsync(Mensalidade mensalidade, CancellationToken ct = default)
    {
        context.Mensalidades.Remove(mensalidade);
        return Task.CompletedTask;
    }

    public async Task SalvarAsync(CancellationToken ct = default)
        => await context.SaveChangesAsync(ct);
}
