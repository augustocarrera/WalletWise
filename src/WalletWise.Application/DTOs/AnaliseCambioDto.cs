namespace WalletWise.Application.DTOs;

public record AnaliseCambioDto(
    string Moeda,
    decimal CotacaoAtual,
    decimal MediaUltimos30Dias,
    decimal MinUltimos30Dias,
    decimal MaxUltimos30Dias,
    string Recomendacao,
    string Motivo,
    IReadOnlyList<decimal> Historico
);
