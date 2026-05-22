namespace WalletWise.Application.Interfaces;

public interface ICotacaoService
{
    Task<decimal> ObterCotacaoEmBrlAsync(string moeda, CancellationToken cancellationToken = default);
}
