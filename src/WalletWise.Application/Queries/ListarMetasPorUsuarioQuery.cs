using MediatR;
using WalletWise.Application.DTOs;

namespace WalletWise.Application.Queries;

public record ListarMetasQuery : IRequest<List<MetaFinanceiraDto>>;
