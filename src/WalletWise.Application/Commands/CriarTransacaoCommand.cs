using MediatR;
using WalletWise.Application.DTOs;
using WalletWise.Domain.Enums;

namespace WalletWise.Application.Commands;

public record CriarTransacaoCommand(
    string Descricao,
    decimal Valor,
    TipoTransacao Tipo,
    DateTime DataTransacao,
    string Moeda = "BRL"
) : IRequest<TransacaoDto>;
