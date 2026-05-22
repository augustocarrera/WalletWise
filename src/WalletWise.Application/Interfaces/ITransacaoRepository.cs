using WalletWise.Domain.Entities;

namespace WalletWise.Application.Interfaces;

public interface ITransacaoRepository
{
    Task<Guid> AddAsync(Transacao transacao, CancellationToken cancellationToken = default);
    Task<Transacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Transacao>> GetAllAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(Transacao transacao, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
