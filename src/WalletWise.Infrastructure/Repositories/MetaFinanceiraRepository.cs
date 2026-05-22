using Microsoft.EntityFrameworkCore;
using WalletWise.Application.Interfaces;
using WalletWise.Domain.Entities;
using WalletWise.Infrastructure.Persistence;

namespace WalletWise.Infrastructure.Repositories;

public class MetaFinanceiraRepository(AppDbContext context) : IMetaFinanceiraRepository
{
    public async Task<Guid> AddAsync(MetaFinanceira meta, CancellationToken cancellationToken = default)
    {
        await context.MetasFinanceiras.AddAsync(meta, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return meta.Id;
    }

    public async Task<MetaFinanceira?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.MetasFinanceiras.FindAsync([id], cancellationToken);

    public async Task<List<MetaFinanceira>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.MetasFinanceiras
            .OrderBy(m => m.DataAlvo)
            .ToListAsync(cancellationToken);

    public async Task UpdateAsync(MetaFinanceira meta, CancellationToken cancellationToken = default)
    {
        context.MetasFinanceiras.Update(meta);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(MetaFinanceira meta, CancellationToken cancellationToken = default)
    {
        context.MetasFinanceiras.Remove(meta);
        await context.SaveChangesAsync(cancellationToken);
    }
}
