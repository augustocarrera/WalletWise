using WalletWise.Application.DTOs;

namespace WalletWise.Application.Interfaces;

public interface IRelatorioRepository
{
    Task<ResumoMensalDto> ObterResumoMensalAsync(int ano, int mes, CancellationToken cancellationToken = default);
}
