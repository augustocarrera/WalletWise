namespace WalletWise.Application.DTOs;

public record MensalidadeDto(
    Guid Id,
    string Nome,
    decimal Valor,
    string Moeda,
    int DiaVencimento,
    bool Ativa
);
