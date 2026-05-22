using System.Text.Json;
using WalletWise.Application.Interfaces;
using WalletWise.Infrastructure.ExternalServices.Models;

namespace WalletWise.Infrastructure.ExternalServices;

public class CotacaoService(HttpClient httpClient) : ICotacaoService
{
    public async Task<decimal> ObterCotacaoEmBrlAsync(string moeda, CancellationToken cancellationToken = default)
    {
        var par = $"{moeda.ToUpperInvariant()}-BRL";
        var response = await httpClient.GetAsync($"json/last/{par}", cancellationToken);

        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);

        using var doc = JsonDocument.Parse(json);
        var chave = $"{moeda.ToUpperInvariant()}BRL";

        if (!doc.RootElement.TryGetProperty(chave, out var elemento))
            throw new InvalidOperationException($"Cotação não encontrada para o par {par}.");

        var cotacaoInfo = elemento.Deserialize<CotacaoInfo>()
            ?? throw new InvalidOperationException("Resposta inválida da API de cotação.");

        return decimal.Parse(cotacaoInfo.Bid, System.Globalization.CultureInfo.InvariantCulture);
    }
}
