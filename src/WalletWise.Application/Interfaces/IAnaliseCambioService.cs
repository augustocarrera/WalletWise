using WalletWise.Application.DTOs;

namespace WalletWise.Application.Interfaces;

public interface IAnaliseCambioService
{
    Task<AnaliseCambioDto> AnalisarAsync(string moeda, CancellationToken cancellationToken = default);
}
