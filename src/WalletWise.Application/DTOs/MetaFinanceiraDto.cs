namespace WalletWise.Application.DTOs;

public record MetaFinanceiraDto(
    Guid Id,
    string Nome,
    string Descricao,
    decimal ValorAlvo,
    decimal ValorAcumulado,
    decimal PercentualConcluido,
    string Moeda,
    DateTime DataAlvo,
    int DiasRestantes,
    string Status
);
