using MediatR;
using WalletWise.Application.DTOs;

namespace WalletWise.Application.Commands;

public record AdicionarAporteMetaCommand(Guid MetaId, decimal Valor) : IRequest<MetaFinanceiraDto>;
