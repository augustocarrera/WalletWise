using System.Collections.Concurrent;
using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using WalletWise.Application.DTOs;
using WalletWise.Application.Interfaces;
using WalletWise.Infrastructure.ExternalServices.Models;

namespace WalletWise.Infrastructure.ExternalServices;

public class AnaliseCambioService(HttpClient httpClient) : IAnaliseCambioService
{
    private static readonly ConcurrentDictionary<string, (AnaliseCambioDto Resultado, DateTime Expiracao)> _cache = new();
    private static readonly ConcurrentDictionary<string, DateTime> _cooldown = new();
    private static readonly SemaphoreSlim _semaphore = new(1, 1);
    private static readonly TimeSpan _ttl      = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan _staleTtl = TimeSpan.FromHours(2);

    public async Task<AnaliseCambioDto> AnalisarAsync(string moeda, CancellationToken cancellationToken = default)
    {
        var chave = moeda.ToUpperInvariant();

        // cache válido → retorna imediatamente
        if (_cache.TryGetValue(chave, out var entry) && entry.Expiracao > DateTime.UtcNow)
            return entry.Resultado;

        // em cooldown por rate limit → retorna stale ou lança
        if (_cooldown.TryGetValue(chave, out var cooldownUntil) && cooldownUntil > DateTime.UtcNow)
        {
            if (_cache.TryGetValue(chave, out var stale))
                return stale.Resultado;
            throw new HttpRequestException("Limite de requisições atingido. Tente novamente em alguns minutos.", null, HttpStatusCode.TooManyRequests);
        }

        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGetValue(chave, out entry) && entry.Expiracao > DateTime.UtcNow)
                return entry.Resultado;

            if (_cooldown.TryGetValue(chave, out var innerCooldown) && innerCooldown > DateTime.UtcNow)
            {
                if (_cache.TryGetValue(chave, out var stale))
                    return stale.Resultado;
                throw new HttpRequestException("Limite de requisições atingido. Tente novamente em alguns minutos.", null, HttpStatusCode.TooManyRequests);
            }

            await Task.Delay(2000, cancellationToken);

            var response = await httpClient.GetAsync($"json/daily/{chave}-BRL/30", cancellationToken);

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                _cooldown[chave] = DateTime.UtcNow.AddMinutes(3);
                if (_cache.TryGetValue(chave, out var stale))
                    return stale.Resultado;
                throw new HttpRequestException("Limite de requisições atingido. Tente novamente em alguns minutos.", null, HttpStatusCode.TooManyRequests);
            }

            if (!response.IsSuccessStatusCode)
            {
                if (_cache.TryGetValue(chave, out var stale) && stale.Expiracao > DateTime.UtcNow - _staleTtl)
                    return stale.Resultado;
                response.EnsureSuccessStatusCode();
            }

            var historico = await response.Content.ReadFromJsonAsync<List<DailyItem>>(cancellationToken: cancellationToken)
                ?? throw new InvalidOperationException($"Resposta inválida da API para {chave}-BRL.");

            if (historico.Count == 0)
                throw new InvalidOperationException($"Nenhum dado histórico para {moeda}.");

            var bids = historico
                .Select(d => decimal.Parse(d.Bid, CultureInfo.InvariantCulture))
                .ToList();

            var cotacaoAtual = bids[0];
            var media        = bids.Average();
            var pct          = (cotacaoAtual - media) / media * 100;

            string recomendacao, motivo;
            if (cotacaoAtual < media * 0.97m)
            {
                recomendacao = "ComprarAgora";
                motivo = $"A moeda está {Math.Abs(pct):F1}% abaixo da média de 30 dias. Boa oportunidade para comprar!";
            }
            else if (cotacaoAtual > media * 1.03m)
            {
                recomendacao = "Aguardar";
                motivo = $"A moeda está {Math.Abs(pct):F1}% acima da média de 30 dias. Aguarde um momento mais barato.";
            }
            else
            {
                recomendacao = "Neutro";
                motivo = $"Câmbio estável, variação de {pct:+0.0;-0.0}% em relação à média de 30 dias.";
            }

            var resultado = new AnaliseCambioDto(chave, cotacaoAtual, media, bids.Min(), bids.Max(), recomendacao, motivo, bids.AsReadOnly());
            _cache[chave]    = (resultado, DateTime.UtcNow.Add(_ttl));
            _cooldown.TryRemove(chave, out _);
            return resultado;
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
