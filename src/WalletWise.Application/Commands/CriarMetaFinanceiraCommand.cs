using MediatR;
using WalletWise.Application.DTOs;

namespace WalletWise.Application.Commands;

public record CriarMetaFinanceiraCommand(
    string Nome,
    string Descricao,
    decimal ValorAlvo,
    DateTime DataAlvo,
    string Moeda = "BRL"
) : IRequest<MetaFinanceiraDto>;
