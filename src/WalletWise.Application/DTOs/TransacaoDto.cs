namespace WalletWise.Application.DTOs;

public record TransacaoDto(
    Guid Id,
    string Descricao,
    decimal Valor,
    string Moeda,
    decimal? ValorEmBrl,
    decimal? CotacaoUsada,
    string Tipo,
    DateTime DataTransacao,
    DateTime DataCriacao
);
