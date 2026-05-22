namespace WalletWise.Application.DTOs;

public record ResumoMensalDto(
    int Ano,
    int Mes,
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal Saldo,
    int TotalTransacoes
);
