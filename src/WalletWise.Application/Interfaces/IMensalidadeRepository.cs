using WalletWise.Domain.Entities;

namespace WalletWise.Application.Interfaces;

public interface IMensalidadeRepository
{
    Task<IEnumerable<Mensalidade>> ListarAsync(CancellationToken ct = default);
    Task<Mensalidade?> ObterAsync(Guid id, CancellationToken ct = default);
    Task AdicionarAsync(Mensalidade mensalidade, CancellationToken ct = default);
    Task RemoverAsync(Mensalidade mensalidade, CancellationToken ct = default);
    Task SalvarAsync(CancellationToken ct = default);
}
