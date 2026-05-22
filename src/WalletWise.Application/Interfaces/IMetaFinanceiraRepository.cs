using WalletWise.Domain.Entities;

namespace WalletWise.Application.Interfaces;

public interface IMetaFinanceiraRepository
{
    Task<Guid> AddAsync(MetaFinanceira meta, CancellationToken cancellationToken = default);
    Task<MetaFinanceira?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<MetaFinanceira>> GetAllAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(MetaFinanceira meta, CancellationToken cancellationToken = default);
    Task DeleteAsync(MetaFinanceira meta, CancellationToken cancellationToken = default);
}
